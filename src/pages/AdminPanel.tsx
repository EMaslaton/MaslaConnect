import { Navbar } from "@/components/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/store/authStore";
import { UserProfile } from "@/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const AdminPanel = () => {
  const { isAdmin, isOwner, loadUsersFromSupabase, promoteToAdmin, demoteFromAdmin, deleteUser, error, setError } = useAuthStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const adminAccess = isAdmin();

  useEffect(() => {
    if (error) {
      setNotification(error);
      const timer = setTimeout(() => {
        setNotification(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  const handleLoadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await loadUsersFromSupabase();
      setUsers(allUsers);
    } catch (loadError) {
      console.error("Error loading users:", loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminAccess) {
      handleLoadUsers();
    }
  }, [adminAccess]);

  if (!adminAccess) {
    return <Navigate to="/" replace />;
  }

  // Filtrar usuarios
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePromoteAdmin = (userId: string) => {
    promoteToAdmin(userId);
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: "admin" } : u)));
  };

  const handleDemoteAdmin = (userId: string) => {
    demoteFromAdmin(userId);
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: "freelancer" } : u)));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold text-foreground">Panel de Administrador</h1>
            <p className="text-muted-foreground">
              Gestiona usuarios, servicios y la plataforma desde aquí
            </p>
          </div>

          {/* Notification */}
          {notification && (
            <Alert variant="destructive">
              <AlertDescription>{notification}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card text-card-foreground rounded-xl p-6 border">
              <div className="text-sm text-muted-foreground">Total de Usuarios</div>
              <div className="text-3xl font-bold mt-2">{users.length}</div>
            </div>
            <div className="bg-card text-card-foreground rounded-xl p-6 border">
              <div className="text-sm text-muted-foreground">Administradores</div>
              <div className="text-3xl font-bold mt-2">
                {users.filter((u) => u.role === "admin").length}
              </div>
            </div>
            <div className="bg-card text-card-foreground rounded-xl p-6 border">
              <div className="text-sm text-muted-foreground">Freelancers</div>
              <div className="text-3xl font-bold mt-2">
                {users.filter((u) => u.role === "freelancer").length}
              </div>
            </div>
            <div className="bg-card text-card-foreground rounded-xl p-6 border">
              <div className="text-sm text-muted-foreground">Clientes</div>
              <div className="text-3xl font-bold mt-2">
                {users.filter((u) => u.role === "client").length}
              </div>
            </div>
          </div>

          {/* Gestión de Usuarios */}
          <div className="bg-card text-card-foreground rounded-xl p-6 border space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-display font-bold">Gestión de Usuarios</h2>
              <Button onClick={handleLoadUsers} disabled={loading} className="rounded-xl">
                {loading ? "Cargando..." : "Recargar"}
              </Button>
            </div>

            {/* Búsqueda */}
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl"
            />

            {/* Tabla de Usuarios */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge
                            variant={user.role === "admin" ? "default" : "secondary"}
                            className="rounded-full"
                          >
                            {isOwner(user.email) ? "👑 Propietario" : user.role === "admin" ? "🔐 Admin" : user.role === "freelancer" ? "👨‍💼 Freelancer" : "👤 Cliente"}
                          </Badge>
                          {isOwner(user.email) && (
                            <Badge variant="default" className="rounded-full bg-amber-600">
                              🔒 Protegido
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {user.role !== "admin" ? (
                          <Button
                            onClick={() => handlePromoteAdmin(user.id)}
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-xs"
                          >
                            Promover Admin
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleDemoteAdmin(user.id)}
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-xs"
                            disabled={isOwner(user.email)}
                            title={isOwner(user.email) ? "No se puede remover privilegios al propietario" : ""}
                          >
                            Remover Admin
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          size="sm"
                          variant="destructive"
                          className="rounded-lg text-xs"
                          disabled={isOwner(user.email)}
                          title={isOwner(user.email) ? "No se puede eliminar al propietario" : ""}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <Alert>
                <AlertDescription>No se encontraron usuarios.</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Información */}
          <Alert className="rounded-xl">
            <AlertDescription>
              Como administrador, puedes promover otros usuarios a administradores, eliminar usuarios,
              y gestionar la plataforma. Usa estos poderes con responsabilidad.
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;
