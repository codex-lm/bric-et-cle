// Les règles du jeu : axiomes, modus ponens, boîtes de théorèmes, règles dérivées.
// Chaque fonction est pure et rend soit une sortie, soit un diagnostic lisible.
import { parse, nd, estImp, antecedent, consequent, en, lettres, lettre } from './formula.js';
import { substituer, substituerNoms } from './subst.js';
import { filtrerDiag, divergence } from './match.js';

/** Les quatre axiomes, tels qu'en 1.2. */
export const AXIOMES = {
  AL1: parse('(R v R) -> R'),
  AL2: parse('R -> (R v S)'),
  AL3: parse('(R v S) -> (S v R)'),
  AL4: parse('(R -> S) -> ((R v T) -> (S v T))'),
};

/** Antécédents épluchés de l'extérieur vers l'intérieur : a₁ → (a₂ → (… → c)), au plus max. */
export function antecedents(f, max = Infinity) {
  const out = [];
  let x = f;
  while (estImp(x) && out.length < max) { out.push(antecedent(x)); x = consequent(x); }
  return out;
}

/** Ce qui reste après avoir épluché k antécédents. */
export function reste(f, k) {
  let x = f;
  for (let i = 0; i < k; i++) x = consequent(x);
  return x;
}

/**
 * Modus ponens : de A (port A) et de A′ → B (port A → B), si A = A′, écrire B.
 * Diagnostics : {type:'pasImplication'} ou {type:'antecedent', chemin, attendu, branche}.
 */
export function mp(a, implication) {
  if (a == null || implication == null) return { ok: false, diag: { type: 'incomplet' } };
  if (!estImp(implication)) return { ok: false, diag: { type: 'pasImplication', f: implication } };
  const ant = antecedent(implication);
  if (ant === a) return { ok: true, sortie: consequent(implication) };
  const chemin = divergence(ant, a);
  return {
    ok: false,
    diag: { type: 'antecedent', chemin, attendu: ant, branche: a, sousAttendu: en(ant, chemin), sousBranche: en(a, chemin) },
  };
}

/**
 * Boîte d'un théorème T (sa forme méta). Les k premiers ports sont branchés sur les lignes `entrees`.
 * Le noyau trouve seul σ tel que σ(aᵢ) = Lᵢ ; les lettres de T non fixées par les ports sont des molettes.
 * Intérieur : Sub(T)[σ], puis k modus ponens.
 */
export function boite(T, entrees, molettes = {}, ports = Infinity) {
  const ants = antecedents(T, ports);
  const k = entrees.length;
  if (k === 0) return { ok: false, diag: { type: 'incomplet' } };
  if (k > ants.length) return { ok: false, diag: { type: 'tropDePorts' } };
  let sigma = {};
  for (let i = 0; i < k; i++) {
    if (entrees[i] == null) return { ok: false, diag: { type: 'portVide', port: i } };
    const r = filtrerDiag(ants[i], entrees[i], sigma, 'L');
    if (!r.ok) return { ok: false, diag: { type: 'port', port: i, ...r } };
    sigma = r.sigma;
  }
  const libres = lettresLibres(T, k);
  for (const x of libres) sigma[x] = molettes[x] != null ? molettes[x] : lettre(x);
  return { ok: true, sortie: substituer(reste(T, k), sigma), sigma, libres, k };
}

/** Lettres de T qui n'apparaissent dans aucun des k premiers antécédents : les molettes de la boîte. */
export function lettresLibres(T, k) {
  const fixees = new Set();
  antecedents(T).slice(0, k).forEach((a) => lettres(a).forEach((x) => fixees.add(x)));
  return lettres(T).filter((x) => !fixees.has(x));
}

/**
 * Règle dérivée (prélemme par cas) : ses prémisses et sa conclusion sont écrites en noms.
 * On filtre chaque entrée contre sa prémisse pour trouver la valeur de chaque nom.
 */
export function regle(R, entrees) {
  if (entrees.length !== R.premisses.length || entrees.some((e) => e == null)) return { ok: false, diag: { type: 'incomplet' } };
  let nu = {};
  for (let i = 0; i < entrees.length; i++) {
    const r = filtrerDiag(R.premisses[i], entrees[i], nu, 'V');
    if (!r.ok) return { ok: false, diag: { type: 'port', port: i, ...r } };
    nu = r.sigma;
  }
  return { ok: true, sortie: substituerNoms(R.conclusion, nu), nu };
}

/** Vrai si, ports tous branchés, la sortie est toujours la première entrée (comme TL2) : pas de boîte. */
export function boiteInutile(T) {
  const ants = antecedents(T);
  return ants.length === 0 || (ants.length === 1 && ants[0] === reste(T, 1));
}
