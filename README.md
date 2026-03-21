# St. Clare College Filing System

A modern, feature-rich document management system built with vanilla JavaScript, HTML5, and CSS3.

## 🚀 Features

- **Modern UI/UX**: Clean, professional interface with dark/light theme support
- **File Management**: Upload, organize, and manage documents efficiently
- **Search Functionality**: Fast global search across all documents
- **Security**: Password protection with encryption options
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Statistics**: Dashboard with file analytics and storage info
- **Drag & Drop**: Intuitive file upload experience

## 📁 Project Structure

```
html_template/
├── src/                    # Source files
│   ├── css/               # Stylesheets
│   │   └── style.css
│   ├── js/                # JavaScript modules
│   │   └── main.js
│   └── index.html         # Main HTML file
├── public/                # Static assets
│   └── assets/
│       └── images/        # Image files
├── dist/                  # Production build (generated)
├── node_modules/          # Dependencies (auto-generated)
├── package.json           # Project dependencies
├── pnpm-lock.yaml        # Lock file
├── vite.config.js        # Vite configuration
└── README.md             # This file
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd html_template
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

### Development

Start the development server:
```bash
pnpm dev
# or
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

Create an optimized production build:
```bash
pnpm build
# or
npm run build
```

### Preview Production Build

Preview the production build locally:
```bash
pnpm preview
# or
npm run preview
```

## 🎨 Customization

### Themes

The application supports both dark and light themes. Toggle between themes using the moon/sun icon in the navigation bar.

### Colors

Modify CSS variables in `src/css/style.css` to customize the color scheme:
```css
:root {
    --accent-primary: #3b82f6;
    --accent-secondary: #8b5cf6;
    /* ... more variables */
}
```

## 💾 Data Storage

The application uses browser LocalStorage to persist data. No server-side storage is required.

## 🔒 Security Features

- Optional password protection for files
- Password strength indicator
- Encrypted file storage option
- Secure file access controls

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ for St. Clare College**
