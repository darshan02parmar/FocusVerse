let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;
let isPaused = false; // Tracks if the timer is paused (stopped mid-session)

let isFocusMode = true;
const minutesDisplay      = document.getElementById("minutes");
const secondsDisplay      = document.getElementById("seconds");
const timerDisplay        = document.getElementById("timerDisplay");
const pauseStatus         = document.getElementById("pauseStatus");
const distractionMessage  = document.getElementById("distractionmessage");
const quoteBox            = document.getElementById("quoteBox");
const bgMusic             = document.getElementById("bgMusic");
const alarmSound          = document.getElementById("alarmSound");
const customFocusInput    = document.getElementById("customFocusMinutes");
const customBreakInput    = document.getElementById("customBreakMinutes");
const streakDisplay       = document.getElementById("streakDisplay");
const volumeSlider        = document.getElementById("volumeControlSlider");
const volumeControl       = document.getElementById("volumeControl");

const fallbackQuotes = [
  "🌿 Stay calm and keep going...",
  "✨ One step at a time!",
  "💪 You’re doing great!",
  "🚀 Focus fuels success!",
  "🔥 Don’t stop now!"
];

function updateDisplay() {
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (minutesDisplay && secondsDisplay) {
    minutesDisplay.textContent = mm;
    secondsDisplay.textContent = ss;
  }

  if (timerDisplay) {
    timerDisplay.textContent = `${mm} : ${ss}`;
  }
   document.title = isRunning
    ? `${isFocusMode ? "Focus" : "Break"}: ${mm}:${ss} remaining`
    : "FocusVerse – Ready to begin";
  if (isRunning) {
    document.title = `Focus: ${mm}:${ss} remaining`;
  } else if (isPaused && (minutes > 0 || seconds > 0)) {
    document.title = `Paused at ${mm}:${ss} – FocusVerse`;
  } else {
    document.title = "FocusVerse – Ready to begin";
  }

}

function startButton() {
  if (isRunning) return;

  const focusMinutes = parseInt(customFocusInput.value) || 25;
  const breakMinutes = parseInt(customBreakInput.value) || 5;
  minutes = isFocusMode ? focusMinutes : breakMinutes;
  seconds = 0;
  // Determine if we are resuming or starting fresh
  const isFinished = minutes === 0 && seconds === 0;
  const isTimerHidden = timerDisplay && timerDisplay.style.display === "none";
  const startingFresh = !isPaused || isFinished || isTimerHidden;

  if (startingFresh) {
    const inputMinutes = parseInt(customMinutesInput.value);
    if (isNaN(inputMinutes) || inputMinutes <= 0) {
      alert("Please enter valid minutes!");
      return;
    }
    minutes = inputMinutes;
    seconds = 0;
  }

  // Prepare UI
  if (pauseStatus) pauseStatus.style.display = "none";
  isPaused = false;
  updateDisplay();

  customFocusInput.style.display = "none";
  customBreakInput.style.display = "none";
  document.querySelectorAll(".minute").forEach(el => el.style.display = "none");

  if (timerDisplay) timerDisplay.style.display = "inline-block";

  isRunning = true;

  timer = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(timer);
        isRunning = false;
        isPaused = false;
        if (pauseStatus) pauseStatus.style.display = "none";

        if (alarmSound) alarmSound.play();

        if (isFocusMode) {
          alert("⏰ Focus session complete! Time for a break.");
          updateStreakOnSessionComplete();
        } else {
          alert("✅ Break over! Time to focus.");
        }
        isFocusMode = !isFocusMode;
        startButton(); 
        return;
      }
      minutes--;
      seconds = 59;
    } else {
      seconds--;
    }
    updateDisplay();
  }, 1000);
}


function stopButton() {
  if (!isRunning) return;
  clearInterval(timer);
  isRunning = false;
  isPaused = true;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (pauseStatus) {
    pauseStatus.textContent = `⏸️ Paused at ${mm}:${ss}`;
    pauseStatus.style.display = "block";
  }
  updateDisplay();
}

function resetButton() {
  const confirmReset = confirm("Reset the timer? This will clear the current session and progress for this cycle.");
  if (!confirmReset) return;

  clearInterval(timer);
  isRunning = false;
  isFocusMode = true;
  minutes = parseInt(customFocusInput.value) || 25;
  isPaused = false;
  minutes = 25;
  seconds = 0;

  customFocusInput.style.display = "inline-block";
  customBreakInput.style.display = "inline-block";
  document.querySelectorAll(".minute").forEach(el => el.style.display = "inline-block");

  if (timerDisplay) timerDisplay.style.display = "none";
  if (pauseStatus) pauseStatus.style.display = "none";

  distractionMessage.innerHTML = "";
  quoteBox.textContent = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  updateDisplay();
}

function gotdistracted() {
  distractionMessage.innerHTML = "🚨 Distraction Detected! Take a breath and refocus ✨";
}

function controlVolume() {
  bgMusic.volume = volumeSlider.value / 100;
  volumeSlider.addEventListener("input", function () {
    bgMusic.volume = this.value / 100;
    this.style.background = `linear-gradient(to right, rgb(150, 73, 5) ${this.value}%, #ccc ${this.value}%)`;
  });
}

function toggleMusic() {
  if (bgMusic.paused) {
    bgMusic.play();
    controlVolume();
    volumeControl.style.display = "inline";
  } else {
    bgMusic.pause();
    volumeControl.style.display = "none";
  }
}

function fetchRandomQuotes() {
  const url = 'https://corsproxy.io/?https://api.quotable.io/random?maxLength=100';
  fetch(url)
    .then(res => res.json())
    .then(data => {
      quoteBox.textContent = `"${data.content}" - ${data.author}`;
    })
    .catch(() => {
      quoteBox.textContent = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    });
}

function updateStreakOnSessionComplete() {
  let streak = localStorage.getItem('focusStreak');
  streak = streak ? parseInt(streak) + 1 : 1;
  localStorage.setItem('focusStreak', streak);
  displayStreak();
}

function displayStreak() {
  let streak = localStorage.getItem('focusStreak') || 0;
  streakDisplay.textContent = `🔥 Your Focus Streak: ${streak} sessions`;
}

window.addEventListener('offline', () => alert("📴 You're offline – timer and data still available!"));
window.addEventListener('online', () => alert("🌐 You're back online!"));

window.onload = () => {
  updateDisplay();
  fetchRandomQuotes();
  displayStreak();
};
