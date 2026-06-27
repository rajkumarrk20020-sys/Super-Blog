# SmartBlog – Advanced Blog Management System

A premium full-stack MERN blogging platform with authentication, author profiles, categories, search, and responsive editorial UI.

---

## Tech Stack

* **Frontend**: React.js (Vite bundle)
* **Backend**: Node.js + Express.js (MVC Pattern)
* **Database**: MongoDB + Mongoose (ODM)
* **Authentication**: JWT (JSON Web Tokens) + bcryptjs (Password Hashing)
* **State Management**: React Context API
* **Styling**: Bootstrap 5 + Bootstrap Icons + Custom CSS Customizations
* **API Communication**: Axios (with credentials proxy)
* **File Upload**: Multer (Local storage disk engine)
* **Environment Configuration**: dotenv

---

## Folder Structure

```text
/smartblog
  /package.json         - Root package configuration for executing concurrent startup
  /server               - Backend Node/Express API application
    /config/db.js       - MongoDB connection handler
    /models/            - Mongoose Schemas (User, Blog, Category, Comment, Contact)
    /controllers/       - Route handlers containing application logic
    /middleware/        - Authorization guards & file upload configs
    /routes/            - Express routing paths
    /scripts/seed.js    - Initial database seeder script
    /uploads/           - Image storage directory
    - server.js         - Main application entry point
    - .env              - Environment variables config
  /client               - Frontend React SPA application
    /public/            - Static assets
    /src/
      /components/      - Reusable UI elements (Navbar, Footer, BlogCard, Editor, etc.)
      /context/         - Auth state provider
      /pages/           - Public pages (Home, Blogs List, Details, About, Contact, Login)
      /pages/admin/     - Admin portal views (Dashboard, Managers, Moderation panels)
      - App.jsx         - React Router configuration & Layout mapping
      - main.jsx        - Application bootstrap
      - index.css       - Custom UI styling variables & theme
    - vite.config.js    - Proxy middleware and bundling settings
```

---

## Database Design

### Mongoose Collection Schemas

1. **User Schema**:
   * `name` (String, required)
   * `email` (String, required, unique, validated format)
   * `password` (String, required, minlength 6, encrypted)
   * `role` (String, enum: `['Visitor', 'Author', 'Admin']`, default: `Visitor`)
   * `profileImage` (String, default: `""`)
   * `createdAt` (Date, default: `Date.now`)

2. **Blog Schema**:
   * `title` (String, required, unique trim)
   * `slug` (String, required, unique SEO slug)
   * `content` (String, required HTML format)
   * `featuredImage` (String, default: `""`)
   * `category` (ObjectId ref `Category`, required)
   * `author` (ObjectId ref `User`, required)
   * `status` (String, enum: `['Draft', 'Published']`, default: `Draft`)
   * `views` (Number, default: `0`)
   * `tags` ([String], default: `[]`)
   * `createdAt` (Date, default: `Date.now`)

3. **Category Schema**:
   * `name` (String, required, unique)
   * `slug` (String, required, unique)
   * `description` (String, required)

4. **Comment Schema**:
   * `blogId` (ObjectId ref `Blog`, required)
   * `userId` (ObjectId ref `User`, required)
   * `comment` (String, required text)
   * `status` (String, enum: `['Pending', 'Approved', 'Rejected']`, default: `Pending`)
   * `createdAt` (Date, default: `Date.now`)

5. **Contact Schema**:
   * `name` (String, required)
   * `email` (String, required)
   * `subject` (String, required)
   * `message` (String, required)
   * `createdAt` (Date, default: `Date.now`)

---

## API Map Documentation

| Section | Endpoint | Method | Guard | Description |
|---|---|---|---|---|
| **Auth** | `/api/auth/register` | POST | None | Sign up a new user (profile picture supported) |
| | `/api/auth/login` | POST | None | Verify email & password; issues JWT |
| | `/api/auth/profile` | GET | Token | Retrieve logged-in user profile details |
| | `/api/auth/users` | GET | Admin | List all registered users |
| | `/api/auth/users/:id/role` | PUT | Admin | Modify a user's role |
| | `/api/auth/users/:id` | DELETE | Admin | Delete a user account |
| **Blogs** | `/api/blogs` | GET | None | Get blogs list (search, paginate, category filter) |
| | `/api/blogs/:id` | GET | None | Fetch single blog details (slug or ID) |
| | `/api/blogs/:id/related` | GET | None | Get 3 related blogs in same category |
| | `/api/blogs` | POST | Author/Admin | Create a new blog post |
| | `/api/blogs/:id` | PUT | Owner/Admin | Update a blog post details |
| | `/api/blogs/:id` | DELETE | Owner/Admin | Delete a blog post |
| **Categories** | `/api/categories` | GET | None | Get categories list |
| | `/api/categories` | POST | Admin | Add a new category |
| | `/api/categories/:id` | PUT | Admin | Edit category details |
| | `/api/categories/:id` | DELETE | Admin | Delete category |
| **Comments** | `/api/comments` | POST | Token | Post a comment on a blog post |
| | `/api/comments/blog/:blogId`| GET | None | Get approved comments for a blog post |
| | `/api/comments` | GET | Admin | List comments for moderation |
| | `/api/comments/:id` | PUT | Admin | Approve or reject comment status |
| | `/api/comments/:id` | DELETE | Owner/Admin | Remove a comment |
| **Contact** | `/api/contact` | POST | None | Submit support inquiry |
| | `/api/contact` | GET | Admin | Retrieve all inquiries |
| **Dashboard** | `/api/dashboard/stats` | GET | Author/Admin | Fetch dashboard statistics counts |

---

## Installation & Setup Instructions

### Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
* [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on port `27017`

### 1. Database Connection & Seeding
First, ensure your MongoDB service is running. 

Configure your `.env` variables inside `/server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smartblog
JWT_SECRET=smartblogsecretkey987654321
NODE_ENV=development
```

### 2. Dependency Installation
From the root folder, run:
```bash
# Installs root, server, and client dependencies
npm install
npm run install-all
```

Alternatively, install individually:
```bash
# Server packages
cd server
npm install

# Client packages
cd ../client
npm install
```

### 3. Seed Sample Data
Populate the database with default categories, user roles (Admin, Author, Visitor), and sample articles:
```bash
cd server
npm run seed
```
This inserts the following default accounts for testing:
* **Admin**: `admin@smartblog.com` / `admin123`
* **Author**: `author@smartblog.com` / `author123`
* **Visitor**: `visitor@smartblog.com` / `visitor123`

### 4. Running the Application

To run both the server and client concurrently from the root directory:
```bash
# Start concurrently
npm run dev
```

To run them individually:
* **Start Server**: `npm start` (inside `/server`, runs on port `5000`)
* **Start Client**: `npm run dev` (inside `/client`, runs on port `5173`)

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## Production Build

To build the React application for deployment:
```bash
cd client
npm run build
```
This generates the optimized production bundle inside `client/dist`.
