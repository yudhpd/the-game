(function () {
  const MINI_LIFE_SECONDS = 15;
  const PASS_PENALTY_SECONDS = 1;
  const IMAGE_CHANGE_DELAY_MS = 1000;
  const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
  const COIN_TOSS_TICKS = 10;
  const COIN_TOSS_TICK_MS = 100;
  const COUNTDOWN_START = 3;
  const COUNTDOWN_TICK_MS = 1000;

  const DUEL_TYPES = {
    "floor-mini": {
      label: "The Floor Mini Duel",
      desc: "Same as The Floor duel, but each player only gets 15 seconds on the clock, a pass costs 1 second, and the Game Master picks the category.",
    },
    "bring-me": {
      label: "Bring Me Something",
      desc: "Players race to find an item matching a randomized criteria. Game Master judges the best match.",
    },
    weight: {
      label: "Weight Challenge",
      desc: "Each round randomly rolls one of: closest-weight, guess-the-weight, or perfect cut. Ties repeat the duel.",
    },
    length: {
      label: "Length Challenge",
      desc: "Each round randomly rolls one of: closest-length or guess-the-length. Ties repeat the duel.",
    },
    time: {
      label: "Time Challenge",
      desc: "Each round randomly rolls one of: closest time, guess-the-time, time attack, or over/under.",
    },
  };

  const WEIGHT_SUBDUELS = ["closest", "guess", "cut"];
  const LENGTH_SUBDUELS = ["closest", "guess"];
  const TIME_SUBDUELS = ["closest", "guess", "attack", "overunder"];

  const TOURNAMENT_TYPES = {
    knockout: { label: "Knockout", desc: "Single-elimination bracket — lose a match and you're out." },
    "round-robin": { label: "Round Robin", desc: "Everyone plays everyone once. Most match wins takes the title." },
    "group-knockout": {
      label: "Group → Knockout",
      desc: "Groups of ~4 play round robin; top 2 from each group advance to a knockout bracket.",
    },
  };

  const ROUNDS_PER_DUEL = {
    1: { label: "Single Round", desc: "First win takes the match." },
    3: { label: "Best of 3", desc: "First to 2 round wins takes the match." },
    5: { label: "Best of 5", desc: "First to 3 round wins takes the match." },
  };

  const DUEL_MODES = {
    random: { label: "Randomize each round", desc: "The app randomly picks a duel type for every round." },
    live: { label: "Game Master picks live", desc: "Before each round, the Game Master chooses the duel type." },
  };

  const BRINGME_COLORS = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "brown", "black", "white", "gray", "silver", "gold"];
  const BRINGME_MATERIALS = ["wood", "metal", "plastic", "glass", "fabric or cloth", "leather", "paper", "rubber", "ceramic"];

  const els = {
    miscMenuBackBtn: document.getElementById("misc-menu-back-btn"),
    miscSetupScreen: document.getElementById("misc-setup-screen"),
    miscCountInput: document.getElementById("misc-count-input"),
    miscCountMinus: document.getElementById("misc-count-minus"),
    miscCountPlus: document.getElementById("misc-count-plus"),
    miscTournamentTypeGrid: document.getElementById("misc-tournament-type-grid"),
    miscRoundsGrid: document.getElementById("misc-rounds-grid"),
    miscDuelTypeList: document.getElementById("misc-duel-type-list"),
    miscDuelModeWrap: document.getElementById("misc-duel-mode-wrap"),
    miscDuelModeGrid: document.getElementById("misc-duel-mode-grid"),
    miscSetupError: document.getElementById("misc-setup-error"),
    miscSetupContinueBtn: document.getElementById("misc-setup-continue-btn"),

    miscRosterScreen: document.getElementById("misc-roster-screen"),
    miscRosterForm: document.getElementById("misc-roster-form"),
    miscRosterBackBtn: document.getElementById("misc-roster-back-btn"),
    miscRosterStartBtn: document.getElementById("misc-roster-start-btn"),

    miscBracketScreen: document.getElementById("misc-bracket-screen"),
    miscBracketSubtitle: document.getElementById("misc-bracket-subtitle"),
    miscBracketBody: document.getElementById("misc-bracket-body"),

    miscIntroOverlay: document.getElementById("misc-intro-overlay"),
    miscIntroTitle: document.getElementById("misc-intro-title"),
    miscIntroScore: document.getElementById("misc-intro-score"),
    miscIntroType: document.getElementById("misc-intro-type"),
    miscIntroPicker: document.getElementById("misc-intro-picker"),
    miscIntroBeginBtn: document.getElementById("misc-intro-begin-btn"),

    miscCategoryPickerOverlay: document.getElementById("misc-category-picker-overlay"),
    miscCategoryPickerInput: document.getElementById("misc-category-picker-input"),
    miscCategoryPickerDropdown: document.getElementById("misc-category-picker-dropdown"),
    miscCategoryPickerConfirmBtn: document.getElementById("misc-category-picker-confirm-btn"),

    countdownOverlay: document.getElementById("countdown-overlay"),
    countdownTitle: document.getElementById("countdown-title"),
    countdownNumber: document.getElementById("countdown-number"),

    miscFloorOverlay: document.getElementById("misc-floor-overlay"),
    miscFloorCategory: document.getElementById("misc-floor-category"),
    miscFloorLifeA: document.getElementById("misc-floor-life-a"),
    miscFloorNameA: document.getElementById("misc-floor-name-a"),
    miscFloorSecondsA: document.getElementById("misc-floor-seconds-a"),
    miscFloorFillA: document.getElementById("misc-floor-fill-a"),
    miscFloorLifeB: document.getElementById("misc-floor-life-b"),
    miscFloorNameB: document.getElementById("misc-floor-name-b"),
    miscFloorSecondsB: document.getElementById("misc-floor-seconds-b"),
    miscFloorFillB: document.getElementById("misc-floor-fill-b"),
    miscFloorImage: document.getElementById("misc-floor-image"),
    miscFloorPlaceholder: document.getElementById("misc-floor-placeholder"),
    miscFloorPlaceholderPath: document.getElementById("misc-floor-placeholder-path"),
    miscFloorLog: document.getElementById("misc-floor-log"),
    miscFloorAnswer: document.getElementById("misc-floor-answer"),
    miscFloorAnswerText: document.getElementById("misc-floor-answer-text"),
    miscFloorCorrectBtn: document.getElementById("misc-floor-correct-btn"),
    miscFloorPassBtn: document.getElementById("misc-floor-pass-btn"),

    miscBringmeOverlay: document.getElementById("misc-bringme-overlay"),
    miscBringmeCriteria: document.getElementById("misc-bringme-criteria"),
    miscBringmeALabel: document.getElementById("misc-bringme-a-label"),
    miscBringmeBLabel: document.getElementById("misc-bringme-b-label"),
    miscBringmeABtn: document.getElementById("misc-bringme-a-btn"),
    miscBringmeBBtn: document.getElementById("misc-bringme-b-btn"),
    miscBringmeRerollBtn: document.getElementById("misc-bringme-reroll-btn"),

    miscTargetOverlay: document.getElementById("misc-target-overlay"),
    miscTargetTitle: document.getElementById("misc-target-title"),
    miscTargetValue: document.getElementById("misc-target-value"),
    miscTargetHint: document.getElementById("misc-target-hint"),
    miscTargetNameA: document.getElementById("misc-target-name-a"),
    miscTargetNameB: document.getElementById("misc-target-name-b"),
    miscTargetInputA: document.getElementById("misc-target-input-a"),
    miscTargetInputB: document.getElementById("misc-target-input-b"),
    miscTargetSubmitBtn: document.getElementById("misc-target-submit-btn"),

    miscStopwatchOverlay: document.getElementById("misc-stopwatch-overlay"),
    miscStopwatchTarget: document.getElementById("misc-stopwatch-target"),
    miscStopwatchTurnName: document.getElementById("misc-stopwatch-turn-name"),
    miscStopwatchDisplay: document.getElementById("misc-stopwatch-display"),
    miscStopwatchResults: document.getElementById("misc-stopwatch-results"),
    miscStopwatchContinueBtn: document.getElementById("misc-stopwatch-continue-btn"),

    miscGuessOverlay: document.getElementById("misc-guess-overlay"),
    miscGuessTitle: document.getElementById("misc-guess-title"),
    miscGuessHint: document.getElementById("misc-guess-hint"),
    miscGuessNameA: document.getElementById("misc-guess-name-a"),
    miscGuessNameB: document.getElementById("misc-guess-name-b"),
    miscGuessInputA: document.getElementById("misc-guess-input-a"),
    miscGuessInputB: document.getElementById("misc-guess-input-b"),
    miscGuessActualLabel: document.getElementById("misc-guess-actual-label"),
    miscGuessActualInput: document.getElementById("misc-guess-actual-input"),
    miscGuessSubmitBtn: document.getElementById("misc-guess-submit-btn"),

    miscGuesstimeOverlay: document.getElementById("misc-guesstime-overlay"),
    miscGuesstimeStageActual: document.getElementById("misc-guesstime-stage-actual"),
    miscGuesstimeDisplay: document.getElementById("misc-guesstime-display"),
    miscGuesstimeStageGuess: document.getElementById("misc-guesstime-stage-guess"),
    miscGuesstimeActual: document.getElementById("misc-guesstime-actual"),
    miscGuesstimeActualText: document.getElementById("misc-guesstime-actual-text"),
    miscGuesstimeNameA: document.getElementById("misc-guesstime-name-a"),
    miscGuesstimeNameB: document.getElementById("misc-guesstime-name-b"),
    miscGuesstimeInputA: document.getElementById("misc-guesstime-input-a"),
    miscGuesstimeInputB: document.getElementById("misc-guesstime-input-b"),
    miscGuesstimeSubmitBtn: document.getElementById("misc-guesstime-submit-btn"),

    miscAttackOverlay: document.getElementById("misc-attack-overlay"),
    miscAttackNameA: document.getElementById("misc-attack-name-a"),
    miscAttackSecondsA: document.getElementById("misc-attack-seconds-a"),
    miscAttackFillA: document.getElementById("misc-attack-fill-a"),
    miscAttackLifeA: document.getElementById("misc-attack-life-a"),
    miscAttackNameB: document.getElementById("misc-attack-name-b"),
    miscAttackSecondsB: document.getElementById("misc-attack-seconds-b"),
    miscAttackFillB: document.getElementById("misc-attack-fill-b"),
    miscAttackLifeB: document.getElementById("misc-attack-life-b"),
    miscAttackLog: document.getElementById("misc-attack-log"),
    miscAttackStartBtn: document.getElementById("misc-attack-start-btn"),
    miscAttackPassBtn: document.getElementById("misc-attack-pass-btn"),

    miscOverunderOverlay: document.getElementById("misc-overunder-overlay"),
    miscOverunderStageTarget: document.getElementById("misc-overunder-stage-target"),
    miscOverunderCallerName: document.getElementById("misc-overunder-caller-name"),
    miscOverunderCallerName2: document.getElementById("misc-overunder-caller-name-2"),
    miscOverunderAchieverName: document.getElementById("misc-overunder-achiever-name"),
    miscOverunderTargetInput: document.getElementById("misc-overunder-target-input"),
    miscOverunderTargetSubmitBtn: document.getElementById("misc-overunder-target-submit-btn"),
    miscOverunderStageAttempt: document.getElementById("misc-overunder-stage-attempt"),
    miscOverunderDisplay: document.getElementById("misc-overunder-display"),
    miscOverunderStageGuess: document.getElementById("misc-overunder-stage-guess"),
    miscOverunderGuessHint: document.getElementById("misc-overunder-guess-hint"),
    miscOverunderGuessControls: document.getElementById("misc-overunder-guess-controls"),
    miscOverunderSummary: document.getElementById("misc-overunder-summary"),
    miscOverunderGuessSummary: document.getElementById("misc-overunder-guess-summary"),
    miscOverunderOverBtn: document.getElementById("misc-overunder-over-btn"),
    miscOverunderUnderBtn: document.getElementById("misc-overunder-under-btn"),

    miscCoinTossOverlay: document.getElementById("misc-coin-toss-overlay"),
    miscCoinTossName: document.getElementById("misc-coin-toss-name"),
    miscCoinTossContinueBtn: document.getElementById("misc-coin-toss-continue-btn"),

    miscTiebreakOverlay: document.getElementById("misc-tiebreak-overlay"),
    miscTiebreakTitle: document.getElementById("misc-tiebreak-title"),
    miscTiebreakName: document.getElementById("misc-tiebreak-name"),
    miscTiebreakContinueBtn: document.getElementById("misc-tiebreak-continue-btn"),

    miscResultOverlay: document.getElementById("misc-result-overlay"),
    miscResultTitle: document.getElementById("misc-result-title"),
    miscResultSub: document.getElementById("misc-result-sub"),
    miscResultContinueBtn: document.getElementById("misc-result-continue-btn"),

    miscGameoverScreen: document.getElementById("misc-gameover-screen"),
    miscWinnerTitle: document.getElementById("misc-winner-title"),
    miscWinnerSub: document.getElementById("misc-winner-sub"),
    miscPlayAgainBtn: document.getElementById("misc-play-again-btn"),

    mainMenuScreen: document.getElementById("main-menu-screen"),
    menuMiscCard: document.getElementById("menu-misc-card"),
  };

  // ---------- Utilities ----------

  function shuffledArr(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function randLetter() {
    return String.fromCharCode(65 + randInt(0, 25));
  }

  let matchIdCounter = 0;
  function nextMatchId() {
    return matchIdCounter++;
  }

  // ---------- Save / resume across page reloads ----------
  // Mirrors The Floor's own save/resume (see app.js SAVE_KEY) so a Miscellaneous
  // tournament survives an accidental reload. Only the tournament-level state is
  // persisted — an in-progress round's live duel (clock, criteria, etc.) is not,
  // same limitation The Floor itself has, since that's transient UI state, not
  // part of the tournament record.

  const MISC_SAVE_KEY = "the-floor-misc-save-v1";

  function saveMiscGame(screenPhase) {
    if (!tState) return;
    try {
      localStorage.setItem(MISC_SAVE_KEY, JSON.stringify({ screenPhase, tState }));
    } catch (e) {
      // localStorage unavailable (e.g. private browsing) — just skip saving
    }
  }

  function clearMiscSavedGame() {
    try {
      localStorage.removeItem(MISC_SAVE_KEY);
    } catch (e) {
      // ignore
    }
  }

  function loadMiscSavedGame() {
    try {
      const raw = localStorage.getItem(MISC_SAVE_KEY);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      if (!payload || !payload.tState || !Array.isArray(payload.tState.players)) return null;
      return payload;
    } catch (e) {
      return null;
    }
  }

  // ---------- Setup screen state ----------

  const tournamentTypeSel = { value: "knockout" };
  const roundsPerDuelSel = { value: "3" };
  const duelModeSel = { value: "random" };
  const duelTypeSel = new Set(["floor-mini"]);

  function renderSingleSelectGrid(container, optionsMap, selectedRef, onChange) {
    container.innerHTML = "";
    Object.keys(optionsMap).forEach((key) => {
      const opt = optionsMap[key];
      const card = document.createElement("button");
      card.type = "button";
      card.className = "misc-option-card" + (key === selectedRef.value ? " selected" : "");
      card.innerHTML = `<span class="misc-option-title">${opt.label}</span><span class="misc-option-desc">${opt.desc}</span>`;
      card.addEventListener("click", () => {
        selectedRef.value = key;
        onChange();
      });
      container.appendChild(card);
    });
  }

  function renderTournamentTypeGrid() {
    renderSingleSelectGrid(els.miscTournamentTypeGrid, TOURNAMENT_TYPES, tournamentTypeSel, renderTournamentTypeGrid);
  }

  function renderRoundsGrid() {
    renderSingleSelectGrid(els.miscRoundsGrid, ROUNDS_PER_DUEL, roundsPerDuelSel, renderRoundsGrid);
  }

  function renderDuelModeGridIfNeeded() {
    if (duelTypeSel.size > 1) {
      els.miscDuelModeWrap.classList.remove("hidden");
      renderSingleSelectGrid(els.miscDuelModeGrid, DUEL_MODES, duelModeSel, renderDuelModeGridIfNeeded);
    } else {
      els.miscDuelModeWrap.classList.add("hidden");
    }
  }

  function renderDuelTypeList() {
    els.miscDuelTypeList.innerHTML = "";
    Object.keys(DUEL_TYPES).forEach((key) => {
      const opt = DUEL_TYPES[key];
      const row = document.createElement("label");
      row.className = "misc-duel-type-row" + (duelTypeSel.has(key) ? " selected" : "");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = duelTypeSel.has(key);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) duelTypeSel.add(key);
        else duelTypeSel.delete(key);
        renderDuelTypeList();
        renderDuelModeGridIfNeeded();
      });
      const text = document.createElement("span");
      text.className = "misc-duel-type-text";
      text.innerHTML = `<span class="misc-option-title">${opt.label}</span><span class="misc-option-desc">${opt.desc}</span>`;
      row.appendChild(checkbox);
      row.appendChild(text);
      els.miscDuelTypeList.appendChild(row);
    });
  }

  function resetMiscSetupDefaults() {
    tournamentTypeSel.value = "knockout";
    roundsPerDuelSel.value = "3";
    duelTypeSel.clear();
    duelTypeSel.add("floor-mini");
    duelModeSel.value = "random";
    els.miscCountInput.value = 8;
    els.miscSetupError.classList.add("hidden");
    renderTournamentTypeGrid();
    renderRoundsGrid();
    renderDuelTypeList();
    renderDuelModeGridIfNeeded();
  }

  // ---------- Main menu wiring ----------

  function enterMisc() {
    els.mainMenuScreen.classList.add("hidden");
    resetMiscSetupDefaults();
    els.miscSetupScreen.classList.remove("hidden");
  }

  els.menuMiscCard.addEventListener("click", enterMisc);
  els.miscMenuBackBtn.addEventListener("click", () => {
    els.miscSetupScreen.classList.add("hidden");
    els.mainMenuScreen.classList.remove("hidden");
  });

  // ---------- Setup: player count stepper ----------

  els.miscCountMinus.addEventListener("click", () => {
    els.miscCountInput.value = Math.max(2, (parseInt(els.miscCountInput.value, 10) || 2) - 1);
  });
  els.miscCountPlus.addEventListener("click", () => {
    els.miscCountInput.value = Math.min(32, (parseInt(els.miscCountInput.value, 10) || 2) + 1);
  });
  els.miscCountInput.addEventListener("change", () => {
    let v = parseInt(els.miscCountInput.value, 10);
    if (Number.isNaN(v)) v = 8;
    els.miscCountInput.value = Math.max(2, Math.min(32, v));
  });

  // ---------- Setup: continue -> roster ----------

  let pendingMiscConfig = null;
  let miscRosterInputs = [];

  function buildMiscRosterForm(n) {
    els.miscRosterForm.innerHTML = "";
    miscRosterInputs = [];
    for (let i = 0; i < n; i++) {
      const row = document.createElement("div");
      row.className = "misc-roster-row";
      const label = document.createElement("span");
      label.className = "misc-roster-index";
      label.textContent = `#${i + 1}`;
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 20;
      input.placeholder = `Player ${i + 1}`;
      row.appendChild(label);
      row.appendChild(input);
      els.miscRosterForm.appendChild(row);
      miscRosterInputs.push(input);
    }
  }

  els.miscSetupContinueBtn.addEventListener("click", () => {
    if (duelTypeSel.size === 0) {
      els.miscSetupError.classList.remove("hidden");
      return;
    }
    els.miscSetupError.classList.add("hidden");
    const playerCount = Math.max(2, Math.min(32, parseInt(els.miscCountInput.value, 10) || 2));
    const roundsPerDuel = parseInt(roundsPerDuelSel.value, 10);
    pendingMiscConfig = {
      playerCount,
      tournamentType: tournamentTypeSel.value,
      winsNeeded: Math.ceil(roundsPerDuel / 2),
      duelTypes: Array.from(duelTypeSel),
      duelTypeMode: duelModeSel.value,
    };
    buildMiscRosterForm(playerCount);
    els.miscSetupScreen.classList.add("hidden");
    els.miscRosterScreen.classList.remove("hidden");
  });

  els.miscRosterBackBtn.addEventListener("click", () => {
    els.miscRosterScreen.classList.add("hidden");
    els.miscSetupScreen.classList.remove("hidden");
  });

  els.miscRosterStartBtn.addEventListener("click", () => {
    const players = miscRosterInputs.map((inp, i) => ({ index: i, name: inp.value.trim() || `Player ${i + 1}` }));
    startMiscTournament(players, pendingMiscConfig);
  });

  // ---------- Bracket generation: knockout ----------

  function buildKnockoutBracket(playerIndexes) {
    const real = shuffledArr(playerIndexes);
    const n = real.length;
    let size = 1;
    while (size < n) size *= 2;
    const byes = size - n;

    const slots = [];
    let idx = 0;
    for (let i = 0; i < byes; i++) {
      slots.push(real[idx++]);
      slots.push(null);
    }
    while (idx < n) slots.push(real[idx++]);

    const totalRounds = Math.log2(size);
    const rounds = [];

    const round1 = [];
    for (let i = 0; i < slots.length; i += 2) {
      const a = slots[i];
      const b = slots[i + 1];
      const m = {
        id: nextMatchId(),
        roundIdx: 0,
        indexInRound: round1.length,
        playerA: a,
        playerB: b,
        winner: null,
        winsA: 0,
        winsB: 0,
        roundsLog: [],
        status: "pending",
      };
      if (a === null || b === null) {
        m.winner = a === null ? b : a;
        m.status = "bye";
      }
      round1.push(m);
    }
    rounds.push(round1);

    let count = round1.length;
    for (let r = 2; r <= totalRounds; r++) {
      count = count / 2;
      const roundMatches = [];
      for (let i = 0; i < count; i++) {
        roundMatches.push({
          id: nextMatchId(),
          roundIdx: r - 1,
          indexInRound: i,
          playerA: null,
          playerB: null,
          winner: null,
          winsA: 0,
          winsB: 0,
          roundsLog: [],
          status: "tbd",
        });
      }
      rounds.push(roundMatches);
    }

    for (let r = 0; r < totalRounds - 1; r++) {
      rounds[r].forEach((m, i) => {
        if (m.winner !== null) propagateWinnerInto(rounds[r + 1], i, m.winner);
      });
    }

    return { rounds, totalRounds };
  }

  function propagateWinnerInto(nextRoundMatches, prevIndex, winnerIndex) {
    const nextMatch = nextRoundMatches[Math.floor(prevIndex / 2)];
    if (prevIndex % 2 === 0) nextMatch.playerA = winnerIndex;
    else nextMatch.playerB = winnerIndex;
    if (nextMatch.playerA !== null && nextMatch.playerB !== null) nextMatch.status = "pending";
  }

  function knockoutRoundLabel(r, total) {
    const remaining = total - r + 1;
    if (remaining === 1) return "Final";
    if (remaining === 2) return "Semifinal";
    if (remaining === 3) return "Quarterfinal";
    return `Round ${r}`;
  }

  // ---------- Bracket generation: round robin ----------

  function buildRoundRobin(playerIndexes) {
    let arr = playerIndexes.slice();
    if (arr.length % 2 !== 0) arr.push(null);
    const n = arr.length;
    const totalMatchdays = n - 1;
    const half = n / 2;
    const rounds = [];

    for (let day = 0; day < totalMatchdays; day++) {
      const dayMatches = [];
      for (let i = 0; i < half; i++) {
        const a = arr[i];
        const b = arr[n - 1 - i];
        if (a !== null && b !== null) {
          dayMatches.push({
            id: nextMatchId(),
            matchday: day + 1,
            playerA: a,
            playerB: b,
            winner: null,
            winsA: 0,
            winsB: 0,
            roundsLog: [],
            status: "pending",
          });
        }
      }
      rounds.push(dayMatches);
      const fixed = arr[0];
      const rest = arr.slice(1);
      rest.unshift(rest.pop());
      arr = [fixed].concat(rest);
    }

    return { rounds, totalMatchdays };
  }

  function buildGroups(playerIndexes) {
    const shuffledPlayers = shuffledArr(playerIndexes);
    const n = shuffledPlayers.length;
    let numGroups = Math.round(n / 4);
    if (numGroups < 1) numGroups = 1;
    if (numGroups > Math.floor(n / 2)) numGroups = Math.max(1, Math.floor(n / 2));
    const groupPlayers = Array.from({ length: numGroups }, () => []);
    shuffledPlayers.forEach((p, i) => groupPlayers[i % numGroups].push(p));
    return groupPlayers.map((playersInGroup) => ({
      players: playersInGroup,
      rr: buildRoundRobin(playersInGroup),
      standings: null,
      advancers: null,
    }));
  }

  // ---------- Standings & live tie-break draw ----------

  function computeStatsOnly(playerIndexes, allMatches) {
    const stats = {};
    playerIndexes.forEach((p) => {
      stats[p] = { index: p, wins: 0, losses: 0 };
    });
    allMatches.forEach((m) => {
      if (m.winner === null) return;
      const loser = m.winner === m.playerA ? m.playerB : m.playerA;
      if (stats[m.winner]) stats[m.winner].wins++;
      if (stats[loser]) stats[loser].losses++;
    });
    return stats;
  }

  function findDirectMatch(a, b, allMatches) {
    return allMatches.find(
      (m) => m.winner !== null && ((m.playerA === a && m.playerB === b) || (m.playerA === b && m.playerB === a))
    );
  }

  // Finds groups of players tied on wins within a wins-sorted ranking. Any
  // 2-way tie with a decisive head-to-head result is resolved immediately
  // (no drama needed); everything else (3+-way ties, or 2-way ties with no
  // direct match) is queued as a "job" for a live on-screen draw.
  function findTieJobs(ranked, stats, allMatches, targetArray) {
    const jobs = [];
    let i = 0;
    while (i < ranked.length) {
      let j = i;
      while (j + 1 < ranked.length && stats[ranked[j + 1]].wins === stats[ranked[i]].wins) j++;
      if (j > i) {
        const indexes = ranked.slice(i, j + 1);
        if (indexes.length === 2) {
          const direct = findDirectMatch(indexes[0], indexes[1], allMatches);
          if (direct) {
            const [a, b] = indexes;
            const order = direct.winner === a ? [a, b] : [b, a];
            targetArray[i] = order[0];
            targetArray[i + 1] = order[1];
            i = j + 1;
            continue;
          }
        }
        jobs.push({ targetArray, cluster: { start: i, indexes } });
      }
      i = j + 1;
    }
    return jobs;
  }

  // Dramatized "draw of lots" reveal for a tied cluster — settles one position
  // at a time via the same spin-then-reveal animation as the coin toss, so an
  // unresolvable tie (3+ way, or no head-to-head) is decided on screen instead
  // of silently. The final order is predetermined (shuffled) up front; the
  // spin animation just reveals it one seat at a time.
  function runLiveTiebreakDraw(targetArray, cluster, onDone) {
    const order = shuffledArr(cluster.indexes);
    let revealIdx = 0;

    function revealNext() {
      if (revealIdx >= order.length) {
        for (let k = 0; k < order.length; k++) targetArray[cluster.start + k] = order[k];
        els.miscTiebreakOverlay.classList.add("hidden");
        onDone();
        return;
      }
      const candidatesLeft = order.slice(revealIdx);
      const settleOn = order[revealIdx];
      els.miscTiebreakOverlay.classList.remove("hidden");
      els.miscTiebreakContinueBtn.classList.add("hidden");
      els.miscTiebreakTitle.textContent = `\u{1F3B2} Tie-break draw — deciding position ${cluster.start + revealIdx + 1}`;
      let ticks = 0;
      const interval = setInterval(() => {
        const idx = candidatesLeft[Math.floor(Math.random() * candidatesLeft.length)];
        els.miscTiebreakName.textContent = playerName(idx);
        ticks++;
        if (ticks >= COIN_TOSS_TICKS) {
          clearInterval(interval);
          els.miscTiebreakName.textContent = `${playerName(settleOn)} takes position ${cluster.start + revealIdx + 1}!`;
          els.miscTiebreakContinueBtn.classList.remove("hidden");
          els.miscTiebreakContinueBtn.onclick = () => {
            revealIdx++;
            revealNext();
          };
        }
      }, COIN_TOSS_TICK_MS);
    }
    revealNext();
  }

  function runJobQueue(jobs, onAllDone) {
    function processNext() {
      if (jobs.length === 0) {
        onAllDone();
        return;
      }
      const job = jobs.shift();
      runLiveTiebreakDraw(job.targetArray, job.cluster, processNext);
    }
    processNext();
  }

  function computeStandingsWithLiveTiebreak(playerIndexes, allMatches, onDone) {
    const stats = computeStatsOnly(playerIndexes, allMatches);
    const ranked = playerIndexes.slice().sort((a, b) => stats[b].wins - stats[a].wins);
    const jobs = findTieJobs(ranked, stats, allMatches, ranked);
    runJobQueue(jobs, () => {
      onDone(ranked.map((p) => Object.assign({ index: p }, stats[p])));
    });
  }

  function finalizeAllGroupsWithTiebreaks(onAllDone) {
    const allJobs = [];
    tState.groups.forEach((g) => {
      const allMatches = g.rr.rounds.flat();
      const stats = computeStatsOnly(g.players, allMatches);
      const ranked = g.players.slice().sort((a, b) => stats[b].wins - stats[a].wins);
      g._stats = stats;
      g._ranked = ranked;
      allJobs.push(...findTieJobs(ranked, stats, allMatches, ranked));
    });

    runJobQueue(allJobs, () => {
      tState.groups.forEach((g) => {
        g.standings = g._ranked.map((p) => Object.assign({ index: p }, g._stats[p]));
        const advanceCount = g.players.length >= 3 ? 2 : 1;
        g.advancers = g.standings.slice(0, advanceCount).map((s) => s.index);
        delete g._stats;
        delete g._ranked;
      });
      onAllDone();
    });
  }

  function startKnockoutFromGroups() {
    const advancing = tState.groups.flatMap((g) => g.advancers);
    tState.bracket = buildKnockoutBracket(advancing);
    tState.phase = "knockout";
  }

  // ---------- Tournament lifecycle ----------

  let tState = null;
  let match = null;

  function startMiscTournament(players, config) {
    tState = {
      players,
      tournamentType: config.tournamentType,
      winsNeeded: config.winsNeeded,
      duelTypes: config.duelTypes,
      duelTypeMode: config.duelTypeMode,
      champion: null,
      groupsFinalized: false,
      groupsFinalizing: false,
      standingsFinalized: false,
      standingsFinalizing: false,
    };
    const playerIndexes = players.map((p) => p.index);
    if (config.tournamentType === "knockout") {
      tState.phase = "knockout";
      tState.bracket = buildKnockoutBracket(playerIndexes);
    } else if (config.tournamentType === "round-robin") {
      tState.phase = "round-robin";
      tState.rr = buildRoundRobin(playerIndexes);
    } else {
      tState.phase = "group";
      tState.groups = buildGroups(playerIndexes);
    }
    els.miscRosterScreen.classList.add("hidden");
    els.miscBracketScreen.classList.remove("hidden");
    renderBracketScreen();
  }

  function checkTournamentProgress() {
    if (tState.phase === "knockout") {
      const rounds = tState.bracket.rounds;
      const lastRound = rounds[rounds.length - 1];
      if (lastRound.length === 1 && lastRound[0].winner !== null) {
        tState.champion = lastRound[0].winner;
        showMiscGameOver();
        return;
      }
      renderBracketScreen();
    } else if (tState.phase === "round-robin") {
      const all = tState.rr.rounds.flat();
      renderBracketScreen();
      if (all.every((m) => m.winner !== null) && !tState.standingsFinalized && !tState.standingsFinalizing) {
        tState.standingsFinalizing = true;
        computeStandingsWithLiveTiebreak(tState.players.map((p) => p.index), all, (standings) => {
          tState.champion = standings[0].index;
          tState.finalStandings = standings;
          tState.standingsFinalized = true;
          tState.standingsFinalizing = false;
          showMiscGameOver();
        });
      }
    } else if (tState.phase === "group") {
      const allGroupMatches = tState.groups.flatMap((g) => g.rr.rounds.flat());
      renderBracketScreen();
      if (allGroupMatches.every((m) => m.winner !== null) && !tState.groupsFinalized && !tState.groupsFinalizing) {
        tState.groupsFinalizing = true;
        finalizeAllGroupsWithTiebreaks(() => {
          tState.groupsFinalized = true;
          tState.groupsFinalizing = false;
          renderBracketScreen();
        });
      }
    }
  }

  function showMiscGameOver() {
    els.miscBracketScreen.classList.add("hidden");
    els.miscGameoverScreen.classList.remove("hidden");
    const champName = tState.players[tState.champion].name;
    els.miscWinnerTitle.textContent = `${champName} wins!`;
    if (tState.finalStandings) {
      const lines = tState.finalStandings.map((s, i) => `${i + 1}. ${tState.players[s.index].name} (${s.wins}W ${s.losses}L)`);
      els.miscWinnerSub.textContent = `Champion of the QA Open tournament. Final standings: ${lines.join(" · ")}`;
    } else {
      els.miscWinnerSub.textContent = "Champion of the QA Open tournament.";
    }
    saveMiscGame("gameover");
  }

  els.miscPlayAgainBtn.addEventListener("click", () => {
    tState = null;
    clearMiscSavedGame();
    els.miscGameoverScreen.classList.add("hidden");
    els.mainMenuScreen.classList.remove("hidden");
  });

  // ---------- Bracket screen rendering ----------

  function playerName(idx) {
    return idx === null ? null : tState.players[idx].name;
  }

  function renderMatchRow(container, m) {
    const row = document.createElement("div");
    row.className = "misc-match-row";
    const nameA = m.playerA === null ? "TBD" : playerName(m.playerA);
    const nameB = m.playerB === null ? "TBD" : playerName(m.playerB);

    const label = document.createElement("span");
    label.className = "misc-match-label";
    label.textContent = `${nameA} vs ${nameB}`;
    row.appendChild(label);

    if (m.status === "bye") {
      const note = document.createElement("span");
      note.className = "misc-match-status misc-match-bye";
      note.textContent = `${playerName(m.winner)} advances (bye)`;
      row.appendChild(note);
    } else if (m.winner !== null) {
      const note = document.createElement("span");
      note.className = "misc-match-status misc-match-done";
      note.textContent = `\u{1F3C6} ${playerName(m.winner)} (${m.winsA}-${m.winsB})`;
      row.appendChild(note);
    } else if (m.playerA !== null && m.playerB !== null) {
      if (m.winsA > 0 || m.winsB > 0) {
        const scoreNote = document.createElement("span");
        scoreNote.className = "misc-match-status";
        scoreNote.textContent = `(${m.winsA}-${m.winsB} so far)`;
        row.appendChild(scoreNote);
      }
      const btn = document.createElement("button");
      btn.className = "primary-btn misc-match-start-btn";
      btn.type = "button";
      btn.textContent = m.winsA > 0 || m.winsB > 0 ? "▶ Resume" : "▶ Start";
      btn.disabled = !!match;
      btn.addEventListener("click", () => beginMatch(m));
      row.appendChild(btn);
    } else {
      const note = document.createElement("span");
      note.className = "misc-match-status";
      note.textContent = "Waiting…";
      row.appendChild(note);
    }
    container.appendChild(row);
  }

  function renderBracketScreen() {
    const body = els.miscBracketBody;
    body.innerHTML = "";

    if (tState.phase === "knockout") {
      els.miscBracketSubtitle.textContent = "Knockout bracket";
      const total = tState.bracket.totalRounds;
      tState.bracket.rounds.forEach((roundMatches, i) => {
        const section = document.createElement("div");
        section.className = "misc-round-section";
        const h = document.createElement("h3");
        h.className = "misc-round-heading";
        h.textContent = knockoutRoundLabel(i + 1, total);
        section.appendChild(h);
        roundMatches.forEach((m) => renderMatchRow(section, m));
        body.appendChild(section);
      });
    } else if (tState.phase === "round-robin") {
      els.miscBracketSubtitle.textContent = "Round robin";
      tState.rr.rounds.forEach((dayMatches, i) => {
        const section = document.createElement("div");
        section.className = "misc-round-section";
        const h = document.createElement("h3");
        h.className = "misc-round-heading";
        h.textContent = `Matchday ${i + 1} of ${tState.rr.totalMatchdays}`;
        section.appendChild(h);
        dayMatches.forEach((m) => renderMatchRow(section, m));
        body.appendChild(section);
      });
    } else if (tState.phase === "group") {
      els.miscBracketSubtitle.textContent = "Group stage";
      tState.groups.forEach((g, gi) => {
        const section = document.createElement("div");
        section.className = "misc-group-section";
        const h = document.createElement("h3");
        h.className = "misc-round-heading";
        h.textContent = `Group ${gi + 1}`;
        section.appendChild(h);
        g.rr.rounds.forEach((dayMatches, di) => {
          const dayHeading = document.createElement("div");
          dayHeading.className = "misc-matchday-heading";
          dayHeading.textContent = `Matchday ${di + 1} of ${g.rr.totalMatchdays}`;
          section.appendChild(dayHeading);
          dayMatches.forEach((m) => renderMatchRow(section, m));
        });
        if (g.standings) {
          const standingsBox = document.createElement("div");
          standingsBox.className = "misc-standings";
          g.standings.forEach((s, si) => {
            const srow = document.createElement("div");
            const advances = si < g.advancers.length;
            srow.className = "misc-standings-row" + (advances ? " advances" : "");
            srow.textContent = `${si + 1}. ${playerName(s.index)} — ${s.wins}W ${s.losses}L${advances ? " ✅ advances" : ""}`;
            standingsBox.appendChild(srow);
          });
          section.appendChild(standingsBox);
        }
        body.appendChild(section);
      });

      if (tState.groupsFinalized) {
        const btn = document.createElement("button");
        btn.className = "primary-btn misc-continue-knockout-btn";
        btn.type = "button";
        btn.textContent = "▶ Continue to Knockout Stage";
        btn.disabled = !!match;
        btn.addEventListener("click", () => {
          startKnockoutFromGroups();
          renderBracketScreen();
        });
        body.appendChild(btn);
      }
    }

    saveMiscGame("playing");
  }

  // ---------- Match engine ----------

  function beginMatch(m) {
    if (match) return;
    match = {
      matchRef: m,
      playerA: m.playerA,
      playerB: m.playerB,
      winsNeeded: tState.winsNeeded,
      winsA: m.winsA || 0,
      winsB: m.winsB || 0,
      roundNum: m.roundsLog.length,
      pendingType: null,
    };
    showMatchIntro();
  }

  function hideAllMiscOverlays() {
    els.miscIntroOverlay.classList.add("hidden");
    els.miscCategoryPickerOverlay.classList.add("hidden");
    els.miscFloorOverlay.classList.add("hidden");
    els.miscBringmeOverlay.classList.add("hidden");
    els.miscTargetOverlay.classList.add("hidden");
    els.miscStopwatchOverlay.classList.add("hidden");
    els.miscGuessOverlay.classList.add("hidden");
    els.miscGuesstimeOverlay.classList.add("hidden");
    els.miscAttackOverlay.classList.add("hidden");
    els.miscOverunderOverlay.classList.add("hidden");
    els.miscCoinTossOverlay.classList.add("hidden");
    els.miscResultOverlay.classList.add("hidden");
    els.miscTiebreakOverlay.classList.add("hidden");
    els.countdownOverlay.classList.add("hidden");
    if (miniCountdown) clearInterval(miniCountdown.handle);
    miniCountdown = null;
    if (stopwatchTickHandle) clearInterval(stopwatchTickHandle);
    stopwatchTickHandle = null;
    stopwatch = null;
    if (guessTimeTickHandle) clearInterval(guessTimeTickHandle);
    guessTimeTickHandle = null;
    guessTimeCapture = null;
    clearAttackTimer();
    attackDuel = null;
    overUnderState = null;
  }

  function showMatchIntro() {
    match.roundNum++;
    const nameA = tState.players[match.playerA].name;
    const nameB = tState.players[match.playerB].name;
    els.miscIntroTitle.textContent = `${nameA} vs ${nameB}`;
    els.miscIntroScore.textContent = `${match.winsA} – ${match.winsB}  ·  Round ${match.roundNum} (first to ${match.winsNeeded})`;

    const types = tState.duelTypes;
    els.miscIntroType.classList.add("hidden");
    els.miscIntroPicker.classList.add("hidden");
    els.miscIntroBeginBtn.classList.add("hidden");

    if (types.length === 1) {
      match.pendingType = types[0];
      els.miscIntroType.textContent = `This round: ${DUEL_TYPES[types[0]].label}`;
      els.miscIntroType.classList.remove("hidden");
      els.miscIntroBeginBtn.classList.remove("hidden");
    } else if (tState.duelTypeMode === "random") {
      match.pendingType = types[Math.floor(Math.random() * types.length)];
      els.miscIntroType.textContent = `This round: ${DUEL_TYPES[match.pendingType].label} (randomly picked)`;
      els.miscIntroType.classList.remove("hidden");
      els.miscIntroBeginBtn.classList.remove("hidden");
    } else {
      els.miscIntroPicker.innerHTML = "";
      types.forEach((t) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "primary-btn misc-picker-btn";
        b.textContent = DUEL_TYPES[t].label;
        b.addEventListener("click", () => {
          match.pendingType = t;
          els.miscIntroOverlay.classList.add("hidden");
          beginRound();
        });
        els.miscIntroPicker.appendChild(b);
      });
      els.miscIntroPicker.classList.remove("hidden");
    }

    els.miscIntroOverlay.classList.remove("hidden");
  }

  els.miscIntroBeginBtn.addEventListener("click", () => {
    els.miscIntroOverlay.classList.add("hidden");
    beginRound();
  });

  function beginRound() {
    switch (match.pendingType) {
      case "floor-mini":
        showMiniCategoryPicker();
        break;
      case "bring-me":
        startBringMeDuel();
        break;
      case "weight":
        startWeightRound();
        break;
      case "length":
        startLengthRound();
        break;
      case "time":
        startTimeRound();
        break;
    }
  }

  // Each of Weight/Length/Time rolls a random sub-duel every round, so the
  // top-level duel type picked at intro time only decides the category —
  // which specific mechanic gets played is a surprise revealed once the
  // sub-duel's own overlay opens.
  function startWeightRound() {
    const sub = WEIGHT_SUBDUELS[randInt(0, WEIGHT_SUBDUELS.length - 1)];
    if (sub === "closest") startTargetDuel("weight");
    else if (sub === "guess") startGuessDuel("weight");
    else startTargetDuel("cut");
  }

  function startLengthRound() {
    const sub = LENGTH_SUBDUELS[randInt(0, LENGTH_SUBDUELS.length - 1)];
    if (sub === "closest") startTargetDuel("length");
    else startGuessDuel("length");
  }

  function startTimeRound() {
    const sub = TIME_SUBDUELS[randInt(0, TIME_SUBDUELS.length - 1)];
    if (sub === "closest") startTimeDuel();
    else if (sub === "guess") startGuessTimeDuel();
    else if (sub === "attack") startTimeAttackDuel();
    else startOverUnderDuel();
  }

  function onRoundDecided(side) {
    if (side === "A") match.winsA++;
    else match.winsB++;
    match.matchRef.winsA = match.winsA;
    match.matchRef.winsB = match.winsB;
    match.matchRef.roundsLog.push({ type: match.pendingType, winner: side });
    saveMiscGame("playing");
    showRoundResult(side);
  }

  function showRoundResult(side) {
    const winnerName = tState.players[side === "A" ? match.playerA : match.playerB].name;
    const matchDecided = match.winsA >= match.winsNeeded || match.winsB >= match.winsNeeded;
    els.miscResultTitle.textContent = matchDecided ? `\u{1F3C1} ${winnerName} wins the match!` : `\u{1F3C6} ${winnerName} wins the round!`;
    els.miscResultSub.textContent = `${tState.players[match.playerA].name} ${match.winsA} – ${match.winsB} ${tState.players[match.playerB].name}`;
    els.miscResultOverlay.classList.remove("hidden");
    els.miscResultContinueBtn.onclick = () => {
      els.miscResultOverlay.classList.add("hidden");
      if (matchDecided) finishMatch();
      else showMatchIntro();
    };
  }

  function finishMatch() {
    const winnerSide = match.winsA >= match.winsNeeded ? "A" : "B";
    const winnerIndex = winnerSide === "A" ? match.playerA : match.playerB;
    const m = match.matchRef;
    m.winner = winnerIndex;
    m.winsA = match.winsA;
    m.winsB = match.winsB;
    m.status = "done";
    if (tState.phase === "knockout" && typeof m.roundIdx === "number" && m.roundIdx + 1 < tState.bracket.rounds.length) {
      propagateWinnerInto(tState.bracket.rounds[m.roundIdx + 1], m.indexInRound, winnerIndex);
    }
    match = null;
    hideAllMiscOverlays();
    checkTournamentProgress();
  }

  // ---------- Generic coin toss (tie-break) ----------

  function startMiscCoinToss(nameA, nameB, onDoneSide) {
    els.miscCoinTossOverlay.classList.remove("hidden");
    els.miscCoinTossContinueBtn.classList.add("hidden");
    let ticks = 0;
    const interval = setInterval(() => {
      const side = Math.random() < 0.5 ? "A" : "B";
      els.miscCoinTossName.textContent = side === "A" ? nameA : nameB;
      ticks++;
      if (ticks >= COIN_TOSS_TICKS) {
        clearInterval(interval);
        const winnerSide = Math.random() < 0.5 ? "A" : "B";
        els.miscCoinTossName.textContent = `${winnerSide === "A" ? nameA : nameB} wins the coin toss!`;
        els.miscCoinTossContinueBtn.classList.remove("hidden");
        els.miscCoinTossContinueBtn.onclick = () => {
          els.miscCoinTossOverlay.classList.add("hidden");
          onDoneSide(winnerSide);
        };
      }
    }, COIN_TOSS_TICK_MS);
  }

  // ---------- Duel engine: The Floor Mini Duel ----------

  let miniDuel = null;
  let miniTimerHandle = null;
  const miniImageCache = new Map();

  function resolveMiniClueImageUrl(basePath) {
    if (miniImageCache.has(basePath)) return Promise.resolve(miniImageCache.get(basePath));
    return new Promise((resolve) => {
      let extIndex = 0;
      const tryNext = () => {
        if (extIndex >= IMAGE_EXTENSIONS.length) {
          miniImageCache.set(basePath, null);
          resolve(null);
          return;
        }
        const url = `${basePath}.${IMAGE_EXTENSIONS[extIndex]}`;
        const probe = new Image();
        probe.onload = () => {
          miniImageCache.set(basePath, url);
          resolve(url);
        };
        probe.onerror = () => {
          extIndex++;
          tryNext();
        };
        probe.src = url;
      };
      tryNext();
    });
  }

  // Resolves once every question image in the category has either loaded
  // (and so sits in the browser cache) or been confirmed missing.
  function preloadMiniCategoryImages(catIndex) {
    return Promise.all(CATEGORIES[catIndex].questions.map((q) => resolveMiniClueImageUrl(q.image)));
  }

  // ---------- 3-2-1 countdown (Floor Mini Duel) ----------
  // Reuses The Floor's countdown overlay. The category's images load while it
  // counts down; the duel only starts once both the countdown has finished and
  // every image is ready, so the clock never runs while a clue is still loading.

  let miniCountdown = null;

  function runMiniCountdown(title, imagesReady, onDone) {
    const cd = { handle: null, counted: false, loaded: false };
    miniCountdown = cd;
    els.countdownTitle.textContent = title;
    els.countdownOverlay.classList.remove("hidden");

    function finishIfReady() {
      if (miniCountdown !== cd || !cd.counted || !cd.loaded) return;
      miniCountdown = null;
      els.countdownOverlay.classList.add("hidden");
      onDone();
    }

    function showCount(n) {
      els.countdownNumber.textContent = n;
      els.countdownNumber.style.animation = "none";
      void els.countdownNumber.offsetWidth; // reflow to restart the pop animation
      els.countdownNumber.style.animation = "";
    }

    imagesReady.then(() => {
      cd.loaded = true;
      finishIfReady();
    });

    let count = COUNTDOWN_START;
    showCount(count);
    cd.handle = setInterval(() => {
      count--;
      if (count > 0) {
        showCount(count);
        return;
      }
      clearInterval(cd.handle);
      cd.counted = true;
      if (!cd.loaded) els.countdownTitle.textContent = "Loading images…";
      finishIfReady();
    }, COUNTDOWN_TICK_MS);
  }

  function loadMiniClueImage(basePath) {
    els.miscFloorImage.classList.add("hidden");
    els.miscFloorPlaceholder.classList.add("hidden");
    resolveMiniClueImageUrl(basePath).then((url) => {
      if (!miniDuel || miniDuel.currentQuestion.image !== basePath) return;
      if (url) {
        els.miscFloorImage.src = url;
        els.miscFloorImage.classList.remove("hidden");
      } else {
        els.miscFloorPlaceholderPath.textContent = `${basePath}.(jpg|png|webp|gif|avif)`;
        els.miscFloorPlaceholder.classList.remove("hidden");
      }
    });
  }

  function miniCategoryHasQuestionsLeft() {
    return miniDuel.usedQuestions.length < CATEGORIES[miniDuel.categoryIndex].questions.length;
  }

  function pickMiniQuestion() {
    const cat = CATEGORIES[miniDuel.categoryIndex];
    const available = cat.questions.map((_, i) => i).filter((i) => !miniDuel.usedQuestions.includes(i));
    const pick = available[Math.floor(Math.random() * available.length)];
    miniDuel.usedQuestions.push(pick);
    return cat.questions[pick];
  }

  function miniSecondsElFor(side) {
    return side === "A" ? els.miscFloorSecondsA : els.miscFloorSecondsB;
  }
  function miniLifeElFor(side) {
    return side === "A" ? els.miscFloorLifeA : els.miscFloorLifeB;
  }
  function miniFillElFor(side) {
    return side === "A" ? els.miscFloorFillA : els.miscFloorFillB;
  }

  function updateMiniLifeUI() {
    ["A", "B"].forEach((side) => {
      const pct = Math.max(0, (miniDuel.times[side] / MINI_LIFE_SECONDS) * 100);
      miniFillElFor(side).style.width = `${pct}%`;
      miniSecondsElFor(side).textContent = Math.max(0, miniDuel.times[side]).toFixed(1);
      miniLifeElFor(side).classList.toggle("active", miniDuel.active === side);
    });
  }

  function showMiniQuestion() {
    if (!miniCategoryHasQuestionsLeft()) {
      endMiniDuelOutOfQuestions();
      return;
    }
    miniDuel.currentQuestion = pickMiniQuestion();
    loadMiniClueImage(miniDuel.currentQuestion.image);
    els.miscFloorAnswerText.textContent = miniDuel.currentQuestion.answer;
    els.miscFloorAnswerText.classList.add("blurred");
    els.miscFloorAnswer.querySelector(".host-answer-icon").textContent = "\u{1F648}";
    updateMiniLifeUI();
  }

  // ---------- Host category picker (Floor Mini Duel) ----------
  // A typeahead search+dropdown over all 120 categories, modeled on the same
  // pattern The Floor's own roster/finale pickers use (see app.js), but kept
  // self-contained here since misc.js doesn't share that closure.

  let categoryPickerChosenIndex = null;
  let categoryPickerHighlightIndex = -1;
  let categoryPickerVisibleOptions = [];

  function categoryPickerOptions(query) {
    const q = query.trim().toLowerCase();
    return CATEGORIES.map((cat, idx) => ({ id: idx, label: cat.name })).filter((o) => !q || o.label.toLowerCase().includes(q));
  }

  function renderCategoryPickerDropdown() {
    const matches = categoryPickerOptions(els.miscCategoryPickerInput.value);
    categoryPickerVisibleOptions = matches;
    els.miscCategoryPickerDropdown.innerHTML = "";
    if (matches.length === 0) {
      const empty = document.createElement("div");
      empty.className = "expertise-empty";
      empty.textContent = "No matching category";
      els.miscCategoryPickerDropdown.appendChild(empty);
    } else {
      matches.forEach((opt, i) => {
        const el = document.createElement("div");
        el.className = "expertise-option" + (i === categoryPickerHighlightIndex ? " highlighted" : "");
        el.textContent = opt.label;
        el.addEventListener("mousedown", (e) => {
          e.preventDefault();
          commitCategoryPick(opt);
        });
        els.miscCategoryPickerDropdown.appendChild(el);
      });
    }
    els.miscCategoryPickerDropdown.classList.remove("hidden");
  }

  function commitCategoryPick(opt) {
    categoryPickerChosenIndex = opt.id;
    els.miscCategoryPickerInput.value = opt.label;
    els.miscCategoryPickerDropdown.classList.add("hidden");
    els.miscCategoryPickerConfirmBtn.disabled = false;
  }

  els.miscCategoryPickerInput.addEventListener("focus", () => {
    els.miscCategoryPickerInput.value = "";
    categoryPickerHighlightIndex = -1;
    renderCategoryPickerDropdown();
  });

  els.miscCategoryPickerInput.addEventListener("input", () => {
    categoryPickerHighlightIndex = -1;
    categoryPickerChosenIndex = null;
    els.miscCategoryPickerConfirmBtn.disabled = true;
    renderCategoryPickerDropdown();
  });

  els.miscCategoryPickerInput.addEventListener("keydown", (e) => {
    if (els.miscCategoryPickerDropdown.classList.contains("hidden")) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (categoryPickerVisibleOptions.length) {
        categoryPickerHighlightIndex = (categoryPickerHighlightIndex + 1) % categoryPickerVisibleOptions.length;
        renderCategoryPickerDropdown();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (categoryPickerVisibleOptions.length) {
        categoryPickerHighlightIndex = (categoryPickerHighlightIndex - 1 + categoryPickerVisibleOptions.length) % categoryPickerVisibleOptions.length;
        renderCategoryPickerDropdown();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = categoryPickerVisibleOptions[categoryPickerHighlightIndex] || categoryPickerVisibleOptions[0];
      if (pick) commitCategoryPick(pick);
    } else if (e.key === "Escape") {
      els.miscCategoryPickerInput.value = categoryPickerChosenIndex !== null ? CATEGORIES[categoryPickerChosenIndex].name : "";
      els.miscCategoryPickerDropdown.classList.add("hidden");
    }
  });

  els.miscCategoryPickerInput.addEventListener("blur", () => {
    setTimeout(() => {
      els.miscCategoryPickerDropdown.classList.add("hidden");
      els.miscCategoryPickerInput.value = categoryPickerChosenIndex !== null ? CATEGORIES[categoryPickerChosenIndex].name : "";
    }, 0);
  });

  function showMiniCategoryPicker() {
    categoryPickerChosenIndex = null;
    categoryPickerHighlightIndex = -1;
    els.miscCategoryPickerInput.value = "";
    els.miscCategoryPickerConfirmBtn.disabled = true;
    els.miscCategoryPickerOverlay.classList.remove("hidden");
    renderCategoryPickerDropdown();
  }

  els.miscCategoryPickerConfirmBtn.addEventListener("click", () => {
    if (categoryPickerChosenIndex === null) return;
    els.miscCategoryPickerOverlay.classList.add("hidden");
    startFloorMiniDuel(categoryPickerChosenIndex);
  });

  function startFloorMiniDuel(catIndex) {
    miniDuel = {
      categoryIndex: catIndex,
      usedQuestions: [],
      times: { A: MINI_LIFE_SECONDS, B: MINI_LIFE_SECONDS },
      active: "A",
      currentQuestion: null,
      lastTick: null,
      ended: false,
      transitioning: false,
    };
    els.miscFloorCategory.textContent = CATEGORIES[catIndex].name;
    els.miscFloorNameA.textContent = tState.players[match.playerA].name;
    els.miscFloorNameB.textContent = tState.players[match.playerB].name;
    els.miscFloorSecondsA.classList.remove("passed");
    els.miscFloorSecondsB.classList.remove("passed");
    els.miscFloorLog.textContent = "";
    const nameA = tState.players[match.playerA].name;
    const nameB = tState.players[match.playerB].name;
    runMiniCountdown(`${nameA} vs ${nameB} — ${CATEGORIES[catIndex].name}`, preloadMiniCategoryImages(catIndex), () => {
      els.miscFloorOverlay.classList.remove("hidden");
      showMiniQuestion();
      if (miniDuel.ended) return;
      miniDuel.lastTick = performance.now();
      clearMiniTimer();
      miniTimerHandle = setInterval(tickMiniClock, 100);
    });
  }

  function clearMiniTimer() {
    if (miniTimerHandle) clearInterval(miniTimerHandle);
    miniTimerHandle = null;
  }

  function tickMiniClock() {
    if (!miniDuel) return;
    const now = performance.now();
    const delta = (now - miniDuel.lastTick) / 1000;
    miniDuel.lastTick = now;
    miniDuel.times[miniDuel.active] -= delta;

    if (miniDuel.times[miniDuel.active] <= 0) {
      miniDuel.times[miniDuel.active] = 0;
      updateMiniLifeUI();
      loseMiniDuel(miniDuel.active);
      return;
    }
    updateMiniLifeUI();
  }

  function loseMiniDuel(loserSide) {
    clearMiniTimer();
    miniDuel.ended = true;
    const winnerSide = loserSide === "A" ? "B" : "A";
    const loserIndex = loserSide === "A" ? match.playerA : match.playerB;
    els.miscFloorLog.textContent = `${tState.players[loserIndex].name}'s clock ran out!`;
    setTimeout(() => {
      els.miscFloorOverlay.classList.add("hidden");
      onRoundDecided(winnerSide);
    }, 1200);
  }

  function endMiniDuelOutOfQuestions() {
    clearMiniTimer();
    miniDuel.ended = true;
    const tA = Math.round(Math.max(0, miniDuel.times.A) * 10) / 10;
    const tB = Math.round(Math.max(0, miniDuel.times.B) * 10) / 10;
    els.miscFloorOverlay.classList.add("hidden");
    if (tA === tB) {
      startMiscCoinToss(tState.players[match.playerA].name, tState.players[match.playerB].name, (side) => onRoundDecided(side));
    } else {
      onRoundDecided(tA > tB ? "A" : "B");
    }
  }

  els.miscFloorAnswer.addEventListener("click", () => {
    const revealed = els.miscFloorAnswerText.classList.toggle("blurred") === false;
    els.miscFloorAnswer.querySelector(".host-answer-icon").textContent = revealed ? "\u{1F441}️" : "\u{1F648}";
  });

  function setMiniHostButtonsEnabled(enabled) {
    els.miscFloorCorrectBtn.disabled = !enabled;
    els.miscFloorPassBtn.disabled = !enabled;
  }

  function scheduleNextMiniQuestion() {
    clearMiniTimer();
    miniDuel.transitioning = true;
    setMiniHostButtonsEnabled(false);
    els.miscFloorAnswerText.classList.remove("blurred");
    els.miscFloorAnswer.querySelector(".host-answer-icon").textContent = "\u{1F441}️";
    setTimeout(() => {
      if (!miniDuel || miniDuel.ended) return;
      miniDuel.transitioning = false;
      setMiniHostButtonsEnabled(true);
      els.miscFloorSecondsA.classList.remove("passed");
      els.miscFloorSecondsB.classList.remove("passed");
      showMiniQuestion();
      if (miniDuel.ended) return;
      miniDuel.lastTick = performance.now();
      miniTimerHandle = setInterval(tickMiniClock, 100);
    }, IMAGE_CHANGE_DELAY_MS);
  }

  els.miscFloorCorrectBtn.addEventListener("click", () => {
    if (!miniDuel || miniDuel.ended || miniDuel.transitioning) return;
    const scorer = miniDuel.active;
    const scorerIndex = scorer === "A" ? match.playerA : match.playerB;
    els.miscFloorLog.textContent = `${tState.players[scorerIndex].name} got it right!`;
    miniDuel.active = scorer === "A" ? "B" : "A";
    updateMiniLifeUI();
    scheduleNextMiniQuestion();
  });

  els.miscFloorPassBtn.addEventListener("click", () => {
    if (!miniDuel || miniDuel.ended || miniDuel.transitioning) return;
    miniDuel.times[miniDuel.active] = Math.max(0, miniDuel.times[miniDuel.active] - PASS_PENALTY_SECONDS);
    updateMiniLifeUI();
    miniSecondsElFor(miniDuel.active).classList.add("passed");
    const activeIndex = miniDuel.active === "A" ? match.playerA : match.playerB;
    els.miscFloorLog.textContent = `${tState.players[activeIndex].name} passed (-${PASS_PENALTY_SECONDS}s).`;
    if (miniDuel.times[miniDuel.active] <= 0) {
      loseMiniDuel(miniDuel.active);
      return;
    }
    scheduleNextMiniQuestion();
  });

  document.addEventListener("keydown", (e) => {
    if (!miniDuel || els.miscFloorOverlay.classList.contains("hidden")) return;
    const key = e.key.toLowerCase();
    if (key === "c" || key === "arrowright" || key === "enter") {
      e.preventDefault();
      els.miscFloorCorrectBtn.click();
    } else if (key === "p" || key === "arrowleft" || key === " ") {
      e.preventDefault();
      els.miscFloorPassBtn.click();
    }
  });

  // ---------- Duel engine: Bring Me Something ----------

  const BRINGME_GENERATORS = [
    () => `Bring something that is ${BRINGME_COLORS[randInt(0, BRINGME_COLORS.length - 1)]}.`,
    () => {
      const n = randInt(3, 10);
      return `Bring something whose name has exactly ${n} letters.`;
    },
    () => `Bring something made of ${BRINGME_MATERIALS[randInt(0, BRINGME_MATERIALS.length - 1)]}.`,
    () => {
      const kind = ["a letter", "a number", "a picture or image"][randInt(0, 2)];
      return `Bring something with ${kind} on it.`;
    },
    () => `Bring something whose name starts with the letter ${randLetter()}.`,
  ];

  function pickBringMeCriteria() {
    return BRINGME_GENERATORS[randInt(0, BRINGME_GENERATORS.length - 1)]();
  }

  function startBringMeDuel() {
    els.miscBringmeALabel.textContent = tState.players[match.playerA].name;
    els.miscBringmeBLabel.textContent = tState.players[match.playerB].name;
    els.miscBringmeCriteria.textContent = pickBringMeCriteria();
    els.miscBringmeOverlay.classList.remove("hidden");
  }

  els.miscBringmeRerollBtn.addEventListener("click", () => {
    els.miscBringmeCriteria.textContent = pickBringMeCriteria();
  });
  els.miscBringmeABtn.addEventListener("click", () => {
    els.miscBringmeOverlay.classList.add("hidden");
    onRoundDecided("A");
  });
  els.miscBringmeBBtn.addEventListener("click", () => {
    els.miscBringmeOverlay.classList.add("hidden");
    onRoundDecided("B");
  });

  // ---------- Duel engine: Weight / Length target duels ----------
  // Both are the same "measure the item, closest to a random target wins"
  // shape, so they share one overlay and one start function, keyed by kind.

  const TARGET_DUEL_KINDS = {
    weight: {
      title: "Weight Challenge",
      unit: "g",
      min: 0,
      max: 2500,
      hint: "Bring an item as close to this weight as possible. Game Master weighs each item and enters the result below.",
    },
    length: {
      title: "Length Challenge",
      unit: "cm",
      min: 1,
      max: 25,
      decimals: 1,
      hint: "Bring an item as close to this length as possible. Game Master measures each item and enters the result below.",
    },
    cut: {
      title: "Weight Challenge — Perfect Cut",
      unit: "g gap",
      min: 0,
      max: 0,
      hint: "Have each player cut their item into two pieces. Game Master weighs both pieces and enters the gap between them (in grams) below. Closest to a perfect 0g gap wins.",
    },
  };

  let targetDuelTarget = null;
  let targetDuelKind = null;

  function randDecimal(min, max, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round((min + Math.random() * (max - min)) * factor) / factor;
  }

  // On a tie, re-run the same duel (fresh random target) rather than settle
  // it on a coin toss — a repeat gives both players another shot at the skill.
  function resolveClosestOrTie(diffA, diffB, repeatDuel) {
    if (diffA === diffB) {
      repeatDuel();
    } else {
      onRoundDecided(diffA < diffB ? "A" : "B");
    }
  }

  function startTargetDuel(kind) {
    const cfg = TARGET_DUEL_KINDS[kind];
    targetDuelKind = kind;
    const target = cfg.decimals ? randDecimal(cfg.min, cfg.max, cfg.decimals) : randInt(cfg.min, cfg.max);
    targetDuelTarget = target;
    els.miscTargetTitle.textContent = cfg.title;
    els.miscTargetValue.textContent = `${cfg.decimals ? target.toFixed(cfg.decimals) : target} ${cfg.unit}`;
    els.miscTargetHint.textContent = cfg.hint;
    els.miscTargetNameA.textContent = tState.players[match.playerA].name;
    els.miscTargetNameB.textContent = tState.players[match.playerB].name;
    els.miscTargetInputA.value = "";
    els.miscTargetInputB.value = "";
    els.miscTargetOverlay.classList.remove("hidden");
  }

  els.miscTargetSubmitBtn.addEventListener("click", () => {
    const a = parseFloat(els.miscTargetInputA.value);
    const b = parseFloat(els.miscTargetInputB.value);
    if (Number.isNaN(a) || Number.isNaN(b)) return;
    const diffA = Math.abs(a - targetDuelTarget);
    const diffB = Math.abs(b - targetDuelTarget);
    els.miscTargetOverlay.classList.add("hidden");
    resolveClosestOrTie(diffA, diffB, () => startTargetDuel(targetDuelKind));
  });

  // ---------- Duel engine: Weight/Length guess duel ----------
  // Mirrors the target duel's "closest wins" math, but the Game Master
  // supplies the actual value last (after guesses) instead of a random
  // target upfront.

  const GUESS_DUEL_KINDS = {
    weight: {
      title: "Weight Challenge — Guess the Weight",
      hint: "Game Master brings a mystery item. Each player guesses its weight (in grams), then the Game Master weighs it and enters the actual result below.",
      actualLabel: "Actual weight (g)",
    },
    length: {
      title: "Length Challenge — Guess the Length",
      hint: "Game Master brings a mystery item. Each player guesses its length (in cm), then the Game Master measures it and enters the actual result below.",
      actualLabel: "Actual length (cm)",
    },
  };

  let guessDuelKind = null;

  function startGuessDuel(kind) {
    const cfg = GUESS_DUEL_KINDS[kind];
    guessDuelKind = kind;
    els.miscGuessTitle.textContent = cfg.title;
    els.miscGuessHint.textContent = cfg.hint;
    els.miscGuessActualLabel.textContent = cfg.actualLabel;
    els.miscGuessNameA.textContent = tState.players[match.playerA].name;
    els.miscGuessNameB.textContent = tState.players[match.playerB].name;
    els.miscGuessInputA.value = "";
    els.miscGuessInputB.value = "";
    els.miscGuessActualInput.value = "";
    els.miscGuessOverlay.classList.remove("hidden");
  }

  els.miscGuessSubmitBtn.addEventListener("click", () => {
    const a = parseFloat(els.miscGuessInputA.value);
    const b = parseFloat(els.miscGuessInputB.value);
    const actual = parseFloat(els.miscGuessActualInput.value);
    if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(actual)) return;
    const diffA = Math.abs(a - actual);
    const diffB = Math.abs(b - actual);
    els.miscGuessOverlay.classList.add("hidden");
    resolveClosestOrTie(diffA, diffB, () => startGuessDuel(guessDuelKind));
  });

  // ---------- Duel engine: Time target duel (in-app stopwatch) ----------
  // Each player takes a turn: Space starts the stopwatch, Space again stops
  // it and locks in their time. Once both have gone, whoever landed closest
  // to the random target wins (same over/under-is-fine rule as Weight).

  let stopwatch = null;
  let stopwatchTickHandle = null;

  function currentStopwatchSide() {
    return stopwatch.order[stopwatch.turnIdx];
  }

  function stopwatchPlayerName(side) {
    return tState.players[side === "A" ? match.playerA : match.playerB].name;
  }

  function renderStopwatchResults(showDiff) {
    els.miscStopwatchResults.innerHTML = "";
    ["A", "B"].forEach((side) => {
      if (stopwatch.recorded[side] === null) return;
      const row = document.createElement("div");
      row.className = "misc-match-status";
      const diff = Math.abs(stopwatch.recorded[side] - stopwatch.target);
      row.textContent = showDiff
        ? `${stopwatchPlayerName(side)}: ${stopwatch.recorded[side].toFixed(2)}s (off by ${diff.toFixed(2)}s)`
        : `${stopwatchPlayerName(side)}: ${stopwatch.recorded[side].toFixed(2)}s`;
      els.miscStopwatchResults.appendChild(row);
    });
  }

  function updateStopwatchTurnUI() {
    const side = currentStopwatchSide();
    els.miscStopwatchTurnName.textContent = `${stopwatchPlayerName(side)}'s turn — press Space to start`;
    els.miscStopwatchDisplay.textContent = "0.00";
    renderStopwatchResults();
  }

  function startTimeDuel() {
    const target = Math.round((0.1 + Math.random() * 9.9) * 100) / 100;
    stopwatch = {
      target,
      order: ["A", "B"],
      turnIdx: 0,
      running: false,
      recapping: false,
      startPerf: null,
      recorded: { A: null, B: null },
    };
    els.miscStopwatchTarget.textContent = `${target.toFixed(2)} s`;
    els.miscStopwatchContinueBtn.classList.add("hidden");
    updateStopwatchTurnUI();
    els.miscStopwatchOverlay.classList.remove("hidden");
  }

  // Both players have gone — recap both times (and how far off target each
  // was) before the round actually resolves, so the table can see the numbers
  // side by side rather than the overlay just vanishing into the result.
  function showStopwatchRecap() {
    stopwatch.recapping = true;
    els.miscStopwatchTurnName.textContent = "Both times are in!";
    els.miscStopwatchDisplay.textContent = `${stopwatch.target.toFixed(2)}`;
    renderStopwatchResults(true);
    els.miscStopwatchContinueBtn.classList.remove("hidden");
  }

  els.miscStopwatchContinueBtn.addEventListener("click", () => {
    els.miscStopwatchContinueBtn.classList.add("hidden");
    finishStopwatchDuel();
  });

  function tickStopwatchDisplay() {
    const elapsed = (performance.now() - stopwatch.startPerf) / 1000;
    els.miscStopwatchDisplay.textContent = elapsed.toFixed(2);
  }

  function clearStopwatchTick() {
    if (stopwatchTickHandle) clearInterval(stopwatchTickHandle);
    stopwatchTickHandle = null;
  }

  function finishStopwatchDuel() {
    els.miscStopwatchOverlay.classList.add("hidden");
    const diffA = Math.abs(stopwatch.recorded.A - stopwatch.target);
    const diffB = Math.abs(stopwatch.recorded.B - stopwatch.target);
    stopwatch = null;
    resolveClosestOrTie(diffA, diffB, startTimeDuel);
  }

  function handleStopwatchSpace() {
    if (!stopwatch || stopwatch.recapping) return;
    if (!stopwatch.running) {
      stopwatch.running = true;
      stopwatch.startPerf = performance.now();
      clearStopwatchTick();
      stopwatchTickHandle = setInterval(tickStopwatchDisplay, 30);
      els.miscStopwatchTurnName.textContent = `${stopwatchPlayerName(currentStopwatchSide())}'s turn — press Space to stop`;
      return;
    }

    clearStopwatchTick();
    stopwatch.running = false;
    const elapsed = (performance.now() - stopwatch.startPerf) / 1000;
    stopwatch.recorded[currentStopwatchSide()] = elapsed;
    els.miscStopwatchDisplay.textContent = elapsed.toFixed(2);
    renderStopwatchResults();

    if (stopwatch.turnIdx === 0) {
      stopwatch.turnIdx = 1;
      setTimeout(() => {
        if (stopwatch) updateStopwatchTurnUI();
      }, 900);
    } else {
      setTimeout(() => {
        if (stopwatch) showStopwatchRecap();
      }, 900);
    }
  }

  document.addEventListener("keydown", (e) => {
    if (!stopwatch || els.miscStopwatchOverlay.classList.contains("hidden")) return;
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      handleStopwatchSpace();
    }
  });

  // ---------- Duel engine: Guess the Time ----------
  // The Game Master privately captures a mystery duration with a single
  // start/stop of the stopwatch, then both players guess it — closest wins.

  let guessTimeCapture = null;
  let guessTimeTickHandle = null;

  function startGuessTimeDuel() {
    guessTimeCapture = { running: false, startPerf: null, actual: null };
    els.miscGuesstimeDisplay.textContent = "0.00";
    els.miscGuesstimeStageActual.classList.remove("hidden");
    els.miscGuesstimeStageGuess.classList.add("hidden");
    els.miscGuesstimeNameA.textContent = tState.players[match.playerA].name;
    els.miscGuesstimeNameB.textContent = tState.players[match.playerB].name;
    els.miscGuesstimeInputA.value = "";
    els.miscGuesstimeInputB.value = "";
    els.miscGuesstimeOverlay.classList.remove("hidden");
  }

  function tickGuessTimeDisplay() {
    const elapsed = (performance.now() - guessTimeCapture.startPerf) / 1000;
    els.miscGuesstimeDisplay.textContent = elapsed.toFixed(2);
  }

  function handleGuessTimeSpace() {
    if (!guessTimeCapture || guessTimeCapture.actual !== null) return;
    if (!guessTimeCapture.running) {
      guessTimeCapture.running = true;
      guessTimeCapture.startPerf = performance.now();
      guessTimeTickHandle = setInterval(tickGuessTimeDisplay, 30);
      return;
    }
    clearInterval(guessTimeTickHandle);
    guessTimeTickHandle = null;
    guessTimeCapture.running = false;
    guessTimeCapture.actual = (performance.now() - guessTimeCapture.startPerf) / 1000;
    els.miscGuesstimeDisplay.textContent = guessTimeCapture.actual.toFixed(2);
    els.miscGuesstimeActualText.textContent = `Actual time: ${guessTimeCapture.actual.toFixed(2)} s`;
    els.miscGuesstimeActualText.classList.add("blurred");
    els.miscGuesstimeActual.querySelector(".host-answer-icon").textContent = "\u{1F648}";
    els.miscGuesstimeStageActual.classList.add("hidden");
    els.miscGuesstimeStageGuess.classList.remove("hidden");
  }

  document.addEventListener("keydown", (e) => {
    if (!guessTimeCapture || els.miscGuesstimeOverlay.classList.contains("hidden")) return;
    if (guessTimeCapture.actual !== null) return;
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      handleGuessTimeSpace();
    }
  });

  els.miscGuesstimeActual.addEventListener("click", () => {
    const revealed = els.miscGuesstimeActualText.classList.toggle("blurred") === false;
    els.miscGuesstimeActual.querySelector(".host-answer-icon").textContent = revealed ? "\u{1F441}️" : "\u{1F648}";
  });

  els.miscGuesstimeSubmitBtn.addEventListener("click", () => {
    const a = parseFloat(els.miscGuesstimeInputA.value);
    const b = parseFloat(els.miscGuesstimeInputB.value);
    if (Number.isNaN(a) || Number.isNaN(b) || guessTimeCapture.actual === null) return;
    const actual = guessTimeCapture.actual;
    const diffA = Math.abs(a - actual);
    const diffB = Math.abs(b - actual);
    els.miscGuesstimeOverlay.classList.add("hidden");
    resolveClosestOrTie(diffA, diffB, startGuessTimeDuel);
  });

  // ---------- Duel engine: Time Attack ----------
  // A chess clock with no categories or questions: only the active player's
  // clock runs, Space (or the on-screen button) passes control to the other
  // player, and whoever's clock hits zero first loses. The overlay opens
  // paused so everyone can read the title — the clock only starts once the
  // Game Master clicks Start.

  const ATTACK_LIFE_SECONDS = 30;

  let attackDuel = null;
  let attackTimerHandle = null;

  function attackSecondsElFor(side) {
    return side === "A" ? els.miscAttackSecondsA : els.miscAttackSecondsB;
  }
  function attackLifeElFor(side) {
    return side === "A" ? els.miscAttackLifeA : els.miscAttackLifeB;
  }
  function attackFillElFor(side) {
    return side === "A" ? els.miscAttackFillA : els.miscAttackFillB;
  }

  function updateAttackUI() {
    ["A", "B"].forEach((side) => {
      const pct = Math.max(0, (attackDuel.times[side] / ATTACK_LIFE_SECONDS) * 100);
      attackFillElFor(side).style.width = `${pct}%`;
      attackSecondsElFor(side).textContent = Math.max(0, attackDuel.times[side]).toFixed(1);
      attackLifeElFor(side).classList.toggle("active", attackDuel.started && attackDuel.active === side);
    });
  }

  function clearAttackTimer() {
    if (attackTimerHandle) clearInterval(attackTimerHandle);
    attackTimerHandle = null;
  }

  function startTimeAttackDuel() {
    attackDuel = { times: { A: ATTACK_LIFE_SECONDS, B: ATTACK_LIFE_SECONDS }, active: "A", lastTick: null, started: false, ended: false };
    els.miscAttackNameA.textContent = tState.players[match.playerA].name;
    els.miscAttackNameB.textContent = tState.players[match.playerB].name;
    els.miscAttackLog.textContent = `${tState.players[match.playerA].name} goes first. Press Start when both players are ready.`;
    els.miscAttackStartBtn.classList.remove("hidden");
    els.miscAttackPassBtn.classList.add("hidden");
    clearAttackTimer();
    els.miscAttackOverlay.classList.remove("hidden");
    updateAttackUI();
  }

  function beginAttackClock() {
    if (!attackDuel || attackDuel.started || attackDuel.ended) return;
    attackDuel.started = true;
    els.miscAttackLog.textContent = "";
    els.miscAttackStartBtn.classList.add("hidden");
    els.miscAttackPassBtn.classList.remove("hidden");
    updateAttackUI();
    attackDuel.lastTick = performance.now();
    clearAttackTimer();
    attackTimerHandle = setInterval(tickAttackClock, 100);
  }

  els.miscAttackStartBtn.addEventListener("click", beginAttackClock);

  function tickAttackClock() {
    if (!attackDuel) return;
    const now = performance.now();
    const delta = (now - attackDuel.lastTick) / 1000;
    attackDuel.lastTick = now;
    attackDuel.times[attackDuel.active] -= delta;

    if (attackDuel.times[attackDuel.active] <= 0) {
      attackDuel.times[attackDuel.active] = 0;
      updateAttackUI();
      loseAttackDuel(attackDuel.active);
      return;
    }
    updateAttackUI();
  }

  function loseAttackDuel(loserSide) {
    clearAttackTimer();
    attackDuel.ended = true;
    const winnerSide = loserSide === "A" ? "B" : "A";
    const loserIndex = loserSide === "A" ? match.playerA : match.playerB;
    els.miscAttackLog.textContent = `${tState.players[loserIndex].name}'s clock ran out!`;
    setTimeout(() => {
      els.miscAttackOverlay.classList.add("hidden");
      onRoundDecided(winnerSide);
    }, 1200);
  }

  function passAttackTurn() {
    if (!attackDuel || !attackDuel.started || attackDuel.ended) return;
    const fromIndex = attackDuel.active === "A" ? match.playerA : match.playerB;
    attackDuel.active = attackDuel.active === "A" ? "B" : "A";
    els.miscAttackLog.textContent = `${tState.players[fromIndex].name} passed the turn.`;
    updateAttackUI();
  }

  els.miscAttackPassBtn.addEventListener("click", passAttackTurn);

  document.addEventListener("keydown", (e) => {
    if (!attackDuel || !attackDuel.started || attackDuel.ended || els.miscAttackOverlay.classList.contains("hidden")) return;
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      passAttackTurn();
    }
  });

  // ---------- Duel engine: Over/Under ----------
  // Player A calls a target time, Player B attempts it on the stopwatch,
  // then Player A guesses whether B landed over or under — right guess wins.
  // Times are compared to 2 decimals only (what the screen shows), and if B
  // hits the target exactly at that precision, B wins outright — there's no
  // over/under to guess.

  // The attempt shows no running numbers — only "Ready" / "Timing…" — so the
  // caller can't read the result off the screen before making their call.
  let overUnderState = null;

  function startOverUnderDuel() {
    overUnderState = { target: null, running: false, startPerf: null, actual: null };
    const callerName = tState.players[match.playerA].name;
    const achieverName = tState.players[match.playerB].name;
    els.miscOverunderCallerName.textContent = callerName;
    els.miscOverunderCallerName2.textContent = callerName;
    els.miscOverunderAchieverName.textContent = achieverName;
    els.miscOverunderTargetInput.value = "";
    els.miscOverunderDisplay.textContent = "Ready";
    els.miscOverunderStageTarget.classList.remove("hidden");
    els.miscOverunderStageAttempt.classList.add("hidden");
    els.miscOverunderStageGuess.classList.add("hidden");
    els.miscOverunderOverlay.classList.remove("hidden");
  }

  els.miscOverunderTargetSubmitBtn.addEventListener("click", () => {
    const t = parseFloat(els.miscOverunderTargetInput.value);
    if (Number.isNaN(t)) return;
    overUnderState.target = toHundredths(t);
    els.miscOverunderStageTarget.classList.add("hidden");
    els.miscOverunderStageAttempt.classList.remove("hidden");
  });

  // Rounds seconds to a whole number of hundredths, so comparisons happen at
  // exactly the precision shown on screen (and without float noise).
  function toHundredths(seconds) {
    return Math.round(seconds * 100);
  }

  function formatHundredths(h) {
    return (h / 100).toFixed(2);
  }

  function handleOverUnderSpace() {
    if (!overUnderState || overUnderState.actual !== null) return;
    if (!overUnderState.running) {
      overUnderState.running = true;
      overUnderState.startPerf = performance.now();
      els.miscOverunderDisplay.textContent = "Timing…";
      return;
    }
    overUnderState.running = false;
    overUnderState.actual = toHundredths((performance.now() - overUnderState.startPerf) / 1000);
    els.miscOverunderDisplay.textContent = "Stopped";
    els.miscOverunderGuessSummary.textContent = `Actual: ${formatHundredths(overUnderState.actual)}s — target was ${formatHundredths(overUnderState.target)}s`;
    els.miscOverunderStageAttempt.classList.add("hidden");
    els.miscOverunderStageGuess.classList.remove("hidden");

    if (overUnderState.actual === overUnderState.target) {
      showOverUnderPerfectHit();
      return;
    }
    els.miscOverunderGuessHint.textContent = "Actual time locked in — it stays hidden until the guess is made.";
    els.miscOverunderGuessControls.classList.remove("hidden");
    els.miscOverunderGuessSummary.classList.add("blurred");
    els.miscOverunderSummary.querySelector(".host-answer-icon").textContent = "\u{1F648}";
    els.miscOverunderOverBtn.disabled = false;
    els.miscOverunderUnderBtn.disabled = false;
  }

  // B landed exactly on the target — no over/under call is possible, so the
  // result is shown openly and B (the hitter) takes the round.
  function showOverUnderPerfectHit() {
    const hitterName = tState.players[match.playerB].name;
    els.miscOverunderGuessHint.textContent = `\u{1F3AF} Perfect hit! ${hitterName} landed exactly on the target and wins outright.`;
    els.miscOverunderGuessControls.classList.add("hidden");
    els.miscOverunderGuessSummary.classList.remove("blurred");
    els.miscOverunderSummary.querySelector(".host-answer-icon").textContent = "\u{1F3AF}";
    const state = overUnderState;
    setTimeout(() => {
      if (overUnderState !== state) return; // overlay was torn down in the meantime
      els.miscOverunderOverlay.classList.add("hidden");
      onRoundDecided("B");
    }, OVERUNDER_REVEAL_MS);
  }

  document.addEventListener("keydown", (e) => {
    if (!overUnderState || els.miscOverunderOverlay.classList.contains("hidden")) return;
    if (els.miscOverunderStageAttempt.classList.contains("hidden")) return;
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      handleOverUnderSpace();
    }
  });

  const OVERUNDER_REVEAL_MS = 2000;

  // The actual time stays blurred while the caller decides; once they call it,
  // it unblurs alongside the verdict for a moment before the round resolves.
  function resolveOverUnder(callerGuess) {
    if (!overUnderState || overUnderState.actual === null || els.miscOverunderOverBtn.disabled) return;
    els.miscOverunderOverBtn.disabled = true;
    els.miscOverunderUnderBtn.disabled = true;
    // Exact hits never reach here (showOverUnderPerfectHit handles them), so
    // the time is strictly over or under the target.
    const isOver = overUnderState.actual > overUnderState.target;
    const callerCorrect = (callerGuess === "over") === isOver;
    els.miscOverunderGuessSummary.textContent += ` · ${callerGuess.toUpperCase()} — ${callerCorrect ? "correct!" : "wrong!"}`;
    els.miscOverunderGuessSummary.classList.remove("blurred");
    els.miscOverunderSummary.querySelector(".host-answer-icon").textContent = "\u{1F441}️";
    const state = overUnderState;
    setTimeout(() => {
      if (overUnderState !== state) return; // overlay was torn down in the meantime
      els.miscOverunderOverlay.classList.add("hidden");
      onRoundDecided(callerCorrect ? "A" : "B");
    }, OVERUNDER_REVEAL_MS);
  }

  els.miscOverunderOverBtn.addEventListener("click", () => resolveOverUnder("over"));
  els.miscOverunderUnderBtn.addEventListener("click", () => resolveOverUnder("under"));

  // ---------- Resume a saved tournament on load, if any ----------
  // app.js's own resumeSavedGame runs first (script order in index.html) and
  // hides the main menu if The Floor has a save — in that case we defer to it
  // rather than showing both games' screens at once.
  (function resumeSavedMiscGame() {
    if (els.mainMenuScreen.classList.contains("hidden")) return;
    const saved = loadMiscSavedGame();
    if (!saved) return;

    tState = saved.tState;
    match = null;
    // Defensively clear any mid-flight tie-break flag from a reload that
    // happened during the live draw animation — checkTournamentProgress will
    // simply redo the draw (no data loss, just replays the reveal).
    tState.groupsFinalizing = false;
    tState.standingsFinalizing = false;

    els.mainMenuScreen.classList.add("hidden");
    if (saved.screenPhase === "gameover") {
      showMiscGameOver();
    } else {
      els.miscBracketScreen.classList.remove("hidden");
      checkTournamentProgress();
    }
  })();
})();
