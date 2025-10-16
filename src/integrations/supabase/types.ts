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
      activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          related_id: string | null
          related_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          related_id?: string | null
          related_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          related_id?: string | null
          related_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_banking_access: {
        Row: {
          accessed_at: string
          accessed_by: string
          id: string
          purpose: string | null
          user_id: string
        }
        Insert: {
          accessed_at?: string
          accessed_by: string
          id?: string
          purpose?: string | null
          user_id: string
        }
        Update: {
          accessed_at?: string
          accessed_by?: string
          id?: string
          purpose?: string | null
          user_id?: string
        }
        Relationships: []
      }
      battles: {
        Row: {
          battle_type: string
          challenger_id: string
          challenger_score: number
          created_at: string
          id: string
          live_stream_id: string
          opponent_id: string | null
          opponent_score: number
          status: string
          time_remaining: number | null
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          battle_type: string
          challenger_id: string
          challenger_score?: number
          created_at?: string
          id?: string
          live_stream_id: string
          opponent_id?: string | null
          opponent_score?: number
          status?: string
          time_remaining?: number | null
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          battle_type?: string
          challenger_id?: string
          challenger_score?: number
          created_at?: string
          id?: string
          live_stream_id?: string
          opponent_id?: string | null
          opponent_score?: number
          status?: string
          time_remaining?: number | null
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battles_live_stream_id_fkey"
            columns: ["live_stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          featured: boolean | null
          id: string
          image: string | null
          name: string
          parent_id: string | null
          product_count: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          name: string
          parent_id?: string | null
          product_count?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          name?: string
          parent_id?: string | null
          product_count?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      comment_replies: {
        Row: {
          comment_id: string
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment_id: string
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          updated_at?: string | null
          user_id?: string
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
      crypto_prices: {
        Row: {
          circulating_supply: number | null
          created_at: string | null
          high_24h: number | null
          id: string
          last_updated: string
          low_24h: number | null
          market_cap: number | null
          market_cap_rank: number | null
          max_supply: number | null
          name: string
          price_change_24h: number | null
          price_usd: number
          symbol: string
          total_supply: number | null
          volume_24h: number | null
        }
        Insert: {
          circulating_supply?: number | null
          created_at?: string | null
          high_24h?: number | null
          id?: string
          last_updated: string
          low_24h?: number | null
          market_cap?: number | null
          market_cap_rank?: number | null
          max_supply?: number | null
          name: string
          price_change_24h?: number | null
          price_usd: number
          symbol: string
          total_supply?: number | null
          volume_24h?: number | null
        }
        Update: {
          circulating_supply?: number | null
          created_at?: string | null
          high_24h?: number | null
          id?: string
          last_updated?: string
          low_24h?: number | null
          market_cap?: number | null
          market_cap_rank?: number | null
          max_supply?: number | null
          name?: string
          price_change_24h?: number | null
          price_usd?: number
          symbol?: string
          total_supply?: number | null
          volume_24h?: number | null
        }
        Relationships: []
      }
      crypto_settings: {
        Row: {
          conversion_rate_softpoints_to_usdt: number
          id: string
          min_kyc_level_for_withdrawal: number
          p2p_fee_percentage: number
          reward_rate_percentage: number
          transaction_fee_percentage: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          conversion_rate_softpoints_to_usdt?: number
          id?: string
          min_kyc_level_for_withdrawal?: number
          p2p_fee_percentage?: number
          reward_rate_percentage?: number
          transaction_fee_percentage?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          conversion_rate_softpoints_to_usdt?: number
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
      crypto_trades: {
        Row: {
          amount: number
          created_at: string | null
          fee: number | null
          fee_currency: string | null
          id: string
          metadata: Json | null
          order_type: string | null
          pair: string
          price: number
          side: string
          status: string | null
          timestamp: string
          total_value: number
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          fee?: number | null
          fee_currency?: string | null
          id?: string
          metadata?: Json | null
          order_type?: string | null
          pair: string
          price: number
          side: string
          status?: string | null
          timestamp: string
          total_value: number
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          fee?: number | null
          fee_currency?: string | null
          id?: string
          metadata?: Json | null
          order_type?: string | null
          pair?: string
          price?: number
          side?: string
          status?: string | null
          timestamp?: string
          total_value?: number
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
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
      crypto_wallets: {
        Row: {
          balance: number | null
          chain_type: string
          created_at: string | null
          currency: string | null
          id: string
          is_connected: boolean | null
          is_primary: boolean | null
          last_synced_at: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string
          wallet_provider: string
        }
        Insert: {
          balance?: number | null
          chain_type: string
          created_at?: string | null
          currency?: string | null
          id?: string
          is_connected?: boolean | null
          is_primary?: boolean | null
          last_synced_at?: string | null
          updated_at?: string | null
          user_id: string
          wallet_address: string
          wallet_provider: string
        }
        Update: {
          balance?: number | null
          chain_type?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          is_connected?: boolean | null
          is_primary?: boolean | null
          last_synced_at?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
          wallet_provider?: string
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
      feed_post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_edited: boolean | null
          likes_count: number | null
          parent_id: string | null
          post_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feed_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feed_posts: {
        Row: {
          boost_expires_at: string | null
          comments_count: number | null
          content: string | null
          created_at: string | null
          feeling: Json | null
          id: string
          is_boosted: boolean | null
          likes_count: number | null
          location: Json | null
          media_types: string[] | null
          media_urls: string[] | null
          privacy: string | null
          shares_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          boost_expires_at?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          feeling?: Json | null
          id?: string
          is_boosted?: boolean | null
          likes_count?: number | null
          location?: Json | null
          media_types?: string[] | null
          media_urls?: string[] | null
          privacy?: string | null
          shares_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          boost_expires_at?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          feeling?: Json | null
          id?: string
          is_boosted?: boolean | null
          likes_count?: number | null
          location?: Json | null
          media_types?: string[] | null
          media_urls?: string[] | null
          privacy?: string | null
          shares_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      freelance_stats: {
        Row: {
          average_rating: number | null
          completed_projects: number | null
          created_at: string | null
          id: string
          repeat_clients: number | null
          response_time: number | null
          success_rate: number | null
          total_earnings: number | null
          total_projects: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          average_rating?: number | null
          completed_projects?: number | null
          created_at?: string | null
          id?: string
          repeat_clients?: number | null
          response_time?: number | null
          success_rate?: number | null
          total_earnings?: number | null
          total_projects?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          average_rating?: number | null
          completed_projects?: number | null
          created_at?: string | null
          id?: string
          repeat_clients?: number | null
          response_time?: number | null
          success_rate?: number | null
          total_earnings?: number | null
          total_projects?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      freelancer_profiles: {
        Row: {
          availability: string | null
          certifications: string[] | null
          completed_projects: number | null
          created_at: string | null
          description: string | null
          education: string[] | null
          experience: string | null
          hourly_rate: number | null
          id: string
          languages: string[] | null
          portfolio: string[] | null
          rating: number | null
          review_count: number | null
          skills: string[] | null
          title: string | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability?: string | null
          certifications?: string[] | null
          completed_projects?: number | null
          created_at?: string | null
          description?: string | null
          education?: string[] | null
          experience?: string | null
          hourly_rate?: number | null
          id?: string
          languages?: string[] | null
          portfolio?: string[] | null
          rating?: number | null
          review_count?: number | null
          skills?: string[] | null
          title?: string | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability?: string | null
          certifications?: string[] | null
          completed_projects?: number | null
          created_at?: string | null
          description?: string | null
          education?: string[] | null
          experience?: string | null
          hourly_rate?: number | null
          id?: string
          languages?: string[] | null
          portfolio?: string[] | null
          rating?: number | null
          review_count?: number | null
          skills?: string[] | null
          title?: string | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string | null
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
      hashtags: {
        Row: {
          created_at: string
          id: string
          name: string
          trending_score: number
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          trending_score?: number
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          trending_score?: number
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          applications_count: number | null
          attachments: string[] | null
          budget_amount: number | null
          budget_max: number | null
          budget_min: number | null
          budget_type: string | null
          category: string | null
          client_id: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          duration: string | null
          experience_level: string | null
          id: string
          is_remote: boolean | null
          location: string | null
          posted_date: string | null
          skills: string[] | null
          status: string | null
          subcategory: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          applications_count?: number | null
          attachments?: string[] | null
          budget_amount?: number | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          category?: string | null
          client_id?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          duration?: string | null
          experience_level?: string | null
          id?: string
          is_remote?: boolean | null
          location?: string | null
          posted_date?: string | null
          skills?: string[] | null
          status?: string | null
          subcategory?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          applications_count?: number | null
          attachments?: string[] | null
          budget_amount?: number | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          category?: string | null
          client_id?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          duration?: string | null
          experience_level?: string | null
          id?: string
          is_remote?: boolean | null
          location?: string | null
          posted_date?: string | null
          skills?: string[] | null
          status?: string | null
          subcategory?: string | null
          title?: string | null
          updated_at?: string | null
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
      live_streams: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          ended_at: string | null
          id: string
          is_active: boolean
          started_at: string
          stream_key: string | null
          title: string
          updated_at: string
          user_id: string
          viewer_count: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean
          started_at?: string
          stream_key?: string | null
          title: string
          updated_at?: string
          user_id: string
          viewer_count?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean
          started_at?: string
          stream_key?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          viewer_count?: number
        }
        Relationships: []
      }
      marketplace_analytics: {
        Row: {
          avg_order_value: number | null
          conversion_rate: number | null
          created_at: string | null
          date: string
          id: string
          seller_id: string | null
          total_orders: number | null
          total_sales: number | null
        }
        Insert: {
          avg_order_value?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date: string
          id?: string
          seller_id?: string | null
          total_orders?: number | null
          total_sales?: number | null
        }
        Update: {
          avg_order_value?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string
          id?: string
          seller_id?: string | null
          total_orders?: number | null
          total_sales?: number | null
        }
        Relationships: []
      }
      milestones: {
        Row: {
          amount: number | null
          approval_date: string | null
          created_at: string | null
          deliverables: string[] | null
          description: string | null
          due_date: string | null
          id: string
          project_id: string | null
          status: string | null
          submission_date: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          approval_date?: string | null
          created_at?: string | null
          deliverables?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          submission_date?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          approval_date?: string | null
          created_at?: string | null
          deliverables?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          submission_date?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          quantity: number
          total: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id?: string | null
          quantity: number
          total: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
          total?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          delivered_at: string | null
          estimated_delivery: string | null
          id: string
          payment_method: string | null
          seller_id: string | null
          shipping_address: Json | null
          status: string | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          payment_method?: string | null
          seller_id?: string | null
          shipping_address?: Json | null
          status?: string | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          payment_method?: string | null
          seller_id?: string | null
          shipping_address?: Json | null
          status?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      page_followers: {
        Row: {
          created_at: string
          id: string
          page_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          page_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_followers_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          avatar_url: string | null
          category: string | null
          cover_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          follower_count: number
          id: string
          is_verified: boolean
          name: string
          privacy: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          follower_count?: number
          id?: string
          is_verified?: boolean
          name: string
          privacy?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          follower_count?: number
          id?: string
          is_verified?: boolean
          name?: string
          privacy?: string
          updated_at?: string
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
      post_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          filter: string | null
          id: string
          image_url: string | null
          privacy: string
          softpoints: number | null
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
          privacy?: string
          softpoints?: number | null
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
          privacy?: string
          softpoints?: number | null
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
      product_analytics: {
        Row: {
          clicks: number | null
          conversion_rate: number | null
          created_at: string | null
          date: string
          id: string
          product_id: string | null
          purchases: number | null
          revenue: number | null
          views: number | null
        }
        Insert: {
          clicks?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date: string
          id?: string
          product_id?: string | null
          purchases?: number | null
          revenue?: number | null
          views?: number | null
        }
        Update: {
          clicks?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string
          id?: string
          product_id?: string | null
          purchases?: number | null
          revenue?: number | null
          views?: number | null
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
      projects: {
        Row: {
          budget: number | null
          client_id: string | null
          contract_terms: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          escrow_amount: number | null
          freelancer_id: string | null
          id: string
          job_id: string | null
          start_date: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          contract_terms?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          escrow_amount?: number | null
          freelancer_id?: string | null
          id?: string
          job_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          client_id?: string | null
          contract_terms?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          escrow_amount?: number | null
          freelancer_id?: string | null
          id?: string
          job_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          attachments: string[] | null
          cover_letter: string | null
          created_at: string | null
          freelancer_id: string | null
          id: string
          job_id: string | null
          proposed_duration: string | null
          proposed_rate: number | null
          status: string | null
          submitted_date: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          cover_letter?: string | null
          created_at?: string | null
          freelancer_id?: string | null
          id?: string
          job_id?: string | null
          proposed_duration?: string | null
          proposed_rate?: number | null
          status?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          cover_letter?: string | null
          created_at?: string | null
          freelancer_id?: string | null
          id?: string
          job_id?: string | null
          proposed_duration?: string | null
          proposed_rate?: number | null
          status?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          product_id: string | null
          rating: number | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          product_id?: string | null
          rating?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          product_id?: string | null
          rating?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: []
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string | null
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string | null
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string | null
          viewer_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      test_connection: {
        Row: {
          created_at: string | null
          id: number
          test_data: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          test_data?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          test_data?: string | null
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
      user_analytics: {
        Row: {
          active_minutes: number | null
          comments_received: number | null
          created_at: string | null
          date: string
          engagement_rate: number | null
          followers_count: number | null
          following_count: number | null
          id: string
          likes_received: number | null
          posts_count: number | null
          shares_received: number | null
          user_id: string | null
        }
        Insert: {
          active_minutes?: number | null
          comments_received?: number | null
          created_at?: string | null
          date: string
          engagement_rate?: number | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          likes_received?: number | null
          posts_count?: number | null
          shares_received?: number | null
          user_id?: string | null
        }
        Update: {
          active_minutes?: number | null
          comments_received?: number | null
          created_at?: string | null
          date?: string
          engagement_rate?: number | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          likes_received?: number | null
          posts_count?: number | null
          shares_received?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_banking_info: {
        Row: {
          bank_account_name: string | null
          bank_account_name_enc: string | null
          bank_account_number: string | null
          bank_account_number_enc: string | null
          bank_name: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_name_enc?: string | null
          bank_account_number?: string | null
          bank_account_number_enc?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_account_name?: string | null
          bank_account_name_enc?: string | null
          bank_account_number?: string | null
          bank_account_number_enc?: string | null
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
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          comment_notifications: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          follow_notifications: boolean | null
          id: string
          in_app_notifications: boolean | null
          like_notifications: boolean | null
          mention_notifications: boolean | null
          message_notifications: boolean | null
          push_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment_notifications?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          follow_notifications?: boolean | null
          id?: string
          in_app_notifications?: boolean | null
          like_notifications?: boolean | null
          mention_notifications?: boolean | null
          message_notifications?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment_notifications?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          follow_notifications?: boolean | null
          id?: string
          in_app_notifications?: boolean | null
          like_notifications?: boolean | null
          mention_notifications?: boolean | null
          message_notifications?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_post_shares: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          shared_to: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          shared_to?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          shared_to?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_saved_posts: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
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
      user_stories: {
        Row: {
          caption: string | null
          created_at: string | null
          expires_at: string
          id: string
          media_type: string
          media_url: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          media_type: string
          media_url: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          media_type?: string
          media_url?: string
          user_id?: string
          views_count?: number | null
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
      users: {
        Row: {
          allow_direct_messages: boolean | null
          allow_notifications: boolean | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          gender: string | null
          id: string
          is_online: boolean | null
          is_verified: boolean | null
          last_active: string | null
          level: string | null
          location: string | null
          phone: string | null
          points: number | null
          posts_count: number | null
          preferred_currency: string | null
          profile_views: number | null
          profile_visibility: string | null
          reputation: number | null
          role: string | null
          timezone: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          allow_direct_messages?: boolean | null
          allow_notifications?: boolean | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_online?: boolean | null
          is_verified?: boolean | null
          last_active?: string | null
          level?: string | null
          location?: string | null
          phone?: string | null
          points?: number | null
          posts_count?: number | null
          preferred_currency?: string | null
          profile_views?: number | null
          profile_visibility?: string | null
          reputation?: number | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          allow_direct_messages?: boolean | null
          allow_notifications?: boolean | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_online?: boolean | null
          is_verified?: boolean | null
          last_active?: string | null
          level?: string | null
          location?: string | null
          phone?: string | null
          points?: number | null
          posts_count?: number | null
          preferred_currency?: string | null
          profile_views?: number | null
          profile_visibility?: string | null
          reputation?: number | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      video_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number
          parent_id: string | null
          updated_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          updated_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          updated_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "video_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_likes: {
        Row: {
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_views: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          user_id: string | null
          video_id: string
          watch_duration: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          user_id?: string | null
          video_id: string
          watch_duration?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          user_id?: string | null
          video_id?: string
          watch_duration?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_views_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          category: string | null
          comments_count: number
          created_at: string
          description: string | null
          duration: number | null
          id: string
          is_monetized: boolean
          is_public: boolean
          likes_count: number
          shares_count: number
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string
          views_count: number
        }
        Insert: {
          category?: string | null
          comments_count?: number
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_monetized?: boolean
          is_public?: boolean
          likes_count?: number
          shares_count?: number
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url: string
          views_count?: number
        }
        Update: {
          category?: string | null
          comments_count?: number
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_monetized?: boolean
          is_public?: boolean
          likes_count?: number
          shares_count?: number
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string
          views_count?: number
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
          softpoints_balance: number
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
          softpoints_balance?: number
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
          softpoints_balance?: number
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
          display_name?: string | null
          is_verified?: boolean | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          is_verified?: boolean | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_banking_info_masked: {
        Row: {
          bank_account_name_masked: string | null
          bank_account_number_masked: string | null
          bank_name: string | null
          created_at: string | null
          id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bank_account_name_masked?: never
          bank_account_number_masked?: never
          bank_name?: string | null
          created_at?: string | null
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bank_account_name_masked?: never
          bank_account_number_masked?: never
          bank_name?: string | null
          created_at?: string | null
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      get_user_banking_info_full: {
        Args: { p_purpose?: string; p_user_id: string }
        Returns: {
          bank_account_name: string
          bank_account_number: string
          bank_name: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mask_account_number: {
        Args: { acct: string }
        Returns: string
      }
      provision_current_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_banking_access: {
        Args: { p_user_id: string }
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
