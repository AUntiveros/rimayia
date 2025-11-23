import asyncio
import base64
import json
import uuid
import warnings
import pytz
import random
import hashlib
import datetime
import time
import inspect
import os
import boto3
from botocore.exceptions import ClientError
from aws_sdk_bedrock_runtime.client import BedrockRuntimeClient, InvokeModelWithBidirectionalStreamOperationInput
from aws_sdk_bedrock_runtime.models import InvokeModelWithBidirectionalStreamInputChunk, BidirectionalInputPayloadPart
from aws_sdk_bedrock_runtime.config import Config
from smithy_aws_core.identity.environment import EnvironmentCredentialsResolver

# Suppress warnings
warnings.filterwarnings("ignore")

# Debug mode flag
DEBUG = False

def debug_print(message):
    """Print only if debug mode is enabled"""
    if DEBUG:
        functionName = inspect.stack()[1].function
        if functionName == 'time_it' or functionName == 'time_it_async':
            functionName = inspect.stack()[2].function
        print('{:%Y-%m-%d %H:%M:%S.%f}'.format(datetime.datetime.now())[:-3] + ' ' + functionName + ' ' + message)

def time_it(label, methodToRun):
    start_time = time.perf_counter()
    result = methodToRun()
    end_time = time.perf_counter()
    debug_print(f"Execution time for {label}: {end_time - start_time:.4f} seconds")
    return result

async def time_it_async(label, methodToRun):
    start_time = time.perf_counter()
    result = await methodToRun()
    end_time = time.perf_counter()
    debug_print(f"Execution time for {label}: {end_time - start_time:.4f} seconds")
    return result

def save_to_dynamodb(table, user_data):
    """Save user data to DynamoDB table"""
    try:
        # Prepare item for DynamoDB
        item = {
            'dni': user_data['dni'],
            'nombre': user_data['nombre'],
            'apellido': user_data['apellido'],
            'nombre_completo': f"{user_data['nombre']} {user_data['apellido']}",
            'edad': user_data['edad'],
            'talla': user_data['talla'],
            'peso': user_data['peso'],
            'enfermedades': user_data.get('enfermedades', []),
            'historial_clinico': user_data.get('historial_clinico', []),
            'rol_familiar': user_data.get('rol_familiar', 'Titular'),
            'gestores_autorizados': user_data.get('gestores_autorizados', []),
            'pacientes_a_cargo': user_data.get('pacientes_a_cargo', []),
            'solicitudes_pendientes': user_data.get('solicitudes_pendientes', []),
            'timestamp': datetime.datetime.now(pytz.UTC).isoformat(),
            'ultima_actualizacion': datetime.datetime.now(pytz.UTC).isoformat()
        }
        
        # Only add poliza fields if they have non-empty values
        # DynamoDB doesn't allow empty strings in GSI key attributes
        poliza_numero = user_data.get('poliza', {}).get('numero', '')
        if poliza_numero:
            item['poliza_numero'] = poliza_numero
        
        poliza_tipo = user_data.get('poliza', {}).get('tipo', '')
        if poliza_tipo:
            item['poliza_tipo'] = poliza_tipo
            
        poliza_estado = user_data.get('poliza', {}).get('estado', '')
        if poliza_estado:
            item['poliza_estado'] = poliza_estado
            
        poliza_cobertura = user_data.get('poliza', {}).get('cobertura', '')
        if poliza_cobertura:
            item['poliza_cobertura'] = poliza_cobertura
            
        poliza_vigencia = user_data.get('poliza', {}).get('vigencia', '')
        if poliza_vigencia:
            item['poliza_vigencia'] = poliza_vigencia
        
        # Put item to DynamoDB
        table.put_item(Item=item)
        
        print(f"💾 Datos guardados en DynamoDB exitosamente")
        print(f"   DNI: {item['dni']}")
        print(f"   Nombre: {item['nombre_completo']}")
        print()
        
        return True
    except ClientError as e:
        print(f"❌ Error guardando en DynamoDB: {e.response['Error']['Message']}")
        print()
        return False
    except Exception as e:
        print(f"❌ Error inesperado guardando en DynamoDB: {str(e)}")
        print()
        return False

