import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BadgeCheck, BarChart3,
  Bell, Boxes, CakeSlice, CalendarDays, Check, CheckCircle2, ChevronDown,
  ChevronRight, CircleDollarSign, CircleHelp, ClipboardList, Clock3,
  Download, Eye, Facebook, Filter, Gift, Heart, Instagram, LayoutDashboard,
  Leaf, LockKeyhole, LogOut, Mail, MapPin, Menu, MessageCircle, Minus,
  MoreHorizontal, Package, PackageCheck, PanelLeft, Pencil, Phone, Plus, Search,
  Settings, ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles, Star, Store,
  Trash2, TrendingDown, TrendingUp, Truck, UserRound, Users, UsersRound, X
} from 'lucide-react'
import { articlePublishedDates, commerceLandingPages, journalArticles, seoLandingPages } from './seoContent.js'
import { products } from './catalog.js'
import { defaultStoreSettings, isBankTransferReady, mergeStoreSettings, whatsappDigits } from './storeConfig.js'
import { commerceSeoGuides, coreSeoPages } from './coreSeoContent.js'
import { commerceGuideAdditions, corePageAdditions, journalSectionAdditions, localPageAdditions, productPracticalGuides } from './contentEnrichment.js'
import { deleteRecord, getSupabase, loadAdminStore, loadPublicStore, saveStoreSettings, submitPublicRecord, supabaseConfigured, syncCollection, uploadProductImage } from './supabase.js'

const localPreview=typeof window!=='undefined'&&import.meta.env.DEV&&['localhost','127.0.0.1'].includes(window.location.hostname)
const normalizeRoute=path=>{const value=String(path||'/').replace(/\/+$/,'');return value||'/'}
function useStoreSettings(){
  const [settings,setSettings]=useState(()=>mergeStoreSettings(readStoredObject(localStorage,'morokika-admin-settings')))
  useEffect(()=>{if(!supabaseConfigured||localPreview)return;let active=true;loadPublicStore().then(data=>{if(active&&data.settings){const merged=mergeStoreSettings(data.settings);setSettings(merged);writeStorage(localStorage,'morokika-admin-settings',merged)}}).catch(()=>{});return()=>{active=false}},[])
  return [settings,setSettings]
}

const reviews = []

const seedOrders = [
  {id:'MK-260912-4821',customer:'Salma El Amrani',initials:'SE',city:'Rabat',date:'12 sept. · 10:42',total:450,status:'À préparer',payment:'Payée',items:1,product:'Pistache & Fleur d’Oranger · 8 parts',phone:'06 12 34 56 78',email:'salma.e@example.ma',address:'24, avenue Fal Ould Oumeir, Agdal',slot:'14 sept. · 14h–17h'},
  {id:'MK-260912-4719',customer:'Mehdi Bennani',initials:'MB',city:'Salé',date:'12 sept. · 09:18',total:390,status:'Nouvelle',payment:'À la livraison',items:1,product:'Atlas Chocolat Noir · 6 parts',phone:'06 21 45 87 36',email:'mehdi.b@example.ma',address:'8, avenue Sidi Ben Achir, Bettana',slot:'14 sept. · 10h–13h'},
  {id:'MK-260911-4602',customer:'Yasmine Alaoui',initials:'YA',city:'Casablanca',date:'11 sept. · 17:55',total:735,status:'En préparation',payment:'Payée',items:2,product:'Rose de Marrakech + Cheesecake Fruits Rouges',phone:'06 61 20 43 18',email:'yasmine.a@example.ma',address:'32, rue Normandie, Maârif',slot:'13 sept. · 17h–20h'},
  {id:'MK-260911-4533',customer:'Omar Lahlou',initials:'OL',city:'Kénitra',date:'11 sept. · 15:21',total:395,status:'Prête',payment:'Payée',items:1,product:'Praliné Café Noss Noss · 6 parts',phone:'06 73 18 29 40',email:'omar.l@example.ma',address:'17, rue Moulay Abdelaziz',slot:'13 sept. · 14h–17h'},
  {id:'MK-260911-4498',customer:'Imane Raji',initials:'IR',city:'Témara',date:'11 sept. · 12:07',total:580,status:'En livraison',payment:'Payée',items:1,product:'Caramel & Dattes Majhoul · 12 parts',phone:'06 48 32 16 09',email:'imane.r@example.ma',address:'Lotissement Al Wifaq, secteur 3',slot:'12 sept. · 14h–17h'},
  {id:'MK-260910-4381',customer:'Nadia Tazi',initials:'NT',city:'Rabat',date:'10 sept. · 18:34',total:370,status:'Livrée',payment:'Payée',items:1,product:'Vanille & Figue Fraîche · 6 parts',phone:'06 55 82 17 64',email:'nadia.t@example.ma',address:'11, rue Tansift, Agdal',slot:'12 sept. · 10h–13h'},
  {id:'MK-260910-4290',customer:'Amine Chraïbi',initials:'AC',city:'Casablanca',date:'10 sept. · 11:12',total:660,status:'Livrée',payment:'Payée',items:2,product:'Safran & Agrumes + Atlas Chocolat Noir',phone:'06 63 40 22 71',email:'amine.c@example.ma',address:'6, boulevard Zerktouni',slot:'12 sept. · 14h–17h'},
  {id:'MK-260909-4174',customer:'Sara Meziane',initials:'SM',city:'Salé',date:'09 sept. · 16:46',total:470,status:'Annulée',payment:'Remboursée',items:1,product:'Rose de Marrakech · 8 parts',phone:'06 14 77 39 25',email:'sara.m@example.ma',address:'19, rue Al Mansour',slot:'11 sept. · 17h–20h'}
]

const seedCustomers = [
  {name:'Salma El Amrani',initials:'SE',email:'salma.e@example.ma',city:'Rabat',orders:8,spent:3280,last:'Aujourd’hui',segment:'Fidèle'},
  {name:'Yasmine Alaoui',initials:'YA',email:'yasmine.a@example.ma',city:'Casablanca',orders:6,spent:2845,last:'Hier',segment:'Fidèle'},
  {name:'Mehdi Bennani',initials:'MB',email:'mehdi.b@example.ma',city:'Salé',orders:3,spent:1170,last:'Aujourd’hui',segment:'Actif'},
  {name:'Imane Raji',initials:'IR',email:'imane.r@example.ma',city:'Témara',orders:4,spent:1920,last:'Hier',segment:'Actif'},
  {name:'Omar Lahlou',initials:'OL',email:'omar.l@example.ma',city:'Kénitra',orders:2,spent:765,last:'Hier',segment:'Nouveau'},
  {name:'Nadia Tazi',initials:'NT',email:'nadia.t@example.ma',city:'Rabat',orders:5,spent:2110,last:'10 sept.',segment:'Fidèle'},
  {name:'Amine Chraïbi',initials:'AC',email:'amine.c@example.ma',city:'Casablanca',orders:2,spent:1030,last:'10 sept.',segment:'Nouveau'}
]

const seedBriefs = [
  {id:'SUR-260912-3194',name:'Lina Berrada',email:'lina.b@example.ma',phone:'06 28 41 73 95',occasion:'Fiançailles',date:'28 septembre',guests:'25–40',flavor:'Pistache & fleur d’oranger',budget:'1 200–2 000 DH',theme:'Ivoire, feuillage fin et touches dorées',status:'Nouvelle'},
  {id:'SUR-260911-2982',name:'Rania El Fassi',email:'rania.f@example.ma',phone:'06 62 18 40 77',occasion:'Mariage',date:'10 octobre',guests:'40+',flavor:'Vanille & fruits rouges',budget:'Plus de 2 000 DH',theme:'Blanc texturé, fleurs fraîches et trois niveaux',status:'En discussion'},
  {id:'SUR-260910-2741',name:'Atlas Studio',email:'events@atlas-studio.ma',phone:'05 37 42 19 80',occasion:'Événement',date:'22 septembre',guests:'15–25',flavor:'Chocolat & noisette',budget:'1 200–2 000 DH',theme:'Identité terracotta avec monogramme entreprise',status:'Devis envoyé',quote:'1650'},
  {id:'SUR-260908-2410',name:'Meryem Idrissi',email:'meryem.i@example.ma',phone:'06 11 58 26 43',occasion:'Anniversaire',date:'19 septembre',guests:'10–15',flavor:'Agrumes & safran',budget:'800–1 200 DH',theme:'Solaire et minimaliste, chiffre 30 discret',status:'Confirmée',quote:'980'}
]

const formatPrice = n => `${Number(n||0).toLocaleString('fr-MA')} DH`
const publicImageDimensions = path => path?.includes('collection-anniversaires')?{width:1536,height:1024}:path?.includes('story-')?{width:1448,height:1086}:path?.includes('hero-')?{width:1586,height:992}:{width:1254,height:1254}
const responsiveImageSrcSet=path=>path?.startsWith('/images/')&&path.endsWith('.webp')?`${path.replace(/\.webp$/, '-320.webp')} 320w, ${path.replace(/\.webp$/, '-480.webp')} 480w, ${path.replace(/\.webp$/, '-800.webp')} 800w, ${path} ${publicImageDimensions(path).width}w`:undefined
const enrichedSections=(sections,map,key)=>[...sections,...(map[key]||[])]
const hasTrackedStock = product => product.stock!==null&&product.stock!==undefined&&product.stock!==''&&Number.isFinite(Number(product.stock))
const isLowStock = product => hasTrackedStock(product)&&Number(product.stock)<=5
const downloadCsv = (filename,headers,rows) => {
  const escape=value=>`"${String(value??'').replace(/"/g,'""')}"`
  const csv=`\uFEFF${[headers,...rows].map(row=>row.map(escape).join(',')).join('\n')}`
  const link=document.createElement('a')
  link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));link.download=filename;link.click()
  setTimeout(()=>URL.revokeObjectURL(link.href),0)
}
const downloadJson = (filename,value) => {
  const link=document.createElement('a')
  link.href=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));link.download=filename;link.click()
  setTimeout(()=>URL.revokeObjectURL(link.href),0)
}
const getAdminDateLabel = () => new Intl.DateTimeFormat('fr-MA',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Africa/Casablanca'}).format(new Date())
const getAdminPeriodLabel = () => {
  const parts=new Intl.DateTimeFormat('fr-MA',{day:'2-digit',month:'long',timeZone:'Africa/Casablanca'}).formatToParts(new Date())
  const day=parts.find(part=>part.type==='day')?.value||'01'
  const month=parts.find(part=>part.type==='month')?.value||''
  return `01–${day} ${month}`
}
const getDeliveryISO = (leadTime=48) => {
  const hours=Math.max(0,Number(leadTime)||48)
  const date=new Date(Date.now()+hours*60*60*1000)
  const parts=new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Africa/Casablanca'}).formatToParts(date)
  const value=type=>parts.find(part=>part.type===type)?.value
  return `${value('year')}-${value('month')}-${value('day')}`
}
const getFutureISO = days => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0,10)
}
const formatDeliveryDate = iso => new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${iso}T12:00:00`))
const createOrderRef = () => {
  const now = new Date()
  const stamp = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
  return `MK-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`
}
const sizes = [
  { label: '6 parts', add: 0, note: 'Ø 16 cm' },
  { label: '8 parts', add: 90, note: 'Ø 20 cm' },
  { label: '12 parts', add: 210, note: 'Ø 24 cm' }
]
const readStoredArray = key => {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return Array.isArray(value) ? value : []
  } catch { return [] }
}
const writeStorage = (storage,key,value) => {
  try { storage.setItem(key,JSON.stringify(value)); return true }
  catch { return false }
}
const readStoredObject = (storage,key) => {
  try { const value=JSON.parse(storage.getItem(key));return value&&typeof value==='object'&&!Array.isArray(value)?value:{} }
  catch { return {} }
}
const readCheckoutDraft = () => {
  try {
    const value = JSON.parse(sessionStorage.getItem('morokika-checkout'))
    return value && typeof value === 'object' ? value : {}
  } catch { return {} }
}
function useModalEscape(open,onClose) {
  useEffect(()=>{
    if(!open)return
    const handleKey = event => { if(event.key==='Escape') onClose() }
    window.addEventListener('keydown',handleKey)
    return ()=>window.removeEventListener('keydown',handleKey)
  },[open,onClose])
}
function useFocusTrap(open,ref) {
  useEffect(()=>{
    if(!open||!ref.current)return
    const previous=document.activeElement
    const selector='button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    const elements=[...ref.current.querySelectorAll(selector)]
    elements[0]?.focus()
    const trap=event=>{
      if(event.key!=='Tab'||!elements.length)return
      const first=elements[0],last=elements[elements.length-1]
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
    window.addEventListener('keydown',trap)
    return ()=>{window.removeEventListener('keydown',trap);previous?.focus?.()}
  },[open,ref])
}

function useBodyScrollLock(open) {
  useEffect(()=>{
    if(!open)return
    const previous=document.body.style.overflow
    document.body.style.overflow='hidden'
    return()=>{document.body.style.overflow=previous}
  },[open])
}

function App() {
  const [storeSettings]=useStoreSettings()
  const [catalogRevision,setCatalogRevision]=useState(0)
  const storedCatalog=readStoredArray('morokika-admin-products')
  if(storedCatalog.length){const published=storedCatalog.filter(product=>product.active!==false);const catalogue=window.location.pathname.startsWith('/admin')?storedCatalog:(published.length?published:[{...storedCatalog[0],active:true}]);products.splice(0,products.length,...catalogue)}
  const [route, setRoute] = useState(() => normalizeRoute(window.location.pathname))
  const [cart, setCart] = useState(() => readStoredArray('morokika-cart').filter(item => products.some(product => product.id === item.productId) && Number.isFinite(item.qty) && item.qty > 0))
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [online, setOnline] = useState(() => navigator.onLine)
  const [wishlist, setWishlist] = useState(() => readStoredArray('morokika-wishlist').filter(id => products.some(product => product.id === id)))
  const [submittedReviews, setSubmittedReviews] = useState(() => supabaseConfigured&&!localPreview?[]:readStoredArray('morokika-reviews').filter(review => products.some(product => product.id === review.productId)))

  useEffect(() => {
    const pop = () => setRoute(normalizeRoute(window.location.pathname))
    window.addEventListener('popstate', pop)
    return () => window.removeEventListener('popstate', pop)
  }, [])
  useEffect(() => {
    const syncStatus = () => setOnline(navigator.onLine)
    window.addEventListener('online', syncStatus)
    window.addEventListener('offline', syncStatus)
    return () => { window.removeEventListener('online', syncStatus); window.removeEventListener('offline', syncStatus) }
  }, [])
  useEffect(() => {writeStorage(localStorage,'morokika-cart',cart)}, [cart])
  useEffect(() => {writeStorage(localStorage,'morokika-wishlist',wishlist)}, [wishlist])
  useEffect(() => {writeStorage(localStorage,'morokika-reviews',submittedReviews)}, [submittedReviews])
  useEffect(()=>{if(!supabaseConfigured||localPreview)return;let active=true;loadPublicStore().then(data=>{if(!active)return;if(data.products.length){products.splice(0,products.length,...data.products);writeStorage(localStorage,'morokika-admin-products',data.products);setCatalogRevision(value=>value+1)}setSubmittedReviews(data.reviews)}).catch(()=>{});return()=>{active=false}},[])
  useEffect(() => {
    document.body.style.overflow = (cartOpen || menuOpen || searchOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen, menuOpen, searchOpen])
  useEffect(() => {
    const closeOnEscape = event => {
      if (event.key === 'Escape') { setCartOpen(false); setMenuOpen(false); setSearchOpen(false) }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])
  useEffect(() => {
    const product = route.startsWith('/produit/') ? products.find(p => p.id === decodeURIComponent(route.split('/')[2])) : null
    const corePage=coreSeoPages.find(page=>page.path===route)
    const titles = {'/':'MoroKika — Gâteaux d’exception','/boutique':'La boutique — MoroKika','/favoris':'Mes favoris — MoroKika','/sur-mesure':'Gâteau sur mesure — MoroKika','/la-maison':'La Maison — MoroKika','/journal':'Le Journal — MoroKika','/livraison':'Livraison et retrait — MoroKika','/guide-des-tailles':'Guide des tailles — MoroKika','/allergenes':'Allergènes — MoroKika','/contact':'Contact — MoroKika','/faq':'Questions fréquentes — MoroKika','/checkout':'Commande sécurisée — MoroKika','/confidentialite':'Confidentialité — MoroKika','/cgv':'Conditions de vente — MoroKika','/mentions-legales':'Mentions légales — MoroKika'}
    const collectionTitles={'/collections/signatures':'Signatures — MoroKika','/collections/anniversaires':'Gâteaux d’anniversaire — MoroKika','/collections/cadeaux':'Cadeaux gourmands — MoroKika'}
    const article = route.startsWith('/journal/') ? journalArticles.find(item=>item.slug===route.split('/')[2]) : null
    const seoLanding=seoLandingPages.find(page=>page.path===route)
    const commerceLanding=commerceLandingPages.find(page=>page.path===route)
    const isAdmin=route.startsWith('/admin')
    const isKnown=Boolean(corePage||titles[route]||collectionTitles[route]||product||article||seoLanding||commerceLanding||isAdmin)
    const title = isAdmin ? 'Espace vendeur — MoroKika' : product ? `Gâteau ${product.name} | MoroKika` : article ? article.metaTitle || `${article.title} — MoroKika` : seoLanding?.metaTitle || commerceLanding?.metaTitle || corePage?.metaTitle || collectionTitles[route] || titles[route] || 'Page introuvable — MoroKika'
    const description = isAdmin ? 'Espace privé de gestion de la boutique MoroKika.' : product ? `${product.short}. Gâteau artisanal préparé à Rabat, avec retrait ou livraison locale sur créneau confirmé.` : article ? article.excerpt : seoLanding?.metaDescription || commerceLanding?.metaDescription || corePage?.metaDescription || 'Pâtisserie artisanale marocaine, livrée avec soin à Rabat, Salé, Témara, Kénitra et Casablanca.'
    const origin='https://morokika.netlify.app'
    const pageUrl=`${origin}${route}`
    const imagePath=product?.image||article?.image||seoLanding?.image||commerceLanding?.image||corePage?.image||'/images/hero-cake.webp'
    const imageUrl=new URL(imagePath,origin).href
    const dimensions=publicImageDimensions(imagePath),imageSize=[dimensions.width,dimensions.height]
    const noIndex=isAdmin||route==='/checkout'||route==='/favoris'||!isKnown
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[name="robots"]')?.setAttribute('content', noIndex ? (isAdmin?'noindex, nofollow':'noindex, follow') : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    document.querySelector('meta[property="og:type"]')?.setAttribute('content', article?'article':product?'product':'website')
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', imageUrl)
    document.querySelector('meta[property="og:image:width"]')?.setAttribute('content',String(imageSize[0]))
    document.querySelector('meta[property="og:image:height"]')?.setAttribute('content',String(imageSize[1]))
    document.querySelector('meta[property="og:image:alt"]')?.setAttribute('content', product?.name||article?.title||seoLanding?.imageAlt||commerceLanding?.title||'Création pâtissière MoroKika')
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', pageUrl)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description)
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', imageUrl)
    document.querySelector('meta[name="twitter:image:alt"]')?.setAttribute('content', product?.name||article?.title||seoLanding?.imageAlt||commerceLanding?.title||'Création pâtissière MoroKika')
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', pageUrl)
    document.querySelector('link[hreflang="fr-MA"]')?.setAttribute('href', pageUrl)
    document.querySelector('link[hreflang="x-default"]')?.setAttribute('href', pageUrl)
    document.getElementById('product-schema')?.remove()
    document.getElementById('article-schema')?.remove()
    document.getElementById('faq-schema')?.remove()
    document.getElementById('seo-landing-schema')?.remove()
    document.getElementById('static-route-schema')?.remove()
    document.getElementById('product-breadcrumb-schema')?.remove()
    document.getElementById('article-breadcrumb-schema')?.remove()
    document.getElementById('commerce-schema')?.remove()
    document.getElementById('core-page-schema')?.remove()
    if (product) {
      const offer={ '@type':'Offer',url:pageUrl,priceCurrency:'MAD',price:product.price,seller:{'@id':`${origin}/#bakery`} }
      if(product.stock!==null&&product.stock!==undefined)offer.availability=product.stock===0?'https://schema.org/OutOfStock':'https://schema.org/InStock'
      const schema = document.createElement('script')
      schema.id = 'product-schema'; schema.type = 'application/ld+json'
      schema.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', '@id':`${pageUrl}#product`, url:pageUrl, name: product.name, image: imageUrl, description: product.description, sku: product.id, brand: { '@type': 'Brand', name: 'MoroKika' }, offers:offer })
      document.head.appendChild(schema)
      const breadcrumb=document.createElement('script')
      breadcrumb.id='product-breadcrumb-schema';breadcrumb.type='application/ld+json'
      breadcrumb.text=JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Accueil',item:`${origin}/`},{'@type':'ListItem',position:2,name:'Boutique',item:`${origin}/boutique`},{'@type':'ListItem',position:3,name:product.name,item:pageUrl}]})
      document.head.appendChild(breadcrumb)
    } else if (article) {
      const schema = document.createElement('script')
      schema.id='article-schema'; schema.type='application/ld+json'
      const published=articlePublishedDates[article.slug]
      schema.text=JSON.stringify({'@context':'https://schema.org','@type':'Article','@id':`${pageUrl}#article`,mainEntityOfPage:pageUrl,headline:article.title,description:article.excerpt,image:imageUrl,inLanguage:'fr-MA',wordCount:[article.intro,...enrichedSections(article.sections,journalSectionAdditions,article.slug).flat()].join(' ').split(/\s+/).length,datePublished:published,dateModified:'2026-09-17',author:{'@type':'Organization',name:'MoroKika',url:origin},publisher:{'@type':'Organization',name:'MoroKika',url:origin}})
      document.head.appendChild(schema)
      const breadcrumb=document.createElement('script')
      breadcrumb.id='article-breadcrumb-schema';breadcrumb.type='application/ld+json'
      breadcrumb.text=JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Accueil',item:`${origin}/`},{'@type':'ListItem',position:2,name:'Journal',item:`${origin}/journal`},{'@type':'ListItem',position:3,name:article.title,item:pageUrl}]})
      document.head.appendChild(breadcrumb)
    } else if(seoLanding) {
      const schema=document.createElement('script')
      schema.id='seo-landing-schema';schema.type='application/ld+json'
      schema.text=JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'Service','@id':`${pageUrl}#service`,name:seoLanding.service,description:seoLanding.metaDescription,url:pageUrl,areaServed:{'@type':'AdministrativeArea',name:seoLanding.region},provider:{'@id':`${origin}/#bakery`}},{'@type':'FAQPage','@id':`${pageUrl}#faq`,mainEntity:seoLanding.faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Accueil',item:`${origin}/`},{'@type':'ListItem',position:2,name:seoLanding.title,item:pageUrl}]}]})
      document.head.appendChild(schema)
    } else if(commerceLanding) {
      const selectedProducts=commerceLanding.productIds==='all'?products:commerceLanding.productIds.map(id=>products.find(item=>item.id===id)).filter(Boolean)
      const breadcrumbItems=commerceLanding.path==='/boutique'?[{'@type':'ListItem',position:1,name:'Accueil',item:`${origin}/`},{'@type':'ListItem',position:2,name:'Boutique',item:pageUrl}]:[{'@type':'ListItem',position:1,name:'Accueil',item:`${origin}/`},{'@type':'ListItem',position:2,name:'Boutique',item:`${origin}/boutique`},{'@type':'ListItem',position:3,name:commerceLanding.title,item:pageUrl}]
      const schema=document.createElement('script')
      schema.id='commerce-schema';schema.type='application/ld+json'
      schema.text=JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'CollectionPage','@id':`${pageUrl}#collection`,url:pageUrl,name:commerceLanding.title,description:commerceLanding.metaDescription},{'@type':'ItemList',itemListElement:selectedProducts.map((item,index)=>({'@type':'ListItem',position:index+1,url:`${origin}/produit/${item.id}`,name:item.name}))},{'@type':'BreadcrumbList',itemListElement:breadcrumbItems}]})
      document.head.appendChild(schema)
    } else if(corePage) {
      const graph=[{'@type':corePage.path==='/contact'?'ContactPage':corePage.path==='/la-maison'?'AboutPage':corePage.path==='/journal'?'Blog':'WebPage','@id':`${pageUrl}#webpage`,url:pageUrl,name:corePage.title,description:corePage.metaDescription,inLanguage:'fr-MA',dateModified:'2026-09-17',about:{'@id':`${origin}/#bakery`},primaryImageOfPage:{'@type':'ImageObject',url:imageUrl}}]
      if(corePage.path==='/')graph.push({'@type':'WebSite','@id':`${origin}/#website`,url:origin,name:'MoroKika',inLanguage:'fr-MA',publisher:{'@id':`${origin}/#bakery`}},{'@type':'ItemList',itemListElement:products.map((item,index)=>({'@type':'ListItem',position:index+1,url:`${origin}/produit/${item.id}`,name:item.name}))})
      else graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Accueil',item:`${origin}/`},{'@type':'ListItem',position:2,name:corePage.title,item:pageUrl}]})
      if(corePage.faqs?.length)graph.push({'@type':'FAQPage','@id':`${pageUrl}#faq`,mainEntity:corePage.faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))})
      const schema=document.createElement('script')
      schema.id='core-page-schema';schema.type='application/ld+json';schema.text=JSON.stringify({'@context':'https://schema.org','@graph':graph})
      document.head.appendChild(schema)
    }
  }, [route,catalogRevision])

  const navigate = (path) => {
    const target=normalizeRoute(path)
    window.history.pushState({}, '', target)
    setRoute(target); setMenuOpen(false); setSearchOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const notify = (message) => {
    setToast(message); window.clearTimeout(window.__moroToast)
    window.__moroToast = window.setTimeout(() => setToast(''), 2800)
  }
  const toggleWishlist = product => {
    const isSaved = wishlist.includes(product.id)
    setWishlist(current => isSaved ? current.filter(id => id !== product.id) : [...current, product.id])
    notify(isSaved ? `${product.name} retiré des favoris` : `${product.name} ajouté aux favoris`)
  }
  const addReview = async review => {
    const product=products.find(item=>item.id===review.productId)
    const moderationItem={...review,id:`REV-${Date.now()}`,product:product?.name||'Création MoroKika',status:'À modérer'}
    try{
      if(supabaseConfigured&&!localPreview)await submitPublicRecord('reviews',moderationItem)
      else{
        setSubmittedReviews(current => [review, ...current])
        const existing=readStoredArray('morokika-admin-reviews')
        writeStorage(localStorage,'morokika-admin-reviews',[moderationItem,...existing])
      }
      notify('Merci, votre avis a bien été reçu')
      return true
    }catch{
      notify('Envoi impossible pour le moment. Réessayez plus tard.')
      return false
    }
  }
  const addToCart = (product, size = sizes[0], qty = 1, message = '') => {
    const key = `${product.id}-${size.label}-${message}`
    setCart(prev => {
      const existing = prev.find(i => i.key === key)
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { key, productId: product.id, size: size.label, price: product.price + size.add, qty, message }]
    })
    notify(`${product.name} ajouté au panier`)
    setCartOpen(true)
  }
  const updateQty = (key, qty) => setCart(prev => qty < 1 ? prev.filter(i => i.key !== key) : prev.map(i => i.key === key ? { ...i, qty } : i))
  const clearCart = () => setCart([])
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  let page
  const activeSeoLanding=seoLandingPages.find(content=>content.path===route)
  const productCardProps = { addToCart, navigate, wishlist, toggleWishlist, settings:storeSettings }
  if (route.startsWith('/produit/')) {
    const product = products.find(p => p.id === decodeURIComponent(route.split('/')[2]))
    page = product ? <ProductPage product={product} {...productCardProps} submittedReviews={submittedReviews} addReview={addReview} /> : <NotFoundPage navigate={navigate} />
  } else if (route === '/boutique') page = <ShopPage {...productCardProps} />
  else if (route.startsWith('/collections/')) page = <CollectionPage slug={route.split('/')[2]} {...productCardProps} />
  else if (activeSeoLanding) page = <SeoLandingPage content={activeSeoLanding} {...productCardProps} />
  else if (route === '/favoris') page = <WishlistPage {...productCardProps} />
  else if (route === '/sur-mesure') page = <CustomCakePage navigate={navigate} />
  else if (route === '/la-maison') page = <AboutPage navigate={navigate} />
  else if (route === '/journal') page = <JournalPage navigate={navigate} />
  else if (route.startsWith('/journal/')) {
    const article=journalArticles.find(item=>item.slug===route.split('/')[2])
    page=article?<ArticlePage article={article} navigate={navigate}/>:<NotFoundPage navigate={navigate}/>
  }
  else if (route === '/livraison') page = <DeliveryPage navigate={navigate} settings={storeSettings}/>
  else if (route === '/guide-des-tailles') page = <SizeGuidePage navigate={navigate} />
  else if (route === '/allergenes') page = <AllergensPage navigate={navigate} />
  else if (route === '/contact') page = <ContactPage navigate={navigate} settings={storeSettings}/>
  else if (route === '/faq') page = <FaqPage navigate={navigate} />
  else if (['/confidentialite','/cgv','/mentions-legales'].includes(route)) page = <LegalPage route={route} navigate={navigate} settings={storeSettings}/>
  else if (route === '/checkout') page = <CheckoutPage cart={cart} clearCart={clearCart} navigate={navigate} settings={storeSettings}/>
  else if (route === '/') page = <HomePage {...productCardProps} publishedReviews={submittedReviews} />
  else page = <NotFoundPage navigate={navigate} />

  if(route.startsWith('/admin')) return <AdminAccessGate><AdminDashboard route={route} navigate={navigate}/></AdminAccessGate>

  return (
    <div className="app-shell">
      <div className="page-content" inert={(cartOpen||menuOpen||searchOpen)||undefined}>
      <a className="skip-link" href="#main-content">Aller au contenu</a>
      <Announcement settings={storeSettings}/>
      {!online&&<div className="offline-banner"><CircleHelp/>Vous êtes hors ligne — le catalogue reste disponible, mais le paiement nécessitera une connexion.</div>}
      <Header route={route} navigate={navigate} wishlistCount={wishlist.length} onWishlist={() => navigate('/favoris')} cartCount={cartCount} onCart={() => setCartOpen(true)} onMenu={() => setMenuOpen(true)} onSearch={() => setSearchOpen(true)} />
      <main id="main-content">{page}{coreSeoPages.some(item=>item.path===route)&&<CoreSeoExtension page={coreSeoPages.find(item=>item.path===route)} navigate={navigate}/>}</main>
      <Footer navigate={navigate} settings={storeSettings}/>
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} updateQty={updateQty} navigate={navigate} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navigate={navigate} wishlistCount={wishlist.length} settings={storeSettings}/>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} navigate={navigate} />
      <aside className="whatsapp-region" aria-label="Assistance"><a className="whatsapp-float" href={`https://wa.me/${whatsappDigits(storeSettings)}?text=Bonjour%20MoroKika%2C%20j%27aimerais%20un%20conseil`} target="_blank" rel="noreferrer" aria-label="Parler à MoroKika sur WhatsApp"><MessageCircle/><span>Besoin d’aide ?</span></a></aside>
      <div className={`toast ${toast ? 'show' : ''}`} role="status"><Check size={17}/>{toast}</div>
    </div>
  )
}

