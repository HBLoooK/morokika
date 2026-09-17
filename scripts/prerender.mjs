import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { articlePublishedDates, commerceLandingPages, journalArticles, seoLandingPages } from '../src/seoContent.js'
import { products } from '../src/catalog.js'
import { commerceSeoGuides, coreSeoPages } from '../src/coreSeoContent.js'
import { commerceGuideAdditions, corePageAdditions, journalSectionAdditions, localPageAdditions, productPracticalGuides } from '../src/contentEnrichment.js'

const origin='https://morokika.netlify.app'
const template=await readFile(new URL('../dist/index.html',import.meta.url),'utf8')
const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')
const json=value=>JSON.stringify(value).replaceAll('<','\\u003c')
const enrichedSections=(sections,map,key)=>[...sections,...(map[key]||[])]
const imageDimensions=path=>path.includes('hero-')?[1586,992]:path.includes('collection-anniversaires')?[1536,1024]:path.includes('story-')?[1448,1086]:[1254,1254]
const responsiveSrcSet=path=>`${path.replace(/\.webp$/, '-320.webp')} 320w, ${path.replace(/\.webp$/, '-480.webp')} 480w, ${path.replace(/\.webp$/, '-800.webp')} 800w, ${path} ${imageDimensions(path)[0]}w`

function setTag(html,pattern,replacement){
  if(!pattern.test(html))throw new Error(`Static metadata pattern was not found: ${pattern}`)
  return html.replace(pattern,replacement)
}

function withMetadata({route,title,description,image,imageAlt,type='website',schema,placeName}){
  const canonical=`${origin}${route}`
  const imageUrl=`${origin}${image}`
  const [width,height]=imageDimensions(image)
  let html=template
  html=setTag(html,/<title>[^<]*<\/title>/,`<title>${escapeHtml(title)}</title>`)
  html=setTag(html,/<meta name="description" content="[^"]*"\s*\/>/,`<meta name="description" content="${escapeHtml(description)}" />`)
  html=setTag(html,/<meta property="og:type" content="[^"]*"\s*\/>/,`<meta property="og:type" content="${type}" />`)
  html=setTag(html,/<meta property="og:url" content="[^"]*"\s*\/>/,`<meta property="og:url" content="${canonical}" />`)
  html=setTag(html,/<meta property="og:title" content="[^"]*"\s*\/>/,`<meta property="og:title" content="${escapeHtml(title)}" />`)
  html=setTag(html,/<meta property="og:description" content="[^"]*"\s*\/>/,`<meta property="og:description" content="${escapeHtml(description)}" />`)
  html=setTag(html,/<meta property="og:image" content="[^"]*"\s*\/>/,`<meta property="og:image" content="${imageUrl}" />`)
  html=setTag(html,/<meta property="og:image:width" content="[^"]*"\s*\/>/,`<meta property="og:image:width" content="${width}" />`)
  html=setTag(html,/<meta property="og:image:height" content="[^"]*"\s*\/>/,`<meta property="og:image:height" content="${height}" />`)
  html=setTag(html,/<meta property="og:image:alt" content="[^"]*"\s*\/>/,`<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`)
  html=setTag(html,/<meta name="twitter:title" content="[^"]*"\s*\/>/,`<meta name="twitter:title" content="${escapeHtml(title)}" />`)
  html=setTag(html,/<meta name="twitter:description" content="[^"]*"\s*\/>/,`<meta name="twitter:description" content="${escapeHtml(description)}" />`)
  html=setTag(html,/<meta name="twitter:image" content="[^"]*"\s*\/>/,`<meta name="twitter:image" content="${imageUrl}" />`)
  html=setTag(html,/<meta name="twitter:image:alt" content="[^"]*"\s*\/>/,`<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />`)
  html=setTag(html,/<link rel="canonical" href="[^"]*"\s*\/>/,`<link rel="canonical" href="${canonical}" />`)
  html=setTag(html,/<link rel="alternate" hreflang="fr-MA" href="[^"]*"\s*\/>/,`<link rel="alternate" hreflang="fr-MA" href="${canonical}" />`)
  html=setTag(html,/<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/>/,`<link rel="alternate" hreflang="x-default" href="${canonical}" />`)
  html=setTag(html,/<link rel="preload" href="[^"]*" as="image"[^>]*>/,`<link rel="preload" href="${image}" imagesrcset="${responsiveSrcSet(image)}" imagesizes="100vw" as="image" type="image/webp" fetchpriority="high" />`)
  const localMeta=placeName?`\n    <meta name="geo.placename" content="${escapeHtml(placeName)}" />`:''
  html=html.replace('</head>',`${localMeta}\n    <script id="static-route-schema" type="application/ld+json">${json(schema)}</script>\n  </head>`)
  return html
}

