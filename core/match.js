// Filtrage à sens unique : trouver σ tel que σ(motif) = f.
// Les variables du motif sont ses lettres (boîtes de théorèmes) ou ses noms (règles).
// Le parcours suit l'ordre de lecture affiché : le premier désaccord trouvé est
// celui que le joueur lit en premier.
import { nd, estImp } from './formula.js';

/**
 * @returns {{ok:true, sigma}} ou
 *   {{ok:false, raison:'forme', chemin, attendu, recu}} (motif et formule n'ont pas la même forme), ou
 *   {{ok:false, raison:'conflit', chemin, variable, v1, v2}} (deux valeurs pour la même variable).
 */
export function filtrerDiag(motif, f, sigma0 = {}, variables = 'L') {
  const sigma = { ...sigma0 };
  let echec = null;
  function go(m, x, ch) {
    const nm = nd(m);
    if (nm.k === variables) {
      const deja = Object.hasOwn(sigma, nm.n) ? sigma[nm.n] : undefined;
      if (deja === undefined) { sigma[nm.n] = x; return true; }
      if (deja === x) return true;
      echec = { ok: false, raison: 'conflit', chemin: ch, variable: nm.n, v1: deja, v2: x };
      return false;
    }
    const nx = nd(x);
    if (nm.k !== nx.k || ((nm.k === 'L' || nm.k === 'V') && nm.n !== nx.n)) {
      echec = { ok: false, raison: 'forme', chemin: ch, attendu: m, recu: x };
      return false;
    }
    if (nm.k === 'N') return go(nm.a, nx.a, ch + 'a');
    if (nm.k === 'O') {
      if (estImp(m)) return go(nm.r, nx.r, ch + 'r') && go(nm.l, nx.l, ch + 'l');
      return go(nm.l, nx.l, ch + 'l') && go(nm.r, nx.r, ch + 'r');
    }
    return true;
  }
  return go(motif, f, '') ? { ok: true, sigma } : echec;
}

/** σ ou null. */
export function filtrer(motif, f, sigma0 = {}, variables = 'L') {
  const r = filtrerDiag(motif, f, sigma0, variables);
  return r.ok ? r.sigma : null;
}

/** Chemin du premier nœud (ordre de lecture de a) où a et b diffèrent, ou null si a = b. */
export function divergence(a, b) {
  function go(x, y, ch) {
    if (x === y) return null;
    const nx = nd(x), ny = nd(y);
    if (nx.k !== ny.k || nx.k === 'L' || nx.k === 'V') return ch;
    if (nx.k === 'N') return go(nx.a, ny.a, ch + 'a');
    const ordre = estImp(x) ? [['r', nx.r, ny.r], ['l', nx.l, ny.l]] : [['l', nx.l, ny.l], ['r', nx.r, ny.r]];
    for (const [p, u, v] of ordre) {
      const d = go(u, v, ch + p);
      if (d !== null) return d;
    }
    return ch;
  }
  return go(a, b, '');
}
