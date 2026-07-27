import { Settings } from "lucide-react";
import { ModuloEnConstruccion } from "@/components/layouts/modulo-en-construccion";

export default function ConfiguracionPage() {
  return (
    <ModuloEnConstruccion
      titulo="Configuración"
      descripcion="Preferencias del sistema, series de documentos y parámetros generales"
      icon={<Settings className="h-6 w-6" aria-hidden="true" />}
    />
  );
}
