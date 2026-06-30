import { TALENTS } from "@/lib/mock-data";
import { supabase } from "@/services/supabaseService";
import { AuthState, UserProfile } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Owner de la plataforma - protegido de demotions
const OWNER_EMAIL = "elielmaslaton@gmail.com";

/**
 * Convert mock data (TALENTS) to UserProfile objects for authentication
 * This is used for demo purposes with password "test123"
 */
const mockUsers: UserProfile[] = TALENTS.map((talent) => ({
  id: talent.id,
  email: `${talent.name.toLowerCase().replace(" ", ".")}@maslaconnect.com`,
  password: "test123", // Solo para demo
  name: talent.name,
  role: "freelancer" as const,
  avatar: talent.avatar,
  tagline: talent.tagline,
  bio: talent.bio,
  location: talent.location,
  skills: talent.skills,
  createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(),
}));

interface AuthStore extends AuthState {
  registeredUsers: UserProfile[];
  /** Datos pendientes de Google para seleccionar rol */
  pendingGoogleData: { name: string; email: string; avatar?: string } | null;
  /** Mostrar dialog de selección de rol */
  showRoleSelection: boolean;
  /** Authenticate user with email and password */
  login: (email: string, password: string) => void;
  /** Authenticate user with Google OAuth credentials */
  loginWithGoogle: (googleData: { name: string; email: string; avatar?: string }) => void;
  /** Confirmar rol seleccionado para nuevo usuario de Google */
  confirmGoogleRole: (role: "freelancer" | "client") => Promise<void>;
  /** Create new user account */
  register: (userData: Omit<UserProfile, "id" | "createdAt" | "updatedAt">) => void;
  /** Clear authentication and current user */
  logout: () => void;
  /** Update current user profile information */
  updateProfile: (updates: Partial<UserProfile>) => void;
  /** Set error message for UI display */
  setError: (error: string | null) => void;
  /** Grant admin privileges to a user */
  promoteToAdmin: (userId: string) => void;
  /** Revoke admin privileges from a user */
  demoteFromAdmin: (userId: string) => void;
  /** Retrieve all registered users */
  getAllUsers: () => UserProfile[];
  /** Load users from Supabase (for admin panel) */
  loadUsersFromSupabase: () => Promise<UserProfile[]>;
  /** Update any user's profile (admin only) */
  updateUser: (userId: string, updates: Partial<UserProfile>) => void;
  /** Delete a user account (admin only) */
  deleteUser: (userId: string) => void;
  /** Check if current user has admin privileges */
  isAdmin: () => boolean;
  /** Check if a user email is the platform owner */
  isOwner: (email: string) => boolean;
  /** Update password for a user by email */
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      pendingGoogleData: null,
      showRoleSelection: false,
      // Solo mantener Valentina Reyes como usuario mock
      registeredUsers: [],

