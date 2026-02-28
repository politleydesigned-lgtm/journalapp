import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";
import Database from "better-sqlite3";

dotenv.config();

const db = new Database("journal.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    summary TEXT
  )
`);

let stripeClient: Stripe | null = null;

function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables.");
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", stripeConfigured: !!process.env.STRIPE_SECRET_KEY });
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const stripe = getStripe();
      const { priceId, email, personaId } = req.body;

      const origin = req.headers.origin || process.env.APP_URL || "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "link"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: personaId === "lifetime" ? "Lifetime Privacy Unlock" : `Persona Unlock: ${personaId}`,
                description: personaId === "lifetime" 
                  ? "Unlock Vector Search & Long-term Memory" 
                  : `Unlock the ${personaId} persona for your Privacy Vault.`,
              },
              unit_amount: personaId === "lifetime" ? 4999 : 999,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        customer_email: email,
        success_url: `${origin}?success=true&personaId=${personaId}`,
        cancel_url: `${origin}?canceled=true`,
        payment_intent_data: {
          metadata: {
            personaId,
            email,
          },
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Journal API routes
  app.get("/api/journal", (req, res) => {
    try {
      const entries = db.prepare("SELECT * FROM journal_entries ORDER BY timestamp DESC").all();
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/journal", (req, res) => {
    try {
      const { id, text, timestamp, summary } = req.body;
      db.prepare("INSERT INTO journal_entries (id, text, timestamp, summary) VALUES (?, ?, ?, ?)").run(
        id,
        text,
        timestamp,
        summary
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/journal", (req, res) => {
    try {
      db.prepare("DELETE FROM journal_entries").run();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
