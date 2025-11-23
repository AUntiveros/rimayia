# Función Lambda: Get Dashboard

## Descripción
Esta función obtiene el dashboard de un gestor familiar, mostrando la información de todos los pacientes que tiene a cargo.

## Uso desde el Frontend

```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

// Obtener dashboard del gestor
const resultado = await client.queries.verDashboardFamiliar({
  dni_gestor: "87654321"
});

const pacientes = JSON.parse(resultado.data);
console.log(pacientes);
/*
[
  {
    nombre: "Juan Pérez",
    ultimo_diagnostico: "Hipertensión controlada",
    proxima_cita: "2024-12-15"
  },
  {
    nombre: "María García",
    ultimo_diagnostico: "Diabetes tipo 2",
    proxima_cita: "2024-12-20"
  }
]
*/
```

## Parámetros
- `dni_gestor`: DNI del usuario gestor (hija) que quiere ver su dashboard

## Respuesta
Retorna un JSON String con un array de objetos:
```typescript
[
  {
    nombre: string;
    ultimo_diagnostico: string;
    proxima_cita: string;
  }
]
```

Si no tiene pacientes a cargo, retorna `"[]"`.

## Tabla DynamoDB
La función usa la tabla hardcodeada: `rimac-users`

## Campos adicionales necesarios en User
Para que esta función funcione correctamente, los usuarios tipo "Padre" deben tener estos campos adicionales:
- `ultimo_diagnostico`: String
- `proxima_cita`: String
