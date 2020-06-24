
import {first} from "./first.js"
import {Suite, expect} from "cynic"
import {dbbyMemory} from "./dbby-memory.js"

interface DemoUser {
	userId: string
	balance: number
	location: string
}

async function setupThreeUserDemo() {
	const dbby = dbbyMemory<DemoUser>()
	await Promise.all([
		dbby.create({userId: "u123", balance: 100, location: "america"}),
		dbby.create({userId: "u124", balance: 0, location: "canada"}),
		dbby.create({userId: "u125", balance: -100, location: "canada"}),
	])
	return dbby
}

export default <Suite>{
	"dbby-memory": {
		"can create rows and read 'em back": async() => {
			const dbby = await setupThreeUserDemo()
			const users = await dbby.read()
			return expect(users.length).equals(3)
		},
		"read by various conditions": async() => {
			const dbby = await setupThreeUserDemo()
			return (true
				&& expect([
						...await dbby.read({equal: {userId: "u123"}}),
						...await dbby.read({equal: {userId: "u124"}}),
						...await dbby.read({equal: {userId: "u125"}}),
					].length).equals(3)
				&& expect((
						await dbby.read({less: {balance: 50}})
					).length).equals(2)
				&& expect((
						await dbby.read({includes: {location: "can"}})
					).length).equals(2)
			)
		},
		"can delete a row and it's gone": async() => {
			const dbby = await setupThreeUserDemo()
			await dbby.delete({equal: {userId: "u123"}})
			const users = await dbby.read()
			return expect(users.length).equals(2)
		},
		"can update a row and it sticks": async() => {
			const dbby = await setupThreeUserDemo()
			await dbby.update(
				{equal: {userId: "u123"}},
				{location: "argentina"},
			)
			const user = first(await dbby.read({equal: {userId: "u123"}}))
			return expect(user.location).equals("argentina")
		},
		"can run count queries": async() => {
			const dbby = await setupThreeUserDemo()
			const countAll = await dbby.count()
			const countCanadians = await dbby.count({equal: {location: "canada"}})
			return (true
				&& expect(countAll).equals(3)
				&& expect(countCanadians).equals(2)
			)
		},
	},
}
