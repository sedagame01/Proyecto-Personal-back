var jwt = require("jsonwebtoken");

const JWTGenerator = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.SECRET_KEY,
            {expiresIn: "2h"},
            (error, token) => {
                if(error){
                    console.log(error)
                    reject ("error")
                } else{
                    resolve (token)
                }
            }
        )
    })   
}

module.exports={
    JWTGenerator
}