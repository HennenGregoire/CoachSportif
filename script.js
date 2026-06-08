const $ = (id) => document.getElementById(id);

async function loadJSON(path) {
  const response = await fetch(path + '?v=' + Date.now());
  if (!response.ok) throw new Error(`Impossible de charger ${path}`);
  return response.json();
}

function youtubeEmbedUrl(urlOrId) {
  if (!urlOrId) return '';
  const value = urlOrId.trim();
  if (!value.includes('http')) return `https://www.youtube.com/embed/${value}`;
  try {
    const url = new URL(value);
    if (url.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    const id = url.searchParams.get('v');
    if (id) return `https://www.youtube.com/embed/${id}`;
    if (url.pathname.includes('/shorts/')) return `https://www.youtube.com/embed/${url.pathname.split('/shorts/')[1].split('/')[0]}`;
    if (url.pathname.includes('/embed/')) return value;
  } catch (e) {}
  return value;
}

function renderSite(site) {
  document.title = site.nom_du_site || 'Coach Sportif';
  $('site-logo').textContent = site.nom_du_site || 'Coach Sportif';
  $('hero-subtitle').textContent = site.sous_titre || '';
  $('hero-title').textContent = site.titre_accueil || '';
  $('hero-text').textContent = site.texte_accueil || '';
  $('about-title').textContent = site.titre_a_propos || '';
  $('about-text').textContent = site.texte_a_propos || '';
  $('about-image').src = site.photo_a_propos || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80';
  $('contact-text').textContent = site.texte_contact || '';
  $('contact-email').textContent = site.email || '';
  $('contact-email').href = `mailto:${site.email || ''}`;
  $('contact-phone').textContent = site.telephone || '';
  $('contact-phone').href = `tel:${(site.telephone || '').replaceAll(' ', '')}`;
  $('contact-instagram').textContent = site.instagram || '';
  $('contact-instagram').href = site.instagram_url || '#';
  $('footer-text').textContent = `© ${new Date().getFullYear()} ${site.nom_du_site || 'Coach Sportif'}`;
}

function renderServices(services) {
  $('services-list').innerHTML = services.map(service => `
    <article class="card">
      <h3>${service.titre || ''}</h3>
      <p>${service.description || ''}</p>
    </article>
  `).join('');
}

function renderVideos(videos) {
  $('videos-list').innerHTML = videos.map(video => `
    <article class="card video">
      <iframe src="${youtubeEmbedUrl(video.lien_youtube)}" title="${video.titre || 'Vidéo'}" allowfullscreen></iframe>
      <h3>${video.titre || ''}</h3>
      <p>${video.description || ''}</p>
    </article>
  `).join('');
}

function renderArticles(articles) {
  $('articles-list').innerHTML = articles.map(article => `
    <article class="card">
      ${article.image ? `<img src="${article.image}" alt="${article.titre || 'Article'}">` : ''}
      <h3>${article.titre || ''}</h3>
      <p>${article.texte || ''}</p>
    </article>
  `).join('');
}

function renderGallery(images) {
  $('gallery-list').innerHTML = images.map(item => `
    <img src="${item.image}" alt="${item.alt || 'Photo'}">
  `).join('');
}

async function init() {
  try {
    const [site, services, videos, articles, gallery] = await Promise.all([
      loadJSON('content/site.json'),
      loadJSON('content/services.json'),
      loadJSON('content/videos.json'),
      loadJSON('content/articles.json'),
      loadJSON('content/galerie.json')
    ]);
    renderSite(site);
    renderServices(services);
    renderVideos(videos);
    renderArticles(articles);
    renderGallery(gallery);
  } catch (error) {
    console.error(error);
  }
}

init();
