// Formules : arbres internés (partage structurel) à trois constructeurs.
// Lettre(nom) | Nom(nom) | Non(f) | Ou(f, g). A → B est stocké Ou(B, Non(A)).
// Une formule est un entier : l'identifiant de son nœud. Deux formules sont égales
// si et seulement si leurs identifiants sont égaux.

const NOEUDS = [];
const INDEX = new Map();

function interner(cle, noeud) {
  let id = INDEX.get(cle);
  if (id === undefined) {
    id = NOEUDS.length;
    noeud.id = id;
    Object.freeze(noeud);
    NOEUDS.push(noeud);
    INDEX.set(cle, id);
  }
  return id;
}

export const lettre = (n) => interner('L' + n, { k: 'L', n });
export const nom = (n) => interner('V' + n, { k: 'V', n });
export const non = (a) => interner('N' + a, { k: 'N', a });
export const ou = (l, r) => interner('O' + l + ',' + r, { k: 'O', l, r });
export const imp = (a, b) => ou(b, non(a));

/** Le nœud d'une formule. */
export const nd = (f) => NOEUDS[f];

/** Vrai si f a la forme Ou(b, Non(a)), c'est-à-dire a → b. */
export function estImp(f) {
  const n = NOEUDS[f];
  return n.k === 'O' && NOEUDS[n.r].k === 'N';
}
export const antecedent = (f) => NOEUDS[NOEUDS[f].r].a;
export const consequent = (f) => NOEUDS[f].l;

// ---------------------------------------------------------------- chemins
// Un chemin est une chaîne de pas : 'l' et 'r' pour les fils d'un Ou, 'a' pour celui d'un Non.
// L'antécédent de a → b est au pas 'ra', son conséquent au pas 'l'.

export function en(f, chemin) {
  let x = f;
  for (const p of chemin) {
    const n = NOEUDS[x];
    if (p === 'a' && n.k === 'N') x = n.a;
    else if (p === 'l' && n.k === 'O') x = n.l;
    else if (p === 'r' && n.k === 'O') x = n.r;
    else return null;
  }
  return x;
}

/** Remplace le sous-arbre au chemin donné. */
export function remplacerEn(f, chemin, g) {
  if (chemin === '') return g;
  const n = NOEUDS[f];
  const p = chemin[0], suite = chemin.slice(1);
  if (p === 'a') return non(remplacerEn(n.a, suite, g));
  if (p === 'l') return ou(remplacerEn(n.l, suite, g), n.r);
  return ou(n.l, remplacerEn(n.r, suite, g));
}

/** Enfants dans l'ordre de lecture affiché par défaut (antécédent avant conséquent). */
export function enfantsAffiches(f) {
  const n = NOEUDS[f];
  if (n.k === 'N') return [['a', n.a]];
  if (n.k === 'O') {
    if (estImp(f)) return [['ra', antecedent(f)], ['l', n.l]];
    return [['l', n.l], ['r', n.r]];
  }
  return [];
}

// ---------------------------------------------------------------- propriétés
const TAILLE = new Map();
export function taille(f) {
  let t = TAILLE.get(f);
  if (t !== undefined) return t;
  const n = NOEUDS[f];
  t = n.k === 'N' ? 1 + taille(n.a) : n.k === 'O' ? 1 + taille(n.l) + taille(n.r) : 1;
  TAILLE.set(f, t);
  return t;
}

/** Lettres distinctes, dans l'ordre de première apparition à la lecture. */
export function lettres(f) {
  const vu = new Set(), out = [];
  (function go(x) {
    const n = NOEUDS[x];
    if (n.k === 'L') { if (!vu.has(n.n)) { vu.add(n.n); out.push(n.n); } return; }
    for (const [, c] of enfantsAffiches(x)) go(c);
  })(f);
  return out;
}

/** Noms distincts, dans l'ordre de lecture. */
export function noms(f) {
  const vu = new Set(), out = [];
  (function go(x) {
    const n = NOEUDS[x];
    if (n.k === 'V') { if (!vu.has(n.n)) { vu.add(n.n); out.push(n.n); } return; }
    for (const [, c] of enfantsAffiches(x)) go(c);
  })(f);
  return out;
}

/** Tous les chemins des occurrences de la lettre x. */
export function occurrences(f, x, k = 'L') {
  const out = [];
  (function go(y, ch) {
    const n = NOEUDS[y];
    if (n.k === k && n.n === x) out.push(ch);
    else if (n.k === 'N') go(n.a, ch + 'a');
    else if (n.k === 'O') { go(n.l, ch + 'l'); go(n.r, ch + 'r'); }
  })(f, '');
  return out;
}

/** Vrai si g est un sous-arbre de f. */
export function contient(f, g) {
  if (f === g) return true;
  const n = NOEUDS[f];
  if (n.k === 'N') return contient(n.a, g);
  if (n.k === 'O') return contient(n.l, g) || contient(n.r, g);
  return false;
}

// ---------------------------------------------------------------- analyse
const INDICES = '₀₁₂₃₄₅₆₇₈₉';
const versIndice = (s) => s.replace(/[0-9]/g, (d) => INDICES[+d]);

