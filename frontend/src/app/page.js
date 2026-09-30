"use client"; // Required by Next.js: this page uses client-side state and effects

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const formatEur = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

/**
 * Pure DCA calculation: invests a fixed amount on the first available
 * day of each month and tracks the portfolio value day by day.
 */
function calculateDCA(prices, amountPerMonth) {
  let totalInvested = 0;
  let btcOwned = 0;
  let currentMonth = "";
  const series = [];

  for (const day of prices) {
    const month = day.date.substring(0, 7); // "YYYY-MM"

    if (month !== currentMonth) {
      totalInvested += amountPerMonth;
      btcOwned += amountPerMonth / day.price;
      currentMonth = month;
    }

    series.push({
      date: day.date,
      Invested: Number(totalInvested.toFixed(2)),
      Portfolio: Number((btcOwned * day.price).toFixed(2)),
    });
  }
  return series;
}

export default function Simulator() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyInvestment, setMonthlyInvestment] = useState(100);

  // Fetch prices once, when the page loads
  useEffect(() => {
    async function fetchPrices() {
      const { data, error } = await supabase
        .from("historical_prices")
        .select("date, price")
        .order("date", { ascending: true }); // oldest to most recent

      if (error) {
        console.error("Supabase error:", error);
        setError("Could not load price data. Please try again later.");
      } else {
        setPrices(data);
      }
      setLoading(false);
    }
    fetchPrices();
  }, []);

  // Recomputed locally whenever prices or the amount change (no extra request)
  const chartData = useMemo(
    () => calculateDCA(prices, monthlyInvestment),
    [prices, monthlyInvestment]
  );

  const summary = useMemo(() => {
    const last = chartData[chartData.length - 1];
    if (!last || last.Invested === 0) {
      return { totalInvested: 0, currentValue: 0, roi: 0 };
    }
    return {
      totalInvested: last.Invested,
      currentValue: last.Portfolio,
      roi: ((last.Portfolio - last.Invested) / last.Invested) * 100,
    };
  }, [chartData]);

  const handleInvestmentChange = (e) => {
    const amount = Number(e.target.value);
    setMonthlyInvestment(Number.isFinite(amount) && amount >= 0 ? amount : 0);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-900">Bitcoin DCA Simulator</h1>

        {/* Configuration panel and summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <label htmlFor="monthly" className="block text-sm font-medium text-gray-700 mb-2">
              Monthly investment (€)
            </label>
            <input
              id="monthly"
              type="number"
              value={monthlyInvestment}
              onChange={handleInvestmentChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              step="10"
              min="10"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Invested</h3>
            <p className="text-2xl font-bold">{formatEur.format(summary.totalInvested)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Current Value (Bitcoin)</h3>
            <p className={`text-2xl font-bold ${summary.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatEur.format(summary.currentValue)}
              <span className="text-sm ml-2 font-normal">
                ({summary.roi >= 0 ? "+" : ""}{summary.roi.toFixed(2)}%)
              </span>
            </p>
          </div>
        </div>

        {/* Recharts chart */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">Calculating...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-600">{error}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(tick) => tick.substring(0, 7)} // "YYYY-MM"
                  minTickGap={30}
                />
                <YAxis unit="€" width={80} />
                <Tooltip
                  formatter={(value) => [formatEur.format(value)]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="Invested" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Portfolio" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <p className="mt-6 text-sm text-gray-500">
          For educational purposes only. Past performance does not guarantee future results.
          Cryptocurrencies are highly volatile assets.
        </p>
      </div>
    </main>
  );
}