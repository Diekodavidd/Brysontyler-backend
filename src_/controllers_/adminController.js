const User = require('../models_/user');
const Content = require('../models_/content');

exports.getStats = async (req, res) => {
    try {

        const totalUsers = await User.countDocuments();

        const totalCreators = await User.countDocuments({
            role: "creator"
        });

        const totalContent = await Content.countDocuments();

//         const totalRevenue = await Payment.aggregate([
// {
//     $group:{
//         _id:null,
//         total:{
//             $sum:"$amount"
//         }
//     }
//          }]);

        res.json({
            totalUsers,
            totalCreators,
            totalContent,
            totalRevenue: 124500 // TODO: Replace with Payment aggregation
            
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};
exports.getAllUsers = async (req, res) => {

    try {

        const users = await User.find()
            .select("-password")
            .sort({
                createdAt: -1
            });

        res.json(users);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};
exports.getAllContent = async (req,res)=>{

    try{

        const content = await Content.find()
            .populate("creatorId","name")
            .sort({
                createdAt:-1
            });

        res.json(content);

    }catch(err){

        res.status(500).json({
            error:err.message
        });

    }

}