import React, { useEffect, useState, useRef } from 'react';
import content from './data/content.json';
import { Play, Pause, Folder, Lock, Volume2, ShieldAlert, Terminal, FileText, ArrowDown } from 'lucide-react';

// 1. TERMINAL INTRO
const AccessTerminal = ({ onComplete }) => {
  const [logs, setLogs] = useState([]);
  const fullLogs = [
    "> INITIATING SECURE CONNECTION...",
    "> ACCESSING KGB_ARCHIVE_NODE_4",
    "> DECRYPTING FILE: DELO_18-54",
    "> BYPASSING FIREWALL...",
    "> AUTH_SUCCESS: ACCESS GRANTED",
    "> LOADING INTERFACE..."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullLogs.length) {
        setLogs(prev => [...prev, fullLogs[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="access-screen">
      <div style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
        <Terminal size={48} color="#0f0" style={{ marginBottom: '20px' }} />
        {logs.map((log, index) => <div key={index} style={{ marginBottom: '5px', fontSize: '0.9rem' }}>{log}</div>)}
        <div className="terminal-cursor">_</div>
      </div>
    </div>
  );
};

// 2. PRECISION FLASHLIGHT
const Flashlight = () => {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [active, setActive] = useState(false);
  useEffect(() => {
    const move = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      setPos({ x, y });
      setActive(true);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); };
  }, []);
  if (!active) return null;
  return (
    <>
      <div className="flashlight" style={{ left: pos.x, top: pos.y }}></div>
      <div className="flashlight-dot" style={{ left: pos.x, top: pos.y }}></div>
    </>
  );
};

// --- DYNAMIC TREE TIMELINE ---
const TreeTimeline = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="branching-timeline-section">
      <div className="container">
        <h2 className="reveal" style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '80px', fontFamily: 'var(--font-display)', color: '#fff' }}>ХРОНОГРАФ</h2>
        <div className="tree-viewport reveal">
          {!isMobile && <div className="tree-trunk-desktop"></div>}
          <svg className="tree-branch-container" viewBox={isMobile ? "0 0 800 1500" : "0 0 1400 500"}>
            {isMobile && (
              <line x1="400" y1="0" x2="400" y2="1500" stroke="var(--accent-color)" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
            )}
            
            {content.timeline.map((item, index) => {
              // Desktop: Horizontal
              const xBaseH = 100 + (index * (1150 / (content.timeline.length - 1)));
              const isUpH = index % 2 === 0;
              const yTrunkH = 250;
              const yEndH = isUpH ? 100 : 400;
              const xBendH = xBaseH + 40;

              // Mobile: Vertical
              const yBaseV = 100 + (index * 190);
              const isLeftV = index % 2 === 0;
              const xTrunkV = 400;
              const xEndV = isLeftV ? 50 : 750;
              const xBendV = isLeftV ? 250 : 550;
              const yBendV = yBaseV + 30;

              const pathData = isMobile 
                ? `M ${xTrunkV} ${yBaseV} L ${xBendV} ${yBendV} L ${isLeftV ? xEndV + 150 : xEndV - 150} ${yBendV}`
                : `M ${xBaseH} ${yTrunkH} L ${xBendH} ${yEndH} L ${xBendH + 120} ${yEndH}`;
              
              const xText = isMobile ? (isLeftV ? xEndV : xEndV - 140) : xBendH;
              const yText = isMobile ? (yBendV - 10) : (isUpH ? yEndH - 15 : yEndH + 45);

              return (
                <g key={item.id} className="branch-group">
                  <path d={pathData} className="branch-path" />
                  <g className="branch-node" onClick={(e) => {
                    e.stopPropagation();
                    const el = document.getElementById(item.id);
                    if (el) {
                      const rect = el.getBoundingClientRect();
                      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                      const targetY = rect.top + scrollTop - 80;
                      window.scrollTo({ top: targetY, behavior: 'smooth' });
                    }
                  }}>
                    <text x={xText} y={yText} className="node-year-text" style={{ fontSize: isMobile ? '1.8rem' : '2.2rem' }}>{item.year}</text>
                    <rect 
                       x={isMobile ? (isLeftV ? xEndV : xEndV - 150) : xBendH} 
                       y={isMobile ? (yBendV - 40) : (isUpH ? yEndH - 80 : yEndH)} 
                       width="150" height="100" fill="transparent" 
                    />
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
};

const EvidenceFolder = ({ item, index }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const containerRef = useRef(null);
  const linkedAudio = item.year === "1985" ? content.audio_archive[0] : (item.year === "1990" ? content.audio_archive[1] : null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsStarted(true); }, { threshold: 0.2 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [item.id]);

  useEffect(() => {
    if (isStarted && displayedText.length < item.description.length) {
      const timer = setTimeout(() => { setDisplayedText(item.description.slice(0, displayedText.length + 1)); }, 15);
      return () => clearTimeout(timer);
    }
  }, [isStarted, displayedText, item.description]);

  return (
    <div id={item.id} className="folder-wrapper reveal">
      <div className="folder-base"></div>
      <div className="folder-tab">FILE_REF: {index + 10}</div>
      <div ref={containerRef} className="evidence-folder">
        <div className="stamp">SECRET_ARCHIVE</div>
        <div className="folder-header">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.5 }}>VOL_{index + 203}</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-color)' }}>{item.year}</div>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', margin: '15px 0', lineHeight: 1.1 }}>{item.title}</h2>
        <p className="typewriter-text">{displayedText}</p>
        {linkedAudio && (
          <div className="wiretap-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'var(--accent-color)', padding: '10px', borderRadius: '50%' }}><Volume2 size={20} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>RECORDING_{item.year}</div>
                <audio controls src={linkedAudio.src} style={{ width: '100%', height: '35px', marginTop: '10px', filter: 'invert(1)' }} />
              </div>
            </div>
          </div>
        )}
        {item.media && item.media.type !== 'graphic' && (
          <div className="polaroid-frame">
            <img src={item.media.url} alt={item.media.caption} style={{ width: '100%', display: 'block' }} />
            <div className="polaroid-note">ПРИЛОЖЕНИЕ: {item.media.caption}</div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting && e.target.id) setActiveId(e.target.id); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('.folder-wrapper').forEach(el => obs.observe(el));
    const revObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));
    return () => { obs.disconnect(); revObs.disconnect(); };
  }, [loading]);

  if (loading) return <AccessTerminal onComplete={() => setLoading(false)} />;

  return (
    <div className="app">
      <div className="crt-overlay"></div>
      <Flashlight />
      
      <header style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="reveal">
          <ShieldAlert size={80} color="#ff1a1a" style={{ marginBottom: '30px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(4rem, 20vw, 15rem)', margin: 0, lineHeight: 0.8, fontWeight: 900, letterSpacing: '-10px' }}>ЗВЕРЬ</h1>
          <p style={{ fontFamily: 'var(--font-mono)', opacity: 0.4, marginTop: '30px' }}>АРХИВНОЕ ДЕЛО №18/54 // РОСТОВ-НА-ДОНУ</p>
        </div>
      </header>

      <nav className="sticky-nav">
        <div className="nav-container">
          {content.timeline.map(item => (
            <a key={item.id} href={`#${item.id}`} className={`nav-link ${activeId === item.id ? 'active' : ''}`}
               onClick={(e) => { 
                 e.preventDefault(); 
                 const el = document.getElementById(item.id); 
                 if (el) {
                   const rect = el.getBoundingClientRect();
                   const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                   const targetY = rect.top + scrollTop - 70;
                   window.scrollTo({ top: targetY, behavior: 'smooth' });
                 }
               }}>{item.year}</a>
          ))}
        </div>
      </nav>

      <TreeTimeline />

      <main style={{ position: 'relative', zIndex: 10 }}>
        <div className="evidence-stream">
          {content.timeline.map((item, index) => (
            <React.Fragment key={item.id}>
              <EvidenceFolder item={item} index={index} />
              {index < content.timeline.length - 1 && (
                <>
                  <div className="evidence-connector"></div>
                  <div className="forensic-tag"><span>UNIT</span>{index + 1}</div>
                </>
              )}
            </React.Fragment>
          ))}
        </div>

        <section className="close-case-section reveal">
          <div className="final-report-folder">
            <h2 className="close-case-title">ИТОГОВЫЙ <span>ОТЧЕТ</span></h2>
            <div className="inventory-list">
              <div className="inventory-category">
                <h4>БИБЛИОГРАФИЯ</h4>
                <ul>
                  <li><a href="https://rodina-history.ru/2025/11/20/35-let-nazad-byl-zaderzhan-maniak-chikatilo-imia-ego-stalo-sinonimom-absoliutnogo-zla.html?utm_referrer=https%3A%2F%2Fwww.google.com%2F" target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'none'}}>Как искали Чикатило (Родина)</a></li>
                  <li><a href="https://matzpen.ru/articles/zabolevaniya-i-rasstroystva/chikatilo-psikhopat-lishennyy-sovesti/" target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'none'}}>Психопатология: Портрет (Матцпен)</a></li>
                  <li><a href="https://petrovka-38.com/arkhiv/item/strashnyj-spisok-chikatilo" target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'none'}}>Страшный список (Петровка-38)</a></li>
                </ul>
              </div>
              <div className="inventory-category">
                <h4>АРХИВНЫЕ ИСТОЧНИКИ</h4>
                <ul>
                  <li><a href="https://www.gazeta.ru/science/2019/02/14_a_12182677.shtml" target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'none'}}>25 лет казни (Газета.ру)</a></li>
                </ul>
              </div>
            </div>
            <div className="final-lock-container">
               <Lock size={80} color="#fff" />
               <p className="final-status-text">ARCHIVE_CLOSED_LOCKED</p>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ padding: '60px 0', textAlign: 'center', opacity: 0.3, fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
        <p>© 2026 ИСТОРИЧЕСКИЙ ПРОЕКТ • ЭФФЕКТ ПРИСУТСТВИЯ</p>
      </footer>
    </div>
  );
}

export default App;
