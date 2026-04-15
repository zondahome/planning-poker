# Terraform Infrastructure for Planning Poker

This directory contains the Terraform configuration for deploying the Planning Poker application on S3 via CloudFront.

## Modular Structure

- **S3 Module** (`modules/s3`): Creates an S3 bucket for storing the built application.
- **CloudFront Module** (`modules/cloudfront`): Creates the CloudFront distribution with SPA routing.
- **IAM Module** (`modules/iam`): Placeholder for IAM roles and policies.

## Usage

1. Set up your AWS credentials:
   ```bash
   export AWS_PROFILE=zonda-prod
   ```

2. Initialize Terraform:
   ```bash
   terraform init
   ```

3. Select the prod workspace:
   ```bash
   terraform workspace list
   terraform workspace select prod
   ```

4. Plan and apply:
   ```bash
   terraform plan -var-file=terraform.tfvars.prod
   terraform apply -var-file=terraform.tfvars.prod
   ```

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) v1.0.0 or newer
- AWS CLI configured with the `zonda-prod` profile
- ACM certificate for the domain in us-east-1

## Cleanup

```bash
terraform destroy -var-file=terraform.tfvars.prod
```
