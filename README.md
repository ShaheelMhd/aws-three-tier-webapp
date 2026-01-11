# AWS 3-Tier Web Application Architecture

This repository documents the design and deployment of a **production-style 3-tier web application** on AWS using **EC2, Application Load Balancer, and RDS PostgreSQL**, with strict network isolation and security best practices.

---

## Architecture Overview

![Architecture Diagram](infrastructure/architecture-diagram.png)

### High-level flow

User
→ Application Load Balancer (Public)
→ Frontend EC2 (React + Nginx)
→ Backend EC2 (Express API)
→ Amazon RDS PostgreSQL


---

## Key AWS Services Used

- Amazon VPC (custom)
- EC2 (frontend & backend)
- Application Load Balancer
- Amazon RDS (PostgreSQL)
- NAT Gateway
- Security Groups
- Internet Gateway

---

## Network Design

### VPC
- Custom VPC with CIDR `10.0.0.0/16`

### Subnets
| Tier | Subnets |
|----|--------|
| Public | ALB, Frontend EC2 |
| Private | Backend EC2, RDS |

### Internet Access
- Public subnets → Internet Gateway
- Private subnets → NAT Gateway (outbound only)

---

## Security Model

### Inbound access
- ALB: HTTP (80) from anywhere
- Frontend EC2: HTTP (80) from ALB only
- Backend EC2: API port (5000) from ALB only
- RDS: PostgreSQL (5432) from backend only

### Key principles
- No public backend access
- No public database access
- Least-privilege security groups

---

## Application Tiers

### Frontend
- React (SPA)
- Served via Nginx
- Deployed on EC2
- Uses `/api/*` for backend communication

### Backend
- Node.js + Express
- Runs in private subnet
- Managed with PM2
- Exposes REST APIs

### Database
- Amazon RDS PostgreSQL
- Private subnet only
- Managed backups and availability

---

## Load Balancer Routing

| Path | Target |
|----|------|
| `/api/*` | Backend EC2 |
| All others | Frontend EC2 |

This ensures clean separation between UI and API layers.

---

## Deployment Summary

1. Create custom VPC and subnets
2. Configure routing (IGW, NAT Gateway)
3. Launch EC2 instances
4. Create RDS PostgreSQL
5. Configure security groups
6. Deploy backend (Express + PM2)
7. Deploy frontend (React + Nginx)
8. Configure ALB and listener rules

Detailed steps are available in `docs/`.

---

## Future Improvements

- HTTPS using ACM
- Auto Scaling Groups
- Infrastructure as Code (Terraform)
- CI/CD pipeline
- CloudWatch monitoring

---

## What This Project Demonstrates

- Real-world AWS networking
- Secure tier isolation
- Load-balanced architecture
- Managed database usage
- Production-ready design decisions

This setup reflects **industry-standard cloud deployment practices**.
