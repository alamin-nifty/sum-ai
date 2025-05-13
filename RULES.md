# Summarize AI - Development Rules and Guidelines

## Code Organization

1. **Project Structure**

   - `/app` - Next.js 13+ app directory
   - `/components` - Reusable React components
   - `/lib` - Utility functions and shared logic
   - `/models` - Mongoose models and schemas
   - `/public` - Static assets
   - `/styles` - Global styles and Tailwind config
   - `/types` - TypeScript type definitions

2. **Component Structure**
   - Each component should be in its own directory
   - Include index.ts, ComponentName.tsx, and ComponentName.test.tsx
   - Use barrel exports (index.ts) for clean imports

## Coding Standards

1. **TypeScript**

   - Strict mode enabled
   - No `any` types without explicit justification
   - Use interfaces for object types
   - Use type guards for runtime type checking

2. **React**

   - Use functional components with hooks
   - Implement proper error boundaries
   - Follow React best practices for performance
   - Use proper prop typing

3. **API Development**

   - RESTful endpoints in `/app/api`
   - Proper error handling and status codes
   - Input validation using Zod
   - Rate limiting implementation

4. **MongoDB/Mongoose**
   - Use Mongoose schemas for data modeling
   - Implement proper indexing
   - Use lean queries when possible
   - Implement proper error handling
   - Use transactions where necessary

## Security Guidelines

1. **Authentication**

   - Use NextAuth.js for all auth flows
   - Implement proper session management
   - Secure API routes with middleware
   - Store sensitive data in environment variables

2. **Data Protection**
   - Encrypt sensitive user data
   - Implement proper CORS policies
   - Use HTTPS for all communications
   - Follow OWASP security guidelines
   - Secure MongoDB connection string

## Testing Requirements

1. **Unit Tests**

   - Jest for unit testing
   - Minimum 80% code coverage
   - Test all utility functions
   - Mock external dependencies
   - Test Mongoose models

2. **Integration Tests**
   - Test API endpoints
   - Test database operations
   - Test authentication flows
   - Test third-party integrations
   - Test MongoDB queries

## Git Workflow

1. **Branching Strategy**

   - `main` - Production branch
   - `develop` - Development branch
   - `feature/*` - Feature branches
   - `bugfix/*` - Bug fix branches

2. **Commit Messages**
   - Follow conventional commits
   - Format: `type(scope): description`
   - Types: feat, fix, docs, style, refactor, test, chore

## Documentation

1. **Code Documentation**

   - JSDoc comments for functions
   - README files in each major directory
   - API documentation using OpenAPI/Swagger
   - Clear component documentation
   - Document MongoDB schemas

2. **Project Documentation**
   - Keep TASKS.MD updated
   - Document all environment variables
   - Maintain deployment documentation
   - Update user documentation

## Performance Guidelines

1. **Frontend**

   - Implement proper code splitting
   - Optimize images and assets
   - Use proper caching strategies
   - Monitor bundle sizes

2. **Backend**
   - Implement proper caching
   - Optimize MongoDB queries
   - Use proper indexing
   - Monitor API response times
   - Implement connection pooling

## Error Handling

1. **Frontend**

   - Implement proper error boundaries
   - Show user-friendly error messages
   - Log errors to monitoring service
   - Handle network errors gracefully

2. **Backend**
   - Proper error status codes
   - Detailed error logging
   - Error tracking integration
   - Graceful degradation
   - MongoDB error handling

## Third-Party Integrations

1. **API Integration**

   - Proper error handling
   - Rate limiting implementation
   - Retry mechanisms
   - Fallback strategies

2. **OAuth Integration**
   - Secure token storage
   - Proper token refresh
   - Error handling
   - User consent management

## Monitoring and Logging

1. **Application Monitoring**

   - Error tracking
   - Performance monitoring
   - User analytics
   - API usage tracking
   - MongoDB performance monitoring

2. **Logging**
   - Structured logging
   - Log levels (error, warn, info, debug)
   - Log rotation
   - Sensitive data masking

## Deployment

1. **Vercel Deployment**

   - Environment variable management
   - Build optimization
   - Preview deployments
   - Production deployment checks

2. **Database**
   - MongoDB Atlas setup
   - Backup procedures
   - Data validation
   - Connection management
   - Index management
