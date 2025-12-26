-- Training Materials: Guidelines

INSERT INTO training_materials (title, title_ar, category, content, content_ar, order_index, is_active) VALUES
('Arabic Translation Fundamentals', 'أساسيات الترجمة العربية', 'guidelines', 
'# Arabic Translation Fundamentals

## 1. Right-to-Left (RTL) Text Direction
- Arabic text flows from right to left
- Ensure proper RTL formatting in all translations
- Numbers and English words within Arabic text maintain LTR direction
- Test translations in the actual UI to verify proper display

## 2. Formal vs. Informal Tone
- Use formal Arabic (الفصحى) for business and government services
- Avoid colloquial expressions unless specifically requested
- Maintain professional terminology throughout

## 3. Gender-Neutral Language
- When possible, use gender-neutral forms
- For user-facing content, default to masculine form (standard in formal Arabic)
- Be consistent within the same context

## 4. Terminology Consistency
- Always use the translation memory to maintain consistency
- Create glossaries for domain-specific terms
- Don''t translate brand names or technical terms unless localized versions exist

## 5. Punctuation and Spacing
- Use Arabic punctuation marks (،؛؟) not English ones
- Maintain proper spacing around punctuation
- No space before punctuation, one space after',
'# أساسيات الترجمة العربية

## 1. اتجاه النص من اليمين إلى اليسار
- النص العربي يتدفق من اليمين إلى اليسار
- تأكد من التنسيق الصحيح في جميع الترجمات
- الأرقام والكلمات الإنجليزية ضمن النص العربي تحافظ على اتجاه اليسار إلى اليمين
- اختبر الترجمات في الواجهة الفعلية للتحقق من العرض الصحيح

## 2. اللهجة الرسمية مقابل غير الرسمية
- استخدم اللغة العربية الفصحى للخدمات التجارية والحكومية
- تجنب التعبيرات العامية ما لم يُطلب ذلك صراحة
- حافظ على المصطلحات المهنية طوال النص

## 3. اللغة المحايدة جنسياً
- عند الإمكان، استخدم الصيغ المحايدة جنسياً
- للمحتوى الموجه للمستخدم، استخدم الصيغة المذكرة (المعيار في العربية الفصحى)
- كن متسقاً ضمن نفس السياق

## 4. اتساق المصطلحات
- استخدم دائماً ذاكرة الترجمة للحفاظ على الاتساق
- أنشئ مسارد للمصطلحات الخاصة بالمجال
- لا تترجم أسماء العلامات التجارية أو المصطلحات التقنية ما لم توجد نسخ محلية

## 5. علامات الترقيم والمسافات
- استخدم علامات الترقيم العربية (،؛؟) وليس الإنجليزية
- حافظ على المسافات الصحيحة حول علامات الترقيم
- لا مسافة قبل علامة الترقيم، مسافة واحدة بعدها',
1, TRUE);

INSERT INTO training_materials (title, title_ar, category, content, content_ar, order_index, is_active) VALUES
('Business Services Translation Guide', 'دليل ترجمة الخدمات التجارية', 'guidelines',
'# Business Services Translation Guide

## Key Terminology

### Common Business Terms
- **Office**: مكتب سند
- **Service**: خدمة
- **Booking**: حجز
- **Appointment**: موعد
- **Document**: وثيقة / مستند
- **Template**: نموذج
- **Registration**: تسجيل
- **License**: رخصة
- **Certificate**: شهادة

### Action Verbs
- **Browse**: تصفح
- **Search**: بحث
- **Book**: احجز
- **Submit**: إرسال / تقديم
- **Download**: تحميل
- **Upload**: رفع
- **Edit**: تعديل
- **Delete**: حذف
- **Cancel**: إلغاء

### Status Terms
- **Pending**: قيد الانتظار
- **Confirmed**: مؤكد
- **Completed**: مكتمل
- **Cancelled**: ملغى
- **Active**: نشط
- **Inactive**: غير نشط

## Translation Tips
1. Keep button text concise (1-2 words in Arabic)
2. Use imperative form for action buttons
3. Maintain consistency across similar services
4. Test translations in mobile view (Arabic text can be longer)',
'# دليل ترجمة الخدمات التجارية

## المصطلحات الرئيسية

### المصطلحات التجارية الشائعة
- **Office**: مكتب سند
- **Service**: خدمة
- **Booking**: حجز
- **Appointment**: موعد
- **Document**: وثيقة / مستند
- **Template**: نموذج
- **Registration**: تسجيل
- **License**: رخصة
- **Certificate**: شهادة

### أفعال الإجراءات
- **Browse**: تصفح
- **Search**: بحث
- **Book**: احجز
- **Submit**: إرسال / تقديم
- **Download**: تحميل
- **Upload**: رفع
- **Edit**: تعديل
- **Delete**: حذف
- **Cancel**: إلغاء

### مصطلحات الحالة
- **Pending**: قيد الانتظار
- **Confirmed**: مؤكد
- **Completed**: مكتمل
- **Cancelled**: ملغى
- **Active**: نشط
- **Inactive**: غير نشط

## نصائح الترجمة
1. اجعل نص الأزرار موجزاً (1-2 كلمة بالعربية)
2. استخدم صيغة الأمر لأزرار الإجراءات
3. حافظ على الاتساق عبر الخدمات المماثلة
4. اختبر الترجمات في عرض الهاتف المحمول (النص العربي قد يكون أطول)',
2, TRUE);

