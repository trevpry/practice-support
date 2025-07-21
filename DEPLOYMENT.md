# Render Deployment Guide

## Prerequisites
- GitHub repository with your code
- Render account (free tier available)

## Deployment Steps

### 1. Database Setup (PostgreSQL)
1. In Render dashboard, create a new PostgreSQL database
2. Note the database connection string (Internal Database URL)

### 2. Web Service Setup
1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Configure the following settings:

**Build & Deploy Settings:**
- Build Command: `chmod +x render-build.sh && ./render-build.sh`
- Start Command: `npm start`
- Root Directory: (leave empty)

**Environment Variables:**
```
NODE_ENV=production
DATABASE_URL=[Your PostgreSQL Internal Database URL from step 1]
DATABASE_PROVIDER=postgresql
CLIENT_URL=https://[your-app-name].onrender.com
JWT_SECRET=[Generate a secure random string]
PORT=5001
```

### 3. Domain Configuration
- Your app will be available at `https://[your-app-name].onrender.com`
- Update CLIENT_URL environment variable with this URL

## Database Configuration

### Development (SQLite)
The application uses SQLite for local development:
```bash
# .env file for development
DATABASE_URL="file:./dev.db"
DATABASE_PROVIDER="sqlite"
NODE_ENV=development
```

### Production (PostgreSQL)
The application automatically switches to PostgreSQL in production:
```bash
# Environment variables in Render
DATABASE_URL="postgresql://user:password@host:port/database"
DATABASE_PROVIDER="postgresql"
NODE_ENV=production
```

## Database Migration
- The schema automatically adapts based on DATABASE_PROVIDER
- SQLite is used for development
- PostgreSQL is used for production
- Migrations run automatically during build process
- If you need to run migrations manually: `npx prisma migrate deploy`

## Environment Variables Required
- `DATABASE_URL`: SQLite path for dev, PostgreSQL connection string for production
- `DATABASE_PROVIDER`: "sqlite" for development, "postgresql" for production
- `NODE_ENV`: "development" or "production"
- `CLIENT_URL`: Your Render app URL
- `JWT_SECRET`: Secure random string
- `PORT`: 5001 (or any available port)

## Troubleshooting

### Build Issues
- Check build logs in Render dashboard
- Ensure all dependencies are listed in package.json
- Verify Node.js version compatibility

### Database Issues
- Verify DATABASE_URL is correct
- Check if migrations ran successfully
- Ensure PostgreSQL service is running

### Runtime Issues
- Check application logs in Render dashboard
- Verify environment variables are set correctly
- Test API endpoints using the health check: `/health`

## Production Considerations

### Database Provider
For production, update `server/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Security
- Use strong JWT_SECRET
- Configure CORS properly
- Consider rate limiting
- Use HTTPS (automatic with Render)

### Monitoring
- Use Render's built-in logging
- Consider adding application monitoring
- Set up health checks

### Performance
- Enable gzip compression
- Consider CDN for static assets
- Monitor database performance
- Optimize queries as needed

## Local Development
```bash
# Install dependencies
npm run setup

# Start development servers
npm run dev

# Build for production (test locally)
npm run build
npm start
```

## Support
- Render Documentation: https://render.com/docs
- Prisma Documentation: https://www.prisma.io/docs
- React + Vite: https://vitejs.dev/guide/
