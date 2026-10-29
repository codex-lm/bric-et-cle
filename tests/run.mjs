// Tests du noyau : node tests/run.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse, texte, ascii, lettre, nom, non, ou, imp, lettres, essayerParse, nd, en, estImp, taille } from '../core/formula.js';
import { substituer } from '../core/subst.js';
import { mp, boite, AXIOMES, antecedents, lettresLibres } from '../core/rules.js';
import { verifier, deplier, Plat, necessaires } from '../core/verify.js';
import { eliminerSubstitution, enTexte, verifierGodement } from '../core/godement.js';
import { preparerChapitre, jouer, contexte, preuve, versSolution, definirPreuveJoueur, niveauParId, longueurTheoreme } from '../core/levels.js';
import { formulesNouvelles, etoiles } from '../core/score.js';
import { etatDepuis, effectifs } from '../core/journal.js';
import { replier, reconstruire } from '../core/capsules.js';
import { poser, lire } from '../ui/objet/pose.js';
import { svgObjet } from '../ui/objet/rendu.js';
import { gesteEchangeur, gesteCle, gesteDuplicateur, gesteAutomate } from '../ui/gestes.js';

let ok = 0, ko = 0;
function test(nomTest, fn) {
  try { fn(); ok++; console.log('  ✓ ' + nomTest); }
  catch (e) { ko++; console.log('  ✗ ' + nomTest + '\n      ' + (e.stack || e).toString().split('\n').slice(0, 3).join('\n      ')); }
}
function egal(a, b, msg = '') { if (a !== b) throw new Error(`${msg} attendu ${JSON.stringify(b)}, obtenu ${JSON.stringify(a)}`); }
function vrai(c, msg = 'assertion') { if (!c) throw new Error(msg); }
const P = (s, o) => parse(s, o);

const racine = fileURLToPath(new URL('..', import.meta.url));
const json = JSON.parse(readFileSync(racine + 'levels/chapitre1.json', 'utf-8'));

console.log('Formules');
test('implication canonique : A → B est B ∨ ¬A', () => {
  egal(P('R -> S'), ou(lettre('S'), non(lettre('R'))));
  egal(P('S v ~R'), P('R → S'));
});
test('aller-retour analyse/impression sur les formules du cours', () => {
  const formules = [
    '(R v R) -> R', 'R -> (R v S)', '(R v S) -> (S v R)', '(R -> S) -> ((R v T) -> (S v T))',
    '(S -> T) -> ((R -> S) -> (R -> T))', 'R -> R', 'R -> (S -> R)', '~R -> (R -> S)',
    '(R -> (S -> T)) -> ((R -> S) -> (R -> T))', '(A -> (B -> C)) -> (B -> (A -> C))',
    'C -> ((C -> B) -> B)', '(R -> S) -> ((S -> T) -> (R -> T))', '(~R -> X) -> ((R -> X) -> X)',
    '(R v (S v T)) -> (S v (R v T))', '((R -> S) -> R) -> R', '~~R1 -> (R₁ v ~S2)', '@X -> (R -> @X)',
  ];
  for (const s of formules) {
    const f = P(s);
    if (!s.includes('@')) egal(P(texte(f)), f, 'unicode ' + s);
    egal(P(ascii(f)), f, 'ascii ' + s);
  }
});
test('affichage : parenthèses complètes sauf l\'extérieure, → par défaut', () => {
  egal(texte(P('(S v ~R) -> (T v ~R)')), '(R → S) → (R → T)');
  egal(texte(P('((S v T) v (S v T)) -> (S v T)')), '((S ∨ T) ∨ (S ∨ T)) → (S ∨ T)');
  egal(texte(P('R -> S'), { loupe: new Set(['']) }), 'S ∨ ¬R');
  egal(texte(P('~(R v S)')), '¬(R ∨ S)');
});
test('erreurs de syntaxe signalées', () => {
  vrai(!essayerParse('R ->').ok); vrai(!essayerParse('(R v S').ok); vrai(!essayerParse('R S').ok); vrai(!essayerParse('r').ok);
});
test('partage structurel : même formule, même identifiant', () => {
  egal(P('(R -> S) v T'), ou(imp(lettre('R'), lettre('S')), lettre('T')));
});

