import React, { useState, useMemo } from 'react';
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

const C = {
  plastico: { p: '#ff6b35', s: '#ff9a6c', g: 'rgba(255,107,53,0.45)', bg: 'rgba(255,107,53,0.08)', t: '#ffb08a' },
  carbono:  { p: '#39ff14', s: '#70ff50', g: 'rgba(57,255,20,0.45)',  bg: 'rgba(57,255,20,0.08)',  t: '#9aff6a' },
  agua:     { p: '#00d4ff', s: '#44e8ff', g: 'rgba(0,212,255,0.45)',  bg: 'rgba(0,212,255,0.08)',  t: '#66eeff' },
};

const PQ = [
  { key: 'botellas', label: 'Botellas plásticas desechables por semana', hint: 'Agua, gaseosa, energizantes', emoji: '🍶', unit: 'bot/sem', max: 30, w: 0.025 * 52 },
  { key: 'bolsas',   label: 'Bolsas plásticas usadas por semana',        hint: 'Supermercado, tiendas, delivery', emoji: '🛍️', unit: 'bol/sem', max: 30, w: 0.005 * 52 },
  { key: 'envases',  label: 'Envases desechables por semana',            hint: 'Delivery, yogures, tarros', emoji: '🥡', unit: 'env/sem', max: 20, w: 0.050 * 52 },
  { key: 'comida',   label: 'Snacks con empaque plástico por semana',    hint: 'Dulces, alimentos procesados', emoji: '🍫', unit: 'v/sem', max: 20, w: 0.015 * 52 },
  { key: 'higiene',  label: 'Productos de higiene en plástico al mes',   hint: 'Champú, jabón, pasta dental', emoji: '🧴', unit: 'prod/mes', max: 15, w: 0.010 * 12 },
];

const CQ = [
  { key: 'carro',   label: 'Km en carro por día',                     hint: 'Promedio días hábiles', emoji: '🚗', unit: 'km/día', max: 100, calc: v => v * 0.21 * 365 },
  { key: 'moto',    label: 'Km en moto / transporte público por día', hint: 'Bus, metro, Transmilenio', emoji: '🚌', unit: 'km/día', max: 80, calc: v => v * 0.10 * 365 },
  { key: 'vuelos',  label: 'Vuelos cortos por año',                   hint: '<3h, ej. Bogotá-Medellín', emoji: '✈️', unit: 'vuelos/año', max: 20, calc: v => v * 255 },
  { key: 'carne',   label: 'Veces que comes carne roja por semana',   hint: 'Res, cerdo, cordero', emoji: '🥩', unit: 'v/sem', max: 14, calc: v => v * 3.3 * 52 },
  { key: 'energia', label: 'Consumo de energía del hogar',            hint: 'Promedio Col: 150 kWh/mes', emoji: '⚡', unit: 'kWh/mes', max: 500, calc: v => v * 0.126 * 12 },
];

const AQ = [
  { key: 'ducha',  label: 'Minutos en la ducha',                    hint: 'Promedio por ducha diaria', emoji: '🚿', unit: 'min/ducha', max: 30, calc: v => v * 9 * 365 },
  { key: 'ropa',   label: 'Lavadas de ropa por semana',             hint: 'Ciclo completo de lavadora', emoji: '👕', unit: 'lav/sem', max: 14, calc: v => v * 80 * 52 },
  { key: 'dieta',  label: 'Días con carne roja por semana',         hint: '1 porción ≈ 15.000 L agua virtual', emoji: '🥩', unit: 'días/sem', max: 7, calc: v => v * 15000 * 52 },
  { key: 'grifo',  label: '¿Dejas el grifo abierto al cepillarte?', hint: '1 = Nunca · 5 = Siempre', emoji: '🚰', unit: 'hábito (1-5)', max: 5, calc: v => v * 6 * 365 },
  { key: 'jardin', label: 'Riego de plantas/jardín por semana',     hint: 'Manguera o aspersor estándar', emoji: '🌱', unit: 'min/sem', max: 60, calc: v => v * 12 * 52 },
];

