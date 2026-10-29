// Écrans et fenêtres : titre, coffret des commandes, réglages, crédits, notice (indices), carte de livraison.
import { t, tr, getLangue } from './i18n.js';
import { parse, lettre } from '../core/formula.js';
import { jouer, contexte } from '../core/levels.js';
import { svgObjet } from './objet/rendu.js';
import { figurine } from './assets.js';

export function h(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}
export const etoilesHtml = (n, max = 3) => `<span class="etoiles-groupe" role="img" aria-label="${t('etoiles.aria', { n, max })}">${Array.from({ length: max }, (_, i) => `<span class="etoile${i < n ? '' : ' vide'}" aria-hidden="true">★</span>`).join('')}</span>`;
const boutonSon = (app) => `<button class="icone son${app.reglages().muet ? ' coupe' : ''}" data-a="son" title="${app.reglages().muet ? t('bandeau.sonCoupe') : t('bandeau.son')}" aria-label="${app.reglages().muet ? t('bandeau.sonCoupe') : t('bandeau.son')}" aria-pressed="${!!app.reglages().muet}">${app.reglages().muet ? '🔇' : '🔊'}</button>`;
const objet = (app, f, u = 12, fini = 'verni') => svgObjet({ f, u, fini, sens: app.reglages().sens });

// ---------------------------------------------------------------- titre
export function ecranTitre(app) {
  app.couleursChapitre();
  const deja = Object.values(app.sauvegarde().niveaux).some((n) => n.gagne || (n.journal && n.journal.length));
  // Quelques objets de l'atelier posés sur l'établi, autour de l'enseigne.
  const deco = [
    ['(R -> S) -> ((R v T) -> (S v T))', 6, 16, -4], ['(R v R) -> R', 74, 12, 3], ['R -> (R v S)', 8, 70, 2],
    ['(R v S) -> (S v R)', 70, 74, -3], ['(S -> T) -> ((R -> S) -> (R -> T))', 58, 42, 5],
  ].map(([s, x, y, r]) => `<div class="deco-objet" aria-hidden="true" style="left:${x}%;top:${y}%;transform:rotate(${r}deg)">${objet(app, parse(s), 16)}</div>`).join('');
  const el = h(`<div class="ecran-titre"><div class="deco">${deco}</div>
    <div class="enseigne">
      <div class="tampon">${t('titre.tampon').replace('\n', '<br>')}</div>
      <h1>${t('jeu.titre')}</h1>
      <p class="sous">${t('jeu.sous')}</p>
      <div class="objet-titre">${objet(app, parse('(R -> S) -> ((R v T) -> (S v T))'), 24)}</div>
      <div class="actions">
        <button class="btn grand" data-a="jouer">${deja ? t('titre.continuer') : t('titre.jouer')}</button>
        <button class="btn grand secondaire" data-a="reglages">${t('titre.reglages')}</button>
      </div>
      <div class="pied"><button data-a="langue">${getLangue() === 'fr' ? 'English' : 'Français'}</button><button data-a="credits">${t('titre.credits')}</button>${boutonSon(app)}</div>
    </div></div>`);
  // Les pièces de l'objet du titre arrivent une à une.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) el.querySelectorAll('.objet-titre .piece, .objet-titre .fleche, .objet-titre .losange').forEach((p, i) => {
    p.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 300 + i * 110, fill: 'backwards', easing: 'cubic-bezier(.3,1.5,.5,1)' });
  });
  el.addEventListener('click', (e) => {
    app.deverrouillerSon();
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'jouer') app.allerCarte();
    else if (a === 'reglages') app.ouvrirReglages();
    else if (a === 'credits') app.ouvrirCredits();
    else if (a === 'langue') app.changerLangue(getLangue() === 'fr' ? 'en' : 'fr');
    else if (a === 'son') { app.basculerSon(); app.allerTitre(); }
  });
  return el;
}

