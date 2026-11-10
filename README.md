# Deux thèmes Shopify sur mesure

Deux boutiques de démonstration, deux thèmes Online Store 2.0 écrits de zéro (aucun thème du Theme Store, aucune app), chacun pensé pour la conversion de son marché.

| Thème | Marché | Démo | Ce qu'il montre |
|---|---|---|---|
| [`sansmode/`](sansmode/) | Bonbons fonctionnels, panier bas, achat d'impulsion | sansmode-demo.myshopify.com · mot de passe `sansmode` | Lot de 3 présélectionné, abonnement sans dark pattern, date de livraison calculée, barre de livraison offerte, roue cadeau à la demande, panier en tiroir (Section Rendering API) |
| [`azimut/`](azimut/) | Voyages privés à 4 000-6 500 €, panier très haut | azimut-demo.myshopify.com · mot de passe `azimut` | Acompte de 500 € par variante Départ × Voyageurs avec stock réel, prix recalculé selon le groupe, appel concepteur prérempli, carte cadeau native avec envoi programmé, visionneuse photo |

Chaque dossier contient le thème complet et un README qui détaille l'installation et chaque choix CRO.

## Points communs

- Liquid OS 2.0 : templates JSON, groupes de sections, blocs, tout est éditable dans l'éditeur de thème.
- Éditorial produit centralisé dans un snippet qui lit d'abord les métachamps `custom.*`.
- JavaScript vanilla en `defer`, aucune dépendance, formulaires natifs fonctionnels sans JS.
- Polices auto-hébergées (zéro requête Google), images WebP en `srcset` avec dimensions fixes.
- `theme-check` : 0 erreur. Testés de 340 à 1 440 px de large, et robustes sur une boutique vide (aucune erreur Liquid si les produits ne sont pas importés).

> SANSMODÉ et Azimut sont des marques fictives. Boutiques de démonstration conçues par Mathis Dufour.
