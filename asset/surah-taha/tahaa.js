/**
 * Surah Taha Interactive Tool
 * Copyright © 2024 ilmualam.com
 * 
 * This code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification is strictly prohibited.
 * Licensed exclusively for use on ilmualam.com
 * 
 * @author ilmualam.com
 * @version 2.0.0
 * @license Proprietary
 */

// Nama fail: asset/surah-taha/taha.js
// Tool Surah Taha – display Arab + transliterasi + BM + audio per ayat

(function () {
  const SURAH_NUMBER = 20;
  const TOTAL_AYAHS = 135;
  const API_URL =
    "https://api.alquran.cloud/v1/surah/" +
    SURAH_NUMBER +
    "/editions/quran-uthmani,ms.basmeih,en.transliteration";

  // Base audio per ayat (EveryAyah)
  const QARI_BASE = {
    mishary: "https://everyayah.com/data/Alafasy_128kbps",
    husary: "https://everyayah.com/data/Husary_128kbps",
    sudais: "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps",
  };

  let ayatData = []; // { arab, translit, malay, index }
  let currentAyah = 1;
  let isPlaying = false;
  let currentQari = "mishary";

  let audio = null;
  let autoScrollEnabled = true;

  // DOM refs (semua ID ni mesti wujud di HTML)
  function getEl(id) {
    return document.getElementById(id);
  }

  const els = {};

  function cacheElements() {
    els.versesContainer = getEl("versesContainer");
    els.loadingIndicator = getEl("loadingIndicator");
    els.playPauseBtn = getEl("playPauseBtn");
    els.qariSelector = getEl("qariSelector");
    els.progressBar = getEl("progressBar");
    els.currentVerse = getEl("currentVerse");
    els.audioTime = getEl("audioTime");
    els.settingsToggle = getEl("settingsToggle");
    els.settingsContent = getEl("settingsContent");
    els.arabicSize = getEl("arabicSize");
    els.translationSize = getEl("translationSize");
    els.showTransliteration = getEl("showTransliteration");
    els.autoScroll = getEl("autoScroll");
    els.toast = getEl("toast");
    els.bookmarkModal = getEl("bookmarkModal");
    els.bookmarkList = getEl("bookmarkList");
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add("show");
    setTimeout(() => els.toast.classList.remove("show"), 2300);
  }

  function pad3(num) {
    return String(num).padStart(3, "0");
  }

  function buildAudioSrc(qariKey, ayahNumber) {
    const base = QARI_BASE[qariKey] || QARI_BASE.mishary;
    return base + "/0" + SURAH_NUMBER + pad3(ayahNumber) + ".mp3";
  }

  function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  }

  function clearLoading() {
    if (els.loadingIndicator) {
      els.loadingIndicator.style.display = "none";
    }
  }

  function setActiveCard(ayahNumber) {
    if (!els.versesContainer) return;
    const cards = els.versesContainer.querySelectorAll(".verse-card");
    cards.forEach((card) => {
      if (Number(card.dataset.ayah) === ayahNumber) {
        card.classList.add("active");
        if (autoScrollEnabled) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        card.classList.remove("active");
      }
    });
  }

  function updateAudioMeta() {
    if (!audio || !els.audioTime) return;
    els.audioTime.textContent =
      formatTime(audio.currentTime) + " / " + formatTime(audio.duration || 0);
  }

  function updateProgressBar() {
    if (!audio || !els.progressBar) return;
    if (!audio.duration || audio.duration === Infinity) {
      els.progressBar.style.width = "0%";
      return;
    }
    const pct = (audio.currentTime / audio.duration) * 100;
    els.progressBar.style.width = pct.toFixed(1) + "%";
  }

  function updateCurrentVerseLabel() {
    if (els.currentVerse) {
      els.currentVerse.textContent = "Ayat " + currentAyah;
    }
  }

  function stopAudio() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    isPlaying = false;
    if (els.playPauseBtn) {
      const playIcon = els.playPauseBtn.querySelector("#playIcon");
      const pauseIcon = els.playPauseBtn.querySelector("#pauseIcon");
      if (playIcon && pauseIcon) {
        playIcon.style.display = "";
        pauseIcon.style.display = "none";
      }
    }
  }

  function togglePlayPause() {
    if (!audio) {
      playAyah(currentAyah);
      return;
    }

    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      if (els.playPauseBtn) {
        const playIcon = els.playPauseBtn.querySelector("#playIcon");
        const pauseIcon = els.playPauseBtn.querySelector("#pauseIcon");
        if (playIcon && pauseIcon) {
          playIcon.style.display = "";
          pauseIcon.style.display = "none";
        }
      }
    } else {
      audio.play().catch(() => {
        showToast("Audio tidak dapat dimainkan. Cuba lagi.");
      });
      isPlaying = true;
      if (els.playPauseBtn) {
        const playIcon = els.playPauseBtn.querySelector("#playIcon");
        const pauseIcon = els.playPauseBtn.querySelector("#pauseIcon");
        if (playIcon && pauseIcon) {
          playIcon.style.display = "none";
          pauseIcon.style.display = "";
        }
      }
    }
  }

  function playAyah(ayahNumber) {
    currentAyah = ayahNumber;
    updateCurrentVerseLabel();
    setActiveCard(ayahNumber);

    const src = buildAudioSrc(currentQari, ayahNumber);

    if (!audio) {
      audio = new Audio();
      audio.addEventListener("timeupdate", function () {
        updateAudioMeta();
        updateProgressBar();
      });
      audio.addEventListener("ended", function () {
        // auto next ayah jika ada
        if (currentAyah < TOTAL_AYAHS) {
          playAyah(currentAyah + 1);
        } else {
          stopAudio();
        }
      });
      audio.addEventListener("error", function () {
        showToast("Audio ayat " + currentAyah + " tidak dapat dimuatkan.");
      });
    }

    audio.src = src;
    audio.load();
    audio
      .play()
      .then(function () {
        isPlaying = true;
        if (els.playPauseBtn) {
          const playIcon = els.playPauseBtn.querySelector("#playIcon");
          const pauseIcon = els.playPauseBtn.querySelector("#pauseIcon");
          if (playIcon && pauseIcon) {
            playIcon.style.display = "none";
            pauseIcon.style.display = "";
          }
        }
      })
      .catch(function () {
        showToast("Gagal memainkan audio ayat " + currentAyah + ".");
      });
  }

  function onQariChange(e) {
    const value = e.target.value;
    if (!QARI_BASE[value]) {
      currentQari = "mishary";
    } else {
      currentQari = value;
    }
    showToast("Qari ditukar ke " + e.target.options[e.target.selectedIndex].text);
    if (isPlaying) {
      playAyah(currentAyah);
    }
  }

    function applyFontSizes() {
    if (!els.arabicSize || !els.translationSize || !els.versesContainer) return;
    const arabSize = els.arabicSize.value || 28;
    const transSize = els.translationSize.value || 16;

    els.versesContainer
      .querySelectorAll(".verse-arabic")
      .forEach(function (el) {
        el.style.fontSize = arabSize + "px";
      });

    els.versesContainer
      .querySelectorAll(".verse-translation")
      .forEach(function (el) {
        el.style.fontSize = transSize + "px";
      });

    const arabVal = document.getElementById("arabicSizeValue");
    const transVal = document.getElementById("translationSizeValue");
    if (arabVal) arabVal.textContent = arabSize + "px";
    if (transVal) transVal.textContent = transSize + "px";
  }
  
  function applyTransliterationVisibility() {
    if (!els.showTransliteration || !els.versesContainer) return;
    const show = els.showTransliteration.checked;
    els.versesContainer
      .querySelectorAll(".verse-transliteration")
      .forEach(function (el) {
        el.style.display = show ? "" : "none";
      });
  }

  function applyAutoScrollFlag() {
    if (!els.autoScroll) return;
    autoScrollEnabled = !!els.autoScroll.checked;
  }

  function toggleSettingsPanel() {
    if (!els.settingsContent || !els.settingsToggle) return;
    const isHidden = els.settingsContent.style.display === "none" || !els.settingsContent.style.display;
    els.settingsContent.style.display = isHidden ? "block" : "none";
    els.settingsToggle.setAttribute("aria-expanded", isHidden ? "true" : "false");
  }

  // Basic localStorage bookmark (ayat numbers)
  const BOOKMARK_KEY = "staha_bookmarks";

  function loadBookmarks() {
    try {
      const raw = localStorage.getItem(BOOKMARK_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveBookmarks(list) {
    try {
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
    } catch (e) {
      // ignore
    }
  }

  function toggleBookmark(ayahNumber) {
    const list = loadBookmarks();
    const idx = list.indexOf(ayahNumber);
    if (idx === -1) {
      list.push(ayahNumber);
      showToast("Ayat " + ayahNumber + " disimpan dalam .");
    } else {
      list.splice(idx, 1);
      showToast("Ayat " + ayahNumber + " dibuang dari bookmark.");
    }
    saveBookmarks(list);
  }

  function renderBookmarkModal() {
    if (!els.bookmarkList) return;
    const list = loadBookmarks().sort(function (a, b) {
      return a - b;
    });
    if (!list.length) {
      els.bookmarkList.innerHTML = "<p>Tiada bookmark disimpan.</p>";
      return;
    }
    const html = list
      .map(function (n) {
        return '<button type="button" class="action-btn" data-jump-ayah="' + n + '">Pergi ke Ayat ' + n + "</button>";
      })
      .join(" ");
    els.bookmarkList.innerHTML = html;
  }

  function openBookmarkModal() {
    if (!els.bookmarkModal) return;
    renderBookmarkModal();
    els.bookmarkModal.classList.add("show");
  }

  function closeBookmarkModal() {
    if (!els.bookmarkModal) return;
    els.bookmarkModal.classList.remove("show");
  }

  function copyAyahText(ayahNumber) {
    const item = ayatData[ayahNumber - 1];
    if (!item) return;
    const text =
      "Surah Taha, Ayat " +
      ayahNumber +
      "\n\n" +
      item.arab +
      "\n\n" +
      (item.translit ? item.translit + "\n\n" : "") +
      item.malay +
      "\n\nSumber: ilmualam.com";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          showToast("Ayat " + ayahNumber + " telah disalin.");
        })
        .catch(function () {
          showToast("Gagal menyalin teks.");
        });
    } else {
      // fallback
      const temp = document.createElement("textarea");
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      try {
        document.execCommand("copy");
        showToast("Ayat " + ayahNumber + " telah disalin.");
      } catch (e) {
        showToast("Gagal menyalin teks.");
      }
      document.body.removeChild(temp);
    }
  }

  function shareAyah(ayahNumber) {
    const url = window.location.href.split("#")[0] + "#ayat-" + ayahNumber;
    const item = ayatData[ayahNumber - 1];
    const text =
      "Surah Taha, Ayat " +
      ayahNumber +
      " – " +
      (item ? item.malay : "") +
      " \n\n" +
      url;
    if (navigator.share) {
      navigator
        .share({
          title: "Surah Taha Ayat " + ayahNumber,
          text: text,
          url: url,
        })
        .catch(function () {
          // user cancelled / ignore
        });
    } else {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(function () {
            showToast("Pautan ayat disalin untuk dikongsi.");
          })
          .catch(function () {
            showToast("Gagal menyediakan pautan.");
          });
      } else {
        showToast("Share tidak disokong di pelayar ini.");
      }
    }
  }

    function handleVerseActionClick(e) {
    const btn = e.target.closest(".action-btn");
    if (!btn) return;
    const card = e.target.closest(".verse-card");
    if (!card) return;
    const ayahNum = Number(card.dataset.ayah);
    if (!ayahNum) return;

    // BUTANG PLAY/PAUSE PER AYAT
    if (btn.classList.contains("js-play-ayah")) {
      // Jika sedang main ayat yang sama, jadikan butang ini sebagai toggle pause/play
      if (isPlaying && currentAyah === ayahNum && audio) {
        togglePlayPause();
      } else {
        playAyah(ayahNum);
      }
      return;
    }

    // BUTANG SEDIA ADA
    if (btn.classList.contains("js-copy-ayah")) {
      copyAyahText(ayahNum);
    } else if (btn.classList.contains("js-bookmark-ayah")) {
      toggleBookmark(ayahNum);
    } else if (btn.classList.contains("js-share-ayah")) {
      shareAyah(ayahNum);
    }
  }

  function handleVerseCardClick(e) {
    const card = e.target.closest(".verse-card");
    if (!card || !els.versesContainer) return;
    // kalau click direct atas card (bukan button), play ayat
    const isButton = e.target.closest("button");
    if (isButton) return;
    const ayahNum = Number(card.dataset.ayah);
    if (!ayahNum) return;
    playAyah(ayahNum);
  }

  function handleBookmarkModalClick(e) {
    const jumpBtn = e.target.closest("[data-jump-ayah]");
    if (jumpBtn) {
      const ayah = Number(jumpBtn.dataset.jumpAyah);
      if (ayah) {
        playAyah(ayah);
        closeBookmarkModal();
      }
    }
  }

    function buildVerseCard(index, arab, translit, malay) {
    const article = document.createElement("article");
    const ayahNum = index + 1;
    article.className = "verse-card";
    article.dataset.ayah = ayahNum;
    article.id = "ayat-" + ayahNum;

    article.innerHTML =
      '<div class="verse-number">Ayat ' + ayahNum + "</div>" +
      '<div class="verse-arabic">' + arab + "</div>" +
      (translit
        ? '<div class="verse-transliteration">' + translit + "</div>"
        : "") +
      '<div class="verse-translation">' + malay + "</div>" +
      '<div class="verse-actions">' +
        // BUTANG PLAY/PAUSE PER AYAT – BARU
        '<button type="button" class="action-btn js-play-ayah" aria-label="Mainkan ayat ' + ayahNum + '">' +
          '<span class="play-label">▶ Main</span>' +
        "</button>" +
        // BUTANG SEDIA ADA
        '<button type="button" class="action-btn js-copy-ayah">Copy</button>' +
        '<button type="button" class="action-btn js-bookmark-ayah">Bookmark</button>' +
        '<button type="button" class="action-btn js-share-ayah">Share</button>' +
      "</div>";

    return article;
  }

  async function loadSurah() {
    if (!els.versesContainer) return;
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
      const json = await res.json();
      if (!json || json.code !== 200 || !Array.isArray(json.data)) {
        throw new Error("Format API tidak dijangka");
      }

      const arabicEdition = json.data[0];
      const malayEdition = json.data[1];
      const translitEdition = json.data[2];

      ayatData = [];

      arabicEdition.ayahs.forEach(function (ayah, idx) {
        const arab = ayah.text || "";
        const malay = malayEdition.ayahs[idx]
          ? malayEdition.ayahs[idx].text || ""
          : "";
        const translit = translitEdition.ayahs[idx]
          ? translitEdition.ayahs[idx].text || ""
          : "";

        ayatData.push({
          arab: arab,
          translit: translit,
          malay: malay,
          index: idx + 1,
        });

        const card = buildVerseCard(idx, arab, translit, malay);
        els.versesContainer.appendChild(card);
      });

      clearLoading();
      applyFontSizes();
      applyTransliterationVisibility();
      setActiveCard(currentAyah);
      updateCurrentVerseLabel();
    } catch (err) {
      console.error("Gagal muat Surah Taha:", err);
      if (els.loadingIndicator) {
        els.loadingIndicator.innerHTML =
          "<p>Gagal memuatkan Surah Taha. Sila semak sambungan internet dan cuba lagi.</p>";
      }
    }
  }

  function attachEvents() {
    if (els.playPauseBtn) {
      els.playPauseBtn.addEventListener("click", togglePlayPause);
    }
    if (els.qariSelector) {
      els.qariSelector.addEventListener("change", onQariChange);
    }
    if (els.settingsToggle) {
      els.settingsToggle.addEventListener("click", toggleSettingsPanel);
    }
    if (els.arabicSize) {
      els.arabicSize.addEventListener("input", applyFontSizes);
    }
    if (els.translationSize) {
      els.translationSize.addEventListener("input", applyFontSizes);
    }
    if (els.showTransliteration) {
      els.showTransliteration.addEventListener(
        "change",
        applyTransliterationVisibility
      );
    }
    if (els.autoScroll) {
      els.autoScroll.addEventListener("change", applyAutoScrollFlag);
    }
    if (els.versesContainer) {
      els.versesContainer.addEventListener("click", handleVerseActionClick);
      els.versesContainer.addEventListener("click", handleVerseCardClick);
    }
    if (els.bookmarkModal) {
      els.bookmarkModal.addEventListener("click", function (e) {
        if (e.target.classList.contains("modal-close") || e.target === els.bookmarkModal) {
          closeBookmarkModal();
        }
      });
      if (els.bookmarkList) {
        els.bookmarkList.addEventListener("click", handleBookmarkModalClick);
      }
    }

    // Buka modal bookmark bila user tekan shortcut (optional)
    // Contoh: tekan "b" pada keyboard
    document.addEventListener("keydown", function (e) {
      if (e.key === "b" || e.key === "B") {
        openBookmarkModal();
      }
    });
  }

  function init() {
    cacheElements();
    if (!els.versesContainer || !els.loadingIndicator) {
      console.warn(
        "[Surah Taha Tool] Elemen asas tidak lengkap. Pastikan ID versesContainer & loadingIndicator wujud."
      );
      return;
    }
    applyAutoScrollFlag();
    attachEvents();
    loadSurah();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
