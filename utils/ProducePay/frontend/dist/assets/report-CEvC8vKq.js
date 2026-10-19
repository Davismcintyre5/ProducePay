import{c}from"./createLucideIcon-HsS6gfMq.js";import{b as a}from"./index-fTCwKQeU.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=c("RefreshCcw",[["path",{d:"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"14sxne"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16",key:"1hlbsb"}],["path",{d:"M16 16h5v5",key:"ccwih5"}]]);async function p(){return(await a.get("/reports/dashboard")).data}async function w(){return(await a.get("/reports/weekly")).data}async function h(t={}){const s=await a.get("/reports/export.csv",{params:t,responseType:"blob"}),r=new Blob([s.data],{type:"text/csv"}),o=window.URL.createObjectURL(r),e=document.createElement("a");e.href=o,e.download=`deliveries-${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(e),e.click(),document.body.removeChild(e),window.URL.revokeObjectURL(o)}export{i as R,h as a,p as d,w};
