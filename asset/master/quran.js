document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'https://api.alquran.cloud/v1';
    const appContainer = document.getElementById('quran-app-container');
    const surahList = document.getElementById('surahList');
    const readerView = document.getElementById('readerView');
    const versesContainer = document.getElementById('versesContainer');
    const searchInput = document.getElementById('surahSearch');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const surahTitle = document.getElementById('surahTitle');
    const bismillah = document.getElementById('bismillah');
    const backBtn = document.getElementById('backBtn');

    // Settings Toggles
    const toggleTransliteration = document.getElementById('toggleTransliteration');
    const toggleTranslation = document.getElementById('toggleTranslation');
    const toggleAudio = document.getElementById('toggleAudio');

    let allSurahs = [];
    let currentAudio = null;

    // 1. Fetch Surah List
    fetch(`${API_BASE}/surah`)
        .then(res => res.json())
        .then(data => {
            allSurahs = data.data;
            renderSurahList(allSurahs);
        })
        .catch(err => {
            surahList.innerHTML = '<p style="text-align:center;color:red;">Gagal memuatkan data. Sila semak sambungan internet anda.</p>';
        });

    // 2. Render Surah List
    function renderSurahList(surahs) {
        surahList.innerHTML = '';
        surahs.forEach(surah => {
            const card = document.createElement('div');
            card.className = 'surah-card';
            card.innerHTML = `
                <div style="display:flex;align-items:center;">
                    <div class="surah-number">${surah.number}</div>
                    <div class="surah-info">
                        <h3>${surah.englishName}</h3>
                        <p>${surah.englishNameTranslation} • ${surah.numberOfAyahs} Ayat</p>
                    </div>
                </div>
                <div class="surah-arabic">${surah.name.replace('سورة ', '')}</div>
            `;
            card.addEventListener('click', () => loadSurah(surah));
            surahList.appendChild(card);
        });
    }

    // 3. Search Functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allSurahs.filter(s => 
            s.englishName.toLowerCase().includes(term) || 
            s.englishNameTranslation.toLowerCase().includes(term) ||
            s.number.toString() === term
        );
        renderSurahList(filtered);
    });

    // 4. Toggle Settings
    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
    });

    // Live toggle updates
    const updateVisibility = (cls, show) => {
        document.querySelectorAll(cls).forEach(el => {
            el.style.display = show ? 'block' : 'none';
        });
    };

    toggleTransliteration.addEventListener('change', (e) => updateVisibility('.transliteration-text', e.target.checked));
    toggleTranslation.addEventListener('change', (e) => updateVisibility('.translation-text', e.target.checked));
    toggleAudio.addEventListener('change', (e) => updateVisibility('.audio-btn-container', e.target.checked));

    // 5. Load Surah Details (Optimized)
    async function loadSurah(surah) {
        // UI reset
        surahList.classList.add('hidden');
        document.querySelector('.search-box').parentElement.classList.add('hidden'); // Hide header search
        readerView.classList.remove('hidden');
        versesContainer.innerHTML = '<div class="loading-spinner">Sedang menyusun ayat...</div>';
        surahTitle.innerHTML = `<h2>${surah.englishName}</h2><p>${surah.englishNameTranslation}</p>`;
        
        // Show Bismillah except for Surah At-Tawbah (9)
        if(surah.number === 9) {
            bismillah.classList.add('hidden');
        } else {
            bismillah.classList.remove('hidden');
        }

        window.scrollTo(0, 0);

        try {
            // Fetch Arabic, Malay Translation (Basmeih), and Transliteration in one call
            // en.transliteration is standard latin script
            const response = await fetch(`${API_BASE}/surah/${surah.number}/editions/quran-uthmani,ms.basmeih,en.transliteration`);
            const json = await response.json();
            const [arabicData, malayData, rumiData] = json.data;

            renderVerses(arabicData.ayahs, malayData.ayahs, rumiData.ayahs);

        } catch (error) {
            versesContainer.innerHTML = '<p style="text-align:center;color:red;">Ralat memuatkan surah.</p>';
            console.error(error);
        }
    }

    // 6. Render Verses
    function renderVerses(arabic, malay, rumi) {
        versesContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();

        // Get current Surah Name from the title we set earlier
        const surahName = document.querySelector('#surahTitle h2').innerText;

        arabic.forEach((ayah, index) => {
            const verseDiv = document.createElement('div');
            verseDiv.className = 'verse-item';
            
            // Prepare data for actions
            const surahNum = ayah.surah ? ayah.surah.number : 0; // Safety check
            const verseNum = ayah.numberInSurah;
            const textAr = ayah.text;
            const textRumi = rumi[index].text;
            const textMy = malay[index].text;
            
            // Check if bookmarked in LocalStorage
            const bookmarkKey = `quran_bookmark_${surahName}_${verseNum}`;
            const isBookmarked = localStorage.getItem(bookmarkKey) ? 'bookmarked' : '';
            const bookmarkIconFill = isBookmarked ? 'fill="#ff9800"' : 'fill="none"';

            const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;

            verseDiv.innerHTML = `
                <div class="verse-top">
                    <span class="verse-number">Ayat ${verseNum}</span>
                    
                    <div class="verse-actions">
                        <!-- Copy Button -->
                        <button class="action-btn" onclick="copyVerse('${surahName}', '${verseNum}', this)" aria-label="Copy">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>

                        <!-- Share Button -->
                        <button class="action-btn" onclick="shareVerse('${surahName}', '${verseNum}', this)" aria-label="Share">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        </button>

                        <!-- Bookmark Button -->
                        <button class="action-btn ${isBookmarked}" onclick="toggleBookmark('${surahName}', '${verseNum}', this)" aria-label="Bookmark">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${bookmarkIconFill} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                        </button>

                        <!-- Audio Button -->
                        <div class="audio-btn-container" style="display: ${toggleAudio.checked ? 'block' : 'none'}">
                            <button class="audio-btn" data-audio="${audioUrl}" aria-label="Play">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Verse Content (Hidden data for copying) -->
                <div class="arabic-text" id="ar-${verseNum}">${textAr}</div>
                <div class="transliteration-text" id="rumi-${verseNum}" style="display: ${toggleTransliteration.checked ? 'block' : 'none'}">${textRumi}</div>
                <div class="translation-text" id="my-${verseNum}" style="display: ${toggleTranslation.checked ? 'block' : 'none'}">${textMy}</div>
            `;

            fragment.appendChild(verseDiv);
        });

        versesContainer.appendChild(fragment);
        setupAudioPlayers();
    }

    // 7. Audio Player Logic
    function setupAudioPlayers() {
        const buttons = document.querySelectorAll('.audio-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-audio');

                // If clicking same button, toggle pause
                if (currentAudio && currentAudio.src === url) {
                    if (currentAudio.paused) {
                        currentAudio.play();
                        btn.classList.add('playing');
                    } else {
                        currentAudio.pause();
                        btn.classList.remove('playing');
                    }
                    return;
                }

                // Stop previous audio
                if (currentAudio) {
                    currentAudio.pause();
                    document.querySelectorAll('.audio-btn').forEach(b => b.classList.remove('playing'));
                }

                // Play new
                currentAudio = new Audio(url);
                currentAudio.play();
                btn.classList.add('playing');

                currentAudio.onended = () => {
                    btn.classList.remove('playing');
                };
            });
        });
    }

    // 8. Back Navigation
    backBtn.addEventListener('click', () => {
        readerView.classList.add('hidden');
        surahList.classList.remove('hidden');
        document.querySelector('.search-box').parentElement.classList.remove('hidden'); // Show header
        if(currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        window.scrollTo(0, 0);
    });

});
</script>
<script>
// --- ACTION BUTTON FUNCTIONS (Copy, Share, Bookmark) ---

