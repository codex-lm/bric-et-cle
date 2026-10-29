// Éditeur de molette : on règle une molette en cliquant un morceau de formule sur la feuille,
// ou en le tapant (syntaxe du noyau, analysée en direct). On ne peut pas visser une formule mal formée.
import { essayerParse, ascii } from '../core/formula.js';
import { t } from './i18n.js';
import { htmlFormule, styleLettre } from './formula-view.js';

let courant = null;

/** Les erreurs d'analyse viennent du noyau, en français : on les traduit par motif. */
function traduireErreur(m) {
  const regles = [
    [/^caractère inattendu « (.*) »$/, 'ed.err.caractere'], [/^parenthèse fermante attendue$/, 'ed.err.parenthese'],
    [/^« (.*) » attendu$/, 'ed.err.attendu'], [/^formule incomplète$/, 'ed.err.incomplet'], [/^« (.*) » inattendu$/, 'ed.err.inattendu'],
    [/^formule vide$/, 'ed.err.vide'], [/^« (.*) » en trop$/, 'ed.err.enTrop'],
  ];
  for (const [re, cle] of regles) { const x = re.exec(m); if (x) return t(cle, { c: x[1] ?? '' }); }
  return m;
}

export const editeurOuvert = () => courant;

/**
 * opts : { ancre, lettre, valeur, lettresPalette, noms, capsules, onValider(f|null), onFermer(), onTab(arriere) }
 */
export function ouvrirEditeur(opts) {
  fermerEditeur();
  const capsMap = new Map((opts.capsules || []).map((c) => [c.nom, c.f]));
  const div = document.createElement('div');
  div.className = 'editeur';
  div.setAttribute('role', 'dialog');
  div.setAttribute('aria-label', t('ed.titre', { l: opts.lettre }));
  const palette = [
    ...opts.lettresPalette.map((l) => `<button class="let" data-ins="${l}" style="${styleLettre(l)}">${l}</button>`),
    ...(opts.noms || []).map((n) => `<button class="nomb" data-ins="@${n}" title="${t('ed.nom')}">${n}</button>`),
    ...(opts.capsules || []).map((c) => `<button class="capb" data-ins="${c.nom}">${c.nom}</button>`),
    ...['¬', '∨', '→', '(', ')'].map((s) => `<button data-ins="${s === '¬' ? '~' : s === '∨' ? ' v ' : s === '→' ? ' -> ' : s}">${s}</button>`),
    `<button data-ins="⌫" title="${t('ed.effacer')}" aria-label="${t('ed.effacer')}">⌫</button>`,
  ].join('');
  div.innerHTML = `<div class="titre-ed"><span>${t('ed.titre', { l: `<b style="${styleLettre(opts.lettre)};color:var(--c)">${opts.lettre}</b>` })}</span><kbd>${t('ed.echap')}</kbd></div>
    <div class="astuce">${t('ed.astuce')}${opts.noms && opts.noms.length ? ' ' + t('ed.astuceNom') : ''}</div>
    <input type="text" spellcheck="false" autocomplete="off" aria-label="${t('ed.titre', { l: opts.lettre })}" aria-describedby="editeur-erreur">
    <div class="rendu"></div><div class="erreur" id="editeur-erreur" aria-live="polite"></div>
    <div class="palette">${palette}</div>
    <div class="actions-ed"><button class="btn secondaire" data-a="vider">${t('ed.vider')}</button><button class="btn" data-a="ok">${t('ed.valider')}</button></div>`;
  document.body.appendChild(div);
  const input = div.querySelector('input');
  const rendu = div.querySelector('.rendu'), erreur = div.querySelector('.erreur'), ok = div.querySelector('[data-a="ok"]');
  input.value = opts.valeur != null ? texteAvecCapsules(opts.valeur, opts.capsules) : '';
  let resultat = null;
  // Une saisie mal formée se voit (bord rouge) et s'entend (aria-invalid, l'erreur est la description du champ).
  const marquer = (ko) => { input.classList.toggle('ko', ko); input.setAttribute('aria-invalid', String(ko)); };
  const analyser = () => {
    const s = input.value.trim();
    if (!s) { resultat = null; rendu.innerHTML = ''; erreur.textContent = t('ed.vide'); ok.disabled = true; marquer(false); return; }
    const r = essayerParse(s, { capsules: capsMap });
    if (r.ok) { resultat = r.f; rendu.innerHTML = htmlFormule(r.f, { capsules: opts.capsules }); erreur.textContent = ''; ok.disabled = false; marquer(false); }
    else { resultat = null; erreur.textContent = traduireErreur(r.erreur); ok.disabled = true; marquer(true); }
  };
  input.addEventListener('input', analyser);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && resultat != null) { e.preventDefault(); valider(resultat); }
    if (e.key === 'Escape') { e.preventDefault(); fermerEditeur(); }
    if (e.key === 'Tab' && opts.onTab) {
      // Tab visse la valeur (si elle est bien formée) et passe à la molette suivante.
      e.preventDefault();
      const suite = opts.onTab, arriere = e.shiftKey;
      if (resultat != null && input.value.trim()) valider(resultat); else fermerEditeur();
      setTimeout(() => suite(arriere), 0);
    }
    e.stopPropagation();
  });
  div.addEventListener('mousedown', (e) => e.stopPropagation());
  div.addEventListener('click', (e) => {
    e.stopPropagation();
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.ins) {
      if (b.dataset.ins === '⌫') input.value = input.value.slice(0, -1);
      else {
        const p = input.selectionStart ?? input.value.length;
        input.value = input.value.slice(0, p) + b.dataset.ins + input.value.slice(input.selectionEnd ?? p);
        const np = p + b.dataset.ins.length;
        input.setSelectionRange(np, np);
      }
      input.focus();
      analyser();
    } else if (b.dataset.a === 'ok' && resultat != null) valider(resultat);
    else if (b.dataset.a === 'vider') valider(null);
  });
  function valider(f) {
    const cb = opts.onValider;
    fermerEditeur();
    cb(f);
  }
  analyser();
  placer(div, opts.ancre);
  setTimeout(() => { input.focus(); input.select(); }, 0);
  courant = { div, opts, definir: (f) => valider(f) };
  return courant;
}

function placer(div, ancre) {
  const r = ancre.getBoundingClientRect();
  const w = 360, h = div.offsetHeight || 260;
  let x = r.left + r.width / 2 - w / 2, y = r.bottom + 8;
  if (y + h > innerHeight - 8) y = Math.max(8, r.top - h - 8);
  x = Math.max(8, Math.min(innerWidth - w - 8, x));
  div.style.left = x + 'px';
  div.style.top = y + 'px';
}

export function fermerEditeur() {
  if (!courant) return;
  const c = courant;
  courant = null;
  c.div.remove();
  if (c.opts.onFermer) c.opts.onFermer();
}

/** Texte clavier d'une formule, où une sous-formule égale à une capsule s'écrit par son nom. */
function texteAvecCapsules(f, capsules) {
  const parF = new Map((capsules || []).map((c) => [c.f, c.nom]));
  if (parF.has(f)) return parF.get(f);
  return ascii(f);
}
