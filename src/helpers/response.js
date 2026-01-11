const sendOk = (res, data = null, msg = null) => {
    res.status(200).json({
        ok: true,
        data,
        msg
    });
};

const sendError = (res, msg, status = 500) => {
    res.status(status).json({
        ok: false,
        msg
    });
};

module.exports = {
    sendOk,
    sendError
};