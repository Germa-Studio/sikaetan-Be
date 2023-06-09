const { chatt, riwayatChat, ratting, dataPerson } = require('../models');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');

const chat = async(req, res)=>{
  try {
    const chatts = await chatt.findAll({include:[{model:dataPerson, as: 'from'}, {model:dataPerson, as: 'to'}]})
    const chattReply = await chatt.findAll({where:{status:"terbalas"}, include:[{model:dataPerson, as: 'from'}, {model:dataPerson, as: 'to'}]})
    res.status(200).json({
      message: 'Berhasil Mendapatkan data Chatt',
      chatts,
      chattReply
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const tambahChat = async(req, res)=>{
  try {
    const {
    dari,
    tujuan,
    aksi,
    status
    } = req.body 
    const datachatt = await chatt.create({dari, tujuan, aksi, status})
    const chattActive = await chatt.findAll({where:{tujuan}})
    const countChatt = chattActive.length
    const readChatt = await chatt.findAll({where:{tujuan, status:"terbalas"}})
    const countReadChatt = readChatt.length
    const idPenyuluh = await dataPerson.findOne({where:{id:tujuan}})
    const countRiwayatChatt = await riwayatChat.findOne({where:{id:idPenyuluh.id}})
    if(countRiwayatChatt){
      await riwayatChat.update({chattMasuik:countChatt, chattBelumDibales: countReadChatt}, {where:{id:countRiwayatChatt.id}})
    }else{
      const idRiwayatChat = await riwayatChat.create({chattMasuik:countChatt, chattBelumDibales: countReadChatt})
      await dataPerson.update({riwayatChatId:idRiwayatChat.id}, {where:{id:tujuan}})
    }
    res.status(200).json({
      message: 'Berhasil Menambahkan Chatt',
      datachatt
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const rating = async(req, res)=>{
  try {
    const rating = await ratting.findAll()
    res.status(200).json({
      message: 'Berhasil Mendapatkan Rating',
      rating
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const tambahRating = async(req, res)=>{
  try {
    const {
    NIP,
    response
    } = req.body 
    const person = await dataPerson.findOne({where:{NIP}})
    const rating = await ratting.create({response, dataPersonId:person.id})
    res.status(200).json({
      message: 'Berhasil membuat Rating',
      rating
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}



module.exports = { chat, tambahChat, rating, tambahRating }