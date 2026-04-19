# Fatihbaba E-Commerce

CENG 495 – Cloud Computing | Take Home Exam 1

---

## Deployment URL

**[https:///ecommerce-nextjs-eight-sigma.vercel.app](https://ecommerce-nextjs-eight-sigma.vercel.app/)**


---

## Project Overview

A simple e-commerce web application where users can browse items, leave ratings and reviews, and manage their profile. Admins can add/remove items and users through a dashboard. The app is deployed on Vercel and uses MongoDB Atlas as the database.

Items are organized into five categories:

- Vinyls
- Antique Furniture
- GPS Sport Watches
- Running Shoes
- Camping Tents

---

## Login Information

### Admin User

| Field    | Value   |
|----------|---------|
| Username | `admin` |
| Password | `admin` |

### Regular Users

| Username    | Password    |
|-------------|-------------|
| `alan_wake` | `alan_wake` |
| `max_payne` | `max_payne` |

---

## How to Use the Application

### Browsing (no login required)

- The homepage is public. You can browse all items and filter by category without logging in.
- Click on any item card to see its detail page, including description, price, seller, condition, and reviews.

### Logging In / Registering

- Click the **Login** button in the top-right header.
- Enter your username and password, then click **Login**.
- To create a new account, click **Create an account** on the login page and fill in a username, password, and email.
- After logging in, the header shows your username, role, and navigation options.

### Regular User Capabilities

- **Rate and review items:** On any item's detail page, use the **Add Review** form to submit a rating (1–5) and optional review text.
- **Update your review:** Your own review appears at the top of the reviews list with an **Update** button. Clicking it opens an inline form. Updated review text is appended to the original with an `Edit:` prefix.
- **My Profile:** Shows your username, average rating you have given across all items, and all reviews you have written.

### Admin Capabilities

- Admins are redirected to the **Admin Dashboard** via the header link.
- **Manage Users tab:** View all registered users, add a new user (with username, password, email, and role), or delete an existing user. Deleting a user also removes their reviews from all affected items.
- **Manage Items tab:** View all items, add a new item (filling in required fields and category-specific optional fields), or delete an item. Deleting an item also removes it from all affected users' review histories.

### Logging Out

- Click **Logout** in the header. You are immediately returned to the unauthenticated state.

---

## Design Choices

### Language and Framework

I used **Next.js** with TypeScript. The main reason was that I wanted to handle both the frontend and backend in a single project using one language (JavaScript/TypeScript), without needing a separate backend server. Next.js App Router makes this convenient — API routes and server components live in the same codebase and deploy to the same Vercel project. I also preferred using a more modern framework over older options.

### Database

**MongoDB Atlas** was used as the database-as-a-service. The application uses two collections:

- `items` — stores product data including name, price, category, condition, seller, image URL, reviews, and aggregate rating fields.
- `users` — stores user credentials, role, and the user's own review history.

MongoDB's flexible schema was useful here because different item categories have different optional fields (e.g. `batteryLife` for GPS watches, `age` for antique furniture and vinyls). Rather than using separate collections per category, all items share one collection and just omit fields that don't apply.

### Authentication

Authentication is handled with a simple session cookie. On login or register, the server sets an `httpOnly` cookie containing `{ username, role }` as JSON. Protected pages and API routes read this cookie server-side. There is no third-party auth library.

---

## Architecture

The application follows a standard Next.js App Router structure:

- **Server Components** handle data fetching directly from MongoDB (homepage, item detail page, user profile, admin dashboard). No internal HTTP calls are made — the database is queried directly in the server component.
- **Client Components** handle interactive UI: category filtering, the login/register form, review submission, and the admin add/delete forms.
- **API Routes** under `app/api/` handle mutations: login, logout, register, review submission, and admin CRUD for users and items.

**Review consistency:** Reviews are stored in both `items.reviews` (used for display on item pages and rating calculation) and `users.reviews` (used for the user profile page). Both are updated together on every create/update operation. Item aggregate fields (`rating`, `numRatings`) are recalculated from the review array on every write.

---

## Notes

- Passwords are stored in plain text as this is an academic exercise, not a production application.
- The database name used is `Fatihbaba`.
- Image URLs for items are stored as plain strings (links to external images). No file upload functionality is implemented.
- The app has been seeded with at least 8 items across all five categories and 3 users, each with ratings and reviews on items.
