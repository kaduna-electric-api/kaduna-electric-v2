# Demo Deployment Guide

> This project is a demo. It simulates token vending; it does not issue valid utility tokens or support live Paystack charges.

## Backend deployment (Render)

1. Push this repository to GitHub.
2. Create a new Web Service on Render and connect the repository.
3. Set the root directory to `backend`.
4. Use the following build and start commands:
   - Build: `npm install`
   - Start: `npm start`
5. Add the demo environment variables from `backend/.env.example`.
6. Set `NODE_ENV=production` and `FRONTEND_URL` to your deployed frontend URL.

## Frontend deployment (Vercel)

1. Import the repository into Vercel.
2. Set the root directory to `frontend`.
3. Use these build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. Set `VITE_API_URL` to your deployed backend URL, for example:
   - `https://your-render-app.onrender.com/api`
5. To enable Paystack test checkout, configure the backend with an `sk_test_` secret key.

## Demo deployment notes

- Keep `.env` files out of version control.
- Use HTTPS for hosted demos.
- Restrict MongoDB access to trusted IPs.
- Verify `FRONTEND_URL` is a real deployed domain, not `localhost`.
- Paystack live secret keys are rejected by the backend; use test keys only.
- Generated sample tokens are not valid for recharging a real meter.

## Example hosted demo values

Backend:

```env
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-app.vercel.app
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/kaduna-electric
JWT_SECRET=replace-with-a-long-random-string
PAYMENT_MODE=demo
ADMIN_SECRET_KEY=replace-with-a-strong-admin-key
```

Frontend:

```env
VITE_API_URL=https://your-render-app.onrender.com/api
```
