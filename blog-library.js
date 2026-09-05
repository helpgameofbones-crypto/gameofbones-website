/* Public journal renderer. Articles remain authored in the admin dashboard;
   this page adds accessible, crawlable structure and shareable article URLs. */
(() => {
  const journalUrl = 'https://gameofbones.in/blog.html';
  const fallback = [
    { slug: '7-day-transition-plan', category: 'Feeding Guide', title: 'The 7-Day Transition Plan for New Dog Treats', excerpt: 'A gradual, supervised routine for introducing a new treat without rushing your dog.', read_time: 4, body: '<p>Introduce one new treat at a time, begin with a small amount, and observe your dog. Fresh water and supervision should always be part of the routine.</p>' },
    { slug: 'hidden-truth-dog-treats', category: 'Ingredients', title: 'How to Read What Is Really in Your Dog’s Treat', excerpt: 'A practical guide to reading an ingredient label beyond the claims on the front of the pack.', read_time: 5, body: '<p>Start with the ingredient list. Clear, named ingredients and straightforward feeding guidance help you make a considered choice for your dog.</p>' },
    { slug: 'human-foods-dogs-can-eat', category: 'Nutrition', title: 'Human Foods Dogs Can Eat: A Careful Guide', excerpt: 'Everyday food questions, with a reminder to confirm material dietary changes with your veterinarian.', read_time: 5, body: '<p>Individual needs vary. Check with a veterinarian before making significant changes to your dog’s diet, especially for puppies, seniors or dogs with a health condition.</p>' },
    { slug: 'new-dog-parent-guide', category: 'New Dog Parent Guide', title: 'A New Dog Parent’s Guide to Treats', excerpt: 'How to choose an appropriate size, introduce treats thoughtfully and supervise every chew.', read_time: 4, body: '<p>Treats complement a complete diet. Choose the right size and texture for your dog, offer water, and supervise chews from start to finish.</p>' },
  ];

  const state = { articles: fallback, category: 'All', shown: 9, current: null };
  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  const readingTime = value => `${Math.max(1, Number(value) || 3)} min read`;
  const articleUrl = slug => `${journalUrl}?blog=${encodeURIComponent(slug)}`;
  const dateLabel = value => {
    const date = new Date(value || '');
    return Number.isNaN(date.valueOf()) ? '' : date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  function safeBody(input) {
    const allowed = new Set(['P', 'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'STRONG', 'EM', 'B', 'I', 'A', 'BLOCKQUOTE', 'BR']);
    const parsed = new DOMParser().parseFromString(String(input || ''), 'text/html');
    parsed.body.querySelectorAll('*').forEach(node => {
      if (!allowed.has(node.tagName)) {
        node.replaceWith(...node.childNodes);
        return;
      }
      [...node.attributes].forEach(attribute => {
        if (node.tagName === 'A' && attribute.name === 'href') {
          const href = attribute.value.trim();
          if (/^(https:\/\/|mailto:|\/|\.\/|#)/i.test(href)) return;
        }
        node.removeAttribute(attribute.name);
      });
      if (node.tagName === 'A') {
        node.setAttribute('rel', 'noopener noreferrer');
        if (/^https:\/\//i.test(node.getAttribute('href') || '')) node.setAttribute('target', '_blank');
      }
    });
    return parsed.body.innerHTML.trim();
  }

  function setMeta(selector, content) {
    const element = document.querySelector(selector);
    if (element) element.setAttribute('content', content);
  }

  function updateSchema(article) {
    const items = state.articles.map(entry => ({
      '@type': 'BlogPosting',
      headline: entry.title,
      url: articleUrl(entry.slug),
      description: entry.excerpt || '',
      image: entry.cover_image || undefined,
      datePublished: entry.created_at || undefined,
      author: { '@type': 'Organization', name: 'Game of Bones' },
      publisher: { '@type': 'Organization', name: 'Game of Bones' },
    }));
    const schema = article ? {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: articleUrl(article.slug),
      headline: article.title,
      description: article.excerpt || '',
      image: article.cover_image || undefined,
      datePublished: article.created_at || undefined,
      author: { '@type': 'Organization', name: 'Game of Bones' },
      publisher: { '@type': 'Organization', name: 'Game of Bones' },
      keywords: Array.isArray(article.tags) ? article.tags.join(', ') : undefined,
    } : {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Game of Bones Journal',
      description: 'Dog treat, nutrition and feeding guides for thoughtful pet parents in India.',
      url: journalUrl,
      mainEntity: { '@type': 'ItemList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, item })) },
    };
    $('#journal-schema').textContent = JSON.stringify(schema);
  }

  function updateHead(article) {
    const title = article ? `${article.title} | Game of Bones Journal` : 'Dog Treat, Nutrition & Feeding Guides | Game of Bones';
    const description = article?.excerpt || 'Practical dog treat, ingredient, nutrition and feeding guides for thoughtful pet parents in India.';
    const url = article ? articleUrl(article.slug) : journalUrl;
    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[property="og:image"]', article?.cover_image || 'https://gameofbones.in/assets/hero-real-dogs.png');
    const canonical = $('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', url);
    updateSchema(article);
  }

  function renderFilters() {
    const categories = ['All', ...new Set(state.articles.map(article => article.category || 'Guide'))];
    const holder = $('#journal-filters');
    holder.innerHTML = categories.map(category => `<button class="journal-filter${state.category === category ? ' active' : ''}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
    holder.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
      state.category = button.dataset.category || 'All';
      state.shown = 9;
      renderFilters();
      renderGrid();
    }));
  }

  function card(article) {
    const image = article.cover_image
      ? `<img src="${escapeHtml(article.cover_image)}" alt="${escapeHtml(article.title)}" loading="lazy">`
      : '<span class="journal-placeholder" aria-hidden="true">🐾</span>';
    const date = dateLabel(article.created_at);
    return `<article class="post journal-post">
      <a class="journal-card-link" href="?blog=${encodeURIComponent(article.slug)}" data-open-article="${escapeHtml(article.slug)}" aria-label="Read ${escapeHtml(article.title)}">
        <div class="journal-card-image">${image}</div>
        <div class="journal-card-copy">
          <p class="tag">${escapeHtml(article.category || 'Guide')}</p>
          <h2>${escapeHtml(article.title)}</h2>
          <p class="journal-excerpt">${escapeHtml(article.excerpt || 'Practical guidance for dog parents.')}</p>
          <p class="journal-meta">${[date, readingTime(article.read_time)].filter(Boolean).join(' · ')}</p>
          <span class="text-link">Read article</span>
        </div>
      </a>
    </article>`;
  }

  function renderGrid() {
    const matching = state.articles.filter(article => state.category === 'All' || article.category === state.category);
    const shown = matching.slice(0, state.shown);
    $('#journal-grid').innerHTML = shown.length ? shown.map(card).join('') : '<p class="journal-empty">No articles are available in this topic yet.</p>';
    $('#journal-count').textContent = `${matching.length} article${matching.length === 1 ? '' : 's'} for dog parents`;
    const more = $('#journal-load-more');
    more.hidden = shown.length >= matching.length;
    $('#journal-grid').querySelectorAll('[data-open-article]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();
      openArticle(link.dataset.openArticle || '', true);
    }));
  }

  function openArticle(slug, updateUrl) {
    const article = state.articles.find(entry => entry.slug === slug);
    if (!article) return;
    state.current = article;
    const reader = $('#journal-reader');
    $('#journal-reader-category').textContent = article.category || 'Guide';
    $('#journal-reader-title').textContent = article.title;
    $('#journal-reader-summary').textContent = article.excerpt || '';
    $('#journal-reader-meta').textContent = [dateLabel(article.created_at), readingTime(article.read_time)].filter(Boolean).join(' · ');
    const cover = $('#journal-reader-cover');
    cover.hidden = !article.cover_image;
    cover.src = article.cover_image || '';
    cover.alt = article.title;
    const tags = Array.isArray(article.tags) ? article.tags : [];
    $('#journal-reader-tags').innerHTML = tags.map(tag => `<span class="chip">${escapeHtml(tag)}</span>`).join('');
    $('#journal-reader-body').innerHTML = safeBody(article.body) || `<p>${escapeHtml(article.excerpt || '')}</p>`;
    $('#journal-index').hidden = true;
    reader.hidden = false;
    updateHead(article);
    if (updateUrl) history.pushState({ blog: article.slug }, '', `?blog=${encodeURIComponent(article.slug)}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function closeArticle(updateUrl) {
    state.current = null;
    $('#journal-reader').hidden = true;
    $('#journal-index').hidden = false;
    updateHead(null);
    if (updateUrl) history.pushState({}, '', 'blog.html');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  async function loadJournal() {
    try {
      const response = await window.GOB_API?.blogs?.();
      if (Array.isArray(response?.blogs) && response.blogs.length) state.articles = response.blogs;
    } catch (error) {
      console.warn('Showing saved journal previews until the live articles are available.', error);
    }
    renderFilters();
    renderGrid();
    const slug = new URLSearchParams(window.location.search).get('blog');
    if (slug) openArticle(slug, false);
    else updateHead(null);
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('#journal-load-more').addEventListener('click', () => { state.shown += 9; renderGrid(); });
    $('#journal-back').addEventListener('click', () => closeArticle(true));
    window.addEventListener('popstate', () => {
      const slug = new URLSearchParams(window.location.search).get('blog');
      if (slug) openArticle(slug, false);
      else closeArticle(false);
    });
    loadJournal();
  });
})();
