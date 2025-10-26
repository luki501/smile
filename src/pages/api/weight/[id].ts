import type { APIRoute } from "astro";
import { z } from "zod";
import { deleteWeightRecord, updateWeightRecord } from "@/lib/services/weightService";
import { updateWeightRecordSchema } from "@/lib/validators/weightValidators";

export const prerender = false;

const paramsSchema = z.object({
	id: z.coerce.number().int().positive(),
});

export const PUT: APIRoute = async ({ params, request, locals }) => {
	const { user, supabase } = locals;

	if (!user) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
	}

	const paramsValidation = paramsSchema.safeParse(params);
	if (!paramsValidation.success) {
		return new Response(
			JSON.stringify({
				message: "Invalid record ID",
				errors: paramsValidation.error.flatten().fieldErrors,
			}),
			{ status: 400 },
		);
	}

	try {
		const body = await request.json();
		const bodyValidation = updateWeightRecordSchema.safeParse(body);

		if (!bodyValidation.success) {
			return new Response(
				JSON.stringify({
					message: "Validation failed",
					errors: bodyValidation.error.flatten().fieldErrors,
				}),
				{ status: 400 },
			);
		}

		const recordId = paramsValidation.data.id;
		const result = await updateWeightRecord(supabase, user.id, recordId, bodyValidation.data);

		switch (result.status) {
			case "success":
				return new Response(JSON.stringify(result.data), { status: 200 });
			case "not_found":
				return new Response(JSON.stringify({ message: "Record not found" }), { status: 404 });
			case "forbidden":
				return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
		}
	} catch (error) {
		console.error(`Error in PUT /api/weight/${params.id}:`, error);
		return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
	}
};

export const DELETE: APIRoute = async ({ params, locals }) => {
	const { user, supabase } = locals;

	if (!user) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
	}

	const paramsValidation = paramsSchema.safeParse(params);
	if (!paramsValidation.success) {
		return new Response(
			JSON.stringify({
				message: "Invalid record ID",
				errors: paramsValidation.error.flatten().fieldErrors,
			}),
			{ status: 400 },
		);
	}

	try {
		const recordId = paramsValidation.data.id;
		const result = await deleteWeightRecord(supabase, user.id, recordId);

		switch (result.status) {
			case "success":
				return new Response(null, { status: 204 });
			case "not_found":
				return new Response(JSON.stringify({ message: "Record not found" }), { status: 404 });
			case "forbidden":
				return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
		}
	} catch (error) {
		console.error(`Error in DELETE /api/weight/${params.id}:`, error);
		return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
	}
};
