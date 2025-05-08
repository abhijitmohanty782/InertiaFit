# Step-by-Step Guide to Run InertiaFit Application

## Prerequisites
- Python 3.8 or higher
- Node.js and npm
- The recipes.csv file in the backend/datasets directory

## Step 1: Start the Flask Backend Server

Open PowerShell and run these commands:

```powershell
# Navigate to the project directory
cd C:\Users\abhij\Desktop\Project\inertiafit

# Navigate to the backend directory
cd backend

# Start the Flask server
python app.py
```

You should see a message like:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

Leave this PowerShell window open and running.

## Step 2: Verify the Flask server is working

Open a web browser and go to:
- http://localhost:5000/api/health

You should see a JSON response that says the API is running.

## Step 3: Start the React Frontend

Open a new PowerShell window and run these commands:

```powershell
# Navigate to the project directory
cd C:\Users\abhij\Desktop\Project\inertiafit

# Start the React app
npm start
```

This will start the React development server and automatically open a browser window at http://localhost:3000 or another port (like 3001, 3003).

## Step 4: Test the Nutrition Page

1. In the browser, navigate to the Nutrition page from the navbar
2. Fill out the form with your details
3. Click "Generate Recommendations"
4. You should see your personalized nutrition plan

## Troubleshooting

### If the frontend fails to compile with TailwindCSS errors:

```powershell
# Install the required TailwindCSS package
npm install -D @tailwindcss/postcss

# Ensure postcss.config.js has the correct configuration:
# module.exports = {
#   plugins: {
#     '@tailwindcss/postcss': {},
#     autoprefixer: {},
#   }
# }
```

### If the backend fails to start:

```powershell
# Install the required Python packages
pip install flask flask-cors pandas==2.0.3 numpy==1.24.3 scikit-learn==1.3.0
```

### If you get "Failed to fetch" errors:

Make sure the Flask server is running at http://localhost:5000 and check the browser console for more specific error messages.

### Important Notes for PowerShell:

- PowerShell doesn't support the `&&` operator for chaining commands like bash does
- Use separate commands or use semicolons `;` instead
- Always run the backend and frontend in separate PowerShell windows 