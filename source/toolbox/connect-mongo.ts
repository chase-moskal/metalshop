
import {MongoConfig} from "../interfaces.js"
import {MongoClient, Db} from "../commonjs/mongodb.js"

export async function connectMongo(
	mongo: MongoConfig,
): Promise<Db> {
	const client = new MongoClient(mongo.link, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	await client.connect()
	return client.db(mongo.database)
}
