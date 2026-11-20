# KËR KHADIM

Librairie en ligne dédiée aux Xassidas et aux ouvrages de Cheikh Ahmadou Bamba.
Les livres affichés proviennent de Supabase; aucun ouvrage de démonstration
n’est ajouté au catalogue.

## Pages publiques

- `/` — accueil, mission et sélection dynamique d’ouvrages.
- `/ouvrages` — catalogue Supabase avec recherche, filtres et ajout au panier.
- `/a-propos` — présentation, vision et engagements de la librairie.
- `/contacter` — formulaire de contact, coordonnées et accès WhatsApp.

Les anciennes URL `/catalogue` redirigent vers `/ouvrages`.

## Démarrage local

1. Installer les dépendances avec `npm install`.
2. Créer `.env.local` à la racine du projet en s’aidant de `.env.example` :

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-anon-key>

   # Coordonnées publiques
   NEXT_PUBLIC_CONTACT_EMAIL=
   NEXT_PUBLIC_CONTACT_PHONE=
   NEXT_PUBLIC_WHATSAPP_NUMBER=
   NEXT_PUBLIC_INSTAGRAM_URL=
   NEXT_PUBLIC_FACEBOOK_URL=
   NEXT_PUBLIC_YOUTUBE_URL=

   # Envoi du formulaire via Resend (serveur uniquement)
   RESEND_API_KEY=
   RESEND_FROM_EMAIL=
   CONTACT_TO_EMAIL=
   ```

   Utiliser uniquement la clé publique Supabase dans le navigateur. Ne jamais
   ajouter une clé `service_role` ou une clé secrète à une variable
   `NEXT_PUBLIC_*`. Les coordonnées et liens des réseaux ci-dessus sont publics
   et ne doivent contenir aucune information secrète. Pour le formulaire,
   configurer une clé Resend et une adresse expéditrice vérifiée. La confirmation
   à l’écran n’apparaît qu’après acceptation du message par Resend. Ne jamais
   préfixer les secrets Resend par `NEXT_PUBLIC_`.

3. Vérifier les tables et politiques déjà présentes avant de déployer la
   migration. Puis exécuter
   `supabase/migrations/20261117000100_storefront_orders.sql` dans le SQL Editor
   du bon projet Supabase. Elle prépare les profils, les commandes, les lignes
   de commande, le bucket `book-covers`, les politiques RLS et la fonction
   transactionnelle `place_order`. Elle remplace les politiques RLS des tables
   concernées : sauvegarder et examiner les politiques existantes avant de
   l’appliquer sur un projet en production.
4. Créer un compte client sur `/inscription`. Pour attribuer le premier rôle
   administrateur, utiliser le SQL Editor Supabase avec l’UUID du compte :

   ```sql
   update public.profiles
   set role = 'admin'
   where id = '<AUTH_USER_UUID>';
   ```

   Cette opération doit rester manuelle et réservée à une personne de confiance;
   le rôle n’est jamais modifiable depuis le formulaire client.
5. Lancer l’application avec `npm run dev`, puis ouvrir
   [http://localhost:3000](http://localhost:3000).

## Fonctionnalités

- Catalogue Supabase avec recherche, filtres par catégorie et pages de détail.
- Navigation et pied de page partagés sur les pages publiques.
- Formulaire de contact avec validation et envoi serveur via Resend.
- Panier conservé dans le navigateur et commandes protégées par authentification.
- Prix et stocks relus et contrôlés atomiquement côté base lors de la commande.
- Espace client avec profil et historique des commandes.
- Administration protégée côté serveur et par RLS : livres, catégories et statuts
  de commande.

Les commandes restent au statut de paiement `unpaid`. Aucun paiement n’est
simulé; Wave et Orange Money ne sont pas encore connectés.

## Vérifications

```bash
npm run lint
npx tsc --noEmit
npm run build
```
