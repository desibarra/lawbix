-- LAWBiX Schema for Supabase PostgreSQL
-- Converted from MySQL

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50),
    industry VARCHAR(100),
    employees INTEGER,
    founded_date DATE,
    description TEXT,
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'México',
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partners table
CREATE TABLE company_partners (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    ownership_percentage DECIMAL(5,2),
    role VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risks table
CREATE TABLE risks (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'active',
    mitigation_plan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roadmap items table
CREATE TABLE roadmap_items (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'pending',
    due_date DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    content TEXT,
    file_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diagnosis results table
CREATE TABLE diagnosis_results (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    score INTEGER,
    recommendations TEXT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat history table
CREATE TABLE chat_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity log table
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_risks_company_id ON risks(company_id);
CREATE INDEX idx_roadmap_company_id ON roadmap_items(company_id);
CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_activity_user_id ON activity_log(user_id);

-- Insert demo users (passwords are bcrypt hashed for 'demo123')
INSERT INTO users (email, password, name, role) VALUES
('demo@lawbix.com', '$2a$10$vE.rQ3mrzbfpyE.G4HlRGu5PFmjwyEfy/3eKEBppGW6p3Ip1bMxy.2', 'Demo Admin', 'admin'),
('maria.gonzalez@techcorp.com', '$2a$10$vE.rQ3mrzbfpyE.G4HlRGu5PFmjwyEfy/3eKEBppGW6p3Ip1bMxy.2', 'María González', 'client'),
('carlos.rodriguez@lawfirm.com', '$2a$10$vE.rQ3mrzbfpyE.G4HlRGu5PFmjwyEfy/3eKEBppGW6p3Ip1bMxy.2', 'Carlos Rodríguez', 'lawyer');

-- Insert demo company
INSERT INTO companies (user_id, name, legal_name, tax_id, industry, employees, description, country) VALUES
(2, 'TechCorp Solutions', 'TechCorp Solutions S.A. de C.V.', 'TCS123456789', 'Tecnología', 50, 'Empresa de desarrollo de software', 'México');

-- Insert demo risks
INSERT INTO risks (company_id, category, title, description, severity, status) VALUES
(1, 'Legal', 'Falta de contratos laborales actualizados', 'Los contratos laborales no cumplen con la nueva legislación', 'high', 'active'),
(1, 'Compliance', 'Política de privacidad desactualizada', 'La política de privacidad no cumple con GDPR', 'medium', 'active');

-- Insert demo roadmap items
INSERT INTO roadmap_items (company_id, title, description, category, priority, status) VALUES
(1, 'Actualizar contratos laborales', 'Revisar y actualizar todos los contratos con la nueva legislación', 'Legal', 'high', 'in_progress'),
(1, 'Implementar política GDPR', 'Crear e implementar política de privacidad conforme a GDPR', 'Compliance', 'high', 'pending');
