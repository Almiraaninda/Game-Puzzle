document.addEventListener("DOMContentLoaded", () => {
    const sizeSelect = document.getElementById("sizeSelect");
    const imgUpload = document.getElementById("imgUpload");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const resetBtn = document.getElementById("resetBtn");
    const showSolBtn = document.getElementById("showSolBtn");
    const boardContainer = document.getElementById("boardContainer");
    const movesEl = document.getElementById("moves");
    const timeEl = document.getElementById("time");
    const message = document.getElementById("message");

    let N = parseInt(sizeSelect.value, 10); // board size
    let board = []; // array of numbers: 1..N*N-1 and 0 for empty
    let emptyIndex = -1;
    let moves = 0;
    let timer = null;
    let seconds = 0;
    let imageUrl = ""; // if user uploaded image
    let useImage = false;

    function formatTime(s) {
        const mm = String(Math.floor(s / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        return `${mm}:${ss}`;
    }

    function startTimer() {
        stopTimer();
        seconds = 0;
        timeEl.textContent = formatTime(seconds);
        timer = setInterval(() => {
            seconds++;
            timeEl.textContent = formatTime(seconds);
        }, 1000);
    }

    function stopTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function initBoard(n) {
        N = n;
        const total = N * N;
        board = [];
        for (let i = 1; i < total; i++) board.push(i);
        board.push(0); // 0 is the empty tile
        emptyIndex = board.indexOf(0);
        moves = 0;
        movesEl.textContent = moves;
        timeEl.textContent = "00:00";
        message.textContent = "";
        useImage = false; // reset image usage on new board init
        renderBoard();
    }

    function renderBoard() {
        boardContainer.innerHTML = "";
        const boardEl = document.createElement("div");
        boardEl.className = "board";
        boardEl.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        // Set width and height properly
        const sizePx = Math.min(520, N * 120);
        boardEl.style.width = `${sizePx}px`;
        boardEl.style.height = `${sizePx}px`;

        board.forEach((val, idx) => {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.dataset.index = idx;
            tile.dataset.val = val;
            tile.style.fontSize = `min(14px, ${28 - N * 2}px)`;

            if (val === 0) {
                tile.classList.add("empty");
                tile.textContent = "";
            } else {
                if (useImage && imageUrl) {
                    tile.dataset.bg = "1";
                    tile.style.backgroundImage = `url('${imageUrl}')`;

                    const bgPos = calcBgPos(val - 1);
                    tile.style.backgroundPosition = `${bgPos.x}% ${bgPos.y}%`;
                    tile.style.backgroundSize = `${N * 100}% ${N * 100}%`;
                    tile.textContent = "";
                } else {
                    tile.textContent = val;
                    tile.style.backgroundImage = "";
                }
            }

            tile.addEventListener("click", () => onTileClick(tile));
            boardEl.appendChild(tile);
        });

        boardContainer.appendChild(boardEl);
    }

    function calcBgPos(idx) {
        const row = Math.floor(idx / N);
        const col = idx % N;
        return {
            x: (col / (N - 1)) * 100,
            y: (row / (N - 1)) * 100
        };
    }

    function onTileClick(tile) {
        const idx = parseInt(tile.dataset.index, 10);

        if (canMove(idx)) {
            moveTile(idx);
            renderBoard();

            moves++;
            movesEl.textContent = moves;

            if (!timer) startTimer();

            if (isSolved()) {
                stopTimer();
                message.textContent = `🎉 Selamat! Puzzle terselesaikan dalam ${moves} langkah, waktu ${formatTime(seconds)}!`;
            }
        }
    }

    function canMove(idx) {
        const c1 = idx % N;
        const r1 = Math.floor(idx / N);

        const c2 = emptyIndex % N;
        const r2 = Math.floor(emptyIndex / N);

        return (c1 === c2 && Math.abs(r1 - r2) === 1) ||
               (r1 === r2 && Math.abs(c1 - c2) === 1);
    }

    function moveTile(idx) {
        [board[idx], board[emptyIndex]] = [board[emptyIndex], board[idx]];
        emptyIndex = idx;
    }

    function isSolvable(arr, N) {
        const list = arr.filter(x => x !== 0);
        let Inv = 0;

        for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
                if (list[i] > list[j]) Inv++;
            }
        }

        if (N % 2 === 0) {
            const blankRowFromBottom = N - Math.floor(arr.indexOf(0) / N);
            return (Inv % 2 === 0 && blankRowFromBottom % 2 === 1) ||
                   (Inv % 2 === 1 && blankRowFromBottom % 2 === 0);
        } else {
            return Inv % 2 === 0;
        }
    }

    function shuffleBoard() {
        const total = N * N;
        let arr;
        do {
            arr = [];
            for (let i = 1; i < total; i++) arr.push(i);
            arr.push(0);
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        } while (!isSolvable(arr, N) || isArraySolved(arr));

        board = arr.slice();
        emptyIndex = board.indexOf(0);
        moves = 0;
        movesEl.textContent = moves;
        seconds = 0;
        timeEl.textContent = "00:00";
        stopTimer();
        renderBoard();
    }

    function isSolved() {
        for (let i = 0; i < board.length - 1; i++) {
            if (board[i] !== i + 1) return false;
        }
        return board[board.length - 1] === 0;
    }

    function isArraySolved(arr) {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] !== i + 1) return false;
        }
        return arr[arr.length - 1] === 0;
    }

    // Event Listeners
    sizeSelect.addEventListener("change", (e) => {
        initBoard(parseInt(e.target.value, 10));
    });

    shuffleBtn.addEventListener("click", () => {
        if (imageUrl) useImage = true;
        else useImage = false;
        shuffleBoard();
    });

    resetBtn.addEventListener("click", () => {
        initBoard(N);
    });

    showSolBtn.addEventListener("click", () => {
        const original = board.slice();
        board = [];
        for (let i = 1; i < N * N; i++) board.push(i);
        board.push(0);
        renderBoard();
        setTimeout(() => {
            board = original;
            renderBoard();
        }, 1200);
    });

    imgUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(ev) {
            imageUrl = ev.target.result;
            useImage = true;
            renderBoard();
        };
        reader.readAsDataURL(file);
    });

    // Initialize board on load
    initBoard(N);
});
