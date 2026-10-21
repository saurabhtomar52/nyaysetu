variable "aws_region" { type = string; default = "ap-south-1" }
variable "project_name" { type = string; default = "nyayaconnect" }
variable "vpc_cidr" { type = string; default = "10.40.0.0/16" }
variable "web_bucket_name" { type = string }
variable "db_password" { type = string; sensitive = true }
variable "ai_service_image" { type = string }
variable "database_url_secret_arn" { type = string; default = null; nullable = true }
