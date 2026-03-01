# Admin Panel Testing Guide

## Quick Start Testing

### 1. Access Test (5 minutes)
```
✅ Navigate to http://localhost:3000/admin
✅ Should redirect to /login if not logged in
✅ Log in with: ailistings123@gmail.com or mechannel805@gmail.com
✅ Should see admin dashboard
✅ Try accessing with non-admin email → should redirect to /dashboard
```

### 2. Overview Tab Test (5 minutes)
```
✅ Check Stats Cards display correctly (4 cards)
✅ Verify System Health shows 4 health checks
✅ Check Recent Activity shows last 10 optimizations
✅ All numbers should be accurate
✅ Click Refresh button → data should reload
```

### 3. Analytics Tab Test (5 minutes)
```
✅ Pie chart shows tier distribution
✅ Bar chart shows platform usage
✅ Line chart shows last 7 days activity
✅ Charts are responsive on mobile
✅ Tooltips work on hover
```

### 4. Revenue Tab Test (5 minutes)
```
✅ 4 revenue cards display (MRR, ARR, Total, Conversion)
✅ Revenue by tier breakdown shows
✅ Recent payments table displays (if any payments exist)
✅ All calculations are correct
```

### 5. Users Tab Test (10 minutes)
```
✅ Search box filters users by email/name
✅ Tier filter dropdown works
✅ Select individual users with checkboxes
✅ Select all users with header checkbox
✅ Change user tier → saves automatically
✅ Reset credits → shows confirmation → resets to 0
✅ Email button shows count of selected users
✅ Export CSV downloads file with correct data
✅ Selection counter shows correct count
```

### 6. Optimizations Tab Test (5 minutes)
```
✅ Table shows all optimizations
✅ User emails display correctly
✅ Platform badges are color-coded
✅ Dates format correctly
✅ Table scrolls horizontally on mobile
```

### 7. Settings Tab Test (5 minutes)
```
✅ Admin emails display correctly
✅ System information shows accurate data
✅ Refresh All Data button works
✅ Export All Data downloads JSON file
✅ Quick actions work
```

### 8. Mobile Responsive Test (10 minutes)
```
✅ Open on mobile device or use Chrome DevTools
✅ Header is sticky and readable
✅ Tabs scroll horizontally
✅ Cards stack vertically
✅ Tables scroll horizontally
✅ Buttons are touch-friendly (min 44px)
✅ All features work on mobile
```

### 9. Email Modal Test (5 minutes)
```
✅ Select users in Users tab
✅ Click Email button
✅ Modal opens with recipient list
✅ Enter subject and message
✅ Send button works (queues email)
✅ Cancel button closes modal
✅ Check Firestore emailLogs collection for entry
```

### 10. Error Handling Test (5 minutes)
```
✅ Try accessing without auth → redirects
✅ Try with non-admin email → redirects
✅ Disconnect internet → shows error message
✅ Invalid tier change → shows error
✅ All errors display user-friendly messages
```

## Production Testing Checklist

### Before Deployment
- [ ] All TypeScript errors resolved
- [ ] All console.log statements removed (except intentional ones)
- [ ] Environment variables set correctly
- [ ] Firebase Admin SDK initialized
- [ ] Firestore security rules updated
- [ ] Admin emails configured correctly

### After Deployment
- [ ] Access admin panel on production URL
- [ ] Verify all data loads correctly
- [ ] Test user tier changes
- [ ] Test credit resets
- [ ] Export data and verify
- [ ] Check Vercel logs for errors
- [ ] Monitor Firebase usage

### Performance Testing
- [ ] Page loads in < 3 seconds
- [ ] Charts render smoothly
- [ ] Search is responsive
- [ ] No memory leaks
- [ ] Mobile performance is good

## Common Issues & Solutions

### Issue: "Forbidden - Admin access only"
**Solution**: 
1. Check you're logged in with correct email
2. Verify ADMIN_EMAILS array includes your email
3. Clear browser cache
4. Check Firebase Auth token is valid

### Issue: Data not loading
**Solution**:
1. Click Refresh button
2. Check browser console for errors
3. Verify Firestore collections exist
4. Check Vercel logs for API errors
5. Ensure Firebase Admin SDK is initialized

### Issue: Charts not showing
**Solution**:
1. Verify recharts is installed
2. Check if data is empty
3. Refresh the page
4. Check browser console for errors

### Issue: Tier changes not saving
**Solution**:
1. Check Firestore security rules
2. Verify Firebase Admin has write permissions
3. Check browser console for API errors
4. Ensure user document exists

### Issue: Email not sending
**Solution**:
1. Email service integration required (not included by default)
2. Check emailLogs collection for queued emails
3. Integrate with SendGrid/AWS SES
4. Update email-users API route

## Test Data Setup

### Create Test Users
```javascript
// Run in Firebase Console or create via signup
{
  email: "test-free@example.com",
  tier: "free",
  usageCount: 2,
  usageLimit: 5
}
{
  email: "test-starter@example.com",
  tier: "starter",
  usageCount: 10,
  usageLimit: 25
}
{
  email: "test-pro@example.com",
  tier: "professional",
  usageCount: 25,
  usageLimit: 50
}
{
  email: "test-enterprise@example.com",
  tier: "enterprise",
  usageCount: 100,
  usageLimit: 999999
}
```

### Create Test Optimizations
```javascript
// Create via the main app or manually in Firestore
{
  userId: "test_user_id",
  platform: "amazon",
  mode: "optimize-existing",
  optimized: { title: "Test Product" },
  createdAt: new Date().toISOString()
}
```

## Performance Benchmarks

### Target Metrics
- Initial page load: < 3 seconds
- Data refresh: < 2 seconds
- Search response: < 500ms
- Chart render: < 1 second
- API response: < 1 second

### Monitoring
- Use Chrome DevTools Performance tab
- Check Network tab for slow requests
- Monitor Vercel Analytics
- Check Firebase usage metrics

## Security Testing

### Access Control
- [ ] Non-admin users cannot access /admin
- [ ] API routes reject non-admin requests
- [ ] Token verification works correctly
- [ ] No sensitive data exposed in client

### Data Protection
- [ ] User data is properly secured
- [ ] Admin actions are logged
- [ ] No PII exposed in URLs
- [ ] HTTPS enforced

## Automated Testing (Future)

### Unit Tests
```typescript
// Example test structure
describe('Admin Panel', () => {
  test('redirects non-admin users', () => {});
  test('loads stats correctly', () => {});
  test('updates user tier', () => {});
  test('resets credits', () => {});
});
```

### Integration Tests
```typescript
// Example integration test
describe('Admin API', () => {
  test('GET /api/admin/stats returns data', () => {});
  test('POST /api/admin/update-user updates tier', () => {});
});
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] No console errors
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Environment variables set

### Deployment
- [ ] Deploy to Vercel
- [ ] Verify build succeeds
- [ ] Check deployment logs
- [ ] Test on production URL

### Post-Deployment
- [ ] Smoke test all features
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify data accuracy
- [ ] Test on multiple devices

## Maintenance Schedule

### Daily
- Check error logs
- Monitor active users
- Review system health

### Weekly
- Export data backup
- Review user activity
- Check conversion rates

### Monthly
- Audit user tiers
- Review revenue metrics
- Update dependencies

### Quarterly
- Security audit
- Performance review
- Feature planning

---

**Testing Time**: ~60 minutes for complete test
**Critical Tests**: Access control, user management, data accuracy
**Priority**: High - Admin panel controls entire platform
