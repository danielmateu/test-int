import { CVData } from "./types";
import { Mail, Phone, MapPin } from "lucide-react";

interface CVPreviewProps {
  data: CVData;
}

export function CVPreview({ data }: CVPreviewProps) {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="w-full bg-white text-slate-900 shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none max-w-[210mm] min-h-[297mm] mx-auto box-border p-10 sm:p-14 font-sans text-sm">
      {/* Header */}
      <header className="border-b-2 border-slate-900 pb-6 mb-6 flex justify-between items-start gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold tracking-tight uppercase text-slate-900 mb-2">
            {personalInfo.fullName || "Tu Nombre"}
          </h1>
          <p className="text-xl font-medium text-slate-600 mb-4">
            {personalInfo.jobTitle || "Tu Título Profesional"}
          </p>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            {personalInfo.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{personalInfo.location}</span>
              </div>
            )}
          </div>
        </div>
        {personalInfo.imageUrl && (
          <div className="w-28 h-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
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
        <section className="mb-8">
          <p className="leading-relaxed text-slate-700 whitespace-pre-wrap">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-2 mb-4">
            Experiencia
          </h2>
          <div className="space-y-6">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-base font-bold text-slate-900">{exp.role || "Puesto"}</h3>
                  <span className="text-sm font-medium text-slate-500 whitespace-nowrap ml-4">
                    {exp.startDate} {exp.startDate && exp.endDate && "–"} {exp.endDate}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-2">{exp.company || "Empresa"}</div>
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
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-2 mb-4">
            Educación
          </h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{edu.degree || "Titulación"}</h3>
                  <div className="text-sm font-medium text-slate-700">{edu.institution || "Institución"}</div>
                </div>
                <div className="text-sm font-medium text-slate-500 whitespace-nowrap ml-4 text-right">
                  {edu.startDate} {edu.startDate && edu.endDate && "–"} {edu.endDate}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && skills.some(s => s.trim() !== "") && (
        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-2 mb-4">
            Habilidades
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => {
              if (!skill.trim()) return null;
              return (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-100 text-slate-800 text-sm font-medium rounded-md"
                >
                  {skill}
                </span>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
