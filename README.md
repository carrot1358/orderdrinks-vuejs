# ส่วนประกอบของโครงการ

### Git FrontEnd VueJS : [คลิก](https://gitlab.eng.rmuti.ac.th/nattapad.sa/orderdrinks-vuejs) (คุณอยู่ที่นี่)

### Git BackEnd Elysia : [คลิก](https://gitlab.eng.rmuti.ac.th/nattapad.sa/orderdrinks-elysia)

### Git สำหรับ Hardware(Raspberry Pi) : [คลิก](https://gitlab.eng.rmuti.ac.th/nattapad.sa/orderdrinks-hw.git) 

# วิธีการติดตั้งและรันโปรแกรม

## FrontEnd (VueJS)

1. ตรวจสอบว่าคุณมี NodeJS และ npm ติดตั้งอยู่ในระบบหรือไม่ หากไม่มีก็ติดตั้งให้เรียบร้อยก่อนทำการติดตั้งต่อไป [โหลดที่นี่](https://nodejs.org/en)
2. โคลนโปรเจ็คจาก GitLab หรือดาวน์โหลดไฟล์จากหน้าต่างของ GitLab 
    ```bash
    git clone https://gitlab.eng.rmuti.ac.th/nattapad.sa/orderdrinks-vuejs.git
    ```
3. เข้าไปที่โฟลเดอร์หลักของโปรเจ็คและรันคำสั่ง `npm install` เพื่อติดตั้งข้อมูลจาก package.json
    ```bash
    cd orderdrinks-vuejs
    npm install
    ```
3. รันคำสั่ง `npm run dev` เพื่อเริ่มต้นเซิฟเวอร์ของโปรเจ็ค
    ```bash
    npm run dev
    ```