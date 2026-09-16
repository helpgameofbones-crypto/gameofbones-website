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
})();
