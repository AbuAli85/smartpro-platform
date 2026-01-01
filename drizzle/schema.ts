import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, int, varchar, json, text, timestamp, mysqlEnum, decimal, foreignKey, tinyint, date } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const activeSessions = mysqlTable("active_sessions", {
	id: int().autoincrement().notNull(),
	sessionId: varchar({ length: 255 }).notNull(),
	userId: int().notNull(),
	deviceInfo: json(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	lastActive: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	isActive: tinyint().default(1).notNull(),
	location: json(),
},
(table) => [
	index("active_sessions_sessionId_unique").on(table.sessionId),
	index("user_id_idx").on(table.userId),
	index("session_id_idx").on(table.sessionId),
	index("last_active_idx").on(table.lastActive),
	index("is_active_idx").on(table.isActive),
]);

export const activityLog = mysqlTable("activity_log", {
	id: int().autoincrement().notNull(),
	userId: int(),
	action: varchar({ length: 100 }).notNull(),
	entityType: varchar({ length: 50 }),
	entityId: int(),
	description: text(),
	metadata: json(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("user_idx").on(table.userId),
	index("entity_idx").on(table.entityType, table.entityId),
	index("action_idx").on(table.action),
	index("date_idx").on(table.createdAt),
]);

export const authAuditLog = mysqlTable("auth_audit_log", {
	id: int().autoincrement().notNull(),
	userId: int(),
	openId: varchar({ length: 64 }),
	eventType: mysqlEnum(['login_success','login_failure','logout','session_expired','role_changed','permission_denied','password_reset_requested','password_reset_completed','mfa_enabled','mfa_disabled','mfa_verified','mfa_failed','email_verified','email_verification_sent','recovery_email_added','recovery_email_verified','session_revoked','all_sessions_revoked','account_locked','account_unlocked']).notNull(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	deviceInfo: json(),
	country: varchar({ length: 100 }),
	city: varchar({ length: 100 }),
	metadata: json(),
	success: tinyint().notNull(),
	severity: mysqlEnum(['info','warning','error','critical']).default('info').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("user_id_idx").on(table.userId),
	index("event_type_idx").on(table.eventType),
	index("ip_address_idx").on(table.ipAddress),
	index("created_at_idx").on(table.createdAt),
	index("severity_idx").on(table.severity),
	index("user_event_idx").on(table.userId, table.eventType, table.createdAt),
]);

export const batchTranslationJobs = mysqlTable("batch_translation_jobs", {
	id: int().autoincrement().notNull(),
	jobName: varchar("job_name", { length: 255 }).notNull(),
	entityType: mysqlEnum("entity_type", ['office','template','both']).notNull(),
	targetEntityIds: json("target_entity_ids"),
	status: mysqlEnum(['pending','processing','completed','failed']).default('pending').notNull(),
	totalItems: int("total_items").default(0).notNull(),
	processedItems: int("processed_items").default(0).notNull(),
	autoApprovedCount: int("auto_approved_count").default(0).notNull(),
	queuedForReviewCount: int("queued_for_review_count").default(0).notNull(),
	failedCount: int("failed_count").default(0).notNull(),
	confidenceThreshold: int("confidence_threshold").default(80).notNull(),
	useMemorySuggestions: tinyint("use_memory_suggestions").default(1).notNull(),
	results: json(),
	createdBy: int("created_by").notNull(),
	createdByName: varchar("created_by_name", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
},
(table) => [
	index("status_idx").on(table.status),
	index("created_by_idx").on(table.createdBy),
	index("created_at_idx").on(table.createdAt),
]);

export const bookings = mysqlTable("bookings", {
	id: int().autoincrement().notNull(),
	officeId: int().notNull(),
	serviceId: int(),
	userId: int().notNull(),
	bookingType: varchar({ length: 50 }).default('service').notNull(),
	serviceDescription: text(),
	requirements: text(),
	preferredDate: timestamp({ mode: 'string' }),
	scheduledDate: timestamp({ mode: 'string' }),
	completedDate: timestamp({ mode: 'string' }),
	status: mysqlEnum(['pending','confirmed','in_progress','completed','cancelled']).default('pending').notNull(),
	price: decimal({ precision: 10, scale: 3 }),
	currency: varchar({ length: 3 }).default('OMR').notNull(),
	paymentStatus: mysqlEnum(['unpaid','paid','refunded']).default('unpaid').notNull(),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	scheduledTime: varchar({ length: 10 }),
	duration: int().default(60),
	cancellationReason: text(),
	cancelledBy: int(),
	cancelledAt: timestamp({ mode: 'string' }),
	cancellationPenalty: decimal({ precision: 10, scale: 3 }),
	refundAmount: decimal({ precision: 10, scale: 3 }),
	reminder24HSent: tinyint().default(0).notNull(),
	reminder1HSent: tinyint().default(0).notNull(),
},
(table) => [
	index("office_idx").on(table.officeId),
	index("user_idx").on(table.userId),
	index("status_idx").on(table.status),
	index("date_idx").on(table.scheduledDate),
]);

export const bundleServices = mysqlTable("bundle_services", {
	id: int().autoincrement().notNull(),
	bundleId: int("bundle_id").notNull(),
	serviceId: int("service_id").notNull(),
	serviceName: varchar("service_name", { length: 200 }).notNull(),
	servicePrice: decimal("service_price", { precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("bundle_idx").on(table.bundleId),
	index("service_idx").on(table.serviceId),
]);

export const cannedResponses = mysqlTable("canned_responses", {
	id: int().autoincrement().notNull(),
	officeId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	category: mysqlEnum(['greeting','faq','closing','pricing','hours','services','general']).default('general').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	shortcut: varchar({ length: 50 }),
},
(table) => [
	index("office_idx").on(table.officeId),
	index("category_idx").on(table.category),
]);

export const chatAssignments = mysqlTable("chat_assignments", {
	id: int().autoincrement().notNull(),
	conversationId: int().notNull(),
	assignedToUserId: int().notNull(),
	assignedByUserId: int().notNull(),
	assignedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("conversation_idx").on(table.conversationId),
	index("assigned_to_idx").on(table.assignedToUserId),
]);

export const chatConversations = mysqlTable("chat_conversations", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	officeId: int().notNull(),
	bookingId: int(),
	status: mysqlEnum(['active','closed','archived']).default('active').notNull(),
	lastMessageAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	lastMessagePreview: varchar({ length: 255 }),
	unreadByUser: int().default(0).notNull(),
	unreadByOffice: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	tags: json(),
},
(table) => [
	index("user_idx").on(table.userId),
	index("office_idx").on(table.officeId),
	index("booking_idx").on(table.bookingId),
	index("status_idx").on(table.status),
	index("last_message_idx").on(table.lastMessageAt),
]);

export const chatMessages = mysqlTable("chat_messages", {
	id: int().autoincrement().notNull(),
	conversationId: int().notNull(),
	senderId: int().notNull(),
	senderType: mysqlEnum(['user','office']).notNull(),
	message: text().notNull(),
	messageType: mysqlEnum(['text','file','system']).default('text').notNull(),
	fileUrl: text(),
	fileName: varchar({ length: 255 }),
	isRead: tinyint().default(0).notNull(),
	readAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("conversation_idx").on(table.conversationId),
	index("sender_idx").on(table.senderId),
	index("date_idx").on(table.createdAt),
]);

export const chatRatings = mysqlTable("chat_ratings", {
	id: int().autoincrement().notNull(),
	conversationId: int().notNull(),
	rating: int().notNull(),
	feedback: text(),
	staffUserId: int(),
	userId: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("conversation_idx").on(table.conversationId),
	index("staff_idx").on(table.staffUserId),
	index("rating_idx").on(table.rating),
]);

export const chatTransferHistory = mysqlTable("chat_transfer_history", {
	id: int().autoincrement().notNull(),
	conversationId: int().notNull(),
	fromUserId: int().notNull(),
	toUserId: int().notNull(),
	contextNotes: text(),
	isEscalation: tinyint().default(0).notNull(),
	transferredAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("conversation_idx").on(table.conversationId),
	index("from_user_idx").on(table.fromUserId),
	index("to_user_idx").on(table.toUserId),
]);

export const documentTemplates = mysqlTable("document_templates", {
	id: int().autoincrement().notNull(),
	templateName: varchar({ length: 255 }).notNull(),
	templateNameAr: varchar({ length: 255 }),
	category: varchar({ length: 100 }).notNull(),
	description: text(),
	descriptionAr: text(),
	templateContent: text().notNull(),
	variables: json().notNull(),
	language: varchar({ length: 10 }).default('en').notNull(),
	isOfficial: tinyint().default(0).notNull(),
	isPremium: tinyint().default(0).notNull(),
	usageCount: int().default(0).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	createdBy: int(),
	tags: json(),
	price: decimal({ precision: 10, scale: 3 }),
	fileUrl: text(),
	fileKey: varchar({ length: 500 }),
	fileSize: int(),
	mimeType: varchar({ length: 100 }),
	googleDocId: varchar({ length: 255 }),
	useGoogleDocs: tinyint().default(0).notNull(),
	templateFileUrl: text(),
	templateFileKey: varchar({ length: 500 }),
},
(table) => [
	index("category_idx").on(table.category),
	index("language_idx").on(table.language),
	index("active_idx").on(table.isActive),
]);

export const generatedDocuments = mysqlTable("generated_documents", {
	id: int().autoincrement().notNull(),
	templateId: int().notNull(),
	userId: int().notNull(),
	officeId: int(),
	bookingId: int(),
	documentName: varchar({ length: 255 }).notNull(),
	filledData: json().notNull(),
	fileUrl: text().notNull(),
	fileKey: varchar({ length: 255 }).notNull(),
	status: mysqlEnum(['draft','generated','delivered']).default('generated').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("template_idx").on(table.templateId),
	index("user_idx").on(table.userId),
	index("office_idx").on(table.officeId),
	index("booking_idx").on(table.bookingId),
]);

export const loyaltyPoints = mysqlTable("loyalty_points", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	totalPoints: int().default(0).notNull(),
	availablePoints: int().default(0).notNull(),
	redeemedPoints: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("user_idx").on(table.userId),
]);

export const loyaltyTransactions = mysqlTable("loyalty_transactions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	type: mysqlEnum(['earn','redeem']).notNull(),
	points: int().notNull(),
	reason: varchar({ length: 255 }).notNull(),
	bookingId: int(),
	reviewId: int(),
	referralId: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("user_idx").on(table.userId),
	index("type_idx").on(table.type),
]);

export const notifications = mysqlTable("notifications", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	type: mysqlEnum(['booking','points','system','review','referral']).notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	bookingId: int(),
	reviewId: int(),
	referralId: int(),
	isRead: tinyint().default(0).notNull(),
	readAt: timestamp({ mode: 'string' }),
	actionUrl: varchar({ length: 500 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("user_idx").on(table.userId),
	index("type_idx").on(table.type),
	index("read_idx").on(table.isRead),
	index("date_idx").on(table.createdAt),
]);

export const officeNotificationPreferences = mysqlTable("office_notification_preferences", {
	id: int().autoincrement().notNull(),
	officeId: int().notNull(),
	serviceTypes: json().notNull(),
	governorates: json().notNull(),
	minBudget: int().default(0).notNull(),
	maxBudget: int().default(999999).notNull(),
	emailNotifications: tinyint().default(1).notNull(),
	inAppNotifications: tinyint().default(1).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("office_idx").on(table.officeId),
	index("active_idx").on(table.isActive),
	index("office_prefs_unique").on(table.officeId),
]);

export const officeAvailability = mysqlTable("office_availability", {
	id: int().autoincrement().notNull(),
	officeId: int().notNull(),
	dayOfWeek: int().notNull(),
	startTime: varchar({ length: 10 }).notNull(),
	endTime: varchar({ length: 10 }).notNull(),
	slotDuration: int().default(60).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("office_idx").on(table.officeId),
	index("day_idx").on(table.dayOfWeek),
]);

export const officeStaff = mysqlTable("office_staff", {
	id: int().autoincrement().notNull(),
	officeId: int().notNull(),
	userId: int().notNull(),
	role: mysqlEnum(['owner','manager','agent']).default('agent').notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	availabilityStatus: mysqlEnum(['online','offline','busy']).default('offline').notNull(),
	expertiseTags: json(),
	lastActiveAt: timestamp({ mode: 'string' }),
},
(table) => [
	index("office_idx").on(table.officeId),
	index("user_idx").on(table.userId),
]);

export const qualityAlerts = mysqlTable("quality_alerts", {
	id: int().autoincrement().notNull(),
	alertType: mysqlEnum("alert_type", ['low_accuracy','high_revision_rate','memory_usage_drop']).notNull(),
	severity: mysqlEnum(['warning','critical']).notNull(),
	currentValue: decimal("current_value", { precision: 5, scale: 2 }).notNull(),
	thresholdValue: decimal("threshold_value", { precision: 5, scale: 2 }).notNull(),
	message: text().notNull(),
	status: mysqlEnum(['active','resolved','acknowledged']).default('active').notNull(),
	detectedAt: timestamp("detected_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	acknowledgedAt: timestamp("acknowledged_at", { mode: 'string' }),
	emailSent: tinyint("email_sent").default(0).notNull(),
	emailSentAt: timestamp("email_sent_at", { mode: 'string' }),
},
(table) => [
	index("status_idx").on(table.status),
	index("detected_at_idx").on(table.detectedAt),
]);

export const quizAttempts = mysqlTable("quiz_attempts", {
	id: int().autoincrement().notNull(),
	quizId: int("quiz_id").notNull().references(() => trainingQuizzes.id, { onDelete: "cascade" } ),
	userId: int("user_id").notNull().references(() => users.id),
	score: int().notNull(),
	totalQuestions: int("total_questions").notNull(),
	passed: tinyint().default(0),
	completedAt: timestamp("completed_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const quizOptions = mysqlTable("quiz_options", {
	id: int().autoincrement().notNull(),
	questionId: int("question_id").notNull().references(() => quizQuestions.id, { onDelete: "cascade" } ),
	optionText: text("option_text").notNull(),
	optionTextAr: text("option_text_ar"),
	isCorrect: tinyint("is_correct").default(0),
	orderIndex: int("order_index").default(0),
});

export const quizQuestions = mysqlTable("quiz_questions", {
	id: int().autoincrement().notNull(),
	quizId: int("quiz_id").notNull().references(() => trainingQuizzes.id, { onDelete: "cascade" } ),
	question: text().notNull(),
	questionAr: text("question_ar"),
	correctAnswer: text("correct_answer").notNull(),
	explanation: text(),
	explanationAr: text("explanation_ar"),
	orderIndex: int("order_index").default(0),
});

export const referrals = mysqlTable("referrals", {
	id: int().autoincrement().notNull(),
	referrerId: int().notNull(),
	referralCode: varchar({ length: 20 }).notNull(),
	referredId: int(),
	status: mysqlEnum(['pending','completed','expired']).default('pending').notNull(),
	pointsAwarded: tinyint().default(0).notNull(),
	firstBookingId: int(),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("referrals_referralCode_unique").on(table.referralCode),
	index("referrer_idx").on(table.referrerId),
	index("referred_idx").on(table.referredId),
	index("code_idx").on(table.referralCode),
	index("status_idx").on(table.status),
]);

export const regionalCampaigns = mysqlTable("regional_campaigns", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	titleAr: varchar({ length: 255 }),
	description: text().notNull(),
	descriptionAr: text(),
	targetRegion: varchar({ length: 100 }).notNull(),
	targetUserSegment: mysqlEnum(['all','new_users','returning_users','high_value']).default('all').notNull(),
	campaignType: mysqlEnum(['seasonal','promotional','awareness','special_event']).default('promotional').notNull(),
	bannerImageUrl: text(),
	backgroundColor: varchar({ length: 20 }).default('#003366'),
	textColor: varchar({ length: 20 }).default('#FFFFFF'),
	ctaText: varchar({ length: 100 }),
	ctaTextAr: varchar({ length: 100 }),
	ctaLink: varchar({ length: 500 }),
	discountPercentage: int(),
	discountCode: varchar({ length: 50 }),
	startDate: timestamp({ mode: 'string' }).notNull(),
	endDate: timestamp({ mode: 'string' }).notNull(),
	isActive: tinyint().default(1).notNull(),
	priority: int().default(0).notNull(),
	impressions: int().default(0).notNull(),
	clicks: int().default(0).notNull(),
	conversions: int().default(0).notNull(),
	createdBy: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("region_idx").on(table.targetRegion),
	index("active_idx").on(table.isActive),
	index("date_idx").on(table.startDate, table.endDate),
	index("priority_idx").on(table.priority),
]);

export const requestMessages = mysqlTable("request_messages", {
	id: int().autoincrement().notNull(),
	requestId: int("request_id").notNull(),
	senderId: int("sender_id").notNull(),
	senderType: mysqlEnum("sender_type", ['customer','office']).notNull(),
	message: text().notNull(),
	attachments: json(),
	isRead: tinyint("is_read").default(0),
	readAt: timestamp("read_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("request_idx").on(table.requestId),
	index("sender_idx").on(table.senderId),
	index("created_at_idx").on(table.createdAt),
]);

export const reviewPhotos = mysqlTable("review_photos", {
	id: int().autoincrement().notNull(),
	reviewId: int().notNull(),
	photoUrl: text().notNull(),
	photoKey: text().notNull(),
	uploadedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("review_idx").on(table.reviewId),
]);

export const reviewVotes = mysqlTable("review_votes", {
	id: int().autoincrement().notNull(),
	reviewId: int().notNull(),
	userId: int().notNull(),
	voteType: mysqlEnum(['helpful','not_helpful']).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("review_user_idx").on(table.reviewId, table.userId),
	index("review_idx").on(table.reviewId),
]);

export const reviews = mysqlTable("reviews", {
	id: int().autoincrement().notNull(),
	officeId: int().notNull(),
	bookingId: int(),
	userId: int().notNull(),
	rating: int().notNull(),
	reviewText: text(),
	responseText: text(),
	respondedAt: timestamp({ mode: 'string' }),
	respondedBy: int(),
	isVisible: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("office_idx").on(table.officeId),
	index("user_idx").on(table.userId),
	index("booking_idx").on(table.bookingId),
	index("visible_idx").on(table.isVisible),
]);

export const sanadOfficeServices = mysqlTable("sanad_office_services", {
	id: int().autoincrement().notNull(),
	officeId: int().notNull(),
	serviceName: varchar({ length: 255 }).notNull(),
	serviceNameAr: varchar({ length: 255 }),
	category: varchar({ length: 100 }).notNull(),
	description: text(),
	descriptionAr: text(),
	price: decimal({ precision: 10, scale: 3 }),
	currency: varchar({ length: 3 }).default('OMR').notNull(),
	priceType: mysqlEnum(['fixed','hourly','custom']).default('fixed').notNull(),
	estimatedDeliveryDays: int(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("office_idx").on(table.officeId),
	index("category_idx").on(table.category),
	index("active_idx").on(table.isActive),
]);

export const sanadOfficeStaff = mysqlTable("sanad_office_staff", {
	id: int().autoincrement().notNull(),
	officeId: int().notNull(),
	userId: int().notNull(),
	role: mysqlEnum(['owner','manager','staff','viewer']).default('staff').notNull(),
	permissions: json(),
	status: mysqlEnum(['active','inactive','invited']).default('invited').notNull(),
	invitedAt: timestamp({ mode: 'string' }),
	joinedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("unique_office_user").on(table.officeId, table.userId),
	index("office_idx").on(table.officeId),
	index("user_idx").on(table.userId),
]);

export const sanadOffices = mysqlTable("sanad_offices", {
	id: int().autoincrement().notNull(),
	officeName: varchar({ length: 255 }).notNull(),
	officeNameAr: varchar({ length: 255 }),
	slug: varchar({ length: 255 }).notNull(),
	commercialRegistration: varchar({ length: 100 }).notNull(),
	tradeLicense: varchar({ length: 100 }),
	taxRegistration: varchar({ length: 100 }),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 20 }).notNull(),
	whatsapp: varchar({ length: 20 }),
	website: text(),
	governorate: varchar({ length: 100 }).notNull(),
	wilayat: varchar({ length: 100 }).notNull(),
	addressLine1: text().notNull(),
	addressLine2: text(),
	postalCode: varchar({ length: 20 }),
	locationLat: decimal({ precision: 10, scale: 7 }),
	locationLng: decimal({ precision: 10, scale: 7 }),
	description: text(),
	descriptionAr: text(),
	yearEstablished: int(),
	employeeCount: int().default(1).notNull(),
	status: mysqlEnum(['pending','active','suspended','inactive']).default('pending').notNull(),
	verificationStatus: mysqlEnum(['unverified','pending_verification','verified','rejected']).default('unverified').notNull(),
	verifiedAt: timestamp({ mode: 'string' }),
	verifiedBy: int(),
	ownerId: int().notNull(),
	acceptsOnlineBookings: tinyint().default(1).notNull(),
	autoAcceptBookings: tinyint().default(0).notNull(),
	workingHours: json(),
	logoUrl: text(),
	coverImageUrl: text(),
	images: json(),
	totalOrders: int().default(0).notNull(),
	completedOrders: int().default(0).notNull(),
	averageRating: decimal({ precision: 3, scale: 2 }).default('0.00').notNull(),
	totalReviews: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	createdBy: int(),
	updatedBy: int(),
	cancellationWindowHours: int().default(24).notNull(),
	cancellationPenaltyPercent: int().default(0).notNull(),
	licenseDocumentUrl: text(),
	certificateUrls: json(),
	permitUrls: json(),
	licenseExpiryDate: timestamp({ mode: 'string' }),
	tradeLicenseExpiryDate: timestamp({ mode: 'string' }),
	taxRegistrationExpiryDate: timestamp({ mode: 'string' }),
	performanceScore: decimal({ precision: 5, scale: 2 }).default('0'),
	performanceRank: int().default(0),
},
(table) => [
	index("sanad_offices_slug_unique").on(table.slug),
	index("sanad_offices_commercialRegistration_unique").on(table.commercialRegistration),
	index("owner_idx").on(table.ownerId),
	index("status_idx").on(table.status),
	index("governorate_idx").on(table.governorate),
	index("verification_idx").on(table.verificationStatus),
]);

export const scheduledFollowups = mysqlTable("scheduled_followups", {
	id: int().autoincrement().notNull(),
	conversationId: int().notNull(),
	officeId: int().notNull(),
	scheduledFor: timestamp({ mode: 'string' }).notNull(),
	triggerType: mysqlEnum(['24h','48h','manual']).default('24h').notNull(),
	messageTemplate: text().notNull(),
	status: mysqlEnum(['pending','sent','cancelled']).default('pending').notNull(),
	sentAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const securityAlerts = mysqlTable("security_alerts", {
	id: int().autoincrement().notNull(),
	alertType: mysqlEnum(['multiple_failed_logins','impossible_travel','fast_travel','country_change','mfa_failure','suspicious_ip','password_reset_abuse','session_hijacking','brute_force_attempt','account_lockout']).notNull(),
	severity: mysqlEnum(['low','medium','high','critical']).notNull(),
	status: mysqlEnum(['new','investigating','resolved','false_positive']).default('new').notNull(),
	userId: int(),
	openId: varchar({ length: 64 }),
	sessionId: varchar({ length: 255 }),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	location: json(),
	metadata: json(),
	resolvedBy: int(),
	resolvedAt: timestamp({ mode: 'string' }),
	resolutionNotes: text(),
	notificationSent: tinyint().default(0),
	notificationSentAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("user_id_idx").on(table.userId),
	index("alert_type_idx").on(table.alertType),
	index("severity_idx").on(table.severity),
	index("status_idx").on(table.status),
	index("created_at_idx").on(table.createdAt),
]);

export const serviceBids = mysqlTable("service_bids", {
	id: int().autoincrement().notNull(),
	requestId: int("request_id").notNull(),
	officeId: int("office_id").notNull(),
	proposedPrice: decimal("proposed_price", { precision: 10, scale: 2 }).notNull(),
	currency: varchar({ length: 3 }).default('OMR').notNull(),
	estimatedDuration: varchar("estimated_duration", { length: 100 }),
	coverLetter: text("cover_letter").notNull(),
	methodology: text(),
	portfolio: json(),
	status: mysqlEnum(['pending','accepted','rejected','withdrawn']).default('pending').notNull(),
	viewedByCustomer: tinyint("viewed_by_customer").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("request_idx").on(table.requestId),
	index("office_idx").on(table.officeId),
	index("status_idx").on(table.status),
]);

export const serviceBundles = mysqlTable("service_bundles", {
	id: int().autoincrement().notNull(),
	officeId: int("office_id").notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).notNull(),
	validFrom: timestamp("valid_from", { mode: 'string' }),
	validUntil: timestamp("valid_until", { mode: 'string' }),
	isActive: tinyint("is_active").default(1).notNull(),
	createdBy: int("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("office_idx").on(table.officeId),
	index("active_idx").on(table.isActive),
]);

export const serviceRequests = mysqlTable("service_requests", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	serviceType: varchar("service_type", { length: 100 }).notNull(),
	category: varchar({ length: 100 }),
	requirements: text(),
	documents: json(),
	budgetMin: decimal("budget_min", { precision: 10, scale: 2 }),
	budgetMax: decimal("budget_max", { precision: 10, scale: 2 }),
	currency: varchar({ length: 3 }).default('OMR').notNull(),
	deadline: timestamp({ mode: 'string' }),
	urgency: mysqlEnum(['low','medium','high','urgent']).default('medium'),
	governorate: varchar({ length: 100 }),
	wilayat: varchar({ length: 100 }),
	remoteAccepted: tinyint("remote_accepted").default(1),
	status: mysqlEnum(['open','bidding','awarded','in_progress','completed','cancelled','expired']).default('open').notNull(),
	acceptedBidId: int("accepted_bid_id"),
	viewCount: int("view_count").default(0),
	bidCount: int("bid_count").default(0),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("user_idx").on(table.userId),
	index("status_idx").on(table.status),
	index("category_idx").on(table.category),
	index("urgency_idx").on(table.urgency),
	index("location_idx").on(table.governorate, table.wilayat),
]);

export const templateDownloads = mysqlTable("template_downloads", {
	id: int().autoincrement().notNull(),
	templateId: int().notNull(),
	userId: int().notNull(),
	downloadedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
},
(table) => [
	index("template_idx").on(table.templateId),
	index("user_idx").on(table.userId),
	index("date_idx").on(table.downloadedAt),
]);

export const trainingMaterials = mysqlTable("training_materials", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	titleAr: varchar("title_ar", { length: 255 }),
	content: text().notNull(),
	contentAr: text("content_ar"),
	category: mysqlEnum(['guidelines','common_mistakes','best_practices','examples']).notNull(),
	orderIndex: int("order_index").default(0),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const trainingQuizzes = mysqlTable("training_quizzes", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	titleAr: varchar("title_ar", { length: 255 }),
	description: text(),
	descriptionAr: text("description_ar"),
	passingScore: int("passing_score").default(70),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const translationActivityLog = mysqlTable("translation_activity_log", {
	id: int().autoincrement().notNull(),
	entityType: mysqlEnum(['office','template']).notNull(),
	entityId: int().notNull(),
	entityName: varchar({ length: 255 }).notNull(),
	translatorId: int().notNull(),
	translatorName: varchar({ length: 255 }).notNull(),
	actionType: mysqlEnum(['created','updated','bulk_import']).notNull(),
	fieldChanged: varchar({ length: 50 }),
	previousValue: text(),
	newValue: text(),
	source: mysqlEnum(['manual','bulk_import','request_approval']).default('manual').notNull(),
	requestId: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("entity_idx").on(table.entityType, table.entityId),
	index("translator_idx").on(table.translatorId),
	index("action_idx").on(table.actionType),
	index("source_idx").on(table.source),
	index("date_idx").on(table.createdAt),
]);

export const translationMemory = mysqlTable("translation_memory", {
	id: int().autoincrement().notNull(),
	sourceText: text().notNull(),
	translatedText: text().notNull(),
	sourceLanguage: varchar({ length: 10 }).default('en').notNull(),
	targetLanguage: varchar({ length: 10 }).default('ar').notNull(),
	context: varchar({ length: 100 }),
	usageCount: int().default(0).notNull(),
	lastUsedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdBy: int().notNull(),
},
(table) => [
	index("source_idx").on(table.sourceText),
	index("context_idx").on(table.context),
	index("usage_idx").on(table.usageCount),
]);

export const translationRequests = mysqlTable("translation_requests", {
	id: int().autoincrement().notNull(),
	entityType: mysqlEnum(['office','template']).notNull(),
	entityId: int().notNull(),
	requesterId: int().notNull(),
	requesterName: varchar({ length: 255 }).notNull(),
	requesterEmail: varchar({ length: 320 }),
	currentNameEn: varchar({ length: 255 }).notNull(),
	currentDescriptionEn: text(),
	proposedNameAr: varchar({ length: 255 }),
	proposedDescriptionAr: text(),
	notes: text(),
	status: mysqlEnum(['pending','approved','rejected','completed']).default('pending').notNull(),
	priority: mysqlEnum(['low','medium','high']).default('medium').notNull(),
	reviewedBy: int(),
	reviewedAt: timestamp({ mode: 'string' }),
	reviewNotes: text(),
	completedBy: int(),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("entity_idx_req").on(table.entityType, table.entityId),
	index("requester_idx").on(table.requesterId),
	index("status_idx").on(table.status),
	index("priority_idx").on(table.priority),
	index("created_at_idx").on(table.createdAt),
]);

export const translationReviewComments = mysqlTable("translation_review_comments", {
	id: int().autoincrement().notNull(),
	reviewId: int("review_id").notNull(),
	userId: int("user_id").notNull(),
	userName: varchar("user_name", { length: 255 }).notNull(),
	comment: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("review_id_idx").on(table.reviewId),
]);

export const translationReviews = mysqlTable("translation_reviews", {
	id: int().autoincrement().notNull(),
	entityType: mysqlEnum("entity_type", ['office','template']).notNull(),
	entityId: int("entity_id").notNull(),
	fieldName: varchar("field_name", { length: 50 }).notNull(),
	translatedText: text("translated_text").notNull(),
	status: mysqlEnum(['pending','approved','rejected','needs_revision']).default('pending').notNull(),
	submittedBy: int("submitted_by").notNull(),
	submittedByName: varchar("submitted_by_name", { length: 255 }).notNull(),
	reviewedBy: int("reviewed_by"),
	reviewedByName: varchar("reviewed_by_name", { length: 255 }),
	reviewNotes: text("review_notes"),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
},
(table) => [
	index("entity_idx").on(table.entityType, table.entityId),
	index("status_idx").on(table.status),
	index("submitted_by_idx").on(table.submittedBy),
]);

export const translationVersions = mysqlTable("translation_versions", {
	id: int().autoincrement().notNull(),
	entityType: mysqlEnum(['office','template']).notNull(),
	entityId: int().notNull(),
	fieldName: varchar({ length: 50 }).notNull(),
	oldValue: text(),
	newValue: text(),
	changedBy: int().notNull(),
	changedByName: varchar({ length: 255 }).notNull(),
	changeReason: text(),
	source: mysqlEnum(['manual','bulk_import','request_approval','auto_translate']).default('manual').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("entity_idx").on(table.entityType, table.entityId),
	index("changed_by_idx").on(table.changedBy),
	index("date_idx").on(table.createdAt),
]);

export const untranslatedContentAlerts = mysqlTable("untranslated_content_alerts", {
	id: int().autoincrement().notNull(),
	contentType: mysqlEnum("content_type", ['office','template']).notNull(),
	contentId: int("content_id").notNull(),
	priority: mysqlEnum(['low','medium','high','critical']).default('medium'),
	status: mysqlEnum(['pending','in_progress','resolved']).default('pending'),
	notificationSent: tinyint("notification_sent").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
},
(table) => [
	index("content_idx").on(table.contentType, table.contentId),
	index("status_idx").on(table.status),
	index("priority_idx").on(table.priority),
]);

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin','sanad_owner','sanad_staff','sme_owner','gig_worker','government_official']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	phone: varchar({ length: 20 }),
	avatarUrl: text(),
	referralCode: varchar({ length: 20 }),
	preferredLanguage: varchar({ length: 10 }).default('en'),
	notificationPreferences: json(),
	whatsappEnabled: tinyint().default(0),
	mfaEnabled: tinyint().default(0),
	mfaSecret: varchar({ length: 255 }),
	mfaBackupCodes: json(),
	mfaEnabledAt: timestamp({ mode: 'string' }),
	emailVerified: tinyint().default(0),
	emailVerificationToken: varchar({ length: 255 }),
	emailVerificationExpiry: timestamp({ mode: 'string' }),
	recoveryEmail: varchar({ length: 320 }),
	recoveryEmailVerified: tinyint().default(0),
	passwordResetToken: varchar({ length: 255 }),
	passwordResetExpiry: timestamp({ mode: 'string' }),
},
(table) => [
	index("users_openId_unique").on(table.openId),
	index("email_idx").on(table.email),
	index("role_idx").on(table.role),
	index("users_referralCode_unique").on(table.referralCode),
]);


// Client Management System
export const clients = mysqlTable("clients", {
	id: int().autoincrement().notNull(),
	officeId: int().notNull(),
	userId: int(), // Link to user account if they have one
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 20 }),
	address: text(),
	city: varchar({ length: 100 }),
	region: varchar({ length: 100 }),
	dateOfBirth: date(),
	nationalId: varchar({ length: 50 }),
	notes: text(),
	tags: json(), // Array of tag strings
	status: mysqlEnum(['active','inactive','blocked']).default('active').notNull(),
	totalBookings: int().default(0).notNull(),
	totalSpent: decimal({ precision: 10, scale: 2 }).default('0.00').notNull(),
	lastBookingDate: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("office_id_idx").on(table.officeId),
	index("user_id_idx").on(table.userId),
	index("email_idx").on(table.email),
	index("phone_idx").on(table.phone),
	index("status_idx").on(table.status),
	index("created_at_idx").on(table.createdAt),
]);

export const clientDocuments = mysqlTable("client_documents", {
	id: int().autoincrement().notNull(),
	clientId: int().notNull(),
	officeId: int().notNull(),
	documentType: varchar({ length: 100 }).notNull(), // e.g., 'id_copy', 'contract', 'receipt'
	documentName: varchar({ length: 255 }).notNull(),
	documentUrl: text().notNull(),
	fileSize: int(), // in bytes
	mimeType: varchar({ length: 100 }),
	expiryDate: date(),
	notes: text(),
	uploadedBy: int().notNull(), // user ID who uploaded
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("client_id_idx").on(table.clientId),
	index("office_id_idx").on(table.officeId),
	index("document_type_idx").on(table.documentType),
	index("expiry_date_idx").on(table.expiryDate),
	index("created_at_idx").on(table.createdAt),
]);

export const clientNotes = mysqlTable("client_notes", {
	id: int().autoincrement().notNull(),
	clientId: int().notNull(),
	officeId: int().notNull(),
	note: text().notNull(),
	createdBy: int().notNull(), // staff member who created the note
	createdByName: varchar({ length: 255 }).notNull(),
	isImportant: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("client_id_idx").on(table.clientId),
	index("office_id_idx").on(table.officeId),
	index("created_at_idx").on(table.createdAt),
	index("is_important_idx").on(table.isImportant),
]);
