# 🚀 Quick Start - RimiApp

## Instalación y Ejecución

```bash
cd RimiApp
npm install
node verify-setup.js  # Verificar configuración (opcional)
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Verificación de Configuración
Ejecuta `node verify-setup.js` para verificar que todas las dependencias y archivos de configuración estén correctos.

## 🔐 Login

```
DNI: 123456789
Contraseña: usuario
```

## 🎯 Flujo de Usuario

1. **Login** → Ingresa credenciales
2. **Onboarding** → Completa Smart Health Check (primera vez)
   - Peso y talla
   - Condiciones crónicas (selección múltiple con exclusividad)
   - Estilo de vida (selección única)
3. **Home** → Ver tarjetas principales
4. **Tutorial** → Backdrop te guía a interactuar con Rimi
5. **Chat** → Click en el avatar flotante para abrir el chat

## 🤖 Interacción con Rimi

### FAB (Botón Flotante)
- **Click**: Abre el modal de chat
- **Drag**: Arrastra el botón por la pantalla
- **Distinción automática**: < 3px = click, > 3px = drag

### Modal de Chat
- **Abrir**: Click en el avatar flotante
- **Cerrar**: Click en el avatar del header o en el backdrop
- **Enviar mensaje**: Escribe y presiona Enter o click en botón enviar
- **Chips**: Click en cualquier sugerencia para enviar mensaje rápido
- **Transición mágica**: El avatar "viaja" desde la esquina hasta el header

## 📁 Estructura Clave

```
src/
├── features/agent/
│   ├── RimiAgent.tsx      # FAB arrastrable
│   └── ChatModal.tsx      # Modal de chat
├── pages/
│   ├── LoginPage.tsx      # Autenticación
│   ├── OnboardingPage.tsx # Smart Health Check
│   └── HomePage.tsx       # Dashboard principal
├── components/
│   ├── ui/                # Componentes reutilizables
│   └── layout/            # Layouts
├── context/
│   └── AuthContext.tsx    # Estado de autenticación
├── hooks/
│   ├── useChatSession.ts  # Gestión de mensajes
│   └── usePermissions.ts  # Permisos simulados
└── data/
    └── mockData.ts        # Datos de prueba
```

## 🎨 Design System

### Colores
- `primary`: #E60000 (Rojo Rimac)
- `secondary`: #2D2D2D (Negro suave)
- `accent`: #6B46C1 (Morado)
- `background`: #F8F9FA (Gris claro)
- `surface`: #FFFFFF (Blanco)

### Componentes UI
- `Button`: primary, outline, ghost
- `Input`: Con label y errores
- `Card`: rounded-2xl con sombra
- `Spinner`: Loading state

## 🔧 Tecnologías

- **React 18** + TypeScript
- **Vite** (Build tool)
- **Tailwind CSS** (Estilos)
- **Framer Motion** (Animaciones)
- **React Router** (Navegación)
- **Lucide React** (Iconos)

## 📝 Próximos Pasos

- [ ] Integrar API real de chat
- [ ] Implementar modo voz
- [ ] Agregar más funcionalidades al agente
- [ ] Conectar con backend de seguros
- [ ] Implementar notificaciones push
