# API Endpoints Documentation

## Base URL
- **Development**: `https://localhost:7001/api`
- **Production**: `https://api.cryptomarket.com/api` (TBD)

## Authentication
Most endpoints require JWT Bearer token authentication:
```
Authorization: Bearer <access_token>
```

---

## Authentication & User Management

### POST /api/auth/register
Register a new user account.

**Auth Required**: No

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201 Created):
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "message": "Registration successful"
}
```

**Errors**:
- `400`: Validation error (email format, password strength)
- `409`: Email already exists

---

### POST /api/auth/login
Authenticate user and receive tokens.

**Auth Required**: No

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a7b8c9d0-1234-5678-90ab-cdef12345678",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "User"
  }
}
```

**Errors**:
- `400`: Invalid request format
- `401`: Invalid credentials

---

### POST /api/auth/refresh
Refresh access token using refresh token.

**Auth Required**: No

**Request Body**:
```json
{
  "refreshToken": "a7b8c9d0-1234-5678-90ab-cdef12345678"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new-refresh-token-uuid",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

**Errors**:
- `400`: Invalid or expired refresh token
- `401`: Refresh token revoked

---

### POST /api/auth/logout
Revoke refresh token (logout).

**Auth Required**: Yes

**Request Body**:
```json
{
  "refreshToken": "a7b8c9d0-1234-5678-90ab-cdef12345678"
}
```

**Response** (204 No Content)

---

### GET /api/auth/me
Get current user information.

**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "User",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLogin": "2024-01-15T10:30:00Z"
}
```

---

## Cryptocurrency Market Data

### GET /api/crypto/markets
Get list of cryptocurrencies with market data.

**Auth Required**: No (public endpoint)

