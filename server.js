const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// تأكد من وجود مجلد التخزين للصور الملتقطة
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// السماح بالوصول إلى مجلد الصور علنياً (أو عرضها من خلال صفحة الأدمن المحمية)
app.use('/uploads', express.static(uploadDir));

// مسار صفحة الـ Admin المحمية بكلمة مرور
app.get('/admin', (req, res) => {
    const password = req.query.pass;
    // كلمة المرور الافتراضية هنا هي 123 (يمكنك تعديلها لاحقاً)
    if (password !== '123') {
        return res.send(`
            <form method="GET" action="/admin" style="text-align:center; margin-top:80px; font-family:sans-serif;">
                <h2>لوحة تحكم مشروعي - SnapFilter</h2>
                <p>الرجاء إدخال كلمة المرور لعرض الصور:</p>
                <input type="password" name="pass" placeholder="كلمة المرور" style="padding:10px; font-size:16px; border-radius:5px; border:1px solid #ccc;" required />
                <button type="submit" style="padding:10px 20px; font-size:16px; cursor:pointer; background:#007bff; color:white; border:none; border-radius:5px;">دخول</button>
            </form>
        `);
    }

    // قراءة الصور الموجودة في المجلد واستعراضها
    fs.readdir(uploadDir, (err, files) => {
        if (err) return res.status(500).send("خطأ في قراءة مجلد الصور");
        
        let imagesHtml = files.map(file => `
            <div style="display:inline-block; margin:15px; text-align:center; background:#f9f9f9; padding:10px; border-radius:8px; border:1px solid #ddd;">
                <img src="/uploads/${file}" width="200" style="border-radius:6px;" /><br>
                <small style="color:#666;">${file}</small>
            </div>
        `).join('');

        res.send(`
            <div style="font-family:sans-serif; padding:20px; text-align:center;">
                <h2>الصور الملتقطة عبر تطبيق SnapFilter</h2>
                <a href="/admin" style="color:red; text-decoration:none; font-weight:bold;">تسجيل خروج</a>
                <hr style="margin:20px 0;">
                <div style="display:flex; flex-wrap:wrap; justify-content:center;">
                    ${imagesHtml || '<p style="color:#777; font-size:18px;">لا توجد صور ملتقطة حتى الآن.</p>'}
                </div>
            </div>
        `);
    });
});

// المنفذ الخاص بالسيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});