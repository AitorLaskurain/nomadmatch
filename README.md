# 🗺️ NomadMatch — RAG City Recommendation System

Sistema inteligente de recomendación de ciudades europeas para nómadas digitales.
Utiliza RAG (Retrieval-Augmented Generation) con ChromaDB + OpenAI Embeddings.

## 🏗️ Arquitectura

```
Frontend (Vanilla JS, :3000) → Backend (FastAPI, :8000) → ChromaDB (:8001)
                                         ↓
                                   OpenAI Embeddings
                                 (text-embedding-3-small)
```

## 🚀 Quick Start

### 1. Clonar y configurar
```bash
git clone https://github.com/awalim/nomadmatch-rag.git
cd nomadmatch-rag
cp .env.example .env
# Editar .env y añadir tu OPENAI_API_KEY
```

### 2. Levantar con Docker
```bash
docker-compose up --build -d
```

### 3. Verificar
```bash
# Health check
curl http://localhost:8000/api/v1/health

# Los datos se ingestarán automáticamente al iniciar
```

### 4. Usar
Abrir http://localhost:3000 en el navegador.

## 📊 Dataset

- **50 ciudades europeas** con 61+ atributos cada una
- Fuentes: WHO, World Bank, Numbeo, EF EPI, Ookla, fuentes gubernamentales
- Datos de visa y fiscalidad incluidos

## 🔗 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/collections` | Lista colecciones |
| POST | `/api/v1/upload` | Subir CSV |
| POST | `/api/v1/query` | **Búsqueda semántica + ranking** |
| POST | `/api/v1/chat` | Chat conversacional |

## 🎓 TFM

Proyecto Final de Máster — IA Business & Innovation — Nuclio Digital School
