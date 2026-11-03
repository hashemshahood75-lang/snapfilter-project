const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// تحديد مكان حفظ الصور
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// دعم استقبال البيانات بأحجام كبيرة (للصصور)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// السماح بعرض الصور والملفات الثابتة
app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, 'public')));

// 1. مسار استقبال الصورة الملتقطة من الموبايل
app.post('/upload-snapshot', (req, res) => {
    const imageData = req.body.image;
    if (!imageData) return res.status(400).json({ error: 'No image data' });
    
    // تحويل الكود إلى ملف صورة حقيقي
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const filename = `snapshot_${Date.now()}.png`;
    const filepath = path.join(uploadDir, filename);
    
    fs.writeFile(filepath, base64Data, 'base64', (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save image' });
        res.json({ success: true, filename });
    });
});

// 2. مسار صفحة الـ Admin المحمية بكلمة مرور لعرض الصور
app.get('/admin', (req, res) => {
    const password = req.query.pass;
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});