**Query Parameters**:
- `page` (int, default: 1): Page number
- `perPage` (int, default: 50, max: 100): Results per page
- `sortBy` (string, default: "market_cap"): Sort field (market_cap, price, volume, price_change_24h)
- `sortOrder` (string, default: "desc"): Sort order (asc, desc)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      "currentPrice": 45250.50,
      "marketCap": 886234567890,
      "marketCapRank": 1,
      "volume24h": 28345678901,
      "priceChange24h": 1250.30,
      "priceChangePercentage24h": 2.84,
      "circulatingSupply": 19500000,
      "totalSupply": 21000000,
      "high24h": 45890.00,
      "low24h": 44100.00,
      "lastUpdated": "2024-01-15T10:35:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "perPage": 50,
    "totalPages": 20,
    "totalCount": 1000
  }
}
```

---

### GET /api/crypto/{id}
Get detailed information about a specific cryptocurrency.

**Auth Required**: No

**Path Parameters**:
- `id` (string): CoinGecko cryptocurrency ID (e.g., "bitcoin", "ethereum")

**Response** (200 OK):
```json
{
  "id": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "description": "Bitcoin is a decentralized cryptocurrency...",
  "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  "currentPrice": 45250.50,
  "marketCap": 886234567890,
  "marketCapRank": 1,
  "volume24h": 28345678901,
  "priceChange24h": 1250.30,
  "priceChangePercentage24h": 2.84,
  "priceChangePercentage7d": 5.23,
  "priceChangePercentage30d": -3.45,
  "priceChangePercentage1y": 125.67,
  "high24h": 45890.00,
  "low24h": 44100.00,
  "allTimeHigh": 69000.00,
  "allTimeHighDate": "2021-11-10T14:24:11.849Z",
  "allTimeLow": 67.81,
  "allTimeLowDate": "2013-07-06T00:00:00.000Z",
  "circulatingSupply": 19500000,
  "totalSupply": 21000000,
  "maxSupply": 21000000,
  "lastUpdated": "2024-01-15T10:35:00Z"
}
```

**Errors**:
- `404`: Cryptocurrency not found

---

### GET /api/crypto/{id}/history
Get historical price data for charting.

**Auth Required**: No

**Path Parameters**:
- `id` (string): CoinGecko cryptocurrency ID

**Query Parameters**:
- `days` (int, default: 7): Number of days (1, 7, 30, 90, 365, max)
- `interval` (string, optional): Data interval (auto-determined by days if not specified)

**Response** (200 OK):
```json
{
  "id": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "prices": [
    {
      "timestamp": "2024-01-08T00:00:00Z",
      "price": 43000.50
    },
    {
      "timestamp": "2024-01-09T00:00:00Z",
      "price": 43500.25
    }
  ],
  "marketCaps": [
    {
      "timestamp": "2024-01-08T00:00:00Z",
      "marketCap": 841234567890
    }
  ],
  "volumes": [
    {
      "timestamp": "2024-01-08T00:00:00Z",
      "volume": 25678901234
    }
  ]
}
```

---

### GET /api/crypto/compare
Compare multiple cryptocurrencies side-by-side.

**Auth Required**: No

**Query Parameters**:
- `ids` (string, required): Comma-separated list of crypto IDs (e.g., "bitcoin,ethereum,cardano")

**Response** (200 OK):
```json
{
  "cryptocurrencies": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "currentPrice": 45250.50,
      "marketCap": 886234567890,
      "volume24h": 28345678901,
      "priceChange24h": 2.84,
      "priceChange7d": 5.23,
      "priceChange30d": -3.45,
      "marketCapRank": 1
    },
    {
      "id": "ethereum",
      "symbol": "eth",
      "name": "Ethereum",
      "currentPrice": 2450.75,
      "marketCap": 294567890123,
      "volume24h": 15678901234,
      "priceChange24h": 3.12,
      "priceChange7d": 8.45,
      "priceChange30d": 12.67,
      "marketCapRank": 2
    }
  ]
}
```

**Errors**:
- `400`: Invalid or missing IDs

---

## Portfolio Management

### GET /api/portfolio
Get user's portfolio with current holdings and real-time values.

**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "id": "portfolio-uuid",
  "userId": "user-uuid",
  "totalValue": 15234.67,
  "totalInvested": 12000.00,
  "totalProfitLoss": 3234.67,
  "totalProfitLossPercentage": 26.95,
  "holdings": [
    {
      "id": "holding-uuid",
      "cryptoId": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "amount": 0.25,
      "averageBuyPrice": 40000.00,
      "currentPrice": 45250.50,
      "totalInvested": 10000.00,
      "currentValue": 11312.63,
      "profitLoss": 1312.63,
      "profitLossPercentage": 13.13,
      "firstPurchaseDate": "2024-01-01T00:00:00Z",
      "lastUpdated": "2024-01-15T10:35:00Z"
    },
    {
      "id": "holding-uuid-2",
      "cryptoId": "ethereum",
      "symbol": "eth",
      "name": "Ethereum",
      "amount": 1.5,
      "averageBuyPrice": 1333.33,
      "currentPrice": 2450.75,
      "totalInvested": 2000.00,
      "currentValue": 3676.13,
      "profitLoss": 1676.13,
      "profitLossPercentage": 83.81,
      "firstPurchaseDate": "2024-01-05T00:00:00Z",
      "lastUpdated": "2024-01-15T10:35:00Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

---

### GET /api/portfolio/transactions
Get transaction history with pagination.

**Auth Required**: Yes

**Query Parameters**:
- `page` (int, default: 1): Page number
- `pageSize` (int, default: 20, max: 100): Results per page

**Response** (200 OK):
```json
[
  {
    "id": "transaction-uuid",
    "cryptoId": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "type": "Buy",
    "amount": 0.1,
    "priceAtTransaction": 42000.00,
    "totalValue": 4200.00,
    "transactionDate": "2024-01-10T15:30:00Z"
  },
  {
    "id": "transaction-uuid-2",
    "cryptoId": "ethereum",
    "symbol": "eth",
    "name": "Ethereum",
    "type": "Buy",
    "amount": 0.5,
    "priceAtTransaction": 2400.00,
    "totalValue": 1200.00,
    "transactionDate": "2024-01-12T10:15:00Z"
  }
]
```

**Errors**:
- `400`: Invalid page or pageSize parameter
- `404`: Portfolio not found

---

### GET /api/portfolio/performance
Get comprehensive portfolio performance metrics and analytics.

**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "totalValue": 15234.67,
  "totalInvested": 12000.00,
  "totalProfitLoss": 3234.67,
  "totalProfitLossPercentage": 26.95,
  "totalHoldings": 5,
  "totalTransactions": 12,
  "bestPerformer": {
    "id": "holding-uuid",
    "cryptoId": "ethereum",
    "symbol": "eth",
    "name": "Ethereum",
    "amount": 1.5,
    "averageBuyPrice": 1333.33,
    "currentPrice": 2450.75,
    "totalInvested": 2000.00,
    "currentValue": 3676.13,
    "profitLoss": 1676.13,
    "profitLossPercentage": 83.81,
    "firstPurchaseDate": "2024-01-05T00:00:00Z",
    "lastUpdated": "2024-01-15T10:35:00Z"
  },
  "worstPerformer": {
    "id": "holding-uuid-2",
    "cryptoId": "cardano",
    "symbol": "ada",
    "name": "Cardano",
    "amount": 1000,
    "averageBuyPrice": 0.55,
    "currentPrice": 0.48,
    "totalInvested": 550.00,
    "currentValue": 480.00,
    "profitLoss": -70.00,
    "profitLossPercentage": -12.73,
    "firstPurchaseDate": "2024-01-08T00:00:00Z",
    "lastUpdated": "2024-01-15T10:35:00Z"
  },
  "allocations": [
    {
      "cryptoId": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "value": 11312.63,
      "percentage": 74.25
    },
    {
      "cryptoId": "ethereum",
      "symbol": "eth",
      "name": "Ethereum",
      "value": 3676.13,
      "percentage": 24.12
    },
    {
      "cryptoId": "cardano",
      "symbol": "ada",
      "name": "Cardano",
      "value": 245.91,
      "percentage": 1.61
    }
  ]
}
```

