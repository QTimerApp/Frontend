type ConfettiOptions = {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
};

const COLORS = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff8fab", "#c084fc", "#fb923c"];

export function confetti(options: ConfettiOptions = {}) {
  const { particleCount = 50, spread = 60, origin = {} } = options;
  const originX = origin.x ?? 0.5;
  const originY = origin.y ?? 0.5;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctxRaw = canvas.getContext("2d");
  if (!ctxRaw) { canvas.remove(); return; }
  const ctx: CanvasRenderingContext2D = ctxRaw;

  const angle = (90 - spread / 2) * (Math.PI / 180);
  const angleWidth = (spread / 2) * (Math.PI / 180) * 2;

  const particles: Particle[] = [];
  for (let i = 0; i < particleCount; i++) {
    const a = angle + Math.random() * angleWidth;
    const speed = 8 + Math.random() * 6;
    particles.push({
      x: originX * canvas.width,
      y: originY * canvas.height,
      vx: Math.cos(a) * speed * (Math.random() > 0.5 ? 1 : -1),
      vy: -Math.sin(a) * speed,
      size: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  let frame: number;
  let startTime = performance.now();
  const duration = 3000;

  function animate() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.x += p.vx;
      p.vy += 0.15;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - progress * 1.2);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }

    if (progress < 1) {
      frame = requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }

  frame = requestAnimationFrame(animate);
}
