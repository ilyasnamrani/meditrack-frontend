import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, User, ArrowRight, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8888', // Gateway
});

const PatientLogin = () => {
    const [registrationId, setRegistrationId] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            // Check if patient exists with this registration ID
            const response = await api.get(`/api/patients/search?registrationNumber=${registrationId}`);

            if (response.data) {
                setStatus('success');
                setMessage('Identification réussie. Chargement de votre espace...');
                // Store the registration ID for the dashboard to use (mock authentication)
                localStorage.setItem('patient_id', registrationId);
                localStorage.setItem('patient_db_id', response.data.id.toString());

                setTimeout(() => {
                    navigate('/patient');
                }, 1500);
            } else {
                throw new Error("ID d'enregistrement non trouvé.");
            }
        } catch (err: unknown) {
            console.error(err);
            setStatus('error');
            const errorMessage = err instanceof Error ? err.message : "ID d'enregistrement non valide. Veuillez vérifier votre code.";
            setMessage(errorMessage);
        }
    };

    return (
        <div className="login-container">
            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-header">
                    <div className="logo" onClick={() => navigate('/')}>
                        <Activity className="logo-icon" />
                        <span>MediTrack</span>
                    </div>
                    <h1>Espace Patient</h1>
                    <p>Connectez-vous avec votre numéro d'enregistrement reçu lors de votre admission.</p>
                </div>

                {status === 'success' ? (
                    <div className="status-container success">
                        <CheckCircle size={48} />
                        <p>{message}</p>
                        <div className="loader-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="reg-id">N° d'enregistrement</label>
                            <div className="input-wrapper">
                                <User size={18} />
                                <input
                                    id="reg-id"
                                    type="text"
                                    placeholder="Ex: REG-2024-XXXX"
                                    required
                                    value={registrationId}
                                    onChange={(e) => setRegistrationId(e.target.value.toUpperCase())}
                                    disabled={status === 'loading'}
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="status-container error">
                                <AlertTriangle size={18} />
                                <p>{message}</p>
                            </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                            {status === 'loading' ? (
                                <Loader2 className="spin" size={20} />
                            ) : (
                                <>Accéder à mon dossier <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>
                )}

                <div className="login-footer">
                    <p>Besoin d'aide ? Contactez l'accueil de l'hôpital.</p>
                    <button onClick={() => navigate('/')} className="btn-text">Retour à l'accueil</button>
                </div>
            </motion.div>

            <style>{`
                .login-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 2rem;
                }

                .login-card {
                    background: white;
                    width: 100%;
                    max-width: 450px;
                    padding: 3rem;
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-lg);
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .logo {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--primary);
                    font-weight: 800;
                    font-size: 1.25rem;
                    margin-bottom: 2rem;
                    cursor: pointer;
                }

                .login-header h1 {
                    font-size: 1.75rem;
                    color: var(--foreground);
                    margin-bottom: 0.5rem;
                }

                .login-header p {
                    color: var(--muted-foreground);
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #475569;
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
                    padding: 0.85rem 1rem 0.85rem 2.8rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                    background-color: #f8fafc;
                    font-size: 1rem;
                    transition: all 0.2s;
                    letter-spacing: 0.05em;
                }

                .input-wrapper input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background-color: white;
                    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
                }

                .submit-btn {
                    margin-top: 1rem;
                    background: var(--primary);
                    color: white;
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.75rem;
                    transition: all 0.2s;
                }

                .submit-btn:hover:not(:disabled) {
                    background: var(--primary-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 102, 255, 0.2);
                }

                .status-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    text-align: center;
                }

                .status-container.success {
                    color: var(--success);
                    background: #f0fdf4;
                }

                .status-container.error {
                    color: var(--danger);
                    background: #fef2f2;
                    flex-direction: row;
                    text-align: left;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .login-footer {
                    margin-top: 2.5rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .login-footer p {
                    font-size: 0.85rem;
                    color: var(--muted-foreground);
                }

                .btn-text {
                    color: var(--primary);
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .loader-dots { display: flex; gap: 4px; margin-top: 0.5rem; }
                .loader-dots span {
                    width: 8px; height: 8px; border-radius: 50%; background: var(--success);
                    animation: bounce 0.6s infinite alternate;
                }
                .loader-dots span:nth-child(2) { animation-delay: 0.2s; }
                .loader-dots span:nth-child(3) { animation-delay: 0.4s; }
                @keyframes bounce { to { opacity: 0.3; transform: translateY(-4px); } }
            `}</style>
        </div>
    );
};

export default PatientLogin;