**Errors**:
- `404`: Portfolio not found

---

### GET /api/portfolio/holdings/{cryptoId}
Get detailed information about a specific holding in the portfolio.

**Auth Required**: Yes

**Path Parameters**:
- `cryptoId` (string): Cryptocurrency ID (e.g., "bitcoin", "ethereum")

**Response** (200 OK):
```json
{
  "id": "holding-uuid",
  "cryptoId": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "amount": 0.25,
  "averageBuyPrice": 40000.00,
  "currentPrice": 45250.50,
  "totalInvested": 10000.00,
  "currentValue": 11312.63,
  "profitLoss": 1312.63,
  "profitLossPercentage": 13.13,
  "firstPurchaseDate": "2024-01-01T00:00:00Z",
  "lastUpdated": "2024-01-15T10:35:00Z"
}
```

**Errors**:
- `400`: Invalid cryptoId
- `404`: Holding not found in portfolio

---

## Shopping Cart & Store

### GET /api/cart
Get current user's shopping cart with real-time cryptocurrency prices.

**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "id": "cart-uuid",
  "userId": "user-uuid",
  "items": [
    {
      "id": "cart-item-uuid",
      "cryptoId": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "amount": 0.05,
      "priceAtAdd": 45000.00,
      "currentPrice": 45250.50,
      "subtotal": 2262.53,
      "priceChange": 250.50,
      "priceChangePercentage": 0.56,
      "addedAt": "2024-01-15T09:00:00Z"
    },
    {
      "id": "cart-item-uuid-2",
      "cryptoId": "ethereum",
      "symbol": "eth",
      "name": "Ethereum",
      "amount": 1.0,
      "priceAtAdd": 2400.00,
      "currentPrice": 2450.75,
      "subtotal": 2450.75,
      "priceChange": 50.75,
      "priceChangePercentage": 2.11,
      "addedAt": "2024-01-15T09:30:00Z"
    }
  ],
  "totalItems": 2,
  "totalValue": 4713.28,
  "createdAt": "2024-01-15T09:00:00Z",
  "updatedAt": "2024-01-15T09:30:00Z"
}
```

---

### POST /api/cart/items
Add cryptocurrency to cart or update existing item.

**Auth Required**: Yes

**Request Body**:
```json
{
  "cryptoId": "bitcoin",
  "amount": 0.05
}
```

**Response** (200 OK):
Returns the updated cart (same format as GET /api/cart)

**Errors**:
- `400`: Invalid crypto ID or amount (amount must be > 0)
- `404`: Cryptocurrency not found

---

### PUT /api/cart/items/{cartItemId}
Update cart item amount.

**Auth Required**: Yes

**Path Parameters**:
- `cartItemId` (Guid): Cart item ID

**Request Body**:
```json
{
  "amount": 0.1
}
```

**Response** (200 OK):
Returns the updated cart (same format as GET /api/cart)

**Errors**:
- `400`: Invalid amount (must be > 0)
- `404`: Cart item not found

---

### DELETE /api/cart/items/{cartItemId}
Remove specific item from cart.

**Auth Required**: Yes

**Path Parameters**:
- `cartItemId` (Guid): Cart item ID

**Response** (200 OK):
Returns the updated cart (same format as GET /api/cart)

**Errors**:
- `404`: Cart item not found

---

### POST /api/cart/checkout
Process cart checkout - converts cart items to portfolio holdings (educational/demo only, no real payment).

**Auth Required**: Yes

**Request Body**: (empty)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Purchase completed successfully! Your cryptocurrencies have been added to your portfolio.",
  "itemsPurchased": 2,
  "totalValue": 4713.28,
  "purchasedCryptos": [
    "btc (0.05)",
    "eth (1.0)"
  ]
}
```

