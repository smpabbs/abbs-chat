import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../services/supabase";
import { useUser } from "../../components/ProtectedRoute";
import { useUi } from "../../contexts/UiContext";

function RoomListView() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toggleDarkMode, isDarkMode } = useUi();
  const [classData, setClassData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    try {
      // Get user's class memberships
      const { data: myMemberships } = await supabase
        .from("class_members")
        .select("class_id, role, display_name")
        .eq("user_id", user.id);

      if (!myMemberships || myMemberships.length === 0) {
        setLoading(false);
        return;
      }

      const classId = myMemberships[0].class_id;

      // Get class info
      const { data: classes } = await supabase
        .from("chat_classes")
        .select("*")
        .eq("id", classId);
      
      if (classes && classes.length > 0) setClassData(classes[0]);

      // Get user's rooms via room_members with class info
      const { data: myRooms } = await supabase
        .from("room_members")
        .select("room:room_id(id, name, class:class_id(name, unit_name))")
        .eq("user_id", user.id);

      if (myRooms) {
        const mapped = myRooms.map(m => ({
          id: m.room.id,
          name: m.room.name,
          class_name: m.room.class?.name || "",
          unit_name: m.room.class?.unit_name || "",
        }));
        setRooms(mapped);
      }

      // Get all members
      const { data: memberData } = await supabase
        .from("class_members")
        .select("user_id, role, display_name")
        .eq("class_id", classId);

      if (memberData) {
        const m = {};
        memberData.forEach(mem => { m[mem.user_id] = mem; });
        setMembers(m);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignout() {
    await supabase.auth.signOut();
    navigate("/signin");
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center text-gray-400">Memuat...</div>;
  }

  const myRole = user ? (members[user.id]?.role || "student") : "student";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <div>
          <h1 className="text-lg font-bold">{classData?.name || "Kelas"}</h1>
          <p className="text-xs text-gray-500">{classData?.unit_name || ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleDarkMode} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-xl">{isDarkMode ? "☀️" : "🌙"}</button>
          <button onClick={handleSignout} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">🚪</button>
        </div>
      </div>

      {/* User info */}
      <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm">
            {user?.user_metadata?.display_name?.[0] || "U"}
          </div>
          <div>
            <p className="font-medium text-sm">{user?.user_metadata?.fullname || user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">{myRole === "teacher" ? "👨‍🏫 Guru" : "🧑‍🎓 Siswa"}</p>
          </div>
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 text-xs font-semibold uppercase text-gray-500 tracking-wider px-2">Ruang Diskusi</p>
        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => {
              navigate(`/chat/${room.id}`);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900 text-lg">
              {getRoomIcon(room.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{room.class_name ? `${room.class_name}` : ""} {room.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {room.class_name ? `${room.unit_name}` : room.name === "General" ? "Diskusi bebas kelas" : `Diskusi ${room.name}`}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 text-center text-xs text-gray-400 dark:border-gray-700">
        ABBS Chat v1.0
      </div>
    </div>
  );
}

function getRoomIcon(name) {
  const icons = {
    "General": "💬",
    "Matematika": "🔢",
    "IPA": "🔬",
    "Bahasa Inggris": "📖",
    "Bahasa Indonesia": "📝",
    "IPS": "🌍",
    "PAI": "🕌",
    "Quran": "📿",
    "ICT": "💻",
    "Olahraga": "⚽",
  };
  return icons[name] || "📁";
}

export default RoomListView;
