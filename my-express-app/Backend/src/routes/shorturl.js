const express = require("express");
const router = express.Router();
const { Log } = require("../middleware/logger");
const {
  generateShortcode,
  isValidUrl,
  isValidShortcode,
} = require("../utils/helpers");

const urlStore = {};

router.post("/", async (req, res) => {
  const { url, validity, shortcode } = req.body;

  if (!url || !isValidUrl(url)) {
    Log(
      "backend",
      "error",
      "route",
      "Invalid or missing URL in POST /shorturl"
    );
    return res.status(400).json({ error: "Invalid or missing URL" });
  }

  let code = shortcode;
  if (code) {
    if (!isValidShortcode(code)) {
      Log(
        "backend",
        "error",
        "route",
        "Invalid shortcode format in POST /shorturl"
      );
      return res
        .status(400)
        .json({ error: "Shortcode must be alphanumeric and at least 4 chars" });
    }
    if (urlStore[code]) {
      Log("backend", "error", "route", "Shortcode collision in POST /shorturl");
      return res.status(409).json({ error: "Shortcode already exists" });
    }
  } else {
    do {
      code = generateShortcode(6);
    } while (urlStore[code]);
  }

  const validMinutes =
    Number.isInteger(validity) && validity > 0 ? validity : 30;
  const now = new Date();
  const expiry = new Date(now.getTime() + validMinutes * 60000);

  urlStore[code] = {
    url,
    createdAt: now.toISOString(),
    expiry: expiry.toISOString(),
    clicks: [],
    validity: validMinutes,
  };

  Log("backend", "info", "route", `Short URL created: ${code} for ${url}`);

  res.status(201).json({
    shortLink: `${req.protocol}://${req.get("host")}/shorturl/${code}`,
    expiry: expiry.toISOString(),
  });
});

router.get("/:shortcode", async (req, res) => {
  const { shortcode } = req.params;
  const entry = urlStore[shortcode];

  if (!entry) {
    Log("backend", "error", "route", `Shortcode not found: ${shortcode}`);
    return res.status(404).json({ error: "Shortcode does not exist" });
  }

  const now = new Date();
  if (new Date(entry.expiry) < now) {
    Log("backend", "warn", "route", `Shortcode expired: ${shortcode}`);
    return res.status(410).json({ error: "Short link has expired" });
  }

  const click = {
    timestamp: now.toISOString(),
    referrer: req.get("referer") || null,
    ip: req.ip,
  };
  entry.clicks.push(click);

  Log("backend", "info", "route", `Redirected: ${shortcode} to ${entry.url}`);

  res.redirect(entry.url);
});

router.get("/stats/:shortcode", async (req, res) => {
  const { shortcode } = req.params;
  const entry = urlStore[shortcode];

  if (!entry) {
    Log(
      "backend",
      "error",
      "route",
      `Stats requested for non-existent shortcode: ${shortcode}`
    );
    return res.status(404).json({ error: "Shortcode does not exist" });
  }

  const now = new Date();
  const expired = new Date(entry.expiry) < now;

  const stats = {
    totalClicks: entry.clicks.length,
    url: entry.url,
    createdAt: entry.createdAt,
    expiry: entry.expiry,
    expired,
    clicks: entry.clicks.map((click) => ({
      timestamp: click.timestamp,
      referrer: click.referrer,
      ip: click.ip,
    })),
  };

  Log("backend", "info", "route", `Stats returned for shortcode: ${shortcode}`);

  res.json(stats);
});

module.exports = router;
