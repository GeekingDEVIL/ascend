export type PlanDay = {
  dayNum: number;
  focus: string;
  exercises: { name: string; sets: number; reps: string; rest: string; rir: string }[];
};

export type WorkoutPlan = {
  id: string;
  env: "Gym" | "Bodyweight" | "Dumbbells at home";
  days: number;
  goal: string;
  split: string;
  level: string;
  name: string;
  schedule: string;
  duration: string;
  volume: string;
  sequence: string;
  note: string;
  sex?: "male" | "female";
  workouts: PlanDay[];
};

export const PLAN_LIBRARY: WorkoutPlan[] = [
  {
    id: "GYM-2-01",
    env: "Gym" as const,
    days: 2,
    goal: "Get in shape",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Beginner",
    name: "Get in shape \u2014 PPL 2D",
    schedule: "Mon / Thu",
    duration: "50\u201375 min",
    volume: "5\u20139 challenging sets / muscle group",
    sequence: "D1: Push + quads | D2: Pull + posterior chain",
    note: "Use controlled reps and consistent attendance before adding complexity. PPL is adapted here: legs pair with push/pull so all major patterns are trained twice weekly.",
    workouts: [
      { dayNum: 1, focus: "Push + quads", exercises: [
        { name: "Barbell Squat", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Barbell Bench Press - Medium Grip", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Leg Extensions", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] },
      { dayNum: 2, focus: "Pull + posterior chain", exercises: [
        { name: "Romanian Deadlift", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Incline Row", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] }
    ]
  },
  {
    id: "GYM-2-02",
    env: "Gym" as const,
    days: 2,
    goal: "Get in shape",
    split: "BRO SPLIT",
    level: "Beginner",
    name: "Get in shape \u2014 Bro 2D",
    schedule: "Mon / Thu",
    duration: "50\u201375 min",
    volume: "5\u20139 challenging sets / muscle group",
    sequence: "D1: Upper \u2014 chest / back / arms | D2: Lower \u2014 legs / shoulders",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Upper \u2014 chest / back / arms", exercises: [
        { name: "Dumbbell Bench Press", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Incline Row", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] },
      { dayNum: 2, focus: "Lower \u2014 legs / shoulders", exercises: [
        { name: "Barbell Squat", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Romanian Deadlift", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Leg Press", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] }
    ]
  },
  {
    id: "GYM-2-03",
    env: "Gym" as const,
    days: 2,
    goal: "Get lean",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Get lean \u2014 PPL 2D",
    schedule: "Mon / Thu",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Push + quads | D2: Pull + posterior chain",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit. PPL is adapted here: legs pair with push/pull so all major patterns are trained twice weekly.",
    workouts: [
      { dayNum: 1, focus: "Push + quads", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Leg Extensions", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull + posterior chain", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-2-04",
    env: "Gym" as const,
    days: 2,
    goal: "Get lean",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Get lean \u2014 Bro 2D",
    schedule: "Mon / Thu",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Upper \u2014 chest / back / arms | D2: Lower \u2014 legs / shoulders",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Upper \u2014 chest / back / arms", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Lower \u2014 legs / shoulders", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-2-05",
    env: "Gym" as const,
    days: 2,
    goal: "Overall fitness",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Beginner",
    name: "Overall fitness \u2014 PPL 2D",
    schedule: "Mon / Thu",
    duration: "50\u201375 min",
    volume: "5\u20139 challenging sets / muscle group",
    sequence: "D1: Push + quads | D2: Pull + posterior chain",
    note: "Use controlled reps and consistent attendance before adding complexity. PPL is adapted here: legs pair with push/pull so all major patterns are trained twice weekly.",
    workouts: [
      { dayNum: 1, focus: "Push + quads", exercises: [
        { name: "Barbell Squat", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Barbell Bench Press - Medium Grip", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Leg Extensions", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] },
      { dayNum: 2, focus: "Pull + posterior chain", exercises: [
        { name: "Romanian Deadlift", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Incline Row", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] }
    ]
  },
  {
    id: "GYM-2-06",
    env: "Gym" as const,
    days: 2,
    goal: "Overall fitness",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Overall fitness \u2014 Bro 2D",
    schedule: "Mon / Thu",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Upper \u2014 chest / back / arms | D2: Lower \u2014 legs / shoulders",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Upper \u2014 chest / back / arms", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Lower \u2014 legs / shoulders", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-2-07",
    env: "Gym" as const,
    days: 2,
    goal: "Build muscles",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 PPL 2D",
    schedule: "Mon / Thu",
    duration: "50\u201375 min",
    volume: "8\u201314 hard sets / muscle group",
    sequence: "D1: Push + quads | D2: Pull + posterior chain",
    note: "Add load only after all work sets reach the top of the range with the stated RIR. PPL is adapted here: legs pair with push/pull so all major patterns are trained twice weekly.",
    workouts: [
      { dayNum: 1, focus: "Push + quads", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Leg Extensions", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull + posterior chain", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-2-08",
    env: "Gym" as const,
    days: 2,
    goal: "Build muscles",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 Bro 2D",
    schedule: "Mon / Thu",
    duration: "50\u201375 min",
    volume: "8\u201314 hard sets / muscle group",
    sequence: "D1: Upper \u2014 chest / back / arms | D2: Lower \u2014 legs / shoulders",
    note: "Add load only after all work sets reach the top of the range with the stated RIR.",
    workouts: [
      { dayNum: 1, focus: "Upper \u2014 chest / back / arms", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Lower \u2014 legs / shoulders", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-2-09",
    env: "Gym" as const,
    days: 2,
    goal: "Lose weight",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Beginner",
    name: "Lose weight \u2014 PPL 2D",
    schedule: "Mon / Thu",
    duration: "50\u201375 min",
    volume: "5\u20139 challenging sets / muscle group",
    sequence: "D1: Push + quads | D2: Pull + posterior chain",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit. PPL is adapted here: legs pair with push/pull so all major patterns are trained twice weekly.",
    workouts: [
      { dayNum: 1, focus: "Push + quads", exercises: [
        { name: "Barbell Squat", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Barbell Bench Press - Medium Grip", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Leg Extensions", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" }
      ] },
      { dayNum: 2, focus: "Pull + posterior chain", exercises: [
        { name: "Romanian Deadlift", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Dumbbell Incline Row", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" }
      ] }
    ]
  },
  {
    id: "GYM-2-10",
    env: "Gym" as const,
    days: 2,
    goal: "Lose weight",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Lose weight \u2014 Bro 2D",
    schedule: "Mon / Thu",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Upper \u2014 chest / back / arms | D2: Lower \u2014 legs / shoulders",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Upper \u2014 chest / back / arms", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Lower \u2014 legs / shoulders", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-3-01",
    env: "Gym" as const,
    days: 3,
    goal: "Get lean",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Beginner",
    name: "Get lean \u2014 PPL 3D",
    schedule: "Mon / Wed / Fri",
    duration: "50\u201375 min",
    volume: "5\u20139 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Incline Dumbbell Press", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Dumbbell Incline Row", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Seated Cable Rows", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Romanian Deadlift", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Leg Press", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "3" }
      ] }
    ]
  },
  {
    id: "GYM-3-02",
    env: "Gym" as const,
    days: 3,
    goal: "Get lean",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Get lean \u2014 Bro 3D",
    schedule: "Mon / Wed / Fri",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs + shoulders",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Pushups", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs + shoulders", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-3-03",
    env: "Gym" as const,
    days: 3,
    goal: "Overall fitness",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Overall fitness \u2014 PPL 3D",
    schedule: "Mon / Wed / Fri",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-3-04",
    env: "Gym" as const,
    days: 3,
    goal: "Overall fitness",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Overall fitness \u2014 Bro 3D",
    schedule: "Mon / Wed / Fri",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs + shoulders",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Pushups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs + shoulders", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-3-05",
    env: "Gym" as const,
    days: 3,
    goal: "Build muscles",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Beginner",
    name: "Build muscles \u2014 PPL 3D",
    schedule: "Mon / Wed / Fri",
    duration: "50\u201375 min",
    volume: "6\u201310 hard sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs",
    note: "Add load only after all work sets reach the top of the range with the stated RIR.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 2, reps: "6\u201310", rest: "90\u2013120", rir: "3" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "6\u201310", rest: "90\u2013120", rir: "3" },
        { name: "Incline Dumbbell Press", sets: 2, reps: "6\u201310", rest: "90\u2013120", rir: "3" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "3" },
        { name: "Side Lateral Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "3" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "3" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "6\u201310", rest: "90\u2013120", rir: "3" },
        { name: "Dumbbell Incline Row", sets: 2, reps: "6\u201310", rest: "90\u2013120", rir: "3" },
        { name: "Seated Cable Rows", sets: 2, reps: "6\u201310", rest: "90\u2013120", rir: "3" },
        { name: "Reverse Flyes", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "3" },
        { name: "Face Pull", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "3" },
        { name: "Hammer Curls", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "3" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 2, reps: "6\u201310", rest: "90\u2013120", rir: "3" },
        { name: "Romanian Deadlift", sets: 2, reps: "6\u201310", rest: "90\u2013120", rir: "3" },
        { name: "Leg Press", sets: 2, reps: "6\u201310", rest: "90\u2013120", rir: "3" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Lunges", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "3" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "3" }
      ] }
    ]
  },
  {
    id: "GYM-3-06",
    env: "Gym" as const,
    days: 3,
    goal: "Build muscles",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 Bro 3D",
    schedule: "Mon / Wed / Fri",
    duration: "50\u201375 min",
    volume: "8\u201314 hard sets / muscle group",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs + shoulders",
    note: "Add load only after all work sets reach the top of the range with the stated RIR.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Pushups", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs + shoulders", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-3-07",
    env: "Gym" as const,
    days: 3,
    goal: "Lose weight",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Lose weight \u2014 PPL 3D",
    schedule: "Mon / Wed / Fri",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-3-08",
    env: "Gym" as const,
    days: 3,
    goal: "Lose weight",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Lose weight \u2014 Bro 3D",
    schedule: "Mon / Wed / Fri",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs + shoulders",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Pushups", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs + shoulders", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-3-09",
    env: "Gym" as const,
    days: 3,
    goal: "Build strength",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Build strength \u2014 PPL 3D",
    schedule: "Mon / Wed / Fri",
    duration: "50\u201375 min",
    volume: "8\u201312 quality sets / movement pattern",
    sequence: "D1: Push | D2: Pull | D3: Legs",
    note: "Prioritize crisp technique, full recovery, and progressive loading on the first lift.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-3-10",
    env: "Gym" as const,
    days: 3,
    goal: "Build strength",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Build strength \u2014 Bro 3D",
    schedule: "Mon / Wed / Fri",
    duration: "50\u201375 min",
    volume: "8\u201312 quality sets / movement pattern",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs + shoulders",
    note: "Prioritize crisp technique, full recovery, and progressive loading on the first lift.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Pushups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs + shoulders", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-4-01",
    env: "Gym" as const,
    days: 4,
    goal: "Overall fitness",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Overall fitness \u2014 PPL 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper balance",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Upper balance", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-4-02",
    env: "Gym" as const,
    days: 4,
    goal: "Overall fitness",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Overall fitness \u2014 Bro 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs | D4: Shoulders + arms",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Pushups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Shoulders + arms", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-4-03",
    env: "Gym" as const,
    days: 4,
    goal: "Build muscles",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 PPL 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50\u201375 min",
    volume: "8\u201314 hard sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper balance",
    note: "Add load only after all work sets reach the top of the range with the stated RIR.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Upper balance", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-4-04",
    env: "Gym" as const,
    days: 4,
    goal: "Build muscles",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 Bro 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50\u201375 min",
    volume: "8\u201314 hard sets / muscle group",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs | D4: Shoulders + arms",
    note: "Add load only after all work sets reach the top of the range with the stated RIR.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Pushups", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Shoulders + arms", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-4-05",
    env: "Gym" as const,
    days: 4,
    goal: "Lose weight",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Lose weight \u2014 PPL 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper balance",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 4, focus: "Upper balance", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-4-06",
    env: "Gym" as const,
    days: 4,
    goal: "Lose weight",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Lose weight \u2014 Bro 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs | D4: Shoulders + arms",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Pushups", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 4, focus: "Shoulders + arms", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-4-07",
    env: "Gym" as const,
    days: 4,
    goal: "Build strength",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Build strength \u2014 PPL 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50\u201375 min",
    volume: "10\u201316 quality sets / movement pattern",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper balance",
    note: "Prioritize crisp technique, full recovery, and progressive loading on the first lift.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 5, reps: "3\u20136", rest: "180\u2013240", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 5, reps: "3\u20136", rest: "180\u2013240", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 5, reps: "3\u20136", rest: "180\u2013240", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Upper balance", exercises: [
        { name: "Dumbbell Bench Press", sets: 5, reps: "3\u20136", rest: "180\u2013240", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "GYM-4-08",
    env: "Gym" as const,
    days: 4,
    goal: "Build strength",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Build strength \u2014 Bro 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50\u201375 min",
    volume: "8\u201312 quality sets / movement pattern",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs | D4: Shoulders + arms",
    note: "Prioritize crisp technique, full recovery, and progressive loading on the first lift.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Pushups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Shoulders + arms", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-4-09",
    env: "Gym" as const,
    days: 4,
    goal: "Get in shape",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Get in shape \u2014 PPL 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50\u201375 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper balance",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Upper balance", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "GYM-4-10",
    env: "Gym" as const,
    days: 4,
    goal: "Get in shape",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Get in shape \u2014 Bro 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50\u201375 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs | D4: Shoulders + arms",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Pushups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Shoulders + arms", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-5-01",
    env: "Gym" as const,
    days: 5,
    goal: "Build muscles",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 PPL 5D",
    schedule: "Mon\u2013Fri",
    duration: "45\u201370 min",
    volume: "8\u201314 hard sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper | D5: Lower + arms",
    note: "Add load only after all work sets reach the top of the range with the stated RIR.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Upper", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 5, focus: "Lower + arms", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-5-02",
    env: "Gym" as const,
    days: 5,
    goal: "Build muscles",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 Bro 5D",
    schedule: "Mon\u2013Fri",
    duration: "45\u201370 min",
    volume: "8\u201314 hard sets / muscle group",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms + core",
    note: "Add load only after all work sets reach the top of the range with the stated RIR.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Pushups", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 5, focus: "Arms + core", exercises: [
        { name: "Close-Grip Barbell Bench Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Incline Dumbbell Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown - Rope Attachment", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-5-03",
    env: "Gym" as const,
    days: 5,
    goal: "Lose weight",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Lose weight \u2014 PPL 5D",
    schedule: "Mon\u2013Fri",
    duration: "45\u201370 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper | D5: Lower + arms",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 4, focus: "Upper", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 5, focus: "Lower + arms", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-5-04",
    env: "Gym" as const,
    days: 5,
    goal: "Lose weight",
    split: "BRO SPLIT",
    level: "Advanced",
    name: "Lose weight \u2014 Bro 5D",
    schedule: "Mon\u2013Fri",
    duration: "45\u201370 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms + core",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Pushups", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Arms + core", exercises: [
        { name: "Close-Grip Barbell Bench Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Incline Dumbbell Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Triceps Pushdown - Rope Attachment", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Cable Crunch", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "GYM-5-05",
    env: "Gym" as const,
    days: 5,
    goal: "Build strength",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Build strength \u2014 PPL 5D",
    schedule: "Mon\u2013Fri",
    duration: "45\u201370 min",
    volume: "8\u201312 quality sets / movement pattern",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper | D5: Lower + arms",
    note: "Prioritize crisp technique, full recovery, and progressive loading on the first lift.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Upper", exercises: [
        { name: "Dumbbell Bench Press", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 5, focus: "Lower + arms", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-5-06",
    env: "Gym" as const,
    days: 5,
    goal: "Build strength",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Build strength \u2014 Bro 5D",
    schedule: "Mon\u2013Fri",
    duration: "45\u201370 min",
    volume: "8\u201312 quality sets / movement pattern",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms + core",
    note: "Prioritize crisp technique, full recovery, and progressive loading on the first lift.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Pushups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 5, focus: "Arms + core", exercises: [
        { name: "Close-Grip Barbell Bench Press", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Incline Dumbbell Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown - Rope Attachment", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-5-07",
    env: "Gym" as const,
    days: 5,
    goal: "Get in shape",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Get in shape \u2014 PPL 5D",
    schedule: "Mon\u2013Fri",
    duration: "45\u201370 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper | D5: Lower + arms",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Upper", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Lower + arms", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "GYM-5-08",
    env: "Gym" as const,
    days: 5,
    goal: "Get in shape",
    split: "BRO SPLIT",
    level: "Advanced",
    name: "Get in shape \u2014 Bro 5D",
    schedule: "Mon\u2013Fri",
    duration: "45\u201370 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms + core",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Pushups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Arms + core", exercises: [
        { name: "Close-Grip Barbell Bench Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Incline Dumbbell Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown - Rope Attachment", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Cable Crunch", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "GYM-5-09",
    env: "Gym" as const,
    days: 5,
    goal: "Get lean",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Get lean \u2014 PPL 5D",
    schedule: "Mon\u2013Fri",
    duration: "45\u201370 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper | D5: Lower + arms",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Upper", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Lower + arms", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "GYM-5-10",
    env: "Gym" as const,
    days: 5,
    goal: "Get lean",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Get lean \u2014 Bro 5D",
    schedule: "Mon\u2013Fri",
    duration: "45\u201370 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms + core",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Pushups", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 5, focus: "Arms + core", exercises: [
        { name: "Close-Grip Barbell Bench Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Incline Dumbbell Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown - Rope Attachment", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-6-01",
    env: "Gym" as const,
    days: 6,
    goal: "Lose weight",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Lose weight \u2014 PPL 6D",
    schedule: "Mon\u2013Sat",
    duration: "45\u201370 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Push A | D2: Pull A | D3: Legs A | D4: Push B | D5: Pull B | D6: Legs B",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Push A", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull A", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 4, focus: "Push B", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 5, focus: "Pull B", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 6, focus: "Legs B", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-6-02",
    env: "Gym" as const,
    days: 6,
    goal: "Lose weight",
    split: "BRO SPLIT",
    level: "Advanced",
    name: "Lose weight \u2014 Bro 6D",
    schedule: "Mon\u2013Sat",
    duration: "45\u201370 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms | D6: Weak point + conditioning",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Pushups", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Arms", exercises: [
        { name: "Close-Grip Barbell Bench Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Incline Dumbbell Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Triceps Pushdown - Rope Attachment", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Cable Crunch", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 6, focus: "Weak point + conditioning", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "GYM-6-03",
    env: "Gym" as const,
    days: 6,
    goal: "Build strength",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Build strength \u2014 PPL 6D",
    schedule: "Mon\u2013Sat",
    duration: "45\u201370 min",
    volume: "8\u201312 quality sets / movement pattern",
    sequence: "D1: Push A | D2: Pull A | D3: Legs A | D4: Push B | D5: Pull B | D6: Legs B",
    note: "Prioritize crisp technique, full recovery, and progressive loading on the first lift.",
    workouts: [
      { dayNum: 1, focus: "Push A", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull A", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs A", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Push B", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 5, focus: "Pull B", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 6, focus: "Legs B", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "3\u20136", rest: "180\u2013240", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "GYM-6-04",
    env: "Gym" as const,
    days: 6,
    goal: "Build strength",
    split: "BRO SPLIT",
    level: "Advanced",
    name: "Build strength \u2014 Bro 6D",
    schedule: "Mon\u2013Sat",
    duration: "45\u201370 min",
    volume: "10\u201316 quality sets / movement pattern",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms | D6: Weak point + conditioning",
    note: "Prioritize crisp technique, full recovery, and progressive loading on the first lift.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 5, reps: "3\u20136", rest: "180\u2013240", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Pushups", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 5, reps: "3\u20136", rest: "180\u2013240", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Bicep Curl", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 5, reps: "3\u20136", rest: "180\u2013240", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 5, reps: "3\u20136", rest: "180\u2013240", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Face Pull", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Arms", exercises: [
        { name: "Close-Grip Barbell Bench Press", sets: 5, reps: "3\u20136", rest: "180\u2013240", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Incline Dumbbell Curl", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown - Rope Attachment", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Cable Crunch", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 6, focus: "Weak point + conditioning", exercises: [
        { name: "Goblet Squat", sets: 5, reps: "3\u20136", rest: "180\u2013240", rir: "1\u20132" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "5\u20138", rest: "120\u2013180", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "GYM-6-05",
    env: "Gym" as const,
    days: 6,
    goal: "Get in shape",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Get in shape \u2014 PPL 6D",
    schedule: "Mon\u2013Sat",
    duration: "45\u201370 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Push A | D2: Pull A | D3: Legs A | D4: Push B | D5: Pull B | D6: Legs B",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Push A", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Pull A", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Push B", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Pull B", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 6, focus: "Legs B", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "GYM-6-06",
    env: "Gym" as const,
    days: 6,
    goal: "Get in shape",
    split: "BRO SPLIT",
    level: "Advanced",
    name: "Get in shape \u2014 Bro 6D",
    schedule: "Mon\u2013Sat",
    duration: "45\u201370 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms | D6: Weak point + conditioning",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Pushups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Arms", exercises: [
        { name: "Close-Grip Barbell Bench Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Incline Dumbbell Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown - Rope Attachment", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Cable Crunch", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 6, focus: "Weak point + conditioning", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "GYM-6-07",
    env: "Gym" as const,
    days: 6,
    goal: "Get lean",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Get lean \u2014 PPL 6D",
    schedule: "Mon\u2013Sat",
    duration: "45\u201370 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Push A | D2: Pull A | D3: Legs A | D4: Push B | D5: Pull B | D6: Legs B",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Push A", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Pull A", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Push B", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Pull B", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 6, focus: "Legs B", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "GYM-6-08",
    env: "Gym" as const,
    days: 6,
    goal: "Get lean",
    split: "BRO SPLIT",
    level: "Advanced",
    name: "Get lean \u2014 Bro 6D",
    schedule: "Mon\u2013Sat",
    duration: "45\u201370 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms | D6: Weak point + conditioning",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Pushups", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Arms", exercises: [
        { name: "Close-Grip Barbell Bench Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Incline Dumbbell Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Triceps Pushdown - Rope Attachment", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Cable Crunch", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 6, focus: "Weak point + conditioning", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "GYM-6-09",
    env: "Gym" as const,
    days: 6,
    goal: "Overall fitness",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Overall fitness \u2014 PPL 6D",
    schedule: "Mon\u2013Sat",
    duration: "45\u201370 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Push A | D2: Pull A | D3: Legs A | D4: Push B | D5: Pull B | D6: Legs B",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Push A", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Pull A", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Push B", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Pull B", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 6, focus: "Legs B", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "GYM-6-10",
    env: "Gym" as const,
    days: 6,
    goal: "Overall fitness",
    split: "BRO SPLIT",
    level: "Advanced",
    name: "Overall fitness \u2014 Bro 6D",
    schedule: "Mon\u2013Sat",
    duration: "45\u201370 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms | D6: Weak point + conditioning",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Pushups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Leg Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Lunges", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Face Pull", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Arms", exercises: [
        { name: "Close-Grip Barbell Bench Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Biceps Cable Curl", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Incline Dumbbell Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Triceps Pushdown - Rope Attachment", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Cable Crunch", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 6, focus: "Weak point + conditioning", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "BW-01",
    env: "Bodyweight" as const,
    days: 2,
    goal: "Get in shape",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Beginner",
    name: "Get in shape \u2014 PPL 2D",
    schedule: "Mon / Thu",
    duration: "30\u201350 min",
    volume: "5\u20139 challenging sets / muscle group",
    sequence: "D1: Push + legs | D2: Pull + glutes / hamstrings",
    note: "Use controlled reps and consistent attendance before adding complexity. PPL is adapted here: legs pair with push/pull so all major patterns are trained twice weekly. Zero-equipment pulling is limited; use a safely rated pull-up bar when available, never an improvised doorway setup.",
    workouts: [
      { dayNum: 1, focus: "Push + legs", exercises: [
        { name: "Pushups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Handstand Push-Ups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Push-Ups - Close Triceps Position", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Pushups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] },
      { dayNum: 2, focus: "Pull + glutes / hamstrings", exercises: [
        { name: "Pullups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Superman", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Superman", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Plank", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] }
    ]
  },
  {
    id: "BW-02",
    env: "Bodyweight" as const,
    days: 2,
    goal: "Get in shape",
    split: "BRO SPLIT",
    level: "Beginner",
    name: "Get in shape \u2014 Bro 2D",
    schedule: "Mon / Thu",
    duration: "30\u201350 min",
    volume: "5\u20139 challenging sets / muscle group",
    sequence: "D1: Upper \u2014 chest / back / arms | D2: Lower \u2014 legs / shoulders",
    note: "Use controlled reps and consistent attendance before adding complexity. Zero-equipment pulling is limited; use a safely rated pull-up bar when available, never an improvised doorway setup.",
    workouts: [
      { dayNum: 1, focus: "Upper \u2014 chest / back / arms", exercises: [
        { name: "Pullups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Superman", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Superman", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Plank", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] },
      { dayNum: 2, focus: "Lower \u2014 legs / shoulders", exercises: [
        { name: "Bodyweight Squat", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Rear Lunge", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dead Bug", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] }
    ]
  },
  {
    id: "BW-03",
    env: "Bodyweight" as const,
    days: 3,
    goal: "Get lean",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Get lean \u2014 PPL 3D",
    schedule: "Mon / Wed / Fri",
    duration: "30\u201350 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit. Zero-equipment pulling is limited; use a safely rated pull-up bar when available, never an improvised doorway setup.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Pushups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Handstand Push-Ups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Push-Ups - Close Triceps Position", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Pushups", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Pullups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Superman", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Superman", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Plank", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "BW-04",
    env: "Bodyweight" as const,
    days: 3,
    goal: "Get lean",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Get lean \u2014 Bro 3D",
    schedule: "Mon / Wed / Fri",
    duration: "30\u201350 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs + shoulders",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit. Zero-equipment pulling is limited; use a safely rated pull-up bar when available, never an improvised doorway setup.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Pushups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Push-Up Wide", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Pushups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Push-Ups - Close Triceps Position", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Plank", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "Pullups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Superman", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Superman", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Plank", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs + shoulders", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "BW-05",
    env: "Bodyweight" as const,
    days: 4,
    goal: "Overall fitness",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Overall fitness \u2014 PPL 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "30\u201350 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper balance",
    note: "Use controlled reps and consistent attendance before adding complexity. Zero-equipment pulling is limited; use a safely rated pull-up bar when available, never an improvised doorway setup.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Pushups", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Handstand Push-Ups", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Push-Ups - Close Triceps Position", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Pushups", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Pullups", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Superman", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Superman", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Plank", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Upper balance", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Pushups", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "BW-06",
    env: "Bodyweight" as const,
    days: 4,
    goal: "Overall fitness",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Overall fitness \u2014 Bro 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "30\u201350 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs | D4: Shoulders + arms",
    note: "Use controlled reps and consistent attendance before adding complexity. Zero-equipment pulling is limited; use a safely rated pull-up bar when available, never an improvised doorway setup.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Pushups", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Push-Up Wide", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Pushups", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Push-Ups - Close Triceps Position", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Plank", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "Pullups", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Superman", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Superman", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Plank", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Shoulders + arms", exercises: [
        { name: "Handstand Push-Ups", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Plank", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "BW-07",
    env: "Bodyweight" as const,
    days: 5,
    goal: "Build muscles",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Build muscles \u2014 PPL 5D",
    schedule: "Mon\u2013Fri",
    duration: "25\u201345 min",
    volume: "12\u201318 hard sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper | D5: Lower + arms",
    note: "Add load only after all work sets reach the top of the range with the stated RIR. Zero-equipment pulling is limited; use a safely rated pull-up bar when available, never an improvised doorway setup.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Pushups", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Handstand Push-Ups", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Push-Ups - Close Triceps Position", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Pushups", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Pullups", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Superman", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Dumbbell Bicep Curl", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Superman", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Plank", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Bodyweight Squat", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Dumbbell Rear Lunge", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Single Leg Glute Bridge", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dead Bug", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Upper", exercises: [
        { name: "Bodyweight Squat", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Pushups", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Dumbbell Rear Lunge", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Mountain Climbers", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Lower + arms", exercises: [
        { name: "Bodyweight Squat", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Dumbbell Rear Lunge", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Single Leg Glute Bridge", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dead Bug", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "BW-08",
    env: "Bodyweight" as const,
    days: 5,
    goal: "Build muscles",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 Bro 5D",
    schedule: "Mon\u2013Fri",
    duration: "25\u201345 min",
    volume: "8\u201314 hard sets / muscle group",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms + core",
    note: "Add load only after all work sets reach the top of the range with the stated RIR. Zero-equipment pulling is limited; use a safely rated pull-up bar when available, never an improvised doorway setup.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Pushups", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Push-Up Wide", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Pushups", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Push-Ups - Close Triceps Position", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Plank", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "Pullups", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Superman", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Superman", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Plank", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Handstand Push-Ups", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Plank", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 5, focus: "Arms + core", exercises: [
        { name: "Push-Ups - Close Triceps Position", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Pushups", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Body Tricep Press", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Plank", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Plank", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "BW-09",
    env: "Bodyweight" as const,
    days: 6,
    goal: "Lose weight",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Lose weight \u2014 PPL 6D",
    schedule: "Mon\u2013Sat",
    duration: "25\u201345 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Push A | D2: Pull A | D3: Legs A | D4: Push B | D5: Pull B | D6: Legs B",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit. Zero-equipment pulling is limited; use a safely rated pull-up bar when available, never an improvised doorway setup.",
    workouts: [
      { dayNum: 1, focus: "Push A", exercises: [
        { name: "Pushups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Handstand Push-Ups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Push-Ups - Close Triceps Position", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Pushups", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Pull A", exercises: [
        { name: "Pullups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Superman", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Superman", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Plank", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs A", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Push B", exercises: [
        { name: "Pushups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Handstand Push-Ups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Push-Ups - Close Triceps Position", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Pushups", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Pull B", exercises: [
        { name: "Pullups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Superman", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Superman", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Plank", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 6, focus: "Legs B", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "BW-10",
    env: "Bodyweight" as const,
    days: 6,
    goal: "Lose weight",
    split: "BRO SPLIT",
    level: "Advanced",
    name: "Lose weight \u2014 Bro 6D",
    schedule: "Mon\u2013Sat",
    duration: "25\u201345 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms | D6: Weak point + conditioning",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit. Zero-equipment pulling is limited; use a safely rated pull-up bar when available, never an improvised doorway setup.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Pushups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Push-Up Wide", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Pushups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Push-Ups - Close Triceps Position", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Plank", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "Pullups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Superman", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Superman", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Plank", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Handstand Push-Ups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Plank", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Arms", exercises: [
        { name: "Push-Ups - Close Triceps Position", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Bicep Curl", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Pushups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Body Tricep Press", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Plank", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Plank", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 6, focus: "Weak point + conditioning", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Pushups", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Mountain Climbers", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "DB-01",
    env: "Dumbbells at home" as const,
    days: 2,
    goal: "Get in shape",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Beginner",
    name: "Get in shape \u2014 PPL 2D",
    schedule: "Mon / Thu",
    duration: "30\u201350 min",
    volume: "5\u20139 challenging sets / muscle group",
    sequence: "D1: Push + legs | D2: Pull + glutes / hamstrings",
    note: "Use controlled reps and consistent attendance before adding complexity. PPL is adapted here: legs pair with push/pull so all major patterns are trained twice weekly.",
    workouts: [
      { dayNum: 1, focus: "Push + legs", exercises: [
        { name: "Dumbbell Floor Press", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Standing Dumbbell Press", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Close-Grip Dumbbell Press", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell One-Arm Triceps Extension", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dead Bug", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] },
      { dayNum: 2, focus: "Pull + glutes / hamstrings", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] }
    ]
  },
  {
    id: "DB-02",
    env: "Dumbbells at home" as const,
    days: 2,
    goal: "Get in shape",
    split: "BRO SPLIT",
    level: "Beginner",
    name: "Get in shape \u2014 Bro 2D",
    schedule: "Mon / Thu",
    duration: "30\u201350 min",
    volume: "5\u20139 challenging sets / muscle group",
    sequence: "D1: Upper \u2014 chest / back / arms | D2: Lower \u2014 legs / shoulders",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Upper \u2014 chest / back / arms", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Reverse Flyes", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] },
      { dayNum: 2, focus: "Lower \u2014 legs / shoulders", exercises: [
        { name: "Goblet Squat", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Rear Lunge", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Standing Dumbbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dead Bug", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "3" }
      ] }
    ]
  },
  {
    id: "DB-03",
    env: "Dumbbells at home" as const,
    days: 3,
    goal: "Get lean",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Get lean \u2014 PPL 3D",
    schedule: "Mon / Wed / Fri",
    duration: "30\u201350 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Dumbbell Floor Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Close-Grip Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell One-Arm Triceps Extension", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Dumbbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "DB-04",
    env: "Dumbbells at home" as const,
    days: 3,
    goal: "Get lean",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Get lean \u2014 Bro 3D",
    schedule: "Mon / Wed / Fri",
    duration: "30\u201350 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs + shoulders",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Dumbbell Floor Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Close-Grip Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Alternating Floor Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Decline Dumbbell Triceps Extension", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Plank", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs + shoulders", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Standing Dumbbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "2" }
      ] }
    ]
  },
  {
    id: "DB-05",
    env: "Dumbbells at home" as const,
    days: 4,
    goal: "Overall fitness",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Overall fitness \u2014 PPL 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "30\u201350 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper balance",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Dumbbell Floor Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Close-Grip Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell One-Arm Triceps Extension", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Dumbbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Upper balance", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Floor Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Dumbbell Press", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "DB-06",
    env: "Dumbbells at home" as const,
    days: 4,
    goal: "Overall fitness",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Overall fitness \u2014 Bro 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "30\u201350 min",
    volume: "7\u201312 challenging sets / muscle group",
    sequence: "D1: Chest + triceps | D2: Back + biceps | D3: Legs | D4: Shoulders + arms",
    note: "Use controlled reps and consistent attendance before adding complexity.",
    workouts: [
      { dayNum: 1, focus: "Chest + triceps", exercises: [
        { name: "Dumbbell Floor Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Close-Grip Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Alternating Floor Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Decline Dumbbell Triceps Extension", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Plank", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back + biceps", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Standing Dumbbell Calf Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Shoulders + arms", exercises: [
        { name: "Standing Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Front Dumbbell Raise", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201312", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "DB-07",
    env: "Dumbbells at home" as const,
    days: 5,
    goal: "Build muscles",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Build muscles \u2014 PPL 5D",
    schedule: "Mon\u2013Fri",
    duration: "25\u201345 min",
    volume: "12\u201318 hard sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper | D5: Lower + arms",
    note: "Add load only after all work sets reach the top of the range with the stated RIR.",
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Dumbbell Floor Press", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Standing Dumbbell Press", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Close-Grip Dumbbell Press", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dumbbell One-Arm Triceps Extension", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dead Bug", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Goblet Squat", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Dumbbell Rear Lunge", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Dumbbell Calf Raise", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dead Bug", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Upper", exercises: [
        { name: "Goblet Squat", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Dumbbell Floor Press", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "One-Arm Dumbbell Row", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Dumbbell Press", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Lower + arms", exercises: [
        { name: "Goblet Squat", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Dumbbell Rear Lunge", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "1\u20132" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Standing Dumbbell Calf Raise", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" },
        { name: "Dead Bug", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "DB-08",
    env: "Dumbbells at home" as const,
    days: 5,
    goal: "Build muscles",
    split: "BRO SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 Bro 5D",
    schedule: "Mon\u2013Fri",
    duration: "25\u201345 min",
    volume: "8\u201314 hard sets / muscle group",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms + core",
    note: "Add load only after all work sets reach the top of the range with the stated RIR.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Dumbbell Floor Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Close-Grip Dumbbell Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Alternating Floor Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Decline Dumbbell Triceps Extension", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Plank", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Standing Dumbbell Calf Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Standing Dumbbell Press", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Front Dumbbell Raise", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Rickshaw Carry", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] },
      { dayNum: 5, focus: "Arms + core", exercises: [
        { name: "Dumbbell Bicep Curl", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Hammer Curls", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell One-Arm Triceps Extension", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Decline Dumbbell Triceps Extension", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Close-Grip Dumbbell Press", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "2" }
      ] }
    ]
  },
  {
    id: "DB-09",
    env: "Dumbbells at home" as const,
    days: 6,
    goal: "Lose weight",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Lose weight \u2014 PPL 6D",
    schedule: "Mon\u2013Sat",
    duration: "25\u201345 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Push A | D2: Pull A | D3: Legs A | D4: Push B | D5: Pull B | D6: Legs B",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Push A", exercises: [
        { name: "Dumbbell Floor Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Close-Grip Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell One-Arm Triceps Extension", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Pull A", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs A", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Dumbbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Push B", exercises: [
        { name: "Dumbbell Floor Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Close-Grip Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell One-Arm Triceps Extension", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Pull B", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 6, focus: "Legs B", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Dumbbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] }
    ]
  },
  {
    id: "DB-10",
    env: "Dumbbells at home" as const,
    days: 6,
    goal: "Lose weight",
    split: "BRO SPLIT",
    level: "Advanced",
    name: "Lose weight \u2014 Bro 6D",
    schedule: "Mon\u2013Sat",
    duration: "25\u201345 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Chest | D2: Back | D3: Legs | D4: Shoulders | D5: Arms | D6: Weak point + conditioning",
    note: "Resistance training supports muscle retention; fat loss still requires a sustainable energy deficit.",
    workouts: [
      { dayNum: 1, focus: "Chest", exercises: [
        { name: "Dumbbell Floor Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Close-Grip Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Alternating Floor Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Decline Dumbbell Triceps Extension", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Plank", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 2, focus: "Back", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Dumbbell Calf Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 4, focus: "Shoulders", exercises: [
        { name: "Standing Dumbbell Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Side Lateral Raise", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Reverse Flyes", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Front Dumbbell Raise", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 5, focus: "Arms", exercises: [
        { name: "Dumbbell Bicep Curl", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Hammer Curls", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell One-Arm Triceps Extension", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Decline Dumbbell Triceps Extension", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Close-Grip Dumbbell Press", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dead Bug", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] },
      { dayNum: 6, focus: "Weak point + conditioning", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Dumbbell Floor Press", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Standing Dumbbell Press", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" },
        { name: "Rickshaw Carry", sets: 2, reps: "8\u201315", rest: "45\u201375", rir: "1\u20132" }
      ] }
    ]
  },

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // FEMALE-SPECIFIC PLANS \u2014 glute / hip dominant, posterior chain
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

  // \u2500\u2500 GYM \u00b7 2-DAY \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: "GF-2-01",
    env: "Gym" as const,
    days: 2,
    goal: "Get in shape",
    split: "LOWER / UPPER SPLIT",
    level: "Beginner",
    name: "Get in shape \u2014 Lower / Upper 2D",
    schedule: "Mon / Thu",
    duration: "45\u201360 min",
    volume: "5\u20139 challenging sets / muscle group",
    sequence: "D1: Lower \u2014 glutes / quads / hamstrings | D2: Upper \u2014 back / chest / shoulders",
    note: "Lower-body emphasis with compound lifts. Master hip hinge and squat patterns before adding load.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower \u2014 glutes / quads / hamstrings", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Leg Press", sets: 2, reps: "10\u201315", rest: "60\u201390", rir: "3" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60", rir: "3" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12\u201315", rest: "45\u201360", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper \u2014 back / chest / shoulders", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Seated Cable Rows", sets: 2, reps: "10\u201312", rest: "60", rir: "3" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "8\u201312", rest: "60", rir: "3" },
        { name: "Face Pull", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-2-02",
    env: "Gym" as const,
    days: 2,
    goal: "Build muscles",
    split: "LOWER / UPPER SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 Lower / Upper 2D",
    schedule: "Tue / Fri",
    duration: "55\u201375 min",
    volume: "8\u201312 challenging sets / muscle group",
    sequence: "D1: Glutes & posterior chain | D2: Upper + quads",
    note: "Glute-dominant lower day paired with a balanced upper day. Use progressive overload on hip hinges and squats.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Glutes & posterior chain", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "10\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Leg Extensions", sets: 2, reps: "12\u201315", rest: "60", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "10\u201315", rest: "45\u201360", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper + quads", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
    ],
  },

  // \u2500\u2500 GYM \u00b7 3-DAY \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: "GF-3-01",
    env: "Gym" as const,
    days: 3,
    goal: "Get in shape",
    split: "FULL BODY",
    level: "Beginner",
    name: "Get in shape \u2014 Full Body 3D",
    schedule: "Mon / Wed / Fri",
    duration: "45\u201360 min",
    volume: "6\u201310 challenging sets / muscle group",
    sequence: "D1: Full body A | D2: Full body B | D3: Full body C",
    note: "Three full-body sessions with hip-hinge and squat emphasis on each day. Ideal starting point for building a strength foundation.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Full body A \u2014 squat focus", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "3" },
        { name: "Dumbbell Bench Press", sets: 2, reps: "8\u201312", rest: "60", rir: "3" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "10\u201312", rest: "60", rir: "3" },
        { name: "Dumbbell Lunges", sets: 2, reps: "10\u201312", rest: "60", rir: "3" },
        { name: "Face Pull", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "8\u201312", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Full body B \u2014 hinge focus", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "90", rir: "3" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "8\u201312", rest: "60", rir: "3" },
        { name: "Dumbbell Incline Row", sets: 2, reps: "10\u201312", rest: "60", rir: "3" },
        { name: "Leg Press", sets: 2, reps: "10\u201315", rest: "60", rir: "3" },
        { name: "Side Lateral Raise", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Plank", sets: 2, reps: "30\u201345 s", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Full body C \u2014 glute focus", exercises: [
        { name: "Leg Press", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "3" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "10\u201312", rest: "60", rir: "3" },
        { name: "Incline Dumbbell Press", sets: 2, reps: "8\u201312", rest: "60", rir: "3" },
        { name: "Seated Cable Rows", sets: 2, reps: "10\u201312", rest: "60", rir: "3" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-3-02",
    env: "Gym" as const,
    days: 3,
    goal: "Build muscles",
    split: "LOWER / UPPER SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 LUL 3D",
    schedule: "Mon / Wed / Fri",
    duration: "55\u201375 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Lower A \u2014 glute emphasis | D2: Upper | D3: Lower B \u2014 quad emphasis",
    note: "Lower/Upper/Lower allows double lower frequency while recovering upper body. Progressive overload on squat and hinge patterns is the priority.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A \u2014 glute emphasis", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "10\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Lower B \u2014 quad emphasis", exercises: [
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "10\u201312", rest: "60\u201390", rir: "2" },
        { name: "Leg Extensions", sets: 3, reps: "12\u201315", rest: "60", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "10\u201315", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-3-03",
    env: "Gym" as const,
    days: 3,
    goal: "Get lean",
    split: "FULL BODY",
    level: "Intermediate",
    name: "Get lean \u2014 Full Body 3D",
    schedule: "Mon / Wed / Fri",
    duration: "50\u201365 min",
    volume: "8\u201312 challenging sets / muscle group",
    sequence: "D1: Full body A | D2: Full body B | D3: Full body C",
    note: "Higher rep ranges and shorter rest periods to maximize caloric expenditure while preserving lean mass during a deficit.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Full body A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "12\u201315", rest: "45\u201360", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "15\u201320", rest: "45", rir: "1" },
        { name: "Mountain Climbers", sets: 2, reps: "20\u201330", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Full body B", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Leg Extensions", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "15\u201320", rest: "45", rir: "1" },
        { name: "Plank", sets: 2, reps: "30\u201345 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Full body C", exercises: [
        { name: "Leg Press", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "10\u201315", rest: "30", rir: "1" },
      ] },
    ],
  },

  // \u2500\u2500 GYM \u00b7 4-DAY \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: "GF-4-01",
    env: "Gym" as const,
    days: 4,
    goal: "Build muscles",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "55\u201375 min",
    volume: "10\u201316 challenging sets / muscle group",
    sequence: "D1: Lower A \u2014 glute focus | D2: Upper A \u2014 push focus | D3: Lower B \u2014 quad focus | D4: Upper B \u2014 pull focus",
    note: "Classic upper/lower with extra glute volume on lower days. Each muscle trained 2\u00d7 per week for optimal hypertrophy.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A \u2014 glute focus", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "10\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "10\u201315", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper A \u2014 push focus", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Lower B \u2014 quad focus", exercises: [
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "10\u201312", rest: "60\u201390", rir: "2" },
        { name: "Leg Extensions", sets: 3, reps: "12\u201315", rest: "60", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 2, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper B \u2014 pull focus", exercises: [
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Face Pull", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-4-02",
    env: "Gym" as const,
    days: 4,
    goal: "Get lean",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Get lean \u2014 Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50\u201365 min",
    volume: "8\u201314 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B",
    note: "Moderate-to-high reps with controlled rest for caloric expenditure. Keep protein high and maintain training intensity during a cut.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Leg Press", sets: 2, reps: "12\u201315", rest: "60", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "15\u201320", rest: "45", rir: "1" },
        { name: "Dead Bug", sets: 2, reps: "10\u201315", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "15\u201320", rest: "45", rir: "1" },
        { name: "Triceps Pushdown", sets: 2, reps: "12\u201315", rest: "45", rir: "1" },
        { name: "Hammer Curls", sets: 2, reps: "12\u201315", rest: "45", rir: "1" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Leg Press", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "12\u201315", rest: "60", rir: "2" },
        { name: "Leg Extensions", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12\u201315", rest: "45", rir: "1" },
        { name: "Plank", sets: 2, reps: "30\u201345 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "15\u201320", rest: "45", rir: "1" },
        { name: "Dumbbell Incline Row", sets: 2, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "12\u201315", rest: "45", rir: "1" },
        { name: "Mountain Climbers", sets: 2, reps: "20\u201330", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-4-03",
    env: "Gym" as const,
    days: 4,
    goal: "Build strength",
    split: "UPPER / LOWER SPLIT",
    level: "Advanced",
    name: "Build strength \u2014 Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "60\u201380 min",
    volume: "8\u201312 challenging sets / muscle group",
    sequence: "D1: Lower \u2014 heavy | D2: Upper \u2014 heavy | D3: Lower \u2014 volume | D4: Upper \u2014 volume",
    note: "Heavy/volume undulation for strength and hypertrophy. Lower days prioritize squat and deadlift patterns.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower \u2014 heavy", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "4\u20136", rest: "120\u2013180", rir: "1" },
        { name: "Romanian Deadlift", sets: 3, reps: "5\u20138", rest: "120", rir: "1\u20132" },
        { name: "Leg Press", sets: 3, reps: "6\u20138", rest: "90\u2013120", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "8\u201310", rest: "60\u201390", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "8\u201312", rest: "60", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper \u2014 heavy", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "4\u20136", rest: "120\u2013180", rir: "1" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "6\u20138", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "6\u20138", rest: "90", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "6\u20138", rest: "90", rir: "2" },
        { name: "Close-Grip Barbell Bench Press", sets: 2, reps: "6\u20138", rest: "90", rir: "2" },
      ] },
      { dayNum: 3, focus: "Lower \u2014 volume", exercises: [
        { name: "Leg Press", sets: 3, reps: "10\u201315", rest: "60\u201390", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "10\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Leg Extensions", sets: 3, reps: "12\u201315", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper \u2014 volume", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "12\u201315", rest: "60", rir: "2" },
        { name: "Face Pull", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
    ],
  },

  // \u2500\u2500 GYM \u00b7 5-DAY \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: "GF-5-01",
    env: "Gym" as const,
    days: 5,
    goal: "Build muscles",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 ULULL 5D",
    schedule: "Mon / Tue / Wed / Fri / Sat",
    duration: "55\u201375 min",
    volume: "12\u201318 challenging sets / muscle group",
    sequence: "D1: Upper A | D2: Lower A \u2014 glute focus | D3: Upper B | D4: Lower B \u2014 quad focus | D5: Lower C \u2014 posterior chain",
    note: "3 lower + 2 upper gives extra lower-body frequency. Progressive overload on compound lifts is the primary driver.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Upper A \u2014 push focus", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Lower A \u2014 glute focus", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "10\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Upper B \u2014 pull focus", exercises: [
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Lower B \u2014 quad focus", exercises: [
        { name: "Leg Press", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Leg Extensions", sets: 3, reps: "12\u201315", rest: "60", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "10\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
      ] },
      { dayNum: 5, focus: "Lower C \u2014 posterior chain", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Barbell Squat", sets: 3, reps: "10\u201312", rest: "90", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Leg Extensions", sets: 2, reps: "12\u201315", rest: "60", rir: "2" },
        { name: "Plank", sets: 2, reps: "30\u201345 s", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-5-02",
    env: "Gym" as const,
    days: 5,
    goal: "Overall fitness",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Overall fitness \u2014 PPL+L 5D",
    schedule: "Mon / Tue / Wed / Fri / Sat",
    duration: "50\u201365 min",
    volume: "10\u201314 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs A \u2014 glute emphasis | D4: Upper balance | D5: Legs B \u2014 quad emphasis",
    note: "PPL base with an extra lower day and a balanced upper day. Covers all movement patterns with a lower-body bias.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 2, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 2, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Face Pull", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
        { name: "Incline Dumbbell Curl", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Legs A \u2014 glute emphasis", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "90\u2013120", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "10\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper balance", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Standing Dumbbell Press", sets: 2, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
      { dayNum: 5, focus: "Legs B \u2014 quad emphasis", exercises: [
        { name: "Leg Press", sets: 3, reps: "10\u201315", rest: "90", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Leg Extensions", sets: 3, reps: "12\u201315", rest: "60", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 2, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
      ] },
    ],
  },

  // \u2500\u2500 GYM \u00b7 6-DAY \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: "GF-6-01",
    env: "Gym" as const,
    days: 6,
    goal: "Build muscles",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Build muscles \u2014 PPL 6D",
    schedule: "Mon\u2013Sat",
    duration: "55\u201375 min",
    volume: "14\u201320 challenging sets / muscle group",
    sequence: "D1: Push A | D2: Pull A | D3: Legs A \u2014 glute focus | D4: Push B | D5: Pull B | D6: Legs B \u2014 quad focus",
    note: "Classic PPL 2\u00d7 per week with glute/quad emphasis on leg days. Requires good recovery \u2014 sleep 7+ hours, eat at surplus or maintenance.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push A", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "6\u201310", rest: "90\u2013120", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 3, reps: "10\u201312", rest: "45", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Pull A", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "6\u201310", rest: "90", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Face Pull", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 3, reps: "10\u201312", rest: "45", rir: "2" },
        { name: "Incline Dumbbell Curl", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Legs A \u2014 glute focus", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "6\u201310", rest: "120", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "10\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "10\u201315", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Push B", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Standing Dumbbell Press", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Front Dumbbell Raise", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Decline Dumbbell Triceps Extension", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
      { dayNum: 5, focus: "Pull B", exercises: [
        { name: "Pullups", sets: 3, reps: "6\u201310", rest: "90", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 3, reps: "10\u201312", rest: "45", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
      { dayNum: 6, focus: "Legs B \u2014 quad focus", exercises: [
        { name: "Leg Press", sets: 4, reps: "8\u201312", rest: "90\u2013120", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "10\u201312", rest: "60\u201390", rir: "2" },
        { name: "Leg Extensions", sets: 3, reps: "12\u201315", rest: "60", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-6-02",
    env: "Gym" as const,
    days: 6,
    goal: "Get lean",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Get lean \u2014 PPL 6D",
    schedule: "Mon\u2013Sat",
    duration: "50\u201365 min",
    volume: "12\u201318 challenging sets / muscle group",
    sequence: "D1: Push A | D2: Pull A | D3: Legs A | D4: Push B | D5: Pull B | D6: Legs B",
    note: "High frequency during a cut preserves muscle and training skill. Shorter rest periods and higher reps keep the metabolic demand up.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push A", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Flat Bench Cable Flyes", sets: 2, reps: "12\u201315", rest: "45\u201360", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "12\u201315", rest: "45", rir: "1" },
      ] },
      { dayNum: 2, focus: "Pull A", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8\u201312", rest: "60\u201390", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Face Pull", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "10\u201315", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Legs A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8\u201312", rest: "90", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "10\u201312", rest: "60\u201390", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "15\u201320", rest: "45", rir: "1" },
      ] },
      { dayNum: 4, focus: "Push B", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Standing Dumbbell Press", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Close-Grip Dumbbell Press", sets: 2, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Front Dumbbell Raise", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "12\u201315", rest: "45", rir: "1" },
      ] },
      { dayNum: 5, focus: "Pull B", exercises: [
        { name: "Pullups", sets: 3, reps: "6\u201310", rest: "60\u201390", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "12\u201315", rest: "45", rir: "1" },
        { name: "Plank", sets: 2, reps: "30\u201345 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 6, focus: "Legs B", exercises: [
        { name: "Leg Press", sets: 3, reps: "10\u201315", rest: "90", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Leg Extensions", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 2, reps: "12\u201315", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12\u201315", rest: "45", rir: "1" },
        { name: "Mountain Climbers", sets: 2, reps: "20\u201330", rest: "30", rir: "1" },
      ] },
    ],
  },

  // \u2500\u2500 DUMBBELLS AT HOME \u00b7 FEMALE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: "DF-2-01",
    env: "Dumbbells at home" as const,
    days: 2,
    goal: "Get in shape",
    split: "LOWER / UPPER SPLIT",
    level: "Beginner",
    name: "Get in shape \u2014 DB Lower / Upper 2D",
    schedule: "Mon / Thu",
    duration: "40\u201355 min",
    volume: "5\u20139 challenging sets / muscle group",
    sequence: "D1: Lower \u2014 glutes / quads / hamstrings | D2: Upper \u2014 back / chest / shoulders",
    note: "Dumbbell-only lower/upper split. Focus on mind-muscle connection and controlled eccentrics. Add load when top of rep range is comfortable.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower \u2014 glutes / quads / hamstrings", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "10\u201315", rest: "60", rir: "3" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "10\u201312", rest: "60", rir: "3" },
        { name: "Dumbbell Lunges", sets: 2, reps: "10\u201312", rest: "60", rir: "3" },
        { name: "Dumbbell Rear Lunge", sets: 2, reps: "10\u201312", rest: "60", rir: "3" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Standing Dumbbell Calf Raise", sets: 2, reps: "15\u201320", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper \u2014 back / chest / shoulders", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201312", rest: "60", rir: "3" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8\u201312", rest: "60", rir: "3" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "8\u201312", rest: "60", rir: "3" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "10\u201312", rest: "60", rir: "3" },
        { name: "Side Lateral Raise", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
    ],
  },
  {
    id: "DF-3-01",
    env: "Dumbbells at home" as const,
    days: 3,
    goal: "Build muscles",
    split: "LOWER / UPPER SPLIT",
    level: "Intermediate",
    name: "Build muscles \u2014 DB LUL 3D",
    schedule: "Mon / Wed / Fri",
    duration: "45\u201360 min",
    volume: "8\u201312 challenging sets / muscle group",
    sequence: "D1: Lower A \u2014 glute emphasis | D2: Upper | D3: Lower B \u2014 quad emphasis",
    note: "Lower/Upper/Lower with dumbbells. Extra lower frequency for glute and quad development at home.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A \u2014 glute emphasis", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "10\u201315", rest: "60", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Standing Dumbbell Calf Raise", sets: 2, reps: "15\u201320", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8\u201312", rest: "60", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8\u201312", rest: "60", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8\u201312", rest: "60", rir: "2" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 2, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
        { name: "Dumbbell One-Arm Triceps Extension", sets: 2, reps: "10\u201312", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Lower B \u2014 quad emphasis", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8\u201312", rest: "60", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "10\u201312", rest: "60", rir: "2" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 2, reps: "15\u201320", rest: "45", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "10\u201315", rest: "30", rir: "2" },
      ] },
    ],
  },
  {
    id: "DF-4-01",
    env: "Dumbbells at home" as const,
    days: 4,
    goal: "Get lean",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Get lean \u2014 DB Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "40\u201355 min",
    volume: "8\u201314 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B",
    note: "Higher reps and shorter rest to maximise caloric expenditure with limited equipment. Keep tempo controlled and rest honest.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "12\u201315", rest: "45\u201360", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "12\u201315", rest: "45\u201360", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "12\u201315", rest: "45\u201360", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "15\u201320", rest: "30\u201345", rir: "1" },
        { name: "Standing Dumbbell Calf Raise", sets: 2, reps: "15\u201320", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Dumbbell Floor Press", sets: 3, reps: "10\u201315", rest: "45\u201360", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "10\u201315", rest: "45\u201360", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "10\u201315", rest: "45\u201360", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "15\u201320", rest: "30", rir: "1" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "12\u201315", rest: "30", rir: "1" },
        { name: "Plank", sets: 2, reps: "30\u201345 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "12\u201315", rest: "45\u201360", rir: "2" },
        { name: "Goblet Squat", sets: 3, reps: "12\u201315", rest: "45\u201360", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "12\u201315", rest: "45\u201360", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "20\u201330", rest: "30", rir: "1" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "10\u201315", rest: "45\u201360", rir: "2" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 3, reps: "10\u201315", rest: "45\u201360", rir: "2" },
        { name: "Standing Dumbbell Press", sets: 2, reps: "10\u201315", rest: "45\u201360", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "12\u201315", rest: "30", rir: "1" },
        { name: "Dumbbell One-Arm Triceps Extension", sets: 2, reps: "12\u201315", rest: "30", rir: "1" },
        { name: "Dead Bug", sets: 2, reps: "10\u201315", rest: "30", rir: "1" },
      ] },
    ],
  },

  // \u2500\u2500 BODYWEIGHT \u00b7 FEMALE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: "BF-2-01",
    env: "Bodyweight" as const,
    days: 2,
    goal: "Get in shape",
    split: "LOWER / UPPER SPLIT",
    level: "Beginner",
    name: "Get in shape \u2014 BW Lower / Upper 2D",
    schedule: "Tue / Fri",
    duration: "30\u201345 min",
    volume: "4\u20138 challenging sets / muscle group",
    sequence: "D1: Lower \u2014 glutes / quads | D2: Upper \u2014 push / pull",
    note: "Zero-equipment entry point. Focus on mastering bodyweight squat depth and push-up form before progressing.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower \u2014 glutes / quads", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "12\u201320", rest: "45\u201360", rir: "3" },
        { name: "Dumbbell Lunges", sets: 3, reps: "10\u201315", rest: "45\u201360", rir: "3" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Superman", sets: 2, reps: "10\u201315", rest: "30", rir: "2" },
        { name: "Plank", sets: 2, reps: "20\u201330 s", rest: "30", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper \u2014 push / pull", exercises: [
        { name: "Push-Up Wide", sets: 3, reps: "8\u201315", rest: "45\u201360", rir: "3" },
        { name: "Body Tricep Press", sets: 2, reps: "8\u201312", rest: "45", rir: "3" },
        { name: "Superman", sets: 3, reps: "10\u201315", rest: "30", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "15\u201320", rest: "30", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "10\u201312", rest: "30", rir: "2" },
      ] },
    ],
  },
  {
    id: "BF-3-01",
    env: "Bodyweight" as const,
    days: 3,
    goal: "Overall fitness",
    split: "FULL BODY",
    level: "Beginner",
    name: "Overall fitness \u2014 BW Full Body 3D",
    schedule: "Mon / Wed / Fri",
    duration: "30\u201345 min",
    volume: "6\u201310 challenging sets / muscle group",
    sequence: "D1: Full body A | D2: Full body B | D3: Full body C",
    note: "Three balanced bodyweight sessions. Lower body gets extra volume on every day. Progress by adding reps, slowing tempo, or reducing rest.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Full body A \u2014 squat focus", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "15\u201320", rest: "45", rir: "2" },
        { name: "Push-Up Wide", sets: 3, reps: "8\u201315", rest: "45", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12\u201315", rest: "30", rir: "2" },
        { name: "Superman", sets: 2, reps: "10\u201315", rest: "30", rir: "2" },
        { name: "Plank", sets: 2, reps: "20\u201330 s", rest: "30", rir: "2" },
      ] },
      { dayNum: 2, focus: "Full body B \u2014 hinge focus", exercises: [
        { name: "Single Leg Glute Bridge", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Push-Ups - Close Triceps Position", sets: 3, reps: "6\u201312", rest: "45", rir: "2" },
        { name: "Bodyweight Squat", sets: 2, reps: "15\u201320", rest: "45", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "10\u201315", rest: "45", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "10\u201312", rest: "30", rir: "2" },
      ] },
      { dayNum: 3, focus: "Full body C \u2014 endurance", exercises: [
        { name: "Dumbbell Lunges", sets: 3, reps: "12\u201315", rest: "45", rir: "2" },
        { name: "Push-Up Wide", sets: 2, reps: "10\u201315", rest: "45", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "20\u201330", rest: "30", rir: "1" },
        { name: "Superman", sets: 2, reps: "12\u201315", rest: "30", rir: "2" },
        { name: "Plank", sets: 2, reps: "30\u201345 s", rest: "30", rir: "1" },
        { name: "Bodyweight Squat", sets: 2, reps: "20\u201325", rest: "45", rir: "1" },
      ] },
    ],
  },
  {
    id: "DF-5-01",
    env: "Dumbbells at home" as const,
    days: 5,
    goal: "Build muscles",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Build muscles — DB ULULL 5D",
    schedule: "Mon / Tue / Wed / Fri / Sat",
    duration: "45–60 min",
    volume: "10–16 challenging sets / muscle group",
    sequence: "D1: Upper A | D2: Lower A — glute focus | D3: Upper B | D4: Lower B — quad focus | D5: Lower C — posterior chain",
    note: "3 lower + 2 upper with dumbbells for maximum lower-body frequency at home. Progressive overload via heavier dumbbells or slower tempo.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Upper A", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8–12", rest: "60", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8–12", rest: "60", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8–12", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "10–12", rest: "45", rir: "2" },
        { name: "Dumbbell One-Arm Triceps Extension", sets: 2, reps: "10–12", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Lower A — glute focus", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "10–15", rest: "60", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Standing Dumbbell Calf Raise", sets: 2, reps: "15–20", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Upper B", exercises: [
        { name: "Dumbbell Floor Press", sets: 3, reps: "8–12", rest: "60", rir: "2" },
        { name: "Bent-Arm Dumbbell Pullover", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Standing Dumbbell Press", sets: 2, reps: "8–12", rest: "60", rir: "2" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "10–12", rest: "45", rir: "2" },
        { name: "Decline Dumbbell Triceps Extension", sets: 2, reps: "10–12", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Lower B — quad focus", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "8–12", rest: "60", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "10–12", rest: "60", rir: "2" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 2, reps: "15–20", rest: "45", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "10–15", rest: "30", rir: "2" },
      ] },
      { dayNum: 5, focus: "Lower C — posterior chain", exercises: [
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "8–12", rest: "60", rir: "2" },
        { name: "Goblet Squat", sets: 3, reps: "12–15", rest: "60", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "10–12", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Plank", sets: 2, reps: "30–45 s", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-4-04",
    env: "Gym" as const,
    days: 4,
    goal: "Lose weight",
    split: "UPPER / LOWER SPLIT",
    level: "Beginner",
    name: "Lose weight — Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "45–60 min",
    volume: "6–10 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B",
    note: "Moderate intensity with controlled rest. Resistance training preserves muscle during a caloric deficit. Prioritise compound movements.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "10–15", rest: "60", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "10–15", rest: "60", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "12–15", rest: "45–60", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "15–20", rest: "45", rir: "1" },
        { name: "Mountain Climbers", sets: 2, reps: "20–30", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "10–15", rest: "60", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10–15", rest: "60", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "10–15", rest: "60", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "15–20", rest: "45", rir: "1" },
        { name: "Triceps Pushdown", sets: 2, reps: "12–15", rest: "45", rir: "1" },
        { name: "Plank", sets: 2, reps: "30–45 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Leg Press", sets: 3, reps: "12–15", rest: "60", rir: "2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "12–15", rest: "60", rir: "2" },
        { name: "Leg Extensions", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12–15", rest: "45", rir: "1" },
        { name: "Dead Bug", sets: 2, reps: "10–15", rest: "30", rir: "1" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–15", rest: "60", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–15", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "15–20", rest: "45", rir: "1" },
        { name: "Hammer Curls", sets: 2, reps: "12–15", rest: "45", rir: "1" },
        { name: "Cable Crunch", sets: 2, reps: "12–15", rest: "45", rir: "1" },
      ] },
    ],
  },
  {
    id: "BF-4-01",
    env: "Bodyweight" as const,
    days: 4,
    goal: "Lose weight",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Lose weight \u2014 BW Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "35\u201350 min",
    volume: "8\u201312 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B",
    note: "Higher reps, shorter rest, bodyweight circuits. Training supports the caloric deficit \u2014 fat loss still requires controlled nutrition.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "15\u201325", rest: "30\u201345", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "12\u201315", rest: "30\u201345", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "15\u201320", rest: "30", rir: "1" },
        { name: "Mountain Climbers", sets: 2, reps: "20\u201330", rest: "30", rir: "1" },
        { name: "Plank", sets: 2, reps: "30\u201345 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Push-Up Wide", sets: 3, reps: "10\u201320", rest: "30\u201345", rir: "2" },
        { name: "Body Tricep Press", sets: 2, reps: "8\u201312", rest: "30\u201345", rir: "2" },
        { name: "Superman", sets: 3, reps: "12\u201315", rest: "30", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "10\u201315", rest: "30", rir: "1" },
        { name: "Mountain Climbers", sets: 2, reps: "20\u201330", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Dumbbell Lunges", sets: 3, reps: "15\u201320", rest: "30\u201345", rir: "2" },
        { name: "Bodyweight Squat", sets: 3, reps: "20\u201325", rest: "30\u201345", rir: "1" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "15\u201320", rest: "30", rir: "1" },
        { name: "Superman", sets: 2, reps: "12\u201315", rest: "30", rir: "2" },
        { name: "Plank", sets: 2, reps: "30\u201345 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Push-Ups - Close Triceps Position", sets: 3, reps: "8\u201315", rest: "30\u201345", rir: "2" },
        { name: "Pushups", sets: 2, reps: "10\u201320", rest: "30\u201345", rir: "2" },
        { name: "Superman", sets: 2, reps: "12\u201315", rest: "30", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "12\u201315", rest: "30", rir: "1" },
        { name: "Mountain Climbers", sets: 2, reps: "20\u201330", rest: "30", rir: "1" },
      ] },
    ],
  },
  // ── GYM · 2-DAY (cont.) ─────────────────────────────────────────
  {
    id: "GF-2-03",
    env: "Gym" as const,
    days: 2,
    goal: "Get lean",
    split: "LOWER / UPPER SPLIT",
    level: "Intermediate",
    name: "Get lean — Lower / Upper 2D",
    schedule: "Tue / Fri",
    duration: "45–60 min",
    volume: "6–10 challenging sets / muscle group",
    sequence: "D1: Lower — glutes / hamstrings | D2: Upper — push / pull",
    note: "Shorter rest periods and higher reps to support a lean physique while preserving muscle.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower — glutes / hamstrings", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "10–15", rest: "45–60", rir: "2" },
        { name: "Barbell Squat", sets: 3, reps: "10–15", rest: "45–60", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "15–20", rest: "30–45", rir: "1" },
        { name: "Cable Crunch", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Upper — push / pull", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "10–15", rest: "45–60", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–15", rest: "45–60", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "15–20", rest: "30", rir: "1" },
        { name: "Triceps Pushdown", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-2-04",
    env: "Gym" as const,
    days: 2,
    goal: "Build strength",
    split: "LOWER / UPPER SPLIT",
    level: "Advanced",
    name: "Build strength — Lower / Upper 2D",
    schedule: "Mon / Thu",
    duration: "60–75 min",
    volume: "8–12 challenging sets / muscle group",
    sequence: "D1: Lower — heavy hip hinge & squat | D2: Upper — heavy press & pull",
    note: "Low-rep, high-load work on primary compounds. Add weight session to session once form is solid.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower — heavy hip hinge & squat", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "4–6", rest: "120–150", rir: "1–2" },
        { name: "Romanian Deadlift", sets: 4, reps: "5–8", rest: "120", rir: "1–2" },
        { name: "Leg Press", sets: 3, reps: "6–10", rest: "90", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "8–10", rest: "75", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "8–10", rest: "60", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper — heavy press & pull", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "4–6", rest: "120", rir: "1–2" },
        { name: "Pullups", sets: 4, reps: "5–8", rest: "120", rir: "1–2" },
        { name: "Seated Cable Rows", sets: 3, reps: "6–10", rest: "90", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "6–10", rest: "90", rir: "2" },
        { name: "Close-Grip Barbell Bench Press", sets: 3, reps: "6–10", rest: "75", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-2-05",
    env: "Gym" as const,
    days: 2,
    goal: "Overall fitness",
    split: "FULL BODY",
    level: "Beginner",
    name: "Overall fitness — Full Body 2D",
    schedule: "Wed / Sat",
    duration: "40–50 min",
    volume: "5–8 challenging sets / muscle group",
    sequence: "D1: Full body A | D2: Full body B",
    note: "Two balanced full-body sessions covering every major muscle group. Great starting frequency.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Full body A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Dumbbell Bench Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Seated Cable Rows", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Plank", sets: 2, reps: "30–45 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Full body B", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Dumbbell Lunges", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-2-06",
    env: "Gym" as const,
    days: 2,
    goal: "Lose weight",
    split: "UPPER / LOWER SPLIT",
    level: "Beginner",
    name: "Lose weight — Upper / Lower 2D",
    schedule: "Tue / Fri",
    duration: "40–55 min",
    volume: "6–9 challenging sets / muscle group",
    sequence: "D1: Upper | D2: Lower — glutes & legs",
    note: "Moderate loads with shorter rest to keep heart rate elevated. Pair with a modest caloric deficit.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Upper", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "15–20", rest: "30", rir: "1" },
        { name: "Mountain Climbers", sets: 2, reps: "20–30", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Lower — glutes & legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "15–20", rest: "30–45", rir: "1–2" },
        { name: "Leg Press", sets: 2, reps: "15–20", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-2-07",
    env: "Gym" as const,
    days: 2,
    goal: "Build muscles",
    split: "LOWER / UPPER SPLIT",
    level: "Advanced",
    name: "Build muscles — Lower / Upper 2D",
    schedule: "Mon / Thu",
    duration: "60–75 min",
    volume: "10–14 challenging sets / muscle group",
    sequence: "D1: Lower — glutes / quads / hamstrings | D2: Upper — full push & pull",
    note: "High volume per session since frequency is low. Push close to failure on the last set of each exercise.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower — glutes / quads / hamstrings", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Romanian Deadlift", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Leg Press", sets: 3, reps: "10–12", rest: "75", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "12–15", rest: "60", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper — full push & pull", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10–12", rest: "75", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–12", rest: "75", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "15–20", rest: "45", rir: "1" },
        { name: "Hammer Curls", sets: 2, reps: "12–15", rest: "45", rir: "1" },
        { name: "Triceps Pushdown", sets: 2, reps: "12–15", rest: "45", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-2-08",
    env: "Gym" as const,
    days: 2,
    goal: "Get in shape",
    split: "FULL BODY",
    level: "Intermediate",
    name: "Get in shape — Full Body 2D",
    schedule: "Tue / Sat",
    duration: "50–60 min",
    volume: "6–10 challenging sets / muscle group",
    sequence: "D1: Full body A | D2: Full body B",
    note: "Balanced full-body sessions with a lower-body lean, once basic patterns are comfortable.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Full body A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "8–12", rest: "60", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Full body B", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8–12", rest: "60", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Plank", sets: 2, reps: "30–45 s", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-2-09",
    env: "Gym" as const,
    days: 2,
    goal: "Get lean",
    split: "UPPER / LOWER SPLIT",
    level: "Advanced",
    name: "Get lean — Upper / Lower 2D",
    schedule: "Wed / Sat",
    duration: "55–70 min",
    volume: "8–12 challenging sets / muscle group",
    sequence: "D1: Upper | D2: Lower — glutes / hamstrings / quads",
    note: "Moderate-to-high volume, short rest, controlled tempo to maximize density in limited sessions.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Upper", exercises: [
        { name: "Incline Dumbbell Press", sets: 4, reps: "10–12", rest: "60", rir: "1–2" },
        { name: "One-Arm Dumbbell Row", sets: 4, reps: "10–12", rest: "60", rir: "1–2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Face Pull", sets: 3, reps: "15–20", rest: "30", rir: "1" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "12–15", rest: "30", rir: "1" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "12–15", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Lower — glutes / hamstrings / quads", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "10–12", rest: "60", rir: "1–2" },
        { name: "Romanian Deadlift", sets: 4, reps: "10–12", rest: "60", rir: "1–2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Leg Extensions", sets: 3, reps: "15–20", rest: "45", rir: "1" },
        { name: "Seated Leg Curl", sets: 3, reps: "15–20", rest: "45", rir: "1" },
        { name: "Cable Crunch", sets: 2, reps: "20", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-2-10",
    env: "Gym" as const,
    days: 2,
    goal: "Overall fitness",
    split: "LOWER / UPPER SPLIT",
    level: "Intermediate",
    name: "Overall fitness — Lower / Upper 2D",
    schedule: "Mon / Thu",
    duration: "50–60 min",
    volume: "7–10 challenging sets / muscle group",
    sequence: "D1: Lower | D2: Upper",
    note: "Well-rounded twice-weekly split balancing strength, posture and conditioning.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Leg Press", sets: 2, reps: "12–15", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "15", rest: "45", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "10–12", rest: "60", rir: "2" },
        { name: "Reverse Flyes", sets: 2, reps: "15", rest: "30", rir: "1" },
        { name: "Hammer Curls", sets: 2, reps: "12–15", rest: "30", rir: "1" },
      ] },
    ],
  },

  // ── GYM · 3-DAY (cont.) ─────────────────────────────────────────
  {
    id: "GF-3-04",
    env: "Gym" as const,
    days: 3,
    goal: "Build strength",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Build strength — Push/Pull/Leg 3D",
    schedule: "Mon / Wed / Fri",
    duration: "60–75 min",
    volume: "8–12 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs — glutes / hamstrings / quads",
    note: "Heavy compounds first each session, low reps, full rest for strength gains.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "4–6", rest: "120", rir: "1–2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "6–8", rest: "90", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8–10", rest: "75", rir: "2" },
        { name: "Triceps Pushdown", sets: 3, reps: "10–12", rest: "60", rir: "2" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Pullups", sets: 4, reps: "5–8", rest: "120", rir: "1–2" },
        { name: "Seated Cable Rows", sets: 3, reps: "6–10", rest: "90", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8–10", rest: "75", rir: "2" },
        { name: "Hammer Curls", sets: 3, reps: "10–12", rest: "60", rir: "2" },
      ] },
      { dayNum: 3, focus: "Legs — glutes / hamstrings / quads", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "4–6", rest: "120–150", rir: "1–2" },
        { name: "Romanian Deadlift", sets: 4, reps: "5–8", rest: "120", rir: "1–2" },
        { name: "Leg Press", sets: 3, reps: "8–10", rest: "90", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "8–10", rest: "75", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "8–10", rest: "60", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-3-05",
    env: "Gym" as const,
    days: 3,
    goal: "Get lean",
    split: "FULL BODY",
    level: "Intermediate",
    name: "Get lean — Full Body 3D",
    schedule: "Mon / Wed / Fri",
    duration: "50–65 min",
    volume: "6–10 challenging sets / muscle group",
    sequence: "D1: Full body A | D2: Full body B | D3: Full body C",
    note: "Three moderate-rep full-body sessions with shorter rest to keep intensity high while staying lean.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Full body A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "10–15", rest: "60", rir: "2" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "10–15", rest: "60", rir: "2" },
        { name: "Seated Cable Rows", sets: 2, reps: "10–15", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Full body B", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "10–15", rest: "60", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10–15", rest: "60", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "10–15", rest: "45", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "20–30", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Full body C", exercises: [
        { name: "Dumbbell Lunges", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–15", rest: "60", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "15–20", rest: "30", rir: "1" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-3-06",
    env: "Gym" as const,
    days: 3,
    goal: "Lose weight",
    split: "FULL BODY",
    level: "Beginner",
    name: "Lose weight — Full Body 3D",
    schedule: "Mon / Wed / Fri",
    duration: "40–55 min",
    volume: "5–8 challenging sets / muscle group",
    sequence: "D1: Full body A | D2: Full body B | D3: Full body C",
    note: "Approachable full-body circuits with rest kept short to add a conditioning stimulus.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Full body A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Seated Cable Rows", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "20–30", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Full body B", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Dumbbell Bench Press", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Full body C", exercises: [
        { name: "Dumbbell Lunges", sets: 3, reps: "15–20", rest: "30–45", rir: "1–2" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Plank", sets: 2, reps: "30–45 s", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-3-07",
    env: "Gym" as const,
    days: 3,
    goal: "Build muscles",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Build muscles — Push/Pull/Leg 3D",
    schedule: "Tue / Thu / Sat",
    duration: "60–75 min",
    volume: "10–14 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs — glute & hamstring emphasis",
    note: "High per-session volume since frequency is limited to three days. Train close to failure.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Dumbbell Shoulder Press", sets: 4, reps: "8–10", rest: "75", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "12–15", rest: "45", rir: "1" },
        { name: "Triceps Pushdown", sets: 3, reps: "10–12", rest: "45", rir: "1" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Seated Cable Rows", sets: 4, reps: "8–10", rest: "75", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Face Pull", sets: 3, reps: "12–15", rest: "45", rir: "1" },
        { name: "Hammer Curls", sets: 3, reps: "10–12", rest: "45", rir: "1" },
      ] },
      { dayNum: 3, focus: "Legs — glute & hamstring emphasis", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Romanian Deadlift", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "12–15", rest: "60", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "12–15", rest: "45", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-3-08",
    env: "Gym" as const,
    days: 3,
    goal: "Overall fitness",
    split: "FULL BODY",
    level: "Beginner",
    name: "Overall fitness — Full Body 3D",
    schedule: "Mon / Wed / Fri",
    duration: "45–55 min",
    volume: "6–9 challenging sets / muscle group",
    sequence: "D1: Full body A | D2: Full body B | D3: Full body C",
    note: "Well-rounded introduction to resistance training across all major movement patterns.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Full body A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Dumbbell Bench Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Seated Cable Rows", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Plank", sets: 2, reps: "30 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Full body B", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Cable Crunch", sets: 2, reps: "12–15", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Full body C", exercises: [
        { name: "Dumbbell Lunges", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Face Pull", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-3-09",
    env: "Gym" as const,
    days: 3,
    goal: "Get in shape",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Get in shape — Push/Pull/Leg 3D",
    schedule: "Tue / Thu / Sat",
    duration: "50–65 min",
    volume: "7–10 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs",
    note: "Classic push/pull/leg introduction with moderate volume and rest.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Leg Press", sets: 2, reps: "12–15", rest: "60", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-3-10",
    env: "Gym" as const,
    days: 3,
    goal: "Get lean",
    split: "FULL BODY",
    level: "Advanced",
    name: "Get lean — Full Body 3D",
    schedule: "Mon / Wed / Fri",
    duration: "55–70 min",
    volume: "9–12 challenging sets / muscle group",
    sequence: "D1: Full body A | D2: Full body B | D3: Full body C",
    note: "Dense, higher-volume full-body sessions with shorter rest to maximize the metabolic effect.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Full body A", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "8–12", rest: "60", rir: "1–2" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "10–12", rest: "45", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–12", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Full body B", exercises: [
        { name: "Romanian Deadlift", sets: 4, reps: "8–12", rest: "60", rir: "1–2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10–12", rest: "45", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10–12", rest: "45", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "20–30", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Full body C", exercises: [
        { name: "Dumbbell Lunges", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Leg Extensions", sets: 3, reps: "15–20", rest: "45", rir: "1" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–12", rest: "45", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
    ],
  },

  // ── GYM · 4-DAY (cont.) ─────────────────────────────────────────
  {
    id: "GF-4-05",
    env: "Gym" as const,
    days: 4,
    goal: "Get in shape",
    split: "UPPER / LOWER SPLIT",
    level: "Beginner",
    name: "Get in shape — Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "45–55 min",
    volume: "6–9 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B",
    note: "A gentle introduction to a four-day split, building consistency before adding intensity.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Seated Leg Curl", sets: 2, reps: "12–15", rest: "60", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Hammer Curls", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Leg Press", sets: 2, reps: "12–15", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Triceps Pushdown", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-4-06",
    env: "Gym" as const,
    days: 4,
    goal: "Overall fitness",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Overall fitness — Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50–65 min",
    volume: "7–10 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B",
    note: "Balanced strength, posture and conditioning across two lower and two upper sessions per week.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Leg Press", sets: 3, reps: "10–15", rest: "60", rir: "2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "12–15", rest: "60", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-4-07",
    env: "Gym" as const,
    days: 4,
    goal: "Build strength",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Build strength — Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "60–75 min",
    volume: "8–12 challenging sets / muscle group",
    sequence: "D1: Lower A — heavy | D2: Upper A — heavy | D3: Lower B — volume | D4: Upper B — volume",
    note: "Heavier low-rep work early in the week, complementary volume work later.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A — heavy", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "5–6", rest: "120", rir: "1–2" },
        { name: "Romanian Deadlift", sets: 3, reps: "5–6", rest: "120", rir: "1–2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "8–10", rest: "60", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper A — heavy", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "5–6", rest: "120", rir: "1–2" },
        { name: "Pullups", sets: 3, reps: "6–8", rest: "120", rir: "1–2" },
        { name: "Close-Grip Barbell Bench Press", sets: 3, reps: "8–10", rest: "75", rir: "2" },
      ] },
      { dayNum: 3, focus: "Lower B — volume", exercises: [
        { name: "Leg Press", sets: 3, reps: "10–12", rest: "75", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 2, reps: "10–12", rest: "60", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper B — volume", exercises: [
        { name: "Seated Cable Rows", sets: 3, reps: "10–12", rest: "75", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10–12", rest: "75", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "10–12", rest: "45", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-4-08",
    env: "Gym" as const,
    days: 4,
    goal: "Lose weight",
    split: "UPPER / LOWER SPLIT",
    level: "Advanced",
    name: "Lose weight — Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50–65 min",
    volume: "9–13 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B",
    note: "Higher volume, moderate rest, dense sessions to support a caloric deficit while retaining muscle.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "10–12", rest: "45", rir: "1–2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "15–20", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Dumbbell Bench Press", sets: 4, reps: "10–12", rest: "45", rir: "1–2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–12", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Romanian Deadlift", sets: 4, reps: "10–12", rest: "45", rir: "1–2" },
        { name: "Leg Press", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "20", rest: "30", rir: "1" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "10–12", rest: "45", rir: "1–2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10–12", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-4-09",
    env: "Gym" as const,
    days: 4,
    goal: "Build muscles",
    split: "UPPER / LOWER SPLIT",
    level: "Beginner",
    name: "Build muscles — Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "50–60 min",
    volume: "6–9 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B",
    note: "Introductory four-day hypertrophy split. Focus on adding a small amount of weight each week.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8–12", rest: "75", rir: "2–3" },
        { name: "Seated Leg Curl", sets: 2, reps: "10–12", rest: "60", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8–12", rest: "75", rir: "2–3" },
        { name: "Seated Cable Rows", sets: 3, reps: "8–12", rest: "75", rir: "2–3" },
        { name: "Hammer Curls", sets: 2, reps: "10–12", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "8–12", rest: "75", rir: "2–3" },
        { name: "Leg Press", sets: 2, reps: "10–12", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8–12", rest: "75", rir: "2–3" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8–12", rest: "75", rir: "2–3" },
        { name: "Triceps Pushdown", sets: 2, reps: "10–12", rest: "45", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-4-10",
    env: "Gym" as const,
    days: 4,
    goal: "Overall fitness",
    split: "UPPER / LOWER SPLIT",
    level: "Advanced",
    name: "Overall fitness — Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "55–70 min",
    volume: "9–12 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B",
    note: "Comprehensive strength, mobility and conditioning coverage for an experienced trainee.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "6–10", rest: "90", rir: "1–2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8–10", rest: "90", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "10–12", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "6–10", rest: "90", rir: "1–2" },
        { name: "Pullups", sets: 3, reps: "6–10", rest: "90", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "15", rest: "45", rir: "1" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Leg Press", sets: 3, reps: "10–12", rest: "75", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "12–15", rest: "60", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Seated Cable Rows", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "12–15", rest: "45", rir: "1" },
      ] },
    ],
  },

  // ── GYM · 5-DAY (cont.) ─────────────────────────────────────────
  {
    id: "GF-5-03",
    env: "Gym" as const,
    days: 5,
    goal: "Get lean",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Get lean — Push/Pull/Leg 5D",
    schedule: "Mon–Fri",
    duration: "45–60 min",
    volume: "6–10 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs — glutes | D4: Upper | D5: Legs — hamstrings",
    note: "Higher-frequency lean-out plan. Shorter rest periods and moderate-to-high reps throughout.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "10–15", rest: "45–60", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10–15", rest: "45–60", rir: "2" },
        { name: "Seated Cable Rows", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "12–15", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Legs — glutes", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "10–15", rest: "45–60", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "10–15", rest: "45–60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 4, focus: "Upper", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–15", rest: "45", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "10–15", rest: "45", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
      { dayNum: 5, focus: "Legs — hamstrings", exercises: [
        { name: "Leg Press", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-5-04",
    env: "Gym" as const,
    days: 5,
    goal: "Build strength",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Build strength — Push/Pull/Leg 5D",
    schedule: "Mon–Fri",
    duration: "60–75 min",
    volume: "8–12 challenging sets / muscle group",
    sequence: "D1: Push — heavy | D2: Pull — heavy | D3: Legs — heavy | D4: Upper — volume | D5: Legs — volume",
    note: "High-frequency strength split. Heavy compounds early in the week, accessory volume later.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push — heavy", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "4–6", rest: "120", rir: "1–2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "6–8", rest: "90", rir: "2" },
      ] },
      { dayNum: 2, focus: "Pull — heavy", exercises: [
        { name: "Pullups", sets: 4, reps: "5–8", rest: "120", rir: "1–2" },
        { name: "Seated Cable Rows", sets: 3, reps: "6–8", rest: "90", rir: "2" },
      ] },
      { dayNum: 3, focus: "Legs — heavy", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "4–6", rest: "150", rir: "1–2" },
        { name: "Romanian Deadlift", sets: 3, reps: "5–6", rest: "120", rir: "1–2" },
      ] },
      { dayNum: 4, focus: "Upper — volume", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "8–10", rest: "75", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "8–10", rest: "75", rir: "2" },
        { name: "Close-Grip Barbell Bench Press", sets: 2, reps: "8–10", rest: "60", rir: "2" },
      ] },
      { dayNum: 5, focus: "Legs — volume", exercises: [
        { name: "Leg Press", sets: 3, reps: "8–10", rest: "90", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "8–10", rest: "75", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "8–10", rest: "60", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-5-05",
    env: "Gym" as const,
    days: 5,
    goal: "Lose weight",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Beginner",
    name: "Lose weight — Push/Pull/Leg 5D",
    schedule: "Mon–Fri",
    duration: "40–50 min",
    volume: "5–8 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Upper | D5: Legs & core",
    note: "Frequent, shorter sessions to raise weekly activity while a caloric deficit drives fat loss.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Dumbbell Bench Press", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Seated Cable Rows", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "15", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper", exercises: [
        { name: "Incline Dumbbell Press", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 5, focus: "Legs & core", exercises: [
        { name: "Romanian Deadlift", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "20–30", rest: "30", rir: "1" },
        { name: "Plank", sets: 2, reps: "30 s", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-5-06",
    env: "Gym" as const,
    days: 5,
    goal: "Get in shape",
    split: "UPPER / LOWER SPLIT",
    level: "Beginner",
    name: "Get in shape — Upper / Lower 5D",
    schedule: "Mon–Fri",
    duration: "40–55 min",
    volume: "6–9 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B | D5: Full body",
    note: "Five moderate sessions to build a consistent training habit and full-body competence.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Seated Cable Rows", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
      ] },
      { dayNum: 5, focus: "Full body", exercises: [
        { name: "Dumbbell Lunges", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Incline Dumbbell Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Cable Crunch", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-5-07",
    env: "Gym" as const,
    days: 5,
    goal: "Build muscles",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Build muscles — Push/Pull/Leg 5D",
    schedule: "Mon–Fri",
    duration: "60–75 min",
    volume: "10–14 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs — glutes / quads | D4: Upper | D5: Legs — hamstrings / calves",
    note: "High-frequency hypertrophy split with two dedicated leg days for maximum lower-body development.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10–12", rest: "75", rir: "2" },
        { name: "Triceps Pushdown", sets: 3, reps: "10–12", rest: "45", rir: "1" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–12", rest: "75", rir: "2" },
        { name: "Hammer Curls", sets: 3, reps: "10–12", rest: "45", rir: "1" },
      ] },
      { dayNum: 3, focus: "Legs — glutes / quads", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Leg Press", sets: 3, reps: "10–12", rest: "75", rir: "2" },
        { name: "Leg Extensions", sets: 3, reps: "12–15", rest: "60", rir: "1" },
      ] },
      { dayNum: 4, focus: "Upper", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "12–15", rest: "45", rir: "1" },
      ] },
      { dayNum: 5, focus: "Legs — hamstrings / calves", exercises: [
        { name: "Romanian Deadlift", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Seated Leg Curl", sets: 3, reps: "12–15", rest: "60", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "12–15", rest: "45", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-5-08",
    env: "Gym" as const,
    days: 5,
    goal: "Overall fitness",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Overall fitness — Upper / Lower 5D",
    schedule: "Mon–Fri",
    duration: "50–60 min",
    volume: "7–10 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B | D5: Full body",
    note: "Five balanced sessions covering strength, posture, mobility and conditioning across the week.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10–12", rest: "60", rir: "2" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 2, reps: "10–12", rest: "60", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–12", rest: "60", rir: "2" },
      ] },
      { dayNum: 5, focus: "Full body", exercises: [
        { name: "Leg Press", sets: 2, reps: "12–15", rest: "60", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "10–12", rest: "60", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-5-09",
    env: "Gym" as const,
    days: 5,
    goal: "Get lean",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Get lean — Push/Pull/Leg 5D",
    schedule: "Mon–Fri",
    duration: "55–70 min",
    volume: "9–13 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs — glutes | D4: Upper | D5: Legs — hamstrings & core",
    note: "High-frequency, moderate-rep training with short rest to maximize density and stay lean.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Incline Dumbbell Press", sets: 4, reps: "10–12", rest: "45–60", rir: "1–2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "12–15", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "10–12", rest: "45–60", rir: "1–2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "12–15", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Legs — glutes", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "10–12", rest: "60", rir: "1–2" },
        { name: "Dumbbell Lunges", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 4, focus: "Upper", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "10–12", rest: "45", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–12", rest: "45", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
      { dayNum: 5, focus: "Legs — hamstrings & core", exercises: [
        { name: "Romanian Deadlift", sets: 4, reps: "10–12", rest: "60", rir: "1–2" },
        { name: "Seated Leg Curl", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "20", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-5-10",
    env: "Gym" as const,
    days: 5,
    goal: "Build muscles",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Build muscles — Upper / Lower 5D",
    schedule: "Mon–Fri",
    duration: "55–65 min",
    volume: "8–11 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B | D5: Glutes & arms",
    note: "Five-day hypertrophy split with a dedicated glute-and-arms finisher day.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "8–10", rest: "90", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "10–12", rest: "60", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "8–10", rest: "90", rir: "2" },
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10–12", rest: "75", rir: "2" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Romanian Deadlift", sets: 4, reps: "8–10", rest: "90", rir: "2" },
        { name: "Leg Press", sets: 3, reps: "10–12", rest: "75", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–12", rest: "75", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–12", rest: "75", rir: "2" },
      ] },
      { dayNum: 5, focus: "Glutes & arms", exercises: [
        { name: "Dumbbell Lunges", sets: 3, reps: "12–15", rest: "60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "15", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "12–15", rest: "45", rir: "1" },
        { name: "Triceps Pushdown", sets: 2, reps: "12–15", rest: "45", rir: "1" },
      ] },
    ],
  },

  // ── GYM · 6-DAY (cont.) ─────────────────────────────────────────
  {
    id: "GF-6-03",
    env: "Gym" as const,
    days: 6,
    goal: "Get lean",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Get lean — Push/Pull/Leg 6D",
    schedule: "Mon–Sat",
    duration: "50–65 min",
    volume: "8–12 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs — glutes | D4: Push | D5: Pull | D6: Legs — hamstrings",
    note: "Classic PPL x2 rotation with moderate-to-high reps and short rest for a lean look.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "10–12", rest: "45–60", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10–12", rest: "45–60", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Legs — glutes", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "10–12", rest: "45–60", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "10–12", rest: "45–60", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 4, focus: "Push", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–12", rest: "45", rir: "2" },
        { name: "Side Lateral Raise", sets: 3, reps: "15", rest: "30", rir: "1" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 5, focus: "Pull", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Face Pull", sets: 3, reps: "15–20", rest: "30", rir: "1" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 6, focus: "Legs — hamstrings", exercises: [
        { name: "Leg Press", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "20", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-6-04",
    env: "Gym" as const,
    days: 6,
    goal: "Build strength",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Build strength — Push/Pull/Leg 6D",
    schedule: "Mon–Sat",
    duration: "60–75 min",
    volume: "9–13 challenging sets / muscle group",
    sequence: "D1: Push — heavy | D2: Pull — heavy | D3: Legs — heavy | D4: Push — volume | D5: Pull — volume | D6: Legs — volume",
    note: "Two full PPL rotations per week: heavy low-rep first pass, higher-rep accessory second pass.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push — heavy", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 4, reps: "4–6", rest: "120", rir: "1–2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "6–8", rest: "90", rir: "2" },
      ] },
      { dayNum: 2, focus: "Pull — heavy", exercises: [
        { name: "Pullups", sets: 4, reps: "5–8", rest: "120", rir: "1–2" },
        { name: "Seated Cable Rows", sets: 3, reps: "6–8", rest: "90", rir: "2" },
      ] },
      { dayNum: 3, focus: "Legs — heavy", exercises: [
        { name: "Barbell Squat", sets: 4, reps: "4–6", rest: "150", rir: "1–2" },
        { name: "Romanian Deadlift", sets: 3, reps: "5–6", rest: "120", rir: "1–2" },
      ] },
      { dayNum: 4, focus: "Push — volume", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Close-Grip Barbell Bench Press", sets: 3, reps: "8–10", rest: "60", rir: "2" },
      ] },
      { dayNum: 5, focus: "Pull — volume", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Hammer Curls", sets: 3, reps: "10–12", rest: "45", rir: "2" },
      ] },
      { dayNum: 6, focus: "Legs — volume", exercises: [
        { name: "Leg Press", sets: 3, reps: "8–10", rest: "90", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "10–12", rest: "75", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 3, reps: "8–10", rest: "60", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-6-05",
    env: "Gym" as const,
    days: 6,
    goal: "Lose weight",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Lose weight — Push/Pull/Leg 6D",
    schedule: "Mon–Sat",
    duration: "45–55 min",
    volume: "6–10 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Push | D5: Pull | D6: Legs & core",
    note: "High-frequency training to raise weekly energy expenditure while preserving lean mass.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Seated Cable Rows", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "15–20", rest: "30–45", rir: "1–2" },
      ] },
      { dayNum: 4, focus: "Push", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 5, focus: "Pull", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 6, focus: "Legs & core", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "20–30", rest: "30", rir: "1" },
        { name: "Cable Crunch", sets: 2, reps: "20", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-6-06",
    env: "Gym" as const,
    days: 6,
    goal: "Overall fitness",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Overall fitness — Push/Pull/Leg 6D",
    schedule: "Mon–Sat",
    duration: "55–65 min",
    volume: "8–11 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Push | D5: Pull | D6: Legs",
    note: "Full weekly coverage of every pattern twice, for a well-rounded experienced trainee.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Barbell Bench Press - Medium Grip", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10–12", rest: "60", rir: "2" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Seated Cable Rows", sets: 3, reps: "10–12", rest: "60", rir: "2" },
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8–12", rest: "75", rir: "2" },
        { name: "Romanian Deadlift", sets: 3, reps: "8–12", rest: "75", rir: "2" },
      ] },
      { dayNum: 4, focus: "Push", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "12–15", rest: "45", rir: "1" },
      ] },
      { dayNum: 5, focus: "Pull", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 6, focus: "Legs", exercises: [
        { name: "Leg Press", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Seated Leg Curl", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-6-07",
    env: "Gym" as const,
    days: 6,
    goal: "Get in shape",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Get in shape — Push/Pull/Leg 6D",
    schedule: "Mon–Sat",
    duration: "50–60 min",
    volume: "7–10 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Push | D5: Pull | D6: Legs",
    note: "Balanced six-day rotation for steady all-around progress.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "8–12", rest: "60", rir: "2" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "10–12", rest: "60", rir: "2" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "8–12", rest: "60", rir: "2" },
        { name: "Seated Cable Rows", sets: 2, reps: "10–12", rest: "60", rir: "2" },
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "8–12", rest: "60", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Push", exercises: [
        { name: "Incline Dumbbell Press", sets: 2, reps: "10–12", rest: "60", rir: "2" },
        { name: "Triceps Pushdown", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 5, focus: "Pull", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 2, reps: "10–12", rest: "60", rir: "2" },
        { name: "Hammer Curls", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 6, focus: "Legs", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "8–12", rest: "60", rir: "2" },
        { name: "Seated Leg Curl", sets: 2, reps: "12–15", rest: "60", rir: "2" },
        { name: "Cable Crunch", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-6-08",
    env: "Gym" as const,
    days: 6,
    goal: "Build muscles",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Beginner",
    name: "Build muscles — Push/Pull/Leg 6D",
    schedule: "Mon–Sat",
    duration: "45–55 min",
    volume: "6–9 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Push | D5: Pull | D6: Legs",
    note: "First exposure to a six-day rotation. Prioritize technique and manageable loads.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Dumbbell Bench Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Seated Cable Rows", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Leg Press", sets: 2, reps: "12–15", rest: "60", rir: "2" },
      ] },
      { dayNum: 4, focus: "Push", exercises: [
        { name: "Incline Dumbbell Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Triceps Pushdown", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 5, focus: "Pull", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Hammer Curls", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 6, focus: "Legs", exercises: [
        { name: "Romanian Deadlift", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
    ],
  },
  {
    id: "GF-6-09",
    env: "Gym" as const,
    days: 6,
    goal: "Get lean",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Intermediate",
    name: "Get lean — Push/Pull/Leg 6D (v2)",
    schedule: "Mon–Sat",
    duration: "50–60 min",
    volume: "7–11 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs — glutes | D4: Push | D5: Pull | D6: Legs — quads / calves",
    note: "Moderate rep ranges across all six sessions, short rest, to stay lean while retaining strength.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–15", rest: "45", rir: "2" },
        { name: "Side Lateral Raise", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Seated Cable Rows", sets: 3, reps: "10–15", rest: "45", rir: "2" },
        { name: "Face Pull", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Legs — glutes", exercises: [
        { name: "Romanian Deadlift", sets: 3, reps: "10–15", rest: "45", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Push", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "10–15", rest: "45", rir: "2" },
        { name: "Cable Rope Overhead Triceps Extension", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 5, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 3, reps: "10–15", rest: "45", rir: "2" },
        { name: "Standing Biceps Cable Curl", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 6, focus: "Legs — quads / calves", exercises: [
        { name: "Barbell Squat", sets: 3, reps: "10–15", rest: "45", rir: "2" },
        { name: "Leg Extensions", sets: 2, reps: "15–20", rest: "30", rir: "1" },
        { name: "Standing Barbell Calf Raise", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "GF-6-10",
    env: "Gym" as const,
    days: 6,
    goal: "Overall fitness",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Beginner",
    name: "Overall fitness — Push/Pull/Leg 6D",
    schedule: "Mon–Sat",
    duration: "40–50 min",
    volume: "5–8 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Push | D5: Pull | D6: Legs",
    note: "Gentle six-day introduction focused on frequency and consistency over intensity.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Dumbbell Bench Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "Seated Cable Rows", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Barbell Squat", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
      ] },
      { dayNum: 4, focus: "Push", exercises: [
        { name: "Dumbbell Shoulder Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
      ] },
      { dayNum: 5, focus: "Pull", exercises: [
        { name: "Wide-Grip Lat Pulldown", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
      ] },
      { dayNum: 6, focus: "Legs", exercises: [
        { name: "Romanian Deadlift", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
    ],
  },

  // ── BODYWEIGHT (cont.) ──────────────────────────────────────────
  {
    id: "BF-2-02",
    env: "Bodyweight" as const,
    days: 2,
    goal: "Get lean",
    split: "FULL BODY",
    level: "Intermediate",
    name: "Get lean — BW Full Body 2D",
    schedule: "Tue / Fri",
    duration: "35–45 min",
    volume: "6–10 challenging sets / muscle group",
    sequence: "D1: Full body A | D2: Full body B",
    note: "Bodyweight circuits with short rest for a lean, conditioned look.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Full body A", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "15–25", rest: "30–45", rir: "2" },
        { name: "Push-Up Wide", sets: 3, reps: "10–20", rest: "30–45", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "15–20", rest: "30", rir: "1" },
        { name: "Plank", sets: 2, reps: "30–45 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Full body B", exercises: [
        { name: "Dumbbell Lunges", sets: 3, reps: "15–20", rest: "30–45", rir: "2" },
        { name: "Pushups", sets: 3, reps: "10–20", rest: "30–45", rir: "2" },
        { name: "Superman", sets: 2, reps: "12–15", rest: "30", rir: "1" },
        { name: "Mountain Climbers", sets: 2, reps: "20–30", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "BF-3-02",
    env: "Bodyweight" as const,
    days: 3,
    goal: "Build strength",
    split: "FULL BODY",
    level: "Advanced",
    name: "Build strength — BW Full Body 3D",
    schedule: "Mon / Wed / Fri",
    duration: "45–55 min",
    volume: "6–9 challenging sets / muscle group",
    sequence: "D1: Full body A | D2: Full body B | D3: Full body C",
    note: "Advanced bodyweight strength work: slow eccentrics, single-limb variations, longer holds.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Full body A", exercises: [
        { name: "Bodyweight Squat", sets: 4, reps: "15–20", rest: "45–60", rir: "1–2" },
        { name: "Handstand Push-Ups", sets: 3, reps: "4–8", rest: "60–90", rir: "1–2" },
        { name: "Plank", sets: 3, reps: "45–60 s", rest: "45", rir: "1" },
      ] },
      { dayNum: 2, focus: "Full body B", exercises: [
        { name: "Dumbbell Rear Lunge", sets: 4, reps: "10–15", rest: "45–60", rir: "1–2" },
        { name: "Push-Ups - Close Triceps Position", sets: 3, reps: "10–15", rest: "45", rir: "1–2" },
        { name: "Superman", sets: 3, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Full body C", exercises: [
        { name: "Single Leg Glute Bridge", sets: 4, reps: "15–20", rest: "45", rir: "1–2" },
        { name: "Body Tricep Press", sets: 3, reps: "8–12", rest: "45–60", rir: "1–2" },
        { name: "Rickshaw Carry", sets: 3, reps: "30–40 m", rest: "45", rir: "1" },
      ] },
    ],
  },
  {
    id: "BF-4-02",
    env: "Bodyweight" as const,
    days: 4,
    goal: "Overall fitness",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Overall fitness — BW Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "35–45 min",
    volume: "6–9 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B",
    note: "Balanced bodyweight coverage across the week, no equipment required.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "15–20", rest: "45", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "15", rest: "30", rir: "1–2" },
        { name: "Plank", sets: 2, reps: "30–45 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Push-Up Wide", sets: 3, reps: "10–15", rest: "45", rir: "2" },
        { name: "Superman", sets: 2, reps: "15", rest: "30", rir: "1" },
        { name: "Body Tricep Press", sets: 2, reps: "8–12", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Dumbbell Lunges", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "20–30", rest: "30", rir: "1" },
        { name: "Dead Bug", sets: 2, reps: "12–15", rest: "30", rir: "1" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Pushups", sets: 3, reps: "10–15", rest: "45", rir: "2" },
        { name: "Push-Ups - Close Triceps Position", sets: 2, reps: "8–12", rest: "45", rir: "2" },
        { name: "Superman", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "BF-5-01",
    env: "Bodyweight" as const,
    days: 5,
    goal: "Get in shape",
    split: "UPPER / LOWER SPLIT",
    level: "Beginner",
    name: "Get in shape — BW Upper / Lower 5D",
    schedule: "Mon–Fri",
    duration: "30–40 min",
    volume: "5–8 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B | D5: Full body",
    note: "Five short, approachable sessions to build a daily movement habit with no equipment.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Bodyweight Squat", sets: 2, reps: "15–20", rest: "45", rir: "2–3" },
        { name: "Plank", sets: 2, reps: "20–30 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Push-Up Wide", sets: 2, reps: "8–12", rest: "45", rir: "2–3" },
        { name: "Superman", sets: 2, reps: "12", rest: "30", rir: "1–2" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Dumbbell Lunges", sets: 2, reps: "12–15", rest: "45", rir: "2–3" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12–15", rest: "30", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Pushups", sets: 2, reps: "8–12", rest: "45", rir: "2–3" },
        { name: "Dead Bug", sets: 2, reps: "10–15", rest: "30", rir: "1–2" },
      ] },
      { dayNum: 5, focus: "Full body", exercises: [
        { name: "Bodyweight Squat", sets: 2, reps: "15–20", rest: "45", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "20", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "BF-5-02",
    env: "Bodyweight" as const,
    days: 5,
    goal: "Build muscles",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Build muscles — BW Upper / Lower 5D",
    schedule: "Mon–Fri",
    duration: "40–50 min",
    volume: "7–10 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B | D5: Glutes & core",
    note: "High-frequency bodyweight hypertrophy work using tempo and single-limb variations for progression.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "15–20", rest: "45", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "15", rest: "30", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Push-Up Wide", sets: 3, reps: "10–15", rest: "45", rir: "2" },
        { name: "Body Tricep Press", sets: 2, reps: "8–12", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Goblet Squat", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Push-Ups - Close Triceps Position", sets: 3, reps: "8–12", rest: "45", rir: "2" },
        { name: "Superman", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 5, focus: "Glutes & core", exercises: [
        { name: "Single Leg Glute Bridge", sets: 3, reps: "15–20", rest: "30", rir: "1–2" },
        { name: "Dead Bug", sets: 2, reps: "15", rest: "30", rir: "1" },
        { name: "Plank", sets: 2, reps: "45 s", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "BF-6-01",
    env: "Bodyweight" as const,
    days: 6,
    goal: "Get lean",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Get lean — BW Push/Pull/Leg 6D",
    schedule: "Mon–Sat",
    duration: "40–50 min",
    volume: "6–9 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull/Core | D3: Legs | D4: Push | D5: Pull/Core | D6: Legs",
    note: "Six days of bodyweight-only training with short rest to maximize the conditioning stimulus.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Push-Up Wide", sets: 3, reps: "12–20", rest: "30–45", rir: "1–2" },
        { name: "Handstand Push-Ups", sets: 2, reps: "4–8", rest: "60", rir: "2" },
      ] },
      { dayNum: 2, focus: "Pull/Core", exercises: [
        { name: "Superman", sets: 3, reps: "15–20", rest: "30", rir: "1–2" },
        { name: "Dead Bug", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "20–25", rest: "30–45", rir: "1–2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
      { dayNum: 4, focus: "Push", exercises: [
        { name: "Push-Ups - Close Triceps Position", sets: 3, reps: "10–15", rest: "30–45", rir: "1–2" },
        { name: "Body Tricep Press", sets: 2, reps: "8–12", rest: "45", rir: "2" },
      ] },
      { dayNum: 5, focus: "Pull/Core", exercises: [
        { name: "Mountain Climbers", sets: 3, reps: "25–30", rest: "30", rir: "1" },
        { name: "Plank", sets: 2, reps: "45–60 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 6, focus: "Legs", exercises: [
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "15–20", rest: "30–45", rir: "1–2" },
        { name: "Goblet Squat", sets: 2, reps: "15–20", rest: "30–45", rir: "1–2" },
      ] },
    ],
  },
  {
    id: "BF-6-02",
    env: "Bodyweight" as const,
    days: 6,
    goal: "Lose weight",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Lose weight — BW Upper / Lower 6D",
    schedule: "Mon–Sat",
    duration: "35–45 min",
    volume: "5–8 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B | D5: Lower C | D6: Upper C",
    note: "Frequent bodyweight circuits with minimal rest to support a caloric deficit.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "20–25", rest: "30", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "20–30", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Push-Up Wide", sets: 3, reps: "10–20", rest: "30", rir: "2" },
        { name: "Superman", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Dumbbell Lunges", sets: 3, reps: "15–20", rest: "30", rir: "2" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "15–20", rest: "30", rir: "1" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Pushups", sets: 3, reps: "10–20", rest: "30", rir: "2" },
        { name: "Dead Bug", sets: 2, reps: "12–15", rest: "30", rir: "1" },
      ] },
      { dayNum: 5, focus: "Lower C", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "15–20", rest: "30", rir: "2" },
        { name: "Plank", sets: 2, reps: "30–45 s", rest: "30", rir: "1" },
      ] },
      { dayNum: 6, focus: "Upper C", exercises: [
        { name: "Push-Ups - Close Triceps Position", sets: 3, reps: "8–15", rest: "30", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "20–30", rest: "30", rir: "1" },
      ] },
    ],
  },

  // ── DUMBBELLS AT HOME (cont.) ───────────────────────────────────
  {
    id: "DF-2-02",
    env: "Dumbbells at home" as const,
    days: 2,
    goal: "Build strength",
    split: "LOWER / UPPER SPLIT",
    level: "Intermediate",
    name: "Build strength — DB Lower / Upper 2D",
    schedule: "Mon / Thu",
    duration: "50–60 min",
    volume: "6–9 challenging sets / muscle group",
    sequence: "D1: Lower | D2: Upper",
    note: "Heavier dumbbell loads, lower reps, full rest between sets to build strength at home.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower", exercises: [
        { name: "Goblet Squat", sets: 4, reps: "6–10", rest: "90", rir: "1–2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 4, reps: "6–10", rest: "90", rir: "1–2" },
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "8–10", rest: "75", rir: "2" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 3, reps: "10–12", rest: "60", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper", exercises: [
        { name: "Dumbbell Floor Press", sets: 4, reps: "6–10", rest: "90", rir: "1–2" },
        { name: "One-Arm Dumbbell Row", sets: 4, reps: "6–10", rest: "90", rir: "1–2" },
        { name: "Standing Dumbbell Press", sets: 3, reps: "8–10", rest: "75", rir: "2" },
        { name: "Close-Grip Dumbbell Press", sets: 3, reps: "8–10", rest: "60", rir: "2" },
      ] },
    ],
  },
  {
    id: "DF-3-02",
    env: "Dumbbells at home" as const,
    days: 3,
    goal: "Get lean",
    split: "FULL BODY",
    level: "Advanced",
    name: "Get lean — DB Full Body 3D",
    schedule: "Mon / Wed / Fri",
    duration: "50–60 min",
    volume: "8–11 challenging sets / muscle group",
    sequence: "D1: Full body A | D2: Full body B | D3: Full body C",
    note: "Dense dumbbell circuits, short rest, moderate reps to stay lean with minimal equipment.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Full body A", exercises: [
        { name: "Goblet Squat", sets: 4, reps: "12–15", rest: "45", rir: "1–2" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "12–15", rest: "45", rir: "1–2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "12–15", rest: "45", rir: "1–2" },
        { name: "Dead Bug", sets: 2, reps: "15", rest: "30", rir: "1" },
      ] },
      { dayNum: 2, focus: "Full body B", exercises: [
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 4, reps: "12–15", rest: "45", rir: "1–2" },
        { name: "Standing Dumbbell Press", sets: 3, reps: "12–15", rest: "45", rir: "1–2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "12–15", rest: "45", rir: "1–2" },
        { name: "Mountain Climbers", sets: 2, reps: "20–30", rest: "30", rir: "1" },
      ] },
      { dayNum: 3, focus: "Full body C", exercises: [
        { name: "Dumbbell Rear Lunge", sets: 3, reps: "12–15", rest: "45", rir: "1–2" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "12–15", rest: "45", rir: "1–2" },
        { name: "Dumbbell One-Arm Triceps Extension", sets: 2, reps: "12–15", rest: "30", rir: "1" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "12–15", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "DF-4-02",
    env: "Dumbbells at home" as const,
    days: 4,
    goal: "Overall fitness",
    split: "UPPER / LOWER SPLIT",
    level: "Beginner",
    name: "Overall fitness — DB Upper / Lower 4D",
    schedule: "Mon / Tue / Thu / Fri",
    duration: "40–50 min",
    volume: "5–8 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B",
    note: "Approachable dumbbell-only split covering all major muscle groups twice per week.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Dumbbell Lunges", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Standing Dumbbell Press", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "10–12", rest: "60", rir: "2–3" },
      ] },
    ],
  },
  {
    id: "DF-5-02",
    env: "Dumbbells at home" as const,
    days: 5,
    goal: "Lose weight",
    split: "UPPER / LOWER SPLIT",
    level: "Intermediate",
    name: "Lose weight — DB Upper / Lower 5D",
    schedule: "Mon–Fri",
    duration: "35–45 min",
    volume: "6–9 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B | D5: Full body",
    note: "Five brisk dumbbell sessions with short rest to support a caloric deficit.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Goblet Squat", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Dumbbell Lunges", sets: 2, reps: "15", rest: "30–45", rir: "1–2" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Dumbbell Rear Lunge", sets: 2, reps: "15", rest: "30–45", rir: "1–2" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Standing Dumbbell Press", sets: 3, reps: "12–15", rest: "45", rir: "2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 5, focus: "Full body", exercises: [
        { name: "Goblet Squat", sets: 2, reps: "15", rest: "30–45", rir: "1–2" },
        { name: "Dumbbell Floor Press", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Mountain Climbers", sets: 2, reps: "20–30", rest: "30", rir: "1" },
      ] },
    ],
  },
  {
    id: "DF-6-01",
    env: "Dumbbells at home" as const,
    days: 6,
    goal: "Build muscles",
    split: "PUSH/PULL/LEG SPLIT",
    level: "Advanced",
    name: "Build muscles — DB Push/Pull/Leg 6D",
    schedule: "Mon–Sat",
    duration: "50–65 min",
    volume: "9–12 challenging sets / muscle group",
    sequence: "D1: Push | D2: Pull | D3: Legs | D4: Push | D5: Pull | D6: Legs",
    note: "High-frequency dumbbell hypertrophy split. Progress load or reps every session where possible.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Push", exercises: [
        { name: "Dumbbell Bench Press", sets: 4, reps: "8–10", rest: "75", rir: "1–2" },
        { name: "Standing Dumbbell Press", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Dumbbell One-Arm Triceps Extension", sets: 3, reps: "12–15", rest: "45", rir: "1" },
      ] },
      { dayNum: 2, focus: "Pull", exercises: [
        { name: "One-Arm Dumbbell Row", sets: 4, reps: "8–10", rest: "75", rir: "1–2" },
        { name: "Dumbbell Incline Row", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Incline Dumbbell Curl", sets: 3, reps: "12–15", rest: "45", rir: "1" },
      ] },
      { dayNum: 3, focus: "Legs", exercises: [
        { name: "Goblet Squat", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 4, reps: "8–10", rest: "90", rir: "1–2" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 3, reps: "12–15", rest: "45", rir: "1" },
      ] },
      { dayNum: 4, focus: "Push", exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Front Dumbbell Raise", sets: 3, reps: "12–15", rest: "45", rir: "1" },
        { name: "Decline Dumbbell Triceps Extension", sets: 2, reps: "12–15", rest: "45", rir: "1" },
      ] },
      { dayNum: 5, focus: "Pull", exercises: [
        { name: "Bent-Arm Dumbbell Pullover", sets: 3, reps: "10–12", rest: "60", rir: "2" },
        { name: "Reverse Flyes", sets: 3, reps: "12–15", rest: "45", rir: "1" },
        { name: "Dumbbell Bicep Curl", sets: 3, reps: "12–15", rest: "45", rir: "1" },
      ] },
      { dayNum: 6, focus: "Legs", exercises: [
        { name: "Dumbbell Rear Lunge", sets: 4, reps: "10–12", rest: "60", rir: "1–2" },
        { name: "Single Leg Glute Bridge", sets: 3, reps: "15", rest: "45", rir: "1–2" },
        { name: "Standing Dumbbell Calf Raise", sets: 3, reps: "12–15", rest: "45", rir: "1" },
      ] },
    ],
  },
  {
    id: "DF-6-02",
    env: "Dumbbells at home" as const,
    days: 6,
    goal: "Get in shape",
    split: "UPPER / LOWER SPLIT",
    level: "Beginner",
    name: "Get in shape — DB Upper / Lower 6D",
    schedule: "Mon–Sat",
    duration: "35–45 min",
    volume: "5–8 challenging sets / muscle group",
    sequence: "D1: Lower A | D2: Upper A | D3: Lower B | D4: Upper B | D5: Lower C | D6: Upper C",
    note: "A gentle six-day dumbbell-only introduction, alternating lower and upper focus each day.",
    sex: "female" as const,
    workouts: [
      { dayNum: 1, focus: "Lower A", exercises: [
        { name: "Goblet Squat", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Single Leg Glute Bridge", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 2, focus: "Upper A", exercises: [
        { name: "Dumbbell Bench Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "One-Arm Dumbbell Row", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
      ] },
      { dayNum: 3, focus: "Lower B", exercises: [
        { name: "Stiff-Legged Dumbbell Deadlift", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Dumbbell Lunges", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 4, focus: "Upper B", exercises: [
        { name: "Standing Dumbbell Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Dumbbell Incline Row", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
      ] },
      { dayNum: 5, focus: "Lower C", exercises: [
        { name: "Dumbbell Rear Lunge", sets: 2, reps: "12–15", rest: "45", rir: "2" },
        { name: "Dumbbell Seated One-Leg Calf Raise", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
      { dayNum: 6, focus: "Upper C", exercises: [
        { name: "Incline Dumbbell Press", sets: 2, reps: "10–12", rest: "60", rir: "2–3" },
        { name: "Dumbbell Bicep Curl", sets: 2, reps: "12–15", rest: "45", rir: "2" },
      ] },
    ],
  },
];

export const PLAN_GOALS = ["Build muscles", "Build strength", "Get in shape", "Get lean", "Lose weight", "Overall fitness"] as const;
export const PLAN_ENVIRONMENTS = ["Gym", "Bodyweight", "Dumbbells at home"] as const;
export const PLAN_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export const PLAN_SPLITS = ["BRO SPLIT", "PUSH/PULL/LEG SPLIT"] as const;
export const PLAN_DAYS = [2, 3, 4, 5, 6] as const;
