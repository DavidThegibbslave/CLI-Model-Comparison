# Project Concept: Crypto Market & Simulator

## Overview
A comprehensive real-time cryptocurrency dashboard that combines market analysis with a risk-free simulated trading environment. Users can monitor live prices, compare assets, and practice trading strategies using virtual currency.

## Core Features
1.  **Real-Time Market Dashboard**: Live price updates, 24h change, and volume data for top cryptocurrencies.
2.  **Crypto Comparisons**: Side-by-side comparison of different assets (price charts, market cap stats).
3.  **Visual Store (Cart System)**: A "Merch" section where users can add items to a cart and "checkout" (visual interaction only, clears cart).
4.  **Authentication System**: Secure user registration and login to save preferences and portfolio data.

## Additional Feature: Simulated Portfolio Tracker
**Description**: A feature allowing users to manage a virtual portfolio. Users start with a fixed amount of virtual currency (e.g., $10,000 USD) and can execute "buy" or "sell" orders based on real-time market prices.
**Value Proposition**: 
- **Educational**: Allows users to learn market mechanics without financial risk.
- **Engagement**: encouraging users to return to check their portfolio performance (P&L).
- **Technical Showcase**: Demonstrates complex state management and transactional logic (ACID) alongside real-time data.

## Target Audience & Use Cases
- **Crypto Enthusiasts**: Tracking prices and testing investment theories.
- **Developers/Students**: Examining the architecture of a real-time financial application.
- **Use Case**: A user logs in, sees Bitcoin is up 5%, decides to "buy" 0.1 BTC with virtual funds, and tracks the profit/loss over the next week.

## Non-Functional Requirements
- **Security**: Secure storage of user credentials (ASP.NET Core Identity), protection against common web attacks (CSRF, XSS).
- **Performance**: Low-latency price updates (aiming for <1s delay from server receipt to client display) using WebSockets.
- **User Experience**: Responsive design for mobile and desktop; intuitive charting controls.
