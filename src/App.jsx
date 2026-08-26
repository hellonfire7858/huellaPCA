import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';

// --- Sound Synthesizer (Web Audio API) ---
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playPop(freq = 440) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, this.ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (_) {}
  }
  playClick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (_) {}
  }
  playSuccess() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.32);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.33);
      });
    } catch (_) {}
  }
}
const sound = new SoundEngine();

// --- Configuration & Constants ---
const C = {
  plastico: {
    p: '#ff7843',
    s: '#ffab73',
    accent: '#ff4800',
    g: 'rgba(255,120,67,0.5)',
    bg: 'rgba(255,120,67,0.08)',
    border: 'rgba(255,120,67,0.22)',
    t: '#ffc19e',
    name: 'Plástico',
    icon: '🧴',
  },
  carbono: {
    p: '#22e55b',
    s: '#6bf08f',
    accent: '#05c742',
    g: 'rgba(34,229,91,0.5)',
    bg: 'rgba(34,229,91,0.08)',
    border: 'rgba(34,229,91,0.22)',
    t: '#9fffb8',
    name: 'Carbono',
    icon: '💨',
  },
  agua: {
    p: '#00d0ff',
    s: '#5ce1ff',
    accent: '#0099ff',
    g: 'rgba(0,208,255,0.5)',
    bg: 'rgba(0,208,255,0.08)',
    border: 'rgba(0,208,255,0.22)',
    t: '#9feeff',
    name: 'Agua',
    icon: '💧',
  },
};

const PQ = [
  { key: 'botellas', label: 'Botellas plásticas desechables', hint: 'Bebidas, gaseosas, energizantes por semana', emoji: '🍶', unit: 'bot/sem', max: 30, w: 0.025 * 52, presets: [0, 2, 7, 15] },
  { key: 'bolsas',   label: 'Bolsas plásticas de un solo uso', hint: 'Supermercados, delivery, tiendas por semana', emoji: '🛍️', unit: 'bol/sem', max: 30, w: 0.005 * 52, presets: [0, 3, 10, 20] },
  { key: 'envases',  label: 'Envases y recipientes desechables', hint: 'Icopor, vasos plásticos, empaques delivery por semana', emoji: '🥡', unit: 'env/sem', max: 20, w: 0.050 * 52, presets: [0, 2, 6, 14] },
  { key: 'comida',   label: 'Snacks en paquetes individuales', hint: 'Papas, galletas, golosinas con plástico por semana', emoji: '🍫', unit: 'paq/sem', max: 25, w: 0.015 * 52, presets: [0, 3, 8, 18] },
  { key: 'higiene',  label: 'Productos de higiene con envase plástico', hint: 'Champús, cremas, desodorantes comprados al mes', emoji: '🧴', unit: 'art/mes', max: 15, w: 0.010 * 12, presets: [1, 3, 6, 12] },
];

const CQ = [
  { key: 'carro',   label: 'Kilómetros en carro particular por día', hint: 'Promedio de tus trayectos diarios', emoji: '🚗', unit: 'km/día', max: 100, calc: v => v * 0.21 * 365, presets: [0, 10, 30, 60] },
  { key: 'moto',    label: 'Km en moto o transporte público por día', hint: 'Transmilenio, bus, metro o motocicleta', emoji: '🚌', unit: 'km/día', max: 80, calc: v => v * 0.10 * 365, presets: [0, 8, 20, 45] },
  { key: 'vuelos',  label: 'Vuelos nacionales o cortos por año', hint: 'Rutas < 3h (Ej: Bogotá - Medellín / Cartagena)', emoji: '✈️', unit: 'vuelos/año', max: 20, calc: v => v * 255, presets: [0, 2, 5, 12] },
  { key: 'carne',   label: 'Días que consumes carne roja por semana', hint: 'Res, cerdo, cordero (alta huella de metano/CO₂)', emoji: '🥩', unit: 'días/sem', max: 7, calc: v => v * 6.5 * 52, presets: [0, 2, 4, 7] },
  { key: 'energia', label: 'Consumo mensual de electricidad en el hogar', hint: 'Factura de luz (Promedio hogar Colombia: ~150 kWh)', emoji: '⚡', unit: 'kWh/mes', max: 500, calc: v => v * 0.126 * 12, presets: [60, 120, 180, 350] },
];

const AQ = [
  { key: 'ducha',  label: 'Minutos bajo la ducha en cada baño', hint: 'Cada minuto gasta aprox 9 litros de agua pura', emoji: '🚿', unit: 'min/ducha', max: 30, calc: v => v * 9 * 365, presets: [4, 8, 15, 25] },
  { key: 'ropa',   label: 'Ciclos de lavadora por semana', hint: 'Una carga promedio consume ~80 litros de agua', emoji: '👕', unit: 'lav/sem', max: 14, calc: v => v * 80 * 52, presets: [1, 2, 4, 8] },
  { key: 'dieta',  label: 'Consumo semanal de porciones de carne roja', hint: '1 kg de carne requiere hasta 15.000 L de agua virtual', emoji: '🥩', unit: 'porciones/sem', max: 14, calc: v => v * 3000 * 52, presets: [0, 2, 5, 10] },
  { key: 'grifo',  label: 'Hábito de cerrar el grifo al cepillarte / enjabonarte', hint: '1 = Siempre cerrado (Ahorrador) · 5 = Siempre abierto', emoji: '🚰', unit: 'escala (1-5)', max: 5, calc: v => (v - 1) * 12 * 365, presets: [1, 2, 4, 5] },
  { key: 'jardin', label: 'Riego de jardín o plantas / lavado de patio', hint: 'Minutos semanales con manguera o aspersor', emoji: '🌱', unit: 'min/sem', max: 60, calc: v => v * 12 * 52, presets: [0, 10, 25, 50] },
];

