export function ArchitectureVisualizer() {
  return <pre aria-label="Architecture">Browser -&gt; CloudFront -&gt; S3{"\n"}ALB -&gt; ECS Fargate -&gt; RDS PostGIS/pgvector</pre>;
}

