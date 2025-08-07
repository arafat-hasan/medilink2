# MediLink - Healthcare Management System

A comprehensive healthcare management system built with Vue.js frontend and Node.js backend, designed to streamline doctor appointments and medical supply management.

## 🏥 Features

### Core Functionality
- **User Management**: Role-based access for Admin, Doctor, and Patient users
- **Appointment System**: Complete booking, scheduling, and management system
- **Supply Management**: Medical inventory tracking with low stock alerts
- **Supply-Appointment Sync**: Automatic validation of supply availability for appointments
- **Reports & Analytics**: Comprehensive reporting dashboard for administrators
- **Notifications**: Email reminders and alerts (mock implementation)

### User Roles

#### Admin
- **Complete Doctor Management**: Add, edit, and delete doctors
- **User Management**: Create, edit, and delete all users (admin, doctor, patient)
- **Supply Management**: Full CRUD operations for medical supplies
- **System Settings**: Configure system preferences and notifications
- **Reports & Analytics**: Comprehensive reporting dashboard
- **System Monitoring**: Monitor system-wide activities and alerts

#### Doctor
- View personal schedule and appointments
- Access supply availability information
- Complete appointments and update status
- Manage personal profile and availability

#### Patient
- Book, reschedule, and cancel appointments
- View appointment history
- Update personal profile
- Receive appointment reminders

## 🚀 Technology Stack

### Backend
- **Node.js** with Express.js framework
- **SQLite3** database with Knex.js query builder
- **JWT** authentication
- **Joi** validation
- **bcryptjs** password hashing
- **node-cron** for scheduled tasks
- **nodemailer** for email notifications

### Frontend
- **Vue.js 3** with Composition API
- **Vue Router** for navigation
- **Pinia** for state management
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Lucide Vue** for icons

## 📦 Installation & Setup

### Prerequisites
- Node.js 20.x or higher
- npm or yarn package manager

### Backend Setup
```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The backend will run on `http://localhost:3000` and frontend on `http://localhost:8080`.

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medilink.com | password123 |
| Doctor | dr.smith@medilink.com | password123 |
| Patient | patient1@example.com | password123 |

## 📊 Database Schema

### Users Table
- User authentication and basic information
- Role-based access control (admin, doctor, patient)

### Doctors Table
- Doctor-specific information (specialization, license, availability)
- Links to users table

### Appointments Table
- Appointment scheduling and management
- Links patients to doctors
- Tracks required supplies

### Supplies Table
- Medical inventory management
- Stock levels and expiry tracking
- Supplier information

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get user profile
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user (admin or self)
- `DELETE /api/users/:id` - Delete user (admin only)

### Appointments
- `GET /api/appointments` - Get appointments (filtered by role)
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Supplies
- `GET /api/supplies` - Get all supplies
- `GET /api/supplies/low-stock` - Get low stock supplies
- `POST /api/supplies` - Create supply (admin only)
- `PUT /api/supplies/:id` - Update supply (admin only)
- `DELETE /api/supplies/:id` - Delete supply (admin only)

### Reports
- `GET /api/reports/upcoming-appointments` - Upcoming appointments report
- `GET /api/reports/low-stock` - Low stock report
- `GET /api/reports/cancellations` - Cancellations report
- `GET /api/reports/appointment-stats` - Appointment statistics

### Settings
- `GET /api/settings` - Get system settings (admin only)
- `PUT /api/settings` - Update system settings (admin only)

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### Database Configuration
The system uses SQLite3 by default. Configuration can be modified in `backend/knexfile.js`.

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones

## 🔔 Notification System

The system includes automated notifications for:
- Appointment reminders (24 hours before)
- Low stock alerts
- Supply expiry warnings
- Daily schedule summaries

## 📈 Reports & Analytics

Administrators have access to:
- Upcoming appointments overview
- Low stock supply reports
- Appointment cancellation tracking
- Monthly appointment trends
- Supply usage analytics

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation with Joi
- CORS protection
- Helmet.js security headers

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Run database migrations
3. Start the server with `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Serve the `dist` folder with a web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**MediLink** - Improving healthcare services through technology