// ---------------------------------------------------------------- le coffret des commandes
export function ecranCarte(app) {
  const chap = app.chap();
  app.couleursChapitre();
  const sv = app.sauvegarde();
  const total = chap.niveaux.reduce((s, n) => s + (sv.niveaux[n.id]?.etoiles || 0), 0);
  const ecrin = (n) => {
    const s = sv.niveaux[n.id] || {};
    const ouvert = app.estOuvert(n);
    const record = s.meilleur != null && Number.isFinite(+s.meilleur) ? t('carte.record', { n: +s.meilleur }) : '';

    const par = n.par != null ? t('carte.par', { n: n.par }) : t('carte.ouvert');
    const client = n.atelier?.client ? tr(n.atelier.client) : tr(n.titre);
    return `<button class="ecrin-tuile${n.defi ? ' defi' : ''}${s.gagne ? ' livre' : ''}" data-niveau="${n.id}" ${ouvert ? '' : `aria-disabled="true" data-verrou="1" title="${t('carte.verrou')}"`} aria-label="${t('carte.aria', { n: n.numero, client, etat: [ouvert ? '' : t('carte.verrou'), t('etoiles.aria', { n: s.etoiles || 0, max: n.par == null ? 1 : 3 }), record].filter(Boolean).join('. ') })}">
      <span class="medaille">${n.numero}</span>${ouvert ? '' : '<span class="cadenas">🔒</span>'}
      <div class="client">${client}</div>
      <div class="empreinte" aria-hidden="true">${objet(app, n.cibleF, 12, s.gagne ? 'verni' : 'velours')}</div>
      <div class="etoiles">${etoilesHtml(s.etoiles || 0, n.par == null ? 1 : 3)}</div>
      <div class="record">${[par, record].filter(Boolean).join(' · ')}</div></button>`;
  };
  const init = chap.niveaux.filter((n) => n.id.startsWith('i'));
  const chaine = chap.niveaux.filter((n) => !n.id.startsWith('i') && !n.defi);
  const defis = chap.niveaux.filter((n) => n.defi);
  const automates = [];
  for (const n of chap.niveaux) {
    if (!sv.niveaux[n.id]?.gagne || !n.debloque?.theoreme) continue;
    const T = chap.theoremes[n.debloque.theoreme];
    const fig = figurine(n.debloque.theoreme);
    const nom = `<div class="nom">${tr(T.surnom) || tr(T.nom)}</div>`;
    automates.push(`<div class="vitrine-objet">${fig ? `<div class="vitrine-tete">${fig}${nom}</div>` : nom}${objet(app, T.f, 8)}</div>`);
  }
  const el = h(`<div class="ecran-carte">
    <div class="barre-carte"><button class="icone" data-a="titre" title="${t('carte.retour')}" aria-label="${t('carte.retour')}">◂</button>
      <h2>${t('carte.titre')}</h2><span class="total" role="img" aria-label="${t('carte.totalAria', { n: total })}">${total} ★</span>
      ${boutonSon(app)}<button class="icone" data-a="reglages" title="${t('bandeau.reglages')}" aria-label="${t('bandeau.reglages')}">⚙</button></div>
    <div class="carte-defile"><div class="coffret">
      <div class="coffret-section">${t('carte.initiation')}</div><div class="coffret-grille">${init.map(ecrin).join('')}</div>
      <div class="coffret-section">${t('carte.chaine')}</div><div class="coffret-grille">${chaine.map(ecrin).join('')}</div>
      <div class="coffret-section">${t('carte.defis')}</div><div class="coffret-grille">${defis.map(ecrin).join('')}</div>
      <div class="coffret-section">${t('carte.vitrine')}</div>
      <div class="vitrine">${automates.join('') || `<span class="vide">${t('carte.vitrineVide')}</span>`}</div>
      <p class="tout"><button data-a="tout">${t('carte.toutOuvrir')}</button></p>
    </div></div></div>`);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-niveau]');
    if (b && !b.dataset.verrou) return app.ouvrirNiveau(b.dataset.niveau);
    if (b) return;
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'son') { app.basculerSon(); return app.allerCarte(); }
    if (a === 'titre') app.allerTitre();
    if (a === 'reglages') app.ouvrirReglages();
    if (a === 'tout') app.toutOuvrir();
  });
  return el;
}

