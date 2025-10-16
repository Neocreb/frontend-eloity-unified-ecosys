import { Helmet } from "react-helmet-async";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";

const NotificationPreferences = () => {
  return (
    <>
      <Helmet>
        <title>Notification Preferences | Eloity</title>
      </Helmet>
      
      <div className="container py-6">
        <NotificationSettings />
      </div>
    </>
  );
};

export default NotificationPreferences;