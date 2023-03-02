"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionRange = exports.Action = void 0;
var assert_1 = __importDefault(require("assert"));
var chip_range_1 = __importDefault(require("./chip-range"));
var round_1 = __importStar(require("./round"));
var community_cards_1 = require("./community-cards");
var Action;
(function (Action) {
    Action[Action["LEAVE"] = 0] = "LEAVE";
    Action[Action["MATCH"] = 1] = "MATCH";
    Action[Action["RAISE"] = 2] = "RAISE";
})(Action = exports.Action || (exports.Action = {}));
var ActionRange = /** @class */ (function () {
    function ActionRange(canRaise, chipRange) {
        if (chipRange === void 0) { chipRange = new chip_range_1.default(0, 0); }
        this.canRaise = canRaise;
        this.chipRange = chipRange;
    }
    return ActionRange;
}());
exports.ActionRange = ActionRange;
var BettingRound = /** @class */ (function () {
    function BettingRound(players, nonFoldedPlayers, firstToAct, minRaise, blinds, roundOfBetting, biggestBet) {
        if (biggestBet === void 0) { biggestBet = 0; }
        this._round = new round_1.default(players.map(function (player) { return !!player; }), nonFoldedPlayers, firstToAct);
        this._players = players;
        this._biggestBet = biggestBet;
        this._minRaise = minRaise;
        this._blinds = blinds;
        this._roundOfBetting = roundOfBetting;
        (0, assert_1.default)(firstToAct < players.length, 'Seat index must be in the valid range');
        (0, assert_1.default)(players[firstToAct], 'First player to act must exist');
    }
    BettingRound.prototype.inProgress = function () {
        return this._round.inProgress();
    };
    BettingRound.prototype.isContested = function () {
        return this._round.isContested();
    };
    BettingRound.prototype.playerToAct = function () {
        return this._round.playerToAct();
    };
    BettingRound.prototype.biggestBet = function () {
        return this._biggestBet;
    };
    BettingRound.prototype.minRaise = function () {
        return this._minRaise;
    };
    BettingRound.prototype.players = function () {
        var _this = this;
        return this._round.activePlayers().map(function (isActive, index) {
            return isActive ? _this._players[index] : null;
        });
    };
    BettingRound.prototype.activePlayers = function () {
        return this._round.activePlayers();
    };
    BettingRound.prototype.nonFoldedPlayers = function () {
        return this._round.nonFoldedPlayers();
    };
    BettingRound.prototype.actionTakenInRound = function () {
        return this._round.actionTakenInRound();
    };
    BettingRound.prototype.numActivePlayers = function () {
        return this._round.numActivePlayers();
    };
    BettingRound.prototype.legalActions = function () {
        var player = this._players[this._round.playerToAct()];
        (0, assert_1.default)(player !== null);
        var playerChips = player.totalChips();
        var canRaise = playerChips >= this._biggestBet;
        if (canRaise) {
            var minBet = (this._roundOfBetting === community_cards_1.RoundOfBetting.PREFLOP && this._biggestBet < this._minRaise) ?
                this._minRaise :
                this._biggestBet + this._minRaise;
            console.log("Hand minimum bet is", minBet);
            var raiseRange = new chip_range_1.default(Math.min(minBet, playerChips), playerChips);
            return new ActionRange(canRaise, raiseRange);
        }
        else {
            return new ActionRange(canRaise);
        }
    };
    BettingRound.prototype.actionTaken = function (action, bet) {
        if (bet === void 0) { bet = 0; }
        var player = this._players[this._round.playerToAct()];
        (0, assert_1.default)(player !== null);
        if (action === Action.RAISE) {
            (0, assert_1.default)(this.isRaiseValid(bet));
            player.bet(bet);
            // update min raise only if player does not shove before matching current raise
            var playerRaise = bet - this._biggestBet;
            this._minRaise = (playerRaise >= this._minRaise) ? playerRaise : this._minRaise;
            this._biggestBet = bet;
            var actionFlag = round_1.Action.AGGRESSIVE;
            if (player.stack() === 0) {
                actionFlag |= round_1.Action.LEAVE;
            }
            this._round.actionTaken(actionFlag);
        }
        else if (action === Action.MATCH) {
            player.bet(Math.min(this._biggestBet, player.totalChips()));
            var actionFlag = round_1.Action.PASSIVE;
            if (player.stack() === 0) {
                actionFlag |= round_1.Action.LEAVE;
            }
            this._round.actionTaken(actionFlag);
        }
        else {
            (0, assert_1.default)(action === Action.LEAVE);
            this._round.actionTaken(round_1.Action.LEAVE, true);
        }
    };
    BettingRound.prototype.standUp = function (seat) {
        this._players[seat] = null;
        this._round.standUp(seat);
    };
    BettingRound.prototype.isRaiseValid = function (bet) {
        var _a, _b, _c, _d;
        var player = this._players[this._round.playerToAct()];
        (0, assert_1.default)(player !== null);
        //In heads up preflop round, we need to check if the BB goes all-in
        var bigBlindIsAllIn = ((_b = (_a = this._players[this._blinds.big]) === null || _a === void 0 ? void 0 : _a.stack()) !== null && _b !== void 0 ? _b : 0) === 0;
        var playerChips = player.stack() + player.betSize();
        //If BB is all-in, adjust the min-bet so that the SB is able to either call or check their all-in
        var minBet = (this._roundOfBetting === community_cards_1.RoundOfBetting.PREFLOP && this.numActivePlayers() === 2 && bigBlindIsAllIn) ?
            (_d = (_c = this._players[this._blinds.big]) === null || _c === void 0 ? void 0 : _c.betSize()) !== null && _d !== void 0 ? _d : 0 :
            (this._roundOfBetting === community_cards_1.RoundOfBetting.PREFLOP && bigBlindIsAllIn && this._biggestBet < this._minRaise) ?
                this._minRaise :
                this._biggestBet + this._minRaise;
        if (playerChips > this._biggestBet && playerChips < minBet) {
            return bet === playerChips;
        }
        return bet >= minBet && bet <= playerChips;
    };
    return BettingRound;
}());
exports.default = BettingRound;
//# sourceMappingURL=betting-round.js.map