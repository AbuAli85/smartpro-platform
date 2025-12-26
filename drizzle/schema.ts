import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, index, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * SmartPro Platform - Complete Database Schema
 * A unified platform connecting SMEs with Sanad offices for business services
 */

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "sanad_owner", "sanad_staff", "sme_owner", "gig_worker", "government_official"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  preferredLanguage: varchar("preferredLanguage", { length: 10 }).default("en"),
  notificationPreferences: json("notificationPreferences").$type<{
    email: boolean;
    sms: boolean;
    confirmations: boolean;
    reminders: boolean;
    marketing: boolean;
  }>(),
  referralCode: varchar("referralCode", { length: 20 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  roleIdx: index("role_idx").on(table.role),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// SANAD OFFICES
// ============================================================================

export const sanadOffices = mysqlTable("sanad_offices", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic information
  officeName: varchar("officeName", { length: 255 }).notNull(),
  officeNameAr: varchar("officeNameAr", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  
  // Registration details
  commercialRegistration: varchar("commercialRegistration", { length: 100 }).notNull().unique(),
  tradeLicense: varchar("tradeLicense", { length: 100 }),
  taxRegistration: varchar("taxRegistration", { length: 100 }),
  
  // Contact information
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }),
  website: text("website"),
  
  // Location
  governorate: varchar("governorate", { length: 100 }).notNull(),
  wilayat: varchar("wilayat", { length: 100 }).notNull(),
  addressLine1: text("addressLine1").notNull(),
  addressLine2: text("addressLine2"),
  postalCode: varchar("postalCode", { length: 20 }),
  locationLat: decimal("locationLat", { precision: 10, scale: 7 }),
  locationLng: decimal("locationLng", { precision: 10, scale: 7 }),
  
  // Business details
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  yearEstablished: int("yearEstablished"),
  employeeCount: int("employeeCount").default(1).notNull(),
  
  // Status and verification
  status: mysqlEnum("status", ["pending", "active", "suspended", "inactive"]).default("pending").notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "pending_verification", "verified", "rejected"]).default("unverified").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  verifiedBy: int("verifiedBy"),
  
  // Owner
  ownerId: int("ownerId").notNull(),
  
  // Settings
  acceptsOnlineBookings: boolean("acceptsOnlineBookings").default(true).notNull(),
  autoAcceptBookings: boolean("autoAcceptBookings").default(false).notNull(),
  workingHours: json("workingHours"),
  
  // Cancellation Policy
  cancellationWindowHours: int("cancellationWindowHours").default(24).notNull(),
  cancellationPenaltyPercent: int("cancellationPenaltyPercent").default(0).notNull(),
  
  // Media
  logoUrl: text("logoUrl"),
  coverImageUrl: text("coverImageUrl"),
  images: json("images").$type<string[]>(),
  
  // Analytics
  totalOrders: int("totalOrders").default(0).notNull(),
  completedOrders: int("completedOrders").default(0).notNull(),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0.00").notNull(),
  totalReviews: int("totalReviews").default(0).notNull(),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy"),
  updatedBy: int("updatedBy"),
}, (table) => ({
  ownerIdx: index("owner_idx").on(table.ownerId),
  statusIdx: index("status_idx").on(table.status),
  governorateIdx: index("governorate_idx").on(table.governorate),
  verificationIdx: index("verification_idx").on(table.verificationStatus),
}));

export type SanadOffice = typeof sanadOffices.$inferSelect;
export type InsertSanadOffice = typeof sanadOffices.$inferInsert;

// ============================================================================
// SANAD OFFICE STAFF
// ============================================================================

