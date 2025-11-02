<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->


<div align="center">
  <a href="https://github.com/Snorlark/Refurnish">
    <img src="apps/web/public/favicon.png" alt="Logo" width="150" height="auto">
  </a>

  <h1 align="center">Refurnish</h1>

  <p align="center">
    A modern, full-stack furniture marketplace connecting buyers and sellers of quality pre-owned furniture
    <br />
    <a href="https://github.com/Snorlark/Refurnish"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://refurnish-blond.vercel.app">View Demo</a>
    &middot;
    <a href="https://github.com/Snorlark/Refurnish/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/Snorlark/Refurnish/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#key-features">Key Features</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#environment-variables">Environment Variables</a></li>
      </ul>
    </li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#api-documentation">API Documentation</a></li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<br /><img width="1674" height="829" alt="Screenshot 2025-10-27 at 6 14 55 PM" src="https://github.com/user-attachments/assets/825a4ef5-daee-4c85-b94d-dba4a74a0c05" />

Refurnish is a comprehensive furniture marketplace platform that enables users to buy and sell pre-owned furniture. Built with a modern monorepo architecture, the platform provides a seamless experience for three distinct user roles: buyers, sellers, and administrators. The application features real-time messaging, secure authentication, and a responsive design optimized for all devices.

### Why Refurnish?

- **Sustainable Shopping**: Promote furniture reuse and reduce environmental impact
- **Cost-Effective**: Help buyers find quality furniture at affordable prices
- **Easy Selling**: Simple listing process for sellers to reach interested buyers
- **Real-Time Communication**: Built-in chat system for instant buyer-seller interaction
- **Secure Transactions**: Role-based authentication and secure payment processing
- **Modern Technology**: Built with cutting-edge technologies for optimal performance

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

This project leverages a modern monorepo architecture with separate frontend, backend API, and WebSocket servers:

#### Frontend
- [![Next.js][Next.js]][Next-url]
- [![React][React.js]][React-url]
- [![TypeScript][TypeScript]][TypeScript-url]
- [![TailwindCSS][TailwindCSS]][TailwindCSS-url]

#### Backend
- [![Node.js][Node.js]][Node-url]
- [![Express][Express.js]][Express-url]
- [![MongoDB][MongoDB]][MongoDB-url]
- [![Redis][Redis]][Redis-url]
- [![Socket.io][Socket.io]][Socket-url]

#### DevOps & Tools
- [![Docker][Docker]][Docker-url]
- [![PNPM][PNPM]][PNPM-url]
- [![JWT][JWT]][JWT-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Key Features

#### 🛍️ **Multi-Role System**
- **Buyers**: Browse products, add to cart, manage favorites, chat with sellers
- **Sellers**: Create listings, manage inventory, track orders, communicate with buyers
- **Admins**: Moderate content, manage users, oversee platform operations

#### 💬 **Real-Time Communication**
- WebSocket-powered instant messaging between buyers and sellers
- Redis pub/sub for scalable chat across multiple server instances
- Message persistence and notification system

#### 🔐 **Security & Authentication**
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Secure password hashing and validation
- Protected routes and middleware

#### 📱 **Responsive Design**
- Mobile-first approach with Next.js App Router
- Dynamic layouts for different user roles
- Optimized for all screen sizes and devices

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v18 or higher)
  ```sh
  node --version
  ```
  
- **PNPM** (Package manager)
  ```sh
  npm install -g pnpm
  ```
  
- **MongoDB** (Database)
  - Local installation or MongoDB Atlas account
  
- **Redis** (Caching & real-time features)
  - Local installation or Redis Cloud account
  
