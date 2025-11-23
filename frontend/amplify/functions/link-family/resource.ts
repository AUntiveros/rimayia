import { defineFunction } from '@aws-amplify/backend';

export const vincularFamiliar = defineFunction({
  name: 'link-family',
  entry: './handler.ts',
  
  // ESTA ES LA LÍNEA MÁGICA QUE ARREGLA EL ERROR:
  resourceGroupName: 'data', 
  
  environment: {
    // Si tienes el nombre real ponlo, si no, deja un string temporal
    USER_TABLE_NAME: process.env.USER_TABLE_NAME || 'User_Table_Placeholder'
  }
});