from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from random import uniform as rnd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import os
from python.customized_recommendation_system import Recommendation
import json
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, datetime
from bson.objectid import ObjectId
from bson.errors import InvalidId
import re

app = Flask(__name__)
# Configure CORS properly to allow requests from frontend
CORS(app, resources={r"/*": {
    "origins": ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
    "supports_credentials": True
}})

# Custom JSON encoder to handle NaN values and other non-serializable types
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, float) and (np.isnan(obj) or np.isinf(obj)):
            return None  # Convert NaN/inf to None
        if isinstance(obj, (np.int_, np.intc, np.intp, np.int8, np.int16, np.int32, np.int64)):
            return int(obj)
        if isinstance(obj, (np.float_, np.float16, np.float32, np.float64)):
            return float(obj)
        if isinstance(obj, (np.ndarray,)):
            return obj.tolist()
        return super(CustomJSONEncoder, self).default(obj)

# Configure Flask to use the custom JSON encoder
app.json_encoder = CustomJSONEncoder

# Configuration
app.config["MONGO_URI"] = "mongodb+srv://Amritesh:OpPgCVoOPpakzgoc@cluster0.rdwmp.mongodb.net/inertiafit?retryWrites=true&w=majority"
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET', 'super-secret-key')
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

# Initialize extensions
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Nutrition values used for food recommendations
nutrition_features = ['calories', 'fatcontent', 'saturatedfatcontent', 'cholesterolcontent', 'sodiumcontent', 
                     'carbohydratecontent', 'fibercontent', 'sugarcontent', 'proteincontent']

# Use this placeholder for missing images
IMAGE_NOT_FOUND = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnU3am03cGpvdnE5MDlsNGt0bG03cnppZDVybmJoY2V3c29taXBpdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pVbhJvVUYqx2A8oT8G/giphy.gif'

