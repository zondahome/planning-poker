# Cloudfront Module - Create cloudfront distribution for the Web
locals {
  s3_origin_id = "s3-${var.application_name}-${var.environment}"
  timestamp    = formatdate("YYYYMMDDhhmmss", timestamp())
  domain_fqdn  = var.domain_name
  origin_domain = var.s3_website_endpoint != "" ? var.s3_website_endpoint : var.s3_bucket_domain_name
}

# Create Origin Access Control for CloudFront to S3
resource "aws_cloudfront_origin_access_control" "default" {
  name                              = "${var.application_name}-${var.environment}-oac-${local.timestamp}"
  description                       = "Origin Access Control for ${var.application_name} S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Keep OAI for backward compatibility
resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
  comment = "CloudFront OAI for ${var.application_name} (legacy)"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name              = local.origin_domain
    origin_access_control_id = aws_cloudfront_origin_access_control.default.id
    origin_id                = local.s3_origin_id
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Cloudfront for Planning Poker ${var.environment}"
  default_root_object = "index.html"

  logging_config {
    include_cookies = false
    bucket          = var.s3_bucket_domain_name
    prefix          = "cloudfront-logs"
  }

  aliases = [local.domain_fqdn]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    cache_policy_id        = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # AWS managed CachingDisabled policy
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  price_class = "PriceClass_200"

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # SPA routing - redirect 403/404 to index.html
  custom_error_response {
    error_code            = 403
    response_page_path    = "/index.html"
    response_code         = 200
    error_caching_min_ttl = 0
  }
  custom_error_response {
    error_code            = 404
    response_page_path    = "/index.html"
    response_code         = 200
    error_caching_min_ttl = 0
  }
}
