# 🎙️ Sistema de Modos: Texto vs Voz

## Fecha: Implementación Completa

---

## 🎯 Objetivo

Implementar un sistema de cambio de modo entre Texto y Voz que:
1. Persista la preferencia del usuario en localStorage
2. Ofrezca interfaces optimizadas para cada modo
3. Mantenga la arquitectura lista para integración con AWS Transcribe

---

## 🏗️ Arquitectura Implementada

### 1. Estado del Modo

```typescript
const [mode, setMode] = useState<'text' | 'voice'>('text');
```

**Valores posibles**:
- `'text'`: Modo Texto (input + botones)
- `'voice'`: Modo Voz (botón grande de micrófono)

---

### 2. Persistencia en localStorage

#### Carga Inicial

```typescript
useEffect(() => {
  const preference = localStorage.getItem('rimiapp_communication_preference');
  if (preference === 'voice') {
    setMode('voice');
  } else {
    setMode('text');
  }
}, []);
```

**Key de localStorage**: `rimiapp_communication_preference`

**Valores**:
- `'voice'`: Usuario prefiere voz
- `'text'`: Usuario prefiere texto
- `null`: Primera vez (default a texto)

#### Actualización

```typescript
const toggleMode = () => {
  const newMode = mode === 'text' ? 'voice' : 'text';
  setMode(newMode);
  localStorage.setItem('rimiapp_communication_preference', newMode);
};
```

**Sincronización**:
- Cambio de estado inmediato
- Persistencia automática en localStorage
- Disponible en próximas sesiones

---

## 🎨 UI Components

### Header con Toggle

```tsx
<div className="bg-primary p-4 flex items-center gap-3">
  {/* Avatar */}
  <div className="w-12 h-12 rounded-full...">
    <img src={rimiAvatar} alt="Rimi Assistant" />
  </div>
  
  {/* Info */}
  <div className="flex-1">
    <h2 className="text-white font-bold text-lg">Rimi</h2>
    <p className="text-white/80 text-xs">
      {mode === 'text' ? 'Modo Texto' : 'Modo Voz'}
    </p>
  </div>
  
  {/* Toggle Button */}
  <button onClick={toggleMode} className="w-10 h-10 rounded-full...">
    {mode === 'text' ? (
      <Mic className="w-5 h-5 text-white" />
    ) : (
      <Keyboard className="w-5 h-5 text-white" />
    )}
  </button>
</div>
```

**Características**:
- Indicador dinámico: "Modo Texto" / "Modo Voz"
- Botón circular con icono contextual
- Tooltip en hover
- Sin emojis en texto

---

### Footer - Modo Texto

```tsx
{mode === 'text' && (
  <form onSubmit={handleSubmit} className="p-4 border-t...">
    <div className="flex gap-2">
      {/* Input de texto */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Escribe tu mensaje..."
        className="flex-1 px-4 py-3 rounded-xl..."
      />
      
      {/* Botón de micrófono rápido */}
      <button
        type="button"
        onClick={handleVoiceInput}
        disabled={isListening}
        className={`w-12 h-12 rounded-xl... ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-accent/10 text-accent hover:bg-accent/20'
        }`}
      >
        <Mic className="w-5 h-5" />
      </button>
      
      {/* Botón de enviar */}
      <button type="submit" className="w-12 h-12 bg-primary...">
        <Send className="w-5 h-5" />
      </button>
    </div>
  </form>
)}
```

**Características**:
- Input de texto completo
- Botón de micrófono rápido (acceso directo)
- Botón de enviar
- Feedback visual en micrófono (rojo pulsante)

---

### Footer - Modo Voz

```tsx
{mode === 'voice' && (
  <div className="p-6 border-t... flex flex-col items-center gap-3">
    {/* Botón grande de micrófono */}
    <button
      onClick={handleVoiceInput}
      disabled={isListening}
      className={`w-20 h-20 rounded-full... shadow-lg ${
        isListening
          ? 'bg-red-600 text-white animate-pulse scale-110'
          : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105'
      }`}
    >
      <Mic className="w-10 h-10" />
    </button>
    
    {/* Texto de ayuda */}
    <p className="text-xs text-secondary/60">
      {isListening ? 'Escuchando...' : 'Presiona para hablar'}
    </p>
  </div>
)}
```

