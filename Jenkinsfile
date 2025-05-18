pipeline {
    agent any

    environment {
        VITE_FIREBASE_API_KEY = credentials('VITE_FIREBASE_API_KEY')
        VITE_FIREBASE_AUTH_DOMAIN = credentials('VITE_FIREBASE_AUTH_DOMAIN')
        VITE_FIREBASE_PROJECT_ID = credentials('VITE_FIREBASE_PROJECT_ID')
        VITE_FIREBASE_STORAGE_BUCKET = credentials('VITE_FIREBASE_STORAGE_BUCKET')
        VITE_FIREBASE_MESSAGING_SENDER_ID = credentials('VITE_FIREBASE_MESSAGING_SENDER_ID')
        VITE_FIREBASE_APP_ID = credentials('VITE_FIREBASE_APP_ID')
    }

    stages {
        stage('delete php folder if it exists') {
            steps {
                sh '''
                    if [ -d "/var/lib/jenkins/DevOps/" ]; then
                        find "/var/lib/jenkins/DevOps/" -mindepth 1 -delete
                        echo "Contents of /var/lib/jenkins/DevOps/ have been removed."
                    else
                        echo "Directory /var/lib/jenkins/DevOps/ does not exist."
                    fi
                '''
            }
        }
        
        stage('Fetch code ') {
            steps {
                sh 'git clone https://github.com/rida-e-ayesha/aws-todo-app.git /var/lib/jenkins/DevOps/php/'
            }
        }

        stage('Create .env file') {
            steps {
                dir('/var/lib/jenkins/DevOps/php') {
                    sh '''
                        cat <<EOF > .env
VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=$VITE_PROJECTEDID
VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
EOF
                        echo ".env file created"
                    '''
                }
            }
        }

        stage('Build and Start Docker Compose') {
            steps {
                dir('/var/lib/jenkins/DevOps/php') {
                    sh 'docker-compose -p thereactapp up -d'
                }
            }
        }
    }
}
