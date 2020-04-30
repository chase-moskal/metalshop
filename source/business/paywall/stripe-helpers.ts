
export const stripeGetId = (x: string | {id: string}) => {
	return x && (
		typeof x === "string"
			? x
			: x.id
	)
}
