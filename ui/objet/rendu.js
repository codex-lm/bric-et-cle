// Rendu SVG d'un objet posé (ui/objet/pose.js). Les couleurs et les finitions viennent du CSS :
//   fini-verni (fabriqué), fini-brut (morceau prélevé, aperçu), fini-fantome, fini-velours (empreinte de l'écrin).
// Chaque élément porte data-ch (le chemin du noyau) ; une flèche porte aussi data-fleche, pour le miroir.
import { indiceCouleur } from '../formula-view.js';
import { poser } from './pose.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const r1 = (x) => Math.round(x * 10) / 10;

/** La silhouette d'une pièce (12 formes), dans une case de côté u. */
export function formePiece(i, u) {
  const c = u / 2, k = u / 20;
  switch (i % 12) {
    case 0: return `<circle cx="${c}" cy="${c}" r="${c - k}"/>`;
    case 1: return `<rect x="${k}" y="${k}" width="${u - 2 * k}" height="${u - 2 * k}" rx="${2.6 * k}"/>`;
    case 2: return `<path d="M${c} ${1.2 * k}L${u - k} ${u - 1.6 * k}L${k} ${u - 1.6 * k}Z" stroke-linejoin="round" stroke-width="${2 * k}"/>`;
    case 3: return `<path d="M${7 * k} ${k}h${6 * k}v${6 * k}h${6 * k}v${6 * k}h${-6 * k}v${6 * k}h${-6 * k}v${-6 * k}h${-6 * k}v${-6 * k}h${6 * k}Z"/>`;
    case 4: { const p = []; for (let j = 0; j < 6; j++) { const a = Math.PI / 6 + (j * Math.PI) / 3; p.push(`${r1(c + (c - k) * Math.cos(a))},${r1(c + (c - k) * Math.sin(a))}`); } return `<polygon points="${p.join(' ')}"/>`; }
    case 5: return `<path d="M${14 * k} ${2 * k}A${9 * k} ${9 * k} 0 1 0 ${14 * k} ${18 * k}A${7 * k} ${7 * k} 0 1 1 ${14 * k} ${2 * k}Z"/>`;
    case 6: { const p = []; for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + (j * Math.PI) / 5, r = j % 2 ? 4.2 * k : 9.6 * k; p.push(`${r1(c + r * Math.cos(a))},${r1(c + 0.6 * k + r * Math.sin(a))}`); } return `<polygon points="${p.join(' ')}" stroke-linejoin="round" stroke-width="${k}"/>`; }
    case 7: return `<path d="M${c} ${k}C${c + 3 * k} ${6 * k} ${u - 2 * k} ${9 * k} ${u - 2 * k} ${12.5 * k}A${c - 2 * k} ${c - 2 * k} 0 1 1 ${2 * k} ${12.5 * k}C${2 * k} ${9 * k} ${c - 3 * k} ${6 * k} ${c} ${k}Z"/>`;
    case 8: return `<path fill-rule="evenodd" d="M${c} ${k}a${c - k} ${c - k} 0 1 0 0.01 0ZM${c} ${6 * k}a${4 * k} ${4 * k} 0 1 1 -0.01 0Z"/>`;
    case 9: return `<path d="M${c} ${18 * k}C${4 * k} ${12 * k} ${k} ${8.5 * k} ${k} ${6 * k}A${4.6 * k} ${4.6 * k} 0 0 1 ${c} ${4 * k}A${4.6 * k} ${4.6 * k} 0 0 1 ${u - k} ${6 * k}C${u - k} ${8.5 * k} ${16 * k} ${12 * k} ${c} ${18 * k}Z"/>`;
    case 10: return `<path d="M${5 * k} ${2 * k}H${15 * k}L${u - k} ${u - 2 * k}H${k}Z" stroke-linejoin="round" stroke-width="${1.6 * k}"/>`;
    default: return `<path d="M${c} ${2 * k}a${4.2 * k} ${4.2 * k} 0 1 1 0.01 0ZM${5.2 * k} ${10 * k}a${4.2 * k} ${4.2 * k} 0 1 1 0.01 0ZM${14.8 * k} ${10 * k}a${4.2 * k} ${4.2 * k} 0 1 1 0.01 0ZM${8.8 * k} ${12 * k}h${2.4 * k}v${6.5 * k}h${-2.4 * k}Z"/>`;
  }
}

