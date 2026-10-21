# AWS cost optimization

- Use one NAT gateway in development and scale to one per AZ only when availability requires it.
- Start RDS at `db.t4g.micro`, enable deletion protection for production, and set budget alarms.
- Use CloudFront caching and S3 static hosting behind Origin Access Control.
- Set CloudWatch retention explicitly and sample tracing rather than tracing every request.
- Scale ECS using request count and CPU alarms; keep development services at zero when idle.