class ToolProcessor:
    def __init__(self):
        # ThreadPoolExecutor could be used for complex implementations
        self.tasks = {}
        
        # Initialize DynamoDB client
        self.dynamodb = None
        self.table_name = os.environ.get('DYNAMODB_TABLE_NAME', 'rimac-users')
        try:
            self.dynamodb = boto3.resource('dynamodb')
            self.table = self.dynamodb.Table(self.table_name)
            print(f"✅ DynamoDB client initialized - Table: {self.table_name}")
        except Exception as e:
            print(f"⚠️  DynamoDB client initialization failed: {str(e)}")
            print(f"   Data will not be persisted to database")
    
    async def process_tool_async(self, tool_name, tool_content):
        """Process a tool call asynchronously and return the result"""
        # Create a unique task ID
        task_id = str(uuid.uuid4())
        
        # Create and store the task
        task = asyncio.create_task(self._run_tool(tool_name, tool_content))
        self.tasks[task_id] = task
        
        try:
            # Wait for the task to complete
            result = await task
            return result
        finally:
            # Clean up the task reference
            if task_id in self.tasks:
                del self.tasks[task_id]
    
    async def _run_tool(self, tool_name, tool_content):
        """Internal method to execute the tool logic"""
        print(f"\n{'='*60}")
        print(f"🔧 TOOL EXECUTION")
        print(f"{'='*60}")
        print(f"Tool Name: {tool_name}")
        print(f"Tool Content: {json.dumps(tool_content, indent=2, ensure_ascii=False)}")
        print(f"{'='*60}\n")
        
        debug_print(f"Processing tool: {tool_name}")
        tool = tool_name.lower()
        
        if tool == "getinfofromclinic":
            # Simulate API call delay
            debug_print(f"getInfoFromClinic: Accessing clinic database...")
            await asyncio.sleep(2)  # Simulate API latency
            
            # Extract parameters
            content = tool_content.get("content", {})
            content_data = json.loads(content)
            dni = content_data.get("dni", "")
            user_consent = content_data.get("user_consent", False)
            
            print(f"📋 Parametros extraidos:")
            print(f"   DNI: {dni}")
            print(f"   User Consent: {user_consent}")
            print()
            
            # Validate consent
            if not user_consent:
                return {
                    "success": False,
                    "error": "No se puede acceder a la informacion sin el consentimiento del usuario"
                }
            
            # Validate DNI format
            if not dni or not isinstance(dni, str) or len(dni) != 8 or not dni.isdigit():
                return {
                    "success": False,
                    "error": "DNI invalido. Debe ser exactamente 8 digitos numericos"
                }
            
            # Base de datos simulada con DNIs fijos
            user_database = {
                "12345678": {
                    "nombre": "Maria",
                    "apellido": "Gonzales Rios",
                    "edad": 32,
                    "talla": "1.65m",
                    "peso": "62kg",
                    "enfermedades": ["Asma leve"],
                    "historial_clinico": [
                        {
                            "fecha": "2024-11-10",
                            "clinica": "Clinica Ricardo Palma",
                            "motivo": "Control respiratorio",
                            "diagnostico": "Evaluacion rutinaria de asma"
                        },
                        {
                            "fecha": "2024-08-22",
                            "clinica": "Clinica Ricardo Palma",
                            "motivo": "Renovacion de receta",
                            "diagnostico": "Inhalador para asma"
                        }
                    ],
                    "poliza": {
                        "numero": "POL-2024-001234",
                        "tipo": "Plan Salud Integral",
                        "estado": "Activa",
                        "cobertura": "Nacional",
                        "vigencia": "2024-12-31"
                    },
                    "rol_familiar": "Titular",
                    "gestores_autorizados": [],
                    "pacientes_a_cargo": [],
                    "solicitudes_pendientes": []
                },
                "87654321": {
                    "nombre": "Carlos",
                    "apellido": "Mendoza Torres",
                    "edad": 45,
                    "talla": "1.78m",
                    "peso": "85kg",
                    "enfermedades": ["Hipertension", "Colesterol alto"],
                    "historial_clinico": [
                        {
                            "fecha": "2024-10-28",
                            "clinica": "Clinica San Felipe",
                            "motivo": "Control cardiologico",
                            "diagnostico": "Presion arterial controlada con medicacion"
                        },
                        {
                            "fecha": "2024-09-15",
                            "clinica": "Clinica San Felipe",
                            "motivo": "Analisis de sangre",
                            "diagnostico": "Colesterol en rango aceptable"
                        },
                        {
                            "fecha": "2024-07-05",
                            "clinica": "Clinica Internacional",
                            "motivo": "Consulta cardiologia",
                            "diagnostico": "Ajuste de medicacion"
                        }
                    ],
                    "poliza": {
                        "numero": "POL-2023-005678",
                        "tipo": "Plan Salud Total Plus",
                        "estado": "Activa",
                        "cobertura": "Nacional e Internacional",
                        "vigencia": "2025-06-30"
                    },
                    "rol_familiar": "Padre",
                    "gestores_autorizados": ["87654321"],
                    "pacientes_a_cargo": [],
                    "solicitudes_pendientes": [
                        {"de_dni": "87654321", "nombre": "Maria (Hija)", "estado": "PENDIENTE"}
                    ]
                },
                "11223344": {
                    "nombre": "Ana",
                    "apellido": "Flores Castillo",
                    "edad": 28,
                    "talla": "1.60m",
                    "peso": "55kg",
                    "enfermedades": [],
                    "historial_clinico": [
                        {
                            "fecha": "2024-11-01",
                            "clinica": "Clinica Delgado",
                            "motivo": "Chequeo preventivo anual",
                            "diagnostico": "Estado de salud excelente"
                        }
                    ],
                    "poliza": {
                        "numero": "POL-2024-009012",
                        "tipo": "Plan Salud Joven",
                        "estado": "Activa",
                        "cobertura": "Nacional",
                        "vigencia": "2025-03-15"
                    },
                    "rol_familiar": "Titular",
                    "gestores_autorizados": [],
                    "pacientes_a_cargo": [],
                    "solicitudes_pendientes": []
                },
                "55667788": {
                    "nombre": "Roberto",
                    "apellido": "Vega Sanchez",
                    "edad": 58,
                    "talla": "1.72m",
                    "peso": "92kg",
                    "enfermedades": ["Diabetes tipo 2", "Hipertension", "Artritis"],
                    "historial_clinico": [
                        {
                            "fecha": "2024-11-18",
                            "clinica": "Clinica Americana",
                            "motivo": "Control diabetologico",
                            "diagnostico": "Glucosa en niveles manejables"
                        },
                        {
                            "fecha": "2024-10-10",
                            "clinica": "Clinica Americana",
                            "motivo": "Consulta reumatologia",
                            "diagnostico": "Tratamiento para artritis en rodillas"
                        },
                        {
                            "fecha": "2024-09-02",
                            "clinica": "Clinica San Borja",
                            "motivo": "Control presion arterial",
                            "diagnostico": "Ajuste de dosis de antihipertensivos"
                        },
                        {
                            "fecha": "2024-07-20",
                            "clinica": "Clinica Americana",
                            "motivo": "Evaluacion integral",
                            "diagnostico": "Seguimiento de enfermedades cronicas"
                        }
                    ],
                    "poliza": {
                        "numero": "POL-2022-003456",
                        "tipo": "Plan Salud Senior",
                        "estado": "Activa",
                        "cobertura": "Nacional e Internacional",
                        "vigencia": "2025-12-31"
                    },
                    "rol_familiar": "Titular",
                    "gestores_autorizados": [],
                    "pacientes_a_cargo": [],
                    "solicitudes_pendientes": []
                },
                "99887766": {
                    "nombre": "Lucia",
                    "apellido": "Ramirez Diaz",
                    "edad": 38,
                    "talla": "1.68m",
                    "peso": "68kg",
                    "enfermedades": ["Migrana cronica"],
                    "historial_clinico": [
                        {
                            "fecha": "2024-11-05",
                            "clinica": "Clinica Anglo Americana",
                            "motivo": "Consulta neurologia",
                            "diagnostico": "Tratamiento preventivo para migrana"
                        },
                        {
                            "fecha": "2024-08-14",
                            "clinica": "Clinica Anglo Americana",
                            "motivo": "Seguimiento neurologico",
                            "diagnostico": "Ajuste de medicacion"
                        }
                    ],
                    "poliza": {
                        "numero": "POL-2024-007890",
                        "tipo": "Plan Salud Integral",
                        "estado": "Activa",
                        "cobertura": "Nacional",
                        "vigencia": "2025-09-20"
                    },
                    "rol_familiar": "Titular",
                    "gestores_autorizados": [],
                    "pacientes_a_cargo": [],
                    "solicitudes_pendientes": []
                }
            }
            
            # Buscar usuario en la base de datos
            if dni in user_database:
                user_data = user_database[dni].copy()
                user_data["dni"] = dni
                print(f"✅ Usuario encontrado: {user_data['nombre']} {user_data['apellido']}")
                print(f"   Edad: {user_data['edad']} anos")
                print(f"   Poliza: {user_data['poliza']['numero']} ({user_data['poliza']['tipo']})")
                print()
                
                # Guardar datos en DynamoDB
                if self.dynamodb:
                    save_to_dynamodb(self.table, user_data)
                
                debug_print(f"getInfoFromClinic: Usuario encontrado - {user_data['nombre']} {user_data['apellido']}")
                return {
                    "success": True,
                    "user_data": user_data
                }
            else:
                print(f"❌ DNI {dni} no encontrado en base de datos")
                print()
                debug_print(f"getInfoFromClinic: DNI {dni} no encontrado en base de datos")
                return {
                    "success": False,
                    "error": f"No se encontro informacion para el DNI {dni} en el sistema de la clinica afiliada. Desea intentar con otro DNI o prefiere registrar sus datos manualmente?"
                }
        
        elif tool == "registeruser":
            debug_print(f"registerUser: Registering new user...")
            await asyncio.sleep(1)
            
            # Extract parameters
            content = tool_content.get("content", {})
            content_data = json.loads(content)
            dni = content_data.get("dni", "")
            nombre = content_data.get("nombre", "")
            apellido = content_data.get("apellido", "")
            edad = content_data.get("edad", 0)
            peso = content_data.get("peso", "")
            talla = content_data.get("talla", "")
            enfermedades = content_data.get("enfermedades", [])
            
            print(f"📋 Parametros extraidos:")
            print(f"   DNI: {dni}")
            print(f"   Nombre: {nombre} {apellido}")
            print(f"   Edad: {edad} anos")
            print(f"   Peso: {peso}")
            print(f"   Talla: {talla}")
            print(f"   Enfermedades: {enfermedades if enfermedades else 'Ninguna'}")
            print()
            
            # Validate DNI format
            if not dni or not isinstance(dni, str) or len(dni) != 8 or not dni.isdigit():
                return {
                    "success": False,
                    "error": "DNI invalido. Debe ser exactamente 8 digitos numericos"
                }
            
            # Validate required fields
            if not nombre or not apellido:
                return {
                    "success": False,
                    "error": "Nombre y apellido son obligatorios"
                }
            
            if not edad or edad <= 0:
                return {
                    "success": False,
                    "error": "Edad invalida. Debe ser un numero mayor a 0"
                }
            
            # Create user data structure
            user_data = {
                "dni": dni,
                "nombre": nombre,
                "apellido": apellido,
                "edad": edad,
                "peso": peso,
                "talla": talla,
                "enfermedades": enfermedades if isinstance(enfermedades, list) else [],
                "historial_clinico": [],
                "poliza": {
                    "numero": "",
                    "tipo": "Pendiente de asignacion",
                    "estado": "Inactiva",
                    "cobertura": "",
                    "vigencia": ""
                },
                "rol_familiar": "Titular",
                "gestores_autorizados": [],
                "pacientes_a_cargo": [],
                "solicitudes_pendientes": []
            }
            
            # Save to DynamoDB
            if self.dynamodb:
                save_success = save_to_dynamodb(self.table, user_data)
                if save_success:
                    print(f"✅ Usuario {nombre} {apellido} registrado exitosamente")
                    print()
                    debug_print(f"registerUser: Usuario {nombre} {apellido} guardado en DynamoDB")
                    return {
                        "success": True,
                        "message": f"Usuario {nombre} {apellido} (DNI: {dni}) registrado exitosamente en el sistema.",
                        "user_data": user_data
                    }
                else:
                    return {
                        "success": False,
                        "error": "Error al guardar usuario en la base de datos. Por favor intente nuevamente."
                    }
            else:
                return {
                    "success": False,
                    "error": "Sistema de base de datos no disponible. No se pudo registrar el usuario."
                }
        
        elif tool == "callambulance":
            debug_print(f"callAmbulance: EMERGENCIA - Calling ambulance...")
            
            # Extract parameters
            content = tool_content.get("content", {})
            content_data = json.loads(content)
            sintomas = content_data.get("sintomas", "")
            ubicacion = content_data.get("ubicacion", "Ubicacion del usuario registrada en el sistema")
            
            print(f"\n{'='*60}")
            print(f"⚠️  ALERTA DE EMERGENCIA - AMBULANCIA SOLICITADA")
            print(f"{'='*60}")
            print(f"🚑 Sintomas reportados: {sintomas}")
            print(f"📍 Ubicacion: {ubicacion}")
            print(f"⏱️  Ambulancia despachada - Tiempo estimado de llegada: 8-12 minutos")
            print(f"{'='*60}\n")
            
            # Simulate emergency dispatch delay
            await asyncio.sleep(1)
            
            debug_print(f"callAmbulance: Ambulancia despachada exitosamente")
            
            return {
                "success": True,
                "emergency_type": "AMBULANCIA_DESPACHADA",
                "message": "AMBULANCIA EN CAMINO. Una ambulancia ha sido alertada y esta en camino a tu ubicacion. Tiempo estimado de llegada: 8-12 minutos.",
                "eta_minutes": "8-12",
                "instructions": "Mantente tranquilo. Si es posible, permanece en un lugar seguro y visible. La ambulancia llegara pronto.",
                "emergency_number": "106",
                "sintomas": sintomas,
                "ubicacion": ubicacion
            }
        
        else:
            return {
                "error": f"Herramienta no soportada: {tool_name}"
            }

