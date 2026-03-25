// src/pages/Homepage.tsx
import Banner         from "../components/Homepage/Banner";
import TopRooms       from "../components/Homepage/TopRooms";
import CalendarSearch from "../components/Homepage/CalendarSearch";
import Comments       from "../components/Homepage/Comments";
import ChatBubble     from "../components/Homepage/ChatBubble";
import "./Homepage.css";

export default function HomePage() {
  // TODO: thay bằng auth context / store thực tế
  const isLoggedIn = true;

  return (
    <div className="homepage">
      <Banner />
      <TopRooms />
      <CalendarSearch />
      <Comments />
      <ChatBubble isLoggedIn={isLoggedIn} />
    </div>
  );
}
