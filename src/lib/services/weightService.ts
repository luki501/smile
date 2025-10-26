import type { SupabaseClient } from "@/db/supabase.client";
import type {
	CreateWeightRecordCommand,
	UpdateWeightRecordCommand,
	WeightRecordDto,
} from "@/types";

type WeightRecordsResult = {
	data: WeightRecordDto[];
	total: number;
};

/**
 * Retrieves a paginated list of weight records for a specific user.
 *
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user whose records are to be retrieved.
 * @param page - The page number to fetch.
 * @param pageSize - The number of records per page.
 * @returns A promise that resolves to an object containing the records and the total count.
 * @throws Will throw an error if a database error occurs.
 */
export async function getWeightRecords(
	supabase: SupabaseClient,
	userId: string,
	page: number,
	pageSize: number,
): Promise<WeightRecordsResult> {
	const offset = (page - 1) * pageSize;

	// Perform two parallel queries: one for the total count and one for the paginated data.
	const [totalResponse, dataResponse] = await Promise.all([
		supabase.from("weight_records").select("id", { count: "exact" }).eq("user_id", userId),
		supabase
			.from("weight_records")
			.select("id, date, weight_kg")
			.eq("user_id", userId)
			.order("date", { ascending: false })
			.range(offset, offset + pageSize - 1),
	]);

	if (totalResponse.error) {
		console.error("Error fetching weight records count:", totalResponse.error);
		throw new Error("A database error occurred while fetching the total count of weight records.");
	}

	if (dataResponse.error) {
		console.error("Error fetching weight records data:", dataResponse.error);
		throw new Error("A database error occurred while fetching weight records.");
	}

	return {
		data: dataResponse.data,
		total: totalResponse.count ?? 0,
	};
}

/**
 * Creates a new weight record for a specific user.
 *
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user for whom the record is being created.
 * @param command - The data for the new weight record.
 * @returns A promise that resolves to the newly created weight record DTO.
 * @throws Will throw an error if the database insertion fails.
 */
export async function createWeightRecord(
	supabase: SupabaseClient,
	userId: string,
	command: CreateWeightRecordCommand,
): Promise<WeightRecordDto> {
	const { data: newRecord, error } = await supabase
		.from("weight_records")
		.insert({
			...command,
			user_id: userId,
		})
		.select("id, date, weight_kg")
		.single();

	if (error) {
		console.error("Error creating weight record:", error);
		throw new Error("A database error occurred while creating the weight record.");
	}

	return newRecord;
}

type UpdateResult =
	| { status: "success"; data: WeightRecordDto }
	| { status: "not_found" }
	| { status: "forbidden" };

/**
 * Updates an existing weight record for a specific user.
 * It first verifies that the record exists and belongs to the user before updating.
 *
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user attempting the update.
 * @param recordId - The ID of the record to update.
 * @param command - The new data for the weight record.
 * @returns A promise that resolves to an object indicating the outcome (success, not_found, or forbidden).
 * @throws Will throw an error if a database error occurs during the operation.
 */
export async function updateWeightRecord(
	supabase: SupabaseClient,
	userId: string,
	recordId: number,
	command: UpdateWeightRecordCommand,
): Promise<UpdateResult> {
	// First, verify the record exists and belongs to the user.
	const { data: existingRecord, error: fetchError } = await supabase
		.from("weight_records")
		.select("id, user_id")
		.eq("id", recordId)
		.single();

	if (fetchError) {
		// "PGRST116" code means no rows were found, which we treat as "not_found".
		if (fetchError.code === "PGRST116") {
			return { status: "not_found" };
		}
		console.error("Error fetching weight record for update:", fetchError);
		throw new Error("A database error occurred while verifying the weight record.");
	}

	if (existingRecord.user_id !== userId) {
		return { status: "forbidden" };
	}

	// If verification is successful, proceed with the update.
	const { data: updatedRecord, error: updateError } = await supabase
		.from("weight_records")
		.update(command)
		.eq("id", recordId)
		.select("id, date, weight_kg")
		.single();

	if (updateError) {
		console.error("Error updating weight record:", updateError);
		throw new Error("A database error occurred while updating the weight record.");
	}

	return { status: "success", data: updatedRecord };
}

type DeleteResult = {
	status: "success" | "not_found" | "forbidden";
};

/**
 * Deletes a weight record for a specific user.
 * It first verifies that the record exists and belongs to the user before deleting.
 *
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user attempting the deletion.
 * @param recordId - The ID of the record to delete.
 * @returns A promise that resolves to an object indicating the outcome.
 * @throws Will throw an error if a database error occurs.
 */
export async function deleteWeightRecord(
	supabase: SupabaseClient,
	userId: string,
	recordId: number,
): Promise<DeleteResult> {
	const { data: existingRecord, error: fetchError } = await supabase
		.from("weight_records")
		.select("user_id")
		.eq("id", recordId)
		.single();

	if (fetchError) {
		if (fetchError.code === "PGRST116") {
			return { status: "not_found" };
		}
		console.error("Error fetching weight record for deletion:", fetchError);
		throw new Error("A database error occurred while verifying the weight record for deletion.");
	}

	if (existingRecord.user_id !== userId) {
		return { status: "forbidden" };
	}

	const { error: deleteError } = await supabase.from("weight_records").delete().eq("id", recordId);

	if (deleteError) {
		console.error("Error deleting weight record:", deleteError);
		throw new Error("A database error occurred while deleting the weight record.");
	}

	return { status: "success" };
}