function AdminAccessGate({children}){
  const localBypass=import.meta.env.DEV&&['localhost','127.0.0.1'].includes(window.location.hostname)
  const [session,setSession]=useState(null),[authorized,setAuthorized]=useState(false),[loading,setLoading]=useState(supabaseConfigured&&!localBypass),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState('')
  useEffect(()=>{if(!supabaseConfigured||localBypass)return;let active=true,subscription;const setup=async()=>{const db=await getSupabase();const verify=async next=>{if(!active)return;if(!next){setSession(null);setAuthorized(false);setLoading(false);return}const{data,error:staffError}=await db.from('staff_users').select('user_id').eq('user_id',next.user.id).maybeSingle();if(!active)return;setSession(next);setAuthorized(Boolean(data&&!staffError));setLoading(false)};const{data:sessionData}=await db.auth.getSession();await verify(sessionData.session);const{data}=db.auth.onAuthStateChange((_event,next)=>{window.setTimeout(()=>verify(next),0)});subscription=data.subscription};setup().catch(()=>{if(active){setError('Connexion au service indisponible.');setLoading(false)}});return()=>{active=false;subscription?.unsubscribe()}},[localBypass])
  if(localBypass)return children
  if(!supabaseConfigured)return <section className="admin-auth-page"><div><Logo/><h1>Dashboard indisponible</h1><p>La connexion Supabase doit être configurée avant publication.</p></div></section>
  if(loading)return <section className="admin-auth-page"><div><p>Ouverture de l’espace vendeur…</p></div></section>
  if(session&&authorized)return children
  const login=async event=>{event.preventDefault();setError('');setLoading(true);const db=await getSupabase();const{data,error:loginError}=await db.auth.signInWithPassword({email,password});if(loginError){setError('E-mail ou mot de passe incorrect.');setLoading(false);return}const{data:staff}=await db.from('staff_users').select('user_id').eq('user_id',data.user.id).maybeSingle();if(!staff){await db.auth.signOut();setError('Ce compte ne dispose pas d’un accès vendeur.');setLoading(false)}}
  return <section className="admin-auth-page"><form onSubmit={login}><Logo/><span className="eyebrow">Espace privé</span><h1>Connexion vendeur</h1><p>Identifiez-vous pour gérer MoroKika.</p><label className="field"><span>E-mail</span><input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="field"><span>Mot de passe</span><input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<div className="form-error" role="alert">{error}</div>}<button className="btn btn-dark">Se connecter</button></form></section>
}

function AdminDashboard({route,navigate}) {
  const productionRemote=supabaseConfigured&&!localPreview
  const [navOpen,setNavOpen]=useState(false)
  const adminNavRef=useRef(null)
  useFocusTrap(navOpen,adminNavRef);useBodyScrollLock(navOpen)
  const [notificationsOpen,setNotificationsOpen]=useState(false)
  const [globalSearch,setGlobalSearch]=useState('')
  const [selectedOrder,setSelectedOrder]=useState(null)
  const [productModal,setProductModal]=useState(null)
  const [orders,setOrders]=useState(()=>{if(productionRemote)return[];const saved=readStoredArray('morokika-admin-orders');return saved.length?saved:seedOrders})
  const [adminProducts,setAdminProducts]=useState(()=>{if(productionRemote)return[];const saved=readStoredArray('morokika-admin-products');return saved.length?saved:products.map((product,index)=>({...product,stock:[12,8,5,10,3,7,0,9][index],active:index!==6}))})
  const [briefs,setBriefs]=useState(()=>{if(productionRemote)return[];const saved=readStoredArray('morokika-admin-briefs');return saved.length?saved:seedBriefs})
  const [moderation,setModeration]=useState(()=>{if(productionRemote)return[];const saved=readStoredArray('morokika-admin-reviews');return saved.length?saved:reviews.map((review,index)=>({...review,id:`REV-${index+1}`,product:products[index%products.length].name,status:index===0?'À modérer':'Publié'}))})
  const [messages,setMessages]=useState(()=>productionRemote?[]:readStoredArray('morokika-contact-messages'))
  const [subscribers,setSubscribers]=useState(()=>productionRemote?[]:readStoredArray('morokika-newsletter'))
  const [adminToast,setAdminToast]=useState('')
  const [remoteReady,setRemoteReady]=useState(false)
  useEffect(()=>{if(!supabaseConfigured||localPreview)return;let active=true;loadAdminStore().then(data=>{if(!active)return;setOrders(data.orders);if(data.products.length)setAdminProducts(data.products);setBriefs(data.customRequests);setModeration(data.reviews);setMessages(data.messages);setSubscribers(data.subscribers);setRemoteReady(true)}).catch(()=>{});return()=>{active=false}},[])
  useEffect(()=>{writeStorage(localStorage,'morokika-admin-orders',orders);if(remoteReady)syncCollection('orders',orders).catch(()=>{})},[orders,remoteReady])
  useEffect(()=>{if(productionRemote&&!remoteReady)return;writeStorage(localStorage,'morokika-admin-products',adminProducts);products.splice(0,products.length,...adminProducts);if(remoteReady)syncCollection('products',adminProducts).catch(()=>{})},[adminProducts,remoteReady,productionRemote])
  useEffect(()=>{writeStorage(localStorage,'morokika-admin-briefs',briefs);if(remoteReady)syncCollection('custom_requests',briefs).catch(()=>{})},[briefs,remoteReady])
  useEffect(()=>{writeStorage(localStorage,'morokika-admin-reviews',moderation);if(remoteReady)syncCollection('reviews',moderation).catch(()=>{})},[moderation,remoteReady])
  useEffect(()=>{writeStorage(localStorage,'morokika-contact-messages',messages);if(remoteReady)syncCollection('contact_messages',messages).catch(()=>{})},[messages,remoteReady])
  useEffect(()=>{writeStorage(localStorage,'morokika-newsletter',subscribers);if(remoteReady)syncCollection('newsletter_subscribers',subscribers).catch(()=>{})},[subscribers,remoteReady])
  const notify=message=>{setAdminToast(message);window.clearTimeout(window.__adminToast);window.__adminToast=window.setTimeout(()=>setAdminToast(''),2600)}
  useEffect(()=>{const closeTransient=event=>{if(event.key==='Escape'){setNavOpen(false);setNotificationsOpen(false)}};window.addEventListener('keydown',closeTransient);return()=>window.removeEventListener('keydown',closeTransient)},[])
  const go=path=>{navigate(path);setNavOpen(false);setNotificationsOpen(false)}
  const customerRecords=useMemo(()=>{const records=productionRemote?[]:seedCustomers.map(customer=>({...customer}));orders.forEach(order=>{if(!records.some(customer=>customer.email===order.email))records.push({name:order.customer,initials:order.initials,email:order.email,city:order.city,orders:1,spent:order.total,last:order.date,segment:'Nouveau'})});return records},[orders,productionRemote])
  const lowStockProduct=adminProducts.find(product=>hasTrackedStock(product)&&Number(product.stock)<=3)
  const liveNotifications=[orders[0]&&{title:'Nouvelle commande',text:`${orders[0].customer} · ${orders[0].product}`},lowStockProduct&&{title:'Stock faible',text:`${lowStockProduct.name} · ${lowStockProduct.stock} restant(s)`},briefs[0]&&{title:'Demande sur mesure',text:`${briefs[0].name} · ${briefs[0].occasion}`}].filter(Boolean)
  const labels={'/admin/overview':'Vue d’ensemble','/admin/orders':'Commandes','/admin/products':'Produits','/admin/custom':'Sur mesure','/admin/customers':'Clients','/admin/reviews':'Avis clients','/admin/messages':'Messages','/admin/analytics':'Analyses','/admin/settings':'Paramètres'}
  const requested=route==='/admin'?'/admin/overview':route
  const current=labels[requested]?requested:'/admin/overview'
  let content
  if(current==='/admin/orders') content=<AdminOrders orders={orders} setSelectedOrder={setSelectedOrder}/>
  else if(current==='/admin/products') content=<AdminProducts items={adminProducts} setItems={setAdminProducts} onAdd={()=>setProductModal('new')} onEdit={setProductModal} notify={notify} initialSearch={globalSearch}/>
  else if(current==='/admin/custom') content=<AdminBriefs briefs={briefs} setBriefs={setBriefs} notify={notify}/>
  else if(current==='/admin/customers') content=<AdminCustomers customers={customerRecords} orders={orders}/>
  else if(current==='/admin/reviews') content=<AdminReviews reviews={moderation} setReviews={setModeration} notify={notify}/>
  else if(current==='/admin/messages') content=<AdminMessages messages={messages} setMessages={setMessages} subscribers={subscribers} setSubscribers={setSubscribers} notify={notify}/>
  else if(current==='/admin/analytics') content=<AdminAnalytics orders={orders} products={adminProducts}/>
  else if(current==='/admin/settings') content=<AdminSettings notify={notify}/>
  else content=<AdminOverview orders={orders} products={adminProducts} navigate={go} setSelectedOrder={setSelectedOrder}/>
  const menu=[['/admin/overview',LayoutDashboard,'Vue d’ensemble'],['/admin/orders',ClipboardList,'Commandes'],['/admin/products',Boxes,'Produits'],['/admin/custom',Sparkles,'Sur mesure'],['/admin/customers',Users,'Clients'],['/admin/reviews',Star,'Avis clients'],['/admin/messages',Mail,'Messages'],['/admin/analytics',BarChart3,'Analyses'],['/admin/settings',Settings,'Paramètres']]
  return <div className="admin-shell">
    <a className="skip-link" href="#admin-main">Aller au contenu</a>
    <div ref={adminNavRef} className={`admin-sidebar ${navOpen?'open':''}`} role={navOpen?'dialog':'complementary'} aria-modal={navOpen||undefined} aria-label="Navigation vendeur"><div className="admin-brand"><Logo light onClick={()=>go('/admin')}/><span>ESPACE VENDEUR</span></div><nav aria-label="Sections du tableau de bord">{menu.map(([path,Icon,label])=><button key={path} className={current===path?'active':''} aria-current={current===path?'page':undefined} onClick={()=>go(path)}><Icon/><span>{label}</span>{path==='/admin/orders'&&<b>{orders.filter(order=>!['Livrée','Annulée'].includes(order.status)).length}</b>}{path==='/admin/custom'&&<b>{briefs.filter(brief=>['Nouvelle','En discussion'].includes(brief.status)).length}</b>}{path==='/admin/messages'&&messages.filter(message=>message.status!=='Traité').length>0&&<b>{messages.filter(message=>message.status!=='Traité').length}</b>}</button>)}</nav><div className="admin-sidebar-foot"><button onClick={()=>navigate('/')}><Store/><span>Voir la boutique</span><ArrowRight/></button>{supabaseConfigured&&!localPreview&&<button onClick={async()=>{const db=await getSupabase();await db.auth.signOut()}}><LogOut/><span>Se déconnecter</span></button>}<div><span>MK</span><div><strong>Compte vendeur</strong><small>Accès autorisé</small></div><button onClick={()=>go('/admin/settings')} aria-label="Paramètres du compte"><Settings/></button></div></div></div>
    {navOpen&&<button className="admin-nav-backdrop" onClick={()=>setNavOpen(false)} aria-label="Fermer la navigation"/>}
    <div className="admin-workspace" inert={navOpen||undefined}><header className="admin-topbar"><button className="admin-menu-toggle" onClick={()=>setNavOpen(true)} aria-label="Ouvrir la navigation"><PanelLeft/></button><div><span>{getAdminDateLabel()}</span><h1>{labels[current]||'Vue d’ensemble'}</h1></div><div className="admin-top-actions"><label className="admin-search"><Search/><input aria-label="Rechercher dans le tableau de bord" value={globalSearch} onChange={event=>setGlobalSearch(event.target.value)} onKeyDown={event=>{if(event.key==='Enter')go('/admin/products')}} placeholder="Rechercher…"/></label><div className="admin-notifications"><button onClick={()=>setNotificationsOpen(!notificationsOpen)} aria-label="Notifications" aria-expanded={notificationsOpen} aria-controls="admin-notifications-panel"><Bell/>{liveNotifications.length>0&&<span>{liveNotifications.length}</span>}</button>{notificationsOpen&&<div id="admin-notifications-panel"><strong>Notifications</strong>{liveNotifications.length?liveNotifications.map((item,index)=><article key={`${item.title}-${index}`}><span className="new"/><p><b>{item.title}</b><small>{item.text}</small></p></article>):<p className="admin-empty">Aucune notification.</p>}</div>}</div><button className="admin-avatar" onClick={()=>go('/admin/settings')} aria-label="Ouvrir les paramètres du compte">MK</button></div></header><main className="admin-main" id="admin-main">{content}</main></div>
    <AdminOrderDrawer order={selectedOrder} onClose={()=>setSelectedOrder(null)} onStatus={(id,status)=>{setOrders(items=>items.map(item=>item.id===id?{...item,status}:item));setSelectedOrder(currentOrder=>({...currentOrder,status}));notify('Statut de la commande mis à jour')}}/>
    <AddProductModal open={Boolean(productModal)} product={productModal==='new'?null:productModal} onClose={()=>setProductModal(null)} onSave={product=>{setAdminProducts(items=>productModal==='new'?[product,...items]:items.map(item=>item.id===product.id?product:item));const editing=productModal!=='new';setProductModal(null);notify(editing?'Produit mis à jour':'Nouveau produit ajouté')}}/>
    <div className={`admin-toast ${adminToast?'show':''}`} role="status"><CheckCircle2/>{adminToast}</div>
  </div>
}

