import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch
import os
import shutil

plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']
plt.rcParams['font.family'] = 'sans-serif'

# ==============================================================================
# FIGURE 9.4: ARCHITECTURE DEVOPS (Clean Layout, No Overlaps)
# ==============================================================================
def create_arch_devops(primary_path):
    fig, ax = plt.subplots(figsize=(17, 10.5), dpi=220)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')

    # Main Title
    ax.text(50, 97.2, "ARCHITECTURE DEVOPS & CHAÎNE CI/CD — MEDISUIVI", 
            fontsize=17, fontweight='bold', ha='center', va='center', color='#0f172a')
    ax.text(50, 94.2, "Figure 9.4 – Architecture DevOps globale : intégration continue, analyse qualité et déploiement", 
            fontsize=10.5, style='italic', ha='center', va='center', color='#475569')

    # Helper: Zone container
    def draw_zone(x, y, w, h, title, border_c, bg_c='#f8fafc'):
        box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5,rounding_size=1.2",
                             fc=bg_c, ec=border_c, lw=1.5, linestyle='--', zorder=1)
        ax.add_patch(box)
        tag_w = len(title) * 0.95 + 4
        tag = FancyBboxPatch((x + 1.2, y + h - 2.8), tag_w, 2.5,
                             boxstyle="round,pad=0.2,rounding_size=0.5",
                             fc=border_c, ec='none', zorder=2)
        ax.add_patch(tag)
        ax.text(x + 2.2, y + h - 1.5, title, fontsize=9.0, fontweight='bold',
                ha='left', va='center', color='#ffffff', zorder=3)

    # Helper: Arrow
    def draw_arrow(x1, y1, x2, y2, label=None, color='#334155', lw=1.6, rad=0, l_off=(0, 1.2)):
        conn = f"arc3,rad={rad}" if rad != 0 else "arc3,rad=0"
        arrow = patches.FancyArrowPatch((x1, y1), (x2, y2),
                                        arrowstyle='-|>,head_length=5,head_width=3.5',
                                        connectionstyle=conn, color=color, lw=lw, zorder=7)
        ax.add_patch(arrow)
        if label:
            mx = (x1 + x2) / 2 + l_off[0]
            my = (y1 + y2) / 2 + l_off[1]
            ax.text(mx, my, label, fontsize=8.0, fontweight='bold',
                    ha='center', va='center', color=color,
                    bbox=dict(boxstyle="round,pad=0.25", fc='#ffffff', ec=color, lw=1.0, alpha=0.98),
                    zorder=8)

    # -------------------------------------------------------------
    # ZONE 1: SCM & GESTION DE VERSIONS (x=2, y=5, w=20, h=86)
    # -------------------------------------------------------------
    draw_zone(2, 5, 20, 86, "ZONE 1 : SCM & SOURCES", '#334155')

    # Card: Local Dev
    b1 = FancyBboxPatch((3.5, 66), 17, 20, boxstyle="round,pad=0.4,rounding_size=0.8",
                        fc='#ffffff', ec='#0284c7', lw=1.6, zorder=3)
    ax.add_patch(b1)
    ax.text(4.5, 83.5, "Poste Développeur", fontsize=10, fontweight='bold', color='#0f172a', zorder=4)
    # Tag
    p1 = FancyBboxPatch((16.0, 82.5), 3.8, 2.0, boxstyle="round,pad=0.1,rounding_size=0.4", fc='#0284c7', ec='none', zorder=4)
    ax.add_patch(p1)
    ax.text(17.9, 83.5, "DEV", fontsize=7.2, fontweight='bold', color='white', ha='center', zorder=5)
    ax.text(4.5, 81.5, "Environnement Local", fontsize=8.0, style='italic', color='#64748b', zorder=4)
    dev_items = ["IntelliJ IDEA & VS Code", "Développement modulaire", "Tests unitaires locaux", "Commandes Git (commit/push)"]
    for i, it in enumerate(dev_items):
        ax.text(4.5, 78.5 - i*3.2, f"• {it}", fontsize=8.2, color='#334155', zorder=4)

    # Card: GitHub
    b2 = FancyBboxPatch((3.5, 38), 17, 24, boxstyle="round,pad=0.4,rounding_size=0.8",
                        fc='#ffffff', ec='#24292f', lw=1.6, zorder=3)
    ax.add_patch(b2)
    ax.text(4.5, 59.5, "Dépôt GitHub", fontsize=10, fontweight='bold', color='#0f172a', zorder=4)
    p2 = FancyBboxPatch((15.2, 58.5), 4.6, 2.0, boxstyle="round,pad=0.1,rounding_size=0.4", fc='#24292f', ec='none', zorder=4)
    ax.add_patch(p2)
    ax.text(17.5, 59.5, "GITHUB", fontsize=7.0, fontweight='bold', color='white', ha='center', zorder=5)
    ax.text(4.5, 57.5, "medisuivi-web-devops", fontsize=8.0, style='italic', color='#64748b', zorder=4)
    gh_items = ["Branches : backend, mobile, web", "Revue de code & PRs", "Webhook HTTP POST activé", "Déclenchement instantané CI"]
    for i, it in enumerate(gh_items):
        ax.text(4.5, 54.5 - i*3.4, f"• {it}", fontsize=8.2, color='#334155', zorder=4)

    # Card: Modules
    b3 = FancyBboxPatch((3.5, 8), 17, 26, boxstyle="round,pad=0.4,rounding_size=0.8",
                        fc='#f8fafc', ec='#475569', lw=1.6, zorder=3)
    ax.add_patch(b3)
    ax.text(4.5, 31.5, "Composants Source", fontsize=10, fontweight='bold', color='#0f172a', zorder=4)
    p3 = FancyBboxPatch((14.2, 30.5), 5.6, 2.0, boxstyle="round,pad=0.1,rounding_size=0.4", fc='#475569', ec='none', zorder=4)
    ax.add_patch(p3)
    ax.text(17.0, 31.5, "SOURCES", fontsize=6.8, fontweight='bold', color='white', ha='center', zorder=5)
    ax.text(4.5, 29.5, "Microservices & Clients", fontsize=8.0, style='italic', color='#64748b', zorder=4)
    src_items = ["patient-service & user-service", "gateway, discovery, config", "medisuivi_predict_api (IA)", "medsuivifront (React 18)", "medsuivi_patient_mobile (Expo)"]
    for i, it in enumerate(src_items):
        ax.text(4.5, 26.5 - i*3.2, f"• {it}", fontsize=8.0, color='#334155', zorder=4)

    # -------------------------------------------------------------
    # ZONE 2: INTEGRATION CONTINUE (x=24, y=5, w=48, h=86)
    # -------------------------------------------------------------
    draw_zone(24, 5, 48, 86, "ZONE 2 : INTÉGRATION CONTINUE (CI)", '#0284c7')

    # Jenkins Banner
    jb = FancyBboxPatch((25.5, 75.5), 45, 12, boxstyle="round,pad=0.4,rounding_size=0.8",
                        fc='#eff6ff', ec='#2563eb', lw=1.8, zorder=3)
    ax.add_patch(jb)
    ax.text(48, 84.5, "SERVEUR D'INTÉGRATION CONTINUE — JENKINS", fontsize=11.5,
            fontweight='bold', ha='center', va='center', color='#1e3a8a', zorder=4)
    ax.text(48, 81.8, "Pipelines déclaratifs multi-branches • Déclenchement automatique par Webhook",
            fontsize=8.8, style='italic', ha='center', va='center', color='#2563eb', zorder=4)
    ax.text(48, 78.8, "Compilation • Tests unitaires • Couverture • SonarQube • Builds Docker parallèles",
            fontsize=8.2, ha='center', va='center', color='#1e293b', zorder=4)

    # 3 Pipelines (Clean column cards)
    # Pipe 1: Backend
    pb1 = FancyBboxPatch((25.5, 39), 14.3, 33, boxstyle="round,pad=0.4,rounding_size=0.8",
                         fc='#f0fdfa', ec='#0d9488', lw=1.6, zorder=3)
    ax.add_patch(pb1)
    ax.text(26.5, 69.5, "Pipeline Backend", fontsize=9.2, fontweight='bold', color='#0f172a', zorder=4)
    tp1 = FancyBboxPatch((35.2, 68.6), 4.2, 1.8, boxstyle="round,pad=0.1,rounding_size=0.4", fc='#0d9488', ec='none', zorder=4)
    ax.add_patch(tp1)
    ax.text(37.3, 69.5, "JAVA 17", fontsize=6.8, fontweight='bold', color='white', ha='center', zorder=5)
    ax.text(26.5, 67.5, "Spring Boot 3 / Maven", fontsize=7.8, style='italic', color='#0f766e', zorder=4)
    p1_steps = ["1. Git Checkout", "2. Clean Compile (mvn)", "3. JUnit 5 & Mockito", "4. SonarQube Scanner", "5. Maven package JAR", "6. Docker Build & Push"]
    for i, st in enumerate(p1_steps):
        ax.text(26.5, 64.0 - i*3.8, f"• {st}", fontsize=8.0, color='#1e293b', zorder=4)

    # Pipe 2: Mobile
    pb2 = FancyBboxPatch((40.85, 39), 14.3, 33, boxstyle="round,pad=0.4,rounding_size=0.8",
                         fc='#eef2ff', ec='#6366f1', lw=1.6, zorder=3)
    ax.add_patch(pb2)
    ax.text(41.85, 69.5, "Pipeline Mobile", fontsize=9.2, fontweight='bold', color='#0f172a', zorder=4)
    tp2 = FancyBboxPatch((50.8, 68.6), 3.8, 1.8, boxstyle="round,pad=0.1,rounding_size=0.4", fc='#6366f1', ec='none', zorder=4)
    ax.add_patch(tp2)
    ax.text(52.7, 69.5, "REACT", fontsize=6.8, fontweight='bold', color='white', ha='center', zorder=5)
    ax.text(41.85, 67.5, "React Native / Expo", fontsize=7.8, style='italic', color='#4338ca', zorder=4)
    p2_steps = ["1. Git Checkout", "2. npm ci (clean install)", "3. TypeCheck (tsc)", "4. Jest tests & coverage", "5. SonarQube Scanner", "6. Artefacts Expo / Web"]
    for i, st in enumerate(p2_steps):
        ax.text(41.85, 64.0 - i*3.8, f"• {st}", fontsize=8.0, color='#1e293b', zorder=4)

    # Pipe 3: IA
    pb3 = FancyBboxPatch((56.2, 39), 14.3, 33, boxstyle="round,pad=0.4,rounding_size=0.8",
                         fc='#fffbeb', ec='#d97706', lw=1.6, zorder=3)
    ax.add_patch(pb3)
    ax.text(57.2, 69.5, "Pipeline IA", fontsize=9.2, fontweight='bold', color='#0f172a', zorder=4)
    tp3 = FancyBboxPatch((64.8, 68.6), 5.1, 1.8, boxstyle="round,pad=0.1,rounding_size=0.4", fc='#d97706', ec='none', zorder=4)
    ax.add_patch(tp3)
    ax.text(67.35, 69.5, "PYTHON", fontsize=6.8, fontweight='bold', color='white', ha='center', zorder=5)
    ax.text(57.2, 67.5, "FastAPI / Random Forest", fontsize=7.8, style='italic', color='#b45309', zorder=4)
    p3_steps = ["1. Git Checkout", "2. Install requirements", "3. Pytest (test_app)", "4. pytest-cov (Coverage)", "5. SonarQube Scanner", "6. Docker Build & Push"]
    for i, st in enumerate(p3_steps):
        ax.text(57.2, 64.0 - i*3.8, f"• {st}", fontsize=8.0, color='#1e293b', zorder=4)

    # SonarQube Box
    sb = FancyBboxPatch((25.5, 8), 45, 26, boxstyle="round,pad=0.4,rounding_size=0.8",
                        fc='#ffffff', ec='#0284c7', lw=1.8, zorder=3)
    ax.add_patch(sb)
    ax.text(27, 30.5, "Serveur Qualité Logicielle — SonarQube", fontsize=10.5, fontweight='bold', color='#0f172a', zorder=4)
    stp = FancyBboxPatch((63.5, 29.5), 5.8, 2.0, boxstyle="round,pad=0.1,rounding_size=0.4", fc='#0284c7', ec='none', zorder=4)
    ax.add_patch(stp)
    ax.text(66.4, 30.5, "QUALITÉ", fontsize=7.0, fontweight='bold', color='white', ha='center', zorder=5)
    ax.text(27, 28.5, "Inspection Continue & Contrôle du Quality Gate", fontsize=8.2, style='italic', color='#0284c7', zorder=4)
    sonar_items = [
        "Analyse statique approfondie : détection des Bugs, Vulnérabilités et Code Smells",
        "Consolidation de la couverture : Jacoco (Java), LCOV (TS/JS), pytest-cov (Python)",
        "Validation stricte du Quality Gate : arrêt et blocage immédiat de la pipeline si KO",
        "Rapports détaillés d'audit de maintenabilité et feedback qualité instantané pour chaque commit"
    ]
    for i, it in enumerate(sonar_items):
        ax.text(27, 24.5 - i*4.2, f"• {it}", fontsize=8.2, color='#334155', zorder=4)

    # -------------------------------------------------------------
    # ZONE 3: REGISTRE DOCKER HUB (x=74, y=51, w=24, h=40)
    # -------------------------------------------------------------
    draw_zone(74, 51, 24, 40, "ZONE 3 : REGISTRE D'IMAGES", '#0d9488')

    rb = FancyBboxPatch((75.5, 53), 21, 34, boxstyle="round,pad=0.4,rounding_size=0.8",
                        fc='#ffffff', ec='#0d9488', lw=1.6, zorder=3)
    ax.add_patch(rb)
    ax.text(76.5, 84.0, "Docker Hub Registry", fontsize=10, fontweight='bold', color='#0f172a', zorder=4)
    rtp = FancyBboxPatch((90.0, 83.0), 5.6, 2.0, boxstyle="round,pad=0.1,rounding_size=0.4", fc='#0d9488', ec='none', zorder=4)
    ax.add_patch(rtp)
    ax.text(92.8, 84.0, "DOCKER", fontsize=7.0, fontweight='bold', color='white', ha='center', zorder=5)
    ax.text(76.5, 82.0, "Dépôt : aminbrrn/medisuivi-*", fontsize=8.0, style='italic', color='#0f766e', zorder=4)
    reg_items = [
        "aminbrrn/medisuivi-gateway",
        "aminbrrn/medisuivi-discovery",
        "aminbrrn/medisuivi-config-server",
        "aminbrrn/medisuivi-patient-service",
        "aminbrrn/medisuivi-user-service",
        "aminbrrn/medisuivi-predict-api",
        "Versionnées avec tag :latest"
    ]
    for i, it in enumerate(reg_items):
        ax.text(76.5, 78.0 - i*3.5, f"• {it}", fontsize=8.0, color='#334155', zorder=4)

    # -------------------------------------------------------------
    # ZONE 4: RUNTIME & PRODUCTION (x=74, y=5, w=24, h=43)
    # -------------------------------------------------------------
    draw_zone(74, 5, 24, 43, "ZONE 4 : PRODUCTION / RUNTIME", '#7c3aed')

    cb = FancyBboxPatch((75.5, 7), 21, 37, boxstyle="round,pad=0.4,rounding_size=0.8",
                        fc='#ffffff', ec='#7c3aed', lw=1.6, zorder=3)
    ax.add_patch(cb)
    ax.text(76.5, 41.0, "Cluster Applicatif", fontsize=10, fontweight='bold', color='#0f172a', zorder=4)
    ctp = FancyBboxPatch((89.5, 40.0), 6.1, 2.0, boxstyle="round,pad=0.1,rounding_size=0.4", fc='#7c3aed', ec='none', zorder=4)
    ax.add_patch(ctp)
    ax.text(92.55, 41.0, "RUNTIME", fontsize=7.0, fontweight='bold', color='white', ha='center', zorder=5)
    ax.text(76.5, 39.0, "Orchestration Docker Compose", fontsize=8.0, style='italic', color='#6d28d9', zorder=4)
    run_items = [
        "Spring Cloud Gateway (8080)",
        "Eureka Discovery Service (8761)",
        "Microservices Métier (8081, 8082)",
        "Predict API FastAPI (port 8000)",
        "Base de données MySQL (3306)",
        "Keycloak IAM (OAuth2 / JWT)",
        "Portail Web (Nginx) & App Mobile"
    ]
    for i, it in enumerate(run_items):
        ax.text(76.5, 35.5 - i*3.6, f"• {it}", fontsize=8.0, color='#334155', zorder=4)

    # -------------------------------------------------------------
    # FLOW ARROWS (Clean paths, zero collisions)
    # -------------------------------------------------------------
    # Dev to GitHub
    draw_arrow(12.0, 66, 12.0, 62, "git push", color='#0284c7', l_off=(2.5, 0))
    # GitHub to Jenkins (Clean straight-right then up, or smooth arc outside)
    draw_arrow(20.5, 50, 25.5, 79, "Webhook Push", color='#2563eb', rad=-0.08, l_off=(1.8, 1.5))
    # Jenkins to Pipelines
    draw_arrow(32.6, 75.5, 32.6, 72.0, color='#0d9488')
    draw_arrow(48.0, 75.5, 48.0, 72.0, color='#6366f1')
    draw_arrow(63.3, 75.5, 63.3, 72.0, color='#d97706')

    # Pipelines to SonarQube
    draw_arrow(32.6, 39, 32.6, 34, "Jacoco", color='#0d9488', l_off=(0, -1.0))
    draw_arrow(48.0, 39, 48.0, 34, "LCOV", color='#6366f1', l_off=(0, -1.0))
    draw_arrow(63.3, 39, 63.3, 34, "pytest-cov", color='#d97706', l_off=(0, -1.0))

    # Pipelines to Docker Hub
    draw_arrow(70.5, 60, 75.5, 65, "docker push", color='#0d9488', lw=1.8, l_off=(-1.0, 1.6))
    # Docker Hub to Runtime
    draw_arrow(86.0, 53, 86.0, 44, "docker pull & run", color='#7c3aed', lw=1.8, l_off=(3.8, 0))

    plt.tight_layout()
    fig.savefig(primary_path, format='png', dpi=220, bbox_inches='tight')
    plt.close(fig)
    print("Fig 9.4 saved cleanly.")


