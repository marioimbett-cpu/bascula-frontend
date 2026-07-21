import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ticketsService } from "@/services/modules";
import type { ListParams } from "@/services/resource";
import type { Ticket } from "@/interfaces/domain";

const TICKETS_KEY = "tickets";

/** Consulta paginada de tickets, usada en el listado del módulo de Báscula. */
export function useTicketsQuery(params: ListParams) {
  return useQuery({
    queryKey: [TICKETS_KEY, params],
    queryFn: () => ticketsService.list(params),
    placeholderData: (previous) => previous,
  });
}

/** Registra un ticket nuevo (captura por OCR, PDF o digitación manual) — sección 3.3 del esquema. */
export function useCrearTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<Ticket>) =>
      ticketsService.create({ estado: "Capturado", estadoValidacion: "Pendiente", ...payload }),
    onSuccess: () => {
      toast.success("Ticket registrado correctamente.");
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
    onError: () => {
      toast.error("No fue posible registrar el ticket.");
    },
  });
}

/** Valida un ticket (transición Capturado -> Validado), invalidando el listado tras confirmar. */
export function useValidarTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: string; data: Partial<Ticket> }) => ticketsService.patch(payload.id, payload.data),
    onSuccess: () => {
      toast.success("Ticket validado correctamente.");
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
    onError: () => {
      toast.error("No fue posible validar el ticket.");
    },
  });
}
