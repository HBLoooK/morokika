export const products = [
  {
    id: 'pistache-fleur-doranger', name: "Pistache & Fleur d’Oranger", short: 'Pistache, fleur d’oranger, vanille de Madagascar',
    price: 360, oldPrice: null, image: '/images/pistachio-blossom.webp', category: 'Signatures', occasion: 'Anniversaire', stock: null, active: true,
    dietary: ['Sans alcool'], badge: 'Signature', color: '#dce2ca',
    description: "Notre gâteau signature marie une génoise aérienne à la pistache, une crème onctueuse parfumée à la fleur d’oranger et un croustillant praliné. Un équilibre délicat, pensé pour les grandes tablées comme les petits bonheurs.",
    ingredients: 'Pistaches, œufs, farine, beurre, crème, chocolat blanc, fleur d’oranger, vanille.', allergens: 'Contient gluten, œufs, lait et fruits à coque.',
    story:'Une lecture contemporaine de deux parfums familiers des tables marocaines. La pistache apporte sa rondeur tandis que la fleur d’oranger est dosée comme une note de tête, présente sans devenir envahissante.',
    tasting:'La première bouchée révèle un biscuit souple, puis une crème légère et un praliné plus texturé. Sortez le gâteau du réfrigérateur environ vingt minutes avant de le couper afin que la pistache retrouve toute sa longueur.',
    pairing:'Servez-le avec un thé vert à la menthe peu sucré, une verveine légère ou un café blanc. Des boissons discrètes préservent la finesse de la fleur d’oranger.'
  },
  {
    id: 'atlas-chocolat', name: 'Atlas Chocolat Noir', short: 'Chocolat 70%, noisette torréfiée, fleur de sel',
    price: 390, oldPrice: 420, image: '/images/atlas-chocolate.webp', category: 'Chocolat', occasion: 'Cadeau', stock: null, active: true,
    dietary: ['Sans alcool'], badge: 'Coup de cœur', color: '#dac5b6',
    description: "Un entremets profond et soyeux au chocolat noir 70%, adouci par un praliné noisette croustillant et une pointe de fleur de sel. L’intensité de l’Atlas dans une création tout en finesse.",
    ingredients: 'Chocolat noir, noisettes, œufs, farine, beurre, crème, cacao, fleur de sel.', allergens: 'Contient gluten, œufs, lait et fruits à coque.',
    story:'Atlas Chocolat Noir recherche l’intensité sans lourdeur. Le chocolat à 70 % structure la recette, la noisette torréfiée lui donne de la profondeur et la fleur de sel précise la finale.',
    tasting:'Laissez le crémeux s’assouplir une vingtaine de minutes avant le service. Utilisez un couteau long passé sous l’eau chaude puis essuyé entre chaque part pour préserver les couches.',
    pairing:'Un café noss noss peu sucré souligne le praliné. Pour davantage de contraste, choisissez un thé noir léger ou une eau pétillante fraîche.'
  },
  {
    id: 'rose-framboise', name: 'Rose de Marrakech', short: 'Framboise, rose, litchi, crème légère',
    price: 380, oldPrice: null, image: '/images/rose-raspberry.webp', category: 'Fruités', occasion: 'Anniversaire', stock: null, active: true,
    dietary: ['Sans alcool'], badge: 'Nouveau', color: '#efd8d4',
    description: "Une création florale et fraîche, où la framboise acidulée rencontre le parfum délicat de la rose et la douceur du litchi. Une crème légère enveloppe une génoise moelleuse.",
    ingredients: 'Framboises, litchis, rose, œufs, farine, beurre, crème, vanille.', allergens: 'Contient gluten, œufs et lait.',
    story:'Inspirée des couleurs de Marrakech au lever du jour, cette création associe l’acidité franche de la framboise à une rose utilisée avec retenue. Le litchi relie les deux parfums par sa douceur florale.',
    tasting:'Servez Rose de Marrakech fraîche mais non glacée. Une remise à température de quinze minutes suffit généralement pour conserver la netteté des fruits et la tenue de la crème.',
    pairing:'Une verveine claire, un thé vert très léger ou simplement de l’eau fraîche accompagne la framboise sans ajouter une seconde note florale trop intense.'
  },
  {
    id: 'safran-agrumes', name: 'Safran & Agrumes', short: 'Orange, citron confit, safran de Taliouine',
    price: 340, oldPrice: null, image: '/images/citrus-saffron.webp', category: 'Fruités', occasion: 'Déjeuner', stock: null, active: true,
    dietary: ['Sans fruits à coque'], badge: null, color: '#eed5ad',
    description: "Solaire et délicat : un biscuit moelleux à l’orange, un cœur citron confit et une crème infusée au véritable safran de Taliouine. Une finale fraîche, subtilement épicée.",
    ingredients: 'Orange, citron, safran, œufs, farine, beurre, crème, vanille.', allergens: 'Contient gluten, œufs et lait.',
    story:'Le safran de Taliouine est ici traité comme une épice lumineuse plutôt que dominante. Orange et citron confit apportent l’acidité nécessaire pour garder une finale vive après le repas.',
    tasting:'Ce gâteau exprime particulièrement bien ses agrumes après quinze à vingt minutes hors du réfrigérateur. Découpez des parts régulières afin que chacune réunisse biscuit, cœur citron et crème safranée.',
    pairing:'Associez-le à un thé vert peu infusé, une verveine citronnée ou une eau fraîche avec un zeste d’orange. Évitez les boissons très sucrées.'
  },
  {
    id: 'caramel-majhul', name: 'Caramel & Dattes Majhoul', short: 'Dattes de Tafilalet, caramel, sésame grillé',
    price: 350, oldPrice: null, image: '/images/date-caramel.webp', category: 'Signatures', occasion: 'Cadeau', stock: null, active: true,
    dietary: ['Sans alcool'], badge: null, color: '#d4b48f',
    description: "Une gourmandise généreuse inspirée du Sud marocain. Dattes Majhoul fondantes, caramel blond, crème vanillée et graines de sésame grillées composent chaque bouchée.",
    ingredients: 'Dattes Majhoul, sésame, caramel, œufs, farine, beurre, crème.', allergens: 'Contient gluten, œufs, lait et sésame.',
    story:'La datte Majhoul du Tafilalet apporte un fruité profond qui permet de garder le caramel blond et mesuré. Le sésame grillé introduit une note torréfiée et une texture familière.',
    tasting:'Sortez le gâteau environ vingt minutes avant de servir pour assouplir le caramel. Les parts peuvent rester modérées après un repas : la datte offre une longueur naturellement généreuse.',
    pairing:'Un café noir léger, un thé à la menthe peu sucré ou un verre de lait frais crée un accord simple. Évitez d’ajouter des fruits secs à la table si des invités surveillent les allergènes.'
  },
  {
    id: 'vanille-figue', name: 'Vanille & Figue Fraîche', short: 'Vanille, figue violette, mascarpone, thym',
    price: 370, oldPrice: null, image: '/images/vanilla-fig.webp', category: 'Fruités', occasion: 'Déjeuner', stock: null, active: true,
    dietary: ['Sans fruits à coque'], badge: 'De saison', color: '#d5d0c4',
    description: "Une douceur de saison au biscuit vanillé, mascarpone aérien et figues fraîches. Quelques feuilles de thym apportent une note végétale discrète et très marocaine.",
    ingredients: 'Figues, mascarpone, vanille, thym, œufs, farine, beurre, crème.', allergens: 'Contient gluten, œufs et lait.',
    story:'Vanille & Figue Fraîche suit la courte saison des figues violettes. Le mascarpone porte le fruit sans le masquer et quelques notes de thym rappellent les jardins secs de la fin d’été.',
    tasting:'La figue fraîche demande une conservation rigoureuse au froid. Sortez le gâteau quinze minutes avant le service et consommez-le dans le délai indiqué avec la commande.',
    pairing:'Une infusion de verveine, un thé vert doux ou un café blanc accompagne la vanille. Une boisson peu sucrée laisse le fruit mûr rester au centre.'
  },
  {
    id: 'praline-cafe', name: 'Praliné Café Noss Noss', short: 'Café arabica, amande, chocolat au lait',
    price: 395, oldPrice: null, image: '/images/praline-coffee.webp', category: 'Chocolat', occasion: 'Cadeau', stock: null, active: true,
    dietary: ['Sans alcool'], badge: 'Édition limitée', color: '#ccb7a4',
    description: "Notre hommage au café noss noss : mousse café arabica, crémeux chocolat au lait et praliné amande croustillant. Franc, réconfortant et résolument élégant.",
    ingredients: 'Café arabica, chocolat au lait, amandes, œufs, farine, beurre, crème.', allergens: 'Contient gluten, œufs, lait et fruits à coque.',
    story:'Cette création reprend le souvenir du café noss noss dans un jeu de textures. L’arabica parfume la mousse, le chocolat au lait arrondit l’amertume et l’amande pralinée apporte le croustillant.',
    tasting:'Une vingtaine de minutes hors du froid permet à l’arôme du café de s’ouvrir. Servez de petites parts nettes : le contraste entre mousse et praliné donne une sensation généreuse.',
    pairing:'Accompagnez-le d’un espresso court, d’un thé noir léger ou d’un verre d’eau fraîche. Un café très lacté doublerait la douceur du chocolat au lait.'
  },
  {
    id: 'cheesecake-fruits-rouges', name: 'Cheesecake Fruits Rouges', short: 'Fraise, framboise, myrtille, citron',
    price: 320, oldPrice: null, image: '/images/berry-cheesecake.webp', category: 'Fruités', occasion: 'Anniversaire', stock: null, active: true,
    dietary: ['Sans alcool'], badge: null, color: '#ead1ce',
    description: "Crémeux, frais et juste assez acidulé. Notre cheesecake est garni de fruits rouges frais et d’un coulis maison au citron, sur une base biscuitée délicatement croustillante.",
    ingredients: 'Fromage frais, fraises, framboises, myrtilles, citron, biscuit, beurre.', allergens: 'Contient gluten et lait.',
    story:'Notre cheesecake recherche une texture crémeuse mais nette, soutenue par une base biscuitée fine. Le coulis au citron évite que le fromage frais et les fruits rouges ne deviennent trop doux.',
    tasting:'Gardez-le au réfrigérateur jusqu’à quinze minutes avant la découpe. Utilisez un couteau chaud et propre pour obtenir des parts régulières sans tirer le coulis sur les côtés.',
    pairing:'Un thé vert nature, une limonade maison peu sucrée ou une infusion de verveine prolonge la fraîcheur des fruits. Évitez les boissons très crémeuses.'
  }
]
