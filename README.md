# Simulateur DCA Crypto - Test Technique S'investir

Ce dépôt contient le code source du simulateur DCA (Dollar Cost Averaging) Crypto, réalisé dans le cadre du test technique pour S'investir. L'objectif est de proposer une interface fidèle au design system actuel tout en assurant un code propre, modulaire et facilement intégrable.
Et voici son lien en démo

https://project-12bry.vercel.app/


## 🛠 Stack Technique & Partis Pris
La stack choisie s'aligne parfaitement avec l'infrastructure interne de S'investir :

* **Frontend (Next.js) :** Le simulateur est conçu comme un composant autonome, optimisé pour un déploiement Vercel. Il est facilement intégrable sur `simulateurs.sinvestir.fr` ou via iframe.
* **Base de données / API (Supabase) :** Choix naturel pour s'intégrer directement à votre écosystème actuel et gérer les données de simulation de manière performante.
* **Traitement des données (Python) :** Script d'ingestion (`ingest_crypto.py`). Python garantit une manipulation robuste des données financières et prépare le terrain pour de futures intégrations d'agents IA ou d'automatisations.

## 🚀 Comment lancer le projet localement

### 1. Lancement du Frontend (Interface Web)
```bash
# Se rendre dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Se rendre dans le dossier backend
cd backend

# Créer et activer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Lancer le script d'ingestion
python ingest_crypto.py

💡 Regard de partenaire : Suggestions d'amélioration
Après avoir analysé la stack cible, voici quelques propositions d'évolution :

Automatisation des flux de données : Connecter l'outil à une API externe (comme CoinGecko) via n8n pour récupérer les cours historiques de la crypto en temps réel, sans intervention manuelle.

Personnalisation via HubSpot : Si un utilisateur est reconnu, utiliser les intégrations pour pré-remplir automatiquement le simulateur avec des données issues de son analyse de patrimoine existante.

Génération de rapports : Ajouter une fonctionnalité d'export PDF ou l'envoi d'un récapitulatif par email via HubSpot pour transformer la simulation en outil de captation de leads qualifiés.

Réalisé par Jérémy Lebrun
