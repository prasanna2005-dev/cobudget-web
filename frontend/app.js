// Required Firebase Imports
import {
  auth, db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection, addDoc, query, onSnapshot,
  doc, setDoc, getDoc, deleteDoc,
  getDocs    // ✅ ADD THIS
} from './firebase.js';


// DOM Elements
const emailField = document.getElementById("email");
const passwordField = document.getElementById("password");
const cartList = document.getElementById("cartList");
const totalAmount = document.getElementById("totalAmount");
const budgetInput = document.getElementById("monthlyBudget");
const budgetStatus = document.getElementById("budgetStatus");
const productGrid = document.getElementById("productGrid");
const userEmailSpan = document.getElementById("userEmail");
const recoInput = document.getElementById("recommendPrompt");
const recoGrid = document.getElementById("recommendationResults");
const eventInput = document.getElementById("eventInput");
const needsInput = document.getElementById("needsInput");
const prefInput = document.getElementById("prefInput");
const aiBudgetInput = document.getElementById("aiBudgetInput");
// DOM for shared cart
const inviteEmailField = document.getElementById("inviteEmail");
const sharedCartStatus = document.getElementById("sharedCartStatus");
const sharedCartList = document.getElementById("sharedCartList");

// ✅ DOM for filter & tag UI
const tagContainer = document.getElementById("tagCheckboxes");
const categoryFilter = document.getElementById("categoryFilter");
const priceSort = document.getElementById("priceSort");
const productSearch = document.getElementById("productSearch");
const maxPriceFilter = document.getElementById("maxPriceFilter");
let currentSharedCartId = null;


let currentUserEmail = "";
let currentUserUID = "";
let userBudget = 0;

// Sample Products

