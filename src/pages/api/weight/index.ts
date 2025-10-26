import type { APIRoute } from "astro";
import { createWeightRecord, getWeightRecords } from "@/lib/services/weightService";
import { paginationSchema } from "@/lib/validators/paginationValidators";
import { createWeightRecordSchema } from "@/lib/validators/weightValidators";
import type { PaginatedResponseDto, WeightRecordDto } from "@/types";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
	const { user, supabase } = locals;

	if (!user) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
	}

	const searchParams = url.searchParams;
	const validation = paginationSchema.safeParse({
		page: searchParams.get("page"),
		pageSize: searchParams.get("pageSize"),
	});

	if (!validation.success) {
		return new Response(
			JSON.stringify({
				message: "Validation failed",
				errors: validation.error.flatten().fieldErrors,
			}),
			{ status: 400 },
		);
	}

	try {
		const { page, pageSize } = validation.data;
		const { data, total } = await getWeightRecords(supabase, user.id, page, pageSize);

		const response: PaginatedResponseDto<WeightRecordDto> = {
			data,
			pagination: {
				page,
				pageSize,
				total,
			},
		};

		return new Response(JSON.stringify(response), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error in GET /api/weight:", error);
		return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
	}
};

export const POST: APIRoute = async ({ request, locals }) => {
	const { user, supabase } = locals;

	if (!user) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
	}

	try {
		const body = await request.json();
		const validation = createWeightRecordSchema.safeParse(body);

		if (!validation.success) {
			return new Response(
				JSON.stringify({
					message: "Validation failed",
					errors: validation.error.flatten().fieldErrors,
				}),
				{ status: 400 },
			);
		}

		const newRecord = await createWeightRecord(supabase, user.id, validation.data);

		return new Response(JSON.stringify(newRecord), {
			status: 201,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error in POST /api/weight:", error);
		return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
	}
};
