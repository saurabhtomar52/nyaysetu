# NyayaConnect DevOps Portfolio

NyayaConnect is a production-oriented Indian LegalTech showcase and hands-on AWS learning laboratory. It demonstrates district-based advocate discovery, 16-character eCourts CNR lookup, and a persona-aware InLegalBERT/RAG assistant.

## Repository layout

```text
frontend/                         Next.js showcase application
backend/ai-rag-service/           FastAPI spatial and RAG middleware
backend/chat-service/             Node.js chat/WebSocket boundary
terraform/modules/                VPC, RDS, ECS, S3/CloudFront, observability
docker/                           Production Dockerfiles and local Compose
docs/                             Architecture, cost, and learning journal
scripts/                          Database initialization and local deploy
.github/workflows/                Frontend, backend, IaC, and security pipelines
```

## Local development

1. Copy `.env.example` to `.env` and set only the integrations you intend to use.
2. Start PostgreSQL/PostGIS and the services:

   ```bash
   docker compose -f docker/docker-compose.yml up --build
   ```

3. Run the frontend from `frontend` with `npm install && npm run dev`.

The APIs intentionally use safe demo data when external eCourts/LLM credentials are absent. Production deployments must provide secrets through AWS Secrets Manager.

## Production notes

The Terraform stack is intentionally modular. Review `terraform/terraform.tfvars.example`, configure the remote S3 backend, add organization-approved ALB/WAF policies, and supply secrets through AWS Secrets Manager or protected CI variables before applying.
