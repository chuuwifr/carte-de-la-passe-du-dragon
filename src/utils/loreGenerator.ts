/**
 * Glorantha Lore Generator & Client-side Fallbacks
 * Provides resilient lore, NPC generation, and encounter tables
 * ensuring 100% operation even when deployed as a static site (e.g. GitHub Pages) without Node.js backend.
 */

export function getProceduralGloranthaLore(type?: string, context?: string, prompt?: string): string {
  const clans = ["Colymar", "Malani", "Crânes de Chien", "Culbrea", "Kheldon", "Torkan", "Varmandi", "Lismelder"];
  const cultes = [
    "Orlanth Aventurier",
    "Humakt l'Épée Tranchante",
    "Ernalda la Terre Nourricière",
    "Yelmalio le Soleil du Soleil",
    "Issaries le Marchand Nomade",
    "Lhankor Mhy le Sage Barbu",
    "Babeester Gor la Vengeresse",
    "Zorak Zoran la Fureur Noire",
    "Uleria l'Amour Éternel",
    "Chalana Arroy la Guérisseuse",
  ];
  const weapons = [
    "Grande lance sartarienne et bouclier rond orné du triskèle",
    "Épée large de bronze forgée selon les rites d'Humakt",
    "Arc court d'if composite et carquois de 20 flèches à pointe de silex",
    "Bâton gravé de runes de Connaissance et besace de parchemins",
    "Hache d'armes en fer météoritique et maille de bronze",
  ];
  const randomClan = clans[Math.floor(Math.random() * clans.length)];
  const randomCulte = cultes[Math.floor(Math.random() * cultes.length)];
  const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];

  if (type === "npc" || type === "npc-generator") {
    const names = ["Tarkal Longue-Lance", "Kallyr Cœur-Fier", "Brandgor l'Éclair", "Yadanya Tisse-Terre", "Korol Œil-de-Faucon", "Ernaldina la Rousse"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    return `### **Fiche de PNJ Gloranthien : ${randomName}**
*Généré par les Archives des Sages de Jonville (1625 ST)*

- **Origine & Clan** : Tribu **${randomClan}**, Fief des Collines de Sartar
- **Culte & Titre** : Initié du culte de **${randomCulte}**
- **Archétype** : Vétéran de la Guerre des Héros & Protecteur du Foyer

#### **Affinités Runiques & Passions**
- ⚡ **Rune de l'Air (Mouvement & Tempête)** : 75%
- ⚔️ **Rune de la Mort (Humakt)** : 65%
- 🌍 **Rune de la Terre (Fertilité)** : 50%
- **Passions** : *Loyauté envers la Tribu ${randomClan}* 85% | *Haine de l'Empire Lunar* 75% | *Hospitalité sacrée* 60%

#### **Description & Personnalité**
Portant une cuirasse de bronze martelée et des braies de laine teintes au pastel d'Ernalda. ${randomName} a combattu durant l'occupation de Boldhome. Il ne fait confiance qu'à ceux qui honorent le serment d'hospitalité et scrute toujours le vol des oiseaux avant de s'engager sur les sentiers.

#### **Équipement & Magie Runique**
- ${randomWeapon} (6 PA).
- **Sorts Runiques** : *Arme Véritable*, *Détection des Ennemis*, *Lame de Vent*.

#### **Secret & Accroche pour le Maître de Jeu**
Garde dissimulée une fiole de terre consacrée provenant d'un sanctuaire profané par les Lunars. Cherche des compagnons d'armes pour accomplir une quête héroïque de reconquête avant la Saison Sacrée.`;
  }

  if (type === "encounter-generator") {
    return `### **Rencontre Aléatoire : La Patrouille aux Aguets des Crêtes**
*Situation impromptue dans la Passe du Dragon (1625 ST)*

- **Lieu** : Crête rocheuse battue par les rafales, surplombant une vallée de pâturages sartariens.
- **Niveau de Menace** : Intermédiaire (3/5) - Tactique & Négociable

#### **Protagonistes en Présence**
Une escouade de 4 chevaucheurs de bœufs de la tribu **${randomClan}**, guidés par une initiée d'Ernalda, observant avec méfiance un petit groupe de Trolls de Dagori Inkarth dissimulés dans une combe ombragée.

#### **Déroulement suggéré**
1. **Éclaireurs** : Les PJ sont repérés par le tintement d'un cor de bronze résonnant entre les parois.
2. **Confrontation** : Les Sartariens somment les voyageurs de dénoncer leur clan et leurs allégeances. Un test de *Coutumes (Sartar)* ou *Passion (Honneur)* évite un malentendu armé.
3. **Opportunité** : En cas de dialogue pacifique, les Sartariens signalent la présence d'esprits du vent agités près d'un cairn funéraire situé à 2 lieues au nord.`;
  }

  if (type === "scenario-hook") {
    return `### **Accroche d'Aventure : L'Écho du Dragon Assoupi**
*Intrigue pour aventuriers sartariens (1625 ST)*

- **Région** : Vallée des Bêtes & Collines de Quivin
- **Enjeux** : Rivalité de clans, réveil de géants et relique sacrée

#### **Le Cadre**
Un ancien autel de pierre orné de la Rune de la Terre s'est mis à vibrer au crépuscule. Les chamans locaux affirment que l'esprit d'un wyrm ancien réclame la restitution d'une idole dérobée par des pillards Lunars lors de leur débâcle.

#### **Pistes d'action**
1. **Investigation** : Retrouver la trace des mercenaires retranchés dans les ruines d'une forteresse d'argile.
2. **Négociation ou Assaut** : Convaincre ou vaincre les occupants avant que les Trolls voisins ne pillent les lieux.
3. **Rituel Runique** : Replacer l'idole sur le cairn en apaisant l'esprit par un chant sacré d'Orlanth.`;
  }

  return `### **Chronique & Auspices de Glorantha (1625 ST)**
*Extrait des annales des Sages de Jonville*

Les vents d'Orlanth balaient les hauts plateaux de la Passe du Dragon. Depuis le Réveil du Grand Dragon et le recul des garnisons Lunars vers Tarsh, les tribus réaffirment leurs lois ancestrales.

- **Présage Runique** : L'Air domine la saison, apportant mouvement, tempêtes et renouveau héroïque.
- **Conseil aux Voyageurs** : Gardez toujours une corne de bière ambrée ou un quartier d'orge en offrande pour les esprits gardiens des carrefours.`;
}

