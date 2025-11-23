import { defineFunction } from '@aws-amplify/backend';

export const getDashboard = defineFunction({
  name: 'get-dashboard',
  entry: './handler.ts',
});
