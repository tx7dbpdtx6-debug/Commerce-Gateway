# CelebFanCards

A premium full-stack marketplace where fans browse and purchase digital/physical fan cards for celebrities.

## Architecture

**Monorepo**: TypeScript pnpm workspace  
**Frontend**: React + Vite (`artifacts/celeb-fan-cards/`, port 24446)  
**Backend**: Express 5 API server (`artifacts/api-server/`, port 8080)  
**Database**: PostgreSQL + Drizzle ORM (`lib/db/`)  
**API Types**: Zod schemas (`lib/api-zod/`)  
**API Client**: TanStack Query hooks (`lib/api-client-react/`)

## Fan Card Tiers

| Tier    | Price   | Details                          |
|---------|---------|----------------------------------|
| Basic   | $19.99  | Digital card + collectible badge |
| Premium | $49.99  | HD card + exclusive access       |
| VIP     | $99.99  | Metal physical card + perks      |

## Key Features

- 50 celebrities seeded (actors, musicians, athletes) with Wikimedia Commons photos
- Flutterwave payment integration for secure checkout
- Nodemailer email delivery of fan card image after payment
- Admin dashboard at `/admin` (admin@fanCardHub.com / CelebFan2026!)
- WhatsApp live support button (+1 773-280-1545)
- Contact form saves messages to `contact_messages` DB table
- Trust badges, 8 testimonials, and stats bar on home page

## Database Schema

- `users` — registered fans
- `celebrities` — 50 seeded celebrities
- `orders` — fan card purchases (status: pending/paid/failed)
- `contact_messages` — support form submissions

## Admin

- URL: `/admin`
- Email: `admin@fanCardHub.com`
- Password: `CelebFan2026!`
- Stats, Users, Orders, and Messages tabs

## Contact

- WhatsApp: +1 (773) 280-1545
- Support Email: support@fanCardHub.com

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (required)
- `FLUTTERWAVE_SECRET_KEY` — For payment verification
- `EMAIL_USER` — Gmail address for sending fan card emails (optional)
- `EMAIL_PASS` — Gmail app password (optional)
- `PORT` — Server port

## Workflows

- **API Server**: `PORT=8080 pnpm --filter @workspace/api-server run dev`
- **Start application**: `PORT=24446 BASE_PATH=/ pnpm --filter @workspace/celeb-fan-cards run dev`
