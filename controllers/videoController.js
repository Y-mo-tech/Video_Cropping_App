import FFmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'

async function videoCropping(req, res){
    console.log("Inside video controller fxn === ")
    try{
       const {dirPath, videoName, width, height} = req.body;

       if(!dirPath || !videoName || !width || !height){
        return res.status(400).json({message: "Input params are not present !!"})
       }

       // let file = fs.readdirSync(path)
       const inputPath = path.join(dirPath, videoName)

       console.log("inputPath ======>>>", inputPath)
       const outputPath = path.join(dirPath, `${videoName}_cropped.mp4`)
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
        .on('error', reject)
        .on('end', resolve)
        .save(outputPath)
       })

       return res.status(200).json({message: "Output path generated !", outputPath});
    } catch(err){
       return res.status(500).json({message: err.message})
    }
}

export {
    videoCropping
}