function AdminPageHeader({eyebrow,title,description,actions}) {
  return <header className="admin-page-head"><div><span>{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>{actions&&<div>{actions}</div>}</header>
}

function AdminOverview({orders,products,navigate,setSelectedOrder}) {
  const valid=orders.filter(order=>order.status!=='Annulée')
  const revenue=valid.reduce((sum,order)=>sum+(Number(order.total)||0),0)
  const itemCount=valid.reduce((sum,order)=>sum+(Number(order.items)||0),0)
  const average=valid.length?Math.round(revenue/valid.length):0
  const statusCount=statuses=>orders.filter(order=>statuses.includes(order.status)).length
  const productActivity=products.map(product=>({...product,orderCount:valid.filter(order=>String(order.product||'').includes(product.name)).length})).filter(product=>product.orderCount>0).sort((a,b)=>b.orderCount-a.orderCount).slice(0,4)
  const kpis=[['Chiffre d’affaires',formatPrice(revenue),'Hors commandes annulées',CircleDollarSign],['Commandes',String(valid.length),'Actives ou livrées',ShoppingBag],['Panier moyen',formatPrice(average),'Par commande enregistrée',TrendingUp],['Articles',String(itemCount),'Unités commandées',CakeSlice]]
  return <div className="admin-overview"><AdminPageHeader eyebrow="Vue d’ensemble" title="Votre boutique aujourd’hui" description="Des indicateurs calculés uniquement à partir des données enregistrées." actions={<><button className="admin-date-btn" onClick={()=>navigate('/admin/analytics')}><CalendarDays/>{getAdminPeriodLabel()}<ChevronDown/></button><button className="admin-primary" onClick={()=>navigate('/admin/products')}><Plus/>Nouveau produit</button></>}/><section className="admin-kpis" aria-label="Indicateurs clés">{kpis.map(([label,value,note,Icon])=><article key={label}><div><span>{label}</span><Icon/></div><strong>{value}</strong><small>{note}</small></article>)}</section><section className="admin-dashboard-grid"><article className="admin-panel revenue-panel"><header><div><span>Performance réelle</span><h3>Chiffre d’affaires</h3></div></header><div className="revenue-total"><strong>{formatPrice(revenue)}</strong></div><RevenueChart orders={valid}/></article><article className="admin-panel orders-breakdown"><header><span>Commandes</span><h3>État des commandes</h3></header><div className="donut" aria-label="Répartition des commandes"><div><strong>{orders.length}</strong><span>Total</span></div></div><ul><li><i className="new"/>Nouvelles <b>{statusCount(['Nouvelle','À préparer'])}</b></li><li><i className="prep"/>En préparation <b>{statusCount(['En préparation'])}</b></li><li><i className="ready"/>Prêtes <b>{statusCount(['Prête','En livraison'])}</b></li><li><i className="done"/>Livrées <b>{statusCount(['Livrée'])}</b></li></ul></article></section><section className="admin-panel recent-orders"><header><div><span>Activité récente</span><h3>Dernières commandes</h3></div><button onClick={()=>navigate('/admin/orders')}>Voir toutes <ArrowRight/></button></header><AdminOrdersTable orders={orders.slice(0,5)} onSelect={setSelectedOrder}/></section><section className="admin-bottom-grid"><article className="admin-panel best-products"><header><div><span>Commandes enregistrées</span><h3>Produits commandés</h3></div><button onClick={()=>navigate('/admin/products')} aria-label="Voir tous les produits"><MoreHorizontal/></button></header>{productActivity.length?productActivity.map((product,index)=><div key={product.id}><span>{index+1}</span><img src={product.image} alt=""/><p><strong>{product.name}</strong><small>{product.orderCount} commande{product.orderCount>1?'s':''}</small></p></div>):<p className="analytics-empty">Les premières ventes apparaîtront ici.</p>}</article><article className="admin-panel stock-alerts"><header><div><span>À surveiller</span><h3>Alertes de stock</h3></div><span className="alert-count">{products.filter(isLowStock).length}</span></header>{products.filter(isLowStock).map(product=><div key={product.id}><img src={product.image} alt=""/><p><strong>{product.name}</strong><small>{product.stock===0?'Épuisé':`${product.stock} unités restantes`}</small></p><button onClick={()=>navigate('/admin/products')}>Gérer</button></div>)}</article></section></div>
}

function RevenueChart({orders=[]}) {
  if(!orders.length)return <div className="analytics-empty">Les premières ventes apparaîtront ici.</div>
  const points=orders.slice(0,7).reverse(),max=Math.max(...points.map(order=>Number(order.total)||0),1)
  return <div className="real-revenue-chart" aria-label="Dernières commandes">{points.map(order=><div key={order.id}><span style={{height:`${Math.max(8,(Number(order.total)||0)/max*100)}%`}} title={`${order.id} · ${formatPrice(order.total)}`}/><small>{String(order.date||'').split('·')[0]}</small></div>)}</div>
}

function StatusPill({status}) {
  const key={'Nouvelle':'new','En attente de paiement':'prep','À préparer':'new','En préparation':'prep','Prête':'ready','En livraison':'shipping','Livrée':'done','Annulée':'cancel','Confirmée':'done','En discussion':'prep','Devis envoyé':'ready','À modérer':'new','Publié':'done','Masqué':'cancel'}[status]||'new'
  return <span className={`admin-status ${key}`}><i/>{status}</span>
}

function AdminOrdersTable({orders,onSelect}) {
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Commande</th><th>Client</th><th>Date</th><th>Articles</th><th>Total</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{orders.map(order=><tr key={order.id} onClick={()=>onSelect(order)}><td><strong>#{order.id}</strong></td><td><div className="table-customer"><span>{order.initials}</span><p><b>{order.customer}</b><small>{order.city}</small></p></div></td><td>{order.date}</td><td>{order.items}</td><td><strong>{formatPrice(order.total)}</strong></td><td><StatusPill status={order.status}/></td><td><button onClick={event=>{event.stopPropagation();onSelect(order)}} aria-label={`Voir ${order.id}`}><ChevronRight/></button></td></tr>)}</tbody></table></div>
}

function AdminOrders({orders,setSelectedOrder}) {
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState('Toutes')
  const statuses=['Toutes','Nouvelle','En attente de paiement','À préparer','En préparation','Prête','En livraison','Livrée','Annulée']
  const filtered=orders.filter(order=>(status==='Toutes'||order.status===status)&&(order.id+order.customer+order.city).toLowerCase().includes(query.toLowerCase()))
  const exportOrders=()=>downloadCsv('commandes-morokika.csv',['Commande','Client','Ville','Total (DH)','Statut'],filtered.map(order=>[order.id,order.customer,order.city,order.total,order.status]))
  return <div><AdminPageHeader eyebrow="Opérations" title="Commandes" description="Suivez chaque gâteau, de la commande à la remise au client." actions={<button className="admin-secondary" onClick={exportOrders}><Download/>Exporter</button>}/><section className="admin-panel admin-list-panel"><div className="admin-filters"><label><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="N° de commande, client, ville…"/></label><div className="status-tabs">{statuses.map(item=><button key={item} className={status===item?'active':''} aria-pressed={status===item} onClick={()=>setStatus(item)}>{item}</button>)}</div><button className="filter-square" onClick={()=>{setStatus('Toutes');setQuery('')}} aria-label="Effacer les filtres"><SlidersHorizontal/></button></div><div className="list-result"><span>{filtered.length} commande{filtered.length!==1?'s':''}</span><small>Mise à jour il y a quelques secondes</small></div><AdminOrdersTable orders={filtered} onSelect={setSelectedOrder}/></section></div>
}

function AdminProducts({items,setItems,onAdd,onEdit,notify,initialSearch=''}) {
  const [query,setQuery]=useState(initialSearch)
  const [view,setView]=useState('table')
  useEffect(()=>setQuery(initialSearch),[initialSearch])
  const filtered=items.filter(product=>(product.name+product.category).toLowerCase().includes(query.toLowerCase()))
  const updateStock=(id,amount)=>{setItems(products=>products.map(product=>product.id===id?{...product,stock:Math.max(0,product.stock+amount)}:product));notify('Stock mis à jour')}
  const toggleActive=product=>{if(product.active&&items.filter(item=>item.active).length===1){notify('Au moins un produit doit rester publié');return}setItems(list=>list.map(item=>item.id===product.id?{...item,active:!item.active}:item));notify('Visibilité du produit mise à jour')}
  return <div><AdminPageHeader eyebrow="Catalogue" title="Produits" description="Gérez vos créations, leurs prix et leurs disponibilités." actions={<button className="admin-primary" onClick={onAdd}><Plus/>Ajouter un produit</button>}/><section className="product-admin-stats"><article><Package/><span><strong>{items.length}</strong><small>Produits</small></span></article><article><CheckCircle2/><span><strong>{items.filter(item=>item.active).length}</strong><small>En ligne</small></span></article><article><CircleHelp/><span><strong>{items.filter(isLowStock).length}</strong><small>Stock faible</small></span></article><article><Archive/><span><strong>{items.filter(item=>!item.active).length}</strong><small>Archivés</small></span></article></section><section className="admin-panel admin-list-panel"><div className="admin-filters"><label><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher un produit…"/></label><div className="view-toggle"><button className={view==='table'?'active':''} aria-pressed={view==='table'} onClick={()=>setView('table')} aria-label="Vue en tableau"><ClipboardList/></button><button className={view==='grid'?'active':''} aria-pressed={view==='grid'} onClick={()=>setView('grid')} aria-label="Vue en grille"><Boxes/></button></div></div>{view==='table'?<div className="admin-table-wrap"><table className="admin-table product-admin-table"><thead><tr><th>Produit</th><th>Collection</th><th>Prix</th><th>Stock</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{filtered.map(product=><tr key={product.id}><td><div className="admin-product-cell"><img src={product.image} alt=""/><div><strong>{product.name}</strong><small>SKU · {product.id.slice(0,12).toUpperCase()}</small></div></div></td><td>{product.category}</td><td><strong>{formatPrice(product.price)}</strong></td><td><div className="stock-stepper"><button onClick={()=>updateStock(product.id,-1)} aria-label={`Réduire le stock de ${product.name}`}><Minus/></button><span className={hasTrackedStock(product)&&Number(product.stock)<=3?'low':''}>{hasTrackedStock(product)?product.stock:'—'}</span><button onClick={()=>updateStock(product.id,1)} aria-label={`Augmenter le stock de ${product.name}`}><Plus/></button></div></td><td><button onClick={()=>toggleActive(product)} aria-label={`${product.active?'Masquer':'Publier'} ${product.name}`}><StatusPill status={product.active?'Publié':'Masqué'}/></button></td><td><button onClick={()=>onEdit(product)} aria-label={`Modifier ${product.name}`}><Pencil/></button></td></tr>)}</tbody></table></div>:<div className="admin-product-grid">{filtered.map(product=><article key={product.id}><img src={product.image} alt={product.name}/><div><StatusPill status={product.active?'Publié':'Masqué'}/><h3>{product.name}</h3><p>{product.short}</p><footer><strong>{formatPrice(product.price)}</strong><span>{hasTrackedStock(product)?`${product.stock} en stock`:'Sur commande'}</span><button onClick={()=>onEdit(product)} aria-label={`Modifier ${product.name}`}><Pencil/></button></footer></div></article>)}</div>}</section></div>
}

function AdminCustomers({customers,orders}) {
  const [query,setQuery]=useState('')
  const [selectedCustomer,setSelectedCustomer]=useState(null)
  const filtered=customers.filter(customer=>(customer.name+customer.email+customer.city).toLowerCase().includes(query.toLowerCase()))
  const totalSpent=customers.reduce((sum,customer)=>sum+(Number(customer.spent)||0),0),loyal=customers.filter(customer=>customer.orders>1).length,average=customers.length?Math.round(totalSpent/customers.length):0
  const exportCustomers=()=>downloadCsv('clients-morokika.csv',['Client','E-mail','Ville','Commandes','Total (DH)'],filtered.map(customer=>[customer.name,customer.email,customer.city,customer.orders,customer.spent]))
  return <div><AdminPageHeader eyebrow="Relations" title="Clients" description="Retrouvez vos meilleurs clients et l’historique de leur fidélité." actions={<button className="admin-secondary" onClick={exportCustomers}><Download/>Exporter</button>}/><section className="admin-kpis customer-kpis"><article><div><span>Clients actifs</span><Users/></div><strong>{customers.length}</strong><small>Contacts issus des commandes</small></article><article><div><span>Commandes clients</span><UserRound/></div><strong>{orders.length}</strong><small>Historique enregistré</small></article><article><div><span>Clients fidèles</span><Heart/></div><strong>{loyal}</strong><small>Plus d’une commande</small></article><article><div><span>Valeur moyenne</span><CircleDollarSign/></div><strong>{formatPrice(average)}</strong><small>Par client</small></article></section><section className="admin-panel admin-list-panel"><div className="admin-filters"><label><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nom, e-mail ou ville…"/></label><button className="filter-square" onClick={()=>setQuery('')} aria-label="Effacer la recherche"><SlidersHorizontal/></button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Client</th><th>Ville</th><th>Commandes</th><th>Total dépensé</th><th>Dernière commande</th><th>Segment</th><th>Actions</th></tr></thead><tbody>{filtered.map(customer=><tr key={customer.email}><td><div className="table-customer"><span>{customer.initials}</span><p><b>{customer.name}</b><small>{customer.email}</small></p></div></td><td>{customer.city}</td><td>{customer.orders}</td><td><strong>{formatPrice(customer.spent)}</strong></td><td>{customer.last}</td><td><span className={`customer-segment ${customer.segment.toLowerCase()}`}>{customer.segment}</span></td><td><button onClick={()=>setSelectedCustomer(customer)} aria-label={`Voir la fiche de ${customer.name}`}><ChevronRight/></button></td></tr>)}</tbody></table></div></section><AdminCustomerDrawer customer={selectedCustomer} orders={orders} onClose={()=>setSelectedCustomer(null)}/></div>
}

function AdminCustomerDrawer({customer,orders,onClose}) {
  const ref=useRef(null);useFocusTrap(Boolean(customer),ref);useModalEscape(Boolean(customer),onClose);useBodyScrollLock(Boolean(customer))
  const recent=customer?orders.filter(order=>order.email===customer.email):[]
  return <div className={`admin-drawer-wrap ${customer?'open':''}`} aria-hidden={!customer} inert={!customer}><button className="admin-drawer-backdrop" onClick={onClose} aria-label="Fermer"/><div ref={ref} role="dialog" aria-modal="true" aria-label="Fiche client" className="admin-order-drawer customer-drawer">{customer&&<><header role="presentation"><div><span>Fiche client</span><h2>{customer.name}</h2></div><button onClick={onClose} aria-label="Fermer"><X/></button></header><div className="customer-drawer-hero"><span>{customer.initials}</span><div><strong>{customer.name}</strong><small>Client {customer.segment.toLowerCase()} · {customer.city}</small></div><span className={`customer-segment ${customer.segment.toLowerCase()}`}>{customer.segment}</span></div><section><h3>Coordonnées</h3><div className="customer-contact-list"><a href={`mailto:${customer.email}`}><Mail/>{customer.email}</a><a href={`tel:${orders.find(order=>order.email===customer.email)?.phone||''}`}><Phone/>{orders.find(order=>order.email===customer.email)?.phone||'Téléphone non renseigné'}</a><span><MapPin/>{customer.city}, Maroc</span></div></section><section><h3>Relation client</h3><div className="customer-drawer-metrics"><div><strong>{customer.orders}</strong><span>Commandes</span></div><div><strong>{formatPrice(customer.spent)}</strong><span>Total dépensé</span></div><div><strong>{formatPrice(Math.round(customer.spent/customer.orders))}</strong><span>Panier moyen</span></div></div></section><section><h3>Dernière activité</h3>{recent.length?<div className="customer-recent-order"><div><strong>#{recent[0].id}</strong><span>{recent[0].date}</span></div><StatusPill status={recent[0].status}/><b>{formatPrice(recent[0].total)}</b></div>:<p className="customer-empty">Aucune commande récente dans cet aperçu.</p>}</section><footer><a className="admin-secondary" href={`mailto:${customer.email}`}><Mail/>Écrire au client</a><button className="admin-primary" onClick={onClose}>Terminé</button></footer></>}</div></div>
}

function AdminBriefs({briefs,setBriefs,notify}) {
  const [selectedBrief,setSelectedBrief]=useState(null)
  const columns=['Nouvelle','En discussion','Devis envoyé','Confirmée']
  const move=(id,status)=>{setBriefs(items=>items.map(item=>item.id===id?{...item,status}:item));notify('Demande sur mesure mise à jour')}
  const saveBrief=updated=>{setBriefs(items=>items.map(item=>item.id===updated.id?updated:item));setSelectedBrief(null);notify('Devis et notes enregistrés')}
  return <div><AdminPageHeader eyebrow="Atelier" title="Demandes sur mesure" description="Transformez chaque envie en une proposition mémorable."/><section className="brief-summary"><span><b>{briefs.length}</b> demandes ouvertes</span><span><b>2 850 DH</b> valeur estimée</span><span><b>6 h</b> temps de réponse moyen</span></section><section className="kanban-board">{columns.map(column=><div className="kanban-column" key={column}><header><span className={`kanban-dot ${column.replace(' ','-').toLowerCase()}`}/><h3>{column}</h3><b>{briefs.filter(item=>item.status===column).length}</b></header><div>{briefs.filter(item=>item.status===column).map(brief=><article key={brief.id}><div className="kanban-card-top"><span>{brief.id}</span><button onClick={()=>setSelectedBrief(brief)} aria-label={`Ouvrir la demande ${brief.id}`}><MoreHorizontal/></button></div><h4>{brief.occasion}</h4><p>{brief.name}</p><ul><li><CalendarDays/>{brief.date}</li><li><UsersRound/>{brief.guests} invités</li><li><CakeSlice/>{brief.flavor}</li></ul><div className="kanban-budget"><span>Budget</span><strong>{brief.budget}</strong></div><label>Déplacer vers<ChevronDown/><select value={brief.status} onChange={e=>move(brief.id,e.target.value)}>{columns.map(item=><option key={item}>{item}</option>)}</select></label></article>)}</div></div>)}</section><AdminBriefDrawer brief={selectedBrief} onClose={()=>setSelectedBrief(null)} onSave={saveBrief}/></div>
}

function AdminBriefDrawer({brief,onClose,onSave}) {
  const ref=useRef(null);useFocusTrap(Boolean(brief),ref);useModalEscape(Boolean(brief),onClose);useBodyScrollLock(Boolean(brief))
  const [quote,setQuote]=useState('')
  const [notes,setNotes]=useState('')
  const [status,setStatus]=useState('Nouvelle')
  useEffect(()=>{if(brief){setQuote(brief.quote||'');setNotes(brief.notes||'');setStatus(brief.status)}},[brief])
  return <div className={`admin-drawer-wrap ${brief?'open':''}`} aria-hidden={!brief} inert={!brief}><button className="admin-drawer-backdrop" onClick={onClose} aria-label="Fermer"/><div ref={ref} role="dialog" aria-modal="true" aria-label="Détail de la demande sur mesure" className="admin-order-drawer brief-drawer">{brief&&<><header role="presentation"><div><span>Demande sur mesure</span><h2>#{brief.id}</h2></div><button onClick={onClose} aria-label="Fermer"><X/></button></header><div className="brief-drawer-hero"><span>{brief.occasion}</span><h3>{brief.name}</h3><p>{brief.theme||'Direction artistique à préciser avec le client.'}</p></div><section><h3>Détails du projet</h3><div className="brief-detail-grid"><span><CalendarDays/><small>Date</small><strong>{brief.date}</strong></span><span><UsersRound/><small>Invités</small><strong>{brief.guests}</strong></span><span><CakeSlice/><small>Saveur</small><strong>{brief.flavor}</strong></span><span><CircleDollarSign/><small>Budget</small><strong>{brief.budget}</strong></span></div></section><section><h3>Contact</h3><div className="customer-contact-list"><a href={`mailto:${brief.email||''}`}><Mail/>{brief.email||'E-mail à confirmer'}</a><a href={`tel:${brief.phone||''}`}><Phone/>{brief.phone||'Téléphone à confirmer'}</a></div></section><section><h3>Suivi commercial</h3><div className="brief-edit-fields"><label>Étape<select value={status} onChange={event=>setStatus(event.target.value)}>{['Nouvelle','En discussion','Devis envoyé','Confirmée'].map(item=><option key={item}>{item}</option>)}</select></label><label>Montant du devis (DH)<input type="number" min="0" value={quote} onChange={event=>setQuote(event.target.value)} placeholder="Ex : 1 650"/></label><label className="full">Notes internes<textarea value={notes} onChange={event=>setNotes(event.target.value)} placeholder="Contraintes, décor, prochain échange…"/></label></div></section><footer><button className="admin-secondary" onClick={onClose}>Annuler</button><button className="admin-primary" onClick={()=>onSave({...brief,quote,notes,status})}><Check/>Enregistrer</button></footer></>}</div></div>
}

function AdminReviews({reviews,setReviews,notify}) {
  const [filter,setFilter]=useState('Tous')
  const [replying,setReplying]=useState(null)
  const [reply,setReply]=useState('')
  const visible=reviews.filter(review=>filter==='Tous'||review.status===filter)
  const published=reviews.filter(review=>review.status==='Publié')
  const average=published.length?(published.reduce((sum,review)=>sum+Number(review.rating||0),0)/published.length).toFixed(1):'—'
  const update=(id,status)=>{setReviews(items=>items.map(item=>item.id===id?{...item,status}:item));notify(status==='Publié'?'Avis publié':'Avis masqué')}
  const startReply=review=>{setReplying(review.id);setReply(review.reply||'')}
  const saveReply=(event,id)=>{event.preventDefault();const message=reply.trim();if(!message)return;setReviews(items=>items.map(item=>item.id===id?{...item,reply:message,status:'Publié'}:item));setReplying(null);setReply('');notify('Réponse publiée')}
  return <div><AdminPageHeader eyebrow="Réputation" title="Avis clients" description="Modérez les retours et prenez soin de chaque expérience."/><section className="review-admin-summary"><article><strong>{average}</strong><div>{published.length>0&&<Stars value={Number(average)}/>}<span>Note moyenne publiée</span></div></article><article><strong>{published.length}</strong><span>Avis publiés</span></article><article><strong>{reviews.filter(review=>review.status==='Masqué').length}</strong><span>Avis masqués</span></article><article><strong>{reviews.filter(review=>review.status==='À modérer').length}</strong><span>À modérer</span></article></section><section className="admin-panel admin-reviews-panel"><div className="status-tabs">{['Tous','À modérer','Publié','Masqué'].map(item=><button className={filter===item?'active':''} aria-pressed={filter===item} onClick={()=>setFilter(item)} key={item}>{item}</button>)}</div>{visible.map(review=><article key={review.id}><div className="review-admin-author"><span>{review.name[0]}</span><p><strong>{review.name}</strong><small>{review.city} · {review.date}</small></p></div><div className="review-admin-content"><Stars value={review.rating}/><h3>{review.product}</h3><p>“{review.text}”</p>{review.reply&&<div className="seller-review-reply"><strong>Réponse de MoroKika</strong><span>{review.reply}</span></div>}{replying===review.id&&<form className="review-reply-form" onSubmit={event=>saveReply(event,review.id)}><label htmlFor={`reply-${review.id}`}>Réponse publique</label><textarea id={`reply-${review.id}`} autoFocus value={reply} onChange={event=>setReply(event.target.value)} placeholder="Merci pour votre retour…"/><div><button type="button" onClick={()=>setReplying(null)}>Annuler</button><button type="submit">Publier la réponse</button></div></form>}</div><div className="review-admin-actions"><StatusPill status={review.status}/><button onClick={()=>startReply(review)}><MessageCircle/>{review.reply?'Modifier la réponse':'Répondre'}</button><button onClick={()=>update(review.id,'Publié')}><Check/>Publier</button><button onClick={()=>update(review.id,'Masqué')}><Archive/>Masquer</button></div></article>)}</section></div>
}

function AdminMessages({messages,setMessages,subscribers,setSubscribers,notify}) {
  const updateStatus=(id,status)=>{setMessages(items=>items.map(item=>item.id===id?{...item,status}:item));notify('Statut du message mis à jour')}
  const remove=async(table,id,setter)=>{try{if(supabaseConfigured&&!localPreview)await deleteRecord(table,id);setter(items=>items.filter(item=>item.id!==id));notify('Entrée supprimée')}catch{notify('Suppression impossible')}}
  const exportSubscribers=()=>downloadCsv('newsletter-morokika.csv',['E-mail','Statut'],subscribers.map(item=>[item.email,item.status||'Actif']))
  return <div><AdminPageHeader eyebrow="Boîte de réception" title="Messages" description="Demandes de contact et inscriptions à la newsletter."/><section className="admin-panel inbox-panel"><header><h3>Messages de contact</h3><span>{messages.length}</span></header>{messages.length?<div className="inbox-list">{messages.map(message=><article key={message.id}><div><strong>{message.name}</strong><a href={`mailto:${message.email}`}>{message.email}</a><small>{message.phone||'Téléphone non renseigné'} · {message.topic}</small></div><p>{message.message}</p><select aria-label={`Statut de ${message.name}`} value={message.status||'Nouveau'} onChange={e=>updateStatus(message.id,e.target.value)}><option>Nouveau</option><option>En cours</option><option>Traité</option></select><button onClick={()=>remove('contact_messages',message.id,setMessages)} aria-label={`Supprimer le message de ${message.name}`}><Trash2/></button></article>)}</div>:<div className="admin-empty">Aucun message reçu.</div>}</section><section className="admin-panel inbox-panel"><header><h3>Newsletter</h3><button className="admin-secondary" onClick={exportSubscribers}><Download/>Exporter</button></header>{subscribers.length?<div className="subscriber-list">{subscribers.map(item=><article key={item.id}><Mail/><strong>{item.email}</strong><span>{item.status||'Actif'}</span><button onClick={()=>remove('newsletter_subscribers',item.id,setSubscribers)} aria-label={`Supprimer ${item.email}`}><Trash2/></button></article>)}</div>:<div className="admin-empty">Aucune inscription.</div>}</section></div>
}

function AdminAnalytics({orders,products}) {
  const valid=orders.filter(order=>order.status!=='Annulée'),revenue=valid.reduce((sum,order)=>sum+(Number(order.total)||0),0),items=valid.reduce((sum,order)=>sum+(Number(order.items)||0),0),average=valid.length?Math.round(revenue/valid.length):0
  const cityCounts=valid.reduce((result,order)=>({...result,[order.city]:(result[order.city]||0)+1}),{}),cities=Object.entries(cityCounts).sort((a,b)=>b[1]-a[1]),maxCity=Math.max(...cities.map(([,count])=>count),1),top=products.map(product=>({...product,orderCount:valid.filter(order=>String(order.product||'').includes(product.name)).length})).filter(product=>product.orderCount>0).sort((a,b)=>b.orderCount-a.orderCount).slice(0,3)
  return <div><AdminPageHeader eyebrow="Performance réelle" title="Analyses" description="Indicateurs calculés uniquement à partir des commandes enregistrées."/><section className="admin-kpis"><article><div><span>Chiffre d’affaires</span><CircleDollarSign/></div><strong>{formatPrice(revenue)}</strong><small>Hors commandes annulées</small></article><article><div><span>Commandes</span><ShoppingBag/></div><strong>{valid.length}</strong><small>Commandes actives ou livrées</small></article><article><div><span>Articles vendus</span><CakeSlice/></div><strong>{items}</strong><small>Unités commandées</small></article><article><div><span>Panier moyen</span><Users/></div><strong>{formatPrice(average)}</strong><small>Par commande</small></article></section>{orders.length?<section className="analytics-grid"><article className="admin-panel analytics-revenue"><header><span>Évolution</span><h3>Dernières commandes</h3></header><div className="revenue-total"><strong>{formatPrice(revenue)}</strong></div><RevenueChart orders={valid}/></article><article className="admin-panel city-panel"><header><span>Localisation</span><h3>Commandes par ville</h3></header>{cities.map(([city,count])=><div key={city}><p><span>{city}</span><b>{count}</b></p><i><span style={{width:`${count/maxCity*100}%`}}/></i></div>)}</article><article className="admin-panel insights-panel"><header><span>Catalogue</span><h3>Produits les plus vendus</h3></header>{top.map(product=><div key={product.id}><CakeSlice/><p><strong>{product.name}</strong><span>{product.orderCount} commande(s) · {hasTrackedStock(product)?`${product.stock} en stock`:'sur commande'}</span></p></div>)}</article></section>:<section className="admin-panel analytics-empty-panel"><BarChart3/><h2>Aucune commande enregistrée</h2><p>Les analyses se construiront automatiquement à partir des premières commandes publiques.</p></section>}</div>
}

function AdminSettings({notify}) {
  const [settings,setSettings]=useStoreSettings(),[saving,setSaving]=useState(false),[activeSection,setActiveSection]=useState('shop'),[newPassword,setNewPassword]=useState(''),[confirmPassword,setConfirmPassword]=useState('')
  const update=(key,value)=>setSettings(current=>({...current,[key]:value})),updateRate=(city,value)=>setSettings(current=>({...current,rates:{...current.rates,[city]:Math.max(0,Number(value)||0)}}))
  const exportBackup=()=>{const keys=['morokika-admin-orders','morokika-admin-products','morokika-admin-briefs','morokika-admin-reviews','morokika-admin-settings'];const data=Object.fromEntries(keys.map(key=>{try{return[key,JSON.parse(localStorage.getItem(key)||'null')]}catch{return[key,null]}}));downloadJson(`morokika-sauvegarde-${new Date().toISOString().slice(0,10)}.json`,{schemaVersion:2,exportedAt:new Date().toISOString(),data})}
  const save=async()=>{if(!settings.cash&&!isBankTransferReady(settings)){notify('Activez le paiement à la réception ou complétez le virement');return}if(!settings.delivery&&!settings.pickup){notify('Activez la livraison ou le retrait');return}setSaving(true);const clean=mergeStoreSettings(settings);writeStorage(localStorage,'morokika-admin-settings',clean);try{if(supabaseConfigured&&!localPreview)await saveStoreSettings(clean);notify('Tous les réglages ont été enregistrés')}catch{notify('Migration Supabase requise : réglages conservés localement')}finally{setSaving(false)}}
  const changePassword=async()=>{if(newPassword.length<12){notify('Utilisez au moins 12 caractères');return}if(newPassword!==confirmPassword){notify('Les mots de passe ne correspondent pas');return}const db=await getSupabase();const{error}=await db.auth.updateUser({password:newPassword});if(error){notify('Le mot de passe n’a pas pu être modifié');return}setNewPassword('');setConfirmPassword('');notify('Mot de passe modifié')}
  const ready=isBankTransferReady(settings)
  return <div><AdminPageHeader eyebrow="Configuration" title="Paramètres" description="Pilotez les informations publiques, la livraison et les paiements."/><div className="settings-layout"><nav aria-label="Sections des paramètres">{[['shop','Boutique'],['delivery','Livraison'],['payments','Paiements'],['notifications','Notifications'],['data','Données']].map(([id,label])=><a key={id} href={`#${id}`} className={activeSection===id?'active':''} onClick={()=>setActiveSection(id)}>{label}</a>)}</nav><div><section className="admin-panel settings-card" id="shop"><header><h3>Informations publiques</h3><p>Coordonnées affichées dans la boutique.</p></header><div className="settings-form"><label>Nom de la boutique<input value={settings.shop} onChange={e=>update('shop',e.target.value)}/></label><label>Adresse e-mail<input type="email" value={settings.email} onChange={e=>update('email',e.target.value)}/></label><label>Téléphone<input value={settings.phone} onChange={e=>update('phone',e.target.value)}/></label><label>WhatsApp Business<input value={settings.whatsapp} onChange={e=>update('whatsapp',e.target.value)}/></label><label className="full">Adresse<textarea value={settings.address} onChange={e=>update('address',e.target.value)}/></label><label className="full">Horaires<input value={settings.hours} onChange={e=>update('hours',e.target.value)}/></label><label>Instagram<input type="url" value={settings.instagram} onChange={e=>update('instagram',e.target.value)}/></label><label>Facebook<input type="url" value={settings.facebook} onChange={e=>update('facebook',e.target.value)}/></label></div></section><section className="admin-panel settings-card" id="delivery"><header><h3>Livraison & retrait</h3><p>Options, délais et tarifs du checkout.</p></header><AdminToggle label="Livraison réfrigérée" checked={settings.delivery} onChange={v=>update('delivery',v)}/><AdminToggle label="Retrait à l’atelier" checked={settings.pickup} onChange={v=>update('pickup',v)}/><div className="settings-form settings-commerce"><label>Livraison offerte dès (DH)<input type="number" min="0" value={settings.threshold} onChange={e=>update('threshold',e.target.value)}/></label><label>Délai minimum (heures)<input type="number" min="0" value={settings.leadTime} onChange={e=>update('leadTime',e.target.value)}/></label><h4 className="full">Tarifs par ville</h4>{Object.entries(settings.rates).map(([city,rate])=><label key={city}>{city}<input type="number" min="0" value={rate} onChange={e=>updateRate(city,e.target.value)}/></label>)}</div></section><section className="admin-panel settings-card" id="payments"><header><h3>Moyens de paiement</h3><p>Le virement reste masqué tant que ses coordonnées sont incomplètes.</p></header><AdminToggle label="Paiement à la réception" description="Espèces à la livraison ou au retrait" checked={settings.cash} onChange={v=>update('cash',v)}/><AdminToggle label="Virement bancaire" description="Préparation après réception des fonds" checked={settings.bankTransfer} onChange={v=>update('bankTransfer',v)}/>{settings.bankTransfer&&<><div className={`bank-config-status ${ready?'ready':'incomplete'}`}>{ready?<CheckCircle2/>:<CircleHelp/>}<span><strong>{ready?'Virement prêt à être publié':'Coordonnées incomplètes'}</strong><small>{ready?'Le moyen de paiement apparaîtra au checkout.':'Banque, titulaire et RIB ou IBAN requis.'}</small></span></div><div className="settings-form"><label>Banque<input value={settings.bankName} onChange={e=>update('bankName',e.target.value)}/></label><label>Titulaire du compte<input value={settings.bankHolder} onChange={e=>update('bankHolder',e.target.value)}/></label><label className="full">RIB<input value={settings.bankRib} onChange={e=>update('bankRib',e.target.value)}/></label><label className="full">IBAN<input value={settings.bankIban} onChange={e=>update('bankIban',e.target.value)}/></label><label>SWIFT / BIC<input value={settings.bankBic} onChange={e=>update('bankBic',e.target.value)}/></label><label>Délai de virement (heures)<input type="number" min="1" value={settings.transferDeadline} onChange={e=>update('transferDeadline',e.target.value)}/></label></div></>}</section><section className="admin-panel settings-card" id="notifications"><header><h3>Notifications</h3></header><AdminToggle label="Nouvelles commandes" checked={settings.orders} onChange={v=>update('orders',v)}/><AdminToggle label="Avis à modérer" checked={settings.reviews} onChange={v=>update('reviews',v)}/><AdminToggle label="Stock faible" checked={settings.stock} onChange={v=>update('stock',v)}/></section><section className="admin-panel settings-card" id="data"><header><h3>Données</h3><p>Sauvegarde et connexion partagée.</p></header><div className="settings-data-row"><div><Download/><span><strong>Sauvegarde JSON</strong><small>Commandes, produits, demandes, avis et réglages.</small></span></div><button className="admin-secondary" onClick={exportBackup}>Exporter la sauvegarde</button></div><div className="settings-connection"><span className={supabaseConfigured?'connected':'local'}/><div><strong>{supabaseConfigured?'Projet Supabase configuré':'Mode local'}</strong><small>{supabaseConfigured?'Données partagées et règles de sécurité actives.':'Ajoutez les variables Supabase avant publication.'}</small></div></div>{supabaseConfigured&&!localPreview&&<div className="settings-password"><h4>Sécurité du compte</h4><div className="settings-form"><label>Nouveau mot de passe<input type="password" minLength="12" autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></label><label>Confirmer le mot de passe<input type="password" minLength="12" autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></label></div><button className="admin-secondary" onClick={changePassword}>Modifier le mot de passe</button></div>}</section><button className="admin-primary settings-save" disabled={saving} onClick={save}><Check/>{saving?'Enregistrement…':'Enregistrer tous les réglages'}</button></div></div></div>
}

function AdminToggle({label,description,checked,onChange,locked=false}) {
  return <label className={`admin-toggle ${locked?'locked':''}`}><span><strong>{label}</strong>{description&&<small>{description}</small>}</span><input type="checkbox" checked={checked} disabled={locked} onChange={e=>onChange(e.target.checked)}/><i><b/></i></label>
}

function AdminOrderDrawer({order,onClose,onStatus}) {
  const ref=useRef(null);useFocusTrap(Boolean(order),ref);useModalEscape(Boolean(order),onClose);useBodyScrollLock(Boolean(order))
  return <div className={`admin-drawer-wrap ${order?'open':''}`} aria-hidden={!order} inert={!order}><button className="admin-drawer-backdrop" onClick={onClose} aria-label="Fermer"/><div ref={ref} role="dialog" aria-modal="true" aria-label="Détail de la commande" className="admin-order-drawer">{order&&<><header role="presentation"><div><span>Commande</span><h2>#{order.id}</h2></div><button onClick={onClose} aria-label="Fermer"><X/></button></header><div className="order-drawer-status"><StatusPill status={order.status}/><span>{order.payment}</span></div><section><h3>Article</h3><div className="drawer-product"><img src={products.find(product=>order.product.includes(product.name.split(' ')[0]))?.image||products[0].image} alt=""/><div><strong>{order.product}</strong><small>Quantité · {order.items}</small></div><b>{formatPrice(order.total)}</b></div><div className="drawer-totals"><span>Sous-total <b>{formatPrice(order.total)}</b></span><span>Livraison <b>Offerte</b></span><strong>Total <b>{formatPrice(order.total)}</b></strong></div></section><section><h3>Client</h3><div className="drawer-person"><span>{order.initials}</span><p><strong>{order.customer}</strong><small>{order.email}<br/>{order.phone}</small></p></div></section><section><h3>Livraison</h3><p className="drawer-address"><MapPin/>{order.address}<br/>{order.city}</p><p className="drawer-address"><Clock3/>{order.slot}</p></section><section><h3>Mettre à jour le statut</h3><div className="select-wrap"><select aria-label="Statut de la commande" value={order.status} onChange={e=>onStatus(order.id,e.target.value)}>{['Nouvelle','À préparer','En préparation','Prête','En livraison','Livrée','Annulée'].map(status=><option key={status}>{status}</option>)}</select><ChevronDown/></div></section><footer><button className="admin-secondary" onClick={()=>window.print()}><Download/>Bon de commande</button><button className="admin-primary" onClick={onClose}>Terminé</button></footer></>}</div></div>
}

function AddProductModal({open,product,onClose,onSave}) {
  const ref=useRef(null);useFocusTrap(open,ref);useModalEscape(open,onClose);useBodyScrollLock(open)
  const empty={name:'',category:'Signatures',occasion:'Cadeau',price:'360',oldPrice:'',stock:'',badge:'Nouveau',short:'',description:'',ingredients:'',allergens:'',dietary:'Sans alcool',story:'',tasting:'',pairing:'',image:'',gallery:[],active:true}
  const [form,setForm]=useState(empty),[uploading,setUploading]=useState(false),[imageError,setImageError]=useState('')
  useEffect(()=>{if(open){setForm(product?{name:product.name||'',category:product.category||'Signatures',occasion:product.occasion||'Cadeau',price:String(product.price||360),oldPrice:product.oldPrice?String(product.oldPrice):'',stock:product.stock===null||product.stock===undefined?'':String(product.stock),badge:product.badge||'',short:product.short||'',description:product.description||'',ingredients:product.ingredients||'',allergens:product.allergens||'',dietary:(product.dietary||[]).join(', '),story:product.story||'',tasting:product.tasting||'',pairing:product.pairing||'',image:product.image||'',gallery:Array.isArray(product.gallery)?product.gallery:[],active:product.active!==false}:empty);setImageError('')}},[open,product])
  if(!open)return null
  const update=(key,value)=>setForm(current=>({...current,[key]:value})),imageId=product?.id||form.name||'creation'
  const upload=async(event,gallery=false)=>{const files=[...(event.target.files||[])].slice(0,gallery?Math.max(0,5-form.gallery.length):1);if(!files.length)return;setUploading(true);setImageError('');try{const urls=[];for(const file of files)urls.push(await uploadProductImage(file,imageId));if(gallery)setForm(current=>({...current,gallery:[...current.gallery,...urls].slice(0,5)}));else update('image',urls[0])}catch(error){setImageError(error.message)}finally{setUploading(false);event.target.value=''}}
  const submit=event=>{event.preventDefault();if(uploading)return;const description=form.description.trim()||form.short.trim()||'Nouvelle création artisanale',id=product?.id||`${form.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'creation'}-${Date.now().toString().slice(-6)}`,base=product||{id,color:'#e5ded1'};onSave({...base,id,name:form.name.trim(),category:form.category,occasion:form.occasion,price:Number(form.price),oldPrice:form.oldPrice?Number(form.oldPrice):null,stock:form.stock===''?null:Number(form.stock),badge:form.badge.trim()||null,short:form.short.trim()||description,description,ingredients:form.ingredients.trim()||'Composition à confirmer.',allergens:form.allergens.trim()||'Contactez notre équipe.',dietary:form.dietary.split(',').map(v=>v.trim()).filter(Boolean),story:form.story.trim()||description,tasting:form.tasting.trim()||'Conservez entre 2 °C et 5 °C.',pairing:form.pairing.trim()||'Servez avec une boisson peu sucrée.',image:form.image||'/images/pistachio-blossom.webp',gallery:form.gallery,active:form.active})}
  return <div className="admin-modal-wrap" role="dialog" aria-modal="true" aria-labelledby="product-modal-title"><button className="admin-drawer-backdrop" onClick={onClose} aria-label="Fermer"/><form ref={ref} className="admin-product-modal product-editor-modal" onSubmit={submit}><header role="presentation"><div><span>{product?'Modification complète':'Nouveau produit'}</span><h2 id="product-modal-title">{product?'Modifier la création':'Ajouter une création'}</h2></div><button type="button" onClick={onClose} aria-label="Fermer"><X/></button></header><div className="admin-modal-scroll"><section className="product-image-editor"><div className="product-main-preview">{form.image?<img src={form.image} alt="Aperçu principal"/>:<div><CakeSlice/><span>Aucune image principale</span></div>}</div><div><h3>Images du produit</h3><p>JPG, PNG, WebP ou AVIF, 12 Mo maximum. Conversion WebP automatique.</p><label className="admin-upload-btn">Choisir l’image principale<input type="file" accept="image/*" onChange={e=>upload(e,false)}/></label><label className="admin-upload-btn secondary">Ajouter à la galerie<input type="file" multiple accept="image/*" onChange={e=>upload(e,true)}/></label>{uploading&&<small>Optimisation et envoi…</small>}{imageError&&<small className="upload-error">{imageError}</small>}</div></section>{form.gallery.length>0&&<div className="product-gallery-editor">{form.gallery.map((image,index)=><div key={`${image}-${index}`}><img src={image} alt={`Galerie ${index+1}`}/><button type="button" onClick={()=>update('gallery',form.gallery.filter((_,i)=>i!==index))} aria-label={`Supprimer l’image ${index+1}`}><X/></button></div>)}</div>}<div className="admin-modal-fields expanded"><h3 className="full">Informations commerciales</h3><label className="full">Nom du produit<input required value={form.name} onChange={e=>update('name',e.target.value)}/></label><label>Collection<select value={form.category} onChange={e=>update('category',e.target.value)}><option>Signatures</option><option>Chocolat</option><option>Fruités</option><option>Saison</option><option>Cadeaux</option></select></label><label>Occasion<select value={form.occasion} onChange={e=>update('occasion',e.target.value)}><option>Cadeau</option><option>Anniversaire</option><option>Mariage</option><option>Réception</option></select></label><label>Prix de départ (DH)<input required type="number" min="100" value={form.price} onChange={e=>update('price',e.target.value)}/></label><label>Ancien prix<input type="number" min="0" value={form.oldPrice} onChange={e=>update('oldPrice',e.target.value)}/></label><label>Stock (vide = sur commande)<input type="number" min="0" value={form.stock} onChange={e=>update('stock',e.target.value)}/></label><label>Badge<input value={form.badge} onChange={e=>update('badge',e.target.value)}/></label><label className="full admin-inline-check"><input type="checkbox" checked={form.active} onChange={e=>update('active',e.target.checked)}/><span>Produit publié</span></label><h3 className="full">Contenu de la fiche</h3><label className="full">Description courte<textarea required value={form.short} onChange={e=>update('short',e.target.value)}/></label><label className="full">Description complète<textarea value={form.description} onChange={e=>update('description',e.target.value)}/></label><label className="full">Ingrédients<textarea value={form.ingredients} onChange={e=>update('ingredients',e.target.value)}/></label><label className="full">Allergènes<textarea value={form.allergens} onChange={e=>update('allergens',e.target.value)}/></label><label className="full">Préférences séparées par des virgules<input value={form.dietary} onChange={e=>update('dietary',e.target.value)}/></label><h3 className="full">Contenu éditorial</h3><label className="full">Histoire<textarea value={form.story} onChange={e=>update('story',e.target.value)}/></label><label className="full">Dégustation<textarea value={form.tasting} onChange={e=>update('tasting',e.target.value)}/></label><label className="full">Accord conseillé<textarea value={form.pairing} onChange={e=>update('pairing',e.target.value)}/></label></div></div><footer><button type="button" className="admin-secondary" onClick={onClose}>Annuler</button><button className="admin-primary" disabled={uploading}>{uploading?'Envoi des images…':product?'Enregistrer toutes les modifications':'Publier le produit'}</button></footer></form></div>
}

function NotFoundPage({navigate}) {
  return <section className="not-found"><span className="not-found-number">404</span><div><span className="eyebrow">Miette perdue</span><h1>Cette douceur<br/><em>n’est plus à table.</em></h1><p>La page que vous cherchez a peut-être changé d’adresse. Nos créations, elles, sont toujours bien au frais.</p><div><button className="btn btn-dark" onClick={()=>navigate('/boutique')}>Voir les gâteaux <ArrowRight/></button><button className="text-link dark-link" onClick={()=>navigate('/')}>Retour à l’accueil</button></div></div></section>
}

function Announcement({settings}) {
  return <aside className="announcement" aria-label="Information de livraison"><span>Livraison offerte à Rabat & Casablanca dès {settings.threshold} DH</span><span className="announcement-extra">·&nbsp;&nbsp; Commandez au moins {settings.leadTime} h à l’avance</span></aside>
}

function Logo({ light = false, onClick }) {
  return <button type="button" className={`logo ${light ? 'logo-light' : ''}`} onClick={onClick} aria-label="MoroKika accueil">
    <span className="logo-flourish">✦</span><span>Moro</span><em>Kika</em>
  </button>
}

function Header({ route, navigate, wishlistCount, onWishlist, cartCount, onCart, onMenu, onSearch }) {
  const active = route === '/' ? 'home' : route === '/boutique' || route.startsWith('/produit') || route.startsWith('/collections') ? 'shop' : route === '/sur-mesure' ? 'custom' : route === '/la-maison' ? 'about' : route.startsWith('/journal') ? 'journal' : ''
  return <header className="site-header">
    <div className="header-inner">
      <button className="icon-btn mobile-only" onClick={onMenu} aria-label="Menu"><Menu size={22}/></button>
      <nav className="main-nav nav-left" aria-label="Navigation principale">
        <button className={active === 'home' ? 'active' : ''} aria-current={active==='home'?'page':undefined} onClick={() => navigate('/')}>Accueil</button>
        <button className={active === 'shop' ? 'active' : ''} aria-current={active==='shop'?'page':undefined} onClick={() => navigate('/boutique')}>La boutique</button>
        <button className={active === 'custom' ? 'active' : ''} aria-current={active==='custom'?'page':undefined} onClick={() => navigate('/sur-mesure')}>Sur mesure</button>
      </nav>
      <Logo onClick={() => navigate('/')} />
      <nav className="main-nav nav-right" aria-label="Navigation secondaire">
        <button className={active === 'about' ? 'active' : ''} aria-current={active==='about'?'page':undefined} onClick={() => navigate('/la-maison')}>La maison</button>
        <button className={active === 'journal' ? 'active' : ''} aria-current={active==='journal'?'page':undefined} onClick={() => navigate('/journal')}>Journal</button>
        <button className="icon-btn" onClick={onSearch} aria-label="Rechercher"><Search size={20}/></button>
        <button className="wishlist-btn" onClick={onWishlist} aria-label={`Favoris, ${wishlistCount} articles`}><Heart size={19}/>{wishlistCount>0&&<span>{wishlistCount}</span>}</button>
        <button className="bag-btn" onClick={onCart} aria-label={`Panier, ${cartCount} articles`}><ShoppingBag size={20}/>{cartCount>0&&<span>{cartCount}</span>}</button>
      </nav>
      <button className="bag-btn mobile-only" onClick={onCart} aria-label={`Panier, ${cartCount} articles`}><ShoppingBag size={21}/>{cartCount>0&&<span>{cartCount}</span>}</button>
    </div>
  </header>
}

function CoreSeoExtension({page,navigate}){
  const sections=['/mentions-legales','/cgv','/confidentialite'].includes(page.path)?(corePageAdditions[page.path]||[]):enrichedSections(page.sections,corePageAdditions,page.path)
  return <section className="core-seo-extension section" aria-label={`Informations utiles — ${page.title}`}><div className="core-seo-extension-head"><span className="eyebrow">L’essentiel</span><h2>Informations utiles.</h2><p>{page.intro}</p></div><div className="core-seo-extension-grid">{sections.map(([title,text],index)=><article key={title}><span>0{index+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div><nav aria-label="Continuer la visite">{page.links.map(path=><button key={path} onClick={()=>navigate(path)}>{coreSeoPages.find(item=>item.path===path)?.title||seoLandingPages.find(item=>item.path===path)?.eyebrow||commerceLandingPages.find(item=>item.path===path)?.title||path.replaceAll('/','')}<ArrowRight/></button>)}</nav></section>
}

function HomePage({ addToCart, navigate, wishlist, toggleWishlist, publishedReviews=[] }) {
  const averageRating=publishedReviews.length?(publishedReviews.reduce((sum,review)=>sum+Number(review.rating||0),0)/publishedReviews.length).toFixed(1):null
  return <>
    <section className="hero">
      <img src="/images/hero-cake.webp" srcSet={responsiveImageSrcSet('/images/hero-cake.webp')} sizes="100vw" alt="Gâteau pistache et fleur d'oranger MoroKika dans un riad" fetchPriority="high" decoding="async" width="1586" height="992" />
      <div className="hero-shade" />
      <div className="hero-content reveal">
        <span className="eyebrow light">Pâtisserie artisanale · Maroc</span>
        <h1>Des gâteaux qui<br/><em>racontent le Maroc.</em></h1>
        <p>Des créations fines, préparées à la commande autour de saveurs marocaines contemporaines et remises avec soin.</p>
        <div className="hero-actions">
          <button className="btn btn-cream" onClick={() => navigate('/boutique')}>Découvrir la collection <ArrowRight size={17}/></button>
          <button className="text-link light-link" onClick={() => navigate('/la-maison')}>Notre savoir-faire</button>
        </div>
      </div>
      <div className="hero-note"><Sparkles size={15}/><span>Fait à la main<br/><strong>à Rabat</strong></span></div>
    </section>

    <section className="trust-strip" aria-label="Nos engagements">
      <div><CakeSlice/><span><strong>Préparé à la commande</strong><small>Après confirmation du créneau</small></span></div>
      <div><Leaf/><span><strong>Ingrédients choisis</strong><small>Locaux dès que possible</small></span></div>
      <div><Truck/><span><strong>Livraison soignée</strong><small>5 villes desservies</small></span></div>
      <div><Gift/><span><strong>Prêt à offrir</strong><small>Dans notre écrin signature</small></span></div>
    </section>

    <section className="section featured-section">
      <SectionHeading eyebrow="Pour chaque moment" title="Choisissez votre occasion" link="Tout découvrir" onLink={() => navigate('/boutique')} />
      <div className="collection-grid">
        <CollectionCard title="Les signatures" subtitle="Nos icônes, votre table" image="/images/pistachio-blossom.webp" onClick={() => navigate('/collections/signatures')} />
        <CollectionCard title="Joyeux anniversaire" subtitle="Le vœu le plus gourmand" image="/images/rose-raspberry.webp" onClick={() => navigate('/collections/anniversaires')} tall />
        <CollectionCard title="Petites attentions" subtitle="Un cadeau qui se savoure" image="/images/atlas-chocolate.webp" onClick={() => navigate('/collections/cadeaux')} />
      </div>
    </section>

    <section className="section bestsellers">
      <SectionHeading eyebrow="Nos signatures" title="Les incontournables" subtitle="Quatre créations pour découvrir les saveurs de la maison." link="Voir tous les gâteaux" onLink={() => navigate('/boutique')} />
      <div className="product-grid home-products">
        {products.slice(0,4).map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} navigate={navigate} wishlist={wishlist} toggleWishlist={toggleWishlist} />)}
      </div>
    </section>

    <section className="story-section" id="maison">
      <div className="story-image"><img src="/images/atelier-detail.webp" srcSet={responsiveImageSrcSet('/images/atelier-detail.webp')} sizes="(max-width: 760px) 100vw, 50vw" alt="Décoration artisanale d’un gâteau dans l’atelier MoroKika" loading="lazy" decoding="async" width="1254" height="1254"/><span className="story-stamp">Fait<br/>main<br/>♡</span></div>
      <div className="story-copy">
        <span className="eyebrow">L’histoire MoroKika</span>
        <h2>La douceur d’ici,<br/><em>réinventée.</em></h2>
        <p className="lead">MoroKika est née d’une envie simple : créer des gâteaux modernes qui gardent l’âme des saveurs marocaines.</p>
        <p>Dans notre atelier à Rabat, nous travaillons la fleur d’oranger, les dattes Majhoul, le safran de Taliouine et les fruits de saison avec les gestes précis de la pâtisserie contemporaine.</p>
        <button className="text-link dark-link" onClick={()=>navigate('/la-maison')}>Entrer dans notre atelier <ArrowRight size={16}/></button>
        <div className="story-stats"><div><strong>Sur commande</strong><span>après confirmation</span></div><div><strong>2–5 °C</strong><span>conservation conseillée</span></div><div><strong>5 villes</strong><span>desservies</span></div></div>
      </div>
    </section>

    <section className="custom-teaser">
      <div className="custom-teaser-copy"><span className="eyebrow light">Une idée rien qu’à vous</span><h2>Votre gâteau,<br/><em>sur mesure.</em></h2><p>Une couleur, un souvenir, une grande occasion : racontez-nous votre envie et notre atelier lui donnera forme.</p><button className="btn btn-cream" onClick={()=>navigate('/sur-mesure')}>Imaginer ma création <ArrowRight/></button></div>
      <div className="custom-teaser-images"><img src="/images/signature-box.webp" srcSet={responsiveImageSrcSet('/images/signature-box.webp')} sizes="(max-width: 760px) 40vw, 24vw" alt="Écrin pâtissier MoroKika" loading="lazy" decoding="async" width="1254" height="1254"/><img src="/images/rose-raspberry.webp" srcSet={responsiveImageSrcSet('/images/rose-raspberry.webp')} sizes="(max-width: 760px) 60vw, 32vw" alt="Gâteau personnalisé rose et framboise" loading="lazy" decoding="async" width="1254" height="1254"/></div>
    </section>

    <section className="home-occasion-paths section"><SectionHeading eyebrow="À chaque célébration" title="Un conseil pour votre moment" subtitle="Anniversaire, mariage, naissance ou attention professionnelle : commencez par les repères adaptés."/><div>{seoLandingPages.filter(page=>['/gateau-anniversaire-rabat','/gateau-mariage-rabat','/gateau-sbaa-rabat','/gateaux-entreprise-rabat'].includes(page.path)).map(page=><button key={page.path} onClick={()=>navigate(page.path)}><span>{page.eyebrow}</span><h3>{page.title}</h3><p>{page.metaDescription}</p><b>Découvrir <ArrowRight/></b></button>)}</div></section>

    {publishedReviews.length>0&&<section className="section reviews-home">
      <div className="review-intro"><span className="eyebrow">Vos mots doux</span><h2>Ils ont goûté.<br/><em>Ils racontent.</em></h2><div className="rating-big"><span>{averageRating}</span><div><Stars value={Number(averageRating)}/><small>{publishedReviews.length} avis publié{publishedReviews.length>1?'s':''}</small></div></div></div>
      <div className="review-cards">{publishedReviews.slice(0,2).map((review,index)=><ReviewCard key={review.id||index} review={review}/>)}</div>
    </section>}

    <Newsletter />
  </>
}

function SeoLandingPage({content,addToCart,navigate,wishlist,toggleWishlist}) {
  const selection=content.productIds.map(id=>products.find(product=>product.id===id)).filter(Boolean)
  const related=content.related.map(path=>seoLandingPages.find(page=>page.path===path)).filter(Boolean)
  const guideSlugs=content.path.includes('mariage')?['gateau-mariage-maroc-guide','brief-gateau-personnalise']:content.path.includes('anniversaire')?['organiser-gateau-anniversaire-rabat','message-gateau-anniversaire']:content.path.includes('sur-mesure')?['brief-gateau-personnalise','choisir-parfum-gateau']:content.path.includes('sbaa')?['organiser-gateau-sbaa','choisir-parfum-gateau']:content.path.includes('entreprise')?['gateau-evenement-entreprise','transport-conservation-gateau']:content.path.includes('livraison')?['transport-conservation-gateau','organiser-gateau-anniversaire-rabat']:['choisir-parfum-gateau','organiser-gateau-anniversaire-rabat']
  const guides=guideSlugs.map(slug=>journalArticles.find(article=>article.slug===slug)).filter(Boolean)
  return <div className="seo-landing-page">
    <nav className="breadcrumb section" aria-label="Fil d’Ariane"><button onClick={()=>navigate('/')}>Accueil</button><ChevronRight/><span>{content.eyebrow}</span></nav>
    <section className="seo-local-hero section"><div className="seo-local-copy"><span className="eyebrow">{content.eyebrow}</span><h1>{content.title}</h1><p>{content.intro}</p><div><button className="btn btn-dark" onClick={()=>navigate('/boutique')}>Voir les créations <ArrowRight/></button><button className="text-link dark-link" onClick={()=>navigate('/sur-mesure')}>Demander un gâteau sur mesure</button></div></div><figure><img src={content.image} srcSet={responsiveImageSrcSet(content.image)} sizes="(max-width: 760px) 100vw, 48vw" alt={content.imageAlt} {...publicImageDimensions(content.image)} decoding="async" fetchPriority="high"/><figcaption>MoroKika · Atelier d’Agdal</figcaption></figure></section>
    <section className="seo-local-facts section" aria-label="Informations pratiques">{content.facts.map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
    <section className="seo-local-body section"><div className="seo-local-intro"><span className="eyebrow">Notre approche</span><h2>Une commande pensée<br/><em>dans les moindres détails.</em></h2></div><div className="seo-local-sections">{enrichedSections(content.sections,localPageAdditions,content.path).map(([title,text],index)=><article key={title}><span>0{index+1}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</div><aside><Sparkles/><div><strong>Ce que vous pouvez attendre</strong><ul>{content.highlights.map(item=><li key={item}><Check/>{item}</li>)}</ul></div></aside></section>
    {selection.length>0&&<section className="seo-local-products section"><SectionHeading eyebrow="À découvrir" title="Trois créations pour commencer"/><div className="product-grid">{selection.map(product=><ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} wishlist={wishlist} toggleWishlist={toggleWishlist}/>)}</div><button className="text-link dark-link" onClick={()=>navigate('/boutique')}>Explorer toute la boutique <ArrowRight/></button></section>}
    <section className="seo-local-guides section"><SectionHeading eyebrow="Pour aller plus loin" title="Les conseils de l’atelier"/><div>{guides.map(article=><ArticleCard key={article.slug} article={article} navigate={navigate}/>)}</div></section>
    <section className="seo-local-faq section"><div><span className="eyebrow">Questions pratiques</span><h2>Avant de commander.</h2><p>Délais, formats, livraison et conservation : les réponses essentielles pour organiser votre moment sereinement.</p></div><div>{content.faqs.map(([question,answer])=><FaqItem key={question} question={question} answer={answer}/>)}</div></section>
    <section className="seo-local-related section"><span>Vous cherchez aussi</span><div>{related.map(page=><button key={page.path} onClick={()=>navigate(page.path)}><strong>{page.eyebrow}</strong><small>{page.metaDescription}</small><ArrowRight/></button>)}</div></section>
    <section className="seo-local-cta"><span className="eyebrow light">MoroKika · {content.region}</span><h2>{content.ctaTitle}</h2><p>{content.ctaText}</p><div><button className="btn btn-light" onClick={()=>navigate('/boutique')}>Commander en ligne <ArrowRight/></button><button className="text-link" onClick={()=>navigate('/contact')}>Parler à l’atelier</button></div></section>
    <Newsletter/>
  </div>
}

function CommerceGuide({guide,path}){
  if(!guide)return null
  return <><section className="seo-local-body collection-guide section"><div className="seo-local-intro"><span className="eyebrow">Conseil d’achat</span><h2>{guide.title}</h2><p>{guide.intro}</p></div><div className="seo-local-sections">{enrichedSections(guide.sections,commerceGuideAdditions,path).map(([title,text],index)=><article key={title}><span>0{index+1}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</div></section><section className="seo-local-faq section"><div><span className="eyebrow">Questions pratiques</span><h2>Avant de choisir.</h2></div><div>{guide.faqs.map(([question,answer])=><FaqItem key={question} question={question} answer={answer}/>)}</div></section></>
}

function CollectionPage({ slug, addToCart, navigate, wishlist, toggleWishlist }) {
  const collections={
    signatures:{eyebrow:'Les icônes MoroKika',title:'Nos signatures',intro:'Des créations qui portent notre manière de raconter le Maroc : précise, généreuse et résolument contemporaine.',image:'/images/pistachio-blossom.webp',products:products.filter(product=>product.category==='Signatures'||['atlas-chocolat','praline-cafe'].includes(product.id))},
    anniversaires:{eyebrow:'Un vœu gourmand',title:'Joyeux anniversaire',intro:'Des gâteaux spectaculaires mais toujours délicats, personnalisables avec le petit mot de votre choix.',image:'/images/rose-raspberry.webp',products:products.filter(product=>product.occasion==='Anniversaire'||product.id==='vanille-figue')},
    cadeaux:{eyebrow:'À offrir avec le cœur',title:'Petites attentions',intro:'Un gâteau dans son écrin signature, pour remercier, féliciter ou simplement faire plaisir.',image:'/images/atlas-chocolate.webp',products:products.filter(product=>product.occasion==='Cadeau'||product.id==='pistache-fleur-doranger')}
  }
  const collection=collections[slug]
  const guide=commerceSeoGuides[`/collections/${slug}`]
  if(!collection)return <NotFoundPage navigate={navigate}/>
  return <div className="collection-page"><section className="collection-hero"><img src={collection.image} srcSet={responsiveImageSrcSet(collection.image)} sizes="100vw" alt={collection.title} width="1254" height="1254" decoding="async" fetchPriority="high"/><div/><article><span className="eyebrow light">{collection.eyebrow}</span><h1>{collection.title}</h1><p>{collection.intro}</p><span>{collection.products.length} créations artisanales</span></article></section><section className="collection-products section"><div className="collection-intro"><span className="eyebrow">La sélection</span><h2>Choisie pour<br/><em>ce joli moment.</em></h2><p>Chaque gâteau est préparé à la commande dans notre atelier, puis livré dans un écrin réfrigéré.</p></div><div className="product-grid collection-product-grid">{collection.products.map(product=><ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} wishlist={wishlist} toggleWishlist={toggleWishlist}/>)}</div></section><CommerceGuide guide={guide} path={`/collections/${slug}`}/><section className="collection-service section"><div><Gift/><h3>Un petit mot offert</h3><p>Ajoutez votre message au moment de choisir la taille.</p></div><div><Truck/><h3>Livraison soignée</h3><p>En véhicule réfrigéré à Rabat, Salé, Témara, Kénitra et Casablanca.</p></div><div><MessageCircle/><h3>Besoin d’un conseil ?</h3><p>Notre équipe vous répond pour choisir le format et les saveurs.</p></div></section><Newsletter/></div>
}

function AboutPage({navigate}) {
  return <div className="about-page"><section className="about-hero"><div><span className="eyebrow light">La Maison MoroKika</span><h1>La douceur d’ici,<br/><em>avec un regard neuf.</em></h1><p>Une pâtisserie artisanale à Rabat, entre saveurs marocaines et gestes contemporains.</p></div><img src="/images/story-atelier.webp" srcSet={responsiveImageSrcSet('/images/story-atelier.webp')} sizes="100vw" alt="Travail de finition dans l’atelier MoroKika à Rabat" width="1448" height="1086" decoding="async" fetchPriority="high"/></section><section className="about-manifesto section"><span className="eyebrow">Notre histoire</span><blockquote>“Créer des gâteaux modernes qui gardent l’âme des saveurs marocaines.”</blockquote><div><p>MoroKika associe des parfums familiers des tables marocaines à des formats contemporains. La pistache, la fleur d’oranger, les dattes, le safran, les agrumes et le café donnent à chaque création une direction aromatique lisible.</p><p>Chaque gâteau est préparé à la commande dans l’atelier de Rabat, puis conservé au frais jusqu’à son retrait ou sa livraison. Les ingrédients principaux, allergènes, formats et conseils de dégustation sont indiqués sur sa fiche.</p></div></section><section className="about-split"><img src="/images/story-ingredients.webp" srcSet={responsiveImageSrcSet('/images/story-ingredients.webp')} sizes="(max-width: 760px) 100vw, 50vw" alt="Ingrédients marocains sélectionnés par MoroKika" loading="lazy" decoding="async" width="1448" height="1086"/><div><span className="eyebrow">Le goût avant tout</span><h2>Des ingrédients<br/><em>qui ont une histoire.</em></h2><p>Safran, dattes Majhoul, agrumes, pistache, figue, rose et café composent une collection aux profils différents. Chaque fiche permet de vérifier la recette annoncée avant de choisir.</p><ul><li><Check/>Ingrédients principaux détaillés par création</li><li><Check/>Figue fraîche proposée selon la saison</li><li><Check/>Formats de 6, 8 et 12 parts</li><li><Check/>Allergènes affichés avant la commande</li></ul></div></section><section className="about-values section"><SectionHeading eyebrow="Nos engagements" title="Ce qui guide nos mains"/><div><article><span>01</span><h3>La lisibilité</h3><p>Chaque fiche distingue les saveurs, le format, le prix et les allergènes.</p></article><article><span>02</span><h3>Le geste</h3><p>Les gâteaux sont préparés à la commande et finis dans l’atelier.</p></article><article><span>03</span><h3>L’attention</h3><p>Le petit mot, le format et le mode de remise sont vérifiés avant production.</p></article><article><span>04</span><h3>La transparence</h3><p>La disponibilité et le créneau restent soumis à une confirmation de l’atelier.</p></article></div></section><section className="about-table"><img src="/images/story-table.webp" srcSet={responsiveImageSrcSet('/images/story-table.webp')} sizes="100vw" alt="Gâteau MoroKika au centre d’une table marocaine" loading="lazy" decoding="async" width="1448" height="1086"/><div><span className="eyebrow light">À votre table</span><h2>Les beaux souvenirs<br/>commencent souvent<br/><em>par une part.</em></h2><button className="btn btn-cream" onClick={()=>navigate('/boutique')}>Découvrir les créations <ArrowRight/></button></div></section><Newsletter/></div>
}

function JournalPage({navigate}) {
  const orderedArticles=[...journalArticles].sort((a,b)=>articlePublishedDates[b.slug].localeCompare(articlePublishedDates[a.slug]))
  return <div className="journal-page"><header className="journal-header section"><span className="eyebrow">Carnet de la Maison</span><h1>Le Journal</h1><p>Ingrédients, gestes d’atelier et conseils pour célébrer avec goût.</p></header><section className="journal-feature section"><button onClick={()=>navigate(`/journal/${orderedArticles[0].slug}`)}><img src={orderedArticles[0].image} srcSet={responsiveImageSrcSet(orderedArticles[0].image)} sizes="(max-width: 760px) 100vw, 50vw" alt={orderedArticles[0].title} decoding="async" fetchPriority="high" {...publicImageDimensions(orderedArticles[0].image)}/><div><span>{orderedArticles[0].category} · {orderedArticles[0].readTime}</span><h2>{orderedArticles[0].title}</h2><p>{orderedArticles[0].excerpt}</p><b>Lire l’article <ArrowRight/></b></div></button></section><section className="journal-grid section">{orderedArticles.slice(1).map(article=><ArticleCard key={article.slug} article={article} navigate={navigate}/>)}</section><section className="journal-note section"><Sparkles/><p>Une question à laquelle vous aimeriez nous voir répondre ?</p><button className="text-link dark-link" onClick={()=>navigate('/contact')}>Écrivez-nous <ArrowRight/></button></section><Newsletter/></div>
}

function ArticleCard({article,navigate}) {
  return <article className="article-card"><button onClick={()=>navigate(`/journal/${article.slug}`)}><img src={article.image} srcSet={responsiveImageSrcSet(article.image)} sizes="(max-width: 760px) 100vw, 32vw" alt={article.title} loading="lazy" decoding="async" {...publicImageDimensions(article.image)}/><span>{article.category} · {article.readTime}</span><h2>{article.title}</h2><p>{article.excerpt}</p><b>Lire la suite <ArrowRight/></b></button></article>
}

function ArticlePage({article,navigate}) {
  const related=[...journalArticles].filter(item=>item.slug!==article.slug).sort((a,b)=>articlePublishedDates[b.slug].localeCompare(articlePublishedDates[a.slug])).slice(0,3)
  const serviceLinks={
    'organiser-gateau-anniversaire-rabat':['/gateau-anniversaire-rabat','Préparer un anniversaire à Rabat'],
    'gateau-mariage-maroc-guide':['/gateau-mariage-rabat','Découvrir nos gâteaux de mariage'],
    'transport-conservation-gateau':['/livraison','Consulter la livraison'],
    'choisir-taille-gateau':['/guide-des-tailles','Voir le guide des tailles'],
    'brief-gateau-personnalise':['/gateau-sur-mesure-rabat','Préparer un gâteau sur mesure'],
    'message-gateau-anniversaire':['/gateau-anniversaire-rabat','Choisir un gâteau d’anniversaire'],
    'organiser-gateau-sbaa':['/gateau-sbaa-rabat','Préparer un gâteau de sbâa'],
    'gateau-evenement-entreprise':['/gateaux-entreprise-rabat','Découvrir l’offre pour les équipes']
  }
  const serviceLink=serviceLinks[article.slug]||['/boutique','Goûter nos créations']
  return <div className="article-page"><div className="breadcrumb section"><button onClick={()=>navigate('/')}>Accueil</button><ChevronRight/><button onClick={()=>navigate('/journal')}>Journal</button><ChevronRight/><span>{article.title}</span></div><header className="article-header section"><span className="eyebrow">{article.category}</span><h1>{article.title}</h1><p>{article.intro}</p><div><span>{article.date}</span><i/>Lecture · {article.readTime}</div></header><figure className="article-cover section"><img src={article.image} srcSet={responsiveImageSrcSet(article.image)} sizes="(max-width: 760px) 100vw, 86vw" alt={article.title} decoding="async" fetchPriority="high" {...publicImageDimensions(article.image)}/></figure><div className="article-layout section"><aside><span>Partager</span><a href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(`À lire sur MoroKika : https://morokika.netlify.app/journal/${article.slug}`)}`} aria-label="Partager par e-mail">@</a><a href={`https://wa.me/?text=${encodeURIComponent(`${article.title} — https://morokika.netlify.app/journal/${article.slug}`)}`} target="_blank" rel="noreferrer" aria-label="Partager sur WhatsApp"><MessageCircle/></a></aside><article>{enrichedSections(article.sections,journalSectionAdditions,article.slug).map(([title,text],index)=><section key={title}><span>0{index+1}</span><h2>{title}</h2><p>{text}</p></section>)}<blockquote>Le secret n’est pas d’en faire davantage, mais de laisser chaque ingrédient parler clairement.</blockquote><button className="btn btn-dark" onClick={()=>navigate(serviceLink[0])}>{serviceLink[1]} <ArrowRight/></button></article></div><section className="related-articles section"><SectionHeading eyebrow="À lire ensuite" title="Dans le même carnet"/><div>{related.map(item=><ArticleCard key={item.slug} article={item} navigate={navigate}/>)}</div></section><Newsletter/></div>
}

function InfoPageHero({eyebrow,title,text,image,imageAlt}) {
  return <header className="info-hero"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div><img src={image} srcSet={responsiveImageSrcSet(image)} sizes="(max-width: 760px) 100vw, 50vw" alt={imageAlt} decoding="async" fetchPriority="high" {...publicImageDimensions(image)}/></header>
}

function DeliveryPage({navigate,settings}) {
  const [city,setCity]=useState('Rabat')
  const zones=Object.fromEntries(Object.entries(settings.rates).map(([name,rate])=>[name,[formatPrice(rate),`${settings.leadTime} h minimum`]]))
  return <div className="info-page"><InfoPageHero eyebrow="De notre atelier à votre table" title="Livraison & retrait" text="Votre gâteau voyage au frais, bien à plat et dans son écrin signature." image="/images/signature-box.webp" imageAlt="Écrin MoroKika protégeant un gâteau pour sa remise"/><section className="delivery-check section"><div><span className="eyebrow">Votre ville</span><h2>Quand arrive la douceur ?</h2><p>Choisissez votre ville pour connaître les conditions habituelles.</p></div><div className="city-checker"><label>Ville de livraison<div className="select-wrap"><select value={city} onChange={e=>setCity(e.target.value)}>{Object.keys(zones).map(item=><option key={item}>{item}</option>)}</select><ChevronDown/></div></label><div><Truck/><span><small>Tarif standard</small><strong>{zones[city][0]}</strong></span><span><small>Délai minimum</small><strong>{zones[city][1]}</strong></span></div><p>Livraison offerte dès {settings.threshold} DH à Rabat et Casablanca. Le tarif final est affiché au checkout.</p></div></section><section className="delivery-local-pages section"><div><span className="eyebrow">Desservir vos moments</span><h2>Livraison locale, conseils précis.</h2><p>Consultez les informations adaptées à votre ville ou à votre occasion.</p></div><div>{seoLandingPages.filter(page=>['/gateaux-rabat','/livraison-gateau-sale','/livraison-gateau-temara','/livraison-gateau-kenitra','/livraison-gateau-casablanca'].includes(page.path)).map(page=><button key={page.path} onClick={()=>navigate(page.path)}><MapPin/><span><strong>{page.eyebrow}</strong><small>{page.metaDescription}</small></span><ArrowRight/></button>)}</div></section><section className="delivery-steps"><div className="section"><article><span aria-hidden="true">01</span><PackageCheck/><h3>Préparé à la commande</h3><p>Votre gâteau est préparé à la commande puis conservé au frais jusqu’au départ.</p></article><article><span aria-hidden="true">02</span><ShieldCheck/><h3>Protégé et réfrigéré</h3><p>Un écrin rigide et un transport au frais préservent sa finition.</p></article><article><span aria-hidden="true">03</span><MapPin/><h3>Remis avec soin</h3><p>La remise est organisée sur le créneau confirmé.</p></article></div></section><section className="pickup-section section"><img src="/images/story-atelier.webp" srcSet={responsiveImageSrcSet('/images/story-atelier.webp')} sizes="(max-width: 760px) 100vw, 50vw" alt="Atelier MoroKika à Rabat" loading="lazy" decoding="async" width="1448" height="1086"/><div><span className="eyebrow">Retrait à l’atelier</span><h2>Passez nous voir<br/><em>à Agdal.</em></h2><p>Le retrait est gratuit et organisé uniquement sur un créneau confirmé. L’adresse précise est communiquée avec la confirmation de commande.</p><address>{settings.address}</address><button className="btn btn-dark" onClick={()=>navigate('/contact')}>Nous contacter <ArrowRight/></button></div></section><InfoCta navigate={navigate}/></div>
}

function SizeGuidePage({navigate}) {
  return <div className="info-page"><InfoPageHero eyebrow="Recevoir généreusement" title="Guide des tailles" text="Nos repères pour prévoir de belles parts, sans manquer et sans gaspiller." image="/images/story-table.webp" imageAlt="Gâteau MoroKika présenté sur une table dressée"/><section className="size-page-grid section">{sizes.map((size,index)=><article key={size.label}><div><span className={`size-circle size-${index}`}>{size.label.split(' ')[0]}</span><small>{size.note}</small></div><h2>{size.label}</h2><p>{index===0?'Idéal pour 4 à 6 invités, un dîner intime ou un goûter.':index===1?'Pensé pour 7 à 9 invités et les anniversaires en famille.':'Généreux pour 10 à 14 invités ou une grande tablée.'}</p><span>Supplément · {size.add?formatPrice(size.add):'Inclus'}</span></article>)}</section><section className="portion-advice section"><div><span className="eyebrow">Notre conseil</span><h2>Le menu change<br/><em>la taille de la part.</em></h2></div><div><p>Après un repas complet, comptez une part classique par personne. Pour un goûter où le gâteau est au centre de la table, prévoyez une marge de deux parts.</p><p>Les enfants prennent souvent une demi-part. À l’inverse, un entremets très léger peut donner envie de se resservir. En cas de doute, notre équipe vous conseille.</p><button className="text-link dark-link" onClick={()=>navigate('/contact')}>Demander conseil <ArrowRight/></button></div></section><section className="large-order section"><CakeSlice/><div><span className="eyebrow">15 invités et plus</span><h2>Imaginons le bon format.</h2><p>Pièce haute, plusieurs gâteaux ou présentation à étages : notre atelier crée une solution adaptée à votre table.</p></div><button className="btn btn-dark" onClick={()=>navigate('/sur-mesure')}>Créer sur mesure <ArrowRight/></button></section><InfoCta navigate={navigate}/></div>
}

function AllergensPage({navigate}) {
  const allergenRows=[['Gluten','Blé présent selon les recettes dans les génoises et biscuits.'],['Œufs','Présents selon les créations dans les biscuits, crèmes ou mousses.'],['Lait','Présent selon les recettes via la crème, le beurre, le mascarpone ou le chocolat au lait.'],['Fruits à coque','Pistache, noisette ou amande selon les recettes.'],['Sésame','Présent dans Caramel & Dattes Majhoul.']]
  const contains=(product,label)=>String(product.allergens||'').toLocaleLowerCase('fr').replaceAll('œ','oe').includes(label.replaceAll('œ','oe'))
  return <div className="info-page"><InfoPageHero eyebrow="Déguster en confiance" title="Allergènes & préférences" text="Des informations claires pour choisir la création la plus adaptée à votre table." image="/images/story-ingredients.webp" imageAlt="Ingrédients utilisés dans les créations MoroKika"/><section className="allergen-intro section"><div><CircleHelp/><p><strong>À savoir</strong>L’atelier manipule quotidiennement gluten, œufs, lait, fruits à coque et sésame. Comme l’espace de production est partagé entre les recettes, l’absence totale de traces croisées ne peut pas être garantie.</p></div><button className="btn btn-outline" onClick={()=>navigate('/contact')}>Parler à l’atelier</button></section><section className="allergen-list section"><span className="eyebrow">Les principaux allergènes</span>{allergenRows.map(([name,text])=><article key={name}><span>{name.slice(0,2).toUpperCase()}</span><h2>{name}</h2><p>{text}</p></article>)}</section><section className="allergen-matrix section"><div><span className="eyebrow">Vue d’ensemble</span><h2>Par création</h2><p>Consultez toujours la fiche détaillée avant de commander.</p></div><div className="matrix-table"><div className="matrix-head"><span>Création</span><span>Gluten</span><span>Œufs</span><span>Lait</span><span>Coques</span><span>Sésame</span></div>{products.map(product=><button key={product.id} onClick={()=>navigate(`/produit/${product.id}`)}><strong>{product.name}</strong><span>{contains(product,'gluten')?'●':'—'}</span><span>{contains(product,'œufs')?'●':'—'}</span><span>{contains(product,'lait')?'●':'—'}</span><span>{contains(product,'fruits à coque')?'●':'—'}</span><span>{contains(product,'sésame')?'●':'—'}</span></button>)}</div></section><InfoCta navigate={navigate}/></div>
}

function ContactPage({navigate,settings}) {
  const [sent,setSent]=useState(false)
  const [sending,setSending]=useState(false)
  const [submitError,setSubmitError]=useState('')
  const [form,setForm]=useState({name:'',email:'',phone:'',topic:'Une commande',message:''})
  const update=(key,value)=>setForm(current=>({...current,[key]:value}))
  const submit=async event=>{event.preventDefault();setSending(true);setSubmitError('');const message={id:`MSG-${Date.now()}`,...form};try{if(supabaseConfigured&&!localPreview)await submitPublicRecord('contact_messages',message);else writeStorage(localStorage,'morokika-contact-messages',[message,...readStoredArray('morokika-contact-messages')]);setSent(true)}catch{setSubmitError('Le message n’a pas pu être transmis. Réessayez.')}finally{setSending(false)}}
  return <div className="contact-page"><section className="contact-layout section"><div className="contact-copy"><span className="eyebrow">Parlons gourmandise</span><h1>Nous sommes<br/><em>tout ouïe.</em></h1><p>Une question sur une commande, un allergène ou une création sur mesure ? Notre équipe vous répond dès que possible.</p><div className="contact-methods"><a href={`tel:${settings.phone.replace(/\s/g,'')}`}><Phone/><span><small>Téléphone</small><strong>{settings.phone}</strong></span></a>{settings.email&&<a href={`mailto:${settings.email}`}><Mail/><span><small>E-mail</small><strong>{settings.email}</strong></span></a>}<a href={`https://wa.me/${whatsappDigits(settings)}`} target="_blank" rel="noreferrer"><MessageCircle/><span><small>WhatsApp</small><strong>Écrire maintenant</strong></span></a></div><address><MapPin/>{settings.address}<br/><Clock3/>{settings.hours}</address></div><div className="contact-form-wrap">{sent?<div className="contact-sent"><div><Check/></div><h2>Message bien envoyé</h2><p>Merci {form.name}. Nous revenons vers vous dès que possible.</p><button className="btn btn-dark" onClick={()=>setSent(false)}>Envoyer un autre message</button></div>:<form onSubmit={submit}><h2>Écrivez-nous</h2><div className="contact-fields"><label className="field"><span>Votre nom</span><input required value={form.name} onChange={e=>update('name',e.target.value)}/></label><label className="field"><span>Adresse e-mail</span><input required type="email" value={form.email} onChange={e=>update('email',e.target.value)}/></label><label className="field"><span>Téléphone <em>Optionnel</em></span><input type="tel" value={form.phone} onChange={e=>update('phone',e.target.value)}/></label><label className="field"><span>Sujet</span><div className="select-wrap"><select value={form.topic} onChange={e=>update('topic',e.target.value)}><option>Une commande</option><option>Un gâteau sur mesure</option><option>Allergènes</option><option>Livraison</option><option>Autre question</option></select><ChevronDown/></div></label><label className="field full"><span>Votre message</span><textarea required minLength={10} value={form.message} onChange={e=>update('message',e.target.value)} placeholder="Dites-nous tout…"/></label></div>{submitError&&<div className="form-error" role="alert">{submitError}</div>}<button className="btn btn-dark" type="submit" disabled={sending}>{sending?'Envoi en cours…':<>Envoyer mon message <ArrowRight/></>}</button><small>Vos informations servent uniquement à répondre à cette demande.</small></form>}</div></section><section className="contact-faq"><span>Vous trouverez peut-être déjà la réponse.</span><button className="text-link dark-link" onClick={()=>navigate('/faq')}>Consulter la FAQ <ArrowRight/></button></section></div>
}

function FaqPage({navigate}) {
  const groups=[['Commander',[['Combien de temps à l’avance dois-je commander ?','Nous conseillons 48 heures pour la collection permanente et au moins sept jours pour une création sur mesure. Les disponibilités affichées sur chaque fiche restent la référence.'],['Puis-je modifier mon gâteau ?','La taille et le petit mot se choisissent sur la fiche produit. Pour modifier une recette ou une décoration, utilisez notre formulaire sur mesure.'],['Quels moyens de paiement acceptez-vous ?','Nous acceptons les espèces à la livraison ou au retrait. Le virement bancaire est également proposé lorsque ses coordonnées sont activées au checkout.']]],["Livraison & conservation",[['Dans quelles villes livrez-vous ?','Nous desservons Rabat, Salé, Témara, Kénitra et Casablanca. Les tarifs et délais sont précisés sur la page Livraison.'],['Comment conserver mon gâteau ?','Gardez-le entre 2°C et 5°C, puis sortez-le environ vingt minutes avant dégustation. Consommez-le idéalement sous 48 heures.'],['Puis-je retirer ma commande ?','Oui, lorsque cette option est proposée, le retrait à Agdal est gratuit et organisé uniquement sur un créneau confirmé.']]],["Recettes & allergènes",[['Vos gâteaux sont-ils halal ?','Les fiches des recettes publiées ne mentionnent pas d’alcool. Si ce point est déterminant pour vous, demandez une confirmation pour la création choisie avant de commander.'],['Proposez-vous des créations sans fruits à coque ?','Certaines recettes sont formulées sans fruits à coque, mais notre atelier en manipule. Nous ne pouvons donc garantir l’absence de traces croisées.'],['Les décorations sont-elles comestibles ?','Pas nécessairement. La confirmation de commande précise les éléments décoratifs qui doivent être retirés avant la découpe ; en cas de doute, demandez à l’atelier avant de servir.']]]]
  return <div className="faq-page"><header className="faq-header section"><span className="eyebrow">Besoin d’aide ?</span><h1>Questions fréquentes</h1><p>Tout ce qu’il faut savoir avant de choisir, commander et déguster.</p></header><div className="faq-layout section"><aside><CircleHelp/><h2>Une autre question ?</h2><p>Le formulaire transmet votre demande à l’atelier pour un suivi structuré.</p><button className="btn btn-dark" onClick={()=>navigate('/contact')}>Nous écrire</button></aside><div>{groups.map(([group,items])=><section key={group}><h2>{group}</h2>{items.map(([question,answer])=><FaqItem key={question} question={question} answer={answer}/>)}</section>)}</div></div><InfoCta navigate={navigate}/></div>
}

function FaqItem({question,answer}) {
  const [open,setOpen]=useState(false)
  return <article className={`faq-item ${open?'open':''}`}><button onClick={()=>setOpen(!open)} aria-expanded={open}><span>{question}</span>{open?<Minus/>:<Plus/>}</button>{open&&<p>{answer}</p>}</article>
}

function InfoCta({navigate}) {
  return <section className="info-cta"><span className="eyebrow light">Encore une question ?</span><h2>Nous sommes là pour vous.</h2><div><button className="btn btn-cream" onClick={()=>navigate('/contact')}>Contacter l’atelier</button><button className="text-link light-link" onClick={()=>navigate('/faq')}>Voir la FAQ <ArrowRight/></button></div></section>
}

function SectionHeading({ eyebrow, title, subtitle, link, onLink }) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{link && <button className="text-link dark-link" onClick={onLink}>{link}<ArrowRight size={16}/></button>}</div>
}

function CollectionCard({ title, subtitle, image, onClick, tall }) {
  return <button className={`collection-card ${tall ? 'tall' : ''}`} onClick={onClick}>
    <img src={image} srcSet={responsiveImageSrcSet(image)} sizes="(max-width: 760px) 100vw, 33vw" alt={title} loading="lazy" decoding="async" width="1254" height="1254"/><div className="collection-fade"/><div><span>{subtitle}</span><h3>{title}</h3><b>Explorer <ArrowRight size={15}/></b></div>
  </button>
}

function ProductCard({ product, addToCart, navigate, wishlist, toggleWishlist }) {
  const liked = wishlist.includes(product.id)
  const unavailable=product.stock===0
  return <article className={`product-card ${unavailable?'sold-out':''}`}>
    <div className="product-image" onClick={() => navigate(`/produit/${product.id}`)}>
      <img src={product.image} srcSet={responsiveImageSrcSet(product.image)} sizes="(max-width: 760px) 46vw, (max-width: 1100px) 30vw, 280px" alt={product.name} loading="lazy" decoding="async" width="1254" height="1254"/>
      {unavailable?<span className="product-badge">Épuisé</span>:product.badge&&<span className="product-badge">{product.badge}</span>}
      <button className={`heart ${liked ? 'liked' : ''}`} onClick={e => { e.stopPropagation(); toggleWishlist(product) }} aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}><Heart size={18} fill={liked ? 'currentColor' : 'none'}/></button>
      <button className="quick-add" disabled={unavailable} onClick={e => { e.stopPropagation();if(!unavailable)addToCart(product) }}>{unavailable?'Indisponible':<><Plus size={17}/> Ajouter</>}</button>
    </div>
    <div className="product-info">
      <button className="product-name" onClick={() => navigate(`/produit/${product.id}`)}>{product.name}</button>
      <p>{product.short}</p>
      <div className="product-price"><strong>{formatPrice(product.price)}</strong>{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}<small>à partir de</small></div>
    </div>
  </article>
}

function ShopPage({ addToCart, navigate, wishlist, toggleWishlist }) {
  const [category, setCategory] = useState('Tous')
  const [dietary, setDietary] = useState([])
  const [priceMax, setPriceMax] = useState(450)
  const [sort, setSort] = useState('featured')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtered = useMemo(() => {
    let result = products.filter(p => (category === 'Tous' || p.category === category) && p.price <= priceMax && dietary.every(d => p.dietary.includes(d)))
    if (sort === 'price-low') result.sort((a,b) => a.price-b.price)
    if (sort === 'price-high') result.sort((a,b) => b.price-a.price)
    if (sort === 'new') result.sort((a,b) => (b.badge === 'Nouveau') - (a.badge === 'Nouveau'))
    return result
  }, [category, dietary, priceMax, sort])
  const toggleDiet = d => setDietary(x => x.includes(d) ? x.filter(v => v !== d) : [...x,d])
  const clear = () => { setCategory('Tous'); setDietary([]); setPriceMax(450) }
  return <div className="shop-page">
    <section className="shop-hero">
      <div><span className="eyebrow">La collection</span><h1>Le bonheur,<br/><em>part par part.</em></h1><p>Des créations artisanales préparées à la commande dans notre atelier de Rabat.</p></div>
      <div className="shop-hero-art"><img src="/images/berry-cheesecake.webp" srcSet={responsiveImageSrcSet('/images/berry-cheesecake.webp')} sizes="(max-width: 760px) 100vw, 50vw" alt="Collection de gâteaux MoroKika" decoding="async" fetchPriority="high" width="1254" height="1254"/></div>
    </section>
    <div className="shop-toolbar section">
      <div><strong>{filtered.length} créations</strong><span>Préparées rien que pour vous</span></div>
      <div className="toolbar-actions"><button className="filter-mobile" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={17}/>Filtrer</button><label>Trier par<select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Nos recommandations</option><option value="new">Nouveautés</option><option value="price-low">Prix croissant</option><option value="price-high">Prix décroissant</option></select><ChevronDown size={16}/></label></div>
    </div>
    <div className="shop-layout section">
      <Filters category={category} setCategory={setCategory} dietary={dietary} toggleDiet={toggleDiet} priceMax={priceMax} setPriceMax={setPriceMax} clear={clear} className={filtersOpen ? 'mobile-filter-open' : ''} close={() => setFiltersOpen(false)} />
      <div className="shop-results">
        {(category !== 'Tous' || dietary.length > 0 || priceMax < 450) && <div className="active-filters"><span>Filtres actifs</span>{category !== 'Tous' && <button onClick={()=>setCategory('Tous')}>{category}<X size={13}/></button>}{dietary.map(d=><button key={d} onClick={()=>toggleDiet(d)}>{d}<X size={13}/></button>)}<button className="clear-inline" onClick={clear}>Tout effacer</button></div>}
        {filtered.length ? <div className="product-grid shop-grid">{filtered.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} navigate={navigate} wishlist={wishlist} toggleWishlist={toggleWishlist}/>)}</div> : <div className="empty-results"><CakeSlice/><h3>Aucune douceur par ici</h3><p>Essayez d’élargir vos filtres pour retrouver nos créations.</p><button className="btn btn-dark" onClick={clear}>Effacer les filtres</button></div>}
      </div>
    </div>
    <CommerceGuide guide={commerceSeoGuides['/boutique']} path="/boutique"/>
    <Newsletter />
  </div>
}

function Filters({ category, setCategory, dietary, toggleDiet, priceMax, setPriceMax, clear, className='', close }) {
  return <aside className={`filters ${className}`}>
    <div className="filter-mobile-head"><strong>Filtrer les créations</strong><button onClick={close}><X/></button></div>
    <div className="filter-heading"><span>Filtres</span><button onClick={clear}>Tout effacer</button></div>
    <FilterGroup title="Collection" open><div className="radio-list">{['Tous','Signatures','Chocolat','Fruités'].map(c=><label key={c}><input type="radio" name="category" checked={category===c} onChange={()=>setCategory(c)}/><span></span>{c}<small>{c === 'Tous' ? products.length : products.filter(p=>p.category===c).length}</small></label>)}</div></FilterGroup>
    <FilterGroup title="Préférences" open><div className="check-list">{['Sans alcool','Sans fruits à coque'].map(d=><label key={d}><input type="checkbox" checked={dietary.includes(d)} onChange={()=>toggleDiet(d)}/><span><Check size={12}/></span>{d}</label>)}</div></FilterGroup>
    <FilterGroup title="Budget" open><div className="price-values"><span>250 DH</span><span>{priceMax} DH</span></div><input className="range" type="range" aria-label="Budget maximum" min="280" max="450" step="10" value={priceMax} onChange={e=>setPriceMax(Number(e.target.value))}/></FilterGroup>
    <FilterGroup title="Occasion"><div className="check-list"><label><input type="checkbox"/><span><Check size={12}/></span>Anniversaire</label><label><input type="checkbox"/><span><Check size={12}/></span>Cadeau</label></div></FilterGroup>
    <button className="btn btn-dark apply-mobile" onClick={close}>Voir les créations</button>
  </aside>
}

function FilterGroup({ title, children, open: initial=false }) {
  const [open, setOpen] = useState(initial)
  return <div className={`filter-group ${open ? 'open':''}`}><button onClick={()=>setOpen(!open)}><span>{title}</span><ChevronDown size={17}/></button>{open && <div className="filter-content">{children}</div>}</div>
}

function WishlistPage({ addToCart, navigate, wishlist, toggleWishlist }) {
  const saved = products.filter(product => wishlist.includes(product.id))
  return <div className="wishlist-page">
    <section className="wishlist-hero section">
      <span className="eyebrow">Votre sélection</span>
      <h1>Mes petits<br/><em>coups de cœur.</em></h1>
      <p>{saved.length ? `${saved.length} création${saved.length > 1 ? 's' : ''} gardée${saved.length > 1 ? 's' : ''} précieusement pour plus tard.` : 'Gardez ici les créations qui vous font envie.'}</p>
    </section>
    <section className="wishlist-content section">
      {saved.length ? <div className="product-grid wishlist-grid">{saved.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} wishlist={wishlist} toggleWishlist={toggleWishlist}/>)}</div> : <div className="empty-wishlist"><div><Heart/></div><h2>Aucun favori pour le moment</h2><p>Cliquez sur le cœur d’une création pour la retrouver facilement ici.</p><button className="btn btn-dark" onClick={()=>navigate('/boutique')}>Découvrir la collection <ArrowRight/></button></div>}
    </section>
    <Newsletter />
  </div>
}

function LegalPage({ route, navigate, settings }) {
  const pages = {
    '/confidentialite': {
      eyebrow:'Vos données', title:'Politique de confidentialité', intro:'Nous protégeons vos informations avec la même attention que nos créations.',
      sections:[
        ['Données collectées','Lors d’une commande ou d’une demande sur mesure, nous recueillons uniquement les informations nécessaires : identité, coordonnées, adresse de livraison et détails de la demande. Aucune donnée de carte bancaire n’est demandée ni conservée.'],
        ['Utilisation et conservation','Ces informations servent à préparer votre commande, organiser sa livraison et répondre à vos demandes. Les commandes et formulaires transmis sont conservés dans l’infrastructure sécurisée de la boutique. Le panier, les favoris et le brouillon de commande restent dans votre navigateur.'],
        ['Prestataires techniques','MoroKika utilise Supabase pour les données opérationnelles et les images, ainsi que WhatsApp pour les échanges choisis par le client. Ces prestataires traitent uniquement les informations nécessaires à leurs services.'],
        ['Vos droits',`Vous pouvez demander l’accès, la rectification ou la suppression de vos informations depuis le formulaire de contact ou au ${settings.phone}. Aucune donnée n’est vendue à des tiers.`],
        ['Cookies et stockage local','MoroKika utilise uniquement le stockage nécessaire au panier, aux favoris, au checkout, à l’espace vendeur sécurisé et au mode hors ligne. Vous pouvez supprimer ces données depuis les réglages de votre navigateur. Aucun cookie publicitaire n’est installé.']
      ]
    },
    '/cgv': {
      eyebrow:'Commander sereinement', title:'Conditions générales de vente', intro:'Les règles essentielles pour une commande claire, fraîche et livrée avec soin.',
      sections:[
        ['Produits et prix','Les créations sont préparées à la commande. Les prix sont indiqués en dirhams marocains, toutes taxes comprises. Les photographies sont présentées à titre illustratif ; la fabrication artisanale peut entraîner de légères variations.'],
        ['Commande et paiement','Le règlement s’effectue en espèces à la réception ou par virement bancaire lorsque cette option est proposée. Une commande par virement entre en préparation après réception des fonds.'],
        ['Modification et annulation','Une modification peut être demandée jusqu’à 48 heures avant le créneau prévu, sous réserve de faisabilité. Les produits étant confectionnés sur mesure et périssables, le droit de rétractation peut ne pas s’appliquer après le début de la préparation.'],
        ['Livraison et conservation','Les créneaux dépendent de la ville et des disponibilités de l’atelier. À réception, conservez le gâteau entre 2°C et 5°C et suivez les conseils indiqués sur sa fiche.'],
        ['Allergènes','Nos créations peuvent contenir gluten, œufs, lait, fruits à coque et sésame. Malgré nos précautions, l’atelier ne peut garantir l’absence totale de traces croisées. Signalez toute allergie avant de commander.']
      ]
    },
    '/mentions-legales': {
      eyebrow:'La maison', title:'Mentions légales', intro:'Informations relatives à l’édition et à l’exploitation du site MoroKika.',
      sections:[
        ['Éditeur',`${settings.shop}, pâtisserie artisanale basée à Agdal, Rabat, Maroc. Contact téléphone et WhatsApp Business : ${settings.phone}.`],
        ['Responsabilité','Les informations du site sont régulièrement mises à jour. MoroKika ne saurait être tenue responsable d’une interruption temporaire, d’une indisponibilité ou d’une utilisation non conforme du service.'],
        ['Propriété intellectuelle','La marque, l’identité visuelle, les textes et les photographies présentés sur ce site sont protégés. Toute reproduction ou adaptation requiert une autorisation écrite préalable.'],
        ['Hébergement','Le site public est hébergé par Netlify. Les données opérationnelles de la boutique et les images téléversées depuis le tableau de bord sont hébergées par Supabase.']
      ]
    }
  }
  const page=pages[route]||pages['/mentions-legales']
  return <div className="legal-page"><header className="legal-hero section"><span className="eyebrow">{page.eyebrow}</span><h1>{page.title}</h1><p>{page.intro}</p><small>Dernière mise à jour : 16 septembre 2026</small></header><div className="legal-layout section"><nav aria-label="Informations légales">{Object.entries({'/confidentialite':'Confidentialité','/cgv':'Conditions de vente','/mentions-legales':'Mentions légales'}).map(([path,label])=><button className={route===path?'active':''} onClick={()=>navigate(path)} key={path}>{label}<ChevronRight/></button>)}</nav><article>{page.sections.map(([title,text])=><section key={title}><h2>{title}</h2><p>{text}</p></section>)}<div className="legal-contact"><MessageCircle/><div><strong>Une question ?</strong><span>Contactez-nous au {settings.phone} ou via WhatsApp.</span></div></div></article></div></div>
}

function CustomCakePage({ navigate }) {
  const [step,setStep]=useState(1)
  const [sent,setSent]=useState(false)
  const [error,setError]=useState('')
  const [briefRef] = useState(()=>createOrderRef().replace('MK','SUR'))
  const [form,setForm]=useState({occasion:'Anniversaire',guests:'10–15',date:getFutureISO(7),flavor:'Pistache & fleur d’oranger',style:'Élégant',nutFree:false,message:'',budget:'800–1 200 DH',name:'',phone:'',email:''})
  const flavors=[['Pistache & fleur d’oranger','Doux · floral'],['Chocolat & noisette','Intense · gourmand'],['Vanille & fruits rouges','Frais · fruité'],['Agrumes & safran','Vif · délicat']]
  const styles=[['Élégant','#e8ddca'],['Floral','#d6a49a'],['Festif','#b99857'],['Minimaliste','#bdc8bd']]
  const update=(key,value)=>setForm(current=>({...current,[key]:value}))
  const next=()=>{setError('');setStep(current=>Math.min(3,current+1));window.scrollTo({top:0,behavior:'smooth'})}
  const submit=async()=>{
    if(!form.name.trim()||!form.phone.trim()||!form.email.trim()){setError('Complétez vos coordonnées pour envoyer la demande.');return}
    if(!/^\S+@\S+\.\S+$/.test(form.email)||form.phone.replace(/\D/g,'').length<9){setError('Vérifiez votre adresse e-mail et votre numéro de téléphone.');return}
    const existing=readStoredArray('morokika-admin-briefs')
    const brief={id:briefRef,name:form.name.trim(),email:form.email.trim(),phone:form.phone.trim(),occasion:form.occasion,date:formatDeliveryDate(form.date),guests:form.guests,flavor:form.flavor,budget:form.budget,theme:`Style ${form.style}${form.message.trim()?` · ${form.message.trim()}`:''}`,notes:form.nutFree?'Demande sans fruits à coque — vérifier les traces croisées.':'',status:'Nouvelle'}
    if(supabaseConfigured&&!localPreview){try{await submitPublicRecord('custom_requests',brief)}catch{setError('Transmission impossible pour le moment.');return}}
    writeStorage(localStorage,'morokika-admin-briefs',[brief,...(existing.length?existing:seedBriefs)])
    setSent(true);window.scrollTo({top:0,behavior:'smooth'})
  }
  if(sent)return <section className="custom-success"><div className="success-mark"><Check/></div><span className="eyebrow">Demande bien reçue</span><h1>Votre idée est<br/><em>entre de bonnes mains.</em></h1><p>L’atelier étudiera votre demande <strong>#{briefRef}</strong> puis vous indiquera la faisabilité, le délai de réponse et les prochaines étapes.</p><div className="custom-success-details"><div><CalendarDays/><span><small>Date souhaitée</small><strong>{formatDeliveryDate(form.date)}</strong></span></div><div><UsersRound/><span><small>Nombre d’invités</small><strong>{form.guests} personnes</strong></span></div></div><button className="btn btn-dark" onClick={()=>navigate('/')}>Retour à l’accueil</button></section>
  return <div className="custom-page">
    <section className="custom-page-hero"><div><span className="eyebrow light">Créations personnalisées</span><h1>Racontez-nous<br/><em>votre occasion.</em></h1><p>Nous imaginons ensemble un gâteau unique, façonné à la main dans notre atelier de Rabat.</p></div><img src="/images/atelier-detail.webp" srcSet={responsiveImageSrcSet('/images/atelier-detail.webp')} sizes="(max-width: 760px) 100vw, 50vw" alt="Création d’un gâteau personnalisé dans l’atelier" decoding="async" width="1254" height="1254"/></section>
    <div className="custom-builder section">
      <div className="builder-main">
        <div className="builder-progress">{['Votre occasion','Vos envies','Vos coordonnées'].map((label,index)=><div className={`${step===index+1?'active':''} ${step>index+1?'done':''}`} key={label}><span>{step>index+1?<Check/>:index+1}</span><b>{label}</b>{index<2&&<i/>}</div>)}</div>
        {step===1&&<div className="builder-step"><span className="eyebrow">Étape 1</span><h2>Pour quel joli moment ?</h2><p>Ces quelques détails nous aideront à vous proposer le bon format.</p><div className="occasion-grid">{['Anniversaire','Mariage','Fiançailles','Événement'].map(value=><button className={form.occasion===value?'selected':''} key={value} onClick={()=>update('occasion',value)}><span>{value==='Anniversaire'?'🎂':value==='Mariage'?'♡':value==='Fiançailles'?'✦':'☼'}</span><b>{value}</b>{form.occasion===value&&<Check/>}</button>)}</div><div className="builder-fields"><label className="field"><span>Nombre d’invités</span><div className="select-wrap"><select value={form.guests} onChange={e=>update('guests',e.target.value)}><option>6–10</option><option>10–15</option><option>15–25</option><option>25–40</option><option>40+</option></select><ChevronDown/></div></label><label className="field"><span>Date souhaitée</span><input type="date" min={getFutureISO(7)} value={form.date} onChange={e=>update('date',e.target.value)}/></label></div></div>}
        {step===2&&<div className="builder-step"><span className="eyebrow">Étape 2</span><h2>Quel goût aura la fête ?</h2><p>Choisissez une base. Nous affinerons la recette avec vous.</p><div className="flavor-grid">{flavors.map(([name,note])=><button className={form.flavor===name?'selected':''} key={name} onClick={()=>update('flavor',name)}><span></span><div><b>{name}</b><small>{note}</small></div>{form.flavor===name&&<Check/>}</button>)}</div><h3 className="builder-label">L’univers visuel</h3><div className="style-grid">{styles.map(([name,color])=><button className={form.style===name?'selected':''} key={name} onClick={()=>update('style',name)}><i style={{background:color}}/><span>{name}</span></button>)}</div><label className="save-check custom-check"><input type="checkbox" checked={form.nutFree} onChange={e=>update('nutFree',e.target.checked)}/><span><Check/></span>Je souhaite une proposition sans fruits à coque</label></div>}
        {step===3&&<div className="builder-step"><span className="eyebrow">Étape 3</span><h2>Derniers petits détails.</h2><p>Laissez vos coordonnées afin que l’atelier puisse étudier le projet et vous indiquer la suite.</p><div className="builder-fields"><label className="field full"><span>Budget indicatif</span><div className="select-wrap"><select value={form.budget} onChange={e=>update('budget',e.target.value)}><option>500–800 DH</option><option>800–1 200 DH</option><option>1 200–2 000 DH</option><option>Plus de 2 000 DH</option></select><ChevronDown/></div></label><label className="field"><span>Votre nom</span><input value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Prénom et nom"/></label><label className="field"><span>Téléphone</span><input type="tel" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="06 00 00 00 00"/></label><label className="field full"><span>Adresse e-mail</span><input type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="vous@exemple.ma"/></label><label className="field full"><span>Votre idée <em>Optionnel</em></span><textarea value={form.message} onChange={e=>update('message',e.target.value)} placeholder="Couleurs, thème, inscription, inspiration…"/></label></div>{error&&<div className="builder-error"><CircleHelp/>{error}</div>}</div>}
        <div className="builder-actions">{step>1?<button className="btn btn-outline" onClick={()=>setStep(step-1)}><ArrowLeft/>Retour</button>:<button className="text-link dark-link" onClick={()=>navigate('/')}>Annuler</button>}<button className="btn btn-dark" onClick={step<3?next:submit}>{step<3?'Continuer':'Envoyer ma demande'}<ArrowRight/></button></div>
      </div>
      <aside className="brief-card"><span className="eyebrow">Votre brief</span><div className="brief-visual"><img src="/images/rose-raspberry.webp" srcSet={responsiveImageSrcSet('/images/rose-raspberry.webp')} sizes="(max-width: 760px) 100vw, 50vw" alt="Inspiration de gâteau sur mesure" loading="lazy" decoding="async" width="1254" height="1254"/><span style={{background:styles.find(item=>item[0]===form.style)?.[1]}}/></div><h3>{form.occasion}</h3><ul><li><UsersRound/><span>{form.guests} invités</span></li><li><CakeSlice/><span>{form.flavor}</span></li><li><Sparkles/><span>Style {form.style.toLowerCase()}</span></li><li><CalendarDays/><span>{formatDeliveryDate(form.date)}</span></li></ul><div className="brief-price"><span>Budget envisagé</span><strong>{form.budget}</strong></div><p><ShieldCheck/>Demande sans engagement. Délai de réponse précisé après étude.</p></aside>
    </div>
    <section className="custom-resources section"><div><span className="eyebrow">Préparer votre projet</span><h2>Des repères avant<br/><em>d’envoyer le brief.</em></h2><p>Délais, informations utiles et conseils adaptés aux grandes occasions.</p></div><div><button onClick={()=>navigate('/journal/brief-gateau-personnalise')}><strong>Rédiger un brief précis</strong><small>Les informations qui permettent une réponse claire.</small><ArrowRight/></button><button onClick={()=>navigate('/gateau-sbaa-rabat')}><strong>Sbâa & naissance</strong><small>Format, prénom, parfum et organisation.</small><ArrowRight/></button><button onClick={()=>navigate('/gateaux-entreprise-rabat')}><strong>Entreprises & équipes</strong><small>Une attention professionnelle livrée au bon moment.</small><ArrowRight/></button></div></section>
  </div>
}

function ProductPage({ product, addToCart, navigate, wishlist, toggleWishlist, submittedReviews, addReview, settings }) {
  const [size, setSize] = useState(sizes[0])
  const [reviewOpen, setReviewOpen] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [qty, setQty] = useState(1)
  const [giftMessage, setGiftMessage] = useState('')
  const [mainImage, setMainImage] = useState(product.image)
  const [accordion, setAccordion] = useState('details')
  useEffect(()=>{setMainImage(product.image); setSize(sizes[0]); setQty(1); setGiftMessage(''); setShowAllReviews(false)},[product.id])
  const gallery=[...new Set([product.image,...(Array.isArray(product.gallery)&&product.gallery.length?product.gallery:['/images/signature-box.webp','/images/atelier-detail.webp'])].filter(Boolean))]
  const localReviews = submittedReviews.filter(review => review.productId === product.id)
  const reviewCount = localReviews.length
  const displayRating = reviewCount ? (localReviews.reduce((sum,review)=>sum+Number(review.rating||0),0)/reviewCount).toFixed(1) : null
  const visibleReviews = localReviews
  const reviewDistribution=[5,4,3,2,1].map(stars=>[stars,reviewCount?Math.round(localReviews.filter(review=>Number(review.rating)===stars).length/reviewCount*100):0])
  const unavailable=product.stock===0
  const practicalGuide=productPracticalGuides[product.id]
  return <div className="product-page">
    <div className="breadcrumb section"><button onClick={()=>navigate('/')}>Accueil</button><ChevronRight/><button onClick={()=>navigate('/boutique')}>La boutique</button><ChevronRight/><span>{product.name}</span></div>
    <section className="product-detail section">
      <div className="gallery">
        <div className="thumbnails">{gallery.map((img,i)=><button key={img} className={mainImage===img?'active':''} onClick={()=>setMainImage(img)}><img src={img} alt={`${product.name}, vue ${i+1}`} loading={i?'lazy':'eager'} decoding="async" width="1024" height="1024"/></button>)}</div>
        <div className="main-image" style={{background: product.color}}><img key={mainImage} src={mainImage} srcSet={responsiveImageSrcSet(mainImage)} sizes="(max-width: 760px) 100vw, 48vw" alt={product.name} decoding="async" width="1254" height="1254"/><button className={`gallery-heart ${wishlist.includes(product.id)?'liked':''}`} onClick={()=>toggleWishlist(product)} aria-label={wishlist.includes(product.id)?'Retirer des favoris':'Ajouter aux favoris'}><Heart size={20} fill={wishlist.includes(product.id)?'currentColor':'none'}/></button><span className="zoom-hint"><Search size={15}/>Survolez pour zoomer</span></div>
      </div>
      <div className="product-buybox">
        {product.badge && <span className="detail-badge">{product.badge}</span>}
        {reviewCount>0&&<div className="detail-rating"><Stars value={Number(displayRating)}/><a href="#avis">{displayRating} · {reviewCount} avis publié{reviewCount>1?'s':''}</a></div>}
        <h1>{product.name}</h1><p className="product-subtitle">{product.short}</p>
        <div className="detail-price"><strong>{formatPrice(product.price + size.add)}</strong>{product.oldPrice && <del>{formatPrice(product.oldPrice + size.add)}</del>}<span>TTC</span></div>
        <div className="choice-block"><div className="choice-head"><strong>Choisissez la taille</strong><button onClick={()=>setSizeGuideOpen(true)}>Guide des parts <CircleHelp size={14}/></button></div><div className="size-grid">{sizes.map(s=><button key={s.label} className={size.label===s.label?'selected':''} onClick={()=>setSize(s)}><span>{s.label}</span><small>{s.note}</small>{size.label===s.label&&<i><Check size={12}/></i>}</button>)}</div></div>
        <div className="choice-block"><div className="choice-head"><strong>Un petit mot ? <em>Offert</em></strong><span>{giftMessage.length}/40</span></div><input className="message-input" value={giftMessage} maxLength={40} onChange={e=>setGiftMessage(e.target.value)} placeholder="Ex : Joyeux anniversaire Laila !"/></div>
        <div className="delivery-note"><Clock3 size={19}/><div><strong>Préparé à la commande</strong><span>Prévoyez au moins {settings.leadTime} h ; date et créneau confirmés par l’atelier</span></div><ChevronRight size={18}/></div>
        <div className="add-row"><div className="quantity"><button onClick={()=>setQty(Math.max(1,qty-1))} aria-label="Réduire la quantité"><Minus/></button><span aria-live="polite">{qty}</span><button onClick={()=>setQty(qty+1)} aria-label="Augmenter la quantité"><Plus/></button></div><button className="btn btn-dark add-main" disabled={unavailable} onClick={()=>!unavailable&&addToCart(product,size,qty,giftMessage)}>{unavailable?'Momentanément épuisé':`Ajouter au panier · ${formatPrice((product.price+size.add)*qty)}`}</button></div>
        <div className="buy-trust"><span><Truck/>Remise planifiée</span><span><ShieldCheck/>{isBankTransferReady(settings)?'Espèces ou virement':'Espèces à la réception'}</span><span><Gift/>Écrin inclus</span></div>
        <div className="accordions">
          <Accordion title="L’histoire de cette création" id="details" open={accordion==='details'} onClick={()=>setAccordion(accordion==='details'?'':'details')}><p>{product.description}</p></Accordion>
          <Accordion title="Ingrédients & allergènes" id="ingredients" open={accordion==='ingredients'} onClick={()=>setAccordion(accordion==='ingredients'?'':'ingredients')}><p>{product.ingredients}</p><p><strong>Allergènes :</strong> {product.allergens}</p></Accordion>
          <Accordion title="Conservation & dégustation" id="care" open={accordion==='care'} onClick={()=>setAccordion(accordion==='care'?'':'care')}><p>Conservez entre 2°C et 5°C. Sortez le gâteau 20 minutes avant dégustation. À savourer sous 48 heures.</p></Accordion>
        </div>
      </div>
    </section>

    <section className="product-editorial section" aria-label={`En savoir plus sur ${product.name}`}><div><span className="eyebrow">Dans chaque part</span><h2>L’histoire, la dégustation<br/><em>et le bon accord.</em></h2><p>Quelques repères de l’atelier pour découvrir cette création dans les meilleures conditions.</p></div><div><article><span>01</span><h2>L’inspiration</h2><p>{product.story||product.description}</p></article><article><span>02</span><h2>Conseils de dégustation</h2><p>{product.tasting||'Conservez le gâteau entre 2 °C et 5 °C et sortez-le environ vingt minutes avant le service.'}</p></article><article><span>03</span><h2>À servir avec</h2><p>{product.pairing||'Choisissez une boisson peu sucrée afin de préserver l’équilibre des parfums.'}</p></article></div></section>

    {practicalGuide&&<section className="product-practical section" aria-label={`Conseils pratiques pour ${product.name}`}><div className="product-practical-head"><span className="eyebrow">Conseils pratiques</span><h2>{practicalGuide.title}</h2><p>{practicalGuide.intro}</p></div><div>{practicalGuide.sections.map(([title,text],index)=><article key={title}><span>0{index+4}</span><h2>{title}</h2><p>{text}</p></article>)}</div></section>}

    <section className="reviews-section section" id="avis">
      <div className="reviews-summary"><span className="eyebrow">Vos avis</span><h2>{reviewCount?'Vous en parlez':'Partagez votre'}<br/><em>{reviewCount?'si bien.':'expérience.'}</em></h2>{reviewCount>0?<><div className="score-row"><strong>{displayRating}</strong><div><Stars value={Number(displayRating)}/><span>Basé sur {reviewCount} avis publié{reviewCount>1?'s':''}</span></div></div><div className="review-bars">{reviewDistribution.map(([stars,percentage])=><div key={stars}><span>{stars}</span><Star size={11} fill="currentColor"/><i><b style={{width:`${percentage}%`}}/></i><small>{percentage}%</small></div>)}</div></>:<p>Aucun avis n’est encore publié pour cette création.</p>}<button className="btn btn-outline" onClick={()=>setReviewOpen(true)}>Écrire un avis</button></div>
      <div className="review-list">{(showAllReviews?visibleReviews:visibleReviews.slice(0,3)).map((review,index)=><ReviewCard key={review.id||`${review.date}-${index}`} review={review} full/>)}{visibleReviews.length>3&&<button className="text-link dark-link" onClick={()=>setShowAllReviews(!showAllReviews)}>{showAllReviews?'Réduire les avis':'Afficher plus d’avis'} {showAllReviews?<ChevronDown className="flip" size={16}/>:<ArrowRight size={16}/>}</button>}</div>
    </section>

    <section className="section recommendations"><SectionHeading eyebrow="Encore une part ?" title="Vous aimerez aussi"/><div className="product-grid home-products">{products.filter(p=>p.id!==product.id).slice(0,4).map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} navigate={navigate} wishlist={wishlist} toggleWishlist={toggleWishlist}/>)}</div></section>
    <Newsletter />
    <ReviewModal open={reviewOpen} product={product} onClose={()=>setReviewOpen(false)} onSubmit={async review=>{if(await addReview(review))setReviewOpen(false)}} />
    <SizeGuideModal open={sizeGuideOpen} basePrice={product.price} onClose={()=>setSizeGuideOpen(false)} onSelect={selected=>{setSize(selected);setSizeGuideOpen(false)}} />
  </div>
}

function SizeGuideModal({ open, basePrice, onClose, onSelect }) {
  const dialogRef=useRef(null)
  useModalEscape(open,onClose)
  useFocusTrap(open,dialogRef)
  useEffect(()=>{
    if(!open)return
    const previous=document.body.style.overflow
    document.body.style.overflow='hidden'
    return ()=>{document.body.style.overflow=previous}
  },[open])
  if(!open)return null
  const details = [
    { ...sizes[0], people:'4 à 6 invités', occasion:'Dîner intime' },
    { ...sizes[1], people:'7 à 9 invités', occasion:'Anniversaire' },
    { ...sizes[2], people:'10 à 14 invités', occasion:'Grande tablée' }
  ]
  return <div className="review-modal-wrap">
    <button className="review-modal-backdrop" onClick={onClose} aria-label="Fermer"/>
    <div ref={dialogRef} className="review-modal size-guide" role="dialog" aria-modal="true" aria-labelledby="size-guide-title">
      <button className="review-modal-close" onClick={onClose} aria-label="Fermer"><X/></button>
      <span className="eyebrow">Bien choisir</span>
      <h2 id="size-guide-title">Le guide<br/><em>des belles parts.</em></h2>
      <p>Nos estimations prévoient une part généreuse par invité.</p>
      <div className="size-guide-list">{details.map((item,index)=><button key={item.label} onClick={()=>onSelect(sizes[index])}><span className={`cake-size cake-size-${index+1}`}><CakeSlice/></span><div><strong>{item.label}</strong><small>{item.note} · {item.people}</small><em>{item.occasion}</em></div><b>{formatPrice(basePrice+item.add)}</b><ArrowRight/></button>)}</div>
      <div className="guide-tip"><Sparkles/><p><strong>Une grande envie ?</strong><br/>Pour 15 personnes ou plus, notre atelier prépare un format sur mesure.</p></div>
    </div>
  </div>
}

function ReviewModal({ open, product, onClose, onSubmit }) {
  const dialogRef=useRef(null)
  useModalEscape(open,onClose)
  useFocusTrap(open,dialogRef)
  const [form,setForm]=useState({name:'',city:'Rabat',rating:5,text:''})
  useEffect(()=>{
    if(open) {
      setForm({name:'',city:'Rabat',rating:5,text:''})
      const previous = document.body.style.overflow
      document.body.style.overflow='hidden'
      return ()=>{document.body.style.overflow=previous}
    }
  },[open,product.id])
  if(!open)return null
  const submit = event => {
    event.preventDefault()
    if(!form.name.trim() || !form.text.trim()) return
    onSubmit({ ...form, name:form.name.trim(), text:form.text.trim(), productId:product.id, date:new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date()), verified:false })
  }
  return <div className="review-modal-wrap">
    <button className="review-modal-backdrop" onClick={onClose} aria-label="Fermer"/>
    <div ref={dialogRef} className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-title">
      <button className="review-modal-close" onClick={onClose} aria-label="Fermer"><X/></button>
      <span className="eyebrow">Votre expérience</span>
      <h2 id="review-title">Un mot sur<br/><em>{product.name}.</em></h2>
      <p>Votre avis aide les autres gourmands à choisir.</p>
      <form onSubmit={submit}>
        <fieldset><legend>Votre note</legend><div className="rating-picker">{[1,2,3,4,5].map(value=><button type="button" key={value} onClick={()=>setForm({...form,rating:value})} aria-pressed={value===form.rating} aria-label={`${value} étoile${value>1?'s':''}`}><Star fill={value<=form.rating?'currentColor':'none'}/></button>)}</div></fieldset>
        <div className="review-form-grid"><label className="field"><span>Votre prénom</span><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex : Nadia B."/></label><label className="field"><span>Votre ville</span><div className="select-wrap"><select value={form.city} onChange={e=>setForm({...form,city:e.target.value})}><option>Rabat</option><option>Salé</option><option>Casablanca</option><option>Témara</option><option>Autre ville</option></select><ChevronDown/></div></label></div>
        <label className="field"><span>Votre avis</span><textarea required minLength={10} value={form.text} onChange={e=>setForm({...form,text:e.target.value})} placeholder="Qu’avez-vous aimé dans cette création ?"/></label>
        <button className="btn btn-dark" type="submit">Publier mon avis <ArrowRight/></button>
        <small>Votre prénom et votre ville seront affichés publiquement.</small>
      </form>
    </div>
  </div>
}

function Accordion({ title, open, onClick, children }) {
  return <div className={`accordion ${open?'open':''}`}><button onClick={onClick}><span>{title}</span>{open?<Minus size={17}/>:<Plus size={17}/>}</button>{open&&<div>{children}</div>}</div>
}

function Stars({ value=5 }) {
  return <span className="stars" role="img" aria-label={`${value} étoiles`}>{[1,2,3,4,5].map(i=><Star key={i} size={13} fill={i<=Math.round(value)?'currentColor':'none'}/>)}</span>
}

function ReviewCard({ review, full=false }) {
  return <article className={`review-card ${full?'full':''}`}><div className="review-top"><Stars value={review.rating}/><time>{review.date}</time></div><blockquote>“{review.text}”</blockquote><footer><span className="avatar">{review.name[0]}</span><div><strong>{review.name}</strong><small>{review.city}</small></div>{review.verified&&<em><BadgeCheck size={14}/>Achat vérifié</em>}</footer></article>
}

function Newsletter() {
  const [email,setEmail]=useState(''),[done,setDone]=useState(false),[error,setError]=useState(''),[sending,setSending]=useState(false)
  const submit=async event=>{event.preventDefault();setSending(true);setError('');const entry={id:`NEWS-${Date.now()}`,email:email.trim().toLowerCase(),status:'Actif'};try{if(supabaseConfigured&&!localPreview)await submitPublicRecord('newsletter_subscribers',entry);else writeStorage(localStorage,'morokika-newsletter',[entry,...readStoredArray('morokika-newsletter')]);setDone(true)}catch{setError('Inscription impossible pour le moment.')}finally{setSending(false)}}
  return <section className="newsletter"><div className="newsletter-icon">✦</div><div><span className="eyebrow light">Un peu de douceur</span><h2>Rejoignez notre table.</h2><p>Nouveautés, coulisses et privilèges gourmands, directement dans votre boîte mail.</p></div>{done?<div className="newsletter-done"><Check/>Merci ! Bienvenue chez MoroKika.</div>:<form onSubmit={submit}><input type="email" required aria-label="Votre adresse e-mail" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Votre adresse e-mail"/><button disabled={sending} aria-label="S'inscrire"><ArrowRight/></button>{error?<small role="alert">{error}</small>:<small>En vous inscrivant, vous acceptez notre politique de confidentialité.</small>}</form>}</section>
}

function CartDrawer({ open, onClose, cart, updateQty, navigate }) {
  const dialogRef=useRef(null)
  useFocusTrap(open,dialogRef);useBodyScrollLock(open)
  const subtotal = cart.reduce((sum,i)=>sum+i.price*i.qty,0)
  const shippingGap = Math.max(0,450-subtotal)
  return <div className={`drawer-wrap ${open?'open':''}`} aria-hidden={!open} inert={!open}>
    <button className="drawer-backdrop" onClick={onClose} aria-label="Fermer le panier"/>
    <div ref={dialogRef} className="cart-drawer" role="dialog" aria-modal="true" aria-label="Votre panier">
      <div className="cart-head"><div><h2>Votre panier</h2><span>{cart.reduce((s,i)=>s+i.qty,0)} {cart.reduce((s,i)=>s+i.qty,0)>1?'douceurs':'douceur'}</span></div><button onClick={onClose} aria-label="Fermer le panier"><X/></button></div>
      {cart.length ? <>
        <div className="shipping-progress"><div><Truck size={18}/>{shippingGap>0?<span>Plus que <strong>{formatPrice(shippingGap)}</strong> pour la livraison offerte</span>:<span><strong>La livraison vous est offerte !</strong></span>}</div><i><b style={{width:`${Math.min(100,subtotal/450*100)}%`}}/></i></div>
        <div className="cart-lines">{cart.map(item=>{const p=products.find(x=>x.id===item.productId);return <div className="cart-line" key={item.key}><img src={p.image} alt={p.name}/><div><div className="line-title"><strong>{p.name}</strong><button onClick={()=>updateQty(item.key,0)} aria-label={`Retirer ${p.name} du panier`}><Trash2 size={15}/></button></div><span>{item.size}{item.message?` · “${item.message}”`:''}</span><div className="line-bottom"><div className="mini-qty"><button onClick={()=>updateQty(item.key,item.qty-1)} aria-label={`Réduire la quantité de ${p.name}`}><Minus/></button><span>{item.qty}</span><button onClick={()=>updateQty(item.key,item.qty+1)} aria-label={`Augmenter la quantité de ${p.name}`}><Plus/></button></div><strong>{formatPrice(item.price*item.qty)}</strong></div></div></div>})}</div>
        <div className="cart-footer"><div className="subtotal"><span>Sous-total</span><strong>{formatPrice(subtotal)}</strong></div><p>Livraison calculée à l’étape suivante.</p><button className="btn btn-dark" onClick={()=>{onClose();navigate('/checkout')}}>Passer la commande <ArrowRight size={17}/></button><button className="continue" onClick={onClose}>Continuer mes achats</button><div className="secure-note"><LockKeyhole size={14}/>Paiement 100% sécurisé</div></div>
      </>:<div className="empty-cart"><div><ShoppingBag/></div><h3>Votre panier est encore vide</h3><p>Une occasion à célébrer ? Nos créations n’attendent que vous.</p><button className="btn btn-dark" onClick={()=>{onClose();navigate('/boutique')}}>Découvrir les gâteaux</button></div>}
    </div>
  </div>
}

function CheckoutPage({ cart, clearCart, navigate, settings }) {
  const bankTransferReady=isBankTransferReady(settings)
  const minimumDeliveryDate=getDeliveryISO(settings.leadTime)
  const [draft] = useState(readCheckoutDraft)
  const [savedCustomer] = useState(()=>readStoredObject(localStorage,'morokika-customer'))
  const [step,setStep]=useState([1,2,3].includes(draft.step)?draft.step:1)
  const [delivery,setDelivery]=useState(draft.delivery==='pickup'?'pickup':'delivery')
  const [payment,setPayment]=useState(()=>draft.payment==='bank'&&bankTransferReady?'bank':'cash')
  const [confirmedTotal,setConfirmedTotal]=useState(0)
  const [whatsappUrl,setWhatsappUrl]=useState('')
  const [orderRef] = useState(createOrderRef)
  const [promo,setPromo]=useState(draft.promo&&typeof draft.promo==='object'?draft.promo:{code:'',discount:0,status:''})
  const [errors,setErrors]=useState(false)
  const [contactError,setContactError]=useState('')
  const [paymentError,setPaymentError]=useState('')
  const [termsAccepted,setTermsAccepted]=useState(true)
  const [saveDetails,setSaveDetails]=useState(Object.keys(savedCustomer).length>0)
  const [form,setForm]=useState({first:'',last:'',phone:'',email:'',address:'',postal:'',instructions:'',city:'Rabat',date:minimumDeliveryDate,slot:'14:00 — 17:00',...savedCustomer,...(draft.form||{}),date:draft.form?.date>=minimumDeliveryDate?draft.form.date:minimumDeliveryDate})
  const subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0)
  const discountAmount = Math.min(subtotal, promo.discount === 10 ? Math.round(subtotal * .1) : promo.discount)
  const deliveryRates=settings.rates
  const freeDelivery=subtotal>=Number(settings.threshold||450)&&['Rabat','Casablanca'].includes(form.city)
  const deliveryShipping=freeDelivery?0:(deliveryRates[form.city]||35)
  const shipping=delivery==='pickup'?0:deliveryShipping
  const total=subtotal-discountAmount+shipping
  useEffect(()=>{setForm(current=>current.date<minimumDeliveryDate?{...current,date:minimumDeliveryDate}:current)},[minimumDeliveryDate])
  useEffect(()=>{if(!settings.delivery&&settings.pickup)setDelivery('pickup');if(!settings.pickup&&settings.delivery)setDelivery('delivery');if(payment==='bank'&&!bankTransferReady)setPayment('cash');if(payment==='cash'&&!settings.cash&&bankTransferReady)setPayment('bank')},[settings.delivery,settings.pickup,settings.cash,bankTransferReady,payment])
  useEffect(()=>{
    if(step<4&&cart.length) writeStorage(sessionStorage,'morokika-checkout',{step,delivery,payment,promo,form})
    else sessionStorage.removeItem('morokika-checkout')
  },[step,delivery,payment,promo,form,cart.length])
  const applyPromo = () => {
    const code = promo.code.trim().toUpperCase()
    if (code === 'BIENVENUE10') setPromo({code,discount:10,status:'10 % de douceur appliqués'})
    else if (code === 'DOUCEUR50') setPromo({code,discount:50,status:'50 DH de remise appliqués'})
    else setPromo(current=>({...current,discount:0,status:'Code non reconnu'}))
  }
  const field=(key,label,type='text',placeholder='')=><label className={`field ${errors&&!form[key]?'error':''}`}><span>{label}</span><input type={type} value={form[key]} placeholder={placeholder} onChange={e=>setForm({...form,[key]:e.target.value})}/>{errors&&!form[key]&&<small>Ce champ est requis</small>}</label>
  const next=()=>{
    if(step===1&&(!form.first||!form.last||!form.phone||!form.email||!form.address)){setErrors(true);setContactError('Complétez les champs obligatoires pour continuer.');return}
    if(step===1&&!/^\S+@\S+\.\S+$/.test(form.email)){setContactError('Saisissez une adresse e-mail valide.');return}
    if(step===1&&form.phone.replace(/\D/g,'').length<9){setContactError('Saisissez un numéro de téléphone valide.');return}
    setErrors(false);setContactError('');setStep(s=>s+1);window.scrollTo({top:0,behavior:'smooth'})
  }
  const placeOrder=async()=>{
    setPaymentError('');if(!termsAccepted){setPaymentError('Acceptez les conditions générales de vente pour continuer.');return}
    if(saveDetails)writeStorage(localStorage,'morokika-customer',{first:form.first,last:form.last,phone:form.phone,email:form.email,address:form.address,postal:form.postal,city:form.city});else{try{localStorage.removeItem('morokika-customer')}catch{}}
    const productSummary=cart.map(item=>{const product=products.find(entry=>entry.id===item.productId);return`${product?.name||'Création MoroKika'} · ${item.size}${item.qty>1?` × ${item.qty}`:''}`}).join(' + '),productLines=cart.map(item=>{const product=products.find(entry=>entry.id===item.productId);return`• ${product?.name||'Création MoroKika'} — ${item.size} × ${item.qty}${item.message?` — « ${item.message} »`:''} — ${formatPrice(item.price*item.qty)}`}),initials=`${form.first[0]||''}${form.last[0]||''}`.toUpperCase(),time=new Intl.DateTimeFormat('fr-MA',{hour:'2-digit',minute:'2-digit',timeZone:'Africa/Casablanca'}).format(new Date()),deliveryAddress=delivery==='pickup'?`Retrait — ${settings.address}`:`${form.address.trim()}${form.postal?`, ${form.postal}`:''}, ${form.city}`
    const order={id:orderRef,customer:`${form.first.trim()} ${form.last.trim()}`,initials,city:delivery==='pickup'?'Rabat':form.city,date:`Aujourd’hui · ${time}`,total,status:payment==='bank'?'En attente de paiement':'Nouvelle',payment:payment==='bank'?'Virement bancaire':'À la réception',items:cart.reduce((sum,item)=>sum+item.qty,0),product:productSummary,phone:form.phone.trim(),email:form.email.trim(),address:deliveryAddress,slot:`${formatDeliveryDate(form.date)} · ${delivery==='pickup'?'Retrait atelier':form.slot}`,instructions:form.instructions.trim()}
    const paymentLines=payment==='bank'?['Paiement : virement bancaire',`Banque : ${settings.bankName}`,`Titulaire : ${settings.bankHolder}`,settings.bankRib?`RIB : ${settings.bankRib}`:null,settings.bankIban?`IBAN : ${settings.bankIban}`:null,settings.bankBic?`SWIFT/BIC : ${settings.bankBic}`:null,`Référence : ${orderRef}`,`Délai : ${settings.transferDeadline||24} h`]:['Paiement : espèces à la réception']
    const message=['Bonjour MoroKika, je souhaite confirmer cette commande.',`Référence : ${orderRef}`,'',...productLines,'',`Sous-total : ${formatPrice(subtotal)}`,discountAmount?`Remise : − ${formatPrice(discountAmount)}`:null,`Livraison : ${shipping?formatPrice(shipping):'Offerte'}`,`Total TTC : ${formatPrice(total)}`,'',`Client : ${form.first.trim()} ${form.last.trim()}`,`Téléphone : ${form.phone.trim()}`,`E-mail : ${form.email.trim()}`,`Remise : ${deliveryAddress}`,`Date : ${formatDeliveryDate(form.date)} · ${delivery==='pickup'?'Retrait atelier':form.slot}`,form.instructions.trim()?`Instructions : ${form.instructions.trim()}`:null,'',...paymentLines,'','Merci de confirmer la commande et le créneau.'].filter(Boolean).join('\n'),url=`https://wa.me/${whatsappDigits(settings)}?text=${encodeURIComponent(message)}`
    if(supabaseConfigured&&!localPreview){try{await submitPublicRecord('orders',order)}catch{setPaymentError('La commande n’a pas pu être enregistrée. Réessayez dans quelques instants.');return}}
    const existing=readStoredArray('morokika-admin-orders');writeStorage(localStorage,'morokika-admin-orders',[order,...(existing.length?existing:seedOrders)]);setWhatsappUrl(url);setConfirmedTotal(total);clearCart();setStep(4);window.open(url,'_blank','noopener,noreferrer')
  }
  if(step===4)return <OrderSuccess total={confirmedTotal} date={form.date} slot={delivery==='pickup'?'Retrait atelier':form.slot} orderRef={orderRef} whatsappUrl={whatsappUrl} payment={payment} settings={settings} navigate={navigate}/>
  if(!cart.length)return <div className="checkout-empty section"><ShoppingBag/><h1>Votre panier est vide</h1><p>Ajoutez une douceur avant de passer commande.</p><button className="btn btn-dark" onClick={()=>navigate('/boutique')}>Voir la boutique</button></div>
  return <div className="checkout-page">
    <div className="checkout-top"><button onClick={()=>step>1?setStep(step-1):navigate('/boutique')}><ArrowLeft size={17}/>{step>1?'Retour':'Continuer mes achats'}</button><div className="checkout-steps">{['Coordonnées','Livraison','Confirmation'].map((s,i)=><div key={s} className={`${step===i+1?'active':''} ${step>i+1?'done':''}`}><span>{step>i+1?<Check/>:i+1}</span><b>{s}</b>{i<2&&<i/>}</div>)}</div><span className="checkout-secure"><PackageCheck/>{payment==='bank'?'Virement bancaire':'Paiement à la réception'}</span></div>
    <div className="checkout-layout section">
      <div className="checkout-form">
        {step===1&&<><span className="eyebrow">Étape 1 sur 3</span><h1>Vos coordonnées</h1><p className="checkout-sub">Pour vous prévenir dès que votre commande est en route.</p><div className="form-grid">{field('first','Prénom')}{field('last','Nom')}{field('phone','Téléphone','tel','06 00 00 00 00')}{field('email','Adresse e-mail','email','vous@exemple.ma')}<div className="form-section-title">Adresse de livraison</div><label className="field full"><span>Pays</span><div className="fake-select">🇲🇦 &nbsp; Maroc <ChevronDown/></div></label><label className={`field full ${errors&&!form.address?'error':''}`}><span>Adresse</span><input value={form.address} placeholder="Numéro et nom de rue" onChange={e=>setForm({...form,address:e.target.value})}/>{errors&&!form.address&&<small>Ce champ est requis</small>}</label><label className="field"><span>Ville</span><div className="select-wrap"><select value={form.city} onChange={e=>setForm({...form,city:e.target.value})}><option>Rabat</option><option>Salé</option><option>Témara</option><option>Casablanca</option><option>Kénitra</option></select><ChevronDown/></div></label><label className="field"><span>Code postal <em>Optionnel</em></span><input inputMode="numeric" aria-label="Code postal" placeholder="10000" value={form.postal} onChange={e=>setForm({...form,postal:e.target.value})}/></label></div>{contactError&&<div className="form-error" role="alert"><CircleHelp/>{contactError}</div>}<label className="save-check"><input type="checkbox" checked={saveDetails} onChange={event=>setSaveDetails(event.target.checked)}/><span><Check/></span>Enregistrer mes informations pour la prochaine fois</label><button className="btn btn-dark checkout-next" onClick={next}>Continuer vers la livraison <ArrowRight/></button></>}
        {step===2&&<><span className="eyebrow">Étape 2 sur 3</span><h1>Livraison</h1><p className="checkout-sub">Choisissez comment et quand recevoir votre gâteau.</p><div className="option-cards">{settings.delivery&&<button className={delivery==='delivery'?'selected':''} onClick={()=>setDelivery('delivery')}><span><Truck/></span><div><strong>Livraison réfrigérée</strong><small>À votre adresse · créneau de 3h</small></div><b>{freeDelivery?'Offerte':formatPrice(deliveryShipping)}</b><i>{delivery==='delivery'&&<Check/>}</i></button>}{settings.pickup&&<button className={delivery==='pickup'?'selected':''} onClick={()=>setDelivery('pickup')}><span><Store/></span><div><strong>Retrait à l’atelier</strong><small>{settings.address} · sur rendez-vous</small></div><b>Gratuit</b><i>{delivery==='pickup'&&<Check/>}</i></button>}</div><div className="delivery-fields"><label className="field"><span>Date souhaitée</span><input type="date" min={minimumDeliveryDate} value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label className="field"><span>Créneau</span><div className="select-wrap"><select value={form.slot} onChange={e=>setForm({...form,slot:e.target.value})}><option>10:00 — 13:00</option><option>14:00 — 17:00</option><option>17:00 — 20:00</option></select><ChevronDown/></div></label></div><label className="field full note-field"><span>Instructions pour le livreur <em>Optionnel</em></span><textarea placeholder="Étage, digicode, indication utile…" value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})}/></label><button className="btn btn-dark checkout-next" onClick={next}>Continuer vers la confirmation <ArrowRight/></button></>}
        {step===3&&<><span className="eyebrow">Étape 3 sur 3</span><h1>Confirmation</h1><p className="checkout-sub">Choisissez votre règlement puis vérifiez votre commande.</p><div className="payment-options">{settings.cash&&<button className={payment==='cash'?'selected':''} onClick={()=>setPayment('cash')}><i>{payment==='cash'&&<Check/>}</i><PackageCheck/><span><strong>Paiement à la réception</strong><small>Espèces à la livraison ou au retrait</small></span></button>}{bankTransferReady&&<button className={payment==='bank'?'selected':''} onClick={()=>setPayment('bank')}><i>{payment==='bank'&&<Check/>}</i><CircleDollarSign/><span><strong>Virement bancaire</strong><small>Préparation après réception des fonds</small></span></button>}{payment==='bank'?<div className="bank-transfer-details"><strong>Coordonnées bancaires · référence {orderRef}</strong><dl><div><dt>Banque</dt><dd>{settings.bankName}</dd></div><div><dt>Titulaire</dt><dd>{settings.bankHolder}</dd></div>{settings.bankRib&&<div><dt>RIB</dt><dd>{settings.bankRib}</dd></div>}{settings.bankIban&&<div><dt>IBAN</dt><dd>{settings.bankIban}</dd></div>}{settings.bankBic&&<div><dt>SWIFT / BIC</dt><dd>{settings.bankBic}</dd></div>}<div><dt>Montant</dt><dd>{formatPrice(total)}</dd></div></dl><p>Effectuez le virement sous {settings.transferDeadline||24} heures. Le créneau sera confirmé par l’atelier.</p></div>:<div className="cod-payment-note"><ShieldCheck/>Aucune donnée bancaire à saisir.</div>}</div><label className="save-check terms"><input type="checkbox" checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)}/><span><Check/></span>J’accepte les conditions générales de vente.</label>{paymentError&&<div className="form-error" role="alert"><CircleHelp/>{paymentError}</div>}<button className="btn btn-dark checkout-next" onClick={placeOrder}><MessageCircle/>Transmettre sur WhatsApp · {formatPrice(total)}</button></>}
      </div>
      <OrderSummary cart={cart} subtotal={subtotal} discount={discountAmount} shipping={shipping} total={total} promo={promo} setPromo={setPromo} applyPromo={applyPromo} settings={settings}/>
    </div>
  </div>
}

