/**
 * OfferForm - Price negotiation form component
 * Allows buyers to propose alternative prices on items
 * @element offer-form
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class OfferForm extends LitElement {
  static properties = {
    itemId: { type: String, attribute: 'item-id' },
    itemPrice: { type: Number, attribute: 'item-price' },
    userId: { type: String, attribute: 'user-id' },
    userName: { type: String, attribute: 'user-name' },
    sellerId: { type: String, attribute: 'seller-id' },
    offerPrice: { type: String, state: true },
    isOpen: { type: Boolean, state: true },
    sending: { type: Boolean, state: true },
  };

  static styles = css`
    :host { display: block; }

    .offer-card {
      background: rgba(30, 34, 53, 0.6);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
      overflow: hidden;
      margin-top: 16px;
    }

    .offer-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: background 0.2s;
    }
    .offer-header:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .offer-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: #e2e6f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chevron {
      transition: transform 0.3s;
      color: rgba(255, 255, 255, 0.4);
    }
    .chevron.open {
      transform: rotate(180deg);
    }

    .offer-body {
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease;
    }
    .offer-body.open {
      padding: 20px;
      max-height: 400px;
    }

    .current-price {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      margin-bottom: 16px;
    }
    .current-price-label {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
    }
    .current-price-value {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 1.1rem;
      color: #bac8ff;
    }

    .input-group {
      position: relative;
      margin-bottom: 16px;
    }

    .input-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      color: #c9cfe0;
      margin-bottom: 8px;
    }

    .price-input-wrapper {
      position: relative;
    }

    .price-prefix {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.4);
      font-weight: 600;
      font-size: 1rem;
    }

    input {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 14px 16px 14px 34px;
      color: #e2e6f0;
      font-size: 1.1rem;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 600;
      transition: all 0.3s;
      box-sizing: border-box;
    }
    input:focus {
      outline: none;
      border-color: #f08c00;
      box-shadow: 0 0 0 3px rgba(240, 140, 0, 0.15);
    }
    input::placeholder {
      color: rgba(255, 255, 255, 0.2);
      font-weight: 400;
    }

    .savings {
      font-size: 0.8rem;
      color: #69db7c;
      margin-top: 6px;
    }
    .overpaying {
      color: #ff8787;
    }

    .submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #e67700, #f08c00);
      color: white;
      padding: 14px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      border: none;
      cursor: pointer;
      transition: all 0.3s;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(240, 140, 0, 0.35);
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

    .hint {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.3);
      margin-top: 12px;
      text-align: center;
    }
  `;

  constructor() {
    super();
    this.offerPrice = '';
    this.isOpen = false;
    this.sending = false;
  }

  open() {
    this.isOpen = true;
  }

  _toggle() {
    this.isOpen = !this.isOpen;
  }

  get _savings() {
    const offer = parseFloat(this.offerPrice);
    if (isNaN(offer) || !this.itemPrice) return null;
    return this.itemPrice - offer;
  }

  async _submitOffer() {
    const price = parseFloat(this.offerPrice);
    if (isNaN(price) || price <= 0) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Please enter a valid price', type: 'error' }
      }));
      return;
    }

    if (this.userId === this.sellerId) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "You can't make an offer on your own item", type: 'error' }
      }));
      return;
    }

    this.sending = true;

    try {
      // Send offer as a special message via WebSocket or HTTP
      const offerMsg = {
        itemId: this.itemId,
        senderId: this.userId,
        senderName: this.userName,
        content: price.toString(),
        type: 'offer',
        price: price,
        originalPrice: this.itemPrice,
        status: 'pending'
      };

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerMsg)
      });

      if (!res.ok) throw new Error('Failed to send offer');

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Offer of $${price.toLocaleString()} sent!`, type: 'success' }
      }));

      this.offerPrice = '';
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message, type: 'error' }
      }));
    } finally {
      this.sending = false;
    }
  }

  render() {
    return html`
      <div class="offer-card">
        <div class="offer-header" @click=${this._toggle} role="button" aria-expanded=${this.isOpen}>
          <div class="offer-title">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Make an Offer
          </div>
          <svg class="chevron ${this.isOpen ? 'open' : ''}" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </div>

        <div class="offer-body ${this.isOpen ? 'open' : ''}">
          <div class="current-price">
            <span class="current-price-label">Listed Price</span>
            <span class="current-price-value">$${Number(this.itemPrice).toLocaleString()}</span>
          </div>

          <div class="input-group">
            <label for="offer-input">Your Offer</label>
            <div class="price-input-wrapper">
              <span class="price-prefix">$</span>
              <input
                type="number"
                id="offer-input"
                placeholder="Enter your offer"
                .value=${this.offerPrice}
                @input=${(e) => this.offerPrice = e.target.value}
                min="1"
                step="any"
              />
            </div>
            ${this._savings !== null ? html`
              <div class="savings ${this._savings < 0 ? 'overpaying' : ''}">
                ${this._savings > 0
                  ? `You save $${this._savings.toLocaleString()}`
                  : this._savings < 0
                    ? `$${Math.abs(this._savings).toLocaleString()} above asking price`
                    : 'Same as asking price'}
              </div>
            ` : ''}
          </div>

          <button
            class="submit-btn"
            @click=${this._submitOffer}
            ?disabled=${this.sending || !this.offerPrice}
          >
            ${this.sending ? html`<div class="spinner"></div>` : ''}
            ${this.sending ? 'Sending...' : 'Submit Offer'}
          </button>

          <p class="hint">The seller will be notified of your offer via chat</p>
        </div>
      </div>
    `;
  }
}

customElements.define('offer-form', OfferForm);