/** Le reflet de laque, posé par-dessus la silhouette. */
const reflet = (u) => `<ellipse class="reflet" cx="${u * 0.36}" cy="${u * 0.3}" rx="${u * 0.17}" ry="${u * 0.1}" transform="rotate(-25 ${u * 0.36} ${u * 0.3})"/>`;

function dessinerElement(e, u) {
  const ch = esc(e.ch);
  const pos = `transform="translate(${r1(e.x)},${r1(e.y)})"`;
  switch (e.sorte) {
    case 'plateau':
      return `<rect class="plateau p${e.prof % 2}" data-ch="${ch}" x="${r1(e.x)}" y="${r1(e.y)}" width="${r1(e.w)}" height="${r1(e.h)}" rx="${r1(u * 0.22)}"/>`;
    case 'serrure':
      return `<rect class="serrure${e.active ? ' active' : ''}" data-ch="${ch}" data-imp="${esc(e.imp)}" x="${r1(e.x)}" y="${r1(e.y)}" width="${r1(e.w)}" height="${r1(e.h)}" rx="${r1(u * 0.22)}"/>`;
    case 'piece': {
      const i = indiceCouleur(e.n);
      // Un indice se voit : autant de points blancs que sa valeur (R₁ un point, R₂ deux…), le chiffre au-delà de 4.
      const m = /([₀-₉]+)$/.exec(e.n);
      let indice = '';
      if (m) {
        const k = [...m[1]].reduce((a, c) => a * 10 + '₀₁₂₃₄₅₆₇₈₉'.indexOf(c), 0);
        // R₀, R₀₀… (zéro, zéros en tête) s'écrivent en chiffres : aucun indice ne se confond avec la lettre nue.
        const chiffres = [...m[1]].map((c) => '₀₁₂₃₄₅₆₇₈₉'.indexOf(c)).join('');
        indice = k >= 1 && k <= 4 && chiffres[0] !== '0'
          ? Array.from({ length: k }, (_, j) => `<circle class="encoche" cx="${r1(u * (0.5 + (j - (k - 1) / 2) * 0.2))}" cy="${r1(u * 0.5)}" r="${r1(u * 0.075)}"/>`).join('')
          : `<text class="encoche-texte" x="${u / 2}" y="${u * 0.56}">${chiffres}</text>`;
      }
      // Au-delà de douze lettres, la forme et la couleur reviennent : un cerclage blanc les distingue,
      // et au troisième tour (Y, Z… après M, N… et A, B…) un second cerclage, plein.
      const cycle = i >= 12 ? `<circle class="cycle" cx="${u / 2}" cy="${u / 2}" r="${r1(u * 0.47)}"/>${i >= 24 ? `<circle class="cycle cycle-2" cx="${u / 2}" cy="${u / 2}" r="${r1(u * 0.36)}"/>` : ''}` : '';
      return `<g class="piece" data-ch="${ch}" data-l="${esc(e.n)}" ${pos} style="--c:var(--p${i % 12})"><g class="corps">${formePiece(i, u)}</g>${reflet(u)}${indice}${cycle}</g>`;
    }
    case 'nom': {
      const i = indiceCouleur(e.n);
      return `<g class="piece nom" data-ch="${ch}" data-v="${esc(e.n)}" ${pos}><g class="corps">${formePiece(i, u)}</g>${reflet(u)}<circle class="scelle" cx="${u * 0.82}" cy="${u * 0.82}" r="${u * 0.13}"/></g>`;
    }
    case 'losange': {
      const w = e.w, h = e.h;
      // Le losange d'une flèche déboîtée : un clic la remboîte.
      const deb = e.deboitee ? ` data-fleche="${ch}"` : '';
      return `<path class="losange${e.deboitee ? ' deboitee' : ''}" data-ch="${ch}"${deb} d="M${r1(e.x)} ${r1(e.y + h / 2)}l${r1(w / 2)} ${r1(-h / 2)}l${r1(w / 2)} ${r1(h / 2)}l${r1(-w / 2)} ${r1(h / 2)}Z"/>`;
    }
    case 'trait':
      return `<rect class="trait" data-ch="${ch}" x="${r1(e.x)}" y="${r1(e.y)}" width="${r1(e.w)}" height="${r1(e.h)}" rx="${r1(e.h * 0.3)}"/>`;
    case 'fleche': {
      // Le losange (« ou ») et le trait (« non ») emboîtés : le losange est la pointe, le trait la hampe.
      const L = u * 0.64, H = u * 0.26, cy = e.y + e.h / 2;
      const los = (x0) => `<path d="M${r1(x0)} ${r1(cy)}l${r1(L / 2)} ${r1(-L / 2)}l${r1(L / 2)} ${r1(L / 2)}l${r1(-L / 2)} ${r1(L / 2)}Z"/>`;
      const corps = e.sens === 'g'
        ? los(e.x) + `<rect x="${r1(e.x + L * 0.75)}" y="${r1(cy - H / 2)}" width="${r1(e.w - L * 0.75)}" height="${r1(H)}" rx="${r1(H * 0.3)}"/>`
        : `<rect x="${r1(e.x)}" y="${r1(cy - H / 2)}" width="${r1(e.w - L * 0.75)}" height="${r1(H)}" rx="${r1(H * 0.3)}"/>` + los(e.x + e.w - L);
      return `<g class="fleche ${e.sens === 'g' ? 'cours' : 'lecture'}" data-ch="${ch}" data-fleche="${ch}">${corps}<rect class="prise" x="${r1(e.x - 2)}" y="${r1(e.y - 3)}" width="${r1(e.w + 4)}" height="${r1(e.h + 6)}"/></g>`;
    }
    case 'coffret':
      return `<g class="coffret" data-ch="${ch}" data-nom="${esc(e.nom)}" ${pos}><rect width="${r1(e.w)}" height="${r1(e.h)}" rx="${r1(u * 0.16)}"/><rect class="fermoir" x="${r1(e.w / 2 - u * 0.12)}" y="${r1(e.h - u * 0.24)}" width="${r1(u * 0.24)}" height="${r1(u * 0.18)}" rx="${r1(u * 0.04)}"/><text x="${r1(e.w / 2)}" y="${r1(e.h * 0.52)}">${esc(e.nom)}</text></g>`;
    default:
      return '';
  }
}

