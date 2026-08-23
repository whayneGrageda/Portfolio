# Portfolio Color Palette

## Nocturne & Gold Theme

### Dark Mode (Default)
```css
:root {
  /* Primary Colors */
  --color-primary: #efe0c9;              /* Gold/Cream - main accent */
  --color-primary-container: #d2c4ae;    /* Muted gold - secondary accent */
  --color-on-primary: #382f20;           /* Dark brown - text on primary */

  /* Background Colors */
  --color-background: #0E0E0E;           /* Pure black - main background */
  --color-surface: #141312;              /* Dark gray - surface elements */
  --color-surface-dim: #141312;          /* Surface dim variant */
  --color-surface-container: #211f1e;    /* Container backgrounds */

  /* Text Colors */
  --color-on-surface: #e7e1de;           /* Light cream - primary text */
  --color-on-surface-variant: #cec5ba;   /* Muted cream - secondary text */

  /* Border Colors */
  --color-outline: #979086;              /* Medium gray - borders */
  --color-outline-variant: #4b463e;      /* Dark gray - subtle borders */
}
```

### Light Mode (Alternative)
```css
:root[data-theme="light"] {
  /* Primary Colors */
  --color-primary: #8b7355;              /* Dark gold/brown - main accent */
  --color-primary-container: #d2c4ae;    /* Light gold - secondary accent */
  --color-on-primary: #ffffff;           /* White - text on primary */

  /* Background Colors */
  --color-background: #fefcf8;           /* Warm white - main background */
  --color-surface: #f5f1ed;              /* Cream white - surface elements */
  --color-surface-dim: #ede8e3;          /* Dimmed surface variant */
  --color-surface-container: #e8e3dd;    /* Container backgrounds */

  /* Text Colors */
  --color-on-surface: #201d1a;           /* Dark brown - primary text */
  --color-on-surface-variant: #4b463e;   /* Medium brown - secondary text */

  /* Border Colors */
  --color-outline: #797066;              /* Medium brown - borders */
  --color-outline-variant: #cec5ba;      /* Light brown - subtle borders */
}
```

## Color Usage Guide

### Primary Gold (`#efe0c9`)
- Navigation active states
- Call-to-action buttons
- Hero labels and highlights
- Footer headings
- Certification icons

### Secondary Gold (`#d2c4ae`)
- Button primary backgrounds  
- Hero labels (muted)
- Skill icons
- Quote text
- Badge accents

### Background Hierarchy
1. **Main Background** (`#0E0E0E`) - Page background
2. **Surface** (`#141312`) - Card backgrounds
3. **Surface Container** (`#211f1e`) - Elevated elements
4. **Surface Hover** (`#1C1C1A`) - Interactive states

### Text Hierarchy
1. **Primary Text** (`#e7e1de`) - Headings, important content
2. **Secondary Text** (`#cec5ba`) - Body text, descriptions
3. **Tertiary Text** (`#979086`) - Labels, metadata

### Interactive States
- **Default Border**: `#292927`
- **Hover Border**: `#D2C4AE` (primary gold)
- **Active Border**: `#4b463e` (outline variant)

## Robot 3D Colors

### Robot Materials
```javascript
// Gold Material (Head, Body, Feet)
const goldMaterial = new THREE.MeshPhongMaterial({
  color: 0xD2C4AE,        // Primary container gold
  emissive: 0x1a1510,     // Dark gold emissive
  shininess: 30,
  specular: 0x666666
});

// Dark Material (Neck, Legs, Panels)
const darkMaterial = new THREE.MeshPhongMaterial({
  color: 0x1a1510,        // Dark brown/black
  emissive: 0x000000,     // No emissive
  shininess: 10
});

// Eye Material (Glowing)
const eyeMaterial = new THREE.MeshPhongMaterial({
  color: 0xD2C4AE,
  emissive: 0xD2C4AE,     // Self-illuminated gold
  emissiveIntensity: 0.5
});
```

## Implementation Notes

- **Theme System**: Colors are managed by `ThemeService.ts`
- **CSS Variables**: All colors use CSS custom properties for easy theming
- **Accessibility**: Contrast ratios meet WCAG standards
- **Consistency**: Same palette across all components and 3D elements
- **Animation**: Smooth transitions (0.3s ease) between color states

## Gradient Examples

### Glass Effect (Legacy)
```css
/* Head gradient */
background: linear-gradient(135deg, rgba(210, 196, 174, 0.3) 0%, rgba(210, 196, 174, 0.15) 100%);

/* Body gradient */
background: linear-gradient(135deg, rgba(210, 196, 174, 0.25) 0%, rgba(210, 196, 174, 0.1) 100%);
```

### Button Gradients
```css
/* Primary button */
background-color: #D2C4AE;
/* Hover state */
background-color: #e7e1de;

/* Ghost button */
background-color: transparent;
border: 1px solid #292927;
/* Hover state */
border-color: #D2C4AE;
```