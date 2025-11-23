# Navegación - RimiApp

## 🗺️ Estructura de Rutas

### Rutas Públicas
- `/login` - Página de inicio de sesión

### Rutas Protegidas
Requieren autenticación (`isAuthenticated: true`)

- `/onboarding` - Solo accesible si `user.isFirstTime === true`
- `/` (Home) - Página principal, usa `MainLayout`

## 🔒 Protección de Rutas

El componente `ProtectedRoute` maneja:
- Redirección a `/login` si no está autenticado
- Redirección a `/onboarding` si es primera vez
- Redirección a `/` si intenta acceder a onboarding sin ser primera vez
- Loading state mientras verifica autenticación

## 🎯 Flujo de Usuario

1. **Login** (`/login`)
   - Usuario ingresa DNI y contraseña
   - Si es válido, redirige según `isFirstTime`

2. **Onboarding** (`/onboarding`) - Solo primera vez
   - Completa Smart Health Check
   - Actualiza `isFirstTime: false`
   - Activa flag de tutorial
   - Redirige a Home

3. **Home** (`/`)
   - Muestra saludo personalizado
   - Tarjetas: "Mi Red de Cuidado" y "Comunidades"
   - Si viene de onboarding, muestra backdrop de tutorial
   - Contenedor `#rimi-agent-container` en esquina inferior derecha (z-50)

## 🎨 Layout

`MainLayout` proporciona:
- Contenedor centrado (max-w-md)
- Padding inferior para evitar overlap con agente
- Div flotante `#rimi-agent-container` (fixed, bottom-6, right-6, z-50)

## 📱 Tutorial Bloqueado

Cuando el usuario completa onboarding:
- Se activa backdrop oscuro (z-40)
- Bloquea interacción con todo EXCEPTO el agente (z-50)
- Muestra mensaje explicativo
- Se desactiva al hacer clic
