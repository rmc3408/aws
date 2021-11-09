(this.webpackJsonpnotetaker=this.webpackJsonpnotetaker||[]).push([[0],{188:function(t,n,e){var i={"./amplify-amazon-button_5.entry.js":[200,16],"./amplify-auth-fields_9.entry.js":[201,17],"./amplify-authenticator.entry.js":[202,5],"./amplify-button_3.entry.js":[203,18],"./amplify-chatbot.entry.js":[204,4],"./amplify-checkbox.entry.js":[205,19],"./amplify-confirm-sign-in_7.entry.js":[206,6],"./amplify-container.entry.js":[207,20],"./amplify-federated-buttons_2.entry.js":[208,21],"./amplify-federated-sign-in.entry.js":[209,22],"./amplify-form-field_4.entry.js":[210,23],"./amplify-greetings.entry.js":[211,24],"./amplify-icon-button.entry.js":[212,25],"./amplify-icon.entry.js":[213,7],"./amplify-link.entry.js":[214,26],"./amplify-nav_2.entry.js":[215,27],"./amplify-photo-picker.entry.js":[216,28],"./amplify-picker.entry.js":[217,29],"./amplify-radio-button_2.entry.js":[218,8],"./amplify-s3-album.entry.js":[219,9],"./amplify-s3-image-picker.entry.js":[220,10],"./amplify-s3-image.entry.js":[221,11],"./amplify-s3-text-picker.entry.js":[222,12],"./amplify-s3-text.entry.js":[223,13],"./amplify-select-mfa-type.entry.js":[224,30],"./amplify-sign-in-button.entry.js":[225,14],"./amplify-toast.entry.js":[226,31],"./amplify-tooltip.entry.js":[227,32]};function a(t){if(!e.o(i,t))return Promise.resolve().then((function(){var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}));var n=i[t],a=n[0];return e.e(n[1]).then((function(){return e(a)}))}a.keys=function(){return Object.keys(i)},a.id=188,t.exports=a},196:function(t,n,e){"use strict";e.r(n);var i=e(11),a=e.n(i),r=e(113),o=e.n(r),c=e(26),s=e.n(c),u=e(46),p=e(123),d=e(73),l=e(251),f=e(252),j=e(112),b=e(195),y=e(15),m=Object(f.a)((function(){var t=Object(i.useState)(void 0),n=Object(d.a)(t,2),e=n[0],a=n[1],r=Object(i.useState)(""),o=Object(d.a)(r,2),c=o[0],f=o[1],m=Object(i.useState)([]),h=Object(d.a)(m,2),O=h[0],x=h[1];Object(i.useEffect)((function(){v();var t=j.a.graphql(Object(b.b)("\n  subscription OnCreateNote {\n    onCreateNote {\n      id\n      note\n      createdAt\n      updatedAt\n    }\n  }\n")).subscribe({next:function(t){var n=t.value.data.onCreateNote;x((function(t){var e=t.filter((function(t){return t.id!==n.id}));return[].concat(Object(p.a)(e),[n])})),f("")}}),n=j.a.graphql(Object(b.b)("\n  subscription OnDeleteNote {\n    onDeleteNote {\n      id\n      note\n      createdAt\n      updatedAt\n    }\n  }\n")).subscribe({next:function(t){return O.filter((function(n){return n.id!==t.value.data.onDeleteNote.id}))}}),e=j.a.graphql(Object(b.b)("\n  subscription OnUpdateNote {\n    onUpdateNote {\n      id\n      note\n      createdAt\n      updatedAt\n    }\n  }\n")).subscribe({next:function(t){var n=t.value.data.onUpdateNote;x((function(t){var e=t.findIndex((function(t){return t.id===n.id}));return t.splice(e,1,n),t})),a(""),f("")}});return function(){t.unsubscribe(),n.unsubscribe(),e.unsubscribe()}}),[O]);var v=function(){var t=Object(u.a)(s.a.mark((function t(){var n;return s.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,j.a.graphql(Object(b.b)("\n  query ListNotes(\n    $filter: ModelNoteFilterInput\n    $limit: Int\n    $nextToken: String\n  ) {\n    listNotes(filter: $filter, limit: $limit, nextToken: $nextToken) {\n      items {\n        id\n        note\n        createdAt\n        updatedAt\n      }\n      nextToken\n    }\n  }\n"));case 2:n=t.sent,x(n.data.listNotes.items);case 4:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}(),N=function(){var t=Object(u.a)(s.a.mark((function t(n){var i;return s.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(n.preventDefault(),!(e&&O.findIndex((function(t){return t.id===e}))>-1)){t.next=5;break}_(),t.next=8;break;case 5:return i={note:c},t.next=8,j.a.graphql(Object(b.b)("\n  mutation CreateNote(\n    $input: CreateNoteInput!\n    $condition: ModelNoteConditionInput\n  ) {\n    createNote(input: $input, condition: $condition) {\n      id\n      note\n      createdAt\n      updatedAt\n    }\n  }\n",{input:i}));case 8:case"end":return t.stop()}}),t)})));return function(n){return t.apply(this,arguments)}}(),_=function(){var t=Object(u.a)(s.a.mark((function t(){return s.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,j.a.graphql(Object(b.b)("\n  mutation UpdateNote(\n    $input: UpdateNoteInput!\n    $condition: ModelNoteConditionInput\n  ) {\n    updateNote(input: $input, condition: $condition) {\n      id\n      note\n      createdAt\n      updatedAt\n    }\n  }\n",{input:{id:e,note:c}}));case 2:a(""),f("");case 4:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}(),g=function(){var t=Object(u.a)(s.a.mark((function t(n){var e;return s.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return e={id:n},t.next=3,j.a.graphql(Object(b.b)("\n  mutation DeleteNote(\n    $input: DeleteNoteInput!\n    $condition: ModelNoteConditionInput\n  ) {\n    deleteNote(input: $input, condition: $condition) {\n      id\n      note\n      createdAt\n      updatedAt\n    }\n  }\n",{input:e}));case 3:case"end":return t.stop()}}),t)})));return function(n){return t.apply(this,arguments)}}(),k=function(){var t=Object(u.a)(s.a.mark((function t(n){var e,i;return s.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:e=n.note,i=n.id,a(i),f(e);case 3:case"end":return t.stop()}}),t)})));return function(n){return t.apply(this,arguments)}}();return Object(y.jsxs)("div",{children:[Object(y.jsx)("div",{className:"mw-7 pa3",children:Object(y.jsx)(l.c,{})}),Object(y.jsxs)("div",{className:"flex flex-column items-center justify-center pa3 bg-washed-red",children:[Object(y.jsx)("h1",{className:"code f1-l",children:"Note taker Application"}),Object(y.jsxs)("form",{className:"mb3",onSubmit:N,children:[Object(y.jsx)("input",{type:"text",className:"pa2 f4",onChange:function(t){f(t.target.value)},value:c}),Object(y.jsx)("button",{type:"submit",className:"pa2 f4",children:e?"Update":"Create"})]}),Object(y.jsx)("div",{children:O.map((function(t){return Object(y.jsxs)("div",{className:"flex items-center",children:[Object(y.jsx)("li",{className:"list pa1 f3",onClick:function(){return k(t)},children:t.note}),Object(y.jsx)("button",{className:"bg-transparent br3 f5",onClick:function(){return g(t.id)},children:Object(y.jsx)("span",{children:"\xd7"})})]},t.id)}))})]})," "]})})),h=function(t){t&&t instanceof Function&&e.e(35).then(e.bind(null,265)).then((function(n){var e=n.getCLS,i=n.getFID,a=n.getFCP,r=n.getLCP,o=n.getTTFB;e(t),i(t),a(t),r(t),o(t)}))},O={aws_project_region:"us-east-2",aws_cognito_identity_pool_id:"us-east-2:8cf6c836-0134-48ec-ae15-c491594e3ced",aws_cognito_region:"us-east-2",aws_user_pools_id:"us-east-2_xzTIExZKN",aws_user_pools_web_client_id:"5ildjmeul31medsht8kldntvjc",oauth:{},aws_appsync_graphqlEndpoint:"https://fkos6kbbdjfhnkp6a326vz54ie.appsync-api.us-east-2.amazonaws.com/graphql",aws_appsync_region:"us-east-2",aws_appsync_authenticationType:"AMAZON_COGNITO_USER_POOLS"};e(79).default.configure(O),o.a.render(Object(y.jsx)(a.a.StrictMode,{children:Object(y.jsx)(m,{})}),document.getElementById("root")),h()}},[[196,2,3]]]);
//# sourceMappingURL=main.8453a25e.chunk.js.map