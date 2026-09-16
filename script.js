let allProducts = {};
const whatsappPhoneNumber = "522218415466"; 
const MENU_TOTAL_PAGES = 14;

const MENU_COLLECTIONS_MAP = {
  1:  { name: "Bienestar",     start: 1,  length: 1 },
  2:  { name: "Chai Lover",    start: 2,  length: 1 },
  3:  { name: "Blue Magic",    start: 3,  length: 1 },
  4:  { name: "Viajes con Té", start: 4,  length: 1 },
  5:  { name: "Nocturna",      start: 5,  length: 1 },
  6:  { name: "Especial",      start: 6,  length: 3 },
  9:  { name: "Wow",           start: 9,  length: 2 },
  11: { name: "Café",          start: 11, length: 1 },
  12: { name: "Choco Latte",   start: 12, length: 1 },
  13: { name: "Tentaciones",   start: 13, length: 1 },
  14: { name: "Quiero Matcha", start: 14, length: 1 }
};

let menuNavigationState = {
  mode: 'CATALOG',
  currentPage: 1,
  minPage: 1,
  maxPage: 14,
  collectionName: ''
};

let selectedProductName = '';
let selectedFrascoPrice = 0;
let selectedSobrePrice = 0;
let chosenPresentation = 'Frasco';

// TOGGLE MOBILE HAMBURGER MENU
function toggleMobileMenu() {
    const nav = document.getElementById('main-nav-menu');
    if (nav) nav.classList.toggle('active');
}
        
// GLOBAL CART SYSTEM
let cart = JSON.parse(localStorage.getItem('chaiitto_cart')) || [];

function saveCart() {
    localStorage.setItem('chaiitto_cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(name, price, presentation = '') {
    if (!name || price === undefined || price === null) return;
    const numPrice = Number(price);
    const itemTitle = presentation ? `${name} (${presentation})` : name;
    const existingIndex = cart.findIndex(item => item.title === itemTitle);

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({ title: itemTitle, price: numPrice, qty: 1 });
    }

    saveCart();
}

function updateCartQty(index, change) {
    if (cart[index] === undefined) return;
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
}

function calculateCartTotal() {
    let total = 0;
    cart.forEach(item => {
        total += (item.price * item.qty);
    });
    return total;
}

function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const badge = document.getElementById('cart-count-badge');
    const totalEl = document.getElementById('cart-total-price');
    const subtotalEl = document.getElementById('cart-subtotal-price');
    const shippingEl = document.getElementById('cart-shipping-price');
    if (!container) return;

    let totalQty = 0;
    let totalPrice = calculateCartTotal();

    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #556B60; padding: 40px 0; font-size: 0.9em;">Tu carrito está vacío.<br>¡Agrega tus productos favoritos!</p>`;
    } else {
        container.innerHTML = '';
        cart.forEach((item, index) => {
            totalQty += item.qty;

            const itemEl = document.createElement('div');
            itemEl.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #E2ECE5;';
            itemEl.innerHTML = `
                <div style="flex: 1; padding-right: 15px;">
                    <div style="color: #102619; font-size: 0.95rem; font-family: var(--font-heading, 'Cinzel', serif); font-weight: 800; letter-spacing: 0.5px; margin-bottom: 4px;">${item.title}</div>
                    <div style="color: #64748B; font-size: 0.85rem; font-weight: 600;">$${item.price} MXN</div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; background: #ffffff; border: 1px solid #E2ECE5; border-radius: 8px; padding: 4px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <button onclick="updateCartQty(${index}, -1)" style="background: none; border: none; color: #64748B; font-size: 1.2rem; cursor: pointer; padding: 0 4px;">-</button>
                    <span style="color: #102619; font-weight: 700; font-size: 0.95rem; min-width: 16px; text-align: center;">${item.qty}</span>
                    <button onclick="updateCartQty(${index}, 1)" style="background: none; border: none; color: #64748B; font-size: 1.1rem; cursor: pointer; padding: 0 4px;">+</button>
                </div>
            `;
            container.appendChild(itemEl);
        });
    }

    if (badge) badge.textContent = totalQty;


const shippingCost = totalPrice > 0 ? 100 : 0;
const grandTotal = totalPrice + shippingCost;

if (subtotalEl) subtotalEl.textContent = `$${totalPrice} MXN`;
if (shippingEl) shippingEl.textContent = `$${shippingCost} MXN`;
if (totalEl) totalEl.textContent = `$${grandTotal} MXN`;    

    renderPayPalButtons();
}

function toggleCartDrawer() {
    const drawer = document.getElementById('cart-drawer-backdrop');
    if (!drawer) return;
    drawer.style.display = (drawer.style.display === 'block') ? 'none' : 'block';
    updateCartUI();
}

function closeCartOnBackdrop(e) {
    if (e.target.id === 'cart-drawer-backdrop') {
        toggleCartDrawer();
    }
}

function renderPayPalButtons() {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    container.innerHTML = ''; 

    const grandTotal = calculateCartTotal();
    if (grandTotal <= 0 || cart.length === 0) {
        container.innerHTML = '<p style="color: #556B60; text-align: center; font-size: 0.8em;">Agrega productos para activar el pago seguro.</p>';
        return;
    }

    if (window.paypal) {
        paypal.Buttons({
            style: {
                layout: 'vertical',
                color:  'gold',
                shape:  'rect',
                label:  'checkout'
            },
            createOrder: function(data, actions) {
    const subtotal = calculateCartTotal();
    const shipping = 100;
    const finalTotal = subtotal + shipping;

    return actions.order.create({
        purchase_units: [{
            description: "Pedido Chai-itto - Té de Hoja Suelta",
            amount: {
                currency_code: "MXN",
                value: finalTotal.toFixed(2),
                breakdown: {
                    item_total: { currency_code: "MXN", value: subtotal.toFixed(2) },
                    shipping: { currency_code: "MXN", value: shipping.toFixed(2) }
                }
            }
        }]
    });
},
            onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          // Extraer datos del comprador y envío de PayPal
          const payer = details.payer || {};
          const purchaseUnit = (details.purchase_units && details.purchase_units[0]) || {};
          const shipping = purchaseUnit.shipping || {};
          const addressObj = shipping.address || {};
          
          const customerName = (shipping.name && shipping.name.full_name) 
            || `${payer.name?.given_name || ''} ${payer.name?.surname || ''}`.trim() 
            || 'Cliente Chai-itto';
            
          const customerEmail = payer.email_address || '';
          const customerPhone = payer.phone?.phone_number?.national_number || '';
          
          const shippingAddress = [
            addressObj.address_line_1,
            addressObj.address_line_2,
            addressObj.admin_area_2,
            addressObj.admin_area_1,
            addressObj.postal_code,
            addressObj.country_code
          ].filter(Boolean).join(', ') || 'No provista por PayPal';

          // Resumen de artículos del carrito
          const itemsSummary = cart.map(item => `• ${item.qty}x ${item.title} ($${item.price} MXN)`).join('\n');
          const finalTotal = calculateCartTotal() + 100;
          const orderId = details.id || data.orderID || ('CHAI-' + Date.now());

          // Enviar datos al webhook de Google Sheets
          const orderPayload = new URLSearchParams({
            action: 'order',
            orderId: orderId,
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            shippingAddress: shippingAddress,
            itemsSummary: itemsSummary,
            total: finalTotal
          });

          fetch(`${VIP_API_URL}?${orderPayload.toString()}`, { mode: 'no-cors' })
            .catch(err => console.error('Error registrando pedido en Sheet:', err));

          // Limpiar carrito y cerrar modal
          cart = [];
          saveCart();
          toggleCartDrawer();

          alert(`¡Gracias por tu compra, ${customerName}! Tu pedido #${orderId} ha sido registrado con éxito.`);
        });
      },
            onError: function(err) {
                console.error('PayPal Checkout Error:', err);
                alert('Ocurrió un problema al procesar el pago. Por favor intenta de nuevo.');
            }
        }).render('#paypal-button-container');
    }
}

