# FixFlow Learning Phases — Progress Checklist

## Current progress

- **Completed in sequence:** Phase 1 — Build responsive and interactive UIs using Tailwind CSS.
- **Active phase:** Phase 2 — Experiment based on React Hooks.
- **Next eligible phase:** Phase 2 only. Finish every unchecked Phase 2 item before beginning Phase 3.
- **Repository snapshot:** Existing code for Redux, MongoDB/Mongoose, APIs, and authentication is noted in later phases. Those checkmarks record code already found; they do not mean those phases were started in sequence or are approved as complete.
- **Validation:** Frontend production build and ESLint both pass. No API/Postman, browser, or deployment validation was performed for this checklist.

**Progress rule:** Work on one phase at a time. Tick a phase heading only when all ten items are complete and the preceding phase is complete. Do not start the next phase early. Later-phase evidence can remain checked as an inventory of the current repository, but keep its phase heading unticked until it becomes eligible and is completed in order.

## [x] Phase 1 — Build responsive and interactive UIs using Tailwind CSS

- [x] 1. Add Tailwind CSS and its Vite integration.
- [x] 2. Load Tailwind styles in the frontend entry styles.
- [x] 3. Build a dashboard shell styled with Tailwind utility classes.
- [x] 4. Provide desktop sidebar and small-screen navigation layouts.
- [x] 5. Add dashboard statistics and request summaries.
- [x] 6. Add interactive navigation between dashboard, requests, analytics, notifications, profile, and settings.
- [x] 7. Add a request form with controlled inputs and submit/close actions.
- [x] 8. Add request search, status filtering, status updates, and delete actions.
- [x] 9. Add notification, loading, and error feedback interactions.
- [x] 10. Verify the frontend production build and lint.

**Evidence:** [frontend/package.json](./frontend/package.json), [frontend/src/index.css](./frontend/src/index.css), [frontend/src/App.jsx](./frontend/src/App.jsx), [frontend/src/App.css](./frontend/src/App.css), [frontend/src/AuthPage.jsx](./frontend/src/AuthPage.jsx). `npm run build` and `npm run lint` pass in `frontend`.

## [ ] Phase 2 — Experiment based on React Hooks (useEffect, useContext, custom hooks)

- [x] 1. Use `useState` with controlled form inputs.
- [x] 2. Use `useEffect` to restore the signed-in user and load their requests.
- [x] 3. Clean up the effect so stale async results do not update state after unmount.
- [x] 4. Declare the effect dependencies used for session loading.
- [ ] 5. Create a Context with `createContext`.
- [ ] 6. Provide and consume shared state with `useContext`.
- [ ] 7. Extract repeated API/session behavior into a custom hook.
- [ ] 8. Reuse the custom hook from more than one component.
- [ ] 9. Handle loading and error states through the extracted hook.
- [ ] 10. Validate the hook behavior with focused tests or a documented manual exercise.

**Status:** In progress. The app uses `useState` and `useEffect`, but no `useContext` or custom hooks were found. **Do not start Phase 3 until all ten items are complete.**

**Evidence:** [frontend/src/App.jsx](./frontend/src/App.jsx), [frontend/src/AuthPage.jsx](./frontend/src/AuthPage.jsx).

## [ ] Phase 3 — Manage complex state with Redux or Context API

- [x] 1. Add a Redux Toolkit store.
- [x] 2. Connect the React tree to the store with `Provider`.
- [x] 3. Create a request slice with initial state.
- [x] 4. Add actions for loading, adding, updating, and deleting requests.
- [x] 5. Read request state with `useSelector`.
- [x] 6. Dispatch state changes from the UI.
- [ ] 7. Document which data belongs in Redux versus local component state.
- [ ] 8. Add pending/error handling for async state changes.
- [ ] 9. Add focused tests for reducers and store behavior.
- [ ] 10. Verify state behavior through the app after completing Phase 2.

**Repository evidence:** Redux Toolkit state management is already wired up, but the phase is gated by unfinished Phase 2 work.

**Evidence:** [frontend/src/redux/store.js](./frontend/src/redux/store.js), [frontend/src/redux/requestSlice.js](./frontend/src/redux/requestSlice.js), [frontend/src/main.jsx](./frontend/src/main.jsx), [frontend/src/App.jsx](./frontend/src/App.jsx).

## [ ] Phase 4 — REST API Design with MongoDB + Mongoose Integration

- [x] 1. Define Mongoose models for users and requests.
- [x] 2. Connect the Express application to MongoDB through Mongoose.
- [x] 3. Add a route to list the signed-in user's requests.
- [x] 4. Add a route to create a request.
- [x] 5. Add a route to update a request's status.
- [x] 6. Add a route to delete a request.
- [x] 7. Validate request fields and allowed category, priority, and status values.
- [ ] 8. Define and document consistent API response and error contracts.
- [ ] 9. Add API tests for success cases, invalid input, and missing records.
- [ ] 10. Verify persistence and route behavior against a test MongoDB instance.

**Repository evidence:** Express routes, Mongoose models, and database connection logic are present. Automated API/database verification was not found or run.

**Evidence:** [backend/server.js](./backend/server.js), [backend/routes/requestRoutes.js](./backend/routes/requestRoutes.js), [backend/models/request.js](./backend/models/request.js), [backend/models/user.js](./backend/models/user.js).

## [ ] Phase 5 — Create secure, production-ready RESTful APIs

