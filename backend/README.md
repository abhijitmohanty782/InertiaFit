# InertiaFit Backend API

This is the backend API for InertiaFit's Personalized Food Recommendation System.

## Setup

1. Install Python dependencies:
```
pip install -r requirements.txt
```

2. Make sure you have the dataset:
The recipes.csv file should be in the `datasets` folder.

## Running the Backend

To start the Flask server:
```
python app.py
```

The server will run on http://localhost:5000

## API Endpoints

### Health Check
- **URL**: `/api/health`
- **Method**: `GET`
- **Response**: 
```json
{
  "status": "up",
  "message": "Flask API is running"
}
```

### Nutrition Recommendations
- **URL**: `/api/nutrition`
- **Method**: `POST`
- **Body**:
```json
{
  "age": 30,
  "height": 175,
  "weight": 70,
  "gender": "Male",
  "activityLevel": "Moderate exercise",
  "weightGoal": "Maintain"
}
```
- **Response**: Personalized nutrition recommendations including BMI, calorie needs, macronutrients, and food suggestions.

## Integration with Frontend

The React frontend makes requests to this API to generate personalized nutrition plans.
To run the complete application:
1. Start this Flask backend server
2. Start the React frontend in a separate terminal window