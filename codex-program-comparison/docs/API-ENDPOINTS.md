# API Endpoints (Blueprint)

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | /api/auth/register | User registration | No |
| POST | /api/auth/login | Issue JWT + refresh token | No |
| POST | /api/auth/refresh | Exchange refresh token for new access token | No (requires valid refresh) |
| GET | /api/auth/me | Get current user profile/preferences | Yes |
| POST | /api/auth/logout | Revoke refresh token | Yes |
| POST | /api/auth/enable-mfa | Enable MFA for account | Yes |
| GET | /api/crypto/assets | List supported assets | No |
| GET | /api/crypto/assets/{symbol} | Asset details + latest snapshot | No |
| GET | /api/crypto/markets/live | Live metrics (price, volume, change) | No |
| GET | /api/crypto/orderbook/{symbol} | Order book snapshot | No |
| GET | /api/crypto/history/{symbol} | Historical OHLCV by interval | No |
| POST | /api/crypto/compare | Compare multiple symbols | No |
| GET | /api/crypto/list | All supported assets | No |
| GET | /api/crypto/{id} | Single asset details | No |
| GET | /api/crypto/{id}/history | Price history | No |
| GET | /api/crypto/top | Top gainers/losers | No |
| POST | /api/crypto/compare | Compare multiple symbols | No |
| GET | /api/alerts | List user alert rules | Yes |
| POST | /api/alerts | Create alert rule (price/volume) | Yes |
| PUT | /api/alerts/{id} | Update alert rule | Yes |
| DELETE | /api/alerts/{id} | Delete alert rule | Yes |
| GET | /api/portfolio | List portfolios with positions | Yes |
| POST | /api/portfolio | Create portfolio | Yes |
| PUT | /api/portfolio/{id} | Update portfolio metadata | Yes |
| DELETE | /api/portfolio/{id} | Delete portfolio | Yes |
| POST | /api/portfolio/{id}/positions | Add/update position | Yes |
| DELETE | /api/portfolio/{id}/positions/{positionId} | Remove position | Yes |
| GET | /api/store/products | List store products | No |
| GET | /api/store/products/{id} | Product details | No |
| GET | /api/cart | Get current cart | Yes |
| POST | /api/cart/items | Add/update cart item | Yes |
| DELETE | /api/cart/items/{id} | Remove item | Yes |
| POST | /api/cart/checkout | Visual checkout; clears cart | Yes |
| GET | /api/user/preferences | Get user preferences/watchlist | Yes |
| PUT | /api/user/preferences | Update preferences/watchlist | Yes |
| GET | /api/health | Liveness/readiness checks | No |
| GET | /hubs/market | SignalR hub for live market streams | Yes (query token supported) |
| GET | /hubs/alerts | SignalR hub for alert pushes | Yes |

## Auth Endpoint Examples

### Register
Request:
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "StrongPass!234"
}
```
Response 201:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "base64-refresh-token",
  "accessTokenExpiresAt": "2024-12-01T12:00:00Z",
  "tokenType": "Bearer",
  "userId": "uuid",
  "email": "user@example.com",
  "roles": ["User"]
}
```

### Login
Request:
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "StrongPass!234"
}
```
Response 200: same shape as Register response.

### Refresh
Request:
```json
POST /api/auth/refresh
{
  "refreshToken": "base64-refresh-token"
}
```
Response 200: new access/refresh tokens (same response shape).

### Logout
Request:
```json
POST /api/auth/logout
Authorization: Bearer <access-token>
{
  "refreshToken": "base64-refresh-token"
}
```
Response 204 No Content.

### Me
Request:
```json
GET /api/auth/me
Authorization: Bearer <access-token>
```
Response 200:
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "roles": ["User"]
}
```

## Crypto Endpoint Examples

### List
```
GET /api/crypto/list
```
Response 200 (truncated):
```json
[
  { "id": "bitcoin", "symbol": "BTC", "name": "Bitcoin", "price": 62000.0, "change24hPct": 1.2, "volume24h": 1200000000, "marketCap": 1200000000000 }
]
```

### Asset Details
```
GET /api/crypto/bitcoin
```
Response 200:
```json
{
  "id": "bitcoin",
  "symbol": "BTC",
  "name": "Bitcoin",
  "price": 62000.0,
  "change24hPct": 1.2,
  "volume24h": 1200000000,
  "marketCap": 1200000000000,
  "supply": 19500000,
  "maxSupply": 21000000,
  "high24h": 62500.0,
  "low24h": 60000.0,
  "change7dPct": 3.1,
  "change30dPct": 12.4
}
```

### History
```
GET /api/crypto/bitcoin/history?days=1
```
Response 200:
```json
[
  { "timestamp": "2024-12-01T12:00:00Z", "price": 61500.0 }
]
```

### Top Movers
```
GET /api/crypto/top
```
Response 200: same shape as list, ordered by 24h change.

### Compare
```
POST /api/crypto/compare
{
  "assetIds": ["bitcoin", "ethereum"]
}
```
Response 200:
```json
{
  "assets": [
    { "id": "bitcoin", "symbol": "BTC", "price": 62000, "change24hPct": 1.2, "volume24h": 1200000000, "marketCap": 1200000000000 },
    { "id": "ethereum", "symbol": "ETH", "price": 3200, "change24hPct": 1.8, "volume24h": 800000000, "marketCap": 400000000000 }
  ]
}
```

## Store Endpoint Examples

### Products
```
GET /api/store/products
```
Response 200:
```json
[
  { "id": "uuid", "name": "Ledger Nano S Plus", "description": "Hardware wallet for secure storage.", "price": 79, "category": "hardware" }
]
```

### Cart (authed)
```
GET /api/cart
Authorization: Bearer <access-token>
```
Response 200:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "items": [
    { "id": "uuid", "productId": "uuid", "productName": "Ledger Nano S Plus", "quantity": 2, "unitPrice": 79, "subtotal": 158 }
  ],
  "total": 158
}
```

### Add to Cart
```
POST /api/cart/items
Authorization: Bearer <access-token>
{
  "productId": "uuid",
  "quantity": 1
}
```
Response 201: cart object (same shape as above).

### Checkout (demo)
```
POST /api/cart/checkout
Authorization: Bearer <access-token>
```
Response 200:
```json
{
  "cartId": "uuid",
  "message": "Cart cleared (demo only, no payment).",
  "clearedAt": "2024-12-01T12:00:00Z"
}
```

## Portfolio / Alerts Examples

### Create Portfolio
```
POST /api/portfolio
Authorization: Bearer <access-token>
{
  "name": "Long-term",
  "riskTolerance": "medium"
}
```
Response 201: portfolio with empty positions.

### Add Position
```
POST /api/portfolio/{id}/positions
{
  "cryptoAssetId": "bitcoin",
  "quantity": 0.5,
  "avgPrice": 60000
}
```
Response 200: updated portfolio with positions and PnL/value.

### Create Alert
```
POST /api/alerts
{
  "cryptoAssetId": "ethereum",
  "conditionType": "price_up",
  "direction": "above",
  "thresholdValue": 3500,
  "channel": "email"
}
```
Response 201: alert definition.
