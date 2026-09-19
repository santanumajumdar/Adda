// Update Live Clock & Background
function updateClock() {
  const clockElement = document.getElementById('clock');
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Background logic (Day: 6 AM to 6 PM)
  const bgDay = document.getElementById('bg-day');
  const bgNight = document.getElementById('bg-night');
  if (hours >= 6 && hours < 18) {
    bgDay.style.opacity = '1';
    bgNight.style.opacity = '0';
  } else {
    bgDay.style.opacity = '0';
    bgNight.style.opacity = '1';
  }

  hours = hours % 12;
  hours = hours ? hours : 12; 
  minutes = minutes < 10 ? '0' + minutes : minutes;
  
  clockElement.textContent = `${hours}:${minutes} ${ampm}`;
}

setInterval(updateClock, 1000);
updateClock();

// YouTube Player Variables
let player;
let progressInterval;
let isPlaying = false;
let currentPlaylistId = 'PLcybHZcPcNLs'; // Matches Indie Hits active tab

const requestedSongs = [
  { id: 'k6-L23d9JgE', title: 'Sajni - Jal The Band' },
  { id: 'A2T_tqT9QkY', title: 'Pal Pal - Afusic' },
  { id: 'Jb1N1tG7pC8', title: 'Jhol - Coke Studio' },
  { id: 'P8Z6Q-C6d1s', title: 'Majboor' } // using placeholder for majboor if exact ID isn't found
];
let isCustomPlaylistActive = false;
let customPlaylistIndex = 0;

// UI Elements
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = playPauseBtn.querySelector('i');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');

let isShuffleOn = false;
let isRepeatOn = false;

const trackTitle = document.getElementById('track-title');
const trackThumbnail = document.getElementById('track-thumbnail');
const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const equalizer = document.getElementById('equalizer');

const playlistBtn = document.getElementById('playlist-btn');
const closePlaylistBtn = document.getElementById('close-playlist-btn');
const playlistSidebar = document.getElementById('playlist-sidebar');
const playlistItemsContainer = document.getElementById('playlist-items');
const categoryBtns = document.querySelectorAll('.category-btn');

// Volume Controls
const volumeSlider = document.getElementById('volume-slider');
const muteBtn = document.getElementById('mute-btn');
let isMuted = false;
let currentVolume = 100;

// Custom Playlist
const customPlaylistInput = document.getElementById('custom-playlist-url');
const loadCustomPlaylistBtn = document.getElementById('load-custom-playlist');

// Ambience
const ambienceBtn = document.getElementById('ambience-btn');
const ambiencePanel = document.getElementById('ambience-panel');
const closeAmbienceBtn = document.getElementById('close-ambience-btn');

const audioRain = document.getElementById('audio-rain');
const audioStreet = document.getElementById('audio-street');
const audioCafe = document.getElementById('audio-cafe');

const volRain = document.getElementById('vol-rain');
const volStreet = document.getElementById('vol-street');
const volCafe = document.getElementById('vol-cafe');

ambienceBtn.addEventListener('click', () => {
  ambiencePanel.classList.toggle('open');
});
closeAmbienceBtn.addEventListener('click', () => {
  ambiencePanel.classList.remove('open');
});

function handleVolumeChange(audioElement, slider) {
  const vol = slider.value / 100;
  audioElement.volume = vol;
  if (vol > 0 && audioElement.paused) {
    audioElement.play().catch(e => console.log('Audio blocked', e));
  } else if (vol === 0 && !audioElement.paused) {
    audioElement.pause();
  }
}

volRain.addEventListener('input', () => handleVolumeChange(audioRain, volRain));
volStreet.addEventListener('input', () => handleVolumeChange(audioStreet, volStreet));
volCafe.addEventListener('input', () => handleVolumeChange(audioCafe, volCafe));

// Initial volume setup
audioRain.volume = 0;
audioStreet.volume = 0;
audioCafe.volume = 0;

// Pomodoro Timer
const pomoTimeEl = document.getElementById('pomo-time');
const pomoModeEl = document.getElementById('pomo-mode');
const pomoPlayBtn = document.getElementById('pomo-play');
const pomoResetBtn = document.getElementById('pomo-reset');
const audioChime = document.getElementById('audio-chime');

