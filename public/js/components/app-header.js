/**
 * AppHeader - Main navigation header component
 * Displays logo, navigation links, and user authentication state
 * @element app-header
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class AppHeader extends LitElement {
  static properties = {
    user: { type: Object, state: true },
    menuOpen: { type: Boolean, state: true },
  };

  static styles = css`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    nav {
      background: rgba(13, 15, 26, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding: 0 20px;
    }

    .nav-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: white;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 1.2rem;
      transition: opacity 0.2s;
    }
    .logo:hover { opacity: 0.85; }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #4c6ef5, #7048e8);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-link {
      padding: 8px 16px;
      border-radius: 10px;
      color: #c9cfe0;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
      cursor: pointer;
      border: none;
      background: none;
      font-family: inherit;
    }
    .nav-link:hover {
      background: rgba(255, 255, 255, 0.06);
      color: white;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: linear-gradient(135deg, #4c6ef5, #7048e8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      color: white;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #e2e6f0;
    }

    .btn-login {
      background: linear-gradient(135deg, #4c6ef5 0%, #7048e8 100%);
      color: white;
      padding: 8px 20px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.85rem;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
    }
    .btn-login:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(76, 110, 245, 0.3);
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.06);
      color: #c9cfe0;
      padding: 8px 16px;
      border-radius: 10px;
      font-weight: 500;
      font-size: 0.85rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }
    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px;
    }

    @media (max-width: 640px) {
      .mobile-toggle { display: block; }
      .nav-links {
        display: none;
        position: absolute;
        top: 64px;
        left: 0;
        right: 0;
        background: rgba(13, 15, 26, 0.95);
        backdrop-filter: blur(20px);
        flex-direction: column;
        padding: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .nav-links.open { display: flex; }
    }
  `;

  constructor() {
    super();
    this.user = null;
    this.menuOpen = false;
    this._loadUser();
    window.addEventListener('user-changed', () => this._loadUser());
  }

  _loadUser() {
    const stored = localStorage.getItem('user');
    this.user = stored ? JSON.parse(stored) : null;
  }

  _logout() {
    localStorage.removeItem('user');
    this.user = null;
    window.dispatchEvent(new CustomEvent('user-changed'));
    window.location.href = '/';
  }

  _toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  render() {
    return html`
      <nav role="navigation" aria-label="Main navigation">
        <div class="nav-inner">
          <a href="/" class="logo" aria-label="Collectible Trading Post Home">
            <div class="logo-icon">🏪</div>
            <span>Trading Post</span>
          </a>

          <button class="mobile-toggle" @click=${this._toggleMenu} aria-label="Toggle menu">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <div class="nav-links ${this.menuOpen ? 'open' : ''}">
            <a href="/" class="nav-link">Marketplace</a>
            ${this.user ? html`
              <div class="user-info">
                <div class="avatar">${this.user.name?.charAt(0).toUpperCase()}</div>
                <span class="user-name">${this.user.name}</span>
                <button class="btn-logout" @click=${this._logout}>Logout</button>
              </div>
            ` : html`
              <a href="/login" class="btn-login">Sign In</a>
            `}
          </div>
        </div>
      </nav>
    `;
  }
}

customElements.define('app-header', AppHeader);
