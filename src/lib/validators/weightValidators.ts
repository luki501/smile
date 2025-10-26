import { z } from "zod";

export const createWeightRecordSchema = z.object({
	date: z.string().date("Invalid date format. Please use YYYY-MM-DD."),
	weight_kg: z.number().positive("Weight must be a positive number."),
});

export const updateWeightRecordSchema = createWeightRecordSchema;
