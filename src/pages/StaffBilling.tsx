import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { CreditCard, Plus, X, Loader2, User, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { getToken } from '../services/keycloak';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8888', // Gateway
});

const StaffBilling = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [bills, setBills] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        patientId: '',
        appointmentId: '',
        amount: '',
        status: 'PENDING',
        dueDate: ''
    });

    useEffect(() => {
        fetchBills();
        fetchPatients();
    }, []);

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

    const fetchBills = async () => {
        try {
            const response = await api.get('/api/billing', {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            setBills(response.data);
        } catch (error) {
            console.error("Error fetching bills:", error);
        } finally {
            setLoading(false);
        }
    };

    const getPatientName = (patientId: number) => {
        const patient = patients.find(p => p.id === patientId);
        return patient ? `${patient.firstName} ${patient.lastName}` : `ID: ${patientId}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            await api.post('/api/billing', {
                patientId: Number(formData.patientId),
                appointmentId: formData.appointmentId ? Number(formData.appointmentId) : null,
                amount: Number(formData.amount),
                status: formData.status,
                dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null
            }, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            setStatus('success');
            setMessage('Facture créée avec succès !');
            fetchBills();
            setTimeout(() => {
                setIsModalOpen(false);
                setStatus('idle');
                setFormData({ patientId: '', appointmentId: '', amount: '', status: 'PENDING', dueDate: '' });
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
                        <h1>Facturation</h1>
                        <p>Gérez les factures et le suivi des paiements.</p>
                    </div>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} /> Nouvelle Facture
                    </button>
                </header>

                {loading ? (
                    <div className="loading-state"><Loader2 className="spin" size={40} /></div>
                ) : (
                    <div className="bills-grid">
                        {bills.length === 0 ? (
                            <div className="empty-state">
                                <CreditCard size={48} />
                                <p>Aucune facture enregistrée.</p>
                            </div>
                        ) : (
                            bills.map((bill: any) => (
                                <div key={bill.id} className="bill-card">
                                    <div className="bill-header">
                                        <span className="bill-id">#{bill.id}</span>
                                        <span className={`bill-status status-${bill.status.toLowerCase()}`}>{bill.status}</span>
                                    </div>
                                    <div className="bill-amount">
                                        {bill.amount} €
                                    </div>
                                    <div className="bill-body">
                                        <div className="bill-row">
                                            <User size={16} />
                                            <span>Patient: {getPatientName(bill.patientId)}</span>
                                        </div>
                                        <div className="bill-row">
                                            <DollarSign size={16} />
                                            <span>Échéance: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A'}</span>
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
                                <h2>Créer une Facture</h2>
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
                                        <label>Patient</label>
                                        <select required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}>
                                            <option value="">Sélectionnez un patient</option>
                                            {patients.map(p => (
                                                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.registrationNumber})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>ID Rendez-vous (Optionnel)</label>
                                        <input type="number" value={formData.appointmentId} onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })} placeholder="Ex: 1" />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Montant (€)</label>
                                            <input type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Échéance</label>
                                            <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Statut</label>
                                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="PENDING">En attente</option>
                                            <option value="PAID">Payée</option>
                                            <option value="OVERDUE">En retard</option>
                                        </select>
                                    </div>

                                    {status === 'error' && <div className="error-message"><AlertCircle size={16} /> {message}</div>}

                                    <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                                        {status === 'loading' ? <Loader2 className="spin" size={20} /> : 'Créer la Facture'}
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
        
        .bills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .bill-card { background: white; border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        
        .bill-header { display: flex; justify-content: space-between; margin-bottom: 1rem; align-items: center; }
        .bill-id { font-family: monospace; font-size: 0.9rem; color: var(--muted-foreground); }
        
        .bill-status { font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 100px; text-transform: uppercase; }
        .status-pending { background: #fef9c3; color: #854d0e; }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-overdue { background: #fee2e2; color: #b91c1c; }

        .bill-amount { font-size: 2rem; font-weight: 800; color: var(--foreground); margin-bottom: 1rem; }

        .bill-body { display: flex; flex-direction: column; gap: 0.5rem; }
        .bill-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--foreground); }
        .bill-row svg { color: var(--muted-foreground); }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 50; }
        .modal-content { background: white; width: 90%; max-width: 500px; padding: 2rem; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-header h2 { font-size: 1.25rem; font-weight: 700; }
        .close-btn { color: var(--muted-foreground); cursor: pointer; }
        
        .modal-form { display: flex; flex-direction: column; gap: 1rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.875rem; font-weight: 500; }
        .form-group input, .form-group select { padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; background: #f8fafc; }
        
        .submit-btn { background: var(--primary); color: white; padding: 0.75rem; border-radius: 8px; font-weight: 700; margin-top: 1rem; }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .success-message { text-align: center; color: var(--success); padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .error-message { background: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }

        @keyframes spin { 100% { transform: rotate(360deg); } }
       `}</style>
        </DashboardLayout>
    );
};

export default StaffBilling;
