"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import {
  Users,
  Sparkles,
  DollarSign,
  Activity,
  Search,
  Trash2,
  ShieldCheck,
  Eye,
  ArrowLeft,
  Calendar,
  FileText,
  Clock,
  Briefcase,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  FolderOpen,
  FileSpreadsheet,
  AlertCircle,
  LogOut,
  ArrowLeftIcon,
  Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@/i18n/routing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from "recharts";
import {
  getAdminStats,
  getAdminUsers,
  updateUserSubscription,
  deleteUser,
  getUserDetails,
  AdminStats,
  AdminUser,
  UserDetails
} from "@/app/actions/admin";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

interface AdminClientProps {
  initialStats: AdminStats;
  initialUsers: AdminUser[];
  adminName: string;
  adminImage?: string | null;
}

export function AdminClient({
  initialStats,
  initialUsers,
  adminName,
  adminImage
}: AdminClientProps) {

  const router = useRouter();
  const t = useTranslations("Dashboard");

  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [loading, setLoading] = useState(false);

  // Filtros de búsqueda
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

  // Modales
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Modales de Suscripción
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [subTier, setSubTier] = useState<"free" | "active">("free");
  const [subMonths, setSubMonths] = useState(1);

  // Alerta de Eliminación
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const freshStats = await getAdminStats();
      const freshUsers = await getAdminUsers(search, tierFilter);
      setStats(freshStats);
      setUsers(freshUsers);
      toast.success("Datos actualizados correctamente");
    } catch (err: any) {
      toast.error("Error al actualizar datos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuarios al cambiar filtros
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      try {
        const filteredUsers = await getAdminUsers(search, tierFilter);
        setUsers(filteredUsers);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, tierFilter]);

  // Cargar expediente detallado del usuario
  const handleViewDetails = async (user: AdminUser) => {
    setSelectedUser(user);
    setLoadingDetails(true);
    setIsDetailsOpen(true);
    try {
      const details = await getUserDetails(user.id);
      setUserDetails(details);
    } catch (err: any) {
      toast.error("Error al cargar expediente: " + err.message);
      setIsDetailsOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Abrir panel de actualización de suscripción
  const handleOpenSubscription = (user: AdminUser) => {
    setSelectedUser(user);
    setSubTier(user.subscription_status === "active" || user.subscription_status === "trialing" ? "active" : "free");
    setSubMonths(1);
    setIsSubscriptionOpen(true);
  };

  // Guardar suscripción
  const handleSaveSubscription = async () => {
    if (!selectedUser) return;

    try {
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + subMonths);

      await updateUserSubscription(
        selectedUser.id,
        subTier,
        subTier === "active" ? periodEnd.toISOString() : undefined
      );

      toast.success(`Suscripción de ${selectedUser.name} actualizada con éxito`);
      setIsSubscriptionOpen(false);
      refreshData();
    } catch (err: any) {
      toast.error("Error al guardar cambios: " + err.message);
    }
  };

  // Confirmar eliminación
  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      toast.success(`Usuario ${userToDelete.name || userToDelete.email} eliminado.`);
      setUserToDelete(null);
      refreshData();
    } catch (err: any) {
      toast.error("Error al eliminar usuario: " + err.message);
    }
  };

  // Colores para Gráfico de Torta
  const PIE_COLORS = ["#10b981", "#64748b"];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">

        {/* HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center border-b pb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-900">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Panel de Administración</h1>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 animate-pulse">
                  Admin Mode
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Monitorea el uso de herramientas, métricas clave, suscripciones de usuarios y facturación.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
              className="cursor-pointer gap-2 h-9 px-3"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Sincronizar
            </Button>

            {/* <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={adminImage || ""} />
                <AvatarFallback>{adminName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <LanguageSwitcher />
              <ModeToggle />
            </div> */}

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full cursor-pointer">
                    <Avatar>
                      <AvatarImage src={adminImage || ""} />
                      <AvatarFallback>{adminName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                    <ArrowLeftIcon className="mr-2 h-4 w-4 text-emerald-500" />
                    <span>Panel Usuario</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                    <LogOut className="mr-2 h-4 w-4 text-red-600" />
                    <span>{t("logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <LanguageSwitcher />
              <ModeToggle />
            </div>
          </div>
        </header>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md h-10 p-1 bg-muted rounded-lg mb-6">
            <TabsTrigger value="overview" className="text-xs sm:text-sm h-8 cursor-pointer">Vista General</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm h-8 cursor-pointer">Usuarios ({stats.totalUsers})</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm h-8 cursor-pointer">Uso de IA</TabsTrigger>
          </TabsList>

          {/* VISTA GENERAL */}
          <TabsContent value="overview" className="space-y-6">
            {/* TARJETAS DE MÉTRICAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Usuarios Registrados</CardTitle>
                  <Users className="h-5 h-5 text-blue-500 bg-blue-500/10 p-1 rounded-md" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    Crecimiento orgánico mensual
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Suscripciones Premium</CardTitle>
                  <Sparkles className="h-5 h-5 text-emerald-500 bg-emerald-500/10 p-1 rounded-md fill-emerald-500/20" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.premiumUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalUsers > 0
                      ? `${((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}%`
                      : "0%"} tasa de conversión de pago
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">MRR Estimado</CardTitle>
                  <DollarSign className="h-5 h-5 text-violet-500 bg-violet-500/10 p-1 rounded-md" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.estimatedMRR.toFixed(2)} €</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    9.50€ por usuario Premium / mes
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Uso de Herramientas</CardTitle>
                  <Activity className="h-5 h-5 text-orange-500 bg-orange-500/10 p-1 rounded-md" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCVs + stats.totalSimulations}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalCVs} CVs y {stats.totalSimulations} Simulaciones IA
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Traducciones IA</CardTitle>
                  <Languages className="h-5 w-5 text-indigo-500 bg-indigo-500/10 p-1 rounded-md" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTranslations}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    CVs traducidos a otros idiomas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* GRÁFICOS */}
            {mounted && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Registros e interacción diaria */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Registros e Interacción Diaria</CardTitle>
                    <CardDescription>Actividad global agregada durante los últimos 30 días</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorCV" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorTrans" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                        <XAxis dataKey="date" fontSize={11} tickLine={false} />
                        <YAxis fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                        <Area type="monotone" dataKey="registrations" name="Nuevos Usuarios" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorReg)" />
                        <Area type="monotone" dataKey="cvs" name="CVs Creados" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorCV)" />
                        <Area type="monotone" dataKey="translations" name="Traducciones IA" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTrans)" />
                        <Area type="monotone" dataKey="simulations" name="Simulaciones IA" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorSim)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Distribución Suscripciones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Distribución de Usuarios</CardTitle>
                    <CardDescription>Tipo de cuenta activa de usuarios</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 flex flex-col justify-center items-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.subscriptionDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {stats.subscriptionDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-[44%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-center">
                      <span className="text-xs text-muted-foreground">Premium</span>
                      <p className="text-xl font-extrabold text-emerald-500">
                        {stats.totalUsers > 0
                          ? `${((stats.premiumUsers / stats.totalUsers) * 100).toFixed(0)}%`
                          : "0%"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Postulaciones Tracker */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Estados de Ofertas de Empleo en Seguimiento</CardTitle>
                    <CardDescription>Visualización de en qué etapa de postulación se encuentran las ofertas registradas</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.jobStatusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                        <XAxis dataKey="name" fontSize={11} tickLine={false} />
                        <YAxis fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                        <Bar dataKey="value" name="Ofertas" radius={[4, 4, 0, 0]}>
                          {stats.jobStatusDistribution.map((entry, index) => {
                            const colors = ["#6366f1", "#3b82f6", "#a855f7", "#10b981", "#ef4444"];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* LISTADO DE USUARIOS */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center pb-4">
                <div>
                  <CardTitle className="text-lg">Directorio de Usuarios</CardTitle>
                  <CardDescription>Gestiona las cuentas de los usuarios y configura accesos prioritarios.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

                  {/* Búsqueda */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-background border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Filtro Tier */}
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="all">Suscripciones: Todas</option>
                    <option value="premium">Premium Pro</option>
                    <option value="free">Gratuito</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="border-b bg-zinc-100/50 dark:bg-zinc-900/50 text-xs font-semibold text-muted-foreground uppercase">
                      <th className="p-4 pl-6">Usuario</th>
                      <th className="p-4">Suscripción</th>
                      <th className="p-4 text-center">CVs</th>
                      <th className="p-4 text-center">Entrevistas</th>
                      <th className="p-4 text-center">Seguimientos</th>
                      <th className="p-4 pr-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-muted-foreground">
                          Ningún usuario coincide con los filtros especificados.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => {
                        const isPremiumUser = user.subscription_status === "active" || user.subscription_status === "trialing";
                        return (
                          <tr key={user.id} className="border-b hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 text-sm">
                            <td className="p-4 pl-6 flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image || ""} />
                                <AvatarFallback>{(user.name || user.email || "U").charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{user.name || "Usuario Sin Nombre"}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              {isPremiumUser ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <Sparkles className="w-3 h-3 fill-emerald-500/10" />
                                    Premium
                                  </span>
                                  {user.subscription_current_period_end && (
                                    <p className="text-[10px] text-muted-foreground">
                                      Vence: {new Date(user.subscription_current_period_end).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 text-xs font-medium px-2 py-0.5 rounded-full border">
                                  Plan Free
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <div className="font-medium text-zinc-900 dark:text-zinc-100">{user.cvCount}</div>
                              {user.translationCount > 0 && (
                                <div className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold mt-0.5">
                                  ({user.translationCount} trad.)
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-center font-medium">{user.interviewCount}</td>
                            <td className="p-4 text-center font-medium">{user.jobCount}</td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Ver Expediente"
                                  onClick={() => handleViewDetails(user)}
                                  className="h-8 w-8 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                  <Eye className="w-4 h-4 text-blue-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Gestionar Suscripción"
                                  onClick={() => handleOpenSubscription(user)}
                                  className="h-8 w-8 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Eliminar Usuario"
                                  onClick={() => setUserToDelete(user)}
                                  className="h-8 w-8 rounded-md cursor-pointer hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USO DE IA */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  Métricas de Consumo de IA (Gemini API)
                </CardTitle>
                <CardDescription>
                  Estimaciones de consumo de tokens y llamadas de IA realizadas por las herramientas en la aplicación.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-5 border rounded-lg bg-zinc-50/50 dark:bg-zinc-900/20 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">ATS Optimizations</p>
                    <p className="text-2xl font-bold">{stats.totalCVs}</p>
                    <p className="text-xs text-muted-foreground">Promedio: ~3,500 tokens por análisis</p>
                  </div>
                  <div className="p-5 border rounded-lg bg-zinc-50/50 dark:bg-zinc-900/20 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Traducciones de CV</p>
                    <p className="text-2xl font-bold">{stats.totalTranslations}</p>
                    <p className="text-xs text-muted-foreground">Promedio: ~8,000 tokens por traducción</p>
                  </div>
                  <div className="p-5 border rounded-lg bg-zinc-50/50 dark:bg-zinc-900/20 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Simulaciones de Entrevistas</p>
                    <p className="text-2xl font-bold">{stats.totalSimulations}</p>
                    <p className="text-xs text-muted-foreground">Promedio: ~12,000 tokens por entrevista completa</p>
                  </div>
                  <div className="p-5 border rounded-lg bg-zinc-50/50 dark:bg-zinc-900/20 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Coste API Estimado</p>
                    <p className="text-2xl font-bold text-emerald-500">
                      {((stats.totalCVs * 3500 + stats.totalSimulations * 12000 + stats.totalTranslations * 8000) * 0.000000075).toFixed(4)} $
                    </p>
                    <p className="text-xs text-muted-foreground">Basado en tarifas de Gemini 2.5 Flash / 3.0 Flash</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-700 dark:text-amber-400 flex gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Nota sobre facturación:</p>
                    <p className="text-xs mt-0.5">
                      Este cálculo es un estimador local del tráfico API real. Los costes reflejan el uso de las llamadas de IA para redactar currículums, traducir currículums a otros idiomas, estructurar y evaluar simulaciones de entrevistas, y auditar currículums contra ofertas mediante el motor ATS.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* DIÁLOGO MODAL: EXPEDIENTE DEL USUARIO */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Expediente: {selectedUser?.name || selectedUser?.email}
            </DialogTitle>
            <DialogDescription>
              Resumen completo de documentos, simulaciones y postulaciones del usuario.
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="space-y-6 mt-4">
              {/* Sección Currículums Skeleton */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div key={idx} className="p-3 border rounded-lg flex items-center justify-between text-xs">
                      <div className="space-y-2 grow mr-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-5 w-16 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección Entrevistas Skeleton */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-500" />
                  <Skeleton className="h-4 w-52" />
                </div>
                <div className="space-y-2 pl-6">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div key={idx} className="p-3 border rounded-lg flex justify-between items-center text-xs">
                      <div className="space-y-2 grow mr-4">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección Postulaciones Skeleton */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-orange-500" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div key={idx} className="p-3 border rounded-lg flex justify-between items-center text-xs">
                      <div className="space-y-2 grow mr-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-5 w-16 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : userDetails ? (
            <div className="space-y-6 mt-4">

              {/* Sección Currículums */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Currículums Guardados ({userDetails.cvs.length})
                </h3>
                {userDetails.cvs.length === 0 ? (
                  <p className="text-xs text-muted-foreground pl-6">El usuario no ha creado ningún CV.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                    {userDetails.cvs.map((cv) => (
                      <div key={cv.id} className="p-3 border rounded-lg flex items-center justify-between text-xs hover:border-zinc-300 dark:hover:border-zinc-700 animate-fade-in">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold">{cv.title}</span>
                            {cv.isTranslation && (
                              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-indigo-500/20">
                                IA {cv.lang}
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-[10px]">
                            Modificado: {new Date(cv.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px] text-muted-foreground">
                          {cv.skillsCount} skills
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sección Entrevistas */}
              <div className="space-y-3 border-t pt-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                  <Clock className="w-4 h-4 text-violet-500" />
                  Historial de Simulaciones IA ({userDetails.interviews.length})
                </h3>
                {userDetails.interviews.length === 0 ? (
                  <p className="text-xs text-muted-foreground pl-6">El usuario no ha realizado entrevistas simuladas.</p>
                ) : (
                  <div className="space-y-2 pl-6">
                    {userDetails.interviews.map((sim) => {
                      const scoreColor = sim.score >= 80
                        ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                        : sim.score >= 50
                          ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                          : "text-red-500 bg-red-500/10 border-red-500/20";

                      return (
                        <div key={sim.id} className="p-3 border rounded-lg flex justify-between items-center text-xs hover:border-zinc-300 dark:hover:border-zinc-700">
                          <div>
                            <p className="font-semibold">{sim.job_title}</p>
                            <p className="text-muted-foreground text-[10px]">
                              {sim.company} • {new Date(sim.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full font-bold border ${scoreColor}`}>
                            {sim.score} / 100
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sección Postulaciones */}
              <div className="space-y-3 border-t pt-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                  <Briefcase className="w-4 h-4 text-orange-500" />
                  Postulaciones en Seguimiento ({userDetails.jobs.length})
                </h3>
                {userDetails.jobs.length === 0 ? (
                  <p className="text-xs text-muted-foreground pl-6">El usuario no está siguiendo ninguna vacante.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                    {userDetails.jobs.map((job) => {
                      const statusLabels: Record<string, string> = {
                        saved: "Guardado",
                        applied: "Postulado",
                        interviewing: "Entrevista",
                        offer: "Oferta",
                        rejected: "Descartado",
                      };
                      return (
                        <div key={job.id} className="p-3 border rounded-lg flex justify-between items-center text-xs hover:border-zinc-300 dark:hover:border-zinc-700">
                          <div>
                            <p className="font-semibold">{job.title}</p>
                            <p className="text-muted-foreground text-[10px]">{job.company}</p>
                          </div>
                          <span className="bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded text-[10px] font-medium border text-muted-foreground">
                            {statusLabels[job.status] || job.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          ) : null}

          <DialogFooter className="mt-6 border-t pt-4">
            <Button onClick={() => setIsDetailsOpen(false)} className="cursor-pointer">Cerrar Expediente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO MODAL: GESTIONAR SUSCRIPCIÓN */}
      <Dialog open={isSubscriptionOpen} onOpenChange={setIsSubscriptionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Suscripción de {selectedUser?.name || selectedUser?.email}
            </DialogTitle>
            <DialogDescription>
              Modifica de forma manual el nivel de privilegios y el acceso a funciones Premium.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {/* Selector de Nivel */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Nivel de Acceso</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={subTier === "free" ? "default" : "outline"}
                  onClick={() => setSubTier("free")}
                  className="cursor-pointer h-10 font-medium"
                >
                  Plan Gratuito
                </Button>
                <Button
                  type="button"
                  variant={subTier === "active" ? "default" : "outline"}
                  onClick={() => setSubTier("active")}
                  className="cursor-pointer h-10 font-medium border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                >
                  Premium Pro ✨
                </Button>
              </div>
            </div>

            {/* Selector de Tiempo (solo si es premium) */}
            {subTier === "active" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Duración de la Suscripción</label>
                <select
                  value={subMonths}
                  onChange={(e) => setSubMonths(Number(e.target.value))}
                  className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value={1}>1 Mes</option>
                  <option value={3}>3 Meses</option>
                  <option value={6}>6 Meses</option>
                  <option value={12}>12 Meses (1 Año)</option>
                </select>
                <p className="text-[10px] text-muted-foreground">
                  Se generará una fecha de expiración para el día:{" "}
                  {(() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + subMonths);
                    return d.toLocaleDateString();
                  })()}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsSubscriptionOpen(false)} className="cursor-pointer">
              Cancelar
            </Button>
            <Button onClick={handleSaveSubscription} className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO ALERTA: CONFIRMAR ELIMINACIÓN DE USUARIO */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              ¿Eliminar usuario en cascada?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará la cuenta del usuario junto con:
              <br />
              <strong className="text-zinc-900 dark:text-zinc-100">
                • {userToDelete?.cvCount} Currículums
                <br />
                • {userToDelete?.interviewCount} Simulaciones de Entrevistas
                <br />
                • {userToDelete?.jobCount} Procesos en Seguimiento
              </strong>
              <br />
              El usuario perderá de forma permanente todos sus accesos e historiales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUserConfirm}
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            >
              Eliminar Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
