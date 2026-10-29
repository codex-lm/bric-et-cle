// Bric & Clé — application. L'interface appelle le noyau, jamais l'inverse :
// chaque geste devient un groupe d'événements du journal, et l'état se recalcule à partir du journal.
import { ascii, lettres as lettresDe } from '../core/formula.js';
import { preparerChapitre, contexte, niveauParId, definirPreuveJoueur, versSolution } from '../core/levels.js';
import { etatDepuis, appliquer, effectifs } from '../core/journal.js';
import { deplier, Plat } from '../core/verify.js';
import { eliminerSubstitution, enTexte, verifierGodement } from '../core/godement.js';
import { etoiles as calcEtoiles } from '../core/score.js';
import { t, tr, setLangue } from './i18n.js';
import { chargerManifeste, habiller } from './assets.js';
import * as audio from './audio.js';
import { definirCouleurs } from './formula-view.js';
import { fermerEditeur } from './editor.js';
import { h, ecranTitre, ecranCarte, fenetreReglages, fenetreCredits, fenetreIndice, carteFin } from './screens.js';
import { creerAtelier } from './atelier.js';
import { svgObjet } from './objet/rendu.js';

const CLE = 'bric-et-cle-v1';
const ANCIENNE_CLE = 'grande-feuille-v1';
const NOM_EXPORT = 'bric-et-cle-sauvegarde';
const REGLAGES_DEFAUT = { langue: 'en', theme: 'clair', daltonien: '0', vitesse: '1', texte: 100, volume: 0.8, musique: 0.5, bruitages: 0.85, sens: 'cours', notation: false, muet: false };

const S = {
  json: null, chap: null,
  sv: { v: 1, reglages: { ...REGLAGES_DEFAUT }, niveaux: {}, toutOuvert: false },
  ecran: null, niveau: null, env: null, journal: [], etat: null,
  enFin: false, passerFin: false, finPrevue: false,
};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = document.getElementById('app');
let ordreChapitre = [];
/** Les couleurs des pièces : R, S, T fixes, puis l'ordre d'apparition dans tout le chapitre (même lettre, même couleur partout). */
function couleursChapitre(plus = []) { definirCouleurs([...ordreChapitre, ...plus]); }

