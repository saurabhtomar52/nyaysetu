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