export const sanadOfficeStaff = mysqlTable("sanad_office_staff", {
  id: int("id").autoincrement().primaryKey(),
  officeId: int("officeId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "manager", "staff", "viewer"]).default("staff").notNull(),
  permissions: json("permissions").$type<string[]>(),
  status: mysqlEnum("status", ["active", "inactive", "invited"]).default("invited").notNull(),
  invitedAt: timestamp("invitedAt"),
  joinedAt: timestamp("joinedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  officeIdx: index("office_idx").on(table.officeId),
  userIdx: index("user_idx").on(table.userId),
  uniqueOfficeUser: uniqueIndex("unique_office_user").on(table.officeId, table.userId),
}));

export type SanadOfficeStaff = typeof sanadOfficeStaff.$inferSelect;
export type InsertSanadOfficeStaff = typeof sanadOfficeStaff.$inferInsert;

// ============================================================================
// SANAD OFFICE SERVICES
// ============================================================================

export const sanadOfficeServices = mysqlTable("sanad_office_services", {
  id: int("id").autoincrement().primaryKey(),
  officeId: int("officeId").notNull(),
  
  // Service details
  serviceName: varchar("serviceName", { length: 255 }).notNull(),
  serviceNameAr: varchar("serviceNameAr", { length: 255 }),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  
  // Pricing
  price: decimal("price", { precision: 10, scale: 3 }),
  currency: varchar("currency", { length: 3 }).default("OMR").notNull(),
  priceType: mysqlEnum("priceType", ["fixed", "hourly", "custom"]).default("fixed").notNull(),
  
  // Delivery
  estimatedDeliveryDays: int("estimatedDeliveryDays"),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  officeIdx: index("office_idx").on(table.officeId),
  categoryIdx: index("category_idx").on(table.category),
  activeIdx: index("active_idx").on(table.isActive),
}));

export type SanadOfficeService = typeof sanadOfficeServices.$inferSelect;
export type InsertSanadOfficeService = typeof sanadOfficeServices.$inferInsert;

// ============================================================================
// DOCUMENT TEMPLATES
// ============================================================================

export const documentTemplates = mysqlTable("document_templates", {
  id: int("id").autoincrement().primaryKey(),
  
  // Template details
  templateName: varchar("templateName", { length: 255 }).notNull(),
  templateNameAr: varchar("templateNameAr", { length: 255 }),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  
  // Template content
  templateContent: text("templateContent").notNull(), // HTML or JSON template
  variables: json("variables").$type<Array<{
    name: string;
    label: string;
    labelAr?: string;
    type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'textarea' | 'dropdown' | 'checkbox' | 'radio';
    required: boolean;
    placeholder?: string;
    placeholderAr?: string;
    options?: string[]; // For dropdown/radio
    validation?: string; // Regex pattern
    defaultValue?: string;
  }>>().notNull(),
  tags: json("tags").$type<string[]>(), // For search and filtering
  
  // Metadata
  language: varchar("language", { length: 10 }).default("en").notNull(),
  isOfficial: boolean("isOfficial").default(false).notNull(), // Government-approved template
  isPremium: boolean("isPremium").default(false).notNull(),
  
  // Pricing
  price: decimal("price", { precision: 10, scale: 3 }),
  
  // File storage
  fileUrl: text("fileUrl"),
  fileKey: varchar("fileKey", { length: 500 }),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  
  // Usage stats
  usageCount: int("usageCount").default(0).notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy"),
}, (table) => ({
  categoryIdx: index("category_idx").on(table.category),
  languageIdx: index("language_idx").on(table.language),
  activeIdx: index("active_idx").on(table.isActive),
}));

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = typeof documentTemplates.$inferInsert;

// ============================================================================
// GENERATED DOCUMENTS
// ============================================================================

export const generatedDocuments = mysqlTable("generated_documents", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull(),
  userId: int("userId").notNull(),
  officeId: int("officeId"),
  bookingId: int("bookingId"),
  
  // Document details
  documentName: varchar("documentName", { length: 255 }).notNull(),
  filledData: json("filledData").notNull(), // User-provided values for variables
  fileUrl: text("fileUrl").notNull(), // S3 URL to generated PDF
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  
  // Status
  status: mysqlEnum("status", ["draft", "generated", "delivered"]).default("generated").notNull(),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  templateIdx: index("template_idx").on(table.templateId),
  userIdx: index("user_idx").on(table.userId),
  officeIdx: index("office_idx").on(table.officeId),
  bookingIdx: index("booking_idx").on(table.bookingId),
}));

export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type InsertGeneratedDocument = typeof generatedDocuments.$inferInsert;

