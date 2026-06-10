import React from "react";
import { TopBar } from "./TopBar";
import { Overlay } from "./Overlay";
import { Sidebar } from "./sidebar/Sidebar";
import { DashboardProvider } from "./Provider";

interface LayoutProps {
  children: React.ReactNode;
}

const style = {
  container: "bg-[#f4f7f6] h-screen overflow-hidden relative",
  mainContainer:
    "flex flex-col h-screen pl-0 w-full lg:w-[calc(100%-17rem)]",
  main: "h-screen overflow-auto pb-24 pt-6 px-4 md:px-8 lg:pb-10",
};

export function DashboardLayout(props: LayoutProps) {
  return (
    <DashboardProvider>
      <div className={style.container}>
        <div className="flex items-start">
          <Overlay />
          <Sidebar mobileOrientation="start" />
          <div className={style.mainContainer}>
            <TopBar />
            <main className={style.main}>{props.children}</main>
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
}
