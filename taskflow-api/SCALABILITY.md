# TaskFlow — Scalability & Architecture Notes

## Current Architecture

```
Client (React SPA)
      │
      ▼
  Nginx (reverse proxy + static assets)
      │
      ▼
  Node.js / Express API  ──►  MongoDB (Mongoose ODM)
      │
      ▼
  Redis (optional caching layer)
```

---

## Horizontal Scaling Strategy

### 1. Stateless API Design
JWT tokens are **stateless** — no server-side sessions. Any API pod can handle any request, enabling zero-config horizontal scaling behind a load balancer.

```
                    ┌─ API Pod 1 ─┐
Client → Load Balancer ─ API Pod 2 ─ → MongoDB Replica Set
                    └─ API Pod 3 ─┘
```

### 2. Database Scaling

| Stage       | Strategy                                                              |
|-------------|-----------------------------------------------------------------------|
| Early (< 1M docs) | Single MongoDB node with proper indexing                       |
| Growth      | **MongoDB Replica Set** — 1 primary + 2 secondaries for read scaling |
| High scale  | **MongoDB Sharding** — horizontal partitioning by `owner` field      |

**Indexes implemented:**
- `{ owner: 1, status: 1 }` — primary task query pattern
- `{ owner: 1, createdAt: -1 }` — sorted dashboard views
- `{ title: 'text', description: 'text' }` — full-text search
- `{ email: 1 }` (unique) — fast auth lookups

### 3. Caching Layer (Redis)

```
Request → Check Redis cache → HIT: return cached data (< 1ms)
                           → MISS: query MongoDB → cache result → return
```

**Cache strategy:**
- Task lists: TTL 30s (invalidated on mutations)
- User profile: TTL 5 min (invalidated on login/update)
- Admin stats: TTL 60s (heavy aggregation queries)

**Implementation hook** — the codebase is structured to plug in a Redis middleware layer with minimal changes to controllers.

### 4. Microservices Decomposition Path

The current **modular monolith** structure maps 1:1 to microservices when traffic demands it:

```
Current Module         → Future Microservice
─────────────────────────────────────────────
auth (routes/models)   → Auth Service     (port 5001)
tasks (routes/models)  → Task Service     (port 5002)
users (admin)          → User Service     (port 5003)
```

Inter-service communication via **REST** (sync) or **message queue** (async — RabbitMQ / Kafka for event-driven patterns like "task completed" notifications).

### 5. Load Balancing

**Nginx** is already in the stack as a reverse proxy. For multi-pod deployments:

```nginx
upstream taskflow_api {
    least_conn;                     # route to least-busy pod
    server api_pod1:5000;
    server api_pod2:5000;
    server api_pod3:5000;
}
```

For cloud deployments: **AWS ALB**, **GCP Cloud Load Balancing**, or **Kubernetes Ingress** (with HPA for auto-scaling based on CPU/RPS).

### 6. Container Orchestration (Kubernetes)

```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          averageUtilization: 70
```

### 7. Rate Limiting at Scale

Current: **express-rate-limit** (in-process, single node).  
At scale: Replace with **Redis-backed rate limiting** (e.g., `rate-limit-redis`) so limits are shared across all pods:

```
Pod 1 request → Redis INCR counter → shared limit enforced
Pod 2 request → Redis INCR counter → ✓ enforced across pods
```

### 8. Observability

| Layer       | Tool                                      |
|-------------|-------------------------------------------|
| Logging     | Winston → **CloudWatch / ELK Stack**      |
| Metrics     | **Prometheus** + Grafana                  |
| Tracing     | **OpenTelemetry** → Jaeger / Datadog      |
| Alerting    | PagerDuty / OpsGenie on error rate spikes |

---

## Deployment Pipeline

```
git push → GitHub Actions CI
              ├── Run tests (Jest)
              ├── Build Docker image
              ├── Push to ECR / Docker Hub
              └── kubectl rollout (zero-downtime)
```

---

## Security at Scale

- **Secrets management**: AWS Secrets Manager / HashiCorp Vault (not .env files in prod)
- **Network**: API pods in private VPC subnet, only load balancer exposed
- **TLS**: Let's Encrypt / ACM cert on load balancer, HTTPS-only
- **WAF**: AWS WAF / Cloudflare for DDoS and bot protection upstream of load balancer
- **Audit logs**: All admin actions logged with actor ID, timestamp, IP

---

## Estimated Capacity

| Configuration                        | Estimated RPS |
|--------------------------------------|--------------|
| Single Node.js pod (t3.small)        | ~500 RPS      |
| 5 pods + MongoDB replica set         | ~2,500 RPS    |
| 20 pods + MongoDB sharding + Redis   | ~50,000+ RPS  |
