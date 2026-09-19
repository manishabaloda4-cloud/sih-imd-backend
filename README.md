# IMD Training Portal - Backend Setup

## Step 1: Push this to GitHub
```
cd sih-imd-backend
git init
git add .
git commit -m "Initial backend scaffold - user/course/assessment models + auth"
git branch -M main
git remote add origin https://github.com/manishabaloda4-cloud/YOUR-REPO-NAME.git
git push -u origin main
```
(Create the empty repo on GitHub first, then paste its URL above.)

## Step 2: Install dependencies
```
npm install
```

## Step 3: Set up your .env file
```
cp .env.example .env
```
Then fill in:
- `MONGODB_URI` - from your MongoDB Atlas dashboard (Connect > Drivers > copy connection string)
- `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` - from your Clerk dashboard (API Keys page). You can reuse your existing Clerk app or create a new one for this project.

## Step 4: Run it
```
npm run dev
```
Visit `http://localhost:5000/api/health` in your browser. You should see:
```json
{"status":"ok","message":"IMD Training Portal backend running"}
```
If you see that, your backend is live.

## What's built so far
- **User model**: role field (admin/trainer/trainee/coordinator), competencies array (for trainer matching later)
- **Course model**: title, description, content blocks (video/pdf/text), required competencies
- **Assessment model**: MCQ questions tied to a course
- **Enrollment model**: tracks trainee progress + assessment score (this feeds your monitoring dashboard later)
- **Auth**: Clerk handles login; `requireLogin` and `requireRole([...])` middleware protect routes by role
- **Working routes so far**:
  - `GET /api/health` - server check
  - `POST /api/users/sync` - creates user in DB on first login
  - `GET /api/users/me` - get current user's profile/role
  - `GET /api/courses` - list all courses
  - `GET /api/courses/:id` - single course
  - `POST /api/courses` - create course (admin/trainer only)
  - `PUT /api/courses/:id` - update course (admin/trainer only)
  - `DELETE /api/courses/:id` - delete course (admin only)
