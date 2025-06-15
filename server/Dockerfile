FROM node:18-bullseye

RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

COPY . .

RUN npm install

RUN pip3 install --no-cache-dir torch spacy transformers tiktoken protobuf blobfile sentencepiece

RUN python3 -m spacy download en_core_web_sm

# ⬇️ שורה חדשה שמורידה את המודלים מראש!
RUN python3 -c "from transformers import AutoTokenizer, AutoModelForSeq2SeqLM; \
AutoTokenizer.from_pretrained('valhalla/t5-base-qg-hl', cache_dir='./models/qg'); \
AutoModelForSeq2SeqLM.from_pretrained('valhalla/t5-base-qg-hl', cache_dir='./models/qg'); \
AutoTokenizer.from_pretrained('MBZUAI/LaMini-T5-738M', cache_dir='./models/dist'); \
AutoModelForSeq2SeqLM.from_pretrained('MBZUAI/LaMini-T5-738M', cache_dir='./models/dist')"

ENV PORT=5001

CMD ["node", "index.js"]