// ---------------------------------------------------------------- fenêtres
let numeroFenetre = 0;
export function fenetre(contenu, { onFermer, large } = {}) {
  const avant = document.activeElement;
  const voile = h(`<div class="voile"><div class="fenetre" role="dialog" aria-modal="true"${large ? ' style="width:min(980px,calc(100vw - 32px))"' : ''}><button class="fermer-f" aria-label="${t('commun.fermer')}" title="${t('commun.fermer')}">×</button></div></div>`);
  const f = voile.querySelector('.fenetre');
  if (typeof contenu === 'string') f.insertAdjacentHTML('beforeend', contenu); else f.appendChild(contenu);
  const titre = f.querySelector('h2');
  if (titre) { titre.id = 'fenetre-titre-' + ++numeroFenetre; f.setAttribute('aria-labelledby', titre.id); }
  const app = document.getElementById('app');
  const focalisables = () => [...f.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled && x.offsetParent !== null);
  const fermer = () => {
    voile.remove(); document.removeEventListener('keydown', clavier, true);
    if (app) app.inert = false;
    const retour = avant && avant.isConnected ? avant : (avant?.dataset?.a ? document.querySelector(`[data-a="${avant.dataset.a}"]`) : null);
    if (retour) retour.focus({ preventScroll: true });
    onFermer && onFermer();
  };
  // Échap ferme ; Tab reste dans la fenêtre.
  const clavier = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); fermer(); return; }
    if (e.key === 'Tab') {
      const fs = focalisables();
      if (!fs.length) return;
      const i = fs.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); fs[fs.length - 1].focus(); }
      else if (!e.shiftKey && i === fs.length - 1) { e.preventDefault(); fs[0].focus(); }
    }
  };
  document.addEventListener('keydown', clavier, true);
  voile.addEventListener('mousedown', (e) => { if (e.target === voile) fermer(); });
  f.querySelector('.fermer-f').addEventListener('click', fermer);
  document.body.appendChild(voile);
  if (app) app.inert = true;
  (focalisables().find((x) => !x.classList.contains('fermer-f')) || f.querySelector('.fermer-f')).focus({ preventScroll: true });
  return { el: f, fermer };
}

