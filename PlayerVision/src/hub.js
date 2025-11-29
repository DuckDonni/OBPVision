// hub.js
import OBR, { buildLight, buildShape } from "@owlbear-rodeo/sdk";

/**
 * Custom Dynamic Lighting System
 * - GM Role: Sees everything (no fog, no lights needed)
 * - Player Role: Sees only areas revealed by their assigned tokens' lights
 * - Uses per-player fog shapes and lights via OBR.scene.local.addItems()
 */
export function setupVisionControls(container) {
  // UI elements
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.gap = "1rem";

  // Player Selection
  const playerRow = document.createElement("div");
  playerRow.style.display = "flex";
  playerRow.style.flexDirection = "column";
  playerRow.style.gap = "0.25rem";

  const playerLabel = document.createElement("label");
  playerLabel.textContent = "Player:";
  playerLabel.style.fontSize = "0.9rem";
  playerLabel.style.fontWeight = "500";

  const playerSelect = document.createElement("select");
  playerSelect.id = "player-select";
  playerSelect.style.width = "100%";
  playerSelect.style.padding = "0.5rem";
  playerSelect.style.border = "1px solid #ccc";
  playerSelect.style.borderRadius = "4px";
  playerSelect.style.fontSize = "0.9rem";
  playerSelect.style.backgroundColor = "#fff";
  playerSelect.style.boxSizing = "border-box";

  playerRow.appendChild(playerLabel);
  playerRow.appendChild(playerSelect);

  // Token
  const tokenRow = document.createElement("div");
  tokenRow.style.display = "flex";
  tokenRow.style.flexDirection = "column";
  tokenRow.style.gap = "0.25rem";

  const tokenLabel = document.createElement("label");
  tokenLabel.textContent = "Token:";
  tokenLabel.style.fontSize = "0.9rem";
  tokenLabel.style.fontWeight = "500";

  const select = document.createElement("select");
  select.id = "vision-token-select";
  select.style.width = "100%";
  select.style.padding = "0.5rem";
  select.style.border = "1px solid #ccc";
  select.style.borderRadius = "4px";
  select.style.fontSize = "0.9rem";
  select.style.backgroundColor = "#fff";
  select.style.boxSizing = "border-box";

  tokenRow.appendChild(tokenLabel);
  tokenRow.appendChild(select);

  // Range
  const rangeRow = document.createElement("div");
  rangeRow.style.display = "flex";
  rangeRow.style.flexDirection = "column";
  rangeRow.style.gap = "0.25rem";

  const rangeLabel = document.createElement("label");
  rangeLabel.textContent = "Range:";
  rangeLabel.style.fontSize = "0.9rem";
  rangeLabel.style.fontWeight = "500";

  const rangeInput = document.createElement("input");
  rangeInput.type = "number";
  rangeInput.min = "0";
  rangeInput.placeholder = "30";
  rangeInput.style.width = "100%";
  rangeInput.style.padding = "0.5rem";
  rangeInput.style.border = "1px solid #ccc";
  rangeInput.style.borderRadius = "4px";
  rangeInput.style.fontSize = "0.9rem";
  rangeInput.style.backgroundColor = "#fff";
  rangeInput.style.boxSizing = "border-box";

  rangeRow.appendChild(rangeLabel);
  rangeRow.appendChild(rangeInput);

  // Add | Remove buttons
  const buttonRow = document.createElement("div");
  buttonRow.style.display = "flex";
  buttonRow.style.gap = "0.5rem";

  const addTokenButton = document.createElement("button");
  addTokenButton.type = "button";
  addTokenButton.textContent = "Add";
  addTokenButton.style.flex = "1";
  addTokenButton.style.padding = "0.5rem";
  addTokenButton.style.border = "none";
  addTokenButton.style.borderRadius = "4px";
  addTokenButton.style.fontSize = "0.9rem";
  addTokenButton.style.cursor = "pointer";
  addTokenButton.style.backgroundColor = "#4CAF50";
  addTokenButton.style.color = "#fff";
  addTokenButton.style.transition = "background-color 0.2s";
  addTokenButton.addEventListener("mouseenter", () => {
    addTokenButton.style.backgroundColor = "#45a049";
  });
  addTokenButton.addEventListener("mouseleave", () => {
    addTokenButton.style.backgroundColor = "#4CAF50";
  });

  const removeTokenButton = document.createElement("button");
  removeTokenButton.type = "button";
  removeTokenButton.textContent = "Remove";
  removeTokenButton.style.flex = "1";
  removeTokenButton.style.padding = "0.5rem";
  removeTokenButton.style.border = "none";
  removeTokenButton.style.borderRadius = "4px";
  removeTokenButton.style.fontSize = "0.9rem";
  removeTokenButton.style.cursor = "pointer";
  removeTokenButton.style.backgroundColor = "#f44336";
  removeTokenButton.style.color = "#fff";
  removeTokenButton.style.transition = "background-color 0.2s";
  removeTokenButton.addEventListener("mouseenter", () => {
    removeTokenButton.style.backgroundColor = "#da190b";
  });
  removeTokenButton.addEventListener("mouseleave", () => {
    removeTokenButton.style.backgroundColor = "#f44336";
  });

  buttonRow.appendChild(addTokenButton);
  buttonRow.appendChild(removeTokenButton);

  // Token List
  const tokenListRow = document.createElement("div");
  tokenListRow.style.display = "flex";
  tokenListRow.style.flexDirection = "column";
  tokenListRow.style.gap = "0.25rem";

  const tokenListLabel = document.createElement("label");
  tokenListLabel.textContent = "Token List:";
  tokenListLabel.style.fontWeight = "500";
  tokenListLabel.style.fontSize = "0.9rem";

  const tokenList = document.createElement("div");
  tokenList.id = "player-token-list";
  tokenList.style.minHeight = "3rem";
  tokenList.style.border = "1px solid #ccc";
  tokenList.style.borderRadius = "4px";
  tokenList.style.padding = "0.5rem";
  tokenList.style.backgroundColor = "#f9f9f9";
  tokenList.style.width = "100%";
  tokenList.style.boxSizing = "border-box";

  tokenListRow.appendChild(tokenListLabel);
  tokenListRow.appendChild(tokenList);

  // Enable/Disable Toggle
  const toggleRow = document.createElement("div");
  toggleRow.style.display = "flex";
  toggleRow.style.alignItems = "center";
  toggleRow.style.gap = "0.5rem";
  toggleRow.style.padding = "0.75rem";
  toggleRow.style.border = "2px solid #4CAF50";
  toggleRow.style.borderRadius = "4px";
  toggleRow.style.backgroundColor = "#f0f8f0";

  const toggleCheckbox = document.createElement("input");
  toggleCheckbox.type = "checkbox";
  toggleCheckbox.id = "vision-toggle";
  toggleCheckbox.style.width = "20px";
  toggleCheckbox.style.height = "20px";
  toggleCheckbox.style.cursor = "pointer";

  const toggleLabel = document.createElement("label");
  toggleLabel.htmlFor = "vision-toggle";
  toggleLabel.textContent = "Enable Player Vision (Fog of War)";
  toggleLabel.style.fontSize = "1rem";
  toggleLabel.style.fontWeight = "600";
  toggleLabel.style.color = "#2e7d32";
  toggleLabel.style.cursor = "pointer";
  toggleLabel.style.flex = "1";

  toggleRow.appendChild(toggleCheckbox);
  toggleRow.appendChild(toggleLabel);

  wrapper.appendChild(toggleRow);
  wrapper.appendChild(playerRow);
  wrapper.appendChild(tokenRow);
  wrapper.appendChild(rangeRow);
  wrapper.appendChild(buttonRow);
  wrapper.appendChild(tokenListRow);

  container.appendChild(wrapper);

  // ============================================
  // DYNAMIC LIGHTING SYSTEM
  // ============================================
  OBR.onReady(async () => {
    let cachedPlayers = [];
    const managedItemIds = new Set(); // Track all items we've created (fog + lights)

    // Get/set vision enabled state (stored per-player in localStorage)
    function getVisionEnabled() {
      try {
        const stored = localStorage.getItem("obpvision/enabled");
        return stored !== "false"; // Default to enabled (true) if not set
      } catch (e) {
        return true; // Default to enabled
      }
    }

    function setVisionEnabled(enabled) {
      try {
        localStorage.setItem("obpvision/enabled", enabled ? "true" : "false");
      } catch (e) {
        console.warn("Failed to save vision enabled state:", e);
      }
    }

    // Load saved state and update checkbox
    const savedEnabled = getVisionEnabled();
    toggleCheckbox.checked = savedEnabled;

    // Get token IDs assigned to a player from scene metadata
    async function getPlayerTokenIds(playerId) {
      if (!playerId) return [];
      try {
        const sceneMeta = await OBR.scene.getMetadata();
        const playerTokens = sceneMeta?.["obpvision/playerTokens"] || {};
        return playerTokens[playerId] || [];
      } catch (e) {
        return [];
      }
    }

    // Get vision range for a token from metadata
    async function getTokenRange(tokenId) {
      if (!tokenId) return 30; // Default range
      try {
        const [token] = await OBR.scene.items.getItems(item => item.id === tokenId);
        if (!token) return 30;
        const range = token.metadata?.["obpvision/range"];
        return typeof range === "number" ? Math.max(0, Math.round(range)) : 30;
      } catch (e) {
        return 30;
      }
    }

    // Set vision range for a token
    async function setTokenRange(tokenId, range) {
      if (!tokenId) return;
      const clamped = Math.max(0, Math.round(range));
      try {
        await OBR.scene.items.updateItems([tokenId], items => {
          for (const item of items) {
            item.metadata = {
              ...(item.metadata || {}),
              "obpvision/range": clamped,
            };
          }
        });
      } catch (e) {
        console.warn("setTokenRange failed:", e);
      }
    }

    // Cache fog shape ID to avoid recreating it
    let fogShapeId = null;
    // Track light IDs by token ID for efficient updates
    const tokenLightMap = new Map(); // tokenId -> lightId
    // Track ambient light ID (used when vision is disabled to illuminate everything)
    let ambientLightId = null;

    /**
     * Main function: Update dynamic lighting system
     * - GM: Sees everything (no fog, no lights)
     * - Player: Sees only what their assigned tokens' lights reveal through fog (if enabled)
     */
    async function updateDynamicLighting() {
      try {
        // Check if scene is available
        try {
          await OBR.scene.getMetadata();
        } catch (e) {
          return; // No scene available yet
        }

        // Get current player's role
        const playerRole = await OBR.player.getRole();
        const currentPlayerId = OBR.player.id;

        // Check if vision is enabled
        const visionEnabled = getVisionEnabled();

        // GM ROLE: See everything - no fog, no lights needed
        if (playerRole === "GM") {
          // Aggressively clean up ALL fog and lights for GM (they see everything)
          let itemsToRemove = [];
          let existingAmbientLight = null;
          try {
            const allLocalItems = await OBR.scene.local.getItems();
            
            // Remove ALL fog shapes on FOG layer
            const fogShapes = allLocalItems.filter(
              item => item.layer === "FOG" && item.type === "SHAPE"
            );
            fogShapes.forEach(fog => {
              itemsToRemove.push(fog.id);
            });
            
            // Remove token lights, but preserve large ambient lights (radius >= 40000)
            const lights = allLocalItems.filter(
              item => item.type === "LIGHT"
            );
            lights.forEach(light => {
              if (light.attenuationRadius >= 40000) {
                // This is likely an ambient light, preserve it
                existingAmbientLight = light;
              } else {
                // This is a token light, remove it
                itemsToRemove.push(light.id);
              }
            });
            
          } catch (e) {
            console.warn("[OBP Vision] Error getting local items for GM cleanup:", e);
            // Fallback: use tracked items
            itemsToRemove = Array.from(managedItemIds);
          }
          
          // Remove all items
          if (itemsToRemove.length > 0) {
            try {
              await OBR.scene.local.deleteItems(itemsToRemove);
            } catch (e) {
              console.warn("[OBP Vision] Error removing items in GM cleanup:", e);
            }
          }
          
          // Clear all tracking
          managedItemIds.clear();
          tokenLightMap.clear();
          fogShapeId = null;
          ambientLightId = null;
          
          // Create or preserve ambient light for GM to ensure full visibility
          // GMs should see everything, but OBR's lighting system may need a light source
          try {
            if (existingAmbientLight) {
              // Reuse existing ambient light
              ambientLightId = existingAmbientLight.id;
              managedItemIds.add(ambientLightId);
            } else {
              // Create a very large ambient light that illuminates the entire scene
              const ambientLight = buildLight()
                .position({ x: 0, y: 0 })
                .attenuationRadius(50000) // Very large radius to cover entire scene
                .build();
              
              await OBR.scene.local.addItems([ambientLight]);
              ambientLightId = ambientLight.id;
              managedItemIds.add(ambientLightId);
            }
          } catch (e) {
            console.warn("[OBP Vision] Error creating ambient light for GM:", e);
          }
          
          // Verify cleanup
          try {
            const remainingItems = await OBR.scene.local.getItems();
            const remainingFog = remainingItems.filter(
              item => item.layer === "FOG" && item.type === "SHAPE"
            );
            const remainingTokenLights = remainingItems.filter(
              item => item.type === "LIGHT" && item.id !== ambientLightId
            );
            if (remainingFog.length > 0 || remainingTokenLights.length > 0) {
              console.warn(`[OBP Vision] GM cleanup warning: ${remainingFog.length} fog shapes and ${remainingTokenLights.length} lights still remain`);
            } else {
            }
          } catch (e) {
          }
          
          return;
        }

        // PLAYER ROLE: Check if vision is disabled
        if (!visionEnabled) {
          // Vision disabled - remove ALL fog and token lights, add ambient light to see everything
          // First, get all local items to find everything we need to remove
          let itemsToRemove = [];
          try {
            const allLocalItems = await OBR.scene.local.getItems();
            
            // Remove ALL fog shapes on FOG layer (aggressive cleanup)
            const fogShapes = allLocalItems.filter(
              item => item.layer === "FOG" && item.type === "SHAPE"
            );
            fogShapes.forEach(fog => {
              itemsToRemove.push(fog.id);
            });
            
            // Remove token lights (but keep ambient light if it exists)
            const lights = allLocalItems.filter(
              item => item.type === "LIGHT" && item.id !== ambientLightId
            );
            lights.forEach(light => {
              itemsToRemove.push(light.id);
            });
            
          } catch (e) {
            console.warn("[OBP Vision] Error getting local items for cleanup:", e);
            // Fallback: use tracked items
            itemsToRemove = Array.from(managedItemIds);
            if (fogShapeId && !itemsToRemove.includes(fogShapeId)) {
              itemsToRemove.push(fogShapeId);
            }
            // Don't remove ambient light
            itemsToRemove = itemsToRemove.filter(id => id !== ambientLightId);
          }
          
          // Remove all items (fog and token lights)
          if (itemsToRemove.length > 0) {
            try {
              await OBR.scene.local.deleteItems(itemsToRemove);
            } catch (e) {
              console.warn("[OBP Vision] Error removing items:", e);
            }
          }
          
          // Create or ensure ambient light exists to illuminate everything
          // This makes the scene fully visible when vision is disabled
          try {
            const allLocalItems = await OBR.scene.local.getItems();
            const existingAmbientLight = ambientLightId 
              ? allLocalItems.find(item => item.id === ambientLightId)
              : null;
            
            if (!existingAmbientLight) {
              // Create a very large ambient light that illuminates the entire scene
              const ambientLight = buildLight()
                .position({ x: 0, y: 0 })
                .attenuationRadius(50000) // Very large radius to cover entire scene
                .build();
              
              await OBR.scene.local.addItems([ambientLight]);
              ambientLightId = ambientLight.id;
              managedItemIds.add(ambientLightId);
            }
          } catch (e) {
            console.warn("[OBP Vision] Error creating ambient light:", e);
          }
          
          // Clear token light tracking (but keep ambient light)
          tokenLightMap.clear();
          fogShapeId = null;
          
          // Verify cleanup by checking again
          try {
            const remainingItems = await OBR.scene.local.getItems();
            const remainingFog = remainingItems.filter(
              item => item.layer === "FOG" && item.type === "SHAPE"
            );
            const remainingTokenLights = remainingItems.filter(
              item => item.type === "LIGHT" && item.id !== ambientLightId
            );
            if (remainingFog.length > 0 || remainingTokenLights.length > 0) {
              console.warn(`[OBP Vision] Warning: ${remainingFog.length} fog shapes and ${remainingTokenLights.length} token lights still remain after cleanup`);
            } else {
            }
          } catch (e) {
          }
          
          return;
        }

        // PLAYER ROLE: Create fog + lights system

        // Remove ambient light if it exists (we only use it when vision is disabled)
        if (ambientLightId) {
          try {
            const allLocalItems = await OBR.scene.local.getItems();
            if (allLocalItems.some(item => item.id === ambientLightId)) {
              await OBR.scene.local.deleteItems([ambientLightId]);
              managedItemIds.delete(ambientLightId);
            }
            ambientLightId = null;
          } catch (e) {
            console.warn("[OBP Vision] Error removing ambient light:", e);
            ambientLightId = null;
          }
        }

        // Get tokens assigned to this player
        const myTokenIds = await getPlayerTokenIds(currentPlayerId);

        // Get all tokens in the scene
        let allTokens = [];
        try {
          allTokens = await OBR.scene.items.getItems(
            item => item.type === "IMAGE" && item.layer === "CHARACTER",
          );
        } catch (e) {
          return;
        }

        // Filter to only tokens assigned to this player
        const myTokens = allTokens.filter(token => myTokenIds.includes(token.id));

        // Get scene grid info for conversions (only once)
        const gridDpi = await OBR.scene.grid.getDpi();
        const feetToWorldUnits = gridDpi / 5;
        
        // Create or reuse fog shape (only create once)
        if (!fogShapeId || !managedItemIds.has(fogShapeId)) {
          const fogSize = 10000;
          const fogShape = buildShape()
            .shapeType("RECTANGLE")
            .width(fogSize)
            .height(fogSize)
            .position({ x: 0, y: 0 })
            .fillColor("#000000")
            .fillOpacity(1)
            .strokeColor("#000000")
            .strokeWidth(0)
            .layer("FOG")
            .build();

          await OBR.scene.local.addItems([fogShape]);
          fogShapeId = fogShape.id;
          managedItemIds.add(fogShapeId);
        }

        // Batch get all token ranges in parallel
        const tokenRanges = await Promise.all(
          myTokens.map(async token => ({
            token,
            range: await getTokenRange(token.id)
          }))
        );

        // Filter out tokens with no vision
        const tokensWithVision = tokenRanges.filter(({ range }) => range > 0);

        // Track what needs to be done with lights
        const lightsToUpdate = [];
        const lightsToCreate = [];
        const lightsToDelete = [];

        // Determine which lights need to be created, updated, or deleted
        const activeTokenIds = new Set(tokensWithVision.map(({ token }) => token.id));
        
        // Find lights to delete (tokens no longer assigned or have no vision)
        for (const [tokenId, lightId] of tokenLightMap.entries()) {
          if (!activeTokenIds.has(tokenId)) {
            lightsToDelete.push(lightId);
            tokenLightMap.delete(tokenId);
            managedItemIds.delete(lightId);
          }
        }

        // Batch check existing lights (much faster than individual lookups)
        const existingLightIds = Array.from(tokenLightMap.values()).filter(id => managedItemIds.has(id));
        let existingLightsMap = new Map();
        if (existingLightIds.length > 0) {
          try {
            const existingLights = await OBR.scene.local.getItems(item => existingLightIds.includes(item.id));
            existingLights.forEach(light => existingLightsMap.set(light.id, light));
          } catch (e) {
            // If we can't get existing lights, we'll recreate them
          }
        }

        // Determine which lights need updating vs creating
        for (const { token, range } of tokensWithVision) {
          const existingLightId = tokenLightMap.get(token.id);
          const attenuationRadius = range * feetToWorldUnits;

          if (existingLightId && existingLightsMap.has(existingLightId)) {
            // Light exists, check if it needs updating
            const existingLight = existingLightsMap.get(existingLightId);
            const needsUpdate = 
              existingLight.position.x !== token.position.x ||
              existingLight.position.y !== token.position.y ||
              existingLight.attenuationRadius !== attenuationRadius;
            
            if (needsUpdate) {
              lightsToUpdate.push({ lightId: existingLightId, token, attenuationRadius });
            }
          } else {
            // New light needed (or was deleted externally)
            if (existingLightId) {
              tokenLightMap.delete(token.id);
              managedItemIds.delete(existingLightId);
            }
            lightsToCreate.push({ token, attenuationRadius });
          }
        }

        // Delete removed lights
        if (lightsToDelete.length > 0) {
          try {
            await OBR.scene.local.deleteItems(lightsToDelete);
          } catch (e) {
            console.warn("[OBP Vision] Failed to delete some lights:", e);
          }
        }

        // Update existing lights in parallel
        if (lightsToUpdate.length > 0) {
          try {
            await OBR.scene.local.updateItems(
              lightsToUpdate.map(({ lightId }) => lightId),
              items => {
                for (let i = 0; i < items.length; i++) {
                  const item = items[i];
                  const { token, attenuationRadius } = lightsToUpdate[i];
                  item.position = token.position;
                  item.attenuationRadius = attenuationRadius;
                }
              }
            );
          } catch (e) {
            console.warn("[OBP Vision] Failed to update some lights:", e);
          }
        }

        // Create new lights in parallel (batch creation)
        if (lightsToCreate.length > 0) {
          const newLights = lightsToCreate.map(({ token, attenuationRadius }) => {
            const light = buildLight()
              .position(token.position)
              .attenuationRadius(attenuationRadius)
              .build();
            tokenLightMap.set(token.id, light.id);
            return light;
          });

          try {
            await OBR.scene.local.addItems(newLights);
            newLights.forEach(light => managedItemIds.add(light.id));
          } catch (e) {
            console.warn("[OBP Vision] Failed to create some lights:", e);
          }
        }

      } catch (e) {
        console.error("[OBP Vision] updateDynamicLighting failed:", e);
      }
    }

    // Load tokens into dropdown
    async function loadTokens() {
      try {
        const previousSelectedId = select.value;
        const allItems = await OBR.scene.items.getItems();
        const tokens = allItems.filter(
          item => item.type === "IMAGE" && item.layer === "CHARACTER",
        );

        select.innerHTML = "";
        tokens.forEach(token => {
          const option = document.createElement("option");
          option.value = token.id;
          option.textContent = token.name || `Token ${token.id.slice(0, 6)}`;
          select.appendChild(option);
        });

        if (previousSelectedId && tokens.some(t => t.id === previousSelectedId)) {
          select.value = previousSelectedId;
        }

        select.disabled = tokens.length === 0;
        await updateRangeDisplay();
      } catch (e) {
        // No scene available yet
      }
    }

    // Update range input display
    async function updateRangeDisplay() {
      const tokenId = select.value;
      if (!tokenId) {
        rangeInput.value = "";
        return;
      }
      const range = await getTokenRange(tokenId);
      rangeInput.value = range.toString();
    }

    // Load players into dropdown
    async function loadPlayers() {
      try {
        const partyPlayers = await OBR.party.getPlayers();
        const selfId = OBR.player.id;
        const selfName = await OBR.player.getName();
        const selfRole = await OBR.player.getRole();

        const selfPlayer = {
          id: selfId,
          name: selfName || "Current User",
          role: selfRole || "UNKNOWN",
        };

        const existsInParty = partyPlayers.some(p => p.id === selfId);
        const allPlayers = existsInParty ? partyPlayers : [selfPlayer, ...partyPlayers];

        cachedPlayers = allPlayers;

        playerSelect.innerHTML = "";
        allPlayers.forEach(player => {
          const option = document.createElement("option");
          option.value = player.id;
          option.textContent = `${player.name} (${player.role})`;
          playerSelect.appendChild(option);
        });

        playerSelect.disabled = allPlayers.length === 0;
      } catch (e) {
        // Party not available yet
      }
    }

    // Get tokens assigned to a player
    async function getTokensForPlayer(playerId) {
      if (!playerId) return [];
      try {
        const tokenIds = await getPlayerTokenIds(playerId);
        if (tokenIds.length === 0) return [];

        const allItems = await OBR.scene.items.getItems();
        return allItems.filter(
          item =>
            item.type === "IMAGE" &&
            item.layer === "CHARACTER" &&
            tokenIds.includes(item.id),
        );
      } catch (e) {
        return [];
      }
    }

    // Update token list display
    async function updateTokenList() {
      const playerId = playerSelect.value;
      if (!playerId) {
        tokenList.innerHTML = "<em style='color: #999; font-style: italic;'>No player selected</em>";
        return;
      }

      const tokens = await getTokensForPlayer(playerId);

      if (tokens.length === 0) {
        tokenList.innerHTML = "<em style='color: #999; font-style: italic;'>No tokens assigned to this player</em>";
        return;
      }

      tokenList.innerHTML = "";
      tokens.forEach((token, index) => {
        const tokenItem = document.createElement("div");
        tokenItem.style.display = "flex";
        tokenItem.style.justifyContent = "space-between";
        tokenItem.style.alignItems = "center";
        tokenItem.style.padding = "0.5rem";
        tokenItem.style.borderBottom = index < tokens.length - 1 ? "1px solid #e0e0e0" : "none";
        tokenItem.style.fontSize = "0.9rem";

        const tokenName = document.createElement("span");
        tokenName.textContent = token.name || `Token ${token.id.slice(0, 6)}`;
        tokenName.style.color = "#333";

        tokenItem.appendChild(tokenName);
        tokenList.appendChild(tokenItem);
      });
    }

    // Assign token to player
    async function setTokenOwner(tokenId, playerId) {
      if (!tokenId || !playerId) return;
      try {
        const sceneMeta = await OBR.scene.getMetadata();
        const playerTokens = sceneMeta?.["obpvision/playerTokens"] || {};

        // Remove token from any other player's list
        for (const pid in playerTokens) {
          if (pid !== playerId) {
            playerTokens[pid] = (playerTokens[pid] || []).filter(id => id !== tokenId);
          }
        }

        // Add token to selected player's list
        if (!playerTokens[playerId]) {
          playerTokens[playerId] = [];
        }
        if (!playerTokens[playerId].includes(tokenId)) {
          playerTokens[playerId].push(tokenId);
        }

        await OBR.scene.setMetadata({
          ...sceneMeta,
          "obpvision/playerTokens": playerTokens,
        });

        // Update lighting for all players (they each run this independently)
        await updateDynamicLighting();

      } catch (e) {
        console.warn("setTokenOwner failed:", e);
      }
    }

    // Remove token from player
    async function removeTokenFromPlayer(tokenId, playerId) {
      if (!tokenId || !playerId) return;
      try {
        const sceneMeta = await OBR.scene.getMetadata();
        const playerTokens = sceneMeta?.["obpvision/playerTokens"] || {};

        if (playerTokens[playerId]) {
          playerTokens[playerId] = playerTokens[playerId].filter(id => id !== tokenId);

          await OBR.scene.setMetadata({
            ...sceneMeta,
            "obpvision/playerTokens": playerTokens,
          });
        }

        await updateDynamicLighting();
      } catch (e) {
        console.warn("removeTokenFromPlayer failed:", e);
      }
    }

    // Event handlers
    select.addEventListener("change", () => {
      void updateRangeDisplay();
    });

    rangeInput.addEventListener("change", async () => {
      const tokenId = select.value;
      if (!tokenId) return;

      const value = Number(rangeInput.value);
      if (Number.isNaN(value) || value < 0) {
        await updateRangeDisplay();
        return;
      }

      await setTokenRange(tokenId, value);
      await updateRangeDisplay();
      await updateDynamicLighting();
    });

    addTokenButton.addEventListener("click", async () => {
      const tokenId = select.value;
      const playerId = playerSelect.value;
      if (!tokenId || !playerId) return;

      await setTokenOwner(tokenId, playerId);
      await updateTokenList();
    });

    removeTokenButton.addEventListener("click", async () => {
      const tokenId = select.value;
      const playerId = playerSelect.value;
      if (!tokenId || !playerId) return;

      await removeTokenFromPlayer(tokenId, playerId);
      await updateTokenList();
    });

    playerSelect.addEventListener("change", () => {
      void updateTokenList();
    });

    // Toggle checkbox event handler
    toggleCheckbox.addEventListener("change", async () => {
      const enabled = toggleCheckbox.checked;
      setVisionEnabled(enabled);
      
      // Clear any pending debounced updates
      if (lightingUpdateTimeout) {
        clearTimeout(lightingUpdateTimeout);
        lightingUpdateTimeout = null;
      }
      
      await updateDynamicLighting();
      
      // Update toggle row styling based on state
      if (enabled) {
        toggleRow.style.borderColor = "#4CAF50";
        toggleRow.style.backgroundColor = "#f0f8f0";
        toggleLabel.style.color = "#2e7d32";
      } else {
        toggleRow.style.borderColor = "#999";
        toggleRow.style.backgroundColor = "#f5f5f5";
        toggleLabel.style.color = "#666";
      }
    });

    // Update initial toggle styling
    if (!savedEnabled) {
      toggleRow.style.borderColor = "#999";
      toggleRow.style.backgroundColor = "#f5f5f5";
      toggleLabel.style.color = "#666";
    }

    // Debounce lighting updates (reduced delay for faster response)
    let lightingUpdateTimeout = null;
    const debouncedLightingUpdate = () => {
      // Don't update if vision is disabled
      if (!getVisionEnabled()) {
        return;
      }
      if (lightingUpdateTimeout) clearTimeout(lightingUpdateTimeout);
      lightingUpdateTimeout = setTimeout(() => {
        // Double-check vision is still enabled before updating
        if (getVisionEnabled()) {
          void updateDynamicLighting();
        }
      }, 100); // Reduced from 500ms to 100ms for faster response
    };

    // Update lighting when tokens move (only if vision is enabled)
    OBR.scene.items.onChange(async () => {
      await loadTokens();
      // Only update lighting if vision is enabled
      if (getVisionEnabled()) {
        debouncedLightingUpdate();
      }
    });

    // Initialize
    await loadTokens();
    await loadPlayers();
    await updateTokenList();
    await updateDynamicLighting();

    OBR.party.onChange(loadPlayers);

  });
}


