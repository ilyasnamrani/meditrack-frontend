import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Mail, Lock, LogIn, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginWithCredentials } from '../services/keycloak';

const StaffLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      await loginWithCredentials(email, password);
      setStatus('success');
      // Redirect to dashboard after short delay
      setTimeout(() => navigate('/staff'), 500);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || 'Échec de la connexion. Vérifiez vos identifiants.');
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
          <h1>Espace Professionnel</h1>
          <p>Accédez à votre tableau de bord sécurisé.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Professionnel</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                type="email"
                placeholder="medecin@hopital.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          <AnimatePresence>
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="error-msg"
              >
                <AlertTriangle size={16} />
                <span>{message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" className="submit-btn" disabled={status === 'loading'}>
            {status === 'loading' ? 'Connexion en cours...' : 'Se connecter'}
            {!status && <LogIn size={20} />}
            {status === 'loading' && <Activity className="spin" size={20} />}
          </button>
        </form>

        <div className="login-footer">
          <p>Vous n'avez pas de compte ? <span onClick={() => navigate('/register?role=STAFF')}>Inscrivez-vous ici</span></p>
          <button onClick={() => navigate('/')} className="btn-text">Retour à l'accueil</button>
        </div>
      </motion.div>

      <style>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
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
          cursor: pointer;
          margin-bottom: 1.5rem;
        }

        .login-header h1 {
          font-size: 1.5rem;
          color: var(--foreground);
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: var(--muted-foreground);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
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

        .error-msg {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--danger);
          background: #fef2f2;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
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
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer {
            margin-top: 2rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .login-footer p {
            font-size: 0.9rem;
            color: var(--muted-foreground);
        }

        .login-footer span, .btn-text {
            color: var(--primary);
            font-weight: 600;
            cursor: pointer;
            background: none;
            border: none;
            font-size: 0.9rem;
        }
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default StaffLogin;
