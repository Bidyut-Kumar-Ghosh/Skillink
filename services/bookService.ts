import Book, { IBook } from "@/models/Book";

// Get all books
export const getAllBooks = async () => {
  try {
    const books = await Book.find().sort({ title: 1 });
    return books;
  } catch (error) {
    console.error("Error getting books:", error);
    throw error;
  }
};

// Get book by ID
export const getBookById = async (id: string) => {
  try {
    const book = await Book.findById(id);
    if (!book) {
      throw new Error("Book not found");
    }
    return book;
  } catch (error) {
    console.error("Error getting book:", error);
    throw error;
  }
};

// Create a new book
export const createBook = async (bookData: Omit<IBook, "_id">) => {
  try {
    const newBook = await Book.create(bookData);
    return newBook;
  } catch (error) {
    console.error("Error creating book:", error);
    throw error;
  }
};

// Update a book
export const updateBook = async (id: string, bookData: Partial<IBook>) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { $set: bookData },
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      throw new Error("Book not found");
    }

    return updatedBook;
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
};

// Delete a book
export const deleteBook = async (id: string) => {
  try {
    const result = await Book.findByIdAndDelete(id);

    if (!result) {
      throw new Error("Book not found");
    }

    return true;
  } catch (error) {
    console.error("Error deleting book:", error);
    throw error;
  }
};
