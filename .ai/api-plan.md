# REST API Plan

This document outlines the REST API for the SMile application, designed to support the features defined in the Product Requirements Document (PRD) and based on the established database schema.

## 1. Resources

- **Profile**: Represents the user's public profile data.
  - *Database Table*: `users`
- **Weight Records**: Represents the user's daily weight measurements.
  - *Database Table*: `weight_records`
- **Blood Pressure Records**: Represents the user's daily blood pressure and pulse measurements.
  - *Database Table*: `blood_pressure_records`
- **Symptom Records**: Represents the user's neurological symptom records.
  - *Database Table*: `symptom_records`
- **Charts**: A read-only resource providing aggregated and calculated data for frontend visualizations.
  - *Database Tables*: `weight_records`, `blood_pressure_records`, `users`

## 2. Endpoints

---

### 2.1 Profile

#### **GET /api/profile**
- **Description**: Retrieves the profile of the currently authenticated user.
- **Request Body**: None
- **Response Body**:
  ```json
  {
    "id": "c3e4b5a6-3b2a-4c1d-8e7f-9a8b7c6d5e4f",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-01-15",
    "height_cm": 180,
    "created_at": "2023-10-12T10:00:00Z",
    "updated_at": "2023-10-12T11:30:00Z"
  }
  ```
- **Success Code**: `200 OK`
- **Error Codes**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If the user profile does not exist.

