import confetti from "canvas-confetti";

// Garden Canvas & Blooming Engine
const canvas = document.getElementById("garden-canvas");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

// State
let isBlooming = false;
let flowers = [];
let fireflies = [];
let petals = [];
let stars = [];

// Flower Palette Types (Tăng độ rực rỡ, chi tiết cánh hoa)
const FLOWER_TYPES = [
  {
    name: "royal_rose",
    colors: ["#ff5e7e", "#ff2a5f", "#e0115f", "#c2185b"],
    highlight: "#ffccd5",
    center: "#ffeaa7",
    layers: 4,
    petalsPerLayer: 6,
  },
  {
    name: "glowing_sunflower",
    colors: ["#ffc048", "#ff9f1a", "#ffa801", "#e58e26"],
    highlight: "#fff3cd",
    center: "#4b2b11",
    layers: 2,
    petalsPerLayer: 16,
  },
  {
    name: "fairy_lotus",
    colors: ["#ea80fc", "#d500f9", "#aa00ff", "#7c4dff"],
    highlight: "#f3e5f5",
    center: "#ffd54f",
    layers: 3,
    petalsPerLayer: 9,
  },
  {
    name: "sakura_blossom",
    colors: ["#ffb6c1", "#ff8da1", "#ff6b8b", "#ffa4b6"],
    highlight: "#ffffff",
    center: "#ff3838",
    layers: 2,
    petalsPerLayer: 5,
  },
  {
    name: "golden_camellia",
    colors: ["#ffbe76", "#f0932b", "#ff793f", "#d35400"],
    highlight: "#fff5eb",
    center: "#fff200",
    layers: 3,
    petalsPerLayer: 8,
  },
  {
    name: "pure_daisy",
    colors: ["#ffffff", "#f1f2f6", "#ced6e0"],
    highlight: "#ffffff",
    center: "#ffa801",
    layers: 2,
    petalsPerLayer: 14,
  },
];