console.log('Substitution');
test('simultanée : ligne 5 de S, CV [R := R → T, S := R → S]', () => {
  const r = substituer(P('R -> (S -> R)'), { R: P('R -> T'), S: P('R -> S') });
  egal(r, P('(R -> T) -> ((R -> S) -> (R -> T))'));
});
test('échange [R := S, S := R]', () => {
  egal(substituer(P('R -> (R v S)'), { R: P('S'), S: P('R') }), P('S -> (S v R)'));
});
test('substitution du niveau MPI, telle quelle', () => {
  const C = P('(A -> (B -> C)) -> (B -> (A -> C))');
  egal(substituer(C, { A: P('C -> B'), B: P('C'), C: P('B') }), P('((C -> B) -> (C -> B)) -> (C -> ((C -> B) -> B))'));
});
test('les noms ne sont jamais touchés', () => {
  const f = P('~R -> X', { noms: ['R', 'X'] });
  egal(substituer(f, { R: P('S'), X: P('T') }), f);
  const g = P('R -> @X');
  egal(substituer(g, { R: P('@X'), X: P('S') }), P('@X -> @X'));
});
test('partielle : les lettres absentes restent', () => {
  egal(substituer(P('R v S'), { S: P('~S') }), P('R v ~S'));
});

console.log('Modus ponens');
test('accepté', () => {
  const r = mp(AXIOMES.AL1, P('((R v R) -> R) -> (((R v R) -> R) v S)'));
  vrai(r.ok); egal(r.sortie, P('((R v R) -> R) v S'));
});
test('refusé : pas une implication', () => {
  const r = mp(P('R'), P('R v S'));
  vrai(!r.ok); egal(r.diag.type, 'pasImplication');
});
test('refusé : chemin du premier nœud divergent', () => {
  const r = mp(P('S -> R'), P('(R -> S) -> T'));
  vrai(!r.ok); egal(r.diag.type, 'antecedent');
  egal(texte(r.diag.sousAttendu), 'R'); egal(texte(r.diag.sousBranche), 'S');
  egal(r.diag.chemin, 'ra');
});

console.log('Boîtes');
const TL0 = P('(S -> T) -> ((R -> S) -> (R -> T))');
test('antécédents de TL0 : S → T puis R → S (forme méta du cours : deux ports)', () => {
  const a = antecedents(TL0, 2);
  egal(a.length, 2); egal(a[0], P('S -> T')); egal(a[1], P('R -> S'));
  egal(antecedents(TL0).length, 3, 'épluchage complet');
});
test('TL1 sur le cas d\'AF', () => {
  const r = boite(TL0, [P('(~R v S) -> (S v ~R)'), P('~R -> (~R v S)')]);
  vrai(r.ok); egal(r.sortie, P('~R -> (R -> S)'));
});
test('TL1, ports partiels : un seul port rend l\'implication restante', () => {
  const r = boite(TL0, [P('(X v X) -> X')], { R: P('~R v X') });
  vrai(r.ok); egal(r.sortie, P('((~R v X) -> (X v X)) -> ((~R v X) -> X)'));
});
test('CV méta : un port R et une molette S', () => {
  const CV = P('R -> (S -> R)');
  egal(lettresLibres(CV, 1).join(), 'S');
  const r = boite(CV, [P('B -> (A -> B)')], { S: P('A -> (B -> C)') });
  vrai(r.ok); egal(r.sortie, P('(A -> (B -> C)) -> (B -> (A -> B))'));
  egal(boite(CV, [P('Q')]).sortie, P('S -> Q'));
});
test('boîte refusée : deux valeurs pour le même nom', () => {
  const r = boite(TL0, [P('A -> B'), P('C -> D')]);
  vrai(!r.ok); egal(r.diag.raison, 'conflit'); egal(r.diag.variable, 'S');
  egal(texte(r.diag.v1), 'A'); egal(texte(r.diag.v2), 'D');
});

