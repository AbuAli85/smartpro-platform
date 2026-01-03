import { invokeLLM } from "./_core/llm";

export interface DocumentValidationResult {
  isValid: boolean;
  documentType: string;
  confidence: number;
  issues: string[];
  suggestions: string[];
  extractedInfo?: {
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    holderName?: string;
  };
}

export interface DocumentRequirement {
  type: string;
  required: boolean;
  description: string;
}

/**
 * Get required documents based on service type
 */
export function getRequiredDocuments(serviceType: string): DocumentRequirement[] {
  const requirementMap: Record<string, DocumentRequirement[]> = {
    "Commercial Registration": [
      {
        type: "national_id",
        required: true,
        description: "Valid National ID or Passport",
      },
      {
        type: "business_plan",
        required: false,
        description: "Business plan or concept document",
      },
      {
        type: "proof_of_address",
        required: true,
        description: "Proof of business address (lease agreement or utility bill)",
      },
    ],
    "Tax Registration": [
      {
        type: "national_id",
        required: true,
        description: "Valid National ID or Passport",
      },
      {
        type: "commercial_registration",
        required: true,
        description: "Commercial Registration Certificate",
      },
      {
        type: "bank_statement",
        required: false,
        description: "Recent bank statement",
      },
    ],
    "VAT Registration": [
      {
        type: "national_id",
        required: true,
        description: "Valid National ID or Passport",
      },
      {
        type: "commercial_registration",
        required: true,
        description: "Commercial Registration Certificate",
      },
      {
        type: "tax_registration",
        required: true,
        description: "Tax Registration Certificate",
      },
      {
        type: "financial_statements",
        required: true,
        description: "Financial statements for the last 12 months",
      },
    ],
    "Business License": [
      {
        type: "national_id",
        required: true,
        description: "Valid National ID or Passport",
      },
      {
        type: "commercial_registration",
        required: false,
        description: "Commercial Registration (if already obtained)",
      },
      {
        type: "proof_of_address",
        required: true,
        description: "Proof of business premises",
      },
    ],
    "Trade License": [
      {
        type: "national_id",
        required: true,
        description: "Valid National ID or Passport",
      },
      {
        type: "business_plan",
        required: true,
        description: "Trade business plan",
      },
      {
        type: "proof_of_address",
        required: true,
        description: "Proof of business address",
      },
    ],
    "Legal Consultation": [
      {
        type: "relevant_documents",
        required: false,
        description: "Any relevant legal documents or contracts",
      },
    ],
    "Accounting Services": [
      {
        type: "commercial_registration",
        required: true,
        description: "Commercial Registration Certificate",
      },
      {
        type: "financial_records",
        required: false,
        description: "Existing financial records or statements",
      },
    ],
    "Document Translation": [
      {
        type: "original_document",
        required: true,
        description: "Original document to be translated",
      },
    ],
  };

  return requirementMap[serviceType] || [
    {
      type: "supporting_documents",
      required: false,
      description: "Any relevant supporting documents",
    },
  ];
}

/**
 * Validate a document using AI
 */
export async function validateDocument(
  documentUrl: string,
  expectedType: string,
  serviceType: string
): Promise<DocumentValidationResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a document validation expert for business services in Oman. 
Analyze documents and validate their authenticity, completeness, and relevance.
Respond ONLY with valid JSON matching this exact structure:
{
  "isValid": boolean,
  "documentType": string,
  "confidence": number (0-100),
  "issues": string[],
  "suggestions": string[],
  "extractedInfo": {
    "documentNumber": string or null,
    "issueDate": string or null,
    "expiryDate": string or null,
    "holderName": string or null
  }
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Validate this document for a ${serviceType} service request.
Expected document type: ${expectedType}

Check for:
1. Document type matches expected type
2. Document is clear and readable
3. Document appears authentic (not obviously fake or tampered)
4. All required information is visible
5. Document is not expired (if applicable)

Provide validation result in JSON format.`,
            },
            {
              type: "image_url",
              image_url: {
                url: documentUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "document_validation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              isValid: { type: "boolean" },
              documentType: { type: "string" },
              confidence: { type: "number" },
              issues: {
                type: "array",
                items: { type: "string" },
              },
              suggestions: {
                type: "array",
                items: { type: "string" },
              },
              extractedInfo: {
                type: "object",
                properties: {
                  documentNumber: { type: ["string", "null"] },
                  issueDate: { type: ["string", "null"] },
                  expiryDate: { type: ["string", "null"] },
                  holderName: { type: ["string", "null"] },
                },
                required: ["documentNumber", "issueDate", "expiryDate", "holderName"],
                additionalProperties: false,
              },
            },
            required: ["isValid", "documentType", "confidence", "issues", "suggestions", "extractedInfo"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const result = JSON.parse(contentStr) as DocumentValidationResult;
    return result;
  } catch (error) {
    console.error("Document validation error:", error);
    
    // Return a fallback result
    return {
      isValid: false,
      documentType: "unknown",
      confidence: 0,
      issues: ["Failed to validate document automatically. Manual review required."],
      suggestions: ["Please ensure the document is clear and in a supported format (PDF, JPG, PNG)."],
    };
  }
}

/**
 * Validate multiple documents
 */
export async function validateDocuments(
  documents: Array<{ url: string; name: string; type?: string }>,
  serviceType: string
): Promise<Array<DocumentValidationResult & { fileName: string }>> {
  const requiredDocs = getRequiredDocuments(serviceType);
  
  const results = await Promise.all(
    documents.map(async (doc) => {
      // Try to determine expected type from filename or provided type
      const expectedType = doc.type || determineDocumentType(doc.name);
      
      const validation = await validateDocument(doc.url, expectedType, serviceType);
      
      return {
        ...validation,
        fileName: doc.name,
      };
    })
  );

  return results;
}

/**
 * Determine document type from filename
 */
function determineDocumentType(filename: string): string {
  const lower = filename.toLowerCase();
  
  if (lower.includes("id") || lower.includes("passport")) {
    return "national_id";
  }
  if (lower.includes("commercial") || lower.includes("cr")) {
    return "commercial_registration";
  }
  if (lower.includes("tax")) {
    return "tax_registration";
  }
  if (lower.includes("license")) {
    return "business_license";
  }
  if (lower.includes("lease") || lower.includes("utility") || lower.includes("address")) {
    return "proof_of_address";
  }
  if (lower.includes("bank") || lower.includes("statement")) {
    return "bank_statement";
  }
  if (lower.includes("financial")) {
    return "financial_statements";
  }
  
  return "supporting_document";
}

/**
 * Check if all required documents are provided
 */
export function checkDocumentCompleteness(
  uploadedDocuments: Array<{ type: string }>,
  serviceType: string
): {
  isComplete: boolean;
  missingDocuments: DocumentRequirement[];
} {
  const requiredDocs = getRequiredDocuments(serviceType);
  const requiredTypes = requiredDocs.filter((doc) => doc.required);
  
  const uploadedTypes = uploadedDocuments.map((doc) => doc.type);
  
  const missingDocuments = requiredTypes.filter(
    (req) => !uploadedTypes.includes(req.type)
  );
  
  return {
    isComplete: missingDocuments.length === 0,
    missingDocuments,
  };
}
