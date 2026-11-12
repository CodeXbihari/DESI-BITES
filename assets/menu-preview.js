// Uses the same source catalog as Expo. No product names or prices are duplicated here.
const menuPrices = {};
const menuQtys = {};
const MENU_DISHES = {};
let menuCatalog = [];
let homeSections = { popular: [], recommended: [] };
let searchBackScreen = 'home';
let searchCollection = null;
let searchCategory = null;
const previewOrders = [];
let trackingQtys = null;
async function loadPreviewData(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Menu could not be loaded. Please refresh.');
  return response.json();
}
const menuReady = Promise.all([
  loadPreviewData('src/data/restaurantMenu.json'),
  loadPreviewData('src/data/homeSections.json'),
]).then(([items, sections]) => {
  homeSections = sections;
  menuCatalog = items;
  items.forEach(item => { menuPrices[item.id] = item.price; MENU_DISHES[item.id] = { ...item, img: item.image, sub: item.description }; });
  renderRestaurantViews();
  renderCheckoutScreen();
}).catch(error => {
  document.getElementById('dbp-search-empty').textContent = error.message;
  document.getElementById('dbp-search-empty').hidden = false;
});
function menuCard(item) {
  const qty = menuQtys[item.id] || 0;
  return `<article class="dbp-card"><div class="dbp-photo"><img src="${item.image}" alt="${item.name}" loading="lazy"><span class="dbp-veg" aria-label="Vegetarian"></span></div><div class="dbp-card-body"><div class="dbp-name">${item.name}</div><div class="dbp-card-bottom"><strong>₹${item.price}</strong>${!item.available ? '<span>Unavailable</span>' : qty ? `<div class="dbp-stepper"><button onclick="updateQty('${item.id}',-1)" aria-label="Remove one ${item.name}">−</button><span>${qty}</span><button onclick="updateQty('${item.id}',1)" aria-label="Add one ${item.name}">+</button></div>` : `<button class="dbp-add" onclick="updateQty('${item.id}',1)" aria-label="Add ${item.name}">Add ＋</button>`}</div></div></article>`;
}
function updateQty(id, delta) {
  if (!MENU_DISHES[id] || !MENU_DISHES[id].available) return;
  menuQtys[id] = Math.max(0, (menuQtys[id] || 0) + delta);
  if (!menuQtys[id]) delete menuQtys[id];
  renderRestaurantViews();
}
function renderRestaurantViews() {
  const rowOffsets = ['dbp-popular', 'dbp-recommended'].map(id => [id, document.getElementById(id).scrollLeft]);
  const byId = id => menuCatalog.find(item => item.id === id);
  document.getElementById('dbp-popular').innerHTML = homeSections.popular.map(byId).filter(Boolean).map(menuCard).join('');
  document.getElementById('dbp-recommended').innerHTML = homeSections.recommended.map(byId).filter(Boolean).map(menuCard).join('');
  document.getElementById('dbp-categories').innerHTML = ['Pizza','Sandwiches','Burgers','Pasta','Taste of Bihar','Maggi','Rolls','Juice','Lassi','Paratha'].map(category => {
    const item = menuCatalog.find(item => item.category === category);
    return item ? `<button onclick="openRestaurantMenu('${category}')"><img src="${item.image}" alt=""><span>${category}</span></button>` : '';
  }).join('');
  const slides = ['db-veg-pizza','db-paneer-tikka-pizza','db-veg-cheese-burger','db-veg-pasta','db-litti-2pc-chokha'].map(id => menuCatalog.find(item => item.id === id)).filter(Boolean);
  document.getElementById('dbp-banner-track').innerHTML = slides.map(item => `<div class="dbp-banner-slide"><img src="${item.image}" alt="${item.name}"><div class="dbp-banner-copy">Good Food<br><em>Good Mood!</em><button onclick="openRestaurantMenu('${item.category}')">Order Now →</button></div></div>`).join('');
  document.getElementById('dbp-banner-dots').innerHTML = slides.map((_,i) => `<button class="${i===0?'active':''}" onclick="document.getElementById('dbp-banner-track').scrollTo({left:${i}*document.getElementById('dbp-banner-track').clientWidth,behavior:'smooth'})" aria-label="Show promotion ${i+1}"></button>`).join('');
  rowOffsets.forEach(([id, offset]) => { document.getElementById(id).scrollLeft = offset; });
  filterMenuItems();
  updateSearchCartBar();
}
function filterMenuItems() {
  const value = document.getElementById('dbp-search-input').value;
  const query = value.trim().toLowerCase();
  const results = query ? menuCatalog.filter(item => item.name.toLowerCase().includes(query)) : searchCategory ? menuCatalog.filter(item => item.category === searchCategory) : searchCollection ? homeSections[searchCollection].map(id => menuCatalog.find(item => item.id === id)).filter(Boolean) : [];
  const heading = document.getElementById('dbp-search-heading');
  heading.replaceChildren();
  if (query) { heading.append('Showing results for “'); const strong = document.createElement('strong'); strong.textContent = value.trim(); heading.append(strong, '”'); }
  else heading.textContent = searchCategory ? `Showing results for “${searchCategory}”` : searchCollection === 'popular' ? 'Popular Items' : searchCollection === 'recommended' ? 'Recommended for You' : 'Search the Desi Bites menu';
  document.getElementById('dbp-search-grid').innerHTML = results.map(menuCard).join('');
  document.getElementById('dbp-clear').hidden = !query;
  const empty = document.getElementById('dbp-search-empty');
  empty.hidden = results.length > 0;
  empty.textContent = query ? 'No matching dishes. Try another food name or clear your search.' : 'Type a food name to search across our full menu.';
}
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('dbp-banner-track');
  if (!track) return;
  track.addEventListener('scroll', () => {
    const index = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
    document.querySelectorAll('#dbp-banner-dots button').forEach((dot,i) => dot.classList.toggle('active',i===index));
  }, { passive: true });
});
function clearFoodSearch() { searchCollection = null; searchCategory = null; document.getElementById('dbp-search-input').value = ''; filterMenuItems(); document.getElementById('dbp-search-input').focus(); }
function scrollHomeRow(id) { const row=document.getElementById(id); row.scrollBy({left:178,behavior:'smooth'}); }
function openFoodSearch(query = '', from = 'home', collection = null, category = null) { searchBackScreen = from; searchCollection = collection; searchCategory = category; document.getElementById('dbp-search-input').value = query; showScreen('search'); filterMenuItems(); document.getElementById('dbp-search-input').focus(); }
function openRestaurantMenu(category = 'All') { openFoodSearch('', 'home', null, category === 'All' ? null : category); }
function openMenuWithCat(category) { openRestaurantMenu(category); }
function renderOrderTabs() {
  const content = previewOrders.length ? previewOrders.map(order => `<article class="dbp-order-card"><strong>${order.id}</strong><small>Ordered on ${order.date}</small>${Object.entries(order.items).map(([id, quantity]) => `<div>${quantity}× ${MENU_DISHES[id]?.name || 'Dish'}</div>`).join('')}<button onclick="reorderPreview('${order.id}')">Add to cart</button></article>`).join('') : '<p class="dbp-empty">No past orders yet. Placed orders will appear here.</p>';
  document.getElementById('dbp-orders-list').innerHTML = previewOrders.length ? previewOrders.map(order => `<article class="dbp-order-card"><strong>${order.id}</strong><small>Ordered on ${order.date}</small>${Object.entries(order.items).map(([id, quantity]) => `<div>${quantity}× ${MENU_DISHES[id]?.name || 'Dish'}</div>`).join('')}<span>₹${order.total}</span></article>`).join('') : content;
  document.getElementById('dbp-reorder-list').innerHTML = content;
}
function reorderPreview(orderId) {
  const order = previewOrders.find(entry => entry.id === orderId);
  if (!order) return;
  const unavailable = [];
  let added = 0;
  Object.entries(order.items).forEach(([id, quantity]) => {
    if (!MENU_DISHES[id]?.available) { unavailable.push(MENU_DISHES[id]?.name || id); return; }
    menuQtys[id] = (menuQtys[id] || 0) + quantity;
    added += quantity;
  });
  const notice = document.getElementById('dbp-reorder-notice');
  notice.textContent = unavailable.length ? `Unavailable now: ${unavailable.join(', ')}.` : '';
  renderRestaurantViews();
  if (added) showScreen('checkout');
}
function updateSearchCartBar() {
  const count = Object.values(menuQtys).reduce((total, n) => total + n, 0);
  const subtotal = Object.entries(menuQtys).reduce((total, [id,n]) => total + (menuPrices[id] || 0) * n, 0);
  document.querySelectorAll('.dbp-cart-count').forEach(element => { element.textContent = count; element.hidden = !count; });
  const bar = document.getElementById('dbp-home-cart');
  bar.hidden = !count;
  bar.innerHTML = `<span>🛒 ${count}</span><strong>₹${subtotal}</strong><span>View Cart →</span>`;
}
