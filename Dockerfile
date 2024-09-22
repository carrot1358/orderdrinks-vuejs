# ใช้ Node.js เวอร์ชันล่าสุดเป็นฐาน
FROM node:latest as build-stage

# ตั้งค่าไดเรกทอรีทำงาน
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json (ถ้ามี)
COPY package*.json ./

COPY src/@iconify src/@iconify/

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมดไปยังไดเรกทอรีทำงาน
COPY . .

# เพิ่มหน่วยความจำสำหรับ Node.js และสร้าง production build
RUN export NODE_OPTIONS="--max-old-space-size=4096" && npm run build

# Production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5050
CMD ["nginx", "-g", "daemon off;"]
