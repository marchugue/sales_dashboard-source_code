# Sales Analytics Dashboard

A full-stack data analytics dashboard built with **Node.js (MVC backend)** and **React (Feature-based frontend)**.

## Architecture

### Backend - MVC Pattern
```
backend/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── models/          # Data access layer
├── routes/          # API route definitions
├── middleware/      # Express middleware
├── utils/           # Utility functions
├── .env            # Environment variables
└── server.js       # Entry point
```

### Frontend - Feature-Based Architecture
```
frontend/src/
├── features/
│   └── dashboard/
│       ├── components/    # Dashboard UI components
│       ├── hooks/         # Custom React hooks
│       ├── services/      # API services
│       └── utils/         # Feature utilities
├── components/            # Shared components
├── hooks/                 # Global hooks
├── utils/                 # Global utilities
├── styles/                # CSS/Tailwind
└── App.js                # Entry point
```

## Features

### Core Dashboard Features
1. **KPI Summary Cards** - Total Sales, Profit, Orders, AOV
2. **Trend Analysis** - Sales/Profit over time (daily/monthly)
3. **Category Breakdown** - Sales by category (Bar/Pie charts)
4. **Geographic Analysis** - Sales by region
5. **Top Performers** - Top 10 products by sales
6. **Data Table** - Full transaction view with pagination
7. **Filter System** - Date range, Category, Region, Product filters

### Bonus Features
- **AI Insights Box** - Auto-generated business insights
- **CSV Export** - Download transaction data
- **PDF Export** - Print-friendly dashboard
- **Dark Mode** - Toggle between light/dark themes
- **Auto-Refresh** - Real-time data updates every 30 seconds
- **Responsive Design** - Mobile and desktop optimized

## Database Schema

The project uses your existing MySQL database with these key tables:
- `orders` - Order transactions
- `order_items` - Order line items
- `products` - Product catalog
- `categories` - Product categories
- `customers` - Customer data
- `regions` - Geographic regions

## Setup Instructions

### 1. Database Setup
Ensure MySQL is running and import the clean database:
```bash
mysql -u root -p sales_production < sales_production_clean.sql
```

> **Note:** Use `sales_production_clean.sql` (not `sales_production.sql`) - it has proper primary keys, indexes, and constraints.

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure database connection
# Edit .env file with your MySQL credentials:
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=sales_production

# Start backend server
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

Frontend runs on: `http://localhost:3000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/kpi` | GET | KPI summary data |
| `/api/dashboard/trend` | GET | Sales trend (daily/monthly) |
| `/api/dashboard/categories` | GET | Sales by category |
| `/api/dashboard/regions` | GET | Sales by region |
| `/api/dashboard/top-products` | GET | Top N products |
| `/api/dashboard/raw-data` | GET | Paginated transaction data |
| `/api/dashboard/filters` | GET | Filter options |
| `/api/dashboard/insights` | GET | AI-style insights |
| `/api/dashboard/export/csv` | GET | Export to CSV |

## Query Parameters

All endpoints support these filter parameters:
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `category` - Filter by category name
- `region` - Filter by region name
- `product` - Filter by product name

Additional parameters:
- `period` (trend endpoint): `daily` or `monthly`
- `limit` (top-products endpoint): Number of products
- `page`, `limit` (raw-data endpoint): Pagination

## Technologies Used

### Backend
- Node.js
- Express.js
- MySQL2 (Promise-based)
- CORS
- dotenv

### Frontend
- React 18
- Recharts (Charts)
- Tailwind CSS (Styling)
- Lucide React (Icons)
- html2canvas & jspdf (PDF export)

## Project Structure

```
data_analyst/
├── backend/                      # Node.js MVC Backend
├── frontend/                     # React Feature-Based Frontend
├── sales_production_clean.sql   # Database schema (use this one!)
├── sales_production.sql          # Original database dump (legacy)
└── README.md                     # This file
```

## Screenshots

The dashboard includes:
- 📊 KPI cards with real-time metrics
- 📈 Interactive charts (Area, Bar, Pie)
- 🌍 Geographic analysis
- 🏆 Top products leaderboard
- 📋 Sortable, searchable data table
- 🔍 Advanced filter panel
- 💡 AI insights box
- 🌙 Dark mode toggle

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm start    # Uses react-scripts
```

## Production Build

### Backend
```bash
cd backend
npm start    # Production mode
```

### Frontend
```bash
cd frontend
npm run build
# Serve build/ folder with any static server
```

## License

MIT License
