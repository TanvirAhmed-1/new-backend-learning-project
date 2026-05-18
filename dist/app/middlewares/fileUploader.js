"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploader = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
// ফাইল সরাসরি সেভ না করে মেমরিতে নিচ্ছি
const storage = multer_1.default.memoryStorage();
const upload = (folderName) => {
    return (0, multer_1.default)({
        storage: storage,
        limits: { fileSize: 1 * 1024 * 1024 }, // ইউজারের কাছ থেকে ১ এমবি পর্যন্ত ফাইল নিচ্ছি
        fileFilter: (req, file, cb) => {
            const allowedTypes = /jpeg|jpg|png|webp/;
            const mimetype = allowedTypes.test(file.mimetype);
            const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
            if (mimetype && extname)
                return cb(null, true);
            cb(new Error('Only .png, .jpg, .jpeg and .webp formats are allowed!'));
        },
    });
};
// ইমেজ সাইজ কমানোর ফাংশন
const processImage = (file, folderName) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadPath = path_1.default.join(process.cwd(), 'public/uploads', folderName);
    if (!fs_1.default.existsSync(uploadPath)) {
        fs_1.default.mkdirSync(uploadPath, { recursive: true });
    }
    const fileName = `${folderName}-${Date.now()}.webp`; // .webp তে কনভার্ট করলে সাইজ অনেক কমে যায়
    const fullPath = path_1.default.join(uploadPath, fileName);
    yield (0, sharp_1.default)(file.buffer)
        .resize(800) // উইডথ ৮০০ পিক্সেল করে দিবে (অটো হাইট)
        .webp({ quality: 80 }) // কোয়ালিটি ৮০% এ নামিয়ে আনবে
        .toFile(fullPath);
    return {
        relativePath: `/uploads/${folderName}/${fileName}`,
        fullPath: fullPath,
    };
});
exports.FileUploader = {
    upload,
    processImage
};
