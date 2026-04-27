import Keycloak from 'keycloak-js';
import axios from 'axios';

// Configuration Keycloak
const keycloakConfig = {
  url: 'http://localhost:9090',
  realm: 'meditrack-realm',
  clientId: 'meditrack-client',
};

const keycloak = new Keycloak(keycloakConfig);

// --- Direct Grant Flow Support (Custom Login Page) ---

const TOKEN_KEY = 'meditrack_access_token';
const REFRESH_TOKEN_KEY = 'meditrack_refresh_token';
const PATIENT_ID_KEY = 'patient_id';

/**
 * Perform a Direct Access Grant login (Username/Password)
 */
export const loginWithCredentials = async (username: string, password: string) => {
  const params = new URLSearchParams();
  params.append('client_id', keycloakConfig.clientId);
  params.append('grant_type', 'password');
  params.append('username', username);
  params.append('password', password);
  // If client secret is needed (not for public clients via CORS usually, but if configured):
  // params.append('client_secret', 'YOUR_SECRET'); 

  try {
    const response = await axios.post(
      `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token } = response.data;

    // Manual Token Storage
    localStorage.setItem(TOKEN_KEY, access_token);
    if (refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);

    // Initialize keycloak-js with this token so it parses roles etc.
    // Note: We might just parse it manually to avoid keycloak-js redirect logic if it interferes.
    // For now, let's just store it and use helper functions.

    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw new Error("Identifiants incorrects ou erreur de connexion.");
  }
};

/**
 * Initialise Keycloak et vérifie l'authentification au démarrage
 */
export const initKeycloak = (onAuthenticatedCallback: () => void) => {
  // If we have a stored token, we consider the user authenticated for Direct Grant flow items
  const storedToken = localStorage.getItem(TOKEN_KEY);
  if (storedToken) {
    console.log("Restored session from local storage");
    onAuthenticatedCallback();
    return;
  }

  // Fallback to keycloak-js init for standard flow if ever needed, 
  // but for now we rely on manual token management for Staff.
  onAuthenticatedCallback();
};

export const doLogin = () => {
  // Redirect to our custom login page
  window.location.href = '/staff/login';
};

export const doLogout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(PATIENT_ID_KEY); // Clean patient session too
  window.location.href = '/';
};

// Adapted to use stored token
export const getToken = () => {
  // 1. Try Keycloak object (Standard flow)
  if (keycloak.token) return keycloak.token;

  // 2. Try Local Storage (Direct Grant flow)
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Checks if the user is authenticated.
 * Supports both Keycloak (Staff) and localStorage (Patient/Staff-Direct).
 */
export const isLoggedIn = () => {
  const hasKeycloakToken = !!keycloak.token;
  const hasStoredToken = !!localStorage.getItem(TOKEN_KEY);
  const hasPatientSession = !!localStorage.getItem(PATIENT_ID_KEY);
  return hasKeycloakToken || hasStoredToken || hasPatientSession;
};

// Decode JWT simply to get roles/username (Keycloak-js does this, but we are bypassing it partially)
const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const getUsername = () => {
  const token = getToken();
  if (!token) return localStorage.getItem(PATIENT_ID_KEY);
  return parseJwt(token)?.preferred_username;
};

export const getUserRoles = (): string[] => {
  let roles: string[] = [];
  const token = getToken();

  if (token) {
    const decoded = parseJwt(token);
    if (decoded?.realm_access?.roles) {
      roles = [...decoded.realm_access.roles];
    }
  }

  // Fallback for Patient (if they logged in via ID only)
  if (localStorage.getItem(PATIENT_ID_KEY)) {
    roles.push('PATIENT');
  }

  return [...new Set(roles)];
};

export const hasRole = (roles: string[]) => {
  const userRoles = getUserRoles();
  return roles.some(r => userRoles.includes(r));
};

export const isStaff = () => {
  const roles = getUserRoles();
  return roles.includes('DOCTOR') || roles.includes('NURSE') || roles.includes('ADMIN') || roles.includes('SECRETARY');
};

export const isPatient = () => {
  const roles = getUserRoles();
  return roles.includes('PATIENT');
};

export default keycloak;
