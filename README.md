# SkillNest - Alberta's Community for Trades & Maker Skills

**Connect with local experts who have the tools, space, and know-how.** Whether you're a DIY beginner or a seasoned tinkerer, SkillNest helps you learn, build, and create — together.

## What is SkillNest?

SkillNest bridges Alberta's growing skills gap by connecting learners with local hosts who have expertise, tools, and space to share. From woodworking and auto repair to 3D printing and home maintenance, our community-driven platform makes practical skills accessible to everyone.

### For Learners
- **Browse workshops** by skill category with advanced filtering and search
- **Search** for specific workshops, skills, or hosts by location and availability
- **Book sessions** with experienced local hosts through an intuitive booking system
- **Learn hands-on** in supervised, practical environments with safety guidelines
- **Track progress** through personal dashboard with booking history
- **Rate and review** hosts and workshops to build community trust
- **Get certified** - Earn blockchain-verified credentials *(Coming Soon)*

### For Hosts
- **Share your expertise** and tools with the community through detailed profiles
- **Set your own schedule** and pricing with flexible booking management
- **Earn income** while building community connections and reputation
- **Choose your format**: teach workshops, rent tools, offer consultations, or any combination
- **Manage bookings** through comprehensive dashboard with calendar integration
- **Track earnings** and workshop analytics to optimize your offerings
- **Build reputation** through learner reviews and ratings

## Key Routes & Features

| Route | Purpose |
|-------|---------|
| `/` | **Landing page** - Learn about SkillNest's mission and impact |
| `/about` | **Our story** - Mission, values, and community focus |
| `/browse` | **Find workshops** - Browse by skill, search, and book sessions |
| `/how-it-works` | **Process guide** - Simple 3-step explanation |
| `/auth/login` | **Sign in** - Access your account |
| `/auth/sign-up` | **Join the community** - Create your profile |
| `/dashboard/host/*` | **Host management** - Setup, create workshops, settings |
| `/dashboard/learner/*` | **Learning hub** - Your bookings and progress |
| `/workshop/[id]` | **Workshop details** - View and book specific sessions |
| `/host/[id]` | **Host profiles** - Learn about workshop hosts |

## Features

### Core Platform Features
- **Secure Authentication** - Supabase-powered user management with social login
- **Dual User Roles** - Separate experiences for learners and hosts
- **Advanced Search** - Filter workshops by skill, location, date, and availability
- **Smart Booking** - Real-time availability with conflict prevention *(Coming Soon)*
- **Review System** - Build trust through ratings and feedback *(Coming Soon)*
- **Payment Processing** - Secure transactions with earnings tracking *(Coming Soon)*
- **Responsive Design** - Optimized for desktop, tablet, and mobile *(Coming Soon)*
- **Real-time Updates** - Live notifications for booking changes *(Coming Soon)*

### Advanced Features
- **Blockchain Verification** - ProofOfSkill soulbound NFTs for skill verification
- **Analytics Dashboard** - Track earnings, bookings, and performance
- **Tool Management** - Inventory tracking for hosts' equipment *(Planned)*
- **Location Services** - Find workshops near you with map integration *(Planned)*
- **Skill Matching** - AI-powered recommendations *(Planned)*
- **In-app Messaging** - Direct communication between hosts and learners *(Planned)*
- **Learning Resources** - Guides, tutorials, and safety information *(Planned)*

## Workshop Categories

| Category | Description | Examples |
|----------|-------------|----------------|
| **Woodworking** | Furniture making, cabinetry, tool safety | Joinery, finishing, power tools, wood carving |
| **Auto Skills** | Oil changes, brake jobs, car detailing | Engine maintenance, diagnostics, body work |
| **Metalwork & Welding** | MIG welding, sculpture, repairs | Fabrication, blacksmithing, metal art |
| **Crafts & Textiles** | Sewing, leatherwork, upcycling | Pattern making, embroidery, textile art |
| **Digital Fabrication** | 3D printing, laser cutting, CNC | CAD design, prototyping, digital manufacturing |
| **Home Repairs** | Plumbing basics, electrical fixes, drywall | Renovation, maintenance, DIY projects |
| **Other** | Anything else you want to share and teach! | Cooking, gardening, music, languages |

### Workshop Formats
- **Hands-on Teaching** - Instructor-led sessions with guided practice
- **Tool Rental** - Access to specialized equipment with supervision
- **Group Workshops** - Collaborative learning with multiple participants
- **Certification Courses** - Structured programs with skill verification *(Coming Soon)*

## Technical Architecture

### Tech Stack
- **Frontend**: Next.js 15.2.4 with React 19, TypeScript
- **Styling**: Tailwind CSS 4.1.9 with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **Backend**: Supabase (PostgreSQL database, Auth, Real-time subscriptions)
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Server Components & Client Components
- **Icons**: Lucide React
- **Deployment**: Optimized for Docker deployment

