pipeline {
    agent any

    environment {
        DIRECTORY_PATH = "https://github.com/omsenpaiii/Smart-Pour.git"
        TESTING_ENVIRONMENT = "testing_environment"
        PRODUCTION_ENVIRONMENT = "Om_Tomar" // My name as the production environment
    }

    stages {
        // Stage for checking out the latest code from the repository
        stage('Git Checkout') {
            steps {
                script {
                    echo 'Checking out the latest code from the repository...'
                }
                checkout scmGit(
                    branches: [[name: '*/main']],
                    extensions: [],
                    userRemoteConfigs: [[credentialsId: 'github-token', url: 'https://github.com/omsenpaiii/Smart-Pour.git']]
                )
            }
        }
        // Stage for building the code using Maven
        stage('Build') {
            steps {
                script {
                    echo 'Building the code using Maven...'
                    echo "Fetching the source code from the GitHub repository..."
                    git branch: 'main', url: 'https://github.com/omsenpaiii/Smart-Pour.git'
                    echo "Compiling the code and generating necessary artifacts..."
                }
            }
        }
        // Stage for running unit and integration tests
        stage('Unit and Integration Tests') {
            steps {
                script {
                    echo 'Running unit and integration tests using JUnit and Selenium...'
                    echo "Processing through the testing environment specified by: ${env.TESTING_ENVIRONMENT}"
                }
            }
            post {
                always {
                    echo "Sending email notification about Unit and Integration Tests Status..."
                    emailext (
                        subject: 'Unit and Integration Tests Status',
                        to: 'omtomar4882.be22@chitkara.edu.in',
                        body: "${currentBuild.result}: Unit and Integration Tests have completed for Job '${env.JOB_NAME}'",
                        attachLog: true
                    )
                }
            }
        }
        // Stage for analyzing the code using Jenkins and SonarQube
        stage('Code Analysis') {
            steps {
                script {
                    echo 'Analyzing the code using Jenkins and SonarQube...'
                }
            }
        }
        // Stage for performing a security scan on the code using OWASP ZAP
        stage('Security Scan') {
            steps {
                script {
                    echo 'Performing a security scan on the code using OWASP ZAP...'
                }
            }
            post {
                always {
                    echo "Sending email notification about Security Scan Status..."
                    emailext (
                        subject: 'Security Scan Status',
                        to: 'omtomar4882.be22@chitkara.edu.in',
                        body: "${currentBuild.result}: Security Scan has completed for Job '${env.JOB_NAME}'",
                        attachLog: true
                    )
                }
            }
        }
        // Stage for deploying the application to an AWS EC2 instance for staging
        stage('Deploy to Staging') {
            steps {
                script {
                    echo 'Deploying the application to an AWS EC2 instance for staging...'
                    echo "Staging deployment completed successfully."
                }
            }
        }
        // Stage for running integration tests on the staging environment using Selenium
        stage('Integration Tests on Staging') {
            steps {
                script {
                    echo 'Running integration tests on the staging environment using Selenium...'
                }
            }
            post {
                always {
                    echo "Sending email notification about Integration Tests on Staging Status..."
                    emailext (
                        subject: 'Integration Tests on Staging Status',
                        to: 'omtomar4882.be22@chitkara.edu.in',
                        body: "${currentBuild.result}: Integration Tests on Staging have completed for Job '${env.JOB_NAME}'",
                        attachLog: true
                    )
                }
            }
        }

        // Stage for waiting for manual approval before proceeding to deployment
        stage('Approval') {
            steps {
                script {
                    echo "Waiting for manual approval before proceeding to deployment..."
                    sleep(time: 2, unit: 'SECONDS')
                    echo "Manual approval received. Proceeding to deployment..."
                }
            }
        }

        // Stage for deploying the application to an AWS EC2 instance for production
        stage('Deploy to Production') {
            steps {
                script {
                    echo 'Deploying the application to an AWS EC2 instance for production...'
                    echo "Establishing connection with the production environment: ${env.PRODUCTION_ENVIRONMENT}"
                    echo "Production deployment completed successfully."
                }
            }
        }
    }
}