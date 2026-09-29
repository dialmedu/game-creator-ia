import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'es' | 'en';

export interface Translations {
  nav: {
    whatWeDo: string;
    games: string;
    create: string;
    about: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    cta: string;
    secondaryCta: string;
  };
  whatWeDo: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  gamesSection: {
    title: string;
    subtitle: string;
    play: string;
    noGames: string;
    topScore: string;
    category: string;
  };
  createGame: {
    title: string;
    subtitle: string;
    yourName: string;
    yourEmail: string;
    projectType: string;
    projectTypeStory: string;
    projectTypeBook: string;
    projectTypeCampaign: string;
    projectTypeOther: string;
    projectTitle: string;
    projectDescription: string;
    targetAudience: string;
    budget: string;
    timeline: string;
    sendVia: string;
    gmail: string;
    outlook: string;
    copyText: string;
    copied: string;
    required: string;
    fillRequired: string;
  };
  about: {
    title: string;
    subtitle: string;
    diegoName: string;
    diegoRole: string;
    diegoBio: string;
    victorName: string;
    victorRole: string;
    victorBio: string;
    visitSite: string;
  };
  footer: {
    rights: string;
    tagline: string;
  };
  gamePage: {
    back: string;
    openInTab: string;
    notFound: string;
  };
}

const es: Translations = {
  nav: {
    whatWeDo: 'Que hacemos',
    games: 'Juegos',
    create: 'Crear mi juego',
    about: 'Sobre nosotros',
  },
  hero: {
    badge: 'Contamos historias a traves de videojuegos',
    title: 'Imperium Games',
    subtitle: 'Tu historia, convertida en juego',
    description:
      'Convertimos la historia de tu empresa, tu libro o tu campana en un videojuego inmersivo. Tu envias la narrativa, nosotros creamos la experiencia.',
    cta: 'Crear mi juego',
    secondaryCta: 'Ver juegos',
  },
  whatWeDo: {
    title: 'Como funciona',
    subtitle: 'Tres pasos para convertir tu historia en un videojuego',
    step1Title: '1. Cuentanos tu historia',
    step1Desc:
      'Nos envias el texto, la historia de tu empresa, tu libro o la campana que quieres contar. Toda la narrativa que quieres convertir en juego.',
    step2Title: '2. Creamos el videojuego',
    step2Desc:
      'Nuestro equipo disenara y desarrollara un videojuego unico basado en tu historia, con mecanicas, personajes y mundos que reflejen tu mensaje.',
    step3Title: '3. Recibe tu juego',
    step3Desc:
      'Te entregamos un videojuego completamente funcional que puedes compartir con tu audiencia, clientes o lectores.',
  },
  gamesSection: {
    title: 'Nuestros juegos',
    subtitle: 'Explora los videojuegos disponibles en nuestra plataforma',
    play: 'Jugar',
    noGames: 'No hay juegos disponibles aun.',
    topScore: 'Mejor puntaje',
    category: 'Categoria',
  },
  createGame: {
    title: 'Crea tu videojuego',
    subtitle: 'Completa el formulario y envianos los detalles por correo electronico',
    yourName: 'Tu nombre',
    yourEmail: 'Tu correo electronico',
    projectType: 'Tipo de proyecto',
    projectTypeStory: 'Historia de empresa',
    projectTypeBook: 'Libro',
    projectTypeCampaign: 'Campana',
    projectTypeOther: 'Otro',
    projectTitle: 'Titulo del proyecto',
    projectDescription: 'Cuentanos sobre tu historia',
    targetAudience: 'Publico objetivo',
    budget: 'Presupuesto estimado (USD)',
    timeline: 'Plazo deseado',
    sendVia: 'Enviar por',
    gmail: 'Gmail',
    outlook: 'Outlook',
    copyText: 'Copiar texto',
    copied: 'Copiado!',
    required: 'Este campo es obligatorio',
    fillRequired: 'Por favor completa los campos obligatorios',
  },
  about: {
    title: 'Sobre nosotros',
    subtitle: 'El equipo detras de Imperium Games',
    diegoName: 'Diego Mesa',
    diegoRole: 'Desarrollador',
    diegoBio: 'Desarrollador de software especializado en arquitectura de videojuegos y experiencias interactivas.',
    victorName: 'Victor Serrano',
    victorRole: 'Redactor y Narrador',
    victorBio: 'Escritor y redactor creativo. Da vida a las historias que convertimos en mundos jugables.',
    visitSite: 'Visitar sitio',
  },
  footer: {
    rights: 'Todos los derechos reservados.',
    tagline: 'Convertimos historias en videojuegos.',
  },
  gamePage: {
    back: 'Volver',
    openInTab: 'Abrir en pestana nueva',
    notFound: 'Juego no encontrado',
  },
};

