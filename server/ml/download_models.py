from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# יצירת מודל לשאלות
qg_model_id = "valhalla/t5-base-qg-hl"
AutoTokenizer.from_pretrained(qg_model_id, cache_dir="./models/qg")
AutoModelForSeq2SeqLM.from_pretrained(qg_model_id, cache_dir="./models/qg")

# יצירת מודל להסחות דעת
distractor_model_id = "MBZUAI/LaMini-T5-738M"
AutoTokenizer.from_pretrained(distractor_model_id, cache_dir="./models/dist")
AutoModelForSeq2SeqLM.from_pretrained(distractor_model_id, cache_dir="./models/dist")
