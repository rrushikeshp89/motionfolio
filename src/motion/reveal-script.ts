/*
  Inline in <head>, before first paint. Marks the document as scripted (html.js) so the reveal
  styles in globals.css apply, then reveals each [data-reveal] element as it enters the viewport.
  It runs without React, so a slow or failed bundle never leaves content hidden; without
  IntersectionObserver everything is revealed at once. Nothing is hidden under reduced motion (CSS).
*/
export const REVEAL_SCRIPT = `(function(){
var d=document.documentElement;d.classList.add("js");
function all(){document.querySelectorAll("[data-reveal]").forEach(function(e){e.classList.add("is-revealed")})}
if(!("IntersectionObserver" in window)){document.addEventListener("DOMContentLoaded",all);return}
function start(){
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("is-revealed");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px",threshold:0.12});
document.querySelectorAll("[data-reveal]").forEach(function(e){io.observe(e)})}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",start)}else{start()}
})();`;
