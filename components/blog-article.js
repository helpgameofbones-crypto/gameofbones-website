/* Blog article overlay behavior. Data stays in the page while it is progressively modularised. */
(function () {
  function openArt(idx) {
    var a = articles[idx];
    if (!a) return;
    currentArtIdx = idx;
    var emoji = document.getElementById('art-emoji'); if (emoji) emoji.textContent = a.emoji;
    var tag = document.getElementById('art-tag'); if (tag) tag.textContent = a.tag;
    var title = document.getElementById('art-title'); if (title) title.textContent = a.title;
    var meta = document.getElementById('art-meta'); if (meta) meta.textContent = a.date;
    document.getElementById('art-body').innerHTML = a.body;
    var waShare = document.getElementById('art-wa-share');
    if (waShare) {
      var message = encodeURIComponent('Check out this article from Game of Bones: \u201c' + a.title + '\u201d \ud83d\udc3e gameofbones.in');
      waShare.href = 'https://wa.me/?text=' + message;
    }
    var prevBtn = document.getElementById('art-prev-btn');
    var nextBtn = document.getElementById('art-next-btn');
    if (prevBtn) prevBtn.style.display = idx > 0 ? 'inline-flex' : 'none';
    if (nextBtn) nextBtn.style.display = idx < articles.length - 1 ? 'inline-flex' : 'none';
    var overlay = document.getElementById('artOverlay');
    overlay.classList.add('open');
    overlay.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    try { window.history.pushState({}, '', '?page=blog-' + createBlogSlug(a.title)); } catch (e) {}
  }

  function closeArt() {
    document.getElementById('artOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function shareArticle(platform) {
    if (!currentArtIdx && currentArtIdx !== 0) return;
    var article = articles[currentArtIdx];
    var title = article.title;
    var url = window.location.origin + window.location.pathname + '?article=' + currentArtIdx;
    var text = 'Check out this article: ' + title + ' from Game of Bones';
    if (platform === 'whatsapp') {
      window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank');
    } else if (platform === 'facebook') {
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
    } else if (platform === 'twitter') {
      window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(function () {
        alert('Article link copied to clipboard!');
      }).catch(function () {
        var temp = document.createElement('input');
        temp.value = url;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        alert('Article link copied to clipboard!');
      });
    }
  }

  function artNav(dir) {
    var next = currentArtIdx + dir;
    if (next >= 0 && next < articles.length) openArt(next);
  }

  window.openArt = openArt;
  window.closeArt = closeArt;
  window.shareArticle = shareArticle;
  window.artNav = artNav;
  window._openArtReal = openArt;
}());
