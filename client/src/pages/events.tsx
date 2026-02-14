import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, ExternalLink, Users, Clock, Sparkles } from "lucide-react";

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  url: string;
  attendeeCount: number;
  status?: string;
  price?: string;
  attendingUsernames: string[];
}

const EVENTS: EventData[] = [
  {
    id: "1",
    title: "AI Meets Robotics - Launch & Fund Your Own Startup",
    date: "Feb 15",
    time: "8:00 AM",
    location: "MindsDB HQ, San Francisco",
    url: "https://luma.com/ai-meets-robotics-sf",
    attendeeCount: 568,
    status: "LIVE",
    attendingUsernames: ["Resilient_Pioneer_4281", "Bold_Explorer_7392"],
  },
  {
    id: "2",
    title: "Build What You Love - Women in Tech Hackathon",
    date: "Feb 15",
    time: "9:00 AM",
    location: "San Francisco, California",
    url: "https://luma.com/ic3l89gi",
    attendeeCount: 421,
    price: "$10",
    attendingUsernames: ["Fearless_Falcon_5618", "Brave_Summit_3947", "Bold_Explorer_7392"],
  },
  {
    id: "3",
    title: "Future of AI - Fireside w/ CTO of Microsoft For Startups",
    date: "Feb 16",
    time: "6:00 PM",
    location: "San Francisco, California",
    url: "https://luma.com/CTO-Microsoft",
    attendeeCount: 571,
    attendingUsernames: ["Resilient_Pioneer_4281", "Fearless_Falcon_5618"],
  },
  {
    id: "4",
    title: "Agentic + AI Observability Meetup SF",
    date: "Feb 17",
    time: "5:00 PM",
    location: "Databricks Inc.",
    url: "https://luma.com/8kbfjhlu",
    attendeeCount: 239,
    status: "Waitlist",
    attendingUsernames: ["Bold_Explorer_7392", "Brave_Summit_3947"],
  },
  {
    id: "5",
    title: "Skills Launch Party",
    date: "Feb 17",
    time: "5:30 PM",
    location: "Shack15, San Francisco",
    url: "https://luma.com/5tttu03l",
    attendeeCount: 180,
    attendingUsernames: ["Resilient_Pioneer_4281"],
  },
  {
    id: "6",
    title: "Forward Deployed Engineers eat the world - Modal x Snowflake",
    date: "Feb 18",
    time: "4:30 PM",
    location: "135 Constitution Dr, San Francisco",
    url: "https://luma.com/yd4wv75q",
    attendeeCount: 300,
    status: "Near Capacity",
    attendingUsernames: ["Fearless_Falcon_5618", "Resilient_Pioneer_4281"],
  },
  {
    id: "7",
    title: "LangChain - AI Agent Meetup: Agent Observability",
    date: "Feb 18",
    time: "6:00 PM",
    location: "501 2nd St Suite 120, San Francisco",
    url: "https://luma.com/v6y5ms2z",
    attendeeCount: 210,
    attendingUsernames: ["Bold_Explorer_7392"],
  },
  {
    id: "8",
    title: "Hardware Pitch Night @ Studio 45",
    date: "Feb 19",
    time: "5:30 PM",
    location: "Studio 45, San Francisco",
    url: "https://luma.com/zaxqbap7",
    attendeeCount: 139,
    attendingUsernames: ["Brave_Summit_3947", "Fearless_Falcon_5618"],
  },
  {
    id: "9",
    title: "The 2026 Fundraising Playbook: What Founders Must Do Today",
    date: "Feb 19",
    time: "5:30 PM",
    location: "Palo Alto, California",
    url: "https://luma.com/bmv2zixy",
    attendeeCount: 53,
    attendingUsernames: ["Resilient_Pioneer_4281", "Brave_Summit_3947"],
  },
  {
    id: "10",
    title: "Codex SF: Technical Demos & Discussion",
    date: "Feb 19",
    time: "6:00 PM",
    location: "San Francisco, California",
    url: "https://luma.com/si4tvig8",
    attendeeCount: 115,
    attendingUsernames: ["Bold_Explorer_7392", "Fearless_Falcon_5618"],
  },
];

function EventCard({ event }: { event: EventData }) {
  const { toast } = useToast();
  const [signedUp, setSignedUp] = useState(false);
  const currentUsername = localStorage.getItem("failsafe_username") || "";

  const handleSignUp = () => {
    setSignedUp(true);
    toast({
      title: "You're signed up!",
      description: `You've registered for "${event.title}". See you there!`,
    });
  };

  const allAttendees = signedUp
    ? [...event.attendingUsernames, currentUsername].filter(Boolean)
    : event.attendingUsernames;

  return (
    <Card className="p-4" data-testid={`card-event-${event.id}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="secondary" className="text-xs">{event.date}</Badge>
              {event.status && (
                <Badge
                  variant={event.status === "LIVE" ? "default" : "secondary"}
                  className="text-xs"
                  data-testid={`badge-status-${event.id}`}
                >
                  {event.status}
                </Badge>
              )}
              {event.price && (
                <Badge variant="secondary" className="text-xs" data-testid={`badge-price-${event.id}`}>{event.price}</Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm mt-2 leading-snug" data-testid={`text-event-title-${event.id}`}>
              {event.title}
            </h3>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 flex-shrink-0" />
            <span data-testid={`text-attendees-${event.id}`}>+{event.attendeeCount} attending</span>
          </div>
        </div>

        {allAttendees.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground" data-testid={`text-members-going-${event.id}`}>FailSafe members going:</span>
            <div className="flex gap-1.5 flex-wrap">
              {allAttendees.map((name) => (
                <Badge key={name} variant="secondary" className="text-xs" data-testid={`badge-attendee-${event.id}-${name}`}>
                  {name === currentUsername ? "You" : name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {signedUp ? (
            <Button variant="outline" size="sm" disabled data-testid={`button-signed-up-${event.id}`}>
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Signed Up
            </Button>
          ) : (
            <Button size="sm" onClick={handleSignUp} data-testid={`button-signup-${event.id}`}>
              Sign Up
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(event.url, "_blank")}
            data-testid={`button-view-event-${event.id}`}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View on Luma
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function Events() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="text-events-title">Events</h1>
              <p className="text-sm text-muted-foreground mt-1">
                SF tech events from Luma - meet your matches IRL
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open("https://luma.com/sf", "_blank")}
              data-testid="button-browse-luma"
            >
              <Calendar className="w-4 h-4 mr-1.5" /> Browse All Events
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {EVENTS.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}
