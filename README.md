# BuffaloCare — Multi-Farm Buffalo Management

BuffaloCare is a MERN application for managing multiple farms, buffalo profiles, pregnancy records, vaccinations, medical history and date-based reminders.

**This project does not include seeded users, sample buffaloes, mock records or hardcoded dashboard totals.** A new MongoDB database starts empty. The dashboard shows zero counts and empty states until a signed-in user saves real records through the application.

## Features

- Farmer registration and login using bcrypt password hashing and JWT in an HTTP-only cookie.
- One account can create and manage multiple farms.
- Farm team access for owner, manager and veterinarian roles.
- Farm-level access checks in the API; users cannot query another farm's records without membership.
- Buffalo registration, editing and archiving. Archiving preserves the buffalo's history.
- Pregnancy records with a server-calculated estimated delivery date.
- Vaccination entries with administration date, batch number, veterinarian and optional next due date.
- Medical visit records with diagnosis, treatment and follow-up date.
- Dashboard totals, recent activity and reminders calculated from MongoDB records.
- Responsive React UI with search, create and edit forms.

## Requirements

- Node.js 20.19+ or 22.12+ recommended for the current Vite toolchain.
- npm.
- MongoDB running locally or a MongoDB Atlas connection string.

Check versions:

```bash
node --version
npm --version
```

Vite's current getting-started guide lists its Node.js compatibility requirements: https://vite.dev/guide/.

## 1. Configure MongoDB and the backend

Open a terminal in the project folder:

```bash
cd buffalocare/backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/buffalocare
CLIENT_URL=http://localhost:5173
JWT_SECRET=put_a_long_random_secret_here_at_least_32_characters
JWT_EXPIRES_IN=7d
COOKIE_NAME=buffalocare_token
ADMIN_SETUP_KEY=put_a_different_long_random_setup_key_here
```

Use your real MongoDB Atlas connection string for `MONGO_URI` if you are not using local MongoDB. Do not commit `.env` or share its secrets.

Install and run the backend:

```bash
npm install
npm run dev
```

You should see a MongoDB connection message and `BuffaloCare API running at http://localhost:5000`.

Check the API in a browser:

```text
http://localhost:5000/api/health
```

Expected health response:

```json
{"success":true,"message":"BuffaloCare API is running."}
```

## 2. Configure and run the frontend

Open a second terminal:

```bash
cd buffalocare/frontend
cp .env.example .env
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

The frontend uses `VITE_API_URL` from `frontend/.env`. For local development it should be `http://localhost:5000/api`.

## 3. Create your account and first farm

1. Open the frontend URL.
2. Select **Create an account**.
3. Enter your name, email, password and first farm name.
4. BuffaloCare creates the user and the first farm in MongoDB. Your role on that farm is `owner`.
5. Add buffaloes, then add pregnancy, vaccination and medical records from the relevant pages.

All records are saved through the Express API. The browser does not generate fake dashboard entries.

## 4. Add another farmer, manager or veterinarian to a farm

The person must first register their own BuffaloCare account. The farm owner can then open **My Farms**, choose a farm, and add the person's registered email address as a `manager` or `vet`.

Roles:

| Role | Access |
|---|---|
| Owner | Manage farm details, team membership and farm records |
| Manager | Maintain buffalo, pregnancy, vaccination and medical records |
| Veterinarian | View farm records and add or update pregnancy, vaccination and medical information |
| Superadmin | Platform-level access to all farms |

The backend validates farm membership and role permissions on every farm-specific API request. Hiding a menu item in the frontend is not used as the security boundary.

## 5. Optional: create the first platform administrator

This step is optional. A normal farmer account can use the entire farm-management workflow without a platform administrator.

Set `ADMIN_SETUP_KEY` in `backend/.env`, then make this one-time request with your chosen values. Replace the example strings before running it:

```bash
curl -X POST http://localhost:5000/api/auth/bootstrap-admin \
  -H "Content-Type: application/json" \
  -H "x-admin-setup-key: YOUR_ADMIN_SETUP_KEY" \
  -d '{"name":"Platform Admin","email":"admin@example.com","password":"a-long-unique-password-at-least-12"}'
```

The endpoint refuses to create another superadmin after one already exists. Remove or rotate `ADMIN_SETUP_KEY` after setup.

## API overview

All routes are prefixed with `/api`. Except for health and auth register/login/bootstrap, the routes require a logged-in user.

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | API health check |
| POST | `/auth/register` | Create user and first farm |
| POST | `/auth/login` | Sign in |
| POST | `/auth/logout` | Clear login cookie |
| GET | `/auth/me` | Current user |
| GET / POST | `/farms` | List accessible farms / create farm |
| GET / PATCH / DELETE | `/farms/:farmId` | Read, update or delete a farm (delete is permanent) |
| POST / DELETE | `/farms/:farmId/members` | Add a registered member / remove a member |
| GET / POST | `/buffaloes` | List or create buffaloes (`farmId` query/body) |
| PATCH / DELETE | `/buffaloes/:id` | Update or archive a buffalo |
| GET / POST | `/pregnancies` | List or create pregnancy records |
| PATCH / DELETE | `/pregnancies/:id` | Update or delete a pregnancy record |
| GET / POST | `/vaccinations` | List or create vaccination records |
| PATCH / DELETE | `/vaccinations/:id` | Update or delete a vaccination record |
| GET / POST | `/medical-records` | List or create medical records |
| PATCH / DELETE | `/medical-records/:id` | Update or delete a medical record |
| GET | `/dashboard?farmId=...` | Live farm totals and recent activity |
| GET | `/reminders?farmId=...` | Due vaccination and expected delivery reminders |

## Pregnancy date calculation and animal-health note

When a pregnancy record is saved, the backend calculates `expectedDeliveryDate` from `inseminationDate + gestationDays`. The form's default gestation estimate is 310 days and can be changed. This is only an estimate; it is not confirmation of pregnancy or a veterinary prediction. A veterinarian should confirm pregnancy and advise on monitoring.

Vaccination names and due dates are entered by the farmer or veterinarian. BuffaloCare intentionally does not pre-fill a vaccine schedule or decide which vaccine is appropriate for a pregnant animal. Vaccine selection, dose and timing must be confirmed by a qualified veterinarian and local animal-health guidance.

## Important production steps before public deployment

This is a development starter, not a production-audited veterinary or farm SaaS product. Before public deployment:

- Use HTTPS and secure cookies; set `NODE_ENV=production`.
- Use a strong private `JWT_SECRET`, restrict allowed origins and rotate secrets.
- Add email verification, password reset, audit logs, backup/restore and data export.
- Add pagination and rate limits to data-heavy endpoints.
- Review legal/privacy requirements for farmer and animal records.
- Test role permissions and data isolation with separate accounts and farms.
- Add notification delivery (email/SMS/WhatsApp) if actual reminders need to reach users outside the app.
- Have a veterinarian review any clinical schedule or health workflow before operational use.

## Project structure

```text
buffalocare/
├── backend/
│   ├── src/
│   │   ├── config/       # MongoDB connection
│   │   ├── middleware/   # JWT authentication and farm authorization
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # REST API routes
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── api.js
│   │   └── styles.css
│   └── .env.example
└── README.md
```
# CARE
