import { asyncHandler } from '../utils/asynchandler.js'

const regiterUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message:"ok"
  })
})

export {regiterUser}