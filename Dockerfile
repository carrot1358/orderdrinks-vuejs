# ใช้ Node.js เวอร์ชันล่าสุดเป็นฐาน
FROM node:latest

# ตั้งค่าไดเรกทอรีทำงาน
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json (ถ้ามี)
COPY package*.json ./

COPY src/@iconify src/@iconify/

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมดไปยังไดเรกทอรีทำงาน
COPY . .

# สร้าง production build
RUN npm run build

# เปิดพอร์ต 3000 สำหรับการเข้าถึงแอพ
EXPOSE 5050

# รันคำสั่งเพื่อเริ่มต้นแอพ
CMD ["npm", "run", "preview"]
