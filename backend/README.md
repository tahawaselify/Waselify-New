# Waselify n8n Backend API

Backend API for Waselify's n8n automation platform integration. This service provides a RESTful API to manage n8n workflows, executions, and templates.

## 🚀 Features

- **Workflow Management**: Create, read, update, delete n8n workflows
- **Execution Control**: Execute workflows and monitor their status
- **Template System**: Import/export workflow templates
- **Authentication**: JWT-based authentication with Supabase
- **Webhook Management**: Handle webhook endpoints and testing
- **Health Monitoring**: System health checks and monitoring
- **Rate Limiting**: API rate limiting for security
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- n8n instance running
- Supabase project
- PostgreSQL database (optional, if not using Supabase)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8083
   N8N_URL=http://localhost:5678
   N8N_API_KEY=your_n8n_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `FRONTEND_URL` | Frontend URL | http://localhost:8083 |
| `N8N_URL` | n8n instance URL | http://localhost:5678 |
| `N8N_API_KEY` | n8n API key | - |
| `SUPABASE_URL` | Supabase URL | - |
| `SUPABASE_ANON_KEY` | Supabase anon key | - |
| `JWT_SECRET` | JWT secret | - |

### n8n Setup

1. **Install n8n**
   ```bash
   npm install -g n8n
   ```

2. **Start n8n**
   ```bash
   n8n start
   ```

3. **Get API Key**
   - Go to n8n settings
   - Generate API key
   - Add to `.env` file

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token

### Workflows
- `GET /api/workflows` - Get all workflows
- `GET /api/workflows/:id` - Get specific workflow
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `PATCH /api/workflows/:id/toggle` - Toggle workflow activation
- `POST /api/workflows/:id/execute` - Execute workflow
- `GET /api/workflows/:id/stats` - Get workflow statistics
- `POST /api/workflows/import` - Import workflow from JSON
- `GET /api/workflows/:id/export` - Export workflow to JSON

### Executions
- `GET /api/executions` - Get all executions
- `GET /api/executions/:id` - Get execution status
- `POST /api/executions/:id/cancel` - Cancel execution

### Templates
- `GET /api/templates` - Get workflow templates
- `POST /api/templates` - Create template
- `GET /api/templates/:id` - Get specific template

### Webhooks
- `POST /api/webhooks/test` - Test webhook endpoint
- `GET /api/webhooks/health` - Webhook health check

### Health
- `GET /api/health` - System health check
- `GET /api/health/n8n` - n8n health check

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Database Schema

### Workflow Templates
```sql
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    json_file_path TEXT,
    n8n_link TEXT,
    estimated_setup_cost DECIMAL(10,2),
    estimated_monthly_cost DECIMAL(10,2),
    complexity_level VARCHAR(50) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 📦 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t waselify-backend .
docker run -p 3001:3001 waselify-backend
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
N8N_URL=https://your-n8n-domain.com
N8N_API_KEY=your_production_n8n_api_key
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_anon_key
JWT_SECRET=your_production_jwt_secret
```

## 🔍 Monitoring

### Health Checks
- `GET /api/health` - Overall system health
- `GET /api/health/n8n` - n8n connection health
- `GET /api/health/database` - Database connection health

### Logging
The application uses Morgan for HTTP request logging and console logging for errors.

### Metrics
Enable metrics collection:
```env
ENABLE_METRICS=true
METRICS_PORT=9090
```

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, email support@waselify.com or create an issue in the repository.

## 🔄 Changelog

### v1.0.0
- Initial release
- Basic workflow management
- n8n integration
- Authentication system
- Template system 