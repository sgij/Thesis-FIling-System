# 📁 Project Structure Overview

## Directory Layout

```
html_template/
│
├── .vscode/                    # VS Code workspace settings
│   ├── extensions.json        # Recommended extensions
│   └── settings.json          # Editor configurations
│
├── public/                     # Static assets (copied as-is to dist)
│   └── assets/
│       └── images/            # Image files
│
├── src/                       # Source files
│   ├── css/                   # Stylesheets
│   │   └── style.css         # Main stylesheet
│   │
│   ├── js/                    # JavaScript modules
│   │   └── main.js           # Main application entry
│   │
│   └── index.html            # Main HTML template
│
├── dist/                      # Production build (auto-generated)
│   ├── assets/
│   │   ├── css/              # Compiled CSS
│   │   ├── js/               # Compiled JavaScript
│   │   └── images/           # Optimized images
│   └── index.html            # Built HTML
│
├── node_modules/              # Dependencies (auto-generated)
│
├── .editorconfig             # Editor configuration for consistency
├── .env.example              # Environment variables template
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore rules
├── .prettierrc               # Prettier configuration
├── .prettierignore           # Prettier ignore rules
│
├── CHANGELOG.md              # Version history and changes
├── CONTRIBUTING.md           # Contribution guidelines
├── LICENSE                   # MIT License
├── README.md                 # Project documentation
│
├── jsconfig.json             # JavaScript project configuration
├── package.json              # Project metadata and dependencies
├── pnpm-lock.yaml           # Lock file for pnpm
├── template_config.json      # Template configuration
└── vite.config.js           # Vite bundler configuration
```

## File Purposes

### Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Vite bundler settings, build optimization |
| `jsconfig.json` | JavaScript/TypeScript project settings, path aliases |
| `package.json` | Dependencies, scripts, project metadata |
| `.eslintrc.json` | Code linting rules |
| `.prettierrc` | Code formatting rules |
| `.editorconfig` | Cross-editor coding style settings |
| `.env.example` | Environment variable template |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Project overview, setup instructions |
| `CHANGELOG.md` | Version history and release notes |
| `CONTRIBUTING.md` | Guidelines for contributors |
| `LICENSE` | MIT License terms |

### Source Files

| Directory/File | Purpose |
|----------------|---------|
| `src/index.html` | Main HTML template |
| `src/css/style.css` | Application styles |
| `src/js/main.js` | Main JavaScript application logic |
| `public/` | Static assets served as-is |

## Build Process

1. **Development**: `pnpm dev`
   - Serves from `src/`
   - Hot module replacement
   - No bundling (fast)

2. **Production**: `pnpm build`
   - Bundles and minifies
   - Outputs to `dist/`
   - Optimizes assets
   - Tree-shaking unused code

3. **Preview**: `pnpm preview`
   - Serves production build locally
   - Tests built version

## Best Practices

### Source Files (`src/`)
- Keep all development files here
- Use relative imports
- Organize by feature/type

### Public Assets (`public/`)
- Static files that don't need processing
- Referenced with absolute paths from root
- Copied as-is to dist/

### Configuration
- `.editorconfig` for team consistency
- ESLint for code quality
- Prettier for formatting
- All work together seamlessly

### Version Control
- `.gitignore` excludes build artifacts
- Commit only source files
- `pnpm-lock.yaml` should be committed

## Scripts Reference

```bash
# Development
pnpm dev              # Start dev server

# Building
pnpm build            # Create production build
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Check for errors
pnpm lint:fix         # Fix auto-fixable errors
pnpm format           # Format all files
pnpm format:check     # Check formatting
```

## Migration from Old Structure

**Old Structure:**
```
index.html
style.css
script.js
```

**New Structure:**
```
src/index.html
src/css/style.css
src/js/main.js
```

**Benefits:**
- ✅ Better organization
- ✅ Scalable structure
- ✅ Professional tooling
- ✅ Optimized builds
- ✅ Team collaboration ready
