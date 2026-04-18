/**
 * ItemCard - Displays a single collectible item in a card format
 * @element item-card
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class ItemCard extends LitElement {
  static properties = {
    item: { type: Object },
    imgLoaded: { type: Boolean, state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: rgba(30, 34, 53, 0.6);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 18px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    .card:hover {
      transform: translateY(-6px);
      border-color: rgba(76, 110, 245, 0.3);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(76, 110, 245, 0.1);
    }

    .image-wrapper {
      position: relative;
      width: 100%;
      padding-top: 70%;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.03);
    }

    .image-wrapper img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .card:hover .image-wrapper img {
      transform: scale(1.08);
    }

    .image-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(76, 110, 245, 0.1), rgba(112, 72, 232, 0.05));
    }
    .image-placeholder span {
      font-size: 2.5rem;
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

    .card-body {
      padding: 16px 18px;
    }

    .item-name {
      font-weight: 700;
      font-size: 0.95rem;
      color: #e2e6f0;
      margin-bottom: 6px;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-description {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 12px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .price {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 1.15rem;
      background: linear-gradient(135deg, #91a7ff, #bac8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .seller {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
    }

    .seller-avatar {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: linear-gradient(135deg, #7048e8, #9775fa);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6rem;
      font-weight: 700;
      color: white;
    }

    .status-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 700;
      background: rgba(55, 178, 77, 0.2);
      color: #69db7c;
      border: 1px solid rgba(55, 178, 77, 0.3);
    }

    .offer-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 700;
      background: rgba(240, 140, 0, 0.2);
      color: #ffd43b;
      border: 1px solid rgba(240, 140, 0, 0.3);
    }
  `;

  constructor() {
    super();
    this.item = {};
    this.imgLoaded = false;
  }

  _navigate() {
    window.location.href = `/item/${this.item.id}`;
  }

  _onImgLoad() {
    this.imgLoaded = true;
  }

  render() {
    const item = this.item;
    if (!item || !item.id) return html``;

    return html`
      <article class="card" @click=${this._navigate} role="link" tabindex="0" aria-label="View ${item.name}">
        <div class="image-wrapper">
          ${!this.imgLoaded ? html`<div class="shimmer-img"></div>` : ''}
          ${item.image ? html`
            <img
              src="${item.image}"
              alt="${item.name}"
              loading="lazy"
              @load=${this._onImgLoad}
              style="opacity: ${this.imgLoaded ? '1' : '0'}; transition: opacity 0.4s;"
            />
          ` : html`
            <div class="image-placeholder"><span>🎴</span></div>
          `}
          <div class="status-badge">Active</div>
          ${item.highestOffer ? html`<div class="offer-badge">Offer: $${item.highestOffer}</div>` : ''}
        </div>
        <div class="card-body">
          <h3 class="item-name">${item.name}</h3>
          <p class="item-description">${item.description}</p>
          <div class="card-footer">
            <span class="price">$${Number(item.price).toLocaleString()}</span>
            <div class="seller">
              <div class="seller-avatar">${item.sellerName?.charAt(0)}</div>
              <span>${item.sellerName}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }
}

customElements.define('item-card', ItemCard);
