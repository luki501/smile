import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types";

/**
 * =================================================================================
 * SHARED TYPES
 * =================================================================================
 */

/**
 * Represents the structure for pagination information in API responses.
 */
export type PaginationDto = {
	page: number;
	pageSize: number;
	total: number;
};

/**
 * A generic wrapper for paginated API responses.
 * @template T The type of the data items in the response.
 */
export type PaginatedResponseDto<T> = {
	data: T[];
	pagination: PaginationDto;
};

/**
 * Defines the possible time periods for chart data queries.
 */
export type ChartPeriod = "week" | "month" | "quarter" | "year";

/**
 * =================================================================================
 * USER PROFILE
 * =================================================================================
 */

/**
 * DTO for the user's public profile data.
 * Represents the data returned by `GET /api/users/me`.
 */
export type UserProfileDto = Pick<
	Tables<"users">,
	"id" | "first_name" | "last_name" | "date_of_birth" | "height_cm" | "updated_at"
>;

/**
 * Command model for updating a user's profile.
 * Represents the request body for `PUT /api/users/me`.
 */
export type UpdateUserProfileCommand = Pick<
	TablesUpdate<"users">,
	"first_name" | "last_name" | "date_of_birth" | "height_cm"
>;

/**
 * =================================================================================
 * WEIGHT RECORDS
 * =================================================================================
 */

/**
 * DTO for a single weight record.
 * This is the shape of individual items in the `GET /api/weight` response.
 */
export type WeightRecordDto = Pick<Tables<"weight_records">, "id" | "date" | "weight_kg">;

/**
 * Command model for creating a new weight record.
 * Represents the request body for `POST /api/weight`.
 */
export type CreateWeightRecordCommand = Pick<TablesInsert<"weight_records">, "date" | "weight_kg">;

/**
 * Command model for updating an existing weight record.
 * Represents the request body for `PUT /api/weight/{id}`.
 */
export type UpdateWeightRecordCommand = Pick<TablesUpdate<"weight_records">, "date" | "weight_kg">;

/**
 * =================================================================================
 * BLOOD PRESSURE RECORDS
 * =================================================================================
 */

/**
 * DTO for a single blood pressure record.
 */
export type BloodPressureRecordDto = Pick<
	Tables<"blood_pressure_records">,
	"id" | "date" | "systolic" | "diastolic" | "pulse"
>;

/**
 * Command model for creating a new blood pressure record.
 */
export type CreateBloodPressureRecordCommand = Pick<
	TablesInsert<"blood_pressure_records">,
	"date" | "systolic" | "diastolic" | "pulse"
>;

/**
 * Command model for updating an existing blood pressure record.
 */
export type UpdateBloodPressureRecordCommand = Pick<
	TablesUpdate<"blood_pressure_records">,
	"date" | "systolic" | "diastolic" | "pulse"
>;

/**
 * =================================================================================
 * SYMPTOM RECORDS
 * =================================================================================
 */

/**
 * DTO for a single symptom record.
 */
export type SymptomRecordDto = Pick<
	Tables<"symptom_records">,
	"id" | "date" | "body_part" | "pain_type" | "description"
>;

/**
 * Command model for creating a new symptom record.
 */
export type CreateSymptomRecordCommand = Pick<
	TablesInsert<"symptom_records">,
	"date" | "body_part" | "pain_type" | "description"
>;

/**
 * Command model for updating an existing symptom record.
 */
export type UpdateSymptomRecordCommand = Pick<
	TablesUpdate<"symptom_records">,
	"date" | "body_part" | "pain_type" | "description"
>;

/**
 * =================================================================================
 * CHART DATA
 * =================================================================================
 */

/**
 * Represents a single data point in the weight chart response.
 * It combines raw record data with calculated metrics like BMI and moving average.
 */
export type WeightChartPointDto = {
	date: string;
	weight_kg: number;
	bmi: number | null;
	moving_average_5d: number | null;
};

/**
 * DTO for the response of the weight chart endpoint (`GET /api/charts/weight`).
 */
export type WeightChartDataDto = {
	period: ChartPeriod;
	average_weight_kg: number | null;
	data: WeightChartPointDto[];
};

/**
 * Represents a single data point in the blood pressure chart response.
 * Includes raw measurement data and calculated moving averages.
 */
export type BloodPressureChartPointDto = {
	date: string;
	systolic: number;
	diastolic: number;
	pulse: number;
	systolic_moving_average_5d: number | null;
	diastolic_moving_average_5d: number | null;
};

/**
 * DTO for the response of the blood pressure chart endpoint (`GET /api/charts/blood-pressure`).
 */
export type BloodPressureChartDataDto = {
	period: ChartPeriod;
	average_systolic: number | null;
	average_diastolic: number | null;
	average_pulse: number | null;
	data: BloodPressureChartPointDto[];
};
