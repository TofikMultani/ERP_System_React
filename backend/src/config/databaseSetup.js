/* globals require, process, module */
const bcrypt = require('bcryptjs');
const pool = require('./database');

const DEMO_USERS = [
  {
    role: 'root-admin',
    module: 'Root Admin',
    email: process.env.ROOT_ADMIN_EMAIL || 'rootadmin@erp.local',
    password: process.env.ROOT_ADMIN_PASSWORD || 'RootAdmin@123',
    firstName: process.env.ROOT_ADMIN_FIRST_NAME || 'Root',
    lastName: process.env.ROOT_ADMIN_LAST_NAME || 'Admin',
  },
  {
    role: 'admin',
    module: 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@erp.local',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    firstName: process.env.ADMIN_FIRST_NAME || 'System',
    lastName: process.env.ADMIN_LAST_NAME || 'Admin',
  },
  {
    role: 'hr',
    module: 'HR',
    email: process.env.HR_EMAIL || 'hr@erp.local',
    password: process.env.HR_PASSWORD || 'Hr@12345',
    firstName: process.env.HR_FIRST_NAME || 'HR',
    lastName: process.env.HR_LAST_NAME || 'Manager',
  },
  {
    role: 'sales',
    module: 'Sales',
    email: process.env.SALES_EMAIL || 'sales@erp.local',
    password: process.env.SALES_PASSWORD || 'Sales@123',
    firstName: process.env.SALES_FIRST_NAME || 'Sales',
    lastName: process.env.SALES_LAST_NAME || 'Lead',
  },
  {
    role: 'inventory',
    module: 'Inventory',
    email: process.env.INVENTORY_EMAIL || 'inventory@erp.local',
    password: process.env.INVENTORY_PASSWORD || 'Inventory@123',
    firstName: process.env.INVENTORY_FIRST_NAME || 'Inventory',
    lastName: process.env.INVENTORY_LAST_NAME || 'Manager',
  },
  {
    role: 'finance',
    module: 'Finance',
    email: process.env.FINANCE_EMAIL || 'finance@erp.local',
    password: process.env.FINANCE_PASSWORD || 'Finance@123',
    firstName: process.env.FINANCE_FIRST_NAME || 'Finance',
    lastName: process.env.FINANCE_LAST_NAME || 'Manager',
  },
  {
    role: 'support',
    module: 'Support',
    email: process.env.SUPPORT_EMAIL || 'support@erp.local',
    password: process.env.SUPPORT_PASSWORD || 'Support@123',
    firstName: process.env.SUPPORT_FIRST_NAME || 'Support',
    lastName: process.env.SUPPORT_LAST_NAME || 'Agent',
  },
  {
    role: 'it',
    module: 'IT',
    email: process.env.IT_EMAIL || 'it@erp.local',
    password: process.env.IT_PASSWORD || 'It@123456',
    firstName: process.env.IT_FIRST_NAME || 'IT',
    lastName: process.env.IT_LAST_NAME || 'Admin',
  },
];

const DEMO_MODULE_CATALOG = [
  { key: 'hr', label: 'HR', isActive: true, price: 2500 },
  { key: 'sales', label: 'Sales', isActive: true, price: 3000 },
  { key: 'inventory', label: 'Inventory', isActive: true, price: 2800 },
  { key: 'finance', label: 'Finance', isActive: true, price: 3500 },
  { key: 'support', label: 'Customer Support', isActive: true, price: 2200 },
  { key: 'it', label: 'IT', isActive: true, price: 2600 },
];

async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL DEFAULT '',
      visible_password VARCHAR(255),
      last_name VARCHAR(100) NOT NULL DEFAULT '',
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      allowed_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
      parent_user_id INTEGER,
      assigned_module VARCHAR(50),
      is_active BOOLEAN NOT NULL DEFAULT true,
      last_login_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NOT NULL DEFAULT '';`,
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS visible_password VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NOT NULL DEFAULT '';`,
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'user';`,
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_modules JSONB NOT NULL DEFAULT '[]'::jsonb;`,
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_user_id INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_module VARCHAR(50);`,
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;`,
  );
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;`);
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_users_parent_user_id ON users(parent_user_id);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_users_assigned_module ON users(assigned_module);`,
  );
}

async function ensureModuleCatalogTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS module_catalog (
      id SERIAL PRIMARY KEY,
      module_key VARCHAR(50) UNIQUE NOT NULL,
      label VARCHAR(100) UNIQUE NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      price NUMERIC(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(
    `ALTER TABLE module_catalog ADD COLUMN IF NOT EXISTS module_key VARCHAR(50);`,
  );
  await pool.query(
    `ALTER TABLE module_catalog ADD COLUMN IF NOT EXISTS label VARCHAR(100);`,
  );
  await pool.query(
    `ALTER TABLE module_catalog ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;`,
  );
  await pool.query(
    `ALTER TABLE module_catalog ADD COLUMN IF NOT EXISTS price NUMERIC(12,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE module_catalog ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );
  await pool.query(
    `ALTER TABLE module_catalog ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );

  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_module_catalog_module_key ON module_catalog(module_key);`,
  );
  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_module_catalog_label ON module_catalog(label);`,
  );
}

