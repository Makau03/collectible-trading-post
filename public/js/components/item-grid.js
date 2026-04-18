/**
 * ItemGrid - Responsive grid of item cards with search and loading states
 * Listens for 'search-changed' events to filter items
 * @element item-grid
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class ItemGrid extends LitElement {
  static properties = {
    items: { type: Array, state: true },
    loading: { type: Boolean, state: true },
    error: { type: String, state: true },
    searchQuery: { type: String, state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.4rem;
      font-weight: 600;
      color: #c9cfe0;
      margin-bottom: 8px;
    }

    .empty-text {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.95rem;
    }

    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .skeleton-card {
      background: rgba(30, 34, 53, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 18px;
      overflow: hidden;
    }

    .skeleton-img {
      width: 100%;
      padding-top: 70%;
      background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    .skeleton-body {
      padding: 16px 18px;
    }

    .skeleton-line {
      height: 14px;
      border-radius: 6px;
      margin-bottom: 10px;
      background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    .skeleton-line.w-80 { width: 80%; }
    .skeleton-line.w-60 { width: 60%; }
    .skeleton-line.w-40 { width: 40%; }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .results-count {
      margin-bottom: 16px;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.4);
    }
    .results-count strong {
      color: #bac8ff;
    }

    .error-state {
      text-align: center;
      padding: 40px;
      color: #ff6b6b;
    }

    @media (max-width: 640px) {
      .grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }
    }
  `;

  constructor() {
    super();
    this.items = [];
    this.loading = true;
    this.error = '';
    this.searchQuery = '';
    this._fetchItems();

    // Listen for search events
    window.addEventListener('search-changed', (e) => {
      this.searchQuery = e.detail.query;
      this._fetchItems(e.detail.query);
    });
  }

  async _fetchItems(search = '') {
    this.loading = true;
    this.error = '';
    try {
      const url = search
        ? `/api/items?search=${encodeURIComponent(search)}`
        : '/api/items';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch items');
      this.items = await res.json();
    } catch (err) {
      this.error = err.message;
      console.error('Error fetching items:', err);
    } finally {
      this.loading = false;
    }
  }

  _renderSkeletons() {
    return html`
      <div class="loading-grid">
        ${[1,2,3,4,5,6].map(() => html`
          <div class="skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-body">
              <div class="skeleton-line w-80"></div>
              <div class="skeleton-line w-60"></div>
              <div class="skeleton-line w-40"></div>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  _renderEmpty() {
    return html`
      <div class="empty-state">
        <div class="empty-icon">${this.searchQuery ? '🔍' : '📦'}</div>
        <h2 class="empty-title">
          ${this.searchQuery ? 'No matches found' : 'No items listed yet'}
        </h2>
        <p class="empty-text">
          ${this.searchQuery
            ? `No collectibles match "${this.searchQuery}". Try a different search term.`
            : 'Be the first to list a collectible on the marketplace!'}
        </p>
      </div>
    `;
  }

  render() {
    if (this.loading) return this._renderSkeletons();

    if (this.error) {
      return html`<div class="error-state"><p>⚠️ ${this.error}</p>
        <button class="btn-secondary" style="margin-top:12px" @click=${() => this._fetchItems()}>Retry</button>
      </div>`;
    }

    return html`
      ${this.items.length > 0 && this.searchQuery ? html`
        <p class="results-count"><strong>${this.items.length}</strong> result${this.items.length !== 1 ? 's' : ''} for "${this.searchQuery}"</p>
      ` : ''}
      ${this.items.length === 0 ? this._renderEmpty() : html`
        <div class="grid">
          ${this.items.map((item, i) => html`
            <item-card .item=${item} style="animation: fadeInUp 0.4s ease-out ${i * 0.06}s both"></item-card>
          `)}
        </div>
      `}
    `;
  }
}

customElements.define('item-grid', ItemGrid);
