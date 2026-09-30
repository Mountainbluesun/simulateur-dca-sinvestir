"""Fetch daily crypto prices from CoinGecko and store them in Supabase."""

import os
import sys
from datetime import datetime, timezone

import requests
from supabase import Client, create_client

COINGECKO_URL = "https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
TABLE_NAME = "historical_prices"


def get_supabase_client() -> Client:
    """Create a Supabase client from environment variables."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    return create_client(url, key)


def fetch_prices(coin_id: str = "bitcoin", currency: str = "eur", days: int = 365) -> list:
    """Return raw [timestamp_ms, price] pairs from CoinGecko."""
    response = requests.get(
        COINGECKO_URL.format(coin_id=coin_id),
        params={"vs_currency": currency, "days": days, "interval": "daily"},
        headers={"User-Agent": "dca-simulator/1.0"},
        timeout=15,
    )
    response.raise_for_status()  # raises an exception on 4xx/5xx errors
    return response.json().get("prices", [])


def to_records(prices: list) -> list[dict]:
    """Convert raw prices to one record per date (last value wins on duplicates)."""
    by_date = {}
    for timestamp_ms, price in prices:
        date = datetime.fromtimestamp(timestamp_ms / 1000, timezone.utc)
        by_date[date.strftime("%Y-%m-%d")] = price
    return [{"date": d, "price": p} for d, p in by_date.items()]


def main() -> None:
    supabase = get_supabase_client()

    print("Fetching data from CoinGecko...")
    records = to_records(fetch_prices())

    print(f"{len(records)} days of history fetched. Upserting into Supabase...")
    supabase.table(TABLE_NAME).upsert(records, on_conflict="date").execute()
    print("Done.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)  # non-zero exit code so schedulers/CI detect the failure