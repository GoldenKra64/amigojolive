const { getResponse } = require("./chatbot.service");
const { ApiResponse } = require("../../config/api.response");

async function getResponseController(req, res, next) {
    const { prompt } = req.body;

    if (!prompt.trim() || prompt.trim().length === 0) {
        const err = new Error("Falta el parámetro prompt");
        err.statusCode = 400;
        throw err;
    }

    try {
        const botResponse = await getResponse(prompt);
        const response = new ApiResponse(true, 200, "Respuesta obtenida correctamente", botResponse);

        console.log(response);
        res.json(response);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getResponseController
}