export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return "L'email est requis"
  if (!emailRegex.test(email)) return "Format d'email invalide"
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return "Le mot de passe est requis"
  if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères"
  if (!/(?=.*[a-z])/.test(password)) return "Le mot de passe doit contenir au moins une minuscule"
  if (!/(?=.*[A-Z])/.test(password)) return "Le mot de passe doit contenir au moins une majuscule"
  if (!/(?=.*\d)/.test(password)) return "Le mot de passe doit contenir au moins un chiffre"
  return null
}

export const validateName = (name: string, fieldName: string): string | null => {
  if (!name) return `${fieldName} est requis`
  if (name.length < 2) return `${fieldName} doit contenir au moins 2 caractères`
  return null
}
