
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

// Sauvegarde automatique du nom de la slide
function saveSlideName() {
  const name = getCurrentSlideName();
  if (name) {
    localStorage.setItem('genially-slide-name', name);
  }
}

// Fonction pour simuler un clic sur la flèche de navigation
function simulateNextSlide() {
  const arrow = document.querySelector('svg path[d*="M"]'); // Sélectionne une flèche de navigation (à adapter si nécessaire)
  if (arrow) {
    arrow.parentElement.click();
  }
}

// Restauration automatique de la slide après chargement complet de Genially
function restoreSlide() {
  const savedName = localStorage.getItem('genially-slide-name');
  if (!savedName) return;

  const tryRestore = () => {
    const elements = document.querySelectorAll('[aria-label], [title], [data-title]');
    for (const el of elements) {
      const label = el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('data-title');
      if (label === savedName) {
        console.log('✅ Slide restaurée :', savedName);
        return true;
      }
    }
    simulateNextSlide(); // Simule un clic pour avancer jusqu'à la bonne slide
    return false;
  };

  let attempts = 0;
  const interval = setInterval(() => {
    const success = tryRestore();
    attempts++;
    if (success || attempts > 20) {
      clearInterval(interval);
    }
  }, 1000); // Attendre 1 seconde entre chaque tentative
}

// Observer les changements dans le DOM pour suivre la progression
const observer = new MutationObserver(saveSlideName);
window.addEventListener('load', () => {
  setTimeout(restoreSlide, 3000); // Attendre 3s pour que Genially charge complètement
  const target = document.body;
  observer.observe(target, { childList: true, subtree: true });
});
