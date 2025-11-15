import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { UserService, UserWithProfile } from "./userService";

type Event = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventRsvp = Database["public"]["Tables"]["event_rsvps"]["Row"];

export interface EventWithDetails extends Event {
  creator: UserWithProfile | null;
  attendee_count: number;
  is_attending: boolean;
}

export class EventService {
  // Create a new event
  static async createEvent(eventData: EventInsert): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .single();

      if (error) {
        console.error("Error creating event:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in createEvent:", error);
      return null;
    }
  }

  // Get event by ID
  static async getEventById(eventId: string, userId?: string): Promise<EventWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        return null;
      }

      if (!data) return null;

      // Get creator profile
      const creator = await UserService.getUserById(data.creator_id);

      // Get attendee count
      const attendeeCount = await this.getEventAttendeeCount(eventId);

      // Check if user is attending
      const isAttending = userId ? await this.isUserAttendingEvent(eventId, userId) : false;

      return {
        ...data,
        creator: creator,
        attendee_count: attendeeCount,
        is_attending: isAttending
      };
    } catch (error) {
      console.error("Error in getEventById:", error);
      return null;
    }
  }

  // Get all events (with pagination and filters)
  static async getAllEvents(
    limit = 20, 
    offset = 0, 
    filters?: { 
      startDate?: string; 
      endDate?: string; 
      location?: string;
      groupId?: string;
    }
  ): Promise<EventWithDetails[]> {
    try {
      let query = supabase
        .from("events")
        .select("*")
        .gte("start_date", new Date().toISOString()) // Only future events
        .order("start_date", { ascending: true })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters?.startDate) {
        query = query.gte("start_date", filters.startDate);
      }
      
      if (filters?.endDate) {
        query = query.lte("end_date", filters.endDate);
      }
      
      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }
      
      if (filters?.groupId) {
        query = query.eq("group_id", filters.groupId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching events:", error);
        return [];
      }

      // Enhance events with additional details
      const enhancedEvents = await Promise.all(
        data.map(async (event: any) => {
          const creator = await UserService.getUserById(event.creator_id);
          const attendeeCount = await this.getEventAttendeeCount(event.id);
          
          return {
            ...event,
            creator: creator,
            attendee_count: attendeeCount,
            is_attending: false // Would be set based on current user context
          };
        })
      );

      return enhancedEvents as EventWithDetails[];
    } catch (error) {
      console.error("Error in getAllEvents:", error);
      return [];
    }
  }

  // Get events created by a user
  static async getUserEvents(userId: string, limit = 20, offset = 0): Promise<EventWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("creator_id", userId)
        .order("start_date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching user events:", error);
        return [];
      }

      // Enhance events with additional details
      const enhancedEvents = await Promise.all(
        data.map(async (event: any) => {
          const creator = await UserService.getUserById(event.creator_id);
          const attendeeCount = await this.getEventAttendeeCount(event.id);
          
          return {
            ...event,
            creator: creator,
            attendee_count: attendeeCount,
            is_attending: false
          };
        })
      );

      return enhancedEvents as EventWithDetails[];
    } catch (error) {
      console.error("Error in getUserEvents:", error);
      return [];
    }
  }

  // Update event
  static async updateEvent(eventId: string, userId: string, eventData: Partial<Event>): Promise<Event | null> {
    try {
      // Check if user is the creator
      const event = await this.getEventById(eventId);
      if (!event || event.creator_id !== userId) {
        console.error("User is not authorized to update this event");
        return null;
      }

      const { data, error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", eventId)
        .select()
        .single();

      if (error) {
        console.error("Error updating event:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in updateEvent:", error);
      return null;
    }
  }

  // Delete event
  static async deleteEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      // Check if user is the creator
      const event = await this.getEventById(eventId);
      if (!event || event.creator_id !== userId) {
        console.error("User is not authorized to delete this event");
        return false;
      }

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) {
        console.error("Error deleting event:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteEvent:", error);
      return false;
    }
  }

  // RSVP to an event
  static async rsvpToEvent(eventId: string, userId: string, status: 'going' | 'maybe' | 'not_going' = 'going'): Promise<boolean> {
    try {
      // Check if RSVP already exists
      const { data: existingRsvp, error: fetchError } = await supabase
        .from("event_rsvps")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error checking existing RSVP:", fetchError);
        return false;
      }

      if (existingRsvp) {
        // Update existing RSVP
        const { error: updateError } = await supabase
          .from("event_rsvps")
          .update({ status: status, updated_at: new Date().toISOString() })
          .eq("id", existingRsvp.id);

        if (updateError) {
          console.error("Error updating RSVP:", updateError);
          return false;
        }
      } else {
        // Create new RSVP
        const { error: insertError } = await supabase
          .from("event_rsvps")
          .insert({
            event_id: eventId,
            user_id: userId,
            status: status
          });

        if (insertError) {
          console.error("Error creating RSVP:", insertError);
          return false;
        }
      }

      // Update attendee count
      await this.updateEventAttendeeCount(eventId);

      return true;
    } catch (error) {
      console.error("Error in rsvpToEvent:", error);
      return false;
    }
  }

  // Get event attendee count
  static async getEventAttendeeCount(eventId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("event_rsvps")
        .select("*", { count: "exact" })
        .eq("event_id", eventId)
        .eq("status", "going");

      if (error) {
        console.error("Error fetching event attendee count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getEventAttendeeCount:", error);
      return 0;
    }
  }

  // Check if user is attending an event
  static async isUserAttendingEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("event_rsvps")
        .select("status")
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking user attendance:", error);
        return false;
      }

      return data?.status === 'going';
    } catch (error) {
      console.error("Error in isUserAttendingEvent:", error);
      return false;
    }
  }

  // Update event attendee count
  static async updateEventAttendeeCount(eventId: string): Promise<void> {
    try {
      const attendeeCount = await this.getEventAttendeeCount(eventId);
      
      await supabase
        .from("events")
        .update({ attendee_count: attendeeCount })
        .eq("id", eventId);
    } catch (error) {
      console.error("Error updating event attendee count:", error);
    }
  }

  // Get event attendees
  static async getEventAttendees(eventId: string, limit = 20, offset = 0): Promise<UserWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from("event_rsvps")
        .select(`
          users (
            *,
            profiles (*)
          )
        `)
        .eq("event_id", eventId)
        .eq("status", "going")
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching event attendees:", error);
        return [];
      }

      return data.map((item: any) => item.users) as UserWithProfile[];
    } catch (error) {
      console.error("Error in getEventAttendees:", error);
      return [];
    }
  }

  // Search events
  static async searchEvents(query: string, limit = 20): Promise<EventWithDetails[]> {
    try {
      // Sanitize query to prevent complex parsing issues
      const sanitizedQuery = query.trim().replace(/[^a-zA-Z0-9_\-.\s]/g, '');
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .or(`title.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%`)
        .gte("start_date", new Date().toISOString()) // Only future events
        .order("start_date", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("Error searching events:", error);
        return [];
      }

      // Enhance events with additional details
      const enhancedEvents = await Promise.all(
        data.map(async (event: any) => {
          const creator = await UserService.getUserById(event.creator_id);
          const attendeeCount = await this.getEventAttendeeCount(event.id);
          
          return {
            ...event,
            creator: creator,
            attendee_count: attendeeCount,
            is_attending: false
          };
        })
      );

      return enhancedEvents as EventWithDetails[];
    } catch (error) {
      console.error("Error in searchEvents:", error);
      return [];
    }
  }

  // Get upcoming events for a user (events they're attending)
  static async getUserUpcomingEvents(userId: string, limit = 10): Promise<EventWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from("event_rsvps")
        .select(`
          events (
            *,
            users (
              *,
              profiles (*)
            )
          )
        `)
        .eq("user_id", userId)
        .eq("status", "going")
        .gte("events.start_date", new Date().toISOString())
        .order("events.start_date", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("Error fetching user upcoming events:", error);
        return [];
      }

      // Enhance events with additional details
      const enhancedEvents = await Promise.all(
        data.map(async (item: any) => {
          const event = item.events;
          const creator = await UserService.getUserById(event.creator_id);
          const attendeeCount = await this.getEventAttendeeCount(event.id);
          
          return {
            ...event,
            creator: creator,
            attendee_count: attendeeCount,
            is_attending: true
          };
        })
      );

      return enhancedEvents as EventWithDetails[];
    } catch (error) {
      console.error("Error in getUserUpcomingEvents:", error);
      return [];
    }
  }
}