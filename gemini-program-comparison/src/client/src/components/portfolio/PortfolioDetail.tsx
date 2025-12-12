import { Portfolio } from '@/services/portfolioService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderForm } from './OrderForm';

interface Props {
  portfolio: Portfolio;
  onRefresh: () => void;
}

export function PortfolioDetail({ portfolio, onRefresh }: Props) {
  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader><CardTitle className="text-sm">Total Value</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">${portfolio.totalValueUsd.toLocaleString()}</div></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-sm">Cash Balance</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">${portfolio.balanceUsd.toLocaleString()}</div></CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle className="text-sm">Holdings Value</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">${(portfolio.totalValueUsd - portfolio.balanceUsd).toLocaleString()}</div></CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Your Positions</CardTitle>
                </CardHeader>
                <CardContent>
                    {portfolio.positions.length === 0 ? (
                        <div className="text-muted-foreground text-sm">No positions yet. Buy some crypto!</div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b text-muted-foreground">
                                        <th className="h-10 text-left font-medium">Asset</th>
                                        <th className="h-10 text-right font-medium">Qty</th>
                                        <th className="h-10 text-right font-medium">Avg Buy</th>
                                        <th className="h-10 text-right font-medium">Current</th>
                                        <th className="h-10 text-right font-medium">P/L</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {portfolio.positions.map((pos) => (
                                        <tr key={pos.assetId} className="border-b">
                                            <td className="p-2 font-medium uppercase">{pos.assetId}</td>
                                            <td className="p-2 text-right">{pos.quantity.toFixed(4)}</td>
                                            <td className="p-2 text-right">${pos.averageBuyPrice.toFixed(2)}</td>
                                            <td className="p-2 text-right">${pos.currentPrice.toFixed(2)}</td>
                                            <td className={`p-2 text-right font-bold ${pos.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {pos.profitLoss >= 0 ? '+' : ''}{pos.profitLossPercentage.toFixed(2)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <div className="md:col-span-1">
                <OrderForm portfolioId={portfolio.id} onOrderComplete={onRefresh} />
            </div>
        </div>
    </div>
  );
}
