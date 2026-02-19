export const translations = {
  en: {
    // Site name
    siteName: 'CBStudio Radio',
    
    // Main menu
    home: 'Home',
    listen: 'Listen',
    programs: 'Programs',
    events: 'Events',
    about: 'About',
    contact: 'Contact',
    
    // Search
    search: 'Search',
    
    // Auth
    signIn: 'Sign in',
    signUp: 'Sign up',
    register: 'Sign up',
    login: 'Sign in',
    logout: 'Logout',
    
    // Sign in form
    signInTitle: 'Sign In',
    signInDescription: 'Enter your credentials to access your account',
    email: 'Email',
    enterEmail: 'Enter your email',
    password: 'Password',
    enterPassword: 'Enter your password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
  },
  es: {
    // Site name
    siteName: 'CBStudio Radio',
    
    // Main menu
    home: 'Inicio',
    listen: 'Escucha',
    programs: 'Programas',
    events: 'Próximamente',
    about: 'Quiénes somos',
    contact: 'Contacto',
    
    // Search
    search: 'Busca',
    
    // Auth
    signIn: 'Acceder',
    signUp: 'Registrarse',
    register: 'Registrarse',
    login: 'Acceder',
    logout: 'Cerrar sesión',
    
    // Sign in form
    signInTitle: 'Acceder',
    signInDescription: 'Rellena las Casillas para acceder a tu cuenta',
    email: 'Email',
    enterEmail: 'Escribe tu email',
    password: 'Contraseña',
    enterPassword: 'Escribe tu contraseña',
    rememberMe: 'Recuérdame',
    forgotPassword: '¿Te olvidaste de tu contraseña?',
    noAccount: 'No tengo cuenta',
    haveAccount: 'Ya tengo cuenta',
  }
};

export type Language = 'en' | 'es';

export const getTranslation = (key: string, lang: Language = 'es') => {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};
