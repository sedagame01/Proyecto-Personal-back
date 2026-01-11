const {validationResult} = require("express-validator");
const validateInputs = (req, res, next) => {
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors)
        return res.status(400).json({
            ok:false,
            msg:"Hay errores",
            errors: errors.mapped()
        })
    }
    else{
        next();
    }
}

module.exports={
    validateInputs
}