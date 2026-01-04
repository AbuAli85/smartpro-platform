import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.js';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('🌱 Seeding database with Omani content...\n');

// Seed Governorates
console.log('📍 Adding Omani governorates...');

// Check if data already exists
const existingGov = await db.select().from(schema.governorates).limit(1);
if (existingGov.length > 0) {
  console.log('  ⚠️  Governorates already exist, skipping...');
} else {
const governoratesData = [
  {
    name: 'Muscat',
    name_ar: 'مسقط',
    slug: 'muscat',
    region: 'coastal',
    capital_city: 'Muscat',
    capital_city_ar: 'مسقط',
    area: 3500.00,
    coordinates: { lat: 23.5880, lng: 58.3829 },
    population: 1560000,
    population_year: 2023,
    major_cities: [
      { name: 'Muscat', name_ar: 'مسقط' },
      { name: 'Muttrah', name_ar: 'مطرح' },
      { name: 'Ruwi', name_ar: 'روي' }
    ],
    wilayats: [
      { name: 'Muscat', name_ar: 'مسقط' },
      { name: 'Muttrah', name_ar: 'مطرح' },
      { name: 'Bawshar', name_ar: 'بوشر' },
      { name: 'As-Seeb', name_ar: 'السيب' },
      { name: 'Al-Amerat', name_ar: 'العامرات' },
      { name: 'Qurayyat', name_ar: 'قريات' }
    ],
    key_industries: ['Financial Services', 'Tourism', 'Logistics', 'Technology', 'Government Services'],
    key_industries_ar: ['الخدمات المالية', 'السياحة', 'اللوجستيات', 'التكنولوجيا', 'الخدمات الحكومية'],
    economic_sectors: { services: 75, industrial: 15, agricultural: 10 },
    total_businesses: 45000,
    sme_count: 38000,
    overview: 'Muscat is the capital and largest city of Oman, serving as the political, economic, and cultural center of the country. The governorate is home to major government institutions, international businesses, and a thriving SME ecosystem.',
    overview_ar: 'مسقط هي عاصمة سلطنة عمان وأكبر مدنها، وتعتبر المركز السياسي والاقتصادي والثقافي للبلاد. تضم المحافظة المؤسسات الحكومية الرئيسية والشركات الدولية ونظام بيئي مزدهر للمشاريع الصغيرة والمتوسطة.',
    economic_profile: 'Muscat drives Oman\'s economy with its concentration of financial institutions, government services, and international trade. The governorate is a hub for innovation and entrepreneurship, with growing sectors in technology, tourism, and logistics.',
    economic_profile_ar: 'تقود مسقط اقتصاد عمان بتركيزها على المؤسسات المالية والخدمات الحكومية والتجارة الدولية. المحافظة مركز للابتكار وريادة الأعمال، مع قطاعات متنامية في التكنولوجيا والسياحة واللوجستيات.',
    business_opportunities: ['Technology startups', 'Tourism services', 'Professional consulting', 'E-commerce', 'Food & beverage'],
    business_opportunities_ar: ['الشركات الناشئة في التكنولوجيا', 'خدمات السياحة', 'الاستشارات المهنية', 'التجارة الإلكترونية', 'الأغذية والمشروبات'],
    investment_zones: [
      { name: 'Knowledge Oasis Muscat', name_ar: 'واحة المعرفة مسقط', type: 'Technology Park' },
      { name: 'Rusayl Industrial Estate', name_ar: 'المنطقة الصناعية الرسيل', type: 'Industrial' }
    ],
    investment_zones_ar: [
      { name: 'واحة المعرفة مسقط', type: 'حديقة تكنولوجية' },
      { name: 'المنطقة الصناعية الرسيل', type: 'صناعية' }
    ],
    registered_offices_count: 850,
    top_service_categories: ['Business Registration', 'Legal Services', 'Accounting', 'Marketing'],
    average_service_price: 150.00,
    featured: 1,
    display_order: 1,
    status: 'active'
  },
  {
    name: 'Dhofar',
    name_ar: 'ظفار',
    slug: 'dhofar',
    region: 'south',
    capital_city: 'Salalah',
    capital_city_ar: 'صلالة',
    area: 99300.00,
    coordinates: { lat: 17.0150, lng: 54.0924 },
    population: 460000,
    population_year: 2023,
    major_cities: [
      { name: 'Salalah', name_ar: 'صلالة' },
      { name: 'Taqah', name_ar: 'طاقة' },
      { name: 'Mirbat', name_ar: 'مرباط' }
    ],
    wilayats: [
      { name: 'Salalah', name_ar: 'صلالة' },
      { name: 'Taqah', name_ar: 'طاقة' },
      { name: 'Mirbat', name_ar: 'مرباط' },
      { name: 'Sadah', name_ar: 'سدح' },
      { name: 'Rakhyut', name_ar: 'رخيوت' }
    ],
    key_industries: ['Tourism', 'Agriculture', 'Fisheries', 'Logistics', 'Frankincense Trade'],
    key_industries_ar: ['السياحة', 'الزراعة', 'الأسماك', 'اللوجستيات', 'تجارة اللبان'],
    economic_sectors: { services: 50, industrial: 25, agricultural: 25 },
    total_businesses: 12000,
    sme_count: 10500,
    overview: 'Dhofar is Oman\'s southern jewel, famous for its unique Khareef monsoon season and lush landscapes. The governorate is a major tourism destination and agricultural hub, with significant potential for sustainable business development.',
    overview_ar: 'ظفار هي جوهرة عمان الجنوبية، المشهورة بموسم الخريف الفريد ومناظرها الطبيعية الخضراء. المحافظة وجهة سياحية رئيسية ومركز زراعي، مع إمكانات كبيرة للتنمية التجارية المستدامة.',
    economic_profile: 'Dhofar\'s economy is driven by tourism, particularly during the Khareef season, agriculture including coconut and banana plantations, and the Port of Salalah, one of the region\'s largest transshipment hubs.',
    economic_profile_ar: 'يقود اقتصاد ظفار السياحة، خاصة خلال موسم الخريف، والزراعة بما في ذلك مزارع جوز الهند والموز، وميناء صلالة، أحد أكبر مراكز الشحن في المنطقة.',
    business_opportunities: ['Eco-tourism', 'Agricultural products', 'Handicrafts', 'Hospitality services', 'Logistics support'],
    business_opportunities_ar: ['السياحة البيئية', 'المنتجات الزراعية', 'الحرف اليدوية', 'خدمات الضيافة', 'دعم اللوجستيات'],
    investment_zones: [
      { name: 'Salalah Free Zone', name_ar: 'المنطقة الحرة بصلالة', type: 'Free Zone' },
      { name: 'Salalah Tourism Zone', name_ar: 'منطقة صلالة السياحية', type: 'Tourism' }
    ],
    investment_zones_ar: [
      { name: 'المنطقة الحرة بصلالة', type: 'منطقة حرة' },
      { name: 'منطقة صلالة السياحية', type: 'سياحية' }
    ],
    registered_offices_count: 320,
    top_service_categories: ['Tourism Services', 'Agricultural Consulting', 'Trade Services'],
    average_service_price: 120.00,
    featured: 1,
    display_order: 2,
    status: 'active'
  },
  {
    name: 'Al Batinah North',
    name_ar: 'شمال الباطنة',
    slug: 'al-batinah-north',
    region: 'coastal',
    capital_city: 'Sohar',
    capital_city_ar: 'صحار',
    area: 12500.00,
    coordinates: { lat: 24.3474, lng: 56.7094 },
    population: 730000,
    population_year: 2023,
    major_cities: [
      { name: 'Sohar', name_ar: 'صحار' },
      { name: 'Shinas', name_ar: 'شناص' },
      { name: 'Liwa', name_ar: 'لوى' }
    ],
    wilayats: [
      { name: 'Sohar', name_ar: 'صحار' },
      { name: 'Shinas', name_ar: 'شناص' },
      { name: 'Liwa', name_ar: 'لوى' },
      { name: 'Saham', name_ar: 'صحم' },
      { name: 'Al Khaboura', name_ar: 'الخابورة' },
      { name: 'As Suwaiq', name_ar: 'السويق' }
    ],
    key_industries: ['Heavy Industry', 'Petrochemicals', 'Mining', 'Fisheries', 'Agriculture'],
    key_industries_ar: ['الصناعات الثقيلة', 'البتروكيماويات', 'التعدين', 'الأسماك', 'الزراعة'],
    economic_sectors: { services: 35, industrial: 50, agricultural: 15 },
    total_businesses: 18000,
    sme_count: 15000,
    overview: 'Al Batinah North is Oman\'s industrial powerhouse, home to the Sohar Industrial Port and major petrochemical facilities. The governorate combines heavy industry with traditional agriculture and fishing.',
    overview_ar: 'شمال الباطنة هي القوة الصناعية لعمان، موطن ميناء صحار الصناعي والمنشآت البتروكيماوية الكبرى. تجمع المحافظة بين الصناعة الثقيلة والزراعة التقليدية والصيد.',
    economic_profile: 'The governorate hosts major industrial projects including aluminum smelting, petrochemicals, and port operations. SMEs thrive in supporting industries, agriculture, and services.',
    economic_profile_ar: 'تستضيف المحافظة مشاريع صناعية كبرى بما في ذلك صهر الألومنيوم والبتروكيماويات وعمليات الموانئ. تزدهر المشاريع الصغيرة والمتوسطة في الصناعات الداعمة والزراعة والخدمات.',
    business_opportunities: ['Industrial support services', 'Logistics', 'Agricultural exports', 'Marine services', 'Construction'],
    business_opportunities_ar: ['خدمات الدعم الصناعي', 'اللوجستيات', 'الصادرات الزراعية', 'الخدمات البحرية', 'البناء'],
    investment_zones: [
      { name: 'Sohar Industrial Port', name_ar: 'ميناء صحار الصناعي', type: 'Industrial Port' },
      { name: 'Sohar Free Zone', name_ar: 'المنطقة الحرة بصحار', type: 'Free Zone' }
    ],
    investment_zones_ar: [
      { name: 'ميناء صحار الصناعي', type: 'ميناء صناعي' },
      { name: 'المنطقة الحرة بصحار', type: 'منطقة حرة' }
    ],
    registered_offices_count: 450,
    top_service_categories: ['Industrial Services', 'Logistics', 'Construction', 'Business Support'],
    average_service_price: 135.00,
    featured: 1,
    display_order: 3,
    status: 'active'
  }
];

  for (const gov of governoratesData) {
    await db.insert(schema.governorates).values(gov);
    console.log(`  ✓ Added ${gov.name}`);
  }
}

