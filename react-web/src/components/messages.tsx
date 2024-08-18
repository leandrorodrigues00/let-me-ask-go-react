import { useParams } from "react-router-dom";
import { Message } from "./message";
import { getRoomMessages } from "../http/get-room-messages";
import { use } from "react";

export function Messages() {
  const { roomId } = useParams();

  if (!roomId) {
    throw new Error("Messages components must be used within room page");
  }

  const { messages } = use(getRoomMessages({ roomId }));

  console.log(messages);

  return (
    <ol className="list-decimal list-outside px-3 space-y-8">
      <Message text="text message 1 " amountOfReactions={15} answered />
      <Message text="text message 2" amountOfReactions={10} />
    </ol>
  );
}
