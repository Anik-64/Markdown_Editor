pipeline {
    agent any

    parameters {
        string(name: 'APP_PORT', defaultValue: '3000', description: 'Application port inside the container')
    }

    environment {
        DOCKER_TAG = "${BUILD_NUMBER}"
        DOCKER_IMAGE = "markdown"
        AWS_REGION = "ap-south-1" 
        ECS_CLUSTER = "MyCluster"
        ECS_SERVICE = "myTaskDefinitioin-service"
        TASK_FAMILY = "myTaskDefinitioin"
    }

    stages {
        stage('Build') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'password', usernameVariable: 'username')]) {
                    sh 'docker build -t ${username}/${DOCKER_IMAGE}:${DOCKER_TAG} .'
                }
            }
        }

        stage('Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'password', usernameVariable: 'username')]) {
                    sh 'echo ${password} | docker login -u ${username} --password-stdin'
                    sh "docker push ${username}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                withCredentials([aws(credentialsId: 'aws', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    script {
                        // Fetch the latest task definition
                        def taskDef = sh(script: "aws ecs describe-task-definition --region ${AWS_REGION} --task-definition ${TASK_FAMILY} --query taskDefinition", returnStdout: true).trim()
                        
                        // Parse JSON and update the image tag
                        def taskDefJson = readJSON text: taskDef
                        taskDefJson.containerDefinitions[0].image = "${env.username}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                        
                        // Remove unnecessary fields for registration 
                        taskDefJson.remove('taskDefinitionArn')
                        taskDefJson.remove('revision')
                        taskDefJson.remove('status')
                        taskDefJson.remove('requiresAttributes')
                        taskDefJson.remove('registeredAt')
                        taskDefJson.remove('registeredBy')

                        // Write updated task definition to a file
                        writeJSON file: 'task-definition.json', json: taskDefJson

                        // Register new task definition revision
                        def newTaskDefArn = sh(script: "aws ecs register-task-definition --region ${AWS_REGION} --cli-input-json file://task-definition.json --query taskDefinition.taskDefinitionArn --output text", returnStdout: true).trim()

                        // Update ECS service with new task definition and force redeployment
                        sh """
                            aws ecs update-service \
                                --region ${AWS_REGION} \
                                --cluster ${ECS_CLUSTER} \
                                --service ${ECS_SERVICE} \
                                --task-definition ${newTaskDefArn} \
                                --force-new-deployment
                        """
                    }
                }
            }
        }

        stage('Logout') {
            steps {
                sh 'docker logout'
            }
        }

        stage('Finish') {
            steps {
                echo 'Successfully built and deployed to ECS!'
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs for details.'
        }
    }
}