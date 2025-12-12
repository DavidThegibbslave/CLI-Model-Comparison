import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CryptoPrice } from '@/hooks/useSignalR';

interface Props {
    prices: CryptoPrice[];
}

export function MarketStats({ prices }: Props) {
    const totalMarketCap = prices.reduce((acc, curr) => acc + (curr.market_cap || 0), 0);
    const totalVolume = prices.reduce((acc, curr) => acc + (curr.total_volume || 0), 0);
    const btc = prices.find(p => p.symbol === 'btc');
    const btcDominance = btc && totalMarketCap > 0 ? (btc.market_cap / totalMarketCap) * 100 : 0;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Global Market Cap</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${(totalMarketCap / 1e9).toFixed(2)}B</div>
                </CardContent>
            </Card>
            <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">24h Volume</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${(totalVolume / 1e9).toFixed(2)}B</div>
                </CardContent>
            </Card>
            <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">BTC Dominance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">{btcDominance.toFixed(1)}%</div>
                </CardContent>
            </Card>
        </div>
    )
}