# ML Model for food recommendation using KNN
def get_recommended_recipes(target_calories, top_n=3):
    print(f"Starting recipe recommendation for {target_calories} calories")
    try:
        # Get recipes from MongoDB
        recipes = list(mongo.db.FoodDataLite.find())
        
        if not recipes:
            print("ERROR: No recipes found in database")
            return []
        
        # Convert recipes to feature matrix
        X = []
        valid_recipes = []
        
        for recipe in recipes:
            try:
                features = [
                    float(recipe.get('calories', 0)),
                    float(recipe.get('fatcontent', 0)),
                    float(recipe.get('saturatedfatcontent', 0)),
                    float(recipe.get('cholesterolcontent', 0)),
                    float(recipe.get('sodiumcontent', 0)),
                    float(recipe.get('carbohydratecontent', 0)),
                    float(recipe.get('fibercontent', 0)),
                    float(recipe.get('sugarcontent', 0)),
                    float(recipe.get('proteincontent', 0))
                ]
                X.append(features)
                valid_recipes.append(recipe)
            except (ValueError, TypeError):
                continue
        
        if not valid_recipes:
            print("ERROR: No valid recipes found after filtering")
            return []
        
        X = np.array(X)
        
        # Normalize the data
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train KNN model
        print("Training KNN model...")
        knn = NearestNeighbors(n_neighbors=min(top_n, len(valid_recipes)), metric='cosine')
        knn.fit(X_scaled)
        
        # Generate target nutrition profile based on meal calories
        protein_target = rnd(target_calories * 0.25 / 4, target_calories * 0.35 / 4)
        carbs_target = rnd(target_calories * 0.45 / 4, target_calories * 0.65 / 4)
        fat_target = rnd(target_calories * 0.2 / 9, target_calories * 0.35 / 9)
        
        target_nutrition = np.array([
            target_calories,
            fat_target,
            fat_target * 0.3,
            protein_target * 3,
            target_calories * 0.2,
            carbs_target,
            carbs_target * 0.15,
            carbs_target * 0.2,
            protein_target
        ])
        
        # Scale the target nutrition values
        target_scaled = scaler.transform([target_nutrition])
        
        # Find nearest neighbors
        distances, indices = knn.kneighbors(target_scaled)
        
        # Get recommended recipes
        recommendations = []
        for idx in indices[0]:
            recipe = valid_recipes[idx]
            # Clean and format recipe data
            clean_recipe = {
                'name': str(recipe.get('name', 'Recipe')),
                'calories': float(recipe.get('calories', 0)),
                'recipeingredientparts': recipe.get('recipeingredientparts', []),
                'cooktime': str(recipe.get('cooktime', 'PT30M')),
                'preptime': str(recipe.get('preptime', 'PT15M')),
                'totaltime': str(recipe.get('totaltime', 'PT45M')),
                'images': recipe.get('images', []),
                'recipeinstructions': recipe.get('recipeinstructions', []),
                'nutrition': {
                    'protein': float(recipe.get('proteincontent', 0)),
                    'carbs': float(recipe.get('carbohydratecontent', 0)),
                    'fats': float(recipe.get('fatcontent', 0))
                }
            }
            
            # Convert string lists to actual lists if needed
            if isinstance(clean_recipe['recipeingredientparts'], str):
                if clean_recipe['recipeingredientparts'].startswith('c('):
                    # Handle R-style vectors
                    parts = clean_recipe['recipeingredientparts'].strip('c()').split(',')
                    clean_recipe['recipeingredientparts'] = [p.strip(' "\'') for p in parts]
                else:
                    clean_recipe['recipeingredientparts'] = [clean_recipe['recipeingredientparts']]
                    
            if isinstance(clean_recipe['recipeinstructions'], str):
                if clean_recipe['recipeinstructions'].startswith('c('):
                    # Handle R-style vectors
                    instructions = clean_recipe['recipeinstructions'].strip('c()').split(',')
                    clean_recipe['recipeinstructions'] = [i.strip(' "\'') for i in instructions]
                else:
                    clean_recipe['recipeinstructions'] = [clean_recipe['recipeinstructions']]
                    
            if isinstance(clean_recipe['images'], str):
                if clean_recipe['images'].startswith('c('):
                    # Handle R-style vectors
                    images = clean_recipe['images'].strip('c()').split(',')
                    clean_recipe['images'] = [img.strip(' "\'') for img in images]
                else:
                    clean_recipe['images'] = [clean_recipe['images']]
            
            # Apply improved image URL extraction to each image
            if isinstance(clean_recipe['images'], list):
                processed_images = []
                for img in clean_recipe['images']:
                    if isinstance(img, str):
                        # Clean the image URL
                        img = img.strip()
                        
                        # Handle common JSON string patterns
                        if img.startswith('["') and img.endswith('"]'):
                            img = img[2:-2]
                        
                        # Remove escaped quotes but preserve URL path
                        img = img.replace('\\"', '"').replace('\\\\"', '"')
                        
                        # Extract full URL up to image extension
                        image_extensions = r'\.(?:jpg|jpeg|png|gif|bmp|webp|svg|tiff)'
                        match = re.search(f'(https?://[^"\'\\s]+{image_extensions})', img, re.IGNORECASE)
                        
                        if match:
                            # Found a complete image URL with extension - use only up to the extension
                            img = match.group(1)
                        else:
                            # Make sure http:// or https:// is present
                            if img and not img.startswith(('http://', 'https://')):
                                if img.startswith('//'):
                                    img = 'https:' + img
                                elif img.startswith('www.'):
                                    img = 'https://' + img
                        
                        if img:  # Only add non-empty URLs
                            processed_images.append(img)
                
                # Use processed images or fallback to placeholder
                clean_recipe['images'] = processed_images if processed_images else [IMAGE_NOT_FOUND]
            
            recommendations.append(clean_recipe)
        
        return recommendations
        
    except Exception as e:
        print(f"ERROR in get_recommended_recipes: {str(e)}")
        return []

