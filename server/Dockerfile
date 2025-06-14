# ✅ שלב 1: Image בסיס עם Node.js ו-Python
FROM node:18-bullseye

# ✅ שלב 2: התקנת pip וחבילות python
RUN apt-get update && apt-get install -y python3 python3-pip

# ✅ שלב 3: קביעת תיקיית העבודה
WORKDIR /app

# ✅ שלב 4: העתקת כל קבצי הפרויקט
COPY . .

# ✅ שלב 5: התקנת חבילות Node.js
RUN npm install

# ✅ שלב 6: התקנת חבילות Python
RUN pip3 install --no-cache-dir torch spacy transformers tiktoken protobuf blobfile sentencepiece

# ✅ שלב 7: הורדת מודל spacy פעם אחת (יחסוך זיכרון בזמן ריצה)
RUN python3 -m spacy download en_core_web_sm

# ✅ שלב 8: פתיחת פורט עבור רנדר
ENV PORT=5001

# ✅ שלב 9: הפעלת השרת
CMD ["node", "index.js"]
