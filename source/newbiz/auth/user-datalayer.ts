
import {DbbyTable} from "../../toolbox/dbby/types.js"
import {concurrent} from "../../toolbox/concurrent.js"

import {
	User,
	BanRow,
	TagRow,
	ClaimRow,
	AccountRow,
	ProfileRow,
	UserDatalayer,
	PremiumGiftRow,
	StripePremiumRow,
} from "../../types.js"

async function assembleUser({
		accountRow,
		claimRow,
		profileRow,
		stripePremiumRow,
		premiumGiftRow,
		banRow,
		tagRows,
	}: {
		accountRow: AccountRow
		claimRow: ClaimRow
		profileRow: ProfileRow
		stripePremiumRow: StripePremiumRow
		premiumGiftRow: PremiumGiftRow
		banRow: BanRow
		tagRows: TagRow[]
	}): Promise<User> {
	return {
		userId: accountRow.userId,
		claims: {
			joined: accountRow.joined,
			admin: claimRow.admin,
			staff: claimRow.staff,
			moderator: claimRow.moderator,
			banUntil: banRow?.until,
			banReason: banRow?.reason,
			tags: tagRows.map(row => row.tag),
			premiumUntil: stripePremiumRow?.until || premiumGiftRow?.until,
		},
		profile: {
			nickname: profileRow.nickname,
			avatarPublicity: profileRow.avatarPublicity,
			tagline: profileRow.tagline,
			avatar: profileRow.avatar,
			colors: profileRow.colors,
		},
	}
}

export function makeUserDatalayer({
		accountTable,
		claimTable,
		profileTable,
		banTable,
		tagTable,
		premiumGiftTable,
		stripePremiumTable,
		generateNickname,
	}: {
		accountTable: DbbyTable<AccountRow>
		claimTable: DbbyTable<ClaimRow>
		profileTable: DbbyTable<ProfileRow>
		banTable: DbbyTable<BanRow>
		tagTable: DbbyTable<TagRow>
		stripePremiumTable: DbbyTable<StripePremiumRow>
		premiumGiftTable: DbbyTable<PremiumGiftRow>
		generateNickname: () => string
	}): UserDatalayer {
	return {

		async getUser({userId}) {
			const userIdConditions = {conditions: {equal: {userId}}}
			const accountRow = await accountTable.one(userIdConditions)
			return assembleUser({
				accountRow,
				...await concurrent({
					claimRow: claimTable.one(userIdConditions),
					profileRow: profileTable.one(userIdConditions),
					stripePremiumRow: stripePremiumTable.one(userIdConditions),
					premiumGiftRow: premiumGiftTable.one(userIdConditions),
					banRow: banTable.one(userIdConditions),
					tagRows: tagTable.read(userIdConditions),
				}),
			})
		},

		async assertUser({avatar, accountRow}) {
			const {userId} = accountRow
			const userIdConditions = {conditions: {equal: {userId}}}
			return assembleUser({
				accountRow,
				...await concurrent({
					claimRow: claimTable.assert({
						...userIdConditions,
						make: () => ({
							userId,
							admin: false,
							moderator: false,
							staff: false,
						}),
					}),
					profileRow: profileTable.assert({
						...userIdConditions,
						make: () => ({
							userId,
							avatar,
							avatarPublicity: true,
							nickname: generateNickname(),
							tagline: "",
							colors: "",
						}),
					}),
					stripePremiumRow: stripePremiumTable.one(userIdConditions),
					premiumGiftRow: premiumGiftTable.one(userIdConditions),
					banRow: banTable.one(userIdConditions),
					tagRows: tagTable.read(userIdConditions),
				}),
			})
		},
	}
}
