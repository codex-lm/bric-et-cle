# Refonte : concepts proposés (atelier de conception du 2026-10-29)

> Note : cette synthèse a été écrite avec la grammaire « maillon de laiton + manchon de verre ». Cédric a ensuite choisi : « ou » = losange, « non » = trait épais en préfixe, et un losange suivi d'un trait forme une flèche qui vise B (B ◆━ A, ordre du cours A → B := B ∨ ¬A). Partout où le texte dit maillon, lire losange ; manchon, lire trait (le regroupement d'un « non » composé passe par un plateau) ; serrure d'ambre, lire le plateau d'ambre qui porte A à droite de la flèche.

# Recommandation : Bric & Clé

## autres_noms

- « Trousseau » : un trousseau de clés qui grossit à chaque commande, puisque tout objet fabriqué peut servir de clé. Le mot est court, très français, et n'évoque aucune école.
- « Gigogne » : chaque objet est fait d'objets emboîtés, et chaque commande livrée devient une pièce de la suivante.
- « Remontoir » : chaque commande livrée se remonte comme un jouet et devient un automate qui travaille pour toi.
- « Emboîte ! » : le verbe du jeu. La coque s'emboîte dans le maillon, la clé dans la serrure, l'objet dans l'écrin.
- « L'Atelier Pile-Poil » : c'est l'expression la plus juste, mais le nom est déjà pris. Pile-Poils est un jeu de société de Lucky Duck Games sorti en 2026 (voir [Esprit Jeu](https://www.espritjeu.com/pile-poils.html) et [Philibert](https://www.philibertnet.com/en/lucky-duck-games/168304-pile-poil-purramid-8720077373891.html)), et un jeu de cartes Pile Poil existe depuis 2014 ([BoardGameMatcher](https://boardgamematcher.com/game/pile-poil)). On garde « Pile-poil ! » comme exclamation au moment de la livraison.

## pitch

À l'atelier Bric & Clé, une fabrique de jouets en bois laqué des années 50, les commandes montent de la boutique par un tube pneumatique. Ce sont d'étranges objets faits de pièces colorées, de maillons de laiton, de manchons de verre et de flèches à serrure. Pour les fabriquer, tu as quatre moules, un Échangeur qui change d'un seul coup de levier toutes les pièces d'une même forme, et des clés : pose un objet sur la serrure qui a exactement sa forme, clic, et ce qu'elle retenait se libère. Chaque commande livrée pile-poil devient un automate à remontoir qui travaille pour toi. À la fin, une rangée de dominos tombe, un domino par geste caché : tu viens de refaire Hilbert et Ackermann, vérifié jusqu'au dernier boulon, sans avoir lu un seul symbole.

## univers

LE LIEU. L'atelier Bric & Clé, maison fondée en 1952 au-dessus d'une boutique de jouets. On y trouve un grand établi de bouleau sous une verrière, une étagère à tiroirs, un râtelier d'outils et une vitrine qui se remplit d'automates. Les commandes montent de la boutique par un tube pneumatique (« pof ! »), et les objets livrés redescendent par le même tube.

L'HISTOIRE, EN FILIGRANE. La fondatrice, Hortense Bric, est partie en tournée et t'a confié l'atelier. On ne la voit jamais. Elle laisse des cartes bristol écrites à la main (la Notice, c'est-à-dire les indices, deux lignes au plus) et, à la fin du coffret, une carte postale. Les clients ne sont pas dessinés non plus : chacun signe son bon de commande d'un tampon et d'une seule réplique, avec un humour sec d'adulte. M. Grumeau, horloger : « Pour caler ma pendule. Pile-poil, je vous prie. » Mme Vernoux, antiquaire : « Le Doublé, avec un cube accroché derrière. Et qu'il fasse clic. » Le colonel Patin, collectionneur de serrures, revient souvent. Les deux défis arrivent dans une enveloppe noire sans signature. Les seuls personnages animés sont les automates en fer-blanc : ils dorment dans le râtelier, tapotent, bâillent, et se mettent au travail quand on les remonte. Il n'y a ni animaux ni mascotte : le charme vient des objets, des sons et des répliques.

LE TON. Joueur, chaleureux, presque sans texte : des pictogrammes, une notice de montage, un catalogue de jouets. Les mots formule, axiome, théorème, preuve et logique n'apparaissent jamais dans le visuel principal. On les trouve seulement dans le mode Notation (bouton Aa) et dans le Carnet du curieux. Si on l'ouvre après une livraison, le Carnet révèle par exemple : « Ton objet s'appelle aussi TL0, la transitivité. »

LE LEXIQUE. Il est court, 14 mots :
- objet (formule), pièce (lettre), maillon (« ou »), manchon (« non ») ;
- flèche et sa serrure (implication), plateau (regroupement), coffret (capsule) ;
- moule (axiome), Échangeur et molettes (substitution), clé (modus ponens) ;
- automate (boîte d'un théorème), écrin (cible), rivets (par) ;
- bois brut et verni (gabarit et objet fabriqué).

LES NOMS.
- Les quatre moules : ① le Doublé (AL1), ② le Rajout (AL2), ③ le Tourniquet (AL3), ④ la Rallonge (AL4).
- Les automates : TL0 donne le Relais (sa boîte TL1), CV le Porte-tout, AF le Farfelu, S la Fourche, C le Croiseur, MPI le Portier, TL0 bis le Relais à rebours, le lemme par cas le Juge.
- Le prélemme donne un automate scellé, le Préjugé.
- TL2 devient le Miroir : un objet du catalogue sans automate, dont la plaque dit « Non breveté : il rend ce qu'on lui donne » (c'est le cas boiteInutile du noyau).

DIRECTION ARTISTIQUE. Des jouets de designer des années 50-60, dans l'esprit de Naef ou de Kay Bojesen : géométrie pure, douze laques franches, quincaillerie de laiton, verre fumé gris-bleu, verre ambré, velours vert sombre, établi de bouleau miel. En mode sombre, l'établi est en noyer sous une lampe d'atelier ; les laques gardent leurs couleurs et le verre prend un liseré de lumière.
Une règle de matière que l'œil apprend vite :
- LAQUE BRILLANTE : fabriqué (verni) ;
- BOIS BRUT PÂLE en pointillés : simple gabarit ;
- VELOURS : empreinte de ce qu'on attend ;
- PLOMB : figé.
Le rendu vectoriel procédural est la référence et doit être beau seul ; les rendus Blender ne font que l'enrichir.

MUSIQUE ET SONS. On garde la musique déjà générée : mus_atelier et mus_atelier_2 (piano feutré, célesta, tic-tac), mus_defi, mus_titre, mus_victoire. Elle colle à un atelier de jouets. Pas de couches synchronisées : ElevenLabs ne garantit ni le tempo ni la tonalité. Ce qui grandit avec l'atelier, ce sont les automates du râtelier, qui ajoutent chacun leur petit tic-tac d'ambiance, sans calage. Chaque objet a aussi sa mélodie, synthétisée en WebAudio avec une note par pièce : deux jumeaux jouent le même air.

## formules

PRINCIPE. Un objet est un petit jouet assemblé, posé à plat, qu'on lit de gauche à droite dans l'ordre du cours : A → B est une abréviation de B ∨ ¬A, exactement ce que stocke le noyau (Ou(B, Non(A))).
Le dessin est calculé à partir de l'arbre que rend déjà capsules.replier() (nœuds L, V, N, O, I, C). Règle absolue : MÊME FORMULE = MÊME SILHOUETTE, au pixel près, partout (étagère, établi, écrin, intérieur d'une serrure). Seule la FINITION change selon le rôle de l'objet : verni (fabriqué), bois brut (gabarit), velours (empreinte attendue), fantôme (aperçu). La géométrie, jamais.

LES SEPT ÉLÉMENTS (u = 28 px, la taille d'une pièce sur l'établi au zoom 100 %)

1. PIÈCE = lettre. Bois laqué, avec une couleur ET une forme ; la forme suffit seule (daltonisme, niveaux de gris).
- R est une boule vermillon, S un cube outremer, T une pyramide moutarde.
- Les lettres suivantes, dans leur ordre d'apparition dans le niveau : croix vert sapin, losange turquoise, croissant framboise, hexagone violet, étoile orange, goutte vert pomme, disque gris-bleu, cœur brun, tore noir. Au niveau C, A, B et C sont donc la croix, le losange et le croissant.
- Mode daltonien : palette Okabe-Ito, plus une gravure (rayures, points).
- Une lettre indicée (R₁) porte une encoche.

2. PIÈCE DE PLOMB = nom (prémisses, R et X du prélemme). Même silhouette que la lettre, coulée en plomb gris mat, avec un petit plomb de scellé au fil. « Le plomb ne s'échange pas » : elle n'a pas de molette. C'est un seul matériau, jamais des pointillés ni le mot « joker », car un nom est une constante du niveau.

3. MAILLON = « ou ». Deux anneaux de laiton entrelacés, horizontaux, de 14 px, entre l'élément de gauche et celui de droite. L'ordre gauche-droite est celui du noyau (l, r).

4. MANCHON = « non ». Un tube de verre fumé gris-bleu à DEUX BOUTS RONDS, qui enveloppe son contenu avec 8 px de marge. Le contenu reste net et coloré. Une double négation donne deux tubes concentriques : deux liserés, qu'on compte d'un coup d'œil.

