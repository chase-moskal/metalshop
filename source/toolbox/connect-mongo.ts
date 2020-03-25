
import {MongoConfig} from "../interfaces.js"
import {MongoClient, Collection} from "../commonjs/mongodb.js"

export async function connectMongo(
	mongo: MongoConfig,
	collection: string,
): Promise<Collection> {
	const client = new MongoClient(mongo.link, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	await client.connect()
	return client.db(mongo.database).collection(collection)
}