// ================================================================= sauvegarde et réglages
/** Une sauvegarde lisible jusqu'au bout, ou null : on ne remplace jamais l'état par une sauvegarde abîmée. */
function validerSauvegarde(s) {
  if (!s || typeof s !== 'object' || s.v !== 1) return null;
  if (!s.niveaux || typeof s.niveaux !== 'object' || Array.isArray(s.niveaux)) return null;
  const niveaux = {};
  for (const [id, n] of Object.entries(s.niveaux)) {
    if (!n || typeof n !== 'object' || Array.isArray(n)) continue;
    const m = { ...n };
    if (m.journal != null && !Array.isArray(m.journal)) delete m.journal;
    if (m.journal) m.journal = m.journal.filter((e) => e && typeof e === 'object' && typeof e.type === 'string');
    for (const k of ['meilleur', 'etoiles', 'indices']) if (m[k] != null && !Number.isFinite(+m[k])) delete m[k]; else if (m[k] != null) m[k] = +m[k];
    if (m.preuve != null && !Array.isArray(m.preuve)) delete m.preuve;
    if (m.vues != null && (typeof m.vues !== 'object' || Array.isArray(m.vues))) delete m.vues;
    niveaux[id] = m;
  }
  const r0 = s.reglages && typeof s.reglages === 'object' && !Array.isArray(s.reglages) ? s.reglages : {};
  const reglages = { ...REGLAGES_DEFAUT };
  const dans = (k, liste) => { if (liste.includes(r0[k])) reglages[k] = r0[k]; };
  const nombre = (k, min, max) => { const v = +r0[k]; if (r0[k] != null && Number.isFinite(v)) reglages[k] = Math.max(min, Math.min(max, v)); };
  dans('langue', ['fr', 'en']); dans('theme', ['clair', 'sombre', 'auto']); dans('daltonien', ['0', '1']); dans('vitesse', ['1', '2', 'instant']); dans('sens', ['cours', 'lecture']);
  nombre('volume', 0, 1); nombre('musique', 0, 1); nombre('bruitages', 0, 1); nombre('texte', 80, 150);
  if (typeof r0.notation === 'boolean') reglages.notation = r0.notation;
  if (typeof r0.muet === 'boolean') reglages.muet = r0.muet;
  return { v: 1, reglages, niveaux, toutOuvert: !!s.toutOuvert };
}
function charger() {
  try {
    // Les journaux de La Grande Feuille se rejouent tels quels : le noyau n'a pas changé.
    const s = validerSauvegarde(JSON.parse(localStorage.getItem(CLE) || localStorage.getItem(ANCIENNE_CLE) || 'null'));
    if (s) S.sv = s;
  } catch { /* sauvegarde illisible : on repart de zéro */ }
}
let minuteurSauver = null;
function sauver() {
  clearTimeout(minuteurSauver);
  minuteurSauver = setTimeout(() => { try { localStorage.setItem(CLE, JSON.stringify(S.sv)); } catch { /* quota */ } }, 150);
}
const sombreSysteme = matchMedia('(prefers-color-scheme: dark)');
function appliquerReglages() {
  const r = S.sv.reglages;
  setLangue(r.langue);
  const root = document.documentElement;
  // « Auto » se résout ici : les règles du soir n'ont alors qu'un seul sélecteur à connaître.
  root.dataset.theme = r.theme === 'auto' ? (sombreSysteme.matches ? 'sombre' : 'clair') : r.theme;
  root.dataset.daltonien = r.daltonien;
  root.dataset.vitesse = r.vitesse;
  root.style.setProperty('--echelle', r.texte / 100);
  audio.regler({ volume: r.muet ? 0 : r.volume, musique: r.musique, bruitages: r.bruitages });
}
sombreSysteme.addEventListener('change', () => { if (S.sv.reglages.theme === 'auto') appliquerReglages(); });
const mouvementsReduits = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const facteur = () => (S.passerFin ? 0 : 1) * (S.sv.reglages.vitesse === 'instant' ? 0 : S.sv.reglages.vitesse === '2' ? 0.5 : 1) * (mouvementsReduits() ? 0.3 : 1);
const attendre = (ms) => new Promise((r) => setTimeout(r, ms * facteur()));

/** Prochaine image ; repli par minuterie quand la page est en arrière-plan (rAF y est suspendu). */
function planifier(fn) {
  let fait = false;
  const une = () => { if (!fait) { fait = true; clearTimeout(minuteur); cancelAnimationFrame(raf); fn(); } };
  const raf = requestAnimationFrame(une);
  const minuteur = setTimeout(une, 60);
  return () => { fait = true; clearTimeout(minuteur); cancelAnimationFrame(raf); };
}

/** Les preuves gagnantes du joueur servent au dépliage des niveaux suivants. Une preuve illisible est ignorée. */
function enregistrerPreuves(chap = S.chap, niveaux = S.sv.niveaux) {
  for (const [id, n] of Object.entries(niveaux)) {
    if (!n || !n.preuve) continue;
    try { definirPreuveJoueur(chap, id, n.preuve); } catch (err) { console.warn('preuve ignorée', id, err); }
  }
}

