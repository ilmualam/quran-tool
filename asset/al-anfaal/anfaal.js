
// =================================================================
// SURAH AL-ANFAAL INTERACTIVE TOOL - ILMUALAM.COM
// Domain Protection: ilmualam.com & blogspot variants only
// Version: 2.0 - Battle Strategy Edition with Thematic Navigation
// =================================================================

(function() {
'use strict';

// Domain Protection
const allowedDomains = [
'ilmualam.com',
'blogger.com',
'localhost',
'127.0.0.1'
];

const currentDomain = window.location.hostname;
const isDomainAllowed = allowedDomains.some(domain =>
currentDomain.includes(domain) || currentDomain === domain
);

if (!isDomainAllowed) {
console.warn('Tool dihalang: Domain tidak dibenarkan');
document.getElementById('surahAnfaalTool').innerHTML =
'<div style="padding:20px;background:#fee;border:2px solid #c00;border-radius:8px;text-align:center;">' +
'<strong>⚠️ Tool ini hanya boleh digunakan di ilmualam.com</strong></div>';
return;
}

// =================================================================
// SURAH AL-ANFAAL DATA - 75 AYAT
// =================================================================

const surahData = {
name: "Al-Anfaal",
nameArabic: "الأنفال",
number: 8,
totalVerses: 75,
revelation: "Madaniyyah",
themes: [
{ id: "ghanimah", name: "Ghanimah (War Spoils)", color: "#ffd700" },
{ id: "strategy", name: "Military Strategy", color: "#ff6b6b" },
{ id: "unity", name: "Unity & Leadership", color: "#4ecdc4" },
{ id: "battle", name: "Battle of Badr", color: "#95e1d3" },
{ id: "ethics", name: "War Ethics", color: "#a8e6cf" }
],
battleTimeline: [
{ event: "Intel: Abu Sufyan's Caravan", day: -14 },
{ event: "Muslim Mobilization (313 fighters)", day: -10 },
{ event: "Quraisy Army Departs (1,000 fighters)", day: -7 },
{ event: "Shura: Decision to Engage", day: -2 },
{ event: "Arrival at Badr Valley", day: -1 },
{ event: "Battle Day - 17 Ramadan 2H", day: 0 },
{ event: "Decisive Muslim Victory", day: 0 },
{ event: "Surah Al-Anfaal Revealed", day: 3 }
],
verses: [
// Ayat 1-10: Pembukaan & Ghanimah
{ number: 1, arabic: "يَسْـَٔلُونَكَ عَنِ ٱلْأَنفَالِ ۖ قُلِ ٱلْأَنفَالُ لِلَّهِ وَٱلرَّسُولِ ۖ فَٱتَّقُوا۟ ٱللَّهَ وَأَصْلِحُوا۟ ذَاتَ بَيْنِكُمْ ۖ وَأَطِيعُوا۟ ٱللَّهَ وَرَسُولَهُۥٓ إِن كُنتُم مُّؤْمِنِينَ", transliteration: "Yas'alūnaka 'ani-l-anfāl, quli-l-anfālu lillāhi wa-r-rasūl, fa-ttaqullāha wa aṣliḥū ẓāta baynikum wa aṭī'ullāha wa rasūlahū in kuntum mu'minīn", translation: "Mereka bertanya kepadamu (Muhammad) tentang harta rampasan perang. Katakanlah, 'Harta rampasan perang itu kepunyaan Allah dan Rasul, maka bertakwalah kepada Allah dan perbaikilah hubungan di antara sesamamu, dan taatlah kepada Allah dan Rasul-Nya jika kamu orang-orang yang beriman.'", theme: ["ghanimah", "unity"] },

{ number: 2, arabic: "إِنَّمَا ٱلْمُؤْمِنُونَ ٱلَّذِينَ إِذَا ذُكِرَ ٱللَّهُ وَجِلَتْ قُلُوبُهُمْ وَإِذَا تُلِيَتْ عَلَيْهِمْ ءَايَـٰتُهُۥ زَادَتْهُمْ إِيمَـٰنًۭا وَعَلَىٰ رَبِّهِمْ يَتَوَكَّلُونَ", transliteration: "Innama-l-mu'minūna-llaẓīna iẓā ẓukira-llāhu wajilat qulūbuhum wa iẓā tuliyat 'alayhim āyātuhū zādat​hum īmānā wa 'alā rabbihim yatawakkalūn", translation: "Sesungguhnya orang-orang yang beriman itu adalah mereka yang apabila disebut nama Allah bergetarlah hati mereka, dan apabila dibacakan kepada mereka ayat-ayat-Nya bertambahlah iman mereka, dan kepada Tuhan mereka bertawakkal.", theme: ["unity"] },

{ number: 17, arabic: "فَلَمْ تَقْتُلُوهُمْ وَلَـٰكِنَّ ٱللَّهَ قَتَلَهُمْ ۚ وَمَا رَمَيْتَ إِذْ رَمَيْتَ وَلَـٰكِنَّ ٱللَّهَ رَمَىٰ", transliteration: "Fa lam taqtulūhum wa lākinna-llāha qatalahum, wa mā ramayta iẓ ramayta wa lākinna-llāha ramā", translation: "Maka (yang sebenarnya) bukan kamu yang membunuh mereka, tetapi Allah-lah yang membunuh mereka, dan bukan engkau yang melempar ketika engkau melempar, tetapi Allah-lah yang melempar.", theme: ["battle", "strategy"] },

{ number: 41, arabic: "وَٱعْلَمُوٓا۟ أَنَّمَا غَنِمْتُم مِّن شَىْءٍۢ فَأَنَّ لِلَّهِ خُمُسَهُۥ وَلِلرَّسُولِ وَلِذِى ٱلْقُرْبَىٰ وَٱلْيَتَـٰمَىٰ وَٱلْمَسَـٰكِينِ وَٱبْنِ ٱلسَّبِيلِ", transliteration: "Wa-'lamū annamā ghanimtum min shay'in fa-anna lillāhi khumusahū wa li-r-rasūli wa li-ẓi-l-qurbā wa-l-yatāmā wa-l-masākīni wa-bni-s-sabīl", translation: "Dan ketahuilah, sesungguhnya apa saja yang dapat kamu peroleh sebagai rampasan perang, maka seperlima untuk Allah, Rasul, kerabat Rasul, anak yatim, orang miskin dan ibnu sabil.", theme: ["ghanimah"] },

{ number: 45, arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِذَا لَقِيتُمْ فِئَةًۭ فَٱثْبُتُوا۟ وَٱذْكُرُوا۟ ٱللَّهَ كَثِيرًۭا لَّعَلَّكُمْ تُفْلِحُونَ", transliteration: "Yā ayyuha-llaẓīna āmanū iẓā laqītum fi'atan fa-thbutū wa-ẓkuru​llāha kathīral la'allakum tufliḥūn", translation: "Wahai orang-orang yang beriman, apabila kamu memerangi pasukan (musuh), maka berteguh hatilah dan sebutlah (nama) Allah sebanyak-banyaknya agar kamu beruntung.", theme: ["battle", "strategy"] },

{ number: 46, arabic: "وَأَطِيعُوا۟ ٱللَّهَ وَرَسُولَهُۥ وَلَا تَنَـٰزَعُوا۟ فَتَفْشَلُوا۟ وَتَذْهَبَ رِيحُكُمْ ۖ وَٱصْبِرُوٓا۟ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ", transliteration: "Wa aṭī'ullāha wa rasūlahū wa lā tanāza'ū fa-tafshalū wa taẓhaba rīḥukum, wa-ṣbirū inna-llāha ma'a-ṣ-ṣābirīn", translation: "Dan taatlah kepada Allah dan Rasul-Nya, dan janganlah kamu berselisih, yang menyebabkan kamu menjadi gentar dan hilang kekuatanmu, dan bersabarlah. Sesungguhnya Allah beserta orang-orang yang sabar.", theme: ["unity", "strategy"] },

{ number: 58, arabic: "وَإِمَّا تَخَافَنَّ مِن قَوْمٍ خِيَانَةًۭ فَٱنۢبِذْ إِلَيْهِمْ عَلَىٰ سَوَآءٍ ۚ إِنَّ ٱللَّهَ لَا يُحِبُّ ٱلْخَآئِنِينَ", transliteration: "Wa immā takhāfanna min qawmin khiyānatan fa-nbiz ilayhim 'alā sawā', inna-llāha lā yuḥibbu-l-khā'inīn", translation: "Dan jika kamu khawatir akan (terjadinya) pengkhianatan dari suatu golongan, maka kembalikanlah perjanjian itu kepada mereka dengan cara yang jujur. Sesungguhnya Allah tidak menyukai orang-orang yang berkhianat.", theme: ["ethics"] },

{ number: 60, arabic: "وَأَعِدُّوا۟ لَهُم مَّا ٱسْتَطَعْتُم مِّن قُوَّةٍۢ وَمِن رِّبَاطِ ٱلْخَيْلِ تُرْهِبُونَ بِهِۦ عَدُوَّ ٱللَّهِ وَعَدُوَّكُمْ", transliteration: "Wa a'iddū lahum ma-staaṭa'tum min quwwatin wa mir ribāṭi-l-khayli turhbūna bihī 'aduwwa-llāhi wa 'aduwwakum", translation: "Dan siapkanlah untuk (menghadapi) mereka kekuatan apa saja yang kamu mampu dan dari pasukan berkuda yang dapat menggentarkan musuh Allah, musuhmu dan orang-orang selain mereka.", theme: ["strategy", "ethics"] },

{ number: 61, arabic: "وَإِن جَنَحُوا۟ لِلسَّلْمِ فَٱجْنَحْ لَهَا وَتَوَكَّلْ عَلَى ٱللَّهِ ۚ إِنَّهُۥ هُوَ ٱلسَّمِيعُ ٱلْعَلِيمُ", transliteration: "Wa in janaḥū li-s-salmi fa-jnaḥ lahā wa tawakkal 'ala-llāh, innahū huwa-s-samī'u-l-'alīm", translation: "Dan jika mereka condong kepada perdamaian, maka condonglah kepada perdamaian itu dan bertawakkallah kepada Allah. Sungguh, Dialah Yang Maha Mendengar, Maha Mengetahui.", theme: ["ethics"] },

// Placeholder untuk remaining 66 ayat - dalam production, semua 75 akan di-encode
{ number: 75, arabic: "وَٱلَّذِينَ ءَامَنُوا۟ مِنۢ بَعْدُ وَهَاجَرُوا۟ وَجَـٰهَدُوا۟ مَعَكُمْ فَأُو۟لَـٰٓئِكَ مِنكُمْ", transliteration: "Wa-llaẓīna āmanū mim ba'du wa hājarū wa jāhadū ma'akum fa-ulā'ika minkum", translation: "Dan orang-orang yang beriman setelah itu, lalu berhijrah dan berjihad bersamamu, maka mereka itu termasuk golonganmu.", theme: ["unity"] }
]
};

// =================================================================
// STORAGE & STATE MANAGEMENT
// =================================================================

const STORAGE_KEY = 'surahAnfaal_progress';
const NOTES_KEY = 'surahAnfaal_notes';

let state = {
currentVerse: 1,
completedVerses: new Set(),
verseNotes: {},
isPlaying: false,
audioElement: null,
currentMode: 'full', // 'full' or 'theme'
selectedTheme: 'all',
showBattleMap: false,
playbackSpeed: 1.0,
darkMode: false
};

function loadProgress() {
try {
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
const data = JSON.parse(saved);
state.completedVerses = new Set(data.completed || []);
}

const notes = localStorage.getItem(NOTES_KEY);
if (notes) {
state.verseNotes = JSON.parse(notes);
}
} catch (e) {
console.error('Error loading progress:', e);
}
}

function saveProgress() {
try {
localStorage.setItem(STORAGE_KEY, JSON.stringify({
completed: Array.from(state.completedVerses),
lastUpdated: new Date().toISOString()
}));

localStorage.setItem(NOTES_KEY, JSON.stringify(state.verseNotes));
} catch (e) {
console.error('Error saving progress:', e);
}
}

// =================================================================
// UI RENDERING
// =================================================================

function render() {
const container = document.getElementById('surahAnfaalTool');

const progress = (state.completedVerses.size / surahData.totalVerses * 100).toFixed(1);
const estimatedTime = ((surahData.totalVerses - state.completedVerses.size) * 2);

const html = `
<div class="anfaal-tool" style="
background: ${state.darkMode ? '#1a1a1a' : 'linear-gradient(135deg, #f0f9f4 0%, #ffffff 100%)'};
border-radius: 16px;
padding: 30px;
box-shadow: 0 8px 32px rgba(36, 151, 73, 0.15);
margin: 20px 0;
font-family: 'Segoe UI', Tahoma, sans-serif;
color: ${state.darkMode ? '#e0e0e0' : '#333'};
">
<!-- HEADER -->
<div style="text-align: center; margin-bottom: 30px;">
<h2 style="color: #0c3808; font-size: 2.2em; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
${surahData.nameArabic}
</h2>
<p style="color: #249749; font-size: 1.3em; margin: 5px 0;">
${surahData.name} - ${surahData.totalVerses} Ayat (${surahData.revelation})
</p>
<p style="color: #666; font-size: 0.95em; margin-top: 10px;">
⚔️ Battle of Badr | 📜 War Spoils | 🎯 Leadership Strategy
</p>
</div>

<!-- PROGRESS DASHBOARD -->
<div style="
background: ${state.darkMode ? '#2a2a2a' : 'white'};
border-radius: 12px;
padding: 20px;
margin-bottom: 25px;
border: 2px solid #249749;
">
<div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
<div style="flex: 1; min-width: 120px;">
<div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">Progress</div>
<div style="font-size: 1.8em; font-weight: bold; color: #249749;">
${state.completedVerses.size}/${surahData.totalVerses}
</div>
</div>
<div style="flex: 1; min-width: 120px;">
<div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">Completion</div>
<div style="font-size: 1.8em; font-weight: bold; color: #0c3808;">
${progress}%
</div>
</div>
<div style="flex: 1; min-width: 120px;">
<div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">Est. Time</div>
<div style="font-size: 1.8em; font-weight: bold; color: #249749;">
${Math.floor(estimatedTime / 60)}h ${estimatedTime % 60}m
</div>
</div>
<div style="flex: 1; min-width: 120px;">
<div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">Notes</div>
<div style="font-size: 1.8em; font-weight: bold; color: #0c3808;">
${Object.keys(state.verseNotes).length}
</div>
</div>
</div>

<div style="
width: 100%;
height: 12px;
background: #e0e0e0;
border-radius: 6px;
margin-top: 15px;
overflow: hidden;
">
<div style="
width: ${progress}%;
height: 100%;
background: linear-gradient(90deg, #249749, #0c3808);
transition: width 0.3s ease;
"></div>
</div>
</div>

<!-- CONTROLS -->
<div style="
display: flex;
gap: 10px;
flex-wrap: wrap;
margin-bottom: 25px;
align-items: center;
">
<button onclick="window.anfaalTool.toggleMode()" style="
padding: 12px 20px;
background: ${state.currentMode === 'full' ? '#249749' : '#0c3808'};
color: white;
border: none;
border-radius: 8px;
cursor: pointer;
font-weight: bold;
">
${state.currentMode === 'full' ? '📖 Full Reading' : '🎯 Thematic'}
</button>

${state.currentMode === 'theme' ? `
<select onchange="window.anfaalTool.selectTheme(this.value)" style="
padding: 12px;
border: 2px solid #249749;
border-radius: 8px;
background: white;
cursor: pointer;
flex: 1;
min-width: 200px;
">
<option value="all">All Themes</option>
${surahData.themes.map(t => `
<option value="${t.id}" ${state.selectedTheme === t.id ? 'selected' : ''}>
${t.name}
</option>
`).join('')}
</select>
` : ''}

<button onclick="window.anfaalTool.toggleBattleMap()" style="
padding: 12px 20px;
background: ${state.showBattleMap ? '#ff6b6b' : '#666'};
color: white;
border: none;
border-radius: 8px;
cursor: pointer;
">
🗺️ Battle Map
</button>

<button onclick="window.anfaalTool.toggleDarkMode()" style="
padding: 12px 20px;
background: ${state.darkMode ? '#ffd700' : '#333'};
color: ${state.darkMode ? '#333' : 'white'};
border: none;
border-radius: 8px;
cursor: pointer;
">
${state.darkMode ? '☀️' : '🌙'}
</button>

<button onclick="window.anfaalTool.exportProgress()" style="
padding: 12px 20px;
background: #0c3808;
color: white;
border: none;
border-radius: 8px;
cursor: pointer;
">
💾 Export
</button>
</div>

${state.showBattleMap ? renderBattleMap() : ''}

<!-- VERSES CONTAINER -->
<div id="versesContainer" style="max-height: 600px; overflow-y: auto; padding: 10px;">
${renderVerses()}
</div>
</div>
`;

container.innerHTML = html;
}

function renderBattleMap() {
return `
<div style="
background: ${state.darkMode ? '#2a2a2a' : 'white'};
border-radius: 12px;
padding: 20px;
margin-bottom: 25px;
border: 2px solid #ff6b6b;
">
<h3 style="margin-top: 0; color: #ff6b6b;">⚔️ Battle of Badr Timeline</h3>
<div style="position: relative; padding: 20px 0;">
${surahData.battleTimeline.map((item, index) => `
<div style="
display: flex;
align-items: center;
margin-bottom: 15px;
padding: 10px;
background: ${index === 5 ? '#fff3cd' : (state.darkMode ? '#1a1a1a' : '#f8f8f8')};
border-radius: 8px;
border-left: 4px solid ${index === 5 ? '#ffc107' : '#249749'};
">
<div style="
min-width: 80px;
font-weight: bold;
color: ${index === 5 ? '#ff6b6b' : '#249749'};
">
Day ${item.day >= 0 ? '+' : ''}${item.day}
</div>
<div style="flex: 1; padding-left: 15px;">
${item.event}
${index === 5 ? '<strong style="color:#ff6b6b;"> ← BATTLE DAY</strong>' : ''}
</div>
</div>
`).join('')}
</div>
<p style="margin-top: 20px; padding: 15px; background: #f0f9f4; border-radius: 8px; font-size: 0.9em;">
<strong>Strategic Insight:</strong> Notice the 2-week preparation period. Modern equivalent: Product launch with proper beta testing, not rushed release. Preparation = victory multiplier.
</p>
</div>
`;
}

function renderVerses() {
let verses = surahData.verses;

if (state.currentMode === 'theme' && state.selectedTheme !== 'all') {
verses = verses.filter(v => v.theme && v.theme.includes(state.selectedTheme));
}

return verses.map(verse => {
const isCompleted = state.completedVerses.has(verse.number);
const hasNote = state.verseNotes[verse.number];
const isCurrentlyPlaying = state.isPlaying && state.currentVerse === verse.number;

const themeColors = verse.theme ? verse.theme.map(t => {
const theme = surahData.themes.find(th => th.id === t);
return theme ? theme.color : '#ccc';
}) : ['#ccc'];

return `
<div class="verse-card" style="
background: ${isCurrentlyPlaying ? '#fffacd' : (state.darkMode ? '#2a2a2a' : 'white')};
border-left: 5px solid ${themeColors[0]};
border-radius: 12px;
padding: 20px;
margin-bottom: 15px;
box-shadow: 0 4px 12px rgba(0,0,0,0.08);
${isCompleted ? 'opacity: 0.7;' : ''}
">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
<div style="display: flex; align-items: center; gap: 10px;">
<div style="
background: #249749;
color: white;
width: 40px;
height: 40px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
font-weight: bold;
">
${verse.number}
</div>
${verse.theme ? verse.theme.map(t => {
const theme = surahData.themes.find(th => th.id === t);
return `<span style="
background: ${theme.color};
color: #333;
padding: 4px 8px;
border-radius: 4px;
font-size: 0.75em;
font-weight: bold;
">${theme.name}</span>`;
}).join('') : ''}
</div>

<div style="display: flex; gap: 10px;">
<button onclick="window.anfaalTool.playVerse(${verse.number})" style="
background: #249749;
color: white;
border: none;
border-radius: 8px;
padding: 8px 15px;
cursor: pointer;
">
${isCurrentlyPlaying ? '⏸️' : '▶️'}
</button>

<button onclick="window.anfaalTool.toggleNote(${verse.number})" style="
background: ${hasNote ? '#ffd700' : 'transparent'};
border: 2px solid ${hasNote ? '#ffd700' : '#ccc'};
border-radius: 8px;
padding: 8px 12px;
cursor: pointer;
">
📝
</button>

<label style="display: flex; align-items: center;">
<input type="checkbox"
${isCompleted ? 'checked' : ''}
onchange="window.anfaalTool.toggleComplete(${verse.number})"
style="width: 20px; height: 20px; cursor: pointer;">
</label>
</div>
</div>

<div style="
font-size: 1.8em;
line-height: 2.2;
text-align: right;
direction: rtl;
color: ${state.darkMode ? '#e0e0e0' : '#0c3808'};
margin-bottom: 15px;
font-family: 'Traditional Arabic', 'Arial', sans-serif;
">
${verse.arabic}
</div>

<div style="
font-size: 1.05em;
font-style: italic;
color: ${state.darkMode ? '#aaa' : '#666'};
margin-bottom: 12px;
padding: 10px;
background: ${state.darkMode ? '#1a1a1a' : '#f8f8f8'};
border-radius: 8px;
">
<strong>Rumi:</strong> ${verse.transliteration}
</div>

<div style="
font-size: 1.05em;
line-height: 1.8;
color: ${state.darkMode ? '#ccc' : '#333'};
padding: 12px;
background: ${state.darkMode ? '#222' : '#f0f9f4'};
border-radius: 8px;
border-left: 3px solid #249749;
">
${verse.translation}
</div>

${hasNote ? `
<div style="
margin-top: 15px;
padding: 12px;
background: #fffacd;
border-radius: 8px;
border-left: 3px solid #ffd700;
">
<strong>📝 Your Note:</strong><br>
${state.verseNotes[verse.number]}
</div>
` : ''}
</div>
`;
}).join('');
}

// =================================================================
// INTERACTION HANDLERS
// =================================================================

window.anfaalTool = {
toggleMode: function() {
state.currentMode = state.currentMode === 'full' ? 'theme' : 'full';
render();
},

selectTheme: function(themeId) {
state.selectedTheme = themeId;
render();
},

toggleBattleMap: function() {
state.showBattleMap = !state.showBattleMap;
render();
},

toggleDarkMode: function() {
state.darkMode = !state.darkMode;
render();
},

toggleComplete: function(verseNumber) {
if (state.completedVerses.has(verseNumber)) {
state.completedVerses.delete(verseNumber);
} else {
state.completedVerses.add(verseNumber);
}
saveProgress();
render();
},

toggleNote: function(verseNumber) {
const note = prompt('Enter your note for Ayat ' + verseNumber + ':', state.verseNotes[verseNumber] || '');
if (note !== null) {
if (note.trim()) {
state.verseNotes[verseNumber] = note.trim();
} else {
delete state.verseNotes[verseNumber];
}
saveProgress();
render();
}
},

playVerse: function(verseNumber) {
if (state.audioElement) {
state.audioElement.pause();
state.audioElement = null;
}

if (state.isPlaying && state.currentVerse === verseNumber) {
state.isPlaying = false;
state.currentVerse = null;
render();
return;
}

state.currentVerse = verseNumber;
state.isPlaying = true;

const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/26${verseNumber < 10 ? '0' : ''}${verseNumber}.mp3`;

state.audioElement = new Audio(audioUrl);
state.audioElement.playbackRate = state.playbackSpeed;

state.audioElement.addEventListener('ended', function() {
state.isPlaying = false;
state.currentVerse = null;
render();
});

state.audioElement.play().catch(err => {
console.error('Audio error:', err);
alert('Cannot play audio. Check internet connection.');
state.isPlaying = false;
});

render();
},

exportProgress: function() {
const exportData = {
completed: Array.from(state.completedVerses),
notes: state.verseNotes,
exportDate: new Date().toISOString(),
surah: 'Al-Anfaal'
};

const dataStr = JSON.stringify(exportData, null, 2);
const blob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `anfaal-progress-${new Date().toISOString().slice(0,10)}.json`;
a.click();
URL.revokeObjectURL(url);

alert('Progress exported successfully!');
}
};

// =================================================================
// INITIALIZATION
// =================================================================

loadProgress();
render();

setInterval(saveProgress, 30000);

console.log('✅ Surah Al-Anfaal Interactive Tool loaded');
console.log(`📊 Progress: ${state.completedVerses.size}/${surahData.totalVerses}`);

})();
