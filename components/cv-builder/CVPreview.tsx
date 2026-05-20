import { CVData } from "./types";
import { Mail, Phone, MapPin, Github, Linkedin, Globe, Twitter } from "lucide-react";
import { useTranslations } from "next-intl";

interface CVPreviewProps {
  data: CVData;
}

export function CVPreview({ data }: CVPreviewProps) {
  const { personalInfo, experience, education, skills, theme } = data;
  const layout = theme.layout || "classic";
  const t = useTranslations("CVPreview.sections");

  // For generic defaults we use form placeholders usually, but let's leave generic fallbacks if empty
  const defaultName = "Tu Nombre";
  const defaultTitle = "Tu Título Profesional";

  const ContactItems = ({ layoutStyle }: { layoutStyle?: 'column' | 'row' }) => {
    const wrapperClass = layoutStyle === 'column' ? "flex flex-col gap-3" : layoutStyle === 'row' ? "flex flex-wrap justify-center gap-x-4 gap-y-2" : "flex flex-wrap gap-x-5 gap-y-2";
    const textClass = layoutStyle === 'column' ? "text-slate-700" : "text-slate-600";
    return (
      <div className={`${wrapperClass} text-sm ${textClass} font-medium`}>
        {personalInfo.email && (
          <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-(--theme-color) shrink-0" /><span className="truncate">{personalInfo.email}</span></div>
        )}
        {personalInfo.phone && (
          <div className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-(--theme-color) shrink-0" /><span className="truncate">{personalInfo.phone}</span></div>
        )}
        {personalInfo.location && (
          <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-(--theme-color) shrink-0" /><span className="truncate">{personalInfo.location}</span></div>
        )}
        {personalInfo.githubUrl && (
          <a href={personalInfo.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"><Github className="w-4 h-4 text-(--theme-color) shrink-0" /><span className="truncate">GitHub</span></a>
        )}
        {personalInfo.linkedinUrl && (
          <a href={personalInfo.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"><Linkedin className="w-4 h-4 text-(--theme-color) shrink-0" /><span className="truncate">LinkedIn</span></a>
        )}
        {personalInfo.portfolioUrl && (
          <a href={personalInfo.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"><Globe className="w-4 h-4 text-(--theme-color) shrink-0" /><span className="truncate">Portfolio</span></a>
        )}
        {personalInfo.xUrl && (
          <a href={personalInfo.xUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"><Twitter className="w-4 h-4 text-(--theme-color) shrink-0" /><span className="truncate">X</span></a>
        )}
      </div>
    );
  };

  const SkillsSection = ({ centered = false, sidebar = false }: { centered?: boolean, sidebar?: boolean }) => {
    if (!skills.length || !skills.some(s => s.trim() !== "")) return null;
    return (
      <section className="break-inside-avoid mb-6">
        <h2 className={`text-lg font-bold uppercase tracking-wider text-(--theme-color) pb-2 mb-4 break-after-avoid ${centered ? 'text-center border-none' : 'border-b border-slate-300'} ${sidebar ? 'text-sm mt-2' : ''}`}>
          {t("skills")}
        </h2>
        <div className={`flex flex-wrap gap-2 ${centered ? 'justify-center' : ''}`}>
          {skills.map((skill, index) => {
            if (!skill.trim()) return null;
            return <span key={index} className="px-3 py-1 bg-(--theme-color) text-white text-xs font-medium rounded-md">{skill}</span>;
          })}
        </div>
      </section>
    );
  };

  const ExperienceSection = ({ centered = false }: { centered?: boolean }) => {
    if (!experience.length) return null;
    return (
      <section className="mb-6">
        <h2 className={`text-lg font-bold uppercase tracking-wider text-(--theme-color) pb-2 mb-4 break-after-avoid ${centered ? 'text-center border-none' : 'border-b border-slate-300'}`}>
          {t("experience")}
        </h2>
        <div className="space-y-6">
          {experience.map((exp) => (
            <div key={exp.id}>
              <div className="break-inside-avoid break-after-avoid">
                <div className={`flex ${centered ? 'flex-col items-center' : 'justify-between items-baseline'} mb-1`}>
                  <h3 className={`text-base font-bold text-slate-900 ${centered ? 'text-center' : ''}`}>{exp.role || "Puesto"}</h3>
                  <span className={`text-sm font-medium text-(--theme-color) whitespace-nowrap ${centered ? 'mt-1' : 'ml-4'}`}>
                    {exp.startDate} {exp.startDate && exp.endDate && "–"} {exp.endDate}
                  </span>
                </div>
                <div className={`text-sm font-semibold text-slate-700 mb-2 ${centered ? 'text-center' : ''}`}>{exp.company || "Empresa"}</div>
              </div>
              {exp.description && (
                <div 
                  className={`text-slate-600 text-[0.875em] whitespace-pre-wrap [&>b]:font-bold [&>i]:italic [&>u]:underline ${centered ? 'text-center mx-auto max-w-3xl' : ''}`}
                  dangerouslySetInnerHTML={{ __html: exp.description }}
                />
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const EducationSection = ({ centered = false }: { centered?: boolean }) => {
    if (!education.length) return null;
    return (
      <section className="mb-6">
        <h2 className={`text-lg font-bold uppercase tracking-wider text-(--theme-color) pb-2 mb-4 break-after-avoid ${centered ? 'text-center border-none' : 'border-b border-slate-300'}`}>
          {t("education")}
        </h2>
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id}>
              <div className="break-inside-avoid break-after-avoid">
                <div className={`flex ${centered ? 'flex-col items-center' : 'justify-between items-baseline'} mb-1`}>
                  <h3 className={`text-base font-bold text-slate-900 ${centered ? 'text-center' : ''}`}>{edu.degree || "Titulación"}</h3>
                  <span className={`text-sm font-medium text-(--theme-color) whitespace-nowrap ${centered ? 'mt-1' : 'ml-4'}`}>
                    {edu.startDate} {edu.startDate && edu.endDate && "–"} {edu.endDate}
                  </span>
                </div>
                <div className={`text-sm font-semibold text-slate-700 mb-2 ${centered ? 'text-center' : ''}`}>{edu.institution || "Institución"}</div>
              </div>
              {edu.description && (
                <div 
                  className={`text-slate-600 text-[0.875em] whitespace-pre-wrap [&>b]:font-bold [&>i]:italic [&>u]:underline ${centered ? 'text-center mx-auto max-w-3xl' : ''}`}
                  dangerouslySetInnerHTML={{ __html: edu.description }}
                />
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const SummarySection = ({ centered = false }: { centered?: boolean }) => {
    if (!personalInfo.summary) return null;
    return (
      <section className="mb-6">
        {centered && <h2 className="text-lg font-bold uppercase tracking-wider text-(--theme-color) pb-2 mb-4 break-after-avoid text-center">{t("summary")}</h2>}
        <div 
          className={`text-slate-700 whitespace-pre-wrap text-[0.875em] [&>b]:font-bold [&>i]:italic [&>u]:underline ${centered ? 'text-center mx-auto max-w-3xl' : ''}`}
          dangerouslySetInnerHTML={{ __html: personalInfo.summary }}
        />
      </section>
    );
  }

  return (
    <div
      className={`flex flex-col gap-8 w-full max-w-[210mm] mx-auto print:gap-0 print:block ${data.theme.font}`}
      style={{
        "--theme-color": data.theme.color,
        fontSize: `${theme.typography?.fontSize || 16}px`,
        lineHeight: theme.typography?.lineHeight || 1.5,
        wordSpacing: `${theme.typography?.wordSpacing || 0}px`
      } as React.CSSProperties}
    >
      {/* CV Page */}
      <div className="w-full bg-white text-slate-900 shadow-2xl overflow-hidden print:overflow-visible print:shadow-none print:w-full print:max-w-none print:min-h-0 max-w-[210mm] min-h-[297mm] mx-auto box-border">

        {layout === "classic" && (
          <div className="p-8 sm:p-12 print:px-[20mm] print:py-[15mm]">
            <header className="mb-6 flex justify-between items-start gap-6 break-inside-avoid">
              <div className="flex-1">
                <h1 className="text-4xl font-extrabold tracking-tight text-(--theme-color) mb-1 uppercase">
                  {personalInfo.fullName || defaultName}
                </h1>
                <p className="text-xl font-medium text-slate-500 mb-4 tracking-tight">
                  {personalInfo.jobTitle || defaultTitle}
                </p>
                <ContactItems />
              </div>
              {personalInfo.imageUrl && (
                <div className="w-24 h-24 shrink-0 overflow-hidden rounded-full border-2 border-slate-100 shadow-sm">
                  <img src={personalInfo.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
              )}
            </header>
            <SummarySection />
            <ExperienceSection />
            <EducationSection />
            <SkillsSection />
          </div>
        )}

        {layout === "two-column" && (
          <div className="flex flex-row min-h-[297mm] print:min-h-[297mm]">
            {/* Left Sidebar */}
            <div className="w-[35%] bg-slate-50 border-r border-slate-200 p-6 print:p-6 break-inside-avoid print:bg-slate-50 print:-webkit-print-color-adjust-exact flex flex-col gap-8 print:border-r-0">
              {personalInfo.imageUrl ? (
                <div className="w-32 h-32 mx-auto overflow-hidden rounded-full border-4 border-white shadow-md">
                  <img src={personalInfo.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-4"></div>
              )}

              <div className="text-center">
                <h1 className="text-2xl font-extrabold tracking-tight text-(--theme-color) mb-1 uppercase leading-tight">
                  {personalInfo.fullName || defaultName}
                </h1>
                <p className="text-sm font-medium text-slate-500">
                  {personalInfo.jobTitle || defaultTitle}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-(--theme-color) border-b border-slate-300 pb-2 mb-3">{t("contact")}</h2>
                <ContactItems layoutStyle="column" />
              </div>

              <SkillsSection sidebar />
            </div>

            {/* Right Content */}
            <div className="w-[65%] p-8 sm:p-10 print:p-8">
              <SummarySection />
              <ExperienceSection />
              <EducationSection />
            </div>
          </div>
        )}

        {layout === "minimalist" && (
          <div className="p-10 sm:p-16 print:px-[22mm] print:py-[18mm]">
            {/* Header */}
            <header className="mb-10 break-inside-avoid">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-extralight tracking-tight text-slate-900 mb-2">
                    {personalInfo.fullName || defaultName}
                  </h1>
                  <p className="text-[11px] font-medium text-slate-400 tracking-[0.22em] uppercase">
                    {personalInfo.jobTitle || defaultTitle}
                  </p>
                </div>
                {personalInfo.imageUrl && (
                  <img src={personalInfo.imageUrl} alt="Profile" className="w-14 h-14 rounded-full object-cover grayscale shrink-0 mt-1" />
                )}
              </div>
              <div className="h-px bg-slate-200 mb-3" />
              <div className="text-[11px] text-slate-400 leading-relaxed flex flex-wrap">
                {[
                  personalInfo.email && { label: personalInfo.email, href: `mailto:${personalInfo.email}` },
                  personalInfo.phone && { label: personalInfo.phone, href: `tel:${personalInfo.phone}` },
                  personalInfo.location && { label: personalInfo.location },
                  personalInfo.githubUrl && { label: personalInfo.githubUrl, href: personalInfo.githubUrl },
                  personalInfo.linkedinUrl && { label: "LinkedIn", href: personalInfo.linkedinUrl },
                  personalInfo.portfolioUrl && { label: "Portfolio", href: personalInfo.portfolioUrl },
                  personalInfo.xUrl && { label: "X", href: personalInfo.xUrl },
                ]
                  .filter(Boolean)
                  .map((item: any, i, arr) => (
                    <span key={i} className="flex items-center">
                      {item.href
                        ? <a href={item.href} target="_blank" rel="noreferrer" className="hover:text-slate-700 underline underline-offset-2 transition-colors">{item.label}</a>
                        : <span>{item.label}</span>
                      }
                      {i < arr.length - 1 && <span className="mx-2 select-none">·</span>}
                    </span>
                  ))}
              </div>
            </header>

            {/* Body — swiss grid: narrow label col + content col */}
            <div className="space-y-8">
              {personalInfo.summary && (
                <section className="grid grid-cols-[110px_1fr] gap-8 break-inside-avoid">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 pt-0.5">{t("summary")}</p>
                  <div 
                    className="text-[0.875em] text-slate-600 whitespace-pre-wrap [&>b]:font-bold [&>i]:italic [&>u]:underline" 
                    dangerouslySetInnerHTML={{ __html: personalInfo.summary }} 
                  />
                </section>
              )}

              {experience.length > 0 && (
                <section className="grid grid-cols-[110px_1fr] gap-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 pt-0.5">{t("experience")}</p>
                  <div className="space-y-6">
                    {experience.map((exp) => (
                      <div key={exp.id} className="break-inside-avoid">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="text-sm font-semibold text-slate-900">{exp.role || "Puesto"}</span>
                          <span className="text-xs text-slate-400 shrink-0 ml-4 tabular-nums">
                            {exp.startDate}{exp.startDate && exp.endDate && " – "}{exp.endDate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-1.5">{exp.company || "Empresa"}</p>
                        {exp.description && (
                          <div 
                            className="text-[0.875em] text-slate-600 whitespace-pre-wrap [&>b]:font-bold [&>i]:italic [&>u]:underline" 
                            dangerouslySetInnerHTML={{ __html: exp.description }} 
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {education.length > 0 && (
                <section className="grid grid-cols-[110px_1fr] gap-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 pt-0.5">{t("education")}</p>
                  <div className="space-y-5">
                    {education.map((edu) => (
                      <div key={edu.id} className="break-inside-avoid">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="text-sm font-semibold text-slate-900">{edu.degree || "Titulación"}</span>
                          <span className="text-xs text-slate-400 shrink-0 ml-4 tabular-nums">
                            {edu.startDate}{edu.startDate && edu.endDate && " – "}{edu.endDate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-1.5">{edu.institution || "Institución"}</p>
                        {edu.description && (
                          <div 
                            className="text-[0.875em] text-slate-600 whitespace-pre-wrap [&>b]:font-bold [&>i]:italic [&>u]:underline" 
                            dangerouslySetInnerHTML={{ __html: edu.description }} 
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {skills.some((s) => s.trim()) && (
                <section className="grid grid-cols-[110px_1fr] gap-8 break-inside-avoid">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 pt-0.5">{t("skills")}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {skills.filter((s) => s.trim()).join(" · ")}
                  </p>
                </section>
              )}
            </div>
          </div>
        )}

        {layout === "modern" && (
          <div className="flex flex-col min-h-[297mm]">
            <header className="bg-(--theme-color) text-white p-10 print:p-10 break-inside-avoid">
              <div className="flex justify-between items-center gap-6">
                <div>
                  <h1 className="text-5xl font-black tracking-tight mb-2 uppercase drop-shadow-md">
                    {personalInfo.fullName || defaultName}
                  </h1>
                  <p className="text-2xl font-medium opacity-90 tracking-wide">
                    {personalInfo.jobTitle || defaultTitle}
                  </p>
                </div>
                {personalInfo.imageUrl && (
                  <img src={personalInfo.imageUrl} alt="Profile" className="w-28 h-28 rounded-xl object-cover shadow-xl border-2 border-white/20" />
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium opacity-90">
                {personalInfo.email && <span className="flex items-center gap-2"><Mail className="w-4 h-4" />{personalInfo.email}</span>}
                {personalInfo.phone && <span className="flex items-center gap-2"><Phone className="w-4 h-4" />{personalInfo.phone}</span>}
                {personalInfo.location && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{personalInfo.location}</span>}
                {personalInfo.linkedinUrl && <a href={personalInfo.linkedinUrl} className="flex items-center gap-2 hover:text-white"><Linkedin className="w-4 h-4" />LinkedIn</a>}
                {personalInfo.githubUrl && <a href={personalInfo.githubUrl} className="flex items-center gap-2 hover:text-white"><Github className="w-4 h-4" />GitHub</a>}
              </div>
            </header>

            <div className="p-10 flex-1 bg-slate-50 print:bg-white space-y-10">
              {personalInfo.summary && (
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 break-inside-avoid">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                    <span className="w-8 h-1 bg-(--theme-color) rounded-full"></span> {t("summary")}
                  </h2>
                  <div className="text-[0.875em] text-slate-600 whitespace-pre-wrap [&>b]:font-bold [&>i]:italic [&>u]:underline" dangerouslySetInnerHTML={{ __html: personalInfo.summary }} />
                </section>
              )}

              {experience.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <span className="w-8 h-1 bg-(--theme-color) rounded-full"></span> {t("experience")}
                  </h2>
                  <div className="space-y-6">
                    {experience.map((exp) => (
                      <div key={exp.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 break-inside-avoid relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-(--theme-color) opacity-50"></div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{exp.role || "Puesto"}</h3>
                            <p className="text-sm font-semibold text-(--theme-color) mt-1">{exp.company || "Empresa"}</p>
                          </div>
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium whitespace-nowrap">
                            {exp.startDate}{exp.startDate && exp.endDate && " – "}{exp.endDate}
                          </span>
                        </div>
                        {exp.description && (
                          <div className="mt-4 text-[0.875em] text-slate-600 whitespace-pre-wrap [&>b]:font-bold [&>i]:italic [&>u]:underline" dangerouslySetInnerHTML={{ __html: exp.description }} />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {education.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                      <span className="w-8 h-1 bg-(--theme-color) rounded-full"></span> {t("education")}
                    </h2>
                    <div className="space-y-4">
                      {education.map((edu) => (
                        <div key={edu.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 break-inside-avoid relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-(--theme-color) opacity-50"></div>
                          <h3 className="font-bold text-slate-900">{edu.degree || "Titulación"}</h3>
                          <p className="text-sm font-medium text-(--theme-color) mt-0.5">{edu.institution || "Institución"}</p>
                          <p className="text-xs text-slate-500 mt-1">{edu.startDate}{edu.startDate && edu.endDate && " – "}{edu.endDate}</p>
                          {edu.description && (
                            <div className="mt-3 text-[0.875em] text-slate-600 whitespace-pre-wrap [&>b]:font-bold [&>i]:italic [&>u]:underline" dangerouslySetInnerHTML={{ __html: edu.description }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {skills.some((s) => s.trim()) && (
                  <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                      <span className="w-8 h-1 bg-(--theme-color) rounded-full"></span> {t("skills")}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.filter((s) => s.trim()).map((skill, index) => (
                        <span key={index} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 shadow-sm text-sm font-medium rounded-xl">{skill}</span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}

        {layout === "corporate" && (
          <div className="p-12 print:p-12 min-h-[297mm]">
            <header className="border-b-4 border-slate-900 pb-8 mb-8 text-center break-inside-avoid">
              <h1 className="text-5xl font-serif font-bold text-slate-900 mb-2 uppercase tracking-wider">
                {personalInfo.fullName || defaultName}
              </h1>
              <p className="text-xl text-slate-600 font-medium tracking-widest uppercase mb-6">
                {personalInfo.jobTitle || defaultTitle}
              </p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.location && <span>• {personalInfo.location}</span>}
                {personalInfo.linkedinUrl && <span>• <a href={personalInfo.linkedinUrl} className="hover:underline">LinkedIn</a></span>}
              </div>
            </header>

            <div className="space-y-8">
              {personalInfo.summary && (
                <section className="break-inside-avoid">
                  <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-2 mb-4">
                    {t("summary")}
                  </h2>
                  <div className="text-[0.875em] text-slate-700 whitespace-pre-wrap [&>b]:font-bold [&>i]:italic [&>u]:underline" dangerouslySetInnerHTML={{ __html: personalInfo.summary }} />
                </section>
              )}

              {experience.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-2 mb-4">
                    {t("experience")}
                  </h2>
                  <div className="space-y-6">
                    {experience.map((exp) => (
                      <div key={exp.id} className="break-inside-avoid">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-slate-900 text-lg">{exp.role || "Puesto"}</h3>
                          <span className="text-sm font-bold text-slate-500 whitespace-nowrap">
                            {exp.startDate}{exp.startDate && exp.endDate && " – "}{exp.endDate}
                          </span>
                        </div>
                        <p className="text-base font-semibold text-slate-700 italic mb-2">{exp.company || "Empresa"}</p>
                        {exp.description && (
                          <div className="text-[0.875em] text-slate-700 whitespace-pre-wrap pl-4 border-l-2 border-slate-200 [&>b]:font-bold [&>i]:italic [&>u]:underline" dangerouslySetInnerHTML={{ __html: exp.description }} />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {education.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-2 mb-4">
                    {t("education")}
                  </h2>
                  <div className="space-y-4">
                    {education.map((edu) => (
                      <div key={edu.id} className="break-inside-avoid flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-900">{edu.degree || "Titulación"}</h3>
                          <p className="text-slate-700">{edu.institution || "Institución"}</p>
                          {edu.description && (
                            <div className="mt-2 text-[0.875em] text-slate-600 whitespace-pre-wrap [&>b]:font-bold [&>i]:italic [&>u]:underline" dangerouslySetInnerHTML={{ __html: edu.description }} />
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-500 whitespace-nowrap text-right">
                          {edu.startDate}{edu.startDate && edu.endDate && " – "}{edu.endDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {skills.some((s) => s.trim()) && (
                <section className="break-inside-avoid">
                  <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-2 mb-4">
                    {t("skills")}
                  </h2>
                  <p className="text-[0.875em] text-slate-700 font-medium">
                    {skills.filter((s) => s.trim()).join(" • ")}
                  </p>
                </section>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Cover Letter Page */}
      {data.coverLetter && (
        <div className="w-full bg-white text-slate-900 shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none max-w-[210mm] min-h-[297mm] mx-auto box-border p-[15mm] sm:p-[20mm] print:p-[20mm] text-sm break-before-page print:break-before-page mt-8">
          <header className={`pb-6 mb-6 ${layout === 'minimalist' ? 'border-none' : 'border-b-2 border-slate-900'}`}>
            <h1 className={`tracking-tight uppercase mb-1 ${layout === 'minimalist' ? 'text-2xl font-semibold text-slate-900' : 'text-4xl font-extrabold text-(--theme-color)'}`}>
              {personalInfo.fullName || defaultName}
            </h1>
            <p className={`font-medium ${layout === 'minimalist' ? 'text-xs text-slate-400 tracking-widest uppercase' : 'text-xl text-slate-600'}`}>
              {t("coverLetter")}
            </p>
            {layout === 'minimalist' && <div className="h-px bg-slate-200 mt-5" />}
          </header>
          <div 
            className="text-slate-700 whitespace-pre-wrap text-[1em] [&>b]:font-bold [&>i]:italic [&>u]:underline"
            dangerouslySetInnerHTML={{ __html: data.coverLetter }}
          />
        </div>
      )}
    </div>
  );
}
