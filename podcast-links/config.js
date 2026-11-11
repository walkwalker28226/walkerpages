/**
 * Canna-Chats — Podcast Links Page Config
 * ----------------------------------------
 * Update this file when the VDO Ninja room name changes,
 * when seats are reassigned, or to add/remove people.
 * The page at walkerops.com/podcast-links/ rebuilds itself from this config.
 *
 * To publish changes: update this file, commit, and push to GitHub.
 * GitHub Pages serves the update within ~60 seconds.
 */

const PODCAST_CONFIG = {

  // ── Room settings ─────────────────────────────────────────────────────────
  // The VDO Ninja room name. Changing this updates every link on the page.
  room: "VACannabisLawyersPodcast",

  // Optional: room password (leave empty string if no password)
  roomPassword: "",

  // Your director password (producer's Control Room). Keep this private —
  // only the producer link uses it.
  directorPassword: "",

  // VDO Ninja base URL (don't change unless self-hosting)
  vdoBase: "https://vdo.ninja",

  // ── Guest board base URL ───────────────────────────────────────────────────
  // Where the guest-room folder lives on walkerops.com.
  guestBoardBase: "https://walkerops.com/podcast-guest/",

  // ── Producer ──────────────────────────────────────────────────────────────
  producer: {
    name: "Bill",
    // Director key — leave as empty string to omit &director= from the link.
    // If set, this is added to the Control Room URL as &director=VALUE
    directorKey: "",
  },

  // ── Hosts & regular guests ────────────────────────────────────────────────
  // Each entry produces one row on the page.
  // push_id:  the VDO Ninja stream ID for this seat's camera in OBS.
  //           Matches what OBS has stored for that camera source.
  //           Guests open their link; this ID makes OBS always find them.
  // view_id:  same as push_id (OBS pulls with this ID).
  // is_host:  gets the full guest board with Links section and Reactions.
  seats: [
    {
      seat:    1,
      name:    "Brian",
      push_id: "brian1cc",   // ← the stream ID OBS uses for Seat 1
      is_host: true,
    },
    {
      seat:    2,
      name:    "Tyson",
      push_id: "tyson2cc",   // ← the stream ID OBS uses for Seat 2
      is_host: true,
    },
    {
      seat:    3,
      name:    "Guest 3",
      push_id: "guest3cc",
      is_host: false,
    },
    {
      seat:    4,
      name:    "Guest 4",
      push_id: "guest4cc",
      is_host: false,
    },
  ],

  // ── Watch-only viewers ────────────────────────────────────────────────────
  // These links open the room in view-only mode (no camera or mic).
  viewers: [
    { name: "Whole room (watch only)", view: "all" },
  ],

  // ── Extra production links ────────────────────────────────────────────────
  // Add any links the team needs during a show (YouTube Studio, live chat, etc.)
  extras: [
    { label: "YouTube Studio",    url: "https://studio.youtube.com/" },
    { label: "YouTube Live Chat", url: "https://youtube.com/live_chat" },
  ],

};
