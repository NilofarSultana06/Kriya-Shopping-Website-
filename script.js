const products = [
  {id:1,name:"Orbit Headphones",price:2499,desc:"Wireless sound, made simple.",emoji:"◉",c1:"#d9e6a2",c2:"#74804b",shape:"round",tag:"BESTSELLER",isNew:false},
  {id:2,name:"Everyday Backpack",price:1899,desc:"Room for all your essentials.",emoji:"▣",c1:"#c8a78c",c2:"#76543f",shape:"",tag:"",isNew:false},
  {id:3,name:"Aura Water Bottle",price:699,desc:"Hydration with a little style.",emoji:"♢",c1:"#a6c9cf",c2:"#47717a",shape:"slim",tag:"NEW",isNew:true},
  {id:4,name:"Studio Desk Lamp",price:1299,desc:"A warm glow for late ideas.",emoji:"☼",c1:"#e8c77c",c2:"#9b7132",shape:"",tag:"NEW",isNew:true},
  {id:5,name:"Classic Sneakers",price:2199,desc:"Your everyday go-to pair.",emoji:"⌁",c1:"#d8d5cd",c2:"#77736a",shape:"flat",tag:"",isNew:false},
  {id:6,name:"Minimal Watch",price:1599,desc:"A timeless finishing touch.",emoji:"◷",c1:"#d4c5a7",c2:"#75644b",shape:"round",tag:"NEW",isNew:true}
];
let cart = {};
let currentSort = "featured";
const grid = document.getElementById("productGrid");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const sortSelect = document.getElementById("sortSelect") || document.getElementById("sort");
const money = n => "₹" + n.toLocaleString("en-IN");

function getSortedProducts(sortBy = currentSort) {
  const items = [...products];
  const criterion = String(sortBy || "").toLowerCase().trim();

  if (criterion === "price-asc" || criterion === "price-low-high" || criterion.includes("low to high") || criterion === "price") {
    return items.sort((a, b) => a.price - b.price);
  }
  if (criterion === "price-desc" || criterion === "price-high-low" || criterion.includes("high to low")) {
    return items.sort((a, b) => b.price - a.price);
  }
  if (criterion === "name-asc" || criterion === "name-a-z" || (criterion.includes("name") && criterion.includes("a to z")) || criterion === "name") {
    return items.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }
  if (criterion === "name-desc" || criterion === "name-z-a" || (criterion.includes("name") && criterion.includes("z to a"))) {
    return items.sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: "base" }));
  }
  return items;
}

function renderProducts(sortOrder){
  if (sortOrder) {
    currentSort = sortOrder;
  } else if (sortSelect && sortSelect.value) {
    currentSort = sortSelect.value;
  }
  const items = getSortedProducts(currentSort);
  grid.innerHTML = items.map(p => `
    <article class="product-card">
      <div class="product-art">
        ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
        <div class="shape ${p.shape}" style="--c1:${p.c1};--c2:${p.c2}">${p.emoji}</div>
      </div>
      <div class="product-info">
        <div class="product-top"><span class="product-name">${p.name}</span><span class="product-price">${money(p.price)}</span></div>
        <p class="product-desc">${p.desc}</p>
        <button class="add-btn" data-add="${p.id}">Add to cart <span>＋</span></button>
      </div>
    </article>`).join("");
}

function sortProducts(criteria) {
  if (sortSelect) {
    sortSelect.value = criteria;
  }
  renderProducts(criteria);
}
window.sortProducts = sortProducts;
window.getSortedProducts = getSortedProducts;

function getNewArrivals() {
  const filtered = products.filter(p => p.isNew || (p.tag && p.tag.toUpperCase().includes("NEW")) || p.isNewArrival || p.newArrival);
  return filtered.length ? filtered : products.slice(0, 3);
}

