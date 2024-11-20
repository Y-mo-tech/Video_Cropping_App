import FFmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'

let videoExtensions = ['.mp4', '.mkv', '.mov', '.flv', '.wmv']

async function cropVideo(file){
    const {dirPath, videoName, width, height} = file
    const inputPath = path.join(dirPath, videoName)
    console.log("inputPath ======>>>", inputPath)
    let ext = path.extname(inputPath);

    if(!videoExtensions.includes(ext)){
     res.status(400).json({message: "File address is not video type !!"})
    }

    const outputPath = path.join(dirPath, `${videoName}_cropped${ext}`)
    console.log("outputPath ======>>>", outputPath)
    await new Promise((resolve, reject) => {
        FFmpeg(inputPath).format('mp4').videoFilter([
            {
                filter: "crop",
                options: {
                    w: width,
                    h: height,
                    x: 0,
                    y: 0
                },
            }
        ])
        .on('error', () => reject(error))
        .on('end', () => resolve(outputPath))
        .save(outputPath)
    })
    return outputPath
}

async function videoCropping(req, res){
    console.log( "Inside video controller fxn === ")
    try{
       let {croppingDetails} = req.body

       if(!croppingDetails || !Array.isArray(croppingDetails)){
        return res.status(400).json({message: "CroppingDetails are not present !!"})
       }

       croppingDetails.map((cropObj) => {
        const {dirPath, videoName, width, height} = cropObj

        if(!dirPath || !videoName || !width || !height){
            return res.status(400).json({message: "Input params are not present !!"})
        }
       })

       let outputPaths = await Promise.allSettled(
        croppingDetails.map((cropObj) => {
            return cropVideo(cropObj)
        })
       )

       return res.status(200).json({message: "Output paths generated !", outputPaths});
    } catch(err){
       return res.status(500).json({message: err.message})
    }
}

export {
    videoCropping
}