**Behavior**:
- Creates Transaction records for each item
- Creates or updates CryptoHolding records in portfolio
- Calculates weighted average buy price for existing holdings
- Clears cart after successful checkout
- Uses current market prices (not priceAtAdd)

**Errors**:
- `400`: Cart is empty
- `500`: Checkout failed (e.g., cryptocurrency data unavailable)

---

### DELETE /api/cart
Clear all items from cart.

**Auth Required**: Yes

**Response** (200 OK):
Returns the empty cart (same format as GET /api/cart)

---

## Price Alerts

### GET /api/alerts
Get all price alerts for the current user (with current prices).

**Auth Required**: Yes

**Response** (200 OK):
```json
[
  {
    "id": "alert-uuid",
    "cryptoId": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "targetPrice": 50000.00,
    "isAbove": true,
    "isActive": true,
    "isTriggered": false,
    "createdAt": "2024-01-15T10:00:00Z",
    "triggeredAt": null,
    "currentPrice": 45250.50
  },
  {
    "id": "alert-uuid-2",
    "cryptoId": "ethereum",
    "symbol": "eth",
    "name": "Ethereum",
    "targetPrice": 2000.00,
    "isAbove": false,
    "isActive": true,
    "isTriggered": false,
    "createdAt": "2024-01-14T15:30:00Z",
    "triggeredAt": null,
    "currentPrice": 2450.75
  }
]
```

---

### POST /api/alerts
Create a new price alert.

**Auth Required**: Yes

**Request Body**:
```json
{
  "cryptoId": "bitcoin",
  "targetPrice": 50000.00,
  "isAbove": true
}
```

**Response** (201 Created):
```json
{
  "id": "alert-uuid",
  "cryptoId": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "targetPrice": 50000.00,
  "isAbove": true,
  "isActive": true,
  "isTriggered": false,
  "createdAt": "2024-01-15T10:35:00Z",
  "triggeredAt": null,
  "currentPrice": 45250.50
}
```

**Errors**:
- `400`: Validation error (invalid crypto ID, target price <= 0)
- `404`: Cryptocurrency not found

---

### DELETE /api/alerts/{alertId}
Delete a price alert.

**Auth Required**: Yes

**Path Parameters**:
- `alertId` (Guid): Alert ID

**Response** (204 No Content)

**Errors**:
- `404`: Alert not found or unauthorized

---

### PATCH /api/alerts/{alertId}/toggle
Toggle alert active status (enable/disable).

**Auth Required**: Yes

**Path Parameters**:
- `alertId` (Guid): Alert ID

**Response** (200 OK):
```json
{
  "message": "Alert status toggled successfully"
}
```

**Errors**:
- `404`: Alert not found or unauthorized

---

## SignalR Hub (Real-time)

### Hub URL: `/hubs/prices`

