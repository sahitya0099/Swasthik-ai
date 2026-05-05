import pandas as pd
import joblib
from nlp_ingredients import analyze_ingredients
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

def load_models():
    """Load the trained scaler, label encoder, and stacking model."""
    try:
        model = joblib.load("model.pkl")
        scaler = joblib.load("scaler.pkl")
        le = joblib.load("label_encoder.pkl")
        return model, scaler, le
    except FileNotFoundError as e:
        print(f"Error loading models: {e}")
        return None, None, None

def analyze_food_product(features_dict, ingredients_text):
    """
    Complete analysis combining ML prediction from features
    and NLP ingredient analysis.
    Returns a dictionary suitable for API responses.
    """
    model, scaler, le = load_models()
    if not model:
        return {"error": "Models not found"}

    # 1. Feature Engineering
    eps = 1
    
    energy = features_dict.get("energy_100g", 0)
    sugars = features_dict.get("sugars_100g", 0)
    fat = features_dict.get("fat_100g", 0)
    proteins = features_dict.get("proteins_100g", 0)
    salt = features_dict.get("salt_100g", 0)
    carbs = features_dict.get("carbohydrates_100g", 0)
    fiber = features_dict.get("fiber_100g", 0)
    sat_fat = features_dict.get("saturated_fat_100g", 0)
    
    # Calculate derived features
    features_dict["sugar_energy_ratio"] = sugars / (energy + eps)
    features_dict["fat_energy_ratio"] = fat / (energy + eps)
    features_dict["protein_energy_ratio"] = proteins / (energy + eps)
    features_dict["fiber_carb_ratio"] = fiber / (carbs + eps)
    features_dict["sugar_fiber_ratio"] = sugars / (fiber + eps)
    features_dict["fat_protein_ratio"] = fat / (proteins + eps)
    features_dict["salt_energy_ratio"] = salt / (energy + eps)
    features_dict["sat_fat_ratio"] = sat_fat / (fat + eps)
    features_dict["sat_fat_energy_ratio"] = sat_fat / (energy + eps)
    features_dict["unsat_fat_100g"] = max(0, fat - sat_fat)
    
    features_dict["trans_fat_ratio"] = features_dict.get("trans_fat_100g", 0) / (fat + eps)
    features_dict["sodium_salt_ratio"] = features_dict.get("sodium_100g", 0) / (salt + eps)
    
    micro_sum = (features_dict.get("vitamin_a_100g", 0) + 
                 features_dict.get("vitamin_c_100g", 0) + 
                 features_dict.get("calcium_100g", 0) + 
                 features_dict.get("iron_100g", 0) + 
                 features_dict.get("potassium_100g", 0))
    features_dict["micronutrient_density"] = micro_sum / (energy + eps)
    
    neg_score = sugars + fat + (salt * 10) + sat_fat + (features_dict.get("trans_fat_100g", 0) * 5)
    features_dict["negative_score"] = neg_score
    
    pos_score = proteins + fiber + (features_dict.get("potassium_100g", 0) / 100)
    features_dict["positive_score"] = pos_score
    features_dict["health_balance"] = pos_score - neg_score
    
    # Energy density bin
    if energy <= 600: ed = 0
    elif energy <= 1200: ed = 1
    elif energy <= 2000: ed = 2
    else: ed = 3
    features_dict["energy_density"] = ed
    
    features_dict["has_palm_oil"] = 1 if features_dict.get("ingredients_from_palm_oil_n", 0) > 0 else 0
    
    additives = features_dict.get("additives_n", 0)
    if additives <= 0: ar = 0
    elif additives <= 3: ar = 1
    elif additives <= 7: ar = 2
    else: ar = 3
    features_dict["additives_risk"] = ar

    df_features = pd.DataFrame([features_dict])
    expected_cols = scaler.feature_names_in_
    
    for col in expected_cols:
        if col not in df_features.columns:
            df_features[col] = 0
            
    df_features = df_features[expected_cols]
    
    # 2. Make Prediction
    X_scaled = scaler.transform(df_features)
    pred_idx = model.predict(X_scaled)[0]
    pred_label = le.inverse_transform([pred_idx])[0]
    pred_probs = model.predict_proba(X_scaled)[0]
    
    # 3. NLP Analysis
    nlp_results = analyze_ingredients(ingredients_text)
    
    # 4. Advanced AI Scoring System
    
    # Factor A: Nutrient Balance Score (NBS) - Base score 50
    # Values are per 100g. 
    # Positive: Protein, Fiber. Negative: Sugars, Sat Fat, Salt (heavy penalty), Calories.
    pos_factor = (proteins * 1.5) + (fiber * 4.0) + (features_dict.get("potassium_100g", 0) / 100)
    neg_factor = (sugars * 1.2) + (sat_fat * 2.5) + (salt * 15.0) + (energy / 600)
    nbs = 50 + pos_factor - neg_factor
    
    # Factor B: ML Confidence Factor (MLCF)
    # prob_probs indices: 0: Healthy, 1: Moderate, 2: Unhealthy
    ml_score = (pred_probs[0] * 100) + (pred_probs[1] * 50) + (pred_probs[2] * 0)
    
    # Factor C: Ingredient Quality Penalty (IQP)
    iqp = 0
    penalty_details = []
    for finding in nlp_results:
        item = finding.get("item")
        if item == "Trans Fats":
            iqp += 20
            penalty_details.append("Harmful Trans Fats (-20)")
        elif item == "Added Sugars" and sugars > 10:
            iqp += 10
            penalty_details.append("Added Sugars (-10)")
        elif item == "Palm Oil":
            iqp += 10
            penalty_details.append("Palm Oil (-10)")
        elif item == "Preservatives / Additives":
            iqp += 5
            penalty_details.append("Synthetic Additives (-5)")
        elif item == "Artificial Colors":
            iqp += 5
            penalty_details.append("Artificial Dyes (-5)")
    
    # Combine Factors (Weighted: 40% Nutrients, 60% ML Model)
    raw_score = (nbs * 0.4) + (ml_score * 0.6)
    
    # Apply Ingredient Penalties
    final_health_score = raw_score - iqp
    
    # Normalize to 0-100
    health_score_normalized = max(0, min(100, int(final_health_score)))

    # 5. Generate AI Explanation
    explanation = f"This food is classified as {pred_label} with an AI Health Score of {health_score_normalized}/100."
    
    if pred_label == "Unhealthy" or health_score_normalized < 40:
        reasons = []
        if sugars > 15: reasons.append("high sugar content")
        if sat_fat > 5: reasons.append("high saturated fats")
        if salt > 1.5: reasons.append("excessive sodium")
        if iqp > 0: reasons.append("harmful ingredients/additives")
        
        if reasons:
            explanation += f" It is penalized primarily for {', '.join(reasons)}."
        else:
            explanation += " It has a poor overall nutritional profile according to our ML model."
    elif health_score_normalized > 75:
        explanation += " It demonstrates a very high nutrient density and clean ingredient profile."
    else:
        explanation += " It offers a moderate nutritional balance. Suitable for occasional consumption."

    return {
        "prediction": pred_label,
        "health_score": health_score_normalized,
        "score_breakdown": {
            "nutritional_balance": round(nbs, 1),
            "ml_confidence_score": round(ml_score, 1),
            "ingredient_penalty": -iqp,
            "penalty_reasons": penalty_details
        },
        "confidence": {
            "Healthy": round(pred_probs[0] * 100, 1),
            "Moderate": round(pred_probs[1] * 100, 1),
            "Unhealthy": round(pred_probs[2] * 100, 1)
        },
        "nlp_analysis": nlp_results,
        "explanation": explanation,
        "nutritional_breakdown": {
            "calories": energy,
            "protein": proteins,
            "carbs": carbs,
            "fat": fat,
            "sugar": sugars,
            "fiber": fiber
        }
    }