export class ErreurSyntaxe extends Error {
  constructor(message, pos) { super(message); this.pos = pos; }
}

function jetons(texte) {
  const out = [];
  let i = 0;
  while (i < texte.length) {
    const c = texte[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '(' || c === ')') { out.push({ t: c, pos: i }); i++; continue; }
    if (c === '~' || c === '¬' || c === '!') { out.push({ t: '¬', pos: i }); i++; continue; }
    if (c === 'v' || c === '∨' || c === '|') { out.push({ t: '∨', pos: i }); i++; continue; }
    if (c === '→') { out.push({ t: '→', pos: i }); i++; continue; }
    if (c === '-' && texte[i + 1] === '>') { out.push({ t: '→', pos: i }); i += 2; continue; }
    if (c === '=' && texte[i + 1] === '>') { out.push({ t: '→', pos: i }); i += 2; continue; }
    const m = /^(@?)([A-Z])([0-9₀-₉]*)/.exec(texte.slice(i));
    if (m) {
      out.push({ t: 'id', nom: m[2] + versIndice(m[3]), arobase: m[1] === '@', pos: i });
      i += m[0].length;
      continue;
    }
    throw new ErreurSyntaxe(`caractère inattendu « ${c} »`, i);
  }
  return out;
}

/**
 * Analyse un texte. Syntaxe : lettres majuscules (indices permis : R1, R₁),
 * ¬ ou ~, ∨ ou v, → ou ->. ¬ lie le plus fort, puis ∨ (à gauche), puis → (à droite).
 * opts.noms : ensemble des identifiants à lire comme des noms ; @X force un nom.
 * opts.capsules : Map nom → formule, pour lire une capsule par son nom.
 */
export function parse(texte, opts = {}) {
  const js = jetons(texte);
  let i = 0;
  const noms = opts.noms ? new Set(opts.noms) : null;
  const caps = opts.capsules || null;
  const voir = () => js[i];
  const fin = () => (js.length ? js[js.length - 1].pos + 1 : 0);
  function attendre(t) {
    const j = js[i];
    if (!j || j.t !== t) throw new ErreurSyntaxe(t === ')' ? 'parenthèse fermante attendue' : `« ${t} » attendu`, j ? j.pos : fin());
    i++;
  }
  function pImp() {
    const g = pOu();
    if (voir() && voir().t === '→') { i++; return imp(g, pImp()); }
    return g;
  }
  function pOu() {
    let g = pNon();
    while (voir() && voir().t === '∨') { i++; g = ou(g, pNon()); }
    return g;
  }
  function pNon() {
    const j = voir();
    if (j && j.t === '¬') { i++; return non(pNon()); }
    return pAtome();
  }
  function pAtome() {
    const j = voir();
    if (!j) throw new ErreurSyntaxe('formule incomplète', fin());
    if (j.t === '(') { i++; const f = pImp(); attendre(')'); return f; }
    if (j.t === 'id') {
      i++;
      if (j.arobase || (noms && noms.has(j.nom))) return nom(j.nom);
      if (caps && caps.has(j.nom)) return caps.get(j.nom);
      return lettre(j.nom);
    }
    throw new ErreurSyntaxe(`« ${j.t} » inattendu`, j.pos);
  }
  if (!js.length) throw new ErreurSyntaxe('formule vide', 0);
  const f = pImp();
  if (i < js.length) throw new ErreurSyntaxe(`« ${js[i].t === 'id' ? js[i].nom : js[i].t} » en trop`, js[i].pos);
  return f;
}

/** Analyse sans exception : {ok, f} ou {ok:false, erreur, pos}. */
export function essayerParse(texte, opts) {
  try { return { ok: true, f: parse(texte, opts) }; }
  catch (e) { if (e instanceof ErreurSyntaxe) return { ok: false, erreur: e.message, pos: e.pos }; throw e; }
}

// ---------------------------------------------------------------- impression
/**
 * Texte d'une formule, parenthèses complètes sauf l'extérieure.
 * opts.ascii : syntaxe clavier (~, v, ->, @ devant les noms).
 * opts.loupe : ensemble de chemins affichés en b ∨ ¬a au lieu de a → b.
 */
export function texte(f, opts = {}) {
  const A = opts.ascii;
  const NON = A ? '~' : '¬', OU = A ? ' v ' : ' ∨ ', IMP = A ? ' -> ' : ' → ';
  const loupe = opts.loupe || null;
  function go(x, ch, haut) {
    const n = NOEUDS[x];
    if (n.k === 'L') return n.n;
    if (n.k === 'V') return (A ? '@' : '') + n.n;
    if (n.k === 'N') return NON + go(n.a, ch + 'a', false);
    let s;
    if (estImp(x) && !(loupe && loupe.has(ch))) s = go(antecedent(x), ch + 'ra', false) + IMP + go(n.l, ch + 'l', false);
    else s = go(n.l, ch + 'l', false) + OU + go(n.r, ch + 'r', false);
    return haut ? s : '(' + s + ')';
  }
  return go(f, '', true);
}

export const ascii = (f) => texte(f, { ascii: true });
