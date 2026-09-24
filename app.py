"""
MediSuivi - Gravite prediction API
====================================
Small FastAPI service that wraps the trained Random Forest model and
exposes it over HTTP, so your Spring Boot backend can call it.

Directory layout expected (put the .joblib / .json files next to this
script, or set ARTIFACT_DIR below):

    medisuivi_predict_api/
      app.py                    <- this file
      random_forest_model.joblib
      scaler.joblib
      le_sexe.joblib
      le_disease.joblib
      feature_cols.json

Run locally:
    pip install fastapi uvicorn scikit-learn pandas joblib --break-system-packages
    uvicorn app:app --host 0.0.0.0 --port 8000

Test:
    curl -X POST http://localhost:8000/predict \
      -H "Content-Type: application/json" \
      -d '{
            "age": 54, "sexe": "F", "disease": "diabete",
            "jours_depuis_diagnostic": 120, "valeur_mesure_proche": 180.0,
            "deviation_score": 2.3, "rolling_mean_14j": 165.0,
            "rolling_std_14j": 12.5, "trend_slope_14j": 0.8,
            "nb_symptomes_recents_7j": 3
          }'
"""

import os
import json
import joblib
import numpy as np
import shap
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ------------------------------------------------------------------
# Load artifacts once at startup
# ------------------------------------------------------------------
ARTIFACT_DIR = os.path.dirname(os.path.abspath(__file__))

_model = joblib.load(os.path.join(ARTIFACT_DIR, "random_forest_model.joblib"))
_scaler = joblib.load(os.path.join(ARTIFACT_DIR, "scaler.joblib"))
_le_sexe = joblib.load(os.path.join(ARTIFACT_DIR, "le_sexe.joblib"))
_le_disease = joblib.load(os.path.join(ARTIFACT_DIR, "le_disease.joblib"))
_explainer = shap.TreeExplainer(_model)

with open(os.path.join(ARTIFACT_DIR, "feature_cols.json")) as f:
    _feature_cols = json.load(f)

app = FastAPI(title="MediSuivi Gravite Prediction API")


# ------------------------------------------------------------------
# Request / response schemas
# ------------------------------------------------------------------
class PatientFeatures(BaseModel):
    age: float
    sexe: str
    disease: str
    jours_depuis_diagnostic: float
    valeur_mesure_proche: float
    deviation_score: float
    rolling_mean_14j: float
    rolling_std_14j: float
    trend_slope_14j: float
    nb_symptomes_recents_7j: float
    type_mesure: str = ""


class PredictionResponse(BaseModel):
    gravite: str
    probabilities: dict
    explanations: list = []
    contributions: dict = {}
    top_facteurs_shap: list = []
    agent: dict = {}


# ------------------------------------------------------------------
# XAI — SHAP explanations
# ------------------------------------------------------------------
def _pct_change_14j(row):
    mean = row["rolling_mean_14j"]
    if mean:
        return (row["valeur_mesure_proche"] - mean) / abs(mean) * 100.0
    return 0.0


_MEASURE_META = {
    "GLYCEMIE": ("Glycémie", "g/L"),
    "TENSION": ("Tension artérielle", "mmHg"),
    "SPO2": ("Saturation en oxygène", "%"),
    "FREQUENCE_CARDIAQUE": ("Fréquence cardiaque", "bpm"),
    "TEMPERATURE": ("Température", "°C"),
    "POIDS": ("Poids", "kg"),
}


def _normalize_measure_type(raw):
    raw = (raw or "").strip().upper()
    if "POID" in raw or "WEIGHT" in raw:
        return "POIDS"
    if "GLYC" in raw or "SUCR" in raw or "GLUCOSE" in raw:
        return "GLYCEMIE"
    if "TENS" in raw or "PRES" in raw or "BP" in raw:
        return "TENSION"
    if "OXY" in raw or "SPO2" in raw or "SATUR" in raw:
        return "SPO2"
    if "CARD" in raw or "FREQ" in raw or "POULS" in raw or "PULSE" in raw or "BPM" in raw:
        return "FREQUENCE_CARDIAQUE"
    if "TEMP" in raw:
        return "TEMPERATURE"
    return raw


