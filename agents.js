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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.weatherAgent = exports.weatherTool = void 0;
// todo: the goal is to get the agentic workflow working here
require("dotenv/config");
var tools_1 = require("@mastra/core/tools");
var zod_1 = require("zod");
var agent_1 = require("@mastra/core/agent");
exports.weatherTool = (0, tools_1.createTool)({
    id: 'get-weather',
    description: 'Get current weather for a location',
    inputSchema: zod_1.z.object({
        location: zod_1.z.string().describe('City name'),
    }),
    outputSchema: zod_1.z.object({
        output: zod_1.z.string(),
    }),
    execute: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, {
                    output: 'The weather is sunny',
                }];
        });
    }); },
});
exports.weatherAgent = new agent_1.Agent({
    id: 'weather-agent',
    name: 'Weather Agent',
    instructions: "\n      You are a helpful weather assistant that provides accurate weather information.\n\n      Your primary function is to help users get weather details for specific locations. When responding:\n      - Always ask for a location if none is provided\n      - If the location name isn't in English, please translate it\n      - If giving a location with multiple parts (e.g. \"New York, NY\"), use the most relevant part (e.g. \"New York\")\n      - Include relevant details like humidity, wind conditions, and precipitation\n      - Keep responses concise but informative\n\n      Use the weatherTool to fetch current weather data.\n",
    model: 'openai/gpt-5.4-nano',
    tools: { weatherTool: exports.weatherTool },
});
var response = await exports.weatherAgent.generate("Weather for Kolkata?");
