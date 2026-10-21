data "aws_availability_zones" "available" { state = "available" }

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.16.0"
  name = "${var.project_name}-${var.environment}"
  cidr = var.vpc_cidr
  azs = slice(data.aws_availability_zones.available.names, 0, 2)
  private_subnets = ["10.40.1.0/24", "10.40.2.0/24"]
  public_subnets = ["10.40.101.0/24", "10.40.102.0/24"]
  enable_nat_gateway = true
  single_nat_gateway = true
}

resource "aws_db_instance" "postgres" {
  identifier = "${var.project_name}-${var.environment}"
  engine = "postgres"
  engine_version = "16"
  instance_class = "db.t4g.micro"
  allocated_storage = 20
  db_name = "nyaya"
  username = "nyaya"
  password = var.db_password
  port = 5432
  publicly_accessible = false
  skip_final_snapshot = false
  deletion_protection = true
  storage_encrypted = true
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name = aws_db_subnet_group.postgres.name
}

resource "aws_db_subnet_group" "postgres" {
  name = "${var.project_name}-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "rds" {
  name = "${var.project_name}-rds"
  vpc_id = module.vpc.vpc_id
  ingress { from_port = 5432 to_port = 5432 protocol = "tcp" security_groups = [aws_security_group.services.id] }
  egress { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_security_group" "services" {
  name = "${var.project_name}-services"
  vpc_id = module.vpc.vpc_id
  ingress { from_port = 8000 to_port = 8000 protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 3001 to_port = 3001 protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] }
  egress { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_s3_bucket" "web" { bucket = var.web_bucket_name }
resource "aws_s3_bucket_public_access_block" "web" {
  bucket = aws_s3_bucket.web.id
  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}

resource "aws_ecr_repository" "ai" { name = "${var.project_name}/ai-api" image_scanning_configuration { scan_on_push = true } }
resource "aws_ecr_repository" "chat" { name = "${var.project_name}/chat-api" image_scanning_configuration { scan_on_push = true } }

resource "aws_cloudwatch_log_group" "services" { name = "/ecs/${var.project_name}" retention_in_days = 30 }
resource "aws_secretsmanager_secret" "runtime" { name = "${var.project_name}/${var.environment}/runtime" }

output "rds_endpoint" { value = aws_db_instance.postgres.address }
output "web_bucket" { value = aws_s3_bucket.web.bucket }

