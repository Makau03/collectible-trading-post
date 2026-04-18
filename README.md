# Collectible Trading Post 🏪

A social marketplace for buying, selling, and trading rare collectibles. Built with EJS (server-side rendering), Lit (client-side web components), and Tailwind CSS.

## Features

- **Browse & Search** — Search collectibles by keyword with debounced, real-time results
- **List Items** — Sellers can create new listings with name, description, price, and images
- **Price Negotiation** — Buyers can propose alternative prices via the offer system
- **Real-Time Chat** — Direct messaging between buyer and seller using WebSocket (with HTTP polling fallback)
- **Checkout & Payment** — Buyers confirm payment; sellers confirm receipt and complete the sale
- **Responsive Design** — Works across desktop, tablet, and mobile devices

## Architecture

```
server/
├── index.js              # Express server with EJS, WebSocket, API routes
├── views/                # EJS templates (server-side rendered page shells)
│   ├── layout.ejs        # Main HTML layout with Tailwind + Lit imports
│   ├── index.ejs         # Marketplace homepage
│   ├── item.ejs          # Item detail page
│   └── login.ejs         # Authentication page
├── public/               # Static assets
│   ├── css/styles.css    # Custom styles, animations, glassmorphism
│   └── js/components/    # Lit web components
│       ├── app-header.js
│       ├── search-bar.js
│       ├── item-card.js
│       ├── item-grid.js
│       ├── item-detail.js
│       ├── chat-panel.js
│       ├── offer-form.js
│       ├── checkout-modal.js
│       ├── login-form.js
│       ├── notification-toast.js
│       └── sell-item-form.js
├── routes/               # Express API routes
│   ├── items.js          # CRUD for items + checkout/confirm-sale
│   ├── users.js          # Authentication (login/register)
│   └── messages.js       # Messaging + polling + mark-as-read
├── data/                 # JSON file-based storage
└── ADR.md                # Architecture Decision Records
```

### Key Design Decisions

- **Server-Determined Components**: EJS templates receive a `components` array from the server, controlling which Lit components are loaded per page
- **WebSocket + HTTP Polling**: Real-time messaging via WebSocket with automatic fallback to HTTP polling
- **Shadow DOM Encapsulation**: Each Lit component has encapsulated styles, preventing CSS conflicts

See [ADR.md](./ADR.md) for detailed architecture decisions.

## Tech Stack

| Layer         | Technology                |
|---------------|---------------------------|
| Server        | Node.js, Express          |
| Templating    | EJS                       |
| Components    | Lit (Web Components)      |
| Styling       | Tailwind CSS + Custom CSS |
| Real-time     | WebSocket (`ws`)          |
| Storage       | JSON files (file-based)   |

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm

### Installation

```bash
cd server
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production

```bash
npm start
```

## API Endpoints

### Items
| Method | Endpoint                     | Description                    |
|--------|------------------------------|--------------------------------|
| GET    | `/api/items`                 | List all active items          |
| GET    | `/api/items?search=keyword`  | Search items by keyword        |
| GET    | `/api/items/:id`             | Get a single item              |
| POST   | `/api/items`                 | Create a new listing           |
| PUT    | `/api/items/:id`             | Update an item                 |
| DELETE | `/api/items/:id`             | Delete an item                 |
| POST   | `/api/items/:id/checkout`    | Buyer confirms payment         |
| POST   | `/api/items/:id/confirm-sale`| Seller confirms and removes    |

### Users
| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| POST   | `/api/users/login`          | Login or auto-register |
| POST   | `/api/users/register`       | Register new user      |
| GET    | `/api/users`                | List all users         |
| GET    | `/api/users/:id`            | Get single user        |

### Messages
| Method | Endpoint                                 | Description                |
|--------|------------------------------------------|----------------------------|
| GET    | `/api/messages/item/:itemId`             | Get messages for an item   |
| POST   | `/api/messages`                          | Send a message             |
| GET    | `/api/messages/item/:itemId/poll/:ts`    | Poll for new messages      |
| GET    | `/api/messages/unread/:userId`           | Get unread count           |
| POST   | `/api/messages/read`                     | Mark messages as read      |

### WebSocket
Connect to `ws://host?userId=xxx&itemId=xxx` for real-time messaging.

## Deployment

Deployed on [Render](https://render.com) as a Node.js web service.

## License

MIT
