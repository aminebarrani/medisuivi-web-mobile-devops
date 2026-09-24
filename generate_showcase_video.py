#!/usr/bin/env python3
"""
MediSuivi - Feature & Interface Showcase Video Generator
Renders a 1080p 30fps MP4 video demonstrating all Web and Mobile interfaces,
microservices architecture, AI prediction engine, and clinical workflows.
"""

import os
import sys
import time
import glob
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio

WIDTH = 1920
HEIGHT = 1080
FPS = 30
HOLD_FRAMES = 85   # ~2.8 seconds hold per scene
FADE_FRAMES = 15   # 0.5 second crossfade

OUTPUT_VIDEO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "medisuivi_feature_showcase.mp4")

# Directories
FRONT_DIR = r"c:\Users\21699\Dropbox\PC\Desktop\medsuivifront\rapport-screenshots"
MOBILE_DIR = r"c:\Users\21699\Dropbox\PC\Desktop\medsuivi_patient_mobile\figures\mobile"

# Fonts
FONT_TITLE_HERO = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 52)
FONT_SUBTITLE_HERO = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 26)
FONT_SECTION = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 16)
FONT_HEADING = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 26)
FONT_TEXT = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 18)
FONT_TEXT_BOLD = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 18)
FONT_TAG = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 14)
FONT_URL = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 15)

def create_base_canvas():
    """Generates a modern deep slate gradient background with subtle glow."""
    base = Image.new("RGB", (WIDTH, HEIGHT), color=(11, 17, 32)) # Slate 950
    draw = ImageDraw.Draw(base)
    # Subtle gradient bands
    for y in range(HEIGHT):
        ratio = y / HEIGHT
        r = int(11 + ratio * 14)   # 11 -> 25
        g = int(17 + ratio * 20)   # 17 -> 37
        b = int(32 + ratio * 28)   # 32 -> 60
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))
    
    # Subtle grid accent lines
    for x in range(0, WIDTH, 160):
        draw.line([(x, 0), (x, HEIGHT)], fill=(25, 36, 60, 30))
    for y in range(0, HEIGHT, 160):
        draw.line([(0, y), (WIDTH, y)], fill=(25, 36, 60, 30))
    
    return base

