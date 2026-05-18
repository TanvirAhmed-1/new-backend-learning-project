"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
//   res.status(httpStatus.NOT_FOUND).json({
//     success: false,
//     message: "API Not Found",
//     errorDetails: {
//       path: req.originalUrl,
//     },
//   });
// };
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: "API Not Found",
        path: req.originalUrl,
    });
};
exports.default = notFoundHandler;
