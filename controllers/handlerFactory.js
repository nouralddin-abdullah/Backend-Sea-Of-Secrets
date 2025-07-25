const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createOne = (Model) => 
    catchAsync(async (req,res,next) => {
        const doc = await Model.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                data: doc,
            }
        });
    });
