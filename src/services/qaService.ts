import { supabase } from "@/integrations/supabase/client";

// Define the interface for product question data
interface ProductQuestion {
  id: string;
  product_id: string;
  question: string;
  user_id: string;
  created_at: string;
  helpful_count?: number;
  user?: {
    full_name?: string;
    avatar_url?: string;
  };
  answers?: Array<{
    answer: string;
    answered_by: string;
    created_at: string;
    user?: {
      full_name?: string;
    };
  }>;
}

// Define the interface for the mapped question data
interface MappedQuestion {
  id: string;
  productId: string;
  question: string;
  userId: string;
  userName: string;
  userAvatar: string;
  answer?: string;
  answeredBy?: string;
  answeredByName?: string;
  answeredAt?: string;
  createdAt: string;
  helpful: number;
}

export class QAService {
  static async getProductQuestions(productId: string): Promise<MappedQuestion[]> {
    try {
      const { data, error } = await supabase
        .from('product_questions')
        .select(`
          *,
          user:profiles(full_name, avatar_url),
          answers:product_answers(*, user:profiles(full_name, avatar_url))
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching product questions:", error);
        return [];
      }

      // Explicitly type the question parameter
      return data.map((question: ProductQuestion) => ({
        id: question.id,
        productId: question.product_id,
        question: question.question,
        userId: question.user_id,
        userName: question.user?.full_name || "Anonymous",
        userAvatar: question.user?.avatar_url || "",
        answer: question.answers?.[0]?.answer || undefined,
        answeredBy: question.answers?.[0]?.answered_by || undefined,
        answeredByName: question.answers?.[0]?.user?.full_name || undefined,
        answeredAt: question.answers?.[0]?.created_at || undefined,
        createdAt: question.created_at,
        helpful: question.helpful_count || 0
      }));
    } catch (error) {
      console.error("Error fetching product questions:", error);
      return [];
    }
  }
}

export const qaService = new QAService();