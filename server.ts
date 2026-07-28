import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Nodemailer Test Transporter (Ethereal) setup lazily
let transporter: nodemailer.Transporter | null = null;
async function getTransporter() {
  if (!transporter) {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback to test ethereal account
      let testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("Using Ethereal Mail for testing OTPs. Check logs for test URLs.");
    }
  }
  return transporter;
}

// Check verification code hash match
app.post("/api/auth/verify-otp", (req, res) => {
  const { code, hash } = req.body;
  if (!code || !hash) return res.status(400).json({ error: "Missing code or hash" });
  
  const computedHash = crypto.createHash('sha256').update(code.toString()).digest('hex');
  if (computedHash === hash) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

// Send Verification Email Route
app.post("/api/auth/send-verification", async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash the OTP using SHA-256
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins expiry

  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: '"MUNKG Secretariat" <noreply@munkg.org>',
      to: email,
      subject: "Your Email Verification Code",
      text: `Hello ${name || 'Delegate'},\n\nYour MUN Platform verification code is: ${otp}\n\nThis code will expire in 15 minutes.\n\nBest regards,\nMUNKG Secretariat`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #1e293b;">
          <h2 style="color: #1a365d;">Email Verification</h2>
          <p>Hello <strong>${name || 'Delegate'}</strong>,</p>
          <p>Thank you for registering on the MUN Diplomatic Portal. Please use the following complete verification code to activate your account:</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 40px;">If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    const testUrl = nodemailer.getTestMessageUrl(info);
    if (testUrl) {
      console.log(`[Email Sent to ${email}] OTP: ${otp} | Preview URL: ${testUrl}`);
    } else {
      console.log(`[Email Sent to ${email}] OTP: ${otp} (Real SMTP mode)`);
    }

    res.json({
      success: true,
      hash: hashedOtp,
      expiresAt: expiresAt,
      testUrl: testUrl || undefined
    });
  } catch (error: any) {
    console.error("Email sending error:", error);
    res.status(500).json({ error: "Failed to send verification email" });
  }
});

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in Settings > Secrets or .env file.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. API: Draft a UN Resolution using Gemini
// Send Password Reset Email Route
app.post("/api/auth/send-password-reset", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash the OTP using SHA-256
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins expiry

  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: '"MUNKG Secretariat" <noreply@munkg.org>',
      to: email,
      subject: "Password Reset Code",
      text: `Hello,\n\nYour MUN Platform password reset code is: ${otp}\n\nThis code will expire in 15 minutes.\n\nBest regards,\nMUNKG Secretariat`,
      html: `
        <div style="font-family: sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1a365d; text-transform: uppercase;">Password Reset</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Use the verification code below to authorize the reset:</p>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 4px;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 12px;">This code will expire in 15 minutes.</p>
          <hr style="border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
          <p style="color: #94a3b8; font-size: 11px;">If you did not request this, please ignore this email.</p>
        </div>
      `
    });
    
    console.log("Password Reset Email sent: %s", info.messageId);
    
    res.json({ 
      success: true, 
      hash: hashedOtp,
      expiresAt: expiresAt,
      message: "Password reset email sent."
    });
  } catch (error) {
    console.error("Error sending reset email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post("/api/resolution/generate", async (req, res) => {
  const { country, committee, topic, clauseType, customFocus } = req.body;

  if (!country || !committee || !topic) {
    return res.status(400).json({ error: "Missing required parameters: country, committee, topic" });
  }

  try {
    const ai = getGeminiClient();
    
    const prompt = `
You are an expert United Nations diplomat and Model UN (MUN) director.
Write a professional draft section of a UN resolution for:
- Committee: ${committee}
- Country: ${country}
- Topic: ${topic}
- Section type requested: ${clauseType || "both"} (preambulatory, operative, or both)
- Additional focus/instructions: ${customFocus || "None"}

Please format the response in professional UN terminology, including:
1. Official headings (e.g., "COMMITTEE: ...", "SPONSOR: ...", "TOPIC: ...")
2. Preambulatory Clauses (usually starting with italicized participial adjectives like "Deeply concerned," "Alarmed by," "Welcoming," "Guided by," ending with commas)
3. Operative Clauses (numbered sequentially, starting with active verbs like "Urges," "Recommends," "Decides," "Requests," ending with semicolons, with the final clause ending in a period)

In addition to the clauses, provide a 2-3 sentence 'Diplomatic Advice' section specifically tailored for the delegate representing ${country} in ${committee} on how to successfully negotiate this resolution and align with potential allies.

Output formatting: Return clean Markdown.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Resolution Error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate MUN resolution draft",
      isConfigError: !process.env.GEMINI_API_KEY
    });
  }
});

// 2. API: Get Country Profile & Alignment Analytics
app.post("/api/country/profile", async (req, res) => {
  const { country, topic } = req.body;

  if (!country) {
    return res.status(400).json({ error: "Missing country parameter" });
  }

  try {
    const ai = getGeminiClient();

    const prompt = `
You are a global UN affairs analyst. Generate a comprehensive MUN country profile for:
- Country: ${country}
${topic ? `- Context Issue/Topic of interest: ${topic}` : ""}

Provide the output in structured JSON matching this JSON schema:
{
  "countryName": "string (the official un country name)",
  "capital": "string",
  "bloc": "string (e.g., EU, African Union, NAM, G77, Arab League, Latin American, etc.)",
  "generalStance": "string (1-2 sentences summarizing global stance)",
  "keyAllies": ["string", "string", "string"],
  "historicalAdversaries": ["string", "string"],
  "votingTrends": "string (brief summary of un voting behaviour on related general issues)",
  "resolutionPragmatics": {
    "redLines": "string (what the country absolutely will NOT sign or accept)",
    "priorityClauses": "string (what this country pushes for in resolutions)"
  },
  "tacticalAdvice": "string (short tip for delegate how to represent this country in an MUN session)"
}

Ensure the output is valid JSON according to this structure:
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            countryName: { type: Type.STRING },
            capital: { type: Type.STRING },
            bloc: { type: Type.STRING },
            generalStance: { type: Type.STRING },
            keyAllies: { type: Type.ARRAY, items: { type: Type.STRING } },
            historicalAdversaries: { type: Type.ARRAY, items: { type: Type.STRING } },
            votingTrends: { type: Type.STRING },
            resolutionPragmatics: {
              type: Type.OBJECT,
              properties: {
                redLines: { type: Type.STRING },
                priorityClauses: { type: Type.STRING }
              },
              required: ["redLines", "priorityClauses"]
            },
            tacticalAdvice: { type: Type.STRING }
          },
          required: ["countryName", "capital", "bloc", "generalStance", "keyAllies", "historicalAdversaries", "votingTrends", "resolutionPragmatics", "tacticalAdvice"]
        }
      }
    });

    let data = {};
    try {
      if (response.text) {
        data = JSON.parse(response.text.trim());
      }
    } catch (e) {
      console.warn("Could not parse JSON response directly, raw text: ", response.text);
      data = { rawText: response.text };
    }

    res.json(data);
  } catch (error: any) {
    console.error("Gemini Country Profile Error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate MUN country intelligence profile",
      isConfigError: !process.env.GEMINI_API_KEY
    });
  }
});

