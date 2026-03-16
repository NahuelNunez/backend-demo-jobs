import multer from "multer";
import { CustomError } from "../utils/customError";

// Configurar multer para usar memoria (sin guardar en disco)
const storage = multer.memoryStorage();

// Filtro para validar que solo se suban videos
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    // Aceptar solo archivos de video
    if (file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(
            new CustomError(
                "Solo se permiten archivos de video (mp4, avi, mov, etc.)",
                400
            ),
            false
        );
    }
};

// Configurar límites (por ejemplo, máximo 100MB)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB en bytes
    },
});

export default upload;