      login: (email: string, password: string) => {
        set({ isLoading: true, error: null });

        (async () => {
          try {
            const allUsers = [...mockUsers, ...get().registeredUsers];
            let user = allUsers.find(
              (u) => u.email === email && u.password === password
            );

            if (!user) {
              const { data: supabaseUser, error } = await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .maybeSingle();

              if (!error && supabaseUser && supabaseUser.password === password) {
                user = {
                  id: supabaseUser.id,
                  email: supabaseUser.email,
                  password: supabaseUser.password,
                  name: supabaseUser.name,
                  role: supabaseUser.role as UserProfile["role"],
                  avatar: supabaseUser.avatar,
                  tagline: supabaseUser.tagline,
                  bio: supabaseUser.bio,
                  location: supabaseUser.location,
                  skills: supabaseUser.skills || [],
                  createdAt: new Date(supabaseUser.created_at),
                  updatedAt: new Date(supabaseUser.updated_at),
                };

                const alreadyRegistered = get().registeredUsers.some(
                  (u) => u.id === user!.id
                );
                if (!alreadyRegistered) {
                  set((state) => ({
                    registeredUsers: [...state.registeredUsers, user!],
                  }));
                }
              }
            }

            if (user) {
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: "Email o contraseña inválidos",
              });
            }
          } catch (error) {
            console.error("[Auth] Login error:", error);
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: "Error al iniciar sesión",
            });
          }
        })();
      },

      loginWithGoogle: (googleData) => {
        set({ isLoading: true, error: null });
        
        (async () => {
          try {
            const allUsers = [...mockUsers, ...get().registeredUsers];
            let user = allUsers.find((u) => u.email === googleData.email);
            
            // Solo elielmaslaton@gmail.com es admin por defecto
            const isAdmin = googleData.email === "elielmaslaton@gmail.com";
            
            // Si el usuario ya existe
            if (user) {
              // Actualizar solo nombre y avatar si cambiaron
              user = {
                ...user,
                name: googleData.name,
                avatar: googleData.avatar || user.avatar,
              };
              
              // Actualizar en Supabase
              await supabase
                .from("users")
                .update({ 
                  name: user.name,
                  avatar: user.avatar 
                })
                .eq("email", googleData.email);
              
              set((state) => {
                const updatedRegisteredUsers = state.registeredUsers.map((u) =>
                  u.email === googleData.email ? { ...u, name: user.name, avatar: user.avatar } : u
                );
                return {
                  registeredUsers: updatedRegisteredUsers,
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                };
              });
            } else {
              // Usuario nuevo
              if (isAdmin) {
                // Admin siempre se crea directamente
                user = {
                  id: `user_${Date.now()}`,
                  email: googleData.email,
                  name: googleData.name,
                  role: "admin" as const,
                  avatar: googleData.avatar,
                  tagline: "Administrador",
                  bio: "Gestor principal de la plataforma",
                  location: "Por definir",
                  skills: ["administración", "gestión de usuarios"],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                
                // Guardar en Supabase
                await supabase
                  .from("users")
                  .insert({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    tagline: user.tagline,
                    bio: user.bio,
                    location: user.location,
                    skills: user.skills,
                  });
                
                set((state) => ({
                  registeredUsers: [...state.registeredUsers, user as UserProfile],
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                }));
              } else {
                // Usuario normal necesita seleccionar rol
                set({
                  isLoading: false,
                  pendingGoogleData: googleData,
                  showRoleSelection: true,
                });
              }
            }
          } catch (error) {
            console.error("❌ Error in Google login:", error);
            set({
              isLoading: false,
              error: "Error durante el login con Google",
            });
          }
        })();
      },

      confirmGoogleRole: async (role: "freelancer" | "client") => {
        set({ isLoading: true, error: null });
        
        try {
          const googleData = get().pendingGoogleData;
          if (!googleData) {
            throw new Error("No hay datos pendientes de Google");
          }

          const user: UserProfile = {
            id: `user_${Date.now()}`,
            email: googleData.email,
            name: googleData.name,
            role,
            avatar: googleData.avatar,
            tagline: `Nuevo ${role === "freelancer" ? "freelancer" : "cliente"} en MaslaConnect`,
            bio: "Bienvenido a MaslaConnect",
            location: "Por definir",
            skills: role === "freelancer" ? [] : [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Guardar en Supabase
          await supabase
            .from("users")
            .insert({
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              avatar: user.avatar,
              tagline: user.tagline,
              bio: user.bio,
              location: user.location,
              skills: user.skills,
            });

          set((state) => ({
            user,
            isAuthenticated: true,
            isLoading: false,
            pendingGoogleData: null,
            showRoleSelection: false,
            registeredUsers: [...state.registeredUsers, user],
          }));
        } catch (error) {
          console.error("❌ Error al confirmar rol de Google:", error);
          set({
            isLoading: false,
            error: "Error al completar el registro",
          });
        }
      },

      register: (userData) => {
        set({ isLoading: true, error: null });
        
        (async () => {
          try {
            // Verificar que el email no existe en Supabase
            const { data: existingUser, error: checkError } = await supabase
              .from("users")
              .select("*")
              .eq("email", userData.email)
              .maybeSingle();

            if (checkError && checkError.code !== 'PGRST116') {
              throw checkError;
            }

            if (existingUser) {
              set({
                isLoading: false,
                error: "El email ya está registrado",
              });
              return;
            }

            // Crear nuevo usuario
            const newUser: UserProfile = {
              ...userData,
              id: `user_${Date.now()}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Guardar en Supabase
            console.log("[Auth] Saving new user to Supabase:", newUser.email);
            const { error: insertError } = await supabase
              .from("users")
              .insert({
                id: newUser.id,
                email: newUser.email,
                password: newUser.password || "",
                name: newUser.name,
                role: newUser.role,
                avatar: newUser.avatar,
                tagline: newUser.tagline,
                bio: newUser.bio,
                location: newUser.location,
                skills: newUser.skills || [],
              });

            if (insertError) {
              console.error("[Auth] Insert error:", insertError);
              throw insertError;
            }
            
            console.log("[Auth] User saved successfully:", newUser.email);

            set((state) => ({
              registeredUsers: [...state.registeredUsers, newUser],
              user: newUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            }));
          } catch (error) {
            console.error("[Auth] Register error:", error);
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : "Error al registrar el usuario",
            });
          }
        })();
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateProfile: (updates) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...updates,
                updatedAt: new Date(),
              }
            : null,
        }));
      },

      setError: (error) => {
        set({ error });
      },

      promoteToAdmin: (userId: string) => {
        (async () => {
          try {
            const state = get();
            // Buscar en registeredUsers Y en mockUsers
            let userToPromote = state.registeredUsers.find((u) => u.id === userId);
            if (!userToPromote) {
              userToPromote = mockUsers.find((u) => u.id === userId);
            }
            
            if (!userToPromote) {
              set({
                error: "Usuario no encontrado",
              });
              return;
            }
            
            // Primero, verificar si el usuario existe en Supabase
            const { data: existingUser, error: selectError } = await supabase
              .from("users")
              .select("*")
              .eq("id", userId)
              .maybeSingle();
            
            if (selectError) {
              throw selectError;
            }
            
            // Si no existe, insertarlo primero
            if (!existingUser) {
              const { error: insertError } = await supabase
                .from("users")
                .insert({
                  id: userToPromote.id,
                  email: userToPromote.email,
                  name: userToPromote.name,
                  role: "admin", // Insertar directamente como admin
                  avatar: userToPromote.avatar,
                  tagline: userToPromote.tagline,
                  bio: userToPromote.bio,
                  location: userToPromote.location,
                  skills: userToPromote.skills || [],
                });
              
              if (insertError) {
                throw insertError;
              }
            } else {
              // Si existe, actualizar el role
              const { error: updateError } = await supabase
                .from("users")
                .update({ role: "admin" })
                .eq("id", userId);
              
              if (updateError) {
                throw updateError;
              }
            }

            // Actualizar en estado local
            set((state) => {
              const updatedRegisteredUsers = state.registeredUsers.map((u) =>
                u.id === userId ? { ...u, role: "admin" as const } : u
              );
              return {
                registeredUsers: updatedRegisteredUsers,
                user: state.user?.id === userId ? { ...state.user, role: "admin" as const } : state.user,
              };
            });
          } catch (error) {
            console.error("Error promoting user to admin:", error);
            set({
              error: "Error al promocionar usuario a admin",
            });
          }
        })();
      },

      demoteFromAdmin: (userId: string) => {
        (async () => {
          try {
            // Encontrar el usuario para verificar su email
            const state = get();
            let userToDemote = state.registeredUsers.find((u) => u.id === userId);
            if (!userToDemote) {
              userToDemote = mockUsers.find((u) => u.id === userId);
            }
            
            // Prevenir demotions del owner
            if (userToDemote?.email === OWNER_EMAIL) {
              set({
                error: "No se puede remover los privilegios de administrador del propietario de la plataforma",
              });
              return;
            }
            
            // Primero, verificar si el usuario existe en Supabase
            const { data: existingUser, error: selectError } = await supabase
              .from("users")
              .select("*")
              .eq("id", userId)
              .maybeSingle();
            
            if (selectError) {
              throw selectError;
            }
            
            // Si no existe, insertarlo primero
            if (!existingUser) {
              const { error: insertError } = await supabase
                .from("users")
                .insert({
                  id: userToDemote!.id,
                  email: userToDemote!.email,
                  name: userToDemote!.name,
                  role: "freelancer", // Insertar directamente como freelancer
                  avatar: userToDemote!.avatar,
                  tagline: userToDemote!.tagline,
                  bio: userToDemote!.bio,
                  location: userToDemote!.location,
                  skills: userToDemote!.skills || [],
                });
              
              if (insertError) {
                throw insertError;
              }
            } else {
              // Si existe, actualizar el role
              const { error: updateError } = await supabase
                .from("users")
                .update({ role: "freelancer" })
                .eq("id", userId);
              
              if (updateError) {
                throw updateError;
              }
            }

            // Actualizar en estado local
            set((state) => {
              const updatedRegisteredUsers = state.registeredUsers.map((u) =>
                u.id === userId ? { ...u, role: "freelancer" as const } : u
              );
              return {
                registeredUsers: updatedRegisteredUsers,
                user: state.user?.id === userId ? { ...state.user, role: "freelancer" as const } : state.user,
              };
            });
          } catch (error) {
            console.error("Error demoting user from admin:", error);
            set({
              error: "Error al remover privilegios de administrador",
            });
          }
        })();
      },

      getAllUsers: () => {
        const state = get();
        // Supabase tiene la verdad. Deduplicar por ID: si existe en Supabase, usar eso
        const supabaseUserIds = new Set(state.registeredUsers.map(u => u.id));
        const mockUsersNotInSupabase = mockUsers.filter(u => !supabaseUserIds.has(u.id));
        return [...state.registeredUsers, ...mockUsersNotInSupabase];
      },

      loadUsersFromSupabase: async () => {
        try {
          // Obtener usuarios registrados de Supabase
          const { data: supabaseUsers, error } = await supabase
            .from("users")
            .select("*");

          if (error) throw error;

          // Mapear datos de Supabase a UserProfile
          const mappedUsers: UserProfile[] = (supabaseUsers || []).map((user: any) => ({
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role as "admin" | "freelancer",
            avatar: user.avatar,
            tagline: user.tagline,
            bio: user.bio,
            location: user.location,
            skills: user.skills || [],
            createdAt: new Date(user.created_at),
            updatedAt: new Date(user.updated_at),
          }));

          // Actualizar estado local con usuarios de Supabase
          set((state) => ({
            registeredUsers: mappedUsers,
          }));

          // Deduplicar: los usuarios de Supabase tienen prioridad por ID
          const supabaseUserIds = new Set(mappedUsers.map(u => u.id));
          const mockUsersNotInSupabase = mockUsers.filter(u => !supabaseUserIds.has(u.id));
          
          // Retornar usuarios de Supabase + mockUsers que no están en Supabase
          return [...mappedUsers, ...mockUsersNotInSupabase];
        } catch (error) {
          console.error("Error loading users from Supabase:", error);
          return [...mockUsers];
        }
      },

      updateUser: (userId: string, updates) => {
        set((state) => {
          const updatedRegisteredUsers = state.registeredUsers.map((u) =>
            u.id === userId ? { ...u, ...updates, updatedAt: new Date() } : u
          );
          return {
            registeredUsers: updatedRegisteredUsers,
            user: state.user?.id === userId ? { ...state.user, ...updates, updatedAt: new Date() } : state.user,
          };
        });
      },

      deleteUser: (userId: string) => {
        (async () => {
          try {
            // Encontrar el usuario para verificar si es el owner
            const state = get();
            const userToDelete = state.registeredUsers.find((u) => u.id === userId);
            
            // Prevenir eliminación del owner
            if (userToDelete?.email === OWNER_EMAIL) {
              set({
                error: "No se puede eliminar al propietario de la plataforma",
              });
              return;
            }
            
            console.log(`[Auth] Deleting user ${userId}...`);
            
            // Intentar eliminar de Supabase
            const { error: deleteError } = await supabase
              .from("users")
              .delete()
              .eq("id", userId);
            
            if (deleteError) {
              console.error(`[Auth] Delete error:`, deleteError);
              throw deleteError;
            }
            
            console.log(`[Auth] User deleted from Supabase`);

            // Eliminar del estado local
            set((state) => {
              const updatedRegisteredUsers = state.registeredUsers.filter((u) => u.id !== userId);
              return {
                registeredUsers: updatedRegisteredUsers,
                user: state.user?.id === userId ? null : state.user,
                isAuthenticated: state.user?.id === userId ? false : state.isAuthenticated,
              };
            });
            
            console.log(`[Auth] User deleted successfully`);
          } catch (error) {
            console.error("Error deleting user:", error);
            set({
              error: "Error al eliminar el usuario",
            });
          }
        })();
      },

      isAdmin: () => {
        const state = get();
        return state.user?.role === "admin";
      },

      isOwner: (email: string) => {
        return email === OWNER_EMAIL;
      },

      resetPassword: async (email: string, newPassword: string) => {
        try {
          set((state) => {
            const updatedRegisteredUsers = state.registeredUsers.map((u) =>
              u.email === email ? { ...u, password: newPassword, updatedAt: new Date() } : u
            );
            return {
              registeredUsers: updatedRegisteredUsers,
              user:
                state.user?.email === email
                  ? { ...state.user, password: newPassword, updatedAt: new Date() }
                  : state.user,
            };
          });

          await supabase
            .from("users")
            .update({ password: newPassword })
            .eq("email", email);

          return true;
        } catch (error) {
          console.error("[Auth] Reset password error:", error);
          return false;
        }
      },
    }),
    {
      name: "masla-auth", // LocalStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        registeredUsers: state.registeredUsers,
      }),
    }
  )
);
