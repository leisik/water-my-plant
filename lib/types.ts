export type Plant = {
  id: string;
  user_id: string;
  name: string;
  photo_path: string | null;
  created_at: string;
  updated_at: string;
};

export type WateringEvent = {
  id: string;
  plant_id: string;
  watered_at: string;
  created_at: string;
};

export type PlantWithLastWatered = Plant & {
  lastWateredAt: string | null;
  photoUrl: string | null;
};
