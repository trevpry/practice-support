# Production Database Schema Fix

## Problem
The production environment is showing Prisma validation errors indicating that relationship field names don't exist:

```
Unknown field `organization` for include statement on model `Person`
Unknown field `person` for include statement on model `User`
Unknown field `matter` for include statement on model `Invoice`
```

## Root Cause
The production database schema is out of sync with the Prisma client. This happens when:
1. Database migrations weren't properly applied in production
2. The Prisma client wasn't regenerated after schema changes
3. There's a mismatch between local development and production environments

## Immediate Fix

### Option 1: Quick Fix Script
Run this command in your production environment:
```bash
cd server && npm run fix
```

### Option 2: Manual Steps
If the script doesn't work, run these commands manually:
```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

### Option 3: Safe Deployment Script
For future deployments, use:
```bash
cd server && npm run deploy
```

## Verification
After running the fix, test the API endpoints:
```bash
curl https://your-production-url.com/api/people
curl https://your-production-url.com/api/users
curl https://your-production-url.com/api/invoices
```

## Prevention
To prevent this issue in the future:

1. **Always run migrations in production**:
   ```bash
   npx prisma migrate deploy
   ```

2. **Regenerate Prisma client**:
   ```bash
   npx prisma generate
   ```

3. **Use the deployment script**:
   ```bash
   npm run deploy
   ```

4. **Include in your CI/CD pipeline**:
   Add these steps to your deployment process:
   ```yaml
   - name: Deploy database migrations
     run: |
       cd server
       npx prisma migrate deploy
       npx prisma generate
   ```

## Database Safety
✅ **SAFE**: The `prisma migrate deploy` command only applies new migrations and won't delete data
✅ **SAFE**: The `prisma generate` command only updates the client code
✅ **SAFE**: These operations preserve all existing data

## Technical Details
- **Field Names**: Prisma relationship field names are case-sensitive and must match the schema exactly
- **Client Generation**: The Prisma client must be regenerated when the schema changes
- **Migration Deploy**: Use `migrate deploy` (not `migrate dev`) in production for safety

## Troubleshooting
If issues persist:
1. Check the DATABASE_URL is correct
2. Verify database connectivity
3. Ensure migrations directory exists
4. Check for any pending schema changes