def _measure_meta(type_mesure):
    norm = _normalize_measure_type(type_mesure)
    return _MEASURE_META.get(norm, ("Mesure", ""))


def _diagnose_problem(type_mesure, val, dev, disease=""):
    """
    Returns clinical diagnosis, title, detail, consequence, and advice.
    Explicitly identifies severe overweight / obesity for POIDS (e.g. 150 kg),
    hyperglycemia, hypertension, hypoxia, etc.
    """
    tm = _normalize_measure_type(type_mesure)
    label, unit = _measure_meta(tm)
    low = label.lower()

    if tm == "POIDS":
        # Clinical thresholds for adult monitoring: normal ~50 to 100 kg
        if val >= 100 or dev > 0:
            is_critical = val >= 130 or dev >= 0.30
            term = "Obésité sévère / Surpoids critique" if is_critical else "Surpoids important"
            detail = (
                f"Poids mesuré à {val:g} kg (+{dev * 100:.0f}% au-dessus du seuil normal de 100 kg) : "
                f"situation d'{term.lower()}."
            )
            if disease == "INSUFFISANCE_CARDIAQUE":
                consequence = (
                    "Chez un patient insuffisant cardiaque, une prise de poids rapide ou massive "
                    "peut signaler une rétention hydrosodée et une décompensation cardiaque aiguë."
                )
            else:
                consequence = (
                    "Cette surcharge pondérale majeure constitue un facteur de risque cardiovasculaire "
                    "et métabolique sévère (hypertension, surcharge cardiaque, diabète)."
                )
            return {
                "type": tm,
                "label": label,
                "label_low": low,
                "unit": unit,
                "name": term,
                "title": f"Alerte Pondérale : {term} ({val:g} kg)",
                "detail": detail,
                "consequence": consequence,
                "advice": [
                    "Consultez rapidement votre médecin traitant pour un bilan métabolique et cardiovasculaire approfondi.",
                    "Surveillez attentivement tout essoufflement à l'effort ou au repos, et signalez d'éventuels gonflements des chevilles (œdèmes).",
                    "Pesez-vous le matin à jeun, à la même heure, pour surveiller l'évolution de votre poids.",
                    "Bénéficiez d'une prise en charge nutritionnelle et diététique personnalisée.",
                ],
            }
        elif val < 50 or dev < 0:
            return {
                "type": tm,
                "label": label,
                "label_low": low,
                "unit": unit,
                "name": "Insuffisance pondérale",
                "title": f"Alerte Pondérale : Poids insuffisant ({val:g} kg)",
                "detail": f"Poids mesuré à {val:g} kg, inférieur au seuil minimal clinique de 50 kg.",
                "consequence": "Un poids anormalement bas peut révéler une dénutrition ou un amaigrissement involontaire à explorer.",
                "advice": [
                    "Consultez votre médecin pour évaluer votre état nutritionnel et rechercher la cause de cette perte de poids.",
                    "Enrichissez votre alimentation selon les conseils de votre professionnel de santé.",
                ],
            }

    elif tm == "GLYCEMIE":
        is_mg = val > 20
        norm_val = val / 100.0 if is_mg else val
        unit_str = "mg/dL" if is_mg else "g/L"

        if norm_val > 1.40 or dev > 0:
            if norm_val >= 2.0 or dev >= 0.40:
                return {
                    "type": tm,
                    "label": label,
                    "label_low": low,
                    "unit": unit_str,
                    "name": "Hyperglycémie sévère",
                    "title": f"Alerte Glycémie : Hyperglycémie critique ({val:g} {unit_str})",
                    "detail": (
                        f"Glycémie très élevée à {val:g} {unit_str} (seuil normal ≤ {'140 mg/dL' if is_mg else '1.40 g/L'}) : "
                        f"déséquilibre glycémique sévère."
                    ),
                    "consequence": "Un taux de sucre aussi élevé nécessite une prise en charge rapide pour prévenir une décompensation acido-cétosique.",
                    "advice": [
                        "Vérifiez immédiatement vos prises de traitement antidiabétique (médicaments ou insuline).",
                        "Hydratez-vous abondamment avec de l'eau (sans sucre) pour éliminer le glucose.",
                        "Recontrôlez votre glycémie dans 2 heures ; si elle reste très haute, contactez votre médecin ou le 190.",
                    ],
                }
            else:
                return {
                    "type": tm,
                    "label": label,
                    "label_low": low,
                    "unit": unit_str,
                    "name": "Hyperglycémie",
                    "title": f"Alerte Glycémie : Taux de sucre élevé ({val:g} {unit_str})",
                    "detail": (
                        f"Glycémie mesurée à {val:g} {unit_str}, au-dessus de la cible thérapeutique "
                        f"(seuil max : {'140 mg/dL' if is_mg else '1.40 g/L'})."
                    ),
                    "consequence": "Ce déséquilibre glycémique augmente le risque de complications vasculaires à long terme.",
                    "advice": [
                        "Vérifiez le bon respect des horaires et des doses de votre traitement.",
                        "Limitez les glucides simples et évitez les collations sucrées.",
                        "Consignez vos glycémies pour faire le point avec votre médecin traitant.",
                    ],
                }
        elif norm_val < 0.70 or dev < 0:
            return {
                "type": tm,
                "label": label,
                "label_low": low,
                "unit": unit_str,
                "name": "Hypoglycémie (Taux de sucre trop bas)",
                "title": f"Alerte Urgente : Hypoglycémie ({val:g} {unit_str})",
                "detail": f"Glycémie anormalement basse mesurée à {val:g} {unit_str} (seuil d'alerte < {'70 mg/dL' if is_mg else '0.70 g/L'}).",
                "consequence": "Risque immédiat de malaise, sueurs, tremblements, vertiges ou perte de connaissance.",
                "advice": [
                    "Ressucrez-vous sans attendre : prenez 3 morceaux de sucre, 1/2 verre de jus de fruit ou une cuillère de miel.",
                    "Restez assis au calme pendant 15 minutes, puis recontrôlez votre glycémie.",
                    "En cas de malaise persistant ou de confusion, appelez immédiatement les secours (190).",
                ],
            }

    elif tm == "TENSION":
        if val > 140 or dev > 0:
            if val >= 180 or dev >= 0.35:
                return {
                    "type": tm,
                    "label": label,
                    "label_low": low,
                    "unit": unit,
                    "name": "Poussée hypertensive sévère",
                    "title": f"Alerte Tension : Crise hypertensive ({val:g} mmHg)",
                    "detail": f"Tension artérielle critique mesurée à {val:g} mmHg (seuil normal ≤ 140 mmHg) : crise hypertensive.",
                    "consequence": "Pression artérielle excessive avec risque cardiovasculaire et cérébral aigu (AVC, infarctus).",
                    "advice": [
                        "Asseyez-vous au calme complet pendant 10 minutes et reprenez la tension.",
                        "Vérifiez la bonne prise de vos antihypertenseurs du jour.",
                        "En cas de maux de tête intenses, troubles visuels ou douleur à la poitrine, contactez immédiatement le 15 ou le 190.",
                    ],
                }
            else:
                return {
                    "type": tm,
                    "label": label,
                    "label_low": low,
                    "unit": unit,
                    "name": "Hypertension artérielle",
                    "title": f"Alerte Tension : Pression artérielle élevée ({val:g} mmHg)",
                    "detail": f"Tension artérielle mesurée à {val:g} mmHg, supérieure aux valeurs cibles (normale ≤ 140 mmHg).",
                    "consequence": "Une tension durablement élevée fatigue le cœur et fragilise les parois vasculaires.",
                    "advice": [
                        "Reprenez votre tension au repos dans les prochaines heures.",
                        "Réduisez votre consommation de sel, de café et d'excitants.",
                        "Signalez ces mesures à votre médecin pour adapter le traitement si nécessaire.",
                    ],
                }
        elif val < 90 or dev < 0:
            return {
                "type": tm,
                "label": label,
                "label_low": low,
                "unit": unit,
                "name": "Hypotension artérielle",
                "title": f"Alerte Tension : Tension trop basse ({val:g} mmHg)",
                "detail": f"Tension artérielle basse à {val:g} mmHg (seuil minimal recommandé : 90 mmHg).",
                "consequence": "Risque d'hypoperfusion avec vertiges, sensation de faiblesse et risque de chute.",
                "advice": [
                    "Allongez-vous quelques instants et surélevez légèrement les jambes.",
                    "Buvez un grand verre d'eau et levez-vous très lentement.",
                ],
            }

    elif tm == "SPO2":
        if val < 95 or dev > 0:
            return {
                "type": tm,
                "label": label,
                "label_low": low,
                "unit": unit,
                "name": "Désaturation en oxygène (Hypoxie)",
                "title": f"Alerte Respiratoire : Saturation basse ({val:g}%)",
                "detail": f"Saturation en oxygène basse mesurée à {val:g}% (normale de sécurité ≥ 95%) : hypoxie.",
                "consequence": "Diminution de l'oxygénation des organes et des tissus.",
                "advice": [
                    "Installez-vous en position assise droite pour faciliter l'ampliation respiratoire.",
                    "Respirez calmement et profondément, puis recontrôlez la mesure avec un doigt propre et tiède.",
                    "Si vous ressentez un essoufflement marqué ou si la SpO2 est < 92%, contactez sans délai le 190 (SAMU).",
                ],
            }

    elif tm == "FREQUENCE_CARDIAQUE":
        if val > 100 or dev > 0:
            return {
                "type": tm,
                "label": label,
                "label_low": low,
                "unit": unit,
                "name": "Tachycardie (Pouls rapide)",
                "title": f"Alerte Cardiaque : Pouls trop rapide ({val:g} bpm)",
                "detail": f"Fréquence cardiaque mesurée à {val:g} bpm au repos (normale : 60 à 100 bpm) : tachycardie.",
                "consequence": "Accélération du rythme cardiaque augmentant le travail du muscle cardiaque.",
                "advice": [
                    "Asseyez-vous au repos absolu et pratiquez quelques respirations lentes.",
                    "Évitez tout stimulant (café, tabac, boissons énergisantes).",
                    "Consultez en urgence si la tachycardie est accompagnée de douleurs thoraciques ou de malaise.",
                ],
            }
        elif val < 60 or dev < 0:
            return {
                "type": tm,
                "label": label,
                "label_low": low,
                "unit": unit,
                "name": "Bradycardie (Pouls lent)",
                "title": f"Alerte Cardiaque : Pouls trop ralenti ({val:g} bpm)",
                "detail": f"Fréquence cardiaque basse mesurée à {val:g} bpm (normale : 60 à 100 bpm) : bradycardie.",
                "consequence": "Ralentissement inhabituel du rythme cardiaque.",
                "advice": [
                    "Restez assis et notez l'apparition éventuelle de vertiges ou d'étourdissements.",
                    "Informez votre médecin, particulièrement si vous prenez des médicaments régulateurs du cœur.",
                ],
            }

    elif tm == "TEMPERATURE":
        if val >= 38.0 or dev > 0:
            return {
                "type": tm,
                "label": label,
                "label_low": low,
                "unit": unit,
                "name": "Fièvre (Syndrome fébrile)",
                "title": f"Alerte Température : Fièvre ({val:g}°C)",
                "detail": f"Température corporelle mesurée à {val:g}°C (seuil normal ≤ 37.5°C) : état fébrile.",
                "consequence": "Signe d'une réaction immunitaire active, liée le plus souvent à une infection.",
                "advice": [
                    "Hydratez-vous régulièrement et reposez-vous.",
                    "Ne vous couvrez pas excessivement pour faciliter la régulation thermique.",
                    "Consultez votre médecin si la fièvre persiste au-delà de 48 heures ou s'accompagne de frissons sévères.",
                ],
            }

    return None


