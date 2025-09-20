export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points_reward: number
          requirements: Json
        }
        Insert: {
          badge_color?: string
          category?: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          name: string
          points_reward?: number
          requirements?: Json
        }
        Update: {
          badge_color?: string
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points_reward?: number
          requirements?: Json
        }
        Relationships: []
      }
      challenges: {
        Row: {
          active_date: string
          created_at: string
          description: string
          id: string
          is_daily: boolean
          points_reward: number
          target_value: number
          title: string
          type: string
        }
        Insert: {
          active_date?: string
          created_at?: string
          description: string
          id?: string
          is_daily?: boolean
          points_reward?: number
          target_value?: number
          title: string
          type?: string
        }
        Update: {
          active_date?: string
          created_at?: string
          description?: string
          id?: string
          is_daily?: boolean
          points_reward?: number
          target_value?: number
          title?: string
          type?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          participants: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participants: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participants?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: []
      }
      content_analytics: {
        Row: {
          analyzed_at: string
          engagement_score: number | null
          hashtags: Json | null
          id: string
          post_id: string | null
          quality_score: number | null
          sentiment_score: number | null
          topics: Json | null
        }
        Insert: {
          analyzed_at?: string
          engagement_score?: number | null
          hashtags?: Json | null
          id?: string
          post_id?: string | null
          quality_score?: number | null
          sentiment_score?: number | null
          topics?: Json | null
        }
        Update: {
          analyzed_at?: string
          engagement_score?: number | null
          hashtags?: Json | null
          id?: string
          post_id?: string | null
          quality_score?: number | null
          sentiment_score?: number | null
          topics?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "content_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_recommendations: {
        Row: {
          clicked: boolean
          created_at: string
          id: string
          post_id: string | null
          reason: string | null
          score: number
          shown: boolean
          user_id: string
        }
        Insert: {
          clicked?: boolean
          created_at?: string
          id?: string
          post_id?: string | null
          reason?: string | null
          score: number
          shown?: boolean
          user_id: string
        }
        Update: {
          clicked?: boolean
          created_at?: string
          id?: string
          post_id?: string | null
          reason?: string | null
          score?: number
          shown?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_recommendations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_settings: {
        Row: {
          conversion_rate_eloits_to_usdt: number
          id: string
          min_kyc_level_for_withdrawal: number
          p2p_fee_percentage: number
          reward_rate_percentage: number
          transaction_fee_percentage: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          conversion_rate_eloits_to_usdt?: number
          id?: string
          min_kyc_level_for_withdrawal?: number
          p2p_fee_percentage?: number
          reward_rate_percentage?: number
          transaction_fee_percentage?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          conversion_rate_eloits_to_usdt?: number
          id?: string
          min_kyc_level_for_withdrawal?: number
          p2p_fee_percentage?: number
          reward_rate_percentage?: number
          transaction_fee_percentage?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      crypto_transactions: {
        Row: {
          amount: number
          created_at: string | null
          crypto_type: string
          fee: number
          id: string
          notes: string | null
          recipient_id: string | null
          status: string
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          crypto_type: string
          fee?: number
          id?: string
          notes?: string | null
          recipient_id?: string | null
          status?: string
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          crypto_type?: string
          fee?: number
          id?: string
          notes?: string | null
          recipient_id?: string | null
          status?: string
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      disputes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          raised_by: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          trade_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          raised_by: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          trade_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          raised_by?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          trade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      escrows: {
        Row: {
          amount: number
          created_at: string
          crypto_type: string
          id: string
          refunded_at: string | null
          released_at: string | null
          status: string
          trade_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          crypto_type: string
          id?: string
          refunded_at?: string | null
          released_at?: string | null
          status?: string
          trade_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          crypto_type?: string
          id?: string
          refunded_at?: string | null
          released_at?: string | null
          status?: string
          trade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrows_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendee_count: number
          created_at: string
          creator_id: string
          description: string
          end_date: string | null
          group_id: string | null
          id: string
          location: string | null
          max_attendees: number | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          attendee_count?: number
          created_at?: string
          creator_id: string
          description: string
          end_date?: string | null
          group_id?: string | null
          id?: string
          location?: string | null
          max_attendees?: number | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          attendee_count?: number
          created_at?: string
          creator_id?: string
          description?: string
          end_date?: string | null
          group_id?: string | null
          id?: string
          location?: string | null
          max_attendees?: number | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          avatar_url: string | null
          cover_url: string | null
          created_at: string
          creator_id: string
          description: string
          id: string
          member_count: number
          name: string
          privacy: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cover_url?: string | null
          created_at?: string
          creator_id: string
          description: string
          id?: string
          member_count?: number
          name: string
          privacy?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cover_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          member_count?: number
          name?: string
          privacy?: string
          updated_at?: string
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          created_at: string
          document_type: string
          document_url: string
          id: string
          user_id: string
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          document_url: string
          id?: string
          user_id: string
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          document_url?: string
          id?: string
          user_id?: string
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      moderation_logs: {
        Row: {
          action: string
          confidence_score: number | null
          content_id: string
          content_type: string
          created_at: string
          id: string
          reason: string | null
          reviewed_by: string | null
        }
        Insert: {
          action: string
          confidence_score?: number | null
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          reason?: string | null
          reviewed_by?: string | null
        }
        Update: {
          action?: string
          confidence_score?: number | null
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          reason?: string | null
          reviewed_by?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          related_post_id: string | null
          related_user_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          related_post_id?: string | null
          related_user_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          related_post_id?: string | null
          related_user_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      p2p_offers: {
        Row: {
          amount: number
          created_at: string | null
          crypto_type: string
          expires_at: string
          id: string
          notes: string | null
          offer_type: string
          payment_method: string
          price_per_unit: number
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          crypto_type: string
          expires_at: string
          id?: string
          notes?: string | null
          offer_type: string
          payment_method: string
          price_per_unit: number
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          crypto_type?: string
          expires_at?: string
          id?: string
          notes?: string | null
          offer_type?: string
          payment_method?: string
          price_per_unit?: number
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          filter: string | null
          id: string
          image_url: string | null
          eloits: number | null
          tags: string[] | null
          type: string | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          filter?: string | null
          id?: string
          image_url?: string | null
          eloits?: number | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          filter?: string | null
          id?: string
          image_url?: string | null
          eloits?: number | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          condition: string
          created_at: string
          crypto_symbol: string
          id: string
          is_active: boolean
          target_price: number
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string
          crypto_symbol: string
          id?: string
          is_active?: boolean
          target_price: number
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          crypto_symbol?: string
          id?: string
          is_active?: boolean
          target_price?: number
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          boost_until: string | null
          category: string | null
          created_at: string
          description: string
          discount_price: number | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          is_featured: boolean | null
          is_sponsored: boolean | null
          name: string
          price: number
          rating: number | null
          review_count: number | null
          seller_id: string
          updated_at: string
        }
        Insert: {
          boost_until?: string | null
          category?: string | null
          created_at?: string
          description: string
          discount_price?: number | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          name: string
          price: number
          rating?: number | null
          review_count?: number | null
          seller_id: string
          updated_at?: string
        }
        Update: {
          boost_until?: string | null
          category?: string | null
          created_at?: string
          description?: string
          discount_price?: number | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          name?: string
          price?: number
          rating?: number | null
          review_count?: number | null
          seller_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          is_verified: boolean | null
          level: string | null
          name: string | null
          points: number | null
          preferences: Json | null
          role: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          avatar?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          is_verified?: boolean | null
          level?: string | null
          name?: string | null
          points?: number | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          avatar?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          is_verified?: boolean | null
          level?: string | null
          name?: string | null
          points?: number | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      trade_ratings: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          rated_id: string
          rater_id: string
          rating: number
          trade_id: string | null
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          rated_id: string
          rater_id: string
          rating: number
          trade_id?: string | null
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          rated_id?: string
          rater_id?: string
          rating?: number
          trade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_ratings_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          amount: number
          buyer_id: string
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          dispute_id: string | null
          escrow_id: string | null
          id: string
          offer_id: string | null
          payment_method: string
          price_per_unit: number
          seller_id: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_id: string
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          dispute_id?: string | null
          escrow_id?: string | null
          id?: string
          offer_id?: string | null
          payment_method: string
          price_per_unit: number
          seller_id: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          dispute_id?: string | null
          escrow_id?: string | null
          id?: string
          offer_id?: string | null
          payment_method?: string
          price_per_unit?: number
          seller_id?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "p2p_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_limits: {
        Row: {
          current_daily_volume: number
          current_monthly_volume: number
          daily_limit: number
          id: string
          kyc_level: number
          monthly_limit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_daily_volume?: number
          current_monthly_volume?: number
          daily_limit?: number
          id?: string
          kyc_level?: number
          monthly_limit?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_daily_volume?: number
          current_monthly_volume?: number
          daily_limit?: number
          id?: string
          kyc_level?: number
          monthly_limit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          earned_at: string | null
          id: string
          progress: number
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          earned_at?: string | null
          id?: string
          progress?: number
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          earned_at?: string | null
          id?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_banking_info: {
        Row: {
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          current_progress: number
          date: string
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          date?: string
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          ai_enabled: boolean
          id: string
          interaction_patterns: Json | null
          interests: Json | null
          preferred_content_types: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_enabled?: boolean
          id?: string
          interaction_patterns?: Json | null
          interests?: Json | null
          preferred_content_types?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_enabled?: boolean
          id?: string
          interaction_patterns?: Json | null
          interests?: Json | null
          preferred_content_types?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_scores: {
        Row: {
          content_score: number
          id: string
          reputation_score: number
          risk_score: number
          trading_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content_score?: number
          id?: string
          reputation_score?: number
          risk_score?: number
          trading_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content_score?: number
          id?: string
          reputation_score?: number
          risk_score?: number
          trading_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          btc_balance: number
          created_at: string | null
          eth_balance: number
          id: string
          kyc_documents: Json | null
          kyc_level: number
          kyc_verified: boolean
          eloits_balance: number
          sol_balance: number
          updated_at: string | null
          usdt_balance: number
          user_id: string | null
        }
        Insert: {
          btc_balance?: number
          created_at?: string | null
          eth_balance?: number
          id?: string
          kyc_documents?: Json | null
          kyc_level?: number
          kyc_verified?: boolean
          eloits_balance?: number
          sol_balance?: number
          updated_at?: string | null
          usdt_balance?: number
          user_id?: string | null
        }
        Update: {
          btc_balance?: number
          created_at?: string | null
          eth_balance?: number
          id?: string
          kyc_documents?: Json | null
          kyc_level?: number
          kyc_verified?: boolean
          eloits_balance?: number
          sol_balance?: number
          updated_at?: string | null
          usdt_balance?: number
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          is_verified: boolean | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: never
          is_verified?: boolean | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: never
          is_verified?: boolean | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_column_exists: {
        Args: { column_name: string; table_name: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          p_content: string
          p_related_post_id?: string
          p_related_user_id?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
