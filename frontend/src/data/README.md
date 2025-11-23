# Capa de Datos - RimiApp

## 📦 Mock Data

### Usuario de Prueba
```
DNI: 123456789
Contraseña: usuario
Nombre: Carlos
Primera vez: true
```

### Historial de Chat
- 3 mensajes simulados de conversación de hoy
- Incluye mensajes del usuario y de la IA Rimi

### Chips de Sugerencias
- "Me siento mal"
- "Subir Receta"
- "Ver Reembolsos"
- "Rutina de hoy"

## 🔐 Autenticación

El `AuthContext` proporciona:
- `user`: Usuario actual o null
- `isAuthenticated`: Boolean de estado de autenticación
- `login(dni, password)`: Función async para login
- `logout()`: Función para cerrar sesión
- `isLoading`: Estado de carga inicial

Persistencia en `localStorage` con key `rimiapp_user`.

## 🪝 Hooks Disponibles

### `useChatSession()`
Retorna:
- `messages`: Array de mensajes filtrados por fecha (últimas 24h)
- `isLoading`: Estado de carga
- `addMessage(text, sender)`: Función para agregar mensajes

### `usePermissions()`
Retorna:
- `permissions`: Objeto con estados de permisos (camera, mic, gps)
- `request(type)`: Función async para solicitar permiso
- `isRequesting`: Estado de solicitud en progreso

Simula delay de 1 segundo y aprueba automáticamente en desarrollo.
