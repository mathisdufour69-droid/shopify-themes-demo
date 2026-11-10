# SANSMODÉ · thème Shopify sur mesure

Thème Online Store 2.0 écrit de zéro (aucun thème du Theme Store, aucune app) pour une marque fictive de bonbons fonctionnels : 80 % de fruits et légumes, 0 g de sucres ajoutés, une recette par nutriment.

> SANSMODÉ est une marque fictive. Boutique de démonstration conçue par Mathis Dufour.

## Installation (5 minutes)

1. **Thème** : Admin › Boutique en ligne › Thèmes › Ajouter un thème › Charger un fichier `.zip`, puis Publier.
2. **Produits** : Admin › Produits › Importer › `produits-sansmode.csv` (5 bonbons × 3 formats + le coffret).
3. **Ordre de la grille (optionnel)** : créer une collection manuelle « La gamme » (Grisaille en premier), puis la choisir dans la section *Grille produits*.

Aucune image produit n'est à téléverser : si un produit n'a pas de média, le thème affiche son visuel embarqué (`assets/pouch-{handle}-*.webp`). Dès qu'une vraie photo est ajoutée dans l'admin, elle prend le relais.

## Architecture

```
layout/      theme.liquid, password.liquid
sections/    16 sections d'accueil + fiche produit, avis, panier, collection, recherche, blog…
             header-group.json / footer-group.json (groupes de sections OS 2.0)
snippets/    product-card, product-data, picture, rating, logo, icon, lightbox, meta-tags, pagination
templates/   JSON partout (index, product, collection, cart…) + gift_card.liquid
assets/      base.css (1 fichier), theme.js (vanilla, defer), polices woff2, visuels WebP
```

- **Tout est éditable dans l'éditeur de thème** : textes, images, blocs (réassurance, presse, avis, FAQ, comparatif…), couleurs de marque, seuil de livraison offerte, heure limite d'expédition, date limite de Noël.
- **`snippets/product-data.liquid`** centralise l'éditorial par produit (accroche, nutriment, couleur, note). Chaque champ lit d'abord un métachamp `custom.<champ>` : en production, le marketing édite tout sans toucher au code.
- **Panier en tiroir via la Section Rendering API** : un seul aller-retour réseau rend le tiroir à jour, aucun rechargement, aucun HTML dupliqué en JS. Sans JavaScript, tous les formulaires restent natifs et fonctionnent.
- **Zéro dépendance** : pas de jQuery, pas de librairie de carrousel, pas de Google Fonts.

## Choix CRO

| Choix | Pourquoi |
|---|---|
| Promesse en une phrase + un seul bouton dans le hero | Un message, une action. La note (4,6/5, 3 120 avis) est juste sous le bouton, là où le doute apparaît. |
| Mini-carte coffret cliquable dans le hero | Saisonnalité visible dès le premier écran, et c'est un vrai lien (pas de clic mort). |
| Duo « Nouveau » à gauche, « Best-seller » à droite | La curiosité d'un côté, la sécurité du choix majoritaire de l'autre. |
| Prix par sachet affiché partout (grille, fiche, offres) | Le lot de 3 devient lisible en une seconde : 3,30 € au lieu de 3,90 €. |
| Lot de 3 présélectionné, badge « Le plus choisi » | Effet d'ancrage + preuve sociale au moment du choix. Le format 1 sachet reste en premier pour ancrer le prix bas. |
| Achat unique toujours visible à côté de l'abonnement | Pas de dark pattern : l'abonnement se vend par son avantage (−15 %, sans engagement), pas par défaut. |
| Bouton « Ajouter · 9,90 € » | Le prix sur le bouton supprime une hésitation (Baymard). Idem « Commander · total » dans le panier. |
| Barre d'ajout collante sur mobile | Sur la fiche, un bouton d'achat est toujours à portée de pouce dès que le bouton principal n'est plus à l'écran. |
| Galerie limitée à ~46 % de l'écran mobile | Le nom, la note et les offres remontent dans le premier écran. |
| Date de livraison calculée (jours ouvrés, heure limite) | « Reçu entre le jeu. 12 et le ven. 13 nov. » convertit mieux qu'un délai abstrait. Compte à rebours réel, jamais factice. |
| Onglets « J'ai 2 minutes / J'ai le temps » (Rishi Rawat) | Le pressé lit 4 puces, le méfiant lit l'histoire complète. |
| Comparatif SANSMODÉ / bonbons / gélules | Règle l'objection « c'est juste du sucre » en 5 lignes. |
| Un avis à 4 étoiles gardé exprès, avec réponse de la marque | Une moyenne parfaite paraît fausse (Spiegel Research Center : la probabilité d'achat culmine entre 4,0 et 4,7). La réponse rassure plus que la note. |
| Avis vidéo en lightbox | Jamais de bouton lecture mort : vidéo Shopify si fournie, sinon photo + transcription (accessible). |
| Barre « Plus que X € pour la livraison offerte » + une seule suggestion | Augmente le panier moyen sans noyer le client (un choix, pas un catalogue). |
| Garantie « Goût adoré ou remboursé » | Inverse le risque du premier achat. |
| Roue cadeau ouverte au clic sur une notif, jamais en pop-up imposée | La gamification capte l'e-mail sans bloquer la navigation. Chaque tour gagne : les cases « Presque ! » ont un poids 0 (suspense sans déception). Un seul tour par visiteur, code appliqué en un clic via `/discount/CODE`. |
| Pas de carrousel automatique, pas de pop-up d'entrée | Les carrousels sont ignorés et les pop-ups imposées dégradent l'expérience mobile ; la newsletter a sa section et la roue attend qu'on la sollicite. |
| Pas d'allégation santé | Uniquement des allégations nutritionnelles autorisées (« riche en », « sans sucres ajoutés »), conformément au règlement CE 1924/2006. |

## Performance et accessibilité

- Image du hero préchargée en priorité (`fetchpriority="high"`), recadrage dédié mobile, toutes les autres images en lazy-load avec `srcset` et dimensions fixes (pas de décalage de mise en page).
- Polices auto-hébergées (5 fichiers de 16 Ko), `font-display: swap`, les 2 graisses critiques préchargées. Zéro requête vers Google : conforme RGPD.
- CSS et JS en un fichier chacun, JS en `defer`, carte de France en SVG inline.
- `<details>` natifs pour la FAQ, `<dialog>` natif pour la lightbox, onglets ARIA au clavier, focus visibles, lien d'évitement, `prefers-reduced-motion` respecté.
- Données structurées `Product` (avec `AggregateRating` et une `Offer` par format) et `FAQPage`.
- `theme-check` : 0 erreur, 0 avertissement.

## Ce qui est simulé (et comment le passer en production)

- **Abonnement** : c'est une variante à 8,40 €. En production, on branche Shopify Subscriptions (gratuit) ou Recharge ; il suffit d'ajouter le champ `selling_plan` au formulaire produit.
- **Avis** : statiques dans les sections. En production : Judge.me ou Okendo, au même emplacement.
- **Presse** : titres fictifs rendus en typographie, aucun logo réel.
- **Livraison offerte dès 25 €** : à configurer dans Paramètres › Livraison (le seuil du thème est un réglage).
- **Codes promo** (−10 % newsletter, NOEL5, NOEL10, NOEL15, NOEL20, NOELLIVRAISON, NOELSACHET pour la roue) : à créer dans Réductions ; les gains, poids et couleurs de la roue se règlent dans la section *Roue cadeau*.
