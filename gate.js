(function () {
  const GATE_PASSWORD = "qaopen";
  const GATE_SESSION_KEY = "the-floor-gate-unlocked";

  const overlay = document.getElementById("gate-overlay");
  const input = document.getElementById("gate-input");
  const error = document.getElementById("gate-error");
  const submitBtn = document.getElementById("gate-submit-btn");

  if (sessionStorage.getItem(GATE_SESSION_KEY) === "1") {
    overlay.classList.add("hidden");
  } else {
    input.focus();
  }

  function tryUnlock() {
    if (input.value === GATE_PASSWORD) {
      sessionStorage.setItem(GATE_SESSION_KEY, "1");
      overlay.classList.add("hidden");
    } else {
      error.classList.remove("hidden");
      input.value = "";
      input.focus();
    }
  }

  submitBtn.addEventListener("click", tryUnlock);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      tryUnlock();
    }
  });
})();
