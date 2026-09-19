// 1. Custom Cursor Logic
const cursorDot = document.createElement('div');
cursorDot.classList.add('cursor-dot');
const cursorFollower = document.createElement('div');
cursorFollower.classList.add('cursor-follower');
document.body.appendChild(cursorDot);
document.body.appendChild(cursorFollower);

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let followerX = mouseX;
let followerY = mouseY;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
});

// Smooth follow effect
function animateCursor() {
  followerX += (mouseX - followerX) * 0.15;
  followerY += (mouseY - followerY) * 0.15;
  cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Add hover states to interactable elements
const interactables = document.querySelectorAll('button, a, input, .playlist-item, .progress-bar-container, .volume-slider');
interactables.forEach(el => {
  el.addEventListener('mouseenter', () => cursorFollower.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hovering'));
});

// 2. Magnetic Buttons
const magneticButtons = document.querySelectorAll('.btn');
magneticButtons.forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Pull the button slightly towards the cursor
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    // Snap back
    btn.style.transform = `translate(0px, 0px)`;
  });
});

// 3. 3D Parallax Mouse Tracking
const bgImageNight = document.querySelector('#bg-night img');
const bgImageDay = document.querySelector('#bg-day img');
const heroContent = document.querySelector('.hero-content');
const pomoWidget = document.querySelector('.pomodoro-widget');

document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5);
  const y = (e.clientY / window.innerHeight - 0.5);

  // Background moves opposite to mouse (feels like depth)
  if(bgImageNight) bgImageNight.style.transform = `scale(1.05) translate(${x * -20}px, ${y * -20}px) translateZ(0)`;
  if(bgImageDay) bgImageDay.style.transform = `scale(1.05) translate(${x * -20}px, ${y * -20}px) translateZ(0)`;
  
  // Hero text moves with mouse (parallax foreground)
  if(heroContent) heroContent.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
  
  // Pomodoro moves slightly
  if(pomoWidget) pomoWidget.style.transform = `translate(${x * -15}px, ${y * -15}px)`;
});

// 4. Equalizer Sync
// Periodically check the global isPlaying variable from app.js to toggle equalizer animation
setInterval(() => {
  const eq = document.getElementById('equalizer');
  if (eq) {
    if (typeof isPlaying !== 'undefined' && isPlaying) {
      eq.classList.add('playing');
    } else {
      eq.classList.remove('playing');
    }
  }
}, 500);

// 5. Vinyl Record Animation
setInterval(() => {
  const vinyl = document.querySelector('.vinyl-container');
  if (vinyl) {
    if (typeof isPlaying !== 'undefined' && isPlaying) {
      vinyl.classList.add('spinning');
    } else {
      vinyl.classList.remove('spinning');
    }
  }
}, 500);

// 6. Background Slideshow & Now Playing Info
const slideshowContainer = document.createElement('div');
slideshowContainer.className = 'slideshow-container';
document.querySelector('.background-container').prepend(slideshowContainer);

const npDisplay = document.createElement('div');
npDisplay.className = 'now-playing-display';
npDisplay.innerHTML = `
  <div class="np-label"><i class="ph ph-speaker-high"></i> Now Playing</div>
  <div class="np-title" id="np-title">Loading...</div>
  <div class="np-artist" id="np-artist">Loading...</div>
`;
document.body.appendChild(npDisplay);

const aestheticImages = [
  './bg.jpg', // Default night
  './bg-day.jpg', // Default day
  'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?q=80&w=1920', // Moody cafe
  'https://images.unsplash.com/photo-1499882200388-348df8402f1a?q=80&w=1920', // Rainy window
  'https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?q=80&w=1920'  // Lofi sunset
];

let currentSlideIndex = 0;
let currentVideoId = null;
let slideInterval = null;

// Initialize slide layers
const layer1 = document.createElement('img');
layer1.className = 'slide-layer active';
layer1.src = aestheticImages[0];
const layer2 = document.createElement('img');
layer2.className = 'slide-layer';
slideshowContainer.appendChild(layer1);
slideshowContainer.appendChild(layer2);