// 3. API: Generate custom simulated Global Security Briefing (International News Generator)
app.post("/api/briefing/generate", async (req, res) => {
  const { region, securityLevel } = req.body;

  try {
    const ai = getGeminiClient();

    const prompt = `
Generate a highly authentic, diplomatic, and compelling urgent international security or global development "briefing dispatch"
suitable for Model UN delegates study.
Target Region/Domain: ${region || "Global Security"}
Diplomatic Urgency Level: ${securityLevel || "High"} (Critical, Moderate, Low Warning)

Produce a briefing containing:
1. Dispatch Headline (high-impact, neutral diplomatic journalistic style, similar to Reuters or AP)
2. Crisis/Situation Dateline (e.g., GENEVA, NEW YORK, ADDIS ABABA)
3. Three-paragraph high-fidelity intelligence overview of the issue, touching upon international law, refugee/humanitarian dynamics, and multilateral responses.
4. Key UN Committees engaged (e.g., UNSC, UNHCR, UNEP).
5. Discussion Questions for delegates.

Return this formatted beautifully in clean markdown. Keep it educational and directly aligned with the pedagogy of MUN training.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Briefing Error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate security briefing",
      isConfigError: !process.env.GEMINI_API_KEY
    });
  }
});

// Serve Vite dynamic assets or production static build
const isProd = process.env.NODE_ENV === "production";

async function setupApp() {
  if (!isProd) {
    // Dynamically import Vite server only in development to save runtime overhead in prod
    const { createServer: createViteServer } = await import("vite");
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupApp();
