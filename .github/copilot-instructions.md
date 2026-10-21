# NyayaConnect workspace instructions

- Treat this repository as a production-oriented Indian LegalTech portfolio.
- Never commit credentials, tokens, private keys, or populated `.tfvars` files.
- Keep legal answers educational and include a clear not-legal-advice disclaimer.
- Validate CNR input as exactly 16 alphanumeric characters before calling eCourts.
- Use parameterized SQL for PostGIS and pgvector queries.
- Prefer small, testable modules and run the narrowest relevant test/build command.
- Deployment changes must be reproducible through Terraform and GitHub Actions.

