import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const jobs = [
  { external_id: "uw-001", platform: "upwork", title: "Web Developer for School LMS", description: "Need a web developer to customize our school LMS platform. Must have experience with React and Node.js.", url: "https://upwork.com/jobs/~uw-001", budget_min: 500, budget_max: 2000, currency: "USD", skills_required: ["React", "Node.js", "MongoDB"], client_country: "US", posted_at: new Date().toISOString(), status: "new" },
  { external_id: "uw-002", platform: "upwork", title: "Data Entry for Educational Research", description: "Looking for accurate data entry specialist for educational research project. 10k+ entries.", url: "https://upwork.com/jobs/~uw-002", budget_min: 200, budget_max: 800, currency: "USD", skills_required: ["Data Entry", "Excel", "Research"], client_country: "UK", posted_at: new Date().toISOString(), status: "new" },
  { external_id: "uw-003", platform: "upwork", title: "Content Writer - STEM Education", description: "Write engaging STEM content for K-12 students. Topics include science, technology, engineering, math.", url: "https://upwork.com/jobs/~uw-003", budget_min: 50, budget_max: 300, currency: "USD", skills_required: ["Writing", "STEM", "Education"], client_country: "CA", posted_at: new Date().toISOString(), status: "new" },
  { external_id: "uw-004", platform: "upwork", title: "Online Math Tutor", description: "Online math tutor for high school students. AP Calculus, Algebra, Geometry.", url: "https://upwork.com/jobs/~uw-004", budget_min: 25, budget_max: 60, currency: "USD", skills_required: ["Mathematics", "Teaching", "Online Tutoring"], client_country: "US", posted_at: new Date().toISOString(), status: "new" },
  { external_id: "uw-005", platform: "upwork", title: "Curriculum Developer - Coding Bootcamp", description: "Design coding curriculum for beginner to intermediate levels. Python, JavaScript, Web Dev.", url: "https://upwork.com/jobs/~uw-005", budget_min: 1000, budget_max: 5000, currency: "USD", skills_required: ["Curriculum Design", "Python", "JavaScript", "Education"], client_country: "AU", posted_at: new Date().toISOString(), status: "new" },
  { external_id: "fl-001", platform: "freelancer", title: "Frontend Developer for EdTech Platform", description: "Build interactive educational dashboards. React, D3.js, Tailwind CSS.", url: "https://freelancer.com/jobs/~fl-001", budget_min: 800, budget_max: 3000, currency: "USD", skills_required: ["React", "D3.js", "Tailwind CSS", "TypeScript"], client_country: "US", posted_at: new Date().toISOString(), status: "new" },
  { external_id: "fl-002", platform: "freelancer", title: "Database Administrator", description: "Manage and optimize PostgreSQL databases for educational institution.", url: "https://freelancer.com/jobs/~fl-002", budget_min: 400, budget_max: 1500, currency: "USD", skills_required: ["PostgreSQL", "Database Administration", "Performance Tuning"], client_country: "DE", posted_at: new Date().toISOString(), status: "new" },
  { external_id: "fl-003", platform: "freelancer", title: "Graphic Designer - Educational Materials", description: "Create infographics, worksheets, and visual aids for online courses.", url: "https://freelancer.com/jobs/~fl-003", budget_min: 100, budget_max: 600, currency: "USD", skills_required: ["Graphic Design", "Canva", "Adobe Illustrator", "Education"], client_country: "UK", posted_at: new Date().toISOString(), status: "new" },
  { external_id: "fl-004", platform: "freelancer", title: "IT Support Specialist", description: "Remote IT support for school district. Troubleshoot hardware/software issues.", url: "https://freelancer.com/jobs/~fl-004", budget_min: 20, budget_max: 50, currency: "USD", skills_required: ["IT Support", "Network Administration", "Troubleshooting"], client_country: "US", posted_at: new Date().toISOString(), status: "new" },
  { external_id: "fl-005", platform: "freelancer", title: "Technical Writer - API Documentation", description: "Write clear API documentation for educational software platform.", url: "https://freelancer.com/jobs/~fl-005", budget_min: 300, budget_max: 1200, currency: "USD", skills_required: ["Technical Writing", "API Documentation", "Markdown"], client_country: "CA", posted_at: new Date().toISOString(), status: "new" },
]

async function seed() {
  for (const job of jobs) {
    const { error } = await supabase.from("jobs").upsert(job, { onConflict: "external_id" })
    if (error) console.error("Error:", error.message)
    else console.log("Inserted:", job.title)
  }
}
seed()
