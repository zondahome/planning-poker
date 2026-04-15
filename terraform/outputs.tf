output "s3_bucket_name" {
  description = "Name of the S3 bucket for application versions"
  value       = module.s3.bucket_id
}
