// Les gestes de l'atelier, traduits en événements du journal (fonctions pures, testées sous Node).
// Un geste qui fabrique pose une machine, la branche, la règle et l'actionne : le noyau seul décide.
// Les formules des molettes sont écrites en texte, pour qu'un journal sauvegardé se relise à l'identique.
import { ascii } from '../core/formula.js';

const regler = (m, molettes) => Object.entries(molettes || {}).filter(([, f]) => f != null).map(([lettre, f]) => ({ type: 'REGLER', m, lettre, f: ascii(f) }));

/** L'Échangeur : une molette par lettre (molettes : lettre → formule). */
export const gesteEchangeur = (m, entree, molettes) => [
  { type: 'POSER', m, sorte: 'substituer', ref: null, cote: 'droite' },
  { type: 'BRANCHER', m, port: 0, ligne: entree },
  ...regler(m, molettes),
  { type: 'ACTIONNER', m },
];

/** La clé : présenter l'objet `cle` à la serrure de l'objet `serrure`. */
export const gesteCle = (m, cle, serrure) => [
  { type: 'POSER', m, sorte: 'mp', ref: null, cote: 'droite' },
  { type: 'BRANCHER', m, port: 0, ligne: cle },
  { type: 'BRANCHER', m, port: 1, ligne: serrure },
  { type: 'ACTIONNER', m },
];

/** Le Duplicateur : un jumeau. */
export const gesteDuplicateur = (m, id) => [
  { type: 'POSER', m, sorte: 'copier', ref: null, cote: 'droite' },
  { type: 'BRANCHER', m, port: 0, ligne: id },
  { type: 'ACTIONNER', m },
];

/** Un automate (sorte 'boite' ou 'regle') : ses berceaux nourris dans l'ordre, puis ses molettes libres. */
export const gesteAutomate = (m, sorte, ref, berceaux, molettes) => [
  { type: 'POSER', m, sorte, ref, cote: 'droite' },
  ...berceaux.map((ligne, port) => ({ type: 'BRANCHER', m, port, ligne })),
  ...(sorte === 'boite' ? regler(m, molettes) : []),
  { type: 'ACTIONNER', m },
];
