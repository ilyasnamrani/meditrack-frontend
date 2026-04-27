import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Bell, Plus, X, Loader2, User, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { getToken } from '../services/keycloak';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8888', // Gateway
});

const StaffAlerts = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [alerts, setAlerts] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        patientId: '',
        title: 'Alerte Médicale',
        message: '',
        level: 'INFO' // CRITICAL, WARNING, INFO
    });

    useEffect(() => {
        fetchAlerts();
        fetchPatients();
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await api.get('/api/staff', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            setStaff(response.data);
        } catch (error) {
            console.error("Error fetching staff:", error);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await api.get('/api/patients', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            setPatients(response.data);
        } catch (error) {
            console.error("Error fetching patients:", error);
        }
    };

    const fetchAlerts = async () => {
        try {
            const response = await api.get('/api/alerts', {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            setAlerts(response.data);
        } catch (error) {
            console.error("Error fetching alerts:", error);
        } finally {
            setLoading(false);
        }
    };

    const getPatientName = (id: number) => {
        const p = patients.find(p => p.id === id);
        return p ? `${p.firstName} ${p.lastName}` : `ID: ${id}`;
    };

    const getStaffName = (staffId: string) => {
        const s = staff.find(s => s.staffId === staffId);
        return s ? `${s.firstName} ${s.lastName}` : `ID: ${staffId}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            await api.post('/api/alerts', {
                patientId: Number(formData.patientId),
                title: formData.title,
                message: formData.message,
                level: formData.level
            }, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            setStatus('success');
            setMessage('Alerte créée avec succès !');
            fetchAlerts();
            setTimeout(() => {
                setIsModalOpen(false);
                setStatus('idle');
                setFormData({ patientId: '', title: 'Alerte Médicale', message: '', level: 'INFO' });
            }, 2000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || "Erreur lors de la création.");
        }
    };

    return (
        <DashboardLayout>
            <div className="page-container">
                <header className="page-header">
                    <div>
                        <h1>Alertes & Notifications</h1>
                        <p>Suivi des alertes patients et urgences.</p>
                    </div>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} /> Nouvelle Alerte
                    </button>
                </header>

                {loading ? (
                    <div className="loading-state"><Loader2 className="spin" size={40} /></div>
                ) : (
                    <div className="alerts-grid">
                        {alerts.length === 0 ? (
                            <div className="empty-state">
                                <Bell size={48} />
                                <p>Aucune alerte active.</p>
                            </div>
                        ) : (
                            alerts.map((alert: any) => (
                                <div key={alert.id} className={`alert-card level-${alert.level.toLowerCase()}`}>
                                    <div className="alert-header">
                                        <div className="alert-icon-wrapper">
                                            {alert.level === 'CRITICAL' && <AlertTriangle size={24} />}
                                            {alert.level === 'WARNING' && <AlertTriangle size={24} />}
                                            {alert.level === 'INFO' && <Info size={24} />}
                                            <span className="alert-level">{alert.level}</span>
                                        </div>
                                        <span className="alert-time">{new Date(alert.timestamp || Date.now()).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="alert-message">{alert.message}</p>
                                    <div className="alert-footer">
                                        <div className="alert-row-group">
                                            <div className="alert-row">
                                                <User size={16} />
                                                <span>Patient: {getPatientName(alert.patientId)}</span>
                                            </div>
                                            <div className="alert-row">
                                                <User size={16} />
                                                <span>Par: {getStaffName(alert.staffId)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Créer une Alerte</h2>
                                <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={24} /></button>
                            </div>

                            {status === 'success' ? (
                                <div className="success-message">
                                    <CheckCircle size={48} />
                                    <p>{message}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="modal-form">
                                    <div className="form-group">
                                        <label>Patient / Utilisateur</label>
                                        <select required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}>
                                            <option value="">Sélectionnez un patient</option>
                                            {patients.map(p => (
                                                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.registrationNumber})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Titre</label>
                                        <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Alerte Rythme Cardiaque" />
                                    </div>

                                    <div className="form-group">
                                        <label>Niveau</label>
                                        <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}>
                                            <option value="INFO">Info</option>
                                            <option value="WARNING">Avertissement</option>
                                            <option value="CRITICAL">Critique</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Message</label>
                                        <textarea required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3} />
                                    </div>

                                    {status === 'error' && <div className="error-message"><AlertTriangle size={16} /> {message}</div>}

                                    <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                                        {status === 'loading' ? <Loader2 className="spin" size={20} /> : 'Envoyer l\'Alerte'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .page-container { padding: 1rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .page-header h1 { font-size: 1.8rem; font-weight: 700; color: var(--foreground); }
        .page-header p { color: var(--muted-foreground); }
        
        .btn-primary { background: var(--primary); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

        .loading-state, .empty-state { padding: 4rem; text-align: center; color: var(--muted-foreground); display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .spin { animation: spin 1s linear infinite; }
        
        .alerts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
        
        .alert-card { background: white; border-left: 4px solid; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        
        .level-critical { border-left-color: #ef4444; background: #fef2f2; }
        .level-critical .alert-header { color: #b91c1c; }
        
        .level-warning { border-left-color: #f59e0b; background: #fffbeb; }
        .level-warning .alert-header { color: #92400e; }
        
        .level-info { border-left-color: #3b82f6; background: #eff6ff; }
        .level-info .alert-header { color: #1e40af; }

        .alert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .alert-icon-wrapper { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; }
        .alert-time { font-size: 0.8rem; opacity: 0.7; }

        .alert-message { font-size: 1rem; color: var(--foreground); margin-bottom: 1rem; line-height: 1.5; }

        .alert-footer { display: flex; align-items: center; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 0.75rem; }
        .alert-row-group { display: flex; flex-direction: column; gap: 0.25rem; }
        .alert-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; opacity: 0.8; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 50; }
        .modal-content { background: white; width: 90%; max-width: 500px; padding: 2rem; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-header h2 { font-size: 1.25rem; font-weight: 700; }
        .close-btn { color: var(--muted-foreground); cursor: pointer; }
        
        .modal-form { display: flex; flex-direction: column; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.875rem; font-weight: 500; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; background: #f8fafc; resize: vertical; }
        
        .submit-btn { background: var(--primary); color: white; padding: 0.75rem; border-radius: 8px; font-weight: 700; margin-top: 1rem; }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .success-message { text-align: center; color: var(--success); padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .error-message { background: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }

        @keyframes spin { 100% { transform: rotate(360deg); } }
       `}</style>
        </DashboardLayout>
    );
};

export default StaffAlerts;
