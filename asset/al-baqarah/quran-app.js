// Toggle FAQ Logic
function toggleFaq(btn) {
    const item = btn.parentElement;
    item.classList.toggle('active');
}

// Quran App Logic
const ilmQuran = {
    data: [],
    audioEl: new Audio(),
    currentAyah: 1,
    isPlaying: false,
    bookmarks: JSON.parse(localStorage.getItem('ilm_bookmarks')) || [],
    
jsonUrl: 'https://cdn.jsdelivr.net/gh/ilmualam/quran-tool@main/asset/al-baqarah/al-baqarah.json',

    init: async function() {
        this.renderLoader();
        try {
            // Nota Teknikal: Untuk kelajuan dan kestabilan tanpa CORS, kita map data ke dalam tatasusunan 
            // berdasarkan input format JSON (Arab, Jawi, Rumi, Audio, Translation) anda sebelum ini.
            this.data = await this.fetchData();
            this.renderAyahs();
            this.setupAudioListeners();
        } catch (error) {
            document.getElementById('ilm-reader-container').innerHTML = `<div class="ilm-loader" style="color:red;">Gagal memuat turun data. Sila pastikan sambungan internet stabil.</div>`;
        }
    },

    fetchData: async function() {
        // Fallback robust: Menghasilkan 3 ayat pertama berdasarkan JSON asal anda sebagai fail prapapar.
        // Gantikan blok ini dengan `const res = await fetch('LINK_JSON_ANDA'); return await res.json();` kelak.
        return [
            {
                id: 1,
                arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ",
                jawi: "[Masukkan teks Jawi secara berperingkat]",
                rumi: "Alif, Laam, Miim.",
                translation: "Alif, Laam, Miim.",
                audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/8.mp3"
            },
            {
                id: 2,
                arabic: "ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ",
                jawi: "[Masukkan teks Jawi secara berperingkat]",
                rumi: "Zalikal kitabu la rayba fihi hudal lilmuttaqin.",
                translation: "Kitab Al-Quran ini, tidak ada sebarang syak padanya; ia pula menjadi petunjuk bagi orang-orang yang bertaqwa;",
                audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/9.mp3"
            },
            {
                id: 3,
                arabic: "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَٰهُمْ يُنفِقُونَ",
                jawi: "[Masukkan teks Jawi secara berperingkat]",
                rumi: "Alladhina yu'minuna bil ghaibi wa yuqimunas salata wa mimma razaqnahum yunfiqun.",
                translation: "Iaitu orang-orang yang beriman kepada perkara-perkara yang ghaib, dan mendirikan sembahyang serta membelanjakan sebahagian dari rezeki yang Kami berikan kepada mereka.",
                audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/10.mp3"
            }
        ];
    },

    renderLoader: function() {
        document.getElementById('ilm-reader-container').innerHTML = `<div class="ilm-loader">Menyelaraskan Enjin Audio & Teks...</div>`;
    },

    renderAyahs: function() {
        const container = document.getElementById('ilm-reader-container');
        container.innerHTML = ''; 

        const playIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
        const bmIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>`;
        const shareIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>`;

        this.data.forEach(ayah => {
            const isMarked = this.bookmarks.includes(ayah.id);
            const rumiHtml = ayah.rumi.includes("Masukkan") ? `<div class="ilm-text-rumi ilm-placeholder">Transliterasi sedang dioptimumkan...</div>` : `<div class="ilm-text-rumi">${ayah.rumi}</div>`;
            const jawiHtml = ayah.jawi.includes("Masukkan") ? `` : `<div class="ilm-text-jawi">${ayah.jawi}</div>`;

            const card = document.createElement('div');
            card.className = `ilm-ayah-card ${isMarked ? 'bookmarked' : ''}`;
            card.id = `ayah-${ayah.id}`;
            card.innerHTML = `
                <div class="ilm-ayah-header">
                    <div class="ilm-ayah-num">Ayat ${ayah.id}</div>
                    <div class="ilm-actions">
                        <button class="ilm-btn-icon" onclick="ilmQuran.playAyah(${ayah.id})" aria-label="Main Audio">${playIcon}</button>
                        <button class="ilm-btn-icon ${isMarked ? 'bm-active' : ''}" id="bm-btn-${ayah.id}" onclick="ilmQuran.toggleBookmark(${ayah.id})" aria-label="Tanda Ayat">${bmIcon}</button>
                        <button class="ilm-btn-icon" onclick="ilmQuran.share(${ayah.id})" aria-label="Kongsi">${shareIcon}</button>
                    </div>
                </div>
                <div class="ilm-text-arabic">${ayah.arabic}</div>
                ${jawiHtml}
                ${rumiHtml}
                <div class="ilm-text-trans">${ayah.translation}</div>
            `;
            container.appendChild(card);
        });
    },

    setupAudioListeners: function() {
        this.audioEl.addEventListener('ended', () => {
            this.removeHighlight(this.currentAyah);
            if (this.currentAyah < this.data.length) {
                this.playAyah(this.currentAyah + 1); 
            } else {
                this.pauseAudio(); 
            }
        });
    },

    playAyah: function(id) {
        const ayah = this.data.find(a => a.id === id);
        if (!ayah) return;

        this.removeHighlight(this.currentAyah);
        this.currentAyah = id;
        
        this.audioEl.src = ayah.audio;
        this.audioEl.load();
        const playPromise = this.audioEl.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.updateUI();
                this.scrollToActive();
            }).catch(err => console.log("Autoplay dihalang pelayar web:", err));
        }
    },

    togglePlay: function() {
        if (this.isPlaying) {
            this.pauseAudio();
        } else {
            if(!this.audioEl.src) this.playAyah(this.currentAyah);
            else { this.audioEl.play(); this.isPlaying = true; this.updateUI(); }
        }
    },

    pauseAudio: function() {
        this.audioEl.pause();
        this.isPlaying = false;
        this.updateUI();
    },

    next: function() { if (this.currentAyah < this.data.length) this.playAyah(this.currentAyah + 1); },
    prev: function() { if (this.currentAyah > 1) this.playAyah(this.currentAyah - 1); },

    updateUI: function() {
        const stickyPlayer = document.getElementById('ilm-audio-player');
        const playBtn = document.getElementById('ilm-play-pause-btn');
        const statusTxt = document.getElementById('ilm-playing-status');

        if (this.isPlaying) {
            stickyPlayer.classList.add('visible');
            playBtn.innerHTML = '⏸';
            statusTxt.textContent = `Memainkan Ayat ${this.currentAyah}`;
            this.addHighlight(this.currentAyah);
        } else {
            playBtn.innerHTML = '▶';
            statusTxt.textContent = `Dijeda (Ayat ${this.currentAyah})`;
        }
    },

    addHighlight: function(id) { document.getElementById(`ayah-${id}`).classList.add('active'); },
    removeHighlight: function(id) { 
        const el = document.getElementById(`ayah-${id}`);
        if(el) el.classList.remove('active'); 
    },

    scrollToActive: function() {
        document.getElementById(`ayah-${this.currentAyah}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    toggleBookmark: function(id) {
        const btn = document.getElementById(`bm-btn-${id}`);
        const card = document.getElementById(`ayah-${id}`);
        
        if (this.bookmarks.includes(id)) {
            this.bookmarks = this.bookmarks.filter(b => b !== id);
            btn.classList.remove('bm-active');
            card.classList.remove('bookmarked');
        } else {
            this.bookmarks.push(id);
            btn.classList.add('bm-active');
            card.classList.add('bookmarked');
        }
        localStorage.setItem('ilm_bookmarks', JSON.stringify(this.bookmarks));
    },

    share: async function(id) {
        const ayah = this.data.find(a => a.id === id);
        const text = `Surah Al-Baqarah, Ayat ${id}\n\n${ayah.arabic}\n\nMaksud: ${ayah.translation}\n\nDibaca di: ilmualam.com`;
        
        if (navigator.share) {
            try { await navigator.share({ title: `Ayat ${id} Al-Baqarah`, text: text }); } 
            catch (err) { console.log('Operasi kongsi dibatalkan'); }
        } else {
            navigator.clipboard.writeText(text);
            alert(`Teks Ayat ${id} berjaya disalin ke papan keratan!`);
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    ilmQuran.init();
});

