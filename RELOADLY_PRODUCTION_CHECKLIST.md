# RELOADLY Commission System - Production Ready Checklist

## Pre-Deployment Checklist

### Database
- [ ] Run migration: `migrations/0040_reloadly_commission_system.sql`
- [ ] Verify all 4 tables exist:
  - [ ] `reloadly_commission_settings`
  - [ ] `reloadly_transactions`
  - [ ] `reloadly_operator_cache`
  - [ ] `reloadly_commission_history`
- [ ] Verify indexes are created on all tables
- [ ] Verify RLS policies are enabled and correct
- [ ] Test database permissions for service_role and authenticated users
- [ ] Backup production database before migration
- [ ] Create database snapshots/backups

### Backend Services
- [ ] Review `server/services/commissionService.ts` for correctness
- [ ] Review `server/services/reloadlyEnhancedService.ts` for integration
- [ ] Verify error handling in both services
- [ ] Test commission calculation logic:
  - [ ] Percentage commissions (5%, 2.5%, etc.)
  - [ ] Fixed amount commissions
  - [ ] No commission (commission_type: 'none')
  - [ ] Min/max amount constraints
- [ ] Test transaction recording
- [ ] Test transaction status updates
- [ ] Test operator caching

### Backend Routes
- [ ] Review `server/routes/commission.ts` for completeness
- [ ] Verify all endpoints are properly authenticated
- [ ] Verify admin-only endpoints use tierAccessControl middleware
- [ ] Test all commission settings endpoints (CRUD)
- [ ] Test all user transaction endpoints
- [ ] Test error responses for invalid inputs
- [ ] Test pagination for transaction history
- [ ] Verify request validation

### Server Integration
- [ ] Verify commission router imported in `server/enhanced-index.ts`
- [ ] Verify commission router mounted at `/api/commission`
- [ ] Test server starts without errors
- [ ] Verify all routes are accessible
- [ ] Test with admin and user tokens

### Environment Setup
- [ ] All RELOADLY env vars are set:
  - [ ] `RELOADLY_API_KEY`
  - [ ] `RELOADLY_API_SECRET`
- [ ] All Supabase env vars are set:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Database connection verified
- [ ] No hardcoded secrets in code

## Initial Configuration

### Create Default Commission Settings
```bash
# Use the API or service directly to create:

# Global 5% for airtime
POST /api/commission/settings
{
  "service_type": "airtime",
  "commission_type": "percentage",
  "commission_value": 5,
  "is_active": true
}

# Global 3% for data
POST /api/commission/settings
{
  "service_type": "data",
  "commission_type": "percentage",
  "commission_value": 3,
  "is_active": true
}

# Global ₦50 for utilities
POST /api/commission/settings
{
  "service_type": "utilities",
  "commission_type": "fixed_amount",
  "commission_value": 50,
  "is_active": true
}

# Global 2% for gift cards
POST /api/commission/settings
{
  "service_type": "gift_cards",
  "commission_type": "percentage",
  "commission_value": 2,
  "is_active": true
}
```

### Operator-Specific Settings
```bash
# Optional: Set operator-specific commissions for high-volume operators
# Example: 2% for MTN (operator_id: 1)
POST /api/commission/settings
{
  "service_type": "airtime",
  "operator_id": 1,
  "commission_type": "percentage",
  "commission_value": 2,
  "is_active": true
}
```

## Testing Plan

### Unit Tests
- [ ] Create tests for `commissionService.ts`
  - [ ] `calculateCommission()` with different commission types
  - [ ] `createCommissionSetting()` with validation
  - [ ] `getCommissionSetting()` with fallback logic
  - [ ] `recordTransaction()` with metadata
  - [ ] `getUserTransactions()` with filters
  - [ ] `getCommissionStats()` calculations

- [ ] Create tests for `reloadlyEnhancedService.ts`
  - [ ] `sendAirtimeTopupWithCommission()` success path
  - [ ] `sendAirtimeTopupWithCommission()` failure path
  - [ ] Transaction recording on each service
  - [ ] Operator caching

### Integration Tests
- [ ] Test full transaction flow:
  1. User requests purchase
  2. API calculates commission
  3. Transaction is recorded
  4. RELOADLY API is called
  5. Transaction status is updated
