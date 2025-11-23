// Yusuf Tool Core JavaScript
(function() {
  'use strict';
  
  // Yusuf Surah Data (Hardcoded for reliability)
  const YUSUF_DATA = [
    {number: 1, arabic: "الر ۚ تِلْكَ آيَاتُ الْكِتَابِ الْمُبِينِ", translation: "Alif, Laam, Raa. Ini adalah ayat-ayat Kitab (Al-Quran) yang jelas."},
    {number: 2, arabic: "إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ", translation: "Sesungguhnya Kami menurunkannya berupa Al Quran dengan berbahasa Arab, agar kamu memahaminya."},
    {number: 3, arabic: "نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ بِمَا أَوْحَيْنَا إِلَيْكَ هَٰذَا الْقُرْآنَ وَإِن كُنتَ مِن قَبْلِهِ لَمِنَ الْغَافِلِينَ", translation: "Kami menceritakan kepadamu kisah yang paling baik dengan mewahyukan Al-Quran ini kepadamu, dan sesungguhnya kamu sebelum (kami mewahyukan)nya adalah termasuk orang-orang yang belum mengetahui."},
    {number: 4, arabic: "إِذْ قَالَ يُوسُفُ لِأَبِيهِ يَا أَبَتِ إِنِّي رَأَيْتُ أَحَدَ عَشَرَ كَوْكَبًا وَالشَّمْسَ وَالْقَمَرَ رَأَيْتُهُمْ لِي سَاجِدِينَ", translation: "(Ingatlah), ketika Yusuf berkata kepada ayahnya: \"Wahai ayahku, sesungguhnya aku bermimpi melihat sebelas bintang, matahari dan bulan; kulihat semuanya sujud kepadaku.\""}
  ];
  
  // Configuration
  const SURAH_NUMBER = 12;
  const TOTAL_AYAT = 111;
  const AUDIO_BASE = 'https://everyayah.com/data/Alafasy_128kbps/';
  
  // State
  let currentAyat = 0;
  let isPlaying = false;
  let audio = null;
  let ayatData = [];
  
  // Elements
  const playBtn = document.getElementById('yusuf-play');
  const playIcon = document.getElementById('yusuf-play-icon');
  const playText = document.getElementById('yusuf-play-text');
  const prevBtn = document.getElementById('yusuf-prev');
  const nextBtn = document.getElementById('yusuf-next');
  const currentInfo = document.getElementById('yusuf-current');
  const progressBar = document.getElementById('yusuf-progress');
  const speedSelect = document.getElementById('yusuf-speed');
  const listContainer = document.getElementById('yusuf-list');
  
  // Initialize
  async function init() {
    try {
      // Try to fetch full data first
      const response = await fetch('https://api.alquran.cloud/v1/surah/12/editions/quran-uthmani,ms.basmeih');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.code === 200) {
          const arabic = data.data[0].ayahs;
          const translation = data.data[1].ayahs;
          
          ayatData = arabic.map((ayah, index) => ({
            number: index + 1,
            arabic: ayah.text,
            translation: translation[index].text,
            audio: `${AUDIO_BASE}012${String(index + 1).padStart(3, '0')}.mp3`
          }));
        }
      }
      
      // Fallback to sample data if API fails
      if (ayatData.length === 0) {
        ayatData = YUSUF_DATA.map((item, index) => ({
          ...item,
          audio: `${AUDIO_BASE}012${String(index + 1).padStart(3, '0')}.mp3`
        }));
        
        // Fill remaining ayat with placeholders
        for (let i = ayatData.length; i < TOTAL_AYAT; i++) {
          ayatData.push({
            number: i + 1,
            arabic: `يُوسُف - آية ${i + 1}`,
            translation: `Ayat ${i + 1} - Sila muatkan semula halaman untuk terjemahan penuh`,
            audio: `${AUDIO_BASE}012${String(i + 1).padStart(3, '0')}.mp3`
          });
        }
      }
      
      renderAyatList();
      setupAudio();
      setupEventListeners();
      
    } catch (error) {
      console.error('Error loading Surah Yusuf:', error);
      // Use hardcoded data as fallback
      ayatData = YUSUF_DATA.map((item, index) => ({
        ...item,
        audio: `${AUDIO_BASE}012${String(index + 1).padStart(3, '0')}.mp3`
      }));
      
      renderAyatList();
      setupAudio();
      setupEventListeners();
    }
  }
  
  // Render ayat list
  function renderAyatList() {
    listContainer.innerHTML = ayatData.map((ayat, index) => `
      <div class="yusuf-ayat" data-index="${index}" tabindex="0">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span class="yusuf-ayat-number">${ayat.number}</span>
          <div class="yusuf-ayat-actions">
            <button class="yusuf-action-btn" onclick="playAyatDirect(${index})">▶ Play</button>
            <button class="yusuf-action-btn" onclick="copyAyatText(${index})">📋 Copy</button>
          </div>
        </div>
        <div class="yusuf-ayat-arabic">${ayat.arabic}</div>
        <div class="yusuf-ayat-translation">${ayat.translation}</div>
      </div>
    `).join('');
  }
  
  // Setup audio
  function setupAudio() {
    audio = new Audio();
    audio.preload = 'none';
    
    audio.addEventListener('ended', () => {
      if (currentAyat < ayatData.length - 1) {
        playNext();
      } else {
        stopPlayback();
      }
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      // Try alternative source
      if (audio.src.includes('everyayah.com')) {
        const ayatNum = String(currentAyat + 1).padStart(3, '0');
        audio.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/1${SURAH_NUMBER * 100 + currentAyat + 1}.mp3`;
        audio.play().catch(() => {
          alert('Error memuatkan audio. Sila cuba lagi.');
          stopPlayback();
        });
      }
    });
    
    // Update playback speed
    speedSelect.addEventListener('change', () => {
      audio.playbackRate = parseFloat(speedSelect.value);
    });
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Play/Pause button
    playBtn.addEventListener('click', togglePlayback);
    
    // Previous/Next buttons
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    
    // Ayat click
    listContainer.addEventListener('click', (e) => {
      const ayatEl = e.target.closest('.yusuf-ayat');
      if (ayatEl && !e.target.closest('.yusuf-ayat-actions')) {
        const index = parseInt(ayatEl.dataset.index);
        playAyat(index);
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case ' ':
          e.preventDefault();
          togglePlayback();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          playPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          playNext();
          break;
        case 'Escape':
          stopPlayback();
          break;
      }
    });
  }
  
  // Playback functions
  function togglePlayback() {
    if (isPlaying) {
      pausePlayback();
    } else {
      if (audio.src) {
        resumePlayback();
      } else {
        playAyat(currentAyat);
      }
    }
  }
  
  function playAyat(index) {
    if (index < 0 || index >= ayatData.length) return;
    
    currentAyat = index;
    audio.src = ayatData[index].audio;
    audio.playbackRate = parseFloat(speedSelect.value);
    
    audio.play().then(() => {
      isPlaying = true;
      updateUI();
      scrollToAyat(index);
    }).catch(e => {
      console.error('Playback failed:', e);
    });
  }
  
  function pausePlayback() {
    audio.pause();
    isPlaying = false;
    updateUI();
  }
  
  function resumePlayback() {
    audio.play();
    isPlaying = true;
    updateUI();
  }
  
  function stopPlayback() {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    updateUI();
  }
  
  function playPrevious() {
    if (currentAyat > 0) {
      playAyat(currentAyat - 1);
    }
  }
  
  function playNext() {
    if (currentAyat < ayatData.length - 1) {
      playAyat(currentAyat + 1);
    }
  }
  
  // UI functions
  function updateUI() {
    // Update play button
    playIcon.textContent = isPlaying ? '⏸' : '▶';
    playText.textContent = isPlaying ? 'Pause' : 'Play';
    
    // Update navigation buttons
    prevBtn.disabled = currentAyat === 0;
    nextBtn.disabled = currentAyat === ayatData.length - 1;
    
    // Update current info
    currentInfo.textContent = `Ayat: ${currentAyat + 1}/${ayatData.length}`;
    
    // Update progress
    progressBar.style.width = `${((currentAyat + 1) / ayatData.length) * 100}%`;
    
    // Update ayat highlighting
    document.querySelectorAll('.yusuf-ayat').forEach((el, index) => {
      el.classList.toggle('playing', index === currentAyat && isPlaying);
    });
  }
  
  function scrollToAyat(index) {
    const ayatEl = document.querySelector(`.yusuf-ayat[data-index="${index}"]`);
    if (ayatEl) {
      ayatEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  // Global functions
  window.playAyatDirect = function(index) {
    playAyat(index);
  };
  
  window.copyAyatText = function(index) {
    const ayat = ayatData[index];
    const text = `${ayat.arabic}\n\n${ayat.translation}\n\n- Surah Yusuf, Ayat ${ayat.number}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Ayat telah disalin!');
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Ayat telah disalin!');
    });
  };
  
  // Initialize on load
  init();
})();

