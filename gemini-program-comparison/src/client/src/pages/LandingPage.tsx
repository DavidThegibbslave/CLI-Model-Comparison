import { Link } from 'react-router-dom';
import { ArrowRight, LogIn } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground flex items-center justify-center px-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            CryptoMarket Demo
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Real-time crypto dashboard, store, and portfolio simulator
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse the live demo instantly, or head to the login page if you want to use credentials. No account is required to explore.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            Enter the App
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border text-foreground hover:bg-border/30 transition-colors"
          >
            Go to Login
            <LogIn className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
