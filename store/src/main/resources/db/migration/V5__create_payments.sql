-- V5__create_payments.sql
-- WB-Store Payments and Sequences Schema

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    invoice_id INTEGER REFERENCES invoices(id),
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_mode VARCHAR(30) NOT NULL DEFAULT 'CASH',
    reference_number VARCHAR(100),
    notes TEXT,
    payment_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    received_by INTEGER REFERENCES users(id),
    receipt_no VARCHAR(50) UNIQUE,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS payment_sequences (
    financial_year VARCHAR(20) PRIMARY KEY,
    last_number BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_receipt_no ON payments(receipt_no);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
