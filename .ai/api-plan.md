# REST API Plan

This document outlines the design for the REST API for the SMile application, based on the product requirements, database schema, and technical stack. The API will be implemented as serverless functions within the Astro framework, interacting with a Supabase backend.

## 1. Resources

The API is built around the following core resources:

-   **User**: Represents the user's profile data. Maps to the `users` table.
-   **Weight**: Represents a single weight measurement. Maps to the `weight_records` table.
-   **Blood Pressure**: Represents a single blood pressure measurement. Maps to the `blood_pressure_records` table.
-   **Symptom**: Represents a single neurological symptom record. Maps to the `symptom_records` table.
-   **Charts**: A logical resource for retrieving processed and aggregated data ready for visualization. It does not map directly to a single table but rather queries multiple tables and performs calculations.

## 2. Endpoints

All endpoints are prefixed with `/api`. All endpoints require authentication unless otherwise specified.

### User Profile Resource

-   **Path**: `/users/me`
-   **Description**: Manages the profile of the currently authenticated user.

---

#### Get User Profile

-   **Method**: `GET`
-   **Path**: `/users/me`
-   **Description**: Retrieves the profile of the currently authenticated user.
-   **Request Payload**: None
-   **Response Payload**:
    ```json
    {
      "id": "c3e4b9e2-6d7c-4a3b-8f9a-0e1d2c3b4a5f",
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1990-01-15",
      "height_cm": 180,
      "updated_at": "2025-10-15T10:00:00Z"
    }
    ```
-   **Success Response**: `200 OK`
-   **Error Responses**:
    -   `401 Unauthorized`: User is not authenticated.
    -   `404 Not Found`: User profile does not exist.

---

#### Update User Profile

-   **Method**: `PUT`
-   **Path**: `/users/me`
-   **Description**: Updates the profile of the currently authenticated user.
-   **Request Payload**:
    ```json
    {
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1990-01-15",
      "height_cm": 180
    }
    ```
-   **Response Payload**: The updated User Profile object.
-   **Success Response**: `200 OK`
-   **Error Responses**:
    -   `400 Bad Request`: Validation error (e.g., invalid date format, non-numeric height).
    -   `401 Unauthorized`: User is not authenticated.

---

### Weight Resource

-   **Path**: `/weight`
-   **Description**: Manages the user's weight records.

---

#### Get All Weight Records

-   **Method**: `GET`
-   **Path**: `/weight`
-   **Description**: Retrieves a list of all weight records for the authenticated user, sorted by date descending.
-   **Query Parameters**:
    -   `page` (number, optional, default: 1): The page number for pagination.
    -   `pageSize` (number, optional, default: 30): The number of records per page.
-   **Response Payload**:
    ```json
    {
      "data": [
        {
          "id": 101,
          "date": "2025-10-15",
          "weight_kg": 75.5
        },
        {
          "id": 100,
          "date": "2025-10-14",
          "weight_kg": 75.8
        }
      ],
      "pagination": {
        "page": 1,
        "pageSize": 30,
        "total": 2
      }
    }
    ```
-   **Success Response**: `200 OK`
-   **Error Responses**: `401 Unauthorized`

---

#### Create Weight Record

-   **Method**: `POST`
-   **Path**: `/weight`
-   **Description**: Creates a new weight record.
-   **Request Payload**:
    ```json
    {
      "date": "2025-10-16",
      "weight_kg": 76.0
    }
    ```
-   **Response Payload**: The newly created weight record object.
-   **Success Response**: `201 Created`
-   **Error Responses**:
    -   `400 Bad Request`: Validation error.
    -   `401 Unauthorized`: User is not authenticated.

---

#### Update Weight Record

-   **Method**: `PUT`
-   **Path**: `/weight/{id}`
-   **Description**: Updates an existing weight record.
-   **Request Payload**:
    ```json
    {
      "date": "2025-10-15",
      "weight_kg": 75.2
    }
    ```
-   **Response Payload**: The updated weight record object.
-   **Success Response**: `200 OK`
-   **Error Responses**:
    -   `400 Bad Request`: Validation error.
    -   `401 Unauthorized`: User is not authenticated.
    -   `403 Forbidden`: User is trying to update a record they do not own.
    -   `404 Not Found`: Record with the given ID does not exist.

---

#### Delete Weight Record

-   **Method**: `DELETE`
-   **Path**: `/weight/{id}`
-   **Description**: Deletes a weight record.
-   **Request Payload**: None
-   **Response Payload**: None
-   **Success Response**: `204 No Content`
-   **Error Responses**:
    -   `401 Unauthorized`: User is not authenticated.
    -   `403 Forbidden`: User is trying to delete a record they do not own.
    -   `404 Not Found`: Record with the given ID does not exist.

---

### Blood Pressure Resource

-   **Path**: `/blood-pressure`
-   **Description**: Manages the user's blood pressure records. Endpoints follow the same CRUD pattern as the Weight resource (`GET /`, `POST /`, `PUT /{id}`, `DELETE /{id}`).

---

#### Create Blood Pressure Record (Example)

-   **Method**: `POST`
-   **Path**: `/blood-pressure`
-   **Description**: Creates a new blood pressure record.
-   **Request Payload**:
    ```json
    {
      "date": "2025-10-16",
      "systolic": 120,
      "diastolic": 80,
      "pulse": 60
    }
    ```
-   **Response Payload**:
    ```json
    {
      "id": 201,
      "date": "2025-10-16",
      "systolic": 120,
      "diastolic": 80,
      "pulse": 60
    }
    ```
