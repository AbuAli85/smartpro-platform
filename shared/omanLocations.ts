/**
 * Oman Governorates and Cities
 * Bilingual data structure (English + Arabic)
 */

export interface City {
  value: string;
  labelEn: string;
  labelAr: string;
  governorate: string;
}

export interface Governorate {
  value: string;
  labelEn: string;
  labelAr: string;
}

export const OMAN_GOVERNORATES: Governorate[] = [
  { value: "Muscat", labelEn: "Muscat Governorate", labelAr: "محافظة مسقط" },
  { value: "Dhofar", labelEn: "Dhofar Governorate", labelAr: "محافظة ظفار" },
  { value: "Musandam", labelEn: "Musandam Governorate", labelAr: "محافظة مسندم" },
  { value: "Al Buraimi", labelEn: "Al Buraimi Governorate", labelAr: "محافظة البريمي" },
  { value: "Al Dakhiliyah", labelEn: "Al Dakhiliyah Governorate", labelAr: "محافظة الداخلية" },
  { value: "Al Batinah North", labelEn: "Al Batinah North Governorate", labelAr: "محافظة شمال الباطنة" },
  { value: "Al Batinah South", labelEn: "Al Batinah South Governorate", labelAr: "محافظة جنوب الباطنة" },
  { value: "Ash Sharqiyah North", labelEn: "Ash Sharqiyah North Governorate", labelAr: "محافظة شمال الشرقية" },
  { value: "Ash Sharqiyah South", labelEn: "Ash Sharqiyah South Governorate", labelAr: "محافظة جنوب الشرقية" },
  { value: "Ad Dhahirah", labelEn: "Ad Dhahirah Governorate", labelAr: "محافظة الظاهرة" },
  { value: "Al Wusta", labelEn: "Al Wusta Governorate", labelAr: "محافظة الوسطى" },
];

