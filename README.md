# Real-Time Markdown Editor with Node.js

The **Real-Time Markdown Editor** is a web-based application designed to simplify the process of writing and previewing Markdown text in real time. This tool is built using **Node.js**, delivering a seamless and interactive experience for creating formatted content. 

Whether you're a developer documenting code, a writer drafting articles, or anyone working with Markdown, this editor provides a user-friendly platform to write, edit, and preview your Markdown text instantly.

## Features

- **Real-Time Preview:** See your Markdown render as you type, eliminating the need to switch between editor and viewer.
- **Advanced Editing:** Powered by **Monaco Editor**, offering syntax highlighting, robust formatting, and an exceptional writing experience.
- **Modern UI:** A clean, responsive interface built with **Tailwind CSS**, featuring built-in Dark/Light mode and mobile-friendly tabs.
- **PDF Export:** Download your rendered Markdown documents directly to PDF without layout artifacts.
- **Auto-Save:** Never lose your work—content is automatically saved to local storage as you type.
- **Secure Backend:** Hardened with Helmet and rate-limiting to ensure safe and robust performance.
- **Cross-Platform Compatibility:** Works seamlessly in modern browsers on desktops, tablets, and mobile devices.

## Why Use This Editor?

- **Save Time:** Instantly visualize the formatted output of your Markdown text without external tools.
- **User-Friendly:** Designed for simplicity and ease of use, even for beginners.
- **Productivity Boost:** Ideal for developers, content creators, and professionals working with Markdown documents.

## Who Is It For?

- **Developers:** Write documentation, README files, or project notes with ease.
- **Writers and Bloggers:** Create content that uses Markdown for publishing platforms.
- **Students and Professionals:** Take notes or create formatted documents quickly.

---

# Markdown App CI/CD Pipeline

## 📌 Project Summary
This project implements a **CI/CD pipeline** to automate the deployment of a **Markdown microservice** to **AWS Elastic Container Service (ECS)** using **Jenkins, Docker, and Docker Hub**.  

The pipeline:
- Triggers when a **pull request from `dev` branch is merged into `main`** (via Generic Webhook Trigger).
- Builds and pushes a Docker image to **Docker Hub**.
- Updates the **ECS task definition** with the new image version.
- Redeploys the ECS service using rolling updates.
- Sends **email notifications via AWS SES** on success or failure.

---

## 🎯 Objectives
- Automate the build, push, and deployment of a Dockerized Node.js microservice to **AWS ECS**.
- Ensure **zero-downtime deployments** with ECS rolling updates and **Application Load Balancer (ALB)**.
- Integrate **GitHub webhooks** for merge-based triggers.
- Provide **email notifications** using **AWS SES**.
- Demonstrate modern DevOps practices: containerization, orchestration, CI/CD.

---

## 🏗 Architecture
- **CI/CD:** Jenkins pipeline on AWS EC2, triggered by GitHub PR merges.
- **Containerization:** Docker image pushed to Docker Hub  
  Format: `<username>/markdown:<BUILD_NUMBER>`.
- **Orchestration:** AWS ECS (Fargate) + ALB load balancing across 2–4 tasks.
- **Notifications:** AWS SES sends success/failure emails to `anikmajumder303@gmail.com`.

---

## 🔧 Prerequisites

### AWS EC2 Instance
- **OS:** Amazon Linux 2 with Jenkins, Docker, and AWS CLI installed.  
- **Instance Type:** Minimum `t3.medium` (2 vCPUs, 4GB RAM).  
- **User Permissions:** Add Jenkins user to Docker group:  
  ```bash
  sudo usermod -aG docker jenkins
  ```  
- **Security Groups**: Open port `8080` (Jenkins) and `3005` (App via ALB).  
- **Jenkins Plugins**:     
  - Generic Webhook Trigger  
  - AWS Credentials  
  - Pipeline Utility Steps  
  - Extended E-mail Notification  

