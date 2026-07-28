import { createContext, useContext, useEffect, useReducer } from "react";
import { DARK_THEME, LIGHT_THEME, LOCAL_STORAGE_KEY } from "../config";

const UiContext = createContext();

const InitialState = {
  isSidebarOpen: false,
  isDarkMode: true,
};

function reducer(state, action) {
  switch (action.type) {
    case "OPEN_SIDEBAR": return { ...state, isSidebarOpen: true };
    case "CLOSE_SIDEBAR": return { ...state, isSidebarOpen: false };
    case "TOGGLE_DARK_MODE": return { ...state, isDarkMode: !state.isDarkMode };
    default: return state;
  }
}

function UiProvider({ children }) {
  const [{ isSidebarOpen, isDarkMode }, dispatch] = useReducer(reducer, InitialState);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === DARK_THEME : prefersDark;
    if (dark) document.documentElement.classList.add(DARK_THEME);
    dispatch({ type: "TOGGLE_DARK_MODE" });
    dispatch({ type: "TOGGLE_DARK_MODE" }); // reset
    setTimeout(() => {
      if (dark) {
        document.documentElement.classList.add(DARK_THEME);
        dispatch({ type: "TOGGLE_DARK_MODE" });
      }
    }, 0);
  }, []);

  function openSidebar() { dispatch({ type: "OPEN_SIDEBAR" }); }
  function closeSidebar() { dispatch({ type: "CLOSE_SIDEBAR" }); }
  function toggleDarkMode() {
    const newDark = !isDarkMode;
    if (newDark) {
      document.documentElement.classList.add(DARK_THEME);
      localStorage.setItem(LOCAL_STORAGE_KEY, DARK_THEME);
    } else {
      document.documentElement.classList.remove(DARK_THEME);
      localStorage.setItem(LOCAL_STORAGE_KEY, LIGHT_THEME);
    }
    dispatch({ type: "TOGGLE_DARK_MODE" });
  }

  return (
    <UiContext.Provider value={{ isSidebarOpen, openSidebar, closeSidebar, isDarkMode, toggleDarkMode }}>
      {children}
    </UiContext.Provider>
  );
}

function useUi() {
  const context = useContext(UiContext);
  if (!context) throw new Error("useUi must be inside UiProvider");
  return context;
}

export { UiProvider, useUi };
