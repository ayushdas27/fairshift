export type Language = 'en' | 'hi' | 'bn';

export interface Translations {
  appName: string;
  tagline: string;
  adminConsole: string;
  workerPortal: string;
  loginTitle: string;
  loginSubtitle: string;
  workEmailOrId: string;
  siteCode: string;
  password: string;
  pinOrPassword: string;
  signInAdmin: string;
  signInWorker: string;
  anonymousGuarantee: string;
  quickShiftHelp: string;
  liveClock: string;
  overview: string;
  workforce: string;
  attendance: string;
  payroll: string;
  safetyReports: string;
  reports: string;
  home: string;
  earnings: string;
  reportIssue: string;
  feedback: string;
  mySkills: string;
  language: string;
  logout: string;
  activeTelemetry: string;
  shiftStatus: string;
  activeAndInStation: string;
  clockedOut: string;
  elapsedTime: string;
  mandatoryBreak: string;
  clockIn: string;
  clockOut: string;
  swapShift: string;
  transparentLedger: string;
  grossEarnings: string;
  netPayable: string;
  nextPayout: string;
  rateClassification: string;
  baseHourly: string;
  overtime15x: string;
  hours: string;
  calculated: string;
  reportCategory: string;
  describeIssue: string;
  voiceInput: string;
  listening: string;
  submitConfidential: string;
  submitAnonymous: string;
  trackingNumber: string;
  trackingSecret: string;
  trackCase: string;
  status: string;
  skillPassport: string;
  verified: string;
  pending: string;
  exportPassport: string;
  fatigueWarning: string;
  mandatoryRest: string;
  zoomLevel: string;
  systemOperational: string;
  zeroBiasAudited: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "FairShift",
    tagline: "Fairer work. Safer workplaces. Greater transparency.",
    adminConsole: "Admin Console",
    workerPortal: "Worker Portal",
    loginTitle: "Welcome to FairShift",
    loginSubtitle: "Fairer work. Safer workplaces. Greater transparency.",
    workEmailOrId: "Work Email or Admin ID",
    siteCode: "Site / Org Code",
    password: "Master Passphrase",
    pinOrPassword: "Shift Access PIN / Password",
    signInAdmin: "Sign in to Admin Console",
    signInWorker: "Sign in to Worker Portal",
    anonymousGuarantee: "Anonymous logging & wage protection guaranteed under FairShift Standard.",
    quickShiftHelp: "Kiosk Shift Access Node Active",
    liveClock: "Live Shift Telemetry",
    overview: "Overview",
    workforce: "Workforce",
    attendance: "Attendance",
    payroll: "Payroll",
    safetyReports: "Safety Reports",
    reports: "Reports",
    home: "Home",
    earnings: "Earnings",
    reportIssue: "Report an Issue",
    feedback: "Feedback",
    mySkills: "My Skills",
    language: "Language",
    logout: "Logout",
    activeTelemetry: "Active Telemetry",
    shiftStatus: "Shift Status",
    activeAndInStation: "Active & In-Station",
    clockedOut: "Shift Concluded / Off-Duty",
    elapsedTime: "Active Elapsed Time",
    mandatoryBreak: "Mandatory Break Window",
    clockIn: "Clock In (Verify QR)",
    clockOut: "Clock Out / End Shift",
    swapShift: "Swap Shift",
    transparentLedger: "Zero-Bias Transparent Ledger",
    grossEarnings: "Gross Accrued Earnings",
    netPayable: "Net Payable Amount",
    nextPayout: "Next Payout Date",
    rateClassification: "Rate Classification",
    baseHourly: "Base Hourly",
    overtime15x: "Overtime (1.5x Multiplier)",
    hours: "Hours",
    calculated: "Calculated",
    reportCategory: "Report Category",
    describeIssue: "Describe hazard or workplace issue...",
    voiceInput: "Tap to Speak (Voice)",
    listening: "Listening... speak now",
    submitConfidential: "Submit Confidential Report",
    submitAnonymous: "Submit Anonymous (Zero-Identity)",
    trackingNumber: "Tracking Reference",
    trackingSecret: "Secret Key",
    trackCase: "Track Existing Case",
    status: "Status",
    skillPassport: "Portable Skill Passport",
    verified: "Charter Verified",
    pending: "Pending Review",
    exportPassport: "Export Skill Passport (JSON)",
    fatigueWarning: "Fatigue Risk Alert",
    mandatoryRest: "Mandatory Rest Window",
    zoomLevel: "Zoom",
    systemOperational: "System Operational",
    zeroBiasAudited: "Zero-Bias Audited"
  },
  hi: {
    appName: "फेयरशिफ्ट (FairShift)",
    tagline: "न्यायसंगत कार्य। सुरक्षित कार्यस्थल। पूर्ण पारदर्शिता।",
    adminConsole: "प्रशासन कंसोल",
    workerPortal: "श्रमिक पोर्टल",
    loginTitle: "फेयरशिफ्ट में आपका स्वागत है",
    loginSubtitle: "न्यायसंगत कार्य। सुरक्षित कार्यस्थल। पूर्ण पारदर्शिता।",
    workEmailOrId: "कार्य ईमेल या कर्मचारी आईडी",
    siteCode: "साइट / संस्था कोड",
    password: "पासवर्ड",
    pinOrPassword: "शिफ्ट पिन या पासवर्ड",
    signInAdmin: "प्रशासक पोर्टल में लॉगिन करें",
    signInWorker: "श्रमिक पोर्टल में प्रवेश करें",
    anonymousGuarantee: "फेयरशिफ्ट मानक के तहत पहचान सुरक्षा और पारदर्शी वेतन की गारंटी।",
    quickShiftHelp: "कियोस्क शिफ्ट नोड सक्रिय है",
    liveClock: "लाइव शिफ्ट टेलीमेट्री",
    overview: "अवलोकन (Overview)",
    workforce: "कर्मचारी दल (Workforce)",
    attendance: "उपस्थिति (Attendance)",
    payroll: "वेतन पर्ची (Payroll)",
    safetyReports: "सुरक्षा रिपोर्ट (Safety)",
    reports: "विश्लेषण रिपोर्ट",
    home: "मुख्य पृष्ठ (Home)",
    earnings: "मेरी कमाई (Earnings)",
    reportIssue: "समस्या दर्ज करें",
    feedback: "सुझाव / प्रतिक्रिया",
    mySkills: "मेरे कौशल (Skills)",
    language: "भाषा (Language)",
    logout: "लॉगआउट",
    activeTelemetry: "सक्रिय टेलीमेट्री",
    shiftStatus: "शिफ्ट स्थिति",
    activeAndInStation: "ड्यूटी पर सक्रिय",
    clockedOut: "शिफ्ट समाप्त / विश्राम",
    elapsedTime: "कुल बीता हुआ समय",
    mandatoryBreak: "अनिवार्य विश्राम अंतराल",
    clockIn: "चेक-इन (QR सत्यापित करें)",
    clockOut: "चेक-आउट / शिफ्ट समाप्त करें",
    swapShift: "शिफ्ट बदलें",
    transparentLedger: "पारदर्शी वेतन बहीखाता",
    grossEarnings: "सकल अर्जित आय",
    netPayable: "शुद्ध देय राशि",
    nextPayout: "अगली भुगतान तिथि",
    rateClassification: "वेतन दर श्रेणी",
    baseHourly: "मूल प्रति घंटा दर",
    overtime15x: "अतिरिक्त समय (1.5x दर)",
    hours: "घंटे",
    calculated: "गणना की गई",
    reportCategory: "शिकायत श्रेणी",
    describeIssue: "खतरा या समस्या का विवरण लिखें...",
    voiceInput: "बोलकर दर्ज करें (आवाज)",
    listening: "सुन रहे हैं... कृपया बोलें",
    submitConfidential: "गोपनीय रिपोर्ट दर्ज करें",
    submitAnonymous: "अनाम रिपोर्ट दर्ज करें (पूर्ण गोपनीयता)",
    trackingNumber: "ट्रैकिंग संदर्भ संख्या",
    trackingSecret: "सुरक्षा कुंजी (Secret Key)",
    trackCase: "स्थिति देखें (Track)",
    status: "स्थिति",
    skillPassport: "पोर्टेबल कौशल पासपोर्ट",
    verified: "प्रमाणित",
    pending: "सत्यापन लंबित",
    exportPassport: "कौशल पासपोर्ट निर्यात करें",
    fatigueWarning: "थकान जोखिम चेतावनी",
    mandatoryRest: "अनिवार्य विश्राम अंतराल",
    zoomLevel: "ज़ूम",
    systemOperational: "प्रणाली सक्रिय",
    zeroBiasAudited: "पक्षपात-रहित ऑडिटेड"
  },
  bn: {
    appName: "ফেয়ারশিফট (FairShift)",
    tagline: "ন্যায়সঙ্গত কাজ। নিরাপদ কর্মক্ষেত্র। পরম স্বচ্ছতা।",
    adminConsole: "অ্যাডমিন কনসোল",
    workerPortal: "শ্রমিক পোর্টাল",
    loginTitle: "ফেয়ারশিফটে স্বাগতম",
    loginSubtitle: "ন্যায়সঙ্গত কাজ। নিরাপদ কর্মক্ষেত্র। পরম স্বচ্ছতা।",
    workEmailOrId: "কাজের ইমেল বা কর্মী আইডি",
    siteCode: "সাইট / প্রতিষ্ঠান কোড",
    password: "পাসওয়ার্ড",
    pinOrPassword: "শিফট পিন বা পাসওয়ার্ড",
    signInAdmin: "অ্যাডমিন পোর্টালে প্রবেশ করুন",
    signInWorker: "শ্রমিক পোর্টালে লগইন করুন",
    anonymousGuarantee: "ফেয়ারশিফট মানের অধীনে পরিচয় গোপনীয়তা এবং ন্যায্য বেতনের নিশ্চয়তা।",
    quickShiftHelp: "কিয়স্ক শিফট নোড সক্রিয়",
    liveClock: "লাইভ শিফট তথ্য",
    overview: "সংক্ষিপ্ত বিবরণ",
    workforce: "কর্মী দল (Workforce)",
    attendance: "উপস্থিতি (Attendance)",
    payroll: "বেতন বিবরণী (Payroll)",
    safetyReports: "নিরাপত্তা রিপোর্ট",
    reports: "প্রতিবেদন",
    home: "মূল পাতা (Home)",
    earnings: "আমার উপার্জন (Earnings)",
    reportIssue: "অভিযোগ জানান",
    feedback: "মতামত (Feedback)",
    mySkills: "আমার দক্ষতা (Skills)",
    language: "ভাষা (Language)",
    logout: "লগআউট",
    activeTelemetry: "সক্রিয় টেলিমিতি",
    shiftStatus: "শিফটের অবস্থা",
    activeAndInStation: "ডিউটিতে সক্রিয়",
    clockedOut: "শিফট সমাপ্ত / ডিউটি শেষ",
    elapsedTime: "মোট অতিবাহিত সময়",
    mandatoryBreak: "বাধ্যতামূলক বিরতি সময়",
    clockIn: "ক্লক-ইন (QR যাচাই)",
    clockOut: "ক্লক-আউট / শিফট শেষ",
    swapShift: "শিফট পরিবর্তন",
    transparentLedger: "স্বচ্ছ বেতন খতিয়ান",
    grossEarnings: "মোট অর্জিত আয়",
    netPayable: "প্রদেয় নিট বেতন",
    nextPayout: "পরবর্তী অর্থপ্রদানের তারিখ",
    rateClassification: "বেতন হারের শ্রেণীবিভাগ",
    baseHourly: "মূল ঘণ্টাপ্রতি হার",
    overtime15x: "অতিরিক্ত সময় (১.৫ গুণ হার)",
    hours: "ঘণ্টা",
    calculated: "গণনাকৃত",
    reportCategory: "অভিযোগের ধরন",
    describeIssue: "বিপদ বা সমস্যা সম্পর্কে লিখুন...",
    voiceInput: "মুখে বলে লিখুন (ভয়েস)",
    listening: "শুনছি... এখন কথা বলুন",
    submitConfidential: "গোপনীয় রিপোর্ট জমা দিন",
    submitAnonymous: "বেনামী রিপোর্ট জমা দিন (পরিচয়হীন)",
    trackingNumber: "ট্র্যাকিং নম্বর",
    trackingSecret: "গোপন চাবি (Secret Key)",
    trackCase: "কেস ট্র্যাক করুন",
    status: "অবস্থা",
    skillPassport: "পোর্টেবল দক্ষতা পাসপোর্ট",
    verified: "যাচাইকৃত",
    pending: "পর্যালোচনাধীন",
    exportPassport: "দক্ষতা পাসপোর্ট ডাউনলোড",
    fatigueWarning: "ক্লান্তি ঝুঁকি সতর্কতা",
    mandatoryRest: "বাধ্যতামূলক বিশ্রামের সময়",
    zoomLevel: "জুম",
    systemOperational: "সিস্টেম সক্রিয়",
    zeroBiasAudited: "নিরপেক্ষভাবে নিরীক্ষিত"
  }
};
