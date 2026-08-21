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
];

export const PLAN_GOALS = ["Build muscles", "Build strength", "Get in shape", "Get lean", "Lose weight", "Overall fitness"] as const;
export const PLAN_ENVIRONMENTS = ["Gym", "Bodyweight", "Dumbbells at home"] as const;
export const PLAN_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export const PLAN_SPLITS = ["BRO SPLIT", "PUSH/PULL/LEG SPLIT"] as const;
export const PLAN_DAYS = [2, 3, 4, 5, 6] as const;
