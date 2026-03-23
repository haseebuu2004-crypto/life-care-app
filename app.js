import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    /* =========================================
       NAVIGATION & UI LOGIC
    ========================================= */
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const menuItems = document.querySelectorAll('.menu-items li');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('page-title');

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }

    menuBtn.addEventListener('click', openSidebar);
    overlay.addEventListener('click', closeSidebar);

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            pageTitle.textContent = item.textContent;

            const targetView = item.getAttribute('data-view');
            views.forEach(view => {
                if (view.id === targetView) {
                    view.classList.remove('hidden');
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                    view.classList.add('hidden');
                }
            });
            closeSidebar();
        });
    });

    /* =========================================
       FIREBASE AUTHENTICATION & CLOUD SYNC
    ========================================= */

    // REPLACE WITH YOUR ACTUAL FIREBASE CONFIGURATION
    const firebaseConfig = {
        apiKey: "AIzaSyDCLqeoE9POePxG64fudEEpyw1LSsvtPAM",
        authDomain: "lifecare-app-1c0dc.firebaseapp.com",
        projectId: "lifecare-app-1c0dc",
        storageBucket: "lifecare-app-1c0dc.firebasestorage.app",
        messagingSenderId: "876218322438",
        appId: "1:876218322438:android:5fa78296755d573f5a3d87"
    };

    const fbApp = initializeApp(firebaseConfig);
    const auth = getAuth(fbApp);
    const db = getFirestore(fbApp);

    // Enable offline persistence
    enableIndexedDbPersistence(db).catch((err) => {
        console.warn("Firestore Offline Persistence not enabled:", err.message);
    });

    let currentUserUID = null;
    let isCloudSyncing = false;
    let firestoreUnsubscribe = null;

    const loginScreen = document.getElementById('login-screen');
    const btnGoogleLogin = document.getElementById('btn-google-login');
    const loginLoading = document.getElementById('login-loading');

    const DB = {
        get: (key) => {
            if (!currentUserUID) return [];
            return JSON.parse(localStorage.getItem(`lifecare_${currentUserUID}_${key}`)) || [];
        },
        set: (key, data) => {
            if (!currentUserUID) return;
            localStorage.setItem(`lifecare_${currentUserUID}_${key}`, JSON.stringify(data));
            syncToCloud();
        },
    };

    let syncTimeout = null;

    async function syncToCloud() {
        if (!currentUserUID) return;
        
        // Debounce to batch rapid consecutive saves into one write
        if (syncTimeout) clearTimeout(syncTimeout);
        syncTimeout = setTimeout(async () => {
            try {
                const dataToSync = {
                    base_products: DB.get('base_products'),
                    product_flavors: DB.get('product_flavors'),
                    sales: DB.get('sales'),
                    attendance: DB.get('attendance'),
                    timestamp: Date.now()
                };
                const docRef = doc(db, "users", currentUserUID);
                await setDoc(docRef, { data: dataToSync }, { merge: true });
            } catch (e) {
                console.error("Error syncing to cloud:", e);
            }
        }, 1500);
    }

    function listenToCloud() {
        if (firestoreUnsubscribe) firestoreUnsubscribe();
        const docRef = doc(db, "users", currentUserUID);
        
        // includeMetadataChanges lets us detect if a snapshot is from OUR OWN
        // pending write (hasPendingWrites=true) vs from another device (false)
        firestoreUnsubscribe = onSnapshot(docRef, { includeMetadataChanges: true }, (docSnap) => {
            // Skip snapshots caused by our own local writes — these are write echoes
            if (docSnap.metadata.hasPendingWrites) return;

            if (docSnap.exists() && docSnap.data() && docSnap.data().data) {
                const cloudData = docSnap.data().data;
                // Always apply server-confirmed cloud data to local storage
                if (cloudData.base_products !== undefined) localStorage.setItem(`lifecare_${currentUserUID}_base_products`, JSON.stringify(cloudData.base_products));
                if (cloudData.product_flavors !== undefined) localStorage.setItem(`lifecare_${currentUserUID}_product_flavors`, JSON.stringify(cloudData.product_flavors));
                if (cloudData.sales !== undefined) localStorage.setItem(`lifecare_${currentUserUID}_sales`, JSON.stringify(cloudData.sales));
                if (cloudData.attendance !== undefined) localStorage.setItem(`lifecare_${currentUserUID}_attendance`, JSON.stringify(cloudData.attendance));
                refreshApp();
            }
        });
    }

    async function migrateLegacyDataOnce() {
        if (localStorage.getItem(`lifecare_${currentUserUID}_migrated`)) return;

        let requiresMigration = false;
        
        // Check for old non-auth localStorage data 
        if (localStorage.getItem('base_products') && !localStorage.getItem(`lifecare_${currentUserUID}_base_products`)) {
            DB.set('base_products', JSON.parse(localStorage.getItem('base_products')||"[]"));
            DB.set('product_flavors', JSON.parse(localStorage.getItem('product_flavors')||"[]"));
            DB.set('sales', JSON.parse(localStorage.getItem('sales')||"[]"));
            DB.set('attendance', JSON.parse(localStorage.getItem('attendance')||"[]"));
            requiresMigration = true;
        }

        // Migrate older simple 'products' arrays 
        let legacyProducts = JSON.parse(localStorage.getItem('products') || "[]");
        if (legacyProducts.length > 0) {
            let bases = DB.get('base_products');
            let flavors = DB.get('product_flavors');
            legacyProducts.forEach(lp => {
                const pName = lp.name.trim();
                let bProd = bases.find(b => b.name.toLowerCase() === pName.toLowerCase());
                if (!bProd) { bProd = { id: generateId(), name: pName, totalQty: 0 }; bases.push(bProd); }
                const flavName = (lp.flavor || '').trim() || "";
                let fProd = flavors.find(f => f.productId === bProd.id && f.flavor.toLowerCase() === flavName.toLowerCase());
                if (!fProd) { fProd = { id: lp.id, productId: bProd.id, flavor: flavName, vp: lp.vp, sp: lp.sp, qty: lp.qty }; flavors.push(fProd); }
                else { fProd.qty += lp.qty; }
                bProd.totalQty += lp.qty;
            });
            DB.set('base_products', bases);
            DB.set('product_flavors', flavors);
            localStorage.removeItem('products');
            requiresMigration = true;
        }
        
        // Migrate from basic local email login if present
        if (auth.currentUser && auth.currentUser.email) {
            let oldEmail = auth.currentUser.email;
            if (localStorage.getItem(`lifecare_${oldEmail}_base_products`) && !localStorage.getItem(`lifecare_${currentUserUID}_base_products`)) {
                 DB.set('base_products', JSON.parse(localStorage.getItem(`lifecare_${oldEmail}_base_products`)||"[]"));
                 DB.set('product_flavors', JSON.parse(localStorage.getItem(`lifecare_${oldEmail}_product_flavors`)||"[]"));
                 DB.set('sales', JSON.parse(localStorage.getItem(`lifecare_${oldEmail}_sales`)||"[]"));
                 DB.set('attendance', JSON.parse(localStorage.getItem(`lifecare_${oldEmail}_attendance`)||"[]"));
                 requiresMigration = true;
            }
        }

        if (requiresMigration) {
            syncToCloud();
        }

        localStorage.setItem(`lifecare_${currentUserUID}_migrated`, "true");
    }

    function initSession(uid) {
        currentUserUID = uid;
        loginScreen.style.display = 'none';
        document.getElementById('auth-splash').style.display = 'none';
        
        // Listen to cloud — the onSnapshot fires immediately with current server data
        listenToCloud();
        // Render whatever local data we have (cloud will update it momentarily)
        refreshApp();
    }

    // Google Sign-In Event Popup
    btnGoogleLogin.addEventListener('click', () => {
        btnGoogleLogin.style.display = 'none';
        loginLoading.style.display = 'block';
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        signInWithPopup(auth, provider).catch((error) => {
            console.error("Login Popup Error:", error);
            const errDiv = document.getElementById('login-error');
            errDiv.textContent = "Sign-in failed: " + (error.message || "Please try again.");
            errDiv.style.display = 'block';
            btnGoogleLogin.style.display = 'flex';
            loginLoading.style.display = 'none';
        });
    });

    // Handle Auth Observer — fires once on page load to resolve auth state
    const authSplash = document.getElementById('auth-splash');
    onAuthStateChanged(auth, (user) => {
        if (user) {
            initSession(user.uid);
        } else {
            // Not logged in — hide splash and show login screen
            authSplash.style.display = 'none';
            loginScreen.style.display = 'flex';
            btnGoogleLogin.style.display = 'flex';
            loginLoading.style.display = 'none';
        }
    });

    // Handle Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        if (firestoreUnsubscribe) firestoreUnsubscribe();
        currentUserUID = null;
        signOut(auth).then(() => {
            loginScreen.style.display = 'flex';
            btnGoogleLogin.style.display = 'flex';
            loginLoading.style.display = 'none';
            closeSidebar();
        }).catch(err => {
            console.error("Sign-out error", err);
        });
    });

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /* =========================================
       MODAL MANAGEMENT
    ========================================= */
    const modalOverlayObj = document.getElementById('modal-overlay');
    const btnCloseModals = document.querySelectorAll('.close-modal');
    let currentModal = null;

    function openModal(modalId) {
        currentModal = document.getElementById(modalId);
        currentModal.classList.add('show');
        currentModal.classList.remove('hidden');
        modalOverlayObj.classList.add('show');
    }

    function closeModal() {
        if (currentModal) {
            currentModal.classList.remove('show');
            setTimeout(() => currentModal.classList.add('hidden'), 200);
            currentModal = null;
        }
        modalOverlayObj.classList.remove('show');
    }

    btnCloseModals.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    }));
    modalOverlayObj.addEventListener('click', closeModal);

    document.getElementById('btn-quick-add-sale').addEventListener('click', () => openSaleModal());
    document.getElementById('btn-add-sale').addEventListener('click', () => openSaleModal());

    document.getElementById('btn-quick-add-stock').addEventListener('click', () => openModal('modal-add-product'));
    document.getElementById('btn-add-product').addEventListener('click', () => openModal('modal-add-product'));

    document.getElementById('btn-add-attendance').addEventListener('click', () => {
        document.getElementById('inp-att-date').valueAsDate = new Date();
        openModal('modal-add-attendance');
    });

    const fabMain = document.getElementById('fab-main');
    const fabMenu = document.getElementById('fab-menu');

    fabMain.addEventListener('click', () => {
        fabMenu.classList.toggle('show');
        fabMain.style.transform = fabMenu.classList.contains('show') ? 'rotate(45deg)' : 'rotate(0deg)';
    });

    document.querySelectorAll('.fab-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            fabMenu.classList.remove('show');
            fabMain.style.transform = 'rotate(0deg)';
            const action = e.target.getAttribute('data-action');
            if (action === 'sale') openSaleModal();
            else if (action === 'product') openModal('modal-add-product');
            else if (action === 'attendance') {
                document.getElementById('inp-att-date').valueAsDate = new Date();
                openModal('modal-add-attendance');
            }
        });
    });

    /* =========================================
       APP LOGIC & DOM RENDER
    ========================================= */

    function renderDashboard() {
        const flavors = DB.get('product_flavors');
        const sales = DB.get('sales');
        const atts = DB.get('attendance');

        let totalProfit = 0;
        let totalVPSold = 0;
        let stockValue = 0;
        let stockVP = 0;
        let lowStockCount = 0;
        let shakeProfitTotal = 0;
        const productSalesMap = {};
        const excludeNames = ['shareef', 'naseera', 'haseeb'];

        flavors.forEach(f => {
            stockVP += (f.vp * f.qty);
            stockValue += (f.sp * f.qty);
            if (f.qty < 5) lowStockCount++;
        });

        sales.forEach(s => {
            if (s.profit !== undefined) totalProfit += s.profit;
            if (!productSalesMap[s.productId]) productSalesMap[s.productId] = 0;
            productSalesMap[s.productId] += s.qty;
            if (s.vp !== undefined) totalVPSold += s.vp;
        });

        atts.forEach(a => {
            if (a.status.includes('Present')) {
                const normalized = (a.name || '').trim().toLowerCase();
                if (!excludeNames.includes(normalized)) {
                    shakeProfitTotal += 50;
                }
            }
        });

        let topProdId = null;
        let maxSold = 0;
        for (const tId in productSalesMap) {
            if (productSalesMap[tId] > maxSold) {
                maxSold = productSalesMap[tId];
                topProdId = tId;
            }
        }

        const bases = DB.get('base_products');
        const topBase = bases.find(b => b.id === topProdId);
        const topProdName = topBase ? `${topBase.name} (${maxSold} sold)` : "None";

        const container = document.getElementById('dashboard-cards-container');
        container.innerHTML = `
          <div class="card">
            <div class="card-title">Total Profit</div>
            <div class="card-value" style="color: var(--primary-color)">₹${totalProfit.toFixed(2)}</div>
          </div>
          <div class="card">
            <div class="card-title">Shake Profit</div>
            <div class="card-value" style="color: var(--primary-color)">₹${shakeProfitTotal}</div>
          </div>
          <div class="card">
            <div class="card-title">Total V.P Sold</div>
            <div class="card-value">${totalVPSold.toFixed(2)}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Stock Price</div>
            <div class="card-value">₹${stockValue.toFixed(2)}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Stock V.P</div>
            <div class="card-value">${stockVP.toFixed(2)}</div>
          </div>
        `;

        const reportsContainer = document.getElementById('dashboard-reports-container');
        if (reportsContainer) {
            const currentMonthIdx = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyProdMap = {};

            sales.forEach(s => {
                const dDate = new Date(s.date);
                if (dDate.getMonth() === currentMonthIdx && dDate.getFullYear() === currentYear) {
                    const pName = s.saleProdName || "Unknown";
                    if (!monthlyProdMap[pName]) monthlyProdMap[pName] = { total: 0, flavors: {} };

                    if (s.reductions && s.reductions.length > 0) {
                        s.reductions.forEach(r => {
                            const f = flavors.find(fl => fl.id === r.id);
                            const fname = f ? (f.flavor || "Base") : "Unknown";
                            monthlyProdMap[pName].total += r.qty;
                            if (!monthlyProdMap[pName].flavors[fname]) monthlyProdMap[pName].flavors[fname] = 0;
                            monthlyProdMap[pName].flavors[fname] += r.qty;
                        });
                    } else {
                        monthlyProdMap[pName].total += s.qty;
                        const fname = (s.saleFlavorName && s.saleFlavorName !== "Any Flavour") ? s.saleFlavorName : "Base";
                        if (!monthlyProdMap[pName].flavors[fname]) monthlyProdMap[pName].flavors[fname] = 0;
                        monthlyProdMap[pName].flavors[fname] += s.qty;
                    }
                }
            });

            const sortedProds = Object.keys(monthlyProdMap).sort((a, b) => monthlyProdMap[b].total - monthlyProdMap[a].total);

            let productSummaryHTML = '<div class="reports-section" style="margin-top: 20px;"><h3>Monthly Product Sales</h3><div class="monthly-sales-list" style="margin-top: 15px;">';
            if (sortedProds.length === 0) {
                productSummaryHTML += '<div class="report-box" style="text-align:center; color:#777;">No sales recorded this month.</div>';
            } else {
                sortedProds.forEach((pName, index) => {
                    const pData = monthlyProdMap[pName];
                    const isTop = index === 0;
                    const topStyles = isTop ? 'border-left: 4px solid var(--primary-color); background-color: rgba(46, 204, 113, 0.05);' : 'border: 1px solid #eee; background-color: #fff;';
                    const badge = isTop ? '<span style="font-size:11px; background:var(--primary-color); color:#fff; padding:3px 8px; border-radius:12px; margin-left:8px; vertical-align:middle;">Top Seller</span>' : '';

                    let flavListHTML = `<ul class="flavor-breakdown" style="display:none; list-style-type:none; padding: 10px 0 0 24px; margin: 0; font-size:14px; color:#555; border-top: 1px solid #eee; margin-top: 10px;">`;

                    const sortedFlavs = Object.keys(pData.flavors).sort((a, b) => pData.flavors[b] - pData.flavors[a]);
                    sortedFlavs.forEach(fName => {
                        flavListHTML += `<li style="padding: 5px 0;">↳ ${fName} <strong style="float:right; color:#333;">${pData.flavors[fName]}</strong></li>`;
                    });
                    flavListHTML += '</ul>';

                    productSummaryHTML += `
                      <div class="monthly-prod-card" style="padding:14px; margin-bottom:10px; border-radius:8px; cursor:pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: 0.2s; ${topStyles}" onclick="const ul = this.querySelector('ul'); ul.style.display = ul.style.display === 'none' ? 'block' : 'none'; const icon = this.querySelector('.exp-icon'); icon.textContent = ul.style.display === 'none' ? '▶' : '▼';">
                          <div style="display:flex; justify-content:space-between; align-items:center;">
                             <div style="display:flex; align-items:center;">
                               <strong style="font-size:15px; color:#222;"><span class="exp-icon" style="color:#888; margin-right:8px; font-size:12px;">▶</span>${pName}</strong>
                               ${badge}
                             </div>
                             <strong style="font-size:16px; color:var(--primary-color);">${pData.total}</strong>
                          </div>
                          ${flavListHTML}
                      </div>
                    `;
                });
            }
            productSummaryHTML += '</div></div>';

            reportsContainer.innerHTML = `
                <div class="reports-section">
                    <h3>Quick Reports</h3>
                    <div class="report-box">
                        <strong>Top Selling Product:</strong> 
                        <span style="color: var(--primary-color); font-weight: 500;">${topProdName}</span>
                    </div>
                    <div class="report-box">
                        <strong>Items Low in Stock (< 5 qty):</strong> 
                        <span style="color: ${lowStockCount > 0 ? 'var(--alert-color)' : 'inherit'}; font-weight: 500;">
                            ${lowStockCount} flavour variation(s)
                        </span>
                    </div>
                </div>
                ${productSummaryHTML}
            `;
        }
    }

    function renderStock(searchQuery = "") {
        const bases = DB.get('base_products');
        const flavors = DB.get('product_flavors');
        const tbody = document.getElementById('stock-table-body');
        tbody.innerHTML = '';

        let totalVPSum = 0;
        let totalValSum = 0;

        const grouped = {};
        flavors.forEach(f => {
            if (!grouped[f.productId]) grouped[f.productId] = [];
            grouped[f.productId].push(f);
        });

        bases.forEach(base => {
            const subItems = grouped[base.id] || [];
            if (subItems.length === 0 && base.totalQty === 0) return; // ignore completely blank migrated roots

            const matchBase = base.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchSubItems = subItems.filter(f => (f.flavor || '').toLowerCase().includes(searchQuery.toLowerCase()));

            if (!matchBase && matchSubItems.length === 0) return;

            const itemsToRender = matchBase ? subItems : matchSubItems;

            let parentVP = 0;
            let parentVal = 0;
            let displayQty = 0;
            itemsToRender.forEach(i => {
                displayQty += i.qty;
                const vpCost = i.qty * i.vp;
                const valCost = i.qty * i.sp;
                parentVP += vpCost;
                parentVal += valCost;
                totalVPSum += vpCost;
                totalValSum += valCost;
            });

            const pr = document.createElement('tr');
            pr.classList.add('stock-group-header');
            pr.style.cursor = "pointer";
            // default collapsed style unless searching
            const iconStr = searchQuery ? "▼" : "▶";

            pr.innerHTML = `
                <td style="font-weight:bold;">${iconStr} ${base.name}</td>
                <td class="text-right"><strong>${displayQty}</strong></td>
                <td class="text-right">-</td>
                <td class="text-right"><strong>${parentVP.toFixed(2)}</strong></td>
                <td class="text-right">-</td>
                <td class="text-right"><strong>₹${parentVal.toFixed(2)}</strong></td>
                <td style="text-align: center;">
                    <button class="icon-btn delete-btn" data-type="base" data-id="${base.id}" style="color: var(--alert-color); font-size: 16px; margin: 0; padding: 4px; width: 32px;" title="Delete All">🗑</button>
                </td>
            `;
            tbody.appendChild(pr);

            itemsToRender.forEach(f => {
                const tr = document.createElement('tr');
                tr.classList.add('stock-group-item');
                tr.setAttribute('data-parent', base.id);
                if (f.qty < 5) tr.style.backgroundColor = "rgba(231, 76, 60, 0.1)";
                if (!searchQuery) tr.style.display = 'none';

                const flavDisplay = f.flavor ? f.flavor : "Base";
                tr.innerHTML = `
                    <td style="padding-left: 28px;">↳ ${flavDisplay}</td>
                    <td class="text-right">
                        <input type="number" value="${f.qty}" class="qty-edit" data-id="${f.id}" data-base="${base.id}" style="width:70px; padding:4px; font-size:14px; text-align:right;">
                    </td>
                    <td class="text-right">${Number(f.vp).toFixed(2)}</td>
                    <td class="text-right">${(f.vp * f.qty).toFixed(2)}</td>
                    <td class="text-right">₹${Number(f.sp).toFixed(2)}</td>
                    <td class="text-right">₹${(f.sp * f.qty).toFixed(2)}</td>
                    <td style="text-align: center;">
                        <button class="icon-btn delete-btn" data-type="flavor" data-id="${f.id}" data-base="${base.id}" style="color: var(--alert-color); font-size: 16px; margin: 0; padding: 4px; width: 32px;" title="Delete Flavour">🗑</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            pr.addEventListener('click', (e) => {
                if (e.target.closest('.delete-btn') || e.target.tagName === 'INPUT') return;
                const td = pr.querySelector('td');
                const isCollapsed = td.innerHTML.includes('▶');
                td.innerHTML = isCollapsed ? `▼ ${base.name}` : `▶ ${base.name}`;
                document.querySelectorAll(`.stock-group-item[data-parent="${base.id}"]`).forEach(node => {
                    node.style.display = isCollapsed ? 'table-row' : 'none';
                });
            });
        });

        const vpEl = document.getElementById('total-vp-summary');
        const valEl = document.getElementById('total-val-summary');
        if (vpEl) vpEl.textContent = totalVPSum.toFixed(2);
        if (valEl) valEl.textContent = `₹${totalValSum.toFixed(2)}`;

        document.querySelectorAll('.qty-edit').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const fId = e.target.getAttribute('data-id');
                const bId = e.target.getAttribute('data-base');
                const newQty = parseInt(e.target.value) || 0;
                updateProductQty(fId, bId, newQty, true);
            });
        });
    }

    function updateProductQty(fId, bId, newQty, preserveFocus = false) {
        const flavors = DB.get('product_flavors');
        const bases = DB.get('base_products');

        const fIdx = flavors.findIndex(f => f.id === fId);
        const bIdx = bases.findIndex(b => b.id === bId);

        if (fIdx > -1 && bIdx > -1) {
            if (newQty < 0) newQty = 0;
            const diff = newQty - flavors[fIdx].qty;
            flavors[fIdx].qty = newQty;
            bases[bIdx].totalQty += diff;

            DB.set('product_flavors', flavors);
            DB.set('base_products', bases);

            refreshApp();
            if (preserveFocus) {
                setTimeout(() => {
                    const el = document.querySelector(`.qty-edit[data-id="${fId}"]`);
                    if (el) {
                        el.focus();
                        const val = el.value;
                        el.value = '';
                        el.value = val;
                    }
                }, 0);
            }
        }
    }

    function requiresFlavor(productName) {
        if (!productName) return false;
        const pName = productName.trim().toLowerCase();
        const bases = DB.get('base_products');
        const flavors = DB.get('product_flavors');
        const b = bases.find(base => base.name.toLowerCase() === pName);
        if (!b) return false;
        const specificFlavors = flavors.filter(f => f.productId === b.id && f.flavor && f.flavor.toLowerCase() !== "base");
        return specificFlavors.length > 0;
    }

    const inpProdName = document.getElementById('inp-prod-name');
    const inpProdFlavor = document.getElementById('inp-prod-flavor');
    const errProdFlavor = document.getElementById('err-prod-flavor');
    const lblProdFlavor = document.getElementById('lbl-prod-flavor');

    function checkStockFlavorReq() {
        const val = inpProdName.value;
        if (requiresFlavor(val)) {
            lblProdFlavor.innerHTML = 'Flavour <span style="color:var(--alert-color);">*</span>';
            if (!inpProdFlavor.value.trim()) {
                inpProdFlavor.style.borderColor = 'var(--alert-color)';
                errProdFlavor.style.display = 'block';
                return false;
            } else {
                inpProdFlavor.style.borderColor = '#ddd';
                errProdFlavor.style.display = 'none';
                return true;
            }
        } else {
            lblProdFlavor.textContent = 'Flavour (Optional)';
            inpProdFlavor.style.borderColor = '#ddd';
            errProdFlavor.style.display = 'none';
            return true;
        }
    }

    inpProdName.addEventListener('input', checkStockFlavorReq);
    inpProdFlavor.addEventListener('input', checkStockFlavorReq);

    // Add Product Handle
    document.getElementById('form-add-product').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!checkStockFlavorReq()) return;

        const bases = DB.get('base_products');
        const flavors = DB.get('product_flavors');

        const name = inpProdName.value.trim();
        const flavor = inpProdFlavor.value.trim();
        const vp = parseFloat(document.getElementById('inp-prod-vp').value);
        const sp = parseFloat(document.getElementById('inp-prod-sp').value);
        const qty = parseInt(document.getElementById('inp-prod-qty').value);

        let base = bases.find(b => b.name.toLowerCase() === name.toLowerCase());
        if (!base) {
            base = { id: generateId(), name: name, totalQty: 0 };
            bases.push(base);
        }

        let flav = flavors.find(f => f.productId === base.id && f.flavor.toLowerCase() === flavor.toLowerCase());
        if (flav) {
            flav.qty += qty;
            flav.vp = vp;
            flav.sp = sp;
        } else {
            flavors.unshift({
                id: generateId(),
                productId: base.id,
                flavor: flavor,
                vp: vp,
                sp: sp,
                qty: qty
            });
        }

        base.totalQty += qty;

        DB.set('base_products', bases);
        DB.set('product_flavors', flavors);
        e.target.reset();
        closeModal();
        refreshApp();
    });

    // Add Sale Modal population
    function openSaleModal() {
        const bases = DB.get('base_products');
        const flavors = DB.get('product_flavors');

        const prodList = document.getElementById('sale-prod-list');
        const flavorList = document.getElementById('sale-flavor-list');
        prodList.innerHTML = '';
        flavorList.innerHTML = '';

        bases.forEach(b => prodList.innerHTML += `<option value="${b.name}">`);
        const uniqueFlavors = [...new Set(flavors.map(f => f.flavor).filter(x => x))];
        uniqueFlavors.forEach(f => flavorList.innerHTML += `<option value="${f}">`);

        document.getElementById('inp-sale-date').valueAsDate = new Date();
        document.getElementById('sale-preview').classList.add('hidden');
        openModal('modal-add-sale');
    }

    function renderSales(searchQuery = "") {
        const sales = DB.get('sales');
        const tbody = document.getElementById('sales-table-body');
        tbody.innerHTML = '';
        sales.sort((a, b) => new Date(b.date) - new Date(a.date));

        const filtered = sales.filter(s => {
            const prodName = s.saleFlavorName && s.saleFlavorName !== "Base" && s.saleFlavorName !== "Various" ? `${s.saleProdName} (${s.saleFlavorName})` : s.saleProdName;
            const searchStr = `${s.customer} ${prodName}`.toLowerCase();
            return searchStr.includes(searchQuery.toLowerCase());
        });

        filtered.forEach(s => {
            const prodName = s.saleFlavorName && s.saleFlavorName !== "Base" && s.saleFlavorName !== "Various" ? `${s.saleProdName} (${s.saleFlavorName})` : s.saleProdName;
            const saleProfit = s.profit !== undefined ? s.profit : 0;
            const profitColor = saleProfit >= 0 ? 'var(--primary-color)' : 'var(--alert-color)';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${s.date}</td>
                <td>${s.customer}</td>
                <td>${prodName}</td>
                <td class="text-right">${s.qty}</td>
                <td class="text-right">₹${s.totalAmount.toFixed(2)}</td>
                <td class="text-right" style="color: ${profitColor}; font-weight: 500;">${saleProfit >= 0 ? '+' : ''}₹${saleProfit.toFixed(2)}</td>
                <td style="text-align: center;">
                    <button class="icon-btn delete-btn" data-type="sale" data-id="${s.id}" style="color: var(--alert-color); font-size: 16px; margin: 0; padding: 4px; width: 32px;" title="Delete Sale">🗑</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    const inpSaleProd = document.getElementById('inp-sale-prod');
    const inpSaleFlavor = document.getElementById('inp-sale-flavor');
    const errSaleFlavor = document.getElementById('err-sale-flavor');
    const lblSaleFlavor = document.getElementById('lbl-sale-flavor');

    function checkSaleFlavorReq() {
        const val = inpSaleProd.value;
        if (requiresFlavor(val)) {
            lblSaleFlavor.innerHTML = 'Flavour <span style="color:var(--alert-color);">*</span>';
            if (!inpSaleFlavor.value.trim()) {
                inpSaleFlavor.style.borderColor = 'var(--alert-color)';
                errSaleFlavor.style.display = 'block';
                return false;
            } else {
                inpSaleFlavor.style.borderColor = '#ddd';
                errSaleFlavor.style.display = 'none';
                return true;
            }
        } else {
            lblSaleFlavor.textContent = 'Flavour (Optional)';
            inpSaleFlavor.style.borderColor = '#ddd';
            errSaleFlavor.style.display = 'none';
            return true;
        }
    }

    inpSaleProd.addEventListener('input', checkSaleFlavorReq);
    inpSaleFlavor.addEventListener('input', checkSaleFlavorReq);

    // Add Sale Form Submit
    document.getElementById('form-add-sale').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!checkSaleFlavorReq()) return;

        const qty = parseInt(document.getElementById('inp-sale-qty').value);
        const prodSearch = inpSaleProd.value.trim().toLowerCase();
        const flavorSearch = inpSaleFlavor.value.trim().toLowerCase();
        const salePrice = parseFloat(document.getElementById('inp-sale-price').value);

        if (!prodSearch && !flavorSearch) return alert("Enter Product or Flavour!");

        const bases = DB.get('base_products');
        const flavors = DB.get('product_flavors');

        let matchingFlavs = [];
        if (prodSearch && flavorSearch) {
            const b = bases.find(x => x.name.toLowerCase() === prodSearch);
            if (b) matchingFlavs = flavors.filter(f => f.productId === b.id && f.flavor.toLowerCase() === flavorSearch);
        } else if (!prodSearch && flavorSearch) {
            matchingFlavs = flavors.filter(f => f.flavor.toLowerCase() === flavorSearch);
        } else if (prodSearch && !flavorSearch) {
            const b = bases.find(x => x.name.toLowerCase() === prodSearch);
            if (b) matchingFlavs = flavors.filter(f => f.productId === b.id);
        }

        if (matchingFlavs.length === 0) return alert("Product/Flavour not found in Stock!");
        const totalAvail = matchingFlavs.reduce((sum, f) => sum + f.qty, 0);
        if (totalAvail < qty) return alert(`Error: Insufficient stock! Only ${totalAvail} available.`);

        const baseObj = bases.find(b => b.id === matchingFlavs[0].productId);
        let finalName = baseObj ? baseObj.name : "Unknown";
        let finalFlavor = flavorSearch ? matchingFlavs[0].flavor : (matchingFlavs.length === 1 ? matchingFlavs[0].flavor : "Various");

        let qtyToReduce = qty;
        let totalCost = 0;
        let totalVp = 0;
        let reductions = [];

        for (let i = 0; i < matchingFlavs.length; i++) {
            if (qtyToReduce <= 0) break;
            const item = matchingFlavs[i];
            const reduceAmt = Math.min(item.qty, qtyToReduce);

            const fIdx = flavors.findIndex(f => f.id === item.id);
            flavors[fIdx].qty -= reduceAmt;
            const bIdx = bases.findIndex(b => b.id === item.productId);
            bases[bIdx].totalQty -= reduceAmt;

            totalCost += (reduceAmt * item.sp);
            totalVp += (reduceAmt * item.vp);
            qtyToReduce -= reduceAmt;
            reductions.push({ id: item.id, baseId: item.productId, qty: reduceAmt });
        }

        const totalAmount = qty * salePrice;
        const totalProfit = totalAmount - totalCost;

        const newSale = {
            id: generateId(),
            date: document.getElementById('inp-sale-date').value,
            customer: document.getElementById('inp-sale-cust').value,
            productId: matchingFlavs[0].productId,
            saleProdName: finalName,
            saleFlavorName: finalFlavor,
            qty: qty,
            totalAmount: totalAmount,
            profit: totalProfit,
            vp: totalVp,
            reductions: reductions
        };

        const sales = DB.get('sales');
        sales.unshift(newSale);
        DB.set('sales', sales);
        DB.set('product_flavors', flavors);
        DB.set('base_products', bases);

        e.target.reset();
        document.getElementById('sale-preview').classList.add('hidden');
        closeModal();
        refreshApp();
    });

    function updateSalePreview() {
        const qty = parseInt(document.getElementById('inp-sale-qty').value) || 0;
        const prodSearch = document.getElementById('inp-sale-prod').value.trim().toLowerCase();
        const flavorSearch = document.getElementById('inp-sale-flavor').value.trim().toLowerCase();
        let salePrice = parseFloat(document.getElementById('inp-sale-price').value);
        const previewBox = document.getElementById('sale-preview');

        if ((!prodSearch && !flavorSearch) || qty <= 0) {
            previewBox.classList.add('hidden');
            return;
        }
        const bases = DB.get('base_products');
        const flavors = DB.get('product_flavors');
        let matchingFlavs = [];

        if (prodSearch && flavorSearch) {
            const b = bases.find(x => x.name.toLowerCase() === prodSearch);
            if (b) matchingFlavs = flavors.filter(f => f.productId === b.id && f.flavor.toLowerCase() === flavorSearch);
        } else if (!prodSearch && flavorSearch) {
            matchingFlavs = flavors.filter(f => f.flavor.toLowerCase() === flavorSearch);
        } else if (prodSearch && !flavorSearch) {
            const b = bases.find(x => x.name.toLowerCase() === prodSearch);
            if (b) matchingFlavs = flavors.filter(f => f.productId === b.id);
        }

        if (matchingFlavs.length > 0) {
            const prod = matchingFlavs[0];
            if (isNaN(salePrice)) salePrice = 0;
            const totalVP = prod.vp * qty;
            const totalPrice = salePrice * qty;
            const profit = totalPrice - (prod.sp * qty);
            const profitColor = profit >= 0 ? 'var(--primary-color)' : 'var(--alert-color)';

            previewBox.innerHTML = `
                <div style="display:flex; justify-content:space-between"><span>Volume Point:</span> <strong>${totalVP.toFixed(2)}</strong></div>
                <div style="display:flex; justify-content:space-between"><span>Total Price:</span> <strong>₹${totalPrice.toFixed(2)}</strong></div>
                <div style="display:flex; justify-content:space-between"><span>Profit:</span> <strong style="color: ${profitColor}">${profit >= 0 ? '+' : ''}₹${profit.toFixed(2)}</strong></div>
            `;
            previewBox.classList.remove('hidden');
        } else {
            previewBox.classList.add('hidden');
        }
    }

    function autoFillSalePrice() {
        const prodSearch = document.getElementById('inp-sale-prod').value.trim().toLowerCase();
        const flavorSearch = document.getElementById('inp-sale-flavor').value.trim().toLowerCase();
        const bases = DB.get('base_products');
        const flavors = DB.get('product_flavors');

        let matchingFlavs = [];
        if (prodSearch && flavorSearch) {
            const b = bases.find(x => x.name.toLowerCase() === prodSearch);
            if (b) matchingFlavs = flavors.filter(f => f.productId === b.id && f.flavor.toLowerCase() === flavorSearch);
        } else if (!prodSearch && flavorSearch) {
            matchingFlavs = flavors.filter(f => f.flavor.toLowerCase() === flavorSearch);
        } else if (prodSearch && !flavorSearch) {
            const b = bases.find(x => x.name.toLowerCase() === prodSearch);
            if (b) matchingFlavs = flavors.filter(f => f.productId === b.id);
        }

        if (matchingFlavs.length > 0 && matchingFlavs[0].sp) {
            document.getElementById('inp-sale-price').value = matchingFlavs[0].sp;
        }
        updateSalePreview();
    }

    document.getElementById('inp-sale-prod').addEventListener('change', autoFillSalePrice);
    document.getElementById('inp-sale-flavor').addEventListener('change', autoFillSalePrice);
    document.getElementById('inp-sale-qty').addEventListener('input', updateSalePreview);
    document.getElementById('inp-sale-price').addEventListener('input', updateSalePreview);

    // Render Attendance
    function renderAttendance() {
        const atts = DB.get('attendance');
        const container = document.getElementById('attendance-accordion-container');
        if (!container) return;
        container.innerHTML = '';

        const filterDateInput = document.getElementById('attendance-search-date');
        const filterDate = filterDateInput ? filterDateInput.value : "";
        const grouped = {};

        atts.forEach(a => {
            if (!grouped[a.date]) grouped[a.date] = [];
            grouped[a.date].push(a);
        });

        let sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
        if (filterDate) sortedDates = sortedDates.filter(d => d === filterDate);

        sortedDates.forEach(date => {
            const records = grouped[date];
            let presentCount = 0;
            let absentCount = 0;
            let dailyShakeProfit = 0;
            const excludeNames = ['shareef', 'naseera', 'haseeb'];

            records.forEach(r => {
                if (r.status.includes('Present')) {
                    presentCount++;
                    const normalized = (r.name || '').trim().toLowerCase();
                    if (!excludeNames.includes(normalized)) {
                        dailyShakeProfit += 50;
                    }
                } else {
                    absentCount++;
                }
            });

            const total = presentCount + absentCount;
            const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;
            const dObj = new Date(date + "T00:00:00");
            const dayName = dObj.toLocaleDateString('en-US', { weekday: 'short' });
            const displayDate = dObj.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

            const card = document.createElement('div');
            card.classList.add('accordion-card');

            let listHTML = '<ul class="attendance-list">';
            records.forEach(r => {
                const isPresent = r.status.includes('Present');
                const statusDisplay = isPresent ? '✅ Present' : '❌ Absent';
                const statusColor = isPresent ? 'var(--primary-color)' : 'var(--alert-color)';
                listHTML += `
                  <li class="attendance-item" style="display:flex; justify-content:space-between; align-items:center;">
                      <span class="att-name">• <span style="font-weight: 500;">${r.name || '-'}</span></span>
                      <div style="display:flex; align-items:center; gap:8px;">
                          <strong style="color: ${statusColor}">${statusDisplay}</strong>
                          <button class="icon-btn delete-btn" data-type="attendance" data-id="${r.id}" style="color: var(--alert-color); font-size: 16px; margin: 0; padding: 4px; width: 32px;" title="Delete Attendance entry">🗑</button>
                      </div>
                  </li>
                `;
            });
            listHTML += '</ul>';

            card.innerHTML = `
                <div class="accordion-header">
                    <div class="accordion-title">
                        <span class="accordion-icon">▶</span>
                        ${displayDate} (${dayName})
                    </div>
                    <div class="accordion-summary" style="line-height:1.4;">
                        Present: ${presentCount} | Absent: ${absentCount} | Rate: ${rate}%<br>
                        <span style="color: var(--primary-color); font-weight: 500;">Shake Profit: ₹${dailyShakeProfit}</span>
                    </div>
                </div>
                <div class="accordion-body">
                    ${listHTML}
                </div>
            `;
            container.appendChild(card);
        });

        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement.classList.toggle('expanded');
            });
        });
    }

    document.getElementById('form-add-attendance').addEventListener('submit', (e) => {
        e.preventDefault();
        const atts = DB.get('attendance');
        atts.unshift({
            id: generateId(),
            date: document.getElementById('inp-att-date').value,
            name: document.getElementById('inp-att-name').value,
            status: document.getElementById('inp-att-status').value
        });
        DB.set('attendance', atts);
        e.target.reset();
        closeModal();
        refreshApp();
    });

    if (document.getElementById('attendance-search-date')) {
        document.getElementById('attendance-search-date').addEventListener('change', renderAttendance);
    }
    document.getElementById('stock-search').addEventListener('input', (e) => renderStock(e.target.value));
    document.getElementById('sales-search').addEventListener('input', (e) => renderSales(e.target.value));

    // Global Delete Mechanic
    document.getElementById('main-content').addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-btn');
        if (!btn) return;
        const type = btn.getAttribute('data-type');
        const id = btn.getAttribute('data-id');

        if (type === 'sale') {
            if (confirm("Are you sure you want to delete this sale? Stock will not be restored.")) {
                const sales = DB.get('sales');
                const saleIdx = sales.findIndex(s => s.id === id);
                if (saleIdx > -1) {
                    sales.splice(saleIdx, 1);
                    DB.set('sales', sales);
                    refreshApp();
                }
            }
        } else if (type === 'attendance') {
            if (confirm("Are you sure you want to delete this attendance entry?")) {
                const atts = DB.get('attendance');
                const aIdx = atts.findIndex(a => a.id === id);
                if (aIdx > -1) {
                    atts.splice(aIdx, 1);
                    DB.set('attendance', atts);
                    refreshApp();
                }
            }
        } else if (confirm("Are you sure you want to delete this item?")) {
            let bases = DB.get('base_products');
            let flavors = DB.get('product_flavors');

            if (type === 'base') {
                flavors = flavors.filter(f => f.productId !== id);
                bases = bases.filter(b => b.id !== id);
            } else if (type === 'flavor') {
                const fToDel = flavors.find(f => f.id === id);
                if (fToDel) {
                    const bIdx = bases.findIndex(b => b.id === fToDel.productId);
                    if (bIdx > -1) bases[bIdx].totalQty -= fToDel.qty;
                }
                flavors = flavors.filter(f => f.id !== id);
            }

            DB.set('base_products', bases);
            DB.set('product_flavors', flavors);
            refreshApp();
        }
    });

    const btnSendReport = document.getElementById('btn-send-report');
    if (btnSendReport) {
        btnSendReport.addEventListener('click', () => {
            const flavors = DB.get('product_flavors');
            const sales = DB.get('sales');
            const atts = DB.get('attendance');

            let totalProfit = 0;
            let stockValue = 0;
            let stockVP = 0;
            let totalVPSold = 0;
            let shakeProfitTotal = 0;

            flavors.forEach(f => {
                stockValue += (f.sp * f.qty);
                stockVP += (f.vp * f.qty);
            });

            sales.forEach(s => {
                if (s.profit !== undefined) totalProfit += s.profit;
                if (s.vp !== undefined) totalVPSold += s.vp;
            });

            const excludeNames = ['shareef', 'naseera', 'haseeb'];
            atts.forEach(a => {
                if (a.status.includes('Present')) {
                    const normalized = (a.name || '').trim().toLowerCase();
                    if (!excludeNames.includes(normalized)) {
                        shakeProfitTotal += 50;
                    }
                }
            });

            console.log("Debug checking Total V.P for Whatsapp generation: ", stockVP);

            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const currentMonth = monthNames[new Date().getMonth()];

            const msg = `*Monthly Report (${currentMonth})*\n\nTotal Profit: ₹${totalProfit.toFixed(0)}\nTotal Stock Value: ₹${stockValue.toFixed(0)}\nTotal V.P: ${stockVP.toFixed(2)}\nTotal V.P Sold: ${totalVPSold.toFixed(2)}\nShake Profit: ₹${shakeProfitTotal}`;
            const encoded = encodeURIComponent(msg);
            window.open(`https://wa.me/?text=${encoded}`, '_blank');
        });
    }

    const btnDownloadPdf = document.getElementById('btn-download-pdf');
    if (btnDownloadPdf) {
        btnDownloadPdf.addEventListener('click', async () => {
            btnDownloadPdf.textContent = "⏳ Generating PDF...";
            btnDownloadPdf.disabled = true;

            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();

                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                const now = new Date();
                const currentMonth = monthNames[now.getMonth()];
                const currentYear = now.getFullYear();

                const bases = DB.get('base_products');
                const flavors = DB.get('product_flavors');
                const sales = DB.get('sales');
                const atts = DB.get('attendance');

                let totalProfit = 0;
                let stockValue = 0;
                let stockVP = 0;
                let totalVPSold = 0;
                let shakeProfitTotal = 0;

                flavors.forEach(f => {
                    stockValue += (f.sp * f.qty);
                    stockVP += (f.vp * f.qty);
                });

                sales.forEach(s => {
                    if (s.profit !== undefined) totalProfit += s.profit;
                    if (s.vp !== undefined) totalVPSold += s.vp;
                });

                const excludeNames = ['shareef', 'naseera', 'haseeb'];
                atts.forEach(a => {
                    if (a.status.includes('Present')) {
                        const normalized = (a.name || '').trim().toLowerCase();
                        if (!excludeNames.includes(normalized)) {
                            shakeProfitTotal += 50;
                        }
                    }
                });

                const monthlyProdMap = {};
                const currentMonthIdx = now.getMonth();

                sales.forEach(s => {
                    const dDate = new Date(s.date);
                    if (dDate.getMonth() === currentMonthIdx && dDate.getFullYear() === currentYear) {
                        const pName = s.saleProdName || "Unknown";
                        if (!monthlyProdMap[pName]) monthlyProdMap[pName] = { total: 0, flavors: {} };
                        if (s.reductions && s.reductions.length > 0) {
                            s.reductions.forEach(r => {
                                const f = flavors.find(fl => fl.id === r.id);
                                const fname = f ? (f.flavor || "Base") : "Unknown";
                                monthlyProdMap[pName].total += r.qty;
                                if (!monthlyProdMap[pName].flavors[fname]) monthlyProdMap[pName].flavors[fname] = 0;
                                monthlyProdMap[pName].flavors[fname] += r.qty;
                            });
                        } else {
                            monthlyProdMap[pName].total += s.qty;
                            const fname = (s.saleFlavorName && s.saleFlavorName !== "Any Flavour") ? s.saleFlavorName : "Base";
                            if (!monthlyProdMap[pName].flavors[fname]) monthlyProdMap[pName].flavors[fname] = 0;
                            monthlyProdMap[pName].flavors[fname] += s.qty;
                        }
                    }
                });

                const sortedProds = Object.keys(monthlyProdMap).sort((a, b) => monthlyProdMap[b].total - monthlyProdMap[a].total);
                const topProdName = sortedProds.length > 0 ? `${sortedProds[0]} (${monthlyProdMap[sortedProds[0]].total} Sold)` : "None";

                // PDF HEADER BOX
                doc.setFillColor(46, 204, 113, 0.1);
                doc.rect(15, 15, 180, 25, 'F');
                doc.setDrawColor(46, 204, 113);
                doc.setLineWidth(0.5);
                doc.rect(15, 15, 180, 25, 'S');

                doc.setTextColor(46, 204, 113);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(22);
                doc.text("Life Care", 105, 24, { align: 'center' });

                doc.setTextColor(0, 0, 0);
                doc.setFontSize(14);
                doc.text("Monthly Report", 105, 31, { align: 'center' });

                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);
                doc.setTextColor(100, 100, 100);
                doc.text(`${currentMonth} ${currentYear}`, 105, 37, { align: 'center' });

                // MULTI-SECTION SUMMARY TABLES 
                let yPos = 48;
                doc.autoTable({
                    startY: yPos,
                    margin: { left: 15, right: 15 },
                    body: [
                        ['Total Profit', `Rs. ${totalProfit.toFixed(2)}`],
                        ['Shake Profit', `Rs. ${shakeProfitTotal}`],
                        ['Total V.P Sold', `${totalVPSold.toFixed(2)}`],
                        ['Total Stock Price', `Rs. ${stockValue.toFixed(2)}`],
                        ['Total Stock V.P', `${stockVP.toFixed(2)}`]
                    ],
                    theme: 'grid',
                    styles: { fontSize: 11, cellPadding: 5, textColor: [40, 40, 40] },
                    alternateRowStyles: { fillColor: [250, 250, 250] },
                    columnStyles: {
                        0: { fontStyle: 'bold' },
                        1: { halign: 'right', fontStyle: 'bold', textColor: [46, 204, 113] }
                    },
                    head: [['Summary Metrics', 'Value']],
                    headStyles: { fillColor: [46, 204, 113], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' }
                });

                yPos = (doc.lastAutoTable ? doc.lastAutoTable.finalY : yPos) + 10;

                // TOP SELLING
                doc.autoTable({
                    startY: yPos,
                    margin: { left: 15, right: 15 },
                    body: [[topProdName]],
                    theme: 'grid',
                    styles: { cellPadding: 5 },
                    head: [['Top Selling Product']],
                    headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], halign: 'center', fontSize: 12 },
                    bodyStyles: { halign: 'center', fontStyle: 'bold', fontSize: 12, textColor: [46, 204, 113] }
                });

                yPos = (doc.lastAutoTable ? doc.lastAutoTable.finalY : yPos) + 10;

                // MONTHLY PRODUCT SALES (Hierarchical)
                if (sortedProds.length === 0) {
                    doc.autoTable({
                        startY: yPos, margin: { left: 15, right: 15 },
                        body: [['No sales this month.']], theme: 'grid',
                        head: [['Monthly Product Sales']],
                        headStyles: { fillColor: [46, 204, 113], halign: 'center' },
                        bodyStyles: { halign: 'center', textColor: [100, 100, 100] }
                    });
                    yPos = (doc.lastAutoTable ? doc.lastAutoTable.finalY : yPos) + 10;
                } else {
                    const salesBody = [];
                    sortedProds.forEach(pName => {
                        const pData = monthlyProdMap[pName];
                        salesBody.push([{ content: `${pName} (Total: ${pData.total})`, colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold', textColor: [0, 0, 0] } }]);

                        const sortedFlavs = Object.keys(pData.flavors).sort((a, b) => pData.flavors[b] - pData.flavors[a]);
                        sortedFlavs.forEach(fName => {
                            const rawName = fName || "Base";
                            const cleanTitle = rawName.replace(/[^a-zA-Z0-9\s]/g, "").trim().split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : "").join(' ').trim();
                            console.log("PDF Generator Debug - Cleaned Flavour:", cleanTitle);
                            salesBody.push([`  - ${cleanTitle}`, { content: pData.flavors[fName].toString(), styles: { halign: 'right', fontStyle: 'bold', textColor: [46, 204, 113] } }]);
                        });
                    });

                    doc.autoTable({
                        startY: yPos,
                        margin: { left: 15, right: 15 },
                        body: salesBody,
                        theme: 'grid',
                        head: [['Monthly Product Sales', 'Sold']],
                        styles: { fontSize: 10, cellPadding: 4, textColor: [60, 60, 60] },
                        headStyles: { fillColor: [46, 204, 113], halign: 'center' },
                        columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 30 } }
                    });
                    yPos = (doc.lastAutoTable ? doc.lastAutoTable.finalY : yPos) + 10;
                }

                // STOCK SUMMARY (Table)
                const stockRows = [];
                const groupedObj = {};
                flavors.forEach(f => {
                    if (!groupedObj[f.productId]) groupedObj[f.productId] = [];
                    groupedObj[f.productId].push(f);
                });

                bases.forEach(b => {
                    const subitems = groupedObj[b.id] || [];
                    subitems.forEach(f => {
                        const tVp = (f.vp * f.qty).toFixed(2);
                        const tSp = (f.sp * f.qty).toFixed(2);
                        const rawF = f.flavor || 'Base';
                        const cleanF = rawF.replace(/[^a-zA-Z0-9\s]/g, "").trim().split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : "").join(' ').trim();
                        stockRows.push([
                            b.name,
                            cleanF,
                            f.qty.toString(),
                            Number(f.vp).toFixed(2),
                            tVp,
                            `Rs ${Number(f.sp).toFixed(2)}`,
                            `Rs ${tSp}`
                        ]);
                    });
                });

                doc.autoTable({
                    startY: yPos,
                    margin: { left: 15, right: 15 },
                    head: [['Product', 'Flavour', 'Qty', 'V.P', 'Total V.P', 'Price', 'Total Price']],
                    body: stockRows,
                    theme: 'grid',
                    styles: { fontSize: 9, cellPadding: 4, textColor: [40, 40, 40] },
                    alternateRowStyles: { fillColor: [250, 250, 250] },
                    headStyles: { fillColor: [46, 204, 113], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
                    columnStyles: {
                        2: { halign: 'center' },
                        3: { halign: 'right' },
                        4: { halign: 'right', fontStyle: 'bold' },
                        5: { halign: 'right' },
                        6: { halign: 'right', fontStyle: 'bold', textColor: [44, 62, 80] }
                    }
                });

                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setDrawColor(46, 204, 113);
                    doc.setLineWidth(0.5);
                    doc.rect(10, 10, 190, 277);
                    doc.setFont("helvetica", "italic");
                    doc.setFontSize(9);
                    doc.setTextColor(150, 150, 150);
                    doc.text(`Generated by Life Care App - Page ${i} of ${pageCount}`, 105, 283, { align: 'center' });
                }

                const filename = `LifeCare_Report_${currentMonth}_${currentYear}.pdf`;

                try {
                    const blob = doc.output('blob');
                    const file = new File([blob], filename, { type: 'application/pdf' });
                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: `LifeCare Report - ${currentMonth}`,
                            text: 'Here is the monthly report.',
                            files: [file]
                        });
                    } else {
                        doc.save(filename);
                    }
                } catch (e) {
                    console.error("Share failed", e);
                    doc.save(filename);
                }

            } catch (err) {
                console.error(err);
                alert("Failed to generate PDF. Make sure you are connected to the internet to load the PDF library.");
            } finally {
                btnDownloadPdf.textContent = "📄 Download Monthly Report (PDF)";
                btnDownloadPdf.disabled = false;
            }
        });
    }

    const btnResetMonthly = document.getElementById('btn-reset-monthly');
    if (btnResetMonthly) {
        btnResetMonthly.addEventListener('click', () => {
            if (confirm("This will delete all sales, stock updates, and attendance data. Continue?")) {
                DB.set('sales', []);
                DB.set('attendance', []);

                let bases = DB.get('base_products');
                let flavors = DB.get('product_flavors');
                bases.forEach(b => b.totalQty = 0);
                flavors.forEach(f => f.qty = 0);

                DB.set('base_products', bases);
                DB.set('product_flavors', flavors);

                refreshApp();
            }
        });
    }

    function refreshApp() {
        renderDashboard();
        renderStock(document.getElementById('stock-search').value);
        renderSales(document.getElementById('sales-search').value);
        renderAttendance();
    }

    // initSession is handled by Firebase AuthState changes
});
