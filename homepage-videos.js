(() => {
  const videos = [...document.querySelectorAll('.dog-video')];
  if (!videos.length) return;
  const loadAndPlay = (video) => {
    const source = video.querySelector('source[data-src]');
    if (source && !source.src) { source.src = source.dataset.src; video.load(); }
    const playing = video.play();
    if (playing && typeof playing.catch === 'function') playing.catch(() => {});
  };
  if (!('IntersectionObserver' in window)) { videos.forEach(loadAndPlay); return; }
  const observer = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) loadAndPlay(target); else target.pause();
  }), { threshold: 0.5, rootMargin: '120px 0px' });
  videos.forEach((video) => observer.observe(video));

  document.querySelectorAll('.dog-video-carousel').forEach((carousel) => {
    const viewport = carousel.querySelector('.dog-video-viewport');
    const previous = carousel.querySelector('.dog-video-arrow--previous');
    const next = carousel.querySelector('.dog-video-arrow--next');
    if (!viewport || !previous || !next) return;

    const updateControls = () => {
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      previous.disabled = viewport.scrollLeft <= 2;
      next.disabled = viewport.scrollLeft >= maxScroll - 2;
    };
    const move = (direction) => viewport.scrollBy({ left: direction * Math.max(260, viewport.clientWidth * 0.92), behavior: 'smooth' });

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    viewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    });
    viewport.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls);
    updateControls();
  });
})();