const NV = {
  plastico: [
    { max: 20, l: 'Guardián Verde', e: '🌿', g: 'A+', msg: '¡Excelente! Tu consumo plástico es mínimo e inspirador.' },
    { max: 45, l: 'Consumidor Consciente', e: '♻️', g: 'A', msg: 'Buen nivel, mantienes tus residuos bajo control.' },
    { max: 75, l: 'En Transición', e: '⚡', g: 'B', msg: 'Uso moderado con gran potencial de reducción.' },
    { max: 110, l: 'Alerta de Consumo', e: '⚠️', g: 'C', msg: 'Superas la media nacional. Aplica acciones clave.' },
    { max: Infinity, l: 'Crítico Plástico', e: '🔥', g: 'D', msg: 'Impacto muy elevado en residuos de un solo uso.' },
  ],
  carbono: [
    { max: 1800, l: 'Neutro / Eco Líder', e: '🌱', g: 'A+', msg: 'Emisiones alineadas con el objetivo global 1.5°C.' },
    { max: 3500, l: 'Baja Emisión', e: '💚', g: 'A', msg: 'Excelente gestión de transporte y energía.' },
    { max: 6000, l: 'Promedio Colombiano', e: '⚡', g: 'B', msg: 'Cercano a la media nacional (~5.8 t CO₂e).' },
    { max: 9500, l: 'Intensivo en Carbono', e: '⚠️', g: 'C', msg: 'Tus hábitos de transporte o dieta generan alta huella.' },
    { max: Infinity, l: 'Super Emisor', e: '🏭', g: 'D', msg: 'Nivel crítico. Considera alternativas sustentables.' },
  ],
  agua: [
    { max: 400000, l: 'Guardián del Agua', e: '💎', g: 'A+', msg: 'Ahorro hídrico ejemplar y muy eficiente.' },
    { max: 800000, l: 'Uso Responsable', e: '🌊', g: 'A', msg: 'Consumo controlado y consciente del recurso.' },
    { max: 1200000, l: 'Promedio Hídrico', e: '💧', g: 'B', msg: 'En la media nacional (~1.09 millones de litros/año).' },
    { max: 1800000, l: 'Consumo Elevado', e: '⚠️', g: 'C', msg: 'Tu huella virtual hídrica es considerablemente alta.' },
    { max: Infinity, l: 'Crisis Hídrica', e: '🔴', g: 'D', msg: 'Gasto masivo de agua directa e indirecta.' },
  ],
};

const AVG = { plastico: 65, carbono: 5800, agua: 1095000 };
const AQs = { plastico: PQ, carbono: CQ, agua: AQ };

const TIPS_DATA = {
  plastico: [
    { id: 'p1', i: '💧', t: 'Botella de acero / vidrio reutilizable', d: 'Elimina hasta 90% de botellas PET al año', k: 'botellas', f: 0.85, ahorroCOP: '$280.000 COP' },
    { id: 'p2', i: '🛍️', t: 'Bolsas de tela o malla para compras', d: 'Evita cientos de bolsas de un solo uso en supermercados', k: 'bolsas', f: 0.90, ahorroCOP: '$55.000 COP' },
    { id: 'p3', i: '🥗', t: 'Tu propio táper para llevar almuerzo/delivery', d: 'Reduce envases de icopor y plástico térmico', k: 'envases', f: 0.70, ahorroCOP: '$140.000 COP' },
    { id: 'p4', i: '🧼', t: 'Cosmética sólida (Shampoo y jabón en barra)', d: 'Cero empaques plásticos en tu baño', k: 'higiene', f: 0.80, ahorroCOP: '$90.000 COP' },
  ],
  carbono: [
    { id: 'c1', i: '🚲', t: 'Movilidad activa (Bici o caminar 2 días/sem)', d: 'Ahorra combustible y recorta drásticamente emisiones urbanas', k: 'carro', f: 0.35, ahorroCOP: '$1.400.000 COP' },
    { id: 'c2', i: '🌱', t: 'Lunes sin carne (Dieta rica en vegetales)', d: 'Reduce el impacto de la ganadería extensiva', k: 'carne', f: 0.30, ahorroCOP: '$450.000 COP' },
    { id: 'c3', i: '💡', t: 'Desconectar cargadores y bombillos LED', d: 'Elimina el consumo fantasma y optimiza tu factura eléctrica', k: 'energia', f: 0.25, ahorroCOP: '$320.000 COP' },
    { id: 'c4', i: '🚌', t: 'Compartir coche (Carpooling) o transporte masivo', d: 'Multiplica la eficiencia de cada viaje por persona', k: 'carro', f: 0.25, ahorroCOP: '$850.000 COP' },
  ],
  agua: [
    { id: 'a1', i: '⏱️', t: 'Duchas conscientes de 5 minutos', d: 'Ahorra hasta 35.000 litros de agua pura al año', k: 'ducha', f: 0.45, ahorroCOP: '$180.000 COP' },
    { id: 'a2', i: '👗', t: 'Lavadora solo con carga completa y ciclo eco', d: 'Ahorra hasta 15.000 L y extiende vida a tus prendas', k: 'ropa', f: 0.35, ahorroCOP: '$95.000 COP' },
    { id: 'a3', i: '🚰', t: 'Cerrar llave al cepillarse y usar vaso con agua', d: 'Ahorra 12 litros por minuto de manera instantánea', k: 'grifo', f: 0.80, ahorroCOP: '$60.000 COP' },
    { id: 'a4', i: '🌾', t: 'Sustituir 2 porciones de res por legumbres/pollo', d: 'El mayor ahorro de agua virtual del planeta', k: 'dieta', f: 0.25, ahorroCOP: '$300.000 COP' },
  ],
};

