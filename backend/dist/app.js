"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_config_1 = require("./config/db.config");
const auth_routes_1 = __importDefault(require("./modules/auth/routes/auth.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
(0, db_config_1.connectDB)();
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
app.use("/auth", auth_routes_1.default);
app.use(error_middleware_1.errorMiddleware);
app.listen(PORT, () => {
    console.log(`[Server] Running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
exports.default = app;
