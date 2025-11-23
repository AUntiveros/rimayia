# 🧪 Testing Guide - RimiApp

## Checklist de Funcionalidades

### ✅ Autenticación
- [ ] Login con credenciales correctas (123456789/usuario)
- [ ] Error al ingresar credenciales incorrectas
- [ ] Persistencia de sesión (recargar página mantiene login)
- [ ] Logout funcional

### ✅ Onboarding (Primera Vez)
- [ ] Formulario Smart Health Check se muestra
- [ ] Título dinámico con nombre del usuario
- [ ] Campos de peso y talla requeridos
- [ ] **Validación estricta**:
  - [ ] Peso <= 0 muestra error
  - [ ] Talla <= 0 muestra error
  - [ ] Peso < 30 o > 300 muestra error
  - [ ] Talla < 100 o > 250 muestra error
- [ ] **Condiciones Crónicas**: Chips seleccionables
  - [ ] Seleccionar "Ninguna" desmarca otras opciones
  - [ ] Seleccionar enfermedad desmarca "Ninguna"
  - [ ] Permite selección múltiple de enfermedades
- [ ] **Estilo de Vida**: Radio buttons (selección única)
- [ ] Validación: Al menos una condición y un estilo de vida
- [ ] Guardado exitoso actualiza `isFirstTime: false`
- [ ] Redirección automática al Home con `replace: true`
- [ ] Tutorial backdrop se activa después de completar

### ✅ Navegación
- [ ] Redirección a `/login` si no está autenticado
- [ ] Redirección a `/onboarding` si es primera vez
- [ ] Redirección a `/` después de onboarding
- [ ] Rutas protegidas funcionan correctamente

### ✅ Home Page
- [ ] Saludo personalizado con nombre del usuario
- [ ] Botón "Cerrar Sesión" visible en esquina superior derecha
- [ ] Click en "Cerrar Sesión" redirige a login
- [ ] Logout limpia usuario y localStorage
- [ ] Tarjetas "Mi Red de Cuidado" y "Comunidades" visibles
- [ ] Click en tarjeta "Mi Red de Cuidado" navega a /red-cuidado
- [ ] Click en tarjeta "Comunidades" navega a /comunidad
- [ ] **Tutorial mejorado**:
  - [ ] Backdrop oscuro bloquea interacción (NO clickeable)
  - [ ] Tarjetas se ven tenues (opacity-50) durante tutorial
  - [ ] Tarjetas NO son clickeables (pointer-events-none) durante tutorial
  - [ ] Botón logout también bloqueado (pointer-events-none + opacity-50)
  - [ ] Speech bubble flotante sobre el agente
  - [ ] Texto: "¡Hola! Soy tu asistente Rimi, hazme clic para conocerme"
  - [ ] Animación de flotación suave (arriba/abajo)
  - [ ] Flecha apuntando hacia el agente
  - [ ] **SOLO** click en Rimi cierra el tutorial
  - [ ] Click en backdrop NO cierra el tutorial
  - [ ] Click en tarjetas NO funciona durante tutorial
  - [ ] Click en logout NO funciona durante tutorial

### ✅ Community Page
- [ ] Título "Tus Comunidades de Salud" visible
- [ ] Botón "Volver" navega a Home
- [ ] 3 comunidades visibles:
  - [ ] Rimac Runners (gradiente rojo, emoji 🏃, imagen de fondo)
  - [ ] Gym & Power (gradiente morado, emoji 💪, imagen de fondo)
  - [ ] Mind & Chill (gradiente gris, emoji 🧘, imagen de fondo)
- [ ] Cada tarjeta muestra:
  - [ ] Imagen con gradiente y emoji (h-48)
  - [ ] Título en negrita
  - [ ] Descripción
  - [ ] Beneficio con punto de color
  - [ ] Botón "Unirme a la comunidad" con flecha
- [ ] Imágenes se cargan correctamente (no iconos fallback)
- [ ] Layout responsive (vertical móvil, horizontal desktop)

### ✅ Care Network Page (Mi Red de Cuidado)
- [ ] Título "Mi Red de Cuidado" visible
- [ ] Botón "Volver" navega a Home
- [ ] **Sección Delegación**:
  - [ ] Botón "Agregar Familiar" visible
  - [ ] Click abre prompt pidiendo DNI
  - [ ] Al ingresar DNI muestra alert de confirmación
- [ ] **Hub de Avatares**:
  - [ ] Avatar "Yo" visible
  - [ ] Avatar "Papá" visible (borde rojo - Attention Needed)
  - [ ] Avatar "Mamá" visible (borde verde - OK)
  - [ ] Click en avatar selecciona familiar
