import { Calculator } from './calculator.js';

export class Validator {
  constructor(calculator = new Calculator()) {
    this.calculator = calculator;
  }

  validate(state = {}) {
    const errors = [];

    const total = this.#toNumber(state.total);
    const approved = this.#toNumber(state.approved);
    const underReview = this.#toNumber(state.underReview);
    const sections = Array.isArray(state.sections) ? state.sections : [];

    if (total < 0) {
      errors.push(this.#error('total', 'TOTAL_NEGATIVE', 'Total must be greater than or equal to 0.'));
    }

    if (approved > total) {
      errors.push(this.#error('approved', 'APPROVED_EXCEEDS_TOTAL', 'Approved cannot be greater than total.'));
    }

    const remaining = this.calculator.remaining(total, approved);
    const sectionsTotal = this.calculator.sectionsSum(sections);

    if (underReview + sectionsTotal > remaining) {
      errors.push(
        this.#error(
          'underReview',
          'ALLOCATIONS_EXCEED_REMAINING',
          'Under review and sections total cannot exceed remaining capacity.',
          {
            remaining,
            underReview,
            sectionsTotal,
          },
        ),
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  #toNumber(value) {
    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
      return 0;
    }

    return numeric;
  }

  #error(field, code, message, meta = {}) {
    return {
      field,
      code,
      message,
      meta,
    };
  }
}

export const createValidator = (calculator) => new Validator(calculator);
