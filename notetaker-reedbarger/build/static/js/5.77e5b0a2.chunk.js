(this.webpackJsonpnotetaker=this.webpackJsonpnotetaker||[]).push([[5],{202:function(t,e,n){"use strict";n.r(e),n.d(e,"amplify_authenticator",(function(){return m}));var a,r=n(8),i=n(22),o=n(36),s=n(27),u=n(14),c=n(51),l=(n(4),n(16)),h=n(82),f=n(255),d=function(t,e,n,a){return new(n||(n=Promise))((function(r,i){function o(t){try{u(a.next(t))}catch(e){i(e)}}function s(t){try{u(a.throw(t))}catch(e){i(e)}}function u(t){var e;t.done?r(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(o,s)}u((a=a.apply(t,e||[])).next())}))},g=function(t,e){var n,a,r,i,o={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"===typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(i){return function(s){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;o;)try{if(n=1,a&&(r=2&i[0]?a.return:i[0]?a.throw||((r=a.return)&&r.call(a),0):a.next)&&!(r=r.call(a,i[1])).done)return r;switch(a=0,r&&(i=[2&i[0],r.value]),i[0]){case 0:case 1:r=i;break;case 4:return o.label++,{value:i[1],done:!1};case 5:o.label++,a=i[1],i=[0];continue;case 7:i=o.ops.pop(),o.trys.pop();continue;default:if(!(r=(r=o.trys).length>0&&r[r.length-1])&&(6===i[0]||2===i[0])){o=0;continue}if(3===i[0]&&(!r||i[1]>r[0]&&i[1]<r[3])){o.label=i[1];break}if(6===i[0]&&o.label<r[1]){o.label=r[1],r=i;break}if(r&&o.label<r[2]){o.label=r[2],o.ops.push(i);break}r[2]&&o.ops.pop(),o.trys.pop();continue}i=e.call(t,o)}catch(s){i=[6,s],a=0}finally{n=r=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,s])}}},p=((a={})[s.a.SignIn]="sign-in",a[s.a.ConfirmSignIn]="confirm-sign-in",a[s.a.SignUp]="sign-up",a[s.a.ConfirmSignUp]="confirm-sign-up",a[s.a.ForgotPassword]="forgot-password",a[s.a.ResetPassword]="require-new-password",a[s.a.VerifyContact]="verify-contact",a[s.a.TOTPSetup]="totp-setup",a[s.a.Loading]="loading",a),b=new i.a("Authenticator"),m=function(){function t(t){var e=this;Object(r.k)(this,t),this.initialAuthState=s.a.SignIn,this.handleAuthStateChange=function(){},this.authState=s.a.Loading,this.toastMessage="",this.handleExternalAuthEvent=function(t){var n=t.payload;switch(n.event){case"cognitoHostedUI":case"signIn":Object(f.a)(n.data,h.d);break;case"cognitoHostedUI_failure":case"parsingUrl_failure":case"signOut":case"customGreetingSignOut":return Object(h.d)(e.initialAuthState)}},this.handleToastEvent=function(t){var n=t.payload;switch(n.event){case l.h:n.message&&(e.toastMessage=n.message)}}}return t.prototype.componentWillLoad=function(){return d(this,void 0,void 0,(function(){var t,e=this;return g(this,(function(n){switch(n.label){case 0:return Object(h.h)((function(t,n){e.onAuthStateChange(t,n),e.toastMessage=""})),o.a.listen(l.i,this.handleToastEvent),o.a.listen(l.a,this.handleExternalAuthEvent),Object(u.j)("amplify-authenticator"),t=localStorage.getItem(l.f),localStorage.removeItem(l.f),"true"===t?[3,2]:[4,this.checkUser()];case 1:n.sent(),n.label=2;case 2:return[2]}}))}))},t.prototype.checkUser=function(){return d(this,void 0,void 0,(function(){var t=this;return g(this,(function(e){if(!c.a||"function"!==typeof c.a.currentAuthenticatedUser)throw new Error(l.d);return[2,c.a.currentAuthenticatedUser().then((function(t){Object(h.d)(s.a.SignedIn,t)})).catch((function(){return d(t,void 0,void 0,(function(){var t,e;return g(this,(function(n){switch(n.label){case 0:t=null;try{t=localStorage.getItem(l.l)}catch(a){b.debug("Failed to get the auth state from local storage",a)}n.label=1;case 1:return n.trys.push([1,4,,5]),t!==s.a.SignedIn?[3,3]:[4,c.a.signOut()];case 2:n.sent(),n.label=3;case 3:return Object(h.d)(this.initialAuthState),[3,5];case 4:return e=n.sent(),b.debug("Failed to sign out",e),[3,5];case 5:return[2]}}))}))}))]}))}))},t.prototype.onAuthStateChange=function(t,e){return d(this,void 0,void 0,(function(){return g(this,(function(n){return void 0===t?[2,b.error("nextAuthState cannot be undefined")]:(b.info("Inside onAuthStateChange Method current authState:",this.authState),t===s.a.SignedOut?this.authState=this.initialAuthState:this.authState=t,this.authData=e,this.authData&&b.log("Auth Data was set:",this.authData),this.authState===t&&(this.handleAuthStateChange(this.authState,this.authData),b.info("authState has been updated to "+this.authState)),[2])}))}))},t.prototype.getAuthComponent=function(t){switch(t){case s.a.SignIn:return Object(r.i)("amplify-sign-in",{federated:this.federated,usernameAlias:this.usernameAlias});case s.a.ConfirmSignIn:return Object(r.i)("amplify-confirm-sign-in",{user:this.authData});case s.a.SignUp:return Object(r.i)("amplify-sign-up",{usernameAlias:this.usernameAlias});case s.a.ConfirmSignUp:return Object(r.i)("amplify-confirm-sign-up",{user:this.authData,usernameAlias:this.usernameAlias});case s.a.ForgotPassword:return Object(r.i)("amplify-forgot-password",{usernameAlias:this.usernameAlias});case s.a.ResetPassword:return Object(r.i)("amplify-require-new-password",{user:this.authData});case s.a.VerifyContact:return Object(r.i)("amplify-verify-contact",{user:this.authData});case s.a.TOTPSetup:return Object(r.i)("amplify-totp-setup",{user:this.authData});case s.a.Loading:return Object(r.i)("div",null,"Loading...");default:throw new Error("Unhandled auth state: "+t)}},t.prototype.getSlotWithAuthComponent=function(t){var e=this.getAuthComponent(t),n=p[t],a=null===this.el.querySelector('[slot="'+n+'"]');return Object(r.i)("slot",{name:n},a&&e)},t.prototype.componentWillUnload=function(){return o.a.remove(l.a,this.handleExternalAuthEvent),o.a.remove(l.i,this.handleToastEvent),h.h},t.prototype.render=function(){var t=this;return Object(r.i)(r.b,null,this.toastMessage?Object(r.i)("amplify-toast",{message:this.toastMessage,handleClose:function(){t.toastMessage=""},"data-test":"authenticator-error"}):null,this.authState===s.a.SignedIn?[Object(r.i)("slot",{name:"greetings"}),Object(r.i)("slot",null)]:Object(r.i)("div",{class:"auth-container"},this.getSlotWithAuthComponent(this.authState)))},Object.defineProperty(t.prototype,"el",{get:function(){return Object(r.h)(this)},enumerable:!1,configurable:!0}),t}();m.style=":host{--background-color:var(--amplify-background-color);--width:28.75rem;--min-width:20rem;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;--box-shadow:1px 1px 4px 0 rgba(0, 0, 0, 0.15);--border-radius:6px;--padding:35px 40px;--margin-bottom:20px;--container-height:100vh;--container-display:flex;--container-justify:center;--container-align:center}.auth-container{display:var(--container-display);-ms-flex-pack:var(--container-justify);justify-content:var(--container-justify);-ms-flex-align:var(--container-align);align-items:var(--container-align);min-height:var(--container-height)}"},255:function(t,e,n){"use strict";n.d(e,"a",(function(){return g})),n.d(e,"b",(function(){return p}));var a=n(22),r=n(18),i=n(27),o=n(51),s=n(14),u=n(4),c=n(16),l=n(82),h=function(t,e,n,a){return new(n||(n=Promise))((function(r,i){function o(t){try{u(a.next(t))}catch(e){i(e)}}function s(t){try{u(a.throw(t))}catch(e){i(e)}}function u(t){var e;t.done?r(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(o,s)}u((a=a.apply(t,e||[])).next())}))},f=function(t,e){var n,a,r,i,o={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"===typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(i){return function(s){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;o;)try{if(n=1,a&&(r=2&i[0]?a.return:i[0]?a.throw||((r=a.return)&&r.call(a),0):a.next)&&!(r=r.call(a,i[1])).done)return r;switch(a=0,r&&(i=[2&i[0],r.value]),i[0]){case 0:case 1:r=i;break;case 4:return o.label++,{value:i[1],done:!1};case 5:o.label++,a=i[1],i=[0];continue;case 7:i=o.ops.pop(),o.trys.pop();continue;default:if(!(r=(r=o.trys).length>0&&r[r.length-1])&&(6===i[0]||2===i[0])){o=0;continue}if(3===i[0]&&(!r||i[1]>r[0]&&i[1]<r[3])){o.label=i[1];break}if(6===i[0]&&o.label<r[1]){o.label=r[1],r=i;break}if(r&&o.label<r[2]){o.label=r[2],o.ops.push(i);break}r[2]&&o.ops.pop(),o.trys.pop();continue}i=e.call(t,o)}catch(s){i=[6,s],a=0}finally{n=r=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,s])}}},d=new a.a("auth-helpers");function g(t,e){return h(this,void 0,void 0,(function(){var n,a,s;return f(this,(function(u){switch(u.label){case 0:if(!o.a||"function"!==typeof o.a.verifiedContact)throw new Error(c.d);if(!b(t))return e(i.a.SignedIn,t),[2];u.label=1;case 1:return u.trys.push([1,3,,4]),[4,o.a.verifiedContact(t)];case 2:return n=u.sent(),!Object(r.d)(n.verified)||Object(r.d)(n.unverified)?e(i.a.SignedIn,t):(a=Object.assign(t,n),e(i.a.VerifyContact,a)),[3,4];case 3:return s=u.sent(),Object(l.a)(s),[3,4];case 4:return[2]}}))}))}var p=function(t,e,n){return h(void 0,void 0,void 0,(function(){var a,r;return f(this,(function(s){switch(s.label){case 0:if(!o.a||"function"!==typeof o.a.signIn)throw new Error(c.d);s.label=1;case 1:return s.trys.push([1,9,,10]),[4,o.a.signIn(t,e)];case 2:return a=s.sent(),d.debug(a),a.challengeName!==i.b.SMSMFA&&a.challengeName!==i.b.SoftwareTokenMFA?[3,3]:(d.debug("confirm user with "+a.challengeName),n(i.a.ConfirmSignIn,a),[3,8]);case 3:return a.challengeName!==i.b.NewPasswordRequired?[3,4]:(d.debug("require new password",a.challengeParam),n(i.a.ResetPassword,a),[3,8]);case 4:return a.challengeName!==i.b.MFASetup?[3,5]:(d.debug("TOTP setup",a.challengeParam),n(i.a.TOTPSetup,a),[3,8]);case 5:return a.challengeName===i.b.CustomChallenge&&a.challengeParam&&"true"===a.challengeParam.trigger?(d.debug("custom challenge",a.challengeParam),n(i.a.CustomConfirmSignIn,a),[3,8]):[3,6];case 6:return[4,g(a,n)];case 7:s.sent(),s.label=8;case 8:return[3,10];case 9:return"UserNotConfirmedException"===(r=s.sent()).code?(d.debug("the user is not confirmed"),n(i.a.ConfirmSignUp,{username:t})):"PasswordResetRequiredException"===r.code?(d.debug("the user requires a new password"),n(i.a.ForgotPassword,{username:t})):"InvalidParameterException"===r.code&&""===e&&(d.debug("Password cannot be empty"),r.message=u.a.EMPTY_PASSWORD),Object(l.a)(r),[3,10];case 10:return[2]}}))}))},b=function(t){return t instanceof s.e}}}]);
//# sourceMappingURL=5.77e5b0a2.chunk.js.map