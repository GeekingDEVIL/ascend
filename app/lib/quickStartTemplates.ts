export type QuickStartDay = { weekday: number; dayName: string; exerciseNames: string[] };

export type QuickStartTemplate = {
  key: string;
  name: string;
  daysPerWeek: number;
  muscleCoverage: string;
  days: QuickStartDay[];
};

// weekday: 0=Sun..6=Sat
export const QUICK_START_TEMPLATES: QuickStartTemplate[] = [
  {
    key: "ppl",
    name: "Push / Pull / Legs",
    daysPerWeek: 3,
    muscleCoverage: "Chest, Shoulders, Triceps · Back, Biceps · Legs",
    days: [
      { weekday: 1, dayName: "Push Day", exerciseNames: ["Barbell Bench Press - Medium Grip", "Incline Dumbbell Press", "Dumbbell Shoulder Press", "Cable Seated Lateral Raise", "Triceps Pushdown"] },
      { weekday: 3, dayName: "Pull Day", exerciseNames: ["Bent Over Barbell Row", "Wide-Grip Lat Pulldown", "Face Pull", "Barbell Curl", "Hammer Curls"] },
      { weekday: 5, dayName: "Leg Day", exerciseNames: ["Barbell Squat", "Leg Press", "Leg Extensions", "Lying Leg Curls", "Barbell Seated Calf Raise"] },
    ],
  },
  {
    key: "upper_lower",
    name: "Upper / Lower",
    daysPerWeek: 4,
    muscleCoverage: "Chest, Back, Shoulders, Arms · Legs, Glutes",
    days: [
      { weekday: 1, dayName: "Upper Body", exerciseNames: ["Barbell Bench Press - Medium Grip", "Bent Over Barbell Row", "Dumbbell Shoulder Press", "Wide-Grip Lat Pulldown", "Barbell Curl", "Triceps Pushdown"] },
      { weekday: 2, dayName: "Lower Body", exerciseNames: ["Barbell Squat", "Leg Press", "Lying Leg Curls", "Barbell Seated Calf Raise", "Barbell Hip Thrust"] },
      { weekday: 4, dayName: "Upper Body", exerciseNames: ["Barbell Bench Press - Medium Grip", "Bent Over Barbell Row", "Dumbbell Shoulder Press", "Wide-Grip Lat Pulldown", "Barbell Curl", "Triceps Pushdown"] },
      { weekday: 5, dayName: "Lower Body", exerciseNames: ["Barbell Squat", "Leg Press", "Lying Leg Curls", "Barbell Seated Calf Raise", "Barbell Hip Thrust"] },
    ],
  },
  {
    key: "full_body",
    name: "Full Body",
    daysPerWeek: 3,
    muscleCoverage: "Full body every session",
    days: [
      { weekday: 1, dayName: "Full Body", exerciseNames: ["Barbell Squat", "Barbell Bench Press - Medium Grip", "Bent Over Barbell Row", "Dumbbell Shoulder Press", "Leg Press", "Barbell Curl"] },
      { weekday: 3, dayName: "Full Body", exerciseNames: ["Barbell Squat", "Barbell Bench Press - Medium Grip", "Bent Over Barbell Row", "Dumbbell Shoulder Press", "Leg Press", "Barbell Curl"] },
      { weekday: 5, dayName: "Full Body", exerciseNames: ["Barbell Squat", "Barbell Bench Press - Medium Grip", "Bent Over Barbell Row", "Dumbbell Shoulder Press", "Leg Press", "Barbell Curl"] },
    ],
  },
  {
    key: "bro_split",
    name: "Bro Split",
    daysPerWeek: 5,
    muscleCoverage: "Chest · Back · Shoulders · Arms · Legs",
    days: [
      { weekday: 1, dayName: "Chest Day", exerciseNames: ["Barbell Bench Press - Medium Grip", "Incline Dumbbell Press", "Cable Crossover", "Decline Barbell Bench Press"] },
      { weekday: 2, dayName: "Back Day", exerciseNames: ["Bent Over Barbell Row", "Wide-Grip Lat Pulldown", "Pullups", "Face Pull", "Bent-Arm Dumbbell Pullover"] },
      { weekday: 3, dayName: "Shoulder Day", exerciseNames: ["Dumbbell Shoulder Press", "Cable Seated Lateral Raise", "Reverse Flyes", "Side Laterals to Front Raise"] },
      { weekday: 4, dayName: "Arm Day", exerciseNames: ["Barbell Curl", "Hammer Curls", "Triceps Pushdown", "EZ-Bar Skullcrusher"] },
      { weekday: 5, dayName: "Leg Day", exerciseNames: ["Barbell Squat", "Leg Press", "Leg Extensions", "Lying Leg Curls", "Barbell Seated Calf Raise"] },
    ],
  },
];
