# Portfolio MVVM - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

1. **Navigate to the project directory:**
```bash
cd portfolio-mvvm
```

2. **Install dependencies:**
```bash
npm install
```

## Development

**Start the development server:**
```bash
npm run dev
```

This will start Vite dev server at `http://localhost:5173` (or another available port).

## Project Structure Overview

```
portfolio-mvvm/
├── src/
│   ├── domain/              # Business logic (Models, Interfaces)
│   ├── infrastructure/      # Implementation (Repositories, Services)
│   ├── presentation/        # UI (Views, ViewModels)
│   ├── styles/             # Global CSS
│   └── main.ts             # Entry point
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── vite.config.ts          # Vite config
```

## Key Features

### ✅ Already Implemented

1. **MVVM Architecture** - Clean separation of concerns
2. **3D Hero Section** - Three.js animated geometric shapes
3. **Dark Theme** - Nocturne & Gold color palette (default)
4. **Smooth Scroll** - Section-based scroll navigation
5. **Theme Toggle** - Dark/Light mode with localStorage
6. **Projects Section** - FaceTrack & NUQuest featured
7. **Skills Section** - Categorized technical skills
8. **Responsive Design** - Mobile-friendly layout

### 📝 Content Placeholders

The following content uses sample data and placeholders:

- Project images (not included - add your own)
- Contact links (update in `HomeView.ts`)
- GitHub/LinkedIn URLs (update in footer)

## Customization

### 1. Update Projects

Edit `src/infrastructure/repositories/ProjectRepository.ts`:

```typescript
private initializeProjects(): Project[] {
  return [
    createProject({
      id: 'your-project',
      title: 'Your Project',
      subtitle: 'Project Subtitle',
      description: 'Description here...',
      // ... more fields
    })
  ];
}
```

### 2. Update Skills

Edit `src/infrastructure/repositories/SkillRepository.ts`:

```typescript
private initializeSkills(): Skill[] {
  return [
    { id: '1', name: 'Your Skill', category: SkillCategory.FRONTEND, ... }
  ];
}
```

### 3. Update Contact Info

Edit `src/presentation/views/HomeView.ts` - `renderContactSection()` method:

```typescript
<a href="mailto:your-email@example.com" class="contact-link">Email</a>
<a href="https://github.com/your-username" ...>GitHub</a>
```

### 4. Customize Colors

The theme uses the Nocturne & Gold design system. To customize:

Edit `src/infrastructure/services/ThemeService.ts`:

```typescript
private getDarkColors(): ThemeColors {
  return {
    primary: '#your-color',
    // ... more colors
  };
}
```

### 5. Modify 3D Element

Edit `src/infrastructure/services/ThreeDService.ts` - `createGeometry()` method to change the 3D shapes.

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Preview Production Build

```bash
npm run preview
```

## Deployment

The production build (`dist/` folder) can be deployed to:

- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `dist/` folder
- **GitHub Pages**: Push `dist/` to `gh-pages` branch
- **Any static host**: Upload `dist/` contents

## Troubleshooting

### Port already in use
```bash
# Vite will automatically try the next available port
# Or specify a port:
npm run dev -- --port 3000
```

### TypeScript errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
# Check TypeScript compilation
npx tsc --noEmit
```

## Architecture

This project follows **MVVM (Model-View-ViewModel)** pattern with Clean Architecture principles.

See `ARCHITECTURE.md` for detailed documentation.

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start dev server: `npm run dev`
3. 📝 Update project content in repositories
4. 📝 Add your actual project images
5. 📝 Update contact information
6. 🎨 Customize colors/theme (optional)
7. 🚀 Build and deploy

## Support

For questions or issues:
- Check `ARCHITECTURE.md` for architecture details
- Review `README.md` for project overview
- Inspect code comments for implementation details

---

Happy coding! 🚀
