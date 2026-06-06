# Sales Analytics Dashboard - Frontend

A premium React.js Data Analyst Dashboard with responsive design, comprehensive analytics, and seamless backend integration.

## Features

- **KPI Dashboard** - Total Sales, Profit, Orders, and AOV with trend indicators
- **Interactive Charts** - Sales trends, category breakdown, regional analysis
- **Data Explorer** - Sortable, filterable, paginated transaction table
- **AI Insights Panel** - Contextual business insights
- **Advanced Filtering** - Date range, category, region, product filters
- **Fully Responsive** - Mobile-first design with collapsible sidebar
- **Loading States** - Skeleton screens for smooth UX
- **CSV Export** - Download transaction data

## Tech Stack

- React 18 with Hooks
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (charts)
- Axios (API client)
- React Router (navigation)
- Lucide React (icons)
- date-fns (date formatting)

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `frontend` folder:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Sales Analytics Dashboard
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/     # Dashboard-specific components
│   │   ├── layout/        # Layout components (Sidebar, TopBar)
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── pages/             # Route pages
│   ├── services/          # API services
│   ├── styles/            # Global styles
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── public/                # Static assets
└── package.json
```

## API Integration

The dashboard connects to the backend at `/api/dashboard` with these endpoints:

- `GET /api/dashboard/kpi` - KPI summary
- `GET /api/dashboard/trend` - Sales trend (daily/monthly)
- `GET /api/dashboard/categories` - Category breakdown
- `GET /api/dashboard/regions` - Regional analysis
- `GET /api/dashboard/top-products` - Top products
- `GET /api/dashboard/raw-data` - Paginated transaction data
- `GET /api/dashboard/filters` - Filter options
- `GET /api/dashboard/insights` - AI insights
- `GET /api/dashboard/export/csv` - CSV export

## Responsive Design

- **Desktop** (1024px+): Full sidebar, multi-column layouts
- **Tablet** (768px-1023px): Collapsible sidebar, 2-column grids
- **Mobile** (<768px): Slide-out navigation drawer, single column

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
