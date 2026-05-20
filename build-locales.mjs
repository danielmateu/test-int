import fs from 'fs';
import path from 'path';

const locales = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];

const messages = {
  es: {
    Common: {
      appName: "CV AI Builder"
    },
    Navigation: {
      dashboard: "Mi Panel",
      login: "Iniciar Sesión",
      register: "Registrarse",
      logout: "Cerrar Sesión",
      startFree: "Empezar Gratis",
      demo: "Demo"
    },
    LanguageSwitcher: {
      es: "Español",
      en: "English",
      fr: "Français",
      de: "Deutsch",
      it: "Italiano",
      pt: "Português",
      ca: "Català"
    },
    Dashboard: {
      title: "Mis Currículums",
      subtitle: "Gestiona tus CVs y crea nuevos",
      used: "usados",
      logout: "Cerrar sesión",
      updated: "Actualizado:",
      edit: "Editar",
      createNew: "Crear Nuevo CV",
      available: "disponibles",
      limitReached: "Límite alcanzado",
      limitMsg: "Has alcanzado el límite de 4 CVs gratuitos. Pronto podrás acceder a más mediante suscripción.",
      deleteConfirm: "¿Seguro que quieres eliminar este CV? Esta acción no se puede deshacer.",
      deleteSuccess: "CV eliminado correctamente",
      deleteError: "Error al eliminar el CV"
    },
    LandingPage: {
      heroBadge: "La nueva era de los currículums",
      heroTitle1: "Crea tu currículum perfecto en",
      heroTitle2: "cuestión de minutos",
      heroSubtitle: "Nuestra herramienta impulsada por IA maquetará tu CV en tiempo real con un diseño profesional, destacando lo mejor de ti.",
      createCVFree: "Crear mi CV gratis",
      tryInteractiveDemo: "Probar Demo Interactiva",
      featuresTitle: "Herramientas Premium",
      featuresSubtitle: "Todo el poder de un diseñador profesional, simplificado en una interfaz intuitiva.",
      f1Title: "Diseño en Tiempo Real",
      f1Desc: "Previsualiza instantáneamente cada cambio. Ajusta tipografías, colores y espaciados sin recargar la página.",
      f2Title: "Asistencia de IA",
      f2Desc: "Genera resúmenes y descripciones impactantes con un solo clic.",
      f3Title: "Exportación Perfecta",
      f3Desc: "PDFs optimizados para ATS (Sistemas de Seguimiento de Candidatos), en formato A4 perfecto.",
      f4Title: "Rendimiento Extremo",
      f4Desc: "Aplicación rápida, fluida y segura. Tu información se guarda automáticamente en la nube.",
      howItWorks: "Cómo Funciona",
      howItWorksSubtitle: "Tres simples pasos para conseguir el trabajo de tus sueños.",
      step1Title: "1. Completa tu Perfil",
      step1Desc: "Introduce tus datos, experiencia y educación en nuestros formularios guiados. La IA puede ayudarte a redactar tus logros.",
      step2Title: "2. Personaliza el Diseño",
      step2Desc: "Elige entre múltiples plantillas profesionales. Cambia colores, tipografías y el orden de las secciones en tiempo real.",
      step3Title: "3. Descarga y Triunfa",
      step3Desc: "Exporta tu CV en un PDF perfecto y listo para imprimir, sin marcas de agua ni bordes extraños.",
      ctaTitle: "¿Listo para destacar?",
      ctaSubtitle: "Únete a miles de profesionales que ya han mejorado sus oportunidades laborales con un currículum impactante.",
      rights: "Todos los derechos reservados."
    },
    CVForm: {
      title: "Tu Información",
      subtitle: "Completa los datos para generar tu CV profesional.",
      personalInfo: {
        title: "Datos Personales",
        photo: "Foto de Perfil",
        uploadPhoto: "Subir foto",
        deletePhoto: "Eliminar foto",
        photoSuccess: "Foto de perfil subida correctamente",
        photoError: "Error al subir la imagen",
        photoSizeError: "La imagen es demasiado grande. Máximo 5MB.",
        fullName: "Nombre Completo",
        fullNamePlaceholder: "Ej. Juan Pérez",
        jobTitle: "Título Profesional",
        jobTitlePlaceholder: "Ej. Desarrollador Frontend",
        email: "Email",
        phone: "Teléfono",
        location: "Ubicación",
        locationPlaceholder: "Madrid, España",
        github: "GitHub URL",
        linkedin: "LinkedIn URL",
        portfolio: "Portfolio URL",
        twitter: "X (Twitter) URL",
        summary: "Perfil Profesional",
        summaryPlaceholder: "Breve descripción de tu perfil y objetivos..."
      },
      experience: {
        title: "Experiencia",
        add: "Añadir",
        empty: "No has añadido experiencia todavía.",
        company: "Empresa",
        companyPlaceholder: "Nombre de la empresa",
        role: "Puesto",
        rolePlaceholder: "Ej. Software Engineer",
        startDate: "Fecha Inicio",
        endDate: "Fecha Fin",
        current: "Actual",
        description: "Descripción",
        descriptionPlaceholder: "Describe tus responsabilidades y logros..."
      },
      education: {
        title: "Educación",
        add: "Añadir",
        empty: "No has añadido educación todavía.",
        institution: "Institución",
        institutionPlaceholder: "Universidad o Centro",
        degree: "Titulación",
        degreePlaceholder: "Ej. Grado en Ingeniería Informática",
        startDate: "Fecha Inicio",
        endDate: "Fecha Fin",
        current: "Actual",
        description: "Descripción (opcional)",
        descriptionPlaceholder: "Describe los logros, proyectos o habilidades adquiridas..."
      },
      skills: {
        title: "Habilidades",
        label: "Tus habilidades (separadas por comas)",
        placeholder: "React, TypeScript, Node.js, Diseño UI..."
      },
      coverLetter: {
        title: "Carta de Presentación",
        label: "Contenido de la carta (opcional)",
        placeholder: "Escribe aquí tu carta de presentación..."
      }
    },
    CVPreview: {
      sections: {
        summary: "Perfil Profesional",
        experience: "Experiencia Profesional",
        education: "Educación",
        skills: "Habilidades",
        contact: "Contacto",
        coverLetter: "Carta de Presentación"
      },
      dates: {
        present: "Actualidad"
      }
    }
  },
  en: {
    Common: { appName: "CV AI Builder" },
    Navigation: {
      dashboard: "My Dashboard", login: "Log In", register: "Sign Up", logout: "Log Out", startFree: "Start for Free", demo: "Demo"
    },
    LanguageSwitcher: { es: "Español", en: "English", fr: "Français", de: "Deutsch", it: "Italiano", pt: "Português", ca: "Català" },
    Dashboard: {
      title: "My Resumes", subtitle: "Manage your CVs and create new ones", used: "used", logout: "Sign out", updated: "Updated:", edit: "Edit", createNew: "Create New CV", available: "available", limitReached: "Limit reached", limitMsg: "You have reached the limit of 4 free CVs. You will soon be able to access more via subscription.", deleteConfirm: "Are you sure you want to delete this CV? This action cannot be undone.", deleteSuccess: "CV successfully deleted", deleteError: "Error deleting CV"
    },
    LandingPage: {
      heroBadge: "The new era of resumes", heroTitle1: "Create your perfect resume in", heroTitle2: "a matter of minutes", heroSubtitle: "Our AI-powered tool will layout your CV in real time with a professional design, highlighting the best of you.", createCVFree: "Create my CV for free", tryInteractiveDemo: "Try Interactive Demo", featuresTitle: "Premium Tools", featuresSubtitle: "All the power of a professional designer, simplified in an intuitive interface.", f1Title: "Real-Time Design", f1Desc: "Instantly preview every change. Adjust typography, colors, and spacing without reloading the page.", f2Title: "AI Assistance", f2Desc: "Generate impactful summaries and descriptions with a single click.", f3Title: "Perfect Export", f3Desc: "PDFs optimized for ATS (Applicant Tracking Systems), in perfect A4 format.", f4Title: "Extreme Performance", f4Desc: "Fast, fluid, and secure application. Your information is automatically saved in the cloud.", howItWorks: "How It Works", howItWorksSubtitle: "Three simple steps to land your dream job.", step1Title: "1. Complete your Profile", step1Desc: "Enter your details, experience, and education in our guided forms. AI can help you draft your achievements.", step2Title: "2. Customize the Design", step2Desc: "Choose from multiple professional templates. Change colors, typography, and the order of sections in real time.", step3Title: "3. Download and Succeed", step3Desc: "Export your CV in a perfect, print-ready PDF, without watermarks or weird borders.", ctaTitle: "Ready to stand out?", ctaSubtitle: "Join thousands of professionals who have already improved their career opportunities with an impactful resume.", rights: "All rights reserved."
    },
    CVForm: {
      title: "Your Information", subtitle: "Fill in the details to generate your professional CV.",
      personalInfo: {
        title: "Personal Details", photo: "Profile Photo", uploadPhoto: "Upload photo", deletePhoto: "Delete photo", photoSuccess: "Profile photo uploaded successfully", photoError: "Error uploading image", photoSizeError: "Image is too large. Maximum 5MB.", fullName: "Full Name", fullNamePlaceholder: "E.g. John Doe", jobTitle: "Professional Title", jobTitlePlaceholder: "E.g. Frontend Developer", email: "Email", phone: "Phone", location: "Location", locationPlaceholder: "London, UK", github: "GitHub URL", linkedin: "LinkedIn URL", portfolio: "Portfolio URL", twitter: "X (Twitter) URL", summary: "Professional Profile", summaryPlaceholder: "Brief description of your profile and goals..."
      },
      experience: { title: "Experience", add: "Add", empty: "You haven't added any experience yet.", company: "Company", companyPlaceholder: "Company name", role: "Role", rolePlaceholder: "E.g. Software Engineer", startDate: "Start Date", endDate: "End Date", current: "Current", description: "Description", descriptionPlaceholder: "Describe your responsibilities and achievements..." },
      education: { title: "Education", add: "Add", empty: "You haven't added any education yet.", institution: "Institution", institutionPlaceholder: "University or Center", degree: "Degree", degreePlaceholder: "E.g. Bachelor in Computer Science", startDate: "Start Date", endDate: "End Date", current: "Current", description: "Description (optional)", descriptionPlaceholder: "Describe your achievements, projects, or skills acquired..." },
      skills: { title: "Skills", label: "Your skills (comma separated)", placeholder: "React, TypeScript, Node.js, UI Design..." },
      coverLetter: { title: "Cover Letter", label: "Letter content (optional)", placeholder: "Write your cover letter here..." }
    },
    CVPreview: {
      sections: { summary: "Professional Profile", experience: "Professional Experience", education: "Education", skills: "Skills", contact: "Contact", coverLetter: "Cover Letter" },
      dates: { present: "Present" }
    }
  },
  // We will generate the rest using minimal fallback for now (copy english/spanish), 
  // but to be professional, let's just create generic structures or minimal translations for fr, de, it, pt, ca.
  // Using English as fallback for missing translations to save space, but next-intl requires the keys.
};

const defaultDict = messages.en;

for (const lang of locales) {
  if (lang !== 'es' && lang !== 'en') {
    messages[lang] = JSON.parse(JSON.stringify(defaultDict));
  }
}

// Simple translation overrides for demonstration (in a real app, these would be fully translated)
messages.fr.Navigation.login = "Connexion";
messages.fr.Navigation.register = "S'inscrire";
messages.de.Navigation.login = "Anmelden";
messages.de.Navigation.register = "Registrieren";
messages.it.Navigation.login = "Accedi";
messages.pt.Navigation.login = "Entrar";
messages.ca.Navigation.login = "Iniciar Sessió";
messages.ca.Navigation.register = "Registrar-se";

const dir = path.join(process.cwd(), 'messages');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

for (const lang of locales) {
  fs.writeFileSync(
    path.join(dir, `${lang}.json`),
    JSON.stringify(messages[lang], null, 2)
  );
  console.log(`Generated ${lang}.json`);
}
