export type DeploymentMetric = { service: string; status: "healthy" | "degraded" | "unknown" };

export async function getDeploymentMetrics(): Promise<DeploymentMetric[]> {
  return [{ service: "cloudwatch-adapter", status: "unknown" }];
}

