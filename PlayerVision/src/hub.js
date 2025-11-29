// hub.js
import OBR, { buildLight } from "@owlbear-rodeo/sdk";

// Build UI controls for selecting a token and changing its vision range
// NOTE: This assumes it's called after the DOM is ready. We wait for OBR.onReady
// before touching the Owlbear APIs so the dropdown actually gets populated.
export function setupVisionControls(container) {
  // UI elements
  const wrapper = document.createElement("div");

  const select = document.createElement("select");
  select.id = "vision-token-select";

  const rangeLabel = document.createElement("label");
  rangeLabel.style.marginLeft = "0.5rem";
  rangeLabel.textContent = "Range: ";

  const rangeInput = document.createElement("input");
  rangeInput.type = "number";
  rangeInput.min = "0";
  rangeInput.style.width = "4rem";
  rangeInput.placeholder = "-1";

  rangeLabel.appendChild(rangeInput);

  // Player dropdown + metadata button
  const playerWrapper = document.createElement("div");
  playerWrapper.style.marginTop = "1rem";

  const playerLabel = document.createElement("label");
  playerLabel.textContent = "Player: ";

  const playerSelect = document.createElement("select");
  playerSelect.id = "player-select";
  playerSelect.style.marginLeft = "0.5rem";

  const showPlayerButton = document.createElement("button");
  showPlayerButton.type = "button";
  showPlayerButton.textContent = "Show Player Metadata";
  showPlayerButton.style.marginLeft = "0.5rem";

  playerLabel.appendChild(playerSelect);
  playerWrapper.appendChild(playerLabel);
  playerWrapper.appendChild(showPlayerButton);

  wrapper.appendChild(select);
  wrapper.appendChild(rangeLabel);
  wrapper.appendChild(playerWrapper);

  container.appendChild(wrapper);

  // Defer all SDK interaction until OBR is actually ready
  OBR.onReady(async () => {
    // --- Data helpers ---
    let cachedPlayers = [];

    async function loadTokens() {
      try {
        // Remember which token was selected before reload
        const previousSelectedId = select.value;

        // In Owlbear 2.x "tokens" are IMAGE items on the CHARACTER layer
        const allItems = await OBR.scene.items.getItems();
        const tokens = allItems.filter(
          item => item.type === "IMAGE" && item.layer === "CHARACTER",
        );

        // Log the tokens that will appear in the dropdown
        console.log("Tokens available for vision control dropdown:");
        tokens.forEach(token => {
          console.log(`- ${token.id} | ${token.name || `Token ${token.id.slice(0, 6)}`}`);
        });

        // Rebuild options
        select.innerHTML = "";
        tokens.forEach(token => {
          const option = document.createElement("option");
          option.value = token.id;
          option.textContent = token.name || `Token ${token.id.slice(0, 6)}`;
          select.appendChild(option);
        });

        // Try to restore previous selection if that token still exists
        if (previousSelectedId && tokens.some(t => t.id === previousSelectedId)) {
          select.value = previousSelectedId;
        }

        // Disable dropdown if there are no tokens
        select.disabled = tokens.length === 0;

        await updateRangeLabel();
      } catch (e) {
        console.warn("loadTokens skipped (no active scene yet):", e);
      }
    }

    // Read the current Dynamic Fog light range for a token from its metadata.
    // The Dynamic Fog extension stores its light config on the token under:
    //   metadata["rodeo.owlbear.dynamic-fog/light"]
    // That object includes `attenuationRadius`, `sourceRadius`, `falloff`, etc.
    // We derive the displayed "range" from attenuationRadius.
    // Returns the range value (e.g. 30, 40) or -1 if no light is found.
    async function getRange(tokenId) {
      if (!tokenId) return -1;
      try {
        // This SDK version doesn't have scene.items.getItem, so we filter getItems.
        const [token] = await OBR.scene.items.getItems(item => item.id === tokenId);
        if (!token) {
          console.log("[OBP Vision] getRange: no token found for id", tokenId);
          return -1;
        }

        console.log("[OBP Vision] getRange: token object:", token);
        console.log("[OBP Vision] getRange: token.metadata:", token.metadata);

        const dfMeta = token.metadata?.["rodeo.owlbear.dynamic-fog/light"];
        if (!dfMeta || typeof dfMeta.attenuationRadius !== "number") {
          // No Dynamic Fog light stored for this token
          return -1;
        }

        // From your logs:
        //  - attenuationRadius 900 corresponds to a UI range of 30
        //  - attenuationRadius 1200 corresponds to a UI range of 40
        // so attenuationRadius appears to be 30 * range.
        // We invert that relationship to recover the displayed range.
        const rawRadius = dfMeta.attenuationRadius;
        const range = rawRadius / 30;
        const rounded = Math.round(range);

        console.log(
          "[OBP Vision] getRange: attenuationRadius",
          rawRadius,
          "=> derived range",
          rounded,
        );

        return rounded;
      } catch (e) {
        console.warn("getRange failed while reading scene items:", e);
        return -1;
      }
    }

    // Write a new Dynamic Fog range back into the token metadata.
    async function setRange(tokenId, newRange) {
      if (!tokenId) return;
      // Clamp to non-negative integer
      const clamped = Math.max(0, Math.round(newRange));

      try {
        await OBR.scene.items.updateItems([tokenId], items => {
          for (const item of items) {
            const meta = item.metadata || {};
            const dfMeta = meta["rodeo.owlbear.dynamic-fog/light"] || {};

            // Invert our earlier relationship: attenuationRadius = range * 30
            const attenuationRadius = clamped * 30;

            item.metadata = {
              ...meta,
              "rodeo.owlbear.dynamic-fog/light": {
                ...dfMeta,
                attenuationRadius,
              },
            };
          }
        });
      } catch (e) {
        console.warn("setRange failed while writing scene items:", e);
      }
    }

    // Write a new Dynamic Fog range back into the token metadata.
    async function setRange(tokenId, newRange) {
      if (!tokenId) return;
      // Clamp to non-negative integer
      const clamped = Math.max(0, Math.round(newRange));

      try {
        await OBR.scene.items.updateItems([tokenId], items => {
          for (const item of items) {
            const meta = item.metadata || {};
            const dfMeta = meta["rodeo.owlbear.dynamic-fog/light"] || {};

            // Invert our earlier relationship: attenuationRadius = range * 30
            const attenuationRadius = clamped * 30;

            item.metadata = {
              ...meta,
              "rodeo.owlbear.dynamic-fog/light": {
                ...dfMeta,
                attenuationRadius,
              },
            };
          }
        });
      } catch (e) {
        console.warn("setRange failed while writing scene items:", e);
      }
    }

    async function updateRangeLabel() {
      const tokenId = select.value;
      if (!tokenId) {
        rangeInput.value = "";
        return;
      }
      const r = await getRange(tokenId);
      rangeInput.value = r.toString();
    }

    // Load all players (including the current user) into the player dropdown
    async function loadPlayers() {
      try {
        const partyPlayers = await OBR.party.getPlayers();

        // Current user info may not be in partyPlayers (e.g. GM), so merge it in.
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

        console.log("Players available for metadata dropdown:");
        allPlayers.forEach(p => {
          console.log(`- ${p.id} | ${p.name} | ${p.role}`);
        });

        playerSelect.innerHTML = "";
        allPlayers.forEach(player => {
          const option = document.createElement("option");
          option.value = player.id;
          option.textContent = `${player.name} (${player.role})`;
          playerSelect.appendChild(option);
        });

        playerSelect.disabled = allPlayers.length === 0;
      } catch (e) {
        console.warn("loadPlayers skipped (party not available yet):", e);
      }
    }

    // --- Event wiring ---

    select.addEventListener("change", () => {
      void updateRangeLabel();
    });

    rangeInput.addEventListener("change", async () => {
      const tokenId = select.value;
      if (!tokenId) return;

      const value = Number(rangeInput.value);
      if (Number.isNaN(value)) {
        // Reset to the current value from metadata
        await updateRangeLabel();
        return;
      }

      await setRange(tokenId, value);
      await updateRangeLabel();
    });

    showPlayerButton.addEventListener("click", async () => {
      const selectedId = playerSelect.value;
      if (!selectedId) return;

      // Prefer cached data; fall back to live party if needed.
      let player = cachedPlayers.find(p => p.id === selectedId);

      if (!player) {
        try {
          const freshPlayers = await OBR.party.getPlayers();
          player = freshPlayers.find(p => p.id === selectedId);
        } catch (e) {
          console.warn("Unable to refresh players when showing metadata:", e);
        }
      }

      if (!player) {
        console.log("[OBP Vision] No player metadata found for id:", selectedId);
        return;
      }

      console.log("[OBP Vision] Player metadata for", selectedId, ":", player);
    });

    // Initial load, and keep in sync if scene items change
    await loadTokens();
    OBR.scene.items.onChange(loadTokens);

    await loadPlayers();
    OBR.party.onChange(loadPlayers);
  });
}