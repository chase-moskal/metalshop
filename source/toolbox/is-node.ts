
export const isNode = (function() {
	try {
		const glob = typeof global !== "undefined"
		return glob && this === global
	}
	catch (error) {
		return false
	}
})()
