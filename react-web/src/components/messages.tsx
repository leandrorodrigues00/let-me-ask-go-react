import { useParams } from "react-router-dom";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { Message } from "./message";
import {
  getRoomMessages,
  type GetRoomMessagesResponse,
} from "../http/get-room-messages";
import { useEffect } from "react";

export function Messages() {
  const queryClient = useQueryClient();
  const { roomId } = useParams();

  if (!roomId) {
    throw new Error("Messages components must be used within room page");
  }

  const { data } = useSuspenseQuery({
    queryKey: ["messages", roomId],
    queryFn: () => getRoomMessages({ roomId }),
  });

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/subscribe/${roomId}`);

    ws.onopen = () => {
      console.log("websocket connected!");
    };

    ws.onclose = () => {
      console.log("websocket connection closed!");
    };

    ws.onmessage = (event) => {
      const data: {
        kind: "message_created";
        value: any;
      } = JSON.parse(event.data);

      switch (data.kind) {
        case "message_created":
          queryClient.setQueryData<GetRoomMessagesResponse>(
            ["messages", roomId],
            (state) => {
              return {
                messages: [
                  ...(state?.messages ?? []),
                  {
                    id: data.value.id,
                    text: data.value.message,
                    amountOfReactions: 0,
                    answered: false,
                  },
                ],
              };
            }
          );

          break;
      }
    };

    return () => {
      ws.close();
    };
  }, [roomId, queryClient]);

  return (
    <ol className="list-decimal list-outside px-3 space-y-8">
      {data.messages.map((message) => {
        return (
          <Message
            key={message.id}
            id={message.id}
            text={message.text}
            amountOfReactions={message.amountOfReactions}
            answered={message.answered}
          />
        );
      })}
    </ol>
  );
}
