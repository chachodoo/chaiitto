let allProducts = {};
const whatsappPhoneNumber = "522218415466"; 
let currentMenuPage = 1;        
const totalMenuPages = 14; 

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
    
    // Open cart drawer automatically
    const drawer = document.getElementById('cart-drawer-backdrop');
    if (drawer && drawer.style.display !== 'block') {
        drawer.style.display = 'block';
    }
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
            itemEl.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: #FFFFFF; padding: 12px 14px; border-radius: 10px; border: 1px solid #E2E8E4; box-shadow: 0 2px 6px rgba(0,0,0,0.05);';
            itemEl.innerHTML = `
                <div style="flex: 1; padding-right: 10px;">
                    <div style="color: var(--matcha-deep); font-size: 0.92em; font-family: var(--font-heading); font-weight: bold;">${item.title}</div>
                    <div style="color: var(--gold-accent); font-size: 0.88em; font-weight: 700;">$${item.price} MXN</div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button onclick="updateCartQty(${index}, -1)" style="background: #F0F5F2; color: var(--matcha-deep); border: 1px solid #C2D4CE; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-weight: bold;">-</button>
                    <span style="color: var(--text-dark); font-weight: bold; font-size: 0.95em;">${item.qty}</span>
                    <button onclick="updateCartQty(${index}, 1)" style="background: #F0F5F2; color: var(--matcha-deep); border: 1px solid #C2D4CE; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-weight: bold;">+</button>
                </div>
            `;
            container.appendChild(itemEl);
        });
    }

    if (badge) badge.textContent = totalQty;
    if (totalEl) totalEl.textContent = `$${totalPrice} MXN`;

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
                return actions.order.create({
                    purchase_units: [{
                        description: `Pedido Chai-itto (${cart.length} productos)`,
                        amount: {
                            currency_code: "MXN",
                            value: grandTotal.toFixed(2)
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    cart = [];
                    saveCart();
                    toggleCartDrawer();

                    if (typeof confetti === 'function') {
                        confetti({ particleCount: 200, spread: 100, origin: { y: 0.4 } });
                    }

                    alert(`¡Pago completado con éxito! Recibirás la confirmación de envío en tu correo.`);
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
    currentMenuPage += direction;
    if (currentMenuPage < 1) currentMenuPage = totalMenuPages;
    if (currentMenuPage > totalMenuPages) currentMenuPage = 1;
    updateMenuDisplay();
}

function updateMenuDisplay() {
    const imgElement = document.getElementById('menu-current-image');
    const indicatorElement = document.getElementById('menu-page-indicator');
    if (indicatorElement) indicatorElement.textContent = `${currentMenuPage} / ${totalMenuPages}`;
    if (imgElement) imgElement.src = `menu/page-${currentMenuPage}.webp`;
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
        const response = await fetch(`sections/${pageName}.html`);
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
            currentMenuPage = targetPage;
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
    switchPage(pageName);
}

function normalizeStr(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
}

function selectCollection(colName) {
    const targetNorm = normalizeStr(colName);
    let tappedBtn = null;

    // Highlight active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const btnNorm = normalizeStr(btn.textContent || btn.innerText || '');
        const isActive = btnNorm.includes(targetNorm);
        btn.classList.toggle('active', isActive);
        if (isActive && !tappedBtn) tappedBtn = btn;
    });

    // Update section title banner if present
    const titleEl = document.getElementById('current-collection-title');
    if (titleEl) {
        titleEl.textContent = colName;
    }

    // Render products for the selected collection
    loadCollection(colName);

    // Keep the tapped pill locked in place without gliding back
    if (tappedBtn) {
        tappedBtn.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'instant' });
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
            let frascoHtml = frascoPrice > 0 ? `
                <button onclick="addToCart('${safeName}', ${frascoPrice}, 'Frasco')" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 4px 10px rgba(74, 124, 54, 0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';" style="background: rgba(74, 124, 54, 0.08); border: 1px solid var(--matcha-deep); border-radius: 8px; padding: 12px 5px; flex: 1; text-align: center; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
                    <span style="font-size: 0.75em; font-weight: 800; color: var(--matcha-deep); letter-spacing: 1px;">FRASCO</span>
                    <span style="font-size: 1.15em; font-weight: 900; color: var(--text-dark); margin: 2px 0;">$${frascoPrice}</span>
                    <span style="font-size: 0.85em; color: var(--matcha-deep); font-weight: bold;"><i class="fa-solid fa-cart-plus"></i> Añadir</span>
                </button>` : '';
                
            // 1-CLICK BUTTON: SOBRE
            let sobreHtml = sobrePrice > 0 ? `
                <button onclick="addToCart('${safeName}', ${sobrePrice}, 'Sobre')" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 4px 10px rgba(74, 124, 54, 0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';" style="background: linear-gradient(145deg, #ffffff, #e5e7eb); border: 1px solid var(--matcha-deep); border-radius: 8px; padding: 12px 5px; flex: 1; text-align: center; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
                    <span style="font-size: 0.75em; font-weight: 800; color: var(--matcha-deep); letter-spacing: 1px;">SOBRE</span>
                    <span style="font-size: 1.15em; font-weight: 900; color: var(--text-dark); margin: 2px 0;">$${sobrePrice}</span>
                    <span style="font-size: 0.85em; color: var(--matcha-deep); font-weight: bold;"><i class="fa-solid fa-cart-plus"></i> Añadir</span>
                </button>` : '';

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
                <div style="display: flex; gap: 10px; justify-content: center; width: 100%; margin-top: auto;">
                    ${frascoHtml}
                    ${sobreHtml}
                    ${fallbackHtml}
                </div>`;
                
            container.appendChild(card);
        });
    } else {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted);">Próximamente agregando productos a <strong>${colName}</strong>...</div>`;
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
                <div style="display: flex; gap: 10px; justify-content: center; width: 100%; margin-top: auto;">
                    <button onclick="event.stopPropagation(); addToCart('${safeName}', ${price})" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 4px 10px rgba(74, 124, 54, 0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';" style="background: rgba(74, 124, 54, 0.08); border: 1px solid var(--matcha-deep); border-radius: 8px; padding: 12px 5px; flex: 1; text-align: center; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
                        <span style="font-size: 0.75em; font-weight: 800; color: var(--matcha-deep); letter-spacing: 1px;">COMPRAR</span>
                        <span style="font-size: 1.15em; font-weight: 900; color: var(--text-dark); margin: 2px 0;">
                            ${isSale ? `<span style="font-size: 0.75em; text-decoration: line-through; color: #888; margin-right: 4px; font-weight: 400;">$${originalPrice}</span>` : ''}$${price}
                        </span>
                        <span style="font-size: 0.85em; color: var(--matcha-deep); font-weight: bold;"><i class="fa-solid fa-cart-plus"></i> Añadir</span>
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

  if (!enteredPhone || !enteredPin) {
    if (errorEl) {
      errorEl.style.color = '#e74c3c';
      errorEl.textContent = 'WhatsApp y PIN son requeridos.';
    }
    return;
  }

  if (errorEl) {
    errorEl.style.color = '';
    errorEl.textContent = 'Verificando...';
  }

  try {
    const res = await fetch(`${VIP_API_URL}?action=check&telefono=${encodeURIComponent(enteredPhone)}&pin=${encodeURIComponent(enteredPin)}`);
    const data = await res.json();

    if (!data.success) {
      errorEl.style.color = '#e74c3c';
      errorEl.textContent = data.message || 'Clave no válida o no encontrada.';
      return;
    }

    if (!data.isActive) {
      errorEl.style.color = '#e74c3c';
      errorEl.textContent = data.isExpired
        ? 'Tu membresía VIP ha vencido. Renueva tu acceso.'
        : 'Tu membresía no está activa.';
      return;
    }

    // Guardar sesión VIP en navegador
    sessionStorage.setItem('chai_vip_auth', 'true');
    sessionStorage.setItem('chai_vip_phone', enteredPhone);
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
            cupsHtml += `<span title="Taza ${i} canjeada" style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:#b38b59;color:#fff;border-radius:50%;font-size:18px;margin:0 5px;box-shadow:0 2px 4px rgba(0,0,0,0.15);">☕</span>`;
        } else {
            cupsHtml += `<span title="Taza ${i} disponible" style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:#f5f0eb;border:2px dashed #b38b59;color:#b38b59;border-radius:50%;font-size:16px;margin:0 5px;opacity:0.6;">☕</span>`;
        }
    }

    card.innerHTML = `
        <div style="background:linear-gradient(135deg, #2c2523, #1a1615);color:#fff;border-radius:14px;padding:20px;margin-bottom:25px;box-shadow:0 4px 15px rgba(0,0,0,0.15);text-align:center;border:1px solid #c5a059;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
                <div>
                    <span style="background:#c5a059;color:#1a1615;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;">Membresía VIP</span>
                    <h3 style="margin:6px 0 0;font-size:1.3rem;color:#f9f6f0;">${name}</h3>
                </div>
                <button onclick="lockBazarVIP()" style="background:transparent;border:1px solid rgba(255,255,255,0.3);color:#ddd;padding:4px 12px;border-radius:6px;font-size:12px;cursor:pointer;">Cerrar sesión</button>
            </div>
            
            <div style="background:rgba(255,255,255,0.06);border-radius:10px;padding:15px;margin:15px 0;">
                <p style="margin:0 0 10px;font-size:13px;letter-spacing:0.5px;color:#d8cfc4;">Tazas de cortesía del mes (4 al mes):</p>
                <div style="display:flex;justify-content:center;align-items:center;margin:10px 0;">${cupsHtml}</div>
                <p style="margin:8px 0 0;font-size:12px;color:#c5a059;font-weight:600;">
                    ${remaining > 0 ? `Te quedan ${remaining} tazas de cortesía este mes` : '¡Completaste tus 4 tazas de cortesía de este mes!'}
                </p>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-top:10px;">
                <span style="font-size:11px;color:#a89f91;">${expiry ? `Vigencia: ${expiry}` : ''}</span>
                ${remaining > 0 ? `
                    <button id="vip-redeem-btn" onclick="redeemVipCup()" style="background:#c5a059;color:#1a1615;font-weight:700;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:13px;transition:0.2s;">
                        Canjear 1 Taza
                    </button>
                ` : `
                    <span style="font-size:12px;color:#aaa;background:rgba(255,255,255,0.1);padding:6px 12px;border-radius:6px;">Próxima taza: costo regular</span>
                `}
            </div>
            <div id="vip-redeem-status" style="margin-top:8px;font-size:12px;"></div>
        </div>
    `;
}

async function redeemVipCup() {
    const pin = sessionStorage.getItem('chai_vip_pin');
    if (!pin) {
        alert('Sesión no válida. Ingresa tu PIN de nuevo.');
        lockBazarVIP();
        return;
    }

    const btn = document.getElementById('vip-redeem-btn');
    const statusEl = document.getElementById('vip-redeem-status');

    const confirmRedeem = confirm('¿Confirmas que deseas canjear 1 taza de cortesía en este momento?');
    if (!confirmRedeem) return;

    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Registrando...';
    }
    if (statusEl) {
        statusEl.style.color = '#c5a059';
        statusEl.textContent = 'Conectando con Google Sheets...';
    }

    try {
        const res = await fetch(`${VIP_API_URL}?action=redeem&pin=${encodeURIComponent(pin)}`);
        const data = await res.json();

        if (!data.success) {
            if (statusEl) {
                statusEl.style.color = '#e74c3c';
                statusEl.textContent = data.message || 'No se pudo canjear la taza.';
            }
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Canjear 1 Taza';
            }
            return;
        }

        sessionStorage.setItem('chai_vip_cups', data.tazasConsumidas);
        renderVipMemberCard();
        alert('¡Taza registrada con éxito! Disfruta tu Chai.');

    } catch (err) {
        console.error('Error canjeando taza:', err);
        if (statusEl) {
            statusEl.style.color = '#e74c3c';
            statusEl.textContent = 'Error de conexión. Intenta de nuevo.';
        }
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Canjear 1 Taza';
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
                    <button class="buy-button buy-now" style="margin-top: 8px;" onclick="openBazarModal(${index})">
                        <span style="font-size: 0.75rem; letter-spacing: 0.5px;">VER DETALLE</span>
                        <span style="font-size: 1.1em; font-weight: 900; margin: 2px 0;">
                            ${isSale ? `<span style="font-size: 0.75em; text-decoration: line-through; color: #888; margin-right: 4px; font-weight: 400;">$${originalPrice}</span>` : ''}$${price}
                        </span>
                        <span style="font-size: 0.7rem; opacity: 0.85;">Pieza VIP</span>
                    </button>
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

// --- JUMP TO MENU FROM A COLLECTION ---
function jumpToMenuCollection(pageNum) {
  window.targetMenuPage = pageNum;
  window.shouldScrollToCollections = true;
  switchPage('menu');

  // Center the tapped collection pill in the mobile horizontal track
  setTimeout(() => {
    const activeBtn = document.querySelector(`.collections-pills-track button[onclick*="${pageNum}"]`) ||
                      document.querySelector(`.inicio-pills-track button[onclick*="${pageNum}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, 150);
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
    btn.innerHTML = 'Continuar al Pago ($199) <i class="fa-solid fa-arrow-right"></i>';
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

function handleVipRegister(e) {
  e.preventDefault();
  const nombre = document.getElementById("vip-input-nombre").value.trim();
  const tel = document.getElementById("vip-input-tel").value.trim();
  const cumple = document.getElementById("vip-input-cumple").value.trim();
  const errBox = document.getElementById("vip-form-error");
  const btn = document.getElementById("vip-submit-btn");

  if (!nombre || !tel) {
    errBox.textContent = "Por favor ingresa tu nombre y WhatsApp.";
    errBox.style.display = "block";
    return;
  }
  if (!/^[0-9]{10}$/.test(tel)) {
    errBox.textContent = "El WhatsApp debe ser exactamente de 10 dígitos.";
    errBox.style.display = "block";
    return;
  }

  errBox.style.display = "none";
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

  try {
    localStorage.setItem("chaiitto_vip_phone", tel);
    localStorage.setItem("chaiitto_vip_name", nombre);
  } catch (ex) {}

  const url = `${APPS_SCRIPT_VIP_URL}?action=register&nombre=${encodeURIComponent(nombre)}&telefono=${encodeURIComponent(tel)}&cumpleanos=${encodeURIComponent(cumple)}`;

  fetch(url)
      .then(res => res.json())
      .then(data => {
        // 🛑 SI YA ESTÁ ACTIVO: Ocultar el botón de pago por completo y no dejar pagar
        if (data.alreadyActive) {
          btn.style.display = "none";
          errBox.style.display = "block";
          errBox.innerHTML = `⚠️ <strong>${data.message}</strong><br><a href="#bazar" onclick="closeVipModal()" style="color: #2D5A27; font-weight: bold; text-decoration: underline; display: inline-block; margin-top: 6px;">Acceder directo al Bazar VIP aquí &rarr;</a>`;
          return;
        }

        btn.disabled = false;
        btn.innerHTML = 'Continuar al Pago ($199) <i class="fa-solid fa-arrow-right"></i>';

        if (!data.success) {
          errBox.style.display = "block";
          errBox.textContent = data.message || "Error al procesar el registro.";
          return;
        }

        // Solo pasa al paso 2 si es registro nuevo
        document.getElementById("vip-modal-step1").style.display = "none";
        document.getElementById("vip-modal-step2").style.display = "block";
      })

}

async function simulateVipPayment() {
  const step2 = document.getElementById("vip-modal-step2");
  const step3 = document.getElementById("vip-modal-step3");
  const pinDisplay = document.getElementById("vip-display-pin");
  const waLink = document.getElementById("vip-btn-whatsapp-save");

  const phone = localStorage.getItem("chaiitto_vip_phone") || "";
  const name = localStorage.getItem("chaiitto_vip_name") || "Socio VIP";

  if (!phone) {
    alert("No se encontró número de WhatsApp para activar.");
    return;
  }

  // Call Apps Script to activate the record in Google Sheets
  const activateUrl = `${APPS_SCRIPT_VIP_URL}?action=activate&telefono=${encodeURIComponent(phone)}`;

  try {
    const res = await fetch(activateUrl);
    const data = await res.json();

    if (data.success && data.pin) {
      const realPin = data.pin;
      const expDate = data.fechaVencimiento || "";

      // Authorize session for Bazar VIP
      sessionStorage.setItem("chai_vip_auth", "true");
      sessionStorage.setItem("chai_vip_phone", phone);
      sessionStorage.setItem("chai_vip_expiry", expDate);
      localStorage.setItem("chaiitto_vip_pin", realPin);

      // Display assigned 911 PIN on screen
      if (pinDisplay) pinDisplay.textContent = realPin;

      // Prepare WhatsApp backup message
      if (waLink) {
        const msg = `Hola! Soy ${name}. Mi WhatsApp es ${phone} y mi PIN VIP de Chai-itto es ${realPin}.`;
        waLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      }

      if (step2) step2.style.display = "none";
      if (step3) step3.style.display = "block";
    } else {
      alert(data.message || "No se pudo activar la membresía.");
    }
  } catch (err) {
    console.error("Error activating membership:", err);
    alert("Error de comunicación con Google Sheets.");
  }
}

function goToBazarVip(e) {
  if (e) e.preventDefault();
  closeVipModal();

  // Navigate to #bazar route
  window.location.hash = "bazar";

  // Trigger catalog render if the function exists
  if (typeof loadBazarGrid === "function") {
    loadBazarGrid();
  }
}


