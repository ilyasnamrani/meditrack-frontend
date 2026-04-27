import DashboardLayout from '../layouts/DashboardLayout';
import {
  Users,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Plus,
  X,
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../services/keycloak';

const api = axios.create({
  baseURL: 'http://localhost:8888', // Gateway
});

const StaffDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: ''
  });

  const [appointments, setAppointments] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptRes, alertRes, patientRes, staffRes] = await Promise.all([
          api.get('/api/planning/appointments', { headers: { 'Authorization': `Bearer ${getToken()}` } }),
          api.get('/api/alerts', { headers: { 'Authorization': `Bearer ${getToken()}` } }),
          api.get('/api/patients', { headers: { 'Authorization': `Bearer ${getToken()}` } }),
          api.get('/api/staff', { headers: { 'Authorization': `Bearer ${getToken()}` } })
        ]);
        setAppointments(aptRes.data.slice(0, 5)); // Limit to most recent
        setAlerts(alertRes.data.slice(0, 5));
        setPatients(patientRes.data);
        setDoctors(staffRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getPatientName = (id: number) => {
    const p = patients.find(p => p.id === id);
    return p ? `${p.firstName} ${p.lastName}` : `ID: ${id}`;
  };

  const [doctors, setDoctors] = useState<any[]>([]);

  const getDoctorName = (id: number) => {
    const d = doctors.find(d => d.id === id);
    return d ? `Dr. ${d.firstName} ${d.lastName}` : `Dr. ID: ${id}`;
  };

  const stats = [
    { label: 'Patients Totaux', value: patients.length.toString(), icon: Users, color: '#3b82f6' },
    { label: 'Rendez-vous Aujourd\'hui', value: appointments.length.toString(), icon: Calendar, color: '#10b981' },
    { label: 'Alertes Critiques', value: alerts.filter(a => a.level === 'CRITICAL').length.toString(), icon: AlertTriangle, color: '#ef4444' },
    { label: 'Taux d\'Occupation', value: '88%', icon: TrendingUp, color: '#f59e0b' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await api.post('/api/patients', formData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      setStatus('success');
      setMessage(`Patient créé avec succès ! ID: ${response.data.registrationNumber}`);
      setFormData({ firstName: '', lastName: '', email: '', dateOfBirth: '', phoneNumber: '' });
      setTimeout(() => {
        setIsModalOpen(false);
        setStatus('idle');
      }, 3000);
    } catch (err: unknown) {
      setStatus('error');
      let errMsg = "Erreur lors de la création.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      setMessage(errMsg);
    }
  };

  return (
    <DashboardLayout>
      <div className="staff-dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Tableau de Bord Staff</h1>
            <p>Bienvenue sur votre espace de gestion MediTrack.</p>
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> Nouveau Patient
          </button>
        </header>

        <section className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div className="stat-info">
                <h3>{stat.label}</h3>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="dashboard-content-grid">
          <div className="data-card main-table">
            <div className="card-header">
              <h2>Prochains Rendez-vous</h2>
              <button className="btn-text">Tout voir</button>
            </div>
            {loading ? (
              <div className="loading-state"><Loader2 className="spin" /></div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Docteur</th>
                    <th>Heure</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr><td colSpan={5}>Aucun rendez-vous prévu</td></tr>
                  ) : (
                    appointments.map(apt => (
                      <tr key={apt.id}>
                        <td>{getPatientName(apt.patientId)}</td>
                        <td>{getDoctorName(apt.doctorId)}</td>
                        <td>{new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>{apt.type}</td>
                        <td><span className={`badge badge-${apt.status === 'SCHEDULED' ? 'warning' : 'success'}`}>{apt.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="data-card alerts-panel">
            <div className="card-header">
              <h2>Alertes Récentes</h2>
            </div>
            <div className="alert-list">
              {loading ? (
                <div className="loading-state"><Loader2 className="spin" /></div>
              ) : alerts.length === 0 ? (
                <p>Aucune alerte récente</p>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className={`alert-item ${alert.level.toLowerCase()}`}>
                    <div className="alert-dot"></div>
                    <div className="alert-info">
                      <p className="alert-msg">{alert.message}</p>
                      <span className="alert-patient" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {getPatientName(alert.patientId)}
                      </span>
                      <br />
                      <span className="alert-time">
                        {new Date(alert.timestamp || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Nouveau Patient</h2>
                <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={24} /></button>
              </div>

              {status === 'success' ? (
                <div className="success-message">
                  <CheckCircle size={48} />
                  <p>{message}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Prénom</label>
                      <div className="input-wrapper">
                        <User size={18} />
                        <input type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Nom</label>
                      <div className="input-wrapper">
                        <User size={18} />
                        <input type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <div className="input-wrapper">
                      <Mail size={18} />
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date de Naissance</label>
                      <div className="input-wrapper">
                        <CalendarIcon size={18} />
                        <input type="date" required value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Téléphone</label>
                      <div className="input-wrapper">
                        <Phone size={18} />
                        <input type="tel" required value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {status === 'error' && <p className="error-text">{message}</p>}

                  <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                    {status === 'loading' ? <Loader2 className="spin" size={20} /> : 'Créer le dossier'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-header {
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-primary {
          background-color: var(--primary);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 102, 255, 0.2);
          transition: transform 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          background-color: var(--primary-hover);
        }

        .dashboard-header h1 {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--foreground);
        }

        .dashboard-header p {
          color: var(--muted-foreground);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: var(--shadow-sm);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-md);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .stat-info h3 {
          font-size: 0.85rem;
          color: var(--muted-foreground);
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
        }

        .dashboard-content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        .data-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .card-header h2 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .btn-text {
          color: var(--primary);
          font-weight: 600;
          font-size: 0.85rem;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          font-size: 0.8rem;
          color: var(--muted-foreground);
          font-weight: 500;
          text-transform: uppercase;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        td {
          padding: 1rem 0;
          font-size: 0.9rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-success { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef9c3; color: #854d0e; }

        .alert-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .alert-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          background: #f8fafc;
        }

        .alert-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 6px;
        }

        .critical .alert-dot { background: var(--danger); }
        .warning .alert-dot { background: var(--warning); }
        .info .alert-dot { background: var(--primary); }

        .alert-msg { font-size: 0.9rem; font-weight: 500; }
        .alert-time { font-size: 0.75rem; color: var(--muted-foreground); }

        @media (max-width: 1024px) {
          .dashboard-content-grid { grid-template-columns: 1fr; }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          width: 90%;
          max-width: 550px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          color: var(--foreground);
        }

        .close-btn {
          color: var(--muted-foreground);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper svg {
          position: absolute;
          left: 1rem;
          color: var(--muted-foreground);
        }

        .input-wrapper input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.8rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background-color: #f8fafc;
        }

        .submit-btn {
          background: var(--primary);
          color: white;
          padding: 1rem;
          border-radius: var(--radius-md);
          font-weight: 700;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 1rem;
        }

        .error-text { color: var(--danger); font-size: 0.85rem; text-align: center; }
        .success-message { text-align: center; color: var(--success); padding: 2rem 0; }
        .spin { animation: spin 1s linear infinite; }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading-state {
          display: flex;
          justify-content: center;
          padding: 2rem;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default StaffDashboard;
