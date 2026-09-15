// ============================================================
//  MediSuivi — MOBILE APP (React Native / Expo)
//  Repo: medsuivi_patient_mobile
//  Stages: GIT → BUILD → TEST → SONAR
// ============================================================
pipeline {
    agent any

    environment {
        SONAR_PROJECT_KEY = 'medisuivi-patient-mobile'
        SONAR_PROJECT_NAME = 'MediSuivi Patient Mobile'
    }

    stages {

        // ── 1. GIT ──────────────────────────────────────────
        stage('GIT') {
            steps {
                echo '>>> [1/4] Cloning repository...'
                checkout scm
            }
        }

        // ── 2. BUILD ─────────────────────────────────────────
        stage('BUILD') {
            steps {
                echo '>>> [2/4] Installing Node dependencies (clean install)...'
                sh 'npm ci'

                echo '>>> Type-checking TypeScript (no emit)...'
                sh 'npx tsc --noEmit'
            }
        }

        // ── 3. TEST ──────────────────────────────────────────
        stage('TEST') {
            steps {
                echo '>>> [3/4] Running Jest unit tests...'
                // --passWithNoTests keeps pipeline green until you add tests
                // --coverage generates coverage report consumed by SonarQube
                sh 'npm test -- --watchAll=false --passWithNoTests --coverage --coverageDirectory=coverage'
            }
            post {
                always {
                    // Publish JUnit XML if jest-junit reporter is configured
                    junit allowEmptyResults: true, testResults: 'junit.xml'
                }
            }
        }

        // ── 4. SONAR ─────────────────────────────────────────
        stage('SONAR') {
            steps {
                echo '>>> [4/4] Running SonarQube static analysis...'
                withSonarQubeEnv('SonarQube') {
                    sh """
                        sonar-scanner \\
                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \\
                          -Dsonar.projectName="${SONAR_PROJECT_NAME}" \\
                          -Dsonar.sources=src \\
                          -Dsonar.exclusions=**/node_modules/**,**/__tests__/**,**/assets/** \\
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \\
                          -Dsonar.sourceEncoding=UTF-8
                    """
                }
                // Uncomment to enforce Quality Gate (blocks pipeline if KO)
                // timeout(time: 5, unit: 'MINUTES') {
                //     waitForQualityGate abortPipeline: true
                // }
            }
        }

    }

    post {
        success {
            echo '✅ Mobile pipeline completed successfully.'
        }
        failure {
            echo '❌ Mobile pipeline FAILED. Check the logs above.'
        }
        always {
            cleanWs()
        }
    }
}