// ============================================================================
// BOOKINGS
// ============================================================================

export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  officeId: int("officeId").notNull(),
  serviceId: int("serviceId"),
  userId: int("userId").notNull(), // SME owner
  
  // Booking details
  bookingType: varchar("bookingType", { length: 50 }).default("service").notNull(),
  serviceDescription: text("serviceDescription"),
  requirements: text("requirements"),
  
  // Scheduling
  preferredDate: timestamp("preferredDate"),
  scheduledDate: timestamp("scheduledDate"),
  scheduledTime: varchar("scheduledTime", { length: 10 }), // e.g., "09:00"
  duration: int("duration").default(60), // Duration in minutes
  completedDate: timestamp("completedDate"),
  
  // Status
  status: mysqlEnum("status", ["pending", "confirmed", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  
  // Cancellation
  cancellationReason: text("cancellationReason"),
  cancelledBy: int("cancelledBy"), // User ID who cancelled
  cancelledAt: timestamp("cancelledAt"),
  cancellationPenalty: decimal("cancellationPenalty", { precision: 10, scale: 3 }),
  refundAmount: decimal("refundAmount", { precision: 10, scale: 3 }),
  
  // Pricing
  price: decimal("price", { precision: 10, scale: 3 }),
  currency: varchar("currency", { length: 3 }).default("OMR").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "paid", "refunded"]).default("unpaid").notNull(),
  
  // Communication
  notes: text("notes"),
  
  // Reminders
  reminder24hSent: boolean("reminder24hSent").default(false).notNull(),
  reminder1hSent: boolean("reminder1hSent").default(false).notNull(),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  officeIdx: index("office_idx").on(table.officeId),
  userIdx: index("user_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
  dateIdx: index("date_idx").on(table.scheduledDate),
}));

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ============================================================================
// REVIEWS
// ============================================================================

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  officeId: int("officeId").notNull(),
  bookingId: int("bookingId"),
  userId: int("userId").notNull(),
  
  // Review content
  rating: int("rating").notNull(), // 1-5
  reviewText: text("reviewText"),
  
  // Response
  responseText: text("responseText"),
  respondedAt: timestamp("respondedAt"),
  respondedBy: int("respondedBy"),
  
  // Status
  isVisible: boolean("isVisible").default(true).notNull(),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  officeIdx: index("office_idx").on(table.officeId),
  userIdx: index("user_idx").on(table.userId),
  bookingIdx: index("booking_idx").on(table.bookingId),
  visibleIdx: index("visible_idx").on(table.isVisible),
}));

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ============================================================================
// ACTIVITY LOG
// ============================================================================

export const activityLog = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: int("entityId"),
  description: text("description"),
  metadata: json("metadata"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  entityIdx: index("entity_idx").on(table.entityType, table.entityId),
  actionIdx: index("action_idx").on(table.action),
  dateIdx: index("date_idx").on(table.createdAt),
}));

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

// ============================================================================
// OFFICE AVAILABILITY
// ============================================================================

export const officeAvailability = mysqlTable("office_availability", {
  id: int("id").autoincrement().primaryKey(),
  officeId: int("officeId").notNull(),
  
  // Day of week (0 = Sunday, 6 = Saturday)
  dayOfWeek: int("dayOfWeek").notNull(), // 0-6
  
  // Time slots
  startTime: varchar("startTime", { length: 10 }).notNull(), // e.g., "09:00"
  endTime: varchar("endTime", { length: 10 }).notNull(), // e.g., "17:00"
  
  // Slot configuration
  slotDuration: int("slotDuration").default(60).notNull(), // Minutes per slot
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  officeIdx: index("office_idx").on(table.officeId),
  dayIdx: index("day_idx").on(table.dayOfWeek),
}));

export type OfficeAvailability = typeof officeAvailability.$inferSelect;
export type InsertOfficeAvailability = typeof officeAvailability.$inferInsert;

// ============================================================================
// LOYALTY PROGRAM
// ============================================================================

