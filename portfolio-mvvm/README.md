# Portfolio - MVVM Architecture

A modern, minimalistic 3D portfolio website built with TypeScript following MVVM (Model-View-ViewModel) architecture principles.

## Architecture

This project follows Clean Architecture with MVVM pattern:

### Domain Layer (`src/domain`)
- **Models**: Core business entities (Project, Skill, Education, etc.)
- **Interfaces**: Repository contracts and domain logic

### Presentation Layer (`src/presentation`)
- **Views**: UI components and templates
- **ViewModels**: Presentation logic, state management, and data binding

### Infrastructure Layer (`src/infrastructure`)
- **Services**: External services (3D rendering, storage, theme management)
- **Repositories**: Data access implementations

### Utilities (`src/utils`)
- Helper functions, constants, and shared utilities

## Tech Stack

- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Three.js**: 3D graphics and animations
- **Vanilla TS**: No framework dependencies for maximum control
- **MVVM Pattern**: Clear separation of concerns

## Design System

### Color Palette (Nocturne & Gold)
- Primary Gold: `#efe0c9` / `#d2c4ae`
- Background: `#141312` / `#0E0E0E`
- Surface: `#1d1b1a` / `#211f1e`
- Outline: `#979086` / `#4b463e`

### Typography
- **Display/Headings**: Cormorant Garamond (serif)
- **Body/UI**: Inter (sans-serif)

### Principles
- High-Sensory Minimalism
- Tactile Digitalism
- Bento Grid Layout System

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
portfolio-mvvm/
├── src/
│   ├── domain/
│   │   ├── models/           # Business entities
│   │   └── interfaces/       # Domain contracts
│   ├── presentation/
│   │   ├── views/            # UI components
│   │   └── viewmodels/       # Presentation logic
│   ├── infrastructure/
│   │   ├── services/         # External services
│   │   └── repositories/     # Data access
│   ├── utils/                # Shared utilities
│   ├── styles/               # Global styles
│   └── main.ts               # Application entry point
├── public/                   # Static assets
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Features

- 🎨 Modern minimalistic design with dark theme
- 🎭 3D hero section with Three.js
- 📱 Fully responsive
- 🔄 Smooth scroll animations
- 💾 Local storage for dark mode preference
- ⚡ Fast performance with Vite
- 🎯 Type-safe with TypeScript
- 🏗️ Clean MVVM architecture

## License

All rights reserved © 2026