def _explain_feature(name, value, up, row, type_mesure=""):
    label, unit = _measure_meta(type_mesure)
    low = label.lower()
    val = row.get("valeur_mesure_proche", 0.0)
    dev = row.get("deviation_score", 0.0)
    disease = row.get("disease", "")

    if name == "trend_slope_14j":
        pct = _pct_change_14j(row)
        if value >= 0:
            return f"Hausse continue de +{pct:.0f}% de {low} sur les 14 derniers jours (pente +{value:.2f}/jour)."
        return f"Baisse de {pct:.0f}% de {low} sur les 14 derniers jours (pente {value:.2f}/jour)."
    if name == "nb_symptomes_recents_7j":
        return f"{int(round(value))} symptôme(s) signalé(s) sur les 7 derniers jours."
    if name == "deviation_score":
        diag = _diagnose_problem(type_mesure, val, value, disease)
        if diag:
            return diag["detail"]
        if label and unit:
            return f"Écart de {value:.2f} par rapport aux seuils cliniques ({low} à {val:g} {unit})."
        return f"Écart de {value:.2f} par rapport aux seuils cliniques."
    if name == "valeur_mesure_proche":
        diag = _diagnose_problem(type_mesure, val, dev, disease)
        if diag:
            return f"Dernière mesure : {diag['name']} ({val:g} {diag['unit']})."
        if unit:
            return (f"Dernière mesure : {low} à {val:g} {unit}, au-delà des seuils normaux."
                    if up else f"Dernière mesure : {low} à {val:g} {unit}, dans les seuils normaux.")
        return f"Dernière mesure à {val:g}, au-delà des seuils cliniques." if up else f"Dernière mesure à {val:g}."
    if name == "rolling_mean_14j":
        return (f"Moyenne glissante sur 14 jours élevée ({value:g} {unit})."
                if up else f"Moyenne glissante sur 14 jours stable ({value:g} {unit}).")
    if name == "rolling_std_14j":
        return (f"Variabilité importante des mesures récentes ({value:g})."
                if up else f"Mesures récentes régulières (variabilité {value:g}).")
    if name == "age":
        return f"Âge du patient ({value:.0f} ans)."
    if name == "jours_depuis_diagnostic":
        return f"Diagnostic {'récent' if value < 90 else 'ancien'} ({value:.0f} jours)."
    if name == "sexe_enc":
        return "Sexe du patient."
    if name == "disease_enc":
        return f"Pathologie chronique suivie ({disease or 'Pathologie'})."
    return f"{name} contribue au risque."


