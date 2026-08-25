// quran-app.js
document.addEventListener("DOMContentLoaded", () => {
    const readerContainer = document.getElementById("quran-reader");
    let bookmarks = JSON.parse(localStorage.getItem("ilmualam_quran_bookmarks")) || [];
    let quranData = [];

    // Gantikan URL ini dengan pautan jsDelivr CDN repository GitHub kau
    // Format: https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/al-baqarah.json
    const jsonUrl = "https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/al-baqarah.json";

    // SVG Icons
    const iconPlay = `<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>`;
    const iconBookmark = `<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>`;
    const iconCopy = `<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path></svg>`;
    const iconShare = `<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path></svg>`;

    // Tunjuk status loading sementara data ditarik
    readerContainer.innerHTML = `<div style="text-align:center; padding: 2rem; color: #047857;">Memuat turun ayat...</div>`;

    // Fetch JSON Data
    fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            quranData = data;
            renderAyahs();
        })
        .catch(error => {
            console.error("Ralat memuat turun data:", error);
            readerContainer.innerHTML = `<div style="color:red; text-align:center;">Gagal memuat turun data. Sila *refresh* laman web.</div>`;
        });

    function renderAyahs() {
        readerContainer.innerHTML = "";
        
        quranData.forEach(ayah => {
            const isBookmarked = bookmarks.includes(ayah.id);
            const card = document.createElement("div");
            card.className = `ayah-card ${isBookmarked ? 'bookmarked' : ''}`;
            card.id = `ayah-${ayah.id}`;
            
            card.innerHTML = `
                <div class="ayah-header">
                    <div class="ayah-number">Ayat ${ayah.id}</div>
                    <div class="ayah-actions">
                        <button class="action-btn" onclick="toggleAudio('audio-${ayah.id}')" title="Mainkan Audio">${iconPlay}</button>
                        <button class="action-btn ${isBookmarked ? 'active-bookmark' : ''}" onclick="toggleBookmark(${ayah.id}, this)" title="Tanda (Bookmark)">${iconBookmark}</button>
                        <button class="action-btn" onclick="copyAyah(${ayah.id})" title="Salin Teks">${iconCopy}</button>
                        <button class="action-btn" onclick="shareAyah(${ayah.id})" title="Kongsi">${iconShare}</button>
                    </div>
                </div>
                <div class="text-arabic">${ayah.arabic}</div>
                <div class="text-jawi">${ayah.jawi}</div>
                <div class="text-rumi">${ayah.rumi}</div>
                <div class="text-translation">${ayah.translation}</div>
                
                <div class="audio-player-container" id="audio-container-${ayah.id}" style="display:none;">
                    <audio id="audio-${ayah.id}" controls controlsList="nodownload">
                        <source src="${ayah.audio}" type="audio/mpeg">
                        Pelayar anda tidak menyokong elemen audio.
                    </audio>
                </div>
            `;
            readerContainer.appendChild(card);
        });
    }

    window.toggleAudio = function(audioId) {
        const audioEl = document.getElementById(audioId);
        const container = document.getElementById(`audio-container-${audioId.split('-')[1]}`);
        
        document.querySelectorAll('audio').forEach(el => {
            if(el.id !== audioId) {
                el.pause();
                el.currentTime = 0;
            }
        });

        if (audioEl.paused) {
            container.style.display = "block";
            audioEl.play();
        } else {
            audioEl.pause();
        }
    };

    window.toggleBookmark = function(id, btnElement) {
        const card = document.getElementById(`ayah-${id}`);
        if (bookmarks.includes(id)) {
            bookmarks = bookmarks.filter(b => b !== id);
            btnElement.classList.remove("active-bookmark");
            card.classList.remove("bookmarked");
        } else {
            bookmarks.push(id);
            btnElement.classList.add("active-bookmark");
            card.classList.add("bookmarked");
        }
        localStorage.setItem("ilmualam_quran_bookmarks", JSON.stringify(bookmarks));
    };

    window.copyAyah = async function(id) {
        const ayah = quranData.find(a => a.id === id);
        const textToCopy = `Surah Al-Baqarah, Ayat ${id}\n\n${ayah.arabic}\n\nTerjemahan: ${ayah.translation}\n\n- Dibawakan oleh ilmualam.com`;
        try {
            await navigator.clipboard.writeText(textToCopy);
            alert(`Ayat ${id} berjaya disalin!`);
        } catch (err) {
            console.error("Gagal menyalin teks", err);
        }
    };

    window.shareAyah = async function(id) {
        const ayah = quranData.find(a => a.id === id);
        const shareData = {
            title: `Surah Al-Baqarah Ayat ${id} di ilmualam.com`,
            text: `${ayah.arabic}\n\n${ayah.translation}`,
            url: `https://ilmualam.com/surah-al-baqarah-rumi-jawi-audio#ayah-${id}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log("Kongsi dibatalkan", err);
            }
        } else {
            window.copyAyah(id);
            alert("Fungsi kongsi tidak disokong. Teks telah disalin ke papan keratan.");
        }
    };
});