const NV = {
  plastico: [
    { max: 30, l: 'Eco Héroe', e: '🌿', g: 'A+' },
    { max: 55, l: 'Consciente', e: '♻️', g: 'B' },
    { max: 80, l: 'En Desarrollo', e: '⚡', g: 'C' },
    { max: Infinity, l: 'En Alerta', e: '🔥', g: 'D' },
  ],
  carbono: [
    { max: 2000, l: 'Neutro', e: '🌱', g: 'A+' },
    { max: 4000, l: 'Eficiente', e: '💚', g: 'B' },
    { max: 7000, l: 'Promedio', e: '⚠️', g: 'C' },
    { max: Infinity, l: 'Intensivo', e: '🏭', g: 'D' },
  ],
  agua: [
    { max: 500000, l: 'Ahorrador', e: '💎', g: 'A+' },
    { max: 900000, l: 'Moderado', e: '🌊', g: 'B' },
    { max: 1400000, l: 'Intenso', e: '⚠️', g: 'C' },
    { max: Infinity, l: 'Crítico', e: '🔴', g: 'D' },
  ],
};

const AVG = { plastico: 65, carbono: 5800, agua: 1095000 };
const getLv = (t, v) => NV[t].find(l => v <= l.max) || NV[t].at(-1);
const AQs = { plastico: PQ, carbono: CQ, agua: AQ };
const CC = {
  plastico: ['#ff6b35', '#ff8c5a', '#ffa07a', '#ffb59a', '#ffc8b5'],
  carbono:  ['#39ff14', '#5aff3c', '#7aff5a', '#9aff7a', '#baff9a'],
  agua:     ['#00d4ff', '#22e4ff', '#44eefc', '#66f5ff', '#88faff'],
};
const TABS = [
  { k: 'plastico', i: '🧴', l: 'Plástico' },
  { k: 'carbono',  i: '💨', l: 'Carbono' },
  { k: 'agua',     i: '💧', l: 'Agua' },
];

const fmt = (t, v) => {
  if (t === 'agua') return v < 1000 ? `${Math.round(v)} L` : `${Math.round(v / 1000).toLocaleString()}k L`;
  if (t === 'carbono') return v < 1000 ? `${Math.round(v)} kg` : `${(v / 1000).toFixed(2)} t CO₂`;
  return `${v.toFixed(1)} kg`;
};

function Ring({ value, max, color, size = 124, label, sub }) {
  const r = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(value / max, 1);
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color, lineHeight: 1.3 }}>{label}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(8,13,28,0.96)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '9px 14px', backdropFilter: 'blur(10px)' }}>
      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 2 }}>{label}</div>
      <div style={{ color: '#fff', fontWeight: 700 }}>{payload[0].value}</div>
    </div>
  );
};

const css = `
*{box-sizing:border-box;}
@keyframes floatUp{0%{transform:translateY(0) translateX(0);opacity:0}10%{opacity:0.45}85%{opacity:0.2}100%{transform:translateY(-100vh) translateX(var(--dx));opacity:0}}
@keyframes rotS{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes scIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes shr{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes pls{0%,100%{opacity:1}50%{opacity:.55}}
.glass{background:rgba(255,255,255,0.04);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,0.08)}
input[type=range]{-webkit-appearance:none;width:100%;background:transparent;cursor:pointer;outline:none}
input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:rgba(255,255,255,0.08)}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;margin-top:-8px;background:var(--tc,#fff);box-shadow:0 0 10px var(--tg,#fff5);transition:transform .14s}
input[type=range]::-webkit-slider-thumb:active{transform:scale(1.35)}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#090d1a}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
.tc{transition:all .25s}.tc:hover{filter:brightness(1.1);transform:translateY(-2px)}
`;

