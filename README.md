# Status Dashboard v5

A comprehensive shop drawing submission status tracking dashboard with state management, validation, undo/redo, and offline-first architecture.

## Architecture Overview

### Phase 1: Bug Fixes ✅
- Display-only total field
- Fixed exitReadonly() DOM iteration
- Field name standardization (ur → underReview)
- Guarded share version buttons
- Removed focus-stealing during rename
- Fixed PDF font blurriness

### Phase 2: Architecture Wiring ✅
- **Store**: Single source of truth via pub/sub pattern
- **Autosave**: Subscribes to Store, localStorage persistence (1500ms debounce)
- **Validator**: Real-time validation with inline error display
- **UndoManager**: Automatic snapshots (400ms debounce, 50 max snapshots)
- **SVG Generation**: Modular functions (buildSvgMarkup, mountSvg, updateChartWidget)

### Phase 3: Code Quality ✅
- **Linting & Formatting**: ESLint + Prettier configured
- **Unit Tests**: Comprehensive tests for core libraries (jest)
- **Event Bindings**: Centralized with error boundaries (Phase 3.3)
- **Error Boundaries**: Multi-layer error handling and logging
- **Loading States**: UI feedback for async operations

## Project Structure

```
.
├── index.html                    # Main HTML with inline script
├── js/
│   ├── app.js                   # Event binding initialization
│   ├── core/
│   │   ├── calculator.js        # Pure math utility
│   │   ├── calculator.test.js   # Unit tests
│   │   ├── validator.js         # State validation rules
│   │   ├── validator.test.js    # Unit tests
│   │   ├── init.js              # Master initialization
│   │   ├── undo-manager.js      # Undo/redo implementation
│   │   ├── error-boundary.js    # Error handling (Phase 3.4)
│   │   └── loading-state.js     # Loading indicators (Phase 3.5)
│   ├── state/
│   │   ├── store.js             # Central state container
│   │   └── store.test.js        # Unit tests
│   ├── features/
│   │   ├── autosave.js          # localStorage persistence
│   │   └── export.js            # JSON import/export
│   ├── ui/
│   │   ├── renderer.js          # DOM rendering
│   │   └── event-bindings.js    # Centralized event handlers (Phase 3.3)
│
├── .eslintrc.json               # Linting rules
├── .prettierrc.json             # Code formatting
├── jest.config.js               # Test configuration
├── package.json                 # Dependencies & scripts
└── README.md                    # This file
```

## State Schema

```javascript
{
  total: 1434,                    // Total drawings count
  approved: 1083,                 // Approved count
  underReview: 51,                // Under review count
  sections: [
    {
      id: 'sec_xxx',
      name: 'Section Name',
      colorId: 'blue',
      open: false,
      items: [
        {
          count: 10,
          label: 'Item Label',
          note: 'Notes',
          date: '2026-04-12'
        }
      ]
    }
  ],
  selectedColor: 'blue',          // Current section color
  isReadonly: false,              // Shared version mode
  title: 'SHOP DRAWING...',       // Custom title
  date: '2026-04-12'              // Custom date
}
```

## Getting Started

### Setup

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run tests
npm test

# Format code
npm run format
```

### Development

1. **Local Testing**: Open `index.html` in a modern browser
2. **State Persistence**: Automatically saved to localStorage (`shd_v4` key)
3. **Version Control**: Shareable URLs via `?version=<base64>` parameter
4. **Offline Support**: Works without network; syncs when available

### Code Quality

**Linting**: All files checked against ESLint rules (see `.eslintrc.json`)
```bash
npm run lint
```

**Testing**: Jest unit tests for core libraries
```bash
npm test --coverage
```

**Formatting**: Automatic with Prettier
```bash
npm run format
```

## Key Features

### 1. Single Source of Truth (Store)
All state mutations flow through `Store.setState()`:
```
Input → markDirty() → setState() → Subscribers → UI Update
```

### 2. Real-Time Validation
- Total = Approved + Remaining
- Approved ≤ Total
- Remaining = Under Review + Sections
- Inline error display with disable buttons

### 3. Automatic Undo/Redo
- Snapshots on Store change (debounced 400ms)
- Up to 50 snapshots retained
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo)

### 4. Offline-First Architecture
- Autosave to localStorage every 1500ms
- Works completely offline
- Syncs on URL version loads

### 5. Error Boundaries
Four error tracking layers:
- **DataBoundary**: State mutations
- **UIBoundary**: DOM operations
- **StoreBoundary**: Store subscriptions
- **ExportBoundary**: Export operations

Access with: `window.getAllErrors()` or `exportAllErrors()`

### 6. Loading States
For async operations:
```javascript
import { withLoadingState } from './js/core/loading-state.js';