- [ ] Test RELOADLY API failure handling
- [ ] Test database transaction rollback on error
- [ ] Test concurrent transactions
- [ ] Test with different operators and service types

### API Tests
```bash
# Test commission calculation
curl -X POST http://localhost:3000/api/commission/calculate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service_type":"airtime","amount":1000,"operator_id":1}'

# Expected response includes final_amount with commission applied

# Test transaction recording
curl -X GET http://localhost:3000/api/commission/transactions \
  -H "Authorization: Bearer TOKEN"

# Should return user's transactions

# Test admin stats
curl -X GET http://localhost:3000/api/commission/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Should return commission statistics
```

### End-to-End Tests
- [ ] Complete purchase flow with commission
- [ ] View transaction history
- [ ] Admin can modify commissions
- [ ] New rates apply to new transactions
- [ ] Historical transactions maintain original commission rate

## Performance Verification

### Load Testing
- [ ] Test 100 concurrent commission calculations
- [ ] Test 100 concurrent transaction recordings
- [ ] Measure response time for each endpoint
- [ ] Monitor database query performance
- [ ] Check for N+1 query problems

### Database Performance
- [ ] Verify indexes are being used:
  ```sql
  EXPLAIN ANALYZE SELECT * FROM reloadly_transactions 
  WHERE user_id = 'uuid' ORDER BY created_at DESC LIMIT 10;
  ```
- [ ] Monitor slow query logs
- [ ] Check database connection pool usage
- [ ] Verify no table locks during concurrent updates

### Caching Performance
- [ ] Operator caching reduces RELOADLY API calls
- [ ] Commission settings are cached appropriately
- [ ] Cache invalidation works correctly

## Security Verification

### Authentication & Authorization
- [ ] All endpoints check authentication
- [ ] Admin-only endpoints use tierAccessControl
- [ ] Users can only view their own transactions
- [ ] Admins can view all transactions
- [ ] Commission settings require admin role

### Data Protection
- [ ] No sensitive data in logs
- [ ] No passwords or API keys in responses
- [ ] Transaction data is encrypted at rest
- [ ] Audit trail records who changed commission settings

### Validation & Input Sanitization
- [ ] All numeric inputs are validated
- [ ] Commission value is between 0-100 for percentage
- [ ] Service type is whitelisted
- [ ] Operator ID is integer
- [ ] All string inputs are trimmed and sanitized

### Error Handling
- [ ] No stack traces in production errors
- [ ] Sensitive information is not exposed
- [ ] All errors are logged securely
- [ ] Error messages are user-friendly

## Monitoring & Alerting

### Metrics to Monitor
- [ ] Commission calculation success rate (target: >99.5%)
- [ ] Transaction recording success rate (target: >99.9%)
- [ ] API response times (p95: <500ms)
- [ ] RELOADLY API availability
- [ ] Database query performance

### Alerts to Set Up
- [ ] Alert if commission calculation fails > 5 times in 5 minutes
- [ ] Alert if transaction recording fails > 5 times in 5 minutes
- [ ] Alert if RELOADLY API response time exceeds 2 seconds
- [ ] Alert if database connection fails
- [ ] Alert on unusual commission values (>50%)

### Logging
- [ ] All transactions are logged with full details
- [ ] Commission changes are logged with actor
- [ ] All errors are logged with context
- [ ] API requests are logged (sanitized)
- [ ] Daily log analysis for patterns

## Operational Procedures

### Daily Operations
- [ ] Monitor transaction success rates
- [ ] Review error logs for patterns
- [ ] Verify RELOADLY API health
- [ ] Check database storage usage
- [ ] Verify backups completed

### Weekly Operations
- [ ] Review commission revenue
- [ ] Analyze transaction trends
- [ ] Check for unusual operator-specific patterns
- [ ] Verify all systems are healthy
- [ ] Review new user feedback

### Monthly Operations
- [ ] Generate commission reports
- [ ] Reconcile with RELOADLY statements
- [ ] Review and optimize commission rates
- [ ] Analyze pricing effectiveness
- [ ] Update documentation
- [ ] Review and update monitoring/alerts

### Quarterly Operations
- [ ] Full system audit
- [ ] Security review
- [ ] Performance optimization
- [ ] Database maintenance
- [ ] Disaster recovery test

