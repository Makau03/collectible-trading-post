/**
 * LoginForm - Authentication form for login and registration
 * Stores user session in localStorage
 * @element login-form
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class LoginForm extends LitElement {
  static properties = {
    mode: { type: String, state: true },
    username: { type: String, state: true },
    password: { type: String, state: true },
    error: { type: String, state: true },
    loading: { type: Boolean, state: true },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 440px;
    }

    .form-card {
      background: rgba(30, 34, 53, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 40px 36px;
      text-align: center;
    }

    .form-icon {
      width: 64px;
      height: 64px;
      border-radius: 18px;
      background: linear-gradient(135deg, #4c6ef5, #7048e8);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 1.8rem;
    }

    h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.6rem;
      font-weight: 700;
      color: #e2e6f0;
      margin-bottom: 6px;
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.9rem;
      margin-bottom: 28px;
    }

    .field {
      margin-bottom: 18px;
      text-align: left;
    }

    label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      color: #c9cfe0;
      margin-bottom: 6px;
    }

    input {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px 16px;
      color: #e2e6f0;
      font-size: 0.95rem;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }
    input:focus {
      outline: none;
      border-color: #4c6ef5;
      box-shadow: 0 0 0 3px rgba(76, 110, 245, 0.15);
    }
    input::placeholder {
      color: rgba(255, 255, 255, 0.25);
    }

    .error-msg {
      background: rgba(201, 42, 42, 0.12);
      border: 1px solid rgba(201, 42, 42, 0.3);
      color: #ff8787;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 0.85rem;
      margin-bottom: 16px;
      text-align: left;
    }

    .submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #4c6ef5 0%, #7048e8 100%);
      color: white;
      padding: 14px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
      margin-bottom: 16px;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(76, 110, 245, 0.35);
    }
    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .toggle-text {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.4);
    }

    .toggle-link {
      color: #748ffc;
      cursor: pointer;
      font-weight: 600;
      background: none;
      border: none;
      font-size: 0.85rem;
      font-family: inherit;
      transition: color 0.2s;
    }
    .toggle-link:hover {
      color: #91a7ff;
    }

    .spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      vertical-align: middle;
      margin-right: 8px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  constructor() {
    super();
    this.mode = 'login';
    this.username = '';
    this.password = '';
    this.error = '';
    this.loading = false;
  }

  _toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
  }

  async _submit(e) {
    e.preventDefault();
    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const endpoint = this.mode === 'register' ? '/api/users/register' : '/api/users/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: this.username.trim(), password: this.password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store user session
      localStorage.setItem('user', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('user-changed'));

      // Show success notification
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: this.mode === 'register' ? 'Account created! Welcome!' : `Welcome back, ${data.name}!`, type: 'success' }
      }));

      // Redirect to marketplace
      window.location.href = '/';
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="form-card">
        <div class="form-icon">🏪</div>
        <h2>${this.mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        <p class="subtitle">
          ${this.mode === 'login' ? 'Sign in to start trading collectibles' : 'Join the collectible trading community'}
        </p>

        ${this.error ? html`<div class="error-msg">${this.error}</div>` : ''}

        <form @submit=${this._submit}>
          <div class="field">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              .value=${this.username}
              @input=${(e) => this.username = e.target.value}
              autocomplete="username"
              required
            />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              .value=${this.password}
              @input=${(e) => this.password = e.target.value}
              autocomplete=${this.mode === 'register' ? 'new-password' : 'current-password'}
              required
              minlength="3"
            />
          </div>

          <button type="submit" class="submit-btn" ?disabled=${this.loading}>
            ${this.loading ? html`<span class="spinner"></span>` : ''}
            ${this.mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p class="toggle-text">
          ${this.mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button class="toggle-link" @click=${this._toggleMode}>
            ${this.mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    `;
  }
}

customElements.define('login-form', LoginForm);
