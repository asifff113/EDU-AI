# EDU AI - Educational Platform

A comprehensive full-stack educational platform built with modern technologies, featuring AI-powered tutoring, course management, virtual classrooms, and gamification.

## 🚀 Features

### Core Features
- **Course Management** - Create, manage, and enroll in courses
- **AI-Powered Tutoring** - Intelligent tutoring system with personalized learning
- **Exam System** - Create and take exams with automatic grading
- **Virtual Classrooms** - Real-time video conferencing and breakout rooms
- **Study Groups** - Collaborative learning environments
- **Forum System** - Discussion boards with expert moderation
- **Direct Chat** - Real-time messaging between users

### Advanced Features
- **Gamification** - XP points, achievements, and ranking system
- **Skill Trees** - Progressive learning paths
- **Mentorship Program** - Connect students with mentors
- **Job Portal** - Career opportunities and resume management
- **Wellness Tracking** - Study logs and mental health support
- **Certificates** - Blockchain-verified certificates
- **Resource Library** - Comprehensive learning materials

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.IO
- **Cache**: Redis
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Animations**: Framer Motion
- **3D Graphics**: Three.js with React Three Fiber

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: NGINX
- **Package Manager**: pnpm (monorepo)
- **Build Tool**: Turbo
- **Deployment**: Render (configured)

## 📁 Project Structure

```
edu-ai/
├── apps/
│   ├── api/           # NestJS backend
│   │   ├── src/       # Source code
│   │   ├── prisma/    # Database schema & migrations
│   │   └── uploads/   # File uploads
│   └── web/           # Next.js frontend
│       ├── src/       # Source code
│       └── public/    # Static assets
├── packages/
│   └── tsconfig/      # Shared TypeScript configs
├── nginx/             # NGINX configuration
└── docker-compose.yml # Local development setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm (package manager)
- Docker & Docker Compose (for local development)
- PostgreSQL (if running without Docker)

### Local Development with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/EDU-AI.git
   cd EDU-AI
   ```

2. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost (NGINX proxy)
   - Backend API: http://localhost/api
   - Direct Frontend: http://localhost:3000
   - Direct Backend: http://localhost:4000

### Manual Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

3. **Start PostgreSQL and Redis**
   ```bash
   docker-compose up postgres redis -d
   ```

4. **Run database migrations**
   ```bash
   cd apps/api
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - API
   cd apps/api
   pnpm dev

   # Terminal 2 - Web
   cd apps/web
   pnpm dev
   ```

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:4000/api-docs`
- API Health Check: `http://localhost:4000/health`

## 🗄 Database Schema

The application uses PostgreSQL with the following main entities:
- **Users** - Student, Teacher, Admin, QA Solver roles
- **Courses** - Course management with content
- **Exams** - Question banks and attempts
- **Forums** - Discussion boards and moderation
- **Classrooms** - Virtual meeting rooms
- **Gamification** - XP, achievements, rankings
- **Certificates** - Blockchain-verified credentials

## 🔧 Configuration

### Environment Variables

#### Backend (`apps/api/.env`)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/edu_ai"
JWT_SECRET="your-jwt-secret"
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
```

#### Frontend (`apps/web/.env`)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NODE_ENV="development"
```

## 🚀 Deployment

### Render Deployment

The project is configured for easy deployment on Render:

1. **Create a new GitHub repository** and push your code
2. **Connect to Render** using the included `render.yaml`
3. **Deploy** - Render will automatically build and deploy your application

### Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@edu-ai.example.com
- Documentation: [docs.edu-ai.example.com](https://docs.edu-ai.example.com)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI features
- [ ] Blockchain certificates
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Third-party integrations

---

**Built By Asif  for better education**
