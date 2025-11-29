-- ============================================================
-- LAWBiX - Corporate Legal Engine
-- Seed Data v1.0.0
-- Demo/Development Data
-- ============================================================

-- Clear existing data (optional - use with caution in production)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE chat_history;
TRUNCATE TABLE diagnosis_results;
TRUNCATE TABLE documents;
TRUNCATE TABLE roadmap_items;
TRUNCATE TABLE risks;
TRUNCATE TABLE company_partners;
TRUNCATE TABLE companies;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- USERS
-- ============================================================

-- Password for all demo users: "demo123"
-- Bcrypt hash: $2a$10$vE.rQ3mrzbfpyE.G4HlRGu5PFmjwyEfy/3eKEBppGW6p3Ip1bMxy.2

INSERT INTO users (id, name, email, password, role, company_id, created_at) VALUES
(1, 'Demo Admin', 'demo@lawbix.com', '$2a$10$vE.rQ3mrzbfpyE.G4HlRGu5PFmjwyEfy/3eKEBppGW6p3Ip1bMxy.2', 'admin', NULL, NOW()),
(2, 'María González', 'maria.gonzalez@techcorp.com', '$2a$10$vE.rQ3mrzbfpyE.G4HlRGu5PFmjwyEfy/3eKEBppGW6p3Ip1bMxy.2', 'client', NULL, NOW()),
(3, 'Carlos Rodríguez', 'carlos.rodriguez@lawfirm.com', '$2a$10$vE.rQ3mrzbfpyE.G4HlRGu5PFmjwyEfy/3eKEBppGW6p3Ip1bMxy.2', 'lawyer', NULL, NOW());

-- ============================================================
-- COMPANIES
-- ============================================================

INSERT INTO companies (id, user_id, name, industry, employee_count, incorporation_date, country, corporate_vehicle, created_at) VALUES
(1, 2, 'TechCorp Solutions S.A.S.', 'Tecnología', 45, '2020-03-15', 'Colombia', 'SAS', NOW()),
(2, 1, 'LAWBiX Demo Company', 'Servicios Legales', 10, '2023-01-10', 'México', 'S.A. de C.V.', NOW());

-- Update users with company_id
UPDATE users SET company_id = 1 WHERE id = 2;
UPDATE users SET company_id = 2 WHERE id = 1;

-- ============================================================
-- COMPANY PARTNERS
-- ============================================================

INSERT INTO company_partners (company_id, name, ownership_percentage, role, created_at) VALUES
(1, 'María González', 60.00, 'CEO', NOW()),
(1, 'Juan Pérez', 30.00, 'CTO', NOW()),
(1, 'Ana Martínez', 10.00, 'CFO', NOW());

-- ============================================================
-- RISKS
-- ============================================================

INSERT INTO risks (company_id, title, description, category, severity, probability, impact, status, mitigation, created_at) VALUES
(1, 'Contratos laborales sin formalizar',
 'Algunos empleados no cuentan con contrato escrito, lo que genera riesgo de sanciones laborales y demandas.',
 'Laboral', 'high', 'high', 'Alto', 'open',
 'Formalizar contratos inmediatamente y revisar cumplimiento de seguridad social',
 NOW()),

(1, 'Marca comercial sin registro',
 'La marca \"TechCorp\" no está registrada ante la autoridad competente, existe riesgo de uso no autorizado por terceros.',
 'Propiedad Intelectual', 'medium', 'medium', 'Medio', 'in_progress',
 'Iniciar trámite de registro de marca ante la Superintendencia de Industria y Comercio',
 NOW()),

(1, 'Política de datos personales pendiente',
 'No se cuenta con política de tratamiento de datos personales conforme a la Ley 1581 de 2012.',
 'Protección de Datos', 'high', 'high', 'Alto', 'open',
 'Elaborar e implementar política de privacidad y registro ante la SIC como responsable del tratamiento',
 NOW()),

(1, 'Atrasos en declaraciones fiscales',
 'Se han presentado retrasos en las últimas 2 declaraciones de IVA.',
 'Fiscal', 'medium', 'low', 'Medio', 'mitigated',
 'Implementar calendario tributario automatizado y contratar contador certificado',
 NOW());

-- ============================================================
-- ROADMAP ITEMS
-- ============================================================

INSERT INTO roadmap_items (company_id, title, description, priority, due_date, category, status, created_at) VALUES
(1, 'Formalización de contratos laborales',
 'Revisar y formalizar todos los contratos de trabajo pendientes. Incluye verificación de afiliaciones a seguridad social.',
 'critical', DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'Laboral', 'in_progress', NOW()),

