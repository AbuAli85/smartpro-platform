-- Office Notification Preferences Table
-- Stores preferences for which types of service requests offices want to be notified about

CREATE TABLE IF NOT EXISTS office_notification_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  office_id INT NOT NULL,
  service_types JSON NOT NULL COMMENT 'Array of service types the office wants to receive notifications for',
  governorates JSON NOT NULL COMMENT 'Array of governorates the office wants to receive notifications for',
  min_budget INT DEFAULT 0 COMMENT 'Minimum budget the office is interested in',
  max_budget INT DEFAULT 999999 COMMENT 'Maximum budget the office is interested in',
  email_notifications TINYINT DEFAULT 1 NOT NULL COMMENT 'Send email notifications',
  in_app_notifications TINYINT DEFAULT 1 NOT NULL COMMENT 'Send in-app notifications',
  is_active TINYINT DEFAULT 1 NOT NULL COMMENT 'Whether notifications are enabled for this office',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  INDEX office_idx (office_id),
  INDEX active_idx (is_active),
  UNIQUE KEY office_prefs_unique (office_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
