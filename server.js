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

    res.json({
      reply
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      reply: "I am facing a temporary issue. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