-- Training Materials: Common Mistakes

INSERT INTO training_materials (title, title_ar, category, content, content_ar, order_index, is_active) VALUES
('RTL Formatting Errors', 'أخطاء تنسيق النص من اليمين لليسار', 'common_mistakes',
'# RTL Formatting Errors

## ❌ Common Mistakes

### 1. Mixing English Punctuation
**Wrong**: مرحباً, كيف حالك?
**Correct**: مرحباً، كيف حالك؟

### 2. Incorrect Number Placement
**Wrong**: عدد المكاتب 25 مكتب
**Correct**: عدد المكاتب ٢٥ مكتباً

### 3. Improper Spacing
**Wrong**: الخدمة:متوفرة
**Correct**: الخدمة: متوفرة

### 4. English Parentheses Direction
**Wrong**: (النص هنا)
**Correct**: (النص هنا) - Ensure parentheses flip direction in RTL context

## ✅ How to Avoid
- Always preview translations in the actual UI
- Use Arabic keyboard for punctuation
- Test with real data, not Lorem Ipsum
- Check on both desktop and mobile devices',
'# أخطاء تنسيق النص من اليمين لليسار

## ❌ الأخطاء الشائعة

### 1. خلط علامات الترقيم الإنجليزية
**خطأ**: مرحباً, كيف حالك?
**صحيح**: مرحباً، كيف حالك؟

### 2. وضع الأرقام بشكل غير صحيح
**خطأ**: عدد المكاتب 25 مكتب
**صحيح**: عدد المكاتب ٢٥ مكتباً

### 3. المسافات غير الصحيحة
**خطأ**: الخدمة:متوفرة
**صحيح**: الخدمة: متوفرة

### 4. اتجاه الأقواس الإنجليزية
**خطأ**: (النص هنا)
**صحيح**: (النص هنا) - تأكد من قلب اتجاه الأقواس في سياق RTL

## ✅ كيفية التجنب
- عاين الترجمات دائماً في الواجهة الفعلية
- استخدم لوحة المفاتيح العربية لعلامات الترقيم
- اختبر ببيانات حقيقية، وليس Lorem Ipsum
- تحقق على أجهزة سطح المكتب والهاتف المحمول',
1, TRUE);

INSERT INTO training_materials (title, title_ar, category, content, content_ar, order_index, is_active) VALUES
('Tone and Formality Mistakes', 'أخطاء اللهجة والرسمية', 'common_mistakes',
'# Tone and Formality Mistakes

## ❌ Common Mistakes

### 1. Using Colloquial Language
**Wrong**: شلون نقدر نساعدك؟ (Gulf dialect)
**Correct**: كيف يمكننا مساعدتك؟ (Formal Arabic)

### 2. Inconsistent Addressing
**Wrong**: Mixing أنت (you singular) and حضرتك (formal you)
**Correct**: Choose one form and stick to it throughout

### 3. Overly Literal Translation
**Wrong**: "Browse offices" → تصفح المكاتب (too literal)
**Better**: استعرض المكاتب or ابحث عن مكاتب

### 4. Ignoring Cultural Context
**Wrong**: Direct translation of "ASAP" → في أقرب وقت ممكن (too wordy)
**Better**: عاجل or بأسرع وقت

## ✅ Best Practices
- Use Modern Standard Arabic (MSA) for all business content
- Maintain professional tone without being overly formal
- Consider the target audience (business owners, not general public)
- When in doubt, check similar government portals for reference',
'# أخطاء اللهجة والرسمية

## ❌ الأخطاء الشائعة

### 1. استخدام اللغة العامية
**خطأ**: شلون نقدر نساعدك؟ (لهجة خليجية)
**صحيح**: كيف يمكننا مساعدتك؟ (عربية فصحى)

### 2. مخاطبة غير متسقة
**خطأ**: خلط أنت (المفرد) وحضرتك (الرسمي)
**صحيح**: اختر صيغة واحدة والتزم بها طوال النص

### 3. الترجمة الحرفية المفرطة
**خطأ**: "Browse offices" → تصفح المكاتب (حرفي جداً)
**أفضل**: استعرض المكاتب أو ابحث عن مكاتب

### 4. تجاهل السياق الثقافي
**خطأ**: ترجمة مباشرة لـ "ASAP" → في أقرب وقت ممكن (طويل جداً)
**أفضل**: عاجل أو بأسرع وقت

## ✅ أفضل الممارسات
- استخدم اللغة العربية الفصحى الحديثة لجميع المحتوى التجاري
- حافظ على لهجة مهنية دون أن تكون رسمية بشكل مفرط
- ضع في اعتبارك الجمهور المستهدف (أصحاب الأعمال، وليس عامة الناس)
- عند الشك، تحقق من البوابات الحكومية المماثلة كمرجع',
2, TRUE);