console.log('Capsules');
test('replier puis déplier rend le même identifiant', () => {
  const X = P('(R -> S) -> (R -> T)');
  const f = P('((S -> T) -> ((R -> S) -> (R -> T))) -> ((R -> (S -> T)) -> (R -> ((R -> S) -> (R -> T))))');
  const caps = [{ nom: 'X', f: X, auto: true }];
  const v = replier(f, { capsules: caps });
  egal(reconstruire(v, caps, { lettre, nom, non, ou, imp }), f);
  const compte = JSON.stringify(v).split('"k":"C"').length - 1;
  egal(compte, 2, 'occurrences repliées');
});

console.log('Niveaux : solutions de référence');
const chap = preparerChapitre(json);
for (const niveau of chap.niveaux) {
  const solutions = [];
  if (niveau.reference) solutions.push(['référence', niveau.reference, niveau.par]);
  if (niveau.referenceTrois) solutions.push(['trois étoiles', niveau.referenceTrois, niveau.troisEtoiles]);
  if (niveau.solutionConnue) solutions.push(['solution connue', niveau.solutionConnue, null]);
  for (const [genre, sol, attendu] of solutions) {
    test(`${niveau.numero} ${niveau.id} (${genre})`, () => {
      const ctx = contexte(chap, niveau);
      const { feuille } = jouer(chap, niveau, sol, ctx);
      const v = verifier(feuille, ctx);
      vrai(v.ok, 'vérificateur local : ' + JSON.stringify(v.verdicts.filter((x) => !x.ok)));
      const fin = feuille.lignes[feuille.lignes.length - 1];
      egal(texte(fin.f), texte(niveau.cibleF), 'cible');
      const n = formulesNouvelles(feuille);
      if (attendu != null) egal(n, attendu, 'nombre de lignes');
      if (genre === 'référence') egal(etoiles(niveau, n), 2, 'étoiles');
      if (genre === 'trois étoiles') egal(etoiles(niveau, n), 3, 'étoiles');
      // Dépliage, élimination de la substitution, vérificateur indépendant.
      const plat = new Plat();
      const idx = deplier(feuille, ctx, plat);
      const G = eliminerSubstitution(plat, idx.get(fin.id));
      const txt = enTexte(G);
      const premisses = niveau.premissesF.map(ascii);
      const verdict = verifierGodement(txt, { premisses, cible: ascii(niveau.cibleF) });
      vrai(verdict.ok, 'Godement : ' + JSON.stringify(verdict.erreurs.slice(0, 3)));
    });
  }
}

