import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Dices,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Tag,
  Shield,
  Flame,
  Users,
  MapPin,
  Save,
  Check,
  AlertCircle,
  Loader2,
  Archive,
} from "lucide-react";
import { Campaign, GMNote, PointOfInterest, RegionKey } from "../types";
import { DRAGON_PASS_LOCATIONS } from "../data/locations";
import { getProceduralGloranthaLore } from "../utils/loreGenerator";
import { exportFullAppState, downloadFullAppBackup } from "../utils/storage";

interface GmPlanningToolsProps {
  campaign: Campaign;
  onUpdateCampaign: (updater: (prev: Campaign) => Campaign) => void;
  locations: PointOfInterest[];
  onSelectLocationById: (poiId: string) => void;
  onImportCampaign: (jsonString: string) => void;
  onResetCampaign: () => void;
  onOpenBackupModal?: () => void;
}

export const GmPlanningTools: React.FC<GmPlanningToolsProps> = ({
  campaign,
  onUpdateCampaign,
  locations,
  onSelectLocationById,
  onImportCampaign,
  onResetCampaign,
  onOpenBackupModal,
}) => {
  const [activeSection, setActiveSection] = useState<"notes" | "encounter-gen" | "npc-gen" | "backup">("notes");

  // Notes state
  const [noteFilterTag, setNoteFilterTag] = useState<string>("all");
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState<GMNote["category"]>("session");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteLinkedPoi, setNewNoteLinkedPoi] = useState("");
  const [newNoteTags, setNewNoteTags] = useState("");

  // Encounter Generator state
  const [encounterRegion, setEncounterRegion] = useState<RegionKey>("sartar");
  const [encounterDanger, setEncounterDanger] = useState<number>(3);
  const [encounterResult, setEncounterResult] = useState<any | null>(null);
  const [encounterLoading, setEncounterLoading] = useState(false);

  // NPC Generator state
  const [npcCult, setNpcCult] = useState("Orlanth");
  const [npcTribu, setNpcTribu] = useState("Tribu Colymar");
  const [npcResult, setNpcResult] = useState<any | null>(null);
  const [npcLoading, setNpcLoading] = useState(false);

  // Backup state
  const [importJsonText, setImportJsonText] = useState("");
  const [backupSuccessToast, setBackupSuccessToast] = useState(false);

  // Save New Note
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const tagsArray = newNoteTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const note: GMNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      category: newNoteCategory,
      content: newNoteContent.trim(),
      linkedPoiId: newNoteLinkedPoi || undefined,
      tags: tagsArray,
      updatedAt: `1625 ST - Saison ${campaign.calendar.seasonIndex + 1}`,
    };

    onUpdateCampaign((prev) => ({
      ...prev,
      notes: [note, ...prev.notes],
    }));

    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteTags("");
    setShowNewNoteForm(false);
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdateCampaign((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== noteId),
    }));
  };

  // Generate Random Encounter with AI
  const handleGenerateEncounter = async () => {
    setEncounterLoading(true);
    setEncounterResult(null);
    try {
      const res = await fetch("/api/gemini/generate-lore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "encounter-generator",
          context: `Région: ${encounterRegion}, Niveau de menace: ${encounterDanger}/5, Saison en cours: Semaine ${campaign.calendar.weekNumber}.`,
          prompt: `Génère une table de rencontre aléatoire immersive et tactique pour RuneQuest dans la région de ${encounterRegion}. Détaille la créature ou groupe rencontré, leur motivation, la météo gloranthanne, et un trésor ou indice runique.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setEncounterResult(data.text);
          return;
        }
      }
      // Fallback for static hosting (GitHub Pages)
      const fallback = getProceduralGloranthaLore("encounter-generator", encounterRegion);
      setEncounterResult(fallback);
    } catch (err: any) {
      const fallback = getProceduralGloranthaLore("encounter-generator", encounterRegion);
      setEncounterResult(fallback);
    } finally {
      setEncounterLoading(false);
    }
  };

  // Generate NPC with AI
  const handleGenerateNPC = async () => {
    setNpcLoading(true);
    setNpcResult(null);
    try {
      const res = await fetch("/api/gemini/generate-lore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "npc-generator",
          context: `Culte: ${npcCult}, Origine: ${npcTribu}. Année: 1625 ST.`,
          prompt: `Génère une fiche de PNJ complète pour RuneQuest Glorantha : Nom, Rôle, Description physique, Runes majeures (avec %), Passions, Sorts runiques connus, Secrets ou dilemme personnel pour le Maître de Jeu.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setNpcResult(data.text);
          return;
        }
      }
      // Fallback for static hosting (GitHub Pages)
      const fallback = getProceduralGloranthaLore("npc-generator", `${npcTribu} / ${npcCult}`);
      setNpcResult(fallback);
    } catch (err: any) {
      const fallback = getProceduralGloranthaLore("npc-generator", `${npcTribu} / ${npcCult}`);
      setNpcResult(fallback);
    } finally {
      setNpcLoading(false);
    }
  };

  // Export Complete App Backup
  const handleDownloadBackup = async () => {
    try {
      const fullBackup = await exportFullAppState(campaign);
      downloadFullAppBackup(fullBackup);
    } catch (e) {
      // Fallback to simple JSON export
      const jsonString = JSON.stringify(campaign, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = url;
      downloadAnchor.download = `runequest_campagne_${Date.now()}.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div id="gm-planning-view" className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-[#d1d1d6] font-sans animate-fade-in">
      {/* Top Banner */}
      <div className="bg-[#16161a]/95 rounded-2xl p-5 sm:p-6 border border-[#2d2d35] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#e2ba7d10] text-[#e2ba7d] border border-[#e2ba7d40]">
              Outils du Maître de Jeu
            </span>
            <span className="text-xs text-[#8e8e93]">
              Planification, Rencontres, PNJ & Sauvegarde locale
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e2ba7d] tracking-wide">
            Atelier de Gestion de Campagne
          </h1>
          <p className="text-xs sm:text-sm text-[#8e8e93] max-w-2xl mt-1 leading-relaxed">
            Préparez vos sessions, lancez des tables de rencontres aléatoires, rédigez vos notes secrètes et exportez vos sauvegardes de jeu.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex flex-wrap gap-2 bg-[#1a1a20] p-1.5 rounded-full border border-[#2d2d35]">
          <button
            onClick={() => setActiveSection("notes")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSection === "notes" ? "bg-[#e2ba7d] text-black font-bold shadow-md" : "text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-white/5"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Carnet de Notes ({campaign.notes.length})
          </button>
          <button
            onClick={() => setActiveSection("encounter-gen")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSection === "encounter-gen" ? "bg-[#e2ba7d] text-black font-bold shadow-md" : "text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-white/5"
            }`}
          >
            <Dices className="w-3.5 h-3.5" /> Rencontres Aléatoires
          </button>
          <button
            onClick={() => setActiveSection("npc-gen")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSection === "npc-gen" ? "bg-[#e2ba7d] text-black font-bold shadow-md" : "text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-white/5"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Générateur de PNJ
          </button>
          <button
            onClick={() => setActiveSection("backup")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSection === "backup" ? "bg-[#e2ba7d] text-black font-bold shadow-md" : "text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-white/5"
            }`}
          >
            <Save className="w-3.5 h-3.5" /> Sauvegarde sur Site
          </button>
        </div>
      </div>

      {/* SECTION 1: CARNET DE NOTES MJ */}
      {activeSection === "notes" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#e2ba7d]">
              Notes de Session & Indices Cachés
            </h2>
            <button
              onClick={() => setShowNewNoteForm(true)}
              className="px-4 py-2 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-xs rounded-full flex items-center gap-1.5 shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" /> Rédiger une Nouvelle Note
            </button>
          </div>

          {/* New Note Form Card */}
          {showNewNoteForm && (
            <form
              onSubmit={handleCreateNote}
              className="bg-[#16161a]/95 p-5 sm:p-6 rounded-2xl border border-[#2d2d35] shadow-2xl space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-[#2d2d35] pb-3">
                <span className="font-bold text-[#e2ba7d] text-sm">Nouvelle Fiche de Note</span>
                <button
                  type="button"
                  onClick={() => setShowNewNoteForm(false)}
                  className="text-[#8e8e93] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs text-[#8e8e93] block mb-1">Titre de la note</label>
                  <input
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="Ex: Entrevue avec le Chaman de Pointe-Canard"
                    className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3.5 py-2 text-xs text-[#d1d1d6] placeholder-[#8e8e93] outline-none focus:border-[#e2ba7d]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8e8e93] block mb-1">Catégorie</label>
                  <select
                    value={newNoteCategory}
                    onChange={(e) => setNewNoteCategory(e.target.value as any)}
                    className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-2 text-xs text-[#d1d1d6] outline-none focus:border-[#e2ba7d]"
                  >
                    <option value="session">Compte-rendu de Session</option>
                    <option value="lore">Lore & Mythologie</option>
                    <option value="npc">PNJ & Faction</option>
                    <option value="clue">Indice & Rumeur</option>
                    <option value="treasure">Trésor & Butin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8e8e93] block mb-1">Lier à un site de la Passe</label>
                  <select
                    value={newNoteLinkedPoi}
                    onChange={(e) => setNewNoteLinkedPoi(e.target.value)}
                    className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-2 text-xs text-[#d1d1d6] outline-none focus:border-[#e2ba7d]"
                  >
                    <option value="">-- Aucun lieu lié --</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.nameFr} ({loc.regionLabelFr})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#8e8e93] block mb-1">Tags (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={newNoteTags}
                    onChange={(e) => setNewNoteTags(e.target.value)}
                    placeholder="Ex: Durulz, Rumeur, Dragon, Orlanth"
                    className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3.5 py-2 text-xs text-[#d1d1d6] placeholder-[#8e8e93] outline-none focus:border-[#e2ba7d]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#8e8e93] block mb-1">Contenu</label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={4}
                  placeholder="Détails, dialogues clés, secrets découverts, conséquences..."
                  className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl p-3.5 text-xs text-[#d1d1d6] placeholder-[#8e8e93] outline-none focus:border-[#e2ba7d] resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewNoteForm(false)}
                  className="px-4 py-2 rounded-full bg-[#25252b] border border-[#3a3a45] text-[#8e8e93] hover:text-[#d1d1d6] text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-xs rounded-full shadow-md transition"
                >
                  Enregistrer la Note
                </button>
              </div>
            </form>
          )}

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaign.notes.map((note) => {
              const linkedLocation = locations.find((l) => l.id === note.linkedPoiId);

              return (
                <div
                  key={note.id}
                  className="bg-[#16161a]/95 rounded-2xl p-5 border border-[#2d2d35] shadow-xl space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#e2ba7d10] text-[#e2ba7d] border border-[#e2ba7d40]">
                          {note.category}
                        </span>
                        <h3 className="text-base font-bold text-[#e2ba7d] mt-1.5">
                          {note.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-[#8e8e93] hover:text-red-400 p-1 transition"
                        title="Supprimer la note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-[#8e8e93] mt-2 whitespace-pre-line leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#2d2d35] space-y-2 text-[11px] text-[#8e8e93]">
                    {linkedLocation && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[#e2ba7d] font-medium">
                          <MapPin className="w-3.5 h-3.5" /> {linkedLocation.nameFr}
                        </span>
                        <button
                          onClick={() => onSelectLocationById(linkedLocation.id)}
                          className="text-xs text-[#e2ba7d] hover:underline font-semibold"
                        >
                          Voir sur la carte ➔
                        </button>
                      </div>
                    )}

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {note.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#25252b] rounded-full text-[10px] text-[#8e8e93] border border-[#3a3a45]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: ENCOUNTER GENERATOR */}
      {activeSection === "encounter-gen" && (
        <div className="bg-[#16161a]/95 rounded-2xl p-6 sm:p-8 border border-[#2d2d35] shadow-2xl space-y-5 max-w-3xl mx-auto animate-fade-in">
          <div className="flex items-center gap-3 border-b border-[#2d2d35] pb-4">
            <div className="w-10 h-10 rounded-full bg-[#e2ba7d15] border border-[#e2ba7d40] flex items-center justify-center text-[#e2ba7d]">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#e2ba7d]">
                Générateur de Rencontres Aléatoires Gloranthiennes
              </h2>
              <p className="text-xs text-[#8e8e93]">
                Créez des situations dynamiques ancrées dans la géographie et les tensions de la Passe du Dragon.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#8e8e93] block mb-1">Région Traversée</label>
              <select
                value={encounterRegion}
                onChange={(e) => setEncounterRegion(e.target.value as RegionKey)}
                className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-2.5 text-xs text-[#d1d1d6] outline-none focus:border-[#e2ba7d]"
              >
                <option value="sartar">Sartar (Collines & Tribus Orlanthi)</option>
                <option value="prax">Prax (Plaines des Nomades & Oasis)</option>
                <option value="tarsh">Tarsh (Province & Patrouilles Lunars)</option>
                <option value="esrolia">Esrolia (Mares & Terres d'Ernalda)</option>
                <option value="grazelands">Pâturages (Reine-Cheval Pure)</option>
                <option value="dagori_inkarth">Dâgori Inkarth (Royaume Troll)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#8e8e93] block mb-1">Degré de Péril</label>
              <select
                value={encounterDanger}
                onChange={(e) => setEncounterDanger(Number(e.target.value))}
                className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3 py-2.5 text-xs text-[#d1d1d6] outline-none focus:border-[#e2ba7d]"
              >
                <option value={1}>1 - Embuscade Mineure / Voyageurs</option>
                <option value={2}>2 - Patrouille Rivale / Esprit Local</option>
                <option value={3}>3 - Créatures Sauvages / Broos du Chaos</option>
                <option value={4}>4 - Raid Guerrier / Monstre Antique</option>
                <option value={5}>5 - Péril Mortel / Émanation Draconique</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateEncounter}
            disabled={encounterLoading}
            className="w-full py-3 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-xs rounded-full shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {encounterLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Dices className="w-4 h-4" />
            )}
            <span>Tirer une Rencontre Immersive (IA)</span>
          </button>

          {encounterResult && (
            <div className="p-5 bg-[#1a1a20] rounded-xl border border-[#2d2d35] text-[#d1d1d6] space-y-2 animate-fade-in text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              <span className="font-bold text-[#e2ba7d] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                ✦ Rencontre générée :
              </span>
              <div>{encounterResult}</div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: NPC GENERATOR */}
      {activeSection === "npc-gen" && (
        <div className="bg-[#16161a]/95 rounded-2xl p-6 sm:p-8 border border-[#2d2d35] shadow-2xl space-y-5 max-w-3xl mx-auto animate-fade-in">
          <div className="flex items-center gap-3 border-b border-[#2d2d35] pb-4">
            <div className="w-10 h-10 rounded-full bg-[#e2ba7d15] border border-[#e2ba7d40] flex items-center justify-center text-[#e2ba7d]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#e2ba7d]">
                Générateur de PNJ & Faction RuneQuest
              </h2>
              <p className="text-xs text-[#8e8e93]">
                Générez des profils complets avec cultes, runes, passions et motivations profondes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#8e8e93] block mb-1">Culte Divin</label>
              <input
                type="text"
                value={npcCult}
                onChange={(e) => setNpcCult(e.target.value)}
                placeholder="Ex: Orlanth, Ernalda, Humakt, Issaries"
                className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3.5 py-2.5 text-xs text-[#d1d1d6] placeholder-[#8e8e93] outline-none focus:border-[#e2ba7d]"
              />
            </div>
            <div>
              <label className="text-xs text-[#8e8e93] block mb-1">Origine / Faction</label>
              <input
                type="text"
                value={npcTribu}
                onChange={(e) => setNpcTribu(e.target.value)}
                placeholder="Ex: Tribu Colymar, Marchands d'Issaries"
                className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl px-3.5 py-2.5 text-xs text-[#d1d1d6] placeholder-[#8e8e93] outline-none focus:border-[#e2ba7d]"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateNPC}
            disabled={npcLoading}
            className="w-full py-3 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-xs rounded-full shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {npcLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Générer la Fiche Complète du PNJ (IA)</span>
          </button>

          {npcResult && (
            <div className="p-5 bg-[#1a1a20] rounded-xl border border-[#2d2d35] text-[#d1d1d6] space-y-2 animate-fade-in text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              <span className="font-bold text-[#e2ba7d] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                ✦ Profil de PNJ RuneQuest :
              </span>
              <div>{npcResult}</div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: BACKUP & LOCAL PERSISTENCE */}
      {activeSection === "backup" && (
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
          {/* Top banner linking to full backup modal */}
          {onOpenBackupModal && (
            <div className="bg-[#1f1f26] border border-[#e2ba7d50] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e2ba7d20] border border-[#e2ba7d40] flex items-center justify-center text-[#e2ba7d] shrink-0">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Centre de Sauvegarde & Restauration Intégrale
                  </h3>
                  <p className="text-xs text-[#8e8e93]">
                    Exportez ou restaurez 100% de l'application (campagne, carte PDF, tracés de guerre, calques) via une interface dédiée.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenBackupModal}
                className="px-4 py-2 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Ouvrir le Centre de Sauvegarde</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export card */}
            <div className="bg-[#16161a]/95 rounded-2xl p-6 border border-[#2d2d35] shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-4 h-4 text-[#e2ba7d]" />
                  <h3 className="text-base font-bold text-[#e2ba7d]">Exporter l'Archive Complète</h3>
                </div>
                <p className="text-xs text-[#8e8e93] leading-relaxed">
                  Téléchargez l'intégralité de vos héros, quêtes, marqueurs, tracés militaires, notes de session et calendrier sous format fichier JSON pour archivage local ou partage.
                </p>
              </div>

              <button
                onClick={handleDownloadBackup}
                className="w-full py-3 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-xs rounded-full shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le Fichier .JSON</span>
              </button>
            </div>

            {/* Import card */}
            <div className="bg-[#16161a]/95 rounded-2xl p-6 border border-[#2d2d35] shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-[#e2ba7d]" />
                  <h3 className="text-base font-bold text-[#e2ba7d]">Restaurer / Importer une Sauvegarde</h3>
                </div>
                <p className="text-xs text-[#8e8e93] leading-relaxed mb-3">
                  Collez le contenu d'un fichier JSON de campagne ou d'archive complète pour restaurer votre état de jeu.
                </p>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  rows={3}
                  placeholder="Collez ici le JSON de sauvegarde..."
                  className="w-full bg-[#25252b] border border-[#3a3a45] rounded-xl p-3 text-xs font-mono text-[#d1d1d6] outline-none focus:border-[#e2ba7d] resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!importJsonText.trim()) return;
                    onImportCampaign(importJsonText.trim());
                    setImportJsonText("");
                  }}
                  className="flex-1 py-2.5 bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-bold text-xs rounded-full shadow-md transition"
                >
                  Restaurer
                </button>
                <button
                  onClick={() => {
                    onResetCampaign();
                  }}
                  className="px-4 py-2.5 bg-[#25252b] border border-[#3a3a45] hover:bg-red-950/50 hover:border-red-800 text-[#8e8e93] hover:text-red-300 text-xs rounded-full transition"
                  title="Remettre la campagne aux valeurs par défaut"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
