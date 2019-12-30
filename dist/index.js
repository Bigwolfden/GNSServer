"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var websocket_1 = require("websocket");
var index_1 = require("./server/index");
var database_1 = require("./server/database");
//Configure the port number
var PORT = 3000;
//Listen with the server
index_1.httpServer.listen(PORT, function () {
    console.log("Listening on port " + PORT);
});
// Configure a websocket server
var wsServer = new websocket_1.server({
    // Set the http server to the one configured in server/index.js
    httpServer: index_1.httpServer,
    autoAcceptConnections: false
});
// Decide whether the origin of a request is allowed.
var originIsGood = function (origin) {
    return true;
};
var handleUTF8 = function (message) {
    var data = message.data;
    console.log("Recieved message: " + data.name + " and " + data.age + " and " + data.birthday);
};
wsServer.on('request', function (req) {
    if (!originIsGood(req.origin)) {
        // Reject the reqest if it doesn't come from the proper origin
        req.reject(403);
        console.log("Connection from origin " + req.origin + " rejected.");
        return;
    }
    // Accept the connection from the request origin
    var connection = req.accept('echo-protocol', req.origin);
    // Handle any messages
    connection.on('message', function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, data, clients;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = message.type;
                    switch (_a) {
                        case 'utf8': return [3 /*break*/, 1];
                    }
                    return [3 /*break*/, 3];
                case 1:
                    if (message.utf8Data) {
                        data = JSON.parse(message.utf8Data);
                        handleUTF8(data);
                    }
                    ;
                    return [4 /*yield*/, database_1.connection.query('SELECT * FROM clients;')];
                case 2:
                    clients = _b.sent();
                    connection.sendUTF(JSON.stringify(clients.rows));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Handle the closing of a connection
    connection.on('close', function (code, description) {
        console.log("The connection " + connection.remoteAddress + " has been closed with the code: " + code + " and description: " + description);
    });
});
