FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
# husky (`prepare`) tidak relevan di image; devDependencies (tsx) tetap dipasang untuk migrasi saat start
RUN npm pkg delete scripts.prepare && NODE_ENV=development npm ci

COPY . .
RUN npm run build

# DATABASE_PATH dan STORAGE_DIR harus mengarah ke volume persisten (lihat panduan Railway)
# reset-db --if-missing: migrasi, dan seed hanya bila belum ada pengguna; tidak pernah menghapus data
CMD ["sh", "-c", "npx tsx scripts/reset-db.ts --if-missing && npm start"]
