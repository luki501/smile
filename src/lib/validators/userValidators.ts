import { z } from "zod";

export const updateUserProfileSchema = z
	.object({
		first_name: z.string().min(1, "First name cannot be empty.").optional(),
		last_name: z.string().min(1, "Last name cannot be empty.").optional(),
		date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format.").optional(),
		height_cm: z.number().int().positive("Height must be a positive integer.").optional(),
	})
	.refine(
		(data) => {
			return Object.keys(data).length > 0;
		},
		{
			message: "At least one field must be provided to update.",
			path: [], // Attach error to the root object
		},
	);

export const createUserProfileSchema = z.object({
	first_name: z
		.string({ required_error: "First name is required." })
		.trim()
		.min(1, "First name cannot be empty."),
	last_name: z
		.string({ required_error: "Last name is required." })
		.trim()
		.min(1, "Last name cannot be empty."),
	date_of_birth: z
		.string({ required_error: "Date of birth is required." })
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format."),
	height_cm: z
		.number({ required_error: "Height is required." })
		.int("Height must be an integer.")
		.positive("Height must be a positive number."),
});

