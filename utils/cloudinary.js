const cloudinary = require('cloudinary').v2
cloudinary.config({ 
    cloud_name: 'papero', 
    api_key: '116725562168465', 
    api_secret: '-Y2arZ5dXUvc30KKji3GQemYjl4' 
  });
  // exports.uploads = (file, folder) => {
  //   return new Promise(resolve => {
  //       cloudinary.uploader.upload(file, (result) => {
  //           resolve({
  //               url: result.url,
  //               id: result.public_id
  //           })
  //       }, {
  //           resource_type: "auto",
  //           folder: folder
  //       })
  //   })
// }
  module.exports = cloudinary