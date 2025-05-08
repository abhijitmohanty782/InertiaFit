import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

// Placeholder image for not found images
const FOOD_GIF_PLACEHOLDER = "https://i.pinimg.com/originals/4c/b0/22/4cb02295d1c94c0324d96538b49307a8.gif";

// Reusable FoodImage component
const FoodImage = ({ src, alt, height = "h-40" }) => {
  const [hasError, setHasError] = useState(false);
  
  const handleImageError = () => {
    setHasError(true);
  };
  
  return (
    <div className={`relative w-full ${height} overflow-hidden`}>
      <img 
        src={hasError || !src ? FOOD_GIF_PLACEHOLDER : src}
        alt={alt || "Food image"} 
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
      {(hasError || !src) && (
        <div className="absolute bottom-0 w-full bg-red-500 bg-opacity-80 text-white text-center text-xs py-1">
          Real Image Not Found
        </div>
      )}
    </div>
  );
};

// Reusable Recipe Card component
const RecipeCard = ({ recipe, index, isExpanded, onToggle, onSelect, isSelected }) => {
  const formatTime = (time) => {
    if (!time) return '30 min';
    return time;
  };
  
  return (
    <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-orange-500/30">
      {/* Recipe Image */}
      {(recipe.images || recipe.Images) && (recipe.images || recipe.Images).length > 0 ? (
        <FoodImage 
          src={(recipe.images || recipe.Images)[0]} 
          alt={recipe.name || recipe.Name || "Food image"} 
        />
      ) : (
        <FoodImage />
      )}
      
      <div className="p-4 border-b border-gray-600">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold text-orange-400 line-clamp-2">
            {recipe.name || recipe.Name || "Unknown Recipe"}
          </h3>
          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            {recipe.calories || recipe.Calories || 0} kcal
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
          <span>Prep: {formatTime(recipe.preptime || recipe.PrepTime)}</span>
          <span>Cook: {formatTime(recipe.cooktime || recipe.CookTime)}</span>
        </div>
        
        <button 
          className="mt-3 flex items-center text-sm text-orange-500 hover:text-orange-400"
          onClick={() => onToggle(index)}
        >
          {isExpanded ? 'Hide details' : 'View details'}
          <svg 
            xmlns="http://www.w3.org/2000/svg"
            className={`ml-1 h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-gray-800 animate-fadeIn">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Ingredients:</h4>
          <p className="text-xs text-gray-400 mb-4">
            {Array.isArray(recipe.recipeingredientparts || recipe.RecipeIngredientParts) 
              ? (recipe.recipeingredientparts || recipe.RecipeIngredientParts).join(", ") 
              : (recipe.recipeingredientparts || recipe.RecipeIngredientParts || "Ingredients not available")}
          </p>
          
          <button 
            onClick={() => onSelect(recipe)}
            className={`w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded-md transition-colors ${
              isSelected ? 'bg-green-500 hover:bg-green-600' : ''
            }`}
          >
            {isSelected ? '✓ Selected' : 'Select Recipe'}
          </button>
        </div>
      )}
    </div>
  );
};

// Reusable Selected Recipe component
const SelectedRecipe = ({ recipe, onSave }) => {
  return (
    <div className="mt-6 bg-gray-700 rounded-lg overflow-hidden">
      {/* Selected Recipe Image */}
      {(recipe.images || recipe.Images) && (recipe.images || recipe.Images).length > 0 ? (
        <FoodImage 
          src={(recipe.images || recipe.Images)[0]} 
          alt={recipe.name || recipe.Name} 
          height="h-48 sm:h-56 md:h-64"
        />
      ) : (
        <FoodImage height="h-48 sm:h-56 md:h-64" />
      )}
      
      <div className="p-4">
        <h3 className="text-md font-semibold mb-2">Selected Recipe: {recipe.name || recipe.Name}</h3>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <p className="text-sm text-gray-400">Calories: {recipe.calories || recipe.Calories} kcal</p>
            {recipe.nutrition && (
              <div className="mt-2">
                <p className="text-xs text-gray-400">Protein: {recipe.nutrition.protein}g</p>
                <p className="text-xs text-gray-400">Carbs: {recipe.nutrition.carbs}g</p>
                <p className="text-xs text-gray-400">Fats: {recipe.nutrition.fats}g</p>
              </div>
            )}
          </div>
          <button 
            onClick={onSave}
            className="mt-4 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded-md transition-colors"
          >
            Save to Meal Plan
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Nutrition Slider component
const NutritionSlider = ({ 
  label, 
  value, 
  min = 0, 
  max = 100, 
  onChange 
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-orange-500 font-semibold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

// Nutrition Summary Card component
const NutritionSummary = ({ nutritionValues }) => {
  return (
    <div className="bg-gray-700 p-4 rounded-lg mt-4">
      <h3 className="text-sm font-semibold mb-2 text-center">Nutritional Summary</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-gray-400">Calories</p>
          <p className="text-sm font-medium">{nutritionValues.calories} kcal</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Protein</p>
          <p className="text-sm font-medium">{nutritionValues.protein}g</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Carbs</p>
          <p className="text-sm font-medium">{nutritionValues.carbohydrate}g</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Fat</p>
          <p className="text-sm font-medium">{nutritionValues.fat}g</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Fiber</p>
          <p className="text-sm font-medium">{nutritionValues.fiber}g</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Sugar</p>
          <p className="text-sm font-medium">{nutritionValues.sugar}g</p>
        </div>
      </div>
    </div>
  );
};

const CustomizedNutritionPage = () => {
  // State for nutritional preferences
  const [nutritionPreferences, setNutritionPreferences] = useState({
    calories: 500,
    fat: 10,
    saturatedFat: 5,
    cholesterol: 50,
    sodium: 500,
    carbohydrate: 50,
    fiber: 10,
    sugar: 10,
    protein: 20
  });

  // State for loading, error, and recommendations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [expandedRecipes, setExpandedRecipes] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Handle slider changes
  const handleSliderChange = (name, value) => {
    setNutritionPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle recipe expansion
  const toggleRecipe = (index) => {
    setExpandedRecipes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Check if recipe is expanded
  const isRecipeExpanded = (index) => {
    return expandedRecipes[index] || false;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const response = await axios.post('https://inertiafit.onrender.com/api/custom-nutrition', {
          nutrition_values_list: [
            nutritionPreferences.calories,
            nutritionPreferences.fat,
            nutritionPreferences.saturatedFat,
            nutritionPreferences.cholesterol,
            nutritionPreferences.sodium,
            nutritionPreferences.carbohydrate,
            nutritionPreferences.fiber,
            nutritionPreferences.sugar,
            nutritionPreferences.protein
          ],
          nb_recommendations: 6,
          ingredient_txt: ''
      });

      setRecommendations(response.data);
      setSubmitted(true); // Set submitted flag to true when we have recommendations
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get recommendations. Please try again later.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save selected food to user profile (placeholder function)
  const saveSelectedFood = () => {
    if (!selectedFood) {
      alert('Please select a recipe first');
      return;
    }
    
    // Implement saving logic here or redirect to dashboard
    alert(`${selectedFood.name || selectedFood.Name} has been saved to your meal plan!`);
    setSelectedFood(null);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-orange-500 mb-2">🔍 Customized Food Recommendation</h1>
          <p className="text-gray-400 text-sm md:text-base">Adjust nutritional preferences for personalized food recommendations</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Left panel - Nutritional Preferences Form */}
          <div className="w-full lg:w-2/5">
            <div className="bg-gray-800 rounded-lg shadow-xl p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-center">Set Your Nutritional Preferences</h2>
              
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Calories */}
            <NutritionSlider 
              label="Calories (kcal)"
                value={nutritionPreferences.calories}
              onChange={(value) => handleSliderChange('calories', value)}
              min={0}
              max={2000}
              />

            {/* Fat Content */}
            <NutritionSlider 
              label="Fat Content (g)"
                value={nutritionPreferences.fat}
              onChange={(value) => handleSliderChange('fat', value)}
              min={0}
              max={100}
              />

            {/* Saturated Fat */}
            <NutritionSlider 
              label="Saturated Fat Content (g)"
                value={nutritionPreferences.saturatedFat}
              onChange={(value) => handleSliderChange('saturatedFat', value)}
              min={0}
              max={13}
              />

            {/* Cholesterol */}
            <NutritionSlider 
              label="Cholesterol Content (mg)"
                value={nutritionPreferences.cholesterol}
              onChange={(value) => handleSliderChange('cholesterol', value)}
              min={0}
              max={300}
              />

            {/* Sodium */}
            <NutritionSlider 
              label="Sodium Content (mg)"
                value={nutritionPreferences.sodium}
              onChange={(value) => handleSliderChange('sodium', value)}
              min={0}
              max={2300}
              />

            {/* Carbohydrate */}
            <NutritionSlider 
              label="Carbohydrate Content (g)"
                value={nutritionPreferences.carbohydrate}
              onChange={(value) => handleSliderChange('carbohydrate', value)}
              min={0}
              max={300}
              />

            {/* Fiber */}
            <NutritionSlider 
              label="Fiber Content (g)"
                value={nutritionPreferences.fiber}
              onChange={(value) => handleSliderChange('fiber', value)}
              min={0}
              max={50}
              />

            {/* Sugar */}
            <NutritionSlider 
              label="Sugar Content (g)"
                value={nutritionPreferences.sugar}
              onChange={(value) => handleSliderChange('sugar', value)}
              min={0}
              max={50}
              />

                {/* Protein */}
            <NutritionSlider 
              label="Protein Content (g)"
                value={nutritionPreferences.protein}
              onChange={(value) => handleSliderChange('protein', value)}
              min={0}
              max={100}
              />

                {/* Nutritional Summary Card */}
            <NutritionSummary nutritionValues={nutritionPreferences} />

                {/* Error message */}
            {error && (
              <div className="p-3 md:p-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-100 rounded-md">
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}

                {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
                  className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <span className="text-sm md:text-base">Get Personalized Recommendations</span>
                </>
              )}
            </button>
          </form>
            </div>
        </div>

          {/* Right panel - Recommendations */}
          <div className="w-full lg:w-3/5">
            {submitted ? (
              recommendations && recommendations.length > 0 ? (
                <div className="bg-gray-800 rounded-lg shadow-xl p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-semibold text-orange-500 mb-4 md:mb-6 text-center">✓ Your Recommended Foods</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((recipe, index) => (
                      <RecipeCard 
                        key={index}
                        recipe={recipe}
                        index={index}
                        isExpanded={isRecipeExpanded(index)}
                        onToggle={toggleRecipe}
                        onSelect={(r) => setSelectedFood(r)}
                        isSelected={selectedFood === recipe}
                      />
                    ))}
                  </div>
                  
                  {selectedFood && (
                    <SelectedRecipe recipe={selectedFood} onSave={saveSelectedFood} />
                  )}
                  </div>
              ) : (
                <div className="bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 flex flex-col items-center justify-center h-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-16 md:w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-lg md:text-xl font-medium text-gray-400 mb-2">No Recommendations Found</h3>
                  <p className="text-gray-500 text-center mb-6 text-sm md:text-base">Try adjusting your nutritional preferences to get better matches.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    Modify Preferences
                  </button>
                </div>
              )
            ) : (
              <div className="bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 flex flex-col items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-16 md:w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="text-lg md:text-xl font-medium text-gray-400 mb-2">Set Your Preferences</h3>
                <p className="text-gray-500 text-center mb-4 text-sm md:text-base">Adjust the sliders on the left to set your nutritional preferences and get personalized food recommendations that match your needs.</p>
                <p className="text-gray-500 text-center text-sm md:text-base">Our ML-powered system will analyze thousands of recipes to find the best matches for you!</p>
            </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CustomizedNutritionPage; 