const products = [
    {
        "name": "Rice 5kg",
        "price": 299,
        "tag": "groceries",
        "image": "https://c.ndtvimg.com/2023-08/brlp7gk_uncooked-rice-or-rice-grains_625x300_18_August_23.jpg"
    },
    {
        "name": "Toothpaste",
        "price": 49,
        "tag": "hygiene",
        "image": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS5YaqRrPtTGJ57lnPFbtyg4bSnBofnT4_E3GX-m1_dxXX1VddT10_p-HDwFHI9jvcJSr34VRYW6jsNemnVmxzsMzyr4e-HSeBCFZQ6vR4Jz_tK9Of0_Aci"
    },
    {
        "name": "Cooking Oil 1L",
        "price": 135,
        "tag": "groceries",
        "image": "https://amscardiology.com/wp-content/uploads/2021/09/healthiest-cooking-oils.jpg"
    },
    {
        "name": "Shampoo 180ml",
        "price": 95,
        "tag": "personal care",
        "image": "https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/19202682/2025/1/22/1e74996c-fc0f-40bf-82bb-33210e6b44701737535346093-LOreal-Paris-Hyaluron-Moisture-Shampoo-with-Hyaluronic-Acid--1.jpg"
    },
    {
        "name": "Wheat Flour 5kg",
        "price": 240,
        "tag": "groceries",
        "image": "https://m.media-amazon.com/images/I/9104JpXbv6L.jpg"
    },
    {
        "name": "Tata Salt (1kg)",
        "price": 20,
        "tag": "groceries",
        "image": "https://dukaan.b-cdn.net/700x700/webp/media/0a14ad3d-3e07-4e41-9248-310bedd3cbad.jpeg"
    },
    {
        "name": "Amul Toned Milk",
        "price": 58,
        "tag": "dairy",
        "nutrition": ["high protein", "low carb", "diabetic friendly"],
        "image": "https://m.media-amazon.com/images/I/812816L+HkL._SL1500_.jpg"
    },
    {
        "name": "Country Eggs (6 pcs)",
        "price": 70,
        "tag": "protein",
        "nutrition": ["high protein", "low carb", "keto"],
        "image": "https://via.placeholder.com/150"
    },
    {
        "name": "Mother Dairy Paneer",
        "price": 120,
        "tag": "dairy",
        "nutrition": ["high protein", "keto"],
        "image": "https://via.placeholder.com/150"
    },
    {
        "name": "Fresh Broccoli",
        "price": 80,
        "tag": "vegetable",
        "nutrition": ["low carb", "diabetic friendly", "keto"],
        "image": "https://via.placeholder.com/150"
    },
    {
        "name": "Organic Brown Rice 1kg",
        "price": 95,
        "tag": "grain",
        "nutrition": ["diabetic friendly"],
        "image": "https://m.media-amazon.com/images/I/81NHIQf8p6L._SL1500_.jpg"
    },
    {
        "name": "Quaker Oats 500g",
        "price": 150,
        "tag": "heart health, healthy food, oats",
        "nutrition": ["whole grain", "fiber"],
        "image": "https://m.media-amazon.com/images/I/71d0wtpbxJL._SL1500_.jpg"
    },
    {
        "name": "California Almonds 250g",
        "price": 300,
        "tag": "heart health, nuts",
        "nutrition": ["vitamin E", "healthy fats"],
        "image": "https://m.media-amazon.com/images/I/61JysAVWHKL._SL1500_.jpg"
    },
    {
        "name": "Figaro Olive Oil 500ml",
        "price": 450,
        "tag": "heart health, healthy oil, olive oil",
        "nutrition": ["monounsaturated fats"],
        "image": "https://via.placeholder.com/150"
    },
    {
        "name": "Sunflower Seeds 100g",
        "price": 80,
        "tag": "heart health, seeds",
        "nutrition": ["vitamin E", "healthy fats", "fiber"],
        "image": "https://via.placeholder.com/150"
    },
    {
        "name": "Walnuts 200g",
        "price": 250,
        "tag": "heart health, nuts",
        "nutrition": ["omega-3", "healthy fats"],
        "image": "https://m.media-amazon.com/images/I/71wnuZ37mTL._SL1500_.jpg"
    },
    {
        "name": "Salmon Fillet 200g",
        "price": 400,
        "tag": "heart health, protein",
        "nutrition": ["omega-3", "high protein"],
        "image": "https://via.placeholder.com/150"
    },
    {
        "name": "Chia Seeds 150g",
        "price": 120,
        "tag": "healthy food, superfood",
        "nutrition": ["fiber", "omega-3", "protein"],
        "image": "https://m.media-amazon.com/images/I/71vbQzDkQbL._SL1500_.jpg"
    },
    {
        "name": "Spinach 500g",
        "price": 40,
        "tag": "vegetable, heart health",
        "nutrition": ["iron", "fiber", "low calorie"],
        "image": "https://via.placeholder.com/150"
    },
    {
        "name": "Avocado (1 pc)",
        "price": 150,
        "tag": "fruit, heart health",
        "nutrition": ["monounsaturated fats", "fiber", "potassium"],
        "image": "https://via.placeholder.com/150"
    }
]

// ✅ Available Tags for Filters
const availableTags = [
  "vegan", 
  "diabetic friendly", 
  "high protein", 
  "low carb", 
  "baby care", 
  "hygiene", 
  "personal care", 
  "monthly groceries", 
  "festival"
];

// Authentication
window.signup = async () => {
  try {
    await createUserWithEmailAndPassword(auth, emailField.value, passwordField.value);
    alert("Signup successful!");
  } catch (err) {
    alert("Signup failed: " + err.message);
  }
};

window.login = async () => {
  try {
    await signInWithEmailAndPassword(auth, emailField.value, passwordField.value);
  } catch (err) {
    alert("Login failed: " + err.message);
  }
};

window.logout = async () => await signOut(auth);


