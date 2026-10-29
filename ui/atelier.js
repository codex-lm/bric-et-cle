// Bric & Clé — l'atelier : l'écran d'une commande.
// Étagère (moules, catalogue, fournitures) à gauche, écrin de la commande en haut, établi au centre (le plan de
// montage : chaque objet fabriqué sur son socle, relié par des ficelles à ce dont il sort), râtelier d'outils en bas.
// L'atelier ne fabrique jamais rien lui-même : chaque geste devient un groupe d'événements du journal, et le noyau
// décide. Les vues des flèches (cours, lecture, déboîtée) ne sont que de l'affichage, gratuit et sans rivet.
import { en, estImp, lettre, lettres as lettresDe, noms as nomsDe, texte, ascii, taille, nd, antecedent, occurrences } from '../core/formula.js';
import { substituer } from '../core/subst.js';
import { mp, boite as calcBoite, regle as calcRegle, antecedents, reste } from '../core/rules.js';
import { nomLibre } from '../core/capsules.js';
import { divergence } from '../core/match.js';
import { references } from '../core/sheet.js';
import { aDemonter } from '../core/journal.js';
import { formulesNouvelles } from '../core/score.js';
import { poser, noeudParent } from './objet/pose.js';
import { svgObjet } from './objet/rendu.js';
import { gesteEchangeur, gesteCle, gesteDuplicateur, gesteAutomate } from './gestes.js';
import { t, tr } from './i18n.js';
import { h } from './screens.js';
import { ouvrirEditeur, fermerEditeur } from './editor.js';
import * as audio from './audio.js';
import { figurine } from './assets.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const NUMEROS = { AL1: '①', AL2: '②', AL3: '③', AL4: '④' };
const SUIVANTE = { cours: 'lecture', lecture: 'deboite', deboite: 'cours' };

/** Tous les chemins des sous-formules de f. */
function chemins(f) {
  const out = [];
  const pile = [['', f]];
  while (pile.length) {
    const [ch, x] = pile.pop();
    out.push(ch);
    for (const p of ['a', 'l', 'r']) { const y = en(x, p); if (y != null) pile.push([ch + p, y]); }
  }
  return out;
}

/**
 * A : ce que l'application prête à l'atelier.
 *   S (l'état), groupe(événements) (un geste), annulerGeste(), retablirGeste(), idMachineLibre(), toast(html, genre),
 *   facteur(), attendre(ms), planifier(fn), allerCarte(), ouvrirReglages(), ouvrirIndice(), sauver(), changerReglage(cle, v).
 */
