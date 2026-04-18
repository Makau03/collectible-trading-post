/**
 * ItemDetail - Full item view with actions for buyer/seller
 * Shows item info, chat panel, offer form, and checkout capabilities
 * @element item-detail
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class ItemDetail extends LitElement {
  static properties = {
    itemData: { type: String, attribute: 'item-data' },
    item: { type: Object, state: true },
    user: { type: Object, state: true },
    imgLoaded: { type: Boolean, state: true },
  };

  static styles = css`
    :host { display: block; }

    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      animation: fadeInUp 0.5s ease-out;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #748ffc;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 24px;
      transition: color 0.2s;
      cursor: pointer;
      background: none;
      border: none;
      font-family: inherit;
    }
    .back-link:hover { color: #91a7ff; }

    /* Image Section */
    .image-section {
      position: relative;
    }

    .image-container {
      border-radius: 20px;
      overflow: hidden;
      background: rgba(30, 34, 53, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      position: relative;
    }

    .image-container img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      display: block;
      transition: opacity 0.4s;
    }

    .image-placeholder {
      width: 100%;
      aspect-ratio: 4/3;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(76, 110, 245, 0.1), rgba(112, 72, 232, 0.05));
      font-size: 4rem;
    }

    .shimmer-img {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Info Section */
    .info-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .item-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: #e2e6f0;
      line-height: 1.3;
    }

    .price-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .price {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #4c6ef5, #7048e8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .status-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-active {
      background: rgba(55, 178, 77, 0.15);
      color: #69db7c;
      border: 1px solid rgba(55, 178, 77, 0.3);
    }
    .status-paid {
      background: rgba(76, 110, 245, 0.15);
      color: #91a7ff;
      border: 1px solid rgba(76, 110, 245, 0.3);
    }

    .description {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.95rem;
      line-height: 1.7;
      padding: 20px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }

    .seller-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .seller-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #7048e8, #9775fa);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      color: white;
    }

    .seller-details h4 {
      font-weight: 600;
      color: #e2e6f0;
      font-size: 0.95rem;
    }
    .seller-details span {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.4);
    }

    .highest-offer {
      padding: 16px 20px;
      background: rgba(240, 140, 0, 0.08);
      border: 1px solid rgba(240, 140, 0, 0.2);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .highest-offer-label {
      color: #ffd43b;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .highest-offer-value {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 1.2rem;
      color: #ffd43b;
    }

    /* Actions */
    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .btn {
      padding: 14px 24px;
      border-radius: 14px;
      font-weight: 600;
      font-size: 0.95rem;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-buy {
      background: linear-gradient(135deg, #2b8a3e, #37b24d);
      color: white;
    }
    .btn-buy:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(43, 138, 62, 0.35);
    }

    .btn-offer {
      background: linear-gradient(135deg, #e67700, #f08c00);
      color: white;
    }
    .btn-offer:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(240, 140, 0, 0.35);
    }

    .btn-chat {
      background: linear-gradient(135deg, #4c6ef5, #5c7cfa);
      color: white;
    }
    .btn-chat:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(76, 110, 245, 0.35);
    }

    .btn-confirm {
      background: linear-gradient(135deg, #2b8a3e, #37b24d);
      color: white;
    }
    .btn-confirm:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(43, 138, 62, 0.35);
    }

    .btn-delete {
      background: rgba(201, 42, 42, 0.15);
      color: #ff8787;
      border: 1px solid rgba(201, 42, 42, 0.2);
    }
    .btn-delete:hover {
      background: rgba(201, 42, 42, 0.25);
    }

    .login-prompt {
      text-align: center;
      padding: 24px;
      background: rgba(76, 110, 245, 0.06);
      border-radius: 14px;
      border: 1px solid rgba(76, 110, 245, 0.15);
    }
    .login-prompt p {
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 12px;
      font-size: 0.9rem;
    }
    .login-prompt a {
      color: #748ffc;
      font-weight: 600;
      text-decoration: none;
    }
    .login-prompt a:hover { text-decoration: underline; }

    /* Chat + Offer Section */
    .communication-section {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      .detail-layout {
        grid-template-columns: 1fr;
      }
      .communication-section {
        grid-template-columns: 1fr;
      }
      .item-name { font-size: 1.4rem; }
      .price { font-size: 1.6rem; }
    }
  `;

  constructor() {
    super();
    this.item = null;
    this.user = null;
    this.imgLoaded = false;
    this._loadUser();
    window.addEventListener('user-changed', () => this._loadUser());
  }

  _loadUser() {
    const stored = localStorage.getItem('user');
    this.user = stored ? JSON.parse(stored) : null;
  }

  willUpdate(changed) {
    if (changed.has('itemData') && this.itemData) {
      try {
        this.item = JSON.parse(this.itemData);
      } catch (e) {
        console.error('Failed to parse item data:', e);
      }
    }
  }

  get _isSeller() {
    return this.user && this.item && this.user.id === this.item.sellerId;
  }

  get _isBuyer() {
    return this.user && this.item && this.user.id !== this.item.sellerId;
  }

  _showChat() {
    const chat = this.shadowRoot.querySelector('chat-panel');
    if (chat) chat.toggleAttribute('open');
    // Also scroll to communication section
    this.shadowRoot.querySelector('.communication-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  _showOffer() {
    const form = this.shadowRoot.querySelector('offer-form');
    if (form) form.open();
  }

  _showCheckout() {
    const checkout = document.querySelector('checkout-modal');
    if (checkout) {
      checkout.setAttribute('item-data', JSON.stringify(this.item));
      checkout.setAttribute('open', '');
    }
  }

  async _confirmSale() {
    if (!confirm('Confirm that payment has been received? This will remove the item from the marketplace.')) return;
    try {
      const res = await fetch(`/api/items/${this.item.id}/confirm-sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: this.user.id })
      });
      if (!res.ok) throw new Error('Failed to confirm sale');

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Sale confirmed! Item removed from marketplace.', type: 'success' }
      }));
      setTimeout(() => window.location.href = '/', 1500);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message, type: 'error' }
      }));
    }
  }

  async _deleteItem() {
    if (!confirm('Are you sure you want to remove this listing?')) return;
    try {
      const res = await fetch(`/api/items/${this.item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Listing removed.', type: 'success' }
      }));
      setTimeout(() => window.location.href = '/', 1000);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message, type: 'error' }
      }));
    }
  }

  render() {
    if (!this.item) return html`<p style="text-align:center;color:#aaa;padding:60px">Loading item...</p>`;

    return html`
      <button class="back-link" @click=${() => window.location.href = '/'}>
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Back to Marketplace
      </button>

      <div class="detail-layout">
        <!-- Image -->
        <div class="image-section">
          <div class="image-container">
            ${!this.imgLoaded && this.item.image ? html`<div class="shimmer-img"></div>` : ''}
            ${this.item.image ? html`
              <img
                src="${this.item.image}"
                alt="${this.item.name}"
                @load=${() => this.imgLoaded = true}
                style="opacity:${this.imgLoaded ? 1 : 0}"
              />
            ` : html`
              <div class="image-placeholder">🎴</div>
            `}
          </div>
        </div>

        <!-- Info -->
        <div class="info-section">
          <h1 class="item-name">${this.item.name}</h1>

          <div class="price-row">
            <span class="price">$${Number(this.item.price).toLocaleString()}</span>
            <span class="status-badge ${this.item.paymentStatus === 'paid' ? 'status-paid' : 'status-active'}">
              ${this.item.paymentStatus === 'paid' ? 'Payment Pending Confirmation' : 'Active'}
            </span>
          </div>

          <div class="description">${this.item.description}</div>

          <div class="seller-info">
            <div class="seller-avatar">${this.item.sellerName?.charAt(0)}</div>
            <div class="seller-details">
              <h4>${this.item.sellerName}</h4>
              <span>Listed ${new Date(this.item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          ${this.item.highestOffer ? html`
            <div class="highest-offer">
              <span class="highest-offer-label">Highest Offer</span>
              <span class="highest-offer-value">$${Number(this.item.highestOffer).toLocaleString()}</span>
            </div>
          ` : ''}

          <!-- Actions -->
          <div class="actions">
            ${!this.user ? html`
              <div class="login-prompt">
                <p>Sign in to negotiate prices, chat with sellers, and make purchases.</p>
                <a href="/login">Sign In →</a>
              </div>
            ` : this._isBuyer ? html`
              <button class="btn btn-chat" @click=${this._showChat}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                Message Seller
              </button>
              <button class="btn btn-offer" @click=${this._showOffer}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Make an Offer
              </button>
              ${this.item.paymentStatus !== 'paid' ? html`
                <button class="btn btn-buy" @click=${this._showCheckout}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                  Buy Now
                </button>
              ` : html`
                <div class="highest-offer" style="background: rgba(76, 110, 245, 0.08); border-color: rgba(76, 110, 245, 0.2);">
                  <span class="highest-offer-label" style="color: #91a7ff;">Payment submitted. Awaiting seller confirmation.</span>
                </div>
              `}
            ` : html`
              ${this.item.paymentStatus === 'paid' ? html`
                <button class="btn btn-confirm" @click=${this._confirmSale}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  Confirm Payment & Complete Sale
                </button>
              ` : ''}
              <button class="btn btn-chat" @click=${this._showChat}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                View Messages
              </button>
              <button class="btn btn-delete" @click=${this._deleteItem}>Remove Listing</button>
            `}
          </div>
        </div>

        <!-- Communication Section -->
        ${this.user ? html`
          <div class="communication-section">
            <chat-panel
              item-id="${this.item.id}"
              user-id="${this.user.id}"
              user-name="${this.user.name}"
              seller-id="${this.item.sellerId}"
            ></chat-panel>
            <div>
              <offer-form
                item-id="${this.item.id}"
                item-price="${this.item.price}"
                user-id="${this.user.id}"
                user-name="${this.user.name}"
                seller-id="${this.item.sellerId}"
              ></offer-form>
              <checkout-modal
                item-id="${this.item.id}"
                item-name="${this.item.name}"
                item-price="${this.item.price}"
                user-id="${this.user.id}"
              ></checkout-modal>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('item-detail', ItemDetail);
