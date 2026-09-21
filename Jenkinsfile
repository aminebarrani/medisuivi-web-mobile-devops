pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_REPO        = 'aminebrrn/medisuivi-predict-api'
        // Jenkins BUILD_NUMBER is used as the image tag for traceability
        IMAGE_TAG             = "${env.BUILD_NUMBER}"
        SONAR_PROJECT_KEY     = 'medisuivi-predict-api'
    }

    stages {

        // ── 1. GIT ──────────────────────────────────────────────────────────
        stage('GIT') {
            steps {
                echo '>>> [1/5] Cloning repository...'
                checkout scm
            }
        }

        // ── 2. BUILD ─────────────────────────────────────────────────────────
        stage('BUILD') {
            steps {
                echo '>>> [2/5] Installing Python dependencies...'
                // pytest & httpx are already in requirements.txt — no need to install twice
                sh 'pip install -r requirements.txt'

                echo '>>> Building Docker image...'
                sh "docker build -t ${DOCKERHUB_REPO}:${IMAGE_TAG} ."
            }
        }

        // ── 3. TEST ──────────────────────────────────────────────────────────
        stage('TEST') {
            steps {
                echo '>>> [3/5] Running pytest with coverage...'
                sh """
                    pytest tests/ -v --tb=short \\
                      --junitxml=pytest-report.xml \\
                      --cov=. \\
                      --cov-report=xml:coverage.xml \\
                      --cov-report=term-missing
                """
            }
            post {
                always {
                    // Publish pytest JUnit XML in Jenkins
                    junit allowEmptyResults: true, testResults: 'pytest-report.xml'
                }
            }
        }

        // ── 4. SONAR ─────────────────────────────────────────────────────────
        stage('SONAR') {
            steps {
                echo '>>> [4/5] Running SonarQube analysis...'
                withSonarQubeEnv('SonarQube') {
                    sh """
                        sonar-scanner \\
                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \\
                          -Dsonar.projectName="MediSuivi Predict API" \\
                          -Dsonar.sources=. \\
                          -Dsonar.language=py \\
                          -Dsonar.python.version=3 \\
                          -Dsonar.exclusions=**/__pycache__/**,**/tests/**,**/*.joblib,**/*.json \\
                          -Dsonar.python.coverage.reportPaths=coverage.xml \\
                          -Dsonar.python.xunit.reportPath=pytest-report.xml \\
                          -Dsonar.sourceEncoding=UTF-8
                    """
                }
            }
        }

        // ── 5. PUSH TO DOCKERHUB ─────────────────────────────────────────────
        stage('PUSH TO DOCKERHUB') {
            steps {
                echo '>>> [5/5] Pushing image to DockerHub...'
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                sh "docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}"
                sh "docker tag ${DOCKERHUB_REPO}:${IMAGE_TAG} ${DOCKERHUB_REPO}:latest"
                sh "docker push ${DOCKERHUB_REPO}:latest"
            }
        }
    }

    post {
        always {
            echo '>>> Logging out from DockerHub...'
            sh 'docker logout'
            cleanWs()
        }
        success {
            echo "✅ Build #${IMAGE_TAG} pushed as ${DOCKERHUB_REPO}:${IMAGE_TAG}"
        }
        failure {
            echo '❌ ML pipeline FAILED. Check the logs above.'
        }
    }
}

