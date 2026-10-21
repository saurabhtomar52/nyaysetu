# NyayaConnect

NyayaConnect is a production-oriented LegalTech showcase and learning platform for India. It demonstrates district-based advocate discovery, 16-digit eCourts CNR lookup, and a persona-aware InLegalBERT assistant.

## Repository layout

```text
apps/web          Next.js App Router frontend
services/ai-api   FastAPI RAG, spatial search, CNR lookup API
services/chat-api Express TypeScript chat and state API
infra/terraform   AWS ECS/RDS/S3/CloudFront/WAF/IAM observability
.github/workflows CI checks, image publishing, Terraform, deployment
```

## Local development

1. Copy `.env.example` to `.env` and set only the integrations you intend to use.
2. Start PostgreSQL/PostGIS and the services:

   ```bash
   docker compose up --build
   ```

3. Run the web app from `apps/web` with `npm install && npm run dev`.

The APIs intentionally use safe demo data when external eCourts/LLM credentials are absent. Production deployments must provide secrets through AWS Secrets Manager.

## Production notes

The Terraform stack targets ECS Fargate, private RDS PostgreSQL, ECR, CloudWatch, and least-privilege task roles. The edge components (ALB, CloudFront, WAF) should be added using your organization-approved modules before a production apply; the included stack avoids pretending to provision an internet-facing edge without review. Review `infra/terraform/terraform.tfvars.example` before applying.
⚖️ NyayaConnect: Indian LegalTech & AWS DevOps Learning Sandbox

Welcome 1st-Year Developers! 👋

This project is designed as a Zero-to-Hero Learning Laboratory. Even if you only know basic Python or C/C++, this repository will guide you through building a production-grade full-stack Indian LegalTech web application and deploying it to Amazon Web Services (AWS) using modern DevOps engineering practices.

📚 Table of Contents

What Are We Building?

ELI5: DevOps & Cloud Concepts Explained Simply

System Architecture Diagram

Step-by-Step Learning Workflow

Phase 1: Local Development with Docker

Phase 2: Database & PostGIS Geospatial Queries

Phase 3: Building the Backend API & RAG AI

Phase 4: Frontend Development & DevOps Dashboard

Phase 5: Infrastructure as Code (Terraform)

Phase 6: CI/CD Pipelines (GitHub Actions)

How to Use GitHub Copilot with This Repository

1st-Year Practice Challenges & Exercises

Glossary of Terms

🎯 What Are We Building?

We are building NyayaConnect, an Indian Legal Technology platform that solves real-world legal accessibility problems while obeying Indian legal regulations:

📍 District Advocate Finder: Helps citizens find nearby verified advocates in their district (e.g., Saket District Court) using PostGIS spatial algorithms.

📜 Bar Council Compliance (BCI Rule 36): Ensures advocate listings are sorted purely by distance/alphabetical order with zero paid rankings or ad-bidding (which is illegal under Indian law).

🔍 16-Digit eCourts Tracker: Lookup case status using the National Judicial Data Grid (NJDG) Case Number Record (CNR) format.

🤖 Multi-Persona AI Legal Assistant: A Retrieval-Augmented Generation (RAG) assistant using InLegalBERT fine-tuned embeddings with 3 distinct modes:

Citizen Mode: Plain-language legal literacy explanations.

Student Mode: Ratio decidendi & Supreme Court case precedent citations.

Advocate Mode: Legal notice drafting templates.

⚡ Interactive DevOps Dashboard: A built-in web tab that visualizes AWS server health, live container logs, and CI/CD build pipelines in real time!

💡 ELI5: DevOps & Cloud Concepts Explained Simply

If you are in your first year of computer science, terms like CI/CD, Fargate, or Terraform might sound intimidating. Here are simple real-world analogies:

Tech Term

Real-World Analogy

What It Actually Does in Our App

Docker (Containers)

Shipping Containers 📦

Wraps our Python/Node code and software tools into a neat package so it runs identically on your laptop, your friend's laptop, or AWS servers.

Terraform (IaC)

Architectural Blueprints 🏗️

Instead of clicking buttons in AWS Console manually, you write code files (.tf) that automatically order AWS to build database servers, networks, and firewalls.

CI/CD (Automation)

Assembly Line Robot 🤖

Automatically tests your code every time you git push, checks for bugs, builds Docker containers, and updates the website on the internet without taking down the server.

PostGIS (GIS Database)

GPS Map inside SQL 🗺️

An extension for PostgreSQL that calculates whether a user's location pin falls inside a District Court's polygon map boundary.

Vector Database / RAG

Open-Book Exam for AI 📖

AI models can hallucinate. RAG lets the AI look up exact Indian Penal Code (BNS 2023) sections from our database before answering the user.

🏗️ System Architecture Diagram

Traffic flows from a user's browser down into our AWS infrastructure in India:

                                [ User / Litigant ]
                                         │
                                         ▼
                            [ AWS CloudFront CDN ]
                     (Caches Static Assets World-Wide)
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
          [ AWS S3 Bucket ]                         [ Application Load ]
       (Next.js Frontend Static Files)                  [ Balancer (ALB)   ]
                                                               │
                                                               ▼
                                                    [ AWS ECS Fargate Cluster ]
                                                    (FastAPI + RAG Microservice)
                                                               │
                                                               ▼
                                                    [ AWS RDS PostgreSQL ]
                                                    (PostGIS + Pgvector DB)


