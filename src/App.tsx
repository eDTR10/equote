import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "./components/mode-toggle";
import { Outlet } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";

function App() {

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppContextProvider>
        <div className="bg-background min-h-screen w-full overflow-hidden flex flex-col">
          {/* Add theme toggle button in top-right corner */}
          <div className="absolute top-4 right-4 z-50">
            <ModeToggle />
          </div>

          <Outlet />
        </div>
      </AppContextProvider>
    </ThemeProvider>
  )
}



export default App
