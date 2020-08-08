
// import {tokenSign} from "redcrypto/dist/token-sign.js"
// import {
// 	AccessPayload,
// 	RefreshPayload,
// } from "authoritarian/dist/interfaces.js"

// export async function createMockAccessToken({expiresMilliseconds}: {
// 	expiresMilliseconds: number
// }) {
// 	return tokenSign<AccessPayload>({
// 		privateKey,
// 		expiresMilliseconds,
// 		payload: {
// 			user: {
// 				userId: "123",
// 				claims: {},
// 			}
// 		},
// 	})
// }

// export async function createMockRefreshToken({expiresMilliseconds}: {
// 	expiresMilliseconds: number
// }) {
// 	return tokenSign<RefreshPayload>({
// 		privateKey,
// 		expiresMilliseconds,
// 		payload: {userId: "123"},
// 	})
// }

// export const privateKey = `-----BEGIN RSA PRIVATE KEY-----
// MIIJKQIBAAKCAgEAnHbuNcNWKAldKtOS1j6LUsWyeXGI6Nm3J5kd8tVA36nbCw5k
// FY8zD9eaettR+s+vxwLbc5q64BUSNp/WoXUoutInIFRKIZkE+afzbM0IhXMjWN0X
// jJnOvV0O5t3RZcwdBpoI47ptYImuqhLGoy8/wKBoE80BOBZNsrgpheNJEvOiZYCi
// XH2rPtXVjoZRIt7imu4hTezQpbiDUgLJqgiObn5L3vPaVHjC7nHPzGnQJRlnSKNg
// sajs421Tc5nIBCOj4SgLU5O6Tvo9/0c/mcVroCWbe5ta7iz6m3gw1zZiW69vX/S2
// 9NKmPtcHnoyAjjthe+hjXPWapi2D9zfGgQvTrV5acmNxZ1B+uLK6W46haKCQVdnt
// YhZ03soymyhiwL7YOabKHe+pRqGVFeGJ1yV1Ot0w9D+3UMdeyRYDVOJ8COolBMeS
// +3SYw8JqYhmgUTbA/2ABKXrSLgFjxbRHYEkKf54iamJbMkacPQB9LziszfDb0Kcy
// /jfTxSib/NQDd57EKUso5v1lUQv6YrkdmPR3ddDeqEECom2wQlaTswDUFlsvcb3g
// DjsHmY185yJrzkao3dLxmGRdth1aAL2yEZ7w3pHg+yD7J+8nPNSZ9+ZD/wdMb26w
// e5PeVnRGbK2pvK3iGz7KtsDemW1YQntzOEafFpinp9HkYVWHX/SGQKdP6+UCAwEA
// AQKCAgBr2Xa9TFX45ut3d7sBPr9eYLNzDpVmm5uqCdsg5WoAQd6gsly+l6SEyQLM
// qJzLm5j4Prnx57fkeeHCEU8qn81haTZbDH7ExesuA1zBpFq5UfINcOiom+RrlteM
// v111I8rmIAr8niaCoqToymRtW0ZAitDyxR6QAJ+yD0tf5JkcHR/Vg2NnCaCegVrh
// ESigNq5QSNBgHFp9wL+UKiPDtn4nH5tApSnbjBohrgWkS1OUHvyYjzU5gM04vsUF
// K/05DTALJUUZaPzFL6zIZ94pKnHTQ9j2zNFS12IvBBv2XKBTvouwwsfR3dmF+0Zf
// PU3nvHqnpDnJe+oLndgW8jU8AmD3TeSo38LAvX4EKMlmhAYkVv1KOq1Gk/ja6UEH
// QX6UsoPHjlwbRcxKSEIiqIatS5rI4vJF5kkq7t7vtl4ZTPqNAl36KW59c/6F0N1q
// Rc5IELopru8uxg+uTeA5c1HXRedETY1wa57M3yg1AX+vIAPQ7OZ0FvMq6Q4Wx/TN
// J277DoSiHFPTPigwWH3+Lkhr5+bjyCnCwbvmlyoOTTXsVdA5DmKdyz0JbiA0lwEy
// bMtkDW+KWKRwwCChgRf++9VwgePpXAcJWBGcxTk4otC8zys4/w/0l2CtaPbdB+Kj
// CYPv+GqKDXv0N8YrNrBc9rzun5IZmYOT+80M/oRwUWVEJf0PgQKCAQEAyfRZ84JS
// 9R5SVa33ilkYOzLbo3I7gflgqYXybIawp/4jEGdGdO2MA7idPnmPjvSJQ1n9vU3t
// XBHhN84JCkdSFhlaHrDXgBVag/eIUWdFqguGbyQpOjpj/SAk4gPMCK+nrjJLie5P
// shamYgknpGAapPLA8QeZMuYh/CIJWWVnPPJzGbUNaWj7nvPUCKYtnB7H8UjTenR5
// sCHerLWgB8GdcBKbeNZPqaFBbNprl4TmG5kkFa22dXnLFoR/35otS3LYY++0pD0a
// c5UeWGRewsMaZrG/DT2KHdvsXX+FqJ13EDEgKyaqlpxi0P8HxjDGWqTQIlsvrD5A
// FBpAYgEwhydUkQKCAQEAxlYfHzRLCrhJCblClbdOLe7RLa1o4GaCL0AQzJnNsFJ/
// 741eaSJYm90z53TYyRu9TJHPR4l9k+NWhnwFos0ZZ+Qy5azMQBDKuxHe91W+UHqc
// 5bStKtoRaWfGqBsOjrngpf8pKiXF588Wjuv8ENIHFZoDRTJmWBRvN/irc0uBM/9t
// 5lfBZyENh9+zZf++N5Y2iD+Y4830xKuWrowQb4Un2sJ1gzYf1zgQTB/REZKzwV0A
// bZsOMGSJsThbkYezDMcB+ZPOy2IeQ3e+6saPxBr9ErWHnb/xDhNWBgzIR/sR5aud
// /acktGIirkgA8ailmg093KBVA+ywyowyQGtCFwQ8FQKCAQEAmBeaFrWzXD61qykV
// H+/xO8QVfYZuInh4v7LM28akDCBsr9HXUgAETlkeswpBf1vSdBK18XdaptggUTKt
// xDvqKhJ1uF9eLGvoezJUS1oHMQT0/YayNdP7sYofvMc3ReNj2OCv2vTKuEguje5v
// GG/4IPlhLSSXz6lZNtU7TUP89/1viZC8xQH3XcIrkUf1WXolAiXifnpxmqAnXtJ5
// 7t11gA3DYMGlxQ5Yg24LUVUZJveyIVFt9BMBS7gFxZQLQKMBLGI+HOKXpSxMai1M
// 4Eim/WgnhgUum0YhQFjlhBLytBMLMvQvzLWCBfvLEwtwlptA1F7wDDvlbj5G9ogG
// 0AJiwQKCAQBsYDTjVSzIL8jhQlUrAB39JWkx33bWX801Snmjg0uM1JfJ62Kyai0n
// BilNiWDIC5tV0rsD6RIwlGH8XJqrygze4ygYrmJxg3tz2yEN39F9onJHZoHVT5GC
// Gk3IH/jFbrZdnl79A+TvdQ5rjHGRM2Lhn+W3kwGvkYLwf7YX6yMvqZyA6GTrGHmP
// TGJ4EtX7A97Kdo3xtOHR8b0Fpc15UrZjaCzUROgDL0RghGY2hwYoW8xXGAoZ0WYX
// 66bFj/P7wGbI3MZ8BiJpVW6CVXvLeb/d0EnJnk93FIPGDIgIJR4zdKKBLyr0UkeH
// GhtB8ZiD5EZwXz/1RAmatB7lanaToyG9AoIBAQCW1quoPKJEM/7jPfNodZ69qhzg
// gxFeDDJnlj1ID24bNDnw3LrXeluF3y6JAMKEKsWpW8EbNDRejZv8iQJ0/bghSlDG
// 572iWMviB0cfKsEwUwpOXjFe43VZY+2TscSMnWc3Iir7K5hEfkHgyXS946l4UmDh
// jAzXxap/Z2iAVNzfMSIEnn1jXjXflw5MBvqjKK9AOJE2ESPOy9PX5d70aD3YkfOI
// tov2wWquVzWw0/aT+B8XWJ+AkYhKaxPvd8bBfvUNcuoTH7p8N3fKizC/15OL89hr
// fl4QSQiidpxM/ruGqNgch9St8v3FgSDnwZIkEEdfmRzkgwRIBCW8/AoDyZj6
// -----END RSA PRIVATE KEY-----
// `

