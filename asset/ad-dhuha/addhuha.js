// ### SURAH AD-DHUHA INTERAKTIF TOOL v2.0.2 ###
// Disesuaikan khas untuk container #surah-ad-dhuha-tool pada IlmuAlam.com

(function () {
  "use strict";

  var AUDIO_URL = "https://cdn.islamic.network/quran/audio/128/ar.alafasy/93.mp3";
  var STORAGE_KEY = "ilmu_surah_ad_dhuha_state_v1";

  var VERSES = [
    {
      ayah: 1,
      arabic: "وَالضُّحَىٰ",
      rumi: "Wad-dhuha",
      translation: "Demi waktu Dhuha (pagi yang cerah),"
    },
    {
      ayah: 2,
      arabic: "وَاللَّيْلِ إِذَا سَجَىٰ",
      rumi: "Wal-layli idza saja",
      translation: "Dan demi malam apabila ia menjadi sunyi,"
    },
    {
      ayah: 3,
      arabic: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ",
      rumi: "Ma wadda'aka rabbuka wa ma qala",
      translation: "Tuhanmu (wahai Muhammad) tidak meninggalkan engkau dan tidak membenci engkau."
    },
    {
      ayah: 4,
      arabic: "وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ",
      rumi: "Walal-akhiratu khayrul laka minal-ula",
      translation:
        "Dan sesungguhnya hari kemudian (akhirat) adalah lebih baik bagimu daripada permulaan (dunia)."
    },
    {
      ayah: 5,
      arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
      rumi: "Wa lasawfa yu'tika rabbuka fatardha",
      translation:
        "Dan kelak Tuhanmu pasti memberikan kepadamu (segala nikmat), lalu engkau menjadi reda."
    },
    {
      ayah: 6,
      arabic: "أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ",
      rumi: "Alam yajidka yatiman fa-awa",
      translation: "Bukankah Dia mendapatimu sebagai anak yatim, lalu Dia memberi perlindungan?"
    },
    {
      ayah: 7,
      arabic: "وَوَجَدَكَ ضَالًّا فَهَدَىٰ",
      rumi: "Wa wajadaka dhol-lan fahada",
      translation:
        "Dan Dia mendapatimu dalam keadaan tidak mengetahui (jalan yang lengkap), lalu Dia memberi petunjuk?"
    },
    {
      ayah: 8,
      arabic: "وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ",
      rumi: "Wa wajadaka 'a-ilan fa-aghna",
      translation: "Dan Dia mendapatimu dalam keadaan miskin, lalu Dia memberikan kecukupan?"
    },
    {
      ayah: 9,
      arabic: "فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ",
      rumi: "Fa-ammal yatima fala taqhar",
      translation: "Maka terhadap anak yatim, janganlah kamu berlaku sewenang-wenangnya."
    },
    {
      ayah: 10,
      arabic: "وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ",
      rumi: "Wa ammas-sa-ila fala tanhar",
      translation: "Dan terhadap orang yang meminta-minta, janganlah kamu menghardiknya."
    },
    {
      ayah: 11,
      arabic: "وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ",
      rumi: "Wa amma bi ni'mati rabbika fahaddith",
      translation: "Dan terhadap nikmat Tuhanmu, maka hendaklah kamu sebar-sebarkan (dengan bersyukur)."
    }
  ];

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore
    }
  }

  function createDefaultState() {
    var checked = {};
    var bookmarks = {};
    for (var i = 1; i <= VERSES.length; i++) {
      checked[i] = false;
      bookmarks[i] = false;
    }
    return {
      checked: checked,
      bookmarks: bookmarks,
      mode: "all",
      dark: false,
      activeAyah: 1
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("surah-ad-dhuha-tool");
    if (!root) {
      return;
    }

    var versesContainer =
      root.querySelector("#verses-container") || root.querySelector(".verses-container");
    if (!versesContainer) {
      return;
    }

    var playBtn = root.querySelector("#play-toggle");
    var progressBar = root.querySelector("#audio-progress");
    var progressFill = root.querySelector("#audio-progress-fill");
    var timeDisplay = root.querySelector("#time-display");

    var statAyahCount = root.querySelector("#stat-ayah-count");
    var statProgress = root.querySelector("#stat-progress");
    var statBookmarks = root.querySelector("#stat-bookmarks");

    var controlButtons = root.querySelectorAll(".control-btn");
    var shareButtons = root.querySelectorAll(".share-btn");

    var audio = new Audio(AUDIO_URL);
    audio.preload = "metadata";

    var state = loadState() || createDefaultState();

    if (statAyahCount) {
      statAyahCount.textContent = String(VERSES.length);
    }

    function renderVerses() {
      versesContainer.innerHTML = "";

      for (var i = 0; i < VERSES.length; i++) {
        var v = VERSES[i];
        var card = document.createElement("article");
        card.className = "verse-card";
        card.setAttribute("data-ayah", String(v.ayah));

        var header = document.createElement("div");
        header.className = "verse-header";

        var number = document.createElement("div");
        number.className = "verse-number";
        number.textContent = v.ayah;

        var actions = document.createElement("div");
        actions.className = "verse-actions";

        var bookmarkBtn = document.createElement("button");
        bookmarkBtn.className = "action-icon bookmark-btn";
        bookmarkBtn.setAttribute("type", "button");
        bookmarkBtn.setAttribute("title", "Tanda ayat kegemaran");
        bookmarkBtn.innerHTML = "★";

        var checkBtn = document.createElement("button");
        checkBtn.className = "action-icon check-btn";
        checkBtn.setAttribute("type", "button");
        checkBtn.setAttribute("title", "Tanda sudah kuasai ayat");
        checkBtn.innerHTML = "✔";

        actions.appendChild(bookmarkBtn);
        actions.appendChild(checkBtn);

        header.appendChild(number);
        header.appendChild(actions);

        var arabicEl = document.createElement("div");
        arabicEl.className = "verse-arabic";
        arabicEl.textContent = v.arabic;

        var rumiEl = document.createElement("div");
        rumiEl.className = "verse-rumi";
        rumiEl.textContent = v.rumi;

        var translationEl = document.createElement("div");
        translationEl.className = "verse-translation";
        translationEl.textContent = v.translation;

        card.appendChild(header);
        card.appendChild(arabicEl);
        card.appendChild(rumiEl);
        card.appendChild(translationEl);

        versesContainer.appendChild(card);
      }

      applyMode(state.mode);
      applyAyahState();
      highlightActiveAyah();
    }

    function applyMode(mode) {
      state.mode = mode;

      var cards = versesContainer.querySelectorAll(".verse-card");
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var arabicEl = card.querySelector(".verse-arabic");
        var rumiEl = card.querySelector(".verse-rumi");
        var translationEl = card.querySelector(".verse-translation");

        if (!arabicEl || !rumiEl || !translationEl) continue;

        arabicEl.style.display = "";
        rumiEl.style.display = "";
        translationEl.style.display = "";

        if (mode === "arabic") {
          rumiEl.style.display = "none";
          translationEl.style.display = "none";
        } else if (mode === "rumi") {
          translationEl.style.display = "none";
        } else if (mode === "translation") {
          arabicEl.style.display = "none";
          rumiEl.style.display = "none";
        } else if (mode === "tadabbur") {
          rumiEl.style.display = "none";
        }
      }

      for (var j = 0; j < controlButtons.length; j++) {
        var btn = controlButtons[j];
        var btnMode = btn.getAttribute("data-mode");
        if (btnMode) {
          if (btnMode === mode) btn.classList.add("active");
          else btn.classList.remove("active");
        }
      }

      saveState(state);
    }

    function applyAyahState() {
      var cards = versesContainer.querySelectorAll(".verse-card");
      var checkedCount = 0;
      var bookmarkedCount = 0;

      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var ayah = parseInt(card.getAttribute("data-ayah"), 10);
        var bookmarkBtn = card.querySelector(".bookmark-btn");
        var checkBtn = card.querySelector(".check-btn");

        var isChecked = !!state.checked[ayah];
        var isBookmarked = !!state.bookmarks[ayah];

        if (isChecked) checkedCount++;
        if (isBookmarked) bookmarkedCount++;

        if (checkBtn) {
          if (isChecked) checkBtn.classList.add("active");
          else checkBtn.classList.remove("active");
        }

        if (bookmarkBtn) {
          if (isBookmarked) bookmarkBtn.classList.add("active");
          else bookmarkBtn.classList.remove("active");
        }
      }

      if (statBookmarks) {
        statBookmarks.textContent = String(bookmarkedCount);
      }

      if (statProgress) {
        var percent = VERSES.length > 0 ? Math.round((checkedCount / VERSES.length) * 100) : 0;
        statProgress.textContent = percent + "%";
      }
    }

    function highlightActiveAyah() {
      var cards = versesContainer.querySelectorAll(".verse-card");
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var ayah = parseInt(card.getAttribute("data-ayah"), 10);
        if (ayah === state.activeAyah) {
          card.classList.add("playing");
        } else {
          card.classList.remove("playing");
        }
      }
    }

    function scrollToActiveAyah() {
      var activeCard = versesContainer.querySelector(
        '.verse-card[data-ayah="' + state.activeAyah + '"]'
      );
      if (activeCard && typeof activeCard.scrollIntoView === "function") {
        activeCard.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }

    function toggleDarkMode() {
      state.dark = !state.dark;
      if (state.dark) root.classList.add("dark-mode");
      else root.classList.remove("dark-mode");
      saveState(state);
    }

    function formatTime(seconds) {
      if (!isFinite(seconds)) return "00:00";
      var m = Math.floor(seconds / 60);
      var s = Math.floor(seconds % 60);
      if (m < 10) m = "0" + m;
      if (s < 10) s = "0" + s;
      return m + ":" + s;
    }

    if (state.dark) {
      root.classList.add("dark-mode");
    }

    renderVerses();

    controlButtons.forEach
      ? controlButtons.forEach(function (btn) {
          var modeAttr = btn.getAttribute("data-mode");
          var toggleAttr = btn.getAttribute("data-toggle");

          if (modeAttr) {
            btn.addEventListener("click", function () {
              applyMode(modeAttr);
              saveState(state);
            });
          } else if (toggleAttr === "dark") {
            btn.addEventListener("click", function () {
              toggleDarkMode();
            });
          }
        })
      : (function () {
          for (var i = 0; i < controlButtons.length; i++) {
            var btn = controlButtons[i];
            var modeAttr = btn.getAttribute("data-mode");
            var toggleAttr = btn.getAttribute("data-toggle");

            if (modeAttr) {
              (function (mode) {
                btn.addEventListener("click", function () {
                  applyMode(mode);
                  saveState(state);
                });
              })(modeAttr);
            } else if (toggleAttr === "dark") {
              btn.addEventListener("click", function () {
                toggleDarkMode();
              });
            }
          }
        })();

    versesContainer.addEventListener("click", function (e) {
      var target = e.target;
      while (target && target !== versesContainer && !target.classList.contains("verse-card")) {
        target = target.parentNode;
      }
      if (!target || !target.classList || !target.classList.contains("verse-card")) return;

      var ayah = parseInt(target.getAttribute("data-ayah"), 10);
      if (!ayah) return;

      var isBookmarkBtn = e.target.classList.contains("bookmark-btn");
      var isCheckBtn = e.target.classList.contains("check-btn");

      if (isBookmarkBtn) {
        state.bookmarks[ayah] = !state.bookmarks[ayah];
        applyAyahState();
        saveState(state);
        return;
      }

      if (isCheckBtn) {
        state.checked[ayah] = !state.checked[ayah];
        applyAyahState();
        saveState(state);
        return;
      }

      state.activeAyah = ayah;
      highlightActiveAyah();
      scrollToActiveAyah();
      saveState(state);
    });

    if (playBtn) {
      playBtn.addEventListener("click", function () {
        if (audio.paused) {
          audio.play().catch(function () {});
          playBtn.textContent = "⏸";
          scrollToActiveAyah();
        } else {
          audio.pause();
          playBtn.textContent = "▶";
        }
      });
    }

    audio.addEventListener("loadedmetadata", function () {
      if (timeDisplay) {
        timeDisplay.textContent =
          "00:00 / " + formatTime(audio.duration ? audio.duration : 0);
      }
    });

    audio.addEventListener("timeupdate", function () {
      if (progressFill && audio.duration) {
        var percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = percent + "%";
      }
      if (timeDisplay && audio.duration) {
        timeDisplay.textContent =
          formatTime(audio.currentTime) + " / " + formatTime(audio.duration);
      }
    });

    if (progressBar) {
      progressBar.addEventListener("click", function (e) {
        var rect = progressBar.getBoundingClientRect();
        var ratio = (e.clientX - rect.left) / rect.width;
        if (ratio < 0) ratio = 0;
        if (ratio > 1) ratio = 1;
        if (audio.duration) {
          audio.currentTime = audio.duration * ratio;
        }
      });
    }

    audio.addEventListener("ended", function () {
      if (playBtn) {
        playBtn.textContent = "▶";
      }
      if (progressFill) {
        progressFill.style.width = "0%";
      }
    });

    shareButtons.forEach
      ? shareButtons.forEach(function (btn) {
          btn.addEventListener("click", function () {
            var type = btn.getAttribute("data-share");
            var url = window.location.href.split("#")[0] + "#surah-ad-dhuha-tool";
            var text =
              "Surah Ad-Dhuha (tool interaktif dengan audio & tafsir) di IlmuAlam.com: " + url;

            if (type === "whatsapp") {
              window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
            } else if (type === "telegram") {
              window.open(
                "https://t.me/share/url?url=" +
                  encodeURIComponent(url) +
                  "&text=" +
                  encodeURIComponent(text),
                "_blank"
              );
            } else if (type === "copy") {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url);
                btn.textContent = "✅ Link Disalin";
                setTimeout(function () {
                  btn.textContent = "🔗 Copy Link Tool";
                }, 1500);
              } else {
                alert("Sila copy link ini secara manual: " + url);
              }
            }
          });
        })
      : (function () {
          for (var i = 0; i < shareButtons.length; i++) {
            (function (btn) {
              btn.addEventListener("click", function () {
                var type = btn.getAttribute("data-share");
                var url = window.location.href.split("#")[0] + "#surah-ad-dhuha-tool";
                var text =
                  "Surah Ad-Dhuha (tool interaktif dengan audio & tafsir) di IlmuAlam.com: " +
                  url;

                if (type === "whatsapp") {
                  window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
                } else if (type === "telegram") {
                  window.open(
                    "https://t.me/share/url?url=" +
                      encodeURIComponent(url) +
                      "&text=" +
                      encodeURIComponent(text),
                    "_blank"
                  );
                } else if (type === "copy") {
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url);
                    btn.textContent = "✅ Link Disalin";
                    setTimeout(function () {
                      btn.textContent = "🔗 Copy Link Tool";
                    }, 1500);
                  } else {
                    alert("Sila copy link ini secara manual: " + url);
                  }
                }
              });
            })(shareButtons[i]);
          }
        })();
  });
})();
