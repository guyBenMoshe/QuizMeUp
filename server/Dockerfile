FROM node:18-bullseye

RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

COPY . .

RUN npm install

RUN pip3 install --no-cache-dir torch spacy transformers tiktoken protobuf blobfile sentencepiece

RUN python3 -m spacy download en_core_web_sm

RUN python3 -c "from transformers import AutoTokenizer, AutoModelForSeq2SeqLM; \
AutoTokenizer.from_pretrained('valhalla/t5-base-qg-hl'); \
AutoModelForSeq2SeqLM.from_pretrained('valhalla/t5-base-qg-hl'); \
AutoTokenizer.from_pretrained('MBZUAI/LaMini-T5-738M'); \
AutoModelForSeq2SeqLM.from_pretrained('MBZUAI/LaMini-T5-738M')"


ENV PORT=5001

CMD ["node", "index.js"]
