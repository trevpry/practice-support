# Practice Support

A comprehensive web application for law firm ediscovery and litigation support teams to manage clients, matters, and team assignments.

## Features

- **Client Management**: Track law firm clients with 7-digit client numbers
  - **Assignment Analytics**: Visual breakdown of client assignments by attorney, paralegal, and project manager
  - **Search Functionality**: Comprehensive search across client names, numbers, and assigned staff
- **Matter Management**: Organize matters with 6-digit matter numbers, linked to clients
  - **Matter Status Tracking**: Track matter progress through workflow stages: Collection, Culling, Review, Production, Inactive
  - **Status Visualization**: Color-coded status badges for quick identification
  - **Status Analytics**: Visual status breakdown with counts for each workflow stage on matters page
  - **Search Functionality**: Comprehensive search across matter names, numbers, clients, and status
  - **Kanban Board**: Drag-and-drop interface for visual matter status management
- **People Management**: Manage attorneys, paralegals, vendors, and project managers
  - **Type Analytics**: Visual breakdown of people by type (Attorney, Paralegal, Vendor, Project Manager)
  - **Search Functionality**: Comprehensive search across names, email, phone, type, and organization
  - **Organization Linking**: Link people to organizations with organizational hierarchy and contact management
- **Organization Management**: Track organizations that people are affiliated with
  - **Organization Types**: Current Law Firm, Co-Counsel, Opposing Counsel, Vendor, Third Party
  - **Type Analytics**: Visual breakdown of organizations by type with color-coded statistics
  - **Search Functionality**: Comprehensive search across names, types, contact information, and location
  - **Contact Information**: Full contact details including address and website
  - **People Relationships**: View and manage people linked to each organization
- **Estimate Management**: Track vendor estimates for matters
  - **Vendor Integration**: Estimates can only be created for organizations of type "Vendor"
  - **Matter Linking**: Each estimate is tied to a specific matter
  - **Cost Tracking**: Store estimate descriptions and total dollar amounts
  - **Comprehensive Views**: View estimates by matter and organization
  - **Detail Pages**: Full estimate detail pages with related vendor agreements
- **Vendor Agreement Management**: Track vendor contracts and agreements
  - **Vendor Integration**: Agreements can only be created for organizations of type "Vendor"
  - **Matter Linking**: Each agreement is tied to a specific matter
  - **Estimate Integration**: Agreements can optionally be linked to specific estimates
  - **Signature Tracking**: Track who signed the agreement (Project Manager, Partner, Client)
  - **Agreement Text**: Store full agreement text and terms
  - **Comprehensive Views**: View agreements by matter and vendor
- **Invoice Management**: Track vendor invoices and billing
  - **Vendor Integration**: Invoices can only be created for organizations of type "Vendor"
  - **Matter Linking**: Each invoice is tied to a specific matter
  - **Estimate Integration**: Invoices can optionally be linked to specific estimates
  - **Invoice Tracking**: Track invoice date, amount, approval status, and payment status
  - **Status Management**: Track invoice workflow: Received, Submitted, Question, Paid
  - **Approval System**: Mark invoices as approved or pending approval
  - **Comprehensive Views**: View invoices by matter and vendor
- **Contract Review Management**: Track contract review projects and document batches
  - **Matter-Centric Workflow**: Contract reviews are tied to specific matters and workspaces
  - **Vendor Organization Tracking**: Link contract reviews to vendor organizations
  - **Review Manager Assignment**: Assign review managers to oversee contract review projects
  - **Document Count Tracking**: Track the number of documents in each review batch
  - **Status Management**: Track review status: Discussing, In Progress, Completed
  - **Status Analytics**: Visual breakdown of contract reviews by status and linked items
  - **Search Functionality**: Comprehensive search across titles, status, matters, vendors, managers, and workspaces
  - **Timeline Management**: Set start and end dates for review projects
  - **Linked Item Integration**: Link estimates, vendor agreements, and invoices to contract reviews
  - **Smart Filtering**: Linked items are filtered by matter and organization for relevant selection
  - **Detail Views**: Comprehensive detail pages with linked item summaries and quick stats
  - **Clickable Navigation**: Contract review titles link to detailed information pages
  - **Clickable Linked Items**: Estimates, agreements, and invoices link to their respective detail pages
  - **Dashboard Integration**: "My Contract Reviews" section shows user's non-completed reviews for assigned matters
