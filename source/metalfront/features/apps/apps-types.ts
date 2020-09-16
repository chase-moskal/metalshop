
import {Topic, Method} from "renraku/dist/interfaces.js"
import * as loading from "../../toolbox/loading.js"
import {DbbyRow} from "../../../toolbox/dbby/dbby-types.js"

import {
	AccessToken,
} from "../../../types.js"
import {objectMap, objectMap2} from "../../../toolbox/object-map.js"

export type AppToken = string

export interface AppTokenDraft {
	label: string
	origins: string[]
}

export interface AppTokenPayload extends AppTokenDraft {
	appTokenId: string
	label: string
	origins: string[]
}

export interface AppTokenFull extends AppTokenPayload {
	token: string
}

export interface AppDraft {
	label: string
}

export interface App extends AppDraft {
	appId: string
	created: number
	tokens: AppTokenFull[]
}

export interface AppRow extends DbbyRow {
	appId: string
	userId: string
	created: number
}

export interface AppTokenRow extends DbbyRow {
	appTokenId: string
	appId: string
	label: string
	created: number
	origins: string
}

export interface AppAlpacaTopic extends TopicStrict {
	listApps(o: {
			accessToken: AccessToken
			userId: string
		}): Promise<App[]>
	registerApp(o: {
			accessToken: AccessToken
			userId: string
			draft: AppDraft
		}): Promise<App>
	createAppToken(o: {
			accessToken: AccessToken
			appId: string
			draft: AppTokenDraft
		}): Promise<AppTokenFull>
	forgetAppToken(o: {
			accessToken: AccessToken
			appTokenId: string
		}): Promise<AppTokenFull>
}



/*

topic method types include tokens they need

curry function for client object to send tokens

*/

export type MethodStrict = (options: {}) => Promise<any>

export type TopicStrict<T extends {[key: string]: MethodStrict} = {}> = {
	[P in keyof T]: MethodStrict
} & {
	[key: string]: MethodStrict
}

// export type TopicStrict2 = {
// 	[key: string]: MethodStrict
// }

async function beta(options: {appToken: string, lol: boolean}) {
	return Date.now()
}

// TODO keep this one, this one good
export function curryMixin<Method extends MethodStrict, Mixin extends {}>(method: Method, mixin: Mixin) {
	return (options: Omit<Parameters<Method>[0], keyof Mixin>) => method({
		...options,
		...mixin,
	})
}

// TODO super good!!
export function topicCurryMixin<Topic extends TopicStrict, Mixin extends {}>(
	topic: Topic,
	mixin: Mixin,
): {[P in keyof Topic]: (...args: Parameters<Topic[P]>) => ReturnType<Topic[P]>} {
	return objectMap(topic, method =>
		options => method({...options, ...mixin})
	)
}

// export function curryAppToken<M extends MethodStrict>(appToken: string, method: M) {
// 	return (options: Omit<Parameters<M>[0], "appToken">) => method({
// 		...options,
// 		appToken,
// 	})
// }

// const beta2 = curryAppToken("a123", beta)
// beta({lol: true, appToken: "string"})
// beta2({lol: true})

// const beta3 = curryMixin(beta, {appToken: "a123", qwe: true})
// beta3({
// 	lol: true
// })

// export function topicCurryMixin<Mixin extends Object, Topic extends TopicStrict>(
// 		mixin: Mixin,
// 		topic: Topic,
// 	) {

// 	return objectMap2<Topic, {[P in keyof Topic]: () => ReturnType<Topic[P]>}>(topic, method => method)

// 	// return objectMap(topic, <X extends AsyncOptionsMethod>(method: X) =>
// 	// 	(options: Parameters<X>[0]) => method({
// 	// 		...options,
// 	// 		...mixin,
// 	// 	})
// 	// )
// }

let appAlpaca: AppAlpacaTopic

const appAlpaca2 = topicCurryMixin(appAlpaca, {appToken: "app234"})
appAlpaca2.listApps({
	accessToken: "at123",
	userId: "u235",
})

// async function alpha({lol}: {lol: boolean}) {
// 	return undefined
// }

// export type CurryMan<T extends Method> =
// 	(first: Parameters<T>[0] & {appToken: AppToken}) => ReturnType<T>

// function curryMan<M extends Method>(method: M, appToken: AppToken) {
// 	return (options: Parameters<M>[0] & {appToken: AppToken}) => method({
// 		...(options ?? {}),
// 	})
// }

// const alpha2 = curryMan(alpha, "abc123")

// alpha2({
// 	lol: true,
// 	appToken: "123",
// })

// export type CurryAppToken<T> = {
// 	[P in keyof T]: (first: {}, ...args: any[]) => void
// }
