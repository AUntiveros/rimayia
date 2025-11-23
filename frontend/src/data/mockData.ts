import type { User, ChatMessage } from '../types';

// Imágenes
import rimiAvatar from '../assets/images/rimi-avatar.png';

// Community Images
import runnersImg from '../assets/images/community/runners.jpg';
import gymImg from '../assets/images/community/gym.jpg';
import yogaImg from '../assets/images/community/yoga.jpg';

// Family Images
import dadImg from '../assets/images/family/dad.jpg';
import momImg from '../assets/images/family/mom.jpg';
const userImg = rimiAvatar;

// Usuario mock para autenticación
export const MOCK_USER: User & { password: string } = {
  dni: '123456789',
  password: 'usuario',
  name: 'Carlos',
  isFirstTime: true,
};

// Historial de chat simulado (conversación de hoy)
export const CHAT_HISTORY: ChatMessage[] = [
  {
    id: '1',
    text: '¡Hola Carlos! Soy Rimi, tu asistente de salud. ¿En qué puedo ayudarte hoy?',
    sender: 'ai',
    timestamp: Date.now() - 3600000, // Hace 1 hora
  },
  {
    id: '2',
    text: 'Hola, necesito información sobre mis coberturas',
    sender: 'user',
    timestamp: Date.now() - 3500000,
  },
  {
    id: '3',
    text: 'Claro, tienes cobertura completa en consultas médicas, emergencias y medicamentos. ¿Necesitas algo específico?',
    sender: 'ai',
    timestamp: Date.now() - 3400000,
  },
];

// Chips de sugerencias rápidas
export const SUGGESTION_CHIPS: string[] = [
  'Me siento mal',
  'Simular Geofence',
  'Ver Reembolsos',
  'Rutina de hoy',
];

// Opciones de Triage (Rama A - Inteligencia de Síntomas)
export interface TriageOption {
  id: string;
  type: 'virtual' | 'home' | 'clinic';
  title: string;
  cost: string;
  time: string;
  traffic?: string;
  icon: 'video' | 'user' | 'hospital';
}

export const TRIAGE_OPTIONS: TriageOption[] = [
  {
    id: 'tele',
    type: 'virtual',
    title: 'Telemedicina',
    cost: 'S/0',
    time: 'Inmediato',
    icon: 'video',
  },
  {
    id: 'home',
    type: 'home',
    title: 'Médico a Domicilio',
    cost: 'S/30',
    time: '45 min',
    icon: 'user',
  },
  {
    id: 'clinic',
    type: 'clinic',
    title: 'Clínica Internacional',
    cost: 'S/60',
    time: '15 min',
    traffic: 'Alto',
    icon: 'hospital',
  },
];

// Comunidades de Salud
export interface Community {
  id: string;
  title: string;
  description: string;
  benefit: string;
  image: string;
  gradient: string;
  ctaText: string;
}

export const COMMUNITIES: Community[] = [
  {
    id: '1',
    title: 'Rimac Runners',
    description: 'Únete a nuestra comunidad de corredores y participa en retos mensuales de 50k.',
    benefit: 'Integración con Strava y seguimiento de progreso',
    image: runnersImg,
    gradient: 'linear-gradient(135deg, #E60000 0%, #FF4444 100%)',
    ctaText: 'Unirme a la comunidad',
  },
  {
    id: '2',
    title: 'Gym & Power',
    description: 'Mantén tu racha de asistencia al gimnasio y obtén recompensas exclusivas.',
    benefit: 'Descuentos en proteína y suplementos',
    image: gymImg,
    gradient: 'linear-gradient(135deg, #6B46C1 0%, #9B7DD4 100%)',
    ctaText: 'Unirme a la comunidad',
  },
  {
    id: '3',
    title: 'Mind & Chill',
    description: 'Practica yoga y meditación con nuestra comunidad de bienestar mental.',
    benefit: 'Descuento en suscripción Calm',
    image: yogaImg,
    gradient: 'linear-gradient(135deg, #2D2D2D 0%, #5D5D5D 100%)',
    ctaText: 'Unirme a la comunidad',
  },
];

// Red de Cuidado (Family Manager)
export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatar: string;
  status: 'OK' | 'Attention Needed';
  vitals: {
    heart: string;
    bp: string;
  };
  adherence: 'taken' | 'missed';
  policy: string;
}

export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: '1',
    name: 'Papá',
    relation: 'Padre',
    avatar: dadImg,
    status: 'Attention Needed',
    vitals: {
      heart: '85 bpm',
      bp: '120/80',
    },
    adherence: 'missed',
    policy: 'Activa',
  },
  {
    id: '2',
    name: 'Mamá',
    relation: 'Madre',
    avatar: momImg,
    status: 'OK',
    vitals: {
      heart: '72 bpm',
      bp: '110/70',
    },
    adherence: 'taken',
    policy: 'Activa',
  },
];

// Export para usar en otros componentes
export { userImg };
