import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export interface FamilyMember {
  dni: string;
  nombre: string;
  alerta_cronica: boolean;
  lista_enfermedades: string[];
  ultimo_diagnostico: string;
  fecha_ultima_visita: string;
  clinica_habitual: string;
  signos_vitales: { pulso: number; presion: string };
  adherencia: 'VERDE' | 'ROJO';
  estatus_poliza: string;
  proxima_cita: string;
}

export const useFamilyNetwork = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Acción 1: Vincular
  const vincularFamiliar = async (dniPadre: string, dniHija: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.mutations.vincularFamiliar({
        dni_padre: dniPadre,
        dni_hija: dniHija
      });
      
      // CORRECCIÓN: Ya viene como objeto, NO hacemos JSON.parse
      if (response.data) {
        const result = response.data; 
        
        // Verificamos éxito (Typescript puede quejarse si no casteamos, pero 'result' ya es el objeto)
        if (result && !result.success) {
            throw new Error(String(result.message)); 
        }
        return result;
      }
    } catch (err: any) {
      const msg = err.message ? String(err.message) : 'Error desconocido al vincular';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Acción 2: Obtener Dashboard
  const getDashboard = async (dniGestor: string): Promise<FamilyMember[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.queries.verDashboardFamiliar({
        dni_gestor: dniGestor
      });
      
      // CORRECCIÓN: Aquí SÍ hacemos JSON.parse porque la Lambda devuelve un String
      if (response.data) {
        // Aseguramos que sea string antes de parsear
        const dataString = String(response.data);
        return JSON.parse(dataString);
      }
      return [];
    } catch (err: any) {
      console.error("Error fetching dashboard", err);
      setError(String(err.message));
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { vincularFamiliar, getDashboard, loading, error };
};