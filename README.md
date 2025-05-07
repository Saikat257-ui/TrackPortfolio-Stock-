# Portfolio Tracker

A full-stack stock portfolio tracking application that provides real-time stock price updates and portfolio analytics. Built with React, TypeScript, Spring Boot, and Finnhub API integration.

## Features

- Real-time stock price updates
- Interactive dashboard with portfolio metrics
- Stock search with auto-suggestions
- Portfolio value tracking and performance analysis
- Dark/Light mode support
- Responsive design with Tailwind CSS
- Interactive charts using Recharts
- RESTful API backend with Spring Boot
- H2 in-memory database
- Rate-limited API integration with Finnhub

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Recharts for data visualization
- Lucide React for icons
- Axios for API calls

### Backend
- Spring Boot 2.7.0
- Spring Data JPA
- H2 Database
- RESTful API endpoints
- Finnhub API integration

## Prerequisites

- Node.js (v16 or higher)
- Java 11 or higher
- Maven
- Finnhub API key (get one at https://finnhub.io/)

## Setup & Installation

1. Clone the repository:
```bash
git clone https://github.com/Saikat257-ui/TrackPortfolio.git
cd TrackPortfolio
```

2. Backend Setup:
```bash
# Create .env file in root directory
echo "FINNHUB_API_KEY=your_api_key_here" > .env

# Build and run Spring Boot application
mvn clean install
mvn spring-boot:run
```

3. Frontend Setup:
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file
echo "FINNHUB_API_KEY=your_api_key_here" > .env

# Start development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8086
- H2 Console: http://localhost:8086/h2-console

## Environment Variables

### Backend (.env)
```
FINNHUB_API_KEY=your_finnhub_api_key_here
```

### Frontend (.env)
```
FINNHUB_API_KEY=your_finnhub_api_key_here
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

- `GET /api/stocks` - Get all stocks in portfolio
- `POST /api/stocks` - Add a new stock
- `PUT /api/stocks/{id}` - Update a stock
- `DELETE /api/stocks/{id}` - Delete a stock
- `GET /api/stocks/portfolio-value` - Get total portfolio value
- `GET /api/stocks/quote/{symbol}` - Get real-time stock quote
- `GET /api/stocks/search` - Search for stocks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
