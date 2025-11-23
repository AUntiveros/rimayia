# Función Lambda: Vincular Familiar

## Descripción
Esta función permite vincular dos usuarios familiares en la app médica, agregando el DNI de un familiar (hija) al array `gestores_autorizados` del usuario padre.

## Uso desde el Frontend

```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

// Vincular familiar
const resultado = await client.mutations.vincularFamiliar({
  dni_padre: "12345678",
  dni_hija: "87654321"
});

console.log(resultado.data);
// { success: true, message: "Familiar vinculado exitosamente..." }
```

## Parámetros
- `dni_padre`: DNI del usuario que será gestionado
- `dni_hija`: DNI del usuario que podrá gestionar el perfil

## Respuesta
```typescript
{
  success: boolean;
  message?: string;
  data?: string; // JSON con los datos actualizados
}
```
