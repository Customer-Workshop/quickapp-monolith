# Microservice Decomposition Plan

This document describes the strategy for decomposing the QuickApp monolith into independently deployable microservices on AWS EKS.

---

## 1. Current Monolith Architecture

The application is a single deployable unit built with **ASP.NET Core 10** (backend) and **Angular 21** (frontend).

### Data Layer

A single `ApplicationDbContext` in `QuickApp.Core/Infrastructure/ApplicationDbContext.cs` manages all domain entities:

| DbSet             | Entity            | Description                        |
|-------------------|-------------------|------------------------------------|
| `Customers`       | `Customer`        | Customer profiles                  |
| `ProductCategories` | `ProductCategory` | Hierarchical product categories  |
| `Products`        | `Product`         | Product catalog items              |
| `Orders`          | `Order`           | Order headers                      |
| `OrderDetails`    | `OrderDetail`     | Order line items                   |

The context also inherits ASP.NET Identity tables (`ApplicationUser`, `ApplicationRole`, claims, tokens) via `IdentityDbContext`.

### Service Layer

Business services registered in `QuickApp.Server/Program.cs` (lines 192-201):

| Service                | Interface               | Domain          |
|------------------------|-------------------------|-----------------|
| `UserAccountService`   | `IUserAccountService`   | Identity & Auth |
| `UserRoleService`      | `IUserRoleService`      | Identity & Auth |
| `CustomerService`      | `ICustomerService`      | Customer        |
| `ProductService`       | `IProductService`       | Product Catalog |
| `OrdersService`        | `IOrdersService`        | Orders          |

### Authentication & Authorization

- **OpenIddict** OAuth2/OIDC server embedded in the monolith
- ASP.NET Identity for user/role management
- Policy-based authorization with custom handlers (`ViewUserAuthorizationHandler`, `ManageUserAuthorizationHandler`, `ViewRoleAuthorizationHandler`, `AssignRolesAuthorizationHandler`)

### Frontend

- Angular 21 SPA in `quickapp.client/`
- Served as static files via `MapStaticAssets()` and `MapFallbackToFile("/index.html")`
- Communicates with the backend via REST API endpoints

---

## 2. Identified Bounded Contexts

The monolith decomposes into **four microservices**, each owning its data and business logic:

### 2.1 Identity & Auth Service

**Purpose**: Centralized authentication, authorization, and user management.

**Components to extract**:
- `AuthorizationController` — OAuth2 token endpoint
- `UserAccountController` — User CRUD operations
- `UserRoleController` — Role management
- OpenIddict configuration and token lifecycle
- ASP.NET Identity (`ApplicationUser`, `ApplicationRole`, claims, tokens)
- Authorization handlers and policies (`ApplicationPermissions`, `AuthPolicies`)

**Own database**: Identity tables (Users, Roles, Claims, Tokens, OpenIddict tables)

### 2.2 Customer Service

**Purpose**: Customer profile management.

**Components to extract**:
- `CustomerController` — Customer CRUD API
- `CustomerService` / `ICustomerService` — Business logic
- `Customer` entity and related EF configuration

**Own database**: Customers table

### 2.3 Product Catalog Service

**Purpose**: Product and category management.

**Components to extract**:
- `ProductService` / `IProductService` — Product business logic
- `Product` entity — Catalog items with pricing
- `ProductCategory` entity — Hierarchical categories

**Own database**: Products and ProductCategories tables

### 2.4 Order Service

**Purpose**: Order lifecycle management.

**Components to extract**:
- `OrdersService` / `IOrdersService` — Order business logic
- `Order` entity — Order headers
- `OrderDetail` entity — Order line items

**Own database**: Orders and OrderDetails tables

---

## 3. Key Coupling Points to Break

| Coupling Point                    | Current State                                                     | Resolution Strategy                                                |
|-----------------------------------|-------------------------------------------------------------------|--------------------------------------------------------------------|
| **Shared `ApplicationDbContext`** | Single EF context for all entities                                | Split into per-service contexts; each service owns its schema      |
| **`Order.Cashier` FK → `ApplicationUser`** | Direct foreign key to Identity user table                | Replace with `CashierUserId` (string); resolve via API call to Identity Service |
| **`Order.Customer` FK → `Customer`**       | Direct foreign key to Customer table                     | Replace with `CustomerId` (int); resolve via API call to Customer Service      |
| **Monolithic `DatabaseSeeder`**   | Seeds identity data, roles, customers, products, and orders together | Split into per-service seeders; coordinate via init containers or startup hooks |
| **Embedded Auth Pipeline**        | OpenIddict + Identity middleware woven into `Program.cs`          | Extract to standalone Identity Service; other services validate JWT tokens      |
| **Shared `BaseEntity` audit fields** | `CreatedBy`/`UpdatedBy` reference Identity user IDs            | Each service stores user IDs as opaque strings; no direct FK                   |
| **AutoMapper profiles**           | Single mapping configuration across all domains                   | Per-service AutoMapper profiles                                                |

---

## 4. Phased Decomposition Plan

### Phase 1: Containerize As-Is

> **Goal**: Run the existing monolith in Docker without code changes.

- Create multi-stage `Dockerfile` (Node build → .NET restore → .NET publish → runtime)
- Create `docker-compose.yml` with SQL Server and the web app
- Create Kubernetes manifests (`k8s/`) for EKS deployment
- Validate the containerized app runs identically to local development

### Phase 2: Extract Identity & Auth Service

> **Goal**: Stand up a dedicated Identity microservice.

