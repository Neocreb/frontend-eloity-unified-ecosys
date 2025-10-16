import React from 'react';
import CallManager from './CallManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Video, History, Users } from 'lucide-react';

const CallingDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Voice & Video Calling</h1>
        <p className="text-gray-600 mt-2">
          Make voice and video calls with other users in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-gray-500">Voice Calls</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Video className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-gray-500">Video Calls</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-gray-500">Group Calls</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <History className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">20</div>
                <div className="text-gray-500">Total Calls</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CallManager />
    </div>
  );
};

export default CallingDashboard;