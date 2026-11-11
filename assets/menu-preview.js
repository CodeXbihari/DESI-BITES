// Uses the same source catalog as Expo. No product names or prices are duplicated here.
const menuPrices = {};
const menuQtys = {};
const MENU_DISHES = {};
let menuCatalog = [];
let activeMenuCat = 'All';
let searchBackScreen = 'home';
const menuReady = fetch('src/data/restaurantMenu.json').then(response => {
  if (!response.ok) throw new Error('Menu could not be loaded. Please refresh.');
  return response.json();
}).then(items => {
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
  const byId = id => menuCatalog.find(item => item.id === id);
  document.getElementById('dbp-popular').innerHTML = ['db-veg-pizza','db-veg-cheese-burger'].map(byId).filter(Boolean).map(menuCard).join('');
  document.getElementById('dbp-recommended').innerHTML = ['db-paneer-pizza','db-veg-pasta'].map(byId).filter(Boolean).map(menuCard).join('');
  document.getElementById('dbp-categories').innerHTML = ['Pizza','Sandwiches','Burgers','Pasta','Taste of Bihar','Maggi','Rolls','Juice','Lassi','Paratha'].map(category => {
    const item = menuCatalog.find(item => item.category === category);
    return item ? `<button onclick="openRestaurantMenu('${category}')"><img src="${item.image}" alt=""><span>${category}</span></button>` : '';
  }).join('');
  const categories = ['All', ...new Set(menuCatalog.map(item => item.category))];
  document.getElementById('dbp-menu-pills').innerHTML = categories.map(category => `<button class="${category === activeMenuCat ? 'selected' : ''}" onclick="openRestaurantMenu('${category}')">${category}</button>`).join('');
  document.getElementById('dbp-menu-grid').innerHTML = menuCatalog.filter(item => activeMenuCat === 'All' || item.category === activeMenuCat).map(menuCard).join('');
  filterMenuItems();
  updateSearchCartBar();
}
function filterMenuItems() {
  const value = document.getElementById('dbp-search-input').value;
  const query = value.trim().toLowerCase();
  const results = query ? menuCatalog.filter(item => item.name.toLowerCase().includes(query)) : [];
  const heading = document.getElementById('dbp-search-heading');
  heading.replaceChildren();
  if (query) { heading.append('Showing results for “'); const strong = document.createElement('strong'); strong.textContent = value.trim(); heading.append(strong, '”'); }
  else heading.textContent = 'Search the Desi Bites menu';
  document.getElementById('dbp-search-grid').innerHTML = results.map(menuCard).join('');
  document.getElementById('dbp-clear').hidden = !query;
  const empty = document.getElementById('dbp-search-empty');
  empty.hidden = results.length > 0;
  empty.textContent = query ? 'No matching dishes. Try another food name or clear your search.' : 'Type a food name to search across our full menu.';
}
function clearFoodSearch() { document.getElementById('dbp-search-input').value = ''; filterMenuItems(); document.getElementById('dbp-search-input').focus(); }
function openFoodSearch(query = '', from = 'home') { searchBackScreen = from; document.getElementById('dbp-search-input').value = query; showScreen('search'); filterMenuItems(); document.getElementById('dbp-search-input').focus(); }
function openRestaurantMenu(category = 'All') { activeMenuCat = category; showScreen('menu'); renderRestaurantViews(); }
function openMenuWithCat(category) { openRestaurantMenu(category); }
function updateSearchCartBar() {
  const count = Object.values(menuQtys).reduce((total, n) => total + n, 0);
  const subtotal = Object.entries(menuQtys).reduce((total, [id,n]) => total + (menuPrices[id] || 0) * n, 0);
  document.querySelectorAll('.dbp-cart-count').forEach(element => { element.textContent = count; element.hidden = !count; });
  const bar = document.getElementById('dbp-home-cart');
  bar.hidden = !count;
  bar.innerHTML = `<span>🛒 ${count}</span><strong>₹${subtotal}</strong><span>View Cart →</span>`;
}