- **Custodian Management**: Track custodians for data collection projects
  - **Personal Information Tracking**: Store custodian names, emails, departments, and titles
  - **Matter Integration**: Link custodians to specific matters for organized data collection
  - **Information Analytics**: Visual breakdown of custodians by available information completeness
  - **Search Functionality**: Comprehensive search across names, emails, departments, titles, and matters
- **Collection Management**: Manage data collection workflows and tracking
  - **Status Tracking**: Track collection progress through multiple workflow stages
  - **Status Analytics**: Visual breakdown of collections by status (Discussing, Scheduled, In Progress, Completed)
  - **Search Functionality**: Comprehensive search across collection names, descriptions, status, custodians, and matters
  - **Custodian Integration**: Link collections to specific custodians for organized tracking
- **Task Management**: Create and assign tasks with priorities, due dates, and status tracking
- **User Management**: Create user accounts linked to people for personalized dashboards
- **Relationship Tracking**: 
  - Assign attorneys and paralegals to clients
  - Assign team members to specific matters
  - Link tasks to matters and assign to people
  - Link users to people for filtered task views
  - Automatic client-person linking when assigned to matters
- **Detail Views**: Comprehensive detail pages for all entities
  - **Matter Status Display**: Matter status prominently shown at the top of matter detail pages with color-coded badges
  - **Consistent Status Badges**: Matter status badges displayed across all pages including client details and person assignments
- **Team Management**: Modal interfaces for managing matter teams and person assignments
- **Personalized Dashboards**: User-specific filtering showing only clients, matters, tasks, and contract reviews relevant to the current user
- **Streamlined Interface**: Dashboard shows user-specific data without administrative clutter
- **Contextual Data**: All dashboard sections filter based on user's person assignments and relationships
- **Contract Review Dashboard**: Shows active contract reviews for matters where user is assigned, with status tracking and quick navigation

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

### Organizations
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get organization by ID
- `POST /api/organizations` - Create new organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization
- `GET /api/organizations/types` - Get available organization types

### Estimates
- `GET /api/estimates` - Get all estimates
- `GET /api/estimates/:id` - Get estimate by ID
- `GET /api/estimates/matter/:matterId` - Get estimates for a specific matter
- `POST /api/estimates` - Create new estimate
- `PUT /api/estimates/:id` - Update estimate
- `DELETE /api/estimates/:id` - Delete estimate

### Vendor Agreements
- `GET /api/vendor-agreements` - Get all vendor agreements
- `GET /api/vendor-agreements/:id` - Get vendor agreement by ID
- `GET /api/vendor-agreements/matter/:matterId` - Get vendor agreements for a specific matter
- `GET /api/vendor-agreements/signed-by-options` - Get available signed by options
- `POST /api/vendor-agreements` - Create new vendor agreement
- `PUT /api/vendor-agreements/:id` - Update vendor agreement
- `DELETE /api/vendor-agreements/:id` - Delete vendor agreement

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `GET /api/invoices/matter/:matterId` - Get invoices for a specific matter
- `GET /api/invoices/status-options` - Get available invoice status options
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Contract Reviews
- `GET /api/contract-reviews` - Get all contract reviews
- `GET /api/contract-reviews/:id` - Get contract review by ID
- `POST /api/contract-reviews` - Create new contract review
- `PUT /api/contract-reviews/:id` - Update contract review
- `DELETE /api/contract-reviews/:id` - Delete contract review

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
- **Organization**: Companies and entities that people are affiliated with
- **Client**: Law firm clients with unique 7-digit numbers
- **Matter**: Legal matters with unique 6-digit numbers
- **Estimate**: Vendor cost estimates for matters
- **VendorAgreement**: Vendor contracts and agreements for matters
- **Invoice**: Vendor invoices for matters with approval and status tracking
- **ContractReview**: Contract review projects and document batches for matters
- **Task**: Work items with priorities, due dates, and status tracking
- **User**: User accounts with optional person linking for personalized views
- **MatterPerson**: Junction table for many-to-many matter-person relationships

