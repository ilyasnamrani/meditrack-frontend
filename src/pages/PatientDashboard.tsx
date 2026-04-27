import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Calendar, Bell, Activity, CreditCard, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../services/keycloak';

const api = axios.create({
  baseURL: 'http://localhost:8888',
});

const PatientDashboard = () => {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      const regId = localStorage.getItem('patient_id');
      if (!regId) return;

      try {
        const token = getToken();
        const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
        const response = await api.get(`/api/patients/search?registrationNumber=${regId}`, config);
        setPatient(response.data);
      } catch (error) {
        console.error("Error fetching patient info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-container">
          <Loader2 className="spin" size={48} />
          <p>Chargement de votre dossier...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="patient-dashboard">
        <header className="dashboard-header">
          <h1>Bonjour, {patient?.firstName || 'Patient'} {patient?.lastName || ''}</h1>
          <p>Bienvenue dans votre Espace Santé MediTrack.</p>
        </header>

        <section className="dashboard-grid">
          <div className="card next-appointment-card">
            <div className="card-inner">
              <div className="icon-box">
                <Calendar size={32} />
              </div>
              <div className="appointment-info">
                <h3>Dossier Médical</h3>
                <p className="primary-text">ID: {patient?.registrationNumber}</p>
                <p className="secondary-text">{patient?.email || 'Pas d\'email renseigné'}</p>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <motion.div whileHover={{ scale: 1.02 }} className="action-card" onClick={() => navigate('/patient/appointments')}>
              <Calendar size={24} />
              <span>Rendez-vous</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="action-card" onClick={() => navigate('/patient/health')}>
              <Activity size={24} />
              <span>Dossier Santé</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="action-card" onClick={() => navigate('/patient/billing')}>
              <CreditCard size={24} />
              <span>Facturation</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="action-card" onClick={() => navigate('/patient/alerts')}>
              <Bell size={24} />
              <span>Notifications</span>
            </motion.div>
          </div>

          <div className="details-section">
            <div className="data-card">
              <h2>Mes informations</h2>
              <div className="info-list">
                <div className="info-item">
                  <strong>Nom:</strong> {patient?.lastName}
                </div>
                <div className="info-item">
                  <strong>Prénom:</strong> {patient?.firstName}
                </div>
                <div className="info-item">
                  <strong>Né(e) le:</strong> {patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Non spécifié'}
                </div>
                <div className="info-item">
                  <strong>Téléphone:</strong> {patient?.phoneNumber || 'Non spécifié'}
                </div>
              </div>
            </div>

            <div className="notifications-panel">
              <div className="data-card">
                <h2>Notifications & Alertes</h2>
                <div className="notification-list">
                  <div className="notif-item">
                    <Bell size={18} className="notif-icon" />
                    <p>Bienvenue sur votre nouvel espace patient personnalisé.</p>
                  </div>
                  {patient?.medicalRecords?.length > 0 && (
                    <div className="notif-item">
                      <Activity size={18} className="notif-icon" />
                      <p>Vous avez {patient.medicalRecords.length} records médicaux disponibles.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .patient-dashboard { max-width: 1200px; margin: 0 auto; }
        .dashboard-header { margin-bottom: 2.5rem; text-align: center; }
        .dashboard-header h1 { font-size: 2.2rem; margin-bottom: 0.5rem; color: var(--foreground); }
        .dashboard-grid { display: flex; flex-direction: column; gap: 2rem; }
        .next-appointment-card { background: linear-gradient(135deg, var(--primary), #0052cc); color: white; padding: 2.5rem; border-radius: var(--radius-xl); }
        .card-inner { display: flex; align-items: center; gap: 2rem; }
        .icon-box { background: rgba(255, 255, 255, 0.2); padding: 1.5rem; border-radius: var(--radius-lg); backdrop-filter: blur(10px); }
        .appointment-info { flex: 1; }
        .primary-text { font-size: 1.8rem; font-weight: 700; margin-bottom: 0.25rem; }
        .secondary-text { font-size: 1.1rem; opacity: 0.9; }
        .quick-actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; }
        .action-card { background: white; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: var(--primary); cursor: pointer; }
        .action-card span { color: var(--foreground); font-weight: 600; }
        .details-section { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .data-card { background: white; padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border); height: 100%; }
        .info-list { display: flex; flex-direction: column; gap: 1rem; }
        .info-item { font-size: 1rem; color: var(--foreground); border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; }
        .info-item strong { color: var(--muted-foreground); margin-right: 0.5rem; width: 100px; display: inline-block; }
        .notif-item { display: flex; gap: 0.75rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
        .notif-icon { color: var(--primary); flex-shrink: 0; }
        .notif-item p { font-size: 0.9rem; color: var(--muted-foreground); }
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; gap: 1rem; color: var(--muted-foreground); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .details-section { grid-template-columns: 1fr; } .quick-actions { grid-template-columns: 1fr; } }
      `}</style>
    </DashboardLayout>
  );
};

export default PatientDashboard;
