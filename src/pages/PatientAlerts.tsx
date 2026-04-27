import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Bell, Info, AlertTriangle, AlertCircle, Clock, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { getToken } from '../services/keycloak';

const api = axios.create({
    baseURL: 'http://localhost:8888', // Gateway
});

const PatientAlerts = () => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAlerts = async () => {
            const patientDbId = localStorage.getItem('patient_db_id');
            if (!patientDbId) {
                setError("Session expirée. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }

            try {
                // Ensure patientDbId is sent as a path variable
                const token = getToken();
                const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
                const response = await api.get(`/api/alerts/patient/${patientDbId}`, config);
                setAlerts(response.data);
            } catch (error) {
                console.error("Error fetching alerts:", error);
                setError("Impossible de charger vos notifications.");
            } finally {
                setLoading(false);
            }
        };

        const fetchStaff = async () => {
            try {
                const token = getToken();
                const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
                const response = await api.get('/api/staff', config);
                setStaff(response.data);
            } catch (error) {
                console.error("Error fetching staff:", error);
            }
        };

        fetchAlerts();
        fetchStaff();
    }, []);

    const getStaffName = (staffId: string) => {
        const s = staff.find(s => s.staffId === staffId);
        return s ? `${s.firstName} ${s.lastName}` : `ID: ${staffId}`;
    };

    const getIcon = (level: string) => {
        switch (level) {
            case 'CRITICAL': return <AlertTriangle size={20} />;
            case 'WARNING': return <AlertCircle size={20} />;
            default: return <Info size={20} />;
        }
    };

    return (
        <DashboardLayout>
            <div className="patient-alerts">
                <header className="page-header">
                    <div>
                        <h1>Mes Notifications</h1>
                        <p>Restez informé des messages importants de votre équipe médicale.</p>
                    </div>
                </header>

                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="spin" size={40} />
                        <p>Chargement des messages...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <AlertCircle size={40} />
                        <p>{error}</p>
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={60} />
                        <p>Vous n'avez aucune notification pour le moment.</p>
                    </div>
                ) : (
                    <div className="alerts-stack">
                        {alerts.map((alert) => (
                            <div key={alert.id} className={`alert-item level-${alert.level.toLowerCase()}`}>
                                <div className="alert-icon">
                                    {getIcon(alert.level)}
                                </div>
                                <div className="alert-content">
                                    <div className="alert-header">
                                        <h2 className="alert-title">{alert.title}</h2>
                                        <div className="alert-time">
                                            <Clock size={14} />
                                            <span>{new Date(alert.timestamp).toLocaleString('fr-FR')}</span>
                                        </div>
                                    </div>
                                    <p className="alert-message">{alert.message}</p>
                                    <div className="alert-footer">
                                        <span className={`level-badge level-${alert.level.toLowerCase()}`}>{alert.level}</span>
                                        <span className="creator-info">Envoyé par: {getStaffName(alert.staffId)}</span>
                                        {alert.read && <span className="read-status"><CheckCircle size={14} /> Vu</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .patient-alerts { max-width: 800px; margin: 0 auto; }
                .page-header { margin-bottom: 2.5rem; }
                .page-header h1 { font-size: 2rem; font-weight: 800; color: var(--foreground); margin-bottom: 0.5rem; }
                .page-header p { color: var(--muted-foreground); font-size: 1.1rem; }

                .alerts-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .alert-item {
                    display: flex;
                    gap: 1.5rem;
                    background: white;
                    padding: 1.5rem;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    border-left-width: 6px;
                    box-shadow: var(--shadow-sm);
                }

                .alert-item.level-info { border-left-color: #3b82f6; }
                .alert-item.level-warning { border-left-color: #f59e0b; }
                .alert-item.level-critical { border-left-color: #ef4444; }

                .alert-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .level-info .alert-icon { background: #eff6ff; color: #3b82f6; }
                .level-warning .alert-icon { background: #fffbeb; color: #f59e0b; }
                .level-critical .alert-icon { background: #fef2f2; color: #ef4444; }

                .alert-content { flex: 1; }

                .alert-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.75rem;
                }

                .alert-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--foreground);
                }

                .alert-time {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    color: var(--muted-foreground);
                    font-size: 0.8rem;
                }

                .alert-message {
                    color: #475569;
                    line-height: 1.6;
                    margin-bottom: 1rem;
                    font-size: 0.95rem;
                }

                .alert-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .level-badge {
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 0.2rem 0.6rem;
                    border-radius: 4px;
                    text-transform: uppercase;
                }

                .level-badge.level-info { background: #eff6ff; color: #3b82f6; }
                .level-badge.level-warning { background: #fffbeb; color: #f59e0b; }
                .level-badge.level-critical { background: #fef2f2; color: #ef4444; }

                 .read-status {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.8rem;
                    color: var(--success);
                    font-weight: 600;
                }

                .creator-info {
                    font-size: 0.8rem;
                    color: var(--muted-foreground);
                    font-style: italic;
                }

                .loading-state, .empty-state, .error-state {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 5rem 2rem; text-align: center; background: white; border-radius: var(--radius-xl);
                    border: 1px dashed var(--border); color: var(--muted-foreground);
                }

                .empty-state svg { color: var(--muted); margin-bottom: 1.5rem; }
                .error-state { color: var(--danger); background: #fef2f2; border-style: solid; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </DashboardLayout>
    );
};

export default PatientAlerts;
