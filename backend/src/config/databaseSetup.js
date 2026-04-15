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
  await ensurePayrollRecordsTable();
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
