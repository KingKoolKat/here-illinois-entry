# Attendance Editor

Minimal full-stack attendance editing web app with a React frontend and an Express.js + MongoDB backend. The app lets an instructor add missing attendance, correct an existing class session, and review audit logs for every successful change.

## Project structure

```text
attendance-editor/
  client/
  server/
```

## Architecture and design choices

- Backend uses an MVC-style structure with separate `models`, `controllers`, `services`, and `routes`.
- `attendanceService` owns validation and business rules so controllers stay thin.
- `loggingService` is reusable and centralizes creation of audit records.
- `Log` documents store `before` and `after` snapshots for edits, which makes the system easy to explain in an interview and useful for accountability.
- Attendance records are unique by the `(uin, classId)` pair, so one student can have many records across different class sessions.
- The frontend is intentionally minimal: one route for adding/searching/editing attendance and one route for viewing logs.

## Backend setup

1. Install dependencies:

   ```bash
   cd server
   npm install
   ```

2. Create an environment file:

   ```bash
   cp .env.example .env
   ```

3. Update `MONGODB_URI` if you are not using a local MongoDB instance.

## Frontend setup

1. Install dependencies:

   ```bash
   cd client
   npm install
   ```

2. Create an environment file:

   ```bash
   cp .env.example .env
   ```

3. Update `VITE_API_BASE_URL` if the backend is running somewhere other than `http://localhost:5001`.

## Run the app

### Start the backend

```bash
cd server
npm run dev
```

The Express server runs on `http://localhost:5001` by default.

### Start the frontend

```bash
cd client
npm run dev
```

The Vite development server runs on `http://localhost:5173`.

## Run tests

### All backend tests

```bash
cd server
npm test
```

### Unit tests only

```bash
cd server
npm run test:unit
```

### Functional tests only

```bash
cd server
npm run test:functional
```

The functional suite uses `mongodb-memory-server` so you do not need a separate MongoDB instance for those tests.

## API documentation

### `POST /attendance`

Creates a new attendance record.

Request body:

```json
{
  "uin": "12345678",
  "classId": "20251001",
  "date": "2025-10-01T14:00:00.000Z",
  "takenBy": "Jack"
}
```

Success:

- `201 Created`

Errors:

- `400 Bad Request` for missing required fields or an invalid date
- `409 Conflict` if an attendance record already exists for the same `(uin, classId)`

### `GET /attendance/search?uin=12345678`

Searches for all attendance records for a single student `uin`.

Success:

- `200 OK`

Errors:

- `400 Bad Request` if `uin` is missing

Notes:

- If no records match the `uin`, the API still returns `200 OK` with `"attendances": []`.

Sample response:

```json
{
  "attendances": [
    {
      "_id": "attendance-id-2",
      "uin": "12345678",
      "classId": "20251004",
      "date": "2025-10-04T09:00:00.000Z",
      "takenBy": "Jack"
    },
    {
      "_id": "attendance-id-1",
      "uin": "12345678",
      "classId": "20251003",
      "date": "2025-10-03T14:45:00.000Z",
      "takenBy": "Jack"
    }
  ]
}
```

### `PUT /attendance/:id`

Fully updates an attendance record after it has been loaded by the UI search flow.

Request body:

```json
{
  "uin": "87654321",
  "classId": "20251001",
  "date": "2025-10-01T14:30:00.000Z",
  "takenBy": "Professor Lee",
  "editedBy": "Jack"
}
```

Success:

- `200 OK`

Errors:

- `400 Bad Request` for missing required fields or an invalid date
- `404 Not Found` if the attendance record id does not exist
- `409 Conflict` if another record already has the same `(uin, classId)`

### `GET /logs`

Returns all attendance logs sorted newest first.

Success:

- `200 OK`

Sample response:

```json
{
  "logs": [
    {
      "_id": "log-id",
      "action": "UPDATE",
      "entityType": "Attendance",
      "actor": "Jack",
      "uin": "87654321",
      "before": {
        "uin": "87654321",
        "classId": "20250931",
        "date": "2025-09-30T14:00:00.000Z",
        "takenBy": "Jack"
      },
      "after": {
        "uin": "87654321",
        "classId": "20251001",
        "date": "2025-09-30T14:00:00.000Z",
        "takenBy": "Jack"
      },
      "message": "Updated attendance record from UIN 87654321 / class 20250931 to UIN 87654321 / class 20251001.",
      "createdAt": "2026-03-30T21:00:00.000Z",
      "updatedAt": "2026-03-30T21:00:00.000Z"
    }
  ]
}
```