/**
 * Fetch wiki data with graceful direct CORS fallback if server proxy isn't present
 */
export async function searchWikiSafe(query: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/wiki/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) return data.results;
    }
  } catch (e) {
    // Fall back to direct CORS fetch
  }

  try {
    const directUrl = `https://glorantha.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&format=json&origin=*`;
    const res = await fetch(directUrl);
    if (res.ok) {
      const data = await res.json();
      const hits = data?.query?.search || [];
      return hits.map((item: any) => ({
        pageId: item.pageid,
        title: item.title,
        snippet: item.snippet ? item.snippet.replace(/<[^>]*>?/gm, "") : "",
        size: item.size,
        wordCount: item.wordcount,
      }));
    }
  } catch (err) {
    console.warn("Direct wiki search fallback failed:", err);
  }
  return [];
}

/**
 * Fetch wiki page with graceful direct CORS fallback
 */
export async function fetchWikiPageSafe(title: string): Promise<any> {
  try {
    const res = await fetch(`/api/wiki/page?title=${encodeURIComponent(title)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && !data.error) return data;
    }
  } catch (e) {
    // Fall back to direct CORS fetch
  }

  try {
    const directUrl = `https://glorantha.fandom.com/api.php?action=parse&page=${encodeURIComponent(
      title
    )}&prop=text|categories|sections&format=json&origin=*`;
    const res = await fetch(directUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.parse) {
        return {
          title: data.parse.title || title,
          pageId: data.parse.pageid,
          html: data.parse.text?.["*"] || "",
          categories: (data.parse.categories || []).map((c: any) => c["*"]),
          sections: (data.parse.sections || []).map((s: any) => ({
            index: s.index,
            line: s.line,
            level: s.level,
          })),
          url: `https://glorantha.fandom.com/wiki/${encodeURIComponent(title)}`,
        };
      }
    }
  } catch (err) {
    console.warn("Direct wiki page fetch fallback failed:", err);
  }
  return null;
}
