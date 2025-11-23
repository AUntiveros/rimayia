# 📸 Ejemplos de Uso - RimiApp

## 🔐 Login

```typescript
// Credenciales de prueba
DNI: 123456789
Contraseña: usuario

// Flujo
1. Ingresar DNI y contraseña
2. Click en "Iniciar Sesión"
3. Esperar validación (800ms)
4. Redirección automática según isFirstTime
```

---

## 📋 Onboarding - Smart Health Check

### Ejemplo 1: Usuario sin condiciones crónicas

```typescript
// Datos
Peso: 70
Talla: 175
Condiciones: ['Ninguna']
Estilo de Vida: 'Activo/Deportista'

// Resultado
✅ Perfil completado
✅ isFirstTime: false
✅ Redirige a Home
✅ Tutorial se activa
```

### Ejemplo 2: Usuario con múltiples condiciones

```typescript
// Datos
Peso: 85
Talla: 180
Condiciones: ['Diabetes', 'Hipertensión']
Estilo de Vida: 'Sedentario'

// Resultado
✅ Perfil completado
✅ Ambas condiciones guardadas
✅ isFirstTime: false
✅ Redirige a Home
```

### Ejemplo 3: Cambio de selección

```typescript
// Secuencia de clicks
1. Click 'Diabetes' → selectedConditions = ['Diabetes']
2. Click 'Hipertensión' → selectedConditions = ['Diabetes', 'Hipertensión']
3. Click 'Ninguna' → selectedConditions = ['Ninguna']
4. Click 'Asma' → selectedConditions = ['Asma']
```

---

## 🏠 Home Page

### Ejemplo 1: Primera vez (con tutorial)

```typescript
// Estado
user.isFirstTime = false (recién completado onboarding)
localStorage.rimiapp_tutorial_pending = 'true'

// UI
✅ Saludo: "Hola, Carlos"
✅ Tarjetas visibles pero bloqueadas
✅ Backdrop oscuro bloqueando interacción
✅ Speech bubble flotante sobre el agente
✅ Texto: "¡Hola! Soy tu asistente Rimi, hazme clic para conocerme"
✅ Animación de flotación (arriba/abajo)
✅ Flecha apuntando al agente
✅ Solo el agente Rimi es clickeable (z-50)
```

### Ejemplo 2: Usuario regular

```typescript
// Estado
user.isFirstTime = false
localStorage.rimiapp_tutorial_pending = null

// UI
✅ Saludo: "Hola, Carlos"
✅ Tarjetas interactivas
✅ Sin backdrop
✅ Agente Rimi flotante en esquina
```

---

## 🤖 Agente Rimi

### Ejemplo 1: Drag (mover el avatar)

```typescript
// Acción
1. Presionar avatar
2. Mover más de 3px
3. Soltar

// Resultado
✅ Avatar se mueve a nueva posición
✅ Sin inercia (se queda donde lo sueltas)
✅ No abre el chat
```

### Ejemplo 2: Click (abrir chat)

```typescript
// Acción
1. Presionar avatar
2. Mover menos de 3px
3. Soltar

// Resultado
✅ Avatar desaparece
✅ Modal de chat aparece
✅ Avatar "viaja" a la esquina superior del modal
✅ Transición mágica (Shared Layout)
```

---

## 💬 Chat Modal

### Ejemplo 1: Enviar mensaje

```typescript
// Acción
1. Escribir "Hola"
2. Presionar Enter o click en botón enviar

// Resultado
✅ Mensaje aparece como burbuja azul (user)
✅ Input se limpia
✅ Después de 1s, respuesta de IA aparece
✅ Auto-scroll al último mensaje
```

### Ejemplo 2: Usar chip de sugerencia

```typescript
// Acción
1. Click en chip "Me siento mal"

// Resultado
✅ Mensaje "Me siento mal" se envía automáticamente
✅ Aparece como burbuja azul (user)
✅ Después de 1s, respuesta de IA
```

### Ejemplo 3: Cerrar modal

```typescript
// Opción 1: Click en avatar del header
1. Click en avatar circular del header

// Opción 2: Click en backdrop
1. Click fuera del modal (área oscura)

// Resultado (ambas opciones)
✅ Modal se desvanece suavemente
✅ Avatar reaparece en la esquina inferior derecha
✅ Sin loops de animación
```

