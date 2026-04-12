// src/pages/Homepage.tsx
import Banner         from "../components/Homepage/Banner";
import TopRooms       from "../components/Homepage/TopRooms";
import CalendarSearch from "../components/Homepage/CalendarSearch";
import Comments       from "../components/Homepage/Comments";
import ChatBubble     from "../components/Homepage/ChatBubble";
import "../assets/css/Homepage/Homepage.css";
import Header from "../shared/Header";
import Footer from "../shared/Fooder";

export default function HomePage() {
  // TODO: thay bằng auth context / store thực tế
  const isLoggedIn = true;

  return (
    <div className="homepage">
      <Header/>
      <Banner />
      <TopRooms />
      <CalendarSearch />
      <Comments />
      <ChatBubble isLoggedIn={isLoggedIn} />
      <Footer/>
    </div>
  );
}
