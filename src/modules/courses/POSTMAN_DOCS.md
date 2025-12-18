# Courses Module Postman Collection

This directory contains the Postman collection for the `Courses` module.

## Import into Postman

1.  Open Postman.
2.  Click on the **Import** button in the top left corner.
3.  Select **File** or **Folder**.
4.  Navigate to `src/docs/postman/Courses.postman_collection.json` in your project directory.
5.  Click **Import**.

## Environment Setup

The collection uses the following environment variables. Make sure your Postman environment (e.g., `WarmSpa.postman_environment.json`) has these variables set:

*   `baseUrl`: The URL of your API (e.g., `http://localhost:3000`).
*   `token`: A valid JWT token for authentication (Admin/SAdmin role required for most endpoints).
*   `branchId`: ID of a branch (used for creating courses).
*   `userId`: ID of a user (used for fetching user courses).
*   `courseId`: ID of a course (used for update/delete).

## Endpoints Included

*   **Create Course for User**: `POST /api/v1/courses/create-course-for-user`
*   **Get All Courses**: `GET /api/v1/courses/get-all-courses`
*   **Get User Courses by User ID**: `GET /api/v1/courses/get-user-course-by-id/:id`
*   **Update Course Quantity**: `PATCH /api/v1/courses/update-quantity/:id`
*   **Search User for Courses**: `GET /api/v1/courses/search-user-for-courses`
*   **Delete Course**: `DELETE /api/v1/courses/delete-course/:id`

## Note

Ensure that the `courses` router is registered in your application (e.g., in `src/app.controller.js` or `src/bootstrap.js`) for these endpoints to be accessible.
Example registration:
```javascript
import coursesRouter from "./modules/courses/courses.controller.js";
// ...
app.use('/api/v1/courses', coursesRouter);
```
