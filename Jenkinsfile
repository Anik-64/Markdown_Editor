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
                            // Construct task definition JSON from scratch
                            def taskDefJson = [
                                family: "${env.TASK_FAMILY}",
                                containerDefinitions: [
                                    [
                                        name: "markdown",
                                        image: "${env.DOCKER_USERNAME}/${env.DOCKER_IMAGE}:${env.DOCKER_TAG}",
                                        cpu: 256,
                                        memory: 512,
                                        essential: true,
                                        portMappings: [
                                            [
                                                containerPort: 3005,
                                                hostPort: 3005,
                                                protocol: "tcp"
                                            ]
                                        ],
                                        environment: [
                                            [name: "PORT", value: "3005"]
                                        ],
                                        logConfiguration: [
                                            logDriver: "awslogs",
                                            options: [
                                                "awslogs-group": "/ecs/${env.TASK_FAMILY}",
                                                "awslogs-create-group": "true",
                                                "awslogs-region": "${env.AWS_REGION}",
                                                "awslogs-stream-prefix": "ecs"
                                            ]
                                        ]
                                    ]
                                ],
                                requiresCompatibilities: ["FARGATE"],
                                networkMode: "awsvpc",
                                cpu: "256",
                                memory: "512",
                                executionRoleArn: "${env.EXECUTION_ROLE_ARN}"
                            ]
                            // Debug: Print JSON
                            echo "Task Definition JSON: ${taskDefJson}"
                            // Write task definition to file
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