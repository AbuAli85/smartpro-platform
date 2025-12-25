import { drizzle } from 'drizzle-orm/mysql2';
import { documentTemplates } from '../drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

const templates = [
  {
    templateName: 'Employment Contract',
    templateNameAr: 'عقد عمل',
    description: 'Standard employment contract for hiring employees in Oman',
    descriptionAr: 'عقد عمل قياسي لتوظيف الموظفين في عمان',
    category: 'Employment',
    variables: [
      { name: 'employerName', label: 'Employer Name', labelAr: 'اسم صاحب العمل', type: 'text', required: true },
      { name: 'employerCR', label: 'Commercial Registration', labelAr: 'السجل التجاري', type: 'text', required: true },
      { name: 'employeeName', label: 'Employee Name', labelAr: 'اسم الموظف', type: 'text', required: true },
      { name: 'employeeID', label: 'Civil ID Number', labelAr: 'رقم البطاقة المدنية', type: 'text', required: true },
      { name: 'position', label: 'Job Position', labelAr: 'المسمى الوظيفي', type: 'text', required: true },
      { name: 'salary', label: 'Monthly Salary (OMR)', labelAr: 'الراتب الشهري (ريال عماني)', type: 'number', required: true },
      { name: 'startDate', label: 'Start Date', labelAr: 'تاريخ البدء', type: 'date', required: true },
      { name: 'contractDuration', label: 'Contract Duration (months)', labelAr: 'مدة العقد (شهور)', type: 'number', required: true },
    ],
    templateContent: `EMPLOYMENT CONTRACT

This Employment Contract is entered into on {{startDate}} between:

EMPLOYER: {{employerName}}
Commercial Registration: {{employerCR}}

And

EMPLOYEE: {{employeeName}}
Civil ID: {{employeeID}}

1. POSITION AND DUTIES
The Employee is hired for the position of {{position}}.

2. COMPENSATION
The Employee shall receive a monthly salary of {{salary}} OMR.

3. CONTRACT DURATION
This contract is valid for {{contractDuration}} months from the start date.

4. WORKING HOURS
The Employee shall work according to Oman Labor Law.

5. TERMINATION
Either party may terminate this contract with 30 days written notice.

Signed:
Employer: _________________ Date: _________
Employee: _________________ Date: _________`,
    isActive: true,
  },
  {
    name: 'No Objection Certificate (NOC)',
    nameAr: 'شهادة عدم ممانعة',
    description: 'NOC for various purposes including visa, employment, and travel',
    descriptionAr: 'شهادة عدم ممانعة لأغراض مختلفة بما في ذلك التأشيرة والتوظيف والسفر',
    category: 'Certificates',
    categoryAr: 'الشهادات',
    fields: JSON.stringify([
      { name: 'companyName', label: 'Company Name', labelAr: 'اسم الشركة', type: 'text', required: true },
      { name: 'companyCR', label: 'CR Number', labelAr: 'رقم السجل التجاري', type: 'text', required: true },
      { name: 'employeeName', label: 'Employee Name', labelAr: 'اسم الموظف', type: 'text', required: true },
      { name: 'employeeID', label: 'Civil ID', labelAr: 'رقم البطاقة المدنية', type: 'text', required: true },
      { name: 'purpose', label: 'Purpose', labelAr: 'الغرض', type: 'select', options: ['Visa Application', 'Bank Loan', 'Travel', 'Other'], required: true },
      { name: 'issueDate', label: 'Issue Date', labelAr: 'تاريخ الإصدار', type: 'date', required: true },
    ]),
    content: `NO OBJECTION CERTIFICATE

Date: {{issueDate}}

TO WHOM IT MAY CONCERN

This is to certify that {{companyName}} (CR: {{companyCR}}) has no objection to {{employeeName}} (Civil ID: {{employeeID}}) for the purpose of {{purpose}}.

This certificate is issued upon the employee's request.

Company Stamp and Signature:
_______________________`,
    price: '10.000',
    isActive: true,
  },
  {
    name: 'Visa Application Letter',
    nameAr: 'خطاب طلب تأشيرة',
    description: 'Official letter for visa application purposes',
    descriptionAr: 'خطاب رسمي لأغراض طلب التأشيرة',
    category: 'Immigration',
    categoryAr: 'الهجرة',
    fields: JSON.stringify([
      { name: 'companyName', label: 'Company Name', labelAr: 'اسم الشركة', type: 'text', required: true },
      { name: 'companyCR', label: 'CR Number', labelAr: 'رقم السجل التجاري', type: 'text', required: true },
      { name: 'applicantName', label: 'Applicant Name', labelAr: 'اسم المتقدم', type: 'text', required: true },
      { name: 'passportNumber', label: 'Passport Number', labelAr: 'رقم جواز السفر', type: 'text', required: true },
      { name: 'nationality', label: 'Nationality', labelAr: 'الجنسية', type: 'text', required: true },
      { name: 'position', label: 'Position', labelAr: 'المسمى الوظيفي', type: 'text', required: true },
      { name: 'visaType', label: 'Visa Type', labelAr: 'نوع التأشيرة', type: 'select', options: ['Work Visa', 'Visit Visa', 'Family Visa'], required: true },
    ]),
    content: `VISA APPLICATION LETTER

To: Royal Oman Police
Immigration Department

Dear Sir/Madam,

{{companyName}} (CR: {{companyCR}}) hereby requests a {{visaType}} for:

Name: {{applicantName}}
Passport Number: {{passportNumber}}
Nationality: {{nationality}}
Position: {{position}}

We confirm that the applicant will be employed by our company and we take full responsibility for their stay in Oman.

Thank you for your consideration.

Company Stamp and Authorized Signature:
_______________________`,
    price: '12.000',
    isActive: true,
  },
  {
    name: 'Commercial Agreement',
    nameAr: 'اتفاقية تجارية',
    description: 'Standard commercial agreement between two parties',
    descriptionAr: 'اتفاقية تجارية قياسية بين طرفين',
    category: 'Commercial',
    categoryAr: 'التجارية',
    fields: JSON.stringify([
      { name: 'party1Name', label: 'First Party Name', labelAr: 'اسم الطرف الأول', type: 'text', required: true },
      { name: 'party1CR', label: 'First Party CR', labelAr: 'سجل الطرف الأول', type: 'text', required: true },
      { name: 'party2Name', label: 'Second Party Name', labelAr: 'اسم الطرف الثاني', type: 'text', required: true },
      { name: 'party2CR', label: 'Second Party CR', labelAr: 'سجل الطرف الثاني', type: 'text', required: true },
      { name: 'agreementPurpose', label: 'Agreement Purpose', labelAr: 'الغرض من الاتفاقية', type: 'textarea', required: true },
      { name: 'agreementValue', label: 'Agreement Value (OMR)', labelAr: 'قيمة الاتفاقية (ريال عماني)', type: 'number', required: true },
      { name: 'agreementDate', label: 'Agreement Date', labelAr: 'تاريخ الاتفاقية', type: 'date', required: true },
      { name: 'duration', label: 'Duration (months)', labelAr: 'المدة (شهور)', type: 'number', required: true },
    ]),
    content: `COMMERCIAL AGREEMENT

This Agreement is made on {{agreementDate}} between:

FIRST PARTY: {{party1Name}} (CR: {{party1CR}})
SECOND PARTY: {{party2Name}} (CR: {{party2CR}})

PURPOSE:
{{agreementPurpose}}

TERMS:
1. The total value of this agreement is {{agreementValue}} OMR.
2. This agreement is valid for {{duration}} months.
3. Both parties agree to fulfill their obligations as per Omani Commercial Law.

FIRST PARTY: _________________ Date: _________
SECOND PARTY: _________________ Date: _________`,
    price: '20.000',
    isActive: true,
  },
  {
    name: 'Salary Certificate',
    nameAr: 'شهادة راتب',
    description: 'Official salary certificate for employees',
    descriptionAr: 'شهادة راتب رسمية للموظفين',
    category: 'Employment',
    categoryAr: 'التوظيف',
    fields: JSON.stringify([
      { name: 'companyName', label: 'Company Name', labelAr: 'اسم الشركة', type: 'text', required: true },
      { name: 'companyCR', label: 'CR Number', labelAr: 'رقم السجل التجاري', type: 'text', required: true },
      { name: 'employeeName', label: 'Employee Name', labelAr: 'اسم الموظف', type: 'text', required: true },
      { name: 'employeeID', label: 'Civil ID', labelAr: 'رقم البطاقة المدنية', type: 'text', required: true },
      { name: 'position', label: 'Position', labelAr: 'المسمى الوظيفي', type: 'text', required: true },
      { name: 'basicSalary', label: 'Basic Salary (OMR)', labelAr: 'الراتب الأساسي', type: 'number', required: true },
      { name: 'allowances', label: 'Allowances (OMR)', labelAr: 'البدلات', type: 'number', required: false },
      { name: 'totalSalary', label: 'Total Salary (OMR)', labelAr: 'إجمالي الراتب', type: 'number', required: true },
      { name: 'issueDate', label: 'Issue Date', labelAr: 'تاريخ الإصدار', type: 'date', required: true },
    ]),
    content: `SALARY CERTIFICATE

Date: {{issueDate}}

TO WHOM IT MAY CONCERN

This is to certify that {{employeeName}} (Civil ID: {{employeeID}}) is employed with {{companyName}} (CR: {{companyCR}}) as {{position}}.

SALARY BREAKDOWN:
- Basic Salary: {{basicSalary}} OMR
- Allowances: {{allowances}} OMR
- Total Monthly Salary: {{totalSalary}} OMR

This certificate is issued upon the employee's request.

Company Stamp and Signature:
_______________________`,
    price: '8.000',
    isActive: true,
  },
];

async function seed() {
  console.log('Seeding document templates...');
  
  for (const template of templates) {
    await db.insert(documentTemplates).values(template);
    console.log(`✓ Added: ${template.name}`);
  }
  
  console.log('\n✅ Successfully seeded', templates.length, 'templates');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error seeding templates:', error);
  process.exit(1);
});
