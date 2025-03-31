# Supply Hub - Game Design Document

## 1. Overview / Concept

Supply Hub is a 2D top-down logistics and automation game set on a grid-based canvas. Players start with basic tools and must exploit randomly appearing resource nodes scattered across the map. The core gameplay involves extracting resources using specific miners, transporting them via conveyor belts and other logistics tools to a central Hub, and using those resources to research and unlock progressively more advanced technologies. The ultimate goal is to gather vast quantities of 15 different resource types to fully upgrade the central Hub.

## 2. Core Gameplay Loop

1.  **Scan:** Identify resource nodes on the grid.
2.  **Extract:** Place the appropriate unlocked miner on a resource node.
3.  **Transport:** Build conveyor belts (standard, underground, over-top) to connect the miner's output to the Hub's input, potentially using splitters and combiners for complex routing.
4.  **Power (If Required):** Ensure miners and specific buildings are powered by placing Tesla Towers within range of a power generator (like the Hub itself or dedicated generators) and potentially using electric pumps for high-tier machines.
5.  **Store & Use:** Resources arriving at the Hub are added to storage.
6.  **Upgrade:** Spend stored resources at the Hub to unlock:
    *   New Miner types (for new resources).
    *   Faster Belts (Tiers 1-5).
    *   Advanced Logistics (Underground, Over-top belts, Splitters, Combiners).
    *   Storage Capacity increases.
    *   Power System upgrades (Tesla Tower range, Pump efficiency).
    *   Hub Upgrades (contributing to the win condition).
7.  **Expand:** Use new technologies to access and process new resource types, optimizing logistics for greater throughput.
8.  **Repeat:** Continue expanding, optimizing, and upgrading until the Hub is fully upgraded.

## 3. Key Features

*   **Grid-Based Canvas:** All construction and placement happen on a grid.
*   **Resource Nodes:**
    *   Spawn randomly on the map.
    *   Contain a finite amount of a specific resource.
    *   15 distinct types of resources, unlocked sequentially.
*   **Extraction:**
    *   Requires a specific miner type for each resource type.
    *   Miners are unlocked progressively.
*   **Transport & Logistics:**
    *   **Belts:** Standard surface belts (5 speed tiers).
    *   **Underground Belts:** Allow belts to pass under obstacles or other belts.
    *   **Over-top Belts:** Allow belts to pass over obstacles or other belts (potentially mutually exclusive with underground on the same tile).
    *   **Splitters:** Divide items from one belt onto multiple belts.
    *   **Combiners/Mergers:** Merge items from multiple belts onto one.
    *   **Input/Output Points:** Specific points on buildings (Miners, Hub) for belt connections.
*   **Power System:**
    *   **Power Generators:** Source of power (e.g., the Hub initially, maybe dedicated buildings later).
    *   **Tesla Towers:** Distribute power wirelessly in an area (starting 5x5, upgrading up to 10x10). Must be placed within range of a generator.
    *   **Electric Pumps:** Required for certain advanced machines or to boost efficiency (5 levels). Consumes power.
    *   **Consumers:** High-tier miners, pumps, potentially other advanced buildings require power from nearby Tesla Towers.
*   **The Hub:**
    *   Central drop-off point for all resources.
    *   Where upgrades are researched and purchased.
    *   The primary objective; requires vast amounts of all 15 resources for final upgrades.
*   **Progression:**
    *   Unlocking resource tiers and their corresponding miners.
    *   Researching faster belts and advanced logistics.
    *   Improving power generation and distribution.
    *   Increasing storage capacity.
    *   Completing Hub upgrade stages.

## 4. Goal / Win Condition

*   Fully upgrade the central Hub by delivering the required (increasingly large) amounts of all 15 resource types.

## 5. Visual Style

*   Clean, functional 2D top-down view on a clear grid. Focus on readability of belts, resources, and building states. 