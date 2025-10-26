"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";

import ErrorMessage from "@/components/auth/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/lib/hooks/userRegister";
import type { RegisterFormViewModel } from "@/lib/validators/authValidators";
import { RegisterFormValidationSchema } from "@/lib/validators/authValidators";

export default function RegisterForm() {
	const {
		register: registerUser,
		isLoading,
		error: apiError,
	} = useRegister();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormViewModel>({
		resolver: zodResolver(RegisterFormValidationSchema),
	});

	const onSubmit = async (data: RegisterFormViewModel) => {
		const { error } = await registerUser(data);
		if (!error) {
			window.location.href = "/profile/create";
		}
	};

	return (
		<div className="w-full max-w-md space-y-8">
			<div className="text-center">
				<h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
					Zarejestruj się
				</h1>
				<p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
					Masz już konto?{" "}
					<a
						href="/login"
						className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
					>
						Zaloguj się
					</a>
				</p>
			</div>

			<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
				<div className="space-y-2">
					<Label htmlFor="email">Adres e-mail</Label>
					<Input
						id="email"
						type="email"
						placeholder="jan.kowalski@example.com"
						{...register("email")}
						disabled={isLoading}
					/>
					{errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
				</div>
				<div className="space-y-2">
					<Label htmlFor="password">Hasło</Label>
					<Input id="password" type="password" {...register("password")} disabled={isLoading} />
					{errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
				</div>

				<ErrorMessage message={apiError} />

				<div>
					<Button className="w-full" type="submit" disabled={isLoading}>
						{isLoading ? "Rejestrowanie..." : "Zarejestruj się"}
					</Button>
				</div>
			</form>
		</div>
	);
}
