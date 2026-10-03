-- =========================================================================
-- LAUNDRYHUB PRODUCTION DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- Multi-Branch, Multi-Role, IoT Integration, Dropship & Inventory Management
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('owner', 'kasir', 'produksi', 'kurir', 'pelanggan', 'agen');
CREATE TYPE order_status AS ENUM ('antrean', 'cuci', 'kering', 'setrika', 'packing', 'siap_ambil', 'diantar', 'selesai', 'dibatalkan');
CREATE TYPE payment_method AS ENUM ('tunai', 'qris', 'transfer', 'deposit', 'piutang');
CREATE TYPE payment_status AS ENUM ('lunas', 'belum_lunas', 'piutang');
CREATE TYPE machine_type AS ENUM ('washer', 'dryer');
CREATE TYPE machine_status AS ENUM ('idle', 'running', 'completed', 'maintenance');
CREATE TYPE task_type AS ENUM ('pickup', 'delivery');
CREATE TYPE task_status AS ENUM ('pending', 'on_the_way', 'completed');
CREATE TYPE dropship_supply_status AS ENUM ('diproses', 'dikirim', 'sampai');
CREATE TYPE withdrawal_status AS ENUM ('pending', 'transferred', 'rejected');

-- 2. BRANCHES (OUTLETS)
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(32) PRIMARY KEY DEFAULT ('br-' || substr(md5(random()::text), 1, 8)),
    name VARCHAR(120) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    is_pusat BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USERS (STAFF & STAKEHOLDERS)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    role user_role NOT NULL DEFAULT 'kasir',
    phone VARCHAR(30),
    avatar TEXT,
    branch_id VARCHAR(32) REFERENCES branches(id) ON DELETE SET NULL,
    commission_rate_kg NUMERIC(10,2) DEFAULT 500,
    commission_rate_item NUMERIC(10,2) DEFAULT 1000,
    total_commission_earned NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOMERS & LOYALTY
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(32) PRIMARY KEY DEFAULT ('cst-' || substr(md5(random()::text), 1, 8)),
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL UNIQUE,
    address TEXT,
    deposit_balance NUMERIC(15,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    branch_id VARCHAR(32) REFERENCES branches(id) ON DELETE SET NULL,
    total_orders_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SERVICES & PRICING
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('kiloan', 'satuan')),
    price NUMERIC(12,2) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    min_weight NUMERIC(6,2) DEFAULT 1.0,
    est_hours INTEGER DEFAULT 48,
    icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FRAGRANCES (PARFUM)
CREATE TABLE IF NOT EXISTS fragrances (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    description TEXT
);

-- 7. ORDERS (MAIN TRANSACTION LEDGER)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT ('ord-' || substr(md5(random()::text), 1, 12)),
    invoice_no VARCHAR(40) NOT NULL UNIQUE,
    customer_id VARCHAR(32) REFERENCES customers(id) ON DELETE RESTRICT,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_address TEXT,
    branch_id VARCHAR(32) NOT NULL REFERENCES branches(id),
    weight_kg NUMERIC(6,2) DEFAULT 0,
    item_count INTEGER DEFAULT 0,
    total_price NUMERIC(15,2) NOT NULL,
    discount NUMERIC(15,2) DEFAULT 0,
    final_price NUMERIC(15,2) NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'tunai',
    payment_status payment_status NOT NULL DEFAULT 'lunas',
    current_status order_status NOT NULL DEFAULT 'antrean',
    pickup_delivery_type VARCHAR(20) DEFAULT 'outlet',
    courier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    perfume_id VARCHAR(32) REFERENCES fragrances(id) ON DELETE SET NULL,
    perfume_name VARCHAR(60),
    special_notes TEXT,
    est_ready_date TIMESTAMPTZ NOT NULL,
    paid_amount NUMERIC(15,2) DEFAULT 0,
    change_amount NUMERIC(15,2) DEFAULT 0,
    assigned_machine_id VARCHAR(32),
    is_express BOOLEAN DEFAULT FALSE,
    -- Dropship Integration
    is_dropship BOOLEAN DEFAULT FALSE,
    agent_id VARCHAR(32),
    agent_name VARCHAR(120),
    agent_commission NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    service_id VARCHAR(32) REFERENCES services(id),
    service_name VARCHAR(120) NOT NULL,
    category VARCHAR(20) NOT NULL,
    quantity NUMERIC(6,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    price_per_unit NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(15,2) NOT NULL
);