(1, 'Registro de marca comercial',
 'Presentar solicitud de registro de marca \"TechCorp\" en clase 42 (servicios tecnológicos).',
 'high', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Propiedad Intelectual', 'pending', NOW()),

(1, 'Implementación de política de datos',
 'Elaborar política de tratamiento de datos personales y obtener autorizaciones de clientes y empleados.',
 'high', DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'Protección de Datos', 'pending', NOW()),

(1, 'Auditoría de cumplimiento fiscal',
 'Realizar auditoría completa de obligaciones tributarias y corregir inconsistencias.',
 'medium', DATE_ADD(CURDATE(), INTERVAL 45 DAY), 'Fiscal', 'pending', NOW()),

(1, 'Implementación de SG-SST',
 'Diseñar e implementar Sistema de Gestión de Seguridad y Salud en el Trabajo.',
 'high', DATE_ADD(CURDATE(), INTERVAL 60 DAY), 'Laboral', 'pending', NOW());

-- ============================================================
-- DIAGNOSIS RESULTS
-- ============================================================

INSERT INTO diagnosis_results (company_id, compliance_score, risk_level, answers_data, recommendations, created_at) VALUES
(1, 68, 'medio',
 '[{"question_id":1,"answer":"Sí, completamente"},{"question_id":2,"answer":"Parcialmente"},{"question_id":3,"answer":"Sí"},{"question_id":4,"answer":"Algunos"},{"question_id":5,"answer":"Sí"},{"question_id":6,"answer":"No"},{"question_id":7,"answer":"Parcialmente"},{"question_id":8,"answer":"Sí, siempre"},{"question_id":9,"answer":"Sí"},{"question_id":10,"answer":"Sí"},{"question_id":11,"answer":"En trámite"},{"question_id":12,"answer":"Parcialmente"},{"question_id":13,"answer":"Solo con algunos"},{"question_id":14,"answer":"En desarrollo"},{"question_id":15,"answer":"No"}]',
 'Se recomienda priorizar: 1) Formalización de contratos laborales, 2) Implementación de política de datos personales, 3) Registro de marca comercial.',
 NOW());

-- ============================================================
-- DOCUMENTS (Sample - actual files would need to be generated)
-- ============================================================

INSERT INTO documents (company_id, name, type, url, template_id, created_at) VALUES
(1, 'Diagnóstico Legal Profesional', 'PDF', '/documents/diagnostico_techcorp_20250128.pdf', 'diagnosis_report', NOW()),
(1, 'Matriz de Riesgos', 'PDF', '/documents/matriz_riesgos_techcorp_20250128.pdf', 'risk_matrix', NOW());

-- ============================================================
-- CHAT HISTORY (Sample conversation)
-- ============================================================

INSERT INTO chat_history (user_id, message, sender, created_at) VALUES
(2, 'Hola, necesito ayuda con contratos laborales', 'user', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 'Los contratos son fundamentales para formalizar relaciones comerciales. Te recomiendo revisar que todos tus contratos incluyan: objeto, obligaciones, plazo, valor y cláusulas de terminación. ¿Necesitas ayuda con algún tipo específico de contrato (laboral, comercial, confidencialidad)?', 'bot', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 'Sí, necesito formalizar contratos laborales para 5 empleados', 'user', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 'En materia laboral, es crucial: 1) Tener contratos escritos, 2) Estar al día con seguridad social, 3) Cumplir horarios y salarios mínimos, 4) Implementar SG-SST. ¿Tienes alguna duda específica sobre contratación o derechos laborales?', 'bot', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 'Gracias, muy útil', 'user', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, '¡Con gusto! Si tienes más dudas legales, aquí estaré para ayudarte. También puedes explorar las secciones de Diagnóstico y Documentos para un análisis más profundo. 😊', 'bot', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Display inserted data summary
SELECT 'Seed Data Inserted Successfully!' AS Status;

SELECT 'USERS' AS Table_Name, COUNT(*) AS Record_Count FROM users
UNION ALL
SELECT 'COMPANIES', COUNT(*) FROM companies
UNION ALL
SELECT 'COMPANY_PARTNERS', COUNT(*) FROM company_partners
UNION ALL
SELECT 'RISKS', COUNT(*) FROM risks
UNION ALL
SELECT 'ROADMAP_ITEMS', COUNT(*) FROM roadmap_items
UNION ALL
SELECT 'DOCUMENTS', COUNT(*) FROM documents
UNION ALL
SELECT 'DIAGNOSIS_RESULTS', COUNT(*) FROM diagnosis_results
UNION ALL
SELECT 'CHAT_HISTORY', COUNT(*) FROM chat_history;

-- Display demo user credentials
SELECT
  '=== DEMO CREDENTIALS ===' AS Info,
  'Email: demo@lawbix.com' AS Credential_1,
  'Password: demo123' AS Credential_2,
  'Role: admin' AS Credential_3;
