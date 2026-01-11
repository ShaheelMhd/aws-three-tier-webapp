# Networking Design and Architecture

This document explains the **networking layer** of the AWS 3-tier architecture used in this project, including the VPC design, subnet strategy, routing, and security boundaries.

The goal of this design is to achieve **clear tier isolation, secure traffic flow, and production-grade networking practices**.

---

## Overview

The application is deployed inside a **custom Amazon VPC** and follows a **public–private subnet model**.

At a high level:
- Only the **Application Load Balancer** is exposed to the internet
- Application servers and database are **never publicly reachable**
- Outbound internet access from private subnets is provided via a **NAT Gateway**

---

## VPC Design

### VPC
- CIDR block: `10.0.0.0/16`
- Reasoning:
  - Provides sufficient IP space for scaling
  - Follows common enterprise networking practices
  - Allows clean subnet segmentation

The VPC is isolated from other AWS networks and acts as the security boundary for all resources.

---

## Subnet Strategy

The VPC is divided across **two Availability Zones** for high availability.

### Public Subnets
Used for:
- Application Load Balancer
- Frontend EC2 instances

Characteristics:
- Route to the Internet Gateway
- Can receive inbound internet traffic
- Do **not** host sensitive services

### Private Subnets
Used for:
- Backend EC2 instances
- Amazon RDS PostgreSQL

Characteristics:
- No direct internet access
- No public IP addresses
- Traffic is strictly controlled using Security Groups

---

## Internet Gateway (IGW)

The Internet Gateway is:
- Attached to the VPC
- Used **only by public subnets**

Purpose:
- Allows inbound and outbound internet traffic
- Required for the Application Load Balancer to be reachable by users

Private subnets **do not** route traffic directly to the IGW.

---

## NAT Gateway

### Why NAT is required

Backend EC2 instances reside in **private subnets**, which means:
- They cannot access the internet directly
- Package installation, OS updates, and external API calls would fail

A **NAT Gateway** solves this by allowing:
- Outbound internet access from private subnets
- No inbound internet connections

### NAT Gateway placement
- Deployed in a **public subnet**
- Associated with an Elastic IP
- Used only by private subnets

### Traffic flow
Backend EC2 → NAT Gateway → Internet Gateway → Internet

Inbound traffic from the internet **cannot** reach private instances through NAT.

---

## Route Tables

### Public Route Table
Associated with public subnets.

Routes:
- `0.0.0.0/0 → Internet Gateway`

Purpose:
- Enables public-facing resources to communicate with the internet

---

### Private Route Table
Associated with private subnets.

Routes:
- `0.0.0.0/0 → NAT Gateway`

Purpose:
- Allows private instances outbound internet access
- Prevents direct inbound internet connectivity

---

## Traffic Flow Summary

### User Requests
User → Internet → Internet Gateway → ALB → Frontend / Backend

### API Requests
Frontend → ALB (/api/*) → Backend EC2

### Database Access
Backend EC2 → Amazon RDS (private subnet)

### Outbound Internet Access (private tier)
Backend EC2 → NAT Gateway → Internet

---

## Security Boundaries

Networking is designed around **least privilege**:

- Public internet traffic stops at the ALB
- Backend EC2 instances are unreachable from the internet
- Database is reachable only from backend EC2
- No direct subnet-to-subnet trust without explicit rules

All enforcement is done using:
- Subnet routing
- Security Groups

---

## Why This Design Was Chosen

This networking model:
- Matches real production AWS environments
- Provides strong isolation between tiers
- Scales cleanly across Availability Zones
- Avoids exposing sensitive infrastructure
- Keeps routing logic simple and auditable

It is intentionally designed to be **predictable and secure**.

---

## Future Improvements

Possible enhancements include:
- VPC endpoints for AWS services (to reduce NAT usage)
- Dedicated bastion host or SSM-only access
- Network Firewall for outbound traffic control
- IPv6 support

These are not required for the current scope, but will fit naturally into this design.
