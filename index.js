import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import itemsRouter from './routes/items.js';
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// ─── WebSocket Server ───────────────────────────────────────────────
const wss = new WebSocketServer({ server });
const clients = new Map(); // Map<ws, { userId, itemId }>

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const userId = url.searchParams.get('userId');
  const itemId = url.searchParams.get('itemId');

  clients.set(ws, { userId, itemId });
  console.log(`WebSocket connected: user=${userId}, item=${itemId}`);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      const messagesPath = join(__dirname, 'data', 'messages.json');
      const messages = JSON.parse(readFileSync(messagesPath, 'utf-8'));

      const newMessage = {
        id: uuidv4(),
        itemId: message.itemId,
        senderId: message.senderId,
        senderName: message.senderName,
        content: message.content,
        type: message.type || 'text',
        price: message.price || null,
        originalPrice: message.originalPrice || null,
        status: message.status || null,
        timestamp: new Date().toISOString()
      };

      messages.push(newMessage);
      writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

      // Broadcast to all clients watching this item
      wss.clients.forEach((client) => {
        const info = clients.get(client);
        if (info && info.itemId === message.itemId && client.readyState === 1) {
          client.send(JSON.stringify(newMessage));
        }
      });
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`WebSocket disconnected: user=${userId}`);
  });

  // Send existing messages for this item on connect
  try {
    const messagesPath = join(__dirname, 'data', 'messages.json');
    const messages = JSON.parse(readFileSync(messagesPath, 'utf-8'));
    const itemMessages = messages
      .filter(m => m.itemId === itemId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    ws.send(JSON.stringify({ type: 'history', messages: itemMessages }));
  } catch (err) {
    console.error('Error sending message history:', err);
  }
});

// ─── Middleware ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS view engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Serve static files
app.use(express.static(join(__dirname, 'public')));

// ─── Ensure data directory exists ───────────────────────────────────
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// ─── Initialize sample data ────────────────────────────────────────
const initDataFiles = () => {
  const itemsPath = join(dataDir, 'items.json');
  if (!existsSync(itemsPath)) {
    const sampleItems = [
      {
        id: '1',
        name: 'Vintage Comic Book - Spider-Man #1',
        description: 'Rare collectible comic in mint condition, never opened. First appearance of Spider-Man in a standalone issue. A must-have for any serious comic book collector.',
        price: 500,
        image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400',
        sellerId: 'user1',
        sellerName: 'ComicCollector',
        status: 'active',
        highestOffer: null,
        highestOfferBuyer: null,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Limited Edition Funko Pop - Batman',
        description: 'Rare convention exclusive Funko Pop figure, still sealed in original box. #42 in the DC Universe line. Limited to 1000 pieces worldwide.',
        price: 150,
        image: 'https://images.unsplash.com/photo-1581235725079-7c7783e6a2df?w=400',
        sellerId: 'user2',
        sellerName: 'ToyTrader',
        status: 'active',
        highestOffer: null,
        highestOfferBuyer: null,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Pokemon Card - Charizard Holo',
        description: 'First edition holographic Charizard card, graded PSA 9. One of the most sought-after Pokemon cards in existence. Comes with certificate of authenticity.',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1621274403997-37aace184f49?w=400',
        sellerId: 'user3',
        sellerName: 'CardMaster',
        status: 'active',
        highestOffer: null,
        highestOfferBuyer: null,
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Star Wars Action Figure - Darth Vader',
        description: 'Original 1977 Star Wars action figure in pristine packaging. Factory sealed with original price tag. Authenticated by a professional grading service.',
        price: 850,
        image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf4f2?w=400',
        sellerId: 'user1',
        sellerName: 'ComicCollector',
        status: 'active',
        highestOffer: null,
        highestOfferBuyer: null,
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Magic: The Gathering - Black Lotus',
        description: 'Limited edition Black Lotus card in near mint condition. The crown jewel of any MTG collection. Includes hard plastic protective case.',
        price: 3000,
        image: 'https://images.unsplash.com/photo-1616901826816-7045fc2e8a8d?w=400',
        sellerId: 'user2',
        sellerName: 'ToyTrader',
        status: 'active',
        highestOffer: null,
        highestOfferBuyer: null,
        createdAt: new Date().toISOString()
      }
    ];
    writeFileSync(itemsPath, JSON.stringify(sampleItems, null, 2));
  }

  const usersPath = join(dataDir, 'users.json');
  if (!existsSync(usersPath)) {
    const sampleUsers = [
      { id: 'user1', name: 'ComicCollector', createdAt: new Date().toISOString() },
      { id: 'user2', name: 'ToyTrader', createdAt: new Date().toISOString() },
      { id: 'user3', name: 'CardMaster', createdAt: new Date().toISOString() }
    ];
    writeFileSync(usersPath, JSON.stringify(sampleUsers, null, 2));
  }

  const messagesPath = join(dataDir, 'messages.json');
  if (!existsSync(messagesPath)) {
    const sampleMessages = [
      {
        id: 'msg1',
        itemId: '1',
        senderId: 'user2',
        senderName: 'ToyTrader',
        content: 'Is this comic still available?',
        type: 'text',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'msg2',
        itemId: '1',
        senderId: 'user1',
        senderName: 'ComicCollector',
        content: 'Yes, it is! Interested?',
        type: 'text',
        timestamp: new Date(Date.now() - 86000000).toISOString()
      },
      {
        id: 'msg3',
        itemId: '1',
        senderId: 'user2',
        senderName: 'ToyTrader',
        content: '450',
        type: 'offer',
        price: 450,
        originalPrice: 500,
        status: 'pending',
        timestamp: new Date(Date.now() - 85000000).toISOString()
      }
    ];
    writeFileSync(messagesPath, JSON.stringify(sampleMessages, null, 2));
  }
};

initDataFiles();

// ─── API Routes ─────────────────────────────────────────────────────
app.use('/api/items', itemsRouter);
app.use('/api/users', usersRouter);
app.use('/api/messages', messagesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── Page Routes (EJS - Server determines components) ───────────────
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Collectible Trading Post',
    page: 'marketplace',
    components: ['app-header', 'search-bar', 'item-grid', 'item-card', 'notification-toast', 'sell-item-form']
  });
});

app.get('/item/:id', (req, res) => {
  try {
    const itemsPath = join(dataDir, 'items.json');
    const items = JSON.parse(readFileSync(itemsPath, 'utf-8'));
    const item = items.find(i => i.id === req.params.id);

    if (!item) {
      return res.status(404).render('index', {
        title: 'Item Not Found',
        page: 'not-found',
        components: ['app-header', 'notification-toast']
      });
    }

    res.render('item', {
      title: `${item.name} - Collectible Trading Post`,
      page: 'item-detail',
      item: JSON.stringify(item),
      components: ['app-header', 'item-detail', 'chat-panel', 'offer-form', 'checkout-modal', 'notification-toast']
    });
  } catch (error) {
    console.error('Error rendering item page:', error);
    res.status(500).render('index', {
      title: 'Error',
      page: 'error',
      components: ['app-header']
    });
  }
});

app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login - Collectible Trading Post',
    page: 'login',
    components: ['app-header', 'login-form', 'notification-toast']
  });
});

// ─── Error handling ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ─── Start server ───────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📂 Data directory: ${dataDir}`);
  console.log(`🔌 WebSocket server ready`);
});