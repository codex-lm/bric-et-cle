// Pose d'un objet : de la formule aux éléments à dessiner. Fonction pure, sans DOM, testée sous Node.
//
// Grammaire (choisie avec l'auteur) :
//   lettre  → pièce (couleur et forme)        « ou »  → losange entre ses deux côtés
//   « non » → trait épais devant ce qu'il nie  regroupement → plateau
//   A → B, c'est B ∨ ¬A (ordre du cours) : le losange suivi du trait forme une flèche.
//     vue « cours »   : B ◆━ [A]   flèche verte qui vise B, A posé sur la serrure
//     vue « lecture » : [A] ━◆ B   flèche rose, même formule lue de gauche à droite
//     vue « deboite » : B ◆ ━A     le « ou » et le « non » séparés
// Règle de la file : une flèche de même sens, du côté de B, ne prend pas de plateau
// (C ◆━[B] ◆━[A] se lit « C si B si A »). Partout ailleurs, un assemblage à deux côtés monte sur un plateau.
// La relecture lire() reconstruit la formule à partir des seuls éléments posés : les tests s'en servent
// pour garantir que deux formules différentes ne se dessinent jamais pareil.
import { replier } from '../../core/capsules.js';
import { lettre, nom, non, ou, estImp } from '../../core/formula.js';

export function metriques(u) {
  return { u, los: 0.64 * u, trait: 0.62 * u, hampe: 0.48 * u, traitH: 0.26 * u, g: 0.14 * u, pad: 0.2 * u, coffret: 1.5 * u };
}

/**
 * vues : { [chemin]: 'cours' | 'lecture' | 'deboite' } ; un chemin absent prend le sens par défaut (option sens).
 * Rend { w, h, els, noeuds } :
 *   els    : éléments en coordonnées absolues, fonds (plateaux, serrures) avant leur contenu ;
 *   noeuds : la boîte de chaque sous-formule dessinée {ch, f, x, y, w, h}, pour la pince.
 */
export function poser(f, { u = 20, vues = {}, capsules = [], ouvertes = null, sens: defaut = 'cours' } = {}) {
  const m = metriques(u);
  const loupe = new Set(Object.keys(vues).filter((c) => vues[c] === 'deboite'));
  const arbre = replier(f, { capsules, ouvertes, loupe });
  const sens = (v) => ((vues[v.ch] ?? defaut) === 'lecture' ? 'd' : 'g');
  const binaire = (v) => v.k === 'O' || v.k === 'I';

  // Une boîte relative : {w, h, els, noeuds}. On la décale en l'assemblant.
  const feuille = (el) => ({ w: el.w, h: el.h, els: [{ ...el, x: 0, y: 0 }], noeuds: [] });
  const decaler = (b, dx, dy) => ({
    els: b.els.map((e) => ({ ...e, x: e.x + dx, y: e.y + dy })),
    noeuds: b.noeuds.map((n) => ({ ...n, x: n.x + dx, y: n.y + dy })),
  });
  function rangee(parts) {
    const h = Math.max(...parts.map((p) => p.h));
    let x = 0;
    const els = [], noeuds = [];
    parts.forEach((p, i) => {
      if (i) x += m.g;
      const d = decaler(p, x, (h - p.h) / 2);
      els.push(...d.els); noeuds.push(...d.noeuds);
      x += p.w;
    });
    return { w: x, h, els, noeuds };
  }
  function bac(b, sorte, extra) {
    const w = b.w + 2 * m.pad, h = b.h + 2 * m.pad;
    const d = decaler(b, m.pad, m.pad);
    return { w, h, els: [{ sorte, x: 0, y: 0, w, h, ...extra }, ...d.els], noeuds: d.noeuds };
  }
  const noter = (b, v) => ({ ...b, noeuds: [...b.noeuds, { ch: v.ch, f: v.f, x: 0, y: 0, w: b.w, h: b.h }] });

  function go(v, prof) {
    switch (v.k) {
      case 'L': case 'V':
        return noter(feuille({ sorte: v.k === 'L' ? 'piece' : 'nom', w: u, h: u, ch: v.ch, n: v.n }), v);
      case 'C':
        return noter(feuille({ sorte: 'coffret', w: m.coffret, h: u, ch: v.ch, nom: v.nom }), v);
      case 'N': {
        const a = enfant(v.a, binaire(v.a), prof);
        return noter(rangee([feuille({ sorte: 'trait', w: m.trait, h: m.traitH, ch: v.ch }), a]), v);
      }
      case 'O': {
        const l = enfant(v.l, binaire(v.l), prof), r = enfant(v.r, binaire(v.r), prof);
        return noter(rangee([l, feuille({ sorte: 'losange', w: m.los, h: m.los, ch: v.ch, deboitee: estImp(v.f) }), r]), v);
      }
      case 'I': {
        const s = sens(v);
        const fileB = v.cons.k === 'I' && sens(v.cons) === s;
        const b = enfant(v.cons, binaire(v.cons) && !fileB, prof);
        const serrure = bac(go(v.ant, prof + 1), 'serrure', { ch: v.ant.ch, imp: v.ch, active: v.ch === '', prof });
        const fl = feuille({ sorte: 'fleche', w: m.los + m.hampe, h: m.los, ch: v.ch, sens: s });
        return noter(rangee(s === 'g' ? [b, fl, serrure] : [serrure, fl, b]), v);
      }
      default:
        throw new Error('nœud inconnu ' + v.k);
    }
  }
  function enfant(v, plateau, prof) {
    const b = go(v, prof + (plateau ? 1 : 0));
    return plateau ? bac(b, 'plateau', { ch: v.ch, prof }) : b;
  }

  // Une ligne entière repliée en capsule : un seul coffret.
  const b = go(arbre, 0);
  return { w: b.w, h: b.h, els: b.els, noeuds: b.noeuds, u };
}

