# UI Design System

## Tokens

### Colors
| Token | Tailwind Class | Hex/HSL | Usage |
|-------|----------------|---------|-------|
| **Background** | `bg-background` | Dark Gray | Main app background |
| **Foreground** | `text-foreground` | White/Off-white | Main text |
| **Primary** | `bg-primary` | Blue/Purple | Primary actions (Buy, Login) |
| **Secondary** | `bg-secondary` | Slate Gray | Secondary actions, cards |
| **Destructive** | `text-destructive` | Red | Errors, Sell, Remove |
| **Success** | `text-green-500` | Green | Positive price change, success states |

### Typography
- **Font Family**: System default sans-serif (Inter/Segoe UI).
- **Scale**:
    - `text-xs`: 12px (Labels)
    - `text-sm`: 14px (Body small)
    - `text-base`: 16px (Body default)
    - `text-lg`: 18px (Subtitles)
    - `text-xl`: 20px (Card titles)
    - `text-2xl`: 24px (Page titles)

### Spacing
- Base unit: `0.25rem` (4px).
- Common spacing: `p-4` (16px), `gap-2` (8px), `m-6` (24px).

## Components

### Button
- **Primary**: Solid background, white text.
- **Secondary**: Muted background, light text.
- **Ghost**: Transparent background, hover effect.

### Card
- Dark background (`bg-card`)
- Subtle border (`border-border`)
- Rounded corners (`rounded-lg`)
- Shadow (`shadow-sm`)

### Input
- Dark background
- Border (`border-input`)
- Focus ring (`ring-primary`)