1. Create a new `Identity.API` project with its own `IdentityDbContext`
2. Move `ApplicationUser`, `ApplicationRole`, claims, and OpenIddict tables
3. Move `AuthorizationController`, `UserAccountController`, `UserRoleController`
4. Configure the Identity Service as the OpenIddict authorization server
5. Update the monolith to validate tokens issued by the Identity Service (JWT bearer)
6. Migrate identity data from the monolith database to the new Identity database

### Phase 3: Extract Customer Service

> **Goal**: Isolate customer management.

1. Create a new `Customer.API` project with its own `CustomerDbContext`
2. Move `Customer` entity and `CustomerService`
3. Replace the monolith's direct Customer FK in `Order` with an ID-based reference
4. Expose a REST/gRPC API for customer lookups
5. Publish `CustomerCreated`, `CustomerUpdated` events via SNS/SQS
6. Migrate customer data to the new Customer database

### Phase 4: Extract Product Catalog Service

> **Goal**: Isolate product and category management.

1. Create a new `ProductCatalog.API` project with its own `ProductCatalogDbContext`
2. Move `Product`, `ProductCategory` entities and `ProductService`
3. Expose a REST/gRPC API for product queries
4. Publish `ProductCreated`, `ProductUpdated`, `ProductPriceChanged` events via SNS/SQS
5. Order Service subscribes to price-change events for order validation
6. Migrate product data to the new Product Catalog database

### Phase 5: Extract Order Service

> **Goal**: Isolate order management as the final backend decomposition.

1. Create a new `Order.API` project with its own `OrderDbContext`
2. Move `Order`, `OrderDetail` entities and `OrdersService`
3. Replace direct FK references with ID-based lookups:
   - `CashierUserId` → resolved via Identity Service API
   - `CustomerId` → resolved via Customer Service API
   - Product details → resolved via Product Catalog Service API
4. Publish `OrderPlaced`, `OrderUpdated`, `OrderCancelled` events via SNS/SQS
5. Migrate order data to the new Order database

### Phase 6: Frontend Decomposition

> **Goal**: Modularize the Angular SPA for independent team ownership.

1. Introduce an API Gateway (e.g., AWS ALB + path-based routing or Kong/Envoy)
2. Split Angular modules into lazy-loaded feature modules per bounded context
3. Optionally adopt micro-frontends (Module Federation) for independent deployment
4. Update API base URLs to route through the gateway

---

## 5. AWS EKS Infrastructure Recommendations

### Container Registry
- **Amazon ECR** — One repository per microservice (e.g., `quickapp-identity`, `quickapp-customer`, `quickapp-product-catalog`, `quickapp-order`)

### Database
- **Amazon RDS for SQL Server** — Managed SQL Server instances
- One RDS instance per service (or shared instance with separate databases during initial phases)
- Enable Multi-AZ for production workloads

### Secrets Management
- **AWS Secrets Manager** — Store connection strings, API keys, OIDC certificates
- **External Secrets Operator** — Sync Secrets Manager values into Kubernetes Secrets

### Service Mesh
- **AWS App Mesh** or **Istio** — mTLS between services, traffic management, observability
- Enforce mutual TLS for inter-service communication

### Ingress
- **AWS ALB Ingress Controller** — Internet-facing load balancer with path-based routing
- TLS termination at the ALB with ACM certificates

### Messaging
- **Amazon SNS** — Topic-based fan-out for domain events
- **Amazon SQS** — Per-service queues subscribed to relevant topics
- Example: `order-placed` SNS topic → `notification-queue` SQS, `analytics-queue` SQS

### Observability
- **Amazon CloudWatch** — Centralized logging via Fluent Bit DaemonSet
- **AWS X-Ray** or **OpenTelemetry Collector** — Distributed tracing
- **CloudWatch Container Insights** — Cluster and pod-level metrics

### CI/CD Pipeline
- **GitHub Actions** (or AWS CodePipeline):
  1. Build and test each microservice independently
  2. Build Docker image and push to ECR
  3. Update Kubernetes manifests (image tag)
  4. Apply via `kubectl` or GitOps (ArgoCD/Flux)

---

## 6. Inter-Service Communication Pattern

### Synchronous — REST/gRPC

Used for **queries** where the caller needs an immediate response:

| Caller          | Callee            | Purpose                           | Protocol |
|-----------------|-------------------|-----------------------------------|----------|
| Order Service   | Customer Service   | Validate customer exists          | REST     |
| Order Service   | Product Catalog    | Get product details and pricing   | REST     |
| Order Service   | Identity Service   | Resolve cashier user info         | REST     |
| Frontend (SPA)  | API Gateway        | All user-facing operations        | REST     |

### Asynchronous — SNS/SQS

Used for **domain events** where eventual consistency is acceptable:

| Publisher         | Event                  | Subscribers                              |
|-------------------|------------------------|------------------------------------------|
| Identity Service  | `UserCreated`          | Customer Service (auto-create profile)   |
| Customer Service  | `CustomerUpdated`      | Order Service (update cached name)       |
| Product Catalog   | `ProductPriceChanged`  | Order Service (validate pending orders)  |
| Order Service     | `OrderPlaced`          | Notification Service, Analytics          |
| Order Service     | `OrderCancelled`       | Notification Service, Inventory          |

### Design Principles

- **API Gateway** routes all external traffic; services never exposed directly
- **Circuit breakers** (Polly/.NET) for resilience on synchronous calls
- **Idempotent consumers** for SQS message processing (at-least-once delivery)
- **Correlation IDs** propagated across all service calls for distributed tracing
- **Contract-first API design** with OpenAPI specs per service
