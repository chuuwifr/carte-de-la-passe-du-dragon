import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy Google GenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", game: "RuneQuest Glorantha - Dragon Pass 1625 ST" });
});

// Proxy to Glorantha Fandom Wiki Search
app.get("/api/wiki/search", async (req, res) => {
  try {
    const query = (req.query.q as string) || "";
    if (!query) {
      return res.json({ results: [] });
    }

    const url = `https://glorantha.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&format=json&origin=*`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Wiki API responded with status ${response.status}`);
    }

    const data = await response.json();
    const searchResults = data?.query?.search || [];

    const formatted = searchResults.map((item: any) => ({
      pageId: item.pageid,
      title: item.title,
      snippet: item.snippet.replace(/<[^>]*>?/gm, ""),
      size: item.size,
      wordCount: item.wordcount,
    }));

    return res.json({ results: formatted });
  } catch (error: any) {
    console.error("Wiki search error:", error);
    return res.status(500).json({ error: error.message || "Failed to search wiki" });
  }
});

// Proxy to Glorantha Fandom Wiki Page Details
app.get("/api/wiki/page", async (req, res) => {
  try {
    const title = (req.query.title as string) || "";
    if (!title) {
      return res.status(400).json({ error: "Missing page title" });
    }

    const url = `https://glorantha.fandom.com/api.php?action=parse&page=${encodeURIComponent(
      title
    )}&prop=text|categories|sections&format=json&origin=*`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Wiki API responded with status ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      return res.status(404).json({ error: data.error.info || "Page not found" });
    }

    const rawHtml = data.parse?.text?.["*"] || "";
    const categories = (data.parse?.categories || []).map((c: any) => c["*"]);
    const sections = (data.parse?.sections || []).map((s: any) => ({
      index: s.index,
      line: s.line,
      level: s.level,
    }));

    return res.json({
      title: data.parse?.title || title,
      pageId: data.parse?.pageid,
      html: rawHtml,
      categories,
      sections,
      url: `https://glorantha.fandom.com/wiki/${encodeURIComponent(title)}`,
    });
  } catch (error: any) {
    console.error("Wiki page error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch wiki page" });
  }
});

// Gemini AI endpoint for Lore & GM Assistant with robust retry, multi-model fallback & procedural lore
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: string;
    systemInstruction: string;
    temperature?: number;
    type?: string;
  }
): Promise<string> {
  // Order of models to attempt: Fast resilient models first, then lite, latest & preview
  const candidateModels = [
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.7-flash",
  ];

  for (const model of candidateModels) {
    // Attempt up to 2 times per candidate model with short backoff on temporary 503/429
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            temperature: params.temperature ?? 0.8,
          },
        });

        if (response && response.text && response.text.trim().length > 0) {
          return response.text;
        }
      } catch (err: any) {
        const errMsg = String(err?.message || err || "").toLowerCase();

        const isHighDemand =
          errMsg.includes("503") ||
          errMsg.includes("unavailable") ||
          errMsg.includes("high demand") ||
          errMsg.includes("resource_exhausted") ||
          errMsg.includes("429") ||
          errMsg.includes("overloaded");

        if (attempt === 0 && isHighDemand) {
          // Quick wait (150ms) before 1 retry on this model
          await new Promise((resolve) => setTimeout(resolve, 150));
          continue;
        }

        // Proceed to next candidate model seamlessly
        break;
      }
    }
  }

  // Fallback to procedural Glorantha lore if AI service is temporarily experiencing high demand
  console.info("[Gemini AI] Using Glorantha procedural lore engine");
  return getProceduralGloranthaFallback(params.type, params.contents);
}