def draw_top_bar(draw, chapter_title, service_tag):
    """Draws the top branding bar and section indicator."""
    # Top bar background panel
    draw.rectangle([(0, 0), (WIDTH, 70)], fill=(13, 20, 38))
    draw.line([(0, 70), (WIDTH, 70)], fill=(30, 41, 59), width=1)
    
    # MediSuivi Brand logo icon
    # Medical cross pill
    cx, cy = 45, 35
    draw.rounded_rectangle([(cx-18, cy-18), (cx+18, cy+18)], radius=6, fill=(16, 185, 129)) # Emerald
    draw.rectangle([(cx-4, cy-11), (cx+4, cy+11)], fill=(255, 255, 255))
    draw.rectangle([(cx-11, cy-4), (cx+11, cy-4)], fill=(255, 255, 255))
    
    # Brand text
    draw.text((75, 20), "MediSuivi", fill=(255, 255, 255), font=FONT_HEADING)
    draw.text((215, 26), "Plateforme de Télésurveillance Médicale", fill=(148, 163, 184), font=FONT_TEXT)
    
    # Chapter indicator badge (right side)
    pill_w = 340
    px = WIDTH - pill_w - 30
    draw.rounded_rectangle([(px, 18), (px + pill_w, 52)], radius=17, fill=(24, 37, 65), outline=(56, 189, 248), width=1)
    draw.text((px + 18, 25), chapter_title.upper(), fill=(56, 189, 248), font=FONT_SECTION)
    
    # Service Tag
    if service_tag:
        draw.rounded_rectangle([(px - 220, 20), (px - 20, 50)], radius=6, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
        draw.text((px - 205, 26), service_tag, fill=(52, 211, 153), font=FONT_TAG)

def draw_bottom_bar(draw, scene_index, total_scenes, title, desc):
    """Draws the bottom status card and playback timeline."""
    y0 = HEIGHT - 110
    draw.rectangle([(0, y0), (WIDTH, HEIGHT)], fill=(13, 20, 38))
    draw.line([(0, y0), (WIDTH, y0)], fill=(30, 41, 59), width=1)
    
    # Progress line on the top edge of footer
    progress = (scene_index + 1) / total_scenes
    draw.rectangle([(0, y0), (int(WIDTH * progress), y0 + 3)], fill=(56, 189, 248))
    
    # Scene index badge
    idx_str = f"{scene_index + 1:02d} / {total_scenes:02d}"
    draw.rounded_rectangle([(35, y0 + 25), (115, y0 + 65)], radius=6, fill=(30, 41, 59))
    draw.text((45, y0 + 33), idx_str, fill=(241, 245, 249), font=FONT_SECTION)
    
    # Feature title and details
    draw.text((135, y0 + 20), title, fill=(255, 255, 255), font=FONT_HEADING)
    draw.text((135, y0 + 58), desc, fill=(148, 163, 184), font=FONT_TEXT)

def render_web_scene(canvas, img_path, url, chapter, service, title, desc, scene_idx, total_scenes):
    """Renders a desktop web screenshot inside a sleek browser frame."""
    draw = ImageDraw.Draw(canvas)
    draw_top_bar(draw, chapter, service)
    draw_bottom_bar(draw, scene_idx, total_scenes, title, desc)
    
    # Browser window bounds
    bx = 90
    by = 95
    bw = WIDTH - 180  # 1740
    bh = HEIGHT - 230 # 850
    header_h = 42
    
    # Outer frame shadow & body
    draw.rounded_rectangle([(bx - 2, by - 2), (bx + bw + 2, by + bh + 2)], radius=12, fill=(30, 41, 59))
    draw.rounded_rectangle([(bx, by), (bx + bw, by + bh)], radius=10, fill=(15, 23, 42))
    
    # Window header bar
    draw.rounded_rectangle([(bx, by), (bx + bw, by + header_h)], radius=10, fill=(30, 41, 59))
    draw.rectangle([(bx, by + header_h - 10), (bx + bw, by + header_h)], fill=(30, 41, 59))
    
    # 3 traffic light buttons
    draw.ellipse([(bx + 18, by + 14), (bx + 30, by + 26)], fill=(239, 68, 68))
    draw.ellipse([(bx + 38, by + 14), (bx + 50, by + 26)], fill=(245, 158, 11))
    draw.ellipse([(bx + 58, by + 14), (bx + 70, by + 26)], fill=(16, 185, 129))
    
    # Address bar
    url_box_w = 640
    url_x = bx + (bw - url_box_w) // 2
    draw.rounded_rectangle([(url_x, by + 8), (url_x + url_box_w, by + 34)], radius=6, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
    draw.text((url_x + 15, by + 11), "🔒  " + url, fill=(148, 163, 184), font=FONT_URL)
    
    # Paste screenshot inside viewport
    if os.path.exists(img_path):
        sc_img = Image.open(img_path).convert("RGB")
        target_w = bw
        target_h = bh - header_h
        
        # Scale to fit nicely
        sc_w, sc_h = sc_img.size
        ratio = min(target_w / sc_w, target_h / sc_h)
        new_w = int(sc_w * ratio)
        new_h = int(sc_h * ratio)
        sc_resized = sc_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Center horizontally and vertically inside window
        paste_x = bx + (target_w - new_w) // 2
        paste_y = by + header_h + (target_h - new_h) // 2
        canvas.paste(sc_resized, (paste_x, paste_y))
    
    return canvas

def render_mobile_scene(canvas, img_path, chapter, service, title, desc, scene_idx, total_scenes, bullets):
    """Renders a vertical mobile screenshot inside a smartphone frame with side callouts."""
    draw = ImageDraw.Draw(canvas)
    draw_top_bar(draw, chapter, service)
    draw_bottom_bar(draw, scene_idx, total_scenes, title, desc)
    
    phone_h = 750
    phone_w = 365
    px = 320
    py = 110
    
    # Phone Body Bezel (Shadow & Dark Titanium chassis)
    draw.rounded_rectangle([(px - 8, py - 8), (px + phone_w + 8, py + phone_h + 8)], radius=40, fill=(30, 41, 59))
    draw.rounded_rectangle([(px, py), (px + phone_w, py + phone_h)], radius=34, fill=(10, 15, 26), outline=(71, 85, 105), width=2)
    
    # Dynamic Island / Camera Notch
    not_w = 90
    not_h = 22
    not_x = px + (phone_w - not_w) // 2
    draw.rounded_rectangle([(not_x, py + 12), (not_x + not_w, py + 12 + not_h)], radius=11, fill=(15, 23, 42))
    draw.ellipse([(not_x + 12, py + 17), (not_x + 22, py + 27)], fill=(2, 6, 23))
    
    # Paste mobile screen
    if os.path.exists(img_path):
        mob_img = Image.open(img_path).convert("RGB")
        target_w = phone_w - 20
        target_h = phone_h - 60
        
        mw, mh = mob_img.size
        ratio = min(target_w / mw, target_h / mh)
        new_w = int(mw * ratio)
        new_h = int(mh * ratio)
        mob_resized = mob_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        paste_x = px + (phone_w - new_w) // 2
        paste_y = py + 38 + (target_h - new_h) // 2
        canvas.paste(mob_resized, (paste_x, paste_y))
    
    # Right Side: Feature Information Cards
    card_x = 760
    card_w = 1050
    
    # Card 1: Overview
    draw.rounded_rectangle([(card_x, 150), (card_x + card_w, 350)], radius=14, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
    # Accent top border
    draw.rounded_rectangle([(card_x, 150), (card_x + card_w, 155)], radius=3, fill=(56, 189, 248))
    draw.text((card_x + 35, 175), "📱 EXPÉRIENCE PATIENT SUR MOBILE", fill=(56, 189, 248), font=FONT_SECTION)
    draw.text((card_x + 35, 205), title, fill=(255, 255, 255), font=FONT_HEADING)
    draw.text((card_x + 35, 250), desc, fill=(148, 163, 184), font=FONT_TEXT)
    draw.text((card_x + 35, 285), "Développé avec React Native & Expo • Communication avec le Gateway Spring Cloud", fill=(52, 211, 153), font=FONT_SECTION)
    
    # Card 2: Key Capabilities Checklist
    draw.rounded_rectangle([(card_x, 380), (card_x + card_w, 780)], radius=14, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
    draw.rounded_rectangle([(card_x, 380), (card_x + card_w, 385)], radius=3, fill=(16, 185, 129))
    draw.text((card_x + 35, 410), "✨ FONCTIONNALITÉS & IMPACT CLINIQUE", fill=(52, 211, 153), font=FONT_SECTION)
    
    cur_y = 460
    for bullet in bullets:
        # Checkmark bullet
        draw.ellipse([(card_x + 35, cur_y + 2), (card_x + 55, cur_y + 22)], fill=(16, 185, 129))
        draw.text((card_x + 41, cur_y + 2), "✓", fill=(255, 255, 255), font=FONT_TEXT_BOLD)
        draw.text((card_x + 75, cur_y), bullet[0], fill=(255, 255, 255), font=FONT_TEXT_BOLD)
        draw.text((card_x + 75, cur_y + 26), bullet[1], fill=(148, 163, 184), font=FONT_TEXT)
        cur_y += 75
    
    return canvas

def render_intro_card():
    """Renders the opening title card with modern typography and architecture overview."""
    canvas = create_base_canvas()
    draw = ImageDraw.Draw(canvas)
    
    # Center hero container
    cx = WIDTH // 2
    
    # Large Medical Cross Icon
    cy_icon = 180
    draw.rounded_rectangle([(cx - 45, cy_icon - 45), (cx + 45, cy_icon + 45)], radius=16, fill=(16, 185, 129))
    draw.rectangle([(cx - 10, cy_icon - 28), (cx + 10, cy_icon + 28)], fill=(255, 255, 255))
    draw.rectangle([(cx - 28, cy_icon - 10), (cx + 28, cy_icon - 10)], fill=(255, 255, 255))
    
    # Hero Title
    title = "MediSuivi"
    w_title = int(draw.textlength(title, font=FONT_TITLE_HERO))
    draw.text((cx - w_title // 2, 250), title, fill=(255, 255, 255), font=FONT_TITLE_HERO)
    
    # Subtitle
    sub = "Plateforme Intelligente de Télésurveillance des Maladies Chroniques"
    w_sub = int(draw.textlength(sub, font=FONT_HEADING))
    draw.text((cx - w_sub // 2, 330), sub, fill=(56, 189, 248), font=FONT_HEADING)
    
    desc = "Démonstration Complète des Fonctionnalités, Interfaces Web, Application Mobile et Moteur IA"
    w_desc = int(draw.textlength(desc, font=FONT_TEXT))
    draw.text((cx - w_desc // 2, 380), desc, fill=(148, 163, 184), font=FONT_TEXT)
    
    # 4 Architecture Pillars Cards
    pillars = [
        ("🔐 Microservices Backend", "Spring Boot 3.2.2\nEureka • Gateway • Config\nUser & Patient Services", (56, 189, 248)),
        ("🩺 Portail Web Clinique", "React 19 & TypeScript\nTableau de bord médecins\nSuivi & Triage des alertes", (52, 211, 153)),
        ("📱 Application Mobile", "React Native (Expo)\nSaisie des biomarqueurs\nAlertes & conseils santé", (168, 85, 247)),
        ("🧠 Intelligence Artificielle", "FastAPI & Scikit-Learn\nRandom Forest Classifier\nÉvaluation risque & repli", (251, 146, 60))
    ]
    
    pw = 370
    ph = 240
    start_x = (WIDTH - (4 * pw + 3 * 30)) // 2
    py = 460
    
    for i, (p_title, p_desc, p_color) in enumerate(pillars):
        x = start_x + i * (pw + 30)
        draw.rounded_rectangle([(x, py), (x + pw, py + ph)], radius=16, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
        draw.rounded_rectangle([(x, py), (x + pw, py + 5)], radius=3, fill=p_color)
        draw.text((x + 25, py + 30), p_title, fill=p_color, font=FONT_TEXT_BOLD)
        lines = p_desc.split("\n")
        ly = py + 80
        for l in lines:
            draw.text((x + 25, ly), l, fill=(203, 213, 225), font=FONT_TEXT)
            ly += 32
            
    # Bottom Ready Badge
    footer_text = "Présentation Vidéo Guidée • Démarrage de la Démonstration..."
    wf = int(draw.textlength(footer_text, font=FONT_SECTION))
    draw.text((cx - wf // 2, 800), footer_text, fill=(148, 163, 184), font=FONT_SECTION)
    
    return canvas

def render_outro_card():
    """Renders the closing summary and credits card."""
    canvas = create_base_canvas()
    draw = ImageDraw.Draw(canvas)
    cx = WIDTH // 2
    
    # Medical cross
    cy_icon = 220
    draw.rounded_rectangle([(cx - 40, cy_icon - 40), (cx + 40, cy_icon + 40)], radius=14, fill=(16, 185, 129))
    draw.rectangle([(cx - 9, cy_icon - 24), (cx + 9, cy_icon + 24)], fill=(255, 255, 255))
    draw.rectangle([(cx - 24, cy_icon - 9), (cx + 24, cy_icon - 9)], fill=(255, 255, 255))
    
    title = "MediSuivi — Synthèse du Projet"
    w_t = int(draw.textlength(title, font=FONT_TITLE_HERO))
    draw.text((cx - w_t // 2, 290), title, fill=(255, 255, 255), font=FONT_TITLE_HERO)
    
    sub = "Une solution de télésurveillance robuste, moderne et centrée sur la santé du patient"
    w_s = int(draw.textlength(sub, font=FONT_HEADING))
    draw.text((cx - w_s // 2, 370), sub, fill=(56, 189, 248), font=FONT_HEADING)
    
    # Summary Metrics Card
    mw = 1000
    mh = 320
    mx = cx - mw // 2
    my = 440
    draw.rounded_rectangle([(mx, my), (mx + mw, my + mh)], radius=16, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
    
    items = [
        ("Architecture Microservices", "5 Modules Spring Boot + Eureka Discovery + Spring Cloud Gateway"),
        ("Base de Données Relationnelle", "PostgreSQL avec partitionnement par microservice (Users, Patients, Mesures)"),
        ("Moteur Prédictif IA", "Modèle Random Forest entraîné, scoring synchrone & repli clinique automatique"),
        ("Double Interface Utilisateur", "Dashboard Web pour les médecins & Application Mobile native pour les patients"),
        ("Qualité & DevOps", "Pipeline Jenkins déclaratif, SonarQube, JaCoCo et conteneurisation Docker")
    ]
    
    iy = my + 30
    for label, val in items:
        draw.text((mx + 40, iy), "• " + label + " :", fill=(52, 211, 153), font=FONT_TEXT_BOLD)
        draw.text((mx + 330, iy), val, fill=(226, 232, 240), font=FONT_TEXT)
        iy += 54
        
    credit = "MediSuivi • Tous droits réservés • Architecture Microservices Spring Boot"
    wc = int(draw.textlength(credit, font=FONT_SECTION))
    draw.text((cx - wc // 2, 840), credit, fill=(148, 163, 184), font=FONT_SECTION)
    
    return canvas

def build_scenes():
    """Assembles all 23 scene definitions."""
    scenes = []
    
    # 0. Intro
    scenes.append({
        "type": "intro"
    })
    
    # 1. Login Web
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "01-login.png"),
        "url": "https://medisuivi.tn/login",
        "chapter": "Web • Authentification & Sécurité",
        "service": "user-service :8081 | gateway :8222",
        "title": "Connexion Sécurisée & Contrôle d'Accès (RBAC)",
        "desc": "Authentification JWT sans état, protection des routes, gestion des rôles Médecin, Patient et Administrateur."
    })
    
    # 2. Register Web
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "03-register-step1.png"),
        "url": "https://medisuivi.tn/register",
        "chapter": "Web • Inscription Praticien",
        "service": "user-service :8081",
        "title": "Inscription en Ligne & Affectation du Profil Médical",
        "desc": "Formulaire guidé pour l'enregistrement des médecins référents avec validation des identifiants professionnels."
    })
    
    # 3. Forgot Password
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "05-forgot-password.png"),
        "url": "https://medisuivi.tn/forgot-password",
        "chapter": "Web • Sécurité & Récupération",
        "service": "user-service :8081 | Spring Mail",
        "title": "Récupération de Compte par Code de Vérification",
        "desc": "Envoi automatisé de jeton temporaire par courrier électronique via SMTP (Mailtrap) pour réinitialisation du mot de passe."
    })
    
    # 4. Dashboard Overview
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "07-dashboard-overview.png"),
        "url": "https://medisuivi.tn/dashboard/overview",
        "chapter": "Web • Vue d'Ensemble Clinique",
        "service": "patient-service :8082 | gateway :8222",
        "title": "Tableau de Bord Global du Médecin",
        "desc": "Supervision centralisée : nombre de patients actifs, alertes en attente et dernières télémesures reçues en temps réel."
    })
    
    # 5. Patients List
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "08-dashboard-patients.png"),
        "url": "https://medisuivi.tn/dashboard/patients",
        "chapter": "Web • Gestion de la Cohorte",
        "service": "patient-service :8082",
        "title": "Gestion des Patients & Triage par Niveau de Risque",
        "desc": "Vue tabulaire complète avec recherche instantanée, filtrage par pathologie et badges de risque (Faible, Modéré, Élevé)."
    })
    
    # 6. Add Patient Modal
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "15-modal-add-patient.png"),
        "url": "https://medisuivi.tn/dashboard/patients?action=nouveau",
        "chapter": "Web • Enrôlement Patient",
        "service": "patient-service :8082",
        "title": "Création & Enrôlement d'un Nouveau Dossier Patient",
        "desc": "Saisie des données administratives, antécédents, genre, date de naissance et affectation au médecin traitant."
    })
    
    # 7. Pathologies Catalog
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "09-dashboard-pathologies.png"),
        "url": "https://medisuivi.tn/dashboard/pathologies",
        "chapter": "Web • Référentiel Pathologies",
        "service": "patient-service :8082",
        "title": "Catalogue des Maladies Chroniques & Seuils Médicaux",
        "desc": "Paramétrage des seuils physiologiques minimaux et maximaux (Diabète, Hypertension, Asthme, Insuffisance cardiaque)."
    })
    
    # 8. Assign Maladie Modal
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "16-modal-assign-maladie.png"),
        "url": "https://medisuivi.tn/dashboard/patients/affecter-pathologie",
        "chapter": "Web • Protocole Clinique",
        "service": "patient-service :8082",
        "title": "Affectation de Pathologie & Protocole de Traitement",
        "desc": "Association d'une maladie chronique au patient avec date de diagnostic, posologie prescrite et recommandations de suivi."
    })
    
    # 9. Suivi Telemonitoring Curves
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "10-dashboard-suivi.png"),
        "url": "https://medisuivi.tn/dashboard/suivi",
        "chapter": "Web • Télésurveillance Graphique",
        "service": "patient-service :8082 | Mesures Module",
        "title": "Courbes d'Évolution & Télémonitoring des Constantes",
        "desc": "Visualisation chronologique des mesures vitales : glycémie, tension artérielle, SpO2 et rythme cardiaque."
    })
    
    # 10. Add Mesure Modal
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "17-modal-add-mesure.png"),
        "url": "https://medisuivi.tn/dashboard/suivi?action=saisie-mesure",
        "chapter": "Web • Télémétrie Médicale",
        "service": "patient-service :8082",
        "title": "Enregistrement Manuel ou IoT de Biomarqueurs",
        "desc": "Ajout direct de constantes avec vérification instantanée des seuils et déclenchement automatique du recalcul de risque."
    })
    
    # 11. Add Symptome Modal
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "18-modal-add-symptome.png"),
        "url": "https://medisuivi.tn/dashboard/suivi?action=declarer-symptome",
        "chapter": "Web • Journal des Symptômes",
        "service": "patient-service :8082",
        "title": "Déclaration Clinique des Symptômes Patient",
        "desc": "Enregistrement horodaté des signes ressentis par le patient (vertiges, essoufflement, céphalées) pour enrichir le dossier."
    })
    
    # 12. Patient Fiche & Predict Trigger
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "13-patient-fiche-predict.png"),
        "url": "https://medisuivi.tn/dashboard/patients/fiche-predict",
        "chapter": "Web • Intelligence Artificielle",
        "service": "predict-api :8000 | FastAPI RestTemplate",
        "title": "Dossier Patient & Appel au Moteur Prédictif IA",
        "desc": "Extraction des caractéristiques cliniques (déviation, moyenne 14j, tendance) et soumission au modèle Random Forest."
    })
    
    # 13. Predict Result
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "14-predict-result.png"),
        "url": "https://medisuivi.tn/dashboard/predict-result",
        "chapter": "Web • Décision Médicale Assistée",
        "service": "predict-api :8000 | Scikit-Learn Model",
        "title": "Verdict de l'IA : Classification de Gravité & Probabilités",
        "desc": "Score de risque estimé (Faible, Modéré, Grave) avec probabilités associées et mise à jour automatique du statut patient."
    })
    
    # 14. Dashboard Alertes
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "11-dashboard-alertes.png"),
        "url": "https://medisuivi.tn/dashboard/alertes",
        "chapter": "Web • Triage des Alertes",
        "service": "patient-service :8082 | Alertes Module",
        "title": "Boîte de Réception des Alertes Médicales Urgentes",
        "desc": "Tri par ordre de criticité, affichage des dépassements de seuil et action rapide pour le praticien traitant."
    })
    
    # 15. Alertes Traitées
    scenes.append({
        "type": "web",
        "img": os.path.join(FRONT_DIR, "19-alertes-traitee.png"),
        "url": "https://medisuivi.tn/dashboard/alertes?traitee=true",
        "chapter": "Web • Traçabilité Médicale",
        "service": "patient-service :8082",
        "title": "Historique & Résolution des Alertes Traitées",
        "desc": "Archivage sécurisé des interventions médicales, confirmation de prise en charge et traçabilité médico-légale."
    })
    
    # 16. Mobile Login
    scenes.append({
        "type": "mobile",
        "img": os.path.join(MOBILE_DIR, "login.png"),
        "chapter": "Mobile • Application Patient",
        "service": "React Native (Expo) | user-service :8081",
        "title": "Connexion Sécurisée sur Smartphone",
        "desc": "Accès simple et rapide dédié au patient pour le suivi quotidien de sa santé à domicile.",
        "bullets": [
            ("Authentification Mobile JWT", "Stockage chiffré des jetons et reconnexion automatique sécurisée."),
            ("Accessibilité Optimisée", "Grandes zones de saisie, contraste élevé pour personnes âgées ou malades."),
            ("Protection des Données", "Chiffrement des communications de bout en bout via l'API Gateway.")
        ]
    })
    
    # 17. Mobile Dashboard
    scenes.append({
        "type": "mobile",
        "img": os.path.join(MOBILE_DIR, "dashboard.png"),
        "chapter": "Mobile • Accueil du Patient",
        "service": "React Native (Expo) | patient-service :8082",
        "title": "Tableau de Bord Personnel & Constantes du Jour",
        "desc": "Synthèse visuelle de l'état de santé, dernières mesures enregistrées et rappels de prise de constantes.",
        "bullets": [
            ("Vue Directe des Constantes", "Affichage clair de la dernière glycémie, tension et fréquence cardiaque."),
            ("Statut de Santé du Jour", "Indicateur coloré du niveau de stabilité de la pathologie chronique."),
            ("Raccourci de Saisie Rapide", "Bouton d'action directe pour saisir immédiatement une nouvelle mesure.")
        ]
    })
    
    # 18. Mobile Add Measure
    scenes.append({
        "type": "mobile",
        "img": os.path.join(MOBILE_DIR, "add_measure.png"),
        "chapter": "Mobile • Télémétrie Patient",
        "service": "React Native (Expo) | Mesures Module",
        "title": "Saisie Rapide & Intuitive des Télémesures",
        "desc": "Enregistrement facile des valeurs de glycémie, tension, SpO2 ou poids avec unités automatiques.",
        "bullets": [
            ("Validation Instantanée", "Contrôle des plages de valeurs et confirmation visuelle immédiate."),
            ("Synchronisation Cloud", "Transmission temps réel vers la base PostgreSQL des mesures."),
            ("Détection Immédiate", "Déclenchement automatique d'un recalcul de risque dès l'enregistrement.")
        ]
    })
    
    # 19. Mobile History
    scenes.append({
        "type": "mobile",
        "img": os.path.join(MOBILE_DIR, "history.png"),
        "chapter": "Mobile • Évolution Chronologique",
        "service": "React Native (Expo) | patient-service :8082",
        "title": "Historique & Graphiques d'Évolution",
        "desc": "Graphiques dynamiques illustrant les tendances des constantes vitales sur la semaine et le mois.",
        "bullets": [
            ("Graphiques Interactifs", "Visualisation des variations par rapport aux objectifs fixés par le médecin."),
            ("Cahier de Télésurveillance", "Historique complet consultable à tout moment lors des consultations."),
            ("Export & Partage", "Données structurées prêtes pour l'évaluation médicale.")
        ]
    })
    
    # 20. Mobile Alerts
    scenes.append({
        "type": "mobile",
        "img": os.path.join(MOBILE_DIR, "alert.png"),
        "chapter": "Mobile • Notifications & Conseils",
        "service": "React Native (Expo) | Alertes Module",
        "title": "Alertes de Santé & Conseils Personnalisés",
        "desc": "Notifications intelligentes envoyées au patient lorsque des anomalies physiologiques sont détectées.",
        "bullets": [
            ("Alertes Contextuelles", "Messages explicatifs sur les gestes à adopter (repos, hydratation, prise de médicament)."),
            ("Lien avec l'Équipe Soignante", "Notification synchronisée avec le tableau de bord du médecin référent."),
            ("Consignes d'Urgence", "Instructions claires pour contacter le médecin ou les services d'urgence.")
        ]
    })
    
    # 21. Mobile Profile
    scenes.append({
        "type": "mobile",
        "img": os.path.join(MOBILE_DIR, "profile.png"),
        "chapter": "Mobile • Profil Médical",
        "service": "React Native (Expo) | user-service :8081",
        "title": "Profil Médical, Médecin Référent & Paramètres",
        "desc": "Fiche personnelle du patient, coordonnées du soignant responsable et contacts d'urgence.",
        "bullets": [
            ("Coordonnées du Médecin", "Accès en un clic au numéro et email du praticien en charge."),
            ("Contact d'Urgence", "Numéro d'un proche prévenu automatiquement en cas de crise."),
            ("Gestion du Compte", "Modification des préférences et déconnexion sécurisée.")
        ]
    })
    
    # 22. Outro
    scenes.append({
        "type": "outro"
    })
    
    return scenes