let pomoInterval;
let isPomoRunning = false;
let pomoTimeLeft = 25 * 60; // 25 mins
let isFocusMode = true; // true = Focus, false = Break

let pipWindow = null;
let pipContainerEl = null;
let pipPomoTimeEl = null;
let pipPomoModeEl = null;
let pipTrackTitleEl = null;

function updatePomoUI() {
  const m = Math.floor(pomoTimeLeft / 60).toString().padStart(2, '0');
  const s = (pomoTimeLeft % 60).toString().padStart(2, '0');
  const timeStr = `${m}:${s}`;
  const modeStr = isFocusMode ? 'Focus' : 'Break';
  
  pomoTimeEl.textContent = timeStr;
  pomoModeEl.textContent = modeStr;
  
  if (pipPomoTimeEl) pipPomoTimeEl.textContent = timeStr;
  if (pipPomoModeEl) pipPomoModeEl.textContent = modeStr;
}

function startPomodoro() {
  if (isPomoRunning) return;
  isPomoRunning = true;
  pomoPlayBtn.innerHTML = '<i class="ph ph-pause"></i>';
  pomoInterval = setInterval(() => {
    pomoTimeLeft--;
    updatePomoUI();
    if (pomoTimeLeft <= 0) {
      audioChime.play().catch(e => console.log('Chime blocked', e));
      isFocusMode = !isFocusMode;
      pomoTimeLeft = isFocusMode ? 25 * 60 : 5 * 60;
      updatePomoUI();
    }
  }, 1000);
}

function pausePomodoro() {
  isPomoRunning = false;
  pomoPlayBtn.innerHTML = '<i class="ph ph-play"></i>';
  clearInterval(pomoInterval);
}

pomoPlayBtn.addEventListener('click', () => {
  if (isPomoRunning) pausePomodoro();
  else startPomodoro();
});

pomoResetBtn.addEventListener('click', () => {
  pausePomodoro();
  isFocusMode = true;
  pomoTimeLeft = 25 * 60;
  updatePomoUI();
});

const pomoPipBtn = document.getElementById('pomo-pip');
if (pomoPipBtn) {
  pomoPipBtn.addEventListener('click', async () => {
    if (!('documentPictureInPicture' in window)) {
      alert("Picture-in-Picture is currently only supported in modern Chromium browsers (Chrome, Edge).");
      return;
    }
    
    // Close existing PiP window if open
    if (pipWindow) {
      pipWindow.close();
      return;
    }

    try {
      // Open a PiP window
      pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 180,
      });

      // Clone styles to the PiP window
      const styleLinks = [...document.querySelectorAll('link[rel="stylesheet"], style')];
      styleLinks.forEach((link) => {
        pipWindow.document.head.appendChild(link.cloneNode(true));
      });
      pipWindow.document.body.classList.add('pip-mode');

      // Add Phosphor icons to PiP window
      const scriptIcon = document.createElement('script');
      scriptIcon.src = 'https://unpkg.com/@phosphor-icons/web';
      pipWindow.document.head.appendChild(scriptIcon);

      // Clone HTML template
      const pipTemplate = document.getElementById('pip-template');
      const pipContent = pipTemplate.content.cloneNode(true);
      pipWindow.document.body.appendChild(pipContent);

      // Bind PiP elements
      pipContainerEl = pipWindow.document.querySelector('.pip-container');
      pipPomoTimeEl = pipWindow.document.getElementById('pip-pomo-time');
      pipPomoModeEl = pipWindow.document.getElementById('pip-pomo-mode');
      pipTrackTitleEl = pipWindow.document.getElementById('pip-track-title');

      // Initialize UI states for PiP
      updatePomoUI();
      if (trackTitle.textContent && trackTitle.textContent !== 'Loading...') {
        pipTrackTitleEl.textContent = trackTitle.textContent;
        // Attempt to extract video ID from trackThumbnail src if it exists
        if (trackThumbnail.src && trackThumbnail.src.includes('img.youtube.com/vi/')) {
          const videoId = trackThumbnail.src.split('vi/')[1].split('/')[0];
          pipContainerEl.style.backgroundImage = `url('https://img.youtube.com/vi/${videoId}/hqdefault.jpg')`;
        }
      }

      // Handle window close
      pipWindow.addEventListener("pagehide", (event) => {
        pipWindow = null;
        pipContainerEl = null;
        pipPomoTimeEl = null;
        pipPomoModeEl = null;
        pipTrackTitleEl = null;
      });

    } catch (err) {
      console.error("Failed to open PiP window:", err);
    }
  });
}

