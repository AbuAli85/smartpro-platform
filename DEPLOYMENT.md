# SmartPro Platform - Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Code Quality & Testing

- [x] All TypeScript errors resolved
- [x] Unit tests passing (`pnpm test`)
- [x] Load tests completed successfully (`pnpm test:load:smoke`)
- [ ] Manual testing of critical user flows
- [ ] Security audit completed
- [ ] Code review completed

### 2. Database

- [x] Database schema finalized
- [x] Migrations tested
- [x] Demo data seeding scripts ready
- [ ] Production database backup strategy in place
- [ ] Database indexes optimized
- [ ] Connection pooling configured

### 3. Environment Configuration

- [ ] Production environment variables configured
- [ ] API keys and secrets secured
- [ ] OAuth configuration verified
- [ ] S3 storage configured
- [ ] Email service configured (Resend)
- [ ] SMS service configured (Twilio)

### 4. Performance Optimization

- [x] Load testing completed
- [ ] CDN configured for static assets
- [ ] Image optimization implemented
- [ ] Database query optimization
- [ ] Caching strategy implemented
- [ ] Rate limiting configured

### 5. Security

- [ ] HTTPS/SSL certificates configured
- [ ] CORS policies reviewed
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Security headers configured

### 6. Monitoring & Logging

- [ ] Error tracking configured (e.g., Sentry)
- [ ] Performance monitoring enabled
- [ ] Database query logging
- [ ] User activity logging
- [ ] Uptime monitoring configured
- [ ] Alert notifications set up

### 7. Documentation

- [x] API documentation complete
- [x] Deployment guide created
- [x] Load testing documentation
- [ ] User documentation
- [ ] Admin documentation
- [ ] Troubleshooting guide

---

## 📋 Deployment Steps

### Step 1: Create Production Checkpoint

```bash
# Save current state as production-ready checkpoint
# Use the Management UI Publish button or create checkpoint via:
pnpm db:push  # Ensure database is up to date
```

### Step 2: Configure Production Environment

The platform uses Manus built-in hosting with automatic environment management. Key configurations:

1. **Database**: Automatically provisioned MySQL/TiDB
2. **Storage**: S3-compatible storage pre-configured
3. **OAuth**: Manus OAuth pre-configured
4. **Analytics**: Built-in analytics enabled

### Step 3: Seed Production Data (Optional)

```bash
# For demo/staging environments
pnpm seed:demo

# For production, manually create:
# - Initial admin users
# - Verified Sanad offices
# - Service categories
```

### Step 4: Deploy via Management UI

1. Open Management UI (right panel)
2. Navigate to **Dashboard** tab
3. Click **Publish** button (top-right)
4. Confirm deployment
5. Wait for deployment to complete
6. Verify deployment URL

### Step 5: Post-Deployment Verification

```bash
# Run smoke test against production
artillery run load-tests/smoke-test.yml --target https://your-domain.manus.space

# Manual verification checklist:
```

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Office search functions
- [ ] Booking creation works
- [ ] Service request submission works
- [ ] Email notifications sent
- [ ] SMS notifications sent
- [ ] Payment processing works (if enabled)
- [ ] Admin dashboard accessible

---

## 🌐 Domain Configuration

### Using Manus Domain

Your app is automatically available at:
```
https://[your-prefix].manus.space
```

### Custom Domain Setup

1. Go to Management UI → **Settings** → **Domains**
2. Options:
   - **Modify prefix**: Change `[your-prefix].manus.space`
   - **Purchase domain**: Buy new domain directly in Manus
   - **Bind existing domain**: Connect your own domain

3. For existing domains, add DNS records:
   ```
   Type: CNAME
   Name: @ (or subdomain)
   Value: [provided by Manus]
   ```

4. Wait for DNS propagation (up to 48 hours)
5. SSL certificate auto-generated

---

## 🔐 Security Configuration

### 1. Environment Secrets

All secrets are managed via Management UI → **Settings** → **Secrets**:

- `JWT_SECRET`: Session signing (auto-generated)
- `DATABASE_URL`: Database connection (auto-configured)
- `RESEND_API_KEY`: Email service
- `TWILIO_*`: SMS service credentials
- Custom API keys as needed

