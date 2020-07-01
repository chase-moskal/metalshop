
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
		"create rows and read 'em back unconditionally": async() => {
			const dbby = await setupThreeUserDemo()
			const users = await dbby.read({conditions: false})
			return expect(users.length).equals(3)
		},
		"read one": async() => {
			const dbby = await setupThreeUserDemo()
			return (true
				&& expect(
						await dbby.one({conditions: {equal: {userId: "u123"}}})
					).ok()
				&& expect(
						await dbby.one({conditions: false})
					).ok()
			)
		},
		"read with single sets of conditions": async() => {
			const dbby = await setupThreeUserDemo()
			return (true
				&& expect([
						...await dbby.read({conditions: {equal: {userId: "u123"}}}),
						...await dbby.read({conditions: {equal: {userId: "u124"}}}),
						...await dbby.read({conditions: {equal: {userId: "u125"}}}),
					].length).equals(3)
				&& expect((
						await dbby.read({conditions: {
							greater: {balance: 50},
							equal: {location: "america"}
						}})
					).length).equals(1)
				&& expect((
						await dbby.read({conditions: {
							notEqual: {location: "america"}
						}})
					).length).equals(2)
				&& expect((
						await dbby.read({conditions: {less: {balance: 50}}})
					).length).equals(2)
				&& expect((
						await dbby.read({conditions: {includes: {location: "can"}}})
					).length).equals(2)
			)
		},
		"read with multiple conditions": async() => {
			const dbby = await setupThreeUserDemo()
			return (true
				&& expect((
						await dbby.read({
							multi: "and",
							conditions: [
								{less: {balance: 200}},
								{equal: {location: "canada"}},
							]
						})
					).length).equals(2)
				&& expect((
						await dbby.read({
							multi: "or",
							conditions: [
								{less: {balance: 50}},
								{equal: {location: "america"}},
							]
						})
					).length).equals(3)
			)
		},
		"delete a row and it's gone": async() => {
			const dbby = await setupThreeUserDemo()
			await dbby.delete({conditions: {equal: {userId: "u123"}}})
			const users = await dbby.read({conditions: false})
			return expect(users.length).equals(2)
		},
		"update a row and it sticks": async() => {
			const dbby = await setupThreeUserDemo()
			await dbby.update({
				conditions: {equal: {userId: "u123"}},
				replace: {location: "argentina"},
			})
			const user = await dbby.one({conditions: {equal: {userId: "u123"}}})
			return expect(user.location).equals("argentina")
		},
		"update upsert can update or insert": async() => {
			const dbby = await setupThreeUserDemo()
			await Promise.all([
				dbby.update({
					conditions: {equal: {userId: "u123"}},
					upsert: {
						userId: "u123",
						balance: 500,
						location: "america",
					},
				}),
				dbby.update({
					conditions: {equal: {userId: "u126"}},
					upsert: {
						userId: "u126",
						balance: 1000,
						location: "argentina",
					},
				}),
			])
			const america = await dbby.one({conditions: {equal: {userId: "u123"}}})
			const argentina = await dbby.one({conditions: {equal: {userId: "u126"}}})
			return (true
				&& expect(america.balance).equals(500)
				&& expect(argentina.balance).equals(1000)
			)
		},
		"count rows with conditions": async() => {
			const dbby = await setupThreeUserDemo()
			const countAll = await dbby.count({conditions: false})
			const countCanadians = await dbby.count({conditions: {equal: {location: "canada"}}})
			return (true
				&& expect(countAll).equals(3)
				&& expect(countCanadians).equals(2)
			)
		},
	},
}
