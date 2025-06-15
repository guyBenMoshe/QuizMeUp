import spacy
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
import torch
import json
import sys
import re
from concurrent.futures import ThreadPoolExecutor

# Load NLP
nlp = spacy.load("en_core_web_sm")

# Detect GPU
device = 0 if torch.cuda.is_available() else -1

# Load models
qg_tokenizer = AutoTokenizer.from_pretrained("./models/qg")
qg_model = AutoModelForSeq2SeqLM.from_pretrained("./models/qg")
qg_pipe = pipeline("text2text-generation", model=qg_model, tokenizer=qg_tokenizer, device=device)

distractor_tokenizer = AutoTokenizer.from_pretrained("./models/dist")
distractor_model = AutoModelForSeq2SeqLM.from_pretrained("./models/dist")
distractor_pipe = pipeline("text2text-generation", model=distractor_model, tokenizer=distractor_tokenizer, device=device)

# NLP utils
def extract_focus_term(sentence):
    doc = nlp(sentence)
    for ent in doc.ents:
        return ent
    for chunk in doc.noun_chunks:
        if len(chunk.text.strip().split()) > 1:
            return chunk
    for token in doc:
        if token.dep_ in {"nsubj", "dobj", "pobj"} and token.pos_ in {"NOUN", "PROPN"}:
            return token
    return None

def highlight(sentence, term):
    return sentence.replace(term.text, f"<hl> {term.text} <hl>")

# Core logic
def generate_question(sentence_with_hl):
    prompt = f"Write a natural, human-like multiple-choice question based on this sentence: {sentence_with_hl}"
    try:
        result = qg_pipe(prompt, max_length=72, num_beams=4, early_stopping=True)[0]["generated_text"]
        return result.strip()
    except Exception:
        return None

def generate_distractors(question, correct_answer, max_attempts=2):
    distractors = []

    def clean(text):
        parts = re.split(r"\d+\.\s*", text)
        cleaned = []
        for part in parts:
            choice = part.strip()
            if not choice:
                continue
            if correct_answer.lower() in choice.lower():
                continue
            if choice.lower() not in [d.lower() for d in distractors + cleaned]:
                cleaned.append(choice)
        return cleaned

    attempt = 0
    while len(distractors) < 3 and attempt < max_attempts:
        prompt = (
            f"Question: {question}\n"
            f"Correct answer: {correct_answer}\n"
            f"Write 3 short but plausible and incorrect answers in a list format."
        )
        try:
            result = distractor_pipe(prompt, max_length=72)[0]["generated_text"]
            new_distractors = clean(result)
            distractors.extend(new_distractors)
            seen = set()
            distractors = [x for x in distractors if not (x.lower() in seen or seen.add(x.lower()))]
        except Exception:
            break
        attempt += 1

    return distractors[:3]

def normalize_answers(question, correct, distractors):
    all_answers = [correct] + distractors
    base_prompt = (
        f"Format these answers for the following question so they all look consistent, and natural:\n"
        f"Question: {question}\n"
        f"Answers:\n"
    )
    for i, ans in enumerate(all_answers):
        base_prompt += f"{i+1}. {ans}\n"

    prompt = base_prompt + "Return the list of formatted answers only."

    try:
        output = distractor_pipe(prompt, max_length=64)[0]["generated_text"]
        formatted = [line.strip("- ").strip() for line in output.split("\n") if line.strip()]
    except Exception:
        return correct, distractors

    if len(formatted) >= 3:
        return formatted[0], formatted[1:4]
    return correct, distractors


def process_sentence(sentence):
    sentence = sentence.strip()
    if len(sentence) < 20:
        return None

    term = extract_focus_term(sentence)
    if not term:
        return None

    highlighted = highlight(sentence, term)
    question_text = generate_question(highlighted)
    if not question_text:
        return None

    correct_answer = term.text
    distractors = generate_distractors(question_text, correct_answer)

    if len(distractors) >= 2:
        correct_answer, distractors = normalize_answers(question_text, correct_answer, distractors)
        return {
            "type": "multiple_choice",
            "question": question_text,
            "choices": [correct_answer] + distractors,
            "answer": correct_answer
        }
    return None

def generate_quiz(text, max_workers=4):
    doc = nlp(text)
    sentences = [sent.text for sent in doc.sents if len(sent.text.strip()) >= 20]

    quiz = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = executor.map(process_sentence, sentences)

    for q in results:
        if q:
            quiz.append(q)
    return quiz

# Main
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input text provided"}))
        sys.exit(1)

    input_text = sys.argv[1]
    quiz_data = generate_quiz(input_text)
    print(json.dumps(quiz_data, indent=2, ensure_ascii=False))
