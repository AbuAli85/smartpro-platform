-- SmartPro Unified Database Schema Migration
-- Purpose: Create a unified schema that combines business-services-hub and Contract-Management-System
-- Date: December 25, 2025
-- Version: 1.0

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For better indexing

-- ============================================================================
-- CORE USER MANAGEMENT
-- ============================================================================

-- Users table (unified from both systems)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    
    -- Role and permissions
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'sanad_owner', 'sanad_staff', 'sme_owner', 'gig_worker', 'government_official', 'user')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    permissions TEXT[], -- Array of permission strings
    
    -- Profile details
    department VARCHAR(100),
    position VARCHAR(100),
    national_id VARCHAR(50), -- Omani national ID
    nationality VARCHAR(50) DEFAULT 'Omani',
    
    -- Authentication
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_national_id ON users(national_id);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- SANAD OFFICE MANAGEMENT (NEW - CRITICAL FOR MVP)
-- ============================================================================

-- Sanad offices table
CREATE TABLE IF NOT EXISTS sanad_offices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic information
    office_name VARCHAR(255) NOT NULL,
    office_name_ar VARCHAR(255), -- Arabic name
    slug VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly identifier
    
    -- Registration details
    commercial_registration VARCHAR(100) UNIQUE NOT NULL,
    trade_license VARCHAR(100),
    tax_registration VARCHAR(100),
    
    -- Contact information
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    website TEXT,
    
    -- Location
    governorate VARCHAR(100) NOT NULL, -- Muscat, Dhofar, etc.
    wilayat VARCHAR(100) NOT NULL, -- Sub-region
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    postal_code VARCHAR(20),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    
    -- Business details
    description TEXT,
    description_ar TEXT,
    year_established INTEGER,
    employee_count INTEGER DEFAULT 0,
    
    -- Status and verification
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
    verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected')),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    
    -- Owner
    owner_id UUID NOT NULL REFERENCES users(id),
    
    -- Settings
    accepts_online_bookings BOOLEAN DEFAULT TRUE,
    auto_accept_bookings BOOLEAN DEFAULT FALSE,
    working_hours JSONB, -- {monday: {open: "08:00", close: "17:00"}, ...}
    
    -- Media
    logo_url TEXT,
    cover_image_url TEXT,
    images TEXT[], -- Array of image URLs
    
    -- Analytics
    total_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Indexes for sanad_offices
CREATE INDEX idx_sanad_offices_slug ON sanad_offices(slug);
CREATE INDEX idx_sanad_offices_status ON sanad_offices(status);
CREATE INDEX idx_sanad_offices_governorate ON sanad_offices(governorate);
CREATE INDEX idx_sanad_offices_owner_id ON sanad_offices(owner_id);
CREATE INDEX idx_sanad_offices_verification_status ON sanad_offices(verification_status);
CREATE INDEX idx_sanad_offices_cr ON sanad_offices(commercial_registration);

-- Full-text search index for office names
CREATE INDEX idx_sanad_offices_name_search ON sanad_offices USING gin(to_tsvector('english', office_name));

-- Sanad office staff (many-to-many relationship)
CREATE TABLE IF NOT EXISTS sanad_office_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    office_id UUID NOT NULL REFERENCES sanad_offices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff', 'viewer')),
    permissions TEXT[], -- Specific permissions for this staff member
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(office_id, user_id)
);

CREATE INDEX idx_sanad_office_staff_office_id ON sanad_office_staff(office_id);
CREATE INDEX idx_sanad_office_staff_user_id ON sanad_office_staff(user_id);

-- Sanad office services (what services each office offers)
CREATE TABLE IF NOT EXISTS sanad_office_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    office_id UUID NOT NULL REFERENCES sanad_offices(id) ON DELETE CASCADE,
    
    -- Service details
    service_name VARCHAR(255) NOT NULL,
    service_name_ar VARCHAR(255),
    category VARCHAR(100) NOT NULL, -- "Company Formation", "Visa Services", etc.
    description TEXT,
    description_ar TEXT,
    
    -- Pricing
    price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'OMR',
    price_type VARCHAR(50) DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'custom')),
    
    -- Delivery
    estimated_delivery_days INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sanad_office_services_office_id ON sanad_office_services(office_id);
CREATE INDEX idx_sanad_office_services_category ON sanad_office_services(category);
CREATE INDEX idx_sanad_office_services_is_active ON sanad_office_services(is_active);

-- ============================================================================
-- DOCUMENT TEMPLATE LIBRARY (NEW - CRITICAL FOR MVP)
-- ============================================================================

