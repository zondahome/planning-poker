# S3 Module - Create a bucket for storing Web Front End

# S3 bucket for application versions
resource "aws_s3_bucket" "web_bucket" {
  bucket        = "${var.application_name}-${var.environment}"
  force_destroy = true
}

# Configure S3 bucket access control
resource "aws_s3_bucket_ownership_controls" "web_bucket_ownership" {
  bucket = aws_s3_bucket.web_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "web_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.web_bucket_ownership]
  bucket     = aws_s3_bucket.web_bucket.id
  acl        = "private"
}

# Configure public access block settings
resource "aws_s3_bucket_public_access_block" "web_bucket_public_access" {
  bucket = aws_s3_bucket.web_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Get AWS account ID for policies
data "aws_caller_identity" "current" {}

resource "aws_s3_bucket_lifecycle_configuration" "web_logs_bucket_lifecycle" {
  bucket = aws_s3_bucket.web_bucket.bucket

  rule {
    id     = "${var.application_name}-${var.environment}-logs-lifecycle-rule"
    status = "Enabled"
    expiration {
      days = 30
    }
    filter {
      prefix = "cloudfront-logs"
    }
  }
}
