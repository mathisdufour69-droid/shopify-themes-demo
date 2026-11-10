# AZIMUT · thème Shopify sur mesure

Thème Online Store 2.0 écrit de zéro, sans thème du Theme Store ni app, pour une maison fictive d'expéditions privées. La direction artistique est celle du site vitrine Azimut : crème, encre, orange terre, IBM Plex Mono et grandes photos, Instrument Serif pour les grands titres posés sur les photos, et Archivo en version étendue pour le logo. Elle est reprise telle quelle et adaptée à la vente.

> Azimut est une marque fictive. Boutique de démonstration conçue par Mathis Dufour. Le numéro Atout France affiché est fictif.

## Le problème à résoudre

On ne vend pas un voyage à 6 400 € en un clic, et le vendre comme un t-shirt ne marche pas. Un site vitrine qui n'offre qu'un formulaire de contact laisse pourtant filer les visiteurs décidés. Le thème propose donc **trois portes d'entrée, une par niveau d'engagement** :

| Niveau | Porte | Mécanique Shopify |
|---|---|---|
| Je découvre | « Parler à un concepteur » (appel de 30 min) | `<dialog>` + `{% form 'contact' %}`, champ destination prérempli depuis la fiche |
| Je suis décidé | « Bloquer ma date · acompte » (500 €, remboursable 14 jours) | Produit à variantes Départ × Voyageurs, stock réel par départ |
| J'offre | Carte cadeau 250 / 500 / 1 000 / 2 500 € | Carte cadeau native, envoi programmé au destinataire |

## Installation (10 minutes)

1. **Thème** : Admin › Boutique en ligne › Thèmes › Ajouter un thème › Charger `azimut-theme.zip`, puis Publier.
2. **Produits** : Admin › Produits › Importer › `produits-azimut.csv`. Le fichier contient 7 itinéraires (5 départs × 3 tailles de groupe) et la carte cadeau.
3. **Collection** : créer une collection automatique `voyages` avec la condition « Type de produit = Itinéraire ». Tous les liens « Nos voyages » pointent dessus. Sans elle, ils tombent sur `/collections/all`, et la carte cadeau y est filtrée.
4. **Langue et devise** : français, EUR (Paramètres › Marchés).
5. **Nom de marque** : « Azimut » par défaut (Personnaliser › Paramètres du thème › Identité), indépendant du nom de la boutique Shopify.

Utilise une boutique dédiée : installé sur une boutique sans ces produits, le thème reste propre (aucune erreur Liquid, un message invite à importer le CSV), mais les sections voyages restent vides.

Aucune image n'est à téléverser. Si un produit n'a pas de média, le thème affiche son visuel embarqué (`assets/trip-{handle}-*.webp`). Une vraie photo ajoutée dans l'admin prend le relais.

## Architecture

```
layout/      theme.liquid, password.liquid
sections/    13 sections d'accueil + fiche itinéraire/carte cadeau, avis, garanties,
             tiroir panier, collection, recherche, blog, 404, mot de passe
             header-group.json / footer-group.json
snippets/    trip-data (éditorial par voyage), trip-card, contact-dialog, picture, eur, stars, icon, meta-tags
templates/   JSON partout + gift_card.liquid
assets/      base.css, theme.js (vanilla, defer), 5 polices woff2, visuels WebP
```

- **`snippets/trip-data.liquid`** centralise le contenu de chaque voyage : étapes jour par jour, tracé de la carte, inclus et non inclus, guide, statut des départs. Chaque champ lit d'abord un métachamp `custom.<champ>`, ce qui permet en production d'éditer depuis l'admin sans toucher au code.
- **Tiroir panier via la Section Rendering API** : un seul aller-retour réseau, sans rechargement. Sans JavaScript, tous les formulaires restent natifs.
- **Tout est éditable dans l'éditeur de thème** : textes, chiffres, étapes, garanties, avis (blocs), voyages mis en avant, articles du journal.
- **Zéro dépendance** : pas de jQuery, pas de librairie de carrousel, pas de Google Fonts.

## Choix CRO

