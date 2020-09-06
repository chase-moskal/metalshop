
export interface GoogleResult {
	name: string
	avatar: string
	googleId: string
}

export type VerifyGoogleToken = (googleToken: string) => Promise<GoogleResult>
