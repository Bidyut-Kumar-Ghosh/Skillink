import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";

// Use a mock mongoose for React Native instead of the real one
// This solves the "mongoose.set is not a function" error
const createMockMongoose = () => {
  let models = {};
  let connectionState = 0;

  return {
    // Mock connection object
    connection: {
      get readyState() {
        return connectionState;
      },
    },

    // Mock connect function
    connect: async (uri, options) => {
      console.log("MOCK: Connecting to MongoDB:", uri);
      // Simulate successful connection
      connectionState = 1;
      return Promise.resolve();
    },

    // Mock model registering function
    model: (name, schema) => {
      console.log("MOCK: Creating model:", name);

      if (!models[name]) {
        // Create a mock model with CRUD operations
        models[name] = {
          findOne: async (query) => {
            console.log("MOCK: Finding document with query:", query);

            // Try to find user in AsyncStorage
            try {
              const storedUsers = await AsyncStorage.getItem("backupUsers");
              if (storedUsers) {
                const users = JSON.parse(storedUsers);
                const user = users.find(
                  (u) =>
                    (query.email && u.email === query.email) ||
                    (query.googleId && u.googleId === query.googleId)
                );
                return user || null;
              }
            } catch (error) {
              console.error("MOCK: Error finding document:", error);
            }
            return null;
          },

          create: async (data) => {
            console.log("MOCK: Creating document:", data);

            // Create a new user with an ID
            const newUser = {
              _id: Date.now().toString(),
              ...data,
              save: () => Promise.resolve(newUser),
            };

            // Store in AsyncStorage
            try {
              const storedUsers = await AsyncStorage.getItem("backupUsers");
              const users = storedUsers ? JSON.parse(storedUsers) : [];
              users.push(newUser);
              await AsyncStorage.setItem("backupUsers", JSON.stringify(users));
            } catch (error) {
              console.error("MOCK: Error creating document:", error);
            }

            return newUser;
          },
        };
      }

      return models[name];
    },

    // Mock Schema constructor
    Schema: function (definition, options) {
      this.definition = definition;
      this.options = options;
      return this;
    },

    // Storage for models
    get models() {
      return models;
    },

    // Mock set function
    set: (name, value) => {
      console.log(`MOCK: Setting ${name} to ${value}`);
    },
  };
};

// Export mock mongoose
export const mongoose = createMockMongoose();

// MongoDB connection URI - not actually used but kept for reference
const MONGODB_URI =
  "mongodb+srv://bidyutghoshoffice:Haradhan1%40234@cluster0.u338zeg.mongodb.net/skillink";

// Connection state
let isConnected = false;

// Connect to MongoDB with retry logic - now using our mock
export const connectToDatabase = async (): Promise<boolean> => {
  if (isConnected) return true;

  try {
    console.log("Connecting to mock MongoDB database...");
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("Connected to mock MongoDB successfully");
    return true;
  } catch (error) {
    console.error("Error connecting to mock MongoDB:", error);
    return false;
  }
};

// Attempt connection at startup
connectToDatabase().catch((error) => {
  console.log("Initial connection attempt failed:", error);
});

// Create default users for the mock database
const createInitialUsers = async () => {
  try {
    const existingUsers = await AsyncStorage.getItem("backupUsers");
    if (!existingUsers) {
      // Create default users if none exist
      const defaultUsers = [
        {
          _id: "1",
          email: "admin@skillink.com",
          password: "mock-salt:password",
          name: "Admin User",
          role: "admin",
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        {
          _id: "2",
          email: "user@example.com",
          password: "mock-salt:password",
          name: "Test User",
          role: "user",
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      ];
      await AsyncStorage.setItem("backupUsers", JSON.stringify(defaultUsers));
      console.log("Created initial users for mock database");
    }
  } catch (error) {
    console.error("Error creating initial users:", error);
  }
};

// Create initial users
createInitialUsers();

// Store user data in AsyncStorage for local session
export const storeUserData = async (userData: any) => {
  try {
    await AsyncStorage.setItem("userData", JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error("Error storing user data:", error);
    throw error;
  }
};

// Get user data from AsyncStorage
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Remove user data from AsyncStorage (for logout)
export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem("userData");
    return true;
  } catch (error) {
    console.error("Error removing user data:", error);
    throw error;
  }
};