# Person class for health calculations
class Person:
    def __init__(self, age, height, weight, gender, activity, weight_goal):
        self.age = age
        self.height = height
        self.weight = weight
        self.gender = gender
        self.activity = activity
        self.weight_goal = weight_goal
        self.meals_calories_perc = {'breakfast': 0.30, 'lunch': 0.40, 'dinner': 0.30}
        
        # Map weight goals to multipliers
        self.weight_loss_map = {
            "Lose": 0.8,       # Weight loss
            "Maintain": 1.0,    # Maintain weight
            "Gain": 1.2        # Weight gain
        }
        self.weight_loss = self.weight_loss_map.get(weight_goal, 1.0)
        print(f"\nInitialized Person: age={age}, height={height}cm, weight={weight}kg, gender={gender}")
        print(f"Goal: {weight_goal} (multiplier: {self.weight_loss})")

    def calculate_bmi(self):
        bmi = round(self.weight / ((self.height / 100) ** 2), 2)
        print(f"BMI Calculation: {self.weight} / ({self.height/100})² = {bmi}")
        return bmi

    def display_result(self):
        bmi = self.calculate_bmi()
        category = ('Underweight' if bmi < 18.5 else 'Normal weight' if bmi < 25 else 'Overweight' if bmi < 30 else 'Obesity')
        print(f"BMI Category: {bmi} kg/m² -> {category}")
        return bmi, category

    def calculate_bmr(self):
        # Mifflin-St Jeor Equation
        bmr = 10 * self.weight + 6.25 * self.height - 5 * self.age + (5 if self.gender == 'Male' else -161)
        print(f"BMR Calculation: 10*{self.weight} + 6.25*{self.height} - 5*{self.age} + {5 if self.gender == 'Male' else -161} = {bmr}")
        return bmr

    def calories_calculator(self):
        activity_levels = ['Little/no exercise', 'Light exercise', 'Moderate exercise', 'Heavy exercise', 'Very heavy exercise']
        weights = [1.2, 1.375, 1.55, 1.725, 1.9]
        
        # Find the most similar activity level if not an exact match
        activity_index = 0
        for i, level in enumerate(activity_levels):
            if level.lower() in self.activity.lower():
                activity_index = i
                break
        
        bmr = self.calculate_bmr()
        tdee = bmr * weights[activity_index]
        print(f"TDEE Calculation: {bmr} * {weights[activity_index]} (activity multiplier) = {tdee}")
        return tdee

    def calculate_macros(self):
        tdee = self.calories_calculator()
        total_calories = round(self.weight_loss * tdee)
        print(f"Adjusted Calories: {tdee} * {self.weight_loss} (goal multiplier) = {total_calories}")
        
        # Calculate macronutrients based on weight goal
        if self.weight_goal == "Lose":
            protein_g = round(self.weight * 1.6)  # Higher protein for weight loss
            fat_g = round(self.weight * 0.5)     # Lower fat for weight loss
            carbs_g = round((total_calories - (protein_g * 4 + fat_g * 9)) / 4)  # Remaining calories from carbs
        elif self.weight_goal == "Gain":
            protein_g = round(self.weight * 2.2)  # Higher protein for muscle gain
            fat_g = round(self.weight * 1.0)     # Moderate fat for weight gain
            carbs_g = round((total_calories - (protein_g * 4 + fat_g * 9)) / 4)  # Remaining calories from carbs
        else:  # Maintain
            protein_g = round(self.weight * 1.2)  # Moderate protein for maintenance
            fat_g = round(self.weight * 0.8)     # Moderate fat for maintenance
            carbs_g = round((total_calories - (protein_g * 4 + fat_g * 9)) / 4)  # Remaining calories from carbs
        
        print(f"Macros: Protein={protein_g}g, Carbs={carbs_g}g, Fats={fat_g}g")
        print(f"Calorie breakdown: Protein={protein_g*4}kcal, Carbs={carbs_g*4}kcal, Fats={fat_g*9}kcal, Total={protein_g*4 + carbs_g*4 + fat_g*9}kcal")
        
        return {
            "calories": total_calories,
            "protein": protein_g,
            "carbs": carbs_g,
            "fats": fat_g
        }

    def generate_recommendations(self):
        bmi, category = self.display_result()
        macros = self.calculate_macros()
        
        # Generate ML-based recipe recommendations
        print("\n===== GENERATING ML-BASED RECIPE RECOMMENDATIONS =====")
        try:
            # Calculate calories for each meal based on distribution
            breakfast_calories = round(macros["calories"] * 0.3)
            lunch_calories = round(macros["calories"] * 0.4)
            dinner_calories = round(macros["calories"] * 0.3)
            
            print(f"Breakfast target calories: {breakfast_calories}")
            print(f"Lunch target calories: {lunch_calories}")
            print(f"Dinner target calories: {dinner_calories}")
            
            # Get recipe recommendations using KNN algorithm
            breakfast_recipes = get_recommended_recipes(breakfast_calories - 100, top_n=3)
            lunch_recipes = get_recommended_recipes(lunch_calories - 100, top_n=3)
            dinner_recipes = get_recommended_recipes(dinner_calories - 100, top_n=3)
            
            print(f"ML recommended breakfast recipes: {[recipe['name'] for recipe in breakfast_recipes]}")
            print(f"ML recommended lunch recipes: {[recipe['name'] for recipe in lunch_recipes]}")
            print(f"ML recommended dinner recipes: {[recipe['name'] for recipe in dinner_recipes]}")
            
            # Add ML recipe recommendations to response
            recipe_recommendations = {
                "breakfast": breakfast_recipes,
                "lunch": lunch_recipes,
                "dinner": dinner_recipes
            }
        except Exception as e:
            print(f"Error generating ML recipe recommendations: {str(e)}")
            recipe_recommendations = {
                "breakfast": [],
                "lunch": [],
                "dinner": []
            }
        
        return {
            "bmi": str(bmi),
            "category": category,
            "calories": macros["calories"],
            "protein": macros["protein"],
            "carbs": macros["carbs"],
            "fats": macros["fats"],
            "recipes": recipe_recommendations
        }

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "message": "Welcome to InertiaFit Personalized Food Recommendation System API",
        "endpoints": {
            "/api/health": "Health check endpoint",
            "/api/nutrition": "POST endpoint for nutrition recommendations",
            "/api/custom-nutrition": "POST endpoint for custom nutrition recommendations"
        }
    })