/** La plus petite sous-formule dessinée sous le point (x, y), ou null. */
export function noeudEn(pose, x, y) {
  let best = null;
  for (const n of pose.noeuds) {
    if (x >= n.x && x <= n.x + n.w && y >= n.y && y <= n.y + n.h && (!best || n.w * n.h < best.w * best.h)) best = n;
  }
  return best;
}

/** Le nœud parent (le plus petit nœud qui contient strictement celui-ci). */
export function noeudParent(pose, ch) {
  const cands = pose.noeuds.filter((n) => n.ch !== ch && ch.startsWith(n.ch));
  return cands.sort((a, b) => b.ch.length - a.ch.length)[0] || null;
}

/**
 * Relecture : la formule reconstruite à partir des seuls éléments posés (sorte et géométrie).
 * Les coffrets se lisent par leur nom (parNom : nom → formule). Lève une erreur si le dessin est ambigu.
 */
export function lire(pose, parNom = new Map()) {
  const bacs = pose.els.filter((e) => e.sorte === 'plateau' || e.sorte === 'serrure');
  const dedans = (e, c) => e !== c && e.x >= c.x - 0.01 && e.y >= c.y - 0.01 && e.x + e.w <= c.x + c.w + 0.01 && e.y + e.h <= c.y + c.h + 0.01;
  const parent = new Map();
  for (const e of pose.els) {
    let p = null;
    for (const c of bacs) if (dedans(e, c) && (!p || c.w * c.h < p.w * p.h)) p = c;
    parent.set(e, p);
  }
  const enfants = (c) => pose.els.filter((e) => parent.get(e) === c).sort((a, b) => a.x - b.x);

  function rangee(toks) {
    let i = 0;
    const suiv = () => toks[i];
    function operande() {
      let k = 0;
      while (suiv() && suiv().sorte === 'trait') { k++; i++; }
      const t = toks[i++];
      if (!t) throw new Error('opérande manquant');
      let f;
      if (t.sorte === 'piece') f = lettre(t.n);
      else if (t.sorte === 'nom') f = nom(t.n);
      else if (t.sorte === 'coffret') { f = parNom.get(t.nom); if (f == null) throw new Error('coffret inconnu ' + t.nom); }
      else if (t.sorte === 'plateau') f = rangee(enfants(t));
      else throw new Error('opérande inattendu ' + t.sorte);
      while (k--) f = non(f);
      return f;
    }
    const serrure = () => {
      const t = toks[i++];
      if (!t || t.sorte !== 'serrure') throw new Error('serrure attendue');
      return rangee(enfants(t));
    };
    let f;
    if (toks.some((t) => t.sorte === 'fleche' && t.sens === 'd')) {
      // [A] ━◆ [A′] ━◆ … B : les flèches roses se lisent de droite à gauche.
      const ants = [];
      while (suiv() && suiv().sorte === 'serrure') {
        ants.push(serrure());
        const fl = toks[i++];
        if (!fl || fl.sorte !== 'fleche' || fl.sens !== 'd') throw new Error('flèche rose attendue');
      }
      f = operande();
      while (ants.length) f = ou(f, non(ants.pop()));
    } else {
      f = operande();
      while (i < toks.length) {
        const t = toks[i++];
        if (t.sorte === 'fleche' && t.sens === 'g') f = ou(f, non(serrure()));
        else if (t.sorte === 'losange') { f = ou(f, operande()); if (i < toks.length) throw new Error('losange suivi de trop'); }
        else throw new Error('jeton inattendu ' + t.sorte);
      }
    }
    if (i !== toks.length) throw new Error('jetons en trop');
    return f;
  }
  return rangee(enfants(null));
}
