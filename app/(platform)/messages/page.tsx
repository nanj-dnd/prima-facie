import { redirect } from "next/navigation";

// Messages root redirects to matches list
export default function MessagesPage() {
  redirect("/matches");
}
