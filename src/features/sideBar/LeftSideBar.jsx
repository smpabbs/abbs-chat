import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUi } from "../../contexts/UiContext";
import RoomListView from "./RoomListView";

function LeftSideBar() {
  const { isSidebarOpen, closeSidebar, openSidebar } = useUi();
  const { roomId } = useParams();

  useEffect(() => {
    roomId ? closeSidebar() : openSidebar();
  }, [roomId]);

  return (
    <aside className={`${isSidebarOpen ? "visible left-0 opacity-100" : "invisible -left-full opacity-0"} absolute top-0 z-30 h-screen-safe w-full overflow-hidden bg-bgPrimary shadow-lg transition-all duration-500 ease-[cubic-bezier(.15,.72,.08,.99)] dark:bg-bgPrimary-dark sm:w-[23rem] md:visible md:relative md:left-0 md:opacity-100`}>
      <RoomListView />
    </aside>
  );
}
export default LeftSideBar;