const TABS = [
  { k: 'plastico', i: '🧴', l: 'Plástico', desc: 'Residuos sólidos y descartables' },
  { k: 'carbono',  i: '💨', l: 'Carbono',  desc: 'Emisiones de gases CO₂e' },
  { k: 'agua',     i: '💧', l: 'Agua',     desc: 'Consumo directo y virtual' },
];

const fmt = (t, v) => {
  if (t === 'agua') {
    if (v < 1000) return `${Math.round(v)} L`;
    if (v < 1000000) return `${(v / 1000).toFixed(1)}k L`;
    return `${(v / 1000000).toFixed(2)}M L`;
  }
  if (t === 'carbono') {
    if (v < 1000) return `${Math.round(v)} kg CO₂`;
    return `${(v / 1000).toFixed(2)} t CO₂`;
  }
  return `${v.toFixed(1)} kg plástico`;
};

const getEquiv = (t, v) => {
  if (t === 'plastico') {
    const bots = Math.round(v / 0.025);
    const bolsas = Math.round(v / 0.005);
    return `≈ ${bots.toLocaleString()} botellas de plástico o ${bolsas.toLocaleString()} bolsas de mercado al año`;
  }
  if (t === 'carbono') {
    const arboles = Math.max(1, Math.round(v / 22));
    const viajes = (v / 85).toFixed(1);
    return `🌲 Requiere plantar ${arboles} árboles adultos para compensarlo · ≈ ${viajes} viajes Bogotá-Medellín`;
  }
  const piscinas = (v / 2500000).toFixed(2);
  const duchas = Math.round(v / 45);
  return `🏊 Equivale a ${piscinas} piscinas olímpicas · O ${duchas.toLocaleString()} duchas de 5 minutos`;
};

const getLv = (t, v) => NV[t].find(l => v <= l.max) || NV[t].at(-1);

// --- Custom Animated SVG Gauge Ring ---
function Ring({ value, max, color, size = 130, label, sub, icon }) {
  const r = size / 2 - 14;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value / (max || 1), 0), 1);
  const dash = circ * pct;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          fill="none"
          style={{
            filter: `drop-shadow(0 0 10px ${color})`,
            transition: 'stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1, padding: '0 6px' }}>
        {icon && <div style={{ fontSize: 16, marginBottom: 2 }}>{icon}</div>}
        <div style={{ fontSize: 12, fontWeight: 900, color, lineHeight: 1.2, letterSpacing: '-0.02em' }}>{label}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: 600 }}>{sub}</div>
      </div>
    </div>
  );
}

// --- Floating Interactive Ambient Aurora ---
function AmbientAurora({ color }) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '55vw',
          height: '55vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, rgba(9,13,26,0) 70%)`,
          opacity: 0.16,
          filter: 'blur(60px)',
          transition: 'background 1.2s ease, opacity 0.8s ease',
          animation: 'pulseGlow 8s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, rgba(9,13,26,0) 70%)`,
          opacity: 0.12,
          filter: 'blur(70px)',
          transition: 'background 1.2s ease, opacity 0.8s ease',
          animation: 'pulseGlow 11s ease-in-out infinite alternate-reverse',
        }}
      />
    </div>
  );
}

// --- Tooltip for Recharts ---
const CustomChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(11, 17, 36, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>
        {payload[0].value} <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>anual</span>
      </div>
    </div>
  );
};

