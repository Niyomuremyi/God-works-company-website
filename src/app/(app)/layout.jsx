// import { SanityLive } from "@/sanity/lib/live";
// import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/app/Header";
// import { AppShell } from "@/components/app/AppShell";
// import { CartSheet } from "@/components/app/CartSheet";
// import { ChatSheet } from "@/components/app/ChatSheet";

function AppLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      {/* <CartSheet />
      <ChatSheet /> */}
      {/* <Toaster position="bottom-center" /> */}
      {/* <SanityLive /> */}
    </>
  );
}

export default AppLayout;