import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LineChart, Wallet, ShoppingBag, ArrowRightLeft, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Market', href: '/market', icon: LineChart },
  { name: 'Compare', href: '/compare', icon: ArrowRightLeft },
  { name: 'Portfolio', href: '/portfolio', icon: Wallet },
  { name: 'Store', href: '/store', icon: ShoppingBag },
  { name: 'Cart', href: '/cart', icon: ShoppingBag },
];

export function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-card border-r border-border">
      <div className="p-6 flex items-center gap-2 border-b border-border/50">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
          CM
        </div>
        <span className="text-xl font-bold tracking-tight">CryptoMarket</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-md bg-secondary/50">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
