# Missing Translations - Comprehensive Audit

## Found Issues (Dec 28, 2025)

### 1. Navigation Section Headers
**Location:** Sidebar navigation
**Issue:** Section headers "MAIN", "MY SERVICES", "OFFICE MANAGEMENT" appear in English only
**Status:** These headers are visible in the screenshot but not found in code search - likely hardcoded somewhere

### 2. Feature Discovery Card
**Location:** Sidebar "What You Can Do" card
**Issue:** 
- Title: "What You Can Do" - not translated
- Subtitle: "Explore features available to you" - not translated
- Card items:
  - "Browse Offices" - "Find verified business service offices across Oman"
  - "Book Services" - "Schedule appointments and track your bookings"
  - "Request Services" - "Post service requests and receive bids from providers"

### 3. Connection Status (FIXED)
**Location:** User profile area in sidebar
**Status:** ✅ Already has translation keys (status.connected, status.offline)

### 4. Navigation Item (FIXED)
**Location:** Sidebar navigation
**Issue:** "nav.leaderboards" was missing English translation
**Status:** ✅ FIXED - Added "Regional Leaderboards" translation

### 5. Footer Links
**Location:** Homepage footer
**Issue:** Footer section may have untranslated links:
- "Register Office"
- "Manage Office"
- "Dashboard"
- "Chat Inbox"
- "My Account"
- "Notifications"
- "Contact Us"

### 6. Loading States
**Location:** Various pages
**Issue:** "Loading recommendations..." text appears untranslated

### 7. Region Display
**Location:** Homepage and filters
**Issue:** "region.all" appears as literal text instead of translated value

## Translation Keys to Add

### Feature Discovery Card
```typescript
"sidebar.whatYouCanDo": "What You Can Do",
"sidebar.exploreFeatures": "Explore features available to you",
"sidebar.browseOffices": "Browse Offices",
"sidebar.browseOfficesDesc": "Find verified business service offices across Oman",
"sidebar.bookServices": "Book Services",
"sidebar.bookServicesDesc": "Schedule appointments and track your bookings",
"sidebar.requestServices": "Request Services",
"sidebar.requestServicesDesc": "Post service requests and receive bids from providers",
```

### Section Headers
```typescript
"sidebar.sectionMain": "MAIN",
"sidebar.sectionMyServices": "MY SERVICES",
"sidebar.sectionOfficeManagement": "OFFICE MANAGEMENT",
"sidebar.sectionAdminTools": "ADMIN TOOLS",
"sidebar.sectionTranslationTools": "TRANSLATION TOOLS",
"sidebar.sectionSettings": "SETTINGS",
```

### Loading States
```typescript
"common.loading": "Loading...",
"common.loadingRecommendations": "Loading recommendations...",
"common.loadingOffices": "Loading offices...",
"common.loadingServices": "Loading services...",
```

### Footer
```typescript
"footer.registerOffice": "Register Office",
"footer.manageOffice": "Manage Office",
"footer.dashboard": "Dashboard",
"footer.chatInbox": "Chat Inbox",
"footer.myAccount": "My Account",
"footer.notifications": "Notifications",
"footer.contactUs": "Contact Us",
```

## Next Steps
1. ✅ Add nav.leaderboards English translation
2. Add all feature discovery card translation keys
3. Add section header translation keys
4. Add loading state translation keys
5. Add footer translation keys
6. Find and update components to use these keys
7. Test in both English and Arabic
8. Verify RTL layout
