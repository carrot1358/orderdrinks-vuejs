# ใช้ Node.js เวอร์ชันล่าสุดเป็นฐาน
FROM node:latest as build-stage

# ตั้งค่าไดเรกทอรีทำงาน
WORKDIR /app

# คัดลอกโค้ดทั้งหมดไปยังไดเรกทอรีทำงาน
COPY . .

# ติดตั้ง dependencies
RUN npm ci

# สร้าง production build
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5050
CMD ["nginx", "-g", "daemon off;"]