**Connection**:
```javascript
const connection = new HubConnectionBuilder()
  .withUrl("https://localhost:7001/hubs/prices", {
    accessTokenFactory: () => accessToken
  })
  .withAutomaticReconnect()
  .build();
```

### Server-to-Client Methods

#### `ReceivePriceUpdate`
Receives real-time price updates for all tracked cryptocurrencies.

**Payload**:
```json
{
  "timestamp": "2024-01-15T10:35:00Z",
  "prices": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "currentPrice": 45250.50,
      "priceChange24h": 1250.30,
      "priceChangePercentage24h": 2.84
    }
  ]
}
```

#### `ReceivePortfolioUpdate`
Receives updated portfolio value (sent to specific user).

**Payload**:
```json
{
  "totalValue": 15234.67,
  "totalProfitLoss": 3234.67,
  "totalProfitLossPercentage": 26.95
}
```

### Client-to-Server Methods

#### `SubscribeToPrice`
Subscribe to updates for a specific cryptocurrency.

**Parameters**:
```json
{
  "cryptoId": "bitcoin"
}
```

#### `UnsubscribeFromPrice`
Unsubscribe from updates for a cryptocurrency.

**Parameters**:
```json
{
  "cryptoId": "bitcoin"
}
```

---

## Error Response Format

All endpoints return errors in a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more validation errors occurred.",
    "details": [
      {
        "field": "email",
        "message": "Email is required."
      }
    ],
    "timestamp": "2024-01-15T10:35:00Z",
    "path": "/api/auth/register"
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_REQUIRED`: Missing or invalid token
- `AUTHORIZATION_FAILED`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `CONFLICT`: Resource conflict (e.g., duplicate email)
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `EXTERNAL_API_ERROR`: CoinGecko API error
- `INTERNAL_SERVER_ERROR`: Unexpected server error

---

## Rate Limiting

### Limits
- **Authenticated users**: 100 requests per minute
- **Anonymous users**: 30 requests per minute
- **SignalR connections**: 5 connections per user

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-15T10:36:00Z
```

When rate limit is exceeded:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 30
  }
}
```

---

## API Versioning

Current version: **v1**

All endpoints are prefixed with `/api/` for version 1. Future versions will use `/api/v2/`, etc.

---

## Pagination

Standard pagination for list endpoints:

**Query Parameters**:
- `page`: Page number (1-indexed)
- `perPage`: Results per page

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "perPage": 20,
    "totalPages": 10,
    "totalCount": 200,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## Complete Endpoint Summary

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| **Authentication** |
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login user | No |
| POST | /api/auth/refresh | Refresh access token | No |
| POST | /api/auth/logout | Logout user | Yes |
| GET | /api/auth/me | Get current user | Yes |
| **Cryptocurrency** |
| GET | /api/crypto/markets | List cryptocurrencies | No |
| GET | /api/crypto/{id} | Get crypto details | No |
| GET | /api/crypto/{id}/history | Get historical data | No |
| GET | /api/crypto/compare | Compare cryptocurrencies | No |
| **Portfolio** |
| GET | /api/portfolio | Get user portfolio | Yes |
| GET | /api/portfolio/transactions | Get transaction history | Yes |
| GET | /api/portfolio/performance | Get performance metrics | Yes |
| GET | /api/portfolio/holdings/{cryptoId} | Get specific holding | Yes |
| **Cart & Store** |
| GET | /api/cart | Get shopping cart | Yes |
| POST | /api/cart/items | Add item to cart | Yes |
| PUT | /api/cart/items/{cartItemId} | Update cart item | Yes |
| DELETE | /api/cart/items/{cartItemId} | Remove cart item | Yes |
| POST | /api/cart/checkout | Checkout cart | Yes |
| DELETE | /api/cart | Clear cart | Yes |
| **Price Alerts** |
| GET | /api/alerts | Get user's price alerts | Yes |
| POST | /api/alerts | Create price alert | Yes |
| DELETE | /api/alerts/{alertId} | Delete price alert | Yes |
| PATCH | /api/alerts/{alertId}/toggle | Toggle alert status | Yes |
| **SignalR Hub** |
| WS | /hubs/prices | Real-time price updates | Optional |
