# Firebase to MongoDB Migration Guide

This document outlines the changes made to migrate the Skillink application from Firebase to MongoDB.

## Overview

The application has been migrated from Firebase (Firestore) to MongoDB for database operations. This change includes:

1. A new MongoDB configuration setup
2. Mongoose models for data structures
3. Authentication handling via MongoDB and AsyncStorage
4. Updated services for database operations
5. UI components using the new MongoDB-based services

## Configuration

The MongoDB connection is configured in `config/mongodb.ts`. You will need to:

1. Replace the placeholder MongoDB URI with your actual MongoDB connection string:

```typescript
const MONGODB_URI =
  "mongodb+srv://your_username:your_password@your_cluster.mongodb.net/skillink?retryWrites=true&w=majority";
```

2. Ensure the MongoDB connection is established when the app starts.

## Models

The following Mongoose models have been created:

1. **User** (`models/User.ts`): Stores user information including authentication details
2. **Book** (`models/Book.ts`): Stores book information
3. **Course** (`models/Course.ts`): Stores course information

Each model follows Mongoose schema definitions with proper validation and typing.

## Authentication

Authentication is now handled via MongoDB and AsyncStorage:

1. User credentials are stored in the MongoDB database (with passwords hashed using expo-crypto)
2. Session management uses AsyncStorage on the client side
3. The `AuthContext` has been updated to work with the new authentication flow

The authentication uses a secure password hashing method with salting via expo-crypto:

- During registration, passwords are hashed with a unique salt
- During login, the password is verified against the stored hash

## Services

Database operations are now handled by dedicated service files:

1. **authService.ts**: Handles user registration, login, and logout
2. **bookService.ts**: Handles book-related CRUD operations
3. **courseService.ts**: Handles course-related CRUD operations

These services abstract away the database interactions and provide clean APIs for components.

## UI Components

All UI components have been updated to use the new MongoDB-based services:

1. The admin panel now interacts with MongoDB for managing books and courses
2. Authentication flows use the new authentication service

## Migration Steps for Existing Data

To migrate your existing data from Firebase to MongoDB:

1. Export your Firebase data (use Firebase Console or Firebase Admin SDK)
2. Transform the data to match the MongoDB schema structure
3. Import the transformed data into your MongoDB database
4. Verify the data integrity after migration

## Dependencies

The migration requires the following new dependencies:

- `mongodb`: The MongoDB driver for Node.js
- `mongoose`: MongoDB object modeling for Node.js
- `expo-crypto`: For secure password hashing
- `@react-native-async-storage/async-storage`: For local storage management

## Testing

After migration, thoroughly test all features including:

1. User registration and login flows
2. Admin functionality (adding/editing/deleting books and courses)
3. Data persistence and relationships

## Rollback Plan

If issues are encountered with the MongoDB implementation, a rollback to Firebase can be performed by:

1. Reverting the code changes (reverting to the pre-migration commits)
2. Ensuring Firebase configurations are still valid
3. Verifying that Firebase services are still accessible
