"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosAuth from "@/lib/axiosAuth";
import ChatUI from "@/app/chatUI/page";

export default function RoomPage() {
  const { name } = useParams() as { name: string };
  const [roomDetails, setRoomDetails] = useState<{
    id: string;
    name: string;
    description?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axiosAuth.get(`/room/${name}`);
        setRoomDetails(res.data);
      } catch (error) {
        console.error("Failed to fetch room:", error);
      } finally {
        setLoading(false);
      }
    };

    if (name) fetchRoom();
  }, [name]);

  if (loading) return <div className="p-6">Loading room...</div>;
  if (!roomDetails) return <div className="p-6">Room not found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Room: {roomDetails.name}</h1>
      <p className="text-muted-foreground">{roomDetails.description || "No description provided."}</p>

      <ChatUI/>
      <div className="mt-6 border p-4 rounded-lg">
        <p>This is where your AI assistant or chat messages would go for <strong>{roomDetails.name}</strong>.</p>
      </div>
    </div>
  );
}
