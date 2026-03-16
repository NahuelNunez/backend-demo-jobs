import cloudinary from "../config/cloudinary";
import { CustomError } from "../utils/customError";
import { Readable } from "stream";

class CloudinaryService {
    /**
     * Sube un video a Cloudinary desde un buffer
     * @param fileBuffer - Buffer del archivo de video
     * @param folder - Carpeta en Cloudinary donde se guardará
     * @param fileName - Nombre del archivo (opcional)
     * @returns Objeto con información del video subido
     */
    async subirVideo(
        fileBuffer: Buffer,
        folder: string = "postulaciones/videos",
        fileName?: string
    ) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "video",
                    folder: folder,
                    public_id: fileName,
                    // Procesar videos de forma asíncrona para archivos grandes
                    eager_async: true,
                    eager: [
                        {
                            format: "mp4",
                            quality: "auto",
                        }
                    ],
                },
                (error, result) => {
                    if (error) {
                        reject(
                            new CustomError(
                                `Error al subir el video a Cloudinary: ${error.message}`,
                                500
                            )
                        );
                    } else if (result) {
                        // Generar URL de thumbnail manualmente
                        const thumbnailUrl = cloudinary.url(result.public_id, {
                            resource_type: 'video',
                            format: 'jpg',
                            transformation: [
                                { width: 300, height: 200, crop: 'fill' }
                            ]
                        });

                        resolve({
                            videoUrl: result.secure_url,
                            videoClave: result.public_id,
                            videoUrlMiniatura: thumbnailUrl,
                            videoDuracionSegundos: result.duration || null,
                            videoTipoMime: result.format ? `video/${result.format}` : "video/mp4",
                            cloudinaryData: result,
                        });
                    }
                }
            );

            // Convertir buffer a stream y hacer pipe
            const bufferStream = Readable.from(fileBuffer);
            bufferStream.pipe(uploadStream);
        });
    }

    /**
     * Elimina un video de Cloudinary
     * @param publicId - ID público del video en Cloudinary
     * @returns Resultado de la eliminación
     */
    async eliminarVideo(publicId: string) {
        try {
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: "video",
            });
            return result;
        } catch (error: any) {
            throw new CustomError(
                `Error al eliminar el video: ${error.message}`,
                500
            );
        }
    }

    /**
     * Obtiene información de un video en Cloudinary
     * @param publicId - ID público del video
     * @returns Información del video
     */
    async obtenerInfoVideo(publicId: string) {
        try {
            const result = await cloudinary.api.resource(publicId, {
                resource_type: "video",
            });
            return result;
        } catch (error: any) {
            throw new CustomError(
                `Error al obtener información del video: ${error.message}`,
                500
            );
        }
    }
}

export default new CloudinaryService();
