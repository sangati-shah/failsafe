import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Match, ChatRoom } from "@shared/schema";
import { Users, MessageCircle, Search, Sparkles, ArrowRight } from "lucide-react";

interface MatchWithRoom extends Match {
  room?: ChatRoom;
}

export default function Matches() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const currentUserId = localStorage.getItem("failsafe_user_id") || "";

  const { data: matchesData = [], isLoading } = useQuery<MatchWithRoom[]>({
    queryKey: ["/api/matches", currentUserId],
    enabled: !!currentUserId,
  });

  const findMatch = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/matches/find", { userId: currentUserId });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches", currentUserId] });
      if (data.chatRoomId) {
        toast({ title: "Match found!", description: "You've been matched with someone facing similar challenges." });
        navigate(`/chat/${data.chatRoomId}`);
      }
    },
    onError: () => {
      toast({ title: "No match yet", description: "We'll keep looking for the right match. Try again later!", variant: "destructive" });
    },
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Matches</h1>
            <p className="text-sm text-muted-foreground mt-1">Connect with people on similar journeys</p>
          </div>
          <Button
            onClick={() => findMatch.mutate()}
            disabled={findMatch.isPending}
            data-testid="button-find-match"
          >
            <Search className="w-4 h-4 mr-1.5" />
            {findMatch.isPending ? "Searching..." : "Find a Match"}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <Skeleton className="h-4 w-full" />
              </Card>
            ))}
          </div>
        ) : matchesData.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">No matches yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Click "Find a Match" to connect with someone who shares your challenges and can support your journey.
            </p>
            <Button
              onClick={() => findMatch.mutate()}
              disabled={findMatch.isPending}
              data-testid="button-find-match-empty"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              {findMatch.isPending ? "Searching..." : "Find Your Match"}
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {matchesData.map((match) => (
              <Card
                key={match.id}
                className="p-4 hover-elevate cursor-pointer"
                onClick={() => navigate(`/chat/${match.chatRoomId}`)}
                data-testid={`card-match-${match.id}`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{match.room?.roomName || "Chat Room"}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{match.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {match.userIds?.length || 0} members
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" data-testid={`button-enter-chat-${match.id}`}>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
