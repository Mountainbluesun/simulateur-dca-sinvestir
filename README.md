# DCA Crypto Simulator - S'investir Technical Test

This repository contains the source code for the DCA (Dollar Cost Averaging) Crypto simulator, built as part of a technical test for S'investir. The goal is to deliver an interface faithful to the current design system while keeping the code clean, modular, and easy to integrate.
Here's the live demo link:

https://project-12bry.vercel.app/


## 🛠 Tech Stack & Design Choices
The chosen stack aligns closely with S'investir's internal infrastructure:

* **Frontend (Next.js):** The simulator is built as a standalone component, optimized for Vercel deployment. It can easily be embedded on `simulateurs.sinvestir.fr` or via an iframe.
* **Database / API (Supabase):** A natural choice to integrate directly with your current ecosystem and handle simulation data efficiently.
* **Data processing (Python):** Ingestion script (`ingest_crypto.py`). Python ensures robust handling of financial data and lays the groundwork for future AI agent or automation integrations.

## 🚀 Running the project locally

### 1. Starting the frontend (web interface)
```bash
# Go to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 2. Running the backend (data ingestion)
```bash
# Go to the backend folder
cd backend

# Create and activate the virtual environment
python3 -m venv venv
source venv/bin/activate

# Run the ingestion script
python ingest_crypto.py
```

## 💡 Partner's perspective: suggestions for improvement
After analyzing the target stack, here are a few proposed enhancements:

**Data flow automation:** Connect the tool to an external API (like CoinGecko) via n8n to fetch historical crypto prices in real time, with no manual intervention.

**Personalization via HubSpot:** If a user is recognized, use integrations to automatically pre-fill the simulator with data from their existing wealth analysis.

**Report generation:** Add a PDF export feature or send a summary by email via HubSpot, turning the simulation into a qualified lead-capture tool.

Made by Jérémy Lebrun