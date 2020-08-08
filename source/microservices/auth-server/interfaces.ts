
import {ObjectID} from "./commonjs/mongodb.js"

import {User, Claims, AuthApi, CorsConfig}
	from "authoritarian/dist/interfaces.js"

export {AuthApi}

export interface UsersDatabase {
	getUser(o: {userId: string}): Promise<User>
	createUser(o: {googleId: string}): Promise<User>
	setClaims(o: {userId: string, claims?: Claims}): Promise<User>
}

export interface ClaimsDealerConfig {
	cors: CorsConfig
}

export interface AuthExchangerConfig {
	cors: CorsConfig
}

export interface MongoDatabaseConfig {
	link: string
	database: string
	collection: string
}

export interface UserRecord {
	_id?: ObjectID
	claims: Claims
	googleId: string
}
