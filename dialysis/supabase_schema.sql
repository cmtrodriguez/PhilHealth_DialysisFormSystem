-- ==========================================
-- PhilHealth Dialysis Database (PDD) Portal
-- Supabase Core Table Schema & Policies
-- Project: HI191_Dialysis
-- ==========================================

-- Clean-up existing tables (if re-running)
DROP TABLE IF EXISTS pdd_sessions;
DROP TABLE IF EXISTS pdd_registrations;
DROP TABLE IF EXISTS pdd_doctors;

-- 1. ACCREDITED NEPHROLOGISTS TABLE
CREATE TABLE pdd_doctors (
  id TEXT PRIMARY KEY,
  first TEXT NOT NULL,
  last TEXT NOT NULL,
  prcLicenseNo TEXT NOT NULL,
  panNo TEXT NOT NULL,
  email TEXT NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  signatureUrl TEXT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENT INTAKE REGISTRATIONS TABLE
CREATE TABLE pdd_registrations (
  id TEXT PRIMARY KEY,
  regType TEXT NOT NULL DEFAULT 'New Registration',
  pin TEXT NOT NULL UNIQUE,
  patientName JSONB NOT NULL, -- Format: {first, last, middle, extension}
  memberType TEXT NOT NULL,
  dob TEXT NOT NULL,
  sex TEXT NOT NULL,
  civilStatus TEXT NOT NULL,
  address JSONB NOT NULL,     -- Format: {unit, building, lot, street, subdivision, barangay, city, province, country, zip}
  contact JSONB NOT NULL,     -- Format: {email, mobile, landline}
  zBenefits JSONB NOT NULL,   -- Format: {pdFirstPolicy, kidneyTransplant}
  previousAvailment JSONB NOT NULL, -- Format: {kidneyTransplant}
  dialysisStartDate TEXT NOT NULL,
  hdDetails JSONB NOT NULL,   -- Format: {type}
  pdDetails JSONB NOT NULL,   -- Format: {system}
  admin JSONB NOT NULL,       -- Format: {pddRegNo, registeredBy, accreditationNo, registrationDate}
  recordStatus TEXT NOT NULL DEFAULT 'Pending', -- 'Pending' | 'Active' | 'Rejected'
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DIALYSIS TREATMENT SESSIONS TABLE
CREATE TABLE pdd_sessions (
  id TEXT PRIMARY KEY,
  registrationId TEXT NOT NULL REFERENCES pdd_registrations(id) ON DELETE CASCADE,
  sessionDate TEXT NOT NULL,
  attendingNephrologistId TEXT NOT NULL REFERENCES pdd_doctors(id) ON DELETE CASCADE,
  machineNo TEXT NOT NULL,
  claimStatus TEXT NOT NULL DEFAULT 'submitted', -- 'submitted' | 'approved' | 'rejected' | 'rth'
  amountClaimed NUMERIC NOT NULL DEFAULT 6350,
  rthReason TEXT DEFAULT '',
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) CONFIGURATION
-- ==========================================
ALTER TABLE pdd_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdd_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdd_sessions ENABLE ROW LEVEL SECURITY;

-- Enable public read/write access for demo environment simplicity
CREATE POLICY "Public Read All Doctors" ON pdd_doctors FOR SELECT USING (true);
CREATE POLICY "Public Insert Doctors" ON pdd_doctors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Doctors" ON pdd_doctors FOR UPDATE USING (true);
CREATE POLICY "Public Delete Doctors" ON pdd_doctors FOR DELETE USING (true);

CREATE POLICY "Public Read All Registrations" ON pdd_registrations FOR SELECT USING (true);
CREATE POLICY "Public Insert Registrations" ON pdd_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Registrations" ON pdd_registrations FOR UPDATE USING (true);
CREATE POLICY "Public Delete Registrations" ON pdd_registrations FOR DELETE USING (true);

CREATE POLICY "Public Read All Sessions" ON pdd_sessions FOR SELECT USING (true);
CREATE POLICY "Public Insert Sessions" ON pdd_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Sessions" ON pdd_sessions FOR UPDATE USING (true);
CREATE POLICY "Public Delete Sessions" ON pdd_sessions FOR DELETE USING (true);

-- ==========================================
-- PRE-SEEDED CORE DEMO SANDBOX ENTRIES
-- ==========================================

-- Seed Doctors
INSERT INTO pdd_doctors (id, first, last, prcLicenseNo, panNo, email, isActive, signatureUrl) VALUES
('doc_1', 'Edgardo', 'Perez', '0098765', '99-012345678-0', 'edgardo.perez@hospital.gov.ph', true, 'https://raw.githubusercontent.com/user-attachments/assets/5e0034a7-8025-4cde-a178-65363e77f000'),
('doc_2', 'Maria', 'Santos', '0054321', '99-876543210-9', 'maria.santos@hospital.gov.ph', true, 'https://raw.githubusercontent.com/user-attachments/assets/5e0034a7-8025-4cde-a178-65363e77f000'),
('doc_3', 'Jose', 'Reyes', '0077777', '99-555555555-5', 'jose.reyes@hospital.gov.ph', false, 'https://raw.githubusercontent.com/user-attachments/assets/5e0034a7-8025-4cde-a178-65363e77f000');

-- Seed Registrations
INSERT INTO pdd_registrations (id, regType, pin, patientName, memberType, dob, sex, civilStatus, address, contact, zBenefits, previousAvailment, dialysisStartDate, hdDetails, pdDetails, admin, recordStatus) VALUES
(
  'reg_1', 
  'New Registration', 
  '12-345678901-2', 
  '{"first": "Juan", "last": "Dela Cruz", "middle": "Santos", "extension": ""}', 
  'Principal Member', 
  '1985-05-15', 
  'Male', 
  'Married',
  '{"unit": "12", "building": "Tower A", "lot": "45", "street": "Mabini", "subdivision": "Residences", "barangay": "Barangay 669", "city": "Ermita", "province": "Metro Manila", "country": "Philippines", "zip": "1000"}',
  '{"email": "juan.delacruz@example.com", "mobile": "09171234567", "landline": "028123456"}',
  '{"pdFirstPolicy": false, "kidneyTransplant": false}',
  '{"kidneyTransplant": false}',
  '2026-01-10',
  '{"type": "Low flux"}',
  '{"system": ""}',
  '{"pddRegNo": "PDD-998811", "registeredBy": "Maria Santos (HCI Encoder)", "accreditationNo": "HCI-123456", "registrationDate": "2026-01-12"}',
  'Active'
),
(
  'reg_2', 
  'New Registration', 
  '99-888888888-9', 
  '{"first": "Pedro", "last": "Penduko", "middle": "Agua", "extension": ""}', 
  'Dependent', 
  '1992-09-20', 
  'Male', 
  'Single',
  '{"unit": "3B", "building": "Green Plaza", "lot": "12", "street": "Rizal Ave", "subdivision": "", "barangay": "Barangay 12", "city": "Pasay", "province": "Metro Manila", "country": "Philippines", "zip": "1300"}',
  '{"email": "pedro.penduko@example.com", "mobile": "09187654321", "landline": ""}',
  '{"pdFirstPolicy": true, "kidneyTransplant": false}',
  '{"kidneyTransplant": false}',
  '2026-05-01',
  '{"type": "Low flux"}',
  '{"system": "CAPD"}',
  '{"pddRegNo": "", "registeredBy": "", "accreditationNo": "", "registrationDate": ""}',
  'Pending'
),
(
  'reg_3', 
  'New Registration', 
  '11-222333444-5', 
  '{"first": "Maria", "last": "Clara", "middle": "Ibarra", "extension": ""}', 
  'Principal Member', 
  '1978-11-30', 
  'Female', 
  'Single',
  '{"unit": "Suite 9", "building": "Rizal Mansions", "lot": "", "street": "Taft Ave", "subdivision": "", "barangay": "Barangay 700", "city": "Malate", "province": "Metro Manila", "country": "Philippines", "zip": "1004"}',
  '{"email": "maria.clara@example.com", "mobile": "09223344556", "landline": "028776655"}',
  '{"pdFirstPolicy": false, "kidneyTransplant": false}',
  '{"kidneyTransplant": false}',
  '2025-08-15',
  '{"type": "High flux"}',
  '{"system": ""}',
  '{"pddRegNo": "PDD-776655", "registeredBy": "Maria Santos (HCI Encoder)", "accreditationNo": "HCI-123456", "registrationDate": "2025-08-16"}',
  'Active'
);

-- Seed RTH sessions for Maria Clara (reg_3)
INSERT INTO pdd_sessions (id, registrationId, sessionDate, attendingNephrologistId, machineNo, claimStatus, amountClaimed, rthReason) VALUES
('session_maria_rth_1', 'reg_3', '2026-05-10', 'doc_2', '05', 'rth', 6350, 'PRC License Accreditation Number out of sync'),
('session_maria_rth_2', 'reg_3', '2026-05-12', 'doc_2', '05', 'rth', 6350, 'PIN and Member Birthdate mismatch on regional databases');