🛠️ Step-by-Step Learning Workflow

Follow these 6 sequential phases to master the codebase step-by-step:

Phase 1: Local Development with Docker

Prerequisites: Install Docker Desktop, Git, and VS Code.

Start Local Environment:

git clone https://github.com/your-username/nyayaconnect-devops-portfolio.git
cd nyayaconnect-devops-portfolio
docker compose -f docker/docker-compose.yml up --build


Verify running containers:

Web App: http://localhost:3000

FastAPI Docs: http://localhost:8000/docs

PostgreSQL: localhost:5432

Phase 2: Database & PostGIS Geospatial Queries

Learn how spatial indexing works by inspecting scripts/init-db.sql.

Check District Containment Query (ST_Contains):

SELECT adv.full_name, adv.primary_court 
FROM advocates adv, districts dist 
WHERE ST_Contains(dist.geom, ST_SetSRID(ST_MakePoint(77.2167, 28.5355), 4326))
  AND dist.district_name = 'South Delhi';


Why this matters for legal compliance: Results are sorted purely by geographical distance (ST_DistanceSphere) or alphabetical order, guaranteeing zero commercial bias under BCI Rule 36.

Phase 3: Building the Backend API & RAG AI

Open backend/ai-rag-service/main.py.

FastAPI Endpoints:

POST /api/v1/ai/chat: Receives user legal queries and runs vector similarity search against pgvector.

GET /api/v1/directory/district-search: Fetches verified advocates matching GeoJSON boundaries.

Phase 4: Frontend Development & DevOps Dashboard

Open frontend/src/app/devops-dashboard/page.tsx.

What to study: See how Next.js fetches real-time telemetry metrics (CPU usage, memory consumption, active Docker containers) and renders them in an interactive dashboard.

Phase 5: Infrastructure as Code (Terraform)

Navigate to the terraform/ directory:

Initialize Terraform:

cd terraform
terraform init


Plan Deployment:

terraform plan


Study the output to see what AWS resources (VPC, Subnets, ECS, RDS) Terraform will create.

Phase 6: CI/CD Pipelines (GitHub Actions)

Open .github/workflows/02-backend-ci-cd.yml:

What happens on git push:

Lint & Test: Runs pytest unit tests on backend Python code.

Security Scan: Runs trivy container scanner to find software vulnerabilities.

Build & Push: Builds a Docker container and pushes it to Amazon Elastic Container Registry (ECR).

Deploy: Triggers a zero-downtime rolling update on AWS ECS Fargate.

🤖 How to Use GitHub Copilot with This Repository

We have provided a custom Copilot instructions file at .github/copilot-instructions.md.

Example Copilot Prompts to Try:

To understand code:

"Copilot, explain how ST_Contains works in backend/ai-rag-service/services/postgis_search.py as if I am a 1st-year CS student."

To debug issues:

"Copilot, my Docker container fails to connect to PostgreSQL on startup. How do I add a healthcheck in docker-compose.yml?"

To learn Terraform:

"Copilot, explain why we put AWS RDS PostgreSQL inside Private Subnets in terraform/modules/rds_postgis/main.tf."

🧪 1st-Year Practice Challenges & Exercises

Test your understanding by completing these hands-on student exercises:

[ ] Exercise 1 (Docker): Add a new Redis caching container to docker/docker-compose.yml on port 6379 and link it with the FastAPI backend.

[ ] Exercise 2 (SQL & PostGIS): Add a new District polygon map for Bengaluru Urban in scripts/init-db.sql with 3 sample advocate records.

[ ] Exercise 3 (Frontend): Add a new button in frontend/src/app/ecourts-tracker/page.tsx that lets users export case timeline results to a downloadable PDF file.

[ ] Exercise 4 (DevOps & Terraform): Modify terraform/variables.tf to add a new tag parameter ProjectOwner = "FirstYearStudent".

📖 Glossary of Terms

ALB (Application Load Balancer): A cloud traffic controller distributing incoming web visits evenly across backend servers.

BCI Rule 36: Bar Council of India regulation prohibiting legal practitioners from advertising or soliciting clients directly or indirectly.

CNR Number: 16-character alphanumeric code uniquely identifying every court case across Indian District & High Courts.

Fargate: AWS serverless container runner that manages virtual servers automatically.

PostGIS: Spatial database extender for PostgreSQL providing geographic object support.

Pgvector: Open-source vector similarity search extension for PostgreSQL used in AI RAG engines.

💻 GitHub Copilot Prompt to Re-generate or Extend this README

If you want Copilot to update or add sections to this README.md, copy and paste the prompt below into Copilot Chat:

Act as a Lead DevOps Mentor and Senior Full-Stack Engineer.

Please review and enhance the `README.md` file for the NyayaConnect repository. Ensure the explanations remain beginner-friendly for a 1st-year Computer Science student.

Requirements:
1. Maintain clear analogies for all AWS and DevOps concepts (Containers, Terraform, CI/CD, PostGIS, RAG).
2. Ensure all code blocks and terminal commands are runnable and accurate.
3. Keep the 1st-year Practice Challenges section updated with hands-on tasks covering Docker, SQL, Next.js, and Terraform.
4. Verify that legal terms (BCI Rule 36, 16-digit CNR, InLegalBERT) are accurately contextualized within Indian judiciary rules.
