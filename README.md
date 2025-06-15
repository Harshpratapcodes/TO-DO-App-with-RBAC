# 📝 To-Do App

A powerful, full-stack To-Do application with **Role-Based Access Control (RBAC)**, a feature-rich **Admin Panel**, a personalized **User Dashboard**, and full **BREAD** operations (Browse, Read, Edit, Add, Delete).

---

## 🎥 Demo

> 📽️ [Watch Demo](assets/demo.mp4)


---

## 🔑 Features

### ✅ Role-Based Access Control (RBAC)
- Assign roles like **Admin**, **Manager**, and **User**
- Fine-grained access control based on roles
- Middleware-based route protection

### 🛠️ Admin Panel
- Manage all users, roles, and tasks
- View and edit using modals
- Filter, sort, and search with DataTables
- Add new users/admins with ease

### 👤 User Dashboard
- View assigned tasks
- Track task status (completed/pending)
- Intuitive layout for better task management

### 📋 BREAD Operations
- **Browse** task lists
- **Read** task details
- **Edit** and **Delete** tasks or users
- Admins can create/update roles and assign them dynamically

---

## ⚙️ Tech Stack

- **Backend**: Node.js, Express, Sequelize, PostgreSQL  
- **Frontend**: EJS, Bootstrap 5, jQuery, DataTables  
- **Authentication**: Sessions + Cookies  
- **Architecture**: MVC pattern  

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/todo-app.git

# Install dependencies
npm install

# Set up your database 
connect a database 

# Set your environment variables, for example
DB_NAME='TO_DO'
DB_USER='postgres_your'
DB_PASSWORD='123341421'
DB_HOST=125.0.1.1
JWT_SECRET='afb50de0563f173fa72b9ba01dbf0f2718bba7f22128f07680bc59d753aebd567272d7ffe1326fe6a56afba963bc6a79fdb4ff9e8685ae1'
EMAIL_USER='hukusdyfkyusdf@gmail.com'
EMAIL_PASS='fssr rkzp sgwy mloc'


# Start the development server
npm run dev
or if you want to run with nodemon
npm run dev


