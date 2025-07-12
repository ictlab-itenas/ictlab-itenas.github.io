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
let totalImages = 0;

// Get all image sources from the website
function getAllImageSources() {
  const imageSources = [];
  
  // Marquee images (1-16)
  const marqueeImages = Array.from({ length: 16 }, (_, i) => `img/landing/${i + 1}.webp`);
  imageSources.push(...marqueeImages);
  
  // Member images - check for member-card img elements
  const memberCards = document.querySelectorAll('.member-card img');
  memberCards.forEach(img => {
    if (img.src || img.dataset.src) {
      imageSources.push(img.src || img.dataset.src);
    }
  });
  
  // Hero section images
  const heroImages = document.querySelectorAll('#heroSection img');
  heroImages.forEach(img => {
    if (img.src || img.dataset.src) {
      imageSources.push(img.src || img.dataset.src);
    }
  });
  
  // Hall of Fame images
  const hofImages = document.querySelectorAll('#hallOfFame img');
  hofImages.forEach(img => {
    if (img.src || img.dataset.src) {
      imageSources.push(img.src || img.dataset.src);
    }
  });
  
  // Project images
  const projectImages = document.querySelectorAll('#project img');
  projectImages.forEach(img => {
    if (img.src || img.dataset.src) {
      imageSources.push(img.src || img.dataset.src);
    }
  });
  
  // Navbar logo and other images
  const otherImages = document.querySelectorAll('img:not(.member-card img):not(#heroSection img):not(#hallOfFame img):not(#project img)');
  otherImages.forEach(img => {
    if (img.src || img.dataset.src) {
      const src = img.src || img.dataset.src;
      // Skip if it's already in marquee images
      if (!src.includes('img/landing/')) {
        imageSources.push(src);
      }
    }
  });
  
  // Remove duplicates and filter out empty sources
  return [...new Set(imageSources)].filter(src => src && src.trim() !== '');
}

// Update loading progress with smooth animation
function updateLoadingProgress(loaded, total) {
  const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;
  const customBar = document.getElementById('customLoadingBar');
  const lamp = document.getElementById('loadingLamp');
  const barTrack = customBar ? customBar.parentElement : null;
  
  // Bar track animasi width dan background
  if (barTrack) {
    if (percentage > 0) {
      barTrack.classList.add('bar-visible');
      barTrack.style.width = window.innerWidth < 768 ? '50vw' : '40vw';
    } else {
      barTrack.classList.remove('bar-visible');
      barTrack.style.width = '0';
    }
  }
  
  // Smooth progress bar animation
  if (customBar) {
    customBar.style.transition = 'width 0.3s ease-out';
    customBar.style.width = `${percentage}%`;
  }
  
  if (lamp && barTrack) {
    lamp.style.right = '0';
  }
  
  // Show loading percentage text
  const loadingText = document.getElementById('loadingText');
  if (loadingText) {
    loadingText.textContent = `${percentage}%`;
  }
  
  // Log progress for debugging
  console.log(`Loading progress: ${loaded}/${total} (${percentage}%)`);
}

