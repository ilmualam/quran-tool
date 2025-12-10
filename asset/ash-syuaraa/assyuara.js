/*!
 * Surah Ash-Shu'ara Interactive Reader v2.0
 * Enhanced with Auto-Highlight Audio Sync
 * Author: IlmuAlam.com Development Team
 * License: MIT License
 * Copyright (c) 2025 IlmuAlam.com
 * 
 * Features:
 * - Auto-highlight verses during audio playback
 * - Synchronized scrolling with audio
 * - Multiple qari support
 * - Bookmark system with localStorage
 * - Share functionality
 * - Mobile-responsive design
 * 
 * API: Al-Quran Cloud API (https://alquran.cloud/api)
 * Audio: Islamic Network CDN
 * For ilmualam.com domain usage only
 */

(function() {
    'use strict';
    
    const SURAH_NUMBER = 26; // Ash-Shu'ara
    const TOTAL_AYAT = 227;
    const API_BASE = 'https://api.alquran.cloud/v1';
    const AUDIO_CDN = 'https://cdn.islamic.network/quran/audio-surah/128';
    
    // Qari options with proper identifiers
    const QARIS = [
        { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', cdn: 'ar.alafasy' },
        { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)', cdn: 'ar.abdulbasitmurattal' },
        { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', cdn: 'ar.husary' },
        { id: 'ar.abdurrahmaansudais', name: 'Abdul Rahman Al-Sudais', cdn: 'ar.abdurrahmaansudais' }
    ];
    
    let currentAyat = 1;
    let currentQari = QARIS[0];
    let audioElement = new Audio();
    let bookmarks = JSON.parse(localStorage.getItem('ilm_ashshuara_bookmarks') || '[]');
    let surahData = null;
    let isPlaying = false;
    let isLoading = false;
    let autoPlayNext = true;
    
    // Initialize
    function init() {
        const container = document.getElementById('surah-ashshuara-reader');
        if (!container) {
            console.error('Container #surah-ashshuara-reader not found');
            return;
        }
        
        container.innerHTML = createReaderHTML();
        attachEventListeners();
        loadSurahData();
    }
    
    function createReaderHTML() {
        return `
            <div class="ilm-sr-container">
                <!-- Header -->
                <div class="ilm-sr-header">
                    <div class="ilm-sr-title-wrap">
                        <h2 class="ilm-sr-title">🎧 Bacaan Surah Asy Syuara</h2>
                        <p class="ilm-sr-subtitle">227 ayat • Audio Sinkron • Rumi & Terjemahan</p>
                    </div>
                    <div class="ilm-sr-controls-top">
                        <select id="ilm-sr-qari" class="ilm-sr-select" title="Pilih Qari">
                            ${QARIS.map((q, i) => `<option value="${i}">${q.name}</option>`).join('')}
                        </select>
                        <button id="ilm-sr-search-btn" class="ilm-sr-btn-icon" title="Cari Ayat" style="display:inline-block!important;visibility:visible!important;opacity:1!important">🔍</button>
                        <button id="ilm-sr-bookmark-btn" class="ilm-sr-btn-icon" title="Bookmark" style="display:inline-block!important;visibility:visible!important;opacity:1!important">📌</button>
                    </div>
                </div>
                
                <!-- Search Panel -->
                <div id="ilm-sr-search-panel" class="ilm-sr-search-panel" style="display:none">
                    <input type="number" id="ilm-sr-search-input" placeholder="No. Ayat (1-227)" min="1" max="227" class="ilm-sr-input">
                    <button id="ilm-sr-go-btn" class="ilm-sr-btn-sm" style="display:inline-block!important;visibility:visible!important;opacity:1!important">Pergi</button>
                    <button id="ilm-sr-close-search" class="ilm-sr-btn-sm" style="display:inline-block!important;visibility:visible!important;opacity:1!important">Tutup</button>
                </div>
                
                <!-- Bookmarks Panel -->
                <div id="ilm-sr-bookmarks-panel" class="ilm-sr-bookmarks-panel" style="display:none">
                    <h4>📌 Bookmark Anda</h4>
                    <div id="ilm-sr-bookmarks-list"></div>
                    <button id="ilm-sr-close-bookmarks" class="ilm-sr-btn-sm" style="display:inline-block!important;visibility:visible!important;opacity:1!important">Tutup</button>
                </div>
                
                <!-- Ayat Display -->
                <div id="ilm-sr-ayat-display" class="ilm-sr-ayat-display">
                    <div class="ilm-sr-loading">
                        <div class="ilm-sr-spinner"></div>
                        <p>Loading Surah Asy Syuara...</p>
                    </div>
                </div>
                
                <!-- Audio Player -->
                <div class="ilm-sr-player">
                    <div class="ilm-sr-player-info">
                        <span id="ilm-sr-current-ayat">Ayat 1 / 227</span>
                        <span id="ilm-sr-progress-text">00:00 / 00:00</span>
                    </div>
                    <div class="ilm-sr-progress-wrapper">
                        <input type="range" id="ilm-sr-progress" class="ilm-sr-progress-bar" min="0" max="100" value="0" step="0.1">
                    </div>
                    <div class="ilm-sr-player-controls">
                        <button id="ilm-sr-prev" class="ilm-sr-btn-ctrl" title="Ayat Sebelum" style="display:inline-block!important;visibility:visible!important;opacity:1!important">⏮️</button>
                        <button id="ilm-sr-play" class="ilm-sr-btn-play" title="Main" style="display:inline-block!important;visibility:visible!important;opacity:1!important">▶️</button>
                        <button id="ilm-sr-next" class="ilm-sr-btn-ctrl" title="Ayat Seterus" style="display:inline-block!important;visibility:visible!important;opacity:1!important">⏭️</button>
                    </div>
                    <div class="ilm-sr-player-extra">
                        <button id="ilm-sr-repeat" class="ilm-sr-btn-extra" title="Ulang Ayat" style="display:inline-block!important;visibility:visible!important;opacity:1!important">🔁 Ulang</button>
                        <button id="ilm-sr-add-bookmark" class="ilm-sr-btn-extra" title="Tambah Bookmark" style="display:inline-block!important;visibility:visible!important;opacity:1!important">⭐ Bookmark</button>
                        <button id="ilm-sr-share" class="ilm-sr-btn-extra" title="Kongsi" style="display:inline-block!important;visibility:visible!important;opacity:1!important">📤 Share</button>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="ilm-sr-footer">
                    <p>© IlmuAlam.com • Data: Al-Quran Cloud API • Audio: Islamic Network</p>
                </div>
            </div>
            
            <style>
                /* Container & Layout */
                .ilm-sr-container{
                    max-width:100%!important;
                    width:100%!important;
                    margin:0 auto!important;
                    background:#fff!important;
                    border-radius:12px!important;
                    overflow:hidden!important;
                    box-shadow:0 4px 20px rgba(0,0,0,0.08)!important;
                    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif!important;
                }
                
                /* Header */
                .ilm-sr-header{
                    background:linear-gradient(135deg,#249749 0%,#1a7a3a 100%)!important;
                    color:#fff!important;
                    padding:20px!important;
                    display:flex!important;
                    justify-content:space-between!important;
                    align-items:center!important;
                    flex-wrap:wrap!important;
                    gap:12px!important;
                }
                .ilm-sr-title-wrap{flex:1!important;min-width:250px!important}
                .ilm-sr-title{margin:0!important;font-size:1.4rem!important;font-weight:700!important;color:#fff!important}
                .ilm-sr-subtitle{margin:4px 0 0!important;opacity:0.9!important;font-size:0.9rem!important;color:#fff!important}
                .ilm-sr-controls-top{display:flex!important;gap:8px!important;align-items:center!important;flex-wrap:wrap!important}
                .ilm-sr-select{
                    padding:8px 12px!important;
                    border:none!important;
                    border-radius:6px!important;
                    background:#fff!important;
                    color:#0c3808!important;
                    font-size:0.9rem!important;
                    cursor:pointer!important;
                    appearance:auto!important;
                    display:inline-block!important;
                    visibility:visible!important;
                    opacity:1!important;
                }
                .ilm-sr-btn-icon{
                    background:#fff!important;
                    color:#249749!important;
                    border:none!important;
                    width:40px!important;
                    height:40px!important;
                    border-radius:50%!important;
                    font-size:1.2rem!important;
                    cursor:pointer!important;
                    transition:transform 0.2s!important;
                    display:inline-block!important;
                    visibility:visible!important;
                    opacity:1!important;
                    appearance:button!important;
                }
                .ilm-sr-btn-icon:hover{transform:scale(1.1)!important}
                
                /* Search & Bookmarks Panels */
                .ilm-sr-search-panel,.ilm-sr-bookmarks-panel{
                    padding:16px!important;
                    background:#f8f9fa!important;
                    border-bottom:1px solid #e0e0e0!important;
                    display:flex!important;
                    gap:8px!important;
                    align-items:center!important;
                    flex-wrap:wrap!important;
                }
                .ilm-sr-input{
                    padding:8px 12px!important;
                    border:1px solid #ccc!important;
                    border-radius:6px!important;
                    font-size:0.9rem!important;
                    flex:1!important;
                    min-width:150px!important;
                }
                .ilm-sr-btn-sm{
                    padding:8px 16px!important;
                    background:#249749!important;
                    color:#fff!important;
                    border:none!important;
                    border-radius:6px!important;
                    font-size:0.85rem!important;
                    cursor:pointer!important;
                    font-weight:600!important;
                    display:inline-block!important;
                    visibility:visible!important;
                    opacity:1!important;
                    appearance:button!important;
                }
                .ilm-sr-btn-sm:hover{background:#1a7a3a!important}
                .ilm-sr-bookmarks-panel h4{margin:0!important;color:#249749!important;width:100%!important}
                #ilm-sr-bookmarks-list{
                    width:100%!important;
                    max-height:200px!important;
                    overflow-y:auto!important;
                    margin:8px 0!important;
                }
                .ilm-sr-bookmark-item{
                    padding:8px!important;
                    background:#fff!important;
                    margin:4px 0!important;
                    border-radius:4px!important;
                    cursor:pointer!important;
                    display:flex!important;
                    justify-content:space-between!important;
                    align-items:center!important;
                }
                .ilm-sr-bookmark-item:hover{background:#f0f8f4!important}
                
                /* Ayat Display - FIXED CONTAINER */
                .ilm-sr-ayat-display{
                    padding:20px!important;
                    min-height:600px!important;
                    max-height:900px!important;
                    overflow-y:auto!important;
                    overflow-x:hidden!important;
                    background:#fff!important;
                    scroll-behavior:smooth!important;
                }
                .ilm-sr-loading{
                    text-align:center!important;
                    padding:60px 20px!important;
                    color:#666!important;
                }
                .ilm-sr-spinner{
                    width:40px!important;
                    height:40px!important;
                    margin:0 auto 16px!important;
                    border:4px solid #f3f3f3!important;
                    border-top:4px solid #249749!important;
                    border-radius:50%!important;
                    animation:ilm-spin 1s linear infinite!important;
                }
                @keyframes ilm-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
                
                /* Ayat Cards */
                .ilm-sr-ayat-card{
                    background:#f8f9fa!important;
                    padding:20px!important;
                    margin:0 0 16px 0!important;
                    border-radius:8px!important;
                    border-left:4px solid #249749!important;
                    transition:all 0.3s ease!important;
                    cursor:pointer!important;
                    width:100%!important;
                    box-sizing:border-box!important;
                }
                .ilm-sr-ayat-card:hover{
                    background:#e8f5e8!important;
                    transform:translateX(4px)!important;
                }
                .ilm-sr-ayat-card.active{
                    background:#d4f1d4!important;
                    border-left:6px solid #249749!important;
                    box-shadow:0 4px 12px rgba(36,151,73,0.2)!important;
                    transform:translateX(8px)!important;
                }
                .ilm-sr-ayat-number{
                    color:#249749!important;
                    font-weight:700!important;
                    font-size:0.9rem!important;
                    margin-bottom:12px!important;
                    display:flex!important;
                    justify-content:space-between!important;
                    align-items:center!important;
                }
                .ilm-sr-playing-indicator{
                    color:#249749!important;
                    font-size:0.9rem!important;
                    animation:ilm-pulse 1.5s ease-in-out infinite!important;
                }
                @keyframes ilm-pulse{0%,100%{opacity:1}50%{opacity:0.4}}
                .ilm-sr-ayat-arabic{
                    font-size:1.6rem!important;
                    line-height:2.2!important;
                    text-align:right!important;
                    color:#0c3808!important;
                    margin:12px 0!important;
                    font-family:'Amiri','Traditional Arabic','Al Qalam Quran Majeed',serif!important;
                    direction:rtl!important;
                }
                .ilm-sr-ayat-rumi{
                    font-size:15px!important;
                    line-height:1.5!important;
                    border:1px dashed;
                    border-color:#0c3803;
                    border-radius:8px;
                    padding:5px;
                    color:#0c38083!important;
                    margin:12px 0!important;
                    font-style:italic!important;
                }
                .ilm-sr-ayat-translation{
                    font-size:15px!important;
                    padding:5px;
                    line-height:1.5!important;
                    color:#0c3803!important;
                    margin:12px 0!important;
                }
                
                /* Audio Player */
                .ilm-sr-player{
                    background:#f8f9fa!important;
                    padding:20px!important;
                    border-top:2px solid #249749!important;
                }
                .ilm-sr-player-info{
                    display:flex!important;
                    justify-content:space-between!important;
                    margin-bottom:12px!important;
                    font-size:0.9rem!important;
                    color:#666!important;
                }
                #ilm-sr-current-ayat{font-weight:600!important;color:#249749!important}
                .ilm-sr-progress-wrapper{margin:12px 0!important}
                .ilm-sr-progress-bar{
                    width:100%!important;
                    height:6px!important;
                    cursor:pointer!important;
                    appearance:none!important;
                    background:#e0e0e0!important;
                    border-radius:3px!important;
                    outline:none!important;
                }
                .ilm-sr-progress-bar::-webkit-slider-thumb{
                    appearance:none!important;
                    width:16px!important;
                    height:16px!important;
                    background:#249749!important;
                    border-radius:50%!important;
                    cursor:pointer!important;
                    box-shadow:0 2px 4px rgba(0,0,0,0.2)!important;
                }
                .ilm-sr-progress-bar::-moz-range-thumb{
                    width:16px!important;
                    height:16px!important;
                    background:#249749!important;
                    border:none!important;
                    border-radius:50%!important;
                    cursor:pointer!important;
                }
                .ilm-sr-player-controls{
                    display:flex!important;
                    justify-content:center!important;
                    align-items:center!important;
                    gap:16px!important;
                    margin:16px 0!important;
                }
                .ilm-sr-btn-ctrl{
                    background:#249749!important;
                    color:#fff!important;
                    border:none!important;
                    width:48px!important;
                    height:48px!important;
                    border-radius:50%!important;
                    font-size:1.2rem!important;
                    cursor:pointer!important;
                    transition:all 0.2s!important;
                    display:inline-flex!important;
                    align-items:center!important;
                    justify-content:center!important;
                    visibility:visible!important;
                    opacity:1!important;
                    appearance:button!important;
                }
                .ilm-sr-btn-ctrl:hover{transform:scale(1.1)!important;background:#1a7a3a!important}
                .ilm-sr-btn-play{
                    background:#249749!important;
                    color:#fff!important;
                    border:none!important;
                    width:60px!important;
                    height:60px!important;
                    border-radius:50%!important;
                    font-size:1.5rem!important;
                    cursor:pointer!important;
                    transition:all 0.2s!important;
                    box-shadow:0 4px 12px rgba(36,151,73,0.3)!important;
                    display:inline-flex!important;
                    align-items:center!important;
                    justify-content:center!important;
                    visibility:visible!important;
                    opacity:1!important;
                    appearance:button!important;
                }
                .ilm-sr-btn-play:hover{
                    transform:scale(1.15)!important;
                    box-shadow:0 6px 16px rgba(36,151,73,0.4)!important;
                }
                .ilm-sr-player-extra{
                    display:flex!important;
                    justify-content:center!important;
                    gap:8px!important;
                    margin-top:16px!important;
                    flex-wrap:wrap!important;
                }
                .ilm-sr-btn-extra{
                    padding:8px 16px!important;
                    background:#fff!important;
                    color:#249749!important;
                    border:2px solid #249749!important;
                    border-radius:6px!important;
                    font-size:0.85rem!important;
                    cursor:pointer!important;
                    font-weight:600!important;
                    transition:all 0.2s!important;
                    display:inline-block!important;
                    visibility:visible!important;
                    opacity:1!important;
                    appearance:button!important;
                }
                .ilm-sr-btn-extra:hover{
                    background:#249749!important;
                    color:#fff!important;
                }
                
                /* Footer */
                .ilm-sr-footer{
                    text-align:center!important;
                    padding:12px!important;
                    font-size:0.8rem!important;
                    color:#666!important;
                    background:#f8f9fa!important;
                }
                
                /* Mobile Responsive */
                @media(max-width:600px){
                    .ilm-sr-header{flex-direction:column!important;align-items:flex-start!important}
                    .ilm-sr-controls-top{width:100%!important;justify-content:space-between!important}
                    .ilm-sr-title{font-size:1.2rem!important}
                    .ilm-sr-ayat-arabic{font-size:1.4rem!important}
                    .ilm-sr-ayat-display{max-height:600px!important;padding:16px!important}
                    .ilm-sr-player-controls{gap:12px!important}
                    .ilm-sr-btn-ctrl{width:44px!important;height:44px!important}
                    .ilm-sr-btn-play{width:52px!important;height:52px!important}
                    .ilm-sr-player-extra{gap:6px!important}
                    .ilm-sr-btn-extra{padding:6px 12px!important;font-size:0.8rem!important}
                }
            </style>
        `;
    }
    
    function attachEventListeners() {
        // Qari selection
        const qariSelect = document.getElementById('ilm-sr-qari');
        qariSelect.addEventListener('change', (e) => {
            currentQari = QARIS[parseInt(e.target.value)];
            if (isPlaying) {
                playAyat(currentAyat);
            }
        });
        
        // Search
        document.getElementById('ilm-sr-search-btn').addEventListener('click', toggleSearchPanel);
        document.getElementById('ilm-sr-close-search').addEventListener('click', toggleSearchPanel);
        document.getElementById('ilm-sr-go-btn').addEventListener('click', goToAyat);
        document.getElementById('ilm-sr-search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') goToAyat();
        });
        
        // Bookmarks
        document.getElementById('ilm-sr-bookmark-btn').addEventListener('click', toggleBookmarksPanel);
        document.getElementById('ilm-sr-close-bookmarks').addEventListener('click', toggleBookmarksPanel);
        document.getElementById('ilm-sr-add-bookmark').addEventListener('click', addBookmark);
        
        // Player controls
        document.getElementById('ilm-sr-play').addEventListener('click', togglePlay);
        document.getElementById('ilm-sr-prev').addEventListener('click', prevAyat);
        document.getElementById('ilm-sr-next').addEventListener('click', nextAyat);
        document.getElementById('ilm-sr-repeat').addEventListener('click', repeatAyat);
        document.getElementById('ilm-sr-share').addEventListener('click', shareAyat);
        
        // Progress bar
        const progressBar = document.getElementById('ilm-sr-progress');
        progressBar.addEventListener('input', (e) => {
            if (audioElement.duration) {
                const time = (audioElement.duration / 100) * e.target.value;
                audioElement.currentTime = time;
            }
        });
        
        // Audio events
        audioElement.addEventListener('timeupdate', updateProgress);
        audioElement.addEventListener('ended', handleAudioEnded);
        audioElement.addEventListener('loadedmetadata', updateProgressText);
        audioElement.addEventListener('error', handleAudioError);
        audioElement.addEventListener('canplay', () => {
            isLoading = false;
            updatePlayButton();
        });
    }
    
    async function loadSurahData() {
        try {
            const [arabic, translation, transliteration] = await Promise.all([
                fetch(`${API_BASE}/surah/${SURAH_NUMBER}`).then(r => r.json()),
                fetch(`${API_BASE}/surah/${SURAH_NUMBER}/ms.basmeih`).then(r => r.json()),
                fetch(`${API_BASE}/surah/${SURAH_NUMBER}/en.transliteration`).then(r => r.json())
            ]);
            
            if (!arabic.data || !translation.data || !transliteration.data) {
                throw new Error('Failed to load surah data');
            }
            
            surahData = {
                arabic: arabic.data.ayahs,
                translation: translation.data.ayahs,
                transliteration: transliteration.data.ayahs
            };
            
            displayAllAyat();
        } catch (error) {
            console.error('Error loading surah:', error);
            document.getElementById('ilm-sr-ayat-display').innerHTML = 
                '<div class="ilm-sr-loading"><p style="color:#dc3545">❌ Ralat memuatkan data. Sila muat semula halaman.</p></div>';
        }
    }
    
    function displayAllAyat() {
        const container = document.getElementById('ilm-sr-ayat-display');
        container.innerHTML = '';
        
        for (let i = 0; i < TOTAL_AYAT; i++) {
            const ayatNum = i + 1;
            const ayatCard = document.createElement('div');
            ayatCard.className = 'ilm-sr-ayat-card';
            ayatCard.id = `ayat-${ayatNum}`;
            ayatCard.innerHTML = `
                <div class="ilm-sr-ayat-number">
                    <span>Ayat ${ayatNum}</span>
                    <span class="ilm-sr-playing-indicator" style="display:none">🔊 Bermain</span>
                </div>
                <div class="ilm-sr-ayat-arabic">${surahData.arabic[i].text}</div>
                <div class="ilm-sr-ayat-rumi">${convertToMalayRumi(surahData.transliteration[i].text)}</div>
                <div class="ilm-sr-ayat-translation">${surahData.translation[i].text}</div>
            `;
            
            ayatCard.addEventListener('click', () => {
                currentAyat = ayatNum;
                playAyat(currentAyat);
            });
            
            container.appendChild(ayatCard);
        }
        
        highlightAyat(1);
    }
    
    function convertToMalayRumi(text) {
        // Convert English transliteration to Malay-friendly rumi
        return text
            .replace(/th/gi, 'ts')
            .replace(/dh/gi, 'z')
            .replace(/kh/gi, 'kh')
            .replace(/gh/gi, 'gh')
            .replace(/sh/gi, 'sy')
            .replace(/aa/gi, 'a')
            .replace(/ee/gi, 'i')
            .replace(/oo/gi, 'u')
            .replace(/^Al-/gi, 'Al-')
            .replace(/\s+al-/gi, ' al-');
    }
    
    function highlightAyat(number) {
        // Remove all highlights
        document.querySelectorAll('.ilm-sr-ayat-card').forEach(card => {
            card.classList.remove('active');
            const indicator = card.querySelector('.ilm-sr-playing-indicator');
            if (indicator) indicator.style.display = 'none';
        });
        
        // Add highlight to current ayat
        const activeCard = document.getElementById(`ayat-${number}`);
        if (activeCard) {
            activeCard.classList.add('active');
            
            // Show playing indicator
            const indicator = activeCard.querySelector('.ilm-sr-playing-indicator');
            if (indicator && isPlaying) {
                indicator.style.display = 'inline';
            }
            
            // Smooth scroll to center
            activeCard.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
        }
        
        // Update player info
        document.getElementById('ilm-sr-current-ayat').textContent = `Ayat ${number} / 227`;
    }
    
    function playAyat(number) {
        if (number < 1 || number > TOTAL_AYAT) return;
        
        isLoading = true;
        currentAyat = number;
        highlightAyat(number);
        
        // Format: https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/26.mp3
        // Then we need specific ayat, but the API provides full surah audio
        // Let's use per-ayat audio instead
        const ayatNumber = String(number).padStart(3, '0');
        const audioUrl = `https://cdn.islamic.network/quran/audio/128/${currentQari.cdn}/${SURAH_NUMBER}${ayatNumber}.mp3`;
        
        console.log('Playing audio:', audioUrl);
        
        audioElement.src = audioUrl;
        audioElement.load();
        
        audioElement.play().then(() => {
            isPlaying = true;
            updatePlayButton();
            highlightAyat(number); // Re-highlight to show indicator
        }).catch(error => {
            console.error('Audio play error:', error);
            handleAudioError();
        });
    }
    
    function togglePlay() {
        if (isLoading) return;
        
        if (isPlaying) {
            audioElement.pause();
            isPlaying = false;
        } else {
            if (!audioElement.src || audioElement.ended) {
                playAyat(currentAyat);
            } else {
                audioElement.play();
                isPlaying = true;
            }
        }
        updatePlayButton();
    }
    
    function updatePlayButton() {
        const playBtn = document.getElementById('ilm-sr-play');
        if (isLoading) {
            playBtn.textContent = '⏳';
            playBtn.disabled = true;
        } else {
            playBtn.textContent = isPlaying ? '⏸️' : '▶️';
            playBtn.disabled = false;
        }
    }
    
    function prevAyat() {
        if (currentAyat > 1) {
            currentAyat--;
            playAyat(currentAyat);
        }
    }
    
    function nextAyat() {
        if (currentAyat < TOTAL_AYAT) {
            currentAyat++;
            playAyat(currentAyat);
        } else {
            stopPlayback();
        }
    }
    
    function repeatAyat() {
        playAyat(currentAyat);
    }
    
    function handleAudioEnded() {
        if (autoPlayNext && currentAyat < TOTAL_AYAT) {
            setTimeout(() => nextAyat(), 500); // Small delay before next ayat
        } else {
            stopPlayback();
        }
    }
    
    function handleAudioError() {
        console.error('Audio error occurred');
        isLoading = false;
        isPlaying = false;
        updatePlayButton();
        alert('⚠️ Gagal memuatkan audio. Cuba pilih qari lain atau semak sambungan internet.');
    }
    
    function stopPlayback() {
        audioElement.pause();
        isPlaying = false;
        updatePlayButton();
        highlightAyat(currentAyat); // Remove playing indicator
    }
    
    function updateProgress() {
        if (audioElement.duration) {
            const progress = (audioElement.currentTime / audioElement.duration) * 100;
            document.getElementById('ilm-sr-progress').value = progress;
            updateProgressText();
        }
    }
    
    function updateProgressText() {
        const current = formatTime(audioElement.currentTime);
        const duration = formatTime(audioElement.duration);
        document.getElementById('ilm-sr-progress-text').textContent = `${current} / ${duration}`;
    }
    
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    function toggleSearchPanel() {
        const panel = document.getElementById('ilm-sr-search-panel');
        const isVisible = panel.style.display !== 'none';
        panel.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) {
            document.getElementById('ilm-sr-bookmarks-panel').style.display = 'none';
            document.getElementById('ilm-sr-search-input').focus();
        }
    }
    
    function goToAyat() {
        const input = document.getElementById('ilm-sr-search-input');
        const number = parseInt(input.value);
        if (number >= 1 && number <= TOTAL_AYAT) {
            currentAyat = number;
            highlightAyat(currentAyat);
            document.getElementById('ilm-sr-search-panel').style.display = 'none';
            input.value = '';
        } else {
            alert('⚠️ Sila masukkan nombor ayat antara 1 hingga 227');
        }
    }
    
    function toggleBookmarksPanel() {
        const panel = document.getElementById('ilm-sr-bookmarks-panel');
        const isVisible = panel.style.display !== 'none';
        panel.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) {
            document.getElementById('ilm-sr-search-panel').style.display = 'none';
            displayBookmarks();
        }
    }
    
    function addBookmark() {
        if (!bookmarks.includes(currentAyat)) {
            bookmarks.push(currentAyat);
            bookmarks.sort((a, b) => a - b);
            localStorage.setItem('ilm_ashshuara_bookmarks', JSON.stringify(bookmarks));
            alert(`✅ Ayat ${currentAyat} ditambah ke bookmark`);
        } else {
            alert(`ℹ️ Ayat ${currentAyat} sudah ada dalam bookmark`);
        }
    }
    
    function displayBookmarks() {
        const list = document.getElementById('ilm-sr-bookmarks-list');
        if (bookmarks.length === 0) {
            list.innerHTML = '<p style="color:#666;padding:8px;margin:0">Tiada bookmark lagi. Klik ⭐ Simpan untuk menambah.</p>';
            return;
        }
        
        list.innerHTML = bookmarks.map(num => `
            <div class="ilm-sr-bookmark-item" onclick="window.ilmGoToBookmark(${num})">
                <span>📖 Ayat ${num}</span>
                <button onclick="event.stopPropagation();window.ilmRemoveBookmark(${num})" style="background:transparent;border:none;color:#dc3545;cursor:pointer;font-size:1rem">🗑️</button>
            </div>
        `).join('');
    }
    
    window.ilmGoToBookmark = function(num) {
        currentAyat = num;
        document.getElementById('ilm-sr-bookmarks-panel').style.display = 'none';
        playAyat(num);
    };
    
    window.ilmRemoveBookmark = function(num) {
        bookmarks = bookmarks.filter(b => b !== num);
        localStorage.setItem('ilm_ashshuara_bookmarks', JSON.stringify(bookmarks));
        displayBookmarks();
        alert(`🗑️ Ayat ${num} dibuang dari bookmark`);
    };
    
    function shareAyat() {
        if (!surahData) return;
        
        const shareText = `📖 Surah Asy Syuara Ayat ${currentAyat}\n\n${surahData.arabic[currentAyat - 1].text}\n\n${surahData.translation[currentAyat - 1].text}\n\n🔗 Baca lengkap: https://ilmualam.com/surah-asy-syuara-rumi-terjemahan-audio#ayat-${currentAyat}`;
        
        if (navigator.share) {
            navigator.share({
                title: `Surah Asy Syuara Ayat ${currentAyat}`,
                text: shareText
            }).catch(err => console.log('Share cancelled'));
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('✅ Ayat disalin ke clipboard. Anda boleh paste dan kongsi sekarang!');
            }).catch(() => {
                alert('⚠️ Gagal menyalin. Sila cuba lagi.');
            });
        }
    }
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
