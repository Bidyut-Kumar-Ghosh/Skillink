import { mongoose } from "@/config/mongodb";

// User interface
export interface IUser {
  _id?: string;
  email: string;
  password?: string; // Optional for Google auth
  name: string;
  createdAt: Date;
  lastLoginAt: Date;
  role: "user" | "admin";
  displayName?: string;
  googleId?: string;
  photoURL?: string;
  save?: () => Promise<any>;
}

// Define the schema
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // Not required for Google auth
    },
    name: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    displayName: {
      type: String,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    photoURL: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// To avoid errors when the model is already registered
export const getUserModel = () => {
  return mongoose.model("User", UserSchema);
};

// Export directly as default - don't create another variable
export default getUserModel();
