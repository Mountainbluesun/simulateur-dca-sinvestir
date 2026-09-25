import os
import requests
from supabase import create_client, Client
from datetime import datetime, timezone

# 1. Supabase configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ttqbfkbxnidwcwpfzxxt.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    raise ValueError("Supabase key not found in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_and_store_data():
    print("Fetching data from CoinGecko...")
    url = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=eur&days=365&interval=daily"

    # Add a User-Agent to mimic a real browser and avoid anti-bot blocking
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    response = requests.get(url, headers=headers)

    # Show the exact error code if it still fails
    if response.status_code != 200:
        print(f"Connection failed. API error code: {response.status_code}")
        print(f"Rejection detail: {response.text}")
        return

    data = response.json()
    prices = data.get("prices", [])

    records = []
    for item in prices:
        timestamp_ms = item[0]
        price_eur = item[1]

        # Convert the timestamp to a date
        date_obj = datetime.fromtimestamp(timestamp_ms / 1000, timezone.utc)
        date_str = date_obj.strftime('%Y-%m-%d')

        records.append({
            "date": date_str,
            "price": price_eur
        })

    print(f"{len(records)} days of history fetched. Inserting into Supabase...")

    # Bulk insert
    try:
        supabase.table("historical_prices").insert(records).execute()
        print("Success! The database is ready.")
    except Exception as e:
        print(f"Error inserting into Supabase: {e}")


if __name__ == "__main__":
    fetch_and_store_data()