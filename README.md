# E-Commerce Application

A full-stack e-commerce application built with React, Node.js, and MongoDB.

## Features

### User Features

- User authentication (signup, login, password reset)
- Product browsing with filtering and search
- Shopping cart management
- Order history
- Product reviews and ratings
- Newsletter subscription
- Responsive design for all devices

### Admin Features

- Dashboard with sales analytics
- Product management (CRUD operations)
- Order management
- User management
- Inventory tracking
- Real-time stock alerts

## Technology Stack

### Frontend

- React 18 with TypeScript
- React Router for navigation
- Axios for API requests
- CSS Modules for styling
- Responsive design using CSS Grid and Flexbox

### Backend

- Node.js with Express
- MongoDB for database
- JWT for authentication
- Real-time updates using WebSocket
- API rate limiting and security features

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd e-commerce-app
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

5. Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend development server:

```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
e-commerce-app/
├── backend/
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── controllers/    # Route controllers
│   └── server.js       # Server entry point
│
├── frontend/
│   ├── public/         # Static files
│   └── src/
│       ├── components/ # Reusable components
│       ├── pages/      # Page components
│       ├── services/   # API services
│       └── styles/     # Global styles
```

## Features in Detail

### User Authentication

- JWT-based authentication
- Protected routes
- Role-based access control
- Token refresh mechanism
- Session management

### Product Management

- Product categories and filtering
- Search functionality
- Pagination
- Stock tracking
- Product reviews and ratings

### Shopping Cart

- Add/remove items
- Update quantities
- Cart persistence
- Price calculations
- Checkout process

### Order Management

- Order creation and tracking
- Order history
- Status updates
- Email notifications

### Admin Dashboard

- Sales analytics
- Inventory management
- User management
- Order processing

## Security Features

- Password hashing
- JWT authentication
- API rate limiting
- Input validation
- XSS protection
- CSRF protection

## Best Practices

- TypeScript for type safety
- Component-based architecture
- Responsive design principles
- Error handling
- Loading states
- Form validation
- Code splitting
- Performance optimization

## Testing

- Unit tests for components
- Integration tests for API
- End-to-end testing
- Jest and React Testing Library

## Deployment

### Backend Deployment

1. Set up environment variables
2. Configure MongoDB connection
3. Set up Node.js environment
4. Start the server

### Frontend Deployment

1. Build the production bundle:

```bash
npm run build
```

2. Deploy the build folder to your hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
