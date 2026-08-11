import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Challans from './pages/Challans';
import { apiRequest } from './services/api';
import './index.css';

interface User {
  username: string;
  role: string;
}

interface Customer {
  id: number;
}

interface Product {
  id: number;
  currentStock: number;
}

interface Challan {
  id: number;
}

interface DashboardStats {
  customers: number;
  products: number;
  inventory: number;
  challans: number;
}

type ActivePage =
  | 'dashboard'
  | 'customers'
  | 'products'
  | 'inventory'
  | 'challans';

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const [activePage, setActivePage] =
    useState<ActivePage>('dashboard');

  const [dashboardStats, setDashboardStats] =
    useState<DashboardStats>({
      customers: 0,
      products: 0,
      inventory: 0,
      challans: 0,
    });

  const [dashboardLoading, setDashboardLoading] =
    useState(false);

  const [dashboardError, setDashboardError] =
    useState('');

  useEffect(() => {
    if (!user || activePage !== 'dashboard') {
      return;
    }

    async function loadDashboardStats() {
      setDashboardLoading(true);
      setDashboardError('');

      try {
        const [
          customers,
          products,
          challans,
        ] = await Promise.all([
          apiRequest<Customer[]>('/customers'),
          apiRequest<Product[]>('/products'),
          apiRequest<Challan[]>('/challans'),
        ]);

        const totalInventory = products.reduce(
          (total, product) =>
            total + Number(product.currentStock || 0),
          0,
        );

        setDashboardStats({
          customers: customers.length,
          products: products.length,
          inventory: totalInventory,
          challans: challans.length,
        });
      } catch (error) {
        setDashboardError(
          error instanceof Error
            ? error.message
            : 'Failed to load dashboard data.',
        );
      } finally {
        setDashboardLoading(false);
      }
    }

    loadDashboardStats();
  }, [user, activePage]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
    setActivePage('dashboard');
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const currentUser = user;

  function renderPage() {
    if (activePage === 'customers') {
      return <Customers />;
    }

    if (activePage === 'products') {
      return <Products />;
    }

    if (activePage === 'inventory') {
      return <Inventory />;
    }

    if (activePage === 'challans') {
      return <Challans />;
    }

    return (
      <>
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of your ERP operations</p>
          </div>

          <div className="role-badge">
            {currentUser.role}
          </div>
        </header>

        {dashboardError && (
          <div className="error-message">
            {dashboardError}
          </div>
        )}

        <section className="dashboard-grid">
          <div className="stat-card">
            <span>Customers</span>

            <strong>
              {dashboardLoading
                ? '...'
                : dashboardStats.customers}
            </strong>

            <small>Customer CRM</small>
          </div>

          <div className="stat-card">
            <span>Products</span>

            <strong>
              {dashboardLoading
                ? '...'
                : dashboardStats.products}
            </strong>

            <small>Product catalogue</small>
          </div>

          <div className="stat-card">
            <span>Inventory</span>

            <strong>
              {dashboardLoading
                ? '...'
                : dashboardStats.inventory}
            </strong>

            <small>Total current stock</small>
          </div>

          <div className="stat-card">
            <span>Challans</span>

            <strong>
              {dashboardLoading
                ? '...'
                : dashboardStats.challans}
            </strong>

            <small>Sales challans</small>
          </div>
        </section>

        <section className="welcome-card">
          <div>
            <h2>
              Welcome, {currentUser.username} 👋
            </h2>

            <p>
              Use the navigation menu to manage
              customers, products, inventory and sales
              challans.
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            ERP
          </div>

          <div>
            <strong>Mini ERP</strong>
            <span>Operations Portal</span>
          </div>
        </div>

        <nav>
          <button
            className={`nav-item ${
              activePage === 'dashboard'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setActivePage('dashboard')
            }
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${
              activePage === 'customers'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setActivePage('customers')
            }
          >
            <span>♙</span>
            Customers
          </button>

          <button
            className={`nav-item ${
              activePage === 'products'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setActivePage('products')
            }
          >
            <span>□</span>
            Products
          </button>

          <button
            className={`nav-item ${
              activePage === 'inventory'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setActivePage('inventory')
            }
          >
            <span>◫</span>
            Inventory
          </button>

          <button
            className={`nav-item ${
              activePage === 'challans'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setActivePage('challans')
            }
          >
            <span>▤</span>
            Sales Challans
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="avatar">
              {currentUser.username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {currentUser.username}
              </strong>

              <span>
                {currentUser.role}
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;