@app.route('/api/nutrition', methods=['POST'])
def nutrition_recommendation():
    try:
        data = request.json
        
        # Print received data from frontend
        print("\n===== RECEIVED NUTRITION REQUEST =====")
        print(f"Age: {data.get('age', 30)}")
        print(f"Height: {data.get('height', 170)} cm")
        print(f"Weight: {data.get('weight', 70)} kg")
        print(f"Gender: {data.get('gender', 'Male')}")
        print(f"Activity Level: {data.get('activityLevel', 'Little/no exercise')}")
        print(f"Weight Goal: {data.get('weightGoal', 'Maintain')}")
        
        # Extract data from the request
        age = int(data.get('age', 30))
        height = int(data.get('height', 170))
        weight = float(data.get('weight', 70))
        gender = data.get('gender', 'Male')
        activity_level = data.get('activityLevel', 'Little/no exercise')
        weight_goal = data.get('weightGoal', 'Maintain')
        
        # Create Person object and generate recommendations
        person = Person(age, height, weight, gender, activity_level, weight_goal)
        recommendations = person.generate_recommendations()
        
        # Print calculated recommendations
        print("\n===== NUTRITION RECOMMENDATIONS GENERATED =====")
        print(f"BMI: {recommendations['bmi']} - Category: {recommendations['category']}")
        print(f"Calories: {recommendations['calories']} kcal")
        print(f"Protein: {recommendations['protein']} g")
        print(f"Carbs: {recommendations['carbs']} g")
        print(f"Fats: {recommendations['fats']} g")
        if recommendations['recipes']['breakfast']:
            print(f"Meal Plan: Breakfast: {recommendations['recipes']['breakfast'][0]['name'][:30]}...")
        print("===== END OF RECOMMENDATIONS =====\n")
        
        return jsonify(recommendations)
    except Exception as e:
        import traceback
        print(f"Error in nutrition recommendation: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Failed to generate recommendations: {str(e)}"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "up", "message": "Flask API is running"})

@app.route('/api/custom-nutrition', methods=['POST'])
def get_custom_recommendations():
    try:
        data = request.get_json()
        print(f"Received data for custom nutrition: {data}")
        
        nutrition_values_list = data.get('nutrition_values_list')
        nb_recommendations = data.get('nb_recommendations', 6)
        ingredient_txt = data.get('ingredient_txt', '')

        if not nutrition_values_list or len(nutrition_values_list) != 9:
            print(f"Invalid nutrition values: {nutrition_values_list}")
            return jsonify({'error': 'Invalid nutrition values provided. Need exactly 9 values.'}), 400

        # Verify all values are numbers
        try:
            nutrition_values_list = [float(val) for val in nutrition_values_list]
            print(f"Converted nutrition values: {nutrition_values_list}")
        except (ValueError, TypeError) as e:
            print(f"Error converting nutrition values: {str(e)}")
            return jsonify({'error': f'Invalid nutrition value: {str(e)}'}), 400

        print("Creating Recommendation instance...")
        # Check if MongoDB has recipes
        recipe_count = mongo.db.FoodDataLite.count_documents({})
        print(f"Found {recipe_count} recipes in FoodDataLite collection")
        
        if recipe_count == 0:
            return jsonify({'error': 'No recipes found in the database'}), 404
            
        try:
            # Create recommendation instance and generate recommendations
            recommendation = Recommendation(nutrition_values_list, nb_recommendations, ingredient_txt)
            print("Recommendation instance created successfully")
            
            print("Generating recommendations...")
            recommendations = recommendation.generate()
            print(f"Generated {len(recommendations)} recommendations")

            if not recommendations or len(recommendations) == 0:
                print("No recommendations found")
                return jsonify({'error': 'No recommendations found for the given nutritional values'}), 404

            # Let's ensure all recommendation objects have standard property names
            standardized_recommendations = []
            for recipe in recommendations:
                # Make a first level copy of the recipe to avoid modifying the original
                standardized_recipe = {}
                
                # Copy and standardize field names to camelCase for frontend
                standardized_recipe['name'] = recipe.get('name', 'Unknown Recipe')
                standardized_recipe['calories'] = float(recipe.get('calories', 0))
                
                # Handle recipe ingredients
                recipe_ingredients = recipe.get('recipeingredientparts', [])
                if isinstance(recipe_ingredients, str):
                    # Handle string to list conversion
                    recipe_ingredients = [recipe_ingredients]
                standardized_recipe['recipeingredientparts'] = recipe_ingredients
                
                # Handle time fields
                standardized_recipe['cooktime'] = recipe.get('cooktime', 'PT30M')
                standardized_recipe['preptime'] = recipe.get('preptime', 'PT15M')
                standardized_recipe['totaltime'] = recipe.get('totaltime', 'PT45M')
                
                # Handle images properly
                images = recipe.get('images', [])
                if isinstance(images, str):
                    if images.startswith('c('):
                        # Handle R-style vectors
                        image_list = images.strip('c()').split(',')
                        standardized_recipe['images'] = [img.strip(' "\'') for img in image_list]
                    else:
                        # Single image as string
                        standardized_recipe['images'] = [images]
                elif isinstance(images, list) and len(images) > 0:
                    # Process list of images to clean up format issues
                    cleaned_images = []
                    for img in images:
                        if isinstance(img, str):
                            # More careful cleaning of image URLs
                            img = img.strip()
                            
                            # Handle common JSON string patterns
                            if img.startswith('["') and img.endswith('"]'):
                                img = img[2:-2]
                            
                            # Remove escaped quotes but preserve URL path
                            img = img.replace('\\"', '"').replace('\\\\"', '"')
                            
                            # Extract full URL up to image extension
                            image_extensions = r'\.(?:jpg|jpeg|png|gif|bmp|webp|svg|tiff)'
                            match = re.search(f'(https?://[^"\'\\s]+{image_extensions})', img, re.IGNORECASE)
                            
                            if match:
                                # Found a complete image URL with extension - use only up to the extension
                                img = match.group(1)
                            else:
                                # Make sure http:// or https:// is present
                                if img and not img.startswith(('http://', 'https://')):
                                    if img.startswith('//'):
                                        img = 'https:' + img
                                    elif img.startswith('www.'):
                                        img = 'https://' + img
                            
                            if img:  # Only add non-empty URLs
                                cleaned_images.append(img)
                    
                    standardized_recipe['images'] = cleaned_images if cleaned_images else [IMAGE_NOT_FOUND]
                else:
                    # Default placeholder if no images available
                    standardized_recipe['images'] = [IMAGE_NOT_FOUND]
                
                # Handle nutrition data
                standardized_recipe['nutrition'] = {
                    'protein': float(recipe.get('nutrition', {}).get('protein', 0)),
                    'carbs': float(recipe.get('nutrition', {}).get('carbs', 0)), 
                    'fats': float(recipe.get('nutrition', {}).get('fats', 0))
                }
                
                standardized_recommendations.append(standardized_recipe)
            
            print(f"Standardized and returning {len(standardized_recommendations)} recommendations")
            print(f"First recommendation: {standardized_recommendations[0]}")
            return jsonify(standardized_recommendations)
            
        except Exception as e:
            print(f"Error creating recommendation or generating recommendations: {str(e)}")
            return jsonify({'error': f'Failed to generate recommendations: {str(e)}'}), 500
        
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Unexpected error in get_custom_recommendations: {str(e)}")
        print(error_traceback)
        return jsonify({'error': f'Failed to generate recommendations: {str(e)}'}), 500

