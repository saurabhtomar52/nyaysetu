variable "name" { type = string }
resource "aws_cloudwatch_log_group" "services" { name = "/ecs/${var.name}"; retention_in_days = 30 }

