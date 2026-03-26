import pandas as pd
from sklearn.linear_model import LinearRegression
import pickle
import os

print("🤖 Starting AI Training Process...")

# 1. Create offline training data (Tickets Sold vs. Actual Attendees)
# (In a real company, you'd pull this from a database, but we are bypassing your firewall!)
data = {
    "tickets_sold": [50, 100, 150, 200, 250, 300, 400, 500, 1000],
    "actual_attendees": [35, 72, 101, 145, 170, 215, 290, 360, 701] 
}

df = pd.DataFrame(data)

# 2. Separate Features (X) and Target (y)
X = df[["tickets_sold"]] # What we know
y = df["actual_attendees"] # What we want to predict

# 3. Train the Machine Learning Model
model = LinearRegression()
model.fit(X, y)

print("✅ Model trained successfully!")

# 4. Save the trained AI model to a file so our app can use it
model_path = os.path.join(os.path.dirname(__file__), "attendance_model.pkl")
with open(model_path, "wb") as file:
    pickle.dump(model, file)

print(f"💾 AI Model saved locally at: {model_path}")