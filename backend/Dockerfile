# Usamos Python 3.12 que es obligatorio para Bedrock
FROM python:3.12-slim

# Directorio de trabajo
WORKDIR /app

# Copiamos los requirements e instalamos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código del backend
COPY . .

# Exponemos el puerto 8080 (Estándar de App Runner)
EXPOSE 8080

# Comando para iniciar (Importante: host 0.0.0.0 y puerto 8080)
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]