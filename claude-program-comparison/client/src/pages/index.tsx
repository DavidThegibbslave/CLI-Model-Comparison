export { Dashboard } from './Dashboard';
export { Login } from './Login';
export { Register } from './Register';
export { Store } from './Store';
export { Cart } from './Cart';
export { Compare } from './Compare';
export { Portfolio } from './Portfolio';

// Placeholder exports for other pages

export const Alerts = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold">Price Alerts</h1>
    <p className="text-gray-600 mt-2">Alerts page coming soon</p>
  </div>
);

export const NotFound = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
    <p className="text-gray-600 mt-2">The page you're looking for doesn't exist</p>
  </div>
);
