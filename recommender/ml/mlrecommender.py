from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import firebase_admin
from firebase_admin import credentials, firestore

# Firebase initialization
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-small")
model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-small")

def get_user_context(email):
    user_ref = db.collection("users").document(email)
    user_data = user_ref.get().to_dict()
    return user_data or {}

def generate_prompt(user_context):
    needs = user_context.get("needs", "groceries")
    budget = user_context.get("budget", 200)
    preferences = user_context.get("preferences", "healthy and affordable")
    event = user_context.get("event", "monthly shopping")

    return f"Suggest a list of Walmart products for {event} under ₹{budget} that are {preferences} and cover {needs}."

def get_recommendations(prompt, max_len=200):
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=max_len)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

def store_recommendation(email, prompt, result):
    doc_ref = db.collection("recommendations").document()
    doc_ref.set({
        "email": email,
        "prompt": prompt,
        "result": result
    })

def recommend_for_user(email):
    user_context = get_user_context(email)
    if not user_context:
        return "User not found or missing context."

    prompt = generate_prompt(user_context)
    result = get_recommendations(prompt)
    store_recommendation(email, prompt, result)
    return result

if __name__ == "__main__":
    email = input("Enter your email: ").strip()
    recommendation = recommend_for_user(email)
    print("\n🛒 Recommendation:\n", recommendation)