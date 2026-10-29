// Substitution uniforme, simultanée et partielle.
// σ parcourt l'arbre d'origine une seule fois : les valeurs insérées ne sont jamais reparcourues.
// Une substitution de lettres ne touche jamais un nom, et réciproquement.
import { nd, non, ou } from './formula.js';

function remplacer(f, sigma, sorte) {
  const memo = new Map();
  const go = (x) => {
    let r = memo.get(x);
    if (r !== undefined) return r;
    const n = nd(x);
    if (n.k === sorte) r = Object.hasOwn(sigma, n.n) && sigma[n.n] != null ? sigma[n.n] : x;
    else if (n.k === 'N') r = non(go(n.a));
    else if (n.k === 'O') r = ou(go(n.l), go(n.r));
    else r = x;
    memo.set(x, r);
    return r;
  };
  return go(f);
}

/** σ(f) : remplace les lettres. sigma : { R: formule, ... } ; une valeur absente ou nulle vaut l'identité. */
export const substituer = (f, sigma) => remplacer(f, sigma, 'L');

/** ν(f) : remplace les noms (instanciation d'une règle). */
export const substituerNoms = (f, nu) => remplacer(f, nu, 'V');

/** Composition : (σ ∘ τ)(x) = σ(τ(x)) pour x dans τ, σ(x) sinon. */
export function composer(sigma, tau) {
  const out = {};
  for (const x of Object.keys(sigma)) if (sigma[x] != null) out[x] = sigma[x];
  for (const x of Object.keys(tau)) if (tau[x] != null) out[x] = substituer(tau[x], sigma);
  return out;
}

/** Retire les entrées identité (R := R) et les valeurs nulles. */
export function nettoyer(sigma, lettre) {
  const out = {};
  for (const x of Object.keys(sigma)) if (sigma[x] != null && sigma[x] !== lettre(x)) out[x] = sigma[x];
  return out;
}
