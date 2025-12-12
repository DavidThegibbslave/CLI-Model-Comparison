# UI Design System Documentation

## Overview

The CryptoMarket frontend implements a comprehensive design system built with TailwindCSS and custom design tokens. The system supports both light and dark themes and follows accessibility best practices.

---

## Design Tokens

### Colors

#### Primary (Blue)
Trust, stability, technology
- **50**: #eff6ff (very light)
- **500**: #3b82f6 (base)
- **900**: #1e3a8a (very dark)

#### Secondary (Purple/Indigo)
Crypto theme, innovation
- **50**: #faf5ff
- **500**: #a855f7
- **900**: #581c87

#### Success (Green)
Positive price changes, profits
- **500**: #22c55e

#### Danger (Red)
Negative price changes, losses
- **500**: #ef4444

### Typography

**Font Family**:
- Sans: Inter (Google Fonts)
- Mono: Fira Code

**Font Sizes**:
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px
- xl: 20px
- 2xl: 24px
- 3xl: 30px
- 4xl: 36px

**Font Weights**:
- light: 300
- normal: 400
- medium: 500
- semibold: 600
- bold: 700

### Spacing

Based on 4px unit system:
- 1: 4px
- 2: 8px
- 3: 12px
- 4: 16px
- 5: 20px
- 6: 24px
- 8: 32px
- 10: 40px
- 12: 48px

### Border Radius

- sm: 4px
- base: 6px
- md: 8px
- lg: 12px
- xl: 16px
- 2xl: 24px
- full: 9999px

### Shadows

- sm: Subtle shadow for cards
- md: Medium shadow for elevated elements
- lg: Large shadow for modals
- xl: Extra large shadow for dropdowns

---

## Components

### Button

**Variants**:
- `primary`: Blue background, white text
- `secondary`: Purple background, white text
- `success`: Green background, white text
- `danger`: Red background, white text
- `ghost`: Transparent background, gray text
- `outline`: Transparent with colored border

**Sizes**: sm, md, lg

**States**: default, hover, focus, disabled, loading

**Usage**:
```tsx
<Button variant="primary" size="md" isLoading={false}>
  Click Me
</Button>
```

### Input

**Features**:
- Label support
- Error states
- Helper text
- Left/right icons
- Size variants (sm, md, lg)

**Types**: text, email, password, number, search

**Usage**:
```tsx
<Input
  label="Email"
  inputType="email"
  error="Invalid email"
  helperText="Enter your email address"
  required
/>
```

### Card

**Features**:
- Responsive padding
- Hover states
- White/dark mode support
- Clickable variants

**Usage**:
```tsx
<Card hover padding="md">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Modal

**Features**:
- ESC key to close
- Click outside to close
- Size variants (sm, md, lg, xl)
- Optional footer
- Body scroll lock

**Usage**:
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
  size="md"
  footer={<DefaultModalFooter onCancel={onClose} onConfirm={onConfirm} />}
>
  Modal content
</Modal>
```

### Loading

**Variants**:
- Spinner (sm, md, lg, xl sizes)
- Skeleton loaders
- Table skeleton
- Full-screen loading

**Usage**:
```tsx
<Loading size="md" text="Loading..." />
<Skeleton count={3} />
<TableSkeleton rows={5} columns={4} />
```

### Toast

**Types**: success, error, warning, info

**Features**:
- Auto-dismiss (configurable duration)
- Manual close
- Icon + title + message
- Position variants
- Stacking support

**Usage**:
```tsx
const { showSuccess, showError } = useToast();
showSuccess('Success!', 'Operation completed');
showError('Error!', 'Something went wrong');
```

---

## Layouts

### Header

**Features**:
- Logo
- Navigation links (Desktop)
- Theme toggle
- Auth actions (Login/Logout)
- Mobile menu (hamburger)
- Sticky positioning

**Responsive**:
- Desktop: Horizontal nav with all links
- Mobile: Hamburger menu with dropdown

### Footer

**Features**:
- Brand section
- Quick links
- Resources
- Legal disclaimer
- Copyright

### Layout Wrapper

Combines Header + Content + Footer with proper spacing and flexbox.

---

## Theme System

### Light Theme

- Background: #ffffff
- Foreground: #111827
- Card: #ffffff
- Border: #e5e7eb

### Dark Theme

- Background: #030712
- Foreground: #f9fafb
- Card: #111827
- Border: #374151

### Theme Toggle

Persists to localStorage, respects system preference, applies via CSS classes.

---

## Accessibility

- **Keyboard Navigation**: All interactive elements accessible via Tab
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG 2.1 AA compliant
- **Focus States**: Visible focus rings on all interactive elements
- **Alt Text**: Images and icons have descriptive alt text

---

## Responsive Design

### Breakpoints

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Mobile-First Approach

Base styles for mobile, progressively enhanced for larger screens.

---

## Utilities

### Price Change Indicators

```tsx
<span className="price-up">+2.5%</span>  // Green
<span className="price-down">-1.2%</span> // Red
```

### Gradient Text

```tsx
<h1 className="gradient-text">CryptoMarket</h1>
```

### Animations

- `animate-spin`: Loading spinner
- `animate-fade-in`: Fade in effect
- `animate-shimmer`: Shimmer effect for loading states

---

## Best Practices

1. **Consistency**: Use design tokens instead of hardcoded values
2. **Accessibility**: Always include proper labels and ARIA attributes
3. **Responsiveness**: Test on multiple screen sizes
4. **Dark Mode**: Design with both themes in mind
5. **Performance**: Use React.memo for expensive components
6. **Loading States**: Always show loading indicators
7. **Error Handling**: Display user-friendly error messages
8. **Validation**: Validate inputs with clear error messages

---

## Future Enhancements

- [ ] Add animation library (Framer Motion)
- [ ] Implement skeleton screens for better loading UX
- [ ] Add more chart components
- [ ] Create data table component with sorting/filtering
- [ ] Add dropdown menu component
- [ ] Implement tooltip component
- [ ] Add avatar component
- [ ] Create badge/tag component variations
- [ ] Implement progress bar component
- [ ] Add alert/notification banner component

---

## Resources

- **TailwindCSS Docs**: https://tailwindcss.com/docs
- **React Router**: https://reactrouter.com/
- **Recharts**: https://recharts.org/
- **Heroicons**: https://heroicons.com/ (for icons)

---

**Version**: 1.0.0
**Last Updated**: 2025-12-01
**Author**: Claude (Anthropic AI)