def build_explanations(contrib, row, top_k=3, type_mesure=""):
    pairs = sorted(zip(_feature_cols, contrib), key=lambda p: abs(p[1]), reverse=True)
    positives = [p for p in pairs if p[1] > 0]
    chosen = positives[:top_k] or pairs[:top_k]
    return [_explain_feature(name, row[name], c > 0, row, type_mesure) for name, c in chosen]


FEATURE_LABELS = {
    "age": "Âge",
    "sexe_enc": "Sexe",
    "disease_enc": "Pathologie",
    "jours_depuis_diagnostic": "Ancienneté du diagnostic",
    "valeur_mesure_proche": "Dernière mesure",
    "deviation_score": "Écart par rapport à la cible",
    "rolling_mean_14j": "Moyenne glissante 14 jours",
    "rolling_std_14j": "Variabilité des mesures",
    "trend_slope_14j": "Tendance sur 14 jours",
    "nb_symptomes_recents_7j": "Symptômes déclarés (7j)",
}

_MEASURE_BOUND = {"valeur_mesure_proche", "deviation_score", "rolling_mean_14j", "rolling_std_14j", "trend_slope_14j"}


def build_top_factors(contrib, row, top_k=3, type_mesure=""):
    label, _ = _measure_meta(type_mesure)
    impacts = []
    for name, shap_val in zip(_feature_cols, contrib):
        nom = FEATURE_LABELS.get(name, name)
        if name in _MEASURE_BOUND:
            nom = f"{nom} ({label})"
        impacts.append({
            "feature": name,
            "nom_lisible": nom,
            "valeur_reelle": round(float(row[name]), 2),
            "impact_shap": round(float(shap_val), 4),
            "direction": "AGGRAVANT" if shap_val > 0 else "PROTECTEUR",
            "importance": _explain_feature(name, row[name], shap_val > 0, row, type_mesure),
        })
    aggravants = [f for f in impacts if f["direction"] == "AGGRAVANT"]
    aggravants.sort(key=lambda f: f["impact_shap"], reverse=True)
    return aggravants[:top_k]


