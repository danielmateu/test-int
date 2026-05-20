import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { AIEnhanceButton } from "./AIEnhanceButton";
import { CVData, Experience, Education } from "./types";
import { useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/app/actions/upload";
import { RichTextEditor } from "./RichTextEditor";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableExperienceItemProps {
  exp: Experience;
  handleExperienceChange: (id: string, field: keyof Experience, value: string) => void;
  removeExperience: (id: string) => void;
  t: any;
}

function SortableExperienceItem({ exp, handleExperienceChange, removeExperience, t }: SortableExperienceItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exp.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`space-y-4 relative border-b pb-6 last:border-0 last:pb-0 bg-card ${isDragging ? "shadow-lg rounded-lg border-b-0 p-4" : ""}`}>
      <div className="absolute right-0 top-0 flex items-center gap-1">
        <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover:bg-slate-100 text-slate-400">
          <GripVertical className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => removeExperience(exp.id)} className="text-red-500 hover:text-red-700">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-20 pt-2">
        <div className="space-y-2">
          <Label>{t("experience.company")}</Label>
          <Input value={exp.company} onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)} placeholder={t("experience.companyPlaceholder")} />
        </div>
        <div className="space-y-2">
          <Label>{t("experience.role")}</Label>
          <Input value={exp.role} onChange={(e) => handleExperienceChange(exp.id, "role", e.target.value)} placeholder={t("experience.rolePlaceholder")} />
        </div>
        <div className="space-y-2">
          <Label>{t("experience.startDate")}</Label>
          <DatePicker value={exp.startDate} onChange={(val) => handleExperienceChange(exp.id, "startDate", val)} placeholder={t("experience.startDate")} />
        </div>
        <div className="space-y-2">
          <Label>{t("experience.endDate")}</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <DatePicker value={exp.endDate} onChange={(val) => handleExperienceChange(exp.id, "endDate", val)} placeholder={t("experience.endDate")} />
            </div>
            <Button variant="outline" onClick={() => handleExperienceChange(exp.id, "endDate", t("experience.current"))} className="px-3" title={t("experience.current")}>{t("experience.current")}</Button>
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label>{t("experience.description")}</Label>
            <AIEnhanceButton text={exp.description} context="experience" onEnhance={(text) => handleExperienceChange(exp.id, "description", text)} />
          </div>
          <RichTextEditor value={exp.description} onChange={(val) => handleExperienceChange(exp.id, "description", val)} placeholder={t("experience.descriptionPlaceholder")} className="h-fit" />
        </div>
      </div>
    </div>
  );
}

interface SortableEducationItemProps {
  edu: Education;
  handleEducationChange: (id: string, field: keyof Education, value: string) => void;
  removeEducation: (id: string) => void;
  t: any;
}

function SortableEducationItem({ edu, handleEducationChange, removeEducation, t }: SortableEducationItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: edu.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`space-y-4 relative border-b pb-6 last:border-0 last:pb-0 bg-card ${isDragging ? "shadow-lg rounded-lg border-b-0 p-4" : ""}`}>
      <div className="absolute right-0 top-0 flex items-center gap-1">
        <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover:bg-slate-100 text-slate-400">
          <GripVertical className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => removeEducation(edu.id)} className="text-red-500 hover:text-red-700">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-20 pt-2">
        <div className="space-y-2 md:col-span-2">
          <Label>{t("education.institution")}</Label>
          <Input value={edu.institution} onChange={(e) => handleEducationChange(edu.id, "institution", e.target.value)} placeholder={t("education.institutionPlaceholder")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>{t("education.degree")}</Label>
          <Input value={edu.degree} onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)} placeholder={t("education.degreePlaceholder")} />
        </div>
        <div className="space-y-2">
          <Label>{t("education.startDate")}</Label>
          <DatePicker value={edu.startDate} onChange={(val) => handleEducationChange(edu.id, "startDate", val)} placeholder={t("education.startDate")} />
        </div>
        <div className="space-y-2">
          <Label>{t("education.endDate")}</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <DatePicker value={edu.endDate} onChange={(val) => handleEducationChange(edu.id, "endDate", val)} placeholder={t("education.endDate")} />
            </div>
            <Button variant="outline" onClick={() => handleEducationChange(edu.id, "endDate", t("education.current"))} className="px-3" title={t("education.current")}>{t("education.current")}</Button>
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label>{t("education.description")}</Label>
            <AIEnhanceButton text={edu.description || ""} context="education" onEnhance={(text) => handleEducationChange(edu.id, "description", text)} />
          </div>
          <RichTextEditor value={edu.description || ""} onChange={(val) => handleEducationChange(edu.id, "description", val)} placeholder={t("education.descriptionPlaceholder")} className="h-fit" />
        </div>
      </div>
    </div>
  );
}

interface CVFormProps {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
  status: "authenticated" | "unauthenticated" | "loading";
}

