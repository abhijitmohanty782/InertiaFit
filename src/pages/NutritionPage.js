import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { jsPDF } from 'jspdf';

const NutritionPage = () => {
  // Form state
  const [age, setAge] = useState(10);
  const [height, setHeight] = useState(100);
  const [weight, setWeight] = useState(30.00);
  const [gender, setGender] = useState('Male');
  const [activityLevel, setActivityLevel] = useState('Little/no exercise');
  const [weightGoal, setWeightGoal] = useState('Maintain');
  
  // UI state
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedRecipes, setExpandedRecipes] = useState({});
  
  const toggleRecipe = (mealType, index) => {
    const key = `${mealType}-${index}`;
    setExpandedRecipes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const isRecipeExpanded = (mealType, index) => {
    const key = `${mealType}-${index}`;
    return expandedRecipes[key] || false;
  };

  // Helper function to format recipe property with proper capitalization for display
  const formatRecipe = (recipe) => {
    if (!recipe) return null;
    
    // Create a properly formatted version for display
    return {
      name: recipe.name || recipe.Name || "Unknown recipe",
      calories: recipe.calories || recipe.Calories || 0,
      ingredients: recipe.recipeingredientparts || recipe.RecipeIngredientParts || "Ingredients not available",
      cookTime: recipe.cooktime || recipe.CookTime || "30 min",
      prepTime: recipe.preptime || recipe.PrepTime || "15 min",
      totalTime: recipe.totaltime || recipe.TotalTime || "45 min"
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Prepare data to send to the backend
    const data = {
      age,
      height,
      weight,
      gender,
      activityLevel,
      weightGoal
    };
    
    console.log('Submitting nutrition data:', data);
    
    // Make API call to Flask backend
    fetch('http://localhost:5000/api/nutrition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      console.log('Response status:', response.status);
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || 'Server error: ' + response.status);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Received nutrition data:', data);
      
      // Check if we have recipe recommendations
      if (!data.recipes || 
          (!data.recipes.breakfast?.length && 
           !data.recipes.lunch?.length && 
           !data.recipes.dinner?.length)) {
        console.warn('No recipe recommendations received');
        
        // Add fallback recipes if none were returned
        data.recipes = data.recipes || {};
        data.recipes.breakfast = data.recipes.breakfast || [{
          Name: "Oatmeal with Fruit",
          Calories: Math.round(data.calories * 0.3 * 0.8),
          RecipeIngredientParts: "1 cup oats, 1 cup milk, 1 tbsp honey, 1/2 cup mixed berries",
          CookTime: "10 min",
          PrepTime: "5 min",
          TotalTime: "15 min"
        }];
        data.recipes.lunch = data.recipes.lunch || [{
          Name: "Grilled Chicken Salad",
          Calories: Math.round(data.calories * 0.4 * 0.8),
          RecipeIngredientParts: "4 oz chicken breast, 2 cups mixed greens, 1/4 cup tomatoes, 2 tbsp olive oil",
          CookTime: "15 min",
          PrepTime: "10 min",
          TotalTime: "25 min"
        }];
        data.recipes.dinner = data.recipes.dinner || [{
          Name: "Baked Salmon with Vegetables",
          Calories: Math.round(data.calories * 0.3 * 0.8),
          RecipeIngredientParts: "5 oz salmon fillet, 1 cup broccoli, 1/2 cup sweet potato, 1 tbsp olive oil",
          CookTime: "20 min",
          PrepTime: "10 min",
          TotalTime: "30 min"
        }];
      }
      
      setNutritionData(data);
      setLoading(false);
      setSubmitted(true);
    })
    .catch(error => {
      console.error('Error fetching nutrition data:', error);
      
      // Set a more specific error message
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        setError('Unable to connect to the server. Please check if the Flask backend is running at http://localhost:5000');
      } else {
        setError(`Failed to get recommendations: ${error.message || 'Please try again later.'}`);
      }
      
      setLoading(false);
    });
  };

  const downloadMealPlan = () => {
    if (!nutritionData) return;

    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Set font size and type
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    
    // Add title
    doc.text('InertiaFit Personalized Meal Plan', 105, 20, { align: 'center' });
    
    // Add user stats
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated for: ${gender}, Age ${age}`, 20, 40);
    doc.text(`Height: ${height} cm, Weight: ${weight} kg`, 20, 50);
    doc.text(`BMI: ${nutritionData.bmi} - Category: ${nutritionData.category}`, 20, 60);
    doc.text(`Goal: ${weightGoal} weight`, 20, 70);
    
    // Add daily intake information
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommended Daily Intake', 20, 90);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Calories: ${nutritionData.calories} kcal`, 30, 105);
    doc.text(`Protein: ${nutritionData.protein} g`, 30, 115);
    doc.text(`Carbohydrates: ${nutritionData.carbs} g`, 30, 125);
    doc.text(`Fats: ${nutritionData.fats} g`, 30, 135);
    
    // Add AI-recommended recipes
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AI-Recommended Recipes', 20, 155);
    
    let yPosition = 170;
    
    if (nutritionData.recipes?.breakfast?.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Breakfast Recipes:', 30, yPosition);
      yPosition += 10;
      
      nutritionData.recipes.breakfast.forEach(rawRecipe => {
        const recipe = formatRecipe(rawRecipe);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${recipe.name} (${recipe.calories} calories)`, 40, yPosition);
        yPosition += 10;
        
        // Check if we need to start a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 30;
        }
      });
      
      yPosition += 5;
    }
    
    if (nutritionData.recipes?.lunch?.length > 0) {
      // Check if we need to start a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Lunch Recipes:', 30, yPosition);
      yPosition += 10;
      
      nutritionData.recipes.lunch.forEach(rawRecipe => {
        const recipe = formatRecipe(rawRecipe);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${recipe.name} (${recipe.calories} calories)`, 40, yPosition);
        yPosition += 10;
        
        // Check if we need to start a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 30;
        }
      });
      
      yPosition += 5;
    }
    
    if (nutritionData.recipes?.dinner?.length > 0) {
      // Check if we need to start a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Dinner Recipes:', 30, yPosition);
      yPosition += 10;
      
      nutritionData.recipes.dinner.forEach(rawRecipe => {
        const recipe = formatRecipe(rawRecipe);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${recipe.name} (${recipe.calories} calories)`, 40, yPosition);
        yPosition += 10;
        
        // Check if we need to start a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 30;
        }
      });
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.text('This meal plan is a general guideline. Consult with a registered dietitian for personalized advice.', 105, 280, { align: 'center' });
    
    // Save the PDF with a specific name
    doc.save(`InertiaFit_MealPlan_${weightGoal.toLowerCase()}_weight.pdf`);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      <div className="container mx-auto px-1 sm:px-2 md:px-4 py-6 sm:py-8 md:py-12 max-w-7xl">
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 sm:mb-4 text-orange-500">Personalized Food Recommendation System</h1>
          <p className="text-gray-400 text-sm sm:text-base">Get customized meal recommendations based on your body metrics and goals</p>
        </div>
        
        {!submitted ? (
          <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 max-w-md mx-auto">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">Enter Your Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 sm:mb-6">
                <label htmlFor="age" className="block text-sm sm:text-base font-medium mb-1">Age</label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  min="1"
                />
              </div>
              
              <div className="mb-4 sm:mb-6">
                <label htmlFor="height" className="block text-sm sm:text-base font-medium mb-1">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div className="mb-4 sm:mb-6">
                <label htmlFor="weight" className="block text-sm sm:text-base font-medium mb-1">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  step="0.01"
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div className="mb-4 sm:mb-6">
                <label htmlFor="gender" className="block text-sm sm:text-base font-medium mb-1">Gender</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <label htmlFor="activityLevel" className="block text-sm sm:text-base font-medium mb-1">Activity Level</label>
                <select
                  id="activityLevel"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                >
                  <option value="Little/no exercise">Little/no exercise</option>
                  <option value="Light exercise">Light exercise (1-3 days/week)</option>
                  <option value="Moderate exercise">Moderate exercise (3-5 days/week)</option>
                  <option value="Heavy exercise">Heavy exercise (6-7 days/week)</option>
                  <option value="Very heavy exercise">Very heavy exercise (twice daily)</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="weightGoal" className="block text-sm sm:text-base font-medium mb-1">Weight Goal</label>
                <select
                  id="weightGoal"
                  value={weightGoal}
                  onChange={(e) => setWeightGoal(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                >
                  <option value="Lose">Lose weight</option>
                  <option value="Maintain">Maintain weight</option>
                  <option value="Gain">Gain weight</option>
                </select>
              </div>
              
              {error && (
                <div className="mb-6 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-100 rounded-md">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 sm:py-3 px-4 rounded-md transition-colors duration-300 text-sm sm:text-base"
              >
                Generate Recommendations
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-black p-8 rounded-lg shadow-lg">
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h2 className="text-xl font-semibold mb-2">Your BMI: {nutritionData.bmi} kg/m² - Category: {nutritionData.category}</h2>
              
              {/* BMI Scale Visualization */}
              <div className="mt-4 mb-6">
                <div className="relative h-8 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex">
                    <div className="w-1/4 bg-blue-500" title="Underweight"></div>
                    <div className="w-1/4 bg-green-500" title="Normal weight"></div>
                    <div className="w-1/4 bg-yellow-500" title="Overweight"></div>
                    <div className="w-1/4 bg-red-500" title="Obesity"></div>
                  </div>
                  
                  {/* BMI Pointer */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-white"
                    style={{ 
                      left: `${Math.min(Math.max((parseFloat(nutritionData.bmi) - 10) * 100 / 30, 0), 100)}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-bold px-2 py-1 bg-white text-black rounded">
                      {nutritionData.bmi}
                    </div>
                  </div>
                </div>
                
                {/* BMI Scale Labels */}
                <div className="flex justify-between text-xs mt-1">
                  <span>Underweight<br/>&lt;18.5</span>
                  <span>Normal<br/>18.5-24.9</span>
                  <span>Overweight<br/>25-29.9</span>
                  <span>Obesity<br/>&gt;30</span>
                </div>
              </div>
              
              <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg mb-6 max-w-5xl mx-auto">
                <h3 className="text-base sm:text-lg font-medium mb-2">Recommended Daily Intake:</h3>
                <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                  <li className="flex justify-between">
                    <span>Calories:</span>
                    <span className="font-semibold">{nutritionData.calories} kcal</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Protein:</span>
                    <span className="font-semibold">{nutritionData.protein} g</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Carbohydrates:</span>
                    <span className="font-semibold">{nutritionData.carbs} g</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Fats:</span>
                    <span className="font-semibold">{nutritionData.fats} g</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-orange-500">AI-Recommended Recipes Based on Your Goals</h3>
                
                {/* ML-Based Recipe Recommendations */}
                {nutritionData.recipes && (
                  nutritionData.recipes.breakfast.length > 0 || 
                  nutritionData.recipes.lunch.length > 0 || 
                  nutritionData.recipes.dinner.length > 0
                ) ? (
                  <div className="space-y-6 sm:space-y-10">
                    {/* Breakfast Recipes */}
                    {nutritionData.recipes.breakfast.length > 0 && (
                      <div className="mb-4 sm:mb-8">
                        <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 text-center bg-gray-800 py-2 rounded-t-lg">Breakfast Recipes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-w-6xl mx-auto">
                          {nutritionData.recipes.breakfast.map((rawRecipe, index) => {
                            const recipe = formatRecipe(rawRecipe);
                            return (
                              <div 
                                key={index} 
                                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-orange-500/30 hover:-translate-y-1 cursor-pointer text-xs sm:text-sm md:text-base"
                                onClick={() => toggleRecipe('breakfast', index)}
                              >
                                <div className="p-2 sm:p-3 md:p-4 border-b border-gray-700">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-orange-500 font-semibold text-sm sm:text-base md:text-xl truncate pr-1 sm:pr-2">{recipe.name}</h5>
                                    <span className="text-white font-medium text-xs sm:text-sm whitespace-nowrap">{recipe.calories} cal</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1 sm:mt-2">
                                    <div className="flex gap-2 sm:gap-3 text-xs text-gray-400">
                                      {recipe.prepTime && (
                                        <span className="flex items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <strong className="text-orange-400">PT:</strong> {recipe.prepTime}
                                        </span>
                                      )}
                                      {recipe.cookTime && (
                                        <span className="flex items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                          </svg>
                                          <strong className="text-orange-400">CT:</strong> {recipe.cookTime}
                                        </span>
                                      )}
                                    </div>
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform duration-300 ${isRecipeExpanded('breakfast', index) ? 'rotate-180' : ''}`} 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                                
                                {isRecipeExpanded('breakfast', index) && recipe.ingredients && (
                                  <div className="p-2 sm:p-3 md:p-4 bg-gray-900/50 animate-fadeIn">
                                    <h6 className="text-xs sm:text-sm font-semibold text-gray-300 mb-1">Ingredients:</h6>
                                    <p className="text-xs sm:text-sm text-gray-400">{recipe.ingredients}</p>
                                    {recipe.totalTime && (
                                      <div className="mt-2 sm:mt-3 flex items-center text-xs text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                        <strong className="text-orange-400">Total Time:</strong> {recipe.totalTime}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Lunch Recipes */}
                    {nutritionData.recipes.lunch.length > 0 && (
                      <div className="mb-4 sm:mb-8">
                        <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 text-center bg-gray-800 py-2 rounded-t-lg">Lunch Recipes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-w-6xl mx-auto">
                          {nutritionData.recipes.lunch.map((rawRecipe, index) => {
                            const recipe = formatRecipe(rawRecipe);
                            return (
                              <div 
                                key={index} 
                                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-orange-500/30 hover:-translate-y-1 cursor-pointer text-xs sm:text-sm md:text-base"
                                onClick={() => toggleRecipe('lunch', index)}
                              >
                                <div className="p-2 sm:p-3 md:p-4 border-b border-gray-700">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-orange-500 font-semibold text-sm sm:text-base md:text-xl truncate pr-1 sm:pr-2">{recipe.name}</h5>
                                    <span className="text-white font-medium text-xs sm:text-sm whitespace-nowrap">{recipe.calories} cal</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1 sm:mt-2">
                                    <div className="flex gap-2 sm:gap-3 text-xs text-gray-400">
                                      {recipe.prepTime && (
                                        <span className="flex items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <strong className="text-orange-400">PT:</strong> {recipe.prepTime}
                                        </span>
                                      )}
                                      {recipe.cookTime && (
                                        <span className="flex items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                          </svg>
                                          <strong className="text-orange-400">CT:</strong> {recipe.cookTime}
                                        </span>
                                      )}
                                    </div>
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform duration-300 ${isRecipeExpanded('lunch', index) ? 'rotate-180' : ''}`} 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                                
                                {isRecipeExpanded('lunch', index) && recipe.ingredients && (
                                  <div className="p-2 sm:p-3 md:p-4 bg-gray-900/50 animate-fadeIn">
                                    <h6 className="text-xs sm:text-sm font-semibold text-gray-300 mb-1">Ingredients:</h6>
                                    <p className="text-xs sm:text-sm text-gray-400">{recipe.ingredients}</p>
                                    {recipe.totalTime && (
                                      <div className="mt-2 sm:mt-3 flex items-center text-xs text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                        <strong className="text-orange-400">Total Time:</strong> {recipe.totalTime}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Dinner Recipes */}
                    {nutritionData.recipes.dinner.length > 0 && (
                      <div className="mb-4 sm:mb-8">
                        <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 text-center bg-gray-800 py-2 rounded-t-lg">Dinner Recipes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-w-6xl mx-auto">
                          {nutritionData.recipes.dinner.map((rawRecipe, index) => {
                            const recipe = formatRecipe(rawRecipe);
                            return (
                              <div 
                                key={index} 
                                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-orange-500/30 hover:-translate-y-1 cursor-pointer text-xs sm:text-sm md:text-base"
                                onClick={() => toggleRecipe('dinner', index)}
                              >
                                <div className="p-2 sm:p-3 md:p-4 border-b border-gray-700">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-orange-500 font-semibold text-sm sm:text-base md:text-xl truncate pr-1 sm:pr-2">{recipe.name}</h5>
                                    <span className="text-white font-medium text-xs sm:text-sm whitespace-nowrap">{recipe.calories} cal</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1 sm:mt-2">
                                    <div className="flex gap-2 sm:gap-3 text-xs text-gray-400">
                                      {recipe.prepTime && (
                                        <span className="flex items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <strong className="text-orange-400">PT:</strong> {recipe.prepTime}
                                        </span>
                                      )}
                                      {recipe.cookTime && (
                                        <span className="flex items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                          </svg>
                                          <strong className="text-orange-400">CT:</strong> {recipe.cookTime}
                                        </span>
                                      )}
                                    </div>
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform duration-300 ${isRecipeExpanded('dinner', index) ? 'rotate-180' : ''}`} 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                                
                                {isRecipeExpanded('dinner', index) && recipe.ingredients && (
                                  <div className="p-2 sm:p-3 md:p-4 bg-gray-900/50 animate-fadeIn">
                                    <h6 className="text-xs sm:text-sm font-semibold text-gray-300 mb-1">Ingredients:</h6>
                                    <p className="text-xs sm:text-sm text-gray-400">{recipe.ingredients}</p>
                                    {recipe.totalTime && (
                                      <div className="mt-2 sm:mt-3 flex items-center text-xs text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                        <strong className="text-orange-400">Total Time:</strong> {recipe.totalTime}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 bg-gray-800 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-gray-400 mb-2">No recipe recommendations found.</p>
                    <p className="text-sm text-gray-500">This could be due to an issue with the recipe dataset or our recommendation system.</p>
                  </div>
                )}
                
                <div className="mt-8 p-4 bg-orange-500 bg-opacity-20 border border-orange-500 rounded-lg">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">
                      <strong>Note:</strong> These recommendations are generated by our machine learning algorithm based on your inputs. For personalized nutrition advice, please consult with a registered dietitian or nutritionist.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 text-center space-x-2 sm:space-x-4 flex justify-center">
                  <button 
                    onClick={downloadMealPlan}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-md transition-colors duration-300 inline-flex items-center shadow-lg text-sm sm:text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="whitespace-nowrap">Download PDF</span>
                  </button>
                  
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-md transition-colors duration-300 shadow-lg text-sm sm:text-base"
                  >
                    New Recommendation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default NutritionPage; 