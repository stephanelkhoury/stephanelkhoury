(()=>{var e={};e.id=831,e.ids=[831],e.modules={440:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>s});var i=a(1658);let s=async e=>[{type:"image/x-icon",sizes:"10089x9009",url:(0,i.fillMetadataSegment)(".",await e.params,"favicon.ico")+""}]},846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},1639:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>i});let i=(0,a(2907).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/Users/stephanelkhoury/Documents/GitHub/stephanelkhoury/src/app/blog/page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/stephanelkhoury/Documents/GitHub/stephanelkhoury/src/app/blog/page.tsx","default")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3873:e=>{"use strict";e.exports=require("path")},7592:(e,t,a)=>{Promise.resolve().then(a.bind(a,7789))},7789:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>u});var i=a(687),s=a(3210),n=a(3526),r=a(8920),o=a(5885),l=a(7e3),c=a(5814),d=a.n(c),m=a(474),p=a(9497);let u=()=>{let[e,t]=(0,s.useState)(p.A5),[a,c]=(0,s.useState)("All"),[u,h]=(0,s.useState)(""),[g,x]=(0,s.useState)("grid"),[f,y]=(0,s.useState)(!1),[b,v]=(0,s.useState)("date"),[w,j]=(0,s.useState)(!0),N=["All",...Array.from(new Set(p.A5.map(e=>e.category)))];(0,s.useEffect)(()=>{let e=setTimeout(()=>j(!1),800);return()=>clearTimeout(e)},[]);let k=e=>{c(e),A(e,u),y(!1)},S=e=>{h(e),A(a,e)},C=(e,t)=>[...e].sort((e,a)=>{switch(t){case"title":return e.title.localeCompare(a.title);case"category":return e.category.localeCompare(a.category);default:return new Date(a.date).getTime()-new Date(e.date).getTime()}}),A=(0,s.useCallback)((e,a)=>{let i=p.A5;"All"!==e&&(i=i.filter(t=>t.category===e)),a&&(i=i.filter(e=>e.title.toLowerCase().includes(a.toLowerCase())||e.excerpt.toLowerCase().includes(a.toLowerCase())||e.tags?.some(e=>e.toLowerCase().includes(a.toLowerCase())))),t(C(i,b))},[b]);return((0,s.useEffect)(()=>{A(a,u)},[A,a,u]),w)?(0,i.jsx)("div",{className:"min-h-screen bg-gradient-to-br from-main-dark via-main-dark-secondary to-main-dark flex items-center justify-center",children:(0,i.jsxs)(n.P.div,{className:"text-center",initial:{opacity:0},animate:{opacity:1},children:[(0,i.jsx)("div",{className:"w-16 h-16 border-4 border-gradient-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"}),(0,i.jsx)("p",{className:"text-gray-300",children:"Loading articles..."})]})}):(0,i.jsxs)("div",{className:"min-h-screen bg-gradient-to-br from-main-dark via-main-dark-secondary to-main-dark relative overflow-hidden",children:[(0,i.jsxs)("div",{className:"absolute inset-0 opacity-20",children:[(0,i.jsx)("div",{className:"absolute top-32 right-20 w-64 h-64 bg-gradient-secondary-rgb/20 rounded-full blur-3xl floating"}),(0,i.jsx)("div",{className:"absolute bottom-40 left-16 w-80 h-80 bg-gradient-primary-rgb/15 rounded-full blur-3xl floating",style:{animationDelay:"3s"}})]}),(0,i.jsx)(n.P.header,{className:"sticky top-0 z-50 backdrop-blur-lg bg-main-dark/80 border-b border-white/10",initial:{y:-100},animate:{y:0},transition:{duration:.5},children:(0,i.jsx)("div",{className:"container mx-auto px-4 sm:px-6 py-4",children:(0,i.jsxs)("div",{className:"flex items-center justify-between",children:[(0,i.jsxs)(d(),{href:"/",className:"inline-flex items-center gap-2 sm:gap-3 text-gradient-primary hover-text-gradient-tertiary transition-colors duration-300",children:[(0,i.jsx)(o.g,{icon:l.dmS,className:"rotate-180 text-sm sm:text-base"}),(0,i.jsx)("span",{className:"font-semibold text-sm sm:text-base",children:"Back to Home"})]}),(0,i.jsxs)("div",{className:"flex items-center gap-4 text-xs sm:text-sm text-gray-400",children:[(0,i.jsxs)("span",{className:"hidden sm:inline",children:[e.length," articles"]}),(0,i.jsx)("span",{className:"sm:hidden",children:e.length})]})]})})}),(0,i.jsxs)("main",{className:"container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10",children:[(0,i.jsxs)(n.P.div,{className:"text-center mb-12 sm:mb-16",initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6},children:[(0,i.jsx)(n.P.h1,{className:"text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 gradient-text",initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.2,duration:.6},children:"All Articles"}),(0,i.jsx)(n.P.p,{className:"text-gray-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed px-4",initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.4,duration:.6},children:"Exploring the intersection of technology, music, and innovation through detailed articles and personal insights"})]}),(0,i.jsxs)(n.P.div,{className:"max-w-6xl mx-auto mb-8 sm:mb-12",initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.6,duration:.6},children:[(0,i.jsxs)("div",{className:"glass rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-xl border border-white/10",children:[(0,i.jsxs)("div",{className:"relative mb-4 sm:mb-6",children:[(0,i.jsx)(o.g,{icon:l.MjD,className:"absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base"}),(0,i.jsx)("input",{type:"text",placeholder:"Search articles...",value:u,onChange:e=>S(e.target.value),className:"w-full pl-12 pr-4 py-3 sm:py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gradient-primary/50 focus:border-gradient-primary transition-all duration-300 text-sm sm:text-base"}),u&&(0,i.jsx)("button",{onClick:()=>S(""),className:"absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors",children:(0,i.jsx)(o.g,{icon:l.GRI,className:"text-sm"})})]}),(0,i.jsxs)("div",{className:"flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4",children:[(0,i.jsxs)("div",{className:"flex items-center justify-between sm:justify-start gap-4",children:[(0,i.jsxs)("button",{onClick:()=>y(!f),className:"sm:hidden flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-sm font-medium transition-all hover:bg-white/20",children:[(0,i.jsx)(o.g,{icon:l.mRM}),(0,i.jsx)("span",{children:"Filters"}),(0,i.jsx)(o.g,{icon:l.Jt$,className:`transform transition-transform ${f?"rotate-180":""}`})]}),(0,i.jsxs)("div",{className:"relative",children:[(0,i.jsxs)("select",{value:b,onChange:e=>v(e.target.value),className:"appearance-none bg-white/10 border border-white/20 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-gradient-primary/50 cursor-pointer",children:[(0,i.jsx)("option",{value:"date",className:"bg-main-dark text-white",children:"Latest First"}),(0,i.jsx)("option",{value:"title",className:"bg-main-dark text-white",children:"A-Z"}),(0,i.jsx)("option",{value:"category",className:"bg-main-dark text-white",children:"Category"})]}),(0,i.jsx)(o.g,{icon:l.Jt$,className:"absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"})]})]}),(0,i.jsxs)("div",{className:"flex items-center gap-2 bg-white/10 rounded-lg p-1",children:[(0,i.jsx)("button",{onClick:()=>x("grid"),className:`flex items-center justify-center w-8 h-8 rounded-md transition-all ${"grid"===g?"bg-gradient-primary text-black":"text-gray-400 hover:text-white"}`,children:(0,i.jsx)(o.g,{icon:l.S9g,className:"text-sm"})}),(0,i.jsx)("button",{onClick:()=>x("list"),className:`flex items-center justify-center w-8 h-8 rounded-md transition-all ${"list"===g?"bg-gradient-primary text-black":"text-gray-400 hover:text-white"}`,children:(0,i.jsx)(o.g,{icon:l.ITF,className:"text-sm"})})]})]})]}),(0,i.jsx)(r.N,{children:(0,i.jsx)(n.P.div,{className:`${f?"block":"hidden"} sm:block`,initial:{opacity:0,height:0},animate:{opacity:1,height:"auto"},exit:{opacity:0,height:0},children:(0,i.jsx)("div",{className:"flex flex-wrap gap-2 sm:gap-3",children:N.map(e=>(0,i.jsx)(n.P.button,{onClick:()=>k(e),className:`px-3 sm:px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${a===e?"bg-main-gradient text-black shadow-lg":"bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 hover:text-white border border-white/10"}`,whileHover:{scale:1.05},whileTap:{scale:.98},children:e},e))})})})]}),(0,i.jsx)(n.P.div,{initial:{opacity:0},animate:{opacity:1},transition:{delay:.8,duration:.6},children:"grid"===g?(0,i.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8",children:e.map((e,t)=>(0,i.jsx)(n.P.article,{className:"group cursor-pointer h-full",initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},transition:{delay:.1*t,duration:.5},whileHover:{y:-8,scale:1.02},viewport:{once:!0},children:(0,i.jsx)(d(),{href:`/blog/${e.slug}`,children:(0,i.jsxs)("div",{className:"glass rounded-xl overflow-hidden h-full hover-glow transition-all duration-500",children:[(0,i.jsxs)("div",{className:"relative h-48 sm:h-52 overflow-hidden",children:[(0,i.jsx)(m.default,{src:e.image,alt:e.title,fill:!0,className:"object-cover group-hover:scale-110 transition-transform duration-700",sizes:"(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}),(0,i.jsx)("div",{className:"absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"}),(0,i.jsx)("div",{className:"absolute top-4 left-4",children:(0,i.jsx)("span",{className:"px-2 sm:px-3 py-1 text-xs bg-main-gradient text-black rounded-full font-semibold shadow-lg",children:e.category})}),e.readTime&&(0,i.jsx)("div",{className:"absolute top-4 right-4",children:(0,i.jsxs)("span",{className:"px-2 sm:px-3 py-1 text-xs bg-black/50 backdrop-blur-sm text-white rounded-full",children:[(0,i.jsx)(o.g,{icon:l.a$,className:"mr-1"}),e.readTime]})})]}),(0,i.jsxs)("div",{className:"p-4 sm:p-6",children:[(0,i.jsxs)("div",{className:"flex items-center text-xs sm:text-sm text-gray-400 mb-3",children:[(0,i.jsx)(o.g,{icon:l.BEE,className:"mr-2 text-gradient-primary"}),(0,i.jsx)("span",{children:e.date})]}),(0,i.jsx)("h3",{className:"text-lg sm:text-xl font-bold mb-3 group-hover:text-gradient-primary transition-colors duration-400 line-clamp-2",children:e.title}),(0,i.jsx)("p",{className:"text-gray-300 leading-relaxed mb-4 text-sm line-clamp-3",children:e.excerpt}),e.tags&&e.tags.length>0&&(0,i.jsxs)("div",{className:"flex flex-wrap gap-1 sm:gap-2 mb-4",children:[e.tags.slice(0,2).map(e=>(0,i.jsx)("span",{className:"px-2 py-1 bg-white/10 text-gray-400 rounded text-xs",children:e},e)),e.tags.length>2&&(0,i.jsxs)("span",{className:"px-2 py-1 bg-white/10 text-gray-400 rounded text-xs",children:["+",e.tags.length-2]})]}),(0,i.jsx)("div",{className:"flex items-center justify-between",children:(0,i.jsxs)("span",{className:"text-gradient-primary font-semibold group-hover:text-gradient-tertiary transition-colors duration-300 flex items-center gap-2 text-sm",children:["Read More",(0,i.jsx)(o.g,{icon:l.dmS,className:"text-sm group-hover:translate-x-1 transition-transform duration-300"})]})})]})]})})},e.slug))}):(0,i.jsx)("div",{className:"space-y-4 sm:space-y-6",children:e.map((e,t)=>(0,i.jsx)(n.P.article,{className:"group cursor-pointer",initial:{opacity:0,x:-20},whileInView:{opacity:1,x:0},transition:{delay:.1*t,duration:.5},whileHover:{x:8},viewport:{once:!0},children:(0,i.jsx)(d(),{href:`/blog/${e.slug}`,children:(0,i.jsx)("div",{className:"glass rounded-xl overflow-hidden hover-glow transition-all duration-500",children:(0,i.jsxs)("div",{className:"flex flex-col sm:flex-row",children:[(0,i.jsxs)("div",{className:"relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 overflow-hidden",children:[(0,i.jsx)(m.default,{src:e.image,alt:e.title,fill:!0,className:"object-cover group-hover:scale-110 transition-transform duration-700",sizes:"(max-width: 768px) 100vw, 200px"}),(0,i.jsx)("div",{className:"absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 to-transparent"}),(0,i.jsx)("div",{className:"absolute top-3 left-3",children:(0,i.jsx)("span",{className:"px-2 py-1 text-xs bg-main-gradient text-black rounded-full font-semibold",children:e.category})})]}),(0,i.jsxs)("div",{className:"flex-1 p-4 sm:p-6",children:[(0,i.jsxs)("div",{className:"flex items-center text-xs sm:text-sm text-gray-400 mb-2",children:[(0,i.jsx)(o.g,{icon:l.BEE,className:"mr-2 text-gradient-primary"}),(0,i.jsx)("span",{children:e.date}),e.readTime&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("span",{className:"mx-2",children:"•"}),(0,i.jsx)(o.g,{icon:l.a$,className:"mr-2 text-gradient-primary"}),(0,i.jsx)("span",{children:e.readTime})]})]}),(0,i.jsx)("h3",{className:"text-lg sm:text-xl font-bold mb-2 group-hover:text-gradient-primary transition-colors duration-400 line-clamp-2",children:e.title}),(0,i.jsx)("p",{className:"text-gray-300 leading-relaxed mb-3 text-sm line-clamp-2 sm:line-clamp-3",children:e.excerpt}),(0,i.jsxs)("div",{className:"flex items-center justify-between",children:[(0,i.jsx)("div",{className:"flex flex-wrap gap-1 sm:gap-2",children:e.tags&&e.tags.slice(0,3).map(e=>(0,i.jsx)("span",{className:"px-2 py-1 bg-white/10 text-gray-400 rounded text-xs",children:e},e))}),(0,i.jsxs)("span",{className:"text-gradient-primary font-semibold group-hover:text-gradient-tertiary transition-colors duration-300 flex items-center gap-2 text-sm",children:["Read More",(0,i.jsx)(o.g,{icon:l.dmS,className:"text-sm group-hover:translate-x-1 transition-transform duration-300"})]})]})]})]})})})},e.slug))})}),0===e.length&&(0,i.jsxs)(n.P.div,{className:"text-center py-16 sm:py-20",initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6},children:[(0,i.jsx)("div",{className:"text-4xl sm:text-6xl mb-4",children:"\uD83D\uDCDD"}),(0,i.jsx)("h3",{className:"text-xl sm:text-2xl font-bold text-gray-300 mb-4",children:"No articles found"}),(0,i.jsx)("p",{className:"text-gray-400 mb-6 sm:mb-8 px-4",children:"Try adjusting your search terms or filters"}),(0,i.jsx)("button",{onClick:()=>{h(""),c("All"),t(p.A5),y(!1)},className:"px-6 py-3 bg-main-gradient text-black font-semibold rounded-full hover:shadow-lg hover:shadow-gradient-primary-rgb/25 transition-all duration-300",children:"Show All Articles"})]}),(0,i.jsx)(n.P.button,{className:"fixed bottom-6 right-6 z-40 w-12 h-12 bg-main-gradient text-black rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center",initial:{opacity:0,scale:0},animate:{opacity:1,scale:1},transition:{delay:1},onClick:()=>window.scrollTo({top:0,behavior:"smooth"}),whileHover:{scale:1.1},whileTap:{scale:.9},children:(0,i.jsx)(o.g,{icon:l.dmS,className:"rotate-[-90deg] text-sm"})}),(0,i.jsx)("div",{className:"h-20 sm:h-12"})]})]})}},9069:(e,t,a)=>{"use strict";a.r(t),a.d(t,{GlobalError:()=>r.a,__next_app__:()=>m,pages:()=>d,routeModule:()=>p,tree:()=>c});var i=a(5239),s=a(8088),n=a(8170),r=a.n(n),o=a(893),l={};for(let e in o)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);a.d(t,l);let c={children:["",{children:["blog",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(a.bind(a,1639)),"/Users/stephanelkhoury/Documents/GitHub/stephanelkhoury/src/app/blog/page.tsx"]}]},{metadata:{icon:[async e=>(await Promise.resolve().then(a.bind(a,440))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(a.bind(a,4431)),"/Users/stephanelkhoury/Documents/GitHub/stephanelkhoury/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(a.t.bind(a,7398,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(a.t.bind(a,9999,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(a.t.bind(a,5284,23)),"next/dist/client/components/unauthorized-error"],metadata:{icon:[async e=>(await Promise.resolve().then(a.bind(a,440))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]}.children,d=["/Users/stephanelkhoury/Documents/GitHub/stephanelkhoury/src/app/blog/page.tsx"],m={require:a,loadChunk:()=>Promise.resolve()},p=new i.AppPageRouteModule({definition:{kind:s.RouteKind.APP_PAGE,page:"/blog/page",pathname:"/blog",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},9121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},9497:(e,t,a)=>{"use strict";a.d(t,{A5:()=>i,t1:()=>s});let i=[{title:"The Future of AI in Music Production",excerpt:"Exploring how artificial intelligence is revolutionizing the way we create and produce music, from automated composition to intelligent mixing.",fullContent:`Artificial Intelligence is transforming the music industry in unprecedented ways. From AI-powered composition tools to intelligent mixing algorithms, technology is reshaping how we create, produce, and consume music.

Machine learning models can now analyze thousands of songs to understand patterns in melody, harmony, and rhythm. This enables AI systems to generate original compositions that sound remarkably human-like. Tools like OpenAI's MuseNet and Google's Magenta project are pushing the boundaries of what's possible.

In my work on Harmonix, I've seen firsthand how AI can enhance the creative process without replacing human creativity. The key is finding the right balance between technological assistance and artistic expression.

## The Current State of AI Music Tools

The landscape of AI music production tools has evolved rapidly. From simple beat generators to sophisticated composition assistants, these tools are becoming increasingly sophisticated:

1. **Composition Tools**: AI systems that can generate melodies, harmonies, and entire songs
2. **Mixing & Mastering**: Intelligent algorithms that can analyze and optimize audio
3. **Sound Design**: AI-powered synthesis and sample generation
4. **Collaboration**: Tools that help musicians work together remotely

## Real-World Applications

In developing Harmonix, I've integrated several AI technologies to enhance the music creation process. The platform uses machine learning to analyze musical patterns and suggest improvements, while maintaining the human element that makes music truly creative.

The future of AI in music isn't about replacing musicians—it's about empowering them with tools that can handle repetitive tasks, suggest creative alternatives, and open up new possibilities for artistic expression.`,date:"May 28, 2025",category:"AI & Music",image:"/blog/ai-music.jpg",link:"/blog/ai-music-production",slug:"ai-music-production",readTime:"8 min read",tags:["AI","Music Production","Machine Learning","Creative Technology"],author:"Stephan El Khoury"},{title:"Building Modern Web Applications with Next.js",excerpt:"A comprehensive guide to creating fast, SEO-friendly web applications using Next.js 13+ with App Router and TypeScript.",fullContent:`Next.js has revolutionized React development with its powerful features and developer experience. The introduction of the App Router in Next.js 13+ brings server components, improved routing, and better performance optimization.

In this portfolio project, I've leveraged Next.js to create a fast, SEO-friendly website with server-side rendering, static site generation, and optimized image loading. The App Router provides a more intuitive file-based routing system while maintaining backward compatibility.

## Key Benefits of Next.js

The framework offers several advantages that make it ideal for modern web development:

1. **Automatic Code Splitting**: Only load the JavaScript needed for each page
2. **Built-in CSS Support**: Multiple styling options including CSS Modules and Styled JSX
3. **TypeScript Integration**: First-class TypeScript support out of the box
4. **Image Optimization**: Automatic image optimization and lazy loading
5. **API Routes**: Build full-stack applications with serverless functions

## Performance Optimizations

In building this portfolio, I've implemented several performance optimizations:

- **Server-Side Rendering (SSR)**: Critical pages are pre-rendered on the server
- **Static Site Generation (SSG)**: Blog posts and project pages are statically generated
- **Image Optimization**: All images are automatically optimized and served in modern formats
- **Font Optimization**: Google Fonts are self-hosted and optimized

## Development Experience

The developer experience with Next.js is exceptional. Features like hot reloading, error overlays, and built-in ESLint support make development both fast and enjoyable. The App Router's file-based routing system is intuitive and powerful.

These features make Next.js an ideal choice for modern web applications that need to be both performant and maintainable.`,date:"May 15, 2025",category:"Web Development",image:"/blog/nextjs.jpg",link:"/blog/nextjs-modern-apps",slug:"nextjs-modern-apps",readTime:"12 min read",tags:["Next.js","React","TypeScript","Web Development","SSR"],author:"Stephan El Khoury"},{title:"The Intersection of Music and Code",excerpt:"How my background in music influences my approach to software development and creates unique problem-solving perspectives.",fullContent:`The relationship between music and programming runs deeper than most people realize. Both disciplines require pattern recognition, logical thinking, and creative problem-solving. My journey from music to code has revealed fascinating parallels that enhance both creative processes.

## Rhythm and Code Structure

Music is fundamentally about patterns, rhythm, and structure—concepts that translate directly to programming. Just as a musical composition has verses, choruses, and bridges, well-structured code has functions, classes, and modules that work together harmoniously.

In my development work, I often think in musical terms:
- **Functions** are like musical phrases that serve specific purposes
- **Classes** are like instruments with their own characteristics and capabilities
- **APIs** are like musical arrangements that bring different elements together

## Improvisation and Problem Solving

Jazz improvisation has taught me to think on my feet and find creative solutions within constraints. When debugging complex issues or architecting new features, I apply the same principles:

1. **Listen** to what the system is telling you
2. **Respond** with small, incremental changes
3. **Build** upon what works
4. **Adapt** when something doesn't fit

## The Creative Process

Both music and code involve iterative refinement. A song goes through multiple drafts, just as code goes through multiple refactors. The key is knowing when to stop tweaking and ship the product.

This dual perspective has been invaluable in projects like Harmonix, where understanding both the technical and creative aspects of music is essential.`,date:"May 1, 2025",category:"Personal",image:"/blog/music-code.jpg",link:"/blog/music-and-code",slug:"music-and-code",readTime:"6 min read",tags:["Music","Programming","Creativity","Personal Growth"],author:"Stephan El Khoury"},{title:"WordPress vs Custom Development: When to Choose What",excerpt:"A detailed analysis of when to use WordPress and when to build custom solutions, based on real project experiences.",fullContent:`The decision between WordPress and custom development is one of the most common dilemmas in web development. Having built both WordPress sites and custom applications, I've learned that the choice depends on several key factors.

## When WordPress Makes Sense

WordPress is an excellent choice for:

1. **Content-Heavy Sites**: Blogs, news sites, and marketing websites
2. **Quick Launches**: When you need to get online fast
3. **Non-Technical Clients**: Users who need to update content regularly
4. **Budget Constraints**: Lower initial development costs
5. **Plugin Ecosystem**: When existing plugins meet your needs

## When Custom Development is Better

Custom solutions are preferable for:

1. **Unique Functionality**: Complex business logic that doesn't exist in plugins
2. **Performance Requirements**: High-traffic applications that need optimization
3. **Security Concerns**: Applications handling sensitive data
4. **Scalability**: Systems that need to handle massive growth
5. **Integration Needs**: Complex third-party integrations

## Real-World Examples

From my portfolio:

**Crypto Engineers** - Built as a custom Next.js application because:
- Needed real-time crypto data integration
- Required custom user authentication
- Had specific performance requirements
- Needed seamless API integrations

**Various Client Sites** - Built with WordPress because:
- Clients needed content management
- Standard blog/portfolio functionality
- Quick turnaround required
- Cost-effective solution

## The Hybrid Approach

Sometimes the best solution is a hybrid approach:
- WordPress for content management
- Custom API for complex functionality
- Headless WordPress with custom frontend

The key is understanding your project's specific requirements and choosing the tool that best fits those needs.`,date:"April 20, 2025",category:"Web Development",image:"/blog/wordpress-vs-custom.jpg",link:"/blog/wordpress-vs-custom",slug:"wordpress-vs-custom",readTime:"10 min read",tags:["WordPress","Custom Development","Web Development","Architecture"],author:"Stephan El Khoury"},{title:"Building Scalable E-Learning Platforms",excerpt:"Lessons learned from developing cryptocurrency education platforms with thousands of users and complex course structures.",fullContent:`Building e-learning platforms that can scale to thousands of users while maintaining performance and user experience presents unique challenges. Through developing cryptocurrency education platforms, I've learned valuable lessons about scalability, user experience, and content delivery.

## Architecture Considerations

Scalable e-learning platforms require careful architectural planning:

1. **Content Delivery**: Efficient video streaming and file delivery
2. **User Management**: Role-based access control and progress tracking
3. **Assessment Systems**: Quizzes, assignments, and certification
4. **Real-time Features**: Live sessions, chat, and collaboration
5. **Mobile Optimization**: Responsive design and offline capabilities

## Performance Optimization

Key strategies for handling large user bases:

**Database Optimization**:
- Proper indexing for course content and user data
- Caching strategies for frequently accessed content
- Read replicas for improved query performance

**Content Delivery**:
- CDN for global content distribution
- Video optimization and adaptive streaming
- Progressive loading for large course materials

**User Experience**:
- Lazy loading for course lists and content
- Offline content caching for mobile users
- Real-time progress synchronization

## Lessons from Crypto Education

Working on cryptocurrency education platforms taught me:

1. **Complex Content Structure**: Hierarchical courses with dependencies
2. **User Progression**: Tracking completion and competency
3. **Interactive Elements**: Quizzes, simulations, and practical exercises
4. **Certification Systems**: Automated certificate generation and verification

## Scalability Challenges

The biggest challenges encountered:

- **Video Storage**: Managing terabytes of educational content
- **Concurrent Users**: Handling peak usage during live sessions
- **Progress Tracking**: Maintaining accurate user progress across devices
- **Content Updates**: Versioning and updating course materials

These experiences have shaped my approach to building robust, scalable educational platforms.`,date:"April 10, 2025",category:"E-Learning",image:"/blog/elearning-platforms.jpg",link:"/blog/scalable-elearning",slug:"scalable-elearning",readTime:"14 min read",tags:["E-Learning","Scalability","Architecture","Education Technology"],author:"Stephan El Khoury"},{title:"From University Dream to Production Reality",excerpt:"The journey of transforming Harmonix from a university dream project into a production-ready music analysis platform.",fullContent:`Harmonix began as a university project—a simple idea to analyze music using AI. What started as academic curiosity has evolved into a comprehensive music analysis platform. This journey from concept to production taught me invaluable lessons about product development, user feedback, and iterative improvement.

## The Original Vision

The initial concept was straightforward: use machine learning to analyze musical patterns and provide insights to musicians. However, the reality of building a production-ready platform proved far more complex than anticipated.

## Early Challenges

**Technical Hurdles**:
- Processing large audio files efficiently
- Real-time analysis capabilities
- Cross-platform compatibility
- User interface design for complex data

**User Research**:
- Understanding musician workflows
- Identifying real pain points
- Balancing features with simplicity
- Gathering meaningful feedback

## Iterative Development

The path from prototype to production involved multiple iterations:

1. **MVP Development**: Basic audio analysis with simple visualizations
2. **User Testing**: Gathering feedback from local musicians
3. **Feature Expansion**: Adding chord detection, tempo analysis, and key recognition
4. **UI/UX Refinement**: Simplifying complex features for better usability
5. **Performance Optimization**: Handling larger files and faster processing

## Technical Architecture

The final architecture includes:

**Frontend**: React with TypeScript for the user interface
**Backend**: Node.js with Express for API services
**Audio Processing**: Python with librosa for music analysis
**Database**: PostgreSQL for user data and analysis results
**Deployment**: Docker containers on AWS for scalability

## Lessons Learned

Key takeaways from this journey:

1. **Start Simple**: Begin with core functionality before adding features
2. **User Feedback is Gold**: Regular testing with real users is invaluable
3. **Performance Matters**: Users won't tolerate slow analysis times
4. **Documentation is Key**: Good documentation saves countless hours
5. **Plan for Scale**: Architecture decisions early on impact future growth

## Future Development

Harmonix continues to evolve with planned features including:
- Real-time collaboration tools
- Advanced AI-powered composition assistance
- Integration with popular DAWs
- Mobile app development

The journey from university project to production platform has been challenging but incredibly rewarding, teaching me that great products are built through iteration, user feedback, and persistent improvement.`,date:"March 25, 2025",category:"Startup",image:"/blog/university-to-production.jpg",link:"/blog/dream-to-production",slug:"dream-to-production",readTime:"16 min read",tags:["Startup","Product Development","Music Technology","AI"],author:"Stephan El Khoury"}],s=e=>i.find(t=>t.slug===e)},9551:e=>{"use strict";e.exports=require("url")},9555:(e,t,a)=>{Promise.resolve().then(a.bind(a,1639))}};var t=require("../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),i=t.X(0,[447,771,810,41],()=>a(9069));module.exports=i})();