### 2. Rate Limiting

Built-in rate limiting is configured. Adjust in `server/_core/index.ts` if needed.

### 3. CORS Configuration

Default CORS allows your domain. Update in `server/_core/index.ts` for additional origins.

---

## 📊 Monitoring & Maintenance

### Built-in Analytics

Access via Management UI → **Dashboard**:
- Page views (UV/PV)
- User activity
- Performance metrics

### Database Management

Access via Management UI → **Database**:
- View all tables
- CRUD operations
- Export data
- Connection details (for external tools)

### Logs & Debugging

- Server logs available in deployment console
- Client errors tracked in browser console
- Enable verbose logging for troubleshooting

---

## 🔄 Rollback Procedure

If issues occur after deployment:

1. Go to Management UI → **Checkpoints**
2. Find previous stable checkpoint
3. Click **Rollback** button
4. Confirm rollback
5. Verify system stability

---

## 🚨 Troubleshooting

### Issue: High Response Times

**Symptoms**: Slow page loads, timeouts

**Solutions**:
1. Check database query performance
2. Review slow endpoint logs
3. Verify CDN is serving static assets
4. Check server resource usage

### Issue: Database Connection Errors

**Symptoms**: "Too many connections", timeouts

**Solutions**:
1. Verify connection pool settings
2. Check for connection leaks
3. Review concurrent user load
4. Consider database scaling

### Issue: Email/SMS Not Sending

**Symptoms**: Notifications not received

**Solutions**:
1. Verify API keys in Secrets
2. Check service provider status
3. Review rate limits
4. Check logs for error messages

### Issue: OAuth Login Fails

**Symptoms**: Users can't log in

**Solutions**:
1. Verify OAuth configuration
2. Check callback URL settings
3. Ensure session cookies enabled
4. Review CORS configuration

---

## 📈 Scaling Recommendations

### When to Scale

Monitor these metrics:
- Response time > 2 seconds (p95)
- Error rate > 1%
- CPU usage > 80%
- Memory usage > 85%
- Database connections > 80% of pool

### Horizontal Scaling

Manus supports automatic scaling:
1. Contact Manus support for scaling options
2. Configure load balancer
3. Deploy multiple instances
4. Enable session persistence

### Database Scaling

1. **Read Replicas**: For read-heavy workloads
2. **Connection Pooling**: Optimize connections
3. **Query Optimization**: Add indexes, optimize queries
4. **Caching**: Implement Redis for frequent queries

---

## 🎯 Performance Targets

### Response Times
- **Homepage**: < 500ms
- **API Endpoints**: < 1000ms (p95)
- **Database Queries**: < 100ms (p95)
- **Static Assets**: < 200ms (via CDN)

### Availability
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%
- **Success Rate**: > 99%

### Scalability
- **Concurrent Users**: 1000+
- **Requests/Second**: 100+
- **Database Connections**: 50+

---

## 📞 Support & Resources

### Manus Support
- **Help Center**: https://help.manus.im
- **Documentation**: https://docs.manus.im
- **Community**: https://community.manus.im

### Platform Resources
- **Load Testing**: `load-tests/README.md`
- **Database Schema**: `drizzle/schema.ts`
- **API Routes**: `server/routers.ts`
- **Demo Data**: `scripts/seed-demo-simple.ts`

---

## ✅ Go-Live Checklist

Final verification before announcing launch:

- [ ] All deployment steps completed
- [ ] Production smoke test passed
- [ ] All critical features tested manually
- [ ] Monitoring and alerts configured
- [ ] Backup and rollback procedures tested
- [ ] Support team briefed
- [ ] User documentation published
- [ ] Marketing materials ready
- [ ] Social media announcements prepared
- [ ] Press release (if applicable)

---

## 🎉 Post-Launch

### Week 1
- Monitor error rates hourly
- Review user feedback daily
- Check performance metrics
- Address critical bugs immediately

### Month 1
- Analyze user behavior
- Optimize based on usage patterns
- Plan feature enhancements
- Review security logs

### Ongoing
- Monthly performance reviews
- Quarterly security audits
- Regular dependency updates
- Continuous improvement based on feedback

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Production URL**: _____________

**Rollback Checkpoint**: _____________
