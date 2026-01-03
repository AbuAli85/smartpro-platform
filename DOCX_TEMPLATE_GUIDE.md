# DOCX Template System - Complete User Guide

## 🎯 Overview

The SmartPro platform now includes a powerful **DOCX Template System** that allows you to:
- Upload professional .docx templates with placeholders
- Automatically generate forms from template placeholders
- Fill documents with user data and automatic Hijri date conversion
- Generate professional .docx files ready for download

---

## 📋 How It Works

### 1. **Admin Uploads Template** (One-time setup)
   - Create a professional document in Microsoft Word or Google Docs
   - Add placeholders using `{{placeholderName}}` format
   - Upload the .docx file to the platform

### 2. **System Extracts Placeholders** (Automatic)
   - Platform automatically reads all `{{placeholders}}` from your template
   - Detects field types (name, email, date, phone, etc.)
   - Generates a smart form for users

### 3. **Users Fill Form** (User-friendly)
   - Users see an automatically generated form
   - Smart validation based on field types
   - Date fields include Hijri calendar picker

### 4. **Document Generated** (Instant)
   - System replaces all placeholders with user data
   - Automatically adds Hijri dates for all date fields
   - Generates professional .docx file
   - User downloads ready-to-use document

---

## 🚀 Step-by-Step Guide

### **STEP 1: Create Your Template in Word**

1. Open Microsoft Word or Google Docs
2. Design your document with official formatting
3. Add placeholders where data should be inserted

**Example Template:**

```
SULTANATE OF OMAN
MINISTRY OF COMMERCE, INDUSTRY AND INVESTMENT PROMOTION

EMPLOYMENT CONTRACT

This contract is made on {{issueDate}} corresponding to {{issueDateHijri}}

Between:
Company Name: {{companyName}}
Commercial Registration: {{commercialRegistration}}

And:
Employee Name: {{employeeName}}
Civil ID: {{civilId}}
Nationality: {{nationality}}

Position: {{position}}
Salary: {{salary}} OMR per month
Start Date: {{startDate}}

Signed on: {{currentDate}} / {{currentDateHijri}}

_______________________          _______________________
Company Stamp                     Employee Signature
```

### **STEP 2: Upload Template to Platform**

1. **Login as Admin**
   - Go to `/admin/template-upload`

2. **Select Template**
   - Choose the document template from dropdown
   - (e.g., "Employment Contract", "NOC for Bank Account", etc.)

3. **Upload .DOCX File**
   - Click "Choose File"
   - Select your .docx template
   - Click "Upload Template"

4. **Verify Placeholders**
   - System will show all detected placeholders
   - Example: `{{employeeName}}`, `{{salary}}`, `{{issueDate}}`
   - Verify all placeholders are detected correctly

### **STEP 3: Users Generate Documents**

1. **Browse Templates**
   - Users go to `/templates`
   - Select desired template

2. **Fill Automatic Form**
   - System generates form based on placeholders
   - Smart field detection:
     - **Name fields** → Text input
     - **Email fields** → Email validation
     - **Phone fields** → Phone format validation
     - **Date fields** → Calendar picker with Hijri conversion
     - **Salary/Amount** → Number input
     - **Address/Description** → Textarea

3. **Generate Document**
   - Click "Generate Document"
   - System processes in seconds
   - Download button appears

4. **Download .DOCX File**
   - Click download button
   - Professional document ready to use
   - All placeholders filled
   - Hijri dates automatically included

---

## 🎨 Placeholder Naming Conventions

### **Smart Field Detection**

The system automatically detects field types based on placeholder names:

| Placeholder Pattern | Detected Type | Example |
|-------------------|---------------|---------|
| `{{...email...}}` | Email | `{{employeeEmail}}` |
| `{{...phone...}}` | Phone | `{{phoneNumber}}` |
| `{{...date...}}` | Date | `{{issueDate}}` |
| `{{...name...}}` | Text | `{{employeeName}}` |
| `{{...salary...}}` | Number | `{{monthlySalary}}` |
| `{{...amount...}}` | Number | `{{totalAmount}}` |
| `{{...address...}}` | Textarea | `{{companyAddress}}` |
| `{{...description...}}` | Textarea | `{{jobDescription}}` |

