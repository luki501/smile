import type { SupabaseClient } from "@/db/supabase.client";
import type {
	CreateUserProfileCommand,
	UpdateUserProfileCommand,
	UserProfileDto,
} from "@/types";
import { ConflictError } from "../errors";

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

/**
 * Updates a user's profile with the provided data.
 *
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user whose profile is to be updated.
 * @param command - An object containing the profile fields to update.
 * @returns A promise that resolves to the updated user's profile DTO.
 * @throws Will throw an error if the update fails or the user is not found.
 */
export async function updateUserProfile(
	supabase: SupabaseClient,
	userId: string,
	command: UpdateUserProfileCommand,
): Promise<UserProfileDto> {
	const { data: updatedUser, error } = await supabase
		.from("users")
		.update(command)
		.eq("id", userId)
		.select("id, first_name, last_name, date_of_birth, height_cm, updated_at")
		.single();

	if (error) {
		console.error("Error updating user profile:", error);
		throw new Error("A database error occurred while updating the user profile.");
	}

	if (!updatedUser) {
		// This case should ideally not be reached if the user is authenticated
		// and the user ID from the session is valid.
		throw new Error("User not found after update operation.");
	}

	return updatedUser;
}

/**
 * Creates a new user profile.
 *
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user for whom to create the profile.
 * @param command - An object containing the profile data.
 * @returns A promise that resolves to the newly created user's profile DTO.
 * @throws {ConflictError} If a profile for the user already exists.
 * @throws {Error} If a database error occurs.
 */
export async function createUserProfile(
	supabase: SupabaseClient,
	userId: string,
	command: CreateUserProfileCommand,
): Promise<UserProfileDto> {
	const { data: existingProfile, error: selectError } = await supabase
		.from("users")
		.select("id")
		.eq("id", userId)
		.maybeSingle();

	if (selectError) {
		console.error("Error checking for existing user profile:", selectError);
		throw new Error("A database error occurred while checking for an existing profile.");
	}

	if (existingProfile) {
		throw new ConflictError("User profile already exists.");
	}

	const { data: newUserProfile, error: insertError } = await supabase
		.from("users")
		.insert({
			id: userId,
			...command,
		})
		.select("id, first_name, last_name, date_of_birth, height_cm, updated_at")
		.single();

	if (insertError) {
		console.error("Error creating user profile:", insertError);
		throw new Error("A database error occurred while creating the user profile.");
	}

	return newUserProfile;
}
