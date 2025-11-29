// Nama Fail: surah-al-kahf-tool.js
document.addEventListener('DOMContentLoaded', function() {
    (function() {
        // --- Konfigurasi Utama ---
        const surahNumber = 18;
        const surahName = "Al-Kahf";
        const totalAyahs = 110;
        const storyJourneys = {
            'ashabul-kahfi': 8,  // Ayat 9
            'dua-kebun': 31,     // Ayat 32
            'musa-khidir': 59,   // Ayat 60
            'zulkarnain': 82      // Ayat 83
        };

        // --- Pemilih Elemen DOM ---
        const container = document.getElementById('surah-alkahf-tool-container');
        if (!container) return;

        const ayahListContainer = container.querySelector('#ilmu-sak-ayah-list');
        const audioPlayer = container.querySelector('#ilmu-sak-audio-player');
        const playPauseAllBtn = container.querySelector('#ilmu-sak-play-pause-all');
        const loadingIndicator = container.querySelector('#ilmu-sak-loading');
        const controlsContainer = container.querySelector('.ilmu-sak-controls');
        const notification = container.querySelector('#ilmu-sak-copy-notification');
        const goToAyahSelect = container.querySelector('#ilmu-sak-goto-ayah');
        const journeysPanel = container.querySelector('.ilmu-sak-journeys-panel');
        // Suis Kawalan
        const autoplayToggle = container.querySelector('#ilmu-sak-autoplay-toggle');
        const autoscrollToggle = container.querySelector('#ilmu-sak-autoscroll-toggle');

        // --- Pembolehubah Keadaan ---
        const surahData = [];
        let currentAyahIndex = -1;
        let isPlaying = false;
        let bookmarkedAyahs = new Set(JSON.parse(localStorage.getItem(`bookmarked_${surahNumber}`)) || []);

        // --- Fungsi Teras ---
        async function fetchSurahData() {
            try {
                const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/ar.alafasy,ms.basmeih,en.transliteration`);
                if (!response.ok) throw new Error('Respons rangkaian tidak baik');
                const data = await response.json();
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                if (container.querySelector('.ilmu-sak-layout')) container.querySelector('.ilmu-sak-layout').style.opacity = 1;
                
                const [a,m,r] = [data.data[0].ayahs, data.data[1].ayahs, data.data[2].ayahs];
                for (let i=0; i<totalAyahs; i++) surahData.push({number:a[i].numberInSurah, arabic:a[i].text, translation:m[i].text, transliteration:r[i].text, audio:a[i].audio});
                
                setupPlaceholders();
                initLazyLoader();
                populateNavigators();
            } catch (error) {
                if (loadingIndicator) loadingIndicator.innerHTML = `<p style="color:red;">Maaf, gagal memuatkan data Surah ${surahName}.</p>`;
                console.error(`Error fetching Surah ${surahName} data:`, error);
            }
        }

        function populateNavigators() {
            if (goToAyahSelect) for (let i = 1; i <= totalAyahs; i++) { const opt = document.createElement('option'); opt.value = i - 1; opt.textContent = `Ayat ${i}`; goToAyahSelect.appendChild(opt); }
        }
        
        function setupPlaceholders() {
            if (!ayahListContainer) return;
            const frag = document.createDocumentFragment();
            for (let i = 0; i < totalAyahs; i++) { const ph = document.createElement('div'); ph.className = 'ilmu-sak-ayah-placeholder'; ph.dataset.index = i; ph.id = `ilmu-sak-ayah-${i}`; frag.appendChild(ph); }
            ayahListContainer.appendChild(frag);
        }

        function initLazyLoader() {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        const ph = e.target;
                        const idx = parseInt(ph.dataset.index);
                        if (!ph.classList.contains('ilmu-sak-loaded')) {
                            const ayah = surahData[idx];
                            if(ayah) {
                                ph.innerHTML = renderAyahContent(ayah, idx);
                                ph.className = 'ilmu-sak-ayah ilmu-sak-loaded';
                                if (bookmarkedAyahs.has(idx)) ph.classList.add('ilmu-sak-bookmarked');
                            }
                        }
                    }
                });
            }, { root: ayahListContainer, rootMargin: '500px 0px' });
            document.querySelectorAll('.ilmu-sak-ayah-placeholder').forEach(ph => obs.observe(ph));
        }

        function renderAyahContent(ayah, index) {
            const isBookmarked = bookmarkedAyahs.has(index);
            const bookmarkIcon = isBookmarked ? `<svg fill="#ffc107" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"></path></svg>` : `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"></path></svg>`;
            return `<div class="ilmu-sak-ayah-header"><span class="ilmu-sak-ayah-number">${surahName} : Ayat ${ayah.number}</span><button class="ilmu-sak-action-button" data-action="play" data-index="${index}" aria-label="Mainkan Ayat ${ayah.number}"><svg fill="#249749" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></button></div><p class="ilmu-sak-arabic">${ayah.arabic}</p><p class="ilmu-sak-rumi">${ayah.transliteration}</p><p class="ilmu-sak-translation">${ayah.translation}</p><div class="ilmu-sak-ayah-actions"><button class="ilmu-sak-action-button" data-action="copy" data-index="${index}"><svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>Copy</button><button class="ilmu-sak-action-button" data-action="bookmark" data-index="${index}">${bookmarkIcon} ${isBookmarked ? 'Ditanda' : 'Tanda Buku'}</button></div>`;
        }
        
        function handleAction(e){const t=e.target.closest(".ilmu-sak-action-button");if(!t)return;const a=t.dataset.action,n=parseInt(t.dataset.index),s=surahData[n],o=`Surah ${surahName}, Ayat ${s.number}:\n\n${s.arabic}\n\nTerjemahan: "${s.translation}"\n\n- Dari ilmualam.com`;"play"===a&&playAyah(n),"copy"===a&&copyToClipboard(o),"bookmark"===a&&toggleBookmark(n,t)}
        function playAyah(e){if(!(e>=totalAyahs||e<0))return currentAyahIndex=e,audioPlayer.src=surahData[e].audio,audioPlayer.play().catch(e=>console.error("Audio error:",e)),isPlaying=!0,void updateUIForPlayback();stopPlayback()}
        function stopPlayback(){audioPlayer.pause(),audioPlayer.currentTime=0,isPlaying=!1,currentAyahIndex=-1,updateUIForPlayback()}
        
        function updateUIForPlayback(){
            playPauseAllBtn.innerHTML = isPlaying ? `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg> Hentikan` : `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg> Mula Bacaan`;
            document.querySelectorAll(".ilmu-sak-ayah.ilmu-sak-loaded").forEach(e=>{const t=parseInt(e.dataset.index);t===currentAyahIndex&&isPlaying?e.classList.add("ilmu-sak-playing"):e.classList.remove("ilmu-sak-playing")});
            if(isPlaying&&autoscrollToggle.checked){const t=document.getElementById(`ilmu-sak-ayah-${currentAyahIndex}`);t&&(ayahListContainer.scrollTop=t.offsetTop-ayahListContainer.offsetTop)}
            goToAyahSelect.value=currentAyahIndex;
        }
        
        function copyToClipboard(e){navigator.clipboard.writeText(e).then(()=>showNotification("Teks berjaya disalin!"))}
        function toggleBookmark(e,t){const a=document.getElementById(`ilmu-sak-ayah-${e}`);bookmarkedAyahs.has(e)?(bookmarkedAyahs.delete(e),a.classList.remove("ilmu-sak-bookmarked"),t.innerHTML=`<svg fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"></path></svg> Bookmark`):(bookmarkedAyahs.add(e),a.classList.add("ilmu-sak-bookmarked"),t.innerHTML=`<svg fill="#ffc107" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"></path></svg> Ditanda`),localStorage.setItem(`bookmarked_${surahNumber}`,JSON.stringify([...bookmarkedAyahs]))}
        function showNotification(e){if(!notification)return;notification.textContent=e,notification.style.opacity=1,setTimeout(()=>{notification.style.opacity=0},2e3)}

        function jumpTo(e){const t=parseInt(e);const a=document.getElementById(`ilmu-sak-ayah-${t}`);a&&(ayahListContainer.scrollTop=a.offsetTop-ayahListContainer.offsetTop)}
        
        function addEventListeners() {
            ayahListContainer.addEventListener('click', handleAction);
            playPauseAllBtn.addEventListener('click', () => isPlaying ? stopPlayback() : playAyah(currentAyahIndex > -1 ? currentAyahIndex : 0));
            audioPlayer.addEventListener('ended', () => { if (autoplayToggle.checked && currentAyahIndex < totalAyahs - 1) playAyah(currentAyahIndex + 1); else stopPlayback(); });
            goToAyahSelect.addEventListener('change', (e) => jumpTo(e.target.value));
            journeysPanel.addEventListener('click', (e) => { const journey = e.target.closest('.ilmu-sak-journey-item'); if(journey) { e.preventDefault(); const key = journey.dataset.journey; jumpTo(storyJourneys[key]); }});
        }

        fetchSurahData();
        addEventListeners();
    })();
});
