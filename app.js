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

  const els = {
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
    gameScreen: document.getElementById("game-screen"),
    gameoverScreen: document.getElementById("gameover-screen"),
    rosterBar: document.getElementById("roster-bar"),
    grid: document.getElementById("grid"),
    turnIndicator: document.getElementById("turn-indicator"),
    hintText: document.getElementById("hint-text"),
    duelOverlay: document.getElementById("duel-overlay"),
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
    turnChoiceOverlay: document.getElementById("turn-choice-overlay"),
    turnChoiceTitle: document.getElementById("turn-choice-title"),
    keepPlayingBtn: document.getElementById("keep-playing-btn"),
    passTurnBtn: document.getElementById("pass-turn-btn"),
    winnerTitle: document.getElementById("winner-title"),
    winnerSub: document.getElementById("winner-sub"),
    playAgainBtn: document.getElementById("play-again-btn"),
  };

  /** @type {{cols:number, rows:number, players:Array, squares:Array, chooser:number, notPlayed:Set<number>}} */
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

      const select = document.createElement("select");
      CATEGORIES.forEach((cat, catIndex) => {
        const opt = document.createElement("option");
        opt.value = String(catIndex);
        opt.textContent = cat.name;
        select.appendChild(opt);
      });
      select.value = String(i % CATEGORIES.length);
      select.addEventListener("change", refreshExpertiseOptions);

      row.appendChild(dot);
      row.appendChild(nameInput);
      row.appendChild(select);
      els.rosterForm.appendChild(row);
      rosterRows.push({ nameInput, select });
    }
    refreshExpertiseOptions();
  }

  function refreshExpertiseOptions() {
    const chosen = rosterRows.map((r) => r.select.value);
    rosterRows.forEach((r, i) => {
      Array.from(r.select.options).forEach((opt) => {
        opt.disabled = chosen.some((v, j) => j !== i && v === opt.value);
      });
    });
  }

  els.rosterBackBtn.addEventListener("click", () => {
    els.setupRosterScreen.classList.add("hidden");
    els.setupCountScreen.classList.remove("hidden");
  });

  els.rosterStartBtn.addEventListener("click", () => {
    const expertiseValues = rosterRows.map((r) => r.select.value);
    const hasDuplicate = new Set(expertiseValues).size !== expertiseValues.length;
    if (hasDuplicate) {
      els.rosterError.classList.remove("hidden");
      return;
    }
    els.rosterError.classList.add("hidden");

    const players = rosterRows.map((r, i) => {
      const expertiseIndex = parseInt(r.select.value, 10);
      return {
        index: i,
        name: r.nameInput.value.trim() || `Player ${i + 1}`,
        color: PLAYER_COLORS[i],
        eliminated: false,
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
      notPlayed: new Set(players.map((p) => p.index)),
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
    state.notPlayed.delete(playerIndex);
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

  function eligibleChoosers(pool) {
    return pool.filter((idx) => {
      const p = state.players[idx];
      return p && !p.eliminated && challengeableSquares(idx).length > 0;
    });
  }

  function rankByTerritory() {
    return state.players
      .filter((p) => !p.eliminated)
      .sort((a, b) => countSquares(b.index) - countSquares(a.index));
  }

  function autoPassTurn(prefix) {
    let candidates = eligibleChoosers(Array.from(state.notPlayed));
    if (candidates.length === 0) {
      state.notPlayed = new Set(state.players.filter((p) => !p.eliminated).map((p) => p.index));
      candidates = eligibleChoosers(Array.from(state.notPlayed));
    }
    if (candidates.length === 0) {
      // No unplayed category touches any remaining player's territory — stalemate.
      showGameOver(rankByTerritory()[0].index);
      return;
    }
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
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

    const currentName = state.players[state.chooser].name;
    els.turnIndicator.textContent = `${currentName}'s turn`;

    if (announcement) {
      els.hintText.textContent = announcement;
    } else if (targets.size === 0) {
      els.hintText.textContent = `${currentName} has no adjacent squares to challenge — passing turn...`;
      setTimeout(() => autoPassTurn(), 1200);
    } else {
      els.hintText.textContent = `${currentName}, select a highlighted square to challenge it.`;
    }
  }

  // ---------- Duel flow ----------

  function otherDuelPlayer(playerIndex) {
    return playerIndex === duel.challenger ? duel.defender : duel.challenger;
  }

  function pickQuestion(player) {
    const cat = CATEGORIES[player.activeCategoryIndex];
    let available = cat.questions.map((_, i) => i).filter((i) => !player.usedQuestions.includes(i));
    if (available.length === 0) {
      player.usedQuestions = [];
      available = cat.questions.map((_, i) => i);
    }
    const pick = available[Math.floor(Math.random() * available.length)];
    player.usedQuestions.push(pick);
    return cat.questions[pick];
  }

  function startDuel(square) {
    const challenger = state.chooser;
    const defender = square.owner;
    duel = {
      square,
      challenger,
      defender,
      active: challenger, // challenger's clock runs first
      times: { [challenger]: LIFE_SECONDS, [defender]: LIFE_SECONDS },
      currentQuestion: null,
      lastTick: null,
    };

    els.lifeChallengerName.textContent = state.players[challenger].name;
    els.lifeDefenderName.textContent = state.players[defender].name;
    els.lifeChallengerSeconds.classList.remove("passed");
    els.lifeDefenderSeconds.classList.remove("passed");

    els.duelOverlay.classList.remove("hidden");
    els.duelCategory.textContent = CATEGORIES[state.players[defender].activeCategoryIndex].name;
    els.duelLog.textContent = `${state.players[challenger].name} challenges for this square!`;

    showQuestion();
    duel.lastTick = performance.now();
    clearTimer();
    timerHandle = setInterval(tickDuelClock, 100);
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
    duel.currentQuestion = pickQuestion(state.players[duel.defender]);
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
    setTimeout(() => endDuel(winnerIndex), 1200);
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
      autoPassTurn(eliminationText);
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
    autoPassTurn();
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
  }

  els.playAgainBtn.addEventListener("click", () => {
    els.gameoverScreen.classList.add("hidden");
    els.setupCountScreen.classList.remove("hidden");
  });
})();
