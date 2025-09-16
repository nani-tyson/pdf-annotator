# PDF Annotator

A full-stack web application designed for uploading, viewing, and annotating PDF documents directly in the browser.

This project is a comprehensive PDF management tool that provides users with a personal library for their documents. Users can register and log in to a secure account, upload PDF files, and interact with them through a feature-rich viewer. [cite_start]The core functionality allows for precise text highlighting, with annotations (including custom notes) being saved and automatically restored across sessions[cite: 4]. [cite_start]The goal is to build a full-stack React application that allows users to upload PDF files, highlight text within the document, and persist these highlights for later viewing[cite: 3].

## Key Features

* [cite_start]**🔐 User Authentication:** Secure user registration and login system using email and password[cite: 12]. [cite_start]Session handling is managed with JWT tokens[cite: 13].
* [cite_start]**📚 Personal PDF Library:** A dashboard where each user can view a list of their uploaded PDFs[cite: 33]. [cite_start]Functionality includes uploading, renaming, and deleting files[cite: 34].
* [cite_start]**📄 In-Browser PDF Viewer:** A smooth, in-browser viewer with support for pagination and zoom[cite: 16].
* [cite_start]**✨ Text Highlighting:** Users can select and highlight text on any page within the PDF[cite: 18]. [cite_start]Highlights are persisted and automatically restored when a document is reopened[cite: 31].
* [cite_start]**📝 Custom Notes:** Ability for users to add and edit text notes or comments to each highlight they create[cite: 82].
* [cite_start]**🔍 Annotation Search:** Users can search for text within their saved annotations to quickly find information[cite: 78].
* [cite_start]**💾 Persistent Storage:** All uploaded PDF files and their highlights are uniquely tracked with UUIDs and saved to the backend database[cite: 6, 28].

## Tech Stack

| Category           | Technology                               |
| ------------------ | ---------------------------------------- |
| **Frontend** | React (Vite), Redux Toolkit, Tailwind CSS, `react-pdf` |
| **Backend** | [cite_start]Node.js, Express.js [cite: 51]                      |
| **Database** | [cite_start]MongoDB (with Mongoose) [cite: 52]                  |
| **Authentication** | [cite_start]JSON Web Tokens (JWT) [cite: 53]                    |
| **File Storage** | Cloudinary (for PDFs)                    |

## Backend Setup

This project uses a Node.js and Express backend with MongoDB for the database and Cloudinary for file storage.

### Prerequisites

* Node.js (v18 or later recommended)
* npm or another package manager
* MongoDB instance (local or a cloud service like MongoDB Atlas)

### Installation & Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Create a file named `.env` in the `backend` directory and add the following environment variables. You can copy the structure from the example below.

    `.env.example`
    ```
    # Server Port
    PORT=4000

    # MongoDB Connection String
    MONGO_URI=<your_mongodb_connection_string>

    # JWT Secret for Authentication
    JWT_SECRET=<your_jwt_secret_key>

    #CORS
    LOCALHOST_FRONTEND_URL = http://localhost:5173
    PRODUCTION_FRONTEND_URL =

    # Cloudinary Credentials
    CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
    ```

4.  **Run the Server:**
    To start the server in development mode (which usually uses `nodemon` for auto-reloading), run:
    ```bash
    npm run dev
    ```
    
    To start the server for production, run:
    ```bash
    npm start
    ```
    The server should now be running on `http://localhost:4000`.
