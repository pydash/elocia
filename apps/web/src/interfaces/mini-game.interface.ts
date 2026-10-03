export interface SeeItSignItItem {
  id?: string;
  config_id?: string;
  objective_image_url?: string;
  objective_answer: string;
  reference_video_url?: string;
  index_order?: number;
}

export interface PuzzleSignItem {
  id?: string;
  config_id?: string;
  word_one: string;
  word_two: string;
  hidden_word: string;
  word_form: string;
  word_one_image_url?: string;
  word_two_image_url?: string;
  word_form_image_url?: string;
  reference_video_url?: string;
  index_order?: number;
}

export interface MagicFingersItem {
  id?: string;
  config_id?: string;
  word: string;
  hidden_positions: number[];
  objective_image_url?: string;
  reference_video_url?: string;
  index_order?: number;
}

export interface MiniGameConfig {
  id: string;
  game_type: "see_it_sign_it" | "puzzle_sign" | "magic_fingers" | string;
  title: string;
  description?: string;
  difficulty?: number;
  is_active?: boolean;
  target_sign?: string;
  prompt_image?: string;
  reference_video_url?: string;
  hint_text?: string;
  options?: string;
  created_at?: string;
  updated_at?: string;
  see_it_sign_it_items?: SeeItSignItItem[];
  puzzle_sign_items?: PuzzleSignItem[];
  magic_fingers_items?: MagicFingersItem[];
}
