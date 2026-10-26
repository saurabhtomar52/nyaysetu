# NyayaConnect

NyayaConnect is an educational LegalTech project for India. It demonstrates:

- a Next.js web interface in `apps/web`;
- small FastAPI and Express services in `services/`;
- PostgreSQL with the PostGIS extension for location-aware features; and
- AWS infrastructure described as code in `infra/terraform`.

The project uses demo data when an external eCourts or language-model provider is
not configured. It is a learning project, not a law firm, and its responses are
not legal advice.

## Repository layout

```text
apps/web/            Next.js App Router frontend
services/ai-api/     FastAPI API for advocates, CNR lookup, and assistant demo
services/chat-api/   Express + TypeScript chat API
infra/terraform/     AWS VPC, ECS Fargate, RDS, ECR, S3, and logging resources
.github/workflows/   CI, deployment, and Terraform workflows
```

## Prerequisites

Install the following before starting:

- Git
- Docker Desktop with Docker Compose
- Node.js 22 or newer (for running the web app outside Docker)
- Terraform 1.8 or newer (only for the infrastructure section)
- An AWS account and configured credentials (only for Terraform)

Do not put real passwords or API keys in Git. Use environment variables, a
local `.env` file that is ignored by Git, or a managed service such as AWS
Secrets Manager.

## Run the application locally

The root Compose file starts PostgreSQL/PostGIS, the AI API, and the chat API.
It does not build the Next.js app, so start that separately.

From the repository root:

```powershell
docker compose up --build
```

The services are then available at:

| Service | URL |
| --- | --- |
| AI API documentation | <http://localhost:8000/docs> |
| AI API health check | <http://localhost:8000/health> |
| Chat API health check | <http://localhost:3001/health> |
| PostgreSQL/PostGIS | `localhost:5432` |

In a second terminal, start the web app:

```powershell
Set-Location apps\web
npm install
npm run dev
```

Open <http://localhost:3000>. The frontend defaults to the AI API at
`http://localhost:8000`. To use another URL, set
`NEXT_PUBLIC_AI_API_URL` before starting Next.js.

To stop the Compose services, press `Ctrl+C`. To remove the containers and
their anonymous volumes, run `docker compose down --volumes`.

## What are we building?

### District advocate discovery

The app can search demo advocates by district. A future database-backed version
can use PostGIS to check whether a location is inside a district boundary and
then sort results by a neutral rule such as distance or name.

### eCourts CNR lookup

The API accepts a CNR that is exactly 16 alphanumeric characters. People often
call it a “16-digit CNR”, but “16-character CNR” is more precise because a valid
CNR can contain letters as well as numbers. The demo returns a clearly labelled
demo response unless an approved eCourts integration is configured.

### Retrieval-Augmented Generation (RAG)

The assistant can be connected to a RAG provider. RAG means that a model first
retrieves relevant documents and then uses them to draft an answer. It is like
an open-book exam: the model should look at the supplied material instead of
relying only on memory. Retrieved sources must be authoritative and the answer
must still be checked by a qualified professional.

InLegalBERT is an Indian legal-language model that can be used for text
embeddings or language understanding. It is not a court, a statute, or an
official legal authority. A RAG system should cite the actual source documents
(for example, legislation or a court judgment), not present InLegalBERT itself
as proof of a legal rule.

## AWS and DevOps concepts, explained simply

| Concept | Beginner analogy | What it means here |
| --- | --- | --- |
| Docker container | A shipping container | Packages an API together with its runtime and libraries, so the same package can run on a laptop or a server. |
| Amazon ECS Fargate | A warehouse that runs containers | AWS starts and monitors containers without requiring us to manage the underlying virtual machines. |
| Terraform (Infrastructure as Code) | A reusable building blueprint | `.tf` files describe networks, databases, container tasks, and permissions so infrastructure can be reviewed and recreated consistently. |
| CI/CD | A factory quality-control line | GitHub Actions can test code, scan images, build images, and publish or deploy them after a change. |
| PostgreSQL + PostGIS | A spreadsheet with a map and a GPS ruler | PostgreSQL stores the records; PostGIS adds geographic points, polygons, containment checks, and distance calculations. |
| RAG | An open-book exam | The assistant retrieves relevant documents before drafting an answer, reducing unsupported guesses (hallucinations). |
| Amazon ECR | A labelled warehouse shelf | Stores versioned Docker images so ECS can download the exact image it needs. |
| Amazon RDS | A managed database caretaker | Runs PostgreSQL while AWS handles routine infrastructure tasks such as backups and maintenance options. |
| CloudWatch | A building’s control room | Collects logs and metrics so an operator can see whether services are healthy. |

## Architecture

For local development:

```text
Browser (Next.js)
        |
        +--> FastAPI AI API :8000 ----+
        |                             |
        +--> Express chat API :3001   +--> PostgreSQL/PostGIS :5432
```

The Terraform example describes the main AWS building blocks:

```text
Browser -> ECS Fargate services -> private RDS PostgreSQL
              |
              +--> ECR images and CloudWatch logs
VPC, public/private subnets, NAT gateway, security groups, S3 bucket
```