export const loyaltyPoints = mysqlTable("loyalty_points", {
  id: int("id").autoincrement().primaryKey(),
  
  // User reference
  userId: int("userId").notNull(),
  
  // Points tracking
  totalPoints: int("totalPoints").default(0).notNull(),
  availablePoints: int("availablePoints").default(0).notNull(),
  redeemedPoints: int("redeemedPoints").default(0).notNull(),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;
export type InsertLoyaltyPoints = typeof loyaltyPoints.$inferInsert;

export const loyaltyTransactions = mysqlTable("loyalty_transactions", {
  id: int("id").autoincrement().primaryKey(),
  
  // User reference
  userId: int("userId").notNull(),
  
  // Transaction details
  type: mysqlEnum("type", ["earn", "redeem"]).notNull(),
  points: int("points").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  
  // Related entities
  bookingId: int("bookingId"),
  reviewId: int("reviewId"),
  referralId: int("referralId"),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  typeIdx: index("type_idx").on(table.type),
}));

export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type InsertLoyaltyTransaction = typeof loyaltyTransactions.$inferInsert;

// ============================================================================
// REFERRAL SYSTEM
// ============================================================================

export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  
  // Referrer (user who shares the code)
  referrerId: int("referrerId").notNull(),
  referralCode: varchar("referralCode", { length: 20 }).notNull().unique(),
  
  // Referred user (new user who signs up with code)
  referredId: int("referredId"),
  
  // Status tracking
  status: mysqlEnum("status", ["pending", "completed", "expired"]).default("pending").notNull(),
  pointsAwarded: boolean("pointsAwarded").default(false).notNull(),
  
  // Completion tracking
  firstBookingId: int("firstBookingId"), // Track when referred user completes first booking
  completedAt: timestamp("completedAt"),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  referrerIdx: index("referrer_idx").on(table.referrerId),
  referredIdx: index("referred_idx").on(table.referredId),
  codeIdx: index("code_idx").on(table.referralCode),
  statusIdx: index("status_idx").on(table.status),
}));

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  
  // User reference
  userId: int("userId").notNull(),
  
  // Notification content
  type: mysqlEnum("type", ["booking", "points", "system", "review", "referral"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Related entities
  bookingId: int("bookingId"),
  reviewId: int("reviewId"),
  referralId: int("referralId"),
  
  // Status
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  
  // Action link (optional)
  actionUrl: varchar("actionUrl", { length: 500 }),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  typeIdx: index("type_idx").on(table.type),
  readIdx: index("read_idx").on(table.isRead),
  dateIdx: index("date_idx").on(table.createdAt),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================================================
// TEMPLATE DOWNLOADS TRACKING
// ============================================================================

export const templateDownloads = mysqlTable("template_downloads", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  templateId: int("templateId").notNull(),
  userId: int("userId").notNull(),
  
  // Download metadata
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
}, (table) => ({
  templateIdx: index("template_idx").on(table.templateId),
  userIdx: index("user_idx").on(table.userId),
  dateIdx: index("date_idx").on(table.downloadedAt),
}));

export type TemplateDownload = typeof templateDownloads.$inferSelect;
export type InsertTemplateDownload = typeof templateDownloads.$inferInsert;

// ============================================================================
// REAL-TIME CHAT SYSTEM
// ============================================================================

export const chatConversations = mysqlTable("chat_conversations", {
  id: int("id").autoincrement().primaryKey(),
  
  // Participants
  userId: int("userId").notNull(),
  officeId: int("officeId").notNull(),
  
  // Related booking (optional)
  bookingId: int("bookingId"),
  
  // Status
  status: mysqlEnum("status", ["active", "closed", "archived"]).default("active").notNull(),
  
  // Tags for categorization
  tags: json("tags").$type<string[]>(),
  
  // Last message info for sorting
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  lastMessagePreview: varchar("lastMessagePreview", { length: 255 }),
  
  // Unread counts
  unreadByUser: int("unreadByUser").default(0).notNull(),
  unreadByOffice: int("unreadByOffice").default(0).notNull(),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  officeIdx: index("office_idx").on(table.officeId),
  bookingIdx: index("booking_idx").on(table.bookingId),
  statusIdx: index("status_idx").on(table.status),
  lastMessageIdx: index("last_message_idx").on(table.lastMessageAt),
}));

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  
  // Conversation reference
  conversationId: int("conversationId").notNull(),
  
  // Sender info
  senderId: int("senderId").notNull(),
  senderType: mysqlEnum("senderType", ["user", "office"]).notNull(),
  
  // Message content
  message: text("message").notNull(),
  
  // Message type
  messageType: mysqlEnum("messageType", ["text", "file", "system"]).default("text").notNull(),
  fileUrl: text("fileUrl"),
  fileName: varchar("fileName", { length: 255 }),
  
  // Read status
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index("conversation_idx").on(table.conversationId),
  senderIdx: index("sender_idx").on(table.senderId),
  dateIdx: index("date_idx").on(table.createdAt),
}));

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ===== Canned Responses =====
export const cannedResponses = mysqlTable("canned_responses", {
  id: int("id").autoincrement().primaryKey(),
  
  // Office reference
  officeId: int("officeId").notNull(),
  
  // Response content
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  shortcut: varchar("shortcut", { length: 50 }),
  category: mysqlEnum("category", ["greeting", "faq", "closing", "pricing", "hours", "services", "general"]).default("general").notNull(),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  officeIdx: index("office_idx").on(table.officeId),
  categoryIdx: index("category_idx").on(table.category),
}));