// Load a single image with promise and proper error handling
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    
    const onComplete = () => {
      loadedImages++;
      updateLoadingProgress(loadedImages, totalImages);
      resolve(src);
    };
    
    img.onload = onComplete;
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`);
      onComplete(); // Still count as complete to avoid stuck loading
    };
    
    // Set crossOrigin if needed for external images
    if (src.startsWith('http') && !src.includes(window.location.hostname)) {
      img.crossOrigin = 'anonymous';
    }
    
    img.src = src;
  });
}

// Check file extensions for marquee images
function resolveImagePath(num) {
  const pathWebp = `img/landing/${num}.webp`;
  return loadImage(pathWebp);
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

// Member Carousel Logic
function initMemberCarousel() {
  const cards = Array.from(document.querySelectorAll('.member-card'));
  const count = document.getElementById('memberCount');
  const countCurrent = count.querySelector('.member-count-current');
  const countTotal = count.querySelector('.member-count-total');
  const prevBtn = document.getElementById('memberPrev');
  const nextBtn = document.getElementById('memberNext');
  let current = 0;
  const total = cards.length;

  // Set total only once
  countTotal.textContent = String(total).padStart(2, '0');

  // --- Arrow marquee animation ---
  function setupArrowMarquee(btn, dir) {
    let timeout;
    btn.addEventListener('mouseenter', () => {
      btn.classList.remove(`marquee-${dir}-leave`);
      void btn.offsetWidth;
      btn.classList.add(`marquee-${dir}-hover`);
    });
    btn.addEventListener('mouseleave', () => {
      btn.classList.remove(`marquee-${dir}-hover`);
      btn.classList.add(`marquee-${dir}-leave`);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        btn.classList.remove(`marquee-${dir}-leave`);
      }, 370);
    });
  }
  setupArrowMarquee(nextBtn, 'right');
  setupArrowMarquee(prevBtn, 'left');

  function animateCount(newNum, direction = 'down') {
    const oldNum = countCurrent.querySelector('.member-count-num.current');
    // Remove any previous animating spans
    countCurrent.innerHTML = '';
    // Create out (old) and in (new) spans
    const outSpan = document.createElement('span');
    outSpan.className = 'member-count-num current ' + (direction === 'up' ? 'out-up' : 'out-down');
    outSpan.textContent = oldNum ? oldNum.textContent : countCurrent.textContent;
    const inSpan = document.createElement('span');
    inSpan.className = 'member-count-num ' + (direction === 'up' ? 'in-up' : 'in-down');
    inSpan.textContent = newNum;
    countCurrent.appendChild(outSpan);
    countCurrent.appendChild(inSpan);
    // Trigger animation
    countCurrent.classList.remove('animate-down', 'animate-up');
    void countCurrent.offsetWidth;
    countCurrent.classList.add(direction === 'up' ? 'animate-up' : 'animate-down');
    setTimeout(() => {
      // After animation, keep only the new number as .current
      countCurrent.innerHTML = '';
      const finalSpan = document.createElement('span');
      finalSpan.className = 'member-count-num current';
      finalSpan.textContent = newNum;
      countCurrent.appendChild(finalSpan);
      countCurrent.classList.remove('animate-down', 'animate-up');
    }, 450);
  }

  // Daftar link portofolio member (index 0 = member 1)
  const memberLinks = [
    '#', // 1
    '#', // 2
    '#', // 3
    'https://portfolio.seya.zip/', // 4
    'https://afinmh.github.io/', // 5
    '#', // 6
    'https://www.linkedin.com/in/maulanaseno/', // 7
    '#', // 8
    '#', // 9
    'https://www.linkedin.com/in/hanifaprl/', // 10
    'https://dedrick.vercel.app/', // 11
    '#', // 12
    '#', // 13
    '#', // 14
    'https://portfolio-ashen-one-97.vercel.app/', // 15
    '#', // 16
    '#', // 17
    '#', // 18
    'https://www.linkedin.com/in/ahmad-ripaii/', // 19
    'https://www.linkedin.com/in/lifyana-na/', // 20
    '#', // 21
    '#', // 22
    '#', // 23
    '#', // 24
    '#', // 25
    '#', // 26
    '#', // 27
  ];

  function updateChooseMemberBtn(idx) {
    const btn = document.getElementById('chooseMemberBtn');
    const link = memberLinks[idx] || '#';
    btn.href = link;
    if (link === '#' || !link) {
      btn.classList.add('disabled');
      btn.setAttribute('tabindex', '-1');
      btn.setAttribute('aria-disabled', 'true');
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    } else {
      btn.classList.remove('disabled');
      btn.setAttribute('tabindex', '0');
      btn.setAttribute('aria-disabled', 'false');
      btn.style.pointerEvents = '';
      btn.style.opacity = '';
      btn.style.cursor = '';
    }
  }

  function updateCarousel(dir = 'down') {
    cards.forEach((card, i) => {
      card.classList.remove('active', 'prev', 'next', 'pre-prev', 'post-next');
      if (i === current) {
        card.classList.add('active');
      } else if (i === (current - 1 + total) % total) {
        card.classList.add('prev');
      } else if (i === (current + 1) % total) {
        card.classList.add('next');
      } else if (i === (current - 2 + total) % total) {
        card.classList.add('pre-prev');
      } else if (i === (current + 2) % total) {
        card.classList.add('post-next');
      }
    });
    const newNum = String(current + 1).padStart(2, '0');
    animateCount(newNum, dir);
    updateChooseMemberBtn(current);
  }

  prevBtn.addEventListener('click', () => {
    current = (current - 1 + total) % total;
    updateCarousel('up');
  });
  nextBtn.addEventListener('click', () => {
    current = (current + 1) % total;
    updateCarousel('down');
  });

  // Init with first number
  countCurrent.innerHTML = '';
  const firstSpan = document.createElement('span');
  firstSpan.className = 'member-count-num current';
  firstSpan.textContent = String(current + 1).padStart(2, '0');
  countCurrent.appendChild(firstSpan);

  updateCarousel();
}

let memberAutoplayInterval = null;
let isMemberHovered = false;
let nextBtn = null;

function startMemberAutoplay() {
  if (memberAutoplayInterval) return;
  memberAutoplayInterval = setInterval(() => {
    if (!isMemberHovered && nextBtn) {
      nextBtn.click();
    }
  }, 3000);
}
function stopMemberAutoplay() {
  clearInterval(memberAutoplayInterval);
  memberAutoplayInterval = null;
}

const memberSection = document.querySelector('.member-section');
if (memberSection) {
  memberSection.addEventListener('mouseenter', () => {
    isMemberHovered = true;
    stopMemberAutoplay();
  });
  memberSection.addEventListener('mouseleave', () => {
    isMemberHovered = false;
    startMemberAutoplay();
  });
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  // Start loading screen first
  startLoadingSequence();
  // Init member carousel after DOM ready
  initMemberCarousel();
  // Inisialisasi nextBtn setelah carousel siap
  nextBtn = document.getElementById('memberNext');
  // Autoplay logic
  const memberSection = document.querySelector('.member-section');
  if (memberSection) {
    memberSection.addEventListener('mouseenter', () => {
      isMemberHovered = true;
      stopMemberAutoplay();
    });
    memberSection.addEventListener('mouseleave', () => {
      isMemberHovered = false;
      startMemberAutoplay();
    });
  }
  startMemberAutoplay();
});

// Main loading sequence
async function startLoadingSequence() {
  // Sembunyikan top-scroll selama loading
  const topScroll = document.getElementById('top-scroll');
  if (topScroll) topScroll.classList.add('hidden');

  await preloadImages();

  // Custom lamp animation
  const lamp = document.getElementById('loadingLamp');
  if (lamp) {
    // Reset semua class animasi lampu
    lamp.classList.remove('lamp-on', 'lamp-bounce', 'lamp-drop');
    // Hapus semua event listener animationend sebelumnya
    const newLamp = lamp.cloneNode(true);
    lamp.parentNode.replaceChild(newLamp, lamp);
    // Lampu menyala
    setTimeout(() => {
      newLamp.classList.add('lamp-on');
      // Setelah lampu menyala, langsung ke splash
      setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) loadingScreen.classList.add('hidden');
        if (topScroll) setTimeout(() => { topScroll.classList.remove('hidden'); }, 600);
        setTimeout(() => {
          startSplash();
        }, 500);
      }, 700); // Tampilkan lampu menyala sebentar
    }, 10); // Pastikan reset class dulu
  } else {
    // Fallback: langsung splash
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) loadingScreen.classList.add('hidden');
    setTimeout(() => {
      if (topScroll) topScroll.classList.remove('hidden');
      startSplash();
    }, 500);
  }
}

// Preload all images with proper progress tracking
async function preloadImages() {
  // Reset counter
  loadedImages = 0;
  
  // Get all image sources from the website
  const allImageSources = getAllImageSources();
  totalImages = allImageSources.length;
  
  // Initialize progress bar with 0%
  updateLoadingProgress(0, totalImages);
  
  console.log(`Starting preload of ${totalImages} images...`);
  
  // Create promises for all images
  const loadPromises = allImageSources.map(src => {
    // Convert relative paths to absolute paths
    const absoluteSrc = src.startsWith('http') ? src : new URL(src, window.location.origin).href;
    return loadImage(absoluteSrc);
  });
  
  try {
    // Load all images and wait for completion
    const images = await Promise.all(loadPromises);
    
    // Store loaded marquee images for later use
    window.preloadedImages = images.filter(src => src.includes('img/landing/'));
    
    console.log(`Successfully preloaded ${images.length} images`);
    
    // Ensure progress bar shows 100% before continuing
    updateLoadingProgress(totalImages, totalImages);
    
    // Wait a bit to show loading complete status
    await new Promise(resolve => setTimeout(resolve, 500));
    
  } catch (error) {
    console.error('Error preloading images:', error);
    // Ensure progress bar shows 100% even if there are errors
    updateLoadingProgress(totalImages, totalImages);
  }
}