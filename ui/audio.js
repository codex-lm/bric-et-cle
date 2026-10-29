// Musique et bruitages. Muet jusqu'au premier geste du joueur, comme l'exigent les navigateurs.
// Les musiques bouclent par fondu enchaîné de 2 s ; chaque son répétitif a plusieurs variantes.
// Sans fichier, un substitut synthétisé (Web Audio) prend le relais : le jeu reste sonore et jouable.
import { aAudio } from './assets.js';

const VARIANTES = { sfx_pose: 3, sfx_clic: 3, sfx_cran: 3, sfx_tuyau: 2, sfx_loupe: 2, sfx_etoile: 3, sfx_clac: 2, sfx_goupille: 3, sfx_domino: 3 };
const FONDU = 2;

let ctx = null, maitre = null, busMusique = null, busSfx = null;
const tampons = new Map();
let reglages = { volume: 0.8, musique: 0.55, bruitages: 0.8 };
let jingleEnCours = null; // le gain du jingle qui joue, et la fin de son atténuation de la musique
let piste = null; // {nom, elements:[a,b], actif, timer}
let ext = 'mp3';

export function deverrouiller() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  maitre = ctx.createGain(); maitre.connect(ctx.destination);
  busMusique = ctx.createGain(); busMusique.connect(maitre);
  busSfx = ctx.createGain(); busSfx.connect(maitre);
  const a = document.createElement('audio');
  ext = a.canPlayType('audio/ogg; codecs="vorbis"') === 'probably' ? 'ogg' : 'mp3';
  appliquerVolumes();
  precharger();
  if (piste && piste.voulue) jouerMusique(piste.voulue, true);
}
export const actif = () => !!ctx;

export function regler(r) {
  reglages = { ...reglages, ...r };
  appliquerVolumes();
}
/** Les volumes suivent les réglages tout de suite, même au milieu d'une rampe (jingle) : rien ne remonte tout seul. */
function appliquerVolumes() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const viser = (param, v) => { param.cancelScheduledValues(t); param.setTargetAtTime(v, t, 0.02); };
  viser(maitre.gain, reglages.volume);
  viser(busMusique.gain, jingleEnCours ? reglages.musique * 0.2 : reglages.musique);
  viser(busSfx.gain, reglages.bruitages);
  if (jingleEnCours) viser(jingleEnCours.gain.gain, reglages.musique);
}
// Page cachée : on suspend tout le son, et on le reprend au retour.
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend(); else ctx.resume();
});

const fichier = (nom) => `assets/audio/${nom}.${ext}`;

async function charger(nom) {
  if (tampons.has(nom)) return tampons.get(nom);
  const p = (async () => {
    if (!aAudio(`${nom}.${ext}`) && !aAudio(`${nom}.mp3`)) return null;
    try {
      const r = await fetch(aAudio(`${nom}.${ext}`) ? fichier(nom) : `assets/audio/${nom}.mp3`);
      return await ctx.decodeAudioData(await r.arrayBuffer());
    } catch { return null; }
  })();
  tampons.set(nom, p);
  return p;
}

function precharger() {
  const noms = ['sfx_serrure', 'sfx_bloque', 'sfx_capsule', 'sfx_fissure', 'sfx_couvercle', 'sfx_cible',
    // les sons de l'atelier Bric & Clé
    'sfx_declic', 'sfx_pop', 'sfx_boing', 'sfx_vernis', 'sfx_rivet', 'sfx_levier', 'sfx_aspire', 'sfx_remontoir', 'sfx_velours',
    'sfx_tampon', 'sfx_rembobine', 'sfx_copeaux', 'sfx_rangement', 'sfx_cloche', 'sfx_miroir', 'sfx_dore'];
  for (const [n, k] of Object.entries(VARIANTES)) for (let i = 0; i < k; i++) noms.push(`${n}_${'abc'[i]}`);
  noms.forEach((n) => charger(n));
}

