"use server";

import { auth } from "@/auth";

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Remoto" | "Híbrido" | "Presencial";
  salary: string;
  matchScore: number;
  description: string;
  requirements: string[];
  benefits: string[];
  skillsMatched: string[];
  skillsMissing: string[];
  applyUrl: string;
}

// Datos semilla de empresas y ofertas realistas para el Fallback
const baseOffers = [
  {
    title: "React / Frontend Developer",
    company: "Inditex Tech",
    location: "Madrid, España (Híbrido)",
    type: "Híbrido" as const,
    salary: "€42,000 - €52,000 / año",
    description: "Buscamos un Ingeniero de Software Frontend apasionado por React y el rendimiento web para unirse al equipo de compras globales. Trabajarás en interfaces de alta disponibilidad utilizadas por millones de usuarios diarios.",
    requirements: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Jest", "Git"],
    benefits: ["Seguro médico privado", "Descuento de empleado (25%)", "Horario flexible", "Presupuesto de formación"],
    applyUrl: "https://www.linkedin.com/jobs/view/inditex-frontend"
  },
  {
    title: "Desarrollador Frontend React",
    company: "Mercadona IT",
    location: "Valencia, España (Presencial)",
    type: "Presencial" as const,
    salary: "€38,000 - €46,000 / año",
    description: "Únete a nuestro equipo tecnológico encargado del canal online de alimentación. Trabajarás codo con codo con diseñadores de producto para implementar la mejor experiencia de compra electrónica del país.",
    requirements: ["React", "JavaScript ES6", "CSS3", "Redux Toolkit", "Web Performance"],
    benefits: ["Contrato indefinido desde el día 1", "Plan de pensiones", "Comedor de empresa subvencionado"],
    applyUrl: "https://www.linkedin.com/jobs/view/mercadona-react"
  },
  {
    title: "Senior Full Stack Engineer (Next.js)",
    company: "Glovo",
    location: "Barcelona, España (Remoto)",
    type: "Remoto" as const,
    salary: "€55,000 - €70,000 / año",
    description: "Estamos buscando un ingeniero Full Stack senior con experiencia sólida en Next.js, Node.js y arquitecturas cloud. Liderarás la creación de micro-frontends modulares y escalables.",
    requirements: ["React", "Next.js", "TypeScript", "Node.js", "GraphQL", "AWS", "Docker"],
    benefits: ["Trabajo 100% en remoto", "Plan de Stock Options", "Clases de inglés y español gratis", "Gympass"],
    applyUrl: "https://www.linkedin.com/jobs/view/glovo-senior-fullstack"
  },
  {
    title: "Frontend Developer (UI/UX specialist)",
    company: "Cabify",
    location: "Madrid, España (Híbrido)",
    type: "Híbrido" as const,
    salary: "€45,000 - €55,000 / año",
    description: "Buscamos un perfil Frontend con alta sensibilidad visual y de usabilidad para unirse al equipo de Diseño de Producto. Responsable de mantener y hacer crecer nuestro sistema de diseño en React.",
    requirements: ["React", "Figma", "Tailwind CSS", "Storybook", "TypeScript", "Framer Motion"],
    benefits: ["Suscripción gratuita a Cabify", "Flexibilidad horaria real", "Días adicionales de vacaciones"],
    applyUrl: "https://www.linkedin.com/jobs/view/cabify-frontend-ui"
  },
  {
    title: "Junior Frontend Engineer",
    company: "Fever",
    location: "Madrid, España (Presencial)",
    type: "Presencial" as const,
    salary: "€28,000 - €34,000 / año",
    description: "Perfecta oportunidad para un desarrollador Junior que quiera crecer en una de las startups unicornio de mayor expansión internacional. Aprenderás buenas prácticas, testing unitario y metodologías ágiles.",
    requirements: ["JavaScript", "HTML5", "CSS3", "React", "Git", "Sass"],
    benefits: ["Entradas gratuitas para eventos Fever", "Fruta y café gratis", "Ambiente multicultural excelente"],
    applyUrl: "https://www.linkedin.com/jobs/view/fever-junior-frontend"
  },
  {
    title: "UI / UX Designer",
    company: "Mango Tech",
    location: "Barcelona, España (Híbrido)",
    type: "Híbrido" as const,
    salary: "€35,000 - €45,000 / año",
    description: "Buscamos un Diseñador UI/UX apasionado por la moda digital para revolucionar nuestra plataforma e-commerce. Liderarás el flujo de prototipado y pruebas de usuario.",
    requirements: ["Figma", "Prototyping", "UI Design", "UX Research", "Sistemas de Diseño"],
    benefits: ["Formación interna constante", "Descuento en compras", "Seguro de vida"],
    applyUrl: "https://www.linkedin.com/jobs/view/mango-uiux-designer"
  },
  {
    title: "Full Stack Developer",
    company: "Wallapop",
    location: "Barcelona, España (Remoto)",
    type: "Remoto" as const,
    salary: "€40,000 - €50,000 / año",
    description: "Forma parte del equipo que ayuda a dar una segunda vida a los objetos cotidianos. Buscamos a un desarrollador versátil que domine tanto el desarrollo en React como la creación de microservicios robustos en Node.js.",
    requirements: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "Jest"],
    benefits: ["100% Teletrabajo", "Flexibilidad de horario", "Presupuesto anual de bienestar"],
    applyUrl: "https://www.linkedin.com/jobs/view/wallapop-fullstack"
  }
];

