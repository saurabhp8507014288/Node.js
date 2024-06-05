const express = require("express");
const { 
        getUserController,
        updateUserController,
        updatePasswordController, 
        resetPasswordController,
        deleteProfileController 
    } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");


const router = express.Router();

//routes
//get user || GET
router.get('/getuser', authMiddleware, getUserController);

//update user || PUT
router.put('/updateUser', authMiddleware, updateUserController);

//password update || POST
router.post("/updatePassword", authMiddleware, updatePasswordController);

// RESET PASSWORD || POST
router.post("/resetPassword", authMiddleware, resetPasswordController);

// delete USER || DELETE
router.delete("/deleteUser/:id", authMiddleware, deleteProfileController);

module.exports = router;