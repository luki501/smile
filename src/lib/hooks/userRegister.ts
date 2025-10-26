import { useState } from "react";

import { supabaseClient as supabase } from "@/db/supabase.client";
import type { RegisterFormViewModel } from "@/lib/validators/authValidators";

export function useRegister() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const register = async (data: RegisterFormViewModel) => {
		setIsLoading(true);
		setError(null);

		let error: string | null = null;

		try {
			const { error: signUpError } = await supabase.auth.signUp({
				email: data.email,
				password: data.password,
			});

			if (signUpError) {
				// TODO: Add more specific error messages
				error = signUpError.message;
				setError(error);
			}

			// Redirect will be handled in the component
		} catch (e) {
			error = "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.";
			setError(error);
		} finally {
			setIsLoading(false);
		}
		return { error };
	};

	return {
		register,
		isLoading,
		error,
	};
}
