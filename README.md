# BJS Prep

BJS Prep is a Next.js-based learning and preparation platform built for students preparing for Bangladesh Judicial Service exams and related academic progression. The product combines public marketing pages, course discovery, learner dashboards, admin management, mock exam workflows, payments, notices, and content publishing in one system.

## Product overview

BJS Prep is designed to help students:

- discover courses and exam pathways
- register and verify their accounts
- participate in preliminary and written mock exams
- track enrollment and payment status
- read published notices and announcements
- access learning materials and content
- review success stories and mentor profiles
- manage everything through an admin dashboard

The platform is structured around a public-facing website and an authenticated student/admin experience using the Next.js App Router.

## Main features

### Public website

- landing page with featured courses, mentors, success stories, and platform metrics
- About page with mission, approach, comparison, faculty preview, and story highlights
- Courses page with searchable/filterable course listings
- Model tests page for mock exam offerings
- Notices page for public announcements
- Contact page for customer or student messaging
- Success stories page and submission flow
- Mentor profile and listing pages

### Authentication and user accounts

- email-based registration flow
- verification code flow for new users
- login and logout
- password reset and recovery
- role-aware session handling for students and admins
- Google OAuth integration support for social login

### Student dashboard

- user profile management
- enrollment status overview
- course access and educational resources
- active exam resume and locking flow
- preliminary exam flow with answer saving and submit logic
- written exam flow with timer and submission handling
- dashboard statistics and summary blocks

### Admin dashboard

- platform overview with key counts and revenue summary
- student management
- enrollment approval and review
- mentor management and ordering
- mock exam management and question import
- notice publishing and moderation workflow
- payment tracking and manual record updates
- success story moderation
- about page content management

### Content and media

- Cloudinary-based image and PDF upload support
- course materials management
- admin-driven updates for public-facing content
- dynamic About page singleton content
- success story and mentor content management

### Exam system

- active exam lock enforcement to prevent duplicate concurrent attempts
- partial unique indexing for active exams
- exam start/resume flow
- answer save logic for preliminary and written exams
- auto-submit handling and final submission workflow
- exam state tracking for active, completed, and timed-out scenarios

## Tech stack

- Next.js 15
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- MongoDB Atlas / MongoDB driver
- Node.js 20+
- React 19
- Cloudinary
- Nodemailer
- jose
- bcryptjs
- zod
- xlsx
- Recharts
- next-themes

## Project structure

```text
bjs-prep/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── (public)/
│   ├── admin/
│   ├── api/
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── not-found.tsx
├── components/
│   ├── admin/
│   ├── auth/
│   ├── dashboard/
│   ├── sections/
│   ├── theme/
│   └── ui/
├── lib/
│   ├── seed/
│   ├── types/
│   ├── validators/
│   ├── api-response.ts
│   ├── auth-guard.ts
│   ├── auth.ts
│   ├── cloudinary.ts
│   ├── collections.ts
│   ├── db.ts
│   ├── env.ts
│   ├── indexes.ts
│   ├── mailer.ts
│   ├── pagination.ts
│   ├── rate-limit.ts
│   ├── utils.ts
│   └── ...
├── public/
├── .env.example
├── .gitignore
├── .nvmrc
├── middleware.ts
├── next.config.ts
├── package.json
├── README.md
├── tsconfig.json
├── vercel.json
└── package-lock.json
```

## Requirements

- Node.js 20 or newer
- npm
- MongoDB Atlas or a MongoDB-compatible cluster
- Gmail SMTP credentials or another mail provider
- Cloudinary account for media uploads
- Vercel account for deployment

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values before running the app.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `NEXT_PUBLIC_APP_URL` | Yes | App public URL |
| `GMAIL_USER` | Yes | Email sender address |
| `GMAIL_APP_PASSWORD` | Yes | Gmail app password |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Optional | Public Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Optional | Public unsigned upload preset |
| `CLOUDINARY_CLOUD_NAME` | Optional | Server-side Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret |

## Local setup

1. Clone the repository.
2. Open the project folder.
3. Run:

```bash
npm install
```

4. Create a local environment file:

```bash
cp .env.example .env.local
```

5. Fill in your values for MongoDB, JWT, Gmail, and Cloudinary.
6. Start the dev server:

```bash
npm run dev
```

7. Open the app in the browser:

```text
http://localhost:3000
```

## Production build

Before deployment, run:

```bash
npm run build
npm run start
```

This validates that the app builds and runs in production mode.

## Deployment

### Vercel

1. Push the code to GitHub.
2. Import the project into Vercel.
3. Add all environment variables in the Vercel dashboard.
4. Set `NEXT_PUBLIC_APP_URL` to the live Vercel domain.
5. Deploy the project.
6. Confirm the health endpoint responds successfully:

```text
/api/health
```

### Health check

The app exposes a lightweight health endpoint:

```text
GET /api/health
```

It returns JSON with:

- `ok`
- `env`
- `time`
- `dbOk`

## Admin responsibilities

The admin area handles:

- enrollment review
- payment overview
- student records
- mentor content updates
- written and preliminary exam management
- notices and announcements
- success story moderation
- public content management

## Security notes

- secrets are environment-driven and should never be committed
- JWTs are checked server-side
- admin routes require authenticated access
- Cloudinary and SMTP calls are wrapped with timeouts
- route-level validation is enforced with Zod schemas where needed

## Troubleshooting

### Missing environment variables

Check `.env.local` and compare it with `.env.example`.

### MongoDB connection issues

- confirm the Atlas cluster is running
- verify your IP is allowlisted
- confirm the username and password are correct
- ensure the URI points to the right database

### Email delivery problems

- confirm `GMAIL_USER` and `GMAIL_APP_PASSWORD` are correct
- ensure the Gmail app password is valid
- check spam or filtered mail folders

### Cloudinary upload problems

- confirm the cloud name and API key are correct
- verify the upload preset exists
- check the API secret value

### Build failures

Run the local build first:

```bash
npm run build
```

This helps catch issues before deployment.

## Notes

This project is designed to support a production-ready learning platform for BJS exam preparation while keeping the codebase consistent across local development, local production builds, and Vercel deployment.

