# SkillLink\*

## Connecting Learners and Educators through Interactive Courses

SkillLink\* is a mobile application designed to bridge the gap between learners and educators by providing an interactive and engaging platform for online courses. Built using **React Native with Expo**, **Firebase**, **Strapi**, and **MySQL**, the app ensures a seamless learning experience with real-time interaction and dynamic course content.

---

## Features

- **User Authentication**: Secure login/signup using Firebase Authentication.
- **Course Management**: Educators can create, update, and manage courses through Strapi CMS.
- **Interactive Learning**: Students can enroll in courses, complete lessons, and participate in quizzes.
- **Real-Time Chat & Notifications**: Stay connected with instant messaging and course notifications.
- **Progress Tracking**: Users can track their learning progress and achievements.
- **Secure Payment System**: Integration with payment gateways for paid courses.
- **Cross-Platform Compatibility**: Built with React Native, ensuring smooth performance on both iOS and Android.

---

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Strapi (Headless CMS) & Firebase
- **Database**: MySQL
- **Authentication**: Firebase Authentication
- **Cloud Storage**: Firebase Storage
- **Real-Time Database**: Firebase Firestore

---

## Installation & Setup

### Prerequisites

Make sure you have the following installed:

- Node.js (latest LTS version)
- Expo CLI
- MySQL Server
- Strapi CMS
- Firebase Account

### Steps to Run Locally

1. **Clone the Repository**

   ```sh
   git clone https://github.com/yourusername/skilllink.git
   cd skilllink
   ```

2. **Install Dependencies**

   ```sh
   npm install
   ```

3. **Start Expo Development Server**

   ```sh
   expo start
   ```

4. **Setup Firebase**

   - Create a Firebase project.
   - Enable Authentication, Firestore, and Storage.
   - Add Firebase configuration to `firebaseConfig.js`.

5. **Setup Strapi Backend**

   - Navigate to the `backend/` folder.
   - Run `npm install`.
   - Start Strapi with `npm run develop`.
   - Connect Strapi to MySQL.

6. **Run the Application**

   - Use an emulator or scan the QR code with Expo Go to test the app.

---

## Folder Structure

```
SkillLink/
├── frontend/               # React Native app
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── firebaseConfig.js
│   ├── package.json
│   └── App.js
├── backend/                # Strapi CMS
│   ├── api/
│   ├── config/
│   ├── database/
│   ├── package.json
│   └── server.js
├── README.md
└── .gitignore
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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

For queries or support, reach out to:

- **Email**: [bidyutghoshoffice@yahoo.com](mailto\:bidyutghoshoffice@yahoo.com)
- **GitHub**: [Bidyut-Kumar-Ghosh](https://github.com/Bidyut-Kumar-Ghosh)

Happy Learning! 🚀

