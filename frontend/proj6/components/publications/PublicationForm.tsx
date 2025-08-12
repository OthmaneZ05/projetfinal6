import React, { useState } from 'react';
import { Upload, MapPin, Euro, Tag, FileText, Camera, AlertCircle, Check } from 'lucide-react';
import { createPublication } from '@/lib/publications';
import { useRouter } from 'next/navigation';

interface FormData {
  title: string;
  description: string;
  category: string;
  price_per_day: string;
  location: string;
  images: string[];
  condition: string;
  deposit_required: string;
}

const PublicationForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    price_per_day: '',
    location: '',
    images: [],
    condition: 'bon',
    deposit_required: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageUrls, setImageUrls] = useState(['']);

  const categories = [
    { value: 'bricolage', label: 'Bricolage' },
    { value: 'sport', label: 'Sport' },
    { value: 'jardinage', label: 'Jardinage' },
    { value: 'electromenager', label: 'Électroménager' },
    { value: 'transport', label: 'Transport' },
    { value: 'autre', label: 'Autre' }
  ];

  const conditions = [
    { value: 'neuf', label: 'Neuf' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'bon', label: 'Bon' },
    { value: 'acceptable', label: 'Acceptable' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
    
    // Update formData with valid URLs
    const validUrls = newImageUrls.filter(url => url.trim() !== '');
    setFormData(prev => ({
      ...prev,
      images: validUrls
    }));
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImageUrls);
    
    const validUrls = newImageUrls.filter(url => url.trim() !== '');
    setFormData(prev => ({
      ...prev,
      images: validUrls
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.category) {
      newErrors.category = 'La catégorie est requise';
    }

    if (!formData.price_per_day || parseFloat(formData.price_per_day) <= 0) {
      newErrors.price_per_day = 'Le prix par jour doit être supérieur à 0';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La localisation est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price_per_day: parseFloat(formData.price_per_day),
        location: formData.location.trim(),
        images: formData.images,
        condition: formData.condition,
        deposit_required: formData.deposit_required ? parseFloat(formData.deposit_required) : 0
      };

      const result = await createPublication(payload);
      
      setSuccess(true);
      
      // Redirect to the new publication after 2 seconds
      setTimeout(() => {
        router.push(`/publications/${result.id}`);
      }, 2000);

    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      
      if (error.status === 400 && error.data?.error) {
        // Erreur de validation spécifique
        setErrors({ general: error.data.error });
      } else if (error.status === 401) {
        // Non authentifié
        setErrors({ general: 'Vous devez être connecté pour publier une annonce' });
        router.push('/auth/login');
      } else if (error.status === 403) {
        // Non autorisé
        setErrors({ general: 'Vous n\'êtes pas autorisé à effectuer cette action' });
      } else {
        // Erreur générique
        setErrors({ general: 'Une erreur est survenue lors de la publication. Veuillez réessayer.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-2xl mx-auto p-6 pt-24">
          <div className="bg-green-900/20 border border-green-500/20 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="bg-green-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-green-400 mb-4">Publication créée avec succès !</h2>
            <p className="text-green-300 mb-6 text-lg">Votre annonce est maintenant visible par les autres utilisateurs.</p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-3"></div>
              <p className="text-green-500">Redirection en cours...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto p-6 pt-24">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-8 relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='37' cy='37' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            ></div>
            <div className="relative">
              <h1 className="text-4xl font-bold text-white mb-3">Publier une annonce</h1>
              <p className="text-blue-100/90 text-lg">Partagez votre matériel avec la communauté</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {errors.general && (
              <div className="bg-red-900/20 border border-red-500/30 backdrop-blur-sm rounded-xl p-4 flex items-center text-red-300">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-red-400" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Titre */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <FileText className="w-4 h-4 mr-2 text-blue-400" />
                Titre de l'annonce *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Perceuse sans fil Bosch"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400 ${
                  errors.title ? 'border-red-500/50 bg-red-900/10' : 'border-gray-600/50 hover:border-gray-500/50'
                }`}
              />
              {errors.title && <p className="text-red-400 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez votre matériel, son état, ses caractéristiques..."
                rows={5}
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all text-white placeholder-gray-400 ${
                  errors.description ? 'border-red-500/50 bg-red-900/10' : 'border-gray-600/50 hover:border-gray-500/50'
                }`}
              />
              {errors.description && <p className="text-red-400 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.description}</p>}
            </div>

            {/* Catégorie et État */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center text-sm font-medium text-gray-300">
                  <Tag className="w-4 h-4 mr-2 text-blue-400" />
                  Catégorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white ${
                    errors.category ? 'border-red-500/50 bg-red-900/10' : 'border-gray-600/50 hover:border-gray-500/50'
                  }`}
                >
                  <option value="" className="bg-gray-800">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value} className="bg-gray-800">{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.category}</p>}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  État du matériel
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-500/50 transition-all text-white"
                >
                  {conditions.map(condition => (
                    <option key={condition.value} value={condition.value} className="bg-gray-800">{condition.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prix et Caution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center text-sm font-medium text-gray-300">
                  <Euro className="w-4 h-4 mr-2 text-blue-400" />
                  Prix par jour (€) *
                </label>
                <input
                  type="number"
                  name="price_per_day"
                  value={formData.price_per_day}
                  onChange={handleInputChange}
                  placeholder="Ex: 15"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400 ${
                    errors.price_per_day ? 'border-red-500/50 bg-red-900/10' : 'border-gray-600/50 hover:border-gray-500/50'
                  }`}
                />
                {errors.price_per_day && <p className="text-red-400 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.price_per_day}</p>}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Caution demandée (€)
                </label>
                <input
                  type="number"
                  name="deposit_required"
                  value={formData.deposit_required}
                  onChange={handleInputChange}
                  placeholder="Ex: 50 (optionnel)"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-500/50 transition-all text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Localisation */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                Localisation *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ex: Paris 15ème, Marseille, Lyon..."
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400 ${
                  errors.location ? 'border-red-500/50 bg-red-900/10' : 'border-gray-600/50 hover:border-gray-500/50'
                }`}
              />
              {errors.location && <p className="text-red-400 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.location}</p>}
            </div>

            {/* Images */}
            <div className="space-y-4">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <Camera className="w-4 h-4 mr-2 text-blue-400" />
                Photos du matériel
              </label>
              <div className="space-y-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="https://exemple.com/image.jpg"
                      className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-500/50 transition-all text-white placeholder-gray-400"
                    />
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="px-3 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-red-500/20 hover:border-red-500/40"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  + Ajouter une autre photo
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Ajoutez des URLs d'images pour présenter votre matériel
              </p>
            </div>

            {/* Bouton de soumission */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white py-4 px-6 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-lg shadow-lg hover:shadow-blue-500/25 border border-blue-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publication en cours...
                  </span>
                ) : (
                  'Publier l\'annonce'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationForm;