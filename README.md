# Practice Support

A comprehensive web application for law firm ediscovery and litigation support teams to manage clients, matters, and team assignments.

## Features

- **Client Management**: Track law firm clients with 7-digit client numbers
- **Matter Management**: Organize matters with 6-digit matter numbers, linked to clients
- **People Management**: Manage attorneys, paralegals, vendors, and project managers
- **Task Management**: Create and assign tasks with priorities, due dates, and status tracking
- **User Management**: Create user accounts linked to people for personalized dashboards
- **Relationship Tracking**: 
  - Assign attorneys and paralegals to clients
  - Assign team members to specific matters
  - Link tasks to matters and assign to people
  - Link users to people for filtered task views
  - Automatic client-person linking when assigned to matters
- **Detail Views**: Comprehensive detail pages for all entities
- **Team Management**: Modal interfaces for managing matter teams and person assignments
- **Personalized Dashboards**: User-specific filtering showing only clients, matters, and tasks relevant to the current user
- **Streamlined Interface**: Dashboard shows user-specific data without administrative clutter
- **Contextual Data**: All dashboard sections filter based on user's person assignments and relationships

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Prisma ORM** with SQLite database
- **RESTful API** with full CRUD operations

### Frontend
- **React** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Project Structure

```
practice-support/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   └── styles/         # CSS styles
│   └── package.json
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── routes/         # API routes
│   │   └── middleware/     # Express middleware
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   └── package.json
└── package.json           # Root package.json
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd practice-support
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
cd server
npx prisma migrate dev
```

4. Start the development servers:
```bash
# From the root directory
npm run dev
```

This will start both the backend server (port 5001) and frontend development server (port 3000).

5. Create sample data (optional):
   - Navigate to http://localhost:3000
   - Use the web interface to create people, then users linked to those people
   - Create clients, matters, and tasks to fully test the system
   - The first user created will be used as the "current user" for personalized views

## API Endpoints

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Matters
- `GET /api/matters` - Get all matters
- `GET /api/matters/:id` - Get matter by ID
- `POST /api/matters` - Create new matter
- `PUT /api/matters/:id` - Update matter
- `DELETE /api/matters/:id` - Delete matter

### People
- `GET /api/people` - Get all people
- `GET /api/people/:id` - Get person by ID
- `POST /api/people` - Create new person
- `PUT /api/people/:id` - Update person
- `DELETE /api/people/:id` - Delete person

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/matters/:matterId/tasks` - Get tasks for a specific matter
- `GET /api/people/:personId/tasks` - Get tasks for a specific person
- `GET /api/auth/current-user/tasks` - Get tasks for current user's linked person

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/auth/current-user` - Get current user information

## Database Schema

### Core Models
- **Person**: Attorneys, paralegals, vendors, project managers
- **Client**: Law firm clients with unique 7-digit numbers
- **Matter**: Legal matters with unique 6-digit numbers
- **Task**: Work items with priorities, due dates, and status tracking
- **User**: User accounts with optional person linking for personalized views
- **MatterPerson**: Junction table for many-to-many matter-person relationships

### Relationships
- Client → Matter (one-to-many)
- Client → Person (optional attorney/paralegal assignments)
- Matter → Person (many-to-many via MatterPerson junction table)
- Matter → Task (one-to-many, optional)
- Person → Task (one-to-many as owner, many-to-many as assignees)
- User → Person (optional one-to-one for personalized filtering)

## Features in Detail

### Auto-Linking
When a person is assigned to a matter, they are automatically linked to the client:
- Attorneys assigned to matters become client attorneys (if none assigned)
- Paralegals assigned to matters become client paralegals (if none assigned)

### Team Management
- **Matter Detail**: "Manage Team" button opens modal to assign/remove people
- **Person Detail**: "Manage Matters" button opens modal to assign/remove matters
- Real-time updates with proper relationship management

### Task Management
- **Task Creation**: Create tasks with title, description, priority, due date, and status
- **Task Assignment**: Assign task owners (required) and additional assignees (optional)
- **Matter Integration**: Link tasks to specific matters for project organization
- **Priority Levels**: URGENT, HIGH, MEDIUM, LOW with color-coded indicators
- **Status Tracking**: TODO, IN_PROGRESS, COMPLETED, ON_HOLD
- **Due Date Tracking**: Visual indicators for overdue tasks
- **Task Detail Pages**: Comprehensive view with team information and timeline
- **User-Specific Views**: Tasks page and matter task sections show only current user's tasks
- **Auto-Assignment**: New tasks automatically assigned to current user

### User Management
- **User Accounts**: Create user accounts with email and personal information (username auto-generated)
- **Person Linking**: Optional linking of users to existing Person records
- **Personalized Dashboards**: When a user is linked to a person, see only relevant tasks, clients, and matters
- **Current User System**: First user in database acts as current user (placeholder for authentication)
- **Smart Filtering**: Dashboard shows clients where user is attorney/paralegal, matters where user is assigned, and user's tasks
- **User-Specific Views**: All sections show "My [Items]" vs "Total [Items]" based on user context
- **Auto-Generated Usernames**: Usernames are automatically created from email (before @) or first/last name

### Navigation
- Clickable entity names throughout the application
- Detail pages with edit and delete functionality
- Breadcrumb navigation and intuitive linking

## Development

### Database Changes
When modifying the Prisma schema:
```bash
cd server
npx prisma migrate dev --name "description-of-change"
```

### Adding New Features
1. Update database schema if needed (Prisma)
2. Add/modify API endpoints (Express controllers/routes)
3. Create/update React components
4. Add navigation and linking

## License

This project is for internal use by law firm ediscovery and litigation support teams.