
// Objet pour stocker les associations slides -> sons
const slideSounds = {
  "slide-1": "/audios/slide1.mp3",
  "slide-2": "/audios/slide2.mp3",
  "slide-3": "/audios/slide3.mp3",
  "slide-4": "/audios/slide4.mp3",
  "slide-5": "/audios/slide5.mp3"
};

let currentAudio = null;

// Fonction pour récupérer le nom de la slide active
function getCurrentSlideName() {
  const elements = document.querySelectorAll('[aria-label], [title], [data-title]');
  for (const el of elements) {
    const label = el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('data-title');
    if (label && el.offsetParent !== null) {
      return label; // Retourne le nom de la slide visible
    }
  }
  return null;
}

// Fonction pour jouer le son de la slide actuelle
function playSlideAudio(slideName) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  const audioSrc = slideSounds[slideName];
  if (audioSrc) {
    currentAudio = new Audio(audioSrc);
    currentAudio.play().catch(e => console.warn("⚠️ Erreur de lecture audio :", e));
  }
}

// Sauvegarde automatique du nom de la slide dans localStorage
function saveSlideName() {
  const name = getCurrentSlideName();
  if (name) {
    localStorage.setItem('genially-slide-name', name);
    playSlideAudio(name); // Joue le son correspondant
  }
}

// Restauration automatique de la slide après un redémarrage
function restoreSlide() {
  let savedName = localStorage.getItem('genially-slide-name');
  if (!savedName) return;

  console.log("🔄 Tentative de restauration de la slide:", savedName);

  const tryRestore = () => {
    const elements = document.querySelectorAll('[aria-label], [title], [data-title]');
    for (const el of elements) {
      const label = el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('data-title');
      if (label === savedName) {
        console.log('✅ Slide restaurée :', savedName);
        playSlideAudio(savedName);
        return true;
      }
    }
    return false;
  };

  let attempts = 0;
  const interval = setInterval(() => {
    const success = tryRestore();
    attempts++;
    if (success || attempts > 20) {
      clearInterval(interval);
    }
  }, 1000);
}

// Observer les changements dans le DOM pour suivre la progression
const observer = new MutationObserver(saveSlideName);
window.addEventListener('load', () => {
  setTimeout(restoreSlide, 3000);
  const target = document.body;
  observer.observe(target, { childList: true, subtree: true });
});

// Vérification après mise en veille et redémarrage complet
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    restoreSlide();
  }
});
