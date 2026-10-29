# Bric & Clé — brief des médias

Chaque média a un nom de fichier fixe. Le jeu est complet sans aucun média : les objets sont dessinés par le
code (SVG), et ce dessin reste la référence. Un rendu déposé au bon endroit l'enrichit sans changer le code ; le
manifeste est `assets/manifest.json` (`python tools/manifest.py`).

## 1. Rendus Blender, par Kimi K3.1 Pro (mode swarm)

Le brief complet est dans `C:\dev\la-grande-feuille-art\BRIEF.md`, avec son contrôle automatique
(`scripts/verifier_rendus.py`) et sa planche aux tailles du jeu (`scripts/planche.ps1`). L'ancienne direction
(machines de laiton, feuille) est rangée dans `ancienne-direction/`.

**Direction artistique.** Un atelier de jouets de designer des années 50 : laques franches, laiton, velours vert
sombre, établi de bouleau miel (noyer le soir). Les automates sont des jouets mécaniques en fer-blanc
lithographié, avec leur clé de remontage. Aucun texte, aucun logo, aucun design emprunté.

| Fichiers | Taille | Où le jeu les montre |
| --- | --- | --- |
| `bois_bouleau.png` | 512 × 512, tuile | l'établi et l'écran titre, de jour |
| `bois_noyer.png` | 512 × 512, tuile | l'étagère, l'écrin, le râtelier, le coffret ; l'établi le soir (assombri) |
| `velours.png` | 512 × 512, tuile | le velours de l'écrin et des tuiles du coffret |
| `rivet.png`, `rivet_enfonce.png`, `rivet_rouille.png` | 64 × 64 | les rivets du couvercle de l'écrin (14 px) |
| `automate_TL0.png`, `_CV`, `_AF`, `_S`, `_C`, `_MPI`, `_TL0bis`, `_LPC`, `_prelemme` | 256 × 256 | la carte de l'automate au râtelier (42 px), la tête de son poste, la vitrine |
| `titre_fond.png` | 1920 × 1080 | le fond de l'écran titre (les objets décoratifs du code s'effacent) |

Branchement : `ui/assets.js` (`habiller` met une classe `img-…` sur `<html>` pour chaque rendu présent,
`figurine` rend l'image d'un automate) et la section « rendus (habillage) » de `styles.css`. Les pièces, losanges
et traits restent dessinés par le code.

## 2. Musique (prompts Suno ; générée ici avec ElevenLabs Music)

Instrumentale, sans voix. `.mp3` et `.ogg` ; boucles par fondu enchaîné de 2 s dans le code. −16 LUFS.

| Fichier | Durée | Prompt |
| --- | --- | --- |
| `mus_titre` | 60–90 s | *instrumental, no vocals, gentle chamber piece, felt piano, celesta, pizzicato strings, soft ticking clockwork percussion, curious and warm, 1920s study room, 84 BPM* |
| `mus_atelier` | 2–3 min | *instrumental, no vocals, calm focus loop, felt piano and marimba, light clockwork ticks, sparse, unhurried, thinking music, no drums, 80 BPM* |
| `mus_atelier_2` | 2–3 min | *instrumental, no vocals, focused loop with gentle forward motion, felt piano, celesta, pizzicato cello, soft mechanical rhythm, slightly more intricate, 90 BPM* |
| `mus_defi` | 2–3 min | *instrumental, no vocals, quiet tension, low strings drone, music box motif, ticking clock, patient and mysterious, 72 BPM* |
| `mus_victoire` | 5–8 s | *instrumental, no vocals, short triumphant sting, celesta and brass, warm resolution, ends cleanly* |

## 3. Bruitages, ElevenLabs

Attaque nette, aucun silence en tête, crête à −3 dBFS, `.ogg` et `.mp3`. Variantes `_a`, `_b`, `_c` pour
les sons répétitifs. Script de génération : `tools/gen_audio.py` (provenance dans `assets/audio/provenance.json`).

### Les sons de l'atelier (`python tools/gen_audio.py atelier`)

| Fichier | Moment du jeu |
| --- | --- |
| `sfx_clac` (a, b) / `sfx_declic` | une flèche se remboîte / se déboîte |
| `sfx_goupille` (a, b, c) | les goupilles de la serrure basculent, de plus en plus aigu, avant le verdict de la clé |
| `sfx_pop` / `sfx_boing` | la clé ouvre (après `sfx_serrure`) / la clé coince (après `sfx_bloque`) |
| `sfx_levier`, `sfx_vernis`, `sfx_rivet` | le levier de l'Échangeur, le pschht du vernis, le rivet d'un objet neuf |
| `sfx_dore` | l'aperçu devient la commande (une fois) |
| `sfx_aspire`, `sfx_remontoir` | un berceau prend un objet ; on remonte l'automate |
| `sfx_velours`, `sfx_tampon`, `sfx_cloche` | l'objet tombe dans l'écrin ; tampons « Contrôlé » et « Livré » ; record battu |
| `sfx_domino` (a, b, c) | la réaction en chaîne |
| `sfx_rembobine`, `sfx_copeaux`, `sfx_rangement`, `sfx_miroir` | ↶ et ↷, Suppr, Recommencer, le levier Miroir |

### Les sons de la première version (gardés ou en réserve)

| Fichier | Durée | Prompt |
| --- | --- | --- |
| `sfx_pose` (a, b, c) | 0,3 s | *small brass instrument set down on a wooden desk, soft thud* |
| `sfx_clic` (a, b, c) | 0,15 s | *metal plug snapping into a socket, crisp click* |
| `sfx_cran` (a, b, c) | 0,2 s | *single detent of a knurled brass dial turning one notch* |
| `sfx_manivelle` | 1,0 s | *hand crank turning on a small copper machine, smooth ratchet* |
| `sfx_remplir` | 0,4 s | *several small parts clicking into slots at the same instant* |
| `sfx_serrure` | 0,5 s | *key turning in a brass lock, satisfying unlock click* |
| `sfx_tuyau` (a, b) | 0,5 s | *soft pneumatic puff, paper card sliding out of a slot* |
| `sfx_bloque` | 0,5 s | *key jamming in a lock, dull rattle, mechanism refusing* |
| `sfx_engrenages` | 1,5 s | *small brass gears spinning behind glass, fine clockwork whir* |
| `sfx_capsule` | 0,35 s | *soft magnetic snap, small capsule closing* |
| `sfx_fissure` | 0,25 s | *thin glass capsule cracking open gently* |
| `sfx_loupe` (a, b) | 0,2 s | *quick paper flip, light swish* |
| `sfx_cible` | 0,6 s | *bright chime, a line completed on paper* |
| `sfx_pliage` | 1,2 s | *large sheet of paper folded several times* |
| `sfx_gravure` | 0,8 s | *engraving stylus on a metal plate, short scratch* |
| `sfx_etoile` (a, b, c) | 0,3 s | *rubber stamp pressed on paper* |
| `sfx_couvercle` | 0,6 s | *small blued steel box lid closing shut, soft metallic clack after a short hinge creak* |
