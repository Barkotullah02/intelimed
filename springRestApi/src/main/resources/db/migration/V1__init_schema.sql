-- V1: Initial schema for IntelliMeds

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles join table
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(500),
    weight DOUBLE PRECISION,
    height DOUBLE PRECISION,
    allergies TEXT,
    chronic_diseases TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    blood_group VARCHAR(10),
    specialization VARCHAR(100),
    license_number VARCHAR(100),
    hospital VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drug categories table
CREATE TABLE drug_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Drugs table
CREATE TABLE drugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generic_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    manufacturer_name VARCHAR(255),
    description TEXT,
    uses TEXT,
    dosage_form VARCHAR(100),
    dosage TEXT,
    side_effects TEXT,
    contraindications TEXT,
    pregnancy_safety VARCHAR(100),
    storage TEXT,
    image_url VARCHAR(500),
    category_id UUID REFERENCES drug_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drug alternatives table
CREATE TABLE drug_alternatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id UUID REFERENCES drugs(id) ON DELETE CASCADE,
    alternative_drug_id UUID REFERENCES drugs(id) ON DELETE CASCADE,
    alternative_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drug interactions table
CREATE TABLE drug_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_a_id UUID REFERENCES drugs(id) ON DELETE CASCADE,
    drug_b_id UUID REFERENCES drugs(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL,
    description TEXT,
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interaction history table
CREATE TABLE interaction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    drug_ids TEXT,
    result_summary TEXT,
    highest_severity VARCHAR(20),
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI providers table
CREATE TABLE ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    provider_type VARCHAR(50) NOT NULL,
    api_endpoint VARCHAR(500),
    api_key VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_selected BOOLEAN DEFAULT FALSE
);

-- AI history table
CREATE TABLE ai_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    provider VARCHAR(100),
    request_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat history table
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message_role VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medication reminders table
CREATE TABLE medication_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    drug_id UUID REFERENCES drugs(id) ON DELETE CASCADE,
    reminder_time TIME NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    dosage VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    notification_enabled BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medication history table
CREATE TABLE medication_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    drug_id UUID REFERENCES drugs(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20),
    dosage VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE,
    hospital VARCHAR(255),
    experience_years INTEGER,
    consultation_fee DOUBLE PRECISION,
    bio TEXT,
    verified BOOLEAN DEFAULT FALSE,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    reason TEXT,
    notes TEXT,
    consultation_fee DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Education contents table
CREATE TABLE education_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    content_type VARCHAR(20),
    file_url VARCHAR(500),
    video_url VARCHAR(500),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(100),
    is_published BOOLEAN DEFAULT TRUE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (id, name) VALUES
    (gen_random_uuid(), 'ROLE_PATIENT'),
    (gen_random_uuid(), 'ROLE_HEALTHCARE_PROFESSIONAL'),
    (gen_random_uuid(), 'ROLE_ADMIN');

-- Insert default AI providers
INSERT INTO ai_providers (id, name, provider_type, is_active, is_selected) VALUES
    (gen_random_uuid(), 'Offline LLM', 'OFFLINE', TRUE, TRUE),
    (gen_random_uuid(), 'Gemini', 'GEMINI', TRUE, FALSE),
    (gen_random_uuid(), 'OpenAI', 'OPENAI', TRUE, FALSE),
    (gen_random_uuid(), 'Ollama', 'OLLAMA', TRUE, FALSE);