updatePomoUI();

// Chat Sidebar
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatSidebar = document.getElementById('chat-sidebar');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');

chatToggleBtn.addEventListener('click', () => chatSidebar.classList.add('open'));
closeChatBtn.addEventListener('click', () => chatSidebar.classList.remove('open'));

// Mock Chat Logic (Replace with Firebase)
function appendMessage(author, text) {
  document.querySelector('.chat-placeholder')?.remove();
  const msg = document.createElement('div');
  msg.className = 'chat-message';
  msg.innerHTML = `
    <span class="chat-author">${author}</span>
    <span class="chat-text">${text}</span>
  `;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendChatBtn.addEventListener('click', () => {
  if(chatInput.value.trim()) {
    appendMessage('You', chatInput.value.trim());
    chatInput.value = '';
    // Mock bot reply
    setTimeout(() => {
      appendMessage('Adda Bot', 'Enjoy the music! ☕');
    }, 1000);
  }
});
chatInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendChatBtn.click(); });

// YouTube Iframe API Initialization
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    playerVars: {
      listType: 'playlist',
      list: currentPlaylistId,
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      modestbranding: 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError
    }
  });
}

function onPlayerReady(event) {
  setupControls();
  player.setVolume(currentVolume);
  
  // Force load the initial playlist (fixes bug where playerVars playlist initialization hangs)
  // Safe Autoplay Attempt
  setTimeout(() => player.playVideo(), 1000);

  if (currentPlaylistId === 'USER_REQUESTED') {
    isCustomPlaylistActive = true;
    customPlaylistIndex = 0;
    playCustomSong(0);
  } else {
    player.cuePlaylist({
      list: currentPlaylistId,
      listType: 'playlist',
      index: 0,
      startSeconds: 0
    });
  }

  // Attempt to generate UI repeatedly until playlist data is available
  let attempts = 0;
  const tryGenerateUI = setInterval(() => {
    const pl = player.getPlaylist();
    if (pl && pl.length > 0) {
      generatePlaylistUI();
      clearInterval(tryGenerateUI);
    }
    if (++attempts > 10) clearInterval(tryGenerateUI);
  }, 500);
}

function onPlayerError(event) {
  console.error("YouTube Player Error", event.data);
  if (isCustomPlaylistActive) {
    playNextCustomSong();
  } else if (player && player.nextVideo) {
    player.nextVideo();
  }
}

function onPlayerStateChange(event) {
  // If playlist UI is empty and we aren't in custom mode, try generating it
  if (!isCustomPlaylistActive && playlistItemsContainer.children.length === 0) {
    generatePlaylistUI();
  }
  
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    playPauseIcon.className = 'ph ph-pause-circle';
    playPauseBtn.classList.add('playing');
    const albumArt = document.querySelector('.album-art');
    if (albumArt) albumArt.classList.add('playing');
    equalizer.classList.add('active');
    startProgressBar();
    if (!isCustomPlaylistActive) updateTrackInfo();
    highlightActivePlaylistTrack();
  } else if (event.data === YT.PlayerState.PAUSED) {
    isPlaying = false;
    playPauseIcon.className = 'ph ph-play-circle';
    playPauseBtn.classList.remove('playing');
    const albumArt = document.querySelector('.album-art');
    if (albumArt) albumArt.classList.remove('playing');
    equalizer.classList.remove('active');
    stopProgressBar();
  } else if (event.data === YT.PlayerState.ENDED) {
    isPlaying = false;
    stopProgressBar();
    playPauseBtn.classList.remove('playing');
    const albumArt = document.querySelector('.album-art');
    if (albumArt) albumArt.classList.remove('playing');
    if (isRepeatOn && isCustomPlaylistActive) {
      playCustomSong(customPlaylistIndex);
      return;
    }

    if (isCustomPlaylistActive) {
      playNextCustomSong();
    } else {
      if (isShuffleOn) {
        playNextNativeSong();
      }
    }
  } else if (event.data === YT.PlayerState.CUED) {
    if (!isCustomPlaylistActive) updateTrackInfo();
    highlightActivePlaylistTrack();
  }
}

