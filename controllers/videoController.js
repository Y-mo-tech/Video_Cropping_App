import FFmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let videoExtensions = [ '.mp4', '.mkv', '.mov', '.flv', '.wmv' ];

async function cropVideo(file, fileDetails) {
    console.log("file=====>", file);
    console.log("fileDetails=====>", fileDetails);
    let fileDetailsParsed = JSON.parse(fileDetails)

    let width = fileDetailsParsed.width;
    let height = fileDetailsParsed.height;

    console.log("width-----", width)
    console.log("height-----", height)

    const inputPath = path.resolve(__dirname, '..', 'uploads', file.filename); 
    console.log("Input Path:", inputPath);

    const outputPath = path.resolve(__dirname, '..', 'uploads', `${path.parse(file.filename).name}_cropped.mp4`); 
    console.log("Output Path:", outputPath);

    let ext = path.extname(inputPath);
    if (!videoExtensions.includes(ext)) {
        return Promise.reject(new Error('File is not a valid video type.'));
    }

    await new Promise((resolve, reject) => {
        const ffmpegProcess = FFmpeg(inputPath)
        .format('mp4')
        .videoFilter([{
            filter: 'crop',
            options: {
                w: width,
                h: height,
                x: 0,
                y: 0,
            },
        }])
        .on('start', (commandLine) => {
            console.log('FFmpeg command:', commandLine); 
        })
        .on('stderr', (stderrLine) => {
            console.log('FFmpeg stderr:', stderrLine); 
        })
        .on('stdout', (stdoutLine) => {
            console.log('FFmpeg stdout:', stdoutLine); 
        })
        .on('error', (error) => {
            console.error('Error:', error);
            reject(error);
        })
        .on('end', () => {
            console.log('FFmpeg processing completed successfully.');
            resolve(outputPath);
        })
        .save(outputPath);
    });

    return outputPath; 
}

async function videoCropping(req, res) {
    console.log("Inside video controller fxn ===");
    try {
        let { croppingDetails } = req.body;
        
        if (!req.files || !croppingDetails) {
            return res.status(400).json({ message: "Video details are not present !!" });
        }

        if (req.files.length !== croppingDetails.length) {
            return res.status(400).json({ message: "Video and cropping details are not the same amount!!" });
        }

        console.log("req files", req.files);
        console.log("croppingDetails==========", croppingDetails);

        let outputPaths = await Promise.allSettled(
            req.files.map(async (file, index) => {
                return cropVideo(file, croppingDetails[index]);
            })
        );

        console.log("output paths ==", outputPaths);

        let successfulPaths = outputPaths.filter(result => result.status === 'fulfilled').map(result => result.value);

        let failedPaths = outputPaths.filter(result => result.status === 'rejected').map(result => result.reason);

        return res.status(200).json({
            message: "Output paths generated !!",
            successfulPaths,
            failedPaths
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export { videoCropping };