### Database Schema

#### Core Tables
- **profiles**: User profiles extending Supabase auth.users
- **host_profiles**: Extended host information with skills, tools, and earnings
- **workshops**: Workshop listings with pricing, dates, and descriptions
- **bookings**: Session bookings between learners and hosts

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/create-workshop` | Create a new workshop |
| POST | `/api/create-booking` | Create a booking for a workshop |
| GET/POST | `/api/proof-of-skill` | Handle proof of skill NFT operations |

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account and project
- Filebase account
- Git

### Development Setup
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd skillnest
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment**:
   ```bash
   cp .example.env .env.local
   ```
   Add your Supabase credentials to `.env.local`.
   ```

4. **Set up database**:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of each script file in order:
     - `scripts/001_create_tables.sql`
     - `scripts/002_add_workshops.sql`
     - Continue with remaining scripts in numerical order

5. **Start development server**:
   ```bash
   pnpm dev
   ```

6. **Open browser**: [http://localhost:3000](http://localhost:3000)

### Project Structure

```
skillnest/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboards
│   ├── host/              # Host-specific pages
│   ├── workshop/          # Workshop detail pages
│   ├── about/             # About page
│   ├── browse/            # Workshop browsing
│   └── how-it-works/      # Process explanation
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (Radix)
│   └── ...               # Feature components
├── lib/                  # Utility libraries
│   ├── supabase/         # Database client setup
│   └── utils.ts          # General utilities
├── scripts/              # Database setup scripts
├── styles/               # Global styles
└── public/               # Static assets
```

### Available Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server (port 4006)
- `pnpm lint` - Run ESLint

## Deployment

### Production Deployment *(Coming Soon)*
The application will be optimized for deployment on Docker with proper containerization and orchestration.

**Current Status**: Development environment only

### Environment Configuration
- **Development**: `.env.local` (not committed)
- **Production**: Vercel environment variables
- **Example**: `.example.env` (committed template)

## Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Follow provided configuration
- **Prettier**: Code formatting enforced
- **Component Structure**: Use functional components with hooks

### Database Changes
- All schema changes must be scripted in `/scripts/`
- Follow naming convention: `XXX_description.sql`
- Test scripts on development database first
- Update this README with any new features or changes

### Testing
- Test all new features across different browsers
- Verify responsive design on mobile and desktop
- Test authentication and authorization flows
- Validate form submissions and error handling

## Roadmap

### Phase 1 (Current) ✅
- Core platform with user authentication
- Basic workshop creation and booking
- Host and learner dashboards
- Blockchain Verification - ProofOfSkill soulbound NFTs with IPFS metadata
- Analytics Dashboard - Track earnings, bookings, and performance

### Phase 2 (Future)
- [ ] **Unit & E2E Testing** - Comprehensive test coverage
- [ ] **UI/UX Fixes** - Minor interface improvements and bug fixes
- [ ] **Mobile App** - React Native companion app
- [ ] **Advanced Analytics** - Detailed insights for hosts
- [ ] **Skill Certification** - Verified credential system
- [ ] **Community Forums** - Discussion and Q&A features
- [ ] **Equipment Sharing** - Tool rental marketplace

### Phase 3 (Long-term)
- [ ] **AI Skill Matching** - Smart recommendations
- [ ] **Virtual Workshops** - Online learning integration
- [ ] **Franchise Tools** - Multi-city expansion
- [ ] **Corporate Training** - B2B partnership features
- [ ] **AR Integration** - Augmented reality tool previews

### Recent Updates
- **v0.1.0** - Initial platform launch with core features
- Enhanced UI/UX with improved booking flow
- Added comprehensive search and filtering
- Implemented real-time notifications
- **Fixed Timezone Handling** - Workshop creation and booking now works seamlessly across all timezones with client-side conversion
- **Blockchain Integration** - Added ProofOfSkill NFT verification system
- **Analytics Dashboard** - Comprehensive tracking for hosts' earnings and performance

## Community Impact

SkillNest is more than just a platform — it's a movement to:
- **Close Alberta's trades gap** by making skills accessible
- **Build stronger communities** through shared knowledge
- **Create circular learning** where everyone teaches and learns
- **Support local makers** with practical, hands-on education
- **Promote sustainability** by maximizing underutilized tools and spaces

### Impact Metrics
- **Skills Accessibility**: Connecting learners with local expertise
- **Economic Opportunity**: Income generation for skilled hosts
- **Community Building**: Fostering connections between neighbors
- **Resource Optimization**: Making better use of existing tools and spaces

*Empowering communities — one tool at a time.*