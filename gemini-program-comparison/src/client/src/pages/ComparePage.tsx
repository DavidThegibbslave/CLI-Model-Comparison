import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useSignalR } from '@/hooks/useSignalR';
import { AssetSelector } from '@/components/compare/AssetSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Using SignalR for list of assets, but we might need a specific fetch for history comparison
// For now, we'll reuse the live prices for the selector and fetch specific history on change.

export default function ComparePage() {
  const { prices } = useSignalR(); // Get live list for selector
  const [selectedIds, setSelectedIds] = useState<string[]>(['bitcoin', 'ethereum']);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Limit to top 50 for selector to avoid massive list
  const topAssets = prices.slice(0, 50);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
        setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
        if (selectedIds.length >= 5) return; // Max 5
        setSelectedIds(prev => [...prev, id]);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
        if (selectedIds.length === 0) {
            setChartData([]);
            return;
        }
        
        setLoading(true);
        try {
            // We need to normalize data. 
            // Fetch history for each selected asset.
            // This is a bit heavy on API calls (N requests), ideally backend handles aggregation.
            // The prompt said "Comparison Endpoint: POST /api/crypto/compare". Let's use that if it returns history?
            // Checking BACKEND: The implemented endpoint `/api/crypto/compare` returns CURRENT SNAPSHOTS list, not history.
            // So we must fetch history individually client-side or modify backend.
            // Client-side fetch is acceptable for now.
            
            const historyPromises = selectedIds.map(id => 
                api.get<number[][]>(`/crypto/${id}/history?days=7`).then(res => ({ id, data: res.data }))
            );
            
            const results = await Promise.all(historyPromises);
            
            // Normalize: Find common timestamps? 
            // Simplified: Just take the first one's timestamps and try to match roughly or just map index?
            // Timestamps might slightly differ. Let's map by index assuming equal intervals (CoinGecko usually consistent).
            
            const maxLength = Math.min(...results.map(r => r.data.length));
            const normalizedData = [];
            
            for (let i = 0; i < maxLength; i++) {
                const point: any = {
                    time: new Date(results[0].data[i][0]).toLocaleDateString(),
                };
                results.forEach(r => {
                    // Rebase to 100% for comparison? Or absolute price?
                    // Absolute price is hard to compare BTC ($65k) vs ETH ($3k) on same axis.
                    // Percentage change from start is better.
                    const startPrice = r.data[0][1];
                    const currentPrice = r.data[i][1];
                    point[r.id] = ((currentPrice - startPrice) / startPrice) * 100;
                });
                normalizedData.push(point);
            }
            
            setChartData(normalizedData);

        } catch (e) {
            console.error("Failed to fetch comparison data", e);
        } finally {
            setLoading(false);
        }
    };

    fetchHistory();
  }, [selectedIds]);

  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Compare Assets</h1>
            <p className="text-muted-foreground">Analyze performance relative to each other (7 Day % Change).</p>
        </div>

        <AssetSelector assets={topAssets} selectedIds={selectedIds} onToggle={handleToggle} />

        {selectedIds.length > 0 ? (
            <div className="grid gap-6">
                {/* Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Comparison (7d)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">Loading chart data...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="time" stroke="#888" tick={{fontSize: 12}} minTickGap={30} />
                                    <YAxis stroke="#888" unit="%" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                                        formatter={(val: number) => `${val.toFixed(2)}%`}
                                    />
                                    <Legend />
                                    {selectedIds.map((id, index) => (
                                        <Line 
                                            key={id} 
                                            type="monotone" 
                                            dataKey={id} 
                                            stroke={colors[index % colors.length]} 
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Stats Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedIds.map((id) => {
                        const asset = prices.find(p => p.id === id);
                        if (!asset) return null;
                        return (
                            <Card key={id}>
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <img src={asset.image} className="h-10 w-10 rounded-full" />
                                    <div>
                                        <CardTitle className="text-lg">{asset.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{asset.symbol.toUpperCase()}</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Price</p>
                                        <p className="font-bold">${asset.current_price.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Market Cap</p>
                                        <p className="font-bold">${(asset.market_cap / 1e9).toFixed(2)}B</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">24h Change</p>
                                        <p className={`font-bold ${asset.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {asset.price_change_percentage_24h.toFixed(2)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">High 24h</p>
                                        <p className="font-bold">${asset.high_24h.toLocaleString()}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        ) : (
            <div className="text-center py-20 text-muted-foreground border border-dashed rounded-lg">
                Select assets above to begin comparison.
            </div>
        )}
    </div>
  );
}