const safeSave = withLoadingState('save', async () => {
  // Operation with UI feedback
});
```

## Event Bindings

All event listeners centralized in `js/ui/event-bindings.js`:

**Control Flow:**
1. User interaction
2. Event handler called with `safeCall()` wrapper
3. Function executes with error boundary
4. State updated via `markDirty()` → `Store.setState()`
5. Subscribers notified → UI updates

**Safe Execution:**
```javascript
safeCall('functionName', () => window.functionName?.())
```

## Validation Rules

### Total Mismatch
```
total !== (approved + underReview + sections.sum())
```
Error: Displays math breakdown with expected vs actual

### Approved Exceeds Total
```
approved > total
```
Error: Shows how much over the limit

### Allocations Exceed Remaining
```
(underReview + sections.sum()) > (total - approved)
```
Error: Too many items in remaining bucket

## SVG Generation

Split into three independent functions:

1. **buildSvgMarkup(state)** → Pure SVG string
2. **mountSvg(markup)** → DOM write
3. **updateChartWidget()** → Chart rendering
4. **generateSVG()** → Orchestrates all three

Benefits: Testable, reusable, decoupled from DOM

## Testing

### Run Tests
```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

### Test Files
- `js/core/calculator.test.js` - Math utilities (8 tests)
- `js/core/validator.test.js` - Validation rules (15+ tests)
- `js/state/store.test.js` - State management (12+ tests)

### Coverage Goals
- Statements: 60%+
- Branches: 50%+
- Functions: 60%+
- Lines: 60%+

## Debugging

### Error Log
```javascript
// Get all errors across all boundaries
window.getAllErrors()

// Export for analysis
window.exportAllErrors()

// Clear logs
window.clearAllErrors()
```

### Loading State
```javascript
// Check active loaders
window.loadingManager.getActiveLoaders()

// Clear all
window.loadingManager.clearAll()
```

### Validation
```javascript
// Validate current state
globalController.validate(globalController.getState())

// Get last validation
globalController.getValidationErrors()
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires ES2020+ support for:
- Dynamic imports
- Async/await
- Optional chaining (`?.`)
- Nullish coalescing (`??`)

## Performance

- **Debounced autosave**: 1500ms
- **Debounced UV generation**: 200ms
- **Debounced auto-calcs**: 150ms
- **Undo snapshots**: 400ms debounce, 50 max
- **Rendering**: Section batching, badge-only updates during typing

## Phase 4: UX Polish ✅

### Phase 4.1: Dark/Light Theme Enhancement
- ✅ ThemeManager class with system preference detection
- ✅ Smooth 350ms transitions between themes
- ✅ localStorage persistence (`shd_theme` key)
- ✅ DetailedColor palettes for dark/light modes
- ✅ CSS custom properties updated dynamically
- ✅ Respects `prefers-color-scheme` media query
- ✅ Theme button with accessible focus states

### Phase 4.2: Mobile Responsiveness
- ✅ Mobile-first CSS with breakpoints (1024px, 768px, 480px)
- ✅ Responsive header (logo/text hidden on mobile)
- ✅ Stacked layout on tablets (panel above content)
- ✅ Full-width panel with height constraints on mobile
- ✅ Responsive typography and padding
- ✅ Touch-friendly button sizing
- ✅ Tab navigation adjusts for mobile screens

### Phase 4.3: Accessibility (WCAG 2.1 AA)
- ✅ `js/core/accessibility.js` module with:
  - Color contrast ratio checker
  - Focusable element detection
  - Accessible name extraction
  - Keyboard accessibility helpers
  - Screen reader announcements (aria-live)
  - Skip-to-main-content link
  - Prefers-reduced-motion support
  - Focus visible indicators on all focusable elements

### Phase 4.4: Performance Optimization
- ✅ `js/core/performance.js` module with:
  - PerformanceMonitor for metric tracking
  - Debounce & throttle utilities
  - Lazy image loading support
  - DOM batch update helpers
  - Memoization for expensive functions
  - Web Vitals collection (FCP, LCP, TTFB)
  - Memory usage monitoring
  - Performance report generation

### Phase 4.5: Documentation & Deployment
- ✅ Comprehensive README (400+ lines)
- ✅ Architecture documentation
- ✅ Setup & development guide
- ✅ Code quality guide (ESLint, tests, formatting)
- ✅ Accessibility guidelines
- ✅ Performance tips
- ✅ Browser support matrix
- ✅ Debugging guide with window.* helpers

---

## Complete Feature Set

**Dashboard Capabilities:**
- Real-time state management with undo/redo
- Offline-first architecture with autosave
- Export/import via JSON or URL sharing
- PDF generation with proper font rendering
- Dynamic SVG dashboard with sections
- Automatic validation with inline error messages
- Dark/light theme with smooth transitions
- Fully responsive mobile layout
- WCAG 2.1 AA accessibility compliance
- Comprehensive error logging & boundaries
- Loading state indicators
- Performance monitoring

**Developer Experience:**
- Modular ES6+ codebase (11 core modules)
- 35+ unit tests with Jest
- ESLint + Prettier code quality
- Centralized event binding with error boundaries
- Complete error logging system
- Performance metrics collection
- Accessibility utilities
- Full TypeScript-ready JSDoc comments

**Code Organization:**
- `/js/core/` - State, validation, undo, init, accessibility, performance
- `/js/state/` - Store management with pub/sub
- `/js/features/` - Autosave, export/import
- `/js/ui/` - Theme, event bindings, renderer

---

**Version**: 5.0.0  
**Last Updated**: April 12, 2026  
**Status**: Phase 4 Complete ✅ — Ready for Production
