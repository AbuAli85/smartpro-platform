import { drizzle } from "drizzle-orm/mysql2";
import { trainingMaterials, trainingQuizzes, quizQuestions, quizOptions } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seedTrainingContent() {
  console.log("🌱 Seeding training content...");

  // ============================================================================
  // GUIDELINES
  // ============================================================================
  
  const guidelines = [
    {
      title: "Arabic Translation Fundamentals",
      titleAr: "أساسيات الترجمة العربية",
      category: "guidelines",
      content: `# Arabic Translation Fundamentals

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
- Don't translate brand names or technical terms unless localized versions exist

## 5. Punctuation and Spacing
- Use Arabic punctuation marks (،؛؟) not English ones
- Maintain proper spacing around punctuation
- No space before punctuation, one space after`,
      contentAr: `# أساسيات الترجمة العربية

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
- لا مسافة قبل علامة الترقيم، مسافة واحدة بعدها`,
      orderIndex: 1,
    },
    {
      title: "Business Services Translation Guide",
      titleAr: "دليل ترجمة الخدمات التجارية",
      category: "guidelines",
      content: `# Business Services Translation Guide

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
4. Test translations in mobile view (Arabic text can be longer)`,
      contentAr: `# دليل ترجمة الخدمات التجارية

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
4. اختبر الترجمات في عرض الهاتف المحمول (النص العربي قد يكون أطول)`,
      orderIndex: 2,
    },
  ];

  // ============================================================================
  // COMMON MISTAKES
  // ============================================================================
  
  const commonMistakes = [
    {
      title: "RTL Formatting Errors",
      titleAr: "أخطاء تنسيق النص من اليمين لليسار",
      category: "common_mistakes",
      content: `# RTL Formatting Errors

## ❌ Common Mistakes

### 1. Mixing English Punctuation
**Wrong**: مرحباً, كيف حالك?
**Correct**: مرحباً، كيف حالك؟

### 2. Incorrect Number Placement
**Wrong**: عدد المكاتب 25 مكتب
**Correct**: عدد المكاتب ٢٥ مكتباً
(Use Arabic-Indic numerals when appropriate, or maintain LTR for Western numerals)

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
- Check on both desktop and mobile devices`,
      contentAr: `# أخطاء تنسيق النص من اليمين لليسار

## ❌ الأخطاء الشائعة

### 1. خلط علامات الترقيم الإنجليزية
**خطأ**: مرحباً, كيف حالك?
**صحيح**: مرحباً، كيف حالك؟

### 2. وضع الأرقام بشكل غير صحيح
**خطأ**: عدد المكاتب 25 مكتب
**صحيح**: عدد المكاتب ٢٥ مكتباً
(استخدم الأرقام العربية الهندية عند الاقتضاء، أو احتفظ باتجاه اليسار لليمين للأرقام الغربية)

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
- تحقق على أجهزة سطح المكتب والهاتف المحمول`,
      orderIndex: 1,
    },
    {
      title: "Tone and Formality Mistakes",
      titleAr: "أخطاء اللهجة والرسمية",
      category: "common_mistakes",
      content: `# Tone and Formality Mistakes

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
- When in doubt, check similar government portals for reference`,
      contentAr: `# أخطاء اللهجة والرسمية

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
- عند الشك، تحقق من البوابات الحكومية المماثلة كمرجع`,
      orderIndex: 2,
    },
  ];

  // ============================================================================
  // BEST PRACTICES
  // ============================================================================
  
  const bestPractices = [
    {
      title: "Quality Assurance Checklist",
      titleAr: "قائمة التحقق من ضمان الجودة",
      category: "best_practices",
      content: `# Quality Assurance Checklist

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
- [ ] Reviewed previous translator's work on same entity

## Pro Tips
1. Always use the translation memory suggestions
2. Preview in actual UI before submitting
3. Read the translation out loud to check naturalness
4. Get peer review for critical content`,
      contentAr: `# قائمة التحقق من ضمان الجودة

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
4. احصل على مراجعة الأقران للمحتوى الحرج`,
      orderIndex: 1,
    },
  ];

  // Insert all materials
  console.log("📝 Inserting training materials...");
  for (const material of [...guidelines, ...commonMistakes, ...bestPractices]) {
    await db.insert(trainingMaterials).values(material);
  }
  console.log(`✅ Inserted ${guidelines.length + commonMistakes.length + bestPractices.length} training materials`);

  // ============================================================================
  // QUIZZES
  // ============================================================================
  
  console.log("📝 Creating quizzes...");

  // Quiz 1: Translation Fundamentals
  const [quiz1] = await db.insert(trainingQuizzes).values({
    title: "Translation Fundamentals",
    titleAr: "أساسيات الترجمة",
    description: "Test your knowledge of Arabic translation basics",
    descriptionAr: "اختبر معرفتك بأساسيات الترجمة العربية",
    passingScore: 70,
  });

  const quiz1Questions = [
    {
      question: "What is the correct Arabic punctuation mark for a comma?",
      questionAr: "ما هي علامة الترقيم العربية الصحيحة للفاصلة؟",
      correctAnswer: "،",
      explanation: "Arabic uses ، (Arabic comma) instead of , (English comma)",
      explanationAr: "العربية تستخدم ، (الفاصلة العربية) بدلاً من , (الفاصلة الإنجليزية)",
      options: [
        { text: ",", textAr: ",", correct: false },
        { text: "،", textAr: "،", correct: true },
        { text: ";", textAr: ";", correct: false },
        { text: "؛", textAr: "؛", correct: false },
      ],
    },
    {
      question: "Which tone should be used for business services translation?",
      questionAr: "ما اللهجة التي يجب استخدامها لترجمة الخدمات التجارية؟",
      correctAnswer: "Formal Arabic (MSA)",
      explanation: "Business and government services require Modern Standard Arabic (الفصحى)",
      explanationAr: "الخدمات التجارية والحكومية تتطلب اللغة العربية الفصحى الحديثة",
      options: [
        { text: "Colloquial dialect", textAr: "لهجة عامية", correct: false },
        { text: "Formal Arabic (MSA)", textAr: "عربية فصحى", correct: true },
        { text: "Mixed formal and informal", textAr: "مزيج رسمي وغير رسمي", correct: false },
        { text: "Classical Arabic", textAr: "عربية كلاسيكية", correct: false },
      ],
    },
    {
      question: "What is the correct translation for 'Browse offices'?",
      questionAr: "ما هي الترجمة الصحيحة لـ 'Browse offices'؟",
      correctAnswer: "استعرض المكاتب",
      explanation: "استعرض is more natural than the literal تصفح for this context",
      explanationAr: "استعرض أكثر طبيعية من الحرفي تصفح في هذا السياق",
      options: [
        { text: "تصفح المكاتب", textAr: "تصفح المكاتب", correct: false },
        { text: "استعرض المكاتب", textAr: "استعرض المكاتب", correct: true },
        { text: "شاهد المكاتب", textAr: "شاهد المكاتب", correct: false },
        { text: "ابحث المكاتب", textAr: "ابحث المكاتب", correct: false },
      ],
    },
  ];

  for (let i = 0; i < quiz1Questions.length; i++) {
    const q = quiz1Questions[i];
    const [question] = await db.insert(quizQuestions).values({
      quizId: quiz1.insertId,
      question: q.question,
      questionAr: q.questionAr,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      explanationAr: q.explanationAr,
      orderIndex: i,
    });

    for (let j = 0; j < q.options.length; j++) {
      const opt = q.options[j];
      await db.insert(quizOptions).values({
        questionId: question.insertId,
        optionText: opt.text,
        optionTextAr: opt.textAr,
        isCorrect: opt.correct,
        orderIndex: j,
      });
    }
  }

  console.log("✅ Created Quiz 1: Translation Fundamentals");

  // Quiz 2: RTL Formatting
  const [quiz2] = await db.insert(trainingQuizzes).values({
    title: "RTL Formatting Mastery",
    titleAr: "إتقان تنسيق RTL",
    description: "Master right-to-left text formatting",
    descriptionAr: "أتقن تنسيق النص من اليمين إلى اليسار",
    passingScore: 75,
  });

  const quiz2Questions = [
    {
      question: "Which is the correct way to write a question in Arabic?",
      questionAr: "ما هي الطريقة الصحيحة لكتابة سؤال بالعربية؟",
      correctAnswer: "كيف حالك؟",
      explanation: "Use Arabic question mark ؟ not English ?",
      explanationAr: "استخدم علامة الاستفهام العربية ؟ وليس الإنجليزية ?",
      options: [
        { text: "كيف حالك?", textAr: "كيف حالك?", correct: false },
        { text: "كيف حالك؟", textAr: "كيف حالك؟", correct: true },
        { text: "كيف حالك ?", textAr: "كيف حالك ?", correct: false },
        { text: "كيف حالك ؟", textAr: "كيف حالك ؟", correct: false },
      ],
    },
    {
      question: "Where should you test your translations?",
      questionAr: "أين يجب أن تختبر ترجماتك؟",
      correctAnswer: "In the actual UI on multiple devices",
      explanation: "Always preview translations in the real interface to catch formatting issues",
      explanationAr: "عاين الترجمات دائماً في الواجهة الحقيقية لاكتشاف مشاكل التنسيق",
      options: [
        { text: "In a text editor only", textAr: "في محرر نصوص فقط", correct: false },
        { text: "In the actual UI on multiple devices", textAr: "في الواجهة الفعلية على أجهزة متعددة", correct: true },
        { text: "No testing needed", textAr: "لا حاجة للاختبار", correct: false },
        { text: "Only on desktop", textAr: "على سطح المكتب فقط", correct: false },
      ],
    },
  ];

  for (let i = 0; i < quiz2Questions.length; i++) {
    const q = quiz2Questions[i];
    const [question] = await db.insert(quizQuestions).values({
      quizId: quiz2.insertId,
      question: q.question,
      questionAr: q.questionAr,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      explanationAr: q.explanationAr,
      orderIndex: i,
    });

    for (let j = 0; j < q.options.length; j++) {
      const opt = q.options[j];
      await db.insert(quizOptions).values({
        questionId: question.insertId,
        optionText: opt.text,
        optionTextAr: opt.textAr,
        isCorrect: opt.correct,
        orderIndex: j,
      });
    }
  }

  console.log("✅ Created Quiz 2: RTL Formatting Mastery");

  // Quiz 3: Business Terminology
  const [quiz3] = await db.insert(trainingQuizzes).values({
    title: "Business Terminology Quiz",
    titleAr: "اختبار المصطلحات التجارية",
    description: "Test your knowledge of business service terminology",
    descriptionAr: "اختبر معرفتك بمصطلحات الخدمات التجارية",
    passingScore: 70,
  });

  const quiz3Questions = [
    {
      question: "What is the correct translation for 'Booking'?",
      questionAr: "ما هي الترجمة الصحيحة لـ 'Booking'؟",
      correctAnswer: "حجز",
      explanation: "حجز is the standard term for booking in business context",
      explanationAr: "حجز هو المصطلح القياسي للحجز في السياق التجاري",
      options: [
        { text: "موعد", textAr: "موعد", correct: false },
        { text: "حجز", textAr: "حجز", correct: true },
        { text: "طلب", textAr: "طلب", correct: false },
        { text: "تسجيل", textAr: "تسجيل", correct: false },
      ],
    },
    {
      question: "What status term means 'Pending'?",
      questionAr: "ما مصطلح الحالة الذي يعني 'Pending'؟",
      correctAnswer: "قيد الانتظار",
      explanation: "قيد الانتظار is the formal term for pending status",
      explanationAr: "قيد الانتظار هو المصطلح الرسمي لحالة الانتظار",
      options: [
        { text: "منتظر", textAr: "منتظر", correct: false },
        { text: "قيد الانتظار", textAr: "قيد الانتظار", correct: true },
        { text: "غير مكتمل", textAr: "غير مكتمل", correct: false },
        { text: "تحت المراجعة", textAr: "تحت المراجعة", correct: false },
      ],
    },
    {
      question: "How should button text be formatted in Arabic?",
      questionAr: "كيف يجب تنسيق نص الأزرار بالعربية؟",
      correctAnswer: "Concise, 1-2 words, imperative form",
      explanation: "Button text should be brief and use command form (e.g., احجز not الحجز)",
      explanationAr: "يجب أن يكون نص الزر موجزاً ويستخدم صيغة الأمر (مثل احجز وليس الحجز)",
      options: [
        { text: "Long descriptive sentences", textAr: "جمل وصفية طويلة", correct: false },
        { text: "Concise, 1-2 words, imperative form", textAr: "موجز، 1-2 كلمة، صيغة الأمر", correct: true },
        { text: "Full formal phrases", textAr: "عبارات رسمية كاملة", correct: false },
        { text: "English text only", textAr: "نص إنجليزي فقط", correct: false },
      ],
    },
  ];

  for (let i = 0; i < quiz3Questions.length; i++) {
    const q = quiz3Questions[i];
    const [question] = await db.insert(quizQuestions).values({
      quizId: quiz3.insertId,
      question: q.question,
      questionAr: q.questionAr,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      explanationAr: q.explanationAr,
      orderIndex: i,
    });

    for (let j = 0; j < q.options.length; j++) {
      const opt = q.options[j];
      await db.insert(quizOptions).values({
        questionId: question.insertId,
        optionText: opt.text,
        optionTextAr: opt.textAr,
        isCorrect: opt.correct,
        orderIndex: j,
      });
    }
  }

  console.log("✅ Created Quiz 3: Business Terminology Quiz");

  console.log("\n🎉 Training content seeding complete!");
  console.log(`   - ${guidelines.length} guidelines`);
  console.log(`   - ${commonMistakes.length} common mistakes`);
  console.log(`   - ${bestPractices.length} best practices`);
  console.log(`   - 3 quizzes with ${quiz1Questions.length + quiz2Questions.length + quiz3Questions.length} total questions`);
}

seedTrainingContent()
  .then(() => {
    console.log("\n✅ Seed completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  });
