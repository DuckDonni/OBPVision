import OBR from "@owlbear-rodeo/sdk";
import { setupVisionControls } from "./hub.js";

OBR.onReady(async () => {
  // Get all current players
  const players = await OBR.party.getPlayers();

  // Subscribe to future changes
  OBR.party.onChange(updatedPlayers => {
    // Party changed
  });
});

export function setupCounter(element) {
  // The original element is a <button>. Interactive elements (like a <select>)
  // inside a <button> can't be clicked properly, so replace the button with
  // our own container and mount the controls there.
  const container = document.createElement("div");
  container.id = "vision-controls-container";

  // Replace the button node with our div
  element.replaceWith(container);

  // Build the dropdown + buttons UI inside the new container
  setupVisionControls(container);
}