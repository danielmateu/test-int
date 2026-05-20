import fs from 'fs';
import path from 'path';

const fr = {
  Common: { appName: "CV AI Builder" },
  Navigation: { dashboard: "Mon Tableau de Bord", login: "Connexion", register: "S'inscrire", logout: "Déconnexion", startFree: "Commencer Gratuitement", demo: "Démo" },
  LanguageSwitcher: { es: "Español", en: "English", fr: "Français", de: "Deutsch", it: "Italiano", pt: "Português", ca: "Català" },
  Dashboard: {
    title: "Mes CVs", subtitle: "Gérez vos CVs et créez-en de nouveaux", used: "utilisés", logout: "Déconnexion", updated: "Mis à jour:", edit: "Modifier", createNew: "Créer un nouveau CV", available: "disponibles", limitReached: "Limite atteinte", limitMsg: "Vous avez atteint la limite de 4 CVs gratuits. Vous pourrez bientôt en faire plus avec un abonnement.", deleteConfirm: "Êtes-vous sûr de vouloir supprimer ce CV ? Cette action est irréversible.", deleteSuccess: "CV supprimé avec succès", deleteError: "Erreur lors de la suppression du CV"
  },
  LandingPage: {
    heroBadge: "La nouvelle ère des CV", heroTitle1: "Créez votre CV parfait en", heroTitle2: "quelques minutes", heroSubtitle: "Notre outil propulsé par l'IA mettra en page votre CV en temps réel avec un design professionnel, mettant en valeur le meilleur de vous-même.", createCVFree: "Créer mon CV gratuitement", tryInteractiveDemo: "Essayer la démo interactive", featuresTitle: "Outils Premium", featuresSubtitle: "Toute la puissance d'un designer professionnel, simplifiée dans une interface intuitive.", f1Title: "Design en temps réel", f1Desc: "Prévisualisez instantanément chaque changement. Ajustez la typographie, les couleurs et l'espacement sans recharger la page.", f2Title: "Assistance IA", f2Desc: "Générez des résumés et des descriptions percutants en un seul clic.", f3Title: "Exportation parfaite", f3Desc: "PDF optimisés pour ATS (Applicant Tracking Systems), au format A4 parfait.", f4Title: "Performance extrême", f4Desc: "Application rapide, fluide et sécurisée. Vos informations sont automatiquement sauvegardées dans le cloud.", howItWorks: "Comment ça marche", howItWorksSubtitle: "Trois étapes simples pour décrocher le job de vos rêves.", step1Title: "1. Complétez votre profil", step1Desc: "Saisissez vos coordonnées, votre expérience et votre formation dans nos formulaires guidés. L'IA peut vous aider à rédiger vos réalisations.", step2Title: "2. Personnalisez le design", step2Desc: "Choisissez parmi plusieurs modèles professionnels. Modifiez les couleurs, la typographie et l'ordre des sections en temps réel.", step3Title: "3. Téléchargez et réussissez", step3Desc: "Exportez votre CV dans un PDF parfait et prêt à imprimer, sans filigrane ni bordures étranges.", ctaTitle: "Prêt à vous démarquer ?", ctaSubtitle: "Rejoignez des milliers de professionnels qui ont déjà amélioré leurs opportunités de carrière avec un CV percutant.", rights: "Tous droits réservés."
  },
  CVForm: {
    title: "Vos Informations", subtitle: "Remplissez les détails pour générer votre CV professionnel.",
    personalInfo: {
      title: "Données Personnelles", photo: "Photo de Profil", uploadPhoto: "Télécharger la photo", deletePhoto: "Supprimer la photo", photoSuccess: "Photo de profil téléchargée avec succès", photoError: "Erreur lors du téléchargement de l'image", photoSizeError: "L'image est trop grande. Maximum 5 Mo.", fullName: "Nom Complet", fullNamePlaceholder: "Ex. Jean Dupont", jobTitle: "Titre Professionnel", jobTitlePlaceholder: "Ex. Développeur Frontend", email: "Email", phone: "Téléphone", location: "Localisation", locationPlaceholder: "Paris, France", github: "URL GitHub", linkedin: "URL LinkedIn", portfolio: "URL du Portfolio", twitter: "URL X (Twitter)", summary: "Profil Professionnel", summaryPlaceholder: "Brève description de votre profil et de vos objectifs..."
    },
    experience: { title: "Expérience", add: "Ajouter", empty: "Vous n'avez pas encore ajouté d'expérience.", company: "Entreprise", companyPlaceholder: "Nom de l'entreprise", role: "Poste", rolePlaceholder: "Ex. Ingénieur Logiciel", startDate: "Date de début", endDate: "Date de fin", current: "Actuel", description: "Description", descriptionPlaceholder: "Décrivez vos responsabilités et vos réalisations..." },
    education: { title: "Éducation", add: "Ajouter", empty: "Vous n'avez pas encore ajouté de formation.", institution: "Institution", institutionPlaceholder: "Université ou École", degree: "Diplôme", degreePlaceholder: "Ex. Licence en Informatique", startDate: "Date de début", endDate: "Date de fin", current: "Actuel", description: "Description (facultatif)", descriptionPlaceholder: "Décrivez vos réalisations, projets ou compétences acquises..." },
    skills: { title: "Compétences", label: "Vos compétences (séparées par des virgules)", placeholder: "React, TypeScript, Node.js, Design UI..." },
    coverLetter: { title: "Lettre de Motivation", label: "Contenu de la lettre (facultatif)", placeholder: "Rédigez votre lettre de motivation ici..." }
  },
  CVPreview: {
    sections: { summary: "Profil Professionnel", experience: "Expérience Professionnelle", education: "Éducation", skills: "Compétences", contact: "Contact", coverLetter: "Lettre de Motivation" },
    dates: { present: "Présent" }
  }
};

