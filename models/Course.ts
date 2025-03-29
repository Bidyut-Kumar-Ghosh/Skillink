import mongoose, { Document, Schema } from "mongoose";

// Course interface
export interface ICourse extends Document {
  title: string;
  description: string;
  duration: string;
  price: string;
  relatedBooks: string[];
}

// Course schema
const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    relatedBooks: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create or retrieve the model
export const Course =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
