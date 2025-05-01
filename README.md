## Project Name: Skillink

- **Type**: College Final Year Project
- **Technology Stack**: React Native, Expo, Firebase, Next.js, MySQL

# Skillink

## Connecting Learners and Educators through Interactive Courses

Skillink is a mobile application designed to bridge the gap between learners and educators by providing an interactive and engaging platform for online courses. Built using **React Native with Expo** for the user end, **Next.js** for the admin dashboard, **Firebase**, and **MySQL**, the app ensures a seamless learning experience with real-time interaction and dynamic course content.

---

## Features

- **User Authentication**: Secure login/signup using Firebase Authentication.
- **Course Management**: Educators can create, update, and manage courses through the admin dashboard.
- **Interactive Learning**: Students can enroll in courses, complete lessons, and participate in quizzes.
- **Real-Time Chat & Notifications**: Stay connected with instant messaging and course notifications.
- **Progress Tracking**: Users can track their learning progress and achievements.
- **Secure Payment System**: Integration with payment gateways for paid courses.
- **Cross-Platform Compatibility**: User end built with React Native, ensuring smooth performance on both iOS and Android.
- **Admin Dashboard**: Comprehensive admin interface built with Next.js for content management.

---

## Tech Stack

- **User Frontend**: React Native with Expo
- **Admin Frontend**: Next.js
- **Backend**: Firebase
- **Database**: MySQL
- **Authentication**: Firebase Authentication
- **Cloud Storage**: Firebase Storage
- **Real-Time Database**: Firebase Firestore

---

## Installation & Setup

### Prerequisites

Make sure you have the following installed:

- Node.js (latest LTS version)
- Expo CLI (for user end)
- Next.js (for admin end)
- MySQL Server
- Firebase Account

### Steps to Run Locally

1. **Clone the Repository**

   ```sh
   git clone https://github.com/yourusername/skilllink.git
   cd skilllink
   ```

2. **Setup User End (React Native)**

   ```sh
   cd Skillink/React\ Native\ User\ End
   npm install
   expo start
   ```

3. **Setup Admin End (Next.js)**

   ```sh
   cd Skillink/React\ Admin\ End
   npm install
   npm run dev
   ```

4. **Setup Firebase**

   - Create a Firebase project.
   - Enable Authentication, Firestore, and Storage.
   - Add Firebase configuration to the respective config files.

5. **Run the Applications**

   - User End: Use an emulator or scan the QR code with Expo Go to test the app.
   - Admin End: Access the admin dashboard at http://localhost:3000.

---

## Folder Structure

```
Skillink/
├── React Native User End/       # Mobile app for users
│   ├── app/                     # Main application screens
│   │   ├── authentication/      # Login, signup, and auth screens
│   │   ├── components/          # Screen-specific components
│   │   ├── profile/             # User profile screens
│   │   ├── _layout.js           # Root layout
│   │   └── [various screens]    # Learning, wishlist, settings, etc.
│   ├── components/              # Shared UI components
│   ├── constants/               # App constants and configurations
│   ├── context/                 # Context providers
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Utility functions
│   ├── assets/                  # Images, fonts, and other static assets
│   ├── config/                  # Configuration files
│   └── app.json                 # Expo configuration
│
├── React Admin End/             # Admin dashboard
│   ├── pages/                   # Admin dashboard pages
│   │   ├── api/                 # API routes
│   │   ├── dashboard.js         # Main dashboard
│   │   ├── courses.js           # Course management
│   │   ├── users.js             # User management
│   │   ├── books.js             # Book resources
│   │   ├── enrollments.js       # Course enrollments
│   │   ├── feedback.js          # User feedback
│   │   └── [other pages]        # Various admin functionalities
│   ├── components/              # UI components
│   ├── styles/                  # CSS and styling
│   ├── firebase/                # Firebase configuration and utilities
│   └── public/                  # Static files
```

---

## Contributions

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Create a pull request.

---

## Contact

For queries or support, reach out to:

- **Email**: [bidyutghoshoffice@yahoo.com](mailto:bidyutghoshoffice@yahoo.com)
- **GitHub**: [Bidyut-Kumar-Ghosh](https://github.com/Bidyut-Kumar-Ghosh)

Happy Learning! 🚀
