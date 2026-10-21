terraform {
  required_version = ">= 1.8.0"
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.80" } }
  backend "s3" {}
}

provider "aws" { region = var.aws_region }

module "vpc" { source = "./modules/vpc"; name = var.project_name; cidr = var.vpc_cidr }
module "rds_postgis" { source = "./modules/rds_postgis"; name = var.project_name; subnet_ids = module.vpc.private_subnet_ids; vpc_id = module.vpc.vpc_id; db_password = var.db_password }
module "ecs_fargate" { source = "./modules/ecs_fargate"; name = var.project_name; private_subnet_ids = module.vpc.private_subnet_ids; vpc_id = module.vpc.vpc_id }
module "s3_cloudfront" { source = "./modules/s3_cloudfront"; bucket_name = var.web_bucket_name }
module "observability" { source = "./modules/observability"; name = var.project_name }

