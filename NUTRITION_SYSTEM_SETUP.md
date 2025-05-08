# InertiaFit Personalized Food Recommendation System Setup

This guide helps you set up and run the complete personalized food recommendation system for InertiaFit.

## Prerequisites

1. Python 3.8+ with pip
2. Node.js and npm
3. The recipes.csv dataset file

## Setup Instructions

### Step 1: Set up the Backend

1. Navigate to the backend directory:
```
cd backend
```

2. Install the Python dependencies:
```
pip install -r requirements.txt
```

3. Make sure the `recipes.csv` file is placed in the `backend/datasets/` directory. 
   - If you don't have this file, ask your team for a copy.
   - DO NOT modify this file.

### Step 2: Set up the Frontend

1. From the root project directory, install the npm dependencies:
```
npm install
```

2. The frontend should already be configured to connect to the backend API at http://localhost:5000.

## Running the System

### Option 1: Using the batch script (Windows)

1. Simply run the `startServers.bat` file by double-clicking it or running:
```
.\startServers.bat
```

This will start both the backend and frontend servers in separate command windows.

### Option 2: Manual start

1. Start the backend server:
```
cd backend
python app.py
```

2. In a separate terminal window, start the frontend server:
```
npm start
```

## Accessing the Application

- The backend API will be running at: http://localhost:5000
- The frontend application will be running at: http://localhost:3000 or http://localhost:3001

Navigate to the frontend URL in your browser to access the InertiaFit application.

## Using the Nutrition System

1. Navigate to the "Nutrition" page using the navbar
2. Fill out the form with your personal details:
   - Age
   - Height (in cm)
   - Weight (in kg)
   - Gender
   - Activity level
   - Weight goal (lose, maintain, or gain)
3. Click "Generate Recommendations"
4. View your personalized nutrition plan, including:
   - BMI calculation and category
   - Recommended daily calorie intake
   - Macronutrient breakdown (protein, carbs, fats)
   - Recommended food suggestions
   - Meal plan ideas
5. Optionally download your meal plan as a PDF

## Troubleshooting

1. **Backend server won't start:**
   - Make sure Python and required packages are installed
   - Check that the datasets directory contains recipes.csv
   - Look for error messages in the terminal

2. **Frontend can't connect to backend:**
   - Ensure the backend server is running on port 5000
   - Check for CORS errors in the browser console
   - Verify the API URL in the frontend code is correct

3. **Frontend display issues:**
   - Make sure @tailwindcss/postcss is installed correctly
   - Check that you're using a modern browser
   - Clear browser cache if changes aren't reflected

For any other issues, contact the development team for assistance. 