// PDF Generation
function generatePDF() {
  const printContent = `
    <html>
    <head>
      <title>Surah Yusuf - PDF</title>
      <style>
        @media print {
          body { font-family: Arial, sans-serif; margin: 2cm; }
          h1 { text-align: center; color: #249749; page-break-after: avoid; }
          .ayat { margin: 1em 0; page-break-inside: avoid; border-bottom: 1px solid #eee; padding-bottom: 1em; }
          .arabic { font-size: 1.5em; text-align: right; direction: rtl; margin: 0.5em 0; line-height: 2; }
          .translation { margin: 0.5em 0; line-height: 1.6; }
          .number { display: inline-block; background: #249749; color: white; padding: 0.2em 0.5em; border-radius: 50%; margin-right: 0.5em; }
          .footer { text-align: center; margin-top: 2em; color: #666; }
        }
      </style>
    </head>
    <body>
      <h1>Surah Yusuf - سورة يوسف</h1>
      <p style="text-align:center">111 Ayat • Surah ke-12 • Makkiyah</p>
      <div style="margin-top:2em">
        <p style="text-align:center">Untuk mendapatkan PDF penuh dengan semua 111 ayat,<br>sila gunakan fungsi Print browser (Ctrl+P atau Cmd+P)</p>
        <p style="text-align:center;margin-top:1em">Pilih "Save as PDF" dalam tetapan print.</p>
      </div>
      <div class="footer">
        <p>© IlmuAlam.com - Surah Yusuf</p>
      </div>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Auto print after load
  printWindow.onload = function() {
    printWindow.print();
  };
}
