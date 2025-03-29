import mongoose, { Document, Schema } from "mongoose";

// Book interface
export interface IBook extends Document {
  title: string;
  author: string;
  description: string;
  isbn: string;
  price: string;
  relatedCourses: string[];
}

// Book schema
const BookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
    },
    relatedCourses: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create or retrieve the model
export const Book =
  mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);

export default Book;
