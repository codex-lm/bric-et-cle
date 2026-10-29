// Élimination de la substitution (9.4) et vérificateur indépendant (annexe B).
//
// eliminerSubstitution() pousse chaque substitution jusqu'aux axiomes : la preuve obtenue ne
// contient plus que des instances des quatre moules, des modus ponens et des prémisses.
// verifierGodement() relit cette preuve sous forme de texte, avec son propre analyseur et ses
// propres moules, sans rien importer du reste du noyau : on ne fait pas confiance au programme,
// on vérifie ce qu'il écrit.
import { AXIOMES } from './rules.js';
import { substituer, composer } from './subst.js';
import { lettres, ascii } from './formula.js';

/** Preuve plate (axiomes, substitutions, MP, prémisses) → preuve de Godement. Rend {lignes, fin}. */
export function eliminerSubstitution(plat, i) {
  const G = [];
  const parF = new Map();
  const pousser = (f, just) => {
    const k = parF.get(f);
    if (k !== undefined) return k;
    G.push({ f, just });
    parF.set(f, G.length - 1);
    return G.length - 1;
  };
  function inst(k, sigma) {
    const L = plat.lignes[k];
    const cible = substituer(L.f, sigma);
    const deja = parF.get(cible);
    if (deja !== undefined) return deja;
    const j = L.just;
    switch (j.type) {
      case 'axiome': {
        const s = {};
        for (const x of lettres(AXIOMES[j.ax])) if (sigma[x] != null) s[x] = sigma[x];
        return pousser(cible, { type: 'instance', ax: j.ax, sigma: s });
      }
      case 'premisse':
        if (cible !== L.f) throw new Error('une substitution a touché une prémisse');
        return pousser(L.f, { type: 'premisse', i: j.i || 0 });
      case 'substituer':
        return inst(j.de, composer(sigma, j.sigma));
      case 'mp': {
        const a = inst(j.a, sigma);
        const b = inst(j.imp, sigma);
        return pousser(cible, { type: 'mp', a, imp: b });
      }
      default:
        throw new Error('justification inattendue : ' + j.type);
    }
  }
  const fin = inst(i, {});
  return { lignes: G, fin };
}

/** Texte d'une preuve de Godement, une ligne par pas, numérotée à partir de 1. */
export function enTexte(G) {
  return G.lignes.map((l, k) => {
    const j = l.just;
    const just = j.type === 'instance' ? 'AX ' + j.ax : j.type === 'premisse' ? 'HYP' : `MP ${j.a + 1} ${j.imp + 1}`;
    return `${k + 1}. ${ascii(l.f)} [${just}]`;
  });
}

// ====================================================================================
// Vérificateur indépendant. Tout ce qui suit n'utilise que des chaînes et des objets simples.

const MOULES = {
  AL1: '(R v R) -> R',
  AL2: 'R -> (R v S)',
  AL3: '(R v S) -> (S v R)',
  AL4: '(R -> S) -> ((R v T) -> (S v T))',
};

function lire(s) {
  let i = 0;
  const blanc = () => { while (i < s.length && s[i] === ' ') i++; };
  function imp() {
    const g = disj();
    blanc();
    if (s.startsWith('->', i)) { i += 2; const d = imp(); return { t: 'ou', l: d, r: { t: 'non', a: g } }; }
    return g;
  }
  function disj() {
    let g = neg();
    for (;;) {
      blanc();
      if (s[i] === 'v') { i++; g = { t: 'ou', l: g, r: neg() }; } else return g;
    }
  }
  function neg() {
    blanc();
    if (s[i] === '~') { i++; return { t: 'non', a: neg() }; }
    if (s[i] === '(') { i++; const f = imp(); blanc(); if (s[i] !== ')') throw new Error('")" attendue'); i++; return f; }
    const m = /^(@?)([A-Z][₀-₉0-9]*)/.exec(s.slice(i));
    if (!m) throw new Error('atome attendu à la position ' + i);
    i += m[0].length;
    return { t: m[1] ? 'nom' : 'var', n: m[2] };
  }
  const f = imp();
  blanc();
  if (i !== s.length) throw new Error('texte en trop');
  return f;
}

const cle = (f) => f.t === 'var' ? f.n : f.t === 'nom' ? '@' + f.n : f.t === 'non' ? '~' + cle(f.a) : '(' + cle(f.l) + ' v ' + cle(f.r) + ')';

function instance(moule, f, env) {
  if (moule.t === 'var') {
    const k = cle(f);
    if (env[moule.n] === undefined) { env[moule.n] = k; return true; }
    return env[moule.n] === k;
  }
  if (moule.t !== f.t) return false;
  if (moule.t === 'non') return instance(moule.a, f.a, env);
  return instance(moule.l, f.l, env) && instance(moule.r, f.r, env);
}

/**
 * Relit une preuve texte. Chaque ligne « n. formule [AX ALk | MP a b | HYP] » doit être une instance
 * du moule annoncé, suivre de deux lignes antérieures par modus ponens, ou être une prémisse déclarée.
 * Le vérificateur contrôle aussi la justification elle-même, puis que la cible apparaît.
 */
export function verifierGodement(lignes, { premisses = [], cible } = {}) {
  const moules = Object.fromEntries(Object.entries(MOULES).map(([k, v]) => [k, lire(v)]));
  const hyp = new Set(premisses.map((p) => cle(lire(p))));
  const vues = [];
  const erreurs = [];
  lignes.forEach((texteLigne, k) => {
    const m = /^(\d+)\. (.*) \[(AX (AL[1-4])|MP (\d+) (\d+)|HYP)\]$/.exec(texteLigne);
    if (!m || +m[1] !== k + 1) { erreurs.push({ ligne: k + 1, raison: 'format' }); vues.push(null); return; }
    let f;
    try { f = lire(m[2]); } catch { erreurs.push({ ligne: k + 1, raison: 'syntaxe' }); vues.push(null); return; }
    let ok = false;
    if (m[4]) ok = instance(moules[m[4]], f, {});
    else if (m[5]) {
      const a = vues[+m[5] - 1], b = vues[+m[6] - 1];
      ok = +m[5] <= k && +m[6] <= k && a && b && b.t === 'ou' && b.r.t === 'non' && cle(b.r.a) === cle(a) && cle(b.l) === cle(f);
    } else ok = hyp.has(cle(f));
    if (!ok) erreurs.push({ ligne: k + 1, raison: m[4] ? 'pas une instance de ' + m[4] : m[5] ? 'modus ponens invalide' : 'prémisse inconnue' });
    vues.push(ok ? f : null);
  });
  const atteinte = cible === undefined ? true : vues.some((f) => f && cle(f) === cle(lire(cible)));
  if (!atteinte) erreurs.push({ ligne: null, raison: 'cible absente' });
  return { ok: erreurs.length === 0, erreurs, longueur: lignes.length };
}
