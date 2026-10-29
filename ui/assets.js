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
const FORMES = [
  '<circle cx="5" cy="5" r="5"/>',
  '<rect width="10" height="10"/>',
  '<path d="M5 0L10 10H0z"/>',
  '<path d="M5 0L10 5L5 10L0 5z"/>',
  '<path d="M2.5 0h5L10 5l-2.5 5h-5L0 5z"/>',
  '<path d="M5 0l1.5 3.5L10 4l-2.7 2.4L8 10 5 8 2 10l.7-3.6L0 4l3.5-.5z"/>',
  '<path d="M3.5 0h3v3.5H10v3H6.5V10h-3V6.5H0v-3h3.5z"/>',
  '<path d="M0 10A5 5 0 0 1 10 10z"/>',
  '<path d="M5 0l5 3.6-1.9 6.4H1.9L0 3.6z"/>',
  '<rect width="10" height="5" y="2.5"/>',
  '<path d="M0 0h10L5 10z"/>',
  '<circle cx="5" cy="5" r="5"/><circle cx="5" cy="5" r="2" fill="#fff"/>',
];
export function formeCSS(i) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'>${FORMES[i % FORMES.length]}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