// Seed Success Stories
console.log('\n📖 Adding Omani success stories...');

const existingStories = await db.select().from(schema.successStories).limit(1);
if (existingStories.length > 0) {
  console.log('  ⚠️  Success stories already exist, skipping...');
} else {
const successStoriesData = [
  {
    business_name: 'Omani Coffee House',
    business_name_ar: 'بيت القهوة العماني',
    owner_name: 'Ahmed Al Balushi',
    owner_name_ar: 'أحمد البلوشي',
    governorate: 'Muscat',
    wilayat: 'Muttrah',
    industry: 'Food & Beverage',
    service_type: 'Café & Restaurant',
    year_established: 2020,
    challenge: 'Ahmed wanted to open a traditional Omani coffee house but faced challenges with business registration, obtaining health permits, and understanding tax obligations. The complex regulatory requirements seemed overwhelming for a first-time entrepreneur.',
    challenge_ar: 'أراد أحمد فتح مقهى عماني تقليدي لكنه واجه تحديات في تسجيل الأعمال والحصول على تصاريح صحية وفهم الالتزامات الضريبية. بدت المتطلبات التنظيمية المعقدة ساحقة لرائد أعمال لأول مرة.',
    solution: 'Through SmartPro, Ahmed connected with a licensed business consultant who guided him through the entire registration process. The consultant helped him prepare all required documents, navigate MOCIIP requirements, and set up proper accounting systems.',
    solution_ar: 'من خلال سمارت برو، تواصل أحمد مع مستشار أعمال مرخص أرشده خلال عملية التسجيل بأكملها. ساعده المستشار في إعداد جميع المستندات المطلوبة والتنقل في متطلبات وزارة التجارة والصناعة وإنشاء أنظمة محاسبية مناسبة.',
    results: 'Ahmed successfully opened his coffee house within 3 months. The business now employs 12 people and has become a popular destination for both locals and tourists. Monthly revenue has grown by 200% in the first year.',
    results_ar: 'نجح أحمد في فتح مقهاه خلال 3 أشهر. يوظف العمل الآن 12 شخصًا وأصبح وجهة شعبية للسكان المحليين والسياح. نمت الإيرادات الشهرية بنسبة 200٪ في السنة الأولى.',
    testimonial: 'SmartPro made my dream possible. Without their help, I would still be struggling with paperwork. Now I focus on serving the best Omani coffee in Muscat!',
    testimonial_ar: 'سمارت برو جعل حلمي ممكنًا. بدون مساعدتهم، كنت سأظل أعاني مع الأوراق. الآن أركز على تقديم أفضل قهوة عمانية في مسقط!',
    jobs_created: 12,
    revenue_growth: '200%',
    customers_served: 5000,
    smartpro_services_used: ['Business Registration', 'Legal Consulting', 'Accounting Setup'],
    smartpro_impact: 'SmartPro reduced the business setup time from an estimated 6-8 months to just 3 months, saving Ahmed over OMR 2,000 in potential consultation fees and avoiding costly registration mistakes.',
    smartpro_impact_ar: 'قلل سمارت برو وقت إنشاء الأعمال من 6-8 أشهر المقدرة إلى 3 أشهر فقط، مما وفر لأحمد أكثر من 2000 ريال عماني في رسوم الاستشارة المحتملة وتجنب أخطاء التسجيل المكلفة.',
    featured: 1,
    display_order: 1,
    status: 'published',
    published_at: new Date('2024-01-15').toISOString()
  },
  {
    business_name: 'Desert Tech Solutions',
    business_name_ar: 'حلول التقنية الصحراوية',
    owner_name: 'Fatima Al Hinai',
    owner_name_ar: 'فاطمة الحناي',
    governorate: 'Muscat',
    wilayat: 'Bawshar',
    industry: 'Technology',
    service_type: 'Software Development',
    year_established: 2021,
    challenge: 'Fatima, a computer science graduate, wanted to start a software development company but lacked knowledge about business licensing for tech companies, intellectual property protection, and government procurement processes.',
    challenge_ar: 'فاطمة، خريجة علوم الحاسوب، أرادت بدء شركة تطوير برمجيات لكنها كانت تفتقر إلى المعرفة حول ترخيص الأعمال لشركات التكنولوجيا وحماية الملكية الفكرية وعمليات المشتريات الحكومية.',
    solution: 'SmartPro connected Fatima with experts in tech business setup and intellectual property law. They helped her register her company, protect her software innovations, and navigate the government tender system.',
    solution_ar: 'ربط سمارت برو فاطمة بخبراء في إنشاء أعمال التكنولوجيا وقانون الملكية الفكرية. ساعدوها في تسجيل شركتها وحماية ابتكاراتها البرمجية والتنقل في نظام المناقصات الحكومية.',
    results: 'Desert Tech Solutions now has 25 employees and has secured 3 major government contracts. The company has developed innovative solutions for smart city applications and won the "Best Tech Startup 2023" award.',
    results_ar: 'لدى حلول التقنية الصحراوية الآن 25 موظفًا وحصلت على 3 عقود حكومية كبرى. طورت الشركة حلولًا مبتكرة لتطبيقات المدن الذكية وفازت بجائزة "أفضل شركة ناشئة تقنية 2023".',
    testimonial: 'As a woman in tech, I faced unique challenges. SmartPro gave me the confidence and knowledge to build a successful company. Today, we\'re contributing to Oman\'s digital transformation!',
    testimonial_ar: 'كامرأة في مجال التكنولوجيا، واجهت تحديات فريدة. أعطاني سمارت برو الثقة والمعرفة لبناء شركة ناجحة. اليوم، نساهم في التحول الرقمي لعمان!',
    jobs_created: 25,
    revenue_growth: 'OMR 500,000',
    customers_served: 45,
    awards_received: ['Best Tech Startup 2023', 'Women in Business Award 2024'],
    smartpro_services_used: ['Business Registration', 'IP Protection', 'Government Tender Consulting'],
    smartpro_impact: 'SmartPro helped Fatima navigate complex tech regulations and secure her first government contract worth OMR 150,000, establishing her company as a credible government supplier.',
    smartpro_impact_ar: 'ساعد سمارت برو فاطمة في التنقل في اللوائح التقنية المعقدة وتأمين عقدها الحكومي الأول بقيمة 150,000 ريال عماني، مما أسس شركتها كمورد حكومي موثوق.',
    featured: 1,
    display_order: 2,
    status: 'published',
    published_at: new Date('2024-02-20').toISOString()
  },
  {
    business_name: 'Frankincense Heritage Crafts',
    business_name_ar: 'حرف تراث اللبان',
    owner_name: 'Mohammed Al Kathiri',
    owner_name_ar: 'محمد الكثيري',
    governorate: 'Dhofar',
    wilayat: 'Salalah',
    industry: 'Handicrafts',
    service_type: 'Traditional Crafts & Export',
    year_established: 2019,
    challenge: 'Mohammed wanted to export traditional Omani frankincense products internationally but didn\'t understand export regulations, quality certifications, or international trade documentation.',
    challenge_ar: 'أراد محمد تصدير منتجات اللبان العمانية التقليدية دوليًا لكنه لم يفهم لوائح التصدير وشهادات الجودة أو وثائق التجارة الدولية.',
    solution: 'Through SmartPro, Mohammed found export consultants who helped him obtain necessary certifications, understand customs procedures, and connect with international distributors. They also helped him establish an e-commerce presence.',
    solution_ar: 'من خلال سمارت برو، وجد محمد مستشاري تصدير ساعدوه في الحصول على الشهادات اللازمة وفهم إجراءات الجمارك والتواصل مع الموزعين الدوليين. كما ساعدوه في إنشاء وجود للتجارة الإلكترونية.',
    results: 'Frankincense Heritage Crafts now exports to 15 countries across Europe, Asia, and North America. The business has grown from a small family operation to employing 30 artisans and generating annual revenue of OMR 300,000.',
    results_ar: 'تصدر حرف تراث اللبان الآن إلى 15 دولة عبر أوروبا وآسيا وأمريكا الشمالية. نما العمل من عملية عائلية صغيرة إلى توظيف 30 حرفيًا وتوليد إيرادات سنوية قدرها 300,000 ريال عماني.',
    testimonial: 'SmartPro opened the world to my family business. We\'re now sharing Omani heritage globally while providing good jobs for local artisans in Dhofar.',
    testimonial_ar: 'فتح سمارت برو العالم لعملنا العائلي. نحن الآن نشارك التراث العماني عالميًا مع توفير وظائف جيدة للحرفيين المحليين في ظفار.',
    jobs_created: 30,
    revenue_growth: 'OMR 300,000',
    customers_served: 2500,
    smartpro_services_used: ['Export Licensing', 'Quality Certification', 'E-commerce Setup', 'International Trade Consulting'],
    smartpro_impact: 'SmartPro facilitated Mohammed\'s entry into international markets, helping him secure export licenses and quality certifications that increased his product value by 150% in international markets.',
    smartpro_impact_ar: 'سهل سمارت برو دخول محمد إلى الأسواق الدولية، مساعدته في تأمين تراخيص التصدير وشهادات الجودة التي زادت قيمة منتجه بنسبة 150٪ في الأسواق الدولية.',
    featured: 1,
    display_order: 3,
    status: 'published',
    published_at: new Date('2024-03-10').toISOString()
  }
];

  for (const story of successStoriesData) {
    await db.insert(schema.successStories).values(story);
    console.log(`  ✓ Added ${story.business_name}`);
  }
}

