import os
import asyncio
import base64
from typing import Dict
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from bedrock_manager import BedrockStreamManager

# Store active connections
active_connections: Dict[str, BedrockStreamManager] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Nova Sonic WebSocket Server starting...")
    print("Make sure AWS credentials are configured:")
    print("  - AWS_ACCESS_KEY_ID")
    print("  - AWS_SECRET_ACCESS_KEY")
    print("  - AWS_DEFAULT_REGION (or specify region in code)")
    
    yield
    
    # Shutdown
    print("Server shutting down, closing active connections...")
    for stream_manager in active_connections.values():
        try:
            await stream_manager.close()
        except:
            pass
    active_connections.clear()

app = FastAPI(title="Nova Sonic WebSocket Server", lifespan=lifespan)

# Enable CORS for web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def get():
    """Serve a simple HTML page with instructions"""
    html_content = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>Nova Sonic WebSocket Server</title>
        </head>
        <body>
            <h1>Nova Sonic WebSocket Server</h1>
            <p>Server is running. Connect via WebSocket at <code>ws://localhost:8000/ws</code></p>
            <p>Or open the client demo at <a href="/client">/client</a></p>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.get("/client")
async def get_client():
    """Serve the client HTML application"""
    try:
        with open("client.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(
            content="<h1>Error: client.html not found</h1>",
            status_code=404
        )

@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers"""
    return {"status": "healthy", "service": "nova-sonic-websocket"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for audio streaming
    
    Expected message formats from client:
    - Start session: {"type": "start"}
    - Audio chunk: {"type": "audio", "content": "<base64-encoded-audio>"}
    - End session: {"type": "end"}
    
    Server responses:
    - Audio response: {"type": "audio", "content": "<base64-encoded-audio>"}
    - Text transcript: {"type": "text", "role": "user|assistant", "content": "<text>"}
    - Status: {"type": "status", "message": "<status-message>"}
    - Error: {"type": "error", "message": "<error-message>"}
    """
    await websocket.accept()
    
    connection_id = id(websocket)
    stream_manager = None
    
    try:
        await websocket.send_json({
            "type": "status",
            "message": "Connected to Nova Sonic server"
        })
        
        while True:
            # Receive message from client
            message = await websocket.receive_json()
            message_type = message.get("type")
            
            if message_type == "start":
                # Initialize Bedrock stream
                if stream_manager is None:
                    try:
                        stream_manager = BedrockStreamManager(
                            model_id='amazon.nova-sonic-v1:0',
                            region='us-east-1',
                            websocket=websocket
                        )
                        await stream_manager.initialize_stream()
                        await stream_manager.send_audio_content_start_event()
                        
                        active_connections[connection_id] = stream_manager
                        
                        await websocket.send_json({
                            "type": "status",
                            "message": "Session started"
                        })
                    except Exception as e:
                        await websocket.send_json({
                            "type": "error",
                            "message": f"Failed to start session: {str(e)}"
                        })
                        raise
                else:
                    await websocket.send_json({
                        "type": "status",
                        "message": "Session already active"
                    })
            
            elif message_type == "audio":
                # Process audio chunk
                if stream_manager is None:
                    await websocket.send_json({
                        "type": "error",
                        "message": "No active session. Send 'start' first."
                    })
                    continue
                
                # Decode base64 audio
                audio_content = message.get("content", "")
                try:
                    audio_bytes = base64.b64decode(audio_content)
                    stream_manager.add_audio_chunk(audio_bytes)
                except Exception as e:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Failed to process audio: {str(e)}"
                    })
            
            elif message_type == "end":
                # End the session
                if stream_manager:
                    try:
                        await stream_manager.close()
                        await websocket.send_json({
                            "type": "status",
                            "message": "Session ended"
                        })
                    except Exception as e:
                        await websocket.send_json({
                            "type": "error",
                            "message": f"Error ending session: {str(e)}"
                        })
                    finally:
                        if connection_id in active_connections:
                            del active_connections[connection_id]
                        stream_manager = None
                else:
                    await websocket.send_json({
                        "type": "status",
                        "message": "No active session to end"
                    })
            
            elif message_type == "ping":
                # Simple ping/pong for keepalive
                await websocket.send_json({"type": "pong"})
            
            else:
                await websocket.send_json({
                    "type": "error",
                    "message": f"Unknown message type: {message_type}"
                })
    
    except WebSocketDisconnect:
        print(f"Client disconnected: {connection_id}")
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": f"Server error: {str(e)}"
            })
        except:
            pass
    finally:
        # Cleanup
        if stream_manager:
            try:
                await stream_manager.close()
            except:
                pass
        
        if connection_id in active_connections:
            del active_connections[connection_id]
        
        try:
            await websocket.close()
        except:
            pass

if __name__ == "__main__":
    # Check for AWS credentials
    if not os.environ.get("AWS_ACCESS_KEY_ID"):
        print("⚠️  Warning: AWS_ACCESS_KEY_ID not set")
    
    # For HTTPS support (optional, for development with self-signed certs)
    # Uncomment and provide cert files if needed:
    # ssl_keyfile = "key.pem"
    # ssl_certfile = "cert.pem"
    
    print("Starting server on http://localhost:8000")
    print("Access client at: http://localhost:8000/client")
    print("")
    print("💡 Note: Microphone access requires HTTPS or localhost")
    print("   If you see microphone errors, you're using HTTP from a non-localhost domain")
    
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload during development
        log_level="info"
        # Uncomment for HTTPS:
        # ssl_keyfile=ssl_keyfile,
        # ssl_certfile=ssl_certfile
    )
