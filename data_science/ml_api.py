from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pickle
import pandas as pd
import os
import uvicorn

app = FastAPI()

# This tells the firewall: "It's okay for Next.js to talk to me!"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading AI Brain...")
model_path = os.path.join(os.path.dirname(__file__), "attendance_model.pkl")
with open(model_path, "rb") as file:
    model = pickle.load(file)
print("AI Brain Loaded and Ready!")

@app.get("/predict")
def predict_attendance(tickets: int):
    # Ask the AI to make a prediction based on the tickets
    df = pd.DataFrame({"tickets_sold": [tickets]})
    prediction = model.predict(df)[0]
    
    return {
        "tickets_sold": tickets, 
        "predicted_attendance": int(prediction),
        "confidence": "High (Linear Regression)"
    }

# Run the server on port 8000
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)