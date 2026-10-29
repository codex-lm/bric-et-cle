// La feuille : des lignes justifiées. Le noyau seul décide de ce qui s'y écrit.
//
// Ligne : { id, f, just }
// just : {type:'axiome', ax} | {type:'theoreme', ref} | {type:'premisse', i}
//      | {type:'copier', de} | {type:'substituer', de, sigma}
//      | {type:'mp', a, imp} | {type:'boite', thm, entrees, molettes}
//      | {type:'regle', regle, entrees}
//
// ctx (la bibliothèque du niveau) : { theoremes: {ref: {f, ports, preuve}}, regles: {nom: {premisses, conclusion, modele}}, premisses: [f] }
import { AXIOMES, mp, boite, regle } from './rules.js';
import { substituer } from './subst.js';

/** Calcule la formule qu'une justification écrit, ou un diagnostic. lire(id) rend la formule d'une ligne visible. */
export function calculer(just, lire, ctx) {
  const ref = (id) => {
    const f = lire(id);
    if (f === undefined) throw new RefManquante(id);
    return f;
  };
  try {
    switch (just.type) {
      case 'axiome':
        return AXIOMES[just.ax] !== undefined ? { ok: true, sortie: AXIOMES[just.ax] } : { ok: false, diag: { type: 'inconnu' } };
      case 'theoreme': {
        const t = ctx.theoremes && ctx.theoremes[just.ref];
        return t ? { ok: true, sortie: t.f } : { ok: false, diag: { type: 'inconnu' } };
      }
      case 'premisse': {
        const p = ctx.premisses && ctx.premisses[just.i || 0];
        return p !== undefined ? { ok: true, sortie: p } : { ok: false, diag: { type: 'inconnu' } };
      }
      case 'copier':
        return { ok: true, sortie: ref(just.de) };
      case 'substituer':
        return { ok: true, sortie: substituer(ref(just.de), just.sigma || {}) };
      case 'mp':
        return mp(ref(just.a), ref(just.imp));
      case 'boite': {
        const t = ctx.theoremes && ctx.theoremes[just.thm];
        if (!t) return { ok: false, diag: { type: 'inconnu' } };
        return boite(t.f, just.entrees.map(ref), just.molettes || {}, t.ports);
      }
      case 'regle': {
        const r = ctx.regles && ctx.regles[just.regle];
        if (!r) return { ok: false, diag: { type: 'inconnu' } };
        return regle(r, just.entrees.map(ref));
      }
      default:
        return { ok: false, diag: { type: 'inconnu' } };
    }
  } catch (e) {
    if (e instanceof RefManquante) return { ok: false, diag: { type: 'reference', id: e.id } };
    throw e;
  }
}

class RefManquante extends Error {
  constructor(id) { super('référence manquante ' + id); this.id = id; }
}

/** Références d'une justification (les lignes qu'elle lit). */
export function references(just) {
  switch (just.type) {
    case 'copier': case 'substituer': return [just.de];
    case 'mp': return [just.a, just.imp];
    case 'boite': case 'regle': return just.entrees.slice();
    default: return [];
  }
}

/** Une feuille vide, avec son haut. haut : [{id, just}] ; les formules sont calculées par le noyau. */
export function nouvelleFeuille(haut, ctx) {
  const lignes = [];
  for (const h of haut) {
    const r = calculer(h.just, () => undefined, ctx);
    if (!r.ok) throw new Error('ligne du haut invalide : ' + h.id);
    lignes.push({ id: h.id, f: r.sortie, just: h.just, haut: true });
  }
  return { haut: lignes, lignes: [] };
}

export function lecteur(feuille) {
  const m = new Map();
  for (const l of feuille.haut) m.set(l.id, l.f);
  for (const l of feuille.lignes) m.set(l.id, l.f);
  return (id) => m.get(id);
}

/** Essaie d'écrire une ligne. Rend {ok, feuille, ligne} ou {ok:false, diag}. Ne modifie pas la feuille reçue. */
export function ajouter(feuille, id, just, ctx) {
  const r = calculer(just, lecteur(feuille), ctx);
  if (!r.ok) return r;
  const ligne = { id, f: r.sortie, just };
  return { ok: true, feuille: { haut: feuille.haut, lignes: [...feuille.lignes, ligne] }, ligne, info: r };
}