- **Jenkins Credentials**:  
  - `dockerhub`: Docker Hub username/password  
  - `aws`: AWS Access Key ID/Secret Access Key (with ECS + SES permissions)  

---

## ☁️ AWS Setup
### ECS
- Cluster: **MyCluster**
- Task Definition: **myTaskDefinition** (Fargate, 256 CPU, 512 MB memory, port 3005, `awslogs`)
- Service: **myTaskDefinition-service** (2–4 tasks, ALB, auto-scaling at 70% CPU)

### ALB
- Load Balancer: **markdown-alb**  
- Target Group: **markdown-tg** (port 3005, health check `/`)  

### SES
- Verified email: `anikmajumder303@gmail.com`  
- Move out of sandbox mode for production.  

### IAM
- Role: **ecsTaskExecutionRole** with `AmazonECSTaskExecutionRolePolicy` and CloudWatch Logs permissions.  
- AWS credentials (`aws`) require:  
  - `ecs:*`  
  - `logs:*`  
  - `ses:SendEmail`  

---

## 🔄 Pipeline Workflow
Defined in **Jenkinsfile**:

1. **Build**:  
   - Docker image `<username>/markdown:<BUILD_NUMBER>`  
2. **Push**:  
   - Push to Docker Hub (`dockerhub` credentials)  
3. **Deploy to ECS**:  
   - Create new task definition revision  
   - Register with `aws ecs register-task-definition`  
   - Update ECS service → rolling redeploy  
4. **Logout**:  
   - Docker Hub logout  
5. **Finish**:  
   - Mark pipeline complete  
6. **Post Actions**:  
   - Email notification via AWS SES (success/failure)  

---

## ⚡ Webhook Trigger
Triggered only on **PR merges (dev → main)** via GitHub webhook.
- **Webhook URL**: `http://<jenkins-url>:8080/generic-webhook-trigger/invoke`  
- **Events**: Pull Request (merged)  

- **Trigger Variables**:  
- `action`: `$.action` → expects `closed`  
- `merged`: `$.pull_request.merged` → expects `true`  
- `head_ref`: `$.pull_request.head.ref` → expects `dev`  
- `base_ref`: `$.pull_request.base.ref` → expects `main`  

---

## 🛠️ Setup Instructions
### 1. AWS Configuration
- Create ECS Cluster (**MyCluster**) with Fargate.  
- Define Task (`myTaskDefinition`) and Service (`myTaskDefinition-service`).  
- Setup ALB + Target Group.  
- Verify SES email & configure IAM roles.  
- Configure AWS CLI: aws configure

---

## 🚀 Jenkins Setup

1. **Install AWS CLI to jenkins EC2**
    ```bash
    sudo curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    sudo apt install unzip
    sudo unzip awscliv2.zip
    sudo ./aws/install
    aws --version
    ```

1. **Access Jenkins**  
   - URL: `http://<ec2-public-ip>:8080`

2. **Install Required Plugins**  
   - Generic Webhook Trigger  
   - AWS Credentials  
   - Pipeline Utility Steps  
   - Extended E-mail Notification  

3. **Add Credentials**  
   - `dockerhub`: Docker Hub username/password  
   - `aws`: AWS Access Key ID / Secret Access Key  

4. **Configure Extended E-mail Notification**  
   - **SMTP Server**: `email-smtp.ap-south-1.amazonaws.com`  
   - **Credentials**: Use AWS SES SMTP username/password  
   - **Default Recipients**: `anikmajumder303@gmail.com`  

5. **Create a Pipeline Job**  
   - Link to the GitHub repository  
   - Enable **Generic Webhook Trigger** with specified variables  

![Pipeline Diagram](https://firebasestorage.googleapis.com/v0/b/alleventsair.appspot.com/o/files%2Fimages%2Fsb8Ng_1756033644116.png?alt=media&token=5c9f6191-41dd-4d9b-9c51-bd9e91439b7b)
