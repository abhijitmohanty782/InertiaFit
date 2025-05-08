import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import { format, parseISO, subDays } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage = () => {
  // User data state that will be fetched from MongoDB
  
  const [userData, setUserData] = useState({
    name: '',
    age: 0,
    height: 0, 
    weight: 0, 
    bmi: 0,
    bmiCategory: '',
    joinDate: '',
    email: '',
    avatarUrl: 'https://api.dicebear.com/7.x/big-smile/svg?seed=JohnDoe&backgroundColor=f97316',
  });

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    age: 0,
    height: 0,
    weight: 0,
    gender: '',
    activityLevel: '',
    weightGoal: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Nutrition Form State (from NutritionPage)
  const [age, setAge] = useState(0);
  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [gender, setGender] = useState('Male');
  const [activityLevel, setActivityLevel] = useState('Little/no exercise');
  const [weightGoal, setWeightGoal] = useState('Maintain');

  // Nutrition UI State
  const [nutritionSubmitted, setNutritionSubmitted] = useState(false);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState(null);
  const [expandedRecipes, setExpandedRecipes] = useState({});

  // Mock nutrition data
  const [nutritionData, setNutritionData] = useState({
    calories: 2200,
    protein: 120,
    carbs: 220,
    fats: 73,
    bmi: 0,
    category: 'Unknown'
  });

  // Add state for custom nutrition section
  // State for nutritional preferences (from CustomizedNutritionPage)
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

  const [customNutritionLoading, setCustomNutritionLoading] = useState(false);
  const [customNutritionError, setCustomNutritionError] = useState(null);
  const [customNutritionRecommendations, setCustomNutritionRecommendations] = useState(null);

  // New state for food data from MongoDB
  const [foodData, setFoodData] = useState({
    daily_food_summary: [{
      breakfast: { calories: 0, name: '', prepTime: '', cookTime: '', totalTime: '', ingredients: '' },
      lunch: { calories: 0, name: '', prepTime: '', cookTime: '', totalTime: '', ingredients: '' },
      dinner: { calories: 0, name: '', prepTime: '', cookTime: '', totalTime: '', ingredients: '' },
      extra: []
    }]
  });
  const [foodDataLoading, setFoodDataLoading] = useState(false);
  const [foodDataError, setFoodDataError] = useState(null);
  const [selectedFoodDate, setSelectedFoodDate] = useState(new Date().toISOString().split('T')[0]);

  // Exercise data state
  const [exerciseData, setExerciseData] = useState({
    exercise_summary: []
  });
  const [exerciseDataLoading, setExerciseDataLoading] = useState(false);
  const [exerciseDataError, setExerciseDataError] = useState(null);
  const [exerciseFormData, setExerciseFormData] = useState({
    'sit-up': 0,
    'pull-up': 0,
    'push-up': 0,
    'squat': 0,
    'walk': 0
  });
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exerciseSubmissionLoading, setExerciseSubmissionLoading] = useState(false);
  const [exerciseSubmissionError, setExerciseSubmissionError] = useState(null);
  const [exerciseSubmissionSuccess, setExerciseSubmissionSuccess] = useState(false);

  // Exercise history data for charts
  const [exerciseHistory, setExerciseHistory] = useState({
    exercise_summary: []
  });
  const [exerciseHistoryLoading, setExerciseHistoryLoading] = useState(false);
  const [exerciseHistoryError, setExerciseHistoryError] = useState(null);
  const [historyDays, setHistoryDays] = useState(5); // Default to 5 days

  // Mock daily activities log
  const [activityLog, setActivityLog] = useState([]);

  // Mock recommended food
  const [recommendedFood, setRecommendedFood] = useState({
    breakfast: [
      { name: 'Avocado Toast with Eggs', calories: 380, protein: 20, carbs: 30, fats: 22 },
      { name: 'Protein Smoothie Bowl', calories: 340, protein: 24, carbs: 42, fats: 10 }
    ],
    lunch: [
      { name: 'Grilled Chicken Salad', calories: 450, protein: 35, carbs: 25, fats: 22 },
      { name: 'Quinoa Buddha Bowl', calories: 520, protein: 18, carbs: 58, fats: 24 }
    ],
    dinner: [
      { name: 'Baked Salmon with Vegetables', calories: 480, protein: 32, carbs: 20, fats: 28 },
      { name: 'Lean Beef Stir Fry', calories: 520, protein: 38, carbs: 32, fats: 22 }
    ],
    snacks: [
      { name: 'Greek Yogurt with Berries', calories: 180, protein: 18, carbs: 15, fats: 5 },
      { name: 'Protein Bar', calories: 220, protein: 20, carbs: 22, fats: 8 }
    ]
  });

  // Mock exercise recommendations
  const [recommendedExercises, setRecommendedExercises] = useState([
    { name: 'Morning Cardio', type: 'Cardio', duration: '30 min', description: 'Jogging or brisk walking' },
    { name: 'Upper Body Strength', type: 'Strength', duration: '45 min', description: 'Focus on chest, shoulders, and arms' },
    { name: 'Yoga Session', type: 'Flexibility', duration: '30 min', description: 'Focus on stretching and mindfulness' }
  ]);

  // Dashboard UI state
  const [activeTab, setActiveTab] = useState('overview');
  // Initialize selectedDate with the first date from activityLog
  const [selectedDate, setSelectedDate] = useState('2023-11-15');

  // Add state for selected foods
  const [selectedFoods, setSelectedFoods] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
    extra: null
  });
  const [foodSubmissionLoading, setFoodSubmissionLoading] = useState(false);
  const [foodSubmissionError, setFoodSubmissionError] = useState(null);
  const [foodSubmissionSuccess, setFoodSubmissionSuccess] = useState(false);

  // Add new state variables
  const [isEditingExercise, setIsEditingExercise] = useState(false);

  // Handle food selection
  const handleFoodSelection = (mealType, recipe) => {
    setSelectedFoods(prev => ({
      ...prev,
      [mealType]: recipe
    }));
  };

  // Handle food submission
  const handleFoodSubmission = async (type) => {
    // Validate that all meals are selected

    if (type===null && (!selectedFoods.breakfast || !selectedFoods.lunch || !selectedFoods.dinner)) {
      setFoodSubmissionError('Please select a meal for breakfast, lunch, and dinner');
      return;
    }
    else if(type==="extra" && !selectedFoods.extra){
      setFoodSubmissionError('Please select a meal for extra');
      return;
    }

    // Check if user ID is available
    if (!userData.id) {
      setFoodSubmissionError('User ID not found. Please log in again.');
      return;
    }

    setFoodSubmissionLoading(true);
    setFoodSubmissionError(null);
    setFoodSubmissionSuccess(false);

    try {
      
      const response =type!=='extra'? await fetch(`http://localhost:5000/api/user/${userData.id}/foods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({breakfast: selectedFoods.breakfast,
          lunch: selectedFoods.lunch,
          dinner: selectedFoods.dinner,
          extra: []
      })}):await fetch(`http://localhost:5000/api/user/${userData.id}/foods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          extra: type === 'extra' ? [selectedFoods.extra] : []
      })});

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save food selections');
      }

      setFoodSubmissionSuccess(true);
      // Reset selections after successful submission
      setSelectedFoods({
        breakfast: null,
        lunch: null,
        dinner: null
      });
      fetchExerciseData(selectedFoodDate);
      fetchFoodData(selectedFoodDate);
    } catch (error) {
      setFoodSubmissionError(error.message);
    } finally {
      setFoodSubmissionLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from localStorage (set during login)
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!storedUser || !token) {
          console.error('Missing user data or token');
          // Redirect to login if not authenticated
          window.location.href = '/auth';
          return;
        }
        
        const user = JSON.parse(storedUser);
        
        // Calculate BMI if height and weight are available
        let bmi = 0;
        let bmiCategory = 'Unknown';
        
        if (user.height && user.weight) {
          const heightInMeters = user.height / 100;
          bmi = user.weight / (heightInMeters * heightInMeters);
          bmiCategory = getBMICategory(bmi);
        }
        
        // Update user data state with localStorage data
        setUserData(prev=>({
          ...prev,
          id: user.id, // Add the user ID
          name: user.name || 'User',
          age: user.age || 0,
          height: user.height || 0,
          weight: user.weight || 0,
          bmi: bmi.toFixed(1),
          bmiCategory: bmiCategory,
          joinDate: formatJoinDate(user.joinDate),
          email: user.email || 'user@example.com',
          avatarUrl: `https://api.dicebear.com/7.x/big-smile/svg?seed=${user.name || 'User'}&backgroundColor=f97316`,
        }));
        
        // Initialize edit form data with existing user data
        setEditFormData(prev => ({...prev,
          name: user.name || '',
          age: user.age || 0,
          height: user.height || 0,
          weight: user.weight || 0,
          gender: user.gender || 'Male',
          activityLevel: user.activityLevel || 'Little/no exercise',
          weightGoal: user.weightGoal || 'Maintain'
        }));
        
        // Also update the nutrition form state
        setAge(()=> user.age || 0);
        setHeight(()=>user.height || 0);
        setWeight(()=>user.weight || 0);
        setGender(()=>user.gender || 'Male');
        setActivityLevel(()=>user.activityLevel || 'Little/no exercise');
        setWeightGoal(()=>user.weightGoal || 'Maintain');
        
        // If localStorage data incomplete, try to fetch from API
        if (!user.age || !user.height || !user.weight) {
          try {
            const response = await axios.get(`http://localhost:5000/api/user/${user.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.data) {
              const userDetails = response.data;
              
              // Calculate BMI with API data
              if (userDetails.height && userDetails.weight) {
                const heightInMeters = userDetails.height / 100;
                bmi = userDetails.weight / (heightInMeters * heightInMeters);
                bmiCategory = getBMICategory(bmi);
              }
              
              // Update user data state with API data
              setUserData(prev => ({...prev,
                id: user.id, // Ensure ID is preserved
                name: userDetails.name || 'User',
                age: userDetails.age || 0,
                height: userDetails.height || 0,
                weight: userDetails.weight || 0,
                bmi: bmi.toFixed(1),
                bmiCategory: bmiCategory,
                joinDate: formatJoinDate(userDetails.joinDate),
                email: userDetails.email || 'user@example.com',
                avatarUrl: `https://api.dicebear.com/7.x/big-smile/svg?seed=${userDetails.name || 'User'}&backgroundColor=f97316`,
              }));
              
              // Update form data with API data
              setEditFormData(prev=>({...prev,
                name: userDetails.name || '',
                age: userDetails.age || 0,
                height: userDetails.height || 0,
                weight: userDetails.weight || 0,
                gender: userDetails.gender || 'Male',
                activityLevel: userDetails.activityLevel || 'Little/no exercise',
                weightGoal: userDetails.weightGoal || 'Maintain'
              }));
              
              // Update nutrition form state with API data
              setAge(()=>userDetails.age || 0);
              setHeight(()=>userDetails.height || 0);
              setWeight(()=>userDetails.weight || 0);
              setGender(()=>userDetails.gender || 'Male');
              setActivityLevel(()=>userDetails.activityLevel || 'Little/no exercise');
              setWeightGoal(()=>userDetails.weightGoal || 'Maintain');
              
              // Update the localStorage user data
              localStorage.setItem('user', JSON.stringify({
                ...userDetails,
                id: user.id // Ensure ID is preserved in localStorage
              }));
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            
            if (error.response?.status === 401) {
              // Token expired or invalid
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/auth';
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error processing user data:', error);
      }
    };
    
    fetchUserData();
  }, []);
  // Add this to your component to log when foodData actually changes
