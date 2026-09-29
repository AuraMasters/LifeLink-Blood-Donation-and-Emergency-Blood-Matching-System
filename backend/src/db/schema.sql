CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'donor' CHECK (role IN ('donor', 'hospital', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS donors (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    phone VARCHAR(30) NOT NULL,
    address VARCHAR(255) NOT NULL DEFAULT '',
    latitude NUMERIC(10, 7) NOT NULL DEFAULT 0.0,
    longitude NUMERIC(10, 7) NOT NULL DEFAULT 0.0,
    availability BOOLEAN NOT NULL DEFAULT TRUE,
    last_donation_date DATE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_donors_blood_avail ON donors(blood_group, availability);
CREATE INDEX IF NOT EXISTS idx_donors_user_id ON donors(user_id);

CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    hospital_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL UNIQUE,
    emergency_contact VARCHAR(30) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL DEFAULT 0.0,
    longitude NUMERIC(10, 7) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hospitals_phone ON hospitals(phone);
CREATE INDEX IF NOT EXISTS idx_hospitals_user_id ON hospitals(user_id);

CREATE TABLE IF NOT EXISTS blood_inventory (
    id SERIAL PRIMARY KEY,
    hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units INT NOT NULL DEFAULT 0 CHECK (units >= 0),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_hospital_blood_group UNIQUE (hospital_id, blood_group)
);

CREATE INDEX IF NOT EXISTS idx_inventory_hosp_blood ON blood_inventory(hospital_id, blood_group);

CREATE TABLE IF NOT EXISTS blood_requests (
    id SERIAL PRIMARY KEY,
    hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units_required INT NOT NULL DEFAULT 1 CHECK (units_required >= 0),
    initial_units_required INT NOT NULL DEFAULT 1,
    urgency VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'emergency')),
    patient_name VARCHAR(150) DEFAULT NULL,
    required_by VARCHAR(100) DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'searching' CHECK (status IN ('searching', 'fulfilled', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requests_status_group ON blood_requests(status, blood_group);
CREATE INDEX IF NOT EXISTS idx_requests_hospital ON blood_requests(hospital_id);

CREATE TABLE IF NOT EXISTS donation_pledges (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
    hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    donor_id INT NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    donor_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    donor_name VARCHAR(100) NOT NULL,
    donor_phone VARCHAR(30) NOT NULL,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    status VARCHAR(20) NOT NULL DEFAULT 'pledged' CHECK (status IN ('pledged', 'acknowledged', 'completed', 'cancelled')),
    estimated_arrival VARCHAR(100) NOT NULL DEFAULT 'Within 1 hour',
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pledges_req_status ON donation_pledges(request_id, status);
CREATE INDEX IF NOT EXISTS idx_pledges_donor_status ON donation_pledges(donor_id, status);
CREATE INDEX IF NOT EXISTS idx_pledges_hospital ON donation_pledges(hospital_id);

CREATE TABLE IF NOT EXISTS donation_history (
    id SERIAL PRIMARY KEY,
    donor_id INT NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    blood_request_id INT DEFAULT NULL REFERENCES blood_requests(id) ON DELETE SET NULL,
    pledge_id INT DEFAULT NULL REFERENCES donation_pledges(id) ON DELETE SET NULL,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units INT NOT NULL DEFAULT 1 CHECK (units >= 1),
    donation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    donor_name VARCHAR(100) NOT NULL,
    hospital_name VARCHAR(150) NOT NULL,
    hospital_address VARCHAR(255) NOT NULL DEFAULT '',
    certificate_id VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'verified' CHECK (status IN ('verified', 'completed')),
    remarks TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_history_donor_date ON donation_history(donor_id, donation_date);
CREATE INDEX IF NOT EXISTS idx_history_hospital ON donation_history(hospital_id);
CREATE INDEX IF NOT EXISTS idx_history_cert ON donation_history(certificate_id);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_id VARCHAR(100) NOT NULL,
    recipient_role VARCHAR(20) NOT NULL DEFAULT 'all' CHECK (recipient_role IN ('donor', 'hospital', 'admin', 'all')),
    notification_type VARCHAR(50) NOT NULL DEFAULT 'emergency_alert',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    blood_group VARCHAR(10) DEFAULT NULL,
    request_id VARCHAR(100) DEFAULT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);

CREATE OR REPLACE FUNCTION fn_after_hospital_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO blood_inventory (hospital_id, blood_group, units)
    VALUES
        (NEW.id, 'A+', 0),
        (NEW.id, 'A-', 0),
        (NEW.id, 'B+', 0),
        (NEW.id, 'B-', 0),
        (NEW.id, 'AB+', 0),
        (NEW.id, 'AB-', 0),
        (NEW.id, 'O+', 0),
        (NEW.id, 'O-', 0)
    ON CONFLICT (hospital_id, blood_group) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_hospital_insert ON hospitals;
CREATE TRIGGER trg_after_hospital_insert
AFTER INSERT ON hospitals
FOR EACH ROW
EXECUTE FUNCTION fn_after_hospital_insert();

CREATE OR REPLACE FUNCTION fn_after_donation_history_insert()
RETURNS TRIGGER AS $$
BEGIN
    
    INSERT INTO blood_inventory (hospital_id, blood_group, units)
    VALUES (NEW.hospital_id, NEW.blood_group, NEW.units)
    ON CONFLICT (hospital_id, blood_group)
    DO UPDATE SET units = blood_inventory.units + EXCLUDED.units, updated_at = CURRENT_TIMESTAMP;

    
    UPDATE donors
    SET last_donation_date = CAST(NEW.donation_date AS DATE)
    WHERE id = NEW.donor_id;

    
    IF NEW.blood_request_id IS NOT NULL THEN
        UPDATE blood_requests
        SET units_required = GREATEST(0, units_required - NEW.units),
            status = CASE
                WHEN GREATEST(0, units_required - NEW.units) = 0 THEN 'fulfilled'
                ELSE status
            END
        WHERE id = NEW.blood_request_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_donation_history_insert ON donation_history;
CREATE TRIGGER trg_after_donation_history_insert
AFTER INSERT ON donation_history
FOR EACH ROW
EXECUTE FUNCTION fn_after_donation_history_insert();

CREATE OR REPLACE FUNCTION fn_before_blood_request_update()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IN ('fulfilled', 'completed') AND NEW.status = 'searching') THEN
        RAISE EXCEPTION 'Terminal State Lock: Fulfilled or completed blood requests cannot be reverted to searching.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_before_blood_request_update ON blood_requests;
CREATE TRIGGER trg_before_blood_request_update
BEFORE UPDATE ON blood_requests
FOR EACH ROW
EXECUTE FUNCTION fn_before_blood_request_update();
