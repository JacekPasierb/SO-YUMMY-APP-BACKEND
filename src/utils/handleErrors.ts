const errorMessageList: { [key: number]: string } = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not found",
  409: "Conflict",
};

interface CustomError extends Error {
  status?: number;
}

const handleError = (
  status: number,
  message: string = errorMessageList[status]
): CustomError => {
  const error: CustomError = new Error(message);
  error.status = status;
  return error;
};

export default handleError;
