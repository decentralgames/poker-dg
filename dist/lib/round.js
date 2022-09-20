"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
var assert_1 = __importDefault(require("assert"));
var Action;
(function (Action) {
    Action[Action["LEAVE"] = 1] = "LEAVE";
    Action[Action["PASSIVE"] = 2] = "PASSIVE";
    Action[Action["AGGRESSIVE"] = 4] = "AGGRESSIVE";
})(Action = exports.Action || (exports.Action = {}));
var Round = /** @class */ (function () {
    function Round(activePlayers, nonFoldedPlayers, firstToAct) {
        this._contested = false;
        this._firstAction = true;
        this._numActivePlayers = 0;
        this._activePlayers = activePlayers;
        this._nonFoldedPlayers = nonFoldedPlayers;
        this._playerToAct = firstToAct;
        this._lastAggressiveActor = firstToAct;
        this._numActivePlayers = activePlayers.filter(function (player) { return !!player; }).length;
        (0, assert_1.default)(firstToAct < activePlayers.length);
    }
    Round.prototype.activePlayers = function () {
        return this._activePlayers;
    };
    Round.prototype.nonFoldedPlayers = function () {
        return this._nonFoldedPlayers;
    };
    Round.prototype.playerToAct = function () {
        return this._playerToAct;
    };
    Round.prototype.lastAggressiveActor = function () {
        return this._lastAggressiveActor;
    };
    Round.prototype.numActivePlayers = function () {
        return this._numActivePlayers;
    };
    Round.prototype.inProgress = function () {
        return ((this._contested || this._numActivePlayers > 1) &&
            (this._firstAction || this._playerToAct !== this._lastAggressiveActor));
    };
    Round.prototype.isContested = function () {
        return this._contested;
    };
    Round.prototype.actionTaken = function (action, isManualLeave) {
        if (isManualLeave === void 0) { isManualLeave = false; }
        (0, assert_1.default)(this.inProgress());
        (0, assert_1.default)(!(action & Action.PASSIVE && action & Action.AGGRESSIVE));
        if (this._firstAction) {
            this._firstAction = false;
        }
        // Implication: if there is aggressive action => the next player is contested
        if (action & Action.AGGRESSIVE) {
            this._lastAggressiveActor = this._playerToAct;
            this._contested = true;
        }
        else if (action & Action.PASSIVE) {
            this._contested = true;
        }
        if (action & Action.LEAVE) {
            this._activePlayers[this._playerToAct] = false;
            if (isManualLeave) {
                this._nonFoldedPlayers[this._playerToAct] = false;
            }
            --this._numActivePlayers;
        }
        this.incrementPlayer();
    };
    Round.prototype.standUp = function (seat) {
        this._activePlayers[seat] = false;
        this._nonFoldedPlayers[seat] = false;
        this._numActivePlayers = this._activePlayers.filter(function (player) { return !!player; }).length;
    };
    Round.prototype.incrementPlayer = function () {
        do {
            ++this._playerToAct;
            if (this._playerToAct === this._activePlayers.length)
                this._playerToAct = 0;
            if (this._playerToAct === this._lastAggressiveActor)
                break;
        } while (!this._activePlayers[this._playerToAct]);
    };
    return Round;
}());
exports.default = Round;
//# sourceMappingURL=round.js.map