### Relationships
- Client → Matter (one-to-many)
- Client → Person (optional attorney/paralegal assignments)
- Organization → Person (one-to-many, people belong to organizations)
- Matter → Person (many-to-many via MatterPerson junction table)
- Matter → Task (one-to-many, optional)
- Matter → Estimate (one-to-many)
- Matter → VendorAgreement (one-to-many)
- Matter → Invoice (one-to-many)
- Matter → ContractReview (one-to-many)
- Organization → Estimate (one-to-many, vendors provide estimates)
- Organization → VendorAgreement (one-to-many, vendors provide agreements)
- Organization → Invoice (one-to-many, vendors provide invoices)
- Organization → ContractReview (one-to-many, vendor organizations for reviews)
- Estimate → VendorAgreement (one-to-many, optional linking)
- Estimate → Invoice (one-to-many, optional linking)
- Estimate → ContractReview (many-to-many, linking estimates to reviews)
- VendorAgreement → ContractReview (many-to-many, linking agreements to reviews)
- Invoice → ContractReview (many-to-many, linking invoices to reviews)
- Person → Task (one-to-many as owner, many-to-many as assignees)
- Person → ContractReview (one-to-many as review manager)
- User → Person (optional one-to-one for personalized filtering)
- Workspace → ContractReview (one-to-many, workspaces host reviews)

## Features in Detail

### Auto-Linking
When a person is assigned to a matter, they are automatically linked to the client:
- Attorneys assigned to matters become client attorneys (if none assigned)
- Paralegals assigned to matters become client paralegals (if none assigned)
- Project managers assigned to matters become client project managers (if none assigned)

### Team Management
- **Matter Detail**: "Manage Team" button opens modal to assign/remove people
- **Person Detail**: "Manage Matters" button opens modal to assign/remove matters
- Real-time updates with proper relationship management

### Matter Status Management
- **Workflow Stages**: Track matters through five defined stages:
  - **Collection**: Initial data gathering phase
  - **Culling**: Data reduction and filtering phase
  - **Review**: Document review and analysis phase
  - **Production**: Final production and delivery phase
  - **Inactive**: Matters that are paused or completed
- **Visual Status Indicators**: Color-coded badges for quick status identification
- **Dashboard Analytics**: Matter status breakdown showing distribution across all workflow stages
- **Status Filtering**: Easy identification of matters in each workflow stage
- **Kanban Board**: Interactive drag-and-drop board for visual matter management
  - **Drag and Drop**: Move matters between status columns to update their workflow stage
  - **User-Specific View**: Shows only matters assigned to the current user
  - **Real-Time Updates**: Status changes are immediately saved to the database
  - **Visual Status Columns**: Color-coded columns for each workflow stage
  - **Matter Cards**: Compact cards showing matter details, client info, and team members

### Task Management
- **Task Creation**: Create tasks with title, description, priority, due date, and status
- **Task Assignment**: Assign task owners (required) and additional assignees (optional)
- **Matter Integration**: Link tasks to specific matters for project organization
- **Priority Levels**: URGENT, HIGH, MEDIUM, LOW with color-coded indicators
- **Status Tracking**: TODO, IN_PROGRESS, COMPLETED, ON_HOLD
- **Due Date Tracking**: Visual indicators for overdue tasks
- **Task Organization**: Tasks page organized into four sections:
  - **Tasks Past Due**: Overdue tasks highlighted with red background and urgent styling
  - **Tasks Due Today**: Tasks due today with red border and high priority styling
  - **Tasks Due Tomorrow**: Tasks due tomorrow with orange border and medium priority styling
  - **Tasks Due Later**: Future tasks with gray border and standard styling
