import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
  isRTL: boolean;
  currentLanguage: Language;
  isArabic: boolean;
  formatRating: (rating: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.sanadOffices": "Sanad Offices",
    "nav.documentTemplates": "Document Templates",
    "nav.myBookings": "My Bookings",
    "nav.myOffices": "My Offices",
    "nav.ownerDashboard": "Owner Dashboard",
    "nav.chatInbox": "Chat Inbox",
    "nav.chatAnalytics": "Chat Analytics",
    "nav.cannedResponses": "Canned Responses",
    "nav.staffManagement": "Staff Management",
    "nav.staffPerformance": "Staff Performance",
    "nav.followUpSettings": "Follow-up Settings",
    "nav.loyaltyRewards": "Loyalty Rewards",
    "nav.referFriends": "Refer Friends",
    "nav.analytics": "Analytics",
    "nav.userProfile": "User Profile",
    "nav.contentTranslation": "Content Translation",
    "nav.notificationPreferences": "Notification Preferences",
    "nav.adminDashboard": "Admin Dashboard",
    "nav.adminAnalytics": "Admin Analytics",
    "nav.marketplace": "Browse Marketplace",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "nav.myServiceRequests": "My Service Requests",
    "nav.browseMarketplace": "Browse Marketplace",
    "nav.officeAnalytics": "Office Analytics",
    "nav.userManagement": "User Management",
    "nav.officeVerification": "Office Verification",
    "nav.translationRequests": "Translation Requests",
    "nav.translationAnalytics": "Translation Analytics",
    "nav.regionalStatistics": "Regional Statistics",
    "nav.leaderboards": "Regional Leaderboards",
    "nav.translationQuality": "Translation Quality",
    "nav.reviewQueue": "Review Queue",
    "nav.batchProcessing": "Batch Processing",
    "nav.translatorTraining": "Translator Training",
    "nav.securityDashboard": "Security Dashboard",
    "nav.loginAnalytics": "Login Analytics",
    "nav.clients": "Clients",
    
    // Sidebar section headers
    "sidebar.sectionMain": "MAIN",
    "sidebar.sectionMyServices": "MY SERVICES",
    "sidebar.sectionOfficeManagement": "OFFICE MANAGEMENT",
    "sidebar.sectionAdminPanel": "ADMIN PANEL",
    "sidebar.sectionRewardsProfile": "REWARDS & PROFILE",
    
    // Home page
    "home.hero.title": "Everything You Need for Business Services",
    "home.hero.subtitle": "A unified platform connecting SMEs with professional Sanad offices. Get your business licenses, permits, and registrations done faster.",
    "home.hero.myBookings": "My Bookings",
    "home.hero.browseServices": "Browse Services",
    "home.hero.badge": "The Future of Business Services",
    "home.hero.registerOffice": "Register Your Office",
    "home.hero.impactStatement": "Simplifying business, strengthening Omanization, and securing the future of Omani employment.",
    "home.stats.avgRating": "Average Rating",
    "home.stats.servicesCompleted": "Services Completed",
    "home.stats.verifiedOffices": "Verified Offices",
    "home.title": "Everything You Need for Business Services",
    "home.subtitle": "A unified platform connecting SMEs with professional Sanad offices",
    "home.popularServices": "Popular Services",
    "home.popularServicesSubtitle": "Discover the most requested business services in your region",
    "home.findOffices": "Find Offices",

    // Regional Statistics
    "regionalStats.title": "Regional Statistics",
    "regionalStats.subtitle": "Analyze office distribution, booking trends, and service demand across Oman's governorates",
    "regionalStats.totalOffices": "Total Offices",
    "regionalStats.acrossRegions": "Across {count} regions",
    "regionalStats.totalBookings": "Total Bookings",
    "regionalStats.allRegions": "All regions combined",
    "regionalStats.totalRevenue": "Total Revenue",
    "regionalStats.combinedRevenue": "Combined from all regions",
    "regionalStats.topRegion": "Top Region",
    "regionalStats.byBookings": "By number of bookings",
    "regionalStats.officeDistribution": "Office Distribution by Region",
    "regionalStats.officeDistributionDesc": "Number of active offices in each governorate",
    "regionalStats.offices": "Offices",
    "regionalStats.bookingTrends": "Booking Trends",
    "regionalStats.bookingTrendsDesc": "Distribution of bookings across regions",
    "regionalStats.revenueByRegion": "Revenue by Region",
    "regionalStats.revenueByRegionDesc": "Total revenue generated in each governorate",
    "regionalStats.revenue": "Revenue",
    "regionalStats.serviceDemand": "Top Services by Region",
    "regionalStats.serviceDemandDesc": "Most requested services across different governorates",
    "regionalStats.requests": "requests",
    "regionalStats.underservedAreas": "Underserved Areas",
    "regionalStats.underservedAreasDesc": "Regions with fewer than 5 active offices that need expansion",
    "regionalStats.needsExpansion": "Needs Expansion",
    "home.templates": "Document Templates",
    "home.templatesDesc": "Access thousands of business document templates",
    "home.browseTemplates": "Browse templates",
    "home.browseOffices": "Browse Offices",
    "home.offices": "Trusted Offices",
    "home.officesDesc": "Connect with certified Sanad offices across Oman",
    "office.exploreOffices": "Explore Offices",
    "office.notFound": "Office Not Found",
    "office.browseOffices": "Browse Offices",
    "office.backToOffices": "Back to Offices",
    "office.verified": "Verified",
    "office.website": "Website",
    "office.bookService": "Book Service",
    "office.about": "About",
    "office.services": "Services",
    "office.reviews": "Reviews",
    "office.aboutThisOffice": "About This Office",
    "office.location": "Location",
    "office.contactInformation": "Contact Information",
    "office.phone": "Phone",
    "office.email": "Email",
    "office.availableServices": "Available Services",
    "office.servicesDescription": "Professional business services offered by this office",
    "office.noServices": "No services listed yet",
    "office.anonymous": "Anonymous",
    "office.noReviews": "No reviews yet. Be the first to review!",
    "office.readyToBook": "Ready to book a service?",
    "office.selectServiceAndBook": "Select from our available services and schedule your appointment",
    "office.noServicesMatchFilters": "No services match your filters. Try adjusting your criteria.",
    "office.customQuote": "Custom Quote",
    "office.days": "days",
    
    // Client Management
    "clients.title": "Client Management",
    "clients.subtitle": "Manage your clients, documents, and interactions",
    "clients.addClient": "Add Client",
    "clients.searchPlaceholder": "Search by name, email, or phone...",
    "clients.filterByStatus": "Filter by Status",
    "clients.allStatuses": "All Statuses",
    "clients.active": "Active",
    "clients.inactive": "Inactive",
    "clients.sortBy": "Sort By",
    "clients.nameAsc": "Name (A-Z)",
    "clients.nameDesc": "Name (Z-A)",
    "clients.dateAsc": "Oldest First",
    "clients.dateDesc": "Newest First",
    "clients.totalClients": "Total Clients",
    "clients.activeClients": "Active Clients",
    "clients.newThisMonth": "New This Month",
    "clients.expiringDocuments": "Expiring Documents",
    "clients.name": "Name",
    "clients.email": "Email",
    "clients.phone": "Phone",
    "clients.status": "Status",
    "clients.createdAt": "Created",
    "clients.actions": "Actions",
    "clients.view": "View",
    "clients.edit": "Edit",
    "clients.delete": "Delete",
    "clients.noClients": "No clients found",
    "clients.noClientsDesc": "Start by adding your first client",
    "clients.profile": "Client Profile",
    "clients.overview": "Overview",
    "clients.history": "History",
    "clients.documents": "Documents",
    "clients.notes": "Notes",
    "clients.contactInfo": "Contact Information",
    "clients.address": "Address",
    "clients.tags": "Tags",
    "clients.addTag": "Add Tag",
    "clients.bookings": "Bookings",
    "clients.totalBookings": "Total Bookings",
    "clients.completedBookings": "Completed",
    "clients.pendingBookings": "Pending",
    "clients.totalSpent": "Total Spent",
    "clients.lastBooking": "Last Booking",
    "clients.noBookings": "No bookings yet",
    "clients.documentName": "Document Name",
    "clients.documentType": "Document Type",
    "clients.uploadDate": "Upload Date",
    "clients.expiryDate": "Expiry Date",
    "clients.download": "Download",
    "clients.addDocument": "Add Document",
    "clients.noDocuments": "No documents uploaded",
    "clients.noteContent": "Note Content",
    "clients.noteDate": "Date",
    "clients.addNote": "Add Note",
    "clients.editNote": "Edit Note",
    "clients.deleteNote": "Delete Note",
    "clients.noNotes": "No notes yet",
    "clients.saveNote": "Save Note",
    "clients.cancel": "Cancel",
    "clients.save": "Save",
    "clients.editClient": "Edit Client",
    "clients.addClientTitle": "Add New Client",
    "clients.fullName": "Full Name",
    "clients.emailAddress": "Email Address",
    "clients.phoneNumber": "Phone Number",
    "clients.company": "Company",
    "clients.clientStatus": "Client Status",
    "clients.deleteConfirm": "Are you sure you want to delete this client?",
    "clients.deleteSuccess": "Client deleted successfully",
    "clients.deleteError": "Failed to delete client",
    "clients.addSuccess": "Client added successfully",
    "clients.addError": "Failed to add client",
    "clients.updateSuccess": "Client updated successfully",
    "clients.updateError": "Failed to update client",
    "clients.noteAddSuccess": "Note added successfully",
    "clients.noteUpdateSuccess": "Note updated successfully",
    "clients.noteDeleteSuccess": "Note deleted successfully",
    "clients.documentAddSuccess": "Document added successfully",
    "clients.documentDeleteSuccess": "Document deleted successfully",
    
    // Booking Wizard
    "booking.selectService": "Select Service",
    "booking.chooseYourService": "Choose your service",
    "booking.requirements": "Requirements",
    "booking.provideDetails": "Provide details",
    "booking.dateTime": "Date & Time",
    "booking.pickSlot": "Pick a slot",
    "booking.review": "Review",
    "booking.confirmBooking": "Confirm booking",
    "booking.serviceSelected": "Service Selected",
    "booking.serviceMatchDescription": "Based on your preferences, this service is a great match!",
    "booking.bookingFailed": "Booking Failed",
    "booking.pleaseSelectService": "Please select a service",
    "booking.missingRequiredInfo": "Missing Required Information",
    "booking.pleaseFillIn": "Please fill in: {fields}",
    "booking.pleaseSelectDate": "Please select a date",
    "booking.pleaseSelectTimeSlot": "Please select a time slot",
    "booking.serviceBooking": "Service booking",
    "booking.reschedule": "Reschedule",
    "booking.rescheduleBooking": "Reschedule Booking",
    "booking.rescheduleDescription": "Select a new date and time for your appointment",
    "booking.currentSchedule": "Current Schedule",
    "booking.selectNewDate": "Select New Date",
    "booking.selectNewTime": "Select New Time",
    "booking.reasonForReschedule": "Reason for Rescheduling",
    "booking.reasonPlaceholder": "Please explain why you need to reschedule...",
    "booking.reasonHint": "This helps the office prepare for your new appointment",
    "booking.confirmReschedule": "Confirm Reschedule",
    "booking.rescheduleSuccess": "Booking rescheduled successfully",
    "booking.rescheduleError": "Failed to reschedule booking",
    "booking.selectDateTime": "Please select both date and time",
    "booking.reasonRequired": "Please provide a reason for rescheduling",
    "booking.noSlotsAvailable": "No time slots available for this date",
    "booking.sameDateTimeWarning": "You've selected the same date and time. Please choose a different slot.",
    "booking.timeline.title": "Booking Timeline",
    "booking.timeline.description": "Track your booking progress from start to finish",
    "booking.timeline.bookingCreated": "Booking request submitted",
    "booking.timeline.bookingConfirmed": "Office confirmed your booking",
    "booking.timeline.appointmentScheduled": "Appointment scheduled for",
    "booking.timeline.serviceCompleted": "Service completed successfully",
    "booking.timeline.bookingCancelled": "Booking cancelled",
    "booking.timeline.current": "Current",
    "booking.timeline.by": "by",
    "booking.timeline.nextSteps": "Next Steps",
    "booking.timeline.nextSteps.pending": "Waiting for office confirmation. You'll be notified once confirmed.",
    "booking.timeline.nextSteps.confirmed": "Your appointment is confirmed. Please arrive on time.",
    "chat.title": "Chat with Office",
    "chat.description": "Send messages to",
    "chat.noMessages": "No messages yet",
    "chat.startConversation": "Start a conversation with the office",
    "chat.placeholder": "Type your message... (Press Enter to send, Shift+Enter for new line)",
    "chat.hint": "Messages are typically responded to within a few hours during business hours",
    "chat.sendError": "Failed to send message",
    "chat.emptyMessage": "Please type a message before sending",
    "documents.title": "Documents & Deliverables",
    "documents.description": "View and download completed documents from your service",
    "documents.noDocuments": "No documents yet",
    "documents.willBeAvailable": "Documents will appear here once the office completes your service",
    "documents.status.delivered": "Delivered",
    "documents.status.pending": "Pending",
    "documents.status.failed": "Failed",
    "documents.uploaded": "Uploaded",
    "documents.view": "View",
    "documents.download": "Download",
    "documents.downloadStarted": "Download started",
    "documents.processing": "Processing",
    "documents.infoTitle": "Important Information",
    "documents.infoMessage": "All documents are securely stored and can be downloaded at any time. Keep these documents safe for your records.",
    "payment.title": "Payment Information",
    "payment.description": "View your payment details and download invoices",
    "payment.totalAmount": "Total Amount",
    "payment.status.paid": "Paid",
    "payment.status.pending": "Pending",
    "payment.status.failed": "Failed",
    "payment.status.refunded": "Refunded",
    "payment.serviceCharge": "Service Charge",
    "payment.tax": "Tax (VAT)",
    "payment.discount": "Discount",
    "payment.total": "Total",
    "payment.paidAmount": "Paid Amount",
    "payment.remainingAmount": "Remaining Amount",
    "payment.paymentMethod": "Payment Method",
    "payment.transactionId": "Transaction ID",
    "payment.paidAt": "Paid At",
    "payment.downloadInvoice": "Download Invoice",
    "payment.downloadReceipt": "Download Receipt",
    "payment.invoiceDownloadStarted": "Invoice download started",
    "payment.receiptDownloadStarted": "Receipt download started",
    "payment.invoiceNotAvailable": "Invoice not available yet",
    "payment.receiptNotAvailable": "Receipt not available yet",
    "payment.note": "Payment Note",
    "reminders.title": "Appointment Reminders",
    "reminders.description": "Manage your notification preferences for this booking",
    "reminders.scheduledFor": "Appointment Scheduled",
    "reminders.notificationSettings": "Notification Settings",
    "reminders.24hoursBefore": "24 Hours Before",
    "reminders.24hoursDesc": "Receive a reminder one day before your appointment",
    "reminders.2hoursBefore": "2 Hours Before",
    "reminders.2hoursDesc": "Receive a reminder 2 hours before your appointment",
    "reminders.emailReminder": "Email Notifications",
    "reminders.emailDesc": "Receive reminders via email",
    "reminders.smsReminder": "SMS Notifications",
    "reminders.smsDesc": "Receive reminders via SMS (text message)",
    "reminders.active": "Active",
    "reminders.willBeSentAt": "Will be sent at",
    "reminders.settingsUpdated": "Reminder settings updated",
    "reminders.updateError": "Failed to update reminder settings",
    "reminders.infoNote": "You can change these settings at any time. Reminders help ensure you don't miss your appointment.",
    
    // Templates Categories
    "templates.allTemplates": "All Templates",
    "templates.employment": "Employment",
    "templates.nocCertificates": "NOC Certificates",
    "templates.business": "Business",
    "templates.legal": "Legal",
    "templates.immigration": "Immigration",
    "templates.official": "Official",
    "templates.premium": "Premium",
    "templates.view": "View",
    "templates.previous": "Previous",
    "templates.next": "Next",
    "templates.page": "Page",
    "templates.noTemplatesFound": "No templates found",
    "templates.tryAdjustingFilters": "Try adjusting your search or filters",
    "templates.preview": "Preview",
    "templates.fillForm": "Fill Form",
    "templates.estimatedTime": "Est. Time",
    "templates.requiredFields": "Required",
    "templates.usedBy": "Used By",
    "templates.requiredInformation": "Required Information",
    "templates.optionalInformation": "Optional Information",
    "templates.sampleContent": "Sample Content",
    "templates.whatYouGet": "What You'll Get",
    "templates.professionalDocument": "Professional, ready-to-use document",
    "templates.editableFormat": "Editable DOCX format for customization",
    "templates.instantDownload": "Instant download after completion",
    "templates.officiallyRecognized": "Officially recognized format",
    
    // Form Wizard
    "wizard.step": "Step",
    "wizard.complete": "Complete",
    "wizard.optional": "Optional",
    "wizard.back": "Back",
    "wizard.next": "Next",
    "wizard.submit": "Submit",
    "wizard.submitting": "Submitting...",
    "wizard.resetProgress": "Reset Progress",
    "wizard.pleaseFixErrors": "Please fix the following errors:",
    
    // Bookings List (Additional)
    "bookings.serviceBookingDefault": "Service Booking",
    "bookings.dateNotScheduled": "Date not scheduled",
    "bookings.defaultCurrency": "OMR",
    
    // Regions
    "region.all": "All Oman",
    "region.allOman": "All Oman",
    "region.muscat": "Muscat",
    "region.dhofar": "Dhofar",
    "region.batinah": "Batinah",
    "region.sharqiyah": "Sharqiyah",
    "region.dakhliyah": "Dakhliyah",
    "region.selectRegion": "Select Region",
    "region.yourRegion": "Your Region",
    "region.showingOfficesIn": "Showing offices in",
    "region.showAllRegions": "Show all regions",
    "region.filteringByRegion": "Filtering by selected region",
    
    // Regional Services
    "services.businessRegistration": "Business Registration",
    "services.businessRegistrationDesc": "Register your business and obtain commercial licenses",
    "services.legalServices": "Legal Services",
    "services.legalServicesDesc": "Legal consultation and document preparation",
    "services.accountingTax": "Accounting & Tax",
    "services.accountingTaxDesc": "Tax filing, accounting, and financial services",
    "services.hrPayroll": "HR & Payroll",
    "services.hrPayrollDesc": "Human resources and payroll management",
    "services.portLogistics": "Port & Logistics",
    "services.portLogisticsDesc": "Port clearance, shipping, and logistics services",
    "services.importExport": "Import & Export",
    "services.importExportDesc": "Import/export documentation and customs clearance",
    "services.corporateServices": "Corporate Services",
    "services.corporateServicesDesc": "Corporate structuring and governance services",
    "services.tourismServices": "Tourism Services",
    "services.tourismServicesDesc": "Tourism licensing and hospitality permits",
    "services.hospitalityLicensing": "Hospitality Licensing",
    "services.hospitalityLicensingDesc": "Hotel, restaurant, and tourism facility licenses",
    "services.frankincenseTrade": "Frankincense Trade",
    "services.frankincenseTradeDesc": "Frankincense trading and export licenses",
    "services.culturalHeritage": "Cultural Heritage",
    "services.culturalHeritageDesc": "Cultural heritage site and museum permits",
    "services.agricultureLicensing": "Agriculture Licensing",
    "services.agricultureLicensingDesc": "Agricultural business and farm licenses",
    "services.fishingPermits": "Fishing Permits",
    "services.fishingPermitsDesc": "Commercial and recreational fishing permits",
    "services.foodProcessing": "Food Processing",
    "services.foodProcessingDesc": "Food processing and packaging licenses",
    "services.environmentalPermits": "Environmental Permits",
    "services.environmentalPermitsDesc": "Environmental compliance and permits",
    "services.maritimeServices": "Maritime Services",
    "services.maritimeServicesDesc": "Maritime business and vessel registration",
    "services.fishingIndustry": "Fishing Industry",
    "services.fishingIndustryDesc": "Fishing industry licenses and certifications",
    "services.coastalTourism": "Coastal Tourism",
    "services.coastalTourismDesc": "Beach and coastal tourism permits",
    "services.marineConservation": "Marine Conservation",
    "services.marineConservationDesc": "Marine conservation and research permits",
    "services.heritageBusiness": "Heritage Business",
    "services.heritageBusinessDesc": "Heritage site and traditional business licenses",
    "services.traditionalCrafts": "Traditional Crafts",
    "services.traditionalCraftsDesc": "Traditional crafts and handicraft licenses",
    "services.datesTrading": "Dates Trading",
    "services.datesTradingDesc": "Dates cultivation and trading licenses",
    "services.culturalTourism": "Cultural Tourism",
    "services.culturalTourismDesc": "Cultural tourism and heritage site permits",
    "services.popularInRegion": "Popular Services in",
    "services.viewAllServices": "View All Services",
    
    // Service Filters
    "services.filters": "Filters",
    "services.active": "Active",
    "services.clearFilters": "Clear Filters",
    "services.category": "Category",
    "services.selectCategory": "Select Category",
    "services.allCategories": "All Categories",
    "services.legal": "Legal",
    "services.business": "Business",
    "services.tax": "Tax",
    "services.registration": "Registration",
    "services.consultation": "Consultation",
    "services.priceRange": "Price Range",
    "services.resultsCount": "Showing {count} service(s)",
    "admin.contentTranslation": "Content Translation",
    "admin.contentTranslationDesc": "Manage Arabic translations for offices and templates",
    "admin.offices": "Offices",
    "admin.templates": "Templates",
    "admin.manageOfficeTranslations": "Manage Office Translations",
    "admin.manageOfficeTranslationsDesc": "Edit Arabic names and descriptions for Sanad offices",
    "admin.selectOffice": "Select an office",
    "admin.selectTemplate": "Select a template",
    "admin.selectTemplateFirst": "Please select a template first",
    "admin.templateNameArabic": "Template Name (Arabic)",
    "admin.templateDescriptionArabic": "Template Description (Arabic)",
    "admin.officeNameArabic": "Office Name (Arabic)",
    "admin.officeDescriptionArabic": "Office Description (Arabic)",
    "admin.enterArabicName": "Enter Arabic name",
    "admin.enterArabicDescription": "Enter Arabic description",
    "admin.translationUpdated": "Translation updated successfully",
    "admin.translationError": "Failed to update translation",
    "admin.translationUpdateFailed": "Failed to update translation",
    "admin.selectOfficeFirst": "Please select an office first",
    "admin.manageTemplateTranslations": "Manage Template Translations",
    "admin.manageTemplateTranslationsDesc": "Edit Arabic names and descriptions for document templates",
    "admin.templateTranslationsComingSoon": "Template translations management coming soon",
    "admin.bulkImport": "Bulk Import",
    "admin.bulkImportDesc": "Import multiple translations at once using CSV or Excel files",
    "admin.downloadTemplate": "Download Template",
    "admin.uploadFile": "Upload File",
    "admin.importTranslations": "Import Translations",
    "admin.importSuccess": "Successfully imported {count} translations",
    "admin.importError": "Failed to import translations",
    "admin.selectFile": "Select CSV or Excel file",
    "admin.fileFormat": "File format: CSV or Excel (.xlsx)",
    "admin.templateColumns": "Required columns: id, nameAr, descriptionAr",
    "admin.processing": "Processing...",
    "admin.translationQuality": "Translation Quality",
    "admin.complete": "Complete",
    "admin.partial": "Partial",
    "admin.missing": "Missing",
    "admin.completionStatus": "Completion Status",
    "admin.suggestions": "Suggestions",
    "common.saving": "Saving...",
    "common.next": "Next",
    "common.back": "Back",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.confirm": "Confirm",
    "common.loading": "Loading...",
    
    // Office Registration
    "officeReg.title": "Register Your Sanad Office",
    "officeReg.subtitle": "Join SmartPro platform and connect with thousands of SMEs",
    "officeReg.step1": "Basic Information",
    "officeReg.step2": "Location & Contact",
    "officeReg.step3": "Services & Verification",
    "officeReg.step4": "Review & Submit",
    "officeReg.basicInfo": "Basic Information",
    "officeReg.basicInfoDesc": "Details about your registered office",
    "officeReg.officeName": "Office Name (English)",
    "officeReg.officeNameAr": "Office Name (Arabic)",
    "officeReg.officeNamePlaceholder": "e.g., Al-Riyadh Business Services",
    "officeReg.officeNameArPlaceholder": "مثال: خدمات الأعمال الرياض",
    "officeReg.licenseNumber": "Business License Number",
    "officeReg.licenseNumberPlaceholder": "Enter your official license number",
    "officeReg.description": "Description (English)",
    "officeReg.descriptionAr": "Description (Arabic)",
    "officeReg.descriptionPlaceholder": "Describe your office, services, and what makes you unique...",
    "officeReg.descriptionArPlaceholder": "صف مكتبك وخدماتك وما يميزك...",
    "officeReg.governorate": "Governorate",
    "officeReg.selectGovernorate": "Select Governorate",
    "officeReg.city": "City/Wilayat",
    "officeReg.selectCity": "Select City",
    "officeReg.address": "Street Address",
    "officeReg.addressPlaceholder": "Building number, street name",
    "officeReg.phone": "Phone Number",
    "officeReg.phonePlaceholder": "+968 XXXX XXXX",
    "officeReg.email": "Email Address",
    "officeReg.emailPlaceholder": "office@example.com",
    "officeReg.website": "Website (Optional)",
    "officeReg.websitePlaceholder": "https://yourwebsite.com",
    
    "home.government": "Government Integrated",
    "home.governmentDesc": "Direct integration with MOCIP, MOL, and ROP for seamless verification and compliance",
    "home.booking": "Book Services",
    "home.bookingDesc": "Schedule appointments online across all regions",
    "home.bookService": "Book a service",
    "home.trusted": "Trusted by SMEs",
    "home.trustedDesc": "Join thousands of Omani businesses using SmartPro for their business service needs",
    "home.fast": "Fast & Efficient",
    "home.fastDesc": "Reduce processing time from weeks to days with automated workflows and digital processes",
    "home.cta": "Ready to Transform Your Business Services?",
    "home.ctaDesc": "Join SmartPro today and experience the future of business services in Oman",
    "home.learnMore": "Learn More",
    "home.getStarted": "Get Started",
    "home.viewTemplates": "View Templates",
    "home.exploreOffices": "Explore Offices",
    "home.features.offices": "Trusted Sanad Offices",
    "home.features.officesDesc": "Connect with certified business service offices across Oman",
    "home.features.templates": "Document Templates",
    "home.features.templatesDesc": "Access thousands of ready-to-use business document templates",
    "home.features.booking": "Online Booking",
    "home.features.bookingDesc": "Schedule appointments and manage bookings seamlessly",
    
    // Offices Page (Additional Keys)
    "offices.registerYourOffice": "Register Your Office",
    "offices.professionalServices": "Professional business services",
    "offices.reviewsCount": "reviews",
    "offices.verified": "Verified",
    "offices.instantBooking": "Instant Booking",
    "offices.viewOffice": "View Office",
    "offices.previous": "Previous",
    "offices.next": "Next",
    "offices.page": "Page",
    "offices.noOfficesFound": "No offices found",
    "offices.adjustSearchCriteria": "Try adjusting your search criteria",
    "offices.beFirstToRegister": "Be the first to register your Sanad office",
    
    // Feature Cards Section
    "home.featureCards.sectionBadge": "Platform Features",
    "home.featureCards.sectionTitle": "Why Choose SmartPro?",
    "home.featureCards.sectionSubtitle": "Everything you need to manage business services in one place",
    "home.featureCards.verifiedOffices": "Verified Sanad Offices",
    "home.featureCards.verifiedOfficesDesc": "Browse hundreds of verified professional offices with transparent pricing and reviews",
    "home.featureCards.exploreOffices": "Explore Offices",
    "home.featureCards.marketplace": "Service Marketplace",
    "home.featureCards.marketplaceDesc": "Post service requests and receive competitive bids from multiple offices",
    "home.featureCards.browseMarketplace": "Browse Marketplace",
    "home.featureCards.documentTemplates": "Document Templates",
    "home.featureCards.documentTemplatesDesc": "Access ready-to-use templates for contracts, applications, and business documents",
    "home.featureCards.viewTemplates": "View Templates",
    "home.featureCards.easyBooking": "Easy Booking",
    "home.featureCards.easyBookingDesc": "Schedule appointments, track progress, and manage all your bookings in one dashboard",
    "home.featureCards.myBookings": "My Bookings",
    "home.featureCards.realtimeChat": "Real-time Chat",
    "home.featureCards.realtimeChatDesc": "Communicate directly with offices, get instant updates, and resolve queries quickly",
    "home.featureCards.openChat": "Open Chat",
    "home.featureCards.loyaltyRewards": "Loyalty Rewards",
    "home.featureCards.loyaltyRewardsDesc": "Earn points with every booking and redeem them for discounts on future services",
    "home.featureCards.viewRewards": "View Rewards",
    
    // Recommendations
    "recommendations.title": "Recommended Offices",
    "recommendations.subtitle": "Carefully selected offices based on performance and ratings",
    "recommendations.loading": "Loading recommendations...",
    "recommendations.reviews": "reviews",
    "recommendations.completedBookings": "completed",
    "recommendations.viewOffice": "View Office",
    "recommendations.viewAllOffices": "View All Offices",
    "recommendations.topInRegion": "Top in {region}",
    "recommendations.highlyRated": "Highly Rated",
    "recommendations.popularChoice": "Popular Choice",
    "recommendations.experiencedProvider": "Experienced Provider",
    "recommendations.verifiedOffice": "Verified Office",
    "recommendations.youBookedBefore": "You've booked before",
    
    // Leaderboards
    "leaderboards.title": "Regional Leaderboards",
    "leaderboards.subtitle": "Discover the top-performing service offices in each region based on performance and ratings",
    "leaderboards.topOfficesIn": "Top 10 Offices in {region}",
    "leaderboards.rankedBy": "Ranked by ratings, completed bookings, and overall performance",
    "leaderboards.rank": "Rank #{rank}",
    "leaderboards.reviews": "reviews",
    "leaderboards.completed": "completed",
    "leaderboards.score": "score",
    "leaderboards.viewOffice": "View Office",
    "leaderboards.noOffices": "No Offices Found",
    "leaderboards.noOfficesDesc": "No verified offices in this region yet",
    "leaderboards.ctaTitle": "Want Your Office to Appear Here?",
    "leaderboards.ctaDesc": "Join SmartPro and provide excellent service to improve your ranking and reach the leaderboard",
    "leaderboards.registerOffice": "Register Your Office",
    
    // How It Works Section
    "home.how.badge": "Simple Process",
    "home.how.title": "How It Works",
    "home.how.subtitle": "Get your business services done in 3 easy steps",
    "home.how.step1.title": "Browse & Compare",
    "home.how.step1.desc": "Search for services, compare prices, and read reviews from verified customers",
    "home.how.step2.title": "Book & Pay",
    "home.how.step2.desc": "Select your preferred office, choose a time slot, and make secure payment online",
    "home.how.step3.title": "Track & Receive",
    "home.how.step3.desc": "Monitor progress in real-time and receive your completed documents digitally",
    
    // CTA Section
    "home.cta.title": "Are You a Sanad Office?",
    "home.cta.subtitle": "Join SmartPro platform and connect with thousands of SMEs looking for your services. Grow your business with our digital marketplace.",
    "home.cta.benefit1": "Free Registration",
    "home.cta.benefit2": "More Clients",
    "home.cta.benefit3": "Digital Tools",
    "home.cta.benefit4": "24/7 Support",
    "home.cta.button": "Register Your Office Now",
    
    // Footer
    "home.footer.tagline": "The unified platform for business services in Oman",
    "home.footer.forCustomers": "For Customers",
    "home.footer.browseOffices": "Browse Offices",
    "home.footer.documentTemplates": "Document Templates",
    "home.footer.serviceMarketplace": "Service Marketplace",
    "home.footer.loyaltyProgram": "Loyalty Program",
    "home.footer.forOffices": "For Offices",
    "home.footer.registerOffice": "Register Office",
    "home.footer.manageOffice": "Manage Office",
    "home.footer.dashboard": "Dashboard",
    "home.footer.chatInbox": "Chat Inbox",
    "home.footer.support": "Support",
    "home.footer.myAccount": "My Account",
    "home.footer.notifications": "Notifications",
    "home.footer.contactUs": "Contact Us",
    "home.footer.copyright": "© 2025 SmartPro. All rights reserved.",
    
    // Common
    "common.signIn": "Sign In",
    "common.signOut": "Sign Out",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.select": "Select",
    "common.all": "All",
    "common.notNow": "Not Now",

    // PWA
    "pwa.installTitle": "Install SmartPro",
    "pwa.installDescription": "Get quick access and work offline with our mobile app",
    "pwa.installButton": "Install App",
    "pwa.dontShowAgain": "Don't show this again",
    "pwa.benefit1": "Fast access from home screen",
    "pwa.benefit2": "Work offline with cached data",
    "pwa.benefit3": "Get instant push notifications",
    "common.none": "None",
    "common.apply": "Apply",
    "common.reset": "Reset",
    "common.clear": "Clear",
    "common.connected": "Connected",
    "common.offline": "Offline",
    
    // Offices
    "offices.title": "Sanad Offices",
    "offices.subtitle": "Find certified business service offices across Oman",
    "offices.searchPlaceholder": "Search by name or location...",
    "offices.filterByRegion": "Filter by Region",
    "offices.filterByService": "Filter by Service",
    "offices.allRegions": "All Regions",
    "offices.allServices": "All Services",
    "offices.noResults": "No offices found matching your criteria",
    "offices.viewProfile": "View Profile",
    "offices.bookNow": "Book Now",
    "offices.rating": "Rating",
    "offices.reviews": "Reviews",
    "offices.services": "Services",
    "offices.location": "Location",
    "offices.contact": "Contact",
    "offices.about": "About",
    "offices.workingHours": "Working Hours",
    "offices.closed": "Closed",
    "offices.highestRated": "Highest Rated",
    "offices.mostReviews": "Most Reviews",
    "offices.nameAZ": "Name (A-Z)",
    "offices.priceLowToHigh": "Price: Low to High",
    "offices.priceHighToLow": "Price: High to Low",
    "offices.mostPopular": "Most Popular",
    "offices.priceRange": "Price Range (OMR)",
    "offices.minPrice": "Min Price",
    "offices.maxPrice": "Max Price",
    "offices.languagesSpoken": "Languages Spoken",
    "offices.wilayat": "Wilayat",
    "offices.allWilayats": "All Wilayats",
    "offices.showing": "Showing",
    "offices.of": "of",
    "offices.offices": "offices",
    
    // Templates
    "templates.title": "Document Templates",
    "templates.subtitle": "Access thousands of business document templates",
    "templates.searchPlaceholder": "Search templates...",
    "templates.category": "Category",
    "templates.allCategories": "All Categories",
    "templates.language": "Language",
    "templates.useTemplate": "Use Template",
    "templates.preview": "Preview",
    "templates.download": "Download",
    "templates.fillForm": "Fill Form",
    "templates.generate": "Generate Document",
    "templates.generating": "Generating...",
    "templates.noResults": "No templates found",
    "templates.estimatedTime": "الوقت المقدر",
    "templates.requiredFields": "مطلوب",
    "templates.usedBy": "استخدمه",
    "templates.requiredInformation": "المعلومات المطلوبة",
    "templates.optionalInformation": "المعلومات الاختيارية",
    "templates.sampleContent": "محتوى نموذجي",
    "templates.whatYouGet": "ما ستحصل عليه",
    "templates.professionalDocument": "وثيقة احترافية جاهزة للاستخدام",
    "templates.editableFormat": "صيغة DOCX قابلة للتحرير والتخصيص",
    "templates.instantDownload": "تنزيل فوري بعد الإكمال",
    "templates.officiallyRecognized": "صيغة معتمدة رسمياً",
    
    // Form Wizard
    "wizard.step": "خطوة",
    "wizard.complete": "مكتمل",
    "wizard.optional": "اختياري",
    "wizard.back": "رجوع",
    "wizard.next": "التالي",
    "wizard.submit": "إرسال",
    "wizard.submitting": "جاري الإرسال...",
    "wizard.resetProgress": "إعادة تعيين التقدم",
    "wizard.pleaseFixErrors": "يرجى إصلاح الأخطاء التالية:",
    
    // Bookings
    "bookings.title": "My Bookings",
    "bookings.upcoming": "Upcoming",
    "bookings.past": "Past",
    "bookings.cancelled": "Cancelled",
    "bookings.noBookings": "No bookings found",
    "bookings.browseOffices": "Browse Offices",
    "bookings.requestService": "Request a Service",
    "bookings.listView": "List View",
    "bookings.calendarView": "Calendar View",
    "bookings.history": "Booking History",
    "bookings.historyDesc": "View and manage your service bookings",
    "bookings.bookingDate": "Booking Date",
    "bookings.service": "Service",
    "bookings.office": "Office",
    "bookings.status": "Status",
    "bookings.actions": "Actions",
    "bookings.cancel": "Cancel Booking",
    "bookings.reschedule": "Reschedule",
    "bookings.viewDetails": "View Details",
    "bookings.confirmCancel": "Are you sure you want to cancel this booking?",
    "bookings.selectDate": "Select Date",
    "bookings.selectTime": "Select Time",
    "bookings.confirmBooking": "Confirm Booking",
    
    // Booking flow
    "booking.title": "Book a Service",
    "booking.backToOffice": "Back to Office",
    "booking.selectDate": "Select Date",
    "booking.selectDateDesc": "Choose your preferred appointment date",
    "booking.selectTime": "Select Time",
    "booking.availableSlots": "Available time slots for",
    
    // Loyalty
    "loyalty.title": "Loyalty Rewards",
    "loyalty.subtitle": "Earn points and get exclusive rewards",
    "loyalty.availablePoints": "Available Points",
    
    // Referral
    "referral.title": "Refer Friends",
    
    // Admin
    "admin.exportSuccess": "Export completed successfully",
    "admin.exportError": "Failed to export",
    "admin.exportAll": "Export All Translations",
    
    // Notifications
    "notifications.title": "Notification Preferences",
    "notifications.subtitle": "Manage how you receive notifications",
    "notifications.channels": "Notification Channels",
    "notifications.channelsDesc": "Choose how you want to receive notifications",
    "notifications.email": "Email Notifications",
    "notifications.emailDesc": "Receive notifications via email",
    "notifications.sms": "SMS Notifications",
    "notifications.smsDesc": "Receive notifications via SMS",
    "notifications.types": "Notification Types",
    "notifications.typesDesc": "Choose which types of notifications you want to receive",
    "notifications.confirmations": "Booking Confirmations",
    "notifications.confirmationsDesc": "Get notified when bookings are confirmed or updated",
    "notifications.reminders": "Reminders",
    "notifications.remindersDesc": "Receive reminders about upcoming appointments",
    "notifications.marketing": "Marketing & Updates",
    "notifications.marketingDesc": "Get news about new features and special offers",
    
    // Settings
    "settings.languageSettings": "Language Settings",
    "settings.languageSettingsDesc": "Choose your preferred language for the platform interface",
    "settings.preferredLanguage": "Preferred Language",
    "settings.preferredLanguageDesc": "Select your preferred language for the interface",
    "settings.selectLanguage": "Select Language",
    "settings.languageUpdated": "Language preference updated successfully",
    "settings.languageUpdateFailed": "Failed to update language preference",
    "settings.languageInfo": "About Language Settings",
    "settings.languageInfoPoint1": "Your language preference will be saved to your account",
    "settings.languageInfoPoint2": "The interface will update immediately after saving",
    "settings.languageInfoPoint3": "This setting will sync across all your devices",
    
    // Profile
    "profile.title": "My Profile",
    "profile.personalInfo": "Personal Information",
    "profile.name": "Name",
    "profile.email": "Email",
    "profile.phone": "Phone",
    "profile.language": "Preferred Language",
    "profile.updateProfile": "Update Profile",
    "profile.changePassword": "Change Password",
    "profile.updateSuccess": "Profile updated successfully",
    "profile.updateError": "Failed to update profile",
    "profile.nameRequired": "Name is required",
    "profile.currentPassword": "Current Password",
    "profile.newPassword": "New Password",
    "profile.confirmPassword": "Confirm Password",
    
    // Validation
    "validation.required": "This field is required",
    "validation.email": "Please enter a valid email address",
    "validation.phone": "Please enter a valid phone number",
    "validation.minLength": "Minimum length is {min} characters",
    "validation.maxLength": "Maximum length is {max} characters",
    "validation.passwordMatch": "Passwords do not match",
    
    // Marketplace
    "marketplace.title": "Service Marketplace",
    "marketplace.subtitle": "Post service requests and receive competitive bids",
    "marketplace.requestService": "Request Service",
    "marketplace.browseRequests": "Browse Requests",
    "marketplace.myRequests": "My Service Requests",
    "marketplace.requestTitle": "Request a Service",
    "marketplace.requestSubtitle": "Post your service needs and receive competitive bids from qualified Sanad offices",
    "marketplace.serviceTitle": "Service Title",
    "marketplace.serviceTitlePlaceholder": "e.g., Need Commercial Registration for New Restaurant",
    "marketplace.serviceTitleHint": "Minimum 10 characters - Be specific and clear",
    "marketplace.serviceType": "Service Type",
    "marketplace.selectServiceType": "Select service type",
    "marketplace.detailedDescription": "Detailed Description",
    "marketplace.descriptionPlaceholder": "Describe what you need in detail...",
    "marketplace.descriptionHint": "Minimum 50 characters - Include all relevant details",
    "marketplace.specialRequirements": "Special Requirements (Optional)",
    "marketplace.requirementsPlaceholder": "Any specific requirements, documents needed, or preferences...",
    "marketplace.budgetRange": "Budget Range",
    "marketplace.minimumBudget": "Minimum Budget (OMR)",
    "marketplace.maximumBudget": "Maximum Budget (OMR)",
    "marketplace.deadline": "Deadline (Optional)",
    "marketplace.urgency": "Urgency",
    "marketplace.urgencyLow": "Low - Flexible timeline",
    "marketplace.urgencyMedium": "Medium - Within a month",
    "marketplace.urgencyHigh": "High - Within 2 weeks",
    "marketplace.urgencyUrgent": "Urgent - ASAP",
    "marketplace.location": "Location",
    "marketplace.governorate": "Governorate",
    "marketplace.selectGovernorate": "Select governorate",
    "marketplace.wilayat": "Wilayat (Optional)",
    "marketplace.remoteAccepted": "Accept Remote Service",
    "marketplace.remoteAcceptedDesc": "Allow offices to provide service remotely",
    "marketplace.postRequest": "Post Request",
    "marketplace.posting": "Posting...",
    "marketplace.requestPosted": "Service request posted successfully!",
    "marketplace.requestFailed": "Failed to post service request",
    "marketplace.noBids": "No bids yet",
    "marketplace.viewBids": "View Bids",
    "marketplace.acceptBid": "Accept Bid",
    "marketplace.rejectBid": "Reject Bid",
    "marketplace.bidAmount": "Bid Amount",
    "marketplace.estimatedDuration": "Estimated Duration",
    "marketplace.proposalDetails": "Proposal Details",
    "marketplace.bidSubmitted": "Bid Submitted Successfully!",
    "marketplace.bidsSubmitted": "bids submitted",
    
    // Marketplace Filters
    "marketplace.filters.title": "Filters",
    "marketplace.filters.active": "Active filters",
    "marketplace.filters.allServices": "All Services",
    "marketplace.filters.allLocations": "All Locations",
    "marketplace.filters.minBudget": "Min Budget",
    "marketplace.filters.maxBudget": "Max Budget",
    "marketplace.filters.search": "Search",
    "marketplace.filters.clearAll": "Clear All",
    "marketplace.filters.posted": "Posted",
    "marketplace.noDeadline": "No deadline",
    
    // Marketplace Statistics
    "marketplace.stats.totalRequests": "Total Requests",
    "marketplace.stats.avgBudget": "Avg Budget",
    "marketplace.stats.urgent": "Urgent",
    "marketplace.stats.totalBids": "Total Bids",
    
    // Marketplace Search
    "marketplace.search.placeholder": "Search by service type, description, or location...",
    
    // Marketplace Sorting
    "marketplace.sort.newest": "Newest First",
    "marketplace.sort.oldest": "Oldest First",
    "marketplace.sort.budgetHigh": "Highest Budget",
    "marketplace.sort.budgetLow": "Lowest Budget",
    "marketplace.sort.urgent": "Most Urgent",
    
    // Marketplace - Request Service Page
    "marketplace.requestService.title": "Request a Service",
    "marketplace.requestService.subtitle": "Post your service needs and receive competitive bids from qualified Sanad offices",
    "marketplace.requestService.serviceTitle": "Service Title",
    "marketplace.requestService.serviceTitlePlaceholder": "e.g., Need Commercial Registration for New Restaurant",
    "marketplace.requestService.serviceTitleHint": "Minimum 10 characters - Be specific and clear",
    "marketplace.requestService.serviceType": "Service Type",
    "marketplace.requestService.selectServiceType": "Select service type",
    "marketplace.requestService.detailedDescription": "Detailed Description",
    "marketplace.requestService.descriptionPlaceholder": "Describe what you need in detail...",
    "marketplace.requestService.descriptionHint": "Minimum 50 characters - Include all relevant details",
    "marketplace.requestService.specialRequirements": "Special Requirements (Optional)",
    "marketplace.requestService.requirementsPlaceholder": "Any specific requirements, documents needed, or preferences...",
    "marketplace.requestService.minimumBudget": "Minimum Budget (OMR)",
    "marketplace.requestService.maximumBudget": "Maximum Budget (OMR)",
    "marketplace.requestService.budgetPlaceholder": "e.g., {{amount}}",
    "marketplace.requestService.deadline": "Deadline (Optional)",
    "marketplace.requestService.urgency": "Urgency",
    "marketplace.requestService.urgencyLow": "Low - Flexible timeline",
    "marketplace.requestService.urgencyMedium": "Medium - Within a month",
    "marketplace.requestService.urgencyHigh": "High - Within 2 weeks",
    "marketplace.requestService.urgencyUrgent": "Urgent - ASAP",
    "marketplace.requestService.preferredGovernorate": "Preferred Governorate",
    "marketplace.requestService.anyLocation": "Any Location",
    "marketplace.requestService.wilayat": "Wilayat (Optional)",
    "marketplace.requestService.wilayatPlaceholder": "Enter wilayat name",
    "marketplace.requestService.remoteAccepted": "Accept Remote Service",
    "marketplace.requestService.postRequest": "Post Request",
    "marketplace.requestService.posting": "Posting...",
    "marketplace.requestService.successMessage": "Service request posted successfully!",
    "marketplace.requestService.errorMessage": "Failed to post service request",
    
    // Service Types
    "marketplace.serviceTypes.commercialRegistration": "Commercial Registration",
    "marketplace.serviceTypes.taxRegistration": "Tax Registration",
    "marketplace.serviceTypes.vatRegistration": "VAT Registration",
    "marketplace.serviceTypes.businessLicense": "Business License",
    "marketplace.serviceTypes.tradeLicense": "Trade License",
    "marketplace.serviceTypes.legalConsultation": "Legal Consultation",
    "marketplace.serviceTypes.accountingServices": "Accounting Services",
    "marketplace.serviceTypes.documentTranslation": "Document Translation",
    "marketplace.serviceTypes.other": "Other",
    
    // Governorates
    "marketplace.governorates.muscat": "Muscat",
    "marketplace.governorates.dhofar": "Dhofar",
    "marketplace.governorates.musandam": "Musandam",
    "marketplace.governorates.alBuraimi": "Al Buraimi",
    "marketplace.governorates.adDakhiliyah": "Ad Dakhiliyah",
    "marketplace.governorates.alBatinahNorth": "Al Batinah North",
    "marketplace.governorates.alBatinahSouth": "Al Batinah South",
    "marketplace.governorates.ashSharqiyahNorth": "Ash Sharqiyah North",
    "marketplace.governorates.ashSharqiyahSouth": "Ash Sharqiyah South",
    "marketplace.governorates.alDhahirah": "Al Dhahirah",
    "marketplace.governorates.alWusta": "Al Wusta",
    
    // Status Labels
    "status.pending": "Pending",
    "status.confirmed": "Confirmed",
    "status.completed": "Completed",
    "status.cancelled": "Cancelled",
    "status.inProgress": "In Progress",
    "status.approved": "Approved",
    "status.rejected": "Rejected",
    "status.open": "Open",
    "status.closed": "Closed",
    "status.active": "Active",
    "status.inactive": "Inactive",
    "status.verified": "Verified",
    "status.unverified": "Unverified",
    "status.processing": "Processing",
    "status.failed": "Failed",
    "status.success": "Success",
    
    // Admin Panel
    "admin.title": "Admin Dashboard",
    "admin.mocipTitle": "MOCIP Admin Dashboard",
    "admin.mocipSubtitle": "Ministry oversight and platform management",
    "admin.userManagement": "User Management",
    "admin.userManagementSubtitle": "Manage user roles and permissions across the platform",
    "admin.officeVerification": "Office Verification",
    "admin.officeVerificationSubtitle": "Review and verify pending office registrations",
    "admin.analytics": "Analytics",
    "admin.compliance": "Compliance",
    "admin.totalUsers": "Total Users",
    "admin.totalOffices": "Total Offices",
    "admin.totalBookings": "Total Bookings",
    "admin.totalRevenue": "Total Revenue",
    "admin.documentsGenerated": "Documents Generated",
    "admin.allTimeBookings": "All time bookings",
    "admin.totalGeneratedDocuments": "Total generated documents",
    "admin.registeredUsers": "Registered users",
    "admin.activeOffices": "active {count}",
    "admin.recentUsers": "Recent Users",
    "admin.recentOffices": "Recent Offices",
    "admin.pendingVerifications": "Pending Verifications",
    "admin.pendingOfficeVerifications": "Pending Office Verifications",
    "admin.pendingOfficeVerificationsDesc": "Review and approve new Sanad office registrations",
    "admin.allCaughtUp": "All Caught Up!",
    "admin.noPendingVerifications": "No pending office verifications",
    "admin.allUsers": "All Users",
    "admin.allUsersDesc": "Search and filter users, update roles and permissions",
    "admin.allRoles": "All Roles",
    "admin.searchUsers": "Search by name, email, or ID...",
    "admin.loadingUsers": "Loading users...",
    "admin.loadingPendingRegistrations": "Loading pending registrations...",
    "admin.verifyOffice": "Verify Office",
    "admin.rejectOffice": "Reject Office",
    "admin.verificationNotes": "Verification Notes",
    "admin.approveUser": "Approve User",
    "admin.suspendUser": "Suspend User",
    "admin.deleteUser": "Delete User",
    "admin.userRole": "User Role",
    "admin.changeRole": "Change Role",
    "admin.roleUser": "User",
    "admin.roleAdmin": "Admin",
    "admin.roleOfficeOwner": "Office Owner",
    "admin.tabs.officeVerification": "Office Verification",
    "admin.tabs.analytics": "Analytics",
    "admin.tabs.compliance": "Compliance",
    "admin.tabs.userManagement": "User Management",
    
    // Messages
    "message.success": "Operation completed successfully",
    "message.error": "An error occurred. Please try again",
    "message.saveSuccess": "Saved successfully",
    "message.deleteSuccess": "Deleted successfully",
    "message.updateSuccess": "Updated successfully",
    "message.createSuccess": "Created successfully",
    
    // Affordability Section
    "home.affordability.subtitle": "Smart Pricing",
    "home.affordability.title": "Affordable Business Services for Every SME",
    "home.affordability.description": "SmartPro's digital platform reduces overhead costs, allowing Sanad offices to offer competitive pricing. Save up to 73% compared to traditional service providers while maintaining the highest quality standards.",
    
    // Empty States
    "empty.noServiceRequestsYet": "No Service Requests Yet",
    "empty.noServiceRequestsYetDesc": "You haven't posted any service requests. Start by posting a request to receive competitive bids from offices.",
    "empty.noServiceRequestsFound": "No Service Requests Found",
    "empty.noServiceRequestsFoundDesc": "Try adjusting your filters or check back later for new requests",
    "empty.noMatchingRequests": "No matching requests found",
    "empty.tryAdjustingFilters": "Try adjusting your filters to see more results",
    "empty.noOfficesYet": "No offices registered yet",
    "empty.noOfficesYetDesc": "Register your first Sanad office to start offering business services",
    "empty.noOfficesFound": "No Offices Found",
    "empty.noOfficesFoundDesc": "You don't have any registered offices yet. Register your office to start managing bookings",
    "empty.noConversations": "No conversations found",
    "empty.noConversationsDesc": "Start a conversation with a customer to see it here",
    "empty.noStaffYet": "No staff members yet",
    "empty.noStaffYetDesc": "Add your first staff member to start managing your team",
    "empty.noPerformanceData": "No performance data available yet",
    "empty.noPerformanceDataDesc": "Metrics will appear once staff members start handling conversations",
    "empty.selectConversation": "Select a conversation",
    "empty.selectConversationDesc": "Choose a conversation from the list to start chatting",
    
    // Page Titles
    "pages.serviceRequestMarketplace": "Service Request Marketplace",
    "pages.serviceRequestMarketplaceDesc": "Browse service requests from customers and submit competitive bids",
    "pages.myOffices": "My Offices",
    "pages.myOfficesDesc": "Manage your registered Sanad offices",
    "pages.analyticsDashboard": "Analytics Dashboard",
    "pages.analyticsDashboardDesc": "Track your office performance and growth",
    "pages.chatInbox": "Chat Inbox",
    "pages.chatInboxDesc": "Manage conversations with customers",
    "pages.cannedResponses": "Canned Responses",
    "pages.cannedResponsesDesc": "Create quick-reply templates for common questions",
    "pages.staffManagement": "Staff Management",
    "pages.staffManagementDesc": "Manage your office staff and their roles",
    "pages.staffPerformance": "Staff Performance Dashboard",
    "pages.staffPerformanceDesc": "Track team performance metrics and identify areas for improvement",
    
    // Loading States
    "loading.serviceRequests": "Loading service requests...",
    
    // Currency
    "currency.omr": "OMR",
    
    // Action Buttons
    "actions.postServiceRequest": "Post a Service Request",
    "actions.registerYourFirstOffice": "Register Your First Office",
    "actions.addYourFirstStaffMember": "Add Your First Staff Member",
    "actions.registerNewOffice": "Register New Office",
    "actions.addStaffMember": "Add Staff Member",
    "actions.newResponse": "New Response",
    "actions.exportConversations": "Export Conversations",
    "actions.submitBid": "Submit Bid",
    "actions.cancel": "Cancel",
    "actions.viewOfficeProfile": "View Office Profile",
    
    // Booking Details
    "booking.details": "Booking Details",
    "booking.officeInformation": "Office Information",
    "booking.serviceDescription": "Service Description",
    "booking.created": "Created:",
    "booking.updated": "Updated:",
    "booking.status.confirmed": "confirmed",
    
    // Service Request Details
    "serviceRequest.bids": "Bids",
    "serviceRequest.service": "Service",
    "serviceRequest.deadline": "Deadline",
    "serviceRequest.budget": "Budget",
    "serviceRequest.noBidsYet": "No bids received yet. Offices will be notified about your request",
    "serviceRequest.status.open": "Open",
    "serviceRequest.bidsSubmitted": "bids submitted",
    
    // Marketplace Filters (removed duplicates - already defined earlier)
    
    // Analytics
    "analytics.last30Days": "Last 30 days",
    "analytics.averageRating": "Average Rating",
    "analytics.activeCustomers": "Active Customers",
    "analytics.totalBookings": "Total Bookings",
    "analytics.totalRevenue": "Total Revenue",
    "analytics.vsLastPeriod": "vs last period",
    "analytics.revenueTrends": "Revenue Trends",
    "analytics.revenueTrendsDesc": "Revenue generated over time",
    "analytics.bookingTrends": "Booking Trends",
    "analytics.bookingTrendsDesc": "Number of bookings over time",
    "analytics.popularServices": "Popular Services",
    "analytics.popularServicesDesc": "Top performing services by booking count",
    
    // Chat
    "chat.conversations": "Conversations",
    "chat.searchConversations": "Search conversations...",
    "chat.active": "Active",
    "chat.archived": "Archived",
    "chat.offline": "Offline",
    "chat.staffMembers": "Staff Members",
    
    // Canned Responses
    "cannedResponses.selectOffice": "Select Office",
    "cannedResponses.chooseOffice": "Choose an office",
    
    // Auto-Fill
    "autoFill.title": "Smart Form Auto-Fill",
    "autoFill.description": "Save your information once and automatically fill forms across the platform",
    "autoFill.infoMessage": "Your information is stored locally on your device and never sent to our servers unless you submit a form.",
    "autoFill.personalInfo": "Personal Information",
    "autoFill.addressInfo": "Address Information",
    "autoFill.businessInfo": "Business Information",
    "autoFill.preferredContact": "Preferred Contact Method",
    "autoFill.selectContact": "Select method",
    "autoFill.companyName": "Company Name",
    "autoFill.crNumber": "Commercial Registration",
    "autoFill.taxNumber": "Tax Registration",
    "autoFill.clearData": "Clear All Data",
    "autoFill.saved": "Settings Saved",
    "autoFill.savedDesc": "Your auto-fill preferences have been saved.",
    "autoFill.cleared": "Data Cleared",
    "autoFill.clearedDesc": "All saved form data has been removed.",
    "autoFill.confirmClear": "Are you sure you want to clear all saved form data?",
    "autoFill.rememberInfo": "Remember my information for future forms",
    
    // Reviews
    "reviews.replyToReview": "Reply to Review",
    "reviews.editReply": "Edit Reply",
    "reviews.deleteReply": "Delete Reply",
    "reviews.submitReply": "Submit Reply",
    "reviews.updateReply": "Update Reply",
    "reviews.replySubmitted": "Reply Submitted",
    "reviews.replySubmittedDesc": "Your reply has been posted successfully.",
    "reviews.replyUpdated": "Reply Updated",
    "reviews.replyUpdatedDesc": "Your reply has been updated successfully.",
    "reviews.replyDeleted": "Reply Deleted",
    "reviews.replyDeletedDesc": "Your reply has been removed.",
    "reviews.replyTooShort": "Reply must be at least 10 characters long.",
    "reviews.confirmDeleteReply": "Are you sure you want to delete this reply?",
    "reviews.replyPlaceholder": "Write your response to this review...",
    "reviews.toneProfessional": "Professional",
    "reviews.toneFriendly": "Friendly",
    "reviews.toneApologetic": "Apologetic",
    "reviews.getSuggestions": "Get AI Suggestions",
    "reviews.clickToUse": "Click on a suggestion to use it:",
    "reviews.writeOwn": "Write My Own",
  },
  ar: {
    // Navigation
    
    // Sidebar section headers
    
    // Home page
    
    // Client Management
    

    // Regional Statistics
    
    // Booking Wizard
    
    // Templates Categories
    
    // Bookings List (Additional)
    
    // Regions
    
    // Regional Services
    
    // Service Filters
    
    // Office Registration
    
    
    // Recommendations
    
    // Leaderboards
    
    // How It Works Section
    
    // CTA Section
    
    // Footer
    
    
    // Offices Page (Additional Keys)
    
    // Feature Cards Section
    
    // Common

    // PWA
    "pwa.installTitle": "تثبيت سمارت برو",
    "pwa.installDescription": "احصل على وصول سريع واعمل دون اتصال بالإنترنت مع تطبيقنا",
    "pwa.installButton": "تثبيت التطبيق",
    "pwa.dontShowAgain": "عدم إظهار هذا مرة أخرى",
    "pwa.benefit1": "وصول سريع من الشاشة الرئيسية",
    "pwa.benefit2": "العمل دون اتصال بالإنترنت مع البيانات المخزنة مؤقتاً",
    "pwa.benefit3": "احصل على إشعارات فورية",
    
    // Offices
    "offices.priceLowToHigh": "السعر: من الأقل إلى الأعلى",
    "offices.priceHighToLow": "السعر: من الأعلى إلى الأقل",
    "offices.mostPopular": "الأكثر شعبية",
    "offices.priceRange": "نطاق السعر (ريال عماني)",
    "offices.minPrice": "الحد الأدنى للسعر",
    "offices.maxPrice": "الحد الأقصى للسعر",
    "offices.languagesSpoken": "اللغات المنطوقة",
    "offices.wilayat": "الولاية",
    "offices.allWilayats": "جميع الولايات",
    
    // Templates
    
    // Bookings
    "bookings.browseOffices": "تصفح المكاتب",
    "bookings.requestService": "طلب خدمة",
    
    // Booking flow
    
    // Loyalty
    
    // Referral
    
    // Admin
        // Notifications
    
    // Settings
    
    // Profile
    
    // Validation
    
    // Marketplace
    
    // Marketplace Filters
    
    // Marketplace Statistics
    
    // Marketplace Search
    
    // Marketplace Sorting
    
    // Marketplace - Request Service Page
    
    // Service Types
    
    // Governorates
    
    // Status Labels
    
    // Admin Panel
    
    // Messages
    
    // Affordability Section
    
    // Empty States
    
    // Page Titles
    
    // Loading States
    
    // Currency
    
    // Action Buttons
    
    // Booking Details
    
    // Service Request Details
    
    // Marketplace Filters (removed duplicates - already defined earlier)
    
    // Analytics
    
    // Chat
    
    // Canned Responses
    
    // Auto-Fill
    "autoFill.title": "التعبئة التلقائية الذكية للنماذج",
    "autoFill.description": "احفظ معلوماتك مرة واحدة واملأ النماذج تلقائيًا في جميع أنحاء المنصة",
    "autoFill.infoMessage": "يتم تخزين معلوماتك محليًا على جهازك ولا يتم إرسالها إلى خوادمنا إلا عند إرسال نموذج.",
    "autoFill.personalInfo": "المعلومات الشخصية",
    "autoFill.addressInfo": "معلومات العنوان",
    "autoFill.businessInfo": "معلومات العمل",
    "autoFill.preferredContact": "طريقة الاتصال المفضلة",
    "autoFill.selectContact": "اختر الطريقة",
    "autoFill.companyName": "اسم الشركة",
    "autoFill.crNumber": "السجل التجاري",
    "autoFill.taxNumber": "الرقم الضريبي",
    "autoFill.clearData": "مسح جميع البيانات",
    "autoFill.saved": "تم حفظ الإعدادات",
    "autoFill.savedDesc": "تم حفظ تفضيلات التعبئة التلقائية.",
    "autoFill.cleared": "تم مسح البيانات",
    "autoFill.clearedDesc": "تم إزالة جميع بيانات النماذج المحفوظة.",
    "autoFill.confirmClear": "هل أنت متأكد من مسح جميع بيانات النماذج المحفوظة؟",
    "autoFill.rememberInfo": "تذكر معلوماتي للنماذج المستقبلية",
    
    // Reviews
    "reviews.replyToReview": "الرد على المراجعة",
    "reviews.editReply": "تعديل الرد",
    "reviews.deleteReply": "حذف الرد",
    "reviews.submitReply": "إرسال الرد",
    "reviews.updateReply": "تحديث الرد",
    "reviews.replySubmitted": "تم إرسال الرد",
    "reviews.replySubmittedDesc": "تم نشر ردك بنجاح.",
    "reviews.replyUpdated": "تم تحديث الرد",
    "reviews.replyUpdatedDesc": "تم تحديث ردك بنجاح.",
    "reviews.replyDeleted": "تم حذف الرد",
    "reviews.replyDeletedDesc": "تم إزالة ردك.",
    "reviews.replyTooShort": "يجب أن يكون الرد 10 أحرف على الأقل.",
    "reviews.confirmDeleteReply": "هل أنت متأكد من حذف هذا الرد؟",
    "reviews.replyPlaceholder": "اكتب ردك على هذه المراجعة...",
    "reviews.toneProfessional": "رسمي",
    "reviews.toneFriendly": "ودي",
    "reviews.toneApologetic": "اعتذاري",
    "reviews.getSuggestions": "احصل على اقتراحات الذكاء الاصطناعي",
    "reviews.clickToUse": "انقر على اقتراح لاستخدامه:",
    "reviews.writeOwn": "اكتب ردي الخاص",
  },
};

