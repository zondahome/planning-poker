provider "aws" {
  default_tags {
    tags = {
      Application  = var.application_name
      Environment  = var.environment_tag
      Team         = var.team
      BusinessUnit = var.business_unit
      Service      = var.service
      Terraform    = "true"
    }
  }
  region = var.aws_region
}

# Get available availability zones
data "aws_availability_zones" "available" {}

# S3 Module - Create S3 resources for application versions
module "s3" {
  source = "./modules/s3"

  application_name = var.application_name
  environment      = var.environment
  app_version      = var.app_version
  domain_name      = var.domain_name
  source_dir       = "${path.module}/../"
  output_dir       = "${path.module}/dist"
  exclude_files    = ["terraform", "node_modules", ".git", "dist", ".env", ".aws-env"]
}

# Cloudfront Module - Create cloudfront resources for this application
module "cloudfront" {
  source = "./modules/cloudfront"

  s3_domain_name        = module.s3.bucket_regional_domain_name
  s3_bucket_domain_name = module.s3.bucket_domain_name
  application_name      = var.application_name
  environment           = var.environment
  certificate_arn       = var.certificate_arn
  domain_name           = var.domain_name
  source_dir            = "${path.module}/../"
  output_dir            = "${path.module}/dist"
  exclude_files         = ["terraform", "node_modules", ".git", "dist", ".env", ".aws-env"]
}

# Add S3 bucket policy for CloudFront access
resource "aws_s3_bucket_policy" "cloudfront_access_policy" {
  bucket = "${var.application_name}-${var.environment}"

  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "PolicyForCloudFrontPrivateContent"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "arn:aws:s3:::${var.application_name}-${var.environment}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${module.cloudfront.distribution_id}"
          }
        }
      }
    ]
  })

  depends_on = [module.s3, module.cloudfront]
}

# Get AWS account ID
data "aws_caller_identity" "current" {}

# IAM Module - Create IAM roles and policies
module "iam" {
  source = "./modules/iam"

  application_name = var.application_name
  environment      = var.environment
}