function Particles({ col }) {
  const pts = React.useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        sz: Math.random() * 3 + 1,
        del: Math.random() * 10,
        dur: Math.random() * 12 + 8,
        dx: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 40 + 15),
      })),
    []
  );
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {pts.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            bottom: -8,
            width: p.sz,
            height: p.sz,
            borderRadius: '50%',
            background: col,
            opacity: 0,
            boxShadow: `0 0 ${p.sz * 3}px ${col}`,
            '--dx': `${p.dx}px`,
            animation: `floatUp ${p.dur}s ${p.del}s infinite linear`,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('plastico');
  const [steps, setSteps] = useState({ plastico: 0, carbono: 0, agua: 0 });
  const [ans, setAns] = useState({
    plastico: { botellas: 0, bolsas: 0, envases: 0, comida: 0, higiene: 0 },
    carbono:  { carro: 5, moto: 5, vuelos: 1, carne: 3, energia: 150 },
    agua:     { ducha: 7, ropa: 2, dieta: 3, grifo: 2, jardin: 10 },
  });
  const [done, setDone] = useState({ plastico: false, carbono: false, agua: false });
  const [vis, setVis] = useState(true);
  const [d, setD] = useState('r');
  const [cop, setCop] = useState(false);

  const c = C[tab];
  const Q = AQs[tab];
  const step = steps[tab];
  const a = ans[tab];
  const isDone = done[tab];

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
    return { plastico: calc('plastico'), carbono: calc('carbono'), agua: calc('agua') };
  }, [ans]);

  const cur = fp[tab];
  const lv = getLv(tab, cur.total);
  const allDone = Object.values(done).every(Boolean);

  const go = next => {
    setD(next > step ? 'r' : 'l');
    setVis(false);
    setTimeout(() => {
      setSteps(s => ({ ...s, [tab]: next }));
      setVis(true);
    }, 210);
  };
  const setV = (key, val) => setAns(p => ({ ...p, [tab]: { ...p[tab], [key]: val } }));
  const q = Q[step];

  const liveP = () => {
    const v = a[q.key];
    const val = tab === 'plastico' ? v * q.w : q.calc(v);
    return fmt(tab, val);
  };

  const bar = Q.map(q2 => ({ name: q2.emoji, v: +(fmt(tab, cur.cats[q2.key]).replace(/[^0-9.]/g, '')) || 0 }));
  const pie = Q.map((q2, i) => ({ name: q2.emoji, value: +(fmt(tab, cur.cats[q2.key]).replace(/[^0-9.]/g, '')) || 0 })).filter(d2 => d2.value > 0);
  const radar = [
    { s: 'Plástico', A: Math.min((fp.plastico.total / (AVG.plastico * 2)) * 100, 100), f: 100 },
    { s: 'Carbono',  A: Math.min((fp.carbono.total / (AVG.carbono * 2)) * 100, 100), f: 100 },
    { s: 'Agua',     A: Math.min((fp.agua.total / (AVG.agua * 2)) * 100, 100), f: 100 },
  ];

  const tips = {
    plastico: [
      { i: '💧', t: 'Botella reutilizable', d: 'Elimina hasta 70% del plástico en bebidas', k: 'botellas', f: 0.7 },
      { i: '🛍️', t: 'Bolsas de tela', d: 'Reemplaza totalmente las bolsas', k: 'bolsas', f: 0.8 },
      { i: '🥗', t: 'Envases reutilizables', d: 'Lleva tu contenedor al delivery', k: 'envases', f: 0.6 },
      { i: '🧼', t: 'Productos sólidos', d: 'Shampoo en barra = -90%', k: 'higiene', f: 0.9 },
    ],
    carbono: [
      { i: '🚲', t: 'Movilidad activa', d: '1 día en bici/sem reduce ~800kg CO₂', k: 'carro', f: 0.2 },
      { i: '🌱', t: 'Dieta plant-based', d: 'Reducir carne 2 días/sem = -30%', k: 'carne', f: 0.3 },
      { i: '☀️', t: 'Energía renovable', d: 'Panel solar o tarifa verde = -80%', k: 'energia', f: 0.8 },
      { i: '✈️', t: 'Viaja con propósito', d: '1 vuelo menos = -255 kg CO₂', k: 'vuelos', f: 0.5 },
    ],
    agua: [
      { i: '⏱️', t: 'Duchas de 5 min', d: 'Reduce 40% del consumo en ducha', k: 'ducha', f: 0.4 },
      { i: '👗', t: 'Ciclo corto', d: 'Ahorra agua y energía en lavadora', k: 'ropa', f: 0.25 },
      { i: '🥦', t: 'Un día sin carne', d: 'Miles de litros ahorrados', k: 'dieta', f: 0.14 },
      { i: '🚰', t: 'Grifo eficiente', d: 'Cerrar al cepillarse = 6 L/min', k: 'grifo', f: 0.8 },
    ],
  };

  const diff = cur.total - AVG[tab];

  return (
    <div style={{ minHeight: '100vh', background: '#090d1a', color: '#fff', overflowX: 'hidden', position: 'relative', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
      <style>{css}</style>
      <Particles col={c.p} />
      <div style={{ position: 'fixed', top: '-18%', left: '-8%', width: '50vw', height: '50vw', borderRadius: '50%', background: `radial-gradient(circle,${c.g} 0%,transparent 68%)`, opacity: 0.12, pointerEvents: 'none', zIndex: 0, transition: 'background 1s' }} />
      <div style={{ position: 'fixed', bottom: '-18%', right: '-8%', width: '42vw', height: '42vw', borderRadius: '50%', background: `radial-gradient(circle,${c.g} 0%,transparent 68%)`, opacity: 0.09, pointerEvents: 'none', zIndex: 0, transition: 'background 1s' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 920, margin: '0 auto', padding: '0 14px 72px' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', paddingTop: 40, marginBottom: 32 }}>
          <div style={{ fontSize: 46, marginBottom: 8, animation: 'pls 3s ease infinite' }}>🌍</div>
          <h1
            style={{
              fontSize: 'clamp(28px,5vw,50px)',
              fontWeight: 900,
              letterSpacing: '-.03em',
              lineHeight: 1.1,
              marginBottom: 8,
              background: `linear-gradient(110deg,#fff 25%,${c.p} 55%,#fff 80%)`,
              backgroundSize: '200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shr 4s infinite linear',
            }}
          >
            HuellaTotal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 24 }}>
            Mide tu impacto ambiental completo · Colombia 🇨🇴
          </p>
          {Object.values(done).some(Boolean) && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {done.plastico && <span className="glass" style={{ borderRadius: 9, padding: '6px 13px', fontSize: 12, color: '#ffb08a' }}>🧴 {fmt('plastico', fp.plastico.total)}</span>}
              {done.carbono && <span className="glass" style={{ borderRadius: 9, padding: '6px 13px', fontSize: 12, color: '#9aff6a' }}>💨 {fmt('carbono', fp.carbono.total)}</span>}
              {done.agua && <span className="glass" style={{ borderRadius: 9, padding: '6px 13px', fontSize: 12, color: '#66eeff' }}>💧 {fmt('agua', fp.agua.total)}</span>}
            </div>
          )}
        </header>

        {/* Tabs */}
        <nav aria-label="Categorías de Huella" style={{ display: 'flex', gap: 3, padding: 4, borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)', marginBottom: 24 }}>
          {TABS.map(t => {
            const tc = C[t.k];
            const act = tab === t.k;
            return (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'clamp(11px,2.5vw,14px)',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  transition: 'all .3s',
                  background: act ? `${tc.p}1c` : 'transparent',
                  color: act ? tc.p : 'rgba(255,255,255,0.4)',
                  boxShadow: act ? `0 0 16px ${tc.g}44` : 'none',
                  position: 'relative',
                }}
              >
                {t.i} {t.l}
                {done[t.k] && <sup style={{ fontSize: 9, color: tc.t, marginLeft: 3 }}>✓</sup>}
                {act && <div style={{ position: 'absolute', bottom: 2, left: '25%', right: '25%', height: 2, borderRadius: 1, background: tc.p, boxShadow: `0 0 7px ${tc.g}` }} />}
              </button>
            );
          })}
        </nav>

        {!isDone ? (
          <main style={{ maxWidth: 520, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 40, background: `${c.p}14`, border: `1px solid ${c.p}2a`, color: c.t, fontSize: 12, fontWeight: 600 }}>
                {tab === 'plastico' ? '🧴 Consumo de Plástico' : tab === 'carbono' ? '💨 Emisiones CO₂' : '💧 Huella Hídrica'} · {Q.length} preguntas
              </span>
            </div>
            {/* Progress */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Pregunta {step + 1}/{Q.length}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: c.p }}>{Math.round(((step + 1) / Q.length) * 100)}%</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {Q.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, transition: 'all .4s', background: i <= step ? c.p : 'rgba(255,255,255,0.07)', boxShadow: i <= step ? `0 0 7px ${c.g}44` : 'none' }} />
                ))}
              </div>
            </div>

            {/* Question */}
            <div style={{ borderRadius: 20, padding: '28px 24px', marginBottom: 16, opacity: vis ? 1 : 0, transform: vis ? 'translateX(0)' : `translateX(${d === 'r' ? '20px' : '-20px'})`, transition: 'all .21s ease', background: 'rgba(255,255,255,0.035)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 44px rgba(0,0,0,0.44),inset 0 1px 0 rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 40, marginBottom: 9 }}>{q.emoji}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 5, lineHeight: 1.35 }}>{q.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>{q.hint}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 7 }}>
                <span style={{ fontSize: 50, fontWeight: 900, color: c.p, lineHeight: 1, textShadow: `0 0 28px ${c.g}` }}>{a[q.key]}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{q.unit}</span>
              </div>
              <div style={{ '--tc': c.p, '--tg': c.g }}>
                <input
                  type="range"
                  aria-label={q.label}
                  min="0"
                  max={q.max}
                  value={a[q.key]}
                  onChange={e => setV(q.key, +e.target.value)}
                  style={{ width: '100%', marginBottom: 3 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 18 }}>
                <span>0</span>
                <span>{q.max}</span>
              </div>
              <div style={{ padding: '11px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 9, background: c.bg, border: `1px solid ${c.p}22` }}>
                <span style={{ fontSize: 16 }}>📊</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  Equivale a <strong style={{ color: c.p }}>{liveP()}</strong> {tab === 'plastico' ? 'de plástico/año' : tab === 'carbono' ? 'de CO₂/año' : 'de agua/año'}
                </span>
              </div>
            </div>

            {/* Nav */}
            <div style={{ display: 'flex', gap: 9 }}>
              {step > 0 && (
                <button
                  onClick={() => go(step - 1)}
                  style={{ flex: 1, padding: '12px', borderRadius: 13, border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)', fontFamily: 'inherit' }}
                >
                  ← Atrás
                </button>
              )}
              <button
                onClick={() => {
                  if (step < Q.length - 1) go(step + 1);
                  else setDone(dd => ({ ...dd, [tab]: true }));
                }}
                style={{ flex: 2, padding: '12px', borderRadius: 13, border: 'none', background: `linear-gradient(135deg,${c.p},${c.s})`, color: '#040810', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 20px ${c.g}`, fontFamily: 'inherit' }}
              >
                {step < Q.length - 1 ? 'Siguiente →' : `Ver mi huella ${q.emoji}`}
              </button>
            </div>
          </main>
        ) : (
          <main style={{ animation: 'scIn .5s ease' }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ display: 'inline-block', marginBottom: 18 }}>
                <div style={{ borderRadius: 26, padding: '32px 48px', background: `radial-gradient(ellipse at 30% 20%,${c.p}18 0%,rgba(0,0,0,0) 65%)`, border: `1px solid ${c.p}28`, boxShaodw: `0 0 55px ${c.g}44,inset 0 1px 0 ${c.p}15`, backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 26, background: `conic-gradient(from 0deg,transparent 82%,${c.p}12 100%)`, animation: 'rotS 10s linear infinite' }} />
                  <div style={{ fontSize: 48, marginBottom: 5 }}>{lv.e}</div>
                  <div style={{ fontSize: 'clamp(52px,9vw,84px)', fontWeight: 900, color: c.p, lineHeight: 1, textShadow: `0 0 36px ${c.g},0 0 72px ${c.g}44` }}>
                    {fmt(tab, cur.total).split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                    {fmt(tab, cur.total).replace(/^[\d.,]+k?\s*/, '')} al año
                  </div>
                  <div style={{ display: 'inline-block', padding: '7px 20px', borderRadius: 40, background: `${c.p}1e`, border: `1px solid ${c.p}48`, color: c.p, fontWeight: 800, fontSize: 14, boxShadow: `0 0 16px ${c.g}55` }}>
                    {lv.l} · Grado {lv.g}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <div className="glass" style={{ borderRadius: 13, padding: '13px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: diff < 0 ? '#39ff14' : '#ff6b35' }}>
                    {diff < 0 ? '▼' : '▲'} {fmt(tab, Math.abs(diff))}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
                    {diff < 0 ? 'menos' : 'más'} que el promedio
                  </div>
                </div>
                <div className="glass" style={{ borderRadius: 13, padding: '13px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.75)' }}>{fmt(tab, AVG[tab])}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>promedio Colombia</div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginBottom: 16 }}>
              <div className="glass" style={{ borderRadius: 18, padding: 20, minWidth: 0 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Desglose por hábito</h3>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bar} barSize={26}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 13 }} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
                      <Tooltip content={<TT />} />
                      <Bar dataKey="v" radius={[7, 7, 0, 0]}>
                        {bar.map((_, i) => (
                          <Cell key={i} fill={CC[tab][i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass" style={{ borderRadius: 18, padding: 20, minWidth: 0 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Distribución</h3>
                {pie.length > 0 ? (
                  <div style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pie}
                          cx="50%"
                          cy="50%"
                          outerRadius={68}
                          innerRadius={30}
                          dataKey="value"
                          label={({ name, percent }) => (percent > 0.07 ? `${name} ${(percent * 100).toFixed(0)}%` : '')}
                          labelLine={false}
                          fontSize={11}
                        >
                          {pie.map((_, i) => (
                            <Cell key={i} fill={CC[tab][i]} />
                          ))}
                        </Pie>
                        <Tooltip content={<TT />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                    Mueve los sliders para ver datos
                  </div>
                )}
              </div>
            </div>

            {/* Rings */}
            <div className="glass" style={{ borderRadius: 18, padding: 24, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Posición vs referencias</h3>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                <Ring value={cur.total} max={AVG[tab] * 2.5} color={c.p} size={120} label={fmt(tab, cur.total)} sub="Tú" />
                <Ring value={AVG[tab]} max={AVG[tab] * 2.5} color="rgba(255,255,255,0.28)" size={100} label={fmt(tab, AVG[tab])} sub="Promedio Col." />
                <div style={{ flex: 1, minWidth: 180 }}>
                  {Q.map(q2 => (
                    <div key={q2.key} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{q2.emoji} {q2.key}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: c.p }}>{fmt(tab, cur.cats[q2.key])}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          style={{
                            height: '100%',
                            borderRadius: 2,
                            background: `linear-gradient(90deg,${c.p},${c.s})`,
                            width: `${cur.total > 0 ? Math.min((cur.cats[q2.key] / cur.total) * 100, 100) : 0}%`,
                            boxShadow: `0 0 7px ${c.g}`,
                            transition: 'width 1s cubic-bezier(.4,0,.2,1)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="glass" style={{ borderRadius: 18, padding: 22, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>💡 Acciones de alto impacto</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 10 }}>
                {tips[tab].map((t, i) => (
                  <div key={i} className="tc" style={{ borderRadius: 14, padding: '14px 16px', background: c.bg, border: `1px solid ${c.p}20`, cursor: 'default' }}>
                    <div style={{ fontSize: 26, marginBottom: 7 }}>{t.i}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{t.t}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 8, lineHeight: 1.4 }}>{t.d}</div>
                    <div style={{ fontWeight: 800, color: c.p, fontSize: 12 }}>Ahorro: {fmt(tab, cur.cats[t.k] * t.f)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar */}
            {allDone && (
              <div className="glass" style={{ borderRadius: 18, padding: 24, marginBottom: 16, textAlign: 'center', minWidth: 0 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🌍 Perfil Ambiental Completo</h3>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>% respecto al doble del promedio colombiano</p>
                <div style={{ width: '100%', height: 230 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radar}>
                      <PolarGrid stroke="rgba(255,255,255,0.07)" />
                      <PolarAngleAxis dataKey="s" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600 }} />
                      <Radar dataKey="A" stroke="#fff" fill="rgba(255,255,255,0.07)" fillOpacity={0.9} dot={{ fill: '#fff', r: 4, strokeWidth: 0 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <button
                  onClick={() => {
                    const txt = `🌎 Mi Huella Ambiental:\n🧴 Plástico: ${fmt('plastico', fp.plastico.total)}\n💨 Carbono: ${fmt('carbono', fp.carbono.total)}\n💧 Agua: ${fmt('agua', fp.agua.total)}\n— HuellaTotal 🌿`;
                    navigator.clipboard.writeText(txt).then(() => {
                      setCop(true);
                      setTimeout(() => setCop(false), 2500);
                    });
                  }}
                  style={{
                    padding: '11px 30px',
                    borderRadius: 40,
                    border: 'none',
                    background: 'linear-gradient(135deg,#ff6b35,#39ff14,#00d4ff)',
                    backgroundSize: '200%',
                    color: '#040810',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.38)',
                    marginTop: 12,
                    fontFamily: 'inherit',
                  }}
                >
                  {cop ? '✅ ¡Copiado!' : '📤 Compartir huella completa'}
                </button>
              </div>
            )}

            {/* CTA */}
            <div style={{ borderRadius: 20, padding: '26px 22px', textAlign: 'center', background: `linear-gradient(135deg,${c.p}18,${c.s}0c)`, border: `1px solid ${c.p}25`, boxShadow: `0 0 36px ${c.g}1e`, marginBottom: 16 }}>
              <div style={{ fontSize: 28, marginBottom: 9 }}>{lv.g === 'A+' ? '🎉' : '🌱'}</div>
              <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 7 }}>{lv.g === 'A+' ? '¡Excelente! Eres un referente 💚' : '¡Pequeños cambios, gran impacto!'}</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 20, fontSize: 13 }}>
                {!allDone
                  ? `Calcula también tu huella de ${tab === 'plastico' ? 'carbono y agua' : tab === 'carbono' ? 'plástico y agua' : 'plástico y carbono'}.`
                  : '¡Tienes tu perfil ambiental completo!'}
              </p>
              <div style={{ display: 'flex', gap: 9, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setDone(dd => ({ ...dd, [tab]: false }));
                    setSteps(ss => ({ ...ss, [tab]: 0 }));
                  }}
                  style={{ padding: '10px 20px', borderRadius: 13, border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)', fontFamily: 'inherit' }}
                >
                  ↺ Recalcular
                </button>
                {TABS.filter(t => !done[t.k] && t.k !== tab).map(t => (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    style={{ padding: '10px 20px', borderRadius: 13, border: 'none', background: `linear-gradient(135deg,${C[t.k].p},${C[t.k].s})`, color: '#040810', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: `0 4px 16px ${C[t.k].g}`, fontFamily: 'inherit' }}
                  >
                    {t.i} {t.l}
                  </button>
                ))}
                {allDone && (
                  <button
                    onClick={() => {
                      const txt = `🌎 Mi Huella Ambiental:\n🧴 Plástico: ${fmt('plastico', fp.plastico.total)}\n💨 Carbono: ${fmt('carbono', fp.carbono.total)}\n💧 Agua: ${fmt('agua', fp.agua.total)}\n— HuellaTotal 🌿`;
                      navigator.clipboard.writeText(txt).then(() => {
                        setCop(true);
                        setTimeout(() => setCop(false), 2500);
                      });
                    }}
                    style={{ padding: '10px 20px', borderRadius: 13, border: 'none', background: `linear-gradient(135deg,${c.p},${c.s})`, color: '#040810', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {cop ? '✅ ¡Copiado!' : '📤 Compartir'}
                  </button>
                )}
              </div>
            </div>

            <footer style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 11, paddingBottom: 8 }}>
              Datos basados en promedios Colombia · Cada acción cuenta 🌍
            </footer>
          </main>
        )}
      </div>
    </div>
  );
}
