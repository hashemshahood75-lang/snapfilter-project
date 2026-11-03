const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// زيادة حد حجم البيانات المقبولة لاستقبال الصور الكبيرة بترميز Base64
app.use(express.json({ limit: '10mb' }));

// جعل ملفات مجلد public متاحة للمتصفح
app.use(express.static(path.join(__dirname, 'public')));

// نقطة استقبال الصور من الواجهة الأمامية
app.post('/upload', (req, res) => {
    const imageData = req.body.image;

    if (!imageData) {
        return res.status(400).json({ status: 'error', message: 'لم يتم استلام أي صورة' });
    }

    // تنظيف نص الصورة وتحويله من Base64 إلى ملف صورة حقيقي
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // التأكد من وجود مجلد uploads
    const uploadsFolder = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsFolder)) {
        fs.mkdirSync(uploadsFolder);
    }

    // تسمية الصورة باسم يحتوي على التاريخ والوقت لتجنب التكرار
    const filename = `captured_${Date.now()}.png`;
    const filepath = path.join(uploadsFolder, filename);

    // حفظ الصورة على القرص
    fs.writeFile(filepath, buffer, (err) => {
        if (err) {
            console.error('خطأ أثناء حفظ الصورة:', err);
            return res.status(500).json({ status: 'error', message: 'فشل حفظ الصورة' });
        }

        console.log(`[+] تم التقاط وحفظ صورة جديدة بنجاح: ${filename}`);
        return res.json({ status: 'success', message: 'تم معالجة الصورة بنجاح' });
    });
});

// تشغيل الخادم على المنفذ المحلي 3000
app.listen(PORT, () => {
    console.log(`[+] الخادم يعمل بنجاح على الرابط: http://localhost:${PORT}`);
});