// Helper function to detect browser language
function detectBrowserLanguage(): Language {
  const browserLang = navigator.language || navigator.languages?.[0];
  // Check if browser language is Arabic (ar, ar-*)
  if (browserLang?.toLowerCase().startsWith('ar')) {
    return 'ar';
  }
  // Default to English for all other languages
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    // Priority: localStorage > browser language > default (en)
    const saved = localStorage.getItem("smartpro-language");
    if (saved === "ar" || saved === "en") {
      return saved;
    }
    // First visit: detect from browser
    const detected = detectBrowserLanguage();
    localStorage.setItem("smartpro-language", detected);
    return detected;
  });

  const updateLanguageMutation = trpc.auth.updateLanguagePreference.useMutation();

  // Sync with user's preferred language from database
  useEffect(() => {
    if (user?.preferredLanguage && (user.preferredLanguage === "ar" || user.preferredLanguage === "en")) {
      setLanguageState(user.preferredLanguage);
      localStorage.setItem("smartpro-language", user.preferredLanguage);
    }
  }, [user]);

  useEffect(() => {
    // Save to localStorage whenever language changes
    localStorage.setItem("smartpro-language", language);
    
    // Update document direction and lang attribute
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Update database if user is logged in
    if (user) {
      updateLanguageMutation.mutate({ language: lang });
    }
    // Show feedback to user
    toast.success(
      lang === "ar" ? "تم تغيير اللغة إلى العربية" : "Language changed to English",
      { duration: 2000 }
    );
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";
  const isRTL = language === "ar";
  const currentLanguage = language;
  const isArabic = language === "ar";
  const formatRating = (rating: number): string => {
    return rating.toFixed(1);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      dir, 
      isRTL, 
      currentLanguage, 
      isArabic, 
      formatRating 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