function playNextCustomSong() {
  if (isShuffleOn) {
    customPlaylistIndex = Math.floor(Math.random() * requestedSongs.length);
  } else {
    customPlaylistIndex++;
  }
  
  if (customPlaylistIndex >= requestedSongs.length) {
    if (isRepeatOn) {
      customPlaylistIndex = 0; // loop back to start
    } else {
      player.pauseVideo(); // Stop playing if no repeat
      return;
    }
  }
  playCustomSong(customPlaylistIndex);
}

function playNextNativeSong() {
  const playlist = player.getPlaylist();
  if (!playlist || playlist.length === 0) {
    player.nextVideo();
    return;
  }
  if (isShuffleOn) {
    const randomIdx = Math.floor(Math.random() * playlist.length);
    player.playVideoAt(randomIdx);
  } else {
    player.nextVideo();
  }
}

function playPrevNativeSong() {
  const playlist = player.getPlaylist();
  if (!playlist || playlist.length === 0) {
    player.previousVideo();
    return;
  }
  if (isShuffleOn) {
    const randomIdx = Math.floor(Math.random() * playlist.length);
    player.playVideoAt(randomIdx);
  } else {
    player.previousVideo();
  }
}

function playCustomSong(index) {
  const song = requestedSongs[index];
  player.loadVideoById(song.id);
  trackTitle.textContent = song.title;
  trackThumbnail.src = `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`;
  
  if (pipTrackTitleEl) pipTrackTitleEl.textContent = song.title;
  if (pipContainerEl) {
    pipContainerEl.style.backgroundImage = `url('https://img.youtube.com/vi/${song.id}/hqdefault.jpg')`;
  }
  
  highlightActivePlaylistTrack();
}

