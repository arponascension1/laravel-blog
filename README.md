# 📝 Laravel Blog - Modern Content Management System

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=flat&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.x-9553E9?style=flat)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A feature-rich, modern blog platform built with Laravel 11, React, TypeScript, and Inertia.js. This comprehensive content management system (CMS) provides a powerful admin panel for managing users, content, media, categories, and tags with an intuitive interface.

## ✨ Features

### 🎨 Modern Tech Stack
- **Backend**: Laravel 11 with PHP 8.2+
- **Frontend**: React 18 with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Bridge**: Inertia.js for seamless SPA experience
- **Authentication**: Laravel Fortify with 2FA support
- **Media Management**: Spatie Media Library

### 🛡️ Security & Authentication
- ✅ Secure user authentication with Laravel Fortify
- ✅ Two-Factor Authentication (2FA) support
- ✅ Role-based access control (Admin/User)
- ✅ Password reset functionality
- ✅ Email verification
- ✅ Session management

### 👥 User Management
- ✅ Complete CRUD operations for users
- ✅ Role assignment (Admin/User)
- ✅ User profile management
- ✅ Advanced filtering and search
- ✅ Pagination support
- ✅ User statistics dashboard

### 🗂️ Content Management

#### Categories
- ✅ Hierarchical category structure (parent/child)
- ✅ Custom category icons (Lucide Icons)
- ✅ Category images from media library
- ✅ Color coding for visual organization
- ✅ SEO fields (meta title, description, keywords, OG image)
- ✅ Custom slugs with auto-generation
- ✅ Active/Inactive status
- ✅ Sortable table headers
- ✅ Advanced filtering (search, status, parent)
- ✅ Drag-and-drop ordering

#### Tags
- ✅ Tag creation and management
- ✅ Color-coded tags
- ✅ SEO optimization fields
- ✅ Custom slugs
- ✅ Sortable and filterable
- ✅ Bulk operations support
- ✅ Active/Inactive status

#### Media Library
- ✅ File upload with drag-and-drop
- ✅ Folder organization
- ✅ Image preview
- ✅ Search and filter capabilities
- ✅ Multiple file selection
- ✅ File deletion and management
- ✅ Supported formats: Images, Videos, Documents

### 📊 Admin Dashboard
- ✅ Statistics overview (Users, Categories, Tags, Media)
- ✅ Quick action shortcuts
- ✅ Visual data representation
- ✅ Real-time counts
- ✅ Clickable stat cards for quick navigation

### 🎯 Additional Features
- ✅ SEO-friendly URLs
- ✅ Clean URL parameters
- ✅ Responsive design for all devices
- ✅ Dark mode support
- ✅ Toast notifications
- ✅ Form validation
- ✅ Error handling
- ✅ Breadcrumb navigation

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- MySQL/PostgreSQL/SQLite
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/arponascension1/laravel-blog.git
cd laravel-blog
```

2. **Install PHP dependencies**
```bash
composer install
```

3. **Install Node dependencies**
```bash
npm install
```

4. **Environment setup**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Configure your database**

Edit `.env` file with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_blog
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

6. **Run migrations**
```bash
php artisan migrate
```

7. **Create storage link**
```bash
php artisan storage:link
```

8. **Create admin user**
```bash
php artisan make:admin
```
Follow the prompts to create your admin account.

9. **Build frontend assets**
```bash
npm run build
```

10. **Start the development server**
```bash
# Terminal 1 - Laravel server
php artisan serve

# Terminal 2 - Vite dev server (for hot reload)
npm run dev
```

Visit `http://localhost:8000` in your browser.

## 🔧 Development

### Available Commands

```bash
# Development
npm run dev              # Start Vite dev server
php artisan serve        # Start Laravel server

# Building
npm run build           # Build for production
npm run preview         # Preview production build

# Database
php artisan migrate     # Run migrations
php artisan migrate:fresh --seed  # Fresh migration with seeders

# User Management
php artisan make:admin  # Create admin user

# Code Quality
npm run lint           # Lint TypeScript/React code
php artisan test       # Run PHPUnit tests
```

## 📁 Project Structure

```
laravel-blog/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Admin/        # Admin panel controllers
│   │   ├── Middleware/       # Custom middleware
│   │   └── Requests/         # Form requests
│   ├── Models/               # Eloquent models
│   └── Providers/            # Service providers
├── database/
│   ├── migrations/           # Database migrations
│   └── seeders/             # Database seeders
├── resources/
│   ├── js/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Inertia.js pages
│   │   ├── layouts/         # Page layouts
│   │   └── types/           # TypeScript types
│   └── css/                 # Stylesheets
├── routes/
│   ├── web.php             # Web routes
│   └── settings.php        # Settings routes
└── public/                 # Public assets
```

## 🎨 Tech Stack Details

### Backend
- **Laravel 11**: Modern PHP framework with elegant syntax
- **Laravel Fortify**: Authentication scaffolding
- **Spatie Media Library**: Advanced media management
- **Inertia.js**: Modern monolith architecture

### Frontend
- **React 18**: Component-based UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful, accessible component library
- **Lucide Icons**: Modern icon library
- **Vite**: Fast build tool

## 📸 Screenshots

### Admin Dashboard
The main dashboard provides an overview of your blog statistics with quick access to key features.

### Category Management
Hierarchical category system with images, icons, and SEO optimization.

### Tag Management
Organize content with color-coded tags and advanced filtering.

### Media Library
Professional media management with folder organization and search capabilities.

## 🔐 Security

- All user inputs are validated and sanitized
- CSRF protection enabled
- XSS prevention measures
- SQL injection protection via Eloquent ORM
- Password hashing with bcrypt
- Two-factor authentication available
- Role-based access control

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Arpon Ascension**
- GitHub: [@arponascension1](https://github.com/arponascension1)
- Email: arponascension20@gmail.com

## 🙏 Acknowledgments

- [Laravel](https://laravel.com) - The PHP Framework
- [React](https://react.dev) - JavaScript Library
- [Inertia.js](https://inertiajs.com) - Modern Monolith
- [Tailwind CSS](https://tailwindcss.com) - CSS Framework
- [shadcn/ui](https://ui.shadcn.com) - UI Components
- [Spatie](https://spatie.be) - Laravel Packages

## 🐛 Bug Reports

If you discover any bugs, please create an issue on GitHub with detailed information about the problem.

## 📞 Support

For support and questions, please open an issue or contact via email.

## 🗺️ Roadmap

- [ ] Blog post creation and management
- [ ] Comment system
- [ ] Post scheduling
- [ ] Advanced search functionality
- [ ] RSS feed
- [ ] Social media sharing
- [ ] Newsletter integration
- [ ] Analytics dashboard
- [ ] API endpoints
- [ ] Multi-language support

## ⭐ Show Your Support

Give a ⭐️ if you like this project!

---

**Built with ❤️ using Laravel, React, and TypeScript**