export function CVForm({ data, setData, status }: CVFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const t = useTranslations("CVForm");

  const handlePersonalInfoChange = (field: keyof CVData["personalInfo"], value: string) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("personalInfo.photoSizeError"));
      return;
    }

    setIsUploading(true);

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await uploadImage(base64Image);
      if (result.success && result.url) {
        handlePersonalInfoChange("imageUrl", result.url);
        toast.success(t("personalInfo.photoSuccess"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("personalInfo.photoError"));
    } finally {
      setIsUploading(false);
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
        { id: Date.now().toString(), institution: "", degree: "", startDate: "", endDate: "", description: "" },
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndExperience = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = prev.experience.findIndex((item) => item.id === active.id);
        const newIndex = prev.experience.findIndex((item) => item.id === over.id);
        return {
          ...prev,
          experience: arrayMove(prev.experience, oldIndex, newIndex),
        };
      });
    }
  };

  const handleDragEndEducation = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = prev.education.findIndex((item) => item.id === active.id);
        const newIndex = prev.education.findIndex((item) => item.id === over.id);
        return {
          ...prev,
          education: arrayMove(prev.education, oldIndex, newIndex),
        };
      });
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto pb-20">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("personalInfo.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {
              status === "authenticated" && (
                <div className="shrink-0 space-y-2 flex flex-col items-center sm:items-start">
                  <Label htmlFor="imageUpload">{t("personalInfo.photo")}</Label>
                  {data.personalInfo.imageUrl ? (
                    <div className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm">
                      <img
                        src={data.personalInfo.imageUrl}
                        alt={t("personalInfo.photo")}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePersonalInfoChange("imageUrl", "")}
                          className="text-white hover:text-red-400 hover:bg-transparent"
                          title={t("personalInfo.deletePhoto")}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                      ) : (
                        <>
                          <Input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title={t("personalInfo.uploadPhoto")}
                          />
                          <Plus className="w-6 h-6 text-slate-400" />
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            }

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("personalInfo.fullName")}</Label>
                <Input
                  id="fullName"
                  value={data.personalInfo.fullName}
                  onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
                  placeholder={t("personalInfo.fullNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">{t("personalInfo.jobTitle")}</Label>
                <Input
                  id="jobTitle"
                  value={data.personalInfo.jobTitle}
                  onChange={(e) => handlePersonalInfoChange("jobTitle", e.target.value)}
                  placeholder={t("personalInfo.jobTitlePlaceholder")}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("personalInfo.email")}</Label>
              <Input
                id="email"
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("personalInfo.phone")}</Label>
              <Input
                id="phone"
                value={data.personalInfo.phone}
                onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">{t("personalInfo.location")}</Label>
              <Input
                id="location"
                value={data.personalInfo.location}
                onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                placeholder={t("personalInfo.locationPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">{t("personalInfo.github")}</Label>
              <Input
                id="githubUrl"
                type="url"
                value={data.personalInfo.githubUrl || ""}
                onChange={(e) => handlePersonalInfoChange("githubUrl", e.target.value)}
                placeholder="https://github.com/usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">{t("personalInfo.linkedin")}</Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={data.personalInfo.linkedinUrl || ""}
                onChange={(e) => handlePersonalInfoChange("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">{t("personalInfo.portfolio")}</Label>
              <Input
                id="portfolioUrl"
                type="url"
                value={data.personalInfo.portfolioUrl || ""}
                onChange={(e) => handlePersonalInfoChange("portfolioUrl", e.target.value)}
                placeholder="https://tuweb.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="xUrl">{t("personalInfo.twitter")}</Label>
              <Input
                id="xUrl"
                type="url"
                value={data.personalInfo.xUrl || ""}
                onChange={(e) => handlePersonalInfoChange("xUrl", e.target.value)}
                placeholder="https://x.com/usuario"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="summary">{t("personalInfo.summary")}</Label>
                <AIEnhanceButton
                  text={data.personalInfo.summary}
                  context="summary"
                  onEnhance={(text) => handlePersonalInfoChange("summary", text)}
                />
              </div>
              <RichTextEditor
                value={data.personalInfo.summary}
                onChange={(val) => handlePersonalInfoChange("summary", val)}
                placeholder={t("personalInfo.summaryPlaceholder")}
                className="h-fit"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("experience.title")}</CardTitle>
          <Button variant="outline" size="sm" onClick={addExperience}>
            <Plus className="w-4 h-4 mr-2" />
            {t("experience.add")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndExperience}>
            <SortableContext items={data.experience.map(e => e.id)} strategy={verticalListSortingStrategy}>
              {data.experience.map((exp) => (
                <SortableExperienceItem
                  key={exp.id}
                  exp={exp}
                  handleExperienceChange={handleExperienceChange}
                  removeExperience={removeExperience}
                  t={t}
                />
              ))}
            </SortableContext>
          </DndContext>
          {data.experience.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t("experience.empty")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("education.title")}</CardTitle>
          <Button variant="outline" size="sm" onClick={addEducation}>
            <Plus className="w-4 h-4 mr-2" />
            {t("education.add")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndEducation}>
            <SortableContext items={data.education.map(e => e.id)} strategy={verticalListSortingStrategy}>
              {data.education.map((edu) => (
                <SortableEducationItem
                  key={edu.id}
                  edu={edu}
                  handleEducationChange={handleEducationChange}
                  removeEducation={removeEducation}
                  t={t}
                />
              ))}
            </SortableContext>
          </DndContext>
          {data.education.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t("education.empty")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("skills.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="skills">{t("skills.label")}</Label>
            <Textarea
              id="skills"
              value={data.skills.join(", ")}
              onChange={(e) => handleSkillsChange(e.target.value)}
              placeholder={t("skills.placeholder")}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("coverLetter.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="coverLetter">{t("coverLetter.label")}</Label>
              <AIEnhanceButton
                text={data.coverLetter}
                context="coverLetter"
                onEnhance={(text) => setData(prev => ({ ...prev, coverLetter: text }))}
              />
            </div>
            <RichTextEditor
              value={data.coverLetter}
              onChange={(val) => setData(prev => ({ ...prev, coverLetter: val }))}
              placeholder={t("coverLetter.placeholder")}
              className="min-h-50"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
