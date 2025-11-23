# Changelog - RimiApp

## [0.1.0] - 2024-11-22

### ✅ Configuración Inicial
- Proyecto inicializado con Vite + React + TypeScript
- Tailwind CSS v3.4.17 (versión estable)
- PostCSS y Autoprefixer configurados
- Design System con colores corporativos Rimac

### 🎨 Componentes UI
- **Button**: Variantes primary, outline, ghost
- **Input**: Con label y manejo de errores
- **Card**: Contenedor con rounded-2xl
- **Spinner**: Loading state global

### 🔐 Autenticación
- AuthContext con persistencia en localStorage
- Login con validación
- Protección de rutas
- Manejo de estados de carga

### 📱 Páginas
- **LoginPage**: Formulario de autenticación
- **OnboardingPage**: Smart Health Check con lógica avanzada
  - Título dinámico con nombre del usuario
  - Chips seleccionables para condiciones crónicas
  - Lógica de exclusividad (Ninguna vs enfermedades)
  - Radio buttons para estilo de vida
  - Validación estricta (peso: 30-300kg, talla: 100-250cm)
- **HomePage**: Dashboard con tarjetas principales
- **CommunityPage**: Tus Comunidades de Salud
  - 3 comunidades: Rimac Runners, Gym & Power, Mind & Chill
  - Tarjetas con gradientes y emojis
  - Navegación desde HomePage
- **CareNetworkPage**: Mi Red de Cuidado (Family Manager)
  - Delegación: Agregar familiar con DNI
  - Hub de avatares: Yo + 2 familiares (Papá, Mamá)
  - Dashboard detallado por familiar:
    - Signos vitales (frecuencia cardíaca, presión arterial)
    - Semáforo de adherencia (verde/rojo)
    - Estado de póliza
    - Acciones remotas (recordar medicamento, agendar cita)

### 🤖 Agente Rimi
- **FAB arrastrable**: Botón flotante con distinción click/drag
- **ChatModal**: Modal con transición mágica (Shared Layout)
- **Mensajes**: Sistema de chat con burbujas diferenciadas
- **Chips**: Sugerencias rápidas en scroll horizontal
- **Auto-scroll**: Desplazamiento automático al último mensaje

### 🎭 Animaciones
- Framer Motion integrado
- Shared Layout Animation (avatar viaja desde esquina hasta header)
- Animación de pulso en el FAB
- Transiciones suaves en modal

### 🗺️ Navegación
- React Router configurado
- Rutas públicas y protegidas
- Redirecciones automáticas según estado de usuario
- Tutorial backdrop para onboarding

### 📊 Datos Mock
- Usuario de prueba (DNI: 123456789)
- Historial de chat simulado
- Chips de sugerencias
- Respuestas automáticas de IA

### 🔧 Configuración
- Viewport mobile optimizado
- Tap highlight deshabilitado
- Scrollbar oculto en chips
- TypeScript strict mode

### 📚 Documentación
- README.md principal
- QUICKSTART.md - Guía rápida
- NAVIGATION.md - Estructura de rutas
- TESTING.md - Checklist de testing
- TROUBLESHOOTING.md - Solución de problemas
- verify-setup.js - Script de verificación

### 🐛 Fixes
- Resuelto conflicto PostCSS + Tailwind v4
- Downgrade a Tailwind v3.4.17 (estable)
- Configuración correcta de PostCSS plugins
- Bug de redirección en onboarding (ahora usa `navigate('/', { replace: true })`)
- AuthContext ahora incluye `updateUser` para actualizar estado global
- Lógica de selección exclusiva en condiciones crónicas
- **Bug de animación infinita RESUELTO**: layoutId eliminado del header del modal
- Logout limpia correctamente usuario y flags de localStorage
- **Validación estricta en onboarding**: Peso y talla con rangos válidos
- **Tutorial bloqueado correctamente**: 
  - Solo se cierra al hacer click en Rimi
  - Tarjetas bloqueadas (pointer-events-none + opacity-50)
  - Botón logout también bloqueado durante tutorial
  - Imposible navegar durante tutorial
- **Imágenes DEFINITIVAMENTE arregladas**:
  - Importación estática en mockData.ts
  - Variables separadas: runnersImg, gymImg, yogaImg, dadImg, momImg, userImg
  - Asignadas directamente a propiedades image/avatar
  - Sin rutas de texto string

---

### ✨ Mejoras UX
- Botón de "Cerrar Sesión" en HomePage (esquina superior derecha)
- Logout limpia tutorial flag automáticamente
- **Tutorial mejorado con Speech Bubble**:
  - Burbuja flotante sobre el agente con animación
  - Texto más directo y amigable
  - Flecha visual apuntando al agente
  - Mejor UX que el modal anterior
- **Animación de cierre del modal 100% estable**:
  - layoutId eliminado del header del modal
  - Solo mantiene layoutId en el FAB (apertura mágica)
  - Cierre con desvanecimiento suave (sin loops)
  - stopPropagation en avatar del header
- **Modal de Configuración de Rimi (Setup)**:
  - Aparece al primer click en Rimi después del onboarding
  - Dos opciones: Voz (micrófono) o Texto (teclado)
  - Guarda preferencia en localStorage
  - Completa tutorial automáticamente
  - Abre chat después de seleccionar

---

## Próximas Versiones

### [0.2.0] - Planificado
- [ ] Integración con API real
- [ ] Modo voz (reconocimiento de voz)
- [ ] Notificaciones push
- [ ] Más funcionalidades del agente
- [ ] Tests unitarios y E2E
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Internacionalización (i18n)