-   **Success Response**: `201 Created`
-   **Error Responses**:
    -   `400 Bad Request`: Validation error.
    -   `401 Unauthorized`: User is not authenticated.

---

### Symptom Resource

-   **Path**: `/symptoms`
-   **Description**: Manages the user's symptom records. Endpoints follow the same CRUD pattern as the Weight resource (`GET /`, `POST /`, `PUT /{id}`, `DELETE /{id}`).

---

#### Create Symptom Record (Example)

-   **Method**: `POST`
-   **Path**: `/symptoms`
-   **Description**: Creates a new symptom record.
-   **Request Payload**:
    ```json
    {
      "date": "2025-10-16",
      "body_part": "LeftHand",
      "pain_type": "Numbness",
      "description": "Fingers feel numb after waking up."
    }
    ```
-   **Response Payload**:
    ```json
    {
      "id": 301,
      "date": "2025-10-16",
      "body_part": "LeftHand",
      "pain_type": "Numbness",
      "description": "Fingers feel numb after waking up."
    }
    ```
-   **Success Response**: `201 Created`
-   **Error Responses**:
    -   `400 Bad Request`: Validation error (e.g., invalid enum value).
    -   `401 Unauthorized`: User is not authenticated.

---

### Charts Resource

-   **Path**: `/charts`
-   **Description**: Provides processed data for frontend charts.

---

#### Get Weight Chart Data

-   **Method**: `GET`
-   **Path**: `/charts/weight`
-   **Description**: Retrieves processed data for the weight chart, including calculated BMI and moving average.
-   **Query Parameters**:
    -   `period` (string, required): The time range. Enum: `week`, `month`, `quarter`, `year`.
-   **Response Payload**:
    ```json
    {
      "period": "month",
      "average_weight_kg": 75.6,
      "data": [
        {
          "date": "2025-10-14",
          "weight_kg": 75.8,
          "bmi": 23.4,
          "moving_average_5d": null
        },
        {
          "date": "2025-10-15",
          "weight_kg": 75.5,
          "bmi": 23.3,
          "moving_average_5d": 75.65 
        }
      ]
    }
    ```
-   **Success Response**: `200 OK`
-   **Error Responses**:
    -   `400 Bad Request`: Invalid `period` parameter.
    -   `401 Unauthorized`: User is not authenticated.

---

#### Get Blood Pressure Chart Data

-   **Method**: `GET`
-   **Path**: `/charts/blood-pressure`
-   **Description**: Retrieves processed data for the blood pressure chart, including moving averages.
-   **Query Parameters**:
    -   `period` (string, required): The time range. Enum: `week`, `month`, `quarter`, `year`.
-   **Response Payload**:
    ```json
    {
      "period": "month",
      "average_systolic": 121,
      "average_diastolic": 81,
      "average_pulse": 65,
      "data": [
        {
          "date": "2025-10-14",
          "systolic": 122,
          "diastolic": 82,
          "pulse": 68,
          "systolic_moving_average_5d": null,
          "diastolic_moving_average_5d": null
        },
        {
          "date": "2025-10-15",
          "systolic": 120,
          "diastolic": 80,
          "pulse": 62,
          "systolic_moving_average_5d": 121,
          "diastolic_moving_average_5d": 81
        }
      ]
    }
    ```
-   **Success Response**: `200 OK`
-   **Error Responses**:
    -   `400 Bad Request`: Invalid `period` parameter.
    -   `401 Unauthorized`: User is not authenticated.

---

## 3. Authentication and Authorization

-   **Mechanism**: Authentication will be handled by Supabase Auth. The frontend client will authenticate with Supabase and receive a JSON Web Token (JWT).
-   **Implementation**:
    1.  The client sends the JWT in the `Authorization` header of every request to the API endpoints: `Authorization: Bearer <SUPABASE_JWT>`.
    2.  Each API endpoint (Astro server-side function) will use the Supabase JS client library to validate the JWT and retrieve the authenticated user session from the incoming request's headers.
    3.  If the user session is valid, the API proceeds to fetch data. The Supabase client, when used with an authenticated user, will automatically apply the Row-Level Security (RLS) policies defined in the database.
    4.  This ensures that a user can only ever access or modify their own data, providing robust authorization without needing extra logic in the API endpoints.

## 4. Validation and Business Logic

Data validation is performed at the API level before any database operations.

-   **User Profile**:
    -   `height_cm`: Must be a positive integer.
    -   `date_of_birth`: Must be a valid date in `YYYY-MM-DD` format and cannot be in the future.
-   **Weight Records**:
    -   `weight_kg`: Required, must be a number between 10 and 99.
    -   `date`: Required, must be a valid date.
-   **Blood Pressure Records**:
    -   `systolic`, `diastolic`, `pulse`: Required, must be positive integers less than 1000.
    -   `date`: Required, must be a valid date.
-   **Symptom Records**:
    -   `body_part`, `pain_type`: Required, must be valid enum values.
    -   `date`: Required, must be a valid date.

### Business Logic Implementation

-   **BMI Calculation**: Implemented in the `GET /api/charts/weight` endpoint. The logic will fetch the user's height from their profile and calculate `weight (kg) / (height (m))^2` for each data point.
-   **Moving Averages & Period Averages**: Implemented in the `/api/charts/*` endpoints. The API will fetch all necessary data points for the given period (plus extra data points to calculate the first few moving average values), perform the calculations on the server, and then return the computed results in the response.
