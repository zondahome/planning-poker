variable "aws_region" {
  description = "AWS region where resources will be deployed"
  type        = string
  default     = "us-east-1"
}

variable "application_name" {
  description = "Name of the application"
  type        = string
  default     = "zonda-planning-poker"
}

variable "environment" {
  description = "Deployment environment (dev, qa, prod)"
  type        = string
}

variable "environment_tag" {
  description = "Environment Tag used for AWS (Development, QA, Production)"
  type        = string
}

variable "team" {
  description = "Team that is accountable to these services"
  type        = string
  default     = "Enterprise"
}

variable "service" {
  description = "Internal application this service applies to"
  type        = string
  default     = "Planning Poker"
}

variable "business_unit" {
  description = "Business Unit that is accountable to these services"
  type        = string
  default     = "MG"
}

variable "app_version" {
  description = "Version of the application being deployed"
  type        = string
  default     = "1.0.0"
}

variable "domain_name" {
  description = "Domain name for the application (used for S3 bucket name and CloudFront)"
  type        = string
}

variable "certificate_arn" {
  description = "Certificate ARN of the AWS resource."
  type        = string
}