5. LA FLÈCHE = un maillon dont l'élément de droite est un manchon. C'est exactement le test estImp du noyau, et le nœud I de replier().
- Le maillon et le manchon S'EMBOÎTENT en UNE seule pièce. Le bout gauche du manchon s'effile en une POINTE DE LAITON qui avale l'anneau du maillon et vient toucher B. Le verre passe du gris fumé à l'AMBRE et se double de velours vert sombre.
- On voit B ◀ A, qui se lit « B si A ».
- Le verre ambré est LA SERRURE. A y repose, dessiné exactement comme quand il est seul, comme le gabarit d'une clé. Le modus ponens consiste à y présenter un objet identique.
Pourquoi ça a toujours un sens : la règle est locale et syntaxique, donc chaque formule a une seule image, quel que soit le contexte.
- ¬A ∨ B (manchon à GAUCHE) reste (A) ∞ B, avec un tube rond gris : ce n'est pas A → B dans le noyau, et ça se voit.
- B ∨ ¬¬A donne une flèche dont la serrure contient un manchon rond.
- ¬A ∨ ¬B donne (A) ◀[B] : seul le manchon de droite s'emboîte.
- ¬(A → B) donne un manchon rond autour d'une flèche.
- Un coffret ne cache jamais la flèche, car replier() traite l'implication avant de chercher une capsule pour le « non » fusionné.
- Toute opération qui amène un manchon à droite d'un maillon le fait s'emboîter sous les yeux du joueur (clac) ; toute opération qui l'en éloigne le fait se déboîter. C'est de l'affichage, pas une opération.

6. PLATEAU = regroupement. Il joue le rôle des parenthèses sans en avoir l'air : une planchette d'érable ou de noyer (en alternance selon la profondeur), surélevée de 2 px avec une ombre douce. Ses règles sont fixes :
- un assemblage à deux côtés (maillon ou flèche) placé d'un côté ou de l'autre d'un maillon monte sur un plateau ;
- un maillon placé à gauche d'une flèche (c'est-à-dire en position de B) monte sur un plateau ;
- RÈGLE DE LA FILE : une flèche placée à gauche d'une flèche ne prend PAS de plateau. A₁ → (A₂ → C) se dessine C ◀[A₂] ◀[A₁], une file de serrures qu'on lit « C, si A₂, si A₁ ». La serrure la plus à droite est le premier antécédent (antecedents() du noyau) : c'est celle qu'une clé ouvre, et c'est le premier berceau d'un automate. Elle seule luit, les autres sont mates ;
- il n'y a jamais de plateau à la racine, ni directement dans un verre (le verre regroupe déjà).
Ces règles sont injectives. À un niveau donné, on trouve soit un seul maillon entre deux unités, soit une file de flèches, jamais un mélange sans plateau. C ◀[B] ◀[A] et C ◀[B ◀[A]] ne se confondent pas : dans le second, la petite flèche est DANS le grand verre, et son cerclage passe du laiton au cuivre.

7. COFFRET = capsule. Un petit coffret laqué noir à fermoir de laiton, large d'une pièce et demie (42 px). Il porte un emblème doré (ancre, couronne, cloche, lune, poisson, clé…) et, sur la tranche, une rangée de pastilles aux formes des pièces qu'il contient. Toutes les occurrences de son contenu, partout, deviennent le même coffret. Quand une molette vise une pièce d'un coffret, ses pastilles s'allument ; au levier, le coffret se fend et se déplie.

DÉBOÎTER (la loupe). Un clic sur la pointe de laiton, ou la touche L : un ressort, la pointe rentre et s'arrondit, l'ambre redevient gris, le maillon retombe entre les deux. On voit alors B ∞ (A) : mêmes pièces, même ordre, 14 px plus large. Un second clic, clac, et ça se remboîte. C'est gratuit (événement LOUPE). La Radiographie (Maj+L) déboîte tout l'écran, en affichage seul et hors journal, pour constater qu'une flèche n'est qu'un « ou » suivi d'un « non ».

