import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { vincularFamiliar } from './functions/link-family/resource';
import { getDashboard } from './functions/get-dashboard/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  vincularFamiliar,
  getDashboard,
});

// TRUCO DE HACKATHON: "La Llave Maestra"
// Le damos permiso a las Lambdas para tocar CUALQUIER tabla de DynamoDB.
// (En producción esto es malo, pero hoy necesitamos velocidad).
backend.vincularFamiliar.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:*'], // Leer, Escribir, Escanear... todo.
    resources: ['*'],        // En cualquier tabla de tu cuenta.
  })
);

backend.getDashboard.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:*'],
    resources: ['*'],
  })
);