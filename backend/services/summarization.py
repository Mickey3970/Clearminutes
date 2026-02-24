import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


SUMMARY_PROMPT = """You are a professional meeting analyst. Produce structured, factual meeting minutes from a raw transcript.
Be concise and precise. Never invent information not present in the transcript.

Return ONLY a valid JSON object with exactly this structure, no extra text, no markdown:

{
  "overview": "<2-4 sentence summary of the meeting purpose and outcome>",
  "key_points": ["<point 1>", "<point 2>"],
  "decisions": ["<decision 1>"],
  "open_questions": ["<question 1>"]
}

Rules:
- overview: What was discussed and what was concluded. No filler phrases.
- key_points: Max 8 items. Each a standalone informative sentence of 10-20 words.
- decisions: Only explicitly confirmed decisions. Omit proposals still under consideration.
- open_questions: Questions raised but NOT resolved during the meeting.
- If a section has nothing, return an empty array [].
"""

EXTRACTION_PROMPT = """You are a task extraction specialist. Extract only explicit action items from meeting transcripts.
Never infer or assume tasks. If something is vague, omit it.

Return ONLY a valid JSON array, no extra text, no markdown:

[
  {
    "task": "<clear verb-led description e.g. Send Q3 budget report to finance team>",
    "assignee": "<name or role if explicitly stated, else null>",
    "deadline": "<date or timeframe if explicitly stated, else null>",
    "confidence": "<high|medium|low>",
    "evidence": "<verbatim quote under 20 words that supports this task>"
  }
]

Rules:
- task must start with an action verb (Send, Create, Review, Schedule, Fix, etc.)
- Only include items where someone clearly volunteered or was assigned work
- 'We should look into X' = low confidence at most
- 'I will do X by Friday' = high confidence
- If no action items exist, return an empty array []
"""


def summarize_transcript(transcript: str) -> dict:
    response = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        messages=[
            {"role": "system", "content": SUMMARY_PROMPT},
            {"role": "user", "content": f"Transcript:\n{transcript}"}
        ]
    )
    raw = response.choices[0].message.content.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)


def extract_action_items(transcript: str) -> list:
    response = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        messages=[
            {"role": "system", "content": EXTRACTION_PROMPT},
            {"role": "user", "content": f"Transcript:\n{transcript}"}
        ]
    )
    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)