module.exports = {

"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/data/blogPosts.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "blogPosts": (()=>blogPosts),
    "getAllBlogSlugs": (()=>getAllBlogSlugs),
    "getBlogPostBySlug": (()=>getBlogPostBySlug),
    "getFeaturedPosts": (()=>getFeaturedPosts),
    "getPostsByCategory": (()=>getPostsByCategory)
});
const blogPosts = [
    {
        title: 'The Future of AI in Music Production',
        excerpt: 'Exploring how artificial intelligence is revolutionizing the way we create and produce music, from automated composition to intelligent mixing.',
        fullContent: `Artificial Intelligence is transforming the music industry in unprecedented ways. From AI-powered composition tools to intelligent mixing algorithms, technology is reshaping how we create, produce, and consume music.

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

The future of AI in music isn't about replacing musicians—it's about empowering them with tools that can handle repetitive tasks, suggest creative alternatives, and open up new possibilities for artistic expression.`,
        date: 'May 28, 2025',
        category: 'AI & Music',
        image: '/blog/ai-music.jpg',
        link: '/blog/ai-music-production',
        slug: 'ai-music-production',
        readTime: '8 min read',
        tags: [
            'AI',
            'Music Production',
            'Machine Learning',
            'Creative Technology'
        ],
        author: 'Stephan El Khoury'
    },
    {
        title: 'Building Modern Web Applications with Next.js',
        excerpt: 'A comprehensive guide to creating fast, SEO-friendly web applications using Next.js 13+ with App Router and TypeScript.',
        fullContent: `Next.js has revolutionized React development with its powerful features and developer experience. The introduction of the App Router in Next.js 13+ brings server components, improved routing, and better performance optimization.

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

These features make Next.js an ideal choice for modern web applications that need to be both performant and maintainable.`,
        date: 'May 15, 2025',
        category: 'Web Development',
        image: '/blog/nextjs.jpg',
        link: '/blog/nextjs-modern-apps',
        slug: 'nextjs-modern-apps',
        readTime: '12 min read',
        tags: [
            'Next.js',
            'React',
            'TypeScript',
            'Web Development',
            'SSR'
        ],
        author: 'Stephan El Khoury'
    },
    {
        title: 'The Intersection of Music and Code',
        excerpt: 'How my background in music influences my approach to software development and creates unique problem-solving perspectives.',
        fullContent: `The relationship between music and programming runs deeper than most people realize. Both disciplines require pattern recognition, logical thinking, and creative problem-solving. My journey from music to code has revealed fascinating parallels that enhance both creative processes.

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

This dual perspective has been invaluable in projects like Harmonix, where understanding both the technical and creative aspects of music is essential.`,
        date: 'May 1, 2025',
        category: 'Personal',
        image: '/blog/music-code.jpg',
        link: '/blog/music-and-code',
        slug: 'music-and-code',
        readTime: '6 min read',
        tags: [
            'Music',
            'Programming',
            'Creativity',
            'Personal Growth'
        ],
        author: 'Stephan El Khoury'
    },
    {
        title: 'WordPress vs Custom Development: When to Choose What',
        excerpt: 'A detailed analysis of when to use WordPress and when to build custom solutions, based on real project experiences.',
        fullContent: `The decision between WordPress and custom development is one of the most common dilemmas in web development. Having built both WordPress sites and custom applications, I've learned that the choice depends on several key factors.

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

The key is understanding your project's specific requirements and choosing the tool that best fits those needs.`,
        date: 'April 20, 2025',
        category: 'Web Development',
        image: '/blog/wordpress-vs-custom.jpg',
        link: '/blog/wordpress-vs-custom',
        slug: 'wordpress-vs-custom',
        readTime: '10 min read',
        tags: [
            'WordPress',
            'Custom Development',
            'Web Development',
            'Architecture'
        ],
        author: 'Stephan El Khoury'
    },
    {
        title: 'Building Scalable E-Learning Platforms',
        excerpt: 'Lessons learned from developing cryptocurrency education platforms with thousands of users and complex course structures.',
        fullContent: `Building e-learning platforms that can scale to thousands of users while maintaining performance and user experience presents unique challenges. Through developing cryptocurrency education platforms, I've learned valuable lessons about scalability, user experience, and content delivery.

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

These experiences have shaped my approach to building robust, scalable educational platforms.`,
        date: 'April 10, 2025',
        category: 'E-Learning',
        image: '/blog/elearning-platforms.jpg',
        link: '/blog/scalable-elearning',
        slug: 'scalable-elearning',
        readTime: '14 min read',
        tags: [
            'E-Learning',
            'Scalability',
            'Architecture',
            'Education Technology'
        ],
        author: 'Stephan El Khoury'
    },
    {
        title: 'From University Dream to Production Reality',
        excerpt: 'The journey of transforming Harmonix from a university dream project into a production-ready music analysis platform.',
        fullContent: `Harmonix began as a university project—a simple idea to analyze music using AI. What started as academic curiosity has evolved into a comprehensive music analysis platform. This journey from concept to production taught me invaluable lessons about product development, user feedback, and iterative improvement.

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

The journey from university project to production platform has been challenging but incredibly rewarding, teaching me that great products are built through iteration, user feedback, and persistent improvement.`,
        date: 'March 25, 2025',
        category: 'Startup',
        image: '/blog/university-to-production.jpg',
        link: '/blog/dream-to-production',
        slug: 'dream-to-production',
        readTime: '16 min read',
        tags: [
            'Startup',
            'Product Development',
            'Music Technology',
            'AI'
        ],
        author: 'Stephan El Khoury'
    }
];
const getBlogPostBySlug = (slug)=>{
    return blogPosts.find((post)=>post.slug === slug);
};
const getAllBlogSlugs = ()=>{
    return blogPosts.map((post)=>post.slug || '').filter(Boolean);
};
const getFeaturedPosts = (count = 3)=>{
    return blogPosts.slice(0, count);
};
const getPostsByCategory = (category)=>{
    return blogPosts.filter((post)=>post.category === category);
};
}}),
"[project]/src/app/blog/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/react-fontawesome/index.es.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/free-solid-svg-icons/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$blogPosts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/blogPosts.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
const BlogListPage = ()=>{
    const [filteredPosts, setFilteredPosts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$blogPosts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["blogPosts"]);
    const [selectedCategory, setSelectedCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('All');
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const categories = [
        'All',
        ...Array.from(new Set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$blogPosts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["blogPosts"].map((post)=>post.category)))
    ];
    const handleCategoryFilter = (category)=>{
        setSelectedCategory(category);
        filterPosts(category, searchTerm);
    };
    const handleSearch = (term)=>{
        setSearchTerm(term);
        filterPosts(selectedCategory, term);
    };
    const filterPosts = (category, search)=>{
        let filtered = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$blogPosts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["blogPosts"];
        if (category !== 'All') {
            filtered = filtered.filter((post)=>post.category === category);
        }
        if (search) {
            filtered = filtered.filter((post)=>post.title.toLowerCase().includes(search.toLowerCase()) || post.excerpt.toLowerCase().includes(search.toLowerCase()) || post.tags?.some((tag)=>tag.toLowerCase().includes(search.toLowerCase())));
        }
        setFilteredPosts(filtered);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-br from-[#0B001F] via-[#1a0b3d] to-[#0B001F] relative overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-20",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-32 right-20 w-64 h-64 bg-[#C13CFF]/20 rounded-full blur-3xl floating"
                    }, void 0, false, {
                        fileName: "[project]/src/app/blog/page.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-40 left-16 w-80 h-80 bg-[#00E1FF]/15 rounded-full blur-3xl floating",
                        style: {
                            animationDelay: '3s'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/blog/page.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/blog/page.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].header, {
                className: "sticky top-0 z-50 backdrop-blur-lg bg-[#0B001F]/80 border-b border-white/10",
                initial: {
                    y: -100
                },
                animate: {
                    y: 0
                },
                transition: {
                    duration: 0.5
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-6 py-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        className: "inline-flex items-center gap-3 text-[#00E1FF] hover:text-[#FF8A00] transition-colors duration-300",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["faArrowRight"],
                                className: "rotate-180"
                            }, void 0, false, {
                                fileName: "[project]/src/app/blog/page.tsx",
                                lineNumber: 70,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: "Back to Home"
                            }, void 0, false, {
                                fileName: "[project]/src/app/blog/page.tsx",
                                lineNumber: 71,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/blog/page.tsx",
                        lineNumber: 69,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/blog/page.tsx",
                    lineNumber: 68,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/blog/page.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "container mx-auto px-6 py-12 relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "text-center mb-16",
                        initial: {
                            opacity: 0,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            duration: 0.6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].h1, {
                                className: "text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-[#00E1FF] to-[#FF8A00] bg-clip-text text-transparent",
                                initial: {
                                    opacity: 0,
                                    y: 20
                                },
                                animate: {
                                    opacity: 1,
                                    y: 0
                                },
                                transition: {
                                    delay: 0.2,
                                    duration: 0.6
                                },
                                children: "All Articles"
                            }, void 0, false, {
                                fileName: "[project]/src/app/blog/page.tsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].p, {
                                className: "text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed",
                                initial: {
                                    opacity: 0,
                                    y: 20
                                },
                                animate: {
                                    opacity: 1,
                                    y: 0
                                },
                                transition: {
                                    delay: 0.4,
                                    duration: 0.6
                                },
                                children: "Exploring the intersection of technology, music, and innovation through detailed articles and personal insights"
                            }, void 0, false, {
                                fileName: "[project]/src/app/blog/page.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/blog/page.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "max-w-4xl mx-auto mb-12",
                        initial: {
                            opacity: 0,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: 0.6,
                            duration: 0.6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative mb-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["faSearch"],
                                        className: "absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/blog/page.tsx",
                                        lineNumber: 112,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Search articles...",
                                        value: searchTerm,
                                        onChange: (e)=>handleSearch(e.target.value),
                                        className: "w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00E1FF] transition-colors duration-300"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/blog/page.tsx",
                                        lineNumber: 116,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/blog/page.tsx",
                                lineNumber: 111,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-3",
                                children: categories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                        onClick: ()=>handleCategoryFilter(category),
                                        className: `px-4 py-2 rounded-full font-semibold transition-all duration-300 ${selectedCategory === category ? 'bg-gradient-to-r from-[#00E1FF] to-[#FF8A00] text-black' : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20'}`,
                                        whileHover: {
                                            scale: 1.05
                                        },
                                        whileTap: {
                                            scale: 0.98
                                        },
                                        children: category
                                    }, category, false, {
                                        fileName: "[project]/src/app/blog/page.tsx",
                                        lineNumber: 128,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/blog/page.tsx",
                                lineNumber: 126,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/blog/page.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        transition: {
                            delay: 0.8,
                            duration: 0.6
                        },
                        children: filteredPosts.map((post, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].article, {
                                className: "group cursor-pointer h-full",
                                initial: {
                                    opacity: 0,
                                    y: 20
                                },
                                whileInView: {
                                    opacity: 1,
                                    y: 0
                                },
                                transition: {
                                    delay: index * 0.1,
                                    duration: 0.5
                                },
                                whileHover: {
                                    y: -8,
                                    scale: 1.02
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: `/blog/${post.slug}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "glass rounded-xl overflow-hidden h-full hover-glow",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative h-48 overflow-hidden",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                        src: post.image,
                                                        alt: post.title,
                                                        fill: true,
                                                        className: "object-cover group-hover:scale-110 transition-transform duration-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/blog/page.tsx",
                                                        lineNumber: 165,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/blog/page.tsx",
                                                        lineNumber: 171,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute top-4 left-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "px-3 py-1 text-xs bg-gradient-to-r from-[#00E1FF] to-[#FF8A00] text-black rounded-full font-semibold",
                                                            children: post.category
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/blog/page.tsx",
                                                            lineNumber: 175,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/blog/page.tsx",
                                                        lineNumber: 174,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/blog/page.tsx",
                                                lineNumber: 164,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center text-sm text-gray-400 mb-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["faCalendarAlt"],
                                                                className: "mr-2 text-[#00E1FF]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/blog/page.tsx",
                                                                lineNumber: 184,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: post.date
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/blog/page.tsx",
                                                                lineNumber: 185,
                                                                columnNumber: 23
                                                            }, this),
                                                            post.readTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "mx-2",
                                                                        children: "•"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/blog/page.tsx",
                                                                        lineNumber: 188,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["faClock"],
                                                                        className: "mr-2 text-[#00E1FF]"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/blog/page.tsx",
                                                                        lineNumber: 189,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: post.readTime
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/blog/page.tsx",
                                                                        lineNumber: 190,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/blog/page.tsx",
                                                        lineNumber: 183,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-xl font-bold mb-3 group-hover:text-[#00E1FF] transition-colors duration-400",
                                                        children: post.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/blog/page.tsx",
                                                        lineNumber: 195,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-300 leading-relaxed mb-4 text-sm line-clamp-3",
                                                        children: post.excerpt
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/blog/page.tsx",
                                                        lineNumber: 199,
                                                        columnNumber: 21
                                                    }, this),
                                                    post.tags && post.tags.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap gap-2 mb-4",
                                                        children: [
                                                            post.tags.slice(0, 3).map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "px-2 py-1 bg-white/10 text-gray-400 rounded text-xs",
                                                                    children: tag
                                                                }, tag, false, {
                                                                    fileName: "[project]/src/app/blog/page.tsx",
                                                                    lineNumber: 207,
                                                                    columnNumber: 27
                                                                }, this)),
                                                            post.tags.length > 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "px-2 py-1 bg-white/10 text-gray-400 rounded text-xs",
                                                                children: [
                                                                    "+",
                                                                    post.tags.length - 3,
                                                                    " more"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/blog/page.tsx",
                                                                lineNumber: 215,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/blog/page.tsx",
                                                        lineNumber: 205,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[#00E1FF] font-semibold group-hover:text-[#FF8A00] transition-colors duration-300 flex items-center gap-2",
                                                            children: [
                                                                "Read More",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["faArrowRight"],
                                                                    className: "text-sm group-hover:translate-x-1 transition-transform duration-300"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/blog/page.tsx",
                                                                    lineNumber: 225,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/blog/page.tsx",
                                                            lineNumber: 223,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/blog/page.tsx",
                                                        lineNumber: 222,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/blog/page.tsx",
                                                lineNumber: 182,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/blog/page.tsx",
                                        lineNumber: 162,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/blog/page.tsx",
                                    lineNumber: 161,
                                    columnNumber: 15
                                }, this)
                            }, post.slug, false, {
                                fileName: "[project]/src/app/blog/page.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/blog/page.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    filteredPosts.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "text-center py-16",
                        initial: {
                            opacity: 0,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            duration: 0.6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-6xl mb-4",
                                children: "📝"
                            }, void 0, false, {
                                fileName: "[project]/src/app/blog/page.tsx",
                                lineNumber: 243,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-2xl font-bold text-gray-300 mb-4",
                                children: "No articles found"
                            }, void 0, false, {
                                fileName: "[project]/src/app/blog/page.tsx",
                                lineNumber: 244,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-400 mb-8",
                                children: "Try adjusting your search terms or filters"
                            }, void 0, false, {
                                fileName: "[project]/src/app/blog/page.tsx",
                                lineNumber: 245,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setSearchTerm('');
                                    setSelectedCategory('All');
                                    setFilteredPosts(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$blogPosts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["blogPosts"]);
                                },
                                className: "px-6 py-3 bg-gradient-to-r from-[#00E1FF] to-[#FF8A00] text-black font-semibold rounded-full hover:shadow-lg transition-all duration-300",
                                children: "Show All Articles"
                            }, void 0, false, {
                                fileName: "[project]/src/app/blog/page.tsx",
                                lineNumber: 246,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/blog/page.tsx",
                        lineNumber: 237,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/blog/page.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/blog/page.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = BlogListPage;
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__bfb254a6._.js.map