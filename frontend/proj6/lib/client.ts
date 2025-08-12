// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_PUBLICATIONS;

// Types pour les erreurs API
export interface APIError {
  status: number;
  data?: any;
  message: string;
}

// Classe d'erreur personnalisée
export class APIException extends Error implements APIError {
  status: number;
  data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'APIException';
    this.status = status;
    this.data = data;
  }
}

// Fonction pour récupérer le token d'authentification
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }
  return null;
};

// Fonction pour construire les headers
const buildHeaders = (customHeaders: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Fonction pour traiter les réponses
const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  let data;

  // Traiter les différents types de contenu
  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Si la réponse n'est pas ok, lancer une erreur
  if (!response.ok) {
    const message = data?.error || data?.message || `HTTP Error ${response.status}`;
    throw new APIException(response.status, message, data);
  }

  return data;
};

// Client API générique
export const apiClient = {
  // Méthode GET
  get: async (endpoint: string, customHeaders?: Record<string, string>) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: buildHeaders(customHeaders),
    });

    return handleResponse(response);
  },

  // Méthode POST
  post: async (endpoint: string, data?: any, customHeaders?: Record<string, string>) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse(response);
  },

  // Méthode PUT
  put: async (endpoint: string, data?: any, customHeaders?: Record<string, string>) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: buildHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse(response);
  },

  // Méthode PATCH
  patch: async (endpoint: string, data?: any, customHeaders?: Record<string, string>) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: buildHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse(response);
  },

  // Méthode DELETE
  delete: async (endpoint: string, customHeaders?: Record<string, string>) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: buildHeaders(customHeaders),
    });

    return handleResponse(response);
  },

  // Méthode pour l'upload de fichiers
  upload: async (endpoint: string, formData: FormData, customHeaders?: Record<string, string>) => {
    const headers = { ...customHeaders };
    
    // Ne pas définir Content-Type pour FormData, le navigateur le fera automatiquement
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return handleResponse(response);
  }
};

// Fonction utilitaire pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

// Fonction pour déconnecter l'utilisateur
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    // Rediriger vers la page de connexion
    window.location.href = '/auth/login';
  }
};