import type { Schema } from '../../data/resource';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: Schema['vincularFamiliar']['functionHandler'] = async (event) => {
  console.log("EVENTO VINCULACIÓN:", JSON.stringify(event));

  try {
    let { dni_padre, dni_hija } = event.arguments;

    if (!dni_padre || !dni_hija) return { success: false, message: 'Faltan parámetros' };

    dni_padre = dni_padre.trim();
    dni_hija = dni_hija.trim();

    const TABLE_NAME = "rimac-users";

    // ---------------------------------------------------------
    // PASO 1: Validar que el Padre existe
    // ---------------------------------------------------------
    const scanPadre = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'dni = :dni',
      ExpressionAttributeValues: { ':dni': dni_padre },
    });
    const resultPadre = await docClient.send(scanPadre);

    if (!resultPadre.Items || resultPadre.Items.length === 0) {
      return { success: false, message: `Padre con DNI ${dni_padre} no encontrado` };
    }
    const userPadre = resultPadre.Items[0];

    // ---------------------------------------------------------
    // PASO 2: Validar que la Hija existe
    // ---------------------------------------------------------
    const scanHija = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'dni = :dni',
      ExpressionAttributeValues: { ':dni': dni_hija },
    });
    const resultHija = await docClient.send(scanHija);

    if (!resultHija.Items || resultHija.Items.length === 0) {
      return { success: false, message: `Hija con DNI ${dni_hija} no encontrada` };
    }
    const userHija = resultHija.Items[0];

    // ---------------------------------------------------------
    // PASO 3: Actualización BIDIRECCIONAL (La corrección real)
    // ---------------------------------------------------------
    
    // A. Actualizar al PADRE (Agregar a la hija como gestor)
    const updatePadre = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { dni: userPadre.dni }, // Usamos el DNI real de la BD
      UpdateExpression: 'SET gestores_autorizados = list_append(if_not_exists(gestores_autorizados, :empty), :hija)',
      ExpressionAttributeValues: {
        ':hija': [dni_hija],
        ':empty': [],
      },
    });

    // B. Actualizar a la HIJA (Agregar al padre como paciente a cargo)
    // ESTO ES LO QUE FALTABA:
    const updateHija = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { dni: userHija.dni },
      UpdateExpression: 'SET pacientes_a_cargo = list_append(if_not_exists(pacientes_a_cargo, :empty), :padre)',
      ExpressionAttributeValues: {
        ':padre': [dni_padre],
        ':empty': [],
      },
    });

    // Ejecutamos ambas actualizaciones en paralelo
    await Promise.all([
      docClient.send(updatePadre),
      docClient.send(updateHija)
    ]);

    console.log("Vinculación bidireccional exitosa");

    return {
      success: true,
      message: "Vinculación Exitosa",
      data: JSON.stringify({ 
        padre: userPadre.nombre, 
        gestor: userHija.nombre,
        relacion: "Bidireccional establecida" 
      })
    };

  } catch (error) {
    console.error('ERROR CRÍTICO:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error: ${msg}` };
  }
};