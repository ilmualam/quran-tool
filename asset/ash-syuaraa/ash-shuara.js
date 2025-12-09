/*
 * Surah Ash-Syuaraa' Interactive Reader Tool
 * Version:1.0
 * Author: IlmuAlam.com Development Team
 * License: MIT License
 * 
 * Copyright (c) 2024 IlmuAlam.com
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * For hosting on GitHub: https://github.com/ilmualam
 * Domain configured for: ilmualam.com
 */
;
}
    function attachEventListeners() {
        // Qari selection
        document.getElementById('ilm-sr-qari').addEventListener('change', (e) => {
            currentQari = e.target.value;
            if (isPlaying) {
                playAyat(currentAyat);
            }
        });
        
        // Search panel
        document.getElementById('ilm-sr-search-btn').addEventListener('click', toggleSearchPanel);
        document.getElementById('ilm-sr-close-search').addEventListener('click', toggleSearchPanel);
        document.getElementById('ilm-sr-go-btn').addEventListener('click', goToAyat);
        document.getElementById('ilm-sr-search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') goToAyat();
        });
        
        // Bookmarks panel
        document.getElementById('ilm-sr-bookmark-btn').addEventListener('click', toggleBookmarksPanel);
        document.getElementById('ilm-sr-close-bookmarks').addEventListener('click', toggleBookmarksPanel);
        document.getElementById('ilm-sr-add-bookmark').addEventListener('click', addBookmark);
        
        // Player controls
        document.getElementById('ilm-sr-play').addEventListener('click', togglePlay);
        document.getElementById('ilm-sr-prev').addEventListener('click', prevAyat);
        document.getElementById('ilm-sr-next').addEventListener('click', nextAyat);
        document.getElementById('ilm-sr-repeat').addEventListener('click', repeatAyat);
        document.getElementById('ilm-sr-share').addEventListener('click', shareAyat);
        
        // Progress bar
        const progressBar = document.getElementById('ilm-sr-progress');
        progressBar.addEventListener('input', (e) => {
            const time = (audioElement.duration / 100) * e.target.value;
            audioElement.currentTime = time;
        });
        
        // Audio events
        audioElement.addEventListener('timeupdate', updateProgress);
        audioElement.addEventListener('ended', nextAyat);
        audioElement.addEventListener('loadedmetadata', () => {
            updateProgressText();
        });
    }
    
    async function loadSurahData() {
        try {
            const [arabic, translation, transliteration] = await Promise.all([
                fetch(`${API_BASE}/surah/${SURAH_NUMBER}`).then(r => r.json()),
                fetch(`${API_BASE}/surah/${SURAH_NUMBER}/ms.basmeih`).then(r => r.json()),
                fetch(`${API_BASE}/surah/${SURAH_NUMBER}/en.transliteration`).then(r => r.json())
            ]);
            
            surahData = {
                arabic: arabic.data.ayahs,
                translation: translation.data.ayahs,
                transliteration: transliteration.data.ayahs
            };
            
            displayAllAyat();
        } catch (error) {
            console.error('Error loading surah:', error);
            document.getElementById('ilm-sr-ayat-display').innerHTML = 
                '<div class="ilm-sr-loading">❌ Ralat memuatkan data. Sila muat semula halaman.</div>';
        }
    }
    
    function displayAllAyat() {
        const container = document.getElementById('ilm-sr-ayat-display');
        container.innerHTML = '';
        
        for (let i = 0; i < TOTAL_AYAT; i++) {
            const ayatCard = document.createElement('div');
            ayatCard.className = 'ilm-sr-ayat-card';
            ayatCard.id = `ayat-${i + 1}`;
            ayatCard.innerHTML = `
                <div class="ilm-sr-ayat-number">Ayat ${i + 1}</div>
                <div class="ilm-sr-ayat-arabic">${surahData.arabic[i].text}</div>
                <div class="ilm-sr-ayat-rumi">${convertToMalayRumi(surahData.transliteration[i].text)}</div>
                <div class="ilm-sr-ayat-translation">${surahData.translation[i].text}</div>
            `;
            ayatCard.addEventListener('click', () => {
                currentAyat = i + 1;
                highlightAyat(currentAyat);
                playAyat(currentAyat);
            });
            container.appendChild(ayatCard);
        }
        
        highlightAyat(1);
    }
    
    function convertToMalayRumi(text) {
        // Simple conversion for better Malay pronunciation
        return text
            .replace(/th/gi, 'ts')
            .replace(/dh/gi, 'z')
            .replace(/kh/gi, 'kh')
            .replace(/gh/gi, 'gh')
            .replace(/sh/gi, 'sy')
            .replace(/aa/gi, 'a')
            .replace(/ee/gi, 'i')
            .replace(/oo/gi, 'u');
    }
    
    function highlightAyat(number) {
        document.querySelectorAll('.ilm-sr-ayat-card').forEach(card => {
            card.classList.remove('active');
        });
        const activeCard = document.getElementById(`ayat-${number}`);
        if (activeCard) {
            activeCard.classList.add('active');
            activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        document.getElementById('ilm-sr-current-ayat').textContent = `Ayat ${number}`;
    }
    
    function playAyat(number) {
        const ayatNumber = String(number).padStart(3, '0');
        const audioUrl = `https://cdn.islamic.network/quran/audio/128/${currentQari}/${SURAH_NUMBER}${ayatNumber}.mp3`;
        
        audioElement.src = audioUrl;
        audioElement.play();
        isPlaying = true;
        document.getElementById('ilm-sr-play').textContent = '⏸️';
        currentAyat = number;
        highlightAyat(number);
    }
    
    function togglePlay() {
        if (isPlaying) {
            audioElement.pause();
            document.getElementById('ilm-sr-play').textContent = '▶️';
            isPlaying = false;
        } else {
            if (!audioElement.src) {
                playAyat(currentAyat);
            } else {
                audioElement.play();
                document.getElementById('ilm-sr-play').textContent = '⏸️';
                isPlaying = true;
            }
        }
    }
    
    function prevAyat() {
        if (currentAyat > 1) {
            currentAyat--;
            playAyat(currentAyat);
        }
    }
    
    function nextAyat() {
        if (currentAyat < TOTAL_AYAT) {
            currentAyat++;
            playAyat(currentAyat);
        } else {
            audioElement.pause();
            isPlaying = false;
            document.getElementById('ilm-sr-play').textContent = '▶️';
        }
    }
    
    function repeatAyat() {
        playAyat(currentAyat);
    }
    
    function updateProgress() {
        const progress = (audioElement.currentTime / audioElement.duration) * 100;
        document.getElementById('ilm-sr-progress').value = progress || 0;
        updateProgressText();
    }
    
    function updateProgressText() {
        const current = formatTime(audioElement.currentTime);
        const duration = formatTime(audioElement.duration);
        document.getElementById('ilm-sr-progress-text').textContent = `${current} / ${duration}`;
    }
    
    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    function toggleSearchPanel() {
        const panel = document.getElementById('ilm-sr-search-panel');
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        if (panel.style.display === 'flex') {
            document.getElementById('ilm-sr-bookmarks-panel').style.display = 'none';
        }
    }
    
    function goToAyat() {
        const input = document.getElementById('ilm-sr-search-input');
        const number = parseInt(input.value);
        if (number >= 1 && number <= TOTAL_AYAT) {
            currentAyat = number;
            highlightAyat(currentAyat);
            document.getElementById('ilm-sr-search-panel').style.display = 'none';
            input.value = '';
        } else {
            alert('Sila masukkan nombor ayat antara 1 hingga 227');
        }
    }
    
    function toggleBookmarksPanel() {
        const panel = document.getElementById('ilm-sr-bookmarks-panel');
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        if (panel.style.display === 'flex') {
            document.getElementById('ilm-sr-search-panel').style.display = 'none';
            displayBookmarks();
        }
    }
    
    function addBookmark() {
        if (!bookmarks.includes(currentAyat)) {
            bookmarks.push(currentAyat);
            bookmarks.sort((a, b) => a - b);
            localStorage.setItem('ilm_ashshuara_bookmarks', JSON.stringify(bookmarks));
            alert(`✅ Ayat ${currentAyat} ditambah ke bookmark`);
        } else {
            alert(`ℹ️ Ayat ${currentAyat} sudah ada dalam bookmark`);
        }
    }
    
    function displayBookmarks() {
        const list = document.getElementById('ilm-sr-bookmarks-list');
        if (bookmarks.length === 0) {
            list.innerHTML = '<p style="color:#666;padding:8px">Tiada bookmark lagi</p>';
            return;
        }
        
        list.innerHTML = bookmarks.map(num => `
            <div class="ilm-sr-bookmark-item" onclick="ilmGoToBookmark(${num})">
                <span>📖 Ayat ${num}</span>
                <button onclick="event.stopPropagation();ilmRemoveBookmark(${num})" style="background:transparent;border:none;color:#dc3545;cursor:pointer">🗑️</button>
            </div>
        `).join('');
    }
    
    window.ilmGoToBookmark = function(num) {
        currentAyat = num;
        highlightAyat(num);
        document.getElementById('ilm-sr-bookmarks-panel').style.display = 'none';
        playAyat(num);
    };
    
    window.ilmRemoveBookmark = function(num) {
        bookmarks = bookmarks.filter(b => b !== num);
        localStorage.setItem('ilm_ashshuara_bookmarks', JSON.stringify(bookmarks));
        displayBookmarks();
    };
    
    function shareAyat() {
        const shareText = `Surah Asy Syuara Ayat ${currentAyat}\n\n${surahData.arabic[currentAyat - 1].text}\n\n${surahData.translation[currentAyat - 1].text}\n\nBaca lengkap di: https://ilmualam.com/2025/12/surah-asy-syuara-rumi.html#ayat-${currentAyat}`;
        
        if (navigator.share) {
            navigator.share({
                title: `Surah Asy Syuara Ayat ${currentAyat}`,
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('✅ Ayat disalin ke clipboard');
            });
        }
    }
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
