const cloudinary = require('cloudinary').v2;
require('dotenv').config()         
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async(filePath)=>{
  try{
    console.log("CLOUDINARY_CLOUD_NAME",process.env.CLOUDINARY_CLOUD_NAME)
    console.log("CLOUDINARY_API_KEY", process.env.CLOUDINARY_API_KEY);
    const result = await cloudinary.uploader.upload(filePath);
    console.log(result);
    return result;
  }catch(error){
    console.log(error)
  }
}

module.exports={ 
  
  uploadFile
}