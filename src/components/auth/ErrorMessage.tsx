import * as React from "react";

type ErrorMessageProps = {
	message: string | null;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
	if (!message) {
		return null;
	}

	return (
		<div className="rounded-md bg-red-50 p-4">
			<div className="flex">
				<div className="ml-3">
					<p className="text-sm font-medium text-red-800">{message}</p>
				</div>
			</div>
		</div>
	);
}
