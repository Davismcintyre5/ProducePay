import{c}from"./createLucideIcon-HsS6gfMq.js";import{j as e}from"./query-Dwq__Goa.js";import{c as l}from"./index-fTCwKQeU.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=c("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=c("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=c("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);function x(s,t){const a=[],o=Math.max(1,s-2),r=Math.min(t,s+2);for(let n=o;n<=r;n+=1)a.push(n);return a}function p({page:s,totalPages:t,onPageChange:a,className:o}){if(!t||t<=1)return null;const r=x(s,t),n="inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm transition-colors";return e.jsxs("div",{className:l("flex items-center justify-center gap-1",o),children:[e.jsx("button",{type:"button",disabled:s<=1,onClick:()=>a(s-1),className:l(n,"border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none","dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"),"aria-label":"Previous page",children:e.jsx(d,{size:16})}),r[0]>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",onClick:()=>a(1),className:l(n,"text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"),children:"1"}),r[0]>2&&e.jsx("span",{className:"px-1 text-slate-400",children:"…"})]}),r.map(i=>e.jsx("button",{type:"button",onClick:()=>a(i),className:l(n,i===s?"bg-brand-600 text-white":"text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"),children:i},i)),r[r.length-1]<t&&e.jsxs(e.Fragment,{children:[r[r.length-1]<t-1&&e.jsx("span",{className:"px-1 text-slate-400",children:"…"}),e.jsx("button",{type:"button",onClick:()=>a(t),className:l(n,"text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"),children:t})]}),e.jsx("button",{type:"button",disabled:s>=t,onClick:()=>a(s+1),className:l(n,"border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none","dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"),"aria-label":"Next page",children:e.jsx(b,{size:16})})]})}export{p as P,k as S};
