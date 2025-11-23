# 🤖 Flujos de Chat Inteligente - Rimi

## 📋 Resumen de Implementación

Se han implementado tres ramas principales de inteligencia en el chat:

### **RAMA A: Triage Inteligente + Pre-Admisión + GPS**
Flujo completo de atención médica con detección de síntomas y navegación.

### **RAMA B: Geofence + Reembolsos + OCR**
Flujo de reembolsos activado por ubicación con captura de documentos.

### **RAMA C: Ciclo de Medicación (Interoperabilidad + Gamificación)**
Importación automática de recetas vía HL7 con sistema de puntos Wellness.

---

## 🔴 RAMA A: Triage Inteligente

### Trigger
Usuario menciona síntomas: `dolor`, `duele`, `mal`, `fiebre`, `enfermo`, `síntoma`

### Flujo Completo

```
Usuario: "Me siento mal"
         ↓
IA: "Entiendo. Por tus síntomas, podría ser una infección. 
     Analizando tus mejores opciones..."
         ↓ (1.5s delay)
IA: [Muestra 3 tarjetas interactivas]
    • Telemedicina (S/0, Inmediato)
    • Médico a Domicilio (S/30, 45 min)
    • Clínica San Felipe (S/60, 15 min, Tráfico Alto)
         ↓
Usuario: [Click en "Clínica Internacional"]
         ↓
IA: "¿Deseas activar la Pre-Admisión? 
     Esto enviará una alerta al hospital..."
         ↓
Usuario: "Sí"
         ↓
IA: "✅ Alerta enviada. Abriendo ruta optimizada..."
         ↓ (500ms)
IA: "📍 Ubicación detectada" [Solicita permiso GPS]
         ↓ (800ms)
IA: [Muestra mapa con pin rojo]
    "Ruta optimizada a Clínica Internacional"
    15 min • 3.2 km
         ↓ (2s)
[Alert nativo]: "📱 Abriendo Waze con destino: Clínica Internacional..."
         ↓ (500ms)
IA: "¿Necesitas algo más antes de salir?"
```

### Componentes UI
- **Tarjetas de Triage**: Botones con iconos (Video/User/Hospital), costo, tiempo, tráfico
- **Mapa Simulado**: Placeholder con gradiente azul, pin de ubicación, distancia
- **Permisos GPS**: Integración con `usePermissions` hook

---

## 🟢 RAMA B: Geofence + Reembolsos

### Trigger
Usuario escribe: `Simular Geofence` o `Estoy donde el doctor`

### Flujo Completo

```
Usuario: "Simular Geofence"
         ↓
IA: "📍 Detecto que estás en el consultorio del Dr. Pérez. 
     Tienes cobertura por reembolso (70%). 
     ¿Iniciamos el trámite?"
         ↓
[Muestra 2 chips: "Sí, iniciar" | "No"]
         ↓
Usuario: [Click en "Sí, iniciar"]
         ↓
IA: "Recuerda pedir Factura e Informe. 
     Sube tus documentos."
         ↓
[Muestra botón: "📷 Subir Documentos"]
         ↓
Usuario: [Click en botón → Abre cámara nativa]
         ↓
Usuario: [Toma foto de factura]
         ↓
IA: "📷 Documento capturado"
         ↓
IA: "Procesando OCR... ⏳"
         ↓ (2s delay)
IA: "✅ Documentos legibles. 
     Solicitud enviada. 
     Respuesta en 48h. 
     ¿Deseas ver otros reembolsos?"
```

### Componentes UI
- **Chips de Geofence**: Botones "Sí, iniciar" / "No"
- **Botón de Cámara**: Botón grande con icono de cámara
- **Input File Oculto**: `<input type="file" accept="image/*" capture="environment">`
- **Estado de Procesamiento**: Spinner durante OCR

---

## 🟣 RAMA C: Ciclo de Medicación

### Trigger 1: Receta o Medicamento
Usuario menciona: `receta` o `medicamento`

### Flujo Completo - Escenario 1 (Interoperabilidad HL7)

```
Usuario: "Necesito mi receta"
         ↓
IA: "Veo que acabas de atenderte en la Clínica Internacional. 
     ¿Me autorizas a importar tu diagnóstico y receta 
     automáticamente desde su sistema?"
         ↓
[Muestra 2 chips: "Sí, importar" | "No, subir foto"]
         ↓
Usuario: [Click en "Sí, importar"]
         ↓ (2s - Indicador "Escribiendo...")
IA: "Conectando con sistema HL7 de la clínica..."
         ↓ (1.5s)
IA: "Receta Importada con éxito:

     💊 Ibuprofeno 400mg (Tomar cada 8h por 3 días).
     
     ⏰ He configurado tus alarmas automáticamente."
         ↓ (500ms)
IA: "🏆 ¡Ganaste 200 Puntos Wellness por adherencia al tratamiento!"
     [Badge animado dorado]
```

### Flujo Completo - Escenario 2 (Foto Manual)

```
Usuario: [Click en "No, subir foto"]
         ↓
IA: "Entendido. Sube una foto de tu receta física 
     para configurar tus alarmas."
         ↓
[Muestra botón: "📷 Subir Documentos"]
         ↓
Usuario: [Captura foto de receta]
         ↓
[Procesamiento OCR similar a Rama B]
```

### Trigger 2: Post-Visita Simulado

```
Usuario: "Simular Salida"
         ↓
IA: "Esperamos que te sientas mejor. 
     ¿Te recetaron algo? 
     Sube tu receta ahora para ganar puntos."
         ↓
[Muestra botón: "📷 Subir Documentos"]
```