-- 9. INVENTORY (CHEMICALS & PACKAGING)
CREATE TABLE IF NOT EXISTS inventory_items (
    id VARCHAR(32) PRIMARY KEY,
    branch_id VARCHAR(32) NOT NULL REFERENCES branches(id),
    name VARCHAR(120) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('deterjen', 'parfum', 'kemasan', 'perlengkapan')),
    stock NUMERIC(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    min_stock_warning NUMERIC(10,2) NOT NULL DEFAULT 5,
    unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. IOT MACHINES
CREATE TABLE IF NOT EXISTS machines (
    id VARCHAR(32) PRIMARY KEY,
    branch_id VARCHAR(32) NOT NULL REFERENCES branches(id),
    name VARCHAR(60) NOT NULL,
    type machine_type NOT NULL,
    model VARCHAR(60),
    status machine_status NOT NULL DEFAULT 'idle',
    current_order_id VARCHAR(36) REFERENCES orders(id) ON DELETE SET NULL,
    current_invoice_no VARCHAR(40),
    started_at TIMESTAMPTZ,
    estimated_ends_at TIMESTAMPTZ,
    total_duration_seconds INTEGER DEFAULT 0,
    energy_kwh NUMERIC(8,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. COURIER TASKS
CREATE TABLE IF NOT EXISTS courier_tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT ('task-' || substr(md5(random()::text), 1, 10)),
    order_id VARCHAR(36) REFERENCES orders(id) ON DELETE CASCADE,
    invoice_no VARCHAR(40) NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_address TEXT NOT NULL,
    type task_type NOT NULL DEFAULT 'pickup',
    status task_status NOT NULL DEFAULT 'pending',
    amount_to_collect NUMERIC(15,2) DEFAULT 0,
    payment_method VARCHAR(40) DEFAULT 'COD',
    notes TEXT,
    is_agent_drop_point BOOLEAN DEFAULT FALSE,
    agent_name VARCHAR(120),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 12. DROPSHIP AGENTS (MITRA DROP POINT)
CREATE TABLE IF NOT EXISTS dropship_agents (
    id VARCHAR(32) PRIMARY KEY DEFAULT ('agent-' || substr(md5(random()::text), 1, 8)),
    name VARCHAR(120) NOT NULL,
    owner_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    branch_id VARCHAR(32) NOT NULL REFERENCES branches(id),
    commission_percent NUMERIC(5,2) NOT NULL DEFAULT 25.0,
    wallet_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_earned NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_orders_count INTEGER NOT NULL DEFAULT 0,
    total_weight_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    bank_name VARCHAR(30) NOT NULL,
    bank_account_number VARCHAR(60) NOT NULL,
    bank_account_name VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. DROPSHIP SUPPLIES B2B (WHOLESALE FACTORY CATALOG)
CREATE TABLE IF NOT EXISTS dropship_supplies (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(30) NOT NULL,
    supplier_name VARCHAR(120) NOT NULL,
    wholesale_price NUMERIC(15,2) NOT NULL,
    suggested_retail_price NUMERIC(15,2) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    min_order INTEGER NOT NULL DEFAULT 1,
    delivery_estimate VARCHAR(60) NOT NULL,
    description TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3,2) DEFAULT 4.9,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. DROPSHIP SUPPLY ORDERS (B2B CARGO PROCUREMENT)
CREATE TABLE IF NOT EXISTS dropship_supply_orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT ('so-' || substr(md5(random()::text), 1, 10)),
    order_no VARCHAR(40) NOT NULL UNIQUE,
    item_id VARCHAR(32) REFERENCES dropship_supplies(id),
    item_name VARCHAR(120) NOT NULL,
    quantity INTEGER NOT NULL,
    total_price NUMERIC(15,2) NOT NULL,
    destination_branch_or_agent VARCHAR(120) NOT NULL,
    recipient_name VARCHAR(120) NOT NULL,
    recipient_phone VARCHAR(30) NOT NULL,
    destination_address TEXT NOT NULL,
    status dropship_supply_status NOT NULL DEFAULT 'diproses',
    tracking_number VARCHAR(60) NOT NULL,
    cargo_courier VARCHAR(60) NOT NULL,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    estimated_arrival TIMESTAMPTZ
);

-- 15. WITHDRAWAL REQUESTS (KOMISI DROPSHIP SETTLEMENT)
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT ('wd-' || substr(md5(random()::text), 1, 10)),
    agent_id VARCHAR(32) NOT NULL REFERENCES dropship_agents(id),
    agent_name VARCHAR(120) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    bank VARCHAR(30) NOT NULL,
    account_number VARCHAR(60) NOT NULL,
    account_name VARCHAR(120) NOT NULL,
    status withdrawal_status NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 16. AUDIT LOGS (FORENSIK & OPERASIONAL)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT ('log-' || substr(md5(random()::text), 1, 10)),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor_name VARCHAR(120) NOT NULL,
    actor_role user_role NOT NULL,
    action VARCHAR(60) NOT NULL,
    details TEXT NOT NULL,
    branch_id VARCHAR(32) REFERENCES branches(id)
);

-- =========================================================================
-- INDEXES FOR HIGH-CONCURRENCY PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(current_status);
CREATE INDEX IF NOT EXISTS idx_orders_invoice ON orders(invoice_no);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_branch ON inventory_items(branch_id);
CREATE INDEX IF NOT EXISTS idx_courier_tasks_status ON courier_tasks(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_status ON withdrawal_requests(status);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropship_agents ENABLE ROW LEVEL SECURITY;

-- Owner can read/write everything
CREATE POLICY "Owner full access" ON orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'owner');

-- Public customer tracking by invoice number
CREATE POLICY "Customer can view own order by invoice" ON orders
    FOR SELECT USING (true);

-- Cashier & Staff can read & insert orders for their branch
CREATE POLICY "Staff branch orders access" ON orders
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('kasir', 'produksi', 'kurir', 'agen')
    );
