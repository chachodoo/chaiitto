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

        // UNCLIPPED CONTINUOUS GALLERY RIBBON FIRST -> ACCURATE YOUTUBE EMBED BELOW (NO INSTAGRAM)
        async function loadGalleryRibbon() {
            let mainSection = document.querySelector('#dynamic-content-area .story-card') || document.getElementById('dynamic-content-area');
            if (!mainSection) return;

            // Enforce Ribbon ON TOP and YouTube PLAYLIST EMBED BELOW
            mainSection.innerHTML = `
                <h1 class="story-title">Galería Chai-itto</h1>
                <p class="story-subtitle">Momentos, Té y Tradición</p>
                
                <!-- 1. RIBBON WRAPPER ON TOP -->
                <div class="gallery-ribbon-wrapper">
                    <div id="gallery-dynamic-container"></div>
                </div>

                <!-- 2. EXACT YOUTUBE PLAYLIST EMBED BELOW RIBBON -->
                <div class="youtube-gallery-section">
                    <h3 style="color: var(--matcha-deep); font-family: var(--font-title); margin: 25px 0 15px 0;">Videos y Experiencias</h3>
                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 16px; border: 2px solid var(--gold-border); box-shadow: 0 6px 18px rgba(0,0,0,0.1);">
                        <iframe src="https://www.youtube.com/embed/videoseries?list=PL8F14rO99by_JkM37mGinv9CrfOjnBvfB" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;" allowfullscreen></iframe>
                    </div>
                </div>
            `;

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

                // Dynamic Aspect-Ratio Card Node Generator
                const createCardNode = (cleanPath) => {
                    const isVideo = cleanPath.toLowerCase().endsWith('.mp4') || cleanPath.toLowerCase().endsWith('.webm');
                    
                    const card = document.createElement('div');
                    card.className = 'gallery-item-card';

                    if (isVideo) {
                        const video = document.createElement('video');
                        video.src = cleanPath;
                        video.autoplay = true;
                        video.loop = true;
                        video.muted = true; // Auto-plays completely muted
                        video.defaultMuted = true;
                        video.volume = 0;
                        video.playsInline = true;
                        video.preload = 'auto';
                        video.onerror = () => card.remove();
                        
                        // Click video to toggle mute/unmute audio on demand
                        video.onclick = (e) => {
                            e.stopPropagation();
                            video.muted = !video.muted;
                            video.volume = video.muted ? 0 : 1;
                        };

                        card.appendChild(video);
                    } else {
                        const img = document.createElement('img');
                        img.src = cleanPath;
                        img.alt = 'Galería Chai-itto';
                        img.onerror = () => card.remove();
                        img.onclick = () => openOfertaModal('Galería Chai-itto', 'Salud con Té', [cleanPath], 'Galería', 0);
                        card.appendChild(img);
                    }
                    return card;
                };

                // Render original list
                galleryItems.forEach(item => {
                    const cleanPath = typeof item === 'string' ? item : (item.src || item.image || item.url || item.file || '');
                    if (cleanPath) container.appendChild(createCardNode(cleanPath));
                });

                // Duplicate valid nodes once rendered for seamless infinite marquee loop
                setTimeout(() => {
                    const validCards = Array.from(container.children);
                    validCards.forEach(cardNode => {
                        container.appendChild(cardNode.cloneNode(true));
                    });
                }, 300);

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
            const mobileNav = document.getElementById('main-nav-menu');
            if (mobileNav) mobileNav.classList.remove('active');
            const container = document.getElementById('dynamic-content-area');
            const headerEl = document.querySelector('header');
            if (!container) return;

            if (headerEl) headerEl.classList.add('compact-header');

            if (pageName === 'contactanos') {
                container.classList.add('dark-section');
            } else {
                container.classList.remove('dark-section');
            }

            try {
                const response = await fetch(`sections/${pageName}.html`);
                if (!response.ok) throw new Error(`Could not load section: ${pageName}`);
                
                const html = await response.text();
                container.innerHTML = html;

                document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
                const activeBtn = document.querySelector(`.nav-btn[data-page="${pageName}"], .nav-btn[onclick*="${pageName}"]`);
                if (activeBtn) activeBtn.classList.add('active');

                if (pageName === 'productos') {
                    selectCollection('BIENESTAR');
                } else if (pageName === 'accesorios') {
                    loadAccesoriosGrid();
                } else if (pageName === 'ofertas') {
                    loadOfertasGrid();
                } else if (pageName === 'galeria') {
                    setTimeout(loadGalleryRibbon, 100);
                } else if (pageName === 'menu') {
                    updateMenuDisplay();
                }

                window.scrollTo({ top: 0, behavior: 'smooth' });

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
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Highlight active tab button
            document.querySelectorAll('.tab-btn').forEach(btn => {
                const btnNorm = normalizeStr(btn.textContent || btn.innerText || '');
                btn.classList.toggle('active', btnNorm === targetNorm);
            });

            // Update section title banner if present
            const titleEl = document.getElementById('current-collection-title');
            if (titleEl) {
                titleEl.textContent = colName;
            }

            loadCollection(colName);
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

            // 1-CLICK BUTTON: FRASCO (Soft Green Background, Green Border, Green Text)
            let frascoHtml = frascoPrice > 0 ? `
                <button onclick="addToCart('${safeName}', ${frascoPrice}, 'Frasco')" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 4px 10px rgba(74, 124, 54, 0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';" style="background: rgba(74, 124, 54, 0.08); border: 1px solid var(--matcha-deep); border-radius: 8px; padding: 12px 5px; flex: 1; text-align: center; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
                    <span style="font-size: 0.75em; font-weight: 800; color: var(--matcha-deep); letter-spacing: 1px;">FRASCO</span>
                    <span style="font-size: 1.15em; font-weight: 900; color: var(--text-dark); margin: 2px 0;">$${frascoPrice}</span>
                    <span style="font-size: 0.85em; color: var(--matcha-deep); font-weight: bold;"><i class="fa-solid fa-cart-plus"></i> Añadir</span>
                </button>` : '';
                
            // 1-CLICK BUTTON: SOBRE (Silver Background, but EXACTLY matches Frasco Border & Text)
            let sobreHtml = sobrePrice > 0 ? `
                <button onclick="addToCart('${safeName}', ${sobrePrice}, 'Sobre')" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 4px 10px rgba(74, 124, 54, 0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';" style="background: linear-gradient(145deg, #ffffff, #e5e7eb); border: 1px solid var(--matcha-deep); border-radius: 8px; padding: 12px 5px; flex: 1; text-align: center; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
                    <span style="font-size: 0.75em; font-weight: 800; color: var(--matcha-deep); letter-spacing: 1px;">SOBRE</span>
                    <span style="font-size: 1.15em; font-weight: 900; color: var(--text-dark); margin: 2px 0;">$${sobrePrice}</span>
                    <span style="font-size: 0.85em; color: var(--matcha-deep); font-weight: bold;"><i class="fa-solid fa-cart-plus"></i> Añadir</span>
                </button>` : '';

            // FALLBACK: If it's not shippable, just show the menu button
            let fallbackHtml = !isShippable ? `
                <button onclick="switchPage('menu')" style="width: 100%; padding: 12px; background: rgba(45, 90, 39, 0.9); color: #fff; border: 1px solid var(--gold-border); border-radius: 25px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 0.2s;">
                    <i class="fa-solid fa-book-open"></i> Ver en Menú
                </button>` : '';

            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Clean card body with smooth hover effect
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

        function handleProductSelect(name, frascoPrice, sobrePrice) {
            selectedProductName = name;
            selectedFrascoPrice = frascoPrice;
            selectedSobrePrice = sobrePrice;

            document.getElementById('checkout-product-title').textContent = name;
            document.getElementById('modal-frasco-price').textContent = `$${frascoPrice}`;
            document.getElementById('modal-sobre-price').textContent = `$${sobrePrice}`;

            selectPresentation('Frasco');
            const modal = document.getElementById('checkout-modal');
            if (modal) modal.classList.add('active');
        }

        function selectPresentation(type) {
            chosenPresentation = type;
            const frascoBox = document.getElementById('option-frasco-box');
            const sobreBox = document.getElementById('option-sobre-box');

            if (frascoBox && sobreBox) {
                if (type === 'Frasco') {
                    frascoBox.style.border = '2px solid var(--matcha-deep)';
                    frascoBox.style.background = 'var(--matcha-card)';
                    sobreBox.style.border = '1.5px solid rgba(74, 124, 54, 0.4)';
                    sobreBox.style.background = '#FFFFFF';
                } else {
                    sobreBox.style.border = '2px solid var(--matcha-deep)';
                    sobreBox.style.background = 'var(--matcha-card)';
                    frascoBox.style.border = '1.5px solid rgba(74, 124, 54, 0.4)';
                    frascoBox.style.background = '#FFFFFF';
                }
            }
        }

        function addSelectedProductToCart() {
            const price = chosenPresentation === 'Frasco' ? selectedFrascoPrice : selectedSobrePrice;
            addToCart(selectedProductName, price, chosenPresentation);
            closeCheckoutModal();
        }

        function closeCheckoutModal() {
            const modal = document.getElementById('checkout-modal');
            if (modal) modal.classList.remove('active');
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
                    const price = item.precio || item.precioOferta || 0;
                    const descText = item.descripcion || '';
                    const titleText = item.name ? `#${item.num}. ${item.name}` : `#${item.num}`;
                    const imageList = (item.images && item.images.length > 0) ? item.images : [item.image || 'logo.png'];
                    const coverImage = imageList[0];
                    const safeName = item.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');

                    const card = document.createElement('div');
                    card.className = 'product-card';
                    
                    // We removed the card.onclick here so the whole card isn't clickable

                    card.innerHTML = `
                        <div>
                            <!-- We moved the click action ONLY to the image box -->
                            <div class="product-img-box gallery-trigger" style="cursor: zoom-in;" title="Ver galería de fotos">
                                <img src="${coverImage}" alt="${item.name || 'Accesorio'}">
                            </div>
                            <h3 class="product-name">${titleText}</h3>
                            <p class="product-ingredients">${descText}</p>
                        </div>
                        <div style="display: flex; gap: 10px; justify-content: center; width: 100%; margin-top: auto;">
                            <!-- MATCHING SQUARE "AÑADIR" BUTTON -->
                            <button onclick="event.stopPropagation(); addToCart('${safeName}', ${price})" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 4px 10px rgba(74, 124, 54, 0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';" style="background: rgba(74, 124, 54, 0.08); border: 1px solid var(--matcha-deep); border-radius: 8px; padding: 12px 5px; flex: 1; text-align: center; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
                                <span style="font-size: 0.75em; font-weight: 800; color: var(--matcha-deep); letter-spacing: 1px;">COMPRAR</span>
                                <span style="font-size: 1.15em; font-weight: 900; color: var(--text-dark); margin: 2px 0;">$${price}</span>
                                <span style="font-size: 0.85em; color: var(--matcha-deep); font-weight: bold;"><i class="fa-solid fa-cart-plus"></i> Añadir</span>
                            </button>
                        </div>
                    `;
                    
                    // Wire up the image box to open the gallery safely
                    card.querySelector('.gallery-trigger').onclick = () => {
                        openOfertaModal(titleText, descText, imageList, item.name, price);
                    };

                    track.appendChild(card);
                });
            } catch (error) {
                console.error("Error loading accesorios.json:", error);
            }
        }

        /* --- OFERTAS RENDERER --- */
        async function loadOfertasGrid() {
            const track = document.getElementById('ofertas-dynamic-track');
            if (!track) return;

            try {
                const response = await fetch('ofertas.json?v=' + Date.now());
                if (!response.ok) throw new Error('Could not load ofertas.json');

                const ofertasList = await response.json();
                track.innerHTML = '';

                ofertasList.forEach(item => {
                    // Smart price detection: finds the final sale price and the original price
                    const finalPrice = item.precioOferta || item.precio || 0;
                    const oldPrice = (item.precioNormal || item.precio) > finalPrice ? (item.precioNormal || item.precio) : null;
                    
                    const descText = item.descripcion || '';
                    const titleText = item.name ? `#${item.num}. ${item.name}` : `#${item.num}`;
                    const imageList = (item.images && item.images.length > 0) ? item.images : [item.image || 'logo.png'];
                    const coverImage = imageList[0];
                    const safeName = item.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');

                    const card = document.createElement('div');
                    card.className = 'product-card';
                    
                    // Create the smart price display for the button
                    let priceHTML = `<span style="font-size: 1.15em; font-weight: 900; color: var(--text-dark); margin: 2px 0;">$${finalPrice}</span>`;
                    
                    // If there is a discount, show the strikethrough price!
                    if (oldPrice) {
                        priceHTML = `
                            <span style="font-size: 0.75em; text-decoration: line-through; color: #889C8B; margin-bottom: -4px;">$${oldPrice}</span>
                            <span style="font-size: 1.15em; font-weight: 900; color: #D32F2F; margin: 2px 0;">$${finalPrice}</span>
                        `;
                    }

                    card.innerHTML = `
                        <div style="position: relative;">
                            <!-- THE SURPRISE: FLOATING 'OFERTA' BADGE -->
                            <div style="position: absolute; top: 10px; left: 10px; background: #D32F2F; color: white; padding: 4px 10px; border-radius: 20px; font-weight: 900; font-size: 0.7em; letter-spacing: 1px; z-index: 2; box-shadow: 0 4px 10px rgba(211, 47, 47, 0.3);">
                                <i class="fa-solid fa-fire"></i> OFERTA
                            </div>
                            
                            <div class="product-img-box gallery-trigger" style="cursor: zoom-in;" title="Ver galería de fotos">
                                <img src="${coverImage}" alt="${item.name || 'Oferta'}">
                            </div>
                            <h3 class="product-name">${titleText}</h3>
                            <p class="product-ingredients">${descText}</p>
                        </div>
                        <div style="display: flex; gap: 10px; justify-content: center; width: 100%; margin-top: auto;">
                            <!-- MATCHING SQUARE "AÑADIR" BUTTON -->
                            <button onclick="event.stopPropagation(); addToCart('${safeName}', ${finalPrice})" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 4px 10px rgba(74, 124, 54, 0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';" style="background: rgba(74, 124, 54, 0.08); border: 1px solid var(--matcha-deep); border-radius: 8px; padding: 10px 5px; flex: 1; text-align: center; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;">
                                <span style="font-size: 0.7em; font-weight: 800; color: var(--matcha-deep); letter-spacing: 1px;">COMPRAR</span>
                                ${priceHTML}
                                <span style="font-size: 0.85em; color: var(--matcha-deep); font-weight: bold;"><i class="fa-solid fa-cart-plus"></i> Añadir</span>
                            </button>
                        </div>
                    `;
                    
                    // Wire up the image box to open the gallery safely
                    card.querySelector('.gallery-trigger').onclick = () => {
                        openOfertaModal(titleText, descText, imageList, item.name, finalPrice);
                    };

                    track.appendChild(card);
                });
            } catch (error) {
                console.error("Error loading ofertas.json:", error);
            }
        }

        function updateModalImageDisplay() {
            const imgEl = document.getElementById('modal-img');
            const counterEl = document.getElementById('modal-counter');
            const prevBtn = document.getElementById('modal-prev-btn');
            const nextBtn = document.getElementById('modal-next-btn');

            imgEl.src = currentModalImages[currentModalIndex];

            if (currentModalImages.length > 1) {
                counterEl.textContent = `Imagen ${currentModalIndex + 1} de ${currentModalImages.length}`;
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            } else {
                counterEl.textContent = '';
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            }
        }

        function changeModalImage(direction) {
            currentModalIndex += direction;
            if (currentModalIndex < 0) currentModalIndex = currentModalImages.length - 1;
            if (currentModalIndex >= currentModalImages.length) currentModalIndex = 0;
            updateModalImageDisplay();
        }

        function closeOfertaModal() {
            const modal = document.getElementById('oferta-modal');
            if (modal) modal.classList.remove('active');
        }

        function closeOfertaModalOnBackdrop(event) {
            if (event.target.id === 'oferta-modal') closeOfertaModal();
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

// --- JUMP TO SPECIFIC MENU PAGE ---
function jumpToMenuCollection(pageNum) {
  // 1. Open the Menu section
  switchPage('menu');
  
  // 2. Wait a split second for the page to load, then flip to the right image
  setTimeout(() => {
    // Tell the flipbook's "brain" which page we are on now
    currentMenuPage = pageNum;
    
    // Change the image to the correct page
    const menuImg = document.getElementById('menu-current-image');
    if (menuImg) {
      menuImg.src = 'menu/page-' + pageNum + '.webp';
    }
    
    // Update the "1 / 14" text counter at the bottom
    const indicator = document.getElementById('menu-page-indicator');
    if (indicator) {
      indicator.innerText = pageNum + ' / 14';
    }
    
    // Scroll smoothly to the top of the menu so they can see the image
    window.scrollTo({ top: 0, behavior: "smooth" });
    
  }, 150);
}
