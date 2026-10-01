from pydantic import BaseModel, Field
from typing import List, Optional, Tuple

class PredictionFeaturesInput(BaseModel):
    player_id: str
    player_name: str
    player_role: str = Field(default="batsman")
    recent_form_avg: float = Field(..., description="Average runs in last 5 matches")
    recent_strike_rate: float = Field(..., description="Recent strike rate")
    opp_bowling_strength: float = Field(default=8.2, description="Opposition bowling economy rate")
    venue_avg_score: float = Field(default=165.0, description="Venue average total match runs")

class RunsPredictionResponse(BaseModel):
    player_id: str
    player_name: str
    predicted_runs: int
    confidence_range: Tuple[int, int]
    model_version: str
    features_used: dict

class POMPredictionResponse(BaseModel):
    player_id: str
    player_name: str
    pom_probability: float
    confidence_level: str
    key_factors: List[str]
    model_version: str

class HealthResponse(BaseModel):
    status: str
    service: str
    model_loaded: bool
    model_version: str
