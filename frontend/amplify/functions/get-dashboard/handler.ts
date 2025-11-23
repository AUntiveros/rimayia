import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'rimac-users';

export const handler: Schema['verDashboardFamiliar']['functionHandler'] = async (event) => {
  try {
    const { dni_gestor } = event.arguments;

    if (!dni_gestor) {
        return JSON.stringify({ success: false, message: 'Falta dni_gestor' });
    }

    // 1. Buscar a la Gestora (Hija)
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'dni = :dni',
      ExpressionAttributeValues: { ':dni': dni_gestor },
    });

    const scanResult = await docClient.send(scanCommand);

    if (!scanResult.Items || scanResult.Items.length === 0) {
      return JSON.stringify([]); 
    }

    const userGestor = scanResult.Items[0];
    const pacientesACargo = userGestor.pacientes_a_cargo || [];

    if (pacientesACargo.length === 0) {
        return JSON.stringify([]);
    }

    // 2. Buscar datos de cada Paciente (Papá)
    const pacientesPromises = pacientesACargo.map(async (dniPaciente: string) => {
      try {
        const scanPaciente = new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'dni = :dni',
          ExpressionAttributeValues: { ':dni': dniPaciente },
        });

        const result = await docClient.send(scanPaciente);
        if (!result.Items || result.Items.length === 0) return null;

        const p = result.Items[0];

        // --- LÓGICA DE HISTORIAL CLÍNICO ---
        let historial = [];
        if (Array.isArray(p.historial_clinico)) {
            historial = p.historial_clinico;
        } else if (typeof p.historial_clinico === 'string') {
            try { historial = JSON.parse(p.historial_clinico); } catch(e) {}
        }
        const ultimoEvento = historial.length > 0 ? historial[0] : null;


        // --- NUEVA LÓGICA: SIMULACIÓN DE DATOS FALTANTES (Para la Demo) ---
        
        // A. Signos Vitales (Random realista para demo)
        const signosVitales = {
            pulso: Math.floor(Math.random() * (90 - 65) + 65), // Entre 65 y 90 bpm
            presion: "120/80"
        };

        // B. Semáforo de Adherencia (Random: 70% probabilidad de Verde)
        const adherenciaHoy = Math.random() > 0.3 ? 'VERDE' : 'ROJO';

        // C. Estado de Póliza (Viene de BD o default)
        const estadoPoliza = p.poliza_estado || "Activa";

        // D. Próxima Cita (Simulada para mañana)
        const proximaCita = "Mañana, 09:00 AM - Cardiología";


        // --- RETORNO DEL OBJETO COMPLETO ---
        return {
          dni: p.dni,
          nombre: p.nombre || 'Paciente',
          
          // Datos Médicos Reales
          alerta_cronica: p.enfermedades && p.enfermedades.length > 0, 
          lista_enfermedades: p.enfermedades || [],
          ultimo_diagnostico: ultimoEvento?.diagnostico || 'Chequeo General',
          fecha_ultima_visita: ultimoEvento?.fecha || '2024-01-01',
          clinica_habitual: ultimoEvento?.clinica || 'Clínica Internacional',

          // Datos Nuevos (Para Dashboard Fase 3)
          signos_vitales: signosVitales,
          adherencia: adherenciaHoy,
          estatus_poliza: estadoPoliza,
          proxima_cita: proximaCita
        };

      } catch (error) {
        console.error(`Error paciente ${dniPaciente}:`, error);
        return null;
      }
    });

    const pacientesData = await Promise.all(pacientesPromises);
    
    return JSON.stringify(pacientesData.filter((p) => p !== null));

  } catch (error) {
    console.error('Error dashboard:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return JSON.stringify({ error: msg });
  }
};