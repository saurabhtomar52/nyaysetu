variable "name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "db_password" { type = string; sensitive = true }
variable "ecs_security_group_id" { type = string }
variable "database_name" { type = string; default = "nyaya" }
variable "database_username" { type = string; default = "nyaya" }

resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-db"
  subnet_ids = var.subnet_ids
  tags       = { Name = "${var.name}-db" }
}

resource "aws_security_group" "this" {
  name        = "${var.name}-rds"
  description = "Allow PostgreSQL only from ECS tasks"
  vpc_id      = var.vpc_id
  ingress {
    description     = "PostgreSQL from ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${var.name}-rds" }
}

resource "aws_db_instance" "this" {
  # RDS PostgreSQL supplies PostGIS/pgvector as supported extensions; enable
  # them through the controlled database bootstrap/migration step after create.
  identifier                  = "${var.name}-postgres"
  engine                      = "postgres"
  engine_version              = "15"
  instance_class              = "db.t4g.micro"
  allocated_storage           = 20
  max_allocated_storage       = 100
  storage_type                = "gp3"
  storage_encrypted           = true
  db_name                     = var.database_name
  username                    = var.database_username
  password                    = var.db_password
  port                        = 5432
  db_subnet_group_name        = aws_db_subnet_group.this.name
  vpc_security_group_ids      = [aws_security_group.this.id]
  backup_retention_period     = 7
  backup_window               = "18:00-19:00"
  maintenance_window          = "sun:19:00-sun:20:00"
  publicly_accessible         = false
  auto_minor_version_upgrade  = true
  deletion_protection         = true
  skip_final_snapshot         = false
  copy_tags_to_snapshot       = true
  apply_immediately           = false
  tags                        = { Name = "${var.name}-postgres" }
}

output "endpoint" { value = aws_db_instance.this.address }
output "port" { value = aws_db_instance.this.port }
output "security_group_id" { value = aws_security_group.this.id }
output "database_name" { value = var.database_name }
