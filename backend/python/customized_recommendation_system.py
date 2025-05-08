import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from pymongo import MongoClient
import re

# Nutrition values used for recommendations
nutrition_values = ['calories', 'fatcontent', 'saturatedfatcontent', 'cholesterolcontent', 
                    'sodiumcontent', 'carbohydratecontent', 'fibercontent', 'sugarcontent', 'proteincontent']

# Function to process image URLs
def process_image_url(img):
    if not isinstance(img, str):
        return None
    
    # Clean the image URL
    img = img.strip()
    
    # Handle common JSON string patterns
    if img.startswith('["') and img.endswith('"]'):
        img = img[2:-2]
    
    # Remove escaped quotes but preserve URL path
    img = img.replace('\\"', '"').replace('\\\\"', '"')
    
    # Extract full URL up to image extension
    match = re.search(r'(https?://[^"\'\s]+\.(?:jpg|jpeg|png|gif|bmp|webp|svg|tiff))', img, re.IGNORECASE)
    
    if match:
        # Found a complete image URL with extension
        return match.group(1)
    elif img and not img.startswith(('http://', 'https://')):
        # Add protocol if missing
        if img.startswith('//'):
            return 'https:' + img
        elif img.startswith('www.'):
            return 'https://' + img
    
    return img if img else None

# Use this placeholder for missing images
IMAGE_NOT_FOUND = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnU3am03cGpvdnE5MDlsNGt0bG03cnppZDVybmJoY2V3c29taXBpdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pVbhJvVUYqx2A8oT8G/giphy.gif'

# Class to generate food recommendations
class Recommendation:
    def __init__(self, nutrition_values_list, nb_recommendations=6, ingredient_txt=''):
        self.nutrition_values_list = nutrition_values_list
        self.nb_recommendations = nb_recommendations
        self.ingredient_txt = ingredient_txt.lower()
        
        # Connect to MongoDB
        self.client = MongoClient("mongodb+srv://Amritesh:OpPgCVoOPpakzgoc@cluster0.rdwmp.mongodb.net/inertiafit?retryWrites=true&w=majority")
        self.db = self.client.inertiafit
        
        # Get recipes from MongoDB
        self.recipes = list(self.db.FoodDataLite.find())
        
        # Extract features for ML
        self.features = []
        self.valid_recipes = []
        
        for recipe in self.recipes:
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
                self.features.append(features)
                self.valid_recipes.append(recipe)
            except (ValueError, TypeError):
                continue

    def generate(self):
        if not self.valid_recipes:
            return []
            
        # Convert features to numpy array
        X = np.array(self.features)
        
        # Scale the features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Scale target values
        target_scaled = scaler.transform([self.nutrition_values_list])
        
        # Find nearest neighbors
        knn = NearestNeighbors(n_neighbors=min(self.nb_recommendations, len(self.valid_recipes)), metric='cosine')
        knn.fit(X_scaled)
        distances, indices = knn.kneighbors(target_scaled)
        
        # Get recommendations
        recommendations = []
        for idx in indices[0]:
            recipe = self.valid_recipes[idx]
            
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
                    parts = clean_recipe['recipeingredientparts'].strip('c()').split(',')
                    clean_recipe['recipeingredientparts'] = [p.strip(' "\'') for p in parts]
                else:
                    clean_recipe['recipeingredientparts'] = [clean_recipe['recipeingredientparts']]
                    
            if isinstance(clean_recipe['recipeinstructions'], str):
                if clean_recipe['recipeinstructions'].startswith('c('):
                    instructions = clean_recipe['recipeinstructions'].strip('c()').split(',')
                    clean_recipe['recipeinstructions'] = [i.strip(' "\'') for i in instructions]
                else:
                    clean_recipe['recipeinstructions'] = [clean_recipe['recipeinstructions']]
                    
            if isinstance(clean_recipe['images'], str):
                if clean_recipe['images'].startswith('c('):
                    images = clean_recipe['images'].strip('c()').split(',')
                    clean_recipe['images'] = [process_image_url(img.strip(' "\'')) for img in images]
                else:
                    clean_recipe['images'] = [process_image_url(clean_recipe['images'])]
            elif isinstance(clean_recipe['images'], list):
                clean_recipe['images'] = [process_image_url(img) for img in clean_recipe['images']]
            
            # Filter out None values
            clean_recipe['images'] = [img for img in clean_recipe['images'] if img]
            
            # Use placeholder if no valid images
            if not clean_recipe['images']:
                clean_recipe['images'] = [IMAGE_NOT_FOUND]
            
            recommendations.append(clean_recipe)
        
        return recommendations

# Remove the CLI input section since we'll be using the API
