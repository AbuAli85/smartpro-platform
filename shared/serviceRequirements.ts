/**
 * Service-specific requirements and configurations
 * Used to dynamically generate booking forms based on service type
 */

export interface ServiceRequirement {
  id: string;
  label: string;
  type: "text" | "number" | "file" | "select" | "date";
  required: boolean;
  placeholder?: string;
  options?: string[];
  helpText?: string;
  fileTypes?: string[];
}

export interface ServiceConfig {
  category: string;
  icon: string;
  description: string;
  typicalDuration: string;
  turnaroundTime: string;
  whatsIncluded: string[];
  requiredDocuments: string[];
  formFields: ServiceRequirement[];
  estimatedWorkload: "low" | "medium" | "high";
}

export const SERVICE_CONFIGURATIONS: Record<string, ServiceConfig> = {
  "business-registration": {
    category: "Business Registration",
    icon: "Building2",
    description: "Complete business registration with Ministry of Commerce",
    typicalDuration: "60 minutes",
    turnaroundTime: "3-5 business days",
    whatsIncluded: [
      "Commercial registration certificate",
      "Tax registration number",
      "Chamber of Commerce membership",
      "Municipal license application",
    ],
    requiredDocuments: [
      "Valid Omani ID or Residence Card",
      "Proof of address (utility bill or tenancy contract)",
      "Business activity description",
      "Partner details (if applicable)",
    ],
    formFields: [
      {
        id: "businessName",
        label: "Proposed Business Name",
        type: "text",
        required: true,
        placeholder: "Enter your business name",
        helpText: "Provide 2-3 alternative names in case your first choice is taken",
      },
      {
        id: "businessActivity",
        label: "Business Activity",
        type: "select",
        required: true,
        options: [
          "Trading",
          "Services",
          "Manufacturing",
          "Construction",
          "Technology",
          "Consulting",
          "Other",
        ],
        helpText: "Select the primary activity of your business",
      },
      {
        id: "capitalAmount",
        label: "Initial Capital (OMR)",
        type: "number",
        required: true,
        placeholder: "10000",
        helpText: "Minimum capital requirements vary by business type",
      },
      {
        id: "numberOfPartners",
        label: "Number of Partners",
        type: "number",
        required: true,
        placeholder: "1",
      },
      {
        id: "idDocument",
        label: "Upload ID Document",
        type: "file",
        required: true,
        fileTypes: ["application/pdf", "image/jpeg", "image/png"],
        helpText: "Clear copy of your Omani ID or Residence Card",
      },
      {
        id: "addressProof",
        label: "Upload Proof of Address",
        type: "file",
        required: true,
        fileTypes: ["application/pdf", "image/jpeg", "image/png"],
      },
    ],
    estimatedWorkload: "high",
  },

  "tax-registration": {
    category: "Tax Registration",
    icon: "Receipt",
    description: "VAT registration and tax compliance services",
    typicalDuration: "45 minutes",
    turnaroundTime: "2-3 business days",
    whatsIncluded: [
      "VAT registration certificate",
      "Tax identification number (TIN)",
      "Tax filing guidance",
      "Compliance checklist",
    ],
    requiredDocuments: [
      "Commercial registration certificate",
      "Business bank account details",
      "Estimated annual turnover",
      "Business activity details",
    ],
    formFields: [
      {
        id: "commercialRegNumber",
        label: "Commercial Registration Number",
        type: "text",
        required: true,
        placeholder: "CR-XXXX-XXXX",
      },
      {
        id: "annualTurnover",
        label: "Estimated Annual Turnover (OMR)",
        type: "number",
        required: true,
        placeholder: "100000",
        helpText: "VAT registration is mandatory if turnover exceeds 38,500 OMR",
      },
      {
        id: "businessStartDate",
        label: "Business Start Date",
        type: "date",
        required: true,
      },
      {
        id: "crCertificate",
        label: "Upload CR Certificate",
        type: "file",
        required: true,
        fileTypes: ["application/pdf"],
      },
      {
        id: "bankStatement",
        label: "Upload Bank Statement",
        type: "file",
        required: true,
        fileTypes: ["application/pdf"],
        helpText: "Last 3 months business bank statement",
      },
    ],
    estimatedWorkload: "medium",
  },

  "legal-consultation": {
    category: "Legal Consultation",
    icon: "Scale",
    description: "Professional legal advice for business matters",
    typicalDuration: "60 minutes",
    turnaroundTime: "Same day",
    whatsIncluded: [
      "One-on-one consultation with legal expert",
      "Written summary of advice",
      "Action plan and next steps",
      "Follow-up email support (7 days)",
    ],
    requiredDocuments: [
      "Relevant contracts or agreements",
      "Correspondence related to the issue",
      "Any supporting documents",
    ],
    formFields: [
      {
        id: "consultationType",
        label: "Consultation Type",
        type: "select",
        required: true,
        options: [
          "Contract Review",
          "Dispute Resolution",
          "Employment Law",
          "Intellectual Property",
          "Corporate Governance",
          "General Legal Advice",
        ],
      },
      {
        id: "urgencyLevel",
        label: "Urgency Level",
        type: "select",
        required: true,
        options: ["Urgent (within 24h)", "Normal (within 3 days)", "Flexible"],
      },
      {
        id: "caseBackground",
        label: "Case Background",
        type: "text",
        required: true,
        placeholder: "Provide detailed background of your legal matter",
        helpText: "The more details you provide, the better we can prepare for your consultation",
      },
      {
        id: "supportingDocs",
        label: "Upload Supporting Documents",
        type: "file",
        required: false,
        fileTypes: ["application/pdf", "image/jpeg", "image/png"],
        helpText: "Upload any relevant contracts, agreements, or correspondence",
      },
    ],
    estimatedWorkload: "low",
  },

  "accounting-services": {
    category: "Accounting & Bookkeeping",
    icon: "Calculator",
    description: "Professional accounting and financial management",
    typicalDuration: "90 minutes",
    turnaroundTime: "5-7 business days",
    whatsIncluded: [
      "Financial statements preparation",
      "Bookkeeping setup",
      "Tax filing assistance",
      "Monthly financial reports",
    ],
    requiredDocuments: [
      "Bank statements (last 6 months)",
      "Sales and purchase invoices",
      "Payroll records",
      "Previous tax returns (if any)",
    ],
    formFields: [
      {
        id: "serviceType",
        label: "Service Type",
        type: "select",
        required: true,
        options: [
          "Monthly Bookkeeping",
          "Annual Financial Statements",
          "Tax Filing",
          "Payroll Management",
          "Financial Audit",
        ],
      },
      {
        id: "businessSize",
        label: "Business Size",
        type: "select",
        required: true,
        options: [
          "Small (1-5 employees)",
          "Medium (6-20 employees)",
          "Large (20+ employees)",
        ],
      },
      {
        id: "accountingSoftware",
        label: "Current Accounting Software",
        type: "select",
        required: false,
        options: ["QuickBooks", "Xero", "Zoho Books", "Excel", "None", "Other"],
      },
      {
        id: "financialDocs",
        label: "Upload Financial Documents",
        type: "file",
        required: true,
        fileTypes: ["application/pdf", "application/vnd.ms-excel"],
        helpText: "Upload recent bank statements or financial records",
      },
    ],
    estimatedWorkload: "high",
  },

  "default": {
    category: "General Service",
    icon: "FileText",
    description: "Professional business service",
    typicalDuration: "60 minutes",
    turnaroundTime: "3-5 business days",
    whatsIncluded: [
      "Professional consultation",
      "Service completion certificate",
      "Follow-up support",
    ],
    requiredDocuments: [
      "Valid identification",
      "Relevant business documents",
    ],
    formFields: [
      {
        id: "serviceDetails",
        label: "Service Details",
        type: "text",
        required: true,
        placeholder: "Describe the service you need in detail",
        helpText: "Provide as much information as possible",
      },
      {
        id: "supportingDocs",
        label: "Upload Supporting Documents",
        type: "file",
        required: false,
        fileTypes: ["application/pdf", "image/jpeg", "image/png"],
      },
    ],
    estimatedWorkload: "medium",
  },
};

/**
 * Get service configuration by category or service name
 */
export function getServiceConfig(serviceName: string): ServiceConfig {
  const normalizedName = serviceName.toLowerCase().replace(/[^a-z]/g, "-");
  
  for (const [key, config] of Object.entries(SERVICE_CONFIGURATIONS)) {
    if (normalizedName.includes(key) || serviceName.toLowerCase().includes(config.category.toLowerCase())) {
      return config;
    }
  }
  
  return SERVICE_CONFIGURATIONS.default;
}
