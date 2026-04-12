const REQUIRED_KEYS = ['total', 'approved', 'underReview', 'sections'];

export class DataExport {
  constructor(options = {}) {
    this.version = options.version ?? 1;
  }

  toJSON(state) {
    const payload = {
      meta: {
        version: this.version,
        exportedAt: new Date().toISOString(),
      },
      data: this.#normalizeState(state),
    };

    return JSON.stringify(payload, null, 2);
  }

  download(filename, state) {
    const json = this.toJSON(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename || 'dashboard-data.json';
    anchor.click();

    URL.revokeObjectURL(url);
  }

  fromJSON(jsonText) {
    let parsed;

    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return this.#error('INVALID_JSON', 'Could not parse JSON.');
    }

    const source = parsed?.data ?? parsed;

    const structure = this.#validateStructure(source);
    if (!structure.isValid) {
      return structure;
    }

    return {
      isValid: true,
      data: this.#normalizeState(source),
      errors: [],
    };
  }

  #validateStructure(source) {
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      return this.#error('INVALID_STRUCTURE', 'Data must be a JSON object.');
    }

    const missing = REQUIRED_KEYS.filter((key) => !(key in source));
    if (missing.length > 0) {
      return this.#error('MISSING_FIELDS', `Missing required fields: ${missing.join(', ')}`, { missing });
    }

    if (!Array.isArray(source.sections)) {
      return this.#error('INVALID_SECTIONS', 'Sections must be an array.');
    }

    return {
      isValid: true,
      errors: [],
    };
  }

  #normalizeState(source = {}) {
    const total = this.#toSafeNumber(source.total);
    const approved = this.#toSafeNumber(source.approved);
    const underReview = this.#toSafeNumber(source.underReview);
    const sections = Array.isArray(source.sections) ? [...source.sections] : [];
    const sectionsTotal = sections.reduce((sum, section) => {
      if (!section || !Array.isArray(section.items)) {
        return sum;
      }

      return (
        sum +
        section.items.reduce((itemSum, item) => {
          const count = item && typeof item === 'object' ? item.count : item;
          return itemSum + this.#toSafeNumber(count);
        }, 0)
      );
    }, 0);
    const remaining = underReview + sectionsTotal;

    return {
      contractorName: this.#toSafeString(source.contractorName),
      title: this.#toSafeString(source.title),
      date: this.#toSafeString(source.date),
      status: {
        isReadonly: Boolean(source.isReadonly),
        selectedColor: this.#toSafeString(source.selectedColor || 'red'),
        remaining,
        sectionsTotal,
      },
      total,
      approved,
      underReview,
      sections,
    };
  }

  #toSafeNumber(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  #toSafeString(value) {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  }

  #error(code, message, meta = {}) {
    return {
      isValid: false,
      data: null,
      errors: [
        {
          code,
          message,
          meta,
        },
      ],
    };
  }
}

export const createDataExport = (options) => new DataExport(options);
