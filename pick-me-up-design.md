# Pick Me Up - Game Design Specification

## Overview

**Pick Me Up** is a tower-climbing management game inspired by the manhwa "Pick Me Up." The player takes the role of the "Master" -- a 4th-wall meta-narrative figure who summons, trains, and commands heroes through a procedurally generated tower. Heroes are AI-driven characters with emergent personalities, permadeath is permanent, and every account generates a completely unique world.

- **Platform**: PC Desktop
- **Engine**: Unity (C#)
- **Art Style**: 2D Pixel Art
- **Business Model**: Hobby / passion project (free)
- **Multiplayer**: Optional social features (world visiting, hero trading, seasonal tournament)

---

## 1. World Generation & Data Model

### 1.1 World Seed

Every world is generated from a single **seed** (a large integer). The seed deterministically produces:

- **World difficulty rating**: A multiplier (0.8x to 1.5x) affecting enemy stats, resource scarcity, and hero power scaling
- **Character pool**: Which heroes exist in this world, their innate traits, backgrounds, and base stats
- **Tower blueprint**: Floor layouts, objective types, enemy compositions, boss encounters
- **Skill catalog**: Available skills and fusion recipes unique to this world
- **Facility variants**: Which specializations are available for each facility type

The seed makes worlds reproducible. Players can share seeds for comparison or community discussion.

### 1.2 World Difficulty

Difficulty affects the entire ecosystem, not just enemy numbers:

- **Enemy scaling**: Higher difficulty = tougher enemies per floor
- **Resource scarcity**: Harder worlds have fewer resources, slower facility progression
- **Hero power scaling**: Heroes in harder worlds gain more effective stats per level. A level 40 hero in a 1.4x world is meaningfully stronger than a level 40 hero in a 0.9x world
- **Tournament impact**: Harder worlds are disadvantaged in progression speed but produce tournament-competitive heroes

### 1.3 Core Data Model

**World**
- Seed, difficulty multiplier, name, creation date
- Current tower progress (highest cleared floor)
- Resource stockpiles
- Facility layout

**Character**
- World reference, name, background/origin
- Star rating (1-6), level, XP
- Stats (STR, AGI, INT, VIT, WIS, CHA, LCK)
- Personality axes and dynamic state
- Skill list, innate traits
- Alive/dead flag, death details (if dead)
- Relationship map, memory log

**Skill**
- ID, name, description
- Type: Combat Active, Combat Passive, Utility, Innate
- Power, effects, cost (action points or mana)
- World-specific flag

**FusionRecipe**
- Input skill IDs (2-3 skills), output skill ID
- Discovery conditions, world-specific flag

**Facility**
- Type, specialization, level (1-5)
- Grid position in lobby
- Assigned characters, capacity

**TowerFloor**
- Floor number, tier (every 10 floors)
- Objective type, enemy data, environmental hazards
- Rewards, scouted/unscouted flag, cleared flag

**Squad**
- Assigned characters (3-5)
- Formation (front/back row assignments)
- Per-character strategy orders

### 1.4 Persistence

Data is saved locally as serialized files (JSON or Unity serialization). The core save system is local-first. Multiplayer features require a lightweight server component for tournament data and peer-to-peer connection brokering.

---

## 2. Character System

### 2.1 Character Origin & Identity

When summoned, each character is generated with:

- **Name**: Procedurally generated, fitting the world's theme
- **Background**: Role before summoning (farmer, soldier, scholar, blacksmith, thief, healer, etc.). Determines starting stat distribution and innate skills
- **Base Star Rating**: 1-6 stars. Summoning pool rates:
  - 1-star: 40%
  - 2-star: 30%
  - 3-star: 18%
  - 4-star: 8%
  - 5-star: 3%
  - 6-star: 1%
- **Innate Traits**: 1-3 permanent personality/combat traits (e.g., "Brave," "Night Owl," "Iron Will," "Clumsy"). Affect behavior, stat growth, and skill learning
- **Appearance**: Pixel art sprite from modular parts (body, hair, equipment, color palette) based on background and star rating

### 2.2 Stats

Seven core stats, influenced by background and training:

| Stat | Abbreviation | Effects |
|------|-------------|---------|
| Strength | STR | Physical damage, carry capacity |
| Agility | AGI | Speed, dodge chance, action order in combat |
| Intelligence | INT | Magic power, skill learning speed |
| Vitality | VIT | HP, defense, survival chance |
| Wisdom | WIS | Skill fusion insight, special event trigger chance |
| Charisma | CHA | Morale influence on others, trade negotiation, Master relationship |
| Luck | LCK | Crit chance, drop quality, event trigger probability, fusion discovery |

Each background biases stats differently. A farmer starts with high VIT/STR but low INT. A scholar starts with high INT/WIS but low STR.

### 2.3 Star Progression

| Transition | Requirements | Changes |
|------------|-------------|---------|
| 1 -> 2 | Level 10, basic training | Stat cap increases, +1 skill slot |
| 2 -> 3 | Level 20, intermediate training | Stat cap increases, +1 skill slot, visual upgrade |
| 3 -> 4 | Level 35, advanced training, facility specialization | Stat cap increases, +1 skill slot, can learn advanced skills |
| 4 -> 5 | Level 50, one unique fusion skill, special event trigger (near-death, enlightenment, etc.) | Major stat cap increase, unique visual, can learn master-tier skills |
| 5 -> 6 | Level 70, multiple fusion skills, rare event chain, world-specific trial | Max stat cap, legendary visual, unique title, potential world-unique ability |

**Natural 5-6 star characters** skip the event trigger requirements but still need levels and skills. Their advantage is a **unique innate skill** that cannot be learned through training -- thematic to their origin.

**Any character is viable.** A 1-star hero can grow to 6-star with enough investment. Natural high-star heroes start stronger and have unique innate skills, but 1-star heroes have the same stat potential at equivalent star ratings. The difference is in skill uniqueness, not raw power.

### 2.4 AI Personality System

Each character has a simulated inner life driven by permanent personality axes and dynamic state.

**Personality Axes** (generated at summon, permanent):

| Axis | Low End | High End | Effects |
|------|---------|----------|---------|
| Loyalty | Independent | Devoted | Trust in / obedience to the Master |
| Courage | Cautious | Fearless | Risk-taking in combat, scouting willingness |
| Temperament | Volatile | Calm | Emotional stability, morale swing amplitude |
| Ambition | Content | Driven | Desire for growth, training motivation |
| Sociability | Solitary | Gregarious | Interaction frequency with other characters |

**Dynamic State** (changes based on events):

- **Morale**: Overall happiness/willingness. Affected by victories, losses of friends, facility quality, Master decisions
- **Relationships**: Bonds with other characters (friendship, rivalry, mentor/student, romance). Form organically through shared combat, training, and lobby interactions
- **Master Opinion**: How the character feels about the player. Affected by whether the Master sends them on suicide missions, protects them, invests in their growth
- **Memories**: Significant events stored as entries (survived near-death, watched a friend die, achieved a fusion skill, won a tournament). Influence future behavior and dialogue

**Behavioral Effects:**

- Low morale: slower training, may refuse scouting, potential desertion
- Friend dies: reckless (seeking revenge) or terrified (refusing the floor)
- High loyalty + high courage: volunteer for dangerous scouts
- Low Master Opinion: refuse hero trades ("I won't serve another Master")
- High ambition: faster training, actively seek skill fusion
- High sociability: form bonds faster, morale more dependent on community

### 2.5 Permadeath

When a character dies on a tower floor, they are **permanently removed**:

- Characters with bonds to the deceased suffer morale drops
- The deceased's memory persists -- other characters reference them
- Discovered fusion recipes remain unlocked
- A memorial facility (Hall of Memories) tracks fallen heroes
- Death events can trigger personality changes in survivors (Vengeful trait, Fearful trait, Determined trait)

---

## 3. Skill & Fusion System

### 3.1 Skill Categories

| Type | Description | Examples |
|------|-------------|---------|
| Combat Active | Direct battle actions, cost energy (each character has an energy pool that regenerates per turn; energy cost varies by skill power) | Slash, Fireball, Shield Bash, Heal |
| Combat Passive | Always-on effects during battle | Iron Skin (+DEF), Quick Draw (+first strike) |
| Utility | Non-combat abilities for lobby, exploration, economy | Craft, Forage, Negotiate, Scout |
| Innate | Tied to character at summon, cannot be removed | Natural 5-6 star unique skills |

### 3.2 Skill Learning Sources

1. **Innate** (at summon): 1-2 skills based on background. Farmer gets "Harvest" + "Endurance." Soldier gets "Swordsmanship" + "Formation"
2. **Training Facilities**: Assign character to a facility, learn skills over time. Skills depend on facility specialization (Sword School teaches sword skills, Mage Academy teaches fire magic, etc.)
3. **Combat Experience**: Rare chance to learn during battle based on events. Blocking a lethal hit may teach "Last Stand." Landing a critical kill may teach "Precision Strike"
4. **Events**: Special narrative moments grant skills. Near-death, witnessing a comrade fall, moments of desperation or inspiration
5. **Mentorship**: Higher-star character teaches a skill to a lower-star character if they share a strong bond and train together

### 3.3 Skill Slots

| Star Rating | Skill Slots |
|-------------|-------------|
| 1-star | 3 |
| 2-star | 4 |
| 3-star | 5 |
| 4-star | 6 |
| 5-star | 7 |
| 6-star | 8 |

Innate skills do not count against slots. When full, a character must forget a skill to learn a new one. Forgotten skills are permanently lost.

### 3.4 Skill Fusion

Discovery-based system where players experiment with combining known skills.

**Process:**
1. Character must know all component skills
2. Player selects 2-3 skills to fuse at a Workshop (Fusion Chamber specialization preferred)
3. If the combination matches a valid recipe in this world's catalog, fusion succeeds -- component skills are consumed, new skill is learned
4. If invalid, the attempt fails and **Fusion Backlash** occurs

**Example Fusions:**

| Input Skills | Result | Type |
|-------------|--------|------|
| Berserk + Calm Mind | Controlled Fury (massive damage with full accuracy) | Combat Active |
| Plowing + Planting + Fast Growth | Instant Harvest (instantly grow and collect crops) | Utility |
| Fireball + Ice Shard | Thermal Shock (AoE damage + stun) | Combat Active |
| Last Stand + Iron Will | Undying Resolve (survive one lethal hit per floor at 1 HP) | Combat Passive |
| Scout + Stealth | Shadow Recon (scout floor with zero detection risk) | Utility |
| Swordsmanship + Formation + Leadership | Commander's Blade (boosts entire squad ATK) | Combat Active |

**Fusion Hints:**
- Characters with high WIS and LCK may receive subtle hints about valid combinations ("This character feels a resonance between Berserk and Calm Mind...")
- Failed fusions also provide information by elimination

### 3.5 Fusion Backlash

Failed fusion attempts have **narrative consequences** on the character, rolled from a consequence table influenced by personality:

| Outcome | Effect | Personality Influence |
|---------|--------|----------------------|
| Determination | Temporary training speed buff, increased fusion hint sensitivity | More likely for Calm temperament |
| Injury | Small permanent stat penalty (-1 to -3 to a stat) or temporary debuff | More likely for Volatile temperament |
| Obsession | Character becomes fixated, may autonomously re-attempt the fusion | More likely for Driven ambition |
| Insight | Partial hints about what combinations DO work | More likely for high WIS characters |

This makes fusion a meaningful risk/reward decision. Do you fuse on your best 4-star and risk injury, or on a backup?

### 3.6 Fusion and Star Progression

- **5-star** requires at least one unique fusion skill (3+ component or rare-tier result)
- **6-star** requires multiple fusion skills plus world-specific trial
- Progression demands experimentation -- pure grinding is insufficient

### 3.7 World-Specific Recipes

Each world has its own fusion catalog. Some recipes are universal (exist in every world), but many are world-unique. Players in different worlds discover different combinations.

---

## 4. Tower & Combat

### 4.1 Tower Structure

- **Total floors**: Scales with world difficulty (50-100 floors). New floors can appear after milestones
- **Tiers**: Every 10 floors is a tier with a difficulty bracket and guaranteed boss floor at the top (10, 20, 30, etc.)
- **Fog of war**: All floors start unscouted. Contents unknown until a scout is sent
- **No backtracking during a run**: Squad must complete the objective or retreat. Cannot go back down mid-run
- **Cleared floors**: Stay cleared. Travel through cleared floors is safe

### 4.2 Floor Objective Types

| Objective | Description | Win Condition | Key Danger |
|-----------|-------------|---------------|------------|
| Exterminate | Kill all enemies on the floor | All enemies dead | Overwhelming numbers, attrition |
| Defense | Protect a point or NPC for set turns | Survive X turns, target intact | Waves of enemies, positioning |
| Capture Target | Defeat or capture a specific enemy/NPC | Target eliminated/captured | Target may flee, time pressure |
| Capture Artifact | Retrieve an item from the floor | Artifact collected, squad exits | Traps, puzzle layouts |
| Explore | Navigate branching paths to find exit | Reach the exit | Unknown threats, resource management |
| Boss | Single powerful enemy (every 10th floor) | Boss defeated | High stats, unique mechanics |
| Survival | Endure escalating waves, no reinforcements | Survive X waves | No resupply, fatigue |
| Escort | Guide an NPC through dangers | NPC reaches exit alive | Unpredictable NPC AI, split attention |

### 4.3 Scouting

Before committing a squad, the player can scout a floor:

- **Fodder scout**: Send a low-value character to peek. They reveal objective type, enemy composition, rough difficulty. The scout may die
- **Skilled scout**: Character with "Scout" or "Shadow Recon" skill scouts with reduced risk. Higher skill = more intel (enemy types, traps, boss abilities)
- **Blind entry**: Skip scouting. Risky but saves time/lives

Scouting reveals: objective type, estimated enemy count/types, recommended squad power, special hazards, potential rewards.

### 4.4 Combat System

Combat is **auto-battle** with pre-set strategy. The player's role is preparation, not execution.

**Pre-battle setup:**
- **Squad composition**: Choose up to 5 characters (minimum 1). Some floor types impose a max squad size (e.g., Explore may limit to 3 for tight corridors)
- **Formation**: Front row (more damage taken, melee access) / back row (safer, ranged)
- **Strategy orders** (per character):
  - Aggressive: Focus damage, ignore defense
  - Defensive: Prioritize survival, use defensive skills
  - Support: Focus buffing/healing allies
  - Target Priority: Focus strongest, weakest, or objective
  - Retreat Threshold: HP % at which to attempt flee

**During battle:**
- Characters act in turn order based on AGI
- Skills used automatically based on strategy orders and AI personality
- **Personality overrides strategy in critical moments**: A Brave character on Defensive orders may break formation to protect a friend. A Cautious character on Aggressive orders may hesitate against a much stronger enemy
- This is intentional -- emergent drama from the tension between orders and personality

**Post-battle:**
- Surviving characters gain XP (scaled by floor difficulty and contribution)
- Combat skill learning chance based on events
- Dead characters permanently removed
- Loot and resources collected
- Morale shifts (victory boosts, comrade loss drops)

### 4.5 Retreat Mechanics

- Characters can attempt retreat if things go badly
- AGI and LCK affect escape success chance
- Some floor types block retreat (boss, survival)
- Failed retreat means continued combat (or death)
- Retreating doesn't clear the floor -- try again later
- Personality affects retreat perception: some gain "cowardice" morale hit, others gain "lived to fight another day" wisdom

### 4.6 Death & Consequences

When a character dies:
- Permanently removed from roster
- Equipped items lost
- Bonded characters suffer morale drops
- Memory of deceased created -- other characters reference them in dialogue/behavior
- Discovered fusion recipes remain available
- Death triggers personality events in survivors (Vengeful, Fearful, Determined traits)

---

## 5. Lobby & Facilities

### 5.1 Lobby Overview

The lobby is a 2D pixel art scene (isometric or top-down). It is the player's home base:

- Characters wander when not assigned to facilities or tower runs
- Characters interact organically (chatting, sparring, arguing) driven by AI personality
- Player places and upgrades facilities on a grid-based layout
- Lobby size expands when a tower tier is cleared (every 10 floors unlocks additional grid space)

### 5.2 Facility Types

Eight core facility types. Each can be **specialized** into thematic disciplines that determine which specific skills characters learn. Available specializations are world-dependent (not every world has every specialization).

| Facility | Base Function | Example Specializations |
|----------|--------------|------------------------|
| **Training Ground** | Physical training, STR/AGI/VIT XP | Sword School, Spear Dojo, Unarmed Combat, Shield Mastery, Archery Range |
| **Academy** | Mental training, INT/WIS XP | Mage Academy (fire/ice/lightning), Cleric Seminary (healing/holy), Rune Studies (enchantment), Shadow Arts |
| **Workshop** | Crafting, equipment, skill fusion | Blade Smithing, Bow Crafting, Armor Forging, Alchemy Lab, Fusion Chamber |
| **Barracks** | Rest, healing, morale recovery | Infirmary (faster healing), Dormitory (morale boost), Hall of Memories (memorial, morale passive) |
| **Farm** | Resource production | Crop Farm (food), Mine (ore/materials), Lumber Yard (wood), Herb Garden (alchemy ingredients) |
| **Tavern** | Summoning, recruitment, social | Summoning Circle (hero summoning), Trading Post (multiplayer hub), Gathering Hall (relationship building) |
| **Watchtower** | Scouting, intelligence | Scout Post (cheaper scouting), Observatory (passive floor intel), Signal Tower (multiplayer communication) |
| **Arena** | Sparring, testing, competition | Practice Pit (safe training XP), Challenge Ring (duels for stat boosts), Tournament Ground (competition prep) |

Specialization determines the **specific skill trees** characters learn at that facility. A Sword School teaches swordsmanship skills; a Mage Academy teaches fire/ice/lightning magic. This directly shapes which fusion combinations become available.

### 5.3 Facility Mechanics

**Building:**
- Costs resources (from farms, tower loot, etc.)
- Occupies grid tiles in the lobby
- Placement matters -- adjacency creates synergy bonuses

**Upgrading (5 levels):**
- Higher levels increase capacity (characters training simultaneously) and speed
- Level 3 unlocks specialization choice (permanent)
- Level 5 provides a unique passive bonus to all characters

**Assigning Characters:**
- Each facility has a capacity (Lv1: 2 characters, Lv5: 6 characters)
- Characters gain XP and skills passively while assigned
- Training speed affected by personality (high Ambition = faster, low Ambition = slower but may gain unexpected insights)
- Characters form bonds while training together

### 5.4 Adjacency Synergies

| Combo | Bonus |
|-------|-------|
| Training Ground + Barracks | Reduced recovery time between training sessions |
| Academy + Workshop | Increased fusion hint chance |
| Farm + Tavern | Better summoning rates (well-fed heroes attract others) |
| Watchtower + Arena | Scouting intel improves sparring strategies |
| Same-type facilities adjacent | Shared XP pool bonus |

### 5.5 Lobby Life

Characters not assigned or on missions exist as living entities in the lobby:

- **Wander** between facilities and open spaces
- **Interact** with others based on personality and relationships (friends seek each other, rivals avoid each other)
- **React to events** -- after tower runs, survivors gather at Barracks or Hall of Memories
- **Express opinions** -- complain about dangerous missions, celebrate promotions, mourn losses
- **Observable** by the Master through an activity log or clicking individual characters

---

## 6. Multiplayer

### 6.1 Networking Architecture

- **Peer-to-peer** for world visiting (direct connection between players)
- **Lightweight relay server** for tournament (collects results, computes rankings)
- Save data stays local; only hero snapshots and tournament stats are shared
- Can use Steamworks networking if distributing through Steam, or custom relay

### 6.2 World Visiting

Players invite others to visit their world:

- Visitor sees the host's lobby, facilities, and characters
- Visitors can **observe** but not modify the host's world
- Available interactions:
  - **Hero inspection**: View stats, skills, personality, history
  - **Facility touring**: See base layout and specializations
  - **Spectating tower runs**: Watch the host's squad in real-time

### 6.3 Hero Trading

Heroes are living beings with opinions -- trading involves the hero's consent:

**Process:**
1. Two players agree to trade (or one offers a gift)
2. The hero being traded is asked if they want to go
3. The hero's response depends on personality:
   - High Loyalty to current Master: likely refuses
   - Low Loyalty / Independent: more willing
   - High Sociability + bonds in current world: refuses if leaving close friends
   - Low Morale / resentful of Master: eager to leave
   - Adventurous trait: more likely to accept
4. If the hero agrees, they transfer with stats, skills, and personality intact
5. The hero retains memories of old world -- may reference it, miss companions, compare Masters
6. Original world's power scaling stays with the hero

**Restrictions:**
- One trade per hero per real-world week
- Cannot trade heroes mid-mission or mid-training
- Hero's decision is final -- refusal cannot be overridden

### 6.4 Cross-World Training

Visiting players can mentor host heroes:

- Visitor assigns one of their high-level heroes as mentor to a host's hero
- Mentorship lasts for the visit duration
- Host's hero gains bonus XP, chance to learn one of the mentor's compatible skills
- Mentor hero gains CHA boost from teaching
- Both heroes may form a cross-world bond (persists after visit)

### 6.5 Annual Tournament

Synchronized real-time calendar event (every 2-4 real-world weeks):

**Format:**
- Individual hero competition (solo, not squad)
- Players nominate heroes (heroes with low morale or poor Master Opinion may refuse)
- Heroes from all participating worlds matched in bracket-style auto-combat
- Matches use hero stats, skills, and personality

**World Difficulty Scaling:**
- Heroes from harder worlds have natural stat advantage at equivalent levels
- Level 40 hero from 1.4x world has ~56 levels worth of effective stats
- Rewards skill/fusion investment alongside raw stats

**Rewards:**
- Rankings visible to all players
- Winners gain title and prestige trait (confidence or arrogance, personality-dependent)
- All participants gain XP and potential special event triggers
- Top-placing worlds gain temporary resource bonus

**Personality Effects:**
- Winners become more confident (Courage increase)
- Losers may become determined (Ambition boost) or demoralized (Morale drop)
- Defeating the killer of a friend triggers "Avenged" memory

---

## 7. Player Role: The Master

The player is the **Master** -- a 4th-wall meta-narrative figure. Heroes are aware they are being controlled/guided by an outside entity.

**Narrative implications:**
- Heroes may question their existence or the Master's motives
- Some heroes are loyal to the Master, others resent the control
- Master Opinion is a tracked stat that affects hero behavior
- Sending heroes on suicide missions, neglecting their growth, or sacrificing them carelessly degrades Master Opinion
- Investing in heroes, protecting them, and celebrating their achievements improves it
- This creates a genuine emotional feedback loop -- the player's decisions have narrative consequences through the personality system

---

## 8. Technical Architecture (High Level)

### 8.1 Unity Project Structure

- **Core**: Data models, serialization, world generation (seed-based RNG)
- **Characters**: Character generation, stat system, personality AI, skill management
- **Combat**: Auto-battle engine, turn resolution, strategy order processing, personality override logic
- **Tower**: Floor generation, objective handlers, scouting system, squad management
- **Lobby**: Facility grid system, building/upgrading, character assignment, adjacency synergy calculation
- **UI**: Lobby view, tower view, character inspection, facility management, combat viewer
- **Multiplayer**: Peer-to-peer networking, tournament server communication, hero transfer protocol
- **Persistence**: Save/load system, local file serialization

### 8.2 Key Technical Considerations

- **Deterministic world generation**: All procedural content must be reproducible from the seed
- **Personality simulation performance**: AI personality updates should run efficiently for 20-50+ characters
- **Combat replay**: Battles should be replayable from the same initial state (deterministic combat resolution)
- **Modular objective system**: Floor objectives should be implemented as pluggable handlers so new types can be added
- **Save file integrity**: Permadeath means save corruption is catastrophic -- implement backup saves

---

## 9. Implementation Priority (Feature Modules)

The game will be built module by module in this order:

1. **Core data model & world generation** -- seed system, data structures, serialization
2. **Character system** -- generation, stats, basic personality, skill slots
3. **Lobby & facilities (basic)** -- grid placement, one facility type, character assignment
4. **Tower & combat (basic)** -- floor generation, one objective type, auto-battle engine
5. **Skill system** -- learning from facilities, combat skill triggers
6. **Skill fusion** -- fusion mechanics, backlash system, recipe catalog
7. **Full personality AI** -- all 5 axes, dynamic state, memories, behavioral effects
8. **Full tower objectives** -- all 8 objective types, scouting, retreat
9. **Full facility system** -- all 8 types, specializations, adjacency synergies, lobby life
10. **Star progression** -- level gates, fusion requirements, event triggers, visual upgrades
11. **Multiplayer: world visiting** -- peer-to-peer, observation, spectating
12. **Multiplayer: hero trading** -- consent system, personality-driven decisions
13. **Multiplayer: tournament** -- relay server, bracket system, difficulty scaling, rewards
14. **Polish** -- pixel art, animations, sound, UI refinement, balance tuning