export const OMAN_CITIES: City[] = [
  // Muscat Governorate
  { value: "Muscat", labelEn: "Muscat", labelAr: "مسقط", governorate: "Muscat" },
  { value: "Muttrah", labelEn: "Muttrah", labelAr: "مطرح", governorate: "Muscat" },
  { value: "Bawshar", labelEn: "Bawshar", labelAr: "بوشر", governorate: "Muscat" },
  { value: "Seeb", labelEn: "Seeb", labelAr: "السيب", governorate: "Muscat" },
  { value: "Al Amrat", labelEn: "Al Amrat", labelAr: "العامرات", governorate: "Muscat" },
  { value: "Quriyat", labelEn: "Quriyat", labelAr: "قريات", governorate: "Muscat" },

  // Dhofar Governorate
  { value: "Salalah", labelEn: "Salalah", labelAr: "صلالة", governorate: "Dhofar" },
  { value: "Taqah", labelEn: "Taqah", labelAr: "طاقة", governorate: "Dhofar" },
  { value: "Mirbat", labelEn: "Mirbat", labelAr: "مرباط", governorate: "Dhofar" },
  { value: "Rakhyut", labelEn: "Rakhyut", labelAr: "رخيوت", governorate: "Dhofar" },

  // Musandam Governorate
  { value: "Khasab", labelEn: "Khasab", labelAr: "خصب", governorate: "Musandam" },
  { value: "Bukha", labelEn: "Bukha", labelAr: "بخا", governorate: "Musandam" },
  { value: "Dibba", labelEn: "Dibba", labelAr: "دبا", governorate: "Musandam" },
  { value: "Madha", labelEn: "Madha", labelAr: "مدحا", governorate: "Musandam" },

  // Al Buraimi Governorate
  { value: "Al Buraimi City", labelEn: "Al Buraimi", labelAr: "البريمي", governorate: "Al Buraimi" },
  { value: "Mahadah", labelEn: "Mahadah", labelAr: "محضة", governorate: "Al Buraimi" },
  { value: "As Sunaynah", labelEn: "As Sunaynah", labelAr: "السنينة", governorate: "Al Buraimi" },

  // Al Dakhiliyah Governorate
  { value: "Nizwa", labelEn: "Nizwa", labelAr: "نزوى", governorate: "Al Dakhiliyah" },
  { value: "Bahla", labelEn: "Bahla", labelAr: "بهلاء", governorate: "Al Dakhiliyah" },
  { value: "Manah", labelEn: "Manah", labelAr: "منح", governorate: "Al Dakhiliyah" },
  { value: "Adam", labelEn: "Adam", labelAr: "أدم", governorate: "Al Dakhiliyah" },
  { value: "Al Hamra", labelEn: "Al Hamra", labelAr: "الحمراء", governorate: "Al Dakhiliyah" },
  { value: "Izki", labelEn: "Izki", labelAr: "إزكي", governorate: "Al Dakhiliyah" },

  // Al Batinah North Governorate
  { value: "Sohar", labelEn: "Sohar", labelAr: "صحار", governorate: "Al Batinah North" },
  { value: "Shinas", labelEn: "Shinas", labelAr: "شناص", governorate: "Al Batinah North" },
  { value: "Liwa", labelEn: "Liwa", labelAr: "لوى", governorate: "Al Batinah North" },
  { value: "Saham", labelEn: "Saham", labelAr: "صحم", governorate: "Al Batinah North" },
  { value: "Al Khaburah", labelEn: "Al Khaburah", labelAr: "الخابورة", governorate: "Al Batinah North" },
  { value: "As Suwayq", labelEn: "As Suwayq", labelAr: "السويق", governorate: "Al Batinah North" },

  // Al Batinah South Governorate
  { value: "Rustaq", labelEn: "Rustaq", labelAr: "الرستاق", governorate: "Al Batinah South" },
  { value: "Barka", labelEn: "Barka", labelAr: "بركاء", governorate: "Al Batinah South" },
  { value: "Al Musanaah", labelEn: "Al Musanaah", labelAr: "المصنعة", governorate: "Al Batinah South" },
  { value: "Wadi Al Maawil", labelEn: "Wadi Al Maawil", labelAr: "وادي المعاول", governorate: "Al Batinah South" },
  { value: "Nakhal", labelEn: "Nakhal", labelAr: "نخل", governorate: "Al Batinah South" },
  { value: "Awabi", labelEn: "Awabi", labelAr: "العوابي", governorate: "Al Batinah South" },

  // Ash Sharqiyah North Governorate
  { value: "Sur", labelEn: "Sur", labelAr: "صور", governorate: "Ash Sharqiyah North" },
  { value: "Ibra", labelEn: "Ibra", labelAr: "إبراء", governorate: "Ash Sharqiyah North" },
  { value: "Al Mudhaibi", labelEn: "Al Mudhaibi", labelAr: "المضيبي", governorate: "Ash Sharqiyah North" },
  { value: "Al Qabil", labelEn: "Al Qabil", labelAr: "القابل", governorate: "Ash Sharqiyah North" },
  { value: "Wadi Bani Khalid", labelEn: "Wadi Bani Khalid", labelAr: "وادي بني خالد", governorate: "Ash Sharqiyah North" },
  { value: "Dima Wa Tayyin", labelEn: "Dima Wa Tayyin", labelAr: "دماء والطائيين", governorate: "Ash Sharqiyah North" },

  // Ash Sharqiyah South Governorate
  { value: "Samail", labelEn: "Samail", labelAr: "سمائل", governorate: "Ash Sharqiyah South" },
  { value: "Al Kamil Wa Al Wafi", labelEn: "Al Kamil Wa Al Wafi", labelAr: "الكامل والوافي", governorate: "Ash Sharqiyah South" },
  { value: "Jalan Bani Bu Hassan", labelEn: "Jalan Bani Bu Hassan", labelAr: "جعلان بني بو حسن", governorate: "Ash Sharqiyah South" },
  { value: "Jalan Bani Bu Ali", labelEn: "Jalan Bani Bu Ali", labelAr: "جعلان بني بو علي", governorate: "Ash Sharqiyah South" },
  { value: "Masirah", labelEn: "Masirah", labelAr: "مصيرة", governorate: "Ash Sharqiyah South" },

  // Ad Dhahirah Governorate
  { value: "Ibri", labelEn: "Ibri", labelAr: "عبري", governorate: "Ad Dhahirah" },
  { value: "Yanqul", labelEn: "Yanqul", labelAr: "ينقل", governorate: "Ad Dhahirah" },
  { value: "Dhank", labelEn: "Dhank", labelAr: "ضنك", governorate: "Ad Dhahirah" },

  // Al Wusta Governorate
  { value: "Haima", labelEn: "Haima", labelAr: "هيماء", governorate: "Al Wusta" },
  { value: "Mahout", labelEn: "Mahout", labelAr: "محوت", governorate: "Al Wusta" },
  { value: "Ad Duqm", labelEn: "Ad Duqm", labelAr: "الدقم", governorate: "Al Wusta" },
  { value: "Al Jazir", labelEn: "Al Jazir", labelAr: "الجازر", governorate: "Al Wusta" },
];

/**
 * Get cities for a specific governorate
 */
export function getCitiesByGovernorate(governorateValue: string): City[] {
  return OMAN_CITIES.filter(city => city.governorate === governorateValue);
}

/**
 * Get bilingual label for display
 */
export function getBilingualLabel(labelEn: string, labelAr: string): string {
  return `${labelEn} - ${labelAr}`;
}
