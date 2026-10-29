# Bric & Clé

*A browser puzzle game set in a 1950s toy workshop. Clients order strange objects made of lacquered pieces, brass
diamonds and bars; you build them with four moulds, a dial-driven Swapper, keys and wind-up tin automatons. Under
the toy, every object is a propositional-logic formula and every gesture a proof step, checked by an independent
verifier. English by default, French available. Static HTML/CSS/ES modules, no dependency: serve the folder and
open `index.html`. Code under MIT, rendered images under CC0-1.0, other media: see `ASSETS-LICENSE.md`.*

Un jeu de puzzle en navigateur, dans un atelier de jouets en bois laqué des années 50. Des clients commandent
d'étranges objets faits de pièces colorées, de losanges et de traits ; on les fabrique avec quatre moules, un
Échangeur, des clés et des automates. Sous le jouet, chaque objet est une formule de logique propositionnelle et
chaque geste une étape de preuve : le jeu refait le cours *Logique — livre I* (version 10, sections 1 à 8) de
Cédric Bernadac, des quatre axiomes de Hilbert et Ackermann au lemme par cas, plus deux défis ouverts.

(Le dossier s'appelle encore `la-grande-feuille`, l'ancien nom du jeu.)

## Lancer le jeu

Le jeu est statique (HTML, CSS, modules ES, sans dépendance). Il faut seulement un serveur local,
car les navigateurs refusent les modules ES en `file://` :

```bash
python -m http.server 8123
```

puis ouvrir <http://localhost:8123>. Résolution conseillée 1440 × 900, minimum 1280 × 720.

## Tests

```bash
node tests/run.mjs
```

75 tests. Le noyau d'abord : analyse, substitution simultanée, modus ponens et diagnostics, boîtes, capsules,
journal et annulation, sauvegarde ; chaque solution de référence est rejouée, vérifiée, comptée, puis **dépliée
jusqu'aux axiomes, débarrassée de la substitution et relue par le vérificateur indépendant** (portage de
l'annexe B). Puis l'atelier :

- **relecture des objets** : le dessin de chaque formule du chapitre, et de 10 000 formules tirées au hasard
  avec des vues et des coffrets au hasard, se relit en exactement la même formule (deux formules différentes ne
  se dessinent jamais pareil) ;
- **gestes** : toutes les solutions du chapitre se rejouent par les gestes de l'atelier (Échangeur, clé,
  Duplicateur, automates), étoiles comprises, et annuler retire un geste entier.

## La grammaire des objets

| Logique | Atelier |
| --- | --- |
| lettre R, S, T… | pièce laquée, avec sa couleur et sa forme (boule vermillon, cube outremer, pyramide moutarde…) |
| A ∨ B | A ◆ B : un losange entre les deux |
| ¬A | ━A : un trait épais devant |
| A → B, c'est-à-dire B ∨ ¬A | B ◆━ [A] : le losange suivi du trait forme une flèche verte qui vise B ; A est posé sur la serrure |
| parenthèses | plateaux de bois |
| capsule | coffret laqué noir |

Un clic sur une flèche la retourne en vue de lecture, [A] ━◆ B (rose), puis la déboîte en B ◆ ━A ; le levier
Miroir les retourne toutes. Ce n'est que de l'affichage : gratuit, sans rivet, la formule ne change pas.

## Comment on joue

- **L'écrin**, en haut, montre la commande en creux dans le velours. Le couvercle porte autant de rivets que le
  nombre d'objets du cours (le « par »).
- **L'Échangeur** (E) : glisser un objet par son socle dans le poste, puis remplir les molettes, une par sorte de
  pièce ; une molette change toutes les pièces de sa forme d'un coup (substitution simultanée). Pour la remplir :
  cliquer la molette puis un morceau n'importe où (l'écrin compris ; chaque nouveau clic élargit au plateau
  parent), ou y glisser un morceau, ou taper sa valeur (Aa). Tirer le levier (Espace).
- **La clé** : glisser un objet par son socle sur un objet à flèche. S'il a exactement la forme de la serrure,
  ce que la flèche retenait se libère (modus ponens) ; sinon la clé rebondit et le premier désaccord s'allume.
- **Le Duplicateur** (D), **les automates** (un théorème démontré : on nourrit ses berceaux dans l'ordre, il
  trouve seul ses réglages), **l'automate scellé** (la règle du prélemme), **les coffrets** (N emballe le
  morceau saisi).
- Ctrl+Z annule un geste entier, Ctrl+Maj+Z le rétablit ; Suppr jette un objet aux copeaux ; H ouvre la notice.
- À la livraison, l'objet est déplié jusqu'aux moules : une réaction en chaîne de dominos montre les gestes
  cachés, puis le vérificateur indépendant tamponne « Contrôlé ».

## Architecture

```text
core/        le noyau logique, pur, sans DOM (inchangé par la refonte)
levels/      chapitre1.json : 12 commandes, 2 enveloppes noires, solutions de référence, clients et surnoms
ui/objet/    pose.js (formule → éléments posés, et relecture), rendu.js (SVG)
ui/          app.js (coquille, sauvegarde, livraison), atelier.js (l'écran d'une commande), gestes.js
             (gestes → événements du journal), screens.js, i18n.js (fr, en), editor.js, audio.js, assets.js
assets/      audio/ (ElevenLabs), fonts/, img/ (rendus Blender de Kimi K3.1 Pro, affichés s'ils sont là)
tools/       gen_audio.py, manifest.py, pilote.mjs (Edge sans interface, pour rejouer des scénarios)
tests/       run.mjs
```

L'interface n'écrit jamais rien elle-même : chaque geste devient un groupe d'événements du journal, et l'état
se recalcule à partir du journal avec le noyau. Aucune requête réseau externe.
