import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-container" style={{ maxWidth: 520 }}>
      <Card title="Not found" subtitle="The page you requested does not exist yet.">
        <p>Use the navigation links to reach dashboard, compare, store, cart, login, register, or portfolio.</p>
        <Link to="/">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