// Lớp bầu trời ngàn sao lấp lánh ở background
class SkyStar {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * (height * 0.75);
    this.size = 0.6 + Math.random() * 1.8;
    this.alpha = 0.2 + Math.random() * 0.7;
    this.twinkleSpeed = 0.015 + Math.random() * 0.03;
    this.phase = Math.random() * Math.PI * 2;
  }

  update() {
    this.phase += this.twinkleSpeed;
    this.currentAlpha = this.alpha * (0.4 + 0.6 * Math.sin(this.phase));
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 248, 220, ${this.currentAlpha})`;
    ctx.shadowColor = "rgba(255, 235, 160, 0.9)";
    ctx.shadowBlur = this.size * 3;
    ctx.fill();
    ctx.restore();
  }
}

// Bông hoa nụ -> bung nở
class Flower {
  constructor(x, y, maxScale, type, delay = 0) {
    this.x = x;
    this.y = y;
    this.baseY = height + 45; // mọc từ dưới đáy lên
    this.stemHeight = this.baseY - y;
    this.currentStemProgress = 0; // 0 -> 1

    this.maxScale = maxScale;
    this.scale = 0;
    this.targetScale = 0;
    this.type = type;
    this.delay = delay;
    this.rotation = (Math.random() - 0.5) * 0.5;
    this.swayAngle = Math.random() * Math.PI * 2;
    this.swaySpeed = 0.012 + Math.random() * 0.018;
    this.stemCurve = (Math.random() - 0.5) * 70;
    
    // Lá trên thân
    this.leaves = [
      { t: 0.3 + Math.random() * 0.1, side: Math.random() > 0.5 ? 1 : -1, size: 14 + Math.random() * 10 },
      { t: 0.6 + Math.random() * 0.1, side: Math.random() > 0.5 ? -1 : 1, size: 16 + Math.random() * 12 },
    ];

    // Trạng thái nụ ban đầu (khi chưa gập thư)
    this.budScale = 0.2 + Math.random() * 0.15;
  }

  startBloom() {
    this.targetScale = 1;
  }

  reset() {
    this.scale = 0;
    this.targetScale = 0;
    this.currentStemProgress = 0;
  }

  update(delta) {
    // Khi đang trong chế độ bloom
    if (this.targetScale > 0) {
      if (this.delay > 0) {
        this.delay -= delta;
        return;
      }

      // Thân mọc vươn cao
      if (this.currentStemProgress < 1) {
        this.currentStemProgress += delta * 0.0018;
        if (this.currentStemProgress > 1) this.currentStemProgress = 1;
      }

      // Khi thân đạt 60% thì hoa nở rực
      if (this.currentStemProgress > 0.6 && this.scale < this.targetScale) {
        this.scale += delta * 0.0014;
        if (this.scale > this.targetScale) this.scale = this.targetScale;
      }
    } else {
      // Khi chưa bloom: thân đã mọc sẵn nhẹ tạo thành các nụ hoa ẩn hiện ở background
      if (this.currentStemProgress < 0.85) {
        this.currentStemProgress += delta * 0.0008;
      }
    }

    this.swayAngle += this.swaySpeed;
  }

  draw(ctx) {
    if (this.currentStemProgress <= 0) return;

    // Đung đưa nhẹ theo gió
    const sway = Math.sin(this.swayAngle) * (12 * this.currentStemProgress);
    const headX = this.x + sway;
    const currentTopY = this.baseY - (this.stemHeight * this.currentStemProgress);

    // 1. Thân cành (Stem)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.x, this.baseY);
    
    const controlX = this.x + this.stemCurve * this.currentStemProgress;
    const controlY = this.baseY - (this.stemHeight * 0.5 * this.currentStemProgress);

    ctx.quadraticCurveTo(controlX, controlY, headX, currentTopY);
    
    // Gradient thân cây tươi tắn
    const stemGrad = ctx.createLinearGradient(this.x, this.baseY, headX, currentTopY);
    stemGrad.addColorStop(0, "#234a26");
    stemGrad.addColorStop(1, "#3e7b42");
    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = Math.max(2.5, 5 * this.maxScale);
    ctx.lineCap = "round";
    ctx.stroke();

    // 2. Lá xanh
    for (const leaf of this.leaves) {
      if (this.currentStemProgress >= leaf.t) {
        const lx = this.x + (controlX - this.x) * leaf.t * 1.5;
        const ly = this.baseY - this.stemHeight * leaf.t;
        
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate((leaf.side * 48 * Math.PI) / 180 + Math.sin(this.swayAngle) * 0.12);
        ctx.beginPath();
        ctx.ellipse(leaf.size * 0.85, 0, leaf.size, leaf.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = leaf.side > 0 ? "#438248" : "#376e3b";
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
      }
    }

    // 3. Hoa nở / Nụ hoa
    ctx.translate(headX, currentTopY);
    ctx.rotate(this.rotation + Math.sin(this.swayAngle) * 0.1);
    
    if (this.scale > 0) {
      // Bung nở rực rỡ
      const s = this.scale * this.maxScale;
      ctx.scale(s, s);
      this.drawFullBlossom(ctx);
    } else {
      // Nụ e ấp đợi nở ở background
      ctx.scale(this.budScale * this.maxScale, this.budScale * this.maxScale);
      this.drawBud(ctx);
    }

    ctx.restore();
  }

  // Vẽ nụ hoa e ấp
  drawBud(ctx) {
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fill();

    // Nụ hoa khép cánh
    ctx.beginPath();
    ctx.ellipse(0, -6, 9, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.type.colors[0];
    ctx.fill();

    // Đài hoa ôm lấy nụ
    ctx.beginPath();
    ctx.ellipse(0, 4, 11, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#3e7b42";
    ctx.fill();
  }

  // Vẽ đóa hoa nở rực rỡ muôn màu
  drawFullBlossom(ctx) {
    const { colors, center, layers, petalsPerLayer, name, highlight } = this.type;

    // Vầng hào quang phát sáng sau bông hoa
    const glowRad = 45;
    const radialGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, glowRad);
    radialGlow.addColorStop(0, "rgba(255, 255, 255, 0.3)");
    radialGlow.addColorStop(0.5, "rgba(255, 215, 0, 0.12)");
    radialGlow.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(0, 0, glowRad, 0, Math.PI * 2);
    ctx.fillStyle = radialGlow;
    ctx.fill();

    // Vẽ từng tầng cánh hoa từ ngoài vào trong
    for (let l = layers; l >= 1; l--) {
      const layerRadius = 24 + l * 9;
      const count = petalsPerLayer + (layers - l) * 2;
      const color = colors[(l - 1) % colors.length];

      for (let p = 0; p < count; p++) {
        const angle = (p * (Math.PI * 2)) / count + (l * 0.35);
        ctx.save();
        ctx.rotate(angle);

        // Gradient cánh hoa từ đậm sang ánh sáng
        const petalGrad = ctx.createLinearGradient(0, 0, 0, -layerRadius);
        petalGrad.addColorStop(0, color);
        petalGrad.addColorStop(0.85, color);
        petalGrad.addColorStop(1, highlight || "#ffffff");

        ctx.fillStyle = petalGrad;

        ctx.beginPath();
        if (name === "sakura_blossom") {
          // Hoa anh đào chẻ ngọn lãng mạn
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-14, -22, -20, -38, -5, -46);
          ctx.lineTo(0, -40);
          ctx.lineTo(5, -46);
          ctx.bezierCurveTo(20, -38, 14, -22, 0, 0);
        } else if (name === "glowing_sunflower" || name === "pure_daisy") {
          // Cánh hướng dương & cúc thon dài
          ctx.ellipse(0, -layerRadius * 0.75, layerRadius * 0.28, layerRadius * 0.75, 0, 0, Math.PI * 2);
        } else {
          // Cánh hoa tròn xếp lớp mềm mại (Hoa hồng, sen, trà)
          ctx.ellipse(0, -layerRadius * 0.65, layerRadius * 0.52, layerRadius * 0.65, 0, 0, Math.PI * 2);
        }

        ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.restore();
      }
    }

    // Nhụy hoa rực rỡ
    const centerRadius = name === "glowing_sunflower" ? 20 : 12;
    const centerGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, centerRadius);
    centerGrad.addColorStop(0, "#ffeaa7");
    centerGrad.addColorStop(0.7, center);
    centerGrad.addColorStop(1, "#2d1400");

    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = centerGrad;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.fill();

    // Hạt nhụy hoa vàng phát sáng
    ctx.fillStyle = "#ffffff";
    for (let d = 0; d < 8; d++) {
      const a = (d * Math.PI) / 4;
      const r = centerRadius * 0.55;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 1.6, 0, Math.PI * 2);
      ctx.shadowBlur = 4;
      ctx.shadowColor = "#fffa65";
      ctx.fill();
    }
  }
}

// Đom đóm & hạt tiên phát sáng lộng lẫy
class Firefly {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.radius = 1.2 + Math.random() * 3;
    this.alpha = Math.random() * 0.9;
    this.speedX = (Math.random() - 0.5) * 0.8;
    this.speedY = -0.4 - Math.random() * 0.6;
    this.hue = 45 + Math.random() * 40; // Ánh kim vàng cam ấm áp
    this.pulse = Math.random() * Math.PI * 2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.pulse += 0.045;
    this.alpha = 0.35 + Math.sin(this.pulse) * 0.45;

    if (this.y < -15 || this.x < -15 || this.x > width + 15) {
      this.reset();
      this.y = height + 15;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 100%, 75%, ${Math.max(0, this.alpha)})`;
    ctx.shadowColor = `hsla(${this.hue}, 100%, 70%, 0.95)`;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.restore();
  }
}

