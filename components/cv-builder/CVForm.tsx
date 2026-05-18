import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { AIEnhanceButton } from "./AIEnhanceButton";
import { CVData, Experience, Education } from "./types";

interface CVFormProps {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

export function CVForm({ data, setData }: CVFormProps) {
  const handlePersonalInfoChange = (field: keyof CVData["personalInfo"], value: string) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      handlePersonalInfoChange("imageUrl", url);
    }
  };

  const handleExperienceChange = (id: string, field: keyof Experience, value: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));
  };

  const addExperience = () => {
    setData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: Date.now().toString(), company: "", role: "", startDate: "", endDate: "", description: "" },
      ],
    }));
  };

  const removeExperience = (id: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const handleEducationChange = (id: string, field: keyof Education, value: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }));
  };

  const addEducation = () => {
    setData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: Date.now().toString(), institution: "", degree: "", startDate: "", endDate: "" },
      ],
    }));
  };

  const removeEducation = (id: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const handleSkillsChange = (value: string) => {
    const skillsArray = value.split(",").map((skill) => skill.trim());
    setData((prev) => ({ ...prev, skills: skillsArray }));
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto pb-20">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Tu Información</h2>
        <p className="text-muted-foreground">Completa los datos para generar tu CV profesional.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos Personales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Top Row: Avatar + Basic Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="shrink-0 space-y-2 flex flex-col items-center sm:items-start">
              <Label htmlFor="imageUpload">Foto de Perfil</Label>
              {data.personalInfo.imageUrl ? (
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm">
                  <img
                    src={data.personalInfo.imageUrl}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePersonalInfoChange("imageUrl", "")}
                      className="text-white hover:text-red-400 hover:bg-transparent"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Subir foto de perfil"
                  />
                  <Plus className="w-6 h-6 text-slate-400" />
                </div>
              )}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  value={data.personalInfo.fullName}
                  onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Título Profesional</Label>
                <Input
                  id="jobTitle"
                  value={data.personalInfo.jobTitle}
                  onChange={(e) => handlePersonalInfoChange("jobTitle", e.target.value)}
                  placeholder="Ej. Desarrollador Frontend"
                />
              </div>
            </div>
          </div>

          {/* Bottom Grid: Contact & Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={data.personalInfo.phone}
                onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={data.personalInfo.location}
                onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                placeholder="Madrid, España"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                type="url"
                value={data.personalInfo.githubUrl || ""}
                onChange={(e) => handlePersonalInfoChange("githubUrl", e.target.value)}
                placeholder="https://github.com/tuusuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={data.personalInfo.linkedinUrl || ""}
                onChange={(e) => handlePersonalInfoChange("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/tuusuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input
                id="portfolioUrl"
                type="url"
                value={data.personalInfo.portfolioUrl || ""}
                onChange={(e) => handlePersonalInfoChange("portfolioUrl", e.target.value)}
                placeholder="https://tuweb.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="xUrl">X (Twitter) URL</Label>
              <Input
                id="xUrl"
                type="url"
                value={data.personalInfo.xUrl || ""}
                onChange={(e) => handlePersonalInfoChange("xUrl", e.target.value)}
                placeholder="https://x.com/tuusuario"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="summary">Perfil Profesional</Label>
                <AIEnhanceButton 
                  text={data.personalInfo.summary} 
                  context="summary" 
                  onEnhance={(text) => handlePersonalInfoChange("summary", text)} 
                />
              </div>
              <Textarea
                id="summary"
                value={data.personalInfo.summary}
                onChange={(e) => handlePersonalInfoChange("summary", e.target.value)}
                placeholder="Breve descripción de tu perfil y objetivos..."
                className="h-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Experiencia</CardTitle>
          <Button variant="outline" size="sm" onClick={addExperience}>
            <Plus className="w-4 h-4 mr-2" />
            Añadir
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.experience.map((exp, index) => (
            <div key={exp.id} className="space-y-4 relative border-b pb-6 last:border-0 last:pb-0">
              <div className="absolute right-0 top-0">
                <Button variant="ghost" size="icon" onClick={() => removeExperience(exp.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Puesto</Label>
                  <Input
                    value={exp.role}
                    onChange={(e) => handleExperienceChange(exp.id, "role", e.target.value)}
                    placeholder="Ej. Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Inicio</Label>
                  <DatePicker
                    value={exp.startDate}
                    onChange={(val) => handleExperienceChange(exp.id, "startDate", val)}
                    placeholder="Fecha inicio"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Fin</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <DatePicker
                        value={exp.endDate}
                        onChange={(val) => handleExperienceChange(exp.id, "endDate", val)}
                        placeholder="Fecha fin"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleExperienceChange(exp.id, "endDate", "Actualidad")}
                      className="px-3"
                      title="Marcar como Actualidad"
                    >
                      Actual
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label>Descripción</Label>
                    <AIEnhanceButton 
                      text={exp.description} 
                      context="experience" 
                      onEnhance={(text) => handleExperienceChange(exp.id, "description", text)} 
                    />
                  </div>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                    placeholder="Describe tus responsabilidades y logros..."
                    className="h-20"
                  />
                </div>
              </div>
            </div>
          ))}
          {data.experience.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No has añadido experiencia todavía.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Educación</CardTitle>
          <Button variant="outline" size="sm" onClick={addEducation}>
            <Plus className="w-4 h-4 mr-2" />
            Añadir
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.education.map((edu, index) => (
            <div key={edu.id} className="space-y-4 relative border-b pb-6 last:border-0 last:pb-0">
              <div className="absolute right-0 top-0">
                <Button variant="ghost" size="icon" onClick={() => removeEducation(edu.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                <div className="space-y-2 md:col-span-2">
                  <Label>Institución</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(edu.id, "institution", e.target.value)}
                    placeholder="Universidad o Centro"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Titulación</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                    placeholder="Ej. Grado en Ingeniería Informática"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Inicio</Label>
                  <DatePicker
                    value={edu.startDate}
                    onChange={(val) => handleEducationChange(edu.id, "startDate", val)}
                    placeholder="Fecha inicio"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Fin</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <DatePicker
                        value={edu.endDate}
                        onChange={(val) => handleEducationChange(edu.id, "endDate", val)}
                        placeholder="Fecha fin"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleEducationChange(edu.id, "endDate", "Actualidad")}
                      className="px-3"
                      title="Marcar como Actualidad"
                    >
                      Actual
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {data.education.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No has añadido educación todavía.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Habilidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="skills">Tus habilidades (separadas por comas)</Label>
            <Textarea
              id="skills"
              value={data.skills.join(", ")}
              onChange={(e) => handleSkillsChange(e.target.value)}
              placeholder="React, TypeScript, Node.js, Diseño UI..."
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Carta de Presentación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="coverLetter">Contenido de la carta (opcional)</Label>
              <AIEnhanceButton 
                text={data.coverLetter} 
                context="coverLetter" 
                onEnhance={(text) => setData(prev => ({ ...prev, coverLetter: text }))} 
              />
            </div>
            <Textarea
              id="coverLetter"
              value={data.coverLetter}
              onChange={(e) => setData(prev => ({ ...prev, coverLetter: e.target.value }))}
              placeholder="Escribe aquí tu carta de presentación..."
              className="min-h-[200px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