// ================================================================= API pour les écrans
const API = {
  chap: () => S.chap,
  sauvegarde: () => S.sv,
  reglages: () => S.sv.reglages,
  deverrouillerSon: () => { audio.deverrouiller(); },
  allerCarte, allerTitre, ouvrirNiveau,
  ouvrirReglages: () => { if (!$('.voile')) fenetreReglages(API); },
  ouvrirCredits: () => fenetreCredits(),
  changerLangue: (l) => { API.changerReglage('langue', l); },
  changerReglage(cle, v) {
    if (cle === 'muet' || cle === 'notation') v = v === true || v === '1' || v === 'true';
    S.sv.reglages[cle] = v;
    // Le sens de départ s'applique partout : les flèches réglées une à une (hors déboîtées) suivent.
    if (cle === 'sens') for (const n of Object.values(S.sv.niveaux)) for (const vues of Object.values(n?.vues || {})) for (const ch of Object.keys(vues)) if (vues[ch] !== 'deboite') delete vues[ch];
    appliquerReglages();
    sauver();
    if (['langue', 'daltonien', 'texte', 'sens', 'muet', 'notation'].includes(cle)) rafraichirEcran();
  },
  basculerSon() { API.changerReglage('muet', !S.sv.reglages.muet); },
  couleursChapitre: () => couleursChapitre(),
  estOuvert,
  toutOuvrir() { S.sv.toutOuvert = true; sauver(); allerCarte(); },
  noterIndice(id, n) { (S.sv.niveaux[id] ||= {}).indices = Math.max(n, S.sv.niveaux[id].indices || 0); sauver(); },
  exporter() {
    const blob = new Blob([JSON.stringify(S.sv, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${NOM_EXPORT}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  importer(texte) {
    try {
      const s = validerSauvegarde(JSON.parse(texte));
      if (!s) throw new Error('sauvegarde illisible');
      // Tout se prépare à part ; l'état n'est remplacé qu'une fois l'import réussi.
      const chap = preparerChapitre(S.json);
      enregistrerPreuves(chap, s.niveaux);
      const ancien = S.sv;
      S.sv = s;
      try { appliquerReglages(); } catch (err) { S.sv = ancien; appliquerReglages(); throw err; }
      S.chap = chap;
      sauver(); toast(t('reg.importOk'), 'ok'); allerCarte();
    } catch { toast(t('reg.importKo'), 'ko'); }
  },
  effacer() {
    S.sv = { v: 1, reglages: S.sv.reglages, niveaux: {}, toutOuvert: false };
    S.chap = preparerChapitre(S.json);
    sauver(); allerTitre();
  },
};

/** Après un réglage : on redessine l'écran sans rien perdre (l'atelier garde son poste et sa notice). */
function rafraichirEcran() {
  const a = document.activeElement?.dataset?.a;
  if (S.ecran === 'titre') allerTitre();
  else if (S.ecran === 'carte') allerCarte();
  else if (S.ecran === 'niveau') { atelier.rendre(); return; }
  if (a) $(`[data-a="${a}"]`, app)?.focus({ preventScroll: true });
}

function estOuvert(n) {
  if (S.sv.toutOuvert || n.index === 0) return true;
  const prec = S.chap.niveaux[n.index - 1];
  if (n.defi) return !!S.sv.niveaux[niveauParId(S.chap, 'lpc').id]?.gagne || S.chap.niveaux.filter((x) => x.defi).some((d) => d !== n && S.sv.niveaux[d.id]?.gagne);
  return !!S.sv.niveaux[prec.id]?.gagne;
}

// ================================================================= écrans
function changerEcran(el, nom) {
  fermerEditeur();
  fermerFin();
  atelier.detruire();
  app.replaceChildren(el);
  S.ecran = nom;
}
function allerTitre() {
  S.niveau = null;
  changerEcran(ecranTitre(API), 'titre');
  audio.jouerMusique('mus_titre');
}
function allerCarte() {
  S.niveau = null;
  changerEcran(ecranCarte(API), 'carte');
  audio.jouerMusique('mus_titre');
}

// ================================================================= une commande : ouverture et journal
function ouvrirNiveau(id) {
  const niveau = niveauParId(S.chap, id);
  const ctx = contexte(S.chap, niveau);
  const caps = niveau.capsulesInitiales || [];
  fermerFin();
  S.niveau = niveau;
  S.env = { chap: S.chap, niveau, ctx, capsulesInitiales: caps };
  const sv = (S.sv.niveaux[id] ||= {});
  S.journal = Array.isArray(sv.journal) ? sv.journal.slice() : [];
  try { S.etat = etatDepuis(S.journal, S.env); } catch (err) {
    // Un journal abîmé ne doit pas bloquer la commande : on repart d'un établi vide.
    console.warn('journal illisible', id, err);
    S.journal = []; sv.journal = [];
    S.etat = etatDepuis(S.journal, S.env);
    toast(t('toast.journalAbime'), 'ko');
  }
  // Une victoire rejouée par le journal mais jamais enregistrée (page quittée avant la livraison) l'est maintenant.
  if (S.etat.gagne && !sv.gagne) enregistrerGain(niveau, S.etat.gagne, S.etat.feuille);
  // Couleurs et formes des pièces : l'ordre du chapitre, complété par les lettres propres à la commande.
  const ordre = [];
  for (const l of S.etat.feuille.haut) ordre.push(...lettresDe(l.f));
  ordre.push(...lettresDe(niveau.cibleF));
  couleursChapitre(ordre);
  sv.vu = true; sauver();
  atelier.detruire();
  atelier.remettre();
  S.ecran = 'niveau';
  atelier.construire(app);
  atelier.rendre();
  audio.jouerMusique(niveau.musique || 'mus_atelier');
}

/** Un établi neuf pour la même commande (le gain, les étoiles et le record restent acquis). */
function recommencer() {
  if (!S.niveau || S.enFin) return;
  if (S.journal.length && !confirm(t('recommencer.confirmer'))) return;
  const sv = (S.sv.niveaux[S.niveau.id] ||= {});
  S.journal = []; sv.journal = [];
  // Les numéros d'objets vont resservir : les vues choisies pour l'ancien établi partent avec lui.
  if (sv.vues) sv.vues = Object.fromEntries(Object.entries(sv.vues).filter(([id]) => id === 'cible' || S.etat.feuille.haut.some((l) => l.id === id)));
  S.etat = etatDepuis(S.journal, S.env);
  sauver();
  atelier.remettre();
  atelier.rendre();
  audio.sfx('sfx_rangement', { volume: 0.6 });
}

function idMachineLibre() {
  let max = 0;
  for (const e of S.journal) if (e.type === 'POSER' && e.m > max) max = e.m;
  return max + 1;
}

/** Un geste : ses événements entrent ensemble au journal (même numéro g), et s'annulent ensemble. */
function groupe(evts) {
  if (!S.niveau || S.enFin) return null;
  const g = S.journal.length + 1;
  const avant = S.etat;
  let s = S.etat;
  let recalcul = false;
  for (const e0 of evts) {
    const e = { ...e0, g };
    S.journal.push(e);
    if (e.type === 'ANNULER' || e.type === 'RETABLIR') recalcul = true;
    else if (!recalcul) s = appliquer(s, e, S.env);
  }
  S.etat = recalcul ? etatDepuis(S.journal, S.env) : s;
  const sv = (S.sv.niveaux[S.niveau.id] ||= {});
  sv.journal = S.journal;
  // La victoire s'enregistre tout de suite (même si l'on quitte avant la fin de l'animation), y compris par Rétablir.
  let gain = null;
  if (!avant.gagne && S.etat.gagne) gain = enregistrerGain(S.niveau, S.etat.gagne, S.etat.feuille);
  sauver();
  atelier.rendre();
  if (gain) {
    const niveau = S.niveau, feuille = S.etat.feuille;
    // Entre la victoire et la livraison, Espace et Échap passent déjà l'animation (voir le clavier plus bas).
    S.finPrevue = true;
    setTimeout(() => {
      S.finPrevue = false;
      if (S.niveau === niveau && S.ecran === 'niveau' && S.etat.gagne && S.etat.gagne.ligne === gain.g.ligne) lancerFin(niveau, feuille, gain);
      else S.passerFin = false;
    }, 650 * facteur());
  }
  return S.etat;
}
/** Le gain d'une commande : étoiles, record et preuve du joueur (qui sert au dépliage des commandes suivantes). */
function enregistrerGain(n, g, feuille) {
  const sv = (S.sv.niveaux[n.id] ||= {});
  const premiereFois = !sv.gagne;
  const etoiles = calcEtoiles(n, g.score);
  const record = sv.meilleur == null || g.score < sv.meilleur;
  sv.gagne = true;
  sv.etoiles = Math.max(sv.etoiles || 0, etoiles);
  if (record) {
    sv.meilleur = g.score;
    const k = feuille.lignes.findIndex((l) => l.id === g.ligne);
    sv.preuve = versSolution({ haut: feuille.haut, lignes: feuille.lignes.slice(0, k + 1) });
    definirPreuveJoueur(S.chap, n.id, sv.preuve);
  }
  sauver();
  return { g, premiereFois, etoiles, record };
}

/** Clé d'un geste : son numéro g ; les journaux de l'ancienne interface n'en ont pas, on regroupe alors par machine. */
const cleGeste = (e) => (e.g != null ? 'g' + e.g : e.m != null ? 'm' + e.m : null);
function tailleDernierGeste(pile) {
  const k = cleGeste(pile[pile.length - 1]);
  if (k == null) return 1;
  let n = 0;
  for (let i = pile.length - 1; i >= 0 && cleGeste(pile[i]) === k; i--) n++;
  return n;
}
const VISIBLES = new Set(['ACTIONNER', 'DEMONTER', 'NOMMER', 'OUBLIER', 'AUTO']);
/** Combien d'événements défaire pour retirer le dernier geste visible (les gestes sans effet suivent avec lui). */
function nombreADefaire(pile) {
  let n = 0;
  while (n < pile.length) {
    const reste = pile.slice(0, pile.length - n);
    const k = tailleDernierGeste(reste);
    const visible = reste.slice(-k).some((e) => VISIBLES.has(e.type));
    n += k;
    if (visible) break;
  }
  return n;
}
/** Annule le dernier geste entier (tous les événements de son groupe). */
function annulerGeste() {
  if (S.enFin) return;
  const { faits } = effectifs(S.journal);
  if (!faits.length) { toast(t('toast.rien')); return; }
  groupe(Array.from({ length: nombreADefaire(faits) }, () => ({ type: 'ANNULER' })));
  audio.sfx('sfx_rembobine', { volume: 0.6 });
  annoncer(t('toast.annule'));
}
function retablirGeste() {
  if (S.enFin) return;
  const { defaits } = effectifs(S.journal);
  if (!defaits.length) return;
  groupe(Array.from({ length: nombreADefaire(defaits) }, () => ({ type: 'RETABLIR' })));
  audio.sfx('sfx_rembobine', { volume: 0.5, vitesse: 1.3 });
  annoncer(t('toast.retabli'));
}

const atelier = creerAtelier({
  get S() { return S; },
  groupe, annulerGeste, retablirGeste, idMachineLibre, toast, annoncer, facteur, attendre, planifier, sauver, recommencer,
  allerCarte: () => allerCarte(),
  ouvrirReglages: () => API.ouvrirReglages(),
  ouvrirIndice: () => { if (!$('.voile')) fenetreIndice(API, S.niveau, S.sv.niveaux[S.niveau.id]?.indices || 0); },
  changerReglage: (cle, v) => API.changerReglage(cle, v),
});

// ================================================================= livraison (fin de commande)
async function lancerFin(n, feuille, gain) {
  if (S.enFin) return;
  S.enFin = true;
  const { g, premiereFois, etoiles, record } = gain;
  const court = !premiereFois;
  const encore = () => S.enFin && S.niveau === n;
  // 1. L'objet s'envole et tombe dans l'écrin, pile-poil.
  await livrer(g.ligne, court);
  if (!encore()) return;
  // 2. Le contrôle indépendant relit l'objet livré, déplié jusqu'aux moules (sur la feuille du gain, figée).
  const ctrl = await controler(g, feuille, n);
  if (!encore()) return;
  if (!court) await dominos(ctrl);
  if (!encore()) return;
  // 3. La carte de livraison, les étoiles se tamponnent.
  audio.jingle('mus_victoire');
  const max = n.par == null ? 1 : 3;
  let debloque = '';
  if (n.debloque?.theoreme) {
    const T = S.chap.theoremes[n.debloque.theoreme];
    debloque = t('fin.debloqueTheoreme', { thm: `<b>${tr(T.surnom) || tr(T.nom)}</b>` }) + (T.boite ? '<br>' + t('fin.debloqueAutomate', { nom: `<b>${tr(T.surnom) || tr(T.boite)}</b>` }) : '');
  } else if (n.debloque?.regle) { const R = S.chap.regles[n.debloque.regle]; debloque = t('fin.debloqueRegle', { nom: `<b>${tr(R.surnom) || tr(R.nom)}</b>` }); }
  const titre = n.defi ? t('fin.defi') : t('fin.livre');
  const carte = carteFin(API, {
    titre, enonce: svgObjet({ f: n.cibleF, u: 16, sens: S.sv.reglages.sens, label: t('ecrin.commande') }), etoiles, max, n: g.score, par: n.par, depliee: ctrl.erreur ? null : ctrl.gestes, debloque,
    record: !premiereFois && record ? t('fin.record', { n: g.score }) : '',
    troisAide: max === 3 && etoiles < 3 && n.troisEtoiles ? t('fin.mieux') : n.par === 1 && etoiles === 2 ? t('fin.parfaitMax') : '',
    vrai: n.debloque?.theoreme ? tr(S.chap.theoremes[n.debloque.theoreme].nom) : '',
  });
  document.body.appendChild(carte);
  audio.sfx('sfx_tampon', { volume: 0.8, delai: 0.1 });
  const verif = $('.verif', carte);
  verif.textContent = ctrl.erreur ? t('fin.controleImpossible') : ctrl.ok ? t('fin.verifOk', { n: ctrl.gestes }) : t('fin.verifKo');
  verif.classList.toggle('ok', ctrl.ok);
  annoncer(`${titre} ${t('etoiles.aria', { n: etoiles, max })}. ${verif.textContent}`);
  // Les boutons répondent tout de suite, même pendant le tamponnage des étoiles.
  carte.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (!a) return;
    fermerFin();
    if (a === 'suivant') {
      const suivant = S.chap.niveaux[n.index + 1];
      if (suivant) ouvrirNiveau(suivant.id); else allerCarte();
    } else if (a === 'carte') allerCarte();
    else if (a === 'recommencer') { $('.ecrin')?.classList.remove('livre'); recommencer(); }
    else if (a === 'rester') { $('.ecrin')?.classList.remove('livre'); atelier.rendre(); }
  });
  app.inert = true;
  $('.fin-carte', carte)?.focus({ preventScroll: true });
  const spans = $$('.grosses-etoiles span', carte);
  for (let i = 0; i < spans.length; i++) {
    await attendre(court ? 120 : 330);
    if (!carte.isConnected) return;
    spans[i].classList.add('tampon');
    if (i < etoiles && facteur() > 0) audio.sfx('sfx_etoile', { vitesse: 1 + i * 0.06 });
  }
  if (!premiereFois && record) audio.sfx('sfx_cloche', { volume: 0.7 });
  if (etoiles === max && !court) confettis();
}

async function livrer(id, court) {
  const source = $(`.socle[data-objet="${CSS.escape(id)}"] svg`);
  const velours = $('.ecrin .velours');
  if (!source || !velours) return;
  const r0 = source.getBoundingClientRect(), r1 = $('svg', velours)?.getBoundingClientRect() || velours.getBoundingClientRect();
  const vol = source.cloneNode(true);
  vol.classList.add('en-vol');
  vol.style.cssText = `position:fixed;left:${r0.left}px;top:${r0.top}px;width:${r0.width}px;height:${r0.height}px;z-index:90;pointer-events:none`;
  document.body.appendChild(vol);
  audio.sfx('sfx_tuyau_a');
  const dx = r1.left + r1.width / 2 - (r0.left + r0.width / 2), dy = r1.top + r1.height / 2 - (r0.top + r0.height / 2), k = r1.width / r0.width;
  await vol.animate([
    { transform: 'none' },
    { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(${(1 + k) / 2 * 1.08})`, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(${k})` },
  ], { duration: (court ? 450 : 900) * facteur() + 1, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' }).finished.catch(() => {});
  vol.remove();
  const ecrin = $('.ecrin');
  if (ecrin) ecrin.classList.add('livre');
  // L'objet tombe dans le velours, puis le couvercle se ferme.
  audio.sfx('sfx_velours', { volume: 0.8 });
  audio.sfx('sfx_couvercle', { delai: 0.2 });
  await attendre(court ? 250 : 650);
}

/**
 * Déplie l'objet livré jusqu'aux moules, élimine les échanges, et fait relire le tout par le vérificateur indépendant.
 * gestes : les lignes de moule et de clé (les fournitures du client sont comptées à part).
 * erreur : le contrôle n'a pas pu se faire (ce n'est pas un refus).
 */
function controler(g, feuille, n) {
  return new Promise((resolve) => {
    const faire = () => {
      try {
        const plat = new Plat();
        const idx = deplier(feuille, S.env.ctx, plat);
        const G = eliminerSubstitution(plat, idx.get(g.ligne));
        const lignes = enTexte(G);
        const v = verifierGodement(lignes, { premisses: n.premissesF.map(ascii), cible: ascii(n.cibleF) });
        const types = lignes.map((l) => (l.includes('[AX') ? 'moule' : l.includes('[MP') ? 'cle' : 'hyp'));
        const gestes = types.filter((x) => x !== 'hyp').length;
        resolve({ ok: v.ok, gestes, fournitures: types.length - gestes, types });
      } catch (err) {
        console.error(err);
        resolve({ ok: false, erreur: true, gestes: 0, fournitures: 0, types: [] });
      }
    };
    if (window.requestIdleCallback) requestIdleCallback(faire, { timeout: 400 }); else setTimeout(faire, 30);
  });
}

/** La réaction en chaîne : un domino par geste caché (blanc : moule, laiton : clé, gris : fourniture). */
async function dominos(ctrl) {
  if (!ctrl.types.length) return;
  const MAX = 180;
  const montres = ctrl.types.slice(0, MAX);
  const el = h(`<div class="dominos" role="status"><h3>${t('dominos.titre')}</h3><div class="sous">${t('dominos.compte', { n: ctrl.gestes })}${ctrl.fournitures ? ' ' + t('dominos.fournitures', { n: ctrl.fournitures }) : ''}${ctrl.types.length > MAX ? ` (+${ctrl.types.length - MAX})` : ''}</div>
    <div class="rangee-dominos" aria-hidden="true">${montres.map((k) => `<i class="domino ${k}"></i>`).join('')}</div><div class="passer">${t('dominos.passer')}</div></div>`);
  document.body.appendChild(el);
  const ds = $$('.domino', el);
  const volume = 0.25 * Math.min(1, 30 / ds.length);
  let dernierSon = 0;
  for (let i = 0; i < ds.length; i++) {
    if (!S.enFin) break;
    // Passer (ou la vitesse « instant ») fait tomber les dominos restants d'un coup, en silence.
    if (facteur() === 0) { ds.slice(i).forEach((d) => d.classList.add('tombe')); break; }
    ds[i].classList.add('tombe');
    const maintenant = performance.now();
    if (maintenant - dernierSon >= 60) { dernierSon = maintenant; audio.sfx('sfx_domino', { volume, vitesse: (ds[i].classList.contains('cle') ? 0.8 : 1) * (1 + Math.min(1, i / ds.length) * 0.5) }); }
    await attendre(Math.max(14, 90 - i * 2.2));
  }
  $('.passer', el).insertAdjacentHTML('beforebegin', `<div><span class="controle${ctrl.ok ? '' : ' ko'}">${ctrl.ok ? t('dominos.controle') : ctrl.erreur ? t('dominos.impossible') : t('dominos.aRevoir')}</span></div>`);
  audio.sfx('sfx_tampon', { volume: 0.8 });
  await attendre(900);
  el.remove();
}

function fermerFin() {
  app.inert = false;
  S.enFin = false;
  S.passerFin = false;
  $$('.fin, .dominos, .en-vol').forEach((e) => e.remove());
  $$('.confetti').forEach((e) => e.remove());
}

function confettis() {
  if (mouvementsReduits() || S.sv.reglages.vitesse === 'instant') return;
  const couleurs = ['#D9482B', '#2F5DC1', '#E0A21B', '#1D9E75', '#D4537E', '#7A3F9D'];
  for (let i = 0; i < 70; i++) {
    const c = h(`<div class="confetti" aria-hidden="true" style="left:${innerWidth / 2}px;top:${innerHeight / 2 - 120}px;background:${couleurs[i % couleurs.length]}"></div>`);
    document.body.appendChild(c);
    const a = Math.random() * Math.PI * 2, v = 200 + Math.random() * 380;
    c.animate([
      { transform: 'translate(0,0) rotate(0)', opacity: 1 },
      { transform: `translate(${Math.cos(a) * v}px, ${Math.sin(a) * v + 400}px) rotate(${Math.random() * 900}deg)`, opacity: 0 },
    ], { duration: 1600 + Math.random() * 900, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' }).finished.then(() => c.remove());
  }
}

// ================================================================= messages
/** Une annonce pour les lecteurs d'écran (région polie, hors de la mise en page). */
function annoncer(texte) {
  const r = $('#annonces');
  if (!r) return;
  r.textContent = '';
  setTimeout(() => { r.textContent = String(texte).replace(/<[^>]+>/g, ''); }, 30);
}
let minuteurToast = null;
function toast(html, genre = '') {
  $$('.toast').forEach((e) => e.remove());
  const el = h(`<div class="toast ${genre}" aria-hidden="true">${html}</div>`);
  document.body.appendChild(el);
  annoncer(html);
  clearTimeout(minuteurToast);
  minuteurToast = setTimeout(() => el.remove(), genre === 'ko' ? 4200 : 2400);
}

// ================================================================= démarrage
document.addEventListener('keydown', (e) => {
  if (S.enFin) {
    // Pendant la livraison, l'atelier est gelé : Espace et Échap passent l'animation, M coupe le son,
    // et sur la carte, Échap vaut « rester à l'atelier ».
    if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey && !e.altKey) { API.basculerSon(); return; }
    const surCarte = e.target.closest?.('.fin-carte');
    if (e.key === 'Escape' && surCarte) { e.preventDefault(); $('.fin-carte [data-a="rester"]')?.click(); return; }
    if ((e.key === ' ' || e.key === 'Escape') && !e.target.closest?.('.fin-carte button')) { S.passerFin = true; e.preventDefault(); }
    return;
  }
  if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey && !e.altKey && S.ecran !== 'niveau' && !e.target.closest?.('input, textarea')) { API.basculerSon(); rafraichirEcran(); return; }
  if (S.ecran === 'niveau' && !document.querySelector('.voile') && atelier.clavier(e)) e.preventDefault();
});
document.addEventListener('click', (e) => { if (S.enFin && !e.target.closest('.fin-carte')) { S.passerFin = true; e.stopPropagation(); } }, true);
// La commande vient d'être gagnée : un Espace de plus (ou Entrée, Échap) n'actionne rien dans l'atelier, il passe l'animation.
document.addEventListener('keydown', (e) => {
  if (!S.finPrevue || !(e.key === ' ' || e.key === 'Enter' || e.key === 'Escape')) return;
  if (e.key !== 'Enter') S.passerFin = true;
  e.preventDefault();
  e.stopPropagation();
}, true);

async function demarrer() {
  charger();
  appliquerReglages();
  await chargerManifeste();
  habiller();
  const r = await fetch(new URL('../levels/chapitre1.json', import.meta.url));
  S.json = await r.json();
  S.chap = preparerChapitre(S.json);
  for (const n of S.chap.niveaux) n.capsulesInitiales = [];
  // L'ordre des lettres du chapitre, une fois pour toutes.
  const vu = new Set();
  for (const n of S.chap.niveaux) for (const f of [...(n.haut || []).map((id) => S.chap.theoremes[id]?.f).filter((x) => x != null), n.cibleF]) for (const x of lettresDe(f)) if (!vu.has(x)) { vu.add(x); ordreChapitre.push(x); }
  enregistrerPreuves();
  allerTitre();
  document.addEventListener('pointerdown', () => audio.deverrouiller(), { once: true });
  window.__bc = { S, API, groupe, ouvrirNiveau, atelier };
}
demarrer();
