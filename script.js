const files = {
  site: 'content/site.json',
  categories: 'content/categories.json',
  exercices: 'content/exercices.json',
  ressources: 'content/ressources.json'
};
let allExercises = [];
let categories = [];

async function loadJson(path) {
  const res = await fetch(path + '?v=' + Date.now());
  if (!res.ok) throw new Error('Impossible de charger ' + path);
  return res.json();
}

function youtubeId(url) {
  if (!url) return '';
  const patterns = [/youtu\.be\/([^?&]+)/, /v=([^?&]+)/, /embed\/([^?&]+)/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return url;
}

function list(items) {
  return `<ul>${(items || []).map(item => `<li>${item}</li>`).join('')}</ul>`;
}

function renderSite(site) {
  document.title = site.nom_site || 'Analyse du mouvement';
  document.querySelector('.brand').textContent = site.nom_site;
  document.getElementById('nom-site').textContent = site.nom_site;
  document.getElementById('professeur').textContent = site.professeur || '';
  document.getElementById('accroche').textContent = site.accroche || '';
  document.getElementById('bouton-principal').textContent = site.bouton_principal || 'Voir les exercices';
  document.getElementById('intro-exercices').textContent = site.intro_exercices || '';
  document.getElementById('message-prof').textContent = site.message_prof || '';
  document.getElementById('footer-contact').innerHTML = site.email ? `Contact : <a href="mailto:${site.email}">${site.email}</a>` : '';
  document.getElementById('analyse-eyebrow').textContent = site.analyse_eyebrow || 'Analyse vidéo';
document.getElementById('analyse-titre').textContent = site.analyse_titre || 'Comment utiliser une fiche exercice';
renderAnalyseSteps(site.analyse_etapes || []);
}
function renderAnalyseSteps(steps) {
  const box = document.getElementById('analyse-steps');

  box.innerHTML = steps.map((step, i) => `
    <article>
      <strong>${step.numero || i + 1}</strong>
      <h3>${step.titre || ''}</h3>
      <p>${step.texte || ''}</p>
    </article>
  `).join('');
}

function renderFilters() {
  const box = document.getElementById('category-filters');
  box.innerHTML = `<button class="filter active" data-cat="all">Tout</button>` +
    categories.map(c => `<button class="filter" data-cat="${c.slug}">${c.icone || ''} ${c.nom}</button>`).join('');
  box.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    box.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderExercises(btn.dataset.cat);
  }));
}

function categoryName(slug) {
  const cat = categories.find(c => c.slug === slug);
  return cat ? cat.nom : slug;
}

function renderExercises(filter = 'all') {
  const grid = document.getElementById('exercise-grid');
  const data = filter === 'all' ? allExercises : allExercises.filter(e => e.categorie === filter);
  grid.innerHTML = data.map((e, index) => `
    <article class="card">
      <span class="tag">${categoryName(e.categorie)} • ${e.niveau || ''}</span>
      <h3>${e.titre}</h3>
      <p>${e.objectif || ''}</p>
      <button data-index="${allExercises.indexOf(e)}">Ouvrir l'analyse</button>
    </article>
  `).join('');
  grid.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => openExercise(Number(btn.dataset.index))));
}

function openExercise(index) {
  const e = allExercises[index];
  const id1 = youtubeId(e.video_correcte);
  const id2 = youtubeId(e.video_erreur);
  document.getElementById('modal-content').innerHTML = `
    <p class="eyebrow">${categoryName(e.categorie)} • ${e.niveau || ''}</p>
    <h2>${e.titre}</h2>
    <p>${e.objectif || ''}</p>
    ${id1 ? `<h3>Vidéo modèle</h3><div class="video-wrap"><iframe src="https://www.youtube.com/embed/${id1}" allowfullscreen></iframe></div>` : ''}
    ${id2 ? `<h3>Erreur à analyser</h3><div class="video-wrap"><iframe src="https://www.youtube.com/embed/${id2}" allowfullscreen></iframe></div>` : ''}
    <div class="columns">
      <div class="panel"><h4>Points clés</h4>${list(e.points_cles)}</div>
      <div class="panel"><h4>Erreurs fréquentes</h4>${list(e.erreurs_frequentes)}</div>
      <div class="panel"><h4>Corrections proposées</h4>${list(e.corrections)}</div>
    </div>
    <div class="panel" style="margin-top:18px"><h4>Consigne du professeur</h4><p>${e.consigne_prof || ''}</p></div>
  `;
  document.getElementById('modal').classList.add('show');
}

function renderResources(resources) {
  const box = document.getElementById('resources-list');
  box.innerHTML = resources.map(r => {
    const link = r.fichier || r.lien || '';
    return `<article class="resource"><div><strong>${r.titre}</strong><p>${r.type || ''} — ${r.description || ''}</p></div>${link ? `<a class="button" href="${link}" target="_blank">Ouvrir</a>` : ''}</article>`;
  }).join('');
}

document.getElementById('close-modal').addEventListener('click', () => document.getElementById('modal').classList.remove('show'));
document.getElementById('modal').addEventListener('click', e => { if (e.target.id === 'modal') e.currentTarget.classList.remove('show'); });

async function init() {
  const [site, cats, exercises, resources] = await Promise.all([
    loadJson(files.site), loadJson(files.categories), loadJson(files.exercices), loadJson(files.ressources)
  ]);
  categories = cats;
  allExercises = exercises;
  renderSite(site);
  renderFilters();
  renderExercises();
  renderResources(resources);
}
init().catch(err => document.body.innerHTML = `<main class="section"><h1>Erreur</h1><p>${err.message}</p></main>`);
