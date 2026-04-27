import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Calendar, Plus, X, Loader2, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { getToken } from '../services/keycloak';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8888', // Gateway
});

const StaffPlanning = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        resourceId: '',
        date: '',
        time: '',
        type: 'CONSULTATION', // enum: CONSULTATION, OPERATION, EXAMEN
        status: 'SCHEDULED'
    });

    useEffect(() => {
        const loadInitData = async () => {
            setLoading(true);
            await Promise.all([
                fetchAppointments(),
                fetchPatients(),
                fetchDoctors(),
                fetchResources()
            ]);
            setLoading(false);
        };
        loadInitData();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/api/planning/appointments', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            setAppointments(response.data);
        } catch (error) {
            console.error("Error fetching planning:", error);
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

    const fetchDoctors = async () => {
        try {
            const response = await api.get('/api/staff', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            // Filter to only show staff with DOCTOR role if possible, or just show all
            setDoctors(response.data);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const fetchResources = async () => {
        try {
            const response = await api.get('/api/planning/resources', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            setResources(response.data);
        } catch (error) {
            console.error("Error fetching resources:", error);
        }
    };

    const getPatientName = (id: number) => {
        const p = patients.find(p => p.id === id);
        return p ? `${p.firstName} ${p.lastName}` : `ID: ${id}`;
    };

    const getDoctorName = (id: number) => {
        const d = doctors.find(d => d.id === id);
        return d ? `Dr. ${d.firstName} ${d.lastName}` : `Dr. ID: ${id}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        // Combine date and time
        const startTime = `${formData.date}T${formData.time}:00`;
        // Default appointment duration: 30 minutes
        const start = new Date(startTime);
        const end = new Date(start.getTime() + 30 * 60000);
        const endTime = end.toISOString().split('.')[0];

        try {
            await api.post('/api/planning/appointments', {
                patientId: Number(formData.patientId),
                doctorId: Number(formData.doctorId),
                resourceId: Number(formData.resourceId),
                startTime: startTime,
                endTime: endTime,
                type: formData.type,
                status: formData.status
            }, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            setStatus('success');
            setMessage('Rendez-vous créé avec succès !');
            fetchAppointments(); // Refresh list
            setTimeout(() => {
                setIsModalOpen(false);
                setStatus('idle');
                setFormData({ patientId: '', doctorId: '', resourceId: '', date: '', time: '', type: 'CONSULTATION', status: 'SCHEDULED' });
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
                        <h1>Planning & Rendez-vous</h1>
                        <p>Gérez les emplois du temps et les interventions.</p>
                    </div>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} /> Nouveau Rendez-vous
                    </button>
                </header>

                {loading ? (
                    <div className="loading-state"><Loader2 className="spin" size={40} /></div>
                ) : (
                    <div className="appointments-grid">
                        {appointments.length === 0 ? (
                            <div className="empty-state">
                                <Calendar size={48} />
                                <p>Aucun rendez-vous prévu.</p>
                            </div>
                        ) : (
                            appointments.map((apt: any) => (
                                <div key={apt.id} className="appointment-card">
                                    <div className="apt-header">
                                        <span className={`apt-type type-${apt.type.toLowerCase()}`}>{apt.type}</span>
                                        <span className={`apt-status status-${apt.status.toLowerCase()}`}>{apt.status}</span>
                                    </div>
                                    <div className="apt-body">
                                        <div className="apt-row">
                                            <User size={16} />
                                            <span>Patient: {getPatientName(apt.patientId)}</span>
                                        </div>
                                        <div className="apt-row">
                                            <User size={16} />
                                            <span>Docteur: {getDoctorName(apt.doctorId)}</span>
                                        </div>
                                        <div className="apt-row">
                                            <Clock size={16} />
                                            <span>{new Date(apt.startTime).toLocaleString()}</span>
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
                                <h2>Planifier un Rendez-vous</h2>
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

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Médecin</label>
                                            <select required value={formData.doctorId} onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}>
                                                <option value="">Sélectionnez un médecin</option>
                                                {doctors.map(d => (
                                                    <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName} ({d.role})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Ressource (Salle/Equipement)</label>
                                            <select required value={formData.resourceId} onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}>
                                                <option value="">Sélectionnez une ressource</option>
                                                {resources.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Date</label>
                                            <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Heure</label>
                                            <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Type</label>
                                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                            <option value="CONSULTATION">Consultation</option>
                                            <option value="OPERATION">Opération</option>
                                            <option value="EXAMEN">Examen</option>
                                        </select>
                                    </div>

                                    {status === 'error' && <div className="error-message"><AlertCircle size={16} /> {message}</div>}

                                    <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                                        {status === 'loading' ? <Loader2 className="spin" size={20} /> : 'Confirmer le Rendez-vous'}
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
        
        .appointments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .appointment-card { background: white; border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        
        .apt-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .apt-type, .apt-status { font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 100px; text-transform: uppercase; }
        
        .type-consultation { background: #e0f2fe; color: #0369a1; }
        .type-operation { background: #fee2e2; color: #b91c1c; }
        .type-examen { background: #f3e8ff; color: #7e22ce; }
        
        .status-scheduled { background: #fef9c3; color: #854d0e; }
        .status-completed { background: #dcfce7; color: #166534; }
        .status-cancelled { background: #f3f4f6; color: #374151; }

        .apt-body { display: flex; flex-direction: column; gap: 0.5rem; }
        .apt-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--foreground); }
        .apt-row svg { color: var(--muted-foreground); }

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

export default StaffPlanning;
