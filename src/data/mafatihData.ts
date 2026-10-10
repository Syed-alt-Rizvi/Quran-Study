export interface MafatihItem {
  id: string;
  titleArabic: string;
  titleEnglish: string;
  category: 'dua' | 'ziyarat' | 'munajat';
  description: string;
  benefits: string;
  recommendedTime: string;
  arabicExcerpt: string;
  englishExcerpt: string;
  audioReciter: string;
  audioUrl?: string;
}

export const MAFATIH_COLLECTION: MafatihItem[] = [
  {
    id: "dua-kumayl",
    titleArabic: "دعاء كميل",
    titleEnglish: "Dua Kumayl",
    category: "dua",
    description: "The renowned supplication taught by Imam Ali ibn Abi Talib (a.s) to his devoted companion Kumayl ibn Ziyad al-Nakha'i. It contains the deepest expressions of repentance and yearning for divine forgiveness.",
    benefits: "Protects against evil schemes of enemies, increases sustenance, and secures divine pardon for sins.",
    recommendedTime: "Every Thursday night (Eve of Friday) and the 15th night of Sha'ban.",
    arabicExcerpt: "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ، وَبِقُوَّتِكَ الَّتِي قَهَرْتَ بِهَا كُلَّ شَيْءٍ...",
    englishExcerpt: "O Allah, I beseech You by Your mercy which encompasses all things, and by Your power by which You have overcome all things...",
    audioReciter: "Hajj Aba Thar Al-Halawaji",
    audioUrl: "https://www.ya-mahdi.net/apps_audio/aba_thar/kumayal.m4a"
  },
  {
    id: "ziyarat-ashura",
    titleArabic: "زيارة عاشوراء",
    titleEnglish: "Ziyarat Ashura",
    category: "ziyarat",
    description: "The sacred salutation upon Imam Hussain (a.s) revealed as Hadith Qudsi through Imam Muhammad al-Baqir (a.s). It establishes loyalty (Tawalla) to the Ahlulbayt and disavowal (Tabarra) of their oppressors.",
    benefits: "Immense reward in the hereafter, fulfillment of legitimate worldly needs, and proximity to Imam al-Hussain (a.s).",
    recommendedTime: "Daily, and especially on the Day of Ashura and Arba'een.",
    arabicExcerpt: "السَّلاَمُ عَلَيْكَ يَا أَبَا عَبْدِ اللَّهِ، السَّلاَمُ عَلَيْكَ يَا ابْنَ رَسُولِ اللَّهِ، السَّلاَمُ عَلَيْكَ يَا خِيَرَةَ اللَّهِ وَابْنَ خِيَرَتِهِ...",
    englishExcerpt: "Peace be upon you, O Aba Abdillah! Peace be upon you, O son of the Messenger of Allah! Peace be upon you, O chosen of Allah and son of His chosen one...",
    audioReciter: "Hajj Mahdi Sedghi",
    audioUrl: "https://www.ya-mahdi.net/apps_audio/mahdi_sedghi/ashura_sedqi.m4a"
  },
  {
    id: "dua-tawassul",
    titleArabic: "دعاء التوسل",
    titleEnglish: "Dua Tawassul",
    category: "dua",
    description: "A poignant supplication invoking the intercession of the Holy Prophet (s.a.w.w) and the Twelve Infallible Imams (a.s) before Allah for the fulfillment of all needs.",
    benefits: "Swift resolution of severe afflictions, healing for illnesses, and divine assistance.",
    recommendedTime: "Tuesday nights and times of trial.",
    arabicExcerpt: "اللَّهُمَّ إِنِّي أَسْأَلُكَ وَأَتَوَجَّهُ إِلَيْكَ بِنَبِيِّكَ نَبِيِّ الرَّحْمَةِ مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَآلِهِ، يَا أَبَا الْقَاسِمِ...",
    englishExcerpt: "O Allah, I ask You and turn towards You through Your Prophet, the Prophet of Mercy, Muhammad (s.a.w.w)...",
    audioReciter: "Mohsin Farahmand",
    audioUrl: "https://www.ya-mahdi.net/apps_audio/mohsin_farahmad/tavassol_farahmand.m4a"
  },
  {
    id: "dua-al-ahd",
    titleArabic: "دعاء العهد",
    titleEnglish: "Dua al-Ahd",
    category: "dua",
    description: "The covenant supplication to Imam Mahdi (a.t.f.s), taught by Imam Ja'far al-Sadiq (a.s). Reciting it consecutively for 40 mornings counts one among the helpers of the Imam of Our Time.",
    benefits: "Revives the covenant with the living Imam and guarantees resurrection in his companionship.",
    recommendedTime: "Every morning after Fajr prayer.",
    arabicExcerpt: "اللَّهُمَّ رَبَّ النُّورِ الْعَظِيمِ، وَرَبَّ الْكُرْسِيِّ الرَّفِيعِ، وَرَبَّ الْبَحْرِ الْمَسْجُورِ، وَمُنْزِلَ التَّوْرَاةِ وَالإِنْجِيلِ وَالزَّبُورِ...",
    englishExcerpt: "O Allah, Lord of the Supreme Light, Lord of the Lofty Throne, Lord of the Raging Sea, and Revealer of the Torah, the Gospel, and the Psalms...",
    audioReciter: "Aba Thar Al-Halawaji",
    audioUrl: "https://www.ya-mahdi.net/apps_audio/aba_thar/ahd-abozarhalvaji128.m4a"
  },
  {
    id: "h-kisa",
    titleArabic: "حديث الكساء",
    titleEnglish: "Hadith al-Kisa",
    category: "dua",
    description: "The narration of the Cloak describing the gathering of the Prophet (s), Ali, Fatimah, Hasan, and Husayn (a.s) under the cloak, and the descent of Archangel Jibreel.",
    benefits: "Brings tranquility, banishes grief, repels hardship, and attracts divine mercy upon gatherings.",
    recommendedTime: "Family gatherings and Thursday evenings.",
    arabicExcerpt: "عَنْ فَاطِمَةَ الزَّهْرَاءِ عَلَيْهَا السَّلاَمُ بِنْتِ رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَآلِهِ قَالَتْ: دَخَلَ عَلَيَّ أَبِي رَسُولُ اللَّهِ فِي بَعْضِ الأَيَّامِ...",
    englishExcerpt: "From Fatimah al-Zahra, daughter of the Messenger of Allah, who said: One day, my father the Messenger of Allah visited me...",
    audioReciter: "Hajj Mahdi Mirdamad",
    audioUrl: "https://www.ya-mahdi.net/apps_audio/mahdi_mirdamad/kisa_mirdamad.m4a"
  },
  {
    id: "ziyarat-waritha",
    titleArabic: "زيارة وارث",
    titleEnglish: "Ziyarat Waritha",
    category: "ziyarat",
    description: "Revealed through Imam Ja'far al-Sadiq (a.s), this sacred visitation connects Imam Hussain's sacrifice directly with the entire prophetic legacy from Adam, Noah, Abraham, Moses, and Jesus (a.s).",
    benefits: "Bestows high spiritual ranks and confirms one's steadfastness on the divine covenant.",
    recommendedTime: "Thursdays, Fridays, and upon visiting the holy shrines.",
    arabicExcerpt: "السَّلاَمُ عَلَيْكَ يَا وَارِثَ آدَمَ صَفْوَةِ اللَّهِ، السَّلاَمُ عَلَيْكَ يَا وَارِثَ نُوحٍ نَبِيِّ اللَّهِ، السَّلاَمُ عَلَيْكَ يَا وَارِثَ إِبْرَاهِيمَ خَلِيلِ اللَّهِ...",
    englishExcerpt: "Peace be upon you, O inheritor of Adam, the chosen of Allah! Peace be upon you, O inheritor of Noah, the prophet of Allah! Peace be upon you, O inheritor of Abraham, the beloved friend of Allah...",
    audioReciter: "Mahdi Samavati",
    audioUrl: "https://www.ya-mahdi.net/apps_audio/mahdi_samavati/ziy_warisa_samavati.m4a"
  }
];
