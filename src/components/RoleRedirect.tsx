import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, isStaff, isPatient } from '../services/keycloak';

/**
 * Composant de redirection automatique basé sur les rôles Keycloak
 */
const RoleRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/');
            return;
        }

        if (isStaff()) {
            navigate('/staff');
        } else if (isPatient()) {
            navigate('/patient');
        } else {
            // Rôle inconnu ou pas de rôle MediTrack
            console.warn("User has no valid MediTrack roles");
            navigate('/');
        }
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div className="loader"></div>
            <p>Redirection en cours...</p>
            <style>{`
        .loader {
          border: 4px solid var(--muted);
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default RoleRedirect;
