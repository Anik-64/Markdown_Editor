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
        EXECUTION_ROLE_ARN = "arn:aws:iam::723609008287:role/ecsTaskExecutionRole"
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
                        try {
                            // Fetch the latest task definition
                            def taskDef = sh(script: "aws ecs describe-task-definition --region ${AWS_REGION} --task-definition ${TASK_FAMILY} --query taskDefinition", returnStdout: true).trim()
                            def taskDefJson = readJSON text: taskDef
                            // Explicitly set image and executionRoleArn as strings
                            taskDefJson.containerDefinitions[0].image = "${env.DOCKER_USERNAME}/${env.DOCKER_IMAGE}:${env.DOCKER_TAG}".toString()
                            taskDefJson.executionRoleArn = "${env.EXECUTION_ROLE_ARN}".toString()
                            // Ensure Fargate-specific fields
                            taskDefJson.networkMode = 'awsvpc'
                            taskDefJson.cpu = '256'
                            taskDefJson.memory = '512'
                            taskDefJson.requiresCompatibilities = ['FARGATE']
                            // Remove unnecessary fields
                            taskDefJson.remove('taskDefinitionArn')
                            taskDefJson.remove('revision')
                            taskDefJson.remove('status')
                            taskDefJson.remove('requiresAttributes')
                            taskDefJson.remove('registeredAt')
                            taskDefJson.remove('registeredBy')
                            // Debug: Print JSON
                            echo "Task Definition JSON: ${taskDefJson.toString()}"
                            // Write updated task definition
                            writeJSON file: 'task-definition.json', json: taskDefJson
                            // Debug: Print the written JSON file
                            sh 'cat task-definition.json'
                            // Register new task definition
                            def newTaskDefArn = sh(script: "aws ecs register-task-definition --region ${AWS_REGION} --cli-input-json file://task-definition.json --query taskDefinition.taskDefinitionArn --output text", returnStdout: true).trim()
                            // Update ECS service
                            sh """
                                aws ecs update-service \
                                    --region ${AWS_REGION} \
                                    --cluster ${ECS_CLUSTER} \
                                    --service ${ECS_SERVICE} \
                                    --task-definition ${newTaskDefArn} \
                                    --force-new-deployment
                            """
                        } catch (Exception e) {
                            error "ECS deployment failed: ${e.message}"
                        }
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