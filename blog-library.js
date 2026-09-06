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

  const readSaved = () => { try { return new Set(JSON.parse(localStorage.getItem('gob-saved-articles') || '[]')); } catch { return new Set(); } };
  const state = { articles: fallback, category: 'All', query: '', shown: 9, current: null, saved: readSaved() };
  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  const readingTime = value => `${Math.max(1, Number(value) || 3)} min read`;
  const articleUrl = slug => `${journalUrl}?blog=${encodeURIComponent(slug)}`;
  const productId = item => item?.id || String(item?.n || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const productRecommendations = {
    'treats-for-aggressive-chewers': ['chicken-feet', 'chicken-neck', 'chicken-bones'],
    'best-treats-for-training': ['jerky', 'chicken-bites', 'buff-jerky'],
    '7-day-transition-plan': ['jerky', 'chicken-bites', 'anchovies'],
    'new-dog-parent-guide': ['jerky', 'chicken-feet', 'anchovies'],
    'natural-treats-clean-teeth': ['chicken-feet', 'chicken-neck', 'chicken-bones'],
    'fish-treats-underrated': ['anchovies', 'mackerel-fillet', 'sardines'],
    'buffalo-vs-chicken-jerky': ['jerky', 'buff-jerky', 'chicken-bites'],
    'how-to-read-dog-food-labels': ['jerky', 'buff-jerky', 'mackerel-fillet'],
    'what-are-fillers': ['jerky', 'buff-jerky', 'anchovies'],
    'preservatives-explained': ['jerky', 'buff-jerky', 'mackerel-fillet'],
  };
  const dateLabel = value => {
    const date = new Date(value || '');
    return Number.isNaN(date.valueOf()) ? '' : date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };
  const results = () => {
    const term = state.query.trim().toLowerCase();
    return state.articles.filter(article => {
      const categoryMatch = state.category === 'All' || article.category === state.category;
      const searchable = [article.title, article.category, article.excerpt, ...(article.tags || [])].join(' ').toLowerCase();
      return categoryMatch && (!term || searchable.includes(term));
    });
  };
  const saveState = () => { try { localStorage.setItem('gob-saved-articles', JSON.stringify([...state.saved])); } catch {} };

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

  function renderFeature() {
    const article = state.articles[0];
    if (!article) return;
    const image = article.cover_image
      ? `<img src="${escapeHtml(article.cover_image)}" alt="${escapeHtml(article.title)}">`
      : '<span class="journal-placeholder" aria-hidden="true">🐾</span>';
    $('#journal-feature').innerHTML = `
      <div class="journal-feature-copy">
        <p class="eyebrow">Featured field note · ${escapeHtml(article.category || 'Guide')}</p>
        <h3 id="journal-feature-title">${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.excerpt || 'A practical guide for thoughtful dog parents.')}</p>
        <button class="button" type="button" data-open-feature="${escapeHtml(article.slug)}">Read the guide <span aria-hidden="true">→</span></button>
      </div>
      <div class="journal-feature-image">${image}<span class="journal-feature-stamp">${escapeHtml(readingTime(article.read_time))}<br>field guide</span></div>`;
    $('[data-open-feature]').addEventListener('click', () => openArticle(article.slug, true));
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
    const matching = results();
    const shown = matching.slice(0, state.shown);
    $('#journal-grid').innerHTML = shown.length ? shown.map((article, index) => card(article).replace('class="post journal-post"', `class="post journal-post" style="--journal-index:${index}"`)).join('') : '<p class="journal-empty">No articles match that search. Try a shorter word or browse a topic.</p>';
    $('#journal-count').textContent = `${matching.length} article${matching.length === 1 ? '' : 's'} for dog parents`;
    const more = $('#journal-load-more');
    more.hidden = shown.length >= matching.length;
    $('#journal-grid').querySelectorAll('[data-open-article]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();
      openArticle(link.dataset.openArticle || '', true);
    }));
  }

  function renderRecommendations(article) {
    const section = $('#journal-recommendations');
    const ids = productRecommendations[article?.slug];
    const catalog = Array.isArray(window.GOB_LIVE_CATALOG) ? window.GOB_LIVE_CATALOG : [];
    const products = (ids || []).map(id => catalog.find(item => productId(item) === id)).filter(Boolean);
    if (!products.length) {
      section.hidden = true;
      section.innerHTML = '';
      return;
    }
    section.hidden = false;
    section.innerHTML = `
      <div class="journal-recommendations-heading">
        <div><p class="eyebrow">Picked for this guide</p><h2 id="journal-recommendations-title">Continue with a treat your dog can get excited about.</h2></div>
        <a class="text-link" href="products.html">Shop all treats</a>
      </div>
      <div class="journal-product-grid">
        ${products.map(product => {
          const id = productId(product);
          const image = product.image || product.i || product.images?.[0] || '';
          const price = Number(product.p || product.price || 0);
          return `<article class="journal-product-card">
            <a href="product.html?catalog=${encodeURIComponent(id)}" class="journal-product-image">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(product.n)}" loading="lazy">` : '<span aria-hidden="true">🐾</span>'}</a>
            <div class="journal-product-copy"><p>${escapeHtml(product.cat || product.c || 'Natural dog treat')}</p><h3><a href="product.html?catalog=${encodeURIComponent(id)}">${escapeHtml(product.n)}</a></h3><strong>${price ? `₹${price.toLocaleString('en-IN')}` : 'View product'}</strong></div>
            <button class="journal-product-add" type="button" data-recommend-add="${escapeHtml(id)}" aria-label="Add ${escapeHtml(product.n)} to treat jar">Add to jar <span aria-hidden="true">+</span></button>
          </article>`;
        }).join('')}
      </div>`;
    section.querySelectorAll('[data-recommend-add]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.recommendAdd;
      if (typeof window.addToCart === 'function') window.addToCart(id);
      else window.location.href = `product.html?catalog=${encodeURIComponent(id)}`;
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
    renderRecommendations(article);
    const save = $('#journal-save');
    const isSaved = state.saved.has(article.slug);
    save.classList.toggle('saved', isSaved);
    save.textContent = isSaved ? '★ Saved to your list' : '☆ Save article';
    const next = state.articles.find(entry => entry.slug !== article.slug);
    $('#journal-next').innerHTML = next ? `<div><p>Continue exploring</p><h2>${escapeHtml(next.title)}</h2></div><button type="button" data-next="${escapeHtml(next.slug)}">Next guide →</button>` : '';
    $('#journal-next [data-next]')?.addEventListener('click', () => openArticle(next.slug, true));
    $('#journal-index').hidden = true;
    reader.hidden = false;
    updateHead(article);
    if (updateUrl) history.pushState({ blog: article.slug }, '', `?blog=${encodeURIComponent(article.slug)}`);
    window.scrollTo(0, 0);
  }

  function closeArticle(updateUrl) {
    state.current = null;
    $('#journal-reader').hidden = true;
    $('#journal-recommendations').hidden = true;
    $('#journal-recommendations').innerHTML = '';
    $('#journal-index').hidden = false;
    updateHead(null);
    if (updateUrl) history.pushState({}, '', 'blog.html');
    window.scrollTo(0, 0);
  }

  async function loadJournal() {
    try {
      const response = await window.GOB_API?.blogs?.();
      if (Array.isArray(response?.blogs) && response.blogs.length) state.articles = response.blogs;
    } catch (error) {
      console.warn('Showing saved journal previews until the live articles are available.', error);
    }
    renderFilters();
    renderFeature();
    renderGrid();
    const slug = new URLSearchParams(window.location.search).get('blog');
    if (slug) openArticle(slug, false);
    else updateHead(null);
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('#journal-load-more').addEventListener('click', () => { state.shown += 9; renderGrid(); });
    $('#journal-back').addEventListener('click', () => closeArticle(true));
    $('#journal-search').addEventListener('input', event => {
      state.query = event.target.value || '';
      state.shown = 9;
      $('#journal-clear').hidden = !state.query;
      renderGrid();
    });
    $('#journal-clear').addEventListener('click', () => {
      state.query = '';
      $('#journal-search').value = '';
      $('#journal-clear').hidden = true;
      renderGrid();
      $('#journal-search').focus();
    });
    $('#journal-save').addEventListener('click', () => {
      if (!state.current) return;
      if (state.saved.has(state.current.slug)) state.saved.delete(state.current.slug);
      else state.saved.add(state.current.slug);
      saveState();
      openArticle(state.current.slug, false);
    });
    window.addEventListener('popstate', () => {
      const slug = new URLSearchParams(window.location.search).get('blog');
      if (slug) openArticle(slug, false);
      else closeArticle(false);
    });
    document.addEventListener('gob:catalog-sync', () => {
      if (state.current) renderRecommendations(state.current);
    });
    loadJournal();
  });
})();