// Cánh hoa rơi rụng bồng bềnh
class FallingPetal {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = -25 - Math.random() * 60;
    this.size = 7 + Math.random() * 10;
    this.speedX = 0.6 + Math.random() * 1.8;
    this.speedY = 1.2 + Math.random() * 1.6;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.05;
    this.color = Math.random() > 0.4 ? "rgba(255, 158, 181, 0.75)" : "rgba(255, 223, 186, 0.8)";
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotSpeed;

    if (this.y > height + 25 || this.x > width + 25) {
      this.reset();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * 0.52, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = "rgba(255, 192, 203, 0.4)";
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  }
}

// Khởi tạo toàn bộ khu vườn
function initGarden() {
  flowers = [];
  fireflies = [];
  petals = [];
  stars = [];

  // Tạo bầu trời sao
  for (let s = 0; s < 70; s++) {
    stars.push(new SkyStar());
  }

  // Số lượng hoa nhiều hơn để tạo cảm giác "trăm hoa đua nở um tùm"
  const flowerCount = Math.floor(Math.max(32, width / 30));

  for (let i = 0; i < flowerCount; i++) {
    const x = (i / flowerCount) * width + (Math.random() - 0.5) * 45;
    const yDepth = Math.random();
    const y = height * (0.28 + yDepth * 0.5);
    
    // Tỉ lệ scale sâu lắng
    const scale = 0.7 + yDepth * 0.75 + Math.random() * 0.2;
    const type = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
    const delay = Math.random() * 2000;

    flowers.push(new Flower(x, y, scale, type, delay));
  }

  flowers.sort((a, b) => a.y - b.y);

  // Đom đóm lấp lánh
  for (let i = 0; i < 50; i++) {
    fireflies.push(new Firefly());
  }

  // Cánh hoa bay
  for (let i = 0; i < 30; i++) {
    petals.push(new FallingPetal());
  }
}

