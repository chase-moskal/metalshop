
export function mockStorage(): Storage {
	let store: {[key: string]: string} = {}
	return {

		getItem(key: string) {
			return store[key]
		},

		setItem(key: string, value: string) {
			store[key] = value
		},

		removeItem(key: string) {
			if (store.hasOwnProperty(key))
				delete store[key]
		},

		get length() {
			return Object.keys(store).length
		},

		clear() {
			store = {}
		},

		key(index: number) {
			throw new Error("mock doesn't support storage .key")
		},
	}
}
