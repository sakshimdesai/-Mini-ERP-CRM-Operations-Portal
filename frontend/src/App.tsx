import { useState } from 'react';
import Login from './pages/Login';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Challans from './pages/Challans';
import './index.css';

interface User {
  username: string;
  role: string;
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

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
    setActivePage('dashboard');
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  /*
   * TypeScript does not preserve the null check for `user`
   * inside the nested renderPage function.
   *
   * Since we already returned above when user is null,
   * currentUser is guaranteed to be a valid User here.
   */
  const currentUser = user;

  function renderPage() {
    if (activePage === 'customers') {
      return (
        <>
          <header className="topbar">
            <div>
              <h1>Customers</h1>
              <p>
                Manage your customer relationships
              </p>
            </div>

            <div className="role-badge">
              {currentUser.role}
            </div>
          </header>

          <Customers />
        </>
      );
    }

    if (activePage === 'products') {
      return (
        <>
          <header className="topbar">
            <div>
              <h1>Products</h1>
              <p>
                Manage your product catalogue
              </p>
            </div>

            <div className="role-badge">
              {currentUser.role}
            </div>
          </header>

          <Products />
        </>
      );
    }

    if (activePage === 'inventory') {
      return (
        <>
          <header className="topbar">
            <div>
              <h1>Inventory</h1>
              <p>
                Monitor stock levels and movements
              </p>
            </div>

            <div className="role-badge">
              {currentUser.role}
            </div>
          </header>

          <Inventory />
        </>
      );
    }

    if (activePage === 'challans') {
      return (
        <>
          <header className="topbar">
            <div>
              <h1>Sales Challans</h1>
              <p>
                Create and manage sales challans
              </p>
            </div>

            <div className="role-badge">
              {currentUser.role}
            </div>
          </header>

          <Challans />
        </>
      );
    }

    return (
      <>
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>
              Overview of your ERP operations
            </p>
          </div>

          <div className="role-badge">
            {currentUser.role}
          </div>
        </header>

        <section className="dashboard-grid">
          <div className="stat-card">
            <span>Customers</span>
            <strong>—</strong>
            <small>Customer CRM</small>
          </div>

          <div className="stat-card">
            <span>Products</span>
            <strong>—</strong>
            <small>Product catalogue</small>
          </div>

          <div className="stat-card">
            <span>Inventory</span>
            <strong>—</strong>
            <small>Current stock</small>
          </div>

          <div className="stat-card">
            <span>Challans</span>
            <strong>—</strong>
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