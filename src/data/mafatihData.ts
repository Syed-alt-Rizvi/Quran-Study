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
    audioReciter: "Hajj Basim Karbalaei / Sayed Hani Al-Musawi",
    audioUrl: "https://media.blubrry.com/al_islam/traffic.libsyn.com/shiavoice/Dua_Kumayl.mp3"
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
    audioReciter: "Hajj Maytham Al-Tammar",
    audioUrl: "https://media.blubrry.com/al_islam/traffic.libsyn.com/shiavoice/Ziyarat_Ashura.mp3"
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
    audioReciter: "Sayed Walid Mazidi",
    audioUrl: "https://media.blubrry.com/al_islam/traffic.libsyn.com/shiavoice/Dua_Tawassul.mp3"
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
    audioReciter: "Sayed Hani Al-Musawi",
    audioUrl: "https://media.blubrry.com/al_islam/traffic.libsyn.com/shiavoice/Dua_Ahd.mp3"
  },
  {
    id: "munajat-amiralmuminin",
    titleArabic: "مناجاة أمير المؤمنين في الكوفة",
    titleEnglish: "Munajat of Imam Ali in Kufa",
    category: "munajat",
    description: "The intimate whispered prayer recited by Commander of the Faithful Ali (a.s) in the Great Mosque of Kufa, juxtaposing human frailty with divine sovereignty.",
    benefits: "Induces profound humility, eases spiritual constriction, and draws down divine tenderness.",
    recommendedTime: "During night vigil (Salat al-Layl) and spiritual solitude.",
    arabicExcerpt: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الأَمَانَ يَوْمَ لا يَنْفَعُ مَالٌ وَلا بَنُونَ إِلا مَنْ أَتَى اللَّهَ بِقَلْبٍ سَلِيمٍ...",
    englishExcerpt: "O Allah, I ask You for safety on the day when neither wealth nor sons shall avail, save him who comes to Allah with a serene heart...",
    audioReciter: "Sheikh Husain Al-Akraf",
    audioUrl: "https://media.blubrry.com/al_islam/traffic.libsyn.com/shiavoice/Munajat_Kufa.mp3"
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
    audioReciter: "Hajj Amer Al-Kadhimi",
    audioUrl: "https://media.blubrry.com/al_islam/traffic.libsyn.com/shiavoice/Ziyarat_Waritha.mp3"
  }
];
