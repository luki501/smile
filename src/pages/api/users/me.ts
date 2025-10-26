import type { APIContext, APIRoute } from "astro";
import { getUserProfile, updateUserProfile } from "@/lib/services/userService";
import { updateUserProfileSchema } from "@/lib/validators/userValidators";

export const prerender = false;

/**
 * Handles GET requests to retrieve the authenticated user's profile.
 *
 * @param {APIContext} context - The Astro API context.
 * @returns {Promise<Response>} A promise that resolves to a Response object.
 */
export async function GET({ locals }: APIContext): Promise<Response> {
	const { session, supabase } = locals;

	if (!session) {
		return new Response(JSON.stringify({ message: "Unauthorized: User not authenticated." }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const userProfile = await getUserProfile(supabase, session.user.id);

		if (!userProfile) {
			return new Response(JSON.stringify({ message: "Not Found: User profile does not exist." }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response(JSON.stringify(userProfile), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Internal Server Error in GET /api/users/me:", error);
		return new Response(JSON.stringify({ message: "Internal Server Error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

export const PUT: APIRoute = async ({ request, locals }) => {
	const { user, supabase } = locals;

	if (!user) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const body = await request.json();
		const validation = updateUserProfileSchema.safeParse(body);

		if (!validation.success) {
			return new Response(
				JSON.stringify({
					message: "Validation failed",
					errors: validation.error.flatten().fieldErrors,
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const updatedProfile = await updateUserProfile(supabase, user.id, validation.data);

		return new Response(JSON.stringify(updatedProfile), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error in PUT /api/users/me:", error);
		// In a real application, you might want more sophisticated logging
		return new Response(JSON.stringify({ message: "Internal Server Error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
