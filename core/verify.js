// Vérificateur local et dépliage complet.
// verifier() ne fait confiance à aucun état de l'interface : il recalcule chaque ligne.
// deplier() remplace chaque boîte, règle et théorème importé par sa preuve, récursivement,
// jusqu'à ne laisser que des axiomes, des substitutions, des modus ponens et des prémisses.
import { calculer, references } from './sheet.js';
import { AXIOMES } from './rules.js';
import { substituer, substituerNoms } from './subst.js';
import { filtrer } from './match.js';
import { consequent } from './formula.js';

/** Un verdict par ligne et un verdict global. */
export function verifier(feuille, ctx) {
  const vues = new Map();
  const verdicts = [];
  const lire = (id) => vues.get(id);
  for (const l of [...feuille.haut, ...feuille.lignes]) {
    const refs = references(l.just);
    const manquante = refs.find((id) => !vues.has(id));
    if (manquante !== undefined) {
      verdicts.push({ id: l.id, ok: false, raison: 'reference', ref: manquante });
      continue;
    }
    const r = calculer(l.just, lire, ctx);
    if (!r.ok) verdicts.push({ id: l.id, ok: false, raison: 'refus', diag: r.diag });
    else if (r.sortie !== l.f) verdicts.push({ id: l.id, ok: false, raison: 'formule' });
    else { verdicts.push({ id: l.id, ok: true }); vues.set(l.id, l.f); }
  }
  return { ok: verdicts.every((v) => v.ok), verdicts };
}

/** Preuve plate en construction. Une formule n'y est écrite qu'une fois. */
export class Plat {
  constructor() { this.lignes = []; this.parF = new Map(); }
  pousser(f, just) {
    const i = this.parF.get(f);
    if (i !== undefined) return i;
    this.lignes.push({ f, just });
    this.parF.set(f, this.lignes.length - 1);
    return this.lignes.length - 1;
  }
}

/**
 * Déplie une feuille dans `plat`. Rend la table id de ligne → indice dans la preuve plate.
 * memo : théorème → indice, partagé entre les appels pour ne déplier chaque preuve qu'une fois.
 */
export function deplier(feuille, ctx, plat = new Plat(), memo = new Map()) {
  const idx = new Map();
  const thm = (ref) => {
    if (memo.has(ref)) return memo.get(ref);
    const t = ctx.theoremes[ref];
    if (!t || !t.preuve) throw new Error('preuve absente pour ' + ref);
    const sous = deplier(t.preuve.feuille, ctx, plat, memo);
    const i = sous.get(t.preuve.ligne);
    if (plat.lignes[i].f !== t.f) throw new Error('la preuve de ' + ref + ' ne conclut pas');
    memo.set(ref, i);
    return i;
  };
  const ax = (nom) => plat.pousser(AXIOMES[nom], { type: 'axiome', ax: nom });
  for (const l of [...feuille.haut, ...feuille.lignes]) {
    const j = l.just;
    let i;
    switch (j.type) {
      case 'axiome': i = ax(j.ax); break;
      case 'theoreme': i = thm(j.ref); break;
      case 'premisse': i = plat.pousser(l.f, { type: 'premisse', i: j.i || 0 }); break;
      case 'copier': i = idx.get(j.de); break;
      case 'substituer': i = plat.pousser(l.f, { type: 'substituer', de: idx.get(j.de), sigma: j.sigma || {} }); break;
      case 'mp': i = plat.pousser(l.f, { type: 'mp', a: idx.get(j.a), imp: idx.get(j.imp) }); break;
      case 'boite': {
        // Intérieur d'une boîte : Sub(T)[σ], puis k modus ponens.
        const t = ctx.theoremes[j.thm];
        const lire = (id) => plat.lignes[idx.get(id)].f;
        const r = calculer(j, lire, ctx);
        if (!r.ok) throw new Error('boîte refusée au dépliage');
        let cur = plat.pousser(substituer(t.f, r.sigma), { type: 'substituer', de: thm(j.thm), sigma: r.sigma });
        for (const e of j.entrees) {
          const impF = plat.lignes[cur].f;
          cur = plat.pousser(consequent(impF), { type: 'mp', a: idx.get(e), imp: cur });
        }
        i = cur;
        break;
      }
      case 'regle': {
        const R = ctx.regles[j.regle];
        const entrees = j.entrees.map((e) => idx.get(e));
        i = instancierModele(R, entrees, plat);
        break;
      }
      default: throw new Error('justification inconnue ' + j.type);
    }
    if (i === undefined) throw new Error('dépliage impossible à la ligne ' + l.id);
    idx.set(l.id, i);
  }
  return idx;
}

/**
 * Instancie le modèle d'une règle (une preuve sans substitution, écrite en noms) :
 * on trouve la valeur ν de chaque nom en filtrant les entrées, puis on applique ν à chaque ligne.
 * Les instances d'axiomes restent des instances, les modus ponens restent des modus ponens.
 */
export function instancierModele(R, entreesIdx, plat) {
  let nu = {};
  R.premisses.forEach((p, k) => {
    nu = filtrer(p, plat.lignes[entreesIdx[k]].f, nu, 'V');
    if (!nu) throw new Error('entrée de règle invalide');
  });
  const map = [];
  R.modele.forEach((l, k) => {
    const f = substituerNoms(l.f, nu);
    const j = l.just;
    if (j.type === 'instance') {
      const sigma = {};
      for (const x of Object.keys(j.sigma)) sigma[x] = substituerNoms(j.sigma[x], nu);
      const a = plat.pousser(AXIOMES[j.ax], { type: 'axiome', ax: j.ax });
      map[k] = plat.pousser(f, { type: 'substituer', de: a, sigma });
    } else if (j.type === 'premisse') {
      map[k] = entreesIdx[j.i || 0];
    } else {
      map[k] = plat.pousser(f, { type: 'mp', a: map[j.a], imp: map[j.imp] });
    }
  });
  return map[R.modele.length - 1];
}

/** Lignes de la preuve plate nécessaires à la ligne i (dans l'ordre). */
export function necessaires(plat, i) {
  const garde = new Set();
  const pile = [i];
  while (pile.length) {
    const k = pile.pop();
    if (garde.has(k)) continue;
    garde.add(k);
    const j = plat.lignes[k].just;
    if (j.type === 'substituer') pile.push(j.de);
    if (j.type === 'mp') pile.push(j.a, j.imp);
  }
  return [...garde].sort((a, b) => a - b);
}

/** Longueur dépliée d'une ligne : axiomes, substitutions et modus ponens. */
export function longueurDepliee(feuille, ctx, id) {
  const plat = new Plat();
  const idx = deplier(feuille, ctx, plat);
  return necessaires(plat, idx.get(id)).length;
}