const de = {
  Common: { appName: "CV AI Builder" },
  Navigation: { dashboard: "Mein Dashboard", login: "Anmelden", register: "Registrieren", logout: "Abmelden", startFree: "Kostenlos starten", demo: "Demo" },
  LanguageSwitcher: { es: "Español", en: "English", fr: "Français", de: "Deutsch", it: "Italiano", pt: "Português", ca: "Català" },
  Dashboard: {
    title: "Meine Lebensläufe", subtitle: "Verwalten Sie Ihre Lebensläufe und erstellen Sie neue", used: "verwendet", logout: "Abmelden", updated: "Aktualisiert:", edit: "Bearbeiten", createNew: "Neuen Lebenslauf erstellen", available: "verfügbar", limitReached: "Limit erreicht", limitMsg: "Sie haben das Limit von 4 kostenlosen Lebensläufen erreicht. Mit einem Abonnement erhalten Sie bald mehr.", deleteConfirm: "Sind Sie sicher, dass Sie diesen Lebenslauf löschen möchten? Dies kann nicht rückgängig gemacht werden.", deleteSuccess: "Lebenslauf erfolgreich gelöscht", deleteError: "Fehler beim Löschen des Lebenslaufs"
  },
  LandingPage: {
    heroBadge: "Die neue Ära der Lebensläufe", heroTitle1: "Erstellen Sie Ihren perfekten Lebenslauf in", heroTitle2: "wenigen Minuten", heroSubtitle: "Unser KI-gestütztes Tool formatiert Ihren Lebenslauf in Echtzeit mit einem professionellen Design und hebt das Beste an Ihnen hervor.", createCVFree: "Meinen Lebenslauf kostenlos erstellen", tryInteractiveDemo: "Interaktive Demo ausprobieren", featuresTitle: "Premium-Tools", featuresSubtitle: "Die gesamte Leistung eines professionellen Designers, vereinfacht in einer intuitiven Benutzeroberfläche.", f1Title: "Echtzeit-Design", f1Desc: "Sehen Sie jede Änderung sofort. Passen Sie Typografie, Farben und Abstände an, ohne die Seite neu zu laden.", f2Title: "KI-Unterstützung", f2Desc: "Erstellen Sie mit einem einzigen Klick aussagekräftige Zusammenfassungen und Beschreibungen.", f3Title: "Perfekter Export", f3Desc: "PDFs optimiert für ATS (Bewerbermanagement-Systeme) im perfekten A4-Format.", f4Title: "Extreme Leistung", f4Desc: "Schnelle, flüssige und sichere Anwendung. Ihre Informationen werden automatisch in der Cloud gespeichert.", howItWorks: "Wie es funktioniert", howItWorksSubtitle: "Drei einfache Schritte zu Ihrem Traumjob.", step1Title: "1. Profil vervollständigen", step1Desc: "Geben Sie Ihre Daten, Erfahrungen und Ausbildung in unsere geführten Formulare ein. Die KI kann Ihnen beim Verfassen Ihrer Erfolge helfen.", step2Title: "2. Design anpassen", step2Desc: "Wählen Sie aus mehreren professionellen Vorlagen. Ändern Sie Farben, Typografie und die Reihenfolge der Abschnitte in Echtzeit.", step3Title: "3. Herunterladen und erfolgreich sein", step3Desc: "Exportieren Sie Ihren Lebenslauf in ein perfektes, druckfertiges PDF ohne Wasserzeichen oder seltsame Ränder.", ctaTitle: "Bereit aufzufallen?", ctaSubtitle: "Schließen Sie sich Tausenden von Fachleuten an, die ihre Karrierechancen bereits mit einem beeindruckenden Lebenslauf verbessert haben.", rights: "Alle Rechte vorbehalten."
  },
  CVForm: {
    title: "Ihre Informationen", subtitle: "Geben Sie die Details ein, um Ihren professionellen Lebenslauf zu erstellen.",
    personalInfo: {
      title: "Persönliche Daten", photo: "Profilbild", uploadPhoto: "Foto hochladen", deletePhoto: "Foto löschen", photoSuccess: "Profilbild erfolgreich hochgeladen", photoError: "Fehler beim Hochladen des Bildes", photoSizeError: "Das Bild ist zu groß. Maximal 5 MB.", fullName: "Vollständiger Name", fullNamePlaceholder: "Z. B. Max Mustermann", jobTitle: "Berufsbezeichnung", jobTitlePlaceholder: "Z. B. Frontend-Entwickler", email: "E-Mail", phone: "Telefon", location: "Standort", locationPlaceholder: "Berlin, Deutschland", github: "GitHub-URL", linkedin: "LinkedIn-URL", portfolio: "Portfolio-URL", twitter: "X (Twitter)-URL", summary: "Berufsprofil", summaryPlaceholder: "Kurze Beschreibung Ihres Profils und Ihrer Ziele..."
    },
    experience: { title: "Berufserfahrung", add: "Hinzufügen", empty: "Sie haben noch keine Erfahrung hinzugefügt.", company: "Unternehmen", companyPlaceholder: "Name des Unternehmens", role: "Position", rolePlaceholder: "Z. B. Softwareentwickler", startDate: "Startdatum", endDate: "Enddatum", current: "Aktuell", description: "Beschreibung", descriptionPlaceholder: "Beschreiben Sie Ihre Aufgaben und Erfolge..." },
    education: { title: "Bildung", add: "Hinzufügen", empty: "Sie haben noch keine Ausbildung hinzugefügt.", institution: "Einrichtung", institutionPlaceholder: "Universität oder Zentrum", degree: "Abschluss", degreePlaceholder: "Z. B. Bachelor in Informatik", startDate: "Startdatum", endDate: "Enddatum", current: "Aktuell", description: "Beschreibung (optional)", descriptionPlaceholder: "Beschreiben Sie Erfolge, Projekte oder erworbene Fähigkeiten..." },
    skills: { title: "Fähigkeiten", label: "Ihre Fähigkeiten (durch Kommas getrennt)", placeholder: "React, TypeScript, Node.js, UI-Design..." },
    coverLetter: { title: "Anschreiben", label: "Inhalt des Schreibens (optional)", placeholder: "Schreiben Sie hier Ihr Anschreiben..." }
  },
  CVPreview: {
    sections: { summary: "Berufsprofil", experience: "Berufserfahrung", education: "Bildung", skills: "Fähigkeiten", contact: "Kontakt", coverLetter: "Anschreiben" },
    dates: { present: "Heute" }
  }
};

