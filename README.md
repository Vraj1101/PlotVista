# 🏡 PlotVista

PlotVista is a modern Full Stack MERN application that allows users to buy, sell, and manage land and property listings. It provides separate dashboards for buyers, sellers, and administrators with advanced features like property comparison, favorites, messaging, reviews, notifications, and admin approval.

---

## 🚀 Features

### 👤 Authentication
- User Registration & Login
- JWT Authentication
- Password Encryption (bcrypt)
- Forgot Password & Reset Password

### 🏠 Property Management
- Add Property
- Edit Property
- Delete Property
- Property Image Upload
- Property Status
  - Available
  - Reserved
  - Sold

### 🔍 Search & Discovery
- Search by City/Area
- Property Filters
- Sorting
- Pagination
- Interactive Map View
- Recently Viewed Properties

### ❤️ Buyer Features
- Favorite Properties
- Compare Properties
- Reviews & Ratings
- Property Inquiry
- Real-time Messaging
- Notifications

### 🧑‍💼 Seller Features
- Seller Dashboard
- My Properties
- Inquiry Management
- Analytics
- Property Approval Status

### 🛡 Admin Features
- Admin Dashboard
- User Management
- Delete Users
- Change User Roles
- Approve Properties
- Verify Sellers
- Resolve Property Reports

### 📩 Notifications
- In-App Notifications
- Email Notifications using Nodemailer

---

## 🛠 Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Tailwind CSS
- Leaflet Maps

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Nodemailer

---

## 📂 Project Structure

```
PlotVista
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   └── server.js
│
├── frontend
│   ├── components
│   ├── context
│   ├── pages
│   └── App.jsx
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/PlotVista.git
```

### Backend

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_SECRET
EMAIL_USER=YOUR_EMAIL
EMAIL_PASS=YOUR_APP_PASSWORD
```

Run Backend

```bash
npm run server
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| Buyer | Browse, Favorite, Compare, Review, Inquiry |
| Seller | Add/Edit/Delete Properties, Manage Inquiries |
| Admin | Manage Users, Approve Properties, Verify Sellers |

---

## 🌟 Future Improvements

- Payment Gateway
- AI Property Recommendations
- Voice Search
- Chatbot Support
- Mobile Application

---

## 👨‍💻 Developed By

**Vrajkumar Makwana**

B.Tech ICT Student

---

## ⭐ If you like this project

Please consider giving it a ⭐ on GitHub.