class BedrockStreamManager:
    """Manages bidirectional streaming with AWS Bedrock using asyncio"""
    
    # Event templates
    START_SESSION_EVENT = '''{
        "event": {
            "sessionStart": {
            "inferenceConfiguration": {
                "maxTokens": 1024,
                "topP": 0.9,
                "temperature": 0.7
                }
            }
        }
    }'''

    CONTENT_START_EVENT = '''{
        "event": {
            "contentStart": {
            "promptName": "%s",
            "contentName": "%s",
            "type": "AUDIO",
            "interactive": true,
            "role": "USER",
            "audioInputConfiguration": {
                "mediaType": "audio/lpcm",
                "sampleRateHertz": 16000,
                "sampleSizeBits": 16,
                "channelCount": 1,
                "audioType": "SPEECH",
                "encoding": "base64"
                }
            }
        }
    }'''

    AUDIO_EVENT_TEMPLATE = '''{
        "event": {
            "audioInput": {
            "promptName": "%s",
            "contentName": "%s",
            "content": "%s"
            }
        }
    }'''

    TEXT_CONTENT_START_EVENT = '''{
        "event": {
            "contentStart": {
            "promptName": "%s",
            "contentName": "%s",
            "type": "TEXT",
            "role": "%s",
            "interactive": false,
                "textInputConfiguration": {
                    "mediaType": "text/plain"
                }
            }
        }
    }'''

    TEXT_INPUT_EVENT = '''{
        "event": {
            "textInput": {
            "promptName": "%s",
            "contentName": "%s",
            "content": "%s"
            }
        }
    }'''

    TOOL_CONTENT_START_EVENT = '''{
        "event": {
            "contentStart": {
                "promptName": "%s",
                "contentName": "%s",
                "interactive": false,
                "type": "TOOL",
                "role": "TOOL",
                "toolResultInputConfiguration": {
                    "toolUseId": "%s",
                    "type": "TEXT",
                    "textInputConfiguration": {
                        "mediaType": "text/plain"
                    }
                }
            }
        }
    }'''

    CONTENT_END_EVENT = '''{
        "event": {
            "contentEnd": {
            "promptName": "%s",
            "contentName": "%s"
            }
        }
    }'''

    PROMPT_END_EVENT = '''{
        "event": {
            "promptEnd": {
            "promptName": "%s"
            }
        }
    }'''

    SESSION_END_EVENT = '''{
        "event": {
            "sessionEnd": {}
        }
    }'''
    
    def start_prompt(self):
        """Create a promptStart event"""
        get_info_from_clinic_schema = json.dumps({
            "type": "object",
            "properties": {
                "dni": {
                    "type": "string",
                    "description": "Numero de DNI del usuario (debe ser exactamente 8 digitos numericos)"
                },
                "user_consent": {
                    "type": "boolean",
                    "description": "Confirmacion explicita del usuario para acceder a su informacion de la clinica afiliada"
                }
            },
            "required": ["dni", "user_consent"]
        })

        register_user_schema = json.dumps({
            "type": "object",
            "properties": {
                "dni": {
                    "type": "string",
                    "description": "Numero de DNI del usuario (8 digitos)"
                },
                "nombre": {
                    "type": "string",
                    "description": "Nombre del usuario"
                },
                "apellido": {
                    "type": "string",
                    "description": "Apellido del usuario"
                },
                "edad": {
                    "type": "integer",
                    "description": "Edad del usuario en anos"
                },
                "peso": {
                    "type": "string",
                    "description": "Peso del usuario (ejemplo: 70kg)"
                },
                "talla": {
                    "type": "string",
                    "description": "Talla o altura del usuario (ejemplo: 1.75m)"
                },
                "enfermedades": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Lista de enfermedades que tiene el usuario (puede estar vacio si no tiene ninguna)"
                }
            },
            "required": ["dni", "nombre", "apellido", "edad", "peso", "talla", "enfermedades"]
        })

        call_ambulance_schema = json.dumps({
            "type": "object",
            "properties": {
                "sintomas": {
                    "type": "string",
                    "description": "Descripcion de los sintomas de emergencia del paciente"
                },
                "ubicacion": {
                    "type": "string",
                    "description": "Ubicacion actual del paciente (si esta disponible)"
                }
            },
            "required": ["sintomas"]
        })

        
        prompt_start_event = {
            "event": {
                "promptStart": {
                    "promptName": self.prompt_name,
                    "textOutputConfiguration": {
                        "mediaType": "text/plain"
                    },
                    "audioOutputConfiguration": {
                        "mediaType": "audio/lpcm",
                        "sampleRateHertz": 24000,
                        "sampleSizeBits": 16,
                        "channelCount": 1,
                        "voiceId": "matthew",
                        "encoding": "base64",
                        "audioType": "SPEECH"
                    },
                    "toolUseOutputConfiguration": {
                        "mediaType": "application/json"
                    },
                    "toolConfiguration": {
                        "tools": [
                            {
                                "toolSpec": {
                                    "name": "getInfoFromClinic",
                                    "description": "Obtiene informacion del usuario desde su clinica afiliada. USA ESTA TOOL SOLO cuando el usuario diga SI, ACEPTO, CLARO, OK o similar al permiso. Si el usuario solo saluda, NO uses esta tool todavia. Parametros: dni (8 digitos) y user_consent DEBE SER true solo si usuario acepto explicitamente.",
                                    "inputSchema": {
                                        "json": get_info_from_clinic_schema
                                    }
                                }
                            },
                            {
                                "toolSpec": {
                                    "name": "registerUser",
                                    "description": "Registra manualmente los datos basicos de un nuevo usuario en el sistema. Usar solo cuando el usuario NO da permiso para acceder a informacion de su clinica o cuando no se encuentra su DNI en el sistema.",
                                    "inputSchema": {
                                        "json": register_user_schema
                                    }
                                }
                            },
                            {
                                "toolSpec": {
                                    "name": "callAmbulance",
                                    "description": "EMERGENCIA VITAL: Llama a una ambulancia de inmediato. USA ESTA TOOL SOLO cuando detectes sintomas de emergencia vital como: dolor en el pecho, dificultad para respirar severa, perdida de conciencia, sangrado severo, dolor abdominal intenso con fiebre alta, convulsiones, trauma grave, sintomas de infarto o derrame cerebral. NO usar para urgencias menores.",
                                    "inputSchema": {
                                        "json": call_ambulance_schema
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
        
        return json.dumps(prompt_start_event)
    
    def tool_result_event(self, content_name, content, role):
        """Create a tool result event"""

        if isinstance(content, dict):
            content_json_string = json.dumps(content)
        else:
            content_json_string = content
            
        tool_result_event = {
            "event": {
                "toolResult": {
                    "promptName": self.prompt_name,
                    "contentName": content_name,
                    "content": content_json_string
                }
            }
        }
        return json.dumps(tool_result_event)
   
    def __init__(self, model_id='amazon.nova-sonic-v1:0', region='us-east-1', websocket=None):
        """Initialize the stream manager."""
        self.model_id = model_id
        self.region = region
        self.websocket = websocket  # WebSocket connection to send responses to client
        
        # Replace RxPy subjects with asyncio queues
        self.audio_input_queue = asyncio.Queue()
        self.audio_output_queue = asyncio.Queue()
        self.output_queue = asyncio.Queue()
        
        self.response_task = None
        self.stream_response = None
        self.is_active = False
        self.barge_in = False
        self.bedrock_client = None
        
        # Text response components
        self.display_assistant_text = False
        self.role = None

        # Session information
        self.prompt_name = str(uuid.uuid4())
        self.content_name = str(uuid.uuid4())
        self.audio_content_name = str(uuid.uuid4())
        self.toolUseContent = ""
        self.toolUseId = ""
        self.toolName = ""

        # Add a tool processor
        self.tool_processor = ToolProcessor()
        
        # Add tracking for in-progress tool calls
        self.pending_tool_tasks = {}

    def _initialize_client(self):
        """Initialize the Bedrock client."""
        config = Config(
            endpoint_uri=f"https://bedrock-runtime.{self.region}.amazonaws.com",
            region=self.region,
            aws_credentials_identity_resolver=EnvironmentCredentialsResolver(),
        )
        self.bedrock_client = BedrockRuntimeClient(config=config)
    
    async def initialize_stream(self):
        """Initialize the bidirectional stream with Bedrock."""
        if not self.bedrock_client:
            self._initialize_client()
        
        try:
            self.stream_response = await time_it_async("invoke_model_with_bidirectional_stream", lambda : self.bedrock_client.invoke_model_with_bidirectional_stream( InvokeModelWithBidirectionalStreamOperationInput(model_id=self.model_id)))
            self.is_active = True
            # Get current date and time in Peru timezone
            peru_tz = pytz.timezone('America/Lima')
            current_datetime = datetime.datetime.now(peru_tz)
            fecha_hora_actual = current_datetime.strftime('%Y-%m-%d %H:%M:%S')
            
            default_system_prompt = f"""Eres RIMI, el asistente virtual de Rimac Seguros, empresa lider en seguros en Peru. Tu objetivo es ayudar a los usuarios a obtener atencion medica rapida y eficiente.

FECHA Y HORA ACTUAL: {fecha_hora_actual} (Zona horaria: America/Lima)

IDIOMA: Hablas UNICAMENTE en ESPANOL en todo momento. Nunca uses ingles.

TRIAGE CLINICO - PRIORIDAD MAXIMA:
Cuando el usuario mencione sintomas, PRIMERO evalua la gravedad:

EMERGENCIA VITAL (USA callAmbulance INMEDIATAMENTE):
- Dolor en el pecho o presion en el pecho
- Dificultad severa para respirar o falta de aire
- Perdida de conciencia o desmayo
- Sangrado severo que no se detiene
- Dolor abdominal intenso con fiebre alta (>39C)
- Convulsiones
- Trauma grave (caidas, accidentes)
- Sintomas de infarto: dolor en brazo izquierdo, mandibula, sudoracion fria
- Sintomas de derrame cerebral: confusion, dificultad para hablar, paralisis facial
- Reaccion alergica severa (dificultad para respirar, hinchazon)

URGENCIA MENOR (Analiza y recomienda clinica):
- Fiebre moderada con otros sintomas
- Dolor de estomago o gastrico
- Vomitos o diarrea
- Dolor de cabeza intenso
- Lesiones menores
- Sintomas de infeccion

FLUJO DE CONVERSACION:
1) Saluda brevemente y presentate como asistente de Rimac Seguros
2) Solicita permiso para acceder a datos de clinica afiliada para ayudarlos mejor
3) ESPERA la respuesta del usuario
4) Si dice SI/ACEPTO/OK/CLARO, pide DNI de 8 digitos y ENTONCES usa getInfoFromClinic con user_consent=true
5) Si dice NO al permiso: Inicia registro manual preguntando por DNI, nombre, apellido, edad, peso, talla y enfermedades
6) IMPORTANTE: Una vez que tengas TODOS los datos del registro manual (dni, nombre, apellido, edad, peso, talla, enfermedades), EJECUTA registerUser INMEDIATAMENTE. NO continues la conversacion sin ejecutar la tool primero.
7) Despues de ejecutar registerUser exitosamente, di: 'Perfecto, [nombre]. Ya tengo tu informacion registrada. En que puedo ayudarte hoy?'
8) Pregunta especificamente: "Necesitas atencion para ti o para un familiar? Que sintomas o motivo de consulta tienes?"
9) TRIAGE: Cuando el usuario mencione sintomas, evalua si es emergencia vital o urgencia menor
10) Si es EMERGENCIA VITAL: USA callAmbulance INMEDIATAMENTE antes de cualquier otra cosa
11) Si es urgencia menor: Responde "Entiendo. Por tus sintomas, podria ser [diagnostico tentativo]. Analizando tus mejores opciones..." y proporciona guia

GUIA RAPIDA PARA ATENCION EN CLINICA (usala cuando el usuario necesite ir a una clinica):
- Clinicas disponibles en tu red: [menciona 2-3 cercanas segun su historial]
- Para atencion de emergencia: Ve directo a emergencias con tu DNI
- Para consulta programada: Puedes agendar por app, web o llamando al centro de contacto
- Documentos necesarios: Solo tu DNI
- Cobertura: Tu plan [tipo de plan] cubre [tipo de cobertura]
- Tip: Si vas en horario no punta (10am-3pm), la espera es menor

IMPORTANTE:
- NO leas todos los datos del usuario (historial, enfermedades, etc.) a menos que el lo solicite
- Se conversacional, breve y directo
- Los datos son solo para tu contexto interno
- Enfocate en lo que el usuario necesita AHORA
- Si dice NO al permiso, ofrece registro manual con registerUser

CRITICO: NO uses tools hasta que usuario ACEPTE explicitamente."""
            
            # Send initialization events
            prompt_event = self.start_prompt()
            text_content_start = self.TEXT_CONTENT_START_EVENT % (self.prompt_name, self.content_name, "SYSTEM")
            # Escape the prompt content properly for JSON
            escaped_prompt = json.dumps(default_system_prompt)[1:-1]  # Remove surrounding quotes
            text_content = self.TEXT_INPUT_EVENT % (self.prompt_name, self.content_name, escaped_prompt)
            text_content_end = self.CONTENT_END_EVENT % (self.prompt_name, self.content_name)
            
            init_events = [self.START_SESSION_EVENT, prompt_event, text_content_start, text_content, text_content_end]
            
            for event in init_events:
                await self.send_raw_event(event)
                # Small delay between init events
                await asyncio.sleep(0.1)
            
            # Start listening for responses
            self.response_task = asyncio.create_task(self._process_responses())
            
            # Start processing audio input
            asyncio.create_task(self._process_audio_input())
            
            # Wait a bit to ensure everything is set up
            await asyncio.sleep(0.1)
            
            debug_print("Stream initialized successfully")
            return self
        except Exception as e:
            self.is_active = False
            print(f"Failed to initialize stream: {str(e)}")
            raise
    
    async def send_raw_event(self, event_json):
        """Send a raw event JSON to the Bedrock stream."""
        if not self.stream_response or not self.is_active:
            debug_print("Stream not initialized or closed")
            return
       
        event = InvokeModelWithBidirectionalStreamInputChunk(
            value=BidirectionalInputPayloadPart(bytes_=event_json.encode('utf-8'))
        )
        
        try:
            await self.stream_response.input_stream.send(event)
            # For debugging large events, you might want to log just the type
            if DEBUG:
                if len(event_json) > 200:
                    event_type = json.loads(event_json).get("event", {}).keys()
                    debug_print(f"Sent event type: {list(event_type)}")
                else:
                    debug_print(f"Sent event: {event_json}")
        except Exception as e:
            debug_print(f"Error sending event: {str(e)}")
            if DEBUG:
                import traceback
                traceback.print_exc()
    
    async def send_audio_content_start_event(self):
        """Send a content start event to the Bedrock stream."""
        content_start_event = self.CONTENT_START_EVENT % (self.prompt_name, self.audio_content_name)
        await self.send_raw_event(content_start_event)
    
    async def _process_audio_input(self):
        """Process audio input from the queue and send to Bedrock."""
        while self.is_active:
            try:
                # Get audio data from the queue
                data = await self.audio_input_queue.get()
                
                audio_bytes = data.get('audio_bytes')
                if not audio_bytes:
                    debug_print("No audio bytes received")
                    continue
                
                # Base64 encode the audio data
                blob = base64.b64encode(audio_bytes)
                audio_event = self.AUDIO_EVENT_TEMPLATE % (
                    self.prompt_name, 
                    self.audio_content_name, 
                    blob.decode('utf-8')
                )
                
                # Send the event
                await self.send_raw_event(audio_event)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                debug_print(f"Error processing audio: {e}")
                if DEBUG:
                    import traceback
                    traceback.print_exc()
    
    def add_audio_chunk(self, audio_bytes):
        """Add an audio chunk to the queue."""
        self.audio_input_queue.put_nowait({
            'audio_bytes': audio_bytes,
            'prompt_name': self.prompt_name,
            'content_name': self.audio_content_name
        })
    
    async def send_audio_content_end_event(self):
        """Send a content end event to the Bedrock stream."""
        if not self.is_active:
            debug_print("Stream is not active")
            return
        
        content_end_event = self.CONTENT_END_EVENT % (self.prompt_name, self.audio_content_name)
        await self.send_raw_event(content_end_event)
        debug_print("Audio ended")
    
    async def send_tool_start_event(self, content_name, tool_use_id):
        """Send a tool content start event to the Bedrock stream."""
        content_start_event = self.TOOL_CONTENT_START_EVENT % (self.prompt_name, content_name, tool_use_id)
        debug_print(f"Sending tool start event: {content_start_event}")  
        await self.send_raw_event(content_start_event)

    async def send_tool_result_event(self, content_name, tool_result):
        """Send a tool content event to the Bedrock stream."""
        # Use the actual tool result from processToolUse
        tool_result_event = self.tool_result_event(content_name=content_name, content=tool_result, role="TOOL")
        debug_print(f"Sending tool result event: {tool_result_event}")
        await self.send_raw_event(tool_result_event)
    
    async def send_tool_content_end_event(self, content_name):
        """Send a tool content end event to the Bedrock stream."""
        tool_content_end_event = self.CONTENT_END_EVENT % (self.prompt_name, content_name)
        debug_print(f"Sending tool content event: {tool_content_end_event}")
        await self.send_raw_event(tool_content_end_event)
    
    async def send_prompt_end_event(self):
        """Close the stream and clean up resources."""
        if not self.is_active:
            debug_print("Stream is not active")
            return
        
        prompt_end_event = self.PROMPT_END_EVENT % (self.prompt_name)
        await self.send_raw_event(prompt_end_event)
        debug_print("Prompt ended")
        
    async def send_session_end_event(self):
        """Send a session end event to the Bedrock stream."""
        if not self.is_active:
            debug_print("Stream is not active")
            return

        await self.send_raw_event(self.SESSION_END_EVENT)
        self.is_active = False
        debug_print("Session ended")
    
    async def _process_responses(self):
        """Process incoming responses from Bedrock."""
        try:            
            while self.is_active:
                try:
                    output = await self.stream_response.await_output()
                    result = await output[1].receive()
                    if result.value and result.value.bytes_:
                        try:
                            response_data = result.value.bytes_.decode('utf-8')
                            json_data = json.loads(response_data)
                            
                            # Handle different response types
                            if 'event' in json_data:
                                if 'completionStart' in json_data['event']:
                                    debug_print(f"completionStart: {json_data['event']}")
                                elif 'contentStart' in json_data['event']:
                                    debug_print("Content start detected")
                                    content_start = json_data['event']['contentStart']
                                    # set role
                                    self.role = content_start['role']
                                    # Check for speculative content
                                    if 'additionalModelFields' in content_start:
                                        try:
                                            additional_fields = json.loads(content_start['additionalModelFields'])
                                            if additional_fields.get('generationStage') == 'SPECULATIVE':
                                                debug_print("Speculative content detected")
                                                self.display_assistant_text = True
                                            else:
                                                self.display_assistant_text = False
                                        except json.JSONDecodeError:
                                            debug_print("Error parsing additionalModelFields")
                                elif 'textOutput' in json_data['event']:
                                    text_content = json_data['event']['textOutput']['content']
                                    role = json_data['event']['textOutput']['role']
                                    # Check if there is a barge-in
                                    if '{ "interrupted" : true }' in text_content:
                                        debug_print("Barge-in detected. Stopping audio output.")
                                        self.barge_in = True

                                    if (self.role == "ASSISTANT" and self.display_assistant_text):
                                        print(f"Assistant: {text_content}")
                                        # Send text to WebSocket client
                                        if self.websocket:
                                            await self.websocket.send_json({
                                                "type": "text",
                                                "role": "assistant",
                                                "content": text_content
                                            })
                                    elif (self.role == "USER"):
                                        print(f"User: {text_content}")
                                        # Send text to WebSocket client
                                        if self.websocket:
                                            await self.websocket.send_json({
                                                "type": "text",
                                                "role": "user",
                                                "content": text_content
                                            })
                                elif 'audioOutput' in json_data['event']:
                                    audio_content = json_data['event']['audioOutput']['content']
                                    # Send audio to WebSocket client
                                    if self.websocket:
                                        await self.websocket.send_json({
                                            "type": "audio",
                                            "content": audio_content
                                        })
                                elif 'toolUse' in json_data['event']:
                                    self.toolUseContent = json_data['event']['toolUse']
                                    self.toolName = json_data['event']['toolUse']['toolName']
                                    self.toolUseId = json_data['event']['toolUse']['toolUseId']
                                    debug_print(f"Tool use detected: {self.toolName}, ID: {self.toolUseId}")
                                elif 'contentEnd' in json_data['event'] and json_data['event'].get('contentEnd', {}).get('type') == 'TOOL':
                                    debug_print("Processing tool use and sending result")
                                     # Start asynchronous tool processing - non-blocking
                                    self.handle_tool_request(self.toolName, self.toolUseContent, self.toolUseId)
                                    debug_print("Processing tool use asynchronously")
                                elif 'contentEnd' in json_data['event']:
                                    debug_print("Content end")
                                elif 'completionEnd' in json_data['event']:
                                    # Handle end of conversation, no more response will be generated
                                    debug_print("End of response sequence")
                                elif 'usageEvent' in json_data['event']:
                                    debug_print(f"UsageEvent: {json_data['event']}")
                            # Put the response in the output queue for other components
                            await self.output_queue.put(json_data)
                        except json.JSONDecodeError:
                            await self.output_queue.put({"raw_data": response_data})
                except StopAsyncIteration:
                    # Stream has ended
                    break
                except Exception as e:
                   # Handle ValidationException properly
                    if "ValidationException" in str(e):
                        error_message = str(e)
                        print(f"Validation error: {error_message}")
                    else:
                        print(f"Error receiving response: {e}")
                    break
                    
        except Exception as e:
            print(f"Response processing error: {e}")
        finally:
            self.is_active = False

    def handle_tool_request(self, tool_name, tool_content, tool_use_id):
        """Handle a tool request asynchronously"""
        # Create a unique content name for this tool response
        tool_content_name = str(uuid.uuid4())
        
        # Create an asynchronous task for the tool execution
        task = asyncio.create_task(self._execute_tool_and_send_result(
            tool_name, tool_content, tool_use_id, tool_content_name))
        
        # Store the task
        self.pending_tool_tasks[tool_content_name] = task
        
        # Add error handling
        task.add_done_callback(
            lambda t: self._handle_tool_task_completion(t, tool_content_name))
    
    def _handle_tool_task_completion(self, task, content_name):
        """Handle the completion of a tool task"""
        # Remove task from pending tasks
        if content_name in self.pending_tool_tasks:
            del self.pending_tool_tasks[content_name]
        
        # Handle any exceptions
        if task.done() and not task.cancelled():
            exception = task.exception()
            if exception:
                debug_print(f"Tool task failed: {str(exception)}")
    
    async def _execute_tool_and_send_result(self, tool_name, tool_content, tool_use_id, content_name):
        """Execute a tool and send the result"""
        try:
            debug_print(f"Starting tool execution: {tool_name}")
            
            # Process the tool - this doesn't block the event loop
            tool_result = await self.tool_processor.process_tool_async(tool_name, tool_content)
            
            # Send the result sequence
            await self.send_tool_start_event(content_name, tool_use_id)
            await self.send_tool_result_event(content_name, tool_result)
            await self.send_tool_content_end_event(content_name)
            
            debug_print(f"Tool execution complete: {tool_name}")
        except Exception as e:
            debug_print(f"Error executing tool {tool_name}: {str(e)}")
            # Try to send an error response if possible
            try:
                error_result = {"error": f"Tool execution failed: {str(e)}"}
                
                await self.send_tool_start_event(content_name, tool_use_id)
                await self.send_tool_result_event(content_name, error_result)
                await self.send_tool_content_end_event(content_name)
            except Exception as send_error:
                debug_print(f"Failed to send error response: {str(send_error)}")
    
    async def close(self):
        """Close the stream properly."""
        if not self.is_active:
            return
        
        # Cancel any pending tool tasks
        for task in self.pending_tool_tasks.values():
            task.cancel()

        if self.response_task and not self.response_task.done():
            self.response_task.cancel()

        await self.send_audio_content_end_event()
        await self.send_prompt_end_event()
        await self.send_session_end_event()

        if self.stream_response:
            await self.stream_response.input_stream.close()
