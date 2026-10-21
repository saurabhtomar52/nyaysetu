# NyayaConnect architecture

```text
Browser -> CloudFront/OAC -> S3 (static frontend)
                     \
                      ALB -> ECS Fargate -> FastAPI AI/RAG
                                      \-> Node chat/WebSocket service
                                       \-> RDS PostgreSQL + PostGIS + pgvector
```

Secrets are delivered through AWS Secrets Manager. Logs and metrics go to CloudWatch; CI uses GitHub OIDC rather than long-lived AWS keys.