- [ ] **Dashboard de Detalle** (al seleccionar Papá):
  - [ ] Card "Signos Vitales" muestra frecuencia cardíaca y presión arterial
  - [ ] Card "Adherencia" muestra semáforo rojo con "Olvidó medicación"
  - [ ] Card "Póliza" muestra badge verde "Activa"
  - [ ] Botón "Recordar Medicamento" muestra alert con mensaje de voz
  - [ ] Botón "Agendar Cita" muestra alert de redirección
- [ ] **Dashboard de Detalle** (al seleccionar Mamá):
  - [ ] Semáforo verde con "Tomó su pastilla"
  - [ ] Todos los datos se actualizan correctamente

### ✅ Agente Rimi - FAB
- [ ] Avatar flotante visible en esquina inferior derecha
- [ ] Animación de pulso en la sombra
- [ ] **Click** (< 3px): 
  - [ ] Si es primera vez: Abre modal de configuración
  - [ ] Si ya configuró: Abre el modal de chat
- [ ] **Drag** (> 3px): Mueve el botón por la pantalla
- [ ] Botón se mantiene dentro de los límites de la ventana
- [ ] Se oculta cuando el modal está abierto

### ✅ Modal de Configuración (Setup)
- [ ] Aparece al primer click en Rimi después del onboarding
- [ ] Título: "¿Cómo prefieres comunicarte conmigo?"
- [ ] Dos opciones visibles:
  - [ ] Voz (icono micrófono, fondo rojo)
  - [ ] Texto (icono teclado, fondo morado)
- [ ] Click en "Voz":
  - [ ] Guarda preferencia en localStorage
  - [ ] Cierra modal de setup
  - [ ] Completa tutorial
  - [ ] Abre chat automáticamente
- [ ] Click en "Texto":
  - [ ] Guarda preferencia en localStorage
  - [ ] Cierra modal de setup
  - [ ] Completa tutorial
  - [ ] Abre chat automáticamente
- [ ] z-index 60 (por encima de todo)

### ✅ Modal de Chat
- [ ] **Apertura**: Transición suave con backdrop blur
- [ ] **Header**: Avatar con "Modo Texto"
- [ ] **Transición mágica**: Avatar viaja desde esquina hasta header (solo apertura)
- [ ] **Mensajes**: Historial de chat se carga correctamente
- [ ] **Burbujas**: Diferenciadas por sender (user/ai)
- [ ] **Auto-scroll**: Se desplaza al último mensaje
- [ ] **Chips**: 4 sugerencias visibles en scroll horizontal
- [ ] **Click en chip**: Envía mensaje automáticamente
- [ ] **Input**: Campo de texto funcional
- [ ] **Enviar**: Botón y Enter envían mensaje
- [ ] **Respuesta IA**: Simula respuesta después de 1 segundo
- [ ] **Cerrar**: Click en avatar del header cierra modal
- [ ] **Cerrar**: Click en backdrop cierra modal
- [ ] **Cierre suave**: Modal se desvanece sin loops de animación
- [ ] **Regreso**: Avatar reaparece en la esquina suavemente

### ✅ Responsive & Mobile
- [ ] Viewport configurado correctamente
- [ ] Tap highlight deshabilitado
- [ ] Gestos táctiles funcionan (drag, click)
- [ ] Modal se adapta a diferentes tamaños de pantalla
- [ ] Scroll horizontal de chips funciona en móvil

### ✅ Design System
- [ ] Colores corporativos aplicados correctamente
- [ ] Botones con variantes (primary, outline, ghost)
- [ ] Inputs con labels y errores
- [ ] Cards con rounded-2xl
- [ ] Animaciones suaves y fluidas

## 🐛 Bugs Conocidos

Ninguno por el momento.

## 🔍 Testing Manual

### Flujo Completo
1. Abrir `http://localhost:5173`
2. Login con 123456789/usuario
3. Completar onboarding
4. Ver tutorial backdrop
5. Click en Rimi para abrir chat
6. Enviar mensaje
7. Click en chip de sugerencia
8. Cerrar modal
9. Arrastrar avatar por la pantalla
10. Reabrir chat

### Edge Cases
- [ ] Recargar página durante onboarding
- [ ] Recargar página con modal abierto
- [ ] Arrastrar avatar fuera de límites
- [ ] Enviar mensaje vacío
- [ ] Scroll rápido en mensajes
- [ ] Múltiples clicks rápidos en avatar

## 📊 Performance

- [ ] Animaciones a 60fps
- [ ] Sin lag en drag del avatar
- [ ] Carga rápida de mensajes
- [ ] Transiciones suaves
