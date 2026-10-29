// Score : on compte les formules nouvelles écrites par le joueur. Une copie n'en crée pas.

/** Nombre de lignes écrites dont la formule n'était pas déjà sur la feuille. */
export function formulesNouvelles(feuille, jusqua = null) {
  const vues = new Set(feuille.haut.map((l) => l.f));
  let n = 0;
  for (const l of feuille.lignes) {
    if (!vues.has(l.f)) { n++; vues.add(l.f); }
    if (l.id === jusqua) break;
  }
  return n;
}

/** Une étoile : cible atteinte. Deux : au par. Trois : sous le par. Un défi ouvert (par nul) donne une étoile. */
export function etoiles(niveau, n) {
  if (n == null) return 0;
  if (niveau.par == null) return 1;
  if (n < niveau.par) return 3;
  if (n === niveau.par) return 2;
  return 1;
}
