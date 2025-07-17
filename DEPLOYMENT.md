# Deployment Guide for Render.com

## Quick Fix for Current Error

The error "Couldn't find a package.json file in /opt/render/project/src" occurs because Render is looking in the wrong directory. Here are the solutions:

### Option 1: Manual Render Dashboard Configuration (Recommended)

1. **In your Render dashboard, configure the service settings:**
   - **Root Directory**: Leave blank or set to `./` (not `src`)
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `20.x`

2. **Environment Variables to set in Render Dashboard:**
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://ai_image_db_4l1h_user:vsuXTVGZDtgAAiUYYfaBY85mfKpLbkrE@dpg-d1qf0q3uibrs73elds00-a.oregon-postgres.render.com/ai_image_db_4l1h
   TOGETHER_AI_KEY_1=30007227e495131a87c70d558f56cd54d212c47ab94221f2299e11da832b3166
   TOGETHER_AI_KEY_2=34b44ff37f5f56048ae0475f4acafc05bb8a252c23a2c5797300e166aa5b31d9
   TOGETHER_AI_KEY_3=1d4fb6b33893281cb45c2107ebf4a49744497902500e23a35ef63837d93dcac3
   TOGETHER_AI_KEY_4=dadc74fda1176aa1ab68c129b7cf9805e2f5b3e82fc7c81124db24214133d8f6
   ```

### Option 2: Use render.yaml (Infrastructure as Code)

If you prefer using the render.yaml file, make sure it's in the root directory and your repository structure looks like this:

```
your-repo/
├── package.json          # Must be in root
├── render.yaml          # Must be in root
├── build.sh             # Build script
├── client/              # Frontend code
├── server/              # Backend code
├── shared/              # Shared code
└── ...
```

### Option 3: Use Docker (Alternative)

If the above doesn't work, you can use Docker deployment:

1. **In Render Dashboard:**
   - Choose "Docker" as the environment instead of "Node"
   - Set **Dockerfile Path**: `./Dockerfile`
   - Leave other settings as default

## Database Setup

The PostgreSQL database is already configured. The app will automatically create the required tables on first run.

## Important Notes

1. **Make sure package.json is in the root directory** - This is the most common cause of the error
2. **Use npm instead of yarn** - The build commands are configured for npm
3. **Database SSL** - The app is configured to handle SSL connections to Render PostgreSQL
4. **CORS** - Already configured for production deployment

## Troubleshooting

If you still get the package.json error:
1. Check that your GitHub repository has package.json in the root directory
2. In Render dashboard, ensure "Root Directory" is blank or set to `./`
3. Try redeploying with manual configuration instead of render.yaml

## Testing the Deployment

Once deployed, test these endpoints:
- `GET /api/api-key-status` - Should return API key statuses
- `GET /api/generated-images` - Should return empty array initially
- `POST /api/generate-image` - Should generate an image