export default function App() {
  const [tab, setTab] = useState('plastico');
  const [steps, setSteps] = useState({ plastico: 0, carbono: 0, agua: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedTips, setSelectedTips] = useState({});
  const [shareFeedback, setShareFeedback] = useState(false);
  const [vis, setVis] = useState(true);
  const [dir, setDir] = useState('r');

  const [ans, setAns] = useState({
    plastico: { botellas: 3, bolsas: 5, envases: 2, comida: 3, higiene: 2 },
    carbono:  { carro: 12, moto: 8, vuelos: 1, carne: 3, energia: 140 },
    agua:     { ducha: 8, ropa: 2, dieta: 3, grifo: 2, jardin: 10 },
  });

  const [done, setDone] = useState({ plastico: false, carbono: false, agua: false });

  const c = C[tab];
  const Q = AQs[tab];
  const step = steps[tab];
  const a = ans[tab];
  const isDone = done[tab];

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Calculations
  const fp = useMemo(() => {
    const calc = t => {
      const qs = AQs[t];
      const a2 = ans[t];
      const cats = {};
      qs.forEach(q => {
        cats[q.key] = t === 'plastico' ? a2[q.key] * q.w : q.calc(a2[q.key]);
      });
      return { cats, total: Object.values(cats).reduce((x, y) => x + y, 0) };
    };
    return {
      plastico: calc('plastico'),
      carbono:  calc('carbono'),
      agua:     calc('agua'),
    };
  }, [ans]);

  const cur = fp[tab];
  const lv = getLv(tab, cur.total);
  const allDone = Object.values(done).every(Boolean);

  // Trigger celebration confetti when done
  const triggerConfetti = () => {
    sound.playSuccess();
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.65 },
        colors: [c.p, c.s, '#ffffff', '#ffd700'],
      });
    } catch (_) {}
  };

  const goStep = next => {
    sound.playClick();
    setDir(next > step ? 'r' : 'l');
    setVis(false);
    setTimeout(() => {
      setSteps(s => ({ ...s, [tab]: next }));
      setVis(true);
    }, 180);
  };

  const handleFinishSection = () => {
    setDone(dd => ({ ...dd, [tab]: true }));
    triggerConfetti();
  };

  const setV = (key, val) => {
    sound.playPop(260 + (val / (Q.find(q => q.key === key)?.max || 1)) * 300);
    setAns(p => ({ ...p, [tab]: { ...p[tab], [key]: val } }));
  };

  const q = Q[step];

  const currentItemVal = useMemo(() => {
    const v = a[q.key];
    const val = tab === 'plastico' ? v * q.w : q.calc(v);
    return fmt(tab, val);
  }, [a, q, tab]);

  // Chart data
  const barData = useMemo(() => {
    return Q.map(q2 => ({
      name: `${q2.emoji} ${q2.label.split(' ')[0]}`,
      value: +(cur.cats[q2.key] ? cur.cats[q2.key].toFixed(1) : 0),
    }));
  }, [Q, cur, tab]);

  const pieData = useMemo(() => {
    return Q.map(q2 => ({
      name: `${q2.emoji} ${q2.label.split(' ')[0]}`,
      value: +(cur.cats[q2.key] ? cur.cats[q2.key].toFixed(1) : 0),
    })).filter(d => d.value > 0);
  }, [Q, cur]);

  const radarData = useMemo(() => {
    return [
      { s: '🧴 Plástico', A: Math.min((fp.plastico.total / (AVG.plastico * 1.6)) * 100, 100), full: 100 },
      { s: '💨 Carbono',  A: Math.min((fp.carbono.total / (AVG.carbono * 1.6)) * 100, 100),  full: 100 },
      { s: '💧 Agua',     A: Math.min((fp.agua.total / (AVG.agua * 1.6)) * 100, 100),        full: 100 },
    ];
  }, [fp]);

  // Dynamic Savings Simulator based on selected tips
  const activeTips = TIPS_DATA[tab];
  const tipsSavings = useMemo(() => {
    let saved = 0;
    activeTips.forEach(tip => {
      if (selectedTips[tip.id]) {
        const initialVal = cur.cats[tip.k] || 0;
        saved += initialVal * tip.f;
      }
    });
    return saved;
  }, [selectedTips, activeTips, cur]);

  const projectedTotal = Math.max(0, cur.total - tipsSavings);
  const diffFromAvg = cur.total - AVG[tab];
  const diffPct = Math.round((Math.abs(diffFromAvg) / AVG[tab]) * 100);

  const toggleTip = id => {
    sound.playClick();
    setSelectedTips(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShareSummary = () => {
    sound.playPop(520);
    const summaryText = `🌿 *Mi Huella Ambiental en Colombia (HuellaTotal)* 🇨🇴\n` +
      `🧴 Plástico: ${fmt('plastico', fp.plastico.total)} (${getLv('plastico', fp.plastico.total).l})\n` +
      `💨 Carbono: ${fmt('carbono', fp.carbono.total)} (${getLv('carbono', fp.carbono.total).l})\n` +
      `💧 Agua: ${fmt('agua', fp.agua.total)} (${getLv('agua', fp.agua.total).l})\n\n` +
      `Calcula tu huella y actúa por el planeta en HuellaTotal 🌍`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText).then(() => {
        setShareFeedback(true);
        setTimeout(() => setShareFeedback(false), 3000);
      });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090d1a',
        color: '#ffffff',
        overflowX: 'hidden',
        position: 'relative',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        @keyframes floatUp { 0% { transform: translateY(0) scale(0.9); opacity: 0; } 50% { opacity: 0.6; } 100% { transform: translateY(-90vh) scale(1.1); opacity: 0; } }
        @keyframes pulseGlow { 0% { transform: scale(1); opacity: 0.12; } 100% { transform: scale(1.15); opacity: 0.22; } }
        @keyframes subtleSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bannerShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.035);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 40px rgba(0,0,0,0.45);
        }
        .glass-card-hover {
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card-hover:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 16px 48px rgba(0,0,0,0.55);
        }

        /* Modern Range Input */
        input[type=range] {
          -webkit-appearance: none;
          width: 100%;
          background: transparent;
          cursor: pointer;
          outline: none;
        }
        input[type=range]::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.09);
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          margin-top: -8px;
          background: var(--thumb-c, #ffffff);
          box-shadow: 0 0 16px var(--thumb-g, rgba(255,255,255,0.8)), 0 2px 6px rgba(0,0,0,0.5);
          border: 2px solid #ffffff;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.18);
        }
        input[type=range]::-webkit-slider-thumb:active {
          transform: scale(1.35);
        }

        /* Smooth Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #070a14; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>

      {/* Ambient background light */}
      <AmbientAurora color={c.p} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 940, margin: '0 auto', padding: '0 16px 80px' }}>
        
        {/* Top Floating Control Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🌿</span>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>
              HuellaTotal Colombia
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                sound.playClick();
              }}
              style={{
                background: soundEnabled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 24,
                padding: '6px 14px',
                color: soundEnabled ? '#ffffff' : 'rgba(255,255,255,0.4)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backdropFilter: 'blur(8px)',
              }}
              title="Sonidos interactivos"
            >
              <span>{soundEnabled ? '🔊 Audio Activado' : '🔇 Audio Silenciado'}</span>
            </button>
          </div>
        </div>

        {/* Hero Header */}
        <header style={{ textAlign: 'center', paddingTop: 24, marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22e55b', boxShadow: '0 0 10px #22e55b' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Calculadora Ecológica Integral
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 5.5vw, 56px)',
              fontWeight: 900,
              letterSpacing: '-0.035em',
              lineHeight: 1.08,
              margin: '0 0 10px 0',
              background: `linear-gradient(110deg, #ffffff 20%, ${c.p} 55%, #ffffff 85%)`,
              backgroundSize: '220%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'bannerShimmer 6s infinite linear',
            }}
          >
            ¿Cuál es tu huella en el planeta?
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, maxWidth: 580, margin: '0 auto 20px', lineHeight: 1.5 }}>
            Descubre tu impacto real en <strong>Plástico</strong>, <strong>Emisiones de CO₂</strong> y <strong>Huella de Agua</strong> comparado con los promedios de Colombia.
          </p>

          {/* Quick Pill Status Overview */}
          {Object.values(done).some(Boolean) && (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {done.plastico && (
                <div className="glass-panel" style={{ borderRadius: 12, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 7, borderLeft: `3px solid ${C.plastico.p}` }}>
                  <span>🧴</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.plastico.t }}>{fmt('plastico', fp.plastico.total)}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>/año</span>
                </div>
              )}
              {done.carbono && (
                <div className="glass-panel" style={{ borderRadius: 12, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 7, borderLeft: `3px solid ${C.carbono.p}` }}>
                  <span>💨</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.carbono.t }}>{fmt('carbono', fp.carbono.total)}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>/año</span>
                </div>
              )}
              {done.agua && (
                <div className="glass-panel" style={{ borderRadius: 12, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 7, borderLeft: `3px solid ${C.agua.p}` }}>
                  <span>💧</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.agua.t }}>{fmt('agua', fp.agua.total)}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>/año</span>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Category Tabs */}
        <nav
          aria-label="Ejes de medición ambiental"
          style={{
            display: 'flex',
            gap: 6,
            padding: 6,
            borderRadius: 20,
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            marginBottom: 28,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {TABS.map(t => {
            const tc = C[t.k];
            const act = tab === t.k;
            return (
              <button
                key={t.k}
                onClick={() => {
                  sound.playClick();
                  setTab(t.k);
                }}
                style={{
                  flex: 1,
                  padding: '12px 10px',
                  borderRadius: 14,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'clamp(12px, 2.5vw, 15px)',
                  fontWeight: 800,
                  fontFamily: 'inherit',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  background: act ? `${tc.p}20` : 'transparent',
                  color: act ? '#ffffff' : 'rgba(255,255,255,0.45)',
                  boxShadow: act ? `0 0 20px ${tc.g}` : 'none',
                  borderBottom: act ? `2px solid ${tc.p}` : '2px solid transparent',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>{t.i}</span>
                <span>{t.l}</span>
                {done[t.k] && (
                  <span
                    style={{
                      background: tc.p,
                      color: '#000',
                      fontSize: 10,
                      fontWeight: 900,
                      borderRadius: '50%',
                      width: 16,
                      height: 16,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Section: Interactive Questionnaire */}
        {!isDone ? (
          <main style={{ maxWidth: 580, margin: '0 auto' }}>
            
            {/* Progress status */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  {c.name} · Pregunta {step + 1} de {Q.length}
                </span>
                <span style={{ fontSize: 13, fontWeight: 900, color: c.p }}>
                  {Math.round(((step + 1) / Q.length) * 100)}% completado
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {Q.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      transition: 'all 0.35s ease',
                      background: i <= step ? c.p : 'rgba(255,255,255,0.08)',
                      boxShadow: i <= step ? `0 0 10px ${c.g}` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Question Card */}
            <div
              className="glass-panel"
              style={{
                borderRadius: 26,
                padding: '34px 28px',
                marginBottom: 20,
                opacity: vis ? 1 : 0,
                transform: vis ? 'translateX(0) scale(1)' : `translateX(${dir === 'r' ? '28px' : '-28px'}) scale(0.98)`,
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                border: `1px solid ${c.border}`,
                boxShadow: `0 16px 50px rgba(0,0,0,0.5), 0 0 30px ${c.g}20`,
                position: 'relative',
              }}
            >
              {/* Question Icon + Titles */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 36,
                    padding: 12,
                    borderRadius: 18,
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    boxShadow: `0 0 20px ${c.g}30`,
                    lineHeight: 1,
                  }}
                >
                  {q.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                    {q.label}
                  </h2>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.4 }}>
                    {q.hint}
                  </p>
                </div>
              </div>

              {/* Live Big Number Value */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  background: 'rgba(0,0,0,0.25)',
                  padding: '16px 20px',
                  borderRadius: 18,
                  border: '1px solid rgba(255,255,255,0.06)',
                  marginBottom: 20,
                }}
              >
                <div>
                  <span style={{ fontSize: 44, fontWeight: 900, color: c.p, lineHeight: 1, letterSpacing: '-0.03em', textShadow: `0 0 30px ${c.g}` }}>
                    {a[q.key]}
                  </span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginLeft: 8, fontWeight: 600 }}>
                    {q.unit}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Impacto calculado</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: c.t }}>{currentItemVal}</div>
                </div>
              </div>

              {/* Slider Component */}
              <div style={{ marginBottom: 20, '--thumb-c': c.p, '--thumb-g': c.g }}>
                <input
                  type="range"
                  aria-label={q.label}
                  min="0"
                  max={q.max}
                  value={a[q.key]}
                  onChange={e => setV(q.key, +e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontWeight: 600 }}>
                  <span>0 (Ninguno)</span>
                  <span>{q.max} {q.unit}</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Ajuste rápido:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {q.presets.map((presetVal, pIdx) => {
                    const isSelected = a[q.key] === presetVal;
                    const labels = ['Cero', 'Bajo', 'Medio', 'Alto'];
                    return (
                      <button
                        key={pIdx}
                        onClick={() => setV(q.key, presetVal)}
                        style={{
                          padding: '8px 4px',
                          borderRadius: 12,
                          border: isSelected ? `1px solid ${c.p}` : '1px solid rgba(255,255,255,0.08)',
                          background: isSelected ? `${c.p}25` : 'rgba(255,255,255,0.03)',
                          color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.5)',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? `0 0 14px ${c.g}40` : 'none',
                        }}
                      >
                        <div style={{ fontSize: 10, color: isSelected ? c.t : 'rgba(255,255,255,0.3)' }}>{labels[pIdx]}</div>
                        <div>{presetVal}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Context Equivalence Callout */}
              <div
                style={{
                  padding: '13px 16px',
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                }}
              >
                <span style={{ fontSize: 22 }}>💡</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
                  Equivale anualmente a <strong style={{ color: c.p }}>{currentItemVal}</strong> en tu huella de {c.name.toLowerCase()}.
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              {step > 0 && (
                <button
                  onClick={() => goStep(step - 1)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                >
                  ← Anterior
                </button>
              )}
              <button
                onClick={() => {
                  if (step < Q.length - 1) {
                    goStep(step + 1);
                  } else {
                    handleFinishSection();
                  }
                }}
                style={{
                  flex: 2,
                  padding: '14px',
                  borderRadius: 16,
                  border: 'none',
                  background: `linear-gradient(135deg, ${c.p}, ${c.s})`,
                  color: '#070b16',
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: `0 6px 25px ${c.g}`,
                  fontFamily: 'inherit',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>{step < Q.length - 1 ? 'Siguiente pregunta' : `Finalizar huella de ${c.name}`}</span>
                <span>{step < Q.length - 1 ? '→' : '🎉'}</span>
              </button>
            </div>
          </main>
        ) : (
          /* Section: Results Dashboard & Action Plan */
          <main style={{ animation: 'scIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            {/* Hero Result Banner */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div
                className="glass-panel"
                style={{
                  display: 'inline-block',
                  borderRadius: 32,
                  padding: '36px 44px',
                  background: `radial-gradient(ellipse at 50% 10%, ${c.p}20 0%, rgba(10,14,28,0.85) 75%)`,
                  border: `1px solid ${c.border}`,
                  boxShadow: `0 0 70px ${c.g}35, inset 0 1px 0 rgba(255,255,255,0.15)`,
                  position: 'relative',
                  overflow: 'hidden',
                  maxWidth: 580,
                  width: '100%',
                }}
              >
                <div style={{ fontSize: 50, marginBottom: 8 }}>{lv.e}</div>
                <div
                  style={{
                    fontSize: 'clamp(44px, 8vw, 76px)',
                    fontWeight: 900,
                    color: c.p,
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    textShadow: `0 0 40px ${c.g}`,
                    marginBottom: 6,
                  }}
                >
                  {fmt(tab, cur.total)}
                </div>
                <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 16 }}>
                  al año en Colombia 🇨🇴
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 22px',
                    borderRadius: 40,
                    background: `${c.p}1e`,
                    border: `1px solid ${c.p}55`,
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 14,
                    boxShadow: `0 0 20px ${c.g}50`,
                  }}
                >
                  <span>{lv.l}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span style={{ color: c.p }}>Grado {lv.g}</span>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 14, marginBottom: 0, lineHeight: 1.4 }}>
                  {lv.msg}
                </p>
              </div>

              {/* Comparison Stats Pills */}
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
                <div className="glass-panel" style={{ borderRadius: 16, padding: '14px 22px', textAlign: 'center', minWidth: 160 }}>
                  <div style={{ fontSize: 19, fontWeight: 900, color: diffFromAvg <= 0 ? '#22e55b' : '#ff7843' }}>
                    {diffFromAvg <= 0 ? `▼ ${diffPct}% menor` : `▲ ${diffPct}% mayor`}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3, fontWeight: 600 }}>que el promedio nacional</div>
                </div>

                <div className="glass-panel" style={{ borderRadius: 16, padding: '14px 22px', textAlign: 'center', minWidth: 160 }}>
                  <div style={{ fontSize: 19, fontWeight: 900, color: 'rgba(255,255,255,0.85)' }}>
                    {fmt(tab, AVG[tab])}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3, fontWeight: 600 }}>Media Colombia / año</div>
                </div>

                <div className="glass-panel" style={{ borderRadius: 16, padding: '14px 22px', textAlign: 'center', minWidth: 160 }}>
                  <div style={{ fontSize: 19, fontWeight: 900, color: c.t }}>
                    {fmt(tab, cur.total / 12)}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3, fontWeight: 600 }}>Tu promedio mensual</div>
                </div>
              </div>

              {/* Humanized Equivalency Banner */}
              <div
                className="glass-panel"
                style={{
                  borderRadius: 18,
                  padding: '14px 20px',
                  maxWidth: 680,
                  margin: '18px auto 0',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <span>🌎</span>
                <span>{getEquiv(tab, cur.total)}</span>
              </div>
            </div>

            {/* Interactive Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 20 }}>
              {/* Bar Chart breakdown */}
              <div className="glass-panel" style={{ borderRadius: 22, padding: '22px 20px', minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>📊 Desglose por Hábito</h3>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Impacto individual</span>
                </div>
                <div style={{ width: '100%', height: 210 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barSize={26}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {barData.map((_, i) => (
                          <Cell key={i} fill={c.p} opacity={0.75 + (i % 3) * 0.1} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart Distribution */}
              <div className="glass-panel" style={{ borderRadius: 22, padding: '22px 20px', minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>🥧 Proporción del Consumo</h3>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Porcentaje total</span>
                </div>
                {pieData.length > 0 ? (
                  <div style={{ width: '100%', height: 210 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={74}
                          innerRadius={36}
                          dataKey="value"
                          paddingAngle={3}
                          label={({ name, percent }) => (percent > 0.08 ? `${name} ${(percent * 100).toFixed(0)}%` : '')}
                          labelLine={false}
                          fontSize={10}
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={[c.p, c.s, '#fff', c.t, '#88aaff'][i % 5]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                    Sin datos suficientes
                  </div>
                )}
              </div>
            </div>

            {/* Benchmark Gauge Comparison */}
            <div className="glass-panel" style={{ borderRadius: 22, padding: '24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>🎯 Comparativa de Niveles</h3>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Tú vs Colombia vs Meta 1.5°C</span>
              </div>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-around' }}>
                <Ring
                  value={cur.total}
                  max={AVG[tab] * 2}
                  color={c.p}
                  size={135}
                  label={fmt(tab, cur.total)}
                  sub="Tu Huella"
                  icon="👤"
                />
                <Ring
                  value={AVG[tab]}
                  max={AVG[tab] * 2}
                  color="rgba(255,255,255,0.35)"
                  size={115}
                  label={fmt(tab, AVG[tab])}
                  sub="Media Colombia"
                  icon="🇨🇴"
                />
                <Ring
                  value={AVG[tab] * 0.5}
                  max={AVG[tab] * 2}
                  color="#22e55b"
                  size={115}
                  label={fmt(tab, AVG[tab] * 0.5)}
                  sub="Meta Sostenible"
                  icon="🌱"
                />
              </div>
            </div>

            {/* Interactive Action Plan & Savings Simulator */}
            <div
              className="glass-panel"
              style={{
                borderRadius: 24,
                padding: '28px 24px',
                marginBottom: 20,
                border: `1px solid ${c.border}`,
                background: `linear-gradient(180deg, ${c.bg} 0%, rgba(9,13,26,0.6) 100%)`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 4px 0', color: '#ffffff' }}>
                    💡 Simulador de Plan de Acción y Ahorro
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                    Selecciona los compromisos que deseas asumir y mira cómo se reduce tu huella en tiempo real.
                  </p>
                </div>

                {tipsSavings > 0 && (
                  <div style={{ background: '#22e55b22', border: '1px solid #22e55b66', padding: '6px 14px', borderRadius: 20 }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#22e55b' }}>
                      ✨ Ahorro estimado: -{fmt(tab, tipsSavings)}
                    </span>
                  </div>
                )}
              </div>

              {/* Checklist Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 20 }}>
                {activeTips.map(tip => {
                  const isChecked = !!selectedTips[tip.id];
                  const potentialSave = (cur.cats[tip.k] || 0) * tip.f;
                  return (
                    <div
                      key={tip.id}
                      onClick={() => toggleTip(tip.id)}
                      className="glass-card-hover"
                      style={{
                        borderRadius: 16,
                        padding: '16px',
                        background: isChecked ? `${c.p}1c` : 'rgba(255,255,255,0.03)',
                        border: isChecked ? `1.5px solid ${c.p}` : '1px solid rgba(255,255,255,0.07)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ marginTop: 3, accentColor: c.p, width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 18 }}>{tip.i}</span>
                          <span style={{ fontWeight: 800, fontSize: 13, color: '#ffffff' }}>{tip.t}</span>
                        </div>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '0 0 8px 0', lineHeight: 1.35 }}>
                          {tip.d}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                          <span style={{ color: c.p, fontWeight: 800 }}>-{fmt(tab, potentialSave)}</span>
                          <span style={{ color: '#22e55b', fontWeight: 700 }}>{tip.ahorroCOP}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Projected Bar */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Impacto proyectado con tu plan de acción:</span>
                  <span style={{ fontWeight: 900, color: projectedTotal < cur.total ? '#22e55b' : '#ffffff' }}>
                    {fmt(tab, projectedTotal)} / año
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${c.p}, #22e55b)`,
                      width: `${cur.total > 0 ? Math.min((projectedTotal / cur.total) * 100, 100) : 0}%`,
                      transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 360° Radar Profile (Shown when all axes completed or enabled) */}
            {allDone && (
              <div
                className="glass-panel"
                style={{
                  borderRadius: 24,
                  padding: '28px 20px',
                  marginBottom: 20,
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.12)',
                  minWidth: 0,
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>🌍</span>
                  <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#ffffff' }}>
                    Perfil Ecológico Holístico 360°
                  </h3>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 auto 16px', maxWidth: 460 }}>
                  Comparación multidimensional respecto al límite de sostenibilidad nacional.
                </p>

                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="s" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700 }} />
                      <Radar
                        dataKey="A"
                        stroke="#00d0ff"
                        fill="rgba(0, 208, 255, 0.25)"
                        fillOpacity={0.8}
                        dot={{ fill: '#ffffff', r: 5, strokeWidth: 0 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Bottom Actions & Sharing */}
            <div
              className="glass-panel"
              style={{
                borderRadius: 22,
                padding: '24px',
                textAlign: 'center',
                background: `linear-gradient(135deg, ${c.p}15, rgba(255,255,255,0.02))`,
                border: `1px solid ${c.border}`,
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{lv.g === 'A+' ? '🏆' : '🌱'}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
                {allDone ? '¡Has completado tu diagnóstico ecológico 360°!' : `¡Excelente! Ahora mide tus otros ejes`}
              </h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', maxWidth: 500, margin: '0 auto 20px' }}>
                {!allDone
                  ? `Para obtener tu perfil 360°, calcula también tu huella de ${
                      TABS.filter(t => !done[t.k] && t.k !== tab)
                        .map(t => t.l)
                        .join(' y ')
                    }.`
                  : 'Comparte tus resultados y motiva a tus amigos y familiares a ser parte del cambio.'}
              </p>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {/* Recalculate button */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setDone(dd => ({ ...dd, [tab]: false }));
                    setSteps(ss => ({ ...ss, [tab]: 0 }));
                  }}
                  style={{
                    padding: '12px 22px',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    fontFamily: 'inherit',
                  }}
                >
                  ↺ Recalcular {c.name}
                </button>

                {/* Other uncalculated tabs */}
                {TABS.filter(t => !done[t.k] && t.k !== tab).map(t => (
                  <button
                    key={t.k}
                    onClick={() => {
                      sound.playClick();
                      setTab(t.k);
                    }}
                    style={{
                      padding: '12px 22px',
                      borderRadius: 14,
                      border: 'none',
                      background: `linear-gradient(135deg, ${C[t.k].p}, ${C[t.k].s})`,
                      color: '#070b16',
                      fontWeight: 900,
                      fontSize: 13,
                      cursor: 'pointer',
                      boxShadow: `0 4px 20px ${C[t.k].g}`,
                      fontFamily: 'inherit',
                    }}
                  >
                    Calcular {t.i} {t.l} →
                  </button>
                ))}

                {/* Share Button */}
                <button
                  onClick={handleShareSummary}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 14,
                    border: 'none',
                    background: 'linear-gradient(135deg, #00d0ff, #22e55b)',
                    color: '#040810',
                    fontWeight: 900,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0, 208, 255, 0.4)',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{shareFeedback ? '✅ ¡Copiado al Portapapeles!' : '📤 Compartir Huella Completa'}</span>
                </button>
              </div>
            </div>

            {/* Footer citation */}
            <footer style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11, paddingBottom: 16 }}>
              Factores de emisión y consumo basados en MinAmbiente, IDEAM y promedios oficiales de Colombia 🇨🇴 · HuellaTotal
            </footer>
          </main>
        )}
      </div>
    </div>
  );
}