// export const publicKey = `-----BEGIN PUBLIC KEY-----
// MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAnHbuNcNWKAldKtOS1j6L
// UsWyeXGI6Nm3J5kd8tVA36nbCw5kFY8zD9eaettR+s+vxwLbc5q64BUSNp/WoXUo
// utInIFRKIZkE+afzbM0IhXMjWN0XjJnOvV0O5t3RZcwdBpoI47ptYImuqhLGoy8/
// wKBoE80BOBZNsrgpheNJEvOiZYCiXH2rPtXVjoZRIt7imu4hTezQpbiDUgLJqgiO
// bn5L3vPaVHjC7nHPzGnQJRlnSKNgsajs421Tc5nIBCOj4SgLU5O6Tvo9/0c/mcVr
// oCWbe5ta7iz6m3gw1zZiW69vX/S29NKmPtcHnoyAjjthe+hjXPWapi2D9zfGgQvT
// rV5acmNxZ1B+uLK6W46haKCQVdntYhZ03soymyhiwL7YOabKHe+pRqGVFeGJ1yV1
// Ot0w9D+3UMdeyRYDVOJ8COolBMeS+3SYw8JqYhmgUTbA/2ABKXrSLgFjxbRHYEkK
// f54iamJbMkacPQB9LziszfDb0Kcy/jfTxSib/NQDd57EKUso5v1lUQv6YrkdmPR3
// ddDeqEECom2wQlaTswDUFlsvcb3gDjsHmY185yJrzkao3dLxmGRdth1aAL2yEZ7w
// 3pHg+yD7J+8nPNSZ9+ZD/wdMb26we5PeVnRGbK2pvK3iGz7KtsDemW1YQntzOEaf
// Fpinp9HkYVWHX/SGQKdP6+UCAwEAAQ==
// -----END PUBLIC KEY-----
// `
