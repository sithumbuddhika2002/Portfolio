# Modern Portfolio with Admin Dashboard

A stunning, animated portfolio website with a powerful admin dashboard built using **React**, **Vite**, **TypeScript**, and **Tailwind CSS**. All data is persisted in localStorage - no backend required!

## ✨ Features

### Portfolio Website
- 🎨 **Modern, Animated Design** - Smooth animations, gradients, and glassmorphism effects
- 🌓 **Dark Mode** - Seamless light/dark theme switching
- 📱 **Fully Responsive** - Beautiful on all devices
- 🎯 **Sections**:
  - Hero section with animated background
  - About section with profile info
  - Skills showcase with animated progress bars
  - Project gallery with filtering and modals
  - Experience timeline
  - Contact form with validation

### Admin Dashboard
- 🔐 **Secure Login** - localStorage-based authentication
- 📝 **Profile Editor** - Update personal information and bio
- ⚙️ **Skills Management** - Add, edit, delete skills with categories
- 🎨 **Projects Manager** - Full CRUD for projects with images and technologies
- 💼 **Experience Editor** - Manage work history and education
- 🔧 **Settings** - Configure social links, credentials, and site settings
- 📤 **Data Export/Import** - Backup and restore your data as JSON
- 🔄 **Reset Functionality** - Return to demo data anytime

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ **Important**: Change these credentials after your first login in the Settings page!

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── components/
│   │   ├── common/           # Shared components (Navbar)
│   │   └── portfolio/        # Portfolio sections
│   ├── pages/
│   │   ├── Portfolio.tsx     # Main portfolio page
│   │   └── admin/            # Admin pages
│   ├── services/             # Business logic
│   │   ├── storage.ts        # localStorage management
│   │   └── auth.ts           # Authentication
│   ├── hooks/                # Custom React hooks
│   ├── contexts/             # React contexts (Dark mode)
│   ├── types/                # TypeScript definitions
│   ├── data/                 # Initial data
│   └── App.tsx               # Main app with routing
├── tailwind.config.js        # Tailwind configuration
└── vite.config.ts            # Vite configuration
```

## 🎨 Customization

### Using the Admin Dashboard

1. Navigate to `/admin/login`
2. Login with default credentials
3. Edit your portfolio content:
   - **Profile**: Personal info, bio, contact details
   - **Skills**: Add your technical skills with proficiency levels
   - **Projects**: Showcase your work with images and descriptions
   - **Experience**: Add work history and education
   - **Settings**: Update social links and site metadata

### Editing Directly

All portfolio data is stored in `src/data/initialData.ts`. You can edit this file directly if preferred.

## 🛠️ Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling with custom design system
- **Framer Motion** - Animations
- **React Router v6** - Routing
- **Heroicons** - Beautiful icons
- **Local Storage** - Data persistence

## 🎯 Key Features Explained

### LocalStorage Data Management

All portfolio data is stored in the browser's localStorage, making this a completely frontend solution. The data structure is defined in `src/types/portfolio.ts` and managed through `src/services/storage.ts`.

### Animation System

- Custom Tailwind animations defined in `tailwind.config.js`
- Framer Motion for complex entrance and interaction animations
- Smooth scroll behavior for navigation
- Glassmorphism effects for modern UI

### Dark Mode

Implemented using React Context (`src/contexts/DarkModeContext.tsx`) with localStorage persistence. Toggle it from the navbar on any page.

### Responsive Design

Mobile-first approach with Tailwind's responsive utilities ensuring the portfolio looks great on:
- Mobile phones (< 640px)
- Tablets (640px - 1024px)
- Desktops (> 1024px)

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
npm run build

# Deploy the 'dist' folder to Netlify
```

### GitHub Pages

Update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
})
```

Then build and deploy the `dist` folder.

## 🔐 Security Note

Since this uses localStorage for authentication, it's suitable for personal portfolios where you're the only admin. For production applications with multiple users, implement proper backend authentication.

## 📝 Data Backup

Always backup your portfolio data:

1. Go to `/admin/dashboard/settings`
2. Click "Export Data"
3. Save the JSON file securely
4. Import it later to restore your data

## 🤝 Contributing

Feel free to fork this project and customize it for your needs!

## 📄 License

MIT License - feel free to use this for your personal portfolio!

## 🎉 Credits

Built with ❤️ using modern web technologies.

---

**Need help?** Check the code comments or modify `src/data/initialData.ts` to update the demo content!