- **Task Detail Pages**: Comprehensive view with team information and timeline
- **User-Specific Views**: Tasks page and matter task sections show only current user's tasks
- **Auto-Assignment**: New tasks automatically assigned to current user

### User Management
- **User Accounts**: Create user accounts with email and personal information (username auto-generated)
- **Person Linking**: Optional linking of users to existing Person records
- **Personalized Dashboards**: When a user is linked to a person, see only relevant tasks, clients, and matters
- **Current User System**: First user in database acts as current user (placeholder for authentication)
- **Smart Filtering**: Dashboard shows clients where user is attorney/paralegal/project manager, matters where user is assigned, and user's tasks
- **User-Specific Views**: All sections show "My [Items]" vs "Total [Items]" based on user context
- **Auto-Generated Usernames**: Usernames are automatically created from email (before @) or first/last name

### Navigation
- Clickable entity names throughout the application
- Detail pages with edit and delete functionality
- Breadcrumb navigation and intuitive linking

## Local Network Hosting

### Quick Setup for Local Network Access

To host this application on your local network so other devices can access it:

1. **Find your local IP address:**
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   # Look for "inet" address (e.g., 192.168.1.100)
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

3. **Configure network access:**
   - Frontend will be available at: `http://YOUR_IP:3000`
   - Backend API at: `http://YOUR_IP:5001`
   - Example: `http://192.168.1.100:3000`

4. **Allow firewall access (if prompted):**
   - Windows: Allow Node.js through Windows Firewall
   - Mac: System Preferences → Security & Privacy → Firewall → Allow incoming connections

5. **Access from other devices:**
   - Connect devices to the same WiFi network
   - Open browser and navigate to `http://YOUR_IP:3000`
   - Replace `YOUR_IP` with your actual IP address

### Notes:
- Devices must be on the same network (WiFi/LAN)
- The hosting computer must remain on and running the application
- For permanent hosting, consider using a dedicated server or cloud deployment

## Development

### Automated Production Deployment
**NEW**: The application now includes automated production deployment that handles database schema synchronization without manual intervention.

#### Build System Features:
- ✅ **Environment Detection**: Automatically detects production environments (Render, Vercel, Heroku)
- ✅ **Safe Database Migrations**: Uses `prisma migrate deploy` to preserve existing data
- ✅ **Automatic Prisma Client Generation**: Ensures schema compatibility
- ✅ **Zero Manual Setup**: No shell access required in production
- ✅ **Error Recovery**: Graceful fallbacks if database operations fail
- ✅ **Memory Optimization**: Special build process for memory-constrained environments

#### Deployment Commands:
```bash
# Standard deployment
Build Command: npm run build
Start Command: npm start

# For memory-constrained environments (Render)
Build Command: npm run build:render
Start Command: npm start

# Minimal deployment (fallback)
Build Command: npm run build:minimal
Start Command: npm start
```

#### Render Deployment Notes:
- **Memory Optimization**: Use `npm run build:render` for Render's 8GB memory limit
- **Build Settings**: Optimized for Render's build environment with aggressive memory management
- **Fallback Options**: Multiple build strategies available if memory issues persist

### Database Safety in Production
**CRITICAL**: The application includes built-in safeguards to protect production data:
- ✅ **Safe Migrations**: Uses `prisma migrate deploy` which preserves existing data
- ✅ **No Force Reset**: Never uses `--force-reset` flags in production
- ✅ **Existing Database Detection**: Checks for existing data before schema operations
- ✅ **Backup-Friendly**: Compatible with standard PostgreSQL backup/restore procedures
- ✅ **Automated Setup**: Handles database synchronization during deployment

### Database Changes
When modifying the Prisma schema:
```bash
cd server
npx prisma migrate dev --name "description-of-change"
```

**Production Deployment**: Schema changes are automatically applied safely during deployment without data loss.

### Adding New Features
1. Update database schema if needed (Prisma)
2. Add/modify API endpoints (Express controllers/routes)
3. Create/update React components
4. Add navigation and linking

## License

This project is for internal use by law firm ediscovery and litigation support teams.