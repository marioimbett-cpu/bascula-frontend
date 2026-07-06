"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { tokenStorage } from "@/services/api";
import { empresasService } from "@/services/modules";
import type { Empresa } from "@/interfaces/domain";

interface EmpresaContextValue {
  empresas: Empresa[];
  empresaActiva: Empresa | null;
  isLoading: boolean;
  seleccionarEmpresa: (empresa: Empresa) => void;
}

const EmpresaContext = createContext<EmpresaContextValue | undefined>(undefined);

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaActiva, setEmpresaActiva] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await empresasService.list({ pageSize: 100 });
        setEmpresas(respuesta.data);
        const guardadaId = tokenStorage.getEmpresaActiva();
        const encontrada = respuesta.data.find((e) => e.id === guardadaId);
        setEmpresaActiva(encontrada ?? respuesta.data[0] ?? null);
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, []);

  const seleccionarEmpresa = (empresa: Empresa) => {
    setEmpresaActiva(empresa);
    tokenStorage.setEmpresaActiva(empresa.id);
  };

  return (
    <EmpresaContext.Provider value={{ empresas, empresaActiva, isLoading, seleccionarEmpresa }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresaActiva() {
  const ctx = useContext(EmpresaContext);
  if (!ctx) throw new Error("useEmpresaActiva debe usarse dentro de EmpresaProvider");
  return ctx;
}
