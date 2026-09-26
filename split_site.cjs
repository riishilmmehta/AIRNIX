const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// 1. Extract Head
const headMatch = indexHtml.match(/([\s\S]*?)<\/head>/);
let head = headMatch[1] + '</head>';

// Add a quick fix for nav layout on subpages (so it doesn't float over content)
// Or we can just let it float and have padding. The index.html has padding in the sections.

// 2. Extract Scripts (only the generic ones like cursor and reveal)
const scripts = `
<script>
const $=s=>document.querySelector(s);
// Reveals + magnetic cursor
const obs=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.12});document.querySelectorAll('.reveal').forEach(x=>obs.observe(x));const cur=$('#cursor');document.querySelectorAll('.magnetic,.brand,.nav a').forEach(el=>{el.addEventListener('mouseenter',()=>cur.classList.add('cursor-big'));el.addEventListener('mouseleave',()=>{cur.classList.remove('cursor-big');el.style.transform='' });el.addEventListener('mousemove',e=>{if(innerWidth<800)return;const r=el.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);if(el.classList.contains('magnetic'))el.style.transform=\`translate(\${x*.12}px,\${y*.12}px)\`})});
addEventListener('mousemove',e=>{$('#cursor').style.left=e.clientX+'px';$('#cursor').style.top=e.clientY+'px'});
</script>
`;

const footer = `<footer class="footer"><span>AIRNIX®</span><span>MORE THAN IMAGINATION.</span><span>© 2026</span></footer>`;

const nav = `<nav class="nav"><a class="brand" href="index.html"><i class="mark"></i>AIRNIX</a><div>MORE THAN IMAGINATION</div><div style="display:flex;gap:24px;align-items:center"><a href="about.html">ABOUT</a><a href="community.html">COMMUNITY</a><a href="contact.html">CONTACT</a></div></nav>`;

const bodyStart = `
<body>
<svg width="0" height="0" style="position:absolute"><filter id="liquid"><feTurbulence type="fractalNoise" baseFrequency=".012 .035" numOctaves="2" seed="4" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
<div id="cursor"></div><div class="grain"></div>
<header id="hero" style="height:auto; min-height:auto;">
${nav}
</header>
<main>
`;

const bodyEnd = `
</main>
${footer}
${scripts}
</body>
</html>
`;

// Extract Sections
const aboutSectionRegex = /<section class="section about" id="about">([\s\S]*?)<\/section>\s*<section class="section about" id="leadership"([\s\S]*?)<\/section>/;
const aboutMatch = indexHtml.match(aboutSectionRegex);
let aboutContent = aboutMatch[0];

// Extract Contact block from inside aboutContent
const contactBlockRegex = /<div class="about-contact reveal">([\s\S]*?)<\/div>\s*<\/section>/;
const contactBlockMatch = aboutContent.match(contactBlockRegex);
const contactBlock = `<div class="about-contact reveal">` + contactBlockMatch[1] + `</div>`;

// Remove Contact block from aboutContent
aboutContent = aboutContent.replace(contactBlockRegex, '</section>');

// Extract Next CTA
const nextCtaRegex = /<section class="section cta" id="contact">([\s\S]*?)<\/section>/;
const nextCtaMatch = indexHtml.match(nextCtaRegex);
const nextCta = nextCtaMatch[0];

// Build about.html
// Ensure nav on about.html acts relative to content since there's no hero. The .nav is absolute by default.
// Let's add custom padding to the first section so it sits well.
let aboutHtml = `${head}${bodyStart}${aboutContent}${bodyEnd}`;
fs.writeFileSync('about.html', aboutHtml);

// Build contact.html
let contactHtml = `${head}${bodyStart}
<section class="section about" style="padding-top:10vw;">
  ${contactBlock}
  ${nextCta.replace('id="contact"', '')}
</section>
${bodyEnd}`;
fs.writeFileSync('contact.html', contactHtml);

// Modify index.html
let newIndex = indexHtml;

// Replace nav in index
const oldNavRegex = /<nav class="nav">([\s\S]*?)<\/nav>/;
newIndex = newIndex.replace(oldNavRegex, nav);

// Remove about content
newIndex = newIndex.replace(aboutSectionRegex, '');

// Remove next CTA
newIndex = newIndex.replace(nextCtaRegex, '');

fs.writeFileSync('index.html', newIndex);

console.log("Splitting done");
