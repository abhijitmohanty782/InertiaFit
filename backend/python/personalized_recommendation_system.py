
import numpy as np
from random import uniform as rnd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from pymongo import MongoClient

# Nutrition values used for food recommendations
nutrition_features = ['calories', 'fatcontent', 'saturatedfatcontent', 'cholesterolcontent', 'sodiumcontent', 
                     'carbohydratecontent', 'fibercontent', 'sugarcontent', 'proteincontent']

class PersonalizedRecommendation:
    def __init__(self):
        # Connect to MongoDB
        self.client = MongoClient("mongodb+srv://Amritesh:OpPgCVoOPpakzgoc@cluster0.rdwmp.mongodb.net/inertiafit?retryWrites=true&w=majority")
        self.db = self.client.inertiafit
        
        # Get recipes from MongoDB
        self.recipes = list(self.db.FoodData.find())
        
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

    def get_recommendations(self, target_calories, top_n=3):
        if not self.valid_recipes:
            return []
            
        # Convert features to numpy array
        X = np.array(self.features)
        
        # Scale the features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
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
        
        # Scale target values
        target_scaled = scaler.transform([target_nutrition])
        
        # Find nearest neighbors
        knn = NearestNeighbors(n_neighbors=min(top_n, len(self.valid_recipes)), metric='cosine')
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
                    clean_recipe['images'] = [img.strip(' "\'') for img in images]
                else:
                    clean_recipe['images'] = [clean_recipe['images']]
            
            recommendations.append(clean_recipe)
        
        return recommendations