function OrderSummary({cart,subtotal,discount,shipping,total,promo,setPromo,applyPromo,settings}) {
  return <aside className="order-summary"><div className="summary-head"><h2>Votre commande</h2><span>{cart.reduce((s,i)=>s+i.qty,0)} article(s)</span></div><div className="summary-lines">{cart.map(i=>{const p=products.find(x=>x.id===i.productId);return <div key={i.key}><div className="summary-img"><img src={p.image} alt={p.name}/><span>{i.qty}</span></div><div><strong>{p.name}</strong><small>{i.size}</small></div><b>{formatPrice(i.price*i.qty)}</b></div>})}</div><div className={`promo ${promo.status ? (promo.discount?'valid':'invalid') : ''}`}><input aria-label="Code promo" value={promo.code} onChange={e=>setPromo({code:e.target.value,discount:0,status:''})} onKeyDown={e=>{if(e.key==='Enter')applyPromo()}} placeholder="Code promo"/><button onClick={applyPromo}>Appliquer</button></div>{promo.status&&<div className="promo-status">{promo.discount?<Check/>:<CircleHelp/>}{promo.status}</div>}<div className="totals"><div><span>Sous-total</span><b>{formatPrice(subtotal)}</b></div>{discount>0&&<div className="discount-line"><span>Remise</span><b>− {formatPrice(discount)}</b></div>}<div><span>Livraison</span><b>{shipping?formatPrice(shipping):'Offerte'}</b></div><div className="total"><span>Total <small>TTC</small></span><b>{formatPrice(total)}</b></div></div><div className="summary-trust"><div><Clock3/><span><strong>Préparé à la commande</strong><small>Fraîcheur garantie</small></span></div><div><Phone/><span><strong>Besoin d’aide ?</strong><small>{settings.phone}</small></span></div></div></aside>
}

