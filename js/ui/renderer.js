export class Renderer {
  constructor(store, options = {}) {
    if (!store || typeof store.subscribe !== 'function' || typeof store.getState !== 'function') {
      throw new TypeError('Renderer requires a valid store instance.');
    }

    this.store = store;
    this.document = options.document ?? document;
    this.chart = options.chart ?? null;
    this.unsubscribe = null;
    this.previousState = null;

    this.nodes = {
      total: this.document.querySelector('[data-stat="total"]'),
      approved: this.document.querySelector('[data-stat="approved"]'),
      underReview: this.document.querySelector('[data-stat="underReview"]'),
      remaining: this.document.querySelector('[data-stat="remaining"]'),
      approvalRate: this.document.querySelector('[data-stat="approvalRate"]'),
      sectionsEmptyState: this.document.querySelector('[data-sections-empty]'),
      sectionsCount: this.document.querySelector('[data-sections-count]'),
      svg: this.document.querySelector('[data-dashboard-svg]'),
      svgApproved: this.document.querySelector('[data-svg-approved]'),
      svgUnderReview: this.document.querySelector('[data-svg-under-review]'),
      svgRemaining: this.document.querySelector('[data-svg-remaining]'),
    };
  }

  start() {
    if (this.unsubscribe) {
      return;
    }

    this.unsubscribe = this.store.subscribe((state) => this.render(state));
    this.render(this.store.getState());
  }

  stop() {
    if (!this.unsubscribe) {
      return;
    }

    this.unsubscribe();
    this.unsubscribe = null;
  }

  render(state) {
    if (!state) {
      return;
    }

    const previous = this.previousState;

    if (!previous || previous.total !== state.total) {
      this.#setText(this.nodes.total, state.total);
    }

    if (!previous || previous.approved !== state.approved) {
      this.#setText(this.nodes.approved, state.approved);
    }

    if (!previous || previous.underReview !== state.underReview) {
      this.#setText(this.nodes.underReview, state.underReview);
    }

    const remaining = Math.max(0, Number(state.total) - Number(state.approved));
    if (!previous || previous.total !== state.total || previous.approved !== state.approved) {
      this.#setText(this.nodes.remaining, remaining);
    }

    if (!previous || previous.total !== state.total || previous.approved !== state.approved) {
      const rate = Number(state.total) > 0 ? Number(state.approved) / Number(state.total) : 0;
      this.#setText(this.nodes.approvalRate, `${Math.round(rate * 100)}%`);
    }

    if (!previous || previous.sections !== state.sections) {
      const sectionsCount = Array.isArray(state.sections) ? state.sections.length : 0;
      this.#setText(this.nodes.sectionsCount, sectionsCount);
      this.#toggleEmptyState(sectionsCount === 0);
    }

    if (
      !previous ||
      previous.total !== state.total ||
      previous.approved !== state.approved ||
      previous.underReview !== state.underReview
    ) {
      this.#renderSvg(state, remaining);
    }

    if (this.chart && typeof this.chart.update === 'function') {
      this.chart.update({
        total: state.total,
        approved: state.approved,
        underReview: state.underReview,
        remaining,
      });
    }

    this.previousState = {
      ...state,
      sections: Array.isArray(state.sections) ? [...state.sections] : [],
    };
  }

  #setText(node, value) {
    if (!node) {
      return;
    }

    node.textContent = String(value);
  }

  #toggleEmptyState(show) {
    if (!this.nodes.sectionsEmptyState) {
      return;
    }

    this.nodes.sectionsEmptyState.hidden = !show;
  }

  #renderSvg(state, remaining) {
    if (!this.nodes.svg) {
      return;
    }

    const total = Math.max(0, Number(state.total) || 0);
    const approved = Math.max(0, Number(state.approved) || 0);
    const underReview = Math.max(0, Number(state.underReview) || 0);

    const approvedPercent = total > 0 ? (approved / total) * 100 : 0;
    const underReviewPercent = total > 0 ? (underReview / total) * 100 : 0;
    const remainingPercent = total > 0 ? (remaining / total) * 100 : 0;

    this.nodes.svg.style.setProperty('--approved-percent', `${approvedPercent}`);
    this.nodes.svg.style.setProperty('--under-review-percent', `${underReviewPercent}`);
    this.nodes.svg.style.setProperty('--remaining-percent', `${remainingPercent}`);

    this.#setText(this.nodes.svgApproved, approved);
    this.#setText(this.nodes.svgUnderReview, underReview);
    this.#setText(this.nodes.svgRemaining, remaining);
  }
}

export const createRenderer = (store, options) => new Renderer(store, options);
