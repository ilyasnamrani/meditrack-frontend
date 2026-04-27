import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Users, ArrowRight } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  /* Redirection removed to allow conditional UI on landing page */

  const containerVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "circOut" }
    }
  };

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          <Activity className="logo-icon" size={32} />
          <span>MediTrack</span>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate('/register?role=STAFF')} className="btn-ghost">S'inscrire (Staff)</button>
          <button onClick={() => navigate('/staff/login')} className="btn-outline">Connexion</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={itemVariants}>
            L'excellence technologique au service de la <span>santé</span>.
          </motion.h1>
          <motion.p variants={itemVariants}>
            Une plateforme intégrée pour une gestion hospitalière fluide, sécurisée et centrée sur le patient.
          </motion.p>

          <motion.div className="cta-group" variants={itemVariants}>
            <button
              onClick={() => navigate('/patient/login')}
              className="btn-primary"
            >
              Accès Patient <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/staff/login')}
              className="btn-secondary"
            >
              Accès Staff <ArrowRight size={20} />
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="glass-card">
            <div className="pulse-circle"></div>
            <Activity size={120} strokeWidth={1} />
          </div>
        </motion.div>
      </main>

      {/* Features */}
      <section className="features">
        <div className="feature-card">
          <ShieldCheck className="feature-icon" />
          <h3>Sécurisé</h3>
          <p>Authentification Keycloak et RBAC pour une protection maximale des données.</p>
        </div>
        <div className="feature-card">
          <Users className="feature-icon" />
          <h3>Collaboratif</h3>
          <p>Interconnexion fluide entre médecins, infirmiers et administratifs.</p>
        </div>
        <div className="feature-card">
          <Activity className="feature-icon" />
          <h3>Dynamique</h3>
          <p>Planification en temps réel et ressources optimisées pour chaque patient.</p>
        </div>
      </section>

      <style>{`
        .landing-container {
          min-height: 100vh;
          background: radial-gradient(circle at top right, #f8fafc, #e2e8f0);
          overflow-x: hidden;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 5%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--primary);
        }

        .hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 5rem 5%;
          max-width: 1400px;
          margin: 0 auto;
          align-items: center;
        }

        .hero-content h1 {
          font-size: 4rem;
          line-height: 1.1;
          margin-bottom: 2rem;
          color: var(--foreground);
        }

        .hero-content h1 span {
          color: var(--primary);
        }

        .hero-content p {
          font-size: 1.25rem;
          color: var(--muted-foreground);
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .cta-group {
          display: flex;
          gap: 1.5rem;
        }

        .btn-primary {
          background-color: var(--primary);
          color: white;
          padding: 1.25rem 2.5rem;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          box-shadow: 0 10px 20px -5px rgba(0, 102, 255, 0.4);
        }

        .btn-secondary {
          background-color: white;
          color: var(--foreground);
          padding: 1.25rem 2.5rem;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          border: 1px solid var(--border);
        }

        .btn-outline {
          border: 1px solid var(--primary);
          color: var(--primary);
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-lg);
          font-weight: 600;
        }

        .btn-ghost {
          color: var(--muted-foreground);
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          transition: color 0.2s;
        }

        .btn-ghost:hover {
          color: var(--primary);
        }

        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .glass-card {
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(20px);
          border-radius: var(--radius-xl);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--primary);
          position: relative;
          box-shadow: var(--shadow-lg);
        }

        .pulse-circle {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--primary);
          opacity: 0.1;
          animation: pulse 3s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.1; }
          100% { transform: scale(0.8); opacity: 0.2; }
        }

        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3rem;
          padding: 5rem 5%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .feature-card {
          background: white;
          padding: 3rem;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-10px);
        }

        .feature-icon {
          color: var(--primary);
          size: 40px;
          margin-bottom: 1.5rem;
        }

        .feature-card h3 {
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .feature-card p {
          color: var(--muted-foreground);
          line-height: 1.6;
        }

        @media (max-width: 1024px) {
          .hero { grid-template-columns: 1fr; text-align: center; }
          .hero-content h1 { font-size: 3rem; }
          .cta-group { justify-content: center; }
          .features { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
