import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { CreditCard, Download, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { getToken } from '../services/keycloak';

const api = axios.create({
    baseURL: 'http://localhost:8888', // Gateway
});

const PatientBilling = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInvoices = async () => {
            const patientDbId = localStorage.getItem('patient_db_id');
            if (!patientDbId) {
                setError("Session expirée. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }

            try {
                const token = getToken();
                const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
                const response = await api.get(`/api/billing/patient/${patientDbId}`, config);
                setInvoices(response.data);
            } catch (error) {
                console.error("Error fetching invoices:", error);
                setError("Impossible de charger vos factures.");
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PAID': return <CheckCircle size={18} className="text-success" />;
            case 'CANCELLED': return <XCircle size={18} className="text-danger" />;
            default: return <Clock size={18} className="text-warning" />;
        }
    };

    return (
        <DashboardLayout>
            <div className="patient-billing">
                <header className="page-header">
                    <div>
                        <h1>Ma Facturation</h1>
                        <p>Consultez vos factures et l'état de vos paiements.</p>
                    </div>
                </header>

                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="spin" size={40} />
                        <p>Chargement de vos factures...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <AlertCircle size={40} />
                        <p>{error}</p>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="empty-state">
                        <CreditCard size={60} />
                        <p>Vous n'avez aucune facture pour le moment.</p>
                    </div>
                ) : (
                    <div className="invoices-container">
                        <div className="billing-summary">
                            <div className="summary-card total">
                                <label>Total facturé</label>
                                <h3>{invoices.reduce((acc, inv) => acc + inv.amount, 0).toFixed(2)} €</h3>
                            </div>
                            <div className="summary-card pending">
                                <label>En attente</label>
                                <h3>{invoices.filter(inv => inv.status !== 'PAID').reduce((acc, inv) => acc + inv.amount, 0).toFixed(2)} €</h3>
                            </div>
                        </div>

                        <div className="invoices-table-container">
                            <table className="invoices-table">
                                <thead>
                                    <tr>
                                        <th>Réf. Facture</th>
                                        <th>Date d'émission</th>
                                        <th>Date d'échéance</th>
                                        <th>Montant</th>
                                        <th>Statut</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv.id}>
                                            <td><span className="inv-ref">#INV-{inv.id}</span></td>
                                            <td>{new Date(inv.issueDate).toLocaleDateString('fr-FR')}</td>
                                            <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td className="amount-cell">{inv.amount.toFixed(2)} €</td>
                                            <td>
                                                <div className="status-cell">
                                                    {getStatusIcon(inv.status)}
                                                    <span className={`status-text ${inv.status.toLowerCase()}`}>{inv.status}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <button className="download-btn" title="Télécharger">
                                                    <Download size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .patient-billing { max-width: 1000px; margin: 0 auto; }
                .page-header { margin-bottom: 2.5rem; }
                .page-header h1 { font-size: 2rem; font-weight: 800; color: var(--foreground); margin-bottom: 0.5rem; }
                .page-header p { color: var(--muted-foreground); font-size: 1.1rem; }

                .billing-summary {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .summary-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-sm);
                }

                .summary-card label {
                    font-size: 0.85rem;
                    color: var(--muted-foreground);
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .summary-card h3 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    margin-top: 0.5rem;
                }

                .summary-card.total h3 { color: var(--primary); }
                .summary-card.pending h3 { color: #f59e0b; }

                .invoices-table-container {
                    background: white;
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--border);
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                }

                .invoices-table { width: 100%; border-collapse: collapse; }
                .invoices-table th {
                    text-align: left;
                    padding: 1.25rem 1.5rem;
                    background: #f8fafc;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #64748b;
                    border-bottom: 1px solid var(--border);
                }

                .invoices-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }

                .inv-ref { font-family: monospace; font-weight: 700; color: #334155; }
                .amount-cell { font-weight: 800; color: var(--foreground); }

                .status-cell { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.85rem; }
                .status-text.paid { color: var(--success); }
                .status-text.pending { color: #f59e0b; }
                .status-text.cancelled { color: var(--danger); }

                .text-success { color: var(--success); }
                .text-warning { color: #f59e0b; }
                .text-danger { color: var(--danger); }

                .download-btn {
                    color: var(--primary);
                    padding: 0.5rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                }

                .download-btn:hover { background: #eff6ff; }

                .loading-state, .empty-state, .error-state {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 5rem 2rem; text-align: center; background: white; border-radius: var(--radius-xl);
                    border: 1px dashed var(--border); color: var(--muted-foreground);
                }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </DashboardLayout>
    );
};

export default PatientBilling;
