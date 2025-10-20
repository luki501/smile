import type { SupabaseClient } from "@/db/supabase.client";
import type { UserProfileDto } from "@/types";

/**
 * Retrieves the public profile for a given user.
 *
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user whose profile is to be retrieved.
 * @returns A promise that resolves to the user's profile DTO, or null if not found.
 * @throws Will throw an error if a database error other than 'not found' occurs.
 */
export async function getUserProfile(
	supabase: SupabaseClient,
	userId: string,
): Promise<UserProfileDto | null> {
	const { data, error } = await supabase
		.from("users")
		.select("id, first_name, last_name, date_of_birth, height_cm, updated_at")
		.eq("id", userId)
		.single();

	if (error) {
		// "PGRST116: The result contains 0 rows" - this is an expected case when profile doesn't exist.
		if (error.code === "PGRST116") {
			return null;
		}

		// For any other database error, we log it and re-throw to be handled by the API route.
		console.error("Error fetching user profile:", error);
		throw new Error("A database error occurred while fetching the user profile.");
	}

	return data;
}
