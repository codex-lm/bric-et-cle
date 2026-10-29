// Manifeste des médias. Chaque média a un nom fixe ; s'il est listé dans assets/manifest.json, le jeu l'utilise,
// sinon il s'en passe (les objets sont dessinés par le code, les sons ont un repli synthétique).

let manifeste = { img: [], audio: [] };

export async function chargerManifeste() {
  try {
    const r = await fetch('assets/manifest.json', { cache: 'no-cache' });
    if (r.ok) manifeste = await r.json();
  } catch { /* jeu sans médias */ }
  return manifeste;
}
export const aImage = (nom) => manifeste.img.includes(nom);
export const aAudio = (nom) => manifeste.audio.includes(nom);
export const urlImage = (nom) => 'assets/img/' + nom;

/** Les rendus présents habillent le jeu : une classe par image sur <html> (img-bois-bouleau…), que la feuille de style lit. */
export function habiller() {
  const r = document.documentElement;
  for (const nom of ['bois_bouleau', 'bois_noyer', 'velours', 'rivet', 'rivet_enfonce', 'rivet_rouille', 'titre_fond']) {
    r.classList.toggle('img-' + nom.replaceAll('_', '-'), aImage(nom + '.png'));
  }
}
/** La figurine de fer-blanc d'un automate (théorème ou règle scellée), si son rendu est là ; sinon ''. */
export function figurine(ref, cls = 'figurine') {
  const nom = `automate_${ref}.png`;
  return aImage(nom) ? `<img class="${cls}" src="${urlImage(nom)}" alt="" draggable="false">` : '';
}

// ---------------------------------------------------------------- formes des lettres en notation (mode Aa, éditeur)
// Douze formes, un fichier SVG chacune dans assets/formes (LOB7 refuse les URL au schéma « data »).
export const formeCSS = (i) => `url("assets/formes/forme_${String(i % 12).padStart(2, '0')}.svg")`;
