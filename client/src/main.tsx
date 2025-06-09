import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Google Fonts for Roboto and Material Icons
const robotoFont = document.createElement("link");
robotoFont.rel = "stylesheet";
robotoFont.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap";
document.head.appendChild(robotoFont);

const materialIcons = document.createElement("link");
materialIcons.rel = "stylesheet";
materialIcons.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
document.head.appendChild(materialIcons);

// Add title
const title = document.createElement("title");
title.textContent = "SafeChat - Smart-Moderated Group Chat";
document.head.appendChild(title);

createRoot(document.getElementById("root")!).render(<App />);
