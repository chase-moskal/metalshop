
import {AuthTokens} from "./tokens.js"

export enum AccountPopupMessageFlag {
	ReadyResponse,
	GoRequest,
	ResultResponse
}

export interface AccountPopupMessage {
	namespace: string
	flag: AccountPopupMessageFlag
}

export interface AccountPopupReadyResponse extends AccountPopupMessage {
	flag: AccountPopupMessageFlag.ReadyResponse
}

export interface AccountPopupGoRequest extends AccountPopupMessage {
	flag: AccountPopupMessageFlag.GoRequest
}

export interface AccountPopupResultResponse extends AccountPopupMessage {
	flag: AccountPopupMessageFlag.ResultResponse
	tokens: AuthTokens
}

export interface AccountPopupEvent<M extends AccountPopupMessage>
 extends MessageEvent {
	data: M
}