-- Training Materials: Best Practices

INSERT INTO training_materials (title, title_ar, category, content, content_ar, order_index, is_active) VALUES
('Quality Assurance Checklist', 'قائمة التحقق من ضمان الجودة', 'best_practices',
'# Quality Assurance Checklist

## Before Submitting Translation

### ✅ Content Accuracy
- [ ] Meaning preserved from source text
- [ ] No information added or omitted
- [ ] Technical terms translated correctly
- [ ] Numbers and dates formatted properly

### ✅ Language Quality
- [ ] Grammar and spelling checked
- [ ] Formal Arabic (MSA) used throughout
- [ ] Consistent terminology
- [ ] Natural-sounding Arabic (not literal translation)

### ✅ Formatting
- [ ] RTL direction applied correctly
- [ ] Arabic punctuation used (،؛؟)
- [ ] Proper spacing around text
- [ ] Line breaks appropriate

### ✅ UI Context
- [ ] Translation fits in UI space
- [ ] Tested on mobile and desktop
- [ ] Buttons and links work correctly
- [ ] No text overflow or truncation

### ✅ Consistency
- [ ] Checked translation memory for similar phrases
- [ ] Terminology matches existing translations
- [ ] Tone consistent with platform style
- [ ] Reviewed previous translator''s work on same entity

## Pro Tips
1. Always use the translation memory suggestions
2. Preview in actual UI before submitting
3. Read the translation out loud to check naturalness
4. Get peer review for critical content',
'# قائمة التحقق من ضمان الجودة

## قبل تقديم الترجمة

### ✅ دقة المحتوى
- [ ] المعنى محفوظ من النص المصدر
- [ ] لم تتم إضافة أو حذف معلومات
- [ ] المصطلحات التقنية مترجمة بشكل صحيح
- [ ] الأرقام والتواريخ منسقة بشكل صحيح

### ✅ جودة اللغة
- [ ] تم التحقق من القواعد والإملاء
- [ ] استخدام اللغة العربية الفصحى طوال النص
- [ ] مصطلحات متسقة
- [ ] عربية طبيعية (وليست ترجمة حرفية)

### ✅ التنسيق
- [ ] اتجاه RTL مطبق بشكل صحيح
- [ ] علامات الترقيم العربية مستخدمة (،؛؟)
- [ ] مسافات صحيحة حول النص
- [ ] فواصل الأسطر مناسبة

### ✅ سياق الواجهة
- [ ] الترجمة تناسب مساحة الواجهة
- [ ] تم الاختبار على الهاتف المحمول وسطح المكتب
- [ ] الأزرار والروابط تعمل بشكل صحيح
- [ ] لا يوجد تجاوز أو اقتطاع للنص

### ✅ الاتساق
- [ ] تم التحقق من ذاكرة الترجمة للعبارات المماثلة
- [ ] المصطلحات تتطابق مع الترجمات الموجودة
- [ ] اللهجة متسقة مع أسلوب المنصة
- [ ] تمت مراجعة عمل المترجم السابق على نفس الكيان

## نصائح احترافية
1. استخدم دائماً اقتراحات ذاكرة الترجمة
2. عاين في الواجهة الفعلية قبل التقديم
3. اقرأ الترجمة بصوت عالٍ للتحقق من الطبيعية
4. احصل على مراجعة الأقران للمحتوى الحرج',
1, TRUE);
