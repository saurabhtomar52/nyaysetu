variable "name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "db_password" { type = string; sensitive = true }
resource "aws_db_subnet_group" "this" { name = var.name; subnet_ids = var.subnet_ids }
resource "aws_db_instance" "this" {
  identifier = var.name; engine = "postgres"; engine_version = "16"; instance_class = "db.t4g.micro"
  allocated_storage = 20; db_name = "nyaya"; username = "nyaya"; password = var.db_password
  db_subnet_group_name = aws_db_subnet_group.this.name; publicly_accessible = false
  storage_encrypted = true; deletion_protection = true; skip_final_snapshot = false
}
output "endpoint" { value = aws_db_instance.this.address }

