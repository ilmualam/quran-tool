// Nama Fail: yusuf/ysv2.js
// Surah Yusuf Interactive Tool v2
// - Arabic + BM Basmeih + Transliteration
// - Per-ayat audio
// - Bookmark (localStorage)
// - Copy + Share

(function () {
  "use strict";

  // --- Konfigurasi Utama ---
  const CONFIG = {
    surahId:
      (window.CONFIG && window.CONFIG.surahId) ? window.CONFIG.surahId : 12,
    apiBase: "https://api.alquran.cloud/v1",
    textEditions: ["quran-uthmani", "ms.basmeih", "en.transliteration"],
    audioEdition: "ar.alafasy",
    bookmarkKey: "ia_surah_yusuf_bookmarks_v1"
  };

  const state = {
    ayahs: [],
    currentIndex: 0,
    isPlaying: false,
    audio: null,
    bookmarks: []
  };

  // --- Helper DOM ---
  function $(id) {
    return document.getElementById(id);
  }

  function renderLoading(message) {
    const listEl = $("yusuf-list");
    if (!listEl) return;
    listEl.innerHTML =
      '<div class="yusuf-loading">' + (message || "Memuatkan Surah Yusuf") + "</div>";
  }

  function renderError(message) {
    const listEl = $("yusuf-list");
    if (!listEl) return;
    listEl.innerHTML =
      '<div class="yusuf-loading" style="color:#b91c1c">' +
      (message || "Ralat memuatkan Surah Yusuf. Sila cuba lagi.") +
      "</div>";
  }

  // --- Bookmark Storage ---
  function loadBookmarks() {
    try {
      const raw = localStorage.getItem(CONFIG.bookmarkKey);
      state.bookmarks = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(state.bookmarks)) state.bookmarks = [];
    } catch (e) {
      state.bookmarks = [];
    }
  }

  function saveBookmarks() {
    try {
      localStorage.setItem(CONFIG.bookmarkKey, JSON.stringify(state.bookmarks));
    } catch (e) {
      // ignore quota error
    }
  }

  function isBookmarked(ayahNumber) {
    return state.bookmarks.indexOf(ayahNumber) !== -1;
  }

  function toggleBookmark(ayahNumber) {
    const idx = state.bookmarks.indexOf(ayahNumber);
    if (idx === -1) {
      state.bookmarks.push(ayahNumber);
    } else {
      state.bookmarks.splice(idx, 1);
    }
    saveBookmarks();
    updateBookmarkUI();
  }

  // --- Fetch Data (Text + Audio) ---
  async function fetchData() {
    const textUrl =
      CONFIG.apiBase +
      "/surah/" +
      CONFIG.surahId +
      "/editions/" +
      CONFIG.textEditions.join(",");
    const audioUrl =
      CONFIG.apiBase +
      "/surah/" +
      CONFIG.surahId +
      "/" +
      CONFIG.audioEdition;

    const [textRes, audioRes] = await Promise.all([
      fetch(textUrl),
      fetch(audioUrl)
    ]);

    if (!textRes.ok) {
      throw new Error("Gagal memuat teks Surah");
    }

    if (!audioRes.ok) {
      throw new Error("Gagal memuat audio Surah");
    }

    const textJson = await textRes.json();
    const audioJson = await audioRes.json();

    const editions = textJson.data || [];
    const uthmani =
      editions.find((e) => e.identifier === "quran-uthmani") || editions[0];
    const malay = editions.find((e) => e.identifier === "ms.basmeih");
    const translit = editions.find(
      (e) => e.identifier === "en.transliteration"
    );

    if (!uthmani || !uthmani.ayahs) {
      throw new Error("Struktur data teks tidak sah");
    }

    const audioAyahs = (audioJson.data && audioJson.data.ayahs) || [];

    const ayahs = uthmani.ayahs.map(function (aya, idx) {
      const n = aya.numberInSurah;
      const audioObj = audioAyahs.find(function (a) {
        return a.numberInSurah === n;
      });

      return {
        number: n,
        arabic: aya.text,
        translation: malay && malay.ayahs && malay.ayahs[idx]
          ? malay.ayahs[idx].text
          : "",
        transliteration:
          translit && translit.ayahs && translit.ayahs[idx]
            ? translit.ayahs[idx].text
            : "",
        audio: audioObj && audioObj.audio ? audioObj.audio : ""
      };
    });

    return {
      ayahs: ayahs,
      total: ayahs.length
    };
  }

  // --- Render Ayat List ---
  function renderAyatList() {
    const listEl = $("yusuf-list");
    if (!listEl) return;

    if (!state.ayahs.length) {
      renderLoading("Tiada data ayat ditemui.");
      return;
    }

    const items = state.ayahs
      .map(function (ayah) {
        const n = ayah.number;
        const bookmarked = isBookmarked(n);
        const bookmarkText = bookmarked ? "✔ Disimpan" : "🔖 Simpan";
        const bookmarkClass = bookmarked ? " yusuf-ayat-bookmarked" : "";

        return (
          '<article class="yusuf-ayat' +
          bookmarkClass +
          '" data-ayah="' +
          n +
          '">' +
          '<header style="display:flex;justify-content:space-between;align-items:center;gap:0.5em;">' +
          '<div style="display:flex;align-items:center;gap:0.5em;">' +
          '<span class="yusuf-ayat-number">' +
          n +
          "</span>" +
          '<span class="yusuf-ayat-label">Ayat ' +
          n +
          "</span>" +
          "</div>" +
          '<button type="button" class="yusuf-action-btn yusuf-bookmark-btn" data-ayah="' +
          n +
          '">' +
          bookmarkText +
          "</button>" +
          "</header>" +
          '<div class="yusuf-ayat-arabic" dir="rtl">' +
          ayah.arabic +
          "</div>" +
          (ayah.transliteration
            ? '<div class="yusuf-ayat-translit">' +
              ayah.transliteration +
              "</div>"
            : "") +
          (ayah.translation
            ? '<div class="yusuf-ayat-translation">' +
              ayah.translation +
              "</div>"
            : "") +
          '<div class="yusuf-ayat-actions">' +
          '<button type="button" class="yusuf-action-btn" data-action="play" data-ayah="' +
          n +
          '">▶ Main</button>' +
          '<button type="button" class="yusuf-action-btn" data-action="copy" data-ayah="' +
          n +
          '">📋 Salin</button>' +
          '<button type="button" class="yusuf-action-btn" data-action="share" data-ayah="' +
          n +
          '">🔗 Kongsi</button>' +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    listEl.innerHTML = items;
  }

  // --- Audio Logic ---
  function setupAudio() {
    if (!state.audio) {
      state.audio = new Audio();
      state.audio.addEventListener("ended", function () {
        // Auto-next ke ayat seterusnya jika ada
        if (state.currentIndex < state.ayahs.length - 1) {
          goNext(true);
        } else {
          setPlaying(false);
        }
      });
    }
  }

  function updateProgressUI() {
    const currentEl = $("yusuf-current");
    const progressEl = $("yusuf-progress");
    const total = state.ayahs.length || 1;
    const current = state.currentIndex + 1;

    if (currentEl) {
      currentEl.textContent = "Ayat: " + current + "/" + total;
    }

    if (progressEl) {
      const pct = (current / total) * 100;
      progressEl.style.width = pct.toFixed(2) + "%";
    }

    const prevBtn = $("yusuf-prev");
    const nextBtn = $("yusuf-next");

    if (prevBtn) prevBtn.disabled = state.currentIndex === 0;
    if (nextBtn) nextBtn.disabled = state.currentIndex >= total - 1;
  }

  function clearPlayingClass() {
    const listEl = $("yusuf-list");
    if (!listEl) return;
    const items = listEl.querySelectorAll(".yusuf-ayat.playing");
    items.forEach(function (el) {
      el.classList.remove("playing");
    });
  }

  function scrollToAyah(ayahNumber) {
    const listEl = $("yusuf-list");
    if (!listEl) return;
    const el = listEl.querySelector('[data-ayah="' + ayahNumber + '"]');
    if (el) {
      el.classList.add("playing");
      const top = el.offsetTop - 80;
      listEl.scrollTo({
        top: top < 0 ? 0 : top,
        behavior: "smooth"
      });
    }
  }

  function setPlaying(isPlaying) {
    state.isPlaying = isPlaying;
    const playIcon = $("yusuf-play-icon");
    const playText = $("yusuf-play-text");

    if (playIcon) {
      playIcon.textContent = isPlaying ? "⏸" : "▶";
    }
    if (playText) {
      playText.textContent = isPlaying ? "Pause" : "Play";
    }

    if (!isPlaying) {
      clearPlayingClass();
    }
  }

  function playCurrent() {
    if (!state.ayahs.length) return;

    const ayah = state.ayahs[state.currentIndex];
    setupAudio();

    if (!ayah.audio) {
      // Tiada audio, cuma highlight
      clearPlayingClass();
      scrollToAyah(ayah.number);
      setPlaying(false);
      return;
    }

    const speedSel = $("yusuf-speed");
    const rate = speedSel ? parseFloat(speedSel.value || "1") : 1;

    try {
      state.audio.playbackRate = rate;
    } catch (e) {
      // ignore
    }

    state.audio.src = ayah.audio;
    state.audio
      .play()
      .then(function () {
        setPlaying(true);
        clearPlayingClass();
        scrollToAyah(ayah.number);
        updateProgressUI();
      })
      .catch(function () {
        setPlaying(false);
      });
  }

  function pauseAudio() {
    if (state.audio && !state.audio.paused) {
      state.audio.pause();
    }
    setPlaying(false);
  }

  function goNext(fromAuto) {
    if (!state.ayahs.length) return;
    if (state.currentIndex >= state.ayahs.length - 1) {
      setPlaying(false);
      return;
    }
    state.currentIndex++;
    updateProgressUI();
    if (state.isPlaying || fromAuto) {
      playCurrent();
    }
  }

  function goPrev() {
    if (!state.ayahs.length) return;
    if (state.currentIndex <= 0) return;
    state.currentIndex--;
    updateProgressUI();
    if (state.isPlaying) {
      playCurrent();
    }
  }

  function jumpToAyah(ayahNumber, autoplay) {
    const idx = state.ayahs.findIndex(function (a) {
      return a.number === ayahNumber;
    });
    if (idx === -1) return;
    state.currentIndex = idx;
    updateProgressUI();
    if (autoplay) {
      playCurrent();
    } else {
      clearPlayingClass();
      scrollToAyah(ayahNumber);
    }
  }

  // --- Copy & Share ---
  function getAyahText(ayahNumber) {
    const ayah = state.ayahs.find(function (a) {
      return a.number === ayahNumber;
    });
    if (!ayah) return "";

    const parts = [];
    parts.push("Surah Yusuf, Ayat " + ayah.number);
    parts.push("");
    parts.push(ayah.arabic);
    if (ayah.transliteration) {
      parts.push("");
      parts.push("Transliterasi:");
      parts.push(ayah.transliteration);
    }
    if (ayah.translation) {
      parts.push("");
      parts.push("Terjemahan (BM):");
      parts.push(ayah.translation);
    }
    parts.push("");
    parts.push("Sumber: IlmuAlam.com");

    return parts.join("\n");
  }

  function handleCopy(ayahNumber) {
    const text = getAyahText(ayahNumber);
    if (!text) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {
        // fallback
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
      } catch (e) {
        // ignore
      }
      document.body.removeChild(ta);
    }
  }

  function handleShare(ayahNumber) {
    const text = getAyahText(ayahNumber);
    if (!text) return;

    const url = window.location.href.split("#")[0] + "#ayat-" + ayahNumber;

    if (navigator.share) {
      navigator
        .share({
          title: "Surah Yusuf Ayat " + ayahNumber,
          text: text,
          url: url
        })
        .catch(function () {});
    } else {
      handleCopy(ayahNumber);
      // minimal alert behaviour, but we avoid blocking UX
    }
  }

  // --- Bookmark Panel UI ---
  function buildBookmarkPanel() {
    const tool = $("yusuf-tool");
    if (!tool) return;

    // FAB button
    const fab = document.createElement("button");
    fab.type = "button";
    fab.id = "yusuf-bookmark-toggle";
    fab.className = "yusuf-btn yusuf-bookmark-toggle";
    fab.innerHTML = "🔖 Bookmark Anda";
    tool.appendChild(fab);

    // Panel
    const panel = document.createElement("div");
    panel.id = "yusuf-bookmark-panel";
    panel.className = "yusuf-bookmark-panel";
    panel.innerHTML =
      '<div class="yusuf-bookmark-header">' +
      "<strong>Bookmark Surah Yusuf</strong>" +
      '<button type="button" id="yusuf-bookmark-clear" class="yusuf-action-btn">Kosongkan</button>' +
      "</div>" +
      '<ul id="yusuf-bookmark-list" class="yusuf-bookmark-list"></ul>';
    tool.appendChild(panel);

    fab.addEventListener("click", function () {
      panel.classList.toggle("open");
      updateBookmarkUI();
    });

    const clearBtn = $("yusuf-bookmark-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        state.bookmarks = [];
        saveBookmarks();
        updateBookmarkUI();
      });
    }

    // klik pada senarai bookmark (delegation)
    panel.addEventListener("click", function (e) {
      const li = e.target.closest("[data-ayah]");
      if (!li) return;
      const ayahNumber = parseInt(li.getAttribute("data-ayah"), 10);
      if (!ayahNumber) return;
      panel.classList.remove("open");
      jumpToAyah(ayahNumber, true);
    });
  }

  function updateBookmarkUI() {
    // Update button text + class dalam setiap ayat
    const listEl = $("yusuf-list");
    if (listEl) {
      const items = listEl.querySelectorAll(".yusuf-ayat");
      items.forEach(function (el) {
        const n = parseInt(el.getAttribute("data-ayah"), 10);
        const bookmarked = isBookmarked(n);
        if (bookmarked) {
          el.classList.add("yusuf-ayat-bookmarked");
        } else {
          el.classList.remove("yusuf-ayat-bookmarked");
        }
        const btn = el.querySelector(".yusuf-bookmark-btn");
        if (btn) {
          btn.textContent = bookmarked ? "✔ Disimpan" : "🔖 Simpan";
        }
      });
    }

    // Update panel list
    const panelList = $("yusuf-bookmark-list");
    if (!panelList) return;

    if (!state.bookmarks.length) {
      panelList.innerHTML =
        '<li class="yusuf-bookmark-empty">Tiada bookmark lagi. Tekan "🔖 Simpan" pada ayat yang anda suka.</li>';
      return;
    }

    const sorted = state.bookmarks
      .slice()
      .sort(function (a, b) {
        return a - b;
      });

    panelList.innerHTML = sorted
      .map(function (n) {
        return (
          '<li data-ayah="' +
          n +
          '">Ayat ' +
          n +
          "</li>"
        );
      })
      .join("");
  }

  // --- Event Binding ---
  function bindControls() {
    const playBtn = $("yusuf-play");
    const prevBtn = $("yusuf-prev");
    const nextBtn = $("yusuf-next");
    const speedSel = $("yusuf-speed");
    const listEl = $("yusuf-list");

    if (playBtn) {
      playBtn.addEventListener("click", function () {
        if (!state.isPlaying) {
          playCurrent();
        } else {
          pauseAudio();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goPrev();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goNext(false);
      });
    }

    if (speedSel) {
      speedSel.addEventListener("change", function () {
        if (state.audio) {
          try {
            state.audio.playbackRate = parseFloat(speedSel.value || "1");
          } catch (e) {}
        }
      });
    }

    // Keyboard control (space, arrow left/right)
    document.addEventListener("keydown", function (e) {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        if (!state.isPlaying) {
          playCurrent();
        } else {
          pauseAudio();
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    });

    // Delegation untuk action dalam senarai ayat
    if (listEl) {
      listEl.addEventListener("click", function (e) {
        const bookmarkBtn = e.target.closest(".yusuf-bookmark-btn");
        if (bookmarkBtn) {
          const n = parseInt(bookmarkBtn.getAttribute("data-ayah"), 10);
          if (n) toggleBookmark(n);
          return;
        }

        const actionBtn = e.target.closest(".yusuf-action-btn[data-action]");
        if (actionBtn) {
          const action = actionBtn.getAttribute("data-action");
          const n = parseInt(actionBtn.getAttribute("data-ayah"), 10);
          if (!n) return;

          if (action === "play") {
            jumpToAyah(n, true);
          } else if (action === "copy") {
            handleCopy(n);
          } else if (action === "share") {
            handleShare(n);
          }
          return;
        }

        // Klik pada seluruh card ayat
        const card = e.target.closest(".yusuf-ayat");
        if (card) {
          const n = parseInt(card.getAttribute("data-ayah"), 10);
          if (!n) return;
          jumpToAyah(n, true);
        }
      });
    }
  }

  // --- Init ---
  function init() {
    const tool = $("yusuf-tool");
    if (!tool) return;

    renderLoading("Memuatkan Surah Yusuf...");
    loadBookmarks();

    fetchData()
      .then(function (res) {
        state.ayahs = res.ayahs || [];
        state.currentIndex = 0;
        renderAyatList();
        buildBookmarkPanel();
        bindControls();
        updateProgressUI();
        updateBookmarkUI();
      })
      .catch(function (err) {
        console.error(err);
        renderError(err.message);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
