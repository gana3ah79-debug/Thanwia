import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL='https://aenuzbaqskhyqwatrggg.supabase.co';
export const SUPABASE_KEY='sb_publishable_WAI1Bf-pzTvfLXvjnbKCXw_vLo7Ce_2';
export const AI_URL=SUPABASE_URL+'/functions/v1/ai-quiz-v2';

export const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{
  auth:{storage:AsyncStorage,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}
});