# User Model
class User:
    @staticmethod
    def create(user_data):
        try:
            hashed_password = bcrypt.generate_password_hash(user_data['password']).decode('utf-8')
            user_data['password'] = hashed_password
            result = mongo.db.users.insert_one(user_data)
            if not result.inserted_id:
                raise Exception("Failed to insert user into database")
            return result
        except Exception as e:
            print(f"Error in User.create: {str(e)}")
            raise Exception(f"Database error: {str(e)}")
    
    @staticmethod
    def find_by_email(email):
        try:
            return mongo.db.users.find_one({'email': email})
        except Exception as e:
            print(f"Error in User.find_by_email: {str(e)}")
            raise Exception(f"Database error: {str(e)}")

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not all(k in data for k in ['email', 'password']):
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = User.find_by_email(data['email'])
    
    if not user or not bcrypt.check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Create JWT token
    access_token = create_access_token(identity=str(user['_id']))
    
    # Create a user object without the password
    user_response = {
        'id': str(user['_id']),
        'name': user['name'],
        'email': user['email'],
        'age': user.get('age', 0),
        'height': user.get('height', 0),
        'weight': user.get('weight', 0),
        'gender': user.get('gender', 'Male'),
        'activityLevel': user.get('activityLevel', 'Little/no exercise'),
        'weightGoal': user.get('weightGoal', 'Maintain'),
        'joinDate': user.get('joinDate', datetime.now().isoformat())
    }
    
    return jsonify({
        'access_token': access_token,
        'user': user_response
    }), 200