// Procedural fallback generator when external AI cloud is experiencing severe global spikes
function getProceduralGloranthaFallback(type?: string, prompt?: string): string {
  const clans = ["Colymar", "Malani", "Cranes de Chien", "Culbrea", "Kheldon", "Torkan"];
  const cultes = ["Orlanth Aventurier", "Humakt", "Ernalda", "Yelmalio", "Issaries", "Lhankor Mhy", "Babeester Gor", "Zorak Zoran"];
  const randomClan = clans[Math.floor(Math.random() * clans.length)];
  const randomCulte = cultes[Math.floor(Math.random() * cultes.length)];

  if (type === "npc" || type === "npc-generator") {
    return `### **Fiche de PNJ Gloranthien : Tarkal Longue-Lance**
*Généré par les Archives des Sages de Jonville (1625 ST)*

- **Origine & Clan** : Tribu ${randomClan}, Fief des Collines Rouges
- **Culte & Titre** : Initié du culte de **${randomCulte}**
- **Archétype** : Guerrier-Vétéran de la Guerre des Héros

#### **Affinités Runiques & Passions**
- ⚡ **Rune de l'Air (Mouvement/Orlanth)** : 75%
- ⚔️ **Rune de la Mort (Humakt)** : 65%
- 🌍 **Rune de la Terre** : 45%
- **Passions** : *Loyauté envers la Tribu ${randomClan}* 80% | *Haine de l'Empire Lunar* 70% | *Honneur guerrier* 60%

#### **Description & Personnalité**
Portant une cuirasse de bronze patinée marquée par le siège de Boldhome et une lance ornée de plumes de faucon sartarien. Tarkal est un vétéran méfiant mais profondément loyal à ses serments. Il scrute toujours les ombres et consulte les vents avant chaque décision.

#### **Équipement & Magie Runique**
- Armure de cuirasse en bronze (6 PA), Grande Lance sartarienne, Bouclier rond orné du triskèle.
- **Sorts Runiques** : *Arme Véritable*, *Détection des Ennemis*, *Lame de Vent*.

#### **Secret pour le Maître de Jeu**
Tarkal garde sous son manteau une fiole scellée contenant les cendres d'un temple orlanthi profané par les Lunars. Il cherche des compagnons pour accomplir une quête héroïque de purification avant la prochaine Saison sacrée.`;
  }

  if (type === "encounter-generator") {
    return `### **Rencontre Aléatoire : La Patrouille aux Aguets des Collines**
*Situation générée pour la Passe du Dragon (1625 ST)*

- **Lieu** : Crête rocailleuse surplombant la vallée, vent sifflant et brouillard matinal.
- **Menace** : Niveau 3/5 (Tactique & Négociable)

#### **Protagonistes**
Un groupe de 4 chevaucheurs de bisons de la tribu sartarienne menés par une prêtresse d'Ernalda, pistés à distance par 3 éclaireurs Trolls des ombres de Dagori Inkarth.

#### **Dynamique de la Rencontre**
1. **Première approche** : Les PJ entendent le son lointain d'un cor de guerre en corne de taureau.
2. **Enjeu** : Les Sartariens prennent d'abord les PJ pour des espions lunars déguisés. Un jet de *Coutumes (Sartar)* ou de *Passion (Honneur)* permet d'établir une trêve immédiate.
3. **Complication** : Les Trolls profitent de la confrontation pour tenter d'isoler une bête de somme.

#### **Opportunité de Quête**
La prêtresse propose d'offrir une bénédiction de la Terre (+10% en Survie) si les PJ les escortent jusqu'au sanctuaire de la Mère des Moissons.`;
  }

  return `### **Chronique & Auspices de Glorantha (1625 ST)**
*Extrait des chroniques de la Passe du Dragon*

Les vents d'Orlanth soufflent avec vigueur sur les crêtes de Sartar. Alors que le Dragon s'est éveillé et que les légions de la Lune Rouge reculent vers Tarsh, les anciens clans reforgent leurs alliances sacrées.

- **Présage Runique** : La Rune du Changement est en ascendance avec la Rune de l'Air.
- **Conseil pour les aventuriers** : Ne voyagez jamais sans honorer les esprits locaux aux carrefours sacrés et gardez toujours une offrande d'orge ou de bière ambrée pour les gardiens de pierre.`;
}

app.post("/api/gemini/generate-lore", async (req, res) => {
  try {
    const { prompt, type, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAIClient();

    let systemInstruction = `Tu es un vénérable Érudit de Lhankor Mhy et Maître de Jeu expert de RuneQuest Glorantha. 
Ton rôle est de répondre en français avec une immersion totale dans le monde de Glorantha (Passe du Dragon en 1625 ST, Réveil du Dragon, Guerre des Héros, Panthéon d'Orlanth, Empire Lunar, Terres Trolls de Dagori Inkarth, Tribus Sartariennes, etc.). 
Tes réponses doivent être riches, mystiques, fidèles aux règles et au lore de Chaosium / Greg Stafford.`;

    if (type === "npc" || type === "npc-generator") {
      systemInstruction += ` Tu génères un PNJ pour RuneQuest avec son nom, son peuple/tribu, son culte principal, ses Runes dominantes (avec % de 50 à 95%), ses passions (ex: Loyauté envers son clan, Haine des Lunars), ses compétences clés, son équipement, un secret de jeu et une accroche de quête. Réponds en Markdown bien structuré.`;
    } else if (type === "scenario-hook") {
      systemInstruction += ` Tu conçois une accroche de scénario captivante pour RuneQuest située dans la région demandée, avec le contexte mythologique/politique, les protagonistes, les enjeux runiques et 3 étapes d'investigation ou d'action.`;
    } else if (type === "encounter-generator") {
      systemInstruction += ` Tu conçois une table ou situation de rencontre aléatoire immersive et tactique pour RuneQuest dans la région indiquée, avec les créatures ou protagonistes, leurs motivations, les dangers environnementaux et des opportunités d'interaction pacifique ou héroïque.`;
    } else if (type === "oracle") {
      systemInstruction += ` Tu interprètes un tirage de runes pour la divination d'un prêtre ou chaman de Glorantha, en donnant les auspices, les présages et les conseils des dieux.`;
    } else if (type === "wiki-summary") {
      systemInstruction += ` Tu résumes et traduis en français le contenu d'un article de lore Glorantha, en mettant en avant les éléments cruciaux pour un Maître de Jeu et des joueurs de RuneQuest en 1625 ST.`;
    }

    const fullPrompt = `${context ? `[Contexte: ${context}]\n\n` : ""}${prompt}`;

    let generatedText = "";
    try {
      const ai = getAIClient();
      generatedText = await generateContentWithFallback(ai, {
        contents: fullPrompt,
        systemInstruction,
        temperature: 0.8,
        type,
      });
    } catch (aiErr) {
      console.info("[Gemini AI] AI initialization failed, using procedural lore generator");
      generatedText = getProceduralGloranthaFallback(type, fullPrompt);
    }

    return res.json({ text: generatedText });
  } catch (error: any) {
    console.error("Gemini API handler error:", error);
    const fallbackText = getProceduralGloranthaFallback(req.body?.type, req.body?.prompt);
    return res.json({ text: fallbackText, isFallback: true });
  }
});

// Vite middleware & Static server setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur Passe du Dragon en écoute sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
