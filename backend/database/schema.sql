-- ============================================================
-- LAWBiX - Corporate Legal Engine
-- Database Schema v1.0.0
-- MySQL 8.0+ / MariaDB 10.4+
-- ============================================================

-- Drop existing tables (if recreating)
DROP TABLE IF EXISTS chat_history;
DROP TABLE IF EXISTS diagnosis_results;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS roadmap_items;
DROP TABLE IF EXISTS risks;
DROP TABLE IF EXISTS company_partners;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;

-- ============================================================
-- TABLE: users
-- Description: User authentication and profiles
-- ============================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
  role ENUM('admin', 'lawyer', 'client', 'user') DEFAULT 'user',
  company_id INT NULL COMMENT 'Foreign key to companies table',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_company_id (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: companies
-- Description: Corporate entities managed in the system
-- ============================================================
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT 'Owner/creator of the company',
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255) NULL,
  employee_count INT NULL,
  incorporation_date DATE NULL,
  country VARCHAR(100) NULL,
  corporate_vehicle VARCHAR(100) NULL COMMENT 'Legal structure (SAS, SA, LLC, etc.)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_company (user_id),
  INDEX idx_name (name),
  INDEX idx_industry (industry),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: company_partners
-- Description: Shareholders/partners of companies
-- ============================================================
CREATE TABLE company_partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  ownership_percentage DECIMAL(5,2) NULL COMMENT 'Percentage of ownership (0.00 to 100.00)',
  role VARCHAR(100) NULL COMMENT 'Role in company (CEO, CFO, Partner, etc.)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_company_id (company_id),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: risks
-- Description: Legal and compliance risks identified
-- ============================================================
CREATE TABLE risks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category VARCHAR(100) NULL COMMENT 'Laboral, Fiscal, Propiedad Intelectual, etc.',
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  probability ENUM('low', 'medium', 'high') DEFAULT 'medium',
  impact VARCHAR(50) NULL,
  status ENUM('open', 'in_progress', 'mitigated', 'closed') DEFAULT 'open',
  mitigation TEXT NULL COMMENT 'Mitigation strategy',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company_id (company_id),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: roadmap_items
-- Description: Strategic roadmap tasks and milestones
-- ============================================================
CREATE TABLE roadmap_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NULL,
  user_id INT NULL COMMENT 'For user-specific roadmaps',
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  due_date DATE NULL,
  category VARCHAR(100) NULL,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company_id (company_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: documents
-- Description: Generated legal documents and reports
-- ============================================================
CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT 'PDF, DOCX, etc.',
  url VARCHAR(500) NOT NULL COMMENT 'Relative path: /documents/filename.pdf',
  file_path VARCHAR(500) NULL COMMENT 'Physical path on server',
  template_id VARCHAR(100) NULL COMMENT 'Template used for generation',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_company_id (company_id),
  INDEX idx_type (type),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: diagnosis_results
-- Description: Corporate legal diagnosis results
-- ============================================================
CREATE TABLE diagnosis_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  compliance_score INT NOT NULL COMMENT 'Percentage 0-100',
  risk_level ENUM('bajo', 'medio', 'alto', 'crítico') DEFAULT 'medio',
  answers_data JSON NULL COMMENT 'JSON array of question answers',
  recommendations TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_company_id (company_id),
  INDEX idx_risk_level (risk_level),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: chat_history
-- Description: Chatbot conversation history
-- ============================================================
CREATE TABLE chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  sender ENUM('user', 'bot') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VIEWS (Optional - for reporting)
-- ============================================================

-- View: Company risk summary
CREATE OR REPLACE VIEW v_company_risk_summary AS
SELECT
  c.id AS company_id,
  c.name AS company_name,
  COUNT(r.id) AS total_risks,
  SUM(CASE WHEN r.severity = 'critical' THEN 1 ELSE 0 END) AS critical_risks,
  SUM(CASE WHEN r.severity = 'high' THEN 1 ELSE 0 END) AS high_risks,
  SUM(CASE WHEN r.severity = 'medium' THEN 1 ELSE 0 END) AS medium_risks,
  SUM(CASE WHEN r.severity = 'low' THEN 1 ELSE 0 END) AS low_risks,
  SUM(CASE WHEN r.status = 'open' THEN 1 ELSE 0 END) AS open_risks
FROM companies c
LEFT JOIN risks r ON c.id = r.company_id
GROUP BY c.id, c.name;

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_risks_company_severity ON risks(company_id, severity);
CREATE INDEX idx_roadmap_company_status ON roadmap_items(company_id, status);
CREATE INDEX idx_documents_company_created ON documents(company_id, created_at DESC);

-- ============================================================
-- INITIAL SETUP COMPLETE
-- ============================================================

-- Display table summary
SELECT 'LAWBiX Database Schema Created Successfully!' AS Status;
SELECT
  TABLE_NAME,
  TABLE_ROWS,
  ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('users', 'companies', 'company_partners', 'risks', 'roadmap_items', 'documents', 'diagnosis_results', 'chat_history')
ORDER BY TABLE_NAME;
