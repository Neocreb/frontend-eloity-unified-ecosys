# 👩‍💻 Development Guide

Comprehensive guide for developing on the Eloity platform.

## 🏗️ Architecture Overview

### System Architecture
Eloity follows a modern full-stack architecture with clear separation of concerns.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   React + TS    │◄──►│   Node.js       │◄──►│   PostgreSQL    │
│   Vite + PWA    │    │   Express + WS  │    │   Drizzle ORM   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   External      │              │
         └──────────────┤   Services      │──────────────┘
                        │   AWS, Stripe   │
                        └─────────────────┘
```

### Frontend Architecture

#### Component Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs)
│   ├── layout/         # Layout components (headers, sidebars)
│   ├── features/       # Feature-specific components
│   └── shared/         # Shared components across features
├── pages/              # Page-level components
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── stores/             # State management
```

#### Key Patterns
- **Composition over Inheritance**: Use component composition
- **Custom Hooks**: Extract logic into reusable hooks
- **Service Layer**: Centralized API communication
- **Type Safety**: Comprehensive TypeScript usage

### Backend Architecture

#### API Structure
```
server/
├── routes/             # API route definitions
│   ├── auth.ts        # Authentication routes
│   ├── users.ts       # User management
│   ├── posts.ts       # Social media posts
│   ├── marketplace.ts # E-commerce functionality
│   └── crypto.ts      # Cryptocurrency features
├── middleware/         # Express middleware
├── services/          # Business logic layer
├── utils/             # Server utilities
└── models/            # Data models (with Drizzle)
```

#### Design Principles
- **RESTful APIs**: Clear endpoint naming and HTTP methods
- **Middleware Pattern**: Reusable request processing
- **Service Layer**: Business logic separation
- **Error Handling**: Consistent error responses

## 🛠️ Development Setup

### Local Environment

#### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL database
- Redis (optional, for caching)
- Git and code editor

#### Environment Variables
Create `.env` file with required configuration:

```env
# Core Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:8080

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/eloity

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
SESSION_SECRET=your-session-secret

# External Services (optional for basic development)
STRIPE_SECRET_KEY=sk_test_...
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
SENDGRID_API_KEY=your-sendgrid-key
```

#### Database Setup
```bash
# Generate and apply migrations
npm run db:generate
npm run db:push

# Seed with test data
npm run db:seed

# Open database browser
npm run db:studio
```

### Development Workflow

#### Starting Development
```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # Port 8080
npm run dev:backend   # Port 5000
```

#### Code Quality
```bash
# TypeScript checking
npm run check

# Build for production
npm run build

# Run tests (when available)
npm test
```

## 📝 Coding Standards

### TypeScript Guidelines

#### Type Definitions
```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Use types for unions and primitives
type UserRole = 'admin' | 'user' | 'creator';
type Status = 'active' | 'inactive' | 'pending';

// Use generics for reusable types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

#### Component Patterns
```typescript
// Functional components with TypeScript
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onEdit, 
  className 
}) => {
  // Component implementation
};

// Custom hooks
export const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Hook implementation
  
  return { user, loading, refetch };
};
```

### API Development

#### Route Structure
```typescript
// Route with middleware and validation
router.post('/api/posts', 
  authenticateUser,           // Authentication middleware
  validatePostData,           // Validation middleware
  async (req, res) => {
    try {
      const post = await PostService.createPost(req.body);
      res.json({ success: true, data: post });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

// Service layer
export class PostService {
  static async createPost(data: CreatePostData): Promise<Post> {
    // Validate data
    const validated = createPostSchema.parse(data);
    
    // Business logic
    const post = await db.insert(posts)
      .values(validated)
      .returning();
    
    return post[0];
  }
}
```

#### Error Handling
```typescript
// Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: error.message,
      field: error.field
    });
  }
  
  // Generic error response
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
```

### Database Patterns

#### Schema Definition
```typescript
// Drizzle schema example
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 50 }).default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Relationships
export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});
```

#### Query Patterns
```typescript
// Service layer database queries
export class UserService {
  static async getUserWithPosts(userId: string) {
    return await db
      .select()
      .from(users)
      .leftJoin(posts, eq(posts.userId, users.id))
      .where(eq(users.id, userId));
  }
  
  static async createUser(userData: CreateUserData) {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    
    return user;
  }
}
```

## 🧪 Testing Guidelines

### Component Testing
```typescript
// React component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  };

  it('renders user information', () => {
    render(<UserCard user={mockUser} onEdit={jest.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

### API Testing
```typescript
// API endpoint testing with Jest and Supertest
import request from 'supertest';
import app from '../app';

describe('POST /api/posts', () => {
  it('creates a new post', async () => {
    const postData = {
      content: 'Test post content',
      userId: 'user-123'
    };

    const response = await request(app)
      .post('/api/posts')
      .send(postData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.content).toBe(postData.content);
  });

  it('validates required fields', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('content is required');
  });
});
```

## 🔄 State Management

### React Context Pattern
```typescript
// Context for global state
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth methods implementation
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### API Service Pattern
```typescript
// Centralized API service
export class ApiService {
  private static baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint);
  }

  static async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
```

## 🚀 Performance Optimization

### Frontend Performance
```typescript
// Lazy loading components
const LazyComponent = lazy(() => import('./HeavyComponent'));

// Memoization for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Callback memoization
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);

// Virtual scrolling for large lists
import { VirtualList } from 'react-virtual';

const VirtualizedList = ({ items }) => (
  <VirtualList
    height={400}
    itemCount={items.length}
    itemSize={60}
    renderItem={({ index, style }) => (
      <div style={style}>
        <ListItem item={items[index]} />
      </div>
    )}
  />
);
```

### Backend Performance
```typescript
// Database query optimization
export class OptimizedService {
  // Use database indexes and efficient queries
  static async getUsersWithPostCount() {
    return await db
      .select({
        id: users.id,
        name: users.name,
        postCount: count(posts.id)
      })
      .from(users)
      .leftJoin(posts, eq(posts.userId, users.id))
      .groupBy(users.id);
  }

  // Implement caching
  static async getCachedData(key: string) {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await fetchDataFromDatabase();
    await redis.setex(key, 3600, JSON.stringify(data)); // 1 hour cache
    return data;
  }
}
```

## 🔧 Debugging & Troubleshooting

### Common Development Issues

#### Frontend Issues
```typescript
// Debug React components with React DevTools
// Add debug logging
const DebugComponent = ({ data }) => {
  console.log('Component rendered with:', data);
  
  useEffect(() => {
    console.log('Component mounted or data changed');
  }, [data]);

  return <div>{/* Component JSX */}</div>;
};

// Error boundaries for debugging
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

#### Backend Issues
```typescript
// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
};

// Database query debugging
export const debugQuery = async (query: any) => {
  console.log('Executing query:', query.toSQL());
  const result = await query;
  console.log('Query result:', result);
  return result;
};
```

### Development Tools

#### Recommended VSCode Extensions
- **TypeScript Hero** - Auto imports and organization
- **ES7+ React/Redux/React-Native snippets** - Code snippets
- **Auto Rename Tag** - Automatically rename paired tags
- **GitLens** - Enhanced Git capabilities
- **Thunder Client** - API testing within VSCode

#### Browser DevTools
- **React Developer Tools** - Component inspection
- **Redux DevTools** - State management debugging
- **Network Tab** - API call monitoring
- **Performance Tab** - Performance profiling

---

**This development guide provides the foundation for contributing to the Eloity platform effectively.** 🚀