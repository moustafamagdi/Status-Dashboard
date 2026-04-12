export class Calculator {
  remaining(total, approved) {
    const safeTotal = this.#toNonNegativeNumber(total);
    const safeApproved = this.#toNonNegativeNumber(approved);

    return Math.max(0, safeTotal - safeApproved);
  }

  approvalRate(total, approved) {
    const safeTotal = this.#toNonNegativeNumber(total);
    const safeApproved = this.#toNonNegativeNumber(approved);

    if (safeTotal === 0) {
      return 0;
    }

    return safeApproved / safeTotal;
  }

  sectionsSum(sections = []) {
    if (!Array.isArray(sections)) {
      return 0;
    }

    return sections.reduce((sum, section) => {
      const value = this.#extractSectionValue(section);
      return sum + value;
    }, 0);
  }

  #extractSectionValue(section) {
    if (typeof section === 'number') {
      return this.#toNonNegativeNumber(section);
    }

    if (section && typeof section === 'object') {
      if (Array.isArray(section.items)) {
        return section.items.reduce((itemSum, item) => {
          const count = item && typeof item === 'object' ? item.count : item;
          return itemSum + this.#toNonNegativeNumber(count);
        }, 0);
      }

      if ('value' in section) {
        return this.#toNonNegativeNumber(section.value);
      }

      if ('amount' in section) {
        return this.#toNonNegativeNumber(section.amount);
      }
    }

    return 0;
  }

  #toNonNegativeNumber(value) {
    const numeric = Number(value);

    if (!Number.isFinite(numeric) || numeric < 0) {
      return 0;
    }

    return numeric;
  }
}

export const createCalculator = () => new Calculator();
