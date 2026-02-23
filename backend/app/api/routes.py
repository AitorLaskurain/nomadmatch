from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
import pandas as pd
from io import StringIO
import os
import csv
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from ..utils.chroma_utils import ChromaManager
from ..utils.llm_utils import generate_premium_advice
from ..models.schemas import (
    ChatRequest, ChatResponse,
    DocumentUploadResponse, HealthResponse,
    QueryRequest, QueryResponse
)
from ..api.auth import get_current_user
from ..models.user import User, UserCityPreference, SessionLocal


router = APIRouter()
chroma_manager = ChromaManager()

# Health check
@router.get("/health", response_model=HealthResponse)
async def health_check():
    try:
        stats = chroma_manager.get_stats()
        return HealthResponse(
            status="healthy",
            langflow_connected=False,
            chroma_configured=chroma_manager.initialized,
            stats=stats
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Upload CSV
@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = content.decode('utf-8')
        try:
            reader = csv.reader(StringIO(text))
            rows = list(reader)
            if len(rows) < 2:
                raise ValueError("CSV has no data rows")
            headers = rows[0]
            data_rows = rows[1:]
            df = pd.DataFrame(data_rows, columns=headers)
        except Exception as csv_err:
            print(f"csv.reader failed ({csv_err}), trying pandas...")
            df = pd.read_csv(StringIO(text), on_bad_lines='warn', quoting=csv.QUOTE_ALL, engine='python')
        
        local_chroma = ChromaManager()
        chunks_processed = local_chroma.ingest_dataframe(df, file.filename)
        return DocumentUploadResponse(
            message="Document uploaded successfully",
            filename=file.filename,
            success=True,
            chunks_processed=chunks_processed
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Chat endpoint
@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        results = chroma_manager.similarity_search(request.message, k=10)
        cities = []
        for r in results[:3]:
            metadata = r.get("metadata", {})
            cities.append({
                "city": metadata.get("city", "Unknown"),
                "country": metadata.get("country", ""),
                "budget": metadata.get("budget", "Moderate"),
                "internet": metadata.get("internet", "Good"),
                "visa": metadata.get("visa", "No"),
                "score": round(r.get("similarity_score", 0) * 100, 1)
            })
        return ChatResponse(
            response=f"Found {len(cities)} cities for you",
            session_id=request.session_id,
            cities=cities
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Query endpoint
@router.post("/query", response_model=QueryResponse)
async def query_vector_db(request: QueryRequest):
    try:
        local_chroma = ChromaManager()
        results = local_chroma.similarity_search(request.query, k=request.num_results or 10)
        return QueryResponse(results=results, query=request.query, count=len(results))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Collections endpoint
@router.get("/collections")
async def get_collections():
    try:
        collections = chroma_manager.list_collections()
        stats = chroma_manager.get_stats()
        return {"collections": collections, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# PREMIUM ENDPOINTS
# ============================================

class PremiumAdviceResponse(BaseModel):
    results: List[Dict[str, Any]]
    query: str
    count: int
    advice: str

@router.post("/premium/advice", response_model=PremiumAdviceResponse)
async def premium_advice(
    request: QueryRequest,
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_premium:
        raise HTTPException(status_code=403, detail="Se requiere suscripcion premium")

    local_chroma = ChromaManager()
    results = local_chroma.premium_search_with_scoring(request.query, k=request.num_results or 10)

    # Filter out disliked cities
    db = SessionLocal()
    try:
        disliked = db.query(UserCityPreference).filter(
            UserCityPreference.user_id == current_user.id,
            UserCityPreference.action == "dislike"
        ).all()
        disliked_cities = {d.city_name.lower() for d in disliked}
        if disliked_cities:
            results = [r for r in results if r.get('metadata', {}).get('city', '').lower() not in disliked_cities]
    finally:
        db.close()

    advice = generate_premium_advice(request.query, results)

    return PremiumAdviceResponse(
        results=results,
        query=request.query,
        count=len(results),
        advice=advice
    )


# ============================================
# CITY PREFERENCE ENDPOINTS (Like / Dislike)
# ============================================

class CityPreferenceRequest(BaseModel):
    city_name: str
    action: str  # "like" or "dislike"

class CityPreferenceResponse(BaseModel):
    message: str
    city_name: str
    action: str
    user_id: int

@router.post("/preferences/city", response_model=CityPreferenceResponse)
async def set_city_preference(
    request: CityPreferenceRequest,
    current_user: User = Depends(get_current_user)
):
    """Save like/dislike preference for a city (all logged-in users)"""
    if request.action not in ["like", "dislike"]:
        raise HTTPException(status_code=400, detail="Action must be 'like' or 'dislike'")
    
    db = SessionLocal()
    try:
        existing = db.query(UserCityPreference).filter(
            UserCityPreference.user_id == current_user.id,
            UserCityPreference.city_name == request.city_name
        ).first()
        
        if existing:
            existing.action = request.action
            db.commit()
        else:
            pref = UserCityPreference(
                user_id=current_user.id,
                city_name=request.city_name,
                action=request.action
            )
            db.add(pref)
            db.commit()
        
        return CityPreferenceResponse(
            message=f"Preference saved for {request.city_name}",
            city_name=request.city_name,
            action=request.action,
            user_id=current_user.id
        )
    finally:
        db.close()


@router.get("/preferences/cities")
async def get_city_preferences(current_user: User = Depends(get_current_user)):
    """Get all city preferences for the user"""
    db = SessionLocal()
    try:
        prefs = db.query(UserCityPreference).filter(
            UserCityPreference.user_id == current_user.id
        ).all()
        
        return {
            "user_id": current_user.id,
            "preferences": [
                {
                    "city_name": p.city_name,
                    "action": p.action,
                    "created_at": p.created_at.isoformat() if p.created_at else None
                }
                for p in prefs
            ],
            "likes": [p.city_name for p in prefs if p.action == "like"],
            "dislikes": [p.city_name for p in prefs if p.action == "dislike"]
        }
    finally:
        db.close()


@router.delete("/preferences/city/{city_name}")
async def delete_city_preference(
    city_name: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a city preference"""
    db = SessionLocal()
    try:
        pref = db.query(UserCityPreference).filter(
            UserCityPreference.user_id == current_user.id,
            UserCityPreference.city_name == city_name
        ).first()
        if not pref:
            raise HTTPException(status_code=404, detail="Preference not found")
        db.delete(pref)
        db.commit()
        return {"message": f"Preference deleted for {city_name}"}
    finally:
        db.close()
