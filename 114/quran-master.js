/*!
 * Al-Quran Online 30 Juzuk — Interactive Quran Reader (Rumi/Arab/Terjemahan/Audio)
 * https://www.ilmualam.com/p/quran-online.html
 *
 * Copyright (c) 2026–present Ilmu Alam (ilmualam.com). All Rights Reserved.
 *
 * This source code is proprietary and protected under copyright law.
 * Unauthorized copying, redistribution, or reuse of this file or its logic,
 * in whole or in part, on any other website or application is prohibited
 * without prior written permission from the copyright holder.
 *
 * Repository: https://github.com/ilmualam/quran-tool
 */
(function () {
  const API_BASE = 'https://api.alquran.cloud/v1';

  let allSurahs = [];
  let currentAudio = new Audio();
  let currentButtons = [];
  let currentSurahMeta = null;
  let playbackMode = 'single'; // 'single' | 'all'
  let currentIndex = -1;
  let hasListHistoryEntry = false; // true once we've pushed a list state this session

  let deepLinkConfig = { surahKey: null, ayah: null };

  // ====== Helper: slugify surah name ======
  function slugify(str) {
    return (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ====== Helper: parse deep link dari URL ======
  function parseDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const surahParam = params.get('surah');
    const ayahParam = params.get('ayah');

    if (surahParam) {
      const idPart = surahParam.split('-')[0];
      const surahId = parseInt(idPart, 10);
      if (!isNaN(surahId)) {
        deepLinkConfig.surahKey = surahId;
      }
    }
    if (ayahParam) {
      const ay = parseInt(ayahParam, 10);
      if (!isNaN(ay)) {
        deepLinkConfig.ayah = ay;
      }
    }
  }

  // ====== SEARCH: normalization + alias table + fuzzy fallback ======
  // Curated aliases for high-search-volume surah (extend as needed)
  var SURAH_ALIASES = {
    36: ['yasin', 'yassin', 'yaseen', 'yasiin', 'ys'],
    67: ['almulk', 'mulk', 'tabarak'],
    18: ['alkahfi', 'kahfi', 'kahf'],
    55: ['arrahman', 'rahman', 'raccan'],
    56: ['alwaqiah', 'waqiah', 'waqiyah'],
    19: ['maryam', 'mariam'],
    12: ['yusuf', 'joseph'],
    11: ['hud'],
    20: ['taha', 'thaha'],
    4: ['annisa', 'nisa', 'anisa'],
    2: ['albaqarah', 'baqarah', 'baqara'],
    3: ['aliimran', 'aliimron', 'imran'],
    1: ['alfatihah', 'fatihah', 'fatiha', 'alfateha'],
    94: ['alinsyirah', 'insyirah', 'alsyarh', 'sharh'],
    93: ['adduha', 'duha', 'dhuha'],
    48: ['alfath', 'fath', 'fathu']
  };

  function normalizeText(str) {
    return (str || '')
      .toLowerCase()
      .replace(/ee/g, 'i')
      .replace(/oo/g, 'u')
      .replace(/[^a-z0-9]/g, '')
      .replace(/(.)\1+/g, '$1'); // collapse repeated letters: "yassin" -> "yasin"
  }

  function levenshtein(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var row = [];
    for (var i = 0; i <= n; i++) row[i] = i;
    for (var i = 1; i <= m; i++) {
      var prev = row[0];
      row[0] = i;
      for (var j = 1; j <= n; j++) {
        var tmp = row[j];
        row[j] = a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, row[j], row[j - 1]);
        prev = tmp;
      }
    }
    return row[n];
  }

  function surahMatchesTerm(surah, rawTerm) {
    var cleanedTerm = rawTerm.toLowerCase().replace(/\b(surah|surat|sura)\b/g, '').trim();
    var term = normalizeText(cleanedTerm);
    if (!term) return true;
    if (surah.number.toString() === rawTerm.trim()) return true;

    var normName = normalizeText(surah.englishName);
    var normTranslation = normalizeText(surah.englishNameTranslation);
    if (normName.indexOf(term) !== -1 || normTranslation.indexOf(term) !== -1) return true;

    var aliases = SURAH_ALIASES[surah.number];
    if (aliases) {
      for (var i = 0; i < aliases.length; i++) {
        if (normalizeText(aliases[i]).indexOf(term) !== -1) return true;
      }
    }

    // Fuzzy fallback for typos (only for reasonably long terms to avoid noise)
    if (term.length >= 4) {
      var window = normName.slice(0, term.length + 1);
      if (levenshtein(term, window) <= 1) return true;
    }

    return false;
  }

  // ====== SEO: per-surah title/description/canonical swap ======
  var metaDescEl = document.querySelector('meta[name="description"]');
  var canonicalEl = document.querySelector('link[rel="canonical"]');
  var baseTitle = document.title;
  var baseDescription = metaDescEl ? metaDescEl.getAttribute('content') : '';
  var baseCanonical = canonicalEl ? canonicalEl.getAttribute('href') : window.location.href;

  function surahUrl(surah) {
    return window.location.origin + window.location.pathname +
      '?surah=' + surah.number + '-' + slugify(surah.englishName);
  }

  function applySurahSEO(surah) {
    document.title = surah.englishName + ' (' + surah.englishNameTranslation + ') - Rumi, Terjemahan & Audio | Al-Quran Online';
    var desc = 'Baca Surah ' + surah.englishName + ' (' + surah.englishNameTranslation + '), ' +
      surah.numberOfAyahs + ' ayat, lengkap dengan teks Arab, Rumi, terjemahan Bahasa Melayu dan audio ayat demi ayat - percuma.';
    if (metaDescEl) metaDescEl.setAttribute('content', desc);
    if (canonicalEl) canonicalEl.setAttribute('href', surahUrl(surah));
  }

  function restoreMainSEO() {
    document.title = baseTitle;
    if (metaDescEl) metaDescEl.setAttribute('content', baseDescription);
    if (canonicalEl) canonicalEl.setAttribute('href', baseCanonical);
  }

  // ====== Once DOM ready ======
  document.addEventListener('DOMContentLoaded', function () {
    const appContainer = document.getElementById('quran-app-container');
    if (!appContainer) return;

    const surahList = document.getElementById('surahList');
    const readerView = document.getElementById('readerView');
    const versesContainer = document.getElementById('versesContainer');
    const searchInput = document.getElementById('surahSearch');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const surahTitle = document.getElementById('surahTitle');
    const bismillah = document.getElementById('bismillah');
    const backBtn = document.getElementById('backBtn');

    const toggleTransliteration = document.getElementById('toggleTransliteration');
    const toggleTranslation = document.getElementById('toggleTranslation');
    const toggleAudio = document.getElementById('toggleAudio');

    const playAllBtn = document.getElementById('playAllBtn');
    const stopAllBtn = document.getElementById('stopAllBtn');
    const verseSearchInput = document.getElementById('verseSearch');

    parseDeepLink();

    // Give the initial history entry a state object so popstate can
    // tell it apart from a surah state later.
    history.replaceState(
      { surah: deepLinkConfig.surahKey || null, ayah: deepLinkConfig.ayah || null },
      '',
      window.location.href
    );

    // ===== 1. Fetch Surah List =====
    fetch(API_BASE + '/surah')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        allSurahs = data.data || [];
        renderSurahList(allSurahs);

        // Jika ada deep link, auto buka surah
        if (deepLinkConfig.surahKey) {
          var target = allSurahs.find(function (s) { return s.number === deepLinkConfig.surahKey; });
          if (target) {
            loadSurah(target, { targetAyah: deepLinkConfig.ayah, historyMode: 'none' });
          }
        }
      })
      .catch(function () {
        surahList.innerHTML =
          '<p style="text-align:center;color:red;">Gagal memuatkan data. Sila semak sambungan internet anda.</p>';
      });

    // ===== 2. Render Surah List =====
    function renderSurahList(surahs) {
      surahList.innerHTML = '';
      surahs.forEach(function (surah) {
        var card = document.createElement('div');
        card.className = 'surah-card';
        card.innerHTML =
          '<div style="display:flex;align-items:center;">' +
          '  <div class="surah-number">' + surah.number + '</div>' +
          '  <div class="surah-info">' +
          '    <h3>' + surah.englishName + '</h3>' +
          '    <p>' + surah.englishNameTranslation + ' • ' + surah.numberOfAyahs + ' Ayat</p>' +
          '  </div>' +
          '</div>' +
          '<div class="surah-arabic">' + surah.name.replace("سورة ", "") + '</div>';

        card.addEventListener('click', function () {
          loadSurah(surah, { historyMode: 'push' });
        });
        surahList.appendChild(card);
      });
    }

    // ===== 3. Search Surah (header search input) =====
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        var term = e.target.value;
        var filtered = allSurahs.filter(function (s) {
          return surahMatchesTerm(s, term);
        });
        renderSurahList(filtered);
      });
    }

    // ===== 4. Settings Panel Toggle =====
    if (settingsBtn && settingsPanel) {
      settingsBtn.addEventListener('click', function () {
        settingsPanel.classList.toggle('hidden');
      });
    }

    function updateVisibility(cls, show) {
      var nodes = document.querySelectorAll(cls);
      nodes.forEach(function (el) {
        el.style.display = show ? 'block' : 'none';
      });
    }

    if (toggleTransliteration) {
      toggleTransliteration.addEventListener('change', function (e) {
        updateVisibility('.transliteration-text', e.target.checked);
      });
    }
    if (toggleTranslation) {
      toggleTranslation.addEventListener('change', function (e) {
        updateVisibility('.translation-text', e.target.checked);
      });
    }
    if (toggleAudio) {
      toggleAudio.addEventListener('change', function (e) {
        updateVisibility('.audio-btn-container', e.target.checked);
      });
    }

    // ===== 5. View toggles (shared by click, back button, popstate) =====
    function showListView() {
      stopAudio();
      readerView.classList.add('hidden');
      surahList.classList.remove('hidden');
      var headerWrap = document.querySelector('.search-box');
      if (headerWrap && headerWrap.parentElement) {
        headerWrap.parentElement.classList.remove('hidden');
      }
      restoreMainSEO();
      window.scrollTo(0, 0);
    }

    // ===== 6. Load Surah Details =====
    async function loadSurah(surah, options) {
      options = options || {};
      deepLinkConfig = { surahKey: surah.number, ayah: options.targetAyah || null };
      currentSurahMeta = {
        number: surah.number,
        englishName: surah.englishName,
        englishNameTranslation: surah.englishNameTranslation
      };

      if (options.historyMode === 'push') {
        hasListHistoryEntry = true;
        history.pushState(
          { surah: surah.number, ayah: options.targetAyah || null },
          '',
          surahUrl(surah)
        );
      }
      applySurahSEO(surah);

      surahList.classList.add('hidden');
      var headerWrap = document.querySelector('.search-box');
      if (headerWrap && headerWrap.parentElement) {
        headerWrap.parentElement.classList.add('hidden');
      }
      readerView.classList.remove('hidden');
      versesContainer.innerHTML = '<div class="loading-spinner">Sedang menyusun ayat...</div>';
      surahTitle.innerHTML =
        '<h2>' + surah.englishName + '</h2>' +
        '<p>' + surah.englishNameTranslation + ' • Surah ke-' + surah.number + '</p>';

      if (surah.number === 9) {
        bismillah.classList.add('hidden');
      } else {
        bismillah.classList.remove('hidden');
      }

      window.scrollTo(0, 0);

      try {
        var resp = await fetch(
          API_BASE + '/surah/' + surah.number + '/editions/quran-uthmani,ms.basmeih,en.transliteration'
        );
        var json = await resp.json();
        var data = json.data || [];
        var arabicData = data[0] || {};
        var malayData = data[1] || {};
        var rumiData = data[2] || {};

        renderVerses(arabicData.ayahs || [], malayData.ayahs || [], rumiData.ayahs || []);

        // Kalau deep link ada ayat -> focus
        if (options.targetAyah) {
          focusAyah(options.targetAyah);
        }

      } catch (e) {
        console.error(e);
        versesContainer.innerHTML =
          '<p style="text-align:center;color:red;">Ralat memuatkan surah. Cuba refresh semula.</p>';
      }
    }

    // ===== 7. Render Verses =====
    function renderVerses(arabic, malay, rumi) {
      versesContainer.innerHTML = '';
      var fragment = document.createDocumentFragment();
      var surahNameForText = currentSurahMeta ? currentSurahMeta.englishName : 'Surah';

      arabic.forEach(function (ayah, index) {
        var verseNum = ayah.numberInSurah;
        var textAr = ayah.text;
        var textRumi = (rumi[index] && rumi[index].text) || '';
        var textMy = (malay[index] && malay[index].text) || '';
        var globalAyah = ayah.number; // global ayah id (1-6236)

        var bookmarkKey = 'quran_bookmark_' + surahNameForText + '_' + verseNum;
        var isBookmarked = !!localStorage.getItem(bookmarkKey);
        var audioUrl = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/' + globalAyah + '.mp3';

        var verseDiv = document.createElement('div');
        verseDiv.className = 'verse-item';
        verseDiv.setAttribute('data-verse', verseNum);
        verseDiv.setAttribute('id', 'ayah-' + verseNum);

        verseDiv.innerHTML =
          '<div class="verse-top">' +
          '  <span class="verse-number">Ayat ' + verseNum + '</span>' +
          '  <div class="verse-actions">' +
          '    <button class="action-btn" aria-label="Salin Ayat" ' +
          '      onclick="copyVerse(\'' + surahNameForText.replace(/'/g, "\\'") + '\',' + verseNum + ', this)">' +
          '      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>' +
          '    </button>' +
          '    <button class="action-btn" aria-label="Kongsi Ayat" ' +
          '      onclick="shareVerse(\'' + surahNameForText.replace(/'/g, "\\'") + '\',' + verseNum + ')">' +
          '      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>' +
          '    </button>' +
          '    <button class="action-btn ' + (isBookmarked ? 'bookmarked' : '') + '" aria-label="Bookmark Ayat" ' +
          '      onclick="toggleBookmark(\'' + surahNameForText.replace(/'/g, "\\'") + '\',' + verseNum + ', this)">' +
          '      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' + (isBookmarked ? 'fill="#ff9800"' : 'fill="none"') + ' stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>' +
          '    </button>' +
          '    <div class="audio-btn-container" style="display:' + (toggleAudio && toggleAudio.checked ? 'block' : 'none') + '">' +
          '      <button class="audio-btn" data-audio="' + audioUrl + '" aria-label="Mainkan ayat">' +
          '        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>' +
          '      </button>' +
          '    </div>' +
          '  </div>' +
          '</div>' +
          '<div class="arabic-text" id="ar-' + verseNum + '">' + textAr + '</div>' +
          '<div class="transliteration-text" id="rumi-' + verseNum + '" style="display:' + (toggleTransliteration && toggleTransliteration.checked ? 'block' : 'none') + ';">' + textRumi + '</div>' +
          '<div class="translation-text" id="my-' + verseNum + '" style="display:' + (toggleTranslation && toggleTranslation.checked ? 'block' : 'none') + ';">' + textMy + '</div>';

        fragment.appendChild(verseDiv);
      });

      versesContainer.appendChild(fragment);

      // Setup audio untuk setiap ayat
      setupAudioPlayers();

      // Search dalam surah
      if (verseSearchInput) {
        verseSearchInput.value = '';
      }
      initVerseSearch();
    }

    // ===== 8. Audio Manager (Single & Play All) =====
    function setupAudioPlayers() {
      currentButtons = Array.prototype.slice.call(
        document.querySelectorAll('.audio-btn')
      );
      currentButtons.forEach(function (btn, index) {
        btn.dataset.index = index;
        btn.addEventListener('click', function () {
          playbackMode = 'single';
          playVerseAtIndex(index);
        });
      });

      currentAudio.onended = function () {
        clearActiveVerse();
        if (playbackMode === 'all') {
          var nextIndex = currentIndex + 1;
          if (nextIndex < currentButtons.length) {
            playVerseAtIndex(nextIndex);
          } else {
            playbackMode = 'single';
          }
        }
      };

      if (playAllBtn) {
        playAllBtn.onclick = function () {
          if (!currentButtons.length) return;
          playbackMode = 'all';
          playVerseAtIndex(0);
        };
      }
      if (stopAllBtn) {
        stopAllBtn.onclick = function () {
          playbackMode = 'single';
          stopAudio();
        };
      }
    }

    function clearActiveVerse() {
      currentButtons.forEach(function (b) { b.classList.remove('playing'); });
      var items = document.querySelectorAll('.verse-item.active-verse');
      items.forEach(function (item) {
        item.classList.remove('active-verse');
      });
    }

    function stopAudio() {
      try { currentAudio.pause(); } catch (e) {}
      clearActiveVerse();
      currentIndex = -1;
    }

    function playVerseAtIndex(index) {
      if (!currentButtons[index]) return;

      var btn = currentButtons[index];
      var url = btn.getAttribute('data-audio');

      clearActiveVerse();

      currentIndex = index;
      currentAudio.src = url;
      currentAudio.play().catch(function (e) {
        console.error(e);
      });
      btn.classList.add('playing');

      var verseItem = btn.closest('.verse-item');
      if (verseItem) {
        verseItem.classList.add('active-verse');
        verseItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // ===== 9. Search dalam Surah =====
    function initVerseSearch() {
      if (!verseSearchInput) return;
      verseSearchInput.removeEventListener('input', handleVerseSearch);
      verseSearchInput.addEventListener('input', handleVerseSearch);
    }

    function handleVerseSearch(e) {
      var term = e.target.value.toLowerCase().trim();
      var items = document.querySelectorAll('.verse-item');

      items.forEach(function (item) {
        if (!term) {
          item.style.display = 'block';
          return;
        }
        var txt = item.innerText.toLowerCase();
        if (txt.indexOf(term) !== -1) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    }

    // ===== 10. Back Navigation (browser back + in-app button, unified) =====
    window.addEventListener('popstate', function (e) {
      var state = e.state;
      if (state && state.surah) {
        var target = allSurahs.find(function (s) { return s.number === state.surah; });
        if (target) {
          loadSurah(target, { targetAyah: state.ayah, historyMode: 'none' });
          return;
        }
      }
      showListView();
    });

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (hasListHistoryEntry) {
          history.back();
        } else {
          // Arrived via direct deep link — no prior list entry to go back to,
          // so create one instead of leaving the site.
          hasListHistoryEntry = true;
          history.pushState({ surah: null, ayah: null }, '', window.location.origin + window.location.pathname);
          showListView();
        }
      });
    }

    // ===== 11. Page-level Share Button =====
    // Shares the current surah link if reading, otherwise shares the tool itself.
    const pageShareBtn = document.getElementById('pageShareBtn');
    if (pageShareBtn) {
      pageShareBtn.addEventListener('click', function () {
        var isReading = readerView && !readerView.classList.contains('hidden') && currentSurahMeta;
        var url = isReading ? surahUrl(currentSurahMeta) : (window.location.origin + window.location.pathname);
        var title = isReading
          ? 'Al-Quran: Surah ' + currentSurahMeta.englishName + ' - Rumi & Terjemahan'
          : 'Al-Quran Online 30 Juzuk - Rumi, Terjemahan & Audio';
        var text = isReading
          ? 'Baca Surah ' + currentSurahMeta.englishName + ' lengkap dengan Rumi, terjemahan BM dan audio, percuma.'
          : 'Baca Al-Quran Online percuma - teks Arab, Rumi, terjemahan BM dan audio ayat demi ayat.';

        if (navigator.share) {
          navigator.share({ title: title, text: text, url: url }).catch(function (err) {
            console.error(err);
          });
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url)
            .then(function () {
              alert('Pautan telah disalin. Boleh tampal di WhatsApp / media sosial.');
            })
            .catch(function () {
              alert('Tidak dapat berkongsi secara automatik. Sila salin pautan secara manual: ' + url);
            });
        } else {
          alert('Pautan: ' + url);
        }
      });
    }
  });

  // ====== Copy / Share / Bookmark (Global) ======

  function getVerseText(verseNum) {
    var arEl = document.getElementById('ar-' + verseNum);
    var rumiEl = document.getElementById('rumi-' + verseNum);
    var myEl = document.getElementById('my-' + verseNum);

    return {
      ar: arEl ? arEl.innerText : '',
      rumi: rumiEl ? rumiEl.innerText : '',
      my: myEl ? myEl.innerText : ''
    };
  }

  function showCopyFeedback(btn) {
    if (!btn) return;
    var originalHTML = btn.innerHTML;
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    setTimeout(function () {
      btn.innerHTML = originalHTML;
    }, 2000);
  }

  function fallbackCopy(text, btn) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      console.error(e);
    }
    document.body.removeChild(textarea);
    showCopyFeedback(btn);
  }

  window.copyVerse = function (surahName, verseNum, btn) {
    var content = getVerseText(verseNum);
    var textToCopy =
      '*' + surahName + ' : Ayat ' + verseNum + '*\n\n' +
      content.ar + '\n\n' +
      content.rumi + '\n\n"' + content.my + '"\n\n' +
      '(Dipetik dari Al-Quran Online 30 Juzuk)';

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(function () {
          showCopyFeedback(btn);
        })
        .catch(function () {
          fallbackCopy(textToCopy, btn);
        });
    } else {
      fallbackCopy(textToCopy, btn);
    }
  };

  // FIX: was guessing the surah number from the URL (which was never set),
  // always defaulting to "1-" — every shared link pointed to Al-Fatihah
  // regardless of which surah the user was actually reading.
  // Now uses the in-memory currentSurahMeta, which is always correct.
  function buildShareUrl(surahName, verseNum) {
    var surahNumber = currentSurahMeta ? currentSurahMeta.number : 1;
    var surahId = surahNumber + '-' + slugify(surahName);
    var base = window.location.origin + window.location.pathname;
    return base + '?surah=' + surahId + '&ayah=' + verseNum + '#ayah-' + verseNum;
  }

  window.shareVerse = function (surahName, verseNum) {
    var content = getVerseText(verseNum);
    var url = buildShareUrl(surahName, verseNum);
    var textToShare =
      surahName + ' : Ayat ' + verseNum + '\n\n' +
      content.ar + '\n' + content.my + '\n\n' +
      'Baca penuh di: ' + url;

    if (navigator.share) {
      navigator.share({
        title: 'Al-Quran: ' + surahName + ' Ayat ' + verseNum,
        text: textToShare,
        url: url
      }).catch(function (err) {
        console.error(err);
      });
    } else {
      // Fallback: copy je ke clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToShare)
          .then(function () {
            alert('Pautan ayat telah disalin. Boleh tampal di WhatsApp / media sosial.');
          })
          .catch(function () {
            alert('Tidak dapat berkongsi secara automatik. Sila salin secara manual.');
          });
      } else {
        alert('Fungsi share tidak disokong. Sila salin secara manual.');
      }
    }
  };

  window.toggleBookmark = function (surahName, verseNum, btn) {
    var key = 'quran_bookmark_' + surahName + '_' + verseNum;
    var svg = btn.querySelector('svg');

    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      btn.classList.remove('bookmarked');
      if (svg) svg.setAttribute('fill', 'none');
    } else {
      localStorage.setItem(key, 'true');
      btn.classList.add('bookmarked');
      if (svg) svg.setAttribute('fill', '#ff9800');
    }
  };

  // Focus ayat (untuk deep link)
  window.focusAyah = function (verseNum) {
    var target = document.querySelector('.verse-item[data-verse="' + verseNum + '"]');
    if (target) {
      target.classList.add('focused-verse');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
})();
