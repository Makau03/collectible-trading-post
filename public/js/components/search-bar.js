/**
 * SearchBar - Keyword search component with debounced API calls
 * Dispatches 'search-changed' event with the search term
 * @element search-bar
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class SearchBar extends LitElement {
  static properties = {
    query: { type: String, state: true },
    loading: { type: Boolean, state: true },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .search-wrapper {
      position: relative;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.3);
      pointer-events: none;
      transition: color 0.3s;
    }

    input {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 14px 48px 14px 48px;
      color: #e2e6f0;
      font-size: 0.95rem;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
    }
    input:focus {
      outline: none;
      border-color: #4c6ef5;
      box-shadow: 0 0 0 3px rgba(76, 110, 245, 0.12);
      background: rgba(255, 255, 255, 0.06);
    }
    input:focus + .search-icon,
    input:focus ~ .search-icon {
      color: #4c6ef5;
    }
    input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    .clear-btn {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #c9cfe0;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-size: 0.8rem;
    }
    .clear-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .spinner {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      border: 2px solid rgba(76, 110, 245, 0.2);
      border-top-color: #4c6ef5;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: translateY(-50%) rotate(360deg); }
    }
  `;

  constructor() {
    super();
    this.query = '';
    this.loading = false;
    this._debounceTimer = null;
  }

  _onInput(e) {
    this.query = e.target.value;
    this.loading = true;

    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this.loading = false;
      this.dispatchEvent(new CustomEvent('search-changed', {
        detail: { query: this.query },
        bubbles: true,
        composed: true
      }));
    }, 350);
  }

  _clear() {
    this.query = '';
    this.loading = false;
    clearTimeout(this._debounceTimer);
    this.dispatchEvent(new CustomEvent('search-changed', {
      detail: { query: '' },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="search-wrapper">
        <input
          type="search"
          id="search-input"
          placeholder="Search collectibles... comics, cards, figures"
          .value=${this.query}
          @input=${this._onInput}
          aria-label="Search collectibles"
          autocomplete="off"
        />
        <div class="search-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        ${this.loading ? html`<div class="spinner"></div>` :
          this.query ? html`<button class="clear-btn" @click=${this._clear} aria-label="Clear search">✕</button>` : ''}
      </div>
    `;
  }
}

customElements.define('search-bar', SearchBar);
