import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { Message, ChatRoom, Challenge } from "@shared/schema";
import { Send, CheckCircle2, Clock, Users, Zap } from "lucide-react";

export default function Chat() {
  const [, params] = useRoute("/chat/:roomId");
  const roomId = params?.roomId || "";
  const { toast } = useToast();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const currentUserId = localStorage.getItem("failsafe_user_id") || "";
  const currentUsername = localStorage.getItem("failsafe_username") || "";

  const { data: room } = useQuery<ChatRoom>({
    queryKey: ["/api/chat", roomId, "room"],
    enabled: !!roomId,
  });

  const { data: messages = [], isLoading: msgsLoading } = useQuery<Message[]>({
    queryKey: ["/api/chat", roomId, "messages"],
    enabled: !!roomId,
  });

  const { data: challenge } = useQuery<Challenge | null>({
    queryKey: ["/api/chat", roomId, "challenge"],
    enabled: !!roomId,
  });

  useEffect(() => {
    if (!roomId) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", roomId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        queryClient.invalidateQueries({ queryKey: ["/api/chat", roomId, "messages"] });
      }
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/chat/${roomId}/messages`, {
        chatRoomId: roomId,
        userId: currentUserId,
        username: currentUsername,
        content: messageText,
      });
      return res.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat", roomId, "messages"] });
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "message", roomId }));
      }
    },
  });

  const completeChallenge = useMutation({
    mutationFn: async () => {
      if (!challenge) return;
      const res = await apiRequest("POST", `/api/challenges/${challenge.id}/complete`, {
        userId: currentUserId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", roomId, "challenge"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({ title: "Challenge completed!", description: "+20 points earned!" });
    },
  });

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessage.mutate();
  };

  const challengeCompleted = challenge?.completedBy?.includes(currentUserId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b p-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm" data-testid="text-room-name">
            {room?.roomName || "Chat Room"}
          </h2>
        </div>
      </div>

      {challenge && (
        <Card className="m-3 p-3 border-primary/20 bg-primary/5" data-testid="card-challenge">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary mb-1">Today's Challenge</p>
              <p className="text-sm" data-testid="text-challenge">{challenge.challenge}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {challenge.estimatedTime && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ~{challenge.estimatedTime} min
                  </span>
                )}
                {challengeCompleted ? (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => completeChallenge.mutate()}
                    disabled={completeChallenge.isPending}
                    data-testid="button-complete-challenge"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3 max-w-3xl mx-auto">
          {msgsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className="max-w-[75%]">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-12 w-48 rounded-md" />
                </div>
              </div>
            ))
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium mb-1 text-sm">Start the conversation</h3>
              <p className="text-xs text-muted-foreground">Say hello to your accountability partners!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.userId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`} data-testid={`message-${msg.id}`}>
                  <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                    {!isOwn && (
                      <span className="text-xs text-muted-foreground mb-1 block">{msg.username}</span>
                    )}
                    <div
                      className={`rounded-md px-3 py-2 text-sm ${
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            data-testid="input-message"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessage.isPending}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