/**
 * SVG d'un objet. opts :
 *   pose (déjà calculée) ou f + options de pose (u, vues, capsules, ouvertes) ;
 *   fini : 'verni' | 'brut' | 'fantome' | 'velours' ;
 *   marques : Map chemin → classe ('sel', 'jumeau', 'ok', 'ko', 'pale') : surlignage de sous-formules ;
 *   classe, attrs : ajoutés à la balise <svg> ;
 *   label : texte pour les lecteurs d'écran (sans lui, le dessin est décoratif : l'élément porteur le décrit).
 */
export function svgObjet(opts) {
  const p = opts.pose || poser(opts.f, opts);
  const u = p.u, m = Math.ceil(u * 0.2);
  const w = Math.ceil(p.w + 2 * m), h = Math.ceil(p.h + 2 * m);
  const corps = p.els.map((e) => dessinerElement(e, u)).join('');
  let marques = '';
  if (opts.marques && opts.marques.size) {
    for (const [ch, cls] of opts.marques) {
      const n = p.noeuds.find((x) => x.ch === ch);
      if (n) marques += `<rect class="marque ${cls}" x="${r1(n.x - 2.5)}" y="${r1(n.y - 2.5)}" width="${r1(n.w + 5)}" height="${r1(n.h + 5)}" rx="${r1(u * 0.25)}"/>`;
    }
  }
  const a11y = opts.label ? `role="img" aria-label="${esc(opts.label)}"` : 'aria-hidden="true"';
  return `<svg class="objet ${opts.classe || ''}" viewBox="${-m} ${-m} ${w} ${h}" width="${w}" height="${h}" ${a11y} ${opts.attrs || ''}><g class="fini-${opts.fini || 'verni'}">${corps}</g>${marques}</svg>`;
}
