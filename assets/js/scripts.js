/* ==========================================================================
   HIDDEN FEATURES — SHARED SCRIPT
   Subtle motion (fade-in on scroll) + small interactive gizmos + Snake game.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- MOBILE NAV TOGGLE ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  /* ---------- FADE-IN ON SCROLL ---------- */
  var fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && fadeEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- SECRET BUTTON (5 clicks) ---------- */
  var secretBtn = document.getElementById('secret-button');
  var secretMsg = document.getElementById('secret-message');
  if (secretBtn && secretMsg) {
    secretBtn.addEventListener('click', function () {
      var count = parseInt(secretBtn.getAttribute('data-count'), 10) + 1;
      secretBtn.setAttribute('data-count', count);
      secretBtn.textContent = 'Click me (' + Math.min(count, 5) + '/5)';
      if (count >= 5) {
        secretMsg.hidden = false;
        secretBtn.textContent = 'Found it!';
        secretBtn.disabled = true;
      }
    });
  }

  /* ---------- REVEAL TOGGLE SWITCH ---------- */
  var revealToggle = document.getElementById('reveal-toggle');
  var demoPanel = document.getElementById('demo-panel');
  if (revealToggle && demoPanel) {
    revealToggle.addEventListener('change', function () {
      demoPanel.classList.toggle('open', revealToggle.checked);
    });
  }

  /* ---------- ACCORDIONS (works for any .accordion on the page) ---------- */
  document.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var item = trigger.closest('.accordion-item');
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (item) item.classList.toggle('open', !expanded);
    });
  });

  /* ---------- KONAMI CODE EASTER EGG ---------- */
  var konamiBanner = document.getElementById('konami-banner');
  if (konamiBanner) {
    var sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
    var progress = 0;
    document.addEventListener('keydown', function (e) {
      if (e.key === sequence[progress]) {
        progress++;
        if (progress === sequence.length) {
          konamiBanner.hidden = false;
          progress = 0;
        }
      } else {
        progress = (e.key === sequence[0]) ? 1 : 0;
      }
    });
  }

  /* ---------- COOL GUY: HIGH FIVE COUNTER ---------- */
  var highFiveBtn = document.getElementById('high-five-btn');
  var highFiveTotal = document.getElementById('high-five-total');
  var mascot = document.getElementById('mascot');
  if (highFiveBtn && highFiveTotal) {
    var stored = parseInt(localStorage.getItem('hf-high-fives') || '0', 10);
    highFiveTotal.textContent = stored;
    highFiveBtn.addEventListener('click', function () {
      stored++;
      highFiveTotal.textContent = stored;
      localStorage.setItem('hf-high-fives', String(stored));
      if (mascot) {
        mascot.classList.add('shades-on');
        setTimeout(function () { mascot.classList.remove('shades-on'); }, 900);
      }
    });
  }

  /* ---------- ARCADE: LOCKED CABINET PEEKS ---------- */
  function wireUnlock(buttonId, revealId, overlayId) {
    var btn = document.getElementById(buttonId);
    var reveal = document.getElementById(revealId);
    var overlay = document.getElementById(overlayId);
    if (!btn || !reveal) return;
    btn.addEventListener('click', function () {
      var showing = !reveal.hidden;
      reveal.hidden = showing;
      btn.setAttribute('aria-expanded', showing ? 'false' : 'true');
      btn.textContent = showing ? 'Insert coin (peek)' : 'Close the vault';
      if (overlay) overlay.querySelector('p') && (overlay.querySelector('p').style.display = showing ? '' : 'none');
    });
  }
  wireUnlock('unlock-pong', 'pong-reveal', 'pong-overlay');
  wireUnlock('unlock-parcheesi', 'parcheesi-reveal', 'parcheesi-overlay');

  /* ---------- SNAKE GAME ---------- */
  var canvas = document.getElementById('snake-canvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var gridSize = 20;
    var tileCount = canvas.width / gridSize;

    var snake, velocity, nextVelocity, food, score, highScore, running, loopId;

    var scoreEl = document.getElementById('snake-score');
    var highScoreEl = document.getElementById('snake-highscore');
    var overlay = document.getElementById('snake-overlay');
    var overlayText = document.getElementById('snake-overlay-text');
    var startBtn = document.getElementById('snake-start-btn');

    highScore = parseInt(localStorage.getItem('hf-snake-highscore') || '0', 10);
    if (highScoreEl) highScoreEl.textContent = highScore;

    function resetGame() {
      snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
      velocity = { x: 1, y: 0 };
      nextVelocity = { x: 1, y: 0 };
      score = 0;
      placeFood();
      if (scoreEl) scoreEl.textContent = score;
    }

    function placeFood() {
      var valid = false;
      while (!valid) {
        food = {
          x: Math.floor(Math.random() * tileCount),
          y: Math.floor(Math.random() * tileCount)
        };
        valid = !snake.some(function (seg) { return seg.x === food.x && seg.y === food.y; });
      }
    }

    function draw() {
      ctx.fillStyle = '#020408';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);

      snake.forEach(function (seg, i) {
        ctx.fillStyle = i === 0 ? '#22d3ee' : '#7c6cff';
        ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);
      });
    }

    function step() {
      velocity = nextVelocity;
      var head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

      var hitWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
      var hitSelf = snake.some(function (seg) { return seg.x === head.x && seg.y === head.y; });

      if (hitWall || hitSelf) {
        endGame();
        return;
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        score++;
        if (scoreEl) scoreEl.textContent = score;
        placeFood();
      } else {
        snake.pop();
      }

      draw();
    }

    function startGame() {
      resetGame();
      running = true;
      if (overlay) overlay.style.display = 'none';
      draw();
      clearInterval(loopId);
      loopId = setInterval(step, 110);
    }

    function endGame() {
      running = false;
      clearInterval(loopId);
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('hf-snake-highscore', String(highScore));
        if (highScoreEl) highScoreEl.textContent = highScore;
      }
      if (overlay && overlayText) {
        overlayText.textContent = 'Game over — score ' + score + '. Press Start to try again.';
        overlay.style.display = 'flex';
      }
    }

    function setDirection(dir) {
      if (!running) return;
      if (dir === 'up' && velocity.y === 0) nextVelocity = { x: 0, y: -1 };
      if (dir === 'down' && velocity.y === 0) nextVelocity = { x: 0, y: 1 };
      if (dir === 'left' && velocity.x === 0) nextVelocity = { x: -1, y: 0 };
      if (dir === 'right' && velocity.x === 0) nextVelocity = { x: 1, y: 0 };
    }

    document.addEventListener('keydown', function (e) {
      var map = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right'
      };
      if (map[e.key]) {
        e.preventDefault();
        if (!running) { startGame(); }
        setDirection(map[e.key]);
      }
    });

    document.querySelectorAll('.dpad-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = btn.getAttribute('data-dir');
        if (!running) startGame();
        setDirection(dir);
      });
    });

    if (startBtn) {
      startBtn.addEventListener('click', startGame);
    }

    resetGame();
    draw();
  }

});