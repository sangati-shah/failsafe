import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CATEGORIES, FAILURES_BY_CATEGORY } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Post, User } from "@shared/schema";
import { Heart, Plus, TrendingUp, Clock, Trophy, Flame, Star, Zap, Target } from "lucide-react";

function FailureCard({ post, currentUserId }: { post: Post; currentUserId: string }) {
  const { toast } = useToast();
  const hasEncouraged = post.encouragedBy?.includes(currentUserId);

  const encourage = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/posts/${post.id}/encourage`, { userId: currentUserId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({ title: "Encouragement sent!", description: "+5 points for supporting someone" });
    },
  });

  const severityColor = (s: number | null) => {
    if (!s || s <= 2) return "bg-chart-3/10 text-chart-3";
    if (s <= 3) return "bg-accent/20 text-accent-foreground";
    return "bg-destructive/10 text-destructive";
  };

  const timeAgo = (date: Date | string | null) => {
    if (!date) return "";
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <Card className="p-4 hover-elevate" data-testid={`card-post-${post.id}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium" data-testid={`text-username-${post.id}`}>{post.username}</span>
          <Badge variant="secondary" className="text-xs">{post.category}</Badge>
          {post.severity && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${severityColor(post.severity)}`}>
              Lvl {post.severity}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
      </div>
      <p className="text-sm mt-3 leading-relaxed" data-testid={`text-content-${post.id}`}>{post.content}</p>
      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <Button
          variant={hasEncouraged ? "default" : "outline"}
          size="sm"
          disabled={hasEncouraged || encourage.isPending || currentUserId === post.userId}
          onClick={() => encourage.mutate()}
          data-testid={`button-encourage-${post.id}`}
        >
          <Heart className={`w-3.5 h-3.5 mr-1.5 ${hasEncouraged ? "fill-current" : ""}`} />
          {post.encouragements || 0}
        </Button>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          <span>+10 pts</span>
        </div>
      </div>
    </Card>
  );
}

function LeaderboardPanel({ users }: { users: User[] }) {
  const getRankIcon = (i: number) => {
    if (i === 0) return <Trophy className="w-4 h-4 text-amber-500" />;
    if (i === 1) return <Star className="w-4 h-4 text-slate-400" />;
    if (i === 2) return <Flame className="w-4 h-4 text-amber-700" />;
    return <span className="w-4 text-center text-xs text-muted-foreground">{i + 1}</span>;
  };

  return (
    <Card className="p-4" data-testid="panel-leaderboard">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Top Failures This Week</h3>
      </div>
      <div className="space-y-2">
        {users.map((u, i) => (
          <div
            key={u.id}
            className="flex items-center gap-3 p-2 rounded-md hover-elevate"
            data-testid={`leaderboard-row-${i}`}
          >
            {getRankIcon(i)}
            <span className="text-sm flex-1 truncate">{u.username}</span>
            <span className="text-sm font-medium text-primary">{u.points} pts</span>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No users yet. Be the first!</p>
        )}
      </div>
    </Card>
  );
}

export default function Feed() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newSeverity, setNewSeverity] = useState([3]);
  const currentUserId = localStorage.getItem("failsafe_user_id") || "";
  const currentUsername = localStorage.getItem("failsafe_username") || "";

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: leaderboard = [], isLoading: lbLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  const createPost = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/posts", {
        userId: currentUserId,
        username: currentUsername,
        category: newCategory,
        content: newContent,
        severity: newSeverity[0],
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      setDialogOpen(false);
      setNewContent("");
      setNewCategory("");
      setNewSeverity([3]);
      toast({ title: "Failure posted!", description: "+10 points for your courage" });
    },
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Failure Feed</h1>
            <p className="text-sm text-muted-foreground mt-1">Every failure is a step forward</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-post">
                <Plus className="w-4 h-4 mr-1.5" /> Share a Failure
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Setback</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger data-testid="select-post-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  data-testid="textarea-post-content"
                  placeholder="What happened? Share anonymously..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="resize-none"
                  rows={4}
                />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Severity: {newSeverity[0]}/5</p>
                  <Slider value={newSeverity} onValueChange={setNewSeverity} min={1} max={5} step={1} />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createPost.mutate()}
                  disabled={!newContent.trim() || !newCategory || createPost.isPending}
                  data-testid="button-submit-post"
                >
                  {createPost.isPending ? "Posting..." : "Post Anonymously"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {postsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
              ))
            ) : posts.length === 0 ? (
              <Card className="p-8 text-center">
                <Target className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1">No failures shared yet</h3>
                <p className="text-sm text-muted-foreground">Be the first to share and earn points!</p>
              </Card>
            ) : (
              posts.map((p) => (
                <FailureCard key={p.id} post={p} currentUserId={currentUserId} />
              ))
            )}
          </div>

          <div className="space-y-4">
            {lbLoading ? (
              <Card className="p-4">
                <Skeleton className="h-5 w-40 mb-4" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </Card>
            ) : (
              <LeaderboardPanel users={leaderboard} />
            )}

            <Card className="p-4" data-testid="panel-points-info">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent-foreground" /> How Points Work
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Post a failure</span><span className="font-medium text-foreground">+10</span></div>
                <div className="flex justify-between"><span>Give encouragement</span><span className="font-medium text-foreground">+5</span></div>
                <div className="flex justify-between"><span>Receive encouragement</span><span className="font-medium text-foreground">+2</span></div>
                <div className="flex justify-between"><span>Complete a challenge</span><span className="font-medium text-foreground">+20</span></div>
                <div className="flex justify-between"><span>"I tried again"</span><span className="font-medium text-foreground">+50</span></div>
                <div className="flex justify-between"><span>Weekly check-in</span><span className="font-medium text-foreground">+15</span></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
