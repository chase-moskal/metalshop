
# 🤘 metalshop

hi, i'm chase! metalshop is my project to build high-end modern cross-domain typescript-oriented web applications and all of the associated infrastructure. from frontend to backend, deployment and all. aiming at idyllic developer-experience, leveraging latest technologies, exploring best practices, and entirely open source. the goal is a plug-and-play extensible web-app starter kit which enables web devs, from junior to expert, to plunk down some really cool web components on any web page to get started quickly building their own ripped and sweet web apps

i'm building my own apps with metalshop, but i invite you join me and build your own web app, so that we can collaborate together on new features so everybody can benefit. what features would you be interested in for your own app ideas? join my [discord](https://discord.gg/YfmhMZU) and give me a shoutout

my focus is launching my own apps and working on metalshop's fundamentals, so documentation and tutorials will be coming later

**🤖 let's build next-gen web apps together with es-modules!**  
&nbsp; &nbsp; ⛲ features as web components: drop-in ready-made ui  
&nbsp; &nbsp; 🖧 node microservices: orchestrated kubernetes backend  
&nbsp; &nbsp; ♻️ isomorphic: awesome mock mode runs business logic on frontend  
&nbsp; &nbsp; 🔐 authentication and authorization: token-based logins  
&nbsp; &nbsp; 🃏 standardized user profiles: nicknames, avatars, stuff like that  
&nbsp; &nbsp; 💳 paywalls and subscriptions: collecting the big bucks via stripe  
&nbsp; &nbsp; 📺 private livestreams: for premium subscribers, via vimeo  
&nbsp; &nbsp; 🎉 community-building features: questions board and more  

**📦 npm package: `metalshop`**  
&nbsp; &nbsp; 🕹 live demo: https://metalshop.chasemoskal.com  
&nbsp; &nbsp; 🚧 under construction: current work in progress!  
&nbsp; &nbsp; 🎓 documentation: yet to be seen  

**🎁 "metalfront" web components**  
&nbsp; &nbsp; `<metal-config>` — *configure metalshop, server urls and stuff*  

&nbsp; &nbsp; `<metal-account>` — *login, logout*  
&nbsp; &nbsp; `<metal-personal>` — *user's own profile panel*  
&nbsp; &nbsp; `<metal-my-avatar>` — *user's own display picture*  

&nbsp; &nbsp; `<metal-paywall>` — *user can manage their premium subscription*  
&nbsp; &nbsp; `<metal-liveshow>` — *private livestream for privileged users*  
&nbsp; &nbsp; `<metal-countdown>` — *countdown timer, handy for the liveshow*  
&nbsp; &nbsp; `<metal-questions>` — *simple forum to rate or post questions*  

&nbsp; &nbsp; `<cobalt-avatar>` — *display a user's avatar*  
&nbsp; &nbsp; `<cobalt-card>` — *display a user's profile info*  

&nbsp; &nbsp; `<metal-button-auth>` — *button to login or logout*  
&nbsp; &nbsp; `<metal-button-premium>` — *button to login and subscribe to premium*  

&nbsp; &nbsp; `<metal-is-loggedin>` — *display contents when user is logged in*  
&nbsp; &nbsp; `<metal-is-premium>` — *display contents when user is subscribed*  
&nbsp; &nbsp; `<metal-is-staff>` — *display contents when user is a staff member*  

**🐋 "metalback" microservices**  
&nbsp; &nbsp; ⭐ metalback/ — *metalshop's helm chart for kubernetes*  
&nbsp; &nbsp; [auth-server](https://github.com/chase-moskal/auth-server) — *authentication and authorization*  
&nbsp; &nbsp; [profile-server](https://github.com/chase-moskal/profile-server) — *save/load public profile info*  
&nbsp; &nbsp; paywall-server — *payments and subscriptions*  
&nbsp; &nbsp; schedule-server — *save/load timestamps*  
&nbsp; &nbsp; questions-server — *interact with questions forum*  
&nbsp; &nbsp; liveshow-server — *privileged access to a video livestream*  

**🛠️ metalshop-related libraries and tools**  
&nbsp; &nbsp; [renraku](https://github.com/chase-moskal/renraku) — *json-rpc api*  
&nbsp; &nbsp; [cynic](https://github.com/chase-moskal/renraku) — *async esmodule testing framework*  
&nbsp; &nbsp; [redcrypto](https://github.com/chase-moskal/redcrypto) — *token crypto*  
&nbsp; &nbsp; [crosscall](https://github.com/chase-moskal/crosscall) — *cross-domain frame rpc*  
&nbsp; &nbsp; [menutown](https://github.com/chase-moskal/menutown) — *menu system*  
&nbsp; &nbsp; [importly](https://github.com/chase-moskal/importly) — *importmap generator*  
&nbsp; &nbsp; dist/toolbox/dbby/ — *agnostic mockable database adapter*  
&nbsp; &nbsp; dist/toolbox/logger/ — *handy logger utility*  
&nbsp; &nbsp; dist/toolbox/concurrent.js — *handy utility for groups of promises*  

**💐 metalshop is open source love**  
&nbsp; &nbsp; *please contribute, ask questions by submitting issues!*  
&nbsp; &nbsp; &nbsp; &nbsp; 👋😎 chase  
