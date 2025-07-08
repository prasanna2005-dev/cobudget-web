import firebase_admin
from firebase_admin import credentials, firestore

# Path to your service account key
cred = credentials.Certificate(r"C:\Users\user\Downloads\firebase-service-key.json")
firebase_admin.initialize_app(cred)

# Now get Firestore client via firebase_admin
db = firestore.client()
products = [
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
        "image": "https://via.placeholder.com/150"
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
        "image": "https://via.placeholder.com/150"
    },
    {
        "name": " Oats",
        "price": 150,
        "tag": "heart health, healthy food, oats",
        "nutrition": ["whole grain", "fiber"],
        "image": "https://via.placeholder.com/150"
    },
    {
        "name": "California Almonds 250g",
        "price": 300,
        "tag": "heart health, nuts",
        "nutrition": ["vitamin E", "healthy fats"],
        "image": "https://via.placeholder.com/150"
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
        "image": "https://via.placeholder.com/150"
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
        "image": "https://via.placeholder.com/150"
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


# Upload to Firestore
for product in products:
    db.collection("products").add(product)

print("✅ Products uploaded successfully.")