**Características**:
- Botón grande y centrado (w-20 h-20)
- Fondo rojo (#DC2626)
- Animación pulse cuando escucha
- Escala aumentada (scale-110) al escuchar
- Texto de ayuda dinámico
- Sin input de texto visible

---

## 🔄 Flujo de Usuario

### Escenario 1: Usuario Nuevo (Primera Vez)

```
1. Usuario abre chat
   ↓
2. localStorage vacío → mode = 'text'
   ↓
3. Header muestra: "Modo Texto"
   ↓
4. Footer muestra: Input + botones
   ↓
5. Usuario hace click en toggle (icono Mic)
   ↓
6. mode = 'voice'
   ↓
7. localStorage = 'voice'
   ↓
8. Header muestra: "Modo Voz"
   ↓
9. Footer muestra: Botón grande de micrófono
```

### Escenario 2: Usuario Recurrente

```
1. Usuario abre chat
   ↓
2. localStorage = 'voice'
   ↓
3. mode = 'voice' (automático)
   ↓
4. Header muestra: "Modo Voz"
   ↓
5. Footer muestra: Botón grande de micrófono
   ↓
6. Preferencia persistida entre sesiones
```

### Escenario 3: Cambio de Modo en Sesión

```
Usuario en Modo Voz:
1. Click en toggle (icono Keyboard)
   ↓
2. mode = 'text'
   ↓
3. localStorage = 'text'
   ↓
4. UI cambia instantáneamente
   ↓
5. Footer muestra input de texto
   ↓
6. Conversación continúa sin interrupciones
```

---

## 🎤 Integración con handleVoiceInput

### Modo Texto
- Botón pequeño (w-12 h-12) en footer
- Acceso rápido sin cambiar de modo
- Útil para mensajes puntuales por voz

### Modo Voz
- Botón grande (w-20 h-20) centrado
- Experiencia optimizada para voz
- Interfaz minimalista

**Ambos modos usan la misma función**:
```typescript
const handleVoiceInput = async () => {
  // 1. Solicitar permisos
  await requestPermission('mic');
  
  // 2. Acceder al micrófono
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // 3. Activar estado
  setIsListening(true);
  
  // 4. Simular transcripción (3s)
  setTimeout(() => {
    stream.getTracks().forEach(track => track.stop());
    setIsListening(false);
    handleSendMessage('Me duele la cabeza');
  }, 3000);
};
```

---

## 📊 Estados Visuales

### Botón de Toggle (Header)

| Estado | Icono | Color | Acción |
|--------|-------|-------|--------|
| Modo Texto | Mic | Blanco | Cambiar a Voz |
| Modo Voz | Keyboard | Blanco | Cambiar a Texto |

### Botón de Micrófono (Modo Texto)

| Estado | Fondo | Animación | Tamaño |
|--------|-------|-----------|--------|
| Normal | accent/10 | - | w-12 h-12 |
| Escuchando | red-500 | pulse | w-12 h-12 |
| Disabled | accent/10 | - | w-12 h-12 |

### Botón de Micrófono (Modo Voz)

| Estado | Fondo | Animación | Tamaño |
|--------|-------|-----------|--------|
| Normal | red-600 | - | w-20 h-20 |
| Hover | red-700 | scale-105 | w-20 h-20 |
| Escuchando | red-600 | pulse + scale-110 | w-20 h-20 |
| Disabled | red-600 | - | w-20 h-20 |

---

## 🧪 Testing Checklist

### Persistencia
- [ ] Abrir chat → Verificar modo 'text' por defecto
- [ ] Cambiar a 'voice' → Cerrar chat → Reabrir
- [ ] Verificar que mantiene modo 'voice'
- [ ] Cambiar a 'text' → Cerrar chat → Reabrir
- [ ] Verificar que mantiene modo 'text'
- [ ] Verificar localStorage key: `rimiapp_communication_preference`

### UI - Modo Texto
- [ ] Verificar header muestra "Modo Texto"
- [ ] Verificar toggle muestra icono Mic
- [ ] Verificar footer muestra input de texto
- [ ] Verificar botón de micrófono pequeño visible
- [ ] Verificar botón de enviar visible
- [ ] Click en toggle → Cambiar a Modo Voz

### UI - Modo Voz
- [ ] Verificar header muestra "Modo Voz"
- [ ] Verificar toggle muestra icono Keyboard
- [ ] Verificar footer NO muestra input de texto
- [ ] Verificar botón grande de micrófono centrado
- [ ] Verificar texto "Presiona para hablar"
- [ ] Click en toggle → Cambiar a Modo Texto

### Funcionalidad - Modo Texto
- [ ] Escribir mensaje → Enviar → Verificar funciona
- [ ] Click en micrófono pequeño → Verificar grabación
- [ ] Verificar botón se vuelve rojo pulsante
- [ ] Esperar 3s → Verificar mensaje enviado

### Funcionalidad - Modo Voz
- [ ] Click en botón grande → Verificar grabación
- [ ] Verificar botón se vuelve rojo pulsante + scale-110
- [ ] Verificar texto cambia a "Escuchando..."
- [ ] Esperar 3s → Verificar mensaje enviado
- [ ] Verificar botón vuelve a estado normal

### Integración
- [ ] Cambiar de modo durante conversación
- [ ] Verificar mensajes previos se mantienen
- [ ] Verificar chips de sugerencias funcionan
- [ ] Verificar tarjetas de triage funcionan
- [ ] Verificar botones de cámara funcionan

---

## 🔧 Configuración de SetupModal

El modo inicial también se puede configurar desde el SetupModal:

```typescript
// En SetupModal.tsx
const handleComplete = (preference: 'voice' | 'text') => {
  localStorage.setItem('rimiapp_communication_preference', preference);
  // ... resto de la lógica
};
```

**Flujo**:
1. Usuario completa onboarding
2. SetupModal pregunta: "Voz" o "Texto"
3. Guarda preferencia en localStorage
4. ChatModal lee preferencia al abrir
5. Inicia en modo preferido

---

## 📈 Métricas Sugeridas

### Uso de Modos
- % de usuarios que usan Modo Voz
- % de usuarios que usan Modo Texto
- Frecuencia de cambio de modo por sesión

### Engagement
- Tiempo promedio en cada modo
- Mensajes enviados por modo
- Tasa de éxito de transcripción (futuro)

### Preferencias
- Modo preferido por demografía
- Modo preferido por hora del día
- Modo preferido por tipo de consulta

---

## 🚀 Próximos Pasos

### Fase 1: Mejoras de UX
- [ ] Animación de transición entre modos
- [ ] Haptic feedback en móviles
- [ ] Sonido de confirmación al grabar
- [ ] Visualización de forma de onda

### Fase 2: AWS Transcribe
- [ ] Integrar transcripción real
- [ ] Mostrar texto mientras transcribe
- [ ] Permitir editar antes de enviar
- [ ] Soporte multiidioma

### Fase 3: Optimizaciones
- [ ] Detección automática de modo preferido
- [ ] Sugerencia de modo según contexto
- [ ] Modo híbrido (voz + texto simultáneo)
- [ ] Comandos de voz avanzados

---

## 💡 Notas de Diseño

### Por qué dos interfaces diferentes?

**Modo Texto**:
- Usuarios que prefieren escribir
- Entornos ruidosos
- Mayor precisión en consultas complejas
- Acceso rápido a voz sin cambiar modo

**Modo Voz**:
- Usuarios que prefieren hablar
- Manos ocupadas (conduciendo, cocinando)
- Mayor velocidad en consultas simples
- Interfaz minimalista y enfocada

### Principios de Diseño

1. **Persistencia**: La preferencia se mantiene entre sesiones
2. **Flexibilidad**: Cambio de modo en cualquier momento
3. **Claridad**: Indicador visible del modo actual
4. **Accesibilidad**: Ambos modos igualmente funcionales
5. **Simplicidad**: Sin emojis, texto limpio y profesional

---

**Última actualización**: Sistema de modos implementado y verificado
**Estado**: ✅ Listo para testing en dispositivos reales
**Próximo milestone**: Integración con AWS Transcribe
