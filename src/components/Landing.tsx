import { useEffect, useState } from 'react';
import {
  Gamepad2,
  Coffee,
  ArrowRight,
  Trophy,
  Loader2,
  Send,
  BookOpen,
  Target,
  PenTool,
  Sparkles,
  Code,
  Rocket,
  ExternalLink,
  Languages,
} from 'lucide-react';
import { useI18n } from '@/i18n';
import { fetchGames, fetchLeaderboard, type GameRecord, type LeaderboardEntry } from '@/lib/gameApi';
import { ContactForm } from './ContactForm';

interface LandingProps {
  onOpenGame: (gameId: string) => void;
}

export function Landing({ onOpenGame }: LandingProps) {
  const { t, lang, setLang } = useI18n();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});

  useEffect(() => {
    fetchGames().then((data) => {
      setGames(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    games.forEach(async (game) => {
      const entries = await fetchLeaderboard(game.id, 3);
      setLeaderboards((prev) => ({ ...prev, [game.id]: entries }));
    });
  }, [games]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-lg">Imperium Games</span>
          </div>
          <div className="flex items-center gap-1 md:gap-4">
            <button
              onClick={() => scrollToSection('what-we-do')}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer hidden md:block"
            >
              {t.nav.whatWeDo}
            </button>
            <button
              onClick={() => scrollToSection('games')}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              {t.nav.games}
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer hidden md:block"
            >
              {t.nav.about}
            </button>
            <button
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-800"
            >
              <Languages className="w-3.5 h-3.5" />
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <button
              onClick={() => scrollToSection('create')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition active:scale-95 cursor-pointer"
            >
              {t.nav.create}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-emerald-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {t.hero.badge}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-3 animate-[pulse_4s_ease-in-out_infinite]">
            Creamos juegos para ti
          </h1>
          <p className="text-xl text-emerald-300/70 font-light mb-6 tracking-wide">
            De tu idea a una experiencia jugable
          </p>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Explora una demo ahora o cuéntanos tu idea para crear un juego a tu medida. No necesitas iniciar sesión ni crear una cuenta para comenzar.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => scrollToSection('create')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all active:scale-95 hover:shadow-lg hover:shadow-emerald-500/30 cursor-pointer"
            >
              {t.hero.cta}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('create')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all active:scale-95 cursor-pointer"
            >
              Quiero crear mi juego
            </button>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section id="what-we-do" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t.whatWeDo.title}</h2>
            <p className="text-slate-400 text-sm">{t.whatWeDo.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Send, title: t.whatWeDo.step1Title, desc: t.whatWeDo.step1Desc },
              { icon: Code, title: t.whatWeDo.step2Title, desc: t.whatWeDo.step2Desc },
              { icon: Rocket, title: t.whatWeDo.step3Title, desc: t.whatWeDo.step3Desc },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-emerald-600/30 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-700/30 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <step.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-bold text-sm mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games showcase */}
      <section id="games" className="py-20 px-6 bg-slate-950/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Prueba un juego ahora</h2>
            <p className="text-slate-400 text-sm">Entra directamente: no necesitas registrarte.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          ) : games.length === 0 ? (
            <p className="text-center text-slate-500 py-16">{t.gamesSection.noGames}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="group bg-slate-900/60 border border-slate-800 hover:border-emerald-600/50 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-900/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-700/30 flex items-center justify-center">
                      <Coffee className="w-7 h-7 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-1 rounded-full">
                      {t.gamesSection.category}: {game.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-300 transition">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">
                      {game.framework}
                    </span>
                    {leaderboards[game.id]?.length > 0 && (
                      <div className="flex items-center gap-1 text-amber-400">
                        <Trophy className="w-3 h-3" />
                        <span className="text-[10px] font-bold">
                          {t.gamesSection.topScore}: {leaderboards[game.id][0].score}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onOpenGame(game.id)}
                    className="mt-4 w-full flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-600/10 hover:bg-emerald-600/20 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Jugar ahora — sin iniciar sesión
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create game / Contact form */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="w-6 h-6 text-emerald-400" />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-emerald-300 text-xs font-medium">
              {t.nav.create}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* About us */}
      <section id="about" className="py-20 px-6 bg-slate-950/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t.about.title}</h2>
            <p className="text-slate-400 text-sm">{t.about.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 mx-auto mb-4 flex items-center justify-center">
                <Code className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-bold">{t.about.diegoName}</h3>
              <p className="text-emerald-400 text-xs font-semibold mb-3">{t.about.diegoRole}</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{t.about.diegoBio}</p>
              <a
                href="https://inngiao.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition"
              >
                {t.about.visitSite}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 mx-auto mb-4 flex items-center justify-center">
                <PenTool className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-bold">{t.about.victorName}</h3>
              <p className="text-amber-400 text-xs font-semibold mb-3">{t.about.victorRole}</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{t.about.victorBio}</p>
              <a
                href="https://vitoserrano.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition"
              >
                {t.about.visitSite}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold">Creamos juegos para ti</span>
          </div>
          <p className="text-xs text-slate-500 mb-1">{t.footer.tagline}</p>
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Creamos juegos para ti. {t.footer.rights}
          </p>
        </div>
      </footer>
    </div>
  );
}
