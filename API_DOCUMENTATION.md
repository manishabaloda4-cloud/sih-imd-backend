# IMD Training Portal — API Documentation

Base URL (dev): `http://localhost:5000/api`

All responses follow this shape:
```json
{ "success": true, "data": {...}, "message": "..." }
{ "success": false, "message": "...", "error": "..." }
```
Note: `/api/courses` CRUD routes and a few legacy routes predate this format and return raw JSON directly — this will be normalized in a follow-up pass.

Auth: every route except `/api/health` requires a Clerk session token (frontend sends it automatically via Clerk's fetch wrapper / `Authorization` header, depending on your Clerk frontend setup).

---

## Users
| Method | Route | Auth | Role | Body | Notes |
|---|---|---|---|---|---|
| POST | /users/sync | ✅ | any | `{name, email, role?}` | Call once after Clerk login. `role: "trainer"` starts as PENDING |
| GET | /users/me | ✅ | any | - | Own profile |
| PUT | /users/me | ✅ | any | `{name, department, designation, qualifications, experience, skills, interests, region}` | Cannot change own role/status |
| GET | /users/:id | ✅ | any | - | Public profile view |

## Admin
| Method | Route | Role | Notes |
|---|---|---|---|
| GET | /admin/dashboard | admin | Platform-wide stats |
| GET | /admin/users?status=&role= | admin | Filterable user list |
| PUT | /admin/users/:id/approve | admin | Approves a PENDING trainer |
| PUT | /admin/users/:id/reject | admin | Rejects a PENDING trainer |

## Courses
| Method | Route | Role | Notes |
|---|---|---|---|
| GET | /courses | any | List all |
| GET | /courses/:id | any | Detail |
| POST | /courses | trainer (APPROVED) / admin | `{title, description, category, level, duration, requiredCompetencies, region, status}` |
| PUT | /courses/:id | owner trainer / admin | Cannot edit another trainer's course |
| DELETE | /courses/:id | admin | - |

## Modules
| Method | Route | Role | Notes |
|---|---|---|---|
| GET | /courses/:courseId/modules | any | Ordered list |
| POST | /courses/:courseId/modules | owner trainer / admin | `{title, description, order, videoUrl, pdfUrl, pptUrl, textContent}` |
| PUT | /modules/:id | owner trainer / admin | - |
| DELETE | /modules/:id | owner trainer / admin | - |

## Enrollment
| Method | Route | Role | Notes |
|---|---|---|---|
| POST | /courses/:id/enroll | any | Blocks duplicate enrollment |
| GET | /users/me/courses | any | Own enrollments, populated with course |
| GET | /enrollments/:id | any | Single enrollment detail |

## Progress
| Method | Route | Role | Notes |
|---|---|---|---|
| GET | /courses/:id/progress | any | Own progress in a course |
| PUT | /courses/:id/progress | any | `{moduleId}` — backend recalculates %, never trust a client-sent percentage |

## Assessments
| Method | Route | Role | Notes |
|---|---|---|---|
| POST | /assessments | trainer / admin | `{courseId, title, description, duration, deadline, passingScore, questions: [{question, options, correctAnswer, marks, competencyId, difficulty}]}` |
| GET | /assessments/:id | any | Trainees get options only (no correct answers exposed) |
| PUT | /assessments/:id | trainer / admin | - |
| DELETE | /assessments/:id | trainer / admin | - |
| POST | /assessments/:id/submit | any | `{answers: [{questionId, selectedOption}]}` — backend scores it, no score field accepted from client |
| GET | /assessments/:id/results | trainer / admin | All submissions for that assessment |

## Competencies
| Method | Route | Role | Notes |
|---|---|---|---|
| GET | /competencies | any | - |
| POST | /competencies | admin | `{name, description, category, levels}` |
| PUT / DELETE | /competencies/:id | admin | - |
| GET | /users/me/competencies | any | Own measured levels |
| GET | /users/me/skill-gaps | any | `[{competency, score, level, isSkillGap}]` |
| GET | /users/:id/competencies | trainer / admin | View someone else's |

## Trainers
| Method | Route | Role | Notes |
|---|---|---|---|
| GET | /trainers | any | Approved trainers only |
| GET | /trainers/:id | any | - |
| GET | /trainers/:id/expertise | any | Competency levels |
| POST | /trainers/me/expertise | trainer | `{competencyId, level, experience}` |

---

## Not yet built (next pass)
- `GET /api/ai/recommended-trainers` — AI matching endpoint
- Certificates (`/api/certificates`)
- Feedback (`/api/courses/:id/feedback`)
- Leaderboard / badges
- File upload endpoint (Appwrite wiring — `storageService.ts` has the abstraction in place but the actual SDK calls throw "not implemented" until `node-appwrite` is installed and env vars are set)
