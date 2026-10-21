variable "name" { type = string }
variable "retention_in_days" { type = number; default = 30 }

resource "aws_cloudwatch_log_group" "services" {
  name              = "/ecs/${var.name}"
  retention_in_days = var.retention_in_days
  tags              = { Name = "${var.name}-logs" }
}

output "log_group_name" { value = aws_cloudwatch_log_group.services.name }
