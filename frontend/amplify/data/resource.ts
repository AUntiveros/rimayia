import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { vincularFamiliar } from '../functions/link-family/resource';
import { getDashboard } from '../functions/get-dashboard/resource';

/*== MODELO DE DATOS - FAMILY MANAGER ====================================
Modelo User para gestión de familiares en app médica.
Campos:
- dni: Identificador único del usuario
- nombre: Nombre completo
- rol_familiar: Rol en la familia (Ej: Padre, Madre, Hija, Hijo)
- gestores_autorizados: DNIs de quienes pueden ver este perfil
- pacientes_a_cargo: DNIs de personas a cargo de este usuario
- solicitudes_pendientes: DNIs con solicitudes pendientes
=========================================================================*/
const schema = a.schema({
  User: a
    .model({
      dni: a.string().required(),
      nombre: a.string(),
      rol_familiar: a.string(),
      gestores_autorizados: a.string().array(),
      pacientes_a_cargo: a.string().array(),
      solicitudes_pendientes: a.string().array(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  
  vincularFamiliar: a
    .mutation()
    .arguments({
      dni_padre: a.string().required(),
      dni_hija: a.string().required(),
    })
    .returns(
      a.customType({
        success: a.boolean().required(),
        message: a.string(),
        data: a.string(),
      })
    )
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(vincularFamiliar)),
  
  verDashboardFamiliar: a
    .query()
    .arguments({
      dni_gestor: a.string().required(),
    })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(getDashboard)),
})
.authorization((allow) => [allow.publicApiKey()]);;

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
