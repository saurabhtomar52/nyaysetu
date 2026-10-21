# Repository Coding & Infrastructure Standards

## Core Tech Stack Rules
- **Infrastructure:** AWS (VPC, ECS Fargate, RDS PostgreSQL, S3, CloudFront, ECR, IAM, CloudWatch).
- **IaC:** Terraform >= 1.5.0 with modular structure. Never hardcode AWS secrets or passwords; use SSM Parameter Store / Secrets Manager variables.
- **CI/CD:** GitHub Actions with strict workflow isolation, automated testing before build, and security scanning.
- **Containers:** Multi-stage, non-root user execution, minimal base images (Alpine / Distroless).
- **Frontend:** Next.js 14+ App Router, TypeScript, Tailwind CSS. Must include a `/devops-dashboard` page displaying real-time infrastructure topology, AWS service status, and deployment logs.
- **Backend:** FastAPI (Python 3.11+) with Pydantic v2 and SQLAlchemy async sessions.
- **Database:** PostgreSQL 15+ with `postgis` and `vector` extensions. All spatial queries must enforce neutral, non-ranked sorting to comply with BCI Rule 36.

## DevOps Learning Objectives
Always include comments explaining *why* a DevOps pattern is used (e.g., why Origin Access Control is preferred over legacy OAI in CloudFront, or why multi-stage Docker builds reduce attack surfaces).
