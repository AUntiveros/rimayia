# Backend - RIMI (Asistente Virtual de Rimac Seguros)

## 📋 Descripción

RIMI es un agente conversacional de voz inteligente que utiliza **Amazon Nova Sonic** de AWS Bedrock para proporcionar asistencia médica en tiempo real a los asegurados de Rimac. El agente puede:

- 🎤 **Interacción por voz**: Comunicación natural mediante audio bidireccional
- 🏥 **Triage clínico inteligente**: Evaluación automática de síntomas para detectar emergencias
- 🚑 **Llamada de ambulancia**: Despacho automático en casos de emergencia vital
- 📊 **Gestión de datos**: Acceso y registro de información médica del usuario
- 🔒 **Seguridad**: Manejo de consentimiento y datos sensibles

## 🏗️ Arquitectura AWS

### Componentes Principales

```
┌─────────────────┐         ┌──────────────────┐
│   Cliente Web   │◄───────►│  FastAPI Server  │
│  (WebSocket)    │         │   (server.py)    │
└─────────────────┘         └────────┬─────────┘
                                     │
                                     │ Bidireccional
                                     │ WebSocket
                                     ▼
                            ┌────────────────────┐
                            │  AWS Bedrock API   │
                            │  Nova Sonic v1     │
                            │ (Streaming Audio)  │
                            └────────┬───────────┘
                                     │
                                     ├──► Audio Input
                                     ├──► Audio Output
                                     ├──► Text Transcripts
                                     └──► Tool Calls
                                     
┌─────────────────────────────────────────────────┐
│              BedrockStreamManager               │
│  ┌──────────────────────────────────────────┐  │
│  │  • Gestión de stream bidireccional       │  │
│  │  • Procesamiento de eventos              │  │
│  │  • Ejecución de herramientas (Tools)     │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  DynamoDB (Opcional)  │
            │  Almacenamiento de    │
            │  datos de usuarios    │
            └───────────────────────┘
```

### Conexión Bidireccional (Duplex)

El sistema utiliza una **conexión bidireccional full-duplex** en múltiples capas:

1. **Cliente ↔ Servidor FastAPI**: WebSocket bidireccional
   - Cliente envía audio del micrófono
   - Servidor envía respuestas de audio y texto en tiempo real

2. **Servidor ↔ AWS Bedrock**: Stream bidireccional
   - Envío continuo de chunks de audio
   - Recepción simultánea de respuestas (audio, texto, tool calls)
   - Permite interrupciones (barge-in) en tiempo real

### Tools (Herramientas Integradas)

El agente tiene acceso a 3 herramientas:

1. **`getInfoFromClinic`**: Obtiene datos del usuario desde clínicas afiliadas
2. **`registerUser`**: Registra manualmente nuevos usuarios
3. **`callAmbulance`**: Despacha ambulancia en emergencias vitales

## 🚀 Cómo Empezar (Instalación Local)

### Requisitos Previos

- Python 3.9 o superior
- Credenciales de AWS configuradas (con acceso a Bedrock)
- Conexión a internet

### Paso 1: Crear el entorno virtual

```bash
cd backend
python3 -m venv venv
```

### Paso 2: Activar el entorno virtual

**En macOS/Linux:**
```bash
source venv/bin/activate
```

**En Windows:**
```bash
venv\Scripts\activate
```

### Paso 3: Instalar las dependencias

```bash
pip install -r requirements.txt
```

### Paso 4: Configurar credenciales de AWS

Asegúrate de tener configuradas las siguientes variables de entorno:

```bash
export AWS_ACCESS_KEY_ID="tu_access_key"
export AWS_SECRET_ACCESS_KEY="tu_secret_key"
export AWS_DEFAULT_REGION="us-east-1"
```

O configúralas usando AWS CLI:
```bash
aws configure
```

### Paso 5: (Opcional) Configurar DynamoDB

Si deseas persistir los datos de usuarios en DynamoDB:

```bash
export DYNAMODB_TABLE_NAME="rimac-users"
```

Asegúrate de crear la tabla con la siguiente configuración:
- **Partition Key**: `dni` (String)
- **GSI** (opcional): `poliza_numero-index` para búsquedas por póliza

### Paso 6: Ejecutar el servidor

```bash
python3 server.py
```

Verás un mensaje como:

```
Starting server on http://localhost:8000
Access client at: http://localhost:8000/client

💡 Note: Microphone access requires HTTPS or localhost
   If you see microphone errors, you're using HTTP from a non-localhost domain
```

### Paso 7: Abrir el cliente web

Abre tu navegador y ve a:

```
http://localhost:8000/client
```

¡Listo! Ya puedes empezar a usar el agente de voz.

## 🎯 Uso del Cliente

1. **Permitir acceso al micrófono** cuando el navegador lo solicite
2. **Hacer clic en "Start Session"** para iniciar la conversación
3. **Hablar con el agente**: Di "Hola" o cualquier saludo
4. El agente te responderá por voz y verás las transcripciones en pantalla
5. **Hacer clic en "End Session"** para finalizar

