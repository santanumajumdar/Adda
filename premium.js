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
