# Load Testing for SmartPro Platform

This directory contains load testing configurations and scripts to ensure the platform can handle concurrent user traffic before production deployment.

## Overview

The load tests simulate realistic user behavior across different scenarios:

1. **Browse Sanad Offices** (30% of traffic) - Users searching and browsing service providers
2. **View Office Details** (25% of traffic) - Users viewing detailed office information and reviews
3. **Browse Service Requests** (20% of traffic) - Users exploring service marketplace
4. **Dashboard Access** (15% of traffic) - Authenticated users accessing their dashboards
5. **Homepage and Static Assets** (10% of traffic) - General website visitors

## Test Phases

The load test runs through 4 phases over 7 minutes:

1. **Warm-up** (60s): 5 users/second - System warm-up
2. **Ramp-up** (120s): 10→50 users/second - Gradual load increase
3. **Peak Load** (180s): 50 users/second - Sustained high traffic
4. **Cool-down** (60s): 50→10 users/second - Gradual decrease

## Performance Thresholds

- **Error Rate**: < 1%
- **P95 Response Time**: < 2000ms
- **P99 Response Time**: < 5000ms

## Prerequisites

```bash
# Install Artillery (already installed as dev dependency)
pnpm install
```

## Running Load Tests

### 1. Start the Development Server

```bash
pnpm dev
```

### 2. Run Load Tests

```bash
# Basic load test
pnpm test:load

# Generate HTML report
pnpm test:load:report

# Quick smoke test (reduced load)
pnpm test:load:smoke
```

## Test Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "test:load": "artillery run load-tests/artillery-config.yml",
    "test:load:report": "artillery run --output load-tests/report.json load-tests/artillery-config.yml && artillery report load-tests/report.json",
    "test:load:smoke": "artillery run load-tests/smoke-test.yml"
  }
}
```

## Interpreting Results

### Key Metrics to Monitor

1. **Request Rate**: Requests per second (should match configured arrival rate)
2. **Response Time**: 
   - min/max/median
   - p95 (95th percentile)
   - p99 (99th percentile)
3. **Error Rate**: Percentage of failed requests
4. **Status Codes**: Distribution of HTTP response codes

### Success Criteria

✅ **Pass**: 
- Error rate < 1%
- P95 response time < 2000ms
- P99 response time < 5000ms
- No 5xx errors during peak load

⚠️ **Warning**:
- Error rate 1-5%
- P95 response time 2000-3000ms
- Occasional 5xx errors

❌ **Fail**:
- Error rate > 5%
- P95 response time > 3000ms
- Frequent 5xx errors

## Common Issues and Solutions

### High Response Times

**Symptoms**: P95 > 2000ms, P99 > 5000ms

**Possible Causes**:
- Database query optimization needed
- Missing database indexes
- Inefficient tRPC procedures
- Memory leaks

**Solutions**:
1. Review slow queries in database logs
2. Add indexes to frequently queried columns
3. Implement caching for read-heavy endpoints
4. Profile memory usage

### High Error Rates

**Symptoms**: Error rate > 1%, 5xx status codes

**Possible Causes**:
- Database connection pool exhausted
- Memory limits exceeded
- Unhandled exceptions in procedures

**Solutions**:
1. Increase database connection pool size
2. Add error handling to all tRPC procedures
3. Monitor server memory usage
4. Implement request rate limiting

### Database Connection Issues

**Symptoms**: "Too many connections" errors

**Solutions**:
1. Configure connection pooling in `server/db.ts`
2. Implement connection retry logic
3. Add connection timeout settings

## Production Recommendations

Based on load test results:

1. **Horizontal Scaling**: Deploy multiple instances behind load balancer
2. **Database Optimization**: 
   - Enable query caching
   - Add composite indexes
   - Consider read replicas
3. **CDN**: Serve static assets via CDN
4. **Caching**: Implement Redis for session and data caching
5. **Rate Limiting**: Protect against abuse and DDoS

## Continuous Monitoring

After deployment, monitor these metrics:

- Response times (p50, p95, p99)
- Error rates
- Database query performance
- Server CPU and memory usage
- Request throughput

## Advanced Testing

### Stress Testing

Test system limits by gradually increasing load until failure:

```bash
artillery run load-tests/stress-test.yml
```

### Spike Testing

Test system recovery from sudden traffic spikes:

```bash
artillery run load-tests/spike-test.yml
```

### Endurance Testing

Test system stability over extended periods:

```bash
artillery run load-tests/endurance-test.yml
```

## Resources

- [Artillery Documentation](https://www.artillery.io/docs)
- [Load Testing Best Practices](https://www.artillery.io/docs/guides/guides/test-script-reference)
- [Performance Testing Guide](https://www.artillery.io/docs/guides/guides/http-reference)
