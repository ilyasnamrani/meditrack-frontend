import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, User, Mail, Lock, UserPlus, Info, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8888', // Gateway
});

const Register = () => {

  const [role] = useState<'STAFF'>('STAFF');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'DOCTOR', // Default role for staff
    specialization: '', // for Staff
    dateOfBirth: '', // for Patient
    phoneNumber: '', // for Patient
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const endpoint = '/api/staff/register';
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      await api.post(endpoint, payload);

      setStatus('success');
      setMessage('Compte staff créé avec succès ! Vous pouvez maintenant vous connecter avec votre email.');
    } catch (err: unknown) {
      console.error(err);
      setStatus('error');
      let errMsg = "Une erreur est survenue lors de l'inscription.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      setMessage(errMsg);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="logo" onClick={() => navigate('/')}>
            <Activity className="logo-icon" />
            <span>MediTrack</span>
          </div>
          <h1>Rejoignez l'excellence</h1>
          <p>Créez votre compte en quelques instants.</p>
        </div>


        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="status-message success"
            >
              <CheckCircle size={48} />
              <h3>Inscription Terminée</h3>
              <p>{message}</p>
              <button onClick={() => navigate('/')} className="btn-primary">Retour à l'accueil</button>
            </motion.div>
          ) : (
            <motion.form
              key={role}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRegister}
              className="register-form"
            >
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <input
                      type="text"
                      placeholder="Jean"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <input
                      type="text"
                      placeholder="Dupont"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input
                    type="email"
                    placeholder="jean.dupont@exemple.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Rôle Professionnel</label>
                <div className="input-wrapper">
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: '#f8fafc' }}
                  >
                    <option value="DOCTOR">Médecin</option>
                    <option value="NURSE">Infirmier(e)</option>
                    <option value="SECRETARY">Secrétaire</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
              </div>

              {role === 'STAFF' && (
                <div className="form-group">
                  <label>Spécialisation</label>
                  <div className="input-wrapper">
                    <Info size={18} />
                    <input
                      type="text"
                      placeholder="Ex: Cardiologie"
                      required
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Mot de passe</label>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {status === 'error' && <p className="error-msg">{message}</p>}

              <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                {status === 'loading' ? 'Traitement...' : 'S\'inscrire comme Professionnel'}
                <UserPlus size={20} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="footer-text">
          Déjà un compte ? <span onClick={() => navigate('/')}>Se connecter</span>
        </p>
      </div>

      <style>{`
        .register-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
        }

        .register-card {
          background: white;
          width: 100%;
          max-width: 500px;
          padding: 3rem;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
        }

        .register-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          font-weight: 800;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          cursor: pointer;
        }

        .register-header h1 {
          font-size: 1.75rem;
          color: var(--foreground);
          margin-bottom: 0.5rem;
        }

        .register-header p {
          color: var(--muted-foreground);
        }

        .role-selector {
          display: flex;
          background: var(--muted);
          padding: 0.25rem;
          border-radius: var(--radius-lg);
          margin-bottom: 2rem;
        }

        .role-btn {
          flex: 1;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--muted-foreground);
        }

        .role-btn.active {
          background: white;
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
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
          padding: 0.75rem 1rem 0.75rem 2.8rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background-color: #f8fafc;
          transition: all 0.2s;
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

        .submit-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .status-message {
          text-align: center;
          padding: 2rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .status-message.success { color: var(--success); }
        .success h3 { color: var(--foreground); }
        .success p { color: var(--muted-foreground); font-weight: 500; font-size: 0.95rem; line-height: 1.5; }

        .error-msg {
          color: var(--danger);
          font-size: 0.85rem;
          font-weight: 500;
          text-align: center;
        }

        .footer-text {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.9rem;
          color: var(--muted-foreground);
        }

        .footer-text span {
          color: var(--primary);
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 480px) {
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Register;