export type CannedResponse = typeof cannedResponses.$inferSelect;
export type InsertCannedResponse = typeof cannedResponses.$inferInsert;

// ===== Chat Assignments =====
export const chatAssignments = mysqlTable("chat_assignments", {
  id: int("id").autoincrement().primaryKey(),
  
  // Conversation reference
  conversationId: int("conversationId").notNull(),
  
  // Assignment info
  assignedToUserId: int("assignedToUserId").notNull(),
  assignedByUserId: int("assignedByUserId").notNull(),
  
  // Audit
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index("conversation_idx").on(table.conversationId),
  assignedToIdx: index("assigned_to_idx").on(table.assignedToUserId),
}));

export type ChatAssignment = typeof chatAssignments.$inferSelect;
export type InsertChatAssignment = typeof chatAssignments.$inferInsert;

// ===== Chat Ratings =====
export const chatRatings = mysqlTable("chat_ratings", {
  id: int("id").autoincrement().primaryKey(),
  
  // Conversation reference
  conversationId: int("conversationId").notNull(),
  
  // Rating info
  rating: int("rating").notNull(), // 1-5 stars
  feedback: text("feedback"),
  
  // Staff reference (who was rated)
  staffUserId: int("staffUserId"),
  
  // Customer reference
  userId: int("userId").notNull(),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index("conversation_idx").on(table.conversationId),
  staffIdx: index("staff_idx").on(table.staffUserId),
  ratingIdx: index("rating_idx").on(table.rating),
}));

export type ChatRating = typeof chatRatings.$inferSelect;
export type InsertChatRating = typeof chatRatings.$inferInsert;

// ===== Chat Transfer History =====
export const chatTransferHistory = mysqlTable("chat_transfer_history", {
  id: int("id").autoincrement().primaryKey(),
  
  // Conversation reference
  conversationId: int("conversationId").notNull(),
  
  // Transfer details
  fromUserId: int("fromUserId").notNull(),
  toUserId: int("toUserId").notNull(),
  
  // Context and reason
  contextNotes: text("contextNotes"),
  isEscalation: boolean("isEscalation").default(false).notNull(),
  
  // Audit
  transferredAt: timestamp("transferredAt").defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index("conversation_idx").on(table.conversationId),
  fromUserIdx: index("from_user_idx").on(table.fromUserId),
  toUserIdx: index("to_user_idx").on(table.toUserId),
}));

export type ChatTransferHistory = typeof chatTransferHistory.$inferSelect;
export type InsertChatTransferHistory = typeof chatTransferHistory.$inferInsert;

