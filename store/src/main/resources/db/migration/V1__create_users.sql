-- V1__create_users.sql
-- WB-Store Users and Roles Schema

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITHOUT TIME ZONE,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Seed Initial Roles
INSERT INTO roles (name, created_at, is_deleted)
VALUES 
    ('ADMIN', CURRENT_TIMESTAMP, FALSE),
    ('MANAGER', CURRENT_TIMESTAMP, FALSE),
    ('BILLING_STAFF', CURRENT_TIMESTAMP, FALSE)
ON CONFLICT (name) DO NOTHING;

-- Seed Default Admin User (Password: Admin@123)
-- BCrypt hash: $2a$10$7Z2v8/y6uD.0i8mH6d4mne6h8e0V70C96rP53r0b5n9aVl0w2/YlG
INSERT INTO users (full_name, username, email, password, phone, active, created_at, is_deleted)
VALUES (
    'System Administrator',
    'admin',
    'admin@wbstore.com',
    '$2a$10$c1Geq5d2Xj801V0H4Z8r3e4YcZzP2P3yLw9/R7rY4N6uM1l5jFkXW',
    '9999999999',
    TRUE,
    CURRENT_TIMESTAMP,
    FALSE
)
ON CONFLICT (username) DO NOTHING;

-- Assign ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.username = 'admin' AND r.name = 'ADMIN'
ON CONFLICT DO NOTHING;