// Seed Regulations
console.log('\n📋 Adding Omani business regulations...');

const existingRegs = await db.select().from(schema.regulations).limit(1);
if (existingRegs.length > 0) {
  console.log('  ⚠️  Regulations already exist, skipping...');
} else {
const regulationsData = [
  {
    title: 'Commercial Registration (CR)',
    title_ar: 'السجل التجاري',
    slug: 'commercial-registration',
    category: 'business_registration',
    subcategory: 'Basic Registration',
    applicable_industries: ['All Industries'],
    applicable_business_types: ['LLC', 'Sole Proprietorship', 'Partnership', 'Branch Office'],
    summary: 'Commercial Registration is the fundamental requirement for all businesses operating in Oman. It establishes your business as a legal entity and is required before you can obtain other licenses or open a bank account.',
    summary_ar: 'السجل التجاري هو المتطلب الأساسي لجميع الأعمال التجارية العاملة في عمان. يؤسس عملك ككيان قانوني ومطلوب قبل أن تتمكن من الحصول على تراخيص أخرى أو فتح حساب بنكي.',
    description: 'The Commercial Registration (CR) is issued by the Ministry of Commerce, Industry and Investment Promotion (MOCIIP). It serves as proof that your business is legally registered and authorized to operate in Oman. The CR must be renewed annually and displayed at your business premises. Different business structures (LLC, sole proprietorship, etc.) have different requirements and capital minimums.',
    description_ar: 'يصدر السجل التجاري من وزارة التجارة والصناعة وترويج الاستثمار. يعمل كدليل على أن عملك مسجل قانونيًا ومصرح له بالعمل في عمان. يجب تجديد السجل التجاري سنويًا وعرضه في مقر عملك. هياكل الأعمال المختلفة (شركة ذات مسؤولية محدودة، ملكية فردية، إلخ) لها متطلبات ورأس مال أدنى مختلف.',
    requirements: [
      { id: 1, text: 'Valid Omani ID or residence permit for business owner', category: 'Identity' },
      { id: 2, text: 'Trade name reservation certificate', category: 'Documentation' },
      { id: 3, text: 'Proof of business address (lease agreement or property deed)', category: 'Location' },
      { id: 4, text: 'Memorandum of Association (for LLCs)', category: 'Legal' },
      { id: 5, text: 'Minimum capital deposit certificate (varies by business type)', category: 'Financial' },
      { id: 6, text: 'No objection certificate from sponsor (if applicable)', category: 'Legal' }
    ],
    requirements_ar: [
      { id: 1, text: 'بطاقة هوية عمانية سارية أو تصريح إقامة لصاحب العمل', category: 'الهوية' },
      { id: 2, text: 'شهادة حجز الاسم التجاري', category: 'الوثائق' },
      { id: 3, text: 'إثبات عنوان العمل (عقد إيجار أو صك ملكية)', category: 'الموقع' },
      { id: 4, text: 'عقد التأسيس (للشركات ذات المسؤولية المحدودة)', category: 'قانوني' },
      { id: 5, text: 'شهادة إيداع رأس المال الأدنى (يختلف حسب نوع العمل)', category: 'مالي' },
      { id: 6, text: 'شهادة عدم ممانعة من الكفيل (إن وجد)', category: 'قانوني' }
    ],
    issuing_authority: 'Ministry of Commerce, Industry and Investment Promotion (MOCIIP)',
    issuing_authority_ar: 'وزارة التجارة والصناعة وترويج الاستثمار',
    authority_website: 'https://mociip.gov.om',
    authority_contact: {
      phone: '+968 24774000',
      email: 'info@mociip.gov.om',
      address: 'Ministry of Commerce, Industry and Investment Promotion, Muscat, Oman'
    },
    compliance_steps: [
      { 
        id: 1, 
        title: 'Reserve Trade Name', 
        description: 'Submit trade name application through MOCIIP portal. Ensure name is unique and complies with naming regulations.',
        estimated_duration: '1-2 days',
        cost: 'OMR 5'
      },
      { 
        id: 2, 
        title: 'Prepare Legal Documents', 
        description: 'Draft Memorandum of Association (for LLCs) or prepare sole proprietorship documents. Consider hiring a legal consultant.',
        estimated_duration: '3-5 days',
        cost: 'OMR 100-300'
      },
      { 
        id: 3, 
        title: 'Secure Business Location', 
        description: 'Obtain lease agreement or property deed for business premises. Ensure location is zoned for your business activity.',
        estimated_duration: '1-2 weeks',
        cost: 'Varies'
      },
      { 
        id: 4, 
        title: 'Deposit Minimum Capital', 
        description: 'Open bank account and deposit minimum required capital (OMR 20,000 for LLC, OMR 1,000 for sole proprietorship).',
        estimated_duration: '1-2 days',
        cost: 'Capital amount'
      },
      { 
        id: 5, 
        title: 'Submit CR Application', 
        description: 'Submit complete application with all documents through MOCIIP portal or service center.',
        estimated_duration: '1 day',
        cost: 'OMR 50-200'
      },
      { 
        id: 6, 
        title: 'Receive CR Certificate', 
        description: 'Once approved, collect your Commercial Registration certificate. Display it at your business premises.',
        estimated_duration: '3-7 days',
        cost: 'Included'
      }
    ],
    compliance_steps_ar: [
      { 
        id: 1, 
        title: 'حجز الاسم التجاري', 
        description: 'تقديم طلب الاسم التجاري من خلال بوابة وزارة التجارة والصناعة. تأكد من أن الاسم فريد ويتوافق مع لوائح التسمية.',
        estimated_duration: '1-2 أيام',
        cost: '5 ريال عماني'
      },
      { 
        id: 2, 
        title: 'إعداد الوثائق القانونية', 
        description: 'صياغة عقد التأسيس (للشركات ذات المسؤولية المحدودة) أو إعداد وثائق الملكية الفردية. فكر في توظيف مستشار قانوني.',
        estimated_duration: '3-5 أيام',
        cost: '100-300 ريال عماني'
      },
      { 
        id: 3, 
        title: 'تأمين موقع العمل', 
        description: 'الحصول على عقد إيجار أو صك ملكية لمقر العمل. تأكد من أن الموقع مخصص لنشاط عملك.',
        estimated_duration: '1-2 أسابيع',
        cost: 'يختلف'
      },
      { 
        id: 4, 
        title: 'إيداع رأس المال الأدنى', 
        description: 'فتح حساب بنكي وإيداع رأس المال الأدنى المطلوب (20,000 ريال عماني للشركات ذات المسؤولية المحدودة، 1,000 ريال عماني للملكية الفردية).',
        estimated_duration: '1-2 أيام',
        cost: 'مبلغ رأس المال'
      },
      { 
        id: 5, 
        title: 'تقديم طلب السجل التجاري', 
        description: 'تقديم الطلب الكامل مع جميع المستندات من خلال بوابة وزارة التجارة والصناعة أو مركز الخدمة.',
        estimated_duration: '1 يوم',
        cost: '50-200 ريال عماني'
      },
      { 
        id: 6, 
        title: 'استلام شهادة السجل التجاري', 
        description: 'بمجرد الموافقة، اجمع شهادة السجل التجاري الخاصة بك. اعرضها في مقر عملك.',
        estimated_duration: '3-7 أيام',
        cost: 'مشمول'
      }
    ],
    required_documents: [
      'Copy of Omani ID or residence permit',
      'Trade name reservation certificate',
      'Lease agreement or property deed',
      'Memorandum of Association (notarized)',
      'Bank certificate of capital deposit',
      'Passport-size photographs',
      'No objection certificate from sponsor (if applicable)'
    ],
    required_documents_ar: [
      'نسخة من البطاقة الشخصية العمانية أو تصريح الإقامة',
      'شهادة حجز الاسم التجاري',
      'عقد إيجار أو صك ملكية',
      'عقد التأسيس (موثق)',
      'شهادة بنكية بإيداع رأس المال',
      'صور شخصية بحجم جواز السفر',
      'شهادة عدم ممانعة من الكفيل (إن وجد)'
    ],
    estimated_cost: 'OMR 200-500 (excluding capital deposit)',
    estimated_duration: '2-4 weeks',
    renewal_required: 1,
    renewal_period: 'Annual',
    priority: 'critical',
    featured: 1,
    display_order: 1,
    status: 'published',
    published_at: new Date('2024-01-01').toISOString()
  },
  {
    title: 'Municipal License (Baladiya)',
    title_ar: 'رخصة البلدية',
    slug: 'municipal-license',
    category: 'licensing',
    subcategory: 'Business Operations',
    applicable_industries: ['Retail', 'Food & Beverage', 'Services', 'Manufacturing'],
    applicable_business_types: ['All business types with physical premises'],
    summary: 'The Municipal License is required for any business operating from physical premises in Oman. It ensures your business location complies with zoning regulations, health standards, and safety requirements.',
    summary_ar: 'رخصة البلدية مطلوبة لأي عمل تجاري يعمل من مقر فعلي في عمان. تضمن أن موقع عملك يتوافق مع لوائح تقسيم المناطق ومعايير الصحة ومتطلبات السلامة.',
    description: 'The Municipal License (Baladiya) is issued by the local municipality where your business is located. It verifies that your business premises meet all local regulations including proper zoning, adequate facilities, health and safety standards, and environmental compliance. Different business activities have different requirements - for example, food establishments need health inspections, while retail stores need fire safety clearance.',
    description_ar: 'تصدر رخصة البلدية من البلدية المحلية حيث يقع عملك. تتحقق من أن مقر عملك يلبي جميع اللوائح المحلية بما في ذلك تقسيم المناطق المناسب والمرافق الكافية ومعايير الصحة والسلامة والامتثال البيئي. الأنشطة التجارية المختلفة لها متطلبات مختلفة - على سبيل المثال، المؤسسات الغذائية تحتاج إلى فحوصات صحية، بينما المتاجر تحتاج إلى تصريح السلامة من الحرائق.',
    requirements: [
      { id: 1, text: 'Valid Commercial Registration (CR)', category: 'Legal' },
      { id: 2, text: 'Lease agreement or property ownership deed', category: 'Location' },
      { id: 3, text: 'Building plan approval from municipality', category: 'Infrastructure' },
      { id: 4, text: 'Health certificate (for food businesses)', category: 'Health & Safety' },
      { id: 5, text: 'Fire safety clearance from Civil Defense', category: 'Health & Safety' },
      { id: 6, text: 'Environmental clearance (if required)', category: 'Environmental' }
    ],
    requirements_ar: [
      { id: 1, text: 'سجل تجاري ساري المفعول', category: 'قانوني' },
      { id: 2, text: 'عقد إيجار أو صك ملكية', category: 'الموقع' },
      { id: 3, text: 'موافقة خطة البناء من البلدية', category: 'البنية التحتية' },
      { id: 4, text: 'شهادة صحية (للأعمال الغذائية)', category: 'الصحة والسلامة' },
      { id: 5, text: 'تصريح السلامة من الحرائق من الدفاع المدني', category: 'الصحة والسلامة' },
      { id: 6, text: 'تصريح بيئي (إذا لزم الأمر)', category: 'بيئي' }
    ],
    issuing_authority: 'Local Municipality (Muscat Municipality, Salalah Municipality, etc.)',
    issuing_authority_ar: 'البلدية المحلية (بلدية مسقط، بلدية صلالة، إلخ)',
    authority_website: 'https://www.mm.gov.om',
    authority_contact: {
      phone: '+968 24696666',
      email: 'info@mm.gov.om',
      address: 'Varies by municipality'
    },
    compliance_steps: [
      { 
        id: 1, 
        title: 'Obtain Commercial Registration', 
        description: 'Complete CR registration first as it is a prerequisite for municipal license.',
        estimated_duration: '2-4 weeks',
        cost: 'See CR requirements'
      },
      { 
        id: 2, 
        title: 'Site Inspection Request', 
        description: 'Submit request for initial site inspection by municipality officials.',
        estimated_duration: '3-5 days',
        cost: 'OMR 10'
      },
      { 
        id: 3, 
        title: 'Obtain Required Clearances', 
        description: 'Get health certificate, fire safety clearance, and environmental approval based on your business type.',
        estimated_duration: '1-2 weeks',
        cost: 'OMR 50-200'
      },
      { 
        id: 4, 
        title: 'Submit License Application', 
        description: 'Complete application form and submit with all supporting documents and clearances.',
        estimated_duration: '1 day',
        cost: 'OMR 100-500'
      },
      { 
        id: 5, 
        title: 'Final Inspection', 
        description: 'Municipality conducts final inspection to verify compliance with all requirements.',
        estimated_duration: '1 week',
        cost: 'Included'
      },
      { 
        id: 6, 
        title: 'License Issuance', 
        description: 'Receive municipal license and display it prominently at your business premises.',
        estimated_duration: '3-5 days',
        cost: 'Included'
      }
    ],
    compliance_steps_ar: [
      { 
        id: 1, 
        title: 'الحصول على السجل التجاري', 
        description: 'أكمل تسجيل السجل التجاري أولاً لأنه شرط مسبق لرخصة البلدية.',
        estimated_duration: '2-4 أسابيع',
        cost: 'انظر متطلبات السجل التجاري'
      },
      { 
        id: 2, 
        title: 'طلب فحص الموقع', 
        description: 'تقديم طلب للفحص الأولي للموقع من قبل مسؤولي البلدية.',
        estimated_duration: '3-5 أيام',
        cost: '10 ريال عماني'
      },
      { 
        id: 3, 
        title: 'الحصول على التصاريح المطلوبة', 
        description: 'احصل على شهادة صحية وتصريح السلامة من الحرائق والموافقة البيئية بناءً على نوع عملك.',
        estimated_duration: '1-2 أسابيع',
        cost: '50-200 ريال عماني'
      },
      { 
        id: 4, 
        title: 'تقديم طلب الرخصة', 
        description: 'أكمل نموذج الطلب وقدمه مع جميع المستندات الداعمة والتصاريح.',
        estimated_duration: '1 يوم',
        cost: '100-500 ريال عماني'
      },
      { 
        id: 5, 
        title: 'الفحص النهائي', 
        description: 'تجري البلدية فحصًا نهائيًا للتحقق من الامتثال لجميع المتطلبات.',
        estimated_duration: '1 أسبوع',
        cost: 'مشمول'
      },
      { 
        id: 6, 
        title: 'إصدار الرخصة', 
        description: 'استلم رخصة البلدية واعرضها بشكل بارز في مقر عملك.',
        estimated_duration: '3-5 أيام',
        cost: 'مشمول'
      }
    ],
    required_documents: [
      'Commercial Registration certificate',
      'Lease agreement or property deed',
      'Building plan approval',
      'Health certificate (if applicable)',
      'Fire safety clearance',
      'Environmental clearance (if applicable)',
      'Copy of owner\'s ID',
      'Site plan and layout'
    ],
    required_documents_ar: [
      'شهادة السجل التجاري',
      'عقد إيجار أو صك ملكية',
      'موافقة خطة البناء',
      'شهادة صحية (إن وجدت)',
      'تصريح السلامة من الحرائق',
      'تصريح بيئي (إن وجد)',
      'نسخة من هوية المالك',
      'خطة الموقع والتخطيط'
    ],
    estimated_cost: 'OMR 200-800 (varies by business type and location)',
    estimated_duration: '3-6 weeks',
    renewal_required: 1,
    renewal_period: 'Annual',
    priority: 'critical',
    featured: 1,
    display_order: 2,
    status: 'published',
    published_at: new Date('2024-01-01').toISOString()
  },
  {
    title: 'Tax Registration (VAT)',
    title_ar: 'التسجيل الضريبي (ضريبة القيمة المضافة)',
    slug: 'vat-registration',
    category: 'tax',
    subcategory: 'Value Added Tax',
    applicable_industries: ['All Industries'],
    applicable_business_types: ['All business types with annual revenue exceeding threshold'],
    summary: 'VAT registration is mandatory for businesses with annual taxable supplies exceeding OMR 38,500. It enables you to charge VAT on sales and reclaim VAT on business purchases.',
    summary_ar: 'التسجيل في ضريبة القيمة المضافة إلزامي للشركات التي تتجاوز إمداداتها الخاضعة للضريبة السنوية 38,500 ريال عماني. يمكنك من فرض ضريبة القيمة المضافة على المبيعات واسترداد ضريبة القيمة المضافة على مشتريات الأعمال.',
    description: 'Value Added Tax (VAT) was introduced in Oman at a rate of 5% in April 2021. Businesses must register for VAT if their annual taxable supplies exceed OMR 38,500 (mandatory threshold) or OMR 19,250 (voluntary threshold). Once registered, you must charge 5% VAT on taxable supplies, file regular VAT returns, and maintain proper accounting records. The Oman Tax Authority (OTA) administers VAT compliance.',
    description_ar: 'تم تقديم ضريبة القيمة المضافة في عمان بمعدل 5٪ في أبريل 2021. يجب على الشركات التسجيل في ضريبة القيمة المضافة إذا تجاوزت إمداداتها الخاضعة للضريبة السنوية 38,500 ريال عماني (عتبة إلزامية) أو 19,250 ريال عماني (عتبة طوعية). بمجرد التسجيل، يجب عليك فرض ضريبة القيمة المضافة بنسبة 5٪ على الإمدادات الخاضعة للضريبة، وتقديم إقرارات ضريبة القيمة المضافة المنتظمة، والحفاظ على سجلات محاسبية مناسبة. تدير جهاز الضرائب العماني الامتثال لضريبة القيمة المضافة.',
    requirements: [
      { id: 1, text: 'Valid Commercial Registration', category: 'Legal' },
      { id: 2, text: 'Annual taxable supplies exceeding OMR 38,500 (or OMR 19,250 for voluntary)', category: 'Financial' },
      { id: 3, text: 'Proper accounting system to track VAT', category: 'Financial' },
      { id: 4, text: 'Bank account in Oman', category: 'Financial' },
      { id: 5, text: 'Authorized signatory with valid ID', category: 'Legal' }
    ],
    requirements_ar: [
      { id: 1, text: 'سجل تجاري ساري المفعول', category: 'قانوني' },
      { id: 2, text: 'إمدادات خاضعة للضريبة السنوية تتجاوز 38,500 ريال عماني (أو 19,250 ريال عماني للطوعي)', category: 'مالي' },
      { id: 3, text: 'نظام محاسبي مناسب لتتبع ضريبة القيمة المضافة', category: 'مالي' },
      { id: 4, text: 'حساب بنكي في عمان', category: 'مالي' },
      { id: 5, text: 'مفوض بالتوقيع بهوية سارية', category: 'قانوني' }
    ],
    issuing_authority: 'Oman Tax Authority (OTA)',
    issuing_authority_ar: 'جهاز الضرائب العماني',
    authority_website: 'https://tms.taxoman.gov.om',
    authority_contact: {
      phone: '+968 80077111',
      email: 'info@ota.gov.om',
      address: 'Oman Tax Authority, Muscat, Oman'
    },
    compliance_steps: [
      { 
        id: 1, 
        title: 'Determine VAT Liability', 
        description: 'Calculate your annual taxable supplies to determine if you meet the mandatory or voluntary threshold.',
        estimated_duration: '1 day',
        cost: 'Free'
      },
      { 
        id: 2, 
        title: 'Prepare Documentation', 
        description: 'Gather CR certificate, financial statements, bank details, and authorized signatory documents.',
        estimated_duration: '2-3 days',
        cost: 'Free'
      },
      { 
        id: 3, 
        title: 'Register on OTA Portal', 
        description: 'Create account on Oman Tax Authority\'s Tax Management System (TMS) portal.',
        estimated_duration: '1 day',
        cost: 'Free'
      },
      { 
        id: 4, 
        title: 'Submit VAT Application', 
        description: 'Complete online VAT registration form and upload required documents.',
        estimated_duration: '1 day',
        cost: 'Free'
      },
      { 
        id: 5, 
        title: 'Receive Tax Registration Number (TRN)', 
        description: 'OTA reviews application and issues TRN if approved. Display TRN on all tax invoices.',
        estimated_duration: '5-10 working days',
        cost: 'Free'
      },
      { 
        id: 6, 
        title: 'Implement VAT Compliance', 
        description: 'Update accounting system, train staff, and begin charging VAT on taxable supplies.',
        estimated_duration: '1-2 weeks',
        cost: 'Varies'
      }
    ],
    compliance_steps_ar: [
      { 
        id: 1, 
        title: 'تحديد المسؤولية الضريبية', 
        description: 'احسب إمداداتك الخاضعة للضريبة السنوية لتحديد ما إذا كنت تستوفي العتبة الإلزامية أو الطوعية.',
        estimated_duration: '1 يوم',
        cost: 'مجاني'
      },
      { 
        id: 2, 
        title: 'إعداد الوثائق', 
        description: 'اجمع شهادة السجل التجاري والبيانات المالية وتفاصيل البنك ووثائق المفوض بالتوقيع.',
        estimated_duration: '2-3 أيام',
        cost: 'مجاني'
      },
      { 
        id: 3, 
        title: 'التسجيل في بوابة جهاز الضرائب', 
        description: 'إنشاء حساب على بوابة نظام إدارة الضرائب (TMS) لجهاز الضرائب العماني.',
        estimated_duration: '1 يوم',
        cost: 'مجاني'
      },
      { 
        id: 4, 
        title: 'تقديم طلب ضريبة القيمة المضافة', 
        description: 'أكمل نموذج تسجيل ضريبة القيمة المضافة عبر الإنترنت وقم بتحميل المستندات المطلوبة.',
        estimated_duration: '1 يوم',
        cost: 'مجاني'
      },
      { 
        id: 5, 
        title: 'استلام رقم التسجيل الضريبي (TRN)', 
        description: 'يراجع جهاز الضرائب الطلب ويصدر رقم التسجيل الضريبي إذا تمت الموافقة. اعرض رقم التسجيل الضريبي على جميع الفواتير الضريبية.',
        estimated_duration: '5-10 أيام عمل',
        cost: 'مجاني'
      },
      { 
        id: 6, 
        title: 'تنفيذ الامتثال لضريبة القيمة المضافة', 
        description: 'حدّث نظام المحاسبة، ودرب الموظفين، وابدأ في فرض ضريبة القيمة المضافة على الإمدادات الخاضعة للضريبة.',
        estimated_duration: '1-2 أسابيع',
        cost: 'يختلف'
      }
    ],
    required_documents: [
      'Commercial Registration certificate',
      'Memorandum of Association',
      'Financial statements (last 12 months)',
      'Bank account details',
      'Copy of authorized signatory\'s ID',
      'Business address proof',
      'List of business activities'
    ],
    required_documents_ar: [
      'شهادة السجل التجاري',
      'عقد التأسيس',
      'البيانات المالية (آخر 12 شهرًا)',
      'تفاصيل الحساب البنكي',
      'نسخة من هوية المفوض بالتوقيع',
      'إثبات عنوان العمل',
      'قائمة الأنشطة التجارية'
    ],
    estimated_cost: 'Free (registration), but accounting system upgrades may cost OMR 500-2000',
    estimated_duration: '2-3 weeks',
    renewal_required: 0,
    renewal_period: 'N/A (but quarterly VAT returns required)',
    priority: 'high',
    featured: 1,
    display_order: 3,
    status: 'published',
    published_at: new Date('2024-01-01').toISOString()
  }
];

  for (const regulation of regulationsData) {
    await db.insert(schema.regulations).values(regulation);
    console.log(`  ✓ Added ${regulation.title}`);
  }
}

console.log('\n✅ Database seeding completed successfully!');

await connection.end();
