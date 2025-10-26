import { z } from "zod";

export const updateUserProfileSchema = z
	.object({
		first_name: z.string().min(1, "First name cannot be empty.").optional(),
		last_name: z.string().min(1, "Last name cannot be empty.").optional(),
		date_of_birth: z.string().date("Invalid date format.").optional(),
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