-- Document templates
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template identification
    template_code VARCHAR(100) UNIQUE NOT NULL, -- e.g., "CONTRACT_EMPLOYMENT_001"
    template_name VARCHAR(255) NOT NULL,
    template_name_ar VARCHAR(255),
    
    -- Categorization
    category VARCHAR(100) NOT NULL, -- "Contracts", "Letters", "NOCs", "Visa Forms", etc.
    subcategory VARCHAR(100),
    tags TEXT[], -- Array of searchable tags
    
    -- Content
    description TEXT,
    description_ar TEXT,
    template_content TEXT NOT NULL, -- HTML or Markdown with placeholders
    template_content_ar TEXT, -- Arabic version
    
    -- Template variables (fields to fill in)
    variables JSONB NOT NULL, -- [{name: "company_name", type: "text", required: true, label: "Company Name"}, ...]
    
    -- Settings
    language VARCHAR(10) DEFAULT 'en', -- Primary language
    supports_arabic BOOLEAN DEFAULT FALSE,
    output_format VARCHAR(50) DEFAULT 'pdf' CHECK (output_format IN ('pdf', 'docx', 'html')),
    
    -- Usage and popularity
    usage_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Government compliance
    requires_government_verification BOOLEAN DEFAULT FALSE,
    government_approved BOOLEAN DEFAULT FALSE,
    approved_by_agency VARCHAR(100), -- "MOCI", "MOL", etc.
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Indexes for document_templates
CREATE INDEX idx_document_templates_code ON document_templates(template_code);
CREATE INDEX idx_document_templates_category ON document_templates(category);
CREATE INDEX idx_document_templates_is_active ON document_templates(is_active);
CREATE INDEX idx_document_templates_is_featured ON document_templates(is_featured);

-- Full-text search for templates
CREATE INDEX idx_document_templates_search ON document_templates USING gin(to_tsvector('english', template_name || ' ' || COALESCE(description, '')));

-- Generated documents (tracking)
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES document_templates(id),
    office_id UUID REFERENCES sanad_offices(id),
    generated_by UUID NOT NULL REFERENCES users(id),
    
    -- Document details
    document_name VARCHAR(255) NOT NULL,
    filled_data JSONB NOT NULL, -- The actual data filled into the template
    
    -- Output
    file_url TEXT NOT NULL, -- URL to the generated PDF/DOCX
    file_size INTEGER, -- Size in bytes
    file_format VARCHAR(50),
    
    -- Status
    status VARCHAR(50) DEFAULT 'generated' CHECK (status IN ('generated', 'downloaded', 'shared', 'archived')),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_generated_documents_template_id ON generated_documents(template_id);
CREATE INDEX idx_generated_documents_office_id ON generated_documents(office_id);
CREATE INDEX idx_generated_documents_generated_by ON generated_documents(generated_by);
CREATE INDEX idx_generated_documents_created_at ON generated_documents(created_at);

-- ============================================================================
-- BOOKINGS & SERVICES (FROM EXISTING SYSTEM - ENHANCED)
-- ============================================================================

-- Service bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parties
    client_id UUID NOT NULL REFERENCES users(id),
    office_id UUID NOT NULL REFERENCES sanad_offices(id),
    service_id UUID REFERENCES sanad_office_services(id),
    
    -- Booking details
    service_name VARCHAR(255) NOT NULL,
    service_category VARCHAR(100),
    description TEXT,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'OMR',
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed')),
    
    -- Timeline
    requested_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Payment
    payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
    paid_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_office_id ON bookings(office_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- ============================================================================
-- REVIEWS & RATINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    office_id UUID NOT NULL REFERENCES sanad_offices(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    
    -- Rating
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    
    -- Response
    response_text TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES users(id),
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_office_id ON reviews(office_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_is_visible ON reviews(is_visible);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification details
    type VARCHAR(100) NOT NULL, -- "booking_created", "payment_received", etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Action
    action_url TEXT,
    action_label VARCHAR(100),
    
    -- Related entities
    related_entity_type VARCHAR(50), -- "booking", "payment", etc.
    related_entity_id UUID,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- ACTIVITY LOG (AUDIT TRAIL)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    -- Action details
    action VARCHAR(100) NOT NULL, -- "created", "updated", "deleted", etc.
    entity_type VARCHAR(50) NOT NULL, -- "booking", "sanad_office", etc.
    entity_id UUID,
    
    -- Details
    description TEXT,
    metadata JSONB, -- Additional context
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity_type ON activity_log(entity_type);
CREATE INDEX idx_activity_log_entity_id ON activity_log(entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sanad_offices_updated_at BEFORE UPDATE ON sanad_offices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sanad_office_staff_updated_at BEFORE UPDATE ON sanad_office_staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sanad_office_services_updated_at BEFORE UPDATE ON sanad_office_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update sanad office rating when a new review is added
CREATE OR REPLACE FUNCTION update_sanad_office_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sanad_offices
    SET 
        average_rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM reviews
            WHERE office_id = NEW.office_id AND is_visible = TRUE
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE office_id = NEW.office_id AND is_visible = TRUE
        )
    WHERE id = NEW.office_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_office_rating_on_review
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_sanad_office_rating();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanad_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanad_office_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanad_office_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users: Can view their own profile, admins can view all
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

-- Sanad offices: Public can view active offices, owners can manage their own
CREATE POLICY sanad_offices_select_active ON sanad_offices FOR SELECT USING (status = 'active' OR owner_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'government_official')));
CREATE POLICY sanad_offices_insert_own ON sanad_offices FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY sanad_offices_update_own ON sanad_offices FOR UPDATE USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM sanad_office_staff WHERE office_id = sanad_offices.id AND user_id = auth.uid() AND role IN ('owner', 'manager')));

