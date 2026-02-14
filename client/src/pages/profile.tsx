import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BADGE_INFO, MOODS } from "@/lib/constants";
import type { User, Celebration } from "@shared/schema";
import {
  Trophy, Target, Flame, Shield, HeartHandshake, Zap,
  Sparkles, Users, CalendarCheck, RefreshCw, Award, Star
} from "lucide-react";

const BADGE_ICONS: Record<string, any> = {
  shield: Shield,
  "heart-handshake": HeartHandshake,
  zap: Zap,
  sparkles: Sparkles,
  flame: Flame,
  users: Users,
  "calendar-check": CalendarCheck,
};

export default function Profile() {
  const { toast } = useToast();
  const currentUserId = localStorage.getItem("failsafe_user_id") || "";
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [mood, setMood] = useState("");
  const [accomplishment, setAccomplishment] = useState("");
  const [needSupport, setNeedSupport] = useState("");

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users", currentUserId],
    enabled: !!currentUserId,
  });

  const { data: celebrations = [] } = useQuery<Celebration[]>({
    queryKey: ["/api/users", currentUserId, "celebrations"],
    enabled: !!currentUserId,
  });

  const triedAgain = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/users/${currentUserId}/tried-again`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId, "celebrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({ title: "You're a Phoenix!", description: "+50 points! Your resilience is inspiring." });
    },
  });

  const weeklyCheckin = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/users/${currentUserId}/checkin`, {
        userId: currentUserId,
        mood,
        accomplishment: accomplishment || null,
        needSupport: needSupport || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      setCheckinOpen(false);
      setMood("");
      setAccomplishment("");
      setNeedSupport("");
      toast({ title: "Check-in recorded!", description: "+15 points. Keep showing up!" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  const earnedBadges = user.badges || [];
  const allBadges = Object.entries(BADGE_INFO);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
        <Card className="p-6" data-testid="card-profile-header">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">
                    {user.username?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="font-bold text-lg" data-testid="text-profile-username">{user.username}</h2>
                  <Badge variant="secondary" className="text-xs">{user.category}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                <Target className="w-3.5 h-3.5 inline mr-1" />
                {user.goal}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold text-primary" data-testid="text-points">{user.points}</span>
              </div>
              <p className="text-xs text-muted-foreground">points earned</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            size="lg"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => triedAgain.mutate()}
            disabled={triedAgain.isPending}
            data-testid="button-tried-again"
          >
            <RefreshCw className="w-6 h-6" />
            <span className="font-semibold">I Tried Again!</span>
            <span className="text-xs opacity-80">+50 points</span>
          </Button>

          <Dialog open={checkinOpen} onOpenChange={setCheckinOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-4 flex flex-col items-center gap-2"
                data-testid="button-weekly-checkin"
              >
                <CalendarCheck className="w-6 h-6" />
                <span className="font-semibold">Weekly Check-in</span>
                <span className="text-xs opacity-60">+15 points</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How did your week go?</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <RadioGroup value={mood} onValueChange={setMood}>
                  {MOODS.map((m) => (
                    <div key={m} className="flex items-center gap-2">
                      <RadioGroupItem value={m} id={`mood-${m}`} />
                      <Label htmlFor={`mood-${m}`} className="text-sm cursor-pointer">{m}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <div>
                  <Label className="text-sm mb-2 block">One thing you accomplished (optional)</Label>
                  <Textarea
                    data-testid="textarea-accomplishment"
                    value={accomplishment}
                    onChange={(e) => setAccomplishment(e.target.value)}
                    className="resize-none"
                    rows={2}
                    placeholder="Even small wins count..."
                  />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">Need support with something? (optional)</Label>
                  <Textarea
                    data-testid="textarea-support"
                    value={needSupport}
                    onChange={(e) => setNeedSupport(e.target.value)}
                    className="resize-none"
                    rows={2}
                    placeholder="We're here for you..."
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={!mood || weeklyCheckin.isPending}
                  onClick={() => weeklyCheckin.mutate()}
                  data-testid="button-submit-checkin"
                >
                  {weeklyCheckin.isPending ? "Submitting..." : "Submit Check-in"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-4" data-testid="card-badges">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Badges</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allBadges.map(([key, info]) => {
              const earned = earnedBadges.includes(key);
              const IconComp = BADGE_ICONS[info.icon] || Star;
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center gap-2 p-3 rounded-md text-center transition-opacity ${
                    earned ? "opacity-100" : "opacity-30"
                  }`}
                  data-testid={`badge-${key}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    earned ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <IconComp className={`w-5 h-5 ${earned ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <span className="text-xs font-medium">{info.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{info.description}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {user.failures && user.failures.length > 0 && (
          <Card className="p-4" data-testid="card-failures">
            <h3 className="font-semibold text-sm mb-3">Your Setbacks</h3>
            <div className="flex flex-wrap gap-2">
              {user.failures.map((f, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
              ))}
            </div>
            {user.failureDescription && (
              <p className="text-sm text-muted-foreground mt-3">{user.failureDescription}</p>
            )}
          </Card>
        )}

        {celebrations.length > 0 && (
          <Card className="p-4" data-testid="card-celebrations">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-foreground" /> Recent Celebrations
            </h3>
            <div className="space-y-2">
              {celebrations.slice(0, 10).map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <span className="text-sm">{c.description}</span>
                  <span className="text-xs text-primary font-medium">+{c.points}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