// ===== Scheduled Follow-ups =====
export const scheduledFollowups = mysqlTable("scheduled_followups", {
  id: int("id").autoincrement().primaryKey(),
  
  // Conversation reference
  conversationId: int("conversationId").notNull(),
  officeId: int("officeId").notNull(),
  
  // Scheduling
  scheduledFor: timestamp("scheduledFor").notNull(),
  triggerType: mysqlEnum("triggerType", ["24h", "48h", "manual"]).notNull().default("24h"),
  
  // Message
  messageTemplate: text("messageTemplate").notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "sent", "cancelled"]).notNull().default("pending"),
  sentAt: timestamp("sentAt"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledFollowup = typeof scheduledFollowups.$inferSelect;
export type InsertScheduledFollowup = typeof scheduledFollowups.$inferInsert;

// ===== Office Staff =====
export const officeStaff = mysqlTable("office_staff", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  officeId: int("officeId").notNull(),
  userId: int("userId").notNull(),
  
  // Role
  role: mysqlEnum("role", ["owner", "manager", "agent"]).default("agent").notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  availabilityStatus: mysqlEnum("availabilityStatus", ["online", "offline", "busy"]).default("offline").notNull(),
  
  // Expertise tags for routing
  expertiseTags: json("expertiseTags").$type<string[]>(),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastActiveAt: timestamp("lastActiveAt"),
}, (table) => ({
  officeIdx: index("office_idx").on(table.officeId),
  userIdx: index("user_idx").on(table.userId),
}));

export type OfficeStaff = typeof officeStaff.$inferSelect;
export type InsertOfficeStaff = typeof officeStaff.$inferInsert;

// ============================================================================
// TRANSLATION MANAGEMENT
// ============================================================================

export const translationRequests = mysqlTable("translation_requests", {
  id: int("id").autoincrement().primaryKey(),
  
  // Request details
  entityType: mysqlEnum("entityType", ["office", "template"]).notNull(),
  entityId: int("entityId").notNull(),
  
  // Requester info
  requesterId: int("requesterId").notNull(),
  requesterName: varchar("requesterName", { length: 255 }).notNull(),
  requesterEmail: varchar("requesterEmail", { length: 320 }),
  
  // Translation content
  currentNameEn: varchar("currentNameEn", { length: 255 }).notNull(),
  currentDescriptionEn: text("currentDescriptionEn"),
  proposedNameAr: varchar("proposedNameAr", { length: 255 }),
  proposedDescriptionAr: text("proposedDescriptionAr"),
  
  // Request notes
  notes: text("notes"),
  
  // Status and workflow
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  
  // Admin actions
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  
  // Completion tracking
  completedBy: int("completedBy"),
  completedAt: timestamp("completedAt"),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  entityIdx: index("entity_idx").on(table.entityType, table.entityId),
  requesterIdx: index("requester_idx").on(table.requesterId),
  statusIdx: index("status_idx").on(table.status),
  priorityIdx: index("priority_idx").on(table.priority),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type TranslationRequest = typeof translationRequests.$inferSelect;
export type InsertTranslationRequest = typeof translationRequests.$inferInsert;

export const translationActivityLog = mysqlTable("translation_activity_log", {
  id: int("id").autoincrement().primaryKey(),
  
  // What was translated
  entityType: mysqlEnum("entityType", ["office", "template"]).notNull(),
  entityId: int("entityId").notNull(),
  entityName: varchar("entityName", { length: 255 }).notNull(),
  
  // Who translated
  translatorId: int("translatorId").notNull(),
  translatorName: varchar("translatorName", { length: 255 }).notNull(),
  
  // What changed
  actionType: mysqlEnum("actionType", ["created", "updated", "bulk_import"]).notNull(),
  fieldChanged: varchar("fieldChanged", { length: 50 }), // "nameAr", "descriptionAr", "both"
  
  // Previous and new values (for audit)
  previousValue: text("previousValue"),
  newValue: text("newValue"),
  
  // Metadata
  source: mysqlEnum("source", ["manual", "bulk_import", "request_approval"]).default("manual").notNull(),
  requestId: int("requestId"), // Link to translation request if applicable
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  entityIdx: index("entity_idx").on(table.entityType, table.entityId),
  translatorIdx: index("translator_idx").on(table.translatorId),
  actionIdx: index("action_idx").on(table.actionType),
  sourceIdx: index("source_idx").on(table.source),
  dateIdx: index("date_idx").on(table.createdAt),
}));

export type TranslationActivityLog = typeof translationActivityLog.$inferSelect;
export type InsertTranslationActivityLog = typeof translationActivityLog.$inferInsert;

// ============================================================================
// TRANSLATION MEMORY
// ============================================================================

export const translationMemory = mysqlTable("translation_memory", {
  id: int("id").autoincrement().primaryKey(),
  
  // Source and translation
  sourceText: text("sourceText").notNull(),
  translatedText: text("translatedText").notNull(),
  sourceLanguage: varchar("sourceLanguage", { length: 10 }).notNull().default("en"),
  targetLanguage: varchar("targetLanguage", { length: 10 }).notNull().default("ar"),
  
  // Context for better matching
  context: varchar("context", { length: 100 }), // office_name, office_description, template_name, etc.
  
  // Usage tracking
  usageCount: int("usageCount").notNull().default(0),
  lastUsedAt: timestamp("lastUsedAt"),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
}, (table) => ({
  contextIdx: index("context_idx").on(table.context),
  usageIdx: index("usage_idx").on(table.usageCount),
}));

export type TranslationMemory = typeof translationMemory.$inferSelect;
export type InsertTranslationMemory = typeof translationMemory.$inferInsert;

// ============================================================================
// TRANSLATION VERSION HISTORY
// ============================================================================

export const translationVersions = mysqlTable("translation_versions", {
  id: int("id").autoincrement().primaryKey(),
  
  // What was changed
  entityType: mysqlEnum("entityType", ["office", "template"]).notNull(),
  entityId: int("entityId").notNull(),
  fieldName: varchar("fieldName", { length: 50 }).notNull(), // nameAr, descriptionAr
  
  // Version data
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  
  // Who changed it
  changedBy: int("changedBy").notNull(),
  changedByName: varchar("changedByName", { length: 255 }).notNull(),
  changeReason: text("changeReason"),
  
  // Metadata
  source: mysqlEnum("source", ["manual", "bulk_import", "request_approval", "auto_translate"]).default("manual").notNull(),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  entityIdx: index("entity_idx").on(table.entityType, table.entityId),
  changedByIdx: index("changed_by_idx").on(table.changedBy),
  dateIdx: index("date_idx").on(table.createdAt),
}));