## 📝 Ejemplos de Interacción

### Ejemplo 1: Usuario Nuevo

```
Usuario: "Hola"
RIMI: "Hola, soy RIMI de Rimac Seguros. ¿Me das permiso para acceder 
       a tu información de tu clínica afiliada?"
Usuario: "Sí, claro"
RIMI: "Perfecto, ¿cuál es tu DNI de 8 dígitos?"
Usuario: "12345678"
RIMI: "María González, encontré tu información. ¿En qué puedo ayudarte?"
```

### Ejemplo 2: Emergencia

```
Usuario: "Tengo un dolor fuerte en el pecho"
RIMI: [Detecta emergencia y llama automáticamente a ambulancia]
      "🚑 AMBULANCIA EN CAMINO. Una ambulancia ha sido alertada y está 
      en camino a tu ubicación. Tiempo estimado: 8-12 minutos. 
      Mantente tranquilo..."
```

## 📂 Estructura de Archivos

```
backend/
├── server.py              # Servidor FastAPI con WebSocket
├── bedrock_manager.py     # Gestión del stream de Bedrock
├── client.html            # Cliente web para pruebas
├── requirements.txt       # Dependencias Python
└── README.md             # Este archivo
```

## 🔧 Configuración Avanzada

### Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `AWS_ACCESS_KEY_ID` | Access Key de AWS | (requerido) |
| `AWS_SECRET_ACCESS_KEY` | Secret Key de AWS | (requerido) |
| `AWS_DEFAULT_REGION` | Región de AWS | `us-east-1` |
| `DYNAMODB_TABLE_NAME` | Nombre de tabla DynamoDB | `rimac-users` |

### Modo Debug

Para habilitar logs detallados, edita `bedrock_manager.py`:

```python
DEBUG = True
```

### Puerto del Servidor

Para cambiar el puerto, modifica el archivo `server.py`:

```python
uvicorn.run(
    "server:app",
    host="0.0.0.0",
    port=8080,  # Cambia el puerto aquí
    reload=True
)
```

## 🛠️ Desarrollo

### Hot Reload

El servidor está configurado con `reload=True`, por lo que cualquier cambio en `server.py` o `bedrock_manager.py` reiniciará automáticamente el servidor.

### Agregar Nuevas Herramientas (Tools)

Para agregar una nueva herramienta al agente:

1. Define el schema en el método `start_prompt()` de `BedrockStreamManager`
2. Implementa la lógica en el método `process_tool_async()` de `ToolProcessor`

Ejemplo:

```python
# En BedrockStreamManager.start_prompt()
{
    "toolSpec": {
        "name": "nuevaHerramienta",
        "description": "Descripción de la herramienta",
        "inputSchema": {
            "json": json.dumps({
                "type": "object",
                "properties": {
                    "parametro": {"type": "string"}
                }
            })
        }
    }
}

# En ToolProcessor.process_tool_async()
elif tool == "nuevaherramienta":
    # Tu lógica aquí
    return {"success": True, "data": "..."}
```

## 📊 Monitoreo

### Endpoints de Health Check

- **`/health`**: Verifica que el servidor está activo
  ```bash
  curl http://localhost:8000/health
  ```

### Logs

Los eventos importantes se imprimen en la consola del servidor:
- Conexiones de clientes
- Llamadas a herramientas
- Errores y excepciones

## 🔐 Seguridad

- **Credenciales AWS**: Nunca las incluyas en el código. Usa variables de entorno o AWS Secrets Manager
- **CORS**: En producción, configura `allow_origins` con dominios específicos
- **HTTPS**: Para producción, usa certificados SSL/TLS válidos
- **Validación**: Todos los inputs del usuario son validados antes de ser procesados

## 🚨 Solución de Problemas

### Error: "AWS_ACCESS_KEY_ID not set"

```bash
export AWS_ACCESS_KEY_ID="tu_access_key"
export AWS_SECRET_ACCESS_KEY="tu_secret_key"
```

### Error: "Permission denied" al acceder al micrófono

- Verifica que estás usando `http://localhost:8000` (no una IP)
- Permite el acceso al micrófono cuando el navegador lo solicite

### Error: "DynamoDB initialization failed"

- DynamoDB es opcional. El sistema funcionará sin él
- Verifica que las credenciales tienen permisos de DynamoDB
- Asegúrate de que la tabla existe en la región correcta

### El agente no responde

- Verifica la consola del servidor para errores
- Asegúrate de que AWS Bedrock tiene acceso habilitado en tu cuenta
- Verifica que la región es `us-east-1` (donde está Nova Sonic)

## 📞 Soporte

Para problemas o preguntas, contacta al equipo de desarrollo de Rimac.

## 📄 Licencia

© 2024 Rimac Seguros. Todos los derechos reservados.
