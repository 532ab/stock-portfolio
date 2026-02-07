# Deployment Guide - Vercel

## Frontend (React + Vite)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Framework: **Vite**
   - Root Directory: `.` (or leave blank)
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add: `VITE_API_URL` = your backend URL (e.g., https://your-backend.vercel.app)

4. **Deploy**
   - Click Deploy

---

## Backend (Express + Node)

1. **Create a Vercel project for backend**
   - In Vercel dashboard, create new project
   - Select the same GitHub repository
   - Framework: **Other** (or Node.js)
   - Root Directory: `backend`
   - Build Command: (leave empty or `npm install`)
   - Start Command: `npm start`

2. **Add Environment Variables in Vercel**
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/stock-portfolio
   JWT_SECRET=your-super-secret-key-change-this
   FINNHUB_API_KEY=d1t74k9r01qh0t057ov0d1t74k9r01qh0t057ovg
   ALPHA_VANTAGE_API_KEY=your-alpha-key
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

3. **Deploy Backend**
   - Vercel will automatically deploy on git push

---

## Verify Deployment

1. **Frontend**: Open your Vercel frontend URL
2. **Backend API**: Test with `curl https://your-backend.vercel.app/api/auth`
3. **Sign up/Login**: Test authentication flow
4. **Portfolio**: Add stocks and verify it works end-to-end

---

## Important Notes

⚠️ **Change JWT_SECRET** before going to production!
⚠️ **Secure your MongoDB** with IP whitelisting
⚠️ **Keep API keys safe** - use Vercel environment variables, never commit them
⚠️ **Test thoroughly** before sharing with users

---

## Troubleshooting

**CORS errors?**
- Make sure `FRONTEND_URL` matches your Vercel frontend domain
- Frontend should hit `/api/*` paths (which proxy to backend)

**Stocks not loading?**
- Check Finnhub API key is valid
- Verify MongoDB connection
- Check Vercel logs: `vercel logs`

**Logout not working?**
- Clear browser localStorage
- Check browser console for errors
