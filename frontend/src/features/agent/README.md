# Agente Rimi - Feature

## 🤖 RimiAgent Component

Botón flotante arrastrable (FAB) que representa al asistente de IA Rimi.

### Características

#### 🎨 Diseño
- Avatar circular de 64x64px
- Borde blanco de 2px con sombra XL
- Animación de pulso sutil en la sombra (rojo Rimac)
- Imagen con `object-cover` y `pointer-events-none`
- Se oculta automáticamente cuando el modal está abierto

#### 🎯 Interacción Avanzada
**Distinción Click vs Drag:**
- Usa `useRef` para guardar posición inicial en `onPointerDown`
- Calcula distancia recorrida en `onPointerUp`
- **< 3px**: Es un CLICK → Ejecuta `toggleOpen()`
- **> 3px**: Es un DRAG → Solo mueve el botón

#### 🎭 Animaciones (Framer Motion)
- `drag`: Permite arrastrar libremente
- `dragMomentum={false}`: Sin inercia, se queda donde lo sueltas
- `dragElastic={0}`: Sin efecto elástico
- `dragConstraints`: Limita el arrastre dentro de la ventana
- `whileTap`: Escala a 0.95 al presionar
- `layoutId="rimi-avatar"`: Shared layout con el modal

---

## 💬 ChatModal Component

Modal de chat con transición mágica usando Framer Motion Shared Layout.

### Características

#### 🎨 Diseño
- Modal centrado: 90% width, 80% height
- Fondo blanco con `rounded-3xl` y `shadow-2xl`
- z-index: 50 (por encima de todo)
- Backdrop oscuro con blur

#### ✨ Header con Avatar
- Avatar clickeable en el header (sin layoutId)
- **Transición mágica de apertura**: El avatar "viaja" desde la esquina hasta el header (layoutId solo en FAB)
- **Cierre 100% estable**: Modal se desvanece sin loops de animación
- Click en avatar cierra el modal con `stopPropagation()`
- Hover effect con scale en la imagen
- Muestra "Modo Texto" como indicador

#### 💬 Contenido
- **Mensajes**: Lista con scroll vertical, burbujas diferenciadas por sender
- **Chips de sugerencias**: Scroll horizontal con los 4 chips de mockData
- **Input**: Campo de texto con botones de micrófono y enviar
- **Auto-scroll**: Se desplaza automáticamente al último mensaje

#### 🔄 Funcionalidad
- Usa `useChatSession` para cargar y gestionar mensajes
- Simula respuesta de IA después de 1 segundo
- Chips clickeables que envían mensaje automáticamente
- Loading state mientras carga historial

### Integración
Renderizado en `MainLayout` dentro de `AnimatePresence`, visible solo cuando:
- `isOpen === true`
- `user.isFirstTime === false`