The Terraform files are a learning starting point, not a guarantee that every
production edge component (such as an HTTPS load balancer or CloudFront
distribution) is configured. Review the plan before applying anything.

## Learning workflow

### 1. Explore the APIs

With the containers running, try these commands from any terminal:

```powershell
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:8000/api/v1/advocates?district=Delhi
Invoke-RestMethod http://localhost:8000/api/v1/cases/ABCDEF1234567890
```

The last request uses a syntactically valid 16-character demo CNR. It does not
look up a real case unless an external integration is configured.

For the chat API:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:3001/api/v1/conversations/messages `
  -ContentType "application/json" `
  -Body '{"message":"What is a CNR number?"}'
```

### 2. Try a PostGIS query

PostGIS is included in the database image, but the current root API uses
in-memory demo advocates. You can practise the spatial SQL idea in `psql`:

```sql
SELECT ST_DWithin(
  ST_SetSRID(ST_Point(77.2090, 28.6139), 4326)::geography,
  ST_SetSRID(ST_Point(77.2167, 28.5355), 4326)::geography,
  10000
) AS within_ten_kilometres;
```

`ST_DWithin` answers “are these points within this distance?” The cast to
`geography` makes the distance use metres on the earth rather than treating
latitude and longitude as ordinary flat numbers.

### 3. Inspect the backend

Read `services/ai-api/app/main.py` and
`services/chat-api/src/server.ts`. Notice the input validation, health
endpoints, demo fallback, and the explicit legal-information disclaimer.

### 4. Run the frontend

Read `apps/web/app/page.tsx` and follow how the page calls the AI API. The
frontend currently displays illustrative results until a persistent dataset and
production integrations are connected.

### 5. Validate Terraform safely

The example variables contain placeholders, so do not apply them unchanged.
From the repository root:

```powershell
Set-Location infra\terraform
terraform init
terraform fmt -check
terraform validate
Copy-Item terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with a globally unique S3 bucket name and a secret
database password. Then review a plan:

```powershell
terraform plan -var-file=terraform.tfvars
```

`terraform plan` is like checking a building blueprint before construction.
Only run `terraform apply -var-file=terraform.tfvars` after a qualified
operator has reviewed networking, IAM, costs, backups, and deletion settings.
Delete the local `terraform.tfvars` after use if it contains secrets.

### 6. Understand CI/CD

The workflows in `.github/workflows/` are the automation factory. Read each
workflow before enabling deployment. A typical pipeline:

1. installs dependencies and runs tests;
2. scans source or container images;
3. builds and tags an image;
4. pushes the image to ECR; and
5. updates ECS only when the required AWS credentials and deployment settings
   are present.

Never copy cloud credentials into a workflow file. Use GitHub Actions secrets
or, preferably, short-lived OIDC-based AWS credentials.

## Indian legal context and safety

- **BCI Rule 36:** Rule 36 of the Bar Council of India Rules generally
  restricts advocates from advertising or soliciting work. A directory should
  therefore show factual, verifiable information and must not sell rankings,
  endorsements, or client solicitation. This README is educational and is not
  a complete compliance opinion; obtain current professional advice before
  publishing a real service.
- **CNR:** The eCourts Case Number Record is commonly referred to as a
  16-digit number, but its identifier is 16 alphanumeric characters. Validate
  the exact format required by the official eCourts service and do not invent
  case data when that service is unavailable.
- **InLegalBERT:** This is a model for Indian legal-language processing, not a
  source of law and not an approval by the Indian judiciary. RAG answers should
  identify their primary sources, state uncertainty, and direct users to a
  qualified lawyer for advice.

## 1st-Year practice challenges

Work through these in order. Keep changes small and test each one.

- [ ] **Docker:** Add a Redis service to a personal copy of
  `docker-compose.yml`, expose it on `6379`, and verify it with
  `docker compose ps`. Do not add a password to the repository; document how
  you would supply one through an environment variable.
- [ ] **SQL/PostGIS:** Connect to the `nyaya` database and write a query using
  `ST_DWithin` that finds points within 5 km of a chosen court. Explain why
  `geography` and metres are useful in your query.
- [ ] **Next.js:** Add a loading message and an empty-results message to
  `apps/web/app/page.tsx`, then check the page for both a matching district and
  a district with no demo advocates.
- [ ] **Terraform:** Run `terraform fmt -check` and `terraform validate` in
  `infra/terraform`. Add a `common_tags` variable only if you can thread it
  through the resources without hard-coding credentials, then inspect the
  resulting plan rather than applying it.

## Useful commands

```powershell
# Check the Compose configuration without starting services.
docker compose config

# See running containers and recent logs.
docker compose ps
docker compose logs --tail 50 ai-api

# Build the web app.
Set-Location apps\web
npm run build
```

## License and disclaimer

No legal advice is provided by this project. Confirm current Indian statutes,
court rules, Bar Council rules, and official eCourts documentation before
using the project with real users or real case information.
