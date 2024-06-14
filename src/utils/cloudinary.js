import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (loacalFilePath) => {
  try {
    if (!loacalFilePath) return null;
    // upload the file on clodinary
   const  response = await cloudinary.uploader.upload(loacalFilePath, { resource_type: "auto" })
    //file has been uploaded successfully
    console.log("file is uploaded on cloudinary", response.url);
    return response
    

  }
  catch(error) {
    fs.unlinkSync(loacalFilePath)//remove the locally saved temp file as the upload opearion got failed
    return null
  }
}
export {uploadOnCloudinary}