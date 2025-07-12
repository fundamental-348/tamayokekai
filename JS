document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const playerBall = document.getElementById('player-ball');
    const enemyBall = document.getElementById('enemy-ball');
    const gameOverScreen = document.getElementById('game-over-screen');
    const restartButton = document.getElementById('restart-button');

    let gameActive = true;

    // プレイヤーボールの初期位置と移動状態
    let playerX = 0;
    let playerY = 0;
    let isDragging = false;

    // 敵ボールの初期位置、速度、方向
    let enemyX = 0;
    let enemyY = 0;
    let enemySpeedX = 0;
    let enemySpeedY = 0;

    // ゲームエリアのサイズ
    let gameContainerWidth = 0;
    let gameContainerHeight = 0;

    // ボールのサイズ
    const playerBallSize = 40;
    const enemyBallSize = 80;

    // ゲームの初期化
    function initGame() {
        gameActive = true;
        gameOverScreen.classList.add('hidden');

        gameContainerWidth = gameContainer.clientWidth;
        gameContainerHeight = gameContainer.clientHeight;

        // プレイヤーボールを中央下部に配置
        playerX = (gameContainerWidth - playerBallSize) / 2;
        playerY = gameContainerHeight - playerBallSize - 20;
        playerBall.style.left = `${playerX}px`;
        playerBall.style.top = `${playerY}px`;

        // 敵ボールをランダムな位置に配置し、ランダムな速度を設定
        enemyX = Math.random() * (gameContainerWidth - enemyBallSize);
        enemyY = Math.random() * (gameContainerHeight / 2 - enemyBallSize); // 上半分に初期配置
        enemySpeedX = (Math.random() - 0.5) * 6; // -3 から 3 の範囲
        enemySpeedY = (Math.random() - 0.5) * 6; // -3 から 3 の範囲
        // 速度が小さすぎる場合は調整
        if (Math.abs(enemySpeedX) < 1) enemySpeedX = enemySpeedX > 0 ? 1 : -1;
        if (Math.abs(enemySpeedY) < 1) enemySpeedY = enemySpeedY > 0 ? 1 : -1;

        enemyBall.style.left = `${enemyX}px`;
        enemyBall.style.top = `${enemyY}px`;

        gameLoop();
    }

    // ゲームループ
    function gameLoop() {
        if (!gameActive) return;

        updateEnemyBallPosition();
        checkCollision();

        requestAnimationFrame(gameLoop);
    }

    // 敵ボールの位置を更新
    function updateEnemyBallPosition() {
        enemyX += enemySpeedX;
        enemyY += enemySpeedY;

        // 壁との衝突判定と跳ね返り
        if (enemyX <= 0 || enemyX + enemyBallSize >= gameContainerWidth) {
            enemySpeedX *= -1;
            // 画面外に出ないように微調整
            enemyX = Math.max(0, Math.min(enemyX, gameContainerWidth - enemyBallSize));
        }
        if (enemyY <= 0 || enemyY + enemyBallSize >= gameContainerHeight) {
            enemySpeedY *= -1;
            // 画面外に出ないように微調整
            enemyY = Math.max(0, Math.min(enemyY, gameContainerHeight - enemyBallSize));
        }

        enemyBall.style.left = `${enemyX}px`;
        enemyBall.style.top = `${enemyY}px`;
    }

    // 衝突判定
    function checkCollision() {
        const distanceX = (playerX + playerBallSize / 2) - (enemyX + enemyBallSize / 2);
        const distanceY = (playerY + playerBallSize / 2) - (enemyY + enemyBallSize / 2);
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // ボール同士が接触しているか（半径の合計より距離が小さいか）
        if (distance < (playerBallSize / 2 + enemyBallSize / 2) - 5) { // 5pxは許容誤差
            gameOver();
        }
    }

    // ゲームオーバー処理
    function gameOver() {
        gameActive = false;
        gameOverScreen.classList.remove('hidden');
    }

    // プレイヤーボールのドラッグ操作
    let startX, startY, initialPlayerX, initialPlayerY;

    function getEventCoords(e) {
        if (e.touches && e.touches[0]) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function handleDragStart(e) {
        if (!gameActive) return;
        e.preventDefault(); // デフォルトのスクロールなどを防止
        isDragging = true;
        const coords = getEventCoords(e);
        startX = coords.x;
        startY = coords.y;
        initialPlayerX = playerX;
        initialPlayerY = playerY;
        playerBall.style.cursor = 'grabbing';
    }

    function handleDragMove(e) {
        if (!isDragging || !gameActive) return;
        e.preventDefault();
        const coords = getEventCoords(e);
        const dx = coords.x - startX;
        const dy = coords.y - startY;

        let newPlayerX = initialPlayerX + dx;
        let newPlayerY = initialPlayerY + dy;

        // ゲームコンテナ内での移動制限
        newPlayerX = Math.max(0, Math.min(newPlayerX, gameContainerWidth - playerBallSize));
        newPlayerY = Math.max(0, Math.min(newPlayerY, gameContainerHeight - playerBallSize));

        playerX = newPlayerX;
        playerY = newPlayerY;

        playerBall.style.left = `${playerX}px`;
        playerBall.style.top = `${playerY}px`;
    }

    function handleDragEnd() {
        isDragging = false;
        playerBall.style.cursor = 'grab';
    }

    // イベントリスナーの登録
    playerBall.addEventListener('mousedown', handleDragStart);
    gameContainer.addEventListener('mousemove', handleDragMove);
    gameContainer.addEventListener('mouseup', handleDragEnd);

    playerBall.addEventListener('touchstart', handleDragStart);
    gameContainer.addEventListener('touchmove', handleDragMove);
    gameContainer.addEventListener('touchend', handleDragEnd);

    restartButton.addEventListener('click', initGame);

    // ウィンドウのリサイズ時にゲームエリアのサイズを再取得
    window.addEventListener('resize', () => {
        if (gameActive) { // ゲーム中にリサイズされた場合は位置を調整
            const oldWidth = gameContainerWidth;
            const oldHeight = gameContainerHeight;
            gameContainerWidth = gameContainer.clientWidth;
            gameContainerHeight = gameContainer.clientHeight;

            // 比率に応じてプレイヤーと敵の位置を調整
            playerX = (playerX / oldWidth) * gameContainerWidth;
            playerY = (playerY / oldHeight) * gameContainerHeight;
            enemyX = (enemyX / oldWidth) * gameContainerWidth;
            enemyY = (enemyY / oldHeight) * gameContainerHeight;

            playerBall.style.left = `${playerX}px`;
            playerBall.style.top = `${playerY}px`;
            enemyBall.style.left = `${enemyX}px`;
            enemyBall.style.top = `${enemyY}px`;

        } else { // ゲームオーバー画面でリサイズされた場合は初期化
            gameContainerWidth = gameContainer.clientWidth;
            gameContainerHeight = gameContainer.clientHeight;
        }
    });

    initGame(); // ゲーム開始
});
