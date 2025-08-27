# 🔧 WarmSpa API Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. "Cannot read properties of undefined (reading 'length')" Error

**Problem**: This error occurs when trying to access the `length` property of an undefined variable, usually in the branches or products endpoints.

**Root Cause**:

- Database connection not established when API requests come in
- Database query failing and returning `undefined`
- Server starting before database connection is ready

**Solutions Applied**:
✅ **Fixed database connection timing** - Server now waits for DB connection  
✅ **Added database connection middleware** - Routes check DB status before processing  
✅ **Enhanced error handling** - Functions now return empty arrays instead of undefined  
✅ **Added health check endpoint** - `/health` to verify database status  
✅ **Improved error handling system** - Server no longer crashes on errors

**How to Verify Fix**:

```bash
# 1. Check health endpoint
curl http://localhost:3000/health

# 2. Test branches endpoint
curl http://localhost:3000/api/v1/branches

# 3. Test error handling (should not crash server)
curl http://localhost:3000/api/v1/branches/invalid-id
```

### 2. Server Crashes on Errors

**Problem**: Server crashes when encountering errors instead of handling them gracefully.

**Root Cause**:

- `handleAsyncError` wrapper not properly catching errors
- Global error handler not comprehensive enough
- Unhandled promise rejections and exceptions

**Solutions Applied**:
✅ **Fixed handleAsyncError function** - Now properly catches and handles all errors  
✅ **Enhanced global error handler** - Handles different error types with proper status codes  
✅ **Added process-level error handlers** - Catches uncaught exceptions and unhandled rejections  
✅ **Removed handleAsyncError from services** - Services are now pure functions  
✅ **Controller-level error handling** - All errors are caught at the controller level

**How to Test Error Handling**:

```bash
# Test error handling without crashing server
node test-error-handling.js

# Test invalid endpoints (should return errors, not crash)
curl http://localhost:3000/api/v1/branches/invalid-id
curl http://localhost:3000/api/v1/products/invalid-id
```

### 3. Server Won't Start

**Problem**: Server fails to start or crashes immediately.

**Solutions**:

```bash
# 1. Check MongoDB connection
node test-db-connection.js

# 2. Verify environment variables
cat .env

# 3. Check MongoDB service status
# On Windows: Check Services app for MongoDB
# On Linux/Mac: sudo systemctl status mongod

# 4. Test with minimal connection
mongosh "mongodb://localhost:27017"
```

### 4. Database Connection Issues

**Problem**: MongoDB connection fails or times out.

**Common Causes**:

- MongoDB service not running
- Wrong connection string
- Network/firewall blocking connection
- Authentication issues

**Solutions**:

```bash
# 1. Start MongoDB service
# Windows: net start MongoDB
# Linux/Mac: sudo systemctl start mongod

# 2. Check connection string format
MONGO_URI=mongodb://localhost:27017/warmspa

# 3. Test connection manually
node test-db-connection.js

# 4. Check MongoDB logs
# Windows: Check MongoDB logs in data directory
# Linux/Mac: sudo journalctl -u mongod
```

### 5. API Endpoints Returning Errors

**Problem**: API endpoints return 500 errors or unexpected responses.

**Debugging Steps**:

```bash
# 1. Check server logs for detailed error messages
# 2. Test health endpoint first
curl http://localhost:3000/health

# 3. Test individual endpoints
curl http://localhost:3000/api/v1/branches
curl http://localhost:3000/api/v1/products

# 4. Check database collections
mongosh "mongodb://localhost:27017/warmspa" --eval "db.getCollectionNames()"
```

### 6. Authentication Issues

**Problem**: Protected endpoints return 401/403 errors.

**Solutions**:

```bash
# 1. Verify JWT signatures in .env file
adminSignature=your_admin_secret_here
userSignature=your_user_secret_here

# 2. Check token format (role-based bearer tokens)
Authorization: Admin <token>
Authorization: User <token>

# 3. Verify user exists and has correct role
# Use seed-database.js to create test users
node seed-database.js
```

## 🧪 Testing and Verification

### Quick Health Check

```bash
# Test database connection
node test-db-connection.js

# Test API endpoints
node test-api.js

# Test error handling
node test-error-handling.js

# Test with Postman collection
# Import WarmSpa-API.postman_collection.json
```

### Database Status Check

```bash
# Check MongoDB status
mongosh "mongodb://localhost:27017" --eval "db.serverStatus()"

# Check collections
mongosh "mongodb://localhost:27017/warmspa" --eval "db.getCollectionNames()"

# Check document counts
mongosh "mongodb://localhost:27017/warmspa" --eval "db.branches.countDocuments()"
```

## 🔍 Debug Mode

To enable debug logging, add to your `.env` file:

```env
DEBUG=true
NODE_ENV=development
```

## 📋 Environment Variables Checklist

Ensure these are set in your `.env` file:

```env
# Required
MONGO_URI=mongodb://localhost:27017/warmspa

# JWT Signatures (at least one)
adminSignature=your_admin_secret
userSignature=your_user_secret

# Optional
EMAIL=your_email@gmail.com
GOOGLE_APP_PASSWORD=your_app_password
CLIENT_URL=http://localhost:3000
```

## 🚀 Startup Sequence

The correct startup sequence is:

1. **Database connection** - `connectDB()` waits for MongoDB
2. **Route configuration** - Routes are set up after DB connection
3. **Server start** - HTTP server starts only after bootstrap success
4. **Health check** - `/health` endpoint verifies system status

## 🛡️ Error Handling Architecture

The new error handling system works as follows:

1. **Service Layer**: Pure functions that throw `AppError` when needed
2. **Controller Layer**: Wrapped with `handleAsyncError` to catch errors
3. **Global Error Handler**: Catches any unhandled errors and sends proper responses
4. **Process Level**: Catches uncaught exceptions and unhandled rejections

**Error Flow**:

```
Service Error → Controller (handleAsyncError) → Global Error Handler → Client Response
```

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the logs** - Look for specific error messages
2. **Verify database** - Ensure MongoDB is running and accessible
3. **Test connection** - Use `test-db-connection.js`
4. **Test error handling** - Use `test-error-handling.js`
5. **Check environment** - Verify all required variables are set
6. **Review changes** - Ensure all fixes have been applied

## 🔄 Recent Fixes Applied

✅ **Database Connection Timing** - Fixed async startup sequence  
✅ **Error Handling** - Enhanced error handling in all endpoints  
✅ **Connection Middleware** - Added DB connection checks  
✅ **Health Endpoint** - Added `/health` for system monitoring  
✅ **Controller Safety** - Added try-catch blocks and null checks  
✅ **handleAsyncError Fixed** - Now properly catches and handles all errors  
✅ **Global Error Handler** - Comprehensive error handling with proper status codes  
✅ **Process Error Handlers** - Prevents server crashes from unhandled errors  
✅ **Service Layer Cleanup** - Removed error handling from service functions

---

**Remember**: The API now handles all errors gracefully without crashing the server! 🎉
