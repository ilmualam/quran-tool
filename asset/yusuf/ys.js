/**
 * Surah Yusuf Interactive Tool
 * Author: Ilmu Alam (ilmualam.com)
 * License: Proprietary - Do not distribute without permission.
 * Copyright 2025 Ilmu Alam. All rights reserved.
 * Hosted on GitHub for performance.
 */

(function() {
    const CONFIG = {
        surahId: 12, // Yusuf
        primaryColor: '#249749',
        darkColor: '#0c3808',
        highlightColor: '#e8f5e9', // Very light green
        containerId: 'ia-surah-yusuf-app'
    };

    // SVG Icons (Lightweight strings)
    const ICONS = {
        play: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
        pause: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>',
        copy: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
        share: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',
        bookmark: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',
        check: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#249749" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
    };

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        #${CONFIG.containerId} {
            font-family: 'Inter', sans-serif;
            max-width: 100%;
            margin: 0 auto;
            color: #333;
        }
        .ia-tool-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: ${CONFIG.primaryColor};
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .ia-tool-title h3 { margin: 0; color: white; font-size: 1.2rem; }
        .ia-tool-controls button {
            background: ${CONFIG.darkColor};
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.9rem;
            transition: background 0.2s;
        }
        .ia-tool-controls button:hover { background: #052003; }
        
        .ia-tool-ayah-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            background: white;
            transition: all 0.3s ease;
            scroll-margin-top: 100px;
        }
        .ia-tool-ayah-card.active {
            border-color: ${CONFIG.primaryColor};
            background-color: ${CONFIG.highlightColor};
            box-shadow: 0 0 10px rgba(36, 151, 73, 0.2);
        }
        
        .ia-tool-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .ia-tool-number {
            background: ${CONFIG.primaryColor};
            color: white;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 0.85rem;
            font-weight: bold;
        }
        .ia-tool-actions {
            display: flex;
            gap: 10px;
        }
        .ia-tool-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            color: #666;
            padding: 5px;
            border-radius: 4px;
            transition: color 0.2s;
        }
        .ia-tool-btn:hover { color: ${CONFIG.primaryColor}; background: #f0f0f0; }
        
        .ia-tool-arabic {
            font-family: 'Amiri', 'Scheherazade', serif;
            font-size: 1.8rem;
            text-align: right;
            line-height: 2.2;
            margin-bottom: 15px;
            color: #000;
            direction: rtl;
        }
        .ia-tool-transliteration {
            font-size: 0.95rem;
            color: ${CONFIG.primaryColor};
            margin-bottom: 8px;
            font-style: italic;
            line-height: 1.5;
        }
        .ia-tool-translation {
            font-size: 1rem;
            color: #444;
            line-height: 1.6;
        }
        
        /* Skeleton Loader */
        .ia-skeleton {
            background: #eee;
            height: 20px;
            margin-bottom: 10px;
            border-radius: 4px;
            animation: ia-pulse 1.5s infinite;
        }
        @keyframes ia-pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }
        
        @media (max-width: 600px) {
            .ia-tool-arabic { font-size: 1.5rem; }
            .ia-tool-header { flex-direction: column; gap: 10px; text-align: center; }
        }
    `;
    document.head.appendChild(style);

    // Load Arabic Font (Optional but recommended)
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Amiri&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const container = document.getElementById(CONFIG.containerId);
    let ayahData = [];
    let currentAudio = null;
    let currentAyahIndex = 0;
    let isPlaying = false;

    async function init() {
        if (!container) return;
        renderSkeleton();

        try {
            // Fetch Arabic, Malay, and Transliteration
            // Using Al-Quran Cloud API
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${CONFIG.surahId}/editions/quran-uthmani,ms.basmeih,en.transliteration`);
            const data = await response.json();
            
            if(data.code === 200) {
                processData(data.data);
                renderApp();
                loadBookmark();
            } else {
                container.innerHTML = '<p style="color:red">Gagal memuatkan data. Sila refresh.</p>';
            }
        } catch (error) {
            console.error(error);
            container.innerHTML = '<p style="color:red">Ralat sambungan internet.</p>';
        }
    }

    function renderSkeleton() {
        let html = '<div class="ia-tool-header"><div class="ia-tool-title"><h3>Surah Yusuf</h3></div></div>';
        for(let i=0; i<3; i++) {
            html += `
            <div class="ia-tool-ayah-card">
                <div class="ia-skeleton" style="width: 50px; height: 30px;"></div>
                <div class="ia-skeleton" style="height: 60px; margin-top: 10px;"></div>
                <div class="ia-skeleton" style="width: 80%;"></div>
                <div class="ia-skeleton" style="width: 90%;"></div>
            </div>`;
        }
        container.innerHTML = html;
    }

    function processData(editions) {
        // 0: Arabic, 1: Malay, 2: Transliteration
        const arabic = editions[0].ayahs;
        const malay = editions[1].ayahs;
        const trans = editions[2].ayahs;

        ayahData = arabic.map((ayah, index) => {
            return {
                number: ayah.numberInSurah,
                text: ayah.text,
                audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
                malay: malay[index].text,
                rumi: trans[index].text,
                id: `ayah-${index}`
            };
        });
    }

    function renderApp() {
        let html = `
            <div class="ia-tool-header">
                <div class="ia-tool-title">
                    <h3>Surah Yusuf (111 Ayat)</h3>
                </div>
                <div class="ia-tool-controls">
                    <button id="ia-main-play">${ICONS.play} Mainkan Semua</button>
                </div>
            </div>
            <div id="ia-ayah-list">
        `;

        ayahData.forEach((ayah, index) => {
            html += `
                <div class="ia-tool-ayah-card" id="${ayah.id}" data-index="${index}">
                    <div class="ia-tool-top-row">
                        <div class="ia-tool-number">${ayah.number}</div>
                        <div class="ia-tool-actions">
                            <button class="ia-tool-btn play-btn" title="Main Audio" onclick="window.iaPlayAudio(${index})">${ICONS.play}</button>
                            <button class="ia-tool-btn" title="Copy Teks" onclick="window.iaCopyAyah(${index})">${ICONS.copy}</button>
                            <button class="ia-tool-btn" title="Share WhatsApp" onclick="window.iaShareAyah(${index})">${ICONS.share}</button>
                            <button class="ia-tool-btn" title="Bookmark" onclick="window.iaBookmark(${index})">${ICONS.bookmark}</button>
                        </div>
                    </div>
                    <div class="ia-tool-arabic">${ayah.text}</div>
                    <div class="ia-tool-transliteration">${ayah.rumi}</div>
                    <div class="ia-tool-translation">${ayah.malay}</div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;

        // Attach Global Play Listener
        document.getElementById('ia-main-play').addEventListener('click', toggleMainPlay);
    }

    // --- Audio Logic ---

    window.iaPlayAudio = function(index) {
        if (currentAudio) {
            currentAudio.pause();
            if(currentAyahIndex === index && isPlaying) {
                isPlaying = false;
                updatePlayIcons(index, false);
                return; 
            }
        }

        currentAyahIndex = index;
        playCurrent();
    };

    function playCurrent() {
        const ayah = ayahData[currentAyahIndex];
        if(!ayah) return;

        // Highlight UI
        document.querySelectorAll('.ia-tool-ayah-card').forEach(el => el.classList.remove('active'));
        const activeCard = document.getElementById(ayah.id);
        activeCard.classList.add('active');
        
        // Scroll to view (smooth)
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

        currentAudio = new Audio(ayah.audio);
        currentAudio.play();
        isPlaying = true;
        updatePlayIcons(currentAyahIndex, true);
        updateMainPlayBtn(true);

        currentAudio.onended = function() {
            isPlaying = false;
            updatePlayIcons(currentAyahIndex, false);
            if (currentAyahIndex < ayahData.length - 1) {
                currentAyahIndex++;
                playCurrent(); // Auto play next
            } else {
                updateMainPlayBtn(false);
            }
        };
    }

    function toggleMainPlay() {
        if (isPlaying) {
            if(currentAudio) currentAudio.pause();
            isPlaying = false;
            updateMainPlayBtn(false);
            updatePlayIcons(currentAyahIndex, false);
        } else {
            playCurrent();
        }
    }

    function updatePlayIcons(index, playing) {
        const btn = document.querySelector(`#ayah-${index} .play-btn`);
        if(btn) btn.innerHTML = playing ? ICONS.pause : ICONS.play;
    }

    function updateMainPlayBtn(playing) {
        const btn = document.getElementById('ia-main-play');
        if(btn) btn.innerHTML = playing ? `${ICONS.pause} Pause` : `${ICONS.play} Mainkan Semua`;
    }

    // --- Utility Functions ---

    window.iaCopyAyah = function(index) {
        const ayah = ayahData[index];
        const text = `${ayah.text}\n\n"${ayah.malay}"\n(Surah Yusuf: ${ayah.number})`;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.querySelector(`#ayah-${index} button[title="Copy Teks"]`);
            const original = btn.innerHTML;
            btn.innerHTML = ICONS.check;
            setTimeout(() => btn.innerHTML = original, 2000);
        });
    };

    window.iaShareAyah = function(index) {
        const ayah = ayahData[index];
        const text = `Baca Surah Yusuf Ayat ${ayah.number}:\n${ayah.text}\n${ayah.malay}\n\nBaca penuh di: ${window.location.href}`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    window.iaBookmark = function(index) {
        localStorage.setItem('ia_yusuf_bookmark', index);
        const btn = document.querySelector(`#ayah-${index} button[title="Bookmark"]`);
        btn.style.fill = CONFIG.primaryColor; // Visual feedback
        alert(`Ayat ${ayahData[index].number} ditanda.`);
    };

    function loadBookmark() {
        const saved = localStorage.getItem('ia_yusuf_bookmark');
        if(saved) {
            const index = parseInt(saved);
            // Add a small indicator or scroll there?
            // Let's just scroll for now if user wants
            const btn = document.createElement('button');
            btn.innerHTML = "Sambung Bacaan";
            btn.style.cssText = `display:block; margin: 10px auto; background:${CONFIG.darkColor}; color:white; border:none; padding:5px 15px; border-radius:15px; cursor:pointer;`;
            btn.onclick = () => {
                const el = document.getElementById(`ayah-${index}`);
                if(el) el.scrollIntoView({behavior:'smooth', block:'center'});
                el.classList.add('active');
            };
            const header = document.querySelector('.ia-tool-header');
            header.parentNode.insertBefore(btn, header.nextSibling);
        }
    }

    // Auto Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
