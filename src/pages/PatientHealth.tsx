import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Activity, Clipboard, User, Calendar, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getToken } from '../services/keycloak';

const api = axios.create({
    baseURL: 'http://localhost:8888', // Gateway
});

const PatientHealth = () => {
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHealthData = async () => {
            const regId = localStorage.getItem('patient_id');
            if (!regId) {
                setError("Session expirée. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }

            try {
                const token = getToken();
                const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
                const response = await api.get(`/api/patients/search?registrationNumber=${regId}`, config);
                setPatient(response.data);
            } catch (err) {
                console.error("Error fetching health data:", err);
                setError("Impossible de charger votre dossier médical.");
            } finally {
                setLoading(false);
            }
        };

        fetchHealthData();
    }, []);

    return (
        <DashboardLayout>
            <div className="patient-health">
                <header className="page-header">
                    <div>
                        <h1>Mon Dossier Médical</h1>
                        <p>Consultez vos antécédents, diagnostics et notes médicales.</p>
                    </div>
                </header>

                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="spin" size={40} />
                        <p>Chargement de votre dossier...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <AlertCircle size={40} />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="health-grid">
                        <section className="patient-info-card">
                            <div className="card-header">
                                <User size={20} />
                                <h2>Informations Générales</h2>
                            </div>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Nom complet</label>
                                    <p>{patient.firstName} {patient.lastName}</p>
                                </div>
                                <div className="info-item">
                                    <label>N° Enregistrement</label>
                                    <p className="reg-badge">{patient.registrationNumber}</p>
                                </div>
                                <div className="info-item">
                                    <label>Date de Naissance</label>
                                    <p>{new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div className="info-item">
                                    <label>Contact</label>
                                    <p>{patient.phoneNumber}</p>
                                </div>
                            </div>
                        </section>

                        <section className="records-section">
                            <div className="section-header">
                                <Clipboard size={20} />
                                <h2>Historique Médical</h2>
                            </div>

                            {(!patient.medicalRecords || patient.medicalRecords.length === 0) ? (
                                <div className="empty-records">
                                    <Activity size={48} />
                                    <p>Aucun examen ou diagnostic enregistré pour le moment.</p>
                                </div>
                            ) : (
                                <div className="records-list">
                                    {patient.medicalRecords.map((record: any) => (
                                        <div key={record.id} className="record-card">
                                            <div className="record-date">
                                                <Calendar size={16} />
                                                <span>{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                            <div className="record-content">
                                                <h3 className="record-diagnosis">{record.diagnosis}</h3>
                                                <p className="record-treatment">{record.treatment}</p>
                                                {record.notes && <p className="record-notes"><span>Note:</span> {record.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>

            <style>{`
                .patient-health {
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .page-header { margin-bottom: 2.5rem; }
                .page-header h1 { font-size: 2rem; font-weight: 800; color: var(--foreground); margin-bottom: 0.5rem; }
                .page-header p { color: var(--muted-foreground); font-size: 1.1rem; }

                .health-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .patient-info-card {
                    background: white;
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--border);
                    padding: 2rem;
                    box-shadow: var(--shadow-sm);
                }

                .card-header, .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border);
                }

                .card-header h2, .section-header h2 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--foreground);
                }

                .card-header svg, .section-header svg {
                    color: var(--primary);
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                }

                .info-item label {
                    display: block;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--muted-foreground);
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                }

                .info-item p {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--foreground);
                }

                .reg-badge {
                    display: inline-block;
                    background: #f1f5f9;
                    color: var(--primary);
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 0.95rem !important;
                }

                .records-section {
                    background: white;
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--border);
                    padding: 2rem;
                    box-shadow: var(--shadow-sm);
                }

                .records-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .record-card {
                    border-left: 4px solid var(--primary);
                    background: #f8fafc;
                    padding: 1.5rem;
                    border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
                }

                .record-date {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--muted-foreground);
                    font-size: 0.85rem;
                    margin-bottom: 0.75rem;
                }

                .record-diagnosis {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: var(--foreground);
                    margin-bottom: 0.5rem;
                }

                .record-treatment {
                    color: #334155;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }

                .record-notes {
                    font-size: 0.9rem;
                    color: var(--muted-foreground);
                    font-style: italic;
                }

                .record-notes span {
                    font-weight: 700;
                    font-style: normal;
                }

                .empty-records {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--muted-foreground);
                }

                .empty-records svg { color: var(--muted); margin-bottom: 1rem; }

                .loading-state, .error-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 5rem 2rem;
                    text-align: center;
                }

                .error-state { color: var(--danger); }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </DashboardLayout>
    );
};

export default PatientHealth;