export function creerAtelier(A) {
  const V = {
    pince: null,          // {objet, ch} : le morceau saisi
    poste: null,          // {sorte:'echangeur', entree, molettes:{x:{f, origine}}, arme}
    cle: null,            // objet choisi comme clé (touche K)
    glisse: null,         // geste de glisser en cours
    dernier: null,        // dernier objet fabriqué (projecteur)
    bulle: null,
    notice: 0,
  };
  const dom = {};
  const S = () => A.S;
  const etat = () => A.S.etat;
  const niveau = () => A.S.niveau;
  const sv = () => (A.S.sv.niveaux[A.S.niveau.id] ||= {});
  // Tailles des objets, à l'échelle du réglage « taille des objets et du texte ».
  const UE = () => 20, UG = () => 11, UC = () => 22, UP = () => 22;
  const bloque = () => !!A.S.enFin;

  // ---------------------------------------------------------------- objets
  const ligne = (id) => etat().feuille.haut.find((l) => l.id === id) || etat().feuille.lignes.find((l) => l.id === id) || null;
  function formuleDe(id) {
    if (id === 'cible') return niveau().cibleF;
    return ligne(id)?.f ?? null;
  }
  function nomObjet(id) {
    if (id === 'cible') return t('ecrin.commande');
    const l = ligne(id);
    if (!l) return '';
    if (l.haut) {
      if (l.just.type === 'axiome') return `${NUMEROS[l.id] || ''} ${t('moule.' + l.id)}`;
      if (l.just.type === 'theoreme') { const T = A.S.chap.theoremes[l.id]; return tr(T?.surnom) || tr(T?.nom) || l.id; }
      return t('etagere.fourniture');
    }
    return '';
  }

  /** La formule lue en mots, pour les lecteurs d'écran : « si (R ou R) alors R ». */
  function enMots(f) {
    const go = (x, haut) => {
      const n = nd(x);
      if (n.k === 'L' || n.k === 'V') return n.n;
      if (n.k === 'N') return `${t('mots.non')} ${go(n.a, false)}`;
      const s0 = estImp(x) ? t('mots.si', { a: go(antecedent(x), false), b: go(n.l, false) }) : `${go(n.l, false)} ${t('mots.ou')} ${go(n.r, false)}`;
      return haut ? s0 : `(${s0})`;
    };
    return f == null ? '' : go(f, true);
  }
  const numeroObjet = (id) => etat().feuille.lignes.findIndex((l) => l.id === id) + 1;
  function etiquetteObjet(id) {
    const f = formuleDe(id);
    const nom = id === 'cible' ? t('ecrin.commande') : ligne(id)?.haut ? nomObjet(id) : t('objet.numero', { n: numeroObjet(id) });
    return t('etiquette', { a: nom, b: enMots(f) });
  }

  // ---------------------------------------------------------------- vues des flèches (affichage seul)
  const sensDefaut = () => (A.S.sv.reglages.sens === 'lecture' ? 'lecture' : 'cours');
  function vuesDe(id, f) {
    const exp = (sv().vues || {})[id] || {};
    const out = {};
    if (sensDefaut() === 'lecture') for (const ch of chemins(f)) if (estImp(en(f, ch))) out[ch] = 'lecture';
    for (const [ch, v] of Object.entries(exp)) { if (v === 'cours') delete out[ch]; else out[ch] = v; }
    return out;
  }
  function definirVue(id, ch, v) {
    const vues = (sv().vues ||= {});
    (vues[id] ||= {})[ch] = v;
    A.sauver();
  }
  function cycler(id, ch) {
    const f = formuleDe(id);
    const cur = vuesDe(id, f)[ch] || 'cours';
    const suiv = SUIVANTE[cur];
    definirVue(id, ch, suiv);
    if (V.pince && V.pince.objet === id) V.pince.ch = cheminDessineF(f, V.pince.ch, vuesDe(id, f), etat().capsules);
    audio.sfx(suiv === 'deboite' ? 'sfx_declic' : cur === 'deboite' ? 'sfx_clac' : 'sfx_cran', { volume: 0.6 });
    rendre();
  }
  const vuesExplicites = (id) => ((sv().vues || {})[id] || {});
  /**
   * Les vues que prendra la sortie de l'Échangeur, en suivant la provenance : la charpente de l'entrée garde ses
   * chemins ; un morceau posé par une molette garde les vues de l'endroit où on l'a pris (rien s'il a été tapé).
   */
  function vuesEchangeur(entree, molettes) {
    const fE = formuleDe(entree);
    const out = { ...vuesExplicites(entree) };
    for (const [x, v] of Object.entries(molettes || {})) {
      const o = v && v.origine;
      if (!o || formuleDe(o.objet) == null) continue;
      const src = o.objet === 'cible' ? (sv().vues || {}).cible || {} : vuesExplicites(o.objet);
      for (const q of occurrences(fE, x)) for (const [c, vue] of Object.entries(src)) if (c.startsWith(o.ch)) out[q + c.slice(o.ch.length)] = vue;
    }
    return out;
  }
  function ecrireVues(id, vues) { for (const [ch, v] of Object.entries(vues)) definirVue(id, ch, v); }
  /** La clé libère B, le conséquent : ses vues sont celles de la serrure sous le chemin 'l'. */
  function vuesCle(serrure) {
    const out = {};
    for (const [c, v] of Object.entries(vuesExplicites(serrure))) if (c.startsWith('l')) out[c.slice(1)] = v;
    return out;
  }
  /**
   * Les vues d'un objet produit par un automate, en suivant la provenance comme pour l'Échangeur : la charpente de
   * l'automate n'a pas de vue réglée ; le morceau qui remplace une lettre garde les vues de l'endroit d'où il vient
   * (le premier berceau où la lettre paraît, ou l'origine de la molette ; rien s'il a été tapé).
   */
  function vuesAutomate(M, k, r) {
    const out = {};
    const P = V.poste;
    const genre = M.sorte === 'regle' ? 'V' : 'L';
    const charpente = M.sorte === 'regle' ? M.regle.conclusion : reste(M.T.f, k);
    const recopier = (src, q, x) => {
      for (const p of occurrences(charpente, x, genre)) for (const [c, vue] of Object.entries(src)) if (c.startsWith(q)) out[p + c.slice(q.length)] = vue;
    };
    for (const x of genre === 'V' ? nomsDe(charpente) : lettresDe(charpente)) {
      if (genre === 'L' && r.libres?.includes(x)) {
        const o = P.molettes[x]?.origine;
        if (o && formuleDe(o.objet) != null) recopier(o.objet === 'cible' ? (sv().vues || {}).cible || {} : vuesExplicites(o.objet), o.ch, x);
        continue;
      }
      for (let i = 0; i < k; i++) {
        const q = occurrences(M.ants[i], x, genre)[0];
        if (q !== undefined) { recopier(vuesExplicites(P.berceaux[i]), q, x); break; }
      }
    }
    return out;
  }

  // ---------------------------------------------------------------- dessin d'un objet
  const caches = new Map();
  function poseDe(id, u) {
    const f = formuleDe(id);
    const vues = vuesDe(id, f);
    const cle = `${id}|${f}|${u}|${JSON.stringify(vues)}|${etat().capsules.map((c) => c.nom + c.f + c.auto).join()}`;
    let p = caches.get(cle);
    if (!p) { p = poser(f, { u, vues, capsules: etat().capsules }); caches.set(cle, p); if (caches.size > 400) caches.clear(); }
    return p;
  }
  function svgDe(id, { u = UE(), fini = 'verni', classe = '' } = {}) {
    if (formuleDe(id) == null) return '';
    return svgObjet({ pose: poseDe(id, u), fini, classe, attrs: `data-objet="${esc(id)}"` });
  }
  const svgFormule = (f, { u = UP(), fini = 'brut', classe = '', sansCapsules = false, marques = null, vues = {}, label = '' } = {}) => svgObjet({ f, u, fini, classe, marques, vues, label, sens: sensDefaut(), capsules: sansCapsules ? [] : etat().capsules });
  /** La notation du cours sous un objet (mode Aa), déboîtages compris. */
  function notation(f, id = null) {
    if (!A.S.sv.reglages.notation || f == null) return '';
    const loupe = new Set(Object.entries(id ? vuesDe(id, f) : {}).filter(([, v]) => v === 'deboite').map(([c]) => c));
    return `<div class="notation">${esc(texte(f, { loupe }))}</div>`;
  }

  // ---------------------------------------------------------------- construction de l'écran
  function construire(racine) {
    const el = h(`<div class="atelier">
      <header class="bandeau"></header>
      <aside class="etagere"></aside>
      <section class="ecrin"></section>
      <main class="etabli"><div class="plan"><svg class="ficelles"></svg><div class="socles"></div></div></main>
      <div class="notice-carte" hidden></div><div class="poste-zone"></div>
      <footer class="ratelier"></footer>
    </div>`);
    racine.replaceChildren(el);
    Object.assign(dom, {
      racine: el, bandeau: $('.bandeau', el), etagere: $('.etagere', el), ecrin: $('.ecrin', el), etabli: $('.etabli', el),
      plan: $('.plan', el), ficelles: $('.ficelles', el), socles: $('.socles', el), notice: $('.notice-carte', el),
      poste: $('.poste-zone', el), ratelier: $('.ratelier', el),
    });
    el.addEventListener('pointerdown', (e) => { if (!bloque()) surAppui(e); });
    el.addEventListener('click', (e) => { if (!bloque()) surClic(e); });
    el.addEventListener('keydown', (e) => { if (!bloque()) surToucheElement(e); });
    el.addEventListener('pointerover', surSurvol);
    el.addEventListener('pointerout', (e) => { if (!e.relatedTarget || !el.contains(e.relatedTarget)) eteindreJumeaux(); });
  }

  /** Une annulation ou un démontage peut faire disparaître un objet encore désigné par l'état de l'atelier. */
  function assainir() {
    const vit = (id) => id != null && formuleDe(id) != null;
    if (V.pince && (!vit(V.pince.objet) || en(formuleDe(V.pince.objet), V.pince.ch) == null)) V.pince = null;
    if (V.cle && !vit(V.cle)) V.cle = null;
    if (V.dernier && !vit(V.dernier)) V.dernier = null;
    const P = V.poste;
    if (!P) return;
    if (P.sorte === 'echangeur' && P.entree && !vit(P.entree)) { P.entree = null; P.molettes = {}; P.arme = null; }
    if (P.sorte === 'echangeur' && P.entree) {
      const xs = new Set(lettresDe(formuleDe(P.entree)));
      for (const x of Object.keys(P.molettes)) if (!xs.has(x)) delete P.molettes[x];
      if (P.arme && !xs.has(P.arme)) P.arme = null;
    }
    if (P.berceaux) {
      const i = P.berceaux.findIndex((b) => b && !vit(b));
      if (i >= 0) { for (let j = i; j < P.berceaux.length; j++) P.berceaux[j] = null; P.armeBerceau = i; }
    }
    for (const m of Object.values(P.molettes || {})) if (m && m.origine && !vit(m.origine.objet)) m.origine = null;
  }
  /** Une clé stable pour l'élément qui a le focus, pour le lui rendre après le rendu. */
  function cleFocus(el) {
    if (!el || !dom.racine.contains(el)) return null;
    const d = el.dataset || {};
    if (d.a) return `[data-a="${d.a}"]` + (d.lettre ? `[data-lettre="${CSS.escape(d.lettre)}"]` : '') + (d.berceau ? `[data-berceau="${d.berceau}"]` : '') + (d.nom ? `[data-nom="${CSS.escape(d.nom)}"]` : '');
    if (d.outil) return `[data-outil="${CSS.escape(d.outil)}"]`;
    if (el.classList.contains('molette')) return `.molette[data-lettre="${CSS.escape(d.lettre)}"]`;
    if (el.classList.contains('berceau')) return `.berceau[data-berceau="${d.berceau}"]`;
    if (d.objet) return `${el.classList.contains('socle') ? '.socle' : el.classList.contains('tiroir-objet') ? '.tiroir-objet' : '.velours'}[data-objet="${CSS.escape(d.objet)}"]`;
    return null;
  }
  function rendre() {
    if (!dom.racine || !dom.racine.isConnected) return;
    const focus = cleFocus(document.activeElement);
    assainir();
    rendreBandeau(); rendreEtagere(); rendreEcrin(); rendreEtabli(); rendreRatelier(); rendrePoste(); rendreNotice();
    appliquerMarques();
    if (focus) {
      const el = $(focus, dom.racine) || replisFocus(focus).map((s) => $(s, dom.racine)).find(Boolean);
      if (el) el.focus({ preventScroll: true });
    }
  }
  /**
   * Où rendre le focus quand l'élément qui l'avait disparaît (× d'une molette vidée, levier après le tir…).
   * Jamais sur un bouton du bandeau : un Espace de trop y ferait quitter la commande ou annuler un geste.
   */
  function replisFocus(cle) {
    const lettreM = /data-lettre="([^"]*)"/.exec(cle), berceau = /data-berceau="(\d+)"/.exec(cle);
    const objet = V.dernier ? `.socle[data-objet="${CSS.escape(V.dernier)}"]` : null;
    const candidats = [];
    if (lettreM && V.poste) candidats.push(`.molette[data-lettre="${lettreM[1]}"]`);
    if (berceau && V.poste) candidats.push(`.berceau[data-berceau="${berceau[1]}"]`);
    if (/oublier/.test(cle)) candidats.push('.etagere .tiroir-objet');
    if (V.poste) candidats.push('.poste [data-a="tirer"]:not([disabled])', '.poste [data-a="fermer-poste"]');
    candidats.push(objet, '.etabli .socle', '.carte-outil');
    return candidats.filter(Boolean);
  }

  // ---------------------------------------------------------------- bandeau
  function rendreBandeau() {
    const n = niveau();
    const client = n.atelier?.client ? ` · ${esc(tr(n.atelier.client))}` : '';
    const muet = !!A.S.sv.reglages.muet;
    const b = (a, titre, contenu, cls = '', extra = '') => `<button class="icone ${cls}" data-a="${a}" title="${esc(titre)}" aria-label="${esc(titre)}"${extra}>${contenu}</button>`;
    dom.bandeau.innerHTML = `${b('carte', t('bandeau.coffret'), '◂')}
      <div class="titre-commande"><b>${t('bandeau.commande', { n: esc(n.numero) })}</b>${client}</div>
      <div class="frise">${b('annuler', t('bandeau.annuler'), '↶')}${b('retablir', t('bandeau.retablir'), '↷')}${b('recommencer', t('bandeau.recommencer'), '⟲')}</div>
      <div class="outils-bandeau">
        ${b('miroir', t('etiquette', { a: t('bandeau.miroir'), b: t('bandeau.miroirAide') }), `${sensDefaut() === 'cours' ? '◆━' : '━◆'} ${t('bandeau.miroir')}`, 'texte')}
        ${b('notation', t('bandeau.notationAide'), 'Aa', 'texte' + (A.S.sv.reglages.notation ? ' on' : ''), ` aria-pressed="${!!A.S.sv.reglages.notation}"`)}
        ${b('indice', t('bandeau.noticeAide'), t('bandeau.notice'), 'texte')}
        ${b('son', muet ? t('bandeau.sonCoupe') : t('bandeau.son'), muet ? '🔇' : '🔊', 'son' + (muet ? ' coupe' : ''), ` aria-pressed="${muet}"`)}
        ${b('reglages', t('bandeau.reglages'), '⚙')}
      </div>`;
  }

  // ---------------------------------------------------------------- étagère
  function rendreEtagere() {
    const haut = etat().feuille.haut;
    const groupe = (titre, lignes) => (lignes.length ? `<div class="tiroir"><div class="tiroir-titre">${titre}</div>${lignes.map((l) => `
      <div class="tiroir-objet${V.cle === l.id ? ' cle' : ''}" data-objet="${esc(l.id)}" tabindex="0" role="button" aria-label="${esc(etiquetteObjet(l.id))}" title="${esc(nomObjet(l.id))}">
        <div class="tiroir-nom">${esc(nomObjet(l.id))}</div>${svgDe(l.id, { u: UG() })}${notation(l.f, l.id)}</div>`).join('')}</div>` : '');
    dom.etagere.innerHTML = groupe(t('etagere.moules'), haut.filter((l) => l.just.type === 'axiome'))
      + groupe(t('etagere.catalogue'), haut.filter((l) => l.just.type === 'theoreme'))
      + groupe(t('etagere.fourni'), haut.filter((l) => l.just.type === 'premisse'))
      + (etat().capsules.length ? `<div class="tiroir"><div class="tiroir-titre">${t('etagere.coffrets')}</div>${etat().capsules.map((c) => `
        <div class="tiroir-coffret"><span class="nom-coffret">${esc(c.nom)}</span>${svgFormule(c.f, { u: 10, fini: 'verni', sansCapsules: true })}<button data-a="oublier" data-nom="${esc(c.nom)}" title="${t('coffret.deballer')}" aria-label="${t('coffret.deballer')} ${esc(c.nom)}">×</button></div>`).join('')}</div>` : '');
  }

  // ---------------------------------------------------------------- écrin
  function rendreEcrin() {
    const n = niveau();
    const nb = formulesNouvelles(etat().feuille);
    const par = n.par;
    const rivets = [];
    const total = Math.max(par || 0, nb);
    for (let i = 0; i < total; i++) rivets.push(`<i class="rivet${i < nb ? ' enfonce' : ''}${par != null && i >= par ? ' rouille' : ''}"></i>`);
    const replique = n.atelier?.replique ? t('citation', { texte: esc(tr(n.atelier.replique)) }) : esc(tr(n.titre));
    dom.ecrin.innerHTML = `<div class="bon"><div class="bon-texte">${replique}</div><div class="bon-signature">${esc(tr(n.atelier?.client) || '')}</div></div>
      <div class="velours" data-cible="ecrin" data-objet="cible" tabindex="0" role="button" aria-label="${esc(etiquetteObjet('cible'))}">${svgDe('cible', { u: UC(), fini: 'velours' })}${notation(n.cibleF, 'cible')}</div>
      <div class="couvercle"><div class="rivets">${rivets.join('') || '<span class="defi">—</span>'}</div>
        <div class="compte">${par != null ? t('ecrin.compte', { n: nb, par }) : t('ecrin.compteDefi', { n: nb })}</div></div>`;
  }

  // ---------------------------------------------------------------- établi : le plan de montage
  const OUTIL_DE = { substituer: 'echangeur', mp: 'cle', copier: 'duplicateur', boite: 'automate', regle: 'scelle' };
  function rendreEtabli() {
    const f = etat().feuille;
    const hautIds = new Set(f.haut.map((l) => l.id));
    const rang = new Map();
    const colonnes = [];
    for (const l of f.lignes) {
      const refs = references(l.just);
      const r = 1 + Math.max(0, ...refs.filter((x) => !hautIds.has(x)).map((x) => rang.get(x) || 0));
      rang.set(l.id, r);
      (colonnes[r - 1] ||= []).push(l);
    }
    const PAD = 10, ENTETE = 20, GAPX = 70, GAPY = 18;
    const pos = new Map();
    let x = 26, hMax = 0;
    for (const col of colonnes) {
      if (!col) continue;
      let y = 22, wCol = 0;
      for (const l of col) {
        const p = poseDe(l.id, UE());
        const m = Math.ceil(UE() * 0.2);
        const w = Math.max(p.w + 2 * m + 2 * PAD, 96), hh = p.h + 2 * m + 2 * PAD + ENTETE + (A.S.sv.reglages.notation ? 18 : 0);
        pos.set(l.id, { x, y, w, h: hh });
        y += hh + GAPY; wCol = Math.max(wCol, w);
      }
      hMax = Math.max(hMax, y);
      x += wCol + GAPX;
    }
    const socles = f.lignes.map((l) => {
      const p = pos.get(l.id);
      const refs = references(l.just);
      const jetons = refs.filter((r) => hautIds.has(r)).map((r) => `<span class="jeton" title="${esc(nomObjet(r))}">${NUMEROS[r] || esc(r)}</span>`).join('');
      const outil = OUTIL_DE[l.just.type] || '';
      const cls = ['socle', l.id === V.dernier ? 'dernier' : '', V.cle === l.id ? 'cle' : '', l.f === niveau().cibleF ? 'commande' : ''].join(' ');
      return `<div class="${cls}" data-objet="${esc(l.id)}" tabindex="0" role="button" aria-label="${esc(etiquetteObjet(l.id))}" style="left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px">
        <div class="entete-socle"><span class="numero">n° ${numeroObjet(l.id)}</span><span class="outil-ico ${outil}" title="${t('outil.' + outil)}"></span>${jetons}</div>
        <div class="porte-objet">${svgDe(l.id)}</div>${notation(l.f, l.id)}</div>`;
    }).join('');
    dom.socles.innerHTML = socles || `<div class="etabli-vide">${t('etabli.vide')}</div>`;
    const W = Math.max(x, 600), H = Math.max(hMax + 40, 300);
    dom.plan.style.width = W + 'px'; dom.plan.style.height = H + 'px';
    // Les ficelles : de chaque source posée sur l'établi vers l'objet qui en sort.
    let fic = '';
    for (const l of f.lignes) {
      const b = pos.get(l.id);
      for (const r of references(l.just)) {
        const a = pos.get(r);
        if (!a) continue;
        const x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = b.x, y2 = b.y + b.h / 2, dx = Math.max(24, (x2 - x1) / 2);
        fic += `<path d="M${x1} ${y1}C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}" data-de="${esc(r)}" data-vers="${esc(l.id)}"/>`;
      }
    }
    dom.ficelles.setAttribute('width', W); dom.ficelles.setAttribute('height', H);
    dom.ficelles.innerHTML = fic;
  }

  // ---------------------------------------------------------------- râtelier
  function outilsDuNiveau() {
    return (niveau().inventaire || []).map((it) => {
      const [sorte, ref] = it.split(':');
      return { it, sorte, ref };
    });
  }
  function rendreRatelier() {
    const cartes = outilsDuNiveau().map(({ it, sorte, ref }) => {
      const nom = sorte === 'substituer' ? t('outil.echangeur') : sorte === 'copier' ? t('outil.duplicateur') : sorte === 'mp' ? t('outil.cle')
        : sorte === 'boite' ? (tr(A.S.chap.theoremes[ref]?.surnom) || tr(A.S.chap.theoremes[ref]?.boite) || ref) : tr(A.S.chap.regles[ref]?.surnom) || tr(A.S.chap.regles[ref]?.nom) || ref;
      const touche = sorte === 'substituer' ? 'E' : sorte === 'copier' ? 'D' : sorte === 'mp' ? 'K' : '';
      const bientot = false;
      const on = (sorte === 'substituer' && V.poste?.sorte === 'echangeur') || (sorte === 'mp' && V.cle) || (V.poste?.it === it);
      return `<button class="carte-outil ${sorte}${on ? ' on' : ''}${bientot ? ' bientot' : ''}" data-outil="${esc(it)}" data-cible="outil:${esc(it)}" title="${esc(t('outil.' + sorte + '.aide'))}">
        ${((sorte === 'boite' || sorte === 'regle') && figurine(ref)) || `<span class="outil-ico ${OUTIL_DE[sorte]}"></span>`}<span class="nom-outil">${esc(nom)}</span>${touche ? `<kbd>${touche}</kbd>` : ''}${bientot ? `<span class="sous">${t('outil.bientot')}</span>` : ''}</button>`;
    }).join('');
    const emballer = `<button class="carte-outil emballer" data-outil="emballer" title="${esc(t('outil.emballer.aide'))}"><span class="outil-ico emballage"></span><span class="nom-outil">${t('outil.emballer')}</span><kbd>N</kbd></button>`;
    const etat2 = V.cle ? `<div class="consigne">${t('cle.choisis', { nom: esc(nomObjet(V.cle) || t('cle.cetObjet')) })}</div>`
      : V.poste?.arme ? `<div class="consigne">${t('echangeur.armee')}</div>` : '';
    dom.ratelier.innerHTML = `<div class="cartes">${cartes}${emballer}</div>${etat2}`;
  }

  // ---------------------------------------------------------------- notice (initiation)
  function rendreNotice() {
    const n = niveau();
    const cartes = [];
    for (let i = 1; i < 6; i++) { const k = `notice.${n.id}.${i}`; const s = t(k); if (s === k) break; cartes.push(s); }
    if (!cartes.length || V.notice >= cartes.length) { dom.notice.innerHTML = ''; dom.notice.hidden = true; return; }
    dom.notice.hidden = false;
    dom.notice.innerHTML = `<div class="notice-texte">${cartes[V.notice]}</div><div class="notice-pied"><span>${t('notice.signature')} · ${V.notice + 1}/${cartes.length}</span><button data-a="notice-suivante">${V.notice + 1 < cartes.length ? t('notice.suivante') : t('notice.compris')}</button></div>`;
  }

  // ---------------------------------------------------------------- l'Échangeur (substituer)
  function ouvrirEchangeur(entree = null) {
    if (!outilsDuNiveau().some((o) => o.sorte === 'substituer')) { A.toast(t('echangeur.absent'), 'ko'); return; }
    fermerEditeur();
    V.cle = null;
    V.poste = { sorte: 'echangeur', entree: null, molettes: {}, arme: null };
    if (entree) chargerEchangeur(entree);
    audio.sfx('sfx_pose_a', { volume: 0.5 });
    rendre();
  }
  function chargerEchangeur(id) {
    if (!V.poste || V.poste.sorte !== 'echangeur' || id === 'cible' || formuleDe(id) == null) return;
    V.poste.entree = id;
    V.poste.molettes = {};
    V.poste.arme = null;
    audio.sfx('sfx_clic', { volume: 0.6 });
  }
  function fermerPoste() { V.poste = null; fermerEditeur(); rendre(); }
  /** E et la carte Échangeur : ferment l'Échangeur ouvert, sinon l'ouvrent (à la place d'un automate). */
  function basculerEchangeur(entree) {
    if (V.poste?.sorte === 'echangeur') { if (entree && !V.poste.entree) { chargerEchangeur(entree); rendre(); } else fermerPoste(); return; }
    ouvrirEchangeur(entree && entree !== 'cible' ? entree : null);
  }
  function sigmaPoste() {
    const s = {};
    for (const [x, v] of Object.entries(V.poste.molettes)) if (v && v.f != null) s[x] = v.f;
    return s;
  }
  function remplirMolette(x, f, origine, garderArmee = false) {
    if (!V.poste) return;
    V.poste.molettes[x] = { f, origine };
    if (!garderArmee) V.poste.arme = null;
    audio.sfx('sfx_cran', { volume: 0.7 });
    rendre();
    const m = $(`.molette[data-lettre="${CSS.escape(x)}"]`, dom.poste);
    if (m) m.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(60deg)' }, { transform: 'rotate(0)' }], { duration: 260 });
  }
  function rendrePoste() {
    if (!V.poste) { dom.poste.innerHTML = ''; dom.racine.classList.remove('poste-ouvert'); carillonDore(false); return; }
    dom.racine.classList.add('poste-ouvert');
    if (V.poste.sorte === 'automate') return rendrePosteAutomate();
    const P = V.poste;
    const fE = P.entree ? formuleDe(P.entree) : null;
    let corps;
    if (fE == null) {
      corps = `<div class="entree vide" data-cible="entree">${t('echangeur.poseIci')}</div>`;
      carillonDore(false);
    } else {
      const xs = lettresDe(fE);
      const sigma = sigmaPoste();
      const sortie = substituer(fE, sigma);
      const existe = [...etat().feuille.haut, ...etat().feuille.lignes].some((l) => l.f === sortie);
      carillonDore(sortie === niveau().cibleF);
      const verdict = sortie === niveau().cibleF ? `<span class="verdict or">${t('echangeur.commande')}</span>`
        : existe ? `<span class="verdict">${t('echangeur.dejaEnRayon')}</span>` : `<span class="verdict neuf">${t('echangeur.neuf')}</span>`;
      const molettes = xs.length ? xs.map((x) => {
        const v = P.molettes[x];
        return `<div class="molette${P.arme === x ? ' armee' : ''}${v ? ' pleine' : ''}" data-cible="molette:${esc(x)}" data-lettre="${esc(x)}" title="${t('echangeur.moletteAide')}" tabindex="0" role="button" aria-pressed="${P.arme === x}" aria-label="${esc(t('molette.aria', { x, v: v ? enMots(v.f) : t('echangeur.inchange') }))}">
          <div class="disque">${svgFormule(lettre(x), { u: 22, fini: 'verni' })}</div><div class="egal">→</div>
          <div class="valeur">${v ? svgFormule(v.f, { u: 14 }) : `<span class="inchange">${t('echangeur.inchange')}</span>`}</div>
          <div class="boutons"><button data-a="taper" data-lettre="${esc(x)}" title="${t('echangeur.taper')}" aria-label="${t('echangeur.taper')} (${esc(x)})">Aa</button>${v ? `<button data-a="vider" data-lettre="${esc(x)}" title="${t('echangeur.vider')}" aria-label="${t('echangeur.vider')} (${esc(x)})">×</button>` : ''}</div></div>`;
      }).join('') : `<div class="aucune-lettre">${t('echangeur.aucuneLettre')}</div>`;
      corps = `<div class="entree" data-cible="entree" aria-label="${esc(t('etiquette', { a: t('echangeur.entree'), b: enMots(fE) }))}" role="group"><div class="etiquette">${t('echangeur.entree')}</div>${svgDe(P.entree, { u: UP() })}</div>
        <div class="molettes">${molettes}</div>
        <div class="apercu${sortie === niveau().cibleF ? ' or' : ''}" aria-live="polite"><div class="etiquette">${t('echangeur.apercu')} ${verdict}</div>${svgFormule(sortie, { u: UP(), vues: vuesEchangeur(P.entree, P.molettes), label: t('echangeur.apercu') + ' : ' + enMots(sortie) })}</div>`;
    }
    dom.poste.innerHTML = `<div class="poste echangeur" role="region" aria-label="${t('outil.echangeur')}">
      <div class="poste-tete"><span class="outil-ico echangeur"></span><b>${t('outil.echangeur')}</b><span class="aide">${t('echangeur.aide')}</span><button class="fermer" data-a="fermer-poste" title="${t('poste.fermer')}" aria-label="${t('poste.fermer')}">×</button></div>
      <div class="poste-corps">${corps}</div>
      <button class="levier" data-a="tirer" ${fE == null ? 'disabled' : ''}><span class="manche"></span>${t('echangeur.tirer')}<kbd>${t('touche.espace')}</kbd></button></div>`;
  }
  /** Un carillon quand l'aperçu devient la commande : une fois, au moment où il se dore, pas à chaque rendu. */
  function carillonDore(dore) {
    if (dore && !V.dore) audio.sfx('sfx_dore', { volume: 0.6 });
    V.dore = dore;
  }
  function tirer() {
    const P = V.poste;
    if (!P || P.sorte !== 'echangeur' || !P.entree || formuleDe(P.entree) == null) return;
    fermerEditeur();
    P.arme = null;
    const m = A.idMachineLibre();
    const evts = gesteEchangeur(m, P.entree, sigmaPoste());
    const vues = vuesEchangeur(P.entree, P.molettes);
    audio.sfx('sfx_levier', { volume: 0.8 });
    const s = A.groupe(evts);
    if (s && s.dernier && s.dernier.type === 'accepte') {
      ecrireVues(s.dernier.ligne, vues);
      V.dernier = s.dernier.ligne;
      V.poste = null;
      apresFabrication(s.dernier.ligne, { vernis: true });
    } else A.toast(t('echangeur.refus'), 'ko');
  }

  // ---------------------------------------------------------------- les automates (boîtes et règle scellée)
  function modeleAutomate(it) {
    const [sorte, ref] = it.split(':');
    if (sorte === 'regle') {
      const R = A.S.chap.regles[ref];
      return { sorte, ref, nom: tr(R.surnom) || tr(R.nom), ants: R.premisses, regle: R };
    }
    const T = A.S.chap.theoremes[ref];
    return { sorte, ref, nom: tr(T.surnom) || tr(T.boite) || ref, ants: antecedents(T.f, T.ports), T };
  }
  function ouvrirAutomate(it, premier = null) {
    fermerEditeur();
    const M = modeleAutomate(it);
    V.cle = null;
    V.poste = { sorte: 'automate', it, berceaux: M.ants.map(() => null), molettes: {}, arme: null, armeBerceau: premier ? null : 0 };
    if (premier) { V.poste.berceaux[0] = premier; V.poste.armeBerceau = M.ants.length > 1 ? 1 : null; }
    audio.sfx('sfx_pose_a', { volume: 0.5 });
    rendre();
  }
  function nourrir(i, id) {
    const P = V.poste;
    if (!P || !P.berceaux || i < 0 || id === 'cible' || formuleDe(id) == null) return;
    const libre = P.berceaux.findIndex((b) => !b);
    if (libre >= 0 && i > libre) { A.toast(t('automate.ordre'), 'ko'); return; }
    P.berceaux[i] = id;
    const suivant = P.berceaux.findIndex((b) => !b);
    P.armeBerceau = suivant >= 0 ? suivant : null;
    audio.sfx('sfx_aspire', { volume: 0.7 });
    rendre();
  }
  /** Ce que l'automate ferait avec les berceaux nourris (préfixe contigu) : le noyau calcule. */
  function calculAutomate() {
    const P = V.poste, M = modeleAutomate(P.it);
    let k = 0;
    while (k < P.berceaux.length && P.berceaux[k]) k++;
    const entrees = P.berceaux.slice(0, k).map(formuleDe);
    if (!k) return { M, k, r: null };
    if (M.sorte === 'regle') return { M, k, r: k === M.ants.length ? calcRegle(M.regle, entrees) : null };
    return { M, k, r: calcBoite(M.T.f, entrees, sigmaPoste(), M.T.ports) };
  }
  function rendrePosteAutomate() {
    const P = V.poste;
    const { M, k, r } = calculAutomate();
    const diag = r && !r.ok ? r.diag : null;
    const berceaux = M.ants.map((a, i) => {
      const id = P.berceaux[i];
      const marques = diag && diag.port === i && diag.raison === 'forme' ? new Map([[cheminDessineF(a, diag.chemin), 'ko']]) : null;
      return `<div class="berceau${i > k ? ' ferme' : ''}${id ? ' plein' : ''}${P.armeBerceau === i ? ' armee' : ''}${diag && diag.port === i ? ' ko' : ''}" data-cible="berceau:${i}" data-berceau="${i}" title="${t('automate.berceauAide')}" tabindex="${i > k ? -1 : 0}" role="button" aria-pressed="${P.armeBerceau === i}" aria-disabled="${i > k}" aria-label="${esc(t('berceau.aria', { n: i + 1, gabarit: enMots(a), contenu: id ? enMots(formuleDe(id)) : t('automate.vide') }))}">
        <span class="num">${i + 1}</span><div class="gabarit">${svgFormule(a, { u: 14, fini: 'velours', sansCapsules: true, marques })}</div>
        <div class="nourri">${id ? svgDe(id, { u: 14 }) : `<span class="vide">${t('automate.vide')}</span>`}</div>
        ${id ? `<button data-a="vider-berceau" data-berceau="${i}" title="${t('automate.vider')}" aria-label="${t('automate.vider')} (${i + 1})">×</button>` : ''}</div>`;
    }).join('');
    let reglages = '';
    if (r && r.ok && M.sorte === 'boite') {
      const fixes = Object.entries(r.sigma).filter(([x]) => !r.libres.includes(x));
      reglages = `<div class="fiches">${fixes.map(([x, v]) => `<span class="fiche">${svgFormule(lettre(x), { u: 14, fini: 'verni', sansCapsules: true })}<span>→</span>${svgFormule(v, { u: 12 })}</span>`).join('')}</div>`
        + r.libres.map((x) => {
          const v = P.molettes[x];
          return `<div class="molette${P.arme === x ? ' armee' : ''}${v ? ' pleine' : ''}" data-cible="molette:${esc(x)}" data-lettre="${esc(x)}" title="${t('echangeur.moletteAide')}" tabindex="0" role="button" aria-pressed="${P.arme === x}" aria-label="${esc(t('molette.aria', { x, v: v ? enMots(v.f) : t('echangeur.inchange') }))}">
            <div class="disque">${svgFormule(lettre(x), { u: 22, fini: 'verni', sansCapsules: true })}</div><div class="egal">→</div>
            <div class="valeur">${v ? svgFormule(v.f, { u: 14 }) : `<span class="inchange">${t('echangeur.inchange')}</span>`}</div>
            <div class="boutons"><button data-a="taper" data-lettre="${esc(x)}" title="${t('echangeur.taper')}" aria-label="${t('echangeur.taper')} (${esc(x)})">Aa</button>${v ? `<button data-a="vider" data-lettre="${esc(x)}" title="${t('echangeur.vider')}" aria-label="${t('echangeur.vider')} (${esc(x)})">×</button>` : ''}</div></div>`;
        }).join('');
    }
    let sortie;
    if (!k) sortie = `<div class="attente">${t('automate.nourris')}</div>`;
    else if (!r) sortie = `<div class="attente">${t('automate.encore')}</div>`;
    else if (r.ok) {
      const existe = [...etat().feuille.haut, ...etat().feuille.lignes].some((l) => l.f === r.sortie);
      const verdict = r.sortie === niveau().cibleF ? `<span class="verdict or">${t('echangeur.commande')}</span>` : existe ? `<span class="verdict">${t('echangeur.dejaEnRayon')}</span>` : `<span class="verdict neuf">${t('echangeur.neuf')}</span>`;
      sortie = `<div class="etiquette">${t('echangeur.apercu')} ${verdict}</div>${svgFormule(r.sortie, { u: UP(), vues: vuesAutomate(M, k, r), label: t('etiquette', { a: t('echangeur.apercu'), b: enMots(r.sortie) }) })}`;
    } else sortie = `<div class="diag-automate">${texteDiagAutomate(r.diag)}</div>`;
    const okSortie = r && r.ok && r.sortie === niveau().cibleF;
    carillonDore(!!okSortie);
    dom.poste.innerHTML = `<div class="poste automate${M.sorte === 'regle' ? ' scelle' : ''}" role="region" aria-label="${esc(M.nom)}">
      <div class="poste-tete">${figurine(M.ref, 'figurine petite') || `<span class="outil-ico ${M.sorte === 'regle' ? 'scelle' : 'automate'}"></span>`}<b>${esc(M.nom)}</b><span class="aide">${t(M.sorte === 'regle' ? 'automate.aideScelle' : 'automate.aide')}</span><button class="fermer" data-a="fermer-poste" title="${t('poste.fermer')}" aria-label="${t('poste.fermer')}">×</button></div>
      <div class="poste-corps automate-corps"><div class="berceaux">${berceaux}</div><div class="reglages-automate">${reglages}</div><div class="apercu${okSortie ? ' or' : ''}">${sortie}</div></div>
      <button class="levier" data-a="tirer-automate" ${r && r.ok ? '' : 'disabled'}><span class="manche"></span>${t('automate.remonter')}<kbd>${t('touche.espace')}</kbd></button></div>`;
  }
  function texteDiagAutomate(d) {
    if (d.type === 'port' && d.raison === 'forme') {
      const M = modeleAutomate(V.poste.it), a = M.ants[d.port];
      const fleche = d.chemin.endsWith('r') && a != null && estImp(en(a, d.chemin.slice(0, -1)));
      return t('automate.forme', { n: d.port + 1 }) + (fleche ? `<div class="note">${t('cle.fleche')}</div>` : '');
    }
    if (d.type === 'port' && d.raison === 'conflit') return `${t('automate.conflit', { n: d.port + 1 })}<div class="compare">${svgFormule(lettre(d.variable), { u: 14, fini: 'verni', sansCapsules: true })} : ${svgFormule(d.v1, { u: 12, fini: 'verni' })} / ${svgFormule(d.v2, { u: 12, fini: 'verni' })}</div>`;
    return t('automate.refus');
  }
  function tirerAutomate() {
    const P = V.poste;
    if (!P || P.sorte !== 'automate') return;
    fermerEditeur();
    const { M, k, r } = calculAutomate();
    if (!r || !r.ok) { audio.sfx('sfx_bloque'); return; }
    const m = A.idMachineLibre();
    const libres = {};
    if (M.sorte === 'boite') for (const x of r.libres) if (P.molettes[x]?.f != null) libres[x] = P.molettes[x].f;
    const evts = gesteAutomate(m, M.sorte, M.ref, P.berceaux.slice(0, k), libres);
    const vues = vuesAutomate(M, k, r);
    audio.sfx('sfx_remontoir', { volume: 0.8 });
    const s = A.groupe(evts);
    if (s && s.dernier && s.dernier.type === 'accepte') {
      ecrireVues(s.dernier.ligne, vues);
      V.dernier = s.dernier.ligne;
      V.poste = null;
      apresFabrication(s.dernier.ligne, { vernis: true, delai: 0.9 });
    } else A.toast(t('automate.refus'), 'ko');
  }

  // ---------------------------------------------------------------- coffrets (capsules : affichage seul)
  function emballer() {
    if (!V.pince) { A.toast(t('coffret.aide')); return; }
    const f = en(formuleDe(V.pince.objet), V.pince.ch);
    if (f == null) return;
    const deja = etat().capsules.find((c) => c.f === f);
    if (deja) { A.groupe([{ type: 'OUBLIER', nom: deja.nom }]); audio.sfx('sfx_fissure'); A.toast(t('coffret.deballe', { nom: esc(deja.nom) })); return; }
    if (taille(f) < 3) { A.toast(t('coffret.tropPetit'), 'ko'); return; }
    const pris = new Set([...etat().capsules.map((c) => c.nom), ...lettresDe(niveau().cibleF), ...(niveau().noms || [])]);
    for (const l of [...etat().feuille.haut, ...etat().feuille.lignes]) lettresDe(l.f).forEach((x) => pris.add(x));
    for (const m of Object.values(V.poste?.molettes || {})) if (m?.f != null) lettresDe(m.f).forEach((x) => pris.add(x));
    const nom = nomLibre(pris);
    V.pince = null;
    A.groupe([{ type: 'NOMMER', nom, f: ascii(f) }]);
    audio.sfx('sfx_capsule');
    A.toast(t('coffret.emballe', { nom: esc(nom) }));
  }


  // ---------------------------------------------------------------- la clé (modus ponens)
  function verdictCle(cle, serrure) {
    const fc = formuleDe(cle), fs = formuleDe(serrure);
    if (fc == null || fs == null) return null;
    return mp(fc, fs);
  }
  function tenterCle(cle, serrure, ancre) {
    if (!outilsDuNiveau().some((o) => o.sorte === 'mp')) { A.toast(t('cle.absente'), 'ko'); return; }
    const r = verdictCle(cle, serrure);
    V.cle = null;
    if (!r) { rendre(); return; }
    if (!r.ok) {
      const d = goupilles(r.diag.type === 'antecedent' ? Math.min(5, r.diag.chemin.length) : 0);
      audio.sfx('sfx_bloque', { delai: d });
      if (r.diag.type === 'antecedent') audio.sfx('sfx_boing', { volume: 0.6, delai: d + 0.12 });
      rendre();
      const el = $(`.socle[data-objet="${CSS.escape(serrure)}"], .tiroir-objet[data-objet="${CSS.escape(serrure)}"]`, dom.racine);
      montrerDiagCle(r.diag, serrure, el);
      if (el) el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 260 });
      return;
    }
    const vues = vuesCle(serrure);
    const m = A.idMachineLibre();
    const d = goupilles(Math.min(6, Math.max(2, lettresDe(formuleDe(cle)).length + 1)));
    audio.sfx('sfx_serrure', { delai: d });
    audio.sfx('sfx_pop', { volume: 0.8, delai: d + 0.3 });
    const s = A.groupe(gesteCle(m, cle, serrure));
    if (s && s.dernier && s.dernier.type === 'accepte') {
      ecrireVues(s.dernier.ligne, vues);
      V.dernier = s.dernier.ligne;
      apresFabrication(s.dernier.ligne);
    }
  }
  /** Les goupilles basculent une à une, de plus en plus aigu ; rend le délai après lequel tombe le verdict. */
  function goupilles(n) {
    for (let i = 0; i < n; i++) audio.sfx('sfx_goupille', { volume: 0.45, delai: i * 0.055, vitesse: 1 + i * 0.08 });
    return n * 0.055 + 0.05;
  }
  function montrerDiagCle(diag, serrure, ancre) {
    const el = ancre || $(`.socle[data-objet="${CSS.escape(serrure)}"], .tiroir-objet[data-objet="${CSS.escape(serrure)}"]`, dom.racine);
    if (!el) return;
    let html;
    if (diag.type === 'pasImplication') html = t('cle.pasDeSerrure');
    else if (diag.type === 'antecedent') {
      html = `<div>${t('cle.coince')}</div><div class="compare"><div><span>${t('cle.attendu')}</span>${svgFormule(diag.sousAttendu, { u: 16, fini: 'verni', label: enMots(diag.sousAttendu) })}</div><div><span>${t('cle.recu')}</span>${svgFormule(diag.sousBranche, { u: 16, fini: 'verni', label: enMots(diag.sousBranche) })}</div></div>`;
      // Le premier désaccord, dans l'ordre du noyau, s'allume sur la serrure.
      marquerTemp(serrure, 'ra' + diag.chemin, 'hl-ko', 2600);
      if (diag.chemin.endsWith('r') && estImp(en(formuleDe(serrure), 'ra' + diag.chemin.slice(0, -1)))) html += `<div class="note">${t('cle.fleche')}</div>`;
    } else html = t('cle.refus');
    bulle(el, html, 3200);
  }
  function apresFabrication(id, { vernis = false, delai = 0.15 } = {}) {
    rendre();
    A.planifier(() => {
      const el = $(`.socle[data-objet="${CSS.escape(id)}"]`, dom.racine);
      if (el) { el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); el.classList.add('arrive'); }
    });
    const nl = ligne(id);
    if (!nl || nl.just.type === 'copier') return;
    if (vernis) audio.sfx('sfx_vernis', { volume: 0.55, delai });
    const avant = formulesNouvelles({ ...etat().feuille, lignes: etat().feuille.lignes.slice(0, -1) });
    if (avant !== formulesNouvelles(etat().feuille)) audio.sfx('sfx_rivet', { volume: 0.7, delai: delai + 0.4 });
    else if (nl.f !== niveau().cibleF) A.toast(t('toast.dejaEnRayon'));
  }

  // ---------------------------------------------------------------- duplicateur, démontage
  function dupliquer(id) {
    if (!outilsDuNiveau().some((o) => o.sorte === 'copier')) { A.toast(t('duplicateur.absent'), 'ko'); return; }
    if (id === 'cible' || formuleDe(id) == null) return;
    const m = A.idMachineLibre();
    const s = A.groupe(gesteDuplicateur(m, id));
    if (s && s.dernier && s.dernier.type === 'accepte') {
      ecrireVues(s.dernier.ligne, { ...vuesExplicites(id) });
      V.dernier = s.dernier.ligne;
      audio.sfx('sfx_pose_b');
      A.toast(t('toast.copie'));
      apresFabrication(s.dernier.ligne);
    }
  }
  function demonter(id) {
    const m = etat().machines.find((x) => x.sortie === id);
    if (!m) return;
    const { lignes } = aDemonter(etat().machines, m.id);
    if (lignes.size > 1 && !confirm(t('copeaux.confirmer', { n: lignes.size }))) return;
    V.pince = null;
    A.groupe([{ type: 'DEMONTER', m: m.id }]);
    audio.sfx('sfx_copeaux');
    A.toast(t('copeaux.fait', { n: lignes.size }));
  }

  // ---------------------------------------------------------------- essayage sur l'écrin
  function essayer(id) {
    const f = formuleDe(id), c = niveau().cibleF;
    if (f == null) return;
    if (f === c) { A.toast(t('ecrin.identique'), 'ok'); return; }
    const d = divergence(c, f);
    marquerTemp('cible', d, 'hl-ko', 2600);
    bulle($('.velours', dom.ecrin), `<div>${t('ecrin.essai')}</div><div class="compare"><div><span>${t('ecrin.attendu')}</span>${svgFormule(en(c, d), { u: 16, fini: 'verni' })}</div><div><span>${t('ecrin.toi')}</span>${en(f, d) != null ? svgFormule(en(f, d), { u: 16, fini: 'verni' }) : '—'}</div></div>`, 3200);
    audio.sfx('sfx_bloque', { volume: 0.4 });
  }

  // ---------------------------------------------------------------- marques (surlignages du DOM, sans redessin)
  function svgsDe(id) { return $$(`svg[data-objet="${CSS.escape(id)}"]`, dom.racine); }
  /** Le chemin dessiné le plus proche : un nœud sans dessin propre (le « non » fondu dans une flèche, un morceau dans un coffret) remonte. */
  function cheminDessineF(f, ch, vues = {}, capsules = []) {
    const p = poser(f, { u: 10, vues, capsules });
    const vus = new Set(p.noeuds.map((n) => n.ch));
    let c = ch;
    while (c && !vus.has(c)) c = c.slice(0, -1);
    return c;
  }
  function marquer(id, ch, cls) {
    const f = formuleDe(id);
    if (f == null) return;
    let c = ch;
    const noeuds = new Set(poseDe(id, UE()).noeuds.map((n) => n.ch));
    // Le « non » d'une flèche n'a pas de dessin à lui : on allume la flèche et sa serrure.
    if (!noeuds.has(c) && c.endsWith('r') && estImp(en(f, c.slice(0, -1)))) {
      const imp = c.slice(0, -1);
      for (const s of svgsDe(id)) s.querySelectorAll(`[data-fleche="${CSS.escape(imp)}"], .serrure[data-imp="${CSS.escape(imp)}"]`).forEach((e) => e.classList.add(cls));
      c = imp + 'ra';
    }
    while (c && !noeuds.has(c)) c = c.slice(0, -1);
    for (const s of svgsDe(id)) for (const e of s.querySelectorAll('[data-ch]')) if (e.getAttribute('data-ch').startsWith(c)) e.classList.add(cls);
  }
  function marquerTemp(id, ch, cls, ms) {
    marquer(id, ch, cls);
    setTimeout(() => { for (const s of svgsDe(id)) s.querySelectorAll('.' + cls).forEach((e) => e.classList.remove(cls)); }, ms);
  }
  function appliquerMarques() {
    if (V.pince && formuleDe(V.pince.objet) != null) marquer(V.pince.objet, V.pince.ch, 'hl-sel');
    const o = V.poste?.arme && V.poste.molettes[V.poste.arme]?.origine;
    if (o && formuleDe(o.objet) != null) marquer(o.objet, o.ch, 'hl-sel');
    if (V.dernier) for (const s of svgsDe(V.dernier)) s.classList.add('projecteur');
  }
  let jumeauxAllumes = false;
  function eteindreJumeaux() {
    if (!jumeauxAllumes) return;
    $$('.hl-jumeau', dom.racine).forEach((e) => e.classList.remove('hl-jumeau'));
    $$('.hl-lettre', dom.racine).forEach((e) => e.classList.remove('hl-lettre'));
    jumeauxAllumes = false;
  }
  function surSurvol(e) {
    if (V.glisse) return;
    const mol = e.target.closest('.molette[data-lettre]');
    if (mol && V.poste?.entree) {
      eteindreJumeaux();
      const x = mol.dataset.lettre;
      for (const s of svgsDe(V.poste.entree)) s.querySelectorAll(`[data-l="${CSS.escape(x)}"]`).forEach((p) => p.classList.add('hl-lettre'));
      jumeauxAllumes = true;
      return;
    }
    const el = e.target.closest('[data-ch]');
    const svg = el && el.closest('svg[data-objet]');
    if (!svg) { eteindreJumeaux(); return; }
    const g = en(formuleDe(svg.dataset.objet), el.dataset.ch);
    eteindreJumeaux();
    if (g == null || taille(g) < 3) return;
    for (const s of $$('svg[data-objet]', dom.racine)) {
      const f2 = formuleDe(s.dataset.objet);
      if (f2 == null) continue;
      for (const p of chemins(f2)) if (en(f2, p) === g) s.querySelectorAll('[data-ch]').forEach((x) => { if (x.getAttribute('data-ch').startsWith(p)) x.classList.add('hl-jumeau'); });
    }
    jumeauxAllumes = true;
  }

  // ---------------------------------------------------------------- bulle
  function bulle(ancre, html, ms = 2600) {
    fermerBulle();
    const r = ancre.getBoundingClientRect();
    const b = h(`<div class="bulle-atelier">${html}</div>`);
    document.body.appendChild(b);
    const w = b.offsetWidth, hb = b.offsetHeight;
    let x = r.left + r.width / 2 - w / 2, y = r.top - hb - 10;
    if (y < 8) y = r.bottom + 10;
    b.style.left = Math.max(8, Math.min(innerWidth - w - 8, x)) + 'px';
    b.style.top = y + 'px';
    V.bulle = b;
    V.bulleMinuteur = setTimeout(fermerBulle, ms);
    A.annoncer(b.textContent);
  }
  function fermerBulle() { clearTimeout(V.bulleMinuteur); if (V.bulle) { V.bulle.remove(); V.bulle = null; } }

  // ---------------------------------------------------------------- clics (boutons, cartes, molettes)
  function surClic(e) {
    const a = e.target.closest('[data-a]');
    if (a) {
      const act = a.dataset.a;
      switch (act) {
        case 'carte': return A.allerCarte();
        case 'annuler': return A.annulerGeste();
        case 'retablir': return A.retablirGeste();
        case 'reglages': return A.ouvrirReglages();
        case 'indice': return A.ouvrirIndice();
        case 'notation': A.changerReglage('notation', !A.S.sv.reglages.notation); return rendre();
        case 'miroir': return basculerMiroir();
        case 'son': A.changerReglage('muet', !A.S.sv.reglages.muet); return rendre();
        case 'recommencer': return A.recommencer();
        case 'fermer-poste': return fermerPoste();
        case 'tirer': return tirer();
        case 'notice-suivante': { V.notice++; rendreNotice(); const b = $('[data-a="notice-suivante"]', dom.notice); if (b) b.focus({ preventScroll: true }); return; }
        case 'vider': if (V.poste) { delete V.poste.molettes[a.dataset.lettre]; audio.sfx('sfx_cran', { volume: 0.4 }); rendre(); } return;
        case 'taper': return taperMolette(a.dataset.lettre, a);
        case 'tirer-automate': return tirerAutomate();
        case 'vider-berceau': if (V.poste?.berceaux) { const i = +a.dataset.berceau; for (let j = i; j < V.poste.berceaux.length; j++) V.poste.berceaux[j] = null; audio.sfx('sfx_cran', { volume: 0.4 }); rendre(); } return;
        case 'oublier': A.groupe([{ type: 'OUBLIER', nom: a.dataset.nom }]); audio.sfx('sfx_fissure'); return;
        default: return;
      }
    }
    const carte = e.target.closest('.carte-outil');
    if (carte) return activerOutil(carte.dataset.outil);
    const ber = e.target.closest('.berceau[data-berceau]');
    if (ber && V.poste?.berceaux && !ber.classList.contains('ferme')) {
      const i = +ber.dataset.berceau;
      V.poste.armeBerceau = V.poste.armeBerceau === i ? null : i;
      V.poste.arme = null;
      audio.sfx('sfx_clic', { volume: 0.4 });
      return rendre();
    }
    const mol = e.target.closest('.molette[data-lettre]');
    if (mol && V.poste) {
      const x = mol.dataset.lettre;
      V.poste.arme = V.poste.arme === x ? null : x;
      audio.sfx('sfx_clic', { volume: 0.4 });
      rendre();
    }
  }
  function activerOutil(it) {
    const [sorte] = it.split(':');
    if (sorte === 'substituer') { basculerEchangeur(V.pince && !V.pince.ch ? V.pince.objet : null); return; }
    if (sorte === 'copier') { if (V.pince && V.pince.objet !== 'cible') dupliquer(V.pince.objet); else A.toast(t('duplicateur.aide')); return; }
    if (sorte === 'mp') { if (V.pince && V.pince.objet !== 'cible') { V.cle = V.cle ? null : V.pince.objet; rendre(); } else A.toast(t('outil.mp.aide')); return; }
    if (sorte === 'boite' || sorte === 'regle') { if (V.poste?.it === it) fermerPoste(); else ouvrirAutomate(it, V.pince && !V.pince.ch && V.pince.objet !== 'cible' ? V.pince.objet : null); return; }
    if (sorte === 'emballer') emballer();
  }
  function taperMolette(x, ancre) {
    const P = V.poste;
    if (!P) return;
    const base = P.sorte === 'echangeur' ? formuleDe(P.entree) : modeleAutomate(P.it).T?.f;
    ouvrirEditeur({
      ancre, lettre: x, valeur: P.molettes[x]?.f ?? null,
      lettresPalette: [...new Set([...(base != null ? lettresDe(base) : []), ...lettresDe(niveau().cibleF)])],
      noms: niveau().noms || [], capsules: etat().capsules,
      onValider: (f) => {
        if (V.poste !== P) return;
        if (f == null) delete P.molettes[x]; else P.molettes[x] = { f, origine: null };
        rendre();
      },
      // Le focus revient à la molette (sur laquelle Espace reste la touche du levier).
      onFermer: () => { const m = $(`.molette[data-lettre="${CSS.escape(x)}"]`, dom.racine); if (m) m.focus({ preventScroll: true }); },
    });
  }
  function basculerMiroir() {
    const nouveau = sensDefaut() === 'cours' ? 'lecture' : 'cours';
    A.changerReglage('sens', nouveau);
    // Le levier global remet toutes les flèches du niveau dans le même sens (les déboîtées restent déboîtées).
    const vues = sv().vues || {};
    for (const id of Object.keys(vues)) for (const ch of Object.keys(vues[id])) if (vues[id][ch] !== 'deboite') delete vues[id][ch];
    A.sauver();
    audio.sfx('sfx_miroir', { volume: 0.7 });
    rendre();
  }

  // ---------------------------------------------------------------- pince et glisser
  function annulerGlisse() {
    const G = V.glisse;
    V.glisse = null;
    if (!G) return;
    if (G.fantome) G.fantome.remove();
    if (G.survolEl) G.survolEl.classList.remove('cible-ok', 'cible-ko', 'cible-neutre');
    nettoyerSerrures();
    dom.racine.classList.remove('en-glisse', 'glisse-entier', 'glisse-brut');
    if (G.liberer) G.liberer();
  }
  function surAppui(e) {
    if (e.button !== 0 || !e.isPrimary || V.glisse) return;
    const porteur = e.target.closest('[data-objet]');
    if (!porteur || e.target.closest('button')) return;
    const id = porteur.dataset.objet;
    const elCh = e.target.closest('[data-ch]');
    const fleche = e.target.closest('[data-fleche]');
    const surDessin = !!(elCh && elCh.closest('svg[data-objet]'));
    // Morceau visé : la sélection en cours si on appuie dedans, sinon le plus petit sous-assemblage sous le doigt.
    let ch = surDessin ? elCh.dataset.ch : '';
    if (surDessin && V.pince && V.pince.objet === id && ch.startsWith(V.pince.ch)) ch = V.pince.ch;
    const dansEtagere = !!porteur.closest('.etagere');
    // Un objet verni entier se prend par son socle ; sur l'étagère, un moule se prend toujours entier.
    const entier = id !== 'cible' && (!surDessin || (dansEtagere && !(V.pince && V.pince.objet === id && V.pince.ch)));
    V.glisse = { id, ch: entier ? '' : ch, entier, x0: e.clientX, y0: e.clientY, actif: false, fleche: fleche ? fleche.dataset.fleche : null, clicCh: surDessin ? elCh.dataset.ch : '', porteur };
    const id0 = e.pointerId;
    const bouger = (ev) => { if (ev.pointerId === id0) surDeplacement(ev); };
    const liberer = () => {
      document.removeEventListener('pointermove', bouger);
      document.removeEventListener('pointerup', lacher);
      document.removeEventListener('pointercancel', annuler);
    };
    const lacher = (ev) => { if (ev.pointerId !== id0) return; liberer(); surLacher(ev); };
    const annuler = (ev) => { if (ev.pointerId !== id0) return; liberer(); annulerGlisse(); };
    V.glisse.liberer = liberer;
    document.addEventListener('pointermove', bouger);
    document.addEventListener('pointerup', lacher);
    document.addEventListener('pointercancel', annuler);
  }
  function surDeplacement(e) {
    const G = V.glisse;
    if (!G) return;
    if (!G.actif) {
      if (Math.hypot(e.clientX - G.x0, e.clientY - G.y0) < 6) return;
      G.actif = true;
      eteindreJumeaux(); fermerBulle();
      const f = en(formuleDe(G.id), G.ch);
      G.f = f;
      const vues = vuesDe(G.id, formuleDe(G.id));
      const sous = {};
      for (const [c, v] of Object.entries(vues)) if (c.startsWith(G.ch)) sous[c.slice(G.ch.length)] = v;
      G.fantome = h(`<div class="fantome-glisse${G.entier ? ' entier' : ' brut'}" aria-hidden="true">${svgObjet({ f, u: UE(), vues: sous, capsules: etat().capsules, fini: G.entier ? 'verni' : 'brut' })}</div>`);
      document.body.appendChild(G.fantome);
      dom.racine.classList.add('en-glisse', G.entier ? 'glisse-entier' : 'glisse-brut');
      audio.sfx('sfx_clic', { volume: 0.3 });
    }
    G.fantome.style.left = e.clientX + 'px';
    G.fantome.style.top = e.clientY + 'px';
    // Cible sous le pointeur : retour immédiat, sans rien fabriquer.
    const sous = document.elementFromPoint(e.clientX, e.clientY);
    const cible = sous && (sous.closest('[data-cible]') || sous.closest('[data-objet]'));
    if (cible === G.survolEl) return;
    if (G.survolEl) { G.survolEl.classList.remove('cible-ok', 'cible-ko', 'cible-neutre'); nettoyerSerrures(); }
    G.survolEl = cible;
    fermerBulle();
    if (!cible) return;
    const quoi = jugerCible(cible, G);
    cible.classList.add(quoi.cls);
    if (quoi.serrure) {
      const r = verdictCle(G.id, quoi.serrure);
      if (r && r.ok) marquer(quoi.serrure, 'ra', 'hl-ok');
      else if (r && r.diag.type === 'antecedent') { marquer(quoi.serrure, 'ra', 'hl-pale'); marquer(quoi.serrure, 'ra' + r.diag.chemin, 'hl-ko'); }
    }
  }
  function nettoyerSerrures() { $$('.hl-ok, .hl-ko, .hl-pale', dom.racine).forEach((e) => e.classList.remove('hl-ok', 'hl-ko', 'hl-pale')); }
  /** Ce que deviendrait le lâcher sur cette cible. */
  function jugerCible(el, G) {
    const c = el.dataset.cible;
    if (c) {
      if (c.startsWith('molette:')) return { cls: 'cible-ok', act: 'molette', x: c.slice(8) };
      if (c.startsWith('berceau:')) {
        if (!V.poste?.berceaux) return { cls: 'cible-neutre', act: 'rien' };
        const i = +c.slice(8);
        if (!G.entier) return { cls: 'cible-ko', act: 'pasVerni' };
        const libre = V.poste?.berceaux ? V.poste.berceaux.findIndex((b) => !b) : -1;
        return i <= (libre < 0 ? V.poste.berceaux.length - 1 : libre) ? { cls: 'cible-ok', act: 'berceau', i } : { cls: 'cible-ko', act: 'ordre' };
      }
      if (c === 'entree') return G.entier ? { cls: 'cible-ok', act: 'entree' } : { cls: 'cible-ko', act: 'pasVerni' };
      if (c === 'ecrin' && G.id === 'cible') return { cls: 'cible-neutre', act: 'rien' };
      if (c === 'ecrin') return { cls: 'cible-neutre', act: 'essayer' };
      if (c.startsWith('outil:')) {
        const it = c.slice(6);
        return G.entier ? { cls: 'cible-ok', act: 'outil', it } : { cls: 'cible-ko', act: 'pasVerni' };
      }
    }
    const id = el.dataset.objet;
    if (id && id !== G.id && id !== 'cible' && G.entier) {
      const r = verdictCle(G.id, id);
      if (!r || r.diag?.type === 'pasImplication') return { cls: 'cible-neutre', act: 'rien' };
      return { cls: r.ok ? 'cible-ok' : 'cible-ko', act: 'cle', serrure: id };
    }
    if (id === 'cible') return { cls: 'cible-neutre', act: 'essayer' };
    return { cls: 'cible-neutre', act: 'rien' };
  }
  function surLacher(e) {
    const G = V.glisse;
    V.glisse = null;
    if (!G) return;
    dom.racine.classList.remove('en-glisse', 'glisse-entier', 'glisse-brut');
    if (!G.actif) return cliquerObjet(G, e);
    if (G.fantome) G.fantome.remove();
    if (G.survolEl) G.survolEl.classList.remove('cible-ok', 'cible-ko', 'cible-neutre');
    nettoyerSerrures();
    if (!G.survolEl) return;
    if (formuleDe(G.id) == null) return;
    const quoi = jugerCible(G.survolEl, G);
    switch (quoi.act) {
      case 'molette':
        if (!V.poste) return;
        return remplirMolette(quoi.x, G.f, { objet: G.id, ch: G.ch });
      case 'berceau':
        return nourrir(quoi.i, G.id);
      case 'ordre':
        A.toast(t('automate.ordre'), 'ko'); return;
      case 'entree':
        chargerEchangeur(G.id); return rendre();
      case 'pasVerni':
        A.toast(t('glisse.pasVerni'), 'ko'); return;
      case 'essayer':
        return G.entier ? essayer(G.id) : essayerMorceau(G.f);
      case 'outil': {
        const [sorte] = quoi.it.split(':');
        if (sorte === 'substituer') { if (V.poste?.sorte === 'echangeur') { chargerEchangeur(G.id); rendre(); } else ouvrirEchangeur(G.id); return; }
        if (sorte === 'copier') return dupliquer(G.id);
        if (sorte === 'mp') { V.cle = G.id; return rendre(); }
        if (sorte === 'boite' || sorte === 'regle') { if (V.poste?.it === quoi.it) nourrir(V.poste.berceaux.findIndex((b) => !b), G.id); else ouvrirAutomate(quoi.it, G.id); return; }
        return;
      }
      case 'cle':
        return tenterCle(G.id, quoi.serrure, G.survolEl);
      default:
    }
  }
  function essayerMorceau(f) {
    if (f == null) return;
    const c = niveau().cibleF;
    const d = divergence(c, f);
    if (d === null) { A.toast(t('ecrin.identique'), 'ok'); return; }
    marquerTemp('cible', d, 'hl-ko', 2400);
  }
  function cliquerObjet(G) {
    const id = G.id;
    // Molette armée : le morceau cliqué la remplit (une flèche cliquée donne toute l'implication) ;
    // un nouveau clic dans ce morceau prend le parent. La molette reste armée jusqu'au levier, à Échap
    // ou à un clic sur une autre molette.
    if (V.poste && V.poste.arme) {
      const x = V.poste.arme;
      const avant = V.poste.molettes[x]?.origine;
      let ch = G.fleche != null ? G.fleche : G.clicCh;
      if (avant && avant.objet === id && ch.startsWith(avant.ch)) {
        const par = noeudParent(poseDe(id, UE()), avant.ch);
        ch = par ? par.ch : avant.ch;
      }
      remplirMolette(x, en(formuleDe(id), ch), { objet: id, ch }, true);
      return;
    }
    // Berceau armé : l'objet cliqué (entier) le nourrit.
    if (V.poste?.berceaux && V.poste.armeBerceau != null && id !== 'cible') { nourrir(V.poste.armeBerceau, id); return; }
    // Mode clé (touche K) : l'objet cliqué est la serrure.
    if (V.cle && V.cle !== id && id !== 'cible') { tenterCle(V.cle, id); return; }
    // La flèche : un clic la retourne (cours → lecture → déboîtée → cours).
    if (G.fleche != null) { cycler(id, G.fleche); return; }
    if (V.poste?.sorte === 'echangeur' && !V.poste.entree && id !== 'cible' && !G.clicCh) { chargerEchangeur(id); rendre(); return; }
    // La pince : un clic prend le plus petit morceau ; un clic dans la sélection prend le parent.
    const ch = G.clicCh;
    if (V.pince && V.pince.objet === id && ch.startsWith(V.pince.ch) && V.pince.ch !== '' && ch !== '' ) {
      const par = noeudParent(poseDe(id, UE()), V.pince.ch);
      V.pince = { objet: id, ch: par ? par.ch : '' };
    } else if (V.pince && V.pince.objet === id && V.pince.ch === ch) {
      V.pince = null;
    } else V.pince = { objet: id, ch };
    audio.sfx('sfx_clic', { volume: 0.25 });
    rendre();
  }

  // ---------------------------------------------------------------- clavier
  /** Entrée ou Espace sur un objet, une molette ou un berceau focalisés : l'équivalent du clic. */
  function surToucheElement(e) {
    const el = e.target;
    if (!(el instanceof Element) || el.closest('button, input, textarea, .editeur')) return;
    const k = e.key;
    if (k !== 'Enter' && k !== ' ' && !k.startsWith('Arrow')) return;
    // Espace, poste ouvert, reste la touche du levier (le clavier général s'en charge).
    if (k === ' ' && V.poste) return;
    if (el.classList.contains('molette') && (k === 'Enter' || k === ' ')) {
      e.preventDefault(); e.stopPropagation();
      V.poste.arme = V.poste.arme === el.dataset.lettre ? null : el.dataset.lettre;
      audio.sfx('sfx_clic', { volume: 0.4 });
      return rendre();
    }
    if (el.classList.contains('berceau') && (k === 'Enter' || k === ' ')) {
      e.preventDefault(); e.stopPropagation();
      if (el.classList.contains('ferme')) return;
      const i = +el.dataset.berceau;
      V.poste.armeBerceau = V.poste.armeBerceau === i ? null : i;
      return rendre();
    }
    const id = el.dataset.objet;
    if (!id || formuleDe(id) == null) return;
    e.preventDefault(); e.stopPropagation();
    if (k.startsWith('Arrow')) return naviguer(id, k);
    // Entrée sur un objet : le morceau saisi dans cet objet, ou l'objet entier.
    const ch = V.pince && V.pince.objet === id ? V.pince.ch : '';
    if (V.poste?.arme) { remplirMolette(V.poste.arme, en(formuleDe(id), ch), { objet: id, ch }); return; }
    if (V.poste?.berceaux && V.poste.armeBerceau != null && id !== 'cible') return nourrir(V.poste.armeBerceau, id);
    if (V.cle && V.cle !== id && id !== 'cible') return tenterCle(V.cle, id);
    if (V.poste?.sorte === 'echangeur' && !V.poste.entree && id !== 'cible') { chargerEchangeur(id); return rendre(); }
    V.pince = V.pince && V.pince.objet === id && V.pince.ch === '' ? null : { objet: id, ch: '' };
    audio.sfx('sfx_clic', { volume: 0.25 });
    rendre();
  }
  /** Les flèches du clavier déplacent la pince : ↑ le parent, ↓ le premier morceau, ← → les voisins. */
  function naviguer(id, k) {
    const pose = poseDe(id, UE());
    const cur = V.pince && V.pince.objet === id ? V.pince.ch : null;
    const enfants = (ch) => pose.noeuds.filter((n) => n.ch !== ch && n.ch.startsWith(ch) && noeudParent(pose, n.ch)?.ch === ch).sort((a, b) => a.x - b.x);
    let suiv = null;
    if (cur == null) suiv = '';
    else if (k === 'ArrowUp') suiv = cur === '' ? '' : (noeudParent(pose, cur)?.ch ?? '');
    else if (k === 'ArrowDown') suiv = enfants(cur)[0]?.ch ?? cur;
    else {
      const par = cur === '' ? null : (noeudParent(pose, cur)?.ch ?? '');
      if (par == null) suiv = cur;
      else {
        const freres = enfants(par);
        const i = freres.findIndex((n) => n.ch === cur);
        suiv = freres[Math.max(0, Math.min(freres.length - 1, i + (k === 'ArrowRight' ? 1 : -1)))]?.ch ?? cur;
      }
    }
    V.pince = { objet: id, ch: suiv };
    audio.sfx('sfx_cran', { volume: 0.25 });
    rendre();
    const g = en(formuleDe(id), suiv);
    A.annoncer(enMots(g));
  }
  function clavier(e) {
    if (e.target.closest && e.target.closest('input, textarea, .editeur')) return false;
    const k = e.key;
    if (V.glisse && k === 'Escape') { annulerGlisse(); return true; }
    if (V.glisse?.actif) return true;
    // Poste ouvert : Espace tire le levier, sauf sur un bouton du poste ou de la notice (qui garde son sens).
    if (k === ' ' && V.poste && !e.target.closest('.poste-zone button, .notice-carte button')) { if (!e.repeat) { if (V.poste.sorte === 'echangeur') tirer(); else tirerAutomate(); } return true; }
    // Ailleurs, Espace et Entrée sur un vrai bouton gardent leur sens.
    if ((k === ' ' || k === 'Enter') && e.target.closest && e.target.closest('button')) return false;
    if (e.repeat && !e.ctrlKey && !e.metaKey && (k.length === 1 || k === 'Delete' || k === 'Backspace')) return true;
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'z') { e.shiftKey ? A.retablirGeste() : A.annulerGeste(); return true; }
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'y') { A.retablirGeste(); return true; }
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    if (k === 'Escape') {
      if (V.poste?.arme || V.poste?.armeBerceau != null) { V.poste.arme = null; V.poste.armeBerceau = null; }
      else if (V.cle) V.cle = null;
      else if (V.poste) { V.poste = null; fermerEditeur(); }
      else V.pince = null;
      fermerBulle(); rendre(); return true;
    }
    if (k.toLowerCase() === 'n') { emballer(); return true; }
    const kl = k.toLowerCase();
    const choisi = V.pince && V.pince.objet !== 'cible' ? V.pince.objet : null;
    if (kl === 'm') { A.changerReglage('muet', !A.S.sv.reglages.muet); rendre(); return true; }
    if (kl === 'e') { basculerEchangeur(choisi); return true; }
    if (kl === 'd' && choisi) { dupliquer(choisi); return true; }
    if (kl === 'k' && choisi) { V.cle = V.cle === choisi ? null : choisi; rendre(); return true; }
    if (kl === 'h') { A.ouvrirIndice(); return true; }
    if ((k === 'Delete' || k === 'Backspace') && choisi && !ligne(choisi)?.haut) { demonter(choisi); return true; }
    if (kl === 'l' && V.pince) {
      // L : retourne la flèche la plus proche au-dessus de la sélection.
      const f = formuleDe(V.pince.objet);
      let ch = V.pince.ch;
      while (ch.length && !estImp(en(f, ch))) ch = ch.slice(0, -1);
      if (estImp(en(f, ch))) { cycler(V.pince.objet, ch); if (V.pince) V.pince.ch = cheminDessineF(f, V.pince.ch, vuesDe(V.pince.objet, f), etat().capsules); rendre(); }
      return true;
    }
    return false;
  }

  function detruire() { fermerBulle(); fermerEditeur(); annulerGlisse(); }
  /** Une nouvelle commande, ou un établi remis à neuf : l'état de l'atelier repart de zéro. */
  function remettre() { V.pince = null; V.poste = null; V.cle = null; V.dernier = null; V.notice = 0; fermerEditeur(); fermerBulle(); }

  return { construire, rendre, clavier, detruire, remettre, essayer, V };
}
