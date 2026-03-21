# ⚡ Quick Start Guide

Welcome to the **St. Clare College Filing System**! Get up and running in minutes.

## 📋 Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **pnpm** (recommended) - Install: `npm install -g pnpm`

## 🚀 Installation (60 seconds)

```bash
# 1. Navigate to project folder
cd html_template

# 2. Install dependencies (first time only)
pnpm install

# 3. Start development server
pnpm dev
```

That's it! Your app should open automatically at `http://localhost:5173` 🎉

## 🎯 Common Tasks

### Development
```bash
pnpm dev              # Start dev server (with hot reload)
```

### Building for Production
```bash
pnpm build            # Creates optimized build in dist/
pnpm preview          # Preview production build
```

### Code Quality
```bash
pnpm lint             # Check for code issues
pnpm format           # Auto-format code
```

## 📁 File Structure (Where Things Are)

```
src/
├── index.html        # Main HTML file (edit this)
├── css/
│   └── style.css    # All your styles
└── js/
    └── main.js      # All your JavaScript
```

**Important:** Only edit files in the `src/` folder!

## ✏️ Making Changes

1. **Edit HTML**: Open `src/index.html`
2. **Edit CSS**: Open `src/css/style.css`
3. **Edit JavaScript**: Open `src/js/main.js`
4. **Save** - Changes appear instantly in browser!

## 🎨 Customization

### Change Colors
Edit CSS variables in `src/css/style.css`:
```css
:root {
  --accent-primary: #3b82f6;    /* Change to your color */
  --accent-secondary: #8b5cf6;  /* Change to your color */
}
```

### Change Title
In `src/index.html`:
```html
<title>Your Custom Title</title>
```

## 🌐 Deploying (Going Live)

### Easiest: Netlify Drop
1. Run `pnpm build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `dist/` folder
4. Done! You get a live URL instantly

### Other Options
See [DEPLOYMENT.md](DEPLOYMENT.md) for GitHub Pages, Vercel, etc.

## 💡 Tips

- **Save automatically**: Changes reload instantly in browser
- **Browser console**: Press F12 to see errors
- **Mobile testing**: Resize browser or use DevTools
- **Dark/Light mode**: Click moon/sun icon in app

## 🐛 Troubleshooting

### Port already in use?
```bash
# Stop other dev servers or change port in vite.config.js
```

### Changes not showing?
```bash
# Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Build errors?
```bash
# Clear and reinstall
rm -rf node_modules dist
pnpm install
pnpm build
```

### Still stuck?
1. Check browser console (F12) for errors
2. Read error messages carefully
3. Open an issue on GitHub

## 📚 Next Steps

- [ ] Read [README.md](README.md) for full documentation
- [ ] Explore [STRUCTURE.md](STRUCTURE.md) to understand organization
- [ ] Check [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute
- [ ] Review [DEPLOYMENT.md](DEPLOYMENT.md) when ready to deploy

## 🎓 Learning Resources

- **Vite**: https://vitejs.dev/guide/
- **Modern JavaScript**: https://javascript.info/
- **CSS**: https://web.dev/learn/css/

## ⚙️ Project Info

- **Framework**: Vanilla HTML/CSS/JavaScript
- **Bundler**: Vite
- **Package Manager**: pnpm
- **License**: MIT

## 🆘 Need Help?

- Check documentation files in project root
- Open an issue on GitHub
- Review code comments in source files

---

**You're all set! Happy coding! 🚀**

*Built with ❤️ for St. Clare College*