### **Recommended Placeholders for Omani Documents**

#### **Personal Information**
- `{{employeeName}}` - Full name in English
- `{{employeeNameAr}}` - Full name in Arabic
- `{{civilId}}` - Civil ID number
- `{{passportNumber}}` - Passport number
- `{{nationality}}` - Nationality
- `{{dateOfBirth}}` - Date of birth

#### **Company Information**
- `{{companyName}}` - Company name in English
- `{{companyNameAr}}` - Company name in Arabic
- `{{commercialRegistration}}` - CR number
- `{{taxRegistration}}` - Tax registration number
- `{{companyAddress}}` - Company address
- `{{companyPhone}}` - Company phone
- `{{companyEmail}}` - Company email

#### **Employment Details**
- `{{position}}` - Job position
- `{{positionAr}}` - Job position in Arabic
- `{{department}}` - Department name
- `{{salary}}` - Monthly salary
- `{{startDate}}` - Employment start date
- `{{joiningDate}}` - Joining date

#### **Dates (Auto Hijri Conversion)**
- `{{issueDate}}` - Document issue date
- `{{currentDate}}` - Current date
- `{{expiryDate}}` - Expiry date
- `{{startDate}}` - Start date

**Note:** For any date field, the system automatically provides:
- `{{dateField}}` - Gregorian date (English)
- `{{dateFieldHijri}}` - Hijri date (Arabic)
- `{{dateFieldCombined}}` - Both formats combined

#### **Document References**
- `{{referenceNumber}}` - Reference number
- `{{documentNumber}}` - Document number
- `{{certificateNumber}}` - Certificate number

---

## 🌙 Automatic Hijri Date Conversion

### **How It Works**

When a user selects a date in the form:
1. System automatically calculates the Hijri equivalent
2. Provides multiple format options:
   - **Gregorian English**: "December 28, 2024"
   - **Gregorian Arabic**: "٢٨ ديسمبر ٢٠٢٤"
   - **Hijri Arabic**: "٢٦ جمادى الآخرة ١٤٤٦ هـ"
   - **Hijri English**: "26 Jumada al-Thani 1446 AH"
   - **Combined**: "December 28, 2024 / ٢٦ جمادى الآخرة ١٤٤٦ هـ"

### **Available in Template**

For any date placeholder like `{{issueDate}}`, you can use:
- `{{issueDate}}` - Gregorian (English)
- `{{issueDateArabic}}` - Gregorian (Arabic)
- `{{issueDateHijri}}` - Hijri (Arabic)
- `{{issueDateHijriEnglish}}` - Hijri (English)
- `{{issueDateCombined}}` - Both formats

### **Current Date Auto-Insertion**

If you don't provide a date field, the system automatically adds:
- `{{currentDate}}` - Today's date (Gregorian)
- `{{currentDateHijri}}` - Today's date (Hijri)
- `{{currentDateCombined}}` - Both formats

---

## 📝 Example Templates

### **1. Employment Contract**

```docx
EMPLOYMENT CONTRACT

Date: {{currentDateCombined}}
Reference: {{referenceNumber}}

BETWEEN:
Company: {{companyName}} ({{companyNameAr}})
CR: {{commercialRegistration}}

AND:
Employee: {{employeeName}} ({{employeeNameAr}})
Civil ID: {{civilId}}

TERMS:
Position: {{position}}
Salary: {{salary}} OMR/month
Start Date: {{startDateCombined}}
```

### **2. No Objection Certificate (NOC)**

```docx
NO OBJECTION CERTIFICATE

Date: {{issueDateCombined}}
Reference: {{referenceNumber}}

To Whom It May Concern,

This is to certify that we have no objection for:
Name: {{employeeName}}
Civil ID: {{civilId}}
Position: {{position}}

Purpose: {{purpose}}

Valid until: {{expiryDateCombined}}

Company Stamp & Signature
{{companyName}}
```

