// Pilote d'Edge sans interface (muet) par le protocole DevTools, pour jouer des scénarios et prendre des photos :
//   node tools/pilote.mjs scenario.mjs        (serveur local lancé : python -m http.server 8123)
// Variables : W, H (taille de la fenêtre), SORTIE (dossier des photos, par défaut dans le dossier temporaire).
// Le scénario reçoit { va, js, clic, glisser, survol, touche, photo, attendre, centre, erreurs, souris, envoyer }.
import { spawn, spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9333 + Math.floor(Math.random() * 400);
const W = +(process.env.W || 1440), H = +(process.env.H || 900);
const profil = `${process.env.TEMP}\\edge-pilote-${PORT}`;
const sortie = process.env.SORTIE || `${tmpdir()}/bric-et-cle-photos`;
mkdirSync(sortie, { recursive: true });
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`, `--window-size=${W},${H}`, '--hide-scrollbars', '--mute-audio', 'about:blank'], { stdio: 'ignore' });
async function json(path) {
  for (let i = 0; i < 80; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}${path}`); return await r.json(); } catch { await attendre(150); }
  }
  throw new Error('Edge ne répond pas');
}
const page = (await json('/json/list')).find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let n = 0;
const enAttente = new Map();
const erreurs = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && enAttente.has(d.id)) { enAttente.get(d.id)(d); enAttente.delete(d.id); return; }
  if (d.method === 'Runtime.exceptionThrown') erreurs.push('EXC ' + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text));
  if (d.method === 'Runtime.consoleAPICalled' && (d.params.type === 'error' || d.params.type === 'warning')) erreurs.push(d.params.type + ' ' + d.params.args.map((a) => a.value ?? a.description).join(' '));
  if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error') erreurs.push('LOG ' + d.params.entry.text + ' ' + (d.params.entry.url || ''));
  // Une boîte confirm() ou alert() bloquerait la page (et le scénario) : on l'accepte en le disant.
  if (d.method === 'Page.javascriptDialogOpening') {
    console.log(`(boîte ${d.params.type} acceptée : ${d.params.message})`);
    ws.send(JSON.stringify({ id: ++n, method: 'Page.handleJavaScriptDialog', params: { accept: true } }));
  }
};
const envoyer = (method, params = {}) => new Promise((res) => { const i = ++n; enAttente.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await new Promise((r) => { ws.onopen = r; });
await envoyer('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await envoyer('Page.enable'); await envoyer('Runtime.enable'); await envoyer('Log.enable');

async function js(expr) {
  const r = await envoyer('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true });
  if (r.result.exceptionDetails) throw new Error('js: ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text));
  return r.result.result.value;
}
// L'appli peut démarrer après le chargement de la page : on attend qu'elle soit prête (window.__bc), et on recharge au besoin.
async function va(url) {
  for (let k = 0; k < 8; k++) {
    await envoyer('Page.navigate', { url }); await attendre(900);
    for (let i = 0; i < 20; i++) { const r = await envoyer('Runtime.evaluate', { expression: '!!(window.__bc && window.__bc.S && window.__bc.S.chap)', returnByValue: true }); if (r.result.result.value) return; await attendre(150); }
  }
  throw new Error('page jamais prête');
}
async function centre(sel) {
  const r = await js(`const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; e.scrollIntoView({block:'nearest', inline:'nearest'}); const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2];`);
  if (!r) throw new Error('introuvable : ' + sel);
  return r;
}
const souris = (type, x, y, extra = {}) => envoyer('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, pointerType: 'mouse', ...extra });
async function clic(sel, dx = 0, dy = 0) {
  const [x, y] = Array.isArray(sel) ? sel : await centre(sel);
  await souris('mouseMoved', x + dx, y + dy, { buttons: 0 });
  await souris('mousePressed', x + dx, y + dy);
  await souris('mouseReleased', x + dx, y + dy);
  await attendre(250);
}
async function glisser(de, vers, { lacher = true } = {}) {
  const [x0, y0] = Array.isArray(de) ? de : await centre(de);
  const [x1, y1] = Array.isArray(vers) ? vers : await centre(vers);
  await souris('mouseMoved', x0, y0, { buttons: 0 });
  await souris('mousePressed', x0, y0);
  for (let i = 1; i <= 12; i++) { await souris('mouseMoved', x0 + ((x1 - x0) * i) / 12, y0 + ((y1 - y0) * i) / 12); await attendre(16); }
  if (lacher) { await souris('mouseReleased', x1, y1); await attendre(350); }
}
async function survol(sel) { const [x, y] = Array.isArray(sel) ? sel : await centre(sel); await souris('mouseMoved', x, y, { buttons: 0 }); await attendre(150); }
async function touche(key, code = key, extra = {}) {
  await envoyer('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: extra.vk || 0, modifiers: extra.modifiers || 0, text: extra.text });
  await envoyer('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: extra.vk || 0, modifiers: extra.modifiers || 0 });
  await attendre(250);
}
async function photo(nom) {
  const r = await envoyer('Page.captureScreenshot', { format: 'png' });
  const f = `${sortie}/${nom}.png`;
  writeFileSync(f, Buffer.from(r.result.data, 'base64'));
  console.log('photo', f);
}

const scenario = (await import(pathToFileURL(process.argv[2]).href)).default;
try {
  await scenario({ va, js, clic, glisser, survol, touche, photo, attendre, centre, erreurs, souris, envoyer });
} catch (e) {
  console.log('ÉCHEC', e.message);
  await photo('echec').catch(() => {});
} finally {
  console.log(erreurs.length ? 'ERREURS :\n  ' + erreurs.join('\n  ') : 'aucune erreur de console');
  ws.close();
  // Tout l'arbre de processus d'Edge, pas seulement le parent (sinon ses enfants continuent de jouer).
  spawnSync('taskkill', ['/PID', String(edge.pid), '/T', '/F'], { stdio: 'ignore' });
}
