import spacy
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
import json
import sys
import random
import re

# Load spaCy
nlp = spacy.load("en_core_web_sm")

# Load T5 for question generation
qg_model_id = "valhalla/t5-base-qg-hl"
qg_tokenizer = AutoTokenizer.from_pretrained(qg_model_id)
qg_model = AutoModelForSeq2SeqLM.from_pretrained(qg_model_id)
qg_pipe = pipeline("text2text-generation", model=qg_model, tokenizer=qg_tokenizer)

# Load LaMini-T5 for distractor generation
distractor_model_id = "MBZUAI/LaMini-T5-738M"
distractor_tokenizer = AutoTokenizer.from_pretrained(distractor_model_id)
distractor_model = AutoModelForSeq2SeqLM.from_pretrained(distractor_model_id)
distractor_pipe = pipeline("text2text-generation", model=distractor_model, tokenizer=distractor_tokenizer)

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

def generate_question(sentence_with_hl):
    prompt = f"generate question: {sentence_with_hl}"
    result = qg_pipe(prompt, max_length=64, num_beams=4, early_stopping=True)[0]["generated_text"]
    return result.strip()

def generate_raw_distractor_output(question, correct_answer, max_attempts=3):
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
            # מניעת כפילויות (case-insensitive)
            if choice.lower() not in [d.lower() for d in distractors + cleaned]:
                cleaned.append(choice)
        return cleaned

    attempt = 0
    while len(distractors) < 3 and attempt < max_attempts:
        prompt = (
            f"Question: {question}\n"
            f"Correct answer: {correct_answer}\n"
            f"Based on the question and the correct answer,\n"
            f"Provide only 3 different, short and reasonable incorrect answers.\n"
        )
        try:
            result = distractor_pipe(prompt, max_length=100, num_return_sequences=1)[0]["generated_text"]
            new_distractors = clean(result)
            distractors.extend(new_distractors)

            # שמירה על ייחודיות סופית
            seen = set()
            distractors = [x for x in distractors if not (x.lower() in seen or seen.add(x.lower()))]

        except Exception as e:
            break

        attempt += 1

    return distractors[:3]



def generate_quiz(text):
    doc = nlp(text)
    quiz = []

    for sent in doc.sents:
        sentence = sent.text.strip()
        if len(sentence) < 20:
            continue

        term = extract_focus_term(sentence)
        if not term:
            continue

        highlighted = highlight(sentence, term)
        question_text = generate_question(highlighted)
        correct_answer = term.text
        distractor_output = generate_raw_distractor_output(question_text, correct_answer)

        if len(distractor_output) >= 2:
            quiz.append({
                "type": "multiple_choice",
                "question": question_text,
                "choices": [correct_answer] + distractor_output,
                "answer": correct_answer
            })

    return quiz

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input text provided"}))
        sys.exit(1)

    input_text = sys.argv[1]
    quiz_data = generate_quiz(input_text)
    print(json.dumps(quiz_data, indent=2, ensure_ascii=False))