| Choix | Pourquoi |
|---|---|
| DA du site vitrine conservée à l'identique | Sur du premium, la confiance passe d'abord par le soin visuel. Le thème ajoute la vente sans casser l'univers. |
| Note « 4,8/5 · 214 avis vérifiés » dès le hero | La preuve sociale arrive avant le premier scroll, là où le doute naît. |
| Section « Du premier appel au départ, quatre étapes » | Un achat à 5 000 € fait peur parce que le processus est opaque. Quatre jalons datés (J-120, 72 h, J-90, J-0) lèvent l'objection « je m'engage à quoi ? ». |
| Acompte de 500 € au lieu du prix total | On ne demande pas 6 400 € en ligne. Un petit engagement remboursable capte l'intention chaude, et le solde suit le circuit habituel de l'agence. |
| Départs avec statut (« Dernières places », « Complet ») | Il s'agit d'une rareté réelle, tirée du stock Shopify de chaque variante, jamais d'un compte à rebours factice. Les dates complètes sont barrées mais restent visibles, ce qui prouve la demande. |
| Prix par personne + total estimé + remise de groupe (−8 %, −12 %) | Le prix se recalcule en direct selon la taille du groupe, et le visiteur voit ce qu'il paie vraiment. |
| « À régler aujourd'hui : 500 € » sur la fiche ET dans le panier | Lever l'ambiguïté du montant débité est le premier levier contre l'abandon au paiement. |
| Lien secondaire « Parler d'abord à un concepteur » sous le bouton d'acompte | Le visiteur pas encore prêt ne sort pas du parcours : il bascule vers l'appel, prérempli avec le voyage. |
| Ligne de route (étapes numérotées) + jour par jour en accordéon | Le visiteur se projette dans l'itinéraire. Le pressé lit les titres, le méfiant déplie chaque jour. |
| Bandeau de 4 garanties portées par un chiffre (14 j, 0 %, 100 %, 24/7) | Ce sont les quatre peurs du voyage sur mesure, levées au même endroit. Un chiffre se lit plus vite qu'une icône et ne fait pas « gabarit ». |
| Avis de six voyageurs différents, dont un 4★ gardé tel quel | L'ancien site citait deux fois la même voyageuse, ce qui n'était pas crédible. Une moyenne parfaite paraît fausse (Spiegel Research Center : la probabilité d'achat culmine entre 4,0 et 4,7). Sur une fiche, seuls les avis de ce voyage s'affichent. |
| Fiche guide sur chaque voyage | Le visiteur achète une personne, pas un catalogue : il voit qui l'accompagne. |
| Carte cadeau mise en avant + envoi programmé | C'est le panier le plus simple du site (aucune date à choisir), et elle capte le trafic « idée cadeau ». |
| Mobile : barre « Dès 6 400 € · Choisir ma date » collante | Dès que le module de réservation sort de l'écran, l'action reste à portée de pouce. |
| Mobile : réservation placée juste après « Le voyage » | Le visiteur décidé n'a pas à scroller tout le jour par jour pour trouver le bouton. |
| Mobile : guides, destinations, journal en carrousel | La page d'accueil est raccourcie d'environ 20 %, et les itinéraires restent empilés car c'est là que se joue la vente. |

## Performance et accessibilité

- Image du hero préchargée, `srcset` et dimensions fixes partout (pas de décalage de mise en page), lazy-load hors premier écran.
- Polices auto-hébergées, `font-display: swap`, les deux critiques préchargées. Zéro requête vers Google, ce qui est conforme au RGPD.
- `<dialog>` natif, accordéons accessibles, puces de choix en vrais `radio`, focus visibles, `prefers-reduced-motion` respecté.
- Données structurées `Product` + `AggregateOffer` + `AggregateRating` sur chaque itinéraire.
- `theme-check` : 0 erreur. Pas de débordement horizontal testé de 340 à 1 440 px.

## En production, ce que je changerais

- **Acompte** : passer les variantes à 500 € à un vrai *Selling Plan* de type acompte (« deposit », solde prélevé automatiquement à J-45), via Shopify Subscriptions ou une app de paiement différé.
- **Disponibilités** : brancher le stock de chaque départ sur l'outil de réservation de l'agence (webhook ou métaobjet), au lieu d'une saisie manuelle.
- **Visuels** : remplacer les trois photos du journal (aujourd'hui des recadrages des photos d'itinéraires).
- **Plus tard** : un quiz « Trouver mon voyage » (budget, période, niveau) et une carte du monde cliquable.
