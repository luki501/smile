import type { APIContext } from "astro";
import { getUserProfile } from "@/lib/services/userService";

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
