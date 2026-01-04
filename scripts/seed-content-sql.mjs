import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🌱 Seeding database with Omani content...\n');

try {
  // Check and seed governorates
  console.log('📍 Adding Omani governorates...');
  const [govRows] = await connection.query('SELECT COUNT(*) as count FROM governorates');
  
  if (govRows[0].count > 0) {
    console.log('  ⚠️  Governorates already exist, skipping...');
  } else {
    await connection.query(`
      INSERT INTO governorates (name, name_ar, slug, region, capital_city, capital_city_ar, area, coordinates, population, population_year, wilayats, key_industries, key_industries_ar, economic_sectors, total_businesses, sme_count, overview, overview_ar, economic_profile, economic_profile_ar, business_opportunities, business_opportunities_ar, investment_zones, investment_zones_ar, registered_offices_count, top_service_categories, average_service_price, featured, display_order, status)
      VALUES
      ('Muscat', 'مسقط', 'muscat', 'coastal', 'Muscat', 'مسقط', 3500.00, '{"lat":23.588,"lng":58.3829}', 1560000, 2023, '[{"name":"Muscat","name_ar":"مسقط"},{"name":"Muttrah","name_ar":"مطرح"},{"name":"Bawshar","name_ar":"بوشر"},{"name":"As-Seeb","name_ar":"السيب"},{"name":"Al-Amerat","name_ar":"العامرات"},{"name":"Qurayyat","name_ar":"قريات"}]', '["Financial Services","Tourism","Logistics","Technology","Government Services"]', '["الخدمات المالية","السياحة","اللوجستيات","التكنولوجيا","الخدمات الحكومية"]', '{"services":75,"industrial":15,"agricultural":10}', 45000, 38000, 'Muscat is the capital and largest city of Oman, serving as the political, economic, and cultural center of the country. The governorate is home to major government institutions, international businesses, and a thriving SME ecosystem.', 'مسقط هي عاصمة سلطنة عمان وأكبر مدنها، وتعتبر المركز السياسي والاقتصادي والثقافي للبلاد. تضم المحافظة المؤسسات الحكومية الرئيسية والشركات الدولية ونظام بيئي مزدهر للمشاريع الصغيرة والمتوسطة.', 'Muscat drives Oman\\'s economy with its concentration of financial institutions, government services, and international trade. The governorate is a hub for innovation and entrepreneurship, with growing sectors in technology, tourism, and logistics.', 'تقود مسقط اقتصاد عمان بتركيزها على المؤسسات المالية والخدمات الحكومية والتجارة الدولية. المحافظة مركز للابتكار وريادة الأعمال، مع قطاعات متنامية في التكنولوجيا والسياحة واللوجستيات.', '["Technology startups","Tourism services","Professional consulting","E-commerce","Food & beverage"]', '["الشركات الناشئة في التكنولوجيا","خدمات السياحة","الاستشارات المهنية","التجارة الإلكترونية","الأغذية والمشروبات"]', '[{"name":"Knowledge Oasis Muscat","name_ar":"واحة المعرفة مسقط","type":"Technology Park"},{"name":"Rusayl Industrial Estate","name_ar":"المنطقة الصناعية الرسيل","type":"Industrial"}]', '[{"name":"واحة المعرفة مسقط","type":"حديقة تكنولوجية"},{"name":"المنطقة الصناعية الرسيل","type":"صناعية"}]', 850, '["Business Registration","Legal Services","Accounting","Marketing"]', 150.00, 1, 1, 'active'),
      ('Dhofar', 'ظفار', 'dhofar', 'south', 'Salalah', 'صلالة', 99300.00, '{"lat":17.015,"lng":54.0924}', 460000, 2023, '[{"name":"Salalah","name_ar":"صلالة"},{"name":"Taqah","name_ar":"طاقة"},{"name":"Mirbat","name_ar":"مرباط"},{"name":"Sadah","name_ar":"سدح"},{"name":"Rakhyut","name_ar":"رخيوت"}]', '["Tourism","Agriculture","Fisheries","Logistics","Frankincense Trade"]', '["السياحة","الزراعة","الأسماك","اللوجستيات","تجارة اللبان"]', '{"services":50,"industrial":25,"agricultural":25}', 12000, 10500, 'Dhofar is Oman\\'s southern jewel, famous for its unique Khareef monsoon season and lush landscapes. The governorate is a major tourism destination and agricultural hub, with significant potential for sustainable business development.', 'ظفار هي جوهرة عمان الجنوبية، المشهورة بموسم الخريف الفريد ومناظرها الطبيعية الخضراء. المحافظة وجهة سياحية رئيسية ومركز زراعي، مع إمكانات كبيرة للتنمية التجارية المستدامة.', 'Dhofar\\'s economy is driven by tourism, particularly during the Khareef season, agriculture including coconut and banana plantations, and the Port of Salalah, one of the region\\'s largest transshipment hubs.', 'يقود اقتصاد ظفار السياحة، خاصة خلال موسم الخريف، والزراعة بما في ذلك مزارع جوز الهند والموز، وميناء صلالة، أحد أكبر مراكز الشحن في المنطقة.', '["Eco-tourism","Agricultural products","Handicrafts","Hospitality services","Logistics support"]', '["السياحة البيئية","المنتجات الزراعية","الحرف اليدوية","خدمات الضيافة","دعم اللوجستيات"]', '[{"name":"Salalah Free Zone","name_ar":"المنطقة الحرة بصلالة","type":"Free Zone"},{"name":"Salalah Tourism Zone","name_ar":"منطقة صلالة السياحية","type":"Tourism"}]', '[{"name":"المنطقة الحرة بصلالة","type":"منطقة حرة"},{"name":"منطقة صلالة السياحية","type":"سياحية"}]', 320, '["Tourism Services","Agricultural Consulting","Trade Services"]', 120.00, 1, 2, 'active'),
      ('Al Batinah North', 'شمال الباطنة', 'al-batinah-north', 'coastal', 'Sohar', 'صحار', 12500.00, '{"lat":24.3474,"lng":56.7094}', 730000, 2023, '[{"name":"Sohar","name_ar":"صحار"},{"name":"Shinas","name_ar":"شناص"},{"name":"Liwa","name_ar":"لوى"},{"name":"Saham","name_ar":"صحم"},{"name":"Al Khaboura","name_ar":"الخابورة"},{"name":"As Suwaiq","name_ar":"السويق"}]', '["Heavy Industry","Petrochemicals","Mining","Fisheries","Agriculture"]', '["الصناعات الثقيلة","البتروكيماويات","التعدين","الأسماك","الزراعة"]', '{"services":35,"industrial":50,"agricultural":15}', 18000, 15000, 'Al Batinah North is Oman\\'s industrial powerhouse, home to the Sohar Industrial Port and major petrochemical facilities. The governorate combines heavy industry with traditional agriculture and fishing.', 'شمال الباطنة هي القوة الصناعية لعمان، موطن ميناء صحار الصناعي والمنشآت البتروكيماوية الكبرى. تجمع المحافظة بين الصناعة الثقيلة والزراعة التقليدية والصيد.', 'The governorate hosts major industrial projects including aluminum smelting, petrochemicals, and port operations. SMEs thrive in supporting industries, agriculture, and services.', 'تستضيف المحافظة مشاريع صناعية كبرى بما في ذلك صهر الألومنيوم والبتروكيماويات وعمليات الموانئ. تزدهر المشاريع الصغيرة والمتوسطة في الصناعات الداعمة والزراعة والخدمات.', '["Industrial support services","Logistics","Agricultural exports","Marine services","Construction"]', '["خدمات الدعم الصناعي","اللوجستيات","الصادرات الزراعية","الخدمات البحرية","البناء"]', '[{"name":"Sohar Industrial Port","name_ar":"ميناء صحار الصناعي","type":"Industrial Port"},{"name":"Sohar Free Zone","name_ar":"المنطقة الحرة بصحار","type":"Free Zone"}]', '[{"name":"ميناء صحار الصناعي","type":"ميناء صناعي"},{"name":"المنطقة الحرة بصحار","type":"منطقة حرة"}]', 450, '["Industrial Services","Logistics","Construction","Business Support"]', 135.00, 1, 3, 'active')
    `);
    console.log('  ✓ Added 3 governorates');
  }

  // Check and seed success stories
  console.log('\n📖 Adding Omani success stories...');
  const [storyRows] = await connection.query('SELECT COUNT(*) as count FROM success_stories');
  
  if (storyRows[0].count > 0) {
    console.log('  ⚠️  Success stories already exist, skipping...');
  } else {
    await connection.query(`
      INSERT INTO success_stories (business_name, business_name_ar, owner_name, owner_name_ar, governorate, wilayat, industry, service_type, year_established, challenge, challenge_ar, solution, solution_ar, results, results_ar, testimonial, testimonial_ar, jobs_created, revenue_growth, customers_served, smartpro_services_used, smartpro_impact, smartpro_impact_ar, featured, display_order, status, published_at)
      VALUES
      ('Omani Coffee House', 'بيت القهوة العماني', 'Ahmed Al Balushi', 'أحمد البلوشي', 'Muscat', 'Muttrah', 'Food & Beverage', 'Café & Restaurant', 2020, 'Ahmed wanted to open a traditional Omani coffee house but faced challenges with business registration, obtaining health permits, and understanding tax obligations. The complex regulatory requirements seemed overwhelming for a first-time entrepreneur.', 'أراد أحمد فتح مقهى عماني تقليدي لكنه واجه تحديات في تسجيل الأعمال والحصول على تصاريح صحية وفهم الالتزامات الضريبية. بدت المتطلبات التنظيمية المعقدة ساحقة لرائد أعمال لأول مرة.', 'Through SmartPro, Ahmed connected with a licensed business consultant who guided him through the entire registration process. The consultant helped him prepare all required documents, navigate MOCIIP requirements, and set up proper accounting systems.', 'من خلال سمارت برو، تواصل أحمد مع مستشار أعمال مرخص أرشده خلال عملية التسجيل بأكملها. ساعده المستشار في إعداد جميع المستندات المطلوبة والتنقل في متطلبات وزارة التجارة والصناعة وإنشاء أنظمة محاسبية مناسبة.', 'Ahmed successfully opened his coffee house within 3 months. The business now employs 12 people and has become a popular destination for both locals and tourists. Monthly revenue has grown by 200% in the first year.', 'نجح أحمد في فتح مقهاه خلال 3 أشهر. يوظف العمل الآن 12 شخصًا وأصبح وجهة شعبية للسكان المحليين والسياح. نمت الإيرادات الشهرية بنسبة 200٪ في السنة الأولى.', 'SmartPro made my dream possible. Without their help, I would still be struggling with paperwork. Now I focus on serving the best Omani coffee in Muscat!', 'سمارت برو جعل حلمي ممكنًا. بدون مساعدتهم، كنت سأظل أعاني مع الأوراق. الآن أركز على تقديم أفضل قهوة عمانية في مسقط!', 12, '200%', 5000, '["Business Registration","Legal Consulting","Accounting Setup"]', 'SmartPro reduced the business setup time from an estimated 6-8 months to just 3 months, saving Ahmed over OMR 2,000 in potential consultation fees and avoiding costly registration mistakes.', 'قلل سمارت برو وقت إنشاء الأعمال من 6-8 أشهر المقدرة إلى 3 أشهر فقط، مما وفر لأحمد أكثر من 2000 ريال عماني في رسوم الاستشارة المحتملة وتجنب أخطاء التسجيل المكلفة.', 1, 1, 'published', '2024-01-15'),
      ('Desert Tech Solutions', 'حلول التقنية الصحراوية', 'Fatima Al Hinai', 'فاطمة الحناي', 'Muscat', 'Bawshar', 'Technology', 'Software Development', 2021, 'Fatima, a computer science graduate, wanted to start a software development company but lacked knowledge about business licensing for tech companies, intellectual property protection, and government procurement processes.', 'فاطمة، خريجة علوم الحاسوب، أرادت بدء شركة تطوير برمجيات لكنها كانت تفتقر إلى المعرفة حول ترخيص الأعمال لشركات التكنولوجيا وحماية الملكية الفكرية وعمليات المشتريات الحكومية.', 'SmartPro connected Fatima with experts in tech business setup and intellectual property law. They helped her register her company, protect her software innovations, and navigate the government tender system.', 'ربط سمارت برو فاطمة بخبراء في إنشاء أعمال التكنولوجيا وقانون الملكية الفكرية. ساعدوها في تسجيل شركتها وحماية ابتكاراتها البرمجية والتنقل في نظام المناقصات الحكومية.', 'Desert Tech Solutions now has 25 employees and has secured 3 major government contracts. The company has developed innovative solutions for smart city applications and won the "Best Tech Startup 2023" award.', 'لدى حلول التقنية الصحراوية الآن 25 موظفًا وحصلت على 3 عقود حكومية كبرى. طورت الشركة حلولًا مبتكرة لتطبيقات المدن الذكية وفازت بجائزة "أفضل شركة ناشئة تقنية 2023".', 'As a woman in tech, I faced unique challenges. SmartPro gave me the confidence and knowledge to build a successful company. Today, we\\'re contributing to Oman\\'s digital transformation!', 'كامرأة في مجال التكنولوجيا، واجهت تحديات فريدة. أعطاني سمارت برو الثقة والمعرفة لبناء شركة ناجحة. اليوم، نساهم في التحول الرقمي لعمان!', 25, 'OMR 500,000', 45, '["Business Registration","IP Protection","Government Tender Consulting"]', 'SmartPro helped Fatima navigate complex tech regulations and secure her first government contract worth OMR 150,000, establishing her company as a credible government supplier.', 'ساعد سمارت برو فاطمة في التنقل في اللوائح التقنية المعقدة وتأمين عقدها الحكومي الأول بقيمة 150,000 ريال عماني، مما أسس شركتها كمورد حكومي موثوق.', 1, 2, 'published', '2024-02-20'),
      ('Frankincense Heritage Crafts', 'حرف تراث اللبان', 'Mohammed Al Kathiri', 'محمد الكثيري', 'Dhofar', 'Salalah', 'Handicrafts', 'Traditional Crafts & Export', 2019, 'Mohammed wanted to export traditional Omani frankincense products internationally but didn\\'t understand export regulations, quality certifications, or international trade documentation.', 'أراد محمد تصدير منتجات اللبان العمانية التقليدية دوليًا لكنه لم يفهم لوائح التصدير وشهادات الجودة أو وثائق التجارة الدولية.', 'Through SmartPro, Mohammed found export consultants who helped him obtain necessary certifications, understand customs procedures, and connect with international distributors. They also helped him establish an e-commerce presence.', 'من خلال سمارت برو، وجد محمد مستشاري تصدير ساعدوه في الحصول على الشهادات اللازمة وفهم إجراءات الجمارك والتواصل مع الموزعين الدوليين. كما ساعدوه في إنشاء وجود للتجارة الإلكترونية.', 'Frankincense Heritage Crafts now exports to 15 countries across Europe, Asia, and North America. The business has grown from a small family operation to employing 30 artisans and generating annual revenue of OMR 300,000.', 'تصدر حرف تراث اللبان الآن إلى 15 دولة عبر أوروبا وآسيا وأمريكا الشمالية. نما العمل من عملية عائلية صغيرة إلى توظيف 30 حرفيًا وتوليد إيرادات سنوية قدرها 300,000 ريال عماني.', 'SmartPro opened the world to my family business. We\\'re now sharing Omani heritage globally while providing good jobs for local artisans in Dhofar.', 'فتح سمارت برو العالم لعملنا العائلي. نحن الآن نشارك التراث العماني عالميًا مع توفير وظائف جيدة للحرفيين المحليين في ظفار.', 30, 'OMR 300,000', 2500, '["Export Licensing","Quality Certification","E-commerce Setup","International Trade Consulting"]', 'SmartPro facilitated Mohammed\\'s entry into international markets, helping him secure export licenses and quality certifications that increased his product value by 150% in international markets.', 'سهل سمارت برو دخول محمد إلى الأسواق الدولية، مساعدته في تأمين تراخيص التصدير وشهادات الجودة التي زادت قيمة منتجه بنسبة 150٪ في الأسواق الدولية.', 1, 3, 'published', '2024-03-10')
    `);
    console.log('  ✓ Added 3 success stories');
  }

  // Check and seed regulations
  console.log('\n📋 Adding Omani business regulations...');
  const [regRows] = await connection.query('SELECT COUNT(*) as count FROM regulations');
  
  if (regRows[0].count > 0) {
    console.log('  ⚠️  Regulations already exist, skipping...');
  } else {
    // Insert regulations one by one due to complexity
    await connection.query(`
      INSERT INTO regulations (title, title_ar, slug, category, subcategory, applicable_industries, applicable_business_types, summary, summary_ar, description, description_ar, requirements, requirements_ar, issuing_authority, issuing_authority_ar, authority_website, authority_contact, compliance_steps, compliance_steps_ar, required_documents, required_documents_ar, estimated_cost, estimated_duration, renewal_required, renewal_period, priority, featured, display_order, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Commercial Registration (CR)', 'السجل التجاري', 'commercial-registration', 'business_registration', 'Basic Registration',
      JSON.stringify(['All Industries']),
      JSON.stringify(['LLC', 'Sole Proprietorship', 'Partnership', 'Branch Office']),
      'Commercial Registration is the fundamental requirement for all businesses operating in Oman. It establishes your business as a legal entity and is required before you can obtain other licenses or open a bank account.',
      'السجل التجاري هو المتطلب الأساسي لجميع الأعمال التجارية العاملة في عمان. يؤسس عملك ككيان قانوني ومطلوب قبل أن تتمكن من الحصول على تراخيص أخرى أو فتح حساب بنكي.',
      'The Commercial Registration (CR) is issued by the Ministry of Commerce, Industry and Investment Promotion (MOCIIP). It serves as proof that your business is legally registered and authorized to operate in Oman. The CR must be renewed annually and displayed at your business premises. Different business structures (LLC, sole proprietorship, etc.) have different requirements and capital minimums.',
      'يصدر السجل التجاري من وزارة التجارة والصناعة وترويج الاستثمار. يعمل كدليل على أن عملك مسجل قانونيًا ومصرح له بالعمل في عمان. يجب تجديد السجل التجاري سنويًا وعرضه في مقر عملك. هياكل الأعمال المختلفة (شركة ذات مسؤولية محدودة، ملكية فردية، إلخ) لها متطلبات ورأس مال أدنى مختلف.',
      JSON.stringify([
        { id: 1, text: 'Valid Omani ID or residence permit for business owner', category: 'Identity' },
        { id: 2, text: 'Trade name reservation certificate', category: 'Documentation' },
        { id: 3, text: 'Proof of business address (lease agreement or property deed)', category: 'Location' },
        { id: 4, text: 'Memorandum of Association (for LLCs)', category: 'Legal' },
        { id: 5, text: 'Minimum capital deposit certificate (varies by business type)', category: 'Financial' },
        { id: 6, text: 'No objection certificate from sponsor (if applicable)', category: 'Legal' }
      ]),
      JSON.stringify([
        { id: 1, text: 'بطاقة هوية عمانية سارية أو تصريح إقامة لصاحب العمل', category: 'الهوية' },
        { id: 2, text: 'شهادة حجز الاسم التجاري', category: 'الوثائق' },
        { id: 3, text: 'إثبات عنوان العمل (عقد إيجار أو صك ملكية)', category: 'الموقع' },
        { id: 4, text: 'عقد التأسيس (للشركات ذات المسؤولية المحدودة)', category: 'قانوني' },
        { id: 5, text: 'شهادة إيداع رأس المال الأدنى (يختلف حسب نوع العمل)', category: 'مالي' },
        { id: 6, text: 'شهادة عدم ممانعة من الكفيل (إن وجد)', category: 'قانوني' }
      ]),
      'Ministry of Commerce, Industry and Investment Promotion (MOCIIP)',
      'وزارة التجارة والصناعة وترويج الاستثمار',
      'https://mociip.gov.om',
      JSON.stringify({ phone: '+968 24774000', email: 'info@mociip.gov.om', address: 'Ministry of Commerce, Industry and Investment Promotion, Muscat, Oman' }),
      JSON.stringify([
        { id: 1, title: 'Reserve Trade Name', description: 'Submit trade name application through MOCIIP portal. Ensure name is unique and complies with naming regulations.', estimatedDuration: '1-2 days', cost: 'OMR 5' },
        { id: 2, title: 'Prepare Legal Documents', description: 'Draft Memorandum of Association (for LLCs) or prepare sole proprietorship documents. Consider hiring a legal consultant.', estimatedDuration: '3-5 days', cost: 'OMR 100-300' },
        { id: 3, title: 'Secure Business Location', description: 'Obtain lease agreement or property deed for business premises. Ensure location is zoned for your business activity.', estimatedDuration: '1-2 weeks', cost: 'Varies' },
        { id: 4, title: 'Deposit Minimum Capital', description: 'Open bank account and deposit minimum required capital (OMR 20,000 for LLC, OMR 1,000 for sole proprietorship).', estimatedDuration: '1-2 days', cost: 'Capital amount' },
        { id: 5, title: 'Submit CR Application', description: 'Submit complete application with all documents through MOCIIP portal or service center.', estimatedDuration: '1 day', cost: 'OMR 50-200' },
        { id: 6, title: 'Receive CR Certificate', description: 'Once approved, collect your Commercial Registration certificate. Display it at your business premises.', estimatedDuration: '3-7 days', cost: 'Included' }
      ]),
      JSON.stringify([
        { id: 1, title: 'حجز الاسم التجاري', description: 'تقديم طلب الاسم التجاري من خلال بوابة وزارة التجارة والصناعة. تأكد من أن الاسم فريد ويتوافق مع لوائح التسمية.', estimatedDuration: '1-2 أيام', cost: '5 ريال عماني' },
        { id: 2, title: 'إعداد الوثائق القانونية', description: 'صياغة عقد التأسيس (للشركات ذات المسؤولية المحدودة) أو إعداد وثائق الملكية الفردية. فكر في توظيف مستشار قانوني.', estimatedDuration: '3-5 أيام', cost: '100-300 ريال عماني' },
        { id: 3, title: 'تأمين موقع العمل', description: 'الحصول على عقد إيجار أو صك ملكية لمقر العمل. تأكد من أن الموقع مخصص لنشاط عملك.', estimatedDuration: '1-2 أسابيع', cost: 'يختلف' },
        { id: 4, title: 'إيداع رأس المال الأدنى', description: 'فتح حساب بنكي وإيداع رأس المال الأدنى المطلوب (20,000 ريال عماني للشركات ذات المسؤولية المحدودة، 1,000 ريال عماني للملكية الفردية).', estimatedDuration: '1-2 أيام', cost: 'مبلغ رأس المال' },
        { id: 5, title: 'تقديم طلب السجل التجاري', description: 'تقديم الطلب الكامل مع جميع المستندات من خلال بوابة وزارة التجارة والصناعة أو مركز الخدمة.', estimatedDuration: '1 يوم', cost: '50-200 ريال عماني' },
        { id: 6, title: 'استلام شهادة السجل التجاري', description: 'بمجرد الموافقة، اجمع شهادة السجل التجاري الخاصة بك. اعرضها في مقر عملك.', estimatedDuration: '3-7 أيام', cost: 'مشمول' }
      ]),
      JSON.stringify(['Copy of Omani ID or residence permit', 'Trade name reservation certificate', 'Lease agreement or property deed', 'Memorandum of Association (notarized)', 'Bank certificate of capital deposit', 'Passport-size photographs', 'No objection certificate from sponsor (if applicable)']),
      JSON.stringify(['نسخة من البطاقة الشخصية العمانية أو تصريح الإقامة', 'شهادة حجز الاسم التجاري', 'عقد إيجار أو صك ملكية', 'عقد التأسيس (موثق)', 'شهادة بنكية بإيداع رأس المال', 'صور شخصية بحجم جواز السفر', 'شهادة عدم ممانعة من الكفيل (إن وجد)']),
      'OMR 200-500 (excluding capital deposit)', '2-4 weeks', 1, 'Annual', 'critical', 1, 1, 'published', '2024-01-01'
    ]);
    console.log('  ✓ Added Commercial Registration regulation');

    // Add Municipal License regulation
    await connection.query(`
      INSERT INTO regulations (title, title_ar, slug, category, subcategory, applicable_industries, applicable_business_types, summary, summary_ar, description, description_ar, requirements, requirements_ar, issuing_authority, issuing_authority_ar, authority_website, authority_contact, compliance_steps, compliance_steps_ar, required_documents, required_documents_ar, estimated_cost, estimated_duration, renewal_required, renewal_period, priority, featured, display_order, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Municipal License (Baladiya)', 'رخصة البلدية', 'municipal-license', 'licensing', 'Business Operations',
      JSON.stringify(['Retail', 'Food & Beverage', 'Services', 'Manufacturing']),
      JSON.stringify(['All business types with physical premises']),
      'The Municipal License is required for any business operating from physical premises in Oman. It ensures your business location complies with zoning regulations, health standards, and safety requirements.',
      'رخصة البلدية مطلوبة لأي عمل تجاري يعمل من مقر فعلي في عمان. تضمن أن موقع عملك يتوافق مع لوائح تقسيم المناطق ومعايير الصحة ومتطلبات السلامة.',
      'The Municipal License (Baladiya) is issued by the local municipality where your business is located. It verifies that your business premises meet all local regulations including proper zoning, adequate facilities, health and safety standards, and environmental compliance. Different business activities have different requirements - for example, food establishments need health inspections, while retail stores need fire safety clearance.',
      'تصدر رخصة البلدية من البلدية المحلية حيث يقع عملك. تتحقق من أن مقر عملك يلبي جميع اللوائح المحلية بما في ذلك تقسيم المناطق المناسب والمرافق الكافية ومعايير الصحة والسلامة والامتثال البيئي. الأنشطة التجارية المختلفة لها متطلبات مختلفة - على سبيل المثال، المؤسسات الغذائية تحتاج إلى فحوصات صحية، بينما المتاجر تحتاج إلى تصريح السلامة من الحرائق.',
      JSON.stringify([
        { id: 1, text: 'Valid Commercial Registration (CR)', category: 'Legal' },
        { id: 2, text: 'Lease agreement or property ownership deed', category: 'Location' },
        { id: 3, text: 'Building plan approval from municipality', category: 'Infrastructure' },
        { id: 4, text: 'Health certificate (for food businesses)', category: 'Health & Safety' },
        { id: 5, text: 'Fire safety clearance from Civil Defense', category: 'Health & Safety' },
        { id: 6, text: 'Environmental clearance (if required)', category: 'Environmental' }
      ]),
      JSON.stringify([
        { id: 1, text: 'سجل تجاري ساري المفعول', category: 'قانوني' },
        { id: 2, text: 'عقد إيجار أو صك ملكية', category: 'الموقع' },
        { id: 3, text: 'موافقة خطة البناء من البلدية', category: 'البنية التحتية' },
        { id: 4, text: 'شهادة صحية (للأعمال الغذائية)', category: 'الصحة والسلامة' },
        { id: 5, text: 'تصريح السلامة من الحرائق من الدفاع المدني', category: 'الصحة والسلامة' },
        { id: 6, text: 'تصريح بيئي (إذا لزم الأمر)', category: 'بيئي' }
      ]),
      'Local Municipality (Muscat Municipality, Salalah Municipality, etc.)',
      'البلدية المحلية (بلدية مسقط، بلدية صلالة، إلخ)',
      'https://www.mm.gov.om',
      JSON.stringify({ phone: '+968 24696666', email: 'info@mm.gov.om', address: 'Varies by municipality' }),
      JSON.stringify([
        { id: 1, title: 'Obtain Commercial Registration', description: 'Complete CR registration first as it is a prerequisite for municipal license.', estimatedDuration: '2-4 weeks', cost: 'See CR requirements' },
        { id: 2, title: 'Site Inspection Request', description: 'Submit request for initial site inspection by municipality officials.', estimatedDuration: '3-5 days', cost: 'OMR 10' },
        { id: 3, title: 'Obtain Required Clearances', description: 'Get health certificate, fire safety clearance, and environmental approval based on your business type.', estimatedDuration: '1-2 weeks', cost: 'OMR 50-200' },
        { id: 4, title: 'Submit License Application', description: 'Complete application form and submit with all supporting documents and clearances.', estimatedDuration: '1 day', cost: 'OMR 100-500' },
        { id: 5, title: 'Final Inspection', description: 'Municipality conducts final inspection to verify compliance with all requirements.', estimatedDuration: '1 week', cost: 'Included' },
        { id: 6, title: 'License Issuance', description: 'Receive municipal license and display it prominently at your business premises.', estimatedDuration: '3-5 days', cost: 'Included' }
      ]),
      JSON.stringify([
        { id: 1, title: 'الحصول على السجل التجاري', description: 'أكمل تسجيل السجل التجاري أولاً لأنه شرط مسبق لرخصة البلدية.', estimatedDuration: '2-4 أسابيع', cost: 'انظر متطلبات السجل التجاري' },
        { id: 2, title: 'طلب فحص الموقع', description: 'تقديم طلب للفحص الأولي للموقع من قبل مسؤولي البلدية.', estimatedDuration: '3-5 أيام', cost: '10 ريال عماني' },
        { id: 3, title: 'الحصول على التصاريح المطلوبة', description: 'احصل على شهادة صحية وتصريح السلامة من الحرائق والموافقة البيئية بناءً على نوع عملك.', estimatedDuration: '1-2 أسابيع', cost: '50-200 ريال عماني' },
        { id: 4, title: 'تقديم طلب الرخصة', description: 'أكمل نموذج الطلب وقدمه مع جميع المستندات الداعمة والتصاريح.', estimatedDuration: '1 يوم', cost: '100-500 ريال عماني' },
        { id: 5, title: 'الفحص النهائي', description: 'تجري البلدية فحصًا نهائيًا للتحقق من الامتثال لجميع المتطلبات.', estimatedDuration: '1 أسبوع', cost: 'مشمول' },
        { id: 6, title: 'إصدار الرخصة', description: 'استلم رخصة البلدية واعرضها بشكل بارز في مقر عملك.', estimatedDuration: '3-5 أيام', cost: 'مشمول' }
      ]),
      JSON.stringify(['Commercial Registration certificate', 'Lease agreement or property deed', 'Building plan approval', 'Health certificate (if applicable)', 'Fire safety clearance', 'Environmental clearance (if applicable)', 'Copy of owner\'s ID', 'Site plan and layout']),
      JSON.stringify(['شهادة السجل التجاري', 'عقد إيجار أو صك ملكية', 'موافقة خطة البناء', 'شهادة صحية (إن وجدت)', 'تصريح السلامة من الحرائق', 'تصريح بيئي (إن وجد)', 'نسخة من هوية المالك', 'خطة الموقع والتخطيط']),
      'OMR 200-800 (varies by business type and location)', '3-6 weeks', 1, 'Annual', 'critical', 1, 2, 'published', '2024-01-01'
    ]);
    console.log('  ✓ Added Municipal License regulation');

    // Add VAT Registration regulation
    await connection.query(`
      INSERT INTO regulations (title, title_ar, slug, category, subcategory, applicable_industries, applicable_business_types, summary, summary_ar, description, description_ar, requirements, requirements_ar, issuing_authority, issuing_authority_ar, authority_website, authority_contact, compliance_steps, compliance_steps_ar, required_documents, required_documents_ar, estimated_cost, estimated_duration, renewal_required, renewal_period, priority, featured, display_order, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Tax Registration (VAT)', 'التسجيل الضريبي (ضريبة القيمة المضافة)', 'vat-registration', 'tax', 'Value Added Tax',
      JSON.stringify(['All Industries']),
      JSON.stringify(['All business types with annual revenue exceeding threshold']),
      'VAT registration is mandatory for businesses with annual taxable supplies exceeding OMR 38,500. It enables you to charge VAT on sales and reclaim VAT on business purchases.',
      'التسجيل في ضريبة القيمة المضافة إلزامي للشركات التي تتجاوز إمداداتها الخاضعة للضريبة السنوية 38,500 ريال عماني. يمكنك من فرض ضريبة القيمة المضافة على المبيعات واسترداد ضريبة القيمة المضافة على مشتريات الأعمال.',
      'Value Added Tax (VAT) was introduced in Oman at a rate of 5% in April 2021. Businesses must register for VAT if their annual taxable supplies exceed OMR 38,500 (mandatory threshold) or OMR 19,250 (voluntary threshold). Once registered, you must charge 5% VAT on taxable supplies, file regular VAT returns, and maintain proper accounting records. The Oman Tax Authority (OTA) administers VAT compliance.',
      'تم تقديم ضريبة القيمة المضافة في عمان بمعدل 5٪ في أبريل 2021. يجب على الشركات التسجيل في ضريبة القيمة المضافة إذا تجاوزت إمداداتها الخاضعة للضريبة السنوية 38,500 ريال عماني (عتبة إلزامية) أو 19,250 ريال عماني (عتبة طوعية). بمجرد التسجيل، يجب عليك فرض ضريبة القيمة المضافة بنسبة 5٪ على الإمدادات الخاضعة للضريبة، وتقديم إقرارات ضريبة القيمة المضافة المنتظمة، والحفاظ على سجلات محاسبية مناسبة. تدير جهاز الضرائب العماني الامتثال لضريبة القيمة المضافة.',
      JSON.stringify([
        { id: 1, text: 'Valid Commercial Registration', category: 'Legal' },
        { id: 2, text: 'Annual taxable supplies exceeding OMR 38,500 (or OMR 19,250 for voluntary)', category: 'Financial' },
        { id: 3, text: 'Proper accounting system to track VAT', category: 'Financial' },
        { id: 4, text: 'Bank account in Oman', category: 'Financial' },
        { id: 5, text: 'Authorized signatory with valid ID', category: 'Legal' }
      ]),
      JSON.stringify([
        { id: 1, text: 'سجل تجاري ساري المفعول', category: 'قانوني' },
        { id: 2, text: 'إمدادات خاضعة للضريبة السنوية تتجاوز 38,500 ريال عماني (أو 19,250 ريال عماني للطوعي)', category: 'مالي' },
        { id: 3, text: 'نظام محاسبي مناسب لتتبع ضريبة القيمة المضافة', category: 'مالي' },
        { id: 4, text: 'حساب بنكي في عمان', category: 'مالي' },
        { id: 5, text: 'مفوض بالتوقيع بهوية سارية', category: 'قانوني' }
      ]),
      'Oman Tax Authority (OTA)',
      'جهاز الضرائب العماني',
      'https://tms.taxoman.gov.om',
      JSON.stringify({ phone: '+968 80077111', email: 'info@ota.gov.om', address: 'Oman Tax Authority, Muscat, Oman' }),
      JSON.stringify([
        { id: 1, title: 'Determine VAT Liability', description: 'Calculate your annual taxable supplies to determine if you meet the mandatory or voluntary threshold.', estimatedDuration: '1 day', cost: 'Free' },
        { id: 2, title: 'Prepare Documentation', description: 'Gather CR certificate, financial statements, bank details, and authorized signatory documents.', estimatedDuration: '2-3 days', cost: 'Free' },
        { id: 3, title: 'Register on OTA Portal', description: 'Create account on Oman Tax Authority\'s Tax Management System (TMS) portal.', estimatedDuration: '1 day', cost: 'Free' },
        { id: 4, title: 'Submit VAT Application', description: 'Complete online VAT registration form and upload required documents.', estimatedDuration: '1 day', cost: 'Free' },
        { id: 5, title: 'Receive Tax Registration Number (TRN)', description: 'OTA reviews application and issues TRN if approved. Display TRN on all tax invoices.', estimatedDuration: '5-10 working days', cost: 'Free' },
        { id: 6, title: 'Implement VAT Compliance', description: 'Update accounting system, train staff, and begin charging VAT on taxable supplies.', estimatedDuration: '1-2 weeks', cost: 'Varies' }
      ]),
      JSON.stringify([
        { id: 1, title: 'تحديد المسؤولية الضريبية', description: 'احسب إمداداتك الخاضعة للضريبة السنوية لتحديد ما إذا كنت تستوفي العتبة الإلزامية أو الطوعية.', estimatedDuration: '1 يوم', cost: 'مجاني' },
        { id: 2, title: 'إعداد الوثائق', description: 'اجمع شهادة السجل التجاري والبيانات المالية وتفاصيل البنك ووثائق المفوض بالتوقيع.', estimatedDuration: '2-3 أيام', cost: 'مجاني' },
        { id: 3, title: 'التسجيل في بوابة جهاز الضرائب', description: 'إنشاء حساب على بوابة نظام إدارة الضرائب (TMS) لجهاز الضرائب العماني.', estimatedDuration: '1 يوم', cost: 'مجاني' },
        { id: 4, title: 'تقديم طلب ضريبة القيمة المضافة', description: 'أكمل نموذج تسجيل ضريبة القيمة المضافة عبر الإنترنت وقم بتحميل المستندات المطلوبة.', estimatedDuration: '1 يوم', cost: 'مجاني' },
        { id: 5, title: 'استلام رقم التسجيل الضريبي (TRN)', description: 'يراجع جهاز الضرائب الطلب ويصدر رقم التسجيل الضريبي إذا تمت الموافقة. اعرض رقم التسجيل الضريبي على جميع الفواتير الضريبية.', estimatedDuration: '5-10 أيام عمل', cost: 'مجاني' },
        { id: 6, title: 'تنفيذ الامتثال لضريبة القيمة المضافة', description: 'حدّث نظام المحاسبة، ودرب الموظفين، وابدأ في فرض ضريبة القيمة المضافة على الإمدادات الخاضعة للضريبة.', estimatedDuration: '1-2 أسابيع', cost: 'يختلف' }
      ]),
      JSON.stringify(['Commercial Registration certificate', 'Memorandum of Association', 'Financial statements (last 12 months)', 'Bank account details', 'Copy of authorized signatory\'s ID', 'Business address proof', 'List of business activities']),
      JSON.stringify(['شهادة السجل التجاري', 'عقد التأسيس', 'البيانات المالية (آخر 12 شهرًا)', 'تفاصيل الحساب البنكي', 'نسخة من هوية المفوض بالتوقيع', 'إثبات عنوان العمل', 'قائمة الأنشطة التجارية']),
      'Free (registration), but accounting system upgrades may cost OMR 500-2000', '2-3 weeks', 0, 'N/A (but quarterly VAT returns required)', 'high', 1, 3, 'published', '2024-01-01'
    ]);
    console.log('  ✓ Added VAT Registration regulation');
  }

  console.log('\n✅ Database seeding completed successfully!');
  
} catch (error) {
  console.error('\n❌ Error seeding database:', error);
  throw error;
} finally {
  await connection.end();
}
