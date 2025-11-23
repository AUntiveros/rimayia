// Tipos globales de la aplicación RimiApp

export interface User {
  dni: string;
  name: string;
  isFirstTime: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  type?: string; // 'options', 'confirmation', etc.
  payload?: any; // Datos adicionales (ej: TRIAGE_OPTIONS)
}

export interface ChipAction {
  label: string;
  action: string;
}

export interface Insurance {
  id: string;
  type: string;
  name: string;
  coverage: string;
  status: 'active' | 'pending' | 'expired';
}
