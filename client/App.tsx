import "./global.css";

import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "@/lib/context/CartContext";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import AppWrapper from "@/components/AppWrapper";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CartProvider>
        <BrowserRouter>
          <AppWrapper />
        </BrowserRouter>
      </CartProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
