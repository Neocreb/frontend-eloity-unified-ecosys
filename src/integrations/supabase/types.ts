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
      activity_logs: {
        Row: {
          action_type: string
          base_soft_points: number | null
          context: Json | null
          created_at: string | null
          currency: string | null
          daily_count: number | null
          decay_factor: number | null
          final_soft_points: number | null
          id: string
          metadata: Json | null
          monthly_count: number | null
          processed_at: string | null
          quality_score: number | null
          review_notes: string | null
          reviewed_by: string | null
          status: string | null
          target_id: string | null
          target_type: string | null
          trust_multiplier: number | null
          updated_at: string | null
          user_id: string
          wallet_bonus: number | null
          weekly_count: number | null
        }
        Insert: {
          action_type: string
          base_soft_points?: number | null
          context?: Json | null
          created_at?: string | null
          currency?: string | null
          daily_count?: number | null
          decay_factor?: number | null
          final_soft_points?: number | null
          id?: string
          metadata?: Json | null
          monthly_count?: number | null
          processed_at?: string | null
          quality_score?: number | null
          review_notes?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_id?: string | null
          target_type?: string | null
          trust_multiplier?: number | null
          updated_at?: string | null
          user_id: string
          wallet_bonus?: number | null
          weekly_count?: number | null
        }
        Update: {
          action_type?: string
          base_soft_points?: number | null
          context?: Json | null
          created_at?: string | null
          currency?: string | null
          daily_count?: number | null
          decay_factor?: number | null
          final_soft_points?: number | null
          id?: string
          metadata?: Json | null
          monthly_count?: number | null
          processed_at?: string | null
          quality_score?: number | null
          review_notes?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_id?: string | null
          target_type?: string | null
          trust_multiplier?: number | null
          updated_at?: string | null
          user_id?: string
          wallet_bonus?: number | null
          weekly_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_reviewed_by_users_id_fk"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string
          admin_name: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          admin_name?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          admin_name?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_admin_id_admin_users_id_fk"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_admin_activity_logs_admin"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_api_keys: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          last_used_at: string | null
          name: string
          permissions: Json
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          last_used_at?: string | null
          name: string
          permissions: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "admin_api_keys_created_by_admin_users_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          action_url: string | null
          admin_id: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          message: string
          metadata: Json | null
          priority: number | null
          read_by: Json | null
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          admin_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          metadata?: Json | null
          priority?: number | null
          read_by?: Json | null
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          admin_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: number | null
          read_by?: Json | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_admin_id_admin_users_id_fk"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notifications_created_by_admin_users_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_permissions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_by: string
          id: string
          is_active: boolean | null
          permissions: Json
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_by: string
          id?: string
          is_active?: boolean | null
          permissions: Json
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_permissions_granted_by_users_id_fk"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_permissions_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          permissions: Json
          priority: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          permissions: Json
          priority?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          permissions?: Json
          priority?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          admin_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_admin_users_id_fk"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_admin_sessions_admin"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string | null
          permissions: string[] | null
          roles: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string | null
          permissions?: string[] | null
          roles?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string | null
          permissions?: string[] | null
          roles?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_conversations: {
        Row: {
          assistant_type: string
          context: Json | null
          created_at: string
          id: string
          last_message_at: string | null
          message_count: number
          metadata: Json | null
          settings: Json | null
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assistant_type: string
          context?: Json | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_count?: number
          metadata?: Json | null
          settings?: Json | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assistant_type?: string
          context?: Json | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_count?: number
          metadata?: Json | null
          settings?: Json | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string
          edited: boolean | null
          feedback: string | null
          id: string
          metadata: Json | null
          model_version: string | null
          processing_time: number | null
          role: string
          token_count: number | null
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          edited?: boolean | null
          feedback?: string | null
          id?: string
          metadata?: Json | null
          model_version?: string | null
          processing_time?: number | null
          role: string
          token_count?: number | null
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          edited?: boolean | null
          feedback?: string | null
          id?: string
          metadata?: Json | null
          model_version?: string | null
          processing_time?: number | null
          role?: string
          token_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_content_analysis: {
        Row: {
          analysis_type: string
          confidence: number
          content_id: string
          content_type: string
          created_at: string
          flags: Json | null
          id: string
          metadata: Json | null
          model_version: string
          processing_time: number | null
          results: Json
          score: number | null
        }
        Insert: {
          analysis_type: string
          confidence: number
          content_id: string
          content_type: string
          created_at?: string
          flags?: Json | null
          id?: string
          metadata?: Json | null
          model_version: string
          processing_time?: number | null
          results: Json
          score?: number | null
        }
        Update: {
          analysis_type?: string
          confidence?: number
          content_id?: string
          content_type?: string
          created_at?: string
          flags?: Json | null
          id?: string
          metadata?: Json | null
          model_version?: string
          processing_time?: number | null
          results?: Json
          score?: number | null
        }
        Relationships: []
      }
      ai_content_moderation: {
        Row: {
          action_taken: string | null
          adult_score: number | null
          appeal_status: string | null
          confidence_score: number
          content_id: string
          content_type: string
          created_at: string
          flag_reasons: Json | null
          hate_speech_score: number | null
          id: string
          metadata: Json | null
          model_version: string
          moderation_result: string
          reviewed_at: string | null
          reviewed_by: string | null
          spam_score: number | null
          toxicity_score: number | null
          violence_score: number | null
        }
        Insert: {
          action_taken?: string | null
          adult_score?: number | null
          appeal_status?: string | null
          confidence_score: number
          content_id: string
          content_type: string
          created_at?: string
          flag_reasons?: Json | null
          hate_speech_score?: number | null
          id?: string
          metadata?: Json | null
          model_version: string
          moderation_result: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          spam_score?: number | null
          toxicity_score?: number | null
          violence_score?: number | null
        }
        Update: {
          action_taken?: string | null
          adult_score?: number | null
          appeal_status?: string | null
          confidence_score?: number
          content_id?: string
          content_type?: string
          created_at?: string
          flag_reasons?: Json | null
          hate_speech_score?: number | null
          id?: string
          metadata?: Json | null
          model_version?: string
          moderation_result?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          spam_score?: number | null
          toxicity_score?: number | null
          violence_score?: number | null
        }
        Relationships: []
      }
      ai_crypto_analysis: {
        Row: {
          accuracy: number | null
          analysis_type: string
          confidence_score: number | null
          created_at: string
          data_source: string | null
          expires_at: string | null
          id: string
          market_factors: Json | null
          model_version: string
          prediction: Json | null
          price_at_analysis: number | null
          recommendation: string | null
          risk_level: string | null
          sentiment: string | null
          stop_loss: number | null
          symbol: string
          target_price: number | null
          timeframe: string
        }
        Insert: {
          accuracy?: number | null
          analysis_type: string
          confidence_score?: number | null
          created_at?: string
          data_source?: string | null
          expires_at?: string | null
          id?: string
          market_factors?: Json | null
          model_version: string
          prediction?: Json | null
          price_at_analysis?: number | null
          recommendation?: string | null
          risk_level?: string | null
          sentiment?: string | null
          stop_loss?: number | null
          symbol: string
          target_price?: number | null
          timeframe: string
        }
        Update: {
          accuracy?: number | null
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string
          data_source?: string | null
          expires_at?: string | null
          id?: string
          market_factors?: Json | null
          model_version?: string
          prediction?: Json | null
          price_at_analysis?: number | null
          recommendation?: string | null
          risk_level?: string | null
          sentiment?: string | null
          stop_loss?: number | null
          symbol?: string
          target_price?: number | null
          timeframe?: string
        }
        Relationships: []
      }
      ai_model_performance: {
        Row: {
          accuracy: number | null
          auc: number | null
          cpu_usage: number | null
          created_at: string
          deployment_status: string | null
          error_rate: number | null
          evaluation_period: string | null
          f1_score: number | null
          id: string
          memory_usage: number | null
          metadata: Json | null
          model_name: string
          model_version: string
          precision: number | null
          processing_time: number | null
          recall: number | null
          task_type: string
          test_dataset: string | null
          throughput: number | null
        }
        Insert: {
          accuracy?: number | null
          auc?: number | null
          cpu_usage?: number | null
          created_at?: string
          deployment_status?: string | null
          error_rate?: number | null
          evaluation_period?: string | null
          f1_score?: number | null
          id?: string
          memory_usage?: number | null
          metadata?: Json | null
          model_name: string
          model_version: string
          precision?: number | null
          processing_time?: number | null
          recall?: number | null
          task_type: string
          test_dataset?: string | null
          throughput?: number | null
        }
        Update: {
          accuracy?: number | null
          auc?: number | null
          cpu_usage?: number | null
          created_at?: string
          deployment_status?: string | null
          error_rate?: number | null
          evaluation_period?: string | null
          f1_score?: number | null
          id?: string
          memory_usage?: number | null
          metadata?: Json | null
          model_name?: string
          model_version?: string
          precision?: number | null
          processing_time?: number | null
          recall?: number | null
          task_type?: string
          test_dataset?: string | null
          throughput?: number | null
        }
        Relationships: []
      }
      ai_personalization_profiles: {
        Row: {
          behavior_pattern: Json | null
          content_affinities: Json | null
          created_at: string
          demographic_data: Json | null
          engagement_history: Json | null
          id: string
          interests: Json | null
          last_updated: string
          preferences: Json | null
          profile_version: number
          session_data: Json | null
          social_graph: Json | null
          user_id: string
        }
        Insert: {
          behavior_pattern?: Json | null
          content_affinities?: Json | null
          created_at?: string
          demographic_data?: Json | null
          engagement_history?: Json | null
          id?: string
          interests?: Json | null
          last_updated?: string
          preferences?: Json | null
          profile_version?: number
          session_data?: Json | null
          social_graph?: Json | null
          user_id: string
        }
        Update: {
          behavior_pattern?: Json | null
          content_affinities?: Json | null
          created_at?: string
          demographic_data?: Json | null
          engagement_history?: Json | null
          id?: string
          interests?: Json | null
          last_updated?: string
          preferences?: Json | null
          profile_version?: number
          session_data?: Json | null
          social_graph?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ai_recommendations: {
        Row: {
          clicked: boolean | null
          context: string | null
          created_at: string
          engagement: number | null
          experiment_group: string | null
          id: string
          item_id: string
          item_type: string
          liked: boolean | null
          model_version: string
          position: number | null
          reasons: Json | null
          recommendation_type: string
          score: number
          shared: boolean | null
          user_id: string
          watch_time: number | null
        }
        Insert: {
          clicked?: boolean | null
          context?: string | null
          created_at?: string
          engagement?: number | null
          experiment_group?: string | null
          id?: string
          item_id: string
          item_type: string
          liked?: boolean | null
          model_version: string
          position?: number | null
          reasons?: Json | null
          recommendation_type: string
          score: number
          shared?: boolean | null
          user_id: string
          watch_time?: number | null
        }
        Update: {
          clicked?: boolean | null
          context?: string | null
          created_at?: string
          engagement?: number | null
          experiment_group?: string | null
          id?: string
          item_id?: string
          item_type?: string
          liked?: boolean | null
          model_version?: string
          position?: number | null
          reasons?: Json | null
          recommendation_type?: string
          score?: number
          shared?: boolean | null
          user_id?: string
          watch_time?: number | null
        }
        Relationships: []
      }
      ai_smart_notifications: {
        Row: {
          ab_test_group: string | null
          actual_send_time: string | null
          clicked: boolean | null
          created_at: string
          data: Json | null
          delivery_method: Json | null
          dismissed: boolean | null
          engagement_score: number | null
          id: string
          message: string
          model_version: string | null
          notification_type: string
          opened: boolean | null
          optimal_send_time: string | null
          personalized_data: Json | null
          priority: string
          relevance_score: number | null
          sentiment_score: number | null
          title: string
          user_id: string
        }
        Insert: {
          ab_test_group?: string | null
          actual_send_time?: string | null
          clicked?: boolean | null
          created_at?: string
          data?: Json | null
          delivery_method?: Json | null
          dismissed?: boolean | null
          engagement_score?: number | null
          id?: string
          message: string
          model_version?: string | null
          notification_type: string
          opened?: boolean | null
          optimal_send_time?: string | null
          personalized_data?: Json | null
          priority: string
          relevance_score?: number | null
          sentiment_score?: number | null
          title: string
          user_id: string
        }
        Update: {
          ab_test_group?: string | null
          actual_send_time?: string | null
          clicked?: boolean | null
          created_at?: string
          data?: Json | null
          delivery_method?: Json | null
          dismissed?: boolean | null
          engagement_score?: number | null
          id?: string
          message?: string
          model_version?: string | null
          notification_type?: string
          opened?: boolean | null
          optimal_send_time?: string | null
          personalized_data?: Json | null
          priority?: string
          relevance_score?: number | null
          sentiment_score?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_trend_analysis: {
        Row: {
          calculated_at: string
          category: string | null
          current_score: number
          demographics: Json | null
          engagement: Json | null
          id: string
          identifier: string
          model_version: string
          peak_score: number | null
          predictions: Json | null
          previous_score: number | null
          related_trends: Json | null
          time_frame: string
          trend_type: string
          velocity_score: number | null
        }
        Insert: {
          calculated_at?: string
          category?: string | null
          current_score: number
          demographics?: Json | null
          engagement?: Json | null
          id?: string
          identifier: string
          model_version: string
          peak_score?: number | null
          predictions?: Json | null
          previous_score?: number | null
          related_trends?: Json | null
          time_frame: string
          trend_type: string
          velocity_score?: number | null
        }
        Update: {
          calculated_at?: string
          category?: string | null
          current_score?: number
          demographics?: Json | null
          engagement?: Json | null
          id?: string
          identifier?: string
          model_version?: string
          peak_score?: number | null
          predictions?: Json | null
          previous_score?: number | null
          related_trends?: Json | null
          time_frame?: string
          trend_type?: string
          velocity_score?: number | null
        }
        Relationships: []
      }
      ai_user_insights: {
        Row: {
          actionable_recommendations: Json | null
          applied: boolean | null
          category: string | null
          confidence_score: number | null
          created_at: string
          effectiveness: number | null
          id: string
          impact_score: number | null
          insight_type: string
          insights: Json
          model_version: string | null
          timeframe: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          actionable_recommendations?: Json | null
          applied?: boolean | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          effectiveness?: number | null
          id?: string
          impact_score?: number | null
          insight_type: string
          insights: Json
          model_version?: string | null
          timeframe?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          actionable_recommendations?: Json | null
          applied?: boolean | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          effectiveness?: number | null
          id?: string
          impact_score?: number | null
          insight_type?: string
          insights?: Json
          model_version?: string | null
          timeframe?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      audience_analytics: {
        Row: {
          age_distribution: Json | null
          buyers: number | null
          content_viewers: number | null
          created_at: string | null
          date: string
          engagement_rate: number | null
          gender_distribution: Json | null
          id: string
          location_distribution: Json | null
          new_followers: number | null
          retention_rate: number | null
          sellers: number | null
          total_followers: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          age_distribution?: Json | null
          buyers?: number | null
          content_viewers?: number | null
          created_at?: string | null
          date: string
          engagement_rate?: number | null
          gender_distribution?: Json | null
          id?: string
          location_distribution?: Json | null
          new_followers?: number | null
          retention_rate?: number | null
          sellers?: number | null
          total_followers?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          age_distribution?: Json | null
          buyers?: number | null
          content_viewers?: number | null
          created_at?: string | null
          date?: string
          engagement_rate?: number | null
          gender_distribution?: Json | null
          id?: string
          location_distribution?: Json | null
          new_followers?: number | null
          retention_rate?: number | null
          sellers?: number | null
          total_followers?: number | null
          updated_at?: string | null
          user_id?: string | null
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
      battle_bets: {
        Row: {
          battle_id: string
          bet_amount_sp: number
          bettor_id: string
          creator_bet_on: string
          id: string
          odds: number
          outcome: string | null
          payout_sp: number | null
          placed_at: string | null
          settled_at: string | null
          status: string
        }
        Insert: {
          battle_id: string
          bet_amount_sp: number
          bettor_id: string
          creator_bet_on: string
          id?: string
          odds?: number
          outcome?: string | null
          payout_sp?: number | null
          placed_at?: string | null
          settled_at?: string | null
          status?: string
        }
        Update: {
          battle_id?: string
          bet_amount_sp?: number
          bettor_id?: string
          creator_bet_on?: string
          id?: string
          odds?: number
          outcome?: string | null
          payout_sp?: number | null
          placed_at?: string | null
          settled_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_bets_battle_id_live_battles_id_fk"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "live_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_bets_bettor_id_users_id_fk"
            columns: ["bettor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_bets_creator_bet_on_users_id_fk"
            columns: ["creator_bet_on"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_gifts: {
        Row: {
          battle_id: string
          combo_count: number | null
          combo_multiplier: number | null
          gift_type: string
          id: string
          is_combo: boolean | null
          quantity: number
          recipient_id: string
          sender_id: string
          sent_at: string | null
          soft_points_value: number
        }
        Insert: {
          battle_id: string
          combo_count?: number | null
          combo_multiplier?: number | null
          gift_type: string
          id?: string
          is_combo?: boolean | null
          quantity?: number
          recipient_id: string
          sender_id: string
          sent_at?: string | null
          soft_points_value: number
        }
        Update: {
          battle_id?: string
          combo_count?: number | null
          combo_multiplier?: number | null
          gift_type?: string
          id?: string
          is_combo?: boolean | null
          quantity?: number
          recipient_id?: string
          sender_id?: string
          sent_at?: string | null
          soft_points_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_gifts_battle_id_live_battles_id_fk"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "live_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_gifts_recipient_id_users_id_fk"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_gifts_sender_id_users_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_highlights: {
        Row: {
          battle_id: string
          biggest_gift: number | null
          created_at: string | null
          duration: number
          generated_at: string | null
          highlight_url: string
          id: string
          is_published: boolean | null
          key_moments: Json | null
          likes: number | null
          processing_time: number | null
          shares: number | null
          status: string
          thumbnail_url: string | null
          title: string
          top_gifter_id: string | null
          views: number | null
        }
        Insert: {
          battle_id: string
          biggest_gift?: number | null
          created_at?: string | null
          duration: number
          generated_at?: string | null
          highlight_url: string
          id?: string
          is_published?: boolean | null
          key_moments?: Json | null
          likes?: number | null
          processing_time?: number | null
          shares?: number | null
          status?: string
          thumbnail_url?: string | null
          title: string
          top_gifter_id?: string | null
          views?: number | null
        }
        Update: {
          battle_id?: string
          biggest_gift?: number | null
          created_at?: string | null
          duration?: number
          generated_at?: string | null
          highlight_url?: string
          id?: string
          is_published?: boolean | null
          key_moments?: Json | null
          likes?: number | null
          processing_time?: number | null
          shares?: number | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          top_gifter_id?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_highlights_battle_id_live_battles_id_fk"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "live_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_highlights_top_gifter_id_users_id_fk"
            columns: ["top_gifter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_invitations: {
        Row: {
          battle_id: string
          expires_at: string
          id: string
          invitee_id: string
          inviter_id: string
          message: string | null
          responded_at: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          battle_id: string
          expires_at: string
          id?: string
          invitee_id: string
          inviter_id: string
          message?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          battle_id?: string
          expires_at?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          message?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_invitations_battle_id_live_battles_id_fk"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "live_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_invitations_invitee_id_users_id_fk"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_invitations_inviter_id_users_id_fk"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_votes: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          is_judge_vote: boolean | null
          user_id: string
          video_id: string
          vote_weight: number | null
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          is_judge_vote?: boolean | null
          user_id: string
          video_id: string
          vote_weight?: number | null
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          is_judge_vote?: boolean | null
          user_id?: string
          video_id?: string
          vote_weight?: number | null
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
      boost_shop_items: {
        Row: {
          boost_type: string
          boost_value: number
          category: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string
          duration: number | null
          icon_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_purchases_per_user: number | null
          name: string
          required_trust_score: number | null
          soft_points_cost: number | null
          sort_order: number | null
          stock_quantity: number | null
          updated_at: string | null
          wallet_cost: number | null
        }
        Insert: {
          boost_type: string
          boost_value: number
          category: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description: string
          duration?: number | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_purchases_per_user?: number | null
          name: string
          required_trust_score?: number | null
          soft_points_cost?: number | null
          sort_order?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
          wallet_cost?: number | null
        }
        Update: {
          boost_type?: string
          boost_value?: number
          category?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string
          duration?: number | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_purchases_per_user?: number | null
          name?: string
          required_trust_score?: number | null
          soft_points_cost?: number | null
          sort_order?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
          wallet_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "boost_shop_items_created_by_users_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      boosts: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          boost_type: string
          clicks: number | null
          conversions: number | null
          cost: number
          created_at: string | null
          currency: string | null
          duration: number
          end_date: string | null
          id: string
          impressions: number | null
          payment_method: string
          priority: number | null
          reference_id: string
          rejection_reason: string | null
          start_date: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          boost_type: string
          clicks?: number | null
          conversions?: number | null
          cost: number
          created_at?: string | null
          currency?: string | null
          duration: number
          end_date?: string | null
          id?: string
          impressions?: number | null
          payment_method: string
          priority?: number | null
          reference_id: string
          rejection_reason?: string | null
          start_date?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          boost_type?: string
          clicks?: number | null
          conversions?: number | null
          cost?: number
          created_at?: string | null
          currency?: string | null
          duration?: number
          end_date?: string | null
          id?: string
          impressions?: number | null
          payment_method?: string
          priority?: number | null
          reference_id?: string
          rejection_reason?: string | null
          start_date?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boosts_approved_by_users_id_fk"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boosts_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      call_quality_metrics: {
        Row: {
          bitrate: number | null
          connection_time: number | null
          frame_rate: number | null
          id: string
          jitter: number | null
          latency: number | null
          packet_loss: number | null
          recorded_at: string | null
          resolution: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          bitrate?: number | null
          connection_time?: number | null
          frame_rate?: number | null
          id?: string
          jitter?: number | null
          latency?: number | null
          packet_loss?: number | null
          recorded_at?: string | null
          resolution?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          bitrate?: number | null
          connection_time?: number | null
          frame_rate?: number | null
          id?: string
          jitter?: number | null
          latency?: number | null
          packet_loss?: number | null
          recorded_at?: string | null
          resolution?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_quality_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_quality_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      call_sessions: {
        Row: {
          call_quality: Json | null
          call_type: string
          callee_id: string
          caller_id: string
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          started_at: string | null
          status: string
        }
        Insert: {
          call_quality?: Json | null
          call_type: string
          callee_id: string
          caller_id: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status: string
        }
        Update: {
          call_quality?: Json | null
          call_type?: string
          callee_id?: string
          caller_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_sessions_callee_id_fkey"
            columns: ["callee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sessions_caller_id_fkey"
            columns: ["caller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_products: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          campaign_clicks: number | null
          campaign_id: string
          campaign_revenue: number | null
          campaign_sales: number | null
          campaign_views: number | null
          created_at: string | null
          custom_discount: number | null
          featured_order: number | null
          id: string
          product_id: string
          requested_by: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          campaign_clicks?: number | null
          campaign_id: string
          campaign_revenue?: number | null
          campaign_sales?: number | null
          campaign_views?: number | null
          created_at?: string | null
          custom_discount?: number | null
          featured_order?: number | null
          id?: string
          product_id: string
          requested_by: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          campaign_clicks?: number | null
          campaign_id?: string
          campaign_revenue?: number | null
          campaign_sales?: number | null
          campaign_views?: number | null
          created_at?: string | null
          custom_discount?: number | null
          featured_order?: number | null
          id?: string
          product_id?: string
          requested_by?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_products_approved_by_users_id_fk"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_products_campaign_id_campaigns_id_fk"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_products_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_products_requested_by_users_id_fk"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_recipients: {
        Row: {
          ab_test_group: string | null
          campaign_id: string
          clicked_at: string | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          notification_id: string | null
          opened_at: string | null
          personalized_data: Json | null
          sent_at: string | null
          status: string
          unsubscribed_at: string | null
          user_id: string
        }
        Insert: {
          ab_test_group?: string | null
          campaign_id: string
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          notification_id?: string | null
          opened_at?: string | null
          personalized_data?: Json | null
          sent_at?: string | null
          status?: string
          unsubscribed_at?: string | null
          user_id: string
        }
        Update: {
          ab_test_group?: string | null
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          notification_id?: string | null
          opened_at?: string | null
          personalized_data?: Json | null
          sent_at?: string | null
          status?: string
          unsubscribed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          background_color: string | null
          banner_image: string | null
          banner_text: string | null
          click_count: number | null
          conversion_count: number | null
          created_at: string | null
          created_by: string
          description: string | null
          discount_type: string | null
          discount_value: number | null
          eligibility_criteria: Json | null
          end_date: string
          id: string
          is_public: boolean | null
          max_discount: number | null
          max_participants: number | null
          max_products_per_seller: number | null
          min_order_amount: number | null
          name: string
          requires_approval: boolean | null
          slug: string
          start_date: string
          status: string | null
          text_color: string | null
          total_revenue: number | null
          type: string
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          view_count: number | null
        }
        Insert: {
          background_color?: string | null
          banner_image?: string | null
          banner_text?: string | null
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          created_by: string
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          eligibility_criteria?: Json | null
          end_date: string
          id?: string
          is_public?: boolean | null
          max_discount?: number | null
          max_participants?: number | null
          max_products_per_seller?: number | null
          min_order_amount?: number | null
          name: string
          requires_approval?: boolean | null
          slug: string
          start_date: string
          status?: string | null
          text_color?: string | null
          total_revenue?: number | null
          type: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          view_count?: number | null
        }
        Update: {
          background_color?: string | null
          banner_image?: string | null
          banner_text?: string | null
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          eligibility_criteria?: Json | null
          end_date?: string
          id?: string
          is_public?: boolean | null
          max_discount?: number | null
          max_participants?: number | null
          max_products_per_seller?: number | null
          min_order_amount?: number | null
          name?: string
          requires_approval?: boolean | null
          slug?: string
          start_date?: string
          status?: string | null
          text_color?: string | null
          total_revenue?: number | null
          type?: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_created_by_users_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          added_at: string | null
          cart_id: string
          custom_options: Json | null
          id: string
          notes: string | null
          price_snapshot: number
          product_id: string
          quantity: number
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          added_at?: string | null
          cart_id: string
          custom_options?: Json | null
          id?: string
          notes?: string | null
          price_snapshot: number
          product_id: string
          quantity?: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          added_at?: string | null
          cart_id?: string
          custom_options?: Json | null
          id?: string
          notes?: string | null
          price_snapshot?: number
          product_id?: string
          quantity?: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_shopping_carts_id_fk"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "shopping_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_product_variants_id_fk"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
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
      challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          completion_count: number | null
          created_at: string | null
          current_progress: number | null
          current_value: number | null
          id: string
          is_completed: boolean | null
          last_reset_at: string | null
          progress_data: Json | null
          reward_claimed: boolean | null
          reward_claimed_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          completion_count?: number | null
          created_at?: string | null
          current_progress?: number | null
          current_value?: number | null
          id?: string
          is_completed?: boolean | null
          last_reset_at?: string | null
          progress_data?: Json | null
          reward_claimed?: boolean | null
          reward_claimed_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          completion_count?: number | null
          created_at?: string | null
          current_progress?: number | null
          current_value?: number | null
          id?: string
          is_completed?: boolean | null
          last_reset_at?: string | null
          progress_data?: Json | null
          reward_claimed?: boolean | null
          reward_claimed_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_challenge_id_daily_challenges_id_fk"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_progress_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_submissions: {
        Row: {
          challenge_id: string
          comments: number | null
          disqualification_reason: string | null
          id: string
          judged_at: string | null
          likes: number | null
          post_id: string
          ranking: number | null
          reward_earned: number | null
          reward_paid: boolean | null
          score: number | null
          shares: number | null
          status: string
          submitted_at: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          challenge_id: string
          comments?: number | null
          disqualification_reason?: string | null
          id?: string
          judged_at?: string | null
          likes?: number | null
          post_id: string
          ranking?: number | null
          reward_earned?: number | null
          reward_paid?: boolean | null
          score?: number | null
          shares?: number | null
          status?: string
          submitted_at?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          challenge_id?: string
          comments?: number | null
          disqualification_reason?: string | null
          id?: string
          judged_at?: string | null
          likes?: number | null
          post_id?: string
          ranking?: number | null
          reward_earned?: number | null
          reward_paid?: boolean | null
          score?: number | null
          shares?: number | null
          status?: string
          submitted_at?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_duet_challenges_id_fk"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "duet_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_post_id_posts_id_fk"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_post_id_posts_id_fk"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      chat_ads: {
        Row: {
          body: string | null
          created_at: string | null
          cta_label: string | null
          cta_url: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          priority: number | null
          sponsor: string | null
          start_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          cta_label?: string | null
          cta_url?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          sponsor?: string | null
          start_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          cta_label?: string | null
          cta_url?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          sponsor?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_id_users_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_archived: boolean | null
          is_encrypted: boolean | null
          is_group: boolean | null
          is_muted: boolean | null
          last_message_at: string | null
          last_message_id: string | null
          message_count: number | null
          muted_by: string | null
          muted_reason: string | null
          participants: Json
          reference_id: string | null
          title: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_archived?: boolean | null
          is_encrypted?: boolean | null
          is_group?: boolean | null
          is_muted?: boolean | null
          last_message_at?: string | null
          last_message_id?: string | null
          message_count?: number | null
          muted_by?: string | null
          muted_reason?: string | null
          participants: Json
          reference_id?: string | null
          title?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_archived?: boolean | null
          is_encrypted?: boolean | null
          is_group?: boolean | null
          is_muted?: boolean | null
          last_message_at?: string | null
          last_message_id?: string | null
          message_count?: number | null
          muted_by?: string | null
          muted_reason?: string | null
          participants?: Json
          reference_id?: string | null
          title?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_created_by_users_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_muted_by_users_id_fk"
            columns: ["muted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      community_events: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          end_date: string
          event_type: string
          id: string
          is_private: boolean | null
          location: string | null
          max_attendees: number | null
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          end_date: string
          event_type: string
          id?: string
          is_private?: boolean | null
          location?: string | null
          max_attendees?: number | null
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          end_date?: string
          event_type?: string
          id?: string
          is_private?: boolean | null
          location?: string | null
          max_attendees?: number | null
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_analytics: {
        Row: {
          comments: number | null
          created_at: string | null
          description: string | null
          engagement: number | null
          id: string
          likes: number | null
          platform: string
          publish_date: string | null
          revenue: number | null
          shares: number | null
          source_id: string
          source_type: string
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string | null
          description?: string | null
          engagement?: number | null
          id?: string
          likes?: number | null
          platform: string
          publish_date?: string | null
          revenue?: number | null
          shares?: number | null
          source_id: string
          source_type: string
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string | null
          description?: string | null
          engagement?: number | null
          id?: string
          likes?: number | null
          platform?: string
          publish_date?: string | null
          revenue?: number | null
          shares?: number | null
          source_id?: string
          source_type?: string
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_flags: {
        Row: {
          action_taken: string | null
          ai_confidence: number | null
          ai_reason: string | null
          content_id: string
          content_type: string
          flag_type: string
          flagged_at: string | null
          flagged_by: string | null
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          action_taken?: string | null
          ai_confidence?: number | null
          ai_reason?: string | null
          content_id: string
          content_type: string
          flag_type: string
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          action_taken?: string | null
          ai_confidence?: number | null
          ai_reason?: string | null
          content_id?: string
          content_type?: string
          flag_type?: string
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_flags_flagged_by_users_id_fk"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_flags_reviewed_by_users_id_fk"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_moderation_queue: {
        Row: {
          assigned_to: string | null
          auto_detected: boolean | null
          confidence: number | null
          content_id: string
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          reason: string
          reported_by: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          auto_detected?: boolean | null
          confidence?: number | null
          content_id: string
          content_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          reason: string
          reported_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          auto_detected?: boolean | null
          confidence?: number | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          reason?: string
          reported_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_moderation_queue_assigned_to_users_id_fk"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_moderation_queue_reported_by_users_id_fk"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_moderation_queue_reviewed_by_users_id_fk"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
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
          {
            foreignKeyName: "content_recommendations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_with_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          action: string | null
          content_id: string
          content_type: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          action?: string | null
          content_id: string
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          action?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      contribution_payouts: {
        Row: {
          contribution_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          net_amount: number
          platform_fee: number
          processed_at: string | null
          status: string
          total_amount: number
        }
        Insert: {
          contribution_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          net_amount: number
          platform_fee: number
          processed_at?: string | null
          status?: string
          total_amount: number
        }
        Update: {
          contribution_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number
          platform_fee?: number
          processed_at?: string | null
          status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "contribution_payouts_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "group_contributions"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_earnings: {
        Row: {
          amount: number
          content_id: string | null
          content_type: string | null
          created_at: string | null
          currency: string
          description: string | null
          earned_at: string | null
          from_user_id: string | null
          id: string
          metadata: Json | null
          payout_id: string | null
          soft_points_earned: number | null
          source_type: string
          status: string | null
          subscription_amount: number | null
          tip_amount: number | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          amount: number
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          currency: string
          description?: string | null
          earned_at?: string | null
          from_user_id?: string | null
          id?: string
          metadata?: Json | null
          payout_id?: string | null
          soft_points_earned?: number | null
          source_type: string
          status?: string | null
          subscription_amount?: number | null
          tip_amount?: number | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          amount?: number
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          earned_at?: string | null
          from_user_id?: string | null
          id?: string
          metadata?: Json | null
          payout_id?: string | null
          soft_points_earned?: number | null
          source_type?: string
          status?: string | null
          subscription_amount?: number | null
          tip_amount?: number | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_earnings_from_user_id_users_id_fk"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_earnings_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          deadline: string | null
          goal_type: string
          id: string
          status: string | null
          target_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          goal_type: string
          id?: string
          status?: string | null
          target_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          goal_type?: string
          id?: string
          status?: string | null
          target_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_payouts: {
        Row: {
          admin_notes: string | null
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string
          external_transaction_id: string | null
          failure_reason: string | null
          id: string
          net_amount: number
          payment_details: Json | null
          payment_method: string
          period_end: string
          period_start: string
          processed_at: string | null
          processed_by: string | null
          processing_fee: number | null
          requested_at: string | null
          soft_points_amount: number | null
          status: string | null
          transaction_ids: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency: string
          external_transaction_id?: string | null
          failure_reason?: string | null
          id?: string
          net_amount: number
          payment_details?: Json | null
          payment_method: string
          period_end: string
          period_start: string
          processed_at?: string | null
          processed_by?: string | null
          processing_fee?: number | null
          requested_at?: string | null
          soft_points_amount?: number | null
          status?: string | null
          transaction_ids?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          external_transaction_id?: string | null
          failure_reason?: string | null
          id?: string
          net_amount?: number
          payment_details?: Json | null
          payment_method?: string
          period_end?: string
          period_start?: string
          processed_at?: string | null
          processed_by?: string | null
          processing_fee?: number | null
          requested_at?: string | null
          soft_points_amount?: number | null
          status?: string | null
          transaction_ids?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_payouts_processed_by_admin_users_id_fk"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_payouts_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_tiers: {
        Row: {
          achievements: Json | null
          badges: string[] | null
          battles_lost: number | null
          battles_won: number | null
          challenges_won: number | null
          current_tier: string
          featured_until: string | null
          has_legend_status: boolean | null
          id: string
          last_calculated: string | null
          monthly_bonus: number | null
          tier_history: Json | null
          tier_points: number | null
          total_duets: number | null
          total_earnings: number | null
          total_views: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements?: Json | null
          badges?: string[] | null
          battles_lost?: number | null
          battles_won?: number | null
          challenges_won?: number | null
          current_tier?: string
          featured_until?: string | null
          has_legend_status?: boolean | null
          id?: string
          last_calculated?: string | null
          monthly_bonus?: number | null
          tier_history?: Json | null
          tier_points?: number | null
          total_duets?: number | null
          total_earnings?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements?: Json | null
          badges?: string[] | null
          battles_lost?: number | null
          battles_won?: number | null
          challenges_won?: number | null
          current_tier?: string
          featured_until?: string | null
          has_legend_status?: boolean | null
          id?: string
          last_calculated?: string | null
          monthly_bonus?: number | null
          tier_history?: Json | null
          tier_points?: number | null
          total_duets?: number | null
          total_earnings?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_tiers_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_tip_settings: {
        Row: {
          allow_anonymous: boolean | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          max_tip_amount: number | null
          min_tip_amount: number | null
          suggested_amounts: Json | null
          thank_you_message: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_anonymous?: boolean | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          max_tip_amount?: number | null
          min_tip_amount?: number | null
          suggested_amounts?: Json | null
          thank_you_message?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_anonymous?: boolean | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          max_tip_amount?: number | null
          min_tip_amount?: number | null
          suggested_amounts?: Json | null
          thank_you_message?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_tip_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_orders: {
        Row: {
          amount: number
          average_price: number | null
          created_at: string | null
          exchange: string
          exchange_order_id: string | null
          filled_amount: number | null
          id: string
          order_type: string
          pair: string
          price: number | null
          side: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          average_price?: number | null
          created_at?: string | null
          exchange: string
          exchange_order_id?: string | null
          filled_amount?: number | null
          id?: string
          order_type: string
          pair: string
          price?: number | null
          side: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          average_price?: number | null
          created_at?: string | null
          exchange?: string
          exchange_order_id?: string | null
          filled_amount?: number | null
          id?: string
          order_type?: string
          pair?: string
          price?: number | null
          side?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      crypto_profiles: {
        Row: {
          average_rating: number | null
          created_at: string | null
          id: string
          investment_strategy: string | null
          is_verified_trader: boolean | null
          kyc_status: string | null
          kyc_verified_at: string | null
          notification_preferences: Json | null
          preferred_currencies: string[] | null
          risk_tolerance: string | null
          security_settings: Json | null
          total_trades: number | null
          trading_pairs: Json | null
          trading_volume: number | null
          updated_at: string | null
          user_id: string
          wallet_address: string | null
          wallet_provider: string | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string | null
          id?: string
          investment_strategy?: string | null
          is_verified_trader?: boolean | null
          kyc_status?: string | null
          kyc_verified_at?: string | null
          notification_preferences?: Json | null
          preferred_currencies?: string[] | null
          risk_tolerance?: string | null
          security_settings?: Json | null
          total_trades?: number | null
          trading_pairs?: Json | null
          trading_volume?: number | null
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
          wallet_provider?: string | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string | null
          id?: string
          investment_strategy?: string | null
          is_verified_trader?: boolean | null
          kyc_status?: string | null
          kyc_verified_at?: string | null
          notification_preferences?: Json | null
          preferred_currencies?: string[] | null
          risk_tolerance?: string | null
          security_settings?: Json | null
          total_trades?: number | null
          trading_pairs?: Json | null
          trading_volume?: number | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
          wallet_provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crypto_profiles_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_settings: {
        Row: {
          conversion_rate_eloity_points_to_usdt: number
          id: string
          min_kyc_level_for_withdrawal: number
          p2p_fee_percentage: number
          reward_rate_percentage: number
          transaction_fee_percentage: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          conversion_rate_eloity_points_to_usdt?: number
          id?: string
          min_kyc_level_for_withdrawal?: number
          p2p_fee_percentage?: number
          reward_rate_percentage?: number
          transaction_fee_percentage?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          conversion_rate_eloity_points_to_usdt?: number
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
      daily_activity_summaries: {
        Row: {
          activity_streak: number | null
          average_quality_score: number | null
          commercial_activities: number | null
          content_activities: number | null
          created_at: string | null
          date: string
          freelance_activities: number | null
          id: string
          login_streak: number | null
          social_activities: number | null
          suspicious_activities: number | null
          total_activities: number | null
          total_eloity_points_earned: number | null
          total_wallet_bonus_earned: number | null
          unique_action_types: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_streak?: number | null
          average_quality_score?: number | null
          commercial_activities?: number | null
          content_activities?: number | null
          created_at?: string | null
          date: string
          freelance_activities?: number | null
          id?: string
          login_streak?: number | null
          social_activities?: number | null
          suspicious_activities?: number | null
          total_activities?: number | null
          total_eloity_points_earned?: number | null
          total_wallet_bonus_earned?: number | null
          unique_action_types?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_streak?: number | null
          average_quality_score?: number | null
          commercial_activities?: number | null
          content_activities?: number | null
          created_at?: string | null
          date?: string
          freelance_activities?: number | null
          id?: string
          login_streak?: number | null
          social_activities?: number | null
          suspicious_activities?: number | null
          total_activities?: number | null
          total_eloity_points_earned?: number | null
          total_wallet_bonus_earned?: number | null
          unique_action_types?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_activity_summaries_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          challenge_type: string
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          description: string
          eligibility_criteria: Json | null
          end_date: string
          id: string
          is_active: boolean | null
          is_visible: boolean | null
          max_participants: number | null
          reset_period: string | null
          soft_points_reward: number | null
          special_reward: Json | null
          start_date: string
          target_action: string
          target_count: number | null
          target_value: number | null
          title: string
          updated_at: string | null
          wallet_reward: number | null
        }
        Insert: {
          challenge_type: string
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description: string
          eligibility_criteria?: Json | null
          end_date: string
          id?: string
          is_active?: boolean | null
          is_visible?: boolean | null
          max_participants?: number | null
          reset_period?: string | null
          soft_points_reward?: number | null
          special_reward?: Json | null
          start_date: string
          target_action: string
          target_count?: number | null
          target_value?: number | null
          title: string
          updated_at?: string | null
          wallet_reward?: number | null
        }
        Update: {
          challenge_type?: string
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string
          eligibility_criteria?: Json | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          is_visible?: boolean | null
          max_participants?: number | null
          reset_period?: string | null
          soft_points_reward?: number | null
          special_reward?: Json | null
          start_date?: string
          target_action?: string
          target_count?: number | null
          target_value?: number | null
          title?: string
          updated_at?: string | null
          wallet_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenges_created_by_users_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          app_version: string | null
          badge_count: number
          created_at: string
          device_info: Json | null
          id: string
          is_active: boolean
          last_used: string
          platform: string
          registered_at: string
          token: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          badge_count?: number
          created_at?: string
          device_info?: Json | null
          id?: string
          is_active?: boolean
          last_used?: string
          platform: string
          registered_at?: string
          token: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          badge_count?: number
          created_at?: string
          device_info?: Json | null
          id?: string
          is_active?: boolean
          last_used?: string
          platform?: string
          registered_at?: string
          token?: string
          user_id?: string
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
      duet_challenges: {
        Row: {
          banner_url: string | null
          created_at: string | null
          created_by: string
          description: string
          end_date: string
          first_prize: number | null
          hashtag: string
          id: string
          is_featured: boolean | null
          is_sponsored: boolean | null
          metadata: Json | null
          original_post_id: string
          participation_reward: number | null
          rules: string | null
          second_prize: number | null
          start_date: string
          status: string
          tags: string[] | null
          third_prize: number | null
          title: string
          total_likes: number | null
          total_submissions: number | null
          total_views: number | null
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          created_by: string
          description: string
          end_date: string
          first_prize?: number | null
          hashtag: string
          id?: string
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          metadata?: Json | null
          original_post_id: string
          participation_reward?: number | null
          rules?: string | null
          second_prize?: number | null
          start_date: string
          status?: string
          tags?: string[] | null
          third_prize?: number | null
          title: string
          total_likes?: number | null
          total_submissions?: number | null
          total_views?: number | null
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string
          end_date?: string
          first_prize?: number | null
          hashtag?: string
          id?: string
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          metadata?: Json | null
          original_post_id?: string
          participation_reward?: number | null
          rules?: string | null
          second_prize?: number | null
          start_date?: string
          status?: string
          tags?: string[] | null
          third_prize?: number | null
          title?: string
          total_likes?: number | null
          total_submissions?: number | null
          total_views?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duet_challenges_created_by_users_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duet_challenges_original_post_id_posts_id_fk"
            columns: ["original_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duet_challenges_original_post_id_posts_id_fk"
            columns: ["original_post_id"]
            isOneToOne: false
            referencedRelation: "posts_with_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          bounced_at: string | null
          clicked_at: string | null
          created_at: string
          delivered_at: string | null
          email: string
          error_message: string | null
          from_email: string
          from_name: string | null
          html_content: string
          id: string
          max_retries: number
          notification_id: string
          opened_at: string | null
          priority: string | null
          reply_to: string | null
          retry_count: number
          sent_at: string | null
          status: string
          subject: string
          template_data: Json | null
          template_id: string | null
          text_content: string | null
          tracking_pixel: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          email: string
          error_message?: string | null
          from_email: string
          from_name?: string | null
          html_content: string
          id?: string
          max_retries?: number
          notification_id: string
          opened_at?: string | null
          priority?: string | null
          reply_to?: string | null
          retry_count?: number
          sent_at?: string | null
          status?: string
          subject: string
          template_data?: Json | null
          template_id?: string | null
          text_content?: string | null
          tracking_pixel?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          email?: string
          error_message?: string | null
          from_email?: string
          from_name?: string | null
          html_content?: string
          id?: string
          max_retries?: number
          notification_id?: string
          opened_at?: string | null
          priority?: string | null
          reply_to?: string | null
          retry_count?: number
          sent_at?: string | null
          status?: string
          subject?: string
          template_data?: Json | null
          template_id?: string | null
          text_content?: string | null
          tracking_pixel?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      escrow_contracts: {
        Row: {
          amount: number
          auto_release_hours: number | null
          created_at: string | null
          currency: string
          dispute_id: string | null
          dispute_reason: string | null
          expires_at: string | null
          fee_percentage: number | null
          funded_at: string | null
          id: string
          payee_id: string
          payer_id: string
          platform_fee: number | null
          reference_id: string
          refunded_at: string | null
          release_approved_by: string | null
          release_condition: string | null
          release_notes: string | null
          released_at: string | null
          status: string | null
          terms: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          auto_release_hours?: number | null
          created_at?: string | null
          currency: string
          dispute_id?: string | null
          dispute_reason?: string | null
          expires_at?: string | null
          fee_percentage?: number | null
          funded_at?: string | null
          id?: string
          payee_id: string
          payer_id: string
          platform_fee?: number | null
          reference_id: string
          refunded_at?: string | null
          release_approved_by?: string | null
          release_condition?: string | null
          release_notes?: string | null
          released_at?: string | null
          status?: string | null
          terms: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          auto_release_hours?: number | null
          created_at?: string | null
          currency?: string
          dispute_id?: string | null
          dispute_reason?: string | null
          expires_at?: string | null
          fee_percentage?: number | null
          funded_at?: string | null
          id?: string
          payee_id?: string
          payer_id?: string
          platform_fee?: number | null
          reference_id?: string
          refunded_at?: string | null
          release_approved_by?: string | null
          release_condition?: string | null
          release_notes?: string | null
          released_at?: string | null
          status?: string | null
          terms?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_contracts_payee_id_users_id_fk"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_contracts_payer_id_users_id_fk"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_contracts_release_approved_by_users_id_fk"
            columns: ["release_approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_milestones: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string | null
          deliverables: Json | null
          description: string | null
          due_date: string | null
          escrow_id: string
          id: string
          released_at: string | null
          review_notes: string | null
          status: string | null
          submitted_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          created_at?: string | null
          deliverables?: Json | null
          description?: string | null
          due_date?: string | null
          escrow_id: string
          id?: string
          released_at?: string | null
          review_notes?: string | null
          status?: string | null
          submitted_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string | null
          deliverables?: Json | null
          description?: string | null
          due_date?: string | null
          escrow_id?: string
          id?: string
          released_at?: string | null
          review_notes?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_milestones_escrow_id_escrow_contracts_id_fk"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_contracts"
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
      event_attendees: {
        Row: {
          event_id: string
          id: string
          registered_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      flagged_messages: {
        Row: {
          auto_detected: boolean | null
          confidence_score: number | null
          created_at: string | null
          description: string | null
          id: string
          message_id: string
          priority: string | null
          reason: string
          reporter_id: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          thread_id: string
          updated_at: string | null
        }
        Insert: {
          auto_detected?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          message_id: string
          priority?: string | null
          reason: string
          reporter_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          thread_id: string
          updated_at?: string | null
        }
        Update: {
          auto_detected?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          message_id?: string
          priority?: string | null
          reason?: string
          reporter_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          thread_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_flagged_messages_message"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_flagged_messages_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_flagged_messages_thread"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
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
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_users_id_fk"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_users_id_fk"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_detection_logs: {
        Row: {
          action_reason: string | null
          action_taken: string | null
          action_taken_at: string | null
          action_taken_by: string | null
          activity_log_id: string | null
          created_at: string | null
          detection_method: string
          flagged_actions: Json | null
          id: string
          patterns: Json | null
          review_notes: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_factors: Json | null
          risk_level: string
          risk_score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_reason?: string | null
          action_taken?: string | null
          action_taken_at?: string | null
          action_taken_by?: string | null
          activity_log_id?: string | null
          created_at?: string | null
          detection_method: string
          flagged_actions?: Json | null
          id?: string
          patterns?: Json | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_factors?: Json | null
          risk_level: string
          risk_score: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_reason?: string | null
          action_taken?: string | null
          action_taken_at?: string | null
          action_taken_by?: string | null
          activity_log_id?: string | null
          created_at?: string | null
          detection_method?: string
          flagged_actions?: Json | null
          id?: string
          patterns?: Json | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_factors?: Json | null
          risk_level?: string
          risk_score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fraud_detection_logs_action_taken_by_users_id_fk"
            columns: ["action_taken_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_detection_logs_activity_log_id_activity_logs_id_fk"
            columns: ["activity_log_id"]
            isOneToOne: false
            referencedRelation: "activity_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_detection_logs_reviewed_by_users_id_fk"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_detection_logs_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_disputes: {
        Row: {
          admin_notes: string | null
          against_user_id: string
          created_at: string | null
          description: string
          escrow_id: string | null
          evidence: string[] | null
          id: string
          project_id: string
          raised_by: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          against_user_id: string
          created_at?: string | null
          description: string
          escrow_id?: string | null
          evidence?: string[] | null
          id?: string
          project_id: string
          raised_by: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          against_user_id?: string
          created_at?: string | null
          description?: string
          escrow_id?: string | null
          evidence?: string[] | null
          id?: string
          project_id?: string
          raised_by?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freelance_disputes_against_user_id_users_id_fk"
            columns: ["against_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_disputes_escrow_id_freelance_escrow_id_fk"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "freelance_escrow"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_disputes_project_id_freelance_projects_id_fk"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "freelance_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_disputes_raised_by_users_id_fk"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_disputes_resolved_by_users_id_fk"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_escrow: {
        Row: {
          amount: number
          client_id: string
          contract_address: string | null
          created_at: string | null
          crypto_type: string
          dispute_id: string | null
          freelancer_id: string
          id: string
          locked_at: string | null
          project_id: string
          released_at: string | null
          status: string | null
          transaction_hash: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_id: string
          contract_address?: string | null
          created_at?: string | null
          crypto_type: string
          dispute_id?: string | null
          freelancer_id: string
          id?: string
          locked_at?: string | null
          project_id: string
          released_at?: string | null
          status?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          contract_address?: string | null
          created_at?: string | null
          crypto_type?: string
          dispute_id?: string | null
          freelancer_id?: string
          id?: string
          locked_at?: string | null
          project_id?: string
          released_at?: string | null
          status?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freelance_escrow_client_id_users_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_escrow_freelancer_id_users_id_fk"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_escrow_project_id_freelance_projects_id_fk"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "freelance_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_jobs: {
        Row: {
          applications_count: number | null
          attachments: string[] | null
          budget_amount: number | null
          budget_max: number | null
          budget_min: number | null
          budget_type: string
          category: string
          client_id: string
          created_at: string | null
          deadline: string | null
          description: string
          duration: string | null
          experience_level: string
          id: string
          skills: string[]
          status: string | null
          subcategory: string | null
          title: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          applications_count?: number | null
          attachments?: string[] | null
          budget_amount?: number | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type: string
          category: string
          client_id: string
          created_at?: string | null
          deadline?: string | null
          description: string
          duration?: string | null
          experience_level: string
          id?: string
          skills: string[]
          status?: string | null
          subcategory?: string | null
          title: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          applications_count?: number | null
          attachments?: string[] | null
          budget_amount?: number | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string
          category?: string
          client_id?: string
          created_at?: string | null
          deadline?: string | null
          description?: string
          duration?: string | null
          experience_level?: string
          id?: string
          skills?: string[]
          status?: string | null
          subcategory?: string | null
          title?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freelance_jobs_client_id_users_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_messages: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          project_id: string
          read: boolean | null
          sender_id: string
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          project_id: string
          read?: boolean | null
          sender_id: string
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          project_id?: string
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelance_messages_project_id_freelance_projects_id_fk"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "freelance_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_messages_sender_id_users_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_profiles: {
        Row: {
          availability: string | null
          certifications: Json | null
          completed_projects: number | null
          created_at: string | null
          education: Json | null
          experience_level: string | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          is_featured: boolean | null
          languages: Json | null
          overview: string | null
          portfolio_url: string | null
          preferred_project_size: string | null
          professional_title: string | null
          profile_completion: number | null
          repeat_clients: number | null
          response_time: string | null
          resume_url: string | null
          services_offered: Json | null
          success_rate: number | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string
          work_history: Json | null
        }
        Insert: {
          availability?: string | null
          certifications?: Json | null
          completed_projects?: number | null
          created_at?: string | null
          education?: Json | null
          experience_level?: string | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          is_featured?: boolean | null
          languages?: Json | null
          overview?: string | null
          portfolio_url?: string | null
          preferred_project_size?: string | null
          professional_title?: string | null
          profile_completion?: number | null
          repeat_clients?: number | null
          response_time?: string | null
          resume_url?: string | null
          services_offered?: Json | null
          success_rate?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id: string
          work_history?: Json | null
        }
        Update: {
          availability?: string | null
          certifications?: Json | null
          completed_projects?: number | null
          created_at?: string | null
          education?: Json | null
          experience_level?: string | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          is_featured?: boolean | null
          languages?: Json | null
          overview?: string | null
          portfolio_url?: string | null
          preferred_project_size?: string | null
          professional_title?: string | null
          profile_completion?: number | null
          repeat_clients?: number | null
          response_time?: string | null
          resume_url?: string | null
          services_offered?: Json | null
          success_rate?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string
          work_history?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "freelance_profiles_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_projects: {
        Row: {
          agreed_budget: number
          client_id: string
          created_at: string | null
          deadline: string | null
          end_date: string | null
          escrow_id: string | null
          freelancer_id: string
          id: string
          job_id: string
          paid_amount: number | null
          proposal_id: string
          remaining_amount: number
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agreed_budget: number
          client_id: string
          created_at?: string | null
          deadline?: string | null
          end_date?: string | null
          escrow_id?: string | null
          freelancer_id: string
          id?: string
          job_id: string
          paid_amount?: number | null
          proposal_id: string
          remaining_amount: number
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agreed_budget?: number
          client_id?: string
          created_at?: string | null
          deadline?: string | null
          end_date?: string | null
          escrow_id?: string | null
          freelancer_id?: string
          id?: string
          job_id?: string
          paid_amount?: number | null
          proposal_id?: string
          remaining_amount?: number
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freelance_projects_client_id_users_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_projects_freelancer_id_users_id_fk"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_projects_job_id_freelance_jobs_id_fk"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "freelance_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_projects_proposal_id_freelance_proposals_id_fk"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "freelance_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_proposals: {
        Row: {
          attachments: string[] | null
          cover_letter: string
          delivery_time: string
          freelancer_id: string
          id: string
          job_id: string
          milestones: Json | null
          proposed_amount: number
          proposed_rate_type: string
          responded_at: string | null
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          cover_letter: string
          delivery_time: string
          freelancer_id: string
          id?: string
          job_id: string
          milestones?: Json | null
          proposed_amount: number
          proposed_rate_type: string
          responded_at?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          cover_letter?: string
          delivery_time?: string
          freelancer_id?: string
          id?: string
          job_id?: string
          milestones?: Json | null
          proposed_amount?: number
          proposed_rate_type?: string
          responded_at?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freelance_proposals_freelancer_id_users_id_fk"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_proposals_job_id_freelance_jobs_id_fk"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "freelance_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_reviews: {
        Row: {
          comment: string | null
          communication_rating: number
          created_at: string | null
          id: string
          is_client_review: boolean
          overall_rating: number
          project_id: string
          quality_rating: number
          reviewee_id: string
          reviewer_id: string
          timeline_rating: number
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          communication_rating: number
          created_at?: string | null
          id?: string
          is_client_review: boolean
          overall_rating: number
          project_id: string
          quality_rating: number
          reviewee_id: string
          reviewer_id: string
          timeline_rating: number
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          communication_rating?: number
          created_at?: string | null
          id?: string
          is_client_review?: boolean
          overall_rating?: number
          project_id?: string
          quality_rating?: number
          reviewee_id?: string
          reviewer_id?: string
          timeline_rating?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freelance_reviews_project_id_freelance_projects_id_fk"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "freelance_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_reviews_reviewee_id_users_id_fk"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_reviews_reviewer_id_users_id_fk"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_skills: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
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
      freelance_user_skills: {
        Row: {
          created_at: string | null
          id: string
          is_verified: boolean | null
          proficiency_level: string
          skill_id: string
          user_id: string
          verified_at: string | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          proficiency_level: string
          skill_id: string
          user_id: string
          verified_at?: string | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          proficiency_level?: string
          skill_id?: string
          user_id?: string
          verified_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "freelance_user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "freelance_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_user_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      gift_transactions: {
        Row: {
          content_id: string | null
          created_at: string | null
          from_user_id: string
          gift_id: string
          id: string
          is_anonymous: boolean | null
          message: string | null
          quantity: number
          status: string | null
          to_user_id: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          from_user_id: string
          gift_id: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          quantity?: number
          status?: string | null
          to_user_id: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          from_user_id?: string
          gift_id?: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          quantity?: number
          status?: string | null
          to_user_id?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_transactions_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_transactions_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "virtual_gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_transactions_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      group_contributions: {
        Row: {
          created_at: string | null
          created_by: string | null
          currency: string
          description: string | null
          duration: unknown
          end_date: string | null
          escrow_contract_id: string | null
          group_id: string
          id: string
          platform_fee: number
          start_date: string | null
          status: string
          target_amount: number | null
          title: string
          total_contributed: number
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          currency?: string
          description?: string | null
          duration?: unknown
          end_date?: string | null
          escrow_contract_id?: string | null
          group_id: string
          id?: string
          platform_fee?: number
          start_date?: string | null
          status?: string
          target_amount?: number | null
          title: string
          total_contributed?: number
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          currency?: string
          description?: string | null
          duration?: unknown
          end_date?: string | null
          escrow_contract_id?: string | null
          group_id?: string
          id?: string
          platform_fee?: number
          start_date?: string | null
          status?: string
          target_amount?: number | null
          title?: string
          total_contributed?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_contributions_escrow_contract_id_fkey"
            columns: ["escrow_contract_id"]
            isOneToOne: false
            referencedRelation: "escrow_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_contributions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_contributors: {
        Row: {
          amount: number
          contributed_at: string | null
          contribution_id: string
          currency: string
          id: string
          payment_ref: string | null
          refunded: boolean | null
          refunded_at: string | null
          user_id: string
          wallet_tx_id: string | null
        }
        Insert: {
          amount: number
          contributed_at?: string | null
          contribution_id: string
          currency: string
          id?: string
          payment_ref?: string | null
          refunded?: boolean | null
          refunded_at?: string | null
          user_id: string
          wallet_tx_id?: string | null
        }
        Update: {
          amount?: number
          contributed_at?: string | null
          contribution_id?: string
          currency?: string
          id?: string
          payment_ref?: string | null
          refunded?: boolean | null
          refunded_at?: string | null
          user_id?: string
          wallet_tx_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_contributors_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "group_contributions"
            referencedColumns: ["id"]
          },
        ]
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
      group_vote_responses: {
        Row: {
          choice: string
          id: string
          timestamp: string | null
          user_id: string
          vote_id: string
        }
        Insert: {
          choice: string
          id?: string
          timestamp?: string | null
          user_id: string
          vote_id: string
        }
        Update: {
          choice?: string
          id?: string
          timestamp?: string | null
          user_id?: string
          vote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_vote_responses_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "group_votes"
            referencedColumns: ["id"]
          },
        ]
      }
      group_votes: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          group_id: string
          id: string
          options: Json
          required_percentage: number
          start_date: string | null
          topic: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          group_id: string
          id?: string
          options?: Json
          required_percentage?: number
          start_date?: string | null
          topic: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          group_id?: string
          id?: string
          options?: Json
          required_percentage?: number
          start_date?: string | null
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_votes_group_id_fkey"
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
      kyc_verifications: {
        Row: {
          completed_at: string | null
          created_at: string | null
          documents: Json | null
          id: string
          level: number
          provider: string
          review_notes: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string
          verification_data: Json | null
          verification_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          documents?: Json | null
          id?: string
          level: number
          provider: string
          review_notes?: string | null
          reviewed_by?: string | null
          status: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
          verification_data?: Json | null
          verification_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          documents?: Json | null
          id?: string
          level?: number
          provider?: string
          review_notes?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
          verification_data?: Json | null
          verification_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_verifications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      live_battles: {
        Row: {
          allow_betting: boolean | null
          battle_type: string
          bet_pool: number | null
          created_at: string | null
          creator1_id: string
          creator1_score: number | null
          creator2_id: string | null
          creator2_score: number | null
          description: string | null
          duration: number
          ended_at: string | null
          highlight_url: string | null
          id: string
          is_public: boolean | null
          is_recorded: boolean | null
          metadata: Json | null
          peak_viewers: number | null
          replay_url: string | null
          started_at: string | null
          status: string
          stream_url: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          total_bets: number | null
          total_gifts: number | null
          total_viewers: number | null
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          allow_betting?: boolean | null
          battle_type?: string
          bet_pool?: number | null
          created_at?: string | null
          creator1_id: string
          creator1_score?: number | null
          creator2_id?: string | null
          creator2_score?: number | null
          description?: string | null
          duration?: number
          ended_at?: string | null
          highlight_url?: string | null
          id?: string
          is_public?: boolean | null
          is_recorded?: boolean | null
          metadata?: Json | null
          peak_viewers?: number | null
          replay_url?: string | null
          started_at?: string | null
          status?: string
          stream_url?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          total_bets?: number | null
          total_gifts?: number | null
          total_viewers?: number | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          allow_betting?: boolean | null
          battle_type?: string
          bet_pool?: number | null
          created_at?: string | null
          creator1_id?: string
          creator1_score?: number | null
          creator2_id?: string | null
          creator2_score?: number | null
          description?: string | null
          duration?: number
          ended_at?: string | null
          highlight_url?: string | null
          id?: string
          is_public?: boolean | null
          is_recorded?: boolean | null
          metadata?: Json | null
          peak_viewers?: number | null
          replay_url?: string | null
          started_at?: string | null
          status?: string
          stream_url?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          total_bets?: number | null
          total_gifts?: number | null
          total_viewers?: number | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_battles_creator1_id_users_id_fk"
            columns: ["creator1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_battles_creator2_id_users_id_fk"
            columns: ["creator2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_battles_winner_id_users_id_fk"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      live_stream_viewers: {
        Row: {
          device_type: string | null
          id: string
          ip_address: string | null
          joined_at: string
          left_at: string | null
          stream_id: string
          user_id: string | null
          watch_duration: number | null
        }
        Insert: {
          device_type?: string | null
          id?: string
          ip_address?: string | null
          joined_at?: string
          left_at?: string | null
          stream_id: string
          user_id?: string | null
          watch_duration?: number | null
        }
        Update: {
          device_type?: string | null
          id?: string
          ip_address?: string | null
          joined_at?: string
          left_at?: string | null
          stream_id?: string
          user_id?: string | null
          watch_duration?: number | null
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
      marketplace_disputes: {
        Row: {
          against_user_id: string
          assigned_to: string | null
          closed_at: string | null
          created_at: string | null
          description: string
          disputed_amount: number | null
          evidence: Json | null
          id: string
          mediator_notes: string | null
          order_id: string
          priority: string | null
          raised_by: string
          reason: string
          requested_resolution: string | null
          resolution: string | null
          resolution_amount: number | null
          resolution_type: string | null
          resolved_at: string | null
          respond_by_date: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          against_user_id: string
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string | null
          description: string
          disputed_amount?: number | null
          evidence?: Json | null
          id?: string
          mediator_notes?: string | null
          order_id: string
          priority?: string | null
          raised_by: string
          reason: string
          requested_resolution?: string | null
          resolution?: string | null
          resolution_amount?: number | null
          resolution_type?: string | null
          resolved_at?: string | null
          respond_by_date?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          against_user_id?: string
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string
          disputed_amount?: number | null
          evidence?: Json | null
          id?: string
          mediator_notes?: string | null
          order_id?: string
          priority?: string | null
          raised_by?: string
          reason?: string
          requested_resolution?: string | null
          resolution?: string | null
          resolution_amount?: number | null
          resolution_type?: string | null
          resolved_at?: string | null
          respond_by_date?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_disputes_against_user_id_users_id_fk"
            columns: ["against_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_disputes_assigned_to_users_id_fk"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_disputes_order_id_marketplace_orders_id_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_disputes_raised_by_users_id_fk"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_orders: {
        Row: {
          actual_delivery: string | null
          admin_notes: string | null
          auto_complete_after_days: number | null
          billing_address: Json | null
          buyer_id: string
          cancelled_at: string | null
          chat_thread_id: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          customer_notes: string | null
          delivered_at: string | null
          discount: number | null
          discount_code: string | null
          dispute_id: string | null
          dispute_reason: string | null
          download_count: number | null
          download_expires_at: string | null
          download_limit: number | null
          download_urls: string[] | null
          escrow_id: string | null
          estimated_delivery: string | null
          fee_percentage: number | null
          fulfillment_status: string | null
          id: string
          items: Json
          order_number: string
          order_type: string | null
          payment_currency: string
          payment_method: string
          payment_status: string | null
          payment_transaction_id: string | null
          platform_fee: number | null
          processing_at: string | null
          refund_amount: number | null
          refunded_at: string | null
          requires_shipping: boolean | null
          return_reason: string | null
          return_requested: boolean | null
          return_requested_at: string | null
          return_status: string | null
          seller_id: string
          seller_notes: string | null
          seller_revenue: number | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          shipping_method: string | null
          status: string | null
          subtotal: number
          tax: number | null
          total: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery?: string | null
          admin_notes?: string | null
          auto_complete_after_days?: number | null
          billing_address?: Json | null
          buyer_id: string
          cancelled_at?: string | null
          chat_thread_id?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_notes?: string | null
          delivered_at?: string | null
          discount?: number | null
          discount_code?: string | null
          dispute_id?: string | null
          dispute_reason?: string | null
          download_count?: number | null
          download_expires_at?: string | null
          download_limit?: number | null
          download_urls?: string[] | null
          escrow_id?: string | null
          estimated_delivery?: string | null
          fee_percentage?: number | null
          fulfillment_status?: string | null
          id?: string
          items: Json
          order_number: string
          order_type?: string | null
          payment_currency: string
          payment_method: string
          payment_status?: string | null
          payment_transaction_id?: string | null
          platform_fee?: number | null
          processing_at?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          requires_shipping?: boolean | null
          return_reason?: string | null
          return_requested?: boolean | null
          return_requested_at?: string | null
          return_status?: string | null
          seller_id: string
          seller_notes?: string | null
          seller_revenue?: number | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string | null
          subtotal: number
          tax?: number | null
          total: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery?: string | null
          admin_notes?: string | null
          auto_complete_after_days?: number | null
          billing_address?: Json | null
          buyer_id?: string
          cancelled_at?: string | null
          chat_thread_id?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_notes?: string | null
          delivered_at?: string | null
          discount?: number | null
          discount_code?: string | null
          dispute_id?: string | null
          dispute_reason?: string | null
          download_count?: number | null
          download_expires_at?: string | null
          download_limit?: number | null
          download_urls?: string[] | null
          escrow_id?: string | null
          estimated_delivery?: string | null
          fee_percentage?: number | null
          fulfillment_status?: string | null
          id?: string
          items?: Json
          order_number?: string
          order_type?: string | null
          payment_currency?: string
          payment_method?: string
          payment_status?: string | null
          payment_transaction_id?: string | null
          platform_fee?: number | null
          processing_at?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          requires_shipping?: boolean | null
          return_reason?: string | null
          return_requested?: boolean | null
          return_requested_at?: string | null
          return_status?: string | null
          seller_id?: string
          seller_notes?: string | null
          seller_revenue?: number | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string | null
          subtotal?: number
          tax?: number | null
          total?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_buyer_id_users_id_fk"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_chat_thread_id_chat_threads_id_fk"
            columns: ["chat_thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_escrow_id_escrow_contracts_id_fk"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_payment_transaction_id_wallet_transactions_i"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_seller_id_users_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_profiles_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_reviews: {
        Row: {
          accuracy_rating: number | null
          comment: string
          communication_rating: number | null
          cons: string[] | null
          created_at: string | null
          delivery_rating: number | null
          flagged_reason: string | null
          helpful_votes: number | null
          helpfulness_score: number | null
          id: string
          images: string[] | null
          is_flagged: boolean | null
          is_verified_purchase: boolean | null
          metadata: Json | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: string | null
          order_id: string
          overall_rating: number
          product_id: string
          pros: string[] | null
          purchase_verified: boolean | null
          quality_rating: number | null
          quality_score: number | null
          report_count: number | null
          review_source: string | null
          reviewer_id: string
          reward_earned: number | null
          seller_id: string
          seller_response_id: string | null
          service_rating: number | null
          shipping_rating: number | null
          title: string | null
          total_votes: number | null
          updated_at: string | null
          use_case: string | null
          value_rating: number | null
          variant_purchased: string | null
          videos: string[] | null
          would_recommend: boolean | null
        }
        Insert: {
          accuracy_rating?: number | null
          comment: string
          communication_rating?: number | null
          cons?: string[] | null
          created_at?: string | null
          delivery_rating?: number | null
          flagged_reason?: string | null
          helpful_votes?: number | null
          helpfulness_score?: number | null
          id?: string
          images?: string[] | null
          is_flagged?: boolean | null
          is_verified_purchase?: boolean | null
          metadata?: Json | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          order_id: string
          overall_rating: number
          product_id: string
          pros?: string[] | null
          purchase_verified?: boolean | null
          quality_rating?: number | null
          quality_score?: number | null
          report_count?: number | null
          review_source?: string | null
          reviewer_id: string
          reward_earned?: number | null
          seller_id: string
          seller_response_id?: string | null
          service_rating?: number | null
          shipping_rating?: number | null
          title?: string | null
          total_votes?: number | null
          updated_at?: string | null
          use_case?: string | null
          value_rating?: number | null
          variant_purchased?: string | null
          videos?: string[] | null
          would_recommend?: boolean | null
        }
        Update: {
          accuracy_rating?: number | null
          comment?: string
          communication_rating?: number | null
          cons?: string[] | null
          created_at?: string | null
          delivery_rating?: number | null
          flagged_reason?: string | null
          helpful_votes?: number | null
          helpfulness_score?: number | null
          id?: string
          images?: string[] | null
          is_flagged?: boolean | null
          is_verified_purchase?: boolean | null
          metadata?: Json | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          order_id?: string
          overall_rating?: number
          product_id?: string
          pros?: string[] | null
          purchase_verified?: boolean | null
          quality_rating?: number | null
          quality_score?: number | null
          report_count?: number | null
          review_source?: string | null
          reviewer_id?: string
          reward_earned?: number | null
          seller_id?: string
          seller_response_id?: string | null
          service_rating?: number | null
          shipping_rating?: number | null
          title?: string | null
          total_votes?: number | null
          updated_at?: string | null
          use_case?: string | null
          value_rating?: number | null
          variant_purchased?: string | null
          videos?: string[] | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_moderated_by_users_id_fk"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_order_id_marketplace_orders_id_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_reviewer_id_users_id_fk"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_seller_id_users_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mentions: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          mentioned_id: string
          mentioner_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          mentioned_id: string
          mentioner_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          mentioned_id?: string
          mentioner_id?: string
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
      moderation_queue: {
        Row: {
          actions: Json | null
          assigned_to: string | null
          created_at: string | null
          description: string | null
          evidence: Json | null
          id: string
          priority: number | null
          reason: string
          reported_by: string | null
          resource_id: string
          resource_type: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actions?: Json | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          evidence?: Json | null
          id?: string
          priority?: number | null
          reason: string
          reported_by?: string | null
          resource_id: string
          resource_type: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actions?: Json | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          evidence?: Json | null
          id?: string
          priority?: number | null
          reason?: string
          reported_by?: string | null
          resource_id?: string
          resource_type?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_assigned_to_admin_users_id_fk"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_reported_by_users_id_fk"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_reviewed_by_admin_users_id_fk"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      monetized_content: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          content_id: string
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          is_monetized: boolean | null
          min_tip_amount: number | null
          monetization_type: string
          pay_per_view_price: number | null
          rejection_reason: string | null
          revenue_breakdown: Json | null
          subscription_count: number | null
          subscription_price: number | null
          tip_count: number | null
          title: string | null
          total_earnings: number | null
          total_soft_points: number | null
          total_tips: number | null
          total_views: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_monetized?: boolean | null
          min_tip_amount?: number | null
          monetization_type: string
          pay_per_view_price?: number | null
          rejection_reason?: string | null
          revenue_breakdown?: Json | null
          subscription_count?: number | null
          subscription_price?: number | null
          tip_count?: number | null
          title?: string | null
          total_earnings?: number | null
          total_soft_points?: number | null
          total_tips?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_monetized?: boolean | null
          min_tip_amount?: number | null
          monetization_type?: string
          pay_per_view_price?: number | null
          rejection_reason?: string | null
          revenue_breakdown?: Json | null
          subscription_count?: number | null
          subscription_price?: number | null
          tip_count?: number | null
          title?: string | null
          total_earnings?: number | null
          total_soft_points?: number | null
          total_tips?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monetized_content_approved_by_admin_users_id_fk"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monetized_content_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      music_library: {
        Row: {
          approved: boolean
          artist: string
          bpm: number | null
          copyright_free: boolean
          created_at: string
          duration: number
          file_url: string
          genre: string | null
          id: string
          key: string | null
          license_cost: number | null
          mood: string | null
          popularity_score: number
          tags: Json | null
          title: string
          waveform_data: Json | null
        }
        Insert: {
          approved?: boolean
          artist: string
          bpm?: number | null
          copyright_free?: boolean
          created_at?: string
          duration: number
          file_url: string
          genre?: string | null
          id?: string
          key?: string | null
          license_cost?: number | null
          mood?: string | null
          popularity_score?: number
          tags?: Json | null
          title: string
          waveform_data?: Json | null
        }
        Update: {
          approved?: boolean
          artist?: string
          bpm?: number | null
          copyright_free?: boolean
          created_at?: string
          duration?: number
          file_url?: string
          genre?: string | null
          id?: string
          key?: string | null
          license_cost?: number | null
          mood?: string | null
          popularity_score?: number
          tags?: Json | null
          title?: string
          waveform_data?: Json | null
        }
        Relationships: []
      }
      notification_analytics: {
        Row: {
          bounced: number
          campaign_id: string | null
          channel: string
          click_rate: number | null
          clicked: number
          cost: number | null
          created_at: string
          date: string
          delivered: number
          delivery_rate: number | null
          failed: number
          id: string
          notification_type: string | null
          open_rate: number | null
          opened: number
          sent: number
          unsubscribe_rate: number | null
          unsubscribed: number
        }
        Insert: {
          bounced?: number
          campaign_id?: string | null
          channel: string
          click_rate?: number | null
          clicked?: number
          cost?: number | null
          created_at?: string
          date: string
          delivered?: number
          delivery_rate?: number | null
          failed?: number
          id?: string
          notification_type?: string | null
          open_rate?: number | null
          opened?: number
          sent?: number
          unsubscribe_rate?: number | null
          unsubscribed?: number
        }
        Update: {
          bounced?: number
          campaign_id?: string | null
          channel?: string
          click_rate?: number | null
          clicked?: number
          cost?: number | null
          created_at?: string
          date?: string
          delivered?: number
          delivery_rate?: number | null
          failed?: number
          id?: string
          notification_type?: string | null
          open_rate?: number | null
          opened?: number
          sent?: number
          unsubscribe_rate?: number | null
          unsubscribed?: number
        }
        Relationships: []
      }
      notification_campaigns: {
        Row: {
          ab_test_config: Json | null
          ab_test_enabled: boolean | null
          approved_at: string | null
          approved_by: string | null
          clicked_count: number
          completed_at: string | null
          created_at: string
          created_by: string
          current_occurrence: number | null
          delivered_count: number
          description: string | null
          failed_count: number
          frequency: string | null
          id: string
          max_occurrences: number | null
          name: string
          opened_count: number
          priority: string | null
          scheduled_for: string | null
          sent_count: number
          started_at: string | null
          status: string
          target_audience: Json
          template_id: string
          total_recipients: number
          unsubscribed_count: number
          updated_at: string
        }
        Insert: {
          ab_test_config?: Json | null
          ab_test_enabled?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          clicked_count?: number
          completed_at?: string | null
          created_at?: string
          created_by: string
          current_occurrence?: number | null
          delivered_count?: number
          description?: string | null
          failed_count?: number
          frequency?: string | null
          id?: string
          max_occurrences?: number | null
          name: string
          opened_count?: number
          priority?: string | null
          scheduled_for?: string | null
          sent_count?: number
          started_at?: string | null
          status?: string
          target_audience: Json
          template_id: string
          total_recipients?: number
          unsubscribed_count?: number
          updated_at?: string
        }
        Update: {
          ab_test_config?: Json | null
          ab_test_enabled?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          clicked_count?: number
          completed_at?: string | null
          created_at?: string
          created_by?: string
          current_occurrence?: number | null
          delivered_count?: number
          description?: string | null
          failed_count?: number
          frequency?: string | null
          id?: string
          max_occurrences?: number | null
          name?: string
          opened_count?: number
          priority?: string | null
          scheduled_for?: string | null
          sent_count?: number
          started_at?: string | null
          status?: string
          target_audience?: Json
          template_id?: string
          total_recipients?: number
          unsubscribed_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          notification_type: string
          push_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          notification_type: string
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          notification_type?: string
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          body: string
          channel: string
          created_at: string
          created_by: string
          default_data: Json | null
          html_content: string | null
          id: string
          is_active: boolean
          language: string
          name: string
          subject: string | null
          title: string | null
          type: string
          updated_at: string
          variables: Json | null
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          body: string
          channel: string
          created_at?: string
          created_by: string
          default_data?: Json | null
          html_content?: string | null
          id?: string
          is_active?: boolean
          language?: string
          name: string
          subject?: string | null
          title?: string | null
          type: string
          updated_at?: string
          variables?: Json | null
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          body?: string
          channel?: string
          created_at?: string
          created_by?: string
          default_data?: Json | null
          html_content?: string | null
          id?: string
          is_active?: boolean
          language?: string
          name?: string
          subject?: string | null
          title?: string | null
          type?: string
          updated_at?: string
          variables?: Json | null
          version?: number
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
      order_status_logs: {
        Row: {
          changed_by: string
          changed_by_type: string
          created_at: string | null
          from_status: string | null
          id: string
          metadata: Json | null
          notes: string | null
          order_id: string
          reason: string | null
          to_status: string
        }
        Insert: {
          changed_by: string
          changed_by_type: string
          created_at?: string | null
          from_status?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id: string
          reason?: string | null
          to_status: string
        }
        Update: {
          changed_by?: string
          changed_by_type?: string
          created_at?: string | null
          from_status?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string
          reason?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_logs_changed_by_users_id_fk"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_logs_order_id_marketplace_orders_id_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
        ]
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
      p2p_disputes: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          created_at: string | null
          description: string
          evidence: Json | null
          id: string
          priority: string | null
          raised_by: string
          reason: string
          resolution: string | null
          resolution_type: string | null
          resolved_at: string | null
          status: string | null
          trade_id: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description: string
          evidence?: Json | null
          id?: string
          priority?: string | null
          raised_by: string
          reason: string
          resolution?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          status?: string | null
          trade_id: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          evidence?: Json | null
          id?: string
          priority?: string | null
          raised_by?: string
          reason?: string
          resolution?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          status?: string | null
          trade_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "p2p_disputes_assigned_to_users_id_fk"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_disputes_raised_by_users_id_fk"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_disputes_trade_id_p2p_trades_id_fk"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "p2p_trades"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "p2p_offers_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_trades: {
        Row: {
          amount: number
          buyer_id: string
          chat_thread_id: string | null
          completed_at: string | null
          created_at: string | null
          crypto_released_at: string | null
          crypto_type: string
          dispute_id: string | null
          escrow_address: string | null
          escrow_id: string | null
          escrow_tx_hash: string | null
          fee_percentage: number | null
          id: string
          offer_id: string
          payment_confirmed_at: string | null
          payment_confirmed_by: string | null
          payment_deadline: string | null
          payment_method: string
          payment_window: number | null
          platform_fee: number | null
          price_per_unit: number
          release_deadline: string | null
          seller_id: string
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          chat_thread_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          crypto_released_at?: string | null
          crypto_type: string
          dispute_id?: string | null
          escrow_address?: string | null
          escrow_id?: string | null
          escrow_tx_hash?: string | null
          fee_percentage?: number | null
          id?: string
          offer_id: string
          payment_confirmed_at?: string | null
          payment_confirmed_by?: string | null
          payment_deadline?: string | null
          payment_method: string
          payment_window?: number | null
          platform_fee?: number | null
          price_per_unit: number
          release_deadline?: string | null
          seller_id: string
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          chat_thread_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          crypto_released_at?: string | null
          crypto_type?: string
          dispute_id?: string | null
          escrow_address?: string | null
          escrow_id?: string | null
          escrow_tx_hash?: string | null
          fee_percentage?: number | null
          id?: string
          offer_id?: string
          payment_confirmed_at?: string | null
          payment_confirmed_by?: string | null
          payment_deadline?: string | null
          payment_method?: string
          payment_window?: number | null
          platform_fee?: number | null
          price_per_unit?: number
          release_deadline?: string | null
          seller_id?: string
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "p2p_trades_buyer_id_users_id_fk"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_trades_chat_thread_id_chat_threads_id_fk"
            columns: ["chat_thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_trades_escrow_id_escrow_contracts_id_fk"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_trades_offer_id_p2p_offers_id_fk"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "p2p_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_trades_payment_confirmed_by_users_id_fk"
            columns: ["payment_confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_trades_seller_id_users_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      page_follows: {
        Row: {
          created_at: string
          id: string
          notifications_enabled: boolean
          page_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notifications_enabled?: boolean
          page_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notifications_enabled?: boolean
          page_id?: string
          user_id?: string
        }
        Relationships: []
      }
      page_reviews: {
        Row: {
          created_at: string
          helpful: number
          id: string
          images: Json | null
          page_id: string
          rating: number
          responded_at: string | null
          response: string | null
          review: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          helpful?: number
          id?: string
          images?: Json | null
          page_id: string
          rating: number
          responded_at?: string | null
          response?: string | null
          review?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          helpful?: number
          id?: string
          images?: Json | null
          page_id?: string
          rating?: number
          responded_at?: string | null
          response?: string | null
          review?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
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
      platform_earnings: {
        Row: {
          created_at: string | null
          currency: string
          description: string | null
          earned_at: string | null
          exchange_rate: number | null
          fee_amount: number
          fee_percentage: number
          gross_amount: number
          id: string
          metadata: Json | null
          reference_id: string
          source_type: string
          usd_amount: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency: string
          description?: string | null
          earned_at?: string | null
          exchange_rate?: number | null
          fee_amount: number
          fee_percentage: number
          gross_amount: number
          id?: string
          metadata?: Json | null
          reference_id: string
          source_type: string
          usd_amount?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          description?: string | null
          earned_at?: string | null
          exchange_rate?: number | null
          fee_amount?: number
          fee_percentage?: number
          gross_amount?: number
          id?: string
          metadata?: Json | null
          reference_id?: string
          source_type?: string
          usd_amount?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_earnings_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          last_modified_by: string | null
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          last_modified_by?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          last_modified_by?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_platform_settings_last_modified_by"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_settings_last_modified_by_users_id_fk"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_items: {
        Row: {
          added_by: string
          created_at: string
          id: string
          playlist_id: string
          position: number
          video_id: string
        }
        Insert: {
          added_by: string
          created_at?: string
          id?: string
          playlist_id: string
          position: number
          video_id: string
        }
        Update: {
          added_by?: string
          created_at?: string
          id?: string
          playlist_id?: string
          position?: number
          video_id?: string
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
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_with_profiles"
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
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_with_profiles"
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
          location: string | null
          media_urls: Json | null
          privacy: string
          eloity_points: number | null
          tagged_users: string[] | null
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
          location?: string | null
          media_urls?: Json | null
          privacy?: string
          eloity_points?: number | null
          tagged_users?: string[] | null
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
          location?: string | null
          media_urls?: Json | null
          privacy?: string
          eloity_points?: number | null
          tagged_users?: string[] | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_benefits: {
        Row: {
          benefit: string
          created_at: string | null
          id: string
          is_active: boolean | null
          tier: string
          value: string | null
        }
        Insert: {
          benefit: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          tier: string
          value?: string | null
        }
        Update: {
          benefit?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          tier?: string
          value?: string | null
        }
        Relationships: []
      }
      premium_subscriptions: {
        Row: {
          billing_type: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          currency: string | null
          end_date: string
          fee_discount_percentage: number | null
          id: string
          last_payment_at: string | null
          monthly_boost_credits: number | null
          next_billing_date: string | null
          payment_failures: number | null
          price: number
          start_date: string
          status: string | null
          tier: string
          updated_at: string | null
          used_boost_credits: number | null
          user_id: string
        }
        Insert: {
          billing_type: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          end_date: string
          fee_discount_percentage?: number | null
          id?: string
          last_payment_at?: string | null
          monthly_boost_credits?: number | null
          next_billing_date?: string | null
          payment_failures?: number | null
          price: number
          start_date: string
          status?: string | null
          tier: string
          updated_at?: string | null
          used_boost_credits?: number | null
          user_id: string
        }
        Update: {
          billing_type?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string
          fee_discount_percentage?: number | null
          id?: string
          last_payment_at?: string | null
          monthly_boost_credits?: number | null
          next_billing_date?: string | null
          payment_failures?: number | null
          price?: number
          start_date?: string
          status?: string | null
          tier?: string
          updated_at?: string | null
          used_boost_credits?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_subscriptions_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "product_analytics_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_boosts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          boost_type: string
          clicks: number | null
          conversion_value: number | null
          conversions: number | null
          cost: number
          created_at: string | null
          currency: string
          duration: number
          end_date: string | null
          id: string
          impressions: number | null
          payment_method: string
          product_id: string
          rejection_reason: string | null
          requires_approval: boolean | null
          roi: number | null
          start_date: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          boost_type: string
          clicks?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cost: number
          created_at?: string | null
          currency: string
          duration: number
          end_date?: string | null
          id?: string
          impressions?: number | null
          payment_method: string
          product_id: string
          rejection_reason?: string | null
          requires_approval?: boolean | null
          roi?: number | null
          start_date?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          boost_type?: string
          clicks?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cost?: number
          created_at?: string | null
          currency?: string
          duration?: number
          end_date?: string | null
          id?: string
          impressions?: number | null
          payment_method?: string
          product_id?: string
          rejection_reason?: string | null
          requires_approval?: boolean | null
          roi?: number | null
          start_date?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_boosts_approved_by_users_id_fk"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_boosts_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_boosts_transaction_id_wallet_transactions_id_fk"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_boosts_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          image: string | null
          is_active: boolean | null
          is_featured: boolean | null
          level: number | null
          name: string
          parent_id: string | null
          path: string | null
          product_count: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          level?: number | null
          name: string
          parent_id?: string | null
          path?: string | null
          product_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          level?: number | null
          name?: string
          parent_id?: string | null
          path?: string | null
          product_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_product_categories_id_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_price_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          discount_percentage: number | null
          discount_price: number | null
          effective_from: string
          effective_to: string | null
          id: string
          price: number
          product_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          discount_price?: number | null
          effective_from: string
          effective_to?: string | null
          id?: string
          price: number
          product_id: string
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          discount_price?: number | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          price?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_price_history_changed_by_users_id_fk"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_price_history_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_recommendations: {
        Row: {
          algorithm: string
          clicked: boolean | null
          clicked_at: string | null
          confidence: number
          context: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          purchased: boolean | null
          purchased_at: string | null
          recommended_product_id: string
          shown: boolean | null
          shown_at: string | null
          source_product_id: string | null
          user_id: string
        }
        Insert: {
          algorithm: string
          clicked?: boolean | null
          clicked_at?: string | null
          confidence: number
          context?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          purchased?: boolean | null
          purchased_at?: string | null
          recommended_product_id: string
          shown?: boolean | null
          shown_at?: string | null
          source_product_id?: string | null
          user_id: string
        }
        Update: {
          algorithm?: string
          clicked?: boolean | null
          clicked_at?: string | null
          confidence?: number
          context?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          purchased?: boolean | null
          purchased_at?: string | null
          recommended_product_id?: string
          shown?: boolean | null
          shown_at?: string | null
          source_product_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_recommendations_recommended_product_id_products_id_fk"
            columns: ["recommended_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recommendations_source_product_id_products_id_fk"
            columns: ["source_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recommendations_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json
          created_at: string | null
          id: string
          images: string[] | null
          in_stock: boolean | null
          is_active: boolean | null
          name: string
          price_adjustment: number | null
          product_id: string
          sku: string | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          attributes: Json
          created_at?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_active?: boolean | null
          name: string
          price_adjustment?: number | null
          product_id: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          attributes?: Json
          created_at?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_active?: boolean | null
          name?: string
          price_adjustment?: number | null
          product_id?: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          boost_until: string | null
          category: string | null
          created_at: string
          currency: string | null
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
          title: string | null
          updated_at: string
        }
        Insert: {
          boost_until?: string | null
          category?: string | null
          created_at?: string
          currency?: string | null
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
          title?: string | null
          updated_at?: string
        }
        Update: {
          boost_until?: string | null
          category?: string | null
          created_at?: string
          currency?: string | null
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
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_users_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
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
          email?: string | null
          full_name?: string | null
          id?: string
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
          email?: string | null
          full_name?: string | null
          id?: string
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
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string | null
          id: string
          milestone_id: string | null
          name: string
          project_id: string
          size: number
          type: string
          uploaded_by: string
          url: string
          version: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          name: string
          project_id: string
          size: number
          type: string
          uploaded_by: string
          url: string
          version?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          name?: string
          project_id?: string
          size?: number
          type?: string
          uploaded_by?: string
          url?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_milestone_id_project_milestones_id_fk"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_project_id_freelance_projects_id_fk"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "freelance_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploaded_by_users_id_fk"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string | null
          deliverables: string[] | null
          description: string
          due_date: string
          id: string
          project_id: string
          status: string | null
          submitted_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          created_at?: string | null
          deliverables?: string[] | null
          description: string
          due_date: string
          id?: string
          project_id: string
          status?: string | null
          submitted_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string | null
          deliverables?: string[] | null
          description?: string
          due_date?: string
          id?: string
          project_id?: string
          status?: string | null
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_freelance_projects_id_fk"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "freelance_projects"
            referencedColumns: ["id"]
          },
        ]
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
      push_notifications: {
        Row: {
          badge: number | null
          body: string
          click_action: string | null
          clicked_at: string | null
          collapse_key: string | null
          created_at: string
          data: Json | null
          delivered_at: string | null
          device_token: string
          error_message: string | null
          icon: string | null
          id: string
          image: string | null
          max_retries: number
          notification_id: string
          platform: string
          priority: string | null
          retry_count: number
          sent_at: string | null
          sound: string | null
          status: string
          title: string
          ttl: number | null
        }
        Insert: {
          badge?: number | null
          body: string
          click_action?: string | null
          clicked_at?: string | null
          collapse_key?: string | null
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          device_token: string
          error_message?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          max_retries?: number
          notification_id: string
          platform: string
          priority?: string | null
          retry_count?: number
          sent_at?: string | null
          sound?: string | null
          status?: string
          title: string
          ttl?: number | null
        }
        Update: {
          badge?: number | null
          body?: string
          click_action?: string | null
          clicked_at?: string | null
          collapse_key?: string | null
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          device_token?: string
          error_message?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          max_retries?: number
          notification_id?: string
          platform?: string
          priority?: string | null
          retry_count?: number
          sent_at?: string | null
          sound?: string | null
          status?: string
          title?: string
          ttl?: number | null
        }
        Relationships: []
      }
      referral_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          paid_at: string | null
          processed_at: string | null
          referee_id: string | null
          referee_reward: number | null
          referral_link_id: string
          referrer_id: string
          referrer_reward: number | null
          referrer_url: string | null
          reward_status: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          paid_at?: string | null
          processed_at?: string | null
          referee_id?: string | null
          referee_reward?: number | null
          referral_link_id: string
          referrer_id: string
          referrer_reward?: number | null
          referrer_url?: string | null
          reward_status?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          paid_at?: string | null
          processed_at?: string | null
          referee_id?: string | null
          referee_reward?: number | null
          referral_link_id?: string
          referrer_id?: string
          referrer_reward?: number | null
          referrer_url?: string | null
          reward_status?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_events_referee_id_users_id_fk"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_events_referral_link_id_referral_links_id_fk"
            columns: ["referral_link_id"]
            isOneToOne: false
            referencedRelation: "referral_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_events_referrer_id_users_id_fk"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_links: {
        Row: {
          campaign_id: string | null
          click_count: number | null
          conversion_count: number | null
          created_at: string | null
          current_uses: number | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          metadata: Json | null
          referee_reward: number | null
          referral_code: string
          referral_url: string
          referrer_id: string
          referrer_reward: number | null
          revenue_share_percentage: number | null
          signup_count: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          metadata?: Json | null
          referee_reward?: number | null
          referral_code: string
          referral_url: string
          referrer_id: string
          referrer_reward?: number | null
          revenue_share_percentage?: number | null
          signup_count?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          metadata?: Json | null
          referee_reward?: number | null
          referral_code?: string
          referral_url?: string
          referrer_id?: string
          referrer_reward?: number | null
          revenue_share_percentage?: number | null
          signup_count?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_links_referrer_id_users_id_fk"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_history: {
        Row: {
          amount: number
          content_id: string | null
          created_at: string | null
          currency: string
          description: string | null
          from_user_id: string | null
          id: string
          metadata: Json | null
          net_amount: number
          platform_fee: number | null
          soft_points_change: number | null
          source_details: Json | null
          to_user_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          content_id?: string | null
          created_at?: string | null
          currency: string
          description?: string | null
          from_user_id?: string | null
          id?: string
          metadata?: Json | null
          net_amount: number
          platform_fee?: number | null
          soft_points_change?: number | null
          source_details?: Json | null
          to_user_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          content_id?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          from_user_id?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number
          platform_fee?: number | null
          soft_points_change?: number | null
          source_details?: Json | null
          to_user_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_history_from_user_id_users_id_fk"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_history_to_user_id_users_id_fk"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_history_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      review_helpfulness: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpfulness_review_id_marketplace_reviews_id_fk"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "marketplace_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_helpfulness_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          created_at: string | null
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: string | null
          response: string
          review_id: string
          seller_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          response: string
          review_id: string
          seller_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          response?: string
          review_id?: string
          seller_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_moderated_by_users_id_fk"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_review_id_marketplace_reviews_id_fk"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "marketplace_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_seller_id_users_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      reward_rules: {
        Row: {
          action_type: string
          active_from: string | null
          active_to: string | null
          base_soft_points: number | null
          base_wallet_bonus: number | null
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          daily_limit: number | null
          decay_enabled: boolean | null
          decay_rate: number | null
          decay_start: number | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          last_modified_by: string | null
          min_multiplier: number | null
          minimum_trust_score: number | null
          minimum_value: number | null
          monthly_limit: number | null
          quality_threshold: number | null
          requires_moderation: boolean | null
          updated_at: string | null
          weekly_limit: number | null
        }
        Insert: {
          action_type: string
          active_from?: string | null
          active_to?: string | null
          base_soft_points?: number | null
          base_wallet_bonus?: number | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          daily_limit?: number | null
          decay_enabled?: boolean | null
          decay_rate?: number | null
          decay_start?: number | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          last_modified_by?: string | null
          min_multiplier?: number | null
          minimum_trust_score?: number | null
          minimum_value?: number | null
          monthly_limit?: number | null
          quality_threshold?: number | null
          requires_moderation?: boolean | null
          updated_at?: string | null
          weekly_limit?: number | null
        }
        Update: {
          action_type?: string
          active_from?: string | null
          active_to?: string | null
          base_soft_points?: number | null
          base_wallet_bonus?: number | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          daily_limit?: number | null
          decay_enabled?: boolean | null
          decay_rate?: number | null
          decay_start?: number | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          last_modified_by?: string | null
          min_multiplier?: number | null
          minimum_trust_score?: number | null
          minimum_value?: number | null
          monthly_limit?: number | null
          quality_threshold?: number | null
          requires_moderation?: boolean | null
          updated_at?: string | null
          weekly_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_rules_created_by_users_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_rules_last_modified_by_users_id_fk"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_transactions: {
        Row: {
          amount: number
          base_amount: number | null
          bonus_reason: string | null
          created_at: string | null
          description: string
          id: string
          multiplier: number | null
          processed_at: string | null
          source_id: string | null
          source_type: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          base_amount?: number | null
          bonus_reason?: string | null
          created_at?: string | null
          description: string
          id?: string
          multiplier?: number | null
          processed_at?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          base_amount?: number | null
          bonus_reason?: string | null
          created_at?: string | null
          description?: string
          id?: string
          multiplier?: number | null
          processed_at?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_transactions_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_analytics: {
        Row: {
          active_products: number | null
          analytics_date: string
          average_order_value: number | null
          average_rating: number | null
          average_response_time: number | null
          average_shipping_time: number | null
          boost_roi: number | null
          conversion_rate: number | null
          created_at: string | null
          customer_retention_rate: number | null
          dispute_resolution_rate: number | null
          id: string
          on_time_delivery_rate: number | null
          out_of_stock_products: number | null
          period: string
          positive_review_rate: number | null
          repeat_customers: number | null
          response_rate: number | null
          seller_id: string
          total_boosts: number | null
          total_clicks: number | null
          total_disputes: number | null
          total_orders: number | null
          total_products: number | null
          total_revenue: number | null
          total_reviews: number | null
          total_units_sold: number | null
          total_views: number | null
          unique_customers: number | null
        }
        Insert: {
          active_products?: number | null
          analytics_date: string
          average_order_value?: number | null
          average_rating?: number | null
          average_response_time?: number | null
          average_shipping_time?: number | null
          boost_roi?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          customer_retention_rate?: number | null
          dispute_resolution_rate?: number | null
          id?: string
          on_time_delivery_rate?: number | null
          out_of_stock_products?: number | null
          period: string
          positive_review_rate?: number | null
          repeat_customers?: number | null
          response_rate?: number | null
          seller_id: string
          total_boosts?: number | null
          total_clicks?: number | null
          total_disputes?: number | null
          total_orders?: number | null
          total_products?: number | null
          total_revenue?: number | null
          total_reviews?: number | null
          total_units_sold?: number | null
          total_views?: number | null
          unique_customers?: number | null
        }
        Update: {
          active_products?: number | null
          analytics_date?: string
          average_order_value?: number | null
          average_rating?: number | null
          average_response_time?: number | null
          average_shipping_time?: number | null
          boost_roi?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          customer_retention_rate?: number | null
          dispute_resolution_rate?: number | null
          id?: string
          on_time_delivery_rate?: number | null
          out_of_stock_products?: number | null
          period?: string
          positive_review_rate?: number | null
          repeat_customers?: number | null
          response_rate?: number | null
          seller_id?: string
          total_boosts?: number | null
          total_clicks?: number | null
          total_disputes?: number | null
          total_orders?: number | null
          total_products?: number | null
          total_revenue?: number | null
          total_reviews?: number | null
          total_units_sold?: number | null
          total_views?: number | null
          unique_customers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_analytics_seller_id_users_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_scores: {
        Row: {
          badges: string[] | null
          calculated_at: string | null
          communication_score: number | null
          created_at: string | null
          delivery_score: number | null
          factors: Json | null
          id: string
          next_calculation_date: string | null
          overall_score: number
          previous_score: number | null
          quality_score: number | null
          score_change: number | null
          seller_id: string
          service_score: number | null
          tier: string | null
        }
        Insert: {
          badges?: string[] | null
          calculated_at?: string | null
          communication_score?: number | null
          created_at?: string | null
          delivery_score?: number | null
          factors?: Json | null
          id?: string
          next_calculation_date?: string | null
          overall_score: number
          previous_score?: number | null
          quality_score?: number | null
          score_change?: number | null
          seller_id: string
          service_score?: number | null
          tier?: string | null
        }
        Update: {
          badges?: string[] | null
          calculated_at?: string | null
          communication_score?: number | null
          created_at?: string | null
          delivery_score?: number | null
          factors?: Json | null
          id?: string
          next_calculation_date?: string | null
          overall_score?: number
          previous_score?: number | null
          quality_score?: number | null
          score_change?: number | null
          seller_id?: string
          service_score?: number | null
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_scores_seller_id_users_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_carts: {
        Row: {
          created_at: string | null
          id: string
          session_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_carts_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_logs: {
        Row: {
          delivered_at: string | null
          id: string
          message: string
          provider: string
          provider_response: Json | null
          sent_at: string | null
          status: string
          template_id: string | null
          to_number: string
          user_id: string | null
        }
        Insert: {
          delivered_at?: string | null
          id?: string
          message: string
          provider: string
          provider_response?: Json | null
          sent_at?: string | null
          status: string
          template_id?: string | null
          to_number: string
          user_id?: string | null
        }
        Update: {
          delivered_at?: string | null
          id?: string
          message?: string
          provider?: string
          provider_response?: Json | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
          to_number?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "sms_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_notifications: {
        Row: {
          clicked_at: string | null
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          max_retries: number
          message: string
          message_type: string | null
          notification_id: string
          phone_number: string
          provider: string | null
          provider_id: string | null
          retry_count: number
          segments: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          clicked_at?: string | null
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number
          message: string
          message_type?: string | null
          notification_id: string
          phone_number: string
          provider?: string | null
          provider_id?: string | null
          retry_count?: number
          segments?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          clicked_at?: string | null
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number
          message?: string
          message_type?: string | null
          notification_id?: string
          phone_number?: string
          provider?: string | null
          provider_id?: string | null
          retry_count?: number
          segments?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      sms_providers: {
        Row: {
          api_key_encrypted: string | null
          api_secret_encrypted: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          provider_type: string
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          provider_type: string
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          provider_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sms_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          allow_comments: boolean
          comment_count: number
          content: string | null
          created_at: string
          edited: boolean | null
          group_id: string | null
          hashtags: Json | null
          id: string
          impression_count: number
          like_count: number
          link_data: Json | null
          location: string | null
          media_urls: Json | null
          mentions: Json | null
          metadata: Json | null
          original_post_id: string | null
          page_id: string | null
          pinned: boolean | null
          poll_data: Json | null
          reach_count: number
          scheduled_for: string | null
          share_count: number
          type: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          allow_comments?: boolean
          comment_count?: number
          content?: string | null
          created_at?: string
          edited?: boolean | null
          group_id?: string | null
          hashtags?: Json | null
          id?: string
          impression_count?: number
          like_count?: number
          link_data?: Json | null
          location?: string | null
          media_urls?: Json | null
          mentions?: Json | null
          metadata?: Json | null
          original_post_id?: string | null
          page_id?: string | null
          pinned?: boolean | null
          poll_data?: Json | null
          reach_count?: number
          scheduled_for?: string | null
          share_count?: number
          type?: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          allow_comments?: boolean
          comment_count?: number
          content?: string | null
          created_at?: string
          edited?: boolean | null
          group_id?: string | null
          hashtags?: Json | null
          id?: string
          impression_count?: number
          like_count?: number
          link_data?: Json | null
          location?: string | null
          media_urls?: Json | null
          mentions?: Json | null
          metadata?: Json | null
          original_post_id?: string | null
          page_id?: string | null
          pinned?: boolean | null
          poll_data?: Json | null
          reach_count?: number
          scheduled_for?: string | null
          share_count?: number
          type?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      soft_points_log: {
        Row: {
          amount: number
          balance_after: number
          calculation_rule: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          multiplier: number | null
          source_id: string | null
          source_type: string
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          calculation_rule?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          multiplier?: number | null
          source_id?: string | null
          source_type: string
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          calculation_rule?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          multiplier?: number | null
          source_id?: string | null
          source_type?: string
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "soft_points_log_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          allow_replies: boolean
          allow_screenshot: boolean
          background_color: string | null
          content: string | null
          created_at: string
          duration: number | null
          expires_at: string
          font: string | null
          hashtags: Json | null
          highlighted: boolean | null
          id: string
          like_count: number
          location: string | null
          media_url: string | null
          mentions: Json | null
          music: string | null
          reply_count: number
          text_color: string | null
          type: string
          user_id: string
          view_count: number
        }
        Insert: {
          allow_replies?: boolean
          allow_screenshot?: boolean
          background_color?: string | null
          content?: string | null
          created_at?: string
          duration?: number | null
          expires_at?: string
          font?: string | null
          hashtags?: Json | null
          highlighted?: boolean | null
          id?: string
          like_count?: number
          location?: string | null
          media_url?: string | null
          mentions?: Json | null
          music?: string | null
          reply_count?: number
          text_color?: string | null
          type?: string
          user_id: string
          view_count?: number
        }
        Update: {
          allow_replies?: boolean
          allow_screenshot?: boolean
          background_color?: string | null
          content?: string | null
          created_at?: string
          duration?: number | null
          expires_at?: string
          font?: string | null
          hashtags?: Json | null
          highlighted?: boolean | null
          id?: string
          like_count?: number
          location?: string | null
          media_url?: string | null
          mentions?: Json | null
          music?: string | null
          reply_count?: number
          text_color?: string | null
          type?: string
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      story_likes: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          story_id?: string
          user_id?: string
        }
        Relationships: []
      }
      story_replies: {
        Row: {
          content: string | null
          created_at: string
          id: string
          media_url: string | null
          story_id: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          story_id: string
          type?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          story_id?: string
          type?: string
          user_id?: string
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
      subscriptions: {
        Row: {
          access_level: string | null
          auto_renew: boolean | null
          benefits: Json | null
          billing_cycle: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string | null
          creator_id: string
          currency: string | null
          end_date: string | null
          id: string
          last_payment_attempt: string | null
          last_payment_date: string | null
          next_billing_date: string | null
          payment_failures: number | null
          price: number
          renewal_attempts: number | null
          start_date: string | null
          status: string | null
          subscriber_id: string
          tier: string
          total_paid: number | null
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          auto_renew?: boolean | null
          benefits?: Json | null
          billing_cycle?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          creator_id: string
          currency?: string | null
          end_date?: string | null
          id?: string
          last_payment_attempt?: string | null
          last_payment_date?: string | null
          next_billing_date?: string | null
          payment_failures?: number | null
          price: number
          renewal_attempts?: number | null
          start_date?: string | null
          status?: string | null
          subscriber_id: string
          tier: string
          total_paid?: number | null
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          auto_renew?: boolean | null
          benefits?: Json | null
          billing_cycle?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          creator_id?: string
          currency?: string | null
          end_date?: string | null
          id?: string
          last_payment_attempt?: string | null
          last_payment_date?: string | null
          next_billing_date?: string | null
          payment_failures?: number | null
          price?: number
          renewal_attempts?: number | null
          start_date?: string | null
          status?: string | null
          subscriber_id?: string
          tier?: string
          total_paid?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_cancelled_by_users_id_fk"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_creator_id_users_id_fk"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_subscriber_id_users_id_fk"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_editable: boolean | null
          is_public: boolean | null
          key: string
          last_modified_by: string | null
          modified_at: string | null
          required_permission: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_editable?: boolean | null
          is_public?: boolean | null
          key: string
          last_modified_by?: string | null
          modified_at?: string | null
          required_permission?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_editable?: boolean | null
          is_public?: boolean | null
          key?: string
          last_modified_by?: string | null
          modified_at?: string | null
          required_permission?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_last_modified_by_admin_users_id_fk"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
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
      tip_transactions: {
        Row: {
          amount: number
          content_id: string | null
          created_at: string | null
          currency: string | null
          from_user_id: string
          id: string
          is_anonymous: boolean | null
          message: string | null
          status: string | null
          to_user_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          content_id?: string | null
          created_at?: string | null
          currency?: string | null
          from_user_id: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          status?: string | null
          to_user_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          content_id?: string | null
          created_at?: string | null
          currency?: string | null
          from_user_id?: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          status?: string | null
          to_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tip_transactions_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tip_transactions_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "trades_buyer_id_users_id_fk"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "p2p_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_offer_id_p2p_offers_id_fk"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "p2p_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_seller_id_users_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      trust_scores: {
        Row: {
          consistency_score: number | null
          created_at: string | null
          current_score: number | null
          daily_soft_points_cap: number | null
          diversity_score: number | null
          freeze_reason: string | null
          frozen_until: string | null
          id: string
          is_frozen: boolean | null
          last_calculated_at: string | null
          last_suspicious_activity: string | null
          max_score: number | null
          next_calculation_at: string | null
          previous_score: number | null
          reward_multiplier: number | null
          score_history: Json | null
          suspicious_activity_count: number | null
          total_activities: number | null
          trust_level: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consistency_score?: number | null
          created_at?: string | null
          current_score?: number | null
          daily_soft_points_cap?: number | null
          diversity_score?: number | null
          freeze_reason?: string | null
          frozen_until?: string | null
          id?: string
          is_frozen?: boolean | null
          last_calculated_at?: string | null
          last_suspicious_activity?: string | null
          max_score?: number | null
          next_calculation_at?: string | null
          previous_score?: number | null
          reward_multiplier?: number | null
          score_history?: Json | null
          suspicious_activity_count?: number | null
          total_activities?: number | null
          trust_level?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consistency_score?: number | null
          created_at?: string | null
          current_score?: number | null
          daily_soft_points_cap?: number | null
          diversity_score?: number | null
          freeze_reason?: string | null
          frozen_until?: string | null
          id?: string
          is_frozen?: boolean | null
          last_calculated_at?: string | null
          last_suspicious_activity?: string | null
          max_score?: number | null
          next_calculation_at?: string | null
          previous_score?: number | null
          reward_multiplier?: number | null
          score_history?: Json | null
          suspicious_activity_count?: number | null
          total_activities?: number | null
          trust_level?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_scores_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      unsubscribe_records: {
        Row: {
          comment: string | null
          created_at: string
          email: string | null
          id: string
          ip_address: string | null
          notification_type: string | null
          phone_number: string | null
          reason: string | null
          source: string | null
          token: string | null
          unsubscribe_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          notification_type?: string | null
          phone_number?: string | null
          reason?: string | null
          source?: string | null
          token?: string | null
          unsubscribe_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          notification_type?: string | null
          phone_number?: string | null
          reason?: string | null
          source?: string | null
          token?: string | null
          unsubscribe_type?: string
          user_agent?: string | null
          user_id?: string | null
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
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      user_boosts: {
        Row: {
          activated_at: string | null
          boost_data: Json | null
          boost_item_id: string
          created_at: string | null
          currency: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_usage: number | null
          payment_method: string
          price_paid: number
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          boost_data?: Json | null
          boost_item_id: string
          created_at?: string | null
          currency: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_usage?: number | null
          payment_method: string
          price_paid: number
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          boost_data?: Json | null
          boost_item_id?: string
          created_at?: string | null
          currency?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_usage?: number | null
          payment_method?: string
          price_paid?: number
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_boosts_boost_item_id_boost_shop_items_id_fk"
            columns: ["boost_item_id"]
            isOneToOne: false
            referencedRelation: "boost_shop_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_boosts_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      user_demographics: {
        Row: {
          age_group: string | null
          created_at: string | null
          gender: string | null
          id: string
          interests: string[] | null
          location: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          age_group?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          age_group?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      user_gift_inventory: {
        Row: {
          acquired_at: string | null
          gift_id: string
          id: string
          quantity: number
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          gift_id: string
          id?: string
          quantity?: number
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          gift_id?: string
          id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gift_inventory_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "virtual_gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gift_inventory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_limits: {
        Row: {
          battles_today: number | null
          bets_today: number | null
          duets_today: number | null
          flagged_content: number | null
          id: string
          is_restricted: boolean | null
          last_battle_reset: string | null
          last_bet_reset: string | null
          last_duet_reset: string | null
          restriction_reason: string | null
          restriction_until: string | null
          trust_score: number | null
          updated_at: string | null
          user_id: string
          warnings_received: number | null
        }
        Insert: {
          battles_today?: number | null
          bets_today?: number | null
          duets_today?: number | null
          flagged_content?: number | null
          id?: string
          is_restricted?: boolean | null
          last_battle_reset?: string | null
          last_bet_reset?: string | null
          last_duet_reset?: string | null
          restriction_reason?: string | null
          restriction_until?: string | null
          trust_score?: number | null
          updated_at?: string | null
          user_id: string
          warnings_received?: number | null
        }
        Update: {
          battles_today?: number | null
          bets_today?: number | null
          duets_today?: number | null
          flagged_content?: number | null
          id?: string
          is_restricted?: boolean | null
          last_battle_reset?: string | null
          last_bet_reset?: string | null
          last_duet_reset?: string | null
          restriction_reason?: string | null
          restriction_until?: string | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string
          warnings_received?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_limits_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      user_suspensions: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          lift_reason: string | null
          lifted_at: string | null
          lifted_by: string | null
          reason: string
          restrictions: Json | null
          suspended_by: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          lift_reason?: string | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason: string
          restrictions?: Json | null
          suspended_by: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          lift_reason?: string | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason?: string
          restrictions?: Json | null
          suspended_by?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_suspensions_lifted_by_admin_users_id_fk"
            columns: ["lifted_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_suspensions_suspended_by_admin_users_id_fk"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_suspensions_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      video_analytics: {
        Row: {
          avg_watch_time: number | null
          click_through_rate: number | null
          comments: number
          completion_rate: number | null
          created_at: string
          date: string
          engagement: number | null
          id: string
          impressions: number
          likes: number
          revenue: number | null
          shares: number
          unique_views: number
          video_id: string
          views: number
        }
        Insert: {
          avg_watch_time?: number | null
          click_through_rate?: number | null
          comments?: number
          completion_rate?: number | null
          created_at?: string
          date: string
          engagement?: number | null
          id?: string
          impressions?: number
          likes?: number
          revenue?: number | null
          shares?: number
          unique_views?: number
          video_id: string
          views?: number
        }
        Update: {
          avg_watch_time?: number | null
          click_through_rate?: number | null
          comments?: number
          completion_rate?: number | null
          created_at?: string
          date?: string
          engagement?: number | null
          id?: string
          impressions?: number
          likes?: number
          revenue?: number | null
          shares?: number
          unique_views?: number
          video_id?: string
          views?: number
        }
        Relationships: []
      }
      video_battles: {
        Row: {
          age_restricted: boolean | null
          category: string | null
          challenger_id: string | null
          created_at: string
          creator_id: string
          description: string | null
          duration: number
          end_time: string | null
          entry_fee: number | null
          id: string
          judge_ids: Json | null
          min_followers: number | null
          prize_pool: number | null
          public_voting: boolean | null
          rules: Json | null
          start_time: string | null
          status: string
          title: string
          updated_at: string
          video1_id: string
          video1_votes: number
          video2_id: string | null
          video2_votes: number
          voting_enabled: boolean
          winner_id: string | null
        }
        Insert: {
          age_restricted?: boolean | null
          category?: string | null
          challenger_id?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          duration?: number
          end_time?: string | null
          entry_fee?: number | null
          id?: string
          judge_ids?: Json | null
          min_followers?: number | null
          prize_pool?: number | null
          public_voting?: boolean | null
          rules?: Json | null
          start_time?: string | null
          status?: string
          title: string
          updated_at?: string
          video1_id: string
          video1_votes?: number
          video2_id?: string | null
          video2_votes?: number
          voting_enabled?: boolean
          winner_id?: string | null
        }
        Update: {
          age_restricted?: boolean | null
          category?: string | null
          challenger_id?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          duration?: number
          end_time?: string | null
          entry_fee?: number | null
          id?: string
          judge_ids?: Json | null
          min_followers?: number | null
          prize_pool?: number | null
          public_voting?: boolean | null
          rules?: Json | null
          start_time?: string | null
          status?: string
          title?: string
          updated_at?: string
          video1_id?: string
          video1_votes?: number
          video2_id?: string | null
          video2_votes?: number
          voting_enabled?: boolean
          winner_id?: string | null
        }
        Relationships: []
      }
      video_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
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
      video_duets: {
        Row: {
          approved: boolean | null
          created_at: string
          duet_type: string
          duet_video_id: string
          id: string
          original_video_id: string
          split_position: string | null
          sync_offset: number | null
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          created_at?: string
          duet_type?: string
          duet_video_id: string
          id?: string
          original_video_id: string
          split_position?: string | null
          sync_offset?: number | null
          user_id: string
        }
        Update: {
          approved?: boolean | null
          created_at?: string
          duet_type?: string
          duet_video_id?: string
          id?: string
          original_video_id?: string
          split_position?: string | null
          sync_offset?: number | null
          user_id?: string
        }
        Relationships: []
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
      video_playlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          thumbnail: string | null
          total_duration: number
          updated_at: string
          user_id: string
          video_count: number
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          thumbnail?: string | null
          total_duration?: number
          updated_at?: string
          user_id: string
          video_count?: number
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          thumbnail?: string | null
          total_duration?: number
          updated_at?: string
          user_id?: string
          video_count?: number
          visibility?: string
        }
        Relationships: []
      }
      video_processing_jobs: {
        Row: {
          actual_duration: number | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          estimated_duration: number | null
          id: string
          input_data: Json | null
          job_type: string
          max_retries: number
          output_data: Json | null
          priority: number
          processing_node: string | null
          progress: number | null
          retry_count: number
          started_at: string | null
          status: string
          updated_at: string
          video_id: string
        }
        Insert: {
          actual_duration?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_duration?: number | null
          id?: string
          input_data?: Json | null
          job_type: string
          max_retries?: number
          output_data?: Json | null
          priority?: number
          processing_node?: string | null
          progress?: number | null
          retry_count?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          video_id: string
        }
        Update: {
          actual_duration?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_duration?: number | null
          id?: string
          input_data?: Json | null
          job_type?: string
          max_retries?: number
          output_data?: Json | null
          priority?: number
          processing_node?: string | null
          progress?: number | null
          retry_count?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          video_id?: string
        }
        Relationships: []
      }
      video_shares: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          platform: string
          share_type: string
          user_id: string | null
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          platform: string
          share_type: string
          user_id?: string | null
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          platform?: string
          share_type?: string
          user_id?: string | null
          video_id?: string
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "videos_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "videos_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      virtual_gifts: {
        Row: {
          animation: string | null
          available: boolean | null
          category: string
          created_at: string | null
          currency: string | null
          description: string | null
          effects: Json | null
          emoji: string
          id: string
          name: string
          price: number
          rarity: string
          seasonal_end: string | null
          seasonal_start: string | null
          sound: string | null
          updated_at: string | null
        }
        Insert: {
          animation?: string | null
          available?: boolean | null
          category: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          effects?: Json | null
          emoji: string
          id: string
          name: string
          price: number
          rarity: string
          seasonal_end?: string | null
          seasonal_start?: string | null
          sound?: string | null
          updated_at?: string | null
        }
        Update: {
          animation?: string | null
          available?: boolean | null
          category?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          effects?: Json | null
          emoji?: string
          id?: string
          name?: string
          price?: number
          rarity?: string
          seasonal_end?: string | null
          seasonal_start?: string | null
          sound?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          confirmations: number | null
          confirmed_at: string | null
          created_at: string | null
          currency: string
          description: string | null
          external_tx_hash: string | null
          external_tx_id: string | null
          fee: number | null
          id: string
          metadata: Json | null
          net_amount: number
          reference_id: string | null
          reference_type: string | null
          related_user_id: string | null
          required_confirmations: number | null
          status: string | null
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          confirmations?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          currency: string
          description?: string | null
          external_tx_hash?: string | null
          external_tx_id?: string | null
          fee?: number | null
          id?: string
          metadata?: Json | null
          net_amount: number
          reference_id?: string | null
          reference_type?: string | null
          related_user_id?: string | null
          required_confirmations?: number | null
          status?: string | null
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          confirmations?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          external_tx_hash?: string | null
          external_tx_id?: string | null
          fee?: number | null
          id?: string
          metadata?: Json | null
          net_amount?: number
          reference_id?: string | null
          reference_type?: string | null
          related_user_id?: string | null
          required_confirmations?: number | null
          status?: string | null
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_related_user_id_users_id_fk"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_wallets_id_fk"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
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
          eloity_points_balance: number
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
          eloity_points_balance?: number
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
          eloity_points_balance?: number
          sol_balance?: number
          updated_at?: string | null
          usdt_balance?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          added_at: string | null
          id: string
          lowest_price_seen: number | null
          notes: string | null
          notify_on_restock: boolean | null
          notify_on_sale: boolean | null
          preferred_variant_id: string | null
          price_when_added: number | null
          priority: number | null
          product_id: string
          target_price: number | null
          wishlist_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          lowest_price_seen?: number | null
          notes?: string | null
          notify_on_restock?: boolean | null
          notify_on_sale?: boolean | null
          preferred_variant_id?: string | null
          price_when_added?: number | null
          priority?: number | null
          product_id: string
          target_price?: number | null
          wishlist_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          lowest_price_seen?: number | null
          notes?: string | null
          notify_on_restock?: boolean | null
          notify_on_sale?: boolean | null
          preferred_variant_id?: string | null
          price_when_added?: number | null
          priority?: number | null
          product_id?: string
          target_price?: number | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_preferred_variant_id_product_variants_id_fk"
            columns: ["preferred_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_wishlists_id_fk"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_public: boolean | null
          name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      posts_with_profiles: {
        Row: {
          avatar_url: string | null
          content: string | null
          created_at: string | null
          filter: string | null
          full_name: string | null
          id: string | null
          image_url: string | null
          is_verified: boolean | null
          location: string | null
          media_urls: Json | null
          privacy: string | null
          eloity_points: number | null
          tagged_users: string[] | null
          tags: string[] | null
          type: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          video_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stories_with_profiles: {
        Row: {
          allow_replies: boolean | null
          allow_screenshot: boolean | null
          avatar_url: string | null
          background_color: string | null
          content: string | null
          created_at: string | null
          duration: number | null
          expires_at: string | null
          font: string | null
          full_name: string | null
          hashtags: Json | null
          highlighted: boolean | null
          id: string | null
          is_verified: boolean | null
          like_count: number | null
          location: string | null
          media_url: string | null
          mentions: Json | null
          music: string | null
          reply_count: number | null
          text_color: string | null
          type: string | null
          user_id: string | null
          username: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      calculate_growth_metrics: {
        Args: { period?: string; user_id: string }
        Returns: {
          current_value: number
          growth_rate: number
          metric_name: string
          previous_value: number
        }[]
      }
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
      get_audience_demographics: {
        Args: { user_id: string }
        Returns: {
          demographic: string
          value: number
        }[]
      }
      get_creator_revenue_by_period: {
        Args: { end_date: string; start_date: string; user_id: string }
        Returns: {
          comments: number
          likes: number
          period: string
          revenue: number
          shares: number
          views: number
        }[]
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
      is_admin: { Args: never; Returns: boolean }
      mask_account_number: { Args: { acct: string }; Returns: string }
      provision_current_user: { Args: never; Returns: undefined }
      validate_banking_access: { Args: { p_user_id: string }; Returns: boolean }
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
