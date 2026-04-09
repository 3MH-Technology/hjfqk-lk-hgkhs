---
Task ID: 11
Agent: Auth Forms Enhancement & Theme Toggle Agent
Task: Enhance login/register forms styling and add a theme toggle feature.

## Files Modified

### 1. /home/z/my-project/src/app/globals.css
- Added 270+ lines of new CSS at end of file
- Auth form gradient mesh background (`.auth-gradient-mesh`)
- Enhanced glassmorphism card (`.auth-glass-card`)
- Animated input gradient underline (`.auth-input-wrapper::after`)
- 5 wolf silhouette float keyframe animations
- Auth form entrance animation (`.auth-form-enter`)
- Wolf logo glow container (`.wolf-logo-glow`)
- Complete light theme CSS variables (`.light` selector)
- 15+ component-specific light overrides

### 2. /home/z/my-project/src/components/wolf/auth/login-form.tsx
- Complete rewrite with framer-motion animations
- WolfLogo SVG component (wolf head silhouette)
- WolfSilhouetteParticle component
- 5 floating wolf particles on form panel
- Gradient mesh background
- Enhanced glassmorphism card
- Animated input wrappers with gradient underline
- GitHub + Telegram social login buttons
- Framer-motion entrance + stagger animations

### 3. /home/z/my-project/src/components/wolf/auth/register-form.tsx
- Complete rewrite matching login-form enhancements
- WolfLogo + WolfSilhouetteParticle components
- 5 floating wolf particles, gradient mesh, glassmorphism
- Framer-motion entrance animations
- GitHub + Telegram social buttons (replacing text-only hint)
- Password strength indicator preserved
- Terms checkbox preserved

### 4. /home/z/my-project/src/store/app-store.ts
- Added `Theme` type ('dark' | 'light')
- Added `theme` field to AppState
- Added `setTheme` action
- Default: 'dark'

### 5. /home/z/my-project/src/components/wolf/layout/header.tsx
- Added Sun/Moon theme toggle button
- Uses `useTheme()` from next-themes
- Syncs with Zustand store
- Added 'bot-analytics' page title

## Verification
- `bun run lint` — zero errors
- Dev server compiles successfully (GET / 200)