function getVerseText(verseNum) {
    const ar = document.getElementById(`ar-${verseNum}`).innerText;
    const rumi = document.getElementById(`rumi-${verseNum}`).innerText;
    const my = document.getElementById(`my-${verseNum}`).innerText;
    return { ar, rumi, my };
}

// 1. COPY FUNCTION
function copyVerse(surahName, verseNum, btn) {
    const content = getVerseText(verseNum);
    const textToCopy = `*${surahName} : Ayat ${verseNum}*\n\n${content.ar}\n\n${content.rumi}\n\n"${content.my}"\n\n(Dipetik dari Al-Quran Online)`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Visual Feedback (Change icon temporarily)
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => btn.innerHTML = originalHTML, 2000);
    });
}

// 2. SHARE FUNCTION
function shareVerse(surahName, verseNum) {
    const content = getVerseText(verseNum);
    const textToShare = `${surahName} : Ayat ${verseNum}\n\n${content.ar}\n${content.my}`;
    
    if (navigator.share) {
        navigator.share({
            title: `Al-Quran: ${surahName}`,
            text: textToShare,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback if share not supported (do copy instead)
        alert("Fungsi Share tidak disokong peramban ini. Teks telah disalin.");
        copyVerse(surahName, verseNum, document.querySelector('.action-btn')); 
    }
}

// 3. BOOKMARK FUNCTION
function toggleBookmark(surahName, verseNum, btn) {
    const key = `quran_bookmark_${surahName}_${verseNum}`;
    const svg = btn.querySelector('svg');
    
    if (localStorage.getItem(key)) {
        // Remove Bookmark
        localStorage.removeItem(key);
        btn.classList.remove('bookmarked');
        svg.setAttribute('fill', 'none');
    } else {
        // Add Bookmark
        localStorage.setItem(key, 'true');
        btn.classList.add('bookmarked');
        svg.setAttribute('fill', '#ff9800');
    }
}
