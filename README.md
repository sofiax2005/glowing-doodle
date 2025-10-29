# NormalDB: Interactive Database Normalization Platform

![NormalDB Banner](https://via.placeholder.com/1200x300/4A90E2/ffffff?text=NormalDB+-+Learn+Database+Normalization+Interactively)

**NormalDB** is a full-stack DBMS project that teaches database normalization (UNF → 1NF → 2NF → 3NF) through interactive, scroll-driven R2D3-style visualizations. Upload your messy CSV data and watch it transform through elegant D3.js animations, powered by a real PostgreSQL backend.

## 🎯 Features

- **📊 Interactive Scroll Story**: R2D3-inspired educational narrative with smooth GSAP animations
- **🔄 Automated Normalization Engine**: Detects functional dependencies, candidate keys, and decomposes schemas
- **📈 Real-time Visualizations**: Watch data transform with D3.js animations
- **🗄️ PostgreSQL Integration**: Actual schema creation and data migration on a real database
- **📁 CSV Upload**: Analyze your own datasets
- **🎓 Pre-loaded Examples**: Student-course enrollment, social media posts, TV channel management
- **🧪 Comprehensive Tests**: Unit and integration tests with >80% coverage
- **🐳 Docker Ready**: One-command deployment with Docker Compose

## 🏗️ Architecture

```
┌─────────────┐      HTTP/REST      ┌──────────────┐      SQL      ┌────────────┐
│   React +   │ ◄─────────────────► │   Node.js    │ ◄───────────► │ PostgreSQL │
│   D3.js     │    JSON/Axios       │   Express    │   pg client   │  Database  │
│  Frontend   │                     │   Backend    │               │            │
└─────────────┘                     └──────────────┘               └────────────┘
     │                                     │                              │
     │                                     │                              │
  Scroll UI                      Normalization Engine            Schema Storage
  CSV Upload                     - FD Detection                  - Original Data
  D3 Animations                  - Key Finding                   - Normalized Tables
  Table Inspector                - Decomposition                 - Metadata
                                 - SQL Generation
```

## 🚀 Quick Start (5 minutes)

### Prerequisites

- Docker & Docker Compose (v20.10+)
- Node.js 18+ (for local development)
- 4GB RAM, 10GB disk space

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/normaldb.git
cd normaldb
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your preferred settings (or use defaults)
```

3. **Start the application with Docker Compose**
```bash
docker-compose up --build
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

### First Steps

1. Open http://localhost:3000 in your browser
2. Start scrolling to see the normalization story unfold
3. Upload a CSV file or select a pre-loaded dataset (TV Channel data recommended)
4. Watch the magic happen! 🎨

## 📖 Usage Guide

### Uploading Your Data

1. Click "Upload CSV" button
2. Select a CSV file with headers
3. The system will:
   - Parse the schema
   - Detect functional dependencies
   - Find candidate keys
   - Generate normalized schemas (1NF, 2NF, 3NF)
   - Create tables in PostgreSQL

### Exploring Visualizations

- **Scroll** to progress through the normalization story
- **Hover** over tables to see column details
- **Click** on attributes to highlight dependencies
- **Inspect** the SQL code for each stage
- **Apply to DB** to create tables in PostgreSQL

### Pre-loaded Datasets

1. **TV Channel Management** (recommended demo)
   - Network → Channels → Programs → Episodes → TRP Reports
   - Complex relationships with multiple FDs

2. **Student-Course Enrollment**
   - Classic normalization example
   - Partial and transitive dependencies

3. **Social Media Posts**
   - Users, Posts, Likes, Comments
   - Multi-valued dependencies

## 🛠️ Development

### Local Development (without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Database:**
```bash
# Install PostgreSQL locally
# Create database: normaldb
# Run migrations: npm run migrate
```

### Running Tests

```bash
# Backend tests
cd backend
npm test                    # All tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:coverage      # Coverage report

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Linting
npm run lint

# Format code
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

## 📁 Project Structure

```
normaldb/
├── frontend/              # React + D3 application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── visualizations/  # D3 visualizations
│   │   ├── hooks/         # Custom React hooks
│   │   └── services/      # API integration
│   └── Dockerfile
├── backend/               # Express API
│   ├── src/
│   │   ├── services/normalization/  # Core algorithms
│   │   ├── routes/        # API endpoints
│   │   └── __tests__/     # Test suites
│   └── Dockerfile
├── database/              # PostgreSQL setup
│   └── init-scripts/      # Schema and seed data
└── docker-compose.yml
```

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests**: Core normalization algorithms (FD detection, key finding)
- **Integration Tests**: API endpoints, database operations
- **Coverage**: >80% code coverage target

Example test run:
```bash
npm test

 PASS  src/__tests__/unit/FunctionalDependency.test.js
 PASS  src/__tests__/unit/CandidateKeyFinder.test.js
 PASS  src/__tests__/integration/normalization-api.test.js

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
Coverage:    85.4%
```

## 🎓 Academic Defense (Viva)

### Why is NormalDB a DBMS Project?

See [VIVA_DEFENSE.md](./VIVA_DEFENSE.md) for the complete defense script.

**Quick Answer**: NormalDB implements core DBMS concepts including:

1. **Schema Design & Evolution**: Automated schema decomposition using normalization theory
2. **Functional Dependency Analysis**: Implements Armstrong's axioms and closure computation
3. **Data Migration**: Automatic SQL generation for schema transformation
4. **Integrity Constraints**: Primary key and foreign key constraint enforcement
5. **Multi-version Storage**: Stores original, 1NF, 2NF, and 3NF schemas simultaneously

This goes far beyond visualization—it's a working DBMS normalization subsystem.

## 📊 Algorithm Complexity

| Algorithm | Complexity | Notes |
|-----------|-----------|-------|
| FD Detection | O(n²·m) | n=rows, m=columns |
| Candidate Key Finding | O(2^m · m²) | Exponential worst case, pruned with heuristics |
| Closure Computation | O(k·f) | k=attributes in set, f=number of FDs |
| Schema Decomposition | O(f²·m) | f=FDs, m=attributes |

See [ALGORITHM_ANALYSIS.md](./docs/ALGORITHM_ANALYSIS.md) for detailed analysis.

## 🔐 Security

- JWT-based authentication for schema-altering operations
- Rate limiting on all API endpoints (100 req/min default)
- SQL injection prevention via parameterized queries
- Input validation and sanitization
- CORS policy enforcement

See [SECURITY.md](./docs/SECURITY.md) for complete security documentation.

## 🚀 Deployment

### Production Deployment (Render/Heroku)

See [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) for step-by-step instructions.

Quick deploy to Render:
```bash
# Frontend: Vercel/Netlify
npm run build
# Deploy ./frontend/dist

# Backend: Render
# Connect GitHub repo, auto-deploy

# Database: Render PostgreSQL or AWS RDS
```

## 🤝 Contributing

Contributions welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](./LICENSE)

## 👥 Authors

- Your Name - Initial work - [GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- R2D3 for visualization inspiration
- D3.js community for excellent documentation
- PostgreSQL team for the best RDBMS

## 📞 Support

- 📧 Email: your.email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/normaldb/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/normaldb/wiki)

---

**⭐ Star this repo if you found it helpful!**

Made with ❤️ for DBMS students everywhere
