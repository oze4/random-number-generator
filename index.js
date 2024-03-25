/**
 * Setup / Initialization
 */

const entropyEl = document.getElementById("entropy");
const entropyElContext = entropyEl.getContext("2d");
entropyEl.addEventListener("mouseenter", handleEntropyOnMouseEnter);
entropyEl.addEventListener("mouseleave", handleEntropyOnMouseLeave);
entropyEl.addEventListener("mousemove", handleEntropyOnMouseMove);

const counterEl = document.getElementById("counter");
const timer = new CountdownTimer(10);
timer.addEventListener("ontick", handleTimerOnTick);
timer.addEventListener("oncomplete", handleTimeOnComplete);

const entropyArray = [];

/**
 * Event Handlers
 */

function handleTimerOnTick(remainingTime) {
  counterEl.innerHTML = remainingTime;
}

function handleTimeOnComplete() {
  console.log({entropyArray});
  const randomNumber = getRandomIntInRange(0, 10, Number(entropyArray.join("")))
  console.log({randomNumber})
}

function handleEntropyOnMouseEnter(event) {
  this.style.border = "10px solid green";
  if (timer.isPaused) {
    timer.resume();
  } else {
    timer.start();
  }
}

function handleEntropyOnMouseLeave(event) {
  this.style.border = "1px solid black";
  timer.pause();
}

function handleEntropyOnMouseMove(event) {
  if (timer.isComplete) {
    return;
  }
  const mouse = getMousePosition(entropyEl, event);
  generateEntropyViaMousePosition(mouse.x, mouse.y, entropyArray);
  drawMouseMovementsOnCanvas(entropyElContext, mouse.x, mouse.y, {
    lineWidth: 2
  });
}

/**
 * Misc functions
 */

function generateEntropyViaMousePosition(mouseX, mouseY, results=[]) {
  /*
  const windowSum = window.innerHeight + window.innerWidth;
  const mouseSum = mouseX + mouseY;
  results.push(Math.round((mouseSum/windowSum)*255));
  shuffleArray(results);
  */
  let t1 = numberToBinary(Date.now());
  let x = numberToBinary(Math.round(mouseX));
  let y = numberToBinary(Math.round(mouseY));
  let t2 = numberToBinary(Date.now());
  t1 = t1.slice(t1.length-4||0);
  t2 = t2.slice(t2.length-4||0);
  x = x.slice(x.length-4||0);
  y = y.slice(y.length-4||0);
  results.push(t1+t2+x+y);
}

function numberToBinary(n) {
  return n.toString(2);
}

function getMousePosition(canvasEl, event) {
  const rect = canvasEl.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / (rect.right - rect.left) * canvasEl.width,
    y: (event.clientY - rect.top) / (rect.bottom - rect.top) * canvasEl.height
  };
}

function drawMouseMovementsOnCanvas(context, mouseX, mouseY, contextOptions) {
  context.beginPath();
  // Move to where we were before.
  // This was the only way I could get it to draw smooth lines.
  context.moveTo(this.X, this.Y);
  context.lineCap = 'round';
  context.lineWidth = contextOptions.lineWidth || 1;
  // Draw line to where we are now.
  context.lineTo(mouseX, mouseY);
  context.strokeStyle = contextOptions.color || "black";
  context.stroke();
  // Store where we are "now" to be used in the next iteration as where we were "before".
  // This was the only way I could get it to draw smooth lines.
  this.X = mouseX;
  this.Y = mouseY;
}

function getRandomIntInRange(min = 0, max = 10, entropy = null) {
  if (!entropy) {
    entropy = Math.random();
  }
  return Math.floor(entropy * (max - min)) + min;
}

function CountdownTimer(from = 10) {
  this.callback = (remainingTime) => remainingTime;
  this.originalTime = from;
  this.timeRemaining = from;
  this.id = null;
  this.isRunning = false;
  this.isComplete = false;
  this.isPaused = false;
  this.onComplete = () => {};

  this.addEventListener = function(type, callback) {
    if (type === "ontick") {
      this.callback = callback;
    } else if (type === "oncomplete") {
      this.onComplete = callback;
    } else {
      console.warn("unknown event type. please use 'ontick' or 'oncomplete'");
    }
  }

  this.reset = function () {
    clearInterval(this.id);
    this.id = null;
    this.timeRemaining = this.originalTime;
    this.isComplete = false;
    this.isPaused = false;
    this.isRunning = false;
  }

  this.pause = function () {
    if (!this.isRunning) {
      console.warn("cannot pause a timer that is not running");
      return;
    }
    clearInterval(this.id);
    this.id = null;
    this.isPaused = true;
    this.isRunning = false;
  }

  this.resume = function () {
    if (!this.id) {
      this.start();
    }
  }

  this.start = function () {
    if (this.isComplete) {
      console.warn("cannot start CountdownTimer as it has already finished. Please use reset method")
      return;
    }
    this.isRunning = true;
    this.callback(this.timeRemaining);
    this.id = setInterval(() => {
      this.timeRemaining--;
      this.callback(this.timeRemaining);
      if (this.timeRemaining <= 0) {
        clearInterval(this.id);
        this.id = null;
        this.isComplete = true;
        this.isRunning = false;
        this.onComplete();
      }
    }, 1000);
  }
}