# ==============================================================================
# FIGURE 9.5: LES ÉTAPES DU CYCLE DEVOPS (Clean Layout, No Overlaps)
# ==============================================================================
def create_etapes_devops(primary_path):
    fig, ax = plt.subplots(figsize=(17, 11), dpi=220)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')

    # Header
    ax.text(50, 97.2, "LES ÉTAPES DU CYCLE DEVOPS — MEDISUIVI", 
            fontsize=17, fontweight='bold', ha='center', va='center', color='#0f172a')
    ax.text(50, 94.2, "Figure 9.5 – Démarche DevOps intégrée : cycle continu de développement, test, déploiement et surveillance", 
            fontsize=10.5, style='italic', ha='center', va='center', color='#475569')

    # Top & Bottom Phase Labels
    # Top Phase (Steps 1 to 4)
    dev_banner = FancyBboxPatch((2.5, 90.0), 95.0, 2.8, boxstyle="round,pad=0.2,rounding_size=0.5",
                               fc='#eff6ff', ec='#2563eb', lw=1.2, zorder=2)
    ax.add_patch(dev_banner)
    ax.text(50, 91.4, "PHASE DÉVELOPPEMENT (CI) : PLANIFICATION  ➔  DÉVELOPPEMENT  ➔  COMPILATION  ➔  TESTS", 
            fontsize=8.8, fontweight='bold', ha='center', va='center', color='#1d4ed8', zorder=3)

    # Bottom Phase (Steps 5 to 8)
    ops_banner = FancyBboxPatch((2.5, 45.0), 95.0, 2.8, boxstyle="round,pad=0.2,rounding_size=0.5",
                               fc='#fdf2f8', ec='#db2777', lw=1.2, zorder=2)
    ax.add_patch(ops_banner)
    ax.text(50, 46.4, "PHASE OPÉRATIONS (CD) : QUALITÉ & RELEASE  ➔  CONTENEURISATION  ➔  EXPLOITATION  ➔  SURVEILLANCE", 
            fontsize=8.8, fontweight='bold', ha='center', va='center', color='#be185d', zorder=3)

    steps = [
        {
            "num": "1", "phase": "PLAN", "title": "Planification & Backlog",
            "badge_color": "#0284c7", "bg_color": "#f0f9ff",
            "desc": "Cadrage Agile Scrum des sprints (S1 à S6), recueil des exigences médicales, rédaction des User Stories (US1 à US15), modélisation UML des cas d'utilisation et des flux.",
            "tools": "Jira, Trello, Confluence, Backlog Scrum",
            "pos": (2.5, 52, 22, 36)
        },
        {
            "num": "2", "phase": "CODE", "title": "Développement & Versioning",
            "badge_color": "#2563eb", "bg_color": "#eff6ff",
            "desc": "Implémentation microservices Spring Boot 3 (Java 17), portail Web React 18, application mobile React Native (Expo), et API IA FastAPI. Gestion de versions sous Git.",
            "tools": "Git, GitHub, IntelliJ, VS Code, Git CLI",
            "pos": (27.0, 52, 22, 36)
        },
        {
            "num": "3", "phase": "BUILD", "title": "Compilation & Packaging",
            "badge_color": "#0d9488", "bg_color": "#f0fdfa",
            "desc": "Compilation Maven multi-modules des services backend, packaging des JARs, installation des dépendances Node.js (npm ci), typechecking TypeScript et compilation IA.",
            "tools": "Maven (mvn), npm, tsc, pip, Docker build",
            "pos": (51.5, 52, 22, 36)
        },
        {
            "num": "4", "phase": "TEST", "title": "Tests Automatisés",
            "badge_color": "#059669", "bg_color": "#ecfdf5",
            "desc": "Exécution automatisée de la suite de tests à chaque commit : tests unitaires et intégration JUnit 5/Mockito, tests frontend Vitest, Jest mobile, et Pytest pour l'API IA.",
            "tools": "JUnit 5, Mockito, Jest, Vitest, Pytest",
            "pos": (76.0, 52, 22, 36)
        },
        {
            "num": "5", "phase": "RELEASE", "title": "Inspection Qualité (CI)",
            "badge_color": "#d97706", "bg_color": "#fffbeb",
            "desc": "Analyse statique continue avec SonarQube : détection des vulnérabilités, duplication de code, audit de sécurité et couverture de tests. Validation stricte du Quality Gate.",
            "tools": "Jenkins Pipeline, SonarQube, Jacoco, LCOV",
            "pos": (76.0, 7, 22, 36)
        },
        {
            "num": "6", "phase": "DEPLOY", "title": "Conteneurisation & Registry",
            "badge_color": "#ea580c", "bg_color": "#fff7ed",
            "desc": "Création d'images Docker optimisées multi-stage pour chaque composant, publication sur le registre distant Docker Hub (aminbrrn/medisuivi-*) et orchestration Compose.",
            "tools": "Docker, Dockerfile, Docker Hub, Compose",
            "pos": (51.5, 7, 22, 36)
        },
        {
            "num": "7", "phase": "OPERATE", "title": "Exploitation & Services",
            "badge_color": "#7c3aed", "bg_color": "#faf5ff",
            "desc": "Exécution et haute disponibilité : routage Spring Cloud Gateway, découverte Eureka, sécurisation des flux OAuth2/JWT via Keycloak IAM, et persistance MySQL.",
            "tools": "Spring Cloud Gateway, Eureka, Keycloak, MySQL",
            "pos": (27.0, 7, 22, 36)
        },
        {
            "num": "8", "phase": "MONITOR", "title": "Surveillance & Feedback",
            "badge_color": "#4338ca", "bg_color": "#eef2ff",
            "desc": "Supervision en direct de la santé des microservices via Spring Boot Actuator (/actuator/health), sonde FastAPI (/health), analyse des logs et boucle d'amélioration continue.",
            "tools": "Actuator, Health Probes, Docker Logs, Alerting",
            "pos": (2.5, 7, 22, 36)
        },
    ]

    for s in steps:
        x, y, w, h = s["pos"]
        bc = s["badge_color"]
        
        card = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.4,rounding_size=0.9",
                              fc=s["bg_color"], ec=bc, lw=1.8, zorder=2)
        ax.add_patch(card)

        # Number badge
        nb = FancyBboxPatch((x + 1.2, y + h - 3.8), 3.2, 2.8, boxstyle="round,pad=0.1,rounding_size=0.4",
                            fc=bc, ec='none', zorder=3)
        ax.add_patch(nb)
        ax.text(x + 2.8, y + h - 2.4, s["num"], fontsize=11, fontweight='bold',
                ha='center', va='center', color='#ffffff', zorder=4)

        ax.text(x + 5.2, y + h - 2.4, f"ÉTAPE {s['num']} : {s['phase']}", fontsize=9.2,
                fontweight='heavy', ha='left', va='center', color=bc, zorder=3)
        ax.text(x + 1.2, y + h - 5.5, s["title"], fontsize=9.2,
                fontweight='bold', ha='left', va='center', color='#0f172a', zorder=3)

        ax.plot([x + 1.2, x + w - 1.2], [y + h - 7.0, y + h - 7.0], color=bc, lw=1.0, alpha=0.35, zorder=3)

        words = s["desc"].split()
        lines = []
        cur = []
        for w_item in words:
            if len(" ".join(cur + [w_item])) > 30:
                lines.append(" ".join(cur))
                cur = [w_item]
            else:
                cur.append(w_item)
        if cur:
            lines.append(" ".join(cur))

        ly = y + h - 9.2
        for line in lines:
            ax.text(x + 1.2, ly, line, fontsize=8.0, ha='left', va='center', color='#334155', zorder=3)
            ly -= 1.8

        t_box = FancyBboxPatch((x + 1.0, y + 1.0), w - 2.0, 4.4, boxstyle="round,pad=0.2,rounding_size=0.5",
                               fc='#ffffff', ec=bc, lw=0.9, zorder=3)
        ax.add_patch(t_box)
        ax.text(x + 1.8, y + 3.4, "Outils & Technologies :", fontsize=7.2, fontweight='bold',
                ha='left', va='center', color='#64748b', zorder=4)
        ax.text(x + 1.8, y + 1.9, s["tools"], fontsize=7.8, fontweight='bold',
                ha='left', va='center', color='#0f172a', zorder=4)

    # Connecting Flow Arrows
    def draw_flow_arrow(x1, y1, x2, y2, c):
        arrow = patches.FancyArrowPatch((x1, y1), (x2, y2),
                                        arrowstyle='-|>,head_length=5,head_width=3.5',
                                        color=c, lw=2.4, zorder=5)
        ax.add_patch(arrow)

    # 1 -> 2
    draw_flow_arrow(24.5, 70, 27.0, 70, "#2563eb")
    # 2 -> 3
    draw_flow_arrow(49.0, 70, 51.5, 70, "#0d9488")
    # 3 -> 4
    draw_flow_arrow(73.5, 70, 76.0, 70, "#059669")

    # 4 -> 5 (Down from Test to Release)
    draw_flow_arrow(87.0, 52, 87.0, 43, "#d97706")

    # 5 -> 6 (Left)
    draw_flow_arrow(76.0, 25, 73.5, 25, "#ea580c")
    # 6 -> 7 (Left)
    draw_flow_arrow(51.5, 25, 49.0, 25, "#7c3aed")
    # 7 -> 8 (Left)
    draw_flow_arrow(27.0, 25, 24.5, 25, "#4338ca")

    # 8 -> 1 (Up from Monitor to Plan: Continuous feedback loop)
    draw_flow_arrow(13.5, 43, 13.5, 52, "#0284c7")
    ax.text(13.5, 47.5, "Boucle de Feedback Continu", fontsize=8.0, fontweight='bold', style='italic',
            ha='center', va='center', color='#0284c7',
            bbox=dict(boxstyle="round,pad=0.25", fc='#ffffff', ec='#0284c7', lw=1.0), zorder=6)

    plt.tight_layout()
    fig.savefig(primary_path, format='png', dpi=220, bbox_inches='tight')
    plt.close(fig)
    print("Fig 9.5 saved cleanly.")