## Rollback Plan

### If Issues Occur
1. **Immediate**: Disable new commission features
   ```typescript
   // Temporarily set all commissions to 'none'
   UPDATE reloadly_commission_settings SET is_active = false;
   ```

2. **Short-term**: Revert to previous transaction handling
   - Use original reloadly.ts routes (without commission)
   - Stop using reloadlyEnhancedService

3. **Long-term**: Fix issues and re-deploy
   - Fix identified bugs
   - Re-run tests
   - Gradual rollout with monitoring

### Data Recovery
- [ ] Database backup strategy in place
- [ ] Transaction audit trail preserved
- [ ] Ability to refund affected transactions
- [ ] User communication plan

## Sign-Off Checklist

### Code Review
- [ ] At least 2 reviewers approved the code
- [ ] All tests pass
- [ ] No security issues identified
- [ ] Performance is acceptable

### Testing
- [ ] Unit tests: ✓ Passing
- [ ] Integration tests: ✓ Passing
- [ ] E2E tests: ✓ Passing
- [ ] Load tests: ✓ Passed

### Documentation
- [ ] README updated
- [ ] API documentation complete
- [ ] Implementation guide reviewed
- [ ] Production checklist complete

### Approval
- [ ] Tech Lead approved
- [ ] Product Owner approved
- [ ] Security/DevOps approved
- [ ] Operations team trained

## Go-Live Execution

### Pre-Launch (1 hour before)
- [ ] Database backup created
- [ ] Rollback plan ready
- [ ] Team members on standby
- [ ] Monitoring dashboards open
- [ ] Slack/communication ready

### Launch
1. Run database migration
2. Verify all tables created
3. Deploy backend code
4. Verify routes are accessible
5. Create default commission settings
6. Run smoke tests
7. Monitor for errors

### Post-Launch (2-4 hours)
- [ ] Monitor transaction success rates
- [ ] Check error logs
- [ ] Verify RELOADLY integration
- [ ] Monitor database performance
- [ ] Gather initial feedback

### First Day Monitoring
- [ ] Continuous monitoring
- [ ] Daily standup on status
- [ ] Quick response to issues
- [ ] Document lessons learned

## Success Criteria

✅ All endpoints working correctly  
✅ Commissions calculated accurately  
✅ Transactions recorded in database  
✅ Transaction history accessible to users  
✅ Admin can manage commission settings  
✅ All tests passing  
✅ Performance meets SLAs  
✅ No security vulnerabilities  
✅ Team trained and confident  
✅ Monitoring and alerting in place  

## Known Limitations & Future Work

### Current Limitations
- Single commission rule per service/operator
- No scheduled commission changes
- No A/B testing support
- No geographic pricing
- No time-based pricing

### Future Enhancements
- [ ] Advanced pricing rules (schedule-based, promotional)
- [ ] A/B testing framework for pricing
- [ ] Geographic pricing support
- [ ] Volume-based discounts
- [ ] Seasonal pricing
- [ ] AI-powered pricing optimization
- [ ] Mobile wallet integration
- [ ] Analytics dashboard

## Support Contacts

- **Technical Issues**: [DevOps Team]
- **Business Questions**: [Finance Team]
- **User Support**: [Customer Support Team]
- **Emergency Escalation**: [Manager on Duty]

## Appendix

### Useful Queries

Get total commission earned today:
```sql
SELECT 
  SUM(commission_earned) as total_commission,
  COUNT(*) as transaction_count,
  AVG(commission_earned) as avg_commission
FROM reloadly_transactions
WHERE status = 'success'
  AND DATE(created_at) = CURRENT_DATE;
```

Get commission by service type:
```sql
SELECT 
  service_type,
  COUNT(*) as count,
  SUM(commission_earned) as total_commission,
  AVG(commission_rate) as avg_rate
FROM reloadly_transactions
WHERE status = 'success'
GROUP BY service_type
ORDER BY total_commission DESC;
```

Get operator performance:
```sql
SELECT 
  operator_name,
  COUNT(*) as transaction_count,
  SUM(commission_earned) as total_commission,
  ROUND(100.0 * SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM reloadly_transactions
GROUP BY operator_name
ORDER BY total_commission DESC;
```