#### **PUT /api/profile**
- **Description**: Updates the profile of the currently authenticated user. This is the primary endpoint for completing the initial profile setup.
- **Request Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-01-15",
    "height_cm": 181
  }
  ```
- **Response Body**: The updated profile object (same structure as GET).
- **Success Code**: `200 OK`
- **Error Codes**:
  - `400 Bad Request`: If validation fails (e.g., invalid date format, non-numeric height).
  - `401 Unauthorized`: If the user is not authenticated.

---

### 2.2 Weight Records

#### **GET /api/weight-records**
- **Description**: Retrieves a list of weight records for the authenticated user, with optional date filtering.
- **Query Parameters**:
  - `startDate` (string, optional, format: YYYY-MM-DD): The start of the date range.
  - `endDate` (string, optional, format: YYYY-MM-DD): The end of the date range.
- **Response Body**:
  ```json
  [
    {
      "id": 1,
      "user_id": "c3e4b5a6-3b2a-4c1d-8e7f-9a8b7c6d5e4f",
      "date": "2023-10-12",
      "weight_kg": 75.5,
      "created_at": "2023-10-12T08:00:00Z"
    }
  ]
  ```
- **Success Code**: `200 OK`
- **Error Codes**:
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: User profile is not complete.

#### **POST /api/weight-records**
- **Description**: Creates a new weight record for the authenticated user.
- **Request Body**:
  ```json
  {
    "date": "2023-10-13",
    "weight_kg": 76.0
  }
  ```
- **Response Body**: The newly created weight record object.
- **Success Code**: `201 Created`
- **Error Codes**:
  - `400 Bad Request`: Validation fails (e.g., weight out of 10-199 kg range).
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: User profile is not complete.

#### **PUT /api/weight-records/{id}**
- **Description**: Updates an existing weight record.
- **Request Body**: Same as POST.
- **Response Body**: The updated weight record object.
- **Success Code**: `200 OK`
- **Error Codes**:
  - `400 Bad Request`: Validation fails.
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: User profile is not complete.
  - `404 Not Found`: Record with the given ID does not exist or does not belong to the user.

#### **DELETE /api/weight-records/{id}**
- **Description**: Deletes a weight record.
- **Request Body**: None
- **Response Body**: None
- **Success Code**: `204 No Content`
- **Error Codes**:
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: User profile is not complete.
  - `404 Not Found`: Record with the given ID does not exist or does not belong to the user.

---

### 2.3 Blood Pressure Records

Endpoints for `blood_pressure_records` follow the same CRUD pattern as `weight_records`.

- `GET /api/blood-pressure-records`
- `POST /api/blood-pressure-records`
- `PUT /api/blood-pressure-records/{id}`
- `DELETE /api/blood-pressure-records/{id}`

**Sample Object**:
```json
{
  "id": 1,
  "user_id": "c3e4b5a6-3b2a-4c1d-8e7f-9a8b7c6d5e4f",
  "date": "2023-10-12",
  "systolic": 120,
  "diastolic": 80,
  "pulse": 60,
  "created_at": "2023-10-12T08:05:00Z"
}
```

---

### 2.4 Symptom Records

Endpoints for `symptom_records` follow the same CRUD pattern as `weight_records`.

- `GET /api/symptom-records`
- `POST /api/symptom-records`
- `PUT /api/symptom-records/{id}`
- `DELETE /api/symptom-records/{id}`

**Sample Object**:
```json
{
  "id": 1,
  "user_id": "c3e4b5a6-3b2a-4c1d-8e7f-9a8b7c6d5e4f",
  "date": "2023-10-12",
  "body_part": "LeftHand",
  "pain_type": "Tingle",
  "description": "Fingers feel tingly after waking up.",
  "created_at": "2023-10-12T09:00:00Z"
}
```

---

### 2.5 Charts

#### **GET /api/charts/weight**
- **Description**: Retrieves processed data for the weight chart, including BMI, averages, and moving averages.
- **Query Parameters**:
  - `range` (string, required): The time range for the data. Enum: `week`, `month`, `quarter`, `year`.
- **Response Body**:
  ```json
  {
    "range": "month",
    "average_weight_kg": 75.8,
    "average_bmi": 23.4,
    "data_points": [
      {
        "date": "2023-09-15",
        "weight_kg": 76.0,
        "bmi": 23.5
      }
    ],
    "moving_average": [
      {
        "date": "2023-09-19",
        "value": 75.9
      }
    ]
  }
  ```
- **Success Code**: `200 OK`
- **Error Codes**:
  - `400 Bad Request`: If the `range` parameter is missing or invalid.
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: User profile is not complete.

#### **GET /api/charts/blood-pressure**
- **Description**: Retrieves processed data for the blood pressure chart.
- **Query Parameters**:
  - `range` (string, required): The time range for the data. Enum: `week`, `month`, `quarter`, `year`.
- **Response Body**:
  ```json
  {
    "range": "month",
    "average_systolic": 122,
    "average_diastolic": 81,
    "average_pulse": 65,
    "data_points": [
      {
        "date": "2023-09-15",
        "systolic": 120,
        "diastolic": 80,
        "pulse": 60
      }
    ],
    "moving_average": {
      "systolic": [
        { "date": "2023-09-19", "value": 121 }
      ],
      "diastolic": [
        { "date": "2023-09-19", "value": 80 }
      ]
    }
  }
  ```
- **Success Code**: `200 OK`
- **Error Codes**: Same as weight chart.

## 3. Authentication and Authorization

- **Authentication**: Authentication will be handled using JSON Web Tokens (JWT) provided by Supabase Auth. The client must include the JWT in the `Authorization` header of every request to a protected endpoint (e.g., `Authorization: Bearer <your_jwt>`).
- **Authorization**: Authorization is enforced at the database level using PostgreSQL's Row-Level Security (RLS). Policies are configured to ensure that users can only perform actions (SELECT, INSERT, UPDATE, DELETE) on data that they own (i.e., where `user_id` matches their authenticated `auth.uid()`). This provides a robust security layer, preventing data leaks between users.

## 4. Validation and Business Logic

- **Profile Completion Gate**: A middleware will be applied to all API routes except `/api/profile`. This middleware will check if the authenticated user's profile has the required fields (`first_name`, `last_name`, `date_of_birth`, `height_cm`) filled. If not, it will return a `403 Forbidden` response, effectively blocking access to the app's core features until the profile is completed.
- **Input Validation**:
  - **Weight Records**: `weight_kg` must be a number between 10 and 199.
  - **Blood Pressure Records**: `systolic`, `diastolic`, and `pulse` must be numbers less than 1000.
  - **Symptom Records**: `body_part` and `pain_type` must match one of the predefined enum values.
  - All records require a valid `date`.
- **Server-Side Calculations**:
  - **BMI**: Calculated on the server and included in the response for `GET /api/charts/weight`. The calculation requires the user's `height_cm` from their profile.
  - **Averages & Moving Averages**: All statistical calculations (period average, 5-day moving average) are performed on the server within the `/api/charts/*` endpoints to reduce client-side load and ensure consistency.
