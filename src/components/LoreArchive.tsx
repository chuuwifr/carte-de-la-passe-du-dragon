import React, { useState } from "react";
import {
  BookOpen,
  Search,
  ExternalLink,
  Sparkles,
  Flame,
  Shield,
  Loader2,
  HelpCircle,
  Clock,
  Compass,
  FileText,
} from "lucide-react";
import { GLORANTHA_RUNES, GLORANTHA_CULTS, GLORANTHA_SEASONS } from "../data/gloranthaLore";
import { searchWikiSafe, fetchWikiPageSafe, getProceduralGloranthaLore } from "../utils/loreGenerator";

export const LoreArchive: React.FC = () => {
  const [activeSection, setActiveSection] = useState<"wiki" | "cults" | "runes" | "sage" | "timeline">("wiki");

  // Wiki Live Search State
  const [wikiQuery, setWikiQuery] = useState("Sartar");
  const [wikiSearchResults, setWikiSearchResults] = useState<any[]>([]);
  const [selectedWikiArticle, setSelectedWikiArticle] = useState<any | null>(null);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiArticleLoading, setWikiArticleLoading] = useState(false);

  // Lhankor Mhy Sage Question state
  const [sageQuestion, setSageQuestion] = useState("");
  const [sageAnswer, setSageAnswer] = useState<string | null>(null);
  const [sageLoading, setSageLoading] = useState(false);

  // Search Glorantha Wiki
  const handleWikiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!wikiQuery.trim()) return;

    setWikiLoading(true);
    try {
      const results = await searchWikiSafe(wikiQuery.trim());
      setWikiSearchResults(results);

      if (results && results.length > 0) {
        handleLoadWikiArticle(results[0].title);
      }
    } catch (err) {
      console.error("Wiki search failed:", err);
    } finally {
      setWikiLoading(false);
    }
  };

  // Load article content
  const handleLoadWikiArticle = async (title: string) => {
    setWikiArticleLoading(true);
    try {
      const pageData = await fetchWikiPageSafe(title);
      if (pageData) {
        setSelectedWikiArticle(pageData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWikiArticleLoading(false);
    }
  };

  // Ask Sage AI
  const handleAskSage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sageQuestion.trim()) return;

    setSageLoading(true);
    setSageAnswer(null);
    try {
      const res = await fetch("/api/gemini/generate-lore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: sageQuestion.trim(),
          type: "lore-inquiry",
          context: "Passe du Dragon 1625 ST, panthéons orlanthi et empire lunar, règles RuneQuest Roleplaying in Glorantha.",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setSageAnswer(data.text);
          return;
        }
      }
      // Client-side fallback for static GitHub Pages hosting
      const answer = getProceduralGloranthaLore("oracle", "Passe du Dragon", sageQuestion.trim());
      setSageAnswer(answer);
    } catch (err) {
      const answer = getProceduralGloranthaLore("oracle", "Passe du Dragon", sageQuestion.trim());
      setSageAnswer(answer);
    } finally {
      setSageLoading(false);
    }
  };

  return (
    <div id="lore-archive-view" className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-[#d1d1d6] font-sans animate-fade-in">
      {/* Top Banner */}
      <div className="bg-[#16161a]/95 rounded-2xl p-5 sm:p-6 border border-[#2d2d35] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#e2ba7d10] text-[#e2ba7d] border border-[#e2ba7d40]">
              Archives de Lhankor Mhy
            </span>
            <span className="text-xs text-[#8e8e93]">
              Encyclopédie & Connexion Wiki Fandom Glorantha
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e2ba7d] tracking-wide">
            Codex de Glorantha en Français
          </h1>
          <p className="text-xs sm:text-sm text-[#8e8e93] max-w-2xl mt-1 leading-relaxed">
            Consultez les chroniques, les mystères des cultes, le pouvoir des runes cosmiques et interrogez les érudits de Jonville.
          </p>
        </div>

        {/* Quick Nav Chips */}
        <div className="flex flex-wrap gap-2 bg-[#1a1a20] p-1.5 rounded-full border border-[#2d2d35]">
          <button
            onClick={() => setActiveSection("wiki")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSection === "wiki"
                ? "bg-[#e2ba7d] text-black shadow-md"
                : "text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-white/5"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" /> Wiki Fandom Direct
          </button>
          <button
            onClick={() => setActiveSection("cults")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSection === "cults"
                ? "bg-[#e2ba7d] text-black shadow-md"
                : "text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-white/5"
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Cultes Divins
          </button>
          <button
            onClick={() => setActiveSection("runes")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSection === "runes"
                ? "bg-[#e2ba7d] text-black shadow-md"
                : "text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Runes Cosmiques
          </button>
          <button
            onClick={() => setActiveSection("sage")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSection === "sage"
                ? "bg-[#e2ba7d] text-black shadow-md"
                : "text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-white/5"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> L'Érudit IA
          </button>
        </div>
      </div>

      {/* SECTION 1: WIKI FANDOM LIVE SEARCH & BROWSER */}
      {activeSection === "wiki" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left Column: Search & Results List */}
          <div className="space-y-4">
            <form onSubmit={handleWikiSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8e8e93] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={wikiQuery}
                  onChange={(e) => setWikiQuery(e.target.value)}
                  placeholder="Rechercher sur le Wiki Glorantha (ex: Dragon Pass, Sartar)..."
                  className="w-full bg-[#25252b] border border-[#3a3a45] rounded-full pl-9 pr-3 py-2 text-xs text-[#d1d1d6] placeholder-[#8e8e93] outline-none focus:border-[#e2ba7d]"
                />
              </div>
              <button
                type="submit"
                disabled={wikiLoading}
                className="px-4 py-2 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-xs rounded-full shadow-md flex items-center gap-1 transition"
              >
                {wikiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Chercher"}
              </button>
            </form>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#e2ba7d] uppercase tracking-wider block">
                Résultats du Wiki ({wikiSearchResults.length}) :
              </span>
              {wikiSearchResults.length === 0 ? (
                <div className="p-4 bg-[#16161a] rounded-xl border border-[#2d2d35] text-center text-xs text-[#8e8e93]">
                  Tapez un mot-clé pour interroger l'API du wiki Fandom officiel.
                </div>
              ) : (
                wikiSearchResults.map((res) => (
                  <div
                    key={res.pageId}
                    onClick={() => handleLoadWikiArticle(res.title)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      selectedWikiArticle?.title === res.title
                        ? "bg-[#1a1a20] border-[#e2ba7d] text-white shadow-lg"
                        : "bg-[#16161a]/80 border-[#2d2d35] text-[#d1d1d6] hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#e2ba7d]">{res.title}</h4>
                      <span className="text-[10px] text-[#8e8e93] font-mono">
                        {res.wordCount} mots
                      </span>
                    </div>
                    {res.snippet && (
                      <p className="text-[11px] text-[#8e8e93] line-clamp-2 mt-1 leading-relaxed">
                        {res.snippet}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Article Viewer */}
          <div className="lg:col-span-2 bg-[#16161a]/95 rounded-2xl p-6 border border-[#2d2d35] shadow-2xl flex flex-col space-y-4">
            {wikiArticleLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-[#8e8e93] space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#e2ba7d]" />
                <span className="text-xs">Chargement de l'article depuis glorantha.fandom.com...</span>
              </div>
            ) : selectedWikiArticle ? (
              <>
                <div className="flex items-center justify-between border-b border-[#2d2d35] pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-[#e2ba7d]">
                      {selectedWikiArticle.title}
                    </h2>
                    <span className="text-xs text-[#8e8e93] font-mono">
                      Page ID #{selectedWikiArticle.pageId}
                    </span>
                  </div>

                  <a
                    href={selectedWikiArticle.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-[#25252b] hover:bg-white/5 text-[#e2ba7d] border border-[#3a3a45] rounded-full text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <span>Article Original</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Render Article HTML safely */}
                <div
                  className="text-[#d1d1d6] text-xs sm:text-sm leading-relaxed prose prose-invert max-w-none space-y-3 overflow-y-auto max-h-[600px] p-2"
                  dangerouslySetInnerHTML={{
                    __html: selectedWikiArticle.html
                      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                      .replace(/href="\/wiki\//g, 'target="_blank" href="https://glorantha.fandom.com/wiki/'),
                  }}
                />
              </>
            ) : (
              <div className="text-center py-24 text-[#8e8e93] text-xs">
                Sélectionnez un article pour l'afficher en direct.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: CULTS & PANTHEONS */}
      {activeSection === "cults" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {GLORANTHA_CULTS.map((cult) => (
            <div
              key={cult.id}
              className="bg-[#16161a]/95 rounded-xl p-5 border border-[#2d2d35] shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#e2ba7d10] text-[#e2ba7d] border border-[#e2ba7d40]">
                    {cult.pantheon}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#e2ba7d]">{cult.name}</h3>
                <p className="text-xs text-[#8e8e93] mt-2 leading-relaxed">{cult.summary}</p>

                <div className="space-y-2 mt-4 pt-3 border-t border-[#2d2d35] text-xs">
                  <div>
                    <span className="text-[11px] text-[#d1d1d6] font-semibold block mb-1">Sorts Majeurs :</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cult.magicSpells.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-[#25252b] text-[#e2ba7d] rounded-full text-[10px] border border-[#3a3a45]"
                        >
                          ✦ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[11px] text-[#8e8e93] font-semibold block">Jour Saint :</span>
                    <span className="text-[#d1d1d6] text-[11px] font-medium">{cult.holyDays}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: RUNES COMPENDIUM */}
      {activeSection === "runes" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
          {GLORANTHA_RUNES.map((rune) => (
            <div
              key={rune.id}
              className="bg-[#16161a]/95 rounded-xl p-5 border border-[#2d2d35] shadow-xl space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl" style={{ color: rune.color }}>
                    {rune.symbol}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-[#8e8e93]">
                    {rune.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#e2ba7d] mt-2">
                  {rune.nameFr}
                </h3>
                <p className="text-xs text-[#8e8e93] mt-1 leading-relaxed">
                  {rune.description}
                </p>
              </div>

              <div className="text-[11px] text-[#8e8e93] pt-3 border-t border-[#2d2d35]">
                <span className="font-semibold text-[#d1d1d6] block mb-0.5">Dieux Associés :</span>
                <span>{rune.associatedGods.join(", ")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 4: LHANKOR MHY AI SAGE */}
      {activeSection === "sage" && (
        <div className="bg-[#16161a]/95 rounded-2xl p-6 sm:p-8 border border-[#2d2d35] shadow-2xl space-y-5 max-w-3xl mx-auto animate-fade-in">
          <div className="flex items-center gap-3.5 border-b border-[#2d2d35] pb-4">
            <div className="w-11 h-11 rounded-full bg-[#e2ba7d15] border border-[#e2ba7d40] flex items-center justify-center text-[#e2ba7d] text-lg">
              📜
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#e2ba7d]">
                L'Érudit à la Barbe Grise de Lhankor Mhy
              </h2>
              <p className="text-xs text-[#8e8e93]">
                Posez vos questions sur le lore, les mythes, les peuples ou l'histoire de la Passe du Dragon en 1625 ST.
              </p>
            </div>
          </div>

          <form onSubmit={handleAskSage} className="space-y-4">
            <textarea
              value={sageQuestion}
              onChange={(e) => setSageQuestion(e.target.value)}
              rows={3}
              placeholder="Ex: Quelle est l'origine du peuple Durulz (les Canards) ? Comment fonctionne la Glowline de l'Empire Lunar ? Quel est le rôle d'Argrath ?"
              className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl p-3.5 text-xs sm:text-sm text-[#d1d1d6] placeholder-[#8e8e93] focus:border-[#e2ba7d] outline-none resize-none"
              required
            />
            <button
              type="submit"
              disabled={sageLoading}
              className="w-full py-3 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-xs rounded-full shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {sageLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Consulter le Sage de Jonville</span>
            </button>
          </form>

          {sageAnswer && (
            <div className="p-5 bg-[#1a1a20] rounded-xl border border-[#2d2d35] text-[#d1d1d6] space-y-2 animate-fade-in text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              <span className="font-bold text-[#e2ba7d] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                ✦ Réponse de l'Érudit :
              </span>
              <div>{sageAnswer}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
