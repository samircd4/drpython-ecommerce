import React from "react";
import Navbar from "./Navbar";
import AnnouncementBar from "./AnnouncementBar";

const Header = () => {
    return (
        <header className="sticky top-0 z-[60] w-full flex flex-col">
            <AnnouncementBar />
            <Navbar />
        </header>
    );
};

export default Header;