function setupControls() {
  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) player.pauseVideo();
    else player.playVideo();
  });
  nextBtn.addEventListener('click', () => {
    if (isCustomPlaylistActive) playNextCustomSong();
    else playNextNativeSong();
  });
  prevBtn.addEventListener('click', () => {
    if (isCustomPlaylistActive) {
      customPlaylistIndex = customPlaylistIndex > 0 ? customPlaylistIndex - 1 : requestedSongs.length - 1;
      playCustomSong(customPlaylistIndex);
    } else playPrevNativeSong();
  });
  shuffleBtn.addEventListener('click', () => {
    isShuffleOn = !isShuffleOn;
    shuffleBtn.style.color = isShuffleOn ? '#ffbb00' : '';
    shuffleBtn.style.textShadow = isShuffleOn ? '0 0 10px rgba(255, 187, 0, 0.6)' : '';
  });

  if (repeatBtn) {
    repeatBtn.addEventListener('click', () => {
      isRepeatOn = !isRepeatOn;
      repeatBtn.style.color = isRepeatOn ? '#ffbb00' : '';
      repeatBtn.style.textShadow = isRepeatOn ? '0 0 10px rgba(255, 187, 0, 0.6)' : '';
    });
  }

  progressContainer.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const duration = player.getDuration();
    if (duration) player.seekTo(duration * percentage, true);
  });

  // Volume
  volumeSlider.addEventListener('input', (e) => {
    currentVolume = e.target.value;
    player.setVolume(currentVolume);
    if(currentVolume == 0) muteBtn.className = 'ph ph-speaker-none';
    else if(currentVolume < 50) muteBtn.className = 'ph ph-speaker-low';
    else muteBtn.className = 'ph ph-speaker-high';
  });

  muteBtn.addEventListener('click', () => {
    if (isMuted) {
      player.unMute();
      volumeSlider.value = currentVolume;
      muteBtn.className = 'ph ph-speaker-high';
    } else {
      player.mute();
      volumeSlider.value = 0;
      muteBtn.className = 'ph ph-speaker-slash';
    }
    isMuted = !isMuted;
  });

  // Custom Playlist
  loadCustomPlaylistBtn.addEventListener('click', () => {
    const url = customPlaylistInput.value;
    let listId = '';
    // Extract list ID from URL (e.g. ?list=XYZ or &list=XYZ)
    const match = url.match(/[?&]list=([^#\&\?]+)/);
    if (match) listId = match[1];
    else listId = url; // assume they pasted just the ID

    if (listId && listId.length > 5) {
      currentPlaylistId = listId;
      player.loadPlaylist({ list: currentPlaylistId, listType: 'playlist', index: 0, startSeconds: 0 });
      setTimeout(generatePlaylistUI, 1500);
      categoryBtns.forEach(b => b.classList.remove('active')); // Deselect preset categories
    }
  });
}

function updateTrackInfo() {
  const videoData = player.getVideoData();
  if (videoData && videoData.video_id) {
    const title = videoData.title || 'Unknown Track';
    trackTitle.textContent = title;
    trackThumbnail.src = `https://img.youtube.com/vi/${videoData.video_id}/mqdefault.jpg`;
    
    if (pipTrackTitleEl) pipTrackTitleEl.textContent = title;
    if (pipContainerEl) {
      pipContainerEl.style.backgroundImage = `url('https://img.youtube.com/vi/${videoData.video_id}/hqdefault.jpg')`;
    }
  }
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function startProgressBar() {
  stopProgressBar();
  progressInterval = setInterval(() => {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    if (duration > 0) {
      const percentage = (currentTime / duration) * 100;
      progressBar.style.width = `${percentage}%`;
      currentTimeEl.textContent = formatTime(currentTime);
      durationTimeEl.textContent = formatTime(duration);

      // Smooth Repeat-One Logic for Native Playlists
      // Trap the song just before it ends to prevent YouTube from auto-skipping to the next track
      if (isRepeatOn && !isCustomPlaylistActive) {
        if (duration - currentTime <= 0.8) {
          player.seekTo(0);
        }
      }
    }
  }, 250);
}

function stopProgressBar() {
  if (progressInterval) clearInterval(progressInterval);
}

// Category Switching
categoryBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    categoryBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    
    const newPlaylist = e.target.getAttribute('data-playlist');
    if (newPlaylist && newPlaylist !== currentPlaylistId) {
      currentPlaylistId = newPlaylist;
      
  // Safe Autoplay Attempt
  setTimeout(() => player.playVideo(), 1000);

      if (currentPlaylistId === 'USER_REQUESTED') {
        isCustomPlaylistActive = true;
        customPlaylistIndex = 0;
        
        // Render UI manually
        playlistItemsContainer.innerHTML = '';
        requestedSongs.forEach((song, index) => {
          const item = document.createElement('div');
          item.className = 'playlist-item';
          item.setAttribute('data-index', index);
          item.innerHTML = `
            <img src="https://img.youtube.com/vi/${song.id}/default.jpg" class="item-thumb" alt="Thumb">
            <div class="item-title">${song.title}</div>
          `;
          item.addEventListener('click', () => {
            customPlaylistIndex = index;
            playCustomSong(index);
            playlistSidebar.classList.remove('open');
          });
          playlistItemsContainer.appendChild(item);
        });
        
        playCustomSong(0);

      } else {
        isCustomPlaylistActive = false;
        player.loadPlaylist({
          list: currentPlaylistId,
          listType: 'playlist',
          index: 0,
          startSeconds: 0
        });
        
        setTimeout(() => {
          let attempts = 0;
          const tryGenerateUI = setInterval(() => {
            const pl = player.getPlaylist();
            if (pl && pl.length > 0) {
              generatePlaylistUI();
              clearInterval(tryGenerateUI);
            }
            if (++attempts > 10) clearInterval(tryGenerateUI);
          }, 500);
        }, 500);
      }
    }
  });
});

// Playlist Sidebar Logic
playlistBtn.addEventListener('click', () => playlistSidebar.classList.add('open'));
closePlaylistBtn.addEventListener('click', () => playlistSidebar.classList.remove('open'));

