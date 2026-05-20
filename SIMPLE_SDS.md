# Software Design Specification (SDS) - Budgeting Application

## 1. Introduction
This application is a financial budgeting tool designed to help users manage their finances by tracking transactions, setting financial goals, and generating reports.

## 2. System Architecture
The application follows a typical MVC (Model-View-Controller) architecture on the backend, with a RESTful API serving a frontend web interface.

### 2.1 Backend Structure
- **Controllers**: Handle incoming HTTP requests and delegate business logic.
- **Services**: Contain the core business logic and data processing.
- **Models**: Define the database schemas using Mongoose.
- **Routes**: Define API endpoints.
- **Middleware**: Handle concerns like authentication (JWT).

## 3. Key Components
- **Auth**: User authentication and registration.
- **Transactions**: CRUD operations for user transactions (income/expenses).
- **Financial Goals**: Logic for setting and tracking savings goals.
- **Reports**: Data processing for dashboards, detailed reports, and category breakdowns.

## 4. Technology Stack
- **Backend**: Node.js, Express, TypeScript, MongoDB.
- **Frontend**: Vanilla JS, HTML, CSS, Chart.js.
