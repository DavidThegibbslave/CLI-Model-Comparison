# API Endpoints Blueprint

## Authentication

### POST `/api/auth/register`
Registers a new user.
**Request:**
```json
{
  "username": "crypto_trader",
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```
**Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "d8s7...",
  "username": "crypto_trader",
  "email": "user@example.com"
}
```

### POST `/api/auth/login`
Authenticates a user and returns tokens.
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```
**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "d8s7...",
  "username": "crypto_trader",
  "email": "user@example.com"
}
```

### POST `/api/auth/refresh`
Refreshes an expired access token.
**Request:**
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "d8s7..."
}
```
**Response (200 OK):**
```json
{
  "accessToken": "new_access_token...",
  "refreshToken": "new_refresh_token...",
  "username": "crypto_trader",
  "email": "user@example.com"
}
```

### GET `/api/auth/me`
Gets the current authenticated user's profile.
**Header:** `Authorization: Bearer <token>`
**Response (200 OK):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "username": "crypto_trader",
  "email": "user@example.com",
  "role": "User"
}
```

## Market Data

### GET `/api/crypto/list?limit=20`
Returns a list of top cryptocurrencies with real-time market data.
**Response (200 OK):**
```json
[
  {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "current_price": 65432.10,
    "market_cap": 1200000000000,
    "price_change_percentage_24h": 2.5
  },
  ...
]
```

### GET `/api/crypto/{id}`
Get details for a specific asset (e.g., `bitcoin`).
**Response (200 OK):**
```json
{
  "id": "bitcoin",
  "name": "Bitcoin",
  "current_price": 65432.10,
  ...
}
```

### GET `/api/crypto/{id}/history?days=7`
Get historical price data for charting.
**Response (200 OK):**
```json
[
  [1701234567000, 65000.00], // [Timestamp, Price]
  [1701234568000, 65100.00]
]
```

### POST `/api/crypto/compare`
Compares multiple assets side-by-side.
**Request:**
```json
{
  "assetIds": ["bitcoin", "ethereum", "solana"]
}
```
**Response (200 OK):**
```json
[
  { "id": "bitcoin", "current_price": 65000, ... },
  { "id": "ethereum", "current_price": 3500, ... }
]
```

## SignalR Real-Time Updates
**Hub Endpoint:** `/cryptohub`
**Events:**
- `ReceivePrices(List<CoinGeckoPriceResponse> prices)`: Broadcasted every 60 seconds.

## Visual Store

### GET `/api/store/products`
List all available merchandise.
**Response (200 OK):**
```json
[
  {
    "id": "11111111-...",
    "name": "Bitcoin Hoodie",
    "price": 49.99,
    "imageUrl": "...",
    "category": "Apparel"
  }
]
```

### GET `/api/store/cart` (Auth Required)
Get the current user's shopping cart.
**Response (200 OK):**
```json
{
  "id": "...",
  "totalPrice": 74.98,
  "items": [
    {
      "productId": "11111111-...",
      "productName": "Bitcoin Hoodie",
      "quantity": 1,
      "price": 49.99
    }
  ]
}
```

### POST `/api/store/cart/items` (Auth Required)
Add item to cart.
**Request:**
```json
{
  "productId": "11111111-...",
  "quantity": 1
}
```
**Response (201 Created):** (Empty or updated cart)

### DELETE `/api/store/cart/items/{itemId}` (Auth Required)
Remove item from cart.
**Response (204 No Content)**

### POST `/api/store/checkout` (Auth Required)
Visual checkout (clears cart).
**Response (200 OK):**
```json
{ "message": "Checkout successful! (Visual demo only)" }
```

## Portfolio (Simulated Trading)
| Method | Route | Purpose | Auth Required |
|--------|-------|---------|---------------|
| GET | `/api/portfolios` | Get user's portfolios | Yes |
| POST | `/api/portfolios` | Create a new portfolio | Yes |
| GET | `/api/portfolios/{id}` | Get portfolio details & positions | Yes |
| POST | `/api/portfolios/{id}/buy` | Execute a BUY order | Yes |
| POST | `/api/portfolios/{id}/sell` | Execute a SELL order | Yes |
| GET | `/api/portfolios/{id}/transactions` | Get transaction history | Yes |