if __name__ == "__main__":
    p_arch = r"C:\Users\21699\Dropbox\PC\Desktop\medsuivifront\rapport-screenshots\27-arch-devops.png"
    p_etapes = r"C:\Users\21699\Dropbox\PC\Desktop\medsuivifront\rapport-screenshots\28-etapes-devops.png"

    create_arch_devops(p_arch)
    create_etapes_devops(p_etapes)

    # Replicate to target destinations quickly with shutil
    destinations_arch = [
        r"C:\Users\21699\Dropbox\PC\Desktop\medsuivifront\rapport-screenshots\arch-devops.png",
        r"c:\Users\21699\Dropbox\PC\Desktop\medsuivi_patient_mobile\figures\arch_devops.png",
        r"C:\Users\21699\.gemini\antigravity\brain\206e42fe-9186-41aa-b688-dc6246426a56\arch_devops.png"
    ]
    for d in destinations_arch:
        os.makedirs(os.path.dirname(d), exist_ok=True)
        shutil.copy2(p_arch, d)

    destinations_etapes = [
        r"C:\Users\21699\Dropbox\PC\Desktop\medsuivifront\rapport-screenshots\etapes-devops.png",
        r"c:\Users\21699\Dropbox\PC\Desktop\medsuivi_patient_mobile\figures\etapes_devops.png",
        r"C:\Users\21699\.gemini\antigravity\brain\206e42fe-9186-41aa-b688-dc6246426a56\etapes_devops.png"
    ]
    for d in destinations_etapes:
        os.makedirs(os.path.dirname(d), exist_ok=True)
        shutil.copy2(p_etapes, d)

    print("ALL COPIES FINISHED!")