// Product Renderer
const renderProducts = () => {
  productGrid.innerHTML = "";

  // Fetch filter values
  const category = document.getElementById("categoryFilter")?.value || "all";
  const sort = document.getElementById("priceSort")?.value || "default";
  const searchTerm = document.getElementById("productSearch")?.value.toLowerCase() || "";
  const maxPrice = parseFloat(document.getElementById("maxPriceFilter")?.value);
  const selectedTags = Array.from(document.querySelectorAll(".tag-filter:checked")).map(cb => cb.value);

  // Start with all products
  let filtered = [...products];

  // Apply category filter
  if (category !== "all") {
    filtered = filtered.filter(p => p.tag === category);
  }

  // Apply name search
  if (searchTerm) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
  }

  // Apply max price filter
  if (!isNaN(maxPrice)) {
    filtered = filtered.filter(p => p.price <= maxPrice);
  }

  // Apply tag checkboxes
  if (selectedTags.length > 0) {
    filtered = filtered.filter(p =>
      p.tags && selectedTags.every(tag => p.tags.includes(tag))
    );
  }

  // Apply price sort
  if (sort === "low-high") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "high-low") {
    filtered.sort((a, b) => b.price - a.price);
  }

  // Render products
  if (filtered.length === 0) {
    productGrid.innerHTML = "<p>🚫 No products found matching filters.</p>";
    return;
  }

  filtered.forEach(product => {
    const encoded = encodeURIComponent(JSON.stringify(product));
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h4>${product.name}</h4>
      <p>₹${product.price}</p>
      <button onclick='addProductToCart("${encoded}")'>Add to Cart</button>
    `;
    productGrid.appendChild(card);
  });
};



window.addProductToCart = async (encoded) => {
  const product = JSON.parse(decodeURIComponent(encoded));
  const cartDoc = {
    name: product.name,
    price: product.price,
    tag: product.tag,
    timestamp: Date.now(),
    user: currentUserEmail
  };

  if (currentSharedCartId) {
    cartDoc.shared = currentSharedCartId;
  }

  try {
    await addDoc(collection(db, "cart"), cartDoc);

    // Optionally reload shared cart immediately
    if (currentSharedCartId) {
      loadSharedCart(currentSharedCartId);
    }
  } catch (e) {
    alert("Failed to add product: " + e.message);
  }
};


 window.createSharedCart = async () => {
  const invitedEmail = inviteEmailField.value.trim().toLowerCase();
  if (!invitedEmail) return alert("Enter an email to invite.");

  try {
    const cartRef = await addDoc(collection(db, "sharedCarts"), {
      owner: currentUserEmail,
      members: [currentUserEmail, invitedEmail],
      createdAt: new Date()
    });

    sharedCartStatus.innerText = `✅ Shared Cart Created! Cart ID: ${cartRef.id}`;
    inviteEmailField.value = "";
    currentSharedCartId = cartRef.id;
    loadSharedCart(cartRef.id);
    listUserSharedCarts(); // Refresh list
  } catch (e) {
    sharedCartStatus.innerText = "❌ Error: " + e.message;
  }
};
window.copySharedCartLink = () => {
  if (!currentSharedCartId) {
    alert("No shared cart selected.");
    return;
  }
  const link = `${window.location.origin}${window.location.pathname}?cartId=${currentSharedCartId}`;
  navigator.clipboard.writeText(link)
    .then(() => alert("🔗 Shared cart link copied!"))
    .catch(() => alert("❌ Failed to copy link."));
};
async function listUserSharedCarts() {
  const q = query(collection(db, "sharedCarts"));
  const snapshot = await getDocs(q);

  sharedCartList.innerHTML = "<h5>Your Shared Carts:</h5>";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const cartId = docSnap.id;

    if (data.members.includes(currentUserEmail)) {
      const container = document.createElement("div");
      container.style.marginBottom = "8px";

      const openBtn = document.createElement("button");
      openBtn.textContent = `🛒 Open (${cartId.slice(0, 6)}...)`;
      openBtn.onclick = () => loadSharedCart(cartId);
      container.appendChild(openBtn);

      if (data.owner === currentUserEmail) {
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑️ Delete";
        deleteBtn.style.marginLeft = "8px";
        deleteBtn.onclick = () => deleteSharedCart(cartId);
        container.appendChild(deleteBtn);
      }

      const leaveBtn = document.createElement("button");
      leaveBtn.textContent = "🚪 Leave";
      leaveBtn.style.marginLeft = "8px";
      leaveBtn.onclick = () => leaveSharedCart(cartId);
      container.appendChild(leaveBtn);

      sharedCartList.appendChild(container);
    }
  });
}


window.loadSharedCart = async (cartId) => {
  currentSharedCartId = cartId;
  const q = query(collection(db, "cart"));
  onSnapshot(q, (snapshot) => {
    const items = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.shared === cartId);
    renderSharedCart(items);
  });
};


// Cart Handling
function renderSharedCart(items) {
  const container = document.getElementById("sharedCartItems");
  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.innerHTML = "<p>No items in the shared cart.</p>";
    return;
  }

  let total = 0;
  const userContributions = {};

  items.forEach(item => {
    const contributor = item.user || "Unknown";
    total += item.price;

    userContributions[contributor] = (userContributions[contributor] || 0) + item.price;

    const div = document.createElement("div");
    div.className = "shared-cart-item";
   div.innerHTML = `
  <p><strong>${item.name}</strong></p>
  <p>Price: ₹${item.price}</p>
  <p>Added by: ${item.user}</p>
  <button onclick="removeSharedItem('${item.id}')">🗑 Remove</button>
  <hr />
`;

    container.appendChild(div);
  });

  // Bill summary
  const summary = document.createElement("div");
  summary.innerHTML = `<h4>Total: ₹${total}</h4><h5>Split Summary:</h5>`;
  Object.entries(userContributions).forEach(([user, amount]) => {
    summary.innerHTML += `<p>${user}: ₹${amount.toFixed(2)}</p>`;
  });

  // Even split (optional)
  if (currentSharedCartId && Object.keys(userContributions).length > 1) {
    const perPerson = total / Object.keys(userContributions).length;
    summary.innerHTML += `<p><strong>Even Split:</strong> ₹${perPerson.toFixed(2)} per person</p>`;
  }

  container.appendChild(summary);
}


window.removeItem = async (id) => {
  try {
    await deleteDoc(doc(db, "cart", id));
  } catch (e) {
    alert("Error removing item: " + e.message);
  }
};

// Budget Handling
window.saveBudget = async () => {
  const budget = parseFloat(budgetInput.value);
  if (isNaN(budget) || budget <= 0) return alert("Enter a valid budget.");

  try {
    await setDoc(doc(db, "budgets", currentUserUID), { budget });
    userBudget = budget;
    updateBudgetStatus();
    alert("Budget saved.");
  } catch (e) {
    alert("Failed to save budget: " + e.message);
  }
};

const loadUserBudget = async () => {
  const docSnap = await getDoc(doc(db, "budgets", currentUserUID));
  if (docSnap.exists()) {
    userBudget = docSnap.data().budget;
    budgetInput.value = userBudget;
  } else userBudget = 0;
};

const updateBudgetStatus = () => {
  const total = parseFloat(totalAmount.innerText.replace("₹", "")) || 0;
  if (userBudget > 0) {
    budgetStatus.innerText = total > userBudget
      ? `⚠️ Over budget by ₹${(total - userBudget).toFixed(2)}!`
      : `✅ Within budget: ₹${(userBudget - total).toFixed(2)} left`;
    budgetStatus.style.color = total > userBudget ? "red" : "green";
  } else {
    budgetStatus.innerText = "";
  }
};

/// AI Recommendations

// Predefined nutrition tag suggestions
const suggestedTags = [
  "monthly groceries",
  "hygiene",
  "personal care",
  "high protein",
  "low carb",
  "diabetic friendly",
  "baby care",
  "festival"
];

// Inject tag suggestions UI
const tagSuggestionContainer = document.getElementById("tag-suggestions");
if (tagSuggestionContainer) {
  suggestedTags.forEach(tag => {
    const btn = document.createElement("button");
    btn.innerText = tag;
    btn.className = "tag-suggestion-button";
    btn.onclick = () => {
      recoInput.value = tag;
    };
    tagSuggestionContainer.appendChild(btn);
  });
}
window.getRecommendations = async () => {
  const userQuery = document.getElementById("recommendPrompt").value.trim();
  const budget = parseFloat(document.getElementById("aiBudgetInput").value);

  if (!userQuery || isNaN(budget) || budget <= 0) {
    alert("Enter a valid question and budget.");
    return;
  }

  try {
    document.getElementById("aiTextSection").innerHTML = `<p>⏳ Generating recommendations...</p>`;
    document.getElementById("aiProductsSection").innerHTML = "";

    const response = await fetch("http://127.0.0.1:5000/ai-recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: currentUserEmail,
        query: userQuery,
        budget
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      alert("Server error: " + errorText);
      document.getElementById("aiTextSection").innerHTML = "";
      return;
    }

    const result = await response.json();

    console.log("AI result →", result);
    console.log("🎯 Matched Products:", result.matched_products);

    // Clear text section
    document.getElementById("aiTextSection").innerHTML = "";

    // Add AI recommendation text
    const recommendationHTML = `
      <div class="recommendation-section">
        <h3>🧠 AI Recommendation</h3>
        <p>${result.recommendation}</p>
      </div>
    `;
    document.getElementById("aiTextSection").insertAdjacentHTML("beforeend", recommendationHTML);

    // Show ingredients if any
    if (result.ingredients?.length > 0) {
      const ingredientsHTML = `
        <div class="ingredients-section">
          <h4>🔎 Ingredients Detected:</h4>
          <ul>
            ${result.ingredients.map(ing => `<li>${ing}</li>`).join("")}
          </ul>
        </div>
      `;
      document.getElementById("aiTextSection").insertAdjacentHTML("beforeend", ingredientsHTML);
    }

    // Render product cards
    renderAIRecommendations(result.matched_products || []);

  } catch (err) {
    console.error("Fetch error:", err);
    alert("Failed to fetch recommendations.");
    document.getElementById("aiTextSection").innerHTML = "";
    document.getElementById("aiProductsSection").innerHTML = "";
  }
};
function renderAIRecommendations(products) {
  const grid = document.getElementById("aiProductsSection");
  if (!grid) {
    console.error("❌ aiProductsSection not found in DOM!");
    return;
  }
  grid.innerHTML = "";

  if (!Array.isArray(products) || products.length === 0) {
    grid.innerHTML = "<p>🚫 No matching products found.</p>";
    return;
  }

  const seen = new Set();

  products.forEach(product => {
    const key = product.name?.toLowerCase() || "";
    if (seen.has(key)) return;
    seen.add(key);

    const encoded = encodeURIComponent(JSON.stringify(product));
    const imageSrc = product.image?.startsWith("http")
      ? product.image
      : "https://dummyimage.com/150x150/cccccc/000000&text=No+Image";

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${imageSrc}" alt="${product.name}" onerror="this.src='https://dummyimage.com/150x150/cccccc/000000&text=No+Image'" />
      <h4>${product.name}</h4>
      <p>₹${product.price}</p>
      <button onclick='addProductToCart("${encoded}")'>Add to Cart</button>
    `;

    grid.appendChild(card);
  });
}



