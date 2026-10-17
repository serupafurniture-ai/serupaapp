import type { Metadata } from "next";
import { AssistantChat } from "./assistant-chat";

export const metadata: Metadata = { title: "Tanya Serupa" };

export default function TanyaPage() {
  return <AssistantChat />;
}
