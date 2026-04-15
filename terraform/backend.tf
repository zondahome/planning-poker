terraform {
  backend "s3" {
    bucket = "terraform-zonda-application-backend"
    key    = "planning-poker/backend.tfstate"
    region = "us-east-1"
  }
}
