variable "name" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
resource "aws_ecs_cluster" "this" { name = var.name; setting { name = "containerInsights"; value = "enabled" } }
output "cluster_name" { value = aws_ecs_cluster.this.name }
output "alb_dns_name" { value = "configure-alb-module-before-production-apply" }

