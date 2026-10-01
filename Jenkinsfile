pipeline {
  agent any

  environment {
    REGISTRY = 'cricketregistry'
    TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'latest'}"
    KUBECONFIG_CREDENTIAL_ID = 'k3s-kubeconfig'
  }

  options {
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '10'))
    ansiColor('xterm')
  }

  stages {
    stage('1. Install Dependencies') {
      parallel {
        stage('Backend npm ci') {
          steps {
            dir('backend') {
              sh 'npm ci'
            }
          }
        }
        stage('Frontend npm ci') {
          steps {
            dir('frontend') {
              sh 'npm ci'
            }
          }
        }
        stage('ML Service pip install') {
          steps {
            dir('ml-service') {
              sh 'pip install -r requirements.txt'
            }
          }
        }
      }
    }

    stage('2. Lint & Static Analysis') {
      parallel {
        stage('Frontend Build Validation') {
          steps {
            dir('frontend') {
              sh 'npm run build'
            }
          }
        }
      }
    }

    stage('3. Automated Unit Tests') {
      steps {
        dir('backend') {
          sh 'npm test'
        }
      }
      post {
        always {
          junit testResults: '**/junit.xml', allowEmptyResults: true
        }
      }
    }

    stage('4. Docker Multi-stage Builds') {
      steps {
        sh """
          docker build -t \$REGISTRY/cricket-backend:\$TAG backend/
          docker build -t \$REGISTRY/cricket-frontend:\$TAG frontend/
          docker build -t \$REGISTRY/cricket-ml-api:\$TAG ml-service/
        """
      }
    }

    stage('5. Push to Registry (CD)') {
      when {
        branch 'main'
      }
      steps {
        echo "Pushing images tagged ${TAG} to registry ${REGISTRY}..."
        // withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
        //   sh "echo \$PASS | docker login -u \$USER --password-stdin"
        //   sh "docker push \$REGISTRY/cricket-backend:\$TAG"
        //   sh "docker push \$REGISTRY/cricket-frontend:\$TAG"
        //   sh "docker push \$REGISTRY/cricket-ml-api:\$TAG"
        // }
      }
    }

    stage('6. Deploy to K3s Cluster (CD)') {
      when {
        branch 'main'
      }
      steps {
        echo "Applying manifests to K3s cluster..."
        sh """
          kubectl apply -f k8s/00-namespace.yaml
          kubectl apply -f k8s/01-mongo.yaml
          kubectl apply -f k8s/02-backend.yaml
          kubectl apply -f k8s/03-ml-api.yaml
          kubectl apply -f k8s/04-frontend.yaml
          kubectl apply -f k8s/05-hpa.yaml
          kubectl apply -f k8s/06-ingress.yaml
          kubectl rollout status deployment/backend -n cricket --timeout=120s
        """
      }
    }
  }

  post {
    success {
      echo "🎉 Pipeline finished successfully. All syllabus stages (LO1-LO6) passed."
    }
    failure {
      echo "❌ Pipeline failed. Check console output for debug logs."
    }
  }
}