function OrderSuccess({total,date,slot,orderRef,whatsappUrl,payment,settings,navigate}) {
  const transfer=payment==='bank'
  return <section className="order-success"><div className="success-mark">{transfer?<CircleDollarSign/>:<MessageCircle/>}</div><span className="eyebrow">Commande prête à transmettre</span><h1>{transfer?'Votre virement,':'Une dernière étape'}<br/><em>{transfer?'puis la confirmation.':'sur WhatsApp.'}</em></h1><p>Envoyez le récapitulatif <strong>#{orderRef}</strong> sur WhatsApp. L’équipe vous confirmera le créneau.</p><div className="success-card"><div><CakeSlice/><span><small>{transfer?'Montant du virement':'À régler à la réception'}</small><strong>{formatPrice(total)}</strong></span></div><div><Truck/><span><small>Date souhaitée</small><strong>{formatDeliveryDate(date)}, {slot}</strong></span></div></div>{transfer&&<div className="success-bank"><strong>{settings.bankName} · {settings.bankHolder}</strong><span>{settings.bankRib||settings.bankIban}</span><b>Référence obligatoire : {orderRef}</b></div>}<a className="btn btn-dark whatsapp-confirm" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle/>Ouvrir WhatsApp</a><button className="support-line" onClick={()=>navigate('/')}>Retour à l’accueil</button></section>
}

