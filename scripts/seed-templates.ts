/**
 * Seed Document Templates for SmartPro Platform
 * Creates 15 real business document templates with proper field definitions
 */

import { drizzle } from "drizzle-orm/mysql2";
import { documentTemplates } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const templates = [
  {
    templateName: "Employment Contract",
    templateNameAr: "عقد العمل",
    category: "employment",
    description: "Standard employment contract for hiring employees in Oman",
    descriptionAr: "عقد عمل قياسي لتوظيف الموظفين في عمان",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["employment", "contract", "hiring", "hr"],
    templateContent: `
EMPLOYMENT CONTRACT

This Employment Contract is entered into on {{contractDate}} between:

EMPLOYER:
Company Name: {{companyName}}
Commercial Registration: {{companyRegistration}}
Address: {{companyAddress}}

EMPLOYEE:
Full Name: {{employeeName}}
Civil ID: {{employeeCivilId}}
Nationality: {{employeeNationality}}
Address: {{employeeAddress}}

TERMS AND CONDITIONS:

1. POSITION AND DUTIES
The Employee is hired for the position of {{jobTitle}} and shall perform duties as assigned by the Employer.

2. COMMENCEMENT DATE
Employment shall commence on {{startDate}}.

3. PROBATION PERIOD
The Employee shall be on probation for {{probationPeriod}} months.

4. SALARY AND BENEFITS
Basic Salary: {{basicSalary}} OMR per month
Housing Allowance: {{housingAllowance}} OMR per month
Transport Allowance: {{transportAllowance}} OMR per month

5. WORKING HOURS
The Employee shall work {{workingHours}} hours per week.

6. ANNUAL LEAVE
The Employee is entitled to {{annualLeave}} days of paid annual leave per year.

7. TERMINATION
Either party may terminate this contract with {{noticePeriod}} days written notice.

This contract is governed by the laws of the Sultanate of Oman.

EMPLOYER SIGNATURE: _______________  EMPLOYEE SIGNATURE: _______________
Date: ___________                   Date: ___________
`,
    variables: [
      { name: "contractDate", label: "Contract Date", type: "date", required: true },
      { name: "companyName", label: "Company Name", type: "text", required: true },
      { name: "companyRegistration", label: "Commercial Registration", type: "text", required: true },
      { name: "companyAddress", label: "Company Address", type: "textarea", required: true },
      { name: "employeeName", label: "Employee Full Name", type: "text", required: true },
      { name: "employeeCivilId", label: "Employee Civil ID", type: "text", required: true },
      { name: "employeeNationality", label: "Employee Nationality", type: "text", required: true },
      { name: "employeeAddress", label: "Employee Address", type: "textarea", required: true },
      { name: "jobTitle", label: "Job Title", type: "text", required: true },
      { name: "startDate", label: "Start Date", type: "date", required: true },
      { name: "probationPeriod", label: "Probation Period (months)", type: "number", required: true, defaultValue: "3" },
      { name: "basicSalary", label: "Basic Salary (OMR)", type: "number", required: true },
      { name: "housingAllowance", label: "Housing Allowance (OMR)", type: "number", required: false, defaultValue: "0" },
      { name: "transportAllowance", label: "Transport Allowance (OMR)", type: "number", required: false, defaultValue: "0" },
      { name: "workingHours", label: "Working Hours per Week", type: "number", required: true, defaultValue: "48" },
      { name: "annualLeave", label: "Annual Leave Days", type: "number", required: true, defaultValue: "30" },
      { name: "noticePeriod", label: "Notice Period (days)", type: "number", required: true, defaultValue: "30" },
    ],
  },
  {
    templateName: "No Objection Certificate - General",
    templateNameAr: "شهادة عدم ممانعة - عامة",
    category: "noc",
    description: "General purpose No Objection Certificate",
    descriptionAr: "شهادة عدم ممانعة للأغراض العامة",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["noc", "certificate", "official"],
    templateContent: `
NO OBJECTION CERTIFICATE

Date: {{issueDate}}

To Whom It May Concern,

This is to certify that {{companyName}}, Commercial Registration No. {{companyRegistration}}, has NO OBJECTION to:

Employee Name: {{employeeName}}
Civil ID: {{employeeCivilId}}
Passport No: {{passportNumber}}
Nationality: {{nationality}}
Position: {{position}}

For the purpose of: {{purpose}}

{{additionalNotes}}

This certificate is issued upon the employee's request and for official use only.

Authorized Signatory: _______________
Company Stamp
`,
    variables: [
      { name: "issueDate", label: "Issue Date", type: "date", required: true },
      { name: "companyName", label: "Company Name", type: "text", required: true },
      { name: "companyRegistration", label: "Commercial Registration", type: "text", required: true },
      { name: "employeeName", label: "Employee Name", type: "text", required: true },
      { name: "employeeCivilId", label: "Civil ID", type: "text", required: true },
      { name: "passportNumber", label: "Passport Number", type: "text", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "position", label: "Position", type: "text", required: true },
      { name: "purpose", label: "Purpose", type: "textarea", required: true },
      { name: "additionalNotes", label: "Additional Notes", type: "textarea", required: false },
    ],
  },
  {
    templateName: "NOC for Visa Transfer",
    templateNameAr: "شهادة عدم ممانعة لنقل التأشيرة",
    category: "noc",
    description: "No Objection Certificate specifically for visa transfer",
    descriptionAr: "شهادة عدم ممانعة خاصة بنقل التأشيرة",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["noc", "visa", "transfer", "immigration"],
    templateContent: `
NO OBJECTION CERTIFICATE FOR VISA TRANSFER

Date: {{issueDate}}

Royal Oman Police
Directorate General of Immigration

Subject: No Objection for Visa Transfer

This is to certify that {{companyName}}, Commercial Registration No. {{companyRegistration}}, has NO OBJECTION to transfer the visa of:

Employee Name: {{employeeName}}
Civil ID: {{employeeCivilId}}
Passport No: {{passportNumber}}
Nationality: {{nationality}}
Current Position: {{currentPosition}}
Current Visa No: {{currentVisaNumber}}

From: {{currentSponsor}}
To: {{newSponsor}}

The employee has completed {{serviceYears}} years of service with our organization and has no pending obligations.

We hereby release the employee from our sponsorship and have no objection to the visa transfer.

Authorized Signatory: _______________
Name: {{signatoryName}}
Position: {{signatoryPosition}}
Company Stamp
`,
    variables: [
      { name: "issueDate", label: "Issue Date", type: "date", required: true },
      { name: "companyName", label: "Company Name", type: "text", required: true },
      { name: "companyRegistration", label: "Commercial Registration", type: "text", required: true },
      { name: "employeeName", label: "Employee Name", type: "text", required: true },
      { name: "employeeCivilId", label: "Civil ID", type: "text", required: true },
      { name: "passportNumber", label: "Passport Number", type: "text", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "currentPosition", label: "Current Position", type: "text", required: true },
      { name: "currentVisaNumber", label: "Current Visa Number", type: "text", required: true },
      { name: "currentSponsor", label: "Current Sponsor", type: "text", required: true },
      { name: "newSponsor", label: "New Sponsor", type: "text", required: true },
      { name: "serviceYears", label: "Years of Service", type: "number", required: true },
      { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
      { name: "signatoryPosition", label: "Signatory Position", type: "text", required: true },
    ],
  },
  {
    templateName: "NOC for Bank Account Opening",
    templateNameAr: "شهادة عدم ممانعة لفتح حساب بنكي",
    category: "noc",
    description: "No Objection Certificate for opening a bank account",
    descriptionAr: "شهادة عدم ممانعة لفتح حساب بنكي",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["noc", "bank", "account", "financial"],
    templateContent: `
NO OBJECTION CERTIFICATE FOR BANK ACCOUNT OPENING

Date: {{issueDate}}

To: {{bankName}}

Subject: No Objection for Bank Account Opening

This is to certify that {{companyName}}, Commercial Registration No. {{companyRegistration}}, has NO OBJECTION to our employee opening a bank account:

Employee Name: {{employeeName}}
Civil ID: {{employeeCivilId}}
Passport No: {{passportNumber}}
Nationality: {{nationality}}
Position: {{position}}
Monthly Salary: {{monthlySalary}} OMR

The employee is currently employed with us and is in good standing.

We have no objection to the employee opening a {{accountType}} account with your esteemed bank.

Authorized Signatory: _______________
Name: {{signatoryName}}
Position: {{signatoryPosition}}
Company Stamp
`,
    variables: [
      { name: "issueDate", label: "Issue Date", type: "date", required: true },
      { name: "bankName", label: "Bank Name", type: "text", required: true },
      { name: "companyName", label: "Company Name", type: "text", required: true },
      { name: "companyRegistration", label: "Commercial Registration", type: "text", required: true },
      { name: "employeeName", label: "Employee Name", type: "text", required: true },
      { name: "employeeCivilId", label: "Civil ID", type: "text", required: true },
      { name: "passportNumber", label: "Passport Number", type: "text", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "position", label: "Position", type: "text", required: true },
      { name: "monthlySalary", label: "Monthly Salary (OMR)", type: "number", required: true },
      { name: "accountType", label: "Account Type", type: "dropdown", required: true, options: ["Savings", "Current", "Salary"] },
      { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
      { name: "signatoryPosition", label: "Signatory Position", type: "text", required: true },
    ],
  },
  {
    templateName: "Salary Certificate",
    templateNameAr: "شهادة راتب",
    category: "employment",
    description: "Official salary certificate for employees",
    descriptionAr: "شهادة راتب رسمية للموظفين",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["salary", "certificate", "employment", "income"],
    templateContent: `
SALARY CERTIFICATE

Date: {{issueDate}}

To Whom It May Concern,

This is to certify that {{employeeName}}, holder of Civil ID No. {{employeeCivilId}} and Passport No. {{passportNumber}}, is employed with {{companyName}}, Commercial Registration No. {{companyRegistration}}.

Employee Details:
Position: {{position}}
Date of Joining: {{joiningDate}}
Employment Type: {{employmentType}}

Salary Breakdown:
Basic Salary: {{basicSalary}} OMR per month
Housing Allowance: {{housingAllowance}} OMR per month
Transport Allowance: {{transportAllowance}} OMR per month
Other Allowances: {{otherAllowances}} OMR per month
Total Monthly Salary: {{totalSalary}} OMR

This certificate is issued upon the employee's request for {{purpose}}.

Authorized Signatory: _______________
Name: {{signatoryName}}
Position: {{signatoryPosition}}
Company Stamp
`,
    variables: [
      { name: "issueDate", label: "Issue Date", type: "date", required: true },
      { name: "employeeName", label: "Employee Name", type: "text", required: true },
      { name: "employeeCivilId", label: "Civil ID", type: "text", required: true },
      { name: "passportNumber", label: "Passport Number", type: "text", required: true },
      { name: "companyName", label: "Company Name", type: "text", required: true },
      { name: "companyRegistration", label: "Commercial Registration", type: "text", required: true },
      { name: "position", label: "Position", type: "text", required: true },
      { name: "joiningDate", label: "Date of Joining", type: "date", required: true },
      { name: "employmentType", label: "Employment Type", type: "dropdown", required: true, options: ["Permanent", "Contract", "Part-time"] },
      { name: "basicSalary", label: "Basic Salary (OMR)", type: "number", required: true },
      { name: "housingAllowance", label: "Housing Allowance (OMR)", type: "number", required: false, defaultValue: "0" },
      { name: "transportAllowance", label: "Transport Allowance (OMR)", type: "number", required: false, defaultValue: "0" },
      { name: "otherAllowances", label: "Other Allowances (OMR)", type: "number", required: false, defaultValue: "0" },
      { name: "totalSalary", label: "Total Monthly Salary (OMR)", type: "number", required: true },
      { name: "purpose", label: "Purpose of Certificate", type: "text", required: true },
      { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
      { name: "signatoryPosition", label: "Signatory Position", type: "text", required: true },
    ],
  },
  {
    templateName: "Experience Certificate",
    templateNameAr: "شهادة خبرة",
    category: "employment",
    description: "Work experience certificate for employees",
    descriptionAr: "شهادة خبرة عمل للموظفين",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["experience", "certificate", "employment", "reference"],
    templateContent: `
EXPERIENCE CERTIFICATE

Date: {{issueDate}}

To Whom It May Concern,

This is to certify that {{employeeName}}, holder of Civil ID No. {{employeeCivilId}}, was employed with {{companyName}}, Commercial Registration No. {{companyRegistration}}.

Employment Details:
Position: {{position}}
Department: {{department}}
Date of Joining: {{joiningDate}}
Date of Leaving: {{leavingDate}}
Total Experience: {{totalExperience}}

During the employment period, {{employeeName}} demonstrated excellent professional skills and dedication. The employee was responsible for {{responsibilities}}.

Key Achievements:
{{achievements}}

We wish {{employeeName}} all the best in future endeavors.

Authorized Signatory: _______________
Name: {{signatoryName}}
Position: {{signatoryPosition}}
Company Stamp
`,
    variables: [
      { name: "issueDate", label: "Issue Date", type: "date", required: true },
      { name: "employeeName", label: "Employee Name", type: "text", required: true },
      { name: "employeeCivilId", label: "Civil ID", type: "text", required: true },
      { name: "companyName", label: "Company Name", type: "text", required: true },
      { name: "companyRegistration", label: "Commercial Registration", type: "text", required: true },
      { name: "position", label: "Position", type: "text", required: true },
      { name: "department", label: "Department", type: "text", required: true },
      { name: "joiningDate", label: "Date of Joining", type: "date", required: true },
      { name: "leavingDate", label: "Date of Leaving", type: "date", required: true },
      { name: "totalExperience", label: "Total Experience", type: "text", required: true, placeholder: "e.g., 3 years 6 months" },
      { name: "responsibilities", label: "Key Responsibilities", type: "textarea", required: true },
      { name: "achievements", label: "Key Achievements", type: "textarea", required: false },
      { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
      { name: "signatoryPosition", label: "Signatory Position", type: "text", required: true },
    ],
  },
  {
    templateName: "Business License Application",
    templateNameAr: "طلب رخصة تجارية",
    category: "business",
    description: "Application form for business license in Oman",
    descriptionAr: "نموذج طلب رخصة تجارية في عمان",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["business", "license", "registration", "legal"],
    templateContent: `
BUSINESS LICENSE APPLICATION

Application Date: {{applicationDate}}

APPLICANT INFORMATION:
Full Name: {{applicantName}}
Civil ID: {{applicantCivilId}}
Nationality: {{nationality}}
Phone: {{phone}}
Email: {{email}}
Address: {{address}}

BUSINESS INFORMATION:
Proposed Business Name: {{businessName}}
Business Activity: {{businessActivity}}
Business Type: {{businessType}}
Location: {{businessLocation}}
Governorate: {{governorate}}
Wilayat: {{wilayat}}

CAPITAL INFORMATION:
Proposed Capital: {{proposedCapital}} OMR
Number of Partners: {{numberOfPartners}}

ADDITIONAL INFORMATION:
Previous Business Experience: {{previousExperience}}
Reason for Business: {{businessReason}}

DECLARATION:
I hereby declare that all information provided above is true and correct to the best of my knowledge.

Applicant Signature: _______________
Date: ___________
`,
    variables: [
      { name: "applicationDate", label: "Application Date", type: "date", required: true },
      { name: "applicantName", label: "Applicant Full Name", type: "text", required: true },
      { name: "applicantCivilId", label: "Civil ID", type: "text", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "phone", label: "Phone Number", type: "phone", required: true },
      { name: "email", label: "Email Address", type: "email", required: true },
      { name: "address", label: "Address", type: "textarea", required: true },
      { name: "businessName", label: "Proposed Business Name", type: "text", required: true },
      { name: "businessActivity", label: "Business Activity", type: "text", required: true },
      { name: "businessType", label: "Business Type", type: "dropdown", required: true, options: ["Sole Proprietorship", "LLC", "Partnership", "Branch"] },
      { name: "businessLocation", label: "Business Location", type: "textarea", required: true },
      { name: "governorate", label: "Governorate", type: "text", required: true },
      { name: "wilayat", label: "Wilayat", type: "text", required: true },
      { name: "proposedCapital", label: "Proposed Capital (OMR)", type: "number", required: true },
      { name: "numberOfPartners", label: "Number of Partners", type: "number", required: true, defaultValue: "1" },
      { name: "previousExperience", label: "Previous Business Experience", type: "textarea", required: false },
      { name: "businessReason", label: "Reason for Starting Business", type: "textarea", required: true },
    ],
  },
  {
    templateName: "Tenancy Contract",
    templateNameAr: "عقد إيجار",
    category: "legal",
    description: "Residential or commercial tenancy agreement",
    descriptionAr: "عقد إيجار سكني أو تجاري",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["tenancy", "rental", "lease", "contract", "property"],
    templateContent: `
TENANCY CONTRACT

This Tenancy Contract is entered into on {{contractDate}} between:

LANDLORD:
Name: {{landlordName}}
Civil ID: {{landlordCivilId}}
Address: {{landlordAddress}}
Phone: {{landlordPhone}}

TENANT:
Name: {{tenantName}}
Civil ID: {{tenantCivilId}}
Address: {{tenantAddress}}
Phone: {{tenantPhone}}

PROPERTY DETAILS:
Property Type: {{propertyType}}
Property Address: {{propertyAddress}}
Area: {{propertyArea}} sqm
Number of Rooms: {{numberOfRooms}}

TERMS AND CONDITIONS:

1. RENTAL PERIOD
The tenancy shall commence on {{startDate}} and end on {{endDate}}.
Duration: {{duration}} months

2. RENT
Monthly Rent: {{monthlyRent}} OMR
Payment Method: {{paymentMethod}}
Payment Due Date: {{paymentDueDate}} of each month

3. SECURITY DEPOSIT
Security Deposit: {{securityDeposit}} OMR
To be refunded upon contract termination subject to property condition.

4. UTILITIES
{{utilitiesResponsibility}}

5. MAINTENANCE
{{maintenanceTerms}}

6. TERMINATION
Notice Period: {{noticePeriod}} days

LANDLORD SIGNATURE: _______________  TENANT SIGNATURE: _______________
Date: ___________                    Date: ___________
`,
    variables: [
      { name: "contractDate", label: "Contract Date", type: "date", required: true },
      { name: "landlordName", label: "Landlord Name", type: "text", required: true },
      { name: "landlordCivilId", label: "Landlord Civil ID", type: "text", required: true },
      { name: "landlordAddress", label: "Landlord Address", type: "textarea", required: true },
      { name: "landlordPhone", label: "Landlord Phone", type: "phone", required: true },
      { name: "tenantName", label: "Tenant Name", type: "text", required: true },
      { name: "tenantCivilId", label: "Tenant Civil ID", type: "text", required: true },
      { name: "tenantAddress", label: "Tenant Address", type: "textarea", required: true },
      { name: "tenantPhone", label: "Tenant Phone", type: "phone", required: true },
      { name: "propertyType", label: "Property Type", type: "dropdown", required: true, options: ["Apartment", "Villa", "Office", "Shop", "Warehouse"] },
      { name: "propertyAddress", label: "Property Address", type: "textarea", required: true },
      { name: "propertyArea", label: "Property Area (sqm)", type: "number", required: true },
      { name: "numberOfRooms", label: "Number of Rooms", type: "number", required: true },
      { name: "startDate", label: "Start Date", type: "date", required: true },
      { name: "endDate", label: "End Date", type: "date", required: true },
      { name: "duration", label: "Duration (months)", type: "number", required: true, defaultValue: "12" },
      { name: "monthlyRent", label: "Monthly Rent (OMR)", type: "number", required: true },
      { name: "paymentMethod", label: "Payment Method", type: "dropdown", required: true, options: ["Bank Transfer", "Cash", "Cheque"] },
      { name: "paymentDueDate", label: "Payment Due Date", type: "number", required: true, defaultValue: "1" },
      { name: "securityDeposit", label: "Security Deposit (OMR)", type: "number", required: true },
      { name: "utilitiesResponsibility", label: "Utilities Responsibility", type: "textarea", required: true },
      { name: "maintenanceTerms", label: "Maintenance Terms", type: "textarea", required: true },
      { name: "noticePeriod", label: "Notice Period (days)", type: "number", required: true, defaultValue: "30" },
    ],
  },
  {
    templateName: "Power of Attorney",
    templateNameAr: "توكيل رسمي",
    category: "legal",
    description: "Legal power of attorney document",
    descriptionAr: "وثيقة توكيل قانونية",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["power of attorney", "legal", "authorization", "proxy"],
    templateContent: `
POWER OF ATTORNEY

Date: {{issueDate}}

I, {{principalName}}, holder of Civil ID No. {{principalCivilId}}, residing at {{principalAddress}}, hereby appoint:

{{attorneyName}}, holder of Civil ID No. {{attorneyCivilId}}, residing at {{attorneyAddress}}

as my lawful attorney to act on my behalf for the following purpose:

{{purpose}}

SCOPE OF AUTHORITY:
{{scopeOfAuthority}}

This Power of Attorney shall be valid from {{validFrom}} to {{validUntil}}.

PRINCIPAL'S SIGNATURE: _______________
Name: {{principalName}}
Date: ___________

ATTORNEY'S ACCEPTANCE: _______________
Name: {{attorneyName}}
Date: ___________

WITNESS 1: _______________
Name: {{witness1Name}}
Civil ID: {{witness1CivilId}}

WITNESS 2: _______________
Name: {{witness2Name}}
Civil ID: {{witness2CivilId}}
`,
    variables: [
      { name: "issueDate", label: "Issue Date", type: "date", required: true },
      { name: "principalName", label: "Principal Name", type: "text", required: true },
      { name: "principalCivilId", label: "Principal Civil ID", type: "text", required: true },
      { name: "principalAddress", label: "Principal Address", type: "textarea", required: true },
      { name: "attorneyName", label: "Attorney Name", type: "text", required: true },
      { name: "attorneyCivilId", label: "Attorney Civil ID", type: "text", required: true },
      { name: "attorneyAddress", label: "Attorney Address", type: "textarea", required: true },
      { name: "purpose", label: "Purpose of Power of Attorney", type: "textarea", required: true },
      { name: "scopeOfAuthority", label: "Scope of Authority", type: "textarea", required: true },
      { name: "validFrom", label: "Valid From", type: "date", required: true },
      { name: "validUntil", label: "Valid Until", type: "date", required: true },
      { name: "witness1Name", label: "Witness 1 Name", type: "text", required: true },
      { name: "witness1CivilId", label: "Witness 1 Civil ID", type: "text", required: true },
      { name: "witness2Name", label: "Witness 2 Name", type: "text", required: true },
      { name: "witness2CivilId", label: "Witness 2 Civil ID", type: "text", required: true },
    ],
  },
  {
    templateName: "Partnership Agreement",
    templateNameAr: "اتفاقية شراكة",
    category: "business",
    description: "Business partnership agreement between two or more parties",
    descriptionAr: "اتفاقية شراكة تجارية بين طرفين أو أكثر",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["partnership", "business", "agreement", "contract"],
    templateContent: `
PARTNERSHIP AGREEMENT

This Partnership Agreement is entered into on {{agreementDate}} between:

PARTNER 1:
Name: {{partner1Name}}
Civil ID: {{partner1CivilId}}
Address: {{partner1Address}}
Capital Contribution: {{partner1Capital}} OMR ({{partner1Percentage}}%)

PARTNER 2:
Name: {{partner2Name}}
Civil ID: {{partner2CivilId}}
Address: {{partner2Address}}
Capital Contribution: {{partner2Capital}} OMR ({{partner2Percentage}}%)

BUSINESS DETAILS:
Business Name: {{businessName}}
Business Activity: {{businessActivity}}
Business Address: {{businessAddress}}
Total Capital: {{totalCapital}} OMR

TERMS AND CONDITIONS:

1. PROFIT AND LOSS SHARING
Profits and losses shall be shared in proportion to capital contribution.

2. MANAGEMENT
{{managementTerms}}

3. DECISION MAKING
{{decisionMakingTerms}}

4. WITHDRAWAL OF CAPITAL
{{withdrawalTerms}}

5. DISSOLUTION
{{dissolutionTerms}}

6. DISPUTE RESOLUTION
Any disputes shall be resolved through {{disputeResolution}}.

This agreement is governed by the laws of the Sultanate of Oman.

PARTNER 1 SIGNATURE: _______________  PARTNER 2 SIGNATURE: _______________
Date: ___________                     Date: ___________
`,
    variables: [
      { name: "agreementDate", label: "Agreement Date", type: "date", required: true },
      { name: "partner1Name", label: "Partner 1 Name", type: "text", required: true },
      { name: "partner1CivilId", label: "Partner 1 Civil ID", type: "text", required: true },
      { name: "partner1Address", label: "Partner 1 Address", type: "textarea", required: true },
      { name: "partner1Capital", label: "Partner 1 Capital (OMR)", type: "number", required: true },
      { name: "partner1Percentage", label: "Partner 1 Percentage (%)", type: "number", required: true },
      { name: "partner2Name", label: "Partner 2 Name", type: "text", required: true },
      { name: "partner2CivilId", label: "Partner 2 Civil ID", type: "text", required: true },
      { name: "partner2Address", label: "Partner 2 Address", type: "textarea", required: true },
      { name: "partner2Capital", label: "Partner 2 Capital (OMR)", type: "number", required: true },
      { name: "partner2Percentage", label: "Partner 2 Percentage (%)", type: "number", required: true },
      { name: "businessName", label: "Business Name", type: "text", required: true },
      { name: "businessActivity", label: "Business Activity", type: "text", required: true },
      { name: "businessAddress", label: "Business Address", type: "textarea", required: true },
      { name: "totalCapital", label: "Total Capital (OMR)", type: "number", required: true },
      { name: "managementTerms", label: "Management Terms", type: "textarea", required: true },
      { name: "decisionMakingTerms", label: "Decision Making Terms", type: "textarea", required: true },
      { name: "withdrawalTerms", label: "Capital Withdrawal Terms", type: "textarea", required: true },
      { name: "dissolutionTerms", label: "Dissolution Terms", type: "textarea", required: true },
      { name: "disputeResolution", label: "Dispute Resolution Method", type: "text", required: true, defaultValue: "arbitration" },
    ],
  },
  {
    templateName: "Work Permit Application",
    templateNameAr: "طلب تصريح عمل",
    category: "immigration",
    description: "Application for work permit in Oman",
    descriptionAr: "طلب تصريح عمل في عمان",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["work permit", "immigration", "visa", "employment"],
    templateContent: `
WORK PERMIT APPLICATION

Application Date: {{applicationDate}}

EMPLOYER INFORMATION:
Company Name: {{companyName}}
Commercial Registration: {{companyRegistration}}
Company Address: {{companyAddress}}
Contact Person: {{contactPerson}}
Phone: {{companyPhone}}
Email: {{companyEmail}}

EMPLOYEE INFORMATION:
Full Name: {{employeeName}}
Passport Number: {{passportNumber}}
Nationality: {{nationality}}
Date of Birth: {{dateOfBirth}}
Gender: {{gender}}
Marital Status: {{maritalStatus}}
Educational Qualification: {{education}}

EMPLOYMENT DETAILS:
Position: {{position}}
Job Description: {{jobDescription}}
Monthly Salary: {{monthlySalary}} OMR
Contract Duration: {{contractDuration}} months
Proposed Start Date: {{startDate}}

DECLARATION:
The employer declares that all information provided is true and accurate.

Authorized Signatory: _______________
Name: {{signatoryName}}
Position: {{signatoryPosition}}
Company Stamp
Date: ___________
`,
    variables: [
      { name: "applicationDate", label: "Application Date", type: "date", required: true },
      { name: "companyName", label: "Company Name", type: "text", required: true },
      { name: "companyRegistration", label: "Commercial Registration", type: "text", required: true },
      { name: "companyAddress", label: "Company Address", type: "textarea", required: true },
      { name: "contactPerson", label: "Contact Person", type: "text", required: true },
      { name: "companyPhone", label: "Company Phone", type: "phone", required: true },
      { name: "companyEmail", label: "Company Email", type: "email", required: true },
      { name: "employeeName", label: "Employee Full Name", type: "text", required: true },
      { name: "passportNumber", label: "Passport Number", type: "text", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      { name: "gender", label: "Gender", type: "dropdown", required: true, options: ["Male", "Female"] },
      { name: "maritalStatus", label: "Marital Status", type: "dropdown", required: true, options: ["Single", "Married", "Divorced", "Widowed"] },
      { name: "education", label: "Educational Qualification", type: "text", required: true },
      { name: "position", label: "Position", type: "text", required: true },
      { name: "jobDescription", label: "Job Description", type: "textarea", required: true },
      { name: "monthlySalary", label: "Monthly Salary (OMR)", type: "number", required: true },
      { name: "contractDuration", label: "Contract Duration (months)", type: "number", required: true, defaultValue: "24" },
      { name: "startDate", label: "Proposed Start Date", type: "date", required: true },
      { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
      { name: "signatoryPosition", label: "Signatory Position", type: "text", required: true },
    ],
  },
  {
    templateName: "Tax Registration Form",
    templateNameAr: "نموذج التسجيل الضريبي",
    category: "business",
    description: "Tax registration application for businesses",
    descriptionAr: "طلب تسجيل ضريبي للشركات",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["tax", "registration", "business", "vat"],
    templateContent: `
TAX REGISTRATION FORM

Application Date: {{applicationDate}}

BUSINESS INFORMATION:
Business Name: {{businessName}}
Commercial Registration: {{commercialRegistration}}
Business Activity: {{businessActivity}}
Business Type: {{businessType}}
Date of Establishment: {{establishmentDate}}

REGISTERED ADDRESS:
Address: {{businessAddress}}
Governorate: {{governorate}}
Wilayat: {{wilayat}}
Postal Code: {{postalCode}}
Phone: {{businessPhone}}
Email: {{businessEmail}}

OWNER INFORMATION:
Owner Name: {{ownerName}}
Civil ID: {{ownerCivilId}}
Nationality: {{nationality}}
Phone: {{ownerPhone}}
Email: {{ownerEmail}}

FINANCIAL INFORMATION:
Expected Annual Turnover: {{annualTurnover}} OMR
Number of Employees: {{numberOfEmployees}}
Bank Name: {{bankName}}
Bank Account Number: {{bankAccountNumber}}

TAX INFORMATION:
Tax Type: {{taxType}}
Reason for Registration: {{registrationReason}}

DECLARATION:
I hereby declare that all information provided is true and correct.

Applicant Signature: _______________
Name: {{ownerName}}
Date: ___________
`,
    variables: [
      { name: "applicationDate", label: "Application Date", type: "date", required: true },
      { name: "businessName", label: "Business Name", type: "text", required: true },
      { name: "commercialRegistration", label: "Commercial Registration", type: "text", required: true },
      { name: "businessActivity", label: "Business Activity", type: "text", required: true },
      { name: "businessType", label: "Business Type", type: "dropdown", required: true, options: ["Sole Proprietorship", "LLC", "Partnership", "Corporation"] },
      { name: "establishmentDate", label: "Date of Establishment", type: "date", required: true },
      { name: "businessAddress", label: "Business Address", type: "textarea", required: true },
      { name: "governorate", label: "Governorate", type: "text", required: true },
      { name: "wilayat", label: "Wilayat", type: "text", required: true },
      { name: "postalCode", label: "Postal Code", type: "text", required: false },
      { name: "businessPhone", label: "Business Phone", type: "phone", required: true },
      { name: "businessEmail", label: "Business Email", type: "email", required: true },
      { name: "ownerName", label: "Owner Name", type: "text", required: true },
      { name: "ownerCivilId", label: "Owner Civil ID", type: "text", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "ownerPhone", label: "Owner Phone", type: "phone", required: true },
      { name: "ownerEmail", label: "Owner Email", type: "email", required: true },
      { name: "annualTurnover", label: "Expected Annual Turnover (OMR)", type: "number", required: true },
      { name: "numberOfEmployees", label: "Number of Employees", type: "number", required: true },
      { name: "bankName", label: "Bank Name", type: "text", required: true },
      { name: "bankAccountNumber", label: "Bank Account Number", type: "text", required: true },
      { name: "taxType", label: "Tax Type", type: "dropdown", required: true, options: ["VAT", "Income Tax", "Corporate Tax"] },
      { name: "registrationReason", label: "Reason for Registration", type: "textarea", required: true },
    ],
  },
  {
    templateName: "Company Board Resolution",
    templateNameAr: "قرار مجلس إدارة الشركة",
    category: "business",
    description: "Board resolution document for company decisions",
    descriptionAr: "وثيقة قرار مجلس الإدارة لقرارات الشركة",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["board resolution", "corporate", "governance", "decision"],
    templateContent: `
BOARD RESOLUTION

Company Name: {{companyName}}
Commercial Registration: {{commercialRegistration}}
Meeting Date: {{meetingDate}}
Meeting Location: {{meetingLocation}}

ATTENDEES:
{{attendees}}

AGENDA:
{{agenda}}

RESOLUTION:
The Board of Directors of {{companyName}} hereby resolves:

{{resolutionDetails}}

VOTING RESULTS:
In Favor: {{votesInFavor}}
Against: {{votesAgainst}}
Abstained: {{votesAbstained}}

Result: {{result}}

EFFECTIVE DATE:
This resolution shall be effective from {{effectiveDate}}.

SIGNATURES:

Chairman: _______________
Name: {{chairmanName}}
Date: ___________

Secretary: _______________
Name: {{secretaryName}}
Date: ___________

Board Members:
{{boardMemberSignatures}}
`,
    variables: [
      { name: "companyName", label: "Company Name", type: "text", required: true },
      { name: "commercialRegistration", label: "Commercial Registration", type: "text", required: true },
      { name: "meetingDate", label: "Meeting Date", type: "date", required: true },
      { name: "meetingLocation", label: "Meeting Location", type: "text", required: true },
      { name: "attendees", label: "Attendees", type: "textarea", required: true, placeholder: "List all attendees with their positions" },
      { name: "agenda", label: "Meeting Agenda", type: "textarea", required: true },
      { name: "resolutionDetails", label: "Resolution Details", type: "textarea", required: true },
      { name: "votesInFavor", label: "Votes in Favor", type: "number", required: true },
      { name: "votesAgainst", label: "Votes Against", type: "number", required: true, defaultValue: "0" },
      { name: "votesAbstained", label: "Votes Abstained", type: "number", required: true, defaultValue: "0" },
      { name: "result", label: "Result", type: "dropdown", required: true, options: ["Approved", "Rejected", "Deferred"] },
      { name: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { name: "chairmanName", label: "Chairman Name", type: "text", required: true },
      { name: "secretaryName", label: "Secretary Name", type: "text", required: true },
      { name: "boardMemberSignatures", label: "Board Member Signatures", type: "textarea", required: false, placeholder: "Space for board member signatures" },
    ],
  },
  {
    templateName: "Commercial Registration Form",
    templateNameAr: "نموذج السجل التجاري",
    category: "business",
    description: "Commercial registration application form",
    descriptionAr: "نموذج طلب السجل التجاري",
    language: "en",
    isOfficial: true,
    isPremium: false,
    tags: ["commercial registration", "business", "registration", "legal"],
    templateContent: `
COMMERCIAL REGISTRATION FORM

Application Date: {{applicationDate}}

APPLICANT INFORMATION:
Full Name: {{applicantName}}
Civil ID: {{applicantCivilId}}
Nationality: {{nationality}}
Date of Birth: {{dateOfBirth}}
Phone: {{phone}}
Email: {{email}}
Address: {{address}}

BUSINESS INFORMATION:
Proposed Trade Name (Arabic): {{tradeNameAr}}
Proposed Trade Name (English): {{tradeNameEn}}
Business Activity: {{businessActivity}}
Business Type: {{businessType}}
Business Address: {{businessAddress}}
Governorate: {{governorate}}
Wilayat: {{wilayat}}

CAPITAL INFORMATION:
Proposed Capital: {{proposedCapital}} OMR
Number of Partners: {{numberOfPartners}}
Partner Details: {{partnerDetails}}

PREMISES INFORMATION:
Premises Type: {{premisesType}}
Premises Area: {{premisesArea}} sqm
Lease Agreement Number: {{leaseAgreementNumber}}

DECLARATION:
I hereby declare that all information provided is true and correct, and I undertake to comply with all applicable laws and regulations of the Sultanate of Oman.

Applicant Signature: _______________
Date: ___________

FOR OFFICIAL USE ONLY:
Registration Number: _______________
Registration Date: _______________
Approved By: _______________
`,
    variables: [
      { name: "applicationDate", label: "Application Date", type: "date", required: true },
      { name: "applicantName", label: "Applicant Full Name", type: "text", required: true },
      { name: "applicantCivilId", label: "Civil ID", type: "text", required: true },
      { name: "nationality", label: "Nationality", type: "text", required: true },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      { name: "phone", label: "Phone Number", type: "phone", required: true },
      { name: "email", label: "Email Address", type: "email", required: true },
      { name: "address", label: "Address", type: "textarea", required: true },
      { name: "tradeNameAr", label: "Trade Name (Arabic)", type: "text", required: true },
      { name: "tradeNameEn", label: "Trade Name (English)", type: "text", required: true },
      { name: "businessActivity", label: "Business Activity", type: "text", required: true },
      { name: "businessType", label: "Business Type", type: "dropdown", required: true, options: ["Sole Proprietorship", "LLC", "Partnership", "Branch", "Representative Office"] },
      { name: "businessAddress", label: "Business Address", type: "textarea", required: true },
      { name: "governorate", label: "Governorate", type: "text", required: true },
      { name: "wilayat", label: "Wilayat", type: "text", required: true },
      { name: "proposedCapital", label: "Proposed Capital (OMR)", type: "number", required: true },
      { name: "numberOfPartners", label: "Number of Partners", type: "number", required: true, defaultValue: "1" },
      { name: "partnerDetails", label: "Partner Details", type: "textarea", required: false, placeholder: "List all partners with their details" },
      { name: "premisesType", label: "Premises Type", type: "dropdown", required: true, options: ["Owned", "Rented", "Shared"] },
      { name: "premisesArea", label: "Premises Area (sqm)", type: "number", required: true },
      { name: "leaseAgreementNumber", label: "Lease Agreement Number", type: "text", required: false },
    ],
  },
];

async function seedTemplates() {
  console.log("Starting template seeding...");
  
  try {
    for (const template of templates) {
      await db.insert(documentTemplates).values(template as any);
      console.log(`✓ Inserted template: ${template.templateName}`);
    }
    
    console.log(`\n✅ Successfully seeded ${templates.length} document templates!`);
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    throw error;
  }
}

seedTemplates()
  .then(() => {
    console.log("\n🎉 Template seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Template seeding failed:", error);
    process.exit(1);
  });
