document.scrollingElement.scrollTo({ top: 0, behavior: 'instant' });
document.scrollingElement.style.overflowY = 'hidden';
history.scrollRestoration = 'manual';

// Initialize Lenis smooth scrolling
const lenis = new Lenis({
  autoRaf: true,
});

// Initialize page scroll
// const progressBar = new ScrollProgressBar({
//   background: '#fff',
//   height: '0.5rem',
// });

// Typing animation for splash
function typeText(text, element, speed = 150) {
  return new Promise((resolve) => {
    let i = 0;
    element.textContent = '';

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        // Remove cursor after typing is complete
        setTimeout(() => {
          element.classList.remove('typing-text');
          resolve();
        }, 1000);
      }
    }

    type();
  });
}

// Start typing animation
async function startSplash() {
  const typingElement = document.getElementById('typingText');

  // Wait 1.5 seconds before starting typing animation
  await new Promise(resolve => setTimeout(resolve, 300));

  await typeText('ICT LABORATORY', typingElement, 80);

  // Wait a bit then fade out
  setTimeout(() => {
    document.getElementById('splash').classList.add('fade-out');

    // Start main content after splash fade out
    setTimeout(() => {
      loadAndStart();
      sal({
        threshold: 0.3,
        once: true,
        disabled: false
      });
      document.scrollingElement.style.overflowY = 'inherit';
    }, 800);
  }, 800);
}

// Image loading with progress tracking
let loadedImages = 0;
const totalImages = 16;

// Update loading progress
function updateLoadingProgress(loaded, total) {
  const percentage = Math.round((loaded / total) * 100);
  const progressBar = document.getElementById('progressBar');
  const loadingPercentage = document.getElementById('loadingPercentage');

  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
    progressBar.style.transition = 'width 0.3s ease';
  }

  if (loadingPercentage) {
    loadingPercentage.textContent = `${percentage}%`;
  }
}

// List gambar 1–16
const imageList = Array.from({ length: 16 }, (_, i) => i + 1);

// Check file extensions (.webp, .jpg, .JPG)
function resolveImagePath(num) {
  const pathWebp = `img/landing/${num}.webp`;

  return new Promise(resolve => {
    // Try WebP first (best compression)
    const imgWebp = new Image();
    imgWebp.src = pathWebp;
    imgWebp.onload = () => {
      loadedImages++;
      updateLoadingProgress(loadedImages, totalImages);
      resolve(pathWebp);
    };
  });
}

// Load images and start marquee (use preloaded images)
async function loadAndStart() {
  // Use preloaded images if available, otherwise load them
  const images = window.preloadedImages || await Promise.all(imageList.map(resolveImagePath));

  const groups = [
    images.slice(0, 4),
    images.slice(4, 8),
    images.slice(8, 12),
    images.slice(12, 16)
  ];

  groups.forEach((group, i) => {
    const track = document.getElementById(`track${i+1}`);
    group.concat(group).forEach(src => {
      if (!src) return;
      const img = document.createElement('img');
      img.src = src;
      track.appendChild(img);
    });
  });

  // Start marquee animation
  document.querySelectorAll('.marquee-row').forEach(row => {
    row.classList.add('start-animation');
  });

  // Setup parallax scroll
  setupParallaxScroll();
}

// Parallax scroll effect
function setupParallaxScroll() {
  const marqueeParallax = document.getElementById('marqueeParallax');
  const heroSection = document.getElementById('heroSection');
  const hallOfFame = document.getElementById('hallOfFame');
  const navbar = document.getElementById('navbar');
  const topScroll = document.querySelector('#top-scroll');

  lenis.on('scroll', () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    // Calculate scroll progress (0 to 1.5 for shorter parallax)
    const scrollProgress = Math.min(scrollY / windowHeight, 1.5);

    // Apply effects based on scroll progress with smooth transitions
    if (scrollProgress > 0 && scrollProgress < 0.5) {
      // Stage 1: Shrink gaps immediately when scrolling starts (0-50% scroll)
      marqueeParallax.classList.add('shrink');
    }
    else if (scrollProgress >= 0.5 && scrollProgress < 0.75) {
      // Stage 2: Complete compaction (50-75% scroll)
      marqueeParallax.classList.remove('shrink');
      marqueeParallax.classList.add('compact');
    }
    else if (scrollProgress >= 0.75 && scrollProgress < 1.0) {
      // Stage 3: Blur and show hero left only (75-100% scroll)
      marqueeParallax.classList.add('compact', 'blur');
      heroSection.classList.add('visible');
    }
    else if (scrollProgress >= 1.0) {
      // Stage 4: Show hero right content dan mulai Hall of Fame (100%+ scroll)
      marqueeParallax.classList.add('compact', 'blur');
      heroSection.classList.add('visible', 'show-right');
      topScroll.classList.add('hidden');

      // Show navbar saat masuk Hall of Fame
      // TODO: ini bermasalah
      const hallOfFameRect = hallOfFame.getBoundingClientRect();
      if (hallOfFameRect.top <= 100) {
        navbar.classList.add('visible');
      }
    } else {
      // Always reset classes first for smooth transitions
      marqueeParallax.classList.remove('shrink', 'compact', 'blur');
      heroSection.classList.remove('visible', 'show-right');
      navbar.classList.remove('visible');
      topScroll.classList.remove('hidden');
    }
  });
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  // Start loading screen first
  startLoadingSequence();
});

// Main loading sequence
async function startLoadingSequence() {
  // Loading screen is visible by default
  // Start loading images immediately when loading screen is shown
  await preloadImages();

  // Hide loading screen
  const loadingScreen = document.getElementById('loadingScreen');
  loadingScreen.classList.add('hidden');

  // Wait for loading screen to fade out, then start splash
  setTimeout(() => {
    startSplash();
  }, 500);
}

// Preload all images before showing splash
async function preloadImages() {
  // Reset counter
  loadedImages = 0;
  updateLoadingProgress(0, totalImages);

  const images = await Promise.all(imageList.map(resolveImagePath));

  // Store loaded images for later use
  window.preloadedImages = images;

  // Wait a bit to show loading complete status
  await new Promise(resolve => setTimeout(resolve, 800));
}