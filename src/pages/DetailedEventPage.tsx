// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  ArrowLeft,
  Radio,
  AlertCircle,
  ExternalLink,
  Share2,
  Heart,
  MessageCircle,
  CheckCircle,
  Globe,
  Ticket,
  Gift,
  Camera
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/hooks/use-notification';
import { UnifiedActivityService } from '@/services/unifiedActivityService';

interface EventDetails {
  id: string;
  title: string;
  description: string;
  organizer: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    rating: number;
    eventsHosted: number;
  };
  type: 'live' | 'upcoming' | 'ended';
  startDate: string;
  endDate: string;
  location: {
    type: 'virtual' | 'physical' | 'hybrid';
    address?: string;
    platform?: string;
    coordinates?: { lat: number; lng: number };
  };
  capacity: number;
  attendees: number;
  price: {
    amount: number;
    currency: string;
    isFree: boolean;
  };
  tags: string[];
  image: string;
  isAvailable: boolean;
  features: string[];
  agenda?: { time: string; title: string; speaker?: string }[];
  speakers?: { name: string; title: string; avatar: string; bio: string }[];
  liveStreamUrl?: string;
  recordingUrl?: string;
}

interface SuggestedEvent {
  id: string;
  title: string;
  organizer: string;
  startDate: string;
  type: 'live' | 'upcoming' | 'ended';
  attendees: number;
  image: string;
  price: { amount: number; currency: string; isFree: boolean };
}

const DetailedEventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notification = useNotification();
  
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [suggestedEvents, setSuggestedEvents] = useState<SuggestedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  useEffect(() => {
    if (event) {
      const interval = setInterval(() => {
        updateTimeRemaining();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [event]);

  const loadEventDetails = async () => {
    setLoading(true);
    
    try {
      // Mock data based on eventId
      if (eventId === 'event1' || eventId?.includes('crypto')) {
        const now = new Date();
        const startTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
        const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration

        setEvent({
          id: eventId || 'event1',
          title: 'Crypto Trading Masterclass',
          description: 'Join industry experts for an intensive crypto trading masterclass! Learn advanced trading strategies, technical analysis, and risk management techniques. This live event includes Q&A sessions, real-time trading demonstrations, and exclusive insights from top traders.',
          organizer: {
            name: 'CryptoAcademy',
            username: 'crypto_academy',
            avatar: 'https://images.unsplash.com/photo-1559445368-92d4e08c5e8f?w=150',
            verified: true,
            rating: 4.9,
            eventsHosted: 47
          },
          type: 'live',
          startDate: startTime.toISOString(),
          endDate: endTime.toISOString(),
          location: {
            type: 'virtual',
            platform: 'SoftChat Live'
          },
          capacity: 500,
          attendees: 342,
          price: {
            amount: 0,
            currency: 'USD',
            isFree: true
          },
          tags: ['Crypto', 'Trading', 'Education', 'Live', 'Free'],
          image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
          isAvailable: true,
          features: [
            'Live Q&A with experts',
            'Real-time trading demonstrations',
            'Downloadable trading guides',
            'Community access for 30 days',
            'Recording available for 7 days',
            'Certificate of completion'
          ],
          agenda: [
            { time: '2:00 PM', title: 'Welcome & Introduction', speaker: 'John Smith' },
            { time: '2:15 PM', title: 'Market Analysis Fundamentals' },
            { time: '3:00 PM', title: 'Technical Analysis Deep Dive', speaker: 'Sarah Johnson' },
            { time: '3:45 PM', title: 'Risk Management Strategies' },
            { time: '4:30 PM', title: 'Live Trading Session' },
            { time: '4:45 PM', title: 'Q&A and Wrap-up' }
          ],
          speakers: [
            {
              name: 'John Smith',
              title: 'Senior Crypto Analyst',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
              bio: '10+ years in crypto trading with expertise in DeFi and technical analysis.'
            },
            {
              name: 'Sarah Johnson',
              title: 'Trading Strategy Expert',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
              bio: 'Former Wall Street trader specializing in cryptocurrency markets.'
            }
          ],
          liveStreamUrl: '/app/live/crypto-masterclass'
        });

        setSuggestedEvents([
          {
            id: 'event2',
            title: 'DeFi Investment Workshop',
            organizer: 'DeFi Pro',
            startDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            type: 'upcoming',
            attendees: 156,
            image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
            price: { amount: 25, currency: 'USD', isFree: false }
          },
          {
            id: 'event3',
            title: 'Blockchain Development Bootcamp',
            organizer: 'CodeCrypto',
            startDate: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
            type: 'upcoming',
            attendees: 89,
            image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
            price: { amount: 50, currency: 'USD', isFree: false }
          }
        ]);
      } else {
        // Event not found or ended
        setEvent({
          id: eventId || '',
          title: 'Event Not Available',
          description: 'This event has ended or is no longer available.',
          organizer: {
            name: 'Unknown',
            username: 'unknown',
            avatar: '',
            verified: false,
            rating: 0,
            eventsHosted: 0
          },
          type: 'ended',
          startDate: '',
          endDate: '',
          location: { type: 'virtual' },
          capacity: 0,
          attendees: 0,
          price: { amount: 0, currency: 'USD', isFree: true },
          tags: [],
          image: '',
          isAvailable: false,
          features: []
        });

        setSuggestedEvents([
          {
            id: 'event4',
            title: 'Tech Startup Networking',
            organizer: 'StartupHub',
            startDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
            type: 'upcoming',
            attendees: 234,
            image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
            price: { amount: 0, currency: 'USD', isFree: true }
          },
          {
            id: 'event5',
            title: 'AI & Machine Learning Summit',
            organizer: 'AI Community',
            startDate: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
            type: 'upcoming',
            attendees: 567,
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
            price: { amount: 75, currency: 'USD', isFree: false }
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load event details:', error);
      notification.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const updateTimeRemaining = () => {
    if (!event) return;

    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (event.type === 'live' && now >= startDate && now <= endDate) {
      const remaining = endDate.getTime() - now.getTime();
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m remaining`);
    } else if (event.type === 'upcoming' && now < startDate) {
      const remaining = startDate.getTime() - now.getTime();
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) {
        setTimeRemaining(`Starts in ${days}d ${hours}h`);
      } else {
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`Starts in ${hours}h ${minutes}m`);
      }
    } else {
      setTimeRemaining('');
    }
  };

  const handleJoinEvent = async () => {
    if (!user) {
      notification.error('Please log in to join events');
      navigate('/auth');
      return;
    }

    if (!event?.isAvailable) {
      notification.error('This event is not available');
      return;
    }

    try {
      const reward = await UnifiedActivityService.trackEventJoin(
        user.id,
        event.id,
        {
          eventTitle: event.title,
          organizer: event.organizer.name,
          type: event.type,
          location: event.location,
          source: 'detailed_page'
        }
      );

      if (reward.success && reward.softPoints > 0) {
        notification.success(`Joined event! +${reward.softPoints} SoftPoints earned`, {
          description: 'You will receive event updates and reminders'
        });
      } else {
        notification.success('Successfully joined the event!');
      }

      setIsRegistered(true);

      // If it's a live event, navigate to live stream
      if (event.type === 'live' && event.liveStreamUrl) {
        navigate(event.liveStreamUrl);
      }
    } catch (error) {
      notification.error('Failed to join event');
    }
  };

  const handleWatchLive = () => {
    if (!event?.liveStreamUrl) {
      notification.error('Live stream not available');
      return;
    }
    navigate(event.liveStreamUrl);
  };

  const handleSuggestedEventClick = (suggestedEventId: string) => {
    navigate(`/app/events/${suggestedEventId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-4">The event you're looking for doesn't exist or has been cancelled.</p>
          <Button onClick={() => navigate('/app/events')}>
            Browse Other Events
          </Button>
        </div>
      </div>
    );
  }

  if (!event.isAvailable || event.type === 'ended') {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card className="border-orange-200 bg-orange-50 mb-8">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-orange-800 mb-2">Event Has Ended</h2>
              <p className="text-orange-600 mb-4">
                This event has concluded. Thank you to everyone who participated!
              </p>
              {event.recordingUrl && (
                <Button className="mb-4" onClick={() => navigate(event.recordingUrl!)}>
                  <Camera className="h-4 w-4 mr-2" />
                  Watch Recording
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events You Might Like
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {suggestedEvents.map((suggestedEvent) => (
                  <Card key={suggestedEvent.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleSuggestedEventClick(suggestedEvent.id)}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <img
                          src={suggestedEvent.image}
                          alt={suggestedEvent.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{suggestedEvent.title}</h3>
                              <p className="text-sm text-muted-foreground">by {suggestedEvent.organizer}</p>
                            </div>
                            <Badge
                              variant={suggestedEvent.type === 'live' ? 'destructive' : 'secondary'}
                              className={suggestedEvent.type === 'live' ? 'animate-pulse' : ''}
                            >
                              {suggestedEvent.type === 'live' ? (
                                <>
                                  <Radio className="h-3 w-3 mr-1" />
                                  LIVE
                                </>
                              ) : (
                                'Upcoming'
                              )}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(suggestedEvent.startDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {suggestedEvent.attendees} attending
                            </div>
                            <div className="flex items-center gap-1">
                              <Ticket className="h-3 w-3" />
                              {suggestedEvent.price.isFree ? 'Free' : `${suggestedEvent.price.amount} ${suggestedEvent.price.currency}`}
                            </div>
                          </div>
                          <Button size="sm">
                            {suggestedEvent.type === 'live' ? 'Join Live' : 'Register'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const attendancePercentage = (event.attendees / event.capacity) * 100;

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Event Hero */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-end">
              <div className="p-6 text-white w-full">
                <div className="flex items-center gap-3 mb-4">
                  {event.type === 'live' && (
                    <Badge className="bg-red-600 text-white animate-pulse">
                      <Radio className="h-3 w-3 mr-1" />
                      LIVE NOW
                    </Badge>
                  )}
                  {event.price.isFree && (
                    <Badge className="bg-green-600 text-white">
                      FREE
                    </Badge>
                  )}
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                      <AvatarFallback>{event.organizer.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{event.organizer.name}</p>
                      <div className="flex items-center gap-1 text-sm opacity-90">
                        <Star className="h-3 w-3" />
                        <span>{event.organizer.rating} • {event.organizer.eventsHosted} events</span>
                      </div>
                    </div>
                  </div>
                  {timeRemaining && (
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Clock className="h-3 w-3" />
                      {timeRemaining}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium">Date & Time</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(event.startDate).toLocaleTimeString()} - {new Date(event.endDate).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="font-medium">Location</div>
                    <div className="text-sm text-muted-foreground">
                      {event.location.type === 'virtual' ? (
                        <>
                          <Globe className="h-3 w-3 inline mr-1" />
                          Virtual Event
                        </>
                      ) : (
                        event.location.address
                      )}
                    </div>
                    {event.location.platform && (
                      <div className="text-xs text-muted-foreground">
                        via {event.location.platform}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="font-medium">Attendees</div>
                    <div className="text-sm text-muted-foreground">
                      {event.attendees} of {event.capacity}
                    </div>
                    <Progress value={attendancePercentage} className="mt-2" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">About This Event</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">What You'll Get</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {event.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agenda */}
            {event.agenda && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Agenda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.agenda.map((item, index) => (
                      <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                        <div className="w-20 text-sm font-medium text-muted-foreground">
                          {item.time}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          {item.speaker && (
                            <p className="text-sm text-muted-foreground">with {item.speaker}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Featured Speakers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {event.speakers.map((speaker, index) => (
                      <div key={index} className="flex gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={speaker.avatar} alt={speaker.name} />
                          <AvatarFallback>{speaker.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold">{speaker.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{speaker.title}</p>
                          <p className="text-sm">{speaker.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  {event.price.isFree ? (
                    <div className="text-2xl font-bold text-green-600">FREE</div>
                  ) : (
                    <div className="text-2xl font-bold">
                      {event.price.amount} {event.price.currency}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {event.type === 'live' ? (
                    <Button
                      onClick={handleWatchLive}
                      className="w-full bg-red-600 hover:bg-red-700"
                      size="lg"
                    >
                      <Radio className="h-4 w-4 mr-2" />
                      Join Live Stream
                    </Button>
                  ) : (
                    <Button
                      onClick={handleJoinEvent}
                      disabled={isRegistered}
                      className="w-full"
                      size="lg"
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Registered
                        </>
                      ) : (
                        <>
                          <Ticket className="h-4 w-4 mr-2" />
                          {event.price.isFree ? 'Register Free' : 'Buy Ticket'}
                        </>
                      )}
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="flex-1">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="flex-1">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="flex-1">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedEvents.map((suggestedEvent) => (
                  <Card key={suggestedEvent.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSuggestedEventClick(suggestedEvent.id)}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <img
                          src={suggestedEvent.image}
                          alt={suggestedEvent.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{suggestedEvent.title}</h4>
                          <p className="text-xs text-muted-foreground mb-1">by {suggestedEvent.organizer}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {new Date(suggestedEvent.startDate).toLocaleDateString()}
                            </span>
                            <Badge variant={suggestedEvent.type === 'live' ? 'destructive' : 'secondary'} className="text-xs">
                              {suggestedEvent.type === 'live' ? 'LIVE' : 'Upcoming'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedEventPage;
