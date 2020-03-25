
export function httpHandler(
	method = "get",
	url: string,
	handler: () => Promise<string>
): any {
	return async(context: any, next: any) => {
		const methodIsHead = context.method.toLowerCase() === "head"
		const methodIsGet = context.method.toLowerCase() === method.toLowerCase()
		if (!(methodIsHead || methodIsGet)) await next()
		if (context.url === url) {
			const body = await handler()
			context.response.body = body
		}
		else await next()
	}
}
