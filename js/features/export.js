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
    return {
      total: this.#toSafeNumber(source.total),
      approved: this.#toSafeNumber(source.approved),
      underReview: this.#toSafeNumber(source.underReview),
      sections: Array.isArray(source.sections) ? [...source.sections] : [],
    };
  }

  #toSafeNumber(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
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
