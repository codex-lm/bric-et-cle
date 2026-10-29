// Chargement des niveaux, bibliothèque de chaque niveau, rejeu des solutions.
//
// Une solution est une liste de pas, au format des fichiers de niveaux :
//   {substituer: ref, sigma: {R: "texte"}} | {copier: ref} | {mp: [refA, refImp]}
//   {boite: "TL0", entrees: [ref...], molettes: {R: "texte"}} | {regle: "prelemme", entrees: [ref...]}
// ref : un numéro de ligne écrite (1, 2…) ou le nom d'une ligne du haut ("AL1", "TL0", "P1").
import { parse, ascii } from './formula.js';
import { nouvelleFeuille, ajouter } from './sheet.js';
import { deplier, Plat, necessaires } from './verify.js';
import { eliminerSubstitution } from './godement.js';
import { antecedents } from './rules.js';

export function preparerChapitre(json) {
  const theoremes = {};
  for (const [ref, t] of Object.entries(json.theoremes)) {
    theoremes[ref] = { ref, f: parse(t.enonce), enonce: t.enonce, nom: t.nom, boite: t.boite, surnom: t.surnom, ports: t.ports ?? Infinity };
  }
  const regles = {};
  for (const [ref, r] of Object.entries(json.regles || {})) {
    const o = { noms: r.noms };
    regles[ref] = {
      ref, nom: r.nom, surnom: r.surnom, niveau: r.niveau, noms: r.noms,
      premisses: r.premisses.map((p) => parse(p, o)), conclusion: parse(r.conclusion, o),
    };
  }
  const niveaux = json.niveaux.map((n, index) => ({
    ...n, index,
    cibleF: parse(n.cible, { noms: n.noms }),
    premissesF: (n.premisses || []).map((p) => parse(p, { noms: n.noms })),
  }));
  for (const n of niveaux) {
    if (n.debloque && n.debloque.theoreme) theoremes[n.debloque.theoreme].niveau = n.id;
  }
  return { titre: json.titre, theoremes, regles, niveaux, preuvesJoueur: {}, _cache: new Map() };
}

export const niveauParId = (chap, id) => chap.niveaux.find((n) => n.id === id);

/** Lignes du haut d'un niveau : [{id, just}]. */
export function hautDe(niveau) {
  return niveau.haut.map((id) => {
    if (/^AL[1-4]$/.test(id)) return { id, just: { type: 'axiome', ax: id } };
    if (/^P\d+$/.test(id)) return { id, just: { type: 'premisse', i: +id.slice(1) - 1 } };
    return { id, just: { type: 'theoreme', ref: id } };
  });
}

/** Théorèmes et règles débloqués avant ce niveau. */
export function debloques(chap, niveau) {
  const thms = [], regles = [];
  for (const n of chap.niveaux.slice(0, niveau.index)) {
    if (!n.debloque) continue;
    if (n.debloque.theoreme) thms.push(n.debloque.theoreme);
    if (n.debloque.regle) regles.push(n.debloque.regle);
  }
  return { thms, regles };
}

/** La bibliothèque d'un niveau : théorèmes (avec preuve), règles (avec modèle), prémisses. */
export function contexte(chap, niveau) {
  const cle = 'ctx:' + niveau.id;
  if (chap._cache.has(cle)) return chap._cache.get(cle);
  const ctx = { theoremes: {}, regles: {}, premisses: niveau.premissesF };
  const { thms, regles } = debloques(chap, niveau);
  for (const ref of thms) {
    const t = chap.theoremes[ref];
    const nivT = niveauParId(chap, t.niveau);
    ctx.theoremes[ref] = { ref, f: t.f, nom: t.nom, boite: t.boite, ports: t.ports, get preuve() { return preuve(chap, nivT); } };
  }
  // Les théorèmes absents du haut restent utilisables comme boîtes s'ils sont dans l'inventaire.
  for (const ref of regles) {
    const R = chap.regles[ref];
    ctx.regles[ref] = { ...R, get modele() { return modele(chap, R).lignes; }, get fin() { return modele(chap, R).fin; } };
  }
  chap._cache.set(cle, ctx);
  return ctx;
}

/** Traduit un pas de solution en justification. */
export function justDe(pas, ids, niveau, brut = false) {
  const ref = (x) => (typeof x === 'number' ? ids[x - 1] : x);
  // Texte brut (sauvegarde) : les noms y sont marqués @X. Texte de niveau : les noms du niveau sont des noms.
  const o = brut ? {} : { noms: niveau.noms };
  const formules = (m) => Object.fromEntries(Object.entries(m || {}).map(([k, v]) => [k, parse(v, o)]));
  if (pas.substituer !== undefined) return { type: 'substituer', de: ref(pas.substituer), sigma: formules(pas.sigma) };
  if (pas.copier !== undefined) return { type: 'copier', de: ref(pas.copier) };
  if (pas.mp !== undefined) return { type: 'mp', a: ref(pas.mp[0]), imp: ref(pas.mp[1]) };
  if (pas.boite !== undefined) return { type: 'boite', thm: pas.boite, entrees: pas.entrees.map(ref), molettes: formules(pas.molettes) };
  if (pas.regle !== undefined) return { type: 'regle', regle: pas.regle, entrees: pas.entrees.map(ref) };
  throw new Error('pas inconnu');
}

