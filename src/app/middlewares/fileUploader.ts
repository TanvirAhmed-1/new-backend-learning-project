import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// ফাইল সরাসরি সেভ না করে মেমরিতে নিচ্ছি
const storage = multer.memoryStorage();

const upload = (folderName: string) => {
    return multer({
        storage: storage,
        limits: { fileSize: 1 * 1024 * 1024 }, // ইউজারের কাছ থেকে ১ এমবি পর্যন্ত ফাইল নিচ্ছি
        fileFilter: (req, file, cb) => {
            const allowedTypes = /jpeg|jpg|png|webp/;
            const mimetype = allowedTypes.test(file.mimetype);
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            if (mimetype && extname) return cb(null, true);
            cb(new Error('Only .png, .jpg, .jpeg and .webp formats are allowed!'));
        },
    });
};

// ইমেজ সাইজ কমানোর ফাংশন
const processImage = async (file: Express.Multer.File, folderName: string) => {
    const uploadPath = path.join(process.cwd(), 'public/uploads', folderName);

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const fileName = `${folderName}-${Date.now()}.webp`; // .webp তে কনভার্ট করলে সাইজ অনেক কমে যায়
    const fullPath = path.join(uploadPath, fileName);

    await sharp(file.buffer)
        .resize(800) // উইডথ ৮০০ পিক্সেল করে দিবে (অটো হাইট)
        .webp({ quality: 80 }) // কোয়ালিটি ৮০% এ নামিয়ে আনবে
        .toFile(fullPath);

    return {
        relativePath: `/uploads/${folderName}/${fileName}`,
        fullPath: fullPath,
    };
};

export const FileUploader = {
  upload,
  processImage
};