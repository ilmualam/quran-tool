// Nama Fail: surah-ar-rahman-tool.js
document.addEventListener('DOMContentLoaded', function() {
    (function() {
        // --- Konfigurasi Utama ---
        const surahNumber = 55;
        const surahName = "Ar-Rahman";
        const totalAyahs = 78;
        const refrainText = "فَبِأَيِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ"; // Teks Irama untuk diserlahkan

        // --- Pemilih Elemen DOM ---
        const container = document.getElementById('surah-arrahman-tool-container');
        if (!container) return;

        const ayahListContainer = container.querySelector('#ilmu-sar-ayah-list');
        const audioPlayer = container.querySelector('#ilmu-sar-audio-player');
        const playPauseAllBtn = container.querySelector('#ilmu-sar-play-pause-all');
        const autoplayToggle = container.querySelector('#ilmu-sar-autoplay-toggle');
        const loadingIndicator = container.querySelector('#ilmu-sar-loading');
        const controlsContainer = container.querySelector('.ilmu-sar-controls');
        const notification = container.querySelector('#ilmu-sar-copy-notification');
        const goToAyahSelect = container.querySelector('#ilmu-sar-goto-ayah');
        const progressBar = container.querySelector('.ilmu-sar-progress-bar');

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
                if (controlsContainer) controlsContainer.style.display = 'flex';

                const [arabicAyahs, malayAyahs, rumiAyahs] = [data.data[0].ayahs, data.data[1].ayahs, data.data[2].ayahs];
                for (let i = 0; i < totalAyahs; i++) {
                    surahData.push({ number: arabicAyahs[i].numberInSurah, arabic: arabicAyahs[i].text, translation: malayAyahs[i].text, transliteration: rumiAyahs[i].text, audio: arabicAyahs[i].audio });
                }
                setupPlaceholders();
                initLazyLoader();
                populateNavigators();
            } catch (error) {
                if (loadingIndicator) loadingIndicator.innerHTML = `<p style="color:red;">Maaf, gagal memuatkan data Surah ${surahName}.</p>`;
                console.error(`Error fetching Surah ${surahName} data:`, error);
            }
        }

        function populateNavigators() {
            if (goToAyahSelect) for (let i = 1; i <= totalAyahs; i++) { const option = document.createElement('option'); option.value = i - 1; option.textContent = `Ayat ${i}`; goToAyahSelect.appendChild(option); }
        }
        
        // --- Logik Pemuatan Malas (Lazy Loading) ---
        function setupPlaceholders() {
            if (!ayahListContainer) return;
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < totalAyahs; i++) { const placeholder = document.createElement('div'); placeholder.className = 'ilmu-sar-ayah-placeholder'; placeholder.dataset.index = i; placeholder.id = `ilmu-sar-ayah-${i}`; fragment.appendChild(placeholder); }
            ayahListContainer.appendChild(fragment);
        }

        function initLazyLoader() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const placeholder = entry.target;
                        const index = parseInt(placeholder.dataset.index);
                        if (!placeholder.classList.contains('ilmu-sar-loaded')) {
                            const ayahData = surahData[index];
                            if(ayahData) {
                                placeholder.innerHTML = renderAyahContent(ayahData, index);
                                placeholder.className = 'ilmu-sar-ayah ilmu-sar-loaded';
                                if (ayahData.arabic === refrainText) placeholder.classList.add('ilmu-sar-refrain');
                                if (bookmarkedAyahs.has(index)) placeholder.classList.add('ilmu-sar-bookmarked');
                            }
                        }
                    }
                });
            }, { rootMargin: '400px 0px' });
            document.querySelectorAll('.ilmu-sar-ayah-placeholder').forEach(ph => observer.observe(ph));
        }

        function renderAyahContent(ayah, index) {
            const isBookmarked = bookmarkedAyahs.has(index);
            const bookmarkIcon = isBookmarked
                ? `<svg fill="#ffc107" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"></path></svg>`
                : `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"></path></svg>`;
            return `
                <div class="ilmu-sar-ayah-header">
                    <span class="ilmu-sar-ayah-number">${surahName} : Ayat ${ayah.number}</span>
                    <button class="ilmu-sar-action-button" data-action="play" data-index="${index}" aria-label="Mainkan Ayat ${ayah.number}"><svg fill="#249749" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></button>
                </div>
                <p class="ilmu-sar-arabic">${ayah.arabic}</p>
                <p class="ilmu-sar-rumi">${ayah.transliteration}</p>
                <p class="ilmu-sar-translation">${ayah.translation}</p>
                <div class="ilmu-sar-ayah-actions">
                     <button class="ilmu-sar-action-button" data-action="copy" data-index="${index}"><svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>Copy</button>
                    <button class="ilmu-sar-action-button" data-action="share" data-index="${index}"><svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 8.11C7.5 7.61 6.79 7.3 6 7.3c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"></path></svg>Share</button>
                     <button class="ilmu-sar-action-button" data-action="bookmark" data-index="${index}">${bookmarkIcon} ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
                </div>`;
        }
        
        // --- Fungsi Kawalan & Interaksi ---
        function handleAction(e){const t=e.target.closest(".ilmu-sar-action-button");if(!t)return;const a=t.dataset.action,n=parseInt(t.dataset.index),s=surahData[n],o=`Surah ${surahName}, Ayat ${s.number}:\n\n${s.arabic}\n\nTerjemahan: "${s.translation}"\n\n- Dari ilmualam.com`;"play"===a&&playAyah(n),"copy"===a&&copyToClipboard(o),"share"===a&&shareAyah(o),"bookmark"===a&&toggleBookmark(n,t)}
        function playAyah(e){if(!(e>=totalAyahs||e<0))return currentAyahIndex=e,audioPlayer.src=surahData[e].audio,audioPlayer.play().catch(e=>console.error("Audio error:",e)),isPlaying=!0,void updateUIForPlayback();stopPlayback()}
        function stopPlayback(){audioPlayer.pause(),audioPlayer.currentTime=0,isPlaying=!1,currentAyahIndex=-1,updateUIForPlayback()}
        function updateUIForPlayback(){playPauseAllBtn.textContent=isPlaying?"Stop Reading":"Start Reading",document.querySelectorAll(".ilmu-sar-ayah.ilmu-sar-loaded").forEach(e=>{const t=parseInt(e.dataset.index),a=e.querySelector('[data-action="play"] svg path');t===currentAyahIndex&&isPlaying?(e.classList.add("ilmu-sar-playing"),a&&a.setAttribute("d","M6 19h4V5H6v14zm8-14v14h4V5h-4z")):(e.classList.remove("ilmu-sar-playing"),a&&a.setAttribute("d","M8 5v14l11-7z"))}),isPlaying&&(document.getElementById(`ilmu-sar-ayah-${currentAyahIndex}`)?.scrollIntoView({behavior:"smooth",block:"center"}),goToAyahSelect&&(goToAyahSelect.value=currentAyahIndex))}
        function updateProgressBar(){if(!progressBar)return;const e=ayahListContainer.scrollTop,t=ayahListContainer.scrollHeight-ayahListContainer.clientHeight,a=t>0?e/t*100:0;progressBar.style.width=`${a}%`}
        function copyToClipboard(e){navigator.clipboard.writeText(e).then(()=>showNotification("Text copied successfully!"))}
        async function shareAyah(e){navigator.share?await navigator.share({title:`Ayat from Surah ${surahName}`,text:e,url:window.location.href}).catch(e=>console.error("Share failed:",e)):copyToClipboard(e)}
        function toggleBookmark(e,t){const a=document.getElementById(`ilmu-sar-ayah-${e}`);bookmarkedAyahs.has(e)?(bookmarkedAyahs.delete(e),a.classList.remove("ilmu-sar-bookmarked"),t.innerHTML='<svg fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"></path></svg> Bookmark'):(bookmarkedAyahs.add(e),a.classList.add("ilmu-sar-bookmarked"),t.innerHTML='<svg fill="#ffc107" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"></path></svg> Bookmarked'),localStorage.setItem(`bookmarked_${surahNumber}`,JSON.stringify([...bookmarkedAyahs]))}
        function showNotification(e){if(!notification)return;notification.textContent=e,notification.style.opacity=1,setTimeout(()=>{notification.style.opacity=0},2e3)}

        // --- Pendengar Acara (Event Listeners) ---
        function addEventListeners() {
            ayahListContainer.addEventListener('click', handleAction);
            ayahListContainer.addEventListener('scroll', updateProgressBar);
            playPauseAllBtn.addEventListener('click', () => isPlaying ? stopPlayback() : playAyah(0));
            audioPlayer.addEventListener('ended', () => { if (autoplayToggle.checked && currentAyahIndex < totalAyahs - 1) playAyah(currentAyahIndex + 1); else stopPlayback(); });
            goToAyahSelect.addEventListener('change', (e) => { const ayahIndex = parseInt(e.target.value); const targetAyah = document.getElementById(`ilmu-sar-ayah-${ayahIndex}`); if (targetAyah) ayahListContainer.scrollTop = targetAyah.offsetTop - ayahListContainer.offsetTop; });
        }

        fetchSurahData();
        addEventListeners();
    })();
});
