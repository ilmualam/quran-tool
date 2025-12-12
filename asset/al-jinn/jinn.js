/*!
 * Surah Al-Jinn Interactive Reader Tool (FIXED)
 * - Audio diambil terus dari API audio edition (bukan hardcode global number)
 * - Search tak rosakkan index (play ikut verse sebenar)
 * - Fallback audioSecondary mp3 -> audio
 */

(function () {
  "use strict";

  const SURAH_NUM = 72;
  const API_BASE = "https://api.alquran.cloud/v1";

  // Editions (tambah audio edition ar.alafasy)
  const EDITIONS = "quran-simple,en.transliteration,ms.basmeih,ar.alafasy";

  const STORAGE_KEY = "ilm_jinn_bookmarks";
  const LAST_VERSE_KEY = "ilm_jinn_last_verse";

  let verses = [];            // full list (source of truth)
  let viewVerses = [];        // list yang sedang dipaparkan (untuk search)
  let currentVerse = 0;       // index dalam verses[]
  let audio = null;
  let bookmarks = [];
  let isPlaying = false;

  function init() {
    const container = document.getElementById("surahJinnTool");
    if (!container) return;

    loadBookmarks();
    renderUI(container);
    fetchVerses();
  }

  function loadBookmarks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      bookmarks = stored ? JSON.parse(stored) : [];
    } catch (e) {
      bookmarks = [];
    }
  }

  function saveBookmarks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {}
  }

  function renderUI(container) {
    container.innerHTML = `
      <div class="ilm-x-reader">
        <div class="ilm-x-reader-header">
          <h3>🎧 Tool Interaktif Surah Al-Jinn</h3>
          <div class="ilm-x-controls">
            <button class="ilm-x-btn ilm-x-btn-search" onclick="window.ilmJinnReader.toggleSearch()" title="Cari Ayat">🔍</button>
            <button class="ilm-x-btn ilm-x-btn-bookmarks" onclick="window.ilmJinnReader.showBookmarks()" title="Lihat Bookmark">📑 <span class="ilm-x-bookmark-count">0</span></button>
            <button class="ilm-x-btn ilm-x-btn-share" onclick="window.ilmJinnReader.share()" title="Share">📤</button>
          </div>
        </div>

        <div class="ilm-x-search-box" style="display:none">
          <input type="text" class="ilm-x-search-input" placeholder="Cari ayat (Rumi atau Malay)..." />
          <button class="ilm-x-btn-close" onclick="window.ilmJinnReader.toggleSearch()">✕</button>
        </div>

        <div class="ilm-x-player">
          <div class="ilm-x-progress-bar">
            <div class="ilm-x-progress"></div>
          </div>
          <div class="ilm-x-player-controls">
            <button class="ilm-x-btn-prev" onclick="window.ilmJinnReader.prevVerse()" title="Ayat Sebelum">⏮</button>
            <button class="ilm-x-btn-play" onclick="window.ilmJinnReader.togglePlay()" title="Play/Pause">▶️</button>
            <button class="ilm-x-btn-next" onclick="window.ilmJinnReader.nextVerse()" title="Ayat Seterusnya">⏭</button>
            <span class="ilm-x-verse-num">Ayat 1/28</span>
          </div>
        </div>

        <div class="ilm-x-verses-container">
          <div class="ilm-x-loading">⏳ Memuatkan ayat-ayat...</div>
        </div>
      </div>
    `;

    updateBookmarkCount();
  }

  async function fetchVerses() {
    const container = document.querySelector(".ilm-x-verses-container");

    try {
      const url = `${API_BASE}/surah/${SURAH_NUM}/editions/${EDITIONS}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code !== 200 || !Array.isArray(data.data) || data.data.length < 4) {
        throw new Error("Invalid API response");
      }

      const arabicAyahs = data.data[0].ayahs;
      const rumiAyahs = data.data[1].ayahs;
      const malayAyahs = data.data[2].ayahs;
      const audioAyahs = data.data[3].ayahs; // ar.alafasy

      // Build verses using GLOBAL number dari API (no hardcode!)
      verses = arabicAyahs.map((a, i) => {
        const globalNum = a.number; // global ayah number from API
        const audioUrl =
          (audioAyahs[i] && Array.isArray(audioAyahs[i].audioSecondary) && audioAyahs[i].audioSecondary[0]) ||
          (audioAyahs[i] && audioAyahs[i].audio) ||
          "";

        return {
          number: i + 1,
          globalNum,
          arabic: a.text,
          rumi: (rumiAyahs[i] && rumiAyahs[i].text) || "",
          malay: (malayAyahs[i] && malayAyahs[i].text) || "",
          audio: audioUrl
        };
      });

      // default view = all
      viewVerses = verses.map((v, idx) => ({ ...v, _idx: idx }));
      renderVerses(viewVerses);

      // restore last read (1..N)
      const lastVerse = parseInt(localStorage.getItem(LAST_VERSE_KEY) || "0", 10);
      if (lastVerse >= 1 && lastVerse <= verses.length) {
        currentVerse = lastVerse - 1;
        scrollToVerse(currentVerse);
        updateVerseDisplay();
      }
    } catch (err) {
      console.error("Fetch error:", err);
      container.innerHTML = `
        <div class="ilm-x-error">
          <p>❌ Maaf, gagal memuatkan ayat. Sila semak sambungan internet anda.</p>
          <button class="ilm-x-btn-retry" onclick="window.ilmJinnReader.retry()">🔄 Cuba Lagi</button>
        </div>
      `;
    }
  }

  // viewList = [{...verse, _idx: originalIndexInVerses}]
  function renderVerses(viewList) {
    const container = document.querySelector(".ilm-x-verses-container");

    const html = viewList
      .map((v) => {
        const realIndex = v._idx;
        const isBm = bookmarks.includes(v.number);

        return `
          <div class="ilm-x-verse ${isBm ? "ilm-x-bookmarked" : ""}" data-verse="${realIndex}" id="verse-${realIndex}">
            <div class="ilm-x-verse-header">
              <span class="ilm-x-verse-badge">Ayat ${v.number}</span>
              <button class="ilm-x-btn-bookmark ${isBm ? "active" : ""}" onclick="window.ilmJinnReader.toggleBookmark(${v.number})" title="Tandabuku">
                ${isBm ? "🔖" : "📌"}
              </button>
            </div>
            <div class="ilm-x-arabic">${escapeHTML(v.arabic)}</div>
            <div class="ilm-x-rumi">${escapeHTML(v.rumi)}</div>
            <div class="ilm-x-translation">${escapeHTML(v.malay)}</div>
            <div class="ilm-x-verse-actions">
              <button class="ilm-x-btn-small" onclick="window.ilmJinnReader.playVerse(${realIndex})" title="Main Audio">🔊 Audio</button>
              <button class="ilm-x-btn-small" onclick="window.ilmJinnReader.copyVerse(${realIndex})" title="Salin">📋 Copy</button>
            </div>
          </div>
        `;
      })
      .join("");

    container.innerHTML = html;
    updateVerseDisplay();
  }

  function playVerse(index) {
    if (index < 0 || index >= verses.length) return;

    currentVerse = index;
    const verse = verses[index];

    if (!verse.audio) {
      alert("Audio untuk ayat ini tiada.");
      return;
    }

    if (audio) {
      audio.pause();
      audio.src = "";
      audio = null;
    }

    audio = new Audio();
    audio.preload = "auto";
    audio.src = verse.audio;
    audio.volume = 1.0;

    // penting: cuba play bila metadata ready (lebih stabil dari canplay je)
    const tryPlay = () => {
      audio.play().then(() => {
        isPlaying = true;
        updatePlayButton();
        highlightVerse(index);
        scrollToVerse(index);
        updateProgressBar();
        localStorage.setItem(LAST_VERSE_KEY, String(verse.number));
      }).catch((e) => {
        // Autoplay policy / user gesture issue
        isPlaying = false;
        updatePlayButton();
        console.warn("Play blocked:", e);
      });
    };

    audio.addEventListener("loadedmetadata", tryPlay, { once: true });
    audio.addEventListener("timeupdate", updateProgressBar);

    audio.addEventListener("ended", () => {
      isPlaying = false;
      updatePlayButton();
      if (index < verses.length - 1) setTimeout(() => playVerse(index + 1), 600);
    });

    audio.addEventListener("error", (e) => {
      console.error("Audio error:", e, verse.audio);
      alert("Audio gagal dimainkan. Cuba lagi.");
      isPlaying = false;
      updatePlayButton();
    });
  }

  function togglePlay() {
    if (!verses.length) return;

    if (!audio) {
      playVerse(currentVerse);
      return;
    }

    if (isPlaying) {
      audio.pause();
      isPlaying = false;
    } else {
      audio.play().then(() => {
        isPlaying = true;
      }).catch(() => {
        isPlaying = false;
      });
    }
    updatePlayButton();
  }

  function prevVerse() {
    if (currentVerse > 0) playVerse(currentVerse - 1);
  }

  function nextVerse() {
    if (currentVerse < verses.length - 1) playVerse(currentVerse + 1);
  }

  function highlightVerse(index) {
    document.querySelectorAll(".ilm-x-verse").forEach((el) => {
      const v = parseInt(el.getAttribute("data-verse") || "-1", 10);
      el.classList.toggle("ilm-x-active", v === index);
    });
    updateVerseDisplay();
  }

  function scrollToVerse(index) {
    const el = document.getElementById(`verse-${index}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function updatePlayButton() {
    const btn = document.querySelector(".ilm-x-btn-play");
    if (!btn) return;
    btn.textContent = isPlaying ? "⏸" : "▶️";
    btn.title = isPlaying ? "Pause" : "Play";
  }

  function updateVerseDisplay() {
    const display = document.querySelector(".ilm-x-verse-num");
    if (!display) return;
    display.textContent = `Ayat ${currentVerse + 1}/${verses.length || 28}`;
  }

  function updateProgressBar() {
    if (!audio || !audio.duration || Number.isNaN(audio.duration)) return;
    const progress = (audio.currentTime / audio.duration) * 100;
    const bar = document.querySelector(".ilm-x-progress");
    if (bar) bar.style.width = `${progress}%`;
  }

  function toggleBookmark(verseNum) {
    const idx = bookmarks.indexOf(verseNum);
    if (idx > -1) bookmarks.splice(idx, 1);
    else bookmarks.push(verseNum);

    saveBookmarks();
    updateBookmarkCount();

    // refresh icon state if verse exists in DOM
    const verseEl = document.querySelector(`.ilm-x-verse[data-verse="${verseNum - 1}"]`);
    const btnEl = verseEl?.querySelector(".ilm-x-btn-bookmark");
    if (verseEl && btnEl) {
      const on = bookmarks.includes(verseNum);
      verseEl.classList.toggle("ilm-x-bookmarked", on);
      btnEl.classList.toggle("active", on);
      btnEl.textContent = on ? "🔖" : "📌";
    }
  }

  function updateBookmarkCount() {
    const countEl = document.querySelector(".ilm-x-bookmark-count");
    if (!countEl) return;
    countEl.textContent = String(bookmarks.length);
    countEl.style.display = bookmarks.length > 0 ? "inline" : "none";
  }

  function showBookmarks() {
    if (bookmarks.length === 0) {
      alert("Tiada penanda buku. Klik ikon 📌 pada ayat untuk menanda.");
      return;
    }
    const list = bookmarks.map((n) => `Ayat ${n}`).join(", ");
    const choice = confirm(`Ayat yang ditanda:\n${list}\n\nKlik OK untuk pergi ke ayat pertama yang ditanda.`);
    if (choice) {
      const first = Math.min(...bookmarks);
      scrollToVerse(first - 1);
      highlightVerse(first - 1);
    }
  }

  function toggleSearch() {
    const searchBox = document.querySelector(".ilm-x-search-box");
    const input = document.querySelector(".ilm-x-search-input");
    if (!searchBox || !input) return;

    const isOpen = searchBox.style.display !== "none";
    if (!isOpen) {
      searchBox.style.display = "flex";
      input.value = "";
      input.focus();
      input.addEventListener("input", handleSearch);
    } else {
      searchBox.style.display = "none";
      input.value = "";
      viewVerses = verses.map((v, idx) => ({ ...v, _idx: idx }));
      renderVerses(viewVerses);
    }
  }

  function handleSearch(e) {
    const q = (e.target.value || "").toLowerCase().trim();
    if (!q) {
      viewVerses = verses.map((v, idx) => ({ ...v, _idx: idx }));
      renderVerses(viewVerses);
      return;
    }

    const filtered = verses
      .map((v, idx) => ({ ...v, _idx: idx }))
      .filter((v) =>
        (v.rumi || "").toLowerCase().includes(q) ||
        (v.malay || "").toLowerCase().includes(q) ||
        String(v.number) === q
      );

    if (filtered.length) renderVerses(filtered);
    else document.querySelector(".ilm-x-verses-container").innerHTML = '<div class="ilm-x-no-result">🔍 Tiada hasil ditemui</div>';
  }

  function copyVerse(index) {
    const verse = verses[index];
    if (!verse) return;

    const text = `Surah Al-Jinn (72:${verse.number})\n\n${verse.arabic}\n\n${verse.rumi}\n\n${verse.malay}\n\nDaripada: IlmuAlam.com`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert("✅ Ayat berjaya disalin!")).catch(() => fallbackCopy(text));
    } else fallbackCopy(text);
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      alert("✅ Ayat berjaya disalin!");
    } catch (e) {
      alert("❌ Gagal menyalin. Sila salin secara manual.");
    }
    document.body.removeChild(textarea);
  }

  function share() {
    const url = window.location.href;
    const text = "Baca Surah Al-Jinn lengkap dengan audio, rumi & terjemahan di IlmuAlam.com";
    if (navigator.share) navigator.share({ title: "Surah Al-Jinn", text, url }).catch(() => {});
    else window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "width=600,height=400");
  }

  function retry() {
    const container = document.querySelector(".ilm-x-verses-container");
    if (container) container.innerHTML = '<div class="ilm-x-loading">⏳ Memuatkan ayat-ayat...</div>';
    fetchVerses();
  }

  // simple HTML escape (elak markup pelik masuk DOM)
  function escapeHTML(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.ilmJinnReader = {
    togglePlay,
    prevVerse,
    nextVerse,
    playVerse,
    toggleBookmark,
    showBookmarks,
    toggleSearch,
    copyVerse,
    share,
    retry
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
