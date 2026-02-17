const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCountDisplay = document.getElementById("attendeeCount");
const waterProgress = document.getElementById("waterProgress");
const zeroProgress = document.getElementById("zeroProgress");
const powerProgress = document.getElementById("powerProgress");
const greetingDisplay = document.getElementById("greeting");
const attendeeListDisplay = document.getElementById("attendeeList");

let count = 0;
const maxCount = 50; // maximum count for check-ins
const teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
let attendees = [];
let celebrationShown = false;

// Load data from local storage
function loadFromStorage() {
  const savedCount = localStorage.getItem("attendeeCount");
  const savedTeamCounts = localStorage.getItem("teamCounts");
  const savedAttendees = localStorage.getItem("attendees");
  const savedCelebration = localStorage.getItem("celebrationShown");

  if (savedCount) {
    count = parseInt(savedCount);
    attendeeCountDisplay.textContent = count;
  }

  if (savedTeamCounts) {
    const parsed = JSON.parse(savedTeamCounts);
    teamCounts.water = parsed.water;
    teamCounts.zero = parsed.zero;
    teamCounts.power = parsed.power;

    document.getElementById("waterCount").textContent = teamCounts.water;
    document.getElementById("zeroCount").textContent = teamCounts.zero;
    document.getElementById("powerCount").textContent = teamCounts.power;

    updateProgressBars();
  }

  if (savedAttendees) {
    attendees = JSON.parse(savedAttendees);
    updateAttendeeList();
  }

  if (savedCelebration) {
    celebrationShown = savedCelebration === "true";
  }

  updateBackgroundGradient();
}

// Save data to local storage
function saveToStorage() {
  localStorage.setItem("attendeeCount", count);
  localStorage.setItem("teamCounts", JSON.stringify(teamCounts));
  localStorage.setItem("attendees", JSON.stringify(attendees));
  localStorage.setItem("celebrationShown", celebrationShown);
}

// Update progress bars
function updateProgressBars() {
  const waterPercent = (teamCounts.water / maxCount) * 100;
  const zeroPercent = (teamCounts.zero / maxCount) * 100;
  const powerPercent = (teamCounts.power / maxCount) * 100;

  waterProgress.style.width = `${waterPercent}%`;
  zeroProgress.style.width = `${zeroPercent}%`;
  powerProgress.style.width = `${powerPercent}%`;
}

// Update background color based on winning team
function updateBackgroundGradient() {
  let winningTeam = "water";
  let maxTeamCount = teamCounts.water;

  if (teamCounts.zero > maxTeamCount) {
    winningTeam = "zero";
    maxTeamCount = teamCounts.zero;
  }
  if (teamCounts.power > maxTeamCount) {
    winningTeam = "power";
  }

  const gradients = {
    water: "linear-gradient(135deg, #d4d4d4 0%, #d4d4d4 50%, #c0d9eb 100%)",
    zero: "linear-gradient(135deg, #d4d4d4 0%, #d4d4d4 50%, #c8e6c0 100%)",
    power: "linear-gradient(135deg, #d4d4d4 0%, #d4d4d4 50%, #ffe0c0 100%)",
  };

  document.body.style.background = gradients[winningTeam];
}

// Update attendee list display
function updateAttendeeList() {
  const visibleList = document.getElementById("attendeeListVisible");
  const hiddenList = document.getElementById("attendeeListHidden");
  const showMoreBtn = document.getElementById("showMoreBtn");

  visibleList.innerHTML = "";
  hiddenList.innerHTML = "";

  const maxVisible = 4;

  attendees.forEach(function (attendee, index) {
    const item = document.createElement("div");
    item.className = "attendee-item";

    const nameSpan = document.createElement("span");
    nameSpan.className = "attendee-name";
    nameSpan.textContent = attendee.name;

    const teamSpan = document.createElement("span");
    teamSpan.className = `attendee-team ${attendee.team}`;
    teamSpan.textContent = attendee.teamName;

    item.appendChild(nameSpan);
    item.appendChild(teamSpan);

    if (index < maxVisible) {
      visibleList.appendChild(item);
    } else {
      hiddenList.appendChild(item);
    }
  });

  if (attendees.length > maxVisible) {
    showMoreBtn.style.display = "block";
  } else {
    showMoreBtn.style.display = "none";
  }
}

// Show celebration with confetti
function showCelebration(winningTeam, teamName) {
  if (celebrationShown) {
    return;
  }

  celebrationShown = true;
  saveToStorage();

  const messages = [
    `${teamName} is fully assembled!`,
    `${teamName} has joined the party--Lets go!`,
    `${teamName} is all together now. All together now!`,
  ];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  greetingDisplay.textContent = randomMessage;
  greetingDisplay.className = `celebration-message ${winningTeam}`;
  greetingDisplay.style.display = "block";

  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
  });

  setTimeout(function () {
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
  }, 250);

  setTimeout(function () {
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });
  }, 400);
}

// Check if goal is reached
function checkGoalReached() {
  if (count >= maxCount && !celebrationShown) {
    let winningTeam = "water";
    let maxTeamCount = teamCounts.water;

    if (teamCounts.zero > maxTeamCount) {
      winningTeam = "zero";
      maxTeamCount = teamCounts.zero;
    }
    if (teamCounts.power > maxTeamCount) {
      winningTeam = "power";
    }

    const teamNames = {
      water: "Team Water Wise",
      zero: "Team Net Zero",
      power: "Team Renewables",
    };

    showCelebration(winningTeam, teamNames[winningTeam]);
  }
}

// submitted user values are logged to the console
form.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;
  console.log(name, teamName);

  //check-in count is updated
  count++;
  console.log("Total check-ins: ", count);

  const percentage = Math.round((count / maxCount) * 100) + "%";
  console.log(`Progress: ${percentage}`);

  attendeeCountDisplay.textContent = count;
  attendeeCountDisplay.classList.remove("count-roll");
  void attendeeCountDisplay.offsetWidth;
  attendeeCountDisplay.classList.add("count-roll");

  teamCounts[team] = teamCounts[team] + 1;

  // team counter
  const teamCount = document.getElementById(team + "Count");
  teamCount.textContent = teamCounts[team];

  updateProgressBars();
  updateBackgroundGradient();

  // Add attendee to list
  attendees.push({
    name: name,
    team: team,
    teamName: teamName,
  });
  updateAttendeeList();

  // Save to local storage
  saveToStorage();

  // Welcome message
  const message = `Welcome, ${name} from ${teamName}!`;
  greetingDisplay.textContent = message;
  greetingDisplay.className = "success-message";
  greetingDisplay.style.display = "block";

  setTimeout(function () {
    greetingDisplay.style.display = "none";
  }, 4000);

  console.log(message);

  // Check if goal is reached
  checkGoalReached();

  form.reset();
});

// Toggle button text on collapse
const showMoreBtn = document.getElementById("showMoreBtn");
const collapseElement = document.getElementById("attendeeListCollapse");

if (collapseElement) {
  collapseElement.addEventListener("shown.bs.collapse", function () {
    showMoreBtn.querySelector(".show-text").style.display = "none";
    showMoreBtn.querySelector(".hide-text").style.display = "inline";
  });

  collapseElement.addEventListener("hidden.bs.collapse", function () {
    showMoreBtn.querySelector(".show-text").style.display = "inline";
    showMoreBtn.querySelector(".hide-text").style.display = "none";
  });
}

// Load saved data on page load
loadFromStorage();