const derniereVariante = {};
/** Joue un bruitage. options : {volume, delai, vitesse} */
export async function sfx(nom, options = {}) {
  if (!ctx) return;
  let n = nom;
  if (VARIANTES[nom]) {
    let i;
    do { i = Math.floor(Math.random() * VARIANTES[nom]); } while (VARIANTES[nom] > 1 && i === derniereVariante[nom]);
    derniereVariante[nom] = i;
    n = `${nom}_${'abc'[i]}`;
  }
  const t0 = ctx.currentTime + (options.delai || 0);
  const tampon = await charger(n);
  const g = ctx.createGain();
  g.gain.value = options.volume ?? 1;
  g.connect(busSfx);
  if (tampon) {
    const s = ctx.createBufferSource();
    s.buffer = tampon;
    s.playbackRate.value = options.vitesse || 1;
    s.connect(g);
    s.start(Math.max(t0, ctx.currentTime));
  } else synthese(nom, g, Math.max(t0, ctx.currentTime));
}

/** Substituts synthétisés : de petits sons mécaniques. */
function synthese(nom, sortie, t) {
  const bip = (f, d, type = 'square', v = 0.15, glisse = null) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (glisse) o.frequency.exponentialRampToValueAtTime(glisse, t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(sortie); o.start(t); o.stop(t + d + 0.02);
  };
  const table = {
    sfx_pose: () => bip(140, 0.12, 'sine', 0.4, 60), sfx_clic: () => bip(1800, 0.03, 'square', 0.12),
    sfx_cran: () => bip(2400, 0.02, 'square', 0.08), sfx_manivelle: () => { for (let i = 0; i < 6; i++) bip(900 + i * 40, 0.03, 'square', 0.06); },
    sfx_remplir: () => bip(1200, 0.05, 'triangle', 0.15), sfx_serrure: () => { bip(700, 0.05); bip(1100, 0.08); },
    sfx_tuyau: () => bip(300, 0.25, 'sawtooth', 0.05, 80), sfx_bloque: () => bip(110, 0.35, 'sawtooth', 0.15, 70),
    sfx_engrenages: () => bip(600, 0.5, 'square', 0.03, 900), sfx_capsule: () => bip(500, 0.12, 'sine', 0.2, 900),
    sfx_fissure: () => bip(3000, 0.08, 'sawtooth', 0.05, 1200), sfx_loupe: () => bip(800, 0.08, 'sine', 0.08, 1400),
    sfx_cible: () => { bip(880, 0.5, 'sine', 0.2); bip(1320, 0.6, 'sine', 0.12); }, sfx_pliage: () => bip(200, 0.6, 'sawtooth', 0.04, 120),
    sfx_gravure: () => bip(2200, 0.4, 'sawtooth', 0.03, 1800), sfx_etoile: () => bip(160, 0.12, 'sine', 0.35, 90),
    sfx_clac: () => { bip(2600, 0.02, 'square', 0.12); bip(900, 0.06, 'triangle', 0.15); }, sfx_declic: () => bip(1600, 0.05, 'triangle', 0.1, 2400),
    sfx_goupille: () => bip(3200, 0.03, 'sine', 0.12), sfx_pop: () => bip(400, 0.08, 'sine', 0.3, 1200), sfx_boing: () => bip(220, 0.4, 'sine', 0.2, 520),
    sfx_vernis: () => bip(5000, 0.35, 'sawtooth', 0.02, 3000), sfx_rivet: () => bip(1900, 0.06, 'triangle', 0.2), sfx_levier: () => { bip(180, 0.12, 'square', 0.15, 90); bip(1200, 0.03); },
    sfx_aspire: () => bip(300, 0.15, 'sawtooth', 0.06, 1500), sfx_remontoir: () => { for (let i = 0; i < 8; i++) bip(1400 + i * 60, 0.025, 'square', 0.05); },
    sfx_velours: () => bip(120, 0.2, 'sine', 0.35, 70), sfx_tampon: () => bip(140, 0.15, 'sine', 0.4, 80), sfx_domino: () => bip(1500, 0.03, 'triangle', 0.12),
    sfx_rembobine: () => bip(400, 0.35, 'sawtooth', 0.04, 1600), sfx_copeaux: () => bip(3000, 0.4, 'sawtooth', 0.02, 1500), sfx_rangement: () => bip(600, 0.6, 'square', 0.03, 200),
    sfx_cloche: () => { bip(1320, 0.9, 'sine', 0.2); bip(2640, 0.5, 'sine', 0.06); }, sfx_miroir: () => { for (let i = 0; i < 4; i++) bip(1100 - i * 120, 0.04, 'triangle', 0.08); },
    sfx_dore: () => { bip(1568, 0.5, 'sine', 0.12); bip(2093, 0.6, 'sine', 0.08); },
  };
  (table[nom] || (() => bip(1000, 0.05)))();
}

