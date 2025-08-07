# MediLink Deployment Guide

This guide will help you deploy MediLink to production using Railway (backend) and Vercel (frontend).

## 🚀 Quick Deploy

### Option 1: One-Click Deploy

#### Backend (Railway)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

#### Frontend (Vercel)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/medilink)

### Option 2: Manual Deployment

## 🔧 Backend Deployment (Railway)

1. **Create Railway Account**
   - Go to [Railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   \`\`\`bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Navigate to backend directory
   cd backend
   
   # Deploy
   railway up
   \`\`\`

3. **Set Environment Variables**
   \`\`\`bash
   railway variables set JWT_SECRET=your_super_secret_jwt_key_here
   railway variables set NODE_ENV=production
   railway variables set PORT=3000
   \`\`\`

4. **Get Backend URL**
   - Your backend will be available at: `https://your-app-name.up.railway.app`

## 🌐 Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [Vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend**
   \`\`\`bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Navigate to frontend directory
   cd frontend
   
   # Deploy
   vercel
   \`\`\`

3. **Set Environment Variables**
   - In Vercel dashboard, go to your project settings
   - Add environment variable:
     - `VITE_API_URL`: `https://your-backend-url.up.railway.app`

4. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## 🐳 Alternative: Docker Deployment

### Backend Docker
\`\`\`bash
cd backend
docker build -t medilink-backend .
docker run -p 3000:3000 -e JWT_SECRET=your_secret medilink-backend
\`\`\`

### Frontend Docker
\`\`\`dockerfile
# frontend/Dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

## 🔐 Environment Variables

### Backend (.env)
\`\`\`env
NODE_ENV=production
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
DATABASE_PATH=/app/data/database.sqlite3
\`\`\`

### Frontend (.env.production)
\`\`\`env
VITE_API_URL=https://your-backend-domain.up.railway.app
\`\`\`

## 📊 Database Setup

The SQLite database will be automatically created and seeded on first deployment. The demo accounts will be available:

- **Admin**: admin@medilink.com / password123
- **Doctor**: dr.smith@medilink.com / password123
- **Patient**: patient1@example.com / password123

## 🔍 Health Checks

- Backend health: `GET /api/health`
- Frontend: Automatic health checks via Vercel

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure frontend URL is added to CORS whitelist in backend
   - Check environment variables are set correctly

2. **Database Issues**
   - Verify DATABASE_PATH is writable
   - Check migrations ran successfully

3. **Build Failures**
   - Ensure Node.js version is 20.x
   - Clear npm cache: `npm cache clean --force`

### Logs

**Railway Logs:**
\`\`\`bash
railway logs
\`\`\`

**Vercel Logs:**
- Check deployment logs in Vercel dashboard

## 🔄 Updates

To update the deployment:

1. **Backend**: Push to main branch or run `railway up`
2. **Frontend**: Push to main branch or run `vercel --prod`

## 📈 Monitoring

- Railway provides built-in monitoring
- Vercel provides analytics and performance metrics
- Set up uptime monitoring with services like UptimeRobot

## 💰 Costs

- **Railway**: Free tier includes 500 hours/month
- **Vercel**: Free tier includes unlimited static deployments
- **Total**: $0/month for small usage

## 🔒 Security Considerations

1. Use strong JWT secrets
2. Enable HTTPS (automatic on Railway/Vercel)
3. Set up proper CORS policies
4. Regular security updates
5. Monitor for unusual activity

---

Your MediLink application will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.up.railway.app`