const it = {
  Common: { appName: "CV AI Builder" },
  Navigation: { dashboard: "La Mia Bacheca", login: "Accedi", register: "Registrati", logout: "Esci", startFree: "Inizia Gratis", demo: "Demo" },
  LanguageSwitcher: { es: "Español", en: "English", fr: "Français", de: "Deutsch", it: "Italiano", pt: "Português", ca: "Català" },
  Dashboard: {
    title: "I Miei CV", subtitle: "Gestisci i tuoi CV e creane di nuovi", used: "usati", logout: "Disconnetti", updated: "Aggiornato:", edit: "Modifica", createNew: "Crea Nuovo CV", available: "disponibili", limitReached: "Limite raggiunto", limitMsg: "Hai raggiunto il limite di 4 CV gratuiti. Presto potrai accedervi di più tramite abbonamento.", deleteConfirm: "Sei sicuro di voler eliminare questo CV? Questa azione non può essere annullata.", deleteSuccess: "CV eliminato con successo", deleteError: "Errore durante l'eliminazione del CV"
  },
  LandingPage: {
    heroBadge: "La nuova era dei curriculum", heroTitle1: "Crea il tuo curriculum perfetto in", heroTitle2: "pochi minuti", heroSubtitle: "Il nostro strumento basato sull'IA impaginerà il tuo CV in tempo reale con un design professionale, mettendo in risalto il meglio di te.", createCVFree: "Crea il mio CV gratis", tryInteractiveDemo: "Prova Demo Interattiva", featuresTitle: "Strumenti Premium", featuresSubtitle: "Tutta la potenza di un designer professionista, semplificata in un'interfaccia intuitiva.", f1Title: "Design in Tempo Reale", f1Desc: "Vedi immediatamente ogni modifica. Regola la tipografia, i colori e la spaziatura senza ricaricare la pagina.", f2Title: "Assistenza IA", f2Desc: "Genera riassunti e descrizioni d'impatto con un solo clic.", f3Title: "Esportazione Perfetta", f3Desc: "PDF ottimizzati per ATS (Sistemi di Tracciamento dei Candidati), in perfetto formato A4.", f4Title: "Prestazioni Estreme", f4Desc: "Applicazione veloce, fluida e sicura. Le tue informazioni vengono salvate automaticamente nel cloud.", howItWorks: "Come Funziona", howItWorksSubtitle: "Tre semplici passi per ottenere il lavoro dei tuoi sogni.", step1Title: "1. Completa il tuo Profilo", step1Desc: "Inserisci i tuoi dati, la tua esperienza e la tua istruzione nei nostri moduli guidati. L'IA può aiutarti a scrivere i tuoi risultati.", step2Title: "2. Personalizza il Design", step2Desc: "Scegli tra molti modelli professionali. Cambia i colori, la tipografia e l'ordine delle sezioni in tempo reale.", step3Title: "3. Scarica e Trionfa", step3Desc: "Esporta il tuo CV in un PDF perfetto e pronto per la stampa, senza filigrane o bordi strani.", ctaTitle: "Pronto a distinguerti?", ctaSubtitle: "Unisciti a migliaia di professionisti che hanno già migliorato le loro opportunità di carriera con un curriculum d'impatto.", rights: "Tutti i diritti riservati."
  },
  CVForm: {
    title: "Le Tue Informazioni", subtitle: "Compila i dettagli per generare il tuo CV professionale.",
    personalInfo: {
      title: "Dati Personali", photo: "Foto Profilo", uploadPhoto: "Carica foto", deletePhoto: "Elimina foto", photoSuccess: "Foto profilo caricata con successo", photoError: "Errore durante il caricamento dell'immagine", photoSizeError: "L'immagine è troppo grande. Massimo 5 MB.", fullName: "Nome Completo", fullNamePlaceholder: "Es. Mario Rossi", jobTitle: "Qualifica Professionale", jobTitlePlaceholder: "Es. Sviluppatore Frontend", email: "Email", phone: "Telefono", location: "Posizione", locationPlaceholder: "Roma, Italia", github: "URL GitHub", linkedin: "URL LinkedIn", portfolio: "URL Portfolio", twitter: "URL X (Twitter)", summary: "Profilo Professionale", summaryPlaceholder: "Breve descrizione del tuo profilo e dei tuoi obiettivi..."
    },
    experience: { title: "Esperienza", add: "Aggiungi", empty: "Non hai ancora aggiunto nessuna esperienza.", company: "Azienda", companyPlaceholder: "Nome dell'azienda", role: "Ruolo", rolePlaceholder: "Es. Ingegnere del Software", startDate: "Data di Inizio", endDate: "Data di Fine", current: "Attuale", description: "Descrizione", descriptionPlaceholder: "Descrivi le tue responsabilità e i tuoi risultati..." },
    education: { title: "Istruzione", add: "Aggiungi", empty: "Non hai ancora aggiunto nessuna istruzione.", institution: "Istituzione", institutionPlaceholder: "Università o Centro", degree: "Titolo di Studio", degreePlaceholder: "Es. Laurea in Informatica", startDate: "Data di Inizio", endDate: "Data di Fine", current: "Attuale", description: "Descrizione (opzionale)", descriptionPlaceholder: "Descrivi i tuoi risultati, progetti o competenze acquisite..." },
    skills: { title: "Competenze", label: "Le tue competenze (separate da virgole)", placeholder: "React, TypeScript, Node.js, UI Design..." },
    coverLetter: { title: "Lettera di Presentazione", label: "Contenuto della lettera (opzionale)", placeholder: "Scrivi qui la tua lettera di presentazione..." }
  },
  CVPreview: {
    sections: { summary: "Profilo Professionale", experience: "Esperienza Professionale", education: "Istruzione", skills: "Competenze", contact: "Contatti", coverLetter: "Lettera di Presentazione" },
    dates: { present: "Oggi" }
  }
};

