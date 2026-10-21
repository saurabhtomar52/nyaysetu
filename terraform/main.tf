terraform {
  required_version = ">= 1.8.0"
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.80" } }
  backend "s3" {}
}

provider "aws" { region = var.aws_region }

data "aws_availability_zones" "available" { state = "available" }

module "vpc" {
  source             = "./modules/vpc"
  name               = var.project_name
  cidr               = var.vpc_cidr
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 2)
}

module "observability" {
  source = "./modules/observability"
  name   = var.project_name
}

module "ecs_fargate" {
  source                 = "./modules/ecs_fargate"
  name                   = var.project_name
  vpc_id                 = module.vpc.vpc_id
  public_subnet_ids      = module.vpc.public_subnet_ids
  private_subnet_ids     = module.vpc.private_subnet_ids
  container_image        = var.ai_service_image
  database_url_secret_arn = var.database_url_secret_arn
  log_group_name         = module.observability.log_group_name
}

module "rds_postgis" {
  source               = "./modules/rds_postgis"
  name                 = var.project_name
  subnet_ids           = module.vpc.private_subnet_ids
  vpc_id               = module.vpc.vpc_id
  db_password          = var.db_password
  ecs_security_group_id = module.ecs_fargate.tasks_security_group_id
}

module "s3_cloudfront" {
  source       = "./modules/s3_cloudfront"
  bucket_name  = var.web_bucket_name
}