export function fenetreReglages(app) {
  const r = app.reglages();
  const valeur = (cle) => (cle === 'muet' ? (r.muet ? '1' : '0') : String(r[cle]));
  const seg = (cle, options, nom) => `<span class="seg" data-cle="${cle}" role="group" aria-label="${nom}">${options.map(([v, l]) => `<button data-v="${v}" class="${valeur(cle) === String(v) ? 'on' : ''}" aria-pressed="${valeur(cle) === String(v)}">${l}</button>`).join('')}</span>`;
  const curseur = (cle, nom, valeur, min = 0, max = 100, pas = 1) => `<input type="range" min="${min}" max="${max}" step="${pas}" value="${valeur}" data-cle="${cle}" aria-label="${nom}">`;
  const html = `<h2>${t('reg.titre')}</h2>
    <div class="rangee"><label>${t('reg.langue')}</label>${seg('langue', [['fr', 'Français'], ['en', 'English']], t('reg.langue'))}</div>
    <div class="rangee"><label>${t('reg.theme')}</label>${seg('theme', [['clair', t('reg.clair')], ['sombre', t('reg.sombre')], ['auto', t('reg.auto')]], t('reg.theme'))}</div>
    <div class="rangee"><label>${t('reg.sens')}</label>${seg('sens', [['cours', t('reg.sensCours')], ['lecture', t('reg.sensLecture')]], t('reg.sens'))}</div>
    <div class="rangee"><label>${t('reg.daltonien')}</label>${seg('daltonien', [['0', t('reg.non')], ['1', t('reg.oui')]], t('reg.daltonien'))}</div>
    <div class="rangee"><label>${t('reg.vitesse')}</label>${seg('vitesse', [['1', '×1'], ['2', '×2'], ['instant', t('reg.instant')]], t('reg.vitesse'))}</div>
    <div class="rangee"><label>${t('reg.texte')} <b data-sortie="texte">${r.texte}%</b></label>${curseur('texte', t('reg.texte'), r.texte, 80, 150, 5)}</div>
    <h3>${t('son.on')}</h3>
    <div class="rangee"><label>${t('reg.son')}</label>${seg('muet', [['0', t('reg.sonOui')], ['1', t('reg.sonNon')]], t('reg.son'))}</div>
    <div class="rangee"><label>${t('reg.volume')}</label>${curseur('volume', t('reg.volume'), Math.round(r.volume * 100))}</div>
    <div class="rangee"><label>${t('reg.musique')}</label>${curseur('musique', t('reg.musique'), Math.round(r.musique * 100))}</div>
    <div class="rangee"><label>${t('reg.bruitages')}</label>${curseur('bruitages', t('reg.bruitages'), Math.round(r.bruitages * 100))}</div>
    <h3>${t('reg.sauvegarde')}</h3>
    <div class="rangee"><button class="btn secondaire" data-a="exporter">${t('reg.exporter')}</button><button class="btn secondaire" data-a="importer">${t('reg.importer')}</button><button class="btn secondaire danger" data-a="effacer">${t('reg.effacer')}</button><input type="file" accept="application/json,.json" class="cache"></div>
    <h3>${t('reg.clavier')}</h3><p class="aide-clavier">${t('reg.clavierAide')}</p>`;
  const f = fenetre(html);
  f.el.addEventListener('click', (e) => {
    const b = e.target.closest('.seg button');
    if (b) {
      const cle = b.parentElement.dataset.cle;
      app.changerReglage(cle, b.dataset.v);
      b.parentElement.querySelectorAll('button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      if (cle === 'langue') { f.fermer(); app.ouvrirReglages(); }
      return;
    }
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'exporter') app.exporter();
    if (a === 'importer') f.el.querySelector('input[type=file]').click();
    if (a === 'effacer' && confirm(t('reg.effacerConfirmer'))) { app.effacer(); f.fermer(); }
  });
  f.el.addEventListener('input', (e) => {
    const cle = e.target.dataset.cle;
    if (!cle) return;
    const v = +e.target.value;
    if (cle === 'texte') { app.changerReglage('texte', v); f.el.querySelector('[data-sortie="texte"]').textContent = v + '%'; }
    else app.changerReglage(cle, v / 100);
  });
  f.el.querySelector('input[type=file]').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) { f.fermer(); app.importer(await file.text()); }
  });
  return f;
}

export function fenetreCredits() {
  return fenetre(`<h2>${t('cred.titre')}</h2><p>${t('cred.texte')}</p><p>${t('cred.code')}<br>${t('cred.musique')}<br>${t('cred.images')}<br>${t('cred.polices')}</p>`);
}

/** La notice d'Hortense : les gestes de la solution du cours, un de plus à chaque clic. */
export function fenetreIndice(app, niveau, deja) {
  const ref = niveau.reference;
  if (!ref) return fenetre(`<h2>${t('indice.titre')}</h2><p>${t('indice.aucun')}</p>`);
  let n = Math.max(1, deja);
  let objets = [];
  try { objets = jouer(app.chap(), niveau, ref, contexte(app.chap(), niveau)).feuille.lignes.map((l) => l.f); } catch { objets = []; }
  const f = fenetre(`<h2>${t('indice.titre')}</h2><div class="liste-indices"></div><div class="rangee" style="justify-content:flex-end"><button class="btn" data-a="plus">${t('indice.plus')}</button></div>`);
  const liste = f.el.querySelector('.liste-indices');
  const rendre = () => {
    liste.innerHTML = ref.slice(0, n).map((pas, k) => `<div class="indice"><b>${t('indice.geste', { n: k + 1 })}</b> ${decrirePas(pas, niveau, app, objets)}</div>`).join('');
    f.el.querySelector('[data-a="plus"]').disabled = n >= ref.length;
    app.noterIndice(niveau.id, n);
  };
  f.el.querySelector('[data-a="plus"]').addEventListener('click', () => { n++; rendre(); });
  rendre();
  return f;
}

