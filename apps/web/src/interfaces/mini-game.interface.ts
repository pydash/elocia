export interface MiniGameConfig {
  id: string;
  game_type: string;
  title: string;
  target_sign: string;
  prompt_image?: string;
  hint_text?: string;
  options?: string;
  difficulty?: number;
  is_active?: boolean;
  created_by?: string;
  created_at?: Date;
}
