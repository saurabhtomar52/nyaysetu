resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}"
  setting { name = "containerInsights" value = "enabled" }
}

resource "aws_iam_role" "execution" {
  name = "${var.project_name}-ecs-execution"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy_attachment" "execution" {
  role = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "ai" {
  family = "${var.project_name}-ai"
  network_mode = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu = 512
  memory = 1024
  execution_role_arn = aws_iam_role.execution.arn
  container_definitions = jsonencode([{
    name = "ai-api", image = var.ai_image, essential = true
    portMappings = [{ containerPort = 8000, protocol = "tcp" }]
    environment = [{ name = "ALLOWED_ORIGINS", value = "*" }]
    logConfiguration = { logDriver = "awslogs", options = {
      "awslogs-group" = aws_cloudwatch_log_group.services.name
      "awslogs-region" = var.aws_region
      "awslogs-stream-prefix" = "ai"
    } }
  }])
}

resource "aws_ecs_task_definition" "chat" {
  family = "${var.project_name}-chat"
  network_mode = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu = 256
  memory = 512
  execution_role_arn = aws_iam_role.execution.arn
  container_definitions = jsonencode([{
    name = "chat-api", image = var.chat_image, essential = true
    portMappings = [{ containerPort = 3001, protocol = "tcp" }]
    environment = [{ name = "ALLOWED_ORIGINS", value = "*" }]
    logConfiguration = { logDriver = "awslogs", options = {
      "awslogs-group" = aws_cloudwatch_log_group.services.name
      "awslogs-region" = var.aws_region
      "awslogs-stream-prefix" = "chat"
    } }
  }])
}

resource "aws_ecs_service" "ai" {
  name = "ai-api"
  cluster = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.ai.arn
  desired_count = 1
  launch_type = "FARGATE"
  network_configuration {
    subnets = module.vpc.private_subnets
    security_groups = [aws_security_group.services.id]
    assign_public_ip = false
  }
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent = 200
}

resource "aws_ecs_service" "chat" {
  name = "chat-api"
  cluster = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.chat.arn
  desired_count = 1
  launch_type = "FARGATE"
  network_configuration {
    subnets = module.vpc.private_subnets
    security_groups = [aws_security_group.services.id]
    assign_public_ip = false
  }
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent = 200
}
