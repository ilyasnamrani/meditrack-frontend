import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StaffDashboard from './pages/StaffDashboard';
import StaffPatients from './pages/StaffPatients';
import StaffPlanning from './pages/StaffPlanning';
import StaffBilling from './pages/StaffBilling';
import StaffAlerts from './pages/StaffAlerts';
import StaffLogin from './pages/StaffLogin';
import PatientDashboard from './pages/PatientDashboard';
import PatientLogin from './pages/PatientLogin';
import PatientAppointments from './pages/PatientAppointments';
import PatientHealth from './pages/PatientHealth';
import PatientAlerts from './pages/PatientAlerts';
import PatientBilling from './pages/PatientBilling';
import Register from './pages/Register';
import RoleRedirect from './components/RoleRedirect';
import { isLoggedIn } from './services/keycloak';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isPatientPath = window.location.pathname.startsWith('/patient');

  if (isPatientPath) {
    // Patient access requires patient_id in localStorage
    if (!localStorage.getItem('patient_id')) {
      return <Navigate to="/patient/login" />;
    }
  } else {
    // Staff access requires Keycloak authentication
    if (!isLoggedIn()) {
      return <Navigate to="/" />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/redirect" element={<RoleRedirect />} />

        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/patients"
          element={
            <ProtectedRoute>
              <StaffPatients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/planning"
          element={
            <ProtectedRoute>
              <StaffPlanning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/billing"
          element={
            <ProtectedRoute>
              <StaffBilling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/alerts"
          element={
            <ProtectedRoute>
              <StaffAlerts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient"
          element={
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute>
              <PatientAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/health"
          element={
            <ProtectedRoute>
              <PatientHealth />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/alerts"
          element={
            <ProtectedRoute>
              <PatientAlerts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/billing"
          element={
            <ProtectedRoute>
              <PatientBilling />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
