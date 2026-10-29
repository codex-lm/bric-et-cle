// Formules en blocs : chaque sous-formule est un <span class="n" data-ch="chemin">.
// Lettres : douilles colorées (couleur + motif) ; capsules : pastilles violettes ; noms : pointillés.
import { replier } from '../core/capsules.js';
import { lettres as lettresDe, texte } from '../core/formula.js';
import { formeCSS } from './assets.js';

// ---------------------------------------------------------------- couleurs des lettres
// R, S, T fixes pour tout le jeu ; les autres dans l'ordre d'apparition du niveau. R₁ garde la teinte de R, rayée.
const FIXES = { R: 0, S: 1, T: 2 };
let attribuees = new Map();
let prochain = 3;

export function definirCouleurs(ordre) {
  attribuees = new Map();
  prochain = 3;
  ordre.forEach((l) => indiceCouleur(l));
}
const base = (n) => n.replace(/[₀-₉]+$/, '');
export function indiceCouleur(n) {
  const b = base(n);
  if (FIXES[b] !== undefined) return FIXES[b];
  if (!attribuees.has(b)) attribuees.set(b, prochain++);
  return attribuees.get(b);
}
export const couleurVar = (n) => `var(--l${indiceCouleur(n) % 12})`;
export const styleLettre = (n) => `--c:${couleurVar(n)};--forme:${formeCSS(indiceCouleur(n))}`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * HTML d'une formule.
 * opts : capsules, loupe (Set), ouvertes (Set), provenance (Map chemin → lettre), sauf (formule à ne pas replier),
 *        racineParens (bool), classe.
 */
export function htmlFormule(f, opts = {}) {
  const capsParNom = new Map((opts.capsules || []).map((c) => [c.nom, c]));
  const vue = replier(f, { capsules: opts.capsules, ouvertes: opts.ouvertes, loupe: opts.loupe, sauf: opts.sauf });
  const prov = opts.provenance || null;
  function cls(ch, extra) {
    let c = 'n' + (extra ? ' ' + extra : '');
    let st = '';
    if (prov && prov.has(ch)) { c += ' prov'; st = ` style="--pc:${couleurVar(prov.get(ch))}"`; }
    return [c, st];
  }
  function go(v, racine) {
    const ch = esc(v.ch);
    switch (v.k) {
      case 'C': {
        const cap = capsParNom.get(v.nom);
        const badges = cap ? lettresDe(cap.f).map((l) => `<i class="badge" style="--c:${couleurVar(l)}"></i>`).join('') : '';
        const [c, st] = cls(v.ch, 'cap');
        return `<span class="${c}" data-ch="${ch}" data-nom="${esc(v.nom)}"${st}>${esc(v.nom)}<span class="badges">${badges}</span></span>`;
      }
      case 'L': {
        const [c, st] = cls(v.ch, 'let' + (/[₀-₉]$/.test(v.n) ? ' indice' : ''));
        const style = st ? st.slice(0, -1) + ';' + styleLettre(v.n) + '"' : ` style="${styleLettre(v.n)}"`;
        return `<span class="${c}" data-ch="${ch}" data-l="${esc(v.n)}"${style}>${esc(v.n)}</span>`;
      }
      case 'V': {
        const [c, st] = cls(v.ch, 'nom-v');
        return `<span class="${c}" data-ch="${ch}"${st}>${esc(v.n)}</span>`;
      }
      case 'N': {
        const [c, st] = cls(v.ch);
        return `<span class="${c}" data-ch="${ch}"${st}><span class="op neg">¬</span>${go(v.a, false)}</span>`;
      }
      case 'I': {
        const [c, st] = cls(v.ch);
        const o = racine && !opts.racineParens ? '' : '<span class="par">(</span>';
        const fm = racine && !opts.racineParens ? '' : '<span class="par">)</span>';
        return `<span class="${c}" data-ch="${ch}"${st}>${o}${go(v.ant, false)}<span class="op imp" data-loupe="${ch}">→</span><wbr>${go(v.cons, false)}${fm}</span>`;
      }
      default: {
        const [c, st] = cls(v.ch);
        const o = racine && !opts.racineParens ? '' : '<span class="par">(</span>';
        const fm = racine && !opts.racineParens ? '' : '<span class="par">)</span>';
        const estImpLu = opts.loupe && opts.loupe.has(v.ch);
        return `<span class="${c}" data-ch="${ch}"${st}>${o}${go(v.l, false)}<span class="op ou${estImpLu ? ' ou-imp' : ''}"${estImpLu ? ` data-loupe="${ch}"` : ''}>∨</span><wbr>${go(v.r, false)}${fm}</span>`;
      }
    }
  }
  // Une ligne entière égale à une capsule : on montre la pastille.
  return `<span class="formule${opts.classe ? ' ' + opts.classe : ''}">${go(vue, true)}</span>`;
}

/** Élément DOM d'une formule. */
export function elFormule(f, opts) {
  const t = document.createElement('template');
  t.innerHTML = htmlFormule(f, opts);
  return t.content.firstElementChild;
}

/** L'élément affiché le plus proche d'un chemin (le chemin, ou son plus long préfixe affiché). */
export function elementAuChemin(racine, ch) {
  for (let k = ch.length; k >= 0; k--) {
    const el = racine.querySelector(`[data-ch="${CSS.escape(ch.slice(0, k))}"]`);
    if (el) return el;
  }
  return null;
}

/** Texte lisible pour les messages (avec capsules). */
export function texteCourt(f, capsules) {
  const vue = replier(f, { capsules });
  const go = (v, racine) => {
    switch (v.k) {
      case 'C': return v.nom;
      case 'L': case 'V': return v.n;
      case 'N': return '¬' + go(v.a, false);
      case 'I': { const s = go(v.ant, false) + ' → ' + go(v.cons, false); return racine ? s : '(' + s + ')'; }
      default: { const s = go(v.l, false) + ' ∨ ' + go(v.r, false); return racine ? s : '(' + s + ')'; }
    }
  };
  return go(vue, true);
}
export { texte };
