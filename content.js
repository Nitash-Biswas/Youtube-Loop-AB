// Variables to hold the timestamps and loop interval
let timeA = null;
let timeB = null;
let interval = null;

console.log("YouTube AB Loop Extension Loaded");

// Look for YouTube video container
const videoContainer = document.querySelector(".html5-video-container");

// Format time as SS, MM:SS, or HH:MM:SS depending on duration
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (seconds < 60) {
    return `${secs}s`; // Only seconds
  } else if (seconds < 3600) {
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  } else {
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  }
}

// Utility to create a styled button
function createButton(text, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.style =
      "background-color: #FF0000; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background-color 0.2s;";

    button.addEventListener("mouseenter", () => {
      button.style.backgroundColor = "#cc0000";
    });

    button.addEventListener("mouseleave", () => {
      if (text.includes("A") && timeA === null) {
        button.style.backgroundColor = "#FF0000";
      } else if (text.includes("B") && timeB === null) {
        button.style.backgroundColor = "#FF0000";
      } else if (text.includes("Clear")) {
        button.style.backgroundColor = "#FF0000"; // ensures Clear stays red
      }
    });

    button.addEventListener("click", (e)=>{
        e.stopPropagation(); // Prevents event bubbling
        onClick();
    });

    return button;
  }


// Add custom controls to the YouTube page
function injectControls() {
  // Prevent injecting controls multiple times
  const existing = document.getElementById("ab-loop-controls");
  if (existing) return;

  // Container for the buttons
  const container = document.createElement("div");
  container.id = "ab-loop-controls";
  container.style.position = "absolute";
  container.style.top = "20px";
  container.style.left = "20px";
  container.style.zIndex = "999999";
  container.style.background = "rgba(0, 0, 0, 0.85)";
  container.style.padding = "10px";
  container.style.borderRadius = "8px";
  container.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  container.style.display = "flex";
  container.style.gap = "10px";

  const video = document.querySelector("video");

  // --- Set A ---
  const btnA = createButton("Set A", () => {
    if (timeA !== null) {
      timeA = null;
      btnA.textContent = "Set A";
      btnA.style.backgroundColor = "#FF0000";
      return;
    }

    timeA = video.currentTime;
    btnA.textContent = `Set A : (${formatTime(timeA)})`;
    btnA.style.backgroundColor = "#32a729";
  });

  // --- Set B ---
  const btnB = createButton("Set B", () => {
    const tentativeB = video.currentTime;

    if (timeB !== null) {
      timeB = null;
      btnB.textContent = "Set B";
      btnB.style.backgroundColor = "#FF0000";
      stopLoop();
      return;
    }

    if (timeA === null || timeA >= tentativeB) {
      alert("Please set both A and B points correctly where A < B");
      return;
    }

    timeB = tentativeB;
    btnB.textContent = `Set B : (${formatTime(timeB)})`;
    btnB.style.backgroundColor = "#32a729";

    startLoop();
  });

  // --- Clear ---
  const btnClear = createButton("Clear", () => {
    stopLoop();
    timeA = null;
    timeB = null;

    btnA.textContent = "Set A";
    btnA.style.backgroundColor = "#FF0000";

    btnB.textContent = "Set B";
    btnB.style.backgroundColor = "#FF0000";
  });

   // -- Go to A when key "Q" is pressed --
   document.addEventListener("keydown", (e) => {
    if (e.key === "q" || e.key === "Q") {
      if (timeA !== null) {
        video.currentTime = timeA;
      }
    }
  });

  // Append buttons
  container.appendChild(btnA);
  container.appendChild(btnB);
  container.appendChild(btnClear);

  videoContainer.style.position = "relative";
  videoContainer.appendChild(container);
}

// Start the A-B loop
function startLoop() {
  if (timeA !== null && timeB !== null && timeA < timeB) {
    clearInterval(interval);
    interval = setInterval(() => {
      const video = document.querySelector("video");
      if (video.currentTime >= timeB) {
        video.currentTime = timeA;
      }
    }, 500);
  }
}

// Stop the loop
function stopLoop() {
  clearInterval(interval);
}

// Inject controls when ready
injectControls();