const pt = {
  Common: { appName: "CV AI Builder" },
  Navigation: { dashboard: "Meu Painel", login: "Entrar", register: "Cadastrar-se", logout: "Sair", startFree: "Começar Grátis", demo: "Demo" },
  LanguageSwitcher: { es: "Español", en: "English", fr: "Français", de: "Deutsch", it: "Italiano", pt: "Português", ca: "Català" },
  Dashboard: {
    title: "Meus Currículos", subtitle: "Gerencie seus currículos e crie novos", used: "usados", logout: "Sair", updated: "Atualizado:", edit: "Editar", createNew: "Criar Novo CV", available: "disponíveis", limitReached: "Limite atingido", limitMsg: "Você atingiu o limite de 4 currículos gratuitos. Em breve você poderá acessar mais através de assinatura.", deleteConfirm: "Tem certeza de que deseja excluir este CV? Esta ação não pode ser desfeita.", deleteSuccess: "CV excluído com sucesso", deleteError: "Erro ao excluir currículo"
  },
  LandingPage: {
    heroBadge: "A nova era dos currículos", heroTitle1: "Crie o seu currículo perfeito em", heroTitle2: "questão de minutos", heroSubtitle: "Nossa ferramenta impulsionada por IA diagramará seu CV em tempo real com um design profissional, destacando o que você tem de melhor.", createCVFree: "Criar meu CV grátis", tryInteractiveDemo: "Testar Demo Interativa", featuresTitle: "Ferramentas Premium", featuresSubtitle: "Todo o poder de um designer profissional, simplificado em uma interface intuitiva.", f1Title: "Design em Tempo Real", f1Desc: "Visualize instantaneamente cada alteração. Ajuste tipografia, cores e espaçamento sem recarregar a página.", f2Title: "Assistência de IA", f2Desc: "Gere resumos e descrições impactantes com um único clique.", f3Title: "Exportação Perfeita", f3Desc: "PDFs otimizados para ATS (Sistemas de Rastreamento de Candidatos), em formato A4 perfeito.", f4Title: "Desempenho Extremo", f4Desc: "Aplicação rápida, fluida e segura. Suas informações são salvas automaticamente na nuvem.", howItWorks: "Como Funciona", howItWorksSubtitle: "Três passos simples para conseguir o emprego dos seus sonhos.", step1Title: "1. Complete seu Perfil", step1Desc: "Insira seus dados, experiência e educação em nossos formulários guiados. A IA pode ajudá-lo a redigir suas conquistas.", step2Title: "2. Personalize o Design", step2Desc: "Escolha entre vários modelos profissionais. Mude cores, tipografia e a ordem das seções em tempo real.", step3Title: "3. Baixe e Tenha Sucesso", step3Desc: "Exporte seu currículo em um PDF perfeito e pronto para impressão, sem marcas d'água ou bordas estranhas.", ctaTitle: "Pronto para se destacar?", ctaSubtitle: "Junte-se a milhares de profissionais que já melhoraram suas oportunidades de carreira com um currículo impactante.", rights: "Todos os direitos reservados."
  },
  CVForm: {
    title: "Suas Informações", subtitle: "Preencha os detalhes para gerar seu CV profissional.",
    personalInfo: {
      title: "Dados Pessoais", photo: "Foto de Perfil", uploadPhoto: "Enviar foto", deletePhoto: "Excluir foto", photoSuccess: "Foto de perfil enviada com sucesso", photoError: "Erro ao enviar imagem", photoSizeError: "A imagem é muito grande. Máximo de 5 MB.", fullName: "Nome Completo", fullNamePlaceholder: "Ex. João Silva", jobTitle: "Título Profissional", jobTitlePlaceholder: "Ex. Desenvolvedor Frontend", email: "Email", phone: "Telefone", location: "Localização", locationPlaceholder: "Lisboa, Portugal", github: "URL do GitHub", linkedin: "URL do LinkedIn", portfolio: "URL do Portfólio", twitter: "URL X (Twitter)", summary: "Perfil Profissional", summaryPlaceholder: "Breve descrição do seu perfil e objetivos..."
    },
    experience: { title: "Experiência", add: "Adicionar", empty: "Você ainda não adicionou experiência.", company: "Empresa", companyPlaceholder: "Nome da empresa", role: "Cargo", rolePlaceholder: "Ex. Engenheiro de Software", startDate: "Data de Início", endDate: "Data de Término", current: "Atual", description: "Descrição", descriptionPlaceholder: "Descreva suas responsabilidades e conquistas..." },
    education: { title: "Educação", add: "Adicionar", empty: "Você ainda não adicionou educação.", institution: "Instituição", institutionPlaceholder: "Universidade ou Centro", degree: "Graduação", degreePlaceholder: "Ex. Bacharelado em Ciência da Computação", startDate: "Data de Início", endDate: "Data de Término", current: "Atual", description: "Descrição (opcional)", descriptionPlaceholder: "Descreva as conquistas, projetos ou habilidades adquiridas..." },
    skills: { title: "Habilidades", label: "Suas habilidades (separadas por vírgulas)", placeholder: "React, TypeScript, Node.js, Design de Interface..." },
    coverLetter: { title: "Carta de Apresentação", label: "Conteúdo da carta (opcional)", placeholder: "Escreva sua carta de apresentação aqui..." }
  },
  CVPreview: {
    sections: { summary: "Perfil Profissional", experience: "Experiência Profissional", education: "Educação", skills: "Habilidades", contact: "Contato", coverLetter: "Carta de Apresentação" },
    dates: { present: "Hoje" }
  }
};