GARANTIE. Un module de relecture reconstruit la formule à partir des seuls éléments posés (il s'appuie sur capsules.reconstruire). Il tourne en test sur toutes les formules du chapitre, sur chaque ligne des preuves dépliées et sur 10 000 formules aléatoires (profondeur 7 au plus, déboîtages et coffrets tirés au hasard). Il garantit que même dessin équivaut à même formule.

LISIBILITÉ DES GROS OBJETS. Mesures faites avec le noyau sur les 52 formules distinctes du chapitre (cibles et lignes des solutions de référence) :
- Largeur à u = 28 : médiane 280 px, 90 % sous 500 px, maximum 1 068 px (5e ligne du niveau C, 61 symboles). Toutes les cibles font au plus 340 px. Hauteur maximale : 64 px. Jamais plus de 3 contenants imbriqués, ni plus de 3 verres ; sans la règle de la file, on monterait à 5 contenants.
- Coffrets : la ligne de 1 068 px tombe à 798 px avec un coffret (A → (B → C)), à 618 px avec deux, à 438 px avec trois. Le jeu souligne en pointillé, avec la mention « à emballer ? », tout motif d'au moins 5 symboles qui revient 2 fois.
- Ligne d'horizon : chaque plateau et chaque verre ajoute un rebord. Le profil de l'objet est une empreinte de sa structure.
- Verres imbriqués : le cerclage alterne laiton, cuivre, laiton. Le verre reste clair et le contenu toujours vif : on ne fonce pas d'un cran par niveau.
- Échelle : u va de 28 (écrin, poste ouvert) à 20 (établi), jamais sous 60 %. Sous 14 px, on passe à des glyphes vectoriels simplifiés. Au survol, une loupe de lecture montre l'objet à 100 %.
- Pince : un clic prend le plus petit sous-assemblage sous le curseur et le soulève de 2 px, le reste se voile ; chaque clic suivant prend le parent. Au clavier : ↑ pour le parent, ↓ pour le premier enfant, ← et → pour les voisins.
- Jumeaux : survoler un sous-assemblage allume tous les sous-assemblages identiques à l'écran (étagère, établi, écrin, serrures). Le calcul se fait par égalité d'identifiant interné : infaillible et gratuit.
- Liserés de provenance : après un échange, chaque morceau inséré garde pendant 4 s un liseré de la couleur de la pièce qu'il remplace, et le retrouve au survol.

COMPARER D'UN COUP D'ŒIL
- ESSAYAGE : poser un objet sur l'écrin, ou sur un autre objet avec la touche C, superpose les deux sans rien produire. Une lumière court sur les parties qui coïncident, dans l'ordre du noyau (divergence() : la serrure d'abord, puis la gauche), et s'arrête au premier désaccord, hachuré de rouge (un motif, pas seulement une couleur). Les autres écarts, calculés par l'interface, apparaissent en rouge pâle. C'est EXACTEMENT le rendu d'une clé qui coince : le joueur apprend le diagnostic gratuitement.
- FLAIRER : au survol d'un objet de l'étagère ou de l'établi, l'écrin s'allume en vert là où cet objet colle déjà, en rouge ailleurs.
- MÉLODIE (en option) : un objet joue ses pièces de gauche à droite, et deux jumeaux jouent le même air.

NOTATION DE CE DOCUMENT (jamais affichée en jeu) : ● boule rouge (R), ■ cube bleu (S), ▲ pyramide jaune (T) ; ∞ maillon ; ( ) manchon ; ⟦ ⟧ plateau ; B ◀[A] flèche, pointe de laiton à gauche, A dans la serrure d'ambre.

EXEMPLE 1. AL2, R → (R ∨ S), stocké Ou(Ou(R,S), Non R).
- Maquette : ⟦● ∞ ■⟧ ◀[●].
- Ce qu'on voit (134 × 40 px) : un plateau d'érable porte une boule vermillon et un cube outremer tenus par un maillon de laiton. La pointe de laiton est plantée contre le bord droit du plateau. Vient ensuite le verre ambré doublé de velours, où repose une seule boule vermillon.
- Lecture : « boule-et-cube, si boule ». La boule de la serrure se retrouve à gauche, avec un cube en plus : c'est le Rajout.
- Déboîté : ⟦● ∞ ■⟧ ∞ (●).

EXEMPLE 2. AL4 tel que demandé, (R → S) → ((T ∨ R) → (T ∨ S)).
- Maquette : ⟦▲ ∞ ■⟧ ◀[▲ ∞ ●] ◀[■ ◀[●]].
- Ce qu'on voit (280 × 52 px ; 6 pièces, 3 flèches, 1 plateau, 2 verres au plus profond), de gauche à droite : un plateau pyramide-cube ; une première serrure, mate, qui contient pyramide ∞ boule, sans plateau ; puis la serrure de droite, la plus haute, qui LUIT parce que c'est elle qu'une clé ouvre. Elle contient une petite flèche « cube si boule », avec son propre cerclage de cuivre.
- La rime se voit sans lire : le plateau et la première serrure ne diffèrent que par leur dernière pièce (cube contre boule), et la petite flèche dit justement « cube si boule ».
- Lecture : « si tu sais faire un cube avec une boule, je fais pyramide-cube avec pyramide-boule ».
ATTENTION : le moule ④ du noyau et du cours est (R → S) → ((R ∨ T) → (S ∨ T)), soit ⟦■ ∞ ▲⟧ ◀[● ∞ ▲] ◀[■ ◀[●]]. Même architecture, mais la pyramide est accrochée DERRIÈRE. C'est lui, la Rallonge, qui est sur l'étagère, et il le faut. Au niveau TL0, la substitution de référence σ = {R:S, S:T, T:¬R} (une permutation circulaire plus un manchon) change la boule en cube, le cube en pyramide et la pyramide en manchon de boule. Les deux manchons arrivent À DROITE de leurs maillons : clac, clac, deux flèches naissent. Le plateau de tête s'efface (règle de la file) et l'objet devient ▲ ◀[●] ◀[■ ◀[●]] ◀[▲ ◀[■]], c'est-à-dire TL0 (288 px). Avec la version (T ∨ R), les manchons atterriraient à gauche et resteraient ronds.

EXEMPLE 3. La formule profonde ((R → S) → ((T ∨ R) → (T ∨ S))) → ((T ∨ R) → (T ∨ S)) : 24 symboles, 6 niveaux d'arbre, 10 pièces. Elle est stockée Ou(K, Non(AL4′)), avec K = (T ∨ R) → (T ∨ S) et AL4′ l'objet de l'exemple 2.
- Maquette : ⟦▲ ∞ ■⟧ ◀[▲ ∞ ●] ◀[ ⟦▲ ∞ ■⟧ ◀[▲ ∞ ●] ◀[■ ◀[●]] ].
- Ce qu'on voit (480 × 64 px ; 5 flèches, 2 plateaux, 3 verres au plus profond) : en tête, le duo « plateau pyramide-cube, serrure pyramide-boule », qui est K. Puis la plus grande serrure de l'objet, qui LUIT et occupe les trois cinquièmes de droite. Son verre ambré contient, à taille réelle, exactement l'objet de l'exemple 2, cerclé de cuivre, avec à l'intérieur la petite flèche « cube si boule » cerclée de laiton.
Pourquoi ça reste lisible :
(a) c'est une file, pas un empilement : « K, si (tout l'exemple 2) » ;
(b) le duo de tête apparaît deux fois, identique et à la même hauteur : le survoler allume son jumeau dans le verre ;
(c) survoler le contenu du grand verre allume tout objet identique sur l'établi : « cette serrure attend ça » ;
(d) en coffret, K dans un coffret à l'ancre donne [ancre] ◀[ [ancre] ◀[■ ◀[●]] ] (212 px). Si on met en plus l'exemple 2 dans un coffret à la lune, on obtient [ancre] ◀[lune] (108 px) : « ancre, si lune ». Le modus ponens devient évident : présente une lune à la serrure, et l'ancre se libère.
DIAGNOSTIC sur cet exemple (calculé avec mp() du noyau). Présentons la Rallonge, le vrai moule ④, à la grande serrure. Les goupilles basculent dans l'ordre du noyau, la clé entrant par la droite. La petite flèche « cube si boule » coïncide en bloc : un seul clac grave, car c'est une sous-formule internée égale. On passe ensuite à la serrure du milieu, et la goupille coince sur sa PREMIÈRE pièce (chemin lral) : la serrure attend une pyramide, la clé y a une boule. Rien n'est fabriqué.

CHEMIN QUI FINIT SOUS UNE FLÈCHE. Quand divergence() renvoie un chemin terminé par r sous une implication, il désigne le « non » fusionné, qui n'a pas de dessin propre. L'interface allume alors la serrure entière (pointe et verre) du côté attendu, et le morceau correspondant du côté de la clé, avec la bulle « ici il faut une flèche, ta clé a un maillon simple » (ou l'inverse). Si la flèche est déboîtée, c'est le manchon qui s'allume.

## correspondance

Chaque geste qui FABRIQUE appelle une seule opération du noyau et pose au plus un objet. Il émet les événements existants du journal, groupés par un champ g que le noyau ignore : un Ctrl+Z annule le geste entier. Tous les autres gestes regardent, règlent ou rangent, gratuitement. Les événements émis sont indiqués entre crochets.

LES OBJETS DE DÉPART
- AXIOME → MOULE. Ils sont rangés dans le tiroir « Les Quatre » de l'étagère :
  - ① le Doublé : ● ◀[● ∞ ●] ;
  - ② le Rajout : ⟦● ∞ ■⟧ ◀[●] ;
  - ③ le Tourniquet : ⟦■ ∞ ●⟧ ◀[● ∞ ■] ;
  - ④ la Rallonge : ⟦■ ∞ ▲⟧ ◀[● ∞ ▲] ◀[■ ◀[●]].
  Ils sont inépuisables : rien ne s'use dans l'atelier.
- THÉORÈME DÉBLOQUÉ → un objet du tiroir « Catalogue », utilisable comme clé, comme serrure ou comme entrée de l'Échangeur, ET un automate dans le râtelier. Seule exception : TL2, pour lequel le noyau signale boiteInutile.
- PRÉMISSE → un objet « Fourni par le client », avec une étiquette kraft sur son socle. Ses noms sont des pièces de plomb.
- LIGNE PRODUITE → un OBJET VERNI posé sur un socle de l'établi. Il n'a pas de numéro et il est relié par de fines ficelles aux objets dont il sort. Il n'est jamais consommé et jamais modifiable à la main.

LES OPÉRATIONS
- COPIER → le DUPLICATEUR, une presse à jumeaux (touche D). On y lâche un objet, un jumeau sort. Le compteur affiche « +0, déjà en rayon », car formulesNouvelles ne compte pas une copie. [POSER copier, BRANCHER 0, ACTIONNER]
- SUBSTITUER → l'ÉCHANGEUR (touche E).
  - On y pose un objet : ses pièces se dévissent et laissent des DOUILLES creuses de leur forme.
  - Il y a une MOLETTE par sorte de pièce, dans l'ordre de lecture (lettres() du noyau), frappée de sa silhouette. Des fils de sa couleur la relient à TOUTES ses douilles : impossible d'en viser une seule.
  - On remplit une molette en y lâchant n'importe quel sous-assemblage pris n'importe où à la pince (écrin compris), un coffret, ou une forme montée dans la boîte à pièces (pièces, maillon, manchon, flèche, coffrets, plus un champ texte en mode Notation).
  - Une molette vide laisse sa pièce inchangée. Les pièces de plomb n'ont pas de molette.
  - L'aperçu remplace toutes les occurrences au même instant, sur un seul accord. Les morceaux insérés arrivent sous un film que les autres molettes ne touchent pas : la simultanéité se voit. Exemples : au niveau MPI, A := C → B, B := C, C := B s'appliquent sans cascade ; au niveau TL0, c'est une permutation circulaire.
  - Le levier produit un objet.
  [POSER substituer à l'ouverture, BRANCHER 0, REGLER par molette, ACTIONNER ; RETIRER si on referme sans tirer]
- MODUS PONENS → PRÉSENTER UNE CLÉ, sans machine.
  - On traîne un objet verni (la clé) sur un autre objet verni dont la pièce la plus extérieure est une flèche. La cible est sa serrure la plus à droite, la seule qui luit.
  - Pendant le survol, le fantôme de la clé se cale dans le verre et les goupilles s'allument dans l'ordre exact de divergence() : en vert ce qui coïncide, hachuré de rouge le premier écart.
  - Si mp() accepte au lâcher : clic, le verre s'ouvre en deux demi-coques, B jaillit vers la gauche et devient un nouvel objet sur l'établi, puis la serrure se referme (rien n'est consommé).
  - Sinon : « clonk », la clé rebondit, et une bulle montre côte à côte, en grand, le morceau attendu (sousAttendu) et le morceau reçu (sousBranche).
  - L'interface appelle mp() AVANT d'écrire : un essai raté n'écrit rien dans le journal, donc aucune machine refusée ne traîne.
  - Un objet sans flèche à l'extérieur ne luit pas (diagnostic pasImplication, montré comme « pas de serrure ici »). Une serrure enfouie ne s'ouvre jamais.
  - Au clavier : choisir la clé, appuyer sur K, choisir l'objet, Entrée.
  [POSER mp, BRANCHER 0, BRANCHER 1, ACTIONNER, groupés]
- BOÎTE → AUTOMATE À REMONTOIR (touches 1 à 9). L'automate EST le théorème, monté sur un socle d'horlogerie.
  - Ses k serrures de droite (k = nombre de ports du théorème, par exemple 2 pour le Relais) sont retournées en BERCEAUX creux, numérotés par des encoches. Leurs pièces y deviennent des douilles colorées : « n'importe quoi ici, mais la même chose dans chaque douille de cette forme ».
  - Les berceaux se remplissent dans l'ordre : le berceau 2 garde son volet fermé tant que le 1 est vide. Le diagnostic portVide devient impossible.
  - Dès qu'on nourrit le berceau 1, des fiches en bois brut « ■ = … » montrent le σ trouvé par le noyau, et un fantôme du contenu apparaît partout où la douille revient.
  - Les lettres libres (lettresLibres) ont leurs molettes.
  - Nourri à moitié, l'automate rend le reste : les berceaux vides redeviennent des serrures sur l'objet produit. C'est la leçon du Juge.
  - Diagnostic « forme » : la zone du berceau qui n'a pas la bonne forme clignote. Diagnostic « conflit » : les deux contenus réclamés par la même douille pendent côte à côte en rouge, et l'automate grince.
  - Le remontoir (Espace) produit un objet.
  [POSER boite:ref, BRANCHER i, REGLER, ACTIONNER]
- RÈGLE DÉRIVÉE → AUTOMATE SCELLÉ, le Préjugé. Il a un liseré de plomb et aucune molette. Son berceau a des douilles de plomb (les noms R et X) qui prennent l'empreinte de ce qu'on y pose (regle() du noyau). [POSER regle:prelemme, BRANCHER, ACTIONNER]

LA RÈGLE D'HONNÊTETÉ : BOIS BRUT CONTRE VERNI
- Tout morceau prélevé à la pince, ou monté dans la boîte à pièces, est en bois brut : pâle, mat, contour en pointillés. Il ne peut que remplir une molette.
- Lâché sur une serrure, sur un berceau ou sur l'écrin pour livrer, il refuse avec un petit tremblement : « pas verni ».
- Seuls les objets vernis (moules, catalogue, fournitures, objets fabriqués) servent de clés, de serrures et d'entrées. Pour prendre un objet verni entier, on le saisit par son socle.

CIBLE, AFFICHAGE ET SCORE
- CIBLE → ÉCRIN de velours vert, creusé à la silhouette exacte de l'objet commandé. Les pièces y sont en relief coloré à 60 % (option « montrer en plein »). Dès qu'un objet identique est fabriqué (le « gagne » du journal), il vole dans l'écrin, pile-poil. L'écrin sert aussi de source pour la pince et de zone d'essayage ; on n'y fabrique jamais rien en y déposant un objet.
- CAPSULE → COFFRET. Touche N pour emballer, O pour ouvrir le coffret à cet endroit. Le tiroir « Coffrets » permet de déballer et de choisir de replier partout ou non. [NOMMER, OUBLIER, AUTO]
- LOUPE → DÉBOÎTER (touche L). [LOUPE]
- ÉTOILES → RIVETS. Le couvercle de l'écrin porte autant de rivets que le par, et chaque objet NEUF (formulesNouvelles) en enfonce un.
  - Au par : ★★ « Parfait ! ».
  - Sous le par : ★★★ « Record ». Un rivet doré l'annonce seulement là où les données le connaissent (troisEtoiles : MPI en 2, TL0 bis en 1, lemme par cas en 7) ; ailleurs, on le découvre par surprise.
  - Au-delà du par : rivets rouillés, ★ « Livré ».
  - Quand le par vaut 1 (I1, TL0, CV), « Parfait ! » est le maximum, et le couvercle le dit.
  - Les écrins noirs des défis donnent ★ et une entrée au livre des records.

LES AUTRES ÉLÉMENTS DU NOYAU
- OBJET DÉMONTÉ → BAC À COPEAUX (touche Suppr). L'objet et tout ce qui en dépend passent en fantômes rouges, puis on confirme. [DEMONTER]
- ANNULER, RÉTABLIR ET CURSEUR DE TEMPS → la FRISE du bandeau : une perle par geste et un curseur qu'on fait glisser. [ANNULER ou RETABLIR, autant de fois que le groupe compte d'événements]
- INDICES → la NOTICE d'Hortense, trois cartes progressives : « cet objet a presque la silhouette de l'écrin », puis quel outil, puis quel réglage ou quelle clé.
- DÉPLIAGE FINAL → LA RÉACTION EN CHAÎNE (détaillée dans le juice) : verify.deplier, puis godement.eliminerSubstitution, puis verifierGodement, mis en scène en dominos.
- NOTATION → bouton Aa. Sous chaque objet s'affiche sa formule dans la notation du cours (A → B, ou B ∨ ¬A une fois déboîté), lue aussi par le lecteur d'écran (texte()). Le Carnet du curieux donne le vrai nom de chaque objet livré.

GESTES QUI NE PRODUISENT RIEN : prendre, déplacer la vue, survoler (jumeaux, flair), essayer, déboîter, emballer, ouvrir un coffret, remplir une molette, nourrir un berceau, consulter la notice, la notation ou le carnet.
Il n'existe AUCUN geste pour ouvrir une serrure à la main, couper un maillon, ôter un manchon, changer une seule occurrence ou poser un objet sans passer par un outil.

## boucle

MICRO (2 à 10 s) : PRENDRE, POSER, VOIR, TIRER. On prend un objet par son socle, ou un morceau à la pince. On le pose sur une serrure, une molette, un berceau ou l'écrin. La réponse arrive en moins d'une seconde, sans risque : goupilles vertes ou rouges, aperçu qui se remonte, écrin qui s'allume. Rien n'est engagé avant le levier, le remontoir ou le lâcher d'une clé qui rentre.

MÉSO (1 à 8 min, une commande)
1. REGARDER L'ÉCRIN. Sa silhouette dit la taille de l'objet, le nombre de flèches et les pièces.
2. FLAIRER. On survole l'étagère, et l'écrin s'allume là où chaque objet colle déjà : « le Doublé a la bonne forme, avec des boules là où l'écrin veut des paires ».
3. CHOISIR UN GESTE : échanger des pièces, présenter une clé, ou nourrir un automate pour sauter plusieurs étapes d'un coup.
4. RÉGLER, AVEC UN APERÇU VIVANT. Chaque molette remonte l'aperçu en animation (FLIP de 250 ms). Dès qu'un manchon arrive à droite d'un maillon, clac, une flèche se forme. L'aperçu est aussi posé en fantôme sur l'écrin : c'est le chaud-froid permanent. Si l'aperçu égale la commande, l'écrin s'illumine d'or avant même le levier.
5. ACTIONNER. Le bois brut se vernit, l'objet se pose sur l'établi au bout de ses ficelles, un rivet s'enfonce.
6. RECOMMENCER jusqu'au pile-poil. L'établi dessine au fur et à mesure le plan de montage, c'est-à-dire le graphe de la preuve, qu'on cherche à garder court.

MACRO (un coffret de 12 commandes et 2 écrins noirs). On livre et on gagne ses rivets. L'objet livré devient ensuite un automate qu'on a inventé soi-même, et qui fait en un tour de clé ce qui demandait six gestes. La réaction en chaîne montre ce qu'il cache : 73 dominos pour le Juge. Si on le veut, le Carnet révèle qu'on vient de démontrer la transitivité, puis, dans un écrin noir, la loi de Peirce.

POURQUOI C'EST SATISFAISANT
(a) On prédit, puis on voit. L'aperçu est immédiat et honnête, calculé par les fonctions mêmes du noyau.
(b) La clé dans la serrure donne un verdict net, physique et sonore.
(c) Le clac de l'emboîtement tombe exactement quand on a eu la bonne idée. Au niveau TL0, deux clacs d'un coup. Au niveau AF, le Tourniquet appliqué à R := manchon de boule donne ■ ◀[●] ◀[(●) ∞ ■] : le même assemblage, retourné, devient une flèche. On finit par ENTENDRE la structure.
(d) La compression : on fabrique ses propres automates, puis les dominos montrent tout ce qu'ils font à notre place.
(e) L'économie des rivets : finir au par, c'est égaler le cours ; finir en dessous, c'est le battre.

LE MUR DES 30 MINUTES (AF, S, C, MPI, avec un par de 3 à 8). Quatre aides le font passer : le chaud-froid permanent sur l'écrin, la notice en trois cartes, les jumeaux (qui montrent quel objet de l'établi une serrure attend) et les automates, qui raccourcissent tout. L'option « Atelier exigeant » coupe le flair et la lueur d'or pour ceux qui veulent plus de difficulté.

## premiere_minute

Commande I1. Cible : ((S ∨ T) ∨ (S ∨ T)) → (S ∨ T), soit ⟦■ ∞ ▲⟧ ◀[⟦■ ∞ ▲⟧ ∞ ⟦■ ∞ ▲⟧] (284 px). Un seul outil, l'Échangeur. Par : 1.

0 à 5 s. Pas de menu, pas de texte. L'atelier est au soleil, le piano feutré démarre. « Pof ! » : une cartouche tombe du tube, et le bon de M. Grumeau, horloger, se déroule : « Pour caler ma pendule. Pile-poil, je vous prie. » L'écrin de velours s'ouvre (fwoump). On y voit une paire cube-pyramide sur un plateau, une pointe de laiton tournée vers elle, et une serrure d'ambre qui contient deux paires cube-pyramide tenues par un maillon.

5 à 12 s. Sur l'étagère, le Doublé (● ◀[● ∞ ●], 122 px) fait un petit saut. Une carte d'Hortense dit : « Pose un moule sur l'écrin. » Le joueur le glisse. La superposition s'allume en vert sur la pointe, le verre et le maillon, en rouge hachuré sur les trois boules. Rien n'est fabriqué, aucun rivet ne bouge. Il a compris seul qu'il faut changer les boules.

12 à 20 s. La carte Échangeur pulse dans le râtelier. Le joueur y lâche le Doublé (ou appuie sur E). Le poste monte du bas de l'écran avec le Doublé en grand. Ses trois boules se dévissent et laissent trois douilles rondes. Il n'y a qu'une molette, frappée d'une boule, et trois fils vermillon la relient aux trois douilles.

20 à 32 s. Le joueur clique sur le cube de l'écrin. La pince soulève le cube seul, et une bulle discrète dit « encore un clic pour le plateau ». Au deuxième clic, c'est le plateau entier qui se soulève. Une copie en bois brut suit sa main ; il la lâche sur la molette. Cran ! Les trois douilles se remplissent AU MÊME INSTANT, sur un seul accord de bois (les notes du cube et de la pyramide). Des plateaux d'érable glissent sous les trois paires et l'objet s'élargit en douceur. Le fantôme de l'aperçu se pose sur l'écrin : tout passe au vert, et l'écrin s'illumine d'or.
S'il avait pris le cube seul, l'aperçu montrerait trois cubes et l'écrin un écart rouge. Il lui suffirait de reprendre à la pince : rien n'est perdu.

32 à 40 s. Le levier frémit. Un clic (ou Espace), tchac : le bois brut se vernit dans un reflet (pschht) et un rivet s'enfonce dans le couvercle (1 sur 1). L'objet se pose sur l'établi, relié au Doublé par une ficelle.

40 à 50 s. L'objet est identique à la commande. Il s'envole, survole l'écrin et tombe dedans pile-poil, avec un toc velouté. Le couvercle se ferme, coup de tampon « LIVRÉ », le tube aspire le bon. Deux étoiles : « Parfait ! C'est le maximum. » Un seul domino tombe : « 1 geste, rien de caché ».

50 à 60 s. Une nouvelle cartouche arrive, de Mme Vernoux, antiquaire : « Le Doublé, avec un cube accroché derrière. Et qu'il fasse clic. » L'écrin montre ⟦● ◀[● ∞ ●]⟧ ∞ ■ (176 px). La carte d'Hortense dit seulement : « Une flèche ne s'ouvre qu'avec la clé qui a exactement la forme de sa serrure. » C'est I2 : on met le Rajout dans l'Échangeur avec le Doublé entier sur la molette, puis on présente le Doublé à la serrure. Par : 2.

En une minute, le joueur n'a vu aucun symbole ni aucun mot de logique, et il a fait une substitution simultanée exacte.

## ecran

BASE 1280 × 720 (tout est multiplié par 1,5 en 1920 × 1080). Quatre zones et un bandeau.

+---------------------------------------------------------------------------------------+
| BANDEAU y0-40 : retour | Commande | FRISE DU TEMPS ↶ o o o ● ↷ | Notice Aa Radio Plan ♪ ⚙ |
+--------------+------------------------------------------------------------------------+
| ÉTAGÈRE      | ÉCRIN y44-148 : [bon kraft] [ velours vert : empreinte ] [rivets ★★]  |
| x0-224       +------------------------------------------------------------------------+
| y44-720      | ÉTABLI = PLAN DE MONTAGE  x232-1272  y152-604                          |
|  Les Quatre  |   [socle]──ficelle──[socle]──[socle]   colonnes par rang, u=20         |
|  Catalogue   |   ...................................................................  |
|  Fourni      |   POSTE OUVERT : tiroir qui monte du bas, y330-604 (1040 × 274)         |
|  Coffrets    +------------------------------------------------------------------------+
|  [copeaux]   | RÂTELIER y608-720 : [Échangeur E][Duplicateur D][1 Relais][2 …] [N]    |
+--------------+------------------------------------------------------------------------+

BANDEAU (y 0 à 40)
- x 8 à 40 : retour au coffret (la carte du chapitre).
- x 48 à 420 : « Commande 5 · le Porte-tout », avec le petit tampon du client.
- x 440 à 840 : la FRISE DU TEMPS. Un rail porte une perle par geste (vernie si le geste a fabriqué, creuse s'il a été annulé) et un curseur qu'on fait glisser ; ↶ et ↷ aux deux bouts.
- x 860 à 1272 : six icônes de 32 px : Notice (H), Aa (notation), Radiographie (tout déboîter), Plan (recentrer l'établi), Son, Réglages.

ÉTAGÈRE (x 0 à 224, y 44 à 720). Un meuble de bouleau à tiroirs repliables.
- « Les Quatre » : 4 socles de 208 × 56, l'objet à u = 14 (la Rallonge tient en 140 px), avec le surnom gravé et le numéro ① à ④.
- « Catalogue » : les objets livrés, avec leur plaque-surnom.
- « Fourni » : les fournitures du client, étiquette kraft et pièces de plomb.
- « Coffrets » : emblème, pastilles, case « replier partout ».
- En bas (y 676 à 716), le bac à copeaux.

ÉCRIN (x 232 à 1272, y 44 à 148)
- x 232 à 412 : le bon kraft du client (180 × 96 : nom, une réplique, tampon), sous la bouche du tube pneumatique.
- x 420 à 1124 : le velours vert, avec l'empreinte centrée à u = 28 ou 32 (toutes les cibles du chapitre font au plus 340 px à u = 28). C'est aussi la zone d'essayage : on y lâche un objet pour le comparer.
- x 1132 à 1272 : le couvercle, avec autant de rivets que le par, le rivet doré « Record » quand il existe, et les étoiles.

ÉTABLI (x 232 à 1272, y 152 à 604, soit 1040 × 452) : le PLAN DE MONTAGE.
- Chaque objet fabriqué est posé sur un socle de bois (largeur de l'objet + 16 px, hauteur 52), à u = 20. À sa gauche, la petite icône de l'outil qui l'a fait et ses pastilles de réglage.
- Disposition automatique en colonnes, une par rang de dépendance, de gauche (près de l'étagère) à droite. Un objet tiré d'un moule porte un jeton (un mini ①).
- Des ficelles fines relient chaque objet à ses sources. Elles s'avivent au survol, et le reste se voile à 30 %. Le dernier objet fabriqué est sous un petit projecteur.
- Glisser le fond déplace la vue, la molette zoome (de 60 à 150 %), une minicarte apparaît au-delà de deux écrans. Le joueur ne trace jamais lui-même les liaisons.

POSTE OUVERT (un tiroir de 1040 × 274, x 232 à 1272, y 330 à 604). Il monte du râtelier ; l'établi se resserre au-dessus et défile pour garder visibles les objets concernés.
- ÉCHANGEUR, sur trois rangs :
  - rang 1 (y 340 à 404) : l'objet d'entrée à u = 28, ses pièces dévissées en douilles ;
  - rang 2 (y 410 à 478) : les molettes de 64 × 64, une par sorte de pièce, dans l'ordre de lecture. Chacune a son godet de valeur en bois brut (avec une croix pour le vider) et ses fils vers les douilles du rang 1 ;
  - rang 3 (y 484 à 596) : l'aperçu en bois brut à u = 28, réduit jusqu'à 18 au besoin, puis avec des coffrets gris provisoires.
  Le levier est à droite (x 1196 à 1260, y 360 à 590), avec une ligne de verdict « +1 objet neuf » ou « +0, déjà en rayon ». La boîte à pièces s'ouvre en bulle de 360 × 130 au-dessus d'une molette.
- AUTOMATE : la figurine de fer-blanc (90 px) et sa plaque à gauche. Au centre, les berceaux creux numérotés par des encoches, puis les fiches σ « ■ = … ». À droite, les molettes des lettres libres. En bas, le plateau de sortie. La clé de remontoir est sur le flanc droit.
- BULLE DE DIAGNOSTIC (clé qui coince) : ancrée à la serrure, 420 × 120, avec « attendu » d'un côté et « reçu » de l'autre, les deux morceaux à u = 28.

RÂTELIER (x 232 à 1272, y 608 à 720). Des cartes de 96 × 96 : l'Échangeur (E), le Duplicateur (D), puis une figurine par automate gagné (touches 1 à 9, avec la plaque-surnom), l'automate scellé, et tout à droite le bouton Emballer (N). Un clic sur une carte ouvre le poste ; glisser un objet sur une carte l'y charge.

AUTRES ÉCRANS
- Titre : l'atelier vu de face, au matin.
- Carte : le COFFRET, une boîte ouverte de 12 écrins en grille 4 × 3, plus 2 écrins noirs. Un écrin rempli montre son objet et ses rivets.
- Vitrine : les automates gagnés. Un clic rejoue leur réaction en chaîne.

CLAVIER
- Tab / Maj+Tab : passer d'une zone à l'autre (étagère, écrin, établi, poste, râtelier). Flèches : aller d'objet en objet.
- Entrée : entrer dans un objet (pince), prendre ou lâcher. Dans un objet : ↑ parent, ↓ premier enfant, ← et → voisins.
- E : Échangeur. D : Duplicateur. 1 à 9 : automates. K : présenter comme clé, puis choisir l'objet et valider par Entrée.
- Espace : levier ou remontoir.
- L : déboîter. Maj+L : radiographie.
- N : emballer. O : ouvrir le coffret ici.
- C : essayer sur l'écrin.
- Suppr : bac à copeaux.
- Ctrl+Z / Ctrl+Maj+Z : annuler / rétablir.
- H : notice. Maj+N : notation.

## juice

LA GRAMMAIRE QUI SONNE
- CLAC : un manchon arrive à droite d'un maillon. La pointe de laiton jaillit avec un rebond de ressort et le verre vire du gris à l'ambre en 120 ms (sfx_clac, nouveau).
- DÉCLIC : on déboîte. La pointe rentre, le maillon retombe en tintant (sfx_declic, nouveau).
Ces deux sons reviennent tout le jeu : on finit par entendre la structure.

AU REPOS ET AU SURVOL
- Le sous-assemblage survolé se soulève de 2 px, son ombre s'élargit, le reste se voile. Ses jumeaux s'allument partout avec un « ting » léger.
- La serrure active de chaque objet respire doucement (lueur d'ambre). Les automates du râtelier tapotent, bâillent, tic-taquent.
- Mélodie (en option) : survoler un objet joue ses pièces de gauche à droite, avec des notes synthétisées en WebAudio (boule = do, cube = mi, pyramide = sol…).

ÉCHANGEUR
- Molettes : crans de bois (sfx_cran_a/b/c, existants). Godet qui se remplit : sfx_remplir.
- Les fils vibrent comme des cordes.
- Au levier (sfx_manivelle), toutes les occurrences sautent au même instant, sur UN accord de « toc » accordés (un seul échantillon, transposé), jamais un arpège. Suivent une animation FLIP de 250 ms, des plateaux qui glissent et les clacs d'emboîtement.
- Passage du bois brut au verni : un reflet balaie l'objet (« pschht », nouveau), l'objet bondit sur son socle de l'établi et la ficelle se tend.
- Liserés de provenance : vifs pendant 4 s, puis visibles au survol.
- Coffret touché : il se fend (sfx_fissure), ses planches de laque sautent et le contenu se déplie.

LA CLÉ
- Au survol, le fantôme se cale et les goupilles s'allument une à une, dans l'ordre du noyau, de plus en plus aigu (un échantillon « goupille », transposé). Un sous-assemblage identique fait un seul clac grave.
- Ça rentre : 80 ms de silence, puis CLAC de laiton (sfx_serrure). Le verre s'ouvre en deux demi-coques, B jaillit vers la gauche avec un « pop » de bouchon, rebondit deux fois et se pose sur l'établi. Le verre se referme. Légère secousse d'écran, désactivable.
- Ça coince : « clonk » mat (sfx_bloque), un petit ressort « boïng » jaillit au point d'écart, des hachures rouges marquent les deux morceaux, la clé fait non de la tête et revient à sa place. Ni écran rouge ni perte.

AUTOMATE
- Le berceau aspire l'objet (« chk »), les douilles prennent l'empreinte dans une poussière dorée, les fiches σ glissent en place.
- Remontoir : cliquetis qui se resserre (sfx_engrenages), puis l'automate s'anime et dépose l'objet.
- Conflit : grincement, et l'automate hausse les épaules.

RIVETS ET COMPTEUR
- Rivet : petit coup de marteau. Rivet doré : tintement. Rivet rouillé : coup mat.
- Copie : un « +0, déjà en rayon » qui s'efface.

LIVRAISON
- L'écrin s'illumine d'or quand l'aperçu égale la commande.
- Pile-poil : l'objet vole en arc, dépasse un peu et tombe avec un toc velouté (nouveau). Le couvercle se ferme (sfx_couvercle), coup de tampon « LIVRÉ » (nouveau), le tube aspire le bon (nouveau). Les étoiles tombent (sfx_etoile_a/b/c), puis mus_victoire.

LA RÉACTION EN CHAÎNE (fin de commande ; on peut la passer, et sa vitesse se règle)
1. La caméra recule. Chaque automate utilisé ouvre son couvercle et déroule en dominos teintés à sa couleur les gestes qu'il cachait (verify.deplier). Le compteur grimpe : 57 gestes pour le Juge.
2. Les échanges remontent jusqu'aux moules (eliminerSubstitution) : les dominos d'échange se fondent dans les dominos-moules. Il ne reste que des dominos blancs gravés ① à ④ et des dominos de laiton (les clés) : 73 pour le Juge (37 moules, 36 clés), 59 pour le Croiseur, 25 pour la Fourche.
3. Le vérificateur indépendant (verifierGodement, lancé en tâche de fond dès la livraison) les relit. Ils tombent un à un, de plus en plus vite (un échantillon de domino, avec des variations), et le dernier fait basculer le tampon vert « CONTRÔLÉ ».
4. BREVET : l'objet est monté sur un socle d'horlogerie et ses serrures de droite se retournent une à une en berceaux (clac, clac). La clé tourne trois fois, l'automate cligne des yeux, fait trois pas et rejoint le râtelier : « Nouvel automate : le Relais ». Puis vient la page du Carnet, si on l'ouvre.
Échec d'inspection (ne devrait jamais arriver) : tampon rouge « À REVOIR » et projecteur sur l'objet fautif.

DÉFIS : écrin noir, lampe tamisée, mus_defi. Battre un record fait sonner une cloche (nouveau) et inscrit le livre des records.

ANNULER : bruit de bobine qui rembobine ; l'objet redevient du bois brut et s'efface.

RÉGLAGES : mouvements réduits (animations courtes, toutes les informations aussi disponibles en texte), secousse désactivable, volumes séparés pour la musique, les bruitages et les mélodies.

## plan_realisation

ON GARDE TEL QUEL
- core/* (formula, subst, match, rules, sheet, journal, levels, score, capsules, verify, godement) et les 46 tests de tests/run.mjs.
- Le journal comme seule source de vérité, avec ses événements : POSER, BRANCHER, DEBRANCHER, REGLER, ACTIONNER, RETIRER, DEMONTER, NOMMER, OUBLIER, AUTO, LOUPE, ANNULER, RETABLIR.
  - COTE n'est plus utilisé ; POSER reçoit cote « droite ».
  - Un champ g, ignoré par le noyau, regroupe les événements d'un même geste.
  - Les sauvegardes actuelles se rejouent à l'identique.
- levels/chapitre1.json : formules, par, troisEtoiles et références ne changent pas. On ajoute des clés d'interface (surnom, client, réplique, emblème, page du Carnet) et on réécrit les phrases « enseigne » sans feuille ni lettres (par exemple « Une molette change toutes les pièces de même forme, d'un coup. »).
- La musique (5 pistes) et les 26 bruitages existants, ainsi que tools/gen_audio.py et tools/manifest.py (avec de nouveaux prompts).

ON ADAPTE
- ui/audio.js : on ajoute la transposition d'un échantillon (playbackRate) pour les notes des pièces, l'accord de l'Échangeur et les goupilles.
- ui/assets.js : même manifeste et même principe de substitut procédural, avec de nouveaux dessinateurs vectoriels.
- ui/i18n.js : nouveau lexique fr/en.
- ui/editor.js : devient le champ texte de la boîte à pièces et du mode Notation.
- ui/screens.js : titre, coffret (la carte), vitrine, réglages.
- ui/app.js : état recalculé depuis le journal, sauvegarde, export, curseur de temps, vérification de fin en tâche de fond. Environ 40 % est repris.

ON SUPPRIME : formula-view.js, cables.js, machines.js et le dossier machines/. styles.css est réécrit.

ON ÉCRIT
- ui/objet/pose.js (environ 350 lignes, PUR, testé sous Node). Il transforme l'arbre de replier() en éléments posés : {sorte (pièce, plomb, maillon, manchon, flèche, plateau ou coffret), x, y, l, h, ch (chemin du noyau), profondeur, cerclage}, plus la ligne d'horizon et une signature. Il applique les règles du plateau et de la file, à partir d'une table de métriques : pièce 28, maillon 14, marges de verre 8 et 6, pointe 10, plateau 6 et 4, coffret 42.
- ui/objet/relecture.js (pour les tests seulement) : des éléments posés à la formule.
- ui/objet/rendu.js (environ 400 lignes) : le rendu SVG. Finitions (verni, bois brut, velours, fantôme), surbrillances (jumeaux, liserés, goupilles, hachures), attribut data-ch sur chaque élément. Les pièces utilisent les PNG s'ils sont présents, sinon le dessin vectoriel ; les textures sont des motifs SVG.
- ui/objet/diag.js (environ 150 lignes) : traduit les chemins du noyau en éléments dessinés, y compris un r sous une flèche (qui désigne la serrure entière), et calcule tous les écarts pour les rouges pâles.
- ui/pince.js et ui/glisser.js (environ 350 lignes) : sélection qui s'élargit, navigation au clavier dans l'arbre, glisser-déposer, cibles de dépôt, distinction bois brut / verni.
- ui/etagere.js, ui/ecrin.js (essayage, flair, rivets) et ui/etabli.js (colonnes par rang, ficelles SVG, zoom, minicarte) : environ 700 lignes.
- ui/postes/echangeur.js (environ 300), duplicateur.js (environ 60), automate.js (boîte et scellé, environ 350), boite-a-pieces.js (environ 200).
- ui/cle.js (environ 200) : MP direct, aperçu par mp(), groupe d'événements, bulle de diagnostic.
- ui/fin.js (environ 350) : livraison, réaction en chaîne (deplier, eliminerSubstitution, verifierGodement), brevet, Carnet.
- ui/frise.js, ui/clavier.js et ui/fx.js (Web Animations, FLIP, calque canvas pour les particules et les dominos).
Total : environ 5 000 lignes de JS (dont environ 1 200 reprises ou adaptées), environ 1 200 lignes de CSS, et environ 400 lignes de tests en plus.

TECHNIQUE
- DOM pour la mise en page et l'accessibilité : chaque objet est focalisable, avec un aria-label en mots (« boule rouge et cube bleu, si boule rouge ») suivi de texte().
- SVG pour les objets : net à toute échelle, clic par data-ch, thèmes et mode daltonien en CSS.
- Un canvas superposé pour les particules et les dominos (il peut y en avoir des centaines dans les défis).
- Modules ES statiques, aucune dépendance, devicePixelRatio géré.

TESTS AJOUTÉS (Node)
1. Relecture injective : les 52 formules du chapitre, toutes les lignes des preuves dépliées, et 10 000 formules aléatoires avec déboîtages et coffrets aléatoires.
2. Une flèche apparaît si et seulement si estImp est vrai et que le nœud n'est pas déboîté ; pas de plateau dans une file.
3. Le déboîtage et les coffrets ne changent jamais l'identifiant.
4. Budget de largeur : toute ligne des solutions fait au plus 1 068 px à u = 28, et au plus 640 px avec les coffrets suggérés.
5. Diagnostic : sur 10 000 paires aléatoires, le chemin de divergence() désigne toujours un élément dessiné.
6. Rejeu des 12 solutions de référence par la couche de gestes (geste, puis événements, puis noyau), avec le bon nombre d'étoiles et une annulation geste par geste.

JALONS (environ 3 semaines)
- M1 (environ 1 semaine) : pose.js, relecture, rendu procédural, étagère, écrin, établi, Échangeur, clé directe. I1 à TL0 jouables sans aucun média. À la fin de M1, test de lecture sur 5 non-matheux : file contre imbrication, lecture du creux de l'écrin, distinction bois brut / verni.
- M2 (environ 1 semaine) : automates et automate scellé, coffrets, pince au clavier, frise, notice, réaction en chaîne, Carnet, i18n. Le chapitre est jouable en entier.
- M3 (environ 1 semaine) : rendus Kimi et Blender (pièces d'abord, automates en dernier), bruitages ElevenLabs, finitions, accessibilité.

## brief_rendus

RÈGLES COMMUNES
- Blender, caméra orthographique, élévation de 15°.
- Lumière principale douce en haut à gauche, plus un léger contre-jour ; ombres courtes ; rendu AgX.
- Fond transparent, PNG de 256 px (512 pour les décors), aucun texte ni logo.
- Style : jouets de designer scandinaves des années 50-60 (Naef, Kay Bojesen), laque brillante, laiton brossé, verre.
- Les PIÈCES sont rendues en LAQUE BLANCHE, en deux calques : « base » (ombrage diffus en gris) et « reflets » (spéculaire seul, additif). Le code les teinte ainsi sans nouveau rendu (palette normale, daltonienne, thème sombre).
- Kimi n'est accessible que par kimi.com en étant connecté. Chaque élément a donc déjà son dessin vectoriel : les PNG enrichissent le jeu, ils ne sont pas indispensables.
- Priorités : 1 = pièces et maillon ; 4 = automates.

1. PIÈCES (priorité 1). 12 formes en laque blanche, chacune en 2 calques, soit 24 images : boule, cube, pyramide, croix, losange, croissant, hexagone, étoile, goutte, disque, cœur, tore. S'y ajoutent un plomb de scellé au fil (petit sprite) et une texture de plomb mat pour teinter les pièces-noms.

2. GRAMMAIRE (priorité 1).
- Maillon de laiton double : 1 image, plus 1 image du maillon réduit, emboîté dans la pointe.
- Pointe de laiton de la flèche, vue de côté, avec son anneau : 1 image, teintée en code (laiton ou cuivre selon la profondeur).
- 6 textures répétables de 256 px : verre fumé gris-bleu, verre ambré, velours vert sombre, érable, noyer, laque noire.
Les manchons, serrures et plateaux sont des chemins SVG remplis de ces textures : pas de découpage en 9 tranches tiré de la 3D.

3. COFFRET (priorité 2). Coffret laqué noir à fermoir de laiton, en 3 états : fermé, entrouvert, fendu. Plus 12 petits emblèmes dorés : ancre, couronne, cloche, lune, poisson, clé, étoile, feuille, éclair, vague, plume, oiseau.

4. ÉCRIN (priorité 2). Couvercle ouvert et fermé (2 images). Rivet creux, enfoncé, doré, rouillé (4). Cadre de bois de l'écrin (1, étirable en 3 tranches horizontales).

5. OUTILS (priorité 2).
- Échangeur : corps en émail crème et laiton (1), molette-bobine (1), levier en position haute et basse (2).
- Duplicateur, presse à jumeaux, ouverte et pressée (2).
- Socle de bois d'un objet (1) et jeton de moule (1).

6. RITUEL (priorité 3). Bouche de tube pneumatique (1), cartouche (1), tampon encreur (1), texture de bon kraft (1), domino de bois blanc et domino de laiton (2), clé de remontoir (1), socle d'horlogerie (1).

7. DÉCOR (priorité 3).
- Établi de bouleau (texture de 512, pour le jour) et de noyer (pour le soir).
- Étagère à tiroirs, bac à copeaux, râtelier.
- Écran titre : l'atelier vu de face au soleil, en 1920 × 1080, et sa version du soir.
- Boîte du coffret avec 12 écrins et 2 écrins noirs ; vitrine.

8. AUTOMATES EN FER-BLANC (priorité 4, les plus chers). Le Relais, le Porte-tout, le Farfelu, la Fourche, le Croiseur, le Portier, le Relais à rebours, le Juge, et le Préjugé (scellé, liseré de plomb). Pour chacun, une pose de repos et une pose active en 256 px, soit 18 images. Silhouettes simples, lisibles à 56 px, avec un attribut chacun (le Juge tient une balance, la Fourche a deux bras, le Croiseur croise les bras…).

Total : environ 75 images.

AUDIO À GÉNÉRER (ElevenLabs, par API), environ 14 sons :
- clac d'emboîtement et déclic de déboîtage ;
- goupille (un seul échantillon, transposé) ;
- coincement « clonk » avec ressort ;
- toc de bois accordé (un échantillon, transposé pour les accords et les mélodies) ;
- vernis « pschht » et chute dans le velours ;
- pof pneumatique et aspiration ;
- tampon ;
- rivet (3 variantes) et domino (2 variantes) ;
- cloche de record.
Aucune nouvelle musique.

## risques

1. NOM. « Pile-Poil » est déjà pris. Pile-Poils est un jeu de société de Lucky Duck Games sorti en février 2026 (version française de Purrramid), et Pile Poil un jeu de cartes de 2014. Sources : [Esprit Jeu](https://www.espritjeu.com/pile-poils.html), [Philibert](https://www.philibertnet.com/en/lucky-duck-games/168304-pile-poil-purramid-8720077373891.html), [BoardGameMatcher](https://boardgamematcher.com/game/pile-poil). D'où le titre « Bric & Clé » : une recherche rapide ne trouve aucun jeu de ce nom. « Pile-poil ! » reste l'exclamation de livraison. À confirmer par une recherche INPI avant toute publication.

2. ORDRE B ◀ A. Il va contre l'habitude « A → B ». Parades : la pointe vise B, on lit « B si A », I2 enseigne la clé avant tout, et le mode Notation affiche A → B. C'est le choix de l'auteur et la forme stockée par le noyau.

3. FILE CONTRE IMBRICATION. C ◀[B] ◀[A] et C ◀[B ◀[A]] doivent se distinguer d'un coup d'œil. Parades : seule la serrure active luit, les cerclages alternent, et un test de lecture a lieu dès M1.

4. LARGEUR. Jusqu'à 1 068 px à u = 28 (niveau C). Parades : u = 20 sur l'établi, entrée et sortie empilées dans le poste, coffrets suggérés (438 px avec trois), coffrets gris provisoires, et le défilement en dernier recours. Le niveau C doit enseigner l'emballage.

5. VERRES IMBRIQUÉS. Trois au plus dans le chapitre (mesuré), peut-être davantage dans les défis. Parades : verre clair, contenu vif, cerclage alterné, et le survol qui soulève le sous-assemblage.

6. ORDRE DU DIAGNOSTIC. divergence() lit la serrure avant la gauche, donc le point qui coince n'est pas toujours le plus à gauche. On anime les goupilles dans l'ordre du noyau (« la clé entre par la droite ») et on montre les autres écarts en pâle. Ne jamais réordonner, sinon l'animation mentirait.

7. CHEMIN EN r SOUS UNE FLÈCHE. Le « non » fusionné n'a pas de dessin propre. ui/objet/diag.js le traduit en serrure entière (ou en manchon si la flèche est déboîtée), avec un test de fuzz.

8. BOIS BRUT CONTRE VERNI. Si le contraste est faible, le refus « pas verni » paraîtra arbitraire. Parades : contraste fort (pâle, mat, pointillé), refus explicite, et I1 l'enseigne par la pince.

9. MUR DE DIFFICULTÉ (AF, S, C, MPI). Parades : chaud-froid permanent, notice en trois cartes, jumeaux, automates. À mesurer en test (temps passé par commande).

10. TROP D'AIDE. Le flair et la lueur d'or pourraient affadir le jeu. L'option « Atelier exigeant » les coupe, et la vraie difficulté reste le choix des échanges et des clés.

11. CLÉ LÂCHÉE PAR ERREUR. Elle peut fabriquer un objet inutile et coûter un rivet. Le dépôt n'agit que sur une serrure qui luit, et Ctrl+Z annule le geste entier.

12. ÉTABLI ENCOMBRÉ (8 ou 9 objets, davantage dans les défis). Parades : disposition automatique par rang, ficelles voilées, zoom, minicarte.

13. MÉDIAS. Kimi n'est accessible que par kimi.com connecté. Le rendu procédural est la référence et doit plaire seul ; les automates arrivent en dernier ; pas de 9 tranches tirées de la 3D.

14. TON. Jouets de designer et humour sec dans les bons, pour ne pas basculer dans le jeu de maternelle. Pas d'animaux.

15. AL4 DE L'ÉNONCÉ. La version (T ∨ R) n'est ni le moule du cours ni celui du noyau, qui est (R ∨ T). On garde le noyau : le double clac de TL0 en dépend.

16. ANNULATION GROUPÉE. Un geste vaut plusieurs événements. La frise, le rejeu et les sauvegardes doivent rester cohérents (test 6).

# Alternatives

## Cadenas & Cie

**angle** : Une usine lumineuse des années 60, façon Jacques Tati : la preuve EST l'usine, un graphe de postes visible en permanence.

**pitch** : Dans une fabrique de quincaillerie à la Tati, les bons de commande arrivent par tube pneumatique. Tu installes des postes (presse à échanges, serrure, duplicateur, machines brevetées) et tu tires des leviers jusqu'à livrer au quai le produit commandé. L'usine qui pousse sous tes yeux est littéralement le graphe de ta démonstration, et l'inspectrice la démonte jusqu'aux quatre moules-mères avant de tamponner « CONFORME ».

**formules** : La grammaire est la même que dans la recommandation, mais en émail et en verre : pièces émaillées (écrou rouge, bille bleue, cube jaune…), maillon de laiton, gaine de verre gris à bouts ronds, et un cadenas ambré quand une gaine est à droite d'un maillon (pointe vers B, A dans le verre, même dessin que seul). On abandonne le berceau sous chaque nœud, qui montait jusqu'à 8 étages (mesuré), au profit de la règle de la file, qui en garde 3 au plus. On conserve la ligne d'horizon, les jumeaux, l'essayage (premier désaccord en rouge) et la pince.

**ecran** : La Réserve est à gauche (moules, catalogue, fournitures). Le hall occupe le centre : un graphe de postes et de socles en colonnes par rang, reliés par des tubes pneumatiques plutôt que par des tapis, pour éviter l'effet Shapez. Le quai est à droite (bon de commande, zone d'essayage), l'établi en bas (le poste sélectionné en grand, avec son levier) et la boîte à outils en bas à droite. Le bandeau porte le compteur « Fabriqués / Devis » et le bocal à étoiles.

**pourquoi_pas_premier** : Le logicien l'a placé en tête (8) pour son graphe de preuve permanent et son inspection fidèle. Le joueur (6,5) et la production (6) le jugent trop lourd : 5 zones à l'écran, environ 25 mots de jargon (moule-mère, tirage, trémie, douille, étau, devis…), un modus ponens en 4 actions qui passe par un poste, des pièces de 11 px dans le hall, 6 000 à 7 000 lignes de code et une musique en couches qu'ElevenLabs ne garantit pas. Des formes colorées dans un hall d'usine évoquent Shapez dès la première image. Ses meilleures idées sont reprises dans Bric & Clé : le graphe permanent (l'établi), le tube pneumatique, le tampon, l'inspection fidèle, la pince, l'essayage et le plomb pour les noms.

## Éclipse

**angle** : Abstrait et lumineux : une ville la nuit, réduite à ses signaux. Chaque objet démontré est une station, chaque opération un appareil de lumière.

**pitch** : La nuit, des formes de lumière (gemmes, maillons, éclipses d'obsidienne) circulent de station en station. Fais-les passer dans des prismes qui changent d'un coup toutes les gemmes d'une même forme, et dans des écluses qui ne s'ouvrent qu'à la forme exacte, jusqu'à allumer la silhouette du terminus. À la fin, ton réseau se déplie jusqu'à ses sources, et une onde de contrôle le parcourt.

**formules** : Les lettres sont des gemmes de verre émissif (forme plus couleur Okabe-Ito), le « ou » un maillon de lumière blanche, le « non » une éclipse : une coque d'obsidienne cerclée d'un fil de lumière. Une éclipse placée à droite d'un maillon l'avale et devient une goutte à pointe dorée, la serrure (B ◁ A), avec A dessiné à l'identique à l'intérieur. Les noms sont des empreintes creuses, les capsules des cristaux. La file d'écluses C ◁[B] ◁[A] se passe de plateau. Mesuré : 3 conteneurs imbriqués au plus, 1 068 px au maximum. Le courant va de droite à gauche partout, dans le sens de la flèche. La superposition gratuite utilise le même rendu que le diagnostic d'une écluse.

**ecran** : Le terminus (la cible) est à gauche. Le réseau de stations occupe le centre, avec des rails octilinéaires sur une trame de points. Les sources sont à droite (axiomes, théorèmes gravés, prémisses prêtées). En bas, un banc de 200 px réunit les outils, l'atelier du prisme, de l'écluse ou de l'échangeur, et un grand bouton Lancer. L'horaire (le curseur de temps) et les feux de signal (les étoiles) sont dans le bandeau.

**pourquoi_pas_premier** : C'est le plus élégant et le mieux mesuré, et aussi le moins cher à produire : environ 3 600 lignes et 40 images, tout en SVG. C'est donc un bon repli si les médias ne suivent pas. Mais il est froid et contemplatif (4,5 pour le joueur) : rien à toucher, pas d'humour, un réseau qui ressemble à un diagramme et un flux de droite à gauche qui désoriente. Le « non » en obsidienne contraste mal sur le fond de nuit. Les pointillés y veulent dire deux choses (« non prouvé » et « nom »). Et l'esthétique de plan de métro fera dire « Mini Metro ». Bric & Clé lui reprend la superposition rendue comme un diagnostic, les liserés de provenance, la règle de la file et les coques SVG texturées.

# Notes

Notes des trois juges, dans l'ordre joueur grand public / logicien / directeur de production, puis la moyenne :

- **Concept 3, jouet mécanique « Pile-Poil » : 7,5 / 8 / 8, moyenne 7,8.** Retenu comme base. C'est l'idée la plus forte (plein et creux, bois brut contre verni), celle qui ressemble le moins à un jeu existant, et elle réutilise la musique existante.
- **Concept 4, Bidulerie : 8 / 7 / 7, moyenne 7,3.**
  - Repris : la règle de la file, le test de relecture, la clé directe par glisser-déposer avec fantôme prédictif, les serrures retournées en berceaux, les clients en une réplique, le Carnet du curieux, le procédural comme référence.
  - Écarté : le village d'animaux (trop proche d'Animal Crossing, ton enfantin), le A dessiné en creux dans la serrure (il casse la comparaison), les quelque 130 PNG.
- **Concept 1, usine Tati : 6,5 / 8 / 6, moyenne 6,8.**
  - Repris : le graphe de preuve permanent (devenu l'établi), le tube pneumatique et le tampon, la pince, l'essayage, la ligne d'horizon, l'empilement entrée/sortie, l'inspection fidèle au noyau, le plomb pour les noms.
  - Écarté : les tapis roulants, les 5 zones, le jargon, la musique en couches.
- **Concept 2, ville-signal : 4,5 / 7,5 / 6,5, moyenne 6,2.**
  - Repris : la superposition rendue comme le diagnostic, les liserés de provenance, les coques SVG texturées, les mesures de largeur.
  - Écarté : l'esthétique de plan de métro (trop proche de Mini Metro).

Erreurs des concepts, vérifiées sur le noyau et corrigées :
- TL0 s'obtient avec σ = {R:S, S:T, T:¬R}, pas avec T := ¬R seul.
- La formule profonde a 3 épaisseurs de verre, pas 2.
- Le diagnostic « ordre » n'existe pas : c'est portVide, que les berceaux remplis dans l'ordre rendent impossible.
- 73 est le nombre de dominos après élimination de la substitution ; le dépliage seul donne 57 gestes.
- « Pile-Poil » est déjà pris comme nom de jeu.

## Juge

- 1. Usine / chaîne de production : « Chaî : 6.5
- 2. Graphe abstrait : « Correspondances » : 4.5
- 3. Jouet mécanique : « Pile-Poil », un a : 7.5
- 4. Joker : « La Bidulerie / Pile-Poil », : 8

Pour un joueur qui fuit les maths, le classement est net : 4 (Bidulerie) > 3 (Pile-Poil, jouets mécaniques) > 1 (Usine) > 2 (Métro). Le métro est le plus beau sur le papier, mais il est froid et abstrait. Le flux à rebours désoriente, et un réseau de stations ressemble à un diagramme : en bande-annonce, on lira « Mini Metro » et on ne comprendra pas le geste. L'usine a un vrai style et un bon rituel. En revanche, elle noie le joueur sous 5 zones et 25 mots de jargon, son MP passe par une machine en 4 actions, et ses tapis ne transportent rien, ce qui déçoit l'attente « jeu d'usine ». Les concepts 3 et 4 tiennent la promesse : rien n'y ressemble à un cours, la question est universelle (ça rentre pile-poil ?), et l'échec ne coûte rien et montre où ça coince. Recommandation : prendre la BIDULERIE comme base, pour ses clients farfelus, son MP par glisser-déposer direct, sa trappe-serrure, ses douilles reliées par des fils et son Carnet du curieux. Il faut y greffer trois apports du concept 3 : le tutoriel « pose-le sur l'écrin, vert/rouge », la cascade de dominos en final, et le « 2 = Parfait / 3 = Record ». Il faut aussi adopter la DA « jouet de designer » du concept 3, plus adulte, pour ne pas basculer dans le jeu de maternelle. Les animaux restent présents dans les bulles et les figurines, avec un humour sec. Côté métro, on garde les liserés de provenance et la règle plein/pointillé ; côté usine, la cartouche pneumatique et le tampon. Deux risques à traiter avant de coder. (1) Les 30 minutes : vers AF, S et MPI, le mur de difficulté de Hilbert reste entier dans les quatre concepts. Il faut un indicateur chaud/froid permanent (l'aperçu superposé à la cible) et des indices du hibou très progressifs, sinon le joueur grand public décroche au 5e niveau. (2) Les médias : le charme du concept 4 repose sur des figurines que Kimi ne garantit pas. La version procédurale doit donc être drôle et belle à elle seule, avec des personnages en silhouettes simples. Il faut aussi tester tôt, sur 5 non-matheux, la lecture d'un creux qui contient des serrures.

## Juge

- Usine / chaîne de production (« Chaînes  : 8
- Graphe abstrait / ville-signal (« Corres : 7.5
- Montage / jouet mécanique (« Pile-Poil » : 8
- Joker : « La Bidulerie » (jouets à serru : 7

Aucun des quatre concepts n'invente d'opération. Tous ont lu le noyau de près : estImp, divergence dans l'ordre antécédent puis conséquent, formulesNouvelles, boiteInutile, portVide, regle sur les noms. J'ai vérifié plusieurs affirmations directement sur le noyau. Le script de mesure du concept 2 est confirmé : 52 formules, 3 conteneurs imbriqués au plus, 1068 px au maximum. Le diagnostic lral du concept 3 est exact. Deux affirmations sont fausses : le concept 1 annonce 2 épaisseurs de verre pour la formule profonde, il y en a 3 ; le concept 3 décrit TL0 comme T := ¬R seul, alors que la référence est σ = {R:S, S:T, T:¬R}.

Classement du logicien : Usine 8 = Jouet 8 > Ville-signal 7,5 > Bidulerie 7.

L'Usine montre le mieux la STRUCTURE DES PREUVES : le graphe permanent, puis l'inspection qui déplie les lemmes. Son dessin parenthésé en entier devient en revanche trop profond (jusqu'à 8 conteneurs imbriqués). Le Jouet a l'idée la plus profonde, le couple plein/creux pour l'égalité et le filtrage, et la règle d'honnêteté la plus nette (bois brut / verni), mais la preuve comme graphe y reste invisible. La Ville-signal est la plus exacte et la mieux mesurée, mais ses pointillés y veulent dire deux choses contraires et le « non » y est peu lisible. La Bidulerie offre la meilleure garantie (relecture) et le meilleur geste de MP, mais son creux dans la serrure casse la comparabilité, et ses « jokers » confondent nom et variable.

Recommandation : une synthèse. Grammaire : pièces, maillon, manchon, flèche emboîtée, avec la convention de file des concepts 2 et 4 et le test de relecture. Contenu de la serrure dessiné à l'identique. Plein/creux et bois brut / verni repris du concept 3. Graphe de preuve permanent et inspection repris du concept 1. Superposition dont le rendu est celui du diagnostic de MP, comme dans le concept 2, plus le fantôme prédictif du concept 4. Reste à traiter, dans tous les cas, la correspondance entre un chemin de divergence en 'r' et la coque de la serrure.

## Juge

- 1. Usine / chaîne de production : « Chaî : 6
- 2. Graphe abstrait : « la ville-signal » : 6.5
- 3. Montage / jouet mécanique : « Pile-Po : 8
- 4. Joker : « La Bidulerie » (fabrique de : 7

Pour un directeur de production, le concept 3 (« Pile-Poil », l'atelier de jouets en bois) est le meilleur socle, à 8/10. Il a l'idée la plus forte et la plus honnête vis-à-vis du noyau : le couple plein/creux, plus la règle bois brut contre verni. Il ne ressemble à aucun jeu précis. Il réutilise toute la musique existante et se rend en SVG. Son seul vrai mensonge est le chiffrage : « 2 à 3 jours » ; il faut compter 1 à 2 semaines.

On lui greffe :
- du concept 4 (7/10) : la règle de la file et le test de relecture injective ;
- du concept 2 (6,5/10) : les coques SVG texturées et le budget de largeur mesuré ;
- du concept 1 (6/10) : la pince, l'essayage, la ligne d'horizon, l'empilement entrée/sortie et une vue graphe à disposition automatique.

À ne pas reprendre :
- les tapis du concept 1 : la première image fera penser à Shapez ;
- le plan de métro du concept 2 : c'est l'identité visuelle de Mini Metro, et le concept ne le voit pas ;
- le village d'animaux du concept 4 : hérissonne commerçante et hibou évoquent Animal Crossing, avec en plus le risque d'un ton enfantin ;
- la musique adaptative en couches synchronisées (concepts 1 et 2), qu'ElevenLabs ne garantit pas.

Ordre de chantier conseillé :
- M1 : une fonction pure de mise en page à partir de replier(), avec la relecture et le budget de largeur testés sur toutes les lignes dépliées. Rendu procédural seul, I1 à TL0 jouables. Le noyau et le journal restent intacts, et les annulations sont regroupées par geste.
- M2 : greffoir, MP direct, automates et coffrets.
- M3 : rendus Kimi/Blender réservés aux pièces et aux décors, plus une douzaine de bruitages ElevenLabs.

Garder l'AL4 du cours, pas celui de l'énoncé : le « clac clac » de TL0 en dépend.

