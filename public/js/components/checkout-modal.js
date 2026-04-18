/**
 * CheckoutModal - Payment confirmation modal for buyers
 * Handles checkout flow and payment confirmation
 * @element checkout-modal
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class CheckoutModal extends LitElement {
  static properties = {
    itemId: { type: String, attribute: 'item-id' },
    itemName: { type: String, attribute: 'item-name' },
    itemPrice: { type: Number, attribute: 'item-price' },
    userId: { type: String, attribute: 'user-id' },
    isOpen: { type: Boolean, state: true },
    step: { type: String, state: true },
    processing: { type: Boolean, state: true },
  };

  static styles = css`
    :host { display: block; }

    .checkout-card {
      background: rgba(30, 34, 53, 0.6);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
      overflow: hidden;
      margin-top: 16px;
    }

    .checkout-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: background 0.2s;
    }
    .checkout-header:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .checkout-title {
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

    .checkout-body {
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease;
    }
    .checkout-body.open {
      padding: 24px 20px;
      max-height: 600px;
    }

    .order-summary {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }

    .summary-title {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255, 255, 255, 0.4);
      font-weight: 600;
      margin-bottom: 14px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 0.9rem;
    }

    .summary-label {
      color: rgba(255, 255, 255, 0.5);
    }

    .summary-value {
      color: #e2e6f0;
      font-weight: 500;
    }

    .summary-divider {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      margin: 10px 0;
    }

    .summary-total {
      font-size: 1.1rem;
      font-weight: 700;
    }
    .summary-total .summary-value {
      font-family: 'Space Grotesk', sans-serif;
      color: #69db7c;
      font-size: 1.2rem;
    }

    .security-note {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(55, 178, 77, 0.06);
      border: 1px solid rgba(55, 178, 77, 0.15);
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .security-note svg {
      flex-shrink: 0;
      color: #69db7c;
    }
    .security-note span {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
      line-height: 1.4;
    }

    .pay-btn {
      width: 100%;
      background: linear-gradient(135deg, #2b8a3e, #37b24d);
      color: white;
      padding: 16px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 1rem;
      border: none;
      cursor: pointer;
      transition: all 0.3s;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .pay-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(43, 138, 62, 0.4);
    }
    .pay-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Success State */
    .success-state {
      text-align: center;
      padding: 20px 0;
    }
    .success-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2b8a3e, #37b24d);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 1.8rem;
    }
    .success-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      color: #69db7c;
      margin-bottom: 8px;
    }
    .success-text {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.5);
      line-height: 1.5;
    }

    .spinner {
      width: 18px;
      height: 18px;
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
    this.step = 'review';
    this.processing = false;
  }

  _toggle() {
    this.isOpen = !this.isOpen;
  }

  async _confirmPayment() {
    this.processing = true;

    try {
      const res = await fetch(`/api/items/${this.itemId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: this.userId })
      });

      if (!res.ok) throw new Error('Checkout failed');

      this.step = 'success';

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Payment confirmed! Awaiting seller confirmation.', type: 'success' }
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message, type: 'error' }
      }));
    } finally {
      this.processing = false;
    }
  }

  render() {
    const price = Number(this.itemPrice);
    const fee = Math.round(price * 0.02 * 100) / 100;
    const total = price + fee;

    return html`
      <div class="checkout-card">
        <div class="checkout-header" @click=${this._toggle} role="button" aria-expanded=${this.isOpen}>
          <div class="checkout-title">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
            Checkout
          </div>
          <svg class="chevron ${this.isOpen ? 'open' : ''}" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </div>

        <div class="checkout-body ${this.isOpen ? 'open' : ''}">
          ${this.step === 'success' ? html`
            <div class="success-state">
              <div class="success-icon">✓</div>
              <h3 class="success-title">Payment Confirmed!</h3>
              <p class="success-text">
                Your payment has been recorded. The seller will review and confirm the transaction. 
                You'll be notified once the sale is complete.
              </p>
            </div>
          ` : html`
            <div class="order-summary">
              <div class="summary-title">Order Summary</div>
              <div class="summary-row">
                <span class="summary-label">${this.itemName}</span>
                <span class="summary-value">$${price.toLocaleString()}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Platform Fee (2%)</span>
                <span class="summary-value">$${fee.toLocaleString()}</span>
              </div>
              <hr class="summary-divider">
              <div class="summary-row summary-total">
                <span class="summary-label">Total</span>
                <span class="summary-value">$${total.toLocaleString()}</span>
              </div>
            </div>

            <div class="security-note">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span>Your payment will be held until the seller confirms delivery. Both parties are protected.</span>
            </div>

            <button
              class="pay-btn"
              @click=${this._confirmPayment}
              ?disabled=${this.processing}
            >
              ${this.processing ? html`<div class="spinner"></div>` : html`
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              `}
              ${this.processing ? 'Processing...' : `Confirm Payment • $${total.toLocaleString()}`}
            </button>
          `}
        </div>
      </div>
    `;
  }
}

customElements.define('checkout-modal', CheckoutModal);
