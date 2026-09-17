const url=import.meta.env.VITE_SUPABASE_URL?.trim()
const key=(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim()
export const supabaseConfigured=Boolean(url&&key)
let supabaseInstance
let supabasePromise
export async function getSupabase(){
  if(!supabaseConfigured)throw new Error('Supabase non configuré')
  if(supabaseInstance)return supabaseInstance
  if(!supabasePromise)supabasePromise=import('@supabase/supabase-js').then(({createClient})=>{
    supabaseInstance=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
    return supabaseInstance
  })
  return supabasePromise
}
const client=()=>getSupabase()

export async function loadPublicStore(){
  const db=await client()
  const [s,p,r]=await Promise.all([
    db.from('store_settings').select('settings').eq('id','main').maybeSingle(),
    db.from('products').select('data,sort_order').eq('active',true).order('sort_order'),
    db.from('reviews').select('data').eq('status','Publié').order('created_at',{ascending:false})
  ])
  if(s.error)throw s.error;if(p.error)throw p.error;if(r.error)throw r.error
  return{settings:s.data?.settings||null,products:(p.data||[]).map(x=>x.data).filter(Boolean),reviews:(r.data||[]).map(x=>x.data).filter(Boolean)}
}

export async function loadAdminStore(){
  const db=await client(),tables=['orders','products','custom_requests','reviews','contact_messages','newsletter_subscribers']
  const [s,...r]=await Promise.all([db.from('store_settings').select('settings').eq('id','main').maybeSingle(),...tables.map(t=>db.from(t).select(t==='products'?'data,sort_order':'data,created_at').order(t==='products'?'sort_order':'created_at',{ascending:t==='products'}))])
  if(s.error)throw s.error;r.forEach(x=>{if(x.error)throw x.error})
  return{settings:s.data?.settings,orders:(r[0].data||[]).map(x=>x.data),products:(r[1].data||[]).map(x=>x.data),customRequests:(r[2].data||[]).map(x=>x.data),reviews:(r[3].data||[]).map(x=>x.data),messages:(r[4].data||[]).map(x=>x.data),subscribers:(r[5].data||[]).map(x=>x.data)}
}

export async function saveStoreSettings(settings){const db=await client();const{error}=await db.from('store_settings').upsert({id:'main',settings,updated_at:new Date().toISOString()});if(error)throw error}
export async function submitPublicRecord(table,data){const db=await client(),id=String(data.id||crypto.randomUUID()),row={id,data:{...data,id},created_at:new Date().toISOString(),updated_at:new Date().toISOString()};if(table==='reviews')row.status='À modérer';const{error}=await db.from(table).insert(row);if(error)throw error;return row.data}
export async function deleteRecord(table,id){const db=await client();const{error}=await db.from(table).delete().eq('id',id);if(error)throw error}
export async function syncCollection(table,items){if(!items.length)return;const db=await client(),now=new Date().toISOString(),rows=items.map((data,index)=>({id:String(data.id),data,...(table==='products'?{active:data.active!==false,sort_order:index}:{}),...(table==='reviews'?{status:data.status||'À modérer'}:{}),updated_at:now}));const{error}=await db.from(table).upsert(rows);if(error)throw error}

async function optimize(file){if(!file?.type?.startsWith('image/'))throw new Error('Choisissez une image valide.');if(file.size>12*1024*1024)throw new Error('L’image dépasse 12 Mo.');const bitmap=await createImageBitmap(file),max=1800,ratio=Math.min(1,max/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));canvas.getContext('2d',{alpha:false}).drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Optimisation impossible.')),'image/webp',.84))}
export async function uploadProductImage(file,productId='creation'){const blob=await optimize(file),local=typeof window!=='undefined'&&import.meta.env.DEV&&['localhost','127.0.0.1'].includes(window.location.hostname);if(!supabaseConfigured||local)return await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('Lecture impossible.'));r.readAsDataURL(blob)});const db=await client(),safe=String(productId).toLowerCase().replace(/[^a-z0-9-]+/g,'-')||'creation',path=`${safe}/${Date.now()}-${crypto.randomUUID()}.webp`;const{error}=await db.storage.from('product-images').upload(path,blob,{contentType:'image/webp',cacheControl:'31536000'});if(error)throw error;return db.storage.from('product-images').getPublicUrl(path).data.publicUrl}