// OPTION 1: REQUEST DIRECT PAYMENT LINK
function requestDirectPaymentLink() {
    const grandTotal = calculateCartTotal();
    if (grandTotal <= 0 || cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let orderSummary = cart.map(item => `• ${item.qty}x ${item.title} ($${item.price} MXN)`).join('\n');
    let message = `¡Hola Chai-itto! Me gustaría recibir un link de pago directo por mi pedido:\n\n${orderSummary}\n\n*Total:* $${grandTotal} MXN\n\nPor favor envíenme el link o solicitud de pago.`;

    let whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// MENU PAGE FLIPPER CONTROLS
function changeMenuPage(direction) {
  const target = menuNavigationState.currentPage + direction;
  if (target >= menuNavigationState.minPage && target <= menuNavigationState.maxPage) {
    menuNavigationState.currentPage = target;
    updateMenuDisplay();
  }
}

function updateMenuDisplay() {
  const imgElement = document.getElementById('menu-current-image');
  const indTop = document.getElementById('menu-page-indicator-top');
  const indBottom = document.getElementById('menu-page-indicator-bottom');

  // 1. Update the image
  if (imgElement) {
    imgElement.src = `menu/page-${menuNavigationState.currentPage}.webp`;
  }

  // 2. Set the text for both top & bottom indicators
  let labelText = '';
  if (menuNavigationState.mode === 'COLLECTION') {
    const totalInGroup = (menuNavigationState.maxPage - menuNavigationState.minPage) + 1;
    const currentInGroup = (menuNavigationState.currentPage - menuNavigationState.minPage) + 1;
    labelText = totalInGroup === 1 
      ? menuNavigationState.collectionName 
      : `${menuNavigationState.collectionName} (${currentInGroup} de ${totalInGroup})`;
  } else {
    labelText = `${menuNavigationState.currentPage} / ${MENU_TOTAL_PAGES}`;
  }

  if (indTop) indTop.textContent = labelText;
  if (indBottom) indBottom.textContent = labelText;

  // 3. Arrow states (disabled / hidden / pulsating)
  const isSinglePage = menuNavigationState.minPage === menuNavigationState.maxPage;
  const canPrev = menuNavigationState.currentPage > menuNavigationState.minPage;
  const canNext = menuNavigationState.currentPage < menuNavigationState.maxPage;

  const prevButtons = [
    document.getElementById('menu-top-prev'),
    document.getElementById('menu-mid-prev'),
    document.getElementById('menu-bot-prev')
  ];

  const nextButtons = [
    document.getElementById('menu-top-next'),
    document.getElementById('menu-mid-next'),
    document.getElementById('menu-bot-next')
  ];

  prevButtons.forEach(btn => {
    if (!btn) return;
    if (isSinglePage) {
      btn.style.display = 'inline-flex';
      btn.style.visibility = 'hidden';
      btn.style.pointerEvents = 'none';
    } else {
      btn.style.display = 'inline-flex';
      btn.style.visibility = 'visible';
      btn.style.opacity = canPrev ? '1' : '0.2';
      btn.style.pointerEvents = canPrev ? 'auto' : 'none';
    }
  });

  nextButtons.forEach(btn => {
    if (!btn) return;
    if (isSinglePage) {
      btn.style.display = 'inline-flex';
      btn.style.visibility = 'hidden';
      btn.style.pointerEvents = 'none';
      btn.classList.remove('menu-pulse');
    } else {
      btn.style.display = 'inline-flex';
      btn.style.visibility = 'visible';
      btn.style.opacity = canNext ? '1' : '0.2';
      btn.style.pointerEvents = canNext ? 'auto' : 'none';

      // Pulse next arrow only on multi-page collections when on the starting page
      const shouldPulse = (menuNavigationState.mode === 'COLLECTION') && canNext && (menuNavigationState.currentPage === menuNavigationState.minPage);
      btn.classList.toggle('menu-pulse', shouldPulse);
    }
  });
}

// ENTERPRISE GALLERY RENDERER
async function loadGalleryRibbon() {
    let container = document.getElementById('gallery-dynamic-container');
    if (!container) return;

    try {
        const response = await fetch('galeria.json?v=' + Date.now());
        if (!response.ok) return;

        let galleryData = await response.json();
        let galleryItems = [];

        if (Array.isArray(galleryData)) {
            galleryItems = galleryData;
        } else if (typeof galleryData === 'object' && galleryData !== null) {
            galleryItems = galleryData.images || galleryData.galeria || galleryData.items || Object.values(galleryData);
        }

        container.innerHTML = ''; 

        // No more duplicating! Just cleanly rendering your actual items.
        galleryItems.forEach(item => {
            const cleanPath = typeof item === 'string' ? item : (item.src || item.image || item.url || item.file || '');
            if (!cleanPath) return;

            const isVideo = cleanPath.toLowerCase().endsWith('.mp4') || cleanPath.toLowerCase().endsWith('.webm');
            const card = document.createElement('div');
            card.className = 'gallery-item-card';

            if (isVideo) {
                const video = document.createElement('video');
                video.src = cleanPath;
                video.autoplay = true; video.loop = true; video.muted = true; video.playsInline = true;
                video.onerror = () => { card.style.display = 'none'; };
                
                card.appendChild(video);
                
                // Allow users to tap a video to hear the sound
                card.onclick = () => { video.muted = !video.muted; };
                card.style.cursor = 'pointer';
            } else {
                const img = document.createElement('img');
                img.src = cleanPath;
                img.alt = 'Galería Chai-itto';
                img.onerror = () => { card.style.display = 'none'; };
                
                card.appendChild(img);
                // No click event needed! Users just scroll and enjoy the lifestyle shots.
            }
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading gallery:", error);
    }
}


async function fetchProducts() {
    try {
        const response = await fetch('products.json?v=' + Date.now());
        if (!response.ok) throw new Error('HTTP status ' + response.status);
        allProducts = await response.json();
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

        async function switchPage(pageName) {
            const targetPage = window.targetMenuPage || 1;
            window.targetMenuPage = null; // Tears up the ticket immediately

            document.body.style.overflow = 'auto';
            document.body.className = ''; // Strips any body-level blur classes
    
            // Properly close specific modals by removing their 'active' class
    document.querySelectorAll('.oferta-modal, #checkout-modal, #main-nav-menu').forEach(el => {
        if (el) el.classList.remove('active');
    });

    // Hard-hide the cart drawer
    const cartDrawer = document.getElementById('cart-drawer-backdrop');
    if (cartDrawer) cartDrawer.style.display = 'none';

    const container = document.getElementById('dynamic-content-area');
    const headerEl = document.querySelector('header');
    if (!container) return;

    if (headerEl) headerEl.classList.add('compact-header');
    container.classList.remove('dark-section');
    try {
    const response = await fetch(`sections/${pageName}.html?v=` + Date.now());
    if (!response.ok) throw new Error(`Could not load section: ${pageName}`);
    let html = await response.text();

    // If opening a specific collection, swap the image BEFORE it renders to prevent flashing Bienestar
    if (pageName === 'menu' && targetPage > 1) {
      html = html.replace(/page-1\.webp/g, `page-${targetPage}.webp`);
      html = html.replace(/1\s*\/\s*14/g, `${targetPage} / 14`);
    }

    container.innerHTML = html;

        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-btn[data-page="${pageName}"], .nav-btn[onclick*="${pageName}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        if (pageName === 'productos') {
            selectCollection('BIENESTAR');
        } else if (pageName === 'accesorios') {
            loadAccesoriosGrid();
        } else if (pageName === 'bazar') {
            loadBazarGrid();
        } else if (pageName === 'galeria') {
            setTimeout(loadGalleryRibbon, 100);
        } else if (pageName === 'menu') {
  menuNavigationState.currentPage = targetPage;
  updateMenuDisplay();
}

        // 3. FORCE IMMEDIATE JUMP TO TOP (Removed 'smooth' so it doesn't get stuck)
        window.scrollTo(0, 0);
        // Smooth glide back to Collections if flagged
    // Smooth glide back to Collections if flagged
if (pageName === 'inicio' && window.shouldScrollToCollections) {
    window.shouldScrollToCollections = false;
    setTimeout(() => {
        const anchor = document.getElementById('colecciones-anchor');
        if (anchor) {
            const headerOffset = 85; // Keeps title 85px below the screen top
            const targetY = anchor.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            window.scrollTo({ top: targetY, behavior: 'instant' });
        }
    }, 150);
}
        

    } catch (error) {
        console.error('Error loading page section:', error);
        container.innerHTML = `<div style="color: #FF8888; text-align: center; padding: 40px;">Error al cargar la sección "${pageName}".</div>`;
    }
}

function handleHashNavigation() {
    const hash = window.location.hash;
    let pageName = hash ? hash.replace('#', '').replace('-page', '') : 'inicio';
    
    // Route Clip payment returns to the main VIP section file
    if (pageName === 'vip-success' || pageName === 'vip-failed') {
        pageName = 'vip';
    }
    
    switchPage(pageName);
}

function normalizeStr(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
}

function selectCollection(colName) {
    const targetNorm = normalizeStr(colName);
    let tappedBtn = null;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const clickAttr = btn.getAttribute('onclick') || '';
        const btnText = btn.textContent || btn.innerText || '';
        const isActive = clickAttr.toUpperCase().includes(targetNorm) || normalizeStr(btnText).includes(targetNorm);
        btn.classList.toggle('active', isActive);
        if (isActive && !tappedBtn) tappedBtn = btn;
    });
    const titleEl = document.getElementById('current-collection-title');
    if (titleEl) {
        titleEl.textContent = colName;
    }
    loadCollection(colName);
    if (tappedBtn) {
        tappedBtn.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'instant' });
    }

    // RESET DESKTOP & MOBILE SCROLL TO JAR #1
    const container = document.getElementById('products-container');
    if (container) {
        const sidebar = document.querySelector('.sidebar-menu');
        const isDesktop = window.innerWidth >= 992;
        let stickyOffset = 0;
        
        if (isDesktop && sidebar) {
            // Header (197px) + sticky pills height + margin
            stickyOffset = 197 + (sidebar.offsetHeight || 110) + 15;
        } else {
            const header = document.querySelector('header');
            stickyOffset = (header ? header.offsetHeight : 70) + 15;
        }
        
        const containerTop = container.getBoundingClientRect().top + window.pageYOffset;
        const targetY = Math.max(0, containerTop - stickyOffset);
        
        // Only reset if user has scrolled down past the top of the grid
        if (window.pageYOffset > targetY + 20) {
            window.scrollTo({ top: targetY, behavior: 'instant' });
        }
    }
}

function loadCollection(colName) {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = '';

    let list = allProducts[colName];

    // Robust fallback if accenting differs (e.g. "VIAJES CON TÉ" vs "VIAJES CON TE")
    if (!list) {
        const targetNorm = normalizeStr(colName);
        const matchedKey = Object.keys(allProducts).find(k => normalizeStr(k) === targetNorm);
        if (matchedKey) list = allProducts[matchedKey];
    }
    list = list || [];

    if (list.length > 0) {
        list.forEach(prod => {
            const imageSrc = 'frasco.webp'; 
            const numLabel = prod.num ? `<span style="color: var(--matcha-deep); font-weight: 900; font-size: 1.2em; margin-right: 8px;">${prod.num}.</span>` : '';

            const frascoPrice = Number(prod.frasco) || 0;
            let sobrePrice = Number(prod.sobre) || (frascoPrice > 0 ? frascoPrice - 45 : 0);
            const isShippable = frascoPrice > 0 || sobrePrice > 0;
            const safeName = (prod.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

            // 1-CLICK BUTTON: FRASCO
            // 1:1 ACCESORIOS COPY: CLEAN SINGLE-ROW CARD WITH PRESENTATION SWITCHER
            const prodId = 'prod_' + Math.random().toString(36).substr(2, 9);
            let purchaseHtml = isShippable ? `
            <div style="width: 100%; margin-top: auto; padding-top: 4px;">
                ${(frascoPrice > 0 && sobrePrice > 0) ? `
                <div style="display: flex; gap: 6px; justify-content: center; margin-bottom: 8px;">
                    <button type="button" onclick="event.stopPropagation(); setCardPresentation('${prodId}', 'Frasco', ${frascoPrice}, '${safeName}')" id="${prodId}_btn_frasco" style="flex: 1; padding: 3px 0; font-size: 0.68rem; font-weight: 800; border-radius: 12px; border: 1.5px solid var(--matcha-deep, #07511A); background: var(--matcha-deep, #07511A); color: #FFFFFF; cursor: pointer; transition: all 0.15s ease;">FRASCO</button>
                    <button type="button" onclick="event.stopPropagation(); setCardPresentation('${prodId}', 'Sobre', ${sobrePrice}, '${safeName}')" id="${prodId}_btn_sobre" style="flex: 1; padding: 3px 0; font-size: 0.68rem; font-weight: 800; border-radius: 12px; border: 1.5px solid rgba(7, 81, 26, 0.3); background: #FFFFFF; color: var(--matcha-deep, #07511A); cursor: pointer; transition: all 0.15s ease;">SOBRE</button>
                </div>` : ''}
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 4px 2px 2px 2px;">
                    <div style="display: flex; align-items: baseline; gap: 4px;">
                        <span id="${prodId}_price" style="font-family: var(--font-heading, 'Cinzel', serif); font-size: 1.05rem; font-weight: 800; color: var(--matcha-deep, #07511A);">$${frascoPrice > 0 ? frascoPrice : sobrePrice}</span>
                    </div>
                    <button id="${prodId}_cart_btn" onclick="event.stopPropagation(); addToCart('${safeName}', ${frascoPrice > 0 ? frascoPrice : sobrePrice}, '${frascoPrice > 0 ? 'Frasco' : 'Sobre'}')" title="Añadir al carrito" style="width: 34px; height: 34px; min-width: 34px; border-radius: 50%; border: 1.5px solid var(--matcha-deep, #07511A); background: #FFFFFF; color: var(--matcha-deep, #07511A); display: flex; align-items: center; justify-content: center; font-size: 0.95rem; cursor: pointer; padding: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.06); transition: all 0.15s ease;" onmouseover="this.style.background='#07511A'; this.style.color='#FFFFFF'; this.style.transform='scale(1.08)';" onmouseout="this.style.background='#FFFFFF'; this.style.color='#07511A'; this.style.transform='scale(1)';">
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                </div>
            </div>` : '';

            // FALLBACK
            let fallbackHtml = !isShippable ? `
                <button onclick="switchPage('menu')" style="width: 100%; padding: 12px; background: rgba(45, 90, 39, 0.9); color: #fff; border: 1px solid var(--gold-border); border-radius: 25px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 0.2s;">
                    <i class="fa-solid fa-book-open"></i> Ver en Menú
                </button>` : '';

            const card = document.createElement('div');
            card.className = 'product-card';
            
            card.style.cssText = 'background: #fff; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between; height: 100%; border: 1px solid #f0f0f0; transition: transform 0.2s ease, box-shadow 0.2s ease;';
            card.onmouseover = function() { this.style.transform = 'translateY(-3px)'; this.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; };
            card.onmouseout = function() { this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; };

            card.innerHTML = `
                <div>
                    <img src="${imageSrc}" onerror="this.src='logo.png'" alt="${prod.name || ''}" style="width: 100%; max-width: 180px; height: auto; object-fit: contain; margin: 0 auto 15px auto; display: block; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));">
                    <h3 style="font-size: 1.1em; margin-bottom: 10px; color: var(--text-dark); display: flex; align-items: center; justify-content: center; text-transform: uppercase;">
                        ${numLabel} ${prod.name || ''}
                    </h3>
                    <p style="font-size: 0.85em; color: #666; margin-bottom: 20px; line-height: 1.4; min-height: 40px;">${prod.ingredients || ''}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px; width: 100%; margin-top: auto;">
                    ${purchaseHtml}
                    ${fallbackHtml}
                </div>`;
                
            container.appendChild(card);
        });
    } else {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted);">Próximamente agregando productos a <strong>${colName}</strong>...</div>`;
    }
}
// HELPER: TOGGLE FRASCO / SOBRE ON PRODUCT CARD
function setCardPresentation(prodId, pres, price, name) {
    const priceEl = document.getElementById(prodId + '_price');
    const cartBtn = document.getElementById(prodId + '_cart_btn');
    const btnFrasco = document.getElementById(prodId + '_btn_frasco');
    const btnSobre = document.getElementById(prodId + '_btn_sobre');
    if (priceEl) priceEl.textContent = '$' + price;
    if (cartBtn) cartBtn.setAttribute('onclick', `event.stopPropagation(); addToCart('${name}', ${price}, '${pres}')`);
    if (btnFrasco && btnSobre) {
        if (pres === 'Frasco') {
            btnFrasco.style.background = '#07511A'; btnFrasco.style.color = '#FFFFFF'; btnFrasco.style.borderColor = '#07511A';
            btnSobre.style.background = '#FFFFFF'; btnSobre.style.color = '#07511A'; btnSobre.style.borderColor = 'rgba(7, 81, 26, 0.3)';
        } else {
            btnSobre.style.background = '#07511A'; btnSobre.style.color = '#FFFFFF'; btnSobre.style.borderColor = '#07511A';
            btnFrasco.style.background = '#FFFFFF'; btnFrasco.style.color = '#07511A'; btnFrasco.style.borderColor = 'rgba(7, 81, 26, 0.3)';
        }
    }
}

/* --- ACCESORIOS RENDERER --- */
async function loadAccesoriosGrid() {
    const track = document.getElementById('accesorios-dynamic-track');
    if (!track) return;

    try {
        const response = await fetch('accesorios.json?v=' + Date.now());
        if (!response.ok) throw new Error('Could not load accesorios.json');

        const accesoriosList = await response.json();
        track.innerHTML = '';

        accesoriosList.forEach(item => {
            const isSale = item.precioOferta !== null && item.precioOferta !== undefined && item.precioOferta > 0;
            const price = isSale ? item.precioOferta : (item.precio || 0);
            const originalPrice = item.precio || 0;            
            const descText = item.descripcion || '';
            const titleText = item.name ? `#${item.num}. ${item.name}` : `#${item.num}`;
            const imageList = (item.images && item.images.length > 0) ? item.images : [item.image || 'logo.png'];
            const coverImage = imageList[0];
            const safeName = item.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');

            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.position = 'relative';

            card.innerHTML = `
                <div>
                    ${isSale ? '<span class="badge-oferta">OFERTA</span>' : ''}
                    <div class="product-img-box gallery-trigger" style="cursor: zoom-in;" title="Ver galería de fotos">
                        <img src="${coverImage}" alt="${item.name || 'Accesorio'}">
                    </div>
                    <h3 class="product-name">${titleText}</h3>
                    <p class="product-ingredients">${descText}</p>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-top: auto; padding: 4px 2px 2px 2px;">
                        <div style="display: flex; flex-direction: column; align-items: flex-start; line-height: 1.15; min-width: 0;">
                            ${isSale ? `<span style="font-size: 0.72rem; text-decoration: line-through; color: #888888; font-weight: 600;">$${originalPrice}</span>` : ''}
                            <span style="font-family: var(--font-heading, 'Cinzel', serif); font-size: 1.05rem; font-weight: 800; color: var(--matcha-deep, #07511A);">$${price}</span>
                        </div>
                        <button onclick="event.stopPropagation(); addToCart('${safeName}', ${price})" title="Añadir al carrito" style="width: 32px; height: 32px; min-width: 32px; border-radius: 50%; border: 1.5px solid var(--matcha-deep, #07511A); background: #FFFFFF; color: var(--matcha-deep, #07511A); display: flex; align-items: center; justify-content: center; font-size: 0.88rem; cursor: pointer; padding: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.06); transition: all 0.15s ease; flex-shrink: 0;" onmouseover="this.style.background='#07511A'; this.style.color='#FFFFFF'; this.style.transform='scale(1.08)';" onmouseout="this.style.background='#FFFFFF'; this.style.color='#07511A'; this.style.transform='scale(1)';">
                            <i class="fa-solid fa-cart-plus"></i>
                        </button>
                    </div>
            `;
            
            card.querySelector('.gallery-trigger').onclick = () => {
                openOfertaModal(titleText, descText, imageList, item.name, price);
            };

            track.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading accesorios.json:", error);
    }
}

/* --- BAZAR VIP AUTHENTICATION & DATABASE CHECK --- */
let bazarList = [];
let currentBazarItem = null;
let currentBazarImgIdx = 0;

/* ===================================================
   BAZAR VIP AUTHENTICATION & EXPIRATION CHECK
   =================================================== */
const VIP_API_URL = 'https://script.google.com/macros/s/AKfycby0Y8l0z4cj36ck79vn1Kv-2r11XcU_UVLMFy1qKxT-W0pfSLRnmsh7U2BsfvkJuITk/exec';

async function verifyVipPin() {
    const phoneInput = document.getElementById('vip-phone-input');
    const pinInput = document.getElementById('vip-pin-input');
    const errorEl = document.getElementById('vip-pin-error');

    const enteredPhone = phoneInput ? phoneInput.value.trim() : '';
    const enteredPin = pinInput ? pinInput.value.trim() : '';
    const countrySelect = document.getElementById('bazar-country-select');
    const countryPrefix = countrySelect ? countrySelect.value.trim() : '52';

    if (!enteredPhone || !enteredPin) {
        if (errorEl) {
            errorEl.style.color = '#e74c3c';
            errorEl.textContent = 'Ingresa tu número y PIN.';
        }
        return;
    }

    const cleanPhone = countryPrefix + enteredPhone.replace(/\D/g, "");

    if (errorEl) {
        errorEl.style.color = '';
        errorEl.textContent = 'Verificando...';
    }

    try {
        const res = await fetch(`${VIP_API_URL}?action=check&telefono=${encodeURIComponent(cleanPhone)}&pin=${encodeURIComponent(enteredPin)}`);
        const data = await res.json();

        if (!data.success) {
            errorEl.style.color = '#e74c3c';
            errorEl.textContent = data.message || 'Clave no válida o no encontrada.';
            return;
        }

        if (!data.isActive) {
            errorEl.style.color = '#e74c3c';
            errorEl.textContent = data.isExpired ? 'Tu membresía VIP ha vencido. Renueva tu acceso.' : 'Tu membresía no está activa.';
            return;
        }

        // Save the cleaned 12-digit phone to the session so the redemption script can use it
        sessionStorage.setItem('chai_vip_auth', 'true');
        sessionStorage.setItem('chai_vip_phone', cleanPhone); 
        sessionStorage.setItem('chai_vip_pin', enteredPin);
        sessionStorage.setItem('chai_vip_name', data.nombre || 'Miembro VIP');
        sessionStorage.setItem('chai_vip_cups', data.tazasConsumidas || 0);
        if (data.fechaVencimiento) {
            sessionStorage.setItem('chai_vip_expiry', data.fechaVencimiento);
        }

        errorEl.textContent = '';
        if (pinInput) pinInput.value = '';
        showUnlockedBazar();

    } catch (err) {
        console.error('Error validando credenciales:', err);
        if (errorEl) {
            errorEl.style.color = '#e74c3c';
            errorEl.textContent = 'Error de conexión. Intenta de nuevo.';
        }
    }
}

function showUnlockedBazar() {
    const lockBox = document.getElementById('bazar-vip-lock');
    const contentBox = document.getElementById('bazar-vip-content');
    if (lockBox) lockBox.style.display = 'none';
    if (contentBox) contentBox.style.display = 'block';
    renderVipMemberCard();
    renderBazarCatalog();
}

function lockBazarVIP() {
    sessionStorage.removeItem('chai_vip_auth');
    sessionStorage.removeItem('chai_vip_phone');
    sessionStorage.removeItem('chai_vip_pin');
    sessionStorage.removeItem('chai_vip_name');
    sessionStorage.removeItem('chai_vip_cups');
    sessionStorage.removeItem('chai_vip_expiry');

    const lockBox = document.getElementById('bazar-vip-lock');
    const contentBox = document.getElementById('bazar-vip-content');
    if (lockBox) lockBox.style.display = 'block';
    if (contentBox) contentBox.style.display = 'none';
}

function renderVipMemberCard() {
    const contentBox = document.getElementById('bazar-vip-content');
    if (!contentBox) return;

    let card = document.getElementById('vip-member-card');
    if (!card) {
        card = document.createElement('div');
        card.id = 'vip-member-card';
        contentBox.insertBefore(card, contentBox.firstChild);
    }

    const name = sessionStorage.getItem('chai_vip_name') || 'Miembro VIP';
    const expiry = sessionStorage.getItem('chai_vip_expiry') || '';
    const cups = parseInt(sessionStorage.getItem('chai_vip_cups') || '0', 10);
    const remaining = Math.max(0, 4 - cups);

    let cupsHtml = '';
    for (let i = 1; i <= 4; i++) {
        if (i <= cups) {
            cupsHtml += `<span title="Taza ${i} canjeada" style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.2);border-radius:50%;font-size:16px;margin:0 6px;"><i class="fa-solid fa-mug-hot"></i></span>`;
        } else {
            cupsHtml += `<span title="Taza ${i} disponible" style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;background:linear-gradient(135deg, #F5D061 0%, #D4AF37 100%);color:#102619;border-radius:50%;font-size:16px;margin:0 6px;box-shadow: 0 4px 10px rgba(212, 175, 55, 0.4);"><i class="fa-solid fa-mug-hot"></i></span>`;
        }
    }

    // ENTERPRISE GREEN PALETTE & COMPACT UI
    card.innerHTML = `
        <div style="background:linear-gradient(135deg, var(--emerald-card, #102619), var(--matcha-deep, #07511A));color:#fff;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 10px 30px rgba(0,0,0,0.25);text-align:center;border:1.5px solid rgba(212, 175, 55, 0.4);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
                <div style="text-align:left;">
                    <span style="background:linear-gradient(135deg, #F5D061, #D4AF37);color:#102619;font-size:0.7rem;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;box-shadow:0 2px 6px rgba(212,175,55,0.3);">Membresía VIP</span>
                    <h3 style="margin:6px 0 0;font-size:1.4rem;color:#ffffff;font-family:var(--font-heading);">${name}</h3>
                </div>
                <button onclick="lockBazarVIP()" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#ffffff;padding:6px 14px;border-radius:8px;font-size:0.8rem;font-weight:600;cursor:pointer;transition:all 0.2s;">Cerrar sesión</button>
            </div>
            
            <div style="background:rgba(0,0,0,0.25);border-radius:12px;padding:16px;margin:16px 0;border:1px solid rgba(255,255,255,0.05);">
                <p style="margin:0 0 10px;font-size:0.95rem;letter-spacing:0.5px;color:#e2e8f0;font-weight:600;">Tazas de cortesía del mes (4 al mes):</p>
                <div style="display:flex;justify-content:center;align-items:center;margin:12px 0;">${cupsHtml}</div>
                <p style="margin:10px 0 0;font-size:0.9rem;color:#F5D061;font-weight:700;">
                    ${remaining > 0 ? `Te quedan ${remaining} tazas de cortesía este mes` : '¡Completaste tus 4 tazas de cortesía de este mes!'}
                </p>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:5px;">
                <span style="font-size:0.9rem;font-weight:700;color:#f8fafc;background:rgba(255,255,255,0.1);padding:8px 14px;border-radius:8px; border: 1px solid rgba(255,255,255,0.15);">
                    <i class="fa-regular fa-calendar-xmark" style="color:#D4AF37; margin-right:6px;"></i> ${expiry ? `Vigencia: ${expiry}` : 'Vigencia Activa'}
                </span>
                ${remaining > 0 ? `
                    <button id="vip-redeem-btn" onclick="redeemVipCup()" style="background:linear-gradient(135deg, #F5D061, #D4AF37);color:#102619;font-weight:800;border:none;padding:10px 22px;border-radius:8px;cursor:pointer;font-size:1rem;box-shadow:0 4px 15px rgba(212,175,55,0.35);transition:transform 0.2s, box-shadow 0.2s;">
                        <i class="fa-solid fa-mug-hot"></i> Canjear 1 Taza
                    </button>
                ` : `
                    <span style="font-size:0.85rem;color:#94a3b8;background:rgba(255,255,255,0.05);padding:10px 16px;border-radius:8px;font-weight:600;">Próxima taza: costo regular</span>
                `}
            </div>
        </div>
    `;
}

// ==================================================
// ENTERPRISE REDEMPTION MODAL LOGIC
// ==================================================
function redeemVipCup() {
    const pin = sessionStorage.getItem('chai_vip_pin');
    const phone = sessionStorage.getItem('chai_vip_phone');
    
    if (!pin || !phone) {
        alert('Sesión no válida. Ingresa tu PIN de nuevo.');
        lockBazarVIP();
        return;
    }

    const existing = document.getElementById('vip-custom-confirm');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'vip-custom-confirm';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
        <div style="background:#ffffff;border-radius:16px;padding:24px;width:90%;max-width:340px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.4);">
            <div style="width:60px;height:60px;background:rgba(212,175,55,0.15);color:#D4AF37;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px;">
                <i class="fa-solid fa-mug-hot"></i>
            </div>
            <h3 style="margin:0 0 10px;font-family:var(--font-heading);color:#102619;font-size:1.3rem;">Canjear Cortesía</h3>
            <p style="margin:0 0 20px;color:#64748b;font-size:0.9rem;line-height:1.4;">¿Confirmas que deseas canjear <strong>1 taza</strong> de tu membresía en este momento?</p>
            <div style="display:flex;gap:10px;">
                <button onclick="document.getElementById('vip-custom-confirm').remove()" style="flex:1;padding:12px;background:#f1f5f9;color:#475569;border:none;border-radius:8px;font-weight:700;cursor:pointer;transition:all 0.2s;">Cancelar</button>
                <button onclick="executeVipRedeem('${pin}', '${phone}')" style="flex:1;padding:12px;background:linear-gradient(135deg, #F5D061, #D4AF37);color:#102619;border:none;border-radius:8px;font-weight:800;cursor:pointer;box-shadow:0 4px 10px rgba(212,175,55,0.3);transition:all 0.2s;">Sí, Canjear</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

async function executeVipRedeem(pin, phone) {
    const modalOverlay = document.getElementById('vip-custom-confirm');
    if (modalOverlay) {
        modalOverlay.innerHTML = `
            <div style="background:#ffffff;border-radius:16px;padding:30px 24px;width:90%;max-width:340px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.4);">
                <i class="fa-solid fa-spinner fa-spin" style="font-size:2.5rem;color:#D4AF37;margin-bottom:15px;"></i>
                <h3 style="margin:0;font-family:var(--font-heading);color:#102619;font-size:1.1rem;">Registrando Taza...</h3>
            </div>
        `;
    }

    try {
        // NEW BACKEND FIX: Appending both pin AND telefono so the backend verifies successfully
        const res = await fetch(`${VIP_API_URL}?action=redeem&pin=${encodeURIComponent(pin)}&telefono=${encodeURIComponent(phone)}`);
        const data = await res.json();
        
        if (!data.success) {
            if (modalOverlay) {
                modalOverlay.innerHTML = `
                    <div style="background:#ffffff;border-radius:16px;padding:24px;width:90%;max-width:340px;text-align:center;">
                        <div style="color:#e74c3c;font-size:2.5rem;margin-bottom:10px;"><i class="fa-solid fa-circle-xmark"></i></div>
                        <h3 style="margin:0 0 10px;color:#102619;">No se pudo canjear</h3>
                        <p style="color:#64748b;font-size:0.9rem;margin-bottom:20px;">${data.message || 'Error desconocido.'}</p>
                        <button onclick="document.getElementById('vip-custom-confirm').remove()" style="width:100%;padding:12px;background:#f1f5f9;color:#475569;border:none;border-radius:8px;font-weight:700;cursor:pointer;">Cerrar</button>
                    </div>
                `;
            }
            return;
        }

        sessionStorage.setItem('chai_vip_cups', data.tazasConsumidas);
        renderVipMemberCard(); 
        
        if (modalOverlay) {
            modalOverlay.innerHTML = `
                <div style="background:#ffffff;border-radius:16px;padding:24px;width:90%;max-width:340px;text-align:center;">
                    <div style="width:60px;height:60px;background:#25D366;color:#ffffff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 16px;box-shadow:0 4px 12px rgba(37,211,102,0.3);">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <h3 style="margin:0 0 10px;font-family:var(--font-heading);color:#102619;font-size:1.3rem;">¡Éxito!</h3>
                    <p style="margin:0 0 20px;color:#64748b;font-size:0.9rem;line-height:1.4;">Tu taza ha sido canjeada correctamente.</p>
                    <button onclick="document.getElementById('vip-custom-confirm').remove()" style="width:100%;padding:12px;background:#102619;color:#ffffff;border:none;border-radius:8px;font-weight:700;cursor:pointer;">Disfruta tu Chai</button>
                </div>
            `;
        }

    } catch (err) {
        console.error('Error canjeando taza:', err);
        if (modalOverlay) {
            modalOverlay.innerHTML = `
                <div style="background:#ffffff;border-radius:16px;padding:24px;width:90%;max-width:340px;text-align:center;">
                    <div style="color:#e74c3c;font-size:2.5rem;margin-bottom:10px;"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <h3 style="margin:0 0 10px;color:#102619;">Error de conexión</h3>
                    <p style="color:#64748b;font-size:0.9rem;margin-bottom:20px;">Por favor verifica tu internet e intenta de nuevo.</p>
                    <button onclick="document.getElementById('vip-custom-confirm').remove()" style="width:100%;padding:12px;background:#f1f5f9;color:#475569;border:none;border-radius:8px;font-weight:700;cursor:pointer;">Cerrar</button>
                </div>
            `;
        }
    }
}

async function loadBazarGrid() {
    const isAuth = sessionStorage.getItem('chai_vip_auth') === 'true';
    const storedExpiry = sessionStorage.getItem('chai_vip_expiry');

    if (isAuth) {
        if (storedExpiry && new Date() > new Date(storedExpiry + 'T23:59:59')) {
            lockBazarVIP();
            return;
        }
        showUnlockedBazar();
    } else {
        lockBazarVIP();
    }
}

async function renderBazarCatalog() {
    const track = document.getElementById('bazar-dynamic-track');
    if (!track) return;

    try {
        const response = await fetch('bazar.json?t=' + Date.now());
        bazarList = await response.json();
        track.innerHTML = '';

        if (!bazarList || bazarList.length === 0) {
            track.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <i class="fa-solid fa-crown" style="font-size: 2.5rem; color: var(--gold-accent); margin-bottom: 15px; display: block;"></i>
                    <h3 style="font-family: var(--font-heading); color: var(--matcha-deep); margin-bottom: 8px;">Inventario VIP en Preparación</h3>
                    <p style="font-size: 0.95rem;">Actualmente estamos catalogando nuevas piezas exclusivas.</p>
                </div>
            `;
            return;
        }

        bazarList.forEach((item, index) => {
            const isSale = item.precioOferta !== null && item.precioOferta !== undefined && item.precioOferta > 0;
            const price = isSale ? item.precioOferta : (item.precio || 0);
            const originalPrice = item.precio || 0;
            const coverImage = (item.images && item.images.length > 0) ? item.images[0] : (item.image || 'logo.png');

            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.position = 'relative';

            card.innerHTML = `
                <div>
                    ${isSale ? '<span class="badge-oferta">OFERTA</span>' : ''}
                    <div class="product-img-box gallery-trigger" style="cursor: zoom-in;" title="Ver fotos" onclick="openBazarModal(${index})">
                        <img src="${coverImage}" alt="${item.name || 'Bazar'}" loading="lazy">
                    </div>
                    <div class="product-name" style="margin-top: 8px;">${item.name || 'Artículo Bazar'}</div>
                    <div class="product-ingredients" style="font-size: 0.78rem; min-height: 32px;">${item.descripcion || ''}</div>
                </div>
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-top: auto; padding: 6px 4px 2px 4px;">
                    <div style="display: flex; align-items: baseline; gap: 6px;">
                        ${isSale ? `<span style="font-size: 0.78rem; text-decoration: line-through; color: #888;">$${originalPrice}</span>` : ''}
                        <span style="font-family: var(--font-heading, 'Cinzel', serif); font-size: 1.05rem; font-weight: 800; color: var(--matcha-deep, #07511A);">$${price}</span>
                    </div>
                    <button onclick="openBazarModal(${index})" title="Ver detalle de la pieza" style="width: 34px; height: 34px; min-width: 34px; border-radius: 50%; border: 1.5px solid var(--matcha-deep, #07511A); background: #FFFFFF; color: var(--matcha-deep, #07511A); display: flex; align-items: center; justify-content: center; font-size: 0.95rem; cursor: pointer; padding: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.06); transition: all 0.15s ease;" onmouseover="this.style.background='#07511A'; this.style.color='#FFFFFF'; this.style.transform='scale(1.08)';" onmouseout="this.style.background='#FFFFFF'; this.style.color='#07511A'; this.style.transform='scale(1)';">
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
                </div>
            `;
            track.appendChild(card);
        });
    } catch (error) {
        console.error('Error cargando bazar.json:', error);
    }
}

/* Modal Functions for Bazar VIP */
function openBazarModal(index) {
    currentBazarItem = bazarList[index];
    if (!currentBazarItem) return;
    currentBazarImgIdx = 0;

    const modal = document.getElementById('bazar-modal');
    if (!modal) return;

    document.getElementById('bazar-modal-title').textContent = currentBazarItem.name || 'Pieza Bazar';
    document.getElementById('bazar-modal-subtitle').textContent = currentBazarItem.descripcion || '';
    
    const isSale = currentBazarItem.precioOferta !== null && currentBazarItem.precioOferta !== undefined && currentBazarItem.precioOferta > 0;
    const finalPrice = isSale ? currentBazarItem.precioOferta : (currentBazarItem.precio || 0);
    const buyBtn = document.getElementById('bazar-modal-buy-btn');
    if (buyBtn) {
        buyBtn.href = `https://wa.me/522212061234?text=${encodeURIComponent('Hola Chai-itto, me interesa apartar la pieza de Bazar: ' + (currentBazarItem.name || '') + ' ($' + finalPrice + ' MXN)')}`;
    }

    updateBazarModalImage();
    modal.classList.add('active');
}

function updateBazarModalImage() {
    if (!currentBazarItem) return;
    const images = currentBazarItem.images || [currentBazarItem.image || 'logo.png'];
    const imgEl = document.getElementById('bazar-modal-img');
    const counterEl = document.getElementById('bazar-modal-counter');
    const prevBtn = document.getElementById('bazar-modal-prev-btn');
    const nextBtn = document.getElementById('bazar-modal-next-btn');

    imgEl.src = images[currentBazarImgIdx];
    counterEl.textContent = `${currentBazarImgIdx + 1} / ${images.length}`;

    if (images.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else {
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
    }
}

function changeBazarModalImage(dir) {
    if (!currentBazarItem) return;
    const images = currentBazarItem.images || [];
    if (images.length <= 1) return;
    currentBazarImgIdx = (currentBazarImgIdx + dir + images.length) % images.length;
    updateBazarModalImage();
}

function closeBazarModal() {
    const modal = document.getElementById('bazar-modal');
    if (modal) modal.classList.remove('active');
}

function closeBazarModalOnBackdrop(e) {
    if (e.target.id === 'bazar-modal') closeBazarModal();
}


// ==========================================
// BULLETPROOF LIGHTBOX MODAL LOGIC
// ==========================================
let currentModalImages = [];
let currentModalIndex = 0;

function openOfertaModal(title, subtitle, imageArray, prodName, price) {
    currentModalImages = imageArray && imageArray.length > 0 ? imageArray : ['logo.png'];
    currentModalIndex = 0;

    // 1. Open the photo galleries
    const modals = document.querySelectorAll('.oferta-modal');
    modals.forEach(modal => {
        const titleEl = modal.querySelector('#modal-title, .oferta-title');
        if (titleEl) titleEl.textContent = title;

        const subEl = modal.querySelector('#modal-subtitle, .oferta-subtitle');
        if (subEl) subEl.textContent = subtitle;

        const buyBtn = modal.querySelector('#modal-buy-btn, .oferta-buy-btn');
        if (buyBtn) buyBtn.style.display = 'none';

        const imgEl = modal.querySelector('#modal-img, img');
        if (imgEl) imgEl.src = currentModalImages[0];

        modal.classList.add('active');
    });

    document.querySelectorAll('#modal-counter, .modal-counter').forEach(el => {
        el.textContent = `1 / ${currentModalImages.length}`;
    });

    // 2. ASSASSINATE THE BAD MODAL: If the old Frasco/Sobre popup accidentally tried to open, instantly kill it and hide it forever!
    const badModal = document.getElementById('checkout-modal');
    if (badModal) {
        badModal.classList.remove('active');
        badModal.style.display = 'none';
    }
}

function changeModalImage(direction) {
    if (!currentModalImages || currentModalImages.length <= 1) return;
    
    currentModalIndex += direction;
    if (currentModalIndex < 0) currentModalIndex = currentModalImages.length - 1;
    if (currentModalIndex >= currentModalImages.length) currentModalIndex = 0;
    
    document.querySelectorAll('.oferta-modal img, #modal-img').forEach(img => {
        img.src = currentModalImages[currentModalIndex];
    });
    
    document.querySelectorAll('#modal-counter, .modal-counter').forEach(el => {
        el.textContent = `${currentModalIndex + 1} / ${currentModalImages.length}`;
    });
}

function closeOfertaModal() {
    document.querySelectorAll('.oferta-modal').forEach(m => m.classList.remove('active'));
}

function closeOfertaModalOnBackdrop(event) {
    if (event.target.classList.contains('oferta-modal') || event.target.id === 'oferta-modal') {
        closeOfertaModal();
    }
}


function initVisitorCounter() {
    const BASE_COUNT = 19777;
    let savedCount = parseInt(localStorage.getItem('chaiitto_visitor_count')) || BASE_COUNT;
    savedCount += 1;
    localStorage.setItem('chaiitto_visitor_count', savedCount);

    const counterEl = document.getElementById('visitor-count-num');
    if (counterEl) counterEl.textContent = String(savedCount).padStart(6, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchProducts();
    handleHashNavigation();
    initVisitorCounter();
    updateCartUI();
});

window.addEventListener('hashchange', handleHashNavigation);

function openFullMenuCatalog(startPage = 1) {
  menuNavigationState.mode = 'CATALOG';
  menuNavigationState.currentPage = startPage;
  menuNavigationState.minPage = 1;
  menuNavigationState.maxPage = MENU_TOTAL_PAGES;
  menuNavigationState.collectionName = '';

  if (typeof switchPage === 'function') {
    switchPage('menu').then(() => updateMenuDisplay());
  } else {
    updateMenuDisplay();
  }
}




// --- JUMP TO MENU FROM A COLLECTION ---
function jumpToMenuCollection(startPage) {
  const collection = MENU_COLLECTIONS_MAP[startPage];
  
  if (collection) {
    menuNavigationState.mode = 'COLLECTION';
    menuNavigationState.currentPage = collection.start;
    menuNavigationState.minPage = collection.start;
    menuNavigationState.maxPage = collection.start + collection.length - 1;
    menuNavigationState.collectionName = collection.name;
  } else {
    menuNavigationState.mode = 'CATALOG';
    menuNavigationState.currentPage = startPage;
    menuNavigationState.minPage = 1;
    menuNavigationState.maxPage = MENU_TOTAL_PAGES;
    menuNavigationState.collectionName = '';
  }

  if (typeof switchPage === 'function') {
    switchPage('menu').then(() => updateMenuDisplay());
  } else {
    updateMenuDisplay();
  }
}

// --- 1-TAP RETURN TO COLLECTIONS ---
function returnToCollections() {
  window.shouldScrollToCollections = true;
  switchPage('inicio');
}

// ENTERPRISE GALLERY SCROLL LOGIC
function scrollGallery(direction) {
    const container = document.getElementById('gallery-dynamic-container');
    if (!container) return;
    
    const scrollAmount = 370; 
    const maxScroll = container.scrollWidth - container.clientWidth;
    const currentScroll = Math.ceil(container.scrollLeft);

    if (direction === 'right') {
        if (currentScroll >= maxScroll - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' }); 
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    } else if (direction === 'left') {
        if (currentScroll <= 10) {
            container.scrollTo({ left: maxScroll, behavior: 'smooth' }); 
        } else {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    }
}

// ==========================================
// VIP MEMBERSHIP & BAZAR CONTROLLER
// ==========================================
const APPS_SCRIPT_VIP_URL = "https://script.google.com/macros/s/AKfycby0Y8l0z4cj36ck79vn1Kv-2r11XcU_UVLMFy1qKxT-W0pfSLRnmsh7U2BsfvkJuITk/exec";

function openVipModal() {
    const modal = document.getElementById("vip-register-modal");
    const step1 = document.getElementById("vip-modal-step1");
    const step2 = document.getElementById("vip-modal-step2");
    const step3 = document.getElementById("vip-modal-step3");
    const btn = document.getElementById("vip-submit-btn");
    const errBox = document.getElementById("vip-form-error");

    if (btn) {
        btn.style.display = "block";
        btn.disabled = false;
        btn.innerHTML = 'Continuar al Pago ($180 MXN) <i class="fa-solid fa-arrow-right"></i>';
    }
    if (errBox) errBox.style.display = "none";
    if (modal) {
        modal.style.display = "flex";
        if (step1) step1.style.display = "block";
        if (step2) step2.style.display = "none";
        if (step3) step3.style.display = "none";
    }
}

function closeVipModal() {
    const modal = document.getElementById("vip-register-modal");
    if (modal) modal.style.display = "none";
}

// AUTO-HANDLE VIP RETURN FROM CLIP (SUCCESS & FAIL)
function handleClipReturn() {
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase();
    
    const isSuccess = searchParams.get('clip_status') === 'success' || hash.includes('vip-success');
    const isFailed = searchParams.get('clip_status') === 'failed' || hash.includes('vip-failed');

    if (!isSuccess && !isFailed) return;

    if (typeof switchPage === 'function' && (!window.location.hash.includes('vip'))) {
        switchPage('vip');
    }

    let attempts = 0;
    const checkModalReady = setInterval(() => {
        attempts++;
        const modal = document.getElementById("vip-register-modal");
        
        if (modal) {
            clearInterval(checkModalReady);
            window.history.replaceState({}, document.title, window.location.pathname + '#vip');

            if (isSuccess) {
                completeVipActivation();
            } else if (isFailed) {
                openVipModal();
                const step1 = document.getElementById("vip-modal-step1");
                const step2 = document.getElementById("vip-modal-step2");
                const errBox = document.getElementById("vip-form-error");
                
                if (step1) step1.style.display = "none";
                if (step2) step2.style.display = "block";
                if (errBox) {
                    errBox.style.display = "block";
                    errBox.textContent = "Tu pago no se pudo completar. Por favor revisa los datos de tu tarjeta o intenta con otro método.";
                }
            }
        }

        if (attempts >= 40) {
            clearInterval(checkModalReady);
        }
    }, 100);
}

window.addEventListener('DOMContentLoaded', handleClipReturn);
window.addEventListener('hashchange', handleClipReturn);

// STEP 1 REGISTRATION: VALIDATE, SHOW SPINNER & SAVE TO GOOGLE SHEETS AS PENDIENTE
function handleVipRegister(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById("vip-input-nombre");
    const countrySelect = document.getElementById("vip-input-country");
    const telInput = document.getElementById("vip-input-tel");
    const bdayInput = document.getElementById("vip-input-cumple");
    const errBox = document.getElementById("vip-form-error");
    const btn = document.getElementById("vip-submit-btn");

    const name = nameInput ? nameInput.value.trim() : "";
    const country = countrySelect ? countrySelect.value.trim() : "52";
    const rawTel = telInput ? telInput.value.trim().replace(/\D/g, "") : "";
    const bday = bdayInput ? bdayInput.value.trim() : "";

    if (!name || rawTel.length !== 10) {
        if (errBox) {
            errBox.style.display = "block";
            errBox.textContent = "Por favor ingresa tu nombre y los 10 dígitos de tu WhatsApp.";
        }
        return;
    }

    if (errBox) errBox.style.display = "none";

    const fullPhone = country + rawTel;

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

    try {
        localStorage.setItem("chaiitto_vip_phone", fullPhone);
        localStorage.setItem("chaiitto_vip_name", name);
        localStorage.setItem("chaiitto_vip_cumple", bday);
    } catch (ex) {}

    const url = `${APPS_SCRIPT_VIP_URL}?action=register&nombre=${encodeURIComponent(name)}&telefono=${encodeURIComponent(fullPhone)}&cumpleanos=${encodeURIComponent(bday)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.alreadyActive) {
                btn.style.display = "none";
                errBox.style.display = "block";
                errBox.innerHTML = `⚠️ <strong>${data.message}</strong><br><a href="#bazar" onclick="closeVipModal()" style="color: #2D5A27; font-weight: bold; text-decoration: underline; display: inline-block; margin-top: 6px;">Acceder directo al Bazar VIP aquí &rarr;</a>`;
                return;
            }

            btn.disabled = false;
            btn.innerHTML = 'Continuar al Pago ($180 MXN) <i class="fa-solid fa-arrow-right"></i>';

            if (!data.success) {
                errBox.style.display = "block";
                errBox.textContent = data.message || "Error al procesar el registro.";
                return;
            }

            const step1 = document.getElementById("vip-modal-step1");
            const step2 = document.getElementById("vip-modal-step2");
            if (step1) step1.style.display = "none";
            if (step2) step2.style.display = "block";
        })
        .catch(err => {
            console.error("Error guardando registro VIP:", err);
            btn.disabled = false;
            btn.innerHTML = 'Continuar al Pago ($180 MXN) <i class="fa-solid fa-arrow-right"></i>';
            const step1 = document.getElementById("vip-modal-step1");
            const step2 = document.getElementById("vip-modal-step2");
            if (step1) step1.style.display = "none";
            if (step2) step2.style.display = "block";
        });
}

// STEP 3: ACTIVATION & DYNAMIC WHATSAPP ROUTING
async function completeVipActivation() {
    const storedPhone = localStorage.getItem("chaiitto_vip_phone") || "";
    const name = localStorage.getItem("chaiitto_vip_name") || "Socio VIP";
    const cumple = localStorage.getItem("chaiitto_vip_cumple") || "";

    // 1. CHECK FOR ERRORS FIRST
    if (!storedPhone) {
        closeVipModal(); // <--- Force closes the background modal so the empty success screen never shows

        // ENTERPRISE CUSTOM ERROR MODAL
        const overlay = document.createElement('div');
        overlay.id = 'vip-error-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';

        const modal = document.createElement('div');
        modal.style.cssText = 'background:#ffffff;width:100%;max-width:400px;border-radius:16px;padding:24px;text-align:center;box-shadow:0 20px 25px -5px rgba(0,0,0,0.2);';

        modal.innerHTML = `
            <div style="width:60px;height:60px;background:rgba(220,38,38,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:#dc2626;font-size:1.8rem;">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 style="margin:0 0 12px;font-size:1.4rem;font-family:var(--font-heading,inherit);font-weight:900;color:#102619;letter-spacing:-0.5px;">Atención</h3>
            <p style="margin:0 0 24px;font-size:0.95rem;color:#64748b;line-height:1.5;">No se encontró tu número de WhatsApp para vincular el registro. Por favor, contáctanos para generar tu PIN manualmente.</p>
            <button onclick="document.getElementById('vip-error-overlay').remove()" style="width:100%;padding:14px;background:var(--matcha-deep, #07511A);color:#ffffff;border:none;border-radius:10px;font-weight:700;font-size:1rem;cursor:pointer;transition:background 0.2s;">Entendido</button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        return; // HALT EXECUTION
    }

    // 2. IF NO ERROR, SHOW SUCCESS UI
    openVipModal();

    const step1 = document.getElementById("vip-modal-step1");
    const step2 = document.getElementById("vip-modal-step2");
    const step3 = document.getElementById("vip-modal-step3");
    const pinDisplay = document.getElementById("vip-display-pin");
    const waLink = document.getElementById("vip-btn-whatsapp-save");

    if (step1) step1.style.display = "none";
    if (step2) step2.style.display = "none";
    if (step3) step3.style.display = "block";

    // 3. CELEBRATE SUCCESS
    // ENTERPRISE FIREWORKS DISPLAY (Matcha & Gold)
    if (typeof confetti === 'function') {
        const duration = 3000; // 3 seconds of continuous fireworks
        const end = Date.now() + duration;

        (function frame() {
            // Left Cannon
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 },
                colors: ['#D4AF37', '#102619', '#F5D061', '#ffffff'],
                zIndex: 999999
            });
            // Right Cannon
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 },
                colors: ['#D4AF37', '#102619', '#F5D061', '#ffffff'],
                zIndex: 999999
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    // 3. GENERATE PIN
    let cleanPhone = storedPhone.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
        cleanPhone = "52" + cleanPhone;
    }

    try {
if (pinDisplay) {
            pinDisplay.textContent = "GENERANDO PIN...";
            pinDisplay.style.fontSize = "1.2rem";
            pinDisplay.style.letterSpacing = "2px";
        }
        const activateUrl = `${APPS_SCRIPT_VIP_URL}?action=activate&telefono=${encodeURIComponent(cleanPhone)}&nombre=${encodeURIComponent(name)}&cumpleanos=${encodeURIComponent(cumple)}`;
        const response = await fetch(activateUrl);
        const data = await response.json();
        const pin = data.pin || "911-" + cleanPhone.slice(-4);

        if (pinDisplay) pinDisplay.textContent = pin;

        localStorage.setItem("chaiitto_vip_status", "active");
        if (pinDisplay) {
            pinDisplay.textContent = pin;
            pinDisplay.style.fontSize = "2.2rem";
            pinDisplay.style.letterSpacing = "4px";
        }
        if (waLink) {
            const msg = `Este es mi PIN de socio VIP Premium Chai-itto: *${pin}* (Nombre: ${name}).`;
            waLink.href = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
            waLink.target = "_blank";
        }
    } catch (err) {
        console.warn("Backend activation error, assigning local fallback PIN:", err);
        const fallbackPin = "911-" + cleanPhone.slice(-4);
        if (pinDisplay) {
            pinDisplay.textContent = fallbackPin;
            pinDisplay.style.fontSize = "2.2rem";
            pinDisplay.style.letterSpacing = "4px";
        }
        localStorage.setItem("chaiitto_vip_status", "active");
        localStorage.setItem("chaiitto_vip_pin", fallbackPin);

        if (waLink) {
            const msg = `Este es mi PIN de socio VIP Premium Chai-itto: *${fallbackPin}* (Nombre: ${name}).`;
            waLink.href = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
            waLink.target = "_blank";
        }
    }
}

function goToBazarVip(e) {
    if (e) e.preventDefault();
    closeVipModal();
    window.location.hash = "bazar";
    if (typeof loadBazarGrid === "function") {
        loadBazarGrid();
    }
}


