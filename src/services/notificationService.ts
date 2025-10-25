import { supabase } from "@/integrations/supabase/client";

export class NotificationService {
  // Send notification to group members
  static async sendGroupNotification(
    groupId: string,
    title: string,
    message: string,
    type: string = "info",
    relatedId?: string
  ) {
    try {
      // Get all group members
      const { data: members, error: membersError } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId);

      if (membersError) throw membersError;

      // Create notifications for each member
      const notifications = members.map((member: { user_id: string }) => ({
        user_id: member.user_id,
        title,
        message,
        type,
        related_id: relatedId,
        related_type: "group_contribution",
        is_read: false,
        created_at: new Date().toISOString(),
      }));

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from("notifications")
          .insert(notifications);

        if (insertError) throw insertError;
      }

      return true;
    } catch (error) {
      console.error("Error sending group notifications:", error);
      return false;
    }
  }

  // Send notification to specific user
  static async sendUserNotification(
    userId: string,
    title: string,
    message: string,
    type: string = "info",
    relatedId?: string
  ) {
    try {
      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          title,
          message,
          type,
          related_id: relatedId,
          related_type: "group_contribution",
          is_read: false,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending user notification:", error);
      return false;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  // Get unread notifications count for user
  static async getUnreadCount(userId: string) {
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error getting unread notifications count:", error);
      return 0;
    }
  }
}