import { apiClient } from './client';

// Types
export interface Publication {
  id: number;
  title: string;
  description: string;
  category: string;
  price_per_day: number;
  location: string;
  owner_id: number;
  images: string[];
  condition: string;
  deposit_required: number;
  is_available: boolean;
  is_active: boolean;
  view_count?: number; // Ajouté pour la page de détail
  created_at: string;
  updated_at: string;
}

export interface CreatePublicationData {
  title: string;
  description: string;
  category: string;
  price_per_day: number;
  location: string;
  images?: string[];
  condition?: string;
  deposit_required?: number;
}

export interface UpdatePublicationData extends Partial<CreatePublicationData> {
  is_available?: boolean;
}

export interface PublicationsResponse {
  publications: Publication[];
  total: number;
  total_pages: number;
  page: number;
  per_page: number;
}

export interface PublicationFilters {
  category?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  available_only?: boolean;
  search?: string;
  sort?: 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc' | 'popularity';
  page?: number;
  per_page?: number;
}

// Renommé pour éviter la confusion avec PublicationFilters
export interface SearchFilters extends PublicationFilters {}

export interface AdvancedSearchData {
  keywords?: string;
  category?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  condition?: string[];
  available_from?: string;
  available_to?: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
  'bricolage': 'Bricolage',
  'sport': 'Sport',
  'jardinage': 'Jardinage',
  'electromenager': 'Électroménager',
  'transport': 'Transport',
  'autre': 'Autre',
};

export const CONDITION_LABELS: Record<string, string> = {
  'neuf': 'Neuf',
  'excellent': 'Excellent',
  'bon': 'Bon état',
  'acceptable': 'Acceptable',
  // Ajout des conditions manquantes utilisées dans CONDITION_COLORS
  'new': 'Neuf',
  'like_new': 'Comme neuf',
  'good': 'Bon état',
  'used': 'Utilisé',
  'for_parts': 'Pour pièces',
};

export const CONDITION_COLORS: Record<string, string> = {
  // Conditions existantes
  'neuf': 'bg-green-100 text-green-700',
  'excellent': 'bg-blue-100 text-blue-700',
  'bon': 'bg-amber-100 text-amber-700',
  'acceptable': 'bg-orange-100 text-orange-700',
  // Conditions anglaises
  'new': 'bg-green-100 text-green-700',
  'like_new': 'bg-blue-100 text-blue-700',
  'good': 'bg-amber-100 text-amber-700',
  'used': 'bg-orange-100 text-orange-700',
  'for_parts': 'bg-red-100 text-red-700',
};

// API Functions
const baseAPI = {
  // Récupérer toutes les publications avec filtres
  getAll: async (filters?: PublicationFilters): Promise<PublicationsResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const url = `/publications${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  },

  // Alias pour getAll (utilisé dans publications/page.tsx)
  getPublications: async (filters?: PublicationFilters): Promise<PublicationsResponse> => {
    return baseAPI.getAll(filters);
  },

  // Récupérer une publication spécifique (utilisé dans publications/[id]/page.tsx)
  getById: async (id: number): Promise<Publication> => {
    return apiClient.get(`/publications/${id}`);
  },

  // Alias pour getById (utilisé dans publications/[id]/page.tsx)
  getPublication: async (id: number): Promise<Publication> => {
    return baseAPI.getById(id);
  },

  // Récupérer les publications de l'utilisateur connecté
  getUserPublications: async (): Promise<Publication[]> => {
    return apiClient.get('/publications/user');
  },

  // Créer une nouvelle publication
  create: async (data: CreatePublicationData): Promise<Publication> => {
    return apiClient.post('/publications/create', data);
  },

  // Mettre à jour une publication
  update: async (id: number, data: UpdatePublicationData): Promise<Publication> => {
    return apiClient.put(`/publications/${id}/update`, data);
  },

  // Basculer la disponibilité d'une publication
  toggleAvailability: async (id: number): Promise<{ message: string; is_available: boolean }> => {
    return apiClient.put(`/publications/${id}/toggle-availability`);
  },

  // Supprimer une publication (soft delete)
  delete: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/publications/${id}/delete`);
  },

  // Récupérer les catégories avec statistiques
  getCategories: async (): Promise<Record<string, number>> => {
    return apiClient.get('/publications/categories');
  },

  // Recherche avancée
  advancedSearch: async (searchData: AdvancedSearchData): Promise<{ publications: Publication[]; total: number }> => {
    return apiClient.post('/publications/search/advanced', searchData);
  }
};

// Fonction utilitaire pour créer une publication
export const createPublication = async (data: CreatePublicationData): Promise<Publication> => {
  return PublicationsAPI.create(data);
};

// Exports pour l'API
export const PublicationsAPI = baseAPI;
export const publicationsAPI = baseAPI;