// Kích hoạt hoa nở rộ lộng lẫy
function triggerBlooming() {
  isBlooming = true;
  flowers.forEach((flower) => {
    flower.startBloom();
  });

  // Chùm pháo hoa cánh hoa hoàng gia lung linh
  setTimeout(() => {
    confetti({
      particleCount: 65,
      spread: 110,
      origin: { y: 0.65 },
      colors: ["#ff5e7e", "#f6d365", "#ea80fc", "#ffbe76", "#ffffff", "#ffd700"],
      ticks: 280,
      gravity: 0.55,
      scalar: 1.15,
    });
  }, 1000);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 80,
      origin: { x: 0.1, y: 0.7 },
      colors: ["#ff758c", "#ff9f1a", "#ffffff", "#f6d365"],
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 80,
      origin: { x: 0.9, y: 0.7 },
      colors: ["#ff758c", "#ff9f1a", "#ffffff", "#f6d365"],
    });
  }, 2000);
}

// Chạm để gieo hoa nở tại chỗ
function plantFlowerAt(x, y) {
  const type = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
  const scale = 0.9 + Math.random() * 0.45;
  const newFlower = new Flower(x, y, scale, type, 0);
  newFlower.startBloom();
  flowers.push(newFlower);
  flowers.sort((a, b) => a.y - b.y);

  // Hạt sáng nở rộ tại ngón tay
  for (let i = 0; i < 8; i++) {
    const f = new Firefly();
    f.x = x + (Math.random() - 0.5) * 35;
    f.y = y + (Math.random() - 0.5) * 35;
    fireflies.push(f);
  }
}

// Vòng lặp Render Animation
let lastTime = performance.now();

function animate(currentTime) {
  const delta = Math.min(currentTime - lastTime, 60);
  lastTime = currentTime;

  ctx.clearRect(0, 0, width, height);

  // 1. Sao trên trời
  stars.forEach((star) => {
    star.update();
    star.draw(ctx);
  });

  // 2. Hoa trong vườn (dù chưa nở vẫn có nụ đung đưa mộc mạc phía sau thư)
  flowers.forEach((flower) => {
    flower.update(delta);
    flower.draw(ctx);
  });

  // 3. Đom đóm lơ lửng
  fireflies.forEach((firefly) => {
    firefly.update();
    firefly.draw(ctx);
  });

  // 4. Cánh hoa rơi rụng
  if (isBlooming) {
    petals.forEach((petal) => {
      petal.update();
      petal.draw(ctx);
    });
  }

  requestAnimationFrame(animate);
}

// Khởi chạy
initGarden();
requestAnimationFrame(animate);

// Resize handler
window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initGarden();
  if (isBlooming) {
    flowers.forEach((f) => {
      f.currentStemProgress = 1;
      f.scale = 1;
      f.targetScale = 1;
    });
  }
});

// UI Logic
const introScreen = document.getElementById("intro-screen");
const letterScreen = document.getElementById("letter-screen");
const gardenScreen = document.getElementById("garden-screen");

const openBtn = document.getElementById("open-btn");
const envelopeTrigger = document.getElementById("envelope-trigger");
const closeLetterBtn = document.getElementById("close-letter-btn");
const reopenLetterBtn = document.getElementById("reopen-letter-btn");
const replayBloomBtn = document.getElementById("replay-bloom-btn");

function showScreen(screen) {
  [introScreen, letterScreen, gardenScreen].forEach((s) => s.classList.remove("active"));
  if (screen) screen.classList.add("active");
}

// Mở thư
function openLetter() {
  showScreen(letterScreen);
}

openBtn.addEventListener("click", openLetter);
envelopeTrigger.addEventListener("click", openLetter);

// Gập thư lại -> Hoa bừng nở lộng lẫy
closeLetterBtn.addEventListener("click", () => {
  showScreen(gardenScreen);
  triggerBlooming();
});

// Đọc lại thư
reopenLetterBtn.addEventListener("click", () => {
  showScreen(letterScreen);
});

// Xem lại hoa nở
replayBloomBtn.addEventListener("click", () => {
  initGarden();
  triggerBlooming();
});

// Chạm ngón tay vào màn hình vườn hoa
window.addEventListener("pointerdown", (e) => {
  if (!gardenScreen.classList.contains("active")) return;
  if (e.target.closest(".bottom-controls")) return;

  plantFlowerAt(e.clientX, e.clientY);
});