# ------------------------------------------------------------------
# MediSuivi AI — translator (Gemini, with local fallback)
# ------------------------------------------------------------------
AGENT_SYSTEM_PROMPT = """# RÔLE & IDENTITÉ
Tu es "MediSuivi AI", l'assistant médical intelligent de la plateforme de télésuivi MediSuivi.
Ton rôle est d'expliquer au patient son problème de santé EXACT à partir des constantes mesurées (ex: poids, glycémie, tension) et des résultats de l'IA (Random Forest + SHAP).

# DIRECTIVES DE DIAGNOSTIC ET CLARTÉ (ESSENTIELLES)
1. Nomme TOUJOURS le problème clinique précis et concret au lieu de termes vagues d'ingénieur :
   - Si type_mesure = "POIDS" et poids élevé (ex: 150 kg) : annonce clairement "Surpoids sévère" ou "Obésité avancée" (avec la valeur exacte "150 kg" et le seuil clinique de 100 kg), explique les risques cardiovasculaires, articulaires et métaboliques, et donne des conseils diététiques, de pesée à jeun et de consultation médicale.
   - Si GLYCEMIE élevée : annonce "Hyperglycémie" (avec la valeur en g/L), le risque de décompensation diabétique et le contrôle des traitements.
   - Si TENSION élevée : annonce "Hypertension artérielle" (avec la valeur en mmHg) et le risque cardiovasculaire.
   - Si SPO2 basse : annonce "Désaturation en oxygène / Hypoxie" et la posture respiratoire assise.
   - Ne dis JAMAIS "Écart de 0.50 par rapport aux seuils cliniques" sans nommer la mesure, sa valeur, l'unité et le problème exact.
2. Tu n'es PAS un médecin prescripteur : ne modifie jamais un traitement.
3. Si le niveau de risque est "CRITIQUE" ou "ELEVE", recommande d'échanger avec le médecin traitant ou d'appeler le 190 si malaise/symptôme grave.
4. Reste empathique, rigoureux, bienveillant et actionnable.

# FORMAT DE SORTIE ATTENDU (STRICTEMENT EN JSON)
{
  "synthese_titre": "Titre clair avec le problème identifié (ex: Alerte Pondérale : Obésité / Surpoids sévère (150 kg))",
  "niveau_alerte": "FAIBLE | MODERE | ELEVE | CRITIQUE",
  "explication_patient": {
    "resume": "Explication claire du problème exact identifié en 2 phrases simples pour le patient.",
    "facteurs_declencheurs": ["Facteur clinique 1 précis avec mesure et unité", "Facteur 2"],
    "conseils_immediats": ["Conseil spécifique au problème 1", "Conseil spécifique 2", "Conseil 3"],
    "message_rassurant": "Phrase de réassurance et rappel de la notification au médecin."
  },
  "synthese_clinique_medecin": {
    "conclusion": "Synthèse médicale formelle en 2 lignes pour le praticien avec métriques.",
    "drivers_statistiques": "Résumé des features SHAP ayant fait basculer le score."
  }
}"""

