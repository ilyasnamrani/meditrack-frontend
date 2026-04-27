import DashboardLayout from '../layouts/DashboardLayout';
import {
    Search,
    Edit2,
    Trash2,
    User,
    Phone,
    Mail,
    X,
    Check,
    Loader2
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getToken } from '../services/keycloak';

const api = axios.create({
    baseURL: 'http://localhost:8888', // Gateway
});

interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    phoneNumber: string;
    registrationNumber: string;
}

const StaffPatients = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const fetchPatients = useCallback(async () => {
        try {
            const response = await api.get('/api/patients', {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setPatients(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching patients", err);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadPatients = async () => {
            try {
                const response = await api.get('/api/patients', {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                if (isMounted) {
                    setPatients(response.data);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error fetching patients", err);
                if (isMounted) setLoading(false);
            }
        };
        loadPatients();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) return;
        try {
            await api.delete(`/api/patients/${id}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setPatients(patients.filter(p => p.id !== id));
        } catch {
            alert("Erreur lors de la suppression");
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPatient) return;
        setStatus('loading');
        try {
            await api.put(`/api/patients/${editingPatient.id}`, editingPatient, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setStatus('success');
            setMessage("Patient mis à jour avec succès !");
            fetchPatients();
            setTimeout(() => {
                setEditingPatient(null);
                setStatus('idle');
            }, 2000);
        } catch {
            setStatus('error');
            setMessage("Erreur lors de la mise à jour.");
        }
    };

    const filteredPatients = patients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="patients-page">
                <header className="page-header">
                    <div>
                        <h1>Gestion des Patients</h1>
                        <p>Consultez, modifiez ou supprimez les dossiers patients.</p>
                    </div>
                </header>

                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou numéro d'enregistrement..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="loader-container"><Loader2 className="spin" /></div>
                ) : (
                    <div className="patients-table-container">
                        <table className="patients-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>ID Enregistrement</th>
                                    <th>Contact</th>
                                    <th>Date de Naissance</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map(patient => (
                                    <tr key={patient.id}>
                                        <td>
                                            <div className="patient-name-cell">
                                                <div className="avatar-small"><User size={16} /></div>
                                                <div>
                                                    <p className="full-name">{patient.firstName} {patient.lastName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="reg-num">{patient.registrationNumber}</span></td>
                                        <td>
                                            <div className="contact-info">
                                                <p><Mail size={14} /> {patient.email}</p>
                                                <p><Phone size={14} /> {patient.phoneNumber}</p>
                                            </div>
                                        </td>
                                        <td>{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="edit-btn" onClick={() => setEditingPatient(patient)}><Edit2 size={18} /></button>
                                                <button className="delete-btn" onClick={() => handleDelete(patient.id)}><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {editingPatient && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Modifier Patient</h2>
                                <button onClick={() => setEditingPatient(null)} className="close-btn"><X size={24} /></button>
                            </div>

                            {status === 'success' ? (
                                <div className="success-message">
                                    <Check size={48} />
                                    <p>{message}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleEditSubmit} className="modal-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Prénom</label>
                                            <input type="text" value={editingPatient.firstName} onChange={(e) => setEditingPatient({ ...editingPatient, firstName: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Nom</label>
                                            <input type="text" value={editingPatient.lastName} onChange={(e) => setEditingPatient({ ...editingPatient, lastName: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" value={editingPatient.email} onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })} required />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Date de Naissance</label>
                                            <input type="date" value={editingPatient.dateOfBirth} onChange={(e) => setEditingPatient({ ...editingPatient, dateOfBirth: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Téléphone</label>
                                            <input type="tel" value={editingPatient.phoneNumber} onChange={(e) => setEditingPatient({ ...editingPatient, phoneNumber: e.target.value })} required />
                                        </div>
                                    </div>
                                    {status === 'error' && <p className="error-text">{message}</p>}
                                    <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                                        {status === 'loading' ? <Loader2 className="spin" size={20} /> : 'Enregistrer les modifications'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .page-header { 
          margin-bottom: 2rem; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
        }
        .page-header h1 { font-size: 1.8rem; font-weight: 700; color: var(--foreground); }
        .page-header p { color: var(--muted-foreground); }
        
        .create-btn {
          background: var(--primary);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s;
        }
        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .search-bar {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .search-bar input {
          border: none;
          width: 100%;
          outline: none;
          font-size: 0.95rem;
        }

        .patients-table-container {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .patients-table { width: 100%; border-collapse: collapse; }
        .patients-table th {
          text-align: left;
          padding: 1rem 1.5rem;
          background: #f8fafc;
          font-size: 0.8rem;
          color: var(--muted-foreground);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
        }

        .patients-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; }

        .patient-name-cell { display: flex; align-items: center; gap: 1rem; }
        .avatar-small {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted-foreground);
        }

        .full-name { font-weight: 600; color: var(--foreground); }
        .reg-num {
          font-family: monospace;
          background: #f1f5f9;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
          color: var(--primary);
        }

        .contact-info p {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--muted-foreground);
        }

        .action-btns { display: flex; gap: 0.75rem; }
        .edit-btn { color: var(--primary); }
        .delete-btn { color: var(--danger); }

        .loader-container { display: flex; justify-content: center; padding: 4rem; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* Modal Styles */
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center; z-index: 1000;
        }
        .modal-content {
          background: white; border-radius: var(--radius-xl); padding: 2.5rem;
          width: 90%; max-width: 550px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .close-btn { color: var(--muted-foreground); }
        .modal-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        .modal-form input {
          padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border);
          background-color: #f8fafc;
        }
        .submit-btn {
          background: var(--primary); color: white; padding: 1rem; border-radius: var(--radius-md);
          font-weight: 700; display: flex; justify-content: center; align-items: center; margin-top: 1rem;
        }
        .success-message { text-align: center; color: var(--success); padding: 2rem 0; }
        .error-text { color: var(--danger); font-size: 0.85rem; text-align: center; }
      `}</style>
        </DashboardLayout>
    );
};

export default StaffPatients;

