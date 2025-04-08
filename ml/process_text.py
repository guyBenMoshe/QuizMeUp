import spacy
from transformers import T5ForConditionalGeneration, T5Tokenizer
import random
import sys
import json

# Load spaCy and T5
nlp = spacy.load("en_core_web_sm")
model_name = "valhalla/t5-base-qg-hl"
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

def highlight_answer(sentence):
    # נשתמש ב־spaCy כדי להדגיש מילה משמעותית במשפט (לשאלה אמריקאית)
    doc = nlp(sentence)
    for ent in doc.ents:
        if ent.label_ in {"PERSON", "ORG", "GPE", "DATE"}:
            return sentence.replace(ent.text, f"<hl> {ent.text} <hl>"), ent.text
    return sentence, None  # אין ישות רלוונטית – נחזור למשפט עצמו

def generate_mc_question(sentence):
    # הדגשת התשובה בתוך המשפט
    highlighted_sentence, answer = highlight_answer(sentence)
    if not answer:
        return None  # דלג אם לא נמצא מה להדגיש

    input_text = f"generate question: {highlighted_sentence}"
    input_ids = tokenizer.encode(input_text, return_tensors="pt")
    output = model.generate(input_ids, max_length=64, num_beams=4, early_stopping=True)
    question = tokenizer.decode(output[0], skip_special_tokens=True)

    # ניצור distractors פשוטים (ניתן לשפר בהמשך עם מודל נוסף)
    fake_answers = ["Napoleon", "New York", "1955", "Isaac Newton"]
    choices = random.sample([answer] + fake_answers, 4)

    return {
        "type": "multiple_choice",
        "question": question,
        "choices": choices,
        "answer": answer,
        "source": sentence
    }

def generate_tf_question(sentence):
    # נהפוך את המשפט לאי-אמת על ידי שינוי מילה אחת (פשוט לצורך הדוגמה)
    false_sentence = sentence.replace("is", "is not", 1)
    if false_sentence == sentence:
        return None

    label = random.choice([True, False])
    final_sentence = sentence if label else false_sentence

    return {
        "type": "true_false",
        "question": f"True or False: {final_sentence}",
        "answer": "True" if label else "False",
        "source": sentence
    }

def generate_questions(text):
    doc = nlp(text)
    results = []

    for sent in doc.sents:
        sentence = sent.text.strip()
        if len(sentence) < 20:
            continue

        if random.random() < 0.5:
            q = generate_mc_question(sentence)
        else:
            q = generate_tf_question(sentence)

        if q:
            results.append(q)

    return results


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No text provided"}))
        sys.exit(1)

    input_text = sys.argv[1]
    questions = generate_questions(input_text)

    print(json.dumps(questions, ensure_ascii=False))