_GRAVITE_TO_ALERTE = {"FAIBLE": "FAIBLE", "MODERE": "MODERE", "GRAVE": "ELEVE", "CRITIQUE": "CRITIQUE"}


def _local_translate(payload):
    pred = payload["prediction"]["gravite"]
    niveau = _GRAVITE_TO_ALERTE.get(pred, pred)
    patient_info = payload.get("patient", {})
    tm = (patient_info.get("type_mesure") or "").strip().upper()
    val = float(patient_info.get("derniere_mesure") or 0.0)
    dev = float(patient_info.get("deviation_score") or 0.0)
    disease = patient_info.get("pathologie", "")
    factors = payload.get("top_facteurs_shap", [])

    if dev == 0.0:
        for f in factors:
            if f.get("feature") == "deviation_score":
                dev = float(f.get("valeur_reelle", 0.0))
                break

    diag = _diagnose_problem(tm, val, dev, disease)

    # 1. Synthese Titre
    if diag and diag.get("title"):
        title = diag["title"]
    else:
        title = f"Analyse {niveau} de vos constantes"

    # 2. Resume (Clear, natural French without robotic phrasing or double periods)
    if diag and dev != 0:
        name_lower = diag["name"].lower()
        prep = "d'" if name_lower and name_lower[0] in "aeiouyéèêàâ" else "de "
        resume = (
            f"Votre niveau d'alerte est {niveau} : votre {diag['label_low']} mesuré à {val:g} {diag['unit']} "
            f"indique une situation {prep}{name_lower} (+{abs(dev) * 100:.0f}% d'écart par rapport aux seuils cliniques de suivi). "
            f"{diag['consequence']}"
        )
    elif factors:
        cleaned_factors = [f["importance"].rstrip(".") for f in factors[:2]]
        resume = f"Votre niveau d'alerte est {niveau} principalement à cause de : " + " ; ".join(cleaned_factors) + "."
    else:
        resume = f"Votre niveau d'alerte est {niveau} ; vos constantes récentes restent dans vos seuils habituels."

    # 3. Triggers (Facteurs déclencheurs)
    facteurs = []
    if diag and diag.get("detail"):
        facteurs.append(diag["detail"])
    for f in factors:
        imp = f.get("importance", "").rstrip(".") + "."
        if diag and f.get("feature") in ("deviation_score", "valeur_mesure_proche"):
            continue
        if imp and imp not in facteurs:
            facteurs.append(imp)
    if not facteurs:
        facteurs = ["Aucun facteur aggravant majeur détecté sur les mesures récentes."]

    # 4. Immediate advice (Conseils immédiats)
    conseils = []
    if diag and diag.get("advice"):
        conseils.extend(diag["advice"])
    else:
        conseils = [
            "Continuez à relever vos constantes régulièrement aux horaires habituels.",
            "Notez vos symptômes éventuels pour les partager avec votre médecin.",
        ]

    if any(f.get("feature") == "trend_slope_14j" for f in factors):
        tip = "Recontrôlez votre mesure dans les prochaines heures pour confirmer la tendance."
        if tip not in conseils:
            conseils.insert(0, tip)
    if any(f.get("feature") == "nb_symptomes_recents_7j" for f in factors):
        tip = "Hydratez-vous et reposez-vous, puis réévaluez vos symptômes."
        if tip not in conseils:
            conseils.insert(0, tip)

    rassurant = (
        "Votre médecin référent a été notifié de cette analyse. "
        "En cas de signe inhabituel ou inquiétant, contactez immédiatement le cabinet ou le 190."
    )

    drivers = ", ".join(f"{f.get('feature')} ({f.get('impact_shap', 0.0):+.2f})" for f in factors) or "aucun facteur aggravant dominant"
    conclusion = (
        f"Alerte {niveau} (RF={pred}, confiance {payload['prediction']['confiance']:.2f}). "
        + (f"Observation : {diag['name']} ({val:g} {diag['unit']}, dev={dev:+.2f}). " if diag else "")
        + "Évaluation clinique recommandée."
    )

    return {
        "synthese_titre": title,
        "niveau_alerte": niveau,
        "explication_patient": {
            "resume": resume,
            "facteurs_declencheurs": facteurs,
            "conseils_immediats": conseils[:4],
            "message_rassurant": rassurant,
        },
        "synthese_clinique_medecin": {
            "conclusion": conclusion,
            "drivers_statistiques": f"RF={payload['prediction']['confiance']:.2f} {pred}. Drivers SHAP : {drivers}.",
        },
        "source": "local",
    }