/** Rejoue une solution. Rend {feuille, ids} ou lève une erreur au premier refus. */
export function jouer(chap, niveau, solution, ctx = contexte(chap, niveau), brut = false) {
  let feuille = nouvelleFeuille(hautDe(niveau), ctx);
  const ids = [];
  solution.forEach((pas, k) => {
    const id = '#' + (k + 1);
    const r = ajouter(feuille, id, justDe(pas, ids, niveau, brut), ctx);
    if (!r.ok) throw new Error(`${niveau.id}, ligne ${k + 1} refusée : ${JSON.stringify(r.diag)}`);
    feuille = r.feuille;
    ids.push(id);
  });
  return { feuille, ids };
}

/** Une feuille, réécrite au format solution (pour la sauvegarde). Les lignes sont numérotées dans l'ordre. */
export function versSolution(feuille) {
  const num = new Map(feuille.lignes.map((l, k) => [l.id, k + 1]));
  const ref = (id) => (num.has(id) ? num.get(id) : id);
  const txt = (m) => Object.fromEntries(Object.entries(m || {}).filter(([, v]) => v != null).map(([k, v]) => [k, ascii(v)]));
  return feuille.lignes.map((l) => {
    const j = l.just;
    switch (j.type) {
      case 'substituer': return { substituer: ref(j.de), sigma: txt(j.sigma) };
      case 'copier': return { copier: ref(j.de) };
      case 'mp': return { mp: [ref(j.a), ref(j.imp)] };
      case 'boite': return { boite: j.thm, entrees: j.entrees.map(ref), molettes: txt(j.molettes) };
      case 'regle': return { regle: j.regle, entrees: j.entrees.map(ref) };
      default: throw new Error('ligne non sérialisable');
    }
  });
}

/** La preuve d'un niveau : celle du joueur si elle est enregistrée et valide, sinon la solution de référence. */
export function preuve(chap, niveau) {
  const cle = 'preuve:' + niveau.id;
  if (chap._cache.has(cle)) return chap._cache.get(cle);
  const ctx = contexte(chap, niveau);
  let res = null;
  const sol = chap.preuvesJoueur[niveau.id];
  if (sol) {
    try {
      const { feuille } = jouer(chap, niveau, sol, ctx, true);
      const l = feuille.lignes.find((x) => x.f === niveau.cibleF);
      if (l) res = { feuille, ligne: l.id, ctx, source: 'joueur' };
    } catch { /* preuve abîmée : on retombe sur la référence */ }
  }
  if (!res && niveau.reference) {
    const { feuille } = jouer(chap, niveau, niveau.reference, ctx);
    const l = feuille.lignes.find((x) => x.f === niveau.cibleF);
    res = { feuille, ligne: l.id, ctx, source: 'reference' };
  }
  chap._cache.set(cle, res);
  return res;
}

/** Enregistre la preuve gagnante du joueur (format solution) ; vide les caches qui en dépendent. */
export function definirPreuveJoueur(chap, niveauId, solution) {
  chap.preuvesJoueur[niveauId] = solution;
  chap._cache.clear();
}

/** Le modèle d'une règle : la preuve de son niveau, dépliée puis sans substitution. */
export function modele(chap, R) {
  const cle = 'modele:' + R.ref;
  if (chap._cache.has(cle)) return chap._cache.get(cle);
  const p = preuve(chap, niveauParId(chap, R.niveau));
  const plat = new Plat();
  const idx = deplier(p.feuille, p.ctx, plat);
  const G = eliminerSubstitution(plat, idx.get(p.ligne));
  chap._cache.set(cle, G);
  return G;
}

/** Longueur entièrement dépliée de la preuve d'un théorème (en axiomes, substitutions et MP). */
export function longueurTheoreme(chap, ref) {
  const cle = 'long:' + ref;
  if (chap._cache.has(cle)) return chap._cache.get(cle);
  const t = chap.theoremes[ref];
  const p = preuve(chap, niveauParId(chap, t.niveau));
  const plat = new Plat();
  const idx = deplier(p.feuille, p.ctx, plat);
  const n = necessaires(plat, idx.get(p.ligne)).length;
  chap._cache.set(cle, n);
  return n;
}

/** Nombre de ports d'une machine. */
export function nbPorts(chap, sorte, ref) {
  if (sorte === 'copier' || sorte === 'substituer') return 1;
  if (sorte === 'mp') return 2;
  if (sorte === 'boite') return antecedents(chap.theoremes[ref].f, chap.theoremes[ref].ports).length;
  if (sorte === 'regle') return chap.regles[ref].premisses.length;
  return 0;
}
