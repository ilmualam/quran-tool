/*
 * Surah Al-Qasas Interactive Reader Tool
 * Version: 2.0
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

(function() {
    'use strict';
    
    const SURAH_NUMBER = 28; // Al-Qasas
    const TOTAL_VERSES = 88;
    const API_BASE = 'https://api.alquran.cloud/v1';
    const AUDIO_CDN = 'https://cdn.islamic.network/quran/audio/128';
    
    let currentAudio = null;
    let isPlaying = false;
    let currentVerse = 0;
    let allVerses = [];
    let bookmarks = JSON.parse(localStorage.getItem('qasas_bookmarks') || '[]');
    
    const elements = {
        container: document.getElementById('versesContainer'),
        qariSelect: document.getElementById('qariSelect'),
        playAllBtn: document.getElementById('playAllBtn'),
        stopBtn: document.getElementById('stopBtn'),
        bookmarksBtn: document.getElementById('bookmarksBtn'),
        searchInput: document.getElementById('searchInput'),
        progressBar: document.getElementById('progressBar')
    };

    // Fetch complete surah data
    async function fetchSurahData() {
        try {
            const [arabicRes, rumiRes, translationRes] = await Promise.all([
                fetch(`${API_BASE}/surah/${SURAH_NUMBER}`),
                fetch(`${API_BASE}/surah/${SURAH_NUMBER}/ar.jalalayn`), // Using Jalalayn edition for reference
                fetch(`${API_BASE}/surah/${SURAH_NUMBER}/ms.basmeih`) // Malay translation (Basmeih)
            ]);

            const [arabic, rumi, translation] = await Promise.all([
                arabicRes.json(),
                rumiRes.json(),
                translationRes.json()
            ]);

            allVerses = arabic.data.ayahs.map((ayah, index) => ({
                number: ayah.numberInSurah,
                arabic: ayah.text,
                rumi: generateRumi(ayah.text, index + 1), // Generate rumi from Arabic
                translation: translation.data.ayahs[index].text,
                audioNumber: ayah.number
            }));

            renderVerses(allVerses);
        } catch (error) {
            elements.container.innerHTML = '<div class="ilm-qasas-loading">❌ Ralat memuatkan data. Sila muat semula halaman.</div>';
            console.error('Error fetching data:', error);
        }
    }

    // Generate Rumi transliteration (simplified version)
    function generateRumi(arabic, verseNum) {
        // This is a simplified transliteration map for common patterns
        // In production, use a proper transliteration library or API
        const rumiMap = {
            'ٱللَّهُ': 'Allahu',
            'ٱلرَّحْمَٰنِ': 'ar-Rahmani',
            'ٱلرَّحِيمِ': 'ar-Rahimi',
            'بِسْمِ': 'Bismi',
            'طسٓمٓ': 'Ta Sin Mim',
            'مُّوسَىٰ': 'Musa',
            'فِرْعَوْنَ': "Fir'auna",
            'قَارُونَ': 'Qaruna'
        };
        
        let rumi = arabic;
        for (let [ar, rm] of Object.entries(rumiMap)) {
            rumi = rumi.replace(new RegExp(ar, 'g'), rm);
        }
        
        // For Surah Al-Qasas, provide manual rumi for first few verses as example
        const manualRumi = {
            1: "Ta Sin Mim",
            2: "Tilka ayatul kitabil mubiin",
            3: "Natlu 'alaika min naba-i Musa wa Fir'auna bil haqqi liqawminy yu'minuun",
            4: "Inna Fir'auna 'alaa fil ardi wa ja'ala ahlahaa shiya'any yastadh'ifu taa-ifatam minhum yuzabbihu abnaa-ahum wa yastahyii nisaa-ahum innahu kaana minal mufsidiin",
            5: "Wa nuriidu an namunna 'alal laziinas tud'ifuu fil ardi wa naj'alahum a-immatan wa naj'alahumul waarisiin"
        };
        
        return manualRumi[verseNum] || `[Ayat ${verseNum} - Gunakan audio untuk sebutan yang tepat]`;
    }

    // Render verses
    function renderVerses(verses) {
        elements.container.innerHTML = verses.map(verse => `
            <div class="ilm-qasas-verse" data-verse="${verse.number}" id="verse-${verse.number}">
                <span class="ilm-qasas-verse-number">${verse.number}</span>
                <div class="ilm-qasas-arabic">${verse.arabic}</div>
                <div class="ilm-qasas-rumi">${verse.rumi}</div>
                <div class="ilm-qasas-translation">${verse.translation}</div>
                <div class="ilm-qasas-verse-actions">
                    <button onclick="playVerse(${verse.number})" class="ilm-qasas-verse-btn">▶ Play</button>
                    <button onclick="copyVerse(${verse.number})" class="ilm-qasas-verse-btn">📋 Copy</button>
                    <button onclick="toggleBookmark(${verse.number})" class="ilm-qasas-verse-btn ${bookmarks.includes(verse.number) ? 'bookmarked' : ''}">🔖 Bookmark</button>
                    <button onclick="shareVerse(${verse.number})" class="ilm-qasas-verse-btn">📤 Share</button>
                </div>
            </div>
        `).join('');
    }

    // Play specific verse
    window.playVerse = function(verseNum) {
        const verse = allVerses.find(v => v.number === verseNum);
        if (!verse) return;

        stopAudio();
        
        const qari = elements.qariSelect.value;
        const audioUrl = `${AUDIO_CDN}/${qari}/${String(verse.audioNumber).padStart(3, '0')}.mp3`;
        
        currentAudio = new Audio(audioUrl);
        currentVerse = verseNum;
        
        highlightVerse(verseNum);
        
        currentAudio.play().catch(err => {
            console.error('Audio playback error:', err);
            alert('Ralat memuatkan audio. Cuba sekali lagi.');
        });
        
        currentAudio.onended = () => {
            if (isPlaying && currentVerse < TOTAL_VERSES) {
                playVerse(currentVerse + 1);
            } else {
                stopAudio();
            }
        };
        
        updateProgress();
    };

    // Play all verses
    elements.playAllBtn.addEventListener('click', () => {
        isPlaying = true;
        elements.playAllBtn.textContent = '⏸ Jeda';
        playVerse(1);
    });

    // Stop audio
    elements.stopBtn.addEventListener('click', stopAudio);

    function stopAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        isPlaying = false;
        currentVerse = 0;
        elements.playAllBtn.textContent = '▶ Play All';
        document.querySelectorAll('.ilm-qasas-verse.active').forEach(v => v.classList.remove('active'));
        updateProgress();
    }

    // Highlight active verse
    function highlightVerse(verseNum) {
        document.querySelectorAll('.ilm-qasas-verse.active').forEach(v => v.classList.remove('active'));
        const verseEl = document.getElementById(`verse-${verseNum}`);
        if (verseEl) {
            verseEl.classList.add('active');
            verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Copy verse
    window.copyVerse = function(verseNum) {
        const verse = allVerses.find(v => v.number === verseNum);
        if (!verse) return;

        const text = `Surah Al-Qasas [28:${verseNum}]\n\n${verse.arabic}\n\n${verse.rumi}\n\n${verse.translation}\n\nSumber: <a href="https://www.ilmualam.com" target="_blank">IlmuAlam.com</a>`;
        
        navigator.clipboard.writeText(text).then(() => {
            alert('✅ Ayat berjaya disalin!');
        }).catch(() => {
            alert('❌ Gagal menyalin. Cuba sekali lagi.');
        });
    };

    // Toggle bookmark
    window.toggleBookmark = function(verseNum) {
        const index = bookmarks.indexOf(verseNum);
        if (index > -1) {
            bookmarks.splice(index, 1);
        } else {
            bookmarks.push(verseNum);
        }
        localStorage.setItem('qasas_bookmarks', JSON.stringify(bookmarks));
        
        const btn = document.querySelector(`#verse-${verseNum} .ilm-qasas-verse-btn.bookmarked, #verse-${verseNum} .ilm-qasas-verse-btn:nth-child(3)`);
        if (btn) {
            btn.classList.toggle('bookmarked');
        }
    };

    // View bookmarks
    elements.bookmarksBtn.addEventListener('click', () => {
        if (bookmarks.length === 0) {
            alert('Tiada bookmark disimpan.');
            return;
        }
        
        const bookmarkedVerses = allVerses.filter(v => bookmarks.includes(v.number));
        renderVerses(bookmarkedVerses);
        
        elements.bookmarksBtn.textContent = '🔄 Tunjuk Semua';
        elements.bookmarksBtn.onclick = () => {
            renderVerses(allVerses);
            elements.bookmarksBtn.textContent = '🔖 Bookmark';
            elements.bookmarksBtn.onclick = null;
            elements.bookmarksBtn.addEventListener('click', arguments.callee);
        };
    });

    // Search functionality
    elements.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            renderVerses(allVerses);
            return;
        }

        const filtered = allVerses.filter(v => 
            v.number.toString().includes(query) ||
            v.arabic.includes(query) ||
            v.rumi.toLowerCase().includes(query) ||
            v.translation.toLowerCase().includes(query)
        );
        
        renderVerses(filtered.length > 0 ? filtered : allVerses);
        
        if (filtered.length === 0) {
            elements.container.innerHTML = '<div class="ilm-qasas-loading">❌ Tiada hasil ditemui</div>';
        }
    });

    // Share verse
    window.shareVerse = function(verseNum) {
        const verse = allVerses.find(v => v.number === verseNum);
        if (!verse) return;

        const shareText = `Surah Al-Qasas [28:${verseNum}]: ${verse.translation}\n\nBaca selengkapnya di IlmuAlam.com`;
        const shareUrl = `https://www.ilmualam.com/2025/12/surah-al-qasas-rumi.html#verse-${verseNum}`;

        if (navigator.share) {
            navigator.share({
                title: `Surah Al-Qasas Ayat ${verseNum}`,
                text: shareText,
                url: shareUrl
            }).catch(() => {});
        } else {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    // Update progress bar
    function updateProgress() {
        const progress = (currentVerse / TOTAL_VERSES) * 100;
        elements.progressBar.style.width = `${progress}%`;
    }

    // Initialize
    fetchSurahData();

})();
