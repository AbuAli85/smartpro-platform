-- Database Performance Optimization Indexes
-- Run these queries to improve query performance

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON user(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON user(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON user(createdAt);

-- Sanad Offices table indexes
CREATE INDEX IF NOT EXISTS idx_offices_status ON sanad_offices(status);
CREATE INDEX IF NOT EXISTS idx_offices_owner_id ON sanad_offices(ownerId);
CREATE INDEX IF NOT EXISTS idx_offices_created_at ON sanad_offices(createdAt);
CREATE INDEX IF NOT EXISTS idx_offices_performance_score ON sanad_offices(performanceScore);
CREATE INDEX IF NOT EXISTS idx_offices_rank ON sanad_offices(rank);

-- Services table indexes
CREATE INDEX IF NOT EXISTS idx_services_office_id ON services(officeId);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(isActive);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(userId);
CREATE INDEX IF NOT EXISTS idx_bookings_office_id ON bookings(officeId);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(serviceId);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(createdAt);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(bookingDate);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(bookingId);
CREATE INDEX IF NOT EXISTS idx_reviews_office_id ON reviews(officeId);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(userId);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(createdAt);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(isRead);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(createdAt);

-- Chat messages table indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversationId);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(senderId);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(createdAt);

-- Loyalty points table indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON loyalty_points(userId);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_created_at ON loyalty_points(createdAt);

-- Service bundles table indexes
CREATE INDEX IF NOT EXISTS idx_service_bundles_office_id ON service_bundles(officeId);
CREATE INDEX IF NOT EXISTS idx_service_bundles_is_active ON service_bundles(isActive);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(userId, status);
CREATE INDEX IF NOT EXISTS idx_bookings_office_status ON bookings(officeId, status);
CREATE INDEX IF NOT EXISTS idx_reviews_office_rating ON reviews(officeId, rating);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(userId, isRead);
