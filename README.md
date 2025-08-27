# 🌟 WarmSpa API

A comprehensive REST API for managing spa services, branches, and user authentication.

## 🚀 Features

- **User Management**: Signup, login, password reset with OTP
- **Branch Management**: Create, read, update, delete spa branches with geolocation
- **Product Management**: Manage spa services and treatments
- **Role-based Authentication**: Admin, User, SAdmin, Agent, MC, Support roles
- **Geospatial Queries**: Find branches within specific distances
- **Advanced Filtering**: Pagination, sorting, and search capabilities

## 🛠️ Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with role-based bearer tokens
- **Validation**: Joi schema validation
- **Error Handling**: Custom error handling with async wrapper

## 📋 Prerequisites

- Node.js 18+
- MongoDB 5+
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd warmSpa
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/warmspa

# JWT Signatures (for different user roles)
adminSignature=your_admin_jwt_secret_here
userSignature=your_user_jwt_secret_here
sadminSignature=your_sadmin_jwt_secret_here
agentSignature=your_agent_jwt_secret_here
mcSignature=your_mc_jwt_secret_here
supportSignature=your_support_jwt_secret_here

# Email Configuration
EMAIL=your_email@gmail.com
GOOGLE_APP_PASSWORD=your_app_password

# Optional: Social Media Links
CLIENT_URL=http://localhost:3000
FACEBOOK_LINK=https://facebook.com
INSTAGRAM_LINK=https://instagram.com
TWITTER_LINK=https://twitter.com
```

### 3. Start the Server

```bash
npm start
# or
node index.js
```

The server will start on port 3000.

### 4. Seed the Database (Optional)

To add test data for development:

```bash
node seed-database.js
```

This will create:

- Admin user: `admin@warmspa.com` / `admin123`
- Regular user: `john@warmspa.com` / `user123`
- Sample branch and products

## 🧪 Testing the API

### Quick Test

Run the test script to verify all endpoints:

```bash
node test-api.js
```

### Postman Collection

Import the `WarmSpa-API.postman_collection.json` file into Postman for comprehensive testing.

**Important**: This API uses role-based bearer tokens instead of standard "Bearer" tokens:

- `Admin <token>` for admin operations
- `User <token>` for user operations
- `SAdmin <token>` for super admin operations

## 📚 API Endpoints

### 🔐 Authentication

| Method | Endpoint                       | Description                    | Access  |
| ------ | ------------------------------ | ------------------------------ | ------- |
| POST   | `/api/v1/users/signup`         | User registration              | Public  |
| POST   | `/api/v1/users/login`          | User login                     | Public  |
| POST   | `/api/v1/users/send-otp`       | Send OTP for password reset    | Public  |
| POST   | `/api/v1/users/verify-otp`     | Verify OTP and reset password  | Public  |
| POST   | `/api/v1/users/reset-password` | Reset password (authenticated) | Private |

### 🏢 Branches

| Method | Endpoint                           | Description                | Access       |
| ------ | ---------------------------------- | -------------------------- | ------------ |
| GET    | `/api/v1/branches`                 | Get all branches           | Public       |
| GET    | `/api/v1/branches/:id`             | Get branch by ID           | Public       |
| GET    | `/api/v1/branches/within/distance` | Get branches within radius | Public       |
| POST   | `/api/v1/branches`                 | Create branch              | Admin/SAdmin |
| PATCH  | `/api/v1/branches/:id`             | Update branch              | Admin/SAdmin |
| DELETE | `/api/v1/branches/:id`             | Delete branch              | Admin/SAdmin |

### 🛍️ Products

| Method | Endpoint                            | Description            | Access       |
| ------ | ----------------------------------- | ---------------------- | ------------ |
| GET    | `/api/v1/products`                  | Get all products       | Public       |
| GET    | `/api/v1/products/:id`              | Get product by ID      | Public       |
| GET    | `/api/v1/products/branch/:branchId` | Get products by branch | Public       |
| GET    | `/api/v1/products/stats`            | Get product statistics | Admin/SAdmin |
| POST   | `/api/v1/products`                  | Create product         | Admin/SAdmin |
| PATCH  | `/api/v1/products/:id`              | Update product         | Admin/SAdmin |
| DELETE | `/api/v1/products/:id`              | Delete product         | Admin/SAdmin |

## 🔑 Authentication Flow

1. **Signup/Login**: Get role-based bearer token
2. **Use Token**: Include in Authorization header as `Role <token>`
3. **Access Control**: Middleware checks user role and permissions

### Example Request

```bash
curl -X GET http://localhost:3000/api/v1/branches \
  -H "Authorization: Admin eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📊 Query Parameters

### Pagination

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Filtering

- `category`: Filter by product category
- `city`: Filter branches by city
- `country`: Filter branches by country
- `price[gte]`: Minimum price
- `price[lte]`: Maximum price

### Sorting

- `sort`: Sort by field (prefix with `-` for descending)
- Example: `sort=-createdAt` (newest first)

### Geospatial

- `distance`: Radius in specified unit
- `latlng`: Coordinates (format: `lat,lng`)
- `unit`: Distance unit (`mi` or `km`)

## 🏗️ Project Structure

```
warmSpa/
├── src/
│   ├── modules/           # Feature modules
│   │   ├── user/         # User management
│   │   ├── branch/       # Branch management
│   │   └── product/      # Product management
│   ├── database/         # Database models and connection
│   ├── middleware/       # Authentication and validation
│   ├── errorHandling/    # Error handling utilities
│   └── utilts/          # Utility functions
├── index.js              # Server entry point
├── app.controller.js     # App configuration
├── seed-database.js      # Database seeding script
├── test-api.js          # API testing script
└── WarmSpa-API.postman_collection.json
```

## 🐛 Troubleshooting

### Common Issues

1. **"next is not a function"**: Fixed - was a middleware wrapper issue
2. **Route conflicts**: Fixed - specific routes now come before parameterized routes
3. **Empty results errors**: Fixed - now returns empty arrays instead of throwing errors
4. **Duplicate indexes**: Fixed - removed duplicate email index

### Server Won't Start

- Check MongoDB connection
- Verify environment variables
- Ensure all dependencies are installed

### Authentication Issues

- Verify JWT signatures in `.env`
- Check user role permissions
- Ensure proper bearer token format: `Role <token>`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

- Check the troubleshooting section
- Review the API documentation
- Test with the provided Postman collection

---

**Happy coding! 🌟**