function landingMarkup(page){
  return `<main class="seo-landing-page" data-static-route="${escapeHtml(page.path)}">
    <nav class="breadcrumb section" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">›</span><span>${escapeHtml(page.eyebrow)}</span></nav>
    <section class="seo-local-hero section"><div class="seo-local-copy"><span class="eyebrow">${escapeHtml(page.eyebrow)}</span><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.intro)}</p><p><a class="btn btn-dark" href="/boutique">Voir les créations</a> <a class="text-link dark-link" href="/sur-mesure">Demander un gâteau sur mesure</a></p></div><figure><img src="${page.image}" srcset="${responsiveSrcSet(page.image)}" sizes="(max-width: 760px) 100vw, 48vw" alt="${escapeHtml(page.imageAlt)}" width="${imageDimensions(page.image)[0]}" height="${imageDimensions(page.image)[1]}"/><figcaption>MoroKika · Atelier d’Agdal</figcaption></figure></section>
    <section class="seo-local-facts section" aria-label="Informations pratiques">${page.facts.map(([label,value])=>`<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</section>
    <section class="seo-local-body section"><div class="seo-local-intro"><span class="eyebrow">Notre approche</span><h2>Une commande pensée dans les moindres détails.</h2></div><div class="seo-local-sections">${enrichedSections(page.sections,localPageAdditions,page.path).map(([title,text],index)=>`<article><span>0${index+1}</span><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></div></article>`).join('')}</div><aside><div><strong>Ce que vous pouvez attendre</strong><ul>${page.highlights.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul></div></aside></section>
    <section class="seo-local-faq section"><div><span class="eyebrow">Questions pratiques</span><h2>Avant de commander.</h2></div><div>${page.faqs.map(([question,answer])=>`<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join('')}</div></section>
    <section class="seo-local-related section"><span>Vous cherchez aussi</span><div>${page.related.map(route=>{const related=seoLandingPages.find(item=>item.path===route);return related?`<a href="${related.path}"><strong>${escapeHtml(related.eyebrow)}</strong><small>${escapeHtml(related.metaDescription)}</small></a>`:''}).join('')}</div></section>
    <section class="seo-local-cta"><h2>${escapeHtml(page.ctaTitle)}</h2><p>${escapeHtml(page.ctaText)}</p><p><a class="btn btn-light" href="/boutique">Commander en ligne</a> <a class="text-link" href="/contact">Parler à l’atelier</a></p></section>
  </main>`
}

function articleMarkup(article){
  return `<main class="article-page" data-static-route="/journal/${escapeHtml(article.slug)}">
    <nav class="breadcrumb section" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">›</span><a href="/journal">Journal</a><span aria-hidden="true">›</span><span>${escapeHtml(article.title)}</span></nav>
    <header class="article-header section"><span class="eyebrow">${escapeHtml(article.category)}</span><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.intro)}</p><div><span>${escapeHtml(article.date)}</span> · Lecture ${escapeHtml(article.readTime)}</div></header>
    <figure class="article-cover section"><img src="${article.image}" srcset="${responsiveSrcSet(article.image)}" sizes="(max-width: 760px) 100vw, 86vw" alt="${escapeHtml(article.title)}" width="${imageDimensions(article.image)[0]}" height="${imageDimensions(article.image)[1]}"/></figure>
    <div class="article-layout section"><aside><span>Le Journal MoroKika</span></aside><article>${enrichedSections(article.sections,journalSectionAdditions,article.slug).map(([title,text],index)=>`<section><span>0${index+1}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></section>`).join('')}<p><a class="btn btn-dark" href="/boutique">Goûter nos créations</a></p></article></div>
  </main>`
}

function collectionMarkup(page,selectedProducts){
  const guide=commerceSeoGuides[page.path]
  return `<main class="collection-page" data-static-route="${escapeHtml(page.path)}">
    <nav class="breadcrumb section" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">›</span>${page.path==='/boutique'?`<span>Boutique</span>`:`<a href="/boutique">Boutique</a><span aria-hidden="true">›</span><span>${escapeHtml(page.title)}</span>`}</nav>
    <section class="collection-hero"><img src="${page.image}" srcset="${responsiveSrcSet(page.image)}" sizes="100vw" alt="${escapeHtml(page.title)}" width="1254" height="1254"/><div></div><article><span class="eyebrow light">${escapeHtml(page.eyebrow)}</span><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.metaDescription)}</p><span>${selectedProducts.length} créations artisanales</span></article></section>
    <section class="collection-products section"><div class="collection-intro"><span class="eyebrow">Préparés à Rabat</span><h2>Des recettes choisies pour votre table.</h2><p>Chaque gâteau est préparé à la commande, disponible en plusieurs formats puis confié à un transport adapté.</p></div><div class="product-grid collection-product-grid">${selectedProducts.map(product=>`<article class="product-card"><a href="/produit/${escapeHtml(product.id)}"><img src="${product.image}" srcset="${responsiveSrcSet(product.image)}" sizes="(max-width: 760px) 46vw, 280px" loading="lazy" alt="${escapeHtml(product.name)}" width="1254" height="1254"/><span>${escapeHtml(product.category)}</span><h2>${escapeHtml(product.name)}</h2><p>${escapeHtml(product.short)}</p><strong>À partir de ${product.price.toLocaleString('fr-MA')} DH</strong></a></article>`).join('')}</div></section>
    ${guide?`<section class="seo-local-body section"><div class="seo-local-intro"><span class="eyebrow">Conseil d’achat</span><h2>${escapeHtml(guide.title)}</h2><p>${escapeHtml(guide.intro)}</p></div><div class="seo-local-sections">${enrichedSections(guide.sections,commerceGuideAdditions,page.path).map(([title,text],index)=>`<article><span>0${index+1}</span><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></div></article>`).join('')}</div></section><section class="seo-local-faq section"><div><span class="eyebrow">Questions pratiques</span><h2>Avant de choisir.</h2></div><div>${guide.faqs.map(([question,answer])=>`<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join('')}</div></section>`:''}
    <section class="collection-service section"><div><h2>Un petit mot offert</h2><p>Ajoutez votre message au moment de choisir la taille.</p></div><div><h2>Livraison planifiée</h2><p>À Rabat, Salé, Témara, Kénitra et Casablanca selon les créneaux proposés.</p></div><div><h2>Besoin d’un conseil ?</h2><p>L’atelier vous aide à choisir le format, les parfums et le délai approprié.</p></div></section>
  </main>`
}

function productMarkup(product){
  const guide=productPracticalGuides[product.id]
  return `<main class="product-page" data-static-route="/produit/${escapeHtml(product.id)}">
    <nav class="breadcrumb section" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">›</span><a href="/boutique">Boutique</a><span aria-hidden="true">›</span><span>${escapeHtml(product.name)}</span></nav>
    <section class="product-detail section"><div class="gallery"><figure class="main-image"><img src="${product.image}" srcset="${responsiveSrcSet(product.image)}" sizes="(max-width: 760px) 100vw, 48vw" alt="${escapeHtml(product.name)} — gâteau artisanal MoroKika" width="1254" height="1254"/></figure></div><article class="product-buybox"><span class="eyebrow">${escapeHtml(product.category)} · Fait à Rabat</span><h1>${escapeHtml(product.name)}</h1><p>${escapeHtml(product.short)}</p><strong>${product.price.toLocaleString('fr-MA')} DH</strong><p>${escapeHtml(product.description)}</p><h2>Formats disponibles</h2><ul><li>6 parts · ${product.price.toLocaleString('fr-MA')} DH</li><li>8 parts · ${(product.price+60).toLocaleString('fr-MA')} DH</li><li>12 parts · ${(product.price+120).toLocaleString('fr-MA')} DH</li></ul><p><a class="btn btn-dark" href="/produit/${escapeHtml(product.id)}">Choisir ce gâteau</a></p></article></section>
    <section class="article-layout section"><aside><span>Composition</span></aside><article><section><h2>L’inspiration de cette création</h2><p>${escapeHtml(product.story||product.description)} Chaque exemplaire est monté et fini dans l’atelier MoroKika à Rabat, puis conservé au frais jusqu’au retrait ou au départ du livreur.</p></section><section><h2>Conseils de dégustation</h2><p>${escapeHtml(product.tasting||'Conservez le gâteau entre 2 °C et 5 °C et sortez-le environ vingt minutes avant le service.')}</p></section><section><h2>À servir avec</h2><p>${escapeHtml(product.pairing||'Choisissez une boisson peu sucrée afin de préserver l’équilibre des parfums.')}</p></section><section><h2>Ingrédients et allergènes</h2><p><strong>Ingrédients principaux :</strong> ${escapeHtml(product.ingredients)}</p><p><strong>Allergènes :</strong> ${escapeHtml(product.allergens)} Notre atelier manipule quotidiennement du gluten, des œufs, du lait, des fruits à coque et du sésame ; les traces croisées ne peuvent donc pas être totalement exclues.</p></section><section><h2>Livraison et dégustation</h2><p>La collection est livrée à Rabat, Salé, Témara, Kénitra et Casablanca selon les créneaux proposés au checkout. Conservez le gâteau dans sa boîte entre 2 °C et 5 °C, puis sortez-le environ vingt minutes avant la dégustation, sauf indication différente de l’atelier.</p></section></article></section>
    ${guide?`<section class="product-practical section"><div class="product-practical-head"><span class="eyebrow">Conseils pratiques</span><h2>${escapeHtml(guide.title)}</h2><p>${escapeHtml(guide.intro)}</p></div><div>${guide.sections.map(([title,text],index)=>`<article><span>0${index+4}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></article>`).join('')}</div></section>`:''}
  </main>`
}

const findLinkLabel=path=>coreSeoPages.find(page=>page.path===path)?.title||seoLandingPages.find(page=>page.path===path)?.title||commerceLandingPages.find(page=>page.path===path)?.title||journalArticles.find(article=>`/journal/${article.slug}`===path)?.title||path

function coreMarkup(page){
  const isHome=page.path==='/'
  const isJournal=page.path==='/journal'
  return `<main class="seo-landing-page seo-core-page" data-static-route="${escapeHtml(page.path)}">
    ${isHome?'':`<nav class="breadcrumb section" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">›</span><span>${escapeHtml(page.title)}</span></nav>`}
    <section class="seo-local-hero section"><div class="seo-local-copy"><span class="eyebrow">${escapeHtml(page.eyebrow)}</span><h1>${escapeHtml(page.title)}</h1><p class="answer-summary">${escapeHtml(page.intro)}</p><p><a class="btn btn-dark" href="${isHome?'/boutique':page.links[0]}">${isHome?'Découvrir les gâteaux':'Continuer'}</a> <a class="text-link dark-link" href="/contact">Contacter MoroKika</a></p></div><figure><img src="${page.image}" srcset="${responsiveSrcSet(page.image)}" sizes="(max-width: 760px) 100vw, 48vw" alt="${escapeHtml(page.imageAlt)}" width="${imageDimensions(page.image)[0]}" height="${imageDimensions(page.image)[1]}"/><figcaption>MoroKika · Pâtisserie artisanale à Rabat</figcaption></figure></section>
    ${isHome?`<section class="seo-local-facts section" aria-label="Informations essentielles"><div><span>Atelier</span><strong>Agdal, Rabat</strong></div><div><span>Commande</span><strong>À partir de 320 DH</strong></div><div><span>Contact</span><strong>+212 7 08 01 49 75</strong></div></section>`:''}
    <section class="seo-local-body section"><div class="seo-local-intro"><span class="eyebrow">Réponse directe</span><h2>Les informations essentielles, sans ambiguïté.</h2></div><div class="seo-local-sections">${enrichedSections(page.sections,corePageAdditions,page.path).map(([title,text],index)=>`<article><span>${String(index+1).padStart(2,'0')}</span><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></div></article>`).join('')}</div></section>
    ${isHome?`<section class="collection-products section"><div class="collection-intro"><span class="eyebrow">La collection</span><h2>Les créations proposées en ligne.</h2><p>Prix de départ, parfums principaux et fiche détaillée pour chaque gâteau.</p></div><div class="product-grid collection-product-grid">${products.slice(0,4).map(product=>`<article class="product-card"><a href="/produit/${product.id}"><img src="${product.image}" srcset="${responsiveSrcSet(product.image)}" sizes="(max-width: 760px) 46vw, 280px" loading="lazy" alt="${escapeHtml(product.name)}" width="1254" height="1254"/><h2>${escapeHtml(product.name)}</h2><p>${escapeHtml(product.short)}</p><strong>À partir de ${product.price.toLocaleString('fr-MA')} DH</strong></a></article>`).join('')}</div></section>`:''}
    ${isJournal?`<section class="collection-products section"><div class="collection-intro"><span class="eyebrow">Guides publiés</span><h2>${journalArticles.length} ressources pour mieux préparer votre commande.</h2></div><div class="journal-grid">${journalArticles.map(article=>`<article><a href="/journal/${article.slug}"><img src="${article.image}" srcset="${responsiveSrcSet(article.image)}" sizes="(max-width: 760px) 100vw, 32vw" loading="lazy" alt="${escapeHtml(article.title)}"/><span>${escapeHtml(article.category)}</span><h2>${escapeHtml(article.title)}</h2><p>${escapeHtml(article.excerpt)}</p></a></article>`).join('')}</div></section>`:''}
    ${page.faqs.length?`<section class="seo-local-faq section"><div><span class="eyebrow">Questions fréquentes</span><h2>Réponses vérifiables.</h2></div><div>${page.faqs.map(([question,answer])=>`<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join('')}</div></section>`:''}
    <section class="seo-local-related section"><span>Ressources associées</span><div>${page.links.map(path=>`<a href="${path}"><strong>${escapeHtml(findLinkLabel(path))}</strong><small>Consulter cette page MoroKika</small></a>`).join('')}</div></section>
    <section class="seo-local-cta"><h2>Besoin d’une réponse adaptée à votre occasion ?</h2><p>Indiquez la date, la ville et le nombre de personnes pour faciliter la réponse de l’atelier.</p><p><a class="btn btn-light" href="/contact">Contacter MoroKika</a> <a class="text-link" href="/sur-mesure">Envoyer un brief</a></p></section>
  </main>`
}

for(const page of coreSeoPages){
  const pageUrl=`${origin}${page.path}`
  const graph=[{'@type':page.path==='/contact'?'ContactPage':page.path==='/la-maison'?'AboutPage':page.path==='/journal'?'Blog':'WebPage','@id':`${pageUrl}#webpage`,url:pageUrl,name:page.title,description:page.metaDescription,inLanguage:'fr-MA',dateModified:'2026-09-17',about:{'@id':`${origin}/#bakery`},primaryImageOfPage:{'@type':'ImageObject',url:`${origin}${page.image}`}}]
  if(page.path==='/')graph.push({'@type':'WebSite','@id':`${origin}/#website`,url:origin,name:'MoroKika',inLanguage:'fr-MA',publisher:{'@id':`${origin}/#bakery`}},{'@type':'ItemList',itemListElement:products.map((product,index)=>({'@type':'ListItem',position:index+1,url:`${origin}/produit/${product.id}`,name:product.name}))})
  else graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Accueil',item:`${origin}/`},{'@type':'ListItem',position:2,name:page.title,item:pageUrl}]})
  if(page.faqs.length)graph.push({'@type':'FAQPage','@id':`${pageUrl}#faq`,mainEntity:page.faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))})
  const schema={'@context':'https://schema.org','@graph':graph}
  let html=withMetadata({route:page.path,title:page.metaTitle,description:page.metaDescription,image:page.image,imageAlt:page.imageAlt,schema,placeName:['/','/contact','/livraison','/la-maison'].includes(page.path)?'Rabat, Maroc':undefined})
  html=html.replace('<div id="root"></div>',`<div id="root">${coreMarkup(page)}</div>`)
  const directory=page.path==='/'?new URL('../dist',import.meta.url).pathname:join(new URL('../dist',import.meta.url).pathname,page.path.slice(1))
  await mkdir(directory,{recursive:true})
  await writeFile(join(directory,'index.html'),html)
}

for(const page of seoLandingPages){
  const pageUrl=`${origin}${page.path}`
  const schema={'@context':'https://schema.org','@graph':[
    {'@type':'Service','@id':`${pageUrl}#service`,name:page.service,description:page.metaDescription,url:pageUrl,areaServed:{'@type':'AdministrativeArea',name:page.region},provider:{'@id':`${origin}/#bakery`}},
    {'@type':'FAQPage','@id':`${pageUrl}#faq`,mainEntity:page.faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Accueil',item:`${origin}/`},{'@type':'ListItem',position:2,name:page.title,item:pageUrl}]}
  ]}
  let html=withMetadata({route:page.path,title:page.metaTitle,description:page.metaDescription,image:page.image,imageAlt:page.imageAlt,schema,placeName:page.region})
  html=html.replace('<div id="root"></div>',`<div id="root">${landingMarkup(page)}</div>`)
  const directory=join(new URL('../dist',import.meta.url).pathname,page.path.slice(1))
  await mkdir(directory,{recursive:true})
  await writeFile(join(directory,'index.html'),html)
}

for(const article of journalArticles){
  const route=`/journal/${article.slug}`
  const pageUrl=`${origin}${route}`
  const schema={'@context':'https://schema.org','@graph':[{'@type':'Article','@id':`${pageUrl}#article`,mainEntityOfPage:pageUrl,headline:article.title,description:article.excerpt,image:`${origin}${article.image}`,inLanguage:'fr-MA',wordCount:[article.intro,...enrichedSections(article.sections,journalSectionAdditions,article.slug).flat()].join(' ').split(/\s+/).length,datePublished:articlePublishedDates[article.slug],dateModified:'2026-09-17',author:{'@type':'Organization',name:'MoroKika',url:origin},publisher:{'@type':'Organization',name:'MoroKika',url:origin}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Accueil',item:`${origin}/`},{'@type':'ListItem',position:2,name:'Journal',item:`${origin}/journal`},{'@type':'ListItem',position:3,name:article.title,item:pageUrl}]}]}
  let html=withMetadata({route,title:article.metaTitle||`${article.title} — MoroKika`,description:article.excerpt,image:article.image,imageAlt:article.title,type:'article',schema})
  html=html.replace('<div id="root"></div>',`<div id="root">${articleMarkup(article)}</div>`)
  const directory=join(new URL('../dist',import.meta.url).pathname,'journal',article.slug)
  await mkdir(directory,{recursive:true})
  await writeFile(join(directory,'index.html'),html)
}

for(const page of commerceLandingPages){
  const selectedProducts=page.productIds==='all'?products:page.productIds.map(id=>products.find(product=>product.id===id)).filter(Boolean)
  const pageUrl=`${origin}${page.path}`
  const breadcrumbItems=page.path==='/boutique'?[{'@type':'ListItem',position:1,name:'Accueil',item:`${origin}/`},{'@type':'ListItem',position:2,name:'Boutique',item:pageUrl}]:[{'@type':'ListItem',position:1,name:'Accueil',item:`${origin}/`},{'@type':'ListItem',position:2,name:'Boutique',item:`${origin}/boutique`},{'@type':'ListItem',position:3,name:page.title,item:pageUrl}]
  const graph=[{'@type':'CollectionPage','@id':`${pageUrl}#collection`,url:pageUrl,name:page.title,description:page.metaDescription,inLanguage:'fr-MA',about:{'@id':`${origin}/#bakery`}},{'@type':'ItemList',itemListElement:selectedProducts.map((product,index)=>({'@type':'ListItem',position:index+1,url:`${origin}/produit/${product.id}`,name:product.name}))},{'@type':'BreadcrumbList',itemListElement:breadcrumbItems}]
  const guide=commerceSeoGuides[page.path]
  if(guide)graph.push({'@type':'FAQPage','@id':`${pageUrl}#faq`,mainEntity:guide.faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))})
  const schema={'@context':'https://schema.org','@graph':graph}
  let html=withMetadata({route:page.path,title:page.metaTitle,description:page.metaDescription,image:page.image,imageAlt:page.title,schema})
  html=html.replace('<div id="root"></div>',`<div id="root">${collectionMarkup(page,selectedProducts)}</div>`)
  const directory=join(new URL('../dist',import.meta.url).pathname,page.path.slice(1))
  await mkdir(directory,{recursive:true})
  await writeFile(join(directory,'index.html'),html)
}

for(const product of products){
  const route=`/produit/${product.id}`
  const pageUrl=`${origin}${route}`
  const description=`${product.short}. Gâteau artisanal préparé à Rabat, avec retrait ou livraison locale sur créneau confirmé.`
  const schema={'@context':'https://schema.org','@graph':[
    {'@type':'Product','@id':`${pageUrl}#product`,url:pageUrl,name:product.name,image:`${origin}${product.image}`,description:product.description,sku:product.id,brand:{'@type':'Brand',name:'MoroKika'},offers:{'@type':'Offer',url:pageUrl,priceCurrency:'MAD',price:product.price,seller:{'@id':`${origin}/#bakery`}}},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Accueil',item:`${origin}/`},{'@type':'ListItem',position:2,name:'Boutique',item:`${origin}/boutique`},{'@type':'ListItem',position:3,name:product.name,item:pageUrl}]}
  ]}
  let html=withMetadata({route,title:`Gâteau ${product.name} | MoroKika`,description,image:product.image,imageAlt:`${product.name} — gâteau artisanal MoroKika`,schema})
  html=html.replace('<div id="root"></div>',`<div id="root">${productMarkup(product)}</div>`)
  const directory=join(new URL('../dist',import.meta.url).pathname,'produit',product.id)
  await mkdir(directory,{recursive:true})
  await writeFile(join(directory,'index.html'),html)
}

const coreRoutes=coreSeoPages.map(page=>page.path).filter(path=>path!=='/')
const staticRoutes=[...coreRoutes,...seoLandingPages.map(page=>page.path),...journalArticles.map(article=>`/journal/${article.slug}`),...commerceLandingPages.map(page=>page.path),...products.map(product=>`/produit/${product.id}`)]
const redirects=await readFile(new URL('../public/_redirects',import.meta.url),'utf8')
const sitemap=await readFile(new URL('../public/sitemap.xml',import.meta.url),'utf8')
const vercel=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'))
const vercelSources=new Set(vercel.rewrites.map(rule=>rule.source))
for(const route of staticRoutes){
  if(!redirects.split('\n').some(rule=>rule.startsWith(`${route} `)))throw new Error(`${route} is missing from public/_redirects`)
  if(!vercelSources.has(route))throw new Error(`${route} is missing from vercel.json`)
  if(!sitemap.includes(`<loc>${origin}${route}</loc>`))throw new Error(`${route} is missing from sitemap.xml`)
}

console.log(`Generated and deployment-validated ${staticRoutes.length+1} public routes: ${coreSeoPages.length} core pages, ${seoLandingPages.length} local pages, ${journalArticles.length} journal articles, ${commerceLandingPages.length} shop pages, and ${products.length} products.`)