function generatePlaylistUI() {
  playlistItemsContainer.innerHTML = '';
  const playlist = player.getPlaylist();
  if (!playlist) return;

  playlist.forEach((videoId, index) => {
    const item = document.createElement('div');
    item.className = 'playlist-item';
    item.setAttribute('data-index', index);
    
    item.innerHTML = `
      <img src="https://img.youtube.com/vi/${videoId}/default.jpg" class="item-thumb" alt="Thumb">
      <div class="item-title">Track ${index + 1}</div>
    `;

    item.addEventListener('click', () => {
      player.playVideoAt(index);
      playlistSidebar.classList.remove('open');
    });

    playlistItemsContainer.appendChild(item);

    // Asynchronously fetch the actual video title via oEmbed and CORS proxy
    fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + videoId + '&format=json')}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.title) {
          item.querySelector('.item-title').textContent = data.title;
        }
      })
      .catch(err => console.log('Could not fetch title for', videoId));
  });
  highlightActivePlaylistTrack();
}

function highlightActivePlaylistTrack() {
  const items = document.querySelectorAll('.playlist-item');
  items.forEach(item => item.classList.remove('active'));
  
  if (isCustomPlaylistActive) {
    if (items[customPlaylistIndex]) {
      items[customPlaylistIndex].classList.add('active');
    }
  } else {
    const index = player.getPlaylistIndex();
    if (items[index]) {
      items[index].classList.add('active');
      const videoData = player.getVideoData();
      if(videoData && videoData.title) {
          items[index].querySelector('.item-title').textContent = videoData.title;
      }
    }
  }
}

// Live Users Simulator
const onlineCountEl = document.getElementById('online-count');
if (onlineCountEl) {
  let currentUsers = 42;
  
  setInterval(() => {
    // Fluctuate by -2 to +3 users randomly
    const change = Math.floor(Math.random() * 6) - 2;
    currentUsers += change;
    
    // Keep it realistic between 30 and 70
    if (currentUsers < 30) currentUsers = 30 + Math.floor(Math.random() * 5);
    if (currentUsers > 70) currentUsers = 70 - Math.floor(Math.random() * 5);
    
    onlineCountEl.textContent = currentUsers;
  }, 4000 + Math.random() * 4000); // Random interval between 4 to 8 seconds
}

// Adda Trivia Cycler
const triviaTextEl = document.getElementById('trivia-text');
const triviaFacts = [
  "The word 'adda' describes the quintessential Bengali cultural tradition of free-flowing, intellectual, and informal conversation among friends.",
  "In Kolkata, rock (roak) adda takes place on the ledges of old homes where people gather to discuss everything from global politics to Mohun Bagan vs East Bengal.",
  "College Street's Coffee House in Kolkata is the historic epicenter of Adda, where legendary writers like Sunil Gangopadhyay used to debate for hours.",
  "True Adda thrives on cha (tea) and telebhaja (fritters) - a pairing that fuels endless debates.",
  "Adda has no fixed agenda, no time limits, and absolutely no restrictions on what can be discussed.",
  "The art of Adda is considered by many Bengalis to be a crucial intellectual exercise rather than mere gossip."
];

if (triviaTextEl) {
  let triviaIndex = 0;
  setInterval(() => {
    triviaIndex = (triviaIndex + 1) % triviaFacts.length;
    
    // Add fade out effect
    triviaTextEl.style.opacity = 0;
    
    setTimeout(() => {
      triviaTextEl.textContent = triviaFacts[triviaIndex];
      // Fade back in
      triviaTextEl.style.transition = 'opacity 0.5s';
      triviaTextEl.style.opacity = 1;
    }, 500);
    
  }, 12000); // Cycle every 12 seconds
}

// Vinyl Ambience Hook
const volVinyl = document.getElementById('vol-vinyl');
const audioVinyl = document.getElementById('audio-vinyl');
if(volVinyl && audioVinyl) {
  volVinyl.addEventListener('input', (e) => {
    const v = e.target.value / 100;
    audioVinyl.volume = v;
    if (v > 0 && audioVinyl.paused) {
      audioVinyl.play().catch(e => console.log('Autoplay blocked for vinyl', e));
    } else if (v === 0) {
      audioVinyl.pause();
    }
  });
}