// useEffect(() => {
//   console.log('foodData updated:', exerciseData);
// }, [foodData]);
  // Fetch food data when selected date changes
  // useEffect(() => {
  //   if (selectedFoodDate) {
  //     fetchFoodData(selectedFoodDate);
  //   }
  // }, [selectedFoodDate]);
  
  // Helper function to format join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };
  
  // Function to get BMI category
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obesity';
  };
  
  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' 
        ? parseFloat(value) 
        : value
    }));
  };
  
  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!storedUser || !token) {
        throw new Error('Authentication information missing');
      }
      
      const user = JSON.parse(storedUser);
      if (!user?.id) {
        throw new Error('Invalid user information. Please log in again.');
      }
      // Validate form data before sending
      if (editFormData.height <= 0 || editFormData.weight <= 0 || editFormData.age <= 0) {
        setUpdateError('Invalid values: Age, height, and weight must be positive numbers');
        setUpdateLoading(false);
        return;
      }
      
      const response = await axios.put(
        `http://localhost:5000/api/user/${user.id}`, 
        editFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data) {
        const updatedUser = response.data;
        
        // Calculate new BMI
        const heightInMeters = editFormData.height / 100;
        const bmi = editFormData.weight / (heightInMeters * heightInMeters);
        const bmiCategory = getBMICategory(bmi);
        
        // Update component state with new data
        setUserData(prev => ({
          ...prev,
          name: updatedUser.user.name,
          age: updatedUser.user.age,
          height: updatedUser.user.height,
          weight: updatedUser.user.weight,
          bmi: bmi.toFixed(1),
          bmiCategory: bmiCategory,
          avatarUrl: `https://api.dicebear.com/7.x/big-smile/svg?seed=${updatedUser.user.name}&backgroundColor=f97316`,
        }));
        console.log(updatedUser,userData);
        // Update nutrition form state
        setAge(()=>updatedUser.user.age);
        setHeight(()=>updatedUser.user.height);
        setWeight(()=>updatedUser.user.weight);
        setGender(()=>updatedUser.user.gender);
        setActivityLevel(()=>updatedUser.user.activityLevel);
        setWeightGoal(()=>updatedUser.user.weightGoal);
        
        // Also update localStorage with complete user data
        const updatedLocalUser = {
          ...JSON.parse(storedUser),
          ...updatedUser.user,
          // Include additional fields not returned from API
          id: user.id,
          joinDate: user.joinDate
        };
        localStorage.setItem('user', JSON.stringify(updatedLocalUser));
        
        setUpdateSuccess(true);
        
        // Exit edit mode after successful update
        setTimeout(() => {
          setIsEditing(false);
          setUpdateSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        return;
      }
      
      setUpdateError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdateError(null);
    // Reset form data to current user data
    setEditFormData({
      name: userData.name,
      age: userData.age,
      height: userData.height,
      weight: userData.weight,
      gender: gender,
      activityLevel: activityLevel,
      weightGoal: weightGoal
    });
  };

  // Helper function to get activity data for a specific date
  const getActivityByDate = (date) => {
    return activityLog.find(activity => activity.date === date) || null;
  };

  // Helper function to get available dates for the dropdown
  const getAvailableDates = () => {
    return activityLog.map(activity => activity.date);
  };

  // Fetch food data for a specific date
  const fetchFoodData = async (date) => {
    if (!userData.id) return;
    
      setFoodDataLoading(true);
      setFoodDataError(null);
      
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/user/${userData.id}/food-data/${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Ensure we always have a valid structure even if no data is returned
      setFoodData(response.data || { daily_food_summary: [] });
    } catch (error) {
      console.error('Error fetching food data:', error);
      setFoodDataError(error.response?.data?.error || 'Failed to fetch food data');
      setFoodData({ daily_food_summary: [] });
    } finally {
      setFoodDataLoading(false);
    }
  };

  // Update the fetchExerciseData function
  const fetchExerciseData = async (date) => {
    if (!userData.id) return;
    
    setExerciseDataLoading(true);
    setExerciseDataError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/user/${userData.id}/exercise-data/${date}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
      });
      
      console.log('Exercise data response:', response.data); // Debug log
      
      // Transform the data to handle MongoDB number format
      const transformedData = {
        exercise_summary: []
      };

      if (response.data && response.data.exercise_summary) {
        transformedData.exercise_summary = response.data.exercise_summary.map(summary => ({
          date: summary.date,
          'sit-up': parseInt(summary['sit-up']?.$numberInt || summary['sit-up'] || 0),
          'pull-up': parseInt(summary['pull-up']?.$numberInt || summary['pull-up'] || 0),
          'push-up': parseInt(summary['push-up']?.$numberInt || summary['push-up'] || 0),
          'squat': parseInt(summary['squat']?.$numberInt || summary['squat'] || 0),
          'walk': parseInt(summary['walk']?.$numberInt || summary['walk'] || 0)
        }));
      }

      console.log('Transformed exercise data:', transformedData); // Debug log
      setExerciseData(transformedData);
      
    } catch (error) {
      console.error('Error fetching exercise data:', error);
      setExerciseDataError(error.response?.data?.error || 'Failed to fetch exercise data');
      setExerciseData({ exercise_summary: [] });
    } finally {
      setExerciseDataLoading(false);
    }
  };

  // Fetch exercise history data for a number of days
  const fetchExerciseHistory = async (days = 5) => {
    if (!userData.id) return;
    
    setExerciseHistoryLoading(true);
    setExerciseHistoryError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/user/${userData.id}/exercise-history?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setExerciseHistory(response.data);
    } catch (error) {
      console.error('Error fetching exercise history:', error);
      setExerciseHistoryError(error.response?.data?.error || 'Failed to fetch exercise history');
      setExerciseHistory(null);
    } finally {
      setExerciseHistoryLoading(false);
    }
  };

  // Handle exercise form input changes
  const handleExerciseInputChange = (e) => {
    const { name, value } = e.target;
    setExerciseFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  // Handle exercise form submission
  const handleExerciseSubmit = async (e) => {
    e.preventDefault();
    
    if (!userData.id) return;
    
    try {
      const token = localStorage.getItem('token');
      const data = {
        date: selectedFoodDate,
        'sit-up': parseInt(exerciseFormData['sit-up']) || 0,
        'pull-up': parseInt(exerciseFormData['pull-up']) || 0,
        'push-up': parseInt(exerciseFormData['push-up']) || 0,
        'squat': parseInt(exerciseFormData['squat']) || 0,
        'walk': parseInt(exerciseFormData['walk']) || 0
      };
      
      await axios.post(`http://localhost:5000/api/user/${userData.id}/exercise-data`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Reset form and state
      setShowExerciseForm(false);
      setIsEditingExercise(false);
      
      // Refresh exercise data
      fetchExerciseData(selectedFoodDate);
    } catch (error) {
      console.error('Error saving exercise data:', error);
      setExerciseDataError('Failed to save exercise data');
    }
  };

  // Helper functions for recipe display
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

  // Helper function to format recipe properties properly
  const formatRecipe = (recipe) => {
    if (!recipe) return null;
    
    // Convert ingredients to array if it's not already one
    let ingredients = recipe.recipeingredientparts || recipe.RecipeIngredientParts || "Ingredients not available";
    
    // If ingredients is already an array, join it with commas
    if (Array.isArray(ingredients)) {
      ingredients = ingredients.join(', ');
    }
    
    return {
      name: recipe.name || recipe.Name || "Unknown recipe",
      calories: recipe.calories || recipe.Calories || 0,
      ingredients: ingredients,
      cookTime: recipe.cooktime || recipe.CookTime || "30 min",
      prepTime: recipe.preptime || recipe.PrepTime || "15 min",
      totalTime: recipe.totaltime || recipe.TotalTime || "45 min"
    };
  };

  // Handle nutrition form submission
  const handleNutritionSubmit = (e) => {
    e.preventDefault();
    setNutritionLoading(true);
    setNutritionError(null);
    
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
      setNutritionLoading(false);
      setNutritionSubmitted(true);
    })
    .catch(error => {
      console.error('Error fetching nutrition data:', error);
      
      // Set a more specific error message
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        setNutritionError('Unable to connect to the server. Please check if the Flask backend is running at http://localhost:5000');
      } else {
        setNutritionError(`Failed to get recommendations: ${error.message || 'Please try again later.'}`);
      }
      
      setNutritionLoading(false);
    });
  };

  // Handle slider changes for custom nutrition
  const handleSliderChange = (name, value) => {
    setNutritionPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle custom nutrition form submission
  const handleCustomNutritionSubmit = async (e) => {
    e.preventDefault();
    setCustomNutritionLoading(true);
    setCustomNutritionError(null);

    try {
      const response = await fetch('http://localhost:5000/api/custom-nutrition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        })
      });

      if (!response.ok) {
        if (response.status === 0) {
          throw new Error('Unable to connect to the server. Please make sure the backend server is running on port 5000.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recommendations');
      }

      const data = await response.json();
      if (!data || data.length === 0) {
        throw new Error('No recommendations found for the given nutritional values.');
      }
      setCustomNutritionRecommendations(data);
    } catch (err) {
      setCustomNutritionError(err.message || 'Failed to get recommendations. Please try again later.');
      console.error('Error:', err);
    } finally {
      setCustomNutritionLoading(false);
    }
  };
  
  // Render Overview Dashboard Section
  const renderOverviewSection = () => {
    // Ensure we have valid arrays to work with
    const foodSummary = foodData?.daily_food_summary?.[0] || {
      breakfast: { calories: 0, name: '', prepTime: '', cookTime: '', totalTime: '', ingredients: '' },
      lunch: { calories: 0, name: '', prepTime: '', cookTime: '', totalTime: '', ingredients: '' },
      dinner: { calories: 0, name: '', prepTime: '', cookTime: '', totalTime: '', ingredients: '' },
      extra: []
    };
    const exerciseSummaries = exerciseData?.exercise_summary || [];
    const selectedDateExercises = exerciseSummaries.filter(summary => summary?.date === selectedFoodDate) || [];
    
    // Calculate total steps for the selected date
    const totalSteps = selectedDateExercises.reduce((total, summary) => total + (summary['walk'] || 0), 0);
    
    // Calculate total calories burned for the selected date
    const totalCaloriesBurned = selectedDateExercises.reduce((total, summary) => {
      return total + parseFloat(calculateTotalCaloriesBurned(summary) || 0);
    }, 0);

    // Calculate total food calories with null checks
    const totalFoodCalories = (
      (foodSummary?.breakfast?.calories || 0) +
      (foodSummary?.lunch?.calories || 0) +
      (foodSummary?.dinner?.calories || 0) +
      (Array.isArray(foodSummary?.extra) 
        ? foodSummary.extra.reduce((sum, item) => sum + (item?.calories || 0), 0)
        : (foodSummary?.extra?.calories || 0))
    );

    return (
      <div className="animate-fadeIn">
        {/* User Profile Card */}
        <div className="mb-6 bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-32 h-32 mb-4 md:mb-0 md:mr-6">
              <img 
                src={userData.avatarUrl} 
                alt={userData.name} 
                className="w-full h-full rounded-full object-cover border-4 border-orange-500"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
                  <p className="text-gray-400 mb-2">{userData.email}</p>
                  <p className="text-gray-400 text-sm">Member since: {userData.joinDate}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors duration-300"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex flex-wrap space-x-2">
                      <button 
                        onClick={handleCancelEdit}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors duration-300"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button"
                        onClick={handleEditSubmit}
                        disabled={updateLoading}
                        className={`bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors duration-300 flex items-center ${updateLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {updateLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {isEditing ? (
                <div className="mt-4 bg-gray-700 p-4 rounded-lg max-w-xl">
                  <h3 className="text-white font-semibold mb-3">Edit Profile</h3>
                  
                  {updateError && (
                    <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-100 rounded-md">
                      {updateError}
                    </div>
                  )}
                  
                  {updateSuccess && (
                    <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 text-green-100 rounded-md">
                      Profile updated successfully!
                    </div>
                  )}
                  
                  <form className="space-y-3">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditInputChange}
                        className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">Age</label>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          value={editFormData.age}
                          onChange={handleEditInputChange}
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                        <select
                          id="gender"
                          name="gender"
                          value={editFormData.gender}
                          onChange={handleEditInputChange}
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-1">Height (cm)</label>
                        <input
                          type="number"
                          id="height"
                          name="height"
                          value={editFormData.height}
                          onChange={handleEditInputChange}
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          id="weight"
                          name="weight"
                          value={editFormData.weight}
                          onChange={handleEditInputChange}
                          step="0.1"
                          className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-300 mb-1">Activity Level</label>
                      <select
                        id="activityLevel"
                        name="activityLevel"
                        value={editFormData.activityLevel}
                        onChange={handleEditInputChange}
                        className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Little/no exercise">Little/no exercise</option>
                        <option value="Light exercise">Light exercise (1-3 days/week)</option>
                        <option value="Moderate exercise">Moderate exercise (3-5 days/week)</option>
                        <option value="Heavy exercise">Heavy exercise (6-7 days/week)</option>
                        <option value="Very heavy exercise">Very heavy exercise (twice daily)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="weightGoal" className="block text-sm font-medium text-gray-300 mb-1">Weight Goal</label>
                      <select
                        id="weightGoal"
                        name="weightGoal"
                        value={editFormData.weightGoal}
                        onChange={handleEditInputChange}
                        className="w-full bg-gray-600 border border-gray-500 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Lose">Lose weight</option>
                        <option value="Maintain">Maintain weight</option>
                        <option value="Gain">Gain weight</option>
                      </select>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-gray-400 text-sm">Age</p>
                    <p className="text-lg font-semibold">{userData.age} years</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Height</p>
                    <p className="text-lg font-semibold">{userData.height} cm</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Weight</p>
                    <p className="text-lg font-semibold">{userData.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">BMI</p>
                    <p className="text-lg font-semibold">{userData.bmi}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Category</p>
                    <p className="text-lg font-semibold">{userData.bmiCategory}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Date Selector */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-700 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-3 sm:mb-0">Activity Summary</h2>
            <div className="flex items-center">
              <label htmlFor="dateSelector" className="text-sm mr-2 text-gray-300">Select Date:</label>
              <input 
                type="date" 
                id="dateSelector" 
                value={selectedFoodDate}
                onChange={(e) => setSelectedFoodDate(e.target.value)}
                className="bg-gray-800 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
        
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-sm font-medium text-gray-300">Daily Calories</h3>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-2xl font-bold">{nutritionData.calories}</p>
              <p className="text-xs text-gray-400">kcal</p>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h3 className="text-sm font-medium text-gray-300">Water Intake</h3>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-gray-400">liters</p>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <h3 className="text-sm font-medium text-gray-300">Steps</h3>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-2xl font-bold">{totalSteps}</p>
              <p className="text-xs text-gray-400">steps</p>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-sm font-medium text-gray-300">Calories Burned</h3>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-2xl font-bold">{totalCaloriesBurned.toFixed(1)}</p>
              <p className="text-xs text-gray-400">kcal</p>
            </div>
          </div>
        </div>
        
        {/* Food Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
            <h3 className="font-semibold mb-3 flex items-center flex-wrap text-orange-500 text-lg sm:text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="mr-1">Nutrition Log for</span> {selectedFoodDate}
            </h3>
            
            {foodDataLoading ? (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : foodDataError ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-red-400">{foodDataError}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Breakfast */}
                <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-base sm:text-lg font-semibold text-orange-400">Breakfast</h4>
                    <span className="text-xs sm:text-sm px-2 py-1 bg-orange-500 text-white rounded-full">
                      {Math.round(foodSummary?.breakfast?.calories || 0)} kcal
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white text-base sm:text-lg">{foodSummary?.breakfast?.name}</p>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-2 text-xs sm:text-sm">
                      <div className="bg-gray-800 p-1 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-400">Prep Time</p>
                        <p>{foodSummary?.breakfast?.prepTime}</p>
                      </div>
                      <div className="bg-gray-800 p-1 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-400">Cook Time</p>
                        <p>{foodSummary?.breakfast?.cookTime}</p>
                      </div>
                      <div className="bg-gray-800 p-1 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-400">Total Time</p>
                        <p>{foodSummary?.breakfast?.totalTime}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-1">Ingredients:</p>
                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 sm:line-clamp-none">
                        {Array.isArray(foodSummary?.breakfast?.ingredients) 
                          ? foodSummary?.breakfast?.ingredients.join(', ')
                          : foodSummary?.breakfast?.ingredients}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Lunch */}
                <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-base sm:text-lg font-semibold text-orange-400">Lunch</h4>
                    <span className="text-xs sm:text-sm px-2 py-1 bg-orange-500 text-white rounded-full">
                      {Math.round(foodSummary?.lunch?.calories || 0)} kcal
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white text-base sm:text-lg">{foodSummary?.lunch?.name}</p>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-2 text-xs sm:text-sm">
                      <div className="bg-gray-800 p-1 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-400">Prep Time</p>
                        <p>{foodSummary?.lunch?.prepTime}</p>
                      </div>
                      <div className="bg-gray-800 p-1 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-400">Cook Time</p>
                        <p>{foodSummary?.lunch?.cookTime}</p>
                      </div>
                      <div className="bg-gray-800 p-1 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-400">Total Time</p>
                        <p>{foodSummary?.lunch?.totalTime}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-1">Ingredients:</p>
                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 sm:line-clamp-none">
                        {Array.isArray(foodSummary?.lunch?.ingredients) 
                          ? foodSummary?.lunch?.ingredients.join(', ')
                          : foodSummary?.lunch?.ingredients}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Dinner */}
                <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-base sm:text-lg font-semibold text-orange-400">Dinner</h4>
                    <span className="text-xs sm:text-sm px-2 py-1 bg-orange-500 text-white rounded-full">
                      {Math.round(foodSummary?.dinner?.calories || 0)} kcal
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white text-base sm:text-lg">{foodSummary?.dinner?.name}</p>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-2 text-xs sm:text-sm">
                      <div className="bg-gray-800 p-1 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-400">Prep Time</p>
                        <p>{foodSummary?.dinner?.prepTime}</p>
                      </div>
                      <div className="bg-gray-800 p-1 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-400">Cook Time</p>
                        <p>{foodSummary?.dinner?.cookTime}</p>
                      </div>
                      <div className="bg-gray-800 p-1 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-400">Total Time</p>
                        <p>{foodSummary?.dinner?.totalTime}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-1">Ingredients:</p>
                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 sm:line-clamp-none">
                        {Array.isArray(foodSummary?.dinner?.ingredients) 
                          ? foodSummary?.dinner?.ingredients.join(', ')
                          : foodSummary?.dinner?.ingredients}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Extra foods if present */}
                {foodSummary?.extra && (
                  <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-base sm:text-lg font-semibold text-orange-400">Extra</h4>
                      <span className="text-xs sm:text-sm px-2 py-1 bg-orange-500 text-white rounded-full">
                      {Math.round(
                      (foodSummary?.extra ? 
                        (Array.isArray(foodSummary?.extra) ?
                          foodSummary.extra.reduce((sum, item) => sum + (item?.calories || 0), 0) :
                          foodSummary.extra.calories) : 
                        0)
                    )} kcal
                      </span>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {Array.isArray(foodSummary?.extra) ? (
                        foodSummary.extra.map((extra, index) => (
                          <div key={index} className="bg-gray-800 p-2 sm:p-3 rounded">
                            <div className="flex justify-between items-center">
                              <p className="text-sm sm:text-base text-white">{extra.name}</p>
                              <span className="text-xs sm:text-sm text-orange-400">{Math.round(extra.calories)} kcal</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Ingredients: 
                              {Array.isArray(extra.ingredients) 
                                ? extra.ingredients.join(', ') 
                                : extra.ingredients}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-800 p-2 sm:p-3 rounded">
                          <div className="flex justify-between items-center">
                            <p className="text-sm sm:text-base text-white">{foodSummary.extra.name}</p>
                            <span className="text-xs sm:text-sm text-orange-400">{Math.round(foodSummary.extra.calories)} kcal</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Ingredients: 
                            {Array.isArray(foodSummary.extra.ingredients) 
                              ? foodSummary.extra.ingredients.join(', ') 
                              : foodSummary.extra.ingredients}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Total calories */}
                <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between text-white">
                  <p className="font-medium">Total Calories:</p>
                  <p className="font-bold text-orange-500">
                    {Math.round(totalFoodCalories)} kcal
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Exercise Section */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Exercises for {selectedFoodDate}
            </h3>
              {selectedDateExercises.length > 0 && !showExerciseForm && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditingExercise(true);
                      setShowExerciseForm(true);
                      setExerciseFormData(selectedDateExercises[0]);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteExercise}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            
            {exerciseDataLoading ? (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                    </div>
            ) : exerciseDataError ? (
              <div className="text-center py-8">
                <p className="text-red-400">{exerciseDataError}</p>
                    </div>
            ) : showExerciseForm ? (
              <form onSubmit={handleExerciseSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Sit-ups</label>
                    <input
                      type="number"
                      name="sit-up"
                      value={exerciseFormData['sit-up']}
                      onChange={(e) => setExerciseFormData(prev => ({ ...prev, 'sit-up': e.target.value }))}
                      min="0"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Pull-ups</label>
                    <input
                      type="number"
                      name="pull-up"
                      value={exerciseFormData['pull-up']}
                      onChange={(e) => setExerciseFormData(prev => ({ ...prev, 'pull-up': e.target.value }))}
                      min="0"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Push-ups</label>
                    <input
                      type="number"
                      name="push-up"
                      value={exerciseFormData['push-up']}
                      onChange={(e) => setExerciseFormData(prev => ({ ...prev, 'push-up': e.target.value }))}
                      min="0"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Squats</label>
                    <input
                      type="number"
                      name="squat"
                      value={exerciseFormData['squat']}
                      onChange={(e) => setExerciseFormData(prev => ({ ...prev, 'squat': e.target.value }))}
                      min="0"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Walk (steps)</label>
                    <input
                      type="number"
                      name="walk"
                      value={exerciseFormData['walk']}
                      onChange={(e) => setExerciseFormData(prev => ({ ...prev, 'walk': e.target.value }))}
                      min="0"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExerciseForm(false);
                      setIsEditingExercise(false);
                      setExerciseFormData({
                        'sit-up': 0,
                        'pull-up': 0,
                        'push-up': 0,
                        'squat': 0,
                        'walk': 0
                      });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {isEditingExercise ? 'Update' : 'Save'} Exercises
                  </button>
                </div>
              </form>
            ) : selectedDateExercises.length > 0 ? (
              <div>
                <div className="space-y-3">
                  {selectedDateExercises.map((summary, index) => (
                        <div key={index}>
                          <div className="grid grid-cols-2 gap-3">
                            {summary['sit-up'] > 0 && (
                              <div className="bg-gray-700 p-3 rounded-md">
                                <div className="flex justify-between items-center">
                                  <p className="font-medium text-sm">Sit-ups</p>
                                  <div className="text-right">
                                    <p className="text-orange-400">{summary['sit-up']} reps</p>
                                    <p className="text-xs text-gray-400">{calculateCaloriesBurned('sit-up', summary['sit-up'])} kcal</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {summary['pull-up'] > 0 && (
                              <div className="bg-gray-700 p-3 rounded-md">
                                <div className="flex justify-between items-center">
                                  <p className="font-medium text-sm">Pull-ups</p>
                                  <div className="text-right">
                                    <p className="text-orange-400">{summary['pull-up']} reps</p>
                                    <p className="text-xs text-gray-400">{calculateCaloriesBurned('pull-up', summary['pull-up'])} kcal</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {summary['push-up'] > 0 && (
                              <div className="bg-gray-700 p-3 rounded-md">
                                <div className="flex justify-between items-center">
                                  <p className="font-medium text-sm">Push-ups</p>
                                  <div className="text-right">
                                    <p className="text-orange-400">{summary['push-up']} reps</p>
                                    <p className="text-xs text-gray-400">{calculateCaloriesBurned('push-up', summary['push-up'])} kcal</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {summary['squat'] > 0 && (
                              <div className="bg-gray-700 p-3 rounded-md">
                                <div className="flex justify-between items-center">
                                  <p className="font-medium text-sm">Squats</p>
                                  <div className="text-right">
                                    <p className="text-orange-400">{summary['squat']} reps</p>
                                    <p className="text-xs text-gray-400">{calculateCaloriesBurned('squat', summary['squat'])} kcal</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {summary['walk'] > 0 && (
                              <div className="bg-gray-700 p-3 rounded-md col-span-2">
                                <div className="flex justify-between items-center">
                                  <p className="font-medium text-sm">Walking</p>
                                  <div className="text-right">
                                    <p className="text-orange-400">{summary['walk']} steps</p>
                                    <p className="text-xs text-gray-400">{calculateCaloriesBurned('walk', summary['walk'])} kcal</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {Object.values(summary).every(val => val === 0 || val === selectedFoodDate) && (
              <div className="text-center p-4 text-gray-500">
                              <p>No exercises recorded for this date</p>
                            </div>
                          )}
                          {(summary['sit-up'] > 0 || summary['pull-up'] > 0 || summary['push-up'] > 0 || summary['squat'] > 0 || summary['walk'] > 0) && (
                              <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-sm">
                                <p className="text-gray-400">Total Calories Burned:</p>
                                <p className="font-semibold text-orange-500">{calculateTotalCaloriesBurned(summary)} kcal</p>
                              </div>
                            )}
                        </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-gray-400 mb-4">No exercise data available for this date</p>
                  <button
                  onClick={() => {
                    setShowExerciseForm(true);
                    setIsEditingExercise(false);
                    setExerciseFormData({
                      'sit-up': 0,
                      'pull-up': 0,
                      'push-up': 0,
                      'squat': 0,
                      'walk': 0
                    });
                  }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                  Add Exercise Data
                  </button>
                </div>
            )}
          </div>
        </div>
        
        {/* Macro Distribution - Keep as is */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <h3 className="font-semibold mb-4 text-orange-500">Macro Distribution</h3>
          
          {/* Net Calories - New Section */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-300">Net Calories</span>
              <span className="text-sm text-gray-400">
                {foodData && foodData['daily_food_summary'] && foodData['daily_food_summary'].length > 0 && exerciseData && exerciseData.exercise_summary ? 
                  (() => {
                    try {
                      // Calculate total food calories
                      const totalFoodCalories = Math.round(
                        foodData['daily_food_summary'][0].breakfast.calories +
                        foodData['daily_food_summary'][0].lunch.calories +
                        foodData['daily_food_summary'][0].dinner.calories +
                        (foodData['daily_food_summary'][0].extra ? 
                          (Array.isArray(foodData['daily_food_summary'][0].extra) ?
                            foodData['daily_food_summary'][0].extra.reduce((sum, item) => sum + item.calories, 0) :
                            foodData['daily_food_summary'][0].extra.calories) : 
                          0)
                      );
                      
                      // Calculate calories burned
                      const caloriesBurned = exerciseData.exercise_summary
                        .filter(summary => summary.date === selectedFoodDate)
                        .reduce((total, summary) => parseFloat(total) + parseFloat(calculateTotalCaloriesBurned(summary)), 0);
                      
                      // Calculate net calories
                      return (totalFoodCalories - caloriesBurned).toFixed(0);
                    } catch (error) {
                      console.error('Error calculating net calories:', error);
                      return nutritionData.calories;
                    }
                  })()
                  : nutritionData.calories} kcal
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className={`${
                  (() => {
                    try {
                      if (foodData && foodData['daily_food_summary'] && foodData['daily_food_summary'].length > 0 && exerciseData && exerciseData.exercise_summary) {
                        // Calculate total food calories
                        const totalFoodCalories = Math.round(
                          foodData['daily_food_summary'][0].breakfast.calories +
                          foodData['daily_food_summary'][0].lunch.calories +
                          foodData['daily_food_summary'][0].dinner.calories +
                          (foodData['daily_food_summary'][0].extra ? 
                            (Array.isArray(foodData['daily_food_summary'][0].extra) ?
                              foodData['daily_food_summary'][0].extra.reduce((sum, item) => sum + item.calories, 0) :
                              foodData['daily_food_summary'][0].extra.calories) : 
                            0)
                        );
                        
                        // Calculate calories burned
                        const caloriesBurned = exerciseData.exercise_summary
                          .filter(summary => summary.date === selectedFoodDate)
                          .reduce((total, summary) => parseFloat(total) + parseFloat(calculateTotalCaloriesBurned(summary)), 0);
                        
                        // Determine color based on whether net calories exceeds daily target
                        return (totalFoodCalories - caloriesBurned) > nutritionData.calories ? 'bg-red-500' : 'bg-orange-500';
                      }
                      return 'bg-orange-500';
                    } catch (error) {
                      console.error('Error determining progress bar color:', error);
                      return 'bg-orange-500';
                    }
                  })()
                } h-2.5 rounded-full`} 
                style={{ 
                  width: (() => {
                    try {
                      if (foodData && foodData['daily_food_summary'] && foodData['daily_food_summary'].length > 0 && exerciseData && exerciseData.exercise_summary) {
                        // Calculate total food calories
                        const totalFoodCalories = Math.round(
                          foodData['daily_food_summary'][0].breakfast.calories +
                          foodData['daily_food_summary'][0].lunch.calories +
                          foodData['daily_food_summary'][0].dinner.calories +
                          (foodData['daily_food_summary'][0].extra ? 
                            (Array.isArray(foodData['daily_food_summary'][0].extra) ?
                              foodData['daily_food_summary'][0].extra.reduce((sum, item) => sum + item.calories, 0) :
                              foodData['daily_food_summary'][0].extra.calories) : 
                            0)
                        );
                        
                        // Calculate calories burned
                        const caloriesBurned = exerciseData.exercise_summary
                          .filter(summary => summary.date === selectedFoodDate)
                          .reduce((total, summary) => parseFloat(total) + parseFloat(calculateTotalCaloriesBurned(summary)), 0);
                        
                        // Calculate percentage for progress bar (cap at 100%)
                        const netCalories = totalFoodCalories - caloriesBurned;
                        return `${Math.min((netCalories / nutritionData.calories) * 100, 100)}%`;
                      }
                      return '0%';
                    } catch (error) {
                      console.error('Error calculating progress bar width:', error);
                      return '0%';
                    }
                  })()
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Formula: Total Food Calories - Calories Burned</p>
            {(() => {
              try {
                if (foodData && foodData['daily_food_summary'] && foodData['daily_food_summary'].length > 0 && exerciseData && exerciseData.exercise_summary) {
                  // Calculate total food calories
                  const totalFoodCalories = Math.round(
                    foodData['daily_food_summary'][0].breakfast.calories +
                    foodData['daily_food_summary'][0].lunch.calories +
                    foodData['daily_food_summary'][0].dinner.calories +
                    (foodData['daily_food_summary'][0].extra ? 
                      (Array.isArray(foodData['daily_food_summary'][0].extra) ?
                        foodData['daily_food_summary'][0].extra.reduce((sum, item) => sum + item.calories, 0) :
                        foodData['daily_food_summary'][0].extra.calories) : 
                      0)
                  );
                  
                  // Calculate calories burned
                  const caloriesBurned = exerciseData.exercise_summary
                    .filter(summary => summary.date === selectedFoodDate)
                    .reduce((total, summary) => parseFloat(total) + parseFloat(calculateTotalCaloriesBurned(summary)), 0);
                  
                  // Show warning if net calories exceeds daily target
                  const netCalories = totalFoodCalories - caloriesBurned;
                  if (netCalories > nutritionData.calories) {
                    return <p className="text-xs text-red-500 mt-1 font-medium">Calorie intake exceeds the daily need</p>;
                  }
                }
                return null;
              } catch (error) {
                console.error('Error checking if calorie intake exceeds daily need:', error);
                return null;
              }
            })()}
          </div>
          
          {/* Protein Progress */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-300">Protein</span>
              <span className="text-sm text-gray-400">
                {nutritionData.protein}g 
                {nutritionData.protein >= 120 && 
                  <span className="text-green-400 ml-1">(Goal achieved!)</span>
                }
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full" 
                style={{ width: `${Math.min((nutritionData.protein / 120) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Daily goal: 120g</p>
          </div>
          
          {/* Carbs Progress */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-300">Carbohydrates</span>
              <span className="text-sm text-gray-400">
                {nutritionData.carbs}g
                {nutritionData.carbs >= 220 && 
                  <span className="text-green-400 ml-1">(Goal achieved!)</span>
                }
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${Math.min((nutritionData.carbs / 220) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Daily goal: 220g</p>
          </div>
          
          {/* Fats Progress */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-300">Fats</span>
              <span className="text-sm text-gray-400">
                {nutritionData.fats}g
                {nutritionData.fats >= 70 && 
                  <span className="text-green-400 ml-1">(Goal achieved!)</span>
                }
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-yellow-500 h-2.5 rounded-full" 
                style={{ width: `${Math.min((nutritionData.fats / 70) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Daily goal: 70g</p>
          </div>
          
          {/* Water Intake Progress */}
          <div className="mb-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-300">Water Intake</span>
              <span className="text-sm text-gray-400">
                0 / 3 liters
                {0 >= 3000 && 
                  <span className="text-green-400 ml-1">(Goal achieved!)</span>
                }
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full" 
                style={{ width: `${Math.min((0 / 3000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Download PDF Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleDownloadPDF}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download User Profile PDF
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Function to generate and download PDF of user data
  const handleDownloadPDF = () => {
    try {
      // Import jsPDF
      const { jsPDF } = require('jspdf');
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Set initial position
      let yPos = 20;
      
      // Add header with logo-like styling
      doc.setFillColor(234, 88, 12); // Orange color
      doc.rect(0, 0, 210, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('InertiaFit AI- User Profile', 105, 10, { align: 'center' });
      
      // Reset text color for rest of document
      doc.setTextColor(0, 0, 0);
      
      // Add date of report
      doc.setFontSize(12);
      doc.text(`Report Date: ${selectedFoodDate || 'N/A'}`, 14, yPos);
      yPos += 10;
      
      // Add user basic information section
      doc.setFontSize(16);
      doc.text('User Information', 14, yPos);
      yPos += 8;
      
      // Add a line under section title
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(0.5);
      doc.line(14, yPos, 195, yPos);
      yPos += 8;
      
      // User basic details - with null/undefined checks
      doc.setFontSize(12);
      doc.text(`Name: ${userData?.name || 'N/A'}`, 14, yPos); yPos += 7;
      doc.text(`Email: ${userData?.email || 'N/A'}`, 14, yPos); yPos += 7;
      doc.text(`Age: ${userData?.age || 'N/A'} years`, 14, yPos); yPos += 7;
      doc.text(`Gender: ${userData?.gender || 'N/A'}`, 14, yPos); yPos += 7;
      doc.text(`Member since: ${userData?.joinDate || 'N/A'}`, 14, yPos); yPos += 7;
      
      // Physical details
      yPos += 5;
      doc.setFontSize(16);
      doc.text('Physical Information', 14, yPos);
      yPos += 8;
      
      // Add a line under section title
      doc.setDrawColor(234, 88, 12);
      doc.line(14, yPos, 195, yPos);
      yPos += 8;
      
      doc.setFontSize(12);
      doc.text(`Height: ${userData?.height || 'N/A'} cm`, 14, yPos); yPos += 7;
      doc.text(`Weight: ${userData?.weight || 'N/A'} kg`, 14, yPos); yPos += 7;
      doc.text(`BMI: ${userData?.bmi || 'N/A'}`, 14, yPos); yPos += 7;
      doc.text(`BMI Category: ${userData?.bmiCategory || 'N/A'}`, 14, yPos); yPos += 7;
      doc.text(`Activity Level: ${userData?.activityLevel || 'N/A'}`, 14, yPos); yPos += 7;
      doc.text(`Weight Goal: ${userData?.weightGoal || 'N/A'}`, 14, yPos); yPos += 7;
      
      // Daily Nutrition Log section
      yPos += 5;
      doc.setFontSize(16);
      doc.text(`Nutrition Log for ${selectedFoodDate || 'N/A'}`, 14, yPos);
      yPos += 8;
      
      // Add a line under section title
      doc.setDrawColor(234, 88, 12);
      doc.line(14, yPos, 195, yPos);
      yPos += 8;
      
      // Check if food data is available
      if (foodData && foodData['daily_food_summary'] && foodData['daily_food_summary'].length > 0) {
        const foodSummary = foodData['daily_food_summary'][0];
        
        // Only proceed if we have data for each meal
        if (foodSummary.breakfast && foodSummary.lunch && foodSummary.dinner) {
          doc.setFontSize(14);
          // Breakfast details
          doc.text('Breakfast:', 14, yPos); yPos += 7;
          doc.setFontSize(12);
          doc.text(`Meal: ${foodSummary.breakfast.name || 'N/A'}`, 20, yPos); yPos += 7;
          doc.text(`Calories: ${Math.round(foodSummary.breakfast.calories || 0)} kcal`, 20, yPos); yPos += 7;
          doc.text(`Preparation Time: ${foodSummary.breakfast.prepTime || 'N/A'}`, 20, yPos); yPos += 7;
          doc.text(`Cooking Time: ${foodSummary.breakfast.cookTime || 'N/A'}`, 20, yPos); yPos += 7;
          
          // Check if we need a new page for lunch
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          // Lunch details
          doc.setFontSize(14);
          doc.text('Lunch:', 14, yPos); yPos += 7;
          doc.setFontSize(12);
          doc.text(`Meal: ${foodSummary.lunch.name || 'N/A'}`, 20, yPos); yPos += 7;
          doc.text(`Calories: ${Math.round(foodSummary.lunch.calories || 0)} kcal`, 20, yPos); yPos += 7;
          doc.text(`Preparation Time: ${foodSummary.lunch.prepTime || 'N/A'}`, 20, yPos); yPos += 7;
          doc.text(`Cooking Time: ${foodSummary.lunch.cookTime || 'N/A'}`, 20, yPos); yPos += 7;
          
          // Check if we need a new page for dinner
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          // Dinner details
          doc.setFontSize(14);
          doc.text('Dinner:', 14, yPos); yPos += 7;
          doc.setFontSize(12);
          doc.text(`Meal: ${foodSummary.dinner.name || 'N/A'}`, 20, yPos); yPos += 7;
          doc.text(`Calories: ${Math.round(foodSummary.dinner.calories || 0)} kcal`, 20, yPos); yPos += 7;
          doc.text(`Preparation Time: ${foodSummary.dinner.prepTime || 'N/A'}`, 20, yPos); yPos += 7;
          doc.text(`Cooking Time: ${foodSummary.dinner.cookTime || 'N/A'}`, 20, yPos); yPos += 7;
          
          // Total calories from food
          yPos += 7;
          let totalFoodCalories = 0;
          
          try {
            totalFoodCalories = Math.round(
              (foodSummary.breakfast.calories || 0) +
              (foodSummary.lunch.calories || 0) +
              (foodSummary.dinner.calories || 0) +
              (foodSummary.extra ? 
                (Array.isArray(foodSummary.extra) ?
                  foodSummary.extra.reduce((sum, item) => sum + (item.calories || 0), 0) :
                  (foodSummary.extra.calories || 0)) : 
                0)
            );
          } catch (err) {
            console.error('Error calculating total calories:', err);
            totalFoodCalories = 0;
          }
          
          doc.setFontSize(14);
          doc.text(`Total Calories Consumed: ${totalFoodCalories} kcal`, 14, yPos);
        } else {
          doc.setFontSize(12);
          doc.text('Complete nutrition data not available for this date.', 14, yPos);
        }
      } else {
        doc.setFontSize(12);
        doc.text('No nutrition data available for this date.', 14, yPos);
      }
      
      // Check if we need a new page for Exercise data
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 15;
      }
      
      // Exercise data section
      doc.setFontSize(16);
      doc.text(`Exercise Data for ${selectedFoodDate || 'N/A'}`, 14, yPos);
      yPos += 8;
      
      // Add a line under section title
      doc.setDrawColor(234, 88, 12);
      doc.line(14, yPos, 195, yPos);
      yPos += 8;
      
      try {
        // Check if exercise data is available
        if (exerciseData && exerciseData.exercise_summary && Array.isArray(exerciseData.exercise_summary) && exerciseData.exercise_summary.length > 0) {
          // Safely filter exercise data for selected date
          const dailyExercises = exerciseData.exercise_summary.filter(summary => 
            summary && typeof summary === 'object' && summary.date === selectedFoodDate);
          
          if (dailyExercises && dailyExercises.length > 0) {
            // Initialize calories burned
            let caloriesBurned = 0;
            let exerciseFound = false;
            
            doc.setFontSize(12);
            
            // Display exercise details with improved error handling
            for (let index = 0; index < dailyExercises.length; index++) {
              try {
                const exercise = dailyExercises[index];
                if (!exercise) continue;
                
                // Define valid exercise types
                const validExerciseTypes = ['sit-up', 'pull-up', 'push-up', 'squat', 'walk'];
                
                // Filter and validate exercise keys
                const exerciseKeys = Object.keys(exercise).filter(key => 
                  key !== 'date' && key !== '_id' && 
                  validExerciseTypes.includes(key) &&
                  typeof exercise[key] === 'number' && exercise[key] > 0);
                
                if (exerciseKeys && exerciseKeys.length > 0) {
                  exerciseFound = true;
                  doc.text(`Exercise Session ${index + 1}:`, 14, yPos); 
                  yPos += 7;
                  
                  // Process each exercise type safely
                  exerciseKeys.forEach(key => {
                    // Display exercise name
                    if (key === 'walk') {
                      doc.text(`Walking: ${exercise[key]} steps`, 20, yPos);
                    } else {
                      const exerciseName = key.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)).join('-');
                      doc.text(`${exerciseName}: ${exercise[key]} reps`, 20, yPos);
                    }
                    yPos += 7;
                    
                    // Calculate calories for this exercise safely
                    try {
                      const caloriesPerRep = {
                        'push-up': 0.4,
                        'squat': 0.4,
                        'pull-up': 0.8,
                        'sit-up': 0.3,
                        'walk': 0.1
                      };
                      
                      if (caloriesPerRep[key] && !isNaN(exercise[key])) {
                        const exerciseCalories = caloriesPerRep[key] * exercise[key];
                        doc.text(`Calories burned: ${exerciseCalories.toFixed(1)} kcal`, 30, yPos);
                        
                        // Add to total calories
                        caloriesBurned += exerciseCalories;
                      } else {
                        doc.text(`Calories burned: Unable to calculate`, 30, yPos);
                      }
                    } catch (err) {
                      console.error(`Error calculating calories for ${key}:`, err);
                      doc.text(`Calories burned: Unable to calculate`, 30, yPos);
                    }
                    
                    yPos += 10;
                    
                    // Add page break if needed
                    if (yPos > 270) {
                      doc.addPage();
                      yPos = 20;
                    }
                  });
                }
              } catch (err) {
                console.error(`Error processing exercise session ${index + 1}:`, err);
                // Continue to next session instead of failing entire PDF
              }
            }
            
            // If exercise data was found, show the calorie summary
            if (exerciseFound) {
              // Total calories burned
              doc.setFontSize(14);
              doc.text(`Total Calories Burned: ${caloriesBurned.toFixed(1)} kcal`, 14, yPos);
              yPos += 10;
              
              // Net calories calculation
              try {
                if (foodData && foodData['daily_food_summary'] && 
                    Array.isArray(foodData['daily_food_summary']) &&
                    foodData['daily_food_summary'].length > 0) {
                    
                  const foodSummary = foodData['daily_food_summary'][0];
                  
                  // Check if all required meal data exists
                  if (foodSummary && foodSummary.breakfast && foodSummary.lunch && foodSummary.dinner) {
                    // Safely calculate total food calories
                    const breakfastCal = parseFloat(foodSummary.breakfast.calories) || 0;
                    const lunchCal = parseFloat(foodSummary.lunch.calories) || 0;
                    const dinnerCal = parseFloat(foodSummary.dinner.calories) || 0;
                    
                    // Calculate extra calories if available
                    let extraCal = 0;
                    if (foodSummary.extra) {
                      if (Array.isArray(foodSummary.extra)) {
                        foodSummary.extra.forEach(item => {
                          if (item && !isNaN(item.calories)) {
                            extraCal += parseFloat(item.calories);
                          }
                        });
                      } else if (!isNaN(foodSummary.extra.calories)) {
                        extraCal = parseFloat(foodSummary.extra.calories);
                      }
                    }
                    
                    const totalFoodCalories = Math.round(breakfastCal + lunchCal + dinnerCal + extraCal);
                    
                    // Calculate and display net calories
                    const netCalories = totalFoodCalories - caloriesBurned;
                    doc.text(`Net Calories: ${netCalories.toFixed(1)} kcal`, 14, yPos);
                  }
                }
              } catch (err) {
                console.error('Error calculating net calories:', err);
              }
            } else {
              doc.setFontSize(12);
              doc.text('No valid exercise data found for this date.', 14, yPos);
            }
          } else {
            doc.setFontSize(12);
            doc.text('No exercise data available for this date.', 14, yPos);
          }
        } else {
          doc.setFontSize(12);
          doc.text('No exercise data available.', 14, yPos);
        }
      } catch (err) {
        console.error('Error generating exercise section of PDF:', err);
        doc.setFontSize(12);
        doc.text('Error processing exercise data.', 14, yPos);
      }
      
      yPos += 10;
      
      // Check if we need a new page for Nutrition summary
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 15;
      }
      
      // Nutrition summary section
      doc.setFontSize(16);
      doc.text('Nutrition & Activity Summary', 14, yPos);
      yPos += 8;
      
      // Add a line under section title
      doc.setDrawColor(234, 88, 12);
      doc.line(14, yPos, 195, yPos);
      yPos += 8;
      
      doc.setFontSize(12);
      doc.text(`Daily Calorie Target: ${nutritionData?.calories || 'N/A'} kcal`, 14, yPos); yPos += 7;
      doc.text(`Protein Intake: ${nutritionData?.protein || 'N/A'}g (Goal: 120g)`, 14, yPos); yPos += 7;
      doc.text(`Carbohydrate Intake: ${nutritionData?.carbs || 'N/A'}g (Goal: 220g)`, 14, yPos); yPos += 7;
      doc.text(`Fat Intake: ${nutritionData?.fats || 'N/A'}g (Goal: 70g)`, 14, yPos); yPos += 7;
      
      // Add water intake if available
      const selectedActivity = getActivityByDate(selectedDate);
      if (selectedActivity && selectedActivity.waterIntake) {
        doc.text(`Water Intake: ${(selectedActivity.waterIntake / 1000) || 0} liters (Goal: 3 liters)`, 14, yPos); 
        yPos += 7;
      }
      
      // Add date of generation
      yPos += 10;
      const today = new Date();
      doc.setFontSize(10);
      doc.text(`Generated on: ${today.toLocaleDateString()}`, 14, yPos);
      
      // Add footer
      doc.setFontSize(10);
      doc.text('This document is for informational purposes only.', 105, 285, { align: 'center' });
      
      // Save the PDF
      const safeName = userData?.name ? userData.name.replace(/\s+/g, '_') : 'User';
      doc.save(`InertiaFit_${safeName}_Report_${selectedFoodDate || 'Date'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Show more detailed error message
      alert(`Error generating PDF: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  // Render Nutrition Dashboard Section with food recommendation functionality
  const renderNutritionSection = () => {
    return (
      <div className="animate-fadeIn">
        {!nutritionSubmitted ? (
          <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 max-w-md mx-auto">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">Get Food Recommendations</h2>
            <form onSubmit={handleNutritionSubmit}>
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
              
              {nutritionError && (
                <div className="mb-6 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-100 rounded-md">
                  {nutritionError}
                </div>
              )}
              
              <button
                type="submit"
                disabled={nutritionLoading}
                className={`w-full ${nutritionLoading ? 'bg-gray-500' : 'bg-orange-500 hover:bg-orange-600'} text-white font-bold py-2 sm:py-3 px-4 rounded-md transition-colors duration-300 text-sm sm:text-base flex justify-center items-center`}
              >
                {nutritionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Generate Recommendations'
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-black p-6 rounded-lg shadow-lg">
            <div className="mt-4 pt-4 border-t border-gray-700">
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
                  nutritionData.recipes.breakfast?.length > 0 || 
                  nutritionData.recipes.lunch?.length > 0 || 
                  nutritionData.recipes.dinner?.length > 0
                ) ? (
                  <div className="space-y-6 sm:space-y-10">
                    {/* Breakfast Recipes */}
                    {nutritionData.recipes.breakfast?.length > 0 && (
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
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name="breakfast"
                                        checked={selectedFoods.breakfast?.name === recipe.name}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleFoodSelection('breakfast', recipe);
                                        }}
                                        className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-600"
                                      />
                                      <h5 className="text-orange-500 font-semibold text-sm sm:text-base md:text-xl truncate pr-1 sm:pr-2">{recipe.name}</h5>
                                    </div>
                                    <span className="text-white font-medium text-xs sm:text-sm whitespace-nowrap">{recipe.calories} cal</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1 sm:mt-2">
                                    <div className="flex gap-2 sm:gap-3 text-xs text-gray-400">
                                      {recipe.prepTime && <span className="flex items-center"><strong className="text-orange-400">PT:</strong> {recipe.prepTime}</span>}
                                      {recipe.cookTime && <span className="flex items-center ml-2"><strong className="text-orange-400">CT:</strong> {recipe.cookTime}</span>}
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
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Lunch Recipes - Limited rendering for brevity */}
                    {nutritionData.recipes.lunch?.length > 0 && (
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
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name="lunch"
                                        checked={selectedFoods.lunch?.name === recipe.name}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleFoodSelection('lunch', recipe);
                                        }}
                                        className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-600"
                                      />
                                      <h5 className="text-orange-500 font-semibold text-sm sm:text-base md:text-xl truncate pr-1 sm:pr-2">{recipe.name}</h5>
                                    </div>
                                    <span className="text-white font-medium text-xs sm:text-sm whitespace-nowrap">{recipe.calories} cal</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1 sm:mt-2">
                                    <div className="flex gap-2 sm:gap-3 text-xs text-gray-400">
                                      {recipe.prepTime && <span className="flex items-center"><strong className="text-orange-400">PT:</strong> {recipe.prepTime}</span>}
                                      {recipe.cookTime && <span className="flex items-center ml-2"><strong className="text-orange-400">CT:</strong> {recipe.cookTime}</span>}
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
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Dinner Recipes */}
                    {nutritionData.recipes.dinner?.length > 0 && (
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
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name="dinner"
                                        checked={selectedFoods.dinner?.name === recipe.name}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleFoodSelection('dinner', recipe);
                                        }}
                                        className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-600"
                                      />
                                      <h5 className="text-orange-500 font-semibold text-sm sm:text-base md:text-xl truncate pr-1 sm:pr-2">{recipe.name}</h5>
                                    </div>
                                    <span className="text-white font-medium text-xs sm:text-sm whitespace-nowrap">{recipe.calories} cal</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1 sm:mt-2">
                                    <div className="flex gap-2 sm:gap-3 text-xs text-gray-400">
                                      {recipe.prepTime && <span className="flex items-center"><strong className="text-orange-400">PT:</strong> {recipe.prepTime}</span>}
                                      {recipe.cookTime && <span className="flex items-center ml-2"><strong className="text-orange-400">CT:</strong> {recipe.cookTime}</span>}
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
                
                {/* Submit Button and Messages */}
                <div className="mt-8 text-center space-y-4">
                  {foodSubmissionError && (
                    <div className="p-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-100 rounded-md">
                      <p className="font-medium">{foodSubmissionError}</p>
                    </div>
                  )}
                  {foodSubmissionSuccess && (
                    <div className="p-4 bg-green-500 bg-opacity-20 border border-green-500 text-green-100 rounded-md">
                      <p className="font-medium">Food selections saved successfully!</p>
                    </div>
                  )}
                  <button
                    onClick={handleFoodSubmission}
                    disabled={foodSubmissionLoading || !selectedFoods.breakfast || !selectedFoods.lunch || !selectedFoods.dinner}
                    className={`bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 mx-auto ${
                      foodSubmissionLoading || !selectedFoods.breakfast || !selectedFoods.lunch || !selectedFoods.dinner
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {foodSubmissionLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Saving selections...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Save Food Selections</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-8 text-center space-x-4">
                  <button 
                    onClick={() => setNutritionSubmitted(false)}
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
    );
  };

  // Render Custom Nutrition Section
  const renderCustomNutritionSection = () => {
    return (
      <div className="animate-fadeIn">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-orange-500 mb-2">Customized Food Recommendation System</h2>
          <p className="text-gray-400 text-sm">Adjust nutritional preferences to get personalized food recommendations</p>
        </div>

        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6">
          <form onSubmit={handleCustomNutritionSubmit} className="space-y-6">
            {/* Calories */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Calories (kcal)</label>
                <span className="text-orange-500 font-semibold">{nutritionPreferences.calories}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                value={nutritionPreferences.calories}
                onChange={(e) => handleSliderChange('calories', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>2000</span>
              </div>
            </div>

            {/* Fat Content */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Fat Content (g)</label>
                <span className="text-orange-500 font-semibold">{nutritionPreferences.fat}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={nutritionPreferences.fat}
                onChange={(e) => handleSliderChange('fat', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>100</span>
              </div>
            </div>

            {/* Saturated Fat */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Saturated Fat Content (g)</label>
                <span className="text-orange-500 font-semibold">{nutritionPreferences.saturatedFat}</span>
              </div>
              <input
                type="range"
                min="0"
                max="13"
                value={nutritionPreferences.saturatedFat}
                onChange={(e) => handleSliderChange('saturatedFat', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>13</span>
              </div>
            </div>

            {/* Cholesterol */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Cholesterol Content (mg)</label>
                <span className="text-orange-500 font-semibold">{nutritionPreferences.cholesterol}</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                value={nutritionPreferences.cholesterol}
                onChange={(e) => handleSliderChange('cholesterol', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>300</span>
              </div>
            </div>

            {/* Sodium */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Sodium Content (mg)</label>
                <span className="text-orange-500 font-semibold">{nutritionPreferences.sodium}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2300"
                value={nutritionPreferences.sodium}
                onChange={(e) => handleSliderChange('sodium', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>2300</span>
              </div>
            </div>

            {/* Carbohydrate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Carbohydrate Content (g)</label>
                <span className="text-orange-500 font-semibold">{nutritionPreferences.carbohydrate}</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                value={nutritionPreferences.carbohydrate}
                onChange={(e) => handleSliderChange('carbohydrate', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>300</span>
              </div>
            </div>

            {/* Fiber */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Fiber Content (g)</label>
                <span className="text-orange-500 font-semibold">{nutritionPreferences.fiber}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={nutritionPreferences.fiber}
                onChange={(e) => handleSliderChange('fiber', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>50</span>
              </div>
            </div>

            {/* Sugar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Sugar Content (g)</label>
                <span className="text-orange-500 font-semibold">{nutritionPreferences.sugar}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={nutritionPreferences.sugar}
                onChange={(e) => handleSliderChange('sugar', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>50</span>
              </div>
            </div>

            {/* Add Protein Content before the error message */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Protein Content (g)</label>
                <span className="text-orange-500 font-semibold">{nutritionPreferences.protein}</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={nutritionPreferences.protein}
                onChange={(e) => handleSliderChange('protein', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>40</span>
              </div>
            </div>

            {/* Display error message if present */}
            {customNutritionError && (
              <div className="p-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-100 rounded-md">
                <p className="font-medium">{customNutritionError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={customNutritionLoading}
              className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 ${customNutritionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {customNutritionLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Generate Recommendations</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results section - display recipe recommendations */}
        <div className="space-y-6 sm:space-y-10 mt-8">
          {/* Recipe Cards */}
                    {customNutritionRecommendations?.length > 0 && (
                      <div className="mb-4 sm:mb-8">
                        <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 text-center bg-gray-800 py-2 rounded-t-lg">Extra Recipes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-w-6xl mx-auto">
                          {customNutritionRecommendations.map((rawRecipe, index) => {
                            const recipe = formatRecipe(rawRecipe);
                            return (
                              <div 
                                key={index} 
                                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-orange-500/30 hover:-translate-y-1 cursor-pointer text-xs sm:text-sm md:text-base"
                                onClick={() => toggleRecipe('extra', index)}
                              >
                                <div className="p-2 sm:p-3 md:p-4 border-b border-gray-700">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name="extra"
                                        checked={selectedFoods.extra?.name === recipe.name}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleFoodSelection('extra', recipe);
                                        }}
                                        className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-600"
                                      />
                                      <h5 className="text-orange-500 font-semibold text-sm sm:text-base md:text-xl truncate pr-1 sm:pr-2">{recipe.name}</h5>
                                    </div>
                                    <span className="text-white font-medium text-xs sm:text-sm whitespace-nowrap">{recipe.calories} cal</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1 sm:mt-2">
                                    <div className="flex gap-2 sm:gap-3 text-xs text-gray-400">
                                      {recipe.prepTime && <span className="flex items-center"><strong className="text-orange-400">PT:</strong> {recipe.prepTime}</span>}
                                      {recipe.cookTime && <span className="flex items-center ml-2"><strong className="text-orange-400">CT:</strong> {recipe.cookTime}</span>}
                                    </div>
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform duration-300 ${isRecipeExpanded('extra', index) ? 'rotate-180' : ''}`} 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                                
                                {isRecipeExpanded('extra', index) && recipe.ingredients && (
                                  <div className="p-2 sm:p-3 md:p-4 bg-gray-900/50 animate-fadeIn">
                                    <h6 className="text-xs sm:text-sm font-semibold text-gray-300 mb-1">Ingredients:</h6>
                                    <p className="text-xs sm:text-sm text-gray-400">{recipe.ingredients}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

        {/* Submit button for food selection */}
                  <div className="mt-8 text-center space-y-4">
                  {foodSubmissionError && (
                    <div className="p-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-100 rounded-md">
                      <p className="font-medium">{foodSubmissionError}</p>
                    </div>
                  )}
                  {foodSubmissionSuccess && (
                    <div className="p-4 bg-green-500 bg-opacity-20 border border-green-500 text-green-100 rounded-md">
                      <p className="font-medium">Food selections saved successfully!</p>
                    </div>
                  )}
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <button
                    onClick={()=>handleFoodSubmission("extra")}
                    disabled={foodSubmissionLoading || !selectedFoods.extra}
              className={`bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 ${
                      foodSubmissionLoading || !selectedFoods.extra
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {foodSubmissionLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Saving selections...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Save Food Selections</span>
                      </>
                    )}
                  </button>
            
            {/* Advanced Customization button removed */}
          </div>
                </div>
      </div>
    );
  };

  // Effect to fetch food data when the selected date changes
  useEffect(() => {
    if (userData.id) {
      fetchFoodData(selectedFoodDate);
    }
  }, [selectedFoodDate, userData.id,]);

  // Effect to fetch exercise data when the selected date changes
  useEffect(() => {
    if (userData.id) {
      fetchExerciseData(selectedFoodDate);
    }
  }, [selectedFoodDate, userData.id]);

  // Effect to fetch exercise history data on component mount
  useEffect(() => {
    if (userData.id) {
      fetchExerciseHistory(historyDays);
    }
  }, [userData.id, historyDays]);

  // Calculate calories burned for each exercise - without rounding
  const calculateCaloriesBurned = (exerciseType, reps) => {
    const caloriesPerRep = {
      'push-up': 0.4,
      'squat': 0.4,
      'pull-up': 0.8,
      'sit-up': 0.3,
      'walk': 0.1
    };
    
    return (caloriesPerRep[exerciseType] * reps).toFixed(1);
  };

  // Calculate total calories burned from all exercises - without rounding
  const calculateTotalCaloriesBurned = (summary) => {
    if (!summary) return 0;
    
    const caloriesPerRep = {
      'push-up': 0.4,
      'squat': 0.4,
      'pull-up': 0.8,
      'sit-up': 0.3,
      'walk': 0.1
    };
    
    let total = 0;
    for (const [exercise, reps] of Object.entries(summary)) {
      if (exercise !== 'date' && caloriesPerRep[exercise]) {
        total += caloriesPerRep[exercise] * reps;
      }
    }
    
    return total.toFixed(1);
  };

  // Render Progress Section with charts and visualizations
  const renderProgressSection = () => {
    if (exerciseHistoryLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    }

    if (exerciseHistoryError) {
      return (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <p className="text-red-500 mb-4">{exerciseHistoryError}</p>
          <button 
            onClick={() => fetchExerciseHistory(historyDays)}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!exerciseHistory || !exerciseHistory.exercise_summary || exerciseHistory.exercise_summary.length === 0) {
      return (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <p className="text-gray-400 mb-4">No exercise history available. Start logging your exercises to see progress!</p>
        </div>
      );
    }

    // Data preparation for charts
    const summaries = exerciseHistory.exercise_summary;
    const dates = summaries.map(summary => format(parseISO(summary.date), 'MMM dd'));
    const situps = summaries.map(summary => summary['sit-up'] || 0);
    const pullups = summaries.map(summary => summary['pull-up'] || 0);
    const pushups = summaries.map(summary => summary['push-up'] || 0);
    const squats = summaries.map(summary => summary['squat'] || 0);
    const walks = summaries.map(summary => summary['walk'] || 0);
    
    // Calculate calories for each exercise type
    const situpCalories = summaries.map(summary => (summary['sit-up'] || 0) * 0.3);
    const pullupCalories = summaries.map(summary => (summary['pull-up'] || 0) * 0.8);
    const pushupCalories = summaries.map(summary => (summary['push-up'] || 0) * 0.4);
    const squatCalories = summaries.map(summary => (summary['squat'] || 0) * 0.4);
    const walkCalories = summaries.map(summary => (summary['walk'] || 0) * 0.1);
    
    // Total calories burned per day
    const totalCaloriesByDay = summaries.map(summary => {
      return parseFloat(calculateTotalCaloriesBurned(summary));
    });

    // Line chart data for exercise reps
    const exerciseLineData = {
      labels: dates,
      datasets: [
        {
          label: 'Sit-ups',
          data: situps,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.2,
        },
        {
          label: 'Pull-ups',
          data: pullups,
          borderColor: 'rgba(53, 162, 235, 1)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.2,
        },
        {
          label: 'Push-ups',
          data: pushups,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.2,
        },
        {
          label: 'Squats',
          data: squats,
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
          tension: 0.2,
        }
      ]
    };

    // Bar chart data for calories burned per exercise type
    const caloriesBarData = {
      labels: dates,
      datasets: [
        {
          label: 'Sit-ups',
          data: situpCalories,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
        },
        {
          label: 'Pull-ups',
          data: pullupCalories,
          backgroundColor: 'rgba(53, 162, 235, 0.7)',
        },
        {
          label: 'Push-ups',
          data: pushupCalories,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
        },
        {
          label: 'Squats',
          data: squatCalories,
          backgroundColor: 'rgba(255, 206, 86, 0.7)',
        },
        {
          label: 'Walking',
          data: walkCalories,
          backgroundColor: 'rgba(153, 102, 255, 0.7)',
        }
      ]
    };

    // Stacked area chart data for total calories burned
    const totalCaloriesLineData = {
      labels: dates,
      datasets: [
        {
          label: 'Total Calories Burned',
          data: totalCaloriesByDay,
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.4)',
          fill: true,
          tension: 0.4,
        }
      ]
    };

    // Pie chart data for exercise distribution
    const lastDaySummary = summaries[0]; // Most recent day
    const exerciseDistributionData = {
      labels: ['Sit-ups', 'Pull-ups', 'Push-ups', 'Squats', 'Walking'],
      datasets: [
        {
          data: [
            lastDaySummary['sit-up'] || 0,
            lastDaySummary['pull-up'] || 0,
            lastDaySummary['push-up'] || 0,
            lastDaySummary['squat'] || 0,
            lastDaySummary['walk'] || 0,
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(53, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(153, 102, 255, 0.7)',
          ],
          borderWidth: 1,
        },
      ],
    };

    // Radar chart data for progress comparison (first day vs last day)
    const firstDaySummary = summaries[summaries.length - 1]; // Oldest day
    const radarData = {
      labels: ['Sit-ups', 'Pull-ups', 'Push-ups', 'Squats', 'Walking (÷100)'],
      datasets: [
        {
          label: 'First Day',
          data: [
            firstDaySummary['sit-up'] || 0,
            firstDaySummary['pull-up'] || 0,
            firstDaySummary['push-up'] || 0,
            firstDaySummary['squat'] || 0,
            firstDaySummary['walk'] ? firstDaySummary['walk'] / 100 : 0, // Scale down walking steps
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
        },
        {
          label: 'Latest Day',
          data: [
            lastDaySummary['sit-up'] || 0,
            lastDaySummary['pull-up'] || 0,
            lastDaySummary['push-up'] || 0,
            lastDaySummary['squat'] || 0,
            lastDaySummary['walk'] ? lastDaySummary['walk'] / 100 : 0, // Scale down walking steps
          ],
          backgroundColor: 'rgba(53, 162, 235, 0.2)',
          borderColor: 'rgba(53, 162, 235, 1)',
          borderWidth: 2,
        },
      ],
    };

    // Chart options
    const lineOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Exercise Repetitions Over Time',
          color: 'white',
          font: {
            size: 16
          }
        },
      },
      scales: {
        y: {
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        x: {
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    };

    const barOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Calories Burned by Exercise Type',
          color: 'white',
          font: {
            size: 16
          }
        },
      },
      scales: {
        y: {
          stacked: true,
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        x: {
          stacked: true,
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    };

    const areaOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Total Calories Burned Over Time',
          color: 'white',
          font: {
            size: 16
          }
        },
      },
      scales: {
        y: {
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        x: {
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    };

    const pieOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Latest Day Exercise Distribution',
          color: 'white',
          font: {
            size: 16
          }
        },
      }
    };

    const radarOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Progress Comparison',
          color: 'white',
          font: {
            size: 16
          }
        },
      },
      scales: {
        r: {
          angleLines: {
            color: 'rgba(255, 255, 255, 0.2)'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.2)'
          },
          pointLabels: {
            color: 'rgba(255, 255, 255, 0.7)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            backdropColor: 'transparent'
          }
        }
      }
    };

    return (
      <div className="animate-fadeIn">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-orange-500">Exercise Progress</h2>
          <p className="text-gray-400 mb-6">Your exercise progress over the last {historyDays} days</p>
          
          <div className="flex flex-wrap items-center mb-4">
            <label htmlFor="historyDays" className="mr-2 text-sm">Days to display:</label>
            <select
              id="historyDays"
              value={historyDays}
              onChange={(e) => setHistoryDays(parseInt(e.target.value))}
              className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="3">3 days</option>
              <option value="5">5 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Exercise Repetitions Line Chart */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <Line data={exerciseLineData} options={lineOptions} />
            </div>
            
            {/* Calories Burned Stacked Bar Chart */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <Bar data={caloriesBarData} options={barOptions} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Total Calories Area Chart */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <Line data={totalCaloriesLineData} options={areaOptions} />
            </div>
            
            {/* Latest Day Exercise Distribution Pie Chart */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <Pie data={exerciseDistributionData} options={pieOptions} />
            </div>
          </div>
          
          {/* Progress Comparison Radar Chart */}
          <div className="bg-gray-700 p-4 rounded-lg mt-8 max-w-xl mx-auto">
            <Radar data={radarData} options={radarOptions} />
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">Total Sit-ups</p>
              <p className="text-2xl font-bold text-white">{situps.reduce((a, b) => a + b, 0)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">Total Pull-ups</p>
              <p className="text-2xl font-bold text-white">{pullups.reduce((a, b) => a + b, 0)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">Total Push-ups</p>
              <p className="text-2xl font-bold text-white">{pushups.reduce((a, b) => a + b, 0)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">Total Squats</p>
              <p className="text-2xl font-bold text-white">{squats.reduce((a, b) => a + b, 0)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">Total Steps</p>
              <p className="text-2xl font-bold text-white">{walks.reduce((a, b) => a + b, 0).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-xl mb-2 text-orange-500">Total Calories Burned</h3>
            <p className="text-3xl font-bold">{totalCaloriesByDay.reduce((a, b) => a + b, 0).toFixed(1)} kcal</p>
          </div>
        </div>
      </div>
    );
  };

  // Add the handleDeleteExercise function
  const handleDeleteExercise = async () => {
    if (!userData.id) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/user/${userData.id}/exercise-data/${selectedFoodDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Refresh exercise data
      fetchExerciseData(selectedFoodDate);
    } catch (error) {
      console.error('Error deleting exercise data:', error);
      setExerciseDataError('Failed to delete exercise data');
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      <div className="container mx-auto px-1 sm:px-2 md:px-4 py-6 sm:py-8 md:py-12 max-w-7xl">
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 sm:mb-4 text-orange-500">
            Your Fitness Dashboard
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Track your progress, get personalized recommendations, and reach your goals
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 text-center">
              {/* Cool avatar from DiceBear instead of profile image */}
              <img 
                src={userData.avatarUrl} 
                alt={userData.name} 
                className="w-24 h-24 rounded-full border-2 border-orange-500 mx-auto"
              />
              <p className="text-xs text-gray-400 mt-2">Member since: {userData.joinDate}</p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md mt-2 text-sm font-semibold transition-colors duration-300 w-full">
                Edit Profile
              </button>
            </div>
            <div className="flex-grow">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{userData.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-gray-700 p-2 rounded">
                  <p className="text-gray-400 text-xs">Age</p>
                  <p className="font-semibold">{userData.age} years</p>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <p className="text-gray-400 text-xs">Height</p>
                  <p className="font-semibold">{userData.height} cm</p>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <p className="text-gray-400 text-xs">Weight</p>
                  <p className="font-semibold">{userData.weight} kg</p>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <p className="text-gray-400 text-xs">BMI</p>
                  <p className="font-semibold">{userData.bmi}</p>
                </div>
                <div className="bg-gray-700 p-2 rounded sm:col-span-2">
                  <p className="text-gray-400 text-xs">Category</p>
                  <p className="font-semibold text-orange-500">{userData.bmiCategory}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
              {/* Empty div to maintain layout */}
            </div>
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div className="mb-6">
          <div className="bg-gray-800 p-1 rounded-lg flex overflow-x-auto">
            <button
              className={`flex-1 py-2 px-4 text-center rounded-md ${activeTab === 'overview' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`flex-1 py-2 px-4 text-center rounded-md ${activeTab === 'nutrition' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('nutrition')}
            >
              Nutrition
            </button>
            <button
              className={`flex-1 py-2 px-4 text-center rounded-md ${activeTab === 'custom' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('custom')}
            >
              Custom
            </button>
            <button
              className={`flex-1 py-2 px-4 text-center rounded-md ${activeTab === 'progress' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('progress')}
            >
              Progress
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          {activeTab === 'overview' && renderOverviewSection()}
          {activeTab === 'nutrition' && renderNutritionSection()}
          {activeTab === 'custom' && renderCustomNutritionSection()}
          {activeTab === 'progress' && renderProgressSection()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardPage;