function renderNewArrivals() {
  const container = document.getElementById("newArrivalsGrid") || document.getElementById("new-arrivals-grid") || document.querySelector(".new-arrivals-grid");
  if (!container) return;
  const items = getNewArrivals();
  const countEl = document.getElementById("newArrivalsCount");
  if (countEl) {
    countEl.innerHTML = `${String(items.length).padStart(2, "0")} ITEMS&nbsp; · &nbsp;CURATED NOW`;
  }
  const heroCountEl = document.getElementById("heroNewCount");
  if (heroCountEl) {
    heroCountEl.textContent = `${String(items.length).padStart(2, "0")} / ${String(products.length).padStart(2, "0")}`;
  }
  container.innerHTML = items.map(p => `
    <article class="product-card" data-product-id="${p.id}">
      <div class="product-art">
        <span class="tag badge new-badge" data-badge="new">${p.tag || "NEW"}</span>
        <div class="shape ${p.shape}" style="--c1:${p.c1};--c2:${p.c2}">${p.emoji}</div>
      </div>
      <div class="product-info">
        <div class="product-top"><span class="product-name">${p.name}</span><span class="product-price">${money(p.price)}</span></div>
        <p class="product-desc">${p.desc}</p>
        <button class="add-btn" data-add="${p.id}" aria-label="Add ${p.name} to cart">Add to cart <span>＋</span></button>
      </div>
    </article>`).join("");
}
window.getNewArrivals = getNewArrivals;
window.renderNewArrivals = renderNewArrivals;

if (sortSelect) {
  // Support aliases if programmatic values like 'price-low-high' are assigned to sortSelect.value
  const aliases = {
    "price-low-high": "price-asc",
    "low-to-high": "price-asc",
    "price-high-low": "price-desc",
    "high-to-low": "price-desc",
    "name-a-z": "name-asc",
    "a-to-z": "name-asc",
    "name-z-a": "name-desc",
    "z-to-a": "name-desc",
    "default": "featured"
  };
  try {
    const originalDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
    if (originalDesc && originalDesc.set) {
      Object.defineProperty(sortSelect, "value", {
        get() {
          return originalDesc.get.call(this);
        },
        set(val) {
          const mapped = aliases[val] || val;
          originalDesc.set.call(this, mapped);
        },
        configurable: true
      });
    }
  } catch (err) {
    // fallback if descriptor override not supported
  }

  sortSelect.addEventListener("change", e => {
    renderProducts(e.target.value);
  });
}
function addToCart(id){cart[id]=(cart[id]||0)+1;renderCart();showToast("Added to your cart");}
function changeQty(id,delta){cart[id]=(cart[id]||0)+delta;if(cart[id]<=0)delete cart[id];renderCart();}
function renderCart(){
  const entries=Object.entries(cart);
  const count=entries.reduce((sum,[,qty])=>sum+qty,0);
  document.getElementById("cartCount").textContent=count;
  const total=entries.reduce((sum,[id,qty])=>sum+products.find(p=>p.id===Number(id)).price*qty,0);
  document.getElementById("subtotal").textContent=money(total);
  const items=document.getElementById("cartItems");
  if(!entries.length){items.innerHTML='<div class="empty-cart"><span>▢</span><p>Your cart is waiting.</p><small>Add something you love.</small></div>';return;}
  items.innerHTML=entries.map(([id,qty])=>{
    const p=products.find(item=>item.id===Number(id));
    return `<div class="cart-item">
      <div class="mini-art" style="--c1:${p.c1};--c2:${p.c2}">${p.emoji}</div>
      <div><div class="cart-item-name">${p.name}</div><div class="cart-item-price">${money(p.price)}</div>
        <div class="quantity"><button data-change="${id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${qty}</span><button data-change="${id}" data-delta="1" aria-label="Increase quantity">＋</button></div>
      </div>
      <button class="remove-btn" data-remove="${id}" aria-label="Remove ${p.name}">×</button>
    </div>`;
  }).join("");
}
function openCart(){cartDrawer.classList.add("open");overlay.classList.add("open");cartDrawer.setAttribute("aria-hidden","false");}
function closeCart(){cartDrawer.classList.remove("open");overlay.classList.remove("open");cartDrawer.setAttribute("aria-hidden","true");}
let toastTimer;
function showToast(message){const toast=document.getElementById("toast");toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),1800);}

document.addEventListener("click", e => {
  const btn = e.target.closest("[data-add]");
  if (btn) addToCart(Number(btn.dataset.add));
});
document.getElementById("cartItems").addEventListener("click",e=>{
  const change=e.target.closest("[data-change]"),remove=e.target.closest("[data-remove]");
  if(change)changeQty(Number(change.dataset.change),Number(change.dataset.delta));
  if(remove){delete cart[Number(remove.dataset.remove)];renderCart();}
});
document.getElementById("cartToggle").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCart();});
document.getElementById("checkoutBtn").addEventListener("click",()=>{
  if(!Object.keys(cart).length){showToast("Your cart is empty");return;}
  showToast("Demo checkout — no payment is connected");
});
renderProducts();renderNewArrivals();renderCart();