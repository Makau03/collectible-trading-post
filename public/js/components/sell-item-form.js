/**
 * SellItemForm - Modal form for creating new item listings
 * @element sell-item-form
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class SellItemForm extends LitElement {
  static properties = {
    isOpen: { type: Boolean, state: true },
    name: { type: String, state: true },
    description: { type: String, state: true },
    price: { type: String, state: true },
    image: { type: String, state: true },
    submitting: { type: Boolean, state: true },
  };

  static styles = css`
    :host { display: block; }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      padding: 20px;
    }
    .overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .modal {
      background: rgba(30, 34, 53, 0.95);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      transform: translateY(20px) scale(0.95);
      transition: transform 0.3s ease;
    }
    .overlay.open .modal {
      transform: translateY(0) scale(1);
    }

    .modal::-webkit-scrollbar { width: 4px; }
    .modal::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
    }

    .modal-header {
      padding: 24px 28px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      color: #e2e6f0;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #c9cfe0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-size: 1rem;
    }
    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .modal-body {
      padding: 24px 28px 28px;
    }

    .field {
      margin-bottom: 20px;
    }

    label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #c9cfe0;
      margin-bottom: 8px;
    }

    .required {
      color: #ff8787;
    }

    input, textarea {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px 16px;
      color: #e2e6f0;
      font-size: 0.95rem;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s;
      box-sizing: border-box;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: #4c6ef5;
      box-shadow: 0 0 0 3px rgba(76, 110, 245, 0.15);
    }
    input::placeholder, textarea::placeholder {
      color: rgba(255, 255, 255, 0.25);
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    .price-input {
      position: relative;
    }
    .price-prefix {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.4);
      font-weight: 600;
    }
    .price-input input {
      padding-left: 32px;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 600;
    }

    .image-hint {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.3);
      margin-top: 4px;
    }

    .actions {
      display: flex;
      gap: 12px;
    }

    .cancel-btn {
      flex: 1;
      padding: 14px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.06);
      color: #c9cfe0;
      border: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      font-weight: 500;
      font-size: 0.95rem;
      font-family: inherit;
      transition: all 0.2s;
    }
    .cancel-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .submit-btn {
      flex: 2;
      padding: 14px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4c6ef5, #7048e8);
      color: white;
      border: none;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      font-family: inherit;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(76, 110, 245, 0.35);
    }
    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  constructor() {
    super();
    this.isOpen = false;
    this.name = '';
    this.description = '';
    this.price = '';
    this.image = '';
    this.submitting = false;
  }

  open() {
    const user = localStorage.getItem('user');
    if (!user) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Please sign in to list an item', type: 'warning' }
      }));
      window.location.href = '/login';
      return;
    }
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
    this._reset();
  }

  _reset() {
    this.name = '';
    this.description = '';
    this.price = '';
    this.image = '';
  }

  _onOverlayClick(e) {
    if (e.target === e.currentTarget) {
      this.close();
    }
  }

  async _submit(e) {
    e.preventDefault();

    if (!this.name.trim() || !this.price) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Name and price are required', type: 'error' }
      }));
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    this.submitting = true;

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.name.trim(),
          description: this.description.trim(),
          price: parseFloat(this.price),
          image: this.image.trim() || undefined,
          sellerId: user.id,
          sellerName: user.name
        })
      });

      if (!res.ok) throw new Error('Failed to create listing');

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Item listed successfully!', type: 'success' }
      }));

      this.close();
      // Refresh the grid
      window.dispatchEvent(new CustomEvent('search-changed', { detail: { query: '' } }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message, type: 'error' }
      }));
    } finally {
      this.submitting = false;
    }
  }

  render() {
    return html`
      <div class="overlay ${this.isOpen ? 'open' : ''}" @click=${this._onOverlayClick}>
        <div class="modal" role="dialog" aria-modal="true" aria-label="List new item">
          <div class="modal-header">
            <h2 class="modal-title">List a Collectible</h2>
            <button class="close-btn" @click=${this.close} aria-label="Close">✕</button>
          </div>

          <form class="modal-body" @submit=${this._submit}>
            <div class="field">
              <label>Item Name <span class="required">*</span></label>
              <input
                type="text"
                placeholder="e.g., Vintage Pokemon Card - Charizard"
                .value=${this.name}
                @input=${(e) => this.name = e.target.value}
                required
              />
            </div>

            <div class="field">
              <label>Description</label>
              <textarea
                placeholder="Describe the condition, rarity, and any special details..."
                .value=${this.description}
                @input=${(e) => this.description = e.target.value}
              ></textarea>
            </div>

            <div class="field">
              <label>Price (USD) <span class="required">*</span></label>
              <div class="price-input">
                <span class="price-prefix">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  .value=${this.price}
                  @input=${(e) => this.price = e.target.value}
                  min="1"
                  step="any"
                  required
                />
              </div>
            </div>

            <div class="field">
              <label>Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                .value=${this.image}
                @input=${(e) => this.image = e.target.value}
              />
              <div class="image-hint">Paste a direct link to an image of your item</div>
            </div>

            <div class="actions">
              <button type="button" class="cancel-btn" @click=${this.close}>Cancel</button>
              <button type="submit" class="submit-btn" ?disabled=${this.submitting}>
                ${this.submitting ? html`<div class="spinner"></div>` : ''}
                ${this.submitting ? 'Listing...' : 'List Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}

customElements.define('sell-item-form', SellItemForm);
