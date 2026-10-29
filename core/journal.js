// Journal d'un niveau : une suite d'événements qu'on ne réécrit jamais.
// L'état (feuille, machines, capsules, loupe) se recalcule entièrement à partir du journal.
// Annuler et Rétablir ajoutent des événements ; rien n'est supprimé.
//
// Événements : {type, ...données}. Les formules y sont écrites en texte (syntaxe clavier, @ devant les noms),
// pour qu'un journal sauvegardé se relise à l'identique.
//   POSER {m, sorte, ref, cote}      BRANCHER {m, port, ligne}     DEBRANCHER {m, port}
//   REGLER {m, lettre, f|null}       ACTIONNER {m}                 RETIRER {m}
//   DEMONTER {m}                     COTE {m, cote}
//   NOMMER {nom, f}                  OUBLIER {nom}                 AUTO {nom, auto}
//   LOUPE {ligne, chemin}            ANNULER {}                    RETABLIR {}
import { parse, lettres } from './formula.js';
import { nouvelleFeuille, ajouter } from './sheet.js';
import { lettresLibres } from './rules.js';
import { hautDe, nbPorts } from './levels.js';
import { formulesNouvelles } from './score.js';

export const ACTIONS_SANS_ANNULATION = new Set(['ANNULER', 'RETABLIR']);

/** Les événements qui comptent, une fois les annulations et rétablissements appliqués. */
export function effectifs(journal) {
  const faits = [], defaits = [];
  for (const e of journal) {
    if (e.type === 'ANNULER') { if (faits.length) defaits.push(faits.pop()); }
    else if (e.type === 'RETABLIR') { if (defaits.length) faits.push(defaits.pop()); }
    else { faits.push(e); defaits.length = 0; }
  }
  return { faits, defaits };
}

export function etatInitial(env) {
  return {
    feuille: nouvelleFeuille(hautDe(env.niveau), env.ctx),
    machines: [],
    capsules: (env.capsulesInitiales || []).map((c) => ({ ...c })),
    loupe: {},
    gagne: null,
    dernier: null,
  };
}

/** L'état après tout le journal (ou ses n premiers événements). */
export function etatDepuis(journal, env, n = journal.length) {
  const { faits } = effectifs(journal.slice(0, n));
  let s = etatInitial(env);
  for (const e of faits) s = appliquer(s, e, env);
  return s;
}

const F = (txt) => (txt == null ? null : parse(txt));

/** Applique un événement. Fonction pure : rend un nouvel état. */
export function appliquer(s, e, env) {
  const machines = s.machines.map((m) => ({ ...m, ports: m.ports.slice(), molettes: { ...m.molettes } }));
  const trouver = (id) => machines.find((m) => m.id === id);
  let { feuille, capsules, loupe, gagne } = s;
  let dernier = null;
  const m = e.m !== undefined ? trouver(e.m) : null;
  const libre = (mm) => mm && mm.etat !== 'acceptee';

  switch (e.type) {
    case 'POSER': {
      if (trouver(e.m)) break;
      const n = nbPorts(env.chap, e.sorte, e.ref);
      machines.push({ id: e.m, sorte: e.sorte, ref: e.ref || null, cote: e.cote || 'droite', ports: Array(n).fill(null), molettes: {}, etat: 'posee', diag: null, sortie: null });
      break;
    }
    case 'COTE':
      if (m) m.cote = e.cote;
      break;
    case 'BRANCHER': {
      if (!libre(m) || e.port < 0 || e.port >= m.ports.length) break;
      const existe = feuille.haut.some((l) => l.id === e.ligne) || feuille.lignes.some((l) => l.id === e.ligne);
      if (!existe) break;
      m.ports[e.port] = e.ligne;
      m.etat = 'posee'; m.diag = null;
      break;
    }
    case 'DEBRANCHER':
      if (libre(m)) { m.ports[e.port] = null; m.etat = 'posee'; m.diag = null; }
      break;
    case 'REGLER':
      if (libre(m)) {
        if (e.f == null) delete m.molettes[e.lettre];
        else m.molettes[e.lettre] = F(e.f);
        m.etat = 'posee'; m.diag = null;
      }
      break;
    case 'ACTIONNER': {
      if (!libre(m)) break;
      const r = justification(m, feuille, env);
      if (!r.ok) { m.etat = 'refusee'; m.diag = r.diag; dernier = { type: 'refus', m: m.id, diag: r.diag }; break; }
      const id = 'L' + m.id;
      const res = ajouter(feuille, id, r.just, env.ctx);
      if (!res.ok) { m.etat = 'refusee'; m.diag = res.diag; dernier = { type: 'refus', m: m.id, diag: res.diag }; break; }
      feuille = res.feuille;
      m.etat = 'acceptee'; m.diag = null; m.sortie = id; m.info = res.info;
      dernier = { type: 'accepte', m: m.id, ligne: id };
      if (!gagne && res.ligne.f === env.niveau.cibleF) gagne = { ligne: id, score: formulesNouvelles(feuille) };
      break;
    }
    case 'RETIRER':
      if (libre(m)) machines.splice(machines.indexOf(m), 1);
      break;
    case 'DEMONTER': {
      if (!m) break;
      const r = demonter(machines, feuille, m.id);
      feuille = r.feuille;
      machines.length = 0; machines.push(...r.machines);
      if (gagne && r.lignes.has(gagne.ligne)) gagne = null;
      const lp = { ...loupe };
      for (const id of r.lignes) delete lp[id];
      loupe = lp;
      break;
    }
    case 'NOMMER': {
      const f = F(e.f);
      if (!capsules.some((c) => c.nom === e.nom || c.f === f)) capsules = [...capsules, { nom: e.nom, f, auto: true }];
      break;
    }
    case 'OUBLIER':
      capsules = capsules.filter((c) => c.nom !== e.nom);
      break;
    case 'AUTO':
      capsules = capsules.map((c) => (c.nom === e.nom ? { ...c, auto: !!e.auto } : c));
      break;
    case 'LOUPE': {
      const set = new Set(loupe[e.ligne] || []);
      if (set.has(e.chemin)) set.delete(e.chemin); else set.add(e.chemin);
      loupe = { ...loupe, [e.ligne]: [...set] };
      break;
    }
    default:
      break;
  }
  return { feuille, machines, capsules, loupe, gagne, dernier };
}