### Ejemplo 4: Cerrar sesión

```typescript
// Acción
1. Click en botón "Cerrar Sesión" (esquina superior derecha)

// Resultado
✅ Usuario se desloguea
✅ localStorage se limpia (usuario + tutorial flag)
✅ Redirige a /login
✅ No puede volver atrás (replace: true)
```

---

## 🔄 Flujo Completo

```typescript
// Paso 1: Login
navigate('/login')
fillForm({ dni: '123456789', password: 'usuario' })
submit()
// → Redirige a /onboarding (isFirstTime: true)

// Paso 2: Onboarding
fillForm({
  peso: 70,
  talla: 175,
  conditions: ['Ninguna'],
  lifestyle: 'Activo/Deportista'
})
submit()
// → Actualiza user.isFirstTime = false
// → Redirige a / (Home)

// Paso 3: Tutorial
// → Backdrop aparece automáticamente
// → Speech bubble flotante sobre el agente
// → Animación de flotación llama la atención
clickBackdrop() // o clickRimiAvatar()
// → Tutorial se cierra

// Paso 4: Interactuar con Rimi
clickRimiAvatar()
// → Modal de chat se abre
// → Avatar viaja al header

// Paso 5: Chat
typeMessage('Hola')
pressEnter()
// → Mensaje enviado
// → Respuesta de IA después de 1s

// Paso 6: Cerrar chat
clickAvatarHeader()
// → Modal se desvanece
// → Avatar reaparece en esquina

// Paso 7: Cerrar sesión (para pruebas)
clickLogoutButton()
// → Redirige a /login
// → localStorage limpio
```

---

## 🎨 Estados Visuales

### Chips (Condiciones Crónicas)

```typescript
// No seleccionado
className: 'bg-secondary/10 text-secondary hover:bg-secondary/20'

// Seleccionado
className: 'bg-primary text-white shadow-md'

// Ejemplo visual
[ Diabetes ]  [ Hipertensión ]  [ Asma ]  [ Ninguna ]
   ✓ rojo         gris            gris      gris
```

### Radio Buttons (Estilo de Vida)

```typescript
// No seleccionado
className: 'bg-secondary/5 border-2 border-transparent hover:bg-secondary/10'

// Seleccionado
className: 'bg-accent/10 border-2 border-accent'

// Ejemplo visual
○ Fumador
● Sedentario          ← seleccionado (morado)
○ Activo/Deportista
```

### Burbujas de Chat

```typescript
// Mensaje del usuario
className: 'bg-primary text-white rounded-br-sm'
align: 'right'

// Mensaje de IA
className: 'bg-secondary/10 text-secondary rounded-bl-sm'
align: 'left'

// Ejemplo visual
                    [ Hola ]  ← usuario (rojo)
[ ¿Cómo puedo ayudarte? ]    ← IA (gris)
```

---

## 🐛 Casos Edge

### Caso 1: Recargar página durante onboarding

```typescript
// Acción
1. Llenar formulario parcialmente
2. Recargar página (F5)

// Resultado
✅ Formulario se resetea
✅ Sigue en /onboarding
✅ user.isFirstTime sigue siendo true
```

### Caso 2: Intentar volver atrás después de onboarding

```typescript
// Acción
1. Completar onboarding
2. Presionar botón "Atrás" del navegador

// Resultado
✅ No puede volver a /onboarding
✅ Se queda en / (Home)
✅ Gracias a navigate('/', { replace: true })
```

### Caso 3: Enviar mensaje vacío

```typescript
// Acción
1. Dejar input vacío
2. Presionar Enter

// Resultado
✅ No se envía mensaje
✅ Input sigue vacío
✅ Validación: if (!text.trim()) return;
```

---

## 📊 Métricas de Interacción

```typescript
// Tiempos de respuesta
Login: 800ms
Onboarding submit: 1000ms
IA response: 1000ms

// Animaciones
Modal open/close: 300ms
Avatar transition: 400ms
Chip hover: 200ms

// Umbrales
Click vs Drag: 3px
Drag constraints: window bounds - 100px
```