function SearchOverlay({open,onClose,navigate}) {
  const [q,setQ]=useState('')
  const dialogRef=useRef(null)
  useFocusTrap(open,dialogRef);useBodyScrollLock(open)
  const matches=products.filter(p=>(p.name+' '+p.short).toLowerCase().includes(q.toLowerCase())).slice(0,4)
  useEffect(()=>{if(!open)setQ('')},[open])
  return <div ref={dialogRef} className={`search-overlay ${open?'open':''}`} role="dialog" aria-modal="true" aria-label="Recherche" aria-hidden={!open} inert={!open}><div className="search-top"><Logo onClick={()=>{onClose();navigate('/')}}/><div className="search-box"><Search/><input autoFocus={open} aria-label="Rechercher un gâteau" value={q} onChange={e=>setQ(e.target.value)} placeholder="Quel gâteau cherchez-vous ?"/>{q&&<button onClick={()=>setQ('')} aria-label="Effacer la recherche"><X/></button>}</div><button className="search-close" onClick={onClose}>Fermer <X/></button></div><div className="search-content">{q?<><span className="eyebrow">{matches.length} résultats</span><div className="search-results">{matches.map(p=><button key={p.id} onClick={()=>navigate(`/produit/${p.id}`)}><img src={p.image} alt="" loading="lazy" decoding="async"/><span><strong>{p.name}</strong><small>{p.short}</small></span><b>{formatPrice(p.price)}</b><ArrowRight/></button>)}</div></>:<div className="popular-search"><span className="eyebrow">Recherches populaires</span>{['Pistache','Chocolat','Anniversaire','Sans fruits à coque'].map(x=><button onClick={()=>setQ(x)} key={x}>{x}<ArrowRight/></button>)}</div>}</div></div>
}