### **3. Salary Certificate**

```docx
SALARY CERTIFICATE

Date: {{currentDateCombined}}
Reference: {{certificateNumber}}

TO WHOM IT MAY CONCERN

This is to certify that:
Name: {{employeeName}}
Civil ID: {{civilId}}
Position: {{position}}
Department: {{department}}

Has been employed with us since {{joiningDateCombined}}
Current monthly salary: {{salary}} OMR

This certificate is issued upon employee's request.

{{companyName}}
HR Department
```

---

## 🔧 Technical Details

### **Supported File Formats**
- **Upload**: .docx only
- **Generate**: .docx (editable)
- **Max file size**: 10MB

### **Placeholder Format**
- Use double curly braces: `{{placeholderName}}`
- Case-sensitive
- No spaces inside braces
- Use camelCase: `{{employeeName}}` not `{{employee name}}`

### **Field Validation**
- **Email**: RFC 5322 compliant
- **Phone**: Oman format (+968 XXXX XXXX)
- **Required fields**: Marked with red asterisk
- **Optional fields**: Can be left empty

### **Storage**
- Templates stored in S3
- Generated documents stored in S3
- Automatic cleanup of temporary files
- Secure access with signed URLs

---

## 🎯 Best Practices

### **For Template Creators**

1. **Use Clear Placeholder Names**
   - ✅ `{{employeeName}}` 
   - ❌ `{{name1}}`

2. **Include Both Languages**
   - `{{companyName}}` for English
   - `{{companyNameAr}}` for Arabic

3. **Use Date Combinations**
   - `{{issueDateCombined}}` includes both Gregorian and Hijri

4. **Add Official Headers**
   - Include ministry/authority logos
   - Add official stamps sections
   - Include reference number fields

5. **Test Before Upload**
   - Verify all placeholders are correct
   - Check formatting in Word
   - Ensure Arabic text displays correctly

### **For Users**

1. **Fill All Required Fields**
   - Look for red asterisk (*)
   - System will validate before generation

2. **Use Correct Formats**
   - Phone: +968 9123 4567
   - Email: name@domain.com
   - Numbers: Use digits only

3. **Review Before Download**
   - Check all information is correct
   - Verify dates are accurate

4. **Save Generated Documents**
   - Download immediately
   - Documents are stored but download link is easiest

---

## 🚨 Troubleshooting

### **Upload Issues**

**Problem**: "Invalid .docx file format"
- **Solution**: Ensure file is saved as .docx (not .doc or .pdf)
- Save as: "Word Document (.docx)"

**Problem**: "File too large"
- **Solution**: Compress images in document
- Remove unnecessary formatting
- Max size: 10MB

### **Placeholder Issues**

**Problem**: Placeholders not detected
- **Solution**: Check format: `{{name}}` not `{name}` or `{{name }}`
- No spaces inside braces
- Use only letters, numbers, underscores

**Problem**: Date fields not showing Hijri
- **Solution**: Ensure placeholder contains "date" in name
- Example: `{{issueDate}}` not `{{issue}}`

### **Generation Issues**

**Problem**: "Template does not have a DOCX file uploaded"
- **Solution**: Admin must upload .docx file first
- Go to `/admin/template-upload`

**Problem**: "Missing required fields"
- **Solution**: Fill all fields marked with *
- Check validation errors in red

---

## 📞 Support

For technical support or questions:
- Platform: SmartPro Business Services
- Email: support@smartpro.om
- Admin Panel: `/admin/template-upload`

---

## 🎉 Summary

The DOCX Template System provides:
- ✅ Professional document generation
- ✅ Automatic form creation
- ✅ Smart field detection
- ✅ Hijri date auto-conversion
- ✅ Omani government format compliance
- ✅ Easy template management
- ✅ Instant document generation

**Ready to use your existing templates!**

Upload your .docx files and start generating professional documents instantly.
