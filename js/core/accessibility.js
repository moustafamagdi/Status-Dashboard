/**
 * Phase 4.3: Accessibility Utilities
 * WCAG 2.1 Level AA compliance helpers
 */

/**
 * Accessibility Checklist for Status Dashboard
 *
 * WCAG 2.1 Compliance
 */
export const a11yGuidelines = {
  // Color Contrast Ratios (WCAG AA Standard)
  CONTRAST_MINIMUM: 4.5, // For normal text
  CONTRAST_HEADING: 3.0, // For large text (18pt+)

  // Form accessibility
  FORM_LABELS: 'All form inputs must have associated labels',
  FORM_ERRORS: 'Error messages must be associated with inputs',
  FORM_VALIDATION: 'Validation messages must be clear and timely',

  // Keyboard navigation
  KEYBOARD_NAV: 'All interactive elements must be keyboard accessible',
  TAB_ORDER: 'Tab order must follow logical document flow',
  FOCUS_VISIBLE: 'Focused elements must have visible focus indicators',

  // Screen readers
  ARIA_LABELS: 'Use aria-label for icon-only buttons',
  ARIA_LIVE: 'Use aria-live for dynamic content updates',
  ARIA_EXPANDED: 'Use aria-expanded for collapsible sections',

  // Motion & animations
  PREFERS_REDUCED_MOTION: 'Respect prefers-reduced-motion media query',
  ANIMATION_DURATION: 'Animations should not exceed 3 seconds',

  // Text & readability
  MIN_TEXT_SIZE: '12px minimum for body text',
  LINE_HEIGHT: '1.5 or greater for readability',
  MAX_LINE_WIDTH: '80 characters per line recommended',
};

class AccessibilityValidator {
  /**
   * Check color contrast between two colors
   * Returns contrast ratio (higher is better, 4.5+ is AA standard)
   */
  getContrastRatio(color1, color2) {
    const getLuminance = (color) => {
      const rgb = this.hexToRgb(color);
      const [r, g, b] = rgb.map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [255, 255, 255];
  }

  /**
   * Check if text has sufficient contrast with background
   */
  hasGoodContrast(textColor, bgColor, isLargeText = false) {
    const ratio = this.getContrastRatio(textColor, bgColor);
    const minimum = isLargeText ? 3.0 : 4.5;
    return ratio >= minimum;
  }

  /**
   * Get all focusable elements in a container
   */
  getFocusableElements(container = document) {
    return Array.from(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );
  }

  /**
   * Check if element is visible to screen readers
   */
  isAriaHidden(element) {
    return element.getAttribute('aria-hidden') === 'true';
  }

  /**
   * Get accessible name of element
   */
  getAccessibleName(element) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      label?.textContent ||
      element.textContent ||
      element.title ||
      ''
    ).trim();
  }
}

export const a11yValidator = new AccessibilityValidator();

/**
 * Create accessible form field with label and error message
 */
export const createAccessibleFormField = (id, label, type = 'text') => {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';

  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.textContent = label;

  const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
  input.id = id;
  if (type !== 'textarea') {
    input.type = type;
  }
  input.setAttribute('aria-describedby', `${id}-error`);

  const errorEl = document.createElement('div');
  errorEl.id = `${id}-error`;
  errorEl.className = 'form-error';
  errorEl.setAttribute('role', 'alert');

  wrapper.appendChild(labelEl);
  wrapper.appendChild(input);
  wrapper.appendChild(errorEl);

  return { wrapper, input, errorEl };
};

/**
 * Make element keyboard accessible
 */
export const makeKeyboardAccessible = (element, callback) => {
  if (element.tagName === 'BUTTON' || element.tagName === 'A') {
    return; // Already keyboard accessible
  }

  element.setAttribute('tabindex', '0');
  element.setAttribute('role', 'button');

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback?.();
    }
  });

  element.addEventListener('click', callback);
};

/**
 * Announce message to screen readers
 */
export const announce = (message, priority = 'polite') => {
  let announcer = document.getElementById('aria-announcer');

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'aria-announcer';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(announcer);
  }

  announcer.setAttribute('aria-live', priority);
  announcer.textContent = message;
};

/**
 * Initialize accessibility features
 */
export const initAccessibility = () => {
  // Add skip to main link
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position:absolute;
    top:-40px;
    left:0;
    background:#000;
    color:#fff;
    padding:8px;
    text-decoration:none;
    z-index:100;
  `;
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  document.body.insertBefore(skipLink, document.body.firstChild);

  // Keyboard navigation hint for focusable elements
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });
};
