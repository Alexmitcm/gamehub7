# 🎮 0Xgamehub

A comprehensive social media platform with premium features, referral systems, and blockchain integration built with modern web technologies.

> **🚀 Deployment Status**: Latest commit `76afcf68` - All Vercel deployment issues resolved ✅

## ✨ Features

### 🚀 Core Features
- **Social Media Platform**: Post, share, and interact with content
- **Premium Subscriptions**: Tiered premium features and benefits
- **Referral System**: Multi-level referral tree with rewards
- **Blockchain Integration**: Smart contract integration for gaming and rewards
- **Admin Panel**: Comprehensive management and monitoring tools

### 🎯 Premium Features
- **Premium Profiles**: Enhanced user profiles with special badges
- **Referral Rewards**: Earn rewards through user referrals
- **Game Vault Integration**: Blockchain-based gaming rewards
- **VIP Access**: Exclusive features for premium users

### 🔧 Technical Features
- **Monorepo Architecture**: Efficient package management with pnpm workspaces
- **TypeScript**: Full type safety across the application
- **Modern UI**: Built with React, TailwindCSS, and HeadlessUI
- **Real-time Updates**: WebSocket integration for live data
- **Responsive Design**: Mobile-first approach with PWA support

## 🏗️ Architecture

```
0Xgamehub/
├── apps/
│   ├── api/          # Backend API (Hono + Prisma)
│   └── web/          # Frontend React App (Vite)
├── packages/
│   ├── data/         # Shared data and constants
│   ├── helpers/      # Utility functions
│   ├── indexer/      # Blockchain indexing
│   └── types/        # Shared TypeScript types
└── .github/          # GitHub Actions and templates
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **HeadlessUI** for accessible components
- **Zustand** for state management
- **TanStack Query** for data fetching

### Backend
- **Hono** for fast API development
- **Prisma** with PostgreSQL for database
- **Redis** for caching and sessions
- **JWT** for authentication
- **WebSocket** for real-time features

### Blockchain
- **Ethereum** smart contracts
- **Web3.js** for blockchain interaction
- **Hardhat** for development and testing

### DevOps
- **pnpm** for package management
- **GitHub Actions** for CI/CD
- **Docker** for containerization
- **Biome** for linting and formatting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 10.4.1+
- PostgreSQL 14+
- Redis 6+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Alexmitcm/0Xgamehub.git
   cd 0Xgamehub
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/api/.env.example apps/api/.env
   # Edit the .env file with your configuration
   ```

4. **Set up the database**
   ```bash
   cd apps/api
   pnpm prisma migrate dev
   pnpm prisma generate
   ```

5. **Start development servers**
   ```bash
   # Start all services
   pnpm dev
   
   # Or start individually
   pnpm --filter @hey/api dev
   pnpm --filter @hey/web dev
   ```

## 📁 Project Structure

### Apps
- **API**: Backend REST API with GraphQL support
- **Web**: React frontend application

### Packages
- **Data**: Shared constants, enums, and configurations
- **Helpers**: Utility functions and helpers
- **Indexer**: Blockchain event indexing
- **Types**: Shared TypeScript interfaces

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all services
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm typecheck        # Type checking

# Linting and Formatting
pnpm biome:check      # Run Biome linter
pnpm biome:fix        # Fix Biome issues

# Package Management
pnpm dep:check        # Check for dependency issues
pnpm dep:fix          # Fix dependency issues
```

### Code Quality

- **Biome**: Linting and formatting
- **TypeScript**: Strict type checking
- **ESLint**: Additional linting rules
- **Prettier**: Code formatting

## 🚀 Deployment

### CI/CD Pipeline

The project includes comprehensive GitHub Actions workflows:

- **CI Pipeline**: Lint, type check, build, and test
- **Dependency Updates**: Automated dependency management
- **Security Audits**: Regular security checks
- **Deployment**: Staging and production deployments

### Environment Setup

1. **Staging**: `develop` branch
2. **Production**: `main` branch
3. **Automated testing** on all pull requests
4. **Security scanning** on every build

## 📊 Project Management

### Issue Templates
- **Bug Reports**: Structured bug reporting
- **Feature Requests**: Detailed feature proposals
- **Pull Request Template**: Comprehensive PR guidelines

### Project Board
- **Backlog**: Ideas and planned features
- **To Do**: Ready for development
- **In Progress**: Currently being developed
- **Testing**: Ready for review
- **Done**: Completed features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation as needed
- Follow the established code style
- Ensure accessibility compliance

## 📚 Documentation

- [API Documentation](./apps/api/README.md)
- [Frontend Guide](./apps/web/README.md)
- [Premium Features](./apps/web/src/components/Premium/README.md)
- [Admin Panel](./apps/web/ADMIN_PANEL_README.md)

## 🔒 Security

- Regular security audits
- Dependency vulnerability scanning
- Input validation and sanitization
- JWT token management
- Rate limiting and DDoS protection

## 📈 Performance

- Code splitting and lazy loading
- Database query optimization
- Redis caching strategy
- CDN integration
- Bundle size optimization

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Alexmitcm/0Xgamehub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Alexmitcm/0Xgamehub/discussions)
- **Wiki**: [Project Wiki](https://github.com/Alexmitcm/0Xgamehub/wiki)

## 📄 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by leading social media platforms
- Community-driven development approach

---

**Made with ❤️ by the 0Xgamehub team**
