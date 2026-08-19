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
      { weekday: 1, dayName: "Push Day", exerciseNames: ["Flat Barbell Bench Press", "Incline Dumbbell Bench Press", "Dumbbell Shoulder Press", "Cable Lateral Raise", "Cable Pushdown"] },
      { weekday: 3, dayName: "Pull Day", exerciseNames: ["Barbell Row", "Lat Pulldown", "Face Pull", "Barbell Curl", "Hammer Curl"] },
      { weekday: 5, dayName: "Leg Day", exerciseNames: ["Barbell Back Squat", "Leg Press", "Leg Extension", "Lying Leg Curl", "Barbell Calf Raise"] },
    ],
  },
  {
    key: "upper_lower",
    name: "Upper / Lower",
    daysPerWeek: 4,
    muscleCoverage: "Chest, Back, Shoulders, Arms · Legs, Glutes",
    days: [
      { weekday: 1, dayName: "Upper Body", exerciseNames: ["Flat Barbell Bench Press", "Barbell Row", "Dumbbell Shoulder Press", "Lat Pulldown", "Barbell Curl", "Cable Pushdown"] },
      { weekday: 2, dayName: "Lower Body", exerciseNames: ["Barbell Back Squat", "Leg Press", "Lying Leg Curl", "Barbell Calf Raise", "Barbell Hip Thrust"] },
      { weekday: 4, dayName: "Upper Body", exerciseNames: ["Flat Barbell Bench Press", "Barbell Row", "Dumbbell Shoulder Press", "Lat Pulldown", "Barbell Curl", "Cable Pushdown"] },
      { weekday: 5, dayName: "Lower Body", exerciseNames: ["Barbell Back Squat", "Leg Press", "Lying Leg Curl", "Barbell Calf Raise", "Barbell Hip Thrust"] },
    ],
  },
  {
    key: "full_body",
    name: "Full Body",
    daysPerWeek: 3,
    muscleCoverage: "Full body every session",
    days: [
      { weekday: 1, dayName: "Full Body", exerciseNames: ["Barbell Back Squat", "Flat Barbell Bench Press", "Barbell Row", "Dumbbell Shoulder Press", "Leg Press", "Barbell Curl"] },
      { weekday: 3, dayName: "Full Body", exerciseNames: ["Barbell Back Squat", "Flat Barbell Bench Press", "Barbell Row", "Dumbbell Shoulder Press", "Leg Press", "Barbell Curl"] },
      { weekday: 5, dayName: "Full Body", exerciseNames: ["Barbell Back Squat", "Flat Barbell Bench Press", "Barbell Row", "Dumbbell Shoulder Press", "Leg Press", "Barbell Curl"] },
    ],
  },
  {
    key: "bro_split",
    name: "Bro Split",
    daysPerWeek: 5,
    muscleCoverage: "Chest · Back · Shoulders · Arms · Legs",
    days: [
      { weekday: 1, dayName: "Chest Day", exerciseNames: ["Flat Barbell Bench Press", "Incline Dumbbell Bench Press", "Cable Fly", "Decline Barbell Bench Press"] },
      { weekday: 2, dayName: "Back Day", exerciseNames: ["Barbell Row", "Lat Pulldown", "Pull-Up", "Face Pull", "Dumbbell Pullover"] },
      { weekday: 3, dayName: "Shoulder Day", exerciseNames: ["Dumbbell Shoulder Press", "Cable Lateral Raise", "Dumbbell Reverse Fly", "Barbell Front Raise"] },
      { weekday: 4, dayName: "Arm Day", exerciseNames: ["Barbell Curl", "Hammer Curl", "Cable Pushdown", "Skull Crusher"] },
      { weekday: 5, dayName: "Leg Day", exerciseNames: ["Barbell Back Squat", "Leg Press", "Leg Extension", "Lying Leg Curl", "Barbell Calf Raise"] },
    ],
  },
];