function getCountryCode(locale: string = "es"): string {
  const map: Record<string, string> = {
    es: "es",
    en: "gb", // Adzuna usa 'gb' para Gran Bretaña
    fr: "fr",
    de: "de",
    it: "it",
    pt: "pt",
    ca: "es"  // Catalán -> España
  };
  return map[locale.toLowerCase()] || "es";
}

export interface JobFilters {
  location?: string;
  country?: string;
  minSalary?: number;
}

function parseMinSalary(salaryStr: string): number {
  const matches = salaryStr.match(/\d+[\d.,]*/);
  if (matches) {
    const num = parseInt(matches[0].replace(/[.,\s]/g, ""), 10);
    return num;
  }
  return 0;
}

export async function getJobRecommendations(
  jobTitle?: string,
  userSkills: string[] = [],
  locale: string = "es",
  filters?: JobFilters
): Promise<JobOffer[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }

  const cleanTitle = jobTitle?.toLowerCase().trim() || "";
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  // Si no están configuradas las credenciales de Adzuna en .env.local, usamos el fallback simulated
  if (!appId || !appKey) {
    console.log("Adzuna API: Credenciales no configuradas. Usando datos simulados.");
    
    let filteredBase = [...baseOffers];

    if (filters?.location) {
      const locClean = filters.location.toLowerCase().trim();
      filteredBase = filteredBase.filter(base => 
        base.location.toLowerCase().includes(locClean)
      );
    }

    if (filters?.minSalary) {
      filteredBase = filteredBase.filter(base => {
        const minVal = parseMinSalary(base.salary);
        return minVal >= filters.minSalary!;
      });
    }

    const matchedOffers: JobOffer[] = filteredBase.map((base, index) => {
      let scoreMultiplier = 0.5;

      const baseTitle = base.title.toLowerCase();
      if (cleanTitle) {
        const words = cleanTitle.split(/\s+/);
        const matchingWords = words.filter(word => word.length > 2 && baseTitle.includes(word));
        if (matchingWords.length > 0) {
          scoreMultiplier += 0.25;
        }
      } else {
        scoreMultiplier += 0.15;
      }

      const skillsMatched: string[] = [];
      const skillsMissing: string[] = [];

      base.requirements.forEach(req => {
        const isMatched = normalizedUserSkills.some(userSkill => 
          userSkill === req.toLowerCase() || 
          req.toLowerCase().includes(userSkill) || 
          userSkill.includes(req.toLowerCase())
        );

        if (isMatched) {
          skillsMatched.push(req);
        } else {
          skillsMissing.push(req);
        }
      });

      if (base.requirements.length > 0) {
        const skillMatchRatio = skillsMatched.length / base.requirements.length;
        scoreMultiplier += (skillMatchRatio * 0.25);
      }

      const rawScore = Math.round(scoreMultiplier * 100);
      const finalScore = Math.max(60, Math.min(98, rawScore));

      return {
        id: `job-${index}-${Date.now().toString().slice(-4)}`,
        title: base.title,
        company: base.company,
        location: base.location,
        type: base.type,
        salary: base.salary,
        matchScore: finalScore,
        description: base.description,
        requirements: base.requirements,
        benefits: base.benefits,
        skillsMatched,
        skillsMissing,
        applyUrl: base.applyUrl
      };
    });

    return matchedOffers.sort((a, b) => b.matchScore - a.matchScore);
  }

  // --- INTEGRACIÓN EN TIEMPO REAL CON LA API DE ADZUNA ---
  try {
    const country = filters?.country || getCountryCode(locale);
    const searchWord = cleanTitle || "javascript developer";
    
    let url = `http://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=15&what=${encodeURIComponent(searchWord)}&content-type=application/json`;

    if (filters?.location) {
      url += `&where=${encodeURIComponent(filters.location.trim())}`;
    }

    if (filters?.minSalary) {
      url += `&salary_min=${filters.minSalary}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Adzuna API respondió con estado ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || [];

    const knownSkills = ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Git", "Next.js", "Node.js", "Redux", "Tailwind CSS", "Vue", "Angular", "Express", "MongoDB", "SQL", "Docker", "AWS", "Figma", "UI", "UX"];

    const mappedOffers: JobOffer[] = results.map((job: any, index: number) => {
      const titleClean = (job.title || "").replace(/<\/?[^>]+(>|$)/g, "").trim();
      const descClean = (job.description || "").replace(/<\/?[^>]+(>|$)/g, "").trim();
      const descLower = descClean.toLowerCase();

      // Heurística de tipo de jornada
      let type: "Remoto" | "Híbrido" | "Presencial" = "Presencial";
      const locDisplay = job.location?.display_name || "España";
      const locLower = locDisplay.toLowerCase();

      if (locLower.includes("remote") || locLower.includes("remoto") || locLower.includes("teletrabajo") || descLower.includes("remote") || descLower.includes("teletrabajo")) {
        type = "Remoto";
      } else if (Math.random() > 0.45) {
        type = "Híbrido";
      }

      // Formatear Salario
      let salaryStr = "Salario no especificado";
      if (job.salary_min && job.salary_max) {
        const currency = country === "gb" ? "£" : "$";
        const symbol = country === "es" ? "€" : currency;
        salaryStr = `${symbol}${Math.round(job.salary_min).toLocaleString()} - ${symbol}${Math.round(job.salary_max).toLocaleString()} / año`;
      } else if (job.salary_min) {
        const symbol = country === "es" ? "€" : (country === "gb" ? "£" : "$");
        salaryStr = `${symbol}${Math.round(job.salary_min).toLocaleString()} / año`;
      }

      // Habilidades coincidentes y faltantes
      const skillsMatched = userSkills.filter(skill => 
        descLower.includes(skill.toLowerCase()) || 
        titleClean.toLowerCase().includes(skill.toLowerCase())
      );

      const baseReqs = knownSkills.filter(skill => 
        descLower.includes(skill.toLowerCase()) || 
        titleClean.toLowerCase().includes(skill.toLowerCase())
      );

      if (baseReqs.length === 0) {
        if (titleClean.toLowerCase().includes("designer") || titleClean.toLowerCase().includes("ui") || titleClean.toLowerCase().includes("ux")) {
          baseReqs.push("Figma", "UI", "UX");
        } else {
          baseReqs.push("JavaScript", "React", "Git");
        }
      }

      const skillsMissing = baseReqs.filter(req => !skillsMatched.some(sm => sm.toLowerCase() === req.toLowerCase()));

      // Calcular match score
      let scoreMultiplier = 0.55;
      if (cleanTitle) {
        const words = cleanTitle.split(/\s+/);
        const matchingWords = words.filter(word => word.length > 2 && titleClean.toLowerCase().includes(word));
        if (matchingWords.length > 0) {
          scoreMultiplier += 0.20;
        }
      }
      if (baseReqs.length > 0) {
        const skillMatchRatio = skillsMatched.length / baseReqs.length;
        scoreMultiplier += (skillMatchRatio * 0.25);
      }
      const rawScore = Math.round(scoreMultiplier * 100);
      const finalScore = Math.max(60, Math.min(98, rawScore));

      return {
        id: job.id || `adzuna-${index}-${Date.now().toString().slice(-4)}`,
        title: titleClean,
        company: job.company?.display_name || "Compañía",
        location: locDisplay,
        type,
        salary: salaryStr,
        matchScore: finalScore,
        description: descClean,
        requirements: baseReqs,
        benefits: ["Horario flexible", "Formación continua", "Excelente ambiente de trabajo"],
        skillsMatched,
        skillsMissing,
        applyUrl: job.redirect_url || "https://www.adzuna.com"
      };
    });

    return mappedOffers.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error("Adzuna API Error: Failed to fetch live jobs. Falling back to mock data.", error);
    return baseOffers.map((base, index) => ({
      id: `fallback-${index}-${Date.now().toString().slice(-4)}`,
      title: base.title,
      company: base.company,
      location: base.location,
      type: base.type,
      salary: base.salary,
      matchScore: 75,
      description: base.description,
      requirements: base.requirements,
      benefits: base.benefits,
      skillsMatched: userSkills.filter(s => base.requirements.includes(s)),
      skillsMissing: base.requirements.filter(r => !userSkills.includes(r)),
      applyUrl: base.applyUrl
    }));
  }
}
