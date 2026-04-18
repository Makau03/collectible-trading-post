/**
 * NotificationToast - Global toast notification system
 * Listens for 'show-toast' events on window
 * @element notification-toast
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class NotificationToast extends LitElement {
  static properties = {
    toasts: { type: Array, state: true },
  };

  static styles = css`
    :host {
      display: block;
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    }

    .toast-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      max-width: 420px;
      padding: 14px 18px;
      border-radius: 14px;
      font-size: 0.9rem;
      font-weight: 500;
      color: white;
      backdrop-filter: blur(20px);
      animation: slideIn 0.35s ease-out, fadeOut 0.3s ease-in forwards;
      animation-delay: 0s, var(--dismiss-delay, 4s);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }

    .toast-success {
      background: rgba(43, 138, 62, 0.9);
      border: 1px solid rgba(55, 178, 77, 0.3);
    }
    .toast-error {
      background: rgba(201, 42, 42, 0.9);
      border: 1px solid rgba(255, 107, 107, 0.3);
    }
    .toast-info {
      background: rgba(76, 110, 245, 0.9);
      border: 1px solid rgba(116, 143, 252, 0.3);
    }
    .toast-warning {
      background: rgba(240, 140, 0, 0.9);
      border: 1px solid rgba(255, 212, 59, 0.3);
    }

    .toast-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .toast-msg {
      flex: 1;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      font-size: 1.1rem;
      padding: 4px;
      flex-shrink: 0;
      transition: color 0.2s;
    }
    .toast-close:hover {
      color: white;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(60px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes fadeOut {
      to {
        opacity: 0;
        transform: translateX(60px);
      }
    }

    @media (max-width: 480px) {
      :host {
        left: 12px;
        right: 12px;
      }
      .toast {
        min-width: unset;
        max-width: unset;
      }
    }
  `;

  constructor() {
    super();
    this.toasts = [];
    this._id = 0;

    window.addEventListener('show-toast', (e) => {
      this._addToast(e.detail);
    });
  }

  _addToast({ message, type = 'info', duration = 4000 }) {
    const id = this._id++;
    this.toasts = [...this.toasts, { id, message, type }];

    setTimeout(() => {
      this._removeToast(id);
    }, duration);
  }

  _removeToast(id) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  _getIcon(type) {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  }

  render() {
    return html`
      <div class="toast-list" role="alert" aria-live="polite">
        ${this.toasts.map(t => html`
          <div class="toast toast-${t.type}">
            <span class="toast-icon">${this._getIcon(t.type)}</span>
            <span class="toast-msg">${t.message}</span>
            <button class="toast-close" @click=${() => this._removeToast(t.id)} aria-label="Close notification">✕</button>
          </div>
        `)}
      </div>
    `;
  }
}

customElements.define('notification-toast', NotificationToast);