- **Docker** (Optional, for containerized deployment)
  ```sh
  docker --version
  ```

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/Snorlark/Refurnish.git
   cd Refurnish
   ```

2. **Install dependencies for all workspaces**
   ```sh
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file and configure your variables:
   ```sh
   cp .env.example .env
   ```
   
   See the [Environment Variables](#environment-variables) section for details.

4. **Start MongoDB and Redis**
   
   If using Docker:
   ```sh
   docker-compose up -d mongodb redis
   ```
   
   Or start your local instances.

5. **Run database migrations (if applicable)**
   ```sh
   pnpm --filter api run migrate
   ```

6. **Start the development servers**
   
   Start all services:
   ```sh
   pnpm dev
   ```
   
   Or start individually:
   ```sh
   # API Server
   pnpm --filter api dev
   
   # Chat Server
   pnpm --filter chat dev
   
   # Web Frontend
   pnpm --filter web dev
   ```

7. **Access the application**
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:5000`
   - Chat Server: `ws://localhost:8080`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Server Configuration
API_PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/refurnish
MONGODB_TEST_URI=mongodb://localhost:27017/refurnish-test

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Chat Server Configuration
CHAT_PORT=8080
CORS_ORIGIN=http://localhost:3000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment Gateway (Optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- PROJECT STRUCTURE -->

## Project Structure

```
Refurnish/
├── apps/
│   ├── api/                    # Express.js REST API backend
│   │   ├── src/
│   │   │   ├── routes/         # API route definitions
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── buyer.routes.js
│   │   │   │   ├── seller.routes.js
│   │   │   │   └── admin.routes.js
│   │   │   ├── controllers/    # Request handlers
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── product.controller.js
│   │   │   │   └── order.controller.js
│   │   │   ├── services/       # Business logic layer
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── product.service.js
│   │   │   │   └── order.service.js
│   │   │   ├── models/         # Database schemas
│   │   │   │   ├── User.js
│   │   │   │   ├── Product.js
│   │   │   │   └── Order.js
│   │   │   ├── middleware/     # Auth, validation, etc.
│   │   │   │   ├── auth.middleware.js
│   │   │   │   ├── role.middleware.js
│   │   │   │   └── validate.middleware.js
│   │   │   ├── utils/          # Helper functions
│   │   │   │   ├── jwt.js
│   │   │   │   └── logger.js
│   │   │   ├── config/         # Configuration files
│   │   │   │   ├── db.js
│   │   │   │   └── redis.js
│   │   │   ├── app.js          # Express app setup
│   │   │   └── server.js       # Server entry point
│   │   └── package.json
│   │
│   ├── chat/                   # WebSocket server for real-time features
│   │   ├── src/
│   │   │   ├── handlers/       # WebSocket event handlers
│   │   │   │   └── message.handler.js
│   │   │   ├── services/       # Chat business logic
│   │   │   │   └── message.service.js
│   │   │   ├── auth/           # WebSocket authentication
│   │   │   │   └── ws.auth.js
│   │   │   ├── config/         # Redis pub/sub config
│   │   │   │   └── redis.js
│   │   │   └── server.js       # WebSocket server entry
│   │   └── package.json
│   │
│   └── web/                    # Next.js frontend
│       ├── app/
│       │   ├── (auth)/         # Authentication pages
│       │   │   ├── login/
│       │   │   └── register/
│       │   ├── (buyer)/        # Buyer-specific pages
│       │   │   ├── layout.tsx
│       │   │   ├── products/
│       │   │   ├── cart/
│       │   │   ├── profile/
│       │   │   └── messages/
│       │   ├── (seller)/       # Seller-specific pages
│       │   │   ├── layout.tsx
│       │   │   ├── dashboard/
│       │   │   ├── products/
│       │   │   └── orders/
│       │   └── (admin)/        # Admin-specific pages
│       │       ├── layout.tsx
│       │       ├── dashboard/
│       │       ├── users/
│       │       └── products/
│       ├── components/         # Reusable UI components
│       ├── lib/                # API & WebSocket clients
│       │   ├── api.ts
│       │   └── ws.ts
│       ├── styles/             # Global styles
│       ├── public/             # Static assets
│       └── package.json
│
├── packages/                   # Shared packages
│   ├── types/                  # Shared TypeScript types
│   │   └── index.ts
│   └── ui/                     # Shared UI components
│       └── Button.tsx
│
├── docker/                     # Docker configuration
│   ├── api.Dockerfile
│   ├── chat.Dockerfile
│   ├── web.Dockerfile
│   └── docker-compose.yml
│
├── .env.example                # Environment variables template
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # PNPM workspace configuration
├── tsconfig.base.json          # Shared TypeScript config
└── README.md                   # This file
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ARCHITECTURE -->

## Architecture

### System Overview

Refurnish follows a modern microservices architecture with three main components:

1. **API Server (Express.js)**: Handles RESTful API requests, authentication, and database operations
2. **Chat Server (WebSocket)**: Manages real-time messaging between users using Socket.io
3. **Web Frontend (Next.js)**: Provides the user interface with server-side rendering

### Data Flow

```
┌─────────────────┐
│   Next.js Web   │
│    Frontend     │
└────────┬────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌──────────────────┐
│   REST API      │   │  WebSocket Chat  │
│  (Express.js)   │   │   (Socket.io)    │
└────────┬────────┘   └────────┬─────────┘
         │                     │
         ├─────────────────────┤
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌──────────────────┐
│    MongoDB      │   │      Redis       │
│   (Database)    │   │  (Cache/Pub-Sub) │
└─────────────────┘   └──────────────────┘
```

### Key Design Patterns

- **MVC Architecture**: Separation of concerns in the API server
- **Repository Pattern**: Data access abstraction in services
- **Middleware Chain**: Request processing pipeline for authentication and validation
- **WebSocket Events**: Event-driven architecture for real-time features
- **Monorepo Structure**: Shared code and unified development experience

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FEATURES -->

## Features

### 👤 User Management

- **Registration & Login**: Secure user authentication with JWT tokens
- **Profile Management**: Users can update personal information, profile pictures, and preferences
- **Role-Based Access**: Different dashboards and permissions for buyers, sellers, and admins
- **Password Recovery**: Email-based password reset functionality

### 🛒 Product Management

#### For Buyers:
- Browse product catalog with filtering and search
- View detailed product information with image galleries
- Add products to cart and favorites
- Track order history and status

#### For Sellers:
- Create and manage product listings
- Upload multiple product images
- Set pricing and inventory levels
- View sales analytics and performance metrics

### 💬 Real-Time Messaging

- Direct messaging between buyers and sellers
- Real-time message delivery with read receipts
- Message history persistence
- Online status indicators
- Push notifications for new messages

### 🛡️ Admin Features

- User management (approve, suspend, delete accounts)
- Product moderation (approve, reject, remove listings)
- Platform analytics and reporting
- Order dispute resolution
- Content management system

### 📊 Analytics & Reporting

- Sales dashboards for sellers
- Platform-wide metrics for admins
- Order tracking and status updates
- Revenue reports and insights

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- API DOCUMENTATION -->

## API Documentation

### Authentication Endpoints

```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout user
POST   /api/auth/refresh        - Refresh access token
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password - Reset password with token
```

### Buyer Endpoints

```
GET    /api/buyer/products      - Get all products (with filters)
GET    /api/buyer/products/:id  - Get product details
POST   /api/buyer/cart          - Add item to cart
GET    /api/buyer/cart          - Get cart items
DELETE /api/buyer/cart/:id      - Remove item from cart
POST   /api/buyer/orders        - Create new order
GET    /api/buyer/orders        - Get user orders
GET    /api/buyer/orders/:id    - Get order details
```

### Seller Endpoints

```
POST   /api/seller/products     - Create new product
GET    /api/seller/products     - Get seller's products
PUT    /api/seller/products/:id - Update product
DELETE /api/seller/products/:id - Delete product
GET    /api/seller/orders       - Get orders for seller
PUT    /api/seller/orders/:id   - Update order status
GET    /api/seller/analytics    - Get sales analytics
```

### Admin Endpoints

```
GET    /api/admin/users         - Get all users
PUT    /api/admin/users/:id     - Update user status
DELETE /api/admin/users/:id     - Delete user
GET    /api/admin/products      - Get all products
PUT    /api/admin/products/:id  - Moderate product
GET    /api/admin/analytics     - Get platform analytics
```

### WebSocket Events

```
connect              - Client connects to chat server
disconnect           - Client disconnects
message:send         - Send new message
message:receive      - Receive new message
message:read         - Mark message as read
typing:start         - User starts typing
typing:stop          - User stops typing
user:online          - User comes online
user:offline         - User goes offline
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DEPLOYMENT -->

## Deployment

### Docker Deployment

Build and run all services with Docker Compose:

```sh
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Build

```sh
# Build all applications
pnpm build

# Start production servers
pnpm start
```

### Environment-Specific Configurations

Create environment-specific files:
- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

### Recommended Hosting Platforms

- **Frontend**: Vercel, Netlify, or AWS Amplify
- **API Server**: AWS EC2, DigitalOcean, or Heroku
- **Database**: MongoDB Atlas
- **Redis**: Redis Cloud or AWS ElastiCache
- **WebSocket**: AWS EC2 with Load Balancer or DigitalOcean

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [x] Complete monorepo setup with PNPM workspaces
- [x] Implement JWT authentication and role-based access
- [x] Create REST API with Express.js
- [x] Build WebSocket server for real-time chat
- [x] Develop Next.js frontend with role-based routing
- [x] Integrate MongoDB and Redis
- [ ] Add payment gateway integration (Stripe/PayPal)
- [ ] Implement image upload and optimization
- [ ] Add email notifications system
- [ ] Create mobile app with React Native
- [ ] Implement advanced search with Elasticsearch
- [ ] Add product reviews and ratings
- [ ] Create seller verification system
- [ ] Implement multi-currency support
- [ ] Add shipping and delivery tracking
- [ ] Create recommendation engine
- [ ] Add social media integration
- [ ] Implement progressive web app (PWA) features
- [ ] Add automated testing (unit, integration, e2e)
- [ ] Create comprehensive API documentation with Swagger
- [ ] Implement CI/CD pipeline

See the [open issues](https://github.com/Snorlark/Refurnish/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code structure and naming conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Keep pull requests focused on a single feature or fix

### Top contributors:

<a href="https://github.com/Snorlark/Refurnish/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Snorlark/Refurnish" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

**Lark Sigmuond Babao** - [@larksigmuondbabao](https://www.facebook.com/larksigmuondbabao/) - larksigmuondbabao@gmail.com

Project Link: [https://github.com/Snorlark/Refurnish](https://github.com/Snorlark/Refurnish)

**Social Media:**
- [LinkedIn](https://www.linkedin.com/in/lark-sigmuond-babao-9a8a012b2/)
- [GitHub](https://github.com/Snorlark)
- [Facebook](https://www.facebook.com/larksigmuondbabao/)
- [Portfolio](https://larkbabao-portfolio-5p93.vercel.app/)

**Resume:** [Download CV](https://babao-lark-resume.tiiny.site/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

Resources and inspirations that made this project possible:

- [Next.js Documentation](https://nextjs.org/docs) - React framework for production
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [Socket.io](https://socket.io/) - Real-time bidirectional event-based communication
- [MongoDB Documentation](https://docs.mongodb.com/) - NoSQL database
- [Redis Documentation](https://redis.io/documentation) - In-memory data structure store
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [JWT.io](https://jwt.io/) - JSON Web Token implementation
- [PNPM](https://pnpm.io/) - Fast, disk space efficient package manager
- [Docker](https://www.docker.com/) - Containerization platform
- [Vercel](https://vercel.com/) - Platform for frontend deployment
- [Best README Template](https://github.com/othneildrew/Best-README-Template) - README structure inspiration

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/Snorlark/Refurnish.svg?style=for-the-badge
[contributors-url]: https://github.com/Snorlark/Refurnish/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Snorlark/Refurnish.svg?style=for-the-badge
[forks-url]: https://github.com/Snorlark/Refurnish/network/members
[stars-shield]: https://img.shields.io/github/stars/Snorlark/Refurnish.svg?style=for-the-badge
[stars-url]: https://github.com/Snorlark/Refurnish/stargazers
[issues-shield]: https://img.shields.io/github/issues/Snorlark/Refurnish.svg?style=for-the-badge
[issues-url]: https://github.com/Snorlark/Refurnish/issues
[license-shield]: https://img.shields.io/github/license/Snorlark/Refurnish.svg?style=for-the-badge
[license-url]: https://github.com/Snorlark/Refurnish/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/lark-sigmuond-babao-9a8a012b2/
[product-screenshot]: public/refurnish-screenshot.png

<!-- Technology Badges -->
[Next.js]: https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[TailwindCSS]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
[Node.js]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org/
[Express.js]: https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white
[Express-url]: https://expressjs.com/
[MongoDB]: https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white
[MongoDB-url]: https://www.mongodb.com/
[Redis]: https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white
[Redis-url]: https://redis.io/
[Socket.io]: https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white
[Socket-url]: https://socket.io/
[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[PNPM]: https://img.shields.io/badge/PNPM-F69220?style=for-the-badge&logo=pnpm&logoColor=white
[PNPM-url]: https://pnpm.io/
[JWT]: https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white
[JWT-url]: https://jwt.io/


