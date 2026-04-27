import React from 'react';
import { motion } from 'framer-motion';
import {
  LogOut,
  Menu,
  X,
  Activity,
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  CreditCard,
  User
} from 'lucide-react';
import { doLogout, getUsername, isStaff } from '../services/keycloak';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const username = getUsername();
  const staff = isStaff();

  const menuItems = staff
    ? [
      { icon: LayoutDashboard, label: 'Tableau de bord', path: '/staff' },
      { icon: Users, label: 'Patients', path: '/staff/patients' },
      { icon: Calendar, label: 'Planning', path: '/staff/planning' },
      { icon: Bell, label: 'Alertes', path: '/staff/alerts' },
      { icon: CreditCard, label: 'Facturation', path: '/staff/billing' },
    ]
    : [
      { icon: LayoutDashboard, label: 'Mon Espace', path: '/patient' },
      { icon: Calendar, label: 'Mes Rendez-vous', path: '/patient/appointments' },
      { icon: Activity, label: 'Santé', path: '/patient/health' },
      { icon: Bell, label: 'Notifications', path: '/patient/alerts' },
      { icon: CreditCard, label: 'Facturation', path: '/patient/billing' },
    ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Activity className="logo-icon" size={24} />
          {isSidebarOpen && <span>MediTrack</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="toggle-btn">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => doLogout()} className="nav-item logout-btn">
            <LogOut size={20} />
            {isSidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-placeholder">
            {/* Can add search bar here */}
          </div>
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{username}</span>
              <span className="user-role">{staff ? 'Staff Médical' : 'Patient'}</span>
            </div>
            <div className="avatar">
              <User size={20} />
            </div>
          </div>
        </header>

        <section className="content-area">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </section>
      </main>

      <style>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background-color: #f8fafc;
        }

        /* Sidebar Styles */
        .sidebar {
          background-color: white;
          border-right: 1px solid var(--border);
          transition: width 0.3s ease;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        .sidebar.open { width: 260px; }
        .sidebar.closed { width: 80px; }

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-weight: 700;
          color: var(--primary);
          border-bottom: 1px solid var(--border);
        }

        .toggle-btn {
          margin-left: auto;
          color: var(--muted-foreground);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          color: var(--muted-foreground);
          font-weight: 500;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background-color: var(--muted);
          color: var(--primary);
        }

        .nav-item.active {
          background-color: var(--secondary);
          color: var(--primary);
        }

        .sidebar-footer {
          padding: 1.5rem 0.75rem;
          border-top: 1px solid var(--border);
        }

        .logout-btn:hover {
          background-color: #fff1f2;
          color: var(--danger);
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow-y: auto;
        }

        .top-bar {
          height: 70px;
          background-color: white;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          text-align: right;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--muted);
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--muted-foreground);
          border: 1px solid var(--border);
        }

        .content-area {
          padding: 2rem;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
