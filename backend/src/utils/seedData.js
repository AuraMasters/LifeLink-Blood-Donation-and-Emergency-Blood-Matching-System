import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { User } from '../models/User.js';
import { Donor } from '../models/Donor.js';
import { Hospital } from '../models/Hospital.js';
import { BloodInventory } from '../models/BloodInventory.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { DonationPledge } from '../models/DonationPledge.js';
import { DonationHistory } from '../models/DonationHistory.js';
import { Notification } from '../models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb+srv://subash59245_db_user:pLgx7IYEL0zzdScg@cluster0.xjsnypf.mongodb.net';

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB Cluster...');
    await mongoose.connect(MONGODB_URL, {
      dbName: 'lifelink_db',
    });
    console.log('✅ Connected to MongoDB successfully.');

    console.log('🧹 Purging existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Donor.deleteMany({}),
      Hospital.deleteMany({}),
      BloodInventory.deleteMany({}),
      BloodRequest.deleteMany({}),
      DonationPledge.deleteMany({}),
      DonationHistory.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('✅ Collections cleared.');

    console.log('👤 Seeding Administrators...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@lifelink.org',
      password_hash: 'admin123',
      role: 'admin',
    });

    console.log('🏥 Seeding Hospitals and Facility Blood Banks...');
    const hospitalData = [
      {
        userName: 'Metro General Admin',
        email: 'metro@hospital.org',
        password: 'hospital123',
        hospitalName: 'Metropolitan General Trauma Center',
        phone: '+1 (555) 234-5678',
        emergencyContact: '+1 (555) 911-0001',
        latitude: 40.7128,
        longitude: -74.006,
        address: '550 1st Avenue, New York, NY 10016',
        stock: { 'A+': 8, 'A-': 3, 'B+': 6, 'B-': 1, 'AB+': 4, 'AB-': 2, 'O+': 12, 'O-': 2 },
      },
      {
        userName: 'St. Jude Clinical Admin',
        email: 'stjude@hospital.org',
        password: 'hospital123',
        hospitalName: 'St. Jude Regional Medical Center',
        phone: '+1 (555) 345-6789',
        emergencyContact: '+1 (555) 911-0002',
        latitude: 40.7589,
        longitude: -73.9851,
        address: '1300 York Avenue, New York, NY 10065',
        stock: { 'A+': 10, 'A-': 2, 'B+': 4, 'B-': 0, 'AB+': 3, 'AB-': 1, 'O+': 15, 'O-': 1 },
      },
      {
        userName: 'Brooklyn Emergency Admin',
        email: 'brooklyn@hospital.org',
        password: 'hospital123',
        hospitalName: 'Brooklyn Emergency Health Center',
        phone: '+1 (555) 456-7890',
        emergencyContact: '+1 (555) 911-0003',
        latitude: 40.6782,
        longitude: -73.9442,
        address: '121 DeKalb Ave, Brooklyn, NY 11201',
        stock: { 'A+': 5, 'A-': 1, 'B+': 7, 'B-': 2, 'AB+': 2, 'AB-': 0, 'O+': 9, 'O-': 3 },
      },
      {
        userName: 'Queens Memorial Admin',
        email: 'queens@hospital.org',
        password: 'hospital123',
        hospitalName: 'Queens Memorial Hospital',
        phone: '+1 (555) 567-8901',
        emergencyContact: '+1 (555) 911-0004',
        latitude: 40.7282,
        longitude: -73.7949,
        address: '82-68 164th St, Jamaica, NY 11432',
        stock: { 'A+': 6, 'A-': 4, 'B+': 3, 'B-': 1, 'AB+': 5, 'AB-': 2, 'O+': 8, 'O-': 0 },
      },
    ];

    const hospitals = [];
    for (const h of hospitalData) {
      const user = await User.create({
        name: h.userName,
        email: h.email,
        password_hash: h.password,
        role: 'hospital',
      });

      const hospital = await Hospital.create({
        user_id: user._id,
        hospital_name: h.hospitalName,
        phone: h.phone,
        emergency_contact: h.emergencyContact,
        latitude: h.latitude,
        longitude: h.longitude,
        address: h.address,
      });

      hospitals.push({ ...hospital.toObject(), user });

      // Create 8-group inventory
      for (const group of ALL_BLOOD_GROUPS) {
        await BloodInventory.create({
          hospital_id: hospital._id,
          blood_group: group,
          units: h.stock[group] ?? 0,
        });
      }
    }
    console.log(`✅ ${hospitals.length} Hospitals and inventories created.`);

    console.log('🩸 Seeding Volunteer Donors...');
    const donorData = [
      {
        name: 'Alex Rivera',
        email: 'alex@donor.com',
        password: 'donor123',
        bloodGroup: 'O-',
        phone: '+1 (555) 101-2001',
        latitude: 40.718,
        longitude: -74.002,
        address: 'Tribeca, New York, NY',
        availability: true,
        lastDonationDate: '2026-06-15',
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@donor.com',
        password: 'donor123',
        bloodGroup: 'O+',
        phone: '+1 (555) 102-2002',
        latitude: 40.73,
        longitude: -73.995,
        address: 'Greenwich Village, New York, NY',
        availability: true,
        lastDonationDate: '2026-05-10',
      },
      {
        name: 'Marcus Vance',
        email: 'marcus@donor.com',
        password: 'donor123',
        bloodGroup: 'A+',
        phone: '+1 (555) 103-2003',
        latitude: 40.745,
        longitude: -73.98,
        address: 'Murray Hill, New York, NY',
        availability: true,
        lastDonationDate: '2026-07-01',
      },
      {
        name: 'Elena Rostova',
        email: 'elena@donor.com',
        password: 'donor123',
        bloodGroup: 'A-',
        phone: '+1 (555) 104-2004',
        latitude: 40.76,
        longitude: -73.97,
        address: 'Upper East Side, New York, NY',
        availability: true,
        lastDonationDate: '2026-04-20',
      },
      {
        name: 'David Kim',
        email: 'david@donor.com',
        password: 'donor123',
        bloodGroup: 'B+',
        phone: '+1 (555) 105-2005',
        latitude: 40.69,
        longitude: -73.96,
        address: 'Fort Greene, Brooklyn, NY',
        availability: true,
        lastDonationDate: '2026-03-12',
      },
      {
        name: 'Aaliyah Patel',
        email: 'aaliyah@donor.com',
        password: 'donor123',
        bloodGroup: 'B-',
        phone: '+1 (555) 106-2006',
        latitude: 40.67,
        longitude: -73.98,
        address: 'Park Slope, Brooklyn, NY',
        availability: true,
        lastDonationDate: null,
      },
      {
        name: 'James Wilson',
        email: 'james@donor.com',
        password: 'donor123',
        bloodGroup: 'AB+',
        phone: '+1 (555) 107-2007',
        latitude: 40.77,
        longitude: -73.92,
        address: 'Astoria, Queens, NY',
        availability: false,
        lastDonationDate: '2026-08-01',
      },
      {
        name: 'Maya Lin',
        email: 'maya@donor.com',
        password: 'donor123',
        bloodGroup: 'AB-',
        phone: '+1 (555) 108-2008',
        latitude: 40.72,
        longitude: -73.85,
        address: 'Forest Hills, Queens, NY',
        availability: true,
        lastDonationDate: null,
      },
    ];

    const donors = [];
    for (const d of donorData) {
      const user = await User.create({
        name: d.name,
        email: d.email,
        password_hash: d.password,
        role: 'donor',
      });

      const donor = await Donor.create({
        user_id: user._id,
        blood_group: d.bloodGroup,
        phone: d.phone,
        latitude: d.latitude,
        longitude: d.longitude,
        address: d.address,
        availability: d.availability,
        last_donation_date: d.lastDonationDate,
      });

      donors.push({ ...donor.toObject(), user });
    }
    console.log(`✅ ${donors.length} Donors created.`);

    console.log('🚨 Seeding Emergency Blood Broadcast Requests...');
    const req1 = await BloodRequest.create({
      hospital_id: hospitals[0]._id,
      blood_group: 'O-',
      units_required: 4,
      initial_units_required: 4,
      urgency: 'emergency',
      patient_name: 'Trauma Bay 2 - Severe Hemorrhage',
      status: 'searching',
    });

    const req2 = await BloodRequest.create({
      hospital_id: hospitals[1]._id,
      blood_group: 'A+',
      units_required: 2,
      initial_units_required: 2,
      urgency: 'urgent',
      patient_name: 'Cardiac Surgery Pre-Op',
      status: 'searching',
    });

    const req3 = await BloodRequest.create({
      hospital_id: hospitals[2]._id,
      blood_group: 'B-',
      units_required: 3,
      initial_units_required: 3,
      urgency: 'emergency',
      patient_name: 'Pediatric ICU Ward 4',
      status: 'searching',
    });

    const req4 = await BloodRequest.create({
      hospital_id: hospitals[3]._id,
      blood_group: 'AB-',
      units_required: 2,
      initial_units_required: 2,
      urgency: 'normal',
      patient_name: 'Elective Surgery Prep',
      status: 'searching',
    });

    const req5 = await BloodRequest.create({
      hospital_id: hospitals[0]._id,
      blood_group: 'O+',
      units_required: 0,
      initial_units_required: 3,
      urgency: 'urgent',
      patient_name: 'Emergency Ward 102',
      status: 'fulfilled',
    });

    console.log('🤝 Seeding Active Donation Pledges...');
    // Alex Rivera (O-) pledged to Metro General O- Emergency Request
    const pledge1 = await DonationPledge.create({
      request_id: req1._id,
      hospital_id: hospitals[0]._id,
      donor_id: donors[0]._id,
      donor_user_id: donors[0].user._id,
      donor_name: donors[0].user.name,
      donor_phone: donors[0].phone,
      blood_group: donors[0].blood_group,
      status: 'pledged',
      estimated_arrival: 'Within 30 minutes',
      notes: 'En route via taxi, approaching emergency triage desk.',
    });

    // Sarah Chen (O+) pledged to St. Jude Request
    const pledge2 = await DonationPledge.create({
      request_id: req2._id,
      hospital_id: hospitals[1]._id,
      donor_id: donors[1]._id,
      donor_user_id: donors[1].user._id,
      donor_name: donors[1].user.name,
      donor_phone: donors[1].phone,
      blood_group: donors[1].blood_group,
      status: 'acknowledged',
      estimated_arrival: 'Within 1 hour',
      notes: 'Finishing work shift and walking over to hospital blood bank.',
    });

    console.log('📜 Seeding Verified Transfusion History & Digital Certificates...');
    await DonationHistory.create([
      {
        donor_id: donors[0]._id,
        hospital_id: hospitals[0]._id,
        blood_group: 'O-',
        units: 2,
        donation_date: new Date('2026-06-15T14:30:00Z'),
        donor_name: donors[0].user.name,
        hospital_name: hospitals[0].hospital_name,
        hospital_address: hospitals[0].address,
        certificate_id: 'CERT-2026-88129',
        status: 'verified',
        remarks: 'Emergency universal donor transfusion for trauma resuscitation.',
      },
      {
        donor_id: donors[1]._id,
        hospital_id: hospitals[1]._id,
        blood_group: 'O+',
        units: 1,
        donation_date: new Date('2026-05-10T10:15:00Z'),
        donor_name: donors[1].user.name,
        hospital_name: hospitals[1].hospital_name,
        hospital_address: hospitals[1].address,
        certificate_id: 'CERT-2026-44391',
        status: 'verified',
        remarks: 'Whole blood donation verified and stored in refrigerated inventory.',
      },
      {
        donor_id: donors[2]._id,
        hospital_id: hospitals[2]._id,
        blood_group: 'A+',
        units: 1,
        donation_date: new Date('2026-07-01T16:45:00Z'),
        donor_name: donors[2].user.name,
        hospital_name: hospitals[2].hospital_name,
        hospital_address: hospitals[2].address,
        certificate_id: 'CERT-2026-19283',
        status: 'verified',
        remarks: 'Routine voluntary clinical donation verified.',
      },
    ]);

    console.log('🔔 Seeding System Notifications...');
    await Notification.create([
      {
        recipient_id: donors[0].user._id.toString(),
        recipient_role: 'donor',
        notification_type: 'emergency_alert',
        title: 'Emergency Match: O- Blood Needed Immediately',
        message: 'Metropolitan General Trauma Center has broadcasted an emergency requirement for 4 units of O- blood.',
        blood_group: 'O-',
        request_id: req1._id.toString(),
        is_read: false,
      },
      {
        recipient_id: donors[1].user._id.toString(),
        recipient_role: 'donor',
        notification_type: 'pledge_acknowledged',
        title: 'Pledge Confirmed by St. Jude Regional',
        message: 'The clinical team has acknowledged your arrival ETA and is preparing reception.',
        blood_group: 'O+',
        request_id: req2._id.toString(),
        is_read: false,
      },
      {
        recipient_id: hospitals[0].user._id.toString(),
        recipient_role: 'hospital',
        notification_type: 'donor_pledge',
        title: 'Incoming Donor Pledge from Alex Rivera',
        message: 'Alex Rivera (O-) has pledged for your emergency broadcast. ETA: Within 30 minutes.',
        blood_group: 'O-',
        request_id: req1._id.toString(),
        is_read: false,
      },
    ]);

    console.log('✨ Database seeding complete! Summary:');
    console.log(`- 1 Admin account: admin@lifelink.org / admin123`);
    console.log(`- ${hospitals.length} Hospitals (e.g. metro@hospital.org / hospital123)`);
    console.log(`- ${donors.length} Donors (e.g. alex@donor.com / donor123, sarah@donor.com)`);
    console.log(`- 5 Blood Requests (Emergency & Urgent)`);
    console.log(`- 2 Active Pledges`);
    console.log(`- 3 Verified Transfusion History Certificates`);
    console.log(`- 3 Notifications`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}
