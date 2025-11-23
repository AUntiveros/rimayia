# 📋 Onboarding - Smart Health Check

## Descripción

Formulario de primera vez que recopila información de salud del usuario.

## Campos

### 1. Peso y Talla
- **Peso**: Número en kilogramos (requerido)
- **Talla**: Número en centímetros (requerido)
- Layout: Grid de 2 columnas

### 2. Condiciones Crónicas
Chips seleccionables con lógica de exclusividad.

**Opciones:**
- Diabetes
- Hipertensión
- Asma
- Ninguna

**Lógica de Selección:**

```typescript
// Si selecciona "Ninguna"
selectedConditions = ['Ninguna']
// Desmarca todas las demás opciones

// Si selecciona una enfermedad (ej: Diabetes)
selectedConditions = ['Diabetes']
// Desmarca automáticamente "Ninguna"

// Selección múltiple de enfermedades
selectedConditions = ['Diabetes', 'Hipertensión']
// Válido, pero "Ninguna" no puede coexistir
```

**Reglas:**
- ✅ Ninguna (sola)
- ✅ Diabetes + Hipertensión
- ✅ Diabetes + Asma + Hipertensión
- ❌ Ninguna + Diabetes
- ❌ Ninguna + cualquier enfermedad

### 3. Estilo de Vida
Radio buttons con selección única obligatoria.

**Opciones:**
- Fumador
- Sedentario
- Activo/Deportista

**Comportamiento:**
- Solo una opción puede estar seleccionada
- Campo requerido

## Validación

```typescript
// Antes de enviar
if (selectedConditions.length === 0) {
  alert('Por favor selecciona al menos una condición crónica');
  return;
}

if (!lifestyle) {
  alert('Por favor selecciona tu estilo de vida');
  return;
}
```

## Flujo de Guardado

1. **Validación**: Verifica que todos los campos estén completos
2. **Simulación**: Delay de 1 segundo (simula llamada a API)
3. **Actualización de usuario**: 
   ```typescript
   updateUser({ isFirstTime: false })
   ```
4. **Tutorial flag**: 
   ```typescript
   localStorage.setItem('rimiapp_tutorial_pending', 'true')
   ```
5. **Navegación**: 
   ```typescript
   navigate('/', { replace: true })
   ```

## Solución al Bug de Redirección

### Problema Original
El formulario se guardaba pero no redirigía correctamente, causando un bucle.

### Solución Implementada

1. **AuthContext actualizado**:
   ```typescript
   const updateUser = (userData: Partial<User>) => {
     if (!user) return;
     const updatedUser = { ...user, ...userData };
     setUser(updatedUser);
     localStorage.setItem('rimiapp_user', JSON.stringify(updatedUser));
   };
   ```

2. **OnboardingPage actualizado**:
   ```typescript
   // Actualizar estado global
   updateUser({ isFirstTime: false });
   
   // Forzar navegación con replace
   navigate('/', { replace: true });
   ```

3. **`replace: true`**: Evita que el usuario pueda volver atrás al onboarding

## Estilos

### Chips (Condiciones Crónicas)
```typescript
// Seleccionado
'bg-primary text-white shadow-md'

// No seleccionado
'bg-secondary/10 text-secondary hover:bg-secondary/20'
```

### Radio Buttons (Estilo de Vida)
```typescript
// Seleccionado
'bg-accent/10 border-2 border-accent'

// No seleccionado
'bg-secondary/5 border-2 border-transparent hover:bg-secondary/10'
```

## Testing

### Casos de Prueba

1. **Selección exclusiva**:
   - Seleccionar "Ninguna" → Otras opciones se desmarcan
   - Seleccionar "Diabetes" → "Ninguna" se desmarca
   - Seleccionar "Diabetes" + "Hipertensión" → Ambas quedan seleccionadas

2. **Validación**:
   - Enviar sin condiciones → Muestra alerta
   - Enviar sin estilo de vida → Muestra alerta
   - Enviar completo → Redirige al home

3. **Redirección**:
   - Después de completar → Navega a `/`
   - No puede volver atrás (replace: true)
   - Tutorial se activa automáticamente

## Mejoras Futuras

- [ ] Guardar datos de salud en backend
- [ ] Calcular IMC automáticamente
- [ ] Validación de rangos (peso: 30-300kg, talla: 100-250cm)
- [ ] Agregar más condiciones crónicas
- [ ] Agregar campo de alergias
- [ ] Progreso visual (step 1 de 2, etc.)
