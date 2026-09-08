pipeline {
    agent any

    environment {
        // Adjust this path to match your installed JDK 17+ (check with: ls /usr/lib/jvm)
        JAVA_HOME = '/usr/lib/jvm/java-17-openjdk-amd64'
        PATH = "${JAVA_HOME}/bin:${env.PATH}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out backend branch...'
                git branch: 'backend',
                    credentialsId: 'github-medsuivi-token',
                    url: 'https://github.com/aminebarrani/medisuivi-web-mobile-devops.git'
            }
        }

        stage('Debug Info') {
            steps {
                sh 'ls -la Service'
                sh 'which mvn || echo "mvn NOT FOUND on this agent"'
                sh 'mvn -v || true'
                sh 'which java || echo "java NOT FOUND on this agent"'
                sh 'java -version || true'
                sh 'echo "JAVA_HOME=$JAVA_HOME"'
                sh '$JAVA_HOME/bin/java -version'
            }
        }

        stage('Build (all modules)') {
            steps {
                dir('Service') {
                    sh 'mvn -U clean compile'
                }
            }
        }

        stage('Test (all modules)') {
            steps {
                dir('Service') {
                    sh 'mvn -U test'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                dir('Service') {
                    withSonarQubeEnv('SonarQube') {
                        sh 'mvn org.sonarsource.scanner.maven:sonar-maven-plugin:sonar'
                    }
                }
            }
        }

        stage('Package (all modules)') {
            steps {
                dir('Service') {
                    sh 'mvn package -DskipTests'
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                dir('Service') {
                    withCredentials([usernamePassword(credentialsId: 'docker-cred', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                        sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'

                        script {
                            def modules = ['patient-service', 'gateway', 'discovery', 'config-server', 'user-service']
                            for (m in modules) {
                                sh "docker build --build-arg SERVICE_NAME=${m} -t aminbrrn/medisuivi-${m}:latest -f Dockerfile ."
                                sh "docker push aminbrrn/medisuivi-${m}:latest"
                            }
                        }
                    }
                }
            }
        }

    }

    post {
        always {
            junit 'Service/**/target/surefire-reports/*.xml'
            archiveArtifacts artifacts: 'Service/**/target/*.jar', fingerprint: true
        }
    }
}
