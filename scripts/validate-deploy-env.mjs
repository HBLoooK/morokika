const required=['VITE_SUPABASE_URL','VITE_SUPABASE_PUBLISHABLE_KEY']
const missing=required.filter(name=>!String(process.env[name]||'').trim())

if(missing.length){
  console.error(`Production build blocked: missing ${missing.join(', ')}. Configure these public Supabase values in Netlify before deploying.`)
  process.exit(1)
}

let projectUrl
try{projectUrl=new URL(process.env.VITE_SUPABASE_URL)}catch{
  console.error('Production build blocked: VITE_SUPABASE_URL is not a valid URL.')
  process.exit(1)
}

if(projectUrl.protocol!=='https:'||!projectUrl.hostname.endsWith('.supabase.co')){
  console.error('Production build blocked: VITE_SUPABASE_URL must use HTTPS and a supabase.co hostname.')
  process.exit(1)
}

if(String(process.env.VITE_SUPABASE_PUBLISHABLE_KEY).trim().length<20){
  console.error('Production build blocked: VITE_SUPABASE_PUBLISHABLE_KEY is incomplete.')
  process.exit(1)
}

console.log('Production environment validated: Supabase public configuration is present.')
