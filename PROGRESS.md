# Avancement

## 29 octobre 2026 — la refonte « Bric & Clé »

À la demande de Cédric, l'interface « feuille de papier » de *La Grande Feuille* est remplacée par un atelier de
jouets. Le noyau logique (`core/`) n'a pas changé ; l'interface (`ui/`) est réécrite. La synthèse de conception
(quatre concepts, trois juges) est dans `docs/REFONTE-CONCEPTS.md`.

### Fait

- **Grammaire des objets** (`ui/objet/pose.js`, `ui/objet/rendu.js`) : pièces laquées (couleur et forme ; les
  indices se voient par des points, les lettres au-delà de douze par un cerclage), losange pour « ou », trait pour
  « non », flèche B ◆━ [A] dans l'ordre du cours, plateaux, coffrets. Trois vues par flèche, réglables d'un clic
  (cours, lecture A ━◆ B, déboîtée) et le levier Miroir pour toutes ; un clic sur le losange d'une flèche
  déboîtée la remboîte. Relecture testée : le dessin de 10 000 formules au hasard se relit en la même formule.
- **L'atelier** (`ui/atelier.js`) : étagère (moules, catalogue, fournitures, coffrets), écrin (bon du client,
  empreinte, rivets), établi (plan de montage par rangs, ficelles, numéros, jetons des moules), râtelier ;
  Échangeur avec molettes (clic n'importe où, élargissement au plateau parent, glisser, saisie Aa), aperçu doré
  quand il égale la commande ; clé par glisser-déposer avec goupilles vertes ou rouges et bulle « attendu / reçu » ;
  Duplicateur ; automates à berceaux (le noyau trouve σ), automate scellé du prélemme ; coffrets (N) ;
  essayage sur l'écrin ; jumeaux allumés au survol ; vues héritées par provenance (l'aperçu montre les vues
  qu'aura l'objet) ; copeaux (Suppr) ; Recommencer.
- **Gestes** (`ui/gestes.js`) : chaque geste devient un groupe d'événements du journal ; Ctrl+Z annule un geste
  entier (les anciens journaux sans groupe sont regroupés par machine). Toutes les solutions du chapitre se
  rejouent par les gestes, étoiles comprises (test).
- **Livraison** : la victoire s'enregistre dès qu'elle a lieu ; l'objet vole dans l'écrin, le couvercle se ferme,
  la réaction en chaîne montre un domino par geste caché (moules, clés, fournitures), puis le vérificateur
  indépendant tamponne « Contrôlé » ; carte de livraison (étoiles, vrai nom du théorème, record, Recommencer).
- **Écrans** : titre (enseigne et objets sur l'établi), coffret des commandes (écrins de velours, vitrine des
  automates), réglages (sens des flèches au départ, son, taille des objets et du texte), notice d'Hortense.
- **Clients et surnoms** dans `levels/chapitre1.json` (M. Grumeau, Mme Vernoux, le colonel Patin… ; le Relais, le
  Porte-tout, le Farfelu…).
- **Accessibilité** : jeu complet au clavier (Tab, Entrée, flèches dans un objet, E, K, D, N, L, M, Espace),
  focus conservé après chaque rendu, objets décrits en mots pour les lecteurs d'écran (« si (R ou R) alors R »),
  annonces dans une région polie, fenêtres en vrais dialogues, thème Auto résolu, contrastes du soir, mode
  daltonien étendu, mouvements réduits respectés, bouton Son (M).
- **Revue** : une revue adversariale (quatre angles, un contradicteur par angle) a confirmé 57 points ; ils ont
  été corrigés, puis vérifiés un à un.
- **Tests** : `node tests/run.mjs`, 75 tests ; scénarios de jeu réels (souris et clavier) rejoués dans Edge sans
  interface pendant le développement.
