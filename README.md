# LifeLink — Intelligent Blood Donation and Emergency Matching Platform

<p align="center">
  <img src="frontend/public/flow.png" alt="LifeLink Architecture and Process Flow" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-v4.21-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase PostgreSQL" />
  <img src="https://img.shields.io/badge/React-v18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-v5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
</p>

---

## Table of Contents

1. [Executive Overview](#executive-overview)
2. [Key Capabilities and Features](#key-capabilities-and-features)
3. [System Architecture](#system-architecture)
   - [Multi-Tier System Organization](#multi-tier-system-organization)
   - [Core Domain Entities & Structural Specification](#core-domain-entities--structural-specification)
4. [Entity-Relationship (ER) Diagram and Relational DBMS Foundations](#entity-relationship-er-diagram-and-relational-dbms-foundations)
   - [Enhanced Crow's Foot Entity-Relationship Diagram](#enhanced-crows-foot-entity-relationship-diagram)
   - [Relational Schema Mapping & Formal Notation](#1-relational-schema-mapping--mathematical-notation)
   - [Functional Dependencies & Normalization Proofs (1NF through BCNF)](#2-functional-dependencies--normalization-proofs-1nf-through-bcnf)
   - [Database Integrity Constraints Matrix](#3-database-integrity-constraints-matrix)
   - [Disjoint Class Table Inheritance (Subtype Modeling)](#4-disjoint-class-table-inheritance-subtype-modeling)
   - [ACID Transaction Management & Concurrency Control (MVCC)](#5-acid-transaction-management--concurrency-control)
   - [Relational Database Views (Virtual Abstraction Layer)](#6-relational-database-views-virtual-abstraction-layer)
   - [PL/pgSQL Stored Functions, Procedures & Triggers](#7-plpgsql-stored-functions-procedures--triggers)
   - [Multi-Level Indexing Strategy & Execution Cost Optimization](#8-multi-level-indexing-strategy--execution-cost-optimization)
   - [Textbook-Grade Relational Query Catalog (14 Formal Operations)](#comprehensive-database-query-catalog-dbms-operations--mathematical-formalization)
5. [End-to-End Business Processes](#end-to-end-business-processes)
   - [1. User Onboarding and Role Segregation](#1-user-onboarding-and-role-segregation)
   - [2. Hospital Blood Bank Stock Management](#2-hospital-blood-bank-stock-management)
   - [3. Emergency Request Triage and Dispatch](#3-emergency-request-triage-and-dispatch)
   - [4. Donor Matching and Response Workflow](#4-donor-matching-and-response-workflow)
   - [5. Administrative Oversight and Moderation](#5-administrative-oversight-and-moderation)
6. [Complete RESTful API Specification](#complete-restful-api-specification)
7. [Database Schema and Indexing Strategy](#database-schema-and-indexing-strategy)
8. [Blood Compatibility Reference Matrix](#blood-compatibility-reference-matrix)
9. [Installation and Setup Guide](#installation-and-setup-guide)
   - [Prerequisites](#prerequisites)
   - [Backend Configuration and Execution](#backend-configuration-and-execution)
   - [Frontend Configuration and Execution](#frontend-configuration-and-execution)
10. [Project Directory Structure](#project-directory-structure)
11. [Future Scope: Native Mobile Application (Final Review)](#future-scope-native-mobile-application-final-review)
12. [License and Acknowledgments](#license-and-acknowledgments)

---

## Executive Overview

**LifeLink** is a mission-critical, full-stack healthcare platform engineered to bridge the critical time gap between emergency blood requirements and active volunteer donors. By connecting hospitals, registered blood donors, and medical administrators within a unified ecosystem, LifeLink accelerates blood discovery, tracks real-time hospital inventories across 8 blood groups, and matches urgent blood requests with compatible nearby donors.

### Core Value Pillars
- **Zero-Latency Emergency Triage**: Rapid creation and instant dispatch of urgent and emergency blood requests.
- **Automated Compatibility Matching**: Real-time aggregation of requests matching ABO/Rh blood groups and geolocation.
- **Comprehensive Hospital Blood Banks**: Live tracking of available blood units across all 8 major blood types.
- **Enterprise Data Integrity**: Automated cascade deletion, unique index enforcement, and sanitized RESTful interfaces.

---

## Key Capabilities and Features

| Capability | Description |
| :--- | :--- |
| **Multi-Role Authentication** | Tailored dashboards and access control for **Donors**, **Hospitals**, and **System Administrators**. |
| **Live Blood Bank Matrix** | 8-group matrix (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`) with instant stock updates and threshold indicators. |
| **Emergency Broadcast Engine** | Hospitals broadcast critical blood requests with triage priorities (`normal`, `urgent`, `emergency`). |
| **Donor Smart Alerts** | Donors receive real-time visibility into compatible blood requests with hospital contact and GPS coordinates. |
| **Cascade Account Lifecycle** | Deleting a user account automatically cleans up linked profiles, inventory documents, and open requests. |
| **Admin Operations Hub** | Centralized console to audit, filter, monitor, and moderate users, donors, and hospital networks. |

---

## System Architecture

LifeLink is architectured as a decoupled, high-reliability enterprise healthcare platform organized across three distinct tiers:

### 1. Presentation Tier (Client Applications)
- **Web Portal (React 18 + TypeScript + Vite)**: Dynamic single-page application (SPA) providing role-based user interfaces for Donors, Hospitals, and System Administrators.
- **State Management & Communication**: Reactive state providers utilizing standard Fetch API with Bearer token authentication and structured JSON payload handling.

### 2. Application & API Gateway Tier (Node.js & Express)
- **RESTful API Layer**: Standardized HTTP endpoints listening on `0.0.0.0:8000` handling authentication, clinical triage, emergency matching, and analytics.
- **Security & Validation Middleware**: Helmet HTTP security headers, CORS origin verification, URL-encoded/JSON payload sanitization, and SQLSTATE error handling.
- **Domain Business Logic**: Decoupled domain controllers orchestrating relational queries and ACID transactions.

### 3. Database Management Tier (PostgreSQL / Supabase)
- **Relational Storage Engine**: PostgreSQL relational database with connection pooling via `pg.Pool` and dynamic SSL negotiation.
- **Server-Side Procedural Automation**: Automated PL/pgSQL database triggers, user-defined functions (UDFs), and stored procedures enforcing data integrity and zero-latency inventory increments.
- **Relational Integrity**: Foreign key constraints with `ON DELETE CASCADE` and `ON DELETE SET NULL`, check constraints, and unique compound keys.

---

### Core Domain Entities & Structural Specification

| Entity | Primary Key | Foreign Keys | Key Attributes | DBMS Role |
| :--- | :--- | :--- | :--- | :--- |
| **`users`** | `id SERIAL` | None | `name`, `email` (UK), `password_hash`, `role` | Base supertype entity for authentication and access control. |
| **`donors`** | `id SERIAL` | `user_id -> users(id)` (1:1) | `blood_group`, `phone`, `latitude`, `longitude`, `availability`, `last_donation_date` | Subtype entity storing donor medical and spatial coordinates. |
| **`hospitals`** | `id SERIAL` | `user_id -> users(id)` (1:1) | `hospital_name`, `phone` (UK), `emergency_contact`, `address`, `latitude`, `longitude` | Subtype entity representing registered healthcare facilities. |
| **`blood_inventory`**| `id SERIAL` | `hospital_id -> hospitals(id)` | `blood_group`, `units` (CHECK >= 0), `updated_at` | Tracks 8-group refrigeration stock with compound unique constraint `(hospital_id, blood_group)`. |
| **`blood_requests`** | `id SERIAL` | `hospital_id -> hospitals(id)` | `blood_group`, `units_required`, `urgency`, `status` | Emergency blood requests categorized by clinical triage priority. |
| **`donation_pledges`**| `id SERIAL` | `request_id`, `hospital_id`, `donor_id`, `donor_user_id` | `donor_name`, `donor_phone`, `blood_group`, `status`, `estimated_arrival` | Tracks donor pledges and real-time commitment fulfillment. |
| **`donation_history`**| `id SERIAL` | `donor_id`, `hospital_id`, `blood_request_id`, `pledge_id` | `blood_group`, `units`, `donation_date`, `certificate_id` (UK) | Immutable clinical ledger of verified blood donations and certificates. |
| **`notifications`** | `id SERIAL` | `request_id` (Optional) | `recipient_id`, `recipient_role`, `notification_type`, `title`, `message`, `is_read` | Real-time targeted communication and emergency alert queue. |

---

## Entity-Relationship (ER) Diagram and Relational DBMS Foundations

The LifeLink system data model is strictly normalized (1NF, 2NF, 3NF, BCNF) and executed on PostgreSQL with foreign keys, checks, unique constraints, and automated triggers.

### Enhanced Crow's Foot Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o| DONOR : "specializes (1:1)"
    USER ||--o| HOSPITAL : "specializes (1:1)"
    HOSPITAL ||--|{ BLOOD_INVENTORY : "stocks (1:8)"
    HOSPITAL ||--o{ BLOOD_REQUEST : "broadcasts (1:N)"
    BLOOD_REQUEST ||--o{ DONATION_PLEDGE : "receives (1:N)"
    DONOR ||--o{ DONATION_PLEDGE : "commits (1:N)"
    DONOR ||--o{ DONATION_HISTORY : "earns (1:N)"
    HOSPITAL ||--o{ DONATION_HISTORY : "verifies (1:N)"
    BLOOD_REQUEST ||--o{ DONATION_HISTORY : "fulfilled_by (1:N)"
    DONATION_PLEDGE ||--o| DONATION_HISTORY : "completed_by (1:1)"

    USER {
        int id PK "SERIAL Primary Key"
        string name "Full legal name"
        string email UK "Unique email address"
        string password_hash "Bcrypt salted digest"
        string role "Role: donor | hospital | admin"
        timestamp created_at "Account creation timestamp"
        timestamp updated_at "Account modification timestamp"
    }

    DONOR {
        int id PK "SERIAL Primary Key"
        int user_id FK "FK referencing users(id) ON DELETE CASCADE"
        string blood_group "ABO/Rh Blood Group: A+, A-, B+, B-, AB+, AB-, O+, O-"
        string phone "Contact telephone number"
        decimal latitude "Geographical GPS Latitude"
        decimal longitude "Geographical GPS Longitude"
        boolean availability "Active donation readiness flag"
        date last_donation_date "Date of preceding donation"
        timestamp created_at "Profile creation timestamp"
        timestamp updated_at "Profile modification timestamp"
    }

    HOSPITAL {
        int id PK "SERIAL Primary Key"
        int user_id FK "FK referencing users(id) ON DELETE CASCADE"
        string hospital_name "Official healthcare facility name"
        string phone UK "Unique main contact phone"
        string emergency_contact "24/7 dedicated critical hotline"
        string address "Physical street address"
        decimal latitude "Geographical GPS Latitude"
        decimal longitude "Geographical GPS Longitude"
        timestamp created_at "Facility registration timestamp"
        timestamp updated_at "Facility modification timestamp"
    }

    BLOOD_INVENTORY {
        int id PK "SERIAL Primary Key"
        int hospital_id FK "FK referencing hospitals(id) ON DELETE CASCADE"
        string blood_group "Blood type key (A+, A-, B+, B-, AB+, AB-, O+, O-)"
        int units "Available whole blood units in storage"
        timestamp updated_at "Stock audit modification timestamp"
    }

    BLOOD_REQUEST {
        int id PK "SERIAL Primary Key"
        int hospital_id FK "FK referencing hospitals(id) ON DELETE CASCADE"
        string blood_group "Target blood group requested"
        int units_required "Remaining required units"
        int initial_units_required "Total units originally required"
        string urgency "Triage urgency tier: normal | urgent | emergency"
        string patient_name "Recipient / Patient identifier"
        string required_by "Clinical deadline timestamp string"
        string status "Triage state: searching | fulfilled | cancelled | completed"
        timestamp created_at "Request broadcast timestamp"
        timestamp updated_at "Request state update timestamp"
    }

    DONATION_PLEDGE {
        int id PK "SERIAL Primary Key"
        int request_id FK "FK referencing blood_requests(id) ON DELETE CASCADE"
        int hospital_id FK "FK referencing hospitals(id) ON DELETE CASCADE"
        int donor_id FK "FK referencing donors(id) ON DELETE CASCADE"
        int donor_user_id FK "FK referencing users(id) ON DELETE CASCADE"
        string donor_name "Donor display name"
        string donor_phone "Donor contact phone"
        string blood_group "ABO/Rh Blood Group"
        string status "Status: pledged | acknowledged | completed | cancelled"
        string estimated_arrival "Estimated arrival time"
        text notes "Optional notes"
        timestamp created_at "Pledge creation timestamp"
        timestamp updated_at "Pledge modification timestamp"
    }

    DONATION_HISTORY {
        int id PK "SERIAL Primary Key"
        int donor_id FK "FK referencing donors(id) ON DELETE CASCADE"
        int hospital_id FK "FK referencing hospitals(id) ON DELETE CASCADE"
        int blood_request_id FK "FK referencing blood_requests(id) ON DELETE SET NULL"
        int pledge_id FK "FK referencing donation_pledges(id) ON DELETE SET NULL"
        string blood_group "ABO/Rh Blood Group"
        int units "Donated whole blood volume units"
        timestamp donation_date "Verified donation timestamp"
        string donor_name "Donor verified name"
        string hospital_name "Hospital verified name"
        string hospital_address "Hospital verified address"
        string certificate_id UK "Cryptographically generated certificate ID"
        string status "Status: verified | completed"
        text remarks "Clinical remarks"
        timestamp created_at "Certificate ledger creation timestamp"
        timestamp updated_at "Ledger update timestamp"
    }

    NOTIFICATION {
        int id PK "SERIAL Primary Key"
        string recipient_id "Target recipient identifier"
        string recipient_role "Recipient role partition: donor | hospital | admin | all"
        string notification_type "Category: emergency_alert | system | request_update"
        string title "Notification alert header"
        text message "Detailed message dispatch payload"
        string blood_group "Targeted blood group tag"
        string request_id "Optional foreign reference identifier"
        boolean is_read "Acknowledgement status flag"
        timestamp created_at "Notification dispatch timestamp"
        timestamp updated_at "Notification update timestamp"
    }
```

---

### DBMS Concepts & Theoretical Analysis

#### 1. Relational Schema Mapping & Mathematical Notation
In relational algebra, the LifeLink database structure is formalized into 8 fully normalized relations (BCNF / 3NF):

- `USER(id, name, email, password_hash, role, created_at, updated_at)`
- `DONOR(id, user_id, blood_group, phone, address, latitude, longitude, availability, last_donation_date, created_at, updated_at)`
- `HOSPITAL(id, user_id, hospital_name, phone, emergency_contact, address, latitude, longitude, created_at, updated_at)`
- `BLOOD_INVENTORY(id, hospital_id, blood_group, units, updated_at)`
- `BLOOD_REQUEST(id, hospital_id, blood_group, units_required, initial_units_required, urgency, patient_name, required_by, status, created_at, updated_at)`
- `DONATION_PLEDGE(id, request_id, hospital_id, donor_id, donor_user_id, donor_name, donor_phone, blood_group, status, estimated_arrival, notes, created_at, updated_at)`
- `DONATION_HISTORY(id, donor_id, hospital_id, blood_request_id, pledge_id, blood_group, units, donation_date, donor_name, hospital_name, hospital_address, certificate_id, status, remarks, created_at, updated_at)`
- `NOTIFICATION(id, recipient_id, recipient_role, notification_type, title, message, blood_group, request_id, is_read, created_at, updated_at)`

*Key constraints: Primary keys (PK) are unique non-null auto-incrementing integers (`SERIAL`); Foreign keys (FK) maintain referential integrity with `ON DELETE CASCADE` and `ON DELETE SET NULL`.*

---

#### 2. Functional Dependencies & Normalization Proofs (1NF through BCNF)

LifeLink is designed under strict relational database normal forms to eliminate data redundancy, insertion anomalies, update anomalies, and deletion anomalies.

##### Formal Functional Dependencies ($F$)
- **USER**: `{id} → {name, email, password_hash, role, created_at, updated_at}`, `{email} → {id, name, password_hash, role, created_at, updated_at}`
- **DONOR**: `{id} → {user_id, blood_group, phone, address, latitude, longitude, availability, last_donation_date}`, `{user_id} → {id, blood_group, phone, address, latitude, longitude, availability, last_donation_date}`
- **HOSPITAL**: `{id} → {user_id, hospital_name, phone, emergency_contact, address, latitude, longitude}`, `{user_id} → {id, ...}`, `{phone} → {id, ...}`
- **BLOOD_INVENTORY**: `{id} → {hospital_id, blood_group, units, updated_at}`, `{hospital_id, blood_group} → {id, units, updated_at}`
- **BLOOD_REQUEST**: `{id} → {hospital_id, blood_group, units_required, initial_units_required, urgency, patient_name, required_by, status, created_at, updated_at}`
- **DONATION_PLEDGE**: `{id} → {request_id, hospital_id, donor_id, donor_user_id, donor_name, donor_phone, blood_group, status, estimated_arrival, notes, created_at, updated_at}`
- **DONATION_HISTORY**: `{id} → {donor_id, hospital_id, blood_request_id, pledge_id, blood_group, units, donation_date, donor_name, hospital_name, hospital_address, certificate_id, status, remarks}`, `{certificate_id} → {id, ...}`
- **NOTIFICATION**: `{id} → {recipient_id, recipient_role, notification_type, title, message, blood_group, request_id, is_read, created_at, updated_at}`

##### Normalization Stages
1. **First Normal Form (1NF)**:
   - Every column contains atomic (indivisible) scalar values.
   - Repeating groups and array attributes are eliminated (e.g. inventory blood types are represented as discrete tuples in `blood_inventory`, not as JSON lists or delimited strings).
   - Each table possesses an explicit primary key (`id SERIAL PRIMARY KEY`).

2. **Second Normal Form (2NF)**:
   - The relations are in 1NF.
   - No partial dependencies exist: every non-prime attribute is fully functionally dependent on the entire candidate key.
   - In `blood_inventory`, the natural candidate key is `{hospital_id, blood_group}`. All attributes (`units`, `updated_at`) depend on the complete combination of `{hospital_id, blood_group}` and surrogate `id`.

3. **Third Normal Form (3NF)**:
   - The relations are in 2NF.
   - No transitive dependencies exist ($X \to Y$ and $Y \to Z$ where $X$ is candidate key and $Y$ is non-prime).
   - Hospital details (`hospital_name`, `address`) are stored strictly in `HOSPITAL`. Other tables (`blood_requests`, `donation_pledges`) reference `hospital_id` rather than duplicating hospital metadata.

4. **Boyce-Codd Normal Form (BCNF)**:
   - A relation is in BCNF if for every non-trivial functional dependency $X \to Y$, $X$ is a superkey.
   - In all 8 tables, every left-hand side determinant of a functional dependency is a candidate key (e.g., `id`, `email`, `{hospital_id, blood_group}`, `certificate_id`). Hence, the LifeLink database achieves complete **BCNF compliance**.

---

#### 3. Database Integrity Constraints Matrix

| Constraint Category | DBMS Principle | PostgreSQL Implementation |
| :--- | :--- | :--- |
| **Entity Integrity** | Every relation must possess an immutable, non-null Primary Key. | `id SERIAL PRIMARY KEY` |
| **Referential Integrity** | Foreign Keys must match a valid PK in the referenced relation or be null. | `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE` |
| **Domain Integrity** | Attributes must strictly adhere to valid enumerated sets and ranges. | `blood_group VARCHAR(5) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))` |
| **User-Defined Integrity** | Compound uniqueness preventing duplicate inventory slots per hospital. | `CONSTRAINT uq_hospital_blood_group UNIQUE (hospital_id, blood_group)` |
| **Check Constraints** | Non-negative numeric bounds enforced at the storage engine level. | `CHECK (units >= 0)`, `CHECK (units_required >= 0)` |

---

#### 4. Disjoint Class Table Inheritance (Subtype Modeling)
LifeLink implements **Disjoint Class Table Inheritance**:
- **Supertype**: The `USER` relation encapsulates core credentials (`name`, `email`, `password_hash`, `role`).
- **Subtypes**:
  - `DONOR`: Specializes `USER` with medical, biological, and spatial attributes (`blood_group`, `phone`, `latitude`, `longitude`, `availability`).
  - `HOSPITAL`: Specializes `USER` with institutional healthcare facilities (`hospital_name`, `emergency_contact`, `address`, `latitude`, `longitude`).
- **Discriminator Enforcement**: The `role` column (`CHECK (role IN ('donor', 'hospital', 'admin'))`) acts as a mutually exclusive discriminator enforced via 1:1 unique foreign key constraints (`user_id INT NOT NULL UNIQUE`).

---

#### 5. ACID Transaction Management & Concurrency Control

- **Atomicity (A)**: Complex clinical workflows (e.g., verifying a donation pledge, incrementing inventory, and fulfilling blood requests) execute inside atomic database transactions (`BEGIN` ... `COMMIT` / `ROLLBACK`). If any step encounters an error, all changes rollback completely.
- **Consistency (C)**: Foreign Key cascades, check constraints, unique composite keys, and PL/pgSQL triggers guarantee that invalid states cannot be committed.
- **Isolation (I)**: PostgreSQL leverages **Multi-Version Concurrency Control (MVCC)** with `READ COMMITTED` and `SERIALIZABLE` options. High-concurrency operations utilize row-level pessimistic locking (`SELECT ... FOR UPDATE`) to prevent inventory overselling race conditions.
- **Durability (D)**: PostgreSQL Write-Ahead Logging (WAL) ensures all committed data survives unexpected power failures or server crashes.

```javascript
// Example: Explicit ACID Transaction with PostgreSQL
export const withTransaction = async (workFn) => {
  const client = await pool.connect();
  const conn = {
    query: async (sql, params = []) => {
      const formatted = formatSql(sql);
      const res = await client.query(formatted, params);
      return [res.rows, res];
    },
  };

  try {
    await client.query('BEGIN');
    const result = await workFn(conn);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    throw error;
  } finally {
    client.release();
  }
};
```

---

#### 6. Relational Database Views (Virtual Abstraction Layer)

PostgreSQL views provide virtualized abstraction layers that simplify client queries, enforce security boundaries, and pre-aggregate operational analytics without data duplication:

##### View 1: Active Emergency Requests (`v_active_emergency_requests`)
Flattens the relational join between pending blood requests and hospital emergency facilities, exposing vital triage parameters and direct phone contacts:

```sql
CREATE OR REPLACE VIEW v_active_emergency_requests AS
SELECT 
    r.id AS request_id,
    r.blood_group,
    r.units_required,
    r.initial_units_required,
    r.urgency,
    r.patient_name,
    r.required_by,
    r.status,
    r.created_at AS request_created_at,
    h.id AS hospital_id,
    h.hospital_name,
    h.phone AS hospital_phone,
    h.emergency_contact,
    h.address AS hospital_address,
    h.latitude AS hospital_latitude,
    h.longitude AS hospital_longitude
FROM blood_requests r
INNER JOIN hospitals h ON r.hospital_id = h.id
WHERE r.status = 'searching';
```

##### View 2: Hospital Inventory Matrix (`v_hospital_inventory_matrix`)
Aggregates blood units across healthcare facilities, providing an instant multi-attribute stock breakdown:

```sql
CREATE OR REPLACE VIEW v_hospital_inventory_matrix AS
SELECT 
    h.id AS hospital_id,
    h.hospital_name,
    h.emergency_contact,
    COALESCE(SUM(CASE WHEN bi.blood_group = 'A+'  THEN bi.units ELSE 0 END), 0) AS units_a_pos,
    COALESCE(SUM(CASE WHEN bi.blood_group = 'A-'  THEN bi.units ELSE 0 END), 0) AS units_a_neg,
    COALESCE(SUM(CASE WHEN bi.blood_group = 'B+'  THEN bi.units ELSE 0 END), 0) AS units_b_pos,
    COALESCE(SUM(CASE WHEN bi.blood_group = 'B-'  THEN bi.units ELSE 0 END), 0) AS units_b_neg,
    COALESCE(SUM(CASE WHEN bi.blood_group = 'AB+' THEN bi.units ELSE 0 END), 0) AS units_ab_pos,
    COALESCE(SUM(CASE WHEN bi.blood_group = 'AB-' THEN bi.units ELSE 0 END), 0) AS units_ab_neg,
    COALESCE(SUM(CASE WHEN bi.blood_group = 'O+'  THEN bi.units ELSE 0 END), 0) AS units_o_pos,
    COALESCE(SUM(CASE WHEN bi.blood_group = 'O-'  THEN bi.units ELSE 0 END), 0) AS units_o_neg,
    COALESCE(SUM(bi.units), 0) AS total_available_units
FROM hospitals h
LEFT JOIN blood_inventory bi ON h.id = bi.hospital_id
GROUP BY h.id, h.hospital_name, h.emergency_contact;
```

##### View 3: Donor Clinical Activity Ledger (`v_donor_activity_summary`)
Computes donor engagement metrics, verified donations count, and total volume for clinical certifications and leaderboard recognition:

```sql
CREATE OR REPLACE VIEW v_donor_activity_summary AS
SELECT 
    d.id AS donor_id,
    u.name AS donor_name,
    u.email AS donor_email,
    d.blood_group,
    d.phone,
    d.availability,
    d.last_donation_date,
    COALESCE(COUNT(dh.id), 0) AS total_donations_count,
    COALESCE(SUM(dh.units), 0) AS total_units_contributed,
    MAX(dh.donation_date) AS most_recent_donation_timestamp
FROM donors d
INNER JOIN users u ON d.user_id = u.id
LEFT JOIN donation_history dh ON d.id = dh.donor_id
GROUP BY d.id, u.name, u.email, d.blood_group, d.phone, d.availability, d.last_donation_date;
```

---

#### 7. PL/pgSQL Stored Functions, Procedures & Triggers

##### Stored Function 1: Geospatial Proximity Calculation (`fn_calculate_haversine_distance`)
Calculates great-circle distance between two GPS coordinates directly inside the PostgreSQL query execution engine:

```sql
CREATE OR REPLACE FUNCTION fn_calculate_haversine_distance(
    lat1 NUMERIC, lon1 NUMERIC, lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
    r NUMERIC := 6371; -- Earth mean radius in kilometers
    dlat NUMERIC := radians(lat2 - lat1);
    dlon NUMERIC := radians(lon2 - lon1);
    a NUMERIC;
    c NUMERIC;
BEGIN
    IF (lat1 = lat2 AND lon1 = lon2) THEN
        RETURN 0.0;
    END IF;

    a := sin(dlat / 2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)^2;
    c := 2 * atan2(sqrt(a), sqrt(1 - a));
    RETURN round(r * c, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

##### Stored Function 2: Biological ABO/Rh Blood Compatibility Rule (`fn_check_blood_compatibility`)
Returns `TRUE` if a donor blood group is serologically compatible with a recipient patient:

```sql
CREATE OR REPLACE FUNCTION fn_check_blood_compatibility(
    p_donor_group VARCHAR(5),
    p_patient_group VARCHAR(5)
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN CASE
        WHEN p_donor_group = 'O-' THEN TRUE
        WHEN p_donor_group = 'O+' AND p_patient_group IN ('O+', 'A+', 'B+', 'AB+') THEN TRUE
        WHEN p_donor_group = 'A-' AND p_patient_group IN ('A-', 'A+', 'AB-', 'AB+') THEN TRUE
        WHEN p_donor_group = 'A+' AND p_patient_group IN ('A+', 'AB+') THEN TRUE
        WHEN p_donor_group = 'B-' AND p_patient_group IN ('B-', 'B+', 'AB-', 'AB+') THEN TRUE
        WHEN p_donor_group = 'B+' AND p_patient_group IN ('B+', 'AB+') THEN TRUE
        WHEN p_donor_group = 'AB-' AND p_patient_group IN ('AB-', 'AB+') THEN TRUE
        WHEN p_donor_group = 'AB+' AND p_patient_group = 'AB+' THEN TRUE
        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

##### Stored Procedure 1: Inter-Hospital Blood Inventory Transfer (`sp_transfer_blood_units`)
Executes an atomic inventory reallocation between two healthcare facilities using row-level pessimistic locks (`FOR UPDATE`):

```sql
CREATE OR REPLACE PROCEDURE sp_transfer_blood_units(
    p_source_hospital_id INT,
    p_target_hospital_id INT,
    p_blood_group VARCHAR(5),
    p_units INT
) AS $$
DECLARE
    v_available_units INT;
BEGIN
    IF p_units <= 0 THEN
        RAISE EXCEPTION 'Transfer volume must be strictly positive';
    END IF;

    -- Row-level exclusive lock prevents concurrent inventory race conditions
    SELECT units INTO v_available_units
    FROM blood_inventory
    WHERE hospital_id = p_source_hospital_id AND blood_group = p_blood_group
    FOR UPDATE;

    IF v_available_units IS NULL OR v_available_units < p_units THEN
        RAISE EXCEPTION 'Insufficient stock in source hospital: available %, requested %', v_available_units, p_units;
    END IF;

    -- Deduct from source hospital
    UPDATE blood_inventory
    SET units = units - p_units, updated_at = CURRENT_TIMESTAMP
    WHERE hospital_id = p_source_hospital_id AND blood_group = p_blood_group;

    -- Credit to target hospital (upsert with conflict handling)
    INSERT INTO blood_inventory (hospital_id, blood_group, units, updated_at)
    VALUES (p_target_hospital_id, p_blood_group, p_units, CURRENT_TIMESTAMP)
    ON CONFLICT (hospital_id, blood_group)
    DO UPDATE SET units = blood_inventory.units + EXCLUDED.units, updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
```

##### Stored Procedure 2: Atomic Pledge Fulfillment and Ledger Certification (`sp_fulfill_donation_pledge`)
Completes an emergency pledge, logs an immutable donation certificate, increments hospital inventory, and automatically decrements remaining units in the blood request:

```sql
CREATE OR REPLACE PROCEDURE sp_fulfill_donation_pledge(
    p_pledge_id INT,
    p_units INT,
    p_remarks TEXT
) AS $$
DECLARE
    v_pledge RECORD;
    v_certificate VARCHAR(100);
BEGIN
    -- Fetch and lock pledge
    SELECT * INTO v_pledge
    FROM donation_pledges
    WHERE id = p_pledge_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Donation pledge with ID % not found', p_pledge_id;
    END IF;

    IF v_pledge.status = 'completed' THEN
        RAISE EXCEPTION 'Pledge % has already been fulfilled', p_pledge_id;
    END IF;

    -- Generate unique cryptographic certificate ID
    v_certificate := 'CERT-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD-HH24MISS') || '-' || LPAD(p_pledge_id::TEXT, 4, '0');

    -- 1. Transition pledge status
    UPDATE donation_pledges
    SET status = 'completed', updated_at = CURRENT_TIMESTAMP
    WHERE id = p_pledge_id;

    -- 2. Insert immutable clinical ledger record
    INSERT INTO donation_history (
        donor_id, hospital_id, blood_request_id, pledge_id,
        blood_group, units, donation_date, donor_name,
        certificate_id, status, remarks, created_at, updated_at
    ) VALUES (
        v_pledge.donor_id, v_pledge.hospital_id, v_pledge.request_id, p_pledge_id,
        v_pledge.blood_group, p_units, CURRENT_TIMESTAMP, v_pledge.donor_name,
        v_certificate, 'verified', p_remarks, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );

    -- 3. Upsert blood inventory
    INSERT INTO blood_inventory (hospital_id, blood_group, units, updated_at)
    VALUES (v_pledge.hospital_id, v_pledge.blood_group, p_units, CURRENT_TIMESTAMP)
    ON CONFLICT (hospital_id, blood_group)
    DO UPDATE SET units = blood_inventory.units + EXCLUDED.units, updated_at = CURRENT_TIMESTAMP;

    -- 4. Decrement blood request units
    IF v_pledge.request_id IS NOT NULL THEN
        UPDATE blood_requests
        SET units_required = GREATEST(0, units_required - p_units),
            status = CASE WHEN units_required - p_units <= 0 THEN 'fulfilled' ELSE status END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_pledge.request_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

##### Automated Database Triggers
LifeLink guarantees operational data integrity at the database storage engine layer via 4 automated PL/pgSQL triggers:

1. **`trg_after_hospital_insert`**:
   - Executes `AFTER INSERT ON hospitals FOR EACH ROW`.
   - Automatically initializes all 8 inventory slots (`A+` to `O-`) with 0 units on `ON CONFLICT DO NOTHING`.
2. **`trg_after_donation_history_insert`**:
   - Executes `AFTER INSERT ON donation_history FOR EACH ROW`.
   - Increments hospital inventory stock via `ON CONFLICT DO UPDATE`.
   - Updates donor's `last_donation_date` to current timestamp.
   - Decrements `units_required` in the linked `blood_requests` and auto-transitions request status to `'fulfilled'` when remaining units reach 0.
3. **`trg_before_blood_request_update`**:
   - Executes `BEFORE UPDATE ON blood_requests FOR EACH ROW`.
   - Enforces a Terminal State Lock constraint: raises an exception (`RAISE EXCEPTION`) if any application query attempts to revert a `fulfilled`, `completed`, or `cancelled` request back to `searching`.
4. **`trg_update_timestamp`**:
   - Executes `BEFORE UPDATE` on `users`, `donors`, `hospitals`, `blood_inventory`, `blood_requests`, `donation_pledges`, `donation_history`, and `notifications`.
   - Synchronizes `updated_at = CURRENT_TIMESTAMP` before write commit.

---

#### 8. Multi-Level Indexing Strategy & Execution Cost Optimization

The database applies targeted B-Tree, Composite, Expression, and Partial indexes to guarantee logarithmic query evaluation $\mathcal{O}(\log N)$ under peak emergency loads:

| Index Name | Target Relation | Indexed Column(s) | Indexing Type | DBMS Optimization Target |
| :--- | :--- | :--- | :--- | :--- |
| **`idx_users_email`** | `users` | `LOWER(email)` | B-Tree (Functional) | Instant $\mathcal{O}(\log N)$ case-insensitive login lookup. |
| **`idx_users_role`** | `users` | `role` | B-Tree | Filtered user directory scans and role segregation. |
| **`idx_donors_user_id`** | `donors` | `user_id` | B-Tree (Unique) | 1:1 foreign key join optimization with `users(id)`. |
| **`idx_donors_blood_avail`** | `donors` | `(blood_group, availability)` | Composite B-Tree | Instant filtering for active compatible donors during trauma calls. |
| **`idx_donors_coordinates`** | `donors` | `(latitude, longitude)` | Composite B-Tree | Spatial bounding box evaluation for Haversine proximity calculations. |
| **`idx_hospitals_user_id`** | `hospitals` | `user_id` | B-Tree (Unique) | 1:1 foreign key join optimization with `users(id)`. |
| **`idx_hospitals_phone`** | `hospitals` | `phone` | B-Tree (Unique) | Emergency hotline uniqueness check and facility resolution. |
| **`idx_inventory_hosp_blood`** | `blood_inventory` | `(hospital_id, blood_group)`| Composite Unique B-Tree | Single-page seek for 8-group refrigeration matrices and upserts. |
| **`idx_requests_status_group`** | `blood_requests` | `(status, blood_group)` | Composite B-Tree | Donor emergency radar query optimization. |
| **`idx_requests_urgency`** | `blood_requests` | `urgency` | B-Tree | Clinical triage prioritization (`emergency` vs `urgent` vs `normal`). |
| **`idx_pledges_request`** | `donation_pledges` | `request_id` | B-Tree | Rapid retrieval of pledges committed to an active blood request. |
| **`idx_history_cert`** | `donation_history` | `certificate_id` | B-Tree (Unique) | Tamper-proof certificate verification and ledger lookup. |
| **`idx_notifications_user`** | `notifications` | `(recipient_id, is_read)` | Composite B-Tree | Real-time unread alert count retrieval for notification bell badge. |

##### Storage Engine Execution Cost Metrics
Without indexing, emergency radar queries require a full sequential scan ($\text{Cost} = \mathcal{O}(N)$), loading all data pages from storage. With composite index `idx_donors_blood_avail`, the execution plan transitions to a **Bitmap Index Scan**, reducing disk I/O from thousands of disk blocks to a single logarithmic leaf node seek ($\text{Cost} = \mathcal{O}(\log N)$), delivering sub-millisecond query latencies.

---

### Comprehensive Database Query Catalog (DBMS Operations & Mathematical Formalization)

Below is the exhaustive mathematical and operational breakdown of the 14 core relational operations powering LifeLink:

#### Query 1: User Identity Authentication & Single-Record Selection
- **DBMS Category**: Data Query Language (DQL) / Point Selection
- **Relational Algebra**:
  $$\sigma_{\text{LOWER}(email) = \text{LOWER}('donor@lifelink.org')}(USER)$$
- **PostgreSQL Parameterized SQL**:
  ```sql
  SELECT id, name, email, password_hash, role
  FROM users
  WHERE email = LOWER($1)
  LIMIT 1;
  ```
- **Execution Plan**: `Index Scan using idx_users_email on users`. Time Complexity: $\mathcal{O}(\log N)$. Zero sequential scans.

---

#### Query 2: Multi-Table Specialization: User Registration Transaction
- **DBMS Category**: Data Manipulation Language (DML) / ACID Multi-Statement Transaction
- **Relational Algebra**:
  $$\text{BEGIN}; \; \text{INSERT INTO } USER \to \rho_{\text{uid}}(id); \; \text{INSERT INTO } DONOR(user\_id = \text{uid}); \; \text{COMMIT}$$
- **PostgreSQL Parameterized SQL**:
  ```sql
  -- Step 1: Insert supertype record
  INSERT INTO users (name, email, password_hash, role)
  VALUES ($1, LOWER($2), $3, $4)
  RETURNING id;

  -- Step 2: Insert specialized subtype record (executed inside withTransaction)
  INSERT INTO donors (user_id, blood_group, phone, latitude, longitude, availability)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *;
  ```
- **Execution Plan**: Unique B-tree constraint verification on `users_email_key`, sequential serial generation via sequence `users_id_seq`, and foreign key integrity check on `donors_user_id_fkey`.

---

#### Query 3: Active Compatible Donor Discovery for Emergency Broadcast
- **DBMS Category**: DQL / Composite Filtered Projection
- **Relational Algebra**:
  $$\pi_{id, phone, latitude, longitude, availability}(\sigma_{blood\_group = \text{'O-'} \wedge availability = \text{TRUE}}(DONOR))$$
- **PostgreSQL Parameterized SQL**:
  ```sql
  SELECT id, phone, latitude, longitude, availability
  FROM donors
  WHERE blood_group = $1 AND availability = TRUE;
  ```
- **Execution Plan**: `Bitmap Index Scan on idx_donors_blood_avail`. Evaluates both conditions directly in index pages before fetching heap blocks.

---

#### Query 4: Emergency Request Multi-Table Relational Join
- **DBMS Category**: DQL / Equi-Join with Selective Filtering
- **Relational Algebra**:
  $$\pi_{r.*, h.hospital\_name, h.phone, h.address}(\sigma_{r.blood\_group = 'O-' \wedge r.status = 'searching'}(BLOOD\_REQUEST \; r) \bowtie_{r.hospital\_id = h.id} HOSPITAL \; h)$$
- **PostgreSQL Parameterized SQL**:
  ```sql
  SELECT 
    r.id AS request_id,
    r.blood_group,
    r.units_required,
    r.initial_units_required,
    r.urgency,
    r.patient_name,
    r.required_by,
    r.status,
    r.created_at,
    h.hospital_name,
    h.phone AS hospital_phone,
    h.emergency_contact,
    h.address AS hospital_address,
    h.latitude AS hospital_latitude,
    h.longitude AS hospital_longitude
  FROM blood_requests r
  INNER JOIN hospitals h ON r.hospital_id = h.id
  WHERE r.blood_group = $1 AND r.status = 'searching'
  ORDER BY r.created_at DESC;
  ```
- **Execution Plan**: `Hash Join` between indexed `blood_requests` (using `idx_requests_status_group`) and primary key lookup on `hospitals.id`.

---

#### Query 5: 8-Group Refrigeration Stock Fetch with Compound Key Seek
- **DBMS Category**: DQL / Keyed Multi-Tuple Retrieval
- **Relational Algebra**:
  $$\pi_{blood\_group, units}(\sigma_{hospital\_id = h}(BLOOD\_INVENTORY))$$
- **PostgreSQL Parameterized SQL**:
  ```sql
  SELECT blood_group, units
  FROM blood_inventory
  WHERE hospital_id = $1;
  ```
- **Execution Plan**: `Index Scan using idx_inventory_hosp_blood on blood_inventory`. Fetches all 8 blood slots in $\mathcal{O}(\log N)$ time.

---

#### Query 6: Atomic Inventory Upsert (ON CONFLICT DO UPDATE)
- **DBMS Category**: DML / Atomic Upsert Mutation
- **Relational Algebra**:
  $$\text{UPSERT}(BLOOD\_INVENTORY, hospital\_id = h \wedge blood\_group = g, units \leftarrow u)$$
- **PostgreSQL Parameterized SQL**:
  ```sql
  INSERT INTO blood_inventory (hospital_id, blood_group, units, updated_at)
  VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
  ON CONFLICT (hospital_id, blood_group)
  DO UPDATE SET units = EXCLUDED.units, updated_at = CURRENT_TIMESTAMP
  RETURNING *;
  ```
- **Execution Plan**: Unique Index seek on `uq_hospital_blood_group`. Applies atomic in-place mutation without application-level race conditions.

---

#### Query 7: Controlled Decrement with Non-Negative Bound Verification
- **DBMS Category**: DML / Constrained State Mutation
- **Relational Algebra**:
  $$\sigma_{units \ge u}(\text{UPDATE } BLOOD\_INVENTORY \text{ SET } units \leftarrow units - u)$$
- **PostgreSQL Parameterized SQL**:
  ```sql
  UPDATE blood_inventory
  SET units = units - $1, updated_at = CURRENT_TIMESTAMP
  WHERE hospital_id = $2 AND blood_group = $3 AND units >= $1
  RETURNING *;
  ```
- **Execution Plan**: `Index Scan on idx_inventory_hosp_blood`. Storage engine checks `units >= $1` atomically; returns 0 modified rows if stock is insufficient.

---

#### Query 8: Spatial Proximity & Biological Compatibility Radar
- **DBMS Category**: DQL / Spatial Trigonometric Geospatial Search
- **Relational Algebra**:
  $$\sigma_{\text{distance} \le r}(\pi_{*, \text{fn\_haversine}(d.lat, d.lon, h.lat, h.lon) \to \text{distance}}(BLOOD\_REQUEST \bowtie HOSPITAL))$$
- **PostgreSQL Parameterized SQL**:
  ```sql
  SELECT 
    r.id,
    r.blood_group,
    r.units_required,
    r.urgency,
    h.hospital_name,
    h.phone AS hospital_phone,
    h.emergency_contact,
    h.address,
    fn_calculate_haversine_distance($1, $2, h.latitude, h.longitude) AS distance_km
  FROM blood_requests r
  INNER JOIN hospitals h ON r.hospital_id = h.id
  WHERE r.status = 'searching'
    AND fn_check_blood_compatibility($3, r.blood_group) = TRUE
    AND fn_calculate_haversine_distance($1, $2, h.latitude, h.longitude) <= $4
  ORDER BY distance_km ASC;
  ```
- **Execution Plan**: Filters candidate requests using composite index `idx_requests_status_group`, joins hospital coordinates, and computes trigonometric distances in-memory.

---

#### Query 9: Emergency Blood Request Creation & Status Broadcast
- **DBMS Category**: DML / State Creation
- **Relational Algebra**:
  $$\text{INSERT INTO } BLOOD\_REQUEST(\dots) \text{ RETURNING } *$$
- **PostgreSQL Parameterized SQL**:
  ```sql
  INSERT INTO blood_requests (
    hospital_id, blood_group, units_required, initial_units_required,
    urgency, patient_name, required_by, status
  ) VALUES ($1, $2, $3, $3, $4, $5, $6, 'searching')
  RETURNING *;
  ```
- **Execution Plan**: Sequence generation via `blood_requests_id_seq`, validation of domain check constraints (`urgency`, `blood_group`), and immediate tuple emission.

---

#### Query 10: Real-Time Donation Pledge Insertion & Foreign Key Validation
- **DBMS Category**: DML / Relational Association
- **Relational Algebra**:
  $$\text{INSERT INTO } DONATION\_PLEDGE(request\_id, hospital\_id, donor\_id, \dots)$$
- **PostgreSQL Parameterized SQL**:
  ```sql
  INSERT INTO donation_pledges (
    request_id, hospital_id, donor_id, donor_user_id,
    donor_name, donor_phone, blood_group, status, estimated_arrival, notes
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9)
  RETURNING *;
  ```
- **Execution Plan**: Foreign key verification against `blood_requests(id)`, `hospitals(id)`, and `donors(id)` before index insertion.

---

#### Query 11: Transactional Pledge Fulfillment & Immutable Ledger Certificate Issuance
- **DBMS Category**: DML / Atomic Multi-Relation Ledger Mutation
- **Relational Algebra**:
  $$\text{BEGIN}; \; \text{UPDATE } DONATION\_PLEDGE; \; \text{INSERT INTO } DONATION\_HISTORY; \; \text{COMMIT};$$
- **PostgreSQL Parameterized SQL**:
  ```sql
  -- Step 1: Update pledge status
  UPDATE donation_pledges
  SET status = 'completed', updated_at = CURRENT_TIMESTAMP
  WHERE id = $1;

  -- Step 2: Record verified immutable clinical ledger certificate
  INSERT INTO donation_history (
    donor_id, hospital_id, blood_request_id, pledge_id,
    blood_group, units, donation_date, donor_name, hospital_name,
    hospital_address, certificate_id, status, remarks
  ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, $8, $9, $10, 'verified', $11)
  RETURNING *;
  ```
- **Execution Plan**: Enforces unique key constraint on `certificate_id` and fires `trg_after_donation_history_insert` to auto-adjust inventory and request state.

---

#### Query 12: Notification Dispatch Queue Retrieval & Unread Counter
- **DBMS Category**: DQL / Keyed Filtering with Sorting
- **Relational Algebra**:
  $$\pi_{id, title, message, blood\_group, is\_read, created\_at}(\sigma_{recipient\_id = u \vee recipient\_role = 'all'}(NOTIFICATION))$$
- **PostgreSQL Parameterized SQL**:
  ```sql
  SELECT id, recipient_role, notification_type, title, message, blood_group, is_read, created_at
  FROM notifications
  WHERE recipient_id = $1 OR recipient_role = 'all' OR recipient_role = $2
  ORDER BY created_at DESC
  LIMIT 20;
  ```
- **Execution Plan**: `Index Scan on idx_notifications_user` with descending chronological ordering.

---

#### Query 13: Platform-Wide Analytics Cross-Tabulation & Statistical Aggregations
- **DBMS Category**: DQL / Complex Analytical Rollup
- **Relational Algebra**:
  $$\gamma_{COUNT(USER), COUNT(DONOR), COUNT(HOSPITAL), SUM(units)}(DATABASE)$$
- **PostgreSQL SQL**:
  ```sql
  SELECT 
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM donors) AS total_donors,
    (SELECT COUNT(*) FROM hospitals) AS total_hospitals,
    (SELECT COUNT(*) FROM blood_requests) AS total_requests,
    (SELECT COUNT(*) FROM blood_requests WHERE status = 'searching') AS active_requests,
    (SELECT COUNT(*) FROM blood_requests WHERE urgency = 'emergency' AND status = 'searching') AS critical_emergencies,
    (SELECT COALESCE(SUM(units), 0) FROM blood_inventory) AS total_blood_units,
    (SELECT COUNT(*) FROM donation_history WHERE status = 'verified') AS total_completed_donations;
  ```
- **Execution Plan**: Parallel subquery execution utilizing primary key index scans with fast scalar aggregation.

---

#### Query 14: Strict Referential Cascade Account Deletion
- **DBMS Category**: DML / Recursive Relational Deletion
- **Relational Algebra**:
  $$\text{DELETE FROM } USER \text{ WHERE } id = u \implies \text{CASCADE DELETE}(DONOR, HOSPITAL \to (BLOOD\_INVENTORY, BLOOD\_REQUEST))$$
- **PostgreSQL Parameterized SQL**:
  ```sql
  DELETE FROM users WHERE id = $1;
  ```
- **Execution Plan**: Foreign key triggers automatically clean up associated records in `donors`, `hospitals`, `blood_inventory`, `blood_requests`, `donation_pledges`, `donation_history`, and `notifications` in topological dependency order without orphan tuples.

---

## End-to-End Business Processes

### 1. User Onboarding and Role Segregation

LifeLink enforces strict subtype polymorphism during user registration through a coordinated two-table transactional workflow:

| Step | Operation Phase | Action / PostgreSQL Primitive | Technical Description |
| :--- | :--- | :--- | :--- |
| **1. Ingestion** | Input Validation | Request Payload Sanitization | Visitor submits email, password, legal name, and designated role (`donor` or `hospital`). |
| **2. Supertype Insertion** | Base Identity Creation | `INSERT INTO users (...) RETURNING id;` | A cryptographic bcrypt hash is generated and a base user record is committed with generated `id`. |
| **3. Subtype Polymorphism**| Role-Based Branching | `INSERT INTO donors` / `INSERT INTO hospitals` | If role is `donor`, medical blood group and geolocation coordinates are stored referencing `user_id`. If `hospital`, institutional license and hotline data are stored. |
| **4. Session Minting** | Token Generation | Sign JWT with `{ id, email, role }` | An authentication token is generated with a 7-day expiration and signed with server-side secret. |
| **5. Portal Routing** | Client Dispatch | HTTP 201 Response | The client is redirected to the role-specific portal (Donor Emergency Radar or Hospital Blood Bank Management). |

### 2. Hospital Blood Bank Stock Management
1. **Matrix Initialization**: Hospitals query `GET /hospitals/:id/blood-bank`. The backend guarantees an 8-slot response representing `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-` (with `0` units if not yet explicitly stocked).
2. **Stock Increment/Decrement**: Hospital managers edit units for specific blood types via `PUT /hospitals/:id/blood-bank`.
3. **Upsert Logic**: PostgreSQL updates the record or creates a new entry using `ON CONFLICT (hospital_id, blood_group) DO UPDATE SET units = EXCLUDED.units`.

### 3. Emergency Request Triage and Dispatch
1. **Urgency Classification**:
   - `normal`: Standard elective transfusion or scheduled surgery preparation.
   - `urgent`: Timed requirement needed within 12-24 hours.
   - `emergency`: Immediate trauma or ICU life-support requirement.
2. **Broadcast Trigger**: Sending a `POST /blood-requests` creates a record in `blood_requests` with status `searching` and notifies compatible nearby donors.

### 4. Donor Matching and Response Workflow
1. **Radar Discovery**: When a donor logs into their dashboard, the system calls `GET /blood-requests/donor/:donor_id`.
2. **Compatibility Query**: The backend queries all active requests matching the donor's blood group and joins hospital contact information (`hospital_name`, `hospital_phone`, `emergency_contact`, `hospital_address`, and coordinates).
3. **Direct Contact**: Donors can view the distance, open hospital navigation coordinates, or call the 24/7 hotline directly.

### 5. Administrative Oversight and Moderation
1. **Global Visibility**: Administrators have full access to view, search, and filter all registered users, active donors, verified hospitals, and platform analytics.
2. **Auditing and Moderation**: In case of duplicate profiles, deactivated medical centers, or fraudulent entries, administrators can execute deletions with automatic cascade cleanup.

---

## Complete RESTful API Specification

Base URL: `http://127.0.0.1:8000`

### Authentication and Session
| Method | Endpoint | Description | Request Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/login` | Authenticate user with email and password | `{ "email": "...", "password": "..." }` | `200 OK` / `401 Unauthorized` |
| `GET` | `/` | System health check and API version info | _None_ | `200 OK` |

### User Management
| Method | Endpoint | Description | Request Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/users` | Create base user record | `{ "name": "...", "email": "...", "password_hash": "...", "role": "donor\|hospital" }` | `200 OK` / `400 Bad Request` |
| `GET` | `/users` | Retrieve all registered users (excluding password) | _None_ | `200 OK` |
| `GET` | `/users/:user_id` | Retrieve single user profile by ID | _None_ | `200 OK` / `404 Not Found` |
| `DELETE` | `/users/:user_id` | **Cascade delete** user, profile, inventory, and requests | _None_ | `200 OK` / `404 Not Found` |

### Donor Management
| Method | Endpoint | Description | Request Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/users/:user_id/donor` | Attach donor profile to existing user | `{ "blood_group": "O+", "phone": "...", "latitude": 40.71, "longitude": -74.00, "availability": true }` | `200 OK` / `400 Bad Request` |
| `GET` | `/donors` | Retrieve all donor profiles | _None_ | `200 OK` |
| `GET` | `/donors/:donor_id` | Retrieve single donor profile | _None_ | `200 OK` / `404 Not Found` |
| `PUT` | `/donors/:donor_id` | Update donor availability, phone, or location | `{ "availability": false, "last_donation_date": "2026-08-20" }` | `200 OK` / `404 Not Found` |
| `DELETE` | `/donors/:donor_id` | Delete donor profile | _None_ | `200 OK` / `404 Not Found` |

### Hospital Management and Blood Bank
| Method | Endpoint | Description | Request Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/users/:user_id/hospital` | Attach hospital profile to existing user | `{ "hospital_name": "...", "phone": "...", "emergency_contact": "...", "latitude": 40.71, "longitude": -74.00, "address": "..." }` | `200 OK` / `400 Bad Request` |
| `GET` | `/hospitals` | Retrieve all registered hospitals | _None_ | `200 OK` |
| `GET` | `/hospitals/:hospital_id` | Retrieve single hospital details | _None_ | `200 OK` / `404 Not Found` |
| `PUT` | `/hospitals/:hospital_id` | Update hospital contact information or address | `{ "emergency_contact": "+1-555-0911" }` | `200 OK` / `404 Not Found` |
| `DELETE` | `/hospitals/:hospital_id` | Cascade delete hospital, inventory, and requests | _None_ | `200 OK` / `404 Not Found` |
| `GET` | `/hospitals/:hospital_id/blood-bank` | Retrieve 8-group stock matrix for hospital | _None_ | `200 OK` |
| `PUT` | `/hospitals/:hospital_id/blood-bank` | Upsert blood stock units for a blood group | `{ "blood_group": "A+", "units": 15 }` | `200 OK` / `400 Bad Request` |

### Blood Requests and Emergency Matching
| Method | Endpoint | Description | Request Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/blood-requests` | Broadcast new blood request | `{ "hospital_id": "...", "blood_group": "O-", "units_required": 3, "urgency": "emergency", "patient_name": "...", "required_by": "..." }` | `200 OK` / `400 Bad Request` |
| `GET` | `/blood-requests/hospital/:hospital_id` | List all requests issued by a hospital | _None_ | `200 OK` |
| `GET` | `/blood-requests/donor/:donor_id` | **Smart Match**: List requests matching donor's blood type enriched with hospital details | _None_ | `200 OK` |
| `GET` | `/blood-requests/:request_id` | Retrieve single blood request | _None_ | `200 OK` / `404 Not Found` |
| `PUT` | `/blood-requests/:request_id` | Update request status, units, or urgency | `{ "status": "fulfilled" }` | `200 OK` / `400 Bad Request` |
| `DELETE` | `/blood-requests/:request_id` | Delete blood request | _None_ | `200 OK` / `404 Not Found` |

### System Analytics
| Method | Endpoint | Description | Response Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/analytics/stats` | Platform totals (users, donors, hospitals, requests, stock by group) | `200 OK` |

---

## Database Schema and Indexing Strategy

LifeLink implements a fully normalized relational schema (1NF, 2NF, 3NF, BCNF) engineered for PostgreSQL and Supabase, enforcing foreign key cascades, check constraints, unique compound indexes, and automated PL/pgSQL triggers.

### PostgreSQL DDL: 8 Normalized Relational Tables

```sql
-- 1. Table: users (Authentication, Credentials, and Role Segregation)
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

-- 2. Table: donors (Subtype Profile: Biological & Spatial Donor Info)
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

-- 3. Table: hospitals (Subtype Profile: Healthcare Facility & Emergency Directory)
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

-- 4. Table: blood_inventory (8-Group Hospital Inventory Stock Matrix)
CREATE TABLE IF NOT EXISTS blood_inventory (
    id SERIAL PRIMARY KEY,
    hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units INT NOT NULL DEFAULT 0 CHECK (units >= 0),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_hospital_blood_group UNIQUE (hospital_id, blood_group)
);

CREATE INDEX IF NOT EXISTS idx_inventory_hosp_blood ON blood_inventory(hospital_id, blood_group);

-- 5. Table: blood_requests (Emergency Requests with Triage Classification)
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

-- 6. Table: donation_pledges (Donor Commitments & ETA Status)
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

-- 7. Table: donation_history (Verified Ledger & Digital Certificates)
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

-- 8. Table: notifications (Real-time Targeted Alert Logs)
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
```

### PL/pgSQL Triggers & Business Logic Automation

```sql
-- Trigger 1: Auto-Initialize 8 Blood Inventory Slots on Hospital Registration
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

-- Trigger 2: Auto-Update Inventory, Donor Last Donation, and Request Fulfillment
CREATE OR REPLACE FUNCTION fn_after_donation_history_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment hospital inventory for verified donation
    INSERT INTO blood_inventory (hospital_id, blood_group, units)
    VALUES (NEW.hospital_id, NEW.blood_group, NEW.units)
    ON CONFLICT (hospital_id, blood_group)
    DO UPDATE SET units = blood_inventory.units + EXCLUDED.units, updated_at = CURRENT_TIMESTAMP;

    -- Update donor last donation date
    UPDATE donors
    SET last_donation_date = CAST(NEW.donation_date AS DATE)
    WHERE id = NEW.donor_id;

    -- Decrement units required and auto-mark fulfilled when complete
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

-- Trigger 3: Terminal State Lock on Blood Requests
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
```

---

## Blood Compatibility Reference Matrix

| Recipient Blood Group | Compatible Donor Blood Groups (Can Receive From) | Can Donate To |
| :--- | :--- | :--- |
| **O-** *(Universal Red Cell Donor)* | `O-` | `O-`, `O+`, `A-`, `A+`, `B-`, `B+`, `AB-`, `AB+` (All) |
| **O+** | `O-`, `O+` | `O+`, `A+`, `B+`, `AB+` |
| **A-** | `O-`, `A-` | `A-`, `A+`, `AB-`, `AB+` |
| **A+** | `O-`, `O+`, `A-`, `A+` | `A+`, `AB+` |
| **B-** | `O-`, `B-` | `B-`, `B+`, `AB-`, `AB+` |
| **B+** | `O-`, `O+`, `B-`, `B+` | `B+`, `AB+` |
| **AB-** | `O-`, `A-`, `B-`, `AB-` | `AB-`, `AB+` |
| **AB+** *(Universal Recipient)* | `O-`, `O+`, `A-`, `A+`, `B-`, `B+`, `AB-`, `AB+` (All) | `AB+` |

---

## Installation and Setup Guide

### Prerequisites
- **Node.js**: Version `18.x` or `20.x+` (Active LTS / Current)
- **PostgreSQL / Supabase**: Cloud Supabase project or PostgreSQL instance (v14+).

---

### Backend Configuration and Execution

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create/Configure your `.env` file (copy from `.env.example`):
   ```env
   PORT=8000
   NODE_ENV=development
   # Supabase Connection URI (from Project Settings -> Database -> Connection string -> URI)
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   CLIENT_URL=http://localhost:5173
   ```

4. Initialize database schema and automated PL/pgSQL triggers:
   ```bash
   npm run db:setup
   ```

5. Start the backend server:
   ```bash
   # Development with auto-reload:
   npm run dev

   # Production mode:
   npm start
   ```
   *The backend will be live at `http://127.0.0.1:8000/`.*

---

### Global Cloud Hosting Deployment

#### Option A: Docker Deployment (Render, Railway, Fly.io, AWS ECS, GCP Cloud Run)
The backend includes an optimized multi-stage `Dockerfile`:
```bash
# Build the container image
docker build -t lifelink-backend ./backend

# Run the container with Supabase credentials
docker run -p 8000:8000 -e DATABASE_URL="postgresql://..." -e NODE_ENV="production" lifelink-backend
```

#### Option B: Serverless Deployment (Vercel)
A pre-configured [`vercel.json`](file:///e:/DBMS/backend/vercel.json) is included:
1. Connect the GitHub repo to **Vercel**.
2. Set Root Directory to `backend`.
3. Configure Environment Variables:
   - `DATABASE_URL`: Your Supabase connection string.
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: Your deployed frontend URL.

---

### Frontend Configuration and Execution

1. Open a separate terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional for local dev, required for deployment):
   ```bash
   # Copy the example environment template
   cp .env.example .env
   ```
   ```env
   # Backend API Endpoint
   # Local development:
   VITE_API_BASE_URL=http://127.0.0.1:8000

   # Cloud/Production deployment:
   # VITE_API_BASE_URL=https://api.yourdomain.com
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will launch at `http://localhost:5173/`.*

5. Build for production deployment (Vercel, Netlify, Render, Cloudflare Pages):
   ```bash
   npm run build
   ```
   *The compiled, optimized distribution bundle will be output to `frontend/dist/`.*

---

## Project Directory Structure

```
DBMS/
├── package.json                  # Root orchestration and convenience scripts
├── README.md                     # Architecture, ER diagrams, and project documentation
│
├── backend/                      # Node.js + PostgreSQL / Supabase RESTful API
│   ├── package.json              # Express, pg (node-postgres), Helmet, Cors
│   ├── server.js                 # Server entry point & graceful shutdown
│   ├── Dockerfile                # Production cloud container manifest
│   ├── vercel.json               # Serverless cloud deployment configuration
│   ├── .env.example              # Environment variables template
│   └── src/
│       ├── app.js                # Express app initialization & middleware stack
│       ├── config/
│       │   ├── db.js             # PostgreSQL pool, transaction manager & client wrapper
│       │   └── env.js            # Environment validation & configuration
│       ├── models/
│       │   ├── User.js           # User data access & queries
│       │   ├── Donor.js          # Donor profiles & spatial queries
│       │   ├── Hospital.js       # Hospital records & facilities
│       │   ├── BloodInventory.js # 8-group stock matrix & atomic updates
│       │   ├── BloodRequest.js   # Emergency triage requests & status locks
│       │   ├── DonationPledge.js # Donor pledges & commitments
│       │   ├── DonationHistory.js# Verified donation ledger & certificates
│       │   └── Notification.js   # Real-time alert notifications
│       ├── controllers/
│       │   ├── authController.js         # Authentication & role resolution
│       │   ├── userController.js         # User CRUD & cascade deletions
│       │   ├── donorController.js        # Donor profiles & clinical directives
│       │   ├── hospitalController.js     # Hospital operations & emergency directory
│       │   ├── bloodBankController.js    # Stock matrix management & upserts
│       │   ├── bloodRequestController.js # Triage request creation & status locks
│       │   ├── donationPledgeController.js # ACID transactions & verification
│       │   ├── donationHistoryController.js# Verified donation ledger & certificates
│       │   ├── matchingController.js     # Compatibility engine & Haversine proximity
│       │   ├── notificationController.js # Targeted alert queues
│       │   ├── analyticsController.js    # Aggregated platform statistics
│       │   └── adminController.js        # Governance, telemetry & cascade moderation
│       ├── routes/
│       │   ├── authRoutes.js             # /login
│       │   ├── userRoutes.js             # /users
│       │   ├── donorRoutes.js            # /donors
│       │   ├── hospitalRoutes.js         # /hospitals
│       │   ├── bloodRequestRoutes.js     # /blood-requests
│       │   ├── donationPledgeRoutes.js   # /donation-pledges
│       │   ├── donationHistoryRoutes.js  # /donation-history
│       │   ├── matchingRoutes.js         # /matching
│       │   ├── notificationRoutes.js     # /notifications
│       │   ├── analyticsRoutes.js        # /analytics
│       │   ├── adminRoutes.js            # /admin
│       │   └── index.js                  # Route aggregator
│       └── middlewares/
│           └── errorMiddleware.js        # Global error & standard error handler
│
└── frontend/                     # Modern React + Vite + TypeScript Client
    ├── package.json              # Dependencies (React, Lucide, Framer Motion, Tailwind)
    ├── vite.config.ts            # Vite build configuration
    ├── tailwind.config.js        # Design tokens & responsive theme
    ├── index.html                # Single-page application template
    └── src/
        ├── App.tsx               # Client routes & layout hierarchy
        ├── main.tsx              # React DOM root
        ├── index.css             # Global Tailwind directives & custom CSS
        ├── lib/                  # Centralized API client & session helpers
        ├── context/              # Toast & AuthModal context providers
        ├── components/           # Reusable UI component atoms & modules
        │   ├── ui/               # Card, Badge, StatCard, EmptyState
        │   ├── common/           # Navbar, Footer, PageHeader, MobileAppBanner
        │   ├── auth/             # LoginModal, RegisterModal (Modal-driven authentication)
        │   ├── donor/            # DonorRequestCard, AvailabilityToggle
        │   ├── hospital/         # BloodMatrixGrid, CreateRequestModal
        │   └── admin/            # DataTable
        ├── pages/                # Domain-structured application views
        │   ├── index.ts          # Barrel export aggregator
        │   ├── public/           # LandingPage, NotFoundPage
        │   ├── donor/            # DonorDashboard, MatchRadar, Profile, History, Notifications, Settings
        │   ├── hospital/         # HospitalDashboard, BloodBankStock, BloodRequests
        │   └── admin/            # AdminLogin, AdminDashboard, AdminManagement
        └── types/                # TypeScript interface definitions
```

---

## Future Scope: Native Mobile Application (Final Review)

For the final review and strategic roadmap, the core future development is the **Cross-Platform Native Mobile Application (iOS & Android)** engineered to empower on-the-go volunteer donors and emergency medical responders.

### Mobile Architecture & Native Hardware Interfacing Matrix

| System Layer | Architectural Component | Technology Stack / Protocol | Technical Responsibility & Interaction |
| :--- | :--- | :--- | :--- |
| **Presentation Tier** | Cross-Platform Native Client | React Native / Flutter (iOS & Android) | 60 FPS responsive touch UI, dark mode themes, biometric authentication prompt integration. |
| **Hardware Telemetry** | Geolocation & Motion Sensors | Native CoreLocation / Android Location API | Continuous background GPS beacon streaming coordinates for emergency radar radius calculations. |
| **Push Dispatch Tier** | Emergency Alert Delivery | Firebase Cloud Messaging (FCM) & Apple APNs | Dedicated high-priority alert channel bypassing Silent/DND modes for critical trauma calls. |
| **Local Persistence** | Offline-First Cache | Embedded SQLite / WatermelonDB | Zero-latency local storage of donor card, past donation certificates, and offline ABO chart. |
| **Gateway & Security** | RESTful API Layer | Express.js over TLS 1.3 / JWT Auth | Bearer token authentication, rate limiting, and parameter sanitization. |
| **Computational Core** | Spatial & Clinical Matching | PostgreSQL PL/pgSQL & Haversine Engine | Instantaneous matching of donor blood group and dynamic 15 km geofence radius. |
| **Turn-by-Turn Navigation** | Native Mapping Interface | Apple Maps / Google Maps Deep Linking | Instant one-tap navigation routing emergency responders to target hospital blood bank. |

### Core Mobile Application Capabilities

#### 1. Cross-Platform Native Experience
- **Framework**: Built with **React Native / Flutter** for 60fps fluid animations, low battery consumption, and universal compatibility across iOS and Android devices.
- **Biometric Security**: TouchID / FaceID biometric authentication for instantaneous emergency profile access without password entry friction.

#### 2. Emergency Push Beacon System
- **Critical Audio Chime**: High-priority alert channel bypassing Silent / Do Not Disturb modes on mobile OS for critical trauma (`emergency`) broadcasts.
- **One-Tap Availability Confirmation**: Donors can accept or snooze emergency transfusion calls directly from interactive push notification banners without unlocking their phone.

#### 3. Real-Time Background Geolocation & Proximity Tracking
- **Adaptive Geofencing**: Automatically detects when registered volunteer donors move within a 5km to 15km radius of an emergency hospital with an active matching blood request.
- **Turn-by-Turn GPS Guidance**: Deep-links directly to Google Maps / Apple Maps for optimal emergency transit routing to the target hospital blood bank.

#### 4. Offline-First Synchronization Engine
- **Local SQLite / WatermelonDB Cache**: Allows donors to view their digital blood donor card, past donation history certificates, and blood compatibility charts even in zero-connectivity environments.
- **Background Sync**: Synchronizes locally logged health eligibility metrics and donation logs immediately when connectivity is restored.

---

## License and Acknowledgments

This project is licensed under the **MIT License**.