/** La justification qu'une machine écrirait, ou un diagnostic si elle n'est pas prête. */
export function justification(m, feuille, env) {
  const lire = (id) => feuille.haut.find((l) => l.id === id)?.f ?? feuille.lignes.find((l) => l.id === id)?.f;
  switch (m.sorte) {
    case 'copier':
      if (!m.ports[0]) return { ok: false, diag: { type: 'incomplet' } };
      return { ok: true, just: { type: 'copier', de: m.ports[0] } };
    case 'substituer': {
      if (!m.ports[0]) return { ok: false, diag: { type: 'incomplet' } };
      const sigma = {};
      for (const x of lettres(lire(m.ports[0]))) if (m.molettes[x] != null) sigma[x] = m.molettes[x];
      return { ok: true, just: { type: 'substituer', de: m.ports[0], sigma } };
    }
    case 'mp':
      if (!m.ports[0] || !m.ports[1]) return { ok: false, diag: { type: 'incomplet' } };
      return { ok: true, just: { type: 'mp', a: m.ports[0], imp: m.ports[1] } };
    case 'boite': {
      let k = 0;
      while (k < m.ports.length && m.ports[k]) k++;
      if (k === 0) return { ok: false, diag: { type: 'incomplet' } };
      if (m.ports.slice(k).some(Boolean)) return { ok: false, diag: { type: 'ordre', port: k } };
      const T = env.ctx.theoremes[m.ref].f;
      const molettes = {};
      for (const x of lettresLibres(T, k)) if (m.molettes[x] != null) molettes[x] = m.molettes[x];
      return { ok: true, just: { type: 'boite', thm: m.ref, entrees: m.ports.slice(0, k), molettes } };
    }
    case 'regle':
      if (m.ports.some((p) => !p)) return { ok: false, diag: { type: 'incomplet' } };
      return { ok: true, just: { type: 'regle', regle: m.ref, entrees: m.ports.slice() } };
    default:
      return { ok: false, diag: { type: 'inconnu' } };
  }
}

/** Ce que démonter emporterait : la machine, sa ligne, et tout ce qui en dépend. */
export function aDemonter(machines, idMachine) {
  const parti = new Set([idMachine]);
  const lignes = new Set();
  const m0 = machines.find((m) => m.id === idMachine);
  if (m0 && m0.sortie) lignes.add(m0.sortie);
  let change = true;
  while (change) {
    change = false;
    for (const m of machines) {
      if (parti.has(m.id) || m.etat !== 'acceptee') continue;
      if (m.ports.some((p) => lignes.has(p))) {
        parti.add(m.id);
        if (m.sortie) lignes.add(m.sortie);
        change = true;
      }
    }
  }
  return { machines: parti, lignes };
}

function demonter(machines, feuille, idMachine) {
  const { machines: parti, lignes } = aDemonter(machines, idMachine);
  const restantes = machines.filter((m) => !parti.has(m.id)).map((m) => {
    if (m.etat === 'acceptee') return m;
    const ports = m.ports.map((p) => (lignes.has(p) ? null : p));
    return { ...m, ports, etat: 'posee', diag: null };
  });
  return {
    machines: restantes,
    feuille: { haut: feuille.haut, lignes: feuille.lignes.filter((l) => !lignes.has(l.id)) },
    lignes,
  };
}
