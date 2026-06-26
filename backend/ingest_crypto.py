import os
import requests
from supabase import create_client, Client
from datetime import datetime, timezone

# 1. Configuration Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ttqbfkbxnidwcwpfzxxt.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    raise ValueError("La clé Supabase est introuvable dans les variables d'environnement.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_and_store_data():
    print("Recuperation des donnees depuis CoinGecko...")
    url = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=eur&days=365&interval=daily"

    # On ajoute un User-Agent pour simuler un vrai navigateur et eviter le blocage anti-bot
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    response = requests.get(url, headers=headers)

    # On affiche le code d'erreur exact si ca echoue encore
    if response.status_code != 200:
        print(f"Echec de la connexion. Code d'erreur API : {response.status_code}")
        print(f"Detail du refus : {response.text}")
        return

    data = response.json()
    prices = data.get("prices", [])

    records = []
    for item in prices:
        timestamp_ms = item[0]
        price_eur = item[1]

        # Conversion du timestamp en date
        date_obj = datetime.fromtimestamp(timestamp_ms / 1000, timezone.utc)
        date_str = date_obj.strftime('%Y-%m-%d')

        records.append({
            "date": date_str,
            "price": price_eur
        })

    print(f"{len(records)} jours d'historique recuperes. Insertion dans Supabase...")

    # Insertion massive
    try:
        supabase.table("historical_prices").insert(records).execute()
        print("Succes ! La base de donnees est prete.")
    except Exception as e:
        print(f"Erreur lors de l'insertion dans Supabase : {e}")


if __name__ == "__main__":
    fetch_and_store_data()