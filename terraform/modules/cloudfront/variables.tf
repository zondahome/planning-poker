variable "application_name" {
  description = "Name of the application"
  type        = string
}

variable "environment" {
  description = "Deployment environment (dev, qa, prod)"
  type        = string
}

variable "source_dir" {
  description = "Directory containing the source code"
  type        = string
}

variable "output_dir" {
  description = "Directory where the bundled application will be saved"
  type        = string
}

variable "exclude_files" {
  description = "List of files/directories to exclude from the bundle"
  type        = list(string)
  default     = ["terraform", "node_modules", ".git", "dist", ".env", ".aws-env"]
}

variable "s3_domain_name" {
  description = "Domain name of the S3 bucket"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application (used for CloudFront aliases)"
  type        = string
  default     = ""
}

variable "s3_bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  type        = string
}

variable "s3_website_endpoint" {
  description = "Website endpoint of the S3 bucket"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "Certificate ARN of the AWS resource."
  type        = string
}