- [x] 1. Require authentication on protected request routes.
- [x] 2. Hash passwords with a per-password random salt.
- [x] 3. Validate core request and authentication inputs.
- [x] 4. Restrict request reads and mutations to the owning user.
- [x] 5. Avoid returning password hashes in the public user response.
- [x] 6. Return generic server errors rather than exposing exception details to clients.
- [ ] 7. Restrict CORS to explicitly configured trusted origins.
- [ ] 8. Add rate limiting and abuse protection to authentication endpoints.
- [ ] 9. Add production security headers and review configuration/secrets handling.
- [ ] 10. Add and run security-focused API tests before calling the API production-ready.

**Status:** Partially implemented. Important security basics exist, but production hardening and security verification remain. Do not treat this phase as complete.

**Evidence:** [backend/middleware/requireAuth.js](./backend/middleware/requireAuth.js), [backend/routes/authRoutes.js](./backend/routes/authRoutes.js), [backend/routes/requestRoutes.js](./backend/routes/requestRoutes.js), [backend/server.js](./backend/server.js).

## [ ] Phase 6 — Implement authentication and user roles with JWT

- [x] 1. Implement account signup.
- [x] 2. Implement password verification and login.
- [x] 3. Implement authenticated current-user and profile routes.
- [x] 4. Implement logout and server-side session revocation.
- [x] 5. Expire stored sessions after a configured duration.
- [ ] 6. Implement JWT issuance and signature verification.
- [ ] 7. Add explicit user roles to the user model.
- [ ] 8. Enforce role-based authorization on protected endpoints.
- [ ] 9. Test expired, invalid, and unauthorized role/token scenarios.
- [ ] 10. Document the authentication and role-permission flow.

**Status:** Signup/login and database-backed opaque session tokens exist; **JWT and user roles do not**. Do not describe the current session tokens as JWTs.

**Evidence:** [backend/routes/authRoutes.js](./backend/routes/authRoutes.js), [backend/middleware/requireAuth.js](./backend/middleware/requireAuth.js), [backend/models/user.js](./backend/models/user.js).

## [ ] Phase 7 — Validating RESTful APIs using Postman

- [ ] 1. Create a Postman collection for authentication endpoints.
- [ ] 2. Create requests for request listing and creation.
- [ ] 3. Create requests for status updates and deletion.
- [ ] 4. Configure a local environment for the API base URL.
- [ ] 5. Configure a test environment without storing real credentials.
- [ ] 6. Capture and reuse an authentication token in collection requests.
- [ ] 7. Add positive response-status and response-body assertions.
- [ ] 8. Add invalid-input and unauthenticated-request checks.
- [ ] 9. Add not-found and ownership-isolation checks.
- [ ] 10. Run the collection and record the result.

**Status:** No Postman collection or API test artifacts were found.

## [ ] Phase 8 — Enable real-time communication via WebSockets

- [ ] 1. Select and document a WebSocket library and message protocol.
- [ ] 2. Add a WebSocket server and lifecycle handling.
- [ ] 3. Authenticate WebSocket connections.
- [ ] 4. Define real-time event names and payloads.
- [ ] 5. Broadcast request changes to authorized clients.
- [ ] 6. Connect the frontend WebSocket client.
- [ ] 7. Update the UI when real-time events arrive.
- [ ] 8. Handle disconnects, reconnections, and stale connections.
- [ ] 9. Test event delivery and access control.
- [ ] 10. Document how to run and verify the real-time feature.

**Status:** No WebSocket implementation or dependency was found.

## [ ] Phase 9 — CI/CD Deployment with GitHub Actions + Render/Vercel

- [ ] 1. Choose the GitHub Actions workflow triggers and deployment branches.
- [ ] 2. Add a GitHub Actions workflow.
- [ ] 3. Run frontend lint and build in CI.
- [ ] 4. Add backend checks to CI.
- [ ] 5. Store deployment credentials in CI secrets.
- [ ] 6. Configure the backend deployment to Render.
- [ ] 7. Configure the frontend deployment to Vercel.
- [ ] 8. Configure environment variables and API URLs for deployed environments.
- [ ] 9. Add deployment health checks or smoke tests.
- [ ] 10. Verify and document a successful CI/CD deployment.

**Status:** The repository has Netlify build/function configuration, but no GitHub Actions workflow, Render configuration, or Vercel configuration was found. The requested CI/CD deployment phase remains incomplete.

**Evidence:** [netlify.toml](./netlify.toml), [backend/netlify/functions/api.js](./backend/netlify/functions/api.js).

## [ ] Phase 10 — Deploy full-stack apps using DevOps tools and Docker

- [ ] 1. Choose and document the container deployment target.
- [ ] 2. Add a frontend Dockerfile.
- [ ] 3. Add a backend Dockerfile.
- [ ] 4. Add a Docker Compose configuration for local full-stack development.
- [ ] 5. Configure container environment variables without hardcoding secrets.
- [ ] 6. Add health checks and sensible runtime defaults.
- [ ] 7. Run the app locally from containers.
- [ ] 8. Build and tag production images.
- [ ] 9. Publish images to a container registry.
- [ ] 10. Deploy the containerized app and verify its health.

**Status:** No Dockerfile or Compose configuration was found.

## Next action

Continue Phase 2 only: practice `useState`, add Context, extract and reuse custom hooks, and validate the hook behavior. Once all ten Phase 2 boxes are checked, tick the Phase 2 heading and then begin Phase 3.
