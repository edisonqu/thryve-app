
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useNutrition } from "@/context/NutritionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/utils/macroCalculation";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FoodCard from "@/components/FoodCard";

const History = () => {
  const navigate = useNavigate();
  const { foods } = useNutrition();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get dates for the current week
  const getWeekDates = () => {
    const dates = [];
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };
  
  const weekDates = getWeekDates();
  
  // Filter foods for the selected date
  const getFilteredFoods = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return foods.filter(food => {
      const foodDate = new Date(food.timestamp);
      return foodDate >= startOfDay && foodDate <= endOfDay;
    });
  };
  
  const filteredFoods = getFilteredFoods(selectedDate);
  
  // Calculate daily totals for the selected date
  const dailyTotals = filteredFoods.reduce(
    (acc, food) => {
      return {
        calories: acc.calories + food.calories,
        carbs: acc.carbs + food.carbs,
        protein: acc.protein + food.protein,
        fat: acc.fat + food.fat,
      };
    },
    { calories: 0, carbs: 0, protein: 0, fat: 0 }
  );
  
  const formatDateShort = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((compareDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    
    if (dayDiff === 0) return "Today";
    if (dayDiff === -1) return "Yesterday";
    if (dayDiff === 1) return "Tomorrow";
    
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  };
  
  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };
  
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };
  
  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">History</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full"
          >
            <Calendar size={20} />
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
            <ChevronLeft size={24} />
          </Button>
          <h2 className="text-lg font-medium">{formatFullDate(selectedDate)}</h2>
          <Button variant="ghost" size="icon" onClick={handleNextDay}>
            <ChevronRight size={24} />
          </Button>
        </div>
        
        <div className="flex justify-between overflow-x-auto pb-2 -mx-2 px-2">
          {weekDates.map((date, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center px-1 min-w-[3rem] ${
                isSelectedDate(date) 
                  ? "text-primary"
                  : isToday(date)
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              <Button
                variant={isSelectedDate(date) ? "default" : "ghost"}
                size="sm"
                className={`rounded-full w-10 h-10 ${isToday(date) && !isSelectedDate(date) ? "border border-primary" : ""}`}
                onClick={() => handleDateClick(date)}
              >
                {date.getDate()}
              </Button>
              <span className="text-xs mt-1">{formatDateShort(date)}</span>
            </div>
          ))}
        </div>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-muted-foreground text-sm">Calories</span>
                <p className="text-2xl font-semibold">{formatNumber(dailyTotals.calories)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-sm">Protein</span>
                <p className="text-2xl font-semibold">{formatNumber(dailyTotals.protein)}g</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-sm">Carbs</span>
                <p className="text-2xl font-semibold">{formatNumber(dailyTotals.carbs)}g</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-sm">Fat</span>
                <p className="text-2xl font-semibold">{formatNumber(dailyTotals.fat)}g</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Food Entries</h3>
          
          {filteredFoods.length > 0 ? (
            <div className="space-y-3">
              {filteredFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onClick={() => navigate(`/food/${food.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No food entries for this day</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default History;
