import React, { useEffect, useState } from 'react';
import { portfolioService, Portfolio } from '@/services/portfolioService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PortfolioDetail } from '@/components/portfolio/PortfolioDetail';
import { Card, CardContent } from '@/components/ui/card';

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPortfolioName, setNewPortfolioName] = useState('');

  const fetchPortfolios = async () => {
    try {
        const data = await portfolioService.getAll();
        setPortfolios(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioName) return;
    await portfolioService.create(newPortfolioName);
    setNewPortfolioName('');
    fetchPortfolios();
  };

  if (loading) return <div>Loading portfolios...</div>;

  if (portfolios.length === 0) {
    return (
        <div className="max-w-md mx-auto mt-10 space-y-6">
            <h1 className="text-2xl font-bold text-center">Create your first Portfolio</h1>
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <Input 
                            placeholder="Portfolio Name (e.g. Main Fund)" 
                            value={newPortfolioName}
                            onChange={e => setNewPortfolioName(e.target.value)}
                        />
                        <Button type="submit" className="w-full">Get Started</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
  }

  // Simple view: Just show the first portfolio for now
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">{portfolios[0].name}</h1>
            <Button variant="outline" onClick={fetchPortfolios}>Refresh</Button>
        </div>
        
        <PortfolioDetail portfolio={portfolios[0]} onRefresh={fetchPortfolios} />
    </div>
  );
}
