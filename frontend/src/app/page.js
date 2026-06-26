"use client"; // Indique à Next.js que cette page utilise de l'interactivité

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Simulator() {
  const [loading, setLoading] = useState(true);
  const [monthlyInvestment, setMonthlyInvestment] = useState(100);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({ totalInvested: 0, currentValue: 0, roi: 0 });

  // Récupération des données au chargement de la page
  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('historical_prices')
        .select('*')
        .order('date', { ascending: true }); // On trie du plus ancien au plus récent

      if (error) {
        console.error("Erreur Supabase:", error);
        setLoading(false);
        return;
      }

      calculateDCA(data, monthlyInvestment);
      setLoading(false);
    }
    fetchData();
  }, []); // S'exécute une seule fois au montage

  // Recalcule le graphique si l'utilisateur change le montant
  const handleInvestmentChange = async (e) => {
    const amount = Number(e.target.value);
    setMonthlyInvestment(amount);

    // On relance le calcul avec les données déjà en cache dans la base
    const { data } = await supabase.from('historical_prices').select('*').order('date', { ascending: true });
    if(data) calculateDCA(data, amount);
  };

  // Le coeur du test : La logique mathématique du DCA
  const calculateDCA = (historicalPrices, amountPerMonth) => {
    let totalFiatInvested = 0;
    let totalBtcOwned = 0;
    let currentMonth = "";
    const simulationData = [];

    historicalPrices.forEach((day) => {
      const dayMonth = day.date.substring(0, 7); // Extrait "YYYY-MM"

      // On investit une fois par mois (dès qu'on détecte un nouveau mois dans l'historique)
      if (dayMonth !== currentMonth) {
        totalFiatInvested += amountPerMonth;
        totalBtcOwned += (amountPerMonth / day.price);
        currentMonth = dayMonth;
      }

      // Calcul de la valeur du portefeuille ce jour-là
      const portfolioValue = totalBtcOwned * day.price;

      simulationData.push({
        date: day.date,
        Investi: parseFloat(totalFiatInvested.toFixed(2)),
        Portefeuille: parseFloat(portfolioValue.toFixed(2)),
      });
    });

    setChartData(simulationData);

    // Mise à jour du résumé en haut de page
    if (simulationData.length > 0) {
      const finalState = simulationData[simulationData.length - 1];
      const roi = ((finalState.Portefeuille - finalState.Investi) / finalState.Investi) * 100;

      setSummary({
        totalInvested: finalState.Investi,
        currentValue: finalState.Portefeuille,
        roi: roi.toFixed(2)
      });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-900">Simulateur d'Investissement S'investir</h1>

        {/* Panneau de configuration et Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investissement mensuel (€)
            </label>
            <input
              type="number"
              value={monthlyInvestment}
              onChange={handleInvestmentChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              step="10"
              min="10"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Investi</h3>
            <p className="text-2xl font-bold">{summary.totalInvested} €</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Valeur Actuelle (Bitcoin)</h3>
            <p className={`text-2xl font-bold ${summary.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.currentValue} €
              <span className="text-sm ml-2 font-normal">
                ({summary.roi >= 0 ? '+' : ''}{summary.roi}%)
              </span>
            </p>
          </div>
        </div>

        {/* Graphique Recharts */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">Calcul en cours...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(tick) => tick.substring(5, 10)}
                  minTickGap={30}
                />
                <YAxis unit="€" width={80} />
                <Tooltip
                  formatter={(value) => [`${value} €`]}
                  labelFormatter={(label) => `Date : ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="Investi" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Portefeuille" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </main>
  );
}