console.log('Vérificateur indépendant : preuves abîmées');
{
  const niveau = niveauParId(chap, 'lpc');
  const ctx = contexte(chap, niveau);
  const { feuille } = jouer(chap, niveau, niveau.reference, ctx);
  const plat = new Plat();
  const idx = deplier(feuille, ctx, plat);
  const G = eliminerSubstitution(plat, idx.get(feuille.lignes.at(-1).id));
  const txt = enTexte(G);
  const cible = ascii(niveau.cibleF);
  test(`preuve intacte acceptée (${txt.length} lignes de Godement)`, () => vrai(verifierGodement(txt, { cible }).ok));
  test('ligne remplacée : refusée', () => {
    const t = txt.slice();
    const k = t.findIndex((l) => l.includes('[AX AL4]'));
    t[k] = t[k].replace(/^(\d+)\. .* \[/, '$1. R -> (S v R) [');
    vrai(!verifierGodement(t, { cible }).ok);
  });
  test('ligne supprimée : refusée', () => {
    const t = txt.slice(1).map((l, k) => l.replace(/^\d+\./, `${k + 1}.`));
    vrai(!verifierGodement(t, { cible }).ok);
  });
  test('mauvaise cible : refusée', () => vrai(!verifierGodement(txt, { cible: '((R -> S) -> R) -> R' }).ok));
  test('modus ponens inventé : refusé', () => {
    const t = [...txt, `${txt.length + 1}. S [MP 1 2]`];
    vrai(!verifierGodement(t, { cible }).ok);
  });
  test('prémisse non déclarée : refusée', () => {
    vrai(!verifierGodement(['1. R [HYP]'], { cible: 'R' }).ok);
    vrai(verifierGodement(['1. R [HYP]'], { cible: 'R', premisses: ['R'] }).ok);
  });
}

console.log('Prélemme : règle et noms');
test('aucune substitution ne modifie un nom de la prémisse', () => {
  const niveau = niveauParId(chap, 'prelemme');
  const ctx = contexte(chap, niveau);
  const { feuille } = jouer(chap, niveau, niveau.reference, ctx);
  const prem = feuille.haut.find((l) => l.id === 'P1');
  egal(lettres(prem.f).length, 0, 'la prémisse n\'a aucune lettre');
  egal(substituer(prem.f, { R: P('S'), X: P('T') }), prem.f);
});
test('la boîte du prélemme instancie le modèle (schéma S, ligne 7)', () => {
  const niveau = niveauParId(chap, 's');
  const ctx = contexte(chap, niveau);
  const r = jouer(chap, niveau, niveau.reference.slice(0, 6), ctx);
  egal(texte(r.feuille.lignes[5].f), texte(P('(R -> ((R -> S) -> (R -> T))) -> ((R -> S) -> (R -> T))')));
});
test('longueurs dépliées des théorèmes', () => {
  for (const ref of ['TL0', 'TL2', 'CV', 'AF', 'S', 'C', 'MPI', 'TL0bis', 'LPC']) vrai(longueurTheoreme(chap, ref) > 0, ref);
});

console.log('Sauvegarde et journal');
test('une preuve sauvegardée se relit à l\'identique', () => {
  const niveau = niveauParId(chap, 'prelemme');
  const { feuille } = jouer(chap, niveau, niveau.reference);
  const sol = JSON.parse(JSON.stringify(versSolution(feuille)));
  const chap2 = preparerChapitre(json);
  definirPreuveJoueur(chap2, 'prelemme', sol);
  const p = preuve(chap2, niveauParId(chap2, 'prelemme'));
  egal(p.source, 'joueur');
  egal(p.feuille.lignes.at(-1).f, feuille.lignes.at(-1).f);
});
test('rejouer un journal reconstruit la même feuille ; annuler ajoute un événement', () => {
  const niveau = niveauParId(chap, 'tl2');
  const env = { chap, niveau, ctx: contexte(chap, niveau) };
  const J = [
    { type: 'POSER', m: 1, sorte: 'substituer', cote: 'gauche' },
    { type: 'BRANCHER', m: 1, port: 0, ligne: 'AL2' },
    { type: 'REGLER', m: 1, lettre: 'S', f: 'T' },
    { type: 'REGLER', m: 1, lettre: 'S', f: 'R' },
    { type: 'ACTIONNER', m: 1 },
    { type: 'POSER', m: 2, sorte: 'boite', ref: 'TL0', cote: 'droite' },
    { type: 'BRANCHER', m: 2, port: 0, ligne: 'AL3' },
    { type: 'BRANCHER', m: 2, port: 1, ligne: 'L1' },
    { type: 'ACTIONNER', m: 2 },
    { type: 'DEBRANCHER', m: 2, port: 0 },
    { type: 'DEBRANCHER', m: 2, port: 1 },
    { type: 'BRANCHER', m: 2, port: 0, ligne: 'AL1' },
    { type: 'BRANCHER', m: 2, port: 1, ligne: 'L1' },
    { type: 'ACTIONNER', m: 2 },
  ];
  const s0 = etatDepuis(J, env, 9);
  egal(s0.machines[1].etat, 'refusee'); egal(s0.machines[1].diag.raison, 'conflit');
  const s1 = etatDepuis(J, env);
  vrai(s1.gagne, 'gagné');
  egal(s1.feuille.lignes.length, 2);
  egal(texte(s1.feuille.lignes[1].f), 'R → R');
  const s2 = etatDepuis(JSON.parse(JSON.stringify(J)), env);
  egal(s2.feuille.lignes.map((l) => l.f).join(), s1.feuille.lignes.map((l) => l.f).join());
  const J3 = [...J, { type: 'ANNULER' }];
  const s3 = etatDepuis(J3, env);
  egal(s3.feuille.lignes.length, 1); vrai(!s3.gagne);
  const s4 = etatDepuis([...J3, { type: 'RETABLIR' }], env);
  egal(s4.feuille.lignes.length, 2);
  egal(effectifs(J3).faits.length, J.length - 1);
  const s5 = etatDepuis([...J, { type: 'DEMONTER', m: 1 }], env);
  egal(s5.feuille.lignes.length, 0, 'démonter emporte les lignes qui dépendent');
  egal(s5.machines.length, 0);
});

console.log('Objets (pose et relecture)');
{
  const chap = preparerChapitre(json);
  // Toutes les formules du chapitre : axiomes, théorèmes, cibles et lignes des solutions de référence.
  const formules = new Set(Object.values(AXIOMES));
  for (const t of Object.values(chap.theoremes)) formules.add(t.f);
  for (const n of chap.niveaux) {
    formules.add(n.cibleF);
    const ctx = contexte(chap, n);
    for (const l of jouer(chap, n, n.reference || n.solutionConnue || [], ctx).feuille.lignes) formules.add(l.f);
  }
  // Graine fixe : les tirages sont reproductibles.
  let graine = 12345;
  const hasard = () => ((graine = (graine * 1103515245 + 12345) % 2147483648) / 2147483648);
  const chemins = (f) => { const out = []; (function go(x, ch) { out.push(ch); const n = nd(x); if (n.k === 'N') go(n.a, ch + 'a'); else if (n.k === 'O') { go(n.l, ch + 'l'); go(n.r, ch + 'r'); } })(f, ''); return out; };
  const vuesAuHasard = (f) => { const v = {}; for (const ch of chemins(f)) { const t = hasard(); if (t < 0.25) v[ch] = 'lecture'; else if (t < 0.4) v[ch] = 'deboite'; } return v; };
  test('relecture exacte des formules du chapitre, dans les trois vues', () => {
    for (const f of formules) {
      for (const vues of [{}, Object.fromEntries(chemins(f).map((c) => [c, 'lecture'])), Object.fromEntries(chemins(f).map((c) => [c, 'deboite'])), vuesAuHasard(f), vuesAuHasard(f)]) {
        egal(lire(poser(f, { vues })), f, texte(f) + ' ' + JSON.stringify(vues));
      }
    }
  });
  test('10 000 formules au hasard, vues et coffrets au hasard : le dessin se relit toujours en la même formule', () => {
    const L = ['R', 'S', 'T', 'U'].map(lettre);
    const tirer = (p) => { const t = hasard(); if (p <= 0 || t < 0.28) return L[Math.floor(hasard() * 4)]; if (t < 0.45) return non(tirer(p - 1)); if (t < 0.7) return imp(tirer(p - 1), tirer(p - 1)); return ou(tirer(p - 1), tirer(p - 1)); };
    for (let i = 0; i < 10000; i++) {
      const f = tirer(1 + Math.floor(hasard() * 7));
      const caps = [];
      if (hasard() < 0.3) { const cs = chemins(f).filter((c) => c); if (cs.length) caps.push({ nom: 'X', f: en(f, cs[Math.floor(hasard() * cs.length)]), auto: true }); }
      const p = poser(f, { vues: vuesAuHasard(f), capsules: caps });
      egal(lire(p, new Map(caps.map((c) => [c.nom, c.f]))), f, texte(f));
    }
  });
  test('une flèche par implication non déboîtée, et seulement là', () => {
    for (const f of formules) {
      const p = poser(f);
      const imps = chemins(f).filter((c) => estImp(en(f, c))).length;
      egal(p.els.filter((e) => e.sorte === 'fleche').length, imps, texte(f));
      egal(p.els.filter((e) => e.sorte === 'trait').length, chemins(f).filter((c) => nd(en(f, c)).k === 'N').length - imps, 'traits ' + texte(f));
    }
  });
  test('le dessin distingue les indices (R₁ et R₂) sans lire les attributs cachés', () => {
    const visible = (f) => svgObjet({ f }).replace(/ data-[a-z]+="[^"]*"/g, '');
    vrai(visible(P('R1 -> R2')) !== visible(P('R2 -> R1')), 'R₁ → R₂ et R₂ → R₁ se dessinent pareil');
    vrai(visible(P('R0 -> R')) !== visible(P('R -> R0')), 'R₀ se dessine comme R');
    vrai(visible(P('R1 -> R01')) !== visible(P('R01 -> R1')), 'R₀₁ se dessine comme R₁');
  });
  test('largeur des objets du chapitre à u = 28', () => {
    const larg = [...formules].map((f) => [poser(f, { u: 28 }).w, f]).sort((a, b) => a[0] - b[0]);
    const [max, fmax] = larg[larg.length - 1];
    console.log(`      ${larg.length} formules, médiane ${Math.round(larg[larg.length >> 1][0])} px, max ${Math.round(max)} px (${taille(fmax)} symboles)`);
    vrai(max < 1700, 'objet trop large');
  });
}

console.log('Gestes de l\'atelier');
{
  const chap = preparerChapitre(json);
  // Une solution (format des niveaux), traduite geste par geste comme l'atelier la produirait.
  const rejouer = (n, sol) => {
    const env = { chap, niveau: n, ctx: contexte(chap, n), capsulesInitiales: [] };
    const journal = [], ids = [];
    const ref = (r) => (typeof r === 'number' ? ids[r - 1] : r);
    const F = (o) => Object.fromEntries(Object.entries(o || {}).map(([x, v]) => [x, parse(v, { noms: n.noms })]));
    sol.forEach((pas, k) => {
      const m = k + 1;
      let ev;
      if (pas.substituer !== undefined) ev = gesteEchangeur(m, ref(pas.substituer), F(pas.sigma));
      else if (pas.mp) ev = gesteCle(m, ref(pas.mp[0]), ref(pas.mp[1]));
      else if (pas.copier !== undefined) ev = gesteDuplicateur(m, ref(pas.copier));
      else if (pas.boite) ev = gesteAutomate(m, 'boite', pas.boite, pas.entrees.map(ref), F(pas.molettes));
      else if (pas.regle) ev = gesteAutomate(m, 'regle', pas.regle, pas.entrees.map(ref), {});
      else throw new Error('pas inconnu ' + JSON.stringify(pas));
      journal.push(...ev.map((e) => ({ ...e, g: m })));
      ids.push('L' + m);
    });
    return { env, journal };
  };
  test('toutes les solutions du chapitre se rejouent par les gestes de l\'atelier, étoiles comprises', () => {
    let nb = 0;
    for (const n of chap.niveaux) {
      for (const [sol, attendu] of [[n.reference, 2], [n.referenceTrois, 3], [n.solutionConnue, null]]) {
        if (!sol) continue;
        const { env, journal } = rejouer(n, sol);
        const s = etatDepuis(journal, env);
        vrai(s.gagne, `${n.id} : commande non livrée`);
        egal(s.machines.filter((x) => x.etat !== 'acceptee').length, 0, n.id + ' : machine refusée');
        if (attendu && n.par != null) egal(etoiles(n, s.gagne.score), attendu, n.id + ' étoiles');
        nb++;
      }
    }
    vrai(nb >= 16, 'trop peu de solutions : ' + nb);
  });
  test('annuler un geste retire tout son groupe, rétablir le rend', () => {
    const n = niveauParId(chap, 'i2');
    const { env, journal } = rejouer(n, n.reference);
    const { faits } = effectifs(journal);
    const g = faits[faits.length - 1].g;
    const k = faits.filter((e) => e.g === g).length;
    egal(k, 4, 'la clé fait 4 événements');
    const J2 = [...journal, ...Array.from({ length: k }, () => ({ type: 'ANNULER' }))];
    const s = etatDepuis(J2, env);
    egal(s.feuille.lignes.length, 1); vrai(!s.gagne);
    vrai(etatDepuis([...J2, ...Array.from({ length: k }, () => ({ type: 'RETABLIR' }))], env).gagne);
  });
}

// La syntaxe des modules qui touchent au DOM (ui/app.js, ui/atelier.js…) se vérifie à part, hors de l'édition
// publique : node tools/verifier-syntaxe.mjs (LOB7 refuse les sous-processus et les imports dynamiques dans les fichiers publiés).

console.log(`\n${ok} réussis, ${ko} échoués`);
process.exit(ko ? 1 : 0);
