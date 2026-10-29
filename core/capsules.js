// Capsules : des noms donnés à des formules, pour l'affichage seulement.
// replier() construit l'arbre d'affichage d'une formule : chaque occurrence du contenu d'une capsule
// active devient une pastille. La formule elle-même ne change jamais.
import { nd, estImp, antecedent } from './formula.js';

/**
 * Arbre d'affichage. Nœud : {f, ch, k, ...}
 *   k 'C' : pastille {nom} ; 'L'/'V' : lettre ou nom {n} ; 'N' : {a} ; 'I' : implication {ant, cons} ; 'O' : disjonction {l, r}
 * capsules : [{nom, f, auto}] ; ouvertes : ensemble de chemins dépliés à la main ; loupe : ensemble de chemins lus en ∨¬.
 * Deux sous-arbres sont emboîtés ou disjoints : en parcourant de haut en bas, la plus grande capsule l'emporte.
 */
export function replier(f, { capsules = [], ouvertes = null, loupe = null, sauf = null } = {}) {
  const parF = new Map();
  for (const c of capsules) if (c.auto !== false && c.f !== sauf) parF.set(c.f, c);
  function go(x, ch, racine) {
    const cap = parF.get(x);
    if (cap && !racine && !(ouvertes && ouvertes.has(ch))) return { f: x, ch, k: 'C', nom: cap.nom };
    const n = nd(x);
    if (n.k === 'L' || n.k === 'V') return { f: x, ch, k: n.k, n: n.n };
    if (n.k === 'N') return { f: x, ch, k: 'N', a: go(n.a, ch + 'a', false) };
    if (estImp(x) && !(loupe && loupe.has(ch))) {
      return { f: x, ch, k: 'I', ant: go(antecedent(x), ch + 'ra', false), cons: go(n.l, ch + 'l', false) };
    }
    return { f: x, ch, k: 'O', l: go(n.l, ch + 'l', false), r: go(n.r, ch + 'r', false) };
  }
  // Une ligne entière égale à une capsule se replie aussi.
  const v = go(f, '', true);
  const top = parF.get(f);
  if (top && !(ouvertes && ouvertes.has(''))) return { f, ch: '', k: 'C', nom: top.nom, dessous: v };
  return v;
}

/** Reconstruit la formule à partir de l'arbre d'affichage, en ouvrant chaque pastille. */
export function reconstruire(vue, capsules, constructeurs) {
  const { lettre, nom, non, ou, imp } = constructeurs;
  const parNom = new Map(capsules.map((c) => [c.nom, c.f]));
  const go = (v) => {
    switch (v.k) {
      case 'C': return parNom.get(v.nom);
      case 'L': return lettre(v.n);
      case 'V': return nom(v.n);
      case 'N': return non(go(v.a));
      case 'I': return imp(go(v.ant), go(v.cons));
      default: return ou(go(v.l), go(v.r));
    }
  };
  return go(vue);
}

/** Prochain nom de capsule libre : X, Y, Z, puis X₁, Y₁… en évitant les noms pris et les lettres du niveau. */
export function nomLibre(pris) {
  const base = ['X', 'Y', 'Z', 'U', 'V', 'W'];
  const ind = ['', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  for (const i of ind) for (const b of base) if (!pris.has(b + i)) return b + i;
  return 'X' + Date.now() % 1000;
}