async function ensureAccessRequestsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS access_requests (
      id BIGSERIAL PRIMARY KEY,
      requester_name VARCHAR(255) NOT NULL,
      requester_email VARCHAR(255) NOT NULL,
      requester_phone VARCHAR(50) NOT NULL,
      company_name VARCHAR(255) NOT NULL,
      modules JSONB NOT NULL DEFAULT '[]'::jsonb,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TIMESTAMP,
      reviewed_by VARCHAR(255),
      review_note TEXT,
      pricing_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
      total_estimated_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
      inactive_requested_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
      payment_order_id VARCHAR(255),
      payment_id VARCHAR(255),
      payment_signature VARCHAR(255),
      payment_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      payment_completed_at TIMESTAMP,
      provisioned_user_id INTEGER,
      credentials_generated_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS requester_name VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS requester_email VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS requester_phone VARCHAR(50);`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS modules JSONB NOT NULL DEFAULT '[]'::jsonb;`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'pending';`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );
  await pool.query(`ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;`);
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255);`,
  );
  await pool.query(`ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS review_note TEXT;`);
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS pricing_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb;`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS total_estimated_cost NUMERIC(12,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS inactive_requested_modules JSONB NOT NULL DEFAULT '[]'::jsonb;`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS payment_order_id VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS payment_signature VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(12,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP;`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS provisioned_user_id INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS credentials_generated_at TIMESTAMP;`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );
  await pool.query(
    `ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );

  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_access_requests_provisioned_user_id ON access_requests(provisioned_user_id);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_access_requests_submitted_at ON access_requests(submitted_at DESC);`,
  );
}

async function ensureEmployeesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id BIGSERIAL PRIMARY KEY,
      employee_id VARCHAR(50) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      department VARCHAR(120) NOT NULL,
      role_designation VARCHAR(150) NOT NULL,
      date_joined DATE NOT NULL,
      status VARCHAR(80) NOT NULL,
      salary NUMERIC(14,2),
      address TEXT,
      reporting_manager VARCHAR(255),
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50);`,
  );
  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`,
  );
  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS email VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS department VARCHAR(120);`,
  );
  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS role_designation VARCHAR(150);`,
  );
  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS date_joined DATE;`,
  );
  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS status VARCHAR(80);`,
  );
  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary NUMERIC(14,2);`,
  );
  await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS address TEXT;`);
  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS reporting_manager VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS updated_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );
  await pool.query(
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );

  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);`,
  );
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);`);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at DESC);`,
  );
}

async function ensureDepartmentsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS departments (
      id BIGSERIAL PRIMARY KEY,
      department_code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(180) NOT NULL,
      head_name VARCHAR(255) NOT NULL,
      head_email VARCHAR(255),
      head_phone VARCHAR(50),
      employee_count INTEGER NOT NULL DEFAULT 0,
      annual_budget NUMERIC(14,2),
      location VARCHAR(180),
      description TEXT,
      status VARCHAR(80) NOT NULL DEFAULT 'Active',
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(
    `ALTER TABLE departments ADD COLUMN IF NOT EXISTS department_code VARCHAR(50);`,
  );
  await pool.query(`ALTER TABLE departments ADD COLUMN IF NOT EXISTS name VARCHAR(180);`);
  await pool.query(
    `ALTER TABLE departments ADD COLUMN IF NOT EXISTS head_name VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE departments ADD COLUMN IF NOT EXISTS head_email VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE departments ADD COLUMN IF NOT EXISTS head_phone VARCHAR(50);`,
  );
  await pool.query(
    `ALTER TABLE departments ADD COLUMN IF NOT EXISTS employee_count INTEGER NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE departments ADD COLUMN IF NOT EXISTS annual_budget NUMERIC(14,2);`,
  );
  await pool.query(
    `ALTER TABLE departments ADD COLUMN IF NOT EXISTS location VARCHAR(180);`,
  );
  await pool.query(`ALTER TABLE departments ADD COLUMN IF NOT EXISTS description TEXT;`);
  await pool.query(
    `ALTER TABLE departments ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Active';`,
  );
  await pool.query(
    `ALTER TABLE departments ADD COLUMN IF NOT EXISTS created_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE departments ADD COLUMN IF NOT EXISTS updated_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE departments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );
  await pool.query(
    `ALTER TABLE departments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );

  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_departments_code ON departments(department_code);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_departments_status ON departments(status);`,
  );
}

async function ensureLeaveRequestsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id BIGSERIAL PRIMARY KEY,
      leave_code VARCHAR(60) UNIQUE NOT NULL,
      employee_id VARCHAR(50) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      department VARCHAR(180) NOT NULL,
      leave_type VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      total_days INTEGER NOT NULL DEFAULT 0,
      reason TEXT,
      status VARCHAR(80) NOT NULL DEFAULT 'Pending',
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(
    `ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS leave_code VARCHAR(60);`,
  );
  await pool.query(
    `ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50);`,
  );
  await pool.query(
    `ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS employee_name VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS department VARCHAR(180);`,
  );
  await pool.query(
    `ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS leave_type VARCHAR(100);`,
  );
  await pool.query(
    `ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS start_date DATE;`,
  );
  await pool.query(
    `ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS end_date DATE;`,
  );
  await pool.query(
    `ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS total_days INTEGER NOT NULL DEFAULT 0;`,
  );
  await pool.query(`ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS reason TEXT;`);
  await pool.query(
    `ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Pending';`,
  );
  await pool.query(
    `ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS created_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS updated_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );
  await pool.query(
    `ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );

  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_leave_requests_code ON leave_requests(leave_code);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);`,
  );
}

async function ensureRecruitmentCandidatesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS recruitment_candidates (
      id BIGSERIAL PRIMARY KEY,
      candidate_code VARCHAR(60) UNIQUE NOT NULL,
      candidate_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(60) NOT NULL,
      department VARCHAR(180) NOT NULL,
      role_title VARCHAR(180) NOT NULL,
      source VARCHAR(120),
      experience_years NUMERIC(6,2) NOT NULL DEFAULT 0,
      current_ctc NUMERIC(14,2),
      expected_ctc NUMERIC(14,2),
      notice_period_days INTEGER NOT NULL DEFAULT 0,
      application_date DATE NOT NULL,
      interview_date DATE,
      stage VARCHAR(100) NOT NULL DEFAULT 'Screening',
      status VARCHAR(80) NOT NULL DEFAULT 'In Progress',
      recruiter_name VARCHAR(255),
      remarks TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS candidate_code VARCHAR(60);`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS candidate_name VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS email VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS phone VARCHAR(60);`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS department VARCHAR(180);`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS role_title VARCHAR(180);`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS source VARCHAR(120);`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS experience_years NUMERIC(6,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS current_ctc NUMERIC(14,2);`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS expected_ctc NUMERIC(14,2);`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS notice_period_days INTEGER NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS application_date DATE;`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS interview_date DATE;`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS stage VARCHAR(100) NOT NULL DEFAULT 'Screening';`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'In Progress';`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS recruiter_name VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS remarks TEXT;`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS created_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS updated_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );
  await pool.query(
    `ALTER TABLE recruitment_candidates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );

  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_recruitment_candidates_code ON recruitment_candidates(candidate_code);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_email ON recruitment_candidates(email);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_status ON recruitment_candidates(status);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_stage ON recruitment_candidates(stage);`,
  );
}

async function ensureHrDocumentsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hr_documents (
      id BIGSERIAL PRIMARY KEY,
      document_code VARCHAR(60) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(120) NOT NULL,
      owner_name VARCHAR(255) NOT NULL,
      linked_employee_id VARCHAR(50),
      effective_date DATE,
      expiry_date DATE,
      status VARCHAR(80) NOT NULL DEFAULT 'Active',
      description TEXT,
      original_file_name VARCHAR(255) NOT NULL,
      stored_file_name VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL,
      mime_type VARCHAR(150),
      file_size_bytes BIGINT NOT NULL DEFAULT 0,
      uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS document_code VARCHAR(60);`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS title VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS category VARCHAR(120);`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS linked_employee_id VARCHAR(50);`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS effective_date DATE;`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS expiry_date DATE;`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Active';`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS description TEXT;`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS original_file_name VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS stored_file_name VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS file_path TEXT;`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS mime_type VARCHAR(150);`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS created_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS updated_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );
  await pool.query(
    `ALTER TABLE hr_documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );

  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_hr_documents_code ON hr_documents(document_code);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_hr_documents_category ON hr_documents(category);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_hr_documents_status ON hr_documents(status);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_hr_documents_linked_employee_id ON hr_documents(linked_employee_id);`,
  );
}