export type TranslationVersion = typeof translationVersions.$inferSelect;
export type InsertTranslationVersion = typeof translationVersions.$inferInsert;


// ============================================================================
// TRANSLATION REVIEWS (Collaborative Workflow)
// ============================================================================

export const translationReviews = mysqlTable("translation_reviews", {
  id: int("id").primaryKey().autoincrement(),
  entityType: mysqlEnum("entity_type", ["office", "template"]).notNull(),
  entityId: int("entity_id").notNull(),
  fieldName: varchar("field_name", { length: 50 }).notNull(), // nameAr, descriptionAr
  translatedText: text("translated_text").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "needs_revision"]).notNull().default("pending"),
  submittedBy: int("submitted_by").notNull(),
  submittedByName: varchar("submitted_by_name", { length: 255 }).notNull(),
  reviewedBy: int("reviewed_by"),
  reviewedByName: varchar("reviewed_by_name", { length: 255 }),
  reviewNotes: text("review_notes"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
}, (table) => ({
  entityIdx: index("entity_idx").on(table.entityType, table.entityId),
  statusIdx: index("status_idx").on(table.status),
  submittedByIdx: index("submitted_by_idx").on(table.submittedBy),
}));

export type TranslationReview = typeof translationReviews.$inferSelect;
export type InsertTranslationReview = typeof translationReviews.$inferInsert;

export const translationReviewComments = mysqlTable("translation_review_comments", {
  id: int("id").primaryKey().autoincrement(),
  reviewId: int("review_id").notNull(),
  userId: int("user_id").notNull(),
  userName: varchar("user_name", { length: 255 }).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  reviewIdIdx: index("review_id_idx").on(table.reviewId),
}));

export type TranslationReviewComment = typeof translationReviewComments.$inferSelect;
export type InsertTranslationReviewComment = typeof translationReviewComments.$inferInsert;