const en: Translations = {
  nav: {
    whatWeDo: 'What we do',
    games: 'Games',
    create: 'Create my game',
    about: 'About us',
  },
  hero: {
    badge: 'We tell stories through video games',
    title: 'Imperium Games',
    subtitle: 'Your story, turned into a game',
    description:
      'We transform your company story, book, or campaign into an immersive video game. You send the narrative, we create the experience.',
    cta: 'Create my game',
    secondaryCta: 'View games',
  },
  whatWeDo: {
    title: 'How it works',
    subtitle: 'Three steps to turn your story into a video game',
    step1Title: '1. Tell us your story',
    step1Desc:
      'Send us the text, your company story, your book, or the campaign you want to tell. All the narrative you want to turn into a game.',
    step2Title: '2. We create the video game',
    step2Desc:
      'Our team will design and develop a unique video game based on your story, with mechanics, characters, and worlds that reflect your message.',
    step3Title: '3. Receive your game',
    step3Desc:
      'We deliver a fully functional video game you can share with your audience, clients, or readers.',
  },
  gamesSection: {
    title: 'Our games',
    subtitle: 'Explore the video games available on our platform',
    play: 'Play',
    noGames: 'No games available yet.',
    topScore: 'Top score',
    category: 'Category',
  },
  createGame: {
    title: 'Create your video game',
    subtitle: 'Fill out the form and send us the details via email',
    yourName: 'Your name',
    yourEmail: 'Your email',
    projectType: 'Project type',
    projectTypeStory: 'Company story',
    projectTypeBook: 'Book',
    projectTypeCampaign: 'Campaign',
    projectTypeOther: 'Other',
    projectTitle: 'Project title',
    projectDescription: 'Tell us about your story',
    targetAudience: 'Target audience',
    budget: 'Estimated budget (USD)',
    timeline: 'Desired timeline',
    sendVia: 'Send via',
    gmail: 'Gmail',
    outlook: 'Outlook',
    copyText: 'Copy text',
    copied: 'Copied!',
    required: 'This field is required',
    fillRequired: 'Please fill in the required fields',
  },
  about: {
    title: 'About us',
    subtitle: 'The team behind Imperium Games',
    diegoName: 'Diego Mesa',
    diegoRole: 'Developer',
    diegoBio: 'Software developer specialized in game architecture and interactive experiences.',
    victorName: 'Victor Serrano',
    victorRole: 'Writer & Storyteller',
    victorBio: 'Creative writer and storyteller. He brings to life the stories we turn into playable worlds.',
    visitSite: 'Visit site',
  },
  footer: {
    rights: 'All rights reserved.',
    tagline: 'We turn stories into video games.',
  },
  gamePage: {
    back: 'Back',
    openInTab: 'Open in new tab',
    notFound: 'Game not found',
  },
};

const translations: Record<Lang, Translations> = { es, en };

interface I18nContextValue {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('imperium-lang');
    return stored === 'en' ? 'en' : 'es';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('imperium-lang', l);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
