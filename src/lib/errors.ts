/**
 * Custom error class to represent a resource conflict (e.g., HTTP 409).
 */
export class ConflictError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ConflictError";
	}
}
