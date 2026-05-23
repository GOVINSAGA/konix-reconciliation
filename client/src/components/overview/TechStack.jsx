import './TechStack.css';

const techs = [
  { name: 'NestJS', desc: 'Backend Framework', color: '#e0234e' },
  { name: 'MongoDB', desc: 'Database', color: '#47a248' },
  { name: 'React', desc: 'Frontend', color: '#61dafb' },
  { name: 'Vite', desc: 'Build Tool', color: '#646cff' },
  { name: 'Docker', desc: 'Containerization', color: '#2496ed' },
  { name: 'Nginx', desc: 'Reverse Proxy', color: '#009639' },
  { name: 'TypeScript', desc: 'Server Language', color: '#3178c6' },
  { name: 'Mongoose', desc: 'ODM', color: '#800' },
];

export default function TechStack() {
  return (
    <div className="tech-grid">
      {techs.map((t) => (
        <div key={t.name} className="glass-card tech-card">
          <div
            className="tech-dot"
            style={{ background: t.color, boxShadow: `0 0 12px ${t.color}40` }}
          />
          <div>
            <div className="tech-name">{t.name}</div>
            <div className="tech-desc">{t.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