def main():
    print(f"[*] Starting MediSuivi Showcase Video Generator...")
    scenes = build_scenes()
    total_scenes = len(scenes)
    print(f"[*] Total scenes assembled: {total_scenes}")
    
    # Pre-render static frames for all scenes
    print("[*] Pre-rendering scene canvas frames...")
    rendered_frames = []
    
    for i, sc in enumerate(scenes):
        sc_type = sc["type"]
        canvas = create_base_canvas()
        
        if sc_type == "intro":
            frame = render_intro_card()
        elif sc_type == "outro":
            frame = render_outro_card()
        elif sc_type == "web":
            frame = render_web_scene(
                canvas,
                sc["img"],
                sc["url"],
                sc["chapter"],
                sc["service"],
                sc["title"],
                sc["desc"],
                i,
                total_scenes
            )
        elif sc_type == "mobile":
            frame = render_mobile_scene(
                canvas,
                sc["img"],
                sc["chapter"],
                sc["service"],
                sc["title"],
                sc["desc"],
                i,
                total_scenes,
                sc["bullets"]
            )
            
        rendered_frames.append(np.array(frame, dtype=np.uint8))
        print(f"    [+] Scene {i+1:02d}/{total_scenes:02d} rendered ({sc_type})")
        
    # Write MP4 Video
    print(f"[*] Compiling MP4 video to: {OUTPUT_VIDEO}")
    t0 = time.time()
    
    # macro_block_size=None preserves exact 1920x1080 without unwanted resizing
    writer = imageio.get_writer(
        OUTPUT_VIDEO,
        fps=FPS,
        codec="libx264",
        quality=8,
        macro_block_size=None,
        ffmpeg_params=["-pix_fmt", "yuv420p", "-movflags", "+faststart"]
    )
    
    total_video_frames = 0
    
    for i in range(total_scenes):
        current_frame = rendered_frames[i]
        
        # 1. Hold static scene
        for _ in range(HOLD_FRAMES):
            writer.append_data(current_frame)
            total_video_frames += 1
            
        # 2. Crossfade to next scene (if not the last scene)
        if i < total_scenes - 1:
            next_frame = rendered_frames[i + 1]
            for f in range(FADE_FRAMES):
                alpha = (f + 1) / (FADE_FRAMES + 1)
                blended = (current_frame * (1.0 - alpha) + next_frame * alpha).astype(np.uint8)
                writer.append_data(blended)
                total_video_frames += 1
                
    writer.close()
    elapsed = round(time.time() - t0, 2)
    filesize_mb = round(os.path.getsize(OUTPUT_VIDEO) / (1024 * 1024), 2)
    duration_s = round(total_video_frames / FPS, 1)
    
    print("\n" + "="*60)
    print(" MediSuivi Video Generation Completed Successfully!")
    print(f" Output Video : {OUTPUT_VIDEO}")
    print(f" Resolution   : {WIDTH}x{HEIGHT} (1080p Full HD @ {FPS} fps)")
    print(f" Duration     : {duration_s} seconds ({int(duration_s//60)}m {int(duration_s%60)}s)")
    print(f" Total Frames : {total_video_frames} frames")
    print(f" File Size    : {filesize_mb} MB")
    print(f" Render Time  : {elapsed} seconds")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
