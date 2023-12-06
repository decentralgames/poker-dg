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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = exports.ActionRange = void 0;
var community_cards_1 = require("./community-cards");
var betting_round_1 = __importStar(require("./betting-round"));
var pot_manager_1 = __importDefault(require("./pot-manager"));
var assert_1 = __importDefault(require("assert"));
var hand_1 = __importDefault(require("./hand"));
var array_1 = require("../util/array");
var player_1 = __importDefault(require("./player"));
var ActionRange = /** @class */ (function () {
    function ActionRange(chipRange) {
        this.action = Action.FOLD; // You can always fold
        this.chipRange = chipRange;
    }
    ActionRange.prototype.contains = function (action, bet) {
        var _a, _b;
        if (bet === void 0) { bet = 0; }
        (0, assert_1.default)(Dealer.isValid(action), 'The action representation must be valid');
        return action && Dealer.isAggressive(action)
            ? (_b = (_a = this.chipRange) === null || _a === void 0 ? void 0 : _a.contains(bet)) !== null && _b !== void 0 ? _b : false
            : true;
    };
    return ActionRange;
}());
exports.ActionRange = ActionRange;
var Action;
(function (Action) {
    Action[Action["FOLD"] = 1] = "FOLD";
    Action[Action["CHECK"] = 2] = "CHECK";
    Action[Action["CALL"] = 4] = "CALL";
    Action[Action["BET"] = 8] = "BET";
    Action[Action["RAISE"] = 16] = "RAISE";
})(Action = exports.Action || (exports.Action = {}));
var Dealer = /** @class */ (function () {
    function Dealer(players, button, forcedBets, deck, communityCards, numSeats, rakeEnabled, rakeSettings) {
        if (numSeats === void 0) { numSeats = 9; }
        if (rakeEnabled === void 0) { rakeEnabled = false; }
        this._button = 0;
        this._smallBlindIndex = 0;
        this._bigBlindIndex = 0;
        this._bettingRound = null;
        this._handInProgress = false;
        this._roundOfBetting = community_cards_1.RoundOfBetting.PREFLOP;
        this._bettingRoundsCompleted = false;
        this._rakeEnabled = false;
        this._rakeSettings = { maxRake: 0, rakePercentage: 0 };
        this._players = players;
        this._button = button;
        this._forcedBets = forcedBets;
        this._deck = deck;
        this._communityCards = communityCards;
        this._potManager = new pot_manager_1.default();
        this._holeCards = new Array(numSeats).fill(null);
        this._winners = [];
        this._rakeEnabled = rakeEnabled,
            this._rakeSettings = rakeSettings,
            (0, assert_1.default)(deck.length === 52, 'Deck must be whole');
        (0, assert_1.default)(communityCards.cards().length === 0, 'No community cards should have been dealt');
    }
    Dealer.isValid = function (action) {
        // Method for counting bits in a 32-bit integer from https://graphics.stanford.edu/~seander/bithacks.html
        action = action - ((action >> 1) & 0x55555555);
        action = (action & 0x33333333) + ((action >> 2) & 0x33333333);
        var bitCount = (((action + (action >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24;
        return bitCount === 1;
    };
    Dealer.isAggressive = function (action) {
        return !!(action & Action.BET) || !!(action & Action.RAISE);
    };
    Dealer.prototype.handInProgress = function () {
        return this._handInProgress;
    };
    Dealer.prototype.bettingRoundsCompleted = function () {
        (0, assert_1.default)(this.handInProgress(), 'Hand must be in progress');
        return this._bettingRoundsCompleted;
    };
    Dealer.prototype.playerToAct = function () {
        (0, assert_1.default)(this.bettingRoundInProgress(), 'Betting round must be in progress');
        (0, assert_1.default)(this._bettingRound !== null);
        return this._bettingRound.playerToAct();
    };
    Dealer.prototype.players = function () {
        var _a, _b;
        return (_b = (_a = this._bettingRound) === null || _a === void 0 ? void 0 : _a.players()) !== null && _b !== void 0 ? _b : [];
    };
    // All the players who started in the current betting round
    Dealer.prototype.bettingRoundPlayers = function () {
        return this._players;
    };
    Dealer.prototype.roundOfBetting = function () {
        (0, assert_1.default)(this.handInProgress(), 'Hand must be in progress');
        return this._roundOfBetting;
    };
    Dealer.prototype.nonFoldedPlayers = function () {
        var _a, _b;
        return (_b = (_a = this._bettingRound) === null || _a === void 0 ? void 0 : _a.nonFoldedPlayers()) !== null && _b !== void 0 ? _b : [];
    };
    Dealer.prototype.actionTakenInRound = function () {
        var _a, _b;
        return (_b = (_a = this._bettingRound) === null || _a === void 0 ? void 0 : _a.actionTakenInRound()) !== null && _b !== void 0 ? _b : [];
    };
    Dealer.prototype.numActivePlayers = function () {
        var _a, _b;
        return (_b = (_a = this._bettingRound) === null || _a === void 0 ? void 0 : _a.numActivePlayers()) !== null && _b !== void 0 ? _b : 0;
    };
    Dealer.prototype.biggestBet = function () {
        var _a, _b;
        return (_b = (_a = this._bettingRound) === null || _a === void 0 ? void 0 : _a.biggestBet()) !== null && _b !== void 0 ? _b : 0;
    };
    Dealer.prototype.bettingRoundInProgress = function () {
        var _a, _b;
        return (_b = (_a = this._bettingRound) === null || _a === void 0 ? void 0 : _a.inProgress()) !== null && _b !== void 0 ? _b : false;
    };
    Dealer.prototype.isContested = function () {
        var _a, _b;
        return (_b = (_a = this._bettingRound) === null || _a === void 0 ? void 0 : _a.isContested()) !== null && _b !== void 0 ? _b : false;
    };
    Dealer.prototype.legalActions = function () {
        (0, assert_1.default)(this.bettingRoundInProgress(), 'Betting round must be in progress');
        (0, assert_1.default)(this._bettingRound !== null);
        var playerIndex = this._bettingRound.playerToAct();
        var player = this._players[playerIndex];
        (0, assert_1.default)(player !== null);
        var actions = this._bettingRound.legalActions();
        var actionRange = new ActionRange(actions.chipRange);
        var biggestBet = this._bettingRound.biggestBet();
        var playerBetSize = player.betSize(); //total amount a player bets
        // Below we take care of differentiating between check/call and bet/raise,
        // which the betting_round treats as just "match" and "raise".
        if (biggestBet - playerBetSize === 0) {
            actionRange.action |= Action.CHECK;
            (0, assert_1.default)(actions.canRaise); // If you can check, you can always bet or raise.
            // If this guy can check, with his existing bet_size, he is the big blind.
            if (playerBetSize > 0) {
                actionRange.action |= Action.RAISE;
            }
            else {
                actionRange.action |= Action.BET;
            }
            //Following conditions make sure not to give "Call 0" for heads up scenario where BB is all-in preflop
        }
        else if (this.numActivePlayers() === 2 && biggestBet < this._forcedBets.blinds.big &&
            playerBetSize === biggestBet && this._roundOfBetting === community_cards_1.RoundOfBetting.PREFLOP) {
            actionRange.action |= Action.CHECK;
        }
        else {
            actionRange.action |= Action.CALL;
            // If you can call, you may or may not be able to raise based.
            var roundBigBlind = this._forcedBets.blinds.big;
            var roundSmallBlind = this._forcedBets.blinds.small;
            var isSmallBlind = playerIndex === this._smallBlindIndex;
            var isBigBlind = playerIndex === this._bigBlindIndex;
            var hasNotBetOrPostedBlinds = playerBetSize < roundBigBlind;
            // Amount the player has raised (above the blind).
            var playerBetMinusBlinds = (this._roundOfBetting !== community_cards_1.RoundOfBetting.PREFLOP) ? playerBetSize :
                isBigBlind ? (playerBetSize - roundBigBlind) :
                    isSmallBlind ? (playerBetSize - roundSmallBlind) : playerBetSize;
            // Amount player is currently being raised by
            var playerWasRaisedBy = biggestBet - playerBetMinusBlinds;
            var minRaise = this._bettingRound.minRaise();
            // If player is being raised by at least the minimum, they can re-raise again (elsewise, a player shoved before matching the min raise)
            var validRaiseOnTable = playerWasRaisedBy >= minRaise;
            if (actions.canRaise && (hasNotBetOrPostedBlinds || validRaiseOnTable)) {
                actionRange.action |= Action.RAISE;
            }
            ;
        }
        return actionRange;
    };
    Dealer.prototype.pots = function () {
        //assert(this.handInProgress(), 'Hand must be in progress');
        return this._potManager.pots();
    };
    Dealer.prototype.button = function () {
        return this._button;
    };
    Dealer.prototype.blinds = function () {
        return {
            small: this._smallBlindIndex,
            big: this._bigBlindIndex,
        };
    };
    Dealer.prototype.holeCards = function () {
        (0, assert_1.default)(this.handInProgress() || this.bettingRoundInProgress(), 'Hand must be in progress or showdown must have ended');
        return this._holeCards;
    };
    Dealer.prototype.startHand = function () {
        var _a, _b, _c, _d, _e, _f;
        (0, assert_1.default)(!this.handInProgress(), 'Hand must not be in progress');
        this._bettingRoundsCompleted = false;
        this._roundOfBetting = community_cards_1.RoundOfBetting.PREFLOP;
        this._winners = [];
        this._potManager.resetFoldCount();
        this.collectAnte();
        var firstAction = this.nextOrWrap(this.postBlinds());
        this.dealHoleCards();
        var playersWithChips = this._players.filter(function (player) { return player !== null && player.stack() !== 0; });
        var bigBlindIsAllIn = (_b = (((_a = this._players[this._bigBlindIndex]) === null || _a === void 0 ? void 0 : _a.stack()) === 0)) !== null && _b !== void 0 ? _b : 0;
        var biggestBet = Math.max((_d = (_c = this._players[this._bigBlindIndex]) === null || _c === void 0 ? void 0 : _c.betSize()) !== null && _d !== void 0 ? _d : 0, (_f = (_e = this._players[this._smallBlindIndex]) === null || _e === void 0 ? void 0 : _e.betSize()) !== null && _f !== void 0 ? _f : 0);
        //If the big blind goes all-in, and there is 1 other player left, we still need to trigger the betting round
        if (playersWithChips.length > 1 || playersWithChips.length === 1 && bigBlindIsAllIn) {
            this._bettingRound = new betting_round_1.default(__spreadArray([], this._players, true), this._players.map(function (player) { return !!player; }), firstAction, this._forcedBets.blinds.big, this.blinds(), this._roundOfBetting, bigBlindIsAllIn ? biggestBet : this._forcedBets.blinds.big);
        }
        this._handInProgress = true;
    };
    Dealer.prototype.actionTaken = function (action, bet) {
        (0, assert_1.default)(this.bettingRoundInProgress(), 'Betting round must be in progress');
        (0, assert_1.default)(this.legalActions().contains(action, bet), 'Action must be legal');
        (0, assert_1.default)(this._bettingRound !== null);
        if (action & Action.CHECK || action & Action.CALL) {
            this._bettingRound.actionTaken(betting_round_1.Action.MATCH);
        }
        else if (action & Action.BET || action & Action.RAISE) {
            this._bettingRound.actionTaken(betting_round_1.Action.RAISE, bet);
        }
        else {
            (0, assert_1.default)(action & Action.FOLD);
            var foldingPlayer = this._players[this.playerToAct()];
            (0, assert_1.default)(foldingPlayer !== null);
            this._potManager.betFolded(foldingPlayer.betSize());
            foldingPlayer.takeFromBet(foldingPlayer.betSize());
            this._players[this.playerToAct()] = null;
            this._potManager.removePlayerFromPots(this.playerToAct());
            this._bettingRound.actionTaken(betting_round_1.Action.LEAVE);
        }
    };
    Dealer.prototype.endBettingRound = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        (0, assert_1.default)(!this._bettingRoundsCompleted, 'Betting rounds must not be completed');
        (0, assert_1.default)(!this.bettingRoundInProgress(), 'Betting round must not be in progress');
        this._potManager.collectBetsFrom(this._players);
        if (((_b = (_a = this._bettingRound) === null || _a === void 0 ? void 0 : _a.numActivePlayers()) !== null && _b !== void 0 ? _b : 0) <= 1) {
            this._roundOfBetting = community_cards_1.RoundOfBetting.RIVER;
            // If there is only one pot, and there is only one player in it...
            if ((this._potManager.pots().length <= 1 ||
                this._potManager.pots()[1].size() === 0) &&
                this._potManager.pots()[0].eligiblePlayers().length === 1) {
                var uncalledChips = ((_d = (_c = this._bettingRound) === null || _c === void 0 ? void 0 : _c.biggestBet()) !== null && _d !== void 0 ? _d : 0) - ((_f = (_e = this._bettingRound) === null || _e === void 0 ? void 0 : _e.biggestCall()) !== null && _f !== void 0 ? _f : 0);
                this._potManager.pots()[0].setUncalledChips(uncalledChips);
                // ...there is no need to deal the undealt community cards.
            }
            else {
                this.dealCommunityCards();
            }
            this._bettingRoundsCompleted = true;
            // Now you call showdown()
        }
        else if (this._roundOfBetting < community_cards_1.RoundOfBetting.RIVER) {
            // Start the next betting round.
            this._roundOfBetting = (0, community_cards_1.next)(this._roundOfBetting);
            this._players = (_h = (_g = this._bettingRound) === null || _g === void 0 ? void 0 : _g.players()) !== null && _h !== void 0 ? _h : [];
            var nonFoldedPlayers = (_k = (_j = this._bettingRound) === null || _j === void 0 ? void 0 : _j.nonFoldedPlayers()) !== null && _k !== void 0 ? _k : [];
            this._bettingRound = new betting_round_1.default(__spreadArray([], this._players, true), nonFoldedPlayers, this.nextOrWrap(this._button), this._forcedBets.blinds.big, this.blinds(), this._roundOfBetting);
            this.dealCommunityCards();
            (0, assert_1.default)(this._bettingRoundsCompleted === false);
        }
        else {
            (0, assert_1.default)(this._roundOfBetting === community_cards_1.RoundOfBetting.RIVER);
            this._bettingRoundsCompleted = true;
            // Now you call showdown()
        }
    };
    Dealer.prototype.standUp = function (seat) {
        var _a;
        this._players[seat] = null;
        (_a = this._bettingRound) === null || _a === void 0 ? void 0 : _a.standUp(seat);
    };
    Dealer.prototype.isRaiseValid = function (bet) {
        var _a, _b;
        return (_b = (_a = this._bettingRound) === null || _a === void 0 ? void 0 : _a.isRaiseValid(bet)) !== null && _b !== void 0 ? _b : false;
    };
    Dealer.prototype.winners = function () {
        (0, assert_1.default)(!this.handInProgress(), 'Hand must not be in progress');
        return this._winners;
    };
    Dealer.prototype.showdown = function () {
        var _this = this;
        (0, assert_1.default)(this._roundOfBetting === community_cards_1.RoundOfBetting.RIVER, 'Round of betting must be river');
        (0, assert_1.default)(!this.bettingRoundInProgress(), 'Betting round must not be in progress');
        (0, assert_1.default)(this.bettingRoundsCompleted(), 'Betting rounds must be completed');
        this._handInProgress = false;
        if ((this._potManager.pots().length <= 1 ||
            this._potManager.pots()[1].size() === 0) &&
            this._potManager.pots()[0].eligiblePlayers().length === 1) {
            // No need to evaluate the hand. There is only one player.
            var index = this._potManager.pots()[0].eligiblePlayers()[0];
            var player = this._players[index];
            (0, assert_1.default)(player !== null);
            var pot = this._potManager.pots()[0];
            var chipsToRakeForPot = 0;
            if (!this._rakeEnabled) {
            }
            else if (this._communityCards.cards().length < 3) {
            }
            else {
                var chipsRemainingBeforeRakeCap = this._rakeSettings.maxRake;
                var winnerSeat = pot.eligiblePlayers()[0];
                var winner = this._players[winnerSeat];
                var winnerTotalWager = winner === null || winner === void 0 ? void 0 : winner.betSize();
                var potentialRake = Math.floor(this._rakeSettings.rakePercentage * (pot.size() - pot.uncalledChips()) / 100.0);
                chipsToRakeForPot = Math.min(potentialRake, chipsRemainingBeforeRakeCap);
            }
            player.addToStack(this._potManager.pots()[0].size() - chipsToRakeForPot);
            pot.setTotalRake(chipsToRakeForPot);
            pot.addToIndividualRake(chipsToRakeForPot, index);
            return this._players;
            // TODO: Also, no reveals in this case. Reveals are only necessary when there is >=2 players.
        }
        var totalChipsRaked = 0;
        var _loop_1 = function (pot) {
            var playerResults = pot
                .eligiblePlayers()
                .map(function (seatIndex) {
                return [
                    seatIndex,
                    hand_1.default.create(_this._holeCards[seatIndex], _this._communityCards),
                ];
            });
            playerResults.sort(function (_a, _b) {
                var first = _a[1];
                var second = _b[1];
                return hand_1.default.compare(first, second);
            });
            var lastWinnerIndex = (0, array_1.findIndexAdjacent)(playerResults, function (_a, _b) {
                var first = _a[1];
                var second = _b[1];
                return hand_1.default.compare(first, second) !== 0;
            });
            var numberOfWinners = lastWinnerIndex === -1 ? 1 : lastWinnerIndex + 1;
            var potElligibleForRake = false;
            var chipsToRakeForPot = 0;
            if (!this_1._rakeEnabled) {
                potElligibleForRake = false;
            }
            else if (pot.eligiblePlayers().length === 1) {
                potElligibleForRake = false;
            }
            else if (totalChipsRaked > this_1._rakeSettings.maxRake) {
                potElligibleForRake = false;
            }
            else if (this_1._communityCards.cards().length < 3) {
                potElligibleForRake = false;
            }
            else if (totalChipsRaked < this_1._rakeSettings.maxRake) {
                var chipsRemainingBeforeRakeCap = this_1._rakeSettings.maxRake - totalChipsRaked;
                var potentialRake = Math.floor(this_1._rakeSettings.rakePercentage * pot.size() / 100.0);
                chipsToRakeForPot = Math.min(potentialRake, chipsRemainingBeforeRakeCap);
            }
            var oddChips = (pot.size() - chipsToRakeForPot) % numberOfWinners;
            totalChipsRaked += chipsToRakeForPot;
            pot.setTotalRake(chipsToRakeForPot);
            var payout = ((pot.size() - oddChips - chipsToRakeForPot) / numberOfWinners);
            var winningPlayerResults = playerResults.slice(0, numberOfWinners);
            var rakeRemainderChips = chipsToRakeForPot % numberOfWinners;
            var rakePerPlayer = (totalChipsRaked - rakeRemainderChips) / numberOfWinners;
            winningPlayerResults.forEach(function (playerResult) {
                var _a;
                var seatIndex = playerResult[0];
                if (!_this._players[seatIndex]) {
                    // make sure players who went all-in and won a pot are still rewarded
                    _this._players[seatIndex] = new player_1.default(payout);
                }
                else {
                    (_a = _this._players[seatIndex]) === null || _a === void 0 ? void 0 : _a.addToStack(payout);
                }
                pot.addToIndividualRake(rakePerPlayer, seatIndex);
                //TODO this._players[seatIndex]?.chipsRaked = Math.floor(chipsToRakeForPot / numberOfWinners) ; 
            });
            this_1._winners.push(winningPlayerResults.map(function (playerResult) {
                var seatIndex = playerResult[0];
                var holeCards = _this._holeCards[seatIndex];
                return __spreadArray(__spreadArray([], playerResult, true), [holeCards], false);
            }));
            if (oddChips !== 0) {
                // Distribute the odd chips to the first players, counting clockwise, after the dealer button
                var winners_1 = new Array(this_1._players.length).fill(null);
                winningPlayerResults.forEach(function (playerResult) {
                    var seatIndex = playerResult[0];
                    winners_1[seatIndex] = _this._players[seatIndex];
                });
                var seat = this_1._button;
                while (oddChips !== 0) {
                    seat = (0, array_1.nextOrWrap)(winners_1, seat);
                    var winner = winners_1[seat];
                    (0, assert_1.default)(winner !== null);
                    winner.addToStack(1);
                    oddChips--;
                }
            }
            // Distribute raked amounts remaining chips
            if (rakeRemainderChips !== 0) {
                // Distribute the odd chips to the first players, counting clockwise, after the dealer button
                var winners_2 = new Array(this_1._players.length).fill(null);
                winningPlayerResults.forEach(function (playerResult) {
                    var seatIndex = playerResult[0];
                    winners_2[seatIndex] = _this._players[seatIndex];
                });
                var seat = this_1._button;
                while (rakeRemainderChips !== 0) {
                    seat = (0, array_1.nextOrWrap)(winners_2, seat);
                    var winner = winners_2[seat];
                    (0, assert_1.default)(winner !== null);
                    pot.addToIndividualRake(1, seat);
                    rakeRemainderChips--;
                }
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = this._potManager.pots(); _i < _a.length; _i++) {
            var pot = _a[_i];
            _loop_1(pot);
        }
        return this._players;
    };
    Dealer.prototype.nextOrWrap = function (seat) {
        return (0, array_1.nextOrWrap)(this._players, seat);
    };
    Dealer.prototype.collectAnte = function () {
        if (this._forcedBets.ante === undefined) {
            return;
        }
        // Any ante goes into the pot
        var total = 0;
        for (var _i = 0, _a = this._players; _i < _a.length; _i++) {
            var player = _a[_i];
            if (player !== null) {
                var ante = Math.min(this._forcedBets.ante, player.totalChips());
                player.takeFromStack(ante);
                total += ante;
            }
        }
        this._potManager.pots()[0].add(total);
    };
    Dealer.prototype.postBlinds = function () {
        var seat = this._button;
        var numPlayers = this._players.filter(function (player) { return player !== null; }).length;
        if (numPlayers !== 2) {
            seat = this.nextOrWrap(seat);
        }
        var smallBlind = this._players[seat];
        (0, assert_1.default)(smallBlind !== null);
        this._smallBlindIndex = seat;
        smallBlind.bet(Math.min(this._forcedBets.blinds.small, smallBlind.totalChips()));
        seat = this.nextOrWrap(seat);
        var bigBlind = this._players[seat];
        (0, assert_1.default)(bigBlind !== null);
        this._bigBlindIndex = seat;
        bigBlind.bet(Math.min(this._forcedBets.blinds.big, bigBlind.totalChips()));
        return seat;
    };
    Dealer.prototype.dealHoleCards = function () {
        var _this = this;
        this._players.forEach(function (player, index) {
            if (player !== null) {
                _this._holeCards[index] = [_this._deck.draw(), _this._deck.draw()];
            }
        });
    };
    // Deals community cards up until the current round of betting.
    Dealer.prototype.dealCommunityCards = function () {
        var cards = [];
        var numCardsToDeal = this._roundOfBetting - this._communityCards.cards().length;
        for (var index = 0; index < numCardsToDeal; index++) {
            cards.push(this._deck.draw());
        }
        this._communityCards.deal(cards);
    };
    return Dealer;
}());
exports.default = Dealer;
//# sourceMappingURL=dealer.js.map