function decrirePas(pas, niveau, app, objets = []) {
  const chap = app.chap();
  const NUM = { AL1: '①', AL2: '②', AL3: '③', AL4: '④' };
  const lab = (r) => (typeof r === 'number' ? `${t('indice.objetN', { n: r })}${objets[r - 1] != null ? ` <span class="reglage">${objet(app, objets[r - 1], 9)}</span>` : ''}` : r === 'P1' ? t('etagere.fourniture') : NUM[r] ? `${NUM[r]} ${t('moule.' + r)}` : tr(chap.theoremes[r]?.surnom) || r);
  const o = { noms: niveau.noms };
  const sig = (m) => Object.entries(m || {}).map(([k, v]) => `<span class="reglage" aria-label="${k} → ${v}">${objet(app, lettre(k), 10)} → ${objet(app, parse(v, o), 10)}</span>`).join(' ');
  if (pas.substituer !== undefined) return `${t('indice.echangeur', { de: lab(pas.substituer) })} ${sig(pas.sigma)}`;
  if (pas.copier !== undefined) return t('indice.dupliquer', { de: lab(pas.copier) });
  if (pas.mp !== undefined) return t('indice.cle', { cle: lab(pas.mp[0]), serrure: lab(pas.mp[1]) });
  if (pas.boite !== undefined) return `${t('indice.automate', { nom: tr(chap.theoremes[pas.boite].surnom) || tr(chap.theoremes[pas.boite].boite) })} ${pas.entrees.map(lab).join(', ')} ${pas.molettes ? sig(pas.molettes) : ''}`;
  if (pas.regle !== undefined) return t('etiquette', { a: tr(chap.regles[pas.regle].surnom) || tr(chap.regles[pas.regle].nom), b: pas.entrees.map(lab).join(', ') });
  return '';
}

// ---------------------------------------------------------------- carte de livraison
export function carteFin(app, { titre, enonce, etoiles, max, n, par, depliee, debloque, record, troisAide, vrai }) {
  return h(`<div class="fin"><div class="fin-carte" role="dialog" aria-modal="true" aria-label="${titre}" tabindex="-1">
    <div class="tampon-livre">${t('fin.tampon')}</div>
    <h2>${titre}</h2><div class="enonce">${enonce}</div>
    ${vrai ? `<div class="vrai-nom">${t('fin.vraiNom', { nom: vrai })}</div>` : ''}
    <div class="grosses-etoiles" role="img" aria-label="${t('etoiles.aria', { n: etoiles, max })}">${Array.from({ length: max }, (_, i) => `<span class="etoile${i < etoiles ? '' : ' vide'}" aria-hidden="true">★</span>`).join('')}</div>
    <div class="stats"><div class="stat"><b>${n}</b><span>${t('fin.objets')}</span></div><div class="stat"><b>${par ?? '—'}</b><span>${t('fin.par')}</span></div><div class="stat"><b class="v-depliee">${depliee ?? '…'}</b><span>${t('fin.depliee')}</span></div></div>
    <div class="verif">${t('fin.verifEnCours')}</div>
    ${debloque ? `<div class="debloque">${debloque}</div>` : ''}
    ${record ? `<div class="debloque record">${record}</div>` : ''}
    ${troisAide ? `<div class="debloque aide">${troisAide}</div>` : ''}
    <div class="actions"><button class="btn" data-a="suivant">${t('fin.suivant')}</button><button class="btn secondaire" data-a="recommencer">${t('fin.recommencer')}</button><button class="btn secondaire" data-a="rester">${t('fin.rester')}</button><button class="btn secondaire" data-a="carte">${t('fin.carte')}</button></div>
  </div></div>`);
}
