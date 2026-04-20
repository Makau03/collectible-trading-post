/**
 * ChatPanel - Real-time messaging between buyer and seller using WebSocket
 * Falls back to HTTP polling if WebSocket is unavailable
 * @element chat-panel
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class ChatPanel extends LitElement {
  static properties = {
    itemId: { type: String, attribute: 'item-id' },
    userId: { type: String, attribute: 'user-id' },
    userName: { type: String, attribute: 'user-name' },
    sellerId: { type: String, attribute: 'seller-id' },
    messages: { type: Array, state: true },
    newMessage: { type: String, state: true },
    connected: { type: Boolean, state: true },
    loading: { type: Boolean, state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .chat-container {
      background: rgba(30, 34, 53, 0.6);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      height: 500px;
      overflow: hidden;
    }

    .chat-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .chat-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: #e2e6f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .status-dot.online {
      background: #37b24d;
      box-shadow: 0 0 8px rgba(55, 178, 77, 0.5);
    }
    .status-dot.offline {
      background: #868e96;
    }

    .status-text {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
    }

    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .messages-area::-webkit-scrollbar {
      width: 4px;
    }
    .messages-area::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
    }

    .message {
      display: flex;
      flex-direction: column;
      max-width: 80%;
      animation: msgIn 0.3s ease-out;
    }

    @keyframes msgIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message.sent {
      align-self: flex-end;
      align-items: flex-end;
    }
    .message.received {
      align-self: flex-start;
      align-items: flex-start;
    }

    .msg-sender {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.35);
      margin-bottom: 4px;
      font-weight: 500;
    }

    .msg-bubble {
      padding: 10px 16px;
      border-radius: 18px;
      font-size: 0.9rem;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .sent .msg-bubble {
      background: linear-gradient(135deg, #4c6ef5, #5c7cfa);
      color: white;
      border-bottom-right-radius: 4px;
    }
    .received .msg-bubble {
      background: rgba(255, 255, 255, 0.08);
      color: #e2e6f0;
      border-bottom-left-radius: 4px;
    }

    .msg-bubble.offer-bubble {
      background: linear-gradient(135deg, rgba(240, 140, 0, 0.2), rgba(240, 140, 0, 0.1));
      border: 1px solid rgba(240, 140, 0, 0.3);
      color: #ffd43b;
      border-radius: 14px;
      padding: 14px 18px;
    }

    .offer-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
      margin-bottom: 4px;
      color: rgba(255, 212, 59, 0.7);
    }

    .offer-price {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
    }

    .offer-actions {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }

    .offer-btn {
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .offer-accept {
      background: #37b24d;
      color: white;
    }
    .offer-accept:hover { background: #2b8a3e; }
    .offer-reject {
      background: rgba(255, 255, 255, 0.08);
      color: #c9cfe0;
    }
    .offer-reject:hover { background: rgba(255, 255, 255, 0.12); }

    .offer-status {
      font-size: 0.75rem;
      margin-top: 6px;
      font-weight: 600;
    }
    .offer-accepted { color: #69db7c; }
    .offer-rejected { color: #ff8787; }

    .msg-time {
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.25);
      margin-top: 4px;
    }

    .system-message {
      text-align: center;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.3);
      padding: 8px 0;
      font-style: italic;
    }

    .empty-chat {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.25);
      text-align: center;
      gap: 12px;
    }
    .empty-chat-icon { font-size: 2.5rem; opacity: 0.5; }
    .empty-chat-text { font-size: 0.9rem; }

    /* Input Area */
    .input-area {
      padding: 14px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      gap: 10px;
    }

    .input-area input {
      flex: 1;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 10px 16px;
      color: #e2e6f0;
      font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      transition: border-color 0.2s;
    }
    .input-area input:focus {
      outline: none;
      border-color: #4c6ef5;
    }
    .input-area input::placeholder {
      color: rgba(255, 255, 255, 0.25);
    }

    .send-btn {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4c6ef5, #5c7cfa);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .send-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(76, 110, 245, 0.3);
    }
    .send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
    }
  `;

  constructor() {
    super();
    this.messages = [];
    this.newMessage = '';
    this.connected = false;
    this.loading = true;
    this._ws = null;
    this._pollInterval = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.itemId && this.userId) {
      this._connectWebSocket();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._ws) this._ws.close();
    if (this._pollInterval) clearInterval(this._pollInterval);
  }

  _connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}?userId=${this.userId}&itemId=${this.itemId}`;

    try {
      this._ws = new WebSocket(wsUrl);

      this._ws.onopen = () => {
        this.connected = true;
        this.loading = false;
        console.log('WebSocket connected');
      };

      this._ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'history') {
          this.messages = data.messages || [];
        } else {
          // Single new message
          this.messages = [...this.messages, data];
        }

        this.requestUpdate();
        this._scrollToBottom();
      };

      this._ws.onclose = () => {
        this.connected = false;
        console.log('WebSocket disconnected, falling back to polling');
        this._startPolling();
      };

      this._ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        this.connected = false;
        this._startPolling();
      };
    } catch (err) {
      console.error('WebSocket connection failed:', err);
      this._startPolling();
    }
  }

  _startPolling() {
    this.loading = false;
    // Initial fetch
    this._pollMessages();
    // Poll every 2 seconds
    this._pollInterval = setInterval(() => this._pollMessages(), 2000);
  }

  async _pollMessages() {
    try {
      const lastTs = this.messages.length > 0
        ? this.messages[this.messages.length - 1].timestamp
        : new Date(0).toISOString();

      const res = await fetch(`/api/messages/item/${this.itemId}/poll/${lastTs}`);
      const data = await res.json();

      if (data.hasNew && data.messages.length > 0) {
        this.messages = [...this.messages, ...data.messages];
        this._scrollToBottom();
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  }

  _scrollToBottom() {
    setTimeout(() => {
      const area = this.shadowRoot?.querySelector('.messages-area');
      if (area) area.scrollTop = area.scrollHeight;
    }, 50);
  }

  _sendMessage() {
    if (!this.newMessage.trim()) return;

    const msg = {
      itemId: this.itemId,
      senderId: this.userId,
      senderName: this.userName,
      content: this.newMessage.trim(),
      type: 'text'
    };

    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify(msg));
    } else {
      // Fallback: HTTP POST
      this._sendMessageHTTP(msg);
    }

    this.newMessage = '';
  }

  async _sendMessageHTTP(msg) {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      if (res.ok) {
        const saved = await res.json();
        this.messages = [...this.messages, saved];
        this._scrollToBottom();
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  }

  _handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this._sendMessage();
    }
  }

  async _handleOfferAction(messageId, action) {
    try {
      // Update the message status
      const messages = this.messages.map(m => {
        if (m.id === messageId) {
          return { ...m, status: action };
        }
        return m;
      });
      this.messages = messages;

      // If accepted, update the item's highest offer and price
      if (action === 'accepted') {
        const offerMsg = this.messages.find(m => m.id === messageId);
        if (offerMsg) {
          await fetch(`/api/items/${this.itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              highestOffer: offerMsg.price,
              highestOfferBuyer: offerMsg.senderId,
              price: offerMsg.price
            })
          });

          // Notify parent components that the price has changed
          this.dispatchEvent(new CustomEvent('price-updated', {
            detail: { newPrice: offerMsg.price, offerId: messageId },
            bubbles: true,
            composed: true
          }));
        }

        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Offer accepted! Price updated.', type: 'success' }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Offer rejected.', type: 'info' }
        }));
      }

      // Send system message
      const systemMsg = {
        itemId: this.itemId,
        senderId: this.userId,
        senderName: this.userName,
        content: `Offer ${action}`,
        type: 'system'
      };

      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        this._ws.send(JSON.stringify(systemMsg));
      }
    } catch (err) {
      console.error('Offer action error:', err);
    }
  }

  _formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  _renderMessage(msg) {
    if (msg.type === 'system') {
      return html`<div class="system-message">${msg.content}</div>`;
    }

    const isSent = msg.senderId === this.userId;
    const isSeller = this.userId === this.sellerId;

    return html`
      <div class="message ${isSent ? 'sent' : 'received'}">
        <span class="msg-sender">${isSent ? 'You' : msg.senderName}</span>
        ${msg.type === 'offer' ? html`
          <div class="msg-bubble offer-bubble">
            <div class="offer-label">💰 Price Offer</div>
            <div class="offer-price">$${Number(msg.price).toLocaleString()}</div>
            <div style="font-size:0.8rem;color:rgba(255,212,59,0.6);margin-top:4px">
              Original: $${Number(msg.originalPrice).toLocaleString()}
            </div>
            ${msg.status === 'pending' && isSeller && !isSent ? html`
              <div class="offer-actions">
                <button class="offer-btn offer-accept" @click=${() => this._handleOfferAction(msg.id, 'accepted')}>Accept</button>
                <button class="offer-btn offer-reject" @click=${() => this._handleOfferAction(msg.id, 'rejected')}>Reject</button>
              </div>
            ` : msg.status !== 'pending' ? html`
              <div class="offer-status ${msg.status === 'accepted' ? 'offer-accepted' : 'offer-rejected'}">
                ${msg.status === 'accepted' ? '✓ Accepted' : '✕ Rejected'}
              </div>
            ` : html`
              <div class="offer-status" style="color: rgba(255,212,59,0.6);">⏳ Pending</div>
            `}
          </div>
        ` : html`
          <div class="msg-bubble">${msg.content}</div>
        `}
        <span class="msg-time">${this._formatTime(msg.timestamp)}</span>
      </div>
    `;
  }

  render() {
    return html`
      <div class="chat-container">
        <div class="chat-header">
          <div class="chat-title">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            Messages
          </div>
          <div>
            <span class="status-dot ${this.connected ? 'online' : 'offline'}"></span>
            <span class="status-text">${this.connected ? 'Live' : 'Polling'}</span>
          </div>
        </div>

        <div class="messages-area" role="log" aria-label="Chat messages">
          ${this.loading ? html`
            <div class="empty-chat">
              <div style="width:24px;height:24px;border:2px solid rgba(76,110,245,0.3);border-top-color:#4c6ef5;border-radius:50%;animation:spin 0.7s linear infinite"></div>
              <span>Connecting...</span>
            </div>
          ` : this.messages.length === 0 ? html`
            <div class="empty-chat">
              <div class="empty-chat-icon">💬</div>
              <div class="empty-chat-text">No messages yet.<br>Start the conversation!</div>
            </div>
          ` : html`
            ${this.messages.map(msg => this._renderMessage(msg))}
          `}
        </div>

        <div class="input-area">
          <input
            type="text"
            placeholder="Type a message..."
            .value=${this.newMessage}
            @input=${(e) => this.newMessage = e.target.value}
            @keydown=${this._handleKeyDown}
            aria-label="Message input"
          />
          <button class="send-btn" @click=${this._sendMessage} ?disabled=${!this.newMessage.trim()} aria-label="Send message">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define('chat-panel', ChatPanel);
