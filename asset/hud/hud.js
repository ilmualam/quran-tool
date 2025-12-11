const surahData = [
  {
ā syā'a rabbuk, inna rabbaka fa''ālul lima yurid",
      translation: "mereka kekal di dalamnya selama ada langit dan bumi, kecuali jika Tuhanmu menghendaki (yang lain). Sesungguhnya Tuhanmu Maha Pelaksana terhadap apa yang Dia kehendaki."
    },
    {
      number: 108,
      arabic: "وَأَمَّا الَّذِينَ سُعِدُوا فَفِي الْجَنَّةِ خَالِدِينَ فِيهَا مَا دَامَتِ السَّمَاوَاتُ وَالْأَرْضُ إِلَّا مَا شَاءَ رَبُّكَ ۖ عَطَاءً غَيْرَ مَجْذُوذٍ",
      transliteration: "Wa ammal lazina su'idu fa fil jannati khalidina fiha ma damatis samawatu wal ardu illa ma sya'a rabbuk, 'ata'an gaira majzuz",
      translation: "Adapun orang-orang yang berbahagia maka tempatnya di dalam surga, mereka kekal di dalamnya selama ada langit dan bumi, kecuali jika Tuhanmu menghendaki (yang lain), sebagai karunia yang tiada putus-putusnya."
    },
    {
      number: 109,
      arabic: "فَلَا تَكُ فِي مِرْيَةٍ مِّمَّا يَعْبُدُ هَٰؤُلَاءِ ۚ مَا يَعْبُدُونَ إِلَّا كَمَا يَعْبُدُ آبَاؤُهُم مِّن قَبْلُ ۚ وَإِنَّا لَمُوَفُّوهُمْ نَصِيبَهُمْ غَيْرَ مَنقُوصٍ",
      transliteration: "Fa la taku fi miryatim mimma ya'budu ha'ula', ma ya'buduna illa kama ya'budu aba'uhum ming qabl, wa inna la muwaffuhum nasibahum gaira manqus",
      translation: "Maka janganlah kamu (Muhammad) berada dalam keraguan tentang apa yang disembah oleh orang-orang musyrik itu. Mereka tidak menyembah melainkan sebagaimana yang disembah oleh bapak-bapak mereka yang dahulu. Dan sesungguhnya Kami pasti akan menyempurnakan bagian mereka dengan tiada dikurangi sedikitpun."
    },
    {
      number: 110,
      arabic: "وَلَقَدْ آتَيْنَا مُوسَى الْكِتَابَ فَاخْتُلِفَ فِيهِ ۚ وَلَوْلَا كَلِمَةٌ سَبَقَتْ مِن رَّبِّكَ لَقُضِيَ بَيْنَهُمْ ۚ وَإِنَّهُمْ لَفِي شَكٍّ مِّنْهُ مُرِيبٍ",
      transliteration: "Wa laqad ataina musal kitaba fakhtulifa fih, wa laula kalimatun sabaqat mir rabbika la qudiya bainahum, wa innahum la fi syakkim minhu murib",
      translation: "Dan sesungguhnya telah Kami berikan kitab kepada Musa, lalu diperselisihkan tentang kitab itu. Kalau tidaklah karena sesuatu ketetapan yang telah ada dari Tuhanmu, tentu telah diberikan keputusan di antara mereka. Dan sesungguhnya mereka benar-benar dalam keraguan yang mendalam tentang Al Quran."
    },
    {
      number: 111,
      arabic: "وَإِنَّ كُلًّا لَّمَّا لَيُوَفِّيَنَّهُمْ رَبُّكَ أَعْمَالَهُمْ ۚ إِنَّهُ بِمَا يَعْمَلُونَ خَبِيرٌ",
      transliteration: "Wa inna kullal lamma la yuwaffiyyannahum rabbuka a'malahum, innahu bima ya'maluna khabir",
      translation: "Dan sesungguhnya kepada masing-masing mereka pasti Tuhanmu akan menyempurnakan (pembalasan) pekerjaan mereka. Sesungguhnya Dia Maha Mengetahui apa yang mereka kerjakan."
    },
    {
      number: 112,
      arabic: "فَاسْتَقِمْ كَمَا أُمِرْتَ وَمَن تَابَ مَعَكَ وَلَا تَطْغَوْا ۚ إِنَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ",
      transliteration: "Fastaqim kama umirta wa man taba ma'aka wa la tatgau, innahu bima ta'maluna basir",
      translation: "Maka tetaplah kamu pada jalan yang benar, sebagaimana diperintahkan kepadamu dan (juga) orang yang telah taubat beserta kamu dan janganlah kamu melampaui batas. Sesungguhnya Dia Maha Melihat apa yang kamu kerjakan."
    },
    {
      number: 113,
      arabic: "وَلَا تَرْكَنُوا إِلَى الَّذِينَ ظَلَمُوا فَتَمَسَّكُمُ النَّارُ وَمَا لَكُم مِّن دُونِ اللَّهِ مِنْ أَوْلِيَاءَ ثُمَّ لَا تُنصَرُونَ",
      transliteration: "Wa la tarkanu ilallazina zalamu fa tamassakumun naru wa ma lakum min dunillahi min auliya'a summa la tunsarun",
      translation: "Dan janganlah kamu cenderung kepada orang-orang yang zalim yang menyebabkan kamu disentuh api neraka, dan sekali-kali kamu tiada mempunyai seorang penolongpun selain daripada Allah, kemudian kamu tidak akan diberi pertolongan."
    },
    {
      number: 114,
      arabic: "وَأَقِمِ الصَّلَاةَ طَرَفَيِ النَّهَارِ وَزُلَفًا مِّنَ اللَّيْلِ ۚ إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ ۚ ذَٰلِكَ ذِكْرَىٰ لِلذَّاكِرِينَ",
      transliteration: "Wa aqimis salata tarafain nahari wa zulafam minal lail, innal hasanati yuzhib nas sayyi'at, zalika zikra liz zakirin",
      translation: "Dan dirikanlah sembahyang itu pada kedua tepi siang (pagi dan petang) dan pada bahagian permulaan daripada malam. Sesungguhnya perbuatan-perbuatan yang baik itu menghapuskan (dosa) perbuatan-perbuatan yang buruk. Itulah peringatan bagi orang-orang yang ingat."
    },
    {
      number: 115,
      arabic: "وَاصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ",
      transliteration: "Wasbir fa innallaha la yudi'u ajral muhsinin",
      translation: "Dan bersabarlah, karena sesungguhnya Allah tiada menyia-nyiakan pahala orang-orang yang berbuat kebaikan."
    },
 {
 number: 116,
 arabic: "فَلَوْلَا كَانَ مِنَ الْقُرُونِ مِن قَبْلِكُمْ أُولُو بَقِيَّةٍ يَنْهَوْنَ عَنِ الْفَسَادِ فِي الْأَرْضِ إِلَّا قَلِيلًا مِّمَّنْ أَنجَيْنَا مِنْهُمْ ۗ وَاتَّبَعَ الَّذِينَ ظَلَمُوا مَا أُتْرِفُوا فِيهِ وَكَانُوا مُجْرِمِينَ",
 transliteration: "Fa laula kana minal quruni ming qablikum ulu baqiyyatiy yanhau na 'anil fasadi fil ardi illa qalilam mimman anjaina minhum, wattaba'al lazina zalamu ma utrifu fihi wa kanu mujrimin",
 translation: "Maka mengapa tidak ada dari umat-umat yang sebelum kamu orang-orang yang mempunyai keutamaan yang melarang daripada (mengerjakan) kerusakan di muka bumi, kecuali sebahagian kecil di antara orang-orang yang telah Kami selamatkan di antara mereka, dan orang-orang yang zalim hanya mementingkan kenikmatan yang mewah yang ada pada mereka, dan mereka adalah orang-orang yang berdosa."
 },
 {
 number: 117,
 arabic: "وَمَا كَانَ رَبُّكَ لِيُهْلِكَ الْقُرَىٰ بِظُلْمٍ وَأَهْلُهَا مُصْلِحُونَ",
 transliteration: "Wa ma kana rabbuka li yuhlikal qura bi zulmiw wa ahluha muslihun",
 translation: "Dan Tuhanmu sekali-kali tidak akan membinasakan negeri-negeri secara zalim, sedang penduduknya orang-orang yang berbuat kebaikan."
 },
 {
 number: 118,
 arabic: "وَلَوْ شَاءَ رَبُّكَ لَجَعَلَ النَّاسَ أُمَّةً وَاحِدَةً ۖ وَلَا يَزَالُونَ مُخْتَلِفِينَ",
 transliteration: "Wa lau sya'a rabbuka la ja'alan nasa ummataw wahidah, wa la yazaluna mukhtalifin",
 translation: "Jikalau Tuhanmu menghendaki, tentu Dia menjadikan manusia umat yang satu, tetapi mereka senantiasa berselisih pendapat,"
 },
 {
 number: 119,
 arabic: "إِلَّا مَن رَّحِمَ رَبُّكَ ۚ وَلِذَٰلِكَ خَلَقَهُمْ ۗ وَتَمَّتْ كَلِمَةُ رَبِّكَ لَأَمْلَأَنَّ جَهَنَّمَ مِنَ الْجِنَّةِ وَالنَّاسِ أَجْمَعِينَ",
 transliteration: "Illa mar rahima rabbuk, wa li zalika khalaqahum, wa tammat kalimatu rabbika la amla'anna jahannama minal jinnati wan nasi ajma'in",
 translation: "kecuali orang-orang yang diberi rahmat oleh Tuhanmu. Dan untuk itulah Allah menciptakan mereka. Kalimat Tuhanmu (keputusan-Nya) telah ditetapkan: sesungguhnya Aku akan memenuhi neraka Jahannam dengan jin dan manusia (yang durhaka) semuanya."
 },
 {
 number: 120,
 arabic: "وَكُلًّا نَّقُصُّ عَلَيْكَ مِنْ أَنبَاءِ الرُّسُلِ مَا نُثَبِّتُ بِهِ فُؤَادَكَ ۚ وَجَاءَكَ فِي هَٰذِهِ الْحَقُّ وَمَوْعِظَةٌ وَذِكْرَىٰ لِلْمُؤْمِنِينَ",
 transliteration: "Wa kullan naqussu 'alaika min amba'ir rusuli ma nusabbitu bihi fu'adak, wa ja'aka fi hazihil haqqu wa mau'izatuw wa zikra lil mu'minin",
 translation: "Dan semua kisah dari rasul-rasul Kami ceritakan kepadamu, ialah kisah-kisah yang dengannya Kami teguhkan hatimu; dan dalam surat ini telah datang kepadamu kebenaran serta pengajaran dan peringatan bagi orang-orang yang beriman."
 },
 {
 number: 121,
 arabic: "وَقُل لِّلَّذِينَ لَا يُؤْمِنُونَ اعْمَلُوا عَلَىٰ مَكَانَتِكُمْ إِنَّا عَامِلُونَ",
 transliteration: "Wa qul lillazina la yu'minuna'malu 'ala makanatikum inna 'amilun",
 translation: "Dan katakanlah kepada orang-orang yang tidak beriman: \"Berbuatlah menurut kemampuanmu; sesungguhnya kamipun berbuat (pula)."
 },
 {
 number: 122,
 arabic: "وَانتَظِرُوا إِنَّا مُنتَظِرُونَ",
 transliteration: "Wantaziru inna muntazirun",
 translation: "Dan tunggulah, sesungguhnya kami pun menunggu (pula)\"."
 },
 {
 number: 123,
 arabic: "وَلِلَّهِ غَيْبُ السَّمَاوَاتِ وَالْأَرْضِ وَإِلَيْهِ يُرْجَعُ الْأَمْرُ كُلُّهُ فَاعْبُدْهُ وَتَوَكَّلْ عَلَيْهِ ۚ وَمَا رَبُّكَ بِغَافِلٍ عَمَّا تَعْمَلُونَ",
 transliteration: "Wa lillahi ghaibus samawati wal ardi wa ilaihi yurja'ul amru kulluhu fa'budhu wa tawakkal 'alaih, wa ma rabbuka bi gafilin 'amma ta'malun",
 translation: "Dan kepunyaan Allah-lah apa yang ghaib di langit dan di bumi dan kepada-Nya-lah dikembalikan urusan-urusan semuanya, maka sembahlah Dia, dan bertawakkallah kepada-Nya. Dan sekali-kali Tuhanmu tidak lalai dari apa yang kamu kerjakan."
 }
 ];

  // ============================================================================
  // AUDIO CONFIGURATION
  // ============================================================================
  const AUDIO_CONFIG = {
    baseURL: 'https://everyayah.com/data/',
    surahNumber: '011', // Surah Hud
    qaris: {
      'Alafasy_128kbps': 'Mishary Rashid Alafasy',
      'Abdul_Basit_Murattal_192kbps': 'Abdul Basit',
      'Ghamadi_40kbps': 'Saad Al-Ghamadi',
      'Husary_128kbps': 'Mahmoud Khalil Al-Husary',
      'Abdurrahmaan_As-Sudais_192kbps': 'Abdul Rahman Al-Sudais'
    },
    defaultQari: 'Alafasy_128kbps'
  };

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  let state = {
    currentVerse: 0,
    isPlaying: false,
    selectedQari: AUDIO_CONFIG.defaultQari,
    settings: {
      arabicFontSize: 28,
      translationFontSize: 16,
      autoScroll: true,
      autoPlayNext: true
    },
    audio: null
  };

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  function init() {
    try {
      loadSettings();
      renderVerses();
      setupEventListeners();
      initializeAudio();
      console.log('✅ Surah Hud tool initialized successfully');
    } catch (error) {
      console.error('❌ Initialization error:', error);
      showToast('Error loading tool. Please refresh the page.');
    }
  }

  // ============================================================================
  // RENDERING
  // ============================================================================
  function renderVerses() {
    const container = document.getElementById('versesContainer');
    if (!container) {
      console.error('Verses container not found');
      return;
    }

    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading verses...</p></div>';

    setTimeout(() => {
      try {
        const html = surahData.map(verse => createVerseHTML(verse)).join('');
        container.innerHTML = html;
        applyFontSettings();
      } catch (error) {
        console.error('Error rendering verses:', error);
        container.innerHTML = '<div class="loading"><p>Error loading verses. Please refresh the page.</p></div>';
      }
    }, 100);
  }

  function createVerseHTML(verse) {
    return `
      <div class="verse-card" id="verse-${verse.number}" data-verse="${verse.number}">
        <div class="verse-number">Ayat ${verse.number}</div>
        <div class="verse-arabic">${verse.arabic}</div>
        <div class="verse-transliteration">${verse.transliteration}</div>
        <div class="verse-translation">${verse.translation}</div>
        <div class="verse-actions">
          <button class="action-btn" onclick="window.surahHudTool.playVerse(${verse.number})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Play
          </button>
          <button class="action-btn" onclick="window.surahHudTool.copyVerse(${verse.number})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy
          </button>
          <button class="action-btn" onclick="window.surahHudTool.shareVerse(${verse.number})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // AUDIO PLAYER
  // ============================================================================
  function initializeAudio() {
    state.audio = new Audio();
    state.audio.addEventListener('ended', handleAudioEnded);
    state.audio.addEventListener('error', handleAudioError);
    state.audio.addEventListener('timeupdate', updateProgress);
  }

  function getAudioURL(verseNumber) {
    const paddedVerse = String(verseNumber).padStart(3, '0');
    return `${AUDIO_CONFIG.baseURL}${state.selectedQari}/${AUDIO_CONFIG.surahNumber}${paddedVerse}.mp3`;
  }

  function playVerse(verseNumber) {
    try {
      state.currentVerse = verseNumber - 1;
      const audioURL = getAudioURL(verseNumber);
      
      state.audio.src = audioURL;
      state.audio.play();
      state.isPlaying = true;
      
      updateUI();
      highlightVerse(verseNumber);
      
      if (state.settings.autoScroll) {
        scrollToVerse(verseNumber);
      }
    } catch (error) {
      console.error('Error playing verse:', error);
      showToast('Error playing audio. Please try again.');
    }
  }

  function togglePlayPause() {
    if (state.isPlaying) {
      state.audio.pause();
      state.isPlaying = false;
    } else {
      if (state.currentVerse === 0) {
        playVerse(1);
      } else {
        state.audio.play();
        state.isPlaying = true;
      }
    }
    updateUI();
  }

  function handleAudioEnded() {
    if (state.settings.autoPlayNext && state.currentVerse < surahData.length - 1) {
      setTimeout(() => {
        playVerse(state.currentVerse + 2);
      }, 500);
    } else {
      state.isPlaying = false;
      updateUI();
    }
  }

  function handleAudioError(e) {
    console.error('Audio error:', e);
    showToast('Error loading audio. Please check your connection.');
    state.isPlaying = false;
    updateUI();
  }

  function updateProgress() {
    const progressBar = document.getElementById('progressBar');
    const audioTime = document.getElementById('audioTime');
    
    if (progressBar && state.audio.duration) {
      const percent = (state.audio.currentTime / state.audio.duration) * 100;
      progressBar.style.width = `${percent}%`;
    }
    
    if (audioTime) {
      const current = formatTime(state.audio.currentTime);
      const total = formatTime(state.audio.duration);
      audioTime.textContent = `${current} / ${total}`;
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // ============================================================================
  // UI UPDATES
  // ============================================================================
  function updateUI() {
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const currentVerseLabel = document.getElementById('currentVerse');
    
    if (playIcon && pauseIcon) {
      playIcon.style.display = state.isPlaying ? 'none' : 'block';
      pauseIcon.style.display = state.isPlaying ? 'block' : 'none';
    }
    
    if (currentVerseLabel) {
      currentVerseLabel.textContent = `Ayat ${state.currentVerse + 1}`;
    }
  }

  function highlightVerse(verseNumber) {
    document.querySelectorAll('.verse-card').forEach(card => {
      card.classList.remove('active');
    });
    
    const verseCard = document.getElementById(`verse-${verseNumber}`);
    if (verseCard) {
      verseCard.classList.add('active');
    }
  }

  function scrollToVerse(verseNumber) {
    const verseCard = document.getElementById(`verse-${verseNumber}`);
    if (verseCard) {
      verseCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function applyFontSettings() {
    const arabicElements = document.querySelectorAll('.verse-arabic');
    const translationElements = document.querySelectorAll('.verse-transliteration, .verse-translation');
    
    arabicElements.forEach(el => {
      el.style.fontSize = `${state.settings.arabicFontSize}px`;
    });
    
    translationElements.forEach(el => {
      el.style.fontSize = `${state.settings.translationFontSize}px`;
    });
  }

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================
  function setupEventListeners() {
    // Play/Pause Button
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', togglePlayPause);
    }

    // Qari Selector
    const qariSelector = document.getElementById('qariSelector');
    if (qariSelector) {
      qariSelector.addEventListener('change', (e) => {
        state.selectedQari = e.target.value;
        saveSettings();
        if (state.isPlaying) {
          playVerse(state.currentVerse + 1);
        }
      });
    }

    // Settings Toggle
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsContent = document.getElementById('settingsContent');
    if (settingsToggle && settingsContent) {
      settingsToggle.addEventListener('click', () => {
        const isHidden = settingsContent.style.display === 'none';
        settingsContent.style.display = isHidden ? 'block' : 'none';
      });
    }

    // Font Size Sliders
    setupSlider('arabicSizeSlider', 'arabicSizeValue', (value) => {
      state.settings.arabicFontSize = parseInt(value);
      applyFontSettings();
      saveSettings();
    });

    setupSlider('translationSizeSlider', 'translationSizeValue', (value) => {
      state.settings.translationFontSize = parseInt(value);
      applyFontSettings();
      saveSettings();
    });

    // Checkboxes
    const autoScrollToggle = document.getElementById('autoScrollToggle');
    if (autoScrollToggle) {
      autoScrollToggle.addEventListener('change', (e) => {
        state.settings.autoScroll = e.target.checked;
        saveSettings();
      });
    }

    const autoPlayNextToggle = document.getElementById('autoPlayNextToggle');
    if (autoPlayNextToggle) {
      autoPlayNextToggle.addEventListener('change', (e) => {
        state.settings.autoPlayNext = e.target.checked;
        saveSettings();
      });
    }

    // Progress Bar Click
    const audioProgress = document.querySelector('.audio-progress');
    if (audioProgress) {
      audioProgress.addEventListener('click', (e) => {
        const rect = audioProgress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        state.audio.currentTime = percent * state.audio.duration;
      });
    }
  }

  function setupSlider(sliderId, valueId, callback) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);
    
    if (slider && valueDisplay) {
      slider.addEventListener('input', (e) => {
        const value = e.target.value;
        valueDisplay.textContent = `${value}px`;
        callback(value);
      });
    }
  }

  // ============================================================================
  // USER ACTIONS
  // ============================================================================
  function copyVerse(verseNumber) {
    const verse = surahData[verseNumber - 1];
    const text = `${verse.arabic}\n\n${verse.transliteration}\n\n${verse.translation}\n\n(Surah Hud, Ayat ${verseNumber})`;
    
    navigator.clipboard.writeText(text).then(() => {
      showToast('Ayat berjaya disalin!');
    }).catch(err => {
      console.error('Copy failed:', err);
      showToast('Gagal menyalin ayat');
    });
  }

  function shareVerse(verseNumber) {
    const verse = surahData[verseNumber - 1];
    const text = `${verse.arabic}\n\n${verse.translation}\n\n(Surah Hud, Ayat ${verseNumber})\n\nhttps://www.ilmualam.com/surah-hud#verse-${verseNumber}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Surah Hud - Ayat ${verseNumber}`,
        text: text
      }).catch(err => console.log('Share cancelled'));
    } else {
      copyVerse(verseNumber);
      showToast('Link ayat telah disalin!');
    }
  }

  // ============================================================================
  // SETTINGS PERSISTENCE
  // ============================================================================
  function loadSettings() {
    try {
      const saved = localStorage.getItem('surahHudSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        state.settings = { ...state.settings, ...settings };
        
        // Apply to UI
        const arabicSlider = document.getElementById('arabicSizeSlider');
        const translationSlider = document.getElementById('translationSizeSlider');
        const autoScrollToggle = document.getElementById('autoScrollToggle');
        const autoPlayNextToggle = document.getElementById('autoPlayNextToggle');
        
        if (arabicSlider) {
          arabicSlider.value = state.settings.arabicFontSize;
          document.getElementById('arabicSizeValue').textContent = `${state.settings.arabicFontSize}px`;
        }
        if (translationSlider) {
          translationSlider.value = state.settings.translationFontSize;
          document.getElementById('translationSizeValue').textContent = `${state.settings.translationFontSize}px`;
        }
        if (autoScrollToggle) autoScrollToggle.checked = state.settings.autoScroll;
        if (autoPlayNextToggle) autoPlayNextToggle.checked = state.settings.autoPlayNext;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem('surahHudSettings', JSON.stringify(state.settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // ============================================================================
  // TOAST NOTIFICATIONS
  // ============================================================================
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================
  window.surahHudTool = {
    playVerse,
    copyVerse,
    shareVerse,
    togglePlayPause
  };

  // ============================================================================
  // AUTO-INIT
  // ============================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
