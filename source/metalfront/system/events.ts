
import {GetAuthContext} from "../types.js"
import {MetalUser, MetalProfile} from "../../types.js"

export class UserLogoutEvent extends CustomEvent<{}> {}
export class UserLoadingEvent extends CustomEvent<{}> {}
export class UserErrorEvent extends CustomEvent<{error: Error}> {}
export class UserLoginEvent extends CustomEvent<{getAuthContext: GetAuthContext<MetalUser>}> {}

export class ProfileUpdateEvent extends CustomEvent<{profile: MetalProfile}> {}
export class ProfileErrorEvent extends CustomEvent<{error: Error}> {}
