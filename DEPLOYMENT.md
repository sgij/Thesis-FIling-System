# 🚀 Deployment Guide

## Quick Deploy Options

### Option 1: Netlify (Recommended)

1. **Install Netlify CLI (Optional)**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   pnpm build
   ```

3. **Deploy via Drag & Drop**
   - Go to [Netlify Drop](https://app.netlify.com/drop)
   - Drag your `dist/` folder
   - Done! ✅

4. **Or use CLI**
   ```bash
   netlify deploy --prod --dir=dist
   ```

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 2: Vercel

1. **Install Vercel CLI (Optional)**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

### Option 3: GitHub Pages

1. **Add to package.json**:
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     },
     "devDependencies": {
       "gh-pages": "^6.1.0"
     }
   }
   ```

2. **Update `vite.config.js`**:
   ```javascript
   export default defineConfig({
     base: '/repository-name/', // Your GitHub repo name
     // ... rest of config
   });
   ```

3. **Deploy**:
   ```bash
   pnpm build
   pnpm deploy
   ```

4. **Enable GitHub Pages**:
   - Go to repository Settings
   - Pages → Source: gh-pages branch
   - Save

---

### Option 4: Traditional Web Hosting

1. **Build the project**
   ```bash
   pnpm build
   ```

2. **Upload `dist/` contents via FTP/SFTP**
   - Use FileZilla, Cyberduck, or hosting panel
   - Upload all files from `dist/` to public_html or www

3. **Configure .htaccess (Apache)** for SPA routing:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

### Option 5: Docker

**Dockerfile**:
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Build and run**:
```bash
docker build -t stclare-filing .
docker run -p 8080:80 stclare-filing
```

---

## Pre-Deployment Checklist

- [ ] Run `pnpm build` successfully
- [ ] Test with `pnpm preview`
- [ ] Check all links and assets load correctly
- [ ] Test on different browsers
- [ ] Update environment variables if needed
- [ ] Update base URL in vite.config.js if needed
- [ ] Verify all features work in production build
- [ ] Check mobile responsiveness
- [ ] Test theme switching
- [ ] Verify file upload/download functionality

## Performance Optimization

### Before Deploy

1. **Optimize images**
   ```bash
   # Use tools like:
   - TinyPNG
   - Squoosh
   - ImageOptim
   ```

2. **Check bundle size**
   ```bash
   pnpm build
   # Check dist/ folder size
   ```

3. **Enable compression**
   - Gzip/Brotli on server
   - Most platforms enable automatically

### CDN Integration

For better performance, consider using CDN for static assets:

1. Upload `dist/assets/` to CDN
2. Update URLs in built files
3. Enable caching headers

## Monitoring

### Set up analytics (optional)

Add to `index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Custom Domain

1. **Netlify/Vercel**
   - Add custom domain in dashboard
   - Update DNS records as instructed
   - SSL automatically provisioned

2. **GitHub Pages**
   - Add CNAME file to public/ folder
   - Configure DNS: CNAME → username.github.io

3. **Traditional Hosting**
   - Point domain to hosting server IP
   - Configure SSL certificate

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
pnpm install
pnpm build
```

### Assets Not Loading
- Check base URL in vite.config.js
- Verify paths are relative
- Check browser console for errors

### Routing Issues
- Ensure server redirects to index.html
- Check .htaccess or nginx.conf

## Security

1. **Environment Variables**
   - Never commit `.env` files
   - Use platform-specific env vars in production

2. **Headers**
   Add security headers via netlify.toml or vercel.json:
   ```toml
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-Content-Type-Options = "nosniff"
       X-XSS-Protection = "1; mode=block"
       Referrer-Policy = "strict-origin-when-cross-origin"
   ```

## Support

For deployment issues:
- Check platform documentation
- Review build logs
- Test locally with `pnpm preview`
- Open an issue in the repository

---

**Happy Deploying! 🎉**