async function ensureTrainingProgramsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS training_programs (
      id BIGSERIAL PRIMARY KEY,
      training_code VARCHAR(60) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      department VARCHAR(180) NOT NULL,
      trainer_name VARCHAR(255) NOT NULL,
      training_mode VARCHAR(80) NOT NULL DEFAULT 'Online',
      provider_name VARCHAR(255),
      location VARCHAR(255),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      duration_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
      total_seats INTEGER NOT NULL DEFAULT 0,
      enrolled_count INTEGER NOT NULL DEFAULT 0,
      budget NUMERIC(14,2),
      status VARCHAR(80) NOT NULL DEFAULT 'Upcoming',
      description TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS training_code VARCHAR(60);`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS title VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS department VARCHAR(180);`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS trainer_name VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS training_mode VARCHAR(80) NOT NULL DEFAULT 'Online';`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS provider_name VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS location VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS start_date DATE;`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS end_date DATE;`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS duration_hours NUMERIC(8,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS total_seats INTEGER NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS enrolled_count INTEGER NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS budget NUMERIC(14,2);`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Upcoming';`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS description TEXT;`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS created_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS updated_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );
  await pool.query(
    `ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );

  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_training_programs_code ON training_programs(training_code);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_training_programs_department ON training_programs(department);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_training_programs_status ON training_programs(status);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_training_programs_start_date ON training_programs(start_date DESC);`,
  );
}

