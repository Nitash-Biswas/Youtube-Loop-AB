// Variables to hold the timestamps and loop interval
let timeA = null;
let timeB = null;
let interval = null;

console.log("YouTube AB Loop Extension Loaded");

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
  button.classList.add("ab-loop-button");

  button.addEventListener("click", (e) => {
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

  // Look for YouTube video container
  const videoContainer = document.querySelector(".html5-video-container");
  if (!videoContainer) return;

  // Container for the buttons
  const container = document.createElement("div");
  container.id = "ab-loop-controls";

  const video = document.querySelector("video");

  // --- Set A ---
  const btnA = createButton("Set A", () => {
    if (timeA !== null) {
      timeA = null;
      btnA.textContent = "Set A";
      btnA.classList.remove("green");
      return;
    }

    timeA = video.currentTime;
    btnA.textContent = `Set A : (${formatTime(timeA)})`;
    btnA.classList.add("green");
  });

  // --- Set B ---
  const btnB = createButton("Set B", () => {
    const tentativeB = video.currentTime;

    if (timeB !== null) {
      timeB = null;
      btnB.textContent = "Set B";
      btnB.classList.remove("green");
      stopLoop();
      return;
    }

    if (timeA === null || timeA >= tentativeB) {
      alert("Please set both A and B points correctly where A < B");
      return;
    }

    timeB = tentativeB;
    btnB.textContent = `Set B : (${formatTime(timeB)})`;
    btnB.classList.add("green");

    startLoop();
  });

  // --- Clear ---
  const btnClear = createButton("Clear", () => {
    stopLoop();
    timeA = null;
    timeB = null;

    btnA.textContent = "Set A";
    btnA.classList.remove("green");

    btnB.textContent = "Set B";
    btnB.classList.remove("green");
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
      if (video.currentTime >= timeB || video.currentTime < timeA) {
        video.currentTime = timeA;
      }
    }, 500);
  }
}

// Stop the loop
function stopLoop() {
  clearInterval(interval);
}

// Observe DOM changes to detect when the video container is available
const observer = new MutationObserver(() => {
  const videoContainer = document.querySelector(".html5-video-container");
  if (videoContainer) {
    injectControls();
    observer.disconnect(); // Stop observing once the container is found
  }
});

// Start observing the body for changes
observer.observe(document.body, { childList: true, subtree: true });