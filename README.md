
# 🤘 metalshop

&nbsp; &nbsp; 🕹 live demo: https://metalshop.dev  
&nbsp; &nbsp; 🧪 [codepen demo](https://codepen.io/ChaseMoskal/pen/gOrbxRv?editors=1000) shows drop-in html usage  

**open source web components, microservices, and infrastructure**  
hello, my name is chase. metalshop is my dream project to perfect the art of building modern high-end cross-domain microservice-oriented isomorphic web applications. metalshop is a library, and this repository contains everything: frontend, backend, even continuous deployment. features like auth, users, profiles, paywalls and premium subscriptions, community features like forums and questions boards — you get it

**start making apps with plug-and-play html components**  
metalshop is an easy-to-use extensible web-app starter kit, enabling webdevs from junior to expert to get started quickly and easily by plunking down html web components onto any webpage. there's a focus on developer experience, leveraging latest technologies, and exploring best practices. it's easy for juniors to use, but you can take the training wheels off: this is real heavy-duty app developer stuff

**looking for collaborators**  
of course, i'm building my own apps with metalshop. and you should too! join me and we can collaborate together on new features so everybody can benefit. what features would interest you for your own app ideas? we currently need help designing new features, building new web components, and writing business logic for the microservices, kubernetes, and more  
&nbsp; &nbsp; 📌 post a github issue if you have any questions  
&nbsp; &nbsp; 👉😎👉 [join my discord](https://discord.gg/YfmhMZU) and give me a shoutout!  

**🤖 let's build next-gen web apps together with es-modules!**  
&nbsp; &nbsp; 🌈 obsessive focus on idyllic developer experience  
&nbsp; &nbsp; ⛲ big features as simple html web components  
&nbsp; &nbsp; 🖧 node microservices: orchestrated kubernetes backend  
&nbsp; &nbsp; 🔐 authentication and authorization: google login, token based  
&nbsp; &nbsp; ♻️ isomorphic: robust mock mode runs all business logic on frontend  
&nbsp; &nbsp; 🃏 standardized user profiles: nicknames, avatars, stuff like that  
&nbsp; &nbsp; 💳 paywalls and subscriptions: collecting the big bucks via stripe  
&nbsp; &nbsp; 📺 private livestreams: for premium subscribers, via vimeo  
&nbsp; &nbsp; 🎉 community-building features: questions board and more  

**📦 npm package: `metalshop`**  
&nbsp; &nbsp; 🚧 under construction: current work in progress!  
&nbsp; &nbsp; 🎓 better documentation and readme: coming eventually  

**🎁 "metalfront" web components**  
&nbsp; &nbsp; i really need to document these  
&nbsp; &nbsp; some of them require certain attributes or properties  
&nbsp; &nbsp; come talk to me on the discord, link above somewhere  

&nbsp; &nbsp; `<metal-config>` — *configure metalshop, server urls and stuff*  

&nbsp; &nbsp; `<metal-account>` — *login, logout*  
&nbsp; &nbsp; `<metal-personal>` — *user's own editable profile panel*  
&nbsp; &nbsp; `<metal-my-avatar>` — *user's own display picture*  

&nbsp; &nbsp; `<metal-questions>` — *questions board, forum to post or like questions*  
&nbsp; &nbsp; `<metal-paywall>` — *user can manage their premium subscription*  
&nbsp; &nbsp; `<metal-liveshow>` — *private livestream for privileged users*  
&nbsp; &nbsp; `<metal-countdown>` — *countdown timer, handy for the liveshow*  

&nbsp; &nbsp; `<cobalt-avatar>` — *display any user's avatar*  
&nbsp; &nbsp; `<cobalt-card>` — *display any user's profile info*  

&nbsp; &nbsp; `<metal-button-auth>` — *button to login or logout*  
&nbsp; &nbsp; `<metal-button-premium>` — *button to login and subscribe to premium*  

&nbsp; &nbsp; `<metal-is-loggedin>` — *display any dom content when user is logged in*  
&nbsp; &nbsp; `<metal-is-premium>` — *display any dom content when user is subscribed*  
&nbsp; &nbsp; `<metal-is-staff>` — *display any dom content when user is a staff member*  

**🐋 "metalback" microservices**  
&nbsp; &nbsp; ⭐ metalback/ — *metalshop's helm chart for kubernetes*  
&nbsp; &nbsp; auth-server — *authentication and authorization, user profiles*  
&nbsp; &nbsp; paywall-server — *payments and subscriptions*  
&nbsp; &nbsp; settings-server — *private user settings*  
&nbsp; &nbsp; schedule-server — *save/load timestamps*  
&nbsp; &nbsp; questions-server — *interact with questions forum*  
&nbsp; &nbsp; liveshow-server — *privileged access to a video livestream*  

**🛠️ metalshop-related libraries and tools**  
&nbsp; &nbsp; [renraku](https://github.com/chase-moskal/renraku) — *json-rpc api*  
&nbsp; &nbsp; [cynic](https://github.com/chase-moskal/renraku) — *async esmodule testing framework*  
&nbsp; &nbsp; [redcrypto](https://github.com/chase-moskal/redcrypto) — *token crypto*  
&nbsp; &nbsp; [crosscall](https://github.com/chase-moskal/crosscall) — *cross-domain frame rpc*  
&nbsp; &nbsp; [menutown](https://github.com/chase-moskal/menutown) — *top-right menu components*  
&nbsp; &nbsp; [importly](https://github.com/chase-moskal/importly) — *importmap generator*  
&nbsp; &nbsp; dist/toolbox/dbby/ — *agnostic mockable database adapter*  
&nbsp; &nbsp; dist/toolbox/logger/ — *handy logger utility*  
&nbsp; &nbsp; dist/toolbox/concurrent.js — *handy utility for groups of promises*  

**💐 metalshop is open source love**  
&nbsp; &nbsp; *please contribute, ask questions by submitting issues!*  
&nbsp; &nbsp; &nbsp; &nbsp; 👋😎 chase  
