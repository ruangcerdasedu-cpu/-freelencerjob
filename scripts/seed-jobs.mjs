import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, "..", ".env.local")
const envRaw = readFileSync(envPath, "utf-8")

function getEnv(key) {
  const m = envRaw.match(new RegExp(`^${key}=(.*)`, "m"))
  return m ? m[1].trim() : undefined
}

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

if (!supabaseUrl || !serviceKey) {
  console.error("Missing env vars")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

const jobs = [
  {
    external_id: "uw-wordpress-restaurant",
    platform: "upwork",
    title: "WordPress Developer Needed — Bar and Restaurant Website",
    description: "We are a digital marketing agency managing a website build for a cocktail bar, restaurant, and private events venue. They are hosted on GoDaddy and need a website built from the current one-page site. We need an experienced WordPress developer to build a clean, image-led single-page scrolling website that reflects a premium hospitality brand. Sections: Home, About, Bar, Restaurant, Catering, Events, Private Hire, Instagram Feed, Contact. 2 weeks timeline. $600 fixed price.",
    url: "https://upwork.com/freelance-jobs/apply/WordPress-Developer-Needed-Bar-and-Restaurant-Website_~022043916918568661864/",
    budget_min: 600,
    budget_max: 600,
    currency: "USD",
    skills_required: ["WordPress", "Elementor", "PHP", "HTML", "CSS", "GoDaddy"],
    client_country: "US",
    posted_at: "2026-04-14T00:00:00Z",
    status: "new"
  },
  {
    external_id: "uw-shopify-dtc",
    platform: "upwork",
    title: "Shopify Developer Needed - Technical Theme Work for Premium DTC Brand",
    description: "We are a small Australian premium DTC brand. We need a Shopify developer to implement specific technical theme customisations: Sticky Add to Cart bar, trust badges, footer redesign, product upsell, cart cross-sell, typography polish, iconography. Theme: Impact by Maestrooo. Small scope, clear brief. $200 fixed price.",
    url: "https://upwork.com/freelance-jobs/apply/Shopify-Developer-Needed-Technical-Theme-Work-for-premium-DTC-brand_~022044269189142953919/",
    budget_min: 200,
    budget_max: 200,
    currency: "USD",
    skills_required: ["Shopify", "Liquid", "HTML", "CSS", "JavaScript", "Impact Theme"],
    client_country: "AU",
    posted_at: "2026-04-15T00:00:00Z",
    status: "new"
  },
  {
    external_id: "uw-spanish-wordpress",
    platform: "upwork",
    title: "Spanish WordPress Website Development Expert Needed",
    description: "Looking for a skilled WordPress developer fluent in Spanish to replicate an existing English website (focoinduction.com) into Spanish. Must maintain functionality and design integrity. Tasks: translate content, URLs, SEO settings, media filenames and ALT text. Avada theme experience required. $100 fixed price.",
    url: "https://upwork.com/freelance-jobs/apply/Spanish-WordPress-Website-Development-Expert-Needed_~022036987957770335026/",
    budget_min: 100,
    budget_max: 100,
    currency: "USD",
    skills_required: ["WordPress", "Avada Theme", "SEO", "Spanish Translation", "PHP"],
    client_country: "US",
    posted_at: "2026-03-26T00:00:00Z",
    status: "new"
  },
  {
    external_id: "uw-mobile-responsive",
    platform: "upwork",
    title: "Web Developer for Mobile Responsiveness Issues and Layout Changes",
    description: "Looking for a skilled web developer to fix mobile responsiveness issues on my website. Several elements not displaying correctly on mobile devices. Need someone with keen eye for detail. Skills: HTML, CSS, JavaScript, GoHighLevel experience. $20 fixed price.",
    url: "https://upwork.com/freelance-jobs/apply/Need-web-developer-for-mobile-responsiveness-issues-and-some-layout-changes_~022036134327124371756/",
    budget_min: 20,
    budget_max: 20,
    currency: "USD",
    skills_required: ["HTML", "CSS", "JavaScript", "Responsive Design", "GoHighLevel"],
    client_country: "US",
    posted_at: "2026-03-23T00:00:00Z",
    status: "new"
  },
  {
    external_id: "uw-ai-content-instructor",
    platform: "upwork",
    title: "AI Content Creation Bootcamp - Instructor Needed",
    description: "We are looking for a knowledgeable instructor to teach our AI Content Creation Bootcamp from 5:30 PM to 8:30 PM CST. Topics include AI chatbots, content writing, AI content creation tools. Must have experience teaching adults online via Zoom.",
    url: "https://upwork.com/freelance-jobs/apply/Content-Creation-Bootcamp-Instructor-Needed-teach-online-Zoom-2025-from-530pm-830pm-cst_~021902193887651303267/",
    budget_min: 150,
    budget_max: 500,
    currency: "USD",
    skills_required: ["Online Instruction", "AI Content Creation", "Content Writing", "Public Speaking", "Zoom"],
    client_country: "US",
    posted_at: "2026-04-10T00:00:00Z",
    status: "new"
  },
  {
    external_id: "uw-instructional-designer",
    platform: "upwork",
    title: "Instructional Designers Needed for College Data Science Course",
    description: "We are seeking experienced instructional designers to develop a comprehensive curriculum for a college-level data science course. Must have experience with program curriculum design, online instruction, and course development for higher education.",
    url: "https://upwork.com/freelance-jobs/apply/Instructional-Designers-Needed-for-College-Data-Science-Course_~021902237787086655332/",
    budget_min: 1000,
    budget_max: 5000,
    currency: "USD",
    skills_required: ["Instructional Design", "Program Curriculum", "Data Science", "Online Instruction", "Course Development"],
    client_country: "US",
    posted_at: "2026-04-12T00:00:00Z",
    status: "new"
  },
  {
    external_id: "uw-consultant-educator",
    platform: "upwork",
    title: "Consultant and Educator for Professional Development",
    description: "Seeking an experienced consultant to provide teaching and consulting services in professional development. Ideal candidate has background in education, sales, content writing, lead generation, and communications. Hourly position for ongoing work.",
    url: "https://upwork.com/freelance-jobs/apply/Consultant-and-Educator-for-Professional-Development_~021972162296516678/",
    budget_min: 25,
    budget_max: 50,
    currency: "USD",
    skills_required: ["Professional Development", "Teaching", "Sales", "Content Writing", "Communications"],
    client_country: "US",
    posted_at: "2026-04-08T00:00:00Z",
    status: "new"
  },
  {
    external_id: "uw-frontend-react",
    platform: "upwork",
    title: "Front-End Developer for SaaS Dashboard",
    description: "Looking for a front-end developer to build a SaaS analytics dashboard using React and TypeScript. Must have experience with data visualization libraries (Chart.js, D3.js), Tailwind CSS, and responsive design. API integration experience required. 2-4 week project.",
    url: "https://upwork.com/freelance-jobs/~frontend-saas-dashboard",
    budget_min: 1500,
    budget_max: 4000,
    currency: "USD",
    skills_required: ["React", "TypeScript", "Tailwind CSS", "D3.js", "API Integration", "Responsive Design"],
    client_country: "CA",
    posted_at: "2026-04-16T00:00:00Z",
    status: "new"
  },
  {
    external_id: "uw-content-writer-edtech",
    platform: "upwork",
    title: "Content Writer for EdTech Blog - STEM Topics",
    description: "We need a freelance content writer to create engaging blog posts about STEM education, EdTech tools, and online learning strategies. Topics include AI in education, classroom technology, remote learning tips, and teacher resources. 5 articles per week, 1200-1500 words each. Must have teaching or education background.",
    url: "https://upwork.com/freelance-jobs/~content-writer-edtech",
    budget_min: 500,
    budget_max: 1500,
    currency: "USD",
    skills_required: ["Content Writing", "SEO", "STEM Education", "EdTech", "Blog Writing"],
    client_country: "US",
    posted_at: "2026-04-13T00:00:00Z",
    status: "new"
  },
  {
    external_id: "uw-online-english-tutor",
    platform: "upwork",
    title: "Online English Tutor for International Students",
    description: "We are looking for experienced online English tutors to teach international students (ages 10-18). Focus on conversation skills, grammar, and academic writing. Must have TEFL/TESOL certification and at least 2 years teaching experience. Flexible hours, 10-20 hours per week. $20-35/hr.",
    url: "https://upwork.com/freelance-jobs/~online-english-tutor",
    budget_min: 20,
    budget_max: 35,
    currency: "USD",
    skills_required: ["English Teaching", "TEFL", "Online Tutoring", "Grammar", "Academic Writing"],
    client_country: "JP",
    posted_at: "2026-04-15T00:00:00Z",
    status: "new"
  },
  {
    external_id: "uw-curriculum-dev-coding",
    platform: "upwork",
    title: "Curriculum Developer - Kids Coding Program",
    description: "Design a comprehensive coding curriculum for children ages 8-14. Program should cover Scratch, Python basics, and intro to web development. Must include lesson plans, activities, projects, and assessment rubrics. Teaching or curriculum development background required.",
    url: "https://upwork.com/freelance-jobs/~curriculum-dev-kids-coding",
    budget_min: 800,
    budget_max: 3000,
    currency: "USD",
    skills_required: ["Curriculum Design", "Scratch", "Python", "Lesson Planning", "Education", "K-12"],
    client_country: "SG",
    posted_at: "2026-04-11T00:00:00Z",
    status: "new"
  },
  {
    external_id: "uw-virtual-assistant",
    platform: "upwork",
    title: "Virtual Assistant for Education Consultant",
    description: "Need a reliable virtual assistant to help manage emails, schedule appointments, research education trends, and prepare client reports. Must be proficient in Google Workspace, Notion, and Slack. Education industry experience preferred. 15-20 hrs/week.",
    url: "https://upwork.com/freelance-jobs/~virtual-assistant-education",
    budget_min: 10,
    budget_max: 20,
    currency: "USD",
    skills_required: ["Virtual Assistant", "Google Workspace", "Notion", "Slack", "Email Management"],
    client_country: "US",
    posted_at: "2026-04-14T00:00:00Z",
    status: "new"
  },
]

async function seed() {
  console.log("Clearing old simulated jobs...")
  const { error: deleteError } = await supabase.from("jobs").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  if (deleteError) console.error("Delete error:", deleteError.message)
  else console.log("Old jobs cleared.")

  for (const job of jobs) {
    const { error } = await supabase.from("jobs").upsert(job, { onConflict: "external_id,platform" })
    if (error) console.error("Error:", error.message)
    else console.log("Inserted:", job.title)
  }
}
seed().then(() => console.log("Done!")).catch(console.error)
