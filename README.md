# 🗺️ NomadMatch — RAG City Recommendation System

Sistema inteligente de recomendación de ciudades europeas para nómadas digitales.
Utiliza RAG (Retrieval-Augmented Generation) con ChromaDB + OpenAI Embeddings.

## 🏗️ Arquitectura# 🌍 NomadMatch · Encuentra tu ciudad europea ideal

[![Version](https://img.shields.io/badge/version-1.0.0-blueviolet?style=for-the-badge)](https://github.com/AitorLaskurain/nomadmatch)
[![Stack](https://img.shields.io/badge/stack-RAG%20%7C%20ChromaDB%20%7C%20FastAPI-6E56CF?style=for-the-badge)](https://github.com/AitorLaskurain/nomadmatch)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](https://github.com/AitorLaskurain/nomadmatch)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)

**✨ Sistema inteligente de recomendación de ciudades para nómadas digitales con IA y matching semántico ✨**

*Proyecto de Máster en AI, Business & Innovation · Nuclio Digital School*

---

## 🎯 ¿Qué es NomadMatch?

**NomadMatch** es un sistema RAG (Retrieval-Augmented Generation) que ayuda a nómadas digitales a encontrar su ciudad europea ideal.

Los usuarios seleccionan sus preferencias (presupuesto, clima, internet, visa, ambiente) y el sistema encuentra **las 3 ciudades con mejor matching** usando embeddings semánticos y búsqueda por similitud vectorial con ChromaDB.

### ✨ Características principales

| | |
|---|---|
| 🎨 **Diseño Premium** | Interfaz moderna con modo oscuro y gradientes |
| 🔍 **Matching Semántico** | Embeddings de OpenAI + ChromaDB vectorial |
| 🏙️ **50 Ciudades Europeas** | Dataset completo con +70 atributos por ciudad |
| 💰 **Modelo Freemium** | Tier gratuito + Premium (€9.99/mes) con visa y tax info |
| 📱 **Responsive** | Funciona en móvil, tablet y desktop |
| 🐳 **Dockerizado** | Setup completo en 5 minutos con Docker Compose |
| 🌐 **Dual-Stakeholder** | B2C (nómadas) + B2G (gobiernos/gentrificación) |

---

## 🏗️ Arquitectura RAG

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│  ChromaDB   │
│  Vanilla JS │     │   FastAPI   │     │  Vectores   │
│  HTML/CSS   │◀────│   REST API  │◀────│  Embeddings │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │   OpenAI    │
                    │  Embeddings │
                    │ text-embed  │
                    └─────────────┘
```

### Flujo del sistema

1. **Ingesta**: El CSV de 50 ciudades se convierte en embeddings vectoriales
2. **Almacenamiento**: ChromaDB almacena los vectores con metadatos
3. **Query**: Las preferencias del usuario se convierten en un embedding
4. **Matching**: Búsqueda por similitud coseno en ChromaDB
5. **Respuesta**: Las 3 mejores ciudades con scores de matching

---

## 🚀 Instalación rápida (5 minutos)

### Prerrequisitos

- Docker y Docker Compose instalados
- Git
- OpenAI API Key ([obtener aquí](https://platform.openai.com/api-keys))

### 1. Clonar el repositorio

```bash
git clone https://github.com/AitorLaskurain/nomadmatch.git
cd nomadmatch
```

### 2. Configurar variables de entorno

```bash
cp .env.example backend/.env
```

Edita `backend/.env` y añade tu API Key:

```
OPENAI_API_KEY=sk-tu-api-key-aqui
```

### 3. Levantar el sistema

```bash
docker-compose up --build -d
```

Espera ~10 segundos a que el backend inicie completamente.

### 4. Cargar el dataset

```bash
curl -X POST http://localhost:8000/api/v1/upload \
  -F "file=@./backend/data/cities.csv"
```

### 5. ¡Usar!

| Servicio | URL |
|----------|-----|
| 🖥️ Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8000 |
| 📖 API Docs (Swagger) | http://localhost:8000/docs |

---

## 📁 Estructura del proyecto

```
nomadmatch/
├── 📁 backend/
│   ├── main.py              # Servidor FastAPI
│   ├── routes.py            # Endpoints REST API
│   ├── chroma_manager.py    # Gestión de ChromaDB + embeddings
│   ├── data/
│   │   └── cities.csv       # Dataset completo (50 ciudades)
│   ├── requirements.txt     # Dependencias Python
│   └── Dockerfile           # Imagen backend
├── 📁 frontend/
│   ├── public/
│   │   ├── index.html       # Página principal
│   │   ├── app.js           # Lógica del frontend
│   │   └── styles.css       # Estilos (modo oscuro)
│   └── Dockerfile           # Imagen frontend
├── .env.example             # Template de variables de entorno
├── .gitignore               # Archivos excluidos de Git
├── docker-compose.yml       # Orquestación de servicios
└── README.md                # Este archivo
```

---

## 🔧 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Estado del sistema |
| `GET` | `/api/v1/collections` | Info de ChromaDB |
| `POST` | `/api/v1/upload` | Subir CSV de ciudades |
| `POST` | `/api/v1/query` | Búsqueda semántica |
| `POST` | `/api/v1/chat` | Obtener matches de ciudades |

📖 Ver documentación interactiva completa en `http://localhost:8000/docs`

---

## 📊 Dataset

El proyecto incluye un dataset curado de **50 ciudades europeas** con **+70 atributos** cada una, obtenidos de fuentes académicas y oficiales:

| Categoría | Atributos | Fuentes |
|-----------|-----------|---------|
| 💰 **Costos** | Alquiler, presupuesto mensual, coste de vida | Numbeo, Eurostat |
| 📶 **Internet** | Velocidad media, fiabilidad, cobertura fibra | Speedtest, OECD |
| 🌡️ **Clima** | Temperatura verano/invierno, horas de sol, precipitación | WHO, servicios meteorológicos |
| 🛂 **Visa** | Disponibilidad digital nomad visa, duración, requisitos | Gobiernos oficiales |
| 💼 **Fiscalidad** | NHR, Beckham Law, IP Box, regímenes especiales | OECD, legislación local |
| 🎨 **Lifestyle** | Playas, vida nocturna, tech hub, coworking, seguridad | Nomad List, informes locales |

---

## 💼 Modelo de negocio

NomadMatch opera con un modelo **dual-stakeholder**:

### B2C — Nómadas digitales (Freemium)
- **Free**: Matching básico de ciudades (top 3 recomendaciones)
- **Premium** (€9.99/mes): Información detallada de visas, fiscalidad, comparativas avanzadas

### B2G — Gobiernos y municipios
- Herramientas de análisis para gestión de flujos de nómadas digitales
- Datos sobre impacto de gentrificación y planificación urbana

---

## 🛠️ Tech Stack

| Componente | Tecnología |
|------------|------------|
| **Backend** | Python 3.11, FastAPI |
| **Vector DB** | ChromaDB |
| **Embeddings** | OpenAI text-embedding-ada-002 |
| **Frontend** | Vanilla JavaScript, HTML5, CSS3 |
| **Contenedores** | Docker, Docker Compose |
| **API Docs** | Swagger/OpenAPI (automático con FastAPI) |

---

## 👥 Equipo

Proyecto desarrollado por un equipo de 5 personas como parte del Máster en AI, Business & Innovation de Nuclio Digital School.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  <b>NomadMatch</b> · Hecho con ❤️ para nómadas digitales
  <br>
  <i>Máster en AI, Business & Innovation · Nuclio Digital School · 2026</i>
</p>


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
