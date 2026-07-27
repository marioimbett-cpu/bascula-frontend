import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usuariosService } from "@/services/modules";
import type { ListParams } from "@/services/resource";
import type { RolUsuario } from "@/interfaces/domain";
import type { UsuarioFormValues } from "@/utils/validation-schemas";

const USUARIOS_KEY = "usuarios";

export function useUsuariosQuery(params: ListParams) {
  return useQuery({
    queryKey: [USUARIOS_KEY, params],
    queryFn: () => usuariosService.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useCrearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UsuarioFormValues) => usuariosService.create({ ...payload, activo: true }),
    onSuccess: () => {
      toast.success("Usuario creado correctamente.");
      queryClient.invalidateQueries({ queryKey: [USUARIOS_KEY] });
    },
    onError: () => toast.error("No fue posible crear el usuario."),
  });
}

/** Cambia el rol de un usuario — determina sus permisos por módulo (sección 3.12). */
export function useCambiarRol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; rol: RolUsuario }) => usuariosService.patch(payload.id, { rol: payload.rol }),
    onSuccess: () => {
      toast.success("Rol actualizado.");
      queryClient.invalidateQueries({ queryKey: [USUARIOS_KEY] });
    },
    onError: () => toast.error("No fue posible actualizar el rol."),
  });
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; activo: boolean }) => usuariosService.patch(payload.id, { activo: payload.activo }),
    onSuccess: () => {
      toast.success("Usuario actualizado.");
      queryClient.invalidateQueries({ queryKey: [USUARIOS_KEY] });
    },
    onError: () => toast.error("No fue posible actualizar el usuario."),
  });
}
