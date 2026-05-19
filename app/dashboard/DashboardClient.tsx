"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FileText, Plus, Trash2, Edit2, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteCV } from "@/app/actions/cv";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";

interface CVList {
  id: string;
  updated_at: string;
  title: string;
}

export function DashboardClient({ 
  initialCvs, 
  userName, 
  userImage 
}: { 
  initialCvs: CVList[], 
  userName: string, 
  userImage?: string | null 
}) {
  const [cvs, setCvs] = useState(initialCvs);
  
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("¿Seguro que quieres eliminar este CV? Esta acción no se puede deshacer.")) return;
    
    try {
      await deleteCV(id);
      setCvs(cvs.filter(cv => cv.id !== id));
      toast.success("CV eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el CV");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Currículums</h1>
            <p className="text-muted-foreground mt-2">Gestiona tus CVs y crea nuevos ({cvs.length}/4 usados)</p>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
               <LogOut className="w-4 h-4 mr-2" />
               Cerrar Sesión
             </Button>
             <Avatar>
               <AvatarImage src={userImage || ""} />
               <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
             </Avatar>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvs.map((cv) => (
            <Link key={cv.id} href={`/builder?id=${cv.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer group h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start text-lg">
                    <span className="truncate pr-2">{cv.title}</span>
                    <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0" />
                  </CardTitle>
                  <CardDescription>
                    Actualizado: {new Date(cv.updated_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="w-full h-32 bg-zinc-100 dark:bg-zinc-900 rounded-md flex items-center justify-center">
                    <span className="text-muted-foreground text-sm font-medium">Ver en el editor</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="ghost" size="sm" asChild>
                    <span>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </span>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={(e) => handleDelete(cv.id, e)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}

          {/* Create New Card */}
          {cvs.length < 4 ? (
            <Link href="/builder">
              <Card className="border-dashed hover:border-primary transition-colors cursor-pointer h-full min-h-[250px] flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg">Crear Nuevo CV</h3>
                <p className="text-sm text-muted-foreground mt-1">{4 - cvs.length} disponibles</p>
              </Card>
            </Link>
          ) : (
            <Card className="border-dashed h-full min-h-[250px] flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 opacity-75">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg text-muted-foreground">Límite alcanzado</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center px-4">
                Has alcanzado el límite de 4 CVs gratuitos. <br/> Pronto podrás acceder a más mediante suscripción.
              </p>
            </Card>
          )}
        </div>
        
      </div>
    </div>
  );
}