function MobileMenu({open,onClose,navigate,wishlistCount,settings}) {
  const dialogRef=useRef(null)
  useFocusTrap(open,dialogRef);useBodyScrollLock(open)
  return <div ref={dialogRef} className={`mobile-menu ${open?'open':''}`} role="dialog" aria-modal="true" aria-label="Menu principal" aria-hidden={!open} inert={!open}><div className="mobile-menu-head"><Logo onClick={()=>navigate('/')}/><button onClick={onClose} aria-label="Fermer le menu"><X/></button></div><nav><button onClick={()=>navigate('/')}>Accueil <ArrowRight/></button><button onClick={()=>navigate('/boutique')}>La boutique <ArrowRight/></button><button onClick={()=>navigate('/favoris')}>Mes favoris <small>{wishlistCount}</small></button><button onClick={()=>navigate('/sur-mesure')}>Sur mesure <ArrowRight/></button><button onClick={()=>navigate('/la-maison')}>La maison <ArrowRight/></button><button onClick={()=>navigate('/journal')}>Journal <ArrowRight/></button></nav><div className="mobile-menu-foot"><span>Besoin d’un conseil ?</span><a href={`tel:${settings.phone.replace(/\s/g,'')}`}><Phone/>{settings.phone}</a><div>{settings.instagram&&<a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram/></a>}{settings.facebook&&<a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook/></a>}</div></div></div>
}

