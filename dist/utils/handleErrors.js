"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMessageList = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    409: "Conflict",
};
const handleError = (status, message = errorMessageList[status]) => {
    const error = new Error(message);
    error.status = status;
    return error;
};
exports.default = handleError;
