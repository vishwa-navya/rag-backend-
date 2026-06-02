const express = require("express");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const knowledgeBase = JSON.parse(
  fs.readFileSync("./vishwa_profile.json", "utf8")
);

app.get("/", (req, res) => {
  res.send("Vishwa AI Backend Running 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "I need a question to answer."
      });
    }

    const lowerMessage = message.toLowerCase();

    // =========================
    // CHALLENGE SELECTION
    // =========================

    if (
      lowerMessage.includes("challenge") &&
      !lowerMessage.includes("technical") &&
      !lowerMessage.includes("non")
    ) {
      return res.json({
        type: "choice",
        message:
          "I would love to share the challenges I have faced. Before that, could you clarify which type of challenge you would like to know about?",
        options: [
          "Technical Challenge",
          "Non-Technical Challenge"
        ]
      });
    }

    // =========================
    // LESSON SELECTION
    // =========================

    if (
      lowerMessage.includes("lesson") &&
      !lowerMessage.includes("technical") &&
      !lowerMessage.includes("non")
    ) {
      return res.json({
        type: "choice",
        message:
          "I would love to share the lessons I have learned. Before that, could you clarify which type of lesson you would like to know about?",
        options: [
          "Technical Lesson",
          "Non-Technical Lesson"
        ]
      });
    }

    // =========================
    // DIRECT CHALLENGE ANSWERS
    // =========================

    if (lowerMessage === "technical challenge") {
      return res.json({
        reply:
          knowledgeBase.interactive_responses.challenges.technical
      });
    }

    if (lowerMessage === "non technical challenge") {
      return res.json({
        reply:
          knowledgeBase.interactive_responses.challenges.non_technical
      });
    }

    // =========================
    // DIRECT LESSON ANSWERS
    // =========================

    if (lowerMessage === "technical lesson") {
      return res.json({
        reply:
          knowledgeBase.interactive_responses.lessons_learned.technical
      });
    }

    if (lowerMessage === "non technical lesson") {
      return res.json({
        reply:
          knowledgeBase.interactive_responses.lessons_learned.non_technical
      });
    }

    const context = JSON.stringify(knowledgeBase, null, 2);

    const systemPrompt = `
You are Vishwa AI.

You ARE Vishwa.

Always answer in first person.

VERY IMPORTANT:
- Start answers with "I".
- Speak as if you are Vishwa himself.
- Never say "According to the profile".
- Never say "The user".
- Never say "Vishwa is".
- Always say "I am", "I completed", "I built", "I learned".
- If asked about family, answer from family section.
- If asked about hobbies, answer from hobbies section.
- If asked about achievements, answer from achievements section.
- If asked about favorite food, favorite actor, favorite cricketer, answer from favorites section.

Examples:

Question:
Which college did you study in?

Answer:
I completed my B.E. in Mechatronics Engineering at Paavai Engineering College with a CGPA of 8.0.

Question:
What is your favorite food?

Answer:
I love Dosa 🥞 and Chicken Biryani 🍗🍛.

Question:
What is your goal?

Answer:
I want to become an AI Developer or Full Stack Developer and work on impactful real-world products.

Use only the information provided below.

Knowledge Base:
${context}
`;

    const response = await fetch(
      "https://api.sambanova.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SAMBANOVA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Llama-4-Maverick-17B-128E-Instruct",
          temperature: 0.1,
          top_p: 0.1,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "I couldn't find an answer right now.";

    return res.json({
      reply
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      reply: "I am facing a temporary issue. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