async function ensurePayrollRecordsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payroll_records (
      id BIGSERIAL PRIMARY KEY,
      payroll_code VARCHAR(60) UNIQUE NOT NULL,
      employee_id VARCHAR(50) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      department VARCHAR(180) NOT NULL,
      role_designation VARCHAR(180) NOT NULL,
      pay_month VARCHAR(20) NOT NULL,
      basic_salary NUMERIC(14,2) NOT NULL DEFAULT 0,
      hra NUMERIC(14,2) NOT NULL DEFAULT 0,
      allowances NUMERIC(14,2) NOT NULL DEFAULT 0,
      overtime_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
      bonus NUMERIC(14,2) NOT NULL DEFAULT 0,
      gross_salary NUMERIC(14,2) NOT NULL DEFAULT 0,
      tax NUMERIC(14,2) NOT NULL DEFAULT 0,
      provident_fund NUMERIC(14,2) NOT NULL DEFAULT 0,
      other_deductions NUMERIC(14,2) NOT NULL DEFAULT 0,
      total_deductions NUMERIC(14,2) NOT NULL DEFAULT 0,
      net_salary NUMERIC(14,2) NOT NULL DEFAULT 0,
      payment_date DATE,
      status VARCHAR(80) NOT NULL DEFAULT 'Pending',
      notes TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS payroll_code VARCHAR(60);`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50);`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS employee_name VARCHAR(255);`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS department VARCHAR(180);`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS role_designation VARCHAR(180);`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS pay_month VARCHAR(20);`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS basic_salary NUMERIC(14,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS hra NUMERIC(14,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS allowances NUMERIC(14,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS overtime_pay NUMERIC(14,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS bonus NUMERIC(14,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS gross_salary NUMERIC(14,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS tax NUMERIC(14,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS provident_fund NUMERIC(14,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS other_deductions NUMERIC(14,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS total_deductions NUMERIC(14,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS net_salary NUMERIC(14,2) NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS payment_date DATE;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Pending';`,
  );
  await pool.query(`ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS notes TEXT;`);
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS created_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS updated_by INTEGER;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );
  await pool.query(
    `ALTER TABLE payroll_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  );

  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_records_code ON payroll_records(payroll_code);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_payroll_records_employee_id ON payroll_records(employee_id);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_payroll_records_pay_month ON payroll_records(pay_month);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_payroll_records_status ON payroll_records(status);`,
  );
}

async function ensureSalesTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales_customers (
      id BIGSERIAL PRIMARY KEY,
      customer_code VARCHAR(60) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      company VARCHAR(255),
      industry VARCHAR(120),
      status VARCHAR(80) NOT NULL DEFAULT 'Active',
      credit_limit NUMERIC(14,2) NOT NULL DEFAULT 0,
      notes TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales_orders (
      id BIGSERIAL PRIMARY KEY,
      order_number VARCHAR(60) UNIQUE NOT NULL,
      customer_code VARCHAR(60) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      order_date DATE NOT NULL,
      amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      item_count INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(80) NOT NULL DEFAULT 'Processing',
      shipping_address TEXT,
      notes TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales_invoices (
      id BIGSERIAL PRIMARY KEY,
      invoice_number VARCHAR(60) UNIQUE NOT NULL,
      customer_code VARCHAR(60) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      invoice_date DATE NOT NULL,
      due_date DATE NOT NULL,
      amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      status VARCHAR(80) NOT NULL DEFAULT 'Pending',
      payment_date DATE,
      order_number VARCHAR(60),
      notes TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales_quotations (
      id BIGSERIAL PRIMARY KEY,
      quotation_number VARCHAR(60) UNIQUE NOT NULL,
      customer_code VARCHAR(60) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      quotation_date DATE NOT NULL,
      expiry_date DATE NOT NULL,
      amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      status VARCHAR(80) NOT NULL DEFAULT 'Sent',
      conversion_status VARCHAR(80) NOT NULL DEFAULT 'Not Converted',
      notes TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_customers_code ON sales_customers(customer_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_customers_status ON sales_customers(status);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_orders_number ON sales_orders(order_number);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_code ON sales_orders(customer_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_orders_order_date ON sales_orders(order_date DESC);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_invoices_number ON sales_invoices(invoice_number);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_invoices_customer_code ON sales_invoices(customer_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_invoices_status ON sales_invoices(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_invoices_due_date ON sales_invoices(due_date);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_quotations_number ON sales_quotations(quotation_number);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_quotations_customer_code ON sales_quotations(customer_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_quotations_status ON sales_quotations(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_quotations_expiry_date ON sales_quotations(expiry_date);`);
}

async function ensureFinanceTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS finance_income (
      id BIGSERIAL PRIMARY KEY,
      income_code VARCHAR(60) UNIQUE NOT NULL,
      source_name VARCHAR(255) NOT NULL,
      received_date DATE NOT NULL,
      amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      status VARCHAR(80) NOT NULL DEFAULT 'Received',
      reference VARCHAR(255),
      notes TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS finance_expenses (
      id BIGSERIAL PRIMARY KEY,
      expense_code VARCHAR(60) UNIQUE NOT NULL,
      expense_date DATE NOT NULL,
      category VARCHAR(120) NOT NULL,
      description TEXT NOT NULL,
      amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      status VARCHAR(80) NOT NULL DEFAULT 'Pending',
      notes TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS finance_payments (
      id BIGSERIAL PRIMARY KEY,
      payment_code VARCHAR(60) UNIQUE NOT NULL,
      payment_date DATE NOT NULL,
      vendor_name VARCHAR(255) NOT NULL,
      income_code VARCHAR(60),
      amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      payment_method VARCHAR(120) NOT NULL DEFAULT 'Bank Transfer',
      status VARCHAR(80) NOT NULL DEFAULT 'Pending',
      reference VARCHAR(255),
      notes TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'finance_payments'
          AND column_name = 'invoice_number'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'finance_payments'
          AND column_name = 'income_code'
      ) THEN
        ALTER TABLE finance_payments RENAME COLUMN invoice_number TO income_code;
      END IF;
    END
    $$;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'finance_income'
          AND column_name = 'invoice_number'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'finance_income'
          AND column_name = 'income_code'
      ) THEN
        ALTER TABLE finance_income RENAME COLUMN invoice_number TO income_code;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'finance_income'
          AND column_name = 'vendor_name'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'finance_income'
          AND column_name = 'source_name'
      ) THEN
        ALTER TABLE finance_income RENAME COLUMN vendor_name TO source_name;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'finance_income'
          AND column_name = 'invoice_date'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'finance_income'
          AND column_name = 'received_date'
      ) THEN
        ALTER TABLE finance_income RENAME COLUMN invoice_date TO received_date;
      END IF;
    END
    $$;
  `);

  await pool.query(`ALTER TABLE finance_income ADD COLUMN IF NOT EXISTS income_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE finance_income ADD COLUMN IF NOT EXISTS source_name VARCHAR(255);`);
  await pool.query(`ALTER TABLE finance_income ADD COLUMN IF NOT EXISTS received_date DATE;`);
  await pool.query(`ALTER TABLE finance_income ADD COLUMN IF NOT EXISTS amount NUMERIC(14,2) NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE finance_income ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Received';`);
  await pool.query(`ALTER TABLE finance_income ADD COLUMN IF NOT EXISTS reference VARCHAR(255);`);
  await pool.query(`ALTER TABLE finance_income ADD COLUMN IF NOT EXISTS notes TEXT;`);
  await pool.query(`ALTER TABLE finance_income ADD COLUMN IF NOT EXISTS created_by INTEGER;`);
  await pool.query(`ALTER TABLE finance_income ADD COLUMN IF NOT EXISTS updated_by INTEGER;`);
  await pool.query(`ALTER TABLE finance_income ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE finance_income ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

  await pool.query(`ALTER TABLE finance_expenses ADD COLUMN IF NOT EXISTS expense_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE finance_expenses ADD COLUMN IF NOT EXISTS expense_date DATE;`);
  await pool.query(`ALTER TABLE finance_expenses ADD COLUMN IF NOT EXISTS category VARCHAR(120);`);
  await pool.query(`ALTER TABLE finance_expenses ADD COLUMN IF NOT EXISTS description TEXT;`);
  await pool.query(`ALTER TABLE finance_expenses ADD COLUMN IF NOT EXISTS amount NUMERIC(14,2) NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE finance_expenses ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Pending';`);
  await pool.query(`ALTER TABLE finance_expenses ADD COLUMN IF NOT EXISTS notes TEXT;`);
  await pool.query(`ALTER TABLE finance_expenses ADD COLUMN IF NOT EXISTS created_by INTEGER;`);
  await pool.query(`ALTER TABLE finance_expenses ADD COLUMN IF NOT EXISTS updated_by INTEGER;`);
  await pool.query(`ALTER TABLE finance_expenses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE finance_expenses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

  await pool.query(`ALTER TABLE finance_payments ADD COLUMN IF NOT EXISTS payment_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE finance_payments ADD COLUMN IF NOT EXISTS payment_date DATE;`);
  await pool.query(`ALTER TABLE finance_payments ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255);`);
  await pool.query(`ALTER TABLE finance_payments ADD COLUMN IF NOT EXISTS income_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE finance_payments ADD COLUMN IF NOT EXISTS amount NUMERIC(14,2) NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE finance_payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(120) NOT NULL DEFAULT 'Bank Transfer';`);
  await pool.query(`ALTER TABLE finance_payments ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Pending';`);
  await pool.query(`ALTER TABLE finance_payments ADD COLUMN IF NOT EXISTS reference VARCHAR(255);`);
  await pool.query(`ALTER TABLE finance_payments ADD COLUMN IF NOT EXISTS notes TEXT;`);
  await pool.query(`ALTER TABLE finance_payments ADD COLUMN IF NOT EXISTS created_by INTEGER;`);
  await pool.query(`ALTER TABLE finance_payments ADD COLUMN IF NOT EXISTS updated_by INTEGER;`);
  await pool.query(`ALTER TABLE finance_payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE finance_payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'finance_invoices'
      )
      AND EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'finance_income'
      )
      AND NOT EXISTS (SELECT 1 FROM finance_income LIMIT 1) THEN
        INSERT INTO finance_income (income_code, source_name, received_date, amount, status, reference, notes, created_at, updated_at)
        SELECT
          COALESCE(
            NULLIF(REPLACE(COALESCE(fi.invoice_number, ''), 'INV', 'INC'), ''),
            CONCAT('INC-', LPAD(fi.id::text, 5, '0'))
          ) AS income_code,
          COALESCE(NULLIF(fi.vendor_name, ''), 'Unknown Source') AS source_name,
          COALESCE(fi.payment_date, fi.invoice_date, fi.due_date, CURRENT_DATE) AS received_date,
          COALESCE(fi.amount, 0) AS amount,
          CASE
            WHEN LOWER(COALESCE(fi.status, '')) = 'paid' THEN 'Received'
            WHEN LOWER(COALESCE(fi.status, '')) = 'overdue' THEN 'Pending'
            WHEN LOWER(COALESCE(fi.status, '')) = 'pending' THEN 'Pending'
            ELSE 'Received'
          END AS status,
          NULL::VARCHAR(255) AS reference,
          fi.notes,
          COALESCE(fi.created_at, CURRENT_TIMESTAMP) AS created_at,
          COALESCE(fi.updated_at, CURRENT_TIMESTAMP) AS updated_at
        FROM finance_invoices fi
        ON CONFLICT (income_code) DO NOTHING;
      END IF;
    END
    $$;
  `);

  await pool.query(`
    UPDATE finance_income
    SET income_code = CONCAT('INC-', LPAD(id::text, 5, '0'))
    WHERE income_code IS NULL OR TRIM(income_code) = '';
  `);

  await pool.query(`
    UPDATE finance_expenses
    SET expense_code = CONCAT('EXP-', LPAD(id::text, 5, '0'))
    WHERE expense_code IS NULL OR TRIM(expense_code) = '';
  `);

  await pool.query(`
    UPDATE finance_payments
    SET payment_code = CONCAT('PAY-', LPAD(id::text, 5, '0'))
    WHERE payment_code IS NULL OR TRIM(payment_code) = '';
  `);

  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_finance_income_code ON finance_income(income_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_finance_income_status ON finance_income(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_finance_income_received_date ON finance_income(received_date DESC);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_finance_expenses_code ON finance_expenses(expense_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_finance_expenses_category ON finance_expenses(category);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_finance_expenses_status ON finance_expenses(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_finance_expenses_date ON finance_expenses(expense_date DESC);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_finance_payments_code ON finance_payments(payment_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_finance_payments_status ON finance_payments(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_finance_payments_vendor ON finance_payments(vendor_name);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_finance_payments_income ON finance_payments(income_code);`);
}

async function ensureItTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS it_systems (
      id BIGSERIAL PRIMARY KEY,
      system_code VARCHAR(60) UNIQUE NOT NULL,
      system_name VARCHAR(255) NOT NULL,
      ip_address VARCHAR(120) NOT NULL,
      environment VARCHAR(80) NOT NULL DEFAULT 'Production',
      status VARCHAR(80) NOT NULL DEFAULT 'Operational',
      uptime_percent NUMERIC(5,2) NOT NULL DEFAULT 99.50,
      last_checked_at TIMESTAMP,
      notes TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS it_assets (
      id BIGSERIAL PRIMARY KEY,
      asset_code VARCHAR(60) UNIQUE NOT NULL,
      asset_name VARCHAR(255) NOT NULL,
      asset_type VARCHAR(120) NOT NULL,
      model VARCHAR(255),
      serial_number VARCHAR(255),
      assigned_to VARCHAR(255),
      purchase_date DATE,
      status VARCHAR(80) NOT NULL DEFAULT 'Active',
      asset_value NUMERIC(14,2) NOT NULL DEFAULT 0,
      notes TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS it_maintenance (
      id BIGSERIAL PRIMARY KEY,
      maintenance_code VARCHAR(60) UNIQUE NOT NULL,
      asset_code VARCHAR(60),
      asset_name VARCHAR(255) NOT NULL,
      maintenance_type VARCHAR(120) NOT NULL,
      scheduled_date DATE NOT NULL,
      completed_date DATE,
      technician VARCHAR(255),
      priority VARCHAR(80) NOT NULL DEFAULT 'Medium',
      status VARCHAR(80) NOT NULL DEFAULT 'Scheduled',
      notes TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`ALTER TABLE it_systems ADD COLUMN IF NOT EXISTS system_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE it_systems ADD COLUMN IF NOT EXISTS system_name VARCHAR(255);`);
  await pool.query(`ALTER TABLE it_systems ADD COLUMN IF NOT EXISTS ip_address VARCHAR(120);`);
  await pool.query(`ALTER TABLE it_systems ADD COLUMN IF NOT EXISTS environment VARCHAR(80) NOT NULL DEFAULT 'Production';`);
  await pool.query(`ALTER TABLE it_systems ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Operational';`);
  await pool.query(`ALTER TABLE it_systems ADD COLUMN IF NOT EXISTS uptime_percent NUMERIC(5,2) NOT NULL DEFAULT 99.50;`);
  await pool.query(`ALTER TABLE it_systems ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP;`);
  await pool.query(`ALTER TABLE it_systems ADD COLUMN IF NOT EXISTS notes TEXT;`);
  await pool.query(`ALTER TABLE it_systems ADD COLUMN IF NOT EXISTS created_by INTEGER;`);
  await pool.query(`ALTER TABLE it_systems ADD COLUMN IF NOT EXISTS updated_by INTEGER;`);
  await pool.query(`ALTER TABLE it_systems ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE it_systems ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS asset_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS asset_name VARCHAR(255);`);
  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS asset_type VARCHAR(120);`);
  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS model VARCHAR(255);`);
  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS serial_number VARCHAR(255);`);
  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255);`);
  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS purchase_date DATE;`);
  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Active';`);
  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS asset_value NUMERIC(14,2) NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS notes TEXT;`);
  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS created_by INTEGER;`);
  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS updated_by INTEGER;`);
  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE it_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS maintenance_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS asset_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS asset_name VARCHAR(255);`);
  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS maintenance_type VARCHAR(120);`);
  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS scheduled_date DATE;`);
  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS completed_date DATE;`);
  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS technician VARCHAR(255);`);
  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS priority VARCHAR(80) NOT NULL DEFAULT 'Medium';`);
  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Scheduled';`);
  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS notes TEXT;`);
  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS created_by INTEGER;`);
  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS updated_by INTEGER;`);
  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE it_maintenance ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

  await pool.query(`
    UPDATE it_systems
    SET system_code = CONCAT('SYS-', LPAD(id::text, 5, '0'))
    WHERE system_code IS NULL OR TRIM(system_code) = '';
  `);

  await pool.query(`
    UPDATE it_assets
    SET asset_code = CONCAT('AST-', LPAD(id::text, 5, '0'))
    WHERE asset_code IS NULL OR TRIM(asset_code) = '';
  `);

  await pool.query(`
    UPDATE it_maintenance
    SET maintenance_code = CONCAT('MNT-', LPAD(id::text, 5, '0'))
    WHERE maintenance_code IS NULL OR TRIM(maintenance_code) = '';
  `);

  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_it_systems_code ON it_systems(system_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_it_systems_status ON it_systems(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_it_systems_environment ON it_systems(environment);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_it_assets_code ON it_assets(asset_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_it_assets_status ON it_assets(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_it_assets_type ON it_assets(asset_type);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_it_maintenance_code ON it_maintenance(maintenance_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_it_maintenance_status ON it_maintenance(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_it_maintenance_scheduled_date ON it_maintenance(scheduled_date DESC);`);
}

async function ensureSupportTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_customers (
      id BIGSERIAL PRIMARY KEY,
      customer_code VARCHAR(60) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      company VARCHAR(255),
      industry VARCHAR(120),
      account_type VARCHAR(80) NOT NULL DEFAULT 'Standard',
      status VARCHAR(80) NOT NULL DEFAULT 'Active',
      notes TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id BIGSERIAL PRIMARY KEY,
      ticket_number VARCHAR(60) UNIQUE NOT NULL,
      customer_code VARCHAR(60) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(120) NOT NULL,
      priority VARCHAR(80) NOT NULL DEFAULT 'Medium',
      status VARCHAR(80) NOT NULL DEFAULT 'Open',
      assigned_to VARCHAR(255),
      resolution_summary TEXT,
      response_count INTEGER NOT NULL DEFAULT 0,
      first_response_at TIMESTAMP,
      resolved_at TIMESTAMP,
      satisfaction_rating INTEGER,
      sla_response_minutes INTEGER DEFAULT 240,
      sla_resolution_hours INTEGER DEFAULT 72,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_responses (
      id BIGSERIAL PRIMARY KEY,
      response_code VARCHAR(60) UNIQUE NOT NULL,
      ticket_number VARCHAR(60) NOT NULL,
      author_name VARCHAR(255) NOT NULL,
      author_email VARCHAR(255),
      author_role VARCHAR(80) NOT NULL,
      content TEXT NOT NULL,
      response_type VARCHAR(80) NOT NULL DEFAULT 'Note',
      is_internal BOOLEAN NOT NULL DEFAULT false,
      attachments_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_knowledge_base (
      id BIGSERIAL PRIMARY KEY,
      kb_code VARCHAR(60) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(120) NOT NULL,
      keywords_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      views INTEGER NOT NULL DEFAULT 0,
      is_published BOOLEAN NOT NULL DEFAULT false,
      helpful_count INTEGER NOT NULL DEFAULT 0,
      not_helpful_count INTEGER NOT NULL DEFAULT 0,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_support_customers_code ON support_customers(customer_code);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_support_tickets_number ON support_tickets(ticket_number);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_customer ON support_tickets(customer_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_support_responses_code ON support_responses(response_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_support_responses_ticket ON support_responses(ticket_number);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_support_kb_code ON support_knowledge_base(kb_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_support_kb_published ON support_knowledge_base(is_published);`);
}

async function ensureInventoryTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_products (
      id BIGSERIAL PRIMARY KEY,
      product_code VARCHAR(60) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(180) NOT NULL,
      sku VARCHAR(120) UNIQUE NOT NULL,
      unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
      stock_qty INTEGER NOT NULL DEFAULT 0,
      reorder_level INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(80) NOT NULL DEFAULT 'Active',
      description TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_categories (
      id BIGSERIAL PRIMARY KEY,
      category_code VARCHAR(60) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      parent_category VARCHAR(255),
      status VARCHAR(80) NOT NULL DEFAULT 'Active',
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_stock (
      id BIGSERIAL PRIMARY KEY,
      stock_code VARCHAR(60) UNIQUE NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      sku VARCHAR(120) NOT NULL,
      warehouse_name VARCHAR(255) NOT NULL,
      on_hand INTEGER NOT NULL DEFAULT 0,
      reserved_qty INTEGER NOT NULL DEFAULT 0,
      reorder_level INTEGER NOT NULL DEFAULT 0,
      reorder_qty INTEGER NOT NULL DEFAULT 0,
      last_counted_at DATE,
      status VARCHAR(80) NOT NULL DEFAULT 'Active',
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_suppliers (
      id BIGSERIAL PRIMARY KEY,
      supplier_code VARCHAR(60) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      contact_person VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      city VARCHAR(120),
      country VARCHAR(120),
      gst_number VARCHAR(120),
      payment_terms VARCHAR(180),
      status VARCHAR(80) NOT NULL DEFAULT 'Active',
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_warehouses (
      id BIGSERIAL PRIMARY KEY,
      warehouse_code VARCHAR(60) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 0,
      occupied INTEGER NOT NULL DEFAULT 0,
      manager_name VARCHAR(255),
      status VARCHAR(80) NOT NULL DEFAULT 'Active',
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id BIGSERIAL PRIMARY KEY,
      po_number VARCHAR(60) UNIQUE NOT NULL,
      supplier_name VARCHAR(255) NOT NULL,
      warehouse_name VARCHAR(255) NOT NULL,
      items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      order_date DATE NOT NULL,
      due_date DATE NOT NULL,
      status VARCHAR(80) NOT NULL DEFAULT 'Pending',
      notes TEXT,
      pdf_generated_at TIMESTAMP,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_adjustments (
      id BIGSERIAL PRIMARY KEY,
      adjustment_code VARCHAR(60) UNIQUE NOT NULL,
      adjustment_date DATE NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      warehouse_name VARCHAR(255) NOT NULL,
      adjustment_type VARCHAR(120) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      reason TEXT,
      approved_by VARCHAR(255),
      status VARCHAR(80) NOT NULL DEFAULT 'Pending',
      created_by INTEGER,
      updated_by INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`ALTER TABLE inventory_products ADD COLUMN IF NOT EXISTS product_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE inventory_products ADD COLUMN IF NOT EXISTS name VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_products ADD COLUMN IF NOT EXISTS category VARCHAR(180);`);
  await pool.query(`ALTER TABLE inventory_products ADD COLUMN IF NOT EXISTS sku VARCHAR(120);`);
  await pool.query(`ALTER TABLE inventory_products ADD COLUMN IF NOT EXISTS unit_price NUMERIC(14,2) NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE inventory_products ADD COLUMN IF NOT EXISTS stock_qty INTEGER NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE inventory_products ADD COLUMN IF NOT EXISTS reorder_level INTEGER NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE inventory_products ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Active';`);
  await pool.query(`ALTER TABLE inventory_products ADD COLUMN IF NOT EXISTS description TEXT;`);
  await pool.query(`ALTER TABLE inventory_products ADD COLUMN IF NOT EXISTS created_by INTEGER;`);
  await pool.query(`ALTER TABLE inventory_products ADD COLUMN IF NOT EXISTS updated_by INTEGER;`);
  await pool.query(`ALTER TABLE inventory_products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE inventory_products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

  await pool.query(`ALTER TABLE inventory_categories ADD COLUMN IF NOT EXISTS category_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE inventory_categories ADD COLUMN IF NOT EXISTS name VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_categories ADD COLUMN IF NOT EXISTS description TEXT;`);
  await pool.query(`ALTER TABLE inventory_categories ADD COLUMN IF NOT EXISTS parent_category VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_categories ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Active';`);
  await pool.query(`ALTER TABLE inventory_categories ADD COLUMN IF NOT EXISTS created_by INTEGER;`);
  await pool.query(`ALTER TABLE inventory_categories ADD COLUMN IF NOT EXISTS updated_by INTEGER;`);
  await pool.query(`ALTER TABLE inventory_categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE inventory_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS stock_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS sku VARCHAR(120);`);
  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS warehouse_name VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS on_hand INTEGER NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS reserved_qty INTEGER NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS reorder_level INTEGER NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS reorder_qty INTEGER NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS last_counted_at DATE;`);
  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Active';`);
  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS created_by INTEGER;`);
  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS updated_by INTEGER;`);
  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE inventory_stock ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS supplier_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS name VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS email VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`);
  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS city VARCHAR(120);`);
  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS country VARCHAR(120);`);
  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS gst_number VARCHAR(120);`);
  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(180);`);
  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Active';`);
  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS created_by INTEGER;`);
  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS updated_by INTEGER;`);
  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE inventory_suppliers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

  await pool.query(`ALTER TABLE inventory_warehouses ADD COLUMN IF NOT EXISTS warehouse_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE inventory_warehouses ADD COLUMN IF NOT EXISTS name VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_warehouses ADD COLUMN IF NOT EXISTS location VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_warehouses ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE inventory_warehouses ADD COLUMN IF NOT EXISTS occupied INTEGER NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE inventory_warehouses ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_warehouses ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Active';`);
  await pool.query(`ALTER TABLE inventory_warehouses ADD COLUMN IF NOT EXISTS created_by INTEGER;`);
  await pool.query(`ALTER TABLE inventory_warehouses ADD COLUMN IF NOT EXISTS updated_by INTEGER;`);
  await pool.query(`ALTER TABLE inventory_warehouses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE inventory_warehouses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS po_number VARCHAR(60);`);
  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255);`);
  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS warehouse_name VARCHAR(255);`);
  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS items_json JSONB NOT NULL DEFAULT '[]'::jsonb;`);
  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS amount NUMERIC(14,2) NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS order_date DATE;`);
  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS due_date DATE;`);
  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Pending';`);
  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS notes TEXT;`);
  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMP;`);
  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS created_by INTEGER;`);
  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS updated_by INTEGER;`);
  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

  await pool.query(`ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS adjustment_code VARCHAR(60);`);
  await pool.query(`ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS adjustment_date DATE;`);
  await pool.query(`ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS warehouse_name VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS adjustment_type VARCHAR(120);`);
  await pool.query(`ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 0;`);
  await pool.query(`ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS reason TEXT;`);
  await pool.query(`ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);`);
  await pool.query(`ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS status VARCHAR(80) NOT NULL DEFAULT 'Pending';`);
  await pool.query(`ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS created_by INTEGER;`);
  await pool.query(`ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS updated_by INTEGER;`);
  await pool.query(`ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;`);

  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_products_code ON inventory_products(product_code);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_products_sku ON inventory_products(sku);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_inventory_products_category ON inventory_products(category);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_categories_code ON inventory_categories(category_code);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_stock_code ON inventory_stock(stock_code);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_inventory_stock_sku ON inventory_stock(sku);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_suppliers_code ON inventory_suppliers(supplier_code);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_warehouses_code ON inventory_warehouses(warehouse_code);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_orders_number ON purchase_orders(po_number);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_adjustments_code ON inventory_adjustments(adjustment_code);`);
}

async function seedDemoUsers() {
  const seededUsers = [];

  for (const user of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await pool.query(
      `
        INSERT INTO users (
          email,
          password_hash,
          first_name,
          last_name,
          role,
          is_active,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP)
        ON CONFLICT (email)
        DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          role = EXCLUDED.role,
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
      `,
      [user.email, passwordHash, user.firstName, user.lastName, user.role],
    );

    seededUsers.push({
      module: user.module,
      role: user.role,
      email: user.email,
      password: user.password,
    });
  }

  return seededUsers;
}

async function seedModuleCatalog() {
  for (const moduleItem of DEMO_MODULE_CATALOG) {
    await pool.query(
      `
        INSERT INTO module_catalog (
          module_key,
          label,
          is_active,
          price,
          updated_at
        )
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (module_key)
        DO UPDATE SET
          label = EXCLUDED.label,
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        moduleItem.key,
        moduleItem.label,
        moduleItem.isActive,
        moduleItem.price,
      ],
    );
  }
}

async function initializeDatabase() {
  await ensureUsersTable();
  await ensureModuleCatalogTable();
  await ensureAccessRequestsTable();
  await ensureEmployeesTable();
  await ensureDepartmentsTable();
  await ensureLeaveRequestsTable();
  await ensureRecruitmentCandidatesTable();
  await ensureHrDocumentsTable();
  await ensureTrainingProgramsTable();
  await ensurePayrollRecordsTable();
  await ensureSalesTables();
  await ensureFinanceTables();
  await ensureItTables();
  await ensureInventoryTables();
  await ensureSupportTables();
  const seededUsers = await seedDemoUsers();
  await seedModuleCatalog();

  console.log('Seeded role-based demo accounts:');
  seededUsers.forEach((user) => {
    console.log(`  - ${user.module} (${user.role}): ${user.email} / ${user.password}`);
  });
}

module.exports = {
  initializeDatabase,
  DEMO_USERS,
  DEMO_MODULE_CATALOG,
};