- **Contre-revue** (le soir) : chaque correction a été revérifiée (32 tenaient, 25 partielles, 8 régressions). Les
  partielles et les régressions sont reprises, puis rejouées dans Edge : Espace tire le levier au lieu de relancer
  le dernier bouton cliqué ; après le tir gagnant, le focus va sur l'objet neuf (jamais sur un bouton du bandeau)
  et un Espace de plus passe l'animation au lieu de quitter la commande ; Échap sur la carte = rester ; l'automate
  transmet les vues des flèches par provenance, comme l'Échangeur (l'aperçu et l'objet produit concordent) ;
  troisième tour de lettres (Y, Z) avec un second cerclage ; messages ok / erreur aux couleurs du mode daltonien ;
  éditeur de molette annoncé comme invalide aux lecteurs d'écran ; aide des boutons du bandeau visible au clavier.
- **Version anglaise** : complète (232 textes d'interface, 85 textes de commandes), relue et jouée de bout en bout
  dans Edge sans texte français résiduel ; guillemets et deux-points à l'anglaise (« » → “ ”, « a : b » → « a: b »).
  Bouton English sur l'écran titre, ou Réglages › Langue.
- **Pilote de tests** (`tools/pilote.mjs`) : attend que l'appli soit prête, accepte les boîtes confirm() au lieu de
  rester bloqué, et donne aussi `souris` et `envoyer` aux scénarios.

### Écarts à la synthèse de conception

- Grammaire : losange et trait au lieu du maillon et du manchon (choix de Cédric), et le miroir par flèche.
- Pas encore : frise du temps (seuls ↶ ↷), zoom et minicarte de l'établi, « flair » (l'écrin qui s'allume au
  survol d'un objet), mélodie des pièces, animation du brevet (les figurines existent, mais ne bougent pas),
  Carnet du curieux complet, option « Atelier exigeant ».

### Étape 3 : les médias (fait le 29 octobre au soir)

- **Bruitages de l'atelier** : 24 fichiers ElevenLabs (`python tools/gen_audio.py atelier`) qui remplacent les sons
  « papier » : clac et déclic des flèches, goupilles de plus en plus aiguës avant le verdict de la clé, pop ou
  boïng, levier, pschht du vernis, rivet d'un objet neuf, carillon de l'aperçu doré, berceau qui aspire,
  remontoir, velours et tampons de la livraison, dominos, rembobinage de ↶ ↷, copeaux, rangement, miroir, cloche
  du record. Chacun vérifié dans Edge (quel fichier part, à quel moment). Tableau dans `ASSETS-BRIEF.md`.
- **Rendus Blender par Kimi K3.1 Pro** (swarm, une heure environ, puis une passe de corrections) : bouleau, noyer
  et velours en tuiles, trois rivets, les neuf automates de fer-blanc, l'écran titre. Brief, contrôle automatique
  et planche dans `C:\dev\la-grande-feuille-art` (l'ancienne direction est dans `ancienne-direction/`). Ma revue a
  renvoyé deux défauts que le contrôle laissait passer (bord d'un pixel des tuiles, Relais à rebours copie du
  Relais) ; le contrôle les attrape désormais. Une dernière passe a donné son grain au bouleau et son poil au velours
  (le contrôle exige maintenant un minimum de grain, en plus du maximum).
- **Affichage** : `ui/assets.js` (`habiller`, `figurine`) et la section « rendus (habillage) » de `styles.css`.
  Chaque image ne s'affiche que si son fichier est là ; sans elle, le dessin du code reste. Les pièces, losanges
  et traits restent dessinés par le code.

### Publication sur LOB7 (29 octobre au soir)

- Anglais par défaut (un joueur qui choisit le français le garde).
- Dépôt public `codex-lm/bric-et-cle` (GitHub) : le jeu, ses médias et ses notices ; le cours, les spécifications,
  les fichiers audio bruts et les outils Python restent hors du dépôt (`.gitignore`). Manifeste `LOB7-GAME.json`,
  `LOB7-ATTRIBUTION.json`, preuve de contrôle dans `.lob7/ownership/`.
- Version 1.0.0 publiée par le formulaire de lob7.com (`/publish`), droits déclarés par Cédric, améliorations
  par les agents LOB7 autorisées.

### Reste à faire

- Les éléments de la synthèse listés ci-dessus.
- Faire tester par des non-matheux (lecture des files de flèches, bois brut contre verni).
