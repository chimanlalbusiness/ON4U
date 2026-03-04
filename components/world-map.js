function initWorldMap() {
  const mapSection = document.querySelector('.map-component-wrapper');
  if (!mapSection) return;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) {
    mapSection.classList.add('is-visible');
  } else {
    const mapObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          mapSection.classList.add('is-visible');
          observer.unobserve(mapSection);
        }
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });
    mapObserver.observe(mapSection);
  }
}
// Init immediately if available, allow manual trigger too
document.addEventListener('DOMContentLoaded', initWorldMap);
