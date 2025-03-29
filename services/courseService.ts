import Course, { ICourse } from "@/models/Course";

// Get all courses
export const getAllCourses = async () => {
  try {
    const courses = await Course.find().sort({ title: 1 });
    return courses;
  } catch (error) {
    console.error("Error getting courses:", error);
    throw error;
  }
};

// Get course by ID
export const getCourseById = async (id: string) => {
  try {
    const course = await Course.findById(id);
    if (!course) {
      throw new Error("Course not found");
    }
    return course;
  } catch (error) {
    console.error("Error getting course:", error);
    throw error;
  }
};

// Create a new course
export const createCourse = async (courseData: Omit<ICourse, "_id">) => {
  try {
    const newCourse = await Course.create(courseData);
    return newCourse;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

// Update a course
export const updateCourse = async (
  id: string,
  courseData: Partial<ICourse>
) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: courseData },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      throw new Error("Course not found");
    }

    return updatedCourse;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

// Delete a course
export const deleteCourse = async (id: string) => {
  try {
    const result = await Course.findByIdAndDelete(id);

    if (!result) {
      throw new Error("Course not found");
    }

    return true;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};