### Componentes UI
- **Chips de Importación**: "Sí, importar" / "No, subir foto"
- **Indicador de Conexión**: "Conectando con sistema HL7..."
- **Badge de Gamificación**: Gradiente dorado con animación de escala
- **Puntos Wellness**: +200 puntos por adherencia

---

## 🎨 Mejoras Visuales

### TypingIndicator Component
- **Ubicación**: `src/components/ui/TypingIndicator.tsx`
- **Diseño**: Burbuja gris alineada a la izquierda (estilo IA)
- **Animación**: 3 puntos con movimiento vertical y opacidad
- **Timing**: Bucle infinito con delays escalonados (0ms, 150ms, 300ms)
- **Integración**: Se muestra cuando `isTyping === true`

### CommunityPage
- **Gradiente Mejorado**: `from-black/90 via-black/60 to-transparent`
- **Legibilidad**: Texto perfectamente legible sobre cualquier imagen
- **Emojis**: Mantenidos solo en el icono central con `drop-shadow-lg`

---

## 🧪 Testing Manual

### Rama A (Triage)
1. Abrir chat
2. Escribir: "Me duele la cabeza"
3. Verificar: Aparecen 3 tarjetas de opciones
4. Click en "Clínica Internacional"
5. Verificar: Pregunta por Pre-Admisión
6. Escribir: "Sí"
7. Verificar: Muestra ubicación y mapa
8. Verificar: Alert de Waze después de 2s
9. Verificar: Mensaje final "¿Necesitas algo más antes de salir?"

### Rama B (Reembolsos)
1. Abrir chat
2. Click en chip "Simular Geofence"
3. Verificar: Mensaje de detección de ubicación (IA, gris/izquierda)
4. Click en "Sí, iniciar"
5. Verificar: Aparece botón "📷 Subir Documentos"
6. Click en botón
7. Verificar: Se abre cámara/selector de archivos
8. Seleccionar imagen
9. Verificar: "📷 Documento capturado" (Usuario, rojo/derecha)
10. Verificar: "Procesando OCR... ⏳" (IA, gris/izquierda)
11. Verificar: "✅ Documentos legibles..." (IA, gris/izquierda)

### Rama C (Medicación - Escenario 1)
1. Abrir chat
2. Escribir: "Necesito mi receta"
3. Verificar: Indicador "Escribiendo..." aparece
4. Verificar: Pregunta de autorización HL7
5. Verificar: Chips "Sí, importar" / "No, subir foto"
6. Click en "Sí, importar"
7. Verificar: Indicador "Escribiendo..." (2s)
8. Verificar: "Conectando con sistema HL7..."
9. Verificar: Indicador "Escribiendo..." (1.5s)
10. Verificar: Receta importada con detalles
11. Verificar: Badge dorado "🏆 +200 Puntos Wellness"
12. Verificar: Animación de escala en badge

### Rama C (Medicación - Escenario 2)
1. Escribir: "Simular Salida"
2. Verificar: Mensaje post-visita
3. Verificar: Botón "📷 Subir Documentos"
4. Click en botón
5. Verificar: Flujo de cámara (igual que Rama B)

---

## 🔧 Arquitectura Técnica

### Separación de Capas

```
DATA LAYER (mockData.ts)
├── TRIAGE_OPTIONS
├── SUGGESTION_CHIPS
└── Interfaces TypeScript

SERVICE LAYER (useChatSession.ts)
├── Detección de keywords
├── Lógica de flujos
├── Delays simulados
└── // TODO: Replace with API calls

UI LAYER (ChatModal.tsx)
├── Renderizado condicional por msg.type
├── Integración con usePermissions
├── Input file oculto para cámara
└── Animaciones con Framer Motion
```

### Tipos de Mensajes

```typescript
type MessageType = 
  | 'options'        // Tarjetas de triage
  | 'confirmation'   // Pre-admisión
  | 'system'         // Ubicación detectada
  | 'map'            // Mapa con ruta
  | 'geofence'       // Detección de consultorio
  | 'upload_prompt'  // Botón de cámara
```

---

## 📱 Permisos Nativos

### GPS (Rama A)
```typescript
await requestPermission('gps');
// Simula aprobación automática en desarrollo
// En producción: navigator.geolocation.getCurrentPosition()
```

### Cámara (Rama B)
```typescript
await requestPermission('camera');
// Input file con capture="environment"
// Activa cámara trasera en móviles
```

---

## 🚀 Próximos Pasos

### Backend Integration
- [ ] Reemplazar delays con llamadas API reales
- [ ] Implementar OCR real (Google Vision / Tesseract)
- [ ] Integrar Google Maps API para rutas reales
- [ ] Conectar con sistema de geofencing real

### UX Enhancements
- [ ] Animaciones de transición entre estados
- [ ] Feedback háptico en móviles
- [ ] Previsualización de imagen capturada
- [ ] Historial de reembolsos

### Analytics
- [ ] Tracking de flujos completados
- [ ] Tiempo promedio por flujo
- [ ] Tasa de conversión Pre-Admisión
- [ ] Éxito de OCR

---

## 📝 Notas de Desarrollo

- **Hook Pattern**: `useChatSession` actúa como adaptador del backend
- **Type Safety**: Todos los payloads tipados con TypeScript
- **Responsive**: Tarjetas y mapas adaptativos a móvil/desktop
- **Accessibility**: Botones con labels semánticos
- **Performance**: Lazy loading de imágenes, delays optimizados

---

**Última actualización**: Implementación completa de Rama A y Rama B
**Estado**: ✅ Build exitoso, listo para testing