@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print(f"Received registration data: {data}")

        required_fields = ['email', 'password', 'name', 'age', 'height', 'weight', 'gender', 'activityLevel', 'weightGoal']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            print(f"Missing required fields: {missing_fields}")
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        if User.find_by_email(data['email']):
            print(f"Email already registered: {data['email']}")
            return jsonify({'error': 'Email already registered'}), 409

        try:
            data['age'] = int(data['age'])
            data['height'] = float(data['height'])
            data['weight'] = float(data['weight'])
        except (ValueError, TypeError) as e:
            print(f"Invalid numeric data: {str(e)}")
            return jsonify({'error': 'Invalid numeric values provided'}), 400

        user = {
            'name': data['name'],
            'email': data['email'],
            'password': data['password'],
            'age': data['age'],
            'height': data['height'],
            'weight': data['weight'],
            'gender': data['gender'],
            'activityLevel': data['activityLevel'],
            'weightGoal': data['weightGoal'],
            'joinDate': datetime.now().isoformat()
        }
    
        try:
            User.create(user)
            print(f"User created successfully: {data['email']}")
            return jsonify({'message': 'User created successfully'}), 201
        except Exception as e:
            print(f"Error creating user: {str(e)}")
            return jsonify({'error': str(e)}), 500
            
    except Exception as e:
        print(f"Unexpected error in registration: {str(e)}")
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/user/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    try:
        # Get the identity from the JWT token
        current_user_id = get_jwt_identity()
        
        # Check if the requester is trying to access their own data
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        
        # Find user by ID from MongoDB
        try:
            user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        except InvalidId:
            return jsonify({"error": "Invalid user ID format"}), 400
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Remove sensitive information from response
        user.pop('password', None)
        
        # Convert ObjectId to string
        user['_id'] = str(user['_id'])
        
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        # Get the identity from the JWT token
        current_user_id = get_jwt_identity()
        
        # Check if the requester is trying to update their own data
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'age', 'height', 'weight', 'gender', 'activityLevel', 'weightGoal']
        if not all(k in data for k in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate data types
        try:
            data['age'] = int(data['age'])
            data['height'] = float(data['height'])
            data['weight'] = float(data['weight'])
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid data types for numeric fields'}), 400
        
        # Convert ObjectId from string
        try:
            user_object_id = ObjectId(user_id)
        except InvalidId:
            return jsonify({"error": "Invalid user ID format"}), 400
        
        # Update the user data in MongoDB
        result = mongo.db.users.update_one(
            {"_id": user_object_id},
            {"$set": {
                "name": data['name'],
                "age": data['age'],
                "height": data['height'],
                "weight": data['weight'],
                "gender": data['gender'],
                "activityLevel": data['activityLevel'],
                "weightGoal": data['weightGoal']
            }}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404
        
        # Fetch the updated user
        updated_user = mongo.db.users.find_one({"_id": user_object_id})
        
        # Remove sensitive information
        updated_user.pop('password', None)
        
        # Convert ObjectId to string
        updated_user['_id'] = str(updated_user['_id'])
        
        return jsonify({
            "message": "User updated successfully",
            "user": updated_user
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/<user_id>/foods', methods=['POST'])
@jwt_required()
def save_user_food_selection(user_id):
    try:
        # Authentication check
        current_user_id = get_jwt_identity()
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['breakfast', 'lunch', 'dinner']
      
        
        today = datetime.now().date().isoformat()
        
        # Check for existing entry
        existing = mongo.db.foods.find_one({
            'userId': ObjectId(user_id),
            'daily_food_summary.date': today
        })
        
        if existing and len(data.get('extra', [])) > 0 :
            # Update existing document by pushing new extras
            if 'extra' in data:
                extras = data['extra']
                # Convert to list if it's not already one
                extras_list = extras if isinstance(extras, list) else [extras]
                # Filter out None or empty values
                print(extras_list)
                valid_extras = [item for item in extras_list if item]
                print(valid_extras)
                update_result = mongo.db.foods.update_one(
                    {
                        '_id': existing['_id'],
                        'daily_food_summary.date': today
                    },
                    {
                        '$push': {
                            'daily_food_summary.$.extra': {
                                '$each': valid_extras
                            }
                        }
                    }
                )
                return jsonify({
                    "message": "Extra items added successfully",
                    "modifiedCount": update_result.modified_count
                }), 200
            
        elif existing: 
            return jsonify({"error": "You have already submitted your food selection for today"}), 400
        # Create new document (first submission of the day)
        else:
            if not all(k in data for k in required_fields):
                return jsonify({'error': 'Missing required primary meal selections'}), 400
            daily_summary = {
            'date': today,
            'breakfast': data['breakfast'],
            'lunch': data['lunch'],
            'dinner': data['dinner'],
            'extra': data['extra']
            }
        
        # Add extras if provided (initialize as array)
        
        # Insert new document
            food_selection = {
            'userId': ObjectId(user_id),
            'daily_food_summary': [daily_summary]
            }
        
            result = mongo.db.foods.insert_one(food_selection)
        
            return jsonify({
            "message": "Food selections saved successfully",
            "foodSelectionId": str(result.inserted_id)
            }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/<user_id>/food-summary', methods=['POST'])
@jwt_required()
def save_food_summary(user_id):
    try:
        # Get the identity from the JWT token
        current_user_id = get_jwt_identity()
        
        # Check if the requester is trying to access their own data
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ['breakfast', 'lunch', 'dinner']):
            return jsonify({'error': 'Missing required meal selections'}), 400
        
        # Get current date
        current_date = datetime.now().date().isoformat()
        
        # Check if there's already a food summary for today
        existing_summary = mongo.db.food_summaries.find_one({
            "userId": ObjectId(user_id),
            "daily-food-summary.date": current_date
        })
        
        if existing_summary:
            return jsonify({
                "error": "You have already selected your meals for today. You cannot modify them on the same day."
            }), 400
        
        # Create food summary document
        food_summary = {
            'userId': ObjectId(user_id),
            'daily-food-summary': [{
                'date': current_date,
                'breakfast': {
                    'meal': data['breakfast']['meal'],
                    'calories': data['breakfast']['calories'],
                    'protein': data['breakfast']['protein'],
                    'carbs': data['breakfast']['carbs'],
                    'fats': data['breakfast']['fats']
                },
                'lunch': {
                    'meal': data['lunch']['meal'],
                    'calories': data['lunch']['calories'],
                    'protein': data['lunch']['protein'],
                    'carbs': data['lunch']['carbs'],
                    'fats': data['lunch']['fats']
                },
                'dinner': {
                    'meal': data['dinner']['meal'],
                    'calories': data['dinner']['calories'],
                    'protein': data['dinner']['protein'],
                    'carbs': data['dinner']['carbs'],
                    'fats': data['dinner']['fats']
                }
            }]
        }
        
        # Insert into MongoDB
        result = mongo.db.food_summaries.insert_one(food_summary)
        
        return jsonify({
            "message": "Food summary saved successfully",
            "foodSummaryId": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/<user_id>/food-summary', methods=['GET'])
@jwt_required()
def get_food_summary(user_id):
    try:
        # Get the identity from the JWT token
        current_user_id = get_jwt_identity()
        
        # Check if the requester is trying to access their own data
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        
        # Get the latest food summary for the user
        food_summary = mongo.db.food_summaries.find_one(
            {"userId": ObjectId(user_id)},
            sort=[("date", -1)]  # Sort by date in descending order to get the latest
        )
        
        if not food_summary:
            return jsonify({"error": "No food summary found"}), 404
        
        # Convert ObjectId to string
        food_summary['_id'] = str(food_summary['_id'])
        food_summary['userId'] = str(food_summary['userId'])
        
        return jsonify(food_summary), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/<user_id>/food-data/<date>', methods=['GET'])
@jwt_required()
def get_food_data_by_date(user_id, date):
    try:
        # Get the identity from the JWT token
        current_user_id = get_jwt_identity()
        
        # Check if the requester is trying to access their own data
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        print(date)
        # Find food summary by user ID and date
        food_summary = mongo.db.foods.find_one(
            {
                "userId": ObjectId(user_id),
                "daily_food_summary.date": date
            }
        )
        
        if not food_summary:
            return jsonify({"error": "No food data found for the specified date"}), 404
        
        # Convert ObjectId to string
        food_summary['_id'] = str(food_summary['_id'])
        food_summary['userId'] = str(food_summary['userId'])
        
        return jsonify(food_summary), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/<user_id>/exercise-data/<date>', methods=['GET'])
@jwt_required()
def get_exercise_data_by_date(user_id, date):
    try:
        # Get the identity from the JWT token
        current_user_id = get_jwt_identity()
        
        # Check if the requester is trying to access their own data
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        
        # Get user's email
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        email = user.get('email')
        print('email', email)
        
        # Find exercise data by user ID and date
        exercise_data = mongo.db.exercise.find_one(
            {
                "user_id": email,
                "exercise_summary.date": date
            }
        )
        
        if not exercise_data:
            # Return empty exercise data structure
            return jsonify({
                "exercise_summary": []
            }), 200
        
        # Filter exercise summary for the specific date and convert MongoDB numbers
        filtered_summary = []
        for summary in exercise_data.get('exercise_summary', []):
            if summary.get('date') == date:
                # Convert MongoDB numbers to regular integers
                filtered_summary.append({
                    'date': summary['date'],
                    'sit-up': int(summary['sit-up']) if isinstance(summary['sit-up'], (int, float, str)) else int(summary['sit-up']['$numberInt']),
                    'pull-up': int(summary['pull-up']) if isinstance(summary['pull-up'], (int, float, str)) else int(summary['pull-up']['$numberInt']),
                    'push-up': int(summary['push-up']) if isinstance(summary['push-up'], (int, float, str)) else int(summary['push-up']['$numberInt']),
                    'squat': int(summary['squat']) if isinstance(summary['squat'], (int, float, str)) else int(summary['squat']['$numberInt']),
                    'walk': int(summary['walk']) if isinstance(summary['walk'], (int, float, str)) else int(summary['walk']['$numberInt'])
                })
        
        return jsonify({
            "exercise_summary": filtered_summary
        }), 200
        
    except Exception as e:
        print(f"Error in get_exercise_data_by_date: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/<user_id>/exercise-history', methods=['GET'])
@jwt_required()
def get_exercise_history(user_id):
    try:
        # Get the identity from the JWT token
        current_user_id = get_jwt_identity()
        
        # Check if the requester is trying to access their own data
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        
        # Get query parameters
        days = request.args.get('days', 5, type=int)  # Default to 5 days
        
        # Get user's email
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        email = user.get('email')
        
        # Get current date and calculate dates for the past N days
        today = datetime.now().date()
        date_list = [(today - timedelta(days=i)).isoformat() for i in range(days)]
        
        # Find exercise data by user ID
        exercise_data = mongo.db.exercise.find_one({"user_id": email})
        
        if not exercise_data:
            # Return default empty data for the past N days
            default_data = {
                "user_id": email,
                "exercise_summary": [
                    {
                        "date": date,
                        "sit-up": 0,
                        "pull-up": 0,
                        "push-up": 0,
                        "squat": 0,
                        "walk": 0
                    } for date in date_list
                ]
            }
            return jsonify(default_data), 200
        
        # Convert ObjectId to string
        exercise_data['_id'] = str(exercise_data['_id'])
        
        # Filter to include only the past N days
        filtered_summaries = []
        
        # Check if we have summaries for the requested days
        existing_dates = [summary["date"] for summary in exercise_data.get("exercise_summary", [])]
        
        for date in date_list:
            # If the date exists in the records, add the actual data
            if date in existing_dates:
                for summary in exercise_data["exercise_summary"]:
                    if summary["date"] == date:
                        filtered_summaries.append(summary)
                        break
            else:
                # If the date doesn't exist, add default data
                filtered_summaries.append({
                    "date": date,
                    "sit-up": 0,
                    "pull-up": 0,
                    "push-up": 0,
                    "squat": 0,
                    "walk": 0
                })
        
        # Replace the summaries with filtered ones
        exercise_data["exercise_summary"] = filtered_summaries
        
        return jsonify(exercise_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/<user_id>/exercise-data', methods=['POST'])
@jwt_required()
def save_exercise_data(user_id):
    try:
        # Get the identity from the JWT token
        current_user_id = get_jwt_identity()
        
        # Check if the requester is trying to access their own data
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ['date', 'sit-up', 'pull-up', 'push-up', 'squat', 'walk']):
            return jsonify({'error': 'Missing required exercise data fields'}), 400
        
        # Get user's email
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        email = user.get('email')
        
        # Format the exercise data
        exercise_entry = {
            'date': data['date'],
            'sit-up': int(data['sit-up']),
            'pull-up': int(data['pull-up']),
            'push-up': int(data['push-up']),
            'squat': int(data['squat']),
            'walk': int(data['walk'])
        }
        
        # Check if there's already an exercise record for this user
        existing_data = mongo.db.exercise.find_one({"user_id": email})
        
        if existing_data:
            # Check if there's an entry for the given date
            date_exists = False
            for i, summary in enumerate(existing_data['exercise_summary']):
                if summary['date'] == data['date']:
                    date_exists = True
                # Update existing date entry
                    mongo.db.exercise.update_one(
                    {
                            "user_id": email,
                        "exercise_summary.date": data['date']
                    },
                    {
                        "$set": {
                                f"exercise_summary.$.sit-up": exercise_entry['sit-up'],
                                f"exercise_summary.$.pull-up": exercise_entry['pull-up'],
                                f"exercise_summary.$.push-up": exercise_entry['push-up'],
                                f"exercise_summary.$.squat": exercise_entry['squat'],
                                f"exercise_summary.$.walk": exercise_entry['walk']
                            }
                        }
                    )
                    break
            
            if not date_exists:
                # Add new date entry to existing user
                mongo.db.exercise.update_one(
                    {"user_id": email},
                    {
                        "$push": {
                            "exercise_summary": exercise_entry
                        }
                    }
                )
        else:
            # Create new user exercise document
            exercise_data = {
                "user_id": email,
                "exercise_summary": [exercise_entry]
            }
            
            mongo.db.exercise.insert_one(exercise_data)
        
        return jsonify({"message": "Exercise data saved successfully"}), 200
        
    except Exception as e:
        print(f"Error saving exercise data: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\n===== STARTING FLASK SERVER =====")
    print(f"Flask API is running at http://localhost:5000")
    print("Available endpoints:")
    print("  GET  /api/health - Health check")
    print("  POST /api/nutrition - Nutrition recommendations")
    print("  POST /api/custom-nutrition - Custom nutrition recommendations")
    print("  GET  / - API information")
    print("\nPress Ctrl+C to stop the server")
    print("=====================================\n")
    app.run(debug=True, port=5000) 