def _gemini_translate(payload):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return None
    import urllib.request
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={key}"
    body = json.dumps({
        "system_instruction": {"parts": [{"text": AGENT_SYSTEM_PROMPT}]},
        "contents": [{"parts": [{"text": json.dumps(payload, ensure_ascii=False)}]}],
        "generationConfig": {"response_mime_type": "application/json"},
    }).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        out = json.loads(resp.read().decode("utf-8"))
    text = out["candidates"][0]["content"]["parts"][0]["text"]
    parsed = json.loads(text)
    parsed["source"] = "gemini"
    return parsed


def translate_agent(payload):
    try:
        result = _gemini_translate(payload)
        if result:
            return result
    except Exception as e:
        print("[MediSuivi AI] Gemini unavailable, using local translator:", e)
    return _local_translate(payload)


# ------------------------------------------------------------------
# Endpoint
# ------------------------------------------------------------------
@app.post("/predict", response_model=PredictionResponse)
def predict(patient: PatientFeatures):
    # Normalize sexe
    raw_sexe = (patient.sexe or "HOMME").strip().upper()
    if raw_sexe in ["M", "H", "MAN", "MALE"]:
        raw_sexe = "HOMME"
    elif raw_sexe in ["F", "W", "FEMALE", "WOMAN"]:
        raw_sexe = "FEMME"
    
    if raw_sexe not in _le_sexe.classes_:
        raw_sexe = "HOMME"
    sexe_enc = _le_sexe.transform([raw_sexe])[0]

    # Normalize disease
    raw_disease = (patient.disease or "DIABETE").strip().upper()
    if "DIAB" in raw_disease:
        raw_disease = "DIABETE"
    elif "HYPER" in raw_disease or "TENS" in raw_disease:
        raw_disease = "HYPERTENSION"
    elif "ASTH" in raw_disease:
        raw_disease = "ASTHME"
    elif "CARD" in raw_disease or "INSUFF" in raw_disease or "COEUR" in raw_disease:
        raw_disease = "INSUFFISANCE_CARDIAQUE"
    
    if raw_disease not in _le_disease.classes_:
        raw_disease = "DIABETE"
    disease_enc = _le_disease.transform([raw_disease])[0]

    row = {
        "age": patient.age,
        "sexe_enc": sexe_enc,
        "disease_enc": disease_enc,
        "jours_depuis_diagnostic": patient.jours_depuis_diagnostic,
        "valeur_mesure_proche": patient.valeur_mesure_proche,
        "deviation_score": patient.deviation_score,
        "rolling_mean_14j": patient.rolling_mean_14j,
        "rolling_std_14j": patient.rolling_std_14j,
        "trend_slope_14j": patient.trend_slope_14j,
        "nb_symptomes_recents_7j": patient.nb_symptomes_recents_7j,
    }

    X = np.array([[row[c] for c in _feature_cols]])
    X_scaled = _scaler.transform(X)

    pred = _model.predict(X_scaled)[0]
    proba = _model.predict_proba(X_scaled)[0]
    proba_dict = {cls: round(float(p), 4) for cls, p in zip(_model.classes_, proba)}

    cls_idx = list(_model.classes_).index(pred)
    sv = _explainer.shap_values(X_scaled)
    if isinstance(sv, list):
        contrib = np.asarray(sv[cls_idx])[0]
    else:
        contrib = np.asarray(sv)[0, :, cls_idx]

    contributions = {name: round(float(c), 4) for name, c in zip(_feature_cols, contrib)}
    tm = _normalize_measure_type(patient.type_mesure)
    mesure_label, mesure_unit = _measure_meta(tm)
    row["disease"] = raw_disease
    row["type_mesure"] = tm

    explanations = build_explanations(contrib, row, type_mesure=tm)
    top_factors = build_top_factors(contrib, row, type_mesure=tm)

    agent_payload = {
        "patient": {
            "age": patient.age,
            "sexe": raw_sexe,
            "pathologie": raw_disease,
            "derniere_mesure": patient.valeur_mesure_proche,
            "deviation_score": patient.deviation_score,
            "type_mesure": tm,
            "mesure_lisible": f"{mesure_label} ({mesure_unit})" if mesure_unit else mesure_label,
        },
        "prediction": {
            "gravite": pred,
            "confiance": proba_dict.get(pred, 0.0),
        },
        "top_facteurs_shap": top_factors,
    }
    agent = translate_agent(agent_payload)

    return PredictionResponse(
        gravite=pred,
        probabilities=proba_dict,
        explanations=explanations,
        contributions=contributions,
        top_facteurs_shap=top_factors,
        agent=agent,
    )


@app.get("/health")
def health():
    return {"status": "ok"}
