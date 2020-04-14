
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _mongodb from "mongodb"
const mongodb: typeof _mongodb = require("mongodb") as typeof _mongodb

// types
type Db = _mongodb.Db
type ObjectID = _mongodb.ObjectID
type Collection = _mongodb.Collection

// values
const {
	ObjectId,
	MongoClient,
} = mongodb

export {

	// types
	Db,
	ObjectID,
	Collection,
	
	// values
	ObjectId,
	MongoClient,
}