-- Bookings: Users can view their own bookings
CREATE POLICY bookings_select_own ON bookings FOR SELECT USING (client_id = auth.uid() OR EXISTS (SELECT 1 FROM sanad_office_staff WHERE office_id = bookings.office_id AND user_id = auth.uid()));
CREATE POLICY bookings_insert_own ON bookings FOR INSERT WITH CHECK (client_id = auth.uid());

-- Notifications: Users can only see their own notifications
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update_own ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Document templates: Public can view active templates
CREATE POLICY document_templates_select_active ON document_templates FOR SELECT USING (is_active = TRUE OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================================
-- SEED DATA (SAMPLE TEMPLATES)
-- ============================================================================

-- Insert sample document templates
INSERT INTO document_templates (template_code, template_name, template_name_ar, category, subcategory, description, template_content, variables, supports_arabic) VALUES
('CONTRACT_EMPLOYMENT_001', 'Employment Contract (Standard)', 'عقد عمل (قياسي)', 'Contracts', 'Employment', 'Standard employment contract compliant with Omani Labour Law', 
'<h1>Employment Contract</h1><p>This contract is made between {{company_name}} and {{employee_name}}...</p>', 
'[{"name":"company_name","type":"text","required":true,"label":"Company Name"},{"name":"employee_name","type":"text","required":true,"label":"Employee Name"},{"name":"position","type":"text","required":true,"label":"Position"},{"name":"salary","type":"number","required":true,"label":"Monthly Salary (OMR)"},{"name":"start_date","type":"date","required":true,"label":"Start Date"}]'::jsonb,
TRUE),

('LETTER_NOC_001', 'No Objection Certificate (General)', 'شهادة عدم ممانعة (عامة)', 'Letters', 'NOC', 'General purpose No Objection Certificate', 
'<h1>No Objection Certificate</h1><p>This is to certify that {{company_name}} has no objection to {{person_name}}...</p>',
'[{"name":"company_name","type":"text","required":true,"label":"Company Name"},{"name":"person_name","type":"text","required":true,"label":"Person Name"},{"name":"purpose","type":"text","required":true,"label":"Purpose"},{"name":"date","type":"date","required":true,"label":"Date"}]'::jsonb,
TRUE),

('FORM_VISA_001', 'Visa Application Form', 'نموذج طلب تأشيرة', 'Visa Forms', 'Application', 'Standard visa application form for Oman', 
'<h1>Visa Application Form</h1><p>Applicant Name: {{applicant_name}}</p><p>Passport Number: {{passport_number}}...</p>',
'[{"name":"applicant_name","type":"text","required":true,"label":"Applicant Name"},{"name":"passport_number","type":"text","required":true,"label":"Passport Number"},{"name":"nationality","type":"text","required":true,"label":"Nationality"},{"name":"purpose","type":"select","required":true,"label":"Purpose","options":["Tourism","Business","Work","Family Visit"]}]'::jsonb,
TRUE);

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- View: Sanad office statistics
CREATE OR REPLACE VIEW sanad_office_stats AS
SELECT 
    so.id,
    so.office_name,
    so.status,
    COUNT(DISTINCT b.id) as total_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(DISTINCT r.id) as total_reviews,
    COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.price ELSE 0 END), 0) as total_revenue
FROM sanad_offices so
LEFT JOIN bookings b ON so.id = b.office_id
LEFT JOIN reviews r ON so.id = r.office_id AND r.is_visible = TRUE
GROUP BY so.id, so.office_name, so.status;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE sanad_offices IS 'Stores information about registered Sanad offices';
COMMENT ON TABLE document_templates IS 'Library of 3000+ document templates for auto-generation';
COMMENT ON TABLE generated_documents IS 'Tracks all documents generated from templates';
COMMENT ON TABLE bookings IS 'Service bookings between clients and Sanad offices';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- This schema provides the foundation for the SmartPro MVP
-- Next steps:
-- 1. Migrate existing data from both Supabase projects
-- 2. Update application code to use new unified schema
-- 3. Test all RLS policies
-- 4. Deploy to production
