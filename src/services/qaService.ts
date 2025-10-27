import { supabase } from "@/integrations/supabase/client";

export class QAService {
  static async getProductQuestions(productId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('product_questions')
        .select(`
          *,
          user:profiles!user_id(full_name, avatar_url),
          answers:product_answers(*, user:profiles!answered_by(full_name, avatar_url))
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching product questions:", error);
        return [];
      }

      return data.map(question => ({
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