function Footer({navigate,settings}) {
  return <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><Logo light onClick={()=>navigate('/')}/><p>Des gâteaux artisanaux qui racontent le Maroc, façonnés avec cœur à Rabat.</p><div className="socials">{settings.instagram&&<a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram/></a>}{settings.facebook&&<a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook/></a>}<a href={`https://wa.me/${whatsappDigits(settings)}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle/></a></div></div><div><h2>La boutique</h2><button onClick={()=>navigate('/boutique')}>Tous les gâteaux</button><button onClick={()=>navigate('/collections/signatures')}>Nos signatures</button><button onClick={()=>navigate('/collections/anniversaires')}>Anniversaires</button><button onClick={()=>navigate('/collections/cadeaux')}>Coffrets cadeaux</button><button onClick={()=>navigate('/sur-mesure')}>Créations sur mesure</button></div><div><h2>Besoin d’aide ?</h2><button onClick={()=>navigate('/livraison')}>Livraison & retrait</button><button onClick={()=>navigate('/guide-des-tailles')}>Guide des tailles</button><button onClick={()=>navigate('/allergenes')}>Allergènes</button><button onClick={()=>navigate('/contact')}>Nous contacter</button><button onClick={()=>navigate('/faq')}>Questions fréquentes</button></div><div className="footer-contact"><h2>Notre atelier</h2><p><MapPin/>{settings.address}</p><p><Clock3/>{settings.hours}</p><p><Phone/>{settings.phone}</p></div></div><div className="footer-local-links"><span>Gâteaux & livraison près de chez vous</span><nav aria-label="Pages locales">{seoLandingPages.map(page=><button key={page.path} onClick={()=>navigate(page.path)}>{page.eyebrow}</button>)}</nav></div><div className="footer-bottom"><span>© 2026 MoroKika. Tous droits réservés.</span><div><button onClick={()=>navigate('/confidentialite')}>Confidentialité</button><button onClick={()=>navigate('/cgv')}>CGV</button><button onClick={()=>navigate('/mentions-legales')}>Mentions légales</button></div><span className="made">Fait avec ♡ au Maroc</span></div></footer>
}

export default App