let activeLayer = 1;

function crossfadeSlide(imgSrc) {
  if (activeLayer === 1) {
    layer2.src = imgSrc;
    layer2.onload = () => {
      layer2.classList.add('active');
      layer1.classList.remove('active');
      activeLayer = 2;
    };
  } else {
    layer1.src = imgSrc;
    layer1.onload = () => {
      layer1.classList.add('active');
      layer2.classList.remove('active');
      activeLayer = 1;
    };
  }
}

function startSlideshow() {
  if (slideInterval) clearInterval(slideInterval);
  // Hide the hardcoded backgrounds so our slideshow is visible
  document.getElementById('bg-night').style.display = 'none';
  document.getElementById('bg-day').style.display = 'none';
  
  slideInterval = setInterval(() => {
    currentSlideIndex = (currentSlideIndex + 1) % aestheticImages.length;
    crossfadeSlide(aestheticImages[currentSlideIndex]);
  }, 12000); // 12 seconds per slide
}

// Hook into Track Changes & Real-Time Internet Image Fetching
setInterval(() => {
  if (typeof player !== 'undefined' && typeof player.getVideoData === 'function') {
    const videoData = player.getVideoData();
    if (videoData && videoData.video_id) {
      if (videoData.video_id !== currentVideoId) {
        currentVideoId = videoData.video_id;
        
        let title = videoData.title || 'Unknown Track';
        let artist = videoData.author || 'Unknown Artist';
        
        // Show initial loading info
        document.getElementById('np-title').textContent = title;
        document.getElementById('np-artist').textContent = (artist === 'Unknown Artist' ? 'Fetching Details...' : artist);
        npDisplay.classList.add('visible');
        
        // Reset slideshow array to the YouTube thumbnail initially
        const ytThumb = `https://img.youtube.com/vi/${currentVideoId}/maxresdefault.jpg`;
        aestheticImages.splice(2); // Clear previous track's internet images
        aestheticImages[2] = ytThumb;
        crossfadeSlide(ytThumb);
        startSlideshow();

        // Clean the title for better iTunes searching
        // E.g., "Hai Apna Dil To Aawara (happy)" -> "Hai Apna Dil To Aawara"
        let cleanSearchTerm = title.replace(/(\(|\[).*(\)|\])/g, '').split('|')[0].split('-')[0].trim();
        
        // 1. Fetch Album/Movie Art from iTunes API
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanSearchTerm)}&limit=5&entity=song`)
          .then(res => res.json())
          .then(data => {
            if (data && data.results && data.results.length > 0) {
              const bestMatch = data.results[0];
              
              // Update the UI with the ACTUAL real-world artist and track name from iTunes Database!
              if (bestMatch.trackName) document.getElementById('np-title').textContent = bestMatch.trackName;
              if (bestMatch.artistName) document.getElementById('np-artist').textContent = bestMatch.artistName;

              data.results.forEach(track => {
                if (track.artworkUrl100) {
                  // Get extremely high-res movie/album art
                  const highResArt = track.artworkUrl100.replace('100x100bb', '1000x1000bb');
                  if (!aestheticImages.includes(highResArt)) {
                    aestheticImages.push(highResArt);
                  }
                }
              });
              
              // Now that we have a real artist name, fetch their photo from Wikipedia!
              let realArtist = bestMatch.artistName.replace(/ /g, '_');
              fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(realArtist)}&origin=*`)
                .then(res => res.json())
                .then(wikiData => {
                  if (wikiData && wikiData.query && wikiData.query.pages) {
                    const pages = wikiData.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pageId !== "-1" && pages[pageId].original) {
                      const artistPhoto = pages[pageId].original.source;
                      if (!aestheticImages.includes(artistPhoto)) {
                        aestheticImages.push(artistPhoto);
                      }
                    }
                  }
                }).catch(err => console.log('Wiki fetch failed:', err));
            }
          }).catch(err => console.log('iTunes fetch failed:', err));
      }
    } else {
      npDisplay.classList.remove('visible');
    }
  }
}, 1000);
