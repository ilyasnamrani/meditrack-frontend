import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Calendar, Clock, User, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { getToken } from '../services/keycloak';

const api = axios.create({
    baseURL: 'http://localhost:8888', // Gateway
});

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDoctorNames = async (apts: any[]) => {
        const doctorIds = [...new Set(apts.map(a => a.doctorId))];
        const doctorMap: Record<number, string> = { ...doctors };

        await Promise.all(doctorIds.map(async (id) => {
            if (!doctorMap[id]) {
                try {
                    const token = getToken();
                    const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
                    const res = await api.get(`/api/staff/${id}`, config);
                    doctorMap[id] = `${res.data.firstName} ${res.data.lastName}`;
                } catch (err) {
                    console.error(`Failed to fetch doctor ${id}`, err);
                    doctorMap[id] = `Dr. (ID: ${id})`;
                }
            }
        }));
        setDoctors(doctorMap);
    };

    useEffect(() => {
        const fetchAppointments = async () => {
            const patientDbId = localStorage.getItem('patient_db_id');
            if (!patientDbId) {
                setError("Session expirée. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }

            try {
                const token = getToken();
                const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
                const response = await api.get(`/api/planning/appointments/patient/${patientDbId}`, config);
                setAppointments(response.data);
                await fetchDoctorNames(response.data);
            } catch (err) {
                console.error("Error fetching appointments:", err);
                setError("Impossible de charger vos rendez-vous.");
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    return (
        <DashboardLayout>
            <div className="patient-appointments">
                <header className="page-header">
                    <div>
                        <h1>Mes Rendez-vous</h1>
                        <p>Retrouvez ici toutes vos consultations et interventions prévues.</p>
                    </div>
                </header>

                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="spin" size={40} />
                        <p>Chargement de votre planning...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <AlertCircle size={40} />
                        <p>{error}</p>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="empty-state">
                        <Calendar size={60} />
                        <p>Vous n'avez aucun rendez-vous prévu pour le moment.</p>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {appointments.map((apt) => (
                            <div key={apt.id} className="apt-card">
                                <div className="apt-info">
                                    <div className="apt-badge-row">
                                        <span className={`apt-type type-${apt.type.toLowerCase()}`}>{apt.type}</span>
                                        <span className={`apt-status status-${apt.status.toLowerCase()}`}>{apt.status}</span>
                                    </div>
                                    <h2 className="apt-title">{apt.resourceName || 'Consultation'}</h2>
                                    <div className="apt-details">
                                        <div className="detail-item">
                                            <Calendar size={18} />
                                            <span>{new Date(apt.startTime).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                        <div className="detail-item">
                                            <Clock size={18} />
                                            <span>{new Date(apt.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="detail-item">
                                            <User size={18} />
                                            <span>Dr. {doctors[apt.doctorId] || apt.doctorId}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .patient-appointments {
                    max-width: 900px;
                    margin: 0 auto;
                }
                .page-header {
                    margin-bottom: 2.5rem;
                }
                .page-header h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--foreground);
                    margin-bottom: 0.5rem;
                }
                .page-header p {
                    color: var(--muted-foreground);
                    font-size: 1.1rem;
                }

                .appointments-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                .apt-card {
                    background: white;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    padding: 1.5rem;
                    box-shadow: var(--shadow-sm);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .apt-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-md);
                }

                .apt-badge-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
                }

                .apt-type, .apt-status {
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 0.35rem 0.85rem;
                    border-radius: 100px;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .type-consultation { background: #e0f2fe; color: #0369a1; }
                .type-operation { background: #fee2e2; color: #b91c1c; }
                .type-examen { background: #f3e8ff; color: #7e22ce; }

                .status-scheduled { background: #fef9c3; color: #854d0e; }
                .status-completed { background: #dcfce7; color: #166534; }
                .status-cancelled { background: #f3f4f6; color: #374151; }

                .apt-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 1.25rem;
                    color: var(--foreground);
                }

                .apt-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--muted-foreground);
                    font-size: 0.95rem;
                }

                .detail-item svg {
                    color: var(--primary);
                }

                .loading-state, .empty-state, .error-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 5rem 2rem;
                    text-align: center;
                    background: white;
                    border-radius: var(--radius-xl);
                    border: 1px dashed var(--border);
                    color: var(--muted-foreground);
                }

                .empty-state svg {
                    color: var(--muted);
                    margin-bottom: 1.5rem;
                }

                .error-state {
                    color: var(--danger);
                    background: #fef2f2;
                    border-style: solid;
                }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </DashboardLayout>
    );
};

export default PatientAppointments;