const ca = {
  Common: { appName: "CV AI Builder" },
  Navigation: { dashboard: "El meu tauler", login: "Iniciar Sessió", register: "Registrar-se", logout: "Tancar Sessió", startFree: "Començar de franc", demo: "Demostració" },
  LanguageSwitcher: { es: "Español", en: "English", fr: "Français", de: "Deutsch", it: "Italiano", pt: "Português", ca: "Català" },
  Dashboard: {
    title: "Els meus currículums", subtitle: "Gestiona els teus CVs i crea'n de nous", used: "usats", logout: "Tancar sessió", updated: "Actualitzat:", edit: "Editar", createNew: "Crear Nou CV", available: "disponibles", limitReached: "Límit assolit", limitMsg: "Has arribat al límit de 4 CVs gratuïts. Aviat podràs accedir a més mitjançant subscripció.", deleteConfirm: "Estàs segur que vols eliminar aquest CV? Aquesta acció no es pot desfer.", deleteSuccess: "CV eliminat correctament", deleteError: "Error a l'eliminar el currículum"
  },
  LandingPage: {
    heroBadge: "La nova era dels currículums", heroTitle1: "Crea el teu currículum perfecte en", heroTitle2: "qüestió de minuts", heroSubtitle: "La nostra eina impulsada per IA maquetarà el teu CV en temps real amb un disseny professional, destacant el millor de tu.", createCVFree: "Crear el meu CV de franc", tryInteractiveDemo: "Provar Demo Interactiva", featuresTitle: "Eines Premium", featuresSubtitle: "Tot el poder d'un dissenyador professional, simplificat en una interfície intuïtiva.", f1Title: "Disseny en temps real", f1Desc: "Previsualitza instantàniament cada canvi. Ajusta tipografies, colors i espaiats sense recarregar la pàgina.", f2Title: "Assistència per IA", f2Desc: "Genera resums i descripcions impactants amb un sol clic.", f3Title: "Exportació Perfecta", f3Desc: "PDFs optimitzats per ATS (Sistemes de Seguiment de Candidats), en format A4 perfecte.", f4Title: "Rendiment Extrem", f4Desc: "Aplicació ràpida, fluïda i segura. La teva informació es desa automàticament al núvol.", howItWorks: "Com Funciona", howItWorksSubtitle: "Tres passos simples per aconseguir la feina dels teus somnis.", step1Title: "1. Completa el teu Perfil", step1Desc: "Introdueix les teves dades, experiència i educació als nostres formularis guiats. La IA pot ajudar-te a redactar els teus èxits.", step2Title: "2. Personalitza el Disseny", step2Desc: "Tria entre diverses plantilles professionals. Canvia colors, tipografia i l'ordre de les seccions en temps real.", step3Title: "3. Descarrega i Triomfa", step3Desc: "Exporta el teu CV en un PDF perfecte i llest per imprimir, sense marques d'aigua ni vores estranyes.", ctaTitle: "A punt per destacar?", ctaSubtitle: "Uneix-te a milers de professionals que ja han millorat les seves oportunitats laborals amb un currículum impactant.", rights: "Tots els drets reservats."
  },
  CVForm: {
    title: "La Teva Informació", subtitle: "Omple les dades per generar el teu CV professional.",
    personalInfo: {
      title: "Dades Personals", photo: "Foto de Perfil", uploadPhoto: "Pujar foto", deletePhoto: "Eliminar foto", photoSuccess: "Foto de perfil pujada correctament", photoError: "Error al pujar la imatge", photoSizeError: "La imatge és massa gran. Màxim 5MB.", fullName: "Nom Complet", fullNamePlaceholder: "Ex. Joan Pérez", jobTitle: "Títol Professional", jobTitlePlaceholder: "Ex. Desenvolupador Frontend", email: "Correu electrònic", phone: "Telèfon", location: "Ubicació", locationPlaceholder: "Barcelona, Catalunya", github: "URL de GitHub", linkedin: "URL de LinkedIn", portfolio: "URL del Portafoli", twitter: "URL d'X (Twitter)", summary: "Perfil Professional", summaryPlaceholder: "Breu descripció del teu perfil i objectius..."
    },
    experience: { title: "Experiència", add: "Afegir", empty: "Encara no has afegit experiència.", company: "Empresa", companyPlaceholder: "Nom de l'empresa", role: "Càrrec", rolePlaceholder: "Ex. Enginyer de Programari", startDate: "Data d'Inici", endDate: "Data de Finalització", current: "Actualitat", description: "Descripció", descriptionPlaceholder: "Descriu les teves responsabilitats i èxits..." },
    education: { title: "Educació", add: "Afegir", empty: "Encara no has afegit educació.", institution: "Institució", institutionPlaceholder: "Universitat o Centre", degree: "Titulació", degreePlaceholder: "Ex. Grau en Enginyeria Informàtica", startDate: "Data d'Inici", endDate: "Data de Finalització", current: "Actualitat", description: "Descripció (opcional)", descriptionPlaceholder: "Descriu els èxits, projectes o habilitats adquirides..." },
    skills: { title: "Habilitats", label: "Les teves habilitats (separades per comes)", placeholder: "React, TypeScript, Node.js, Disseny d'UI..." },
    coverLetter: { title: "Carta de Presentació", label: "Contingut de la carta (opcional)", placeholder: "Escriu la teva carta de presentació aquí..." }
  },
  CVPreview: {
    sections: { summary: "Perfil Professional", experience: "Experiència Professional", education: "Educació", skills: "Habilitats", contact: "Contacte", coverLetter: "Carta de Presentació" },
    dates: { present: "Avui" }
  }
};

const writeData = { fr, de, it, pt, ca };
const dir = path.join(process.cwd(), 'messages');

for (const [lang, data] of Object.entries(writeData)) {
  fs.writeFileSync(
    path.join(dir, `${lang}.json`),
    JSON.stringify(data, null, 2)
  );
  console.log(`Generated real translation for ${lang}.json`);
}
