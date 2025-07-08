from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
import requests
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Firebase setup
cred = credentials.Certificate(r"C:\Users\user\Downloads\firebase-service-key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

MISTRAL_API_KEY = "wCT3Stk1LKgDUpTbSKlBR6irHoufxP2N"
@app.route("/ai-recommend", methods=["POST"])
def ai_recommend():
    data = request.get_json()
    email = data.get("email", "")
    user_query = data.get("query", "").strip()
    budget = data.get("budget", 300)

    if not user_query:
        return jsonify({"error": "Empty query"}), 400

    # Step 1: Ask Mistral AI
    payload = {
        "model": "mistral-tiny",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a helpful grocery shopping assistant. "
                    "Suggest {user_query} items available in India under ₹{budget}. "
                    "List items in a numbered list, no explanations or extra text."
                )
            },
            {
                "role": "user",
                "content": f"I'm looking for: {user_query}. Limit items under ₹{budget}."
            }
        ],
        "temperature": 0.7
    }

    try:
        url = "https://api.mistral.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {MISTRAL_API_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        completion = response.json()
        result = completion["choices"][0]["message"]["content"]

        # Extract ingredients
        def extract_ingredients(text):
            lines = text.split("\n")
            ingredients = []
            for line in lines:
                match = re.match(r"\d+\.\s*(.+)", line)
                if match:
                    ingredients.append(match.group(1).strip())
                elif "," in line:
                    ingredients.extend(item.strip() for item in line.split(","))
                elif line.strip():
                    ingredients.append(line.strip())
            return ingredients

        ingredients = extract_ingredients(result)

    except Exception as e:
        return jsonify({"error": "AI generation failed", "details": str(e)}), 500

    # Step 2: Matching logic
    def normalize(text):
        text = re.sub(r'\s+', ' ', text.strip().lower())
        return text

    def clean_and_split(text):
        text = re.sub(r'\(.*?\)', '', text)
        text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
        return set(text.lower().strip().split())

    # Load all products
    products_ref = db.collection("products").stream()
    all_products = [doc.to_dict() for doc in products_ref]

    matched_products = []
    unmatched_ingredients = []

    # Step 3: Exact match by normalized name
    name_to_product = {
        normalize(prod.get("name", "")): prod for prod in all_products
    }

    for ing in ingredients:
        ing_norm = normalize(ing)
        if ing_norm in name_to_product:
            product = name_to_product[ing_norm]
            if product.get("price", 0) <= budget:
                matched_products.append(product)
        else:
            unmatched_ingredients.append(ing)

    # Step 4: Fallback fuzzy match
    for ing in unmatched_ingredients:
        ing_words = clean_and_split(ing)

        for product in all_products:
            name = product.get("name", "")
            product_words = clean_and_split(name)
            common = ing_words & product_words

            if len(common) >= 1 and product.get("price", 0) <= budget:
                matched_products.append(product)
                break  # stop at first fuzzy match

    # Step 5: Save to Firestore
    if email:
        db.collection("recommendations").add({
            "email": email,
            "prompt": user_query,
            "result": result,
            "ingredients": ingredients
        })

    return jsonify({
        "prompt": user_query,
        "recommendation": result,
        "ingredients": ingredients,
        "matched_products": matched_products
    })


if __name__ == "__main__":
    app.run(debug=True)