// Preferences
window.savePreferences = async () => {
  const selected = Array.from(document.querySelectorAll(".pref-checkbox:checked")).map(cb => cb.value);
  try {
    await setDoc(doc(db, "users", currentUserEmail), { preferences: selected }, { merge: true });
    alert("Preferences saved!");
  } catch (e) {
    alert("Error saving preferences: " + e.message);
  }
};

const loadPreferences = async () => {
  try {
    const docSnap = await getDoc(doc(db, "users", currentUserEmail));
    if (docSnap.exists()) {
      const prefs = docSnap.data().preferences || [];
      document.querySelectorAll(".pref-checkbox").forEach(cb => {
        cb.checked = prefs.includes(cb.value);
      });
    }
  } catch (e) {
    console.error("Error loading preferences:", e.message);
  }
};
function renderCart(snapshot) {
  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const cartItems = items.filter(item => !item.shared); // Filter out shared cart items
  cartList.innerHTML = "";
  let total = 0;

  cartItems.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} - ₹${item.price}
      <button onclick="removeItem('${item.id}')">Remove</button>
    `;
    cartList.appendChild(li);
    total += item.price;
  });

  totalAmount.innerText = `₹${total.toFixed(2)}`;
  updateBudgetStatus();
}



// 🗑️ Delete shared cart (make it global so inline onclick works)
window.deleteSharedCart = async (cartId) => {
  const confirmDelete = confirm("Are you sure you want to delete this shared cart?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "sharedCarts", cartId));
    // also remove its items…
    const q = query(collection(db, "cart"));
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      if (docSnap.data().shared === cartId) {
        await deleteDoc(doc(db, "cart", docSnap.id));
      }
    }
    alert("Shared cart deleted.");
    listUserSharedCarts();
    document.getElementById("sharedCartItems").innerHTML = "";
  } catch (err) {
    console.error(err);
    alert("Failed to delete shared cart.");
  }
};

// 🚪 Leave shared cart (make it global so inline onclick works)
window.leaveSharedCart = async (cartId) => {
  const cartRef = doc(db, "sharedCarts", cartId);
  const cartSnap = await getDoc(cartRef);
  if (!cartSnap.exists()) return alert("Cart not found.");

  const data = cartSnap.data();
  const updated = data.members.filter(e => e !== currentUserEmail);

  if (updated.length === 0) {
    // last member leaves → delete it
    await window.deleteSharedCart(cartId);
  } else {
    await setDoc(cartRef, { members: updated }, { merge: true });
    alert("You’ve left the shared cart.");
    listUserSharedCarts();
    document.getElementById("sharedCartItems").innerHTML = "";
  }
};

window.joinSharedCart = async () => {
  const joinCartId = document.getElementById("joinCartIdInput").value.trim();
  const statusEl = document.getElementById("joinCartStatus");

  if (!joinCartId) {
    statusEl.innerText = "❗ Please enter a Cart ID.";
    return;
  }

  const cartRef = doc(db, "sharedCarts", joinCartId);
  try {
    const cartSnap = await getDoc(cartRef);
    if (!cartSnap.exists()) {
      statusEl.innerText = "❌ No such cart exists.";
      return;
    }

    const cartData = cartSnap.data();
    if (!cartData.members.includes(currentUserEmail)) {
      await setDoc(cartRef, {
        ...cartData,
        members: [...cartData.members, currentUserEmail]
      });
      statusEl.innerText = `✅ Joined cart (${joinCartId.slice(0, 6)}...) successfully.`;
    } else {
      statusEl.innerText = "⚠️ You are already a member of this cart.";
    }

    currentSharedCartId = joinCartId;
    loadSharedCart(joinCartId);
    listUserSharedCarts();
  } catch (e) {
    statusEl.innerText = "❌ Error joining cart: " + e.message;
  }
};
window.removeSharedItem = async (id) => {
  const itemRef = doc(db, "cart", id);
  const itemSnap = await getDoc(itemRef);
  const item = itemSnap.data();

  // Optional: Only allow remover if the current user added it
  if (item.user !== currentUserEmail) {
    alert("❌ You can only remove your own items.");
    return;
  }

  try {
    await deleteDoc(itemRef);
    alert("✅ Item removed.");
  } catch (e) {
    alert("❌ Failed to remove item: " + e.message);
  }
};
window.switchToPersonalCart = () => {
  currentSharedCartId = null;
  alert("✅ Switched to personal cart.");
};

function generateUpiLink(upiId, name, amount, note) {
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;
}

function showPaymentQR(upiUrl) {
  const qrDiv = document.getElementById("upiQr");
  qrDiv.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiUrl)}&size=250x250" alt="UPI QR Code">`;
}

