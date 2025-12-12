import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSignalR } from '@/hooks/useSignalR';
import { CryptoTable } from '@/components/dashboard/CryptoTable';
import { MarketStats } from '@/components/dashboard/MarketStats';
import { ArrowUp, Wifi, WifiOff } from 'lucide-react';

export default function DashboardPage() {
  const { prices, isConnected } = useSignalR();
  
  const topGainers = useMemo(() => {
      return [...prices].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 3);
  }, [prices]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Market Dashboard</h1>
            <p className="text-muted-foreground">Real-time cryptocurrency insights.</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isConnected ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="text-sm font-medium">{isConnected ? 'Live Feed Active' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <MarketStats prices={prices} />

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Table */}
        <div className="lg:col-span-3 space-y-6">
            <Card className="border-border">
                <CardHeader>
                    <CardTitle>Top Assets by Market Cap</CardTitle>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                    <CryptoTable prices={prices} />
                </CardContent>
            </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Top Gainers (24h)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {topGainers.length > 0 ? topGainers.map(coin => (
                        <div key={coin.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img src={coin.image} className="h-6 w-6 rounded-full" alt={coin.name} />
                                <div>
                                    <p className="text-sm font-medium">{coin.symbol.toUpperCase()}</p>
                                    <p className="text-xs text-muted-foreground">${coin.current_price.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-green-500 text-sm font-medium">
                                <ArrowUp className="h-3 w-3 mr-1" />
                                {coin.price_change_percentage_24h.toFixed(2)}%
                            </div>
                        </div>
                    )) : (
                        <div className="text-sm text-muted-foreground">Loading...</div>
                    )}
                </CardContent>
            </Card>

            {/* Promo/Mock Ad */}
            <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 border-none text-white">
                <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">Start Simulated Trading</h3>
                    <p className="text-sm text-indigo-100 mb-4">Practice your strategies with $10,000 virtual cash.</p>
                    <a href="/portfolio" className="inline-block bg-white text-indigo-900 px-4 py-2 rounded-md text-sm font-bold hover:bg-indigo-50 transition-colors">
                        Go to Portfolio
                    </a>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