/** Musique en boucle, fondu enchaîné de 2 s. */
export function jouerMusique(nom, force = false) {
  if (!piste) piste = { voulue: nom };
  piste.voulue = nom;
  if (!ctx) return;
  if (!force && piste.nom === nom) return;
  arreterMusique();
  if (!nom || !(aAudio(`${nom}.${ext}`) || aAudio(`${nom}.mp3`))) return;
  const src = aAudio(`${nom}.${ext}`) ? fichier(nom) : `assets/audio/${nom}.mp3`;
  const elements = [0, 1].map(() => {
    const a = new Audio(src);
    a.preload = 'auto';
    const s = ctx.createMediaElementSource(a);
    const g = ctx.createGain();
    g.gain.value = 0;
    s.connect(g); g.connect(busMusique);
    return { a, g };
  });
  piste = { voulue: nom, nom, elements, actif: 0 };
  const lancer = (k) => {
    const { a, g } = elements[k];
    a.currentTime = 0;
    a.play().catch(() => {});
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(1, ctx.currentTime + FONDU);
  };
  lancer(0);
  piste.timer = setInterval(() => {
    const cur = elements[piste.actif];
    if (!cur.a.duration || isNaN(cur.a.duration)) return;
    if (cur.a.duration - cur.a.currentTime < FONDU + 0.15) {
      cur.g.gain.cancelScheduledValues(ctx.currentTime);
      cur.g.gain.setValueAtTime(cur.g.gain.value, ctx.currentTime);
      cur.g.gain.linearRampToValueAtTime(0, ctx.currentTime + FONDU);
      piste.actif = 1 - piste.actif;
      lancer(piste.actif);
    }
  }, 200);
}

export function arreterMusique() {
  if (!piste || !piste.elements) return;
  clearInterval(piste.timer);
  for (const { a, g } of piste.elements) {
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    setTimeout(() => a.pause(), 700);
  }
  piste = { voulue: piste.voulue };
}

/** Un jingle par-dessus la musique, qui baisse le temps qu'il joue. */
export async function jingle(nom) {
  if (!ctx) return;
  const t = await charger(nom);
  if (!t) return sfx('sfx_cible');
  // La musique s'efface sous le jingle ; elle reviendra au volume réglé à ce moment-là, pas à celui d'avant.
  busMusique.gain.cancelScheduledValues(ctx.currentTime);
  busMusique.gain.setTargetAtTime(reglages.musique * 0.2, ctx.currentTime, 0.1);
  // Le jingle est de la musique : il suit le curseur Musique (et le volume général, donc le bouton Son).
  const g = ctx.createGain();
  g.gain.value = reglages.musique;
  g.connect(maitre);
  const s = ctx.createBufferSource();
  s.buffer = t; s.connect(g); s.start();
  const moi = { gain: g };
  jingleEnCours = moi;
  setTimeout(() => {
    if (jingleEnCours !== moi) return;
    jingleEnCours = null;
    busMusique.gain.cancelScheduledValues(ctx.currentTime);
    busMusique.gain.setTargetAtTime(reglages.musique, ctx.currentTime, 0.4);
  }, (t.duration + 0.5) * 1000);
}
