import { CVData } from "./types";
import { Mail, Phone, MapPin, Github, Linkedin, Globe, Twitter } from "lucide-react";

interface CVPreviewProps {
  data: CVData;
}

export function CVPreview({ data }: CVPreviewProps) {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div
      className={`flex flex-col gap-8 w-full max-w-[210mm] mx-auto print:gap-0 print:block ${data.theme.font}`}
      style={{ "--theme-color": data.theme.color } as React.CSSProperties}
    >

      {/* CV Page */}
      <div className="w-full bg-white text-slate-900 shadow-2xl overflow-hidden print:overflow-visible print:shadow-none print:w-full print:max-w-none print:min-h-0 max-w-[210mm] min-h-[297mm] mx-auto box-border text-sm p-6 sm:p-10 print:px-[20mm] print:py-0">
        {/* Header */}
        <header className="mb-4 flex justify-between items-start gap-6 break-inside-avoid">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-[color:var(--theme-color)] mb-1 uppercase">
              {personalInfo.fullName || "Tu Nombre"}
            </h1>
            <p className="text-xl font-medium text-slate-500 mb-4 tracking-tight">
              {personalInfo.jobTitle || "Tu Título Profesional"}
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 font-medium">
              {personalInfo.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[color:var(--theme-color)]" />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[color:var(--theme-color)]" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[color:var(--theme-color)]" />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.githubUrl && (
                <a href={personalInfo.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                  <Github className="w-4 h-4 text-[color:var(--theme-color)]" />
                  <span>GitHub</span>
                </a>
              )}
              {personalInfo.linkedinUrl && (
                <a href={personalInfo.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                  <Linkedin className="w-4 h-4 text-[color:var(--theme-color)]" />
                  <span>LinkedIn</span>
                </a>
              )}
              {personalInfo.portfolioUrl && (
                <a href={personalInfo.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                  <Globe className="w-4 h-4 text-[color:var(--theme-color)]" />
                  <span>Portfolio</span>
                </a>
              )}
              {personalInfo.xUrl && (
                <a href={personalInfo.xUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                  <Twitter className="w-4 h-4 text-[color:var(--theme-color)]" />
                  <span>X (Twitter)</span>
                </a>
              )}
            </div>
          </div>
          {personalInfo.imageUrl && (
            <div className="w-24 h-24 shrink-0 overflow-hidden rounded-full border-2 border-slate-100 shadow-sm">
              <img
                src={personalInfo.imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </header>

        {/* Summary */}
        {personalInfo.summary && (
          <section className="mb-4">
            <p className="leading-relaxed text-slate-700 whitespace-pre-wrap">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-2">
            <h2 className="text-lg font-bold uppercase tracking-wider text-[color:var(--theme-color)] border-b border-slate-300 pb-2 mb-4 break-after-avoid">
              Experiencia
            </h2>
            <div className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="break-inside-avoid break-after-avoid">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-base font-bold text-slate-900">{exp.role || "Puesto"}</h3>
                      <span className="text-sm font-medium text-slate-500 whitespace-nowrap ml-4">
                        {exp.startDate} {exp.startDate && exp.endDate && "–"} {exp.endDate}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-2">{exp.company || "Empresa"}</div>
                  </div>
                  {exp.description && (
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-2 pt-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-[color:var(--theme-color)] border-b border-slate-300 pb-2 mb-4 break-after-avoid">
              Educación
            </h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="break-inside-avoid break-after-avoid">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-base font-bold text-slate-900">{edu.degree || "Titulación"}</h3>
                      <span className="text-sm font-medium text-slate-500 whitespace-nowrap ml-4">
                        {edu.startDate} {edu.startDate && edu.endDate && "–"} {edu.endDate}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-2">{edu.institution || "Institución"}</div>
                  </div>
                  {edu.description && (
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && skills.some(s => s.trim() !== "") && (
          <section className="break-inside-avoid mt-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-[color:var(--theme-color)] border-b border-slate-300 pb-2 mb-4 break-after-avoid">
              Habilidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => {
                if (!skill.trim()) return null;
                return (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[color:var(--theme-color)] text-white text-sm font-medium rounded-md"
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Cover Letter Page */}
      {data.coverLetter && (
        <div className="w-full bg-white text-slate-900 shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none max-w-[210mm] min-h-[297mm] mx-auto box-border p-[15mm] sm:p-[20mm] print:p-[20mm] text-sm break-before-page print:break-before-page mt-8">
          <header className="border-b-2 border-slate-900 pb-6 mb-2">
            <h1 className="text-4xl font-extrabold tracking-tight uppercase text-[color:var(--theme-color)] mb-2">
              {personalInfo.fullName || "Tu Nombre"}
            </h1>
            <p className="text-xl font-medium text-slate-600">
              Carta de Presentación
            </p>
          </header>
          <div className="leading-relaxed text-slate-700 whitespace-pre-wrap text-base">
            {data.coverLetter}
          </div>
        </div>
      )}
    </div>
  );
}