// Save UPI
async function saveMyUpiId() {
  const upiId = document.getElementById("userUpiId").value.trim();

  if (!upiId) {
    alert("Please enter a valid UPI ID.");
    return;
  }

  if (!currentUserEmail) {
    alert("Not logged in.");
    return;
  }

  try {
    const userDocRef = doc(db, "users", currentUserEmail);
    await setDoc(userDocRef, { upiId }, { merge: true });
    alert("✅ UPI ID saved!");
  } catch (e) {
    console.error("Error saving UPI ID:", e);
    alert("Error saving UPI ID.");
  }
  document.getElementById("saveUpiBtn").addEventListener("click", saveMyUpiId);
}

// Load UPI
async function loadMyUpiId() {
  if (!currentUserEmail) {
    console.warn("No user logged in - cannot load UPI ID.");
    return;
  }

  try {
    const userDocRef = doc(db, "users", currentUserEmail);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.upiId) {
        console.log("Loaded saved UPI ID:", data.upiId);
        document.getElementById("userUpiId").value = data.upiId;
      }
    }
  } catch (e) {
    console.error("Error loading UPI ID:", e);
  }
}

function generateUpiPayment() {
  const upiId = document.getElementById("userUpiId").value.trim();
  const amount = document.getElementById("upiAmount").value.trim();

  if (!upiId) {
    alert("Please enter your UPI ID.");
    return;
  }

  if (!amount || Number(amount) <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  const payeeName = "CoBudget User";
  const note = "Payment via CoBudget";

  const upiURL = generateUpiLink(
    upiId,
    payeeName,
    amount,
    note
  );
  document.getElementById("generateUpiBtn").addEventListener("click", generateUpiPayment);


  const link = document.getElementById("upiLink");
  link.href = upiURL;
  link.style.display = "inline-block";

  showPaymentQR(upiURL);
}
window.payMyShare = async () => {
  if (!currentSharedCartId) {
    alert("No shared cart selected.");
    return;
  }

  const cartRef = collection(db, "cart");
  const snapshot = await getDocs(cartRef);
  const sharedItems = snapshot.docs
    .map(doc => doc.data())
    .filter(item => item.shared === currentSharedCartId);

  if (sharedItems.length === 0) {
    alert("🛒 Shared cart is empty.");
    return;
  }

  const userTotals = {};
  let total = 0;

  sharedItems.forEach(item => {
    const user = item.user || "Unknown";
    userTotals[user] = (userTotals[user] || 0) + item.price;
    total += item.price;
  });

  const members = Object.keys(userTotals);
  const evenSplit = total / members.length;
  const myPaid = userTotals[currentUserEmail] || 0;
  const myOwe = evenSplit - myPaid;

  if (myOwe <= 0) {
    alert(`✅ You're all settled up! You paid ₹${myPaid.toFixed(2)}.`);
    return;
  }

  // Fetch UPI IDs
  const userUpiIds = {};
  for (const user of members) {
    const docSnap = await getDoc(doc(db, "users", user));
    if (docSnap.exists()) {
      userUpiIds[user] = docSnap.data().upiId || "";
    }
  }

  const amountsOwed = {};
  let amountLeft = myOwe;

  for (const user of members) {
    if (user === currentUserEmail) continue;

    const paid = userTotals[user];
    const excess = paid - evenSplit;

    if (excess > 0 && amountLeft > 0) {
      const amountToPay = Math.min(excess, amountLeft);
      amountsOwed[user] = amountToPay;
      amountLeft -= amountToPay;
    }
  }

  const container = document.getElementById("sharedCartItems");
  container.innerHTML = `<h3>💳 Payments Needed</h3>`;

  if (Object.keys(amountsOwed).length === 0) {
    container.innerHTML += `<p>✅ You're all settled up with everyone.</p>`;
    return;
  }

  const [firstUser, amount] = Object.entries(amountsOwed)[0];

  const upiId = userUpiIds[firstUser];
  if (!upiId) {
    container.innerHTML += `<p>⚠️ ${firstUser} has not saved their UPI ID.</p>`;
    return;
  }

  const upiUrl = generateUpiLink(
    upiId,
    firstUser,
    amount,
    `Shared cart ${currentSharedCartId}`
  );

  showPaymentQR(upiUrl);

  container.innerHTML += `
    <p>💸 You owe <strong>${firstUser}</strong>: ₹${amount.toFixed(2)}</p>
    <a id="upiPaymentLink" href="${upiUrl}" target="_blank" style="display:inline-block;">
      <button>Pay Now via UPI App</button>
    </a>
  `;
};
onAuthStateChanged(auth, async user => {
  const show = (id, visible) => {
    const el = document.getElementById(id);
    if (el) el.style.display = visible ? "block" : "none";
  };

  if (user) {
    currentUserEmail = user.email;
    currentUserUID = user.uid;
    userEmailSpan.innerText = user.email;

    try {
      const userDocRef = doc(db, "users", user.email);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          needs: "groceries",
          budget: 1000,
          preferences: "affordable",
          event: "monthly shopping"
        });
      } else {
        const data = userSnap.data();
        if (data.upiId) {
          console.log("✅ Loaded saved UPI ID:", data.upiId);
          // automatically fill the UPI input field
          const upiInput = document.getElementById("userUpiId");
          if (upiInput) upiInput.value = data.upiId;
        } else {
          console.log("ℹ️ No UPI ID saved yet.");
        }
      }
    } catch (e) {
      console.error("Error loading user context:", e);
    }

    show("auth-container", false);
    show("welcome-section", true);
    show("budget-section", true);
    show("cart-section", true);
    show("product-section", true);
    show("recommendation-section", true);
    show("preferences-section", true);
    show("sharedCartControls", true);
    show("ai-section", true);
    show("upiPayment", true);

    await loadUserBudget();
    await loadPreferences();
    await listUserSharedCarts();
    renderProducts();

    // ✅ Only call loadMyUpiId if we have currentUserEmail
    if (currentUserEmail) {
      try {
        await loadMyUpiId();
      } catch (e) {
        console.warn("Could not load UPI ID:", e);
      }
    }

    // Tag filters
    const tagCheckboxContainer = document.getElementById("tagCheckboxes");
    if (tagCheckboxContainer) {
      tagCheckboxContainer.innerHTML = "";
      availableTags.forEach(tag => {
        const label = document.createElement("label");
        label.style.marginRight = "10px";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = tag;
        checkbox.className = "tag-filter";

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + tag));
        tagCheckboxContainer.appendChild(label);

        checkbox.addEventListener("change", renderProducts);
      });
    }

    // Shared cart invites
    const urlParams = new URLSearchParams(window.location.search);
    const invitedCartId = urlParams.get("cartId");
    if (invitedCartId) {
      try {
        const cartRef = doc(db, "sharedCarts", invitedCartId);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
          const data = cartSnap.data();
          if (!data.members.includes(currentUserEmail)) {
            await setDoc(cartRef, {
              ...data,
              members: [...data.members, currentUserEmail]
            });
            alert("✅ You have been added to the shared cart.");
          }
          currentSharedCartId = invitedCartId;
          loadSharedCart(invitedCartId);
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          alert("❌ Invalid shared cart link.");
        }
      } catch (e) {
        console.error("Error handling shared cart invite:", e);
      }
    }

    const cartQuery = query(collection(db, "cart"));
    onSnapshot(cartQuery, renderCart);

  } else {
    show("auth-container", true);
    show("welcome-section", false);
    show("budget-section", false);
    show("cart-section", false);
    show("product-section", false);
    show("recommendation-section", false);
    show("preferences-section", false);
    show("sharedCartControls", false);
    show("ai-section", true);
    show("upiPayment", false);
  }
});

// Filters
const catFilter = document.getElementById("categoryFilter");
if (catFilter) {
  catFilter.addEventListener("change", renderProducts);
}

const sortSelect = document.getElementById("priceSort");
if (sortSelect) {
  sortSelect.addEventListener("change", renderProducts);
}

const searchInput = document.getElementById("productSearch");
if (searchInput) {
  let debounce;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(renderProducts, 300);
  });
}

const maxPrice = document.getElementById("maxPriceFilter");
if (maxPrice) {
  maxPrice.addEventListener("input", renderProducts);
}
window.onload = () => {
  const saveBtn = document.getElementById("saveUpiBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveMyUpiId);
  }

  const genUpiBtn = document.getElementById("generateUpiBtn");
  if (genUpiBtn) {
    genUpiBtn.addEventListener("click", generateUpiPayment);
  }
};



