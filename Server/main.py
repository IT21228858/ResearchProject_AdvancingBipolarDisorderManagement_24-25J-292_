from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Load and preprocess the dataset
data = pd.read_csv('Updated_Bipolar_Dataset.csv')
data = data.fillna('')

# Map gender to numerical values
gender_map = {'Male': 1, 'Female': 0}
data['Gender_numeric'] = data['Gender'].map(gender_map)

# One-hot encode 'Bipolar Stage' and 'Mood'
encoder = OneHotEncoder(sparse_output=False)
encoded_features = encoder.fit_transform(data[['Bipolar Stage', 'Mood']])
encoded_df = pd.DataFrame(encoded_features, columns=encoder.get_feature_names_out(['Bipolar Stage', 'Mood']))
data = data.join(encoded_df)

# TF-IDF vectorization for text columns
vectorizer = TfidfVectorizer()
text_features = vectorizer.fit_transform(data['Recommended Activities'] + " " + data['Suggestions'])

# Scale numerical features
scaler = StandardScaler()
data[['Age_scaled', 'Gender_scaled']] = scaler.fit_transform(data[['Age', 'Gender_numeric']])

# Combine all features
combined_features = np.hstack((text_features.toarray(), encoded_features, data[['Age_scaled', 'Gender_scaled']].to_numpy()))

# Define FastAPI app
app = FastAPI()

# Define the input model for the API
class UserInput(BaseModel):
    mood: str
    bipolar_stage: str
    age: int
    gender: str

    @validator("gender")
    def validate_gender(cls, value):
        if value not in gender_map:
            raise ValueError("Invalid gender. Please choose 'Male' or 'Female'.")
        return value

    @validator("age")
    def validate_age(cls, value):
        if value <= 0:
            raise ValueError("Age must be a positive integer.")
        return value

    @validator("bipolar_stage")
    def validate_bipolar_stage(cls, value):
        if value not in data['Bipolar Stage'].unique():
            raise ValueError(f"Invalid bipolar stage. Valid options are: {', '.join(data['Bipolar Stage'].unique())}.")
        return value

@app.post("/recommendations/")
def get_recommendations(user_input: UserInput):
    # Encode user input
    user_encoded = encoder.transform([[user_input.bipolar_stage, user_input.mood]])
    user_numerical = scaler.transform([[user_input.age, gender_map[user_input.gender]]])
    user_input_vector = np.hstack((np.zeros(text_features.shape[1]), user_encoded.flatten(), user_numerical.flatten()))

    # Calculate similarity
    similarity = cosine_similarity(combined_features, user_input_vector.reshape(1, -1))
    sorted_indices = similarity.flatten().argsort()[::-1]  # Sort by descending similarity

    # Collect recommendations strictly based on similarity score order
    activities, suggestions = [], []
    for idx in sorted_indices:
        if len(activities) >= 5 and len(suggestions) >= 5:
            break  # Exit if enough recommendations are gathered

        activity = data['Recommended Activities'].iloc[idx]
        suggestion = data['Suggestions'].iloc[idx]
        if activity not in activities:
            activities.append(activity)
        if suggestion not in suggestions:
            suggestions.append(suggestion)

    # Return the collected recommendations
    return {
        "message": f"Recommendations for {user_input.bipolar_stage}",
        "activities": activities[:5],
        "suggestions": suggestions[:5]
    }
