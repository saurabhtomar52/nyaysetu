output "alb_dns_name" { value = module.ecs_fargate.alb_dns_name }
output "cloudfront_url" { value = module.s3_cloudfront.cloudfront_url }
output "ecs_cluster_name" { value = module.ecs_fargate.cluster_name }
output "rds_endpoint" { value = module.rds_postgis.endpoint }

