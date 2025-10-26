import { z } from "zod";

/**
 * =================================================================================
 * AUTH VALIDATORS
 * =================================================================================
 */

export const RegisterFormValidationSchema = z.object({
	email: z.string().email({ message: "Nieprawidłowy format adresu e-mail." }),
	password: z.string().min(8, { message: "Hasło musi mieć co najmniej 8 znaków." }),
});

/**
 * =================================================================================
 * AUTH TYPES
 * =================================================================================
 */

export type RegisterFormViewModel = z.infer<typeof RegisterFormValidationSchema>;
