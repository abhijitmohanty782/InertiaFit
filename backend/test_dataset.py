from pymongo import MongoClient
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors

def test_mongodb_connection():
    try:
        # Connect to MongoDB
        client = MongoClient("mongodb+srv://Amritesh:OpPgCVoOPpakzgoc@cluster0.rdwmp.mongodb.net/inertiafit?retryWrites=true&w=majority")
        db = client.inertiafit
        
        # Test connection by getting recipe count
        recipe_count = db.FoodData.count_documents({})
        print(f"Successfully connected to MongoDB. Found {recipe_count} recipes.")
        
        # Test data retrieval
        sample_recipe = db.FoodData.find_one()
        if sample_recipe:
            print("\nSample recipe data:")
            print(f"Name: {sample_recipe.get('name', 'N/A')}")
            print(f"Calories: {sample_recipe.get('calories', 'N/A')}")
            print(f"Protein: {sample_recipe.get('proteincontent', 'N/A')}g")
            print(f"Carbs: {sample_recipe.get('carbohydratecontent', 'N/A')}g")
            print(f"Fat: {sample_recipe.get('fatcontent', 'N/A')}g")
        
        return True
    except Exception as e:
        print(f"Error connecting to MongoDB: {str(e)}")
        return False

def test_recommendation_system():
    try:
        # Connect to MongoDB
        client = MongoClient("mongodb+srv://Amritesh:OpPgCVoOPpakzgoc@cluster0.rdwmp.mongodb.net/inertiafit?retryWrites=true&w=majority")
        db = client.inertiafit
        
        # Get recipes
        recipes = list(db.FoodData.find())
        
        if not recipes:
            print("No recipes found in database")
            return False
            
        # Extract features
        features = []
        valid_recipes = []
        
        for recipe in recipes:
            try:
                feature_values = [
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
                features.append(feature_values)
                valid_recipes.append(recipe)
            except (ValueError, TypeError):
                continue
                
        if not valid_recipes:
            print("No valid recipes found after filtering")
            return False
            
        # Test recommendation system
        X = np.array(features)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Test with sample target values
        target_calories = 500
        protein_target = np.random.uniform(target_calories * 0.25 / 4, target_calories * 0.35 / 4)
        carbs_target = np.random.uniform(target_calories * 0.45 / 4, target_calories * 0.65 / 4)
        fat_target = np.random.uniform(target_calories * 0.2 / 9, target_calories * 0.35 / 9)
        
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
        
        target_scaled = scaler.transform([target_nutrition])
        
        knn = NearestNeighbors(n_neighbors=3, metric='cosine')
        knn.fit(X_scaled)
        distances, indices = knn.kneighbors(target_scaled)
        
        print("\nTest recommendations:")
        for idx in indices[0]:
            recipe = valid_recipes[idx]
            print(f"\nRecipe: {recipe.get('name', 'N/A')}")
            print(f"Calories: {recipe.get('calories', 'N/A')}")
            print(f"Protein: {recipe.get('proteincontent', 'N/A')}g")
            print(f"Carbs: {recipe.get('carbohydratecontent', 'N/A')}g")
            print(f"Fat: {recipe.get('fatcontent', 'N/A')}g")
        
        return True
    except Exception as e:
        print(f"Error testing recommendation system: {str(e)}")
        return False

if __name__ == "__main__":
    print("\n===== TESTING MONGODB CONNECTION =====")
    if test_mongodb_connection():
        print("\nMongoDB connection test passed!")
    else:
        print("\nMongoDB connection test failed!")
        
    print("\n===== TESTING RECOMMENDATION SYSTEM =====")
    if test_recommendation_system():
        print("\nRecommendation system test passed!")
    else:
        print("\nRecommendation system test failed!") 