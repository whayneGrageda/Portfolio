# Portfolio MVVM - Architecture Documentation

## Overview

This portfolio website follows the **MVVM (Model-View-ViewModel)** architectural pattern with Clean Architecture principles. The application is built using TypeScript, Three.js for 3D graphics, and Vite as the build tool.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Views                           ViewModels                  │
│  ├── HomeView.ts                ├── HomeViewModel.ts         │
│  └── ProjectDetailView.ts       └── ProjectDetailViewModel.ts│
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       Domain Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Models                          Interfaces                  │
│  ├── Project.ts                 ├── IProjectRepository.ts    │
│  ├── Skill.ts                   └── ISkillRepository.ts      │
│  └── Theme.ts                                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Repositories                    Services                    │
│  ├── ProjectRepository.ts       ├── ThemeService.ts          │
│  └── SkillRepository.ts         ├── ThreeDService.ts         │
│                                  └── ScrollService.ts         │
└─────────────────────────────────────────────────────────────┘
```

## Layers

### 1. Domain Layer (`src/domain/`)

The **Domain Layer** contains the core business logic and entities. It is completely independent of any framework or external concerns.

#### Models (`src/domain/models/`)
- **Project.ts**: Represents a portfolio project entity
- **Skill.ts**: Represents technical skills and proficiencies
- **Theme.ts**: Represents the application theme configuration

#### Interfaces (`src/domain/interfaces/`)
- **IProjectRepository.ts**: Contract for project data access
- **ISkillRepository.ts**: Contract for skill data access

**Key Principles:**
- Pure TypeScript - no framework dependencies
- Business rules and entities
- Defines contracts (interfaces) that outer layers implement

### 2. Infrastructure Layer (`src/infrastructure/`)

The **Infrastructure Layer** implements the interfaces defined in the Domain Layer and handles external concerns.

#### Repositories (`src/infrastructure/repositories/`)
- **ProjectRepository.ts**: Implements IProjectRepository
- **SkillRepository.ts**: Implements ISkillRepository

**Responsibilities:**
- Data access and persistence
- External API communication (if needed)
- Data transformation

#### Services (`src/infrastructure/services/`)
- **ThemeService.ts**: Manages theme state and localStorage persistence
- **ThreeDService.ts**: Manages Three.js scene, camera, and 3D animations
- **ScrollService.ts**: Handles smooth scroll navigation between sections

**Responsibilities:**
- External service integration
- Complex infrastructure logic
- Hardware/DOM interactions

### 3. Presentation Layer (`src/presentation/`)

The **Presentation Layer** handles all user interface concerns and user interactions.

#### ViewModels (`src/presentation/viewmodels/`)
- **HomeViewModel.ts**: Presentation logic for home page
- **ProjectDetailViewModel.ts**: Presentation logic for project details

**Responsibilities:**
- Presentation logic and state management
- Coordinate between repositories/services and views
- Transform domain models into view-friendly data
- Handle user input and events
- No direct DOM manipulation

#### Views (`src/presentation/views/`)
- **HomeView.ts**: Renders home page UI and handles DOM interactions

**Responsibilities:**
- DOM manipulation and rendering
- Event binding
- UI updates based on ViewModel state
- No business logic

## Data Flow

### 1. User Interaction Flow

```
User Action
    ↓
View captures event
    ↓
View calls ViewModel method
    ↓
ViewModel coordinates with Repositories/Services
    ↓
Repository/Service returns data
    ↓
ViewModel updates state
    ↓
ViewModel notifies View
    ↓
View re-renders
```

### 2. Initialization Flow

```
main.ts
    ↓
Instantiate Services (ThemeService, ThreeDService, ScrollService)
    ↓
Instantiate Repositories (ProjectRepository, SkillRepository)
    ↓
Instantiate ViewModel (HomeViewModel)
    ↓
Instantiate View (HomeView)
    ↓
View renders initial state
    ↓
View subscribes to ViewModel state changes
```

## Key Design Patterns

### 1. MVVM (Model-View-ViewModel)

**Benefits:**
- Clear separation of concerns
- Testable presentation logic
- Reactive UI updates through state management

### 2. Repository Pattern

**Benefits:**
- Abstraction over data access
- Easy to swap implementations
- Centralized data logic

### 3. Dependency Injection

**Benefits:**
- Loose coupling
- Easy to test
- Flexible architecture

### 4. Observer Pattern

**Implementation:**
- ViewModels use a simple pub/sub mechanism
- Views subscribe to ViewModel state changes
- Automatic UI updates when state changes

```typescript
// Subscribe to changes
viewModel.subscribe(() => {
  this.update();
});

// ViewModel notifies subscribers
private notifyChange(): void {
  if (this.onStateChange) {
    this.onStateChange();
  }
}
```

## Folder Structure

```
src/
├── domain/                    # Business logic and entities
│   ├── models/               # Domain models
│   │   ├── Project.ts
│   │   ├── Skill.ts
│   │   └── Theme.ts
│   └── interfaces/           # Repository interfaces
│       ├── IProjectRepository.ts
│       └── ISkillRepository.ts
├── infrastructure/           # Implementation details
│   ├── repositories/        # Data access implementations
│   │   ├── ProjectRepository.ts
│   │   └── SkillRepository.ts
│   └── services/            # External services
│       ├── ThemeService.ts
│       ├── ThreeDService.ts
│       └── ScrollService.ts
├── presentation/            # UI and presentation logic
│   ├── viewmodels/         # Presentation logic
│   │   ├── HomeViewModel.ts
│   │   └── ProjectDetailViewModel.ts
│   └── views/              # UI components
│       └── HomeView.ts
├── utils/                  # Shared utilities
│   └── constants.ts
├── styles/                 # Global styles
│   └── main.css
└── main.ts                 # Application entry point
```

## Benefits of This Architecture

1. **Maintainability**: Clear separation makes it easy to locate and modify code
2. **Testability**: Each layer can be tested independently
3. **Scalability**: Easy to add new features without affecting existing code
4. **Flexibility**: Easy to swap implementations (e.g., change data source)
5. **Reusability**: ViewModels and Services can be reused across different views

## Testing Strategy

### Unit Tests
- **Models**: Test entity creation and validation
- **ViewModels**: Test presentation logic and state management
- **Repositories**: Test data access and transformation
- **Services**: Test service logic and external integrations

### Integration Tests
- Test ViewModel + Repository interactions
- Test View + ViewModel data binding
- Test end-to-end user flows

## Future Enhancements

1. **State Management**: Add a centralized state management solution (e.g., MobX, Zustand)
2. **Routing**: Implement client-side routing for multiple pages
3. **API Integration**: Connect to a real backend API
4. **Testing**: Add comprehensive unit and integration tests
5. **PWA**: Add Progressive Web App capabilities
6. **Animations**: Enhance scroll animations and transitions
7. **Accessibility**: Improve keyboard navigation and screen reader support

## Dependencies

- **Three.js**: 3D graphics rendering
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server

## Development Commands

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

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

All rights reserved © 2026
