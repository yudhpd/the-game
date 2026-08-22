(function () {
  const COUNT_OPTIONS = [4, 6, 9, 12, 16, 20];
  const GRID_LAYOUTS = {
    4: { cols: 2, rows: 2 },
    6: { cols: 3, rows: 2 },
    9: { cols: 3, rows: 3 },
    12: { cols: 4, rows: 3 },
    16: { cols: 4, rows: 4 },
    20: { cols: 5, rows: 4 },
  };
  const PLAYER_COLORS = [
    "#ff5757", "#4d9dff", "#ffb84d", "#7ed957", "#c77dff",
    "#ff6ec7", "#4ddbc4", "#ffe14d", "#9d7dff", "#ff8c42",
    "#4dff88", "#ff4d6d", "#4dc9ff", "#c9ff4d", "#ff4dde",
    "#4dffd9", "#d9a066", "#a0e8ff", "#ff9d4d", "#7c8cff",
  ];

  const LIFE_SECONDS = 45;
  const PASS_PENALTY_SECONDS = 3;
  const IMAGE_CHANGE_DELAY_MS = 1000;
  const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
  const RANDOMIZER_TICK_MS = 100;
  const RANDOMIZER_TICKS = 15;
  const COIN_TOSS_TICKS = 10;
  const COUNTDOWN_START = 3;
  const COUNTDOWN_TICK_MS = 1000;

  const DEMO_LIFE_SECONDS = 15;
  const DEMO_PASS_PENALTY_SECONDS = 3;
  const DEMO_TRANSITION_MS = 700;

  const els = {
    mainMenuScreen: document.getElementById("main-menu-screen"),
    menuTheFloorCard: document.getElementById("menu-the-floor-card"),
    menuBackBtn: document.getElementById("menu-back-btn"),
    setupCountScreen: document.getElementById("setup-count-screen"),
    countGrid: document.getElementById("count-grid"),
    setupRosterScreen: document.getElementById("setup-roster-screen"),
    rosterForm: document.getElementById("roster-form"),
    rosterError: document.getElementById("roster-error"),
    rosterBackBtn: document.getElementById("roster-back-btn"),
    rosterStartBtn: document.getElementById("roster-start-btn"),
    randomizerOverlay: document.getElementById("randomizer-overlay"),
    randomizerName: document.getElementById("randomizer-name"),
    randomizerContinueBtn: document.getElementById("randomizer-continue-btn"),
    countdownOverlay: document.getElementById("countdown-overlay"),
    countdownTitle: document.getElementById("countdown-title"),
    countdownNumber: document.getElementById("countdown-number"),
    gameScreen: document.getElementById("game-screen"),
    gameoverScreen: document.getElementById("gameover-screen"),
    rosterBar: document.getElementById("roster-bar"),
    grid: document.getElementById("grid"),
    turnIndicator: document.getElementById("turn-indicator"),
    hintText: document.getElementById("hint-text"),
    duelOverlay: document.getElementById("duel-overlay"),
    duelRoundBadge: document.getElementById("duel-round-badge"),
    duelCategory: document.getElementById("duel-category"),
    lifeChallenger: document.getElementById("life-challenger"),
    lifeChallengerName: document.getElementById("life-challenger-name"),
    lifeChallengerFill: document.getElementById("life-challenger-fill"),
    lifeChallengerSeconds: document.getElementById("life-challenger-seconds"),
    lifeDefender: document.getElementById("life-defender"),
    lifeDefenderName: document.getElementById("life-defender-name"),
    lifeDefenderFill: document.getElementById("life-defender-fill"),
    lifeDefenderSeconds: document.getElementById("life-defender-seconds"),
    questionImage: document.getElementById("question-image"),
    imagePlaceholder: document.getElementById("image-placeholder"),
    placeholderPath: document.getElementById("placeholder-path"),
    hostAnswer: document.getElementById("host-answer"),
    hostAnswerText: document.getElementById("host-answer-text"),
    correctBtn: document.getElementById("correct-btn"),
    passBtn: document.getElementById("pass-btn"),
    duelLog: document.getElementById("duel-log"),
    outOfQuestionsOverlay: document.getElementById("out-of-questions-overlay"),
    outOfQuestionsSub: document.getElementById("out-of-questions-sub"),
    outOfQuestionsBtn: document.getElementById("out-of-questions-btn"),
    coinTossOverlay: document.getElementById("coin-toss-overlay"),
    coinTossName: document.getElementById("coin-toss-name"),
    coinTossContinueBtn: document.getElementById("coin-toss-continue-btn"),
    turnChoiceOverlay: document.getElementById("turn-choice-overlay"),
    turnChoiceTitle: document.getElementById("turn-choice-title"),
    keepPlayingBtn: document.getElementById("keep-playing-btn"),
    passTurnBtn: document.getElementById("pass-turn-btn"),
    round2ConfirmOverlay: document.getElementById("round2-confirm-overlay"),
    round2ConfirmTitle: document.getElementById("round2-confirm-title"),
    round2ConfirmCategory: document.getElementById("round2-confirm-category"),
    round2ConfirmBtn: document.getElementById("round2-confirm-btn"),
    finalPickerOverlay: document.getElementById("final-picker-overlay"),
    finalPickerInput: document.getElementById("final-picker-input"),
    finalPickerDropdown: document.getElementById("final-picker-dropdown"),
    finalPickerConfirmBtn: document.getElementById("final-picker-confirm-btn"),
    winnerTitle: document.getElementById("winner-title"),
    winnerSub: document.getElementById("winner-sub"),
    playAgainBtn: document.getElementById("play-again-btn"),
    demoYouTimer: document.getElementById("demo-life-you"),
    demoYouSeconds: document.getElementById("demo-you-seconds"),
    demoYouFill: document.getElementById("demo-you-fill"),
    demoOppTimer: document.getElementById("demo-life-opp"),
    demoOppSeconds: document.getElementById("demo-opp-seconds"),
    demoOppFill: document.getElementById("demo-opp-fill"),
    demoClue: document.getElementById("demo-clue"),
    demoLog: document.getElementById("demo-log"),
    demoCorrectBtn: document.getElementById("demo-correct-btn"),
    demoPassBtn: document.getElementById("demo-pass-btn"),
    demoRestartBtn: document.getElementById("demo-restart-btn"),
  };

  /** @type {{cols:number, rows:number, players:Array, squares:Array, chooser:number}} */
  let state = null;

  /** duel-scoped transient state */
  let duel = null;
  let timerHandle = null;

  let rosterRows = [];
  let pendingWinner = null;

  function shuffled(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function darken(hex, factor) {
    const c = hex.replace("#", "");
    const r = Math.round(parseInt(c.substring(0, 2), 16) * factor);
    const g = Math.round(parseInt(c.substring(2, 4), 16) * factor);
    const b = Math.round(parseInt(c.substring(4, 6), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // ---------- Save / resume across page reloads ----------

  const SAVE_KEY = "the-floor-save-v1";

  function saveGame(phase, winnerIndex) {
    if (!state) return;
    try {
      const payload = {
        phase,
        winnerIndex: winnerIndex ?? null,
        state: {
          cols: state.cols,
          rows: state.rows,
          players: state.players,
          squares: state.squares,
          chooser: state.chooser,
        },
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (e) {
      // localStorage unavailable (e.g. private browsing) — just skip saving
    }
  }

  function clearSavedGame() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      // ignore
    }
  }

  function loadSavedGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      const s = payload && payload.state;
      if (!s || !Array.isArray(s.players) || !Array.isArray(s.squares)) {
        return null;
      }
      // Guard against saves from an older/incompatible version of questions.js
      // (e.g. category list changed size since the save was made).
      const maxCat = CATEGORIES.length - 1;
      const categoriesStillValid = s.players.every(
        (p) => Number.isInteger(p.activeCategoryIndex) && p.activeCategoryIndex >= 0 && p.activeCategoryIndex <= maxCat
      );
      if (!categoriesStillValid) return null;
      return payload;
    } catch (e) {
      return null;
    }
  }

  // ---------- Setup screen: mini duel demo (Roman Numerals) ----------
  // A self-contained preview of the duel mechanic for first-time players —
  // shorter clocks, no real game state, safe to start/stop freely whenever
  // the setup-count screen shows or hides.

  let demoTimerHandle = null;
  let demoState = null;

  function toRoman(num) {
    const table = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    let out = "";
    table.forEach(([val, sym]) => {
      while (num >= val) {
        out += sym;
        num -= val;
      }
    });
    return out;
  }

  function demoTimerEl(side) {
    return side === "you" ? els.demoYouTimer : els.demoOppTimer;
  }
  function demoSecondsEl(side) {
    return side === "you" ? els.demoYouSeconds : els.demoOppSeconds;
  }
  function demoFillEl(side) {
    return side === "you" ? els.demoYouFill : els.demoOppFill;
  }

  function stopDuelDemo() {
    if (demoTimerHandle) clearInterval(demoTimerHandle);
    demoTimerHandle = null;
  }

  function nextDemoClue() {
    const n = 1 + Math.floor(Math.random() * 36);
    els.demoClue.textContent = toRoman(n);
  }

  function updateDemoUI() {
    ["you", "opp"].forEach((side) => {
      const pct = Math.max(0, (demoState.times[side] / DEMO_LIFE_SECONDS) * 100);
      demoFillEl(side).style.width = `${pct}%`;
      demoSecondsEl(side).textContent = Math.max(0, demoState.times[side]).toFixed(1);
      demoTimerEl(side).classList.toggle("active", demoState.active === side);
    });
  }

  // Resets to a paused, not-yet-ticking state — used on first load and
  // whenever the setup screen reappears, so the clock never silently burns
  // down while someone's still reading the rules above it.
  function startDuelDemo() {
    stopDuelDemo();
    demoState = { times: { you: DEMO_LIFE_SECONDS, opp: DEMO_LIFE_SECONDS }, active: "you", lastTick: null, started: false, ended: false, transitioning: false };
    els.demoCorrectBtn.disabled = true;
    els.demoPassBtn.disabled = true;
    els.demoYouTimer.classList.remove("lost");
    els.demoOppTimer.classList.remove("lost");
    els.demoYouSeconds.classList.remove("passed");
    els.demoOppSeconds.classList.remove("passed");
    els.demoLog.textContent = "Click Start to try a duel.";
    els.demoRestartBtn.textContent = "▶ Start demo";
    els.demoRestartBtn.classList.remove("hidden");
    nextDemoClue();
    updateDemoUI();
  }

  // The clocks only actually start moving once this fires (from the Start/Restart button).
  function beginDemoRound() {
    demoState.started = true;
    els.demoRestartBtn.classList.add("hidden");
    els.demoCorrectBtn.disabled = false;
    els.demoPassBtn.disabled = false;
    els.demoLog.textContent = "What number is this?";
    demoState.lastTick = performance.now();
    demoTimerHandle = setInterval(tickDemoClock, 100);
  }

  function tickDemoClock() {
    if (!demoState || demoState.ended || demoState.transitioning) return;
    const now = performance.now();
    const delta = (now - demoState.lastTick) / 1000;
    demoState.lastTick = now;
    demoState.times[demoState.active] -= delta;

    if (demoState.times[demoState.active] <= 0) {
      demoState.times[demoState.active] = 0;
      updateDemoUI();
      endDuelDemo(demoState.active);
      return;
    }
    updateDemoUI();
  }

  function endDuelDemo(loserSide) {
    stopDuelDemo();
    demoState.ended = true;
    demoTimerEl(loserSide).classList.add("lost");
    const loserLabel = loserSide === "you" ? "Your" : "The opponent's";
    els.demoLog.textContent = `${loserLabel} clock ran out — that's an elimination for real!`;
    els.demoCorrectBtn.disabled = true;
    els.demoPassBtn.disabled = true;
    els.demoRestartBtn.textContent = "↺ Restart demo";
    els.demoRestartBtn.classList.remove("hidden");
  }

  function scheduleNextDemoClue() {
    stopDuelDemo(); // pause both clocks during the transition, just like a real duel
    demoState.transitioning = true;
    els.demoCorrectBtn.disabled = true;
    els.demoPassBtn.disabled = true;
    setTimeout(() => {
      if (!demoState || demoState.ended) return;
      demoState.transitioning = false;
      els.demoCorrectBtn.disabled = false;
      els.demoPassBtn.disabled = false;
      els.demoYouSeconds.classList.remove("passed");
      els.demoOppSeconds.classList.remove("passed");
      nextDemoClue();
      demoState.lastTick = performance.now();
      demoTimerHandle = setInterval(tickDemoClock, 100);
    }, DEMO_TRANSITION_MS);
  }

  els.demoCorrectBtn.addEventListener("click", () => {
    if (!demoState || demoState.ended || demoState.transitioning) return;
    const scorer = demoState.active;
    els.demoLog.textContent = scorer === "you" ? "Correct! Opponent's turn." : "Opponent got it — your turn.";
    demoState.active = demoState.active === "you" ? "opp" : "you";
    updateDemoUI();
    scheduleNextDemoClue();
  });

  els.demoPassBtn.addEventListener("click", () => {
    if (!demoState || demoState.ended || demoState.transitioning) return;
    demoState.times[demoState.active] = Math.max(0, demoState.times[demoState.active] - DEMO_PASS_PENALTY_SECONDS);
    updateDemoUI();
    demoSecondsEl(demoState.active).classList.add("passed");
    els.demoLog.textContent = `${demoState.active === "you" ? "You" : "Opponent"} passed (-${DEMO_PASS_PENALTY_SECONDS}s).`;
    if (demoState.times[demoState.active] <= 0) {
      endDuelDemo(demoState.active);
      return;
    }
    scheduleNextDemoClue();
  });

  els.demoRestartBtn.addEventListener("click", () => {
    if (demoState && demoState.ended) startDuelDemo(); // full reset, back to paused
    beginDemoRound();
  });

  document.addEventListener("keydown", (e) => {
    if (!demoState || !demoState.started || demoState.ended || demoState.transitioning) return;
    if (els.setupCountScreen.classList.contains("hidden")) return;
    const key = e.key.toLowerCase();
    if (key === "c" || key === "arrowright" || key === "enter") {
      e.preventDefault();
      els.demoCorrectBtn.click();
    } else if (key === "p" || key === "arrowleft" || key === " ") {
      e.preventDefault();
      els.demoPassBtn.click();
    }
  });

  // ---------- Main menu ----------

  function enterTheFloor() {
    els.mainMenuScreen.classList.add("hidden");
    els.setupCountScreen.classList.remove("hidden");
    startDuelDemo();
  }

  function returnToMainMenu() {
    stopDuelDemo();
    els.setupCountScreen.classList.add("hidden");
    els.mainMenuScreen.classList.remove("hidden");
  }

  els.menuTheFloorCard.addEventListener("click", enterTheFloor);
  els.menuBackBtn.addEventListener("click", returnToMainMenu);

  // ---------- Setup: player count ----------

  COUNT_OPTIONS.forEach((n) => {
    const btn = document.createElement("button");
    btn.className = "count-btn";
    const layout = GRID_LAYOUTS[n];
    btn.innerHTML = `${n}<span class="count-label">${layout.cols}×${layout.rows} board</span>`;
    btn.addEventListener("click", () => selectPlayerCount(n));
    els.countGrid.appendChild(btn);
  });

  function selectPlayerCount(n) {
    stopDuelDemo();
    buildRosterForm(n);
    els.setupCountScreen.classList.add("hidden");
    els.setupRosterScreen.classList.remove("hidden");
    els.rosterError.classList.add("hidden");
  }

  // ---------- Setup: roster ----------

  function buildRosterForm(n) {
    els.rosterForm.innerHTML = "";
    rosterRows = [];
    for (let i = 0; i < n; i++) {
      const row = document.createElement("div");
      row.className = "roster-row";

      const dot = document.createElement("span");
      dot.className = "roster-dot";
      dot.style.background = PLAYER_COLORS[i];

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.maxLength = 16;
      nameInput.placeholder = `Player ${i + 1}`;

      const combo = createExpertiseCombo(i % CATEGORIES.length);

      row.appendChild(dot);
      row.appendChild(nameInput);
      row.appendChild(combo.wrap);
      els.rosterForm.appendChild(row);
      rosterRows.push({ nameInput, combo });
    }
  }

  // A type-to-filter combobox standing in for a <select> with 100+ options.
  // Shared by roster setup and the Round 3 finale category picker — both need
  // the same search/highlight/keyboard-nav/revert-on-blur behavior, just
  // wired to different elements and "which options are pickable" rules.
  //
  // `input`/`dropdown` are existing elements to wire up behavior onto.
  // `getOptions()` returns the current { id, label } candidates (already
  // filtered by the caller for "taken"/"already used" exclusions) — this
  // function applies the free-text search on top of that.
  // `getSelectedLabel()` supplies the text to fall back to on blur/Escape.
  // `onSelect(id, label)` fires the moment an option is committed (click or Enter).
  // `onQueryChange()` (optional) fires on every keystroke, before re-rendering.
  // `onFocus()` (optional) fires when the input gains focus.
  // `clearOnFocus` (optional) wipes the input on focus so the full list shows.
  function createSearchableCombo({ input, dropdown, getOptions, getSelectedLabel, onSelect, onQueryChange, onFocus, clearOnFocus }) {
    const combo = { highlightIndex: -1, visible: [] };

    function closeDropdown() {
      dropdown.classList.add("hidden");
      combo.highlightIndex = -1;
    }

    function commit(opt) {
      input.value = opt.label;
      closeDropdown();
      onSelect(opt.id, opt.label);
    }

    function renderDropdown() {
      const query = input.value.trim().toLowerCase();
      const matches = getOptions().filter((opt) => !query || opt.label.toLowerCase().includes(query));

      combo.visible = matches;
      dropdown.innerHTML = "";

      if (matches.length === 0) {
        const empty = document.createElement("div");
        empty.className = "expertise-empty";
        empty.textContent = "No matching category";
        dropdown.appendChild(empty);
      } else {
        matches.forEach((opt, i) => {
          const el = document.createElement("div");
          el.className = "expertise-option" + (i === combo.highlightIndex ? " highlighted" : "");
          el.textContent = opt.label;
          el.addEventListener("mousedown", (e) => {
            e.preventDefault(); // keep focus on input so blur doesn't close before click registers
            commit(opt);
          });
          dropdown.appendChild(el);
        });
      }
      dropdown.classList.remove("hidden");
    }

    input.addEventListener("focus", () => {
      if (onFocus) onFocus();
      if (clearOnFocus) input.value = ""; // show the full list first; typing will filter it
      renderDropdown();
    });

    input.addEventListener("input", () => {
      combo.highlightIndex = -1;
      if (onQueryChange) onQueryChange();
      renderDropdown();
    });

    input.addEventListener("keydown", (e) => {
      if (dropdown.classList.contains("hidden")) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (combo.visible.length) {
          combo.highlightIndex = (combo.highlightIndex + 1) % combo.visible.length;
          renderDropdown();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (combo.visible.length) {
          combo.highlightIndex = (combo.highlightIndex - 1 + combo.visible.length) % combo.visible.length;
          renderDropdown();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        const pick = combo.visible[combo.highlightIndex] || combo.visible[0];
        if (pick) commit(pick);
      } else if (e.key === "Escape") {
        input.value = getSelectedLabel();
        closeDropdown();
      }
    });

    input.addEventListener("blur", () => {
      setTimeout(() => {
        closeDropdown();
        input.value = getSelectedLabel();
      }, 0);
    });

    combo.render = renderDropdown;
    return combo;
  }

  // Each roster combo tracks its own chosen categoryIndex on itself; "taken"
  // categories (picked by another row) are simply left out of the filtered
  // results, so a row can never end up duplicating another row's pick.
  function createExpertiseCombo(defaultCategoryIndex) {
    const wrap = document.createElement("div");
    wrap.className = "expertise-combo";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "expertise-input";
    input.autocomplete = "off";
    input.placeholder = "Search category...";
    input.value = CATEGORIES[defaultCategoryIndex].name;

    const dropdown = document.createElement("div");
    dropdown.className = "expertise-dropdown hidden";

    wrap.appendChild(input);
    wrap.appendChild(dropdown);

    const combo = { wrap, input, dropdown, categoryIndex: defaultCategoryIndex };

    createSearchableCombo({
      input,
      dropdown,
      clearOnFocus: true,
      onFocus: () => closeOtherCombos(combo),
      getOptions: () => {
        const taken = new Set(rosterRows.filter((r) => r.combo !== combo).map((r) => r.combo.categoryIndex));
        return CATEGORIES
          .map((cat, catIndex) => ({ id: catIndex, label: cat.name }))
          .filter(({ id }) => !taken.has(id));
      },
      getSelectedLabel: () => CATEGORIES[combo.categoryIndex].name,
      onSelect: (catIndex) => {
        combo.categoryIndex = catIndex;
      },
    });

    return combo;
  }

  function closeOtherCombos(exceptCombo) {
    rosterRows.forEach((r) => {
      if (r.combo !== exceptCombo) {
        r.combo.dropdown.classList.add("hidden");
        r.combo.input.value = CATEGORIES[r.combo.categoryIndex].name;
      }
    });
  }

  els.rosterBackBtn.addEventListener("click", () => {
    els.setupRosterScreen.classList.add("hidden");
    els.setupCountScreen.classList.remove("hidden");
    startDuelDemo();
  });

  els.rosterStartBtn.addEventListener("click", () => {
    const expertiseValues = rosterRows.map((r) => r.combo.categoryIndex);
    const hasDuplicate = new Set(expertiseValues).size !== expertiseValues.length;
    if (hasDuplicate) {
      els.rosterError.classList.remove("hidden");
      return;
    }
    els.rosterError.classList.add("hidden");

    const players = rosterRows.map((r, i) => {
      const expertiseIndex = r.combo.categoryIndex;
      return {
        index: i,
        name: r.nameInput.value.trim() || `Player ${i + 1}`,
        color: PLAYER_COLORS[i],
        eliminated: false,
        expertiseIndex, // permanent record of their original pick — never changes, used to pick the Round 3 finale category later
        activeCategoryIndex: expertiseIndex, // the one category that currently represents this player
        categoryLocked: false, // true once it's been fought over and decided
        usedQuestions: [],
      };
    });

    startNewGame(players);
  });

  // ---------- Game setup ----------

  function startNewGame(players) {
    const { cols, rows } = GRID_LAYOUTS[players.length];
    const order = shuffled(players.map((_, i) => i)); // shuffle which position each player lands on
    const squares = [];
    let idx = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const playerIndex = order[idx];
        squares.push({
          id: idx,
          row,
          col,
          owner: playerIndex,
        });
        idx++;
      }
    }

    state = {
      cols,
      rows,
      players,
      squares,
      chooser: null,
    };

    els.setupRosterScreen.classList.add("hidden");
    els.gameoverScreen.classList.add("hidden");
    runRandomizer();
  }

  function runRandomizer() {
    els.randomizerOverlay.classList.remove("hidden");
    els.randomizerContinueBtn.classList.add("hidden");
    let ticks = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * state.players.length);
      els.randomizerName.textContent = state.players[idx].name;
      ticks++;
      if (ticks >= RANDOMIZER_TICKS) {
        clearInterval(interval);
        const chosen = Math.floor(Math.random() * state.players.length);
        setChooser(chosen);
        els.randomizerName.textContent = `${state.players[chosen].name} goes first!`;
        els.randomizerContinueBtn.classList.remove("hidden");
      }
    }, RANDOMIZER_TICK_MS);
  }

  els.randomizerContinueBtn.addEventListener("click", () => {
    els.randomizerOverlay.classList.add("hidden");
    els.gameScreen.classList.remove("hidden");
    renderGrid();
  });

  // ---------- Core game helpers ----------

  function setChooser(playerIndex) {
    state.chooser = playerIndex;
  }

  function neighborsOf(square) {
    return state.squares.filter(
      (s) =>
        (Math.abs(s.row - square.row) === 1 && s.col === square.col) ||
        (Math.abs(s.col - square.col) === 1 && s.row === square.row)
    );
  }

  function challengeableSquares(playerIndex) {
    const mine = state.squares.filter((s) => s.owner === playerIndex);
    const theirsAdjacent = new Set();
    mine.forEach((s) => {
      neighborsOf(s).forEach((n) => {
        if (n.owner !== playerIndex && !state.players[n.owner].categoryLocked) theirsAdjacent.add(n.id);
      });
    });
    return state.squares.filter((s) => theirsAdjacent.has(s.id));
  }

  function countSquares(playerIndex) {
    return state.squares.filter((s) => s.owner === playerIndex).length;
  }

  // Everyone still alive with a valid move, minus whoever we're not allowed to re-pick.
  function eligibleChoosers(excludeIndex) {
    return state.players
      .filter((p) => !p.eliminated && p.index !== excludeIndex && challengeableSquares(p.index).length > 0)
      .map((p) => p.index);
  }

  function rankByTerritory() {
    return state.players
      .filter((p) => !p.eliminated)
      .sort((a, b) => countSquares(b.index) - countSquares(a.index));
  }

  // Randomly hands the turn to someone else. Players who still only hold their
  // single starting square (i.e. haven't won a duel yet) get top priority, so
  // nobody sits out indefinitely while others snowball. The player who just won
  // (and chose to pass rather than keep playing) is never eligible to be picked
  // right back — `excludeIndex` is who that was, if anyone.
  function autoPassTurn(prefix, excludeIndex) {
    const candidates = eligibleChoosers(excludeIndex);

    if (candidates.length === 0) {
      // Nobody else has a move. If the excluded (just-won) player still can, let
      // them continue rather than falsely declaring a stalemate.
      if (excludeIndex !== undefined && !state.players[excludeIndex].eliminated && challengeableSquares(excludeIndex).length > 0) {
        setChooser(excludeIndex);
        const soloMsg = `No one else has a move — ${state.players[excludeIndex].name} continues!`;
        renderGrid(prefix ? `${prefix} ${soloMsg}` : soloMsg);
        return;
      }
      // Truly nobody can move anywhere — stalemate.
      showGameOver(rankByTerritory()[0].index);
      return;
    }

    const untouched = candidates.filter((idx) => countSquares(idx) === 1);
    const pool = untouched.length > 0 ? untouched : candidates;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    setChooser(picked);
    const pickMsg = `🎲 ${state.players[picked].name} was randomly chosen to go next!`;
    renderGrid(prefix ? `${prefix} ${pickMsg}` : pickMsg);
  }

  // ---------- Rendering ----------

  function renderRosterBar() {
    els.rosterBar.innerHTML = "";
    state.players.forEach((p) => {
      const chip = document.createElement("div");
      chip.className = "roster-chip";
      if (p.index === state.chooser) chip.classList.add("current-turn");
      if (p.eliminated) chip.classList.add("eliminated");
      const statusHtml = p.eliminated
        ? `<span class="roster-out">OUT</span>`
        : `<span class="roster-count">${countSquares(p.index)}</span>`;
      chip.innerHTML = `<span class="roster-dot" style="background:${p.color}"></span><span>${p.name}</span>${statusHtml}`;
      els.rosterBar.appendChild(chip);
    });
  }

  function renderGrid(announcement) {
    els.grid.style.gridTemplateColumns = `repeat(${state.cols}, 1fr)`;
    els.grid.innerHTML = "";
    const targets = new Set(challengeableSquares(state.chooser).map((s) => s.id));

    state.squares.forEach((sq) => {
      const owner = state.players[sq.owner];
      const cat = CATEGORIES[owner.activeCategoryIndex];
      const div = document.createElement("div");
      div.className = "square";
      div.style.background = `linear-gradient(160deg, ${owner.color}, ${darken(owner.color, 0.55)})`;
      if (targets.has(sq.id)) div.classList.add("challengeable");
      div.innerHTML = `<span class="cat-name">${cat.name}</span>${owner.categoryLocked ? '<span class="locked-badge" title="This category has already been played">🔒</span>' : ""}`;
      if (targets.has(sq.id)) {
        div.addEventListener("click", () => startDuel(sq));
      }
      els.grid.appendChild(div);
    });

    renderRosterBar();
    saveGame("playing");

    const currentName = state.players[state.chooser].name;
    els.turnIndicator.textContent = `${currentName}'s turn`;

    if (announcement) {
      els.hintText.textContent = announcement;
    } else if (targets.size === 0) {
      els.hintText.textContent = `${currentName} has no adjacent squares to challenge — passing turn...`;
      setTimeout(() => autoPassTurn(undefined, state.chooser), 1200);
    } else {
      els.hintText.textContent = `${currentName}, select a highlighted square to challenge it.`;
    }
  }

  // ---------- Duel flow ----------

  function otherDuelPlayer(playerIndex) {
    return playerIndex === duel.challenger ? duel.defender : duel.challenger;
  }

  // Whether the given category-history tracker (a player, or the finale's
  // round3State) still has at least one question in its category it hasn't
  // asked yet during the current duel.
  function categoryHasQuestionsLeft(categoryOwner) {
    const cat = CATEGORIES[categoryOwner.activeCategoryIndex];
    return categoryOwner.usedQuestions.length < cat.questions.length;
  }

  function pickQuestion(player) {
    const cat = CATEGORIES[player.activeCategoryIndex];
    const available = cat.questions.map((_, i) => i).filter((i) => !player.usedQuestions.includes(i));
    const pick = available[Math.floor(Math.random() * available.length)];
    player.usedQuestions.push(pick);
    return cat.questions[pick];
  }

  function startDuel(square) {
    if (duel) return; // a duel (or its countdown) is already in progress — ignore extra clicks
    const challenger = state.chooser;
    const defender = square.owner;
    const isFinal = state.players.filter((p) => !p.eliminated).length === 2;

    duel = {
      square,
      challenger,
      defender,
      active: challenger,
      times: {},
      currentQuestion: null,
      lastTick: null,
      // Only set for the decisive last-two-standing duel: best-of-3, round categories
      // fixed by format (defender's, then challenger's), tiebreaker chosen by the GM.
      finalSeries: isFinal ? { round: 1, wins: { [challenger]: 0, [defender]: 0 } } : null,
    };

    els.duelLog.textContent = `${state.players[challenger].name} challenges for this square!`;
    beginCountdownAndRound();
  }

  // Which category (and question-history tracker) is live for the current round.
  function categoryStateForCurrentRound() {
    if (!duel.finalSeries) return state.players[duel.defender];
    const round = duel.finalSeries.round;
    if (round === 1) return state.players[duel.defender];
    if (round === 2) return state.players[duel.challenger];
    if (!duel.finalSeries.round3State) {
      duel.finalSeries.round3State = { activeCategoryIndex: duel.finalSeries.categoryOverride, usedQuestions: [] };
    }
    return duel.finalSeries.round3State;
  }

  function beginCountdownAndRound() {
    els.countdownTitle.textContent = duel.finalSeries
      ? `Round ${duel.finalSeries.round} of 3 — ${state.players[duel.challenger].name} ${duel.finalSeries.wins[duel.challenger]} : ${duel.finalSeries.wins[duel.defender]} ${state.players[duel.defender].name}`
      : `${state.players[duel.challenger].name} vs ${state.players[duel.defender].name}`;
    runCountdown(() => {
      els.duelOverlay.classList.remove("hidden");
      beginRound();
    });
  }

  function beginRound() {
    duel.ended = false;
    duel.times = { [duel.challenger]: LIFE_SECONDS, [duel.defender]: LIFE_SECONDS };
    duel.active = duel.challenger;
    els.lifeChallengerSeconds.classList.remove("passed");
    els.lifeDefenderSeconds.classList.remove("passed");

    const challengerName = state.players[duel.challenger].name;
    const defenderName = state.players[duel.defender].name;
    if (duel.finalSeries) {
      const w = duel.finalSeries.wins;
      els.lifeChallengerName.textContent = `${challengerName} (${w[duel.challenger]})`;
      els.lifeDefenderName.textContent = `${defenderName} (${w[duel.defender]})`;
      els.duelRoundBadge.textContent = `Final showdown — Round ${duel.finalSeries.round} of 3`;
      els.duelRoundBadge.classList.remove("hidden");
    } else {
      els.lifeChallengerName.textContent = challengerName;
      els.lifeDefenderName.textContent = defenderName;
      els.duelRoundBadge.classList.add("hidden");
    }

    showQuestion();
    if (duel.ended) return; // the category had no questions left before the round even started
    duel.lastTick = performance.now();
    clearTimer();
    timerHandle = setInterval(tickDuelClock, 100);
  }

  function runCountdown(onDone) {
    els.countdownOverlay.classList.remove("hidden");
    let count = COUNTDOWN_START;

    function showCount(n) {
      els.countdownNumber.textContent = n;
      els.countdownNumber.style.animation = "none";
      void els.countdownNumber.offsetWidth; // reflow to restart the pop animation
      els.countdownNumber.style.animation = "";
    }

    showCount(count);
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        showCount(count);
      } else {
        clearInterval(interval);
        els.countdownOverlay.classList.add("hidden");
        onDone();
      }
    }, COUNTDOWN_TICK_MS);
  }

  function secondsElFor(playerIndex) {
    return playerIndex === duel.challenger ? els.lifeChallengerSeconds : els.lifeDefenderSeconds;
  }

  function updateLifeUI() {
    const challengerPct = Math.max(0, (duel.times[duel.challenger] / LIFE_SECONDS) * 100);
    const defenderPct = Math.max(0, (duel.times[duel.defender] / LIFE_SECONDS) * 100);
    els.lifeChallengerFill.style.width = `${challengerPct}%`;
    els.lifeDefenderFill.style.width = `${defenderPct}%`;
    els.lifeChallengerSeconds.textContent = Math.max(0, duel.times[duel.challenger]).toFixed(1);
    els.lifeDefenderSeconds.textContent = Math.max(0, duel.times[duel.defender]).toFixed(1);
    els.lifeChallenger.classList.toggle("active", duel.active === duel.challenger);
    els.lifeDefender.classList.toggle("active", duel.active === duel.defender);
  }

  function tickDuelClock() {
    if (!duel) return;
    const now = performance.now();
    const delta = (now - duel.lastTick) / 1000;
    duel.lastTick = now;
    duel.times[duel.active] -= delta;

    if (duel.times[duel.active] <= 0) {
      duel.times[duel.active] = 0;
      updateLifeUI();
      loseDuel(duel.active);
      return;
    }
    updateLifeUI();
  }

  function loadClueImage(basePath) {
    els.questionImage.classList.add("hidden");
    els.imagePlaceholder.classList.add("hidden");

    let extIndex = 0;
    els.questionImage.onerror = () => {
      extIndex++;
      if (extIndex < IMAGE_EXTENSIONS.length) {
        els.questionImage.src = `${basePath}.${IMAGE_EXTENSIONS[extIndex]}`;
      } else {
        els.questionImage.onerror = null;
        els.questionImage.classList.add("hidden");
        els.placeholderPath.textContent = `${basePath}.(jpg|png|webp|gif)`;
        els.imagePlaceholder.classList.remove("hidden");
      }
    };
    els.questionImage.onload = () => {
      els.questionImage.classList.remove("hidden");
      els.imagePlaceholder.classList.add("hidden");
    };
    els.questionImage.src = `${basePath}.${IMAGE_EXTENSIONS[extIndex]}`;
  }

  function showQuestion() {
    const categoryOwner = categoryStateForCurrentRound();
    if (!categoryHasQuestionsLeft(categoryOwner)) {
      endDuelOutOfQuestions();
      return;
    }
    els.duelCategory.textContent = CATEGORIES[categoryOwner.activeCategoryIndex].name;
    duel.currentQuestion = pickQuestion(categoryOwner);
    loadClueImage(duel.currentQuestion.image);
    els.hostAnswerText.textContent = duel.currentQuestion.answer;
    els.hostAnswerText.classList.add("blurred");
    els.hostAnswer.querySelector(".host-answer-icon").textContent = "🙈";
    updateLifeUI();
  }

  els.hostAnswer.addEventListener("click", () => {
    const revealed = els.hostAnswerText.classList.toggle("blurred") === false;
    els.hostAnswer.querySelector(".host-answer-icon").textContent = revealed ? "👁️" : "🙈";
  });

  function setHostButtonsEnabled(enabled) {
    els.correctBtn.disabled = !enabled;
    els.passBtn.disabled = !enabled;
  }

  function scheduleNextQuestion() {
    clearTimer(); // pause both players' clocks during the transition
    duel.transitioning = true;
    setHostButtonsEnabled(false);
    els.hostAnswerText.classList.remove("blurred");
    els.hostAnswer.querySelector(".host-answer-icon").textContent = "👁️";
    setTimeout(() => {
      if (!duel || duel.ended) return;
      duel.transitioning = false;
      setHostButtonsEnabled(true);
      els.lifeChallengerSeconds.classList.remove("passed");
      els.lifeDefenderSeconds.classList.remove("passed");
      showQuestion();
      if (duel.ended) return; // ran out of questions for this category
      duel.lastTick = performance.now();
      timerHandle = setInterval(tickDuelClock, 100);
    }, IMAGE_CHANGE_DELAY_MS);
  }

  els.correctBtn.addEventListener("click", () => {
    if (!duel || duel.ended || duel.transitioning) return;
    const scorer = duel.active;
    els.duelLog.textContent = `${state.players[scorer].name} got it right!`;
    duel.active = otherDuelPlayer(duel.active);
    updateLifeUI();
    scheduleNextQuestion();
  });

  els.passBtn.addEventListener("click", () => {
    if (!duel || duel.ended || duel.transitioning) return;
    duel.times[duel.active] = Math.max(0, duel.times[duel.active] - PASS_PENALTY_SECONDS);
    updateLifeUI();
    secondsElFor(duel.active).classList.add("passed");
    els.duelLog.textContent = `${state.players[duel.active].name} passed (-${PASS_PENALTY_SECONDS}s).`;
    if (duel.times[duel.active] <= 0) {
      loseDuel(duel.active);
      return;
    }
    scheduleNextQuestion();
  });

  document.addEventListener("keydown", (e) => {
    if (!duel || els.duelOverlay.classList.contains("hidden")) return;
    const key = e.key.toLowerCase();
    if (key === "c" || key === "arrowright" || key === "enter") {
      e.preventDefault();
      els.correctBtn.click();
    } else if (key === "p" || key === "arrowleft" || key === " ") {
      e.preventDefault();
      els.passBtn.click();
    }
  });

  function clearTimer() {
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = null;
  }

  function loseDuel(loserIndex) {
    clearTimer();
    duel.ended = true;
    const winnerIndex = otherDuelPlayer(loserIndex);
    els.duelLog.textContent = `${state.players[loserIndex].name}'s clock ran out!`;
    if (duel.finalSeries) {
      setTimeout(() => resolveFinalRound(winnerIndex), 1200);
    } else {
      setTimeout(() => endDuel(winnerIndex), 1200);
    }
  }

  // Quick animated coin flip (visually mirrors the start-of-game randomizer)
  // used to break an exact time tie. Calls onDone(winnerIndex) once resolved.
  function startCoinToss(playerA, playerB, onDone) {
    els.coinTossOverlay.classList.remove("hidden");
    els.coinTossContinueBtn.classList.add("hidden");
    let ticks = 0;
    const interval = setInterval(() => {
      const idx = Math.random() < 0.5 ? playerA : playerB;
      els.coinTossName.textContent = state.players[idx].name;
      ticks++;
      if (ticks >= COIN_TOSS_TICKS) {
        clearInterval(interval);
        const winnerIndex = Math.random() < 0.5 ? playerA : playerB;
        els.coinTossName.textContent = `${state.players[winnerIndex].name} wins the coin toss!`;
        els.coinTossContinueBtn.classList.remove("hidden");
        els.coinTossContinueBtn.onclick = () => {
          els.coinTossOverlay.classList.add("hidden");
          onDone(winnerIndex);
        };
      }
    }, RANDOMIZER_TICK_MS);
  }

  // The category ran out of fresh questions mid-duel — rather than repeat one,
  // the duel is decided immediately by whoever has more time left on their clock,
  // or by a coin toss on an exact tie (only reachable when the category was
  // already exhausted before the round even started, so both clocks are still
  // sitting at the full starting time). Shown as its own overlay (rather than
  // just a log line) since it's an unusual way for a duel to end and deserves
  // a beat before moving on.
  function endDuelOutOfQuestions() {
    clearTimer();
    duel.ended = true;
    // Round to the same 1-decimal precision shown on screen before comparing —
    // otherwise two times that display identically (e.g. both "42.6s") could
    // still be treated as a non-tie over a sub-tenth-of-a-second difference.
    const challengerTime = Math.round(Math.max(0, duel.times[duel.challenger]) * 10) / 10;
    const defenderTime = Math.round(Math.max(0, duel.times[duel.defender]) * 10) / 10;
    const isTie = challengerTime === defenderTime;

    els.duelOverlay.classList.add("hidden");

    function proceed(winnerIndex) {
      if (duel.finalSeries) {
        resolveFinalRound(winnerIndex);
      } else {
        endDuel(winnerIndex);
      }
    }

    if (isTie) {
      els.outOfQuestionsSub.innerHTML = `Both players had <strong>${challengerTime.toFixed(1)}s</strong> left — it's a tie! This will be decided by a coin toss.`;
      els.outOfQuestionsBtn.textContent = "🪙 Toss coin";
      els.outOfQuestionsBtn.onclick = () => {
        els.outOfQuestionsOverlay.classList.add("hidden");
        startCoinToss(duel.challenger, duel.defender, proceed);
      };
    } else {
      const winnerIndex = defenderTime > challengerTime ? duel.defender : duel.challenger;
      const winnerTime = winnerIndex === duel.challenger ? challengerTime : defenderTime;
      const loserTime = winnerIndex === duel.challenger ? defenderTime : challengerTime;
      els.outOfQuestionsSub.innerHTML = `<strong>${state.players[winnerIndex].name}</strong> had more time left (${winnerTime.toFixed(1)}s vs ${loserTime.toFixed(1)}s) — they win the square!`;
      els.outOfQuestionsBtn.textContent = "Continue";
      els.outOfQuestionsBtn.onclick = () => {
        els.outOfQuestionsOverlay.classList.add("hidden");
        proceed(winnerIndex);
      };
    }

    els.outOfQuestionsOverlay.classList.remove("hidden");
  }

  // A round of the best-of-3 finale just ended. Either the series is decided
  // (someone hit 2 round wins — resolve for real) or we move on to the next round.
  function resolveFinalRound(roundWinnerIndex) {
    const series = duel.finalSeries;
    series.wins[roundWinnerIndex]++;

    if (series.wins[roundWinnerIndex] >= 2) {
      endDuel(roundWinnerIndex);
      return;
    }

    els.duelOverlay.classList.add("hidden");
    series.round++;

    if (series.round === 3) {
      showFinalCategoryPicker((chosenCategoryIndex) => {
        series.categoryOverride = chosenCategoryIndex;
        beginCountdownAndRound();
      });
    } else {
      showRound2Confirm(roundWinnerIndex);
    }
  }

  function showRound2Confirm(round1WinnerIndex) {
    const series = duel.finalSeries;
    const nextCategoryIndex = state.players[duel.challenger].activeCategoryIndex; // round 2 is always the challenger's
    els.round2ConfirmTitle.textContent = `${state.players[round1WinnerIndex].name} takes Round 1! (${series.wins[duel.challenger]} - ${series.wins[duel.defender]})`;
    els.round2ConfirmCategory.innerHTML = `Round 2 category: <strong>${state.players[duel.challenger].name}'s — ${CATEGORIES[nextCategoryIndex].name}</strong>`;
    els.round2ConfirmOverlay.classList.remove("hidden");
  }

  els.round2ConfirmBtn.addEventListener("click", () => {
    els.round2ConfirmOverlay.classList.add("hidden");
    beginCountdownAndRound();
  });

  // The picker's input/dropdown are fixed elements reused across games (unlike
  // the roster combos, which get fresh DOM nodes every game) — so the combo is
  // built exactly once here, and showFinalCategoryPicker just resets its state
  // on each call instead of re-attaching listeners on top of the old ones.
  let finalPickerAllowed = [];
  let finalPickerChosenIndex = null;
  const finalPickerCombo = createSearchableCombo({
    input: els.finalPickerInput,
    dropdown: els.finalPickerDropdown,
    getOptions: () => finalPickerAllowed,
    getSelectedLabel: () => (finalPickerChosenIndex === null ? "" : CATEGORIES[finalPickerChosenIndex].name),
    onQueryChange: () => {
      finalPickerChosenIndex = null;
      els.finalPickerConfirmBtn.disabled = true;
    },
    onSelect: (idx) => {
      finalPickerChosenIndex = idx;
      els.finalPickerConfirmBtn.disabled = false;
    },
  });

  function showFinalCategoryPicker(onConfirm) {
    const everSelected = new Set(state.players.map((p) => p.expertiseIndex));
    finalPickerAllowed = CATEGORIES.map((cat, idx) => ({ id: idx, label: cat.name })).filter(({ id }) => !everSelected.has(id));
    if (finalPickerAllowed.length === 0) {
      // Extremely unlikely (would need every category ever selected) — fall back to any unlocked category.
      finalPickerAllowed = CATEGORIES.map((cat, idx) => ({ id: idx, label: cat.name }));
    }

    finalPickerChosenIndex = null;
    els.finalPickerInput.value = "";
    els.finalPickerConfirmBtn.disabled = true;

    els.finalPickerConfirmBtn.onclick = () => {
      if (finalPickerChosenIndex === null) return;
      els.finalPickerOverlay.classList.add("hidden");
      onConfirm(finalPickerChosenIndex);
    };

    els.finalPickerOverlay.classList.remove("hidden");
    finalPickerCombo.render(); // show the full list right away, don't wait on a focus event
  }

  function endDuel(winnerIndex) {
    els.duelOverlay.classList.add("hidden");

    const challengerIndex = duel.challenger;
    const defenderIndex = duel.defender;
    const loserIndex = winnerIndex === challengerIndex ? defenderIndex : challengerIndex;
    const loserName = state.players[loserIndex].name;
    duel = null;

    // The category being fought over is always the defender's — if they held on,
    // it's decided for good.
    if (winnerIndex === defenderIndex) {
      state.players[defenderIndex].categoryLocked = true;
    }

    // The loser is eliminated outright — the winner inherits their entire territory.
    const inheritedCount = state.squares.filter((s) => s.owner === loserIndex).length;
    state.squares.forEach((s) => {
      if (s.owner === loserIndex) s.owner = winnerIndex;
    });

    // Keep the winner's whole territory playable: if their own category is already
    // decided but they just inherited a still-unplayed one, adopt it as the single
    // category representing all of their squares from now on.
    const winner = state.players[winnerIndex];
    const loser = state.players[loserIndex];
    if (winner.categoryLocked && !loser.categoryLocked) {
      winner.activeCategoryIndex = loser.activeCategoryIndex;
      winner.categoryLocked = false;
      winner.usedQuestions = loser.usedQuestions.slice();
    }

    state.players[loserIndex].eliminated = true;

    const remaining = state.players.filter((p) => !p.eliminated);
    if (remaining.length <= 1) {
      showGameOver(remaining.length === 1 ? remaining[0].index : winnerIndex);
      return;
    }

    offerTurnChoice(winnerIndex, loserName, inheritedCount);
  }

  function offerTurnChoice(winnerIndex, loserName, inheritedCount) {
    const eliminationText =
      inheritedCount > 1
        ? `${loserName} is eliminated — ${state.players[winnerIndex].name} inherits all ${inheritedCount} of their territories!`
        : `${loserName} is eliminated!`;

    if (challengeableSquares(winnerIndex).length === 0) {
      autoPassTurn(eliminationText, winnerIndex);
      return;
    }
    pendingWinner = winnerIndex;
    els.turnChoiceTitle.textContent = `${eliminationText} Keep playing or pass?`;
    els.turnChoiceOverlay.classList.remove("hidden");
  }

  els.keepPlayingBtn.addEventListener("click", () => {
    els.turnChoiceOverlay.classList.add("hidden");
    setChooser(pendingWinner);
    renderGrid();
  });

  els.passTurnBtn.addEventListener("click", () => {
    els.turnChoiceOverlay.classList.add("hidden");
    autoPassTurn(undefined, pendingWinner);
  });

  function showGameOver(winnerIndex) {
    els.gameScreen.classList.add("hidden");
    els.gameoverScreen.classList.remove("hidden");
    els.winnerTitle.textContent = `${state.players[winnerIndex].name} wins!`;
    const owned = countSquares(winnerIndex);
    const total = state.squares.length;
    els.winnerSub.textContent =
      owned === total
        ? "They control the entire floor."
        : `No categories left to challenge — they held the most territory (${owned}/${total}).`;
    saveGame("gameover", winnerIndex);
  }

  els.playAgainBtn.addEventListener("click", () => {
    clearSavedGame();
    els.gameoverScreen.classList.add("hidden");
    els.setupCountScreen.classList.remove("hidden");
    startDuelDemo();
  });

  // ---------- Resume a saved game on load, if any ----------
  (function resumeSavedGame() {
    const saved = loadSavedGame();
    if (!saved) return; // main menu is the default visible screen — nothing else to do

    state = {
      cols: saved.state.cols,
      rows: saved.state.rows,
      players: saved.state.players,
      squares: saved.state.squares,
      chooser: saved.state.chooser,
    };

    els.mainMenuScreen.classList.add("hidden");
    els.setupCountScreen.classList.add("hidden");
    els.setupRosterScreen.classList.add("hidden");

    if (saved.phase === "gameover") {
      showGameOver(saved.winnerIndex);
    } else {
      els.gameScreen.classList.remove("hidden");
